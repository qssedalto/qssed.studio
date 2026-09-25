import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { verifyStudioApiSession, withStudioSessionCookies } from "./session-gate.js";
import { json } from "./routing.js";

export const ACCESS_AUDIT_ROOT = "__system/access-audit/";
export const ACCESS_AUDIT_RETENTION_DAYS = 14;

const MAX_LIST_LIMIT = 200;
const MAX_SCAN_OBJECTS = 1200;
const SENSITIVE_QUERY_KEY = /(?:token|code|secret|password|passwd|pwd|session|auth|authorization|key|signature|sig|credential|cookie|jwt|state|email|phone)/i;
const SECURITY_AUDIT_PATH = /^\/(?:admin(?:\/|$)|api\/admin(?:\/|$)|auth(?:\/|$)|login(?:\/|$)|logout(?:\/|$)|oauth(?:\/|$)|gpt\/handoff(?:\/|$)|api\/storage(?:\/|$)|api\/ai\/admin(?:\/|$))/i;

export function shouldRecordAccessAudit(request, response, source = "studio") {
  const method = String(request?.method || "GET").toUpperCase();
  const status = Number(response?.status || 0);
  const url = safeUrl(request?.url || "https://qsseda.com/");
  const path = String(url.pathname || "/");

  if (method !== "GET" && method !== "HEAD") return true;
  if (status === 401 || status === 403 || status === 429 || status >= 500) return true;
  if (SECURITY_AUDIT_PATH.test(path)) return true;
  if (source === "auth" && /^\/(?:callback|verify|recover|reset)(?:\/|$)/i.test(path)) return true;
  return false;
}


