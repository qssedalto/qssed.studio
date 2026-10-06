-- 【初学者导读】
-- 文件：supabase_admin_tables.sql
-- Supabase 管理控制面基础 SQL：定义管理员相关表、索引或权限基础结构。
-- 阅读顺序：先看表结构与主键，再看索引、外键和权限/RLS；理解每张表由哪个 API 写入、由哪个角色读取。
-- 修改注意：这是数据库基础结构，不要用破坏性语句覆盖已有数据；结构变化优先通过新的 migration 演进。
-- 初学者提示：配置文件同样是“代码的一部分”，它决定运行环境；出现“本地正常、线上异常”时要优先核对这里。
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  display_name text,
  avatar_url text,
  role text default 'user' not null check (role in ('admin', 'editor', 'user')),
  status text default 'active' not null check (status in ('active', 'suspended', 'banned')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_seen_at timestamptz
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null check (name in ('admin', 'editor', 'user')),
  description text,
  created_at timestamptz default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  description text,
  category text
);

create table if not exists public.role_permissions (
  role_id uuid references public.roles(id) on delete cascade,
  permission_id uuid references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_email text,
  action text not null,
  target_type text,
  target_id text,
  target_label text,
  description text,
  ip_address text,
  user_agent text,
  severity text default 'info' not null check (severity in ('info', 'warning', 'danger')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.audit_logs enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select on public.roles to authenticated;
grant select on public.permissions to authenticated;
grant select on public.role_permissions to authenticated;
grant select, insert on public.audit_logs to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url, role, status, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    case when coalesce(new.raw_app_meta_data->>'role', '') = 'admin' or coalesce((new.raw_app_meta_data->>'is_admin')::boolean, false) then 'admin' else 'user' end,
    'active',
    coalesce(new.created_at, now()),
    now()
  )
  on conflict (id) do update set
    username = coalesce(excluded.username, public.profiles.username),
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    role = case when coalesce(new.raw_app_meta_data->>'role', '') = 'admin' or coalesce((new.raw_app_meta_data->>'is_admin')::boolean, false) then 'admin' else public.profiles.role end,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

insert into public.roles (name, description) values
  ('admin', 'Full access to users, roles, logs, and system settings.'),
  ('editor', 'Can create, edit, and delete own content and view workspace context.'),
  ('user', 'Can manage own profile, notes, links, and tasks.')
on conflict (name) do update set description = excluded.description;

insert into public.permissions (key, description, category) values
  ('users.read', 'Read user list and profile status.', 'users'),
  ('users.update', 'Update user role and status.', 'users'),
  ('users.ban', 'Suspend or ban users.', 'users'),
  ('roles.read', 'Read RBAC roles and permissions.', 'roles'),
  ('roles.update', 'Update RBAC role permissions.', 'roles'),
  ('logs.read', 'Read operation logs.', 'logs'),
  ('system.read', 'Read system status.', 'system'),
  ('notes.read', 'Read notes.', 'notes'),
  ('notes.create', 'Create notes.', 'notes'),
  ('notes.update', 'Update notes.', 'notes'),
  ('notes.delete', 'Delete notes.', 'notes'),
  ('links.read', 'Read saved links.', 'links'),
  ('links.create', 'Create saved links.', 'links'),
  ('links.update', 'Update saved links.', 'links'),
  ('links.delete', 'Delete saved links.', 'links'),
  ('projects.read', 'Read projects.', 'projects'),
  ('projects.create', 'Create projects.', 'projects'),
  ('projects.update', 'Update projects.', 'projects'),
  ('projects.delete', 'Delete projects.', 'projects')
on conflict (key) do update set description = excluded.description, category = excluded.category;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on true
where r.name = 'admin'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'notes.read','notes.create','notes.update','notes.delete',
  'links.read','links.create','links.update','links.delete',
  'projects.read','projects.create','projects.update','projects.delete'
)
where r.name = 'editor'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'notes.read','notes.create','notes.update',
  'links.read','links.create','links.update',
  'projects.read'
)
where r.name = 'user'
on conflict do nothing;

