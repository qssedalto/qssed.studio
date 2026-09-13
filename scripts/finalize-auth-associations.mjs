import fs from 'node:fs';

const authPath = 'auth-worker.js';
let auth = fs.readFileSync(authPath, 'utf8');
if (!auth.includes('"/oauth/introspect"')) {
  const needle = '  "/oauth/revoke",\n  "/.well-known/oauth-authorization-server"';
  if (!auth.includes(needle)) throw new Error('Could not locate OAuth path registry');
  auth = auth.replace(needle, '  "/oauth/revoke",\n  "/oauth/introspect",\n  "/.well-known/oauth-authorization-server"');
  fs.writeFileSync(authPath, auth);
}

const docsPath = 'AUTH_PORTAL.md';
let docs = fs.readFileSync(docsPath, 'utf8');
if (!docs.includes('`POST /oauth/introspect`')) {
  docs = docs.replace(
    '- `POST /oauth/revoke` — revokes a QssedA access or refresh token.\n- `GET /.well-known/oauth-authorization-server` — publishes OAuth server metadata.',
    '- `POST /oauth/revoke` — revokes a QssedA access or refresh token.\n- `POST /oauth/introspect` — allows an authenticated QssedA resource server to validate an opaque access token.\n- `GET /.well-known/oauth-authorization-server` — publishes OAuth server metadata.'
  );

  const marker = '## Browser session model\n';
  const section = `## Resource-server token validation\n\nQssedA application access tokens are opaque, so API/resource servers validate them through \`POST /oauth/introspect\`. This endpoint is not a public-client API: the caller must authenticate with HTTP Basic credentials for a registered resource server.\n\nResource-server credentials are represented by \`oauth_resource_servers\`. Only a SHA-256 hash of the resource-server secret is persisted, and a resource server can be restricted to tokens issued for specific OAuth client IDs. Invalid server credentials fail with \`401 invalid_client\`; a valid server querying an invalid, expired, revoked, inactive-account, or disallowed-client token receives \`{ "active": false }\`.\n\nThe raw database introspection RPC is not executable by \`anon\` or \`authenticated\`; browser and desktop public clients therefore cannot use it as a token oracle.\n\n`;
  if (!docs.includes(marker)) throw new Error('Could not locate browser session section');
  docs = docs.replace(marker, section + marker);

  docs = docs.replace(
    '- `auth-worker.js` — browser Auth UI, sessions, account status, Studio handoff, OAuth route dispatch\n- `auth-oauth.js` — OAuth metadata, authorization/consent, token exchange, refresh and revocation\n- `wrangler.auth.jsonc` — Auth Cloudflare Worker configuration',
    '- `auth-entry.js` — Auth Worker entrypoint and PKCE self-test dispatch\n- `auth-worker.js` — browser Auth UI, sessions, account status, Studio handoff, OAuth route dispatch\n- `auth-oauth.js` — OAuth metadata, authorization/consent, token exchange, refresh, revocation and protected introspection\n- `auth-pkce-test.js` — browser PKCE self-test\n- `wrangler.auth.jsonc` — Auth Cloudflare Worker configuration'
  );

  if (!docs.includes('202609131150_oauth_resource_server_introspection_v1.sql')) {
    docs = docs.replace(
      '- `supabase/migrations/202609131005_oauth_pkce_privilege_hardening.sql` — OAuth RPC privilege hardening',
      '- `supabase/migrations/202609131005_oauth_pkce_privilege_hardening.sql` — OAuth RPC privilege hardening\n- `supabase/migrations/202609131150_oauth_resource_server_introspection_v1.sql` — authenticated resource-server introspection'
    );
  }
  fs.writeFileSync(docsPath, docs);
}

console.log('Auth routing and documentation associations finalized.');
