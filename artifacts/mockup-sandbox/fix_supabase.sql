-- ── 1. Tabela de Pastas ────────────────────────────────────────────────────────
create table if not exists pastas (
  id          text primary key,
  titulo      text not null,
  meta_pastas integer not null default 30,
  ativo       boolean not null default true,
  criado_em   timestamptz default now()
);

-- ── 2. Ranking de Pastas ─────────────────────────────────────────────────────
create table if not exists ranking_pastas (
  id                uuid primary key default gen_random_uuid(),
  pasta_id          text references pastas(id) on delete cascade,
  pessoa_id         uuid references pessoas(id) on delete cascade,
  posicao           integer not null check (posicao >= 1),
  quantidade_pastas integer not null default 0,
  atualizado_em     timestamptz default now(),
  -- Evitar duplicidade de pessoa na mesma pasta
  unique (pasta_id, pessoa_id)
);

-- ── 3. Correção da Tabela ranking_entries ────────────────────────────────────
-- A restrição unique anterior causava conflito (Erro 409) ao tentar importar 
-- rankings de meses diferentes para a mesma posição.
alter table ranking_entries drop constraint if exists ranking_entries_tipo_categoria_posicao_semana_ano_key;
alter table ranking_entries drop constraint if exists ranking_entries_tipo_categoria_posicao_periodo_key;
alter table ranking_entries add constraint ranking_entries_tipo_categoria_posicao_periodo_key unique nulls not distinct (tipo, categoria, posicao, periodo);

-- ── 4. Políticas de Segurança (RLS) para as novas tabelas ───────────────────
alter table pastas         enable row level security;
alter table ranking_pastas enable row level security;

create policy "acesso total publico pastas"         on pastas         for all using (true) with check (true);
create policy "acesso total publico ranking_pastas" on ranking_pastas for all using (true) with check (true);
