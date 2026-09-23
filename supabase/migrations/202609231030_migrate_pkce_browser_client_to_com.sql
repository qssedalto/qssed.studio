-- Move the first-party browser PKCE self-test callback to the qsseda.com Auth origin.
update public.oauth_clients
set redirect_uris = array['https://auth.qsseda.com/pkce-test/callback'],
    updated_at = now()
where client_id = 'qsseda-pkce-browser-test';
