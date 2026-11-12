-- Review and grant weekly allocations; only verified active administrators may call.
create or replace function public.admin_tex_github_quota_list()
returns jsonb language plpgsql security definer set search_path=''
as $$
declare result jsonb;
declare current_week date := date_trunc('week', now() at time zone 'Asia/Shanghai')::date;
begin
 if not public.is_admin() then raise exception 'Administrator access required.' using errcode='42501'; end if;
 select jsonb_build_object(
 'entries',coalesce(jsonb_agg(jsonb_build_object(
   'user_id',a.user_id,'approval_status',a.approval_status,
   'requested_credits',a.requested_credits,'weekly_credits',a.weekly_credits,
   'quota_total',a.quota_total + case when a.approval_status='approved'
     then greatest(0,(current_week-a.quota_week_start)/7)*a.weekly_credits else 0 end,
   'quota_used',a.quota_used,
   'weekly_used',case when current_week > a.quota_week_start then 0 else a.weekly_used end,
   'remaining',case when p.role='admin' and p.status='active' then null
     else least(100-(case when current_week > a.quota_week_start then 0 else a.weekly_used end),
       greatest(0,a.quota_total+
        case when a.approval_status='approved' then greatest(0,(current_week-a.quota_week_start)/7)*a.weekly_credits else 0 end-a.quota_used)) end,
   'unlimited',p.role='admin' and p.status='active',
   'repo_name',case when a.repo_state='ready' then a.repo_name else null end,
   'repo_state',a.repo_state,'active',a.active_nonce is not null,
   'last_run_at',a.last_run_at,'updated_at',a.updated_at,
   'profile',case when p.id is null then null else jsonb_build_object('username',p.username,'display_name',p.display_name) end
 ) order by a.updated_at desc),'[]'::jsonb),
 'pending',(select count(*) from public.tex_github_allowances where approval_status='pending')
 ) into result
 from (select * from public.tex_github_allowances order by updated_at desc limit 200) a
 left join public.profiles p on p.id=a.user_id;
 return result;
end;
$$;
revoke all on function public.admin_tex_github_quota_list() from public, anon, authenticated;
grant execute on function public.admin_tex_github_quota_list() to authenticated;

create or replace function public.admin_tex_github_quota_update(p_user_id uuid,p_action text,p_credits integer default null)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare previous public.tex_github_allowances%rowtype;
declare changed public.tex_github_allowances%rowtype;
declare current_week date := date_trunc('week', now() at time zone 'Asia/Shanghai')::date;
begin
 if not public.is_admin() then raise exception 'Administrator access required.' using errcode='42501'; end if;
 if p_user_id is null or p_action not in ('approve','reject','set-total','grant') then
   raise exception 'Invalid quota action.' using errcode='22023'; end if;
 if p_action <> 'reject' and (p_credits is null or p_credits < 1 or p_credits > 100) then
   raise exception 'Weekly allowance must be 1–100 credits.' using errcode='22023'; end if;
 select * into previous from public.tex_github_allowances where user_id=p_user_id for update;
 if p_action='grant' then
  if found then raise exception 'Quota row already exists.' using errcode='23505'; end if;
  insert into public.tex_github_allowances
    (user_id,approval_status,requested_credits,quota_total,quota_used,weekly_credits,weekly_used,quota_week_start)
  values(p_user_id,'approved',p_credits,p_credits,0,p_credits,0,current_week)
  returning * into changed;
 elsif p_action in ('approve','reject') then
  if not found or previous.approval_status<>'pending' or previous.active_nonce is not null then
   raise exception 'This request cannot be reviewed.' using errcode='23514'; end if;
  update public.tex_github_allowances set
    approval_status=case when p_action='approve' then 'approved' else 'rejected' end,
    quota_total=case when p_action='approve' then p_credits else quota_total end,
    quota_used=case when p_action='approve' then 0 else quota_used end,
    weekly_credits=case when p_action='approve' then p_credits else weekly_credits end,
    weekly_used=0,quota_week_start=current_week,updated_at=now()
  where user_id=p_user_id returning * into changed;
 else
  if not found or previous.approval_status<>'approved' then
   raise exception 'No approved allocation to edit.' using errcode='23514'; end if;
  if previous.active_nonce is not null then
   raise exception 'Wait until current build completes.' using errcode='23514'; end if;
  perform public.tex_gh_refresh_allowance(p_user_id);
  update public.tex_github_allowances set
    quota_total=quota_total+greatest(0,p_credits-weekly_credits),
    weekly_credits=p_credits,
    updated_at=now()
  where user_id=p_user_id returning * into changed;
 end if;
 return jsonb_build_object('updated',true,'user_id',changed.user_id,'approval_status',changed.approval_status,
   'weekly_credits',changed.weekly_credits,'quota_total',changed.quota_total,'quota_used',changed.quota_used);
end;
$$;
revoke all on function public.admin_tex_github_quota_update(uuid,text,integer) from public, anon, authenticated;
grant execute on function public.admin_tex_github_quota_update(uuid,text,integer) to authenticated;
