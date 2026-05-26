"use client";

import { useState } from "react";

import { BidasHeader } from "@/components/bidas/bidas-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createAtendimento } from "@/lib/atendimentos-store";

type NewAtendimentoScreenProps = {
  onBack: () => void;
  onCreated: () => void;
};

export function NewAtendimentoScreen({ onBack, onCreated }: NewAtendimentoScreenProps) {
  const [nome, setNome] = useState("");
  const [especie, setEspecie] = useState("Canino");
  const [raca, setRaca] = useState("");
  const [pesoKg, setPesoKg] = useState("");
  const [tutorNome, setTutorNome] = useState("");
  const [asa, setAsa] = useState<"I" | "II" | "III" | "IV" | "V">("II");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!nome.trim() || !pesoKg) return;

    createAtendimento({
      nome: nome.trim(),
      especie,
      raca: raca.trim() || "Não informada",
      pesoKg: Number(pesoKg),
      tutorNome: tutorNome.trim() || "Não informado",
      asa,
    });
    onCreated();
  }

  return (
    <div className="space-y-5 pb-24">
      <button type="button" onClick={onBack} className="text-sm text-emerald-400">
        ← Voltar
      </button>

      <BidasHeader />

      <div>
        <h2 className="font-display text-3xl font-bold text-white">Novo atendimento</h2>
        <p className="mt-1 text-sm text-zinc-500">Cadastre o paciente para iniciar a ficha anestésica.</p>
      </div>

      <form className="space-y-4 rounded-2xl border border-emerald-500/15 bg-zinc-950/80 p-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="novo-nome">Nome do paciente</Label>
          <Input id="novo-nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Thor" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="novo-especie">Espécie</Label>
          <Select id="novo-especie" value={especie} onChange={(e) => setEspecie(e.target.value)}>
            <option value="Canino">Canino</option>
            <option value="Felino">Felino</option>
            <option value="Equino">Equino</option>
            <option value="Outro">Outro</option>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="novo-raca">Raça</Label>
          <Input id="novo-raca" value={raca} onChange={(e) => setRaca(e.target.value)} placeholder="Ex.: Labrador" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="novo-peso">Peso (kg)</Label>
            <Input
              id="novo-peso"
              type="number"
              step="0.1"
              min={0}
              value={pesoKg}
              onChange={(e) => setPesoKg(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="novo-asa">ASA</Label>
            <Select id="novo-asa" value={asa} onChange={(e) => setAsa(e.target.value as typeof asa)}>
              <option value="I">ASA I</option>
              <option value="II">ASA II</option>
              <option value="III">ASA III</option>
              <option value="IV">ASA IV</option>
              <option value="V">ASA V</option>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="novo-tutor">Tutor</Label>
          <Input
            id="novo-tutor"
            value={tutorNome}
            onChange={(e) => setTutorNome(e.target.value)}
            placeholder="Ex.: Carlos Mendes"
          />
        </div>

        <Button type="submit" className="w-full" disabled={!nome.trim() || !pesoKg}>
          Criar atendimento
        </Button>
      </form>
    </div>
  );
}
