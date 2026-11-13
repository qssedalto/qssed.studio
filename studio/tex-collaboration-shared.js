import { sourceInputError, isTexMainLocked, texDocumentRevision, putTexDocument, TEX_WRITE_CONFLICT } from "./tex-document-guards.js";
import { SUPABASE_KEY, SUPABASE_URL } from "./config.js";
import { json } from "./routing.js";
import { verifyStudioApiSession, withStudioSessionCookies } from "./session-gate.js";
import { hasStorageBinding, isStorageObjectId } from "./storage-api.js";
import { workerLog } from "./server-runtime.js";
import { resolveLinkGrant } from "./tex-link-capabilities.js";
import { reconcileTexMainEntry } from "./tex-main-entry.js";
import { texRealtimeEpoch } from "./tex-realtime-epoch.js";

const DOCUMENT_ROOT = "_system/tex-documents/";
const ENGINES = new Set(["xelatex", "lualatex", "pdflatex"]);
const MAX_SOURCE_CHARS = 180000;
const MAX_PAYLOAD_BYTES = 512 * 1024;
const MAX_SHARED_DOCUMENTS = 120;

export async function handleTexSharedCollaboration(request, env) {
  const session = await verifyStudioApiSession(request);
  if (!session.ok) return withStudioSessionCookies(json({ error: "Authentication required." }, 401), session.cookies);

  const auth = await verifyActiveUser(session.accessToken);
  if (auth.error) return withStudioSessionCookies(auth.error, session.cookies);
  if (!hasStorageBinding(env)) return withStudioSessionCookies(json({ error: "TeX storage is temporarily unavailable." }, 503), session.cookies);

  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method) && !isSameOriginMutation(request)) {
    return withStudioSessionCookies(json({ error: "Cross-origin TeX writes are not allowed." }, 403), session.cookies);
  }

  let response;
  if (request.method === "GET") response = await handleGet(request, env, auth, session.accessToken);
  else if (request.method === "PUT") response = await handleUpdate(request, env, auth, session.accessToken);
  else response = json({ error: "Method not allowed" }, 405);
  return withStudioSessionCookies(response, session.cookies);
}

async function handleGet(request, env, auth, accessToken) {
  const url = new URL(request.url);
  const documentId = cleanObjectId(url.searchParams.get("document"));
  if (!documentId) return listSharedDocuments(env, auth.user.id, accessToken);

  const access = await resolveSharedAccess(auth.user.id, documentId, accessToken) ||
    await resolveLinkGrant(env, auth.user.id, documentId);
  if (!access) return json({ error: "Shared TeX document not found." }, 404);

  if (url.searchParams.get("participants") === "1") {
    const participants = await loadParticipants(access.owner_id, documentId, accessToken);
    if (!participants.ok) return json({ error: participants.error }, participants.status);
    return json({
      document_id: documentId,
      owner_id: access.owner_id,
      can_manage: false,
      access_role: access.role,
      realtime_ready: true,
      sync_mode: "yjs-websocket",
      participants: participants.items
    });
  }

  const document = await readOwnerDocument(env, access.owner_id, documentId);
  if (!document) return json({ error: "Shared TeX document not found." }, 404);
  return json({
    document: {
      ...document,
      shared: true,
      collaboration_role: access.role
    },
    access: { role: access.role, owner_id: access.owner_id }
  });
}

