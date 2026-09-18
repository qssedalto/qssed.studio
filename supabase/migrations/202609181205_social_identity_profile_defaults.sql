create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_requested_username text := btrim(coalesce(new.raw_user_meta_data->>'username', ''));
  v_explicit_username boolean := v_requested_username <> '';
  v_username text;
  v_base text;
  v_key text;
  v_suffix text := substring(replace(new.id::text, '-', '') from 1 for 10);
  v_display_name text;
  v_avatar_url text;
begin
  if v_explicit_username then
    v_username := v_requested_username;
    v_key := lower(v_username);

    if char_length(v_username) < 3 then
      raise exception using errcode = '22023', message = 'registration_username_too_short';
    end if;

    if position('tianguo' in v_key) > 0 or position('admin' in v_key) > 0 then
      raise exception using errcode = '22023', message = 'registration_username_reserved';
    end if;

    perform pg_advisory_xact_lock(hashtextextended(v_key, 0));

    if exists (
      select 1
      from public.profiles p
      where p.id <> new.id
        and p.username is not null
        and lower(p.username) = v_key
    ) then
      raise exception using errcode = '23505', message = 'registration_username_taken';
    end if;
  else
    -- Social identity providers do not supply QssedA's custom username field.
    -- Derive a readable base from the email local-part, then fall back to a
    -- stable UUID suffix if the base is invalid, reserved, or already in use.
    v_base := lower(regexp_replace(split_part(coalesce(new.email, ''), '@', 1), '[^a-z0-9._-]+', '', 'g'));

    if char_length(v_base) < 3
      or position('tianguo' in v_base) > 0
      or position('admin' in v_base) > 0
    then
      v_base := 'user';
    end if;

    v_base := left(v_base, 48);
    v_username := v_base;
    v_key := lower(v_username);

    perform pg_advisory_xact_lock(hashtextextended(v_key, 0));

    if exists (
      select 1
      from public.profiles p
      where p.id <> new.id
        and p.username is not null
        and lower(p.username) = v_key
    ) then
      v_username := left(v_base, 48 - 1 - char_length(v_suffix)) || '-' || v_suffix;
      v_key := lower(v_username);
      perform pg_advisory_xact_lock(hashtextextended(v_key, 0));
    end if;

    if exists (
      select 1
      from public.profiles p
      where p.id <> new.id
        and p.username is not null
        and lower(p.username) = v_key
    ) then
      raise exception using errcode = '23505', message = 'registration_username_taken';
    end if;
  end if;

  v_display_name := coalesce(
    nullif(btrim(new.raw_user_meta_data->>'display_name'), ''),
    nullif(btrim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(btrim(new.raw_user_meta_data->>'name'), ''),
    v_username
  );

  v_avatar_url := coalesce(
    nullif(btrim(new.raw_user_meta_data->>'avatar_url'), ''),
    nullif(btrim(new.raw_user_meta_data->>'picture'), '')
  );

  insert into public.profiles (
    id,
    username,
    display_name,
    avatar_url,
    role,
    status,
    created_at,
    updated_at
  )
  values (
    new.id,
    v_username,
    v_display_name,
    v_avatar_url,
    case
      when coalesce(new.raw_app_meta_data->>'role', '') = 'admin'
        or coalesce((new.raw_app_meta_data->>'is_admin')::boolean, false)
      then 'admin'
      else 'user'
    end,
    'active',
    coalesce(new.created_at, now()),
    now()
  )
  on conflict (id) do update set
    username = coalesce(public.profiles.username, excluded.username),
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
    role = case
      when coalesce(new.raw_app_meta_data->>'role', '') = 'admin'
        or coalesce((new.raw_app_meta_data->>'is_admin')::boolean, false)
      then 'admin'
      else public.profiles.role
    end,
    updated_at = now();

  return new;
end;
$$;

revoke execute on function public.handle_new_user_profile() from public, anon, authenticated;
