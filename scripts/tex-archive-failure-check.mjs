import assert from 'node:assert/strict';
import { MemoryR2 } from './helpers/memory-r2.mjs';
import { attachVaultBinding } from './helpers/vault-binding.mjs';
import { handleTexArchive } from '../studio/tex-archive-api.js';
import { registerTexRoomEpoch } from '../studio/tex-collaboration-history.js';
import { texRealtimeRoomName } from '../studio/tex-realtime-epoch.js';
const owner='11111111-1111-4111-8111-111111111111',id='22222222-2222-4222-8222-222222222222';
const oldEpoch='33333333-3333-4333-8333-333333333333';
const user={id:owner,email:'audit@example.invalid'};
const docKey=`_system/tex-documents/${owner}/${id}.json`,archiveKey=`_system/tex-archive/${owner}/${id}.json`,configKey=`_system/tex-vault/${owner}/config.json`;
const salt=Buffer.alloc(16,1).toString('base64'),iv=Buffer.alloc(12,2).toString('base64'),data=Buffer.alloc(32,3).toString('base64');
const original={id,owner_id:owner,title:'Recovery',engine:'xelatex',source:'KEEP MY SOURCE',realtime_epoch:'v2',files:[]};
const encrypted={iv,data,titleIv:iv,titleData:data};
function fixture(){
 const env={STORAGE:new MemoryR2()};const rooms=attachVaultBinding(env);
 env.STORAGE.seed(docKey,original,{kind:'tex-document',ownerId:owner,realtimeEpoch:'v2',mainLocked:'false'});
 env.STORAGE.seed(configKey,{salt,iv,check:data,iterations:900000});
 return {env,rooms};
}
const call=async(env,mode,body,method='POST')=>{
 const response=await handleTexArchive(new Request('https://work.qsseda.com/api/tex/archive?mode='+mode,{method,headers:{'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})}),env,user);
 return {status:response.status,data:await response.json()};
};
const input=env=>({id,vault_salt:salt,storage_revision:env.STORAGE.records.get(docKey).etag,encrypted});
let tests=0;
async function check(name,fn){await fn();tests++;console.log('PASS '+name);}
await check('CAS conflict cannot delete the concurrent plaintext version',async()=>{
 const {env}=fixture();env.STORAGE.beforePut=async(key,body)=>{
  if(key!==docKey||!JSON.parse(body).document_deleted)return;env.STORAGE.beforePut=null;
  env.STORAGE.seed(docKey,{...original,source:'NEWER SOURCE'});
 };
 const result=await call(env,'store',input(env));assert.equal(result.status,409);
 assert.equal(env.STORAGE.document(docKey).source,'NEWER SOURCE');assert(!env.STORAGE.records.has(archiveKey));
});
await check('unknown post-commit failure retains encrypted recovery and permits cleanup retry',async()=>{
 const {env}=fixture(),put=env.STORAGE.put.bind(env.STORAGE);let interrupted=false;
 env.STORAGE.put=async(key,body,options)=>{const result=await put(key,body,options);if(key===docKey&&JSON.parse(body).document_deleted&&!interrupted){interrupted=true;throw Error('simulated acknowledgement loss');}return result;};
 const result=await call(env,'store',input(env));assert.equal(result.status,503);
 assert(env.STORAGE.document(docKey).document_deleted);assert(env.STORAGE.records.has(archiveKey));
 const completed=await call(env,'cleanup',{id,vault_salt:salt});assert.equal(completed.status,200);
 assert.equal(env.STORAGE.document(archiveKey).cleanup_complete,true);
});
await check('ciphertext upload failure leaves the original untouched',async()=>{
 const {env}=fixture();env.STORAGE.beforePut=async key=>{if(key===archiveKey)throw Error('storage outage');};
 const result=await call(env,'store',input(env));assert.equal(result.status,503);
 assert.equal(env.STORAGE.document(docKey).source,original.source);assert(!env.STORAGE.records.has(archiveKey));
});
await check('unavailable history cleanup is never reported as completed',async()=>{
 const {env}=fixture(),get=env.TEX_COLLAB_ROOMS.get;let outage=true;
 env.TEX_COLLAB_ROOMS.get=name=>outage&&!name.startsWith('tex-vault:')?{fetch:async()=>new Response('offline',{status:503})}:get(name);
 const result=await call(env,'store',input(env));assert.equal(result.status,503);
 assert(env.STORAGE.records.has(archiveKey));assert(env.STORAGE.document(docKey).document_deleted);
 const list=await call(env,'list',null,'GET');assert.equal(list.data.items[0].cleanup_pending,true);
 outage=false;assert.equal((await call(env,'cleanup',{id,vault_salt:salt})).status,200);
 assert.equal((await call(env,'list',null,'GET')).data.items[0].cleanup_pending,false);
});
await check('registered prior source generations and known legacy rooms are purged',async()=>{
 const {env}=fixture();await registerTexRoomEpoch(env,owner,id,oldEpoch);
 const names=[owner+':'+id,texRealtimeRoomName(owner,id,'v2'),texRealtimeRoomName(owner,id,oldEpoch)];
 for(const name of names)env.TEX_COLLAB_ROOMS.get(name).storage.set('snapshot',{data:'PLAINTEXT HISTORY'});
 env.STORAGE.seed(`_system/tex-versions/${owner}/${id}/version.json`,{source:'OLD SOURCE'});
 const result=await call(env,'store',input(env));assert.equal(result.status,200,JSON.stringify(result));
 for(const name of names){const stored=env.TEX_COLLAB_ROOMS.get(name).storage;assert.equal(stored.has('snapshot'),false);assert.equal(stored.get('retired'),true);}
 assert(![...env.STORAGE.records.keys()].some(key=>key.startsWith(`_system/tex-room-epochs/${owner}/${id}/`)));
 assert(![...env.STORAGE.records.keys()].some(key=>key.startsWith(`_system/tex-versions/${owner}/${id}/`)));
});
await check('reset and store serialize and reject the old encryption configuration',async()=>{
 const {env}=fixture();let entered,release;const started=new Promise(resolve=>entered=resolve),waiting=new Promise(resolve=>release=resolve);
 const realFetch=globalThis.fetch;
 globalThis.fetch=async()=>{entered();await waiting;return new Response(JSON.stringify({user,access_token:'audit-session'}),{headers:{'content-type':'application/json'}});};
 try{
  const before=input(env),reset=call(env,'reset',{account_password:'password-for-test-only'});await started;
  const queued=call(env,'store',before);release();
  assert.equal((await reset).status,200);assert.equal((await queued).status,409);
  assert.equal(env.STORAGE.document(docKey).source,original.source);assert(!env.STORAGE.records.has(configKey));
 }finally{globalThis.fetch=realFetch;}
});
await check('auth outage is not counted as a wrong archive-reset password',async()=>{
 const {env}=fixture(),realFetch=globalThis.fetch;globalThis.fetch=async()=>new Response('unavailable',{status:503});
 try{assert.equal((await call(env,'reset',{account_password:'correct-but-service-down'})).status,503);assert.equal(env.STORAGE.document(configKey).failedCount,undefined);}
 finally{globalThis.fetch=realFetch;}
});
await check('restore rejects a live destination and malformed files without losing ciphertext',async()=>{
 const {env}=fixture();assert.equal((await call(env,'store',input(env))).status,200);
 const bad={...original,files:[{name:'../secret',encoding:'utf8',content:'x'}]};
 assert.equal((await call(env,'restore',{id,vault_salt:salt,document:bad})).status,400);assert(env.STORAGE.records.has(archiveKey));
 env.STORAGE.seed(docKey,{...original,source:'EXISTING RESTORED SOURCE'});
 assert.equal((await call(env,'restore',{id,vault_salt:salt,document:original})).status,409);
 assert.equal(env.STORAGE.document(docKey).source,'EXISTING RESTORED SOURCE');assert(env.STORAGE.records.has(archiveKey));
});
await check('legacy archive cleanup is retryable but never touches a live project',async()=>{
 const {env}=fixture();env.STORAGE.seed(archiveKey,{v:1,id,encrypted});await env.STORAGE.delete(docKey);
 assert.equal((await call(env,'cleanup',{id,vault_salt:salt})).status,200);
 env.STORAGE.seed(docKey,original);assert.equal((await call(env,'cleanup',{id,vault_salt:salt})).status,409);
 assert.equal(env.STORAGE.document(docKey).source,original.source);
});
console.log('Archive failure/concurrency groups passed: '+tests);
