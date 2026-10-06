-- 【初学者导读】
-- 文件：supabase/migrations/202609161240_tex_collaboration_member_leave.sql
-- TeX 协作成员退出迁移：补充成员主动离开文档的 RPC/权限规则，并处理 owner/成员关系边界。
-- 阅读顺序：先找本 migration 新增/修改了哪些表或函数，再看索引和 RLS/GRANT；最后确认它解决的是“结构、权限、性能还是兼容性”问题。
-- 初学者提醒：SQL 里的函数和策略同样是后端业务代码；前端即使隐藏功能，也不能替代数据库权限检查。
-- 历史迁移原则：这里只增加注释，不修改既有 SQL 行为；新的业务变化应通过新的 migration 向前演进。

drop policy if exists "tex collaborators member leave" on public.tex_document_collaborators;
create policy "tex collaborators member leave"
  on public.tex_document_collaborators
  for delete
  to authenticated
  using (member_id = auth.uid());
