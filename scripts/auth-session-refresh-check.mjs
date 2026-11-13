import assert from "node:assert/strict";
import authWorker from "../auth-worker.js";
import { handleAuthSsoRequest } from "../auth-sso.js";
import { refreshBrowserAuthSession } from "../auth-browser-refresh.js";
import { verifyStudioPageSession } from "../studio/session-gate.js";

const originalFetch=globalThis.fetch;
const userId="11111111-1111-4111-8111-111111111111";
const goodUser={id:userId,email:"test@example.invalid"};
const fresh={access_token:"new-access",refresh_token:"new-refresh",expires_in:3600,user:goodUser};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json"}});
const expiredCookies="__Host-qsseda-access=expired-access; __Host-qsseda-refresh=still-valid";
const studioCookies="__Host-qsseda-studio-access=expired-access; __Host-qsseda-studio-refresh=still-valid";
const request=(url,cookie)=>new Request(url,{headers:{Cookie:cookie}});
const statuses=[];

async function withFetch(handler,run) {
  globalThis.fetch=handler;
  try {return await run();}
  finally {globalThis.fetch=originalFetch;}
}
function upstream(mode) {
  return async url=>{
    const path=String(url);
    if(path.includes("/auth/v1/user"))return json({error:"expired"},401);
    if(path.includes("/auth/v1/token?grant_type=refresh_token")){
      if(mode==="ok")return json(fresh);
      if(mode==="transient")return json({error:"temporarily unavailable"},503);
      if(mode==="invalid")return json({error:"invalid refresh token"},400);
      if(mode==="network")throw Error("upstream timeout");
    }
    if(path.includes("/rest/v1/profiles"))return json([{status:"active"}]);
    throw Error("Unexpected request "+path);
  };
}
await withFetch(upstream("ok"),async()=>{
  const sso=await handleAuthSsoRequest(request("https://auth.qsseda.com/sso/start?next=%2Fdashboard",expiredCookies));
  assert.equal(sso.status,302,"Expired access must be refreshed, not redirected to password login");
  assert.match(sso.headers.get("location"),/\/sso\/complete/);
  assert.match(sso.headers.get("set-cookie")||"",/new-access/);
  statuses.push("SSO recovered");
  const session=await authWorker.fetch(request("https://auth.qsseda.com/api/session",expiredCookies),{});
  assert.equal(session.status,200);
  assert.equal((await session.json()).authenticated,true,"/api/session must recover without a password");
  statuses.push("Auth API recovered");
  const cont=await authWorker.fetch(request("https://auth.qsseda.com/continue",expiredCookies),{});
  assert.equal(cont.status,200,"/continue must handoff without login when refresh valid");
  assert.match(cont.headers.get("set-cookie")||"",/new-refresh/);
  statuses.push("Continue recovered");
});
for(const mode of ["transient","network"]){
  await withFetch(upstream(mode),async()=>{
    const sso=await handleAuthSsoRequest(request("https://auth.qsseda.com/sso/start",expiredCookies));
    assert.equal(sso.status,503,"SSO must not route transient auth outage to password login");
    assert.equal(sso.headers.get("set-cookie"),null,"SSO must not clear cookies during outage");
    const api=await authWorker.fetch(request("https://auth.qsseda.com/api/session",expiredCookies),{});
    assert.equal(api.status,503);
    assert.equal(api.headers.get("set-cookie"),null,"Session API must not clear cookies during outage");
    const cont=await authWorker.fetch(request("https://auth.qsseda.com/continue",expiredCookies),{});
    assert.equal(cont.status,503);
    assert.equal(cont.headers.get("set-cookie"),null);
    const main=await verifyStudioPageSession(request("https://qsseda.com/zh-cn/work",studioCookies));
    assert.equal(main.ok,false);
    assert.equal(main.temporary,true,"Studio failure must preserve the existing cookie");
    assert.deepEqual(main.cookies,[]);
  });
  statuses.push(mode+" preserved cookies");
}
await withFetch(upstream("invalid"),async()=>{
  const sso=await handleAuthSsoRequest(request("https://auth.qsseda.com/sso/start",expiredCookies));
  assert.equal(sso.status,302);
  assert.match(sso.headers.get("location"),/\/login/,"Genuinely invalid refresh token must still require login");
  const session=await authWorker.fetch(request("https://auth.qsseda.com/api/session",expiredCookies),{});
  assert.equal(session.status,200);
  assert.equal((await session.json()).authenticated,false);
  assert.match(session.headers.get("set-cookie")||"",/Max-Age=0/,"Invalid session must be cleared");
});
statuses.push("Revoked login enforcement");

let times=0,release;
const hold=new Promise(resolve=>{release=resolve;});
const pendingFetch=async()=>{times++;await hold;return json(fresh);};
const first=refreshBrowserAuthSession("parallel-recovery-token",pendingFetch);
const second=refreshBrowserAuthSession("parallel-recovery-token",pendingFetch);
await Promise.resolve();
release();
const both=await Promise.all([first,second]);
assert.equal(times,1,"Concurrent refresh of one token on one isolate must be coalesced");
assert(both.every(item=>item.kind==="ok"));
statuses.push("Concurrent refresh coalesced");
assert.equal(globalThis.fetch,originalFetch);
console.log("Auth SSO / API / Continue / Studio refresh regression checks passed: "+statuses.join(", "));
