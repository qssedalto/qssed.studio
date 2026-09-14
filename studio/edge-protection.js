const ACCESS_COOKIE = "__Host-qsseda-studio-access";
const REFRESH_COOKIE = "__Host-qsseda-studio-refresh";
const MAX_PATH_LENGTH = 2048;
const MAX_QUERY_LENGTH = 4096;
const MIB = 1024 * 1024;

const AUTOMATION_UA = /(curl|wget|python-requests|python\/|scrapy|aiohttp|httpx|go-http-client|libwww-perl|apache-httpclient|okhttp|postmanruntime|insomnia|headlesschrome|phantomjs|selenium|puppeteer|playwright)/i;
const SCANNER_PATH = /(?:^|\/)(?:\.env(?:\.|$)|\.git(?:\/|$)|wp-admin(?:\/|$)|wp-login\.php$|xmlrpc\.php$|phpmyadmin(?:\/|$)|adminer\.php$|vendor\/phpunit(?:\/|$)|cgi-bin(?:\/|$)|server-status$)/i;
const EXPENSIVE_PATHS = new Set([
  "/api/knowledge/search",
  "/api/search/global",
  "/api/projects",
  "/api/tasks",
  "/api/drafts",
  "/api/workbench/overview",
  "/api/storage/files",
  "/api/summaries",
  "/api/user-links",
  "/api/profile/home",
  "/api/admin/overview",
  "/api/admin/users",
  "/api/admin/roles",
  "/api/admin/logs"
]);

export async function protectEdgeRequest(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  if (pathname === "/robots.txt") return robotsResponse();
  if (pathname.length > MAX_PATH_LENGTH || url.search.length > MAX_QUERY_LENGTH) return compactError(request, 414, "Request target is too long.");
  if (request.method === "TRACE" || request.method === "CONNECT") return compactError(request, 405, "Method not allowed.");
  if (SCANNER_PATH.test(pathname)) return scannerNotFound();
  const bodyLimit = requestBodyLimit(pathname);
  const declaredLength = declaredBodyLength(request);
  if (declaredLength !== null && declaredLength > bodyLimit) return compactError(request, 413, "Request body is too large.");
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!(await consume(env?.EDGE_GLOBAL_RATE_LIMITER, `edge:global:${ip}`))) return rateLimited(request);
  const claimedSession = hasStudioSessionCookie(request);
  if (!claimedSession && !(await consume(env?.EDGE_ANON_RATE_LIMITER, `edge:anon:${ip}`))) return rateLimited(request);
  const bot = botSignals(request);
  if (!bot.verified && bot.score >= 3 && !(await consume(env?.EDGE_SUSPECT_RATE_LIMITER, `edge:suspect:${ip}`))) return rateLimited(request);
  if (isExpensiveRequest(pathname, request.method) && !(await consume(env?.EDGE_EXPENSIVE_RATE_LIMITER, `edge:expensive:${pathname}:ip:${ip}`))) return rateLimited(request);
  return null;
}

export function applyEdgeProtectionHeaders(request, response) {
  const headers = new Headers(response.headers);
  const contentType = headers.get("content-type") || "";
  if (contentType.includes("text/html") || contentType.includes("application/json")) headers.set("x-robots-tag", "noindex, nofollow, noarchive, nosnippet");
  if (!headers.has("referrer-policy")) headers.set("referrer-policy", "strict-origin-when-cross-origin");
  if (!headers.has("x-content-type-options")) headers.set("x-content-type-options", "nosniff");
  if (!headers.has("permissions-policy")) headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  headers.delete("content-length");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export function botSignals(request) {
  const management = request.cf?.botManagement || null;
  if (management?.verifiedBot === true) return { verified: true, score: 0 };
  let score = 0;
  const ua = request.headers.get("User-Agent") || "";
  const accept = request.headers.get("Accept") || "";
  const fetchMode = request.headers.get("Sec-Fetch-Mode") || "";
  const fetchSite = request.headers.get("Sec-Fetch-Site") || "";
  const fetchDest = request.headers.get("Sec-Fetch-Dest") || "";
  if (!ua) score += 3;
  if (AUTOMATION_UA.test(ua)) score += 4;
  if (!accept || accept === "*/*") score += 1;
  if (!fetchMode && !fetchSite && !fetchDest) score += 1;
  const cloudflareScore = Number(management?.score);
  if (Number.isFinite(cloudflareScore)) {
    if (cloudflareScore <= 5) score += 6;
    else if (cloudflareScore <= 20) score += 3;
    else if (cloudflareScore <= 40) score += 1;
  }
  return { verified: false, score };
}

export function hasStudioSessionCookie(request) {
  const cookie = request.headers.get("Cookie") || "";
  return cookie.includes(`${ACCESS_COOKIE}=`) || cookie.includes(`${REFRESH_COOKIE}=`);
}

export function requestBodyLimit(pathname) {
  if (pathname === "/api/storage/upload") return 52 * MIB;
  if (pathname === "/api/profile/media") return 10 * MIB;
  if (pathname === "/api/auth/signup") return 6 * MIB;
  if (pathname.startsWith("/api/") || pathname === "/auth/handoff") return 2 * MIB;
  return 8 * MIB;
}

function isExpensiveRequest(pathname, method) {
  if (method !== "GET" && method !== "POST") return false;
  return EXPENSIVE_PATHS.has(pathname);
}

async function consume(limiter, key) {
  if (!limiter?.limit) return true;
  try { const result = await limiter.limit({ key }); return result?.success !== false; } catch { return true; }
}
function declaredBodyLength(request) {
  const value = request.headers.get("Content-Length");
  if (!value) return null;
  if (!/^\d+$/.test(value)) return Number.POSITIVE_INFINITY;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : Number.POSITIVE_INFINITY;
}
function rateLimited(request) {
  const response = compactError(request, 429, "Too many requests. Please try again shortly.");
  const headers = new Headers(response.headers); headers.set("retry-after", "60");
  return new Response(response.body, { status: response.status, headers });
}
function compactError(request, status, message) {
  const pathname = new URL(request.url).pathname;
  const isApi = pathname.startsWith("/api/") || pathname === "/auth/handoff";
  return new Response(isApi ? JSON.stringify({ error: message }) : message, { status, headers: { "content-type": isApi ? "application/json;charset=UTF-8" : "text/plain;charset=UTF-8", "cache-control": "no-store", "x-content-type-options": "nosniff", "x-robots-tag": "noindex, nofollow, noarchive, nosnippet" } });
}
function scannerNotFound() { return new Response("Not found.", { status: 404, headers: { "content-type": "text/plain;charset=UTF-8", "cache-control": "public, max-age=300", "x-content-type-options": "nosniff", "x-robots-tag": "noindex, nofollow, noarchive, nosnippet" } }); }
function robotsResponse() { return new Response("User-agent: *\nDisallow: /\n", { status: 200, headers: { "content-type": "text/plain;charset=UTF-8", "cache-control": "public, max-age=3600", "x-content-type-options": "nosniff" } }); }
