-- Dedicated first-party browser client for validating the QssedA Auth PKCE flow without a desktop GUI.
insert into public.oauth_clients (
  client_id,
  display_name,
  redirect_uris,
  allowed_scopes,
  is_active
) values (
  'qsseda-pkce-browser-test',
  'QssedA PKCE Self-Test',
  array['https://auth.qsseda.studio/pkce-test/callback'],
  array['profile.read', 'session.read'],
  true
)
on conflict (client_id) do update set
  display_name = excluded.display_name,
  redirect_uris = excluded.redirect_uris,
  allowed_scopes = excluded.allowed_scopes,
  is_active = true,
  updated_at = now();
