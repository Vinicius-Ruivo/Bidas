"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ChevronRight,
  ClipboardList,
  Pill,
  Satellite,
  Zap,
} from "lucide-react";

import type { AtendimentoRecord } from "@/lib/atendimentos-store";
import { getAtendimento, listAtendimentos } from "@/lib/atendimentos-store";
import type { MobileNavTab } from "@/components/bidas/bottom-nav-mobile";
import { cn } from "@/lib/utils";

type SuggestedStep = {
  id: string;
  title: string;
  subtitle: string;
  suggested?: boolean;
  icon: React.ReactNode;
  nav: MobileNavTab;
};

type HomeAtendimentoScreenProps = {
  onNavigate: (tab: MobileNavTab) => void;
  onOpenPatient: (record: AtendimentoRecord) => void;
};

function statusLabel(status: AtendimentoRecord["status"]) {
  return status === "ativo" ? "Em atendimento" : "Encerrado";
}

export function HomeAtendimentoScreen({ onNavigate, onOpenPatient }: HomeAtendimentoScreenProps) {
  const [patient, setPatient] = useState<AtendimentoRecord | null>(null);

  useEffect(() => {
    const records = listAtendimentos();
    const active = records.find((r) => r.status === "ativo") ?? records[0] ?? null;
    setPatient(active ? getAtendimento(active.id) : null);
  }, []);

  const steps: SuggestedStep[] = [
    {
      id: "mpa",
      title: "Calcular MPA",
      subtitle: patient ? `Medicação pré-anestésica — ${patient.nome} ${patient.pesoKg} kg` : "Medicação pré-anestésica",
      suggested: true,
      icon: <Pill className="h-5 w-5 text-violet-300" />,
      nav: "doses",
    },
    {
      id: "checklist",
      title: "Checklist pré-anestésico",
      subtitle: "3 itens pendentes",
      icon: <ClipboardList className="h-5 w-5 text-sky-300" />,
      nav: "ferramentas",
    },
    {
      id: "protocolo",
      title: "Gerar protocolo anestésico",
      subtitle: "Baseado no perfil do paciente",
      icon: <Zap className="h-5 w-5 text-amber-300" />,
      nav: "ferramentas",
    },
    {
      id: "monitor",
      title: "Iniciar monitoramento",
      subtitle: "SpO₂ · FC · FR · ETCO₂",
      icon: <Satellite className="h-5 w-5 text-cyan-300" />,
      nav: "ferramentas",
    },
  ];

  if (!patient) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-center text-sm text-slate-400">
        Nenhum paciente em atendimento. Cadastre um em Pacientes.
      </div>
    );
  }

  const sexo = patient.sexo ?? "Macho";
  const idade = patient.idadeAnos ?? 3;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => onOpenPatient(patient)}
        className="w-full rounded-3xl border border-slate-700/60 bg-gradient-to-br from-slate-900/90 to-slate-950 p-4 text-left shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/30 to-cyan-600/20 text-3xl">
            🐕
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-2xl font-bold text-white">{patient.nome}</h2>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                  patient.status === "ativo"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-violet-500/15 text-violet-300",
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {statusLabel(patient.status)}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {patient.raca} · {sexo} · {idade} anos · {patient.pesoKg} kg
            </p>
          </div>
        </div>
      </button>

      <section>
        <p className="mb-3 text-[11px] font-bold tracking-[0.2em] text-slate-500">PRÓXIMAS ETAPAS SUGERIDAS</p>
        <div className="space-y-2.5">
          {steps.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => onNavigate(step.nav)}
              className="flex w-full items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/50 px-4 py-3.5 text-left transition active:scale-[0.99] hover:border-slate-700"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800/80">
                {step.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-white">{step.title}</span>
                  {step.suggested ? (
                    <span className="rounded-md bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-400">
                      SUGERIDO
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{step.subtitle}</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-slate-600" />
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={() => onNavigate("ferramentas")}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 py-3 text-sm font-medium text-cyan-300"
      >
        <Activity className="h-4 w-4" />
        Ver todas as ferramentas clínicas
      </button>
    </div>
  );
}
