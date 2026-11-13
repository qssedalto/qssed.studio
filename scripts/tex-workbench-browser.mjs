// Full production Work renderer + production browser runtimes. Network services
// are deterministic local doubles; this does NOT claim physical iOS/WebAuthn QA.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import entry from '../studio/entry.js';
import { openBrowser, sleep } from './helpers/browser-cdp.mjs';
const owner='11111111-1111-4111-8111-111111111111',id='22222222-2222-4222-8222-222222222222';
const second='33333333-3333-4333-8333-333333333333';
const profile={id:owner,status:'active',username:'audit',display_name:'Audit user',email:'audit@example.invalid'};
const realFetch=globalThis.fetch;
globalThis.fetch=async url=>new Response(JSON.stringify(String(url).includes('/auth/v1/user')?profile:String(url).includes('/profiles?')?[profile]:false),{headers:{'content-type':'application/json'}});
let markup;
try{
 const response=await entry.fetch(new Request('https://work.qsseda.com/en-us/work/tex?document='+id,{headers:{cookie:'__Host-qsseda-studio-access=audit-local-only; __Secure-qsseda-account-id='+owner}}),{});
 assert.equal(response.status,200);markup=await response.text();
}finally{globalThis.fetch=realFetch;}
const setup=`<script>
window.__qaErrors=[];addEventListener('error',e=>__qaErrors.push(e.message));addEventListener('unhandledrejection',e=>__qaErrors.push(String(e.reason?.stack||e.reason)));
window.__qa={documents:new Map(),saves:[],fileSaves:[],delay:false,fail:false,releases:[],alerts:[]};
const qaOwner=${JSON.stringify(owner)},qaId=${JSON.stringify(id)},qaSecond=${JSON.stringify(second)};
const qaProfile=${JSON.stringify(profile)};
const qaDoc={id:qaId,owner_id:qaOwner,title:'Audit project',source:'\\\\documentclass{article}\\n\\\\begin{document}\\nAudit source\\n\\\\end{document}',engine:'xelatex',main_filename:'main.tex',realtime_epoch:'v2',storage_revision:'revision-1',created_at:'2026-01-01T00:00:00Z',updated_at:'2026-01-01T00:00:00Z',files:[{name:'chapters/intro.tex',encoding:'utf8',content:'Introduction'},{name:'data/table.csv',encoding:'utf8',content:'a,b\\n1,2'}]};
__qa.documents.set(qaId,qaDoc);__qa.documents.set(qaSecond,{...qaDoc,id:qaSecond,title:'Second project',source:'SECOND PROJECT',files:[{name:'private/notes.tex',encoding:'utf8',content:'Second'}]});
const qaReply=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json'}});
const qaFetch=window.fetch.bind(window);
window.fetch=async function(input,init={}){
 const url=new URL(input instanceof Request?input.url:String(input),location.href),method=String(init.method||(input instanceof Request?input.method:'GET')).toUpperCase();
 if(url.pathname.startsWith('/assets/'))return qaFetch(input,init);
 if(url.origin!==location.origin)throw Error('External service intentionally unavailable in audit fixture');
 let body={};try{body=JSON.parse(init.body||'{}');}catch{}
 const docId=url.searchParams.get('id')||url.searchParams.get('document')||body.document_id||qaId;
 if(url.pathname==='/api/tex/documents'){
  if(method==='PUT'){
   __qa.saves.push({...body,id:docId});if(__qa.delay)await new Promise(resolve=>__qa.releases.push(resolve));
   if(__qa.fail)return qaReply({error:'Simulated storage outage'},503);
   const updated={...__qa.documents.get(docId),...body,id:docId,storage_revision:'revision-'+(__qa.saves.length+1)};__qa.documents.set(docId,updated);return qaReply({document:updated});
  }
  return qaReply(url.searchParams.has('id')?{document:__qa.documents.get(docId)}:{documents:[...__qa.documents.values()]});
 }
 if(url.pathname==='/api/tex/files'){
  if(method==='POST'&&body.operation==='replace'){
   __qa.fileSaves.push(body);if(__qa.delay)await new Promise(resolve=>__qa.releases.push(resolve));
   if(__qa.fail)return qaReply({error:'Simulated file outage'},503);
   const current=__qa.documents.get(docId),patch=body.files[0],updated={...current,files:current.files.map(file=>file.name===patch.name?{...file,content:patch.content}:file)};
   __qa.documents.set(docId,updated);return qaReply({document:updated,files:updated.files});
  }
  return qaReply({files:__qa.documents.get(docId)?.files||[],document:__qa.documents.get(docId)});
 }
 if(url.pathname==='/api/tex/collaboration/shared')return qaReply({documents:[],document:null});
 if(url.pathname==='/api/tex/collaboration')return qaReply({owner_id:qaOwner,user_id:qaOwner,document_id:docId,role:'owner',collaborators:[],members:[]});
 if(url.pathname==='/api/tex/status')return qaReply({compiler_available:false,source_limit:180000});
 if(url.pathname==='/api/tex/runs')return qaReply({runs:[]});
 if(url.pathname==='/api/tex/archive')return qaReply({configured:false,items:[]});
 if(url.pathname==='/api/tex/file-chat')return qaReply({user_id:qaOwner,owner_id:qaOwner,role:'owner',registered:false,last:null});
 if(url.pathname==='/api/tex/organize')return qaReply({pins:[],items:[]});
 if(url.pathname.includes('/account'))return qaReply({user:qaProfile,profile:qaProfile,appearance:{}});
 if(url.pathname.startsWith('/api/'))return qaReply({items:[],status:'offline',configured:false});
 return qaFetch(input,init);
};
const qaQuery=new Proxy(function(){},{get:(target,key)=>key==='then'?(resolve=>resolve({data:[],error:null})):()=>qaQuery,apply:()=>qaQuery});
const qaSession={user:qaProfile,access_token:'audit-local-only',refresh_token:'audit-local-only'};
window.supabase={createClient:()=>({from:()=>qaQuery,rpc:async()=>({data:false,error:null}),channel:()=>qaQuery,removeChannel(){},auth:{getSession:async()=>({data:{session:qaSession},error:null}),getUser:async()=>({data:{user:qaProfile},error:null}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),signOut:async()=>({error:null})}})};
window.alert=text=>__qa.alerts.push(text);window.confirm=()=>false;
// Deliberately offline realtime transport: the full offline editor must work.
window.WebSocket=class extends EventTarget{static OPEN=1;static CONNECTING=0;constructor(){super();this.readyState=0;setTimeout(()=>{this.readyState=3;this.dispatchEvent(new Event('error'));this.dispatchEvent(new CloseEvent('close',{code:1006}));},60);}send(){}close(){this.readyState=3;}};
</script>`;
markup=markup.replace(/<script\b[^>]*\bsrc=["'][^"']+["'][^>]*>[\s\S]*?<\/script>/g,'').replace('<head>','<head>'+setup);
const artifacts=process.env.AERTEX_WORK_QA_DIR||'/tmp/aertex-workbench-visual';mkdirSync(artifacts,{recursive:true});
writeFileSync(path.join(artifacts,'rendered-workbench.html'),markup);
const server=createServer((req,res)=>{
 const pathname=new URL(req.url,'http://127.0.0.1').pathname;
 if(pathname.startsWith('/assets/tex/')){
  const filename=path.basename(pathname),file=path.resolve('tex-vendor/dist/assets/tex',filename);
  if(/^[a-z0-9-]+\.js$/.test(filename)&&existsSync(file)){res.writeHead(200,{'content-type':'application/javascript'});res.end(readFileSync(file));return;}
 }
 if(pathname.startsWith('/assets/')||pathname.startsWith('/favicon')){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'content-type':'text/html;charset=utf-8','cache-control':'no-store'});res.end(markup);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
let browser;
try{
 browser=await openBrowser('about:blank');
 const results=[];
 for(const [width,height,mobile]of[[320,740,true],[390,844,true],[768,1024,true],[1024,768,false],[1440,900,false],[1920,1080,false]]){
  await browser.command('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile});
  await browser.command('Emulation.setTouchEmulationEnabled',{enabled:mobile,maxTouchPoints:mobile?5:1});
  await browser.command('Page.navigate',{url:origin+'/en-us/d/'+id});
  await browser.wait(`document.getElementById('tex-source')?.value.includes('Audit source') && window.__aertexFileGetContext?.()?.document?.id===${JSON.stringify(id)}`,15000);
  await browser.wait(`!document.documentElement.hasAttribute('data-aertex-tex-boot')`,6500);
  await sleep(150);
  for(const theme of ['light','dark']){
   await browser.evaluate(`document.documentElement.dataset.theme='${theme}';document.body.dataset.theme='${theme}';`);await sleep(120);
   const report=await browser.evaluate(`(()=>{const rect=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom,display:getComputedStyle(e).display};};return{width:innerWidth,height:innerHeight,scroll:document.documentElement.scrollWidth,editor:rect('#tex-editor'),toolbar:rect('.tex-source-label'),commandbar:rect('.tex-editor-commandbar'),header:rect('.tex-editor-toolbar'),controls:['#tex-title-static','#tex-editor-mode','#tex-engine','#tex-collaboration-open','#tex-code-theme-toggle','.tex-editor-toolbar>.tex-panel-home-link'].map(selector=>({selector,...rect(selector)})),errors:__qaErrors,mask:document.documentElement.dataset.aertexTexBoot};})()`);
   results.push({width,height,mobile,theme,...report});
   await browser.screenshot(path.join(artifacts,`workbench-${width}-${theme}.png`));
   assert(report.editor?.width>100&&report.editor?.height>80,'Editor unavailable at '+width+': '+JSON.stringify(report));
   assert(report.scroll<=report.width+2,'Horizontal document overflow: '+JSON.stringify(report));
   assert(report.editor.x>=-1&&report.editor.right<=report.width+2,'Editor escaped viewport: '+JSON.stringify(report));
   assert.equal(report.mask,undefined,'First-paint mask did not release');
   for(const control of report.controls){
    // The home control is intentionally a compact 33x28 icon on mobile.
    // Check its actual target size rather than imposing a select's width.
    const compactHome=control.selector==='.tex-editor-toolbar>.tex-panel-home-link';
    assert(control.width>=(compactHome?24:36)&&control.height>=(compactHome?24:13),'Missing or collapsed header control: '+JSON.stringify(control));
    assert(control.x>=report.editor.x-1&&control.right<=report.editor.right+1,'Header control outside editor pane: '+JSON.stringify({control,editor:report.editor}));
    assert(control.y>=report.header.y-1&&control.bottom<=report.header.bottom+1,'Header control vertically clipped: '+JSON.stringify(control));
   }
   for(let i=0;i<report.controls.length;i++)for(let j=i+1;j<report.controls.length;j++){
    const a=report.controls[i],b=report.controls[j];
    const x=Math.min(a.right,b.right)-Math.max(a.x,b.x),y=Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y);
    assert(!(x>1&&y>1),'Overlapping editor controls: '+JSON.stringify([a,b]));
   }

  }
 }
 // Exercise the supplementary file editor while its network save is held.
 await browser.evaluate(`window.__aertexFileOpenText('chapters/intro.tex');`);
 await browser.wait(`document.getElementById('tex-file-text-editor').open`,3000);
 await browser.evaluate(`document.getElementById('tex-file-edit-content').value='File edit one';__qa.delay=true;document.getElementById('tex-file-edit-save').click();`);
 await browser.wait('__qa.fileSaves.length===1',5000);
 assert.match(await browser.evaluate('__qa.fileSaves[0].files[0].expected_sha256'),/^[a-f0-9]{64}$/);
 await browser.evaluate(`document.getElementById('tex-file-edit-content').value='Typed during file save';__qa.delay=false;__qa.releases.splice(0).forEach(fn=>fn());`);
 await browser.wait(`!document.getElementById('tex-file-edit-save').disabled`,4000);
 assert.equal(await browser.evaluate(`document.getElementById('tex-file-text-editor').open`),true);
 assert.equal(await browser.evaluate(`document.getElementById('tex-file-edit-content').value`),'Typed during file save');
 await browser.evaluate(`window.__aertexFileOpenText('data/table.csv');`);
 assert.equal(await browser.evaluate(`document.getElementById('tex-file-edit-content').value`),'Typed during file save','Cancelled replacement must keep the previous file draft');
 await browser.evaluate(`document.getElementById('tex-file-edit-save').click();`);
 await browser.wait(`!document.getElementById('tex-file-text-editor').open`,4000);
 assert.equal(await browser.evaluate(`__qa.documents.get(${JSON.stringify(id)}).files.find(f=>f.name==='chapters/intro.tex').content`),'Typed during file save');
 // Exercise real save queue and UI, while the mocked network request is held.
 await browser.evaluate(`__qa.delay=true;var s=document.getElementById('tex-source');s.value='First pending save';s.dispatchEvent(new Event('input',{bubbles:true}));window.__qaFlush=window.__aertexFlushTexSave?.();`);
 await browser.wait('__qa.saves.length>=1',6000);
 await browser.evaluate(`var s=document.getElementById('tex-source');s.value='Typed during request';s.dispatchEvent(new Event('input',{bubbles:true}));__qa.delay=false;__qa.releases.splice(0).forEach(fn=>fn());`);
 await browser.wait(`__qa.documents.get(${JSON.stringify(id)})?.source==='Typed during request'`,6000);
 assert.equal(await browser.evaluate(`document.getElementById('tex-source').value`),'Typed during request');
 await browser.evaluate(`__qa.fail=true;var s=document.getElementById('tex-source');s.value='Unsaved after outage';s.dispatchEvent(new Event('input',{bubbles:true}));window.__qaFailedSave=window.__aertexFlushTexSave?.();`);
 await browser.wait(`document.getElementById('tex-save-state')?.textContent.includes('outage')`,6000);
 assert.equal(await browser.evaluate(`document.getElementById('tex-source').value`),'Unsaved after outage');
 assert.equal(await browser.evaluate(`(()=>{const e=new Event('beforeunload',{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented;})()`),true,'Unsaved changes must retain navigation warning');
 const errors=await browser.evaluate('__qaErrors');writeFileSync(path.join(artifacts,'results.json'),JSON.stringify({results,errors,exceptions:browser.exceptions},null,2));
 assert.deepEqual(errors,[],'Uncaught runtime errors in the rendered Work application');
 console.log('PASS: full production Work markup, six viewport/touch modes and non-overlapping header controls, light/dark themes, main/file edit-during-save, cancelled file switch and failed-save preservation');
}catch(error){
 if(browser){
  await browser.screenshot(path.join(artifacts,'failure.png')).catch(()=>{});
  const diagnostics=await browser.evaluate(`({errors:window.__qaErrors,ready:document.readyState,mask:document.documentElement.dataset.aertexTexBoot,body:document.body?.innerText.slice(0,9000)})`).catch(()=>({}));
  writeFileSync(path.join(artifacts,'failure.json'),JSON.stringify({error:String(error?.stack||error),diagnostics,exceptions:browser.exceptions},null,2));
 }
 throw error;
}finally{await browser?.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
