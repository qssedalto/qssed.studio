import { osStyles } from "./src/styles/os-styles.js";

const SUPABASE_URL = "https://xunbsoxijasekzadckob.supabase.co";
const SUPABASE_KEY = "sb_publishable_1ScwEvseisteYNgc5xM1pQ_NNekUmF1";
const ZH_COUNTRIES = ["CN", "HK", "MO", "TW", "SG"];
const ADMIN_EMAILS = [
  "qssed_a@icloud.com"
];
const MAX_STORAGE_FILE_BYTES = 50 * 1024 * 1024;
const MAX_STORAGE_LIST_OBJECTS = 10000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const OS_PATHS = new Set([
  "/dashboard",
  "/info",
  "/info/knowledge",
  "/info/links",
  "/info/notes",
  "/info/summaries",
  "/info/search",
  "/profile",
  "/profile/details",
  "/profile/account",
  "/profile/preferences",
  "/workspace",
  "/workspace/workbench",
  "/workspace/projects",
  "/workspace/experiments",
  "/workspace/drafts",
  "/workspace/tasks",
  "/admin",
  "/admin/general",
  "/admin/users",
  "/admin/roles",
  "/admin/logs",
  "/admin/system",
  "/settings",
  "/settings/general",
  "/settings/appearance",
  "/settings/language",
  "/settings/security",
  "/settings/notifications",
  "/settings/ai",
  "/settings/integrations",
  "/settings/storage"
]);
const LEGACY_REDIRECTS = new Map([
  ["/", "/dashboard"],
  ["/general", "/dashboard"],
  ["/general/infohub", "/info"],
  ["/personal", "/profile"],
  ["/profile/security", "/settings/security"]
]);
const TEXT = {
  en: {
    studioName: "QssedA Studio",
    signIn: "Sign In",
    signUp: "Sign Up",
    continue: "Continue",
    getStarted: "Get Started",
    adminOnly: "This area is reserved for listed administrators.",
    enterBirthDate: "Enter your birth date.",
    birthYear: "Year",
    birthMonth: "Month",
    birthDay: "Day",
    adminApprovalMessage: "Registration successful. An administrator will grant your account permissions later. Please tell the administrator that your account has been registered successfully. Click the button below to sign in. If you need to contact us, please email:",
    selectGender: "Select your gender.",
    male: "Male",
    female: "Female",
    hideGenderOnProfile: "Do not show my gender on my profile",
    chooseUsername: "Choose your username.",
    addProfileDetails: "Add your profile details, or skip for a faster setup.",
    skipName: "I do not want to provide this",
    enterEmail: "Enter your email.",
    setPassword: "Set your password to finish.",
    alreadyHaveAccount: "Already have an account? Sign in",
    dontHaveAccount: "Don't have an account? Sign up",
    loginDescription: "Sign in to continue.",
    signUpDescription: "Create an account to start using Studio.",
    usernamePlaceholder: "Username",
    firstNamePlaceholder: "First name",
    lastNamePlaceholder: "Last name",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Password",
    loading: "Loading...",
    account: "Account",
  },
  zh: {
    studioName: "QssedA Studio",
    signIn: "登录",
    signUp: "注册",
    continue: "继续",
    getStarted: "开始使用",
    adminOnly: "此区域仅限已列入名单的管理员使用。",
    enterBirthDate: "请输入你的出生日期。",
    birthYear: "年",
    birthMonth: "月",
    birthDay: "日",
    adminApprovalMessage: "注册成功。管理员稍后会给予你相应权限。请告知管理员你的账号已注册成功。点击下方按钮即可登录。如需联系管理员，请发邮件至：",
    selectGender: "请选择你的性别",
    male: "男",
    female: "女",
    hideGenderOnProfile: "不在个人资料中展示我的性别",
    chooseUsername: "请选择你的用户名。",
    addProfileDetails: "请填写你的资料，或跳过以更快完成设置。",
    skipName: "我不想提供",
    enterEmail: "请输入你的邮箱",
    setPassword: "请设置密码以完成注册",
    alreadyHaveAccount: "已有账号？登录",
    dontHaveAccount: "还没有账号？注册",
    loginDescription: "登录后继续",
    signUpDescription: "创建账号并开始使用 Studio",
    usernamePlaceholder: "用户名",
    firstNamePlaceholder: "姓",
    lastNamePlaceholder: "名",
    emailPlaceholder: "邮箱",
    passwordPlaceholder: "密码",
    loading: "加载中...",
    account: "账号",
  }
};

export default {
  async fetch(request, env) {
    const { pathname, locale, ipInfo } = getRouteInfo(request);

    if (pathname === "/api/auth/signup") {
      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
      return handleRegistrationSignup(request, env, ipInfo);
    }

    if (pathname === "/api/auth/login") {
      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
      return handlePasswordLogin(request, env, ipInfo);
    }

    if (pathname === "/api/storage/files") {
      if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
      return handleStorageFiles(request, env);
    }

    if (pathname === "/api/storage/upload") {
      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
      return handleStorageUpload(request, env);
    }

    if (pathname === "/api/storage/object") {
      if (request.method !== "GET" && request.method !== "DELETE") return json({ error: "Method not allowed" }, 405);
      return handleStorageObject(request, env);
    }

    const legacyTarget = LEGACY_REDIRECTS.get(pathname);

    if (legacyTarget) {
      return localizedRedirect(request, locale, legacyTarget);
    }

    const t = TEXT[locale];
    const links = buildLinks(locale, pathname);

    if (OS_PATHS.has(pathname)) {
      const cachedOsUserLabel = getRequestCookie(request, "qssed-os-user-name");
      return html(osPage(t, links, pathname, ipInfo, cachedOsUserLabel));
    }

    if (pathname === "/sign-up") {
      return html(signUpPage(t, links, ipInfo));
    }

    if (pathname === "/login") {
      return html(loginPage(t, links, ipInfo));
    }


    return html(notFoundPage(t, links), 404);
  },
};

function getRouteInfo(request) {
  const url = new URL(request.url);
  const ip = request.headers.get("CF-Connecting-IP") || "Unknown";
  const country = request.cf?.country || "Unknown";
  const region = request.cf?.region || request.cf?.regionCode || "";
  const city = request.cf?.city || "";
  const pathParts = url.pathname.split("/").filter(Boolean);
  const firstSegment = pathParts[0]?.toLowerCase();
  let pathname = url.pathname;
  let locale;

  if (firstSegment === "zh-cn") {
    locale = "zh";
    pathname = "/" + pathParts.slice(1).join("/");
  } else if (firstSegment === "en") {
    locale = "en";
    pathname = "/" + pathParts.slice(1).join("/");
  }

  if (!pathname || pathname === "//") {
    pathname = "/";
  }

  if (!locale) {
    const lang = (url.searchParams.get("lang") || "").toLowerCase();
    if (lang === "zh" || lang === "zh-cn") {
      locale = "zh";
    } else if (lang === "en") {
      locale = "en";
    } else {
      locale = ZH_COUNTRIES.includes(country) ? "zh" : "en";
    }
  }

  return {
    pathname,
    locale,
    ipInfo: {
      ip,
      country,
      region,
      city,
      locale
    }
  };
}

function buildLinks(locale, pathname) {
  const prefix = locale === "zh" ? "/zh-cn" : "/en";
  const currentPath = pathname === "/" ? "" : pathname;

  return {
    login: `${prefix}/login`,
    signUp: `${prefix}/sign-up`,
    dashboard: `${prefix}/dashboard`,
    zhCurrent: `/zh-cn${currentPath}`,
    enCurrent: `/en${currentPath}`
  };
}

function html(content, status = 200) {
  return new Response(content, {
    status,
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
  });
}

function localizedRedirect(request, locale, pathname) {
  const url = new URL(request.url);
  const prefix = locale === "zh" ? "/zh-cn" : "/en";
  url.pathname = `${prefix}${pathname}`;
  return Response.redirect(url.toString(), 302);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "cache-control": "no-store"
    }
  });
}

function storageUnavailable() {
  return json({ error: "Storage service is temporarily unavailable." }, 503);
}

function hasStorageBinding(env) {
  return Boolean(env?.STORAGE && ["list", "get", "put", "head", "delete"].every(method => typeof env.STORAGE[method] === "function"));
}

function isStorageObjectId(value) {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function storageKey(ownerId, objectId) {
  return `users/${ownerId}/${objectId}`;
}

function storagePrefix(ownerId) {
  return `users/${ownerId}/`;
}

function cleanStorageFilename(value) {
  const normalized = String(value || "")
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[\\/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return Array.from(normalized).slice(0, 180).join("") || "file";
}

function storageContentType(value) {
  const type = String(value || "").trim().toLowerCase();
  return /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+(?:\s*;\s*charset=[a-z0-9._-]+)?$/.test(type)
    ? type.slice(0, 160)
    : "application/octet-stream";
}

function storageDownloadDisposition(filename) {
  const safeName = cleanStorageFilename(filename);
  const fallback = Array.from(safeName)
    .map(char => /[A-Za-z0-9._-]/.test(char) ? char : "_")
    .join("")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120) || "file";
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encodeRfc8187Filename(safeName)}`;
}

function encodeRfc8187Filename(value) {
  return encodeURIComponent(value).replace(/['()*]/g, character => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

async function verifyStorageUser(request, env) {
  const authorization = request.headers.get("Authorization") || "";
  if (!/^Bearer\s+\S+$/i.test(authorization)) {
    return { error: json({ error: "Authentication required." }, 401) };
  }

  let response;
  try {
    response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: authorization
      }
    });
  } catch {
    return { error: json({ error: "Authentication service is temporarily unavailable." }, 503) };
  }

  if (response.status === 401 || response.status === 403) {
    return { error: json({ error: "Session is invalid or expired." }, 401) };
  }
  if (!response.ok) {
    return { error: json({ error: "Authentication service is temporarily unavailable." }, 503) };
  }

  let user;
  try {
    user = await response.json();
  } catch {
    return { error: json({ error: "Authentication service is temporarily unavailable." }, 503) };
  }
  if (!isStorageObjectId(user?.id)) {
    return { error: json({ error: "Session is invalid or expired." }, 401) };
  }

  const secret = getSupabaseSecret(env);
  if (!secret) {
    return { error: json({ error: "Account service is temporarily unavailable." }, 503) };
  }

  let profileResponse;
  try {
    profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=status&id=eq.${encodeURIComponent(user.id)}`, {
      headers: {
        apikey: secret,
        ...(secret.split(".").length === 3 ? { Authorization: `Bearer ${secret}` } : {})
      }
    });
  } catch {
    return { error: json({ error: "Account service is temporarily unavailable." }, 503) };
  }
  if (!profileResponse.ok) {
    return { error: json({ error: "Account service is temporarily unavailable." }, 503) };
  }

  let profiles;
  try {
    profiles = await profileResponse.json();
  } catch {
    return { error: json({ error: "Account service is temporarily unavailable." }, 503) };
  }
  if (!Array.isArray(profiles) || profiles.length !== 1 || profiles[0]?.status !== "active") {
    return { error: json({ error: "Account is not authorized to use storage." }, 403) };
  }
  return { user };
}

class StorageSizeLimitError extends Error {}

function sizeLimitedStorageBody(body, maximumBytes) {
  if (!body) return null;
  const reader = body.getReader();
  let total = 0;
  return new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        total += value.byteLength;
        if (total > maximumBytes) {
          await reader.cancel();
          controller.error(new StorageSizeLimitError("File exceeds the 50 MB limit."));
          return;
        }
        controller.enqueue(value);
      } catch (error) {
        controller.error(error);
      }
    },
    async cancel(reason) {
      await reader.cancel(reason);
    }
  });
}

async function handleStorageFiles(request, env) {
  const auth = await verifyStorageUser(request, env);
  if (auth.error) return auth.error;
  if (!hasStorageBinding(env)) return storageUnavailable();

  const files = [];
  let cursor;
  let scanned = 0;
  let partial = false;
  try {
    do {
      const remaining = MAX_STORAGE_LIST_OBJECTS - scanned;
      const page = await env.STORAGE.list({
        prefix: storagePrefix(auth.user.id),
        cursor,
        limit: Math.min(1000, remaining),
        include: ["httpMetadata", "customMetadata"]
      });
      scanned += page.objects.length;
      for (const object of page.objects) {
        const id = object.key.slice(storagePrefix(auth.user.id).length);
        if (!isStorageObjectId(id)) continue;
        files.push({
          id,
          name: cleanStorageFilename(object.customMetadata?.originalName),
          size: Number(object.size) || 0,
          uploadedAt: object.uploaded?.toISOString?.() || null,
          contentType: storageContentType(object.httpMetadata?.contentType)
        });
      }
      cursor = page.cursor;
      if (!page.truncated) break;
      if (scanned >= MAX_STORAGE_LIST_OBJECTS || !cursor) {
        partial = true;
        break;
      }
    } while (cursor);
  } catch (error) {
    workerLog("error", "storage.list.failed", { message: String(error?.message || error) });
    return storageUnavailable();
  }

  files.sort((a, b) => String(b.uploadedAt || "").localeCompare(String(a.uploadedAt || "")));
  return json({
    connected: true,
    files,
    file_count: files.length,
    used_bytes: files.reduce((total, file) => total + file.size, 0),
    partial
  });
}

async function handleStorageUpload(request, env) {
  const auth = await verifyStorageUser(request, env);
  if (auth.error) return auth.error;
  if (!hasStorageBinding(env)) return storageUnavailable();

  const headerSize = request.headers.get("Content-Length") || request.headers.get("X-File-Size");
  if (headerSize && (!/^\d+$/.test(headerSize) || Number(headerSize) > MAX_STORAGE_FILE_BYTES)) {
    return json({ error: "File exceeds the 50 MB limit." }, 413);
  }
  if (!request.body) return json({ error: "A file body is required." }, 400);

  const id = crypto.randomUUID();
  const key = storageKey(auth.user.id, id);
  const name = cleanStorageFilename(new URL(request.url).searchParams.get("name"));
  try {
    await env.STORAGE.put(key, sizeLimitedStorageBody(request.body, MAX_STORAGE_FILE_BYTES), {
      httpMetadata: { contentType: storageContentType(request.headers.get("Content-Type")) },
      customMetadata: { originalName: name, ownerId: auth.user.id }
    });
  } catch (error) {
    try {
      await env.STORAGE.delete(key);
    } catch {}
    if (error instanceof StorageSizeLimitError || /50\s*MB|exceeds the 50 MB/i.test(String(error?.message || error))) {
      return json({ error: "File exceeds the 50 MB limit." }, 413);
    }
    workerLog("error", "storage.upload.failed", { message: String(error?.message || error) });
    return storageUnavailable();
  }

  return json({ id, name, message: "File uploaded." }, 201);
}

async function handleStorageObject(request, env) {
  const auth = await verifyStorageUser(request, env);
  if (auth.error) return auth.error;
  if (!hasStorageBinding(env)) return storageUnavailable();

  const id = new URL(request.url).searchParams.get("id") || "";
  if (!isStorageObjectId(id)) return json({ error: "Invalid object id." }, 400);
  const key = storageKey(auth.user.id, id);

  if (request.method === "DELETE") {
    try {
      const existing = await env.STORAGE.head(key);
      if (!existing) return json({ error: "File not found." }, 404);
      await env.STORAGE.delete(key);
      return json({ id, message: "File deleted." });
    } catch (error) {
      workerLog("error", "storage.delete.failed", { message: String(error?.message || error) });
      return storageUnavailable();
    }
  }

  try {
    const object = await env.STORAGE.get(key);
    if (!object) return json({ error: "File not found." }, 404);
    return new Response(object.body, {
      headers: {
        "content-type": "application/octet-stream",
        "content-disposition": storageDownloadDisposition(object.customMetadata?.originalName),
        "cache-control": "private, no-store",
        "x-content-type-options": "nosniff"
      }
    });
  } catch (error) {
    workerLog("error", "storage.download.failed", { message: String(error?.message || error) });
    return storageUnavailable();
  }
}

