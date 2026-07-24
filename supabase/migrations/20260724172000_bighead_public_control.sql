-- Global provisioning/control tables live in public.
-- These tables index all systems and orchestrate schema creation per project.

create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'active' check (status in ('active', 'archived', 'pending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null unique,
  business_type text not null check (business_type in ('blog', 'store', 'saas', 'custom')),
  name text not null,
  version text not null default '1.0.0',
  source_path text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  name text not null,
  slug text not null unique,
  business_type text not null check (business_type in ('blog', 'store', 'saas', 'custom')),
  template_key text not null,
  schema_name text not null unique,
  domain text,
  language text not null default 'pt',
  status text not null default 'pending' check (status in ('pending', 'active', 'archived', 'error')),
  template_version text not null default '1.0.0',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_org_idx
  on public.projects (organization_id, created_at desc);

create table if not exists public.provisioning_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  job_type text not null check (job_type in ('create_project', 'upgrade_template', 'rebuild_schema')),
  status text not null default 'pending' check (status in ('pending', 'running', 'success', 'error')),
  input_payload jsonb not null default '{}'::jsonb,
  output_payload jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists provisioning_jobs_project_id_idx
  on public.provisioning_jobs (project_id);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid,
  project_id uuid references public.projects(id) on delete set null,
  action text not null,
  resource_type text,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language plpgsql
security invoker
as $$
begin
  return true;
end;
$$;

create or replace function public.create_blog_schema(p_schema_name text)
returns void
language plpgsql
security definer
as $$
begin
  execute format('create schema if not exists %I', p_schema_name);
  execute format('create table if not exists %I.categories (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, created_at timestamptz not null default now(), updated_at timestamptz not null default now())', p_schema_name);
  execute format('create table if not exists %I.authors (id uuid primary key default gen_random_uuid(), name text not null, bio text, created_at timestamptz not null default now(), updated_at timestamptz not null default now())', p_schema_name);
  execute format('create table if not exists %I.tags (id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique, created_at timestamptz not null default now(), updated_at timestamptz not null default now())', p_schema_name);
  execute format('create table if not exists %I.articles (id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null, excerpt text, content text, image_url text, description text, prompt_image text, search_terms text, status text not null default ''DRAFT'', published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), language text not null default ''pt'')', p_schema_name);
  execute format('create table if not exists %I.article_tags (id uuid primary key default gen_random_uuid(), article_id uuid not null, tag_id uuid not null, created_at timestamptz not null default now())', p_schema_name);
  execute format('create table if not exists %I.media_assets (id uuid primary key default gen_random_uuid(), path text not null, url text not null, mime_type text, alt_text text, metadata jsonb not null default ''{}''::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now())', p_schema_name);
  execute format('create table if not exists %I.redirects (id uuid primary key default gen_random_uuid(), from_path text not null unique, to_path text not null, status_code integer not null default 301, created_at timestamptz not null default now(), updated_at timestamptz not null default now())', p_schema_name);
  execute format('create table if not exists %I.seo_pages (id uuid primary key default gen_random_uuid(), article_id uuid, canonical_url text, meta_title text, meta_description text, og_image text, created_at timestamptz not null default now(), updated_at timestamptz not null default now())', p_schema_name);
  execute format('create table if not exists %I.settings (id uuid primary key default gen_random_uuid(), key text not null unique, value jsonb not null default ''{}''::jsonb, is_public boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now())', p_schema_name);
  execute format('create table if not exists %I.theme_tokens (id uuid primary key default gen_random_uuid(), version integer not null default 1, is_active boolean not null default false, name text not null, source_reference text, tokens jsonb not null default ''{}''::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now())', p_schema_name);
  execute format('create table if not exists %I.layout_templates (id uuid primary key default gen_random_uuid(), page_type text not null, name text not null, is_active boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now())', p_schema_name);
  execute format('create table if not exists %I.layout_blocks (id uuid primary key default gen_random_uuid(), layout_template_id uuid not null, block_type text not null, position integer not null, is_visible boolean not null default true, config jsonb not null default ''{}''::jsonb, created_at timestamptz not null default now())', p_schema_name);
  execute format('create table if not exists %I.field_bindings (id uuid primary key default gen_random_uuid(), block_type text not null, slot_name text not null, source_table text not null, source_column text not null, transform text)', p_schema_name);
  execute format('create table if not exists %I.ad_slots (id uuid primary key default gen_random_uuid(), layout_template_id uuid, slot_key text not null, provider text not null default ''gam'', ad_unit_id text, gam_ad_unit_path text, size_mapping jsonb not null default ''[]''::jsonb, is_enabled boolean not null default true, created_at timestamptz not null default now())', p_schema_name);
  execute format('create table if not exists %I.direct_campaigns (id uuid primary key default gen_random_uuid(), ad_slot_id uuid not null, partner_name text not null, creative_url text not null, click_url text not null, weight integer not null default 1, starts_at timestamptz not null default now(), ends_at timestamptz, impression_count bigint not null default 0, click_count bigint not null default 0, is_active boolean not null default true, created_at timestamptz not null default now())', p_schema_name);
  execute format('create table if not exists %I.ad_network_partners (id uuid primary key default gen_random_uuid(), name text not null, seller_id text, tax_id text, ad_network_line text not null, is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now())', p_schema_name);
  execute format('create table if not exists %I.site_config (id uuid primary key default gen_random_uuid(), logo_url text, favicon_url text, nav_items jsonb not null default ''[]''::jsonb, footer_config jsonb not null default ''{}''::jsonb, social_links jsonb not null default ''{}''::jsonb, active_theme_id uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now())', p_schema_name);
end;
$$;

create or replace function public.create_store_schema(p_schema_name text)
returns void
language plpgsql
security definer
as $$
begin
  execute format('create schema if not exists %I', p_schema_name);
  execute format('create table if not exists %I.products (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, price numeric(12,2) not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now())', p_schema_name);
end;
$$;

create or replace function public.create_saas_schema(p_schema_name text)
returns void
language plpgsql
security definer
as $$
begin
  execute format('create schema if not exists %I', p_schema_name);
  execute format('create table if not exists %I.workspaces (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, created_at timestamptz not null default now(), updated_at timestamptz not null default now())', p_schema_name);
end;
$$;

create or replace function public.create_custom_schema(p_schema_name text)
returns void
language plpgsql
security definer
as $$
begin
  execute format('create schema if not exists %I', p_schema_name);
  execute format('create table if not exists %I.entities (id uuid primary key default gen_random_uuid(), key text not null unique, name text not null, type text not null, metadata jsonb not null default ''{}''::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now())', p_schema_name);
end;
$$;

create or replace function public.provision_project(
  p_name text,
  p_slug text,
  p_business_type text,
  p_template_key text,
  p_domain text default null,
  p_language text default 'pt',
  p_organization_id uuid default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_project_id uuid;
  v_schema_name text;
begin
  v_schema_name := case p_business_type
    when 'blog' then 'blog_' || p_slug
    when 'store' then 'store_' || p_slug
    when 'saas' then 'saas_' || p_slug
    else 'custom_' || p_slug
  end;

  insert into public.projects (
    organization_id, name, slug, business_type, template_key, schema_name, domain, language, status, template_version
  ) values (
    p_organization_id, p_name, p_slug, p_business_type, p_template_key, v_schema_name, p_domain, p_language, 'pending',
    coalesce((select version from public.templates where template_key = p_template_key), '1.0.0')
  ) returning id into v_project_id;

  insert into public.provisioning_jobs (project_id, job_type, status, input_payload)
  values (
    v_project_id, 'create_project', 'running',
    jsonb_build_object('name', p_name, 'slug', p_slug, 'business_type', p_business_type, 'template_key', p_template_key, 'schema_name', v_schema_name)
  );

  if p_business_type = 'blog' then
    perform public.create_blog_schema(v_schema_name);
  elsif p_business_type = 'store' then
    perform public.create_store_schema(v_schema_name);
  elsif p_business_type = 'saas' then
    perform public.create_saas_schema(v_schema_name);
  else
    perform public.create_custom_schema(v_schema_name);
  end if;

  update public.projects set status = 'active' where id = v_project_id;
  update public.provisioning_jobs
    set status = 'success', output_payload = jsonb_build_object('schema_name', v_schema_name), finished_at = now()
    where project_id = v_project_id;

  insert into public.audit_logs (project_id, action, resource_type, resource_id, metadata)
  values (v_project_id, 'project.provisioned', 'project', v_project_id::text, jsonb_build_object('schema_name', v_schema_name));

  return v_project_id;
exception when others then
  update public.projects set status = 'error' where id = v_project_id;
  update public.provisioning_jobs
    set status = 'error', error_message = sqlerrm, finished_at = now()
    where project_id = v_project_id;
  raise;
end;
$$;

create or replace function public.execute_project_schema_sql(
  p_schema_name text,
  p_sql text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_schema_name is null or p_schema_name !~ '^[a-z][a-z0-9_]*$' then
    raise exception 'invalid schema name';
  end if;
  if p_sql is null or length(btrim(p_sql)) = 0 then
    raise exception 'empty sql';
  end if;
  execute format('set local search_path to %I, public', p_schema_name);
  execute p_sql;
  return jsonb_build_object('schema_name', p_schema_name, 'status', 'success');
end;
$$;

