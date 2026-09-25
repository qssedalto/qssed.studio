import { SUPABASE_URL, SUPABASE_KEY, MAX_STORAGE_FILE_BYTES, MAX_STORAGE_LIST_OBJECTS, UUID_PATTERN } from "./config.js";
import { getSupabaseSecret, workerLog } from "./server-runtime.js";
import { json } from "./routing.js";

export function storageUnavailable() {
  return json({ error: "Storage service is temporarily unavailable." }, 503);
}

export function hasStorageBinding(env) {
  return Boolean(env?.STORAGE && ["list", "get", "put", "head", "delete"].every(method => typeof env.STORAGE[method] === "function"));
}

export function isStorageObjectId(value) {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function storageKey(ownerId, objectId) {
  return `users/${ownerId}/${objectId}`;
}

export function storagePrefix(ownerId) {
  return `users/${ownerId}/`;
}

function serviceHeaders(secret) {
  return {
    apikey: secret,
    ...(secret.split(".").length === 3 ? { Authorization: `Bearer ${secret}` } : {})
  };
}

function parseStorageKey(key) {
  const parts = String(key || "").split("/");
  if (parts.length !== 3 || parts[0] !== "users" || !isStorageObjectId(parts[1]) || !isStorageObjectId(parts[2])) return null;
  return { ownerId: parts[1], objectId: parts[2] };
}

function parseObjectReference(value) {
  const raw = String(value || "");
  if (isStorageObjectId(raw)) return { ownerId: null, objectId: raw };
  const parts = raw.split(":");
  if (parts.length !== 2 || !isStorageObjectId(parts[0]) || !isStorageObjectId(parts[1])) return null;
  return { ownerId: parts[0], objectId: parts[1] };
}

function cleanProfileLabel(value, maximum = 120) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maximum);
}

async function fetchOwnerProfiles(secret, ownerIds) {
  const map = new Map();
  const ids = [...new Set(ownerIds.filter(isStorageObjectId))];
  for (let index = 0; index < ids.length; index += 100) {
    const chunk = ids.slice(index, index + 100);
    const url = new URL(`${SUPABASE_URL}/rest/v1/profiles`);
    url.searchParams.set("select", "id,username,display_name");
    url.searchParams.set("id", `in.(${chunk.join(",")})`);
    try {
      const response = await fetch(url.toString(), { headers: serviceHeaders(secret) });
      if (!response.ok) {
        workerLog("warn", "storage.owner_profiles.failed", { upstream_status: response.status, owner_count: chunk.length });
        continue;
      }
      const rows = await response.json();
      if (!Array.isArray(rows)) continue;
      for (const row of rows) {
        if (!isStorageObjectId(row?.id)) continue;
        map.set(row.id, {
          username: cleanProfileLabel(row?.username, 80),
          displayName: cleanProfileLabel(row?.display_name, 120)
        });
      }
    } catch (error) {
      workerLog("warn", "storage.owner_profiles.error", { error_type: error?.name || "Error", owner_count: chunk.length });
    }
  }
  return map;
}

function ownerDisplay(profile, ownerId) {
  const username = profile?.username || "";
  const displayName = profile?.displayName || "";
  if (displayName && username && displayName.toLocaleLowerCase() !== username.toLocaleLowerCase()) {
    return `${displayName} · @${username}`;
  }
  if (username) return `@${username}`;
  if (displayName) return displayName;
  return `用户 ${String(ownerId || "").slice(0, 8)}`;
}

export function cleanStorageFilename(value) {
  const normalized = String(value || "")
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[\\/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return Array.from(normalized).slice(0, 180).join("") || "file";
}

export function storageContentType(value) {
  const type = String(value || "").trim().toLowerCase();
  return /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+(?:\s*;\s*charset=[a-z0-9._-]+)?$/.test(type)
    ? type.slice(0, 160)
    : "application/octet-stream";
}

export function storageDownloadDisposition(filename) {
  const safeName = cleanStorageFilename(filename);
  const fallback = Array.from(safeName)
    .map(char => /[A-Za-z0-9._-]/.test(char) ? char : "_")
    .join("")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120) || "file";
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encodeRfc8187Filename(safeName)}`;
}

export function encodeRfc8187Filename(value) {
  return encodeURIComponent(value).replace(/['()*]/g, character => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

export async function verifyStorageUser(request, env) {
  const authorization = request.headers.get("Authorization") || "";
  if (!/^Bearer\s+\S+$/i.test(authorization)) {
    return { error: json({ error: "Authentication required." }, 401) };
  }

  let response;
  try {
    response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_KEY, Authorization: authorization }
    });
  } catch {
    return { error: json({ error: "Authentication service is temporarily unavailable." }, 503) };
  }

  if (response.status === 401 || response.status === 403) {
    return { error: json({ error: "Session is invalid or expired." }, 401) };
  }
  if (!response.ok) {
    return { error: json({ error: "Authentication service is temporarily unavailable." }, 503) };
  }

  let user;
  try {
    user = await response.json();
  } catch {
    return { error: json({ error: "Authentication service is temporarily unavailable." }, 503) };
  }
  if (!isStorageObjectId(user?.id)) {
    return { error: json({ error: "Session is invalid or expired." }, 401) };
  }

  const secret = getSupabaseSecret(env);
  if (!secret) {
    return { error: json({ error: "Account service is temporarily unavailable." }, 503) };
  }

  let profiles;
  try {
    const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=status&id=eq.${encodeURIComponent(user.id)}`, {
      headers: serviceHeaders(secret)
    });
    if (!profileResponse.ok) return { error: json({ error: "Account service is temporarily unavailable." }, 503) };
    profiles = await profileResponse.json();
  } catch {
    return { error: json({ error: "Account service is temporarily unavailable." }, 503) };
  }

  if (!Array.isArray(profiles) || profiles.length !== 1 || profiles[0]?.status !== "active") {
    return { error: json({ error: "Account is not authorized to use storage." }, 403) };
  }

  return { user, secret };
}

