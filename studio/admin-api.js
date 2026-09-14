import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { json } from "./routing.js";
import { verifyStorageUser } from "./storage-api.js";
import { workerLog } from "./server-runtime.js";

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
  }
};

export async function handleAdminAccess(request, env) {
  const auth = await verifyStorageUser(request, env);
  if (auth.error) return auth.error;
  if (!auth.isAdmin) return json({ is_admin: false, error: "Administrator access required." }, 403);
  return json({ is_admin: true, user_id: auth.user.id });
}

export async function handleAdminAction(request, env, action) {
  const spec = ACTIONS[action];
  if (!spec) return json({ error: "Unknown administrator action." }, 404);
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const auth = await verifyStorageUser(request, env);
  if (auth.error) return auth.error;
  if (!auth.isAdmin) return json({ error: "Administrator access required." }, 403);

  let incoming = {};
  try {
    incoming = await request.json();
  } catch {
    incoming = {};
  }
  if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
    return json({ error: "Invalid request body." }, 400);
  }

  const params = {};
  for (const key of spec.params) {
    if (Object.prototype.hasOwnProperty.call(incoming, key)) params[key] = incoming[key];
  }

  if (spec.write) {
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
      return json({ error: "Invalid user role request." }, 400);
    }
  }

  if (action === "user-status") {
    if (!isUuid(params.p_user_id) || !["active", "suspended", "banned"].includes(params.p_status)) {
      return json({ error: "Invalid user status request." }, 400);
    }
  }

  if (action === "permissions") {
    if (!["admin", "editor", "user"].includes(params.p_role) || !Array.isArray(params.p_permissions)) {
      return json({ error: "Invalid role permission request." }, 400);
    }
    params.p_permissions = [...new Set(params.p_permissions.map(value => String(value || "").trim()).filter(Boolean))].slice(0, 200);
  }

  const authorization = request.headers.get("Authorization") || "";
  let upstream;
  try {
    upstream = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${spec.rpc}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: authorization,
        "content-type": "application/json;charset=UTF-8",
        Accept: "application/json"
      },
      body: JSON.stringify(params)
    });
  } catch (error) {
    workerLog("error", "admin.proxy.upstream_error", {
      action,
      user_id: auth.user.id,
      error_type: error?.name || "Error"
    });
    return json({ error: "Administrator service is temporarily unavailable." }, 503);
  }

  const text = await upstream.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { error: "Administrator service returned an invalid response." };
    }
  }

  if (!upstream.ok) {
    workerLog("warn", "admin.proxy.rpc_failed", {
      action,
      user_id: auth.user.id,
      upstream_status: upstream.status
    });
    return json({
      error: cleanError(payload) || "Administrator action failed."
    }, normalizeUpstreamStatus(upstream.status));
  }

  if (spec.write) {
    workerLog("info", "admin.proxy.write", {
      action,
      user_id: auth.user.id
    });
  }

  return json({ data: payload });
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
  return 502;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}