export async function recordAccessAudit(request, response, env, startedAt, source = "studio") {
  if (!hasAuditStorage(env)) return;
  if (!shouldRecordAccessAudit(request, response, source)) return;

  const now = new Date();
  const url = safeUrl(request.url);
  const cf = request.cf || {};
  const ua = cleanHeader(request.headers.get("User-Agent"), 1200);
  const client = detectClient(ua, request.headers);
  const durationMs = Math.max(0, Date.now() - Number(startedAt || Date.now()));
  const ip = cleanHeader(request.headers.get("CF-Connecting-IP"), 80) || "unknown";
  const timezone = cleanText(cf.timezone, 80) || "UTC";
  const timestampUtc = now.toISOString();
  const visitorLocalTime = formatLocalTime(now, timezone);
  const query = sanitizeSearchParams(url.searchParams);
  const referer = sanitizeReferer(request.headers.get("Referer"));
  const botManagement = cf.botManagement || {};
  const requestId = crypto.randomUUID();

  const record = {
    schema_version: 1,
    request_id: requestId,
    source: cleanText(source, 40) || "studio",
    timestamp_ms: now.getTime(),
    timestamp_utc: timestampUtc,
    visitor_timezone: timezone,
    visitor_local_time: visitorLocalTime,
    duration_ms: durationMs,
    request: {
      scheme: url.protocol.replace(":", ""),
      host: cleanText(url.host, 180),
      method: cleanText(request.method, 16),
      path: cleanText(url.pathname, 1200),
      query,
      query_keys: [...new Set([...url.searchParams.keys()].map(value => cleanText(value, 120)).filter(Boolean))].slice(0, 80),
      referer,
      accept: cleanHeader(request.headers.get("Accept"), 600),
      accept_language: cleanHeader(request.headers.get("Accept-Language"), 300),
      sec_fetch_site: cleanHeader(request.headers.get("Sec-Fetch-Site"), 80),
      sec_fetch_mode: cleanHeader(request.headers.get("Sec-Fetch-Mode"), 80),
      sec_fetch_dest: cleanHeader(request.headers.get("Sec-Fetch-Dest"), 80),
      has_cookie_header: Boolean(request.headers.get("Cookie")),
      has_authorization_header: Boolean(request.headers.get("Authorization"))
    },
    response: {
      status: Number(response?.status || 500),
      content_type: cleanHeader(response?.headers?.get?.("Content-Type"), 240),
      cache_control: cleanHeader(response?.headers?.get?.("Cache-Control"), 240)
    },
    network: {
      ip,
      cf_ray: cleanHeader(request.headers.get("CF-Ray"), 120),
      country: cleanText(cf.country, 8),
      region: cleanText(cf.region, 120),
      region_code: cleanText(cf.regionCode, 24),
      city: cleanText(cf.city, 160),
      timezone,
      colo: cleanText(cf.colo, 24),
      asn: Number.isFinite(Number(cf.asn)) ? Number(cf.asn) : null,
      as_organization: cleanText(cf.asOrganization, 240),
      http_protocol: cleanText(cf.httpProtocol, 40),
      tls_version: cleanText(cf.tlsVersion, 40),
      tls_cipher: cleanText(cf.tlsCipher, 100),
      client_tcp_rtt_ms: Number.isFinite(Number(cf.clientTcpRtt)) ? Number(cf.clientTcpRtt) : null
    },
    client: {
      user_agent: ua,
      device_type: client.deviceType,
      device_name: client.deviceName,
      os: client.os,
      browser: client.browser,
      app: client.app,
      is_mobile: client.isMobile,
      hints: {
        ua: cleanHeader(request.headers.get("Sec-CH-UA"), 500),
        platform: cleanHeader(request.headers.get("Sec-CH-UA-Platform"), 120),
        mobile: cleanHeader(request.headers.get("Sec-CH-UA-Mobile"), 32),
        model: cleanHeader(request.headers.get("Sec-CH-UA-Model"), 160)
      }
    },
    bot: {
      verified: botManagement.verifiedBot === true,
      score: Number.isFinite(Number(botManagement.score)) ? Number(botManagement.score) : null,
      static_resource: botManagement.staticResource === true
    }
  };

  const key = auditObjectKey(now, requestId);
  const customMetadata = {
    timestamp: timestampUtc,
    host: cleanMetadata(url.host, 120),
    method: cleanMetadata(request.method, 16),
    path: cleanMetadata(url.pathname, 360),
    status: String(record.response.status),
    ip: cleanMetadata(ip, 80),
    country: cleanMetadata(record.network.country, 8),
    device: cleanMetadata(client.deviceType, 40),
    os: cleanMetadata(client.os, 60),
    browser: cleanMetadata(client.browser, 60),
    app: cleanMetadata(client.app, 60),
    source: cleanMetadata(record.source, 40)
  };

  await env.STORAGE.put(key, JSON.stringify(record), {
    httpMetadata: { contentType: "application/json;charset=UTF-8" },
    customMetadata
  });
}

export async function handleAccessAuditAdmin(request, env) {
  if (!hasAuditStorage(env)) return json({ error: "Access audit storage is unavailable." }, 503);
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!sameOrigin(request)) return json({ error: "Invalid origin." }, 403);

  const auth = await verifyAdministrator(request);
  if (auth.error) return auth.error;
  return withStudioSessionCookies(await runAccessAuditAdmin(request, env), auth.cookies);
}

export async function handleAuthorizedAccessAuditAdmin(request, env) {
  if (!hasAuditStorage(env)) return json({ error: "Access audit storage is unavailable." }, 503);
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!sameOrigin(request)) return json({ error: "Invalid origin." }, 403);
  return runAccessAuditAdmin(request, env);
}

async function runAccessAuditAdmin(request, env) {
  let body = {};
  try { body = await request.json(); } catch { body = {}; }
  if (!body || typeof body !== "object" || Array.isArray(body)) body = {};

  const action = String(body.action || "list");
  if (action === "detail") return auditDetail(env, body);
  if (action === "list") return auditList(env, body);
  if (action === "summary") return auditSummary(env, body);
  return json({ error: "Unknown access audit action." }, 400);
}

