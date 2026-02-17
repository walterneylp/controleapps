-- Sprint 2/3 - Inventario, segredos, assinaturas e anexos

create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  commercial_name text not null,
  description text,
  status text not null default 'ativo',
  tags text[] not null default '{}',
  owner text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hosting_entries (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  provider text not null,
  ip text not null,
  type text not null,
  region text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.domains (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  domain text not null,
  registrar text not null,
  status text not null default 'ativo',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_integrations (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  provider text not null,
  integration_name text not null,
  scope text,
  secret_ref_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.access_secrets (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  kind text not null,
  label text not null,
  encrypted_payload text not null,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  provider text not null,
  card_holder_name text not null,
  card_last4 text not null,
  recurrence text not null default 'mensal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  storage_path text not null,
  uploaded_by text,
  created_at timestamptz not null default now()
);

create index if not exists idx_apps_name on public.apps using gin (to_tsvector('simple', name || ' ' || coalesce(commercial_name, '')));
create index if not exists idx_domains_domain on public.domains (domain);
create index if not exists idx_hosting_entries_provider on public.hosting_entries (provider);
create index if not exists idx_access_secrets_app on public.access_secrets (app_id);
create index if not exists idx_subscriptions_app on public.subscriptions (app_id);
create index if not exists idx_attachments_app on public.attachments (app_id);
