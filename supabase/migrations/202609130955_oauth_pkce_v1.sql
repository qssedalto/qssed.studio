-- QssedA Auth OAuth 2.0 Authorization Code + PKCE (S256)
-- Opaque access/refresh tokens are stored only as SHA-256 hashes.

create table if not exists public.oauth_clients (
  client_id text primary key,
  display_name text not null,
  redirect_uris text[] not null default '{}',
  allowed_scopes text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.oauth_authorization_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  client_id text not null references public.oauth_clients(client_id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  redirect_uri text not null,
  scope text[] not null default '{}',
  code_challenge text not null,
  code_challenge_method text not null default 'S256' check (code_challenge_method = 'S256'),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.oauth_access_tokens (
  token_hash text primary key,
  client_id text not null references public.oauth_clients(client_id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text[] not null default '{}',
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.oauth_refresh_tokens (
  token_hash text primary key,
  client_id text not null references public.oauth_clients(client_id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text[] not null default '{}',
  expires_at timestamptz not null,
  revoked_at timestamptz,
  rotated_to_hash text,
  created_at timestamptz not null default now()
);

create index if not exists oauth_authorization_codes_lookup_idx
  on public.oauth_authorization_codes (code_hash, expires_at)
  where consumed_at is null;

create index if not exists oauth_access_tokens_user_client_idx
  on public.oauth_access_tokens (user_id, client_id, expires_at);

create index if not exists oauth_refresh_tokens_user_client_idx
  on public.oauth_refresh_tokens (user_id, client_id, expires_at)
  where revoked_at is null;

alter table public.oauth_clients enable row level security;
alter table public.oauth_authorization_codes enable row level security;
alter table public.oauth_access_tokens enable row level security;
alter table public.oauth_refresh_tokens enable row level security;

revoke all on public.oauth_clients from anon, authenticated;
revoke all on public.oauth_authorization_codes from anon, authenticated;
revoke all on public.oauth_access_tokens from anon, authenticated;
revoke all on public.oauth_refresh_tokens from anon, authenticated;

create or replace function public.oauth_sha256_hex(p_value text)
returns text
language sql
immutable
strict
set search_path = public, extensions
as $$
  select encode(extensions.digest(convert_to(p_value, 'UTF8'), 'sha256'), 'hex');
$$;

create or replace function public.oauth_base64url(p_value bytea)
returns text
language sql
immutable
strict
set search_path = public, extensions
as $$
  select regexp_replace(
    replace(replace(replace(encode(p_value, 'base64'), E'\n', ''), '+', '-'), '/', '_'),
    '=+$',
    ''
  );
$$;

create or replace function public.oauth_redirect_allowed(p_allowed text[], p_redirect_uri text)
returns boolean
language plpgsql
immutable
strict
set search_path = public
as $$
declare
  v_allowed text;
begin
  if p_redirect_uri = any(p_allowed) then
    return true;
  end if;

  foreach v_allowed in array p_allowed loop
    -- RFC 8252 loopback redirect: allow an ephemeral port on 127.0.0.1
    -- when the registered URI is the same URI without an explicit port.
    if v_allowed = 'http://127.0.0.1/callback'
       and p_redirect_uri ~ '^http://127\.0\.0\.1:[0-9]{1,5}/callback$' then
      return true;
    end if;
  end loop;

  return false;
end;
$$;

create or replace function public.oauth_scope_array(p_scope text)
returns text[]
language sql
immutable
set search_path = public
as $$
  select coalesce(
    array(
      select distinct scope_value
      from unnest(regexp_split_to_array(trim(coalesce(p_scope, '')), '\s+')) scope_value
      where scope_value <> ''
      order by scope_value
    ),
    '{}'::text[]
  );
$$;

create or replace function public.oauth_validate_client(
  p_client_id text,
  p_redirect_uri text,
  p_scope text default 'profile.read session.read'
)
returns table (
  client_id text,
  display_name text,
  scope text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_client public.oauth_clients%rowtype;
  v_scopes text[];
begin
  select * into v_client
  from public.oauth_clients c
  where c.client_id = p_client_id
    and c.is_active = true;

  if not found then
    return;
  end if;

  if not public.oauth_redirect_allowed(v_client.redirect_uris, p_redirect_uri) then
    return;
  end if;

  v_scopes := public.oauth_scope_array(p_scope);
  if cardinality(v_scopes) = 0 or not (v_scopes <@ v_client.allowed_scopes) then
    return;
  end if;

  return query
  select v_client.client_id, v_client.display_name, array_to_string(v_scopes, ' ');
end;
$$;

create or replace function public.oauth_issue_authorization_code(
  p_client_id text,
  p_redirect_uri text,
  p_scope text,
  p_code_challenge text
)
returns table (
  authorization_code text,
  expires_in integer
)
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_client public.oauth_clients%rowtype;
  v_scopes text[];
  v_code text;
begin
  if v_user_id is null then
    raise exception 'login_required' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = v_user_id and p.status = 'active'
  ) then
    raise exception 'account_not_active' using errcode = 'P0001';
  end if;

  select * into v_client
  from public.oauth_clients c
  where c.client_id = p_client_id and c.is_active = true;

  if not found
     or not public.oauth_redirect_allowed(v_client.redirect_uris, p_redirect_uri) then
    raise exception 'invalid_client' using errcode = 'P0001';
  end if;

  v_scopes := public.oauth_scope_array(p_scope);
  if cardinality(v_scopes) = 0 or not (v_scopes <@ v_client.allowed_scopes) then
    raise exception 'invalid_scope' using errcode = 'P0001';
  end if;

  if p_code_challenge !~ '^[A-Za-z0-9_-]{43,128}$' then
    raise exception 'invalid_code_challenge' using errcode = 'P0001';
  end if;

  v_code := 'qa_c_' || public.oauth_base64url(extensions.gen_random_bytes(32));

  insert into public.oauth_authorization_codes (
    code_hash, client_id, user_id, redirect_uri, scope,
    code_challenge, code_challenge_method, expires_at
  ) values (
    public.oauth_sha256_hex(v_code), p_client_id, v_user_id, p_redirect_uri, v_scopes,
    p_code_challenge, 'S256', now() + interval '5 minutes'
  );

  return query select v_code, 300;
end;
$$;

create or replace function public.oauth_exchange_authorization_code(
  p_client_id text,
  p_redirect_uri text,
  p_code text,
  p_code_verifier text
)
returns table (
  access_token text,
  refresh_token text,
  token_type text,
  expires_in integer,
  scope text
)
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_code_row public.oauth_authorization_codes%rowtype;
  v_access text;
  v_refresh text;
  v_access_hash text;
  v_refresh_hash text;
  v_expected_challenge text;
begin
  if p_code_verifier !~ '^[A-Za-z0-9._~-]{43,128}$' then
    return;
  end if;

  select * into v_code_row
  from public.oauth_authorization_codes c
  where c.code_hash = public.oauth_sha256_hex(p_code)
    and c.client_id = p_client_id
    and c.redirect_uri = p_redirect_uri
    and c.consumed_at is null
    and c.expires_at > now()
  for update;

  if not found then
    return;
  end if;

  if not exists (
    select 1 from public.oauth_clients c
    where c.client_id = p_client_id and c.is_active = true
  ) then
    return;
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = v_code_row.user_id and p.status = 'active'
  ) then
    return;
  end if;

  v_expected_challenge := public.oauth_base64url(
    extensions.digest(convert_to(p_code_verifier, 'UTF8'), 'sha256')
  );

  if v_expected_challenge <> v_code_row.code_challenge then
    return;
  end if;

  update public.oauth_authorization_codes
  set consumed_at = now()
  where id = v_code_row.id;

  v_access := 'qa_at_' || public.oauth_base64url(extensions.gen_random_bytes(32));
  v_refresh := 'qa_rt_' || public.oauth_base64url(extensions.gen_random_bytes(48));
  v_access_hash := public.oauth_sha256_hex(v_access);
  v_refresh_hash := public.oauth_sha256_hex(v_refresh);

  insert into public.oauth_access_tokens (
    token_hash, client_id, user_id, scope, expires_at
  ) values (
    v_access_hash, p_client_id, v_code_row.user_id, v_code_row.scope,
    now() + interval '30 minutes'
  );

  insert into public.oauth_refresh_tokens (
    token_hash, client_id, user_id, scope, expires_at
  ) values (
    v_refresh_hash, p_client_id, v_code_row.user_id, v_code_row.scope,
    now() + interval '30 days'
  );

  return query
  select v_access, v_refresh, 'Bearer'::text, 1800, array_to_string(v_code_row.scope, ' ');
end;
$$;

create or replace function public.oauth_refresh_access_token(
  p_client_id text,
  p_refresh_token text
)
returns table (
  access_token text,
  refresh_token text,
  token_type text,
  expires_in integer,
  scope text
)
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_old public.oauth_refresh_tokens%rowtype;
  v_access text;
  v_refresh text;
  v_access_hash text;
  v_refresh_hash text;
begin
  select * into v_old
  from public.oauth_refresh_tokens r
  where r.token_hash = public.oauth_sha256_hex(p_refresh_token)
    and r.client_id = p_client_id
    and r.revoked_at is null
    and r.expires_at > now()
  for update;

  if not found then
    return;
  end if;

  if not exists (
    select 1 from public.oauth_clients c
    where c.client_id = p_client_id and c.is_active = true
  ) or not exists (
    select 1 from public.profiles p
    where p.id = v_old.user_id and p.status = 'active'
  ) then
    update public.oauth_refresh_tokens
      set revoked_at = coalesce(revoked_at, now())
      where token_hash = v_old.token_hash;
    return;
  end if;

  v_access := 'qa_at_' || public.oauth_base64url(extensions.gen_random_bytes(32));
  v_refresh := 'qa_rt_' || public.oauth_base64url(extensions.gen_random_bytes(48));
  v_access_hash := public.oauth_sha256_hex(v_access);
  v_refresh_hash := public.oauth_sha256_hex(v_refresh);

  update public.oauth_refresh_tokens
  set revoked_at = now(), rotated_to_hash = v_refresh_hash
  where token_hash = v_old.token_hash;

  insert into public.oauth_access_tokens (
    token_hash, client_id, user_id, scope, expires_at
  ) values (
    v_access_hash, p_client_id, v_old.user_id, v_old.scope,
    now() + interval '30 minutes'
  );

  insert into public.oauth_refresh_tokens (
    token_hash, client_id, user_id, scope, expires_at
  ) values (
    v_refresh_hash, p_client_id, v_old.user_id, v_old.scope,
    now() + interval '30 days'
  );

  return query
  select v_access, v_refresh, 'Bearer'::text, 1800, array_to_string(v_old.scope, ' ');
end;
$$;

create or replace function public.oauth_revoke_token(
  p_client_id text,
  p_token text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_hash text := public.oauth_sha256_hex(p_token);
  v_changed boolean := false;
begin
  update public.oauth_access_tokens
  set revoked_at = coalesce(revoked_at, now())
  where token_hash = v_hash and client_id = p_client_id;
  v_changed := found or v_changed;

  update public.oauth_refresh_tokens
  set revoked_at = coalesce(revoked_at, now())
  where token_hash = v_hash and client_id = p_client_id;
  v_changed := found or v_changed;

  return v_changed;
end;
$$;

create or replace function public.oauth_introspect_access_token(p_access_token text)
returns table (
  active boolean,
  client_id text,
  user_id uuid,
  scope text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  return query
  select true,
         t.client_id,
         t.user_id,
         array_to_string(t.scope, ' '),
         t.expires_at
  from public.oauth_access_tokens t
  join public.oauth_clients c on c.client_id = t.client_id and c.is_active = true
  join public.profiles p on p.id = t.user_id and p.status = 'active'
  where t.token_hash = public.oauth_sha256_hex(p_access_token)
    and t.revoked_at is null
    and t.expires_at > now()
  limit 1;

  if not found then
    return query select false, null::text, null::uuid, null::text, null::timestamptz;
  end if;
end;
$$;

revoke all on function public.oauth_sha256_hex(text) from public;
revoke all on function public.oauth_base64url(bytea) from public;
revoke all on function public.oauth_redirect_allowed(text[], text) from public;
revoke all on function public.oauth_scope_array(text) from public;
revoke all on function public.oauth_validate_client(text, text, text) from public;
revoke all on function public.oauth_issue_authorization_code(text, text, text, text) from public;
revoke all on function public.oauth_exchange_authorization_code(text, text, text, text) from public;
revoke all on function public.oauth_refresh_access_token(text, text) from public;
revoke all on function public.oauth_revoke_token(text, text) from public;
revoke all on function public.oauth_introspect_access_token(text) from public;

grant execute on function public.oauth_validate_client(text, text, text) to anon, authenticated;
grant execute on function public.oauth_issue_authorization_code(text, text, text, text) to authenticated;
grant execute on function public.oauth_exchange_authorization_code(text, text, text, text) to anon, authenticated;
grant execute on function public.oauth_refresh_access_token(text, text) to anon, authenticated;
grant execute on function public.oauth_revoke_token(text, text) to anon, authenticated;
grant execute on function public.oauth_introspect_access_token(text) to anon, authenticated;

insert into public.oauth_clients (
  client_id, display_name, redirect_uris, allowed_scopes, is_active
) values (
  'qsseda-git-desktop',
  'QssedA Git',
  array['qsseda-git://auth/callback', 'http://127.0.0.1/callback'],
  array['profile.read', 'session.read'],
  true
)
on conflict (client_id) do update set
  display_name = excluded.display_name,
  redirect_uris = excluded.redirect_uris,
  allowed_scopes = excluded.allowed_scopes,
  is_active = true,
  updated_at = now();
