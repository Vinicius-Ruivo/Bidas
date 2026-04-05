import { GoogleGenerativeAI, type GenerateContentStreamResult } from "@google/generative-ai";

import { BIDAS_CHAT_SYSTEM_PROMPT } from "@/config/chat-system";

export const maxDuration = 60;

type ChatMessage = { role: "user" | "assistant"; content: string };

function sanitizeMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw)) return null;
  const out: ChatMessage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: string }).role;
    const content = (item as { content?: string }).content;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string") continue;
    const trimmed = content.trim();
    if (!trimmed) continue;
    if (trimmed.length > 12000) return null;
    out.push({ role, content: trimmed });
    if (out.length > 24) break;
  }
  return out.length > 0 ? out : null;
}

function toGeminiHistory(prior: ChatMessage[]) {
  return prior.map((m) => ({
    role: m.role === "user" ? ("user" as const) : ("model" as const),
    parts: [{ text: m.content }],
  }));
}

/** Modelos estáveis atuais (1.5 foi descontinuado na API). Sem GEMINI_CHAT_MODEL, tentamos nesta ordem. */
const DEFAULT_GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest"] as const;

function isModelNotFoundError(err: unknown): boolean {
  const raw = err instanceof Error ? err.message : String(err);
  const lower = raw.toLowerCase();
  return lower.includes("not found") || raw.includes("404") || lower.includes("is not found for api version");
}

/** Extrai texto do chunk sem depender só de .text() (que pode lançar se o candidato foi bloqueado). */
function safeChunkText(chunk: {
  text?: () => string;
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}): string {
  try {
    if (typeof chunk.text === "function") {
      const t = chunk.text();
      if (t) return t;
    }
  } catch {
    /* candidato vazio / bloqueio */
  }
  const parts = chunk.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts.map((p) => p.text ?? "").join("");
}

function geminiFailureResponse(err: unknown): Response {
  const raw = err instanceof Error ? err.message : String(err);
  const lower = raw.toLowerCase();

  const is429 =
    raw.includes("429") || lower.includes("too many requests") || lower.includes("quota") || lower.includes("resource_exhausted");
  const is401 = raw.includes("401") || lower.includes("api key invalid") || lower.includes("invalid api key");

  let error: string;
  if (is429) {
    error =
      "Limite de uso da API Gemini atingido (cota gratuita esgotada ou muitas requisições). Aguarde cerca de um minuto, " +
      "confira o painel em Google AI Studio ou tente GEMINI_CHAT_MODEL=gemini-2.5-flash-lite no .env.local — depois reinicie o npm run dev.";
  } else if (is401) {
    error = "Chave GEMINI_API_KEY inválida ou recusada. Verifique no Google AI Studio.";
  } else if (lower.includes("not found") || lower.includes("404")) {
    error =
      "Modelo não encontrado para esta chave. No .env.local defina GEMINI_CHAT_MODEL com um ID válido do Google AI Studio " +
      "(ex.: gemini-2.5-flash, gemini-2.5-flash-lite ou gemini-flash-latest) e reinicie o servidor.";
  } else {
    error = `Falha ao falar com o Gemini: ${raw.length > 400 ? `${raw.slice(0, 400)}…` : raw}`;
  }

  return Response.json({ error }, { status: is429 ? 429 : is401 ? 401 : 502 });
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey?.trim()) {
    return Response.json(
      { error: "Configure GEMINI_API_KEY no servidor (.env.local) para o chat funcionar." },
      { status: 503 },
    );
  }

  let body: { messages?: unknown; context?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const messages = sanitizeMessages(body.messages);
  if (!messages) {
    return Response.json({ error: "Envie uma lista messages com role user|assistant e content." }, { status: 400 });
  }

  const last = messages[messages.length - 1];
  if (last.role !== "user") {
    return Response.json({ error: "A última mensagem deve ser do usuário." }, { status: 400 });
  }

  let contextSuffix = "";
  if (typeof body.context === "string") {
    const c = body.context.trim();
    if (c.length > 0 && c.length <= 4000) {
      contextSuffix = `\n\nContexto do aplicativo (paciente selecionado no momento):\n${c}`;
    }
  }

  const prior = messages.slice(0, -1);
  for (let i = 0; i < prior.length; i++) {
    const want: ChatMessage["role"] = i % 2 === 0 ? "user" : "assistant";
    if (prior[i].role !== want) {
      return Response.json({ error: "Histórico inválido: ordem user/assistant." }, { status: 400 });
    }
  }

  const envModel = process.env.GEMINI_CHAT_MODEL?.trim();
  const modelCandidates = envModel ? [envModel] : [...DEFAULT_GEMINI_MODELS];

  const genAI = new GoogleGenerativeAI(apiKey.trim());
  const systemInstruction = `${BIDAS_CHAT_SYSTEM_PROMPT}${contextSuffix}`;
  const history = toGeminiHistory(prior);

  let streamResult: GenerateContentStreamResult | undefined;
  let lastError: unknown;

  for (let i = 0; i < modelCandidates.length; i++) {
    const modelName = modelCandidates[i];
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction,
    });
    const chat = model.startChat({ history });

    try {
      streamResult = await chat.sendMessageStream(last.content);
      lastError = undefined;
      break;
    } catch (err) {
      lastError = err;
      const canTryNext = !envModel && i < modelCandidates.length - 1 && isModelNotFoundError(err);
      if (!canTryNext) {
        return geminiFailureResponse(err);
      }
    }
  }

  if (lastError !== undefined || streamResult === undefined) {
    return geminiFailureResponse(lastError ?? new Error("Nenhum modelo Gemini disponível."));
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamResult.stream) {
          const text = safeChunkText(chunk);
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        controller.enqueue(encoder.encode(`\n\n[Erro ao receber resposta: ${msg}]`));
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