async function handleUpdate(request, env, auth, accessToken) {
  const url = new URL(request.url);
  const documentId = cleanObjectId(url.searchParams.get("document"));
  if (!documentId) return json({ error: "Invalid TeX document identifier." }, 400);

  const access = await resolveSharedAccess(auth.user.id, documentId, accessToken) ||
    await resolveLinkGrant(env, auth.user.id, documentId);
  if (!access) return json({ error: "Shared TeX document not found." }, 404);
  if (access.role !== "editor") return json({ error: "This shared TeX document is read-only." }, 403);

  const parsed = await parsePayload(request);
  if (parsed.error) return parsed.error;
  const previous = await readOwnerDocument(env, access.owner_id, documentId);
  if (!previous) return json({ error: "Shared TeX document not found." }, 404);
  if (isTexMainLocked(previous)) return json({ error: "This project is locked by its owner." }, 423);
  if (previous.main_deleted === true) return json({error:"This project has no TeX entry. Add a root .tex file first."},409);
  if ((typeof parsed.value?.realtime_epoch !== "string" || texRealtimeEpoch(parsed.value.realtime_epoch) !== texRealtimeEpoch(previous)))
    return json({error:"The main TeX entry changed. Reopen the project before saving.",code:"main_revision_changed"},409);

  const normalized = normalizeSharedDocument(parsed.value, previous);
  if (!normalized.ok) return json({ error: normalized.error }, 400);
  try {
    await writeDocument(env, normalized.value, previous.storage_revision);
    return json({
      document: {
        ...normalized.value,
        shared: true,
        collaboration_role: access.role
      },
      saved: true,
      document_id: documentId,
      owner_id: access.owner_id,
      collaboration_role: access.role
    });
  } catch (error) {
    if (error?.code === TEX_WRITE_CONFLICT) return json({ error: error.message, code: error.code }, 409);
    workerLog("error", "tex.shared_document.update.failed", {
      user_id: auth.user.id,
      owner_id: access.owner_id,
      document_id: documentId,
      message: String(error?.message || error)
    });
    return json({ error: "Could not save the shared TeX document." }, 503);
  }
}

async function listSharedDocuments(env, userId, accessToken) {
  const response = await supabaseRequest(
    `/rest/v1/tex_document_collaborators?select=owner_id,document_id,role,updated_at&member_id=eq.${encodeURIComponent(userId)}&order=updated_at.desc&limit=${MAX_SHARED_DOCUMENTS}`,
    accessToken
  );
  if (!response.ok) return json({ error: "Could not load shared TeX documents." }, response.status === 401 || response.status === 403 ? 401 : 503);

  const rows = await response.json().catch(() => []);
  const membershipRows = Array.isArray(rows) ? rows : [];

  const summaries = await Promise.all(membershipRows.map(async row => {
    const ownerId = cleanObjectId(row?.owner_id);
    const documentId = cleanObjectId(row?.document_id);
    const role = row?.role === "editor" ? "editor" : "viewer";
    if (!ownerId || !documentId) return null;
    try {
      const object = await env.STORAGE.head(documentKey(ownerId, documentId));
      if (!object) return null;
      const summary = documentFromMetadata(object.customMetadata, ownerId, documentId);
      if (!summary) return null;
      return { ...summary, shared: true, owner_id: ownerId, collaboration_role: role };
    } catch {
      return null;
    }
  }));

  // Link-derived grants are indexed per authenticated account. Recheck the
  // live config on every list request so revocation is immediate.
  const grantIndex = await env.STORAGE.list({
    prefix: "_system/tex-share-grants/" + userId + "/",
    limit: MAX_SHARED_DOCUMENTS
  });
  const granted = await Promise.all(grantIndex.objects.map(async item => {
    const match = item.key.match(/\/([0-9a-f-]{36})\.json$/i);
    const docId = match?.[1];
    if (!docId || !cleanObjectId(docId)) return null;
    const access = await resolveLinkGrant(env, userId, docId);
    if (!access) return null;
    const entry = await env.STORAGE.head(documentKey(access.owner_id, docId));
    if (!entry) return null;
    const summary = documentFromMetadata(entry.customMetadata, access.owner_id, docId);
    return summary ? { ...summary, shared: true, owner_id: access.owner_id, collaboration_role: access.role } : null;
  }));
  const seen = new Set();
  const documents = [...summaries,...granted].filter(item => {
    if (!item) return false;
    const key=item.owner_id+":"+item.id;
    if(seen.has(key))return false;
    seen.add(key);return true;
  }).sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")));
  return json({ documents, count: documents.length, scope: "shared" });
}

