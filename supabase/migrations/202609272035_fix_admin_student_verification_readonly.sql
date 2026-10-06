-- 【初学者导读】
-- 文件：supabase/migrations/202609272035_fix_admin_student_verification_readonly.sql
-- 学生认证管理员只读修复：限制管理端对认证记录的操作权限，避免查看功能意外获得写入能力。
-- 阅读顺序：先确认新增/修改了哪些列、表或默认值，再看索引/RLS/RPC；包含 backfill 时要理解“旧数据如何被安全地补成新结构”。
-- 隐私提示：资料身份、学生认证、订阅状态都属于服务端权威/敏感数据，前端只负责展示，不能绕过数据库权限或自行伪造状态。
-- 历史迁移原则：本轮仅增加中文注释，不改变任何 SQL 语义；后续功能变化继续通过新的 migration 追加。

begin;

-- The admin student-verification getter performs expiry cleanup before returning
-- results. Its public SQL wrapper was marked STABLE, which forces a read-only
-- execution context and makes the nested UPDATE/DELETE cleanup fail.
alter function public.get_admin_student_verifications() volatile;

commit;
