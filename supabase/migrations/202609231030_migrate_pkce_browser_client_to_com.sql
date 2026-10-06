-- 【初学者导读】
-- 文件：supabase/migrations/202609231030_migrate_pkce_browser_client_to_com.sql
-- OAuth 客户端域名迁移：把 PKCE 浏览器客户端迁移到新的正式域名/redirect URI，保持旧授权流程安全过渡。
-- 阅读顺序：先找本 migration 新增/修改了哪些表或函数，再看索引和 RLS/GRANT；最后确认它解决的是“结构、权限、性能还是兼容性”问题。
-- 初学者提醒：SQL 里的函数和策略同样是后端业务代码；前端即使隐藏功能，也不能替代数据库权限检查。
-- 历史迁移原则：这里只增加注释，不修改既有 SQL 行为；新的业务变化应通过新的 migration 向前演进。

-- Move the first-party browser PKCE self-test callback to the qsseda.com Auth origin.
update public.oauth_clients
set redirect_uris = array['https://auth.qsseda.com/pkce-test/callback'],
    updated_at = now()
where client_id = 'qsseda-pkce-browser-test';
