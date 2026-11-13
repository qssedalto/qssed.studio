import { isTexMainLocked, sourceInputError, texDocumentRevision, putTexDocument, TEX_WRITE_CONFLICT } from "./tex-document-guards.js";
import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { json } from "./routing.js";
import { verifyStudioApiSession, withStudioSessionCookies } from "./session-gate.js";
import { hasStorageBinding, isStorageObjectId } from "./storage-api.js";
import { workerLog } from "./server-runtime.js";
import { texRealtimeEpoch, texRealtimeRoomName } from "./tex-realtime-epoch.js";

const DOCUMENT_ROOT = "_system/tex-documents/";
const VERSION_ROOT = "_system/tex-versions/";
const RESULT_ROOT = "_system/tex-results/";
const ENGINES = new Set(["xelatex", "lualatex", "pdflatex"]);
const MAX_SOURCE_CHARS = 180000;
const MAX_PAYLOAD_BYTES = 512 * 1024;
const MAX_VERSIONS = 160;
const RECENT_VERSIONS = 28;
const AUTOSAVE_WINDOW_MS = 2 * 60 * 1000;
const legacyPdfPurged = new Set();
const versionMemory = new Map();

export async function handleTexVersionApi(request, env) {
  const identity = await identifyTexVersionUser(request);
  if (!identity.ok) return identity.response;
  if (!hasStorageBinding(env)) {
    return withStudioSessionCookies(json({ error: "TeX version storage is temporarily unavailable." }, 503), identity.cookies);
  }
  if (isMutation(request.method) && !isSameOriginMutation(request)) {
    return withStudioSessionCookies(json({ error: "Cross-origin TeX version writes are not allowed." }, 403), identity.cookies);
  }

  let response;
  try {
    response = request.method === "GET"
      ? await handleVersionGet(request, env, identity.userId)
      : request.method === "POST"
        ? await handleVersionPost(request, env, identity.userId)
        : json({ error: "Method not allowed" }, 405);
  } catch (error) {
    if (error?.code === TEX_WRITE_CONFLICT) return withStudioSessionCookies(json({error:error.message,code:error.code},409),identity.cookies);
    workerLog("error", "tex.versions.failed", {
      user_id: identity.userId,
      message: String(error?.message || error)
    });
    response = json({ error: "Could not load TeX version history." }, 503);
  }
  return withStudioSessionCookies(response, identity.cookies);
}

export async function identifyTexVersionUser(request) {
  const session = await verifyStudioApiSession(request);
  if (!session.ok) {
    return {
      ok: false,
      userId: "",
      cookies: session.cookies,
      response: withStudioSessionCookies(json({ error: "Authentication required." }, 401), session.cookies)
    };
  }

  const token = String(session.accessToken || "").trim();
  if (!token) {
    return {
      ok: false,
      userId: "",
      cookies: session.cookies,
      response: withStudioSessionCookies(json({ error: "Authentication required." }, 401), session.cookies)
    };
  }
  const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` };

  try {
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers });
    if (userResponse.status === 401 || userResponse.status === 403) {
      return { ok: false, userId: "", cookies: session.cookies, response: withStudioSessionCookies(json({ error: "Session is invalid or expired." }, 401), session.cookies) };
    }
    if (!userResponse.ok) {
      return { ok: false, userId: "", cookies: session.cookies, response: withStudioSessionCookies(json({ error: "Authentication service is temporarily unavailable." }, 503), session.cookies) };
    }
    const user = await userResponse.json();
    if (!isStorageObjectId(user?.id)) {
      return { ok: false, userId: "", cookies: session.cookies, response: withStudioSessionCookies(json({ error: "Session is invalid or expired." }, 401), session.cookies) };
    }

    const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=status&id=eq.${encodeURIComponent(user.id)}`, { headers });
    if (!profileResponse.ok) {
      return { ok: false, userId: "", cookies: session.cookies, response: withStudioSessionCookies(json({ error: "Account service is temporarily unavailable." }, 503), session.cookies) };
    }
    const profiles = await profileResponse.json();
    if (!Array.isArray(profiles) || profiles.length !== 1 || profiles[0]?.status !== "active") {
      return { ok: false, userId: "", cookies: session.cookies, response: withStudioSessionCookies(json({ error: "Account is not authorized to use TeX storage." }, 403), session.cookies) };
    }
    return { ok: true, userId: user.id, cookies: session.cookies, response: null };
  } catch {
    return { ok: false, userId: "", cookies: session.cookies, response: withStudioSessionCookies(json({ error: "Authentication service is temporarily unavailable." }, 503), session.cookies) };
  }
}

