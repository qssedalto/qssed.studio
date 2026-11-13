import { rewriteTexFolderReferences } from "./tex-reference-rewrite.js";
import { invalidateTexCollaboration } from "./tex-collaboration-invalidate.js";
import { isTexMainLocked, hasLockedTexDescendants, putTexDocument, TEX_WRITE_CONFLICT } from "./tex-document-guards.js";
import { json } from "./routing.js";
import { isSafeProjectFilename } from "./tex-project-file-types.js";
import { texRealtimeEpoch } from "./tex-realtime-epoch.js";

const ROOT = "_system/tex-documents/";
const PIN_ROOT = "_system/tex-pins/";
const pinKey = userId => PIN_ROOT + userId + ".json";
export async function getTexPinnedItems(env,userId) {
  const blob=await env.STORAGE.get(pinKey(userId));
  if(!blob)return [];
  const data=await blob.json().catch(()=>({}));
  return Array.isArray(data?.items)?data.items.slice(0,1000):[];
}
// The pin list is a derived index. Re-read the authoritative project on
// every CAS retry so two projects (or two tabs of one project) cannot erase
// each other's pins with a stale read-modify-write.
async function updatePinIndex(env,userId,documentId) {
  for(let attempt=0;attempt<6;attempt++){
    const stored=await env.STORAGE.get(pinKey(userId));
    const index=stored?await stored.json():{items:[]};
    const items=(Array.isArray(index.items)?index.items:[]).filter(item=>item.id!==documentId);
    const source=await env.STORAGE.get(ROOT+userId+"/"+documentId+".json");
    const doc=source?await source.json():null;
    if(doc && !doc.document_deleted && doc.id===documentId && doc.owner_id===userId){
      if(doc.pinned)items.push({id:doc.id,name:doc.title,type:"project"});
      for(const name of doc.pinned_files||[])items.push({id:doc.id,name,type:"file"});
      for(const name of doc.pinned_folders||[])items.push({id:doc.id,name,type:"folder"});
    }
    const result=await env.STORAGE.put(pinKey(userId),JSON.stringify({items}),{
      httpMetadata:{contentType:"application/json;charset=UTF-8"},
      onlyIf:stored?{etagMatches:stored.etag}:{etagDoesNotMatch:"*"}
    });
    if(result!==null)return;
  }
  throw new Error("The pin index changed repeatedly. Please retry the action.");
}
export async function syncTexProjectPins(env,userId,doc) { return updatePinIndex(env,userId,doc.id); }
export async function removeTexProjectPins(env,userId,documentId) { return updatePinIndex(env,userId,documentId); }

const safeId = value => /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(String(value || ""));
const clean = value => String(value || "").trim();
const safeFolder = name => name && !name.endsWith("/") && isSafeProjectFilename(name + "/placeholder.tex");
const metadata = (doc, userId) => ({
  ownerId: userId, hidden: "true", kind: "tex-document",
  title: doc.title, engine: doc.engine, preview: doc.source.replace(/\s+/g, " ").trim().slice(0,220),
  projectType: doc.project_type || "legacy", fileCount: String(1+(doc.files?.length||0)),
  pinned: doc.pinned ? "true" : "false", locked: doc.locked ? "true" : "false",
  createdAt: doc.created_at, updatedAt: doc.updated_at,
  realtimeEpoch: texRealtimeEpoch(doc)
});
const uniqueNames = list => [...new Set((list || []).filter(x => typeof x === "string" && x.length <= 240))].slice(0,500);

