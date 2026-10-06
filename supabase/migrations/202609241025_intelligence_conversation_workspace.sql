-- 【初学者导读】
-- 文件：supabase/migrations/202609241025_intelligence_conversation_workspace.sql
-- Intelligence 会话工作区迁移：为对话增加 workspace/组织维度，使会话可以按工作区归类和权限管理。
-- 阅读顺序：先看新增/修改的数据结构，再看 RPC/FUNCTION，最后检查 GRANT/REVOKE、RLS 和索引；权限相关 migration 尤其要理解“谁能调用”。
-- 安全提示：设备豁免、管理员 RPC、AI 配额都属于服务端权威状态，不能由前端本地值决定。
-- 历史迁移原则：本轮只增加注释，不改变任何 SQL 语义；未来业务变化通过新的 migration 追加。

-- Persistent private AERTEX Intelligence conversations with explicit share links.
-- Conversations remain account-owned and are not exposed through the ordinary file browser.

alter table public.ai_conversations
  add column if not exists is_shared boolean not null default false,
  add column if not exists share_token uuid,
  add column if not exists shared_at timestamptz;

create unique index if not exists ai_conversations_share_token_uidx
  on public.ai_conversations(share_token)
  where share_token is not null;

drop policy if exists "ai messages own insert" on public.ai_messages;
create policy "ai messages own insert"
on public.ai_messages
for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.ai_conversations c
    where c.id = conversation_id
      and c.user_id = auth.uid()
  )
  or public.is_admin()
);

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
      'updated_at', c.updated_at
    ),
    'messages', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', m.id,
          'role', m.role,
          'content', m.content,
          'created_at', m.created_at
        )
        order by m.created_at, m.id
      )
      from public.ai_messages m
      where m.conversation_id = c.id
    ), '[]'::jsonb)
  )
  from public.ai_conversations c
  where c.is_shared = true
    and c.share_token = p_share_token
  limit 1;
$$;

revoke all on function public.get_shared_ai_conversation(uuid) from public;
grant execute on function public.get_shared_ai_conversation(uuid) to anon, authenticated;

notify pgrst, 'reload schema';
