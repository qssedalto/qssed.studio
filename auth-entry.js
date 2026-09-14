import authWorker from "./auth-worker.js";
import { handlePkceTestRequest } from "./auth-pkce-test.js";
import { handleIdentifierLogin, rewriteIdentifierLoginPage } from "./auth-login-identifier.js";
import { protectAuthEdgeRequest, applyAuthEdgeHeaders } from "./auth-edge-protection.js";

const PKCE_TEST_PATHS = new Set([
  "/pkce-test",
  "/pkce-test/callback"
]);
const OAUTH_MUTATION_PATHS = new Set([
  "/api/oauth/authorize",
  "/oauth/token",
  "/oauth/revoke",
  "/oauth/introspect"
]);

export default {
  async fetch(request, env, ctx) {
    const blocked = await protectAuthEdgeRequest(request, env);
    if (blocked) return applyAuthEdgeHeaders(request, blocked);

    const response = await routeAuthRequest(request, env, ctx);
    return applyAuthEdgeHeaders(request, response);
  }
};

async function routeAuthRequest(request, env, ctx) {
  const url = new URL(request.url);
  const pathname = normalizePath(url.pathname);

  if (pathname === "/api/login") {
    const key = await rateLimitKey(request, "auth-login", false);
    if (!(await allowed(env?.AUTH_LOGIN_RATE_LIMITER, key))) return tooManyRequests();
  } else if (OAUTH_MUTATION_PATHS.has(pathname)) {
    const key = await rateLimitKey(request, `oauth:${pathname}`, true);
    if (!(await allowed(env?.AUTH_OAUTH_RATE_LIMITER, key))) return tooManyRequests();
  }

  if (PKCE_TEST_PATHS.has(pathname)) {
    return handlePkceTestRequest(request);
  }

  if (pathname === "/api/login") {
    if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
    if ((request.headers.get("Origin") || "") !== url.origin) return new Response(JSON.stringify({ error: "Invalid origin" }), { status: 403, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
    return handleIdentifierLogin(request);
  }

  const response = await authWorker.fetch(request, env, ctx);

  if (pathname === "/continue" && isLoginRedirect(response)) {
    const next = safeNextPath(url.searchParams.get("next"));
    if (next) return redirectWithPreservedHeaders(response, `/login?next=${encodeURIComponent(next)}`);
  }

  if ((pathname === "/" || pathname === "/login") && (response.headers.get("content-type") || "").includes("text/html")) {
    let markup = rewriteIdentifierLoginPage(await response.text());
    if (pathname === "/login") markup = rewriteLoginReturnTarget(markup, url.searchParams.get("next"));
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    return new Response(markup, { status: response.status, headers });
  }
  return response;
}

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function safeNextPath(value) {
  const path = typeof value === "string" ? value.trim().slice(0, 500) : "";
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\u0000")) return "";
  return path;
}

function isLoginRedirect(response) {
  if (!response || response.status < 300 || response.status >= 400) return false;
  const location = response.headers.get("location") || "";
  try {
    const parsed = new URL(location, "https://auth.qsseda.studio");
    return parsed.origin === "https://auth.qsseda.studio" && normalizePath(parsed.pathname) === "/login";
  } catch {
    return false;
  }
}

function redirectWithPreservedHeaders(response, location) {
  const headers = new Headers(response.headers);
  headers.set("location", location);
  headers.set("cache-control", "no-store");
  headers.delete("content-length");
  return new Response(null, { status: response.status, headers });
}

function rewriteLoginReturnTarget(markup, value) {
  const next = safeNextPath(value);
  if (!next) return markup;
  const continueTarget = `/continue?next=${encodeURIComponent(next)}`;
  const script = `<script id="qsseda-auth-return-target">(()=>{const target=${scriptLiteral(continueTarget)};const signedIn=document.getElementById("signedIn");const studioButton=document.getElementById("studioButton");const accountStudioButton=document.getElementById("accountStudioButton");if(studioButton)studioButton.href=target;if(accountStudioButton)accountStudioButton.href=target;let leaving=false;const resume=()=>{if(leaving||!signedIn||signedIn.classList.contains("hidden")||!studioButton||studioButton.classList.contains("hidden"))return;leaving=true;location.replace(target)};const observer=new MutationObserver(resume);if(signedIn)observer.observe(signedIn,{attributes:true,attributeFilter:["class"]});if(studioButton)observer.observe(studioButton,{attributes:true,attributeFilter:["class"]});queueMicrotask(resume)})()</script>`;
  return String(markup || "").replace("</body>", `${script}</body>`);
}

function scriptLiteral(value) {
  return JSON.stringify(String(value || "")).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

async function allowed(limiter, key) {
  if (!limiter?.limit) return true;
  try {
    const result = await limiter.limit({ key });
    return result?.success !== false;
  } catch (error) {
    console.error("Auth rate limiter unavailable", error);
    return true;
  }
}

async function rateLimitKey(request, scope, preferAuthenticatedIdentity) {
  if (preferAuthenticatedIdentity) {
    const authorization = request.headers.get("Authorization") || "";
    if (authorization) return `${scope}:auth:${await digest(authorization)}`;

    const cookie = request.headers.get("Cookie") || "";
    if (cookie) return `${scope}:cookie:${await digest(cookie)}`;
  }

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  return `${scope}:ip:${ip}`;
}

async function digest(value) {
  const bytes = new TextEncoder().encode(String(value || ""));
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return Array.from(hash.slice(0, 16), byte => byte.toString(16).padStart(2, "0")).join("");
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
