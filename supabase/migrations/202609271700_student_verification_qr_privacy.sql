begin;

create table if not exists public.student_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'chsi' check (provider = 'chsi'),
  method text not null default 'qr_official_target'
    check (method = 'qr_official_target'),
  status text not null default 'pending'
    check (status in ('pending','verified','rejected','expired')),
  target_hash text not null,
  target_host text not null,
  school_name text,
  education_level text,
  report_expires_at timestamptz,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  verified_at timestamptz,
  verified_by uuid references public.profiles(id) on delete set null,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_verifications_target_hash_format
    check (target_hash ~ '^[0-9a-f]{64}$')
);

create index if not exists student_verifications_user_history_idx
  on public.student_verifications(user_id, submitted_at desc);

create index if not exists student_verifications_status_idx
  on public.student_verifications(status, submitted_at desc);

create unique index if not exists student_verifications_active_target_unique
  on public.student_verifications(target_hash)
  where status in ('pending','verified');

create unique index if not exists student_verifications_one_pending_per_user
  on public.student_verifications(user_id)
  where status = 'pending';

alter table public.student_verifications enable row level security;
revoke all on public.student_verifications from public, anon, authenticated;
grant select, insert, update, delete on public.student_verifications to service_role;

create table if not exists aertex_private.student_verification_targets (
  verification_id uuid primary key references public.student_verifications(id) on delete cascade,
  target_url text not null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_verification_target_length check (char_length(target_url) between 1 and 1200)
);

revoke all on aertex_private.student_verification_targets from public, anon, authenticated;
grant select, insert, update, delete on aertex_private.student_verification_targets to service_role;

create or replace function aertex_private.purge_expired_student_verification_targets()
returns integer
language plpgsql
security definer
set search_path = ''
as $
declare
  v_count integer := 0;
begin
  update public.student_verifications sv
  set status = 'expired',
      updated_at = now()
  where sv.status = 'pending'
    and exists (
      select 1
      from aertex_private.student_verification_targets t
      where t.verification_id = sv.id
        and t.expires_at <= now()
    );

  delete from aertex_private.student_verification_targets
  where expires_at <= now();

  get diagnostics v_count = row_count;
  return v_count;
end;
$;

revoke all on function aertex_private.purge_expired_student_verification_targets() from public, anon;
grant execute on function aertex_private.purge_expired_student_verification_targets() to authenticated, service_role;

alter table public.billing_prices
  add column if not exists eligibility_key text;

alter table public.billing_prices
  drop constraint if exists billing_prices_eligibility_key_check;

alter table public.billing_prices
  add constraint billing_prices_eligibility_key_check
  check (
    eligibility_key is null
    or eligibility_key ~ '^[a-z][a-z0-9_.-]{1,63}$'
  );

create or replace function aertex_private.is_allowed_chsi_verification_target(p_target text)
returns boolean
language sql
immutable
security definer
set search_path = ''
as $$
  select coalesce(p_target, '') ~* '^https://([a-z0-9-]+\.)*chsi\.com\.cn/xlcx/[^[:space:]]*$';
$$;

revoke all on function aertex_private.is_allowed_chsi_verification_target(text) from public, anon;
grant execute on function aertex_private.is_allowed_chsi_verification_target(text) to authenticated, service_role;

