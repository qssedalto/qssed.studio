-- 【初学者导读】
-- 文件：supabase/migrations/202609240150_intelligence_rls_indexes.sql
-- Intelligence 安全与性能迁移：为 AI 表补 RLS、索引和权限，确保用户只能访问自己的会话/配置且查询保持高效。
-- 阅读顺序：先找本 migration 新增/修改了哪些表或函数，再看索引和 RLS/GRANT；最后确认它解决的是“结构、权限、性能还是兼容性”问题。
-- 初学者提醒：SQL 里的函数和策略同样是后端业务代码；前端即使隐藏功能，也不能替代数据库权限检查。
-- 历史迁移原则：这里只增加注释，不修改既有 SQL 行为；新的业务变化应通过新的 migration 向前演进。

create index if not exists ai_conversations_provider_idx on public.ai_conversations(provider_id);
create index if not exists ai_messages_user_idx on public.ai_messages(user_id);
create index if not exists ai_providers_created_by_idx on public.ai_providers(created_by);
create index if not exists ai_usage_conversation_idx on public.ai_usage(conversation_id);
create index if not exists ai_user_access_provider_idx on public.ai_user_access(provider_id);
create index if not exists ai_user_access_updated_by_idx on public.ai_user_access(updated_by);

drop policy if exists "ai access own or admin read" on public.ai_user_access;
drop policy if exists "ai access admin write" on public.ai_user_access;
drop policy if exists "ai access admin insert" on public.ai_user_access;
drop policy if exists "ai access admin update" on public.ai_user_access;
drop policy if exists "ai access admin delete" on public.ai_user_access;

create policy "ai access own or admin read" on public.ai_user_access
for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());

create policy "ai access admin insert" on public.ai_user_access
for insert to authenticated with check (public.is_admin());

create policy "ai access admin update" on public.ai_user_access
for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "ai access admin delete" on public.ai_user_access
for delete to authenticated using (public.is_admin());

drop policy if exists "ai conversations own" on public.ai_conversations;
create policy "ai conversations own" on public.ai_conversations
for all to authenticated
using (user_id = (select auth.uid()) or public.is_admin())
with check (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "ai messages own read" on public.ai_messages;
create policy "ai messages own read" on public.ai_messages
for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "ai messages own insert" on public.ai_messages;
create policy "ai messages own insert" on public.ai_messages
for insert to authenticated with check (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "ai usage own read" on public.ai_usage;
create policy "ai usage own read" on public.ai_usage
for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "ai usage own insert" on public.ai_usage;
create policy "ai usage own insert" on public.ai_usage
for insert to authenticated with check (user_id = (select auth.uid()) or public.is_admin());
