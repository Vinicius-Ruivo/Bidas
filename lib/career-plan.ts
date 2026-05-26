export type CareerLevelId = "bronze" | "prata" | "ouro";

export type CareerLevel = {
  id: CareerLevelId;
  name: string;
  subtitle: string;
  xpRequired: number;
  missionsTotal: number;
  medal: string;
  colorClass: string;
};

export const CAREER_LEVELS: CareerLevel[] = [
  {
    id: "bronze",
    name: "Bronze",
    subtitle: "Ano 0 — Formação",
    xpRequired: 1000,
    missionsTotal: 6,
    medal: "🥉",
    colorClass: "text-amber-400",
  },
  {
    id: "prata",
    name: "Prata",
    subtitle: "Ano 1 — Entrar no Caos",
    xpRequired: 2000,
    missionsTotal: 5,
    medal: "🥈",
    colorClass: "text-slate-300",
  },
  {
    id: "ouro",
    name: "Ouro",
    subtitle: "Anos 2-3 — Virando Referência",
    xpRequired: 3000,
    missionsTotal: 4,
    medal: "🥇",
    colorClass: "text-yellow-300",
  },
];

export type CareerProgress = {
  xp: number;
  missionsCompleted: number;
};

const STORAGE_KEY = "BIDAS_CAREER_PROGRESS_V1";

const DEFAULT_PROGRESS: CareerProgress = { xp: 250, missionsCompleted: 2 };

export function getCareerProgress(): CareerProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as CareerProgress;
    if (typeof parsed.xp !== "number") return DEFAULT_PROGRESS;
    return parsed;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function getCurrentLevel(progress: CareerProgress) {
  if (progress.xp >= 3000) return CAREER_LEVELS[2];
  if (progress.xp >= 1000) return CAREER_LEVELS[1];
  return CAREER_LEVELS[0];
}

export function getLevelProgress(progress: CareerProgress, level: CareerLevel) {
  const prevXp =
    level.id === "bronze" ? 0 : level.id === "prata" ? CAREER_LEVELS[0].xpRequired : CAREER_LEVELS[1].xpRequired;
  const span = level.xpRequired;
  const current = Math.max(0, Math.min(span, progress.xp - prevXp));
  return { current, total: span, percent: Math.round((current / span) * 100) };
}

export function isLevelLocked(level: CareerLevel, progress: CareerProgress) {
  if (level.id === "bronze") return false;
  if (level.id === "prata") return progress.xp < CAREER_LEVELS[0].xpRequired;
  return progress.xp < CAREER_LEVELS[1].xpRequired;
}
