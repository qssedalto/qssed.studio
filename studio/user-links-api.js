// 初学者导读：用户链接 API：管理个人链接/书签数据。URL、标题等输入要规范化，资源 id 不能绕过当前用户边界。
import { SUPABASE_URL } from "./config.js";
import { hasStorageBinding, isStorageObjectId, verifyStorageUser } from "./storage-api.js";
import { json } from "./routing.js";
import { workerLog } from "./server-runtime.js";

const USER_LINKS_ROOT = "_system/user-links/";
const MAX_LINK_BYTES = 16 * 1024;
const MAX_OWN_LINKS = 240;
const MAX_COMMUNITY_LINKS = 1000;

function userLinksPrefix(userId) {
  return `${USER_LINKS_ROOT}${userId}/`;
}

function userLinkKey(userId, linkId) {
  return `${userLinksPrefix(userId)}${linkId}.json`;
}

function cleanText(value, maximum) {
  return String(value ?? "").replace(/\u0000/g, "").trim().slice(0, maximum);
}

function normalizeUrl(value) {
  const text = cleanText(value, 2048);
  try {
    const url = new URL(text);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

function normalizeLink(input, ownerId, linkId, previous = null) {
  const source = input && typeof input === "object" ? input : {};
  const now = new Date().toISOString();
  return {
    id: linkId,
    owner_id: ownerId,
    title: cleanText(source.title, 180),
    url: normalizeUrl(source.url),
    category: cleanText(source.category, 80) || "tools",
    description: cleanText(source.description, 1200),
    community: typeof source.community === "boolean" ? source.community : Boolean(previous?.community),
    created_at: previous?.created_at || now,
    updated_at: now
  };
}

async function readUserLink(env, ownerId, linkId) {
  const object = await env.STORAGE.get(userLinkKey(ownerId, linkId));
  if (!object) return null;
  try {
    const parsed = JSON.parse(await object.text());
    if (!parsed || parsed.owner_id !== ownerId || parsed.id !== linkId) return null;
    return {
      ...normalizeLink(parsed, ownerId, linkId, parsed),
      created_at: parsed.created_at || object.uploaded?.toISOString?.() || new Date().toISOString(),
      updated_at: parsed.updated_at || object.uploaded?.toISOString?.() || new Date().toISOString()
    };
  } catch (error) {
    workerLog("warn", "user_links.read.invalid", { owner_user_id: ownerId, link_id: linkId, message: String(error?.message || error) });
    return null;
  }
}

function serviceHeaders(secret) {
  return {
    apikey: secret,
    ...(secret.split(".").length === 3 ? { Authorization: `Bearer ${secret}` } : {})
  };
}

async function fetchOwnerLabels(secret, ownerIds) {
  const unique = [...new Set(ownerIds.filter(Boolean))];
  const labels = new Map();
  for (let index = 0; index < unique.length; index += 100) {
    const chunk = unique.slice(index, index + 100);
    const url = new URL(`${SUPABASE_URL}/rest/v1/profiles`);
    url.searchParams.set("select", "id,username,display_name");
    url.searchParams.set("id", `in.(${chunk.join(",")})`);
    try {
      const response = await fetch(url.toString(), { headers: serviceHeaders(secret) });
      if (!response.ok) continue;
      const rows = await response.json();
      for (const row of Array.isArray(rows) ? rows : []) {
        const username = cleanText(row?.username, 120);
        const displayName = cleanText(row?.display_name, 160);
        const label = displayName && username && displayName.toLowerCase() !== username.toLowerCase()
          ? `${displayName} · @${username}`
          : username ? `@${username}` : displayName || `用户 ${String(row?.id || "").slice(0, 8)}`;
        labels.set(row.id, label);
      }
    } catch {}
  }
  return labels;
}

function parseStoredReference(key) {
  const parts = String(key || "").split("/");
  if (parts.length !== 4 || parts[0] !== "_system" || parts[1] !== "user-links" || !parts[3].endsWith(".json")) return null;
  const ownerId = parts[2];
  const linkId = parts[3].slice(0, -5);
  if (!ownerId || !isStorageObjectId(linkId)) return null;
  return { ownerId, linkId };
}

async function attachOwnerLabels(items, auth) {
  const labels = await fetchOwnerLabels(auth.secret, items.map(item => item.owner_id));
  for (const item of items) {
    item.owner_label = labels.get(item.owner_id) || (item.owner_id === auth.user.id ? "当前账号" : `用户 ${String(item.owner_id).slice(0, 8)}`);
    item.is_own = item.owner_id === auth.user.id;
  }
  items.sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")));
  return items;
}

async function listVisibleLinks(env, auth) {
  const result = [];
  const prefix = userLinksPrefix(auth.user.id);
  const maximum = MAX_OWN_LINKS;
  let cursor;
  do {
    const page = await env.STORAGE.list({ prefix, cursor, limit: Math.min(1000, maximum - result.length) });
    for (const object of page.objects) {
      const reference = parseStoredReference(object.key);
      if (!reference) continue;
      if (reference.ownerId !== auth.user.id) continue;
      const item = await readUserLink(env, reference.ownerId, reference.linkId);
      if (item?.title && item?.url) result.push(item);
      if (result.length >= maximum) break;
    }
    cursor = page.cursor;
    if (!page.truncated || !cursor || result.length >= maximum) break;
  } while (cursor);
  return attachOwnerLabels(result, auth);
}

async function listCommunityLinks(env, auth) {
  const result = [];
  let cursor;
  let scanned = 0;
  do {
    const page = await env.STORAGE.list({ prefix: USER_LINKS_ROOT, cursor, limit: 1000 });
    for (const object of page.objects) {
      scanned += 1;
      const reference = parseStoredReference(object.key);
      if (!reference) continue;
      const item = await readUserLink(env, reference.ownerId, reference.linkId);
      if (item?.title && item?.url && item.community === true) result.push(item);
      if (result.length >= MAX_COMMUNITY_LINKS) break;
    }
    cursor = page.cursor;
    if (!page.truncated || !cursor || result.length >= MAX_COMMUNITY_LINKS || scanned >= 5000) break;
  } while (cursor);
  return attachOwnerLabels(result, auth);
}

async function parsePayload(request) {
  const declared = Number(request.headers.get("Content-Length") || 0);
  if (declared > MAX_LINK_BYTES) return { error: json({ error: "Link payload is too large." }, 413) };
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_LINK_BYTES) return { error: json({ error: "Link payload is too large." }, 413) };
    return { value: JSON.parse(raw || "{}") };
  } catch {
    return { error: json({ error: "Invalid link payload." }, 400) };
  }
}

