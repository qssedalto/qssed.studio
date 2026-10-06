-- 【初学者导读】
-- 文件：supabase/migrations/202609251538_huawei_device_exemption_list_rpc.sql
-- 华为设备豁免列表 RPC：提供管理员读取豁免记录的受控查询接口。
-- 阅读顺序：先看新增/修改的数据结构，再看 RPC/FUNCTION，最后检查 GRANT/REVOKE、RLS 和索引；权限相关 migration 尤其要理解“谁能调用”。
-- 安全提示：设备豁免、管理员 RPC、AI 配额都属于服务端权威状态，不能由前端本地值决定。
-- 历史迁移原则：本轮只增加注释，不改变任何 SQL 语义；未来业务变化通过新的 migration 追加。

drop function if exists public.get_device_access_exemptions();

create function public.get_device_access_exemptions()
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
set search_path = public
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
  where (select public.is_admin())
    and e.policy = 'huawei_device'
  order by e.updated_at desc;
$$;

revoke all on function public.get_device_access_exemptions() from public, anon;
grant execute on function public.get_device_access_exemptions() to authenticated;
