-- 003: DB-backed sessions for custom auth on plain Postgres (Aiven).
-- auth.users is created by the migrate runner's Supabase-compat stub;
-- passwords are stored in encrypted_password (scrypt hash, same column
-- Supabase uses, so a future Supabase import stays compatible).

create table if not exists public.sessions (
  id text primary key,                     -- sha256 of the raw session token
  user_id uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  user_agent text,
  ip inet
);

create index if not exists idx_sessions_user_id on public.sessions(user_id);
create index if not exists idx_sessions_expires on public.sessions(expires_at);

-- Speed up the login lookup + seed data queries.
create index if not exists idx_auth_users_email on auth.users(email);

-- Rate limiting table (fixed-window counters; cheap and dependency-free).
create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 0,
  window_start timestamptz not null default now()
);
