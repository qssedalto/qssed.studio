// 初学者导读：管理员内容管理 API：负责读取/修改可管理内容。写操作应始终在服务端验证管理员会话与请求结构。
import { SUPABASE_URL, SUPABASE_KEY } from "../studio/config.js";
import { adminHeaders } from "./session.js";

const SUMMARY_ROOT = "_system/summaries/";
const USER_LINKS_ROOT = "_system/user-links/";
const STORAGE_ROOT = "users/";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function handleAdminContent(request, env, session, resource) {
  if (!env?.STORAGE) return json({ error: "Administrative storage is unavailable." }, 503);

  if (resource === "summaries") {
    if (request.method !== "GET") return hidden();
    return listSummaries(env, session);
  }
  if (resource === "links") {
    if (request.method !== "GET") return hidden();
    return listLinks(env, session);
  }
  if (resource === "link") {
    if (request.method !== "PUT" && request.method !== "DELETE") return hidden();
    if (!sameOrigin(request)) return hidden();
    return mutateLink(request, env);
  }
  if (resource === "storage-files") {
    if (request.method !== "GET") return hidden();
    return listStorageFiles(env, session);
  }
  if (resource === "storage-object") {
    if (request.method !== "GET" && request.method !== "DELETE") return hidden();
    if (request.method === "DELETE" && !sameOrigin(request)) return hidden();
    return storageObject(request, env);
  }
  return hidden();
}

async function listSummaries(env, session) {
  const rows = [];
  let cursor;
  let scanned = 0;
  do {
    const page = await env.STORAGE.list({ prefix: SUMMARY_ROOT, cursor, limit: 500 });
    for (const object of page.objects || []) {
      scanned += 1;
      const ref = summaryReference(object.key);
      if (!ref) continue;
      const data = await readJson(env, object.key);
      if (!data) continue;
      rows.push({
        owner_id: ref.ownerId,
        title: clean(data.title, 160),
        source: clean(data.source, 500),
        purpose: clean(data.purpose, 1800),
        core: clean(data.core, 12000),
        points: clean(data.points, 6000),
        evidence: clean(data.evidence, 6000),
        limits: clean(data.limits, 5000),
        actions: clean(data.actions, 5000),
        tags: clean(data.tags, 500),
        updated_at: data.updated_at || object.uploaded?.toISOString?.() || null
      });
      if (rows.length >= 500) break;
    }
    cursor = page.cursor;
    if (!page.truncated || !cursor || rows.length >= 500 || scanned >= 2500) break;
  } while (cursor);
  await attachOwners(rows, session.accessToken);
  rows.sort((a,b)=>String(b.updated_at||"").localeCompare(String(a.updated_at||"")));
  return json({ rows, count: rows.length, partial: rows.length >= 500 });
}

async function listLinks(env, session) {
  const rows = [];
  let cursor;
  let scanned = 0;
  do {
    const page = await env.STORAGE.list({ prefix: USER_LINKS_ROOT, cursor, limit: 500 });
    for (const object of page.objects || []) {
      scanned += 1;
      const ref = linkReference(object.key);
      if (!ref) continue;
      const data = await readJson(env, object.key);
      if (!data || data.owner_id !== ref.ownerId || data.id !== ref.linkId) continue;
      rows.push({
        owner_id: ref.ownerId,
        id: ref.linkId,
        title: clean(data.title, 180),
        url: safeHttpUrl(data.url),
        category: clean(data.category, 80),
        description: clean(data.description, 1200),
        community: data.community === true,
        created_at: data.created_at || object.uploaded?.toISOString?.() || null,
        updated_at: data.updated_at || object.uploaded?.toISOString?.() || null
      });
      if (rows.length >= 1500) break;
    }
    cursor = page.cursor;
    if (!page.truncated || !cursor || rows.length >= 1500 || scanned >= 5000) break;
  } while (cursor);
  await attachOwners(rows, session.accessToken);
  rows.sort((a,b)=>String(b.updated_at||"").localeCompare(String(a.updated_at||"")));
  return json({ rows, count: rows.length, partial: rows.length >= 1500 });
}

