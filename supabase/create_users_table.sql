-- Create the application users table used by TalentYard auth
-- NOTE: Column names must match exactly what exists in Supabase (no underscores)
create table if not exists public.users (
  id text primary key,
  name text not null,
  email text not null unique,
  role text not null check (role in ('Student', 'Freelancer', 'Client', 'Mentor')),
  passwordhash text not null,
  passwordsalt text not null,
  passworditerations integer not null,
  createdat timestamptz not null default now()
);
