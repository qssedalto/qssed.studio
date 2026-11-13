import { isLiveTexHead } from "./tex-document-guards.js";
// Owner-scoped capability links and short-lived account-specific approvals.
// All link settings and grants live in private R2; never derive permissions
// directly from UI flags or unverified client claims.
import { isStorageObjectId } from "./storage-api.js";

const DOC_ROOT="_system/tex-documents/";
const LINK_ROOT="_system/tex-share-links/";
const GRANT_ROOT="_system/tex-share-grants/";
const REQUEST_ROOT="_system/tex-share-requests/";
const encoder=new TextEncoder();

export const validId = value => typeof value==="string" && isStorageObjectId(value);
export const validToken = value => typeof value==="string" && /^[a-zA-Z0-9_-]{43}$/.test(value);
export const documentKey = (owner,doc)=>DOC_ROOT+owner+"/"+doc+".json";
export const shareKey = (owner,doc)=>LINK_ROOT+owner+"/"+doc+".json";
export const grantKey = (user,doc)=>GRANT_ROOT+user+"/"+doc+".json";
export const requestKey = (owner,doc,user)=>REQUEST_ROOT+owner+"/"+doc+"/"+user+".json";

export function newSecret() {
  const bytes=crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
export function safeRole(input){return input==="viewer"?"viewer":"editor";}
export function safeAudience(input){return input==="anyone"?"anyone":"selected";}
export function constantTimeToken(a,b) {
  if(!validToken(a)||!validToken(b))return false;
  let difference=0;
  for(let i=0;i<a.length;i++) difference |= a.charCodeAt(i)^b.charCodeAt(i);
  return difference===0;
}
export async function loadJson(env,key){
  const object=await env?.STORAGE?.get(key);
  if(!object)return null;
  try{return JSON.parse(await object.text());}catch{return null;}
}
export async function putJson(env,key,value){
  return env.STORAGE.put(key,JSON.stringify(value),{
    httpMetadata:{contentType:"application/json;charset=UTF-8"}
  });
}
export async function loadConfig(env,owner,doc) {
  if(!validId(owner)||!validId(doc))return null;
  const config=await loadJson(env,shareKey(owner,doc));
  if(!config||config.owner_id!==owner||config.document_id!==doc)return null;
  if(!validToken(config.token)||!validId(config.revision))return null;
  return config;
}
export async function loadValidLink(env,owner,doc,token) {
  if(!validId(owner)||!validId(doc)||!validToken(token))return null;
  const config=await loadConfig(env,owner,doc);
  if(!config?.enabled || !constantTimeToken(config.token,token))return null;
  if(!isLiveTexHead(await env.STORAGE.head(documentKey(owner,doc))))return null;
  return config;
}
export async function resolveLinkGrant(env,userId,docId){
  if(!validId(userId)||!validId(docId))return null;
  const grant=await loadJson(env,grantKey(userId,docId));
  if(!grant||grant.member_id!==userId||grant.document_id!==docId||!validId(grant.owner_id))return null;
  const config=await loadConfig(env,grant.owner_id,docId);
  if(!config?.enabled||grant.revision!==config.revision)return null;
  if(!isLiveTexHead(await env.STORAGE.head(documentKey(grant.owner_id,docId))))return null;
  if(grant.kind==="link" && config.audience==="anyone"){
    return {owner_id:grant.owner_id,role:safeRole(config.role),via_link:true};
  }
  if(grant.kind==="approved" && config.audience==="selected"){
    return {owner_id:grant.owner_id,role:safeRole(grant.role),via_link:true};
  }
  return null;
}
export async function readPublicDocument(env,owner,doc) {
  const value=await loadJson(env,documentKey(owner,doc));
  if(!value||value.document_deleted||value.owner_id!==owner||value.id!==doc)return null;
  const files=(Array.isArray(value.files)?value.files:[]).filter(f=>
    typeof f?.name==="string" && f.name.length<=140 &&
    (f.encoding==="utf8"||f.encoding==="base64") &&
    typeof f.content==="string" && f.content.length<=6*1024*1024);
  return {
    id:doc,owner_id:owner,title:String(value.title||"TeX document").slice(0,180),
    source:String(value.source||""),files
  };
}
export function shareUrl(origin,config){
  return origin+"/share/tex/"+config.owner_id+"/"+config.document_id+"/"+config.token;
}
export function safeRequestMetadata(profile,userId){
  return {
    requester_id:userId,
    username:String(profile?.username||"").slice(0,80).replace(/[\u0000-\u001f]/g,""),
    display_name:String(profile?.display_name||"").slice(0,120).replace(/[\u0000-\u001f]/g,"")
  };
}
export const requestPrefix=(owner,doc)=>REQUEST_ROOT+owner+"/"+doc+"/";
export const maxBodyBytes=8192;
