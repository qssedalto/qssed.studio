begin;

-- The administrator control plane keeps privileged implementation details out of
-- the exposed public schema. Public RPCs remain thin SECURITY INVOKER wrappers.
create schema if not exists aertex_private;

revoke all on schema aertex_private from public, anon;
grant usage on schema aertex_private to authenticated, service_role;

create or replace function aertex_private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
      and p.status = 'active'
  );
$$;

revoke all on function aertex_private.is_admin() from public, anon;
grant execute on function aertex_private.is_admin() to authenticated, service_role;

create or replace function aertex_private.verify_admin_session()
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_session_text text := coalesce(auth.jwt()->>'session_id', '');
  v_session_id uuid;
begin
  if v_uid is null or not aertex_private.is_admin() then
    return false;
  end if;

  if v_session_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    return false;
  end if;

  v_session_id := v_session_text::uuid;

  return exists (
    select 1
    from auth.sessions s
    where s.id = v_session_id
      and s.user_id = v_uid
      and (s.not_after is null or s.not_after > now())
  );
end;
$$;

revoke all on function aertex_private.verify_admin_session() from public, anon;
grant execute on function aertex_private.verify_admin_session() to authenticated, service_role;

create or replace function aertex_private.admin_assert()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not aertex_private.verify_admin_session() then
    raise exception 'admin access required' using errcode = '42501';
  end if;
end;
$$;

revoke all on function aertex_private.admin_assert() from public, anon, authenticated;
grant execute on function aertex_private.admin_assert() to service_role;

create or replace function public.verify_admin_session()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select aertex_private.verify_admin_session();
$$;

revoke execute on function public.verify_admin_session() from public, anon;
grant execute on function public.verify_admin_session() to authenticated, service_role;

-- Keep public.is_admin as a non-privileged compatibility helper, but remove it
-- from the Data API surface for ordinary authenticated users.
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
      and p.status = 'active'
  );
$$;

revoke execute on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to service_role;