async function handleVersionGet(request, env, userId) {
  const url = new URL(request.url);
  const documentId = cleanObjectId(url.searchParams.get("document"));
  const versionId = cleanObjectId(url.searchParams.get("version"));
  if (!documentId) return json({ error: "Invalid TeX document identifier." }, 400);

  const current = await readCurrentDocument(env, userId, documentId);
  if (!current) return json({ error: "TeX document not found." }, 404);

  await purgeLegacyPdfResults(env, userId, documentId);

  if (versionId) {
    const version = await readVersion(env, userId, documentId, versionId);
    return version ? json({ version }) : json({ error: "TeX version not found." }, 404);
  }

  await snapshotDocumentVersion(env, userId, current, { reason: "current", force: true });
  const objects = await listVersionObjects(env, userId, documentId);
  const currentFingerprint = await fingerprintDocument(current);
  const versions = objects.map(object => versionSummary(object, userId, documentId)).filter(Boolean).map(version => ({
    ...version,
    is_current: version.fingerprint === currentFingerprint
  }));
  return json({ versions, count: versions.length, document_id: documentId, storage: "source-only", pdf_persisted: false });
}

async function handleVersionPost(request, env, userId) {
  const url = new URL(request.url);
  const action = String(url.searchParams.get("action") || "snapshot").toLowerCase();
  const parsed = await parsePayload(request);
  if (parsed.error) return parsed.error;
  const documentId = cleanObjectId(parsed.value?.document_id);
  if (!documentId) return json({ error: "Invalid TeX document identifier." }, 400);

  const current = await readCurrentDocument(env, userId, documentId);
  if (!current) return json({ error: "TeX document not found." }, 404);
  await purgeLegacyPdfResults(env, userId, documentId);

  if (action === "snapshot") {
    if (Object.hasOwn(parsed.value || {}, "source")) {
      const error = sourceInputError(parsed.value);
      if (error) return json({error},400);
    }
    const candidate = normalizeSnapshotInput(parsed.value, current, userId, documentId);
    if (!candidate.ok) return json({ error: candidate.error }, 400);
    const result = await snapshotDocumentVersion(env, userId, candidate.document, {
      reason: cleanReason(parsed.value?.reason || "manual"),
      force: true
    });
    return json({ version: result.version, created: result.created, skipped: result.skipped, pdf_persisted: false });
  }

  if (action === "restore") {
    if (isTexMainLocked(current)) return json({error:"Unlock the main file or project before restoring a version."},423);
    const versionId = cleanObjectId(parsed.value?.version_id);
    if (!versionId) return json({ error: "Invalid TeX version identifier." }, 400);
    const version = await readVersion(env, userId, documentId, versionId);
    if (!version) return json({ error: "TeX version not found." }, 404);
    const sourceError = sourceInputError(version);
    if (sourceError) return json({error:sourceError},413);

    await snapshotDocumentVersion(env, userId, current, { reason: "before_restore", force: true });
    const restored = {
      ...current,
      id: documentId,
      owner_id: userId,
      main_deleted: false,
      main_filename: current.main_filename || "main.tex",
      // A historical restore is a source replacement, not a Yjs edit.
      // Never let the prior room merge the rolled-back version away.
      realtime_epoch: crypto.randomUUID(),
      title: cleanText(version.title, 180) || "Untitled TeX document",
      engine: ENGINES.has(version.engine) ? version.engine : "xelatex",
      source: cleanSource(version.source),
      created_at: cleanTimestamp(current.created_at),
      updated_at: new Date().toISOString()
    };
    await writeCurrentDocument(env, restored, current.storage_revision);
    if (env?.TEX_COLLAB_ROOMS?.idFromName && env?.TEX_COLLAB_ROOMS?.get) {
      try {
        const stub = env.TEX_COLLAB_ROOMS.get(env.TEX_COLLAB_ROOMS.idFromName(
          texRealtimeRoomName(userId,documentId,texRealtimeEpoch(current))));
        await stub.fetch(new Request("https://tex-collaboration-room.internal/source-rebased",{
          method:"POST",headers:{
            "X-Qsseda-Collab-Owner":userId,
            "X-Qsseda-Collab-Document":documentId
          }
        }));
      } catch (error) {
        workerLog("warn","tex.version.realtime_notification_failed",{
          user_id:userId,document_id:documentId,message:String(error?.message||error)
        });
      }
    }
    const restoredVersion = await snapshotDocumentVersion(env, userId, restored, {
      reason: "restore",
      force: true,
      allowDuplicate: true
    });
    return json({ document: restored, restored_from: versionId, version: restoredVersion.version, restored: true });
  }

  return json({ error: "Unknown TeX version action." }, 404);
}

