"use client";

import { useState } from "react";

import { AtendimentoDetailScreen } from "@/components/bidas/atendimento-detail-screen";
import { AtendimentosScreen } from "@/components/bidas/atendimentos-screen";
import { BottomNav, type AppTab } from "@/components/bidas/bottom-nav";
import { NewAtendimentoScreen } from "@/components/bidas/new-atendimento-screen";
import { PlanoCarreiraScreen } from "@/components/bidas/plano-carreira-screen";
import type { AtendimentoRecord } from "@/lib/atendimentos-store";

type Screen = "list" | "detail" | "new";

export function BidasApp() {
  const [tab, setTab] = useState<AppTab>("atendimentos");
  const [screen, setScreen] = useState<Screen>("list");
  const [selected, setSelected] = useState<AtendimentoRecord | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function openDetail(record: AtendimentoRecord) {
    setSelected(record);
    setScreen("detail");
  }

  function handleCreated() {
    setRefreshKey((value) => value + 1);
    setScreen("list");
    setTab("atendimentos");
  }

  return (
    <div className="min-h-dvh bg-black text-white">
      <div className="mx-auto min-h-dvh w-full max-w-lg px-4 py-5">
        {tab === "atendimentos" ? (
          screen === "list" ? (
            <AtendimentosScreen
              refreshKey={refreshKey}
              onOpen={openDetail}
              onNew={() => setScreen("new")}
            />
          ) : screen === "new" ? (
            <NewAtendimentoScreen onBack={() => setScreen("list")} onCreated={handleCreated} />
          ) : selected ? (
            <AtendimentoDetailScreen record={selected} onBack={() => setScreen("list")} />
          ) : null
        ) : (
          <PlanoCarreiraScreen />
        )}
      </div>

      <BottomNav
        active={tab}
        onChange={(next) => {
          setTab(next);
          if (next === "atendimentos") setScreen("list");
        }}
      />
    </div>
  );
}
