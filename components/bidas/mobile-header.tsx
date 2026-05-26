"use client";

import { User } from "lucide-react";

export function MobileHeader() {
  return (
    <header className="flex items-center justify-between gap-3 pb-3">
      <div className="relative">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900 text-lg">
          🐾
        </div>
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0b0f1a] bg-emerald-400" />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-black text-white shadow-lg shadow-cyan-500/20">
          B
        </div>
        <span className="text-xl font-bold tracking-tight text-white">Bidas</span>
      </div>

      <button
        type="button"
        aria-label="Perfil"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900 text-slate-400"
      >
        <User className="h-5 w-5" />
      </button>
    </header>
  );
}
