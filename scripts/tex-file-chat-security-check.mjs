import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import vm from "node:vm";
import { handleTexFileChatRoom } from "../studio/tex-file-chat-room.js";
import { b64, unb64, hashText, verifyRegistration, verifyAssertion } from "../studio/tex-file-chat-webauthn.js";
import { enhanceWorkTexFileChat } from "../studio/ui-work-tex-file-chat.js";
import { enhanceWorkTexToolbarScroll } from "../studio/ui-work-tex-toolbar-scroll.js";
import { readFileSync } from "node:fs";

if(!globalThis.crypto)globalThis.crypto=webcrypto;
const enc=new TextEncoder(),concat=(...parts)=>{
  const bytes=parts.map(p=>new Uint8Array(p)),output=new Uint8Array(bytes.reduce((sum,p)=>sum+p.byteLength,0));
  let at=0;for(const x of bytes){output.set(x,at);at+=x.length}return output;
};
function cbor(value){
  function type(major,length){
    if(length<24)return Uint8Array.of((major<<5)|length);
    if(length<256)return Uint8Array.of((major<<5)|24,length);
    if(length<65536)return Uint8Array.of((major<<5)|25,length>>8,length&255);
    throw Error("Test CBOR length too large");
  }
  if(typeof value==="number")return type(value>=0?0:1,value>=0?value:-value-1);
  if(typeof value==="string"){const b=enc.encode(value);return concat(type(3,b.length),b)}
  if(value instanceof Uint8Array)return concat(type(2,value.length),value);
  if(value instanceof Map){let a=[type(5,value.size)];for(const [k,v] of value)a.push(cbor(k),cbor(v));return concat(...a)}
  throw Error("CBOR helper cannot encode "+typeof value);
}
const owner="11111111-1111-4111-8111-111111111111";
const file=await hashText("project-chat-v2:"+owner+":22222222-2222-4222-8222-222222222222");
const fileB=await hashText("project-chat-v2:"+owner+":33333333-3333-4333-8333-333333333333");
const auth=(fileHash=file,role="owner")=>({
 "X-Qsseda-Chat-User":owner,"X-Qsseda-Chat-Owner":owner,
 "X-Qsseda-Chat-Project":fileHash,"X-Qsseda-Chat-Rp":"work.qsseda.com",
 "X-Qsseda-Chat-Origin":"https://work.qsseda.com",
 "X-Qsseda-Chat-Role":role,"X-Qsseda-Chat-Allowed":owner,
 "content-type":"application/json"
});
const cache=new Map();
const storage={
 get:async(k)=>cache.get(k),
 put:async(k,v)=>{cache.set(k,v)},
 delete:async(k)=>cache.delete(k),
 list:async({prefix,reverse=false,limit}={})=>{
   const keys=[...cache.keys()].filter(k=>k.startsWith(prefix||"")).sort();
   if(reverse)keys.reverse();
   return new Map((limit?keys.slice(0,limit):keys).map(k=>[k,cache.get(k)]));
 }
};
const state={storage,blockConcurrencyWhile:async fn=>fn()};
const send=async(op,args={},headers=auth())=>{
 const req=new Request("https://internal/file-chat",{method:"POST",headers,
   body:JSON.stringify({op,...args})});
 const result=await handleTexFileChatRoom(state,req);
 return {status:result.status,body:await result.json()};
};
let a=await send("status");
assert.equal(a.status,200);assert.equal(a.body.registered,false);
assert.equal((await send("messages",{})).status,401,"No Passkey means no chat access");
assert.equal((await send("latest")).status,200,"Notification metadata requires only Work session");
for(const op of ["devices","send","device","envelope-get"]){
  assert.equal((await send(op)).status,401,"Passkey gate must protect "+op);
}
const first=await send("begin");assert.equal(first.body.mode,"create");
const options=first.body.public_key;
assert.equal(options.authenticatorSelection.userVerification,"required");
assert.equal(options.authenticatorSelection.residentKey,"required");
assert.equal(options.rp.id,"work.qsseda.com");

const passkey=await crypto.subtle.generateKey({name:"ECDSA",namedCurve:"P-256"},true,["sign","verify"]);
const pub=await crypto.subtle.exportKey("jwk",passkey.publicKey);
const id=crypto.getRandomValues(new Uint8Array(32)),credId=b64(id);
const rpHash=new Uint8Array(await crypto.subtle.digest("SHA-256",enc.encode("work.qsseda.com")));
const cose=new Map([[1,2],[3,-7],[-1,1],[-2,unb64(pub.x)],[-3,unb64(pub.y)]]);
const attAuth=concat(rpHash,Uint8Array.of(0x45,0,0,0,0),new Uint8Array(16),
  Uint8Array.of(0,id.length),id,cbor(cose));