function requestedReference(url, auth) {
  const id = url.searchParams.get("id") || "";
  if (!isStorageObjectId(id)) return null;
  return { ownerId: auth.user.id, linkId: id };
}

function linkMetadata(link) {
  return {
    ownerId: link.owner_id,
    hidden: "true",
    kind: "user-link",
    community: link.community ? "true" : "false",
    title: link.title.slice(0, 120)
  };
}

export async function handleUserLinks(request, env) {
  const auth = await verifyStorageUser(request, env);
  if (auth.error) return auth.error;
  if (!hasStorageBinding(env)) return json({ error: "Link storage is temporarily unavailable." }, 503);

  const url = new URL(request.url);

  if (request.method === "GET") {
    const scope = url.searchParams.get("scope") === "community" ? "community" : "private";
    try {
      const links = scope === "community" ? await listCommunityLinks(env, auth) : await listVisibleLinks(env, auth);
      return json({
        connected: true,
        links,
        count: links.length,
        scope: scope === "community" ? "community" : "own"
      });
    } catch (error) {
      workerLog("error", "user_links.list.failed", { user_id: auth.user.id, scope, message: String(error?.message || error) });
      return json({ error: "Link storage is temporarily unavailable." }, 503);
    }
  }

  if (request.method === "POST") {
    const parsed = await parsePayload(request);
    if (parsed.error) return parsed.error;
    const linkId = crypto.randomUUID();
    const link = normalizeLink(parsed.value, auth.user.id, linkId);
    if (!link.title) return json({ error: "A title is required." }, 400);
    if (!link.url) return json({ error: "A valid http(s) URL is required." }, 400);
    try {
      const existing = await env.STORAGE.list({ prefix: userLinksPrefix(auth.user.id), limit: MAX_OWN_LINKS + 1 });
      if (existing.objects.length >= MAX_OWN_LINKS) return json({ error: "Link limit reached." }, 409);
      await env.STORAGE.put(userLinkKey(auth.user.id, linkId), JSON.stringify(link), {
        httpMetadata: { contentType: "application/json;charset=UTF-8" },
        customMetadata: linkMetadata(link)
      });
      const labels = await fetchOwnerLabels(auth.secret, [auth.user.id]);
      link.owner_label = labels.get(auth.user.id) || "当前账号";
      link.is_own = true;
      return json({ link, created: true }, 201);
    } catch (error) {
      workerLog("error", "user_links.create.failed", { user_id: auth.user.id, message: String(error?.message || error) });
      return json({ error: "Could not create link." }, 503);
    }
  }

  if (request.method === "PUT") {
    const reference = requestedReference(url, auth);
    if (!reference) return json({ error: "Invalid link reference or permission denied." }, 403);
    const parsed = await parsePayload(request);
    if (parsed.error) return parsed.error;
    try {
      const previous = await readUserLink(env, reference.ownerId, reference.linkId);
      if (!previous) return json({ error: "Link not found." }, 404);
      const link = normalizeLink(parsed.value, reference.ownerId, reference.linkId, previous);
      if (!link.title || !link.url) return json({ error: "A title and valid URL are required." }, 400);
      await env.STORAGE.put(userLinkKey(reference.ownerId, reference.linkId), JSON.stringify(link), {
        httpMetadata: { contentType: "application/json;charset=UTF-8" },
        customMetadata: linkMetadata(link)
      });
      return json({ link, saved: true });
    } catch (error) {
      workerLog("error", "user_links.save.failed", { user_id: auth.user.id, owner_user_id: reference.ownerId, link_id: reference.linkId, message: String(error?.message || error) });
      return json({ error: "Could not save link." }, 503);
    }
  }

  if (request.method === "DELETE") {
    const reference = requestedReference(url, auth);
    if (!reference) return json({ error: "Invalid link reference or permission denied." }, 403);
    try {
      const existing = await env.STORAGE.head(userLinkKey(reference.ownerId, reference.linkId));
      if (!existing) return json({ error: "Link not found." }, 404);
      await env.STORAGE.delete(userLinkKey(reference.ownerId, reference.linkId));
      return json({ deleted: true, id: reference.linkId, owner_id: reference.ownerId });
    } catch (error) {
      workerLog("error", "user_links.delete.failed", { user_id: auth.user.id, owner_user_id: reference.ownerId, link_id: reference.linkId, message: String(error?.message || error) });
      return json({ error: "Could not delete link." }, 503);
    }
  }

  return json({ error: "Method not allowed" }, 405);
}