// 保存版本快照前要关联当前用户及文档，判断内容是否确实发生变化；历史版本属于可回滚记录，不是可任意覆盖的缓存。
export async function snapshotDocumentVersion(env, userId, document, options = {}) {
  if (!hasStorageBinding(env) || !isStorageObjectId(userId) || !isStorageObjectId(document?.id) || document?.owner_id !== userId) {
    return { version: null, created: false, skipped: true };
  }

  const normalized = normalizeSnapshotInput(document, document, userId, document.id);
  if (!normalized.ok) return { version: null, created: false, skipped: true };
  const candidate = normalized.document;
  const reason = cleanReason(options.reason || "autosave");
  const force = Boolean(options.force);
  const allowDuplicate = Boolean(options.allowDuplicate);
  const memoryKey = `${userId}:${candidate.id}`;
  const now = Date.now();
  let remembered = versionMemory.get(memoryKey) || null;

  if (!force && reason === "autosave" && remembered && now - remembered.createdMs < AUTOSAVE_WINDOW_MS && !materialChange(candidate, remembered)) {
    return { version: remembered.version || null, created: false, skipped: true };
  }

  const fingerprint = await fingerprintDocument(candidate);
  if (remembered?.fingerprint === fingerprint && !allowDuplicate) {
    return { version: remembered.version || null, created: false, skipped: true };
  }

  let objects = null;
  if (!remembered || force || allowDuplicate) {
    objects = await listVersionObjects(env, userId, candidate.id);
    const latest = objects[0] ? versionSummary(objects[0], userId, candidate.id) : null;
    if (latest) {
      remembered = {
        fingerprint: latest.fingerprint,
        createdMs: Date.parse(latest.created_at) || 0,
        sourceChars: latest.source_chars,
        title: latest.title,
        engine: latest.engine,
        version: latest
      };
      versionMemory.set(memoryKey, remembered);
      if (latest.fingerprint === fingerprint && !allowDuplicate) {
        return { version: latest, created: false, skipped: true };
      }
      if (!force && reason === "autosave" && now - remembered.createdMs < AUTOSAVE_WINDOW_MS && !materialChange(candidate, remembered)) {
        return { version: latest, created: false, skipped: true };
      }
    }
  }

  const versionId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const version = {
    id: versionId,
    owner_id: userId,
    document_id: candidate.id,
    title: candidate.title,
    engine: candidate.engine,
    source: candidate.source,
    reason,
    fingerprint,
    source_chars: candidate.source.length,
    document_updated_at: cleanTimestamp(candidate.updated_at),
    created_at: createdAt
  };

  await env.STORAGE.put(versionKey(userId, candidate.id, versionId), JSON.stringify(version), {
    httpMetadata: { contentType: "application/json;charset=UTF-8" },
    customMetadata: versionMetadata(version)
  });

  const summary = versionSummaryFromValue(version);
  versionMemory.set(memoryKey, {
    fingerprint,
    createdMs: Date.parse(createdAt),
    sourceChars: version.source_chars,
    title: version.title,
    engine: version.engine,
    version: summary
  });

  const approximateCount = Array.isArray(objects) ? objects.length + 1 : 0;
  if (approximateCount > 90) await pruneSmartVersions(env, userId, candidate.id);
  return { version: summary, created: true, skipped: false };
}