insert into public.profiles (id, username, display_name, avatar_url, role, status, created_at, updated_at, last_seen_at)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1)),
  coalesce(u.raw_user_meta_data->>'display_name', u.raw_user_meta_data->>'username', split_part(u.email, '@', 1)),
  u.raw_user_meta_data->>'avatar_url',
  case when coalesce(u.raw_app_meta_data->>'role', '') = 'admin' or coalesce((u.raw_app_meta_data->>'is_admin')::boolean, false) then 'admin' else 'user' end,
  'active',
  coalesce(u.created_at, now()),
  now(),
  u.last_sign_in_at
from auth.users u
on conflict (id) do update set
  username = coalesce(excluded.username, public.profiles.username),
  display_name = coalesce(excluded.display_name, public.profiles.display_name),
  avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
  role = case when public.profiles.role = 'admin' then 'admin' else excluded.role end,
  last_seen_at = coalesce(excluded.last_seen_at, public.profiles.last_seen_at),
  updated_at = now();

create index if not exists profiles_role_status_idx on public.profiles (role, status);
create index if not exists profiles_last_seen_idx on public.profiles (last_seen_at desc);
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_action_severity_idx on public.audit_logs (action, severity);
create index if not exists audit_logs_actor_idx on public.audit_logs (actor_user_id, created_at desc);

create or replace function public.current_user_role()
returns text
language sql
stable
security invoker
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    auth.jwt()->'app_metadata'->>'role',
    case when coalesce((auth.jwt()->'app_metadata'->>'is_admin')::boolean, false) then 'admin' else 'user' end
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select coalesce(
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and status = 'active'),
    false
  )
  or coalesce((auth.jwt()->'app_metadata'->>'is_admin')::boolean, false)
  or coalesce(auth.jwt()->'app_metadata'->>'role', '') = 'admin';
$$;

drop policy if exists "profiles read own or admin" on public.profiles;
drop policy if exists "profiles insert own" on public.profiles;
drop policy if exists "profiles update own basic fields" on public.profiles;
drop policy if exists "roles read admin" on public.roles;
drop policy if exists "permissions read admin" on public.permissions;
drop policy if exists "role_permissions read admin" on public.role_permissions;
drop policy if exists "audit logs read admin" on public.audit_logs;
drop policy if exists "audit logs insert own" on public.audit_logs;

create policy "profiles read own or admin"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles insert own"
  on public.profiles for insert to authenticated
  with check (id = auth.uid() and role = 'user' and status = 'active');

create policy "profiles update own basic fields"
  on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (
    public.is_admin()
    or (
      id = auth.uid()
      and role = (select role from public.profiles where id = auth.uid())
      and status = (select status from public.profiles where id = auth.uid())
    )
  );

create policy "roles read admin"
  on public.roles for select to authenticated
  using (public.is_admin());

create policy "permissions read admin"
  on public.permissions for select to authenticated
  using (public.is_admin());

create policy "role_permissions read admin"
  on public.role_permissions for select to authenticated
  using (public.is_admin());

create policy "audit logs read admin"
  on public.audit_logs for select to authenticated
  using (public.is_admin());

create policy "audit logs insert own"
  on public.audit_logs for insert to authenticated
  with check (actor_user_id = auth.uid());

create or replace function public.admin_assert()
returns void
language plpgsql
security invoker
as $$
begin
  if not public.is_admin() then
    raise exception 'admin access required';
  end if;
end;
$$;

