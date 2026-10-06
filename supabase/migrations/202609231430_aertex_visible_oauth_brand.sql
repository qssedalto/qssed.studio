-- 【初学者导读】
-- 文件：supabase/migrations/202609231430_aertex_visible_oauth_brand.sql
-- OAuth 品牌展示迁移：为授权页补充用户可见的 AERTEX 品牌/客户端元数据。
-- 阅读顺序：先找本 migration 新增/修改了哪些表或函数，再看索引和 RLS/GRANT；最后确认它解决的是“结构、权限、性能还是兼容性”问题。
-- 初学者提醒：SQL 里的函数和策略同样是后端业务代码；前端即使隐藏功能，也不能替代数据库权限检查。
-- 历史迁移原则：这里只增加注释，不修改既有 SQL 行为；新的业务变化应通过新的 migration 向前演进。

-- User-visible product branding only. Technical client IDs and redirect URIs remain unchanged.
update public.oauth_clients
set display_name = case client_id
  when 'qsseda-git-desktop' then 'AERTEX Git'
  when 'qsseda-pkce-browser-test' then 'AERTEX PKCE Self-Test'
  else display_name
end,
updated_at = now()
where client_id in ('qsseda-git-desktop', 'qsseda-pkce-browser-test');
