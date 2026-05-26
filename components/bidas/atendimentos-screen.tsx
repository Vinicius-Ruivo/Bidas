"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

import { BidasHeader } from "@/components/bidas/bidas-header";
import { listAtendimentos, type AtendimentoRecord } from "@/lib/atendimentos-store";
import { cn } from "@/lib/utils";

type AtendimentosScreenProps = {
  onOpen: (record: AtendimentoRecord) => void;
  onNew: () => void;
  refreshKey: number;
};

function statusLabel(status: AtendimentoRecord["status"]) {
  return status === "encerrado" ? "Encerrado" : "Ativo";
}

export function AtendimentosScreen({ onOpen, onNew, refreshKey }: AtendimentosScreenProps) {
  const [records, setRecords] = useState<AtendimentoRecord[]>([]);

  useEffect(() => {
    setRecords(listAtendimentos());
  }, [refreshKey]);

  return (
    <div className="space-y-5 pb-24">
      <BidasHeader
        action={
          <button
            type="button"
            onClick={onNew}
            className="rounded-xl border border-zinc-700 px-3 py-2 text-sm font-semibold text-emerald-400 transition hover:border-emerald-500/40 hover:bg-emerald-500/5"
          >
            + Novo
          </button>
        }
      />

      <div>
        <h2 className="font-display text-4xl font-bold leading-none text-white">Atendimentos</h2>
        <p className="mt-2 text-sm text-zinc-500">
          {records.length} registro{records.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="space-y-3">
        {records.map((record) => (
          <button
            key={record.id}
            type="button"
            onClick={() => onOpen(record)}
            className="w-full rounded-2xl border border-emerald-500/20 bg-zinc-950/70 p-4 text-left transition hover:border-emerald-500/40"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <p className="text-lg font-bold text-white">{record.nome}</p>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                  record.status === "encerrado"
                    ? "bg-violet-500/15 text-violet-300"
                    : "bg-emerald-500/15 text-emerald-300",
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {statusLabel(record.status)}
              </span>
            </div>

            <p className="text-sm text-zinc-400">
              {record.especie} · {record.raca} · {record.pesoKg}kg
            </p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-sm text-zinc-500">Tutor: {record.tutorNome}</p>
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400">
                ASA {record.asa}
              </span>
            </div>

            {record.intercorrencia ? (
              <div className="mt-3 rounded-xl border border-amber-500/35 bg-amber-500/5 px-3 py-2">
                <p className="flex items-start gap-2 text-xs text-amber-200">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {record.intercorrencia}
                </p>
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
