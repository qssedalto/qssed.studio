import { retireTexSource } from './tex-collaboration-retire.js';
import { purgeTexCollaborationHistory } from "./tex-collaboration-history.js";
import { readJsonBounded } from "./request-json-bounded.js";
import { isTexMainLocked, texDocumentRevision, putTexDocument, TEX_WRITE_CONFLICT } from "./tex-document-guards.js";
import { workerLog } from "./server-runtime.js";
import { json } from "./routing.js";
import { texRealtimeEpoch } from "./tex-realtime-epoch.js";
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
      if(ID.test(id))items.push({id,created_at:entry.customMetadata?.archivedAt||entry.uploaded?.toISOString?.()||"",cleanup_pending:entry.customMetadata?.cleanupComplete!=="true"});
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
    body:JSON.stringify({email:user.email,password}),signal:AbortSignal.timeout(8000)
  });
  if(r.status>=500 || r.status===429)throw new Error("Account authentication is temporarily unavailable.");
  if(!r.ok)return false;
  const result=await r.json().catch(()=>({}));
  return result?.user?.id === user.id && typeof result.access_token === "string";
}
function validRestored(doc,id,userId) {
  if(!doc || doc.id!==id || typeof doc.title!=="string" || !doc.title.trim() || doc.title.length>180 ||
    typeof doc.source!=="string" || doc.source.length>180000 || doc.source.includes("\0") ||
    !["xelatex","pdflatex","lualatex"].includes(doc.engine) ||
    !Array.isArray(doc.files) || doc.files.length>499) return false;
  const entry=doc.main_filename||"main.tex";
  if(!/^[^/\\]+\.tex$/i.test(entry)||!isSafeProjectFilename(entry))return false;
  const names=new Set(doc.main_deleted ? [] : ["main.tex",entry.toLowerCase()]);let total=enc.encode(doc.source).length;
  for(const item of doc.files){
    if(!isSafeProjectFilename(item?.name) || !["utf8","base64"].includes(item.encoding) ||
      typeof item.content!=="string" || names.has(item.name.toLowerCase()))return false;
    names.add(item.name.toLowerCase());
    let len=0;
    if(item.encoding==="utf8") {if(item.content.includes("\0"))return false;len=enc.encode(item.content).length;}
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
  createdAt:doc.created_at,updatedAt:doc.updated_at,
  realtimeEpoch:texRealtimeEpoch(doc)
});
// A per-account DO serializes archive configuration, reset, store and restore.
// In particular, reset must not delete the key configuration while an upload
// encrypted with that configuration is being committed. No production secrets
// or browser-supplied identity headers are forwarded to this internal endpoint.
export async function handleTexArchive(request,env,user) {
  if(!ID.test(user?.id||""))return fail("Unauthorized.",401);
  if(!env?.STORAGE || !env?.TEX_COLLAB_ROOMS?.idFromName || !env?.TEX_COLLAB_ROOMS?.get)
    return fail("Safe archive coordination is temporarily unavailable. No files were changed.",503);
  const url=new URL(request.url);
  const headers=new Headers({"X-Qsseda-Vault-User":user.id,"X-Qsseda-Vault-Email":encodeURIComponent(user.email||"")});
  for(const name of ["content-type","content-length"]){const value=request.headers.get(name);if(value)headers.set(name,value);}
  const room=env.TEX_COLLAB_ROOMS.get(env.TEX_COLLAB_ROOMS.idFromName("tex-vault:"+user.id));
  try{
    return await room.fetch(new Request("https://tex-collaboration-room.internal/vault"+url.search,{
      method:request.method,headers,...(request.body?{body:request.body,duplex:"half"}:{})
    }));
  }catch{return fail("Archive operation interrupted. Your original file or its encrypted copy has been retained. Reload before retrying.",503);}
}

