export type DrugCategory = "MPA" | "INDUCAO" | "EMERGENCIA";

export type DrugDefinition = {
  name: string;
  category: DrugCategory;
  minMgKg: number;
  targetMgKg: number;
  maxMgKg: number;
  concentrationMgMl?: number;
  notes?: string;
};

export const DRUGS: DrugDefinition[] = [
  {
    name: "Acepromazina",
    category: "MPA",
    minMgKg: 0.01,
    targetMgKg: 0.02,
    maxMgKg: 0.05,
    concentrationMgMl: 2,
    notes: "Sedação pré-anestésica em pacientes hemodinamicamente estáveis.",
  },
  {
    name: "Meperidina",
    category: "MPA",
    minMgKg: 2,
    targetMgKg: 3,
    maxMgKg: 5,
    concentrationMgMl: 50,
    notes: "Atenção para via de administração e analgesia multimodal.",
  },
  {
    name: "Propofol",
    category: "INDUCAO",
    minMgKg: 2,
    targetMgKg: 4,
    maxMgKg: 6,
    concentrationMgMl: 10,
    notes: "Titular lentamente ao efeito clínico.",
  },
  {
    name: "Alfaxalona",
    category: "INDUCAO",
    minMgKg: 1,
    targetMgKg: 2,
    maxMgKg: 3,
    concentrationMgMl: 10,
    notes: "Ajustar dose em pacientes geriátricos/debilitados.",
  },
  {
    name: "Atropina",
    category: "EMERGENCIA",
    minMgKg: 0.02,
    targetMgKg: 0.03,
    maxMgKg: 0.04,
    concentrationMgMl: 0.5,
    notes: "Uso conforme protocolo RECOVER e avaliação clínica.",
  },
  {
    name: "Adrenalina",
    category: "EMERGENCIA",
    minMgKg: 0.01,
    targetMgKg: 0.01,
    maxMgKg: 0.02,
    concentrationMgMl: 1,
    notes: "Concentração pode variar por apresentação comercial.",
  },
];
