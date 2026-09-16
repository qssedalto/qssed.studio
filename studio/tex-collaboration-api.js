import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { json } from "./routing.js";
import { verifyStudioApiSession, withStudioSessionCookies } from "./session-gate.js";
import { hasStorageBinding, isStorageObjectId } from "./storage-api.js";
import { workerLog } from "./server-runtime.js";

const DOCUMENT_ROOT = "_system/tex-documents/";
const ROLES = new Set(["viewer", "editor"]);
const MAX_BODY_BYTES = 16 * 1024;

export async function handleTexCollaborationApi(request, env) {
  const session = await verifyStudioApiSession(request);
  if (!session.ok) return withStudioSessionCookies(json({ error: "Authentication required." }, 401), session.cookies);

  const auth = await verifyActiveUser(session.accessToken);
  if (auth.error) return withStudioSessionCookies(auth.error, session.cookies);

  if (isMutation(request.method) && !isSameOriginMutation(request)) {
    return withStudioSessionCookies(json({ error: "Cross-origin collaboration writes are not allowed." }, 403), session.cookies);
  }
  if (!hasStorageBinding(env)) {
    return withStudioSessionCookies(json({ error: "TeX storage is temporarily unavailable." }, 503), session.cookies);
  }

  let response;
  try {
    if (request.method === "GET") response = await getCollaboration(request, env, auth.user, session.accessToken);
    else if (request.method === "POST") response = await addCollaborator(request, env, auth.user, session.accessToken);
    else if (request.method === "PATCH") response = await updateCollaborator(request, env, auth.user, session.accessToken);
    else if (request.method === "DELETE") response = await removeCollaborator(request, env, auth.user, session.accessToken);
    else response = json({ error: "Method not allowed" }, 405);
  } catch (error) {
    workerLog("error", "tex.collaboration.failed", {
      user_id: auth.user.id,
      method: request.method,
      message: String(error?.message || error)
    });
    response = json({ error: "Collaboration settings are temporarily unavailable." }, 503);
  }

  return withStudioSessionCookies(response, session.cookies);
}

async function getCollaboration(request, env, user, accessToken) {
  const url = new URL(request.url);
  const documentId = cleanObjectId(url.searchParams.get("document"));
  if (!documentId) return json({ error: "Invalid TeX document identifier." }, 400);

  const owned = await ownsDocument(env, user.id, documentId);
  if (owned) {
    if (url.searchParams.get("action") === "search") {
      return searchCollaborators(url.searchParams.get("q"), accessToken);
    }
    return collaborationSnapshot(accessToken, user.id, documentId, {
      canManage: true,
      currentUserId: user.id,
      currentUserRole: "owner"
    });
  }

  const membership = await sharedDocumentMembership(accessToken, user.id, documentId);
  if (membership.error) return collaborationBackendError(membership.error);
  if (!membership.data) return json({ error: "TeX document not found." }, 404);
  if (url.searchParams.get("action") === "search") {
    return json({ error: "Only the document owner can invite collaborators." }, 403);
  }

  return collaborationSnapshot(accessToken, membership.data.owner_id, documentId, {
    canManage: false,
    currentUserId: user.id,
    currentUserRole: membership.data.role
  });
}

async function searchCollaborators(rawQuery, accessToken) {
  const query = cleanSearchQuery(rawQuery);
  if (!query) return json({ results: [] });
  const result = await rpc(accessToken, "tex_search_collaborators", { p_query: query, p_limit: 8 });
  if (result.error) return collaborationBackendError(result.error);
  const results = Array.isArray(result.data)
    ? result.data.map(normalizeSearchResult).filter(Boolean).slice(0, 8)
    : [];
  return json({ query, results });
}

