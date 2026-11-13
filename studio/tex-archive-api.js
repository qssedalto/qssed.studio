import { json } from "./routing.js";
import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { isSafeProjectFilename } from "./tex-project-file-types.js";
import { purgeDocumentVersions } from "./tex-version-api.js";
import { removeTexProjectPins, syncTexProjectPins } from "./tex-organize-api.js";

const ROOT = "_system/tex-archive/";
const DOC_ROOT = "_system/tex-documents/";
const RUN_ROOT = "_system/tex-runs/";
const CONFIG_ROOT = "_system/tex-vault/";
const MAX_BODY = 66 * 1024 * 1024;
const MAX_ITEMS = 120;
const ID = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const enc = new TextEncoder();
const fail = (error,status=400) => json({error},status);
const configKey = uid => CONFIG_ROOT + uid + "/config.json";
const archivePrefix = uid => ROOT + uid + "/";
const archiveKey = (uid,id) => archivePrefix(uid) + id + ".json";
const docKey = (uid,id) => DOC_ROOT + uid + "/" + id + ".json";
const validB64 = (s,max=MAX_BODY) => typeof s === "string" && s.length>0 && s.length<=max && /^[A-Za-z0-9+/]+={0,2}$/.test(s);
const validIv = s => validB64(s,32) && s.length === 16;
const validSalt = s => validB64(s,32) && s.length >= 22;
const sealed = obj => obj && validIv(obj.iv) && validB64(obj.data) &&
  validIv(obj.titleIv) && validB64(obj.titleData,1000);
