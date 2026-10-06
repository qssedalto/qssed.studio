-- 【初学者导读】
-- 文件：supabase/migrations/202609131005_oauth_pkce_privilege_hardening.sql
-- OAuth PKCE 权限加固：收紧前一版 OAuth/PKCE 函数、表和角色权限，防止普通客户端直接调用内部管理能力。
-- 阅读顺序：先看 CREATE/ALTER 了解结构变化，再看 FUNCTION/RPC，最后看 GRANT/REVOKE/RLS POLICY 理解谁能做什么。
-- 安全提示：数据库权限不是“前端隐藏按钮”；真正的边界来自角色权限、RLS、函数 SECURITY DEFINER/search_path 和 RPC 参数校验。
-- 历史迁移原则：本轮只增加中文注释，不改变任何已执行 SQL 的语义；未来若要改变行为，应新建 migration，而不是重写这份历史账本。

-- Supabase grants EXECUTE on newly-created public functions to API roles by default.
-- Restrict internal helpers and ensure authorization-code issuance requires an authenticated Supabase session.

revoke execute on function public.oauth_sha256_hex(text) from anon, authenticated;
revoke execute on function public.oauth_base64url(bytea) from anon, authenticated;
revoke execute on function public.oauth_redirect_allowed(text[], text) from anon, authenticated;
revoke execute on function public.oauth_scope_array(text) from anon, authenticated;

revoke execute on function public.oauth_issue_authorization_code(text, text, text, text) from anon;
grant execute on function public.oauth_issue_authorization_code(text, text, text, text) to authenticated;

-- The following are intentionally public protocol operations for a desktop public client.
-- They authenticate using possession of the authorization code, PKCE verifier, or bearer token.
grant execute on function public.oauth_validate_client(text, text, text) to anon, authenticated;
grant execute on function public.oauth_exchange_authorization_code(text, text, text, text) to anon, authenticated;
grant execute on function public.oauth_refresh_access_token(text, text) to anon, authenticated;
grant execute on function public.oauth_revoke_token(text, text) to anon, authenticated;
grant execute on function public.oauth_introspect_access_token(text) to anon, authenticated;
