-- 【初学者导读】
-- 文件：supabase/migrations/202609131440_knowledge_documents_search_v1.sql
-- Knowledge 文档检索迁移：建立知识文档结构、搜索索引/函数和必要权限，为站内知识搜索提供数据库基础。
-- 阅读顺序：先看 CREATE/ALTER 了解结构变化，再看 FUNCTION/RPC，最后看 GRANT/REVOKE/RLS POLICY 理解谁能做什么。
-- 安全提示：数据库权限不是“前端隐藏按钮”；真正的边界来自角色权限、RLS、函数 SECURITY DEFINER/search_path 和 RPC 参数校验。
-- 历史迁移原则：本轮只增加中文注释，不改变任何已执行 SQL 的语义；未来若要改变行为，应新建 migration，而不是重写这份历史账本。

-- QssedA Knowledge Base user documents and literal substring search.
-- Search intentionally uses position(lower(query) in lower(text)) instead of token-only FTS
-- so Chinese phrases and single CJK characters are first-class search inputs.

create table if not exists public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  summary text not null default '',
  content text not null default '',
  category text not null default 'personal',
  language text not null default 'zh',
  source_url text not null default '',
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint knowledge_documents_title_length check (char_length(title) between 1 and 240),
  constraint knowledge_documents_summary_length check (char_length(summary) <= 2000),
  constraint knowledge_documents_content_length check (char_length(content) <= 200000),
  constraint knowledge_documents_category_length check (char_length(category) between 1 and 80),
  constraint knowledge_documents_language check (language in ('zh', 'en', 'mixed')),
  constraint knowledge_documents_source_url_length check (char_length(source_url) <= 2048)
);

alter table public.knowledge_documents enable row level security;

create index if not exists knowledge_documents_user_updated_idx
  on public.knowledge_documents(user_id, updated_at desc);

create index if not exists knowledge_documents_user_category_idx
  on public.knowledge_documents(user_id, category)
  where is_archived = false;

revoke all on table public.knowledge_documents from anon;
grant select, insert, update, delete on table public.knowledge_documents to authenticated;

create policy "knowledge_documents_select_own"
  on public.knowledge_documents
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "knowledge_documents_insert_own"
  on public.knowledge_documents
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "knowledge_documents_update_own"
  on public.knowledge_documents
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "knowledge_documents_delete_own"
  on public.knowledge_documents
  for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.knowledge_documents_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.knowledge_documents_set_updated_at() from public;

drop trigger if exists knowledge_documents_set_updated_at on public.knowledge_documents;
create trigger knowledge_documents_set_updated_at
before update on public.knowledge_documents
for each row execute function public.knowledge_documents_set_updated_at();

create or replace function public.search_knowledge_documents(
  p_query text,
  p_limit integer default 40
)
returns table (
  id uuid,
  title text,
  summary text,
  content text,
  category text,
  language text,
  source_url text,
  updated_at timestamptz,
  match_rank integer
)
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  with params as (
    select lower(btrim(coalesce(p_query, ''))) as q,
           least(greatest(coalesce(p_limit, 40), 1), 100) as result_limit
  )
  select
    d.id,
    d.title,
    d.summary,
    d.content,
    d.category,
    d.language,
    d.source_url,
    d.updated_at,
    case
      when lower(d.title) = params.q then 0
      when position(params.q in lower(d.title)) > 0 then 1
      when position(params.q in lower(d.summary)) > 0 then 2
      else 3
    end as match_rank
  from public.knowledge_documents d
  cross join params
  where auth.uid() = d.user_id
    and d.is_archived = false
    and params.q <> ''
    and (
      position(params.q in lower(d.title)) > 0
      or position(params.q in lower(d.summary)) > 0
      or position(params.q in lower(d.content)) > 0
    )
  order by match_rank asc, d.updated_at desc
  limit (select result_limit from params);
$$;

revoke all on function public.search_knowledge_documents(text, integer) from public, anon;
grant execute on function public.search_knowledge_documents(text, integer) to authenticated;