export async function cleanupAccessAudit(env, retentionDays = ACCESS_AUDIT_RETENTION_DAYS) {
  if (!hasAuditStorage(env)) return { deleted: 0, scanned: 0 };
  const days = Math.max(1, Math.min(Number(retentionDays) || ACCESS_AUDIT_RETENTION_DAYS, 3650));
  const cutoff = Date.now() - days * 86400000;
  let cursor;
  let deleted = 0;
  let scanned = 0;

  do {
    const page = await env.STORAGE.list({
      prefix: ACCESS_AUDIT_ROOT,
      cursor,
      limit: 1000,
      include: ["customMetadata"]
    });
    const keys = [];
    for (const object of page.objects || []) {
      scanned += 1;
      const timestamp = Date.parse(object.customMetadata?.timestamp || object.uploaded?.toISOString?.() || "");
      if (Number.isFinite(timestamp) && timestamp < cutoff) keys.push(object.key);
      if (keys.length >= 500) break;
    }
    if (keys.length) {
      await env.STORAGE.delete(keys);
      deleted += keys.length;
    }
    cursor = page.cursor;
    if (!page.truncated || !cursor || deleted >= 10000 || scanned >= 20000) break;
  } while (cursor);

  return { deleted, scanned, retention_days: days };
}

async function auditList(env, body) {
  const date = normalizeAuditDate(body.date);
  const prefix = date ? `${ACCESS_AUDIT_ROOT}${date.replaceAll("-", "/")}/` : ACCESS_AUDIT_ROOT;
  const limit = clampInt(body.limit, 1, MAX_LIST_LIMIT, 100);
  const filters = normalizeFilters(body.filters);
  let cursor = cleanText(body.cursor, 500) || undefined;
  let scanned = 0;
  const entries = [];

  do {
    const page = await env.STORAGE.list({
      prefix,
      cursor,
      limit: Math.min(1000, Math.max(100, limit * 3)),
      include: ["customMetadata"]
    });
    scanned += page.objects.length;
    for (const object of page.objects) {
      const meta = object.customMetadata || {};
      const entry = {
        key: object.key,
        uploaded_at: object.uploaded?.toISOString?.() || meta.timestamp || null,
        size: Number(object.size) || 0,
        timestamp: meta.timestamp || null,
        host: meta.host || "",
        method: meta.method || "",
        path: meta.path || "",
        status: Number(meta.status) || 0,
        ip: meta.ip || "",
        country: meta.country || "",
        device: meta.device || "",
        os: meta.os || "",
        browser: meta.browser || "",
        app: meta.app || "",
        source: meta.source || ""
      };
      if (!matchesFilters(entry, filters)) continue;
      entries.push(entry);
      if (entries.length >= limit) break;
    }
    cursor = page.cursor;
    if (entries.length >= limit || !page.truncated || !cursor || scanned >= MAX_SCAN_OBJECTS) break;
  } while (cursor);

  return json({
    entries,
    count: entries.length,
    scanned,
    date: date || null,
    next_cursor: entries.length >= limit ? cursor || null : null,
    retention_days: ACCESS_AUDIT_RETENTION_DAYS
  });
}

async function auditDetail(env, body) {
  const key = String(body.key || "");
  if (!isAuditKey(key)) return json({ error: "Invalid access audit key." }, 400);
  const object = await env.STORAGE.get(key);
  if (!object) return json({ error: "Access audit entry not found." }, 404);
  let record;
  try { record = JSON.parse(await object.text()); }
  catch { return json({ error: "Access audit entry is unreadable." }, 500); }
  return json({ key, record });
}

