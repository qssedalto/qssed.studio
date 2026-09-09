const SUPABASE_URL = "https://xunbsoxijasekzadckob.supabase.co";
const SUPABASE_KEY = "sb_publishable_1ScwEvseisteYNgc5xM1pQ_NNekUmF1";
const ZH_COUNTRIES = ["CN", "HK", "MO", "TW", "SG"];
const ADMIN_EMAILS = [
  "qssed_a@icloud.com"
];
const OS_PATHS = new Set([
  "/dashboard",
  "/info",
  "/info/knowledge",
  "/info/links",
  "/info/notes",
  "/info/summaries",
  "/info/search",
  "/profile",
  "/profile/account",
  "/profile/security",
  "/profile/preferences",
  "/workspace",
  "/workspace/projects",
  "/workspace/experiments",
  "/workspace/drafts",
  "/workspace/tasks",
  "/admin",
  "/admin/users",
  "/admin/roles",
  "/admin/logs",
  "/admin/system",
  "/settings",
  "/settings/appearance",
  "/settings/language",
  "/settings/ai",
  "/settings/integrations",
  "/settings/storage"
]);
const LEGACY_REDIRECTS = new Map([
  ["/", "/dashboard"],
  ["/general", "/dashboard"],
  ["/general/infohub", "/info"],
  ["/personal", "/profile"]
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
    loginDescription: "Sign in to continue to get information from Tianguo.",
    signUpDescription: "Get started with studio access flow.",
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
    loginDescription: "登录后继续获取 Tianguo 的信息",
    signUpDescription: "开始使用 Studio 注册流程",
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
        if (avatar) avatar.innerText = String(snapshot.displayName || "User").slice(0, 1).toUpperCase();
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
          .select("username, display_name, role, status")
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
          status: profile?.status || ""
        };
        renderProfileSummarySnapshot(snapshot);
        writeProfileCache(PROFILE_SUMMARY_CACHE_KEY, snapshot);
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
        if (path === "/admin") await loadAdminOverview();
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
            '<div class="permission-head"></div>' + data.roles.map(role => '<strong>' + adminEscape(adminRoleLabel(role.name)) + '</strong>').join("") +
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
      ${renderOsNav(copy, activeSection)}
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
          ["用户资料", `${prefix}/profile`],
          ["账户信息", `${prefix}/profile/account`],
          ["安全中心", `${prefix}/profile/security`],
          ["偏好设置", `${prefix}/profile/preferences`]
        ] },
        { id: "workspace", label: "工作区", href: `${prefix}/workspace`, items: [
          ["工作台", `${prefix}/workspace`],
          ["项目管理", `${prefix}/workspace/projects`],
          ["实验室", `${prefix}/workspace/experiments`],
          ["草稿箱", `${prefix}/workspace/drafts`],
          ["任务中心", `${prefix}/workspace/tasks`]
        ] },
        { id: "admin", label: "管理", href: `${prefix}/admin`, items: [
          ["管理首页", `${prefix}/admin`],
          ["用户管理", `${prefix}/admin/users`],
          ["角色权限", `${prefix}/admin/roles`],
          ["操作日志", `${prefix}/admin/logs`],
          ["系统状态", `${prefix}/admin/system`]
        ] },
        { id: "settings", label: "设置", href: `${prefix}/settings`, items: [
          ["通用", `${prefix}/settings`],
          ["外观", `${prefix}/settings/appearance`],
          ["语言", `${prefix}/settings/language`],
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
        ["Profile", `${prefix}/profile`],
        ["Account", `${prefix}/profile/account`],
        ["Security", `${prefix}/profile/security`],
        ["Preferences", `${prefix}/profile/preferences`]
      ] },
      { id: "workspace", label: "Workspace", href: `${prefix}/workspace`, items: [
        ["Workbench", `${prefix}/workspace`],
        ["Projects", `${prefix}/workspace/projects`],
        ["Experiments", `${prefix}/workspace/experiments`],
        ["Drafts", `${prefix}/workspace/drafts`],
        ["Tasks", `${prefix}/workspace/tasks`]
      ] },
      { id: "admin", label: "Admin", href: `${prefix}/admin`, items: [
        ["Overview", `${prefix}/admin`],
        ["Users", `${prefix}/admin/users`],
        ["Roles", `${prefix}/admin/roles`],
        ["Logs", `${prefix}/admin/logs`],
        ["System", `${prefix}/admin/system`]
      ] },
      { id: "settings", label: "Settings", href: `${prefix}/settings`, items: [
        ["General", `${prefix}/settings`],
        ["Appearance", `${prefix}/settings/appearance`],
        ["Language", `${prefix}/settings/language`],
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
    security: ["安全中心", "查看登录设备、登录历史和风险记录。"],
    preferences: ["偏好设置", "主题与语言可直接切换；字体和通知设置尚未实现。"],
    workspace: ["工作区", "工作区数据模型尚未建立；当前仅保留模块入口。"],
    projects: ["项目管理", "尚未接入项目数据表。"],
    experiments: ["实验室", "实验工具尚未接入持久化数据。"],
    drafts: ["草稿箱", "尚未接入草稿数据表。"],
    tasks: ["任务中心", "尚未接入任务数据表。"],
    admin: ["管理首页", "显示真实用户与管理员数量、最近用户、操作日志和风险事件。"],
    users: ["用户管理", "用户列表、权限管理和封禁管理。"],
    roles: ["角色权限", "查看管理员、编辑者与普通成员的权限范围，并管理角色授权。"],
    logs: ["操作日志", "查看账户与管理操作的审计记录。"],
    system: ["系统状态", "查看管理功能、数据读取与审计能力的当前状态。"],
    settings: ["通用", "查看当前可用设置，以及尚未实现的配置模块。"],
    appearance: ["外观", "当前支持浅色与深色主题，可使用右上角主题按钮切换。"],
    language: ["语言", "当前支持中文与 English。"],
    ai: ["AI 设置", "当前没有浏览器端 API Key 配置功能；敏感密钥不应保存在前端。"],
    integrations: ["第三方集成", "当前站点运行依赖 Cloudflare 与 Supabase；此页尚无用户级集成配置。"],
    storage: ["存储管理", "当前没有文件存储模块。"]
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
    security: ["Security", "Review login devices, login history, and risk records."],
    preferences: ["Preferences", "Theme and language can be switched now; font and notification preferences are not implemented."],
    workspace: ["Workspace", "The workspace data model is not implemented yet; this area currently provides module entry points."],
    projects: ["Projects", "No projects table is connected yet."],
    experiments: ["Lab", "Experiment tools are not connected to persistent data yet."],
    drafts: ["Drafts", "No drafts table is connected yet."],
    tasks: ["Tasks", "No tasks table is connected yet."],
    admin: ["Admin Overview", "Shows live user/admin counts, recent users, operation logs, and risk events."],
    users: ["User Management", "User list, permissions, and bans."],
    roles: ["Roles", "Review the access scope for administrators, editors, and members, and manage role permissions."],
    logs: ["Logs", "Review audit records for account and administrative actions."],
    system: ["System Status", "Review the current availability of management features, data access, and auditing capabilities."],
    settings: ["General", "Review available settings and configuration modules that are not implemented yet."],
    appearance: ["Appearance", "Light and dark themes are available through the theme button in the top-right corner."],
    language: ["Language", "Chinese and English are currently supported."],
    ai: ["AI Settings", "There is no browser-side API-key configuration. Sensitive keys should not be stored in frontend code."],
    integrations: ["Integrations", "The site currently depends on Cloudflare and Supabase; user-configurable integrations are not implemented."],
    storage: ["Storage", "No file-storage module is implemented yet."]
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
    "/profile/account": { section: "profile", title: s.account[0], description: s.account[1] },
    "/profile/security": { section: "profile", title: s.security[0], description: s.security[1] },
    "/profile/preferences": { section: "profile", title: s.preferences[0], description: s.preferences[1] },
    "/workspace": { section: "workspace", title: s.workspace[0], description: s.workspace[1] },
    "/workspace/projects": { section: "workspace", title: s.projects[0], description: s.projects[1] },
    "/workspace/experiments": { section: "workspace", title: s.experiments[0], description: s.experiments[1] },
    "/workspace/drafts": { section: "workspace", title: s.drafts[0], description: s.drafts[1] },
    "/workspace/tasks": { section: "workspace", title: s.tasks[0], description: s.tasks[1] },
    "/admin": { section: "admin", title: s.admin[0], description: s.admin[1] },
    "/admin/users": { section: "admin", title: s.users[0], description: s.users[1] },
    "/admin/roles": { section: "admin", title: s.roles[0], description: s.roles[1] },
    "/admin/logs": { section: "admin", title: s.logs[0], description: s.logs[1] },
    "/admin/system": { section: "admin", title: s.system[0], description: s.system[1] },
    "/settings": { section: "settings", title: s.settings[0], description: s.settings[1] },
    "/settings/appearance": { section: "settings", title: s.appearance[0], description: s.appearance[1] },
    "/settings/language": { section: "settings", title: s.language[0], description: s.language[1] },
    "/settings/ai": { section: "settings", title: s.ai[0], description: s.ai[1] },
    "/settings/integrations": { section: "settings", title: s.integrations[0], description: s.integrations[1] },
    "/settings/storage": { section: "settings", title: s.storage[0], description: s.storage[1] }
  };
}

