-- 【初学者导读】
-- 文件：supabase/migrations/202609080447_harden_rpc_rls_and_indexes.sql
-- 安全加固迁移：收紧 RPC 执行权限、固定函数 search_path、补索引并强化 RLS 策略，目标是减少权限提升和查询风险。
-- 阅读顺序：先看 CREATE/ALTER 了解结构变化，再看 FUNCTION/RPC，最后看 GRANT/REVOKE/RLS POLICY 理解谁能做什么。
-- 安全提示：数据库权限不是“前端隐藏按钮”；真正的边界来自角色权限、RLS、函数 SECURITY DEFINER/search_path 和 RPC 参数校验。
-- 历史迁移原则：本轮只增加中文注释，不改变任何已执行 SQL 的语义；未来若要改变行为，应新建 migration，而不是重写这份历史账本。

alter function public.set_updated_at() set search_path to pg_catalog;
alter function public.current_user_role() set search_path to public, auth;
alter function public.admin_assert() set search_path to public, auth;

revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.current_user_role() from public, anon, authenticated;
revoke execute on function public.admin_assert() from public, anon, authenticated;
revoke execute on function public.handle_new_user_profile() from public, anon, authenticated;
revoke execute on function public.write_audit_log(text, text, text, text, text, text, text, text, jsonb) from public, anon, authenticated;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

revoke execute on function public.get_admin_overview() from public, anon;
grant execute on function public.get_admin_overview() to authenticated;
revoke execute on function public.get_admin_users() from public, anon;
grant execute on function public.get_admin_users() to authenticated;
revoke execute on function public.get_audit_logs(text, text, text, text, timestamp with time zone, timestamp with time zone, integer) from public, anon;
grant execute on function public.get_audit_logs(text, text, text, text, timestamp with time zone, timestamp with time zone, integer) to authenticated;
revoke execute on function public.get_role_permissions() from public, anon;
grant execute on function public.get_role_permissions() to authenticated;
revoke execute on function public.update_role_permissions(text, text[], text, text) from public, anon;
grant execute on function public.update_role_permissions(text, text[], text, text) to authenticated;
revoke execute on function public.update_user_role(uuid, text, text, text) from public, anon;
grant execute on function public.update_user_role(uuid, text, text, text) to authenticated;
revoke execute on function public.update_user_status(uuid, text, text, text) from public, anon;
grant execute on function public.update_user_status(uuid, text, text, text) to authenticated;

create index if not exists role_permissions_permission_id_idx on public.role_permissions(permission_id);

alter policy "admin can read own admin row" on public.admin_users using (user_id = (select auth.uid()));
alter policy "audit logs insert own" on public.audit_logs with check (actor_user_id = (select auth.uid()));
alter policy "audit logs read admin" on public.audit_logs using ((select public.is_admin()));
alter policy "login events insert own" on public.login_events with check (user_id = (select auth.uid()));
alter policy "login events read own or admin" on public.login_events using ((user_id = (select auth.uid())) or (select public.is_admin()));
alter policy "permissions read admin" on public.permissions using ((select public.is_admin()));
alter policy "profiles insert own" on public.profiles with check ((id = (select auth.uid())) and (role = 'user'::text) and (status = 'active'::text));
alter policy "profiles read own or admin" on public.profiles using ((id = (select auth.uid())) or (select public.is_admin()));
alter policy "profiles update own basic fields" on public.profiles using ((id = (select auth.uid())) or (select public.is_admin())) with check ((select public.is_admin()) or ((id = (select auth.uid())) and (role = (select p.role from public.profiles p where p.id = (select auth.uid()))) and (status = (select p.status from public.profiles p where p.id = (select auth.uid())))));
alter policy "role_permissions read admin" on public.role_permissions using ((select public.is_admin()));
alter policy "roles read admin" on public.roles using ((select public.is_admin()));
alter policy "devices insert own" on public.user_devices with check (user_id = (select auth.uid()));
alter policy "devices read own or admin" on public.user_devices using ((user_id = (select auth.uid())) or (select public.is_admin()));
alter policy "devices update own" on public.user_devices using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
