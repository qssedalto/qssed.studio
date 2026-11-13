import { isLiveTexHead } from "./tex-document-guards.js";
import { invalidateTexCollaboration } from "./tex-collaboration-invalidate.js";
import { SUPABASE_KEY,SUPABASE_URL } from "./config.js";
import { json } from "./routing.js";
import { verifyStudioApiSession,withStudioSessionCookies } from "./session-gate.js";
import { workerLog } from "./server-runtime.js";
import {
 validId,validToken,newSecret,safeRole,safeAudience,loadJson,putJson,loadConfig,loadValidLink,
 documentKey,shareKey,grantKey,requestKey,requestPrefix,shareUrl,safeRequestMetadata,maxBodyBytes
} from "./tex-link-capabilities.js";

const noStore = response => {
  const headers=new Headers(response.headers);
  headers.set("Cache-Control","no-store");
  headers.set("Referrer-Policy","no-referrer");
  return new Response(response.body,{status:response.status,headers});
};
const fail=(error,status=400)=>json({error},status);
const isWrite=method=>["POST","PUT","PATCH","DELETE"].includes(method);
const sameOrigin=request=>{
 const actual=new URL(request.url).origin;
 const origin=request.headers.get("Origin");
 if(origin){try{return new URL(origin).origin===actual;}catch{return false;}}
 return request.headers.get("Sec-Fetch-Site")==="same-origin";
};
const validConfigInput=(x)=>x && typeof x==="object" &&
  typeof x.enabled==="boolean" && (x.audience==="selected"||x.audience==="anyone") &&
  typeof x.request_access==="boolean" && (x.role==="viewer"||x.role==="editor");
async function bodyOf(request){
  if(Number(request.headers.get("Content-Length")||0)>maxBodyBytes)return null;
  try {
    const text=await request.text();
    if(new TextEncoder().encode(text).length>maxBodyBytes)return null;
    const data=JSON.parse(text);
    return data&&typeof data==="object"?data:null;
  } catch {return null;}
}
export async function authorizedUser(token){
  const h={apikey:SUPABASE_KEY,Authorization:"Bearer "+token};
  try {
    const response=await fetch(SUPABASE_URL+"/auth/v1/user",{headers:h});
    if(!response.ok)return null;
    const user=await response.json();
    if(!validId(user?.id))return null;
    const p=await fetch(SUPABASE_URL+"/rest/v1/profiles?select=status,username,display_name&id=eq."+encodeURIComponent(user.id)+"&limit=1",{headers:h});
    if(!p.ok)return null;
    const rows=await p.json();
    const profile=Array.isArray(rows)?rows[0]:null;
    if(profile?.status!=="active")return null;
    return {id:user.id,profile};
  } catch {return null;}
}
async function owned(env,user,doc){
  return validId(doc) && isLiveTexHead(await env.STORAGE.head(documentKey(user,doc)));
}
async function disableSessions(env,owner,doc,target=""){
  return invalidateTexCollaboration(env,owner,doc,"revoke-links",target);
}

