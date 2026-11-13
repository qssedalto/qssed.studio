// Durable Object receives authority context ONLY from verified Work Worker.
// Store ciphertext and wrapped AES keys, never message text or raw room keys.
const BASE="projectchat:v2:";
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
  if(a.role!=="owner")return bad("Only owner distributes room keys",403);
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
  if(!goodCipher(body,8000)||!UUID.test(body.message_id))return bad("Only sealed AES-GCM messages accepted",422);
  const timestamp=Date.now();
  await storage.put(key(a.project,"msg",String(timestamp).padStart(13,"0")+":"+body.message_id),
    {id:body.message_id,at:timestamp,user_id:a.user,
    sender_name:a.displayName||a.username||a.user.slice(0,8),
    iv:body.iv,ct:body.ct});
  return res({sent:true});
}
async function latest(storage,a){
  const rows=await storage.list({prefix:key(a.project,"msg")+":",reverse:true,limit:1});
  const last=[...rows.values()][0];
  return res({last:last?{id:last.id,at:last.at,user_id:last.user_id,
    sender_name:last.sender_name||last.user_id?.slice(0,8)}:null});
}
async function messages(storage,a){
  const rows=await storage.list({prefix:key(a.project,"msg")+":",reverse:true,limit:80});
  return res({messages:[...rows.values()].reverse()});
}
export async function handleTexFileChatRoom(state,request){
  if(request.method!=="POST")return bad("Method not allowed",405);
  const a=authority(request);
  if(!a)return bad("Invalid verified project chat context",403);
  let body;
  try{
    const raw=await request.text();
    if(new TextEncoder().encode(raw).byteLength>20000)throw Error("too large");
    body=JSON.parse(raw);
    if(!body||typeof body!=="object"||Array.isArray(body))throw Error("bad request");
  }catch{return bad("Invalid or oversized request",400)}
  const storage=state.storage;
  // The Worker already verified the signed-in active account, same-origin
  // request, project ACL and current named-collaborator membership before
  // forwarding. Never accept browser-supplied authority headers directly.
  if(body.op==="status")return res({user_id:a.user,owner_id:a.owner,role:a.role,
    username:a.username,display_name:a.displayName});
  if(body.op==="begin"||body.op==="verify")
    return bad("Project chat does not require a Passkey",410);
  if(body.op==="latest")return latest(storage,a);
  if(body.op==="device")return device(storage,a,body);
  if(body.op==="devices")return devices(storage,a);
  if(body.op==="envelope-put")return envelopePut(state,a,body);
  if(body.op==="envelope-get")return envelopeGet(storage,a,body);
  if(body.op==="send")return send(storage,a,body);
  if(body.op==="messages")return messages(storage,a);
  return bad("Unknown project chat operation",404);
}