export async function handleStorageFiles(request, env) {
  const auth = await verifyStorageUser(request, env);
  if (auth.error) return auth.error;
  if (!hasStorageBinding(env)) return storageUnavailable();

  const files = [];
  const prefix = storagePrefix(auth.user.id);
  let cursor;
  let scanned = 0;
  let partial = false;

  try {
    do {
      const remaining = MAX_STORAGE_LIST_OBJECTS - scanned;
      const page = await env.STORAGE.list({
        prefix,
        cursor,
        limit: Math.min(1000, remaining),
        include: ["httpMetadata", "customMetadata"]
      });
      scanned += page.objects.length;

      for (const object of page.objects) {
        const parsed = parseStorageKey(object.key);
        if (!parsed) continue;
        if (parsed.ownerId !== auth.user.id) continue;

        const mediaType = storageContentType(object.httpMetadata?.contentType);
        files.push({
          id: parsed.objectId,
          name: cleanStorageFilename(object.customMetadata?.originalName),
          size: Number(object.size) || 0,
          uploadedAt: object.uploaded?.toISOString?.() || null,
          contentType: mediaType,
          mediaType
        });
      }

      cursor = page.cursor;
      if (!page.truncated) break;
      if (scanned >= MAX_STORAGE_LIST_OBJECTS || !cursor) {
        partial = true;
        break;
      }
    } while (cursor);
  } catch (error) {
    workerLog("error", "storage.list.failed", { message: String(error?.message || error), user_id: auth.user.id });
    return storageUnavailable();
  }

  const visibleUsedBytes = files.reduce((total, file) => total + file.size, 0);

  files.sort((a, b) => String(b.uploadedAt || "").localeCompare(String(a.uploadedAt || "")));
  return json({
    connected: true,
    scope: "own",
    usage_scope: "own-user-files",
    files,
    file_count: files.length,
    visible_used_bytes: visibleUsedBytes,
    used_bytes: visibleUsedBytes,
    partial
  });
}

export async function handleStorageUpload(request, env) {
  const auth = await verifyStorageUser(request, env);
  if (auth.error) return auth.error;
  if (!hasStorageBinding(env)) return storageUnavailable();

  const headerSize = request.headers.get("Content-Length") || request.headers.get("X-File-Size");
  if (headerSize && (!/^\d+$/.test(headerSize) || Number(headerSize) > MAX_STORAGE_FILE_BYTES)) {
    return json({ error: "File exceeds the 50 MB limit." }, 413);
  }
  if (!request.body) return json({ error: "A file body is required." }, 400);

  const id = crypto.randomUUID();
  const key = storageKey(auth.user.id, id);
  const name = cleanStorageFilename(new URL(request.url).searchParams.get("name"));
  try {
    await env.STORAGE.put(key, request.body, {
      httpMetadata: { contentType: storageContentType(request.headers.get("Content-Type")) },
      customMetadata: { originalName: name, ownerId: auth.user.id }
    });
  } catch (error) {
    try { await env.STORAGE.delete(key); } catch {}
    workerLog("error", "storage.upload.failed", { message: String(error?.message || error) });
    return storageUnavailable();
  }

  return json({ id, name, message: "File uploaded." }, 201);
}

export async function handleStorageObject(request, env) {
  const auth = await verifyStorageUser(request, env);
  if (auth.error) return auth.error;
  if (!hasStorageBinding(env)) return storageUnavailable();

  const rawId = new URL(request.url).searchParams.get("id") || "";
  const reference = parseObjectReference(rawId);
  if (!reference) return json({ error: "Invalid object id." }, 400);

  if (reference.ownerId && reference.ownerId !== auth.user.id) {
    return json({ error: "Storage object not found." }, 404);
  }
  const ownerId = auth.user.id;
  const key = storageKey(ownerId, reference.objectId);

  if (request.method === "DELETE") {
    try {
      const existing = await env.STORAGE.head(key);
      if (!existing) return json({ error: "File not found." }, 404);
      await env.STORAGE.delete(key);
      return json({ id: reference.objectId, message: "File deleted." });
    } catch (error) {
      workerLog("error", "storage.delete.failed", { message: String(error?.message || error), owner_user_id: ownerId });
      return storageUnavailable();
    }
  }

  try {
    const object = await env.STORAGE.get(key);
    if (!object) return json({ error: "File not found." }, 404);
    return new Response(object.body, {
      headers: {
        "content-type": "application/octet-stream",
        "content-disposition": storageDownloadDisposition(object.customMetadata?.originalName),
        "cache-control": "private, no-store",
        "x-content-type-options": "nosniff"
      }
    });
  } catch (error) {
    workerLog("error", "storage.download.failed", { message: String(error?.message || error), owner_user_id: ownerId });
    return storageUnavailable();
  }
}
