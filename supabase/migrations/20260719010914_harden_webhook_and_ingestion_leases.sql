begin;

-- Fail closed for future Data API objects. Every client grant must be explicit
-- in the migration that creates the object.
alter default privileges for role postgres in schema public
  revoke all on tables from public, anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from public, anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;
revoke truncate, references, trigger on all tables in schema public from anon, authenticated;

-- PostgreSQL does not index the referencing side of foreign keys. These
-- non-partial indexes keep parent updates/deletes and tenant joins bounded.
create index embedding_activation_context_run_fk_idx
  on private.embedding_activation_context(run_id);
create index embedding_reindex_runs_requested_by_fk_idx
  on private.embedding_reindex_runs(requested_by);
create index embedding_reindex_runs_target_profile_fk_idx
  on private.embedding_reindex_runs(target_profile_id);
create index legal_holds_created_by_fk_idx on private.legal_holds(created_by);
create index legal_holds_subject_user_fk_idx on private.legal_holds(subject_user_id);
create index legal_holds_organization_fk_idx on private.legal_holds(organization_id);
create index privacy_requests_requested_by_fk_idx on private.privacy_requests(requested_by);
create index privacy_requests_subject_user_fk_idx on private.privacy_requests(subject_user_id);
create index retention_policies_updated_by_fk_idx on private.retention_policies(updated_by);
create index run_llm_context_tenant_run_fk_idx
  on private.run_llm_context(organization_id, run_id);
create index webhook_deliveries_event_fk_idx on private.webhook_deliveries(event_id);
create index webhook_deliveries_organization_fk_idx
  on private.webhook_deliveries(organization_id);
create index crm_connections_created_by_fk_idx on public.crm_connections(created_by);
create index crm_effect_ledger_connection_fk_idx
  on public.crm_effect_ledger(organization_id, connection_id);
create index crm_external_links_connection_fk_idx
  on public.crm_external_links(organization_id, connection_id);
create index crm_import_rows_account_fk_idx
  on public.crm_import_rows(organization_id, account_id);
create index crm_import_rows_contact_fk_idx
  on public.crm_import_rows(organization_id, contact_id);
create index crm_import_rows_lead_fk_idx
  on public.crm_import_rows(organization_id, lead_id);
create index crm_imports_created_by_fk_idx on public.crm_imports(created_by);
create index crm_imports_resume_fk_idx on public.crm_imports(organization_id, resume_of_id);
create index crm_sync_cursors_connection_fk_idx
  on public.crm_sync_cursors(organization_id, connection_id);
create index crm_sync_jobs_connection_fk_idx
  on public.crm_sync_jobs(organization_id, connection_id);
create index crm_webhook_inbox_connection_fk_idx
  on public.crm_webhook_inbox(organization_id, connection_id);
create index knowledge_chunks_embedding_profile_fk_idx
  on public.knowledge_chunks(embedding_profile_id);
create index memory_items_embedding_profile_fk_idx
  on public.memory_items(embedding_profile_id);
create index runs_agent_fk_idx on public.runs(agent_id);
create index runs_tenant_agent_fk_idx on public.runs(organization_id, agent_id);
create index runs_agent_version_fk_idx on public.runs(agent_version_id);
create index runs_tenant_agent_version_fk_idx
  on public.runs(organization_id, agent_version_id);
create index crm_accounts_merged_into_fk_idx
  on public.crm_accounts(organization_id, merged_into_id);
create index notifications_user_fk_idx on public.notifications(user_id);
create index organization_members_user_fk_idx on public.organization_members(user_id);
create index tasks_assignee_fk_idx on public.tasks(assignee_id);

-- A worker name is not a fencing token: processes can restart with the same
-- name while a stale attempt is still running. Each claim therefore receives
-- an opaque token and terminal writes require that token and a live lease.
alter table private.webhook_deliveries
  add column lease_token uuid;

