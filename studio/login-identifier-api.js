import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { json } from "./routing.js";
import { getWorkerRequestId, recordServerLoginEvent } from "./account-api.js";
import { studioSessionCookies, withStudioSessionCookies } from "./session-gate.js";
import { workerLog } from "./server-runtime.js";

export async function handleIdentifierPasswordLogin(request, env, ipInfo) {
  const startedAt = Date.now();
  const logContext = {
    request_id: getWorkerRequestId(request),
    country: ipInfo?.country || "Unknown"
  };

  let body;
  try {
    body = await request.json();
  } catch {
    workerLog("warn", "auth.login.invalid_request", { ...logContext, reason: "invalid_json" });
    return json({ error: "Invalid request body" }, 400);
  }

  const identifier = typeof body?.identifier === "string"
    ? body.identifier.trim()
    : typeof body?.email === "string"
      ? body.email.trim()
      : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const deviceId = typeof body?.device_id === "string" ? body.device_id : "";

  if (!identifier || !password) {
    workerLog("warn", "auth.login.invalid_request", { ...logContext, reason: "missing_credentials" });
    return json({ error: "Username/email and password are required" }, 400);
  }

  let authResponse;
  try {
    authResponse = await fetch(`${SUPABASE_URL}/functions/v1/login-identifier`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({ identifier, password })
    });
  } catch (error) {
    workerLog("error", "auth.login.upstream_error", {
      ...logContext,
      error_type: error?.name || "Error",
      duration_ms: Date.now() - startedAt
    });
    return json({ error: "Authentication service unavailable" }, 502);
  }

  let authData;
  try {
    authData = await authResponse.json();
  } catch {
    workerLog("error", "auth.login.invalid_upstream_response", {
      ...logContext,
      upstream_status: authResponse.status,
      duration_ms: Date.now() - startedAt
    });
    return json({ error: "Authentication service returned an invalid response" }, 502);
  }

  const audit = await recordServerLoginEvent(
    env,
    request,
    ipInfo,
    authData?.user || null,
    authResponse.ok,
    deviceId,
    logContext
  );

  workerLog(authResponse.ok ? "info" : "warn", authResponse.ok ? "auth.login.success" : "auth.login.failed", {
    ...logContext,
    login_identifier: identifier.includes("@") ? "email" : "username",
    upstream_status: authResponse.status,
    risk_level: audit.riskLevel,
    recent_failures_15m: audit.recentFailures,
    login_event_written: audit.loginEventWritten,
    audit_log_written: audit.auditLogWritten,
    duration_ms: Date.now() - startedAt
  });

  if (!authResponse.ok && authResponse.status === 401) {
    return json({ error: "用户名、邮箱或密码不正确", code: authData?.code || "invalid_credentials" }, 401);
  }

  const response = json(authData, authResponse.status);
  if (!authResponse.ok || !authData?.access_token || !authData?.refresh_token) return response;
  return withStudioSessionCookies(
    response,
    studioSessionCookies(authData.access_token, authData.refresh_token, authData.expires_in)
  );
}

export function identifierLoginPage(markup, t, zh) {
  const placeholder = zh ? "用户名或邮箱" : "Username or email";
  const emptyMessage = zh ? "请输入用户名或邮箱和密码。" : "Please enter username or email and password.";
  return String(markup || "")
    .replace(`type="email" placeholder="${t.emailPlaceholder}"`, `type="text" autocapitalize="none" spellcheck="false" placeholder="${placeholder}"`)
    .replace("请输入邮箱和密码。", emptyMessage)
    .replace("Please enter email and password.", emptyMessage);
}
