import { SUPABASE_URL, SUPABASE_KEY, MAX_STORAGE_FILE_BYTES, MAX_STORAGE_LIST_OBJECTS, UUID_PATTERN } from "./config.js";
import { getSupabaseSecret, workerLog } from "./account-api.js";
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
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: authorization
      }
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

  let profileResponse;
  try {
    profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=status&id=eq.${encodeURIComponent(user.id)}`, {
      headers: {
        apikey: secret,
        ...(secret.split(".").length === 3 ? { Authorization: `Bearer ${secret}` } : {})
      }
    });
  } catch {
    return { error: json({ error: "Account service is temporarily unavailable." }, 503) };
  }
  if (!profileResponse.ok) {
    return { error: json({ error: "Account service is temporarily unavailable." }, 503) };
  }

  let profiles;
  try {
    profiles = await profileResponse.json();
  } catch {
    return { error: json({ error: "Account service is temporarily unavailable." }, 503) };
  }
  if (!Array.isArray(profiles) || profiles.length !== 1 || profiles[0]?.status !== "active") {
    return { error: json({ error: "Account is not authorized to use storage." }, 403) };
  }
  return { user };
}

class StorageSizeLimitError extends Error {}

export function sizeLimitedStorageBody(body, maximumBytes) {
  if (!body) return null;
  const reader = body.getReader();
  let total = 0;
  return new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        total += value.byteLength;
        if (total > maximumBytes) {
          await reader.cancel();
          controller.error(new StorageSizeLimitError("File exceeds the 50 MB limit."));
          return;
        }
        controller.enqueue(value);
      } catch (error) {
        controller.error(error);
      }
    },
    async cancel(reason) {
      await reader.cancel(reason);
    }
  });
}

export async function handleStorageFiles(request, env) {
  const auth = await verifyStorageUser(request, env);
  if (auth.error) return auth.error;
  if (!hasStorageBinding(env)) return storageUnavailable();

  const files = [];
  let cursor;
  let scanned = 0;
  let partial = false;
  try {
    do {
      const remaining = MAX_STORAGE_LIST_OBJECTS - scanned;
      const page = await env.STORAGE.list({
        prefix: storagePrefix(auth.user.id),
        cursor,
        limit: Math.min(1000, remaining),
        include: ["httpMetadata", "customMetadata"]
      });
      scanned += page.objects.length;
      for (const object of page.objects) {
        const id = object.key.slice(storagePrefix(auth.user.id).length);
        if (!isStorageObjectId(id)) continue;
        files.push({
          id,
          name: cleanStorageFilename(object.customMetadata?.originalName),
          size: Number(object.size) || 0,
          uploadedAt: object.uploaded?.toISOString?.() || null,
          contentType: storageContentType(object.httpMetadata?.contentType)
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
    workerLog("error", "storage.list.failed", { message: String(error?.message || error) });
    return storageUnavailable();
  }

  files.sort((a, b) => String(b.uploadedAt || "").localeCompare(String(a.uploadedAt || "")));
  return json({
    connected: true,
    files,
    file_count: files.length,
    used_bytes: files.reduce((total, file) => total + file.size, 0),
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
    await env.STORAGE.put(key, sizeLimitedStorageBody(request.body, MAX_STORAGE_FILE_BYTES), {
      httpMetadata: { contentType: storageContentType(request.headers.get("Content-Type")) },
      customMetadata: { originalName: name, ownerId: auth.user.id }
    });
  } catch (error) {
    try {
      await env.STORAGE.delete(key);
    } catch {}
    if (error instanceof StorageSizeLimitError || /50\s*MB|exceeds the 50 MB/i.test(String(error?.message || error))) {
      return json({ error: "File exceeds the 50 MB limit." }, 413);
    }
    workerLog("error", "storage.upload.failed", { message: String(error?.message || error) });
    return storageUnavailable();
  }

  return json({ id, name, message: "File uploaded." }, 201);
}

export async function handleStorageObject(request, env) {
  const auth = await verifyStorageUser(request, env);
  if (auth.error) return auth.error;
  if (!hasStorageBinding(env)) return storageUnavailable();

  const id = new URL(request.url).searchParams.get("id") || "";
  if (!isStorageObjectId(id)) return json({ error: "Invalid object id." }, 400);
  const key = storageKey(auth.user.id, id);

  if (request.method === "DELETE") {
    try {
      const existing = await env.STORAGE.head(key);
      if (!existing) return json({ error: "File not found." }, 404);
      await env.STORAGE.delete(key);
      return json({ id, message: "File deleted." });
    } catch (error) {
      workerLog("error", "storage.delete.failed", { message: String(error?.message || error) });
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
    workerLog("error", "storage.download.failed", { message: String(error?.message || error) });
    return storageUnavailable();
  }
}