const jsonObj = async (request,max=MAX_BODY) => {
  if (Number(request.headers.get("content-length") || 0)>max) throw new Error("Request too large.");
  const raw=await request.text();
  if (enc.encode(raw).byteLength>max) throw new Error("Request too large.");
  return JSON.parse(raw || "{}");
};
async function config(env,userId) {
  const blob=await env.STORAGE.get(configKey(userId));
  return blob ? JSON.parse(await blob.text()) : null;
}
async function listArchive(env,userId) {
  const items=[];let cursor;
  do {
    const page=await env.STORAGE.list({prefix:archivePrefix(userId),cursor,limit:250,include:["customMetadata"]});
    for (const entry of page.objects) {
      const id=entry.key.slice(archivePrefix(userId).length).replace(/\.json$/,"");
      if(ID.test(id))items.push({id,created_at:entry.customMetadata?.archivedAt||entry.uploaded?.toISOString?.()||""});
    }
    cursor=page.truncated ? page.cursor : undefined;
  } while(cursor && items.length<MAX_ITEMS+1);
  return items;
}
async function clearPrefix(env,prefix) {
  let cursor;
  do {
    const page=await env.STORAGE.list({prefix,cursor,limit:500});
    if(page.objects.length)await env.STORAGE.delete(page.objects.map(entry=>entry.key));
    cursor=page.truncated ? page.cursor : undefined;
  }while(cursor);
}
async function currentPasswordConfirmed(user,password) {
  if (!user?.email || typeof password !== "string" || password.length<1 || password.length>256) return false;
  const r=await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=password",{
    method:"POST",headers:{"apikey":SUPABASE_KEY,"content-type":"application/json"},
    body:JSON.stringify({email:user.email,password})
  });
  if(!r.ok)return false;
  const result=await r.json().catch(()=>({}));
  return result?.user?.id === user.id && typeof result.access_token === "string";
}
function validRestored(doc,id,userId) {
  if(!doc || doc.id!==id || typeof doc.title!=="string" || !doc.title.trim() || doc.title.length>180 ||
    typeof doc.source!=="string" || doc.source.length>180000 ||
    !["xelatex","pdflatex","lualatex"].includes(doc.engine) ||
    !Array.isArray(doc.files) || doc.files.length>499) return false;
  const names=new Set(["main.tex"]);let total=enc.encode(doc.source).length;
  for(const item of doc.files){
    if(!isSafeProjectFilename(item?.name) || !["utf8","base64"].includes(item.encoding) ||
      typeof item.content!=="string" || names.has(item.name.toLowerCase()))return false;
    names.add(item.name.toLowerCase());
    let len=0;
    if(item.encoding==="utf8") len=enc.encode(item.content).length;
    else {
      if(!validB64(item.content,12*1024*1024))return false;
      try{len=atob(item.content).length;}catch{return false;}
    }
    if(len>8*1024*1024)return false;
    total+=len;if(total>32*1024*1024)return false;
  }
  return total<=32*1024*1024;
}
const documentMeta = (doc,userId)=>({
  ownerId:userId,hidden:"true",kind:"tex-document",
  title:doc.title,engine:doc.engine,preview:String(doc.source).replace(/\s+/g," ").trim().slice(0,220),
  projectType:doc.project_type||"restored",fileCount:String(1+doc.files.length),
  pinned:doc.pinned?"true":"false",locked:doc.locked?"true":"false",
  createdAt:doc.created_at,updatedAt:doc.updated_at
});
export async function handleTexArchive(request,env,user) {
  if(!env?.STORAGE)return fail("Archive storage unavailable.",503);
  const userId=user?.id;
  if(!ID.test(userId||""))return fail("Unauthorized.",401);
  const url=new URL(request.url), mode=url.searchParams.get("mode")||"config";
  if(request.method==="GET"){
    if(mode==="config"){
      const existing=await config(env,userId);
      return json(existing ? {created:true,salt:existing.salt,iv:existing.iv,check:existing.check,iterations:existing.iterations} : {created:false});
    }
    if(mode==="list")return json({items:await listArchive(env,userId)});
    if(mode==="item"){
      const id=url.searchParams.get("id");
      if(!ID.test(id||""))return fail("Invalid archive ID.");
      const blob=await env.STORAGE.get(archiveKey(userId,id));
      return blob ? json({archive:JSON.parse(await blob.text())}) : fail("Archive not found.",404);
    }
    return fail("Invalid archive request.",404);
  }
  if(request.method==="DELETE" && mode==="item"){
    const id=url.searchParams.get("id");
    if(!ID.test(id||""))return fail("Invalid archive ID.");
    await env.STORAGE.delete(archiveKey(userId,id));
    return json({deleted:true});
  }
  if(request.method!=="POST")return fail("Method not allowed.",405);
  let body;
  try{body=await jsonObj(request,mode==="store"?MAX_BODY:mode==="restore"?MAX_BODY:4096);}
  catch(error){return fail(error?.message==="Request too large."?"Request too large.":"Malformed archive request.",400);}
  if(mode==="config"){
    if(await config(env,userId))return fail("Archive password already created.",409);
    if(!validSalt(body.salt)||!validIv(body.iv)||!validB64(body.check,300)||
      body.iterations!==900000)return fail("Invalid archive key settings.");
    await env.STORAGE.put(configKey(userId),JSON.stringify({
      salt:body.salt,iv:body.iv,check:body.check,iterations:900000,created_at:new Date().toISOString()
    }),{httpMetadata:{contentType:"application/json;charset=UTF-8"}});
    return json({created:true});
  }
  if(mode==="reset"){
    const current=await config(env,userId);
    if(!current)return fail("No archive password exists.",404);
    const now=Date.now();
    if(current.failedUntil && current.failedUntil>now)return fail("Too many attempts. Try again later.",429);
    let success=false;
    try{success=await currentPasswordConfirmed(user,body?.account_password);}
    catch{return fail("Account authentication temporarily unavailable.",503);}
    if(!success){
      const failureCount=Number(current.failedCount||0)+1;
      await env.STORAGE.put(configKey(userId),JSON.stringify({
        ...current,failedCount:failureCount,
        failedUntil:failureCount>=5?now+15*60*1000:0
      }),{httpMetadata:{contentType:"application/json;charset=UTF-8"}});
      return fail("Incorrect account password. No archived files were changed.",403);
    }
    await clearPrefix(env,archivePrefix(userId));
    await env.STORAGE.delete(configKey(userId));
    return json({reset:true,archives_deleted:true});
  }
  const state=await config(env,userId);
  if(!state)return fail("Create an archive password first.",409);
  const id=String(body?.id||"");
  if(!ID.test(id))return fail("Invalid project ID.");
  if(mode==="store"){
    if(!sealed(body.encrypted))return fail("Invalid encrypted project envelope.",400);
    if((await listArchive(env,userId)).length>=MAX_ITEMS)return fail("Archive capacity reached.",409);
    if(await env.STORAGE.head(archiveKey(userId,id)))return fail("This project is already archived.",409);
    const stored=await env.STORAGE.get(docKey(userId,id));
    if(!stored)return fail("Project does not exist.",404);
    const doc=JSON.parse(await stored.text());
    if(doc.id!==id||doc.owner_id!==userId)return fail("Only the owner can archive a project.",403);
    if(doc.locked)return fail("Unlock the project before archiving.",423);
    if(String(doc.updated_at)!==String(body.updated_at))return fail("The project changed during encryption. Save and try again.",409);
    const archivedAt=new Date().toISOString();
    await env.STORAGE.put(archiveKey(userId,id),JSON.stringify({
      v:1,id,encrypted:body.encrypted,archived_at:archivedAt
    }),{httpMetadata:{contentType:"application/json;charset=UTF-8"},
       customMetadata:{ownerId:userId,kind:"tex-encrypted-archive",archivedAt}});
    await env.STORAGE.delete(docKey(userId,id));
    await removeTexProjectPins(env,userId,id);
    await clearPrefix(env,RUN_ROOT+userId+"/"+id+"/");
    await purgeDocumentVersions(env,userId,id);
    return json({archived:true,id});
  }
  if(mode==="restore"){
    if(!await env.STORAGE.head(archiveKey(userId,id)))return fail("Encrypted archive not found.",404);
    if(await env.STORAGE.head(docKey(userId,id)))return fail("The project already exists. Refusing to overwrite it.",409);
    const restored=body.document;
    if(!validRestored(restored,id,userId))return fail("Restored project is invalid or too large.",400);
    const now=new Date().toISOString();
    const doc={...restored,id,owner_id:userId,created_at:restored.created_at||now,
      updated_at:now,locked:false,locked_files:[],locked_folders:[]};
    await env.STORAGE.put(docKey(userId,id),JSON.stringify(doc),{
      httpMetadata:{contentType:"application/json;charset=UTF-8"},
      customMetadata:documentMeta(doc,userId)
    });
    await syncTexProjectPins(env,userId,doc);
    await env.STORAGE.delete(archiveKey(userId,id));
    return json({restored:true,document:doc});
  }
  return fail("Unknown archive operation.",404);
}
