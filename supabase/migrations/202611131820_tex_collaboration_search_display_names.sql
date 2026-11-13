-- Search current active collaborators by username/email-like handle or
-- profile display name. Do not mistake an 8-row directory prefetch for an
-- exhaustive user list; all lookups are scoped to the caller's actual query.
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
  from public.profiles as p
  where auth.uid() is not null
    and p.status = 'active'
    and p.id <> auth.uid()
    and char_length(trim(coalesce(p_query, ''))) between 1 and 80
    and (
      position(lower(trim(p_query)) in lower(coalesce(p.username, ''))) > 0
      or position(lower(trim(p_query)) in lower(coalesce(p.display_name, ''))) > 0
    )
  order by
    case when lower(p.username) = lower(trim(p_query)) then 0
         when lower(coalesce(p.display_name, '')) = lower(trim(p_query)) then 1
         when lower(p.username) like lower(trim(p_query)) || '%' then 2
         when lower(coalesce(p.display_name, '')) like lower(trim(p_query)) || '%' then 3
         else 4 end,
    char_length(p.username),
    lower(p.username)
  limit least(greatest(coalesce(p_limit, 8), 1), 8);
$$;
revoke all on function public.tex_search_collaborators(text, integer) from public;
revoke all on function public.tex_search_collaborators(text, integer) from anon;
grant execute on function public.tex_search_collaborators(text, integer) to authenticated;
grant execute on function public.tex_search_collaborators(text, integer) to service_role;
