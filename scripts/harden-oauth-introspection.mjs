import fs from 'node:fs';

function replaceOnce(text, needle, replacement, label) {
  const count = text.split(needle).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one match, found ${count}`);
  return text.replace(needle, replacement);
}

let worker = fs.readFileSync('auth-worker.js', 'utf8');
let oauth = fs.readFileSync('auth-oauth.js', 'utf8');

worker = replaceOnce(worker, '  "/oauth/revoke",\n  "/oauth/introspect",\n', '  "/oauth/revoke",\n', 'OAuth path list');

oauth = replaceOnce(
  oauth,
  '  if (pathname === "/oauth/introspect") {\n    if (request.method !== "POST") return oauthError("invalid_request", "Method not allowed", 405);\n    return handleIntrospect(request);\n  }\n\n',
  '',
  'public introspection route'
);

oauth = replaceOnce(
  oauth,
  '    revocation_endpoint: `${issuer}/oauth/revoke`,\n    introspection_endpoint: `${issuer}/oauth/introspect`,\n',
  '    revocation_endpoint: `${issuer}/oauth/revoke`,\n',
  'metadata introspection endpoint'
);

fs.writeFileSync('auth-worker.js', worker);
fs.writeFileSync('auth-oauth.js', oauth);
console.log('Removed public OAuth introspection route and metadata advertisement.');