// Called ONLY from the authenticated internal DO path (or isolated tests).
export async function handleTexArchiveTransaction(request,env,user) {
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
  if(request.method!=="POST")return fail("Method not allowed.",405);
  let body;
  try{body=await readJsonBounded(request,(mode==="store"||mode==="restore")?MAX_BODY:4096);}
  catch(error){return fail(error?.status===413?"Request too large.":"Malformed archive request.",error?.status===413?413:400);}
  if(mode==="config"){
    if(await config(env,userId))return fail("Archive password already created.",409);
    if(!validSalt(body.salt)||!validIv(body.iv)||!validB64(body.check,300)||
      body.iterations!==900000)return fail("Invalid archive key settings.");
    const created=await env.STORAGE.put(configKey(userId),JSON.stringify({
      salt:body.salt,iv:body.iv,check:body.check,iterations:900000,created_at:new Date().toISOString()
    }),{httpMetadata:{contentType:"application/json;charset=UTF-8"},onlyIf:{etagDoesNotMatch:"*"}});
    if(created===null)return fail("Archive password already created.",409);
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
  if(body.vault_salt!==state.salt)return fail("The archive key changed. Unlock the archive again before continuing. No files were changed.",409);
  const id=String(body?.id||"");
  if(!ID.test(id))return fail("Invalid project ID.");
  if(mode==="cleanup"){
    const blob=await env.STORAGE.get(docKey(userId,id));
    const marker=blob?await blob.json():null;
    // Legacy archives removed the original object rather than retaining a
    // tombstone. An absent original is safe, but a live/restored project is not.
    if(marker && (!marker.document_deleted || marker.reason!=="archived" || marker.owner_id!==userId || marker.id!==id))
      return fail("This project is not awaiting archive cleanup.",409);
    await finishArchiveCleanup(env,userId,id,marker?.retired_epoch||"v2");
    return json({archived:true,cleanup_complete:true,id});
  }
  if(mode==="store"){
    if(!sealed(body.encrypted))return fail("Invalid encrypted project envelope.",400);
    const existingArchive=await env.STORAGE.get(archiveKey(userId,id));
    const stored=await env.STORAGE.get(docKey(userId,id));
    const current=stored?JSON.parse(await stored.text()):null;
    // Recovery after the process died AFTER the irreversible CAS. The complete
    // ciphertext is already durable; finish the idempotent plaintext cleanup.
    if(existingArchive && current?.document_deleted && current.reason==="archived"){
      await finishArchiveCleanup(env,userId,id,current.retired_epoch||"v2");
      return json({archived:true,id});
    }
    if(existingArchive){
      const pending=await existingArchive.json();
      // An interrupted pre-CAS upload never removed the live project. Only
      // that provisional envelope can be replaced; committed archives cannot.
      if(!pending.pending_revision || !current || current.document_deleted)
        return fail("This project is already archived.",409);
      await env.STORAGE.delete(archiveKey(userId,id));
    }
    if((await listArchive(env,userId)).length>=MAX_ITEMS)return fail("Archive capacity reached.",409);
    if(!current || current.document_deleted)return fail("Project does not exist.",404);
    if(current.id!==id||current.owner_id!==userId)return fail("Only the owner can archive a project.",403);
    if(isTexMainLocked(current)||current.locked_files?.length||current.locked_folders?.length)
      return fail("Unlock the project and its files before archiving.",423);
    if(typeof body.storage_revision!=="string" || body.storage_revision!==stored.etag)
      return fail("The project changed during encryption. Save and try again.",409);
    const archivedAt=new Date().toISOString();
    const envelope={v:2,id,encrypted:body.encrypted,archived_at:archivedAt,
      vault_salt:state.salt,pending_revision:stored.etag};
    const uploaded=await env.STORAGE.put(archiveKey(userId,id),JSON.stringify(envelope),{
      httpMetadata:{contentType:"application/json;charset=UTF-8"},onlyIf:{etagDoesNotMatch:"*"},
      customMetadata:{ownerId:userId,kind:"tex-encrypted-archive",archivedAt,cleanupComplete:"false"}});
    if(uploaded===null)return fail("The archive changed. Reload before retrying.",409);
    try{
      await retireTexSource(env,texDocumentRevision(current,stored),"archived");
    }catch(error){
      // Only an explicit failed precondition proves the plaintext survived.
      // An unknown I/O error may have committed: retain the ciphertext then.
      if(error?.code===TEX_WRITE_CONFLICT){
        await env.STORAGE.delete(archiveKey(userId,id));
        return fail("The project changed during archiving. Nothing was removed. Reload and retry.",409);
      }
      throw error;
    }
    await finishArchiveCleanup(env,userId,id,texRealtimeEpoch(current));
    return json({archived:true,id});
  }
  if(mode==="restore"){
    const encrypted=await env.STORAGE.get(archiveKey(userId,id));
    if(!encrypted)return fail("Encrypted archive not found.",404);
    const previous=await env.STORAGE.get(docKey(userId,id));
    const marker=previous?JSON.parse(await previous.text()):null;
    if(marker && !marker.document_deleted)return fail("The project already exists. Refusing to overwrite it.",409);
    if(marker && (marker.owner_id!==userId || marker.id!==id))return fail("Invalid restore destination.",409);
    const restored=body.document;
    if(!validRestored(restored,id,userId))return fail("Restored project is invalid or too large.",400);
    const now=new Date().toISOString();
    const created=typeof restored.created_at==="string" && Number.isFinite(Date.parse(restored.created_at)) ? new Date(restored.created_at).toISOString() : now;
    const names=list=>Array.isArray(list)?list.filter(x=>typeof x==="string"&&x.length<=240).slice(0,500):[];
    const doc={id,owner_id:userId,title:restored.title.trim(),source:restored.source,engine:restored.engine,
      files:restored.files.map(({name,encoding,content})=>({name,encoding,content})),
      main_filename:restored.main_filename||"main.tex",main_deleted:restored.main_deleted===true,
      project_type:typeof restored.project_type==="string"?restored.project_type.slice(0,40):"restored",
      pinned:restored.pinned===true,pinned_files:names(restored.pinned_files),pinned_folders:names(restored.pinned_folders),
      realtime_epoch:crypto.randomUUID(),created_at:created,updated_at:now,
      locked:false,locked_files:[],locked_folders:[]};
    try{
      await putTexDocument(env.STORAGE,docKey(userId,id),doc,{
        httpMetadata:{contentType:"application/json;charset=UTF-8"},customMetadata:documentMeta(doc,userId)
      },previous?previous.etag:null);
    }catch(error){if(error?.code===TEX_WRITE_CONFLICT)return fail("The project changed during restore. The encrypted archive was retained.",409);throw error;}
    // Do not delete the only encrypted copy until the conditional restore has
    // completed. A failed derived pin index is repairable and not data loss.
    try{await syncTexProjectPins(env,userId,doc);}catch(error){workerLog("warn","tex.archive.pin_sync_failed",{document_id:id,message:String(error?.message||error).slice(0,160)});}
    await env.STORAGE.delete(archiveKey(userId,id));
    return json({restored:true,document:doc});
  }
  return fail("Unknown archive operation.",404);
}

async function cleanupArchivedPlaintext(env,userId,id){
  await removeTexProjectPins(env,userId,id);
  await clearPrefix(env,RUN_ROOT+userId+"/"+id+"/");
  await clearPrefix(env,"_system/tex-results/"+userId+"/"+id+"/");
  await purgeDocumentVersions(env,userId,id);
}

// A successful archive response means known plaintext copies were removed, not
// merely that ciphertext was uploaded. A failed cleanup is retryable from the
// archive rail and must never delete the only encrypted recovery copy.
async function finishArchiveCleanup(env,userId,id,epoch){
  const object=await env.STORAGE.get(archiveKey(userId,id));
  if(!object)throw new Error("Encrypted recovery copy is unavailable. Cleanup was not performed.");
  const envelope=await object.json();
  await purgeTexCollaborationHistory(env,userId,id,epoch);
  await cleanupArchivedPlaintext(env,userId,id);
  const updated=await env.STORAGE.put(archiveKey(userId,id),JSON.stringify({...envelope,cleanup_complete:true,pending_revision:null}),{
    onlyIf:{etagMatches:object.etag},httpMetadata:{contentType:"application/json;charset=UTF-8"},
    customMetadata:{...object.customMetadata,cleanupComplete:"true"}
  });
  if(updated===null)throw new Error("Archive cleanup confirmation changed. Reload and retry.");
}
