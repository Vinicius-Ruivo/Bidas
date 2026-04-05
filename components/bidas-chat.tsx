"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AudioLines, Loader2, MessageCircle, Mic, MicOff, SendHorizonal, Volume2, VolumeX } from "lucide-react";

import type { PacienteRow } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { GEMINI_TTS_VOICE_OPTIONS, isAllowedGeminiTtsVoice } from "@/config/gemini-tts-voices";
import {
  BIDAS_GEMINI_VOICE_STORAGE_KEY,
  BIDAS_TTS_ENGINE_STORAGE_KEY,
  BIDAS_TTS_VOICE_STORAGE_KEY,
  getSpeechRecognitionConstructor,
  listSpeechVoicesForSelect,
  playGeminiTts,
  speakPortugueseAsync,
  stopSpeaking,
} from "@/lib/browser-speech";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/locale-context";

type ChatRole = "user" | "assistant";
type TtsEngine = "gemini" | "browser";

export type ChatTurn = { role: ChatRole; content: string };

type BidasChatProps = {
  activePatient: PacienteRow | null;
};

type VoicePhase = "listening" | "thinking" | "speaking";

function buildPatientContext(p: PacienteRow | null): string | undefined {
  if (!p) return undefined;
  const parts = [
    `Nome: ${p.nome}`,
    `Espécie: ${p.especie}`,
    `Peso: ${p.peso_kg} kg`,
    p.raca ? `Raça: ${p.raca}` : null,
    p.idade_anos != null ? `Idade: ${p.idade_anos} anos` : null,
    p.historico_clinico ? `Histórico: ${p.historico_clinico}` : null,
  ].filter(Boolean);
  return parts.join("\n");
}

function parseRecognitionEvent(event: Event): { newFinal: string; interim: string } {
  const ev = event as unknown as { resultIndex: number; results: SpeechRecognitionResultList };
  let newFinal = "";
  let interim = "";
  for (let i = ev.resultIndex; i < ev.results.length; i++) {
    const row = ev.results[i];
    const piece = row[0]?.transcript ?? "";
    if (row.isFinal) newFinal += piece;
    else interim += piece;
  }
  return { newFinal, interim };
}

/** Pausa curta após a fala antes de enviar (menos = mais ágil, mais = menos cortes no meio da frase). */
const UTTERANCE_DEBOUNCE_MS = 480;
const BARGE_IN_INTERIM_CHARS = 4;
const MIN_TTS_SENTENCE_CHARS = 18;

/**
 * Primeira frase completa a partir de `fromIndex` (termina em . ! ? … seguido de espaço ou fim).
 * Evita cortar em "a." / "Dr." quando o trecho ainda é curto.
 */
function nextCompleteSentence(
  text: string,
  fromIndex: number,
  minLength = MIN_TTS_SENTENCE_CHARS,
): { sentence: string; endExclusive: number } | null {
  const s = text.slice(fromIndex);
  if (s.length < minLength) return null;
  for (let i = minLength - 1; i < s.length; i++) {
    const c = s[i];
    if (c !== "." && c !== "!" && c !== "?" && c !== "…") continue;
    const after = s[i + 1];
    if (after !== undefined && !/\s/.test(after)) continue;
    const raw = s.slice(0, i + 1).trim();
    if (raw.length < minLength) continue;
    let j = i + 1;
    while (j < s.length && /\s/.test(s[j])) j++;
    return { sentence: raw, endExclusive: fromIndex + j };
  }
  return null;
}

