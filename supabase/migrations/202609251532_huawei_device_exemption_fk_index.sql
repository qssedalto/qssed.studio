-- 【初学者导读】
-- 文件：supabase/migrations/202609251532_huawei_device_exemption_fk_index.sql
-- 华为设备豁免索引/外键修复：补齐关系约束与查询索引，防止孤儿记录并提升管理查询性能。
-- 阅读顺序：先看新增/修改的数据结构，再看 RPC/FUNCTION，最后检查 GRANT/REVOKE、RLS 和索引；权限相关 migration 尤其要理解“谁能调用”。
-- 安全提示：设备豁免、管理员 RPC、AI 配额都属于服务端权威状态，不能由前端本地值决定。
-- 历史迁移原则：本轮只增加注释，不改变任何 SQL 语义；未来业务变化通过新的 migration 追加。

create index if not exists device_access_exemptions_granted_by_idx
  on public.device_access_exemptions(granted_by);
