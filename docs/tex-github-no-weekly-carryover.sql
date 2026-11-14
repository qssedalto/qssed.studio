-- AERTEX Work GitHub: unused weekly credits expire at the next Monday
-- (Asia/Shanghai). New projects own separate R2 GitHub repositories, so
-- quota reservation MUST NOT depend on the retired account-wide repo fields.
-- Existing lifetime quota_used is retained for audit, never reset to zero.
-- Historical carried balance is intentionally discarded per product policy.
-- Admin accounts still bypass metering.
update public.tex_github_allowances
  set quota_total = quota_used + greatest(0,weekly_credits-weekly_used),
      updated_at = now()
  where approval_status='approved';

create or replace function public.tex_gh_refresh_allowance(p_user_id uuid)
returns integer language plpgsql security definer set search_path=''
as $$
declare now_week date := date_trunc('week',now() at time zone 'Asia/Shanghai')::date;
declare updated public.tex_github_allowances%rowtype;
begin
  update public.tex_github_allowances a
  set quota_total = a.quota_used +
      case when now_week > a.quota_week_start
        then a.weekly_credits
        else greatest(0,a.weekly_credits-a.weekly_used) end,
      quota_week_start = greatest(a.quota_week_start,now_week),
      weekly_used = case when now_week > a.quota_week_start then 0 else a.weekly_used end,
      updated_at = case when now_week > a.quota_week_start then now() else a.updated_at end
  where a.user_id=p_user_id and a.approval_status='approved'
  returning * into updated;
  if not found then return null; end if;
  if exists(select 1 from public.profiles p
    where p.id=p_user_id and p.role='admin' and p.status='active') then return -1; end if;
  return greatest(0,updated.weekly_credits-updated.weekly_used);
end;
$$;
revoke all on function public.tex_gh_refresh_allowance(uuid) from public,anon,authenticated;
grant execute on function public.tex_gh_refresh_allowance(uuid) to service_role;

create or replace function public.tex_gh_reserve_credit(p_user_id uuid,p_nonce uuid)
returns integer language plpgsql security definer set search_path=''
as $$
declare is_operator boolean;
declare updated public.tex_github_allowances%rowtype;
begin
  if p_user_id is null or p_nonce is null then return null; end if;
  select exists(select 1 from public.profiles p
    where p.id=p_user_id and p.role='admin' and p.status='active') into is_operator;
  perform public.tex_gh_refresh_allowance(p_user_id);
  update public.tex_github_allowances a
  set quota_used=case when is_operator then a.quota_used else a.quota_used+1 end,
      weekly_used=case when is_operator then a.weekly_used else a.weekly_used+1 end,
      active_nonce=p_nonce,active_unmetered=is_operator,
      active_charge_week_start=case when is_operator then null else a.quota_week_start end,
      active_run_id=null,active_commit_sha=null,active_since=now(),updated_at=now()
  where a.user_id=p_user_id and a.approval_status='approved'
    and a.active_nonce is null
    and (is_operator or a.weekly_used<a.weekly_credits)
  returning * into updated;
  if not found then return null; end if;
  if is_operator then return -1; end if;
  return greatest(0,updated.weekly_credits-updated.weekly_used);
end;
$$;
revoke all on function public.tex_gh_reserve_credit(uuid,uuid) from public,anon,authenticated;
grant execute on function public.tex_gh_reserve_credit(uuid,uuid) to service_role;
