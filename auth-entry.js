import authWorker from "./auth-worker.js";
import { injectSweiFontResponse, sweiFontAssetResponse } from "./studio/swei-font.js";
import { handlePkceTestRequest } from "./auth-pkce-test.js";
import { handleIdentifierLogin, rewriteIdentifierLoginPage } from "./auth-login-identifier.js";
import { protectAuthEdgeRequest, applyAuthEdgeHeaders } from "./auth-edge-protection.js";
import { handleAuthSsoRequest, isAuthSsoPath } from "./auth-sso.js";

const PKCE_TEST_PATHS = new Set([
  "/pkce-test",
  "/pkce-test/callback"
]);
const OAUTH_MUTATION_PATHS = new Set([
  "/api/oauth/authorize",
  "/oauth/token",
  "/oauth/revoke",
  "/oauth/introspect",
  "/sso/import"
]);
const RETURN_COOKIE = "__Host-qsseda-auth-return";
const RETURN_COOKIE_MAX_AGE = 10 * 60;

export default {
  async fetch(request, env, ctx) {
    const blocked = await protectAuthEdgeRequest(request, env);
    if (blocked) return applyAuthEdgeHeaders(request, blocked);

    const response = await routeAuthRequest(request, env, ctx);
    return applyAuthEdgeHeaders(request, await injectSweiFontResponse(response, request.method));
  }
};

async function routeAuthRequest(request, env, ctx) {
  const url = new URL(request.url);
  const pathname = normalizePath(url.pathname);
  const sweiAsset = sweiFontAssetResponse(pathname, request.method);
  if (sweiAsset) return sweiAsset;
  const pendingReturn = safeNextPath(readCookie(request, RETURN_COOKIE));
  const requestedReturn = safeNextPath(url.searchParams.get("next"));
  const effectiveReturn = requestedReturn || pendingReturn;

  if (pathname === "/api/login") {
    const key = rateLimitKey(request, "auth-login");
    const decision = await strictAuthLimit(env?.AUTH_LOGIN_RATE_LIMITER, key);
    if (decision === null) return limiterUnavailable();
    if (decision === false) return tooManyRequests();
  } else if (OAUTH_MUTATION_PATHS.has(pathname)) {
    const key = rateLimitKey(request, `oauth:${pathname}`);
    const decision = await strictAuthLimit(env?.AUTH_OAUTH_RATE_LIMITER, key);
    if (decision === null) return limiterUnavailable();
    if (decision === false) return tooManyRequests();
  }

  if (isAuthSsoPath(pathname)) {
    return handleAuthSsoRequest(request);
  }

  if (PKCE_TEST_PATHS.has(pathname)) {
    return handlePkceTestRequest(request);
  }

  if (pathname === "/api/login") {
    if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
    if ((request.headers.get("Origin") || "") !== url.origin) return new Response(JSON.stringify({ error: "Invalid origin" }), { status: 403, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
    return handleIdentifierLogin(request);
  }

  let routedRequest = request;
  if (pathname === "/continue" && !requestedReturn && pendingReturn) {
    const routedUrl = new URL(request.url);
    routedUrl.searchParams.set("next", pendingReturn);
    routedRequest = new Request(routedUrl.toString(), request);
  }

  const response = await authWorker.fetch(routedRequest, env, ctx);

  if (pathname === "/continue" && isLoginRedirect(response, url.origin)) {
    if (effectiveReturn) {
      return redirectWithPreservedHeaders(
        response,
        `/login?next=${encodeURIComponent(effectiveReturn)}`,
        returnCookie(effectiveReturn)
      );
    }
    return response;
  }

  if ((pathname === "/" || pathname === "/login") && (response.headers.get("content-type") || "").includes("text/html")) {
    let markup = rewriteIdentifierLoginPage(await response.text());
    if (pathname === "/login") markup = rewriteLoginReturnTarget(markup, effectiveReturn);
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    if (effectiveReturn) headers.append("set-cookie", returnCookie(effectiveReturn));
    return new Response(markup, { status: response.status, headers });
  }

  if (pathname === "/continue" && effectiveReturn && response.status >= 200 && response.status < 300) {
    return withCookie(response, clearReturnCookie());
  }

  return response;
}

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

// 只接受本站相对路径作为登录后的返回目标；拒绝 // 开头及 NUL，避免直接利用此参数跳往外站。
function safeNextPath(value) {
  const path = typeof value === "string" ? value.trim().slice(0, 500) : "";
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\u0000")) return "";
  return path;
}

function isLoginRedirect(response, requestOrigin) {
  if (!response || response.status < 300 || response.status >= 400) return false;
  const location = response.headers.get("location") || "";
  try {
    const parsed = new URL(location, requestOrigin);
    return parsed.origin === requestOrigin && normalizePath(parsed.pathname) === "/login";
  } catch {
    return false;
  }
}

function redirectWithPreservedHeaders(response, location, cookieValue = "") {
  const headers = new Headers(response.headers);
  headers.set("location", location);
  headers.set("cache-control", "no-store");
  headers.delete("content-length");
  if (cookieValue) headers.append("set-cookie", cookieValue);
  return new Response(null, { status: response.status, headers });
}

function rewriteLoginReturnTarget(markup, value) {
  const next = safeNextPath(value);
  if (!next) return markup;
  const continueTarget = `/continue?next=${encodeURIComponent(next)}`;
  const script = `<script id="qsseda-auth-return-target">(()=>{const target=${scriptLiteral(continueTarget)};const signedIn=document.getElementById("signedIn");const studioButton=document.getElementById("studioButton");const accountStudioButton=document.getElementById("accountStudioButton");if(studioButton)studioButton.href=target;if(accountStudioButton)accountStudioButton.href=target;let leaving=false;const resume=()=>{if(leaving||!signedIn||signedIn.classList.contains("hidden")||!studioButton||studioButton.classList.contains("hidden"))return;leaving=true;location.replace(target)};const observer=new MutationObserver(resume);if(signedIn)observer.observe(signedIn,{attributes:true,attributeFilter:["class"]});if(studioButton)observer.observe(studioButton,{attributes:true,attributeFilter:["class"]});queueMicrotask(resume)})()</script>`;
  return String(markup || "").replace("</body>", `${script}</body>`);
}

function readCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index <= 0 || part.slice(0, index).trim() !== name) continue;
    const raw = part.slice(index + 1).trim();
    try { return decodeURIComponent(raw); }
    catch { return raw; }
  }
  return "";
}