const attestation=cbor(new Map([["fmt","none"],["attStmt",new Map()],["authData",attAuth]]));
const clientCreate=b64(enc.encode(JSON.stringify({type:"webauthn.create",challenge:options.challenge,
  origin:"https://work.qsseda.com",crossOrigin:false})));
const credential={id:credId,rawId:credId,type:"public-key",
  response:{clientDataJSON:clientCreate,attestationObject:b64(attestation)}};
const verified=await send("verify",{challenge_id:first.body.challenge_id,credential});
assert.equal(verified.status,200,JSON.stringify(verified.body));
assert.equal(verified.body.verified,true);
assert.equal(verified.body.expires_in,10800,"Successful WebAuthn verification must grant exactly 3 hours");
const token=verified.body.token;
const resume=await send("resume",{token});
assert.equal(resume.status,200,"Same project/user may resume within the verified time window");
assert(resume.body.expires_in<=10800&&resume.body.expires_in>=10798,
  "Resume returns the remaining time, never a new 3-hour grant");
assert.equal(token.length,43);
assert.equal((await send("status")).body.registered,true);
assert.equal((await send("verify",{challenge_id:first.body.challenge_id,credential})).status,403,
  "Challenge must be one-time and never reusable");
assert.equal((await send("messages",{token},auth(fileB))).status,401,
  "A project Passkey grant must not authorize another project");
assert.equal((await send("resume",{token},auth(fileB))).status,401,
  "A grant must not resume a different project's chat");
assert.equal((await send("resume",{token:"invalid"})).status,401,
  "Unverified client claims may not bypass server WebAuthn");

const next=await send("begin");assert.equal(next.body.mode,"get");
assert.deepEqual(next.body.public_key.allowCredentials,[{type:"public-key",id:credId}]);
const clientGet=b64(enc.encode(JSON.stringify({type:"webauthn.get",challenge:next.body.public_key.challenge,
  origin:"https://work.qsseda.com",crossOrigin:false})));
const authenticatorData=concat(rpHash,Uint8Array.of(0x05,0,0,0,1));
const clientHash=new Uint8Array(await crypto.subtle.digest("SHA-256",unb64(clientGet)));
const signature=new Uint8Array(await crypto.subtle.sign({name:"ECDSA",hash:"SHA-256"},passkey.privateKey,
  concat(authenticatorData,clientHash)));
const assertion={type:"public-key",id:credId,rawId:credId,
  response:{clientDataJSON:clientGet,authenticatorData:b64(authenticatorData),signature:b64(signature)}};
const relogin=await send("verify",{challenge_id:next.body.challenge_id,credential:assertion});
assert.equal(relogin.status,200,JSON.stringify(relogin.body));
assert.equal((await send("messages",{token})).status,403,"Encrypted device must be enrolled before history is delivered");
const latestToken=relogin.body.token;
const enroll=await send("begin",{action:"enroll-device",token:latestToken});
assert.equal(enroll.status,200,JSON.stringify(enroll.body));
assert.equal(enroll.body.mode,"create-add");
assert.equal(enroll.body.public_key.excludeCredentials[0].id,credId);
assert.equal((await send("begin",{action:"enroll-device",token:"bad"})).status,401,
  "Adding new device Passkeys requires an existing verified file credential");
const newPasskey=await crypto.subtle.generateKey({name:"ECDSA",namedCurve:"P-256"},true,["sign","verify"]);
const newPub=await crypto.subtle.exportKey("jwk",newPasskey.publicKey);
const newId=crypto.getRandomValues(new Uint8Array(32)),newCredId=b64(newId);
const newCose=new Map([[1,2],[3,-7],[-1,1],[-2,unb64(newPub.x)],[-3,unb64(newPub.y)]]);
const newAtt=concat(rpHash,Uint8Array.of(0x45,0,0,0,0),new Uint8Array(16),
  Uint8Array.of(0,newId.length),newId,cbor(newCose));
const newAttestation=cbor(new Map([["fmt","none"],["attStmt",new Map()],["authData",newAtt]]));
const secondEnroll=await send("begin",{action:"enroll-device",token:latestToken});
const addClient=b64(enc.encode(JSON.stringify({type:"webauthn.create",
  challenge:secondEnroll.body.public_key.challenge,origin:"https://work.qsseda.com",crossOrigin:false})));
