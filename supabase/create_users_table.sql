-- Create the application users table used by TalentYard auth
create table if not exists public.users (
  id text primary key,
  name text not null,
  email text not null unique,
  role text not null check (role in ('Student', 'Freelancer', 'Client', 'Mentor')),
  password_hash text not null,
  password_salt text not null,
  password_iterations integer not null,
  created_at timestamptz not null default now()
);
