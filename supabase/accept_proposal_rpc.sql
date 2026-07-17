-- ============================================================
-- TalentYard — Accept Proposal RPC & Schema Updates
-- Run this in your Supabase project → SQL Editor
-- ============================================================

-- 1. Update projects table constraint to allow 'in_progress'
alter table public.projects drop constraint if exists projects_status_check;
alter table public.projects add constraint projects_status_check check (status in ('active', 'closed', 'draft', 'in_progress'));

-- 2. Update proposals table constraint to allow 'accepted' and 'declined' (to match acceptance criteria strictly)
alter table public.proposals drop constraint if exists proposals_status_check;
alter table public.proposals add constraint proposals_status_check check (status in ('Pending Review', 'Accepted', 'Rejected', 'accepted', 'declined'));

-- 3. Create RPC function for secure transaction
create or replace function public.accept_proposal(p_proposal_id uuid, p_project_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- update project status
  update public.projects
  set status = 'in_progress'
  where id = p_project_id;
  
  -- update selected proposal
  update public.proposals
  set status = 'accepted'
  where id = p_proposal_id;
  
  -- decline others
  update public.proposals
  set status = 'declined'
  where project_id = p_project_id
    and id != p_proposal_id;
end;
$$;
