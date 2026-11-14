import assert from 'node:assert/strict';
import authWorker from '../auth-worker.js';
import { handleAuthSsoRequest, trustedSilentParent } from '../auth-sso.js';
import { handleAuthHandoff } from '../studio/auth-handoff.js';
import { handleStudioSessionBootstrap, verifyStudioPageSession } from '../studio/session-gate.js';
import { supabaseScript } from '../studio/ui-page.js';
import { readFileSync } from 'node:fs';

const originalFetch = globalThis.fetch;
const userId = '11111111-1111-4111-8111-111111111111';
const user = { id: userId, email: 'owner@example.invalid' };
const jwt = 'eyJhbGciOiJIUzI1NiJ9.' + Buffer.from(JSON.stringify({sub:userId,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url') + '.signature';
const fresh = { access_token:jwt, refresh_token:'exclusive-auth-refresh-token', expires_in:3600, user };
const json=(payload,status=200)=>Response.json(payload,{status});
let exchanges=0, revocations=0;
const mockFetch=async (url, options={}) => {
  const target=String(url);
  if (target.includes('/auth/v1/token?grant_type=refresh_token')) { exchanges++; return json(fresh); }
  if (target.includes('/auth/v1/logout')) { revocations++; return json({}); }
  if (target.includes('/auth/v1/user')) return options.headers?.Authorization === `Bearer ${jwt}` ? json(user) : json({error:'expired'},401);
  if (target.includes('/rest/v1/profiles')) return json([{status:'active'}]);
  throw new Error('Unexpected upstream request '+target);
};
const cookies='__Host-qsseda-access=expired; __Host-qsseda-refresh=only-auth-can-rotate';
const nonce='0123456789abcdef0123456789abcdef';
const cookieValues=response=>response.headers.get('set-cookie')||'';
let count=0;
try {
  globalThis.fetch=mockFetch;
  // A normal /continue must keep the rotating credential on Auth, never forward it.
  const continueResponse=await authWorker.fetch(new Request('https://auth.qsseda.com/continue',{headers:{Cookie:cookies}}),{});
  assert.equal(continueResponse.status,200);
  const transition=await continueResponse.text();
  assert.match(transition,/name="access_token"/);
  assert.doesNotMatch(transition,/name="refresh_token"|exclusive-auth-refresh-token|only-auth-can-rotate/);
  assert.match(cookieValues(continueResponse),/exclusive-auth-refresh-token/);
  count++;

  // The destination handoff now requires only a verified access token.
  const handoff=await handleAuthHandoff(new Request('https://work.qsseda.com/auth/handoff',{
    method:'POST',headers:{Origin:'https://auth.qsseda.com', 'Content-Type':'application/x-www-form-urlencoded',Cookie:`__Secure-qsseda-account-id=${userId}`},
    body:new URLSearchParams({access_token:jwt,next:'/zh-cn/tex'})
  }),{},'zh-cn');
  assert.equal(handoff.status,200);
  assert.match(cookieValues(handoff),/__Host-qsseda-studio-sso=1/);
  assert.match(cookieValues(handoff),/__Host-qsseda-studio-refresh=; Path=\/; Max-Age=0/);
  const html=await handoff.text();
  assert.match(html,/aertex-sso-browser-no-refresh-v1/);
  assert.doesNotMatch(html,/exclusive-auth-refresh-token/);
  count++;

  // The origin-locked, nonce-matched silent channel must not expose refresh.
  assert.equal(trustedSilentParent(new Request('https://auth.qsseda.com/sso/silent'),'https://work.qsseda.com'),'https://work.qsseda.com');
  for(const parent of ['https://attacker.example','https://work.qsseda.studio','http://work.qsseda.com','https://auth.qsseda.com','https://work.qsseda.com.evil.com','https://work.qsseda.com/path']){
    const response=await handleAuthSsoRequest(new Request('https://auth.qsseda.com/sso/silent?nonce='+nonce+'&parent_origin='+encodeURIComponent(parent),{headers:{Cookie:cookies}}));
    assert.equal(response.status,403,'Unexpected silent parent: '+parent);
  }
  const iframe=await handleAuthSsoRequest(new Request('https://auth.qsseda.com/sso/silent?nonce='+nonce+'&parent_origin=https%3A%2F%2Fwork.qsseda.com',{headers:{Cookie:cookies}}));
  assert.equal(iframe.status,200);
  assert.match(iframe.headers.get('content-security-policy')||'',/frame-ancestors https:\/\/work.qsseda.com/);
  const iframeBody=await iframe.text();
  assert.match(iframeBody,/aertex.sso.renew.v1/);
  assert.match(iframeBody, /window.parent.postMessage/);
  assert.doesNotMatch(iframeBody,/exclusive-auth-refresh-token|only-auth-can-rotate|name="refresh_token"/);
  count++;

  // Even a legacy browser supplying refresh_token cannot install it on a product.
  const bootstrap=await handleStudioSessionBootstrap(new Request('https://work.qsseda.com/api/auth/bootstrap',{
    method:'POST',headers:{Origin:'https://work.qsseda.com','Content-Type':'application/json',Cookie:`__Secure-qsseda-account-id=${userId}`},
    body:JSON.stringify({access_token:jwt,refresh_token:'attempt-to-copy-auth-refresh'})
  }));
  assert.equal(bootstrap.status,200);
  assert.match(cookieValues(bootstrap),/__Host-qsseda-studio-sso=1/);
  assert.doesNotMatch(cookieValues(bootstrap),/attempt-to-copy-auth-refresh/);
  count++;

  // A stale product access token must never rotate the Auth refresh cookie.
  const before=exchanges;
  const gate=await verifyStudioPageSession(new Request('https://work.qsseda.com/zh-cn/tex',{
    headers:{Cookie:`__Host-qsseda-studio-access=expired; __Host-qsseda-studio-refresh=only-auth-can-rotate; __Host-qsseda-studio-sso=1; __Secure-qsseda-account-id=${userId}`}
  }));
  assert.equal(gate.ok,false);
  assert.equal(exchanges,before,'SSO-managed product tried to refresh a token');
  count++;

  // A domain-wide sign-out marker fails closed rather than bootstrapping a ghost login.
  const revoked=await handleStudioSessionBootstrap(new Request('https://work.qsseda.com/api/auth/bootstrap',{
    method:'POST',headers:{Origin:'https://work.qsseda.com','Content-Type':'application/json',Cookie:'__Secure-qsseda-account-id=signed-out'},
    body:JSON.stringify({access_token:jwt})
  }));
  assert.equal(revoked.status,401);
  const centralLogout=await authWorker.fetch(new Request('https://auth.qsseda.com/logout',{headers:{Cookie:`__Host-qsseda-access=${jwt}; __Host-qsseda-refresh=exclusive-auth-refresh-token`}}),{});
  assert.equal(centralLogout.status,302);
  assert.match(cookieValues(centralLogout),/signed-out/);
  assert.equal(revocations,1);
  count++;

  const script=supabaseScript();
  const routing = readFileSync(new URL('../studio/routing.js',import.meta.url),'utf8');
  assert.match(routing,/frame-src https:\/\/auth\.qsseda\.com https:\/\/auth\.qsseda\.studio/);
  const shell = readFileSync(new URL('../studio/ui-shell.js',import.meta.url),'utf8');
  assert.match(shell,/new URL\("\/logout", "https:\/\/auth\." \+ rootDomain\)/);
  assert.doesNotMatch(shell,/new URL\("\/logout", loginUrl/);
  assert.match(script,/autoRefreshToken: false/);
  assert.match(script,/__aertexSsoRenew/);
  assert.match(script,/auth\.\" \+ root|auth\.\" \+ root/);
  for (const path of ['studio/work-subdomain.js','studio/gpt-subdomain.js','studio/cash-subdomain.js','studio/watch-subdomain.js']) {
    assert.doesNotMatch(readFileSync(new URL('../'+path,import.meta.url),'utf8'),/name="refresh_token"/,'Unsafe product token forwarding in '+path);
  }
  count++;
} finally { globalThis.fetch=originalFetch; }
console.log(`SSO single authority checks passed (${count} groups, ${exchanges} Auth-only refreshes)`);
