-- Criação das tabelas de Pastas para a nova integração do Cultura Lopes

create table if not exists pastas (
  id          text primary key,
  titulo      text not null,
  meta_pastas integer not null default 30,
  ativo       boolean not null default true,
  criado_em   timestamptz default now()
);

create table if not exists ranking_pastas (
  id                text primary key,
  pasta_id          text references pastas(id) on delete cascade,
  pessoa_id         uuid references pessoas(id) on delete cascade,
  categoria         text not null check (categoria in ('gestor', 'corretor')),
  posicao           integer not null default 1,
  quantidade_pastas integer not null default 1,
  ativo             boolean not null default true,
  criado_em         timestamptz default now()
);

alter table pastas         enable row level security;
alter table ranking_pastas enable row level security;

create policy "acesso total publico pastas"         on pastas         for all using (true) with check (true);
create policy "acesso total publico ranking_pastas" on ranking_pastas for all using (true) with check (true);
