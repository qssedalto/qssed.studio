import assert from 'node:assert/strict';
import { MemoryR2 } from './helpers/memory-r2.mjs';
import { Doc, applyUpdate, encodeStateAsUpdate } from '../tex-vendor/server-yjs.mjs';
import { handleRoomSaveValidation, validateTexSourceSave } from '../studio/tex-collaboration-save.js';
const owner='11111111-1111-4111-8111-111111111111', id='22222222-2222-4222-8222-222222222222';
const key=`_system/tex-documents/${owner}/${id}.json`;
const initial={id,owner_id:owner,source:'A',title:'Contract',engine:'xelatex',realtime_epoch:'v2'};
const storage=new MemoryR2(), environment={STORAGE:storage};
let revision=storage.seed(key,initial);
const records=new Map(), broadcasts=[];
const state={storage:{
  get:async k=>structuredClone(records.get(k)),
  put:async(k,v)=>{for(const [a,b] of typeof k==='object'?Object.entries(k):[[k,v]])records.set(a,structuredClone(b));},
  list:async({prefix='',limit=Infinity})=>new Map([...records].filter(([k])=>k.startsWith(prefix)).sort().slice(0,limit)),
  delete:async keys=>{for(const k of Array.isArray(keys)?keys:[keys])records.delete(k);}
},blockConcurrencyWhile:fn=>fn()};
const b64=doc=>Buffer.from(encodeStateAsUpdate(doc)).toString('base64');
const seed=new Doc();seed.getText('source').insert(0,'A');seed.getMap('meta').set('title','Contract');seed.getMap('meta').set('engine','xelatex');
records.set('snapshot',{data:b64(seed),through_sequence:0});records.set('sequence',0);
const a=new Doc(),b=new Doc();applyUpdate(a,encodeStateAsUpdate(seed));applyUpdate(b,encodeStateAsUpdate(seed));
const verify=(candidate,clientRevision=revision,doc,extra={})=>handleRoomSaveValidation(new Request('https://internal/validate-save',{method:'POST',body:JSON.stringify({
  owner_id:owner,document_id:id,epoch:'v2',previous_revision:storage.records.get(key).etag,client_revision:clientRevision,
  candidate:{source:candidate,title:'Contract',engine:'xelatex'},update:doc?b64(doc):null,...extra
})}),state,environment,value=>broadcasts.push(value));
a.getText('source').insert(1,'X');
let response=await verify('AX',revision,a);assert.equal(response.status,200);
assert.equal(broadcasts.length,1,'An unacknowledged browser update must be committed and broadcast, not lost');
assert.equal(records.get('save_contract'),2);
const oldRevision=revision;revision=storage.seed(key,{...initial,source:'AX'});
const before=structuredClone([...records]);
b.getText('source').insert(1,'B');response=await verify('AB',oldRevision,b);
assert.equal(response.status,409,'Stale tab without the other edit must never overwrite it');
assert.deepEqual([...records],before,'Rejecting an incomplete client snapshot must not mutate the canonical room');
response=await verify('A',oldRevision);assert.equal(response.status,409);
applyUpdate(b,encodeStateAsUpdate(a));
const merged=b.getText('source').toString();
response=await verify(merged,oldRevision,b);assert.equal(response.status,200,'A fully merged peer may save with an old R2 ETag');
const recovered=new Doc();applyUpdate(recovered,Buffer.from(records.get('snapshot').data,'base64'));
assert.equal(recovered.getText('source').toString(),merged);
assert(merged.includes('X')&&merged.includes('B'));
response=await verify(merged,oldRevision,undefined,{update:'AA=='});assert.equal(response.status,409);
response=await verify(merged,oldRevision,b,{previous_revision:'stale-server-read'});assert.equal(response.status,409);
storage.seed(key,{...initial,source:merged,locked:true});response=await verify(merged,oldRevision,b);assert.equal(response.status,423);
const standalone={STORAGE:new MemoryR2()};const previous={...initial,storage_revision:'base'};
await assert.rejects(validateTexSourceSave(standalone,previous,{storage_revision:'older'}, {...initial,source:'bad'}),e=>e.status===409);
await assert.rejects(validateTexSourceSave(standalone,previous,{}, {...initial}),e=>e.status===428);
const next={...initial,source:'new'};const plan=await validateTexSourceSave(standalone,previous,{storage_revision:'base'},next);
assert.equal(plan.rebase,true);assert.notEqual(next.realtime_epoch,'v2');
for(const doc of [seed,a,b,recovered])doc.destroy();
console.log('PASS: sequential stale-tab overwrite blocked, acknowledged/unacknowledged CRDT merge, immutable rejection, locks, mandatory client revisions, plain-text rebase');
