-- ═══════════════════════════════════════════════════════════════════════════
-- LOPES DIGITAL SIGNAGE & PLACAR ENVOLVENTE — SETUP UNIFICADO DO BANCO DE DADOS
-- ═══════════════════════════════════════════════════════════════════════════
-- Copie todo este conteúdo, vá até o SQL Editor do painel do seu Supabase,
-- cole este script completo e clique em "Run" (Executar) para gerar toda a estrutura!

-- ── 1. Tabela de Unidades ────────────────────────────────────────────────────

create table if not exists unidades (
  id     text primary key,
  nome   text not null,
  handle text not null,
  ativo  boolean not null default true
);

-- Insere apenas as 4 unidades solicitadas
insert into unidades (id, nome, handle, ativo) values
  ('marista',  'Lopes Marista',      '@lopesmarista', true),
  ('jd-goias', 'Lopes Jardim Goiás', '@lopesjdgoias', true),
  ('bueno',    'Lopes Bueno',        '@lopesbueno',   true),
  ('oeste',    'Lopes Oeste',        '@lopesoeste',   true)
on conflict (id) do nothing;

-- ── 2. Pessoas (Corretores e Gestores) ────────────────────────────────────────

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

-- ── 3. Configuração de Metas (Placar Envolvente) ──────────────────────────────

create table if not exists config_metas (
  id                    serial primary key,
  meta_mensal_titulo    text    not null default 'Meta Mensal',
  meta_mensal_valor     numeric not null default 20000000,
  meta_mensal_realizado numeric not null default 0,
  meta_mensal_periodo   text    not null default 'MAIO DE 2026',
  meta_anual_titulo     text    not null default 'Meta Anual',
  meta_anual_valor      numeric not null default 240000000,
  meta_anual_realizado  numeric not null default 0,
  unidade_id            text    references unidades(id) on delete cascade unique,
  atualizado_em         timestamptz default now()
);

-- Cria as estruturas de metas prévias (zeradas) para cada unidade
insert into config_metas (unidade_id, meta_mensal_titulo, meta_mensal_valor, meta_mensal_realizado, meta_anual_titulo, meta_anual_valor, meta_anual_realizado) values
  ('marista',  'Meta do Mês', 20000000, 0, 'Meta Anual 2026', 240000000, 0),
  ('jd-goias', 'Meta do Mês', 20000000, 0, 'Meta Anual 2026', 240000000, 0),
  ('bueno',    'Meta do Mês', 20000000, 0, 'Meta Anual 2026', 240000000, 0),
  ('oeste',    'Meta do Mês', 20000000, 0, 'Meta Anual 2026', 240000000, 0)
on conflict (unidade_id) do nothing;

-- ── 4. Ranking Semanal e Mensal (Placar Envolvente) ───────────────────────────

create table if not exists ranking_entries (
  id           uuid primary key default gen_random_uuid(),
  pessoa_id    uuid    references pessoas(id) on delete cascade,
  tipo         text    not null check (tipo in ('mensal', 'anual')),
  categoria    text    not null check (categoria in ('gestores', 'corretores')),
  posicao      integer not null check (posicao >= 1),
  valor        numeric not null default 0,
  periodo      text    not null,          -- ex: 'MAIO DE 2026'
  ativo        boolean not null default true,
  semana       integer,                   -- semana ISO (1-53)
  ano          integer,
  criado_em    timestamptz default now(),
  atualizado_em timestamptz default now(),
  -- Garante unicidade por tipo/posicao/semana para evitar colisões
  unique nulls not distinct (tipo, categoria, posicao, semana, ano)
);

create index if not exists ranking_tipo_cat_idx on ranking_entries(tipo, categoria, ativo);
create index if not exists ranking_semana_idx   on ranking_entries(semana, ano);

-- ── 5. Primeira Venda da Semana (Placar Envolvente) ────────────────────────────

