-- 【初学者导读】
-- 文件：supabase/migrations/202609131150_oauth_resource_server_introspection_v1.sql
-- 资源服务器 introspection 迁移：为受信任后端建立检查 access token 有效性、受众和权限的接口。
-- 阅读顺序：先看 CREATE/ALTER 了解结构变化，再看 FUNCTION/RPC，最后看 GRANT/REVOKE/RLS POLICY 理解谁能做什么。
-- 安全提示：数据库权限不是“前端隐藏按钮”；真正的边界来自角色权限、RLS、函数 SECURITY DEFINER/search_path 和 RPC 参数校验。
-- 历史迁移原则：本轮只增加中文注释，不改变任何已执行 SQL 的语义；未来若要改变行为，应新建 migration，而不是重写这份历史账本。

-- QssedA OAuth token introspection for confidential resource servers.
-- Desktop/public clients never receive or use these credentials.

create table if not exists public.oauth_resource_servers (
  resource_server_id text primary key,
  display_name text not null,
  secret_hash text not null,
  allowed_clients text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.oauth_resource_servers enable row level security;
revoke all on public.oauth_resource_servers from anon, authenticated;

create or replace function public.oauth_introspect_for_resource_server(
  p_resource_server_id text,
  p_resource_server_secret text,
  p_access_token text
)
returns table (
  authorized boolean,
  active boolean,
  client_id text,
  user_id uuid,
  scope text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_server public.oauth_resource_servers%rowtype;
  v_token public.oauth_access_tokens%rowtype;
begin
  if coalesce(p_resource_server_id, '') = ''
     or coalesce(p_resource_server_secret, '') = '' then
    return query
      select false, false, null::text, null::uuid, null::text, null::timestamptz;
    return;
  end if;

  select * into v_server
  from public.oauth_resource_servers r
  where r.resource_server_id = p_resource_server_id
    and r.is_active = true
    and r.secret_hash = public.oauth_sha256_hex(p_resource_server_secret);

  if not found then
    return query
      select false, false, null::text, null::uuid, null::text, null::timestamptz;
    return;
  end if;

  select t.* into v_token
  from public.oauth_access_tokens t
  join public.oauth_clients c
    on c.client_id = t.client_id
   and c.is_active = true
  join public.profiles p
    on p.id = t.user_id
   and p.status = 'active'
  where t.token_hash = public.oauth_sha256_hex(p_access_token)
    and t.revoked_at is null
    and t.expires_at > now()
    and (
      cardinality(v_server.allowed_clients) = 0
      or t.client_id = any(v_server.allowed_clients)
    )
  limit 1;

  if not found then
    return query
      select true, false, null::text, null::uuid, null::text, null::timestamptz;
    return;
  end if;

  return query
    select true,
           true,
           v_token.client_id,
           v_token.user_id,
           array_to_string(v_token.scope, ' '),
           v_token.expires_at;
end;
$$;

revoke all on function public.oauth_introspect_for_resource_server(text, text, text) from public;
grant execute on function public.oauth_introspect_for_resource_server(text, text, text) to anon, authenticated;

-- The old raw introspection RPC must not be callable by browser/public-client roles.
revoke execute on function public.oauth_introspect_access_token(text) from anon, authenticated;
