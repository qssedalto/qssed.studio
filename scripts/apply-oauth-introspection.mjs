import fs from 'node:fs';

const file = 'auth-oauth.js';
let text = fs.readFileSync(file, 'utf8');

function replaceOnce(source, needle, replacement, label) {
  const count = source.split(needle).length - 1;
  if (count !== 1) throw new Error(`${label}: expected 1 match, found ${count}`);
  return source.replace(needle, replacement);
}

text = replaceOnce(
  text,
  `  if (pathname === "/oauth/revoke") {\n    if (request.method !== "POST") return oauthError("invalid_request", "Method not allowed", 405);\n    return handleRevoke(request);\n  }\n\n  return oauthError("invalid_request", "OAuth endpoint not found", 404);`,
  `  if (pathname === "/oauth/revoke") {\n    if (request.method !== "POST") return oauthError("invalid_request", "Method not allowed", 405);\n    return handleRevoke(request);\n  }\n\n  if (pathname === "/oauth/introspect") {\n    if (request.method !== "POST") return oauthError("invalid_request", "Method not allowed", 405);\n    return handleIntrospect(request);\n  }\n\n  return oauthError("invalid_request", "OAuth endpoint not found", 404);`,
  'route'
);

const oldIntrospectStart = 'async function handleIntrospect(request) {';
const oldIntrospectEnd = '\nfunction metadataResponse(origin) {';
const start = text.indexOf(oldIntrospectStart);
const end = text.indexOf(oldIntrospectEnd, start);
if (start < 0 || end < 0) throw new Error('handleIntrospect section not found');

const newIntrospect = `async function handleIntrospect(request) {\n  const credentials = parseBasicCredentials(request.headers.get("Authorization") || "");\n  if (!credentials) return introspectionUnauthorized();\n\n  const form = await readForm(request);\n  if (!form) return oauthError("invalid_request", "Expected application/x-www-form-urlencoded body", 400);\n  const token = clean(form.get("token"), 1200);\n  if (!token) return oauthError("invalid_request", "token is required", 400);\n\n  const result = await rpc("oauth_introspect_for_resource_server", {\n    p_resource_server_id: credentials.id,\n    p_resource_server_secret: credentials.secret,\n    p_access_token: token\n  });\n  const row = firstRow(result);\n\n  if (!row?.authorized) return introspectionUnauthorized();\n  if (!row?.active) return json({ active: false });\n\n  return json({\n    active: true,\n    client_id: row.client_id,\n    sub: row.user_id,\n    scope: row.scope || "",\n    token_type: "Bearer",\n    exp: row.expires_at ? Math.floor(new Date(row.expires_at).getTime() / 1000) : undefined\n  });\n}\n\nfunction parseBasicCredentials(header) {\n  if (!header.startsWith("Basic ")) return null;\n  try {\n    const decoded = atob(header.slice(6).trim());\n    const separator = decoded.indexOf(":");\n    if (separator <= 0) return null;\n    const id = clean(decoded.slice(0, separator), 160);\n    const secret = clean(decoded.slice(separator + 1), 500);\n    if (!id || !secret) return null;\n    return { id, secret };\n  } catch {\n    return null;\n  }\n}\n\nfunction introspectionUnauthorized() {\n  const headers = oauthHeaders("application/json;charset=UTF-8");\n  headers.set("www-authenticate", 'Basic realm="QssedA OAuth Resource Server"');\n  return new Response(JSON.stringify({ error: "invalid_client" }), { status: 401, headers });\n}\n`;

text = text.slice(0, start) + newIntrospect + text.slice(end);

text = replaceOnce(
  text,
  `    revocation_endpoint: \`${'${issuer}'}/oauth/revoke\`,`,
  `    revocation_endpoint: \`${'${issuer}'}/oauth/revoke\`,\n    introspection_endpoint: \`${'${issuer}'}/oauth/introspect\`,`,
  'metadata'
);

fs.writeFileSync(file, text);
console.log('Protected OAuth introspection endpoint wired.');
// Triggered after the workflow was added so the one-off job runs on this push.
