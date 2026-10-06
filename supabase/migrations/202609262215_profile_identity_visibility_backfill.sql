-- 【初学者导读】
-- 文件：supabase/migrations/202609262215_profile_identity_visibility_backfill.sql
-- 个人资料可见性回填：为已有用户补充新的身份可见性默认值，保证新字段上线后旧账户行为一致。
-- 阅读顺序：先确认新增/修改了哪些列、表或默认值，再看索引/RLS/RPC；包含 backfill 时要理解“旧数据如何被安全地补成新结构”。
-- 隐私提示：资料身份、学生认证、订阅状态都属于服务端权威/敏感数据，前端只负责展示，不能绕过数据库权限或自行伪造状态。
-- 历史迁移原则：本轮仅增加中文注释，不改变任何 SQL 语义；后续功能变化继续通过新的 migration 追加。

update public.profiles p
set hide_gender_on_profile = case lower(coalesce(u.raw_user_meta_data->>'hide_gender_on_profile',''))
  when 'true' then true
  when 'false' then false
  else p.hide_gender_on_profile
end,
updated_at = now()
from auth.users u
where u.id = p.id;