create table if not exists primeira_venda (
  id         uuid primary key default gen_random_uuid(),
  pessoa_id  uuid    references pessoas(id) on delete cascade,
  mensagem   text    not null default 'Parabéns pela primeira venda da semana!',
  detalhe    text,
  ativo      boolean not null default true,
  semana     integer,
  ano        integer,
  criado_em  timestamptz default now()
);

create index if not exists pv_ativo_idx on primeira_venda(ativo);

-- ── 6. Tabela de Imóveis (Digital Signage) ─────────────────────────────────────

create table if not exists imoveis (
  id          serial primary key,
  unidade_id  text    references unidades(id) on delete cascade,
  title       text    not null,
  price       text    not null,
  area        text    not null,
  rooms       text    not null,
  garage      text    not null,
  address     text    not null,
  tag         text    not null,
  tag_color   text    not null default '#E30613',
  gradient    text    not null default 'linear-gradient(160deg,#0d2340,#1a3d6b)',
  image_url   text,
  qr_code_url text,
  video_url   text,
  ativo       boolean not null default true,
  description text,
  criado_em   timestamptz default now()
);

create index if not exists imoveis_unidade_idx on imoveis(unidade_id);
create index if not exists imoveis_ativo_idx   on imoveis(ativo);

-- ── 7. Tabela de Configurações do Painel / TV (Digital Signage) ─────────────────

create table if not exists signage_settings (
  id                    serial primary key,
  unidade_id            text references unidades(id) on delete cascade unique,
  theme                 text not null default 'dark' check (theme in ('dark', 'light')),
  auto_rotate           boolean not null default true,
  rot_interval          integer not null default 8,
  timer_label1          text not null default 'Vendas',
  timer_label2          text not null default 'Meta Diária',
  timer_label3          text not null default 'Aproveite as Ofertas',
  timer_seconds         integer not null default 600,
  atualizado_em         timestamptz default now()
);

-- Cria as configurações padrão iniciais para cada unidade
insert into signage_settings (unidade_id) values
  ('marista'), ('jd-goias'), ('bueno'), ('oeste')
on conflict (unidade_id) do nothing;

-- ── 8. View Auxiliar de Ranking ────────────────────────────────────────────────

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

-- ── 9. Configurações Administrativas / Senha (PIN) ─────────────────────────────

create table if not exists admin_auth (
  id    serial primary key,
  pin   text not null default '2025'
);

insert into admin_auth (id, pin) values (1, '2025')
on conflict (id) do nothing;

-- ── 10. Políticas de Segurança (Row Level Security - RLS) ────────────────────────

alter table unidades         enable row level security;
alter table pessoas          enable row level security;
alter table config_metas     enable row level security;
alter table ranking_entries   enable row level security;
alter table primeira_venda   enable row level security;
alter table imoveis          enable row level security;
alter table signage_settings enable row level security;
alter table admin_auth       enable row level security;

-- ATENÇÃO: Para simplificar a operação local e permitir que o painel administrativo
-- grave os dados diretamente do front-end sem forçar um sistema complexo de login OAuth,
-- as políticas abaixo permitem LEITURA e ESCRITA de qualquer usuário (incluindo anon/chave de API).
-- Caso queira fechar o banco no futuro, altere para "auth.role() = 'authenticated'".

create policy "acesso total publico unidades"         on unidades         for all using (true) with check (true);
create policy "acesso total publico pessoas"          on pessoas          for all using (true) with check (true);
create policy "acesso total publico config_metas"     on config_metas     for all using (true) with check (true);
create policy "acesso total publico ranking_entries"   on ranking_entries   for all using (true) with check (true);
create policy "acesso total publico primeira_venda"   on primeira_venda   for all using (true) with check (true);
create policy "acesso total publico imoveis"          on imoveis          for all using (true) with check (true);
create policy "acesso total publico signage_settings" on signage_settings for all using (true) with check (true);
create policy "acesso total publico admin_auth"       on admin_auth       for all using (true) with check (true);