async function addCollaborator(request, env, user, accessToken) {
  const parsed = await parsePayload(request);
  if (parsed.error) return parsed.error;
  const documentId = cleanObjectId(parsed.value?.document_id);
  const username = cleanUsername(parsed.value?.username);
  const role = cleanRole(parsed.value?.role);
  if (!documentId) return json({ error: "Invalid TeX document identifier." }, 400);
  if (!username) return json({ error: "Enter a valid username." }, 400);
  if (!role) return json({ error: "Invalid collaboration role." }, 400);
  if (!(await ownsDocument(env, user.id, documentId))) return json({ error: "TeX document not found." }, 404);

  const resolved = await rpc(accessToken, "tex_resolve_collaborator", { p_username: username });
  if (resolved.error) return collaborationBackendError(resolved.error);
  const profile = Array.isArray(resolved.data) ? resolved.data[0] : null;
  if (!profile?.id || !isStorageObjectId(profile.id)) return json({ error: "No active QssedA user matches that username." }, 404);
  if (profile.id === user.id) return json({ error: "The document owner is already a collaborator." }, 409);

  const now = new Date().toISOString();
  const write = await supabaseRequest(accessToken, "/rest/v1/tex_document_collaborators?on_conflict=owner_id,document_id,member_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      owner_id: user.id,
      document_id: documentId,
      member_id: profile.id,
      role,
      created_by: user.id,
      updated_at: now
    })
  });
  if (!write.ok) return collaborationBackendError(write);
  return collaborationSnapshot(accessToken, user.id, documentId, {
    canManage: true,
    currentUserId: user.id,
    currentUserRole: "owner"
  });
}

