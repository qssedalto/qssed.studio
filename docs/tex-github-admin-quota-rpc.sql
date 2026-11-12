-- Admin control-plane RPCs for AERTEX's isolated TeX GitHub quota ledger.
-- Use the verified caller's JWT and the existing active-profile administrator guard.
-- No service-role credential is stored in the Admin Cloudflare Worker.
create or replace function public.admin_tex_github_quota_list()
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;
  select jsonb_build_object(
    'entries', coalesce(jsonb_agg(jsonb_build_object(
      'user_id', a.user_id,
      'approval_status', a.approval_status,
      'requested_credits', a.requested_credits,
      'quota_total', a.quota_total,
      'quota_used', a.quota_used,
      'remaining', greatest(0, a.quota_total - a.quota_used),
      'repo_name', case when a.repo_state = 'ready' then a.repo_name else null end,
      'repo_state', a.repo_state,
      'active', a.active_nonce is not null,
      'last_run_at', a.last_run_at,
      'updated_at', a.updated_at,
      'profile', case when p.id is null then null else jsonb_build_object(
        'username', p.username, 'display_name', p.display_name) end
    ) order by a.updated_at desc), '[]'::jsonb),
    'pending', (select count(*) from public.tex_github_allowances where approval_status = 'pending')
  ) into result
  from (select * from public.tex_github_allowances order by updated_at desc limit 200) a
  left join public.profiles p on p.id = a.user_id;
  return result;
end;
$$;
revoke all on function public.admin_tex_github_quota_list() from public, anon, authenticated;
grant execute on function public.admin_tex_github_quota_list() to authenticated;

create or replace function public.admin_tex_github_quota_update(
  p_user_id uuid,
  p_action text,
  p_credits integer default null
)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare previous public.tex_github_allowances%rowtype;
  changed public.tex_github_allowances%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;
  if p_user_id is null or p_action not in ('approve','reject','set-total','grant') then
    raise exception 'Invalid quota action.' using errcode = '22023';
  end if;
  if p_action <> 'reject' and (p_credits is null or p_credits < 1 or p_credits > 100) then
    raise exception 'Quota must be between 1 and 100.' using errcode = '22023';
  end if;
  select * into previous from public.tex_github_allowances where user_id = p_user_id for update;
  if p_action = 'grant' then
    if found then raise exception 'Quota row already exists.' using errcode = '23505'; end if;
    insert into public.tex_github_allowances(user_id, approval_status, requested_credits, quota_total, quota_used)
    values (p_user_id, 'approved', least(p_credits,30), p_credits, 0) returning * into changed;
  elsif p_action in ('approve','reject') then
    if not found or previous.approval_status <> 'pending' or previous.active_nonce is not null then
      raise exception 'This request cannot be reviewed.' using errcode = '23514';
    end if;
    update public.tex_github_allowances
    set approval_status = case when p_action = 'approve' then 'approved' else 'rejected' end,
        quota_total = case when p_action = 'approve' then p_credits else quota_total end,
        quota_used = case when p_action = 'approve' then 0 else quota_used end,
        updated_at = now()
    where user_id = p_user_id returning * into changed;
  else
    if not found or previous.approval_status <> 'approved'
       or p_credits < previous.quota_used
       or (p_credits < previous.quota_total and previous.active_nonce is not null) then
      raise exception 'Cannot lower quota below usage or while a build is active.' using errcode = '23514';
    end if;
    update public.tex_github_allowances
       set quota_total = p_credits, updated_at = now()
     where user_id = p_user_id returning * into changed;
  end if;
  return jsonb_build_object(
    'updated', true, 'user_id', changed.user_id, 'approval_status', changed.approval_status,
    'quota_total', changed.quota_total, 'quota_used', changed.quota_used
  );
end;
$$;
revoke all on function public.admin_tex_github_quota_update(uuid,text,integer) from public, anon, authenticated;
grant execute on function public.admin_tex_github_quota_update(uuid,text,integer) to authenticated;
