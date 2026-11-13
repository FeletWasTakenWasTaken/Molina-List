-- Pegar completo en Supabase > SQL Editor > Run

create table levels (
  id bigint primary key,          -- ID del nivel en Geometry Dash
  name text not null,
  creator text,
  aredl_rank int,                 -- top en la AREDL (null si no está)
  position int not null           -- puesto en MOLINA LIST
);

create table records (
  id bigserial primary key,
  level_id bigint not null references levels(id) on delete cascade,
  player text not null,
  percent int not null check (percent between 1 and 100),
  video_url text not null check (video_url ~* '^https?://'),
  created_at timestamptz not null default now()
);

alter table levels enable row level security;
alter table records enable row level security;

-- Cualquiera puede leer
create policy "leer niveles" on levels for select using (true);
create policy "leer records" on records for select using (true);

-- Solo un usuario con sesión iniciada (el admin) puede escribir
create policy "admin escribe niveles" on levels for all to authenticated using (true) with check (true);
create policy "admin escribe records" on records for all to authenticated using (true) with check (true);
