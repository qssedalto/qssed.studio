// Execute the actual emitted chat functions in isolated deterministic contexts.
// Browser/WebAuthn integration is tested separately; these cases force races
// which timing-based end-to-end tests cannot reliably reproduce.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../studio/ui-work-tex-file-chat.js',import.meta.url),'utf8');
const runtime=JSON.parse(source.match(/const js\s*=\s*("[^\n]*");/)[1]);
const section=(start,end)=>runtime.slice(runtime.indexOf(start),runtime.indexOf(end,runtime.indexOf(start)));
const functions={
 api:section('  async function api(','  function optionsFromJSON'),
 afterVerify:section('  async function afterVerify(','  async function unlock('),
 poll:section('  async function poll(','  async function afterVerify('),
 sendMessage:section('  async function sendMessage(','  const chatTrigger='),
 readMessages:section('  async function readMessages(','  async function poll(')
};
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const base=()=>({state:{generation:1,document:'project-a',token:'grant',user:'user',owner:'owner',role:'owner',
 device:{deviceId:'device-a'},ready:true,unlocking:false,sending:false,key:{},seen:null},
 crypto,TextEncoder,TextDecoder,enc:new TextEncoder(),AbortController,requests:new Set(),
 setTimeout:()=>1,clearTimeout(){},setInterval:()=>2,clearInterval(){},
 LEASE_MS:10800000,leaseTimer:null,timer:null,pollGeneration:null,messageReadSerial:0,
 field:{value:'first draft',disabled:false},sendButton:{disabled:false},passkey:{disabled:true},
 conversation:{hidden:true},unlockView:{hidden:false},notifications:[],
 t:(_cn,en)=>en,notify(){},storeLease(){},dropLease(){},
 isCurrent(g){return g===this.state.generation;}});