async function mutateLink(request, env) {
  const url = new URL(request.url);
  const ownerId = cleanUuid(url.searchParams.get("owner"));
  const linkId = cleanUuid(url.searchParams.get("id"));
  if (!ownerId || !linkId) return json({ error: "Invalid link reference." }, 400);
  const key = `${USER_LINKS_ROOT}${ownerId}/${linkId}.json`;
  const previous = await readJson(env, key);
  if (!previous || previous.owner_id !== ownerId || previous.id !== linkId) return json({ error: "Link not found." }, 404);

  if (request.method === "DELETE") {
    await env.STORAGE.delete(key);
    return json({ deleted: true, owner_id: ownerId, id: linkId });
  }

  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Invalid request body." }, 400); }
  const title = clean(body?.title ?? previous.title, 180);
  const linkUrl = safeHttpUrl(body?.url ?? previous.url);
  if (!title || !linkUrl) return json({ error: "Title and a valid URL are required." }, 400);
  const next = {
    ...previous,
    id: linkId,
    owner_id: ownerId,
    title,
    url: linkUrl,
    category: clean(body?.category ?? previous.category, 80) || "tools",
    description: clean(body?.description ?? previous.description, 1200),
    community: typeof body?.community === "boolean" ? body.community : previous.community === true,
    updated_at: new Date().toISOString()
  };
  await env.STORAGE.put(key, JSON.stringify(next), {
    httpMetadata: { contentType: "application/json;charset=UTF-8" },
    customMetadata: {
      ownerId,
      hidden: "true",
      kind: "user-link",
      community: next.community ? "true" : "false",
      title: next.title.slice(0,120)
    }
  });
  return json({ saved: true, link: next });
}

async function listStorageFiles(env, session) {
  const rows = [];
  let cursor;
  let scanned = 0;
  do {
    const page = await env.STORAGE.list({
      prefix: STORAGE_ROOT,
      cursor,
      limit: 1000,
      include: ["httpMetadata","customMetadata"]
    });
    for (const object of page.objects || []) {
      scanned += 1;
      const ref = storageReference(object.key);
      if (!ref) continue;
      rows.push({
        owner_id: ref.ownerId,
        id: ref.objectId,
        reference: `${ref.ownerId}:${ref.objectId}`,
        name: cleanFilename(object.customMetadata?.originalName),
        content_type: clean(object.httpMetadata?.contentType,160) || "application/octet-stream",
        size: Number(object.size) || 0,
        uploaded_at: object.uploaded?.toISOString?.() || null
      });
      if (rows.length >= 5000) break;
    }
    cursor = page.cursor;
    if (!page.truncated || !cursor || rows.length >= 5000 || scanned >= 10000) break;
  } while (cursor);
  await attachOwners(rows, session.accessToken);
  rows.sort((a,b)=>String(b.uploaded_at||"").localeCompare(String(a.uploaded_at||"")));
  return json({
    rows,
    count: rows.length,
    used_bytes: rows.reduce((sum,row)=>sum+(Number(row.size)||0),0),
    partial: rows.length >= 5000
  });
}

async function storageObject(request, env) {
  const ref = compositeReference(new URL(request.url).searchParams.get("id"));
  if (!ref) return json({ error: "Invalid storage reference." }, 400);
  const key = `${STORAGE_ROOT}${ref.ownerId}/${ref.objectId}`;
  if (request.method === "DELETE") {
    const exists = await env.STORAGE.head(key);
    if (!exists) return json({ error: "File not found." }, 404);
    await env.STORAGE.delete(key);
    return json({ deleted: true, reference: `${ref.ownerId}:${ref.objectId}` });
  }
  const object = await env.STORAGE.get(key);
  if (!object) return json({ error: "File not found." }, 404);
  return new Response(object.body, {
    status: 200,
    headers: {
      "content-type": "application/octet-stream",
      "content-disposition": downloadDisposition(object.customMetadata?.originalName),
      "cache-control": "private, no-store",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff",
      "x-robots-tag": "noindex, nofollow, noarchive, nosnippet"
    }
  });
}