create or replace function aertex_private.student_eligibility_for_user(p_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_row public.student_verifications;
  v_status text := 'not_submitted';
  v_eligible boolean := false;
begin
  select *
  into v_row
  from public.student_verifications
  where user_id = p_user_id
  order by submitted_at desc, created_at desc
  limit 1;

  if v_row.id is null then
    return jsonb_build_object(
      'key', 'student',
      'eligible', false,
      'status', 'not_submitted',
      'provider', 'chsi',
      'method', 'qr_official_target'
    );
  end if;

  v_status := v_row.status;
  if v_row.status = 'verified'
     and v_row.report_expires_at is not null
     and v_row.report_expires_at <= now() then
    v_status := 'expired';
  end if;

  v_eligible := v_row.status = 'verified'
    and v_row.report_expires_at is not null
    and v_row.report_expires_at > now();

  return jsonb_build_object(
    'key', 'student',
    'eligible', v_eligible,
    'status', v_status,
    'provider', v_row.provider,
    'method', v_row.method,
    'school_name', v_row.school_name,
    'education_level', v_row.education_level,
    'report_expires_at', v_row.report_expires_at,
    'submitted_at', v_row.submitted_at,
    'reviewed_at', v_row.reviewed_at,
    'verified_at', v_row.verified_at,
    'review_note', case when v_status = 'rejected' then v_row.review_note else null end
  );
end;
$$;

revoke all on function aertex_private.student_eligibility_for_user(uuid) from public, anon;
grant execute on function aertex_private.student_eligibility_for_user(uuid) to authenticated, service_role;

create or replace function aertex_private.billing_eligibility_for_user(p_user_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'student', aertex_private.student_eligibility_for_user(p_user_id)
  );
$$;

revoke all on function aertex_private.billing_eligibility_for_user(uuid) from public, anon;
grant execute on function aertex_private.billing_eligibility_for_user(uuid) to authenticated, service_role;

create or replace function public.get_my_student_verification()
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'authenticated user required' using errcode = '42501';
  end if;

  perform aertex_private.purge_expired_student_verification_targets();
  return aertex_private.student_eligibility_for_user(v_user);
end;
$$;

revoke all on function public.get_my_student_verification() from public, anon;
grant execute on function public.get_my_student_verification() to authenticated, service_role;

create or replace function public.get_my_billing_state()
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'authenticated user required' using errcode = '42501';
  end if;

  return aertex_private.billing_state_for_user(v_user)
    || jsonb_build_object(
      'eligibility', aertex_private.billing_eligibility_for_user(v_user)
    );
end;
$$;

revoke all on function public.get_my_billing_state() from public, anon;
grant execute on function public.get_my_billing_state() to authenticated, service_role;

create or replace function aertex_private.submit_student_verification_target(p_target_url text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_target text := trim(coalesce(p_target_url, ''));
  v_hash text;
  v_id uuid;
begin
  if v_user is null then
    raise exception 'authenticated user required' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = v_user and p.status = 'active'
  ) then
    raise exception 'account is not active' using errcode = '42501';
  end if;

  if char_length(v_target) > 1200
     or not aertex_private.is_allowed_chsi_verification_target(v_target) then
    raise exception 'unsupported verification target' using errcode = '22023';
  end if;

  update public.student_verifications sv
  set status = 'expired',
      updated_at = now()
  where sv.user_id = v_user
    and sv.status = 'pending'
    and exists (
      select 1
      from aertex_private.student_verification_targets t
      where t.verification_id = sv.id
        and t.expires_at <= now()
    );

  delete from aertex_private.student_verification_targets t
  where t.expires_at <= now();

  if exists (
    select 1 from public.student_verifications sv
    where sv.user_id = v_user
      and sv.status = 'verified'
      and sv.report_expires_at is not null
      and sv.report_expires_at > now()
  ) then
    raise exception 'student verification is already active' using errcode = '23505';
  end if;

  if exists (
    select 1 from public.student_verifications sv
    where sv.user_id = v_user
      and sv.status = 'pending'
  ) then
    raise exception 'a student verification is already pending' using errcode = '23505';
  end if;

  if exists (
    select 1 from public.student_verifications sv
    where sv.user_id = v_user
      and sv.submitted_at > now() - interval '10 minutes'
  ) then
    raise exception 'please wait before submitting another verification request'
      using errcode = '57014';
  end if;

  v_hash := encode(extensions.digest(v_target, 'sha256'), 'hex');

  insert into public.student_verifications (
    user_id,
    provider,
    method,
    status,
    target_hash,
    target_host
  )
  values (
    v_user,
    'chsi',
    'qr_official_target',
    'pending',
    v_hash,
    lower(split_part(split_part(v_target, '://', 2), '/', 1))
  )
  returning id into v_id;

  insert into aertex_private.student_verification_targets (
    verification_id,
    target_url,
    expires_at
  )
  values (
    v_id,
    v_target,
    now() + interval '7 days'
  );

  perform public.write_audit_log(
    'student.verification.submit',
    'student_verification',
    v_id::text,
    'CHSI QR verification target',
    'User submitted a student verification request.',
    'info',
    null,
    null,
    jsonb_build_object('provider', 'chsi', 'target_host', lower(split_part(split_part(v_target, '://', 2), '/', 1)))
  );

  return aertex_private.student_eligibility_for_user(v_user);
end;
$$;

revoke all on function aertex_private.submit_student_verification_target(text) from public, anon;
grant execute on function aertex_private.submit_student_verification_target(text) to authenticated, service_role;

create or replace function public.submit_student_verification_target(p_target_url text)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select aertex_private.submit_student_verification_target(p_target_url);
$$;

revoke all on function public.submit_student_verification_target(text) from public, anon;
grant execute on function public.submit_student_verification_target(text) to authenticated, service_role;

create or replace function aertex_private.cancel_my_student_verification()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $
declare
  v_user uuid := auth.uid();
  v_id uuid;
begin
  if v_user is null then
    raise exception 'authenticated user required' using errcode = '42501';
  end if;

  select id into v_id
  from public.student_verifications
  where user_id = v_user
    and status = 'pending'
  order by submitted_at desc
  limit 1
  for update;

  if v_id is null then
    return aertex_private.student_eligibility_for_user(v_user);
  end if;

  update public.student_verifications
  set status = 'rejected',
      review_note = 'Canceled by user.',
      reviewed_at = now(),
      updated_at = now()
  where id = v_id;

  delete from aertex_private.student_verification_targets
  where verification_id = v_id;

  perform public.write_audit_log(
    'student.verification.cancel',
    'student_verification',
    v_id::text,
    'canceled',
    'User canceled a pending student verification request.',
    'info',
    null,
    null,
    jsonb_build_object('provider', 'chsi')
  );

  return aertex_private.student_eligibility_for_user(v_user);
end;
$;

revoke all on function aertex_private.cancel_my_student_verification() from public, anon;
grant execute on function aertex_private.cancel_my_student_verification() to authenticated, service_role;

create or replace function public.cancel_my_student_verification()
returns jsonb
language sql
security invoker
set search_path = ''
as $
  select aertex_private.cancel_my_student_verification();
$;

revoke all on function public.cancel_my_student_verification() from public, anon;
grant execute on function public.cancel_my_student_verification() to authenticated, service_role;

create or replace function aertex_private.admin_get_student_verifications()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  perform aertex_private.admin_assert();
  perform aertex_private.purge_expired_student_verification_targets();

  select jsonb_build_object(
    'summary', jsonb_build_object(
      'pending', (select count(*)::int from public.student_verifications where status = 'pending'),
      'verified_active', (
        select count(*)::int from public.student_verifications
        where status = 'verified'
          and report_expires_at is not null
          and report_expires_at > now()
      ),
      'expired', (
        select count(*)::int from public.student_verifications
        where status = 'expired'
           or (status = 'verified' and report_expires_at is not null and report_expires_at <= now())
      ),
      'rejected', (select count(*)::int from public.student_verifications where status = 'rejected')
    ),
    'rows', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', sv.id,
          'user_id', sv.user_id,
          'username', p.username,
          'display_name', p.display_name,
          'email', u.email,
          'status', case
            when sv.status = 'verified'
              and sv.report_expires_at is not null
              and sv.report_expires_at <= now()
            then 'expired'
            else sv.status
          end,
          'provider', sv.provider,
          'method', sv.method,
          'target_host', sv.target_host,
          'target_url', case
            when sv.status = 'pending'
              and t.expires_at > now()
            then t.target_url
            else null
          end,
          'target_expires_at', t.expires_at,
          'school_name', sv.school_name,
          'education_level', sv.education_level,
          'report_expires_at', sv.report_expires_at,
          'submitted_at', sv.submitted_at,
          'reviewed_at', sv.reviewed_at,
          'verified_at', sv.verified_at,
          'review_note', sv.review_note
        )
        order by case when sv.status = 'pending' then 0 else 1 end, sv.submitted_at desc
      )
      from public.student_verifications sv
      left join public.profiles p on p.id = sv.user_id
      left join auth.users u on u.id = sv.user_id
      left join aertex_private.student_verification_targets t
        on t.verification_id = sv.id
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function aertex_private.admin_get_student_verifications() from public, anon;
grant execute on function aertex_private.admin_get_student_verifications() to authenticated, service_role;