export function BidasChat({ activePatient }: BidasChatProps) {
  const { t, speechLang } = useI18n();
  const tRef = useRef(t);
  tRef.current = t;

  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [speechInSupported, setSpeechInSupported] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(true);
  const [ttsVoiceURI, setTtsVoiceURI] = useState("");
  const [ttsVoices, setTtsVoices] = useState<ReturnType<typeof listSpeechVoicesForSelect>>([]);
  const [ttsEngine, setTtsEngine] = useState<TtsEngine>("gemini");
  const [geminiVoice, setGeminiVoice] = useState("Kore");
  const [voiceConversationMode, setVoiceConversationMode] = useState(false);
  const [ttsPlaybackActive, setTtsPlaybackActive] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<{ stop: () => void; abort: () => void } | null>(null);
  const listenBaseRef = useRef("");
  const listenFinalRef = useRef("");

  const turnsRef = useRef(turns);
  const activePatientRef = useRef(activePatient);
  const speakRepliesRef = useRef(speakReplies);
  const ttsEngineRef = useRef(ttsEngine);
  const geminiVoiceRef = useRef(geminiVoice);
  const ttsVoiceURIRef = useRef(ttsVoiceURI);
  const voiceConversationModeRef = useRef(voiceConversationMode);
  const voicePhaseRef = useRef<VoicePhase>("listening");
  const processingVoiceTurnRef = useRef(false);
  const chatAbortVoiceRef = useRef<AbortController | null>(null);
  const ttsAbortVoiceRef = useRef<AbortController | null>(null);
  const continuousRecRef = useRef<{ start: () => void; stop: () => void; abort: () => void } | null>(null);
  const voiceFinalBufferRef = useRef("");
  const voiceDebounceTimerRef = useRef<number | null>(null);
  const processVoiceUtteranceRef = useRef<(text: string) => Promise<void>>(async () => {});
  /** Evita que o microfone ouça o alto-falante durante TTS (eco → falso “barge-in”). */
  const suspendRecognitionForPlaybackRef = useRef(false);

  useEffect(() => {
    turnsRef.current = turns;
  }, [turns]);
  useEffect(() => {
    activePatientRef.current = activePatient;
  }, [activePatient]);
  useEffect(() => {
    speakRepliesRef.current = speakReplies;
  }, [speakReplies]);
  useEffect(() => {
    ttsEngineRef.current = ttsEngine;
  }, [ttsEngine]);
  useEffect(() => {
    geminiVoiceRef.current = geminiVoice;
  }, [geminiVoice]);
  useEffect(() => {
    ttsVoiceURIRef.current = ttsVoiceURI;
  }, [ttsVoiceURI]);
  useEffect(() => {
    voiceConversationModeRef.current = voiceConversationMode;
  }, [voiceConversationMode]);

  useEffect(() => {
    setSpeechInSupported(!!getSpeechRecognitionConstructor());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(BIDAS_TTS_VOICE_STORAGE_KEY);
      if (saved !== null) setTtsVoiceURI(saved);
      const eng = localStorage.getItem(BIDAS_TTS_ENGINE_STORAGE_KEY);
      if (eng === "browser" || eng === "gemini") setTtsEngine(eng);
      const gv = localStorage.getItem(BIDAS_GEMINI_VOICE_STORAGE_KEY);
      if (gv && isAllowedGeminiTtsVoice(gv)) setGeminiVoice(gv);
    } catch {
      /* modo privado */
    }

    const loadVoices = () => setTtsVoices(listSpeechVoicesForSelect());
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      continuousRecRef.current?.abort();
      continuousRecRef.current = null;
      chatAbortVoiceRef.current?.abort();
      ttsAbortVoiceRef.current?.abort();
      if (voiceDebounceTimerRef.current) clearTimeout(voiceDebounceTimerRef.current);
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, loading]);

  const pauseContinuousRecognitionForPlayback = useCallback(() => {
    suspendRecognitionForPlaybackRef.current = true;
    if (voiceDebounceTimerRef.current) {
      clearTimeout(voiceDebounceTimerRef.current);
      voiceDebounceTimerRef.current = null;
    }
    voiceFinalBufferRef.current = "";
    continuousRecRef.current?.stop();
  }, []);

  const resumeContinuousRecognitionAfterPlayback = useCallback(() => {
    suspendRecognitionForPlaybackRef.current = false;
    window.setTimeout(() => {
      if (!voiceConversationModeRef.current || !continuousRecRef.current) return;
      try {
        continuousRecRef.current.start();
      } catch {
        /* já ativo ou sessão inválida */
      }
    }, 240);
  }, []);

  const interruptTtsPlayback = useCallback(() => {
    chatAbortVoiceRef.current?.abort();
    ttsAbortVoiceRef.current?.abort();
    stopSpeaking();
    setTtsPlaybackActive(false);
    resumeContinuousRecognitionAfterPlayback();
  }, [resumeContinuousRecognitionAfterPlayback]);

  const playReplyAloud = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;
      setVoiceError(null);
      const voiceConv = voiceConversationModeRef.current;
      if (voiceConv) {
        pauseContinuousRecognitionForPlayback();
        setTtsPlaybackActive(true);
      }
      try {
        if (ttsEngine === "gemini") {
          await playGeminiTts(trimmed, geminiVoice);
        } else {
          await speakPortugueseAsync(trimmed, ttsVoiceURI);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : t("chat.errorVoice");
        if (e instanceof Error && e.name === "AbortError") {
          return;
        }
        setVoiceError(msg);
        if (ttsEngine === "gemini") {
          try {
            await speakPortugueseAsync(trimmed, ttsVoiceURI);
          } catch {
            /* ignore */
          }
        }
      } finally {
        if (voiceConv) {
          setTtsPlaybackActive(false);
          resumeContinuousRecognitionAfterPlayback();
        }
      }
    },
    [geminiVoice, pauseContinuousRecognitionForPlayback, resumeContinuousRecognitionAfterPlayback, t, ttsEngine, ttsVoiceURI],
  );

  useLayoutEffect(() => {
    processVoiceUtteranceRef.current = async (userText: string) => {
      const trimmed = userText.trim();
      if (!trimmed || processingVoiceTurnRef.current) return;
      processingVoiceTurnRef.current = true;
      voicePhaseRef.current = "thinking";
      setVoiceError(null);

      const history = [...turnsRef.current, { role: "user" as const, content: trimmed }];
      setInput("");
      setTurns([...history, { role: "assistant", content: "" }]);
      setLoading(true);
      setError(null);

      const ac = new AbortController();
      chatAbortVoiceRef.current = ac;

      let accumulated = "";
      let ttsCharIndex = 0;
      let streamingTtsStarted = false;
      let ttsDrainChain: Promise<void> = Promise.resolve();
      let streamTtsAc: AbortController | null = null;

      const ensureStreamTtsStarted = () => {
        if (streamingTtsStarted) return;
        streamingTtsStarted = true;
        voicePhaseRef.current = "speaking";
        pauseContinuousRecognitionForPlayback();
        setTtsPlaybackActive(true);
        streamTtsAc = new AbortController();
        ttsAbortVoiceRef.current = streamTtsAc;
      };

      const flushSpeakableSentences = async () => {
        while (speakRepliesRef.current) {
          const next = nextCompleteSentence(accumulated, ttsCharIndex);
          if (!next) break;
          ttsCharIndex = next.endExclusive;
          ensureStreamTtsStarted();
          const sig = streamTtsAc!.signal;
          try {
            if (ttsEngineRef.current === "gemini") {
              await playGeminiTts(next.sentence, geminiVoiceRef.current, sig);
            } else {
              await speakPortugueseAsync(next.sentence, ttsVoiceURIRef.current, sig);
            }
          } catch (e) {
            if (e instanceof Error && e.name === "AbortError") throw e;
            if (e instanceof DOMException && e.name === "AbortError") throw e;
            const msg = e instanceof Error ? e.message : tRef.current("chat.errorVoice");
            setVoiceError(msg);
            try {
              await speakPortugueseAsync(next.sentence, ttsVoiceURIRef.current, sig);
            } catch {
              /* ignore */
            }
          }
        }
      };

      const scheduleSentenceTtsDrain = () => {
        if (!speakRepliesRef.current) return;
        ttsDrainChain = ttsDrainChain
          .then(() => flushSpeakableSentences())
          .catch((e) => {
            if (e instanceof Error && e.name === "AbortError") return;
            if (e instanceof DOMException && e.name === "AbortError") return;
          });
      };

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            context: buildPatientContext(activePatientRef.current),
          }),
          signal: ac.signal,
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(
            data?.error ?? tRef.current("chat.errorResponse", { status: String(res.status) }),
          );
        }

        if (!res.body) throw new Error(tRef.current("chat.errorNoBody"));

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          if (ac.signal.aborted) throw new DOMException("Aborted", "AbortError");
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setTurns((prev) => {
            if (prev.length === 0) return prev;
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === "assistant") {
              next[next.length - 1] = { role: "assistant", content: accumulated };
            }
            return next;
          });
          scheduleSentenceTtsDrain();
        }

        await ttsDrainChain.catch(() => {});

        const tail = accumulated.slice(ttsCharIndex).trim();
        if (speakRepliesRef.current && tail) {
          ensureStreamTtsStarted();
          try {
            if (ttsEngineRef.current === "gemini") {
              await playGeminiTts(tail, geminiVoiceRef.current, streamTtsAc!.signal);
            } else {
              await speakPortugueseAsync(tail, ttsVoiceURIRef.current, streamTtsAc!.signal);
            }
          } catch (e) {
            if (e instanceof Error && e.name === "AbortError") {
              /* interrupção */
            } else if (e instanceof DOMException && e.name === "AbortError") {
              /* interrupção */
            } else {
              const msg = e instanceof Error ? e.message : tRef.current("chat.errorVoice");
              setVoiceError(msg);
              try {
                await speakPortugueseAsync(tail, ttsVoiceURIRef.current, streamTtsAc!.signal);
              } catch {
                /* ignore */
              }
            }
          }
        }
      } catch (e) {
        ttsAbortVoiceRef.current?.abort();
        stopSpeaking();
        void ttsDrainChain.catch(() => {});
        if (e instanceof Error && e.name === "AbortError") {
          setTurns((prev) => {
            if (prev.length >= 1 && prev[prev.length - 1]?.role === "assistant") {
              return prev.slice(0, -1);
            }
            return prev;
          });
        } else {
          const msg = e instanceof Error ? e.message : tRef.current("chat.errorChat");
          setError(msg);
          setTurns((prev) => (prev.length >= 2 ? prev.slice(0, -2) : prev));
        }
      } finally {
        chatAbortVoiceRef.current = null;
        ttsAbortVoiceRef.current = null;
        if (streamingTtsStarted) {
          setTtsPlaybackActive(false);
          resumeContinuousRecognitionAfterPlayback();
        }
        processingVoiceTurnRef.current = false;
        voicePhaseRef.current = "listening";
        setLoading(false);
      }
    };
  }, [pauseContinuousRecognitionForPlayback, resumeContinuousRecognitionAfterPlayback]);

  const clearVoiceDebounce = useCallback(() => {
    if (voiceDebounceTimerRef.current) {
      clearTimeout(voiceDebounceTimerRef.current);
      voiceDebounceTimerRef.current = null;
    }
  }, []);

  const scheduleVoiceCommit = useCallback(() => {
    clearVoiceDebounce();
    voiceDebounceTimerRef.current = window.setTimeout(() => {
      voiceDebounceTimerRef.current = null;
      const t = voiceFinalBufferRef.current.trim();
      voiceFinalBufferRef.current = "";
      if (
        !t ||
        voicePhaseRef.current !== "listening" ||
        processingVoiceTurnRef.current ||
        !voiceConversationModeRef.current
      ) {
        return;
      }
      void processVoiceUtteranceRef.current(t);
    }, UTTERANCE_DEBOUNCE_MS);
  }, [clearVoiceDebounce]);

  useEffect(() => {
    if (!voiceConversationMode || !speechInSupported) {
      continuousRecRef.current?.abort();
      continuousRecRef.current = null;
      clearVoiceDebounce();
      voiceFinalBufferRef.current = "";
      voicePhaseRef.current = "listening";
      if (!voiceConversationMode) {
        setListening(false);
      }
      return;
    }

    const Ctor = getSpeechRecognitionConstructor();
    if (!Ctor) return;

    setSpeakReplies(true);
    stopSpeaking();
    recognitionRef.current?.abort();
    recognitionRef.current = null;

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = speechLang;

    rec.onresult = (event: Event) => {
      const { newFinal, interim } = parseRecognitionEvent(event);
      const phase = voicePhaseRef.current;
      const compactInterim = interim.replace(/\s/g, "").length;
      const bargeIn = newFinal.length > 0 || compactInterim >= BARGE_IN_INTERIM_CHARS;

      /* Durante TTS o microfone está parado — não há fase "speaking" com áudio no reconhecedor. */
      if (phase === "thinking" && bargeIn) {
        stopSpeaking();
        chatAbortVoiceRef.current?.abort();
        ttsAbortVoiceRef.current?.abort();
        voicePhaseRef.current = "listening";
        voiceFinalBufferRef.current += newFinal;
        setInput(voiceFinalBufferRef.current + interim);
        clearVoiceDebounce();
        if (voiceFinalBufferRef.current.trim()) {
          scheduleVoiceCommit();
        }
        return;
      }

      if (phase === "listening") {
        voiceFinalBufferRef.current += newFinal;
        setInput(voiceFinalBufferRef.current + interim);
        scheduleVoiceCommit();
      }
    };

    rec.onerror = (event: Event) => {
      const ev = event as unknown as { error: string };
      if (ev.error === "aborted" || ev.error === "no-speech") return;
      const map: Record<string, string> = {
        "not-allowed": tRef.current("chat.voice.notAllowedShort"),
        "audio-capture": tRef.current("chat.voice.audioCaptureShort"),
        network: tRef.current("chat.voice.networkShort"),
      };
      setVoiceError(map[ev.error] ?? tRef.current("chat.voice.fallback", { code: ev.error }));
    };

    rec.onend = () => {
      if (!voiceConversationModeRef.current || continuousRecRef.current !== rec) return;
      if (suspendRecognitionForPlaybackRef.current) return;
      try {
        rec.start();
      } catch {
        /* ignore */
      }
    };

    continuousRecRef.current = rec;
    recognitionRef.current = rec;
    setVoiceError(null);
    setListening(true);

    try {
      rec.start();
    } catch {
      continuousRecRef.current = null;
      recognitionRef.current = null;
      setListening(false);
      setVoiceError(tRef.current("chat.micStartFail"));
    }

    return () => {
      clearVoiceDebounce();
      voiceFinalBufferRef.current = "";
      rec.abort();
      if (continuousRecRef.current === rec) continuousRecRef.current = null;
      if (recognitionRef.current === rec) recognitionRef.current = null;
      chatAbortVoiceRef.current?.abort();
      ttsAbortVoiceRef.current?.abort();
      stopSpeaking();
      setListening(false);
      voicePhaseRef.current = "listening";
      processingVoiceTurnRef.current = false;
    };
  }, [voiceConversationMode, speechInSupported, speechLang, clearVoiceDebounce, scheduleVoiceCommit]);

  const toggleListening = useCallback(() => {
    if (voiceConversationMode) return;

    const Ctor = getSpeechRecognitionConstructor();
    if (!Ctor) return;

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    stopSpeaking();
    listenBaseRef.current = input;
    listenFinalRef.current = "";

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = speechLang;

    rec.onresult = (event: Event) => {
      const ev = event as unknown as { resultIndex: number; results: SpeechRecognitionResultList };
      let interim = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const row = ev.results[i];
        const piece = row[0]?.transcript ?? "";
        if (row.isFinal) listenFinalRef.current += piece;
        else interim += piece;
      }
      setInput(listenBaseRef.current + listenFinalRef.current + interim);
    };

    rec.onerror = (event: Event) => {
      const ev = event as unknown as { error: string };
      if (ev.error === "aborted" || ev.error === "no-speech") return;
      const map: Record<string, string> = {
        "not-allowed": tRef.current("chat.voice.notAllowed"),
        "audio-capture": tRef.current("chat.voice.audioCapture"),
        network: tRef.current("chat.voice.network"),
      };
      setVoiceError(map[ev.error] ?? tRef.current("chat.voice.fallback", { code: ev.error }));
    };

    rec.onend = () => {
      recognitionRef.current = null;
      setListening(false);
    };

    recognitionRef.current = rec;
    setVoiceError(null);

    try {
      rec.start();
      setListening(true);
    } catch {
      recognitionRef.current = null;
      setVoiceError(tRef.current("chat.micStartFail"));
      setListening(false);
    }
  }, [input, listening, speechLang, voiceConversationMode]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    stopSpeaking();
    chatAbortVoiceRef.current?.abort();
    ttsAbortVoiceRef.current?.abort();
    if (listening && recognitionRef.current && !voiceConversationMode) {
      recognitionRef.current.stop();
    }

    const history = [...turns, { role: "user" as const, content: text }];
    setInput("");
    setError(null);
    setTurns([...history, { role: "assistant", content: "" }]);
    setLoading(true);

    const rollback = () => {
      setInput(text);
      setTurns((prev) => (prev.length >= 2 ? prev.slice(0, -2) : prev));
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          context: buildPatientContext(activePatient),
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? t("chat.errorResponse", { status: String(res.status) }));
      }

      if (!res.body) throw new Error(t("chat.errorNoBody"));

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setTurns((prev) => {
          if (prev.length === 0) return prev;
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "assistant") {
            next[next.length - 1] = { role: "assistant", content: accumulated };
          }
          return next;
        });
      }

      if (speakReplies && accumulated.trim()) {
        await playReplyAloud(accumulated);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("chat.errorChat");
      setError(msg);
      rollback();
    } finally {
      setLoading(false);
    }
  }, [activePatient, input, listening, loading, playReplyAloud, speakReplies, t, turns, voiceConversationMode]);

  const toggleVoiceConversation = useCallback(() => {
    setVoiceConversationMode((prev) => {
      const next = !prev;
      if (next) {
        setVoiceError(null);
        setSpeakReplies(true);
      } else {
        stopSpeaking();
        chatAbortVoiceRef.current?.abort();
        ttsAbortVoiceRef.current?.abort();
        clearVoiceDebounce();
        voiceFinalBufferRef.current = "";
      }
      return next;
    });
  }, [clearVoiceDebounce]);

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <MessageCircle className="h-6 w-6 text-emerald-400" />
          {t("chat.title")}
        </CardTitle>
        <CardDescription>
          {t("chat.description.before")}
          <strong>{t("chat.description.strong")}</strong>
          {t("chat.description.after")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {activePatient ? (
          <p className="rounded-md border border-emerald-500/25 bg-emerald-500/5 px-3 py-2 text-xs text-zinc-300">
            {t("chat.contextOn")}{" "}
            <strong className="text-emerald-200">{activePatient.nome}</strong> ({activePatient.especie}, {activePatient.peso_kg}{" "}
            kg).
          </p>
        ) : (
          <p className="text-xs text-zinc-500">{t("chat.contextOff")}</p>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={voiceConversationMode ? "default" : "outline"}
              size="sm"
              onClick={() => toggleVoiceConversation()}
              disabled={!speechInSupported || loading}
              className={
                voiceConversationMode
                  ? "border-emerald-400/40 bg-emerald-600 text-white hover:bg-emerald-500"
                  : undefined
              }
              aria-pressed={voiceConversationMode}
            >
              <AudioLines className="h-4 w-4" />
              <span className="ml-2">
                {voiceConversationMode ? t("chat.voiceModeActive") : t("chat.voiceMode")}
              </span>
            </Button>
            {voiceConversationMode ? (
              <span className="text-xs text-emerald-300/90">{t("chat.voiceModeBanner")}</span>
            ) : null}
            {voiceConversationMode && ttsPlaybackActive ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-amber-500/40 text-amber-200 hover:bg-amber-500/10"
                onClick={() => interruptTtsPlayback()}
                title={t("chat.interruptSpeechTitle")}
              >
                <VolumeX className="h-4 w-4" />
                <span className="ml-2">{t("chat.interruptSpeech")}</span>
              </Button>
            ) : null}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={speakReplies}
              onChange={(e) => {
                setSpeakReplies(e.target.checked);
                if (!e.target.checked) stopSpeaking();
              }}
              disabled={voiceConversationMode}
              className="h-3.5 w-3.5 rounded border-border accent-emerald-500 disabled:opacity-50"
            />
            {t("chat.speakReplies")}
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="bidas-tts-engine" className="text-xs font-normal text-zinc-400">
                {t("chat.ttsEngine")}
              </Label>
              <Select
                id="bidas-tts-engine"
                value={ttsEngine}
                onChange={(e) => {
                  const v = e.target.value as TtsEngine;
                  setTtsEngine(v);
                  try {
                    localStorage.setItem(BIDAS_TTS_ENGINE_STORAGE_KEY, v);
                  } catch {
                    /* ignore */
                  }
                }}
                aria-label={t("chat.ttsEngineAria")}
              >
                <option value="gemini">{t("chat.ttsGemini")}</option>
                <option value="browser">{t("chat.ttsBrowser")}</option>
              </Select>
            </div>

            {ttsEngine === "gemini" ? (
              <div className="flex flex-col gap-1">
                <Label htmlFor="bidas-gemini-voice" className="text-xs font-normal text-zinc-400">
                  {t("chat.geminiVoice")}
                </Label>
                <Select
                  id="bidas-gemini-voice"
                  value={geminiVoice}
                  onChange={(e) => {
                    const v = e.target.value;
                    setGeminiVoice(v);
                    try {
                      localStorage.setItem(BIDAS_GEMINI_VOICE_STORAGE_KEY, v);
                    } catch {
                      /* ignore */
                    }
                  }}
                  aria-label={t("chat.geminiVoiceAria")}
                >
                  {GEMINI_TTS_VOICE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
                <p className="text-[10px] leading-snug text-zinc-600">{t("chat.geminiHelp")}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <Label htmlFor="bidas-tts-voice" className="text-xs font-normal text-zinc-400">
                  {t("chat.browserVoice")}
                </Label>
                <Select
                  id="bidas-tts-voice"
                  value={ttsVoiceURI}
                  onChange={(e) => {
                    const v = e.target.value;
                    setTtsVoiceURI(v);
                    try {
                      if (v) localStorage.setItem(BIDAS_TTS_VOICE_STORAGE_KEY, v);
                      else localStorage.removeItem(BIDAS_TTS_VOICE_STORAGE_KEY);
                    } catch {
                      /* ignore */
                    }
                  }}
                  aria-label={t("chat.browserVoiceAria")}
                >
                  <option value="">{t("chat.browserDefault")}</option>
                  {ttsVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang}){v.local ? t("chat.browserLocal") : ""}
                    </option>
                  ))}
                </Select>
                <p className="text-[10px] leading-snug text-zinc-600">{t("chat.browserHelp")}</p>
              </div>
            )}
          </div>
        </div>

        <div className="max-h-[min(420px,50vh)] min-h-[220px] space-y-3 overflow-y-auto rounded-md border border-border bg-zinc-950/80 p-3">
          {turns.length === 0 ? <p className="text-sm text-zinc-500">{t("chat.emptyHint")}</p> : null}
          {turns.map((turn, i) => (
            <div
              key={`${i}-${turn.role}`}
              className={
                turn.role === "user"
                  ? "ml-6 rounded-lg border border-zinc-700 bg-zinc-900/90 px-3 py-2 text-sm text-zinc-100"
                  : "mr-6 rounded-lg border border-emerald-900/40 bg-emerald-950/20 px-3 py-2 text-sm text-zinc-200 whitespace-pre-wrap"
              }
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  {turn.role === "user" ? t("chat.you") : t("chat.bidas")}
                </span>
                {turn.role === "assistant" && turn.content.trim() ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-zinc-400 hover:text-emerald-300"
                    aria-label={t("chat.listenThis")}
                    onClick={() => void playReplyAloud(turn.content)}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
              {turn.content || (turn.role === "assistant" && loading ? "…" : "")}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {voiceError ? <p className="text-sm text-amber-400">{voiceError}</p> : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              voiceConversationMode
                ? t("chat.placeholderVoice")
                : listening
                  ? t("chat.placeholderListening")
                  : t("chat.placeholderType")
            }
            disabled={loading && !voiceConversationMode}
            className="min-h-20 flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant={listening && !voiceConversationMode ? "critical" : "outline"}
              onClick={() => toggleListening()}
              disabled={loading || !speechInSupported || voiceConversationMode}
              aria-pressed={listening && !voiceConversationMode}
              title={
                voiceConversationMode
                  ? t("chat.titleVoiceMode")
                  : speechInSupported
                    ? listening
                      ? t("chat.titleMicListen")
                      : t("chat.titleMicSpeak")
                    : t("chat.titleMicUnsupported")
              }
              className="min-w-[44px] sm:min-w-0"
            >
              {listening && !voiceConversationMode ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              <span className="ml-2 hidden sm:inline">
                {voiceConversationMode ? "—" : listening ? t("chat.btnStop") : t("chat.btnSpeak")}
              </span>
            </Button>
            <Button
              type="button"
              onClick={() => void send()}
              disabled={loading || !input.trim() || voiceConversationMode}
              className="min-w-0 flex-1 sm:flex-initial"
              title={voiceConversationMode ? t("chat.titleSendAuto") : undefined}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">{t("chat.generating")}</span>
                </>
              ) : (
                <>
                  <SendHorizonal className="h-4 w-4" />
                  <span className="ml-2">{t("chat.send")}</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {speechInSupported ? (
          <p className="rounded-md border border-amber-500/20 bg-amber-500/5 px-2.5 py-2 text-[11px] leading-snug text-amber-100/90">
            <strong className="text-amber-200">{t("chat.micStrong")}</strong> {t("chat.micNoteBefore")}
            <code className="text-emerald-200/90">http://localhost:3000</code>
            {t("chat.micNoteAfter")}
          </p>
        ) : (
          <p className="text-[11px] text-zinc-600">{t("chat.unsupportedBrowser")}</p>
        )}
      </CardContent>
    </Card>
  );
}
