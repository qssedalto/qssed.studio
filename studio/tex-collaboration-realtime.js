import { isLiveTexHead } from "./tex-document-guards.js";
import { SUPABASE_KEY, SUPABASE_URL } from "./config.js";
import { json } from "./routing.js";
import { verifyStudioApiSession, withStudioSessionCookies } from "./session-gate.js";
import { hasStorageBinding, isStorageObjectId } from "./storage-api.js";
import { resolveLinkGrant } from "./tex-link-capabilities.js";
import { texRealtimeRoomName, texRealtimeEpoch } from "./tex-realtime-epoch.js";

const DOCUMENT_ROOT = "_system/tex-documents/";

export async function handleTexCollaborationRealtime(request, env) {
  if (request.method !== "GET" || request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
    return json({ error: "WebSocket upgrade required." }, 426);
  }
  if (request.headers.get("Origin") !== new URL(request.url).origin) {
    return json({error:"Cross-origin collaboration connections are not allowed."},403);
  }
  if (!env?.TEX_COLLAB_ROOMS?.idFromName || !env?.TEX_COLLAB_ROOMS?.get) {
    return json({ error: "Realtime collaboration is temporarily unavailable." }, 503);
  }
  if (!hasStorageBinding(env)) return json({ error: "TeX storage is temporarily unavailable." }, 503);

  const session = await verifyStudioApiSession(request);
  if (!session.ok) return withStudioSessionCookies(json({ error: "Authentication required." }, 401), session.cookies);
  const auth = await verifyActiveUser(session.accessToken);
  if (auth.error) return withStudioSessionCookies(auth.error, session.cookies);

  const url = new URL(request.url);
  const documentId = cleanObjectId(url.searchParams.get("document"));
  if (!documentId) return withStudioSessionCookies(json({ error: "Invalid TeX document identifier." }, 400), session.cookies);

  const authorizationCheckedAt = Date.now();
  const access = await resolveDocumentAccess(env, auth.user.id, documentId, session.accessToken);
  if (!access) return withStudioSessionCookies(json({ error: "TeX document not found or collaboration access was removed." }, 404), session.cookies);

  // Historic rooms kept a Yjs snapshot forever, even when a user replaced
  // main.tex through the authoritative file API. Never reuse that stale room
  // for a freshly opened project. The epoch lives in R2 custom metadata,
  // so a handshake needs only HEAD rather than reading a large project file.
  let documentHead;
  try { documentHead = await env.STORAGE.head(documentKey(access.owner_id, documentId)); }
  catch { return withStudioSessionCookies(json({ error: "Could not verify TeX source revision." }, 503), session.cookies); }
  if (!isLiveTexHead(documentHead)) return withStudioSessionCookies(json({ error: "TeX document no longer exists." }, 404), session.cookies);
  const realtimeEpoch = texRealtimeEpoch(documentHead.customMetadata?.realtimeEpoch);
  const roomId = env.TEX_COLLAB_ROOMS.idFromName(texRealtimeRoomName(access.owner_id, documentId, realtimeEpoch));
  const room = env.TEX_COLLAB_ROOMS.get(roomId);
  const headers = new Headers();
  headers.set("Upgrade", "websocket");
  headers.set("X-Qsseda-Collab-Checked-At", String(authorizationCheckedAt));
  headers.set("X-Qsseda-Collab-User", auth.user.id);
  headers.set("X-Qsseda-Collab-Owner", access.owner_id);
  headers.set("X-Qsseda-Collab-Document", documentId);
  headers.set("X-Qsseda-Collab-Epoch", realtimeEpoch);
  headers.set("X-Qsseda-Collab-Access-Role", access.role);
  headers.set("X-Qsseda-Collab-Role", documentHead.customMetadata?.mainLocked==="true" || documentHead.customMetadata?.locked==="true" ? "viewer" : access.role);
  headers.set("X-Qsseda-Collab-Link-Grant", access.via_link === true ? "1" : "0");
  headers.set("X-Qsseda-Collab-Username", encodeURIComponent(cleanText(auth.profile?.username, 80)));
  headers.set("X-Qsseda-Collab-Display-Name", encodeURIComponent(cleanText(auth.profile?.display_name, 120)));
  headers.set("X-Qsseda-Collab-Avatar", cleanUrl(auth.profile?.avatar_url));

  return room.fetch(new Request("https://tex-collaboration-room.internal/connect", { method: "GET", headers }));
}

export async function resolveDocumentAccess(env, userId, documentId, accessToken) {
  try {
    const own = await env.STORAGE.head(documentKey(userId, documentId));
    if (isLiveTexHead(own)) return { owner_id: userId, role: "owner" };
  } catch {}

  const response = await supabaseRequest(
    `/rest/v1/tex_document_collaborators?select=owner_id,document_id,role&member_id=eq.${encodeURIComponent(userId)}&document_id=eq.${encodeURIComponent(documentId)}&limit=1`,
    accessToken
  );
  if (!response.ok) return null;
  const rows = await response.json().catch(() => []);
  const row = Array.isArray(rows) ? rows[0] : null;
  const ownerId = cleanObjectId(row?.owner_id);
  if (!ownerId || cleanObjectId(row?.document_id) !== documentId) {
    return resolveLinkGrant(env,userId,documentId);
  }
  try {
    if (!isLiveTexHead(await env.STORAGE.head(documentKey(ownerId, documentId)))) return null;
  } catch {
    return null;
  }
  return { owner_id: ownerId, role: row?.role === "editor" ? "editor" : "viewer" };
}

export async function verifyActiveUser(accessToken) {
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

async function supabaseRequest(path, accessToken) {
  return fetch(`${SUPABASE_URL}${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json"
    }
  });
}

export function documentKey(ownerId, documentId) {
  return `${DOCUMENT_ROOT}${ownerId}/${documentId}.json`;
}

export function cleanObjectId(value) {
  const text = String(value || "").trim();
  return isStorageObjectId(text) ? text : "";
}

function cleanText(value, maximum) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maximum);
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
