"use client";

import { useMemo, useState } from "react";

import { AtendimentoDetailScreen } from "@/components/bidas/atendimento-detail-screen";
import { AtendimentosScreen } from "@/components/bidas/atendimentos-screen";
import { BottomNavMobile, type MobileNavTab } from "@/components/bidas/bottom-nav-mobile";
import { FerramentasScreen } from "@/components/bidas/ferramentas-screen";
import { HomeAtendimentoScreen } from "@/components/bidas/home-atendimento-screen";
import { MobileHeader } from "@/components/bidas/mobile-header";
import { NewAtendimentoScreen } from "@/components/bidas/new-atendimento-screen";
import { PlanoCarreiraScreen } from "@/components/bidas/plano-carreira-screen";
import { TopTabs, type TopTab } from "@/components/bidas/top-tabs";
import { BidasChat } from "@/components/bidas-chat";
import { DoseCalculator } from "@/components/dose-calculator";
import { ModulesCenter } from "@/components/modules-center";
import type { AtendimentoRecord } from "@/lib/atendimentos-store";
import { getAtendimento, listAtendimentos } from "@/lib/atendimentos-store";
import type { PacienteRow } from "@/lib/database.types";

type PatientScreen = "list" | "detail" | "new";
type ModuleId = "01" | "02" | "03" | "04" | "05" | "06";

function atendimentoToPaciente(record: AtendimentoRecord): PacienteRow {
  return {
    id: record.pacienteId ?? record.id,
    nome: record.nome,
    especie: record.especie.toLowerCase(),
    raca: record.raca,
    peso_kg: record.pesoKg,
    idade_anos: record.idadeAnos ?? null,
    historico_clinico: record.preAnestesico.obsClinicas || null,
    tutor_nome: record.tutorNome,
    created_at: record.createdAt,
    updated_at: record.createdAt,
  };
}

export function BidasApp() {
  const [navTab, setNavTab] = useState<MobileNavTab>("inicio");
  const [topTab, setTopTab] = useState<TopTab>("atendimento");
  const [patientScreen, setPatientScreen] = useState<PatientScreen>("list");
  const [selected, setSelected] = useState<AtendimentoRecord | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null);

  const activePatient = useMemo(() => {
    const records = listAtendimentos();
    const current =
      selected ?? records.find((r) => r.status === "ativo") ?? records[0] ?? null;
    return current ? atendimentoToPaciente(getAtendimento(current.id) ?? current) : null;
  }, [selected, refreshKey, navTab]);

  function openDetail(record: AtendimentoRecord) {
    setSelected(record);
    setPatientScreen("detail");
    setNavTab("pacientes");
  }

  function handleCreated() {
    setRefreshKey((v) => v + 1);
    setPatientScreen("list");
    setNavTab("inicio");
    setTopTab("atendimento");
  }

  const showShellHeader = navTab !== "pacientes" || patientScreen === "list";

  return (
    <div className="mobile-app-shell min-h-dvh bg-[#0b0f1a] text-white">
      <div className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-28 pt-[max(0.75rem,env(safe-area-inset-top))]">
        {showShellHeader ? (
          <>
            <MobileHeader />
            {navTab === "inicio" ? <TopTabs active={topTab} onChange={setTopTab} /> : null}
          </>
        ) : null}

        {navTab === "inicio" && topTab === "atendimento" && activeModule === null ? (
          <HomeAtendimentoScreen
            onNavigate={(tab) => {
              setNavTab(tab);
              if (tab === "doses") setActiveModule("01");
              if (tab === "ferramentas") setActiveModule(null);
            }}
            onOpenPatient={openDetail}
          />
        ) : null}

        {navTab === "inicio" && topTab === "estudo" ? (
          <div className="-mx-1">
            <BidasChat activePatient={activePatient} />
          </div>
        ) : null}

        {navTab === "doses" ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Doses</h2>
            <DoseCalculator initialWeightKg={activePatient?.peso_kg ?? 0} />
          </div>
        ) : null}

        {navTab === "ferramentas" && activeModule === null ? (
          <FerramentasScreen
            onSelectModule={(id) => setActiveModule(id as ModuleId)}
          />
        ) : null}

        {navTab === "ferramentas" && activeModule !== null ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setActiveModule(null)}
              className="text-sm text-cyan-400"
            >
              ← Ferramentas
            </button>
            <ModulesCenter activePatient={activePatient} initialModule={activeModule} />
          </div>
        ) : null}

        {navTab === "pacientes" ? (
          patientScreen === "list" ? (
            <AtendimentosScreen
              refreshKey={refreshKey}
              onOpen={openDetail}
              onNew={() => setPatientScreen("new")}
            />
          ) : patientScreen === "new" ? (
            <NewAtendimentoScreen
              onBack={() => setPatientScreen("list")}
              onCreated={handleCreated}
            />
          ) : selected ? (
            <AtendimentoDetailScreen record={selected} onBack={() => setPatientScreen("list")} />
          ) : null
        ) : null}

        {navTab === "perfil" ? <PlanoCarreiraScreen /> : null}
      </div>

      <BottomNavMobile
        active={navTab}
        onChange={(tab) => {
          setNavTab(tab);
          if (tab === "inicio") {
            setTopTab("atendimento");
            setActiveModule(null);
          }
          if (tab === "pacientes") setPatientScreen("list");
          if (tab !== "ferramentas") setActiveModule(null);
        }}
      />
    </div>
  );
}
