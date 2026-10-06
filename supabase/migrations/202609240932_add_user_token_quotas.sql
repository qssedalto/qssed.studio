-- 【初学者导读】
-- 文件：supabase/migrations/202609240932_add_user_token_quotas.sql
-- 用户 Token 配额迁移：建立按用户/套餐控制模型用量的额度字段或 RPC，避免只靠前端显示限制。
-- 阅读顺序：先看新增/修改的数据结构，再看 RPC/FUNCTION，最后检查 GRANT/REVOKE、RLS 和索引；权限相关 migration 尤其要理解“谁能调用”。
-- 安全提示：设备豁免、管理员 RPC、AI 配额都属于服务端权威状态，不能由前端本地值决定。
-- 历史迁移原则：本轮只增加注释，不改变任何 SQL 语义；未来业务变化通过新的 migration 追加。

-- Add first-class per-user token quotas to AERTEX Intelligence.
-- Token quotas are independent from USD cost quotas so free/provider-credit usage can still be limited.

alter table public.ai_user_access
  add column if not exists daily_limit_tokens bigint,
  add column if not exists monthly_limit_tokens bigint;

alter table public.ai_user_access
  drop constraint if exists ai_user_access_daily_limit_tokens_check;
alter table public.ai_user_access
  add constraint ai_user_access_daily_limit_tokens_check
  check (daily_limit_tokens is null or daily_limit_tokens >= 0);

alter table public.ai_user_access
  drop constraint if exists ai_user_access_monthly_limit_tokens_check;
alter table public.ai_user_access
  add constraint ai_user_access_monthly_limit_tokens_check
  check (monthly_limit_tokens is null or monthly_limit_tokens >= 0);

create or replace function public.get_ai_runtime_config()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user uuid := auth.uid();
  v_access public.ai_user_access%rowtype;
  v_providers jsonb := '[]'::jsonb;
  v_usage jsonb;
begin
  if v_user is null then raise exception 'authenticated user required'; end if;
  if not exists (
    select 1 from public.profiles
    where id = v_user and status = 'active'
  ) then
    raise exception 'account is not active';
  end if;

  select *
  into v_access
  from public.ai_user_access
  where user_id = v_user and enabled = true;

  if not found then
    raise exception 'AI access is not enabled';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'provider', p.provider,
        'base_url', p.base_url,
        'encrypted_api_key', p.encrypted_api_key,
        'api_key_iv', p.api_key_iv,
        'default_model', p.default_model,
        'allowed_models',
          case
            when cardinality(upa.allowed_models) > 0 then
              coalesce((
                select array_agg(m order by m)
                from unnest(upa.allowed_models) as m
                where m = any(p.allowed_models)
              ), '{}'::text[])
            else p.allowed_models
          end,
        'monthly_budget_usd', p.monthly_budget_usd,
        'input_price_per_million', p.input_price_per_million,
        'output_price_per_million', p.output_price_per_million,
        'is_active', p.is_active
      )
      order by p.created_at, p.id
    ),
    '[]'::jsonb
  )
  into v_providers
  from public.ai_user_provider_access upa
  join public.ai_providers p on p.id = upa.provider_id
  where upa.user_id = v_user
    and upa.enabled = true
    and p.is_active = true;

  if jsonb_array_length(v_providers) = 0 then
    raise exception 'AI access has no active providers';
  end if;

  v_usage := jsonb_build_object(
    'today_usd', coalesce((
      select sum(u.estimated_cost_usd)
      from public.ai_usage u
      where u.user_id = v_user
        and u.created_at >= date_trunc('day', now())
    ), 0),
    'month_usd', coalesce((
      select sum(u.estimated_cost_usd)
      from public.ai_usage u
      where u.user_id = v_user
        and u.created_at >= date_trunc('month', now())
    ), 0),
    'today_tokens', coalesce((
      select sum(u.input_tokens + u.output_tokens)
      from public.ai_usage u
      where u.user_id = v_user
        and u.created_at >= date_trunc('day', now())
    ), 0),
    'month_tokens', coalesce((
      select sum(u.input_tokens + u.output_tokens)
      from public.ai_usage u
      where u.user_id = v_user
        and u.created_at >= date_trunc('month', now())
    ), 0),
    'minute_requests', (
      select count(*)
      from public.ai_usage u
      where u.user_id = v_user
        and u.created_at >= now() - interval '1 minute'
    )
  );

  return jsonb_build_object(
    'access', jsonb_build_object(
      'enabled', v_access.enabled,
      'daily_limit_usd', v_access.daily_limit_usd,
      'monthly_limit_usd', v_access.monthly_limit_usd,
      'daily_limit_tokens', v_access.daily_limit_tokens,
      'monthly_limit_tokens', v_access.monthly_limit_tokens,
      'requests_per_minute', v_access.requests_per_minute
    ),
    'providers', v_providers,
    'usage', v_usage
  );
end;
$$;

revoke all on function public.get_ai_runtime_config() from public, anon;
grant execute on function public.get_ai_runtime_config() to authenticated;

create or replace function public.get_ai_admin_state()
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
  )
  into v_result;

  return v_result;
end;
$$;

revoke all on function public.get_ai_admin_state() from public, anon;
grant execute on function public.get_ai_admin_state() to authenticated;

notify pgrst, 'reload schema';
