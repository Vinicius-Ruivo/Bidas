import { DRUGS, type DrugDefinition } from "@/config/drugs";

export type DoseResult = {
  drug: DrugDefinition;
  weightKg: number;
  minDoseMg: number;
  targetDoseMg: number;
  maxDoseMg: number;
  targetVolumeMl: number | null;
  formula: string;
};

function round(value: number, decimals = 2) {
  return Number(value.toFixed(decimals));
}

export function calculateDoseForDrug(drug: DrugDefinition, weightKg: number): DoseResult {
  const minDoseMg = round(drug.minMgKg * weightKg);
  const targetDoseMg = round(drug.targetMgKg * weightKg);
  const maxDoseMg = round(drug.maxMgKg * weightKg);
  const targetVolumeMl = drug.concentrationMgMl
    ? round(targetDoseMg / drug.concentrationMgMl)
    : null;

  return {
    drug,
    weightKg,
    minDoseMg,
    targetDoseMg,
    maxDoseMg,
    targetVolumeMl,
    formula: `${drug.targetMgKg} mg/kg x ${weightKg} kg = ${targetDoseMg} mg`,
  };
}

export function calculateDoseSheet(weightKg: number) {
  return DRUGS.map((drug) => calculateDoseForDrug(drug, weightKg));
}
