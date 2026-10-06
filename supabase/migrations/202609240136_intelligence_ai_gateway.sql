-- 【初学者导读】
-- 文件：supabase/migrations/202609240136_intelligence_ai_gateway.sql
-- Intelligence AI Gateway 基础迁移：建立模型供应商、会话/调用、密钥或网关配置所需的数据结构和 RPC。
-- 阅读顺序：先找本 migration 新增/修改了哪些表或函数，再看索引和 RLS/GRANT；最后确认它解决的是“结构、权限、性能还是兼容性”问题。
-- 初学者提醒：SQL 里的函数和策略同样是后端业务代码；前端即使隐藏功能，也不能替代数据库权限检查。
-- 历史迁移原则：这里只增加注释，不修改既有 SQL 行为；新的业务变化应通过新的 migration 向前演进。

-- AERTEX Intelligence cloud AI gateway.
-- Production schema was applied on 2026-09-24; this migration records the deployable state.

create table if not exists public.ai_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  provider text not null default 'openai' check (provider in ('openai')),
  base_url text not null default 'https://api.openai.com',
  encrypted_api_key text not null,
  api_key_iv text not null,
  key_hint text,
  default_model text not null default 'gpt-5.6',
  allowed_models text[] not null default array['gpt-5.6']::text[],
  monthly_budget_usd numeric(12,4),
  input_price_per_million numeric(12,6) not null default 0,
  output_price_per_million numeric(12,6) not null default 0,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_user_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  provider_id uuid references public.ai_providers(id) on delete set null,
  enabled boolean not null default false,
  allowed_models text[] not null default '{}'::text[],
  daily_limit_usd numeric(12,4),
  monthly_limit_usd numeric(12,4),
  requests_per_minute int not null default 20 check (requests_per_minute between 1 and 300),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_id uuid references public.ai_providers(id) on delete set null,
  model text not null,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  provider_response_id text,
  input_tokens bigint,
  output_tokens bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_id uuid references public.ai_providers(id) on delete set null,
  conversation_id uuid references public.ai_conversations(id) on delete set null,
  model text not null,
  input_tokens bigint not null default 0 check (input_tokens >= 0),
  output_tokens bigint not null default 0 check (output_tokens >= 0),
  estimated_cost_usd numeric(14,6) not null default 0 check (estimated_cost_usd >= 0),
  request_id text,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_user_created_idx on public.ai_usage(user_id, created_at desc);
create index if not exists ai_usage_provider_created_idx on public.ai_usage(provider_id, created_at desc);
create index if not exists ai_messages_conversation_created_idx on public.ai_messages(conversation_id, created_at);
create index if not exists ai_conversations_user_updated_idx on public.ai_conversations(user_id, updated_at desc);

alter table public.ai_providers enable row level security;
alter table public.ai_user_access enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_usage enable row level security;

grant select, insert, update, delete on public.ai_providers to authenticated;
grant select, insert, update, delete on public.ai_user_access to authenticated;
grant select, insert, update, delete on public.ai_conversations to authenticated;
grant select, insert on public.ai_messages to authenticated;
grant select, insert on public.ai_usage to authenticated;

drop policy if exists "ai providers admin only" on public.ai_providers;
create policy "ai providers admin only" on public.ai_providers
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "ai access own or admin read" on public.ai_user_access;
create policy "ai access own or admin read" on public.ai_user_access
for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "ai access admin write" on public.ai_user_access;
create policy "ai access admin write" on public.ai_user_access
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "ai conversations own" on public.ai_conversations;
create policy "ai conversations own" on public.ai_conversations
for all to authenticated using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "ai messages own read" on public.ai_messages;
create policy "ai messages own read" on public.ai_messages
for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "ai messages own insert" on public.ai_messages;
create policy "ai messages own insert" on public.ai_messages
for insert to authenticated with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "ai usage own read" on public.ai_usage;
create policy "ai usage own read" on public.ai_usage
for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "ai usage own insert" on public.ai_usage;
create policy "ai usage own insert" on public.ai_usage
for insert to authenticated with check (user_id = auth.uid() or public.is_admin());

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

revoke all on function public.get_ai_runtime_config() from public, anon;
grant execute on function public.get_ai_runtime_config() to authenticated;

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

revoke all on function public.get_ai_admin_state() from public, anon;
grant execute on function public.get_ai_admin_state() to authenticated;
