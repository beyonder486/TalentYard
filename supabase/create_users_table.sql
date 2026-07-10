-- Create the application users table used by TalentYard auth
create table if not exists public.users (
  id text primary key,
  name text not null,
  email text not null unique,
  role text not null check (role in ('Student', 'Freelancer', 'Client', 'Mentor')),
  passwordHash text not null,
  passwordSalt text not null,
  passwordIterations integer not null,
  createdAt timestamptz not null default now()
);
