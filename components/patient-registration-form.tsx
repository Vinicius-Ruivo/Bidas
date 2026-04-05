"use client";

import { useMemo, useState } from "react";
import { PawPrint } from "lucide-react";

import type { PacienteInsert } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n/locale-context";

const initialState: PacienteInsert = {
  nome: "",
  especie: "cao",
  raca: "",
  peso_kg: 0,
  idade_anos: 0,
  historico_clinico: "",
  tutor_nome: "",
};

type PatientRegistrationFormProps = {
  onPatientSaved: (patient: PacienteInsert) => Promise<void> | void;
  isSaving?: boolean;
};

export function PatientRegistrationForm({ onPatientSaved, isSaving = false }: PatientRegistrationFormProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState<PacienteInsert>(initialState);
  const [lastSavedPatient, setLastSavedPatient] = useState<PacienteInsert | null>(null);

  const canSubmit = useMemo(() => formData.nome.trim().length > 1 && formData.peso_kg > 0, [formData]);

  function onChange<K extends keyof PacienteInsert>(field: K, value: PacienteInsert[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || isSaving) return;
    await onPatientSaved(formData);
    setLastSavedPatient(formData);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <PawPrint className="h-6 w-6 text-emerald-400" />
          {t("patientForm.title")}
        </CardTitle>
        <CardDescription>{t("patientForm.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="nome">{t("patientForm.nameLabel")}</Label>
            <Input
              id="nome"
              placeholder={t("patientForm.namePh")}
              value={formData.nome}
              onChange={(e) => onChange("nome", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="especie">{t("patientForm.speciesLabel")}</Label>
            <Select
              id="especie"
              value={formData.especie}
              onChange={(e) => onChange("especie", e.target.value)}
            >
              <option value="cao">{t("patientForm.speciesDog")}</option>
              <option value="gato">{t("patientForm.speciesCat")}</option>
              <option value="equino">{t("patientForm.speciesHorse")}</option>
              <option value="outro">{t("patientForm.speciesOther")}</option>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="raca">{t("patientForm.breedLabel")}</Label>
            <Input
              id="raca"
              placeholder={t("patientForm.breedPh")}
              value={formData.raca ?? ""}
              onChange={(e) => onChange("raca", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="peso">{t("patientForm.weightLabel")}</Label>
            <Input
              id="peso"
              type="number"
              step="0.1"
              min={0}
              placeholder={t("patientForm.weightPh")}
              value={formData.peso_kg || ""}
              onChange={(e) => onChange("peso_kg", Number(e.target.value))}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="idade">{t("patientForm.ageLabel")}</Label>
            <Input
              id="idade"
              type="number"
              step="0.1"
              min={0}
              placeholder={t("patientForm.agePh")}
              value={formData.idade_anos || ""}
              onChange={(e) => onChange("idade_anos", Number(e.target.value))}
            />
          </div>

          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="historico">{t("patientForm.historyLabel")}</Label>
            <Textarea
              id="historico"
              placeholder={t("patientForm.historyPh")}
              value={formData.historico_clinico ?? ""}
              onChange={(e) => onChange("historico_clinico", e.target.value)}
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-between gap-3">
            <p className="text-sm text-zinc-400">
              {lastSavedPatient
                ? t("patientForm.footerSaved", {
                    name: lastSavedPatient.nome,
                    kg: String(lastSavedPatient.peso_kg),
                  })
                : t("patientForm.footerEmpty")}
            </p>
            <Button type="submit" disabled={!canSubmit || isSaving}>
              {isSaving ? t("patientForm.saving") : t("patientForm.save")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
