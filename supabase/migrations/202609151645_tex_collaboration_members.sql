-- 【初学者导读】
-- 文件：supabase/migrations/202609151645_tex_collaboration_members.sql
-- TeX 协作成员迁移：建立文档协作成员、权限与关系结构，使多人访问不再依赖单一 owner。
-- 阅读顺序：先看 CREATE/ALTER 了解结构变化，再看 FUNCTION/RPC，最后看 GRANT/REVOKE/RLS POLICY 理解谁能做什么。
-- 安全提示：数据库权限不是“前端隐藏按钮”；真正的边界来自角色权限、RLS、函数 SECURITY DEFINER/search_path 和 RPC 参数校验。
-- 历史迁移原则：本轮只增加中文注释，不改变任何已执行 SQL 的语义；未来若要改变行为，应新建 migration，而不是重写这份历史账本。

create table if not exists public.tex_document_collaborators (
  owner_id uuid not null references public.profiles(id) on delete cascade,
  document_id uuid not null,
  member_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'viewer',
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, document_id, member_id),
  constraint tex_document_collaborators_not_self check (owner_id <> member_id),
  constraint tex_document_collaborators_role check (role in ('viewer', 'editor'))
);

create index if not exists tex_document_collaborators_member_idx
  on public.tex_document_collaborators (member_id, updated_at desc);

create index if not exists tex_document_collaborators_document_idx
  on public.tex_document_collaborators (owner_id, document_id, updated_at desc);

alter table public.tex_document_collaborators enable row level security;

revoke all on table public.tex_document_collaborators from anon;
grant select, insert, update, delete on table public.tex_document_collaborators to authenticated;
grant select, insert, update, delete on table public.tex_document_collaborators to service_role;

drop policy if exists "tex collaborators read related" on public.tex_document_collaborators;
create policy "tex collaborators read related"
  on public.tex_document_collaborators
  for select
  to authenticated
  using (owner_id = auth.uid() or member_id = auth.uid());

drop policy if exists "tex collaborators owner insert" on public.tex_document_collaborators;
create policy "tex collaborators owner insert"
  on public.tex_document_collaborators
  for insert
  to authenticated
  with check (owner_id = auth.uid() and created_by = auth.uid() and member_id <> auth.uid());

drop policy if exists "tex collaborators owner update" on public.tex_document_collaborators;
create policy "tex collaborators owner update"
  on public.tex_document_collaborators
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and created_by = auth.uid() and member_id <> auth.uid());

drop policy if exists "tex collaborators owner delete" on public.tex_document_collaborators;
create policy "tex collaborators owner delete"
  on public.tex_document_collaborators
  for delete
  to authenticated
  using (owner_id = auth.uid());

create or replace function public.tex_resolve_collaborator(p_username text)
returns table (
  id uuid,
  username text,
  display_name text,
  avatar_url text
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select p.id, p.username, p.display_name, p.avatar_url
  from public.profiles p
  where auth.uid() is not null
    and p.status = 'active'
    and p.id <> auth.uid()
    and lower(p.username) = lower(trim(p_username))
  limit 1;
$$;

revoke all on function public.tex_resolve_collaborator(text) from public;
revoke all on function public.tex_resolve_collaborator(text) from anon;
grant execute on function public.tex_resolve_collaborator(text) to authenticated;
grant execute on function public.tex_resolve_collaborator(text) to service_role;

create or replace function public.tex_collaboration_participants(p_owner_id uuid, p_document_id uuid)
returns table (
  participant_id uuid,
  role text,
  username text,
  display_name text,
  avatar_url text,
  is_owner boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    return;
  end if;

  if auth.uid() <> p_owner_id and not exists (
    select 1
    from public.tex_document_collaborators c
    where c.owner_id = p_owner_id
      and c.document_id = p_document_id
      and c.member_id = auth.uid()
  ) then
    return;
  end if;

  return query
  select
    p.id,
    'owner'::text,
    p.username,
    p.display_name,
    p.avatar_url,
    true,
    null::timestamptz,
    null::timestamptz
  from public.profiles p
  where p.id = p_owner_id

  union all

  select
    p.id,
    c.role,
    p.username,
    p.display_name,
    p.avatar_url,
    false,
    c.created_at,
    c.updated_at
  from public.tex_document_collaborators c
  join public.profiles p on p.id = c.member_id
  where c.owner_id = p_owner_id
    and c.document_id = p_document_id
    and p.status = 'active'
  order by is_owner desc, created_at asc nulls first;
end;
$$;

revoke all on function public.tex_collaboration_participants(uuid, uuid) from public;
revoke all on function public.tex_collaboration_participants(uuid, uuid) from anon;
grant execute on function public.tex_collaboration_participants(uuid, uuid) to authenticated;
grant execute on function public.tex_collaboration_participants(uuid, uuid) to service_role;
