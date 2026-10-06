-- 【初学者导读】
-- 文件：supabase/migrations/202609151755_tex_collaboration_user_search.sql
-- TeX 协作用户搜索迁移：增加按用户名/显示名搜索可邀请用户的数据库能力，并受账户/隐私规则约束。
-- 阅读顺序：先找本 migration 新增/修改了哪些表或函数，再看索引和 RLS/GRANT；最后确认它解决的是“结构、权限、性能还是兼容性”问题。
-- 初学者提醒：SQL 里的函数和策略同样是后端业务代码；前端即使隐藏功能，也不能替代数据库权限检查。
-- 历史迁移原则：这里只增加注释，不修改既有 SQL 行为；新的业务变化应通过新的 migration 向前演进。

create or replace function public.tex_search_collaborators(p_query text, p_limit integer default 8)
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
    and char_length(trim(coalesce(p_query, ''))) >= 2
    and position(lower(trim(p_query)) in lower(coalesce(p.username, ''))) > 0
  order by
    case
      when lower(p.username) = lower(trim(p_query)) then 0
      when lower(p.username) like lower(trim(p_query)) || '%' then 1
      else 2
    end,
    char_length(p.username),
    lower(p.username)
  limit least(greatest(coalesce(p_limit, 8), 1), 8);
$$;

revoke all on function public.tex_search_collaborators(text, integer) from public;
revoke all on function public.tex_search_collaborators(text, integer) from anon;
grant execute on function public.tex_search_collaborators(text, integer) to authenticated;
grant execute on function public.tex_search_collaborators(text, integer) to service_role;
