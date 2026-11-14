import assert from 'node:assert/strict';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
import { supabaseScript } from '../studio/ui-page.js';

const page=supabaseScript();
const js=page.slice(page.indexOf('<script>')+8,page.lastIndexOf('</script>'));
const id='11111111-1111-4111-8111-111111111111';
const token='header.'+Buffer.from(JSON.stringify({sub:id,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.sig';

async function exercise(allowBootstrap) {
  const handlers={};
  const storage=new Map();
  let usedIframe=false, wrongMessages=0, cookieUpdates=0, jsUpdates=0;
  const body={appendChild(iframe){
    usedIframe=true;
    const target=new URL(iframe.src);
    const nonce=target.searchParams.get('nonce');
    assert.equal(target.origin,'https://auth.qsseda.com');
    assert.equal(target.searchParams.get('parent_origin'),'https://work.qsseda.com');
    const send=(origin,n,data)=>handlers.message?.({origin,source:iframe.contentWindow,data:{kind:'aertex.sso.renew.v1',nonce:n,ok:true,access_token:data}});
    queueMicrotask(()=>{
      wrongMessages++;
      send('https://evil.example',nonce,token);
      send('https://auth.qsseda.com','fake-nonce',token);
      send('https://auth.qsseda.com',nonce,token);
    });
  }};
  const doc={readyState:'complete',visibilityState:'visible',body,
    addEventListener(type,handler){handlers['doc-'+type]=handler;},
    createElement(){return {style:{},contentWindow:{},setAttribute(){},remove(){},referrerPolicy:'',tabIndex:0};}
  };
  const win={addEventListener(type,handler){handlers[type]=handler;},removeEventListener(type,handler){if(handlers[type]===handler)delete handlers[type];}};
  const env={
    window:win,document:doc,location:{origin:'https://work.qsseda.com',hostname:'work.qsseda.com'},
    localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
    sessionStorage:{getItem:()=>null,setItem(){},removeItem(){}},
    crypto:webcrypto,Uint8Array,Array,URL,URLSearchParams,JSON,Promise,Date,Number,Math,
    atob:s=>Buffer.from(s,'base64').toString('utf8'),
    setTimeout:function(callback,delay){const timer=setTimeout(callback,delay);if(delay>1000)timer.unref?.();return timer;},clearTimeout,queueMicrotask,console,
    supabase:{createClient(){return {auth:{async setSession(session){jsUpdates++;assert.equal(session.refresh_token,'aertex-sso-browser-no-refresh-v1');return {data:{session},error:null};}}};}},
    async fetch(path,options){
      cookieUpdates++;
      assert.equal(path,'/api/auth/bootstrap');
      assert.equal(options.credentials,'same-origin');
      const body=JSON.parse(options.body);
      assert.deepEqual(Object.keys(body),['access_token']);
      return new Response(null,{status:allowBootstrap?200:409});
    }
  };
  vm.runInNewContext(js,env,{timeout:3000});
  assert.equal(typeof win.__aertexSsoRenew,'function');
  const success=await win.__aertexSsoRenew('manual');
  assert.equal(success,allowBootstrap);
  assert.equal(jsUpdates,allowBootstrap?1:0,'Must not update SDK before verifying host identity');
  assert.equal(cookieUpdates,1);
  assert.equal(usedIframe,true);
  assert.equal(wrongMessages,1);
  return success;
}
await exercise(true);
await exercise(false);
console.log('SSO browser runtime isolated iframe, origin, nonce, host bootstrap and SDK checks passed.');
