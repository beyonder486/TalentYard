-- ============================================================
-- TalentYard — proposals table
-- Run this in your Supabase project → SQL Editor
-- ============================================================

drop table if exists public.proposals;

create table public.proposals (
  id              uuid        primary key default gen_random_uuid(),
  project_id      uuid        not null references public.projects(id) on delete cascade,
  freelancer_id   text        not null,
  freelancer_name text        not null,
  rate            numeric     not null,
  cover_letter    text        not null,
  created_at      timestamptz not null default now()
);

-- Enable RLS
alter table public.proposals enable row level security;

-- Policy: anyone can insert (since the frontend uses anon key)
create policy "anyone can insert proposals"
  on public.proposals
  for insert
  with check (true);

-- Policy: anyone can read proposals
create policy "anyone can read proposals"
  on public.proposals
  for select
  using (true);