const added=await send("verify",{challenge_id:secondEnroll.body.challenge_id,token:latestToken,
  credential:{id:newCredId,rawId:newCredId,type:"public-key",
  response:{clientDataJSON:addClient,attestationObject:b64(newAttestation)}}});
assert.equal(added.status,200,JSON.stringify(added.body));
assert.equal((await send("status")).body.passkey_count,2,"Each device must have a separate file credential");
const multiple=await send("begin");
assert.equal(multiple.body.mode,"get");
assert.equal(multiple.body.public_key.allowCredentials.length,2);
assert.equal((await send("messages",{token:latestToken})).status,403,
  "WebAuthn credential enrollment is not an encryption device enrollment");
// A credential from another project must not authenticate this room,
// even when it signs the current challenge correctly.
const wrongProjectKey=await crypto.subtle.generateKey(
  {name:"ECDSA",namedCurve:"P-256"},true,["sign","verify"]);
const wrongProjectCredentialId=b64(crypto.getRandomValues(new Uint8Array(32)));
const wrongProjectChallenge=await send("begin");
assert.equal(wrongProjectChallenge.body.mode,"get");
assert(!wrongProjectChallenge.body.public_key.allowCredentials
  .some(item=>item.id===wrongProjectCredentialId),
  "The browser may only request credentials enrolled for this project");
const wrongProjectClient=b64(enc.encode(JSON.stringify({
  type:"webauthn.get",challenge:wrongProjectChallenge.body.public_key.challenge,
  origin:"https://work.qsseda.com",crossOrigin:false
})));
const wrongProjectSignature=b64(new Uint8Array(await crypto.subtle.sign(
  {name:"ECDSA",hash:"SHA-256"},wrongProjectKey.privateKey,
  concat(authenticatorData,await crypto.subtle.digest("SHA-256",unb64(wrongProjectClient))))));
const wrongProjectAttempt=await send("verify",{
  challenge_id:wrongProjectChallenge.body.challenge_id,
  credential:{id:wrongProjectCredentialId,rawId:wrongProjectCredentialId,
    type:"public-key",response:{clientDataJSON:wrongProjectClient,
      authenticatorData:b64(authenticatorData),signature:wrongProjectSignature}}
});
assert.equal(wrongProjectAttempt.status,403,
  "A validly signed but foreign project Passkey must never unlock this project");
assert(!wrongProjectAttempt.body.token,
  "Rejecting a foreign project credential must never issue a chat token");

// Even a valid credential ID paired with a foreign private key cannot
// impersonate the registered project's original ES256 key.
const forgedPrivateKeyChallenge=await send("begin");
const forgedPrivateClient=b64(enc.encode(JSON.stringify({
  type:"webauthn.get",challenge:forgedPrivateKeyChallenge.body.public_key.challenge,
  origin:"https://work.qsseda.com",crossOrigin:false
})));
const forgedPrivateSignature=b64(new Uint8Array(await crypto.subtle.sign(
  {name:"ECDSA",hash:"SHA-256"},wrongProjectKey.privateKey,
  concat(authenticatorData,await crypto.subtle.digest("SHA-256",unb64(forgedPrivateClient))))));
assert.equal((await send("verify",{challenge_id:forgedPrivateKeyChallenge.body.challenge_id,
  credential:{id:credId,rawId:credId,type:"public-key",
    response:{clientDataJSON:forgedPrivateClient,
      authenticatorData:b64(authenticatorData),signature:forgedPrivateSignature}}
})).status,403,"A wrong private key must fail even when claiming the correct credential ID");

const invalidSignature={...assertion,response:{...assertion.response,signature:b64(new Uint8Array(64))}};
const third=await send("begin");
assert.equal((await send("verify",{challenge_id:third.body.challenge_id,credential:invalidSignature})).status,403,
  "Forged signature must fail even if the browser claims WebAuthn success");
const changedOrigin=await send("begin");
const evil={...credential,response:{...credential.response,
  clientDataJSON:b64(enc.encode(JSON.stringify({type:"webauthn.get",challenge:changedOrigin.body.public_key.challenge,
    origin:"https://evil.example"})))}};
assert.equal((await send("verify",{challenge_id:changedOrigin.body.challenge_id,credential:evil})).status,403,
  "Origin mismatch and cross-site credential claims must fail");

