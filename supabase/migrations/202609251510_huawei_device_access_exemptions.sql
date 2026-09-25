create table if not exists public.device_access_exemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  policy text not null default 'huawei_device',
  enabled boolean not null default true,
  expires_at timestamptz,
  note text,
  granted_by uuid references public.profiles(id) on delete set null,
  granted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint device_access_exemptions_policy_check
    check (policy in ('huawei_device')),
  constraint device_access_exemptions_user_policy_key
    unique (user_id, policy)
);

create index if not exists device_access_exemptions_user_enabled_idx
  on public.device_access_exemptions(user_id, enabled);

alter table public.device_access_exemptions enable row level security;

revoke all on table public.device_access_exemptions from anon;
grant select, insert, update, delete on table public.device_access_exemptions to authenticated;

drop policy if exists "device exemption own or admin read" on public.device_access_exemptions;
create policy "device exemption own or admin read"
on public.device_access_exemptions
for select to authenticated
using (
  (select auth.uid()) = user_id
  or (select public.is_admin())
);

drop policy if exists "device exemption admin insert" on public.device_access_exemptions;
create policy "device exemption admin insert"
on public.device_access_exemptions
for insert to authenticated
with check ((select public.is_admin()));

drop policy if exists "device exemption admin update" on public.device_access_exemptions;
create policy "device exemption admin update"
on public.device_access_exemptions
for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "device exemption admin delete" on public.device_access_exemptions;
create policy "device exemption admin delete"
on public.device_access_exemptions
for delete to authenticated
using ((select public.is_admin()));
