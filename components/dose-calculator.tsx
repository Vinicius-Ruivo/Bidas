"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Calculator } from "lucide-react";

import { calculateDoseSheet } from "@/services/dose-calculator";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/locale-context";
import type { MessageKey } from "@/lib/i18n/strings";

type DoseCalculatorProps = {
  initialWeightKg?: number;
};

function categoryVariant(category: "MPA" | "INDUCAO" | "EMERGENCIA"): "normal" | "warning" | "critical" {
  if (category === "EMERGENCIA") return "critical";
  if (category === "INDUCAO") return "warning";
  return "normal";
}

function categoryMessageKey(category: "MPA" | "INDUCAO" | "EMERGENCIA"): MessageKey {
  if (category === "MPA") return "category.MPA";
  if (category === "INDUCAO") return "category.INDUCAO";
  return "category.EMERGENCIA";
}

export function DoseCalculator({ initialWeightKg = 0 }: DoseCalculatorProps) {
  const { t } = useI18n();
  const [weightKg, setWeightKg] = useState<number>(initialWeightKg);
  const [confirmed, setConfirmed] = useState<boolean>(false);

  useEffect(() => {
    if (initialWeightKg > 0) {
      setWeightKg(initialWeightKg);
    }
  }, [initialWeightKg]);

  const doses = useMemo(() => {
    if (weightKg <= 0) return [];
    return calculateDoseSheet(weightKg);
  }, [weightKg]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Calculator className="h-6 w-6 text-emerald-400" />
          {t("dose.title")}
        </CardTitle>
        <CardDescription>{t("dose.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="peso-calculo">{t("dose.weightLabel")}</Label>
          <Input
            id="peso-calculo"
            type="number"
            step="0.1"
            min={0}
            value={weightKg || ""}
            onChange={(e) => setWeightKg(Number(e.target.value))}
            placeholder={t("dose.weightPh")}
          />
        </div>

        <Alert variant="warning">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <div>
              <p className="font-semibold">{t("dose.alertTitle")}</p>
              <p className="text-xs opacity-90">{t("dose.alertBody")}</p>
            </div>
          </div>
        </Alert>

        <label className="flex items-center gap-2 rounded-md border border-border p-3 text-sm">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="h-4 w-4 accent-emerald-500"
          />
          {t("dose.confirmCheck")}
        </label>

        <div className="space-y-3">
          {doses.length === 0 ? (
            <p className="text-sm text-zinc-400">{t("dose.noWeight")}</p>
          ) : (
            doses.map((dose) => (
              <div key={dose.drug.name} className="rounded-lg border border-border bg-zinc-950/50 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="font-semibold">{dose.drug.name}</p>
                  <Badge variant={categoryVariant(dose.drug.category)}>
                    {t(categoryMessageKey(dose.drug.category))}
                  </Badge>
                </div>
                <p className="text-sm text-zinc-300">
                  {t("dose.target")} <strong>{dose.targetDoseMg} mg</strong>
                  {dose.targetVolumeMl !== null ? ` (${dose.targetVolumeMl} mL)` : ""}
                </p>
                <p className="text-xs text-zinc-400">
                  {t("dose.range")} {dose.minDoseMg} mg - {dose.maxDoseMg} mg
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {t("dose.formula")} {dose.formula}
                </p>
                {dose.drug.notes ? (
                  <p className="mt-1 text-xs text-zinc-500">
                    {t("dose.note")} {dose.drug.notes}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </div>

        <Button type="button" variant="outline" className="w-full" disabled={!confirmed || doses.length === 0}>
          {t("dose.logBlocked")}
        </Button>
      </CardContent>
    </Card>
  );
}