function returnCookie(next) {
  return `${RETURN_COOKIE}=${encodeURIComponent(next)}; Path=/; Max-Age=${RETURN_COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`;
}

function clearReturnCookie() {
  return `${RETURN_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

function withCookie(response, cookieValue) {
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.append("set-cookie", cookieValue);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function scriptLiteral(value) {
  return JSON.stringify(String(value || "")).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

// Authentication mutations must not bypass throttling when their binding fails.
// null = limiter unavailable, false = quota exceeded, true = admitted.
// 认证写操作必须获得明确的限流决策。绑定缺失、异常或返回非布尔值时用 null 通知调用者返回 503，而不是放行。
async function strictAuthLimit(limiter, key) {
  if (typeof limiter?.limit !== "function") {
    console.error("Auth mutation rate limiter binding is missing");
    return null;
  }
  try {
    const result = await limiter.limit({ key });
    return typeof result?.success === "boolean" ? result.success : null;
  } catch (error) {
    console.error("Auth mutation rate limiter unavailable", error);
    return null;
  }
}

// Use a stable Cloudflare source IP for both browser login and OAuth mutation limits.
// Authentication headers and cookies can be attacker-controlled before validation;
// using them as bucket identifiers would permit trivial credential-rotation bypasses.
export function rateLimitKey(request, scope) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  return `${scope}:ip:${ip}`;
}

function limiterUnavailable() {
  return new Response(JSON.stringify({ error: "Authentication is temporarily unavailable. Please retry shortly." }), {
    status: 503,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "cache-control": "no-store",
      "retry-after": "30",
      "x-content-type-options": "nosniff"
    }
  });
}

function tooManyRequests() {
  return new Response(JSON.stringify({ error: "Too many requests. Please try again shortly." }), {
    status: 429,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "cache-control": "no-store",
      "retry-after": "60",
      "x-content-type-options": "nosniff"
    }
  });
}
