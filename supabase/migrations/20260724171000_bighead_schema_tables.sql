-- BigHead schema tables
-- Operational data for the BigHead system lives inside the dedicated bighead schema.
-- Public schema remains reserved for global provisioning/control tables.

create extension if not exists pgcrypto;

create schema if not exists bighead;

create table if not exists bighead.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bighead.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid references auth.users(id) on delete set null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bighead.organization_members (
  organization_id uuid not null references bighead.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists bighead.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references bighead.organizations(id) on delete cascade,
  agent_id uuid,
  title text not null,
  objective text not null,
  metadata jsonb not null default '{}'::jsonb,
  requester_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bighead.runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references bighead.organizations(id) on delete cascade,
  task_id uuid not null references bighead.tasks(id) on delete cascade,
  workflow_version_id uuid,
  agent_id uuid,
  agent_version_id uuid,
  idempotency_key text not null,
  status text not null default 'queued',
  attempt integer not null default 0,
  max_attempts integer not null default 3,
  retry_backoff_seconds integer not null default 10,
  policy_snapshot jsonb not null default '{}'::jsonb,
  available_at timestamptz not null default now(),
  locked_by text,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, idempotency_key)
);

create index if not exists runs_dispatch_idx
  on bighead.runs (available_at, created_at)
  where status in ('queued', 'waiting', 'running');

create table if not exists bighead.event_outbox (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references bighead.organizations(id) on delete cascade,
  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid not null,
  payload jsonb not null default '{}'::jsonb,
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  locked_until timestamptz,
  locked_by text,
  last_error text,
  published_at timestamptz,
  dead_lettered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists event_outbox_pending_idx
  on bighead.event_outbox (available_at, created_at)
  where published_at is null and dead_lettered_at is null;

create table if not exists bighead.webhook_endpoints (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references bighead.organizations(id) on delete cascade,
  url text not null,
  event_types text[] not null default '{}'::text[],
  secret_reference text,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bighead.artifacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references bighead.organizations(id) on delete cascade,
  name text not null,
  kind text not null,
  storage_bucket text not null,
  storage_path text not null,
  checksum_sha256 text,
  mime_type text,
  size_bytes bigint,
  created_by uuid references auth.users(id) on delete set null,
  quarantine_status text not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  scan_attempts integer not null default 0,
  scan_available_at timestamptz not null default now(),
  scan_locked_by text,
  scan_locked_until timestamptz,
  scan_last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists artifacts_pending_scan_idx
  on bighead.artifacts (scan_available_at, created_at)
  where quarantine_status = 'pending';

create table if not exists bighead.anything_llm_ingestions (
  artifact_id uuid primary key references bighead.artifacts(id) on delete cascade,
  organization_id uuid not null references bighead.organizations(id) on delete cascade,
  workspace text not null,
  status text not null default 'pending',
  checksum_sha256 text not null,
  mime_type text,
  size_bytes bigint not null default 0,
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  locked_by text,
  locked_until timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists anything_llm_ingestions_pending_idx
  on bighead.anything_llm_ingestions (created_at, artifact_id)
  where status in ('pending', 'processing');

create table if not exists bighead.model_providers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references bighead.organizations(id) on delete cascade,
  name text not null,
  provider_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bighead.models (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references bighead.organizations(id) on delete cascade,
  provider_id uuid references bighead.model_providers(id) on delete set null,
  model_key text not null,
  input_cost_per_million numeric(12,2) not null default 0,
  output_cost_per_million numeric(12,2) not null default 0,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bighead.agents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references bighead.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists bighead.agent_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references bighead.organizations(id) on delete cascade,
  agent_id uuid not null references bighead.agents(id) on delete cascade,
  version integer not null,
  model_id uuid references bighead.models(id) on delete set null,
  system_prompt text not null default '',
  configuration jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, agent_id, version)
);

create table if not exists bighead.skills (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references bighead.organizations(id) on delete cascade,
  slug text not null,
  output_schema jsonb not null default '{}'::jsonb,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists bighead.agent_version_skills (
  organization_id uuid not null references bighead.organizations(id) on delete cascade,
  agent_version_id uuid not null references bighead.agent_versions(id) on delete cascade,
  skill_id uuid not null references bighead.skills(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (organization_id, agent_version_id, skill_id)
);

create table if not exists bighead.workflow_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references bighead.organizations(id) on delete cascade,
  definition jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bighead.qa_scorecards (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references bighead.organizations(id) on delete cascade,
  name text not null,
  version integer not null default 1,
  criteria jsonb not null default '[]'::jsonb,
  pass_threshold numeric(5,2) not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bighead.qa_evaluations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references bighead.organizations(id) on delete cascade,
  task_id uuid not null references bighead.tasks(id) on delete cascade,
  scorecard_id uuid not null references bighead.qa_scorecards(id) on delete cascade,
  score numeric(10,2) not null default 0,
  passed boolean not null default false,
  results jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bighead.cost_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references bighead.organizations(id) on delete cascade,
  provider_event_id text not null,
  amount numeric(12,2) not null default 0,
  input_tokens bigint not null default 0,
  output_tokens bigint not null default 0,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (organization_id, provider_event_id)
);

grant usage on schema bighead to anon, authenticated, service_role;
