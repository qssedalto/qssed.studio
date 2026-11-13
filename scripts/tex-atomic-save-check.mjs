import assert from 'node:assert/strict';
import { MemoryR2 } from './helpers/memory-r2.mjs';
import { commitTexSourceSave, handleRoomSaveValidation } from '../studio/tex-collaboration-save.js';
import { activeTexRoomSource, createTexSourceSnapshot } from '../studio/tex-collaboration-connect.js';
import { handleNativeWorkDocuments } from '../studio/native-work-documents.js';
import { Doc, applyUpdate, encodeStateAsUpdate } from '../tex-vendor/server-yjs.mjs';
const owner='11111111-1111-4111-8111-111111111111',id='22222222-2222-4222-8222-222222222222';
const key=`_system/tex-documents/${owner}/${id}.json`;
const base={id,owner_id:owner,source:'A',title:'Atomic',engine:'xelatex',realtime_epoch:'v2',
 main_filename:'main.tex',files:[{name:'data.csv',content:'1,2',encoding:'utf8'}],pinned:true,
 created_at:'2026-01-01T00:00:00Z',updated_at:'2026-01-01T00:00:00Z'};
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
const b64=doc=>Buffer.from(encodeStateAsUpdate(doc)).toString('base64');
function fixture(){
 const storage=new MemoryR2(),records=new Map(),broadcasts=[],requests=[];
 const revision=storage.seed(key,base,{ownerId:owner,kind:'tex-document',realtimeEpoch:'v2',mainLocked:'false'});
 records.set('snapshot',createTexSourceSnapshot(base));records.set('sequence',0);records.set('save_contract',2);
 let tail=Promise.resolve(),inside=false;
 const state={storage:{get:async k=>structuredClone(records.get(k)),
  put:async(k,v)=>{for(const [a,b]of typeof k==='object'?Object.entries(k):[[k,v]])records.set(a,structuredClone(b));},
  list:async({prefix='',limit=Infinity})=>new Map([...records].filter(([k])=>k.startsWith(prefix)).sort().slice(0,limit)),
  delete:async keys=>{for(const k of Array.isArray(keys)?keys:[keys])records.delete(k);}},
  blockConcurrencyWhile(fn){const result=tail.then(async()=>{inside=true;try{return await fn();}finally{inside=false;}});tail=result.catch(()=>{});return result;}};
 const env={STORAGE:storage,TEX_COLLAB_ROOMS:{idFromName:name=>name,get:()=>({fetch:async request=>{
  const path=new URL(request.url).pathname;requests.push(path);
  if(path==='/source-rebased')return new Response(null,{status:204});
  return handleRoomSaveValidation(request,state,env,value=>broadcasts.push(value));
 }})}};
 const previous={...structuredClone(base),storage_revision:revision};
 const save=(source,extra={})=>{const document={...structuredClone(base),source};return commitTexSourceSave(env,previous,{storage_revision:revision,...extra},document).then(plan=>({plan,document}));};
 const client=()=>{const doc=new Doc();applyUpdate(doc,Buffer.from(records.get('snapshot').data,'base64'));return doc;};
 return{storage,records,env,state,previous,revision,save,client,inside:()=>inside,requests,broadcasts};
}
// Hold R2 itself, then queue an old-room websocket event. It must not execute
// inside the validation/publication gap, and must be rejected after the rebase.
{
 const f=fixture(),entered=deferred(),release=deferred();let peerRan=false;
 f.storage.beforePut=async k=>{if(k!==key)return;assert(f.inside());entered.resolve();await release.promise;};
 const saving=f.save('Offline replacement');await entered.promise;
 const peer=f.state.blockConcurrencyWhile(async()=>{peerRan=true;return activeTexRoomSource(f.env,{owner_id:owner,document_id:id,epoch:'v2'});});
 await Promise.resolve();await Promise.resolve();assert.equal(peerRan,false,'Live updates must remain queued until R2 commit finishes');
 release.resolve();const {document,plan}=await saving;
 assert.equal(await peer,false,'An old-room edit must not be acknowledged after its source was rebased');
 assert.equal(plan.committed,true);assert.notEqual(document.realtime_epoch,'v2');
 assert.equal(f.storage.document(key).source,'Offline replacement');assert.deepEqual(f.storage.document(key).files,base.files);
 assert.equal(f.storage.document(key).pinned,true);assert.equal(f.storage.records.get(key).customMetadata.realtimeEpoch,document.realtime_epoch);
 assert.equal(document.storage_revision,f.storage.records.get(key).etag);assert(!Object.hasOwn(f.storage.document(key),'storage_revision'));
 assert.deepEqual(f.requests,['/commit-save','/source-rebased']);
}
// The inverse ordering is also safe: already acknowledged live text wins over
// a full-text native/offline replacement even when the R2 ETag has not changed.
{
 const f=fixture(),live=f.client();live.getText('source').insert(1,' live');
 f.records.set('snapshot',{data:b64(live),through_sequence:1});f.records.set('sequence',1);
 await assert.rejects(f.save('Offline replacement'),error=>error.status===409);
 assert.equal(f.storage.document(key).source,'A');assert.equal(f.records.get('snapshot').data,b64(live));live.destroy();
}
// A current, fully merged CRDT save is accepted without retiring its room.
{
 const f=fixture(),live=f.client();live.getText('source').insert(1,' merged');
 const {document}=await f.save('A merged',{collaboration_update:b64(live)});
 assert.equal(document.realtime_epoch,'v2');assert.equal(f.storage.document(key).source,'A merged');
 assert.equal(f.broadcasts.length,1);assert.deepEqual(f.requests,['/commit-save']);live.destroy();
}
// Other R2 mutators (file uploads/locks) still have their independent CAS.
{
 const f=fixture();f.storage.beforePut=async k=>{if(k!==key)return;f.storage.beforePut=null;f.storage.seed(key,{...base,files:[...base.files,{name:'concurrent.tex',content:'New',encoding:'utf8'}]});};
 await assert.rejects(f.save('Cannot overwrite'),error=>error.status===409);
 assert.equal(f.storage.document(key).source,'A');assert.equal(f.storage.document(key).files.length,2);
}
// A missing/old DO implementation must fail closed, never fall back to an
// uncoordinated write after receiving an incomplete acknowledgement.
{
 const f=fixture();f.env.TEX_COLLAB_ROOMS.get=()=>({fetch:async()=>new Response(JSON.stringify({ok:true,rebase:false}))});
 await assert.rejects(f.save('Unsafe fallback'),error=>error.status===503);assert.equal(f.storage.writes.length,0);
}
{
 const f=fixture();f.storage.beforePut=async()=>{throw Error('Simulated R2 outage');};
 await assert.rejects(f.save('Retry later'),error=>error.status===503);assert.equal(f.storage.document(key).source,'A');
}
// Exercise the real native HTTP handler, not merely a shared helper.
{
 const realFetch=globalThis.fetch;globalThis.fetch=async url=>new Response(JSON.stringify(String(url).includes('/profiles?')?[{id:owner,status:'active'}]:{id:owner,email:'audit@example.invalid'}),{headers:{'content-type':'application/json'}});
 try{
  const f=fixture(),live=f.client();live.getText('source').insert(1,' online');f.records.set('snapshot',{data:b64(live),through_sequence:1});
  const response=await handleNativeWorkDocuments(new Request(`https://work.qsseda.com/api/native/work/documents?id=${id}`,{
   method:'PUT',headers:{Authorization:`Bearer ${owner}`,'If-Match':f.revision},body:JSON.stringify({...base,source:'Native overwrite'})}),f.env);
  assert.equal(response.status,409);assert.equal(f.storage.document(key).source,'A');assert.equal(f.records.get('snapshot').data,b64(live));live.destroy();
 }finally{globalThis.fetch=realFetch;}
}
console.log('PASS: atomic validation/publication, both live-edit orderings, native live-state conflicts, merged CRDT, attachment CAS and fail-closed outages');
