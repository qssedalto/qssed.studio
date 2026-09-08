create or replace function public.check_registration_username(p_username text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text := btrim(coalesce(p_username, ''));
  v_key text := lower(btrim(coalesce(p_username, '')));
begin
  if char_length(v_username) < 3 then
    return jsonb_build_object('available', false, 'reason', 'too_short');
  end if;

  if position('tianguo' in v_key) > 0 then
    return jsonb_build_object('available', false, 'reason', 'reserved_tianguo');
  end if;

  if position('admin' in v_key) > 0 then
    return jsonb_build_object('available', false, 'reason', 'reserved_admin');
  end if;

  if exists (
    select 1
    from public.profiles p
    where p.username is not null
      and lower(p.username) = v_key
  ) then
    return jsonb_build_object('available', false, 'reason', 'username_taken');
  end if;

  return jsonb_build_object('available', true, 'reason', null);
end;
$$;

revoke all on function public.check_registration_username(text) from public;
grant execute on function public.check_registration_username(text) to anon, authenticated, service_role;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_username text := btrim(coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  v_key text;
begin
  v_key := lower(v_username);

  if char_length(v_username) < 3 then
    raise exception using errcode = '22023', message = 'registration_username_too_short';
  end if;

  if position('tianguo' in v_key) > 0 then
    raise exception using errcode = '22023', message = 'registration_username_reserved';
  end if;

  if position('admin' in v_key) > 0 then
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

  insert into public.profiles (id, username, display_name, avatar_url, role, status, created_at, updated_at)
  values (
    new.id,
    v_username,
    coalesce(new.raw_user_meta_data->>'display_name', v_username),
    new.raw_user_meta_data->>'avatar_url',
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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'avatars_insert_own'
  ) then
    create policy avatars_insert_own
      on storage.objects
      for insert
      to authenticated
      with check (
        bucket_id = 'avatars'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'avatars_update_own'
  ) then
    create policy avatars_update_own
      on storage.objects
      for update
      to authenticated
      using (
        bucket_id = 'avatars'
        and (storage.foldername(name))[1] = auth.uid()::text
      )
      with check (
        bucket_id = 'avatars'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'avatars_delete_own'
  ) then
    create policy avatars_delete_own
      on storage.objects
      for delete
      to authenticated
      using (
        bucket_id = 'avatars'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end;
$$;