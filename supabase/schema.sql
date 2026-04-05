create extension if not exists "pgcrypto";
create extension if not exists "vector";

create type asa_classificacao as enum ('I', 'II', 'III', 'IV', 'V');
create type manutencao_anestesica as enum ('ISOFLURANO', 'SEVOFLURANO');
create type origem_monitor as enum ('MANUAL', 'WEBSOCKET', 'OCR');

create table if not exists public.pacientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  especie text not null,
  raca text,
  peso_kg numeric(6,2) not null check (peso_kg > 0),
  idade_anos numeric(5,2),
  tutor_nome text,
  historico_clinico text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.procedimentos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  data_procedimento timestamptz not null default now(),
  tipo_cirurgia text not null,
  asa_classificacao asa_classificacao not null,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.planos_anestesicos (
  id uuid primary key default gen_random_uuid(),
  procedimento_id uuid not null unique references public.procedimentos(id) on delete cascade,
  mpa_sugerida text not null,
  protocolo_inducao text not null,
  manutencao manutencao_anestesica not null,
  doses_resgate_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.monitor_logs (
  id uuid primary key default gen_random_uuid(),
  procedimento_id uuid not null references public.procedimentos(id) on delete cascade,
  timestamp_leitura timestamptz not null default now(),
  fc_bpm numeric(6,2),
  spo2_percent numeric(6,2),
  etco2_mmhg numeric(6,2),
  pas_mmhg numeric(6,2),
  pad_mmhg numeric(6,2),
  pam_mmhg numeric(6,2),
  temperatura_c numeric(5,2),
  origem_dado origem_monitor not null default 'MANUAL',
  created_at timestamptz not null default now()
);

create table if not exists public.aprendizado_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  paciente_id uuid references public.pacientes(id) on delete set null,
  procedimento_id uuid references public.procedimentos(id) on delete set null,
  input_original text not null,
  output_corrigido text not null,
  observacao_usuario text,
  corrigido_em timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.base_conhecimento_chunks (
  id uuid primary key default gen_random_uuid(),
  titulo_fonte text not null,
  referencia text,
  conteudo text not null,
  embedding vector(1536),
  metadados jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.pacientes enable row level security;
alter table public.procedimentos enable row level security;
alter table public.planos_anestesicos enable row level security;
alter table public.monitor_logs enable row level security;
alter table public.aprendizado_feedback enable row level security;
alter table public.base_conhecimento_chunks enable row level security;

drop policy if exists pacientes_dev_all on public.pacientes;
create policy pacientes_dev_all on public.pacientes for all using (true) with check (true);

drop policy if exists procedimentos_dev_all on public.procedimentos;
create policy procedimentos_dev_all on public.procedimentos for all using (true) with check (true);

drop policy if exists planos_dev_all on public.planos_anestesicos;
create policy planos_dev_all on public.planos_anestesicos for all using (true) with check (true);

drop policy if exists monitor_logs_dev_all on public.monitor_logs;
create policy monitor_logs_dev_all on public.monitor_logs for all using (true) with check (true);

drop policy if exists feedback_dev_all on public.aprendizado_feedback;
create policy feedback_dev_all on public.aprendizado_feedback for all using (true) with check (true);

drop policy if exists base_conhecimento_dev_read on public.base_conhecimento_chunks;
create policy base_conhecimento_dev_read on public.base_conhecimento_chunks for select using (true);

create index if not exists idx_procedimentos_paciente_id on public.procedimentos(paciente_id);
create index if not exists idx_monitor_logs_procedimento_ts on public.monitor_logs(procedimento_id, timestamp_leitura desc);
create index if not exists idx_feedback_paciente on public.aprendizado_feedback(paciente_id);
create index if not exists idx_base_conhecimento_embedding on public.base_conhecimento_chunks using ivfflat (embedding vector_cosine_ops);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_pacientes_updated_at on public.pacientes;
create trigger trg_pacientes_updated_at
before update on public.pacientes
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_procedimentos_updated_at on public.procedimentos;
create trigger trg_procedimentos_updated_at
before update on public.procedimentos
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_planos_updated_at on public.planos_anestesicos;
create trigger trg_planos_updated_at
before update on public.planos_anestesicos
for each row execute procedure public.set_updated_at();
