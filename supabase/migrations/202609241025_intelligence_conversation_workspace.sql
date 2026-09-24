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
