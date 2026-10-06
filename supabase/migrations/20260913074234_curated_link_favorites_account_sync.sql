-- 【初学者导读】
-- 文件：supabase/migrations/20260913074234_curated_link_favorites_account_sync.sql
-- 收藏同步迁移：让系统精选链接的收藏状态能够跟随 AERTEX 账户保存，而不是只存在浏览器本地。
-- 阅读顺序：先看 CREATE/ALTER 了解结构变化，再看 FUNCTION/RPC，最后看 GRANT/REVOKE/RLS POLICY 理解谁能做什么。
-- 安全提示：数据库权限不是“前端隐藏按钮”；真正的边界来自角色权限、RLS、函数 SECURITY DEFINER/search_path 和 RPC 参数校验。
-- 历史迁移原则：本轮只增加中文注释，不改变任何已执行 SQL 的语义；未来若要改变行为，应新建 migration，而不是重写这份历史账本。

create table if not exists public.curated_link_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now(),
  constraint curated_link_favorites_pkey primary key (user_id, url),
  constraint curated_link_favorites_url_check check (
    char_length(url) between 1 and 1024
    and url ~* '^https://'
  )
);

alter table public.curated_link_favorites enable row level security;

revoke all on table public.curated_link_favorites from anon;
grant select, insert, delete on table public.curated_link_favorites to authenticated;
grant select, insert, update, delete on table public.curated_link_favorites to service_role;

create policy "curated favorites read own"
on public.curated_link_favorites
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "curated favorites insert own"
on public.curated_link_favorites
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "curated favorites delete own"
on public.curated_link_favorites
for delete
to authenticated
using ((select auth.uid()) = user_id);
