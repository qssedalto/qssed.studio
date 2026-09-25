drop function if exists public.get_device_access_exemptions();

create function public.get_device_access_exemptions()
returns table (
  user_id uuid,
  username text,
  display_name text,
  enabled boolean,
  expires_at timestamptz,
  note text,
  granted_at timestamptz,
  updated_at timestamptz
)
language sql
security invoker
set search_path = public
as $$
  select
    e.user_id,
    p.username,
    p.display_name,
    e.enabled,
    e.expires_at,
    e.note,
    e.granted_at,
    e.updated_at
  from public.device_access_exemptions e
  join public.profiles p on p.id = e.user_id
  where (select public.is_admin())
    and e.policy = 'huawei_device'
  order by e.updated_at desc;
$$;

revoke all on function public.get_device_access_exemptions() from public, anon;
grant execute on function public.get_device_access_exemptions() to authenticated;
