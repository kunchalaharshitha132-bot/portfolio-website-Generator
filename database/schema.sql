-- Portfolio Website Generator schema. Run in Supabase > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique check (username ~ '^[a-z0-9_-]{3,20}$'),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists portfolios (
  user_id uuid primary key references users(id) on delete cascade,
  full_name text not null default '',
  headline text not null default '',
  bio text not null default '',
  theme text not null default 'ocean' check (theme in ('ocean','forest','sunset','mono')),
  public_email text not null default '',
  github text default '',
  linkedin text default '',
  updated_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  description text not null default '',
  link text default '',
  tech text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  level int not null check (level between 1 and 5),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists idx_projects_user on projects(user_id);
create index if not exists idx_skills_user on skills(user_id);

-- Row Level Security enabled with NO public policies: the browser (anon key)
-- can read nothing. Only our backend (service-role key) can access data.
alter table users enable row level security;
alter table portfolios enable row level security;
alter table projects enable row level security;
alter table skills enable row level security;