function ownerView(config,origin,doc){
  const x=config||{enabled:false,audience:"selected",role:"editor",request_access:true};
  return {
    document_id:doc,enabled:x.enabled===true,audience:safeAudience(x.audience),
    role:safeRole(x.role),request_access:x.audience==="anyone"?false:x.request_access===true,
    url:x.enabled?shareUrl(origin,x):"",
    updated_at:x.updated_at||""
  };
}
async function ownerRead(request,env,user,doc,action){
  if(!(await owned(env,user.id,doc)))return fail("Document not found.",404);
  const config=await loadConfig(env,user.id,doc);
  if(action!=="requests")return json({settings:ownerView(config,new URL(request.url).origin,doc),can_manage:true});
  const items=await env.STORAGE.list({prefix:requestPrefix(user.id,doc),limit:100});
  const values=await Promise.all(items.objects.map(async entry=>{
    const row=await loadJson(env,entry.key);
    return row?.document_id===doc && row?.owner_id===user.id &&
      (row.status==="pending"||row.status==="approved") &&
      config?.enabled && config?.audience==="selected" &&
      row.revision===config.revision?row:null;
  }));
  const visible=values.filter(Boolean);
  return json({
    requests:config?.request_access?visible.filter(x=>x.status==="pending").sort((a,b)=>String(a.requested_at).localeCompare(String(b.requested_at))).slice(0,50):[],
    approved:visible.filter(x=>x.status==="approved").sort((a,b)=>String(a.requested_at).localeCompare(String(b.requested_at))).slice(0,50)
  });
}
async function ownerSave(env,user,body,origin){
  const doc=body?.document_id;
  if(!validId(doc)||!(await owned(env,user.id,doc)))return fail("Document not found.",404);
  if(!validConfigInput(body))return fail("Invalid link-sharing settings.");
  const previous=await loadConfig(env,user.id,doc);
  const enabled=body.enabled;
  const audience=safeAudience(body.audience);
  const role=safeRole(body.role);
  const request_access=audience==="selected" && body.request_access===true;
  // Audience changes or disabling links invalidate every link-derived grant.
  const rotate=!previous||previous.enabled!==enabled||
    previous.audience!==audience||
    body.rotate===true;
  const config={
    owner_id:user.id,document_id:doc,enabled,audience,role,request_access,
    token:rotate?newSecret():previous.token,
    revision:rotate?crypto.randomUUID():previous.revision,
    updated_at:new Date().toISOString()
  };
  await putJson(env,shareKey(user.id,doc),config);
  if(rotate || (previous && previous.role!==role) || !enabled)await disableSessions(env,user.id,doc);
  return json({settings:ownerView(config,origin,doc),saved:true});
}
async function ownerDecide(env,user,body){
  const doc=body?.document_id,requester=body?.requester_id;
  if(!validId(doc)||!validId(requester)||!["approve","decline","revoke"].includes(body.decision)){
    return fail("Invalid access request.");
  }
  if(!(await owned(env,user.id,doc)))return fail("Document not found.",404);
  const config=await loadConfig(env,user.id,doc);
  if(!config?.enabled||config.audience!=="selected"||
    (!config.request_access&&body.decision!=="revoke"))return fail("Access requests are disabled.",409);
  const key=requestKey(user.id,doc,requester);
  const row=await loadJson(env,key);
  if(!row||row.revision!==config.revision||
    (body.decision==="revoke"?row.status!=="approved":row.status!=="pending")){
    return fail("Access request is no longer active.",409);
  }
  const now=new Date().toISOString();
  if(body.decision==="approve"){
    await putJson(env,grantKey(requester,doc),{
      member_id:requester,owner_id:user.id,document_id:doc,
      revision:config.revision,kind:"approved",role:config.role,granted_at:now
    });
  }
  if(body.decision==="revoke"){
    const grant=await loadJson(env,grantKey(requester,doc));
    if(grant?.kind==="approved"&&grant.owner_id===user.id&&grant.revision===config.revision){
      await env.STORAGE.delete(grantKey(requester,doc));
      await disableSessions(env,user.id,doc,requester);
    }
  }
  await putJson(env,key,{...row,status:body.decision==="approve"?"approved":
    body.decision==="revoke"?"revoked":"declined",resolved_at:now});
  return json({ok:true,decision:body.decision});
}
async function visitorAction(env,user,body,action){
  const owner=body?.owner_id,doc=body?.document_id,token=body?.token;
  if(!validId(owner)||!validId(doc)||!validToken(token))return fail("Invalid link.",404);
  const config=await loadValidLink(env,owner,doc,token);
  if(!config)return fail("Link is unavailable or has been revoked.",404);
  if(user.id===owner)return json({status:"owner",document_id:doc});
  if(action==="redeem"){
    if(config.audience!=="anyone")return fail("This link requires an invitation or approved access request.",403);
    await putJson(env,grantKey(user.id,doc),{
      owner_id:owner,document_id:doc,member_id:user.id,
      revision:config.revision,kind:"link",granted_at:new Date().toISOString()
    });
    return json({status:"joined",document_id:doc,role:config.role});
  }
  if(action!=="request")return fail("Unsupported link action.",400);
  if(config.audience!=="selected"||!config.request_access)return fail("Access requests are unavailable.",403);
  const key=requestKey(owner,doc,user.id);
  const prior=await loadJson(env,key);
  if(prior?.revision===config.revision){
    if(prior.status==="pending")return json({status:"pending"});
    if(prior.status==="approved")return json({status:"approved",document_id:doc});
    if(prior.status==="declined" && Date.now()-Date.parse(prior.resolved_at||"")<24*3600*1000){
      return fail("This access request was declined. Try again later.",429);
    }
  }
  const row={
    owner_id:owner,document_id:doc,revision:config.revision,status:"pending",
    ...safeRequestMetadata(user.profile,user.id),requested_at:new Date().toISOString()
  };
  await putJson(env,key,row);
  return json({status:"pending"},202);
}
export async function handleTexLinkSharingApi(request,env){
  if(!env?.STORAGE)return fail("Document storage unavailable.",503);
  if(isWrite(request.method) && !sameOrigin(request))return fail("Cross-origin writes are forbidden.",403);
  const session=await verifyStudioApiSession(request);
  if(!session.ok)return withStudioSessionCookies(fail("Sign in to your AERTEX account.",401),session.cookies);
  const user=await authorizedUser(session.accessToken);
  if(!user)return withStudioSessionCookies(fail("A verified active account is required.",403),session.cookies);
  const url=new URL(request.url),action=url.searchParams.get("action")||"";
  try {
    let result;
    if(request.method==="GET") {
      const doc=url.searchParams.get("document");
      result=validId(doc)?await ownerRead(request,env,user,doc,action):fail("Invalid document.",400);
    }else {
      const body=await bodyOf(request);
      if(!body)return fail("Invalid or oversized request.",400);
      if(request.method==="PUT")result=await ownerSave(env,user,body,url.origin);
      else if(request.method==="PATCH" && action==="decide")result=await ownerDecide(env,user,body);
      else if(request.method==="POST" && (action==="request"||action==="redeem")){
        result=await visitorAction(env,user,body,action);
      }else result=fail("Unsupported request.",405);
    }
    return withStudioSessionCookies(noStore(result),session.cookies);
  }catch(err){
    workerLog("error","tex.links.api_failed",{user_id:user.id,action,reason:String(err?.message||err).slice(0,180)});
    return withStudioSessionCookies(fail("Link-sharing service is temporarily unavailable.",503),session.cookies);
  }
}
