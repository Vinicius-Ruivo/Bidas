"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, BarChart3, CheckCircle2, FlaskConical, Syringe } from "lucide-react";

import { BidasHeader } from "@/components/bidas/bidas-header";
import type { AtendimentoRecord } from "@/lib/atendimentos-store";

type AtendimentoDetailScreenProps = {
  record: AtendimentoRecord;
  onBack: () => void;
};

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-emerald-500/15 bg-zinc-950/80 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
        <button
          type="button"
          className="rounded-lg border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400"
        >
          Editar
        </button>
      </div>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold tracking-[0.2em] text-emerald-500/80">{label}</p>
      <p className="text-sm leading-relaxed text-zinc-300">{value || "—"}</p>
    </div>
  );
}

export function AtendimentoDetailScreen({ record, onBack }: AtendimentoDetailScreenProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onBack} className="text-sm text-emerald-400">
          ← Voltar
        </button>
      </div>

      <BidasHeader />

      <div>
        <h2 className="font-display text-3xl font-bold text-white">{record.nome}</h2>
        <p className="mt-1 text-sm text-zinc-400">
          {record.especie} · {record.raca} · {record.pesoKg}kg
        </p>
        <p className="text-sm text-zinc-500">Tutor: {record.tutorNome}</p>
      </div>

      <section className="rounded-2xl border border-emerald-500/15 bg-zinc-950/80 p-4">
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-emerald-400" />
          <h3 className="font-semibold text-white">Parâmetros intraoperatórios</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "PA", value: record.vitals.pa },
            { label: "SpO₂", value: record.vitals.spo2 },
            { label: "FC", value: record.vitals.fc },
            { label: "TEMP", value: record.vitals.temp },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-zinc-800 bg-black/40 p-3">
              <p className="text-[10px] font-bold tracking-wider text-zinc-500">{item.label}</p>
              <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {record.intercorrencia ? (
        <section className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-amber-300">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-xs font-bold tracking-[0.2em]">INTERCORRÊNCIAS</p>
          </div>
          <p className="text-sm text-amber-200">{record.intercorrencia}</p>
        </section>
      ) : null}

      <SectionCard icon={<FlaskConical className="h-4 w-4 text-violet-400" />} title="Pré-anestésico">
        <div className="space-y-3">
          <Field label="EXAMES" value={record.preAnestesico.exames} />
          <Field label="OBS. CLÍNICAS" value={record.preAnestesico.obsClinicas} />
        </div>
      </SectionCard>

      <SectionCard icon={<Syringe className="h-4 w-4 text-sky-400" />} title="Protocolo">
        <div className="space-y-3">
          <Field label="MEDICAÇÕES" value={record.protocolo.medicacoes} />
          <Field label="TÉCNICA" value={record.protocolo.tecnica} />
        </div>
      </SectionCard>

      <SectionCard icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} title="Encerramento">
        <div className="space-y-3">
          <Field label="RECUPERAÇÃO" value={record.encerramento.recuperacao} />
          <Field label="RECOMENDAÇÕES" value={record.encerramento.recomendacoes} />
        </div>
      </SectionCard>
    </div>
  );
}