export async function purgeDocumentVersions(env, userId, documentId) {
  if (!hasStorageBinding(env) || !isStorageObjectId(userId) || !isStorageObjectId(documentId)) return;
  await deletePrefix(env, versionDocumentPrefix(userId, documentId));
  await deletePrefix(env, resultDocumentPrefix(userId, documentId));
  versionMemory.delete(`${userId}:${documentId}`);
  legacyPdfPurged.delete(`${userId}:${documentId}`);
}

async function purgeLegacyPdfResults(env, userId, documentId) {
  const key = `${userId}:${documentId}`;
  if (legacyPdfPurged.has(key)) return;
  await deletePrefix(env, resultDocumentPrefix(userId, documentId));
  legacyPdfPurged.add(key);
}

async function deletePrefix(env, prefix) {
  let cursor;
  do {
    const page = await env.STORAGE.list({ prefix, cursor, limit: 500 });
    if (page.objects.length) await Promise.all(page.objects.map(object => env.STORAGE.delete(object.key)));
    cursor = page.cursor;
    if (!page.truncated || !cursor) break;
  } while (cursor);
}

// 自动整理版本时要尊重版本保留策略，避免把用户需要用于恢复的文档历史一并删除。
async function pruneSmartVersions(env, userId, documentId) {
  const objects = await listVersionObjects(env, userId, documentId);
  if (objects.length <= 90) return;
  const summaries = objects.map(object => versionSummary(object, userId, documentId)).filter(Boolean);
  const keep = new Set();
  const buckets = new Set();
  const now = Date.now();

  for (let index = 0; index < summaries.length; index += 1) {
    const item = summaries[index];
    const timestamp = Date.parse(item.created_at) || 0;
    const age = Math.max(0, now - timestamp);
    const protectedReason = ["created", "compile", "restore", "before_restore", "manual"].includes(item.reason);
    if (index < RECENT_VERSIONS || protectedReason) {
      keep.add(item.id);
      continue;
    }
    let bucket;
    if (age < 48 * 60 * 60 * 1000) bucket = `h:${Math.floor(timestamp / (60 * 60 * 1000))}`;
    else if (age < 90 * 24 * 60 * 60 * 1000) bucket = `d:${Math.floor(timestamp / (24 * 60 * 60 * 1000))}`;
    else bucket = `w:${Math.floor(timestamp / (7 * 24 * 60 * 60 * 1000))}`;
    if (!buckets.has(bucket)) {
      buckets.add(bucket);
      keep.add(item.id);
    }
  }

  const orderedKept = summaries.filter(item => keep.has(item.id)).slice(0, MAX_VERSIONS);
  const finalKeep = new Set(orderedKept.map(item => item.id));
  const removals = objects.filter(object => {
    const parsed = parseVersionKey(object.key, userId, documentId);
    return parsed && !finalKeep.has(parsed.versionId);
  });
  if (removals.length) await Promise.all(removals.map(object => env.STORAGE.delete(object.key)));
}

async function listVersionObjects(env, userId, documentId) {
  const objects = [];
  let cursor;
  do {
    const page = await env.STORAGE.list({
      prefix: versionDocumentPrefix(userId, documentId),
      cursor,
      limit: 500,
      include: ["customMetadata"]
    });
    objects.push(...page.objects);
    cursor = page.cursor;
    if (!page.truncated || !cursor || objects.length >= 500) break;
  } while (cursor);
  objects.sort((a, b) => String(b.customMetadata?.createdAt || "").localeCompare(String(a.customMetadata?.createdAt || "")));
  return objects;
}

