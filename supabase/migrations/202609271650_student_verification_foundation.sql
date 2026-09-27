begin;

create table if not exists public.student_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'chsi' check (provider = 'chsi'),
  method text not null default 'online_verification_report'
    check (method = 'online_verification_report'),
  status text not null default 'pending'
    check (status in ('pending','verified','rejected','expired')),
  verification_code_hash text not null,
  verification_code_last4 text not null
    check (verification_code_last4 ~ '^[0-9A-Z]{4}$'),
  school_name text,
  education_level text,
  report_expires_at timestamptz,
  verified_at timestamptz,
  verified_by uuid references public.profiles(id) on delete set null,
  rejection_reason text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists student_verifications_user_history_idx
  on public.student_verifications(user_id, submitted_at desc);

create index if not exists student_verifications_status_idx
  on public.student_verifications(status, submitted_at desc);

create unique index if not exists student_verifications_active_code_unique
  on public.student_verifications(verification_code_hash)
  where status in ('pending','verified');

alter table public.student_verifications enable row level security;
revoke all on public.student_verifications from public, anon, authenticated;
grant select, insert, update, delete on public.student_verifications to service_role;

create table if not exists aertex_private.student_verification_secrets (
  verification_id uuid primary key references public.student_verifications(id) on delete cascade,
  verification_code text not null check (verification_code ~ '^[0-9A-Z]{16}$'),
  created_at timestamptz not null default now()
);

revoke all on aertex_private.student_verification_secrets from public, anon, authenticated;
grant select, insert, update, delete on aertex_private.student_verification_secrets to service_role;

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

