begin;

create schema if not exists aertex_private;
revoke all on schema aertex_private from public, anon;
grant usage on schema aertex_private to authenticated, service_role;

create table if not exists public.billing_plans (
  id text primary key,
  display_name_zh text not null,
  display_name_en text not null,
  description_zh text not null default '',
  description_en text not null default '',
  active boolean not null default true,
  checkout_enabled boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint billing_plans_id_check check (id ~ '^[a-z0-9][a-z0-9_-]{1,63}$')
);

create table if not exists public.billing_plan_entitlements (
  plan_id text not null references public.billing_plans(id) on delete cascade,
  entitlement_key text not null,
  value_bigint bigint,
  value_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (plan_id, entitlement_key),
  constraint billing_plan_entitlements_value_check check (
    (value_bigint is not null and value_text is null)
    or (value_bigint is null and value_text is not null)
  )
);

create table if not exists public.billing_prices (
  id text primary key,
  plan_id text not null references public.billing_plans(id) on delete cascade,
  currency text not null default 'CNY',
  amount_fen bigint not null check (amount_fen >= 0),
  billing_interval text not null check (billing_interval in ('month','year','one_time')),
  interval_count integer not null default 1 check (interval_count between 1 and 120),
  active boolean not null default false,
  provider text,
  provider_product_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint billing_prices_currency_check check (currency ~ '^[A-Z]{3}$')
);

create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id text not null references public.billing_plans(id),
  status text not null default 'active'
    check (status in ('active','grace','canceled','expired','refunded')),
  source text not null default 'system'
    check (source in ('system','admin_grant','alipay','wechat')),
  auto_renew boolean not null default false,
  cancel_at_period_end boolean not null default false,
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz,
  provider_subscription_id text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint billing_subscriptions_period_check check (
    current_period_end is null or current_period_end > current_period_start
  )
);

create unique index if not exists billing_subscriptions_one_effective_per_user
  on public.billing_subscriptions(user_id)
  where status in ('active','grace');

create index if not exists billing_subscriptions_user_history_idx
  on public.billing_subscriptions(user_id, created_at desc);

create table if not exists public.billing_orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  user_id uuid not null references public.profiles(id) on delete restrict,
  plan_id text not null references public.billing_plans(id),
  price_id text references public.billing_prices(id),
  provider text not null check (provider in ('alipay','wechat','admin','system')),
  amount_fen bigint not null check (amount_fen >= 0),
  currency text not null default 'CNY',
  status text not null default 'created'
    check (status in ('created','pending','paid','closed','refunded','partially_refunded')),
  provider_trade_no text,
  description text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  expires_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint billing_orders_currency_check check (currency ~ '^[A-Z]{3}$')
);

create unique index if not exists billing_orders_provider_trade_unique
  on public.billing_orders(provider, provider_trade_no)
  where provider_trade_no is not null;

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('alipay','wechat','admin','system')),
  provider_event_id text not null,
  event_type text not null,
  order_id uuid references public.billing_orders(id) on delete set null,
  subscription_id uuid references public.billing_subscriptions(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

alter table public.billing_plans enable row level security;
alter table public.billing_plan_entitlements enable row level security;
alter table public.billing_prices enable row level security;
alter table public.billing_subscriptions enable row level security;
alter table public.billing_orders enable row level security;
alter table public.billing_events enable row level security;

revoke all on public.billing_plans from public, anon, authenticated;
revoke all on public.billing_plan_entitlements from public, anon, authenticated;
revoke all on public.billing_prices from public, anon, authenticated;
revoke all on public.billing_subscriptions from public, anon, authenticated;
revoke all on public.billing_orders from public, anon, authenticated;
revoke all on public.billing_events from public, anon, authenticated;

grant select, insert, update, delete on public.billing_plans to service_role;
grant select, insert, update, delete on public.billing_plan_entitlements to service_role;
grant select, insert, update, delete on public.billing_prices to service_role;
grant select, insert, update, delete on public.billing_subscriptions to service_role;
grant select, insert, update, delete on public.billing_orders to service_role;
grant select, insert, update, delete on public.billing_events to service_role;

insert into public.billing_plans (
  id, display_name_zh, display_name_en, description_zh, description_en,
  active, checkout_enabled, sort_order
) values
  ('aertex_free', 'AERTEX Free', 'AERTEX Free', '基础账户与 5 GB AERTEX Drive。', 'Core account with 5 GB of AERTEX Drive.', true, false, 10),
  ('aertex_plus', 'AERTEX Plus', 'AERTEX Plus', '订阅测试套餐，包含 50 GB AERTEX Drive。', 'Subscription test plan with 50 GB of AERTEX Drive.', true, false, 20),
  ('aertex_pro', 'AERTEX Pro', 'AERTEX Pro', '订阅测试套餐，包含 200 GB AERTEX Drive。', 'Subscription test plan with 200 GB of AERTEX Drive.', true, false, 30)
on conflict (id) do update set
  display_name_zh = excluded.display_name_zh,
  display_name_en = excluded.display_name_en,
  description_zh = excluded.description_zh,
  description_en = excluded.description_en,
  active = excluded.active,
  checkout_enabled = excluded.checkout_enabled,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.billing_plan_entitlements (plan_id, entitlement_key, value_bigint)
values
  ('aertex_free', 'drive_storage_bytes', 5368709120),
  ('aertex_free', 'drive_max_file_bytes', 52428800),
  ('aertex_plus', 'drive_storage_bytes', 53687091200),
  ('aertex_plus', 'drive_max_file_bytes', 52428800),
  ('aertex_pro', 'drive_storage_bytes', 214748364800),
  ('aertex_pro', 'drive_max_file_bytes', 52428800)
on conflict (plan_id, entitlement_key) do update set
  value_bigint = excluded.value_bigint,
  value_text = null,
  updated_at = now();

create or replace function aertex_private.billing_entitlements_for_plan(p_plan_id text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    jsonb_object_agg(
      e.entitlement_key,
      case
        when e.value_bigint is not null then to_jsonb(e.value_bigint)
        else to_jsonb(e.value_text)
      end
      order by e.entitlement_key
    ),
    '{}'::jsonb
  )
  from public.billing_plan_entitlements e
  where e.plan_id = p_plan_id;
$$;

revoke all on function aertex_private.billing_entitlements_for_plan(text) from public, anon;
grant execute on function aertex_private.billing_entitlements_for_plan(text) to authenticated, service_role;

create or replace function aertex_private.billing_plans_json()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'display_name_zh', p.display_name_zh,
        'display_name_en', p.display_name_en,
        'description_zh', p.description_zh,
        'description_en', p.description_en,
        'checkout_enabled', p.checkout_enabled,
        'entitlements', aertex_private.billing_entitlements_for_plan(p.id)
      )
      order by p.sort_order, p.id
    ),
    '[]'::jsonb
  )
  from public.billing_plans p
  where p.active = true;
