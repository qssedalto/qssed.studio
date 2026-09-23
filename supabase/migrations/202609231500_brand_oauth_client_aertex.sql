-- User-facing brand rename only. Technical OAuth client_id remains stable.
update public.oauth_clients
set display_name = 'AERTEX Git',
    updated_at = now()
where client_id = 'qsseda-git-desktop'
  and display_name is distinct from 'AERTEX Git';
