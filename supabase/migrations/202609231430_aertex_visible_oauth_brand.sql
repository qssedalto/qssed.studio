-- User-visible product branding only. Technical client IDs and redirect URIs remain unchanged.
update public.oauth_clients
set display_name = case client_id
  when 'qsseda-git-desktop' then 'AERTEX Git'
  when 'qsseda-pkce-browser-test' then 'AERTEX PKCE Self-Test'
  else display_name
end,
updated_at = now()
where client_id in ('qsseda-git-desktop', 'qsseda-pkce-browser-test');
