begin;

alter table public.student_verifications
  drop constraint if exists student_verifications_method_check;

alter table public.student_verifications
  add constraint student_verifications_method_check
  check (method in ('qr_official_target','qr_online_verification_code'));

alter table aertex_private.student_verification_targets
  alter column target_url drop not null;

alter table aertex_private.student_verification_targets
  add column if not exists verification_code text;

alter table aertex_private.student_verification_targets
  drop constraint if exists student_verification_code_format;

alter table aertex_private.student_verification_targets
  add constraint student_verification_code_format
  check (verification_code is null or verification_code ~ '^[A-Z0-9]{16}$');

alter table aertex_private.student_verification_targets
  drop constraint if exists student_verification_exactly_one_evidence;

alter table aertex_private.student_verification_targets
  add constraint student_verification_exactly_one_evidence
  check ((target_url is not null)::int + (verification_code is not null)::int = 1);

create or replace function aertex_private.is_allowed_chsi_verification_code(p_code text)
returns boolean
language sql
immutable
security definer
set search_path = ''
as $$
  select upper(trim(coalesce(p_code, ''))) ~ '^[A-Z0-9]{16}$';
$$;

revoke all on function aertex_private.is_allowed_chsi_verification_code(text) from public, anon;
grant execute on function aertex_private.is_allowed_chsi_verification_code(text) to authenticated, service_role;

create or replace function aertex_private.submit_student_verification_evidence(
  p_target_url text default null,
  p_verification_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_target text := nullif(trim(coalesce(p_target_url, '')), '');
  v_code text := nullif(upper(trim(coalesce(p_verification_code, ''))), '');
  v_hash text;
  v_id uuid;
  v_method text;
  v_canonical text;
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

  if (v_target is null and v_code is null)
     or (v_target is not null and v_code is not null) then
    raise exception 'provide exactly one verification evidence value'
      using errcode = '22023';
  end if;

  if v_target is not null then
    if char_length(v_target) > 1200
       or not aertex_private.is_allowed_chsi_verification_target(v_target) then
      raise exception 'unsupported verification target' using errcode = '22023';
    end if;
    v_method := 'qr_official_target';
    v_canonical := 'chsi-url:' || v_target;
  else
    if not aertex_private.is_allowed_chsi_verification_code(v_code) then
      raise exception 'unsupported online verification code' using errcode = '22023';
    end if;
    v_method := 'qr_online_verification_code';
    v_canonical := 'chsi-code:' || v_code;
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

  delete from aertex_private.student_verification_targets
  where expires_at <= now();

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

  v_hash := encode(extensions.digest(v_canonical, 'sha256'), 'hex');

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
    v_method,
    'pending',
    v_hash,
    'chsi.com.cn'
  )
  returning id into v_id;

  insert into aertex_private.student_verification_targets (
    verification_id,
    target_url,
    verification_code,
    expires_at
  )
  values (
    v_id,
    v_target,
    v_code,
    now() + interval '7 days'
  );

  perform public.write_audit_log(
    'student.verification.submit',
    'student_verification',
    v_id::text,
    case when v_code is not null then 'CHSI online verification code' else 'CHSI verification target' end,
    'User submitted a student verification request.',
    'info',
    null,
    null,
    jsonb_build_object(
      'provider', 'chsi',
      'evidence_kind', case when v_code is not null then 'online_verification_code' else 'official_url' end,
      'target_host', 'chsi.com.cn'
    )
  );

  return aertex_private.student_eligibility_for_user(v_user);
end;
$$;

revoke all on function aertex_private.submit_student_verification_evidence(text,text) from public, anon;
grant execute on function aertex_private.submit_student_verification_evidence(text,text) to authenticated, service_role;

create or replace function public.submit_student_verification_evidence(
  p_target_url text default null,
  p_verification_code text default null
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select aertex_private.submit_student_verification_evidence(
    p_target_url,
    p_verification_code
  );
$$;

revoke all on function public.submit_student_verification_evidence(text,text) from public, anon;
grant execute on function public.submit_student_verification_evidence(text,text) to authenticated, service_role;

create or replace function aertex_private.submit_student_verification_target(p_target_url text)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select aertex_private.submit_student_verification_evidence(p_target_url, null);
$$;

create or replace function public.submit_student_verification_target(p_target_url text)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select aertex_private.submit_student_verification_evidence(p_target_url, null);
$$;

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
            when sv.status = 'pending' and t.expires_at > now()
            then t.target_url
            else null
          end,
          'verification_code', case
            when sv.status = 'pending' and t.expires_at > now()
            then t.verification_code
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
      and (
        (t.target_url is not null and aertex_private.is_allowed_chsi_verification_target(t.target_url))
        or
        (t.verification_code is not null and aertex_private.is_allowed_chsi_verification_code(t.verification_code))
      )
  ) then
    raise exception 'verification evidence is missing or expired' using errcode = '22023';
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
      'method', v_row.method,
      'target_host', v_row.target_host,
      'report_expires_at', p_report_expires_at
    )
  );

  return aertex_private.student_eligibility_for_user(v_row.user_id);
end;
$$;

commit;
