/**
 * 【初学者导读】
 * 文件：studio/login-identifier-api.js
 * 服务端 API 模块：接收已路由的请求，校验身份与参数，并执行数据读写后返回 JSON/HTTP 响应。
 * 阅读顺序：先看对外导出和路由入口，再看参数归一化、权限/语言处理，最后追踪存储或模板渲染。
 * 初学者重点：区分“数据来源”“业务规则”“展示格式”三层，不要把一个显示问题直接当成数据库问题。
 * 修改注意：此文件涉及兼容/身份/浏览器边界，改动前先确认旧调用者和安全假设。
 * 调试方法：先确认实际命中的路由和 locale，再检查 handler 输入，最后验证最终 Response。
 */
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
    studioSessionCookies(authData.access_token, authData.refresh_token, authData.expires_in, request)
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