async function auditSummary(env, body) {
  const date = normalizeAuditDate(body.date) || new Date().toISOString().slice(0, 10);
  const prefix = `${ACCESS_AUDIT_ROOT}${date.replaceAll("-", "/")}/`;
  let cursor;
  let scanned = 0;
  const summary = {
    requests: 0,
    unique_ips: 0,
    status: {},
    hosts: {},
    countries: {},
    devices: {},
    apps: {}
  };
  const ips = new Set();

  do {
    const page = await env.STORAGE.list({ prefix, cursor, limit: 1000, include: ["customMetadata"] });
    for (const object of page.objects) {
      scanned += 1;
      const meta = object.customMetadata || {};
      summary.requests += 1;
      if (meta.ip) ips.add(meta.ip);
      increment(summary.status, meta.status || "unknown");
      increment(summary.hosts, meta.host || "unknown");
      increment(summary.countries, meta.country || "unknown");
      increment(summary.devices, meta.device || "unknown");
      increment(summary.apps, meta.app || "Browser");
      if (scanned >= 10000) break;
    }
    cursor = page.cursor;
    if (!page.truncated || !cursor || scanned >= 10000) break;
  } while (cursor);

  summary.unique_ips = ips.size;
  return json({ date, scanned, summary, partial: scanned >= 10000 });
}

async function verifyAdministrator(request) {
  const session = await verifyStudioApiSession(request);
  if (!session.ok) {
    return { error: withStudioSessionCookies(json({ error: "Authentication required." }, 401), session.cookies) };
  }

  let response;
  try {
    response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/verify_admin_session`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${session.accessToken}`,
        "content-type": "application/json;charset=UTF-8",
        Accept: "application/json"
      },
      body: "{}"
    });
  } catch {
    return { error: withStudioSessionCookies(json({ error: "Administrator service is temporarily unavailable." }, 503), session.cookies) };
  }

  if (!response.ok) {
    return { error: withStudioSessionCookies(json({ error: "Administrator service is temporarily unavailable." }, response.status === 401 || response.status === 403 ? response.status : 502), session.cookies) };
  }

  let isAdmin = false;
  try { isAdmin = (await response.json()) === true; } catch {}
  if (!isAdmin) {
    return { error: withStudioSessionCookies(json({ error: "Administrator access required." }, 403), session.cookies) };
  }
  return { session, cookies: session.cookies };
}

function detectClient(userAgent, headers) {
  const ua = String(userAgent || "");
  const lower = ua.toLowerCase();
  const chMobile = String(headers.get("Sec-CH-UA-Mobile") || "") === "?1";
  let app = "Browser";
  if (lower.includes("wxwork")) app = "WeCom";
  else if (lower.includes("micromessenger")) app = "WeChat";
  else if (lower.includes("chatgpt")) app = "ChatGPT";
  else if (lower.includes("instagram")) app = "Instagram";
  else if (lower.includes("fbav") || lower.includes("fban")) app = "Facebook";

  let os = "Unknown";
  if (/iphone|ipod/i.test(ua)) os = "iOS";
  else if (/ipad/i.test(ua)) os = "iPadOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/windows nt/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/cros/i.test(ua)) os = "ChromeOS";
  else if (/linux/i.test(ua)) os = "Linux";

  let browser = "Unknown";
  if (/edgios|edga|edg\//i.test(ua)) browser = "Edge";
  else if (/crios/i.test(ua)) browser = "Chrome iOS";
  else if (/chrome|chromium/i.test(ua)) browser = "Chrome";
  else if (/fxios/i.test(ua)) browser = "Firefox iOS";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && /version\//i.test(ua)) browser = "Safari";
  else if (/applewebkit/i.test(ua)) browser = "WebView";

  const isTablet = /ipad|tablet/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua));
  const isMobile = chMobile || /iphone|ipod|mobile|android/i.test(ua);
  let deviceType = "desktop";
  if (isTablet) deviceType = "tablet";
  else if (isMobile) deviceType = "mobile";

  let deviceName = "Desktop";
  if (/iphone/i.test(ua)) deviceName = "iPhone";
  else if (/ipad/i.test(ua)) deviceName = "iPad";
  else if (/android/i.test(ua) && isTablet) deviceName = "Android Tablet";
  else if (/android/i.test(ua)) deviceName = "Android Phone";
  else if (os !== "Unknown") deviceName = `${os} Device`;

  return { app, os, browser, deviceType, deviceName, isMobile: deviceType !== "desktop" };
}

