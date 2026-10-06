// 初学者导读：注册前检查接口：用于验证标识符/邀请码等注册条件。返回值要避免把内部账户存在性暴露得过细。
import { SUPABASE_URL } from "./config.js";
import { registrationUsernameRule } from "./account-api.js";
import { json } from "./routing.js";
import { getSupabaseSecret, workerLog } from "./server-runtime.js";

export async function handleRegistrationUsernameCheck(request, env) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!sameOrigin(request)) return json({ error: "Invalid origin" }, 403);

  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request body" }, 400); }
  const username = String(body?.username || "").trim().slice(0, 80);
  const rule = registrationUsernameRule(username);
  if (rule) return json({ available: false, reason: rule });

  const secret = getSupabaseSecret(env);
  if (!secret) return json({ error: "Registration service is temporarily unavailable." }, 503);

  let response;
  try {
    response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/check_registration_username`, {
      method: "POST",
      headers: {
        ...serviceHeaders(secret),
        "content-type": "application/json;charset=UTF-8"
      },
      body: JSON.stringify({ p_username: username })
    });
  } catch (error) {
    workerLog("warn", "registration.username_check.upstream_error", { error_type: error?.name || "Error" });
    return json({ error: "Username check is temporarily unavailable." }, 503);
  }
  if (!response.ok) {
    workerLog("warn", "registration.username_check.failed", { upstream_status: response.status });
    return json({ error: "Username check is temporarily unavailable." }, 502);
  }

  let payload;
  try { payload = await response.json(); } catch { payload = null; }
  if (!payload || typeof payload !== "object") return json({ error: "Username check returned an invalid response." }, 502);
  return json({ available: Boolean(payload.available), reason: payload.reason || "" });
}

function serviceHeaders(secret) {
  return {
    apikey: secret,
    ...(secret.split(".").length === 3 ? { Authorization: `Bearer ${secret}` } : {}),
    Accept: "application/json"
  };
}

function sameOrigin(request) {
  const url = new URL(request.url);
  return (request.headers.get("Origin") || "") === url.origin;
}
