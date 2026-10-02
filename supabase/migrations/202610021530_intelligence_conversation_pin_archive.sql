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