$$;

revoke all on function aertex_private.billing_plans_json() from public, anon;
grant execute on function aertex_private.billing_plans_json() to authenticated, service_role;

create or replace function aertex_private.billing_state_for_user(p_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_subscription public.billing_subscriptions;
  v_plan public.billing_plans;
  v_plan_id text := 'aertex_free';
  v_entitlements jsonb := '{}'::jsonb;
begin
  select s.*
  into v_subscription
  from public.billing_subscriptions s
  where s.user_id = p_user_id
    and s.status in ('active','grace')
    and (s.current_period_end is null or s.current_period_end > now())
  order by
    case when s.status = 'active' then 0 else 1 end,
    s.current_period_end desc nulls first,
    s.created_at desc
  limit 1;

  if v_subscription.id is not null then
    v_plan_id := v_subscription.plan_id;
  end if;

  select p.*
  into v_plan
  from public.billing_plans p
  where p.id = v_plan_id
  limit 1;

  if v_plan.id is null then
    select p.*
    into v_plan
    from public.billing_plans p
    where p.id = 'aertex_free'
    limit 1;
    v_plan_id := 'aertex_free';
    v_subscription := null;
  end if;

  v_entitlements := aertex_private.billing_entitlements_for_plan(v_plan_id);

  return jsonb_build_object(
    'plan', jsonb_build_object(
      'id', v_plan.id,
      'display_name_zh', v_plan.display_name_zh,
      'display_name_en', v_plan.display_name_en,
      'description_zh', v_plan.description_zh,
      'description_en', v_plan.description_en,
      'checkout_enabled', v_plan.checkout_enabled
    ),
    'subscription', case
      when v_subscription.id is null then null
      else jsonb_build_object(
        'id', v_subscription.id,
        'status', v_subscription.status,
        'source', v_subscription.source,
        'auto_renew', v_subscription.auto_renew,
        'cancel_at_period_end', v_subscription.cancel_at_period_end,
        'current_period_start', v_subscription.current_period_start,
        'current_period_end', v_subscription.current_period_end
      )
    end,
    'entitlements', v_entitlements,
    'plans', aertex_private.billing_plans_json()
  );
end;
$$;

revoke all on function aertex_private.billing_state_for_user(uuid) from public, anon;
grant execute on function aertex_private.billing_state_for_user(uuid) to authenticated, service_role;

create or replace function public.get_my_billing_state()
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'authenticated user required' using errcode = '42501';
  end if;

  return aertex_private.billing_state_for_user(v_user);
end;
$$;

revoke all on function public.get_my_billing_state() from public, anon;
grant execute on function public.get_my_billing_state() to authenticated, service_role;

create or replace function aertex_private.admin_get_billing_state()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  perform aertex_private.admin_assert();

  select jsonb_build_object(
    'summary', jsonb_build_object(
      'users', (select count(*)::int from public.profiles),
      'active_subscriptions', (
        select count(*)::int
        from public.billing_subscriptions s
        where s.status in ('active','grace')
          and (s.current_period_end is null or s.current_period_end > now())
      ),
      'manual_grants', (
        select count(*)::int
        from public.billing_subscriptions s
        where s.source = 'admin_grant'
          and s.status in ('active','grace')
          and (s.current_period_end is null or s.current_period_end > now())
      )
    ),
    'plans', aertex_private.billing_plans_json(),
    'users', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'user_id', p.id,
          'username', p.username,
          'display_name', p.display_name,
          'email', u.email,
          'role', p.role,
          'status', p.status,
          'billing', aertex_private.billing_state_for_user(p.id)
        )
        order by coalesce(p.last_seen_at, u.last_sign_in_at, p.created_at) desc nulls last
      )
      from public.profiles p
      left join auth.users u on u.id = p.id
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function aertex_private.admin_get_billing_state() from public, anon;
grant execute on function aertex_private.admin_get_billing_state() to authenticated, service_role;

