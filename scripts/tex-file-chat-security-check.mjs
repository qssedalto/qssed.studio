import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { handleTexFileChatRoom } from "../studio/tex-file-chat-room.js";
import { hashText, b64 } from "../studio/tex-file-chat-webauthn.js";
import { enhanceWorkTexFileChat } from "../studio/ui-work-tex-file-chat.js";
import { enhanceWorkTexToolbarScroll } from "../studio/ui-work-tex-toolbar-scroll.js";

if(!globalThis.crypto)globalThis.crypto=webcrypto;
const owner="11111111-1111-4111-8111-111111111111";
const editor="77777777-7777-4777-8777-777777777777";
const outsider="88888888-8888-4888-8888-888888888888";
const project=await hashText("project-chat-v2:"+owner+":22222222-2222-4222-8222-222222222222");
const other=await hashText("project-chat-v2:"+owner+":33333333-3333-4333-8333-333333333333");
const auth=(id=owner,scope=project,role="owner",members=[owner,editor])=>({
  "X-Qsseda-Chat-User":id,"X-Qsseda-Chat-Owner":owner,
  "X-Qsseda-Chat-Project":scope,"X-Qsseda-Chat-Rp":"work.qsseda.com",
  "X-Qsseda-Chat-Origin":"https://work.qsseda.com",
  "X-Qsseda-Chat-Role":role,"X-Qsseda-Chat-Allowed":members.join(","),
  "X-Qsseda-Chat-Username":id===owner?"owner":"editor",
  "X-Qsseda-Chat-Display-Name":encodeURIComponent(id===owner?"项目所有者":"张同学"),
  "content-type":"application/json"
});
const storageMap=new Map();
const storage={
  get:async key=>storageMap.get(key),
  put:async(key,value)=>{storageMap.set(key,value)},
  delete:async key=>{storageMap.delete(key)},
  list:async({prefix="",reverse=false,limit}={})=>{
    let keys=[...storageMap.keys()].filter(key=>key.startsWith(prefix)).sort();
    if(reverse)keys.reverse();
    if(limit)keys=keys.slice(0,limit);
    return new Map(keys.map(key=>[key,storageMap.get(key)]));
  }
};
const state={storage,blockConcurrencyWhile:async fn=>fn()};
const send=async(op,args={},headers=auth())=>{
  const response=await handleTexFileChatRoom(state,new Request("https://room.internal/file-chat",{
    method:"POST",headers,body:JSON.stringify({op,...args})
  }));
  return {status:response.status,body:await response.json()};
};
const base=await send("status");
assert.equal(base.status,200);
assert.equal(base.body.user_id,owner);
assert.equal(base.body.role,"owner");
// No WebAuthn prompt or user-created project credential is required.
assert.equal((await send("begin")).status,410);
assert.equal((await send("verify",{credential:{}})).status,410);
assert.equal((await send("messages")).status,200);
assert.equal((await send("latest")).body.last,null);
// Only members whose signed-in account was verified by the Work gateway can
// appear in the trusted authority context. Invalid/removed members are denied.
assert.equal((await send("status",{},auth(outsider))).status,403);
assert.equal((await send("messages",{},auth(editor,project,"editor",[owner]))).status,403);
assert.equal((await send("status",{},auth(owner,project,"admin"))).status,403);
assert.equal((await send("status",{}, {...auth(),"X-Qsseda-Chat-Origin":"https://evil.example"})).status,403);
assert.equal((await send("status",{},auth(owner,"bad-project"))).status,403);

const enc=new TextEncoder();
const deviceId="22222222-2222-4222-8222-222222222222";
const keys=await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},true,["deriveBits"]);
const jwk=await crypto.subtle.exportKey("jwk",keys.publicKey);
assert.equal((await send("device",{device_id:deviceId,x:jwk.x,y:jwk.y})).status,200);
const wrongKeys=await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},true,["deriveBits"]);
const wrongJwk=await crypto.subtle.exportKey("jwk",wrongKeys.publicKey);
assert.equal((await send("device",{device_id:deviceId,x:wrongJwk.x,y:wrongJwk.y})).status,409,
  "Encryption device public keys cannot silently change");
