"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

import { BidasHeader } from "@/components/bidas/bidas-header";
import {
  CAREER_LEVELS,
  getCareerProgress,
  getCurrentLevel,
  getLevelProgress,
  isLevelLocked,
  type CareerProgress,
} from "@/lib/career-plan";
import { cn } from "@/lib/utils";

export function PlanoCarreiraScreen() {
  const [progress, setProgress] = useState<CareerProgress>({ xp: 250, missionsCompleted: 2 });

  useEffect(() => {
    setProgress(getCareerProgress());
  }, []);

  const current = getCurrentLevel(progress);
  const currentProgress = getLevelProgress(progress, current);

  return (
    <div className="space-y-5 pb-24">
      <BidasHeader action={<span className="text-sm font-bold text-emerald-400">{progress.xp} XP</span>} />

      <div>
        <h2 className="font-display text-4xl font-bold leading-none text-white">Plano Carreira</h2>
        <p className="mt-2 text-sm text-zinc-500">Sua trajetória como anestesista veterinário</p>
      </div>

      <section className="rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-4">
        <p className="text-[10px] font-bold tracking-[0.22em] text-emerald-500/80">NÍVEL ATUAL</p>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-4xl">{current.medal}</span>
          <div>
            <p className={cn("text-2xl font-bold", current.colorClass)}>{current.name}</p>
            <p className="text-sm text-zinc-400">{current.subtitle}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-emerald-300">
            <span>Progresso</span>
            <span>
              {currentProgress.current}/{currentProgress.total} XP
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all"
              style={{ width: `${currentProgress.percent}%` }}
            />
          </div>
        </div>
      </section>

      <div>
        <p className="mb-3 text-[10px] font-bold tracking-[0.22em] text-zinc-500">TRILHA COMPLETA</p>
        <div className="space-y-3">
          {CAREER_LEVELS.map((level) => {
            const locked = isLevelLocked(level, progress);
            const isCurrent = level.id === current.id;
            const levelProgress = getLevelProgress(progress, level);
            const missions =
              level.id === "bronze"
                ? progress.missionsCompleted
                : level.id === "prata" && progress.xp >= 1000
                  ? 0
                  : 0;

            return (
              <section
                key={level.id}
                className={cn(
                  "rounded-2xl border p-4",
                  isCurrent ? "border-emerald-500/30 bg-zinc-950/80" : "border-zinc-800 bg-zinc-950/40",
                  locked && "opacity-70",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{level.medal}</span>
                    <div>
                      <p className={cn("text-lg font-bold", level.colorClass)}>{level.name}</p>
                      <p className="text-sm text-zinc-500">{level.subtitle}</p>
                    </div>
                  </div>
                  {isCurrent ? (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-bold text-emerald-400">
                      ATUAL
                    </span>
                  ) : locked ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-1 text-[10px] font-bold text-zinc-400">
                      <Lock className="h-3 w-3" />
                      BLOQUEADO
                    </span>
                  ) : null}
                </div>

                {!locked ? (
                  <p className="mt-3 text-xs text-zinc-500">
                    {levelProgress.current}/{levelProgress.total} XP · {missions}/{level.missionsTotal} missões
                  </p>
                ) : null}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
