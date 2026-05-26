"use client";

type BidasHeaderProps = {
  action?: React.ReactNode;
};

export function BidasHeader({ action }: BidasHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-lg shadow-[0_0_24px_rgba(34,197,94,0.35)]">
          🐾
        </div>
        <div>
          <p className="font-display text-2xl font-bold leading-none tracking-wide text-white">Bidas</p>
          <p className="mt-0.5 text-[10px] font-semibold tracking-[0.28em] text-zinc-500">VETANEST.IA</p>
        </div>
      </div>
      {action}
    </header>
  );
}
