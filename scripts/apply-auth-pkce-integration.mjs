import fs from 'node:fs';

function replaceOnce(text, needle, replacement, label) {
  const count = text.split(needle).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one match, found ${count}`);
  return text.replace(needle, replacement);
}

let auth = fs.readFileSync('auth-worker.js', 'utf8');
let check = fs.readFileSync('.github/workflows/auth-check.yml', 'utf8');
let deploy = fs.readFileSync('.github/workflows/deploy-production.yml', 'utf8');

if (!auth.startsWith('import { handleOAuthRequest } from "./auth-oauth.js";')) {
  auth = 'import { handleOAuthRequest } from "./auth-oauth.js";\n\n' + auth;
}

if (!auth.includes('const OAUTH_PATHS = new Set(')) {
  auth = replaceOnce(
    auth,
    'const ACTIVE_STATUS = "active";\n',
    'const ACTIVE_STATUS = "active";\nconst OAUTH_PATHS = new Set([\n  "/authorize",\n  "/api/oauth/authorize",\n  "/oauth/token",\n  "/oauth/revoke",\n  "/oauth/introspect",\n  "/.well-known/oauth-authorization-server"\n]);\n',
    'oauth path set'
  );
}

if (!auth.includes('if (OAUTH_PATHS.has(pathname)) return handleOAuthRequest(request);')) {
  auth = replaceOnce(
    auth,
    '    const pathname = normalizePath(url.pathname);\n',
    '    const pathname = normalizePath(url.pathname);\n\n    if (OAUTH_PATHS.has(pathname)) return handleOAuthRequest(request);\n',
    'oauth route delegation'
  );
}

if (!check.includes('      - "auth-oauth.js"')) {
  check = check.replaceAll('      - "auth-worker.js"\n', '      - "auth-worker.js"\n      - "auth-oauth.js"\n');
}
if (!check.includes('node --check auth-oauth.js')) {
  check = replaceOnce(
    check,
    '        run: node --check auth-worker.js\n',
    '        run: |\n          node --check auth-worker.js\n          node --check auth-oauth.js\n',
    'auth syntax checks'
  );
}
if (!check.includes('Bundle Auth Worker')) {
  check = replaceOnce(
    check,
    '      - name: Validate Auth Wrangler JSONC shape\n',
    '      - name: Bundle Auth Worker\n        run: npx --yes wrangler@4 deploy -c wrangler.auth.jsonc --dry-run --outdir .wrangler-dry-run\n\n      - name: Validate Auth Wrangler JSONC shape\n',
    'wrangler dry run'
  );
}

if (!deploy.includes('      - auth-oauth.js')) {
  deploy = replaceOnce(
    deploy,
    '      - auth-worker.js\n',
    '      - auth-worker.js\n      - auth-oauth.js\n',
    'deploy auth oauth path'
  );
}
if (!deploy.includes('node --check auth-oauth.js')) {
  deploy = replaceOnce(
    deploy,
    '          node --check auth-worker.js\n',
    '          node --check auth-worker.js\n          node --check auth-oauth.js\n',
    'deploy oauth syntax'
  );
}

fs.writeFileSync('auth-worker.js', auth);
fs.writeFileSync('.github/workflows/auth-check.yml', check);
fs.writeFileSync('.github/workflows/deploy-production.yml', deploy);
console.log('Integrated OAuth PKCE routes and CI/deploy checks.');
