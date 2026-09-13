-- Supabase grants EXECUTE on newly-created public functions to API roles by default.
-- Restrict internal helpers and ensure authorization-code issuance requires an authenticated Supabase session.

revoke execute on function public.oauth_sha256_hex(text) from anon, authenticated;
revoke execute on function public.oauth_base64url(bytea) from anon, authenticated;
revoke execute on function public.oauth_redirect_allowed(text[], text) from anon, authenticated;
revoke execute on function public.oauth_scope_array(text) from anon, authenticated;

revoke execute on function public.oauth_issue_authorization_code(text, text, text, text) from anon;
grant execute on function public.oauth_issue_authorization_code(text, text, text, text) to authenticated;

-- The following are intentionally public protocol operations for a desktop public client.
-- They authenticate using possession of the authorization code, PKCE verifier, or bearer token.
grant execute on function public.oauth_validate_client(text, text, text) to anon, authenticated;
grant execute on function public.oauth_exchange_authorization_code(text, text, text, text) to anon, authenticated;
grant execute on function public.oauth_refresh_access_token(text, text) to anon, authenticated;
grant execute on function public.oauth_revoke_token(text, text) to anon, authenticated;
grant execute on function public.oauth_introspect_access_token(text) to anon, authenticated;
