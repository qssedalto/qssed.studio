-- Run with psql -v ON_ERROR_STOP=1 -f scripts/oauth-pkce-regression.sql.
-- Prefer a development database. Requires the application's OAuth schema and
-- one active profile. No existing profile, client, code or session is updated.
-- Synthetic tokens are neither printed nor retained. Both subtransaction and
-- outer transaction roll back; any assertion failure also aborts the work.
BEGIN;
DO $test$
DECLARE
  fixture_client text := 'audit-pkce-' || gen_random_uuid()::text;
  fixture_user uuid;
  verifier text := repeat('A',64);
  fixture_code text := 'qa_c_' || public.oauth_base64url(extensions.gen_random_bytes(32));
  redirect_uri text := 'https://audit.invalid/callback';
  n bigint;
  results jsonb := '{}'::jsonb;
BEGIN
  BEGIN
    select id into fixture_user from public.profiles where status='active' limit 1;
    if fixture_user is null then raise exception 'No active account available for transaction-only verification'; end if;
    insert into public.oauth_clients(client_id,display_name,redirect_uris,allowed_scopes)
      values(fixture_client,'Transaction-only PKCE audit',array[redirect_uri],array['profile.read']);
    insert into public.oauth_authorization_codes(code_hash,client_id,user_id,redirect_uri,scope,code_challenge,code_challenge_method,expires_at)
      values(public.oauth_sha256_hex(fixture_code),fixture_client,fixture_user,redirect_uri,array['profile.read'],public.oauth_base64url(extensions.digest(convert_to(verifier,'UTF8'),'sha256')),'S256',now()+interval '5 minutes');
    select count(*) into n from public.oauth_exchange_authorization_code(fixture_client,redirect_uri,fixture_code,null);
    if n<>0 then raise exception 'NULL verifier accepted'; end if;
    results:=results||jsonb_build_object('null_verifier_rejected',true);
    select count(*) into n from public.oauth_exchange_authorization_code(fixture_client,redirect_uri,fixture_code,'');
    if n<>0 then raise exception 'Empty verifier accepted'; end if;
    results:=results||jsonb_build_object('empty_verifier_rejected',true);
    select count(*) into n from public.oauth_exchange_authorization_code(fixture_client,redirect_uri,fixture_code,repeat('B',64));
    if n<>0 then raise exception 'Wrong verifier accepted'; end if;
    results:=results||jsonb_build_object('wrong_verifier_rejected',true);
    select count(*) into n from public.oauth_exchange_authorization_code(fixture_client,'https://audit.invalid/wrong',fixture_code,verifier);
    if n<>0 then raise exception 'Wrong redirect accepted'; end if;
    results:=results||jsonb_build_object('redirect_binding_preserved',true);
    if exists(select 1 from public.oauth_authorization_codes where client_id=fixture_client and consumed_at is not null) then raise exception 'Rejected proof consumed code'; end if;
    results:=results||jsonb_build_object('rejections_preserve_code',true);
    select count(*) into n from public.oauth_exchange_authorization_code(fixture_client,redirect_uri,fixture_code,verifier);
    if n<>1 then raise exception 'Valid proof failed'; end if;
    results:=results||jsonb_build_object('valid_exchange_passed',true);
    select count(*) into n from public.oauth_exchange_authorization_code(fixture_client,redirect_uri,fixture_code,verifier);
    if n<>0 then raise exception 'Consumed code replay accepted'; end if;
    results:=results||jsonb_build_object('replay_rejected',true);
    raise exception using errcode='Z0001',message='Rollback synthetic audit fixtures';
  EXCEPTION WHEN SQLSTATE 'Z0001' THEN NULL;
  END;
  if exists(select 1 from public.oauth_clients where client_id=fixture_client)
    or exists(select 1 from public.oauth_authorization_codes where client_id=fixture_client)
    or exists(select 1 from public.oauth_access_tokens where client_id=fixture_client)
    or exists(select 1 from public.oauth_refresh_tokens where client_id=fixture_client) then raise exception 'Fixture rollback failed'; end if;
  perform set_config('audit.pkce_results',(results||jsonb_build_object('all_fixture_rows_rolled_back',true))::text,true);
END;
$test$;
select current_setting('audit.pkce_results')::jsonb as verification;
ROLLBACK;
