-- AERTEX TeX GitHub rolling weekly credits; Asia/Shanghai Mondays, capped at 100 jobs per week.
-- Approved user receives at most 100 NEW credits weekly. Unused balance carries indefinitely.
-- Operators with active admin profile are exempt from credit and weekly spend caps.
alter table public.tex_github_allowances drop constraint if exists tex_github_allowances_quota_total_check;
alter table public.tex_github_allowances drop constraint if exists tex_github_allowances_requested_credits_check;
alter table public.tex_github_allowances add constraint tex_github_allowances_requested_credits_check
  check (requested_credits between 1 and 100);
alter table public.tex_github_allowances add column if not exists weekly_credits integer not null default 100;
alter table public.tex_github_allowances add column if not exists weekly_used integer not null default 0;
alter table public.tex_github_allowances add column if not exists quota_week_start date not null
  default date_trunc('week', now() at time zone 'Asia/Shanghai')::date;
alter table public.tex_github_allowances add column if not exists active_unmetered boolean not null default false;
alter table public.tex_github_allowances add constraint tex_github_allowances_weekly_grant_check
  check (weekly_credits between 1 and 100);
alter table public.tex_github_allowances add constraint tex_github_allowances_weekly_used_check
  check (weekly_used between 0 and 100);
alter table public.tex_github_allowances add constraint tex_github_allowances_quota_total_nonnegative_check
  check (quota_total >= 0);
alter table public.tex_github_allowances enable row level security;
revoke all on public.tex_github_allowances from public, anon, authenticated;

create or replace function public.tex_gh_refresh_allowance(p_user_id uuid)
returns integer language plpgsql security definer set search_path = ''
as $$
declare now_week date := date_trunc('week', now() at time zone 'Asia/Shanghai')::date;
declare updated public.tex_github_allowances%rowtype;
begin
  update public.tex_github_allowances a
    set quota_total = a.quota_total + greatest(0,(now_week - a.quota_week_start)/7) * a.weekly_credits,
        quota_week_start = greatest(a.quota_week_start, now_week),
        weekly_used = case when now_week > a.quota_week_start then 0 else a.weekly_used end,
        updated_at = case when now_week > a.quota_week_start then now() else a.updated_at end
  where a.user_id = p_user_id and a.approval_status = 'approved'
  returning * into updated;
  if not found then return null; end if;
  if exists (select 1 from public.profiles p
    where p.id=p_user_id and p.role='admin' and p.status='active') then return -1; end if;
  return least(greatest(0, updated.quota_total-updated.quota_used),100-updated.weekly_used);
end;
$$;
revoke all on function public.tex_gh_refresh_allowance(uuid) from public, anon, authenticated;
grant execute on function public.tex_gh_refresh_allowance(uuid) to service_role;

create or replace function public.tex_gh_reserve_credit(p_user_id uuid, p_nonce uuid)
returns integer language plpgsql security definer set search_path = ''
as $$
declare is_operator boolean;
declare available integer;
declare updated public.tex_github_allowances%rowtype;
begin
  if p_user_id is null or p_nonce is null then return null; end if;
  select exists(select 1 from public.profiles p
    where p.id=p_user_id and p.role='admin' and p.status='active') into is_operator;
  perform public.tex_gh_refresh_allowance(p_user_id);
  update public.tex_github_allowances a
    set quota_used = case when is_operator then a.quota_used else a.quota_used + 1 end,
        weekly_used = case when is_operator then a.weekly_used else a.weekly_used + 1 end,
        active_nonce=p_nonce, active_unmetered=is_operator,
        active_run_id=null, active_commit_sha=null, active_since=now(), updated_at=now()
  where a.user_id=p_user_id and a.approval_status='approved'
    and a.repo_state='ready' and a.repo_id is not null and a.repo_name is not null
    and a.active_nonce is null
    and (is_operator or (a.quota_total>a.quota_used and a.weekly_used<100))
  returning * into updated;
  if not found then return null; end if;
  if is_operator then return -1; end if;
  available := least(greatest(0,updated.quota_total-updated.quota_used),100-updated.weekly_used);
  return available;
end;
$$;
revoke all on function public.tex_gh_reserve_credit(uuid,uuid) from public, anon, authenticated;
grant execute on function public.tex_gh_reserve_credit(uuid,uuid) to service_role;

create or replace function public.tex_gh_release_credit(p_user_id uuid, p_nonce uuid, p_refund boolean)
returns boolean language plpgsql security definer set search_path = ''
as $$
declare matched uuid;
begin
  update public.tex_github_allowances a
    set quota_used = case when p_refund and not a.active_unmetered then greatest(0,a.quota_used-1) else a.quota_used end,
        weekly_used = case when p_refund and not a.active_unmetered then greatest(0,a.weekly_used-1) else a.weekly_used end,
        active_nonce=null, active_unmetered=false, active_run_id=null,
        active_commit_sha=null, active_since=null, updated_at=now()
  where a.user_id=p_user_id and a.active_nonce=p_nonce
  returning a.user_id into matched;
  return matched is not null;
end;
$$;
revoke all on function public.tex_gh_release_credit(uuid,uuid,boolean) from public, anon, authenticated;
grant execute on function public.tex_gh_release_credit(uuid,uuid,boolean) to service_role;
