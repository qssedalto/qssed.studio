-- 【初学者导读】
-- 文件：supabase/migrations/202609240145_intelligence_official_costs.sql
-- Intelligence 官方成本迁移：记录官方模型价格/成本规则，供用量核算和额度控制使用。
-- 阅读顺序：先找本 migration 新增/修改了哪些表或函数，再看索引和 RLS/GRANT；最后确认它解决的是“结构、权限、性能还是兼容性”问题。
-- 初学者提醒：SQL 里的函数和策略同样是后端业务代码；前端即使隐藏功能，也不能替代数据库权限检查。
-- 历史迁移原则：这里只增加注释，不修改既有 SQL 行为；新的业务变化应通过新的 migration 向前演进。

alter table public.ai_providers
  add column if not exists encrypted_admin_key text,
  add column if not exists admin_key_iv text,
  add column if not exists admin_key_hint text;

create or replace function public.get_ai_runtime_config()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user uuid := auth.uid();
  v_result jsonb;
begin
  if v_user is null then raise exception 'authenticated user required'; end if;
  if not exists (select 1 from public.profiles where id=v_user and status='active') then
    raise exception 'account is not active';
  end if;

  select jsonb_build_object(
    'access', jsonb_build_object(
      'enabled', a.enabled,
      'provider_id', a.provider_id,
      'allowed_models', a.allowed_models,
      'daily_limit_usd', a.daily_limit_usd,
      'monthly_limit_usd', a.monthly_limit_usd,
      'requests_per_minute', a.requests_per_minute
    ),
    'provider', jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'provider', p.provider,
      'base_url', p.base_url,
      'encrypted_api_key', p.encrypted_api_key,
      'api_key_iv', p.api_key_iv,
      'default_model', p.default_model,
      'allowed_models', p.allowed_models,
      'monthly_budget_usd', p.monthly_budget_usd,
      'input_price_per_million', p.input_price_per_million,
      'output_price_per_million', p.output_price_per_million,
      'is_active', p.is_active
    ),
    'usage', jsonb_build_object(
      'today_usd', coalesce((select sum(u.estimated_cost_usd) from public.ai_usage u where u.user_id=v_user and u.created_at >= date_trunc('day', now())),0),
      'month_usd', coalesce((select sum(u.estimated_cost_usd) from public.ai_usage u where u.user_id=v_user and u.created_at >= date_trunc('month', now())),0),
      'minute_requests', (select count(*) from public.ai_usage u where u.user_id=v_user and u.created_at >= now() - interval '1 minute')
    )
  ) into v_result
  from public.ai_user_access a
  join public.ai_providers p on p.id=a.provider_id
  where a.user_id=v_user and a.enabled=true and p.is_active=true;

  if v_result is null then raise exception 'AI access is not enabled'; end if;
  return v_result;
end;
$$;

create or replace function public.get_ai_admin_state()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare v_result jsonb;
begin
  perform public.admin_assert();
  select jsonb_build_object(
    'providers', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.id, 'name', p.name, 'provider', p.provider, 'base_url', p.base_url,
        'key_hint', p.key_hint, 'default_model', p.default_model, 'allowed_models', p.allowed_models,
        'monthly_budget_usd', p.monthly_budget_usd, 'is_active', p.is_active,
        'input_price_per_million', p.input_price_per_million,
        'output_price_per_million', p.output_price_per_million,
        'created_at', p.created_at, 'updated_at', p.updated_at,
        'month_usage_usd', coalesce((select sum(u.estimated_cost_usd) from public.ai_usage u where u.provider_id=p.id and u.created_at >= date_trunc('month', now())),0),
        'month_requests', (select count(*) from public.ai_usage u where u.provider_id=p.id and u.created_at >= date_trunc('month', now()))
      ) order by p.created_at desc) from public.ai_providers p
    ), '[]'::jsonb),
    'users', coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id', pr.id, 'username', pr.username, 'display_name', pr.display_name, 'email', au.email,
        'role', pr.role, 'status', pr.status,
        'enabled', coalesce(a.enabled,false), 'provider_id', a.provider_id,
        'allowed_models', coalesce(a.allowed_models,'{}'::text[]),
        'daily_limit_usd', a.daily_limit_usd, 'monthly_limit_usd', a.monthly_limit_usd,
        'requests_per_minute', coalesce(a.requests_per_minute,20),
        'month_usage_usd', coalesce((select sum(u.estimated_cost_usd) from public.ai_usage u where u.user_id=pr.id and u.created_at >= date_trunc('month', now())),0)
      ) order by coalesce(pr.last_seen_at, pr.created_at) desc)
      from public.profiles pr
      left join auth.users au on au.id=pr.id
      left join public.ai_user_access a on a.user_id=pr.id
    ), '[]'::jsonb)
  ) into v_result;
  return v_result;
end;
$$;
