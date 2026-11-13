import { readJsonBounded } from "./request-json-bounded.js";
import { randomKey, hashText, verifyRegistration, verifyAssertion } from "./tex-file-chat-webauthn.js";
// Durable Object receives authority context ONLY from verified Work Worker.
// Store ciphertext and wrapped AES keys, never message text or raw room keys.
const BASE="projectchat:v2:",CHALLENGE_MS=120000,LEASE_MS=3*60*60*1000,GRANT_LIMIT=12,MAX_PASSKEYS=5;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HASH=/^[A-Za-z0-9_-]{43}$/;
const res=(body,status=200)=>Response.json(body,{status,headers:{"cache-control":"no-store","x-content-type-options":"nosniff"}});
const bad=(reason,status=400)=>res({error:reason},status);
const key=(project,kind,id="")=>BASE+project+":"+kind+(id?":"+id:"");
const goodCipher=(o,max=12000)=>o&&typeof o.iv==="string"&&/^[A-Za-z0-9_-]{16}$/.test(o.iv)
  &&typeof o.ct==="string"&&o.ct.length<=max&&/^[A-Za-z0-9_-]{24,12000}$/.test(o.ct);
const goodPub=o=>HASH.test(String(o?.x||""))&&HASH.test(String(o?.y||""));
function decodeDisplayName(value){
  try{return decodeURIComponent(value).replace(/[\u0000-\u001f\u007f]/g," ").trim().slice(0,80)}
  catch{return ""}
}
function authority(request){
  const h=request.headers,u=h.get("X-Qsseda-Chat-User")||"",own=h.get("X-Qsseda-Chat-Owner")||"",
    project=h.get("X-Qsseda-Chat-Project")||"",rp=h.get("X-Qsseda-Chat-Rp")||"",
    origin=h.get("X-Qsseda-Chat-Origin")||"",role=h.get("X-Qsseda-Chat-Role")||"",
    members=(h.get("X-Qsseda-Chat-Allowed")||"").split(",").filter(Boolean),
    displayName=decodeDisplayName(h.get("X-Qsseda-Chat-Display-Name")||""),
    username=(h.get("X-Qsseda-Chat-Username")||"").replace(/[^a-zA-Z0-9_.-]/g,"").slice(0,40);
  if(!UUID.test(u)||!UUID.test(own)||!HASH.test(project)||
    !["owner","editor","viewer"].includes(role)||!members.includes(u)||
    members.length>100||!members.every(m=>UUID.test(m))||
    !/^work\.qsseda\.(com|studio)$/.test(rp)||origin!=="https://"+rp)return null;
  return {user:u,owner:own,project,rp,origin,role,members,displayName,username};
}
async function tokenOK(storage,a,token){
  if(!HASH.test(String(token||"")))return false;
  const digest=await hashText(token);
  const k=key(a.project,"grant",a.user+":"+digest),record=await storage.get(k);
  if(!record)return false;
  if(record.user!==a.user||record.digest!==digest||record.expires<=Date.now()){
    await storage.delete(k);return false;
  }
  return true;
}
async function credentialsFor(storage,a){
  const result=[];
  const legacyKey=key(a.project,"credential",a.user),legacy=await storage.get(legacyKey);
  if(legacy)result.push({key:legacyKey,record:legacy});
  const extras=await storage.list({prefix:key(a.project,"credential-extra",a.user)+":"});
  for(const [k,record] of extras)result.push({key:k,record});
  return result;
}
async function begin(storage,a,body={}){
  const existing=await credentialsFor(storage,a);
  const enroll=body.action==="enroll-device";
  if(enroll){
    if(!existing.length||!await tokenOK(storage,a,body.token))
      return bad("Verify an existing project Passkey before adding a new device",401);
    if(existing.length>=MAX_PASSKEYS)return bad("Five Passkeys limit reached for this project",429);
  }
  const mode=enroll?"create-add":existing.length?"get":"create";
  const challenge=randomKey(),id=crypto.randomUUID();
  await storage.put(key(a.project,"challenge",a.user),
    {mode,challenge,id,created:Date.now(),origin:a.origin,rp:a.rp});
  const publicKey=mode!=="get"?{
    rp:{id:a.rp,name:"AERTEX Work 项目协作聊天"},
    user:{id:(await hashText("projectchat:"+a.project+":"+a.user)).slice(0,43),
      name:a.user.slice(0,8)+"-"+a.project.slice(0,9),displayName:"AERTEX · 项目协作聊天"},
    challenge,pubKeyCredParams:[{type:"public-key",alg:-7}],
    timeout:90000,attestation:"none",
    authenticatorSelection:{residentKey:"required",requireResidentKey:true,userVerification:"required"},
    excludeCredentials:mode==="create-add"?
      existing.map(x=>({id:x.record.id,type:"public-key"})):[]
  }:{
    challenge,rpId:a.rp,timeout:90000,userVerification:"required",
    allowCredentials:existing.map(x=>({id:x.record.id,type:"public-key"}))
  };
  return res({mode,challenge_id:id,public_key:publicKey});
}
async function verify(state,a,body){
  const storage=state.storage,challengeKey=key(a.project,"challenge",a.user);
  let pending;
  await state.blockConcurrencyWhile(async()=>{
    pending=await storage.get(challengeKey);
    if(pending)await storage.delete(challengeKey);
  });
  if(!pending||pending.id!==body.challenge_id||Date.now()-pending.created>CHALLENGE_MS||
      pending.origin!==a.origin||pending.rp!==a.rp)return bad("WebAuthn challenge expired or reused",403);
  const credentialKey=key(a.project,"credential",a.user);
  try{
    const registered=await credentialsFor(storage,a);
    if(pending.mode==="create"||pending.mode==="create-add"){
      if(pending.mode==="create"&&registered.length)return bad("This project already has a Passkey",409);
      if(pending.mode==="create-add"){
        if(!await tokenOK(storage,a,body.token))
          return bad("Existing project Passkey authorization is required",401);
        if(!registered.length||registered.length>=MAX_PASSKEYS)
          return bad("No existing Passkey or Passkey device limit reached",409);
      }
      const record=await verifyRegistration(body.credential,pending.challenge,a.origin,a.rp);
      if(registered.some(x=>x.record.id===record.id))
        return bad("Passkey already registered for this project",409);
      const k=pending.mode==="create"?credentialKey:
        key(a.project,"credential-extra",a.user+":"+await hashText(record.id));
      await storage.put(k,{...record,rp:a.rp,created:Date.now()});
    }else if(pending.mode==="get"){
      const selected=registered.find(x=>x.record.id===body.credential?.rawId);
      if(!selected||selected.record.rp!==a.rp)return bad("Project Passkey not found",403);
      const checked=await verifyAssertion(body.credential,pending.challenge,a.origin,a.rp,selected.record);
      await storage.put(selected.key,{...selected.record,...checked});
    }else return bad("Unsupported Passkey operation",400);
  }catch{return bad("Project Passkey verification failed",403)}
  const token=randomKey(),digest=await hashText(token),now=Date.now();
  const prefix=key(a.project,"grant",a.user)+":";
  const grants=await storage.list({prefix});
  const live=[];
  for(const [k,v] of grants){
    if(v.expires<=now)await storage.delete(k);
    else live.push([k,v]);
  }
  live.sort((x,y)=>x[1].created-y[1].created);
  for(let i=0;i<=live.length-GRANT_LIMIT;i++)await storage.delete(live[i][0]);
  await storage.put(prefix+digest,{user:a.user,digest,created:now,expires:now+LEASE_MS});
  return res({verified:true,token,expires_in:Math.floor(LEASE_MS/1000),
    new_credential:pending.mode!=="get",
    owner_id:a.owner,user_id:a.user,role:a.role});
}
async function device(storage,a,body){
  const id=String(body.device_id||"");
  if(!UUID.test(id)||!goodPub(body))return bad("Invalid encryption device");
  try{
    await crypto.subtle.importKey("jwk",{kty:"EC",crv:"P-256",x:body.x,y:body.y,ext:true},
      {name:"ECDH",namedCurve:"P-256"},false,[]);
  }catch{return bad("Invalid device public key")}
  const k=key(a.project,"device",a.user+":"+id),existing=await storage.get(k);
  if(existing&&(existing.x!==body.x||existing.y!==body.y))return bad("Trusted device public key cannot silently change",409);
  if(!existing){
    const previous=await storage.list({prefix:key(a.project,"device",a.user+":")});
    if(previous.size>=5)return bad("Five device limit reached for this project",429);
  }
  await storage.put(k,{user:a.user,id,x:body.x,y:body.y});
  return res({registered:true});
}
async function devices(storage,a){
  // Verified members may obtain one another's project-scoped ECDH public keys.
  // This is NOT permission to access any private key or plaintext.
  const list=await storage.list({prefix:key(a.project,"device")+":"});
  const allowed=[...list.values()].filter(v=>a.members.includes(v.user));
  const devices=await Promise.all(allowed.map(async v=>({
    user_id:v.user,device_id:v.id,x:v.x,y:v.y,
    ready:!!await storage.get(key(a.project,"envelope",v.user+":"+v.id))
  })));
  return res({devices,initialized:!!await storage.get(key(a.project,"seed"))});
}
async function envelopePut(state,a,body){
  const storage=state.storage;
  if(a.role!=="owner")return bad("Owner authorization required",403);
  const recipient=String(body.to_user||""),to=String(body.to_device||""),from=String(body.from_device||"");
  if(!a.members.includes(recipient)||!UUID.test(to)||!UUID.test(from)||!goodCipher(body,1500))
    return bad("Invalid wrapped encryption key");
  const recipientKey=await storage.get(key(a.project,"device",recipient+":"+to));
  const senderKey=await storage.get(key(a.project,"device",a.user+":"+from));
  if(!recipientKey||!senderKey)return bad("Device not registered",403);
  // Serialize the first room-key envelope. Two owner tabs must not generate
  // divergent AES root keys for the same project at the same time.
  let result;
  await state.blockConcurrencyWhile(async()=>{
    const k=key(a.project,"envelope",recipient+":"+to);
    const existing=await storage.get(k);
    if(existing){result=bad("This encryption device already has a wrapped key",409);return}
    const firstKey=key(a.project,"seed");
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
  if(!UUID.test(id)||!await storage.get(key(a.project,"device",a.user+":"+id)))
    return bad("Unregistered device",403);
  const e=await storage.get(key(a.project,"envelope",a.user+":"+id));
  if(!e)return res({ready:false});
  const owner=await storage.get(key(a.project,"device",a.owner+":"+e.from_device));
  if(!owner)return bad("Owner identity not found",409);
  return res({ready:true,envelope:e,owner_public:{x:owner.x,y:owner.y}});
}
async function send(storage,a,body){
  if(!goodCipher(body,8000)||!UUID.test(body.message_id)||body.text!==undefined||body.message!==undefined)
    return bad("Only sealed AES-GCM messages accepted",422);
  const timestamp=Date.now();
  const record={id:body.message_id,at:timestamp,user_id:a.user,
    sender_name:a.displayName||a.username||a.user.slice(0,8),
    iv:body.iv,ct:body.ct};
  if(body.v===3){
    const from=String(body.from_device||"");
    const sender=UUID.test(from)?await storage.get(key(a.project,"device",a.user+":"+from)):null;
    if(!sender)return bad("Authenticated sender encryption device required",403);
    const list=await storage.list({prefix:key(a.project,"device")+":"});
    const accepted=[...list.values()].filter(d=>a.members.includes(d.user));
    const recipients=body.envelopes;
    if(!Array.isArray(recipients)||recipients.length<1||recipients.length>500||
       recipients.length!==accepted.length)return bad("Refresh recipient keys before sending",409);
    const mustCover=new Set(accepted.map(d=>d.user+":"+d.id));
    for(const envelope of recipients){
      const toUser=String(envelope?.to_user||""),toDevice=String(envelope?.to_device||"");
      const id=toUser+":"+toDevice;
      if(!mustCover.has(id)||!goodCipher(envelope,600))return bad("Invalid recipient key envelope",422);
      mustCover.delete(id);
    }
    if(mustCover.size)return bad("Missing encrypted recipient",409);
    record.v=3;record.from_device=from;
    record.sender_public={x:sender.x,y:sender.y};
    record.envelopes=recipients.map(e=>({
      to_user:e.to_user,to_device:e.to_device,iv:e.iv,ct:e.ct
    }));
  }else if(body.v!==undefined&&body.v!==2)return bad("Unsupported encryption version",422);
  await storage.put(key(a.project,"msg",String(timestamp).padStart(13,"0")+":"+body.message_id),record);
  return res({sent:true});
}
async function latest(storage,a){
  const rows=await storage.list({prefix:key(a.project,"msg")+":",reverse:true,limit:1});
  const last=[...rows.values()][0];
  return res({last:last?{id:last.id,at:last.at,user_id:last.user_id,
    sender_name:last.sender_name||last.user_id?.slice(0,8)}:null});
}
async function messages(storage,a,body){
  const rows=await storage.list({prefix:key(a.project,"msg")+":",reverse:true,limit:80});
  const id=String(body.device_id||"");
  const known=UUID.test(id)&&!!await storage.get(key(a.project,"device",a.user+":"+id));
  if(!known)return bad("A verified project encryption device is required",403);
  const records=[...rows.values()].reverse().map(msg=>{
    if(msg.v!==3)return msg;
    // Never expose another member's wrapped message key to the requesting
    // device; legacy room history is still stored but not silently rekeyed.
    const mine=(msg.envelopes||[]).find(e=>e.to_user===a.user&&e.to_device===id);
    return {id:msg.id,at:msg.at,user_id:msg.user_id,sender_name:msg.sender_name,
      v:3,from_device:msg.from_device,sender_public:msg.sender_public,iv:msg.iv,ct:msg.ct,
      envelope:mine?{iv:mine.iv,ct:mine.ct}:null};
  });
  return res({messages:records});
}
export async function handleTexFileChatRoom(state,request){
  if(request.method!=="POST")return bad("Method not allowed",405);
  const a=authority(request);
  if(!a)return bad("Invalid verified project chat context",403);
  let body;
  try{
    body=await readJsonBounded(request,160000);
    if(!body||typeof body!=="object"||Array.isArray(body))throw Error("bad request");
  }catch(error){return bad("Invalid or oversized request",error?.status||400)}
  const storage=state.storage;
  if(body.op==="status"){const registered=await credentialsFor(storage,a);
    return res({registered:registered.length>0,passkey_count:registered.length,
      user_id:a.user,owner_id:a.owner,role:a.role,rp_id:a.rp});
  }
  // The notification contains metadata only; encrypted content remains
  // inaccessible until the user's project-specific Passkey is verified.
  if(body.op==="latest")return latest(storage,a);
  if(body.op==="begin")return begin(storage,a,body);
  if(body.op==="verify")return verify(state,a,body);
  if(!await tokenOK(storage,a,body.token))return bad("Passkey verification required for this project",401);
  // Server-side revalidation of a previously signed, project/user-scoped grant.
  // Never extend the original three-hour absolute deadline on resume.
  if(body.op==="resume"){
    const digest=await hashText(body.token);
    const grant=await storage.get(key(a.project,"grant",a.user+":"+digest));
    if(!grant||grant.expires<=Date.now())return bad("Passkey grant expired",401);
    return res({verified:true,expires_in:Math.max(1,Math.ceil((grant.expires-Date.now())/1000)),
      owner_id:a.owner,user_id:a.user,role:a.role});
  }
  if(body.op==="device")return device(storage,a,body);
  if(body.op==="devices")return devices(storage,a);
  if(body.op==="envelope-put")return envelopePut(state,a,body);
  if(body.op==="envelope-get")return envelopeGet(storage,a,body);
  if(body.op==="send")return send(storage,a,body);
  if(body.op==="messages")return messages(storage,a,body);
  return bad("Unknown project chat operation",404);
}
