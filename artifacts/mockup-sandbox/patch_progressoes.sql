-- Patch para criar a tabela de progressões de carreira

create table if not exists progressoes_carreira (
  id             uuid primary key default gen_random_uuid(),
  pessoa_id      uuid    references pessoas(id) on delete cascade,
  tipo           text    not null check (tipo in ('signature', 'promocao')),
  cargo_anterior text,
  cargo_novo     text,
  mensagem       text,
  foto_especifica text,
  ativo          boolean not null default true,
  criado_em      timestamptz default now()
);

alter table progressoes_carreira enable row level security;
create policy "acesso total publico progressoes_carreira" on progressoes_carreira for all using (true) with check (true);
