-- Sprint 1 - Fundacao de auth/rbac/auditoria

create table if not exists public.roles (
  code text primary key,
  description text not null,
  created_at timestamptz not null default now()
);

insert into public.roles (code, description)
values
  ('admin', 'Acesso total ao sistema'),
  ('editor', 'Pode editar recursos tecnicos'),
  ('leitor', 'Somente leitura')
on conflict (code) do nothing;

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role_code text not null references public.roles(code),
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id bigserial primary key,
  actor_id uuid null references auth.users(id),
  actor_email text,
  action text not null,
  resource text not null,
  resource_id text,
  context jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_events_created_at on public.audit_events (created_at desc);
create index if not exists idx_audit_events_action on public.audit_events (action);
create index if not exists idx_audit_events_actor_email on public.audit_events (actor_email);

-- RLS
alter table public.user_profiles enable row level security;
alter table public.audit_events enable row level security;

-- Em Sprint 1 mantemos políticas básicas e restritivas.
create policy if not exists "user_profiles_read_own"
on public.user_profiles
for select
using (auth.uid() = user_id);

create policy if not exists "audit_events_no_direct_write"
on public.audit_events
for all
using (false)
with check (false);
