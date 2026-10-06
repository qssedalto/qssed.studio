/**
 * 【初学者导读】
 * 文件：studio/tex-collaboration-realtime.js
 * TeX 协作模块：处理多人房间、成员、实时同步与共享数据，涉及并发和权限。
 * 阅读顺序：先确定谁调用本模块，再查看入口 handler；随后依次检查权限、输入归一化、数据操作和错误返回。
 * 数据一致性：涉及多人协作、版本或存储时，要特别注意重复请求、并发更新和“旧客户端仍在使用旧字段”的情况。
 * 修改注意：这里存在权限/并发/隐私边界，任何放宽校验或覆盖写入都应有明确理由和测试。
 * 调试方法：记录请求标识、用户/资源 ID 和关键分支结果，但不要把令牌、Cookie、私密内容写入日志。
 */
import { SUPABASE_KEY, SUPABASE_URL } from "./config.js";
import { json } from "./routing.js";
import { verifyStudioApiSession, withStudioSessionCookies } from "./session-gate.js";
import { hasStorageBinding, isStorageObjectId } from "./storage-api.js";

const DOCUMENT_ROOT = "_system/tex-documents/";

export async function handleTexCollaborationRealtime(request, env) {
  if (request.method !== "GET" || request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
    return json({ error: "WebSocket upgrade required." }, 426);
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

  const access = await resolveDocumentAccess(env, auth.user.id, documentId, session.accessToken);
  if (!access) return withStudioSessionCookies(json({ error: "TeX document not found or collaboration access was removed." }, 404), session.cookies);

  const roomId = env.TEX_COLLAB_ROOMS.idFromName(`${access.owner_id}:${documentId}`);
  const room = env.TEX_COLLAB_ROOMS.get(roomId);
  const headers = new Headers();
  headers.set("Upgrade", "websocket");
  headers.set("X-Qsseda-Collab-User", auth.user.id);
  headers.set("X-Qsseda-Collab-Owner", access.owner_id);
  headers.set("X-Qsseda-Collab-Document", documentId);
  headers.set("X-Qsseda-Collab-Role", access.role);
  headers.set("X-Qsseda-Collab-Username", cleanText(auth.profile?.username, 80));
  headers.set("X-Qsseda-Collab-Display-Name", cleanText(auth.profile?.display_name, 120));
  headers.set("X-Qsseda-Collab-Avatar", cleanUrl(auth.profile?.avatar_url));

  return room.fetch(new Request("https://tex-collaboration-room.internal/connect", { method: "GET", headers }));
}

async function resolveDocumentAccess(env, userId, documentId, accessToken) {
  try {
    const own = await env.STORAGE.head(documentKey(userId, documentId));
    if (own) return { owner_id: userId, role: "owner" };
  } catch {}

  const response = await supabaseRequest(
    `/rest/v1/tex_document_collaborators?select=owner_id,document_id,role&member_id=eq.${encodeURIComponent(userId)}&document_id=eq.${encodeURIComponent(documentId)}&limit=1`,
    accessToken
  );
  if (!response.ok) return null;
  const rows = await response.json().catch(() => []);
  const row = Array.isArray(rows) ? rows[0] : null;
  const ownerId = cleanObjectId(row?.owner_id);
  if (!ownerId || cleanObjectId(row?.document_id) !== documentId) return null;
  try {
    if (!(await env.STORAGE.head(documentKey(ownerId, documentId)))) return null;
  } catch {
    return null;
  }
  return { owner_id: ownerId, role: row?.role === "editor" ? "editor" : "viewer" };
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

async function supabaseRequest(path, accessToken) {
  return fetch(`${SUPABASE_URL}${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json"
    }
  });
}

function documentKey(ownerId, documentId) {
  return `${DOCUMENT_ROOT}${ownerId}/${documentId}.json`;
}

function cleanObjectId(value) {
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