create or replace function aertex_private.admin_get_overview()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  perform aertex_private.admin_assert();

  select jsonb_build_object(
    'user_count', (select count(*)::int from public.profiles),
    'admin_count', (select count(*)::int from public.profiles where role = 'admin'),
    'note_count', 0,
    'project_count', 0,
    'link_count', 0,
    'recent_users', coalesce((
      select jsonb_agg(to_jsonb(x) order by x.last_seen_at desc nulls last)
      from (
        select p.id, p.display_name, p.username, u.email, p.role, p.status,
               coalesce(p.last_seen_at, u.last_sign_in_at, p.created_at) as last_seen_at
        from public.profiles p
        left join auth.users u on u.id = p.id
        order by coalesce(p.last_seen_at, u.last_sign_in_at, p.created_at) desc nulls last
        limit 5
      ) x
    ), '[]'::jsonb),
    'recent_logs', coalesce((
      select jsonb_agg(to_jsonb(al) order by al.created_at desc)
      from (select * from public.audit_logs order by created_at desc limit 8) al
    ), '[]'::jsonb),
    'risks', coalesce((
      select jsonb_agg(to_jsonb(al) order by al.created_at desc)
      from (
        select * from public.audit_logs
        where severity in ('warning','danger')
        order by created_at desc
        limit 5
      ) al
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

create or replace function public.get_admin_overview()
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select aertex_private.admin_get_overview();
$$;

create or replace function aertex_private.admin_get_users()
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
set search_path = ''
as $$
begin
  perform aertex_private.admin_assert();

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
      from (
        select *
        from public.login_events le
        where le.user_id = p.id
        order by le.created_at desc
        limit 5
      ) le
    ), '[]'::jsonb),
    coalesce((
      select jsonb_agg(to_jsonb(al) order by al.created_at desc)
      from (
        select *
        from public.audit_logs al
        where al.actor_user_id = p.id
        order by al.created_at desc
        limit 5
      ) al
    ), '[]'::jsonb)
  from public.profiles p
  left join auth.users u on u.id = p.id
  order by coalesce(p.last_seen_at, u.last_sign_in_at, p.created_at) desc nulls last;
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
language sql
security invoker
set search_path = ''
as $$
  select * from aertex_private.admin_get_users();
$$;

create or replace function aertex_private.admin_get_role_permissions()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  perform aertex_private.admin_assert();

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

create or replace function public.get_role_permissions()
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select aertex_private.admin_get_role_permissions();
$$;

create or replace function aertex_private.admin_get_audit_logs(
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
set search_path = ''
as $$
begin
  perform aertex_private.admin_assert();

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
language sql
security invoker
set search_path = ''
as $$
  select * from aertex_private.admin_get_audit_logs(
    p_action, p_severity, p_actor, p_search, p_from, p_to, p_limit
  );
$$;

create or replace function aertex_private.admin_update_user_role(
  p_user_id uuid,
  p_role text,
  p_ip_address text default null,
  p_user_agent text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles;
  v_email text;
begin
  perform aertex_private.admin_assert();

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

create or replace function public.update_user_role(
  p_user_id uuid,
  p_role text,
  p_ip_address text default null,
  p_user_agent text default null
)
returns public.profiles
language sql
security invoker
set search_path = ''
as $$
  select aertex_private.admin_update_user_role(
    p_user_id, p_role, p_ip_address, p_user_agent
  );
$$;

create or replace function aertex_private.admin_update_user_status(
  p_user_id uuid,
  p_status text,
  p_ip_address text default null,
  p_user_agent text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles;
  v_email text;
  v_severity text := 'info';
begin
  perform aertex_private.admin_assert();

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
    case
      when p_status = 'active' then 'user.unban'
      when p_status = 'banned' then 'user.ban'
      else 'user.suspend'
    end,
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

create or replace function public.update_user_status(
  p_user_id uuid,
  p_status text,
  p_ip_address text default null,
  p_user_agent text default null
)
returns public.profiles
language sql
security invoker
set search_path = ''
as $$
  select aertex_private.admin_update_user_status(
    p_user_id, p_status, p_ip_address, p_user_agent
  );
$$;

create or replace function aertex_private.admin_update_role_permissions(
  p_role text,
  p_permissions text[],
  p_ip_address text default null,
  p_user_agent text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role_id uuid;
begin
  perform aertex_private.admin_assert();

  if p_role not in ('admin','editor','user') then
    raise exception 'invalid role';
  end if;

  if p_role = 'admin'
     and not ('roles.update' = any(p_permissions) and 'users.update' = any(p_permissions)) then
    raise exception 'admin must keep roles.update and users.update';
  end if;

  select id into v_role_id
  from public.roles
  where name = p_role;

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

  return aertex_private.admin_get_role_permissions();
end;
$$;

create or replace function public.update_role_permissions(
  p_role text,
  p_permissions text[],
  p_ip_address text default null,
  p_user_agent text default null
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select aertex_private.admin_update_role_permissions(
    p_role, p_permissions, p_ip_address, p_user_agent
  );
$$;

create or replace function aertex_private.admin_get_ai_state()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  perform aertex_private.admin_assert();

  select jsonb_build_object(
    'providers', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'provider', p.provider,
        'base_url', p.base_url,
        'key_hint', p.key_hint,
        'default_model', p.default_model,
        'allowed_models', p.allowed_models,
        'monthly_budget_usd', p.monthly_budget_usd,
        'is_active', p.is_active,
        'input_price_per_million', p.input_price_per_million,
        'output_price_per_million', p.output_price_per_million,
        'created_at', p.created_at,
        'updated_at', p.updated_at,
        'month_usage_usd', coalesce((
          select sum(u.estimated_cost_usd)
          from public.ai_usage u
          where u.provider_id = p.id
            and u.created_at >= date_trunc('month', now())
        ), 0),
        'month_requests', (
          select count(*)
          from public.ai_usage u
          where u.provider_id = p.id
            and u.created_at >= date_trunc('month', now())
        )
      ) order by p.created_at desc)
      from public.ai_providers p
    ), '[]'::jsonb),
    'users', coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id', pr.id,
        'username', pr.username,
        'display_name', pr.display_name,
        'email', au.email,
        'role', pr.role,
        'status', pr.status,
        'enabled', coalesce(a.enabled, false),
        'provider_access', coalesce((
          select jsonb_agg(jsonb_build_object(
            'provider_id', upa.provider_id,
            'enabled', upa.enabled,
            'allowed_models', upa.allowed_models
          ) order by upa.created_at, upa.provider_id)
          from public.ai_user_provider_access upa
          where upa.user_id = pr.id
        ), '[]'::jsonb),
        'daily_limit_usd', a.daily_limit_usd,
        'monthly_limit_usd', a.monthly_limit_usd,
        'daily_limit_tokens', a.daily_limit_tokens,
        'monthly_limit_tokens', a.monthly_limit_tokens,
        'requests_per_minute', coalesce(a.requests_per_minute, 20),
        'today_usage_tokens', coalesce((
          select sum(u.input_tokens + u.output_tokens)
          from public.ai_usage u
          where u.user_id = pr.id
            and u.created_at >= date_trunc('day', now())
        ), 0),
        'month_usage_tokens', coalesce((
          select sum(u.input_tokens + u.output_tokens)
          from public.ai_usage u
          where u.user_id = pr.id
            and u.created_at >= date_trunc('month', now())
        ), 0),
        'month_usage_usd', coalesce((
          select sum(u.estimated_cost_usd)
          from public.ai_usage u
          where u.user_id = pr.id
            and u.created_at >= date_trunc('month', now())
        ), 0)
      ) order by coalesce(pr.last_seen_at, pr.created_at) desc)
      from public.profiles pr
      left join auth.users au on au.id = pr.id
      left join public.ai_user_access a on a.user_id = pr.id
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

create or replace function public.get_ai_admin_state()
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select aertex_private.admin_get_ai_state();
$$;

revoke all on function aertex_private.admin_get_overview() from public, anon;
revoke all on function aertex_private.admin_get_users() from public, anon;
revoke all on function aertex_private.admin_get_role_permissions() from public, anon;
revoke all on function aertex_private.admin_get_audit_logs(text, text, text, text, timestamptz, timestamptz, int) from public, anon;
revoke all on function aertex_private.admin_update_user_role(uuid, text, text, text) from public, anon;
revoke all on function aertex_private.admin_update_user_status(uuid, text, text, text) from public, anon;
revoke all on function aertex_private.admin_update_role_permissions(text, text[], text, text) from public, anon;
revoke all on function aertex_private.admin_get_ai_state() from public, anon;

grant execute on function aertex_private.admin_get_overview() to authenticated;
grant execute on function aertex_private.admin_get_users() to authenticated;
grant execute on function aertex_private.admin_get_role_permissions() to authenticated;
grant execute on function aertex_private.admin_get_audit_logs(text, text, text, text, timestamptz, timestamptz, int) to authenticated;
grant execute on function aertex_private.admin_update_user_role(uuid, text, text, text) to authenticated;
grant execute on function aertex_private.admin_update_user_status(uuid, text, text, text) to authenticated;
grant execute on function aertex_private.admin_update_role_permissions(text, text[], text, text) to authenticated;
grant execute on function aertex_private.admin_get_ai_state() to authenticated;

revoke execute on function public.get_admin_overview() from public, anon;
revoke execute on function public.get_admin_users() from public, anon;
revoke execute on function public.get_role_permissions() from public, anon;
revoke execute on function public.get_audit_logs(text, text, text, text, timestamptz, timestamptz, int) from public, anon;
revoke execute on function public.update_user_role(uuid, text, text, text) from public, anon;
revoke execute on function public.update_user_status(uuid, text, text, text) from public, anon;
revoke execute on function public.update_role_permissions(text, text[], text, text) from public, anon;
revoke execute on function public.get_ai_admin_state() from public, anon;

grant execute on function public.get_admin_overview() to authenticated;
grant execute on function public.get_admin_users() to authenticated;
grant execute on function public.get_role_permissions() to authenticated;
grant execute on function public.get_audit_logs(text, text, text, text, timestamptz, timestamptz, int) to authenticated;
grant execute on function public.update_user_role(uuid, text, text, text) to authenticated;
grant execute on function public.update_user_status(uuid, text, text, text) to authenticated;
grant execute on function public.update_role_permissions(text, text[], text, text) to authenticated;
grant execute on function public.get_ai_admin_state() to authenticated;

create or replace function public.get_device_access_exemptions()
returns table (
  user_id uuid,
  username text,
  display_name text,
  enabled boolean,
  expires_at timestamptz,
  note text,
  granted_at timestamptz,
  updated_at timestamptz
)
language sql
security invoker
set search_path = ''
as $$
  select
    e.user_id,
    p.username,
    p.display_name,
    e.enabled,
    e.expires_at,
    e.note,
    e.granted_at,
    e.updated_at
  from public.device_access_exemptions e
  join public.profiles p on p.id = e.user_id
  where aertex_private.verify_admin_session()
    and e.policy = 'huawei_device'
  order by e.updated_at desc;
$$;

create or replace function public.set_device_access_exemption(
  p_user_id uuid,
  p_enabled boolean default true,
  p_expires_at timestamptz default null,
  p_note text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_row public.device_access_exemptions;
begin
  if not aertex_private.verify_admin_session() then
    raise exception 'Administrator access required'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = p_user_id
  ) then
    raise exception 'User not found'
      using errcode = 'P0002';
  end if;

  insert into public.device_access_exemptions (
    user_id, policy, enabled, expires_at, note, granted_by, granted_at, updated_at
  )
  values (
    p_user_id,
    'huawei_device',
    coalesce(p_enabled, true),
    p_expires_at,
    nullif(trim(coalesce(p_note, '')), ''),
    auth.uid(),
    now(),
    now()
  )
  on conflict (user_id, policy)
  do update set
    enabled = excluded.enabled,
    expires_at = excluded.expires_at,
    note = excluded.note,
    granted_by = auth.uid(),
    granted_at = case
      when excluded.enabled and not public.device_access_exemptions.enabled then now()
      else public.device_access_exemptions.granted_at
    end,
    updated_at = now()
  returning * into v_row;

  return jsonb_build_object(
    'user_id', v_row.user_id,
    'policy', v_row.policy,
    'enabled', v_row.enabled,
    'expires_at', v_row.expires_at,
    'updated_at', v_row.updated_at
  );
end;
$$;

revoke execute on function public.get_device_access_exemptions() from public, anon;
revoke execute on function public.set_device_access_exemption(uuid, boolean, timestamptz, text) from public, anon;
grant execute on function public.get_device_access_exemptions() to authenticated;
grant execute on function public.set_device_access_exemption(uuid, boolean, timestamptz, text) to authenticated;

-- Administrator RLS branches require both a live role assignment and a live
-- Supabase Auth session. Ordinary own-row access remains unchanged.
alter policy "profiles read own or admin" on public.profiles
  to authenticated
  using (
    id = (select auth.uid())
    or (select aertex_private.verify_admin_session())
  );

alter policy "profiles update own basic fields" on public.profiles
  to authenticated
  using (
    id = (select auth.uid())
    or (select aertex_private.verify_admin_session())
  )
  with check (
    (select aertex_private.verify_admin_session())
    or (
      id = (select auth.uid())
      and role = (select p.role from public.profiles p where p.id = (select auth.uid()))
      and status = (select p.status from public.profiles p where p.id = (select auth.uid()))
    )
  );

alter policy "roles read admin" on public.roles
  to authenticated
  using ((select aertex_private.verify_admin_session()));

alter policy "permissions read admin" on public.permissions
  to authenticated
  using ((select aertex_private.verify_admin_session()));

alter policy "role_permissions read admin" on public.role_permissions
  to authenticated
  using ((select aertex_private.verify_admin_session()));

alter policy "audit logs read admin" on public.audit_logs
  to authenticated
  using ((select aertex_private.verify_admin_session()));

alter policy "login events read own or admin" on public.login_events
  to authenticated
  using (
    user_id = (select auth.uid())
    or (select aertex_private.verify_admin_session())
  );

alter policy "devices read own or admin" on public.user_devices
  to authenticated
  using (
    user_id = (select auth.uid())
    or (select aertex_private.verify_admin_session())
  );

alter policy "device exemption own or admin read" on public.device_access_exemptions
  to authenticated
  using (
    (select auth.uid()) = user_id
    or (select aertex_private.verify_admin_session())
  );

alter policy "device exemption admin insert" on public.device_access_exemptions
  to authenticated
  with check ((select aertex_private.verify_admin_session()));

alter policy "device exemption admin update" on public.device_access_exemptions
  to authenticated
  using ((select aertex_private.verify_admin_session()))
  with check ((select aertex_private.verify_admin_session()));

alter policy "device exemption admin delete" on public.device_access_exemptions
  to authenticated
  using ((select aertex_private.verify_admin_session()));

alter policy "ai conversations own" on public.ai_conversations
  to authenticated
  using (
    user_id = (select auth.uid())
    or (select aertex_private.verify_admin_session())
  )
  with check (
    user_id = (select auth.uid())
    or (select aertex_private.verify_admin_session())
  );

alter policy "ai messages own insert" on public.ai_messages
  to authenticated
  with check (
    (
      user_id = (select auth.uid())
      and exists (
        select 1
        from public.ai_conversations c
        where c.id = ai_messages.conversation_id
          and c.user_id = (select auth.uid())
      )
    )
    or (select aertex_private.verify_admin_session())
  );

alter policy "ai messages own read" on public.ai_messages
  to authenticated
  using (
    user_id = (select auth.uid())
    or (select aertex_private.verify_admin_session())
  );

alter policy "ai providers admin only" on public.ai_providers
  to authenticated
  using ((select aertex_private.verify_admin_session()))
  with check ((select aertex_private.verify_admin_session()));

alter policy "ai usage own insert" on public.ai_usage
  to authenticated
  with check (
    user_id = (select auth.uid())
    or (select aertex_private.verify_admin_session())
  );

alter policy "ai usage own read" on public.ai_usage
  to authenticated
  using (
    user_id = (select auth.uid())
    or (select aertex_private.verify_admin_session())
  );

alter policy "ai access own or admin read" on public.ai_user_access
  to authenticated
  using (
    user_id = (select auth.uid())
    or (select aertex_private.verify_admin_session())
  );

alter policy "ai access admin insert" on public.ai_user_access
  to authenticated
  with check ((select aertex_private.verify_admin_session()));

alter policy "ai access admin update" on public.ai_user_access
  to authenticated
  using ((select aertex_private.verify_admin_session()))
  with check ((select aertex_private.verify_admin_session()));

alter policy "ai access admin delete" on public.ai_user_access
  to authenticated
  using ((select aertex_private.verify_admin_session()));

alter policy "ai user provider own or admin read" on public.ai_user_provider_access
  to authenticated
  using (
    (select auth.uid()) = user_id
    or (select aertex_private.verify_admin_session())
  );

alter policy "ai user provider admin insert" on public.ai_user_provider_access
  to authenticated
  with check ((select aertex_private.verify_admin_session()));

alter policy "ai user provider admin update" on public.ai_user_provider_access
  to authenticated
  using ((select aertex_private.verify_admin_session()))
  with check ((select aertex_private.verify_admin_session()));

alter policy "ai user provider admin delete" on public.ai_user_provider_access
  to authenticated
  using ((select aertex_private.verify_admin_session()));

-- Reduce table-level privileges to operations that RLS actually needs.
revoke all on table public.roles from anon;
revoke all on table public.permissions from anon;
revoke all on table public.role_permissions from anon;
revoke all on table public.audit_logs from anon;
revoke all on table public.login_events from anon;
revoke all on table public.device_access_exemptions from anon;

revoke all on table public.roles from authenticated;
grant select on table public.roles to authenticated;

revoke all on table public.permissions from authenticated;
grant select on table public.permissions to authenticated;

revoke all on table public.role_permissions from authenticated;
grant select on table public.role_permissions to authenticated;

revoke all on table public.audit_logs from authenticated;
grant select, insert on table public.audit_logs to authenticated;

revoke all on table public.login_events from authenticated;
grant select, insert on table public.login_events to authenticated;

revoke all on table public.device_access_exemptions from authenticated;
grant select, insert, update, delete on table public.device_access_exemptions to authenticated;

-- The old public assertion helper is no longer part of the RPC surface.
drop function if exists public.admin_assert();

commit;
