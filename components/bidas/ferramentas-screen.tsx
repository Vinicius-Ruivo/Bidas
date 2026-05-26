"use client";

import {
  Activity,
  ChevronRight,
  ClipboardList,
  FileText,
  HeartPulse,
  Layers3,
  ScanHeart,
} from "lucide-react";

const TOOLS = [
  { id: "01", title: "Calculadora de Doses", icon: Layers3, color: "text-violet-300" },
  { id: "02", title: "Gerador de Protocolo", icon: FileText, color: "text-amber-300" },
  { id: "03", title: "Checklist Pré-Anestésico", icon: ClipboardList, color: "text-sky-300" },
  { id: "04", title: "Monitor Intraoperatório", icon: Activity, color: "text-cyan-300" },
  { id: "05", title: "Ficha de Anestesia", icon: HeartPulse, color: "text-emerald-300" },
  { id: "06", title: "Leitor de ECG", icon: ScanHeart, color: "text-rose-300" },
] as const;

type FerramentasScreenProps = {
  onSelectModule: (moduleId: string) => void;
};

export function FerramentasScreen({ onSelectModule }: FerramentasScreenProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Ferramentas</h2>
        <p className="mt-1 text-sm text-slate-500">Módulos clínicos do VetAnest.IA</p>
      </div>
      <div className="space-y-2">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => onSelectModule(tool.id)}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/50 px-4 py-3.5 text-left"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800/80">
              <tool.icon className={`h-5 w-5 ${tool.color}`} />
            </div>
            <span className="flex-1 font-semibold text-white">{tool.title}</span>
            <ChevronRight className="h-5 w-5 text-slate-600" />
          </button>
        ))}
      </div>
    </div>
  );
}
