-- 【初学者导读】
-- 文件：supabase/migrations/202609231500_brand_oauth_client_aertex.sql
-- OAuth client 品牌规范化：统一正式 AERTEX 客户端名称、标识或展示信息，避免授权页出现历史命名。
-- 阅读顺序：先找本 migration 新增/修改了哪些表或函数，再看索引和 RLS/GRANT；最后确认它解决的是“结构、权限、性能还是兼容性”问题。
-- 初学者提醒：SQL 里的函数和策略同样是后端业务代码；前端即使隐藏功能，也不能替代数据库权限检查。
-- 历史迁移原则：这里只增加注释，不修改既有 SQL 行为；新的业务变化应通过新的 migration 向前演进。

-- User-facing brand rename only. Technical OAuth client_id remains stable.
update public.oauth_clients
set display_name = 'AERTEX Git',
    updated_at = now()
where client_id = 'qsseda-git-desktop'
  and display_name is distinct from 'AERTEX Git';
