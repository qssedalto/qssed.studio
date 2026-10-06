/**
 * 【初学者导读】
 * 文件：studio/edge-protection.js
 * 认证/安全模块：负责登录态、来源、Cookie、边缘保护或授权边界。
 * 阅读顺序：先看 export/入口函数，再看它调用的辅助函数；遇到 API 路径、存储键或域名判断时，向上追到 Worker 路由，向下追到具体数据源。
 * 数据流：建议始终回答四个问题——输入从哪里来？在哪里校验？修改了什么状态/存储？最后返回/渲染了什么？
 * 修改注意：这是安全敏感区域；不要省略来源校验、权限判断、Cookie/redirect 限制或失败分支。
 * 调试方法：先使用最小请求复现，再逐步检查分支条件和中间状态，避免只根据最终 UI 猜原因。
 */
import { publicSitemapUrls } from "./public-indexing.js";
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
  "/api/tex/documents",
  "/api/tex/runs",
  "/api/tex/compile",
  "/api/tex/result",
  "/api/tex/collaboration",
  "/api/storage/files",
  "/api/summaries",
  "/api/user-links",
  "/api/profile/home",
  "/api/admin/overview",
  "/api/admin/users",
  "/api/admin/roles",
  "/api/admin/logs"
]);

// 边缘请求保护入口：在业务路由前处理机器人/扫描器、请求体大小和速率限制。保护失败应尽量早返回，减少后端资源消耗。\nexport async function protectEdgeRequest(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  if (pathname === "/robots.txt") return robotsResponse(url.hostname);
  if (pathname === "/sitemap.xml") return sitemapResponse(url.hostname);
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
  if (contentType.includes("application/json")) {
    headers.set("x-robots-tag", "noindex, nofollow, noarchive, nosnippet");
  } else if (contentType.includes("text/html") && !headers.has("x-robots-tag")) {
    headers.set("x-robots-tag", "noindex, nofollow, noarchive, nosnippet");
  }
  if (!headers.has("referrer-policy")) headers.set("referrer-policy", "strict-origin-when-cross-origin");
  if (!headers.has("x-content-type-options")) headers.set("x-content-type-options", "nosniff");
  if (!headers.has("permissions-policy")) headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  headers.delete("content-length");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

// 机器人/自动化信号提取：组合请求头和平台信息形成风险提示。它只是一组信号，不应把单个普通浏览器特征直接当成恶意。\nexport function botSignals(request) {
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

// 不同 API 的请求体上限：上传/富内容可更大，普通 JSON 保持较小。限制在读取 body 前判断，才能真正阻止超大请求消耗内存。\nexport function requestBodyLimit(pathname) {
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

// 速率限制计数：key 应按用户/IP/动作维度选择；限流器不可用时的 fallback 要保守，不能静默开放高成本接口。\nasync function consume(limiter, key) {
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

function robotsResponse(hostname) {
  const canonical = String(hostname || "").toLowerCase() === "qsseda.com";
  const body = canonical
    ? "User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /auth/\nSitemap: https://qsseda.com/sitemap.xml\n"
    : "User-agent: *\nDisallow: /\n";
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/plain;charset=UTF-8",
      "cache-control": "public, max-age=3600",
      "x-content-type-options": "nosniff"
    }
  });
}

function sitemapResponse(hostname) {
  if (String(hostname || "").toLowerCase() !== "qsseda.com") return scannerNotFound();
  const urls = publicSitemapUrls();
  const body = '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + urls.map(url => "  <url><loc>" + url + "</loc></url>").join("\n")
    + "\n</urlset>\n";
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "application/xml;charset=UTF-8",
      "cache-control": "public, max-age=3600",
      "x-content-type-options": "nosniff"
    }
  });
}
