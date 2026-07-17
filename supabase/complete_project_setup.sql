-- ============================================================
-- TalentYard — Reviews Table & Complete Project RPC
-- Run this in your Supabase project → SQL Editor
-- ============================================================

-- 1. Create reviews table
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) not null,
  reviewer_id text not null,
  reviewee_id text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null check (char_length(comment) <= 1000),
  created_at timestamptz not null default now()
);

-- Row Level Security for reviews
alter table public.reviews enable row level security;

create policy "anyone can read reviews"
  on public.reviews
  for select
  using (true);

-- 2. Update projects table constraint to allow 'completed'
alter table public.projects drop constraint if exists projects_status_check;
alter table public.projects add constraint projects_status_check check (status in ('active', 'closed', 'draft', 'in_progress', 'completed'));

-- 3. Create RPC function for secure completion transaction
create or replace function public.complete_project(
  p_project_id uuid,
  p_reviewer_id text,
  p_reviewee_id text,
  p_rating integer,
  p_comment text
)
returns void
language plpgsql
security definer
as $$
begin
  -- update project status
  update public.projects
  set status = 'completed'
  where id = p_project_id;
  
  -- insert review
  insert into public.reviews (project_id, reviewer_id, reviewee_id, rating, comment)
  values (p_project_id, p_reviewer_id, p_reviewee_id, p_rating, p_comment);
end;
$$;
