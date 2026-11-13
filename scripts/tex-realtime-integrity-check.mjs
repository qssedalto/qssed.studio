import { MemoryR2 } from "./helpers/memory-r2.mjs";
import assert from 'node:assert/strict';
import * as Y from '../tex-vendor/node_modules/yjs/dist/yjs.mjs';
import { TexCollaborationRoom } from '../studio/tex-collaboration-room.js';
import { invalidateTexCollaboration } from '../studio/tex-collaboration-invalidate.js';
import { texRealtimeRoomName } from '../studio/tex-realtime-epoch.js';
const owner='11111111-1111-4111-8111-111111111111',document='22222222-2222-4222-8222-222222222222';
const member='33333333-3333-4333-8333-333333333333',epoch='44444444-4444-4444-8444-444444444444';
const b64=bytes=>Buffer.from(bytes).toString('base64');
const bytes=s=>Uint8Array.from(Buffer.from(s,'base64'));
class Store {
  constructor(){this.map=new Map();}
  async get(k){return structuredClone(this.map.get(k));}
  async put(k,v){for(const [key,val] of typeof k==='object'?Object.entries(k):[[k,v]])this.map.set(key,structuredClone(val));}
  async list({prefix=''}){return new Map([...this.map].filter(([key])=>key.startsWith(prefix)).sort(([a],[b])=>a.localeCompare(b)));}
  async deleteAll(){this.map.clear();}
  async delete(keys){for(const key of Array.isArray(keys)?keys:[keys])this.map.delete(key);}
}
const socket=(id=member,role='editor',link_grant=false)=>({
  p:{id,role,link_grant,owner_id:owner,document_id:document,expires_at:Date.now()+90000},sent:[],closed:[],
  deserializeAttachment(){return structuredClone(this.p);},serializeAttachment(p){this.p=structuredClone(p);},
  send(text){this.sent.push(JSON.parse(text));},close(...args){this.closed.push(args);}
});
const storage=new Store(),peer=socket(),other=socket(owner,'owner'),state={storage,getWebSockets:()=>[peer,other],blockConcurrencyWhile:fn=>fn()};
const r2=new MemoryR2();r2.seed(`_system/tex-documents/${owner}/${document}.json`,{id:document,owner_id:owner,source:'abc',title:'Test',engine:'xelatex',realtime_epoch:'v2'}, {realtimeEpoch:'v2',mainLocked:'false'});
const room=new TexCollaborationRoom(state,{STORAGE:r2});
const send=(p,s=peer)=>room.webSocketMessage(s,JSON.stringify(p));
const seed=new Y.Doc();seed.getText('source').insert(0,'abc');
const submitted=b64(Y.encodeStateAsUpdate(seed));
await send({type:'initialize',data:submitted});
const initial=(await storage.get('snapshot')).data;
const authoritative=new Y.Doc();Y.applyUpdate(authoritative,bytes(initial));
assert.equal(authoritative.getText('source').toString(),'abc');
const a=new Y.Doc(),b=new Y.Doc();Y.applyUpdate(a,bytes(initial));Y.applyUpdate(b,bytes(initial));
let update;
a.on('update',u=>update=b64(u));a.getText('source').insert(1,'X');
await send({type:'update',data:update});
assert.equal(await storage.get('sequence'),1);
// B did not receive A's insertion but falsely claims it has seen sequence 1.
await send({type:'snapshot',data:b64(Y.encodeStateAsUpdate(b)),through_sequence:1});
let stored=await storage.get('snapshot'),recovered=new Y.Doc();Y.applyUpdate(recovered,bytes(stored.data));
assert.equal(recovered.getText('source').toString(),'aXbc');
assert.equal(stored.through_sequence,1);assert.equal((await storage.list({prefix:'u:'})).size,0);
// A deletion changes the delete set, not the client's struct state vector.
a.getText('source').delete(2,1);await send({type:'update',data:update});
await send({type:'snapshot',data:initial,through_sequence:2});
recovered=new Y.Doc();Y.applyUpdate(recovered,bytes((await storage.get('snapshot')).data));
assert.equal(recovered.getText('source').toString(),'aXc','Stale snapshot must not resurrect deletions');
const previous=structuredClone([...storage.map]);
await send({type:'update',data:'AA=='});
assert.deepEqual([...storage.map],previous,'Malformed binary must not poison the server journal');
assert(peer.sent.some(p=>p.code==='invalid_update'));
await send({type:'snapshot',data:initial,through_sequence:2.5});
assert.deepEqual([...storage.map],previous,'Fractional snapshot sequence must not be accepted');
const viewer=socket('viewer','viewer');await send({type:'update',data:initial},viewer);
assert(viewer.sent.some(p=>p.code==='read_only'));assert.deepEqual([...storage.map],previous);
// Concurrent peers, shuffled updates, and repeated compactions converge.
const peers=[a,b,new Y.Doc()];Y.applyUpdate(peers[2],bytes(initial));
for(let i=0;i<75;i++){
  const p=peers[i%3],events=[];const listener=u=>events.push(u);p.on('update',listener);
  const text=p.getText('source');text.insert(text.length,String(i%10));
  p.off('update',listener);
  for(const u of events){await send({type:'update',data:b64(u)});for(const q of peers)if(q!==p)Y.applyUpdate(q,u);}
  if(i%7===0)await send({type:'snapshot',data:initial,through_sequence:await storage.get('sequence')});
}
await send({type:'snapshot',through_sequence:await storage.get('sequence')});
const expected=Y.mergeUpdates(peers.map(p=>Y.encodeStateAsUpdate(p)));
const expectedDoc=new Y.Doc();Y.applyUpdate(expectedDoc,expected);
recovered=new Y.Doc();Y.applyUpdate(recovered,bytes((await storage.get('snapshot')).data));
assert.equal(recovered.getText('source').toString(),expectedDoc.getText('source').toString());
const beforeRevoke=await storage.get('sequence');
let r=await room.fetch(new Request('https://internal/revoke-member',{method:'POST',headers:{
  'X-Qsseda-Collab-Owner':owner,'X-Qsseda-Collab-Document':document,'X-Qsseda-Collab-Target':member}}));
assert.equal(r.status,204);assert.equal(peer.p.expires_at,0);assert(peer.closed.some(([code])=>code===4003));
assert(other.p.expires_at>Date.now(),'Owner must not be closed when a member is removed');
await send({type:'update',data:initial});assert.equal(await storage.get('sequence'),beforeRevoke);
const beforeMessages=peer.sent.length;room.broadcast({type:'test'});assert.equal(peer.sent.length,beforeMessages,'Revoked peer must not receive a later broadcast');
let name='',path='';
const env={STORAGE:{head:async()=>({customMetadata:{realtimeEpoch:epoch}})},TEX_COLLAB_ROOMS:{
  idFromName:n=>(name=n),get:()=>({fetch:async req=>{path=new URL(req.url).pathname;return new Response(null,{status:204});}})}};
assert.equal(await invalidateTexCollaboration(env,owner,document,'revoke-links',member),true);
assert.equal(name,texRealtimeRoomName(owner,document,epoch));assert.equal(path,'/revoke-links');
console.log('PASS: stale/incomplete snapshot, deletion preservation, malformed update, viewer isolation, 75-edit convergence, immediate revocation and epoch routing');
