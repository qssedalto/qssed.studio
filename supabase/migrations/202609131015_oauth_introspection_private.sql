-- OAuth token introspection is a resource-server operation, not a public-client endpoint.
-- Keep the function available to privileged server roles, but remove browser/public-client execution.

revoke execute on function public.oauth_introspect_access_token(text) from anon, authenticated;