const idDevice="22222222-2222-4222-8222-222222222222";
const ecdh=await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},true,["deriveBits"]);
const jwk=await crypto.subtle.exportKey("jwk",ecdh.publicKey);
assert.equal((await send("device",{token:latestToken,device_id:idDevice,x:jwk.x,y:jwk.y})).status,200);
const alternate=await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},true,["deriveBits"]);
const alternateJwk=await crypto.subtle.exportKey("jwk",alternate.publicKey);
assert.equal((await send("device",{token:latestToken,device_id:idDevice,x:alternateJwk.x,y:alternateJwk.y})).status,409,
  "Previously pinned device public keys cannot be silently replaced");
let listed=await send("devices",{token:latestToken});assert.equal(listed.body.devices.length,1);
assert.equal(listed.body.initialized,false);
assert.equal((await send("envelope-put",{token:latestToken,to_user:owner,to_device:idDevice,from_device:idDevice,
  iv:b64(new Uint8Array(12)),ct:b64(new Uint8Array(48))})).status,200);
assert.equal((await send("envelope-get",{token:latestToken,device_id:idDevice})).body.ready,true);
listed=await send("devices",{token:latestToken});
assert.equal(listed.body.initialized,true);
assert.equal(listed.body.devices[0].ready,true);
assert.equal((await send("envelope-put",{token:latestToken,to_user:owner,to_device:idDevice,from_device:idDevice,
  iv:b64(new Uint8Array(12)),ct:b64(new Uint8Array(48))})).status,409);

const aes=await crypto.subtle.generateKey({name:"AES-GCM",length:256},true,["encrypt","decrypt"]);
const msgId=crypto.randomUUID(),iv=crypto.getRandomValues(new Uint8Array(12));
const ct=await crypto.subtle.encrypt({name:"AES-GCM",iv},aes,enc.encode("Hello E2EE"));
assert.equal((await send("send",{token:latestToken,message_id:msgId,iv:b64(iv),ct:b64(ct)})).status,200);
assert.equal((await send("send",{token:latestToken,message_id:crypto.randomUUID(),text:"PLAINTEXT"})).status,422);
const history=await send("messages",{token:latestToken,device_id:idDevice});assert.equal(history.body.messages.length,1);
assert.equal(history.body.messages[0].text,undefined);
assert.equal(history.body.messages[0].ct,b64(ct));
assert.equal((await send("devices",{token:latestToken},auth(file,"viewer"))).status,200,
  "Project members can fetch each other's public encryption keys");
assert.equal((await send("envelope-put",{token:latestToken,to_user:owner,to_device:idDevice,
  from_device:idDevice,iv:b64(new Uint8Array(12)),ct:b64(new Uint8Array(48))},
  auth(file,"viewer"))).status,403,"Only owners can distribute old shared keys");


const secondDevice="33333333-3333-4333-8333-333333333333";
const secondPair=await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},true,["deriveBits"]);
const secondPub=await crypto.subtle.exportKey("jwk",secondPair.publicKey);
assert.equal((await send("device",{token:latestToken,device_id:secondDevice,
  x:secondPub.x,y:secondPub.y})).status,200);
const iv3=b64(crypto.getRandomValues(new Uint8Array(12)));
const ct3=b64(crypto.getRandomValues(new Uint8Array(90)));
const keyIV=b64(crypto.getRandomValues(new Uint8Array(12)));
const keyCT=b64(crypto.getRandomValues(new Uint8Array(48)));
const envelope=(id)=>({to_user:owner,to_device:id,iv:keyIV,ct:keyCT});
const recipients=[envelope(idDevice),envelope(secondDevice)];
const msg3=crypto.randomUUID();
assert.equal((await send("send",{token:latestToken,v:3,from_device:idDevice,
  message_id:msg3,iv:iv3,ct:ct3,envelopes:[recipients[0]]})).status,409,
  "Owner-independent E2EE fanout must cover every registered device");
assert.equal((await send("send",{token:latestToken,v:3,from_device:idDevice,
  message_id:msg3,iv:iv3,ct:ct3,envelopes:recipients})).status,200,
  "Verified members can send messages without an owner key handoff");
const secondHistory=await send("messages",{token:latestToken,device_id:secondDevice});
assert.equal(secondHistory.status,200);
const received=secondHistory.body.messages.find(x=>x.id===msg3);
assert(received?.sender_public&&received.v===3,"Authentic sender public encryption key is stored");
assert.equal(received.envelope?.ct,keyCT,"Only this recipient's sealed message key may be returned");
assert(!("envelopes" in received),"Never disclose another recipient's wrapped key");
assert.equal((await send("send",{token:latestToken,v:3,from_device:idDevice,
  message_id:crypto.randomUUID(),iv:iv3,ct:ct3,envelopes:recipients,text:"plaintext"})).status,422);