async function attachOwners(rows, accessToken) {
  const ids = [...new Set((rows || []).map(row=>row.owner_id).filter(cleanUuid))];
  if (!ids.length || !accessToken) return rows;
  const labels = new Map();
  for (let i=0;i<ids.length;i+=100) {
    const chunk=ids.slice(i,i+100);
    const url=new URL(`${SUPABASE_URL}/rest/v1/profiles`);
    url.searchParams.set("select","id,username,display_name");
    url.searchParams.set("id",`in.(${chunk.join(",")})`);
    try {
      const response=await fetch(url.toString(),{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${accessToken}`,Accept:"application/json"}});
      if(!response.ok) continue;
      const data=await response.json();
      for(const row of Array.isArray(data)?data:[]) {
        const username=clean(row?.username,80);
        const display=clean(row?.display_name,120);
        labels.set(row.id, display && username ? `${display} · @${username}` : username ? `@${username}` : display || row.id);
      }
    } catch {}
  }
  for(const row of rows||[]) row.owner_label=labels.get(row.owner_id)||row.owner_id;
  return rows;
}

function summaryReference(key) {
  const parts=String(key||"").split("/");
  if(parts.length!==4||parts[0]!=="_system"||parts[1]!=="summaries"||parts[3]!=="current.json") return null;
  const ownerId=cleanUuid(parts[2]);
  return ownerId?{ownerId}:null;
}
function linkReference(key) {
  const parts=String(key||"").split("/");
  if(parts.length!==4||parts[0]!=="_system"||parts[1]!=="user-links"||!parts[3].endsWith(".json")) return null;
  const ownerId=cleanUuid(parts[2]);
  const linkId=cleanUuid(parts[3].slice(0,-5));
  return ownerId&&linkId?{ownerId,linkId}:null;
}
function storageReference(key) {
  const parts=String(key||"").split("/");
  if(parts.length!==3||parts[0]!=="users") return null;
  const ownerId=cleanUuid(parts[1]), objectId=cleanUuid(parts[2]);
  return ownerId&&objectId?{ownerId,objectId}:null;
}
function compositeReference(value) {
  const parts=String(value||"").split(":");
  if(parts.length!==2) return null;
  const ownerId=cleanUuid(parts[0]), objectId=cleanUuid(parts[1]);
  return ownerId&&objectId?{ownerId,objectId}:null;
}
async function readJson(env,key) {
  const object=await env.STORAGE.get(key);
  if(!object) return null;
  try { const data=JSON.parse(await object.text()); return data&&typeof data==="object"?data:null; }
  catch { return null; }
}
function cleanUuid(value){const text=String(value||"").trim();return UUID.test(text)?text:"";}
function clean(value,max){return String(value??"").replace(/[\u0000-\u001f\u007f]/g," ").replace(/\s+/g," ").trim().slice(0,max);}
function safeHttpUrl(value){try{const url=new URL(String(value||""));return url.protocol==="http:"||url.protocol==="https:"?url.toString():"";}catch{return "";}}
function cleanFilename(value){const text=String(value||"").normalize("NFC").replace(/[\u0000-\u001f\u007f]/g,"").replace(/[\\/]/g," ").replace(/\s+/g," ").trim();return Array.from(text).slice(0,180).join("")||"file";}
function downloadDisposition(filename){const safe=cleanFilename(filename);const fallback=Array.from(safe).map(ch=>/[A-Za-z0-9._-]/.test(ch)?ch:"_").join("").slice(0,120)||"file";return `attachment; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(safe).replace(/['()*]/g,ch=>"%"+ch.charCodeAt(0).toString(16).toUpperCase())}`;}
function sameOrigin(request){const url=new URL(request.url);return (request.headers.get("Origin")||"")===url.origin;}
function json(value,status=200){return new Response(JSON.stringify(value),{status,headers:adminHeaders("application/json;charset=UTF-8")});}
function hidden(){return new Response("Not found.",{status:404,headers:adminHeaders("text/plain;charset=UTF-8")});}
