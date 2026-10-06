/**
 * 【初学者导读】
 * 文件：admin/admin-api.js
 * AERTEX Admin 后端/基础模块：负责管理员会话、内容管理、国际化或管理 API。
 * 阅读顺序：从最外层入口开始，先看域名/path/method 判断，再看登录或令牌校验，最后追到具体 handler/模块；不要从某个深层函数孤立地理解整条请求链。
 * 请求链思维：浏览器/客户端 → Worker → 会话/安全门禁 → 路由 → API/页面 → 数据源 → Response。
 * 修改注意：入口文件的小改动可能影响整个产品域名，修改路由或响应头后要跑对应 CI。
 * 调试方法：先记录“实际 host + pathname + method + 是否有会话”，通常可以快速判断请求为什么走错分支。
 */
import { SUPABASE_URL, SUPABASE_KEY } from "../studio/config.js";
import { json } from "../studio/routing.js";
import { verifyAdminApiSession, withAdminSessionCookies } from "./session.js";
import { workerLog } from "../studio/server-runtime.js";

const ACTIONS = {
  overview: { rpc: "get_admin_overview", write: false, params: [] },
  users: { rpc: "get_admin_users", write: false, params: [] },
  roles: { rpc: "get_role_permissions", write: false, params: [] },
  logs: {
    rpc: "get_audit_logs",
    write: false,
    params: ["p_action", "p_severity", "p_actor", "p_search", "p_from", "p_to", "p_limit"]
  },
  "user-role": {
    rpc: "update_user_role",
    write: true,
    params: ["p_user_id", "p_role"]
  },
  "user-status": {
    rpc: "update_user_status",
    write: true,
    params: ["p_user_id", "p_status"]
  },
  permissions: {
    rpc: "update_role_permissions",
    write: true,
    params: ["p_role", "p_permissions"]
  },
  "device-exemptions": {
    rpc: "get_device_access_exemptions",
    write: false,
    params: []
  },
  "device-exemption": {
    rpc: "set_device_access_exemption",
    write: true,
    params: ["p_user_id", "p_enabled", "p_expires_at", "p_note"]
  },
  billing: {
    rpc: "get_admin_billing_state",
    write: false,
    params: []
  },
  "subscription-grant": {
    rpc: "admin_grant_subscription",
    write: true,
    params: ["p_user_id", "p_plan_id", "p_days", "p_note"]
  },
  "subscription-reset": {
    rpc: "admin_reset_subscription",
    write: true,
    params: ["p_user_id", "p_note"]
  },
  "student-verifications": {
    rpc: "get_admin_student_verifications",
    write: false,
    params: []
  },
  "student-verification-review": {
    rpc: "admin_review_student_verification",
    write: true,
    params: ["p_verification_id", "p_decision", "p_school_name", "p_education_level", "p_report_expires_at", "p_note"]
  }
};

// 管理员访问检查：只回答“当前会话是否具备管理权限/基础信息”，不在这里执行具体管理操作。
export async function handleAdminAccess(request) {
  const session = await verifyAdminApiSession(request);
  if (!session.ok) return withAdminSessionCookies(json({ is_admin: false, error: "Authentication required." }, 401), session.cookies);

  return withAdminSessionCookies(json({ is_admin: true, user_id: session.user.id }), session.cookies);
}