create or replace function public.get_admin_billing_state()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select aertex_private.admin_get_billing_state();
$$;

revoke all on function public.get_admin_billing_state() from public, anon;
grant execute on function public.get_admin_billing_state() to authenticated, service_role;

create or replace function aertex_private.admin_grant_subscription(
  p_user_id uuid,
  p_plan_id text,
  p_days integer,
  p_note text default null,
  p_ip_address text default null,
  p_user_agent text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_subscription public.billing_subscriptions;
  v_plan public.billing_plans;
begin
  perform aertex_private.admin_assert();

  if p_days is null or p_days < 1 or p_days > 3650 then
    raise exception 'grant duration must be between 1 and 3650 days';
  end if;

  select * into v_plan
  from public.billing_plans
  where id = p_plan_id and active = true;

  if v_plan.id is null or v_plan.id = 'aertex_free' then
    raise exception 'invalid paid plan';
  end if;

  if not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'user profile not found';
  end if;

  update public.billing_subscriptions
  set status = 'canceled',
      cancel_at_period_end = false,
      current_period_end = now(),
      updated_at = now()
  where user_id = p_user_id
    and status in ('active','grace');

  insert into public.billing_subscriptions (
    user_id, plan_id, status, source, auto_renew, cancel_at_period_end,
    current_period_start, current_period_end, note
  )
  values (
    p_user_id, p_plan_id, 'active', 'admin_grant', false, false,
    now(), now() + make_interval(days => p_days),
    nullif(left(coalesce(p_note,''), 500), '')
  )
  returning * into v_subscription;

  perform public.write_audit_log(
    'billing.subscription.grant',
    'user',
    p_user_id::text,
    coalesce(v_plan.display_name_en, p_plan_id),
    'Administrator granted an AERTEX subscription.',
    'info',
    p_ip_address,
    p_user_agent,
    jsonb_build_object(
      'plan_id', p_plan_id,
      'days', p_days,
      'subscription_id', v_subscription.id,
      'source', 'admin_grant'
    )
  );

  return aertex_private.billing_state_for_user(p_user_id);
end;
$$;

revoke all on function aertex_private.admin_grant_subscription(uuid,text,integer,text,text,text) from public, anon;
grant execute on function aertex_private.admin_grant_subscription(uuid,text,integer,text,text,text) to authenticated, service_role;

create or replace function public.admin_grant_subscription(
  p_user_id uuid,
  p_plan_id text,
  p_days integer,
  p_note text default null,
  p_ip_address text default null,
  p_user_agent text default null
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select aertex_private.admin_grant_subscription(
    p_user_id, p_plan_id, p_days, p_note, p_ip_address, p_user_agent
  );
$$;

revoke all on function public.admin_grant_subscription(uuid,text,integer,text,text,text) from public, anon;
grant execute on function public.admin_grant_subscription(uuid,text,integer,text,text,text) to authenticated, service_role;

create or replace function aertex_private.admin_reset_subscription(
  p_user_id uuid,
  p_note text default null,
  p_ip_address text default null,
  p_user_agent text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform aertex_private.admin_assert();

  if not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'user profile not found';
  end if;

  update public.billing_subscriptions
  set status = 'canceled',
      cancel_at_period_end = false,
      current_period_end = now(),
      note = coalesce(nullif(left(coalesce(p_note,''),500),''), note),
      updated_at = now()
  where user_id = p_user_id
    and status in ('active','grace');

  perform public.write_audit_log(
    'billing.subscription.reset',
    'user',
    p_user_id::text,
    'AERTEX Free',
    'Administrator reset the account to the free plan.',
    'info',
    p_ip_address,
    p_user_agent,
    jsonb_build_object('plan_id', 'aertex_free', 'source', 'admin')
  );

  return aertex_private.billing_state_for_user(p_user_id);
end;
$$;

revoke all on function aertex_private.admin_reset_subscription(uuid,text,text,text) from public, anon;
grant execute on function aertex_private.admin_reset_subscription(uuid,text,text,text) to authenticated, service_role;

create or replace function public.admin_reset_subscription(
  p_user_id uuid,
  p_note text default null,
  p_ip_address text default null,
  p_user_agent text default null
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select aertex_private.admin_reset_subscription(
    p_user_id, p_note, p_ip_address, p_user_agent
  );
$$;

revoke all on function public.admin_reset_subscription(uuid,text,text,text) from public, anon;
grant execute on function public.admin_reset_subscription(uuid,text,text,text) to authenticated, service_role;

commit;
