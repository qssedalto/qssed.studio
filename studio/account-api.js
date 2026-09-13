import { SUPABASE_URL, SUPABASE_KEY, ZH_COUNTRIES } from "./config.js";
import { json } from "./routing.js";

export function getRequestCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  const prefix = name + "=";
  const item = header.split(";").map(part => part.trim()).find(part => part.startsWith(prefix));
  if (!item) return "";
  try {
    return decodeURIComponent(item.slice(prefix.length));
  } catch {
    return "";
  }
}

export function escapeHtmlText(value) {
  return String(value || "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

export function getSupabaseSecret(env) {
  return env?.SUPABASE_SECRET_KEY || env?.SUPABASE_SERVICE_ROLE_KEY || "";
}

export function getWorkerRequestId(request) {
  return request.headers.get("CF-Ray") || crypto.randomUUID();
}

export function workerLog(level, event, details = {}) {
  const payload = JSON.stringify({
    source: "qsseda-worker",
    event,
    ...details
  });
  const method = level === "error" ? "error" : level === "warn" ? "warn" : "info";
  console[method](payload);
}

export function parseServerUserAgent(userAgent) {
  const ua = userAgent || "";
  const browser = ua.includes("Edg/") ? "Edge" : ua.includes("Chrome/") ? "Chrome" : ua.includes("Firefox/") ? "Firefox" : ua.includes("Safari/") ? "Safari" : "Unknown";
  const os = ua.includes("Windows") ? "Windows" : ua.includes("Mac OS") ? "macOS" : ua.includes("Android") ? "Android" : ua.includes("iPhone") || ua.includes("iPad") ? "iOS" : ua.includes("Linux") ? "Linux" : "Unknown";
  const device_type = /Mobile|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop";
  return { user_agent: ua, browser, os, device_type };
}

export async function recentFailedLoginCount(env, ipAddress, logContext) {
  const secret = getSupabaseSecret(env);
  if (!secret || !ipAddress || ipAddress === "Unknown") return 0;
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const url = new URL(`${SUPABASE_URL}/rest/v1/login_events`);
  url.searchParams.set("select", "id");
  url.searchParams.set("success", "eq.false");
  url.searchParams.set("ip_address", `eq.${ipAddress}`);
  url.searchParams.set("created_at", `gte.${since}`);
  url.searchParams.set("limit", "20");
  try {
    const response = await fetch(url.toString(), { headers: { apikey: secret, ...(secret.split(".").length === 3 ? { Authorization: `Bearer ${secret}` } : {}) } });
    if (!response.ok) {
      workerLog("warn", "auth.risk_query_failed", { ...logContext, upstream_status: response.status });
      return 0;
    }
    const rows = await response.json();
    return Array.isArray(rows) ? rows.length : 0;
  } catch (error) {
    workerLog("error", "auth.risk_query_error", { ...logContext, error_type: error?.name || "Error" });
    return 0;
  }
}

export async function recordServerLoginEvent(env, request, ipInfo, user, success, deviceId, logContext) {
  const secret = getSupabaseSecret(env);
  if (!secret) {
    workerLog("warn", "auth.audit.disabled", { ...logContext, reason: "missing_supabase_secret" });
    return {
      loginEventWritten: false,
      auditLogWritten: false,
      riskLevel: success ? "正常" : "注意",
      recentFailures: success ? 0 : 1
    };
  }

  const userAgent = request.headers.get("User-Agent") || "";
  const device = parseServerUserAgent(userAgent);
  const previousFailures = success ? 0 : await recentFailedLoginCount(env, ipInfo?.ip || "", logContext);
  const riskLevel = success ? "正常" : previousFailures >= 4 ? "高风险" : "注意";
  const severity = riskLevel === "高风险" ? "danger" : riskLevel === "注意" ? "warning" : "info";
  const safeDeviceId = typeof deviceId === "string" ? deviceId.slice(0, 160) : "";
  let loginEventWritten = false;
  let auditLogWritten = success;

  const event = {
    user_id: user?.id || null,
    event_type: "login",
    success: Boolean(success),
    provider: "password",
    ip_address: ipInfo?.ip || "",
    country: ipInfo?.country || "",
    region: ipInfo?.region || "",
    city: ipInfo?.city || "",
    user_agent: userAgent.slice(0, 1024),
    browser: device.browser,
    os: device.os,
    device_type: device.device_type,
    device_id: safeDeviceId,
    risk_level: riskLevel
  };

  try {
    const eventResponse = await fetch(`${SUPABASE_URL}/rest/v1/login_events`, {
      method: "POST",
      headers: {
        apikey: secret,
        ...(secret.split(".").length === 3 ? { Authorization: `Bearer ${secret}` } : {}),
        "content-type": "application/json",
        prefer: "return=minimal"
      },
      body: JSON.stringify(event)
    });
    loginEventWritten = eventResponse.ok;
    if (!eventResponse.ok) {
      workerLog("error", "auth.audit.write_failed", {
        ...logContext,
        target: "login_events",
        upstream_status: eventResponse.status
      });
    }

    if (!success) {
      const auditResponse = await fetch(`${SUPABASE_URL}/rest/v1/audit_logs`, {
        method: "POST",
        headers: {
          apikey: secret,
          ...(secret.split(".").length === 3 ? { Authorization: `Bearer ${secret}` } : {}),
          "content-type": "application/json",
          prefer: "return=minimal"
        },
        body: JSON.stringify({
          actor_user_id: null,
          actor_email: null,
          action: "auth.login.failed",
          target_type: "auth",
          target_id: null,
          target_label: "Password login",
          description: "Failed password login attempt",
          ip_address: ipInfo?.ip || "",
          user_agent: userAgent.slice(0, 1024),
          severity,
          metadata: {
            country: ipInfo?.country || "",
            region: ipInfo?.region || "",
            city: ipInfo?.city || "",
            browser: device.browser,
            os: device.os,
            device_type: device.device_type,
            risk_level: riskLevel,
            recent_failures_15m: previousFailures + 1
          }
        })
      });
      auditLogWritten = auditResponse.ok;
      if (!auditResponse.ok) {
        workerLog("error", "auth.audit.write_failed", {
          ...logContext,
          target: "audit_logs",
          upstream_status: auditResponse.status
        });
      }
    }
  } catch (error) {
    workerLog("error", "auth.audit.error", { ...logContext, error_type: error?.name || "Error" });
  }

  return {
    loginEventWritten,
    auditLogWritten,
    riskLevel,
    recentFailures: success ? 0 : previousFailures + 1
  };
}

export function registrationUsernameRule(username) {
  const value = String(username || "").trim();
  const key = value.toLowerCase();
  if (value.length < 3) return "too_short";
  if (key.includes("tianguo")) return "reserved_tianguo";
  if (key.includes("admin")) return "reserved_admin";
  return "";
}

export function registrationEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export function registrationPasswordChecks(password) {
  const value = String(password || "");
  return {
    length: value.length >= 8,
    number: /\d/.test(value),
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    special: /[^A-Za-z0-9\s]/.test(value)
  };
}

export function registrationHanNameValid(value, expectedLength) {
  const text = String(value || "").trim();
  return (expectedLength === 1 || expectedLength === 2) &&
    Array.from(text).length === expectedLength &&
    /^\p{Script=Han}+$/u.test(text);
}

export function registrationInternationalNameValid(value) {
  const text = String(value || "").trim();
  return text.length > 0 && text.length <= 80;
}

export async function handleRegistrationSignup(request, env, ipInfo) {
  const requestId = getWorkerRequestId(request);
  const secret = getSupabaseSecret(env);
  if (!secret) {
    workerLog("error", "auth.signup.disabled", { request_id: requestId, reason: "missing_supabase_secret" });
    return json({ error: "Registration service is temporarily unavailable." }, 503);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Invalid registration request." }, 400);
  }

  const username = String(form.get("username") || "").trim();
  const firstName = String(form.get("first_name") || "").trim();
  const lastName = String(form.get("last_name") || "").trim();
  const surnameLength = Number(form.get("surname_length"));
  const givenNameLength = Number(form.get("given_name_length"));
  const birthDate = String(form.get("birth_date") || "").trim();
  const gender = String(form.get("gender") || "").trim();
  const hideGenderOnProfile = String(form.get("hide_gender_on_profile") || "") === "true";
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  const avatarValue = form.get("avatar");
  const avatarFile = avatarValue && typeof avatarValue !== "string" && typeof avatarValue.arrayBuffer === "function" ? avatarValue : null;
  const enforceChineseNameRules = ZH_COUNTRIES.includes(ipInfo?.country || "");

  const usernameRule = registrationUsernameRule(username);
  if (usernameRule) return json({ error: usernameRule, field: "username" }, 400);

  if (enforceChineseNameRules) {
    if (!registrationHanNameValid(firstName, surnameLength) || !registrationHanNameValid(lastName, givenNameLength)) {
      return json({ error: "invalid_real_name", field: "name" }, 400);
    }
  } else if (!registrationInternationalNameValid(firstName) || !registrationInternationalNameValid(lastName)) {
    return json({ error: "invalid_real_name", field: "name" }, 400);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return json({ error: "invalid_birth_date", field: "birth_date" }, 400);
  }

  if (gender !== "male" && gender !== "female") {
    return json({ error: "invalid_gender", field: "gender" }, 400);
  }

  if (!registrationEmailValid(email)) {
    return json({ error: "invalid_email", field: "email" }, 400);
  }

  const passwordChecks = registrationPasswordChecks(password);
  if (!Object.values(passwordChecks).every(Boolean)) {
    return json({ error: "weak_password", field: "password" }, 400);
  }

  const allowedAvatarTypes = new Map([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"]
  ]);
  if (avatarFile) {
    if (!allowedAvatarTypes.has(avatarFile.type)) {
      return json({ error: "invalid_avatar_type", field: "avatar" }, 400);
    }
    if (avatarFile.size > 5 * 1024 * 1024) {
      return json({ error: "avatar_too_large", field: "avatar" }, 400);
    }
  }

  const privilegedHeaders = {
    apikey: secret,
    ...(secret.split(".").length === 3 ? { Authorization: `Bearer ${secret}` } : {})
  };

  try {
    const availabilityResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/check_registration_username`, {
      method: "POST",
      headers: {
        ...privilegedHeaders,
        "content-type": "application/json"
      },
      body: JSON.stringify({ p_username: username })
    });
    if (!availabilityResponse.ok) {
      workerLog("error", "auth.signup.username_check_failed", { request_id: requestId, upstream_status: availabilityResponse.status });
      return json({ error: "Registration service is temporarily unavailable." }, 503);
    }
    const availability = await availabilityResponse.json();
    if (!availability?.available) {
      return json({ error: availability?.reason || "username_taken", field: "username" }, 409);
    }
  } catch (error) {
    workerLog("error", "auth.signup.username_check_error", { request_id: requestId, error_type: error?.name || "Error" });
    return json({ error: "Registration service is temporarily unavailable." }, 503);
  }

  let authPayload;
  try {
    const signupResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        email,
        password,
        data: {
          display_name: username,
          username,
          first_name: firstName,
          last_name: lastName,
          skipped_name: false,
          birth_date: birthDate,
          gender,
          hide_gender_on_profile: hideGenderOnProfile
        }
      })
    });

    authPayload = await signupResponse.json().catch(() => ({}));
    if (!signupResponse.ok) {
      workerLog("warn", "auth.signup.failed", { request_id: requestId, upstream_status: signupResponse.status });
      return json({ error: authPayload?.msg || authPayload?.message || authPayload?.error_description || "Unable to create account." }, signupResponse.status);
    }
  } catch (error) {
    workerLog("error", "auth.signup.error", { request_id: requestId, error_type: error?.name || "Error" });
    return json({ error: "Unable to create account." }, 502);
  }

  const userId = authPayload?.user?.id || authPayload?.id || "";
  let avatarStatus = avatarFile ? "failed" : "skipped";

  if (avatarFile && userId) {
    const ext = allowedAvatarTypes.get(avatarFile.type);
    const objectPath = `${userId}/avatar.${ext}`;
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/avatars/${objectPath}`;
    try {
      const uploadResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/avatars/${objectPath}`, {
        method: "POST",
        headers: {
          ...privilegedHeaders,
          "content-type": avatarFile.type,
          "x-upsert": "true"
        },
        body: await avatarFile.arrayBuffer()
      });

      if (uploadResponse.ok) {
        const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
          method: "PATCH",
          headers: {
            ...privilegedHeaders,
            "content-type": "application/json",
            prefer: "return=minimal"
          },
          body: JSON.stringify({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        });
        avatarStatus = profileResponse.ok ? "saved" : "failed";
        if (!profileResponse.ok) {
          workerLog("warn", "auth.signup.avatar_profile_update_failed", { request_id: requestId, upstream_status: profileResponse.status });
        }
      } else {
        workerLog("warn", "auth.signup.avatar_upload_failed", { request_id: requestId, upstream_status: uploadResponse.status });
      }
    } catch (error) {
      workerLog("warn", "auth.signup.avatar_error", { request_id: requestId, error_type: error?.name || "Error" });
    }
  }

  workerLog("info", "auth.signup.succeeded", {
    request_id: requestId,
    avatar_status: avatarStatus,
    name_rules: enforceChineseNameRules ? "zh_ip" : "international_ip"
  });
  return json({ success: true, avatar_status: avatarStatus }, 200);
}
export async function handlePasswordLogin(request, env, ipInfo) {
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

  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const deviceId = typeof body?.device_id === "string" ? body.device_id : "";
  if (!email || !password) {
    workerLog("warn", "auth.login.invalid_request", { ...logContext, reason: "missing_credentials" });
    return json({ error: "Email and password are required" }, 400);
  }

  let authResponse;
  try {
    authResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({ email, password })
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
    upstream_status: authResponse.status,
    risk_level: audit.riskLevel,
    recent_failures_15m: audit.recentFailures,
    login_event_written: audit.loginEventWritten,
    audit_log_written: audit.auditLogWritten,
    duration_ms: Date.now() - startedAt
  });

  return json(authData, authResponse.status);
}

