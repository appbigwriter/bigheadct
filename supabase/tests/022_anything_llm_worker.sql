begin;
select plan(9);

select has_function('public','claim_anything_llm_ingestions',array['text','integer','integer'],'ingestion claim RPC exists');
select has_function('public','ack_anything_llm_ingestion',array['uuid','text','uuid','text'],'ingestion ack RPC exists');
select has_function('public','nack_anything_llm_ingestion',array['uuid','text','uuid','text','text','integer'],'ingestion nack RPC exists');
select ok(not has_function_privilege('authenticated','public.claim_anything_llm_ingestions(text,integer,integer)','EXECUTE'),'clients cannot claim ingestion work');

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,created_at,updated_at)
values ('8a000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','ingestion@example.test','',now(),now());
insert into public.profiles(id,display_name)
values ('8a000000-0000-0000-0000-000000000001','Ingestion Owner');
insert into public.organizations(id,name,slug,created_by)
values ('8a100000-0000-0000-0000-000000000001','Ingestion Tenant','derived-tenant-slug','8a000000-0000-0000-0000-000000000001');
insert into public.artifacts(id,organization_id,name,kind,storage_bucket,storage_path,checksum_sha256,mime_type,size_bytes,quarantine_status)
values
 ('8a200000-0000-0000-0000-000000000001','8a100000-0000-0000-0000-000000000001','one.pdf','document','artifacts','tenant/one.pdf',repeat('a',64),'application/pdf',10,'clean'),
 ('8a200000-0000-0000-0000-000000000002','8a100000-0000-0000-0000-000000000001','two.pdf','document','artifacts','tenant/two.pdf',repeat('b',64),'application/pdf',20,'clean');
insert into public.anything_llm_ingestions(artifact_id,organization_id,workspace,status,checksum_sha256,mime_type,size_bytes,created_at)
values
 ('8a200000-0000-0000-0000-000000000001','8a100000-0000-0000-0000-000000000001','untrusted-input','pending',repeat('a',64),'application/pdf',10,now()-interval '1 minute'),
 ('8a200000-0000-0000-0000-000000000002','8a100000-0000-0000-0000-000000000001','untrusted-input','pending',repeat('b',64),'application/pdf',20,now());

set local role service_role;
create temporary table first_ingestion_claim as
select * from public.claim_anything_llm_ingestions('worker-a',1,60);
select is((select count(*) from first_ingestion_claim),1::bigint,'worker claims one ingestion atomically');
select is((select workspace from first_ingestion_claim),'derived-tenant-slug','claim derives workspace from tenant slug');
select ok(not public.ack_anything_llm_ingestion(
  (select artifact_id from first_ingestion_claim),'worker-a',gen_random_uuid(),'doc/wrong.pdf'
),'stale fencing token cannot acknowledge');
select ok(public.ack_anything_llm_ingestion(
  (select artifact_id from first_ingestion_claim),'worker-a',(select lease_token from first_ingestion_claim),'doc/one.pdf'
),'live fencing token acknowledges ingestion');

create temporary table second_ingestion_claim as
select * from public.claim_anything_llm_ingestions('worker-b',1,60);
select ok(public.nack_anything_llm_ingestion(
  (select artifact_id from second_ingestion_claim),'worker-b',(select lease_token from second_ingestion_claim),
  'PROVIDER_DOWN','AnythingLLM unavailable',8
),'live fencing token schedules retry');

select * from finish();
rollback;
