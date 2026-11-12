-- AERTEX admin: deliberate, audited account deletion.
-- Only the existing short-lived, live, authenticated Admin session may invoke it.
-- R2/Watch objects are checked separately by the Admin Worker. Auth is deleted
-- only when Supabase Storage has no ownership and no GitHub repo is outstanding.
create or replace function aertex_private.admin_delete_user(
  p_user_id uuid,
  p_confirmation text,
  p_ip_address text default null,
  p_user_agent text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text;
  v_username text;
  v_role text;
  v_status text;
begin
  perform aertex_private.admin_assert();

  if p_user_id is null or p_user_id = auth.uid()
     or p_confirmation is distinct from p_user_id::text then
    raise exception 'Invalid deletion confirmation or protected account.'
      using errcode = '42501';
  end if;

  select u.email::text, p.username, p.role, p.status
    into v_email, v_username, v_role, v_status
    from auth.users u
    join public.profiles p on p.id = u.id
   where u.id = p_user_id
   for update of u, p;

  if not found then
    raise exception 'Target account does not exist.'
      using errcode = 'P0002';
  end if;
  if v_role = 'admin'
     or exists(select 1 from public.admin_users au where au.user_id = p_user_id) then
    raise exception 'Administrator accounts cannot be deleted here.'
      using errcode = '42501';
  end if;
  -- Disable the account before attempting a permanent, cross-service delete.
  if v_status not in ('suspended','banned') then
    raise exception 'Suspend or ban the account before permanent deletion.'
      using errcode = '23514';
  end if;

  if exists (
    select 1 from storage.objects o
     where o.owner = p_user_id or o.owner_id = p_user_id::text
  ) then
    raise exception 'Supabase Storage objects must be cleared first.'
      using errcode = '23514';
  end if;
  if exists (
    select 1 from public.tex_github_allowances a
     where a.user_id = p_user_id
       and (a.repo_id is not null
         or coalesce(a.repo_name,'') <> ''
         or a.repo_state not in ('none','error'))
  ) then
    raise exception 'The managed GitHub repository must be removed first.'
      using errcode = '23514';
  end if;

  perform public.write_audit_log(
    'user.delete',
    'user',
    p_user_id::text,
    coalesce(v_email,v_username,p_user_id::text),
    'Administrator permanently deleted the account after safety checks.',
    'danger',
    p_ip_address,
    p_user_agent,
    jsonb_build_object(
      'role',v_role,
      'previous_status',v_status,
      'auth_deleted',true,
      'r2_preflight','no_known_objects'
    )
  );

  -- Cascading foreign keys clear profile, sessions, quota and related
  -- relational data in the same transaction. No arbitrary user rows touched.
  delete from auth.users where id = p_user_id;
  if not found then
    raise exception 'Account removal failed.' using errcode = 'P0002';
  end if;
  return jsonb_build_object('deleted',true,'user_id',p_user_id);
end;
$$;

revoke all on function aertex_private.admin_delete_user(uuid,text,text,text)
  from public,anon,authenticated;
grant execute on function aertex_private.admin_delete_user(uuid,text,text,text)
  to authenticated;

create or replace function public.admin_delete_user(
  p_user_id uuid,
  p_confirmation text,
  p_ip_address text default null,
  p_user_agent text default null
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select aertex_private.admin_delete_user(
    p_user_id,p_confirmation,p_ip_address,p_user_agent
  );
$$;

revoke all on function public.admin_delete_user(uuid,text,text,text)
  from public,anon,authenticated;
grant execute on function public.admin_delete_user(uuid,text,text,text)
  to authenticated;