const listed=await send("devices");assert.equal(listed.body.devices.length,1);
assert.equal(listed.body.initialized,false);
assert.equal((await send("devices",{},auth(editor,project,"viewer"))).status,403);
const iv=b64(new Uint8Array(12)),ct=b64(new Uint8Array(48));
assert.equal((await send("envelope-put",{to_user:owner,to_device:deviceId,from_device:deviceId,
  iv,ct})).status,200);
assert.equal((await send("envelope-get",{device_id:deviceId})).body.ready,true);
assert.equal((await send("envelope-put",{to_user:owner,to_device:deviceId,
  from_device:deviceId,iv,ct})).status,409);

const aes=await crypto.subtle.generateKey({name:"AES-GCM",length:256},true,["encrypt","decrypt"]);
const msgId=crypto.randomUUID(),msgIV=crypto.getRandomValues(new Uint8Array(12));
const encrypted=await crypto.subtle.encrypt({name:"AES-GCM",iv:msgIV},aes,enc.encode("Never store plaintext"));
assert.equal((await send("send",{message_id:msgId,iv:b64(msgIV),ct:b64(encrypted)},
  auth(editor,project,"editor"))).status,200);
assert.equal((await send("send",{message_id:crypto.randomUUID(),text:"PLAINTEXT"})).status,422);
const history=await send("messages");
assert.equal(history.status,200);
assert.equal(history.body.messages.length,1);
assert.equal(history.body.messages[0].ct,b64(encrypted));
assert.equal(history.body.messages[0].text,undefined);
assert.equal(history.body.messages[0].sender_name,"张同学");
const latest=await send("latest");
assert.deepEqual(latest.body.last,{id:msgId,at:history.body.messages[0].at,
  user_id:editor,sender_name:"张同学"});
assert.equal((await send("messages",{},auth(owner,other))).body.messages.length,0,
  "Different project rooms must not share message keys");
assert.equal((await send("latest",{},auth(owner,other))).body.last,null);

const markup=enhanceWorkTexFileChat("",true);
const code=markup.split('<script id="aertex-file-chat-runtime">')[1]?.split("</script>")[0];
assert(code,"Chat runtime is required");
new vm.Script(code);
for(const marker of ["indexedDB.open","deriveBits","AES-GCM","envelope-put","envelope-get",
  "aertex:tex-chat-toggle","document_id","aertex:tex-project-asset-selected",
  "pagehide","checkNotifications","showToast","setTimeout(()=>{toast.hidden=true;},2000)"]){
  assert(code.includes(marker),"Missing "+marker);
}
assert(!code.includes("navigator.credentials."),"WebAuthn must never block project chat");
assert(!code.includes("state.token"),"No client-side Passkey grant must be needed");
assert(!markup.includes('id="aertex-chat-passkey"'),"No Passkey button");
assert(!markup.includes('id="aertex-chat-help-link"'),"No Passkey tutorial");
assert(code.includes("localStorage.setItem(HINT_PREF"),"Only harmless hint setting may persist");
assert(!code.includes("localStorage.setItem('filechat-key"),"Never persist room keys in localStorage");
assert(!code.includes("sessionStorage"),"No sessionStorage auth workaround");
assert(!code.includes("state.file"),"Chat identity is project-scoped");
assert(code.includes("const top=Math.max(visualTop+gap,(rect?.bottom||64)+8)"),
  "Chat must anchor below bubble");
const toolbar=enhanceWorkTexToolbarScroll("",true);
assert(toolbar.includes("aertex:tex-chat-toggle"));
const worker=readFileSync(new URL("../worker.js",import.meta.url),"utf8");
assert(worker.includes('pathname === "/api/tex/file-chat"'));
const gateway=readFileSync(new URL("../studio/tex-file-chat-api.js",import.meta.url),"utf8");
for(const marker of ["resolveDocumentAccess","verifyStudioApiSession","verifyActiveUser",
  "get(\"Origin\")!==url.origin",'hashText("project-chat-v2:"+ownerId+":"+documentId)',
  "if(access.via_link===true)",'"X-Qsseda-Chat-Display-Name"']){
  assert(gateway.includes(marker),"Missing gateway ACL requirement "+marker);
}
console.log("Project ACL direct-chat entry, ciphertext storage, sealed envelopes, sender metadata and 2s toast contracts: PASS");
