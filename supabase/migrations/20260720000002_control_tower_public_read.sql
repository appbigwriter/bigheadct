alter table public.projects enable row level security;
alter table public.templates enable row level security;
alter table public.audit_logs enable row level security;
alter table public.provisioning_jobs enable row level security;

drop policy if exists projects_admin_read on public.projects;
drop policy if exists templates_read_all on public.templates;

create policy projects_admin_read
on public.projects
for select
to authenticated
using (true);

create policy templates_read_all
on public.templates
for select
to authenticated
using (true);

grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.templates to authenticated;
grant select, insert, update, delete on public.provisioning_jobs to authenticated;
grant select, insert, update, delete on public.audit_logs to authenticated;

