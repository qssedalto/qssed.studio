-- AERTEX Intelligence: public Chinese providers with no per-user token/USD ceilings;
-- GPT/OpenAI remains restricted to authenticated administrator profiles.
-- Still enforced: active account, provider availability, RPM anti-abuse cap,
-- provider upstream billing/free quotas, model expiration and existing admin grants.
-- This function is called only under the invoking user's auth context.
CREATE OR REPLACE FUNCTION public.get_ai_runtime_config()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
declare
  v_user uuid := auth.uid();
  v_access public.ai_user_access%rowtype;
  v_role text;
  v_providers jsonb := '[]'::jsonb;
  v_usage jsonb;
begin
  if v_user is null then raise exception 'authenticated user required'; end if;
  -- The role comes from a protected database profile, never JWT user metadata.
  select role into v_role from public.profiles
  where id = v_user and status = 'active';
  if not found then
    raise exception 'account is not active';
  end if;

  select *
  into v_access
  from public.ai_user_access
  where user_id = v_user and enabled = true;

  if v_role = 'admin' and not found then
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
            when v_role = 'admin' and cardinality(upa.allowed_models) > 0 then
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
  from public.ai_providers p
  left join public.ai_user_provider_access upa
    on upa.provider_id = p.id and upa.user_id = v_user and upa.enabled = true
  where p.is_active = true
    and (
      (v_role = 'admin' and upa.user_id is not null)
      or (v_role <> 'admin' and p.provider in ('bailian', 'zhipu'))
    );

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
      'enabled', case when v_role = 'admin' then v_access.enabled else true end,
      'daily_limit_usd', case when v_role = 'admin' then v_access.daily_limit_usd else null end,
      'monthly_limit_usd', case when v_role = 'admin' then v_access.monthly_limit_usd else null end,
      'daily_limit_tokens', case when v_role = 'admin' then v_access.daily_limit_tokens else null end,
      'monthly_limit_tokens', case when v_role = 'admin' then v_access.monthly_limit_tokens else null end,
      'requests_per_minute', case when v_role = 'admin' then v_access.requests_per_minute else greatest(coalesce(v_access.requests_per_minute, 0), 20) end
    ),
    'providers', v_providers,
    'usage', v_usage
  );
end;
$function$

