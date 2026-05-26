"use client";

import { GraduationCap, Stethoscope } from "lucide-react";

import { cn } from "@/lib/utils";

export type AppTab = "atendimentos" | "carreira";

type BottomNavProps = {
  active: AppTab;
  onChange: (tab: AppTab) => void;
};

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800/80 bg-black/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg">
        <button
          type="button"
          onClick={() => onChange("atendimentos")}
          className="flex flex-1 flex-col items-center gap-1 py-3"
        >
          <Stethoscope
            className={cn("h-5 w-5", active === "atendimentos" ? "text-emerald-400" : "text-zinc-500")}
          />
          <span
            className={cn(
              "text-[10px] font-bold tracking-[0.18em]",
              active === "atendimentos" ? "text-emerald-400" : "text-zinc-500",
            )}
          >
            ATENDIMENTOS
          </span>
          {active === "atendimentos" ? <span className="h-0.5 w-8 rounded-full bg-emerald-400" /> : null}
        </button>
        <button
          type="button"
          onClick={() => onChange("carreira")}
          className="flex flex-1 flex-col items-center gap-1 py-3"
        >
          <GraduationCap
            className={cn("h-5 w-5", active === "carreira" ? "text-emerald-400" : "text-zinc-500")}
          />
          <span
            className={cn(
              "text-[10px] font-bold tracking-[0.18em]",
              active === "carreira" ? "text-emerald-400" : "text-zinc-500",
            )}
          >
            PLANO CARREIRA
          </span>
          {active === "carreira" ? <span className="h-0.5 w-8 rounded-full bg-emerald-400" /> : null}
        </button>
      </div>
    </nav>
  );
}
