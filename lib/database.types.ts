export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      pacientes: {
        Row: {
          created_at: string;
          especie: string;
          historico_clinico: string | null;
          id: string;
          idade_anos: number | null;
          nome: string;
          peso_kg: number;
          raca: string | null;
          tutor_nome: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          especie: string;
          historico_clinico?: string | null;
          id?: string;
          idade_anos?: number | null;
          nome: string;
          peso_kg: number;
          raca?: string | null;
          tutor_nome?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          especie?: string;
          historico_clinico?: string | null;
          id?: string;
          idade_anos?: number | null;
          nome?: string;
          peso_kg?: number;
          raca?: string | null;
          tutor_nome?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      procedimentos: {
        Row: {
          asa_classificacao: "I" | "II" | "III" | "IV" | "V";
          created_at: string;
          data_procedimento: string;
          id: string;
          observacoes: string | null;
          paciente_id: string;
          tipo_cirurgia: string;
          updated_at: string;
        };
        Insert: {
          asa_classificacao: "I" | "II" | "III" | "IV" | "V";
          created_at?: string;
          data_procedimento?: string;
          id?: string;
          observacoes?: string | null;
          paciente_id: string;
          tipo_cirurgia: string;
          updated_at?: string;
        };
        Update: {
          asa_classificacao?: "I" | "II" | "III" | "IV" | "V";
          created_at?: string;
          data_procedimento?: string;
          id?: string;
          observacoes?: string | null;
          paciente_id?: string;
          tipo_cirurgia?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      planos_anestesicos: {
        Row: {
          created_at: string;
          doses_resgate_json: Json;
          id: string;
          mpa_sugerida: string;
          manutencao: "ISOFLURANO" | "SEVOFLURANO";
          procedimento_id: string;
          protocolo_inducao: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          doses_resgate_json?: Json;
          id?: string;
          mpa_sugerida: string;
          manutencao: "ISOFLURANO" | "SEVOFLURANO";
          procedimento_id: string;
          protocolo_inducao: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          doses_resgate_json?: Json;
          id?: string;
          mpa_sugerida?: string;
          manutencao?: "ISOFLURANO" | "SEVOFLURANO";
          procedimento_id?: string;
          protocolo_inducao?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      monitor_logs: {
        Row: {
          created_at: string;
          etco2_mmhg: number | null;
          fc_bpm: number | null;
          id: string;
          pas_mmhg: number | null;
          pad_mmhg: number | null;
          pam_mmhg: number | null;
          procedimento_id: string;
          spo2_percent: number | null;
          temperatura_c: number | null;
          timestamp_leitura: string;
          origem_dado: "MANUAL" | "WEBSOCKET" | "OCR";
        };
        Insert: {
          created_at?: string;
          etco2_mmhg?: number | null;
          fc_bpm?: number | null;
          id?: string;
          pas_mmhg?: number | null;
          pad_mmhg?: number | null;
          pam_mmhg?: number | null;
          procedimento_id: string;
          spo2_percent?: number | null;
          temperatura_c?: number | null;
          timestamp_leitura?: string;
          origem_dado?: "MANUAL" | "WEBSOCKET" | "OCR";
        };
        Update: {
          created_at?: string;
          etco2_mmhg?: number | null;
          fc_bpm?: number | null;
          id?: string;
          pas_mmhg?: number | null;
          pad_mmhg?: number | null;
          pam_mmhg?: number | null;
          procedimento_id?: string;
          spo2_percent?: number | null;
          temperatura_c?: number | null;
          timestamp_leitura?: string;
          origem_dado?: "MANUAL" | "WEBSOCKET" | "OCR";
        };
        Relationships: [];
      };
      aprendizado_feedback: {
        Row: {
          corrigido_em: string;
          created_at: string;
          id: string;
          input_original: string;
          observacao_usuario: string | null;
          output_corrigido: string;
          paciente_id: string | null;
          procedimento_id: string | null;
          user_id: string | null;
        };
        Insert: {
          corrigido_em?: string;
          created_at?: string;
          id?: string;
          input_original: string;
          observacao_usuario?: string | null;
          output_corrigido: string;
          paciente_id?: string | null;
          procedimento_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          corrigido_em?: string;
          created_at?: string;
          id?: string;
          input_original?: string;
          observacao_usuario?: string | null;
          output_corrigido?: string;
          paciente_id?: string | null;
          procedimento_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      base_conhecimento_chunks: {
        Row: {
          conteudo: string;
          created_at: string;
          embedding: string | null;
          id: string;
          metadados: Json;
          referencia: string | null;
          titulo_fonte: string;
        };
        Insert: {
          conteudo: string;
          created_at?: string;
          embedding?: string | null;
          id?: string;
          metadados?: Json;
          referencia?: string | null;
          titulo_fonte: string;
        };
        Update: {
          conteudo?: string;
          created_at?: string;
          embedding?: string | null;
          id?: string;
          metadados?: Json;
          referencia?: string | null;
          titulo_fonte?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

export type PacienteInsert = Database["public"]["Tables"]["pacientes"]["Insert"];
export type PacienteRow = Database["public"]["Tables"]["pacientes"]["Row"];