function renderOsNav(copy, activeSection) {
  return `
    <nav class="os-nav">
      ${copy.nav.map(group => `
        <section class="os-nav-group ${group.id === activeSection ? "is-active" : ""}">
          <a class="os-nav-title" href="${group.href}">${group.label}</a>
          ${group.items.length ? `<div class="os-nav-items">
            ${group.items.map(item => `<a href="${item[1]}">${item[0]}</a>`).join("")}
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

function dashboardContent(zh) {
  const modules = zh
    ? [
        ["账户与安全", "已接入", "Supabase Auth、登录事件和设备记录使用真实数据。"],
        ["管理后台", "已接入", "集中管理用户、角色、权限与安全审计。"],
        ["知识与工作区", "未接入", "笔记、链接、摘要、项目、草稿和任务目前没有对应数据表。"],
        ["设置与集成", "部分接入", "主题和中英切换可用；AI、存储和用户级第三方配置尚未实现。"]
      ]
    : [
        ["Account & Security", "Connected", "Supabase Auth, login events, and device records use live data."],
        ["Admin", "Connected", "Manage users, roles, permissions, and security audits in one place."],
        ["Knowledge & Workspace", "Not connected", "Notes, links, summaries, projects, drafts, and tasks do not have backing tables yet."],
        ["Settings & Integrations", "Partial", "Theme and Chinese/English switching work; AI, storage, and user-level integrations are not implemented."]
      ];
  return `<section class="os-grid">${modules.map(item => `<article class="os-card"><small>${item[1]}</small><h2>${item[0]}</h2><p>${item[2]}</p></article>`).join("")}</section>`;
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

function profileContent(path, zh) {
  if (path.endsWith("/account")) return accountAuditContent(zh);
  if (path.endsWith("/security")) return securityAuditContent(zh);
  if (path.endsWith("/preferences")) return `<section class="os-card is-large"><h2>${zh ? "偏好设置" : "Preferences"}</h2><p>${zh ? "主题和语言可通过页面右上角按钮切换。字体和通知偏好目前没有保存或配置接口。" : "Theme and language can be switched with the controls in the top-right corner. Font and notification preferences do not currently have configuration or persistence APIs."}</p></section>`;
  return `<section id="profile-summary" class="os-profile-card"><div id="profile-avatar" class="os-avatar">...</div><div><h2 id="profile-display-name">${zh ? "正在读取账号资料..." : "Loading account profile..."}</h2><p id="profile-email">...</p><div id="profile-tags" class="os-chip-row"></div></div></section>`;
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
  if (path.endsWith("/projects")) return statusContent(zh, "项目数据尚未接入", "当前数据库没有 projects 表，因此不展示项目名称、状态或完成百分比。", "Project data is not connected yet", "There is no projects table in the current database, so project names, statuses, and completion percentages are not shown.");
  if (path.endsWith("/experiments")) return statusContent(zh, "实验工具尚未接入", "Prompt、Agent 和 API 实验目前没有持久化数据或独立工具接口。", "Experiment tools are not connected yet", "Prompt, agent, and API experiments do not currently have persistent data or dedicated tool APIs.");
  if (path.endsWith("/drafts")) return statusContent(zh, "草稿存储尚未接入", "当前数据库没有 drafts 表或草稿保存接口。", "Draft storage is not connected yet", "There is no drafts table or draft persistence API yet.");
  if (path.endsWith("/tasks")) return statusContent(zh, "任务数据尚未接入", "当前数据库没有 tasks 表，因此不展示 Todo 或 Kanban 数据。", "Task data is not connected yet", "There is no tasks table in the current database, so Todo or Kanban data is not shown.");
  return statusContent(zh, "工作区数据尚未接入", "项目、实验、草稿和任务目前没有统一的持久化工作区数据模型。", "Workspace data is not connected yet", "Projects, experiments, drafts, and tasks do not yet have a unified persistent workspace data model.");
}

function adminContent(path, zh) {
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

function settingsContent(path, zh) {
  if (path.endsWith("/appearance")) return `<section class="os-card is-large"><h2>${zh ? "外观" : "Appearance"}</h2><p>${zh ? "当前支持浅色与深色主题。请使用右上角主题按钮切换；尚未实现“跟随系统”的独立设置项。" : "Light and dark themes are available through the top-right theme button. A separate system-following preference is not implemented."}</p></section>`;
  if (path.endsWith("/language")) return `<section class="os-card is-large"><h2>${zh ? "语言" : "Language"}</h2><p>${zh ? "当前仅支持中文与 English；页面右上角语言按钮会在两者之间切换。" : "Chinese and English are currently supported; use the language button in the top-right corner to switch between them."}</p></section>`;
  if (path.endsWith("/ai")) return `<section class="os-card is-large"><h2>${zh ? "AI 设置" : "AI Settings"}</h2><p>${zh ? "当前没有用户级 AI Provider 或 API Key 配置。任何服务端密钥都应保存在 Cloudflare Secret 等受保护环境中，而不是浏览器页面。" : "There is no user-level AI provider or API-key configuration. Server-side secrets should live in protected environments such as Cloudflare Secrets, not in browser UI."}</p></section>`;
  if (path.endsWith("/integrations")) return `<section class="os-card is-large"><h2>${zh ? "第三方集成" : "Integrations"}</h2><p>${zh ? "Cloudflare 与 Supabase 是站点运行依赖，不是当前用户可配置的集成。其他用户级集成尚未实现。" : "Cloudflare and Supabase are runtime dependencies, not user-configurable integrations. Other user-level integrations are not implemented yet."}</p></section>`;
  if (path.endsWith("/storage")) return `<section class="os-card is-large"><h2>${zh ? "存储管理" : "Storage"}</h2><p>${zh ? "当前没有文件表、存储桶管理界面或容量统计数据源。" : "There is currently no file table, storage-bucket management UI, or capacity data source."}</p></section>`;
  const items = zh
    ? [
        ["外观", "可用", "浅色与深色主题可通过右上角按钮切换。"],
        ["语言", "可用", "当前支持中文与 English。"],
        ["AI 设置", "未实现", "当前没有用户级 AI Provider 或 API Key 配置。"],
        ["第三方集成", "未实现", "当前没有用户可配置的第三方集成界面。"],
        ["存储管理", "未实现", "当前没有文件存储模块或容量统计数据源。"]
      ]
    : [
        ["Appearance", "Available", "Light and dark themes can be switched from the top-right control."],
        ["Language", "Available", "Chinese and English are currently supported."],
        ["AI Settings", "Not implemented", "There is no user-level AI provider or API-key configuration."],
        ["Integrations", "Not implemented", "There is no user-configurable integrations UI yet."],
        ["Storage", "Not implemented", "There is no file-storage module or capacity data source yet."]
      ];
  return `<section class="os-grid">${items.map(item => `<article class="os-card"><small>${item[1]}</small><h2>${item[0]}</h2><p>${item[2]}</p></article>`).join("")}</section>`;
}

function osStyles() {
  return `
  <style>
    body.os-shell{
      display:block;
      padding:24px;
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--surface-soft) 36%, transparent) 0%, transparent 44%),
        linear-gradient(135deg, var(--bg) 0%, var(--bg-soft) 100%) !important;
      background-size:100% 100%, 180% 180%;
      animation:ambient-pan 18s ease-in-out infinite alternate;
    }
    .os-layout{min-height:calc(100vh - 48px);display:grid;grid-template-columns:286px minmax(0,1fr);gap:18px;}
    .os-sidebar,.os-main,.os-card,.os-profile-card,.os-lock{
      border:1px solid var(--border);background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow-soft);
    }
    .os-sidebar{padding:18px;animation:panel-enter .55s cubic-bezier(.2,.8,.2,1) both;}
    .os-main{padding:30px;animation:panel-enter .62s cubic-bezier(.2,.8,.2,1) .08s both;}
    .compact-back-zone{display:none;}
    @media (min-width:901px){
      body.os-shell{height:100vh;overflow:hidden;box-sizing:border-box;}
      .os-layout{height:calc(100vh - 48px);min-height:0;}
      .os-sidebar,.os-main{min-height:0;overflow-y:auto;overscroll-behavior:contain;}
      .os-main{min-width:0;scrollbar-gutter:stable;}
      .os-sidebar{scrollbar-width:thin;scrollbar-color:transparent transparent;}
      .os-sidebar:hover{scrollbar-color:var(--border-strong) transparent;}
      .os-sidebar::-webkit-scrollbar{width:8px;}
      .os-sidebar::-webkit-scrollbar-track{background:transparent;}
      .os-sidebar::-webkit-scrollbar-thumb{background:transparent;border-radius:999px;}
      .os-sidebar:hover::-webkit-scrollbar-thumb{background:var(--border-strong);}
    }
    .os-brand{display:flex;align-items:center;gap:12px;color:var(--text);text-decoration:none;margin-bottom:16px;}
    .os-brand-mark,.os-avatar{display:grid;place-items:center;width:42px;height:42px;border-radius:var(--radius);background:var(--primary);color:var(--primary-ink);font-weight:900;}
    .os-brand strong,.os-brand small{display:block}.os-brand small{color:var(--muted);font-size:12px;margin-top:2px;}
    .os-user{padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft);margin-bottom:16px;}
    .os-user strong,.os-user>span{display:block}.os-user strong{color:var(--quiet);font-size:12px;text-transform:uppercase}.os-user>span{margin-top:5px;color:var(--text);overflow-wrap:anywhere;}
    .os-signout-button{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:40px;margin:12px 0 0;padding:0 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--card);color:var(--muted);box-shadow:none;font-size:13px;font-weight:750;}
    .os-signout-button svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;flex:0 0 auto;}
    .os-signout-button span{display:inline;margin:0;color:inherit;overflow:visible;}
    .os-signout-button:hover{background:color-mix(in srgb,var(--danger) 8%,var(--card));border-color:color-mix(in srgb,var(--danger) 38%,var(--border));color:var(--danger);box-shadow:none;transform:none;}
    .os-signout-button:active{transform:scale(.985);}
    .os-signout-button:disabled{cursor:wait;opacity:.62;}
    .os-nav{display:grid;gap:10px}.os-nav-group{border:1px solid var(--border);border-radius:var(--radius);padding:8px;background:color-mix(in srgb,var(--surface-soft) 42%,transparent);}
    .os-nav-group.is-active{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 12%,transparent);}
    .os-nav-title{display:block;color:var(--text);text-decoration:none;font-weight:800;padding:8px;}
    .os-nav-items{display:grid;gap:3px}.os-nav-items a{color:var(--muted);text-decoration:none;padding:7px 8px;border-radius:var(--radius);font-size:14px}.os-nav-items a:hover{background:var(--surface-soft);color:var(--text);}
    .os-hero{display:flex;justify-content:space-between;gap:18px;align-items:stretch;margin-bottom:24px;}
    .os-kicker{margin:0 0 8px;color:var(--primary);font-weight:800}.os-hero h1{margin:0 0 10px;font-size:clamp(34px,5vw,64px);letter-spacing:0;line-height:1.02}.os-hero p{max-width:780px;margin:0;color:var(--muted);}
    .os-ai{min-width:230px;display:flex;flex-direction:column;justify-content:center;gap:6px;padding:18px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft);color:var(--text);text-decoration:none}.os-ai span{color:var(--muted);font-size:13px}.os-ai strong{font-size:18px;}
    .os-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.os-card{padding:20px;animation:item-rise .48s cubic-bezier(.2,.8,.2,1) both}.os-card h2{margin:8px 0 8px;font-size:20px}.os-card small{color:var(--primary);font-weight:800}.os-card p{color:var(--muted);margin:0}.os-card.is-large{min-height:220px;}
    .os-chip-row{display:flex;flex-wrap:wrap;gap:8px;align-content:flex-start}.os-chip-row span{border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft);color:var(--text);padding:8px 10px;font-weight:700;}
    .os-search{font-size:18px;margin:0 0 18px}.os-profile-card{display:flex;gap:18px;align-items:center;padding:24px}.os-profile-card .os-avatar{width:84px;height:84px;font-size:36px}
    .os-lock{padding:18px;margin-bottom:18px;border-color:var(--danger, #ff9a9a)}
    .audit-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(280px,.8fr);gap:14px;margin-bottom:14px}
    .audit-facts{display:grid;gap:12px;margin:0}.audit-facts div{padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft)}.audit-facts dt{color:var(--muted);font-size:13px}.audit-facts dd{margin:6px 0 0;color:var(--text);overflow-wrap:anywhere;font-weight:750}
    .audit-stats{display:grid;gap:10px}.audit-stats span{display:flex;align-items:center;justify-content:space-between;padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft);color:var(--muted)}.audit-stats strong{color:var(--text);font-size:26px}
    .audit-section{margin-top:14px}.audit-table{overflow:auto}.audit-row{display:grid;grid-template-columns:1.1fr .8fr 1fr .8fr .8fr .8fr .8fr .7fr .8fr;gap:10px;padding:12px;border-top:1px solid var(--border);min-width:980px}.audit-row:first-child{border-top:0}.audit-head{background:var(--surface-soft)}.audit-row span{color:var(--muted);overflow-wrap:anywhere}
    .audit-current,.audit-devices,.audit-timeline,.audit-alerts{display:grid;gap:10px;color:var(--muted)}.audit-device-card{display:grid;gap:6px;padding:14px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft)}.audit-device-card strong{color:var(--text)}.audit-device-card em{color:var(--primary);font-style:normal;font-weight:800}.audit-timeline section{padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft)}.audit-timeline h3{margin:0 0 8px}.audit-timeline p,.audit-alerts p{margin:0;padding:8px 0;border-top:1px solid var(--border)}.audit-timeline p:first-of-type{border-top:0}
    .admin-motion-page{animation:admin-page-enter .25s ease both}.admin-scan{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;align-items:center;margin-bottom:16px;padding:16px;border:1px solid var(--border);border-radius:var(--radius);background:linear-gradient(135deg,var(--card),var(--surface-soft));overflow:hidden;position:relative}.admin-scan:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--primary) 14%,transparent),transparent);transform:translateX(-100%);animation:none}.admin-scan span{width:12px;height:12px;border-radius:99px;background:var(--primary);box-shadow:0 0 0 6px color-mix(in srgb,var(--primary) 12%,transparent);animation:none}.admin-scan strong{position:relative;color:var(--text)}.admin-scan p{position:relative;grid-column:2;margin:0;color:var(--muted)}
    .admin-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:16px}.admin-motion-card,.admin-metrics article{padding:18px;border:1px solid var(--border);border-radius:var(--radius);background:var(--card);box-shadow:var(--shadow-soft);animation:admin-item-enter .34s ease both;animation-delay:calc(var(--stagger,0) * 54ms);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.admin-motion-card:hover,.admin-metrics article:hover{transform:translateY(-3px);border-color:var(--border-strong);box-shadow:var(--shadow)}.admin-metrics span,.admin-motion-card small{display:block;color:var(--muted);font-weight:750}.admin-metrics strong{display:block;margin-top:8px;font-size:34px;color:var(--text)}
    .admin-dashboard-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:14px}.admin-dashboard-grid .danger-event-card{grid-column:1/-1}.admin-section-card{min-height:260px}.admin-section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.admin-section-head h2{margin:0}.admin-section-head span{color:var(--muted);font-size:13px}.status-pulse{width:10px;height:10px;border-radius:50%;background:var(--primary);animation:none}
    .admin-mini-row,.admin-log-row,.admin-risk{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center;padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft);transition:background .18s ease,border-color .18s ease,transform .18s ease}.admin-mini-row+.admin-mini-row,.admin-log-row+.admin-log-row,.admin-risk+.admin-risk{margin-top:8px}.admin-mini-row:hover,.admin-log-row:hover{background:color-mix(in srgb,var(--surface-soft) 70%,var(--primary) 5%);border-color:var(--border-strong)}.admin-mini-row strong,.admin-log-row strong,.admin-risk strong{display:block;color:var(--text)}.admin-mini-row small,.admin-log-row small,.admin-risk small{color:var(--muted)}.admin-avatar{display:grid;place-items:center;width:34px;height:34px;border-radius:var(--radius);background:var(--primary);color:var(--primary-ink);font-weight:900}.admin-badge{display:inline-flex;align-items:center;justify-content:center;min-width:70px;padding:6px 8px;border-radius:var(--radius);border:1px solid var(--border);background:var(--surface-soft);color:var(--muted);font-style:normal;font-size:12px;font-weight:800;transition:background .18s ease,color .18s ease,border-color .18s ease}.admin-badge.active,.admin-badge.info{color:var(--primary);border-color:color-mix(in srgb,var(--primary) 40%,var(--border))}.admin-badge.suspended,.admin-badge.warning{color:#d99a2b;border-color:color-mix(in srgb,#d99a2b 46%,var(--border))}.admin-badge.banned,.admin-badge.danger{color:var(--danger);border-color:color-mix(in srgb,var(--danger) 46%,var(--border))}
    .admin-risk.warning{border-color:color-mix(in srgb,#d99a2b 44%,var(--border))}.admin-risk.danger,.danger-event-card.pulse-once{border-color:color-mix(in srgb,var(--danger) 58%,var(--border));box-shadow:0 0 0 1px color-mix(in srgb,var(--danger) 18%,transparent),var(--shadow-soft)}.pulse-once{animation:danger-glow 1.1s ease 1}.log-dot{width:10px;height:10px;border-radius:99px;background:var(--primary)}.admin-log-row.warning .log-dot{background:#d99a2b}.admin-log-row.danger .log-dot{background:var(--danger)}
    .admin-toolbar{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-bottom:14px}.admin-toolbar .os-search{margin:0}.admin-toolbar input,.admin-toolbar select{width:100%;height:56px;min-height:56px;box-sizing:border-box;background:var(--surface-soft);color:var(--text);border:1px solid var(--border);border-radius:var(--radius);padding:0 14px;font-size:16px}.admin-table-row select{width:100%;min-height:42px;background:var(--surface-soft);color:var(--text);border:1px solid var(--border);border-radius:var(--radius);padding:8px 10px}.admin-toolbar input:focus,.admin-toolbar select:focus{border-color:var(--primary);box-shadow:0 0 0 4px color-mix(in srgb,var(--primary) 14%,transparent)}
    .admin-table-card{overflow:hidden}.admin-data-table{overflow:auto}.admin-table-row{display:grid;grid-template-columns:.8fr 1fr 1.45fr .55fr .8fr .9fr 1fr 1fr 1fr .8fr;gap:10px;align-items:center;min-width:1180px;padding:12px;border-top:1px solid var(--border);transition:background .18s ease}.admin-table-row:first-child{border-top:0}.admin-table-row:hover{background:color-mix(in srgb,var(--surface-soft) 68%,var(--primary) 5%)}.admin-table-head{position:sticky;top:0;z-index:1;background:var(--surface-soft)}.admin-table-row span{color:var(--muted);overflow-wrap:anywhere}.admin-table-row .mono{font-family:ui-monospace,Consolas,monospace;color:var(--quiet)}
    .animated-row{animation:admin-row-enter .24s ease both;animation-delay:calc(var(--stagger,0) * 28ms)}[data-admin-path="true"] .admin-motion-card,[data-admin-path="true"] .admin-metrics article,[data-admin-path="true"] .admin-user-table .animated-row,[data-admin-path="true"] .admin-log-timeline .animated-row{animation:none!important}.row-flash-warning{animation:row-flash-warning .8s ease 1}.row-flash-success{animation:row-flash-success .8s ease 1}.admin-detail-card{margin-top:14px}.admin-detail-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}.admin-detail-grid>div{padding:14px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft)}.admin-detail-grid p{margin:6px 0;color:var(--muted);overflow-wrap:anywhere}
    .admin-role-summary{margin-bottom:14px}.admin-role-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-bottom:14px}.admin-role-cards strong{display:block;margin-top:12px;color:var(--text)}.admin-unsaved{padding:10px 12px;margin-top:12px;border:1px solid color-mix(in srgb,#d99a2b 50%,var(--border));border-radius:var(--radius);background:color-mix(in srgb,#d99a2b 12%,transparent);color:var(--text);animation:admin-item-enter .18s ease both}.permission-group{border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft);margin-top:10px;overflow:hidden}.permission-group summary{cursor:pointer;padding:13px 14px;color:var(--text);font-weight:900}.permission-grid{display:grid;grid-template-columns:minmax(220px,1fr) repeat(3,110px);gap:1px;background:var(--border);border-top:1px solid var(--border)}.permission-grid>*{background:var(--card);padding:12px}.permission-key strong,.permission-key small{display:block}.permission-key small{margin-top:4px;color:var(--muted)}.switch-cell{display:grid;place-items:center}.switch-cell input{position:absolute;opacity:0;pointer-events:none}.switch-cell span{width:42px;height:24px;border-radius:99px;border:1px solid var(--border);background:var(--surface-soft);position:relative;transition:background .18s ease,border-color .18s ease,box-shadow .18s ease}.switch-cell span:before{content:"";position:absolute;width:18px;height:18px;left:2px;top:2px;border-radius:50%;background:var(--muted);transition:transform .18s ease,background .18s ease}.switch-cell input:checked+span{background:color-mix(in srgb,var(--primary) 30%,var(--surface-soft));border-color:var(--primary)}.switch-cell input:checked+span:before{transform:translateX(18px);background:var(--primary)}.switch-cell.updated span{box-shadow:0 0 0 4px color-mix(in srgb,var(--primary) 18%,transparent)}
    #admin-recent-users,#admin-recent-users *,#admin-recent-logs,#admin-recent-logs *,#admin-risk-list,#admin-risk-list *{cursor:default!important}#admin-recent-logs .animated-row,.admin-user-table .animated-row{animation:none!important}.danger-event-card.pulse-once{animation:none!important}
    .admin-log-timeline{display:grid;gap:8px}.admin-log-row{cursor:pointer;grid-template-columns:auto minmax(0,1fr) auto}#admin-recent-logs .admin-log-row{cursor:default}.admin-drawer{position:fixed;inset:0 0 0 auto;width:min(520px,calc(100vw - 24px));padding:22px;background:var(--card);border-left:1px solid var(--border);box-shadow:var(--shadow);transform:translateX(104%);transition:transform .22s ease;z-index:40;overflow:auto}.admin-drawer.is-open{transform:translateX(0)}.admin-drawer h2{margin-top:34px}.admin-drawer-facts{display:grid;gap:8px}.admin-drawer-facts div{padding:10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft)}.admin-drawer-facts dt{color:var(--muted);font-size:12px}.admin-drawer-facts dd{margin:4px 0 0;color:var(--text);overflow-wrap:anywhere}.admin-drawer pre{white-space:pre-wrap;padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft);color:var(--muted)}
    .admin-primary,.admin-ghost,.admin-danger{min-height:38px;width:auto;border-radius:var(--radius);font-weight:850;transition:transform .14s ease,box-shadow .14s ease,background .14s ease,border-color .14s ease}.admin-primary{background:var(--primary);color:var(--primary-ink);border:1px solid var(--primary)}.admin-primary:disabled{opacity:.48;cursor:not-allowed}.admin-ghost{background:var(--surface-soft);color:var(--text);border:1px solid var(--border)}.admin-danger{background:linear-gradient(135deg,color-mix(in srgb,var(--danger) 85%,#111),var(--danger));color:#fff;border:1px solid color-mix(in srgb,var(--danger) 70%,var(--border))}.admin-ghost:hover,.admin-primary:hover,.admin-danger:hover{transform:translateY(-1px);box-shadow:var(--shadow-soft)}.admin-danger:hover{box-shadow:0 12px 26px color-mix(in srgb,var(--danger) 24%,transparent)}.admin-ghost:active,.admin-primary:active,.admin-danger:active{transform:scale(.96)}
    .admin-empty-state{display:grid;place-items:center;gap:10px;min-height:150px;padding:22px;border:1px dashed var(--border-strong);border-radius:var(--radius);background:var(--surface-soft);text-align:center;animation:admin-item-enter .24s ease both}.admin-empty-orb{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:var(--primary);color:var(--primary-ink);font-weight:900;animation:empty-float 2.8s ease-in-out infinite}.admin-empty{color:var(--muted)}
    .skeleton-line{height:44px;border-radius:var(--radius);background:linear-gradient(90deg,var(--surface-soft),color-mix(in srgb,var(--primary) 10%,var(--surface-soft)),var(--surface-soft));background-size:240% 100%;animation:skeleton-shimmer 1.2s ease-in-out infinite;margin-bottom:10px}.admin-skeleton strong{color:transparent;border-radius:var(--radius);background:linear-gradient(90deg,var(--surface-soft),color-mix(in srgb,var(--primary) 10%,var(--surface-soft)),var(--surface-soft));background-size:240% 100%;animation:skeleton-shimmer 1.2s ease-in-out infinite}
    #admin-toast-host{position:fixed;right:18px;top:18px;z-index:60;display:grid;gap:10px;max-width:min(360px,calc(100vw - 36px))}.admin-toast{display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid var(--border);border-radius:var(--radius);background:var(--card);box-shadow:var(--shadow);color:var(--text);animation:toast-in .2s ease both}.admin-toast strong{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:var(--primary);color:var(--primary-ink)}.admin-toast.warning strong{background:#d99a2b;color:#121212}.admin-toast.danger strong{background:var(--danger);color:#fff}.admin-toast.is-hiding{animation:toast-out .25s ease both}
    .admin-confirm-backdrop{position:fixed;inset:0;z-index:55;display:grid;place-items:center;background:rgba(0,0,0,.42);opacity:0;pointer-events:none;transition:opacity .18s ease}.admin-confirm-backdrop.is-open{opacity:1;pointer-events:auto}.admin-confirm{width:min(440px,calc(100vw - 32px));padding:20px;border:1px solid var(--border);border-radius:var(--radius);background:var(--card);box-shadow:var(--shadow);transform:scale(.95);opacity:0;transition:transform .18s ease,opacity .18s ease}.admin-confirm-backdrop.is-open .admin-confirm{transform:scale(1);opacity:1}.admin-confirm.is-danger{border-color:color-mix(in srgb,var(--danger) 48%,var(--border))}.admin-confirm h3{margin:0 0 8px}.admin-confirm p{margin:0 0 14px;color:var(--muted)}.admin-confirm input{margin-bottom:10px;background:var(--surface-soft)}.admin-confirm input.is-error{border-color:var(--danger);box-shadow:0 0 0 4px color-mix(in srgb,var(--danger) 16%,transparent)}.admin-confirm-actions{display:flex;justify-content:flex-end;gap:10px}
    @keyframes admin-page-enter{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes admin-item-enter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes admin-row-enter{from{opacity:0}to{opacity:1}}@keyframes admin-scan{0%{transform:translateX(-100%)}45%,100%{transform:translateX(100%)}}@keyframes status-pulse{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--primary) 28%,transparent)}50%{box-shadow:0 0 0 8px transparent}}@keyframes skeleton-shimmer{from{background-position:120% 0}to{background-position:-120% 0}}@keyframes toast-in{from{opacity:0;transform:translateX(22px)}to{opacity:1;transform:translateX(0)}}@keyframes toast-out{to{opacity:0;transform:translateX(22px)}}@keyframes danger-glow{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--danger) 34%,transparent)}100%{box-shadow:0 0 0 16px transparent}}@keyframes row-flash-warning{0%{background:color-mix(in srgb,#d99a2b 20%,transparent)}100%{background:transparent}}@keyframes row-flash-success{0%{background:color-mix(in srgb,#22c55e 18%,transparent)}100%{background:transparent}}@keyframes empty-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@keyframes confirm-shake{0%,100%{transform:translateX(0) scale(1)}25%{transform:translateX(-6px) scale(1)}75%{transform:translateX(6px) scale(1)}}.shake-once{animation:confirm-shake .25s ease 1}
    @media (max-width:1050px){
      body.os-shell{height:100dvh;overflow:hidden;box-sizing:border-box}
      .os-layout{height:calc(100dvh - 48px);min-height:0;display:block}
      .os-sidebar,.os-main{height:100%;min-height:0;box-sizing:border-box;overflow-y:auto;overscroll-behavior:contain}
      .os-sidebar{position:static;scrollbar-width:thin;scrollbar-color:transparent transparent}
      .os-sidebar::-webkit-scrollbar{width:8px}
      .os-sidebar::-webkit-scrollbar-track{background:transparent}
      .os-sidebar::-webkit-scrollbar-thumb{background:transparent;border-radius:999px}
      .os-sidebar:hover{scrollbar-color:var(--border-strong) transparent}
      .os-sidebar:hover::-webkit-scrollbar-thumb{background:var(--border-strong)}
      html.compact-menu-view .os-sidebar,
      html:not(.compact-content-view):not(.compact-menu-view) .os-sidebar{display:block}
      html.compact-menu-view .os-main,
      html:not(.compact-content-view):not(.compact-menu-view) .os-main{display:none}
      html.compact-content-view .os-sidebar{display:none}
      html.compact-content-view .os-main{display:block;padding-top:72px}
      .compact-back-zone{display:none;position:fixed;top:0;left:0;width:92px;height:92px;z-index:85}
      html.compact-content-view .compact-back-zone{display:block}
      .compact-back-button{
        position:absolute;
        top:14px;
        left:14px;
        display:grid;
        place-items:center;
        width:48px;
        height:48px;
        min-width:48px;
        min-height:48px;
        padding:0;
        border:1px solid rgba(255,255,255,.58);
        border-radius:50%;
        background:linear-gradient(145deg,rgba(255,255,255,.72),rgba(255,255,255,.34));
        -webkit-backdrop-filter:blur(22px) saturate(180%);
        backdrop-filter:blur(22px) saturate(180%);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.82),
          inset 0 -1px 0 rgba(255,255,255,.18),
          0 8px 24px rgba(15,23,42,.16);
        color:#111;
        opacity:0;
        transform:translateY(-6px) scale(.94);
        pointer-events:none;
        cursor:pointer;
        transition:opacity .16s ease,transform .18s cubic-bezier(.2,.8,.2,1),background .18s ease,box-shadow .18s ease;
      }
      .compact-back-button svg{width:24px;height:24px;fill:none;stroke:#111;stroke-width:2.35;stroke-linecap:round;stroke-linejoin:round}
      .compact-back-zone:hover .compact-back-button,
      .compact-back-zone:focus-within .compact-back-button{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}
      .compact-back-button:hover{
        background:linear-gradient(145deg,rgba(255,255,255,.82),rgba(255,255,255,.44));
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.9),
          inset 0 -1px 0 rgba(255,255,255,.22),
          0 10px 28px rgba(15,23,42,.2);
        transform:translateY(0) scale(1.04);
      }
      .compact-back-button:active{transform:translateY(0) scale(.94)}
      .os-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      .os-hero{grid-template-columns:1fr;display:grid}
      .os-ai{min-width:0}
      .admin-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}
      .admin-dashboard-grid,.admin-role-cards,.admin-detail-grid{grid-template-columns:1fr}
      .admin-toolbar{grid-template-columns:1fr 1fr}
      .permission-grid{grid-template-columns:minmax(190px,1fr) repeat(3,86px)}
      .audit-grid{grid-template-columns:1fr}
    }
    @media (max-width:1050px) and (hover:none) and (pointer:coarse){
      .compact-back-button{opacity:1;transform:none;pointer-events:auto}
    }
    @media (max-width:560px){
      body.os-shell{padding:14px}
      .os-layout{height:calc(100dvh - 28px)}
      .os-main{padding:20px 16px}
      html.compact-content-view .os-main{padding-top:64px}
      .os-grid,.admin-metrics{grid-template-columns:1fr}
      .os-profile-card{align-items:flex-start;flex-direction:column}
      .admin-toolbar{grid-template-columns:1fr}
      .permission-grid{grid-template-columns:minmax(150px,1fr) repeat(3,70px)}
      .admin-drawer{width:calc(100vw - 12px)}
    }
    @media (prefers-reduced-motion:reduce){body.os-shell,.os-sidebar,.os-main,.os-card,.admin-motion-page,.admin-motion-card,.admin-metrics article,.animated-row,.admin-scan:before,.status-pulse,.admin-empty-orb,.skeleton-line,.admin-skeleton strong{animation:none !important;transition:none !important}.admin-motion-card:hover,.admin-metrics article:hover,.admin-ghost:hover,.admin-primary:hover,.admin-danger:hover{transform:none !important}}
  </style>`;
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
    usernameHelp: "用户名必须唯一；不能包含 Tianguo、admin、administrator 或任何包含 admin 的大小写变体。",
    usernameChecking: "正在检查用户名…",
    usernameAvailable: "用户名可用",
    usernameTaken: "这个用户名已经被使用。",
    usernameReserved: "这个用户名属于保留名称，请更换。",
    usernameTooShort: "用户名至少需要 3 个字符。",
    realNameTitle: "填写真实姓名",
    realNameHelpZhIp: "请填写你的真实姓名。姓和名都必须使用汉字，并分别选择实际字数。",
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
    emailHelp: "请输入完整邮箱地址，必须同时包含 @ 和域名中的 .。",
    invalidEmail: "请输入有效邮箱，例如 name@example.com。",
    passwordTitle: "设置密码",
    passwordHelp: "密码必须满足以下全部要求。",
    passwordStrength: "密码强度",
    passwordLength: "至少 8 个字符",
    passwordNumber: "至少 1 个数字",
    passwordUpper: "至少 1 个大写字母",
    passwordLower: "至少 1 个小写字母",
    passwordSpecial: "至少 1 个特殊字符",
    creating: "正在创建账户…",
    avatarFailed: "账户已创建，但头像保存失败，你可以稍后重新设置。"
  } : {
    usernameHelp: "Your username must be unique and cannot contain Tianguo, admin, administrator, or any case variation containing admin.",
    usernameChecking: "Checking username…",
    usernameAvailable: "Username is available",
    usernameTaken: "This username is already in use.",
    usernameReserved: "This username is reserved. Choose another one.",
    usernameTooShort: "Username must contain at least 3 characters.",
    realNameTitle: "Enter your real name",
    realNameHelpZhIp: "Enter your real name using Chinese characters, then select the exact character count for your family and given names.",
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
    emailHelp: "Enter a complete email address containing @ and a dot in the domain.",
    invalidEmail: "Enter a valid email such as name@example.com.",
    passwordTitle: "Set a password",
    passwordHelp: "Your password must meet every requirement below.",
    passwordStrength: "Password strength",
    passwordLength: "At least 8 characters",
    passwordNumber: "At least 1 number",
    passwordUpper: "At least 1 uppercase letter",
    passwordLower: "At least 1 lowercase letter",
    passwordSpecial: "At least 1 special character",
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
    .password-meter{height:7px;margin-top:10px;border-radius:999px;background:var(--surface-soft);overflow:hidden;border:1px solid var(--border)}
    .password-meter span{display:block;width:0;height:100%;background:var(--primary);transition:width .18s ease,background .18s ease}
    .password-rules{display:grid;gap:7px;margin:12px 0 0;padding:0;list-style:none}
    .password-rules li{display:flex;align-items:center;gap:8px;color:var(--muted);font-size:13px}
    .password-rules li::before{content:"○";font-weight:900;color:var(--quiet)}
    .password-rules li.is-met{color:var(--text)}
    .password-rules li.is-met::before{content:"✓";color:#2f9b63}
    @media (max-width:560px){.name-count-grid,.avatar-actions{grid-template-columns:1fr}}
  </style>
</head>
<body>
  ${topControls(links, t)}
  <div class="card">
    <h1 class="brand-title">${t.studioName}</h1>
    <p>${t.signUpDescription}</p>

    <div id="step-username">
      <p>${t.chooseUsername}</p>
      <small class="signup-help">${copy.usernameHelp}</small>
      <input id="username" type="text" placeholder="${t.usernamePlaceholder}" autocomplete="username">
      <div id="username-status" class="signup-status"></div>
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
      <input id="password" type="password" placeholder="${t.passwordPlaceholder}" autocomplete="new-password">
      <div class="password-meter"><span id="password-meter-fill"></span></div>
      <ul class="password-rules">
        <li id="password-rule-length">${copy.passwordLength}</li>
        <li id="password-rule-number">${copy.passwordNumber}</li>
        <li id="password-rule-upper">${copy.passwordUpper}</li>
        <li id="password-rule-lower">${copy.passwordLower}</li>
        <li id="password-rule-special">${copy.passwordSpecial}</li>
      </ul>
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
    const usernameNextBtn = document.getElementById("username-next-btn");

    async function checkUsernameAvailability() {
      const value = usernameInput.value.trim();
      const localReason = usernameLocalReason(value);
      usernameIsAvailable = false;
      setButtonState(usernameNextBtn, false);
      if (localReason) {
        setStatus(usernameStatus, usernameMessage(localReason), "is-bad");
        return false;
      }

      const sequence = ++usernameCheckSequence;
      setStatus(usernameStatus, ${JSON.stringify(copy.usernameChecking)});
      const { data, error } = await supabaseClient.rpc("check_registration_username", { p_username: value });
      if (sequence !== usernameCheckSequence) return false;
      if (error) {
        setStatus(usernameStatus, ${JSON.stringify(zh ? "暂时无法检查用户名，请稍后再试。" : "Unable to check the username right now.")}, "is-bad");
        return false;
      }
      if (!data?.available) {
        setStatus(usernameStatus, usernameMessage(data?.reason || "username_taken"), "is-bad");
        return false;
      }
      usernameIsAvailable = true;
      setStatus(usernameStatus, ${JSON.stringify(copy.usernameAvailable)}, "is-good");
      setButtonState(usernameNextBtn, true);
      return true;
    }

    usernameInput.addEventListener("input", () => {
      clearTimeout(usernameCheckTimer);
      usernameIsAvailable = false;
      setButtonState(usernameNextBtn, false);
      const reason = usernameLocalReason(usernameInput.value);
      if (reason) {
        setStatus(usernameStatus, usernameMessage(reason), "is-bad");
        return;
      }
      setStatus(usernameStatus, "");
      usernameCheckTimer = window.setTimeout(checkUsernameAvailability, 350);
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
        /^\p{Script=Han}+$/u.test(text);
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
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
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
        number: /\d/.test(value),
        upper: /[A-Z]/.test(value),
        lower: /[a-z]/.test(value),
        special: /[^A-Za-z0-9\s]/.test(value)
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
      setButtonState(createAccountBtn, percent === 100);
    }

    passwordInput.addEventListener("input", updatePasswordStrength);

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
