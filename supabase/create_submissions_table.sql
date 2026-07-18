-- ============================================================
-- TalentYard — submissions table + projects status extension
-- Run this in your Supabase project → SQL Editor
-- ============================================================

-- 1. Extend the projects status check constraint to include
--    the two new workflow values needed for student submissions.
ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_status_check;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_status_check
  CHECK (status IN ('active', 'closed', 'draft', 'in_progress', 'under_review'));

-- 2. Add student_id to projects so we know who is working on it.
--    Nullable because existing rows and new listings don't have an assigned student yet.
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS student_id text REFERENCES public.users(id) ON DELETE SET NULL;

-- 3. Create the submissions table.
CREATE TABLE IF NOT EXISTS public.submissions (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id         uuid        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  student_id         text        NOT NULL REFERENCES public.users(id),
  submission_summary text        NOT NULL,
  deliverable_url    text        NOT NULL,
  submitted_at       timestamptz NOT NULL DEFAULT now()
);

-- 4. Row Level Security — students may read their own submissions.
--    All writes happen via the service-role key in the Next.js API route.
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read own submissions"
  ON public.submissions
  FOR SELECT
  USING (student_id = current_setting('app.current_user_id', true));

-- ── Optional seed: mark one project as in_progress for testing ──────────────
-- Replace <your-user-id> with the id from your users table.
-- UPDATE public.projects
--   SET status = 'in_progress', student_id = '<your-user-id>'
--   WHERE id = '<a-project-uuid>';