async function resolveSharedAccess(userId, documentId, accessToken) {
  const response = await supabaseRequest(
    `/rest/v1/tex_document_collaborators?select=owner_id,document_id,role&member_id=eq.${encodeURIComponent(userId)}&document_id=eq.${encodeURIComponent(documentId)}&limit=1`,
    accessToken
  );
  if (!response.ok) return null;
  const rows = await response.json().catch(() => []);
  const row = Array.isArray(rows) ? rows[0] : null;
  const ownerId = cleanObjectId(row?.owner_id);
  if (!ownerId || cleanObjectId(row?.document_id) !== documentId) return null;
  return { owner_id: ownerId, role: row?.role === "editor" ? "editor" : "viewer" };
}

async function loadParticipants(ownerId, documentId, accessToken) {
  const response = await supabaseRequest("/rest/v1/rpc/tex_collaboration_participants", accessToken, {
    method: "POST",
    body: JSON.stringify({ p_owner_id: ownerId, p_document_id: documentId })
  });
  if (!response.ok) return { ok: false, status: response.status === 401 || response.status === 403 ? 401 : 503, error: "Could not load collaboration participants." };
  const rows = await response.json().catch(() => []);
  const items = (Array.isArray(rows) ? rows : []).map(row => ({
    id: cleanObjectId(row?.participant_id),
    role: row?.is_owner ? "owner" : row?.role === "editor" ? "editor" : "viewer",
    username: cleanText(row?.username, 80),
    display_name: cleanText(row?.display_name, 120),
    avatar_url: cleanUrl(row?.avatar_url),
    is_owner: row?.is_owner === true,
    created_at: row?.created_at || "",
    updated_at: row?.updated_at || ""
  })).filter(item => item.id);
  return { ok: true, items };
}

async function verifyActiveUser(accessToken) {
  const token = String(accessToken || "").trim();
  if (!token) return { error: json({ error: "Authentication required." }, 401) };
  const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` };

  let userResponse;
  try { userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers }); }
  catch { return { error: json({ error: "Authentication service is temporarily unavailable." }, 503) }; }
  if (userResponse.status === 401 || userResponse.status === 403) return { error: json({ error: "Session is invalid or expired." }, 401) };
  if (!userResponse.ok) return { error: json({ error: "Authentication service is temporarily unavailable." }, 503) };
  const user = await userResponse.json().catch(() => null);
  if (!cleanObjectId(user?.id)) return { error: json({ error: "Session is invalid or expired." }, 401) };

  const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=status,username,display_name,avatar_url&id=eq.${encodeURIComponent(user.id)}`, { headers }).catch(() => null);
  if (!profileResponse?.ok) return { error: json({ error: "Account service is temporarily unavailable." }, 503) };
  const profiles = await profileResponse.json().catch(() => []);
  const profile = Array.isArray(profiles) ? profiles[0] : null;
  if (!profile || profile.status !== "active") return { error: json({ error: "Account is not authorized to use TeX collaboration." }, 403) };
  return { user, profile };
}

