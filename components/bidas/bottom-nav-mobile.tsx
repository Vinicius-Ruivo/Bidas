"use client";

import { Home, PawPrint, Pill, User, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";

export type MobileNavTab = "inicio" | "doses" | "ferramentas" | "pacientes" | "perfil";

type BottomNavMobileProps = {
  active: MobileNavTab;
  onChange: (tab: MobileNavTab) => void;
};

const TABS: Array<{ id: MobileNavTab; label: string; Icon: typeof Home }> = [
  { id: "inicio", label: "Início", Icon: Home },
  { id: "doses", label: "Doses", Icon: Pill },
  { id: "ferramentas", label: "Ferramentas", Icon: Wrench },
  { id: "pacientes", label: "Pacientes", Icon: PawPrint },
  { id: "perfil", label: "Perfil", Icon: User },
];

export function BottomNavMobile({ active, onChange }: BottomNavMobileProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800/90 bg-[#0b0f1a]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className="flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-1"
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-cyan-400" : "text-slate-500")} />
              <span className={cn("text-[10px] font-medium", isActive ? "text-cyan-400" : "text-slate-500")}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