function context(names,extra={}){
 const value={...base(),...extra};
 value.isCurrent=g=>g===value.state.generation;
 value.cryptoContext=()=>({document:value.state.document,device:value.state.device,user:value.state.user});
 const ctx=vm.createContext(value);
 for(const name of names)vm.runInContext(functions[name]+`\nglobalThis.${name}=${name};`,ctx);
 return ctx;
}
let groups=0;
{
 let requests=0;const ctx=context(['api'],{fetch:async()=>{requests++;return Response.json({ok:true});}});
 await assert.rejects(ctx.api('send',{},0),e=>e.name==='AbortError');assert.equal(requests,0);
 assert.equal((await ctx.api('status',{},1)).ok,true);assert.equal(ctx.requests.size,0);
 const pending=deferred();ctx.fetch=()=>pending.promise;const call=ctx.api('messages',{},1);
 ctx.state.generation=2;ctx.state.document='project-b';pending.resolve(Response.json({error:'revoked'},{status:403}));
 await assert.rejects(call,e=>e.name==='AbortError'&&e.status===undefined);
 assert.equal(ctx.requests.size,0);groups++;
}
{
 const identity=deferred(),sent=[];
 const ctx=context(['afterVerify'],{deviceIdentity:()=>identity.promise,api:async(...args)=>{sent.push(args);},poll:async()=>{}});
 const call=ctx.afterVerify({expires_in:10800,token:'a',user_id:'user-a',owner_id:'owner',role:'owner'},1);
 ctx.state.generation=2;ctx.state.document='project-b';ctx.state.device={deviceId:'keep-b'};
 identity.resolve({deviceId:'stale-a'});await call;
 assert.equal(ctx.state.device.deviceId,'keep-b');assert.equal(sent.length,0);groups++;
}
{
 const blockedPoll=deferred();let polling=0;
 const ctx=context(['afterVerify'],{deviceIdentity:async()=>({deviceId:'a',x:'x',y:'y'}),api:async()=>({}),
  poll:()=>{polling++;return blockedPoll.promise;}});
 let complete=false;const call=ctx.afterVerify({expires_in:10800,token:'a',user_id:'u',owner_id:'o',role:'owner'},1).then(()=>complete=true);
 await tick();assert.equal(complete,true,'Legacy history must not block room unlock');
 assert.equal(polling,1);assert.equal(ctx.state.ready,true);assert.equal(ctx.sendButton.disabled,false);
 blockedPoll.resolve();await call;groups++;
}
{
 let cleared=0;const oldRead=deferred(),newRead=deferred();
 const ctx=context(['poll'],{readMessages:g=>g===1?oldRead.promise:newRead.promise,
  clearRoom:()=>cleared++,loadRoom:async()=>{},initializeKey:async()=>false,distributeKeys:async()=>{}});
 const old=ctx.poll(1);assert.equal(ctx.pollGeneration,1);
 ctx.state.generation=2;ctx.state.document='project-b';const current=ctx.poll(2);
 oldRead.reject(Object.assign(Error('Old membership revoked'),{status:403}));await old;
 assert.equal(cleared,0,'Late old-room rejection must not revoke the new project');
 assert.equal(ctx.pollGeneration,2,'Old finally must not release the new poll guard');
 newRead.resolve();await current;assert.equal(ctx.pollGeneration,null);groups++;
}
{
 const sent=deferred(),calls=[];
 const ctx=context(['sendMessage'],{toB64:bytes=>Buffer.from(bytes).toString('base64url'),
  messageAad3:(id,from,project)=>new TextEncoder().encode(project+'|'+id+'|'+from),
  sealMessageEnvelope:async()=>({to_user:'user',to_device:'device-a',iv:'sealed-iv',ct:'sealed-key'}),
  readMessages:async()=>{},api:async(op,body)=>{calls.push({op,body});if(op==='devices')return{devices:[{device_id:'device-a'}]};return sent.promise;}});
 ctx.state.unlocking=true;const call=ctx.sendMessage({preventDefault(){}});
 for(let i=0;i<50&&!calls.some(c=>c.op==='send');i++)await tick();
 assert(calls.some(c=>c.op==='send'),'An enabled Send must work even if unlock cleanup is pending');
 assert.equal(ctx.state.sending,true);ctx.field.value='typed while saving ciphertext';sent.resolve({sent:true});await call;
 assert.equal(ctx.field.value,'typed while saving ciphertext','New draft must survive earlier send completion');
 assert.equal(ctx.state.sending,false);assert.equal(ctx.sendButton.disabled,false);
 assert(!JSON.stringify(calls).includes('first draft'),'API must not receive plaintext');groups++;
}
{
 const sent=deferred();let started=false;
 const ctx=context(['sendMessage'],{toB64:bytes=>Buffer.from(bytes).toString('base64url'),
  messageAad3:()=>new Uint8Array(),sealMessageEnvelope:async()=>({}),readMessages:async()=>{},
  api:async op=>{if(op==='devices')return{devices:[{}]};started=true;return sent.promise;}});
 const call=ctx.sendMessage({preventDefault(){}});for(let i=0;i<50&&!started;i++)await tick();assert(started);
 ctx.state.generation=2;ctx.state.document='project-b';ctx.state.sending=true;ctx.field.value='project-b draft';
 sent.resolve({sent:true});await call;
 assert.equal(ctx.field.value,'project-b draft');assert.equal(ctx.state.sending,true,'Old send cannot unlock the new send');groups++;
}
{
 const first=deferred(),second=deferred();let request=0;const shown=[];
 const ctx=context(['readMessages'],{api:()=>++request===1?first.promise:second.promise,
  openMessage3:async msg=>msg.clear,bubble:message=>message.text,
  feed:{scrollHeight:0,scrollTop:0,clientHeight:500,replaceChildren(...rows){shown.splice(0,shown.length,...rows);}}});
 const old=ctx.readMessages(1),latest=ctx.readMessages(1);
 second.resolve({messages:[{id:'latest',v:3,clear:'new ciphertext',user_id:'user'}]});await latest;
 first.resolve({messages:[{id:'old',v:3,clear:'old ciphertext',user_id:'user'}]});await old;
 assert.deepEqual(shown,['new ciphertext'],'Late polling must not replace a newer message list');groups++;
}
// Structural checks complement the forced races: identity registration must
// re-read inside one read/write transaction, not overwrite another tab's key.
assert(runtime.includes("const request=store.get(id);let identity;"));
assert(runtime.includes('tx.oncomplete=()=>resolve(identity)'));
assert(runtime.includes('if(!request.result)store.add(candidate)'));
assert(runtime.includes("window.addEventListener('pageshow',event=>"));
console.log(`PASS: ${groups} forced chat races, generation fences, immediate send, draft preservation, newest-read wins and durable identity contract`);
