-- AERTEX GitHub TeX: an operator-controlled, RLS-protected quota ledger.
-- The authenticated browser cannot query or update this table directly.
create table if not exists public.tex_github_allowances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  approval_status text not null default 'pending'
    check (approval_status in ('pending', 'approved', 'rejected')),
  requested_credits integer not null default 1
    check (requested_credits between 1 and 30),
  quota_total integer not null default 0
    check (quota_total between 0 and 100),
  quota_used integer not null default 0
    check (quota_used between 0 and quota_total),
  repo_name text unique
    check (repo_name is null or repo_name ~ '^aertex-tex-[0-9a-f]{32}$'),
  repo_id bigint unique,
  source_branch text not null default 'main'
    check (source_branch ~ '^[A-Za-z0-9._/-]{1,100}$'),
  repo_state text not null default 'none'
    check (repo_state in ('none', 'creating', 'ready', 'deleting', 'error')),
  active_nonce uuid,
  active_run_id bigint check (active_run_id is null or active_run_id > 0),
  active_commit_sha text check (active_commit_sha is null or active_commit_sha ~ '^[0-9a-f]{40}$'),
  active_since timestamptz,
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint repo_none_means_no_repository
    check (repo_state <> 'none' or (repo_name is null and repo_id is null)),
  constraint active_nonce_has_since
    check (active_nonce is null or active_since is not null)
);

alter table public.tex_github_allowances enable row level security;
revoke all on public.tex_github_allowances from PUBLIC, anon, authenticated;
grant select, insert, update, delete on public.tex_github_allowances to service_role;

-- SECURITY DEFINER must only be callable by server-side service_role.
-- No automatic 25-minute override: an unknown job state fails closed.
create or replace function public.tex_gh_reserve_credit(p_user_id uuid, p_nonce uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare remaining integer;
begin
  if p_user_id is null or p_nonce is null then return null; end if;
  update public.tex_github_allowances
     set quota_used = quota_used + 1,
         active_nonce = p_nonce,
         active_run_id = null,
         active_commit_sha = null,
         active_since = now(),
         updated_at = now()
   where user_id = p_user_id
     and approval_status = 'approved'
     and repo_state = 'ready'
     and repo_name is not null
     and repo_id is not null
     and quota_used < quota_total
     and active_nonce is null
  returning quota_total - quota_used into remaining;
  return remaining;
end;
$$;
revoke all on function public.tex_gh_reserve_credit(uuid, uuid) from PUBLIC, anon, authenticated;
grant execute on function public.tex_gh_reserve_credit(uuid, uuid) to service_role;

create or replace function public.tex_gh_release_credit(p_user_id uuid, p_nonce uuid, p_refund boolean)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare matched uuid;
begin
  update public.tex_github_allowances
     set quota_used = case when p_refund then greatest(0, quota_used - 1) else quota_used end,
         active_nonce = null,
         active_run_id = null,
         active_commit_sha = null,
         active_since = null,
         updated_at = now()
   where user_id = p_user_id and active_nonce = p_nonce
  returning p_nonce into matched;
  return matched is not null;
end;
$$;
revoke all on function public.tex_gh_release_credit(uuid, uuid, boolean) from PUBLIC, anon, authenticated;
grant execute on function public.tex_gh_release_credit(uuid, uuid, boolean) to service_role;
