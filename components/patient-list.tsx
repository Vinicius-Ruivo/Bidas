"use client";

import { Activity, Database, HardDriveDownload } from "lucide-react";

import type { PacienteRow } from "@/lib/database.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/locale-context";

type PatientListProps = {
  patients: PacienteRow[];
  activePatientId?: string;
  loading?: boolean;
  source: "supabase" | "local";
  onSelectPatient: (patient: PacienteRow) => void;
};

export function PatientList({
  patients,
  activePatientId,
  loading = false,
  source,
  onSelectPatient,
}: PatientListProps) {
  const { t, dateLocale } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Activity className="h-5 w-5 text-emerald-400" />
          {t("patientList.title")}
        </CardTitle>
        <CardDescription>
          {source === "supabase" ? t("patientList.descSupabase") : t("patientList.descLocal")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? <p className="text-sm text-zinc-400">{t("patientList.loading")}</p> : null}
        {!loading && patients.length === 0 ? (
          <p className="text-sm text-zinc-400">{t("patientList.empty")}</p>
        ) : null}
        {patients.map((patient) => {
          const isActive = patient.id === activePatientId;
          return (
            <button
              key={patient.id}
              type="button"
              onClick={() => onSelectPatient(patient)}
              className={`w-full rounded-lg border p-3 text-left transition ${
                isActive
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-border bg-zinc-950/50 hover:border-zinc-600"
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="font-semibold">{patient.nome}</p>
                <Badge variant={isActive ? "normal" : "warning"}>{patient.especie}</Badge>
              </div>
              <p className="text-xs text-zinc-300">
                {t("patientList.weight")} {patient.peso_kg} kg {patient.raca ? `- ${patient.raca}` : ""}
              </p>
              <p className="text-xs text-zinc-500">
                {t("patientList.registered")} {new Date(patient.created_at).toLocaleString(dateLocale)}
              </p>
            </button>
          );
        })}
        <div className="rounded-md border border-border p-3 text-xs text-zinc-400">
          <p className="flex items-center gap-2">
            {source === "supabase" ? <Database className="h-4 w-4" /> : <HardDriveDownload className="h-4 w-4" />}
            {t("patientList.dataSource")}{" "}
            {source === "supabase" ? t("patientList.sourceSupabase") : t("patientList.sourceLocal")}
          </p>
        </div>
        <Button type="button" variant="outline" className="w-full">
          {t("patientList.newProcedure")}
        </Button>
      </CardContent>
    </Card>
  );
}
