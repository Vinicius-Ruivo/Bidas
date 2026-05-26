export type AtendimentoStatus = "ativo" | "encerrado";

export type AtendimentoRecord = {
  id: string;
  pacienteId?: string;
  nome: string;
  especie: string;
  raca: string;
  pesoKg: number;
  tutorNome: string;
  sexo?: string;
  idadeAnos?: number;
  asa: "I" | "II" | "III" | "IV" | "V";
  status: AtendimentoStatus;
  intercorrencia?: string;
  vitals: {
    pa: string;
    spo2: string;
    fc: string;
    temp: string;
  };
  preAnestesico: {
    exames: string;
    obsClinicas: string;
  };
  protocolo: {
    medicacoes: string;
    tecnica: string;
  };
  encerramento: {
    recuperacao: string;
    recomendacoes: string;
  };
  createdAt: string;
};

const STORAGE_KEY = "BIDAS_ATENDIMENTOS_V1";

export const DEMO_ATENDIMENTO: AtendimentoRecord = {
  id: "demo-thor",
  nome: "Thor",
  especie: "Canino",
  raca: "Golden Retriever",
  pesoKg: 28,
  sexo: "Macho",
  idadeAnos: 3,
  tutorNome: "Carlos Mendes",
  asa: "II",
  status: "ativo",
  intercorrencia: "Hipotensão leve no T30, corrigida com fluidoterapia",
  vitals: {
    pa: "110/70",
    spo2: "98%",
    fc: "72 bpm",
    temp: "37.8°C",
  },
  preAnestesico: {
    exames: "Hemograma e bioquímica dentro da normalidade",
    obsClinicas: "Sopro grau II/VI",
  },
  protocolo: {
    medicacoes: "MPA: Acepromazina 0,03 mg/kg + Metadona 0,3 mg/kg IM",
    tecnica: "TIVA com propofol + isoflurano manutenção",
  },
  encerramento: {
    recuperacao: "Extubado aos 8 min, recuperação tranquila",
    recomendacoes: "Tramadol 2 mg/kg TID por 3 dias",
  },
  createdAt: new Date().toISOString(),
};

function readStore(): AtendimentoRecord[] {
  if (typeof window === "undefined") return [DEMO_ATENDIMENTO];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [DEMO_ATENDIMENTO];
    const parsed = JSON.parse(raw) as AtendimentoRecord[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEMO_ATENDIMENTO];
  } catch {
    return [DEMO_ATENDIMENTO];
  }
}

function writeStore(records: AtendimentoRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function listAtendimentos(): AtendimentoRecord[] {
  return readStore().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getAtendimento(id: string): AtendimentoRecord | null {
  return readStore().find((item) => item.id === id) ?? null;
}

export function saveAtendimento(record: AtendimentoRecord) {
  const current = readStore().filter((item) => item.id !== record.id);
  writeStore([record, ...current]);
}

export function createAtendimento(
  payload: Omit<AtendimentoRecord, "id" | "createdAt" | "status" | "vitals" | "preAnestesico" | "protocolo" | "encerramento"> &
    Partial<Pick<AtendimentoRecord, "vitals" | "preAnestesico" | "protocolo" | "encerramento" | "intercorrencia">>,
): AtendimentoRecord {
  const record: AtendimentoRecord = {
    id: crypto.randomUUID(),
    status: "ativo",
    vitals: payload.vitals ?? { pa: "—", spo2: "—", fc: "—", temp: "—" },
    preAnestesico: payload.preAnestesico ?? { exames: "", obsClinicas: "" },
    protocolo: payload.protocolo ?? { medicacoes: "", tecnica: "" },
    encerramento: payload.encerramento ?? { recuperacao: "", recomendacoes: "" },
    createdAt: new Date().toISOString(),
    ...payload,
  };
  saveAtendimento(record);
  return record;
}