create or replace function public.get_admin_student_verifications()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select aertex_private.admin_get_student_verifications();
$$;

revoke all on function public.get_admin_student_verifications() from public, anon;
grant execute on function public.get_admin_student_verifications() to authenticated, service_role;

create or replace function aertex_private.admin_review_student_verification(
  p_verification_id uuid,
  p_decision text,
  p_school_name text default null,
  p_education_level text default null,
  p_report_expires_at timestamptz default null,
  p_note text default null,
  p_ip_address text default null,
  p_user_agent text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.student_verifications;
  v_note text := nullif(left(trim(coalesce(p_note, '')), 500), '');
begin
  perform aertex_private.admin_assert();

  if p_decision not in ('verified','rejected') then
    raise exception 'invalid review decision' using errcode = '22023';
  end if;

  select * into v_row
  from public.student_verifications
  where id = p_verification_id
  for update;

  if v_row.id is null then
    raise exception 'student verification not found' using errcode = 'P0002';
  end if;

  if v_row.status <> 'pending' then
    raise exception 'student verification is no longer pending' using errcode = '23505';
  end if;

  if not exists (
    select 1 from aertex_private.student_verification_targets t
    where t.verification_id = v_row.id
      and t.expires_at > now()
      and aertex_private.is_allowed_chsi_verification_target(t.target_url)
  ) then
    raise exception 'verification target is missing or expired' using errcode = '22023';
  end if;

  if p_decision = 'verified' then
    if p_report_expires_at is null or p_report_expires_at <= now() then
      raise exception 'a future report expiration is required' using errcode = '22023';
    end if;

    update public.student_verifications
    set status = 'verified',
        school_name = nullif(left(trim(coalesce(p_school_name, '')), 180), ''),
        education_level = nullif(left(trim(coalesce(p_education_level, '')), 120), ''),
        report_expires_at = p_report_expires_at,
        reviewed_at = now(),
        verified_at = now(),
        verified_by = auth.uid(),
        review_note = v_note,
        updated_at = now()
    where id = v_row.id;
  else
    update public.student_verifications
    set status = 'rejected',
        school_name = null,
        education_level = null,
        report_expires_at = null,
        reviewed_at = now(),
        verified_at = null,
        verified_by = auth.uid(),
        review_note = coalesce(v_note, 'Official verification did not pass.'),
        updated_at = now()
    where id = v_row.id;
  end if;

  delete from aertex_private.student_verification_targets
  where verification_id = v_row.id;

  perform public.write_audit_log(
    'student.verification.review',
    'student_verification',
    v_row.id::text,
    p_decision,
    'Administrator reviewed CHSI student eligibility.',
    'info',
    p_ip_address,
    p_user_agent,
    jsonb_build_object(
      'user_id', v_row.user_id,
      'decision', p_decision,
      'provider', 'chsi',
      'target_host', v_row.target_host,
      'report_expires_at', p_report_expires_at
    )
  );

  return aertex_private.student_eligibility_for_user(v_row.user_id);
end;
$$;

revoke all on function aertex_private.admin_review_student_verification(uuid,text,text,text,timestamptz,text,text,text) from public, anon;
grant execute on function aertex_private.admin_review_student_verification(uuid,text,text,text,timestamptz,text,text,text) to authenticated, service_role;

create or replace function public.admin_review_student_verification(
  p_verification_id uuid,
  p_decision text,
  p_school_name text default null,
  p_education_level text default null,
  p_report_expires_at timestamptz default null,
  p_note text default null,
  p_ip_address text default null,
  p_user_agent text default null
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select aertex_private.admin_review_student_verification(
    p_verification_id,
    p_decision,
    p_school_name,
    p_education_level,
    p_report_expires_at,
    p_note,
    p_ip_address,
    p_user_agent
  );
$$;

revoke all on function public.admin_review_student_verification(uuid,text,text,text,timestamptz,text,text,text) from public, anon;
grant execute on function public.admin_review_student_verification(uuid,text,text,text,timestamptz,text,text,text) to authenticated, service_role;

commit;
