-- 【初学者导读】
-- 文件：supabase/migrations/202609261610_shared_conversation_author_choice.sql
-- 共享会话作者选择迁移：让共享对话明确记录/展示作者选择或身份归属，避免共享页面混淆谁生成了内容。
-- 阅读顺序：先确认新增/修改了哪些列、表或默认值，再看索引/RLS/RPC；包含 backfill 时要理解“旧数据如何被安全地补成新结构”。
-- 隐私提示：资料身份、学生认证、订阅状态都属于服务端权威/敏感数据，前端只负责展示，不能绕过数据库权限或自行伪造状态。
-- 历史迁移原则：本轮仅增加中文注释，不改变任何 SQL 语义；后续功能变化继续通过新的 migration 追加。

-- Let conversation owners choose whether their public share page shows their profile name.
-- Existing and newly shared conversations remain anonymous unless explicitly opted in.

alter table public.ai_conversations
  add column if not exists share_author_name boolean not null default false;

create or replace function public.get_shared_ai_conversation(p_share_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'conversation', jsonb_build_object(
      'id', c.id,
      'title', c.title,
      'model', c.model,
      'created_at', c.created_at,
      'updated_at', c.updated_at,
      'author_name', case
        when c.share_author_name then coalesce(nullif(btrim(p.display_name), ''), nullif(btrim(p.username), ''))
        else null
      end
    ),
    'messages', coalesce((
      select jsonb_agg(jsonb_build_object('id', m.id, 'role', m.role, 'content', m.content, 'created_at', m.created_at) order by m.created_at, m.id)
      from public.ai_messages m
      where m.conversation_id = c.id
    ), '[]'::jsonb)
  )
  from public.ai_conversations c
  left join public.profiles p on p.id = c.user_id
  where c.is_shared = true and c.share_token = p_share_token
  limit 1;
$$;

revoke all on function public.get_shared_ai_conversation(uuid) from public;
grant execute on function public.get_shared_ai_conversation(uuid) to anon, authenticated;

notify pgrst, 'reload schema';
