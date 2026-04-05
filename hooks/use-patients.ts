"use client";

import { useCallback, useEffect, useState } from "react";

import type { PacienteInsert, PacienteRow } from "@/lib/database.types";
import { createPaciente, listPacientes, type DataSource } from "@/services/patient-service";

export function usePatients() {
  const [patients, setPatients] = useState<PacienteRow[]>([]);
  const [activePatient, setActivePatient] = useState<PacienteRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [source, setSource] = useState<DataSource>("local");

  const refreshPatients = useCallback(async () => {
    setLoading(true);
    const result = await listPacientes();
    setPatients(result.data);
    setSource(result.source);
    if (result.data.length > 0 && !activePatient) {
      setActivePatient(result.data[0]);
    }
    setLoading(false);
  }, [activePatient]);

  const savePatient = useCallback(async (payload: PacienteInsert) => {
    setSaving(true);
    const result = await createPaciente(payload);
    setPatients((prev) => [result.data, ...prev]);
    setActivePatient(result.data);
    setSource(result.source);
    setSaving(false);
  }, []);

  useEffect(() => {
    void refreshPatients();
  }, [refreshPatients]);

  return {
    activePatient,
    loading,
    patients,
    refreshPatients,
    savePatient,
    saving,
    setActivePatient,
    source,
  };
}
