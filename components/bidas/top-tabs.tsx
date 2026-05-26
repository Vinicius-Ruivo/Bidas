"use client";

import { cn } from "@/lib/utils";

export type TopTab = "atendimento" | "estudo";

type TopTabsProps = {
  active: TopTab;
  onChange: (tab: TopTab) => void;
};

export function TopTabs({ active, onChange }: TopTabsProps) {
  return (
    <div className="mb-5 flex border-b border-slate-800/80">
      {(
        [
          { id: "atendimento" as const, label: "Atendimento" },
          { id: "estudo" as const, label: "Estudo / Dúvidas" },
        ] as const
      ).map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative flex-1 pb-3 text-sm font-semibold transition",
            active === tab.id ? "text-cyan-400" : "text-slate-500",
          )}
        >
          {tab.label}
          {active === tab.id ? (
            <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-cyan-400" />
          ) : null}
        </button>
      ))}
    </div>
  );
}
