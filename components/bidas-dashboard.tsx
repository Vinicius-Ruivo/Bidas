"use client";

import { Siren, Stethoscope } from "lucide-react";

import { BidasChat } from "@/components/bidas-chat";
import { ModulesCenter } from "@/components/modules-center";
import { PatientList } from "@/components/patient-list";
import { PatientRegistrationForm } from "@/components/patient-registration-form";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { usePatients } from "@/hooks/use-patients";
import { useI18n } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/strings";

export function BidasDashboard() {
  const { activePatient, loading, patients, savePatient, saving, setActivePatient, source } = usePatients();
  const { locale, setLocale, t } = useI18n();

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 pb-28 md:px-8">
      <header className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1 sm:min-w-[240px] sm:max-w-xs">
            <Label htmlFor="bidas-locale" className="text-xs font-medium text-zinc-300">
              {t("dashboard.language")}
            </Label>
            <Select
              id="bidas-locale"
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              aria-label={t("dashboard.language")}
            >
              <option value="pt-BR">{t("locale.pt")}</option>
              <option value="en">{t("locale.en")}</option>
            </Select>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            <Stethoscope className="h-4 w-4 shrink-0" />
            {t("dashboard.badge")}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">{t("dashboard.brand")}</p>
          <h1 className="mt-1 text-3xl font-bold leading-tight md:text-4xl">{t("dashboard.title")}</h1>
          <p className="mt-2 max-w-3xl text-base text-zinc-300 md:text-lg">{t("dashboard.description")}</p>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <PatientRegistrationForm onPatientSaved={savePatient} isSaving={saving} />
        </div>
        <PatientList
          patients={patients}
          loading={loading}
          source={source}
          activePatientId={activePatient?.id}
          onSelectPatient={setActivePatient}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">{t("dashboard.activePatientTitle")}</h2>
          {activePatient ? (
            <div className="mt-3 space-y-1 text-sm text-zinc-300">
              <p>
                <strong>{activePatient.nome}</strong> ({activePatient.especie})
              </p>
              <p>
                {t("dashboard.weight")} {activePatient.peso_kg} kg
              </p>
              <p>
                {t("dashboard.breed")} {activePatient.raca || t("dashboard.breedUnknown")}
              </p>
              <p>
                {t("dashboard.age")} {activePatient.idade_anos ?? "-"} {t("dashboard.ageYears")}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-zinc-400">{t("dashboard.selectPatient")}</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Visão de Produto</h2>
          <p className="mt-3 text-sm text-zinc-300">
            Plataforma modular em evolução para cobrir doses, protocolo, checklist, monitorização, ficha digital e ECG com foco
            em segurança perioperatória.
          </p>
          <div className="mt-3 space-y-2 text-xs text-zinc-400">
            <p>Fase 1 (MVP): módulos 01 e 03.</p>
            <p>Fase 2 (Tração): módulos 02 e 05.</p>
            <p>Fase 3+ (Expansão/Diferencial): módulos 04 e 06.</p>
          </div>
        </div>
      </section>

      <section aria-label="Módulos do VetAnest.IA">
        <ModulesCenter activePatient={activePatient} />
      </section>

      <section aria-label={t("dashboard.chatAria")}>
        <BidasChat activePatient={activePatient} />
      </section>

      <button
        type="button"
        className="fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-600 px-5 py-4 text-base font-bold text-white shadow-lg transition hover:bg-red-500"
      >
        <Siren className="h-5 w-5" />
        {t("dashboard.emergency")}
      </button>
    </main>
  );
}
