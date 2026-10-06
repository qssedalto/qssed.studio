-- 【初学者导读】
-- 文件：supabase/migrations/202609131045_pkce_browser_selftest_client.sql
-- PKCE 浏览器自测客户端迁移：建立受限的测试 OAuth client，用来验证浏览器端 PKCE 流程而不影响正式客户端。
-- 阅读顺序：先看 CREATE/ALTER 了解结构变化，再看 FUNCTION/RPC，最后看 GRANT/REVOKE/RLS POLICY 理解谁能做什么。
-- 安全提示：数据库权限不是“前端隐藏按钮”；真正的边界来自角色权限、RLS、函数 SECURITY DEFINER/search_path 和 RPC 参数校验。
-- 历史迁移原则：本轮只增加中文注释，不改变任何已执行 SQL 的语义；未来若要改变行为，应新建 migration，而不是重写这份历史账本。

-- Dedicated first-party browser client for validating the QssedA Auth PKCE flow without a desktop GUI.
insert into public.oauth_clients (
  client_id,
  display_name,
  redirect_uris,
  allowed_scopes,
  is_active
) values (
  'qsseda-pkce-browser-test',
  'QssedA PKCE Self-Test',
  array['https://auth.qsseda.studio/pkce-test/callback'],
  array['profile.read', 'session.read'],
  true
)
on conflict (client_id) do update set
  display_name = excluded.display_name,
  redirect_uris = excluded.redirect_uris,
  allowed_scopes = excluded.allowed_scopes,
  is_active = true,
  updated_at = now();
