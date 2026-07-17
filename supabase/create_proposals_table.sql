-- ============================================================
-- TalentYard — proposals table setup
-- Run this in your Supabase project → SQL Editor
-- ============================================================

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) not null,
  student_id text not null,
  cover_letter text not null check (char_length(cover_letter) >= 100),
  bid_amount numeric not null check (bid_amount > 0),
  status text not null default 'Pending Review' check (status in ('Pending Review', 'Accepted', 'Rejected')),
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table public.proposals enable row level security;

create policy "anyone can read proposals"
  on public.proposals
  for select
  using (true);

create policy "anyone can insert proposals"
  on public.proposals
  for insert
  with check (true);
