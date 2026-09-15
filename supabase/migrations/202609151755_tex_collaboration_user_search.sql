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