function sanitizeSearchParams(searchParams) {
  const result = [];
  let count = 0;
  for (const [keyRaw, valueRaw] of searchParams.entries()) {
    if (count >= 80) break;
    const key = cleanText(keyRaw, 120);
    const value = SENSITIVE_QUERY_KEY.test(key) ? "[REDACTED]" : cleanText(valueRaw, 240);
    result.push({ key, value });
    count += 1;
  }
  return result;
}

function sanitizeReferer(value) {
  const raw = cleanHeader(value, 1600);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    const params = sanitizeSearchParams(url.searchParams);
    const query = params.length
      ? "?" + params.map(item => `${encodeURIComponent(item.key)}=${encodeURIComponent(item.value)}`).join("&")
      : "";
    return cleanText(`${url.origin}${url.pathname}${query}`, 1600);
  } catch {
    return raw.slice(0, 800);
  }
}

function auditObjectKey(date, requestId) {
  const year = String(date.getUTCFullYear()).padStart(4, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const inverse = String(9999999999999 - date.getTime()).padStart(13, "0");
  return `${ACCESS_AUDIT_ROOT}${year}/${month}/${day}/${inverse}-${requestId}.json`;
}

function formatLocalTime(date, timezone) {
  try {
    return new Intl.DateTimeFormat("sv-SE", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    }).format(date).replace(" ", "T");
  } catch {
    return date.toISOString();
  }
}

function normalizeAuditDate(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
}

function normalizeFilters(value) {
  const input = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {
    host: cleanText(input.host, 180).toLowerCase(),
    ip: cleanText(input.ip, 80).toLowerCase(),
    path: cleanText(input.path, 360).toLowerCase(),
    status: cleanText(input.status, 8),
    country: cleanText(input.country, 8).toLowerCase(),
    device: cleanText(input.device, 40).toLowerCase(),
    app: cleanText(input.app, 60).toLowerCase()
  };
}

function matchesFilters(entry, filters) {
  if (filters.host && !String(entry.host).toLowerCase().includes(filters.host)) return false;
  if (filters.ip && !String(entry.ip).toLowerCase().includes(filters.ip)) return false;
  if (filters.path && !String(entry.path).toLowerCase().includes(filters.path)) return false;
  if (filters.status && String(entry.status) !== filters.status) return false;
  if (filters.country && !String(entry.country).toLowerCase().includes(filters.country)) return false;
  if (filters.device && !String(entry.device).toLowerCase().includes(filters.device)) return false;
  if (filters.app && !String(entry.app).toLowerCase().includes(filters.app)) return false;
  return true;
}

function increment(object, key) {
  const name = String(key || "unknown");
  object[name] = (object[name] || 0) + 1;
}

function isAuditKey(key) {
  return key.startsWith(ACCESS_AUDIT_ROOT) && !key.includes("..") && key.endsWith(".json") && key.length < 500;
}

function sameOrigin(request) {
  const url = new URL(request.url);
  return (request.headers.get("Origin") || "") === url.origin;
}

function hasAuditStorage(env) {
  return Boolean(env?.STORAGE && ["list", "get", "put", "delete"].every(method => typeof env.STORAGE[method] === "function"));
}

function safeUrl(value) {
  try { return new URL(value); }
  catch { return new URL("https://invalid.local/"); }
}

function cleanHeader(value, maximum = 500) {
  return cleanText(value, maximum);
}

function cleanMetadata(value, maximum = 120) {
  return cleanText(value, maximum).replace(/[\u0000-\u001f\u007f]/g, " ");
}

function cleanText(value, maximum = 500) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maximum);
}

function clampInt(value, minimum, maximum, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.trunc(number)));
}
