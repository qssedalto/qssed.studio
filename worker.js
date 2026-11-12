/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 *
 * AERTEX history note:
 * This comment came from the project's original monolithic Cloudflare Worker
 * and is intentionally preserved across the workers that were later split from it.
 */

import studio from "./studio/entry.js";
import { injectSweiFontResponse, sweiFontAssetResponse } from "./studio/swei-font.js";
import { handleProledWallpaperRoute } from "./studio/public-wallpapers.js";
import { handleKnowledgeSearch } from "./studio/knowledge-api.js";
import { handleGlobalSearch } from "./studio/global-search-api.js";
import { handleProjects } from "./studio/projects-api.js";
import { handleTasks } from "./studio/tasks-api.js";
import { handleDrafts } from "./studio/drafts-api.js";
import { handleWorkbenchOverview } from "./studio/workbench-api.js";
import { handleNativeWorkDocuments } from "./studio/native-work-documents.js";
import { verifyNativeAppSession, nativeJson, nativeApiResponse } from "./studio/native-mobile-auth.js";
import { handleTexApi } from "./studio/tex-api.js";
import { handleTexGithubApi } from "./studio/tex-github-api.js";
import { handleTexCollaborationApi } from "./studio/tex-collaboration-api.js";
import { handleTexSharedCollaboration } from "./studio/tex-collaboration-shared.js";
import { handleTexCollaborationRealtime } from "./studio/tex-collaboration-realtime.js";
import { handleTexLinkSharingApi } from "./studio/tex-link-sharing-api.js";
import { handleTexLinkPublic } from "./studio/tex-link-public.js";
import { handleWorkApi } from "./studio/work-api.js";
import { handleCuratedFavorites } from "./studio/favorites-api.js";
import { handleRegistrationUsernameCheck } from "./studio/registration-check-api.js";
import { handleAccountSecurity } from "./studio/account-security-api.js";
import { handleProfileApi } from "./studio/profile-api.js";
import { isLegacyCookieApiPath, handleLegacyCookieApi } from "./studio/legacy-cookie-api.js";
import { hardenGlobalBrowserResponse } from "./studio/global-browser-security.js";
import { protectEdgeRequest, applyEdgeProtectionHeaders } from "./studio/edge-protection.js";
import { FAVICON_PATHS, faviconResponse } from "./studio/favicon.js";
import { LOGO_PATHS, logoResponse } from "./studio/brand-logo.js";
import {
  handleMainWorkHandoff,
  isMainWorkHandoffPath,
  isWorkSubdomainRequest,
  mainWorkRedirect,
  rewriteWorkSubdomainRequest,
  workSessionRedirect,
  workDocumentNotFound,
  resolveWorkDocumentLink,
  workDocumentUnavailableRedirect
} from "./studio/work-subdomain.js";
import {
  handleMainGptHandoff,
  isMainGptHandoffPath
} from "./studio/gpt-subdomain.js";
import {
  handleMainCashHandoff,
  isMainCashHandoffPath
} from "./studio/cash-subdomain.js";
import {
  handleMainWatchHandoff,
  isMainWatchHandoffPath
} from "./studio/watch-subdomain.js";
import {
  handleMainAdminHandoff,
  isMainAdminHandoffPath
} from "./studio/admin-subdomain.js";
import { isMainHost } from "./studio/domain-family.js";

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
    const blocked = await protectEdgeRequest(request, env);
    if (blocked) return applyEdgeProtectionHeaders(request, blocked);
    const response = await routeStudioRequest(request, env, ctx);
    if (response?.status === 101 || response?.webSocket) return response;
    return applyEdgeProtectionHeaders(request, response);
  }
};

