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
  "user-delete": {
    rpc: "admin_delete_user",
    write: true,
    params: ["p_user_id", "p_confirmation"]
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

export async function handleAdminAccess(request) {
  const session = await verifyAdminApiSession(request);
  if (!session.ok) return withAdminSessionCookies(json({ is_admin: false, error: "Authentication required." }, 401), session.cookies);

  return withAdminSessionCookies(json({ is_admin: true, user_id: session.user.id }), session.cookies);
}

// 管理员动作由服务端白名单选择；在执行 RPC 前依次验证方法、同源要求和独立 Admin 会话，避免前端按钮成为授权边界。
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

  if (spec.write && ["user-role", "user-status", "user-delete", "permissions", "subscription-grant", "subscription-reset", "student-verification-review"].includes(action)) {
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

  if (action === "user-delete") {
    if (!isUuid(params.p_user_id) ||
        params.p_confirmation !== params.p_user_id ||
        params.p_user_id === session.user.id) {
      return withAdminSessionCookies(json({error: "Invalid deletion confirmation or protected account."}, 403), session.cookies);
    }
    if (!(_env?.STORAGE && typeof _env.STORAGE.list === "function")) {
      return withAdminSessionCookies(json({error: "Cannot verify user files; deletion is unavailable."}, 503), session.cookies);
    }
    // Block rather than orphan R2 data or active Watch device tokens.
    // No storage objects are removed implicitly by account deletion.
    try {
      const blocker = await accountStorageBlocker(_env.STORAGE, params.p_user_id);
      if (blocker) {
        return withAdminSessionCookies(json({
          error: "该账户仍有关联文件或 Watch 设备令牌。请先清理相关数据，再删除账户。"
        }, 409), session.cookies);
      }
    } catch (error) {
      workerLog("warn", "admin.user_delete.storage_check_failed", {
        actor_id: session.user.id,
        reason: String(error?.name || "storage_unavailable").slice(0, 50)
      });
      return withAdminSessionCookies(json({error: "无法确认账户文件是否已清空，已阻止删除。"}, 503), session.cookies);
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

async function callRpc(accessToken, rpc, params) {
  let upstream;
  try {
    upstream = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${rpc}`, {
      method: "POST",
      redirect: "manual",
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

// This is a fail-closed preflight: deleting an Auth account would cascade DB
// records while leaving R2 objects and Watch upload tokens orphaned.
const USER_R2_ROOTS = [
  "users/",
  "_system/tex-documents/",
  "_system/tex-runs/",
  "_system/tex-results/",
  "_system/projects/",
  "_system/drafts/",
  "_system/summaries/",
  "_system/user-links/",
  "watch/v1/users/"
];

async function accountStorageBlocker(bucket, userId) {
  for (const root of USER_R2_ROOTS) {
    const page = await bucket.list({prefix: root + userId + "/", limit: 1});
    if (!page || !Array.isArray(page.objects)) throw new Error("Invalid R2 listing");
    if (page.objects.length > 0) return "r2";
  }
  // Watch upload credentials are stored by token hash, not by user path.
  // Scan a bounded set and fail closed if it exceeds the safety cap.
  let cursor;
  let scanned = 0;
  do {
    const page = await bucket.list({
      prefix: "watch/v1/tokens/", cursor, limit: 100
    });
    if (!page || !Array.isArray(page.objects)) throw new Error("Invalid Watch token listing");
    for (const object of page.objects) {
      if (++scanned > 1000) throw new Error("Watch token scan limit");
      const stored = await bucket.get(object.key);
      if (!stored) throw new Error("Watch token unavailable");
      const token = JSON.parse(await stored.text());
      if (token?.user_id === userId) return "watch-token";
    }
    if (!page.truncated) return null;
    cursor = page.cursor;
    if (!cursor) throw new Error("Watch token pagination missing");
  } while (true);
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
