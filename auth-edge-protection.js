const MAX_PATH_LENGTH = 2048;
const MAX_QUERY_LENGTH = 4096;
const MAX_BODY_BYTES = 2 * 1024 * 1024;

const AUTOMATION_UA = /(curl|wget|python-requests|python\/|scrapy|aiohttp|httpx|go-http-client|libwww-perl|apache-httpclient|okhttp|postmanruntime|insomnia|headlesschrome|phantomjs|selenium|puppeteer|playwright)/i;
const SCANNER_PATH = /(?:^|\/)(?:\.env(?:\.|$)|\.git(?:\/|$)|wp-admin(?:\/|$)|wp-login\.php$|xmlrpc\.php$|phpmyadmin(?:\/|$)|adminer\.php$|vendor\/phpunit(?:\/|$)|cgi-bin(?:\/|$)|server-status$)/i;
const OAUTH_PROTOCOL_PATHS = new Set([
  "/api/oauth/authorize",
  "/oauth/token",
  "/oauth/revoke",
  "/oauth/introspect",
  "/.well-known/oauth-authorization-server"
]);

export async function protectAuthEdgeRequest(request, env) {
  const url = new URL(request.url);
  const pathname = normalizePath(url.pathname);

  if (pathname === "/robots.txt") return robotsResponse();
  if (pathname.length > MAX_PATH_LENGTH || url.search.length > MAX_QUERY_LENGTH) return compactError(request, 414, "Request target is too long.");
  if (request.method === "TRACE" || request.method === "CONNECT") return compactError(request, 405, "Method not allowed.");
  if (SCANNER_PATH.test(pathname)) return scannerNotFound();

  const declaredLength = declaredBodyLength(request);
  if (declaredLength !== null && declaredLength > MAX_BODY_BYTES) return compactError(request, 413, "Request body is too large.");

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!(await consume(env?.AUTH_EDGE_GLOBAL_RATE_LIMITER, `auth-edge:global:${ip}`))) return rateLimited(request);

  const hasIdentity = Boolean(request.headers.get("Authorization") || request.headers.get("Cookie"));
  if (!hasIdentity) {
    if (!(await consume(env?.AUTH_EDGE_ANON_RATE_LIMITER, `auth-edge:anon:${ip}`))) return rateLimited(request);

    if (!OAUTH_PROTOCOL_PATHS.has(pathname)) {
      const bot = botSignals(request);
      if (!bot.verified && bot.score >= 3) {
        if (!(await consume(env?.AUTH_EDGE_SUSPECT_RATE_LIMITER, `auth-edge:suspect:${ip}`))) return rateLimited(request);
      }
    }
  }

  return null;
}

export function applyAuthEdgeHeaders(request, response) {
  const headers = new Headers(response.headers);
  const contentType = headers.get("content-type") || "";
  if (contentType.includes("text/html") || contentType.includes("application/json")) {
    headers.set("x-robots-tag", "noindex, nofollow, noarchive, nosnippet");
  }
  if (!headers.has("referrer-policy")) headers.set("referrer-policy", "no-referrer");
  if (!headers.has("x-content-type-options")) headers.set("x-content-type-options", "nosniff");
  if (!headers.has("permissions-policy")) headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  headers.delete("content-length");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export function authBotSignals(request) {
  return botSignals(request);
}

function botSignals(request) {
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

async function consume(limiter, key) {
  if (!limiter?.limit) return true;
  try {
    const result = await limiter.limit({ key });
    return result?.success !== false;
  } catch {
    return true;
  }
}

function declaredBodyLength(request) {
  const value = request.headers.get("Content-Length");
  if (!value) return null;
  if (!/^\d+$/.test(value)) return Number.POSITIVE_INFINITY;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : Number.POSITIVE_INFINITY;
}

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function rateLimited(request) {
  const response = compactError(request, 429, "Too many requests. Please try again shortly.");
  const headers = new Headers(response.headers);
  headers.set("retry-after", "60");
  return new Response(response.body, { status: response.status, headers });
}

function compactError(request, status, message) {
  const pathname = new URL(request.url).pathname;
  const isApi = pathname.startsWith("/api/") || pathname.startsWith("/oauth/");
  if (isApi) {
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: {
        "content-type": "application/json;charset=UTF-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
        "x-robots-tag": "noindex, nofollow, noarchive, nosnippet"
      }
    });
  }
  return new Response(message, {
    status,
    headers: {
      "content-type": "text/plain;charset=UTF-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "x-robots-tag": "noindex, nofollow, noarchive, nosnippet"
    }
  });
}

function scannerNotFound() {
  return new Response("Not found.", {
    status: 404,
    headers: {
      "content-type": "text/plain;charset=UTF-8",
      "cache-control": "public, max-age=300",
      "x-content-type-options": "nosniff",
      "x-robots-tag": "noindex, nofollow, noarchive, nosnippet"
    }
  });
}

function robotsResponse() {
  return new Response("User-agent: *\nDisallow: /\n", {
    status: 200,
    headers: {
      "content-type": "text/plain;charset=UTF-8",
      "cache-control": "public, max-age=3600",
      "x-content-type-options": "nosniff"
    }
  });
}
