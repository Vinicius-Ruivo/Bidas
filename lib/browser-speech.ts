/** Utilitários para Web Speech API (entrada e saída de voz). Chrome/Edge têm melhor suporte. */

export const BIDAS_TTS_VOICE_STORAGE_KEY = "bidas-tts-voice-uri";
/** `"gemini"` = TTS pela API Gemini (natural). `"browser"` = síntese do sistema. */
export const BIDAS_TTS_ENGINE_STORAGE_KEY = "bidas-tts-engine";
export const BIDAS_GEMINI_VOICE_STORAGE_KEY = "bidas-gemini-voice";

let activeGeminiAudio: HTMLAudioElement | null = null;

type RecognitionCtor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: Event) => void) | null;
  onerror: ((ev: Event) => void) | null;
  onend: (() => void) | null;
};

export function getSpeechRecognitionConstructor(): RecognitionCtor | null {
  if (typeof globalThis === "undefined") return null;
  const g = globalThis as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return g.SpeechRecognition ?? g.webkitSpeechRecognition ?? null;
}

export function stopSpeaking(): void {
  if (typeof window === "undefined") return;
  window.speechSynthesis.cancel();
  if (activeGeminiAudio) {
    activeGeminiAudio.pause();
    activeGeminiAudio.src = "";
    activeGeminiAudio.load();
    activeGeminiAudio = null;
  }
}

/**
 * TTS neural do Gemini (mesma família de vozes do app Google / AI Studio).
 * Consome cota da GEMINI_API_KEY no servidor.
 */
export async function playGeminiTts(text: string, voiceName: string, signal?: AbortSignal): Promise<void> {
  if (typeof window === "undefined") return;
  const trimmed = text.trim();
  if (!trimmed) return;

  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  stopSpeaking();

  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: trimmed, voiceName }),
    signal,
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? `TTS (${res.status})`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio();
  activeGeminiAudio = audio;
  audio.src = url;

  await new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      URL.revokeObjectURL(url);
      if (activeGeminiAudio === audio) activeGeminiAudio = null;
    };

    const onAbort = () => {
      audio.pause();
      signal?.removeEventListener("abort", onAbort);
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort);

    audio.onended = () => {
      signal?.removeEventListener("abort", onAbort);
      cleanup();
      resolve();
    };
    audio.onerror = () => {
      signal?.removeEventListener("abort", onAbort);
      cleanup();
      reject(new Error("Não foi possível reproduzir o áudio."));
    };
    void audio.play().catch((e) => {
      signal?.removeEventListener("abort", onAbort);
      cleanup();
      reject(e instanceof Error ? e : new Error("Reprodução bloqueada pelo navegador."));
    });
  });
}

function pickPtVoice(): SpeechSynthesisVoice | null {
  const list = window.speechSynthesis.getVoices();
  return (
    list.find((v) => v.lang.toLowerCase().startsWith("pt")) ??
    list.find((v) => v.lang.toLowerCase().includes("pt")) ??
    null
  );
}

function resolveVoice(preferredURI: string): SpeechSynthesisVoice | null {
  const list = window.speechSynthesis.getVoices();
  if (preferredURI) {
    const chosen = list.find((v) => v.voiceURI === preferredURI);
    if (chosen) return chosen;
  }
  return pickPtVoice();
}

/** Lista vozes para o seletor: português primeiro, depois demais. */
export function listSpeechVoicesForSelect(): { voiceURI: string; name: string; lang: string; local: boolean }[] {
  if (typeof window === "undefined") return [];
  const raw = window.speechSynthesis.getVoices();
  return [...raw]
    .sort((a, b) => {
      const apt = a.lang.toLowerCase().startsWith("pt") ? 0 : 1;
      const bpt = b.lang.toLowerCase().startsWith("pt") ? 0 : 1;
      if (apt !== bpt) return apt - bpt;
      if (a.localService !== b.localService) return a.localService ? -1 : 1;
      return a.name.localeCompare(b.name, "pt-BR");
    })
    .map((v) => ({
      voiceURI: v.voiceURI,
      name: v.name,
      lang: v.lang,
      local: v.localService,
    }));
}

/**
 * Lê texto em voz alta.
 * @param preferredVoiceURI `""` = automático (melhor voz em português disponível).
 */
export function speakPortuguese(text: string, preferredVoiceURI = ""): void {
  if (typeof window === "undefined") return;
  const trimmed = text.trim();
  if (!trimmed) return;

  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(trimmed);
  utterance.rate = 0.95;

  const applyVoiceAndSpeak = () => {
    const v = resolveVoice(preferredVoiceURI);
    if (v) {
      utterance.voice = v;
      utterance.lang = v.lang || "pt-BR";
    } else {
      utterance.lang = "pt-BR";
    }
    synth.speak(utterance);
  };

  if (synth.getVoices().length > 0) {
    applyVoiceAndSpeak();
  } else {
    const onVoices = () => {
      synth.removeEventListener("voiceschanged", onVoices);
      applyVoiceAndSpeak();
    };
    synth.addEventListener("voiceschanged", onVoices);
  }
}

/** Como `speakPortuguese`, mas retorna Promise e respeita `AbortSignal` (interrupção / barge-in). */
export function speakPortugueseAsync(text: string, preferredVoiceURI = "", signal?: AbortSignal): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  if (signal?.aborted) {
    return Promise.reject(new DOMException("Aborted", "AbortError"));
  }

  const trimmed = text.trim();
  if (!trimmed) return Promise.resolve();

  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(trimmed);
  utterance.rate = 0.95;

  return new Promise((resolve, reject) => {
    const onAbort = () => {
      synth.cancel();
      signal?.removeEventListener("abort", onAbort);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort);

    utterance.onend = () => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    };
    utterance.onerror = () => {
      signal?.removeEventListener("abort", onAbort);
      reject(new Error("Falha na síntese de voz."));
    };

    const applyVoiceAndSpeak = () => {
      const v = resolveVoice(preferredVoiceURI);
      if (v) {
        utterance.voice = v;
        utterance.lang = v.lang || "pt-BR";
      } else {
        utterance.lang = "pt-BR";
      }
      synth.speak(utterance);
    };

    if (synth.getVoices().length > 0) {
      applyVoiceAndSpeak();
    } else {
      const onVoices = () => {
        synth.removeEventListener("voiceschanged", onVoices);
        applyVoiceAndSpeak();
      };
      synth.addEventListener("voiceschanged", onVoices);
    }
  });
}
