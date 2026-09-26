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
