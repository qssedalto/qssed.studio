-- 【初学者导读】
-- 文件：supabase/migrations/202609131015_oauth_introspection_private.sql
-- 令牌 introspection 私有化：限制 OAuth token introspection 只由受信任的服务端路径调用，避免向公共角色暴露令牌内部状态。
-- 阅读顺序：先看 CREATE/ALTER 了解结构变化，再看 FUNCTION/RPC，最后看 GRANT/REVOKE/RLS POLICY 理解谁能做什么。
-- 安全提示：数据库权限不是“前端隐藏按钮”；真正的边界来自角色权限、RLS、函数 SECURITY DEFINER/search_path 和 RPC 参数校验。
-- 历史迁移原则：本轮只增加中文注释，不改变任何已执行 SQL 的语义；未来若要改变行为，应新建 migration，而不是重写这份历史账本。

-- OAuth token introspection is a resource-server operation, not a public-client endpoint.
-- Keep the function available to privileged server roles, but remove browser/public-client execution.

revoke execute on function public.oauth_introspect_access_token(text) from anon, authenticated;
