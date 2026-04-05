import type { PacienteInsert, PacienteRow } from "@/lib/database.types";
import { createSupabaseClient } from "@/services/supabase/client";

const LOCAL_STORAGE_KEY = "bidas.pacientes";

function getLocalPatients(): PacienteRow[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as PacienteRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setLocalPatients(patients: PacienteRow[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(patients));
}

function toPacienteRow(payload: PacienteInsert): PacienteRow {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    nome: payload.nome,
    especie: payload.especie,
    raca: payload.raca ?? null,
    peso_kg: payload.peso_kg,
    idade_anos: payload.idade_anos ?? null,
    tutor_nome: payload.tutor_nome ?? null,
    historico_clinico: payload.historico_clinico ?? null,
    created_at: now,
    updated_at: now,
  };
}

export type DataSource = "supabase" | "local";

export async function listPacientes(): Promise<{ data: PacienteRow[]; source: DataSource }> {
  const supabase = createSupabaseClient();

  if (!supabase) {
    return { data: getLocalPatients(), source: "local" };
  }

  const { data, error } = await supabase
    .from("pacientes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { data: getLocalPatients(), source: "local" };
  }

  return { data, source: "supabase" };
}

export async function createPaciente(
  payload: PacienteInsert,
): Promise<{ data: PacienteRow; source: DataSource }> {
  const supabase = createSupabaseClient();

  if (!supabase) {
    const localRow = toPacienteRow(payload);
    setLocalPatients([localRow, ...getLocalPatients()]);
    return { data: localRow, source: "local" };
  }

  const { data, error } = await supabase.from("pacientes").insert(payload).select().single();

  if (error || !data) {
    const localRow = toPacienteRow(payload);
    setLocalPatients([localRow, ...getLocalPatients()]);
    return { data: localRow, source: "local" };
  }

  return { data, source: "supabase" };
}
