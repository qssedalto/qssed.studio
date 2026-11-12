-- Keep a refund attached to the week in which its credit was reserved.
-- An Actions job crossing Monday must not decrement this week's dispatch counter.
alter table public.tex_github_allowances add column if not exists active_charge_week_start date;
create or replace function public.tex_gh_reserve_credit(p_user_id uuid,p_nonce uuid)
returns integer language plpgsql security definer set search_path=''
as $$
declare is_operator boolean;
declare available integer;
declare updated public.tex_github_allowances%rowtype;
begin
 if p_user_id is null or p_nonce is null then return null; end if;
 select exists(select 1 from public.profiles p
   where p.id=p_user_id and p.role='admin' and p.status='active') into is_operator;
 perform public.tex_gh_refresh_allowance(p_user_id);
 update public.tex_github_allowances a set
   quota_used=case when is_operator then a.quota_used else a.quota_used+1 end,
   weekly_used=case when is_operator then a.weekly_used else a.weekly_used+1 end,
   active_nonce=p_nonce,
   active_unmetered=is_operator,
   active_charge_week_start=case when is_operator then null else a.quota_week_start end,
   active_run_id=null,active_commit_sha=null,active_since=now(),updated_at=now()
 where a.user_id=p_user_id and a.approval_status='approved'
  and a.repo_state='ready' and a.repo_id is not null and a.repo_name is not null
  and a.active_nonce is null
  and (is_operator or (a.quota_total>a.quota_used and a.weekly_used<100))
 returning * into updated;
 if not found then return null; end if;
 if is_operator then return -1; end if;
 available:=least(greatest(0,updated.quota_total-updated.quota_used),100-updated.weekly_used);
 return available;
end;
$$;
revoke all on function public.tex_gh_reserve_credit(uuid,uuid) from public,anon,authenticated;
grant execute on function public.tex_gh_reserve_credit(uuid,uuid) to service_role;

create or replace function public.tex_gh_release_credit(p_user_id uuid,p_nonce uuid,p_refund boolean)
returns boolean language plpgsql security definer set search_path=''
as $$
declare matched uuid;
begin
 update public.tex_github_allowances a
   set quota_used=case when p_refund and not a.active_unmetered then greatest(0,a.quota_used-1) else a.quota_used end,
       weekly_used=case when p_refund and not a.active_unmetered
         and a.active_charge_week_start=a.quota_week_start then greatest(0,a.weekly_used-1) else a.weekly_used end,
       active_nonce=null,active_unmetered=false,active_run_id=null,
       active_charge_week_start=null,active_commit_sha=null,active_since=null,updated_at=now()
 where a.user_id=p_user_id and a.active_nonce=p_nonce
 returning a.user_id into matched;
 return matched is not null;
end;
$$;
revoke all on function public.tex_gh_release_credit(uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function public.tex_gh_release_credit(uuid,uuid,boolean) to service_role;