async function readVersion(env, userId, documentId, versionId) {
  const object = await env.STORAGE.get(versionKey(userId, documentId, versionId));
  if (!object) return null;
  try {
    const value = JSON.parse(await object.text());
    if (value?.owner_id !== userId || value?.document_id !== documentId || value?.id !== versionId) return null;
    return {
      id: versionId,
      owner_id: userId,
      document_id: documentId,
      title: cleanText(value.title, 180),
      engine: ENGINES.has(value.engine) ? value.engine : "xelatex",
      source: cleanSource(value.source),
      reason: cleanReason(value.reason),
      fingerprint: cleanFingerprint(value.fingerprint),
      source_chars: Math.max(0, Number(value.source_chars) || String(value.source || "").length),
      document_updated_at: cleanTimestamp(value.document_updated_at),
      created_at: cleanTimestamp(value.created_at)
    };
  } catch {
    return null;
  }
}

async function readCurrentDocument(env, userId, documentId) {
  const object = await env.STORAGE.get(documentKey(userId, documentId));
  if (!object) return null;
  try {
    const value = JSON.parse(await object.text());
    if (value?.owner_id !== userId || value?.id !== documentId || value.document_deleted) return null;
    return texDocumentRevision({
      ...value,
      id: documentId,
      owner_id: userId,
      title: cleanText(value.title, 180) || "Untitled TeX document",
      engine: ENGINES.has(value.engine) ? value.engine : "xelatex",
      source: cleanSource(value.source),
      realtime_epoch: texRealtimeEpoch(value),
      created_at: cleanTimestamp(value.created_at),
      updated_at: cleanTimestamp(value.updated_at)
    }, object);
  } catch {
    return null;
  }
}

async function writeCurrentDocument(env, document, previousRevision) {
  await putTexDocument(env.STORAGE, documentKey(document.owner_id, document.id), document, {
    httpMetadata: { contentType: "application/json;charset=UTF-8" },
    customMetadata: {
      ownerId: document.owner_id,
      hidden: "true",
      kind: "tex-document",
      title: document.title,
      engine: document.engine,
      preview: document.source.replace(/\s+/g, " ").trim().slice(0, 220),
      createdAt: document.created_at,
      updatedAt: document.updated_at,
      realtimeEpoch: texRealtimeEpoch(document),
      projectType: document.project_type || "legacy", fileCount: String((document.main_deleted ? 0 : 1) + (document.files?.length || 0)),
      pinned: document.pinned ? "true" : "false", locked: document.locked ? "true" : "false"
    }
  }, previousRevision);
}

function normalizeSnapshotInput(input, current, userId, documentId) {
  const value = input && typeof input === "object" ? input : {};
  const engine = cleanText(value.engine ?? current.engine, 24) || "xelatex";
  if (!ENGINES.has(engine)) return { ok: false, error: "Unsupported TeX engine." };
  const source = cleanSource(value.source ?? current.source);
  return {
    ok: true,
    document: {
      id: documentId,
      owner_id: userId,
      title: cleanText(value.title ?? current.title, 180) || "Untitled TeX document",
      engine,
      source,
      created_at: cleanTimestamp(current.created_at),
      updated_at: cleanTimestamp(current.updated_at)
    }
  };
}

function versionMetadata(version) {
  return {
    ownerId: version.owner_id,
    hidden: "true",
    kind: "tex-version",
    versionId: version.id,
    documentId: version.document_id,
    title: version.title,
    engine: version.engine,
    reason: version.reason,
    fingerprint: version.fingerprint,
    sourceChars: String(version.source_chars || 0),
    preview: version.source.replace(/\s+/g, " ").trim().slice(0, 220),
    documentUpdatedAt: version.document_updated_at,
    createdAt: version.created_at
  };
}

function versionSummary(object, userId, documentId) {
  const parsed = parseVersionKey(object?.key, userId, documentId);
  const meta = object?.customMetadata;
  if (!parsed || !meta || meta.kind !== "tex-version" || meta.ownerId !== userId || meta.documentId !== documentId || meta.versionId !== parsed.versionId) return null;
  return {
    id: parsed.versionId,
    document_id: documentId,
    title: cleanText(meta.title, 180),
    engine: ENGINES.has(meta.engine) ? meta.engine : "xelatex",
    reason: cleanReason(meta.reason),
    fingerprint: cleanFingerprint(meta.fingerprint),
    source_chars: Math.max(0, Number(meta.sourceChars) || 0),
    preview: cleanText(meta.preview, 220),
    document_updated_at: cleanTimestamp(meta.documentUpdatedAt),
    created_at: cleanTimestamp(meta.createdAt)
  };
}

