alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists birth_date date,
  add column if not exists gender text,
  add column if not exists hide_gender_on_profile boolean not null default false;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_gender_check'
  ) then
    alter table public.profiles
      add constraint profiles_gender_check
      check (gender is null or gender in ('male','female'));
  end if;
end;
$$;

update public.profiles p
set
  first_name = coalesce(nullif(p.first_name, ''), nullif(btrim(u.raw_user_meta_data->>'first_name'), '')),
  last_name = coalesce(nullif(p.last_name, ''), nullif(btrim(u.raw_user_meta_data->>'last_name'), '')),
  birth_date = coalesce(
    p.birth_date,
    case when coalesce(u.raw_user_meta_data->>'birth_date','') ~ '^\d{4}-\d{2}-\d{2}$'
      then (u.raw_user_meta_data->>'birth_date')::date else null end
  ),
  gender = coalesce(
    nullif(p.gender, ''),
    case when u.raw_user_meta_data->>'gender' in ('male','female')
      then u.raw_user_meta_data->>'gender' else null end
  ),
  hide_gender_on_profile = case lower(coalesce(u.raw_user_meta_data->>'hide_gender_on_profile',''))
    when 'true' then true
    when 'false' then false
    else p.hide_gender_on_profile
  end,
  display_name = case
    when (p.display_name is null or btrim(p.display_name) = '' or p.display_name = p.username)
      and coalesce(btrim(u.raw_user_meta_data->>'first_name'),'') <> ''
      and coalesce(btrim(u.raw_user_meta_data->>'last_name'),'') <> ''
    then case
      when (u.raw_user_meta_data->>'first_name') ~ '^[一-龥]+$'
       and (u.raw_user_meta_data->>'last_name') ~ '^[一-龥]+$'
      then btrim(u.raw_user_meta_data->>'first_name') || btrim(u.raw_user_meta_data->>'last_name')
      else btrim(u.raw_user_meta_data->>'first_name') || ' ' || btrim(u.raw_user_meta_data->>'last_name')
    end
    else p.display_name
  end,
  updated_at = now()
from auth.users u
where u.id = p.id;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_username text := btrim(coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  v_key text;
  v_first_name text := nullif(btrim(coalesce(new.raw_user_meta_data->>'first_name','')), '');
  v_last_name text := nullif(btrim(coalesce(new.raw_user_meta_data->>'last_name','')), '');
  v_birth_date date := case
    when coalesce(new.raw_user_meta_data->>'birth_date','') ~ '^\d{4}-\d{2}-\d{2}$'
    then (new.raw_user_meta_data->>'birth_date')::date
    else null
  end;
  v_gender text := case
    when new.raw_user_meta_data->>'gender' in ('male','female')
    then new.raw_user_meta_data->>'gender'
    else null
  end;
  v_hide_gender boolean := case lower(coalesce(new.raw_user_meta_data->>'hide_gender_on_profile',''))
    when 'true' then true
    else false
  end;
  v_display_name text;
begin
  v_key := lower(v_username);
  v_display_name := nullif(btrim(coalesce(new.raw_user_meta_data->>'display_name','')), '');

  if v_display_name is null or v_display_name = v_username then
    if v_first_name is not null and v_last_name is not null then
      if v_first_name ~ '^[一-龥]+$' and v_last_name ~ '^[一-龥]+$' then
        v_display_name := v_first_name || v_last_name;
      else
        v_display_name := v_first_name || ' ' || v_last_name;
      end if;
    else
      v_display_name := v_username;
    end if;
  end if;

  if char_length(v_username) < 3 then
    raise exception using errcode = '22023', message = 'registration_username_too_short';
  end if;
  if position('tianguo' in v_key) > 0 or position('admin' in v_key) > 0 then
    raise exception using errcode = '22023', message = 'registration_username_reserved';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_key, 0));

  if exists (
    select 1 from public.profiles p
    where p.id <> new.id and p.username is not null and lower(p.username) = v_key
  ) then
    raise exception using errcode = '23505', message = 'registration_username_taken';
  end if;

  insert into public.profiles (
    id, username, display_name, avatar_url,
    first_name, last_name, birth_date, gender, hide_gender_on_profile,
    role, status, created_at, updated_at
  )
  values (
    new.id,
    v_username,
    v_display_name,
    new.raw_user_meta_data->>'avatar_url',
    v_first_name,
    v_last_name,
    v_birth_date,
    v_gender,
    v_hide_gender,
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
    username = coalesce(excluded.username, public.profiles.username),
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    first_name = coalesce(excluded.first_name, public.profiles.first_name),
    last_name = coalesce(excluded.last_name, public.profiles.last_name),
    birth_date = coalesce(excluded.birth_date, public.profiles.birth_date),
    gender = coalesce(excluded.gender, public.profiles.gender),
    hide_gender_on_profile = excluded.hide_gender_on_profile,
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