create or replace function public.write_audit_log(
  p_action text,
  p_target_type text default null,
  p_target_id text default null,
  p_target_label text default null,
  p_description text default null,
  p_severity text default 'info',
  p_ip_address text default null,
  p_user_agent text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns public.audit_logs
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_log public.audit_logs;
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'authenticated user required';
  end if;

  select email into v_email from auth.users where id = auth.uid();

  insert into public.audit_logs (
    actor_user_id, actor_email, action, target_type, target_id, target_label,
    description, ip_address, user_agent, severity, metadata
  )
  values (
    auth.uid(), v_email, p_action, p_target_type, p_target_id, p_target_label,
    p_description, p_ip_address, p_user_agent,
    case when p_severity in ('info','warning','danger') then p_severity else 'info' end,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning * into v_log;

  return v_log;
end;
$$;

create or replace function public.get_admin_users()
returns table (
  user_id uuid,
  username text,
  display_name text,
  email text,
  avatar_url text,
  role text,
  status text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  last_seen_at timestamptz,
  recent_logins jsonb,
  recent_actions jsonb
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  perform public.admin_assert();
  return query
  select
    p.id,
    p.username,
    p.display_name,
    u.email::text,
    p.avatar_url,
    p.role,
    p.status,
    coalesce(u.created_at, p.created_at),
    u.last_sign_in_at,
    p.last_seen_at,
    coalesce((
      select jsonb_agg(to_jsonb(le) order by le.created_at desc)
      from (select * from public.login_events le where le.user_id = p.id order by le.created_at desc limit 5) le
    ), '[]'::jsonb),
    coalesce((
      select jsonb_agg(to_jsonb(al) order by al.created_at desc)
      from (select * from public.audit_logs al where al.actor_user_id = p.id order by al.created_at desc limit 5) al
    ), '[]'::jsonb)
  from public.profiles p
  left join auth.users u on u.id = p.id
  order by coalesce(p.last_seen_at, u.last_sign_in_at, p.created_at) desc nulls last;
end;
$$;

create or replace function public.update_user_role(
  p_user_id uuid,
  p_role text,
  p_ip_address text default null,
  p_user_agent text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_profile public.profiles;
  v_email text;
begin
  perform public.admin_assert();

  if p_role not in ('admin','editor','user') then
    raise exception 'invalid role';
  end if;

  if p_user_id = auth.uid() and p_role <> 'admin' then
    raise exception 'you cannot remove your own admin role';
  end if;

  update public.profiles
  set role = p_role, updated_at = now()
  where id = p_user_id
  returning * into v_profile;

  if v_profile.id is null then
    raise exception 'user profile not found';
  end if;

  select email into v_email from auth.users where id = p_user_id;

  perform public.write_audit_log(
    'user.role.update',
    'user',
    p_user_id::text,
    coalesce(v_email, v_profile.display_name, v_profile.username, p_user_id::text),
    'Role changed to ' || p_role,
    'warning',
    p_ip_address,
    p_user_agent,
    jsonb_build_object('role', p_role)
  );

  return v_profile;
end;
$$;

create or replace function public.update_user_status(
  p_user_id uuid,
  p_status text,
  p_ip_address text default null,
  p_user_agent text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_profile public.profiles;
  v_email text;
  v_severity text := 'info';
begin
  perform public.admin_assert();

  if p_status not in ('active','suspended','banned') then
    raise exception 'invalid status';
  end if;

  if p_user_id = auth.uid() and p_status <> 'active' then
    raise exception 'you cannot suspend or ban yourself';
  end if;

  update public.profiles
  set status = p_status, updated_at = now()
  where id = p_user_id
  returning * into v_profile;

  if v_profile.id is null then
    raise exception 'user profile not found';
  end if;

  select email into v_email from auth.users where id = p_user_id;
  if p_status = 'banned' then
    v_severity := 'danger';
  elsif p_status = 'suspended' then
    v_severity := 'warning';
  end if;

  perform public.write_audit_log(
    case when p_status = 'active' then 'user.unban' when p_status = 'banned' then 'user.ban' else 'user.suspend' end,
    'user',
    p_user_id::text,
    coalesce(v_email, v_profile.display_name, v_profile.username, p_user_id::text),
    'Status changed to ' || p_status,
    v_severity,
    p_ip_address,
    p_user_agent,
    jsonb_build_object('status', p_status)
  );

  return v_profile;
end;
$$;

create or replace function public.get_role_permissions()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  perform public.admin_assert();
  select jsonb_build_object(
    'roles', coalesce((select jsonb_agg(to_jsonb(r) order by r.name) from public.roles r), '[]'::jsonb),
    'permissions', coalesce((select jsonb_agg(to_jsonb(p) order by p.category, p.key) from public.permissions p), '[]'::jsonb),
    'role_permissions', coalesce((
      select jsonb_agg(jsonb_build_object('role', r.name, 'permission', p.key) order by r.name, p.key)
      from public.role_permissions rp
      join public.roles r on r.id = rp.role_id
      join public.permissions p on p.id = rp.permission_id
    ), '[]'::jsonb),
    'user_counts', coalesce((
      select jsonb_object_agg(role, count)
      from (select role, count(*)::int from public.profiles group by role) counts
    ), '{}'::jsonb)
  ) into v_result;
  return v_result;
end;
$$;

create or replace function public.update_role_permissions(
  p_role text,
  p_permissions text[],
  p_ip_address text default null,
  p_user_agent text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role_id uuid;
begin
  perform public.admin_assert();

  if p_role not in ('admin','editor','user') then
    raise exception 'invalid role';
  end if;

  if p_role = 'admin' and not ('roles.update' = any(p_permissions) and 'users.update' = any(p_permissions)) then
    raise exception 'admin must keep roles.update and users.update';
  end if;

  select id into v_role_id from public.roles where name = p_role;
  if v_role_id is null then
    raise exception 'role not found';
  end if;

  delete from public.role_permissions where role_id = v_role_id;

  insert into public.role_permissions (role_id, permission_id)
  select v_role_id, p.id
  from public.permissions p
  where p.key = any(p_permissions)
  on conflict do nothing;

  perform public.write_audit_log(
    'role.permissions.update',
    'role',
    p_role,
    p_role,
    'Permissions updated for role ' || p_role,
    'warning',
    p_ip_address,
    p_user_agent,
    jsonb_build_object('permissions', p_permissions)
  );

  return public.get_role_permissions();
end;
$$;

create or replace function public.get_audit_logs(
  p_action text default null,
  p_severity text default null,
  p_actor text default null,
  p_search text default null,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_limit int default 100
)
returns setof public.audit_logs
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.admin_assert();
  return query
  select *
  from public.audit_logs al
  where (p_action is null or p_action = '' or al.action = p_action)
    and (p_severity is null or p_severity = '' or al.severity = p_severity)
    and (p_actor is null or p_actor = '' or al.actor_email ilike '%' || p_actor || '%' or al.actor_user_id::text ilike '%' || p_actor || '%')
    and (p_search is null or p_search = '' or al.description ilike '%' || p_search || '%' or al.target_label ilike '%' || p_search || '%' or al.action ilike '%' || p_search || '%')
    and (p_from is null or al.created_at >= p_from)
    and (p_to is null or al.created_at <= p_to)
  order by al.created_at desc
  limit least(greatest(coalesce(p_limit, 100), 1), 300);
end;
$$;

create or replace function public.get_admin_overview()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_result jsonb;
begin
  perform public.admin_assert();
  select jsonb_build_object(
    'user_count', (select count(*)::int from public.profiles),
    'admin_count', (select count(*)::int from public.profiles where role = 'admin'),
    'note_count', 0,
    'project_count', 0,
    'link_count', 0,
    'recent_users', coalesce((
      select jsonb_agg(to_jsonb(x) order by x.last_seen_at desc nulls last)
      from (
        select p.id, p.display_name, p.username, u.email, p.role, p.status, coalesce(p.last_seen_at, u.last_sign_in_at, p.created_at) as last_seen_at
        from public.profiles p
        left join auth.users u on u.id = p.id
        order by coalesce(p.last_seen_at, u.last_sign_in_at, p.created_at) desc nulls last
        limit 5
      ) x
    ), '[]'::jsonb),
    'recent_logs', coalesce((select jsonb_agg(to_jsonb(al) order by al.created_at desc) from (select * from public.audit_logs order by created_at desc limit 8) al), '[]'::jsonb),
    'risks', coalesce((select jsonb_agg(to_jsonb(al) order by al.created_at desc) from (select * from public.audit_logs where severity in ('warning','danger') order by created_at desc limit 5) al), '[]'::jsonb)
  ) into v_result;
  return v_result;
end;
$$;
