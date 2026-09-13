import fs from 'node:fs';

function replaceOnce(text, needle, replacement, label) {
  const count = text.split(needle).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, found ${count}`);
  return text.replace(needle, replacement);
}

function insertAfter(text, needle, addition, label) {
  return replaceOnce(text, needle, needle + addition, label);
}

let auth = fs.readFileSync('auth-worker.js', 'utf8');
let deploy = fs.readFileSync('.github/workflows/deploy-production.yml', 'utf8');
let check = fs.readFileSync('.github/workflows/auth-check.yml', 'utf8');

if (!auth.includes('handlePkceTestRequest')) {
  auth = replaceOnce(
    auth,
    'import { handleOAuthRequest } from "./auth-oauth.js";\n',
    'import { handleOAuthRequest } from "./auth-oauth.js";\nimport { handlePkceTestRequest } from "./auth-pkce-test.js";\n',
    'auth import'
  );

  auth = insertAfter(
    auth,
    'const OAUTH_PATHS = new Set([\n  "/authorize",\n  "/api/oauth/authorize",\n  "/oauth/token",\n  "/oauth/revoke",\n  "/.well-known/oauth-authorization-server"\n]);\n',
    '\nconst PKCE_TEST_PATHS = new Set([\n  "/pkce-test",\n  "/pkce-test/callback"\n]);\n',
    'pkce path set'
  );

  auth = replaceOnce(
    auth,
    '    if (OAUTH_PATHS.has(pathname)) return handleOAuthRequest(request);\n',
    '    if (PKCE_TEST_PATHS.has(pathname)) return handlePkceTestRequest(request);\n    if (OAUTH_PATHS.has(pathname)) return handleOAuthRequest(request);\n',
    'pkce route dispatch'
  );
}

function ensureWorkflowPath(text, anchor, line, label) {
  if (text.includes(line.trim())) return text;
  return replaceOnce(text, anchor, anchor + line, label);
}

deploy = ensureWorkflowPath(
  deploy,
  '      - auth-oauth.js\n',
  '      - auth-pkce-test.js\n',
  'deploy path'
);

if (!deploy.includes('node --check auth-pkce-test.js')) {
  deploy = replaceOnce(
    deploy,
    '          node --check auth-oauth.js\n',
    '          node --check auth-oauth.js\n          node --check auth-pkce-test.js\n',
    'deploy syntax check'
  );
}

check = ensureWorkflowPath(
  check,
  '      - "auth-oauth.js"\n',
  '      - "auth-pkce-test.js"\n',
  'check pull path'
);

const secondPushMarker = '      - "auth-oauth.js"\n';
const firstIndex = check.indexOf(secondPushMarker);
const secondIndex = check.indexOf(secondPushMarker, firstIndex + secondPushMarker.length);
if (secondIndex !== -1 && !check.slice(secondIndex, secondIndex + 120).includes('auth-pkce-test.js')) {
  check = check.slice(0, secondIndex + secondPushMarker.length) + '      - "auth-pkce-test.js"\n' + check.slice(secondIndex + secondPushMarker.length);
}

if (!check.includes('node --check auth-pkce-test.js')) {
  check = replaceOnce(
    check,
    '          node --check auth-oauth.js\n',
    '          node --check auth-oauth.js\n          node --check auth-pkce-test.js\n',
    'check syntax'
  );
}

fs.writeFileSync('auth-worker.js', auth);
fs.writeFileSync('.github/workflows/deploy-production.yml', deploy);
fs.writeFileSync('.github/workflows/auth-check.yml', check);
console.log('Wired PKCE self-test into Auth Worker and CI/deploy workflows.');