drop function public.claim_webhook_deliveries(text, integer, integer);
create function public.claim_webhook_deliveries(
  p_worker text, p_limit integer default 25, p_lease_seconds integer default 30
)
returns table (
  id uuid, organization_id uuid, endpoint_id uuid, event_id uuid, url text,
  secret_reference text, event_type text, aggregate_type text,
  aggregate_id uuid, payload jsonb, attempts integer, lease_token uuid
)
language plpgsql security definer set search_path = '' as $$
begin
  if p_worker is null or char_length(p_worker) not between 1 and 200 then
    raise exception 'invalid_worker';
  end if;
  if p_limit not between 1 and 100 or p_lease_seconds not between 1 and 86400 then
    raise exception 'invalid_lease_parameters';
  end if;

  update private.webhook_deliveries d
     set status='retrying', locked_by=null, locked_until=null, lease_token=null,
         available_at=now(), last_error=coalesce(d.last_error,'worker_lease_expired'),
         updated_at=now()
   where d.status='delivering' and d.locked_until<now();

  insert into private.webhook_deliveries(organization_id,endpoint_id,event_id)
  select e.organization_id,w.id,e.id from public.event_outbox e
  join public.webhook_endpoints w on w.organization_id=e.organization_id
   and w.is_enabled and e.event_type=any(w.event_types) and e.created_at>=w.created_at
  on conflict on constraint webhook_deliveries_endpoint_id_event_id_key do nothing;

  return query with candidates as (
    select d.id from private.webhook_deliveries d
     where d.status in ('pending','retrying') and d.available_at<=now()
       and (d.locked_until is null or d.locked_until<now())
     order by d.available_at,d.created_at
     for update skip locked limit p_limit
  ), claimed as (
    update private.webhook_deliveries d
       set status='delivering', attempts=d.attempts+1, locked_by=p_worker,
           locked_until=now()+make_interval(secs=>p_lease_seconds),
           lease_token=gen_random_uuid(), updated_at=now()
      from candidates c where d.id=c.id returning d.*
  )
  select c.id,c.organization_id,c.endpoint_id,c.event_id,w.url,w.secret_reference,
         e.event_type,e.aggregate_type,e.aggregate_id,e.payload,c.attempts,c.lease_token
    from claimed c join public.webhook_endpoints w on w.id=c.endpoint_id
    join public.event_outbox e on e.id=c.event_id;
end $$;

drop function public.ack_webhook_delivery(uuid, text, integer, text);
create function public.ack_webhook_delivery(
  p_id uuid, p_worker text, p_lease_token uuid,
  p_response_status integer, p_response_body_hash text
) returns boolean language plpgsql security definer set search_path = '' as $$
declare changed integer;
begin
  update private.webhook_deliveries
     set status='delivered', delivered_at=now(), response_status=p_response_status,
         response_body_hash=p_response_body_hash, last_error=null, locked_by=null,
         locked_until=null, lease_token=null, updated_at=now()
   where id=p_id and locked_by=p_worker and lease_token=p_lease_token
     and status='delivering' and locked_until>=now();
  get diagnostics changed = row_count;
  return changed=1;
end $$;

drop function public.nack_webhook_delivery(uuid, text, text, integer, integer);
create function public.nack_webhook_delivery(
  p_id uuid, p_worker text, p_lease_token uuid, p_error text,
  p_response_status integer default null, p_max_attempts integer default 8
) returns boolean language plpgsql security definer set search_path = '' as $$
declare changed integer;
begin
  update private.webhook_deliveries set
    status=case when attempts>=p_max_attempts then 'dead_letter' else 'retrying' end,
    dead_lettered_at=case when attempts>=p_max_attempts then now() else null end,
    available_at=now()+make_interval(secs=>least(300,power(2,attempts)::integer)),
    response_status=p_response_status,last_error=left(p_error,2000),
    locked_by=null,locked_until=null,lease_token=null,updated_at=now()
   where id=p_id and locked_by=p_worker and lease_token=p_lease_token
     and status='delivering' and locked_until>=now();
  get diagnostics changed = row_count;
  return changed=1;
end $$;

revoke execute on function public.claim_webhook_deliveries(text,integer,integer),
  public.ack_webhook_delivery(uuid,text,uuid,integer,text),
  public.nack_webhook_delivery(uuid,text,uuid,text,integer,integer)
from public, anon, authenticated;
grant execute on function public.claim_webhook_deliveries(text,integer,integer),
  public.ack_webhook_delivery(uuid,text,uuid,integer,text),
  public.nack_webhook_delivery(uuid,text,uuid,text,integer,integer)
to service_role;

-- The AnythingLLM adapter can run outside a transaction. Lease metadata lets
-- the service reject overlapping attempts and prevents stale completion.
alter table public.anything_llm_ingestions
  add column attempts integer not null default 0 check (attempts >= 0),
  add column available_at timestamptz not null default now(),
  add column locked_by text,
  add column locked_until timestamptz,
  add column lease_token uuid;

revoke insert, update on public.anything_llm_ingestions from authenticated;
drop policy if exists anything_llm_ingestions_manage_insert
  on public.anything_llm_ingestions;
drop policy if exists anything_llm_ingestions_manage_update
  on public.anything_llm_ingestions;

create index anything_llm_ingestions_claim_idx
  on public.anything_llm_ingestions(available_at, created_at, artifact_id)
  where status = 'pending';

