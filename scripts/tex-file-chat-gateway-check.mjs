import assert from 'node:assert/strict';
import {handleTexFileChatApi} from '../studio/tex-file-chat-api.js';
import {MemoryR2} from './helpers/memory-r2.mjs';
const owner='11111111-1111-4111-8111-111111111111',id='22222222-2222-4222-8222-222222222222';
const member='33333333-3333-4333-8333-333333333333',third='44444444-4444-4444-8444-444444444444';
const key=`_system/tex-documents/${owner}/${id}.json`,store=new MemoryR2(),originalFetch=globalThis.fetch;
let calls=0,participants=[{participant_id:owner,role:'owner'}],subject=owner,forwarded=null,membership=null,rpcStatus=200;
const env={STORAGE:store,TEX_COLLAB_ROOMS:{idFromName:name=>name,get:()=>({fetch:async req=>{calls++;forwarded=req;return Response.json({ok:true});}})}};
function request({origin='https://work.qsseda.com',body={document_id:id,owner_id:owner,action:'status'},cookie=true}={}){return new Request('https://work.qsseda.com/api/tex/file-chat',{method:'POST',headers:{origin,'content-type':'application/json',...(cookie?{cookie:`__Host-qsseda-studio-access=token; __Secure-qsseda-account-id=${subject}`}:{})},body:JSON.stringify(body)});}
try{
 globalThis.fetch=async url=>{
  const path=String(url);
  if(path.includes('/auth/v1/user'))return Response.json({id:subject});
  if(path.includes('/profiles?'))return Response.json([{id:subject,status:'active'}]);
  if(path.includes('/rpc/tex_collaboration_participants'))return Response.json(participants,{status:rpcStatus});
  if(path.includes('/tex_document_collaborators?'))return Response.json(membership?[membership]:[]);
  throw Error('Unexpected network access '+path);
 };
 assert.equal((await handleTexFileChatApi(request({cookie:false}),env)).status,401);
 store.seed(key,{id,owner_id:owner,source:'Main'});
 assert.equal((await handleTexFileChatApi(request(),env)).status,200);assert.equal(calls,1);
 assert.equal((await handleTexFileChatApi(request({origin:'https://evil.invalid'}),env)).status,403);assert.equal(calls,1);
 store.seed(key,{id,owner_id:owner,document_deleted:true},{kind:'tex-tombstone',retired:'true'});
 assert.equal((await handleTexFileChatApi(request(),env)).status,404);assert.equal(calls,1);
 store.seed(key,{id,owner_id:owner,document_deleted:true});
 assert.equal((await handleTexFileChatApi(request(),env)).status,404,'Metadata-less tombstones must not expose old chat');
 store.seed(key,{id,owner_id:owner,source:'Main'});
 subject=member;
 assert.equal((await handleTexFileChatApi(request(),env)).status,404);assert.equal(calls,1);
 membership={owner_id:owner,document_id:id,role:'viewer'};
 participants.push({participant_id:member,role:'viewer'},{participant_id:third,role:'editor'});
 assert.equal((await handleTexFileChatApi(request(),env)).status,200);assert.equal(calls,2);
 assert.deepEqual(new Set(forwarded.headers.get('X-Qsseda-Chat-Allowed').split(',')),new Set([owner,member,third]),'All named recipients must be included for non-owner senders');
 assert.equal(forwarded.headers.get('X-Qsseda-Chat-Role'),'viewer');
 participants=participants.filter(p=>p.participant_id!==member);
 assert.equal((await handleTexFileChatApi(request(),env)).status,404,'Revocation between initial ACL and participant lookup must fail closed');assert.equal(calls,2);
 participants.push({participant_id:member,role:'viewer'});rpcStatus=503;
 assert.equal((await handleTexFileChatApi(request(),env)).status,503);assert.equal(calls,2);
 rpcStatus=200;
 assert.equal((await handleTexFileChatApi(request({body:{document_id:id,action:'send',ct:'x'.repeat(160001)}}),env)).status,413);
 assert.equal(calls,2);
 assert.equal((await handleTexFileChatApi(request({body:{document_id:id,action:'send',ct:'x'.repeat(21000)}}),env)).status,200,'Gateway must not reject a valid multi-recipient envelope merely for exceeding the old 20KB ceiling');
 assert.equal(calls,3);
}finally{globalThis.fetch=originalFetch;}
console.log('PASS: chat authentication, CSRF, tombstones, revocation race, complete three-member recipient context, bounded gateway requests');