create or replace function aertex_private.student_eligibility_for_user(p_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_verification public.student_verifications;
  v_effective_status text := 'not_submitted';
  v_eligible boolean := false;
begin
  select *
  into v_verification
  from public.student_verifications
  where user_id = p_user_id
  order by submitted_at desc, created_at desc
  limit 1;

  if v_verification.id is null then
    return jsonb_build_object(
      'key', 'student',
      'eligible', false,
      'status', 'not_submitted',
      'provider', 'chsi',
      'method', 'online_verification_report'
    );
  end if;

  v_effective_status := v_verification.status;
  if v_verification.status = 'verified'
     and v_verification.report_expires_at is not null
     and v_verification.report_expires_at <= now() then
    v_effective_status := 'expired';
  end if;

  v_eligible := v_verification.status = 'verified'
    and v_verification.report_expires_at is not null
    and v_verification.report_expires_at > now();

  return jsonb_build_object(
    'key', 'student',
    'eligible', v_eligible,
    'status', v_effective_status,
    'verification_id', v_verification.id,
    'provider', v_verification.provider,
    'method', v_verification.method,
    'verification_code_last4', v_verification.verification_code_last4,
    'school_name', v_verification.school_name,
    'education_level', v_verification.education_level,
    'report_expires_at', v_verification.report_expires_at,
    'verified_at', v_verification.verified_at,
    'submitted_at', v_verification.submitted_at,
    'rejection_reason', case when v_effective_status = 'rejected' then v_verification.rejection_reason else null end
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

create or replace function aertex_private.submit_student_verification(p_verification_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_code text;
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

  v_code := upper(regexp_replace(coalesce(p_verification_code, ''), '[^0-9A-Za-z]', '', 'g'));
  if v_code !~ '^[0-9A-Z]{16}$' then
    raise exception 'online verification code must contain 16 letters or digits'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.student_verifications sv
    where sv.user_id = v_user
      and sv.status = 'pending'
  ) then
    raise exception 'a student verification is already pending'
      using errcode = '23505';
  end if;

  v_hash := encode(extensions.digest(v_code, 'sha256'), 'hex');

  if exists (
    select 1
    from public.student_verifications sv
    where sv.verification_code_hash = v_hash
      and sv.user_id <> v_user
      and sv.status in ('pending','verified')
  ) then
    raise exception 'this verification report is already associated with another account'
      using errcode = '23505';
  end if;

  insert into public.student_verifications (
    user_id,
    provider,
    method,
    status,
    verification_code_hash,
    verification_code_last4
  )
  values (
    v_user,
    'chsi',
    'online_verification_report',
    'pending',
    v_hash,
    right(v_code, 4)
  )
  returning id into v_id;

  insert into aertex_private.student_verification_secrets (
    verification_id,
    verification_code
  )
  values (v_id, v_code);

  return aertex_private.student_eligibility_for_user(v_user);
end;
$$;

revoke all on function aertex_private.submit_student_verification(text) from public, anon;
grant execute on function aertex_private.submit_student_verification(text) to authenticated, service_role;

create or replace function public.submit_student_verification(p_verification_code text)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select aertex_private.submit_student_verification(p_verification_code);
$$;

revoke all on function public.submit_student_verification(text) from public, anon;
grant execute on function public.submit_student_verification(text) to authenticated, service_role;

create or replace function aertex_private.admin_get_student_verifications()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  perform aertex_private.admin_assert();

  select jsonb_build_object(
    'summary', jsonb_build_object(
      'pending', (
        select count(*)::int
        from public.student_verifications
        where status = 'pending'
      ),
      'verified_active', (
        select count(*)::int
        from public.student_verifications
        where status = 'verified'
          and report_expires_at is not null
          and report_expires_at > now()
      ),
      'expired', (
        select count(*)::int
        from public.student_verifications
        where status = 'expired'
           or (status = 'verified' and report_expires_at is not null and report_expires_at <= now())
      ),
      'rejected', (
        select count(*)::int
        from public.student_verifications
        where status = 'rejected'
      )
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
          'verification_code', case when sv.status = 'pending' then sec.verification_code else null end,
          'verification_code_last4', sv.verification_code_last4,
          'school_name', sv.school_name,
          'education_level', sv.education_level,
          'report_expires_at', sv.report_expires_at,
          'verified_at', sv.verified_at,
          'submitted_at', sv.submitted_at,
          'reviewed_at', sv.reviewed_at,
          'rejection_reason', sv.rejection_reason
        )
        order by
          case when sv.status = 'pending' then 0 else 1 end,
          sv.submitted_at desc
      )
      from public.student_verifications sv
      left join public.profiles p on p.id = sv.user_id
      left join auth.users u on u.id = sv.user_id
      left join aertex_private.student_verification_secrets sec
        on sec.verification_id = sv.id
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
  v_verification public.student_verifications;
  v_school text := nullif(left(trim(coalesce(p_school_name, '')), 180), '');
  v_level text := nullif(left(trim(coalesce(p_education_level, '')), 120), '');
  v_note text := nullif(left(trim(coalesce(p_note, '')), 500), '');
begin
  perform aertex_private.admin_assert();

  if p_decision not in ('verified','rejected') then
    raise exception 'invalid review decision' using errcode = '22023';
  end if;

  select *
  into v_verification
  from public.student_verifications
  where id = p_verification_id
  for update;

  if v_verification.id is null then
    raise exception 'student verification not found' using errcode = 'P0002';
  end if;

  if v_verification.status <> 'pending' then
    raise exception 'student verification is no longer pending' using errcode = '23505';
  end if;

  if p_decision = 'verified' then
    if p_report_expires_at is null or p_report_expires_at <= now() then
      raise exception 'a future report expiration is required'
        using errcode = '22023';
    end if;

    update public.student_verifications
    set status = 'verified',
        school_name = v_school,
        education_level = v_level,
        report_expires_at = p_report_expires_at,
        verified_at = now(),
        verified_by = auth.uid(),
        rejection_reason = null,
        reviewed_at = now(),
        updated_at = now()
    where id = p_verification_id;
  else
    update public.student_verifications
    set status = 'rejected',
        school_name = null,
        education_level = null,
        report_expires_at = null,
        verified_at = null,
        verified_by = auth.uid(),
        rejection_reason = coalesce(v_note, 'Report verification was not approved.'),
        reviewed_at = now(),
        updated_at = now()
    where id = p_verification_id;
  end if;

  delete from aertex_private.student_verification_secrets
  where verification_id = p_verification_id;

  perform public.write_audit_log(
    'student.verification.review',
    'student_verification',
    p_verification_id::text,
    p_decision,
    'Administrator reviewed a CHSI student verification report.',
    'info',
    p_ip_address,
    p_user_agent,
    jsonb_build_object(
      'user_id', v_verification.user_id,
      'decision', p_decision,
      'provider', 'chsi',
      'report_expires_at', p_report_expires_at
    )
  );

  return aertex_private.student_eligibility_for_user(v_verification.user_id);
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