function versionSummaryFromValue(version) {
  return {
    id: version.id,
    document_id: version.document_id,
    title: version.title,
    engine: version.engine,
    reason: version.reason,
    fingerprint: version.fingerprint,
    source_chars: version.source_chars,
    preview: version.source.replace(/\s+/g, " ").trim().slice(0, 220),
    document_updated_at: version.document_updated_at,
    created_at: version.created_at
  };
}

function materialChange(document, remembered) {
  if (!remembered) return true;
  if (document.title !== remembered.title || document.engine !== remembered.engine) return true;
  const before = Math.max(0, Number(remembered.sourceChars) || 0);
  const after = document.source.length;
  const delta = Math.abs(after - before);
  return delta >= 1200 || delta >= Math.max(240, Math.round(before * 0.18));
}

async function fingerprintDocument(document) {
  const text = `${document.title}\n${document.engine}\n${document.source}`;
  const bytes = new TextEncoder().encode(text);
  if (globalThis.crypto?.subtle) {
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest)).map(value => value.toString(16).padStart(2, "0")).join("");
  }
  let hash = 2166136261;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

async function parsePayload(request) {
  const declared = Number(request.headers.get("Content-Length") || 0);
  if (declared > MAX_PAYLOAD_BYTES) return { error: json({ error: "TeX version payload is too large." }, 413) };
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_PAYLOAD_BYTES) return { error: json({ error: "TeX version payload is too large." }, 413) };
    return { value: JSON.parse(raw || "{}") };
  } catch {
    return { error: json({ error: "Invalid TeX version payload." }, 400) };
  }
}

function isMutation(method) {
  return method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";
}

function isSameOriginMutation(request) {
  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get("Origin");
  if (origin) {
    try { return new URL(origin).origin === requestOrigin; } catch { return false; }
  }
  const fetchSite = String(request.headers.get("Sec-Fetch-Site") || "").toLowerCase();
  return fetchSite === "same-origin" || fetchSite === "same-site";
}

function cleanSource(value) {
  return String(value ?? "");
}

function cleanText(value, maximum) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maximum);
}

function cleanTimestamp(value) {
  const timestamp = Date.parse(String(value || ""));
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : new Date(0).toISOString();
}

function cleanReason(value) {
  const reason = String(value || "").trim().toLowerCase();
  return ["created", "autosave", "compile", "manual", "current", "restore", "before_restore"].includes(reason) ? reason : "manual";
}

function cleanFingerprint(value) {
  const text = String(value || "").trim().toLowerCase();
  return /^[a-f0-9]{8,64}$/.test(text) ? text : "";
}

function cleanObjectId(value) {
  const text = String(value || "").trim();
  return isStorageObjectId(text) ? text : "";
}

function documentKey(userId, documentId) {
  return `${DOCUMENT_ROOT}${userId}/${documentId}.json`;
}

function versionDocumentPrefix(userId, documentId) {
  return `${VERSION_ROOT}${userId}/${documentId}/`;
}

function versionKey(userId, documentId, versionId) {
  return `${versionDocumentPrefix(userId, documentId)}${versionId}.json`;
}

function resultDocumentPrefix(userId, documentId) {
  return `${RESULT_ROOT}${userId}/${documentId}/`;
}

function parseVersionKey(key, expectedOwnerId, expectedDocumentId) {
  const parts = String(key || "").split("/");
  if (parts.length !== 5 || parts[0] !== "_system" || parts[1] !== "tex-versions" || parts[2] !== expectedOwnerId || parts[3] !== expectedDocumentId || !parts[4].endsWith(".json")) return null;
  const versionId = parts[4].slice(0, -5);
  return isStorageObjectId(versionId) ? { versionId } : null;
}
