import assert from 'node:assert/strict';
import * as Y from '../tex-vendor/node_modules/yjs/dist/yjs.mjs';
import { prepareTexConnection, activeTexRoomSource } from '../studio/tex-collaboration-connect.js';
import { MemoryR2 } from './helpers/memory-r2.mjs';
const owner='11111111-1111-4111-8111-111111111111',document='22222222-2222-4222-8222-222222222222';
const user='33333333-3333-4333-8333-333333333333',epoch='44444444-4444-4444-8444-444444444444';
const key=`_system/tex-documents/${owner}/${document}.json`,identity={owner,document,user,role:'editor'};
function fixture(metadata={realtimeEpoch:epoch,mainLocked:'false'}){
 const map=new Map(),storage={get:async key=>map.get(key),put:async(key,value)=>{for(const [k,v]of typeof key==='object'?Object.entries(key):[[key,value]])map.set(k,v);}};
 const env={STORAGE:new MemoryR2()};env.STORAGE.seed(key,{id:document,owner_id:owner,source:'AUTHORITATIVE',title:'Draft',engine:'xelatex',realtime_epoch:epoch},metadata);
 return {env,state:{storage},map};
}
function request(checked=Date.now(),viaLink=false,version=epoch){return new Request('https://internal/connect',{headers:{'X-Qsseda-Collab-Checked-At':String(checked),'X-Qsseda-Collab-Epoch':version,'X-Qsseda-Collab-Link-Grant':viaLink?'1':'0'}});}
let total=0;async function check(name,fn){await fn();total++;console.log('PASS '+name);}
await check('first connection seeds authoritative R2 source and registers its epoch',async()=>{
 const f=fixture(),result=await prepareTexConnection(f.state,f.env,request(),identity);assert.equal(result.role,'editor');assert.equal(result.response,undefined);
 const ydoc=new Y.Doc();Y.applyUpdate(ydoc,Uint8Array.from(Buffer.from(f.map.get('snapshot').data,'base64')));
 assert.equal(ydoc.getText('source').toString(),'AUTHORITATIVE');assert.equal(ydoc.getMap('meta').get('title'),'Draft');ydoc.destroy();
 assert([...f.env.STORAGE.records.keys()].some(k=>k.includes('/tex-room-epochs/')));
});
await check('delayed member and link handshakes cannot cross revocation',async()=>{
 for(const viaLink of [false,true]){const f=fixture(),now=Date.now();f.map.set(viaLink?'revoked:links':'revoked:member:'+user,now);
  assert.equal((await prepareTexConnection(f.state,f.env,request(now-1,viaLink),identity)).response.status,403);
  assert.equal((await prepareTexConnection(f.state,f.env,request(now+1,viaLink),identity)).response,undefined);
 }
});
await check('missing, future, expired and retired authorization is rejected',async()=>{
 for(const checked of [0,Date.now()-31000,Date.now()+6000]){const f=fixture();assert.equal((await prepareTexConnection(f.state,f.env,request(checked),identity)).response.status,403);}
 const f=fixture();f.map.set('retired',true);assert.equal((await prepareTexConnection(f.state,f.env,request(),identity)).response.status,403);
});
await check('deleted source and stale room epoch cannot accept old connections',async()=>{
 const f=fixture();assert.equal((await prepareTexConnection(f.state,f.env,request(Date.now(),false,'v2'),identity)).response.status,409);
 f.env.STORAGE.seed(key,{document_deleted:true},{kind:'tex-document-tombstone',realtimeEpoch:epoch});
 assert.equal((await prepareTexConnection(f.state,f.env,request(),identity)).response.status,409);
});
await check('metadata and legacy body locks downgrade to viewer and prevent writes',async()=>{
 for(const legacy of [false,true]){const f=fixture(legacy?{realtimeEpoch:epoch}:{realtimeEpoch:epoch,mainLocked:'true'});
  if(legacy)f.env.STORAGE.seed(key,{id:document,owner_id:owner,source:'LOCKED',title:'Draft',engine:'xelatex',realtime_epoch:epoch,locked_files:['main.tex']},{realtimeEpoch:epoch});
  const result=await prepareTexConnection(f.state,f.env,request(),identity);assert.equal(result.role,'viewer');
  assert.equal(await activeTexRoomSource(f.env,{owner_id:owner,document_id:document,epoch}),false);
 }
});
await check('source changing between HEAD and GET is rejected without stale seed',async()=>{
 const f=fixture(),get=f.env.STORAGE.get.bind(f.env.STORAGE);let changed=false;
 f.env.STORAGE.head=async()=>({etag:'old',customMetadata:{realtimeEpoch:epoch,mainLocked:'false'}});
 f.env.STORAGE.get=async target=>{if(target===key&&!changed){changed=true;f.env.STORAGE.seed(key,{id:document,owner_id:owner,source:'NEW',title:'Draft',engine:'xelatex',realtime_epoch:'v2'});}return get(target);};
 assert.equal((await prepareTexConnection(f.state,f.env,request(),identity)).response.status,409);assert.equal(f.map.has('snapshot'),false);
});
console.log('Connection authorization groups passed: '+total);
