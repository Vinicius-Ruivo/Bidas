"use client";

import { useMemo, useState } from "react";
import { Activity, ClipboardCheck, FileText, HeartPulse, Layers3, ScanHeart } from "lucide-react";

import type { PacienteRow } from "@/lib/database.types";
import { DRUGS } from "@/config/drugs";
import { calculateDoseSheet } from "@/services/dose-calculator";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type ModuleId = "01" | "02" | "03" | "04" | "05" | "06";
type AsaClass = "I" | "II" | "III" | "IV" | "V";
type SpeciesOption = "cao" | "gato" | "equino" | "bovino" | "silvestre";

type ProtocolOutput = {
  riskLevel: "baixo" | "moderado" | "alto";
  mpa: string;
  inducao: string;
  manutencao: string;
  cuidados: string[];
  alternativas: string[];
};

const MODULES: Array<{
  id: ModuleId;
  title: string;
  subtitle: string;
  complexity: "Baixa" | "Média" | "Alta";
  priority: "Alta" | "Média" | "Futura";
}> = [
  {
    id: "01",
    title: "Calculadora de Doses",
    subtitle: "Doses, volume e margem de segurança por perfil clínico.",
    complexity: "Baixa",
    priority: "Alta",
  },
  {
    id: "02",
    title: "Gerador de Protocolo",
    subtitle: "Sugestão estruturada de MPA, indução e manutenção.",
    complexity: "Média",
    priority: "Alta",
  },
  {
    id: "03",
    title: "Checklist Pré-Anestésico",
    subtitle: "Avaliação guiada, alertas e sugestão de ASA.",
    complexity: "Baixa",
    priority: "Média",
  },
  {
    id: "04",
    title: "Monitor Intraoperatório",
    subtitle: "Interpretação de parâmetros com conduta sugerida.",
    complexity: "Alta",
    priority: "Média",
  },
  {
    id: "05",
    title: "Ficha de Anestesia Digital",
    subtitle: "Resumo consolidado e rastreabilidade do caso.",
    complexity: "Média",
    priority: "Média",
  },
  {
    id: "06",
    title: "Leitor de ECG Veterinário",
    subtitle: "Laudo auxiliar estruturado para triagem.",
    complexity: "Alta",
    priority: "Futura",
  },
];

function moduleIcon(id: ModuleId) {
  if (id === "01") return <Layers3 className="h-4 w-4" />;
  if (id === "02") return <FileText className="h-4 w-4" />;
  if (id === "03") return <ClipboardCheck className="h-4 w-4" />;
  if (id === "04") return <Activity className="h-4 w-4" />;
  if (id === "05") return <HeartPulse className="h-4 w-4" />;
  return <ScanHeart className="h-4 w-4" />;
}

