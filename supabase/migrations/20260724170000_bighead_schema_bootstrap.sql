-- BigHead schema bootstrap
-- This migration creates the dedicated schema for the BigHead system and
-- prepares the basic permissions/helpers needed by the follow-up table/function
-- migrations you will generate next.

create schema if not exists bighead;

grant usage on schema bighead to anon, authenticated, service_role;

create or replace function public.bighead_set_search_path(p_sql text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_sql is null or length(btrim(p_sql)) = 0 then
    raise exception 'empty sql';
  end if;

  execute format('set local search_path to bighead, public');
  execute p_sql;
end;
$$;

comment on schema bighead is 'Dedicated schema for the BigHead system.';
comment on function public.bighead_set_search_path(text) is
  'Executes a SQL block with search_path pinned to bighead, public.';