create function public.claim_anything_llm_ingestions(
  p_worker text, p_limit integer default 10, p_lease_seconds integer default 120
)
returns table (
  artifact_id uuid, organization_id uuid, workspace text, artifact_name text,
  storage_bucket text, storage_path text, checksum_sha256 text,
  attempts integer, lease_token uuid
)
language plpgsql security definer set search_path = '' as $$
begin
  if p_worker is null or char_length(p_worker) not between 1 and 200 then
    raise exception 'invalid_worker';
  end if;
  if p_limit not between 1 and 100 or p_lease_seconds not between 1 and 86400 then
    raise exception 'invalid_lease_parameters';
  end if;

  update public.anything_llm_ingestions i
     set status='pending', available_at=now(), locked_by=null, locked_until=null,
         lease_token=null, error_code='WORKER_LEASE_EXPIRED',
         error_message='Worker lease expired before completion', updated_at=now()
   where i.status='processing' and i.locked_until<now();

  return query with candidates as (
    select i.artifact_id
      from public.anything_llm_ingestions i
      join public.artifacts a on a.organization_id=i.organization_id
       and a.id=i.artifact_id and a.quarantine_status='clean'
     where i.status='pending' and i.available_at<=now()
       and (i.locked_until is null or i.locked_until<now())
     order by i.available_at,i.created_at,i.artifact_id
     for update of i skip locked limit p_limit
  ), claimed as (
    update public.anything_llm_ingestions i
       set status='processing', attempts=i.attempts+1, locked_by=p_worker,
           locked_until=now()+make_interval(secs=>p_lease_seconds),
           lease_token=gen_random_uuid(), workspace=o.slug,
           error_code=null, error_message=null, updated_at=now()
      from candidates c, public.organizations o
     where i.artifact_id=c.artifact_id and o.id=i.organization_id
    returning i.*
  )
  select c.artifact_id,c.organization_id,c.workspace,a.name,a.storage_bucket,
         a.storage_path,c.checksum_sha256,c.attempts,c.lease_token
    from claimed c
    join public.artifacts a on a.organization_id=c.organization_id
     and a.id=c.artifact_id;
end $$;

create function public.ack_anything_llm_ingestion(
  p_artifact_id uuid, p_worker text, p_lease_token uuid, p_external_document_id text
) returns boolean language plpgsql security definer set search_path = '' as $$
declare changed integer;
begin
  if p_external_document_id is null or btrim(p_external_document_id)='' then
    raise exception 'invalid_external_document_id';
  end if;
  update public.anything_llm_ingestions
     set status='success', external_document_id=p_external_document_id,
         embeddings_updated_at=now(), error_code=null, error_message=null,
         locked_by=null, locked_until=null, lease_token=null, updated_at=now()
   where artifact_id=p_artifact_id and locked_by=p_worker
     and lease_token=p_lease_token and status='processing' and locked_until>=now();
  get diagnostics changed = row_count;
  return changed=1;
end $$;

create function public.nack_anything_llm_ingestion(
  p_artifact_id uuid, p_worker text, p_lease_token uuid, p_error_code text,
  p_error_message text, p_max_attempts integer default 8
) returns boolean language plpgsql security definer set search_path = '' as $$
declare changed integer;
begin
  if p_max_attempts not between 1 and 100 then
    raise exception 'invalid_max_attempts';
  end if;
  update public.anything_llm_ingestions set
    status=case when attempts>=p_max_attempts then 'failed' else 'pending' end,
    available_at=case when attempts>=p_max_attempts then now()
      else now()+make_interval(secs=>least(300,power(2,attempts)::integer)) end,
    error_code=left(coalesce(nullif(p_error_code,''),'INGESTION_FAILED'),120),
    error_message=left(coalesce(p_error_message,'Unknown ingestion failure'),1000),
    locked_by=null,locked_until=null,lease_token=null,updated_at=now()
   where artifact_id=p_artifact_id and locked_by=p_worker
     and lease_token=p_lease_token and status='processing' and locked_until>=now();
  get diagnostics changed = row_count;
  return changed=1;
end $$;

revoke execute on function public.claim_anything_llm_ingestions(text,integer,integer),
  public.ack_anything_llm_ingestion(uuid,text,uuid,text),
  public.nack_anything_llm_ingestion(uuid,text,uuid,text,text,integer)
from public, anon, authenticated;
grant execute on function public.claim_anything_llm_ingestions(text,integer,integer),
  public.ack_anything_llm_ingestion(uuid,text,uuid,text),
  public.nack_anything_llm_ingestion(uuid,text,uuid,text,text,integer)
to service_role;

commit;
