import studio from "./studio/entry.js";
import { handleKnowledgeSearch } from "./studio/knowledge-api.js";
import { handleCuratedFavorites } from "./studio/favorites-api.js";
import { handleRegistrationUsernameCheck } from "./studio/registration-check-api.js";
import { handleAccountSecurity } from "./studio/account-security-api.js";
import { handleProfileApi } from "./studio/profile-api.js";
import { handleAdminAccess, handleAdminAction } from "./studio/admin-api.js";
import { isLegacyCookieApiPath, handleLegacyCookieApi } from "./studio/legacy-cookie-api.js";
import { hardenGlobalBrowserResponse } from "./studio/global-browser-security.js";

const AUTH_ABUSE_PATHS = new Set([
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/bootstrap",
  "/api/auth/username-check",
  "/auth/handoff"
]);
const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (AUTH_ABUSE_PATHS.has(pathname)) {
      const key = await rateLimitKey(request, `auth:${pathname}`, false);
      if (!(await allowed(env?.AUTH_RATE_LIMITER, key))) return tooManyRequests();
    } else if (pathname.startsWith("/api/")) {
      const isWrite = WRITE_METHODS.has(request.method.toUpperCase());
      const limiter = isWrite ? env?.API_WRITE_RATE_LIMITER : env?.API_READ_RATE_LIMITER;
      const key = await rateLimitKey(request, `${isWrite ? "write" : "read"}:${pathname}`, true);
      if (!(await allowed(limiter, key))) return tooManyRequests();
    }

    if (pathname === "/api/knowledge/search") return handleKnowledgeSearch(request, env);
    if (pathname === "/api/curated-favorites") return handleCuratedFavorites(request, env);
    if (pathname === "/api/auth/username-check") return handleRegistrationUsernameCheck(request, env);
    if (pathname === "/api/admin/access") {
      if (request.method !== "GET") return methodNotAllowed();
      return handleAdminAccess(request);
    }
    if (pathname.startsWith("/api/admin/")) {
      const action = pathname.slice("/api/admin/".length);
      return handleAdminAction(request, env, action);
    }
    if (pathname.startsWith("/api/account/")) {
      const action = pathname.slice("/api/account/".length);
      return handleAccountSecurity(request, action);
    }
    if (pathname.startsWith("/api/profile/")) {
      const action = pathname.slice("/api/profile/".length);
      return handleProfileApi(request, action);
    }
    if (isLegacyCookieApiPath(pathname)) return handleLegacyCookieApi(request, env, pathname);

    const response = await studio.fetch(request, env, ctx);
    return hardenGlobalBrowserResponse(response);
  }
};

async function allowed(limiter, key) {
  if (!limiter?.limit) return true;
  try {
    const result = await limiter.limit({ key });
    return result?.success !== false;
  } catch (error) {
    console.error("Rate limiter unavailable", error);
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

function methodNotAllowed() {
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "cache-control": "no-store",
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
