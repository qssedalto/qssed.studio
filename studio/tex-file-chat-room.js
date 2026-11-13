import { randomKey, hashText, verifyRegistration, verifyAssertion } from "./tex-file-chat-webauthn.js";
// Durable Object receives authority context ONLY from verified Work Worker.
// Store ciphertext and wrapped AES keys, never message text or raw room keys.
const BASE="filechat:v1:",CHALLENGE_MS=120000,LEASE_MS=600000;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HASH=/^[A-Za-z0-9_-]{43}$/;
const res=(body,status=200)=>Response.json(body,{status,headers:{"cache-control":"no-store","x-content-type-options":"nosniff"}});
const bad=(reason,status=400)=>res({error:reason},status);
const key=(file,kind,id="")=>BASE+file+":"+kind+(id?":"+id:"");
const goodCipher=(o,max=12000)=>o&&typeof o.iv==="string"&&/^[A-Za-z0-9_-]{16}$/.test(o.iv)
  &&typeof o.ct==="string"&&o.ct.length<=max&&/^[A-Za-z0-9_-]{24,12000}$/.test(o.ct);
const goodPub=o=>HASH.test(String(o?.x||""))&&HASH.test(String(o?.y||""));
function authority(request){
  const h=request.headers,u=h.get("X-Qsseda-Chat-User")||"",own=h.get("X-Qsseda-Chat-Owner")||"",
    file=h.get("X-Qsseda-Chat-File")||"",rp=h.get("X-Qsseda-Chat-Rp")||"",
    origin=h.get("X-Qsseda-Chat-Origin")||"",role=h.get("X-Qsseda-Chat-Role")||"",
    members=(h.get("X-Qsseda-Chat-Allowed")||"").split(",").filter(Boolean);
  if(!UUID.test(u)||!UUID.test(own)||!HASH.test(file)||
    !["owner","editor","viewer"].includes(role)||!members.includes(u)||
    members.length>100||!members.every(m=>UUID.test(m))||
    !/^work\.qsseda\.(com|studio)$/.test(rp)||origin!=="https://"+rp)return null;
  return {user:u,owner:own,file,rp,origin,role,members};
}
async function tokenOK(storage,a,token){
  if(!HASH.test(String(token||"")))return false;
  const hashed=await hashText(token),record=await storage.get(key(a.file,"grant",a.user));
  // Only the most recently Passkey-verified in-memory grant is accepted;
  // do not accumulate historic bearer hashes in Durable Object storage.
  return !!record&&record.digest===hashed&&record.expires>Date.now()&&record.user===a.user;
}
async function begin(storage,a){
  const existing=await storage.get(key(a.file,"credential",a.user));
  const mode=existing?"get":"create",challenge=randomKey(),id=crypto.randomUUID();
  await storage.put(key(a.file,"challenge",a.user),{mode,challenge,id,created:Date.now(),origin:a.origin,rp:a.rp});
  const publicKey=mode==="create"?{
    rp:{id:a.rp,name:"AERTEX Work 文件协作聊天"},
    user:{id:(await hashText("filechat:"+a.file+":"+a.user)).slice(0,43),
      name:a.user.slice(0,8)+"-"+a.file.slice(0,9),displayName:"AERTEX · 独立文件聊天"},
    challenge,pubKeyCredParams:[{type:"public-key",alg:-7}],
    timeout:90000,attestation:"none",
    authenticatorSelection:{residentKey:"required",requireResidentKey:true,userVerification:"required"}
  }:{
    challenge,rpId:a.rp,timeout:90000,userVerification:"required",
    allowCredentials:[{id:existing.id,type:"public-key"}]
  };
  return res({mode,challenge_id:id,public_key:publicKey});
}
async function verify(state,a,body){
  const storage=state.storage,challengeKey=key(a.file,"challenge",a.user);
  let pending;
  await state.blockConcurrencyWhile(async()=>{
    pending=await storage.get(challengeKey);
    if(pending)await storage.delete(challengeKey);
  });
  if(!pending||pending.id!==body.challenge_id||Date.now()-pending.created>CHALLENGE_MS||
      pending.origin!==a.origin||pending.rp!==a.rp)return bad("WebAuthn challenge expired or reused",403);
  const credentialKey=key(a.file,"credential",a.user);
  try{
    if(pending.mode==="create"){
      if(await storage.get(credentialKey))return bad("This file already has a Passkey",409);
      const record=await verifyRegistration(body.credential,pending.challenge,a.origin,a.rp);
      await storage.put(credentialKey,{...record,rp:a.rp,created:Date.now()});
    }else{
      const record=await storage.get(credentialKey);
      if(!record||record.rp!==a.rp)return bad("File Passkey not found",403);
      const checked=await verifyAssertion(body.credential,pending.challenge,a.origin,a.rp,record);
      await storage.put(credentialKey,{...record,...checked});
    }
  }catch{return bad("File Passkey verification failed",403)}
  const token=randomKey();
  await storage.put(key(a.file,"grant",a.user),{
    user:a.user,digest:await hashText(token),expires:Date.now()+LEASE_MS
  });
  return res({verified:true,token,expires_in:Math.floor(LEASE_MS/1000),
    owner_id:a.owner,user_id:a.user,role:a.role});
}
async function device(storage,a,body){
  const id=String(body.device_id||"");
  if(!UUID.test(id)||!goodPub(body))return bad("Invalid encryption device");
  try{
    await crypto.subtle.importKey("jwk",{kty:"EC",crv:"P-256",x:body.x,y:body.y,ext:true},
      {name:"ECDH",namedCurve:"P-256"},false,[]);
  }catch{return bad("Invalid device public key")}
  const k=key(a.file,"device",a.user+":"+id),existing=await storage.get(k);
  if(existing&&(existing.x!==body.x||existing.y!==body.y))return bad("Trusted device public key cannot silently change",409);
  if(!existing){
    const previous=await storage.list({prefix:key(a.file,"device",a.user+":")});
    if(previous.size>=5)return bad("Five device limit reached for this file",429);
  }
  await storage.put(k,{user:a.user,id,x:body.x,y:body.y});
  return res({registered:true});
}
async function devices(storage,a){
  if(a.role!=="owner")return bad("Only owner distributes room keys",403);
  const list=await storage.list({prefix:key(a.file,"device")+":"});
  const allowed=[...list.values()].filter(v=>a.members.includes(v.user));
  const devices=await Promise.all(allowed.map(async v=>({
    user_id:v.user,device_id:v.id,x:v.x,y:v.y,
    ready:!!await storage.get(key(a.file,"envelope",v.user+":"+v.id))
  })));
  return res({devices,initialized:!!await storage.get(key(a.file,"seed"))});
}
async function envelopePut(state,a,body){
  const storage=state.storage;
  if(a.role!=="owner")return bad("Owner authorization required",403);
  const recipient=String(body.to_user||""),to=String(body.to_device||""),from=String(body.from_device||"");
  if(!a.members.includes(recipient)||!UUID.test(to)||!UUID.test(from)||!goodCipher(body,1500))
    return bad("Invalid wrapped encryption key");
  const recipientKey=await storage.get(key(a.file,"device",recipient+":"+to));
  const senderKey=await storage.get(key(a.file,"device",a.user+":"+from));
  if(!recipientKey||!senderKey)return bad("Device not registered",403);
  // Serialize the first room-key envelope. Two owner tabs must not generate
  // divergent AES root keys for the same document/file at the same time.
  let result;
  await state.blockConcurrencyWhile(async()=>{
    const k=key(a.file,"envelope",recipient+":"+to);
    const existing=await storage.get(k);
    if(existing){result=bad("This encryption device already has a wrapped key",409);return}
    const firstKey=key(a.file,"seed");
    const first=await storage.get(firstKey);
    const bootstrap=recipient===a.owner&&from===to;
    if(!first&&!bootstrap){result=bad("Owner must initialize room key before sharing",409);return}
    if(first && bootstrap && first!==from){result=bad("Room key already initialized on another owner device",409);return}
    await storage.put(k,{to_user:recipient,to_device:to,from_device:from,
      iv:body.iv,ct:body.ct,created:Date.now()});
    if(!first)await storage.put(firstKey,from);
    result=res({saved:true});
  });
  return result;
}
async function envelopeGet(storage,a,body){
  const id=String(body.device_id||"");
  if(!UUID.test(id)||!await storage.get(key(a.file,"device",a.user+":"+id)))
    return bad("Unregistered device",403);
  const e=await storage.get(key(a.file,"envelope",a.user+":"+id));
  if(!e)return res({ready:false});
  const owner=await storage.get(key(a.file,"device",a.owner+":"+e.from_device));
  if(!owner)return bad("Owner identity not found",409);
  return res({ready:true,envelope:e,owner_public:{x:owner.x,y:owner.y}});
}
async function send(storage,a,body){
  if(!goodCipher(body,8000)||!UUID.test(body.message_id))return bad("Only sealed AES-GCM messages accepted",422);
  const timestamp=Date.now();
  await storage.put(key(a.file,"msg",String(timestamp).padStart(13,"0")+":"+body.message_id),
    {id:body.message_id,at:timestamp,user_id:a.user,iv:body.iv,ct:body.ct});
  return res({sent:true});
}
async function messages(storage,a){
  const rows=await storage.list({prefix:key(a.file,"msg")+":",reverse:true,limit:80});
  return res({messages:[...rows.values()].reverse()});
}
export async function handleTexFileChatRoom(state,request){
  if(request.method!=="POST")return bad("Method not allowed",405);
  const a=authority(request);
  if(!a)return bad("Invalid verified file chat context",403);
  let body;
  try{
    const raw=await request.text();
    if(new TextEncoder().encode(raw).byteLength>20000)throw Error("too large");
    body=JSON.parse(raw);
    if(!body||typeof body!=="object"||Array.isArray(body))throw Error("bad request");
  }catch{return bad("Invalid or oversized request",400)}
  const storage=state.storage;
  if(body.op==="status")return res({registered:!!await storage.get(key(a.file,"credential",a.user)),
    user_id:a.user,owner_id:a.owner,role:a.role,rp_id:a.rp});
  if(body.op==="begin")return begin(storage,a);
  if(body.op==="verify")return verify(state,a,body);
  if(!await tokenOK(storage,a,body.token))return bad("Passkey verification required for this file",401);
  if(body.op==="device")return device(storage,a,body);
  if(body.op==="devices")return devices(storage,a);
  if(body.op==="envelope-put")return envelopePut(state,a,body);
  if(body.op==="envelope-get")return envelopeGet(storage,a,body);
  if(body.op==="send")return send(storage,a,body);
  if(body.op==="messages")return messages(storage,a);
  return bad("Unknown file chat operation",404);
}
