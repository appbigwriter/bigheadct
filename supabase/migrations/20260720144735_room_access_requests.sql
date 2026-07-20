-- Room access requests: solicitacao de entrada e revisao por moderadores.

do $$ begin
  create type public.room_access_request_status as enum ('pending','approved','rejected','canceled');
exception when duplicate_object then null;
end $$;

create table public.room_access_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  room_id uuid not null,
  requested_by uuid not null references auth.users(id) on delete cascade,
  note text,
  status public.room_access_request_status not null default 'pending',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, room_id) references public.rooms(organization_id, id) on delete cascade
);

create index room_access_requests_room_status_idx
  on public.room_access_requests(room_id, status, created_at desc);
create index room_access_requests_requester_idx
  on public.room_access_requests(organization_id, requested_by, created_at desc);
create unique index room_access_requests_pending_unique_idx
  on public.room_access_requests(room_id, requested_by)
  where status = 'pending';

alter table public.room_access_requests enable row level security;

create policy room_access_requests_select on public.room_access_requests
for select to authenticated using (
  requested_by = (select auth.uid())
  or private.current_user_has_role(organization_id, array['owner','admin','manager']::public.member_role[])
  or private.current_user_is_room_member(room_id, true)
);

create policy room_access_requests_insert on public.room_access_requests
for insert to authenticated with check (
  requested_by = (select auth.uid())
  and private.current_user_is_member(organization_id)
  and exists (
    select 1 from public.rooms r
    where r.id = room_access_requests.room_id
      and r.organization_id = room_access_requests.organization_id
      and r.is_private
  )
  and not private.current_user_is_room_member(room_id)
);

create policy room_access_requests_update on public.room_access_requests
for update to authenticated using (
  requested_by = (select auth.uid())
  or private.current_user_has_role(organization_id, array['owner','admin','manager']::public.member_role[])
  or private.current_user_is_room_member(room_id, true)
) with check (
  requested_by = (select auth.uid())
  or private.current_user_has_role(organization_id, array['owner','admin','manager']::public.member_role[])
  or private.current_user_is_room_member(room_id, true)
);

revoke all on public.room_access_requests from anon, authenticated;
grant select, insert, update, delete on public.room_access_requests to authenticated;

commit;
