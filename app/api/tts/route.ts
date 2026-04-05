import { GoogleGenAI, Modality } from "@google/genai";
import { Buffer } from "node:buffer";

import { isAllowedGeminiTtsVoice } from "@/config/gemini-tts-voices";
import { pcm16leMonoToWav } from "@/lib/pcm-to-wav";

export const maxDuration = 60;

const MAX_CHARS = 6000;

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey?.trim()) {
    return Response.json({ error: "Configure GEMINI_API_KEY para usar voz Gemini." }, { status: 503 });
  }

  let body: { text?: unknown; voiceName?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "JSON inválido." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return Response.json({ error: "Envie o campo text." }, { status: 400 });
  }
  if (text.length > MAX_CHARS) {
    return Response.json({ error: `Texto longo demais (máx. ${MAX_CHARS} caracteres).` }, { status: 400 });
  }

  const rawVoice = typeof body.voiceName === "string" ? body.voiceName.trim() : "";
  const voiceName = isAllowedGeminiTtsVoice(rawVoice) ? rawVoice : "Kore";

  const model = process.env.GEMINI_TTS_MODEL?.trim() || "gemini-2.5-flash-preview-tts";

  const prompt =
    "Read the following text aloud in clear Brazilian Portuguese (pt-BR), professional neutral tone, " +
    "exact wording without adding commentary or filler:\n\n" +
    text;

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const data = part?.inlineData?.data;
    if (!data || typeof data !== "string") {
      return Response.json({ error: "O modelo não retornou áudio. Tente outra voz ou verifique o modelo TTS no AI Studio." }, { status: 502 });
    }

    const pcm = Buffer.from(data, "base64");
    const wav = pcm16leMonoToWav(pcm);

    return new Response(new Uint8Array(wav), {
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const lower = msg.toLowerCase();
    const is429 = msg.includes("429") || lower.includes("quota") || lower.includes("resource_exhausted");
    const is404 = lower.includes("not found") || msg.includes("404");
    const userMsg = is429
      ? "Cota da API Gemini (TTS) esgotada. Aguarde ou verifique o plano no Google AI Studio."
      : is404
        ? "Modelo TTS não encontrado. Defina GEMINI_TTS_MODEL=gemini-2.5-flash-preview-tts no .env.local ou veja modelos disponíveis no AI Studio."
        : `TTS Gemini: ${msg.length > 280 ? `${msg.slice(0, 280)}…` : msg}`;
    return Response.json({ error: userMsg }, { status: is429 ? 429 : is404 ? 404 : 502 });
  }
}