async function supabaseRequest(path, accessToken, options = {}) {
  return fetch(`${SUPABASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json;charset=UTF-8" } : {})
    },
    body: options.body
  });
}

async function readOwnerDocument(env, ownerId, documentId) {
  const object = await env.STORAGE.get(documentKey(ownerId, documentId));
  if (!object) return null;
  try {
    const stored = JSON.parse(await object.text());
    if (!stored || stored.document_deleted || stored.owner_id !== ownerId || stored.id !== documentId) return null;
    const parsed = reconcileTexMainEntry(stored);
    return texDocumentRevision({
      id: documentId,
      owner_id: ownerId,
      title: cleanText(parsed.title, 180) || "Untitled TeX document",
      engine: ENGINES.has(parsed.engine) ? parsed.engine : "xelatex",
      source: cleanSource(parsed.source),
      main_filename: parsed.main_filename || "main.tex",
      realtime_epoch: texRealtimeEpoch(parsed),
      main_deleted: parsed.main_deleted === true,
      created_at: cleanTimestamp(parsed.created_at),
      updated_at: cleanTimestamp(parsed.updated_at),
      files: Array.isArray(parsed.files) ? parsed.files : [],
      project_type: parsed.project_type || "legacy",
      pinned:parsed.pinned===true,locked:parsed.locked===true,
      pinned_files:Array.isArray(parsed.pinned_files)?parsed.pinned_files:[],
      locked_files:Array.isArray(parsed.locked_files)?parsed.locked_files:[],
      pinned_folders:Array.isArray(parsed.pinned_folders)?parsed.pinned_folders:[],
      locked_folders:Array.isArray(parsed.locked_folders)?parsed.locked_folders:[]
    }, object);
  } catch {
    return null;
  }
}

function normalizeSharedDocument(input, previous) {
  const inputError = sourceInputError(input);
  if (inputError) return { ok: false, error: inputError };
  const source = input && typeof input === "object" ? input : {};
  const engine = cleanText(source.engine, 24) || previous.engine || "xelatex";
  if (!ENGINES.has(engine)) return { ok: false, error: "Unsupported TeX engine." };
  return {
    ok: true,
    value: {
      ...previous,
      id: previous.id,
      owner_id: previous.owner_id,
      title: cleanText(source.title, 180) || "Untitled TeX document",
      engine,
      source: cleanSource(source.source),
      created_at: previous.created_at,
      updated_at: new Date().toISOString()
    }
  };
}

async function writeDocument(env, document, previousRevision) {
  await putTexDocument(env.STORAGE, documentKey(document.owner_id, document.id), document, {
    httpMetadata: { contentType: "application/json;charset=UTF-8" },
    customMetadata: documentMetadata(document)
  }, previousRevision);
}

function documentMetadata(document) {
  return {
    ownerId: document.owner_id,
    hidden: "true",
    kind: "tex-document",
    title: document.title,
    engine: document.engine,
    preview: document.source.replace(/\s+/g, " ").trim().slice(0, 220),
    pinned:document.pinned?"true":"false",locked:document.locked?"true":"false",
    createdAt: document.created_at,
    updatedAt: document.updated_at,
    realtimeEpoch: texRealtimeEpoch(document)
  };
}

function documentFromMetadata(meta, ownerId, documentId) {
  if (!meta || meta.kind !== "tex-document" || meta.ownerId !== ownerId) return null;
  return {
    id: documentId,
    title: cleanText(meta.title, 180) || "Untitled TeX document",
    engine: ENGINES.has(meta.engine) ? meta.engine : "xelatex",
    preview: cleanText(meta.preview, 220),
    created_at: cleanTimestamp(meta.createdAt),
    updated_at: cleanTimestamp(meta.updatedAt)
  };
}

async function parsePayload(request) {
  const declared = Number(request.headers.get("Content-Length") || 0);
  if (declared > MAX_PAYLOAD_BYTES) return { error: json({ error: "TeX payload is too large." }, 413) };
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_PAYLOAD_BYTES) return { error: json({ error: "TeX payload is too large." }, 413) };
    return { value: JSON.parse(raw || "{}") };
  } catch {
    return { error: json({ error: "Invalid TeX payload." }, 400) };
  }
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

function documentKey(ownerId, documentId) {
  return `${DOCUMENT_ROOT}${ownerId}/${documentId}.json`;
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

function cleanObjectId(value) {
  const text = String(value || "").trim();
  return isStorageObjectId(text) ? text : "";
}

function cleanUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  try {
    const parsed = new URL(text);
    return parsed.protocol === "https:" ? parsed.toString().slice(0, 500) : "";
  } catch {
    return "";
  }
}