function parsePositiveNumber(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function protocolByRisk(params: {
  asa: AsaClass;
  ageYears: number | null;
  comorbidity: string;
  availableDrugs: string;
}): ProtocolOutput {
  const hasComorbidity = params.comorbidity.trim().length > 0;
  const highRiskAsa = params.asa === "III" || params.asa === "IV" || params.asa === "V";
  const senior = params.ageYears !== null && params.ageYears >= 10;
  const comorb = params.comorbidity.toLowerCase();
  const renalRisk = comorb.includes("renal") || comorb.includes("creatinina") || comorb.includes("drc");
  const cardiacRisk = comorb.includes("card") || comorb.includes("sopro") || comorb.includes("arritmia");
  const highRisk = highRiskAsa || senior || renalRisk || cardiacRisk;

  const available = params.availableDrugs.toLowerCase();
  const hasPropofol = available.includes("propofol");
  const hasDex = available.includes("dex") || available.includes("dexmedetomidina");
  const hasMetadone = available.includes("metadona");

  const riskLevel: ProtocolOutput["riskLevel"] = highRisk
    ? "alto"
    : hasComorbidity || params.asa === "II"
      ? "moderado"
      : "baixo";

  const mpa = highRisk
    ? hasMetadone
      ? "Metadona 0,2 mg/kg IM + sedação mínima titulada."
      : "Opioide de menor impacto hemodinâmico em dose titulada."
    : hasDex
      ? "Dexmedetomidina em dose baixa + opioide conforme dor esperada."
      : "Acepromazina em dose conservadora + opioide.";

  const inducao = highRisk
    ? hasPropofol
      ? "Propofol 2-3 mg/kg IV lento, até efeito."
      : "Etomidato ou alfaxalona com titulação lenta."
    : hasPropofol
      ? "Propofol 3-5 mg/kg IV, titulado."
      : "Cetamina combinada conforme perfil analgésico.";

  const manutencao = highRisk
    ? "Isoflurano 1,0-1,3% com analgesia multimodal e pressão arterial alvo > 60 mmHg."
    : "Isoflurano ou sevoflurano em plano estável, com ajuste por estímulo cirúrgico.";

  const cuidados = [
    "Confirmar peso atualizado e classificação ASA antes da indução.",
    "Monitorar PA, ETCO2 e SpO2 continuamente durante todo o procedimento.",
    "Registrar intercorrências e resposta clínica para retroalimentar decisões futuras.",
  ];
  if (renalRisk) cuidados.push("Evitar hipotensão prolongada para preservar perfusão renal.");
  if (cardiacRisk) cuidados.push("Avaliar necessidade de ecocardiograma e monitorização cardíaca avançada.");
  if (highRiskAsa) cuidados.push("Discutir risco anestésico com tutor e equipe antes de iniciar.");

  const alternativas = [
    "Se faltar fármaco principal, manter objetivo clínico (sedação, hipnose, analgesia) com classe equivalente.",
    "Se houver instabilidade hemodinâmica, reduzir inalatório e priorizar suporte ventilatório/volêmico.",
  ];
  if (!hasPropofol) alternativas.push("Sem propofol disponível: considerar indução com alfaxalona ou etomidato.");
  if (!hasDex) alternativas.push("Sem dexmedetomidina: preferir opioide + tranquilizante em dose baixa.");

  return { riskLevel, mpa, inducao, manutencao, cuidados, alternativas };
}

function suggestAsa(inputs: { hematocrit: number | null; creatinine: number | null; murmurGrade: number }): AsaClass {
  let asa: AsaClass = "I";
  if (inputs.hematocrit !== null && inputs.hematocrit < 30) asa = "II";
  if (inputs.creatinine !== null && inputs.creatinine >= 1.6) asa = "III";
  if (inputs.murmurGrade >= 3) asa = "III";
  if (
    (inputs.hematocrit !== null && inputs.hematocrit < 20) ||
    (inputs.creatinine !== null && inputs.creatinine >= 2.5)
  ) {
    asa = "IV";
  }
  if (inputs.hematocrit !== null && inputs.hematocrit < 15) asa = "V";
  return asa;
}

function asaAlertVariant(asa: AsaClass): "critical" | "warning" | "normal" {
  if (asa === "IV" || asa === "V") return "critical";
  if (asa === "III") return "warning";
  return "normal";
}

export function ModulesCenter({
  activePatient,
  initialModule = "01",
}: {
  activePatient: PacienteRow | null;
  initialModule?: ModuleId;
}) {
  const [activeModule, setActiveModule] = useState<ModuleId>(initialModule);

  const [species, setSpecies] = useState<SpeciesOption>("cao");
  const [asa, setAsa] = useState<AsaClass>("II");
  const [procedure, setProcedure] = useState("Orquiectomia eletiva");
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);

  const [comorbidity, setComorbidity] = useState("");
  const [availableDrugs, setAvailableDrugs] = useState("Dexmedetomidina, Propofol, Isoflurano, Metadona");

  const [fc, setFc] = useState("");
  const [fr, setFr] = useState("");
  const [tpc, setTpc] = useState("");
  const [hematocrit, setHematocrit] = useState("");
  const [creatinine, setCreatinine] = useState("");
  const [murmurGrade, setMurmurGrade] = useState(0);

  const [spo2, setSpo2] = useState("");
  const [monitorFc, setMonitorFc] = useState("");
  const [pam, setPam] = useState("");
  const [etco2, setEtco2] = useState("");
  const [isoflurane, setIsoflurane] = useState("");

  const [intercurrence, setIntercurrence] = useState("");
  const [usedDrugs, setUsedDrugs] = useState("");
  const [ecgRhythm, setEcgRhythm] = useState("Ritmo sinusal");
  const [ecgQrsWide, setEcgQrsWide] = useState(false);
  const [ecgAvDissociation, setEcgAvDissociation] = useState(false);

  const safeWeight = activePatient?.peso_kg ?? 0;
  const doseRows = useMemo(() => {
    if (!safeWeight) return [];
    const base = calculateDoseSheet(safeWeight);
    if (selectedDrugs.length === 0) return base;
    return base.filter((item) => selectedDrugs.includes(item.drug.name));
  }, [safeWeight, selectedDrugs]);

  const protocol = useMemo(
    () =>
      protocolByRisk({
        asa,
        ageYears: activePatient?.idade_anos ?? null,
        comorbidity,
        availableDrugs,
      }),
    [activePatient?.idade_anos, asa, availableDrugs, comorbidity],
  );

  const checklistAlerts = useMemo(() => {
    const alerts: string[] = [];
    const fcN = parsePositiveNumber(fc);
    const frN = parsePositiveNumber(fr);
    const tpcN = parsePositiveNumber(tpc);
    const hctN = parsePositiveNumber(hematocrit);
    const creaN = parsePositiveNumber(creatinine);

    if (fcN !== null && fcN > 160) alerts.push("Taquicardia no exame físico: revisar dor, estresse e volemia.");
    if (frN !== null && frN > 40) alerts.push("Taquipneia: investigar causa antes de sedação/indução.");
    if (tpcN !== null && tpcN > 2) alerts.push("TPC aumentado: possível perfusão comprometida.");
    if (hctN !== null && hctN < 25) alerts.push("Anemia moderada/importante: discutir suporte transfusional.");
    if (creaN !== null && creaN >= 1.6) alerts.push("Azotemia: proteger perfusão renal no perioperatório.");
    if (murmurGrade >= 3) alerts.push("Sopro grau >= III: considerar avaliação cardiológica prévia.");

    return alerts;
  }, [creatinine, fc, fr, hematocrit, murmurGrade, tpc]);

  const suggestedAsa = useMemo(
    () =>
      suggestAsa({
        hematocrit: parsePositiveNumber(hematocrit),
        creatinine: parsePositiveNumber(creatinine),
        murmurGrade,
      }),
    [creatinine, hematocrit, murmurGrade],
  );

  const monitorAlerts = useMemo(() => {
    const alerts: string[] = [];
    const actions: string[] = [];
    const spo2N = parsePositiveNumber(spo2);
    const fcN = parsePositiveNumber(monitorFc);
    const pamN = parsePositiveNumber(pam);
    const etco2N = parsePositiveNumber(etco2);
    const isoN = parsePositiveNumber(isoflurane);

    if (spo2N !== null && spo2N < 94) {
      alerts.push("SpO2 abaixo do alvo.");
      actions.push("Checar via aérea, circuito, FiO2 e posicionamento.");
    }
    if (fcN !== null && fcN < 50) {
      alerts.push("Bradicardia relevante.");
      actions.push("Reavaliar profundidade anestésica e considerar atropina se persistente.");
    }
    if (pamN !== null && pamN < 60) {
      alerts.push("Hipotensão (PAM < 60 mmHg).");
      actions.push("Reduzir inalatório e otimizar suporte hemodinâmico.");
    }
    if (etco2N !== null && etco2N > 55) {
      alerts.push("ETCO2 elevado.");
      actions.push("Aumentar ventilação minuto (FR/VT) e verificar complacência.");
    }
    if (isoN !== null && isoN > 1.6) {
      alerts.push("Concentração de inalatório alta para manutenção.");
      actions.push("Titular para menor concentração efetiva conforme estímulo cirúrgico.");
    }

    return { alerts, actions };
  }, [etco2, isoflurane, monitorFc, pam, spo2]);

  const fichaResumo = useMemo(() => {
    if (!activePatient) return "";
    const protocolSummary = `MPA: ${protocol.mpa} | Indução: ${protocol.inducao} | Manutenção: ${protocol.manutencao}`;
    return [
      `Paciente: ${activePatient.nome} (${activePatient.especie}) — ${activePatient.peso_kg} kg`,
      `Perfil: ASA ${asa} | Procedimento: ${procedure}`,
      `Protocolo aplicado: ${protocolSummary}`,
      `Fármacos utilizados: ${usedDrugs || "Não informado"}`,
      `Intercorrências: ${intercurrence || "Sem intercorrências relevantes registradas."}`,
      "Disclaimer: registro digital de apoio; validação final é do médico veterinário responsável.",
    ].join("\n");
  }, [activePatient, asa, intercurrence, procedure, protocol.inducao, protocol.manutencao, protocol.mpa, usedDrugs]);

  const ecgReport = useMemo(() => {
    const achados: string[] = [];
    if (ecgQrsWide) achados.push("Complexos QRS alargados.");
    if (ecgAvDissociation) achados.push("Sinais sugestivos de dissociação AV.");
    const risco =
      ecgRhythm.toLowerCase().includes("taquicardia ventricular") || ecgAvDissociation || ecgQrsWide ? "alto" : "moderado";
    return {
      achados,
      risco,
      conduta:
        risco === "alto"
          ? "Evitar anestesia eletiva até avaliação cardiológica completa; em urgência, usar protocolo cardioprotetor."
          : "Prosseguir com monitorização eletrocardiográfica contínua e reavaliar traçado no perioperatório.",
    };
  }, [ecgAvDissociation, ecgQrsWide, ecgRhythm]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Centro de Módulos VetAnest.IA</CardTitle>
        <CardDescription>
          Implementação guiada pela especificação: módulos independentes, foco em validação clínica rápida e integração progressiva.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 md:grid-cols-3">
          <Alert>
            <p className="font-semibold">Roadmap ativo</p>
            <p className="text-xs opacity-90">Fase 1 (MVP): módulos 01 e 03. Fase 2: módulos 02 e 05.</p>
          </Alert>
          <Alert variant="warning">
            <p className="font-semibold">Estratégia de custo</p>
            <p className="text-xs opacity-90">Lógica local primeiro, IA apenas em justificativas e textos narrativos.</p>
          </Alert>
          <Alert variant="critical">
            <p className="font-semibold">Responsabilidade clínica</p>
            <p className="text-xs opacity-90">Todas as saídas são apoio à decisão e exigem validação profissional.</p>
          </Alert>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          {MODULES.map((mod) => (
            <Button
              key={mod.id}
              type="button"
              variant={activeModule === mod.id ? "default" : "outline"}
              className="h-auto justify-start px-3 py-2 text-left"
              onClick={() => setActiveModule(mod.id)}
            >
              <span className="mr-2">{moduleIcon(mod.id)}</span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold">
                  {mod.id} — {mod.title}
                </span>
                <span className="text-[11px] opacity-80">
                  {mod.complexity} • prioridade {mod.priority}
                </span>
              </span>
            </Button>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-zinc-950/40 p-4">
          {activeModule === "01" ? (
            <div className="space-y-3">
              <p className="text-sm text-zinc-300">
                Paciente ativo: <strong>{activePatient?.nome ?? "Nenhum selecionado"}</strong>. Cálculo integrado ao peso do cadastro.
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="grid gap-1">
                  <Label htmlFor="mod1-species">Espécie</Label>
                  <Select
                    id="mod1-species"
                    value={species}
                    onChange={(e) => setSpecies(e.target.value as SpeciesOption)}
                  >
                    <option value="cao">Cão</option>
                    <option value="gato">Gato</option>
                    <option value="equino">Equino</option>
                    <option value="bovino">Bovino</option>
                    <option value="silvestre">Silvestre comum</option>
                  </Select>
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="mod1-asa">ASA</Label>
                  <Select id="mod1-asa" value={asa} onChange={(e) => setAsa(e.target.value as AsaClass)}>
                    <option value="I">ASA I</option>
                    <option value="II">ASA II</option>
                    <option value="III">ASA III</option>
                    <option value="IV">ASA IV</option>
                    <option value="V">ASA V</option>
                  </Select>
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="mod1-procedure">Procedimento</Label>
                  <Input id="mod1-procedure" value={procedure} onChange={(e) => setProcedure(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Filtrar por fármacos disponíveis</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {DRUGS.map((drug) => {
                    const checked = selectedDrugs.includes(drug.name);
                    return (
                      <label key={drug.name} className="flex items-center gap-2 rounded-md border border-border px-2 py-1 text-xs">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setSelectedDrugs((prev) =>
                              e.target.checked ? [...prev, drug.name] : prev.filter((item) => item !== drug.name),
                            );
                          }}
                          className="h-3.5 w-3.5 accent-emerald-500"
                        />
                        {drug.name}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                {doseRows.length === 0 ? (
                  <p className="text-sm text-zinc-400">Selecione um paciente com peso válido para calcular.</p>
                ) : (
                  doseRows.map((dose) => {
                    const highRisk = asa === "III" || asa === "IV" || asa === "V";
                    const adjusted = highRisk ? Number((dose.targetDoseMg * 0.8).toFixed(2)) : dose.targetDoseMg;
                    return (
                      <div key={dose.drug.name} className="rounded-md border border-border p-3">
                        <div className="mb-1 flex items-center justify-between">
                          <strong>{dose.drug.name}</strong>
                          <Badge variant={dose.drug.category === "EMERGENCIA" ? "critical" : dose.drug.category === "INDUCAO" ? "warning" : "normal"}>
                            {dose.drug.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-zinc-200">
                          Dose alvo: {dose.targetDoseMg} mg {dose.targetVolumeMl !== null ? `(${dose.targetVolumeMl} mL)` : ""}
                        </p>
                        {highRisk ? (
                          <p className="text-xs text-amber-300">Ajuste conservador sugerido (ASA alto): {adjusted} mg.</p>
                        ) : null}
                        <p className="text-xs text-zinc-400">
                          Faixa: {dose.minDoseMg} - {dose.maxDoseMg} mg | Fórmula: {dose.formula}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : null}

          {activeModule === "02" ? (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-1">
                  <Label htmlFor="mod2-comorb">Comorbidades relevantes</Label>
                  <Textarea
                    id="mod2-comorb"
                    value={comorbidity}
                    onChange={(e) => setComorbidity(e.target.value)}
                    placeholder="Ex.: DRC estágio 2, sopro sistólico grau III"
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="mod2-drugs">Fármacos disponíveis na clínica</Label>
                  <Textarea
                    id="mod2-drugs"
                    value={availableDrugs}
                    onChange={(e) => setAvailableDrugs(e.target.value)}
                    placeholder="Separe por vírgula"
                  />
                </div>
              </div>
              <Alert variant={protocol.riskLevel === "alto" ? "critical" : protocol.riskLevel === "moderado" ? "warning" : "normal"}>
                Risco anestésico estimado: <strong>{protocol.riskLevel.toUpperCase()}</strong>
              </Alert>
              <div className="space-y-2 rounded-md border border-border p-3 text-sm text-zinc-200">
                <p>
                  <strong>MPA sugerida:</strong> {protocol.mpa}
                </p>
                <p>
                  <strong>Indução:</strong> {protocol.inducao}
                </p>
                <p>
                  <strong>Manutenção:</strong> {protocol.manutencao}
                </p>
                <p className="font-semibold">Cuidados críticos:</p>
                <ul className="list-disc space-y-1 pl-5 text-xs text-zinc-300">
                  {protocol.cuidados.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="font-semibold">Alternativas de protocolo:</p>
                <ul className="list-disc space-y-1 pl-5 text-xs text-zinc-300">
                  {protocol.alternativas.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          {activeModule === "03" ? (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="grid gap-1">
                  <Label htmlFor="mod3-fc">FC (bpm)</Label>
                  <Input id="mod3-fc" value={fc} onChange={(e) => setFc(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="mod3-fr">FR (mrm)</Label>
                  <Input id="mod3-fr" value={fr} onChange={(e) => setFr(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="mod3-tpc">TPC (s)</Label>
                  <Input id="mod3-tpc" value={tpc} onChange={(e) => setTpc(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="mod3-hct">Hematócrito (%)</Label>
                  <Input id="mod3-hct" value={hematocrit} onChange={(e) => setHematocrit(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="mod3-crea">Creatinina (mg/dL)</Label>
                  <Input id="mod3-crea" value={creatinine} onChange={(e) => setCreatinine(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="mod3-sopro">Grau de sopro</Label>
                  <Select id="mod3-sopro" value={String(murmurGrade)} onChange={(e) => setMurmurGrade(Number(e.target.value))}>
                    <option value="0">Ausente</option>
                    <option value="1">I</option>
                    <option value="2">II</option>
                    <option value="3">III</option>
                    <option value="4">IV</option>
                    <option value="5">V</option>
                    <option value="6">VI</option>
                  </Select>
                </div>
              </div>
              <Alert variant={asaAlertVariant(suggestedAsa)}>
                Classificação ASA sugerida: <strong>ASA {suggestedAsa}</strong>
              </Alert>
              {checklistAlerts.length === 0 ? (
                <p className="text-sm text-zinc-400">Sem alertas críticos detectados pelos campos preenchidos.</p>
              ) : (
                <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-200">
                  {checklistAlerts.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          {activeModule === "04" ? (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="grid gap-1">
                  <Label htmlFor="mod4-spo2">SpO2 (%)</Label>
                  <Input id="mod4-spo2" value={spo2} onChange={(e) => setSpo2(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="mod4-fc">FC (bpm)</Label>
                  <Input id="mod4-fc" value={monitorFc} onChange={(e) => setMonitorFc(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="mod4-pam">PAM (mmHg)</Label>
                  <Input id="mod4-pam" value={pam} onChange={(e) => setPam(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="mod4-etco2">ETCO2 (mmHg)</Label>
                  <Input id="mod4-etco2" value={etco2} onChange={(e) => setEtco2(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="mod4-iso">Isoflurano (%)</Label>
                  <Input id="mod4-iso" value={isoflurane} onChange={(e) => setIsoflurane(e.target.value)} />
                </div>
              </div>
              {monitorAlerts.alerts.length === 0 ? (
                <Alert>Nenhum desvio crítico identificado nos parâmetros informados.</Alert>
              ) : (
                <Alert variant="critical">
                  <p className="font-semibold">Alertas intraoperatórios</p>
                  <ul className="list-disc space-y-1 pl-5 text-xs">
                    {monitorAlerts.alerts.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className="mt-2 font-semibold">Conduta sugerida</p>
                  <ul className="list-disc space-y-1 pl-5 text-xs">
                    {monitorAlerts.actions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </Alert>
              )}
            </div>
          ) : null}

          {activeModule === "05" ? (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-1">
                  <Label htmlFor="mod5-drugs">Fármacos utilizados e horários</Label>
                  <Textarea
                    id="mod5-drugs"
                    value={usedDrugs}
                    onChange={(e) => setUsedDrugs(e.target.value)}
                    placeholder="Ex.: Propofol 11:10 (4,8 mL), Isoflurano 1,3% manutenção..."
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="mod5-inter">Intercorrências</Label>
                  <Textarea
                    id="mod5-inter"
                    value={intercurrence}
                    onChange={(e) => setIntercurrence(e.target.value)}
                    placeholder="Ex.: Bradicardia transitória aos 35 min, revertida com atropina."
                  />
                </div>
              </div>
              <p className="text-xs text-zinc-400">
                Saída estruturada para exportação futura em PDF e sincronização com prontuário.
              </p>
              <Textarea value={fichaResumo} readOnly className="min-h-44 text-xs" />
              <Button type="button" variant="outline" disabled>
                Exportar PDF (próximo passo de implementação)
              </Button>
            </div>
          ) : null}

          {activeModule === "06" ? (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-1">
                  <Label htmlFor="mod6-rhythm">Ritmo identificado</Label>
                  <Select id="mod6-rhythm" value={ecgRhythm} onChange={(e) => setEcgRhythm(e.target.value)}>
                    <option>Ritmo sinusal</option>
                    <option>Taquicardia ventricular paroxística</option>
                    <option>Fibrilação atrial</option>
                    <option>Bloqueio AV de 2º grau</option>
                    <option>Bloqueio AV de 3º grau</option>
                  </Select>
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="mod6-upload">Imagem do traçado (upload local)</Label>
                  <Input id="mod6-upload" type="file" accept="image/*" />
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={ecgQrsWide}
                    onChange={(e) => setEcgQrsWide(e.target.checked)}
                    className="h-4 w-4 accent-emerald-500"
                  />
                  QRS alargado
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={ecgAvDissociation}
                    onChange={(e) => setEcgAvDissociation(e.target.checked)}
                    className="h-4 w-4 accent-emerald-500"
                  />
                  Dissociação AV
                </label>
              </div>
              <Alert variant={ecgReport.risco === "alto" ? "critical" : "warning"}>
                Risco eletrocardiográfico estimado: <strong>{ecgReport.risco.toUpperCase()}</strong>
              </Alert>
              <div className="rounded-md border border-border p-3 text-sm text-zinc-200">
                <p>
                  <strong>Ritmo:</strong> {ecgRhythm}
                </p>
                <p>
                  <strong>Achados:</strong>{" "}
                  {ecgReport.achados.length > 0 ? ecgReport.achados.join(" ") : "Sem alterações morfológicas destacadas pelos marcadores."}
                </p>
                <p className="mt-2">
                  <strong>Conduta sugerida:</strong> {ecgReport.conduta}
                </p>
                <p className="mt-2 text-xs text-zinc-400">
                  Laudo auxiliar. Interpretação final obrigatoriamente validada por médico veterinário responsável.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
