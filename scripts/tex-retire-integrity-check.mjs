import assert from 'node:assert/strict';
import { MemoryR2 } from './helpers/memory-r2.mjs';
import { attachVaultBinding } from './helpers/vault-binding.mjs';
import { handleTexArchive } from '../studio/tex-archive-api.js';
import { createTexSourceSnapshot, activeTexRoomSource } from '../studio/tex-collaboration-connect.js';
import { texRealtimeRoomName } from '../studio/tex-realtime-epoch.js';
import { Doc, applyUpdate, encodeStateAsUpdate, encodeStateVector } from '../tex-vendor/server-yjs.mjs';
const owner='11111111-1111-4111-8111-111111111111',id='22222222-2222-4222-8222-222222222222';
const key=`_system/tex-documents/${owner}/${id}.json`,archive=`_system/tex-archive/${owner}/${id}.json`;
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {resolve,promise};};
const original={id,owner_id:owner,title:'Retirement',engine:'xelatex',source:'Saved source',realtime_epoch:'v2',files:[]};
const salt=Buffer.alloc(16,1).toString('base64'),iv=Buffer.alloc(12,2).toString('base64'),data=Buffer.alloc(32,3).toString('base64');
function fixture(){
 const env={STORAGE:new MemoryR2()};attachVaultBinding(env);
 const revision=env.STORAGE.seed(key,original,{kind:'tex-document',ownerId:owner,realtimeEpoch:'v2',mainLocked:'false'});
 env.STORAGE.seed(`_system/tex-vault/${owner}/config.json`,{salt,iv,check:data,iterations:900000});
 const room=env.TEX_COLLAB_ROOMS.get(texRealtimeRoomName(owner,id,'v2'));
 room.storage.set('snapshot',createTexSourceSnapshot(original));room.storage.set('save_contract',2);
 const doc=new Doc();applyUpdate(doc,Buffer.from(room.storage.get('snapshot').data,'base64'));
 const setLive=()=>room.storage.set('snapshot',{data:Buffer.from(encodeStateAsUpdate(doc)).toString('base64'),through_sequence:1});
 const store=()=>handleTexArchive(new Request('https://work.qsseda.com/api/tex/archive?mode=store',{
  method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id,vault_salt:salt,storage_revision:revision,encrypted:{iv,data,titleIv:iv,titleData:data}})
 }),env,{id:owner});
 return {env,room,doc,setLive,store};
}
{
 const f=fixture();f.doc.getText('source').insert(0,'Acknowledged live edit: ');f.setLive();
 const response=await f.store();
 assert.equal(response.status,409,'An archive must not purge acknowledged edits missing from its encrypted R2 snapshot');
 assert.equal(f.env.STORAGE.document(key).source,original.source);
 assert(f.room.storage.has('snapshot'),'Live history must survive a rejected archive');
 assert(!f.env.STORAGE.records.has(archive),'A rejected archive must discard only its provisional ciphertext');
 f.doc.destroy();
}
{
 const f=fixture(),entered=deferred(),release=deferred();let peerRan=false;
 f.env.STORAGE.beforePut=async(k,body)=>{if(k===key&&JSON.parse(body).document_deleted){entered.resolve();await release.promise;}};
 const storing=f.store();await entered.promise;
 const peer=f.room.room.state.blockConcurrencyWhile(async()=>{peerRan=true;return activeTexRoomSource(f.env,{owner_id:owner,document_id:id,epoch:'v2'});});
 await Promise.resolve();await Promise.resolve();assert.equal(peerRan,false,'Archive must hold the same critical section as live updates');
 release.resolve();assert.equal((await storing).status,200);assert.equal(await peer,false,'Queued old-room updates must fail after retirement');
 assert(f.env.STORAGE.document(key).document_deleted);assert(f.env.STORAGE.records.has(archive));f.doc.destroy();
}
{
 const f=fixture();const updateDoc=new Doc();applyUpdate(updateDoc,encodeStateAsUpdate(f.doc));
 updateDoc.getText('source').insert(0,'Journal-only acknowledged edit: ');
 f.room.storage.set('u:0000000000000001',{data:Buffer.from(encodeStateAsUpdate(updateDoc)).toString('base64')});
 assert.equal((await f.store()).status,409,'Uncompacted journal edits must also prevent destructive retirement');
 assert(f.room.storage.has('u:0000000000000001'));updateDoc.destroy();f.doc.destroy();
}
{
 const f=fixture();f.room.storage.set('snapshot',{data:'INVALID SNAPSHOT'});
 assert.equal((await f.store()).status,503,'Unverifiable history must fail closed');
 assert.equal(f.env.STORAGE.document(key).source,original.source);f.doc.destroy();
}
{
 const f=fixture();f.doc.getText('source').insert(0,'first ');
 const afterFirst=encodeStateVector(f.doc);f.doc.getText('source').insert(6,'second ');
 const partial=encodeStateAsUpdate(f.doc,afterFirst);
 f.room.storage.set('u:0000000000000001',{data:Buffer.from(partial).toString('base64')});
 assert.equal((await f.store()).status,409,'Unresolved out-of-order live updates must block retirement even if visible source matches');
 assert(f.room.storage.has('u:0000000000000001'));assert.equal(f.env.STORAGE.document(key).source,original.source);f.doc.destroy();
}
console.log('PASS: live/snapshot/journal archive protection, atomic retirement versus queued live updates, malformed-history fail closed');
