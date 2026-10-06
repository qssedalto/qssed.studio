-- 【初学者导读】
-- 文件：supabase_audit_tables.sql
-- Supabase 审计基础 SQL：定义审计记录相关表、索引或权限结构，供服务器侧审计逻辑使用。
-- 阅读顺序：先看表结构与主键，再看索引、外键和权限/RLS；理解每张表由哪个 API 写入、由哪个角色读取。
-- 修改注意：这是数据库基础结构，不要用破坏性语句覆盖已有数据；结构变化优先通过新的 migration 演进。
-- 初学者提示：配置文件同样是“代码的一部分”，它决定运行环境；出现“本地正常、线上异常”时要优先核对这里。
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
