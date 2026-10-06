-- 【初学者导读】
-- 文件：supabase/migrations/202610021530_intelligence_conversation_pin_archive.sql
-- Intelligence 对话整理迁移：增加置顶与归档字段和索引，支持侧边栏排序而不删除历史会话。
-- 阅读顺序：先确认新增/修改了哪些列、表或默认值，再看索引/RLS/RPC；包含 backfill 时要理解“旧数据如何被安全地补成新结构”。
-- 隐私提示：资料身份、学生认证、订阅状态都属于服务端权威/敏感数据，前端只负责展示，不能绕过数据库权限或自行伪造状态。
-- 历史迁移原则：本轮仅增加中文注释，不改变任何 SQL 语义；后续功能变化继续通过新的 migration 追加。

-- ChatGPT-style conversation organization for AERTEX Intelligence.
-- Pinning affects sidebar order. Archiving removes a conversation from the default sidebar without deleting it.

alter table public.ai_conversations
  add column if not exists is_pinned boolean not null default false,
  add column if not exists pinned_at timestamptz,
  add column if not exists is_archived boolean not null default false,
  add column if not exists archived_at timestamptz;

create index if not exists ai_conversations_user_sidebar_idx
  on public.ai_conversations(user_id, is_archived, is_pinned desc, pinned_at desc, updated_at desc);

notify pgrst, 'reload schema';