function getRequestCookie(request, name) {
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

function escapeHtmlText(value) {
  return String(value || "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function getSupabaseSecret(env) {
  return env?.SUPABASE_SECRET_KEY || env?.SUPABASE_SERVICE_ROLE_KEY || "";
}

function getWorkerRequestId(request) {
  return request.headers.get("CF-Ray") || crypto.randomUUID();
}

function workerLog(level, event, details = {}) {
  const payload = JSON.stringify({
    source: "qsseda-worker",
    event,
    ...details
  });
  const method = level === "error" ? "error" : level === "warn" ? "warn" : "info";
  console[method](payload);
}

function parseServerUserAgent(userAgent) {
  const ua = userAgent || "";
  const browser = ua.includes("Edg/") ? "Edge" : ua.includes("Chrome/") ? "Chrome" : ua.includes("Firefox/") ? "Firefox" : ua.includes("Safari/") ? "Safari" : "Unknown";
  const os = ua.includes("Windows") ? "Windows" : ua.includes("Mac OS") ? "macOS" : ua.includes("Android") ? "Android" : ua.includes("iPhone") || ua.includes("iPad") ? "iOS" : ua.includes("Linux") ? "Linux" : "Unknown";
  const device_type = /Mobile|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop";
  return { user_agent: ua, browser, os, device_type };
}

async function recentFailedLoginCount(env, ipAddress, logContext) {
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

async function recordServerLoginEvent(env, request, ipInfo, user, success, deviceId, logContext) {
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

function registrationUsernameRule(username) {
  const value = String(username || "").trim();
  const key = value.toLowerCase();
  if (value.length < 3) return "too_short";
  if (key.includes("tianguo")) return "reserved_tianguo";
  if (key.includes("admin")) return "reserved_admin";
  return "";
}

function registrationEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function registrationPasswordChecks(password) {
  const value = String(password || "");
  return {
    length: value.length >= 8,
    number: /\d/.test(value),
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    special: /[^A-Za-z0-9\s]/.test(value)
  };
}

function registrationHanNameValid(value, expectedLength) {
  const text = String(value || "").trim();
  return (expectedLength === 1 || expectedLength === 2) &&
    Array.from(text).length === expectedLength &&
    /^\p{Script=Han}+$/u.test(text);
}

function registrationInternationalNameValid(value) {
  const text = String(value || "").trim();
  return text.length > 0 && text.length <= 80;
}

async function handleRegistrationSignup(request, env, ipInfo) {
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
async function handlePasswordLogin(request, env, ipInfo) {
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

function baseHead(title) {
  return `
    <title>${title}</title>

    <meta name="viewport"
        content="width=device-width, initial-scale=1.0">
    <script>
      (function () {
        try {
          const savedTheme = localStorage.getItem("qssed-theme");
          const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
          document.documentElement.dataset.theme = savedTheme || (prefersLight ? "light" : "dark");
        } catch {
          document.documentElement.dataset.theme = "dark";
        }
      })();
    </script>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <style>
      :root{
        color-scheme:dark;
        --bg:#101318;
        --bg-soft:#171b22;
        --surface:#191f29;
        --surface-strong:#202735;
        --surface-soft:#141820;
        --card:rgba(25,31,41,0.92);
        --text:#f7f8fb;
        --muted:#a6afbf;
        --quiet:#737f91;
        --border:#303947;
        --border-strong:#465365;
        --primary:#6aa6ff;
        --primary-hover:#8bb9ff;
        --primary-ink:#07111f;
        --secondary:#273141;
        --secondary-hover:#344155;
        --success:#7dd8b4;
        --danger:#ff9a9a;
        --shadow:0 24px 70px rgba(0,0,0,.42);
        --shadow-soft:0 14px 34px rgba(0,0,0,.24);
        --radius:8px;
        --radius-lg:8px;
      }

      :root[data-theme="light"]{
        color-scheme:light;
        --bg:#f4f6f9;
        --bg-soft:#e9edf3;
        --surface:#ffffff;
        --surface-strong:#f8fafc;
        --surface-soft:#eef2f7;
        --card:rgba(255,255,255,0.96);
        --text:#111827;
        --muted:#526071;
        --quiet:#7a8797;
        --border:#d9e0ea;
        --border-strong:#c3cedc;
        --primary:#2459d6;
        --primary-hover:#1d48ad;
        --primary-ink:#ffffff;
        --secondary:#e8edf4;
        --secondary-hover:#dce4ee;
        --success:#0d8a61;
        --danger:#b42318;
        --shadow:0 24px 70px rgba(18, 26, 38, .12);
        --shadow-soft:0 14px 34px rgba(18, 26, 38, .08);
      }

      *{
        box-sizing:border-box;
      }

      html{
        font-size:16px;
        background:var(--bg);
      }

      body{
        margin:0;
        padding:24px;
        min-height:100vh;
        background:
          linear-gradient(180deg, color-mix(in srgb, var(--surface-soft) 34%, transparent) 0%, transparent 42%),
          linear-gradient(135deg, var(--bg) 0%, var(--bg-soft) 100%);
        background-size:100% 100%, 180% 180%;
        color:var(--text);
        display:flex;
        justify-content:center;
        align-items:center;
        font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        letter-spacing:0;
        animation:ambient-pan 18s ease-in-out infinite alternate;
      }

      body::before{
        content:"";
        position:fixed;
        inset:0;
        pointer-events:none;
        background:
          linear-gradient(120deg, transparent 0%, color-mix(in srgb, var(--primary) 8%, transparent) 42%, transparent 76%),
          repeating-linear-gradient(90deg, color-mix(in srgb, var(--border) 22%, transparent) 0 1px, transparent 1px 88px);
        opacity:.36;
        mask-image:linear-gradient(to bottom, rgba(0,0,0,.75), transparent 70%);
        animation:surface-scan 16s linear infinite;
      }

      .card{
        width:100%;
        max-width:560px;
        background:var(--card);
        padding:34px;
        border-radius:var(--radius-lg);
        box-shadow:var(--shadow);
        text-align:left;
        border:1px solid var(--border);
        position:relative;
        overflow:hidden;
        animation:panel-enter .58s cubic-bezier(.2,.8,.2,1) both;
      }

      .card::before{
        content:"";
        position:absolute;
        inset:0 0 auto;
        height:3px;
        background:linear-gradient(90deg, transparent, var(--primary), transparent);
        transform:translateX(-80%);
        animation:accent-pass 1.3s ease .18s both;
      }

      h1{
        margin-top:0;
        margin-bottom:14px;
        font-size:clamp(34px, 5vw, 58px);
        line-height:1.02;
        letter-spacing:0;
        word-break:normal;
        overflow-wrap:anywhere;
        white-space:normal;
        color:var(--text);
      }

      .brand-title{
        white-space:nowrap;
        overflow-wrap:normal;
      }

      p{
        color:var(--muted);
        line-height:1.65;
      }

      input,
      select{
        width:100%;
        margin-top:12px;
        padding:0 14px;
        border-radius:var(--radius);
        border:1px solid var(--border);
        background:var(--surface-soft);
        color:var(--text);
        font-size:15px;
        outline:none;
        transition:border-color .18s ease, box-shadow .18s ease, background .18s ease;
      }

      input:focus,
      select:focus{
        border-color:var(--primary);
        box-shadow:0 0 0 4px color-mix(in srgb, var(--primary) 18%, transparent);
        background:var(--surface);
      }

      button,a.button{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:8px;
        width:100%;
        margin-top:14px;
        padding:0 16px;
        border:1px solid transparent;
        border-radius:var(--radius);
        background:var(--primary);
        color:var(--primary-ink);
        font-size:15px;
        font-weight:700;
        cursor:pointer;
        text-decoration:none;
        transition:background .18s ease, transform .18s ease, border-color .18s ease, box-shadow .18s ease;
      }

      input,
      select,
      button,
      a.button{
        min-height:52px;
      }

      button:hover,
      a.button:hover{
        background:var(--primary-hover);
        transform:translateY(-1px);
        box-shadow:var(--shadow-soft);
      }

      button:active,
      a.button:active{
        transform:translateY(0) scale(.985);
      }

      .secondary{
        background:var(--secondary);
        color:var(--text);
        border-color:var(--border);
      }

      .secondary:hover{
        background:var(--secondary-hover);
      }

      #message{
        margin-top:15px;
        color:var(--primary);
        font-size:14px;
        word-break:break-word;
      }
      .checkbox-row{
        display:flex;
        align-items:center;
        gap:10px;
        margin-top:14px;
        color:var(--muted);
        font-size:14px;
        text-align:left;
      }

      .checkbox-row input{
        width:auto;
        min-height:auto;
        margin:0;
      }

      .choice-row{
        display:flex;
        align-items:center;
        gap:10px;
        margin-top:12px;
        padding:12px;
        border:1px solid var(--border);
        border-radius:var(--radius);
        background:var(--surface-soft);
        color:var(--text);
        text-align:left;
      }

      .choice-row input{
        width:auto;
        min-height:auto;
        margin:0;
      }

      .birthdate-grid{
        display:grid;
        grid-template-columns:repeat(3, minmax(0, 1fr));
        gap:12px;
      }

      .birthdate-grid select{
        margin-top:12px;
      }

      @media (max-width: 560px){
        body{
          padding:14px;
        }

        .card{
          padding:24px 18px;
        }

        .birthdate-grid{
          grid-template-columns:1fr;
          gap:0;
        }
      }

      .theme-toggle{
        position:fixed;
        top:18px;
        right:18px;
        z-index:20;
        width:44px;
        min-height:44px;
        margin:0;
        padding:0;
        border-radius:var(--radius);
        border:1px solid var(--border);
        background:var(--card);
        color:var(--text);
        box-shadow:var(--shadow-soft);
      }

      .language-toggle{
        position:fixed;
        top:18px;
        right:68px;
        z-index:20;
        display:flex;
        align-items:center;
        justify-content:center;
        width:44px;
        height:44px;
        min-width:44px;
        min-height:44px;
        margin:0;
        padding:0;
        border-radius:var(--radius);
        border:1px solid var(--border);
        background:var(--card);
        color:var(--text);
        box-shadow:var(--shadow-soft);
        text-decoration:none;
        font-size:12px;
        line-height:1;
        font-weight:850;
        letter-spacing:0;
      }

      .theme-toggle:hover{
        background:var(--surface-strong);
      }

      .language-toggle:hover{
        background:var(--surface-strong);
        transform:translateY(-1px);
      }

      .theme-toggle:active{
        transform:rotate(12deg) scale(.96);
      }

      .theme-toggle .theme-sun,
      :root[data-theme="light"] .theme-toggle .theme-moon{
        display:none;
      }

      :root[data-theme="light"] .theme-toggle .theme-sun{
        display:inline;
      }

      :root.theme-switching body,
      :root.theme-switching .card{
        transition:background .28s ease, color .28s ease, border-color .28s ease, box-shadow .28s ease;
      }

      @keyframes panel-enter{
        from{
          opacity:0;
          transform:translateY(16px) scale(.985);
          filter:blur(8px);
        }
        to{
          opacity:1;
          transform:translateY(0) scale(1);
          filter:blur(0);
        }
      }

      @keyframes accent-pass{
        from{ transform:translateX(-86%); opacity:.35; }
        to{ transform:translateX(86%); opacity:.9; }
      }

      @keyframes ambient-pan{
        from{ background-position:0% 0%, 0% 50%; }
        to{ background-position:0% 0%, 100% 50%; }
      }

      @keyframes surface-scan{
        from{ transform:translateX(-36px); }
        to{ transform:translateX(36px); }
      }

      @keyframes item-rise{
        from{
          opacity:0;
          transform:translateY(12px);
        }
        to{
          opacity:1;
          transform:translateY(0);
        }
      }

      @media (prefers-reduced-motion: reduce){
        *,
        *::before,
        *::after{
          animation-duration:.001ms !important;
          animation-iteration-count:1 !important;
          scroll-behavior:auto !important;
          transition-duration:.001ms !important;
        }
      }

      @media (max-width: 560px){
        .theme-toggle{
          top:12px;
          right:12px;
        }

        .language-toggle{
          top:12px;
          right:62px;
          min-width:62px;
        }
      }

      /* APPLE_DESIGN_SYSTEM_V2_SHARED */
/* APPLE_DESIGN_SYSTEM_V2 — shared surfaces */
:root{
  color-scheme:dark;
  --bg:#0b0b0d;
  --bg-soft:#141416;
  --surface:#1c1c1e;
  --surface-strong:#2c2c2e;
  --surface-soft:rgba(118,118,128,.14);
  --card:rgba(28,28,30,.74);
  --text:#f5f5f7;
  --muted:#a1a1a6;
  --quiet:#6e6e73;
  --border:rgba(255,255,255,.105);
  --border-strong:rgba(255,255,255,.19);
  --primary:#0a84ff;
  --primary-hover:#409cff;
  --primary-ink:#fff;
  --secondary:rgba(118,118,128,.18);
  --secondary-hover:rgba(118,118,128,.28);
  --success:#32d74b;
  --danger:#ff453a;
  --warning:#ffd60a;
  --shadow:0 30px 80px rgba(0,0,0,.34);
  --shadow-soft:0 12px 34px rgba(0,0,0,.18);
  --radius:14px;
  --radius-lg:26px;
  --hairline:rgba(255,255,255,.09);
  --glass:rgba(28,28,30,.68);
  --glass-heavy:rgba(24,24,26,.82);
  --fill:rgba(118,118,128,.16);
}
:root[data-theme="light"]{
  color-scheme:light;
  --bg:#f5f5f7;
  --bg-soft:#ffffff;
  --surface:#ffffff;
  --surface-strong:#f2f2f7;
  --surface-soft:rgba(118,118,128,.10);
  --card:rgba(255,255,255,.72);
  --text:#1d1d1f;
  --muted:#6e6e73;
  --quiet:#8e8e93;
  --border:rgba(60,60,67,.13);
  --border-strong:rgba(60,60,67,.22);
  --primary:#007aff;
  --primary-hover:#1687ff;
  --primary-ink:#fff;
  --secondary:rgba(118,118,128,.12);
  --secondary-hover:rgba(118,118,128,.20);
  --success:#248a3d;
  --danger:#d70015;
  --warning:#b25000;
  --shadow:0 28px 72px rgba(0,0,0,.13);
  --shadow-soft:0 10px 30px rgba(0,0,0,.075);
  --hairline:rgba(60,60,67,.12);
  --glass:rgba(255,255,255,.72);
  --glass-heavy:rgba(247,247,249,.86);
  --fill:rgba(118,118,128,.10);
}
*{-webkit-tap-highlight-color:transparent}
html{font-size:16px;background:var(--bg);font-optical-sizing:auto}
body{
  padding:clamp(16px,3vw,32px);
  background:
    radial-gradient(900px 560px at 15% -5%,color-mix(in srgb,var(--primary) 12%,transparent),transparent 64%),
    radial-gradient(720px 520px at 96% 104%,color-mix(in srgb,#af52de 8%,transparent),transparent 68%),
    var(--bg);
  background-size:auto;
  color:var(--text);
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display","Segoe UI",system-ui,sans-serif;
  letter-spacing:0;
  animation:none;
}
body::before{
  background:none!important;
  opacity:0!important;
  animation:none!important;
}
.card{
  max-width:560px;
  padding:32px;
  border:1px solid var(--border);
  border-radius:28px;
  background:var(--glass);
  -webkit-backdrop-filter:blur(30px) saturate(180%);
  backdrop-filter:blur(30px) saturate(180%);
  box-shadow:var(--shadow);
  overflow:visible;
  animation:apple-materialize .34s cubic-bezier(.2,.8,.2,1) both;
}
.card::before{display:none}
h1,.brand-title{
  margin-bottom:12px;
  font-weight:720;
  letter-spacing:-.035em;
  line-height:1.04;
}
h1{font-size:clamp(34px,5vw,54px)}
p{color:var(--muted);line-height:1.55}
input,select{
  min-height:50px;
  margin-top:12px;
  padding:0 14px;
  border:1px solid transparent;
  border-radius:13px;
  background:var(--fill);
  color:var(--text);
  font:inherit;
  font-size:15px;
  box-shadow:inset 0 0 0 1px var(--border);
  transition:background .16s ease,border-color .16s ease,box-shadow .16s ease;
}
input:hover,select:hover{background:color-mix(in srgb,var(--fill) 82%,var(--surface) 18%)}
input:focus,select:focus{
  border-color:color-mix(in srgb,var(--primary) 70%,transparent);
  background:color-mix(in srgb,var(--surface) 88%,transparent);
  box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 16%,transparent);
}
button,a.button{
  min-height:50px;
  margin-top:14px;
  padding:0 16px;
  border:0;
  border-radius:13px;
  background:var(--primary);
  color:var(--primary-ink);
  font:inherit;
  font-size:15px;
  font-weight:680;
  box-shadow:none;
  touch-action:manipulation;
  transition:filter .14s ease,background .14s ease,transform .10s ease,opacity .14s ease;
}
button:hover,a.button:hover{background:var(--primary);filter:brightness(1.06);transform:none;box-shadow:none}
button:active,a.button:active{transform:scale(.975);filter:brightness(.97)}
button:disabled,a.button[aria-disabled="true"]{opacity:.42;cursor:not-allowed;filter:none;transform:none}
.secondary{
  background:var(--secondary)!important;
  color:var(--text)!important;
  border:0!important;
}
.secondary:hover{background:var(--secondary-hover)!important}
.choice-row{
  min-height:50px;
  padding:12px 14px;
  border:1px solid transparent;
  border-radius:14px;
  background:var(--fill);
  box-shadow:inset 0 0 0 1px var(--border);
  transition:background .14s ease,box-shadow .14s ease,transform .10s ease;
}
.choice-row:hover{background:var(--secondary)}
.choice-row:active{transform:scale(.99)}
.checkbox-row{color:var(--muted)}
input[type="radio"],input[type="checkbox"]{accent-color:var(--primary)}
.theme-toggle,.language-toggle{
  top:18px;
  width:44px;
  height:44px;
  min-width:44px;
  min-height:44px;
  margin:0;
  padding:0;
  border:1px solid color-mix(in srgb,var(--border-strong) 72%,transparent);
  border-radius:50%;
  background:var(--glass);
  color:var(--text);
  -webkit-backdrop-filter:blur(20px) saturate(180%);
  backdrop-filter:blur(20px) saturate(180%);
  box-shadow:0 8px 28px rgba(0,0,0,.12),inset 0 1px 0 color-mix(in srgb,#fff 32%,transparent);
}
.theme-toggle{right:18px}
.language-toggle{right:70px;font-size:11px;font-weight:720}
.theme-toggle:hover,.language-toggle:hover{background:color-mix(in srgb,var(--glass) 84%,var(--surface-strong) 16%);transform:none}
.theme-toggle:active,.language-toggle:active{transform:scale(.92)}
#message{color:var(--primary);font-size:13px;line-height:1.5}
@keyframes apple-materialize{
  from{opacity:0;transform:scale(.985) translateY(8px);filter:blur(4px)}
  to{opacity:1;transform:none;filter:none}
}
@media (max-width:560px){
  body{padding:12px}
  .card{padding:24px 18px;border-radius:24px}
  .theme-toggle,.language-toggle{top:12px}
  .theme-toggle{right:12px}.language-toggle{right:62px}
}
@media (prefers-reduced-motion:reduce){
  .card{animation:none!important}
  button,a.button,.choice-row,.theme-toggle,.language-toggle{transition:opacity .12s ease,background .12s ease,color .12s ease!important}
}
@media (prefers-reduced-transparency:reduce){
  .card,.theme-toggle,.language-toggle{background:var(--surface)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
}
@media (prefers-contrast:more){
  .card,.theme-toggle,.language-toggle,input,select,.choice-row{border-color:var(--border-strong)!important}
}
</style>
  `;
}

function supabaseScript() {
  return `
    <script>
      const supabaseClient = supabase.createClient(
        "${SUPABASE_URL}",
        "${SUPABASE_KEY}"
      );
    </script>
  `;
}

function auditClientScript(ipInfo) {
  return `
    <script>
      const auditRequestContext = ${JSON.stringify({
        ip_address: ipInfo?.ip || "",
        country: ipInfo?.country || "",
        region: ipInfo?.region || "",
        city: ipInfo?.city || ""
      })};

      function formatAuditDate(value) {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const hh = String(date.getHours()).padStart(2, "0");
        const min = String(date.getMinutes()).padStart(2, "0");
        return yyyy + "-" + mm + "-" + dd + " " + hh + ":" + min;
      }

      function auditEscape(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
      }

      function getAuditDeviceId() {
        const key = "qssed-device-id";
        let id = localStorage.getItem(key);
        if (!id) {
          id = crypto.randomUUID ? crypto.randomUUID() : "device-" + Date.now() + "-" + Math.random().toString(16).slice(2);
          localStorage.setItem(key, id);
        }
        return id;
      }

      function parseAuditUserAgent() {
        const ua = navigator.userAgent || "";
        const browser = ua.includes("Edg/") ? "Edge" : ua.includes("Chrome/") ? "Chrome" : ua.includes("Firefox/") ? "Firefox" : ua.includes("Safari/") ? "Safari" : "Unknown";
        const os = ua.includes("Windows") ? "Windows" : ua.includes("Mac OS") ? "macOS" : ua.includes("Android") ? "Android" : ua.includes("iPhone") || ua.includes("iPad") ? "iOS" : ua.includes("Linux") ? "Linux" : "Unknown";
        const device_type = /Mobile|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop";
        return { user_agent: ua, browser, os, device_type, device_name: browser + " on " + os };
      }

      async function updateCurrentDevice(user) {
        if (!user) return null;
        const device = parseAuditUserAgent();
        const device_id = getAuditDeviceId();
        const payload = {
          user_id: user.id,
          device_id,
          device_name: device.device_name,
          browser: device.browser,
          os: device.os,
          device_type: device.device_type,
          last_ip: auditRequestContext.ip_address,
          country: auditRequestContext.country,
          region: auditRequestContext.region,
          city: auditRequestContext.city,
          last_seen_at: new Date().toISOString()
        };

        const { data: existing } = await supabaseClient
          .from("user_devices")
          .select("id, first_seen_at")
          .eq("device_id", device_id)
          .eq("user_id", user.id)
          .maybeSingle();

        const { error } = existing
          ? await supabaseClient.from("user_devices").update(payload).eq("id", existing.id)
          : await supabaseClient.from("user_devices").insert(payload);

        if (error) {
          console.error("Device persistence failed", error.message);
          return null;
        }
        return { ...payload, first_seen_at: existing?.first_seen_at || new Date().toISOString() };
      }

      function getLastSignIn(user) {
        const identityTime = (user.identities || [])
          .map(identity => identity.last_sign_in_at)
          .filter(Boolean)
          .sort()
          .at(-1);
        return user.last_sign_in_at || identityTime || null;
      }

      const PROFILE_SUMMARY_CACHE_KEY = "qssed-profile-summary-v2";
      const PROFILE_AUDIT_CACHE_KEY = "qssed-profile-audit-v2";

      function readProfileCache(key) {
        try {
          const raw = sessionStorage.getItem(key);
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      }

      function writeProfileCache(key, value) {
        try {
          sessionStorage.setItem(key, JSON.stringify(value));
        } catch {}
      }

      function clearProfileUiCaches() {
        try {
          sessionStorage.removeItem(PROFILE_SUMMARY_CACHE_KEY);
          sessionStorage.removeItem(PROFILE_AUDIT_CACHE_KEY);
        } catch {}
      }

      function renderProfileSummarySnapshot(snapshot) {
        if (!snapshot) return;
        const root = document.getElementById("profile-summary");
        if (!root) return;
        const avatar = document.getElementById("profile-avatar");
        const name = document.getElementById("profile-display-name");
        const email = document.getElementById("profile-email");
        const tags = document.getElementById("profile-tags");
        if (avatar) {
          const fallback = String(snapshot.displayName || "User").slice(0, 1).toUpperCase();
          avatar.innerHTML = snapshot.avatar_url ? '<img src="' + auditEscape(snapshot.avatar_url) + '" alt="">' : auditEscape(fallback);
        }
        if (name) name.innerText = snapshot.displayName || "User";
        if (email) email.innerText = snapshot.email || "-";
        if (tags) {
          const values = [snapshot.role, snapshot.status].filter(Boolean);
          tags.innerHTML = values.map(value => "<span>" + auditEscape(value) + "</span>").join("");
        }
      }

      function buildAuditFingerprint(user, events, devices) {
        const eventKeys = events.map(event => [
          event.id || "",
          event.created_at || "",
          Boolean(event.success),
          event.risk_level || ""
        ]).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
        const deviceKeys = devices.map(device => [
          device.id || "",
          device.device_id || "",
          device.revoked_at || "",
          device.browser || "",
          device.os || "",
          device.device_type || ""
        ]).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
        return JSON.stringify({
          user: [user?.id || "", user?.email || "", user?.created_at || "", getLastSignIn(user) || ""],
          events: eventKeys,
          devices: deviceKeys
        });
      }

      function restoreProfileUiCaches() {
        const summary = readProfileCache(PROFILE_SUMMARY_CACHE_KEY);
        if (summary) renderProfileSummarySnapshot(summary);

        const audit = readProfileCache(PROFILE_AUDIT_CACHE_KEY);
        if (!audit || !audit.user) return;
        if (document.getElementById("audit-created-at")) {
          renderAccountAudit(audit.user, audit.events || [], audit.devices || [], false, false);
        }
        if (document.getElementById("audit-current-device")) {
          renderSecurityAudit(audit.events || [], audit.devices || [], false, false);
        }
      }

      async function hydrateProfileSummary(user) {
        const root = document.getElementById("profile-summary");
        if (!root || !user) return;

        const { data: profile, error: profileError } = await supabaseClient
          .from("profiles")
          .select("username, display_name, avatar_url, role, status")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile query failed", profileError.message);
          if (readProfileCache(PROFILE_SUMMARY_CACHE_KEY)) return;
        }

        const displayName =
          profile?.display_name ||
          profile?.username ||
          user.user_metadata?.display_name ||
          user.user_metadata?.username ||
          user.email ||
          "User";

        const snapshot = {
          user_id: user.id,
          displayName,
          email: user.email || "",
          role: profile?.role || "",
          status: profile?.status || "",
          avatar_url: profile?.avatar_url || ""
        };
        renderProfileSummarySnapshot(snapshot);
        writeProfileCache(PROFILE_SUMMARY_CACHE_KEY, snapshot);
      }

      /* PROFILE_HOME_V3 */
      const PROFILE_HOME_CACHE_PREFIX = "qssed-profile-home-v3:";
      let profileHomeState = { user: null, personalization: null, links: [], editingLinkId: null };

      function profileHomeIsZh() { return location.pathname.startsWith("/zh-cn/"); }
      function profileHomeEscape(value) { return auditEscape(value == null ? "" : String(value)); }
      function profileHomeCacheKey(userId) { return PROFILE_HOME_CACHE_PREFIX + String(userId || ""); }
      function profileHomeStatusLabel(kind) {
        const zh = profileHomeIsZh();
        const labels = zh ? { online:"在线", focus:"专注中", busy:"忙碌", away:"离开", offline:"隐身" } : { online:"Online", focus:"Focus", busy:"Busy", away:"Away", offline:"Offline" };
        return labels[kind] || labels.online;
      }
      function readProfileHomeCache(userId) {
        try { const raw = sessionStorage.getItem(profileHomeCacheKey(userId)); return raw ? JSON.parse(raw) : null; } catch { return null; }
      }
      function writeProfileHomeCache() {
        try { if (profileHomeState.user?.id) sessionStorage.setItem(profileHomeCacheKey(profileHomeState.user.id), JSON.stringify({ personalization: profileHomeState.personalization, links: profileHomeState.links })); } catch {}
      }
      function normalizeProfilePersonalization(row, userId) {
        return {
          user_id: userId,
          signature: row?.signature || "",
          bio: row?.bio || "",
          location: row?.location || "",
          status_kind: row?.status_kind || "online",
          status_text: row?.status_text || "",
          status_emoji: row?.status_emoji || "✨",
          interests: Array.isArray(row?.interests) ? row.interests.slice(0,12) : [],
          cover_style: row?.cover_style || "aurora",
          background_url: row?.background_url || ""
        };
      }
      function renderProfileHome() {
        if (!document.querySelector("[data-profile-home]")) return;
        const p = profileHomeState.personalization || normalizeProfilePersonalization(null, profileHomeState.user?.id);
        const cover = document.getElementById("profile-cover");
        if (cover) {
          cover.dataset.coverStyle = p.cover_style;
          cover.style.backgroundImage = p.background_url ? 'linear-gradient(rgba(0,0,0,.08),rgba(0,0,0,.08)),url("' + p.background_url.replace(/"/g,"%22") + '")' : "";
          cover.classList.toggle("has-custom-background", Boolean(p.background_url));
        }
        const signature = document.getElementById("profile-signature");
        if (signature) signature.textContent = p.signature || (profileHomeIsZh() ? "还没有设置个性签名。" : "No signature yet.");
        const bio = document.getElementById("profile-bio");
        if (bio) bio.textContent = p.bio || (profileHomeIsZh() ? "还没有填写个人介绍。" : "No bio yet.");
        const presence = document.getElementById("profile-presence");
        if (presence) presence.textContent = (p.status_emoji || "✨") + " " + (p.status_text || profileHomeStatusLabel(p.status_kind));
        const location = document.getElementById("profile-location");
        if (location) { location.textContent = p.location ? "⌖ " + p.location : ""; location.hidden = !p.location; }
        const interests = document.getElementById("profile-interests");
        if (interests) interests.innerHTML = p.interests.length ? p.interests.map(item => '<span>' + profileHomeEscape(item) + '</span>').join("") : '<span class="profile-interest-empty">' + (profileHomeIsZh() ? "添加兴趣标签，让主页更像你。" : "Add interests to make this profile yours.") + '</span>';
        renderProfileLinks();
      }
      function profileLinkIcon(title, category) {
        const t=String(title||"").toLowerCase();
        if(t.includes("qq")) return "Q";
        if(t.includes("github")) return "⌘";
        if(t.includes("bilibili")||t.includes("b站")) return "B";
        if(t==="x"||t.includes("twitter")) return "𝕏";
        if(category==="developer") return "</>";
        if(category==="contact") return "@";
        if(category==="site") return "⌂";
        return "↗";
      }
      function renderProfileLinks() {
        const list=document.getElementById("profile-link-list"); if(!list) return;
        const links=[...(profileHomeState.links||[])].sort((a,b)=>Number(b.pinned)-Number(a.pinned)||Number(a.sort_order||0)-Number(b.sort_order||0)||String(a.created_at||"").localeCompare(String(b.created_at||"")));
        if(!links.length){ list.innerHTML='<div class="profile-link-empty"><strong>'+(profileHomeIsZh()?"还没有链接":"No links yet")+'</strong><span>'+(profileHomeIsZh()?"添加 QQ、GitHub、个人网站或其他常用入口。":"Add QQ, GitHub, your website, or any other destination.")+'</span></div>'; return; }
        list.innerHTML=links.map(link => '<article class="profile-link-item">'+
          '<a class="profile-link-main" href="'+profileHomeEscape(link.url)+'" target="_blank" rel="noopener noreferrer"><span class="profile-link-icon">'+profileHomeEscape(profileLinkIcon(link.title,link.category))+'</span><span class="profile-link-copy"><strong>'+profileHomeEscape(link.title)+(link.pinned?' <em>★</em>':'')+'</strong><small>'+profileHomeEscape(link.note || link.url)+'</small></span><span class="profile-link-open">↗</span></a>'+
          '<div class="profile-link-actions"><button type="button" data-profile-link-edit="'+profileHomeEscape(link.id)+'">'+(profileHomeIsZh()?"编辑":"Edit")+'</button><button type="button" data-profile-link-delete="'+profileHomeEscape(link.id)+'">'+(profileHomeIsZh()?"删除":"Delete")+'</button></div>'+
        '</article>').join("");
        list.querySelectorAll("[data-profile-link-edit]").forEach(button=>button.addEventListener("click",()=>openProfileLinkSheet(button.dataset.profileLinkEdit)));
        list.querySelectorAll("[data-profile-link-delete]").forEach(button=>button.addEventListener("click",()=>deleteProfileLink(button.dataset.profileLinkDelete)));
      }
      function openProfileSheet() {
        const sheet=document.getElementById("profile-edit-sheet"), backdrop=document.getElementById("profile-sheet-backdrop"); if(!sheet||!backdrop) return;
        const p=profileHomeState.personalization || normalizeProfilePersonalization(null, profileHomeState.user?.id);
        document.getElementById("profile-readonly-name").value=document.getElementById("profile-display-name")?.textContent || "";
        const avatarPreview=document.getElementById("profile-avatar-preview"); if(avatarPreview) avatarPreview.innerHTML=document.getElementById("profile-avatar")?.innerHTML || "";
        const backgroundPreview=document.getElementById("profile-background-preview"); if(backgroundPreview){ backgroundPreview.dataset.coverStyle=p.cover_style; backgroundPreview.style.backgroundImage=p.background_url?'url("'+p.background_url.replace(/"/g,"%22")+'")':""; backgroundPreview.classList.toggle("has-custom-background",Boolean(p.background_url)); }
        document.getElementById("profile-edit-signature").value=p.signature;
        document.getElementById("profile-edit-bio").value=p.bio;
        document.getElementById("profile-edit-location").value=p.location;
        document.getElementById("profile-edit-status-kind").value=p.status_kind;
        document.getElementById("profile-edit-status-emoji").value=p.status_emoji;
        document.getElementById("profile-edit-status-text").value=p.status_text;
        document.getElementById("profile-edit-interests").value=p.interests.join(", ");
        document.querySelectorAll("[data-cover-choice]").forEach(button=>button.classList.toggle("is-selected",button.dataset.coverChoice===p.cover_style));
        document.documentElement.classList.add("profile-sheet-open"); backdrop.hidden=false; requestAnimationFrame(()=>{backdrop.classList.add("is-visible");sheet.classList.add("is-open");sheet.setAttribute("aria-hidden","false");});
      }
      function closeProfileSheets() {
        document.documentElement.classList.remove("profile-sheet-open"); const backdrop=document.getElementById("profile-sheet-backdrop"); document.querySelectorAll(".profile-sheet.is-open").forEach(sheet=>{sheet.classList.remove("is-open");sheet.setAttribute("aria-hidden","true")}); if(backdrop){backdrop.classList.remove("is-visible");setTimeout(()=>{if(!document.querySelector(".profile-sheet.is-open")) backdrop.hidden=true},220);}
      }
      async function saveProfilePersonalization() {
        if(!profileHomeState.user) return;
        const button=document.getElementById("profile-save-button"); button.disabled=true; button.textContent=profileHomeIsZh()?"正在保存…":"Saving…";
        const interests=document.getElementById("profile-edit-interests").value.split(/[,，]/).map(x=>x.trim()).filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).slice(0,12);
        const cover=document.querySelector("[data-cover-choice].is-selected")?.dataset.coverChoice || "aurora";
        const payload={ user_id:profileHomeState.user.id, signature:document.getElementById("profile-edit-signature").value.trim(), bio:document.getElementById("profile-edit-bio").value.trim(), location:document.getElementById("profile-edit-location").value.trim(), status_kind:document.getElementById("profile-edit-status-kind").value, status_emoji:document.getElementById("profile-edit-status-emoji").value.trim()||"✨", status_text:document.getElementById("profile-edit-status-text").value.trim(), interests, cover_style:cover, background_url:profileHomeState.personalization?.background_url || "" };
        const {data,error}=await supabaseClient.from("profile_personalization").upsert(payload,{onConflict:"user_id"}).select().single();
        button.disabled=false; button.textContent=profileHomeIsZh()?"保存":"Save";
        if(error){ console.error("Profile personalization save failed",error.message); alert(profileHomeIsZh()?"保存失败，请稍后重试。":"Could not save your profile. Please try again."); return; }
        profileHomeState.personalization=normalizeProfilePersonalization(data,profileHomeState.user.id); writeProfileHomeCache(); renderProfileHome(); closeProfileSheets();
      }
      function openProfileLinkSheet(id) {
        const sheet=document.getElementById("profile-link-sheet"), backdrop=document.getElementById("profile-sheet-backdrop"); if(!sheet||!backdrop) return;
        const link=(profileHomeState.links||[]).find(item=>item.id===id)||null; profileHomeState.editingLinkId=link?.id||null;
        document.getElementById("profile-link-sheet-title").textContent=link?(profileHomeIsZh()?"编辑链接":"Edit link"):(profileHomeIsZh()?"添加链接":"Add link");
        document.getElementById("profile-link-id").value=link?.id||"";
        document.getElementById("profile-link-title").value=link?.title||"";
        document.getElementById("profile-link-url").value=link?.url||"";
        document.getElementById("profile-link-category").value=link?.category||"social";
        document.getElementById("profile-link-note").value=link?.note||"";
        document.getElementById("profile-link-pinned").checked=Boolean(link?.pinned);
        document.documentElement.classList.add("profile-sheet-open"); backdrop.hidden=false; requestAnimationFrame(()=>{backdrop.classList.add("is-visible");sheet.classList.add("is-open");sheet.setAttribute("aria-hidden","false");document.getElementById("profile-link-title").focus();});
      }
      async function saveProfileLink() {
        if(!profileHomeState.user) return;
        const button=document.getElementById("profile-link-save"), title=document.getElementById("profile-link-title").value.trim(), url=document.getElementById("profile-link-url").value.trim();
        if(!title || !/^https?:\\/\\//i.test(url)){ alert(profileHomeIsZh()?"请填写名称，并输入以 http:// 或 https:// 开头的有效链接。":"Enter a title and a valid URL beginning with http:// or https://."); return; }
        button.disabled=true;
        const payload={ user_id:profileHomeState.user.id,title,url,category:document.getElementById("profile-link-category").value,note:document.getElementById("profile-link-note").value.trim(),pinned:document.getElementById("profile-link-pinned").checked,sort_order:profileHomeState.editingLinkId?((profileHomeState.links.find(x=>x.id===profileHomeState.editingLinkId)?.sort_order)||0):(profileHomeState.links.length*10)};
        let result;
        if(profileHomeState.editingLinkId) result=await supabaseClient.from("profile_links").update(payload).eq("id",profileHomeState.editingLinkId).select().single();
        else result=await supabaseClient.from("profile_links").insert(payload).select().single();
        button.disabled=false;
        if(result.error){console.error("Profile link save failed",result.error.message);alert(profileHomeIsZh()?"链接保存失败。":"Could not save the link.");return;}
        if(profileHomeState.editingLinkId) profileHomeState.links=profileHomeState.links.map(x=>x.id===profileHomeState.editingLinkId?result.data:x); else profileHomeState.links.push(result.data);
        writeProfileHomeCache(); renderProfileLinks(); closeProfileSheets();
      }
      async function deleteProfileLink(id) {
        const link=(profileHomeState.links||[]).find(item=>item.id===id); if(!link) return;
        if(!confirm((profileHomeIsZh()?"删除“":"Delete “")+link.title+"”"+(profileHomeIsZh()?"？":"?"))) return;
        const {error}=await supabaseClient.from("profile_links").delete().eq("id",id);
        if(error){alert(profileHomeIsZh()?"删除失败。":"Could not delete the link.");return;}
        profileHomeState.links=profileHomeState.links.filter(item=>item.id!==id); writeProfileHomeCache(); renderProfileLinks();
      }
      function profileMediaExtension(file) {
        const map={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
        return map[file?.type] || "";
      }
      async function uploadProfileMedia(file, kind) {
        if(!profileHomeState.user || !file) return null;
        const max=kind==="avatar"?5*1024*1024:8*1024*1024;
        const ext=profileMediaExtension(file);
        if(!ext || file.size>max){ alert(profileHomeIsZh()?(kind==="avatar"?"头像需为 JPG、PNG 或 WebP，且不超过 5 MB。":"背景需为 JPG、PNG 或 WebP，且不超过 8 MB。"):(kind==="avatar"?"Profile photo must be JPG, PNG, or WebP and no larger than 5 MB.":"Background must be JPG, PNG, or WebP and no larger than 8 MB.")); return null; }
        const bucket=kind==="avatar"?"avatars":"profile-media";
        const objectPath=profileHomeState.user.id+"/"+kind+"."+ext;
        const {error}=await supabaseClient.storage.from(bucket).upload(objectPath,file,{upsert:true,contentType:file.type,cacheControl:"3600"});
        if(error){console.error("Profile media upload failed",error.message);alert(profileHomeIsZh()?"图片上传失败，请稍后重试。":"Image upload failed. Please try again.");return null;}
        const {data}=supabaseClient.storage.from(bucket).getPublicUrl(objectPath);
        return data?.publicUrl ? data.publicUrl+"?v="+Date.now() : null;
      }
      async function changeProfileAvatar(file) {
        const url=await uploadProfileMedia(file,"avatar"); if(!url) return;
        const {error}=await supabaseClient.from("profiles").update({avatar_url:url,updated_at:new Date().toISOString()}).eq("id",profileHomeState.user.id);
        if(error){console.error("Avatar profile update failed",error.message);alert(profileHomeIsZh()?"头像已上传，但账号资料更新失败。":"The photo uploaded, but your profile could not be updated.");return;}
        const avatar=document.getElementById("profile-avatar"); if(avatar) avatar.innerHTML='<img src="'+profileHomeEscape(url)+'" alt="">';
        const preview=document.getElementById("profile-avatar-preview"); if(preview) preview.innerHTML='<img src="'+profileHomeEscape(url)+'" alt="">';
      }
      async function changeProfileBackground(file) {
        const url=await uploadProfileMedia(file,"background"); if(!url) return;
        profileHomeState.personalization=normalizeProfilePersonalization({...profileHomeState.personalization,background_url:url},profileHomeState.user.id);
        const {data,error}=await supabaseClient.from("profile_personalization").upsert(profileHomeState.personalization,{onConflict:"user_id"}).select().single();
        if(error){console.error("Background save failed",error.message);alert(profileHomeIsZh()?"背景保存失败。":"Could not save the background.");return;}
        profileHomeState.personalization=normalizeProfilePersonalization(data,profileHomeState.user.id);writeProfileHomeCache();renderProfileHome();openProfileSheet();
      }
      async function clearProfileBackground() {
        if(!profileHomeState.user) return;
        profileHomeState.personalization=normalizeProfilePersonalization({...profileHomeState.personalization,background_url:""},profileHomeState.user.id);
        const {data,error}=await supabaseClient.from("profile_personalization").upsert(profileHomeState.personalization,{onConflict:"user_id"}).select().single();
        if(error){alert(profileHomeIsZh()?"无法清除背景。":"Could not clear the background.");return;}
        profileHomeState.personalization=normalizeProfilePersonalization(data,profileHomeState.user.id);writeProfileHomeCache();renderProfileHome();openProfileSheet();
      }
      function bindCurrentPageNoReload() {
        document.querySelectorAll(".os-nav a[href]").forEach(link=>{
          const target=new URL(link.href,location.href);
          if(target.pathname!==location.pathname)return;
          link.setAttribute("aria-current","page");
          link.dataset.currentPage="true";
          link.addEventListener("click",event=>event.preventDefault());
        });
      }
      function bindProfileHome() {
        const modalBackdrop=document.getElementById("profile-sheet-backdrop"); if(modalBackdrop&&modalBackdrop.parentElement!==document.body)document.body.appendChild(modalBackdrop); document.querySelectorAll(".profile-sheet").forEach(sheet=>{if(sheet.parentElement!==document.body)document.body.appendChild(sheet);});
        if(!document.querySelector("[data-profile-home]")) return;
        document.getElementById("profile-edit-button")?.addEventListener("click",openProfileSheet);
        document.getElementById("profile-add-link")?.addEventListener("click",()=>openProfileLinkSheet(null));
        document.querySelectorAll("[data-close-profile-sheet],[data-close-profile-link-sheet]").forEach(button=>button.addEventListener("click",closeProfileSheets));
        document.getElementById("profile-sheet-backdrop")?.addEventListener("click",closeProfileSheets);
        document.getElementById("profile-save-button")?.addEventListener("click",saveProfilePersonalization);
        document.getElementById("profile-link-save")?.addEventListener("click",saveProfileLink);
        document.getElementById("profile-avatar-choose")?.addEventListener("click",()=>document.getElementById("profile-avatar-file")?.click());
        document.getElementById("profile-avatar-file")?.addEventListener("change",async event=>{const file=event.target.files?.[0];if(file)await changeProfileAvatar(file);event.target.value="";});
        document.getElementById("profile-background-choose")?.addEventListener("click",()=>document.getElementById("profile-background-file")?.click());
        document.getElementById("profile-background-file")?.addEventListener("change",async event=>{const file=event.target.files?.[0];if(file)await changeProfileBackground(file);event.target.value="";});
        document.getElementById("profile-background-clear")?.addEventListener("click",clearProfileBackground);
        bindCurrentPageNoReload();
        document.getElementById("profile-cover-picker")?.addEventListener("click",event=>{const button=event.target.closest("[data-cover-choice]");if(!button)return;document.querySelectorAll("[data-cover-choice]").forEach(x=>x.classList.toggle("is-selected",x===button));});
        document.querySelectorAll("[data-link-preset]").forEach(button=>button.addEventListener("click",()=>{document.getElementById("profile-link-title").value=button.dataset.linkPreset;}));
        window.addEventListener("keydown",event=>{if(event.key==="Escape")closeProfileSheets();});
      }
      async function hydrateProfileHome(user) {
        if(!document.querySelector("[data-profile-home]") || !user) return;
        profileHomeState.user=user;
        const cached=readProfileHomeCache(user.id);
        if(cached){profileHomeState.personalization=normalizeProfilePersonalization(cached.personalization,user.id);profileHomeState.links=Array.isArray(cached.links)?cached.links:[];renderProfileHome();}
        const [personalizationResult,linksResult]=await Promise.all([
          supabaseClient.from("profile_personalization").select("*").eq("user_id",user.id).maybeSingle(),
          supabaseClient.from("profile_links").select("*").eq("user_id",user.id).order("pinned",{ascending:false}).order("sort_order",{ascending:true}).order("created_at",{ascending:true})
        ]);
        if(personalizationResult.error) console.error("Profile personalization query failed",personalizationResult.error.message);
        if(linksResult.error) console.error("Profile links query failed",linksResult.error.message);
        if(!personalizationResult.error) profileHomeState.personalization=normalizeProfilePersonalization(personalizationResult.data,user.id);
        if(!linksResult.error) profileHomeState.links=linksResult.data||[];
        writeProfileHomeCache(); renderProfileHome();
      }
      async function hydrateProfileAudit(user) {
        if (!document.getElementById("audit-created-at") && !document.getElementById("audit-current-device")) return;

        const cached = readProfileCache(PROFILE_AUDIT_CACHE_KEY);
        const [eventsResult, devicesResult] = await Promise.all([
          supabaseClient.from("login_events").select("*").order("created_at", { ascending: false }).limit(50),
          supabaseClient.from("user_devices").select("*").order("last_seen_at", { ascending: false }).limit(20)
        ]);
        const eventsError = Boolean(eventsResult.error);
        const devicesError = Boolean(devicesResult.error);
        const events = eventsError ? [] : eventsResult.data || [];
        const devices = devicesError ? [] : devicesResult.data || [];

        if (eventsError) console.error("Login event query failed", eventsResult.error.message);
        if (devicesError) console.error("Device query failed", devicesResult.error.message);

        if (eventsError || devicesError) {
          if (!cached) {
            renderAccountAudit(user, events, devices, eventsError, devicesError);
            renderSecurityAudit(events, devices, eventsError, devicesError);
          }
          return;
        }

        const cachedUser = {
          id: user.id,
          email: user.email || "",
          created_at: user.created_at || null,
          last_sign_in_at: getLastSignIn(user)
        };
        const fingerprint = buildAuditFingerprint(cachedUser, events, devices);
        if (cached?.user?.id === user.id && cached.fingerprint === fingerprint) return;

        const snapshot = {
          user: cachedUser,
          events,
          devices,
          fingerprint
        };
        writeProfileCache(PROFILE_AUDIT_CACHE_KEY, snapshot);
        renderAccountAudit(cachedUser, events, devices, false, false);
        renderSecurityAudit(events, devices, false, false);
      }

      restoreProfileUiCaches();
      bindProfileHome();

      function renderAccountAudit(user, events, devices, eventsError, devicesError) {
        const set = (id, value) => { const el = document.getElementById(id); if (el) el.innerText = value || "-"; };
        set("audit-created-at", formatAuditDate(user.created_at));
        set("audit-user-id", user.id);
        set("audit-email", user.email);
        set("audit-last-sign-in", formatAuditDate(getLastSignIn(user)));
        set("audit-login-count", eventsError ? "—" : String(events.length));
        set("audit-device-count", devicesError ? "—" : String(devices.length));
        set("audit-risk-count", eventsError ? "—" : String(events.filter(event => event.risk_level && event.risk_level !== "正常").length));

        const table = document.getElementById("audit-login-table");
        if (table) {
          table.innerHTML = eventsError
            ? '<div class="audit-row"><span>无法读取登录记录 / Unable to load login records</span></div>'
            : renderAuditRows(events);
        }
      }

      function renderAuditRows(events) {
        const head = ["登录时间", "IP 地址", "地区", "浏览器", "操作系统", "设备类型", "登录方式", "登录结果", "风险提示"];
        const header = '<div class="audit-row audit-head">' + head.map(item => '<strong>' + item + '</strong>').join("") + '</div>';
        if (!events.length) return header + '<div class="audit-row"><span>暂无登录记录</span></div>';
        return header + events.map(event => '<div class="audit-row">' + [
          formatAuditDate(event.created_at),
          event.ip_address || "-",
          [event.country, event.region, event.city].filter(Boolean).join(" / ") || "-",
          event.browser || "-",
          event.os || "-",
          event.device_type || "-",
          event.provider || "password",
          event.success ? "成功" : "失败",
          event.risk_level || "正常"
        ].map(item => '<span>' + auditEscape(item) + '</span>').join("") + '</div>').join("");
      }

      function renderSecurityAudit(events, devices, eventsError, devicesError) {
        const currentId = getAuditDeviceId();
        const current = devices.find(device => device.device_id === currentId) || null;
        const currentBox = document.getElementById("audit-current-device");
        if (currentBox) currentBox.innerHTML = devicesError
          ? "无法读取设备数据 / Unable to load device data"
          : current ? renderDeviceCard(current, true) : "暂无当前设备数据";

        const list = document.getElementById("audit-device-list");
        if (list) list.innerHTML = devicesError
          ? "无法读取设备数据 / Unable to load device data"
          : devices.length ? devices.map(device => renderDeviceCard(device, device.device_id === currentId)).join("") : "暂无登录设备";

        const timeline = document.getElementById("audit-login-timeline");
        if (timeline) timeline.innerHTML = eventsError
          ? "无法读取登录历史 / Unable to load login history"
          : renderTimeline(events);

        const alerts = document.getElementById("audit-risk-alerts");
        if (alerts) {
          if (eventsError) {
            alerts.innerHTML = "<p>无法读取风险数据 / Unable to load risk data</p>";
          } else {
            const risks = events.filter(event => event.risk_level && event.risk_level !== "正常");
            alerts.innerHTML = risks.length ? risks.map(event => '<p>' + auditEscape(formatAuditDate(event.created_at)) + " · " + auditEscape(event.risk_level) + " · " + auditEscape(event.ip_address || "-") + '</p>').join("") : "<p>暂无异常登录提示</p>";
          }
        }
      }

      function renderDeviceCard(device, current) {
        const status = device.revoked_at ? "已退出" : "活跃";
        const name = device.device_name || ((device.browser || "Browser") + " on " + (device.os || "OS"));
        return '<article class="audit-device-card">' +
          '<strong>' + auditEscape(name + (current ? " · 当前设备" : "")) + '</strong>' +
          '<span>' + auditEscape([device.browser, device.os, device.device_type].filter(Boolean).join(" / ")) + '</span>' +
          '<span>' + auditEscape([device.last_ip, device.country, device.region, device.city].filter(Boolean).join(" · ")) + '</span>' +
          '<span>首次登录 ' + auditEscape(formatAuditDate(device.first_seen_at)) + ' · 最近活跃 ' + auditEscape(formatAuditDate(device.last_seen_at)) + '</span>' +
          '<em>' + auditEscape(status) + '</em>' +
        '</article>';
      }

      function renderTimeline(events) {
        const groups = { "今天": [], "昨天": [], "本周": [], "更早": [] };
        const now = new Date();
        events.forEach(event => {
          const date = new Date(event.created_at);
          const diffDays = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(date.getFullYear(), date.getMonth(), date.getDate())) / 86400000);
          const key = diffDays === 0 ? "今天" : diffDays === 1 ? "昨天" : diffDays < 7 ? "本周" : "更早";
          groups[key].push(event);
        });
        return Object.entries(groups).filter(([, items]) => items.length).map(([label, items]) =>
          '<section><h3>' + auditEscape(label) + '</h3>' + items.map(event =>
            '<p>' + [
              formatAuditDate(event.created_at),
              [event.city, event.region, event.country].filter(Boolean).join(" / ") || "-",
              event.ip_address || "-",
              (event.browser || "-") + " on " + (event.os || "-"),
              event.provider || "password",
              event.success ? "成功" : "失败",
              event.risk_level || "正常"
            ].map(auditEscape).join(" · ") + '</p>'
          ).join("") + '</section>'
        ).join("") || "<p>暂无登录历史</p>";
      }
    </script>
  `;
}

function adminClientScript(ipInfo) {
  return `
    <script>
      const adminRequestContext = ${JSON.stringify({
        ip_address: ipInfo?.ip || "",
        user_agent: ""
      })};


      const adminState = {
        currentUser: null,
        users: [],
        overview: null,
        roles: null,
        logs: [],
        pendingPermissions: null,
        permissionDirty: false
      };

      const ADMIN_OVERVIEW_CACHE_KEY = "qssed-admin-overview-v1";
      const ADMIN_USERS_CACHE_KEY = "qssed-admin-users-v1";
      const ADMIN_ROLES_CACHE_KEY = "qssed-admin-roles-v1";
      const ADMIN_LOGS_CACHE_KEY = "qssed-admin-logs-v1";
      const ADMIN_ACCESS_CACHE_KEY = "qssed-admin-access-v1";
      const ADMIN_VIEW_CACHE_PREFIX = "qssed-admin-view-v1:";

      function readAdminCache(key) {
        try {
          const raw = sessionStorage.getItem(key);
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      }

      function writeAdminCache(key, value) {
        try {
          sessionStorage.setItem(key, JSON.stringify(value));
        } catch {}
      }

      function clearAdminUiCaches() {
        try {
          sessionStorage.removeItem(ADMIN_OVERVIEW_CACHE_KEY);
          sessionStorage.removeItem(ADMIN_USERS_CACHE_KEY);
          sessionStorage.removeItem(ADMIN_ROLES_CACHE_KEY);
          sessionStorage.removeItem(ADMIN_LOGS_CACHE_KEY);
          sessionStorage.removeItem(ADMIN_ACCESS_CACHE_KEY);
          Object.keys(sessionStorage)
            .filter(key => key.startsWith(ADMIN_VIEW_CACHE_PREFIX))
            .forEach(key => sessionStorage.removeItem(key));
        } catch {}
      }

      function cacheAdminViewHtml() {
        try {
          const content = document.getElementById("os-content");
          if (!content) return;
          sessionStorage.setItem(ADMIN_VIEW_CACHE_PREFIX + location.pathname, content.innerHTML);
        } catch {}
      }

      function adminOverviewFingerprint(data) {
        const normalizeUsers = (data?.recent_users || []).map(user => [
          user.user_id || user.id || "",
          user.username || "",
          user.display_name || "",
          user.email || "",
          user.role || "",
          user.status || "",
          user.last_sign_in_at || ""
        ]).sort((a, b) => String(a[0]).localeCompare(String(b[0])));

        const normalizeLogs = items => (items || []).map(log => [
          log.id || "",
          log.action || "",
          log.severity || "",
          log.created_at || "",
          log.actor_email || "",
          log.target_id || "",
          log.target_label || ""
        ]).sort((a, b) => String(a[0]).localeCompare(String(b[0])));

        return JSON.stringify({
          user_count: Number(data?.user_count) || 0,
          admin_count: Number(data?.admin_count) || 0,
          recent_users: normalizeUsers,
          recent_logs: normalizeLogs(data?.recent_logs),
          risks: normalizeLogs(data?.risks)
        });
      }

      function adminUsersFingerprint(users) {
        return JSON.stringify((users || []).map(user => [
          user.user_id || "",
          user.username || "",
          user.display_name || "",
          user.email || "",
          user.role || "",
          user.status || "",
          user.created_at || "",
          user.last_sign_in_at || "",
          (user.recent_logins || []).map(login => [
            login.id || "",
            login.created_at || "",
            Boolean(login.success),
            login.risk_level || ""
          ]),
          (user.recent_actions || []).map(log => [
            log.id || "",
            log.created_at || "",
            log.action || "",
            log.severity || ""
          ])
        ]).sort((a, b) => String(a[0]).localeCompare(String(b[0]))));
      }

      function cacheAdminUsers() {
        writeAdminCache(ADMIN_USERS_CACHE_KEY, {
          user_id: adminState.currentUser?.id || "",
          fingerprint: adminUsersFingerprint(adminState.users),
          users: adminState.users
        });
      }

      function adminRolesFingerprint(data) {
        const normalized = normalizeRolePermissions(data || {});
        return JSON.stringify({
          roles: normalized.roles.map(role => [role.name || "", role.description || ""]).sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
          permissions: normalized.permissions.map(permission => [permission.key || "", permission.category || "", permission.description || ""]).sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
          role_permissions: normalized.role_permissions.map(item => [item.role || "", item.permission || ""]).sort((a, b) => (String(a[0]) + ":" + String(a[1])).localeCompare(String(b[0]) + ":" + String(b[1]))),
          user_counts: Object.entries(normalized.user_counts || {}).sort(([a], [b]) => a.localeCompare(b))
        });
      }

      function cacheAdminRoles() {
        if (!adminState.roles) return;
        writeAdminCache(ADMIN_ROLES_CACHE_KEY, {
          user_id: adminState.currentUser?.id || "",
          fingerprint: adminRolesFingerprint(adminState.roles),
          data: adminState.roles
        });
      }

      function adminLogsFingerprint(logs) {
        return JSON.stringify((logs || []).map(log => [
          log.id || "",
          log.action || "",
          log.severity || "",
          log.created_at || "",
          log.actor_user_id || "",
          log.actor_email || "",
          log.target_type || "",
          log.target_id || "",
          log.target_label || "",
          log.description || ""
        ]).sort((a, b) => String(a[0]).localeCompare(String(b[0]))));
      }

      function cacheAdminLogs(logs) {
        writeAdminCache(ADMIN_LOGS_CACHE_KEY, {
          user_id: adminState.currentUser?.id || "",
          fingerprint: adminLogsFingerprint(logs),
          logs
        });
      }

      function adminIsZh() {
        return location.pathname.startsWith("/zh-cn");
      }

      function adminText(zh, cn, en) {
        return zh ? cn : en;
      }

      // i18n marker: keep database/API canonical keys in English; localize labels only at render time.
      function adminRoleLabel(role) {
        const labels = adminIsZh()
          ? { admin: "管理员", editor: "编辑者", user: "普通成员" }
          : { admin: "Administrator", editor: "Editor", user: "Member" };
        return labels[role] || role || "-";
      }

      // i18n marker: status values remain active/suspended/banned for RPC filters and updates.
      function adminStatusLabel(status) {
        if (!adminIsZh()) return status || "-";
        return ({ active: "正常", suspended: "已停用", banned: "已封禁" })[status] || status || "-";
      }

      // i18n marker: severity values remain info/warning/danger for audit filtering.
      function adminSeverityLabel(severity) {
        if (!adminIsZh()) return severity || "-";
        return ({ info: "信息", warning: "警告", danger: "危险" })[severity] || severity || "-";
      }

      // i18n marker: audit action keys are stored as machine-readable English action names.
      function adminActionLabel(action) {
        if (!adminIsZh()) return action || "-";
        return ({
          "login": "登录",
          "auth.login.failed": "登录失败",
          "user.role.update": "修改用户角色",
          "user.ban": "封禁用户",
          "user.unban": "解除封禁",
          "user.suspend": "停用用户",
          "role.permissions.update": "修改角色权限"
        })[action] || action || "-";
      }

      // i18n marker: audit descriptions may come from database functions in English; render a Chinese hint without mutating stored logs.
      function adminLogDescription(log) {
        const text = log?.description || log?.target_label || "-";
        if (!adminIsZh()) return text;
        if (log?.action === "auth.login.failed") return "密码登录失败。";
        if (log?.action === "user.role.update") return "用户角色已更新。";
        if (log?.action === "user.ban") return "用户已被封禁。";
        if (log?.action === "user.unban") return "用户已解除封禁。";
        if (log?.action === "user.suspend") return "用户已停用。";
        if (log?.action === "role.permissions.update") return "角色权限矩阵已更新。";
        return text;
      }

      // i18n marker: permission keys stay stable for RBAC; Chinese copy is display-only.
      function adminPermissionLabel(key) {
        if (!adminIsZh()) return key || "-";
        return ({
          "users.read": "查看用户", "users.update": "更新用户", "users.ban": "封禁用户",
          "roles.read": "查看角色", "roles.update": "更新角色",
          "logs.read": "查看日志", "system.read": "查看系统",
          "notes.read": "查看笔记", "notes.create": "创建笔记", "notes.update": "更新笔记", "notes.delete": "删除笔记",
          "links.read": "查看链接", "links.create": "创建链接", "links.update": "更新链接", "links.delete": "删除链接",
          "projects.read": "查看项目", "projects.create": "创建项目", "projects.update": "更新项目", "projects.delete": "删除项目"
        })[key] || key || "-";
      }

      function adminPermissionDescription(permission) {
        if (!adminIsZh()) return permission.description || permission.key || "";
        return adminPermissionLabel(permission.key) + "权限";
      }

      function adminCategoryLabel(category) {
        if (!adminIsZh()) return category || "general";
        return ({ users: "用户", roles: "角色", logs: "日志", system: "系统", notes: "笔记", links: "链接", projects: "项目", general: "通用" })[category] || category || "通用";
      }

      function adminFieldLabel(key) {
        if (!adminIsZh()) return key;
        return ({
          id: "日志 ID",
          actor_user_id: "操作者 ID",
          actor_email: "操作者邮箱",
          action: "动作",
          target_type: "对象类型",
          target_id: "对象 ID",
          target_label: "对象名称",
          description: "描述",
          ip_address: "IP 地址",
          user_agent: "浏览器标识",
          severity: "级别",
          created_at: "创建时间"
        })[key] || key;
      }

      function adminRoleDescription(role) {
        const descriptions = adminIsZh()
          ? {
              admin: "拥有完整管理权限，可管理成员、角色权限与审计记录。仅应授予承担管理职责的账号。",
              editor: "适用于需要扩展工作区操作能力的成员，不包含用户管理、角色权限调整等管理员能力。",
              user: "普通成员，用于日常个人使用。可以访问获准的个人功能，但不能管理其他成员、修改角色权限或访问仅限管理员的审计信息。"
            }
          : {
              admin: "Full administrative access for member management, role permissions, and audit records. Grant this role only to accounts with administrative responsibilities.",
              editor: "For members who need broader workspace capabilities without user management or role-permission administration.",
              user: "Standard member for everyday personal use. Can use permitted personal features but cannot manage other members, change role permissions, or access administrator-only audit information."
            };
        return descriptions[role.name] || role.description || "-";
      }

      function adminEscape(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
      }

      function adminFormatDate(value) {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const hh = String(date.getHours()).padStart(2, "0");
        const min = String(date.getMinutes()).padStart(2, "0");
        return yyyy + "-" + mm + "-" + dd + " " + hh + ":" + min;
      }

      function adminSkeleton(target, rows) {
        if (!target) return;
        target.innerHTML = Array.from({ length: rows || 4 }).map(() => '<div class="skeleton-line"></div>').join("");
      }

      function adminEmpty(message, actionLabel, action) {
        return '<article class="admin-empty-state"><div class="admin-empty-orb">Q</div><strong>' + adminEscape(message) + '</strong>' + (actionLabel ? '<button class="admin-ghost" data-empty-action="' + adminEscape(action || "") + '">' + adminEscape(actionLabel) + '</button>' : "") + '</article>';
      }

      function adminToast(message, type) {
        let host = document.getElementById("admin-toast-host");
        if (!host) {
          host = document.createElement("div");
          host.id = "admin-toast-host";
          document.body.appendChild(host);
        }
        const toast = document.createElement("div");
        toast.className = "admin-toast " + (type || "info");
        toast.innerHTML = '<strong>' + (type === "danger" ? "!" : type === "warning" ? "?" : "✓") + '</strong><span>' + adminEscape(message) + '</span>';
        host.appendChild(toast);
        window.setTimeout(() => toast.classList.add("is-hiding"), 2800);
        window.setTimeout(() => toast.remove(), 3300);
      }

      function adminConfirm(options) {
        return new Promise(resolve => {
          const overlay = document.createElement("div");
          overlay.className = "admin-confirm-backdrop";
          const needsInput = Boolean(options.confirmText);
          overlay.innerHTML =
            '<div class="admin-confirm ' + (options.danger ? "is-danger" : "") + '">' +
              '<h3>' + adminEscape(options.title) + '</h3>' +
              '<p>' + adminEscape(options.message) + '</p>' +
              (needsInput ? '<input id="admin-confirm-input" placeholder="' + adminEscape(options.confirmText) + '">' : '') +
              '<div class="admin-confirm-actions">' +
                '<button class="admin-ghost" data-confirm-cancel>' + adminEscape(adminText(adminIsZh(), "取消", "Cancel")) + '</button>' +
                '<button class="' + (options.danger ? "admin-danger" : "admin-primary") + '" data-confirm-ok>' + adminEscape(options.confirmLabel || adminText(adminIsZh(), "确认", "Confirm")) + '</button>' +
              '</div>' +
            '</div>';
          document.body.appendChild(overlay);
          requestAnimationFrame(() => overlay.classList.add("is-open"));
          const close = value => {
            overlay.classList.remove("is-open");
            window.setTimeout(() => overlay.remove(), 180);
            resolve(value);
          };
          overlay.querySelector("[data-confirm-cancel]").addEventListener("click", () => close(false));
          overlay.addEventListener("click", event => { if (event.target === overlay) close(false); });
          overlay.querySelector("[data-confirm-ok]").addEventListener("click", () => {
            const input = overlay.querySelector("#admin-confirm-input");
            if (input && input.value.trim() !== options.confirmText) {
              overlay.querySelector(".admin-confirm").classList.remove("shake-once");
              void overlay.querySelector(".admin-confirm").offsetWidth;
              overlay.querySelector(".admin-confirm").classList.add("shake-once");
              input.classList.add("is-error");
              return;
            }
            close(true);
          });
        });
      }

      function animateNumber(el, value) {
        if (!el) return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) {
          el.innerText = String(value);
          return;
        }
        const target = Number(value) || 0;
        const start = performance.now();
        const duration = 520;
        function tick(now) {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.innerText = String(Math.round(target * eased));
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }

      async function adminRpc(name, params) {
        const { data, error } = await supabaseClient.rpc(name, params || {});
        if (error) {
          console.error("Admin RPC failed", name, error.message);
          return { data: null, error };
        }
        return { data, error: null };
      }

      function adminLoadError(message) {
        return adminEmpty(message || adminText(adminIsZh(), "无法读取管理数据，请稍后重试。", "Unable to load management data. Please try again later."));
      }

      async function hydrateAdminModule(user) {
        adminState.currentUser = user;
        adminRequestContext.user_agent = navigator.userAgent || "";
        const path = location.pathname.replace(/^\\/(zh-cn|en)/, "") || "/dashboard";
        if (path === "/admin/general") await loadAdminOverview();
        if (path === "/admin/users") await loadAdminUsers();
        if (path === "/admin/roles") await loadAdminRoles();
        if (path === "/admin/logs") await loadAdminLogs();
        bindAdminNavigation();
      }

      function bindAdminNavigation() {
        document.querySelectorAll("[data-admin-nav]").forEach(button => {
          button.addEventListener("click", () => {
            const prefix = adminIsZh() ? "/zh-cn" : "/en";
            location.href = prefix + button.dataset.adminNav;
          });
        });
      }

      async function loadAdminOverview() {
        const stored = readAdminCache(ADMIN_OVERVIEW_CACHE_KEY);
        const cached = stored?.user_id === adminState.currentUser?.id ? stored : null;

        if (cached?.data) {
          adminState.overview = cached.data;
          renderAdminOverview(cached.data);
          void refreshAdminOverview(cached);
          return;
        }

        ["admin-recent-users", "admin-recent-logs", "admin-risk-list"].forEach(id => adminSkeleton(document.getElementById(id), 4));
        await refreshAdminOverview(null);
      }

      async function refreshAdminOverview(cached) {
        const result = await adminRpc("get_admin_overview", {});
        if (result.error) {
          if (cached?.data) {
            console.warn("Admin overview refresh failed; keeping cached data.");
            return;
          }
          document.querySelectorAll("[data-admin-metric]").forEach(el => {
            el.closest("article")?.classList.remove("admin-skeleton");
            el.innerText = "—";
          });
          ["admin-recent-users", "admin-recent-logs", "admin-risk-list"].forEach(id => {
            const target = document.getElementById(id);
            if (!target) return;
            target.classList.remove("admin-list-skeleton");
            target.innerHTML = adminLoadError();
          });
          adminToast(adminText(adminIsZh(), "管理数据读取失败。", "Admin data failed to load."), "danger");
          return;
        }

        const fresh = result.data || {};
        const fingerprint = adminOverviewFingerprint(fresh);
        adminState.overview = fresh;

        if (cached?.fingerprint === fingerprint) return;

        writeAdminCache(ADMIN_OVERVIEW_CACHE_KEY, {
          user_id: adminState.currentUser?.id || "",
          fingerprint,
          data: fresh
        });
        renderAdminOverview(fresh);
      }

      function renderAdminOverview(data) {
        const values = [data.user_count, data.admin_count];
        document.querySelectorAll("[data-admin-metric]").forEach((el, index) => {
          el.closest("article")?.classList.remove("admin-skeleton");
          el.innerText = String(Number(values[index]) || 0);
        });
        const users = document.getElementById("admin-recent-users");
        if (users) {
          users.classList.remove("admin-list-skeleton");
          users.innerHTML = (data.recent_users || []).length ? data.recent_users.map(user =>
            '<article class="admin-mini-row"><span class="admin-avatar">' + adminEscape((user.display_name || user.email || "?").slice(0, 1).toUpperCase()) + '</span><div><strong>' + adminEscape(user.display_name || user.username || user.email || user.id) + '</strong><small>' + adminEscape(user.email || adminRoleLabel(user.role)) + '</small></div><em class="admin-badge ' + adminEscape(user.status || "active") + '">' + adminEscape(adminStatusLabel(user.status || "active")) + '</em></article>'
          ).join("") : adminEmpty(adminText(adminIsZh(), "暂无最近用户", "No recent users"));
        }
        const logs = document.getElementById("admin-recent-logs");
        if (logs) {
          logs.classList.remove("admin-list-skeleton");
          logs.innerHTML = renderAdminLogRows(data.recent_logs || [], true);
        }
        const risks = document.getElementById("admin-risk-list");
        if (risks) {
          risks.classList.remove("admin-list-skeleton");
          const riskItems = data.risks || [];
          risks.innerHTML = riskItems.length ? riskItems.map(log =>
            '<article class="admin-risk ' + adminEscape(log.severity) + '"><strong>' + adminEscape(adminActionLabel(log.action)) + '</strong><p>' + adminEscape(adminLogDescription(log)) + '</p><small>' + adminFormatDate(log.created_at) + '</small></article>'
          ).join("") : adminEmpty(adminText(adminIsZh(), "暂无风险事件", "No risk events"), adminText(adminIsZh(), "查看日志", "Open logs"), "/admin/logs");
          if (riskItems.some(log => log.severity === "danger")) risks.closest(".danger-event-card")?.classList.add("pulse-once");
        }
        cacheAdminViewHtml();
      }

      async function loadAdminUsers() {
        const table = document.getElementById("admin-users-table");
        const stored = readAdminCache(ADMIN_USERS_CACHE_KEY);
        const cached = stored?.user_id === adminState.currentUser?.id ? stored : null;

        bindAdminUserFilters();

        if (cached?.users) {
          adminState.users = cached.users;
          renderAdminUsers();
          void refreshAdminUsers(cached);
          return;
        }

        adminSkeleton(table, 6);
        await refreshAdminUsers(null);
      }

      async function refreshAdminUsers(cached) {
        const table = document.getElementById("admin-users-table");
        const result = await adminRpc("get_admin_users", {});
        if (result.error) {
          if (cached?.users) {
            console.warn("Admin users refresh failed; keeping cached data.");
            return;
          }
          adminState.users = [];
          table?.classList.remove("admin-list-skeleton");
          if (table) table.innerHTML = adminLoadError();
          const count = document.getElementById("admin-users-count");
          if (count) count.innerText = "—";
          adminToast(adminText(adminIsZh(), "用户列表读取失败。", "User list failed to load."), "danger");
          return;
        }

        const fresh = result.data || [];
        const fingerprint = adminUsersFingerprint(fresh);
        adminState.users = fresh;

        if (cached?.fingerprint === fingerprint) return;

        cacheAdminUsers();
        renderAdminUsers();
      }

      function bindAdminUserFilters() {
        ["admin-user-search", "admin-role-filter", "admin-status-filter"].forEach(id => {
          const el = document.getElementById(id);
          if (el && !el.dataset.bound) {
            el.dataset.bound = "true";
            el.addEventListener("input", renderAdminUsers);
            el.addEventListener("change", renderAdminUsers);
          }
        });
      }

      function filteredAdminUsers() {
        const q = (document.getElementById("admin-user-search")?.value || "").toLowerCase();
        const role = document.getElementById("admin-role-filter")?.value || "";
        const status = document.getElementById("admin-status-filter")?.value || "";
        return adminState.users.filter(user => {
          const haystack = [user.user_id, user.username, user.display_name, user.email, user.role, user.status].join(" ").toLowerCase();
          return (!q || haystack.includes(q)) && (!role || user.role === role) && (!status || user.status === status);
        });
      }

      function renderAdminUsers() {
        const zh = adminIsZh();
        const table = document.getElementById("admin-users-table");
        if (!table) return;
        const users = filteredAdminUsers();
        document.getElementById("admin-users-count").innerText = String(users.length);
        table.classList.remove("admin-list-skeleton");
        if (!users.length) {
          table.innerHTML = adminEmpty(adminText(zh, "暂无匹配用户", "No matching users"));
          return;
        }
        const head = ["ID", adminText(zh, "用户名", "Username"), adminText(zh, "邮箱", "Email"), adminText(zh, "头像", "Avatar"), adminText(zh, "角色", "Role"), adminText(zh, "状态", "Status"), adminText(zh, "创建时间", "Created"), adminText(zh, "最近登录", "Last login"), adminText(zh, "最近活跃", "Last active"), adminText(zh, "操作", "Actions")];
        table.innerHTML = '<div class="admin-table-row admin-table-head">' + head.map(item => '<strong>' + adminEscape(item) + '</strong>').join("") + '</div>' +
          users.map((user, index) => renderAdminUserRow(user, index)).join("");
        table.querySelectorAll("[data-user-detail]").forEach(button => button.addEventListener("click", () => showAdminUserDetail(button.dataset.userDetail)));
        table.querySelectorAll("[data-user-role]").forEach(select => select.addEventListener("change", () => changeAdminUserRole(select.dataset.userRole, select.value)));
        table.querySelectorAll("[data-user-status]").forEach(select => select.addEventListener("change", () => changeAdminUserStatus(select.dataset.userStatus, select.value)));
        cacheAdminViewHtml();
      }

      function renderAdminUserRow(user, index) {
        const isSelf = user.user_id === adminState.currentUser?.id;
        return '<div class="admin-table-row animated-row" data-user-row="' + adminEscape(user.user_id) + '" style="--stagger:' + Math.min(index, 12) + '">' +
          '<span class="mono">' + adminEscape(String(user.user_id || "-").slice(0, 8)) + '</span>' +
          '<span>' + adminEscape(user.display_name || user.username || "-") + '</span>' +
          '<span>' + adminEscape(user.email || "-") + '</span>' +
          '<span><span class="admin-avatar">' + adminEscape((user.display_name || user.email || "?").slice(0, 1).toUpperCase()) + '</span></span>' +
          '<span><select data-user-role="' + adminEscape(user.user_id) + '"' + (isSelf ? ' data-self="true"' : '') + '>' + ["admin","editor","user"].map(role => '<option value="' + role + '"' + (user.role === role ? " selected" : "") + '>' + adminEscape(adminRoleLabel(role)) + '</option>').join("") + '</select></span>' +
          '<span><select data-user-status="' + adminEscape(user.user_id) + '"' + (isSelf ? " disabled" : "") + '>' + ["active","suspended","banned"].map(status => '<option value="' + status + '"' + (user.status === status ? " selected" : "") + '>' + adminEscape(adminStatusLabel(status)) + '</option>').join("") + '</select></span>' +
          '<span>' + adminFormatDate(user.created_at) + '</span>' +
          '<span>' + adminFormatDate(user.last_sign_in_at) + '</span>' +
          '<span>' + adminFormatDate(user.last_seen_at) + '</span>' +
          '<span><button class="admin-ghost" data-user-detail="' + adminEscape(user.user_id) + '">' + adminEscape(adminText(adminIsZh(), "详情", "Detail")) + '</button></span>' +
        '</div>';
      }

      function getAdminUser(userId) {
        return adminState.users.find(user => user.user_id === userId);
      }

      function showAdminUserDetail(userId) {
        const user = getAdminUser(userId);
        const body = document.getElementById("admin-user-detail-body");
        if (!user || !body) return;
        const logins = user.recent_logins || [];
        const actions = user.recent_actions || [];
        body.innerHTML =
          '<div class="admin-detail-grid">' +
            '<div><strong>' + adminEscape(user.display_name || user.username || user.email) + '</strong><p>' + adminEscape(user.user_id) + '</p><p>' + adminEscape(adminRoleLabel(user.role)) + ' · ' + adminEscape(adminStatusLabel(user.status)) + '</p></div>' +
            '<div><h3>' + adminEscape(adminText(adminIsZh(), "最近登录", "Recent logins")) + '</h3>' + (logins.length ? logins.map(login => '<p>' + adminFormatDate(login.created_at) + ' · ' + adminEscape(login.ip_address || "-") + ' · ' + adminEscape(login.browser || "-") + '</p>').join("") : '<p>-</p>') + '</div>' +
            '<div><h3>' + adminEscape(adminText(adminIsZh(), "最近操作", "Recent actions")) + '</h3>' + (actions.length ? actions.map(log => '<p>' + adminFormatDate(log.created_at) + ' · ' + adminEscape(adminActionLabel(log.action)) + '</p>').join("") : '<p>-</p>') + '</div>' +
          '</div>';
        cacheAdminViewHtml();
      }

      async function changeAdminUserRole(userId, role) {
        const user = getAdminUser(userId);
        if (!user) return;
        if (user.user_id === adminState.currentUser?.id && role !== "admin") {
          adminToast(adminText(adminIsZh(), "不能移除自己的 admin 权限。", "You cannot remove your own admin role."), "danger");
          renderAdminUsers();
          return;
        }
        const ok = await adminConfirm({
          title: adminText(adminIsZh(), "确认修改角色", "Confirm role change"),
          message: (user.email || user.user_id) + " → " + adminRoleLabel(role),
          confirmLabel: adminText(adminIsZh(), "修改角色", "Update role"),
          danger: role === "admin" || user.role === "admin"
        });
        if (!ok) {
          renderAdminUsers();
          return;
        }
        const result = await adminRpc("update_user_role", { p_user_id: userId, p_role: role, p_ip_address: adminRequestContext.ip_address, p_user_agent: adminRequestContext.user_agent });
        if (result.error) {
          adminToast(result.error.message, "danger");
          renderAdminUsers();
          return;
        }
        user.role = role;
        cacheAdminUsers();

        pulseAdminRow(userId, "warning");
        adminToast(adminText(adminIsZh(), "角色已更新。", "Role updated."), "warning");
        renderAdminUsers();
      }

      async function changeAdminUserStatus(userId, status) {
        const user = getAdminUser(userId);
        if (!user) return;
        if (user.user_id === adminState.currentUser?.id && status !== "active") {
          adminToast(adminText(adminIsZh(), "不能封禁或停用自己。", "You cannot suspend or ban yourself."), "danger");
          renderAdminUsers();
          return;
        }
        const isDanger = status === "banned";
        const ok = await adminConfirm({
          title: adminText(adminIsZh(), isDanger ? "确认封禁用户" : "确认修改状态", isDanger ? "Confirm user ban" : "Confirm status change"),
          message: (user.email || user.user_id) + " → " + adminStatusLabel(status),
          confirmLabel: adminText(adminIsZh(), isDanger ? "封禁用户" : "修改状态", isDanger ? "Ban user" : "Update status"),
          danger: isDanger,
          confirmText: isDanger ? "BAN" : ""
        });
        if (!ok) {
          renderAdminUsers();
          return;
        }
        const result = await adminRpc("update_user_status", { p_user_id: userId, p_status: status, p_ip_address: adminRequestContext.ip_address, p_user_agent: adminRequestContext.user_agent });
        if (result.error) {
          adminToast(result.error.message, "danger");
          renderAdminUsers();
          return;
        }
        user.status = status;
        cacheAdminUsers();

        pulseAdminRow(userId, status === "active" ? "success" : "warning");
        adminToast(adminText(adminIsZh(), status === "active" ? "用户已解除封禁。" : "用户状态已更新。", status === "active" ? "User restored." : "User status updated."), status === "banned" ? "danger" : "success");
        renderAdminUsers();
      }

      function pulseAdminRow(userId, type) {
        const row = document.querySelector('[data-user-row="' + CSS.escape(userId) + '"]');
        if (!row) return;
        row.classList.remove("row-flash-warning", "row-flash-success");
        void row.offsetWidth;
        row.classList.add(type === "success" ? "row-flash-success" : "row-flash-warning");
      }

      async function loadAdminRoles() {
        const cards = document.getElementById("admin-role-cards");
        const matrix = document.getElementById("admin-permission-matrix");
        const stored = readAdminCache(ADMIN_ROLES_CACHE_KEY);
        const cached = stored?.user_id === adminState.currentUser?.id ? stored : null;

        if (cached?.data) {
          adminState.roles = normalizeRolePermissions(cached.data);
          adminState.pendingPermissions = JSON.parse(JSON.stringify(adminState.roles.role_permissions));
          adminState.permissionDirty = false;
          renderAdminRoles();
          void refreshAdminRoles(cached);
          return;
        }

        adminSkeleton(cards, 3);
        adminSkeleton(matrix, 8);
        await refreshAdminRoles(null);
      }

      async function refreshAdminRoles(cached) {
        const cards = document.getElementById("admin-role-cards");
        const matrix = document.getElementById("admin-permission-matrix");
        const result = await adminRpc("get_role_permissions", {});
        if (result.error) {
          if (cached?.data) {
            console.warn("Admin roles refresh failed; keeping cached data.");
            return;
          }
          [cards, matrix].forEach(target => {
            if (!target) return;
            target.classList.remove("admin-list-skeleton");
            target.innerHTML = adminLoadError();
          });
          adminToast(adminText(adminIsZh(), "角色权限读取失败。", "Role permissions failed to load."), "danger");
          return;
        }

        const fresh = normalizeRolePermissions(result.data || {});
        const fingerprint = adminRolesFingerprint(fresh);

        if (cached?.fingerprint === fingerprint) return;

        adminState.roles = fresh;
        adminState.pendingPermissions = JSON.parse(JSON.stringify(fresh.role_permissions));
        adminState.permissionDirty = false;
        cacheAdminRoles();
        renderAdminRoles();
      }

      function normalizeRolePermissions(data) {
        return {
          roles: data.roles || [],
          permissions: data.permissions || [],
          role_permissions: data.role_permissions || [],
          user_counts: data.user_counts || {}
        };
      }

      function roleHasPermission(role, permission) {
        return (adminState.pendingPermissions || []).some(item => item.role === role && item.permission === permission);
      }

      function setRolePermission(role, permission, enabled) {
        adminState.pendingPermissions = (adminState.pendingPermissions || []).filter(item => !(item.role === role && item.permission === permission));
        if (enabled) adminState.pendingPermissions.push({ role, permission });
        adminState.permissionDirty = true;
        document.getElementById("admin-unsaved-bar").hidden = false;
        document.getElementById("admin-save-permissions").disabled = false;
      }

      function renderAdminRoles() {
        const data = adminState.roles;
        const cards = document.getElementById("admin-role-cards");
        const matrix = document.getElementById("admin-permission-matrix");
        if (cards) {
          cards.classList.remove("admin-list-skeleton");
          cards.innerHTML = data.roles.map(role => {
            const count = data.user_counts?.[role.name] || 0;
            const perms = (adminState.pendingPermissions || []).filter(item => item.role === role.name).length;
            return '<article class="os-card admin-motion-card"><small>' + adminEscape(role.name) + '</small><h2>' + adminEscape(adminRoleLabel(role.name)) + '</h2><p>' + adminEscape(adminRoleDescription(role)) + '</p><strong>' + count + adminText(adminIsZh(), ' 位用户 · ', ' users · ') + perms + adminText(adminIsZh(), ' 项权限', ' permissions') + '</strong></article>';
          }).join("");
        }
        if (!matrix) return;
        matrix.classList.remove("admin-list-skeleton");
        const grouped = {};
        data.permissions.forEach(permission => {
          grouped[permission.category || "general"] ||= [];
          grouped[permission.category || "general"].push(permission);
        });
        matrix.innerHTML = Object.entries(grouped).map(([category, permissions]) =>
          '<details class="permission-group" open><summary>' + adminEscape(adminCategoryLabel(category)) + '</summary>' +
          '<div class="permission-grid">' +
            '<strong class="permission-head">' + adminEscape(adminText(adminIsZh(), "权限", "Permission")) + '</strong>' + data.roles.map(role => '<strong>' + adminEscape(adminRoleLabel(role.name)) + '</strong>').join("") +
            permissions.map(permission =>
              '<div class="permission-key"><strong>' + adminEscape(adminPermissionLabel(permission.key)) + '</strong><small>' + adminEscape(permission.key) + ' · ' + adminEscape(adminPermissionDescription(permission)) + '</small></div>' +
              data.roles.map(role => '<label class="switch-cell"><input type="checkbox" data-role="' + adminEscape(role.name) + '" data-permission="' + adminEscape(permission.key) + '"' + (roleHasPermission(role.name, permission.key) ? " checked" : "") + '><span></span></label>').join("")
            ).join("") +
          '</div></details>'
        ).join("");
        matrix.querySelectorAll('input[type="checkbox"]').forEach(input => input.addEventListener("change", async () => {
          const key = input.dataset.permission;
          const critical = ["users.ban", "roles.update", "users.update"].includes(key);
          if (critical && !input.checked) {
            const ok = await adminConfirm({
              title: adminText(adminIsZh(), "确认关闭关键权限", "Confirm critical permission change"),
              message: adminRoleLabel(input.dataset.role) + " / " + adminPermissionLabel(key),
              confirmLabel: adminText(adminIsZh(), "继续修改", "Continue"),
              danger: true
            });
            if (!ok) {
              input.checked = true;
              return;
            }
          }
          setRolePermission(input.dataset.role, key, input.checked);
          input.closest(".switch-cell")?.classList.add("updated");
          window.setTimeout(() => input.closest(".switch-cell")?.classList.remove("updated"), 2000);
        }));
        const save = document.getElementById("admin-save-permissions");
        if (save && !save.dataset.bound) {
          save.dataset.bound = "true";
          save.addEventListener("click", saveAdminPermissions);
        }
        cacheAdminViewHtml();
      }

      async function saveAdminPermissions() {
        const roles = adminState.roles.roles.map(role => role.name);
        for (const role of roles) {
          const permissions = (adminState.pendingPermissions || []).filter(item => item.role === role).map(item => item.permission);
          const result = await adminRpc("update_role_permissions", { p_role: role, p_permissions: permissions, p_ip_address: adminRequestContext.ip_address, p_user_agent: adminRequestContext.user_agent });
          if (result.error) {
            adminToast(result.error.message, "danger");
            return;
          }
          adminState.roles = normalizeRolePermissions(result.data || adminState.roles);
          adminState.pendingPermissions = JSON.parse(JSON.stringify(adminState.roles.role_permissions));
        }
        adminState.permissionDirty = false;
        cacheAdminRoles();
        document.getElementById("admin-unsaved-bar").hidden = true;
        const save = document.getElementById("admin-save-permissions");
        save.disabled = true;
        const old = save.innerText;
        save.innerText = adminText(adminIsZh(), "已保存", "Saved");
        window.setTimeout(() => save.innerText = old, 1400);
        adminToast(adminText(adminIsZh(), "权限矩阵已保存。", "Permission matrix saved."), "success");
        renderAdminRoles();
      }

      async function loadAdminLogs() {
        bindAdminLogFilters();
        await refreshAdminLogs({ useCache: true });
      }

      function bindAdminLogFilters() {
        ["admin-log-search","admin-log-action","admin-log-severity","admin-log-actor","admin-log-from","admin-log-to"].forEach(id => {
          const el = document.getElementById(id);
          if (el && !el.dataset.bound) {
            el.dataset.bound = "true";
            el.addEventListener("input", debounce(() => refreshAdminLogs({ useCache: false }), 180));
            el.addEventListener("change", () => refreshAdminLogs({ useCache: false }));
          }
        });
        const close = document.getElementById("admin-log-drawer-close");
        if (close && !close.dataset.bound) {
          close.dataset.bound = "true";
          close.addEventListener("click", () => toggleAdminLogDrawer(null));
        }
      }

      function debounce(fn, delay) {
        let timer;
        return () => {
          clearTimeout(timer);
          timer = setTimeout(fn, delay);
        };
      }

      async function refreshAdminLogs(options = {}) {
        const list = document.getElementById("admin-logs-list");
        const params = {
          p_action: document.getElementById("admin-log-action")?.value || null,
          p_severity: document.getElementById("admin-log-severity")?.value || null,
          p_actor: document.getElementById("admin-log-actor")?.value || null,
          p_search: document.getElementById("admin-log-search")?.value || null,
          p_from: document.getElementById("admin-log-from")?.value ? document.getElementById("admin-log-from").value + "T00:00:00" : null,
          p_to: document.getElementById("admin-log-to")?.value ? document.getElementById("admin-log-to").value + "T23:59:59" : null,
          p_limit: 120
        };
        const isDefault = !params.p_action && !params.p_severity && !params.p_actor && !params.p_search && !params.p_from && !params.p_to;
        const stored = options.useCache && isDefault ? readAdminCache(ADMIN_LOGS_CACHE_KEY) : null;
        const cached = stored?.user_id === adminState.currentUser?.id ? stored : null;

        if (cached?.logs) {
          adminState.logs = cached.logs;
          renderAdminLogs();
          void fetchAdminLogs(params, cached, true);
          return;
        }

        if (!list?.children.length) adminSkeleton(list, 8);
        await fetchAdminLogs(params, null, isDefault);
      }

      async function fetchAdminLogs(params, cached, cacheDefault) {
        const list = document.getElementById("admin-logs-list");
        const result = await adminRpc("get_audit_logs", params);
        if (result.error) {
          if (cached?.logs) {
            console.warn("Admin logs refresh failed; keeping cached data.");
            return;
          }
          adminState.logs = [];
          list?.classList.remove("admin-list-skeleton");
          if (list) list.innerHTML = adminLoadError();
          const count = document.getElementById("admin-logs-count");
          if (count) count.innerText = "—";
          adminToast(adminText(adminIsZh(), "操作日志读取失败。", "Audit logs failed to load."), "danger");
          return;
        }

        const fresh = result.data || [];
        const fingerprint = adminLogsFingerprint(fresh);

        if (cached?.fingerprint === fingerprint) return;

        adminState.logs = fresh;
        if (cacheDefault) cacheAdminLogs(fresh);
        renderAdminLogs();
      }

      function renderAdminLogs() {
        const list = document.getElementById("admin-logs-list");
        if (!list) return;
        list.classList.remove("admin-list-skeleton");
        document.getElementById("admin-logs-count").innerText = String(adminState.logs.length);
        list.innerHTML = renderAdminLogRows(adminState.logs, false);
        list.querySelectorAll("[data-log-id]").forEach(row => row.addEventListener("click", () => toggleAdminLogDrawer(row.dataset.logId)));
        cacheAdminViewHtml();
      }

      function renderAdminLogRows(logs, compact) {
        if (!logs.length) return adminEmpty(adminText(adminIsZh(), "暂无日志", "No logs yet"));
        return logs.map((log, index) =>
          '<article class="admin-log-row animated-row ' + adminEscape(log.severity || "info") + '" style="--stagger:' + Math.min(index, 12) + '" data-log-id="' + adminEscape(log.id || index) + '">' +
            '<span class="log-dot"></span>' +
            '<div><strong>' + adminEscape(adminActionLabel(log.action)) + '</strong><p>' + adminEscape(adminLogDescription(log)) + '</p><small>' + adminFormatDate(log.created_at) + ' · ' + adminEscape(log.actor_email || "-") + (compact ? "" : " · " + adminEscape(log.ip_address || "-")) + '</small></div>' +
            '<em class="admin-badge ' + adminEscape(log.severity || "info") + '">' + adminEscape(adminSeverityLabel(log.severity || "info")) + '</em>' +
          '</article>'
        ).join("");
      }

      function toggleAdminLogDrawer(logId) {
        const drawer = document.getElementById("admin-log-drawer");
        const body = document.getElementById("admin-log-drawer-body");
        if (!drawer || !body) return;
        if (!logId) {
          drawer.classList.remove("is-open");
          drawer.setAttribute("aria-hidden", "true");
          return;
        }
        const log = adminState.logs.find(item => String(item.id) === String(logId));
        if (!log) return;
        body.innerHTML =
          '<h2>' + adminEscape(adminActionLabel(log.action)) + '</h2>' +
          '<p>' + adminEscape(adminLogDescription(log)) + '</p>' +
          '<dl class="admin-drawer-facts">' +
            Object.entries(log).filter(([key]) => !["metadata"].includes(key)).map(([key, value]) => '<div><dt>' + adminEscape(adminFieldLabel(key)) + '<small> ' + adminEscape(key) + '</small></dt><dd>' + adminEscape(typeof value === "string" ? value : JSON.stringify(value)) + '</dd></div>').join("") +
          '</dl>' +
          '<pre>' + adminEscape(JSON.stringify(log.metadata || {}, null, 2)) + '</pre>';
        drawer.classList.add("is-open");
        drawer.setAttribute("aria-hidden", "false");
      }

      window.hydrateAdminModule = hydrateAdminModule;
    </script>
  `;
}

function themeToggle() {
  return `
    <button id="theme-toggle" class="theme-toggle" type="button" aria-label="Toggle color mode" title="Toggle color mode">
      <span class="theme-moon">◐</span>
      <span class="theme-sun">◑</span>
    </button>
  `;
}

function languageToggle(links, t) {
  const targetUrl = t === TEXT.zh ? links.enCurrent : links.zhCurrent;
  const label = t === TEXT.zh ? "ZH" : "EN";
  const title = t === TEXT.zh ? "Switch to English" : "切换到中文";

  return `
    <a class="language-toggle" href="${targetUrl}" aria-label="${title}" title="${title}">${label}</a>
  `;
}

function topControls(links, t) {
  return `
    <div class="top-controls-zone">
      <div class="top-controls">
        ${languageToggle(links, t)}
        ${themeToggle()}
      </div>
    </div>
    <style>
      .top-controls-zone{
        position:fixed;
        top:0;
        right:0;
        width:176px;
        height:92px;
        z-index:80;
      }
      .top-controls{
        position:absolute;
        top:14px;
        right:14px;
        display:flex;
        align-items:center;
        gap:10px;
        opacity:0;
        transform:translateY(-8px);
        pointer-events:none;
        transition:opacity .16s ease, transform .16s ease;
      }
      .top-controls-zone:hover .top-controls,
      .top-controls-zone:focus-within .top-controls{
        opacity:1;
        transform:translateY(0);
        pointer-events:auto;
      }
      .top-controls .language-toggle,
      .top-controls .theme-toggle{
        position:static !important;
        top:auto !important;
        right:auto !important;
        margin:0 !important;
      }
      @media (max-width:760px) and (hover:none) and (pointer:coarse){
        .top-controls-zone{
          width:176px;
          height:76px;
        }
        .top-controls{
          top:12px;
          right:12px;
          opacity:1;
          transform:none;
          pointer-events:auto;
        }
      }
    </style>
  `;
}

function themeScript() {
  return `
    <script>
      (function () {
        const button = document.getElementById("theme-toggle");
        if (!button) return;

        function setTheme(theme) {
          document.documentElement.classList.add("theme-switching");
          document.documentElement.dataset.theme = theme;
          try {
            localStorage.setItem("qssed-theme", theme);
          } catch {}
          window.setTimeout(() => {
            document.documentElement.classList.remove("theme-switching");
          }, 320);
        }

        button.addEventListener("click", () => {
          const currentTheme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
          setTheme(currentTheme === "light" ? "dark" : "light");
        });
      })();
    </script>
  `;
}

function osPage(t, links, pathname, ipInfo, cachedOsUserLabel = "") {
  const path = pathname;
  const zh = t === TEXT.zh;
  const copy = buildOsCopy(zh);
  const page = copy.pages[path] || copy.pages["/dashboard"];
  const activeSection = page.section;
  const adminPath = path.startsWith("/admin");
  const dashboardPath = path === "/dashboard";

  return `
<!DOCTYPE html>
<html>
<head>
  ${baseHead(page.title + " · " + t.studioName)}
  ${osStyles()}
  <script>
    (() => {
      try {
        const compactMedia = window.matchMedia("(max-width:1050px)");
        if (!compactMedia.matches) return;
        const state = sessionStorage.getItem("qssed-compact-view-v1");
        const currentPath = ${JSON.stringify(path)};
        const showContent = state === "content" || (state !== "menu" && currentPath !== "/dashboard");
        document.documentElement.classList.toggle("compact-content-view", showContent);
        document.documentElement.classList.toggle("compact-menu-view", !showContent);
      } catch {}
    })();
  </script>
</head>
<body class="os-shell" data-admin-path="${adminPath ? "true" : "false"}">
  ${topControls(links, t)}
  <div id="compact-back-zone" class="compact-back-zone">
    <button id="compact-back-button" class="compact-back-button" type="button" aria-label="${zh ? "返回导航" : "Back to navigation"}">
      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
        <path d="M14.5 5.5 8 12l6.5 6.5"/>
      </svg>
    </button>
  </div>
  <div class="os-layout">
    <aside id="os-sidebar" class="os-sidebar">
      <a class="os-brand" href="${links.dashboard}">
        <span class="os-brand-mark">Q</span>
        <span>
          <strong>QssedA Studio</strong>
          <small>${copy.platform}</small>
        </span>
      </a>
      <div class="os-user">
        <strong>${t.account}</strong>
        <span id="os-user-name">${escapeHtmlText(cachedOsUserLabel)}</span>
        <button id="os-signout-button" class="os-signout-button" type="button">
          <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
            <path d="M10 5H6.8A1.8 1.8 0 0 0 5 6.8v10.4A1.8 1.8 0 0 0 6.8 19H10"/>
            <path d="M14.5 8.5 18 12l-3.5 3.5M18 12H9"/>
          </svg>
          <span id="os-signout-label">${zh ? "退出登录" : "Sign Out"}</span>
        </button>
      </div>
      ${renderOsNav(copy, activeSection, path)}
    </aside>
    <script>
      try {
        const sidebar = document.getElementById("os-sidebar");
        const sidebarKey = "qssed-sidebar-scroll-v1";
        const compactViewKey = "qssed-compact-view-v1";
        const compactMedia = window.matchMedia("(max-width:1050px)");
        const savedSidebarScroll = Number(sessionStorage.getItem(sidebarKey) || "0");
        if (sidebar && Number.isFinite(savedSidebarScroll)) {
          sidebar.scrollTop = savedSidebarScroll;
          requestAnimationFrame(() => { sidebar.scrollTop = savedSidebarScroll; });
          const saveSidebarScroll = () => {
            try { sessionStorage.setItem(sidebarKey, String(sidebar.scrollTop)); } catch {}
          };
          sidebar.addEventListener("scroll", saveSidebarScroll, { passive: true });
          sidebar.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
            saveSidebarScroll();
            if (compactMedia.matches) {
              try { sessionStorage.setItem(compactViewKey, "content"); } catch {}
            }
          }, { capture: true }));
        }
      } catch {}
    </script>

    <main class="os-main">
      <section class="os-hero">
        <div>
          ${dashboardPath ? `<p class="os-kicker">${copy.kicker}</p>` : ""}
          <h1>${page.title}</h1>
          ${page.description ? `<p>${page.description}</p>` : ""}
        </div>
        ${dashboardPath ? `<a class="os-ai" href="${copy.aiHref}">
          <span>${copy.aiLabel}</span>
          <strong>${copy.aiTitle}</strong>
        </a>` : ""}
      </section>

      <section id="admin-lock" class="os-lock" style="display:none;">
        <strong>${t.adminOnly}</strong>
        <p>${copy.adminLock}</p>
      </section>

      <section id="os-content"${adminPath ? ' style="visibility:hidden"' : ""}>
        ${renderOsContent(path, copy)}
      </section>
    </main>
  </div>

  ${supabaseScript()}
  ${path === "/settings/storage" ? storageClientScript(zh, links.login) : ""}
  ${auditClientScript(ipInfo)}
  ${adminClientScript(ipInfo)}
  <script>
    const loginUrl = ${JSON.stringify(links.login)};
    const isAdminPath = document.body.dataset.adminPath === "true";
    const compactViewKey = "qssed-compact-view-v1";
    const compactSidebarKey = "qssed-sidebar-scroll-v1";
    const compactMedia = window.matchMedia("(max-width:1050px)");

    function applyCompactViewMode() {
      if (!compactMedia.matches) {
        document.documentElement.classList.remove("compact-content-view", "compact-menu-view");
        return;
      }
      let state = null;
      try { state = sessionStorage.getItem(compactViewKey); } catch {}
      const showContent = state === "content" || (state !== "menu" && ${JSON.stringify(path)} !== "/dashboard");
      document.documentElement.classList.toggle("compact-content-view", showContent);
      document.documentElement.classList.toggle("compact-menu-view", !showContent);
    }

    function showCompactNavigation() {
      if (!compactMedia.matches) return;
      try { sessionStorage.setItem(compactViewKey, "menu"); } catch {}
      document.documentElement.classList.remove("compact-content-view");
      document.documentElement.classList.add("compact-menu-view");
      const sidebar = document.getElementById("os-sidebar");
      const saved = Number(sessionStorage.getItem(compactSidebarKey) || "0");
      requestAnimationFrame(() => {
        if (sidebar && Number.isFinite(saved)) sidebar.scrollTop = saved;
      });
    }

    document.getElementById("compact-back-button")?.addEventListener("click", showCompactNavigation);

    const signOutButton = document.getElementById("os-signout-button");
    const signOutLabel = document.getElementById("os-signout-label");

    async function signOutCurrentSession() {
      if (!signOutButton || signOutButton.disabled) return;

      const idleLabel = ${JSON.stringify(zh ? "退出登录" : "Sign Out")};
      signOutButton.disabled = true;
      if (signOutLabel) signOutLabel.textContent = ${JSON.stringify(zh ? "正在退出…" : "Signing out…")};

      try {
        const { error } = await supabaseClient.auth.signOut({ scope: "local" });
        if (error) throw error;
      } catch (error) {
        console.error("Sign out failed", error);
        if (signOutLabel) signOutLabel.textContent = ${JSON.stringify(zh ? "退出失败" : "Sign out failed")};
        window.setTimeout(() => {
          signOutButton.disabled = false;
          if (signOutLabel) signOutLabel.textContent = idleLabel;
        }, 1600);
        return;
      }

      try {
        document.cookie = "qssed-os-user-name=; Path=/; Max-Age=0; SameSite=Lax; Secure";
      } catch {}
      try { if (typeof clearProfileUiCaches === "function") clearProfileUiCaches(); } catch {}
      try { if (typeof clearAdminUiCaches === "function") clearAdminUiCaches(); } catch {}
      try {
        [
          "qssed-os-user-name",
          "qssed-sidebar-scroll-v1",
          "qssed-compact-view-v1"
        ].forEach(key => sessionStorage.removeItem(key));
      } catch {}

      window.location.replace(loginUrl);
    }

    signOutButton?.addEventListener("click", signOutCurrentSession);

    if (typeof compactMedia.addEventListener === "function") {
      compactMedia.addEventListener("change", applyCompactViewMode);
    } else if (typeof compactMedia.addListener === "function") {
      compactMedia.addListener(applyCompactViewMode);
    }

    async function restoreWarmAdminSnapshot() {
      if (!isAdminPath) return;
      try {
        const access = JSON.parse(sessionStorage.getItem("qssed-admin-access-v1") || "null");
        const snapshot = sessionStorage.getItem("qssed-admin-view-v1:" + location.pathname);
        if (!access?.user_id || !snapshot) return;

        const { data } = await supabaseClient.auth.getSession();
        const localUserId = data?.session?.user?.id || "";
        if (!localUserId || localUserId !== access.user_id) return;

        const content = document.getElementById("os-content");
        if (!content) return;
        content.innerHTML = snapshot;
        content.style.visibility = "visible";
      } catch {}
    }

    async function hydrateOsUser() {
      let data;
      let adminCheck = null;

      if (isAdminPath) {
        const [userResult, adminResult] = await Promise.all([
          supabaseClient.auth.getUser(),
          supabaseClient.rpc("is_admin")
        ]);
        data = userResult.data;
        adminCheck = adminResult;
      } else {
        const userResult = await supabaseClient.auth.getUser();
        data = userResult.data;
      }

      if (!data.user) {
        try {
          document.cookie = "qssed-os-user-name=; Path=/; Max-Age=0; SameSite=Lax; Secure";
          sessionStorage.removeItem("qssed-os-user-name");
        } catch {}
        try { if (typeof clearProfileUiCaches === "function") clearProfileUiCaches(); } catch {}
        try { if (typeof clearAdminUiCaches === "function") clearAdminUiCaches(); } catch {}
        window.location.href = loginUrl;
        return;
      }

      const name = data.user.user_metadata.username || data.user.user_metadata.display_name || data.user.email;
      const userLabel = "@" + name;
      document.getElementById("os-user-name").innerText = userLabel;
      try {
        document.cookie = "qssed-os-user-name=" + encodeURIComponent(userLabel) + "; Path=/; Max-Age=2592000; SameSite=Lax; Secure";
        sessionStorage.removeItem("qssed-os-user-name");
      } catch {}

      if (isAdminPath) {
        const allowed = !adminCheck?.error && adminCheck?.data === true;
        const lock = document.getElementById("admin-lock");
        const content = document.getElementById("os-content");
        lock.style.display = allowed ? "none" : "block";

        if (!allowed) {
          content.style.display = "none";
          content.style.visibility = "hidden";
          try { if (typeof clearAdminUiCaches === "function") clearAdminUiCaches(); } catch {}
          void updateCurrentDevice(data.user);
          return;
        }

        try {
          sessionStorage.setItem("qssed-admin-access-v1", JSON.stringify({ user_id: data.user.id }));
        } catch {}
        await hydrateAdminModule(data.user);
        content.style.display = "block";
        content.style.visibility = "visible";
        void updateCurrentDevice(data.user);
        return;
      }

      await updateCurrentDevice(data.user);
      await hydrateProfileSummary(data.user);
      await hydrateProfileHome(data.user);
      await hydrateProfileAudit(data.user);
    }

    void restoreWarmAdminSnapshot();
    hydrateOsUser();
  </script>
  ${themeScript()}
</body>
</html>
`;
}

function buildOsCopy(zh) {
  const prefix = zh ? "/zh-cn" : "/en";

  if (zh) {
    return {
      platform: "个人 AI 知识工作平台",
      kicker: "个人智能工作台",
      aiLabel: "工作流",
      aiTitle: "实验与工具入口",
      aiHref: `${prefix}/workspace/experiments`,
      adminLock: "当前账号没有管理权限。管理功能仅对授权管理员开放；如认为权限异常，请联系管理员确认账号角色。",
      nav: [
        { id: "dashboard", label: "首页", href: `${prefix}/dashboard`, items: [] },
        { id: "info", label: "信息中心", href: `${prefix}/info`, items: [
          ["知识库", `${prefix}/info/knowledge`],
          ["收藏链接", `${prefix}/info/links`],
          ["研究笔记", `${prefix}/info/notes`],
          ["内容摘要", `${prefix}/info/summaries`],
          ["全局搜索", `${prefix}/info/search`]
        ] },
        { id: "profile", label: "个人主页", href: `${prefix}/profile`, items: [
          ["用户资料", `${prefix}/profile/details`],
          ["账户信息", `${prefix}/profile/account`],
          ["偏好设置", `${prefix}/profile/preferences`]
        ] },
        { id: "workspace", label: "工作区", href: `${prefix}/workspace`, items: [
          ["工作台", `${prefix}/workspace/workbench`],
          ["项目管理", `${prefix}/workspace/projects`],
          ["实验室", `${prefix}/workspace/experiments`],
          ["草稿箱", `${prefix}/workspace/drafts`],
          ["任务中心", `${prefix}/workspace/tasks`]
        ] },
        { id: "admin", label: "管理", href: `${prefix}/admin`, items: [
          ["通用", `${prefix}/admin/general`],
          ["用户管理", `${prefix}/admin/users`],
          ["角色权限", `${prefix}/admin/roles`],
          ["操作日志", `${prefix}/admin/logs`],
          ["系统状态", `${prefix}/admin/system`]
        ] },
        { id: "settings", label: "设置", href: `${prefix}/settings`, items: [
          ["通用", `${prefix}/settings/general`],
          ["外观", `${prefix}/settings/appearance`],
          ["语言", `${prefix}/settings/language`],
          ["账户与安全", `${prefix}/settings/security`],
          ["通知", `${prefix}/settings/notifications`],
          ["AI 设置", `${prefix}/settings/ai`],
          ["第三方集成", `${prefix}/settings/integrations`],
          ["存储管理", `${prefix}/settings/storage`]
        ] }
      ],
      pages: buildOsPages(true)
    };
  }

  return {
    platform: "Personal AI Knowledge Platform",
    kicker: "Personal Intelligence Workspace",
    aiLabel: "Workflow",
    aiTitle: "Experiments & tools",
    aiHref: `${prefix}/workspace/experiments`,
    adminLock: "This account does not have management access. Administrative tools are available only to authorized administrators. If this seems incorrect, contact an administrator to verify your role.",
    nav: [
      { id: "dashboard", label: "Dashboard", href: `${prefix}/dashboard`, items: [] },
      { id: "info", label: "Information", href: `${prefix}/info`, items: [
        ["Knowledge base", `${prefix}/info/knowledge`],
        ["Links", `${prefix}/info/links`],
        ["Notes", `${prefix}/info/notes`],
        ["Summaries", `${prefix}/info/summaries`],
        ["Search", `${prefix}/info/search`]
      ] },
      { id: "profile", label: "Profile", href: `${prefix}/profile`, items: [
        ["Profile Details", `${prefix}/profile/details`],
        ["Account", `${prefix}/profile/account`],
        ["Preferences", `${prefix}/profile/preferences`]
      ] },
      { id: "workspace", label: "Workspace", href: `${prefix}/workspace`, items: [
        ["Workbench", `${prefix}/workspace/workbench`],
        ["Projects", `${prefix}/workspace/projects`],
        ["Experiments", `${prefix}/workspace/experiments`],
        ["Drafts", `${prefix}/workspace/drafts`],
        ["Tasks", `${prefix}/workspace/tasks`]
      ] },
      { id: "admin", label: "Admin", href: `${prefix}/admin`, items: [
        ["General", `${prefix}/admin/general`],
        ["Users", `${prefix}/admin/users`],
        ["Roles", `${prefix}/admin/roles`],
        ["Logs", `${prefix}/admin/logs`],
        ["System", `${prefix}/admin/system`]
      ] },
      { id: "settings", label: "Settings", href: `${prefix}/settings`, items: [
        ["General", `${prefix}/settings/general`],
        ["Appearance", `${prefix}/settings/appearance`],
        ["Language", `${prefix}/settings/language`],
        ["Account & Security", `${prefix}/settings/security`],
        ["Notifications", `${prefix}/settings/notifications`],
        ["AI", `${prefix}/settings/ai`],
        ["Integrations", `${prefix}/settings/integrations`],
        ["Storage", `${prefix}/settings/storage`]
      ] }
    ],
    pages: buildOsPages(false)
  };
}

function buildOsPages(zh) {
  const z = {
    dashboard: ["仪表盘", "汇总账号状态与核心模块，快速查看当前可用功能。"],
    info: ["信息中心", "知识模块尚未建立持久化数据表；当前仅保留清晰的模块入口。"],
    knowledge: ["知识库", "整理值得长期保留的知识内容，方便持续积累、查找与回顾。"],
    links: ["收藏链接", "尚未接入收藏链接数据表。"],
    notes: ["研究笔记", "尚未接入笔记存储与 Markdown 保存接口。"],
    summaries: ["内容摘要", "尚未接入摘要数据源。"],
    search: ["全局搜索", "尚未接入跨模块搜索索引。"],
    profile: ["个人主页", ""],
    account: ["账户信息", "账号 ID、邮箱、创建时间、最近登录和登录记录。"],
    security: ["账户与安全", "管理登录设备、登录历史与账户安全记录。"],
    preferences: ["偏好设置", "主题与语言可直接切换；字体和通知设置尚未实现。"],
    workspace: ["工作区", "工作区总览，用于查看并进入工作台、项目、实验、草稿与任务。"],
    workbench: ["工作台", "工作区中的主要操作界面，用于集中处理项目、草稿、实验与任务。"],
    projects: ["项目管理", "尚未接入项目数据表。"],
    experiments: ["实验室", "实验工具尚未接入持久化数据。"],
    drafts: ["草稿箱", "尚未接入草稿数据表。"],
    tasks: ["任务中心", "尚未接入任务数据表。"],
    admin: ["管理", "显示真实用户与管理员数量、最近用户、操作日志和风险事件。"],
    users: ["用户管理", "用户列表、权限管理和封禁管理。"],
    roles: ["角色权限", "查看管理员、编辑者与普通成员的权限范围，并管理角色授权。"],
    logs: ["操作日志", "查看账户与管理操作的审计记录。"],
    system: ["系统状态", "查看管理功能、数据读取与审计能力的当前状态。"],
    settings: ["设置", "集中管理通用、外观、语言、账户安全、通知、AI、第三方集成和存储等设置。"],
    general: ["通用", "管理网站的基础行为与通用偏好。"],
    appearance: ["外观", "当前支持浅色与深色主题，可使用右上角主题按钮切换。"],
    language: ["语言", "设置网页显示语言；当前支持中文与 English。"],
    notifications: ["通知", "管理提醒、站内消息与其他通知偏好。"],
    ai: ["AI 设置", "当前没有浏览器端 API Key 配置功能；敏感密钥不应保存在前端。"],
    integrations: ["第三方集成", "当前站点运行依赖 Cloudflare 与 Supabase；此页尚无用户级集成配置。"],
    storage: ["存储管理", "管理仅属于当前账号的私人 Cloudflare R2 文件。"]
  };
  const e = {
    dashboard: ["Dashboard", "Overview of your account status and core modules, with quick access to currently available features."],
    info: ["Information Center", "Persistent knowledge tables are not implemented yet; this area currently provides module entry points."],
    knowledge: ["Knowledge Base", "Organize knowledge worth keeping so it stays easy to build on, find, and revisit."],
    links: ["Saved Links", "No saved-links table is connected yet."],
    notes: ["Research Notes", "Note storage and Markdown persistence are not connected yet."],
    summaries: ["Summaries", "No summary data source is connected yet."],
    search: ["Global Search", "No cross-module search index is connected yet."],
    profile: ["Profile", ""],
    account: ["Account", "Account ID, email, creation time, last sign-in, and login records."],
    security: ["Account & Security", "Manage signed-in devices, login history, and account security records."],
    preferences: ["Preferences", "Theme and language can be switched now; font and notification preferences are not implemented."],
    workspace: ["Workspace", "An overview for entering the Workbench, projects, experiments, drafts, and tasks."],
    workbench: ["Workbench", "The main operating surface inside Workspace for projects, drafts, experiments, and tasks."],
    projects: ["Projects", "No projects table is connected yet."],
    experiments: ["Lab", "Experiment tools are not connected to persistent data yet."],
    drafts: ["Drafts", "No drafts table is connected yet."],
    tasks: ["Tasks", "No tasks table is connected yet."],
    admin: ["Admin", "Shows live user/admin counts, recent users, operation logs, and risk events."],
    users: ["User Management", "User list, permissions, and bans."],
    roles: ["Roles", "Review the access scope for administrators, editors, and members, and manage role permissions."],
    logs: ["Logs", "Review audit records for account and administrative actions."],
    system: ["System Status", "Review the current availability of management features, data access, and auditing capabilities."],
    settings: ["Settings", "Manage general, appearance, language, account security, notifications, AI, integrations, and storage settings."],
    general: ["General", "Manage the site's basic behavior and general preferences."],
    appearance: ["Appearance", "Light and dark themes are available through the theme button in the top-right corner."],
    language: ["Language", "Choose the site language; Chinese and English are currently supported."],
    notifications: ["Notifications", "Manage reminders, in-app messages, and other notification preferences."],
    ai: ["AI Settings", "There is no browser-side API-key configuration. Sensitive keys should not be stored in frontend code."],
    integrations: ["Integrations", "The site currently depends on Cloudflare and Supabase; user-configurable integrations are not implemented."],
    storage: ["Storage", "Manage private Cloudflare R2 files belonging only to your account."]
  };
  const s = zh ? z : e;
  return {
    "/dashboard": { section: "dashboard", title: s.dashboard[0], description: s.dashboard[1] },
    "/info": { section: "info", title: s.info[0], description: s.info[1] },
    "/info/knowledge": { section: "info", title: s.knowledge[0], description: s.knowledge[1] },
    "/info/links": { section: "info", title: s.links[0], description: s.links[1] },
    "/info/notes": { section: "info", title: s.notes[0], description: s.notes[1] },
    "/info/summaries": { section: "info", title: s.summaries[0], description: s.summaries[1] },
    "/info/search": { section: "info", title: s.search[0], description: s.search[1] },
    "/profile": { section: "profile", title: s.profile[0], description: s.profile[1] },
    "/profile/details": { section: "profile", title: zh ? "用户资料" : "Profile Details", description: zh ? "查看和维护头像、个性签名、个人介绍、状态、兴趣与主页背景。" : "View and maintain your photo, signature, bio, presence, interests, and profile background." },
    "/profile/account": { section: "profile", title: s.account[0], description: s.account[1] },
    "/profile/preferences": { section: "profile", title: s.preferences[0], description: s.preferences[1] },
    "/workspace": { section: "workspace", title: s.workspace[0], description: s.workspace[1] },
    "/workspace/workbench": { section: "workspace", title: zh ? "工作台" : "Workbench", description: zh ? "工作区中的主要操作界面，用于集中处理项目、实验、草稿与任务。" : "The main operating surface inside Workspace for projects, experiments, drafts, and tasks." },
    "/workspace/projects": { section: "workspace", title: s.projects[0], description: s.projects[1] },
    "/workspace/experiments": { section: "workspace", title: s.experiments[0], description: s.experiments[1] },
    "/workspace/drafts": { section: "workspace", title: s.drafts[0], description: s.drafts[1] },
    "/workspace/tasks": { section: "workspace", title: s.tasks[0], description: s.tasks[1] },
    "/admin": { section: "admin", title: s.admin[0], description: s.admin[1] },
    "/admin/general": { section: "admin", title: zh ? "通用" : "General", description: zh ? "查看管理区域的核心概览、账户统计、近期操作与风险信息。" : "Review the core admin overview, account metrics, recent operations, and risk information." },
    "/admin/users": { section: "admin", title: s.users[0], description: s.users[1] },
    "/admin/roles": { section: "admin", title: s.roles[0], description: s.roles[1] },
    "/admin/logs": { section: "admin", title: s.logs[0], description: s.logs[1] },
    "/admin/system": { section: "admin", title: s.system[0], description: s.system[1] },
    "/settings": { section: "settings", title: s.settings[0], description: s.settings[1] },
    "/settings/general": { section: "settings", title: zh ? "通用" : "General", description: zh ? "管理网站的基础行为与通用偏好。" : "Manage the site's basic behavior and general preferences." },
    "/settings/appearance": { section: "settings", title: s.appearance[0], description: s.appearance[1] },
    "/settings/language": { section: "settings", title: s.language[0], description: s.language[1] },
    "/settings/security": { section: "settings", title: s.security[0], description: s.security[1] },
    "/settings/notifications": { section: "settings", title: s.notifications[0], description: s.notifications[1] },
    "/settings/ai": { section: "settings", title: s.ai[0], description: s.ai[1] },
    "/settings/integrations": { section: "settings", title: s.integrations[0], description: s.integrations[1] },
    "/settings/storage": { section: "settings", title: s.storage[0], description: s.storage[1] }
  };
}

function renderOsNav(copy, activeSection, currentPath = "") {
  return `
    <nav class="os-nav">
      ${copy.nav.map(group => `
        <section class="os-nav-group ${group.id === activeSection ? "is-active" : ""}">
          <a class="os-nav-title" href="${group.href}">${group.label}</a>
          ${group.items.length ? `<div class="os-nav-items">
            ${group.items.map(item => `<a href="${item[1]}"${item[1].endsWith(currentPath) ? ` aria-current="page"` : ""}>${item[0]}</a>`).join("")}
          </div>` : ""}
        </section>
      `).join("")}
    </nav>
  `;
}

function renderOsContent(path, copy) {
  const zh = copy.platform.includes("个人");
  if (path === "/dashboard") return dashboardContent(zh);
  if (path === "/info") return statusContent(zh, "信息中心尚未接入", "收藏链接、笔记、摘要和 AI 对话目前没有持久化数据源。", "Information Center is not connected yet", "Saved links, notes, summaries, and AI conversations do not have persistent data sources yet.");
  if (path === "/info/knowledge") return statusContent(zh, "知识库", "用于整理值得长期保留的知识内容，让信息更容易积累、查找和回顾。", "Knowledge Base", "Organize knowledge worth keeping so it remains easy to build on, find, and revisit.");
  if (path === "/info/links") return linksContent(zh);
  if (path === "/info/notes") return notesContent(zh);
  if (path === "/info/summaries") return summariesContent(zh);
  if (path === "/info/search") return searchContent(zh);
  if (path.startsWith("/profile")) return profileContent(path, zh);
  if (path.startsWith("/workspace")) return workspaceContent(path, zh);
  if (path.startsWith("/admin")) return adminContent(path, zh);
  if (path.startsWith("/settings")) return settingsContent(path, zh);
  throw new Error("Unhandled OS path: " + path);
}

function statusContent(zh, zhTitle, zhBody, enTitle, enBody) {
  return `<section class="os-card is-large"><h2>${zh ? zhTitle : enTitle}</h2><p>${zh ? zhBody : enBody}</p></section>`;
}

function dashboardIcon(name) {
  const icons = {
    profile: '<circle cx="12" cy="8" r="3.2"/><path d="M5.5 19c.9-3.2 3.2-5 6.5-5s5.6 1.8 6.5 5"/>',
    workbench: '<rect x="4" y="5" width="16" height="14" rx="3"/><path d="M8 9h8M8 13h5"/>',
    storage: '<path d="M4 7.5C4 5.6 7.6 4 12 4s8 1.6 8 3.5S16.4 11 12 11 4 9.4 4 7.5z"/><path d="M4 7.5v4C4 13.4 7.6 15 12 15s8-1.6 8-3.5v-4M4 11.5v4C4 17.4 7.6 19 12 19s8-1.6 8-3.5v-4"/>',
    links: '<path d="M9.5 14.5l5-5M7.2 16.8l-1.3 1.3a3.2 3.2 0 01-4.5-4.5l3.4-3.4a3.2 3.2 0 014.5 0M16.8 7.2l1.3-1.3a3.2 3.2 0 014.5 4.5l-3.4 3.4a3.2 3.2 0 01-4.5 0"/>',
    security: '<path d="M12 3l7 3v5c0 4.4-2.6 7.8-7 10-4.4-2.2-7-5.6-7-10V6l7-3z"/><path d="M9.3 12l1.8 1.8 3.7-4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7.4 7.4 0 00-.1-1l2-1.5-2-3.4-2.5 1A8.3 8.3 0 0014.7 6L14.4 3h-4.8L9.3 6a8.3 8.3 0 00-1.7 1.1l-2.5-1-2 3.4 2 1.5a7.4 7.4 0 000 2l-2 1.5 2 3.4 2.5-1A8.3 8.3 0 009.3 18l.3 3h4.8l.3-3a8.3 8.3 0 001.7-1.1l2.5 1 2-3.4-2-1.5c.1-.3.1-.7.1-1z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    appearance: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 000 16z"/>',
    language: '<path d="M4 5h10M9 5c-.2 5-2.3 8.3-5 10M6 9c1.8 2.8 4 4.8 7 6M14 10h6M17 7v10M14 17h6"/>'
  };
  return '<span class="dashboard-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (icons[name] || icons.info) + '</svg></span>';
}

function dashboardContent(zh) {
  const prefix = zh ? "/zh-cn" : "/en";
  const shortcuts = zh ? [
    ["用户资料","完善你的头像、签名与主页","profile",`${prefix}/profile/details`],
    ["工作台","进入工作区主要操作界面","workbench",`${prefix}/workspace/workbench`],
    ["私人存储","管理当前账号的 R2 文件","storage",`${prefix}/settings/storage`],
    ["收藏链接","打开你的链接收藏与常用入口","links",`${prefix}/info/links`],
    ["账户与安全","查看设备、登录与安全记录","security",`${prefix}/settings/security`],
    ["设置","外观、语言与其他偏好入口","settings",`${prefix}/settings`]
  ] : [
    ["Profile Details","Edit your photo, signature, and personal page","profile",`${prefix}/profile/details`],
    ["Workbench","Open the main operating surface in Workspace","workbench",`${prefix}/workspace/workbench`],
    ["Private Storage","Manage R2 files for this account","storage",`${prefix}/settings/storage`],
    ["Saved Links","Open saved links and common destinations","links",`${prefix}/info/links`],
    ["Account & Security","Review devices, sign-ins, and security records","security",`${prefix}/settings/security`],
    ["Settings","Appearance, language, and preference entry points","settings",`${prefix}/settings`]
  ];

  const moduleRows = zh ? [
    ["个人主页","已接入","头像、背景、个性签名、状态、兴趣与链接库。","profile",`${prefix}/profile`],
    ["私人存储","已连接","Cloudflare R2 私人文件空间。","storage",`${prefix}/settings/storage`],
    ["工作区","入口已建立","工作台、项目、实验、草稿与任务已有独立路由。","workbench",`${prefix}/workspace`],
    ["信息中心","部分可用","收藏链接等入口可用，其余模块等待数据源。","info",`${prefix}/info`]
  ] : [
    ["Profile","Connected","Profile photo, background, signature, presence, interests, and links.","profile",`${prefix}/profile`],
    ["Private Storage","Connected","Private Cloudflare R2 file space.","storage",`${prefix}/settings/storage`],
    ["Workspace","Routes ready","Workbench, projects, experiments, drafts, and tasks have distinct routes.","workbench",`${prefix}/workspace`],
    ["Information","Partially available","Saved links are available; other modules still await data sources.","info",`${prefix}/info`]
  ];

  return `
    <section class="dashboard-welcome">
      <div class="dashboard-welcome-copy">
        <span class="dashboard-eyebrow">${zh ? "QssedA Studio" : "QssedA Studio"}</span>
        <h2>${zh ? "欢迎回来" : "Welcome back"}</h2>
        <p>${zh ? "从这里继续进入你的个人空间、工作区、收藏内容与私人存储。首页只展示真实可用的入口，不制造没有数据来源的统计数字。" : "Continue into your profile, workspace, saved content, and private storage. The dashboard only surfaces real entry points rather than invented statistics."}</p>
        <div class="dashboard-welcome-actions">
          <a class="dashboard-primary-action" href="${prefix}/workspace/workbench">${zh ? "打开工作台" : "Open Workbench"}<span>›</span></a>
          <a class="dashboard-secondary-action" href="${prefix}/profile/details">${zh ? "编辑用户资料" : "Edit Profile"}<span>›</span></a>
        </div>
      </div>
      <div class="dashboard-today-card" aria-label="${zh ? "本次访问" : "This visit"}">
        ${dashboardIcon("clock")}
        <div>
          <small>${zh ? "本次访问" : "This visit"}</small>
          <strong id="dashboard-live-time">--:--</strong>
          <span id="dashboard-live-date">----</span>
        </div>
      </div>
    </section>

    <section class="dashboard-section">
      <div class="dashboard-section-head">
        <div><small>${zh ? "快速开始" : "Quick Start"}</small><h2>${zh ? "继续使用" : "Continue"}</h2></div>
        <span>${zh ? "常用入口" : "Common destinations"}</span>
      </div>
      <div class="dashboard-shortcuts">
        ${shortcuts.map(item => `<a class="dashboard-shortcut" href="${item[3]}">${dashboardIcon(item[2])}<span><strong>${item[0]}</strong><small>${item[1]}</small></span><b aria-hidden="true">›</b></a>`).join("")}
      </div>
    </section>

    <section class="dashboard-split">
      <article class="os-card dashboard-module-card">
        <div class="dashboard-section-head compact">
          <div><small>${zh ? "Studio 概览" : "Studio Overview"}</small><h2>${zh ? "当前模块" : "Current Modules"}</h2></div>
        </div>
        <div class="dashboard-module-list">
          ${moduleRows.map(row => `<a href="${row[4]}">${dashboardIcon(row[3])}<span><strong>${row[0]}</strong><small>${row[2]}</small></span><em>${row[1]}</em><b aria-hidden="true">›</b></a>`).join("")}
        </div>
      </article>

      <article class="os-card dashboard-session-card">
        <div class="dashboard-section-head compact">
          <div><small>${zh ? "当前环境" : "Current Environment"}</small><h2>${zh ? "本次使用" : "This Session"}</h2></div>
        </div>
        <div class="dashboard-session-facts">
          <div>${dashboardIcon("appearance")}<span><small>${zh ? "外观" : "Appearance"}</small><strong id="dashboard-theme-label">—</strong></span></div>
          <div>${dashboardIcon("language")}<span><small>${zh ? "语言" : "Language"}</small><strong>${zh ? "简体中文" : "English"}</strong></span></div>
          <div>${dashboardIcon("storage")}<span><small>${zh ? "存储" : "Storage"}</small><strong>Cloudflare R2</strong></span></div>
        </div>
        <a class="dashboard-session-settings" href="${prefix}/settings">${zh ? "管理设置" : "Manage settings"}<span>›</span></a>
      </article>
    </section>

    <section class="os-card dashboard-activity-card">
      <div class="dashboard-section-head compact">
        <div><small>${zh ? "活动" : "Activity"}</small><h2>${zh ? "最近动态" : "Recent Activity"}</h2></div>
      </div>
      <div class="dashboard-empty-activity">
        <span></span>
        <strong>${zh ? "暂时没有统一活动流" : "No unified activity feed yet"}</strong>
        <p>${zh ? "项目、实验、草稿和任务的数据模型接入后，这里再展示真实的最近活动；目前不使用示例数据冒充历史记录。" : "Real recent activity will appear here after projects, experiments, drafts, and tasks share persistent data. Placeholder activity is intentionally not shown as history."}</p>
        <a href="${prefix}/workspace">${zh ? "查看工作区" : "View Workspace"} <b>›</b></a>
      </div>
    </section>

    <script>
      (() => {
        const time = document.getElementById("dashboard-live-time");
        const date = document.getElementById("dashboard-live-date");
        const theme = document.getElementById("dashboard-theme-label");
        const zh = ${zh ? "true" : "false"};
        const paint = () => {
          const now = new Date();
          if (time) time.textContent = new Intl.DateTimeFormat(zh ? "zh-CN" : "en", { hour:"2-digit", minute:"2-digit", hour12:false }).format(now);
          if (date) date.textContent = new Intl.DateTimeFormat(zh ? "zh-CN" : "en", { year:"numeric", month:"long", day:"numeric", weekday:"short" }).format(now);
          if (theme) {
            const current = document.documentElement.dataset.theme || "light";
            theme.textContent = current === "dark" ? (zh ? "深色" : "Dark") : (zh ? "浅色" : "Light");
          }
        };
        paint();
        window.setInterval(paint, 30000);
        new MutationObserver(paint).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
      })();
    </script>
  `;
}
function linksContent(zh) {
  return `<section class="os-card is-large"><h2>${zh ? "尚未接入收藏链接" : "Saved links are not connected yet"}</h2><p>${zh ? "当前数据库没有收藏链接表，因此这里不再展示固定示例链接或伪造收藏时间。" : "There is no saved-links table in the current database, so this page no longer shows fixed sample links or fabricated saved dates."}</p></section>`;
}

function notesContent(zh) {
  return `<section class="os-card is-large"><h2>${zh ? "笔记存储尚未接入" : "Note storage is not connected yet"}</h2><p>${zh ? "当前没有 notes 数据表或保存接口，因此这里不再显示一个看似可编辑但无法持久化的 Markdown 编辑器。" : "There is no notes table or save API, so this page no longer presents an editor that looks functional but cannot persist changes."}</p></section>`;
}

function summariesContent(zh) {
  return statusContent(zh, "摘要数据尚未接入", "当前没有用于保存 B 站、YouTube、网页或 PDF 摘要的数据源。", "Summary data is not connected yet", "There is no persistent data source for Bilibili, YouTube, webpage, or PDF summaries yet.");
}

function searchContent(zh) {
  return `<section class="os-card is-large"><h2>${zh ? "全局搜索尚未接入" : "Global search is not connected yet"}</h2><p>${zh ? "当前没有笔记、链接、项目或聊天记录的数据索引，因此不展示无实际搜索行为的输入框。" : "There is no index for notes, links, projects, or chat records yet, so this page does not show a search box with no real search behavior."}</p></section>`;
}

function osHubIcon(name) {
  const icons = {
    profile: '<circle cx="12" cy="8" r="3.1"/><path d="M5.5 19c.9-3.2 3.2-5 6.5-5s5.6 1.8 6.5 5"/>',
    account: '<rect x="4" y="5" width="16" height="14" rx="3"/><path d="M8 9h8M8 13h5"/>',
    preferences: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9M8 4v6M16 14v6"/>',
    links: '<path d="M9.5 14.5l5-5M7.2 16.8l-1.3 1.3a3.2 3.2 0 01-4.5-4.5l3.4-3.4a3.2 3.2 0 014.5 0M16.8 7.2l1.3-1.3a3.2 3.2 0 014.5 4.5l-3.4 3.4a3.2 3.2 0 01-4.5 0"/>',
    storage: '<path d="M4 7.5C4 5.6 7.6 4 12 4s8 1.6 8 3.5S16.4 11 12 11 4 9.4 4 7.5z"/><path d="M4 7.5v4C4 13.4 7.6 15 12 15s8-1.6 8-3.5v-4M4 11.5v4C4 17.4 7.6 19 12 19s8-1.6 8-3.5v-4"/>',
    shield: '<path d="M12 3l7 3v5c0 4.4-2.6 7.8-7 10-4.4-2.2-7-5.6-7-10V6l7-3z"/><path d="M9.3 12l1.8 1.8 3.7-4"/>',
    general: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
    users: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.2"/><path d="M3.5 19c.7-3.4 2.7-5 5.5-5s4.8 1.6 5.5 5M14 15c2.8-.2 4.8 1.1 5.8 4"/>',
    roles: '<path d="M4 6h16v12H4z"/><path d="M8 10h8M8 14h5"/>',
    logs: '<path d="M6 4h12v16H6z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    system: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.8 1.8"/>',
    appearance: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 000 16z"/>',
    language: '<path d="M4 5h10M9 5c-.2 5-2.3 8.3-5 10M6 9c1.8 2.8 4 4.8 7 6M14 10h6M17 7v10M14 17h6"/>',
    notifications: '<path d="M6 16h12l-1.5-2V10a4.5 4.5 0 00-9 0v4L6 16z"/><path d="M10 19h4"/>',
    ai: '<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3zM18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15z"/>',
    integrations: '<path d="M8 8V5a3 3 0 016 0v3M16 16v3a3 3 0 01-6 0v-3M7 12h10"/>'
  };
  const body = icons[name] || icons.general;
  return `<span class="os-hub-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg></span>`;
}

function osHubCard(item) {
  const classes = ["os-hub-card"];
  if (item.featured) classes.push("is-featured");
  if (item.tone) classes.push("tone-" + item.tone);
  return `<a class="${classes.join(" ")}" href="${item.href}">
    <div class="os-hub-card-top">
      ${osHubIcon(item.icon)}
      <span class="os-hub-arrow" aria-hidden="true">›</span>
    </div>
    <div class="os-hub-card-copy">
      <div class="os-hub-card-title-row">
        <h2>${item.title}</h2>
        ${item.meta ? `<small>${item.meta}</small>` : ""}
      </div>
      <p>${item.description}</p>
    </div>
  </a>`;
}

function osHubGrid(items, extraClass = "") {
  return `<section class="os-hub-grid ${extraClass}">${items.map(osHubCard).join("")}</section>`;
}

function profileHubContent(zh) {
  const prefix = zh ? "/zh-cn" : "/en";
  const items = zh ? [
    { title:"用户资料", meta:"个人空间", description:"头像、主页背景、个性签名、个人介绍、在线状态与兴趣标签。", href:`${prefix}/profile/details`, icon:"profile", featured:true, tone:"blue" },
    { title:"账户信息", meta:"账号", description:"查看账号 ID、邮箱、注册时间、最近登录与登录记录。", href:`${prefix}/profile/account`, icon:"account" },
    { title:"账户与安全", meta:"安全", description:"查看当前设备、登录历史与异常登录提示。", href:`${prefix}/settings/security`, icon:"shield" },
    { title:"偏好设置", meta:"偏好", description:"管理与个人使用体验相关的设置入口。", href:`${prefix}/profile/preferences`, icon:"preferences" },
    { title:"收藏链接", meta:"内容", description:"进入你的链接收藏与常用入口。", href:`${prefix}/info/links`, icon:"links" },
    { title:"私人存储", meta:"R2", description:"上传、下载并管理只属于当前账号的私人文件。", href:`${prefix}/settings/storage`, icon:"storage" }
  ] : [
    { title:"Profile Details", meta:"Personal", description:"Profile photo, background, signature, bio, presence, and interests.", href:`${prefix}/profile/details`, icon:"profile", featured:true, tone:"blue" },
    { title:"Account", meta:"Account", description:"Review account ID, email, registration time, recent sign-in, and login records.", href:`${prefix}/profile/account`, icon:"account" },
    { title:"Account & Security", meta:"Security", description:"Review the current device, login history, and risk alerts.", href:`${prefix}/settings/security`, icon:"shield" },
    { title:"Preferences", meta:"Preferences", description:"Manage entry points related to your personal experience.", href:`${prefix}/profile/preferences`, icon:"preferences" },
    { title:"Saved Links", meta:"Content", description:"Open your saved links and frequently used destinations.", href:`${prefix}/info/links`, icon:"links" },
    { title:"Private Storage", meta:"R2", description:"Upload, download, and manage files private to this account.", href:`${prefix}/settings/storage`, icon:"storage" }
  ];
  return osHubGrid(items, "profile-hub-grid");
}

function adminHubContent(zh) {
  const prefix = zh ? "/zh-cn" : "/en";
  const items = zh ? [
    { title:"通用", meta:"管理概览", description:"账户统计、近期登录、操作日志与系统风险信号。", href:`${prefix}/admin/general`, icon:"general", featured:true, tone:"blue" },
    { title:"用户管理", meta:"成员", description:"搜索用户，查看资料并调整角色或账号状态。", href:`${prefix}/admin/users`, icon:"users" },
    { title:"角色权限", meta:"RBAC", description:"查看角色范围并管理管理员、编辑者与普通成员权限。", href:`${prefix}/admin/roles`, icon:"roles" },
    { title:"操作日志", meta:"审计", description:"按动作、级别、用户和日期筛选管理操作记录。", href:`${prefix}/admin/logs`, icon:"logs" },
    { title:"系统状态", meta:"系统", description:"查看管理能力与运行状态相关信息。", href:`${prefix}/admin/system`, icon:"system" }
  ] : [
    { title:"General", meta:"Overview", description:"Account metrics, recent sign-ins, operation logs, and system risk signals.", href:`${prefix}/admin/general`, icon:"general", featured:true, tone:"blue" },
    { title:"Users", meta:"Members", description:"Search users, review profiles, and adjust roles or account status.", href:`${prefix}/admin/users`, icon:"users" },
    { title:"Roles", meta:"RBAC", description:"Review role scopes and manage administrator, editor, and member permissions.", href:`${prefix}/admin/roles`, icon:"roles" },
    { title:"Logs", meta:"Audit", description:"Filter administration records by action, severity, user, and date.", href:`${prefix}/admin/logs`, icon:"logs" },
    { title:"System", meta:"System", description:"Review management capabilities and runtime-related status information.", href:`${prefix}/admin/system`, icon:"system" }
  ];
  return osHubGrid(items, "admin-hub-grid");
}

function settingsHubContent(zh) {
  const prefix = zh ? "/zh-cn" : "/en";
  const items = zh ? [
    { title:"通用", meta:"基础", description:"查看网站基础行为与常用设置入口。", href:`${prefix}/settings/general`, icon:"general", featured:true, tone:"blue" },
    { title:"外观", meta:"可用", description:"切换浅色与深色显示模式。", href:`${prefix}/settings/appearance`, icon:"appearance" },
    { title:"语言", meta:"可用", description:"在中文与 English 之间切换网页语言。", href:`${prefix}/settings/language`, icon:"language" },
    { title:"账户与安全", meta:"可用", description:"查看设备、登录历史与安全记录。", href:`${prefix}/settings/security`, icon:"shield" },
    { title:"通知", meta:"规划中", description:"管理提醒、站内消息与通知偏好。", href:`${prefix}/settings/notifications`, icon:"notifications" },
    { title:"AI 设置", meta:"规划中", description:"管理 AI Provider、模型与个人 AI 偏好。", href:`${prefix}/settings/ai`, icon:"ai" },
    { title:"第三方集成", meta:"规划中", description:"管理外部服务与账号授权。", href:`${prefix}/settings/integrations`, icon:"integrations" },
    { title:"存储管理", meta:"已连接", description:"管理当前账号的私人 Cloudflare R2 文件。", href:`${prefix}/settings/storage`, icon:"storage" }
  ] : [
    { title:"General", meta:"Basics", description:"Review general site behavior and common settings entry points.", href:`${prefix}/settings/general`, icon:"general", featured:true, tone:"blue" },
    { title:"Appearance", meta:"Available", description:"Switch between light and dark display modes.", href:`${prefix}/settings/appearance`, icon:"appearance" },
    { title:"Language", meta:"Available", description:"Switch the interface between Chinese and English.", href:`${prefix}/settings/language`, icon:"language" },
    { title:"Account & Security", meta:"Available", description:"Review devices, login history, and security records.", href:`${prefix}/settings/security`, icon:"shield" },
    { title:"Notifications", meta:"Planned", description:"Manage reminders, in-app messages, and notification preferences.", href:`${prefix}/settings/notifications`, icon:"notifications" },
    { title:"AI Settings", meta:"Planned", description:"Manage AI providers, models, and personal AI preferences.", href:`${prefix}/settings/ai`, icon:"ai" },
    { title:"Integrations", meta:"Planned", description:"Manage external services and account authorizations.", href:`${prefix}/settings/integrations`, icon:"integrations" },
    { title:"Storage", meta:"Connected", description:"Manage private Cloudflare R2 files for this account.", href:`${prefix}/settings/storage`, icon:"storage" }
  ];
  return osHubGrid(items, "settings-hub-grid");
}

function settingsGeneralContent(zh) {
  const prefix = zh ? "/zh-cn" : "/en";
  const rows = zh ? [
    ["外观", "浅色 / 深色", `${prefix}/settings/appearance`, "appearance"],
    ["语言", "中文 / English", `${prefix}/settings/language`, "language"],
    ["账户与安全", "设备与登录", `${prefix}/settings/security`, "shield"]
  ] : [
    ["Appearance", "Light / Dark", `${prefix}/settings/appearance`, "appearance"],
    ["Language", "Chinese / English", `${prefix}/settings/language`, "language"],
    ["Account & Security", "Devices & sign-ins", `${prefix}/settings/security`, "shield"]
  ];
  return `
    <section class="os-card settings-general-card">
      <div class="settings-general-heading">
        ${osHubIcon("general")}
        <div>
          <small>${zh ? "通用设置" : "General Settings"}</small>
          <h2>${zh ? "基础与常用设置" : "Basics & Common Settings"}</h2>
          <p>${zh ? "这里保留跨模块的基础设置入口。具体选项仍在各自页面中管理，避免把不同层级的控制混在一起。" : "This page keeps cross-module basics together. Detailed controls remain on their dedicated pages instead of mixing unrelated levels."}</p>
        </div>
      </div>
      <div class="settings-general-list">
        ${rows.map(row => `<a href="${row[2]}">${osHubIcon(row[3])}<span><strong>${row[0]}</strong><small>${row[1]}</small></span><b aria-hidden="true">›</b></a>`).join("")}
      </div>
    </section>
    <section class="os-card settings-general-note">
      <strong>${zh ? "关于通用设置" : "About General"}</strong>
      <p>${zh ? "当前没有为尚未接入的功能创建无实际作用的开关。等对应服务具备真实配置与持久化能力后，再在这里加入可操作选项。" : "No placeholder switches are shown for features that are not connected yet. Controls will appear here only when they have real configuration and persistence behind them."}</p>
    </section>
  `;
}
function profileContent(path, zh) {
  if (path === "/profile") return profileHubContent(zh);
  if (path.endsWith("/account")) return accountAuditContent(zh);

  if (path.endsWith("/preferences")) return `<section class="os-card is-large"><h2>${zh ? "偏好设置" : "Preferences"}</h2><p>${zh ? "主题和语言可通过页面右上角按钮切换。字体和通知偏好目前没有保存或配置接口。" : "Theme and language can be switched with the controls in the top-right corner. Font and notification preferences do not currently have configuration or persistence APIs."}</p></section>`;
  return `
    <section id="profile-summary" class="profile-home" data-profile-home>
      <div id="profile-cover" class="profile-cover" data-cover-style="aurora">
        <div class="profile-cover-noise" aria-hidden="true"></div>
        <div class="profile-cover-actions">
          <button id="profile-edit-button" class="profile-pill-button" type="button">${zh ? "编辑资料" : "Edit profile"}</button>
        </div>
      </div>

      <div class="profile-identity">
        <div id="profile-avatar" class="os-avatar profile-avatar-large">...</div>
        <div class="profile-identity-copy">
          <div class="profile-name-row">
            <h2 id="profile-display-name">${zh ? "正在读取账号资料..." : "Loading account profile..."}</h2>
            <span class="profile-name-lock" title="${zh ? "姓名不可修改" : "Name cannot be changed"}">🔒</span>
          </div>
          <p id="profile-email">...</p>
          <div id="profile-tags" class="os-chip-row"></div>
          <p id="profile-signature" class="profile-signature"></p>
        </div>
      </div>

      <div class="profile-home-grid">
        <article class="profile-section-card profile-about-card">
          <div class="profile-section-head">
            <div>
              <span class="profile-eyebrow">${zh ? "关于我" : "About"}</span>
              <h3>${zh ? "个人介绍" : "Profile"}</h3>
            </div>
          </div>
          <p id="profile-bio" class="profile-bio">${zh ? "还没有填写个人介绍。" : "No bio yet."}</p>
          <div class="profile-meta-row">
            <span id="profile-presence" class="profile-presence">✨ ${zh ? "在线" : "Online"}</span>
            <span id="profile-location" class="profile-location"></span>
          </div>
          <div id="profile-interests" class="profile-interest-list"></div>
        </article>

        <article class="profile-section-card">
          <div class="profile-section-head">
            <div>
              <span class="profile-eyebrow">${zh ? "快捷入口" : "Quick access"}</span>
              <h3>${zh ? "我的空间" : "My space"}</h3>
            </div>
          </div>
          <div class="profile-quick-grid">
            <a href="${zh ? "/zh-cn/profile/account" : "/en/profile/account"}"><span>◷</span><strong>${zh ? "账户信息" : "Account"}</strong><small>${zh ? "登录、设备与审计" : "Sign-in, devices & audit"}</small></a>
            <a href="${zh ? "/zh-cn/settings/storage" : "/en/settings/storage"}"><span>☁︎</span><strong>${zh ? "私人存储" : "Private storage"}</strong><small>${zh ? "管理 R2 文件" : "Manage R2 files"}</small></a>
            <a href="${zh ? "/zh-cn/info/links" : "/en/info/links"}"><span>⌘</span><strong>${zh ? "收藏链接" : "Saved links"}</strong><small>${zh ? "信息中心入口" : "Information center"}</small></a>
            <a href="${zh ? "/zh-cn/profile/preferences" : "/en/profile/preferences"}"><span>⚙︎</span><strong>${zh ? "偏好设置" : "Preferences"}</strong><small>${zh ? "外观与语言" : "Appearance & language"}</small></a>
          </div>
        </article>
      </div>

      <article class="profile-section-card profile-links-card">
        <div class="profile-section-head">
          <div>
            <span class="profile-eyebrow">${zh ? "联系与链接" : "Contact & links"}</span>
            <h3>${zh ? "我的链接库" : "My link library"}</h3>
            <p>${zh ? "把 QQ、GitHub、Bilibili、X、个人网站或其他入口集中在这里。" : "Keep QQ, GitHub, Bilibili, X, personal sites, and other destinations in one place."}</p>
          </div>
          <button id="profile-add-link" class="profile-pill-button profile-pill-secondary" type="button">＋ ${zh ? "添加链接" : "Add link"}</button>
        </div>
        <div id="profile-link-list" class="profile-link-list"></div>
      </article>
    </section>

    <div id="profile-sheet-backdrop" class="profile-sheet-backdrop" hidden></div>

    <aside id="profile-edit-sheet" class="profile-sheet" aria-hidden="true">
      <div class="profile-sheet-grabber" aria-hidden="true"></div>
      <div class="profile-sheet-head">
        <div><span class="profile-eyebrow">${zh ? "个人主页" : "Profile"}</span><h3>${zh ? "编辑资料" : "Edit profile"}</h3></div>
        <button class="profile-sheet-close" type="button" data-close-profile-sheet aria-label="${zh ? "关闭" : "Close"}">×</button>
      </div>
      <div class="profile-sheet-body">
        <label class="profile-field"><span>${zh ? "姓名" : "Name"}</span><input id="profile-readonly-name" type="text" readonly aria-readonly="true"><small>${zh ? "姓名由账号资料确定，不允许在个人主页中修改。" : "Your name comes from your account profile and cannot be changed here."}</small></label>
        <div class="profile-field">
          <span>${zh ? "头像" : "Profile photo"}</span>
          <div class="profile-media-editor">
            <div id="profile-avatar-preview" class="profile-media-preview profile-avatar-preview"></div>
            <div class="profile-media-copy"><strong>${zh ? "更换头像" : "Change profile photo"}</strong><small>${zh ? "支持 JPG、PNG、WebP，最大 5 MB。头像会保存到你的账号资料中。" : "JPG, PNG, or WebP up to 5 MB. Your photo is saved to your account profile."}</small><button id="profile-avatar-choose" class="profile-inline-button" type="button">${zh ? "选择图片" : "Choose image"}</button></div>
            <input id="profile-avatar-file" type="file" accept="image/jpeg,image/png,image/webp" hidden>
          </div>
        </div>
        <div class="profile-field">
          <span>${zh ? "自定义背景" : "Custom background"}</span>
          <div class="profile-media-editor">
            <div id="profile-background-preview" class="profile-media-preview profile-background-preview"></div>
            <div class="profile-media-copy"><strong>${zh ? "上传封面背景" : "Upload cover background"}</strong><small>${zh ? "支持 JPG、PNG、WebP，最大 8 MB。上传图片后会覆盖下面的主页配色；清除后会恢复配色。" : "JPG, PNG, or WebP up to 8 MB. An uploaded image overrides the color preset below; clearing it restores the preset."}</small><div class="profile-media-actions"><button id="profile-background-choose" class="profile-inline-button" type="button">${zh ? "选择图片" : "Choose image"}</button><button id="profile-background-clear" class="profile-inline-button secondary" type="button">${zh ? "清除背景" : "Clear background"}</button></div></div>
            <input id="profile-background-file" type="file" accept="image/jpeg,image/png,image/webp" hidden>
          </div>
        </div>
        <label class="profile-field"><span>${zh ? "个性签名" : "Signature"}</span><input id="profile-edit-signature" type="text" maxlength="80" placeholder="${zh ? "一句话介绍现在的你" : "A short line about you"}"><small>${zh ? "会显示在姓名与邮箱下方，建议控制在一句话内。" : "Shown under your name and email. Keep it to one concise line."}</small></label>
        <label class="profile-field"><span>${zh ? "个人介绍" : "Bio"}</span><textarea id="profile-edit-bio" maxlength="500" rows="5" placeholder="${zh ? "介绍你的兴趣、方向或正在做的事" : "Share your interests, focus, or what you are working on"}"></textarea><small>${zh ? "用于“关于我”区域，适合写长期兴趣、学习方向或正在进行的项目。" : "Used in the About section for longer-term interests, focus areas, or current projects."}</small></label>
        <label class="profile-field"><span>${zh ? "所在地" : "Location"}</span><input id="profile-edit-location" type="text" maxlength="80" placeholder="${zh ? "例如：苏州" : "For example: Suzhou"}"><small>${zh ? "仅填写你愿意公开展示的城市或地区，不建议填写具体住址。" : "Only add a city or region you are comfortable showing. Avoid a precise address."}</small></label>
        <div class="profile-field"><span>${zh ? "在线状态" : "Status"}</span><div class="profile-status-editor"><select id="profile-edit-status-kind"><option value="online">${zh ? "在线" : "Online"}</option><option value="focus">${zh ? "专注中" : "Focus"}</option><option value="busy">${zh ? "忙碌" : "Busy"}</option><option value="away">${zh ? "离开" : "Away"}</option><option value="offline">${zh ? "隐身" : "Offline"}</option></select><input id="profile-edit-status-emoji" type="text" maxlength="8" value="✨" aria-label="${zh ? "状态表情" : "Status emoji"}"><input id="profile-edit-status-text" type="text" maxlength="80" placeholder="${zh ? "自定义状态文字" : "Custom status text"}"></div></div>
        <label class="profile-field"><span>${zh ? "兴趣标签" : "Interests"}</span><input id="profile-edit-interests" type="text" placeholder="${zh ? "用逗号分隔，例如：统计学, AI, 骑行" : "Comma-separated, e.g. Statistics, AI, Cycling"}"><small>${zh ? "最多 12 个标签。" : "Up to 12 tags."}</small></label>
        <div class="profile-field"><span>${zh ? "主页配色" : "Profile cover"}</span><div id="profile-cover-picker" class="profile-cover-picker">${["aurora","sky","sunset","grape","graphite","mint"].map(value => `<button type="button" data-cover-choice="${value}" aria-label="${value}"><span data-cover-style="${value}"></span></button>`).join("")}</div></div>
      </div>
      <div class="profile-sheet-actions"><button id="profile-save-button" class="profile-save-button" type="button">${zh ? "保存" : "Save"}</button></div>
    </aside>

    <aside id="profile-link-sheet" class="profile-sheet profile-link-sheet" aria-hidden="true">
      <div class="profile-sheet-grabber" aria-hidden="true"></div>
      <div class="profile-sheet-head">
        <div><span class="profile-eyebrow">${zh ? "链接库" : "Link library"}</span><h3 id="profile-link-sheet-title">${zh ? "添加链接" : "Add link"}</h3></div>
        <button class="profile-sheet-close" type="button" data-close-profile-link-sheet aria-label="${zh ? "关闭" : "Close"}">×</button>
      </div>
      <div class="profile-sheet-body">
        <input id="profile-link-id" type="hidden">
        <div class="profile-link-presets"><button type="button" data-link-preset="QQ">QQ</button><button type="button" data-link-preset="GitHub">GitHub</button><button type="button" data-link-preset="Bilibili">Bilibili</button><button type="button" data-link-preset="X">X</button><button type="button" data-link-preset="${zh ? "个人网站" : "Website"}">${zh ? "个人网站" : "Website"}</button></div>
        <label class="profile-field"><span>${zh ? "名称" : "Title"}</span><input id="profile-link-title" type="text" maxlength="50" placeholder="QQ / GitHub / Website"></label>
        <label class="profile-field"><span>${zh ? "链接" : "URL"}</span><input id="profile-link-url" type="url" maxlength="1024" placeholder="https://"></label>
        <label class="profile-field"><span>${zh ? "分类" : "Category"}</span><select id="profile-link-category"><option value="social">${zh ? "社交" : "Social"}</option><option value="developer">${zh ? "开发者" : "Developer"}</option><option value="site">${zh ? "网站" : "Website"}</option><option value="contact">${zh ? "联系方式" : "Contact"}</option><option value="other">${zh ? "其他" : "Other"}</option></select></label>
        <label class="profile-field"><span>${zh ? "备注" : "Note"}</span><input id="profile-link-note" type="text" maxlength="140" placeholder="${zh ? "可选" : "Optional"}"></label>
        <label class="profile-pin-row"><input id="profile-link-pinned" type="checkbox"><span>${zh ? "置顶这个链接" : "Pin this link"}</span></label>
      </div>
      <div class="profile-sheet-actions"><button id="profile-link-save" class="profile-save-button" type="button">${zh ? "保存链接" : "Save link"}</button></div>
    </aside>
  `;
}
function accountAuditContent(zh) {
  return `
    <section class="audit-grid">
      <article class="os-card is-large">
        <h2>${zh ? "账号基本信息" : "Account Information"}</h2>
        <dl class="audit-facts">
          <div><dt>${zh ? "注册时间" : "Registered at"}</dt><dd id="audit-created-at">...</dd></div>
          <div><dt>${zh ? "账号 ID" : "Account ID"}</dt><dd id="audit-user-id">...</dd></div>
          <div><dt>${zh ? "邮箱" : "Email"}</dt><dd id="audit-email">...</dd></div>
          <div><dt>${zh ? "最近登录" : "Last sign-in"}</dt><dd id="audit-last-sign-in">...</dd></div>
        </dl>
      </article>
      <article class="os-card">
        <h2>${zh ? "最近审计统计" : "Recent Audit Stats"}</h2>
        <div class="audit-stats">
          <span><strong id="audit-login-count">0</strong>${zh ? "最近登录记录" : "recent events"}</span>
          <span><strong id="audit-device-count">0</strong>${zh ? "最近设备" : "recent devices"}</span>
          <span><strong id="audit-risk-count">0</strong>${zh ? "最近风险" : "recent risks"}</span>
        </div>
      </article>
    </section>
    <section class="os-card audit-section">
      <h2>${zh ? "登录记录" : "Login Records"}</h2>
      <div id="audit-login-table" class="audit-table"></div>
    </section>
  `;
}

function securityAuditContent(zh) {
  return `
    <section class="os-card audit-section">
      <h2>${zh ? "当前设备" : "Current Device"}</h2>
      <div id="audit-current-device" class="audit-current">...</div>
    </section>
    <section class="os-card audit-section">
      <h2>${zh ? "登录设备列表" : "Login Devices"}</h2>
      <div id="audit-device-list" class="audit-devices"></div>
    </section>
    <section class="os-card audit-section">
      <h2>${zh ? "登录历史" : "Login History"}</h2>
      <div id="audit-login-timeline" class="audit-timeline"></div>
    </section>
    <section class="os-card audit-section">
      <h2>${zh ? "异常登录提示" : "Risk Alerts"}</h2>
      <div id="audit-risk-alerts" class="audit-alerts"></div>
    </section>
  `;
}

function workspaceContent(path, zh) {
  if (path.endsWith("/workbench")) return statusContent(zh, "工作台数据尚未接入", "工作台是工作区中的主要操作界面；当前尚未建立独立的持久化工作台数据模型。", "Workbench data is not connected yet", "The Workbench is the primary operating surface inside Workspace; a dedicated persistent workbench data model has not been established yet.");
  if (path.endsWith("/projects")) return statusContent(zh, "项目数据尚未接入", "当前数据库没有 projects 表，因此不展示项目名称、状态或完成百分比。", "Project data is not connected yet", "There is no projects table in the current database, so project names, statuses, and completion percentages are not shown.");
  if (path.endsWith("/experiments")) return statusContent(zh, "实验工具尚未接入", "Prompt、Agent 和 API 实验目前没有持久化数据或独立工具接口。", "Experiment tools are not connected yet", "Prompt, agent, and API experiments do not currently have persistent data or dedicated tool APIs.");
  if (path.endsWith("/drafts")) return statusContent(zh, "草稿存储尚未接入", "当前数据库没有 drafts 表或草稿保存接口。", "Draft storage is not connected yet", "There is no drafts table or draft persistence API yet.");
  if (path.endsWith("/tasks")) return statusContent(zh, "任务数据尚未接入", "当前数据库没有 tasks 表，因此不展示 Todo 或 Kanban 数据。", "Task data is not connected yet", "There is no tasks table in the current database, so Todo or Kanban data is not shown.");
  return statusContent(zh, "工作区数据尚未接入", "项目、实验、草稿和任务目前没有统一的持久化工作区数据模型。", "Workspace data is not connected yet", "Projects, experiments, drafts, and tasks do not yet have a unified persistent workspace data model.");
}

function adminContent(path, zh) {
  if (path === "/admin") return adminHubContent(zh);
  if (path.endsWith("/general")) return adminOverviewContent(zh);
  if (path.endsWith("/users")) return adminUsersContent(zh);
  if (path.endsWith("/roles")) return adminRolesContent(zh);
  if (path.endsWith("/logs")) return adminLogsContent(zh);
  if (path.endsWith("/system")) return `<section class="os-card is-large"><h2>${zh ? "系统状态" : "System Status"}</h2><p>${zh ? "当前管理界面尚未接入运行状态、存储占用与容量统计等监控数据；账户、权限与审计相关信息仍可在对应管理页面查看。" : "Runtime health, storage usage, and capacity metrics are not yet available in the management interface. Account, permission, and audit information remains available in the corresponding administration pages."}</p></section>`;
  return adminOverviewContent(zh);
}

function adminOverviewContent(zh) {
  const labels = zh
    ? ["用户总数", "管理员数量"]
    : ["Total Users", "Admins"];
  return `
    <section class="admin-scan">
      <span></span>
      <strong>${zh ? "管理数据概览" : "Admin Data Overview"}</strong>
      <p>${zh ? "汇总用户、角色、权限和操作日志。" : "Overview of users, roles, permissions, and operation logs."}</p>
    </section>
    <section class="admin-metrics" id="admin-overview-metrics">
      ${labels.map((label, index) => `<article class="admin-motion-card admin-skeleton" style="--stagger:${index}"><span>${label}</span><strong data-admin-metric="${index}">0</strong></article>`).join("")}
    </section>
    <section class="admin-dashboard-grid">
      <article class="os-card admin-section-card">
        <div class="admin-section-head"><h2>${zh ? "最近登录用户" : "Recent Login Users"}</h2><span class="status-pulse"></span></div>
        <div id="admin-recent-users" class="admin-list-skeleton"></div>
      </article>
      <article class="os-card admin-section-card">
        <div class="admin-section-head"><h2>${zh ? "最近操作日志" : "Recent Operation Logs"}</h2><button class="admin-ghost" data-admin-nav="/admin/logs">${zh ? "查看全部" : "View all"}</button></div>
        <div id="admin-recent-logs" class="admin-log-list admin-list-skeleton"></div>
      </article>
      <article class="os-card admin-section-card danger-event-card">
        <div class="admin-section-head"><h2>${zh ? "系统风险提示" : "System Risk Signals"}</h2><span>${zh ? "审计规则" : "Audit rules"}</span></div>
        <div id="admin-risk-list" class="admin-risk-list admin-list-skeleton"></div>
      </article>
    </section>
  `;
}

function adminUsersContent(zh) {
  const roleOptions = zh ? [["", "全部角色"], ["admin", "管理员"], ["editor", "编辑者"], ["user", "普通成员"]] : [["", "All roles"], ["admin", "Administrator"], ["editor", "Editor"], ["user", "Member"]];
  const statusOptions = zh ? [["", "全部状态"], ["active", "正常"], ["suspended", "已停用"], ["banned", "已封禁"]] : [["", "All status"], ["active", "active"], ["suspended", "suspended"], ["banned", "banned"]];
  return `
    <section class="admin-toolbar os-card">
      <input id="admin-user-search" class="os-search" placeholder="${zh ? "搜索用户、邮箱、ID..." : "Search users, email, ID..."}">
      <select id="admin-role-filter">${roleOptions.map(option => `<option value="${option[0]}">${option[1]}</option>`).join("")}</select>
      <select id="admin-status-filter">${statusOptions.map(option => `<option value="${option[0]}">${option[1]}</option>`).join("")}</select>
    </section>
    <section class="os-card admin-table-card">
      <div class="admin-section-head"><h2>${zh ? "用户列表" : "Users"}</h2><span id="admin-users-count">0</span></div>
      <div id="admin-users-table" class="admin-data-table admin-user-table admin-list-skeleton"></div>
    </section>
    <section class="os-card admin-detail-card" id="admin-user-detail">
      <h2>${zh ? "用户详情" : "User Detail"}</h2>
      <div id="admin-user-detail-body" class="admin-empty">${zh ? "选择一位用户查看最近登录和操作记录。" : "Select a user to review recent logins and operations."}</div>
    </section>
  `;
}

function adminRolesContent(zh) {
  return `
    <section class="os-card admin-role-summary">
      <div class="admin-section-head">
        <h2>${zh ? "RBAC 角色权限" : "RBAC Roles"}</h2>
        <button id="admin-save-permissions" class="admin-primary" disabled>${zh ? "保存权限" : "Save permissions"}</button>
      </div>
      <p>${zh ? "角色用于控制成员可访问的功能。普通成员适合日常使用，不具备用户管理、角色权限调整或管理级审计访问能力；管理员与编辑者应仅授予确有需要的账号。所有权限调整都会保留操作记录。" : "Roles control which features members can access. Members are intended for everyday use and cannot manage users, change role permissions, or access administrator-only audit data. Administrator and editor roles should be granted only when needed. Permission changes are recorded."}</p>
      <div id="admin-unsaved-bar" class="admin-unsaved" hidden>${zh ? "有未保存的权限变更" : "Unsaved permission changes"}</div>
    </section>
    <section id="admin-role-cards" class="admin-role-cards admin-list-skeleton"></section>
    <section class="os-card admin-table-card">
      <div class="admin-section-head"><h2>${zh ? "权限矩阵" : "Permission Matrix"}</h2><span>${zh ? "分组开关" : "Grouped switches"}</span></div>
      <div id="admin-permission-matrix" class="admin-permission-matrix admin-list-skeleton"></div>
    </section>
  `;
}

function adminLogsContent(zh) {
  const actions = zh
    ? [["", "全部动作"], ["auth.login.failed", "登录失败"], ["user.role.update", "修改用户角色"], ["user.ban", "封禁用户"], ["user.unban", "解除封禁"], ["user.suspend", "停用用户"], ["role.permissions.update", "修改角色权限"]]
    : [["", "All actions"], ["auth.login.failed", "auth.login.failed"], ["user.role.update", "user.role.update"], ["user.ban", "user.ban"], ["user.unban", "user.unban"], ["user.suspend", "user.suspend"], ["role.permissions.update", "role.permissions.update"]];
  const severities = zh ? [["", "全部级别"], ["info", "信息"], ["warning", "警告"], ["danger", "危险"]] : [["", "All severity"], ["info", "info"], ["warning", "warning"], ["danger", "danger"]];
  return `
    <section class="admin-toolbar os-card">
      <input id="admin-log-search" class="os-search" placeholder="${zh ? "搜索描述、对象、动作..." : "Search description, target, action..."}">
      <select id="admin-log-action">${actions.map(action => `<option value="${action[0]}">${action[1]}</option>`).join("")}</select>
      <select id="admin-log-severity">${severities.map(severity => `<option value="${severity[0]}">${severity[1]}</option>`).join("")}</select>
      <input id="admin-log-actor" placeholder="${zh ? "用户邮箱 / ID" : "Actor email / ID"}">
      <input id="admin-log-from" type="date">
      <input id="admin-log-to" type="date">
    </section>
    <section class="os-card admin-table-card">
      <div class="admin-section-head"><h2>${zh ? "操作日志" : "Operation Logs"}</h2><span id="admin-logs-count">0</span></div>
      <div id="admin-logs-list" class="admin-log-timeline admin-list-skeleton"></div>
    </section>
    <aside id="admin-log-drawer" class="admin-drawer" aria-hidden="true">
      <button id="admin-log-drawer-close" class="admin-ghost">×</button>
      <div id="admin-log-drawer-body"></div>
    </aside>
  `;
}

function storageSettingsContent(zh) {
  const copy = zh ? {
    connected: "已连接",
    checking: "检查中",
    files: "文件",
    used: "已用空间",
    refreshed: "最近更新",
    select: "选择文件",
    refresh: "刷新",
    search: "搜索文件名",
    name: "文件名",
    type: "类型",
    size: "大小",
    uploaded: "上传时间",
    actions: "操作",
    download: "下载",
    remove: "删除",
    loading: "正在读取你的私人文件…",
    empty: "还没有文件。选择文件后即可上传到你的私人存储空间。",
    partial: "文件数量较多，当前统计仅包含前 10,000 个对象。",
    uploadIdle: "每个文件最大 50 MB，文件会逐个上传。",
    storage: "Cloudflare R2",
    unavailable: "存储服务暂时不可用。",
    notAuthorized: "当前账号不可使用私人存储。",
    signInAgain: "登录状态已失效，请重新登录。",
    login: "前往登录",
    deleteConfirm: "确定要删除“{name}”吗？此操作无法撤销。",
    uploadComplete: "已上传 {count} 个文件。",
    uploadFailed: "上传失败：{message}",
    uploading: "正在上传 {current}/{total} · {name}",
    deleting: "正在删除 {name}…",
    downloadFailed: "下载失败：{message}",
    deleteFailed: "删除失败：{message}",
    refreshedNow: "刚刚",
    tooLarge: "“{name}”超过 50 MB，未上传。",
    connectionDescription: "文件仅对当前账号可见，并通过已登录的 Worker API 安全存取；浏览器不会直接访问 R2。"
  } : {
    connected: "Connected",
    checking: "Checking",
    files: "Files",
    used: "Used",
    refreshed: "Updated",
    select: "Choose Files",
    refresh: "Refresh",
    search: "Search files",
    name: "File name",
    type: "Type",
    size: "Size",
    uploaded: "Uploaded",
    actions: "Actions",
    download: "Download",
    remove: "Delete",
    loading: "Loading your private files…",
    empty: "No files yet. Choose files to upload them to your private storage.",
    partial: "There are many files; this statistic includes only the first 10,000 objects.",
    uploadIdle: "50 MB maximum per file. Files upload one at a time.",
    storage: "Cloudflare R2",
    unavailable: "Storage service is temporarily unavailable.",
    notAuthorized: "This account is not allowed to use private storage.",
    signInAgain: "Your session has expired. Please sign in again.",
    login: "Sign in",
    deleteConfirm: "Delete “{name}”? This cannot be undone.",
    uploadComplete: "Uploaded {count} files.",
    uploadFailed: "Upload failed: {message}",
    uploading: "Uploading {current}/{total} · {name}",
    deleting: "Deleting {name}…",
    downloadFailed: "Download failed: {message}",
    deleteFailed: "Delete failed: {message}",
    refreshedNow: "Just now",
    tooLarge: "“{name}” exceeds 50 MB and was not uploaded.",
    connectionDescription: "Files are private to the current account and accessed securely through the signed-in Worker API; the browser never connects to R2 directly."
  };

  return `
    <section id="storage-manager" class="storage-manager">
      <section class="storage-overview-panel">
        <div class="storage-overview-copy">
          <div class="storage-service-line">
            <span class="storage-status-dot" aria-hidden="true"></span>
            <strong>${copy.storage}</strong>
            <span id="storage-connection" class="storage-connection-state">${copy.checking}</span>
          </div>
          <p>${copy.connectionDescription}</p>
        </div>
        <div class="storage-overview-stats">
          <div class="storage-stat">
            <span>${copy.files}</span>
            <strong id="storage-file-count">—</strong>
          </div>
          <div class="storage-stat">
            <span>${copy.used}</span>
            <strong id="storage-used-bytes">—</strong>
          </div>
          <div class="storage-refresh-group">
            <div>
              <span>${copy.refreshed}</span>
              <strong id="storage-refreshed-at">—</strong>
            </div>
            <button id="storage-refresh-button" class="storage-refresh-button" type="button" aria-label="${copy.refresh}" title="${copy.refresh}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6v5h-5"/><path d="M19 11a7 7 0 1 0 1 4"/></svg>
            </button>
          </div>
        </div>
      </section>

      <section class="storage-toolbar">
        <button id="storage-upload-button" class="storage-upload-button" type="button">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
          <span>${copy.select}</span>
        </button>
        <input id="storage-file-input" type="file" multiple hidden>
        <label class="storage-search-shell">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg>
          <input id="storage-search" class="storage-search" type="search" placeholder="${copy.search}" aria-label="${copy.search}" autocomplete="off">
        </label>
      </section>

      <div class="storage-feedback">
        <p id="storage-upload-status" class="storage-upload-status">${copy.uploadIdle}</p>
        <p id="storage-api-status" class="storage-api-status" role="status"></p>
        <a id="storage-login-link" class="storage-login-link" href="#" hidden>${copy.login}</a>
      </div>

      <section class="storage-browser">
        <div class="storage-table" role="table" aria-label="${copy.files}">
          <div class="storage-file-row storage-file-head" role="row">
            <span role="columnheader">${copy.name}</span>
            <span role="columnheader">${copy.type}</span>
            <span role="columnheader">${copy.size}</span>
            <span role="columnheader">${copy.uploaded}</span>
            <span role="columnheader">${copy.actions}</span>
          </div>
          <div id="storage-file-list" class="storage-file-list" role="rowgroup"></div>
        </div>
        <p id="storage-partial-notice" class="storage-partial-notice" hidden>${copy.partial}</p>
      </section>
    </section>
  `;
}
function storageClientScript(zh, loginUrl) {
  const copy = zh ? {
    connected: "已连接",
    checking: "检查中",
    loading: "正在读取你的私人文件…",
    emptyTitle: "还没有文件",
    emptyHint: "选择文件后即可上传到你的私人存储空间。",
    noMatches: "没有匹配的文件。",
    unavailable: "存储服务暂时不可用。",
    notAuthorized: "当前账号不可使用私人存储。",
    signInAgain: "登录状态已失效，请重新登录。",
    login: "前往登录",
    download: "下载",
    remove: "删除",
    select: "选择文件",
    uploadIdle: "每个文件最大 50 MB，文件会逐个上传。",
    partial: "文件数量较多，当前统计仅包含前 10,000 个对象。",
    uploadComplete: "已上传 {count} 个文件。",
    uploadCompleteWithSkipped: "已上传 {count} 个文件，跳过 {skipped} 个超过 50 MB 的文件。",
    uploadFailed: "上传失败：{message}",
    uploading: "正在上传 {current}/{total} · {name}",
    deleting: "正在删除 {name}…",
    downloadFailed: "下载失败：{message}",
    deleteFailed: "删除失败：{message}",
    deleteConfirm: "确定要删除“{name}”吗？此操作无法撤销。",
    tooLarge: "“{name}”超过 50 MB，未上传。",
    refreshedNow: "刚刚"
  } : {
    connected: "Connected",
    checking: "Checking",
    loading: "Loading your private files…",
    emptyTitle: "No files yet",
    emptyHint: "Choose files to upload them to your private storage.",
    noMatches: "No matching files.",
    unavailable: "Storage service is temporarily unavailable.",
    notAuthorized: "This account is not allowed to use private storage.",
    signInAgain: "Your session has expired. Please sign in again.",
    login: "Sign in",
    download: "Download",
    remove: "Delete",
    select: "Choose Files",
    uploadIdle: "50 MB maximum per file. Files upload one at a time.",
    partial: "There are many files; this statistic includes only the first 10,000 objects.",
    uploadComplete: "Uploaded {count} files.",
    uploadCompleteWithSkipped: "Uploaded {count} files and skipped {skipped} files larger than 50 MB.",
    uploadFailed: "Upload failed: {message}",
    uploading: "Uploading {current}/{total} · {name}",
    deleting: "Deleting {name}…",
    downloadFailed: "Download failed: {message}",
    deleteFailed: "Delete failed: {message}",
    deleteConfirm: "Delete “{name}”? This cannot be undone.",
    tooLarge: "“{name}” exceeds 50 MB and was not uploaded.",
    refreshedNow: "Just now"
  };

  return `
    <script>
      (() => {
        const copy = ${JSON.stringify(copy)};
        const loginUrl = ${JSON.stringify(loginUrl)};
        const maximumBytes = ${MAX_STORAGE_FILE_BYTES};
        const STORAGE_CACHE_PREFIX = "qssed-storage-v2:";
        const root = document.getElementById("storage-manager");
        if (!root) return;

        const fileInput = document.getElementById("storage-file-input");
        const uploadButton = document.getElementById("storage-upload-button");
        const refreshButton = document.getElementById("storage-refresh-button");
        const searchInput = document.getElementById("storage-search");
        const fileList = document.getElementById("storage-file-list");
        const apiStatus = document.getElementById("storage-api-status");
        const uploadStatus = document.getElementById("storage-upload-status");
        const loginLink = document.getElementById("storage-login-link");
        const partialNotice = document.getElementById("storage-partial-notice");
        const connection = document.getElementById("storage-connection");
        const fileCount = document.getElementById("storage-file-count");
        const usedBytes = document.getElementById("storage-used-bytes");
        const refreshedAt = document.getElementById("storage-refreshed-at");

        let files = [];
        let partial = false;
        let currentFilter = "";
        let isBusy = false;
        let currentUserId = "";
        let storageCacheFingerprint = "";
        let hasStorageSnapshot = false;
        let refreshSequence = 0;

        class SessionExpiredError extends Error {}
        class StorageForbiddenError extends Error {}

        function message(template, values) {
          return Object.entries(values || {}).reduce((text, entry) => text.replace("{" + entry[0] + "}", entry[1]), template);
        }

        function formatBytes(bytes) {
          const value = Number(bytes) || 0;
          if (value < 1024) return value + " B";
          const units = ["KB", "MB", "GB", "TB"];
          let size = value / 1024;
          let index = 0;
          while (size >= 1024 && index < units.length - 1) { size /= 1024; index += 1; }
          return size.toLocaleString(undefined, { maximumFractionDigits: size >= 100 ? 0 : 1 }) + " " + units[index];
        }

        function formatDate(value) {
          if (!value) return "—";
          const date = new Date(value);
          return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
        }

        function formatRefreshTime(value) {
          const timestamp = Number(value) || Date.now();
          const date = new Date(timestamp);
          if (Number.isNaN(date.getTime())) return copy.refreshedNow;
          const age = Date.now() - timestamp;
          if (age < 60000) return copy.refreshedNow;
          const now = new Date();
          if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
          }
          return date.toLocaleDateString();
        }

        function setApiStatus(text, kind) {
          apiStatus.textContent = text || "";
          apiStatus.className = "storage-api-status" + (kind ? " is-" + kind : "");
        }

        function setUploadStatus(text, kind) {
          uploadStatus.textContent = text || "";
          uploadStatus.className = "storage-upload-status" + (kind ? " is-" + kind : "");
        }

        function storageCacheKey(userId) {
          return STORAGE_CACHE_PREFIX + String(userId || "");
        }

        function readStorageCache(userId) {
          if (!userId) return null;
          try {
            const parsed = JSON.parse(sessionStorage.getItem(storageCacheKey(userId)) || "null");
            return parsed && parsed.data && Array.isArray(parsed.data.files) ? parsed : null;
          } catch {
            return null;
          }
        }

        function writeStorageCache(data, fingerprint, refreshedAtValue) {
          if (!currentUserId) return;
          try {
            sessionStorage.setItem(storageCacheKey(currentUserId), JSON.stringify({
              fingerprint,
              refreshedAt: refreshedAtValue,
              data
            }));
          } catch {}
        }

        function clearStorageCache() {
          if (!currentUserId) return;
          try { sessionStorage.removeItem(storageCacheKey(currentUserId)); } catch {}
        }

        function storageFingerprint(data) {
          const normalizedFiles = (Array.isArray(data?.files) ? data.files : []).map(file => [
            file?.id || "",
            file?.name || "",
            Number(file?.size) || 0,
            file?.uploadedAt || "",
            file?.contentType || ""
          ]);
          return JSON.stringify([
            Number(data?.file_count) || 0,
            Number(data?.used_bytes) || 0,
            Boolean(data?.partial),
            normalizedFiles
          ]);
        }

        function resetMetrics() {
          fileCount.textContent = "—";
          usedBytes.textContent = "—";
          refreshedAt.textContent = "—";
          partial = false;
          partialNotice.hidden = true;
        }

        function setBusy(busy) {
          isBusy = busy;
          const unavailable = root.classList.contains("is-unavailable");
          uploadButton.disabled = busy || unavailable;
          refreshButton.disabled = busy;
          fileInput.disabled = busy || unavailable;
          root.querySelectorAll(".storage-action-button,.storage-empty-upload").forEach(button => {
            button.disabled = busy || unavailable;
          });
        }

        function clearStorageView() {
          resetMetrics();
          files = [];
          hasStorageSnapshot = false;
          renderFiles();
        }

        function showSessionExpired() {
          clearStorageCache();
          clearStorageView();
          root.classList.remove("is-checking", "is-stale");
          root.classList.add("is-unavailable");
          setApiStatus(copy.signInAgain, "error");
          loginLink.hidden = false;
          loginLink.href = loginUrl;
          connection.textContent = copy.signInAgain;
        }

        function showStorageForbidden() {
          clearStorageCache();
          clearStorageView();
          root.classList.remove("is-checking", "is-stale");
          root.classList.add("is-unavailable");
          loginLink.hidden = true;
          connection.textContent = copy.notAuthorized;
          setApiStatus(copy.notAuthorized, "error");
        }

        async function accessToken() {
          const result = await supabaseClient.auth.getSession();
          const token = result?.data?.session?.access_token;
          if (!token) throw new SessionExpiredError();
          return token;
        }

        async function storageRequest(path, options) {
          const token = await accessToken();
          const headers = new Headers(options?.headers || {});
          headers.set("Authorization", "Bearer " + token);
          let response;
          try {
            response = await fetch(path, { ...options, headers, cache: "no-store" });
          } catch {
            throw new Error(copy.unavailable);
          }
          if (response.status === 401) throw new SessionExpiredError();
          if (response.status === 403) throw new StorageForbiddenError();
          if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            const error = new Error(payload?.error || copy.unavailable);
            error.status = response.status;
            throw error;
          }
          return response;
        }

        function visibleFiles() {
          const query = currentFilter.trim().toLocaleLowerCase();
          return query ? files.filter(file => String(file.name || "").toLocaleLowerCase().includes(query)) : files;
        }

        function renderFiles() {
          const visible = visibleFiles();
          fileList.replaceChildren();

          if (!visible.length) {
            if (files.length) {
              const noMatches = document.createElement("div");
              noMatches.className = "storage-empty storage-empty-compact";
              noMatches.textContent = copy.noMatches;
              fileList.append(noMatches);
              return;
            }

            const empty = document.createElement("div");
            empty.className = "storage-empty";

            const icon = document.createElement("div");
            icon.className = "storage-empty-icon";
            icon.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5h5l1.5 2H20v8.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7.5Z"/><path d="M4 7.5V6a2 2 0 0 1 2-2h3l1.5 2H18a2 2 0 0 1 2 2v1.5"/></svg>';

            const title = document.createElement("strong");
            title.textContent = copy.emptyTitle;

            const hint = document.createElement("span");
            hint.textContent = copy.emptyHint;

            const choose = document.createElement("button");
            choose.type = "button";
            choose.className = "storage-empty-upload";
            choose.textContent = copy.select;
            choose.addEventListener("click", () => fileInput.click());

            empty.append(icon, title, hint, choose);
            fileList.append(empty);
            return;
          }

          visible.forEach(file => {
            const row = document.createElement("div");
            row.className = "storage-file-row";
            row.setAttribute("role", "row");

            const name = document.createElement("strong");
            name.className = "storage-file-name";
            name.textContent = file.name;
            name.title = file.name;

            const type = document.createElement("span");
            type.textContent = file.contentType || "application/octet-stream";

            const size = document.createElement("span");
            size.textContent = formatBytes(file.size);

            const uploaded = document.createElement("time");
            uploaded.dateTime = file.uploadedAt || "";
            uploaded.textContent = formatDate(file.uploadedAt);

            const actions = document.createElement("div");
            actions.className = "storage-actions";

            const download = document.createElement("button");
            download.type = "button";
            download.className = "storage-action-button";
            download.textContent = copy.download;
            download.addEventListener("click", () => void downloadFile(file, download));

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "storage-action-button is-danger";
            remove.textContent = copy.remove;
            remove.addEventListener("click", () => void deleteFile(file, remove));

            actions.append(download, remove);
            row.append(name, type, size, uploaded, actions);
            fileList.append(row);
          });
        }

        function renderMetrics(data, refreshedAtValue) {
          fileCount.textContent = String(Number(data.file_count) || 0) + (data.partial ? "+" : "");
          usedBytes.textContent = formatBytes(data.used_bytes);
          refreshedAt.textContent = formatRefreshTime(refreshedAtValue);
          partial = Boolean(data.partial);
          partialNotice.hidden = !partial;
          if (partial) partialNotice.textContent = copy.partial;
        }

        function applyStorageData(data, refreshedAtValue) {
          files = Array.isArray(data?.files) ? data.files : [];
          renderMetrics(data || {}, refreshedAtValue);
          renderFiles();
          hasStorageSnapshot = true;
        }

        async function refreshFiles(options) {
          const config = options || {};
          const force = Boolean(config.force);
          const silent = Boolean(config.silent);
          if (isBusy && !force) return;

          const sequence = ++refreshSequence;
          root.classList.remove("is-unavailable", "is-stale");
          loginLink.hidden = true;

          if (!silent) {
            root.classList.add("is-checking");
            refreshButton.classList.add("is-refreshing");
            refreshButton.setAttribute("aria-busy", "true");
            setBusy(true);
            setApiStatus(copy.loading, "loading");
          }

          try {
            const response = await storageRequest("/api/storage/files", { method: "GET" });
            const data = await response.json();
            if (sequence !== refreshSequence) return;

            const fingerprint = storageFingerprint(data);
            const changed = fingerprint !== storageCacheFingerprint;
            const refreshedAtValue = Date.now();

            storageCacheFingerprint = fingerprint;
            writeStorageCache(data, fingerprint, refreshedAtValue);

            if (changed || !hasStorageSnapshot || !config.preservePaint) {
              applyStorageData(data, refreshedAtValue);
            } else {
              refreshedAt.textContent = formatRefreshTime(refreshedAtValue);
            }

            root.classList.remove("is-checking", "is-unavailable", "is-stale");
            connection.textContent = copy.connected;
            setApiStatus("", "");
          } catch (error) {
            if (sequence !== refreshSequence) return;
            root.classList.remove("is-checking");

            if (error instanceof SessionExpiredError) {
              showSessionExpired();
            } else if (error instanceof StorageForbiddenError) {
              showStorageForbidden();
            } else if (silent && hasStorageSnapshot) {
              root.classList.add("is-stale");
              setApiStatus(error.message || copy.unavailable, "error");
            } else {
              clearStorageView();
              root.classList.add("is-unavailable");
              connection.textContent = copy.unavailable;
              setApiStatus(error.message || copy.unavailable, "error");
            }
          } finally {
            if (!silent) {
              refreshButton.classList.remove("is-refreshing");
              refreshButton.removeAttribute("aria-busy");
              setBusy(false);
            }
          }
        }

        async function initializeStorage() {
          try {
            const result = await supabaseClient.auth.getSession();
            const session = result?.data?.session;

            if (!session?.access_token || !session?.user?.id) {
              showSessionExpired();
              return;
            }

            currentUserId = String(session.user.id);
            const cached = readStorageCache(currentUserId);

            if (cached?.data) {
              storageCacheFingerprint = cached.fingerprint || storageFingerprint(cached.data);
              applyStorageData(cached.data, cached.refreshedAt);
              root.classList.remove("is-checking", "is-unavailable", "is-stale");
              connection.textContent = copy.connected;
              setApiStatus("", "");
              void refreshFiles({ silent: true, preservePaint: true });
              return;
            }

            root.classList.add("is-checking");
            setApiStatus(copy.loading, "loading");
            await refreshFiles({ force: true });
          } catch {
            showSessionExpired();
          }
        }

        async function uploadFiles(selected) {
          const queue = Array.from(selected || []);
          if (!queue.length || isBusy) return;

          refreshSequence += 1;
          const oversized = queue.filter(file => file.size > maximumBytes);
          const uploadQueue = queue.filter(file => file.size <= maximumBytes);

          if (!uploadQueue.length) {
            setUploadStatus(message(copy.tooLarge, { name: oversized[0]?.name || "file" }), "error");
            fileInput.value = "";
            return;
          }

          setBusy(true);
          let completed = 0;

          try {
            for (let index = 0; index < uploadQueue.length; index += 1) {
              const file = uploadQueue[index];
              setUploadStatus(message(copy.uploading, { current: index + 1, total: uploadQueue.length, name: file.name }), "loading");
              const response = await storageRequest("/api/storage/upload?name=" + encodeURIComponent(file.name), {
                method: "POST",
                headers: {
                  "Content-Type": file.type || "application/octet-stream",
                  "X-File-Size": String(file.size)
                },
                body: file
              });
              if (response.status === 201) completed += 1;
            }

            setUploadStatus(
              oversized.length
                ? message(copy.uploadCompleteWithSkipped, { count: completed, skipped: oversized.length })
                : message(copy.uploadComplete, { count: completed }),
              "success"
            );
            await refreshFiles({ force: true });
          } catch (error) {
            if (error instanceof SessionExpiredError) {
              showSessionExpired();
            } else if (error instanceof StorageForbiddenError) {
              showStorageForbidden();
            } else {
              setUploadStatus(message(copy.uploadFailed, { message: error.message || copy.unavailable }), "error");
              if (completed) await refreshFiles({ force: true });
            }
          } finally {
            fileInput.value = "";
            if (isBusy) setBusy(false);
          }
        }

        async function downloadFile(file, button) {
          button.disabled = true;
          try {
            const response = await storageRequest("/api/storage/object?id=" + encodeURIComponent(file.id), { method: "GET" });
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = objectUrl;
            anchor.download = file.name || "file";
            anchor.style.display = "none";
            document.body.append(anchor);
            anchor.click();
            anchor.remove();
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
          } catch (error) {
            if (error instanceof SessionExpiredError) showSessionExpired();
            else if (error instanceof StorageForbiddenError) showStorageForbidden();
            else setApiStatus(message(copy.downloadFailed, { message: error.message || copy.unavailable }), "error");
          } finally {
            button.disabled = false;
          }
        }

        async function deleteFile(file, button) {
          if (isBusy || !window.confirm(message(copy.deleteConfirm, { name: file.name }))) return;

          refreshSequence += 1;
          setBusy(true);
          button.disabled = true;
          setUploadStatus(message(copy.deleting, { name: file.name }), "loading");

          try {
            await storageRequest("/api/storage/object?id=" + encodeURIComponent(file.id), { method: "DELETE" });
            setUploadStatus(copy.uploadIdle, "");
            await refreshFiles({ force: true });
          } catch (error) {
            if (error instanceof SessionExpiredError) showSessionExpired();
            else if (error instanceof StorageForbiddenError) showStorageForbidden();
            else setApiStatus(message(copy.deleteFailed, { message: error.message || copy.unavailable }), "error");
          } finally {
            button.disabled = false;
            if (isBusy) setBusy(false);
          }
        }

        searchInput.addEventListener("input", () => {
          currentFilter = searchInput.value || "";
          renderFiles();
        });

        uploadButton.addEventListener("click", () => fileInput.click());
        refreshButton.addEventListener("click", () => void refreshFiles({ force: true }));
        fileInput.addEventListener("change", event => void uploadFiles(event.target.files));
        void initializeStorage();
      })();
    </script>
  `;
}
function settingsContent(path, zh) {
  if (path === "/settings") return settingsHubContent(zh);
  if (path.endsWith("/general")) return settingsGeneralContent(zh);
  if (path.endsWith("/appearance")) return appearanceSettingsContent(zh);
  if (path.endsWith("/language")) return languageSettingsContent(zh);
  if (path.endsWith("/security")) return securityAuditContent(zh);
  if (path.endsWith("/notifications")) return statusContent(zh, "通知", "通知方式、提醒和站内消息偏好将在这里统一管理。当前尚未接入通知服务。", "Notifications", "Notification methods, reminders, and in-app message preferences will be managed here. Notification delivery is not connected yet.");
  if (path.endsWith("/ai")) return statusContent(zh, "AI 设置", "这里将用于管理 AI Provider、模型与个人 AI 偏好。当前尚未开放用户级 AI 配置。", "AI Settings", "Manage AI providers, models, and personal AI preferences here. User-level AI configuration is not available yet.");
  if (path.endsWith("/integrations")) return statusContent(zh, "第三方集成", "这里将用于管理可连接的第三方服务与账号授权。当前尚未开放用户级集成配置。", "Integrations", "Manage connected third-party services and account authorizations here. User-level integrations are not available yet.");
  if (path.endsWith("/storage")) return storageSettingsContent(zh);

  const prefix = zh ? "/zh-cn" : "/en";
  const items = zh
    ? [
        ["外观", "可用", "设置浅色或深色主题，以及网页的整体显示方式。", `${prefix}/settings/appearance`],
        ["语言", "可用", "设置网页显示语言；当前支持中文与 English。", `${prefix}/settings/language`],
        ["账户与安全", "可用", "查看当前设备、登录设备、登录历史与异常登录记录。", `${prefix}/settings/security`],
        ["通知", "规划中", "管理提醒、站内消息与其他通知偏好。", `${prefix}/settings/notifications`],
        ["AI 设置", "规划中", "管理 AI Provider、模型与个人 AI 偏好。", `${prefix}/settings/ai`],
        ["第三方集成", "规划中", "管理可连接的第三方服务与账号授权。", `${prefix}/settings/integrations`],
        ["存储管理", "已连接", "上传、下载和管理仅属于当前账号的私人 R2 文件。", `${prefix}/settings/storage`]
      ]
    : [
        ["Appearance", "Available", "Choose light or dark mode and manage the site's overall display.", `${prefix}/settings/appearance`],
        ["Language", "Available", "Choose the site language; Chinese and English are currently supported.", `${prefix}/settings/language`],
        ["Account & Security", "Available", "Review the current device, signed-in devices, login history, and risk records.", `${prefix}/settings/security`],
        ["Notifications", "Planned", "Manage reminders, in-app messages, and other notification preferences.", `${prefix}/settings/notifications`],
        ["AI Settings", "Planned", "Manage AI providers, models, and personal AI preferences.", `${prefix}/settings/ai`],
        ["Integrations", "Planned", "Manage connected third-party services and account authorizations.", `${prefix}/settings/integrations`],
        ["Storage", "Connected", "Upload, download, and manage private R2 files belonging only to your account.", `${prefix}/settings/storage`]
      ];
  return `<section class="os-grid settings-grid">${items.map(item => `<a class="os-card settings-card-link" href="${item[3]}"><small>${item[1]}</small><h2>${item[0]}</h2><p>${item[2]}</p><span class="settings-card-arrow" aria-hidden="true">›</span></a>`).join("")}</section>`;
}

function appearanceSettingsContent(zh) {
  return `
    <section class="os-card is-large settings-detail-card">
      <h2>${zh ? "显示模式" : "Display Mode"}</h2>
      <p>${zh ? "选择网页使用浅色或深色外观。设置会保存在当前浏览器中。" : "Choose light or dark appearance. The preference is saved in this browser."}</p>
      <div class="settings-choice-grid">
        <button class="settings-choice" type="button" data-settings-theme="light"><strong>${zh ? "浅色" : "Light"}</strong><span>${zh ? "始终使用浅色外观" : "Always use the light appearance"}</span></button>
        <button class="settings-choice" type="button" data-settings-theme="dark"><strong>${zh ? "深色" : "Dark"}</strong><span>${zh ? "始终使用深色外观" : "Always use the dark appearance"}</span></button>
      </div>
    </section>
    <script>
      (() => {
        const choices = Array.from(document.querySelectorAll("[data-settings-theme]"));
        if (!choices.length) return;
        const refresh = () => {
          const current = document.documentElement.dataset.theme || "light";
          choices.forEach(button => button.classList.toggle("is-selected", button.dataset.settingsTheme === current));
        };
        choices.forEach(button => button.addEventListener("click", () => {
          const theme = button.dataset.settingsTheme;
          document.documentElement.classList.add("theme-switching");
          document.documentElement.dataset.theme = theme;
          try { localStorage.setItem("qssed-theme", theme); } catch {}
          window.setTimeout(() => document.documentElement.classList.remove("theme-switching"), 220);
          refresh();
        }));
        refresh();
      })();
    </script>
  `;
}

function languageSettingsContent(zh) {
  return `
    <section class="os-card is-large settings-detail-card">
      <h2>${zh ? "网页语言" : "Site Language"}</h2>
      <p>${zh ? "选择 QssedA Studio 的显示语言。切换后会保留当前设置页面。" : "Choose the display language for QssedA Studio. Switching keeps you on the current settings page."}</p>
      <div class="settings-choice-grid">
        <a class="settings-choice ${zh ? "is-selected" : ""}" href="/zh-cn/settings/language"><strong>中文</strong><span>简体中文</span></a>
        <a class="settings-choice ${zh ? "" : "is-selected"}" href="/en/settings/language"><strong>English</strong><span>English</span></a>
      </div>
    </section>
  `;
}

function notFoundPage(t, links) {
  const zh = t === TEXT.zh;
  return `
<!DOCTYPE html>
<html>
<head>
  ${baseHead("404 · " + t.studioName)}
</head>
<body>
  ${topControls(links, t)}
  <div class="card">
    <h1 class="brand-title">404</h1>
    <p>${zh ? "没有找到这个页面。" : "This page could not be found."}</p>
    <a class="button" href="${links.dashboard}">${zh ? "返回首页" : "Back to dashboard"}</a>
    <a class="button secondary" href="${links.login}">${t.signIn}</a>
  </div>
  ${themeScript()}
</body>
</html>
`;
}

function signUpPage(t, links, ipInfo) {
  const zh = t === TEXT.zh;
  const enforceChineseNameRules = ZH_COUNTRIES.includes(ipInfo?.country || "");
  const copy = zh ? {
    usernameHelp: "用户名需保持唯一，且不能包含 Tianguo、admin、administrator，或任何包含 admin 的大小写变体。",
    usernameChecking: "正在检查用户名…",
    usernameAvailable: "用户名可用",
    usernameTaken: "这个用户名已经被使用。",
    usernameReserved: "这个用户名属于保留名称，请更换。",
    usernameTooShort: "用户名至少需要 3 个字符。",
    realNameTitle: "填写真实姓名",
    realNameHelpZhIp: "请填写真实姓名；姓和名均使用汉字，并分别选择对应字数。",
    realNameHelpInternational: "检测到非中文地区网络：请填写真实姓名，但不限制汉字、姓或名的字数。",
    surnameCount: "姓是几个字",
    givenCount: "名是几个字",
    oneChar: "1 个字",
    twoChars: "2 个字",
    invalidNameZhIp: "姓名必须全部为汉字，并与所选字数完全一致。",
    invalidNameInternational: "姓和名都必须填写。",
    avatarTitle: "设置头像",
    avatarHelp: "你可以现在选择头像，也可以稍后再设置。支持 JPG、PNG、WebP，最大 5 MB。",
    choosePhoto: "选择照片",
    usePhoto: "使用这张照片",
    later: "稍后设置",
    invalidAvatar: "请选择 JPG、PNG 或 WebP 图片，且文件不能超过 5 MB。",
    emailHelp: "请确保邮箱真实且可正常使用。无效或无法使用的邮箱可能导致账号受到限制或封禁。",
    invalidEmail: "请输入有效邮箱",
    passwordTitle: "设置密码",
    passwordHelp: "密码需要满足以下所有要求。",
    passwordStrength: "密码强度",
    passwordLength: "至少 8 个字符",
    passwordNumber: "至少 1 个数字",
    passwordUpper: "至少 1 个大写字母",
    passwordLower: "至少 1 个小写字母",
    passwordSpecial: "至少 1 个特殊字符",
    confirmPassword: "确认密码",
    confirmPasswordRequired: "请再次输入密码以确认。",
    passwordMismatch: "两次输入的密码不一致，请检查后重新输入。",
    showPassword: "显示密码",
    hidePassword: "隐藏密码",
    creating: "正在创建账户…",
    avatarFailed: "账户已创建，但头像保存失败，你可以稍后重新设置。"
  } : {
    usernameHelp: "Your username must be unique and cannot contain Tianguo, admin, administrator, or any case variation that includes admin.",
    usernameChecking: "Checking username…",
    usernameAvailable: "Username is available",
    usernameTaken: "This username is already in use.",
    usernameReserved: "This username is reserved. Choose another one.",
    usernameTooShort: "Username must contain at least 3 characters.",
    realNameTitle: "Enter your real name",
    realNameHelpZhIp: "Enter your real name in Chinese characters, then choose the exact length of your family and given names.",
    realNameHelpInternational: "Enter your real first and last name. No Chinese-character or 1–2 character restriction is applied for your region.",
    surnameCount: "Family-name length",
    givenCount: "Given-name length",
    oneChar: "1 character",
    twoChars: "2 characters",
    invalidNameZhIp: "Both name fields must contain only Chinese characters and exactly match the selected lengths.",
    invalidNameInternational: "First name and last name are both required.",
    avatarTitle: "Set a profile photo",
    avatarHelp: "Choose a profile photo now or set one later. JPG, PNG, and WebP up to 5 MB are supported.",
    choosePhoto: "Choose Photo",
    usePhoto: "Use This Photo",
    later: "Set Up Later",
    invalidAvatar: "Choose a JPG, PNG, or WebP image no larger than 5 MB.",
    emailHelp: "Use a real, working email address. Invalid or unusable addresses may result in account restrictions or suspension.",
    invalidEmail: "Enter a valid email address.",
    passwordTitle: "Set a password",
    passwordHelp: "Your password must meet all of the requirements below.",
    passwordStrength: "Password strength",
    passwordLength: "At least 8 characters",
    passwordNumber: "At least 1 number",
    passwordUpper: "At least 1 uppercase letter",
    passwordLower: "At least 1 lowercase letter",
    passwordSpecial: "At least 1 special character",
    confirmPassword: "Confirm password",
    confirmPasswordRequired: "Please enter your password again to confirm it.",
    passwordMismatch: "The passwords do not match. Please check and try again.",
    showPassword: "Show password",
    hidePassword: "Hide password",
    creating: "Creating account…",
    avatarFailed: "Your account was created, but the profile photo could not be saved. You can set it later."
  };

  return `
<!DOCTYPE html>
<html>
<head>
  ${baseHead(t.studioName)}
  <style>
    .signup-help{display:block;margin:6px 0 2px;color:var(--quiet);font-size:13px;line-height:1.55}
    .signup-status{min-height:22px;margin-top:8px;font-size:13px;color:var(--muted)}
    .signup-status.is-good{color:#2f9b63}.signup-status.is-bad{color:var(--danger)}
    .signup-input-shell{position:relative;margin-top:12px}
    .signup-input-shell input{margin-top:0;padding-right:50px}
    .signup-validity{position:absolute;right:15px;top:50%;display:grid;place-items:center;width:24px;height:24px;transform:translateY(-50%);font-size:19px;font-weight:900;line-height:1;opacity:0;pointer-events:none;transition:opacity .15s ease,color .15s ease,transform .15s ease}
    .signup-validity.is-checking{opacity:1;color:var(--muted)}
    .signup-validity.is-good{opacity:1;color:#2f9b63;transform:translateY(-50%) scale(1.04)}
    .signup-validity.is-bad{opacity:1;color:var(--danger)}
    .name-count-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
    .name-count-group{padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft)}
    .name-count-group>span{display:block;margin-bottom:8px;color:var(--muted);font-size:13px;font-weight:700}
    .name-count-options{display:flex;gap:8px}
    .name-count-choice{flex:1;display:flex;align-items:center;gap:7px;padding:9px;border:1px solid var(--border);border-radius:var(--radius);background:var(--card);color:var(--text);font-size:13px;cursor:pointer}
    .name-count-choice input{width:auto;min-height:auto;margin:0}
    .avatar-shell{display:grid;place-items:center;gap:14px;margin:18px 0}
    .avatar-preview{width:112px;height:112px;border-radius:50%;overflow:hidden;display:grid;place-items:center;border:1px solid color-mix(in srgb,var(--border-strong) 80%,transparent);background:linear-gradient(145deg,var(--surface),var(--surface-soft));box-shadow:var(--shadow-soft)}
    .avatar-preview img{width:100%;height:100%;object-fit:cover;display:none}
    .avatar-preview svg{width:48px;height:48px;fill:none;stroke:var(--muted);stroke-width:1.6}
    .avatar-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%}
    .avatar-actions button{margin-top:0}
    .password-heading{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-top:8px}
    .password-heading strong{font-size:15px;color:var(--text)}
    .password-heading span{font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}
    .password-input-shell{position:relative;margin-top:12px}
    .password-input-shell input{margin-top:0;padding-right:54px}
    .password-toggle{position:absolute;right:8px;top:50%;transform:translateY(-50%);display:grid;place-items:center;width:40px;height:40px;min-height:0;margin:0;padding:0;border:0;border-radius:10px;background:transparent;color:var(--muted);box-shadow:none;cursor:pointer}
    .password-toggle:hover{background:var(--surface-soft);color:var(--text)}
    .password-toggle svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
    .password-toggle .eye-off{display:none}
    .password-toggle.is-visible .eye-open{display:none}
    .password-toggle.is-visible .eye-off{display:block}
    .confirm-password-block .password-input-shell input{padding-right:96px}
    .password-confirm-validity{right:52px}
    .confirm-password-block{margin-top:16px}
    .confirm-password-label{display:block;margin-bottom:6px;font-size:13px;font-weight:700;color:var(--text)}
    .password-meter{height:7px;margin-top:10px;border-radius:999px;background:var(--surface-soft);overflow:hidden;border:1px solid var(--border)}
    .password-meter span{display:block;width:0;height:100%;background:var(--primary);transition:width .18s ease,background .18s ease}
    .password-rules{display:grid;gap:7px;margin:12px 0 0;padding:0;list-style:none}
    .password-rules li{display:flex;align-items:center;gap:8px;color:var(--muted);font-size:13px}
    .password-rules li::before{content:"○";font-weight:900;color:var(--quiet)}
    .password-rules li.is-met{color:var(--text)}
    .password-rules li.is-met::before{content:"✓";color:#2f9b63}
    @media (max-width:560px){.name-count-grid,.avatar-actions{grid-template-columns:1fr}}

      /* APPLE_DESIGN_SYSTEM_V2_SIGNUP */
/* APPLE_DESIGN_SYSTEM_V2 — sign-up components */
.signup-help{margin:7px 0 3px;color:var(--muted);font-size:13px;line-height:1.5}
.signup-status{min-height:20px;margin-top:7px;font-size:13px}
.signup-status.is-good{color:var(--success)}.signup-status.is-bad{color:var(--danger)}
.signup-input-shell,.password-input-shell{margin-top:12px}
.signup-validity{right:14px;width:22px;height:22px;font-size:18px}
.signup-validity.is-good{color:var(--success);transform:translateY(-50%) scale(1)}
.name-count-grid{gap:10px}
.name-count-group{
  padding:12px;
  border:0;
  border-radius:15px;
  background:var(--fill);
  box-shadow:inset 0 0 0 1px var(--border);
}
.name-count-group>span{margin-bottom:9px;color:var(--muted);font-size:12px;font-weight:650}
.name-count-options{
  gap:4px;
  padding:3px;
  border-radius:11px;
  background:color-mix(in srgb,var(--surface-soft) 85%,transparent);
}
.name-count-choice{
  min-height:36px;
  justify-content:center;
  padding:7px 9px;
  border:0;
  border-radius:9px;
  background:transparent;
  font-size:13px;
  transition:background .14s ease,transform .1s ease;
}
.name-count-choice:has(input:checked){
  background:var(--surface);
  box-shadow:0 1px 4px rgba(0,0,0,.10);
}
.name-count-choice input{position:absolute;opacity:0;pointer-events:none}
.name-count-choice:active{transform:scale(.97)}
.avatar-shell{gap:13px;margin:20px 0 4px}
.avatar-preview{
  width:108px;height:108px;
  border:1px solid var(--border);
  background:var(--fill);
  box-shadow:0 12px 30px rgba(0,0,0,.10);
}
.avatar-actions{gap:8px}
.password-heading{margin-top:16px}
.password-heading strong{font-size:14px;font-weight:680}
.password-heading span{font-size:12px}
.password-toggle{
  right:6px;width:38px;height:38px;border-radius:10px;
  color:var(--muted);
  transition:background .12s ease,color .12s ease,transform .1s ease;
}
.password-toggle:hover{background:var(--secondary);color:var(--text)}
.password-toggle:active{transform:translateY(-50%) scale(.9)}
.confirm-password-block{margin-top:18px}
.confirm-password-label{margin-bottom:6px;font-size:13px;font-weight:650}
.password-meter{
  height:5px;margin-top:11px;border:0;background:var(--fill)
}
.password-meter span{border-radius:999px;transition:width .18s ease,background .18s ease}
.password-rules{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px 10px;margin-top:12px}
.password-rules li{gap:7px;font-size:12px;line-height:1.35}
.password-rules li::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--quiet)}
.password-rules li.is-met::before{content:"";background:var(--success);box-shadow:0 0 0 3px color-mix(in srgb,var(--success) 13%,transparent)}
#step-username,#step-name,#step-avatar,#step-birthday,#step-gender,#step-email,#step-password{transform-origin:50% 16%}
@media (max-width:560px){
  .password-rules{grid-template-columns:1fr}
  .name-count-grid,.avatar-actions{grid-template-columns:1fr}
}
</style>
</head>
<body>
  ${topControls(links, t)}
  <div class="card">
    <h1 class="brand-title">${t.studioName}</h1>

    <div id="step-username">
      <p>${t.chooseUsername}</p>
      <div class="signup-input-shell">
        <input id="username" type="text" placeholder="${t.usernamePlaceholder}" autocomplete="username" aria-describedby="username-status" aria-invalid="false">
        <span id="username-validity" class="signup-validity" aria-hidden="true"></span>
      </div>
      <div id="username-status" class="signup-status" role="status"></div>
      <button id="username-next-btn" disabled>${t.continue}</button>
      <a class="button secondary" href="${links.login}">${t.alreadyHaveAccount}</a>
    </div>

    <div id="step-name" style="display:none;">
      <p>${copy.realNameTitle}</p>
      <small class="signup-help">${enforceChineseNameRules ? copy.realNameHelpZhIp : copy.realNameHelpInternational}</small>

      <input id="first-name" type="text" ${enforceChineseNameRules ? 'maxlength="2"' : 'maxlength="80"'} placeholder="${t.firstNamePlaceholder}" autocomplete="${enforceChineseNameRules ? "family-name" : "given-name"}">
      ${enforceChineseNameRules ? `
      <div class="name-count-group">
        <span>${copy.surnameCount}</span>
        <div class="name-count-options">
          <label class="name-count-choice"><input type="radio" name="surname-length" value="1"><span>${copy.oneChar}</span></label>
          <label class="name-count-choice"><input type="radio" name="surname-length" value="2"><span>${copy.twoChars}</span></label>
        </div>
      </div>` : ""}

      <input id="last-name" type="text" ${enforceChineseNameRules ? 'maxlength="2"' : 'maxlength="80"'} placeholder="${t.lastNamePlaceholder}" autocomplete="${enforceChineseNameRules ? "given-name" : "family-name"}">
      ${enforceChineseNameRules ? `
      <div class="name-count-group">
        <span>${copy.givenCount}</span>
        <div class="name-count-options">
          <label class="name-count-choice"><input type="radio" name="given-name-length" value="1"><span>${copy.oneChar}</span></label>
          <label class="name-count-choice"><input type="radio" name="given-name-length" value="2"><span>${copy.twoChars}</span></label>
        </div>
      </div>` : ""}

      <div id="name-status" class="signup-status"></div>
      <button id="name-next-btn" disabled>${t.continue}</button>
    </div>

    <div id="step-avatar" style="display:none;">
      <p>${copy.avatarTitle}</p>
      <small class="signup-help">${copy.avatarHelp}</small>
      <div class="avatar-shell">
        <div class="avatar-preview">
          <svg id="avatar-placeholder" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 20c.8-4.2 3.3-6.3 7.5-6.3s6.7 2.1 7.5 6.3"/></svg>
          <img id="avatar-preview-image" alt="">
        </div>
        <input id="avatar-file" type="file" accept="image/jpeg,image/png,image/webp" style="display:none;">
        <div id="avatar-status" class="signup-status"></div>
        <div class="avatar-actions">
          <button id="avatar-choose-btn" type="button">${copy.choosePhoto}</button>
          <button id="avatar-later-btn" type="button" class="secondary">${copy.later}</button>
        </div>
        <button id="avatar-next-btn" type="button" disabled>${copy.usePhoto}</button>
      </div>
    </div>

    <div id="step-birthday" style="display:none;">
      <p>${t.enterBirthDate}</p>
      <div class="birthdate-grid">
        <select id="birth-year"><option value="">${t.birthYear}</option></select>
        <select id="birth-month"><option value="">${t.birthMonth}</option></select>
        <select id="birth-day"><option value="">${t.birthDay}</option></select>
      </div>
      <button id="birthday-next-btn" disabled>${t.continue}</button>
    </div>

    <div id="step-gender" style="display:none;">
      <p>${t.selectGender}</p>
      <label class="choice-row"><input type="radio" name="gender" value="male"><span>${t.male}</span></label>
      <label class="choice-row"><input type="radio" name="gender" value="female"><span>${t.female}</span></label>
      <label class="checkbox-row"><input id="hide-gender-on-profile" type="checkbox"><span>${t.hideGenderOnProfile}</span></label>
      <button id="gender-next-btn" disabled>${t.continue}</button>
    </div>

    <div id="step-email" style="display:none;">
      <p>${t.enterEmail}</p>
      <small class="signup-help">${copy.emailHelp}</small>
      <input id="email" type="email" placeholder="name@example.com" autocomplete="email">
      <div id="email-status" class="signup-status"></div>
      <button id="email-next-btn" disabled>${t.continue}</button>
    </div>

    <div id="step-password" style="display:none;">
      <p>${copy.passwordTitle}</p>
      <small class="signup-help">${copy.passwordHelp}</small>
      <div class="password-heading">
        <strong>${t.passwordPlaceholder}</strong>
        <span id="password-strength">${copy.passwordStrength}：0%</span>
      </div>
      <div class="password-input-shell">
        <input id="password" type="password" placeholder="${t.passwordPlaceholder}" autocomplete="new-password">
        <button id="password-toggle" class="password-toggle" type="button" aria-label="${copy.showPassword}" title="${copy.showPassword}">
          <svg class="eye-open" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
          <svg class="eye-off" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 6.2A11 11 0 0 1 12 6c6.5 0 10 6 10 6a17.7 17.7 0 0 1-2.1 2.8"/><path d="M6.2 6.2C3.5 8 2 12 2 12s3.5 6 10 6c1.6 0 3-.4 4.2-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>
        </button>
      </div>
      <div class="password-meter"><span id="password-meter-fill"></span></div>
      <ul class="password-rules">
        <li id="password-rule-length">${copy.passwordLength}</li>
        <li id="password-rule-number">${copy.passwordNumber}</li>
        <li id="password-rule-upper">${copy.passwordUpper}</li>
        <li id="password-rule-lower">${copy.passwordLower}</li>
        <li id="password-rule-special">${copy.passwordSpecial}</li>
      </ul>
      <div class="confirm-password-block">
        <label class="confirm-password-label" for="confirm-password">${copy.confirmPassword}</label>
        <div class="password-input-shell">
          <input id="confirm-password" type="password" placeholder="${copy.confirmPassword}" autocomplete="new-password" aria-describedby="confirm-password-status" aria-invalid="false">
          <span id="confirm-password-validity" class="signup-validity password-confirm-validity" aria-hidden="true"></span>
          <button id="confirm-password-toggle" class="password-toggle" type="button" aria-label="${copy.showPassword}" title="${copy.showPassword}">
            <svg class="eye-open" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg class="eye-off" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 6.2A11 11 0 0 1 12 6c6.5 0 10 6 10 6a17.7 17.7 0 0 1-2.1 2.8"/><path d="M6.2 6.2C3.5 8 2 12 2 12s3.5 6 10 6c1.6 0 3-.4 4.2-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>
          </button>
        </div>
        <div id="confirm-password-status" class="signup-status" role="status"></div>
      </div>
      <button id="create-account-btn" disabled>${t.getStarted}</button>
    </div>

    <div id="message"></div>
    <div id="post-signup-actions" style="display:none;">
      <a class="button secondary" href="${links.login}">${t.alreadyHaveAccount}</a>
    </div>
  </div>

  ${supabaseScript()}
  ${auditClientScript(ipInfo)}

  <script>
    const adminEmails = ${JSON.stringify(ADMIN_EMAILS)};
    const enforceChineseNameRules = ${JSON.stringify(enforceChineseNameRules)};
    let username = "";
    let firstName = "";
    let lastName = "";
    let surnameLength = 0;
    let givenNameLength = 0;
    let birthDate = "";
    let gender = "";
    let hideGenderOnProfile = false;
    let userEmail = "";
    let avatarFile = null;
    let avatarPreviewUrl = "";
    let usernameCheckTimer = 0;
    let usernameCheckSequence = 0;
    let usernameIsAvailable = false;

    const message = document.getElementById("message");
    const postSignupActions = document.getElementById("post-signup-actions");

    function showStep(id) {
      ["step-username","step-name","step-avatar","step-birthday","step-gender","step-email","step-password"].forEach(step => {
        document.getElementById(step).style.display = "none";
      });
      document.getElementById(id).style.display = "block";
      message.innerText = "";
      postSignupActions.style.display = "none";
    }

    function setButtonState(button, enabled) {
      button.disabled = !enabled;
      button.style.opacity = enabled ? "1" : "0.45";
      button.style.cursor = enabled ? "pointer" : "not-allowed";
    }

    function setStatus(element, text, tone = "") {
      element.textContent = text || "";
      element.classList.remove("is-good", "is-bad");
      if (tone) element.classList.add(tone);
    }

    function usernameLocalReason(value) {
      const text = value.trim();
      const key = text.toLowerCase();
      if (!text) return "";
      if (text.length < 3) return "too_short";
      if (key.includes("tianguo")) return "reserved_tianguo";
      if (key.includes("admin")) return "reserved_admin";
      return "";
    }

    function usernameMessage(reason) {
      if (reason === "too_short") return ${JSON.stringify(copy.usernameTooShort)};
      if (reason === "reserved_tianguo" || reason === "reserved_admin") return ${JSON.stringify(copy.usernameReserved)};
      if (reason === "username_taken") return ${JSON.stringify(copy.usernameTaken)};
      return ${JSON.stringify(copy.usernameTaken)};
    }

    const usernameInput = document.getElementById("username");
    const usernameStatus = document.getElementById("username-status");
    const usernameValidity = document.getElementById("username-validity");
    const usernameNextBtn = document.getElementById("username-next-btn");

    function setUsernameValidity(state) {
      usernameValidity.classList.remove("is-checking", "is-good", "is-bad");
      usernameInput.setAttribute("aria-invalid", state === "bad" ? "true" : "false");
      if (state === "checking") {
        usernameValidity.textContent = "…";
        usernameValidity.classList.add("is-checking");
      } else if (state === "good") {
        usernameValidity.textContent = "✓";
        usernameValidity.classList.add("is-good");
      } else if (state === "bad") {
        usernameValidity.textContent = "×";
        usernameValidity.classList.add("is-bad");
      } else {
        usernameValidity.textContent = "";
      }
    }

    async function checkUsernameAvailability() {
      const value = usernameInput.value.trim();
      usernameIsAvailable = false;
      setButtonState(usernameNextBtn, false);

      if (!value) {
        setStatus(usernameStatus, "");
        setUsernameValidity("");
        return false;
      }

      const localReason = usernameLocalReason(value);
      if (localReason) {
        setStatus(usernameStatus, usernameMessage(localReason), "is-bad");
        setUsernameValidity("bad");
        return false;
      }

      const sequence = ++usernameCheckSequence;
      setStatus(usernameStatus, "");
      setUsernameValidity("checking");
      const { data, error } = await supabaseClient.rpc("check_registration_username", { p_username: value });
      if (sequence !== usernameCheckSequence) return false;
      if (error) {
        setStatus(usernameStatus, ${JSON.stringify(zh ? "暂时无法检查用户名，请稍后再试。" : "Unable to check the username right now.")}, "is-bad");
        setUsernameValidity("bad");
        return false;
      }
      if (!data?.available) {
        setStatus(usernameStatus, usernameMessage(data?.reason || "username_taken"), "is-bad");
        setUsernameValidity("bad");
        return false;
      }
      usernameIsAvailable = true;
      setStatus(usernameStatus, "");
      setUsernameValidity("good");
      setButtonState(usernameNextBtn, true);
      return true;
    }

    usernameInput.addEventListener("input", () => {
      clearTimeout(usernameCheckTimer);
      usernameCheckSequence += 1;
      usernameIsAvailable = false;
      setButtonState(usernameNextBtn, false);

      const value = usernameInput.value.trim();
      if (!value) {
        setStatus(usernameStatus, "");
        setUsernameValidity("");
        return;
      }

      const reason = usernameLocalReason(value);
      if (reason) {
        setStatus(usernameStatus, usernameMessage(reason), "is-bad");
        setUsernameValidity("bad");
        return;
      }

      setStatus(usernameStatus, "");
      setUsernameValidity("checking");
      usernameCheckTimer = window.setTimeout(checkUsernameAvailability, 250);
    });

    usernameNextBtn.addEventListener("click", async () => {
      if (!usernameIsAvailable && !(await checkUsernameAvailability())) return;
      username = usernameInput.value.trim();
      showStep("step-name");
    });

    const firstNameInput = document.getElementById("first-name");
    const lastNameInput = document.getElementById("last-name");
    const surnameLengthInputs = document.querySelectorAll('input[name="surname-length"]');
    const givenNameLengthInputs = document.querySelectorAll('input[name="given-name-length"]');
    const nameStatus = document.getElementById("name-status");
    const nameNextBtn = document.getElementById("name-next-btn");

    function exactHanName(value, expectedLength) {
      const text = value.trim();
      return (expectedLength === 1 || expectedLength === 2) &&
        Array.from(text).length === expectedLength &&
        /^\\p{Script=Han}+$/u.test(text);
    }

    function updateNameButton() {
      let ready = false;

      if (enforceChineseNameRules) {
        surnameLength = Number(document.querySelector('input[name="surname-length"]:checked')?.value || 0);
        givenNameLength = Number(document.querySelector('input[name="given-name-length"]:checked')?.value || 0);
        ready = exactHanName(firstNameInput.value, surnameLength) && exactHanName(lastNameInput.value, givenNameLength);
      } else {
        surnameLength = 0;
        givenNameLength = 0;
        ready =
          firstNameInput.value.trim().length > 0 &&
          firstNameInput.value.trim().length <= 80 &&
          lastNameInput.value.trim().length > 0 &&
          lastNameInput.value.trim().length <= 80;
      }

      setButtonState(nameNextBtn, ready);
      const hasAny = firstNameInput.value.trim() || lastNameInput.value.trim() || surnameLength || givenNameLength;
      const invalidText = enforceChineseNameRules ? ${JSON.stringify(copy.invalidNameZhIp)} : ${JSON.stringify(copy.invalidNameInternational)};
      setStatus(nameStatus, hasAny && !ready ? invalidText : "", hasAny && !ready ? "is-bad" : "");
    }

    firstNameInput.addEventListener("input", updateNameButton);
    lastNameInput.addEventListener("input", updateNameButton);
    surnameLengthInputs.forEach(input => input.addEventListener("change", updateNameButton));
    givenNameLengthInputs.forEach(input => input.addEventListener("change", updateNameButton));

    nameNextBtn.addEventListener("click", () => {
      updateNameButton();
      if (nameNextBtn.disabled) return;
      firstName = firstNameInput.value.trim();
      lastName = lastNameInput.value.trim();
      showStep("step-avatar");
    });

    const avatarInput = document.getElementById("avatar-file");
    const avatarChooseBtn = document.getElementById("avatar-choose-btn");
    const avatarLaterBtn = document.getElementById("avatar-later-btn");
    const avatarNextBtn = document.getElementById("avatar-next-btn");
    const avatarPreview = document.getElementById("avatar-preview-image");
    const avatarPlaceholder = document.getElementById("avatar-placeholder");
    const avatarStatus = document.getElementById("avatar-status");

    avatarChooseBtn.addEventListener("click", () => avatarInput.click());

    avatarInput.addEventListener("change", () => {
      const file = avatarInput.files?.[0] || null;
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!file || !allowed.includes(file.type) || file.size > 5 * 1024 * 1024) {
        avatarFile = null;
        setButtonState(avatarNextBtn, false);
        setStatus(avatarStatus, ${JSON.stringify(copy.invalidAvatar)}, "is-bad");
        return;
      }

      avatarFile = file;
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
      avatarPreviewUrl = URL.createObjectURL(file);
      avatarPreview.src = avatarPreviewUrl;
      avatarPreview.style.display = "block";
      avatarPlaceholder.style.display = "none";
      setStatus(avatarStatus, file.name, "is-good");
      setButtonState(avatarNextBtn, true);
    });

    avatarNextBtn.addEventListener("click", () => {
      if (!avatarFile) return;
      showStep("step-birthday");
    });

    avatarLaterBtn.addEventListener("click", () => {
      avatarFile = null;
      avatarInput.value = "";
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
      avatarPreviewUrl = "";
      avatarPreview.removeAttribute("src");
      avatarPreview.style.display = "none";
      avatarPlaceholder.style.display = "block";
      showStep("step-birthday");
    });

    const birthYearInput = document.getElementById("birth-year");
    const birthMonthInput = document.getElementById("birth-month");
    const birthDayInput = document.getElementById("birth-day");
    const birthdayNextBtn = document.getElementById("birthday-next-btn");
    const currentYear = new Date().getFullYear();

    for (let year = currentYear; year >= 1900; year -= 1) {
      birthYearInput.insertAdjacentHTML("beforeend", '<option value="' + year + '">' + year + '</option>');
    }
    for (let month = 1; month <= 12; month += 1) {
      const value = String(month).padStart(2, "0");
      birthMonthInput.insertAdjacentHTML("beforeend", '<option value="' + value + '">' + month + '</option>');
    }

    function updateBirthDayOptions() {
      const selectedYear = Number(birthYearInput.value);
      const selectedMonth = Number(birthMonthInput.value);
      const previousDay = birthDayInput.value;
      const daysInMonth = selectedYear && selectedMonth ? new Date(selectedYear, selectedMonth, 0).getDate() : 31;
      birthDayInput.innerHTML = '<option value="">${t.birthDay}</option>';
      for (let day = 1; day <= daysInMonth; day += 1) {
        const value = String(day).padStart(2, "0");
        birthDayInput.insertAdjacentHTML("beforeend", '<option value="' + value + '">' + day + '</option>');
      }
      if (previousDay && Number(previousDay) <= daysInMonth) birthDayInput.value = previousDay;
    }

    function updateBirthDateButton() {
      setButtonState(birthdayNextBtn, Boolean(birthYearInput.value && birthMonthInput.value && birthDayInput.value));
    }

    birthYearInput.addEventListener("change", () => { updateBirthDayOptions(); updateBirthDateButton(); });
    birthMonthInput.addEventListener("change", () => { updateBirthDayOptions(); updateBirthDateButton(); });
    birthDayInput.addEventListener("change", updateBirthDateButton);

    birthdayNextBtn.addEventListener("click", () => {
      birthDate = birthYearInput.value + "-" + birthMonthInput.value + "-" + birthDayInput.value;
      showStep("step-gender");
    });

    const genderInputs = document.querySelectorAll('input[name="gender"]');
    const hideGenderOnProfileInput = document.getElementById("hide-gender-on-profile");
    const genderNextBtn = document.getElementById("gender-next-btn");
    function updateGenderButton() {
      setButtonState(genderNextBtn, Boolean(document.querySelector('input[name="gender"]:checked')));
    }
    genderInputs.forEach(input => input.addEventListener("change", updateGenderButton));
    genderNextBtn.addEventListener("click", () => {
      const selectedGender = document.querySelector('input[name="gender"]:checked');
      gender = selectedGender ? selectedGender.value : "";
      hideGenderOnProfile = hideGenderOnProfileInput.checked;
      showStep("step-email");
    });

    const emailInput = document.getElementById("email");
    const emailStatus = document.getElementById("email-status");
    const emailNextBtn = document.getElementById("email-next-btn");

    function emailValid(value) {
      return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value.trim());
    }

    emailInput.addEventListener("input", () => {
      const value = emailInput.value;
      const valid = emailValid(value);
      setButtonState(emailNextBtn, valid);
      setStatus(emailStatus, value && !valid ? ${JSON.stringify(copy.invalidEmail)} : "", value && !valid ? "is-bad" : "");
    });

    emailNextBtn.addEventListener("click", () => {
      if (!emailValid(emailInput.value)) return;
      userEmail = emailInput.value.trim();
      showStep("step-password");
    });

    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    const passwordToggle = document.getElementById("password-toggle");
    const confirmPasswordToggle = document.getElementById("confirm-password-toggle");
    const confirmPasswordValidity = document.getElementById("confirm-password-validity");
    const confirmPasswordStatus = document.getElementById("confirm-password-status");
    const showPasswordLabel = ${JSON.stringify(copy.showPassword)};
    const hidePasswordLabel = ${JSON.stringify(copy.hidePassword)};
    let passwordConfirmationValid = false;

    function wirePasswordToggle(button, input) {
      button.addEventListener("click", () => {
        const willShow = input.type === "password";
        input.type = willShow ? "text" : "password";
        button.classList.toggle("is-visible", willShow);
        const label = willShow ? hidePasswordLabel : showPasswordLabel;
        button.setAttribute("aria-label", label);
        button.setAttribute("title", label);
        input.focus({ preventScroll: true });
      });
    }

    function setConfirmPasswordValidity(state) {
      confirmPasswordValidity.classList.remove("is-good", "is-bad");
      confirmPasswordInput.setAttribute("aria-invalid", state === "bad" ? "true" : "false");
      if (state === "good") {
        confirmPasswordValidity.textContent = "✓";
        confirmPasswordValidity.classList.add("is-good");
      } else if (state === "bad") {
        confirmPasswordValidity.textContent = "×";
        confirmPasswordValidity.classList.add("is-bad");
      } else {
        confirmPasswordValidity.textContent = "";
      }
    }

    wirePasswordToggle(passwordToggle, passwordInput);
    wirePasswordToggle(confirmPasswordToggle, confirmPasswordInput);
    const passwordStrength = document.getElementById("password-strength");
    const passwordMeterFill = document.getElementById("password-meter-fill");
    const createAccountBtn = document.getElementById("create-account-btn");

    const passwordRuleEls = {
      length: document.getElementById("password-rule-length"),
      number: document.getElementById("password-rule-number"),
      upper: document.getElementById("password-rule-upper"),
      lower: document.getElementById("password-rule-lower"),
      special: document.getElementById("password-rule-special")
    };

    function passwordChecks(value) {
      return {
        length: value.length >= 8,
        number: /\\d/.test(value),
        upper: /[A-Z]/.test(value),
        lower: /[a-z]/.test(value),
        special: /[^A-Za-z0-9\\s]/.test(value)
      };
    }

    function updatePasswordStrength() {
      const checks = passwordChecks(passwordInput.value);
      const passed = Object.values(checks).filter(Boolean).length;
      const percent = passed * 20;
      passwordStrength.textContent = ${JSON.stringify(copy.passwordStrength + "：")} + percent + "%";
      passwordMeterFill.style.width = percent + "%";
      passwordMeterFill.style.background = percent === 100 ? "#2f9b63" : percent >= 60 ? "#d99a2b" : "var(--danger)";
      Object.entries(checks).forEach(([key, met]) => passwordRuleEls[key].classList.toggle("is-met", met));
      setButtonState(createAccountBtn, percent === 100 && passwordConfirmationValid);
    }

    passwordInput.addEventListener("input", () => {
      passwordConfirmationValid = false;
      setConfirmPasswordValidity("");
      setStatus(confirmPasswordStatus, "");
      updatePasswordStrength();
    });

    confirmPasswordInput.addEventListener("input", () => {
      passwordConfirmationValid = false;
      setConfirmPasswordValidity("");
      setStatus(confirmPasswordStatus, "");
      updatePasswordStrength();
    });

    confirmPasswordInput.addEventListener("blur", () => {
      const value = confirmPasswordInput.value;
      if (!value) {
        passwordConfirmationValid = false;
        setConfirmPasswordValidity("bad");
        setStatus(confirmPasswordStatus, ${JSON.stringify(copy.confirmPasswordRequired)}, "is-bad");
      } else if (value !== passwordInput.value) {
        passwordConfirmationValid = false;
        setConfirmPasswordValidity("bad");
        setStatus(confirmPasswordStatus, ${JSON.stringify(copy.passwordMismatch)}, "is-bad");
      } else {
        passwordConfirmationValid = true;
        setConfirmPasswordValidity("good");
        setStatus(confirmPasswordStatus, "");
      }
      updatePasswordStrength();
    });

    createAccountBtn.addEventListener("click", async () => {
      updatePasswordStrength();
      if (createAccountBtn.disabled) return;

      const originalLabel = createAccountBtn.textContent;
      createAccountBtn.disabled = true;
      createAccountBtn.textContent = ${JSON.stringify(copy.creating)};
      message.textContent = "";

      const form = new FormData();
      form.set("username", username);
      form.set("first_name", firstName);
      form.set("last_name", lastName);
      form.set("surname_length", String(surnameLength));
      form.set("given_name_length", String(givenNameLength));
      form.set("birth_date", birthDate);
      form.set("gender", gender);
      form.set("hide_gender_on_profile", String(hideGenderOnProfile));
      form.set("email", userEmail);
      form.set("password", passwordInput.value);
      if (avatarFile) form.set("avatar", avatarFile, avatarFile.name);

      try {
        const response = await fetch("/api/auth/signup", { method: "POST", body: form });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (payload?.field === "username") {
            showStep("step-username");
            setStatus(usernameStatus, usernameMessage(payload?.error || "username_taken"), "is-bad");
            setUsernameValidity("bad");
            usernameIsAvailable = false;
            setButtonState(usernameNextBtn, false);
          } else {
            message.textContent = payload?.error || ${JSON.stringify(zh ? "注册失败，请检查填写内容。" : "Registration failed. Check your details and try again.")};
          }
          return;
        }

        const randomEmail = adminEmails[Math.floor(Math.random() * adminEmails.length)];
        message.textContent = ${JSON.stringify(t.adminApprovalMessage + " ")} + randomEmail;
        if (payload?.avatar_status === "failed") {
          message.textContent += " " + ${JSON.stringify(copy.avatarFailed)};
        }
        postSignupActions.style.display = "block";
      } finally {
        createAccountBtn.textContent = originalLabel;
        updatePasswordStrength();
      }
    });

    setButtonState(usernameNextBtn, false);
    setButtonState(nameNextBtn, false);
    setButtonState(avatarNextBtn, false);
    updateBirthDayOptions();
    setButtonState(birthdayNextBtn, false);
    setButtonState(genderNextBtn, false);
    setButtonState(emailNextBtn, false);
    updatePasswordStrength();
  </script>
  ${themeScript()}
</body>
</html>
`;
}
function loginPage(t, links, ipInfo) {
  return `
<!DOCTYPE html>
<html>
<head>
  ${baseHead(t.signIn)}
</head>
<body>
  ${topControls(links, t)}
  <div class="card">
    <h1>${t.signIn}</h1>
    <p id="login-description">${t.loginDescription}</p>

    <input id="email" type="email" placeholder="${t.emailPlaceholder}">
    <input id="password" type="password" placeholder="${t.passwordPlaceholder}">

    <button id="login-btn">${t.signIn}</button>
    <a id="signup-link" class="button secondary" href="${links.signUp}">
      ${t.dontHaveAccount}
    </a>

    <div id="message"></div>
  </div>

  ${supabaseScript()}
  ${auditClientScript(ipInfo)}

  <script>
    const dashboardUrl = ${JSON.stringify(links.dashboard)};
    const emptyCredentialsMessage = ${JSON.stringify(
      t === TEXT.zh ? "请输入邮箱和密码。" : "Please enter email and password."
    )};
    const loginBtn = document.getElementById("login-btn");
    const message = document.getElementById("message");

    loginBtn.addEventListener("click", async () => {
      message.innerText = "";

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      if (!email || !password) {
        message.innerText = emptyCredentialsMessage;
        return;
      }

      const authResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          device_id: getAuditDeviceId()
        })
      });
      const authData = await authResponse.json().catch(() => ({}));

      if (!authResponse.ok) {
        message.innerText = authData.error_description || authData.msg || authData.error || "Login failed.";
        return;
      }

      const { error: sessionError } = await supabaseClient.auth.setSession({
        access_token: authData.access_token,
        refresh_token: authData.refresh_token
      });
      if (sessionError) {
        message.innerText = sessionError.message;
        return;
      }

      const loginName = authData.user?.user_metadata?.username || authData.user?.user_metadata?.display_name || authData.user?.email;
      if (loginName) {
        try {
          document.cookie = "qssed-os-user-name=" + encodeURIComponent("@" + loginName) + "; Path=/; Max-Age=2592000; SameSite=Lax; Secure";
        } catch {}
      }
      try { if (typeof clearProfileUiCaches === "function") clearProfileUiCaches(); } catch {}
      try {
        ["qssed-admin-overview-v1","qssed-admin-users-v1","qssed-admin-roles-v1","qssed-admin-logs-v1","qssed-admin-access-v1"].forEach(key => sessionStorage.removeItem(key));
        Object.keys(sessionStorage).filter(key => key.startsWith("qssed-admin-view-v1:")).forEach(key => sessionStorage.removeItem(key));
      } catch {}
      await updateCurrentDevice(authData.user);
      window.location.href = dashboardUrl;
    });

    async function redirectIfLoggedIn() {
      const { data } = await supabaseClient.auth.getUser();

      if (data.user) {
        const existingName = data.user.user_metadata.username || data.user.user_metadata.display_name || data.user.email;
        if (existingName) {
          try {
            document.cookie = "qssed-os-user-name=" + encodeURIComponent("@" + existingName) + "; Path=/; Max-Age=2592000; SameSite=Lax; Secure";
          } catch {}
        }
        window.location.href = dashboardUrl;
      }
    }

    redirectIfLoggedIn();
  </script>
  ${themeScript()}
</body>
</html>
`;
}
// OS_ROUTE_ARCHITECTURE_V2_FIXED
