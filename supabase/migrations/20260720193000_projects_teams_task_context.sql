begin;

do $$ begin
  create type public.team_participant_kind as enum ('human', 'agent');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.team_status as enum ('active', 'archived');
exception when duplicate_object then null; end $$;

alter table public.projects
  add column if not exists description text,
  add column if not exists updated_by uuid references auth.users(id) on delete set null;

do $$ begin
  alter table public.projects
    add constraint projects_name_not_blank check (char_length(name) between 2 and 160);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.projects
    add constraint projects_slug_not_blank check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$');
exception when duplicate_object then null; end $$;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
  description text,
  status public.team_status not null default 'active',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_organizations (
  team_id uuid not null references public.teams(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (team_id, organization_id)
);

create table if not exists public.team_projects (
  team_id uuid not null references public.teams(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (team_id, project_id)
);

create table if not exists public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  participant_kind public.team_participant_kind not null,
  participant_id uuid not null,
  display_name text not null,
  email text,
  created_at timestamptz not null default now(),
  primary key (team_id, participant_kind, participant_id)
);

alter table public.tasks
  add column if not exists project_id uuid references public.projects(id) on delete set null,
  add column if not exists team_id uuid references public.teams(id) on delete set null;

create index if not exists tasks_project_idx on public.tasks(organization_id, project_id, created_at desc);
create index if not exists tasks_team_idx on public.tasks(organization_id, team_id, created_at desc);
create index if not exists projects_org_idx on public.projects(organization_id, created_at desc);
create index if not exists teams_status_idx on public.teams(status, created_at desc);

grant select, insert, update, delete on public.teams to authenticated;
grant select, insert, update, delete on public.team_organizations to authenticated;
grant select, insert, update, delete on public.team_projects to authenticated;
grant select, insert, update, delete on public.team_members to authenticated;

commit;
