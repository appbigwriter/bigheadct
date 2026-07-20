begin;
create extension if not exists pgtap with schema extensions;
select plan(5);

select is(
  (
    select count(*)
    from pg_constraint con
    join pg_class c on c.oid=con.conrelid
    join pg_namespace n on n.oid=c.relnamespace
    where con.contype='f' and n.nspname in ('public','private')
      and not exists (
        select 1 from pg_index i
        where i.indrelid=con.conrelid and i.indisvalid and i.indpred is null
          and (
            select bool_and(i.indkey[pos-1]=con.conkey[pos])
            from generate_subscripts(con.conkey,1) pos
          )
      )
  ),
  0::bigint,
  'every public/private foreign key has a non-partial leading index'
);

select is(
  (
    select count(*) from information_schema.role_table_grants
    where table_schema='public'
      and grantee in ('anon','authenticated')
      and privilege_type in ('TRUNCATE','REFERENCES','TRIGGER')
  ),
  0::bigint,
  'Data API roles have no residual DDL-like table privileges'
);

select ok(
  not exists (
    select 1
    from pg_default_acl d
    cross join lateral aclexplode(d.defaclacl) acl
    left join pg_roles grantee on grantee.oid=acl.grantee
    join pg_namespace n on n.oid=d.defaclnamespace
    where d.defaclrole='postgres'::regrole and n.nspname='public'
      and d.defaclobjtype in ('r','S')
      and coalesce(grantee.rolname,'PUBLIC') in ('PUBLIC','anon','authenticated')
  ),
  'future public tables and sequences require explicit client grants'
);

select ok(
  not exists (
    select 1
    from pg_default_acl d
    cross join lateral aclexplode(d.defaclacl) acl
    left join pg_roles grantee on grantee.oid=acl.grantee
    join pg_namespace n on n.oid=d.defaclnamespace
    where d.defaclrole='postgres'::regrole and n.nspname='public'
      and d.defaclobjtype='f'
      and coalesce(grantee.rolname,'PUBLIC') in ('PUBLIC','anon','authenticated')
  ),
  'future public functions are not executable by client roles by default'
);

select is(
  (
    select array_agg(tablename order by tablename)
    from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public'
      and tablename in ('messages','notifications','tasks')
  ),
  array['messages','notifications','tasks']::name[],
  'Realtime publication includes messages, notifications and tasks'
);

select * from finish();
rollback;
