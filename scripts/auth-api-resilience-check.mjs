import assert from 'node:assert/strict';
import { handleStudioSessionBootstrap, studioSessionFailure, studioSessionBootstrapPage } from '../studio/session-gate.js';
import { handleTexApi } from '../studio/tex-api-core.js';
const realFetch=globalThis.fetch,user='11111111-1111-4111-8111-111111111111';
const response=(data,status=200)=>Response.json(data,{status});
const request=(host='work',body={access_token:'token',refresh_token:'refresh'},marker=user)=>new Request(`https://${host}.qsseda.com/api/auth/bootstrap`,{
  method:'POST',headers:{origin:`https://${host}.qsseda.com`,'content-type':'application/json',cookie:`__Secure-qsseda-account-id=${marker}`},body:JSON.stringify(body)});
let checks=0;
try {
  for(const status of [429,500,503]){
    globalThis.fetch=async(url,options)=>{assert(options.signal instanceof AbortSignal);return response({},status)};
    const r=await handleStudioSessionBootstrap(request());assert.equal(r.status,503);assert.equal(r.headers.get('set-cookie'),null);
    assert.equal(r.headers.get('retry-after'),'5');checks++;
    const api=await handleTexApi(new Request('https://work.qsseda.com/api/tex/status',{headers:{cookie:`__Host-qsseda-studio-access=token; __Secure-qsseda-account-id=${user}`}}),{},'status');
    assert.equal(api.status,503);assert.equal(api.headers.get('set-cookie'),null);
  }
  globalThis.fetch=async()=>{throw new DOMException('Timed out','TimeoutError')};
  assert.equal((await handleStudioSessionBootstrap(request())).status,503);checks++;
  globalThis.fetch=async()=>response({},401);
  const denied=await handleStudioSessionBootstrap(request());assert.equal(denied.status,401);assert.match(denied.headers.get('set-cookie'),/Max-Age=0/);checks++;
  globalThis.fetch=async url=>String(url).includes('/auth/v1/user')?response({id:user}):response([{status:'active'}]);
  for(const host of ['work','gpt','cash','aw']){
    assert.equal((await handleStudioSessionBootstrap(request(host))).status,200);
    assert.equal((await handleStudioSessionBootstrap(request(host,undefined,'signed-out'))).status,401);
    assert.equal((await handleStudioSessionBootstrap(request(host,undefined,'22222222-2222-4222-8222-222222222222'))).status,409);checks++;
  }
  assert.equal((await handleStudioSessionBootstrap(request('work',{access_token:'x'.repeat(33000),refresh_token:'x'}))).status,413);checks++;
  const page=studioSessionBootstrapPage('en-us',new Request('https://work.qsseda.com/en-us/work'),true);
  assert.equal(page.status,503);assert.match(await page.text(),/if \(true\) \{ unavailable\(\); return; \}/);checks++;
  assert.equal(studioSessionFailure({temporary:false}).status,401);
} finally {globalThis.fetch=realFetch;}
console.log(`PASS: ${checks} authentication outage, cookie, host identity and bounded-request groups`);