async function routeStudioRequest(request, env, ctx) {
  let url = new URL(request.url);
  let pathname = url.pathname;
  const workHost = isWorkSubdomainRequest(request);
  // Capability pages are intentionally separate from the authenticated editor
  // shell. A token alone never bypasses the editing or WebSocket ACL.
  if (workHost && (pathname.startsWith("/share/tex/") || pathname === "/api/tex/link/download")) {
    return handleTexLinkPublic(request,env);
  }


  if (!workHost && isMainHost(url.hostname) && (pathname === "/wallpapers/proled-xdr" || pathname.startsWith("/wallpapers/proled-xdr/"))) return handleProledWallpaperRoute(request, env);

  if (FAVICON_PATHS.has(pathname)) return faviconResponse(request);
  if (LOGO_PATHS.has(pathname)) return logoResponse(request);
  const sweiAsset = sweiFontAssetResponse(pathname, request.method);
  if (sweiAsset) return sweiAsset;

  if (!workHost && isMainWorkHandoffPath(pathname)) return handleMainWorkHandoff(request);
  if (!workHost && isMainGptHandoffPath(pathname)) return handleMainGptHandoff(request);
  if (!workHost && isMainCashHandoffPath(pathname)) return handleMainCashHandoff(request);
  // AERTEX Watch 的登录桥始终在主站 Worker 处理；aw.* 子域不会自己接受主站 handoff 路由。
  // 这条分支必须早于普通 Studio 页面渲染，否则 access/refresh 凭据会被当成普通页面请求。
  if (!workHost && isMainWatchHandoffPath(pathname)) return handleMainWatchHandoff(request);
  if (!workHost && isMainAdminHandoffPath(pathname)) return handleMainAdminHandoff(request);

  if (!workHost) {
    const workTarget = mainWorkRedirect(request, pathname);
    if (workTarget) return redirect(workTarget);
  }

  let workPageNext = "";
  let workDocumentId = "";
  let workPublicRequest = request;
  if (workHost) {
    const mapped = rewriteWorkSubdomainRequest(request);
    if (mapped.redirect) return redirect(mapped.redirect);
    if (mapped.canonical) return redirect(mapped.canonical);
    if (mapped.notFound) return workDocumentNotFound(workPublicRequest);
    request = mapped.request;
    workPageNext = mapped.pageNext;
    workDocumentId = mapped.documentId || "";
    url = new URL(request.url);
    pathname = url.pathname;
  }

  if (AUTH_ABUSE_PATHS.has(pathname)) {
    const key = rateLimitKey(request, `auth:${pathname}`);
    const decision = await strictAuthLimit(env?.AUTH_RATE_LIMITER, key);
    if (decision === null) return limiterUnavailable();
    if (decision === false) return tooManyRequests();
  } else if (pathname.startsWith("/api/")) {
    const isWrite = WRITE_METHODS.has(request.method.toUpperCase());
    const limiter = isWrite ? env?.API_WRITE_RATE_LIMITER : env?.API_READ_RATE_LIMITER;
    const key = rateLimitKey(request, `${isWrite ? "write" : "read"}:${pathname}`);
    if (!(await allowed(limiter, key))) return tooManyRequests();
  }

  if (pathname === "/api/knowledge/search") return handleKnowledgeSearch(request, env);
  if (pathname === "/api/search/global") return handleGlobalSearch(request, env);
  if (pathname === "/api/projects") return handleProjects(request, env);
  if (pathname === "/api/tasks") return handleTasks(request, env);
  if (pathname === "/api/drafts") return handleDrafts(request, env);
  // First-party mobile Studio reuses the real owner-prefixed R2 CRUD engines.
  // Only the verified Bearer subject may select R2 keys; client ids are filters
  // inside that subject, not permission grants.
  if (pathname === "/api/native/work/documents" && !workHost && isMainHost(url.hostname)) {
    return handleNativeWorkDocuments(request, env);
  }
  if (pathname.startsWith("/api/native/studio/") && !workHost && isMainHost(url.hostname)) {
    const resource = pathname.slice("/api/native/studio/".length);
    const methods = resource === "overview" ? ["GET"]
      : resource === "projects" || resource === "tasks" ? ["GET", "POST", "PUT", "DELETE"]
      : null;
    if (!methods) return nativeJson({ error: "Native Studio route not found." }, 404);
    if (!methods.includes(request.method)) return nativeJson({ error: "Method not allowed." }, 405);
    const session = await verifyNativeAppSession(request);
    if (!session.ok) return session.response;
    const result = resource === "overview"
      ? await handleWorkbenchOverview(request, env, session)
      : resource === "projects"
        ? await handleProjects(request, env, session)
        : await handleTasks(request, env, session);
    return nativeApiResponse(result);
  }
  if (pathname === "/api/workbench/overview") return handleWorkbenchOverview(request, env);
  if (pathname === "/api/tex/link") return workHost ? handleTexLinkSharingApi(request, env) : new Response("Not Found", { status: 404 });
  if (pathname === "/api/tex/collaboration/realtime") return handleTexCollaborationRealtime(request, env);
  if (pathname === "/api/tex/collaboration/shared") return handleTexSharedCollaboration(request, env);
  if (pathname === "/api/tex/collaboration") return handleTexCollaborationRoute(request, env);
  if (pathname.startsWith("/api/tex/github/")) return handleTexGithubApi(request, env, pathname.slice("/api/tex/github/".length));
  if (pathname.startsWith("/api/tex/")) return handleTexApi(request, env, pathname.slice("/api/tex/".length));
  if (pathname.startsWith("/api/work/")) return handleWorkApi(request, env, pathname.slice("/api/work/".length));
  if (pathname === "/api/curated-favorites") return handleCuratedFavorites(request, env);
  if (pathname === "/api/auth/username-check") return handleRegistrationUsernameCheck(request, env);
  if (isMainHost(url.hostname) && isLegacyAdminSurface(pathname)) return notFound();

  if (pathname.startsWith("/api/account/")) {
    const action = pathname.slice("/api/account/".length);
    return handleAccountSecurity(request, action);
  }
  if (pathname.startsWith("/api/profile/")) {
    const action = pathname.slice("/api/profile/".length);
    return handleProfileApi(request, action);
  }
  if (isLegacyCookieApiPath(pathname)) return handleLegacyCookieApi(request, env, pathname);

  if (workHost && workDocumentId) {
    const validationUrl = new URL("/api/tex/documents", request.url);
    validationUrl.searchParams.set("id", workDocumentId);
    const sharedUrl = new URL("/api/tex/collaboration/shared", request.url);
    sharedUrl.searchParams.set("document", workDocumentId);
    const access = await resolveWorkDocumentLink(
      () => handleTexApi(new Request(validationUrl.toString(), {
        method: "GET", headers: request.headers
      }), env, "documents"),
      () => handleTexSharedCollaboration(new Request(sharedUrl.toString(), {
        method: "GET", headers: request.headers
      }), env)
    );
    if (access.action === "sign-in") return workSessionRedirect(workPublicRequest, workPageNext);
    if (access.action === "home") return workDocumentUnavailableRedirect(workPublicRequest);
    if (access.action === "response") return access.response;
  }

  let response = await studio.fetch(request, env, ctx);
  if (workHost && workPageNext && response.status === 401) return workSessionRedirect(request, workPageNext);
  if (workHost && workPageNext && response.status === 200) response = await suppressWorkClientSessionBounce(response);
  response = await injectSweiFontResponse(response, request.method);
  return hardenGlobalBrowserResponse(response);
}

