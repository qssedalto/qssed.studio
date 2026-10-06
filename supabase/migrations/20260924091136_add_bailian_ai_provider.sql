-- 【初学者导读】
-- 文件：supabase/migrations/20260924091136_add_bailian_ai_provider.sql
-- Intelligence 百炼供应商迁移：为 Bailian/百炼增加 provider 配置和受控调用所需数据。
-- 阅读顺序：先看新增/修改的数据结构，再看 RPC/FUNCTION，最后检查 GRANT/REVOKE、RLS 和索引；权限相关 migration 尤其要理解“谁能调用”。
-- 安全提示：设备豁免、管理员 RPC、AI 配额都属于服务端权威状态，不能由前端本地值决定。
-- 历史迁移原则：本轮只增加注释，不改变任何 SQL 语义；未来业务变化通过新的 migration 追加。

-- Add Alibaba Cloud Bailian as an AERTEX Intelligence provider.
-- Applied to production on 2026-09-24.

alter table public.ai_providers
  drop constraint if exists ai_providers_provider_check;

alter table public.ai_providers
  add constraint ai_providers_provider_check
  check (provider in ('openai','zhipu','bailian'));

notify pgrst, 'reload schema';
