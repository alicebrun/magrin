-- ========================================================================
--  Magrin — schéma de la base partagée
--  À coller dans Supabase : menu "SQL Editor" → New query → Run
-- ========================================================================

create table if not exists guests (
  id           text primary key,
  name         text not null,
  password     text not null,
  coming       text default 'oui',
  arrival      text,
  departure    text,
  train_status text default 'pas',
  train_day    text,
  train_time   text default '',
  train_city   text default '',
  created_at   timestamptz default now()
);

create table if not exists evenings (
  day     text primary key,
  chef    text,
  theme   text,
  photo   text,
  members jsonb default '[]'::jsonb
);

create table if not exists messages (
  id       text primary key,
  guest_id text,
  text     text,
  ts       bigint
);

-- --- Row Level Security : site privé sur invitation, accès anonyme autorisé ---
alter table guests   enable row level security;
alter table evenings enable row level security;
alter table messages enable row level security;

drop policy if exists "anon guests"   on guests;
drop policy if exists "anon evenings" on evenings;
drop policy if exists "anon messages" on messages;

create policy "anon guests"   on guests   for all using (true) with check (true);
create policy "anon evenings" on evenings for all using (true) with check (true);
create policy "anon messages" on messages for all using (true) with check (true);

-- --- Temps réel : pour que tout le monde voie les mises à jour en direct ---
alter publication supabase_realtime add table guests;
alter publication supabase_realtime add table evenings;
alter publication supabase_realtime add table messages;
