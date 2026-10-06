-- 【初学者导读】
-- 文件：supabase/migrations/202609151745_fix_tex_collaboration_participants_ordering.sql
-- TeX 协作参与者排序修复：修正成员列表的稳定顺序，避免 UI 因数据库返回顺序不确定而出现跳动或错位。
-- 阅读顺序：先找本 migration 新增/修改了哪些表或函数，再看索引和 RLS/GRANT；最后确认它解决的是“结构、权限、性能还是兼容性”问题。
-- 初学者提醒：SQL 里的函数和策略同样是后端业务代码；前端即使隐藏功能，也不能替代数据库权限检查。
-- 历史迁移原则：这里只增加注释，不修改既有 SQL 行为；新的业务变化应通过新的 migration 向前演进。

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
    combined.participant_id,
    combined.role,
    combined.username,
    combined.display_name,
    combined.avatar_url,
    combined.is_owner,
    combined.created_at,
    combined.updated_at
  from (
    select
      p.id as participant_id,
      'owner'::text as role,
      p.username as username,
      p.display_name as display_name,
      p.avatar_url as avatar_url,
      true as is_owner,
      null::timestamptz as created_at,
      null::timestamptz as updated_at
    from public.profiles p
    where p.id = p_owner_id

    union all

    select
      p.id as participant_id,
      c.role as role,
      p.username as username,
      p.display_name as display_name,
      p.avatar_url as avatar_url,
      false as is_owner,
      c.created_at as created_at,
      c.updated_at as updated_at
    from public.tex_document_collaborators c
    join public.profiles p on p.id = c.member_id
    where c.owner_id = p_owner_id
      and c.document_id = p_document_id
      and p.status = 'active'
  ) as combined
  order by combined.is_owner desc, combined.created_at asc nulls first;
end;
$$;

revoke all on function public.tex_collaboration_participants(uuid, uuid) from public;
revoke all on function public.tex_collaboration_participants(uuid, uuid) from anon;
grant execute on function public.tex_collaboration_participants(uuid, uuid) to authenticated;
grant execute on function public.tex_collaboration_participants(uuid, uuid) to service_role;
