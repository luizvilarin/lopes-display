-- ═══════════════════════════════════════════════════════════════════════════
-- Lopes Digital Signage — Supabase Schema
-- Cole este arquivo no SQL Editor do Supabase e execute.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Unidades ─────────────────────────────────────────────────────────────────

create table if not exists unidades (
  id     text primary key,
  nome   text not null,
  handle text not null,
  ativo  boolean not null default true
);

insert into unidades values
  ('jd-goias', 'Lopes Jd. Goiás',       '@lopesjdgoias',     true),
  ('marista',  'Lopes Marista',           '@lopesmarista',     true),
  ('bueno',    'Lopes Bueno',             '@lopesbueno',       true),
  ('gestao',   'Gestão Patrimonial',      '@lopespatrimonial', true)
on conflict (id) do nothing;

-- ── Pessoas (Corretores e Gestores) ──────────────────────────────────────────

create table if not exists pessoas (
  id          uuid primary key default gen_random_uuid(),
  nome        text    not null,
  cargo       text    not null check (cargo in ('gestor', 'corretor')),
  unidade_id  text    references unidades(id) on delete set null,
  foto_url    text,
  ativo       boolean not null default true,
  criado_em   timestamptz default now()
);

create index if not exists pessoas_cargo_idx      on pessoas(cargo);
create index if not exists pessoas_unidade_idx    on pessoas(unidade_id);
create index if not exists pessoas_ativo_idx      on pessoas(ativo);

-- ── Configuração de Metas ─────────────────────────────────────────────────────

create table if not exists config_metas (
  id                    serial primary key,
  meta_mensal_titulo    text    not null default 'Meta Mensal',
  meta_mensal_valor     numeric not null default 20000000,
  meta_mensal_realizado numeric not null default 0,
  meta_mensal_periodo   text    not null default 'ANO DE 2026',
  meta_anual_titulo     text    not null default 'Meta Anual',
  meta_anual_valor      numeric not null default 240000000,
  meta_anual_realizado  numeric not null default 0,
  unidade_id            text    references unidades(id),
  atualizado_em         timestamptz default now()
);

-- Garante apenas uma linha de config (use id = 1 sempre)
insert into config_metas (
  meta_mensal_titulo, meta_mensal_valor, meta_mensal_realizado, meta_mensal_periodo,
  meta_anual_titulo,  meta_anual_valor,  meta_anual_realizado,  unidade_id
) values (
  'Meta de Maio', 20000000, 4720000, 'ANO DE 2026 - JD. GOIÁS',
  'Meta Anual',   240000000, 47300000, 'jd-goias'
) on conflict do nothing;

-- ── Ranking ──────────────────────────────────────────────────────────────────
-- Uma linha por posição, por semana/ano, por tipo e categoria.
-- tipo:      'mensal' | 'anual'
-- categoria: 'gestores' | 'corretores'

create table if not exists ranking_entries (
  id           uuid primary key default gen_random_uuid(),
  pessoa_id    uuid    references pessoas(id) on delete cascade,
  tipo         text    not null check (tipo in ('mensal', 'anual')),
  categoria    text    not null check (categoria in ('gestores', 'corretores')),
  posicao      integer not null check (posicao >= 1),
  valor        numeric not null default 0,
  periodo      text    not null,          -- ex: 'MAIO DE 2026'
  ativo        boolean not null default true,
  semana       integer,                   -- semana ISO do ano (1-53)
  ano          integer,
  criado_em    timestamptz default now(),
  atualizado_em timestamptz default now(),
  -- Evita posição duplicada na mesma semana/tipo/categoria
  unique nulls not distinct (tipo, categoria, posicao, semana, ano)
);

create index if not exists ranking_tipo_cat_idx on ranking_entries(tipo, categoria, ativo);
create index if not exists ranking_semana_idx   on ranking_entries(semana, ano);

-- ── Primeira Venda ────────────────────────────────────────────────────────────
-- Uma entrada ativa por semana. Desative a anterior antes de inserir nova.

create table if not exists primeira_venda (
  id         uuid primary key default gen_random_uuid(),
  pessoa_id  uuid    references pessoas(id) on delete cascade,
  mensagem   text    not null default 'Parabéns pela venda!',
  detalhe    text,
  ativo      boolean not null default true,
  semana     integer,
  ano        integer,
  criado_em  timestamptz default now()
);

create index if not exists pv_ativo_idx on primeira_venda(ativo);

-- ── Row Level Security (RLS) ──────────────────────────────────────────────────
-- Habilite RLS e crie políticas conforme sua estratégia de auth.
-- Exemplo básico: leitura pública, escrita apenas autenticado.

alter table unidades       enable row level security;
alter table pessoas        enable row level security;
alter table config_metas   enable row level security;
alter table ranking_entries enable row level security;
alter table primeira_venda enable row level security;

-- Leitura pública (o placar na TV não precisa de login)
create policy "leitura publica" on unidades        for select using (true);
create policy "leitura publica" on pessoas         for select using (ativo = true);
create policy "leitura publica" on config_metas    for select using (true);
create policy "leitura publica" on ranking_entries for select using (ativo = true);
create policy "leitura publica" on primeira_venda  for select using (ativo = true);

-- Escrita apenas para usuários autenticados (ajuste conforme roles)
create policy "escrita autenticada" on unidades        for all using (auth.role() = 'authenticated');
create policy "escrita autenticada" on pessoas         for all using (auth.role() = 'authenticated');
create policy "escrita autenticada" on config_metas    for all using (auth.role() = 'authenticated');
create policy "escrita autenticada" on ranking_entries for all using (auth.role() = 'authenticated');
create policy "escrita autenticada" on primeira_venda  for all using (auth.role() = 'authenticated');

-- ── View útil: ranking com dados da pessoa ────────────────────────────────────

create or replace view ranking_completo as
select
  r.*,
  p.nome        as pessoa_nome,
  p.cargo       as pessoa_cargo,
  p.foto_url    as pessoa_foto,
  p.unidade_id  as pessoa_unidade_id,
  u.nome        as unidade_nome
from ranking_entries r
join pessoas   p on p.id = r.pessoa_id
join unidades  u on u.id = p.unidade_id
where r.ativo = true
order by r.tipo, r.categoria, r.posicao;