export async function handleTexOrganize(request, env, userId) {
  if (!env?.STORAGE) return json({error:"TeX storage unavailable."},503);
  if (request.method === "GET") return json({items:await getTexPinnedItems(env,userId)});
  if (request.method !== "POST") return json({error:"Method not allowed."},405);
  let body;
  try {
    const raw = await request.text();
    if (raw.length > 4096) return json({error:"Request too large."},413);
    body = JSON.parse(raw);
  } catch { return json({error:"Invalid organization request."},400); }
  const id = clean(body?.document_id);
  if (!safeId(id)) return json({error:"Invalid project ID."},400);
  const key = ROOT + userId + "/" + id + ".json";
  const stored = await env.STORAGE.get(key);
  if (!stored) return json({error:"Project not found or inaccessible."},404);
  const doc = JSON.parse(await stored.text());
  if (doc?.document_deleted) return json({error:"Project no longer exists."},404);
  if (doc?.owner_id !== userId || doc?.id !== id) return json({error:"Project owner mismatch."},403);
  const previousEpoch=texRealtimeEpoch(doc),previousSource=doc.source,previousMainLocked=isTexMainLocked(doc);
  const action = clean(body.action);
  const name = clean(body.name);
  const files = Array.isArray(doc.files) ? doc.files : [];
  const contains = name && files.some(file => file.name === name);
  const folders = new Set(files.flatMap(file => {
    const parts = String(file.name || "").split("/");
    return parts.slice(0,-1).map((_,i) => parts.slice(0,i+1).join("/"));
  }));
  const pinnedFiles = uniqueNames(doc.pinned_files);
  const lockedFiles = uniqueNames(doc.locked_files);
  const pinnedFolders = uniqueNames(doc.pinned_folders);
  const lockedFolders = uniqueNames(doc.locked_folders);
  const blocked = entry => doc.locked || lockedFiles.includes(entry) ||
    lockedFolders.some(folder => entry === folder || entry.startsWith(folder + "/"));
  if (doc.locked && !(action === "lock-project" && body.value === false))
    return json({error:"Unlock this project before making changes."},423);
  if (action === "pin-project") doc.pinned = body.value === true;
  else if (action === "lock-project") doc.locked = body.value === true;
  else if (action === "rename-project") {
    const title = clean(body.value);
    if (!title || title.length > 180) return json({error:"Invalid project title."},400);
    doc.title = title;
  } else if (["pin-file","lock-file"].includes(action)) {
    if (!contains && (doc.main_deleted || name !== (doc.main_filename || "main.tex"))) return json({error:"File not found."},404);
    if (action === "lock-file" && blocked(name) && body.value !== false)
      return json({error:"Unlock the parent folder first."},423);
    const set = action === "pin-file" ? pinnedFiles : lockedFiles;
    if (body.value === true && !set.includes(name)) set.push(name);
    if (body.value === false) { const index=set.indexOf(name); if(index>=0)set.splice(index,1); }
    doc[action === "pin-file" ? "pinned_files" : "locked_files"] = uniqueNames(set);
  } else if (["pin-folder","lock-folder"].includes(action)) {
    if (!folders.has(name)) return json({error:"Folder not found."},404);
    if (action === "lock-folder" && blocked(name) && body.value !== false)
      return json({error:"Unlock the parent folder first."},423);
    const set = action === "pin-folder" ? pinnedFolders : lockedFolders;
    if (body.value === true && !set.includes(name)) set.push(name);
    if (body.value === false) { const index=set.indexOf(name); if(index>=0)set.splice(index,1); }
    doc[action === "pin-folder" ? "pinned_folders" : "locked_folders"] = uniqueNames(set);
  } else if (action === "rename-folder" || action === "delete-folder") {
    if (!folders.has(name) || blocked(name) || hasLockedTexDescendants(doc, name)) return json({error:"Folder not found or locked."},423);
    const prefix = name + "/";
    if (action === "rename-folder") {
      const destination = clean(body.value);
      if (!safeFolder(destination) || destination === name || destination.startsWith(prefix) ||
          files.some(file => !file.name.startsWith(prefix) && file.name.startsWith(destination + "/")))
        return json({error:"Invalid or conflicting destination folder."},400);
      const renamed = files.map(file => file.name.startsWith(prefix)
        ? {...file, name:destination + "/" + file.name.slice(prefix.length)} : file);
      const seen=new Set(renamed.map(f=>f.name.toLowerCase()));
      if (seen.size !== renamed.length || !renamed.every(file => isSafeProjectFilename(file.name)))
        return json({error:"The destination creates duplicate or invalid filenames."},409);
      const rewrittenMain=rewriteTexFolderReferences(doc.source,name,destination);
      if(rewrittenMain!==doc.source && isTexMainLocked(doc))
        return json({error:"Unlock the main file before changing its folder references."},423);
      const rewrittenFiles=[];
      for(let i=0;i<renamed.length;i++){
        const file=renamed[i],original=files[i];
        const content=file.encoding==="utf8" && /\.(?:tex|ltx|sty|cls)$/i.test(file.name)
          ? rewriteTexFolderReferences(file.content,name,destination) : file.content;
        if(content!==file.content && blocked(original.name))
          return json({error:"A locked file contains a reference to this folder. Unlock it first."},423);
        rewrittenFiles.push(content===file.content?file:{...file,content});
      }
      doc.source=rewrittenMain;
      doc.files=rewrittenFiles;
      const move = value => value===name?destination:value.startsWith(prefix)?destination+"/"+value.slice(prefix.length):value;
      doc.pinned_files = pinnedFiles.map(move); doc.locked_files = lockedFiles.map(move);
      doc.pinned_folders = pinnedFolders.map(move); doc.locked_folders = lockedFolders.map(move);
    } else {
      doc.files = files.filter(file => !file.name.startsWith(prefix));
      doc.pinned_files = pinnedFiles.filter(x => !x.startsWith(prefix));
      doc.locked_files = lockedFiles.filter(x => !x.startsWith(prefix));
      doc.pinned_folders = pinnedFolders.filter(x => !x.startsWith(prefix) && x !== name);
      doc.locked_folders = lockedFolders.filter(x => !x.startsWith(prefix) && x !== name);
    }
  } else return json({error:"Unknown organization action."},400);
  const sourceRebased=doc.source!==previousSource || isTexMainLocked(doc)!==previousMainLocked;
  if(sourceRebased)doc.realtime_epoch=crypto.randomUUID();
  doc.updated_at = new Date().toISOString();
  try {
    await putTexDocument(env.STORAGE,key,doc,{
    httpMetadata:{contentType:"application/json;charset=UTF-8"},
    customMetadata:metadata(doc,userId)
    },stored.etag);
  } catch (error) {
    if (error?.code === TEX_WRITE_CONFLICT) return json({error:error.message,code:error.code},409);
    throw error;
  }
  if(sourceRebased)await invalidateTexCollaboration(env,userId,id,"source-rebased","",previousEpoch);
  await syncTexProjectPins(env,userId,doc);
  return json({document:doc,action,source_rebased:sourceRebased});
}
