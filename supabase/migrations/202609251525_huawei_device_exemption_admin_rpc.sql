-- 【初学者导读】
-- 文件：supabase/migrations/202609251525_huawei_device_exemption_admin_rpc.sql
-- 华为设备豁免管理 RPC：提供管理员创建/更新豁免的受保护接口，不能由普通用户直接写表。
-- 阅读顺序：先看新增/修改的数据结构，再看 RPC/FUNCTION，最后检查 GRANT/REVOKE、RLS 和索引；权限相关 migration 尤其要理解“谁能调用”。
-- 安全提示：设备豁免、管理员 RPC、AI 配额都属于服务端权威状态，不能由前端本地值决定。
-- 历史迁移原则：本轮只增加注释，不改变任何 SQL 语义；未来业务变化通过新的 migration 追加。

create or replace function public.set_device_access_exemption(
  p_user_id uuid,
  p_enabled boolean default true,
  p_expires_at timestamptz default null,
  p_note text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_row public.device_access_exemptions;
begin
  if not public.is_admin() then
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
    user_id,
    policy,
    enabled,
    expires_at,
    note,
    granted_by,
    granted_at,
    updated_at
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

revoke all on function public.set_device_access_exemption(uuid, boolean, timestamptz, text) from public, anon;
grant execute on function public.set_device_access_exemption(uuid, boolean, timestamptz, text) to authenticated;

create or replace function public.get_device_access_exemptions()
returns table (
  user_id uuid,
  username text,
  display_name text,
  email text,
  enabled boolean,
  expires_at timestamptz,
  note text,
  granted_at timestamptz,
  updated_at timestamptz
)
language sql
security invoker
set search_path = public
as $$
  select
    e.user_id,
    p.username,
    p.display_name,
    u.email::text,
    e.enabled,
    e.expires_at,
    e.note,
    e.granted_at,
    e.updated_at
  from public.device_access_exemptions e
  join public.profiles p on p.id = e.user_id
  join auth.users u on u.id = e.user_id
  where public.is_admin()
    and e.policy = 'huawei_device'
  order by e.updated_at desc;
$$;

revoke all on function public.get_device_access_exemptions() from public, anon;
grant execute on function public.get_device_access_exemptions() to authenticated;