async function updateCollaborator(request, env, user, accessToken) {
  const parsed = await parsePayload(request);
  if (parsed.error) return parsed.error;
  const documentId = cleanObjectId(parsed.value?.document_id);
  const memberId = cleanObjectId(parsed.value?.member_id);
  const role = cleanRole(parsed.value?.role);
  if (!documentId || !memberId) return json({ error: "Invalid collaboration member identifier." }, 400);
  if (!role) return json({ error: "Invalid collaboration role." }, 400);
  if (!(await ownsDocument(env, user.id, documentId))) return json({ error: "TeX document not found." }, 404);

  const query = new URLSearchParams({
    owner_id: `eq.${user.id}`,
    document_id: `eq.${documentId}`,
    member_id: `eq.${memberId}`
  });
  const write = await supabaseRequest(accessToken, `/rest/v1/tex_document_collaborators?${query.toString()}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ role, updated_at: new Date().toISOString() })
  });
  if (!write.ok) return collaborationBackendError(write);
  if (!Array.isArray(write.data) || !write.data.length) return json({ error: "Collaborator not found." }, 404);
  return collaborationSnapshot(accessToken, user.id, documentId, {
    canManage: true,
    currentUserId: user.id,
    currentUserRole: "owner"
  });
}

async function removeCollaborator(request, env, user, accessToken) {
  const url = new URL(request.url);
  if (url.searchParams.get("action") === "leave") {
    return leaveCollaboration(url, user, accessToken);
  }

  const documentId = cleanObjectId(url.searchParams.get("document"));
  const memberId = cleanObjectId(url.searchParams.get("member"));
  if (!documentId || !memberId) return json({ error: "Invalid collaboration member identifier." }, 400);
  if (!(await ownsDocument(env, user.id, documentId))) return json({ error: "TeX document not found." }, 404);

  const query = new URLSearchParams({
    owner_id: `eq.${user.id}`,
    document_id: `eq.${documentId}`,
    member_id: `eq.${memberId}`
  });
  const write = await supabaseRequest(accessToken, `/rest/v1/tex_document_collaborators?${query.toString()}`, {
    method: "DELETE",
    headers: { Prefer: "return=representation" }
  });
  if (!write.ok) return collaborationBackendError(write);
  return collaborationSnapshot(accessToken, user.id, documentId, {
    canManage: true,
    currentUserId: user.id,
    currentUserRole: "owner"
  });
}

async function leaveCollaboration(url, user, accessToken) {
  const documentId = cleanObjectId(url.searchParams.get("document"));
  if (!documentId) return json({ error: "Invalid TeX document identifier." }, 400);

  const membership = await sharedDocumentMembership(accessToken, user.id, documentId);
  if (membership.error) return collaborationBackendError(membership.error);
  if (!membership.data) return json({ error: "Collaboration membership not found." }, 404);

  const query = new URLSearchParams({
    owner_id: `eq.${membership.data.owner_id}`,
    document_id: `eq.${documentId}`,
    member_id: `eq.${user.id}`
  });
  const write = await supabaseRequest(accessToken, `/rest/v1/tex_document_collaborators?${query.toString()}`, {
    method: "DELETE",
    headers: { Prefer: "return=representation" }
  });
  if (!write.ok) return collaborationBackendError(write);
  if (!Array.isArray(write.data) || !write.data.length) return json({ error: "Collaboration membership not found." }, 404);

  return json({
    document_id: documentId,
    owner_id: membership.data.owner_id,
    left: true
  });
}

async function collaborationSnapshot(accessToken, ownerId, documentId, options = {}) {
  const result = await rpc(accessToken, "tex_collaboration_participants", {
    p_owner_id: ownerId,
    p_document_id: documentId
  });
  if (result.error) return collaborationBackendError(result.error);
  const participants = Array.isArray(result.data) ? result.data.map(normalizeParticipant).filter(Boolean) : [];
  const canManage = options.canManage === true;
  const currentUserId = isStorageObjectId(options.currentUserId) ? options.currentUserId : ownerId;
  const currentUserRole = canManage ? "owner" : cleanRole(options.currentUserRole) || "viewer";
  return json({
    document_id: documentId,
    owner_id: ownerId,
    current_user_id: currentUserId,
    current_user_role: currentUserRole,
    can_manage: canManage,
    can_leave: !canManage && currentUserId !== ownerId,
    realtime_ready: false,
    sync_mode: "permissions-only",
    participants
  });
}

async function sharedDocumentMembership(accessToken, userId, documentId) {
  const response = await supabaseRequest(
    accessToken,
    `/rest/v1/tex_document_collaborators?select=owner_id,role&member_id=eq.${encodeURIComponent(userId)}&document_id=eq.${encodeURIComponent(documentId)}&limit=1`
  );
  if (!response.ok) return { data: null, error: response };
  const row = Array.isArray(response.data) ? response.data[0] : null;
  if (!row || !isStorageObjectId(row.owner_id)) return { data: null, error: null };
  const role = cleanRole(row.role);
  if (!role) return { data: null, error: null };
  return { data: { owner_id: row.owner_id, role }, error: null };
}

function normalizeParticipant(value) {
  if (!value || !isStorageObjectId(value.participant_id)) return null;
  const role = value.is_owner ? "owner" : cleanRole(value.role);
  if (!role) return null;
  return {
    id: value.participant_id,
    role,
    username: cleanText(value.username, 80),
    display_name: cleanText(value.display_name, 120),
    avatar_url: safeAvatarUrl(value.avatar_url),
    is_owner: Boolean(value.is_owner),
    created_at: cleanTimestamp(value.created_at),
    updated_at: cleanTimestamp(value.updated_at)
  };
}

function normalizeSearchResult(value) {
  if (!value || !isStorageObjectId(value.id)) return null;
  const username = cleanText(value.username, 80);
  if (!username) return null;
  return {
    id: value.id,
    username,
    display_name: cleanText(value.display_name, 120),
    avatar_url: safeAvatarUrl(value.avatar_url)
  };
}

async function verifyActiveUser(accessToken) {
  const headers = authHeaders(accessToken);
  let userResponse;
  try {
    userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers });
  } catch {
    return { error: json({ error: "Authentication service is temporarily unavailable." }, 503) };
  }
  if (userResponse.status === 401 || userResponse.status === 403) return { error: json({ error: "Session is invalid or expired." }, 401) };
  if (!userResponse.ok) return { error: json({ error: "Authentication service is temporarily unavailable." }, 503) };

  const user = await userResponse.json().catch(() => null);
  if (!isStorageObjectId(user?.id)) return { error: json({ error: "Session is invalid or expired." }, 401) };

  const profile = await supabaseRequest(accessToken, `/rest/v1/profiles?select=status&id=eq.${encodeURIComponent(user.id)}&limit=1`);
  if (!profile.ok) return { error: json({ error: "Account service is temporarily unavailable." }, 503) };
  if (!Array.isArray(profile.data) || profile.data.length !== 1 || profile.data[0]?.status !== "active") {
    return { error: json({ error: "Account is not authorized to use TeX collaboration." }, 403) };
  }
  return { user };
}

async function rpc(accessToken, name, body) {
  const response = await supabaseRequest(accessToken, `/rest/v1/rpc/${name}`, {
    method: "POST",
    body: JSON.stringify(body)
  });
  return response.ok ? { data: response.data, error: null } : { data: null, error: response };
}

async function supabaseRequest(accessToken, path, options = {}) {
  try {
    const response = await fetch(`${SUPABASE_URL}${path}`, {
      ...options,
      headers: {
        ...authHeaders(accessToken),
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json;charset=UTF-8" } : {}),
        ...(options.headers || {})
      }
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, status: 503, data: { message: String(error?.message || error) } };
  }
}

function collaborationBackendError(response) {
  const code = cleanText(response?.data?.code, 80);
  const message = cleanText(response?.data?.message || response?.data?.error || response?.data?.hint, 300);
  if (code === "PGRST202" || code === "42P01" || code === "42883") {
    return json({ error: "TeX collaboration database setup has not been deployed yet." }, 503);
  }
  if (response?.status === 401 || response?.status === 403) return json({ error: "You do not have permission to change these collaboration settings." }, 403);
  if (response?.status === 409 || code === "23505") return json({ error: "That collaborator is already assigned to this document." }, 409);
  return json({ error: message || "Could not update collaboration settings." }, response?.status >= 400 && response.status < 600 ? response.status : 503);
}

async function ownsDocument(env, ownerId, documentId) {
  const object = await env.STORAGE.head(`${DOCUMENT_ROOT}${ownerId}/${documentId}.json`);
  return Boolean(object);
}

async function parsePayload(request) {
  const declared = Number(request.headers.get("Content-Length") || 0);
  if (declared > MAX_BODY_BYTES) return { error: json({ error: "Collaboration payload is too large." }, 413) };
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return { error: json({ error: "Collaboration payload is too large." }, 413) };
    return { value: JSON.parse(raw || "{}") };
  } catch {
    return { error: json({ error: "Invalid collaboration payload." }, 400) };
  }
}

function authHeaders(accessToken) {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${String(accessToken || "").trim()}`
  };
}

function isMutation(method) {
  return ["POST", "PATCH", "PUT", "DELETE"].includes(String(method || "").toUpperCase());
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

function cleanObjectId(value) {
  const text = String(value || "").trim();
  return isStorageObjectId(text) ? text : "";
}

function cleanRole(value) {
  const role = String(value || "").trim().toLowerCase();
  return ROLES.has(role) ? role : "";
}

function cleanUsername(value) {
  const username = String(value || "").trim().replace(/^@+/, "").slice(0, 80);
  return /^[a-zA-Z0-9._-]{2,80}$/.test(username) ? username : "";
}

function cleanSearchQuery(value) {
  const query = String(value || "").trim().replace(/^@+/, "").slice(0, 80);
  return /^[a-zA-Z0-9._-]{1,80}$/.test(query) ? query : "";
}

function cleanText(value, maximum) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maximum);
}

function cleanTimestamp(value) {
  if (!value) return "";
  const timestamp = Date.parse(String(value));
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : "";
}

function safeAvatarUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  try {
    const url = new URL(text);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}
