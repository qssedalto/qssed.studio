create table if not exists public.login_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event_type text,
  success boolean,
  provider text,
  ip_address text,
  country text,
  region text,
  city text,
  user_agent text,
  browser text,
  os text,
  device_type text,
  device_id text,
  risk_level text,
  created_at timestamptz default now()
);

create table if not exists public.user_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  device_id text,
  device_name text,
  browser text,
  os text,
  device_type text,
  last_ip text,
  country text,
  region text,
  city text,
  first_seen_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  is_current boolean,
  revoked_at timestamptz
);

create unique index if not exists user_devices_user_device_id_unique
  on public.user_devices (user_id, device_id);

create index if not exists login_events_user_created_at_idx
  on public.login_events (user_id, created_at desc);

create index if not exists user_devices_user_last_seen_idx
  on public.user_devices (user_id, last_seen_at desc);

alter table public.login_events enable row level security;
alter table public.user_devices enable row level security;

drop policy if exists "login events read own or admin" on public.login_events;
drop policy if exists "login events insert own" on public.login_events;
drop policy if exists "devices read own or admin" on public.user_devices;
drop policy if exists "devices insert own" on public.user_devices;
drop policy if exists "devices update own" on public.user_devices;

create policy "login events read own or admin"
  on public.login_events
  for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "login events insert own"
  on public.login_events
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "devices read own or admin"
  on public.user_devices
  for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "devices insert own"
  on public.user_devices
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "devices update own"
  on public.user_devices
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