const markup=enhanceWorkTexFileChat("",true);
const runtime=markup.match(/<script id="aertex-file-chat-runtime">([\s\S]*?)<\/script>/)?.[1];
assert(runtime,"Chat runtime must be loaded on TeX Work");
assert.doesNotThrow(()=>new vm.Script(runtime),"Client chat runtime must parse");
for(const marker of ["navigator.credentials.create","navigator.credentials.get",
  "indexedDB.open","deriveBits","AES-GCM","sealMessageEnvelope","openMessage3",
  "aertex:tex-chat-toggle","document_id","aertex:tex-project-asset-selected",
  "pagehide","checkNotifications","setTimeout(()=>{toast.hidden=true;},2000)"])
  assert(runtime.includes(marker),"Missing "+marker);
assert(!runtime.includes("等待项目所有者共享加密聊天密钥"),"No owner-key wait is permitted");
assert(runtime.includes("state.ready=true"),"Project Passkey verify must unlock E2EE v3");
assert(runtime.includes("localStorage.setItem(HINT_PREF"),"Non-sensitive UI preference should be persisted");
assert(!runtime.includes("state.device.newDevice"),"A missing ECDH identity must not be called a new physical device");
assert(!runtime.includes("markDeviceEnrolled()"),"WebAuthn enrollment must not be inferred from IndexedDB");
assert(!runtime.includes("action:'enroll-device'"),"Successful WebAuthn GET must not silently enroll another Passkey");
assert(!runtime.includes("localStorage.setItem('filechat-key"),"Never persist room keys in localStorage");
assert(runtime.includes("sessionStorage.getItem")&&runtime.includes("sessionStorage.setItem"),
  "Valid project Passkey grants should survive a same-tab page refresh");
assert(runtime.includes("await api('resume'")&&runtime.includes("readLease(info.document,String(result.user_id||'')"),
  "Every resumed grant must be bound to project and user then rechecked on server");
assert(!runtime.includes("localStorage.setItem(leaseKey"),
  "Never store authentication grants in persistent localStorage");
assert(runtime.includes("function toggleChat()"),"Popup should use a single toolbar toggle");
assert(!runtime.includes("panel.querySelector(\'.close\')"),"No close button can bypass the toolbar icon");
const toolbar=enhanceWorkTexToolbarScroll("",true);
assert(toolbar.includes("aertex:tex-chat-toggle"));
assert(!toolbar.includes("https://chat.qsseda.com/"));
assert(!toolbar.includes("tex-collaboration-open')?.click()"));
const worker=readFileSync(new URL("../worker.js",import.meta.url),"utf8");
assert(worker.includes('pathname === "/api/tex/file-chat"'));
const gateway=readFileSync(new URL("../studio/tex-file-chat-api.js",import.meta.url),"utf8");
assert(gateway.includes("resolveDocumentAccess"));
assert(gateway.includes("verifyStudioApiSession"));
assert(gateway.includes("get(\"Origin\")!==url.origin"));
assert(gateway.includes('hashText("project-chat-v2:"+ownerId+":"+documentId)'));
assert(gateway.includes('delete forwarded.file_name'),"File name is never a room selector");
assert(!gateway.includes('file.name===fileName'),"Project chat must not require a selected file");
assert(runtime.includes("'AERTEX-projectchat-v2:'"),"Room KDF must depend on project alone");
assert(!runtime.includes("state.file"),"File switches must not reset project E2EE state");
assert(gateway.includes("if(access.via_link===true)"));
// Time-based expiry is enforced on the server as well as in the browser.
const grantDigest=await hashText(latestToken);
const grantKey=[...cache.keys()].find(k=>k.includes(":grant:")&&k.endsWith(":"+grantDigest));
assert(grantKey,"A project/user/digest-bound lease must exist");
const grantRecord=cache.get(grantKey);
const originalExpiry=grantRecord.expires;
const resumedAgain=await send("resume",{token:latestToken});
assert.equal(resumedAgain.status,200);
assert.equal(cache.get(grantKey).expires,originalExpiry,
  "Resuming must not extend the absolute 3-hour deadline");
cache.set(grantKey,{...grantRecord,expires:Date.now()-1});
assert.equal((await send("resume",{token:latestToken})).status,401,
  "Server must reject the grant as soon as it expires");
assert.equal((await send("messages",{token:latestToken})).status,401,
  "An expired grant must not access encrypted messages");
console.log("Project Passkey 3-hour absolute lease, scoped resume, expiry, E2EE and forgery rejection PASS");