// 管理操作总入口：action 决定具体 RPC/管理任务；即使外层已确认管理员，也要继续限制 action、参数和上游错误内容。
export async function handleAdminAction(request, _env, action) {
  const spec = ACTIONS[action];
  if (!spec) return json({ error: "Unknown administrator action." }, 404);
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!sameOrigin(request)) return json({ error: "Invalid origin." }, 403);

  const session = await verifyAdminApiSession(request);
  if (!session.ok) return withAdminSessionCookies(json({ error: "Authentication required." }, 401), session.cookies);

  let incoming = {};
  try {
    incoming = await request.json();
  } catch {
    incoming = {};
  }
  if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
    return withAdminSessionCookies(json({ error: "Invalid request body." }, 400), session.cookies);
  }

  const params = {};
  for (const key of spec.params) {
    if (Object.prototype.hasOwnProperty.call(incoming, key)) params[key] = incoming[key];
  }

  if (spec.write && ["user-role", "user-status", "permissions", "subscription-grant", "subscription-reset", "student-verification-review"].includes(action)) {
    params.p_ip_address = request.headers.get("CF-Connecting-IP") || null;
    params.p_user_agent = String(request.headers.get("User-Agent") || "").slice(0, 500) || null;
  }

  if (action === "logs") {
    const requestedLimit = Number(params.p_limit);
    params.p_limit = Number.isFinite(requestedLimit)
      ? Math.max(1, Math.min(Math.trunc(requestedLimit), 200))
      : 120;
  }

  if (action === "user-role") {
    if (!isUuid(params.p_user_id) || !["admin", "editor", "user"].includes(params.p_role)) {
      return withAdminSessionCookies(json({ error: "Invalid user role request." }, 400), session.cookies);
    }
  }

  if (action === "user-status") {
    if (!isUuid(params.p_user_id) || !["active", "suspended", "banned"].includes(params.p_status)) {
      return withAdminSessionCookies(json({ error: "Invalid user status request." }, 400), session.cookies);
    }
  }

  if (action === "permissions") {
    if (!["admin", "editor", "user"].includes(params.p_role) || !Array.isArray(params.p_permissions)) {
      return withAdminSessionCookies(json({ error: "Invalid role permission request." }, 400), session.cookies);
    }
    params.p_permissions = [...new Set(params.p_permissions.map(value => String(value || "").trim()).filter(Boolean))].slice(0, 200);
  }

  if (action === "subscription-grant") {
    const days = Number(params.p_days);
    if (!isUuid(params.p_user_id) || !/^[a-z0-9][a-z0-9_-]{1,63}$/.test(String(params.p_plan_id || "")) || !Number.isInteger(days) || days < 1 || days > 3650) {
      return withAdminSessionCookies(json({ error: "Invalid subscription grant request." }, 400), session.cookies);
    }
    params.p_days = days;
    params.p_note = String(params.p_note || "").trim().slice(0, 500) || null;
  }

  if (action === "subscription-reset") {
    if (!isUuid(params.p_user_id)) {
      return withAdminSessionCookies(json({ error: "Invalid subscription reset request." }, 400), session.cookies);
    }
    params.p_note = String(params.p_note || "").trim().slice(0, 500) || null;
  }

  if (action === "student-verification-review") {
    if (!isUuid(params.p_verification_id) || !["verified", "rejected"].includes(params.p_decision)) {
      return withAdminSessionCookies(json({ error: "Invalid student verification review." }, 400), session.cookies);
    }
    params.p_school_name = String(params.p_school_name || "").trim().slice(0, 180) || null;
    params.p_education_level = String(params.p_education_level || "").trim().slice(0, 120) || null;
    params.p_note = String(params.p_note || "").trim().slice(0, 500) || null;
    if (params.p_decision === "verified") {
      const expiresAt = Date.parse(String(params.p_report_expires_at || ""));
      if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
        return withAdminSessionCookies(json({ error: "A future report expiration is required." }, 400), session.cookies);
      }
      params.p_report_expires_at = new Date(expiresAt).toISOString();
    } else {
      params.p_report_expires_at = null;
    }
  }

  if (action === "device-exemption") {
    if (!isUuid(params.p_user_id) || typeof params.p_enabled !== "boolean") {
      return withAdminSessionCookies(json({ error: "Invalid device exemption request." }, 400), session.cookies);
    }
    if (params.p_expires_at != null && params.p_expires_at !== "") {
      const expiresAt = Date.parse(String(params.p_expires_at));
      if (!Number.isFinite(expiresAt)) {
        return withAdminSessionCookies(json({ error: "Invalid exemption expiration." }, 400), session.cookies);
      }
      params.p_expires_at = new Date(expiresAt).toISOString();
    } else {
      params.p_expires_at = null;
    }
    params.p_note = String(params.p_note || "").trim().slice(0, 500) || null;
  }

  const result = await callRpc(session.accessToken, spec.rpc, params);
  if (!result.ok) {
    workerLog("warn", "admin.proxy.rpc_failed", {
      action,
      user_id: session.user.id,
      upstream_status: result.status
    });
    return withAdminSessionCookies(json({
      error: cleanError(result.payload) || "Administrator action failed."
    }, normalizeUpstreamStatus(result.status)), session.cookies);
  }

  if (spec.write) {
    workerLog("info", "admin.proxy.write", {
      action,
      user_id: session.user.id
    });
  }

  return withAdminSessionCookies(json({ data: result.payload }), session.cookies);
}

// 调用受保护的 Supabase RPC：access token 只放 Authorization 头；响应错误会被清洗成适合管理员 UI 显示的信息。
async function callRpc(accessToken, rpc, params) {
  let upstream;
  try {
    upstream = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${rpc}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${accessToken}`,
        "content-type": "application/json;charset=UTF-8",
        Accept: "application/json"
      },
      body: JSON.stringify(params || {})
    });
  } catch (error) {
    return { ok: false, status: 503, payload: { error: error?.name || "Error" } };
  }

  const text = await upstream.text();
  let payload = null;
  if (text) {
    try { payload = JSON.parse(text); }
    catch { payload = { error: "Administrator service returned an invalid response." }; }
  }
  return { ok: upstream.ok, status: upstream.status, payload };
}

function cleanError(payload) {
  const value = payload?.message || payload?.error || payload?.hint || payload?.details || "";
  return String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 240);
}

function normalizeUpstreamStatus(status) {
  if (status === 400) return 400;
  if (status === 401) return 401;
  if (status === 403) return 403;
  if (status === 404) return 404;
  if (status === 409) return 409;
  if (status === 429) return 429;
  if (status === 503) return 503;
  return 502;
}

function sameOrigin(request) {
  const url = new URL(request.url);
  return (request.headers.get("Origin") || "") === url.origin;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}
