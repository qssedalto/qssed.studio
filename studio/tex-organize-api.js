import { json } from "./routing.js";
import { isSafeProjectFilename } from "./tex-project-file-types.js";

const ROOT = "_system/tex-documents/";
const PIN_ROOT = "_system/tex-pins/";
const pinKey = userId => PIN_ROOT + userId + ".json";
export async function getTexPinnedItems(env,userId) {
  const blob=await env.STORAGE.get(pinKey(userId));
  if(!blob)return [];
  const data=await blob.json().catch(()=>({}));
  return Array.isArray(data?.items)?data.items.slice(0,1000):[];
}
export async function syncTexProjectPins(env,userId,doc) {
  const items=(await getTexPinnedItems(env,userId)).filter(item=>item.id!==doc.id);
  if(doc.pinned)items.push({id:doc.id,name:doc.title,type:"project"});
  for(const name of doc.pinned_files||[])items.push({id:doc.id,name,type:"file"});
  for(const name of doc.pinned_folders||[])items.push({id:doc.id,name,type:"folder"});
  await env.STORAGE.put(pinKey(userId),JSON.stringify({items}),{
    httpMetadata:{contentType:"application/json;charset=UTF-8"}
  });
}
export async function removeTexProjectPins(env,userId,documentId) {
  const existing=await getTexPinnedItems(env,userId);
  if(!existing.some(item=>item.id===documentId))return;
  await env.STORAGE.put(pinKey(userId),JSON.stringify({items:existing.filter(item=>item.id!==documentId)}),{
    httpMetadata:{contentType:"application/json;charset=UTF-8"}
  });
}

const safeId = value => /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(String(value || ""));
const clean = value => String(value || "").trim();
const safeFolder = name => name && !name.endsWith("/") && isSafeProjectFilename(name + "/placeholder.tex");
const metadata = (doc, userId) => ({
  ownerId: userId, hidden: "true", kind: "tex-document",
  title: doc.title, engine: doc.engine, preview: doc.source.replace(/\s+/g, " ").trim().slice(0,220),
  projectType: doc.project_type || "legacy", fileCount: String(1+(doc.files?.length||0)),
  pinned: doc.pinned ? "true" : "false", locked: doc.locked ? "true" : "false",
  createdAt: doc.created_at, updatedAt: doc.updated_at
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
  if (doc?.owner_id !== userId || doc?.id !== id) return json({error:"Project owner mismatch."},403);
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
    if (!contains && name !== "main.tex") return json({error:"File not found."},404);
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
    if (!folders.has(name) || blocked(name)) return json({error:"Folder not found or locked."},423);
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
      doc.files = renamed;
      // Preserve exact LaTeX file references when a folder moves.
      const rewrite = text => String(text || "").split(prefix).join(destination + "/");
      doc.source = rewrite(doc.source);
      doc.files = renamed.map(file => file.encoding === "utf8" ?
        {...file, content:rewrite(file.content)} : file);
      const move = value => value.startsWith(prefix) ? destination + "/" + value.slice(prefix.length) : value;
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
  doc.updated_at = new Date().toISOString();
  await env.STORAGE.put(key,JSON.stringify(doc),{
    httpMetadata:{contentType:"application/json;charset=UTF-8"},
    customMetadata:metadata(doc,userId)
  });
  await syncTexProjectPins(env,userId,doc);
  return json({document:doc,action});
}