async function handleTexCollaborationRoute(request, env) {
  const primary = await handleTexCollaborationApi(request, env);
  if (request.method !== "GET" || primary.status !== 404) return primary;
  const url = new URL(request.url);
  if (url.searchParams.get("action") || !url.searchParams.get("document")) return primary;
  url.pathname = "/api/tex/collaboration/shared";
  url.searchParams.set("participants", "1");
  return handleTexSharedCollaboration(new Request(url.toString(), request), env);
}

async function suppressWorkClientSessionBounce(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const markup = await response.text();
  const guardedMarkup = markup.replace(
    "    hydrateOsUser();",
    "    // Work has already passed the server-side host-only session gate.\n    // Browser auth storage is origin-isolated, so do not reclassify Work as signed out here."
  );
  if (guardedMarkup === markup) return new Response(markup, { status: response.status, statusText: response.statusText, headers: response.headers });

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(guardedMarkup, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

// For login, signup and session-handoff mutations, a missing/failing limiter
// must not silently become an unrestricted authentication endpoint.
async function strictAuthLimit(limiter, key) {
  if (typeof limiter?.limit !== "function") {
    console.error("Studio auth rate limiter binding is missing");
    return null;
  }
  try {
    const result = await limiter.limit({ key });
    return typeof result?.success === "boolean" ? result.success : null;
  } catch (error) {
    console.error("Studio auth rate limiter unavailable", error);
    return null;
  }
}

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

// Rate-limit identity must not be derived from attacker-controlled Authorization/Cookie values.
// Cloudflare provides CF-Connecting-IP at the trusted edge; the limiters are IP-scoped.
export function rateLimitKey(request, scope) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  return `${scope}:ip:${ip}`;
}

function redirect(location) {
  return new Response(null, { status: 302, headers: { location, "cache-control": "no-store", "referrer-policy": "no-referrer" } });
}

function isLegacyAdminSurface(pathname) {
  return pathname === "/admin"
    || pathname.startsWith("/admin/")
    || pathname === "/zh-cn/admin"
    || pathname.startsWith("/zh-cn/admin/")
    || pathname === "/en/admin"
    || pathname.startsWith("/en/admin/")
    || pathname === "/api/admin"
    || pathname.startsWith("/api/admin/");
}

function notFound() {
  return new Response("Not found.", {
    status: 404,
    headers: {
      "content-type": "text/plain;charset=UTF-8",
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
      "x-robots-tag": "noindex, nofollow, noarchive, nosnippet"
    }
  });
}

function methodNotAllowed() {
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store", "x-content-type-options": "nosniff" }
  });
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
    headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store", "retry-after": "60", "x-content-type-options": "nosniff" }
  });
}