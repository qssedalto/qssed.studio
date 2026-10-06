-- 【初学者导读】
-- 文件：supabase/migrations/202609272115_subscription_catalog_student_pricing.sql
-- 订阅目录学生定价迁移：为套餐目录增加学生价格/折扣规则，供 Billing 权益计算使用。
-- 阅读顺序：先确认新增/修改了哪些列、表或默认值，再看索引/RLS/RPC；包含 backfill 时要理解“旧数据如何被安全地补成新结构”。
-- 隐私提示：资料身份、学生认证、订阅状态都属于服务端权威/敏感数据，前端只负责展示，不能绕过数据库权限或自行伪造状态。
-- 历史迁移原则：本轮仅增加中文注释，不改变任何 SQL 语义；后续功能变化继续通过新的 migration 追加。

begin;

insert into public.billing_plans (
  id, display_name_zh, display_name_en, description_zh, description_en,
  active, checkout_enabled, sort_order
) values
  ('aertex_free', 'Free', 'Free', '基础使用', 'Core storage', true, false, 10),
  ('aertex_mini', 'Mini', 'Mini', '轻量扩容', 'Light storage expansion', true, false, 20),
  ('aertex_plus', 'Plus', 'Plus', '日常文件', 'Everyday files', true, false, 30),
  ('aertex_pro', 'Pro', 'Pro', '照片、文档、学习资料', 'Photos, documents, and study files', true, false, 40),
  ('aertex_max', 'Max', 'Max', '主力个人云盘', 'Primary personal cloud storage', true, false, 50),
  ('aertex_ultra', 'Ultra', 'Ultra', '重度存储', 'Heavy storage', true, false, 60),
  ('aertex_studio', 'Studio', 'Studio', '创作者 / 大型项目', 'Creators and large projects', true, false, 70),
  ('aertex_vault', 'Vault', 'Vault', '超大容量长期存储', 'Very large long-term storage', true, false, 80)
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
  ('aertex_free', 'drive_storage_bytes', 10737418240),
  ('aertex_free', 'drive_max_file_bytes', 52428800),
  ('aertex_mini', 'drive_storage_bytes', 21474836480),
  ('aertex_mini', 'drive_max_file_bytes', 52428800),
  ('aertex_plus', 'drive_storage_bytes', 64424509440),
  ('aertex_plus', 'drive_max_file_bytes', 52428800),
  ('aertex_pro', 'drive_storage_bytes', 214748364800),
  ('aertex_pro', 'drive_max_file_bytes', 52428800),
  ('aertex_max', 'drive_storage_bytes', 1099511627776),
  ('aertex_max', 'drive_max_file_bytes', 52428800),
  ('aertex_ultra', 'drive_storage_bytes', 2199023255552),
  ('aertex_ultra', 'drive_max_file_bytes', 52428800),
  ('aertex_studio', 'drive_storage_bytes', 6597069766656),
  ('aertex_studio', 'drive_max_file_bytes', 52428800),
  ('aertex_vault', 'drive_storage_bytes', 13194139533312),
  ('aertex_vault', 'drive_max_file_bytes', 52428800)
on conflict (plan_id, entitlement_key) do update set
  value_bigint = excluded.value_bigint,
  value_text = null,
  updated_at = now();

insert into public.billing_prices (
  id, plan_id, currency, amount_fen, billing_interval, interval_count,
  active, provider, eligibility_key
) values
  ('mini_cny_month', 'aertex_mini', 'CNY', 390, 'month', 1, true, null, null),
  ('mini_student_cny_month', 'aertex_mini', 'CNY', 290, 'month', 1, true, null, 'student'),
  ('plus_cny_month', 'aertex_plus', 'CNY', 990, 'month', 1, true, null, null),
  ('plus_student_cny_month', 'aertex_plus', 'CNY', 790, 'month', 1, true, null, 'student'),
  ('pro_cny_month', 'aertex_pro', 'CNY', 3490, 'month', 1, true, null, null),
  ('pro_student_cny_month', 'aertex_pro', 'CNY', 2590, 'month', 1, true, null, 'student'),
  ('max_cny_month', 'aertex_max', 'CNY', 15900, 'month', 1, true, null, null),
  ('max_student_cny_month', 'aertex_max', 'CNY', 11900, 'month', 1, true, null, 'student'),
  ('ultra_cny_month', 'aertex_ultra', 'CNY', 30900, 'month', 1, true, null, null),
  ('ultra_student_cny_month', 'aertex_ultra', 'CNY', 22900, 'month', 1, true, null, 'student'),
  ('studio_cny_month', 'aertex_studio', 'CNY', 89900, 'month', 1, true, null, null),
  ('studio_student_cny_month', 'aertex_studio', 'CNY', 69900, 'month', 1, true, null, 'student'),
  ('vault_cny_month', 'aertex_vault', 'CNY', 179900, 'month', 1, true, null, null),
  ('vault_student_cny_month', 'aertex_vault', 'CNY', 139900, 'month', 1, true, null, 'student')
on conflict (id) do update set
  plan_id = excluded.plan_id,
  currency = excluded.currency,
  amount_fen = excluded.amount_fen,
  billing_interval = excluded.billing_interval,
  interval_count = excluded.interval_count,
  active = excluded.active,
  provider = excluded.provider,
  eligibility_key = excluded.eligibility_key,
  updated_at = now();

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
        'entitlements', aertex_private.billing_entitlements_for_plan(p.id),
        'prices', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'id', bp.id,
              'currency', bp.currency,
              'amount_fen', bp.amount_fen,
              'billing_interval', bp.billing_interval,
              'interval_count', bp.interval_count,
              'eligibility_key', bp.eligibility_key
            )
            order by case when bp.eligibility_key = 'student' then 1 else 0 end, bp.amount_fen
          )
          from public.billing_prices bp
          where bp.plan_id = p.id
            and bp.active = true
        ), '[]'::jsonb)
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

commit;
