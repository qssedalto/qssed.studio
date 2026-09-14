import { OS_PATHS, LEGACY_REDIRECTS, TEXT } from "./config.js";
import { handleAuthHandoff } from "./auth-handoff.js";
import { handleStorageFiles, handleStorageUpload, handleStorageObject } from "./storage-api.js";
import { handleSummaries } from "./summary-api.js";
import { handleNotes } from "./notes-api.js";
import { getRequestCookie, handleRegistrationSignup } from "./account-api.js";
import { handleIdentifierPasswordLogin, identifierLoginPage } from "./login-identifier-api.js";
import { getRouteInfo, buildLinks, html, localizedRedirect } from "./routing.js";
import { osPage } from "./ui-shell.js";
import { signUpPage, loginPage, notFoundPage } from "./auth-pages.js";

function localizedPage(markup, locale, status = 200) {
  const label = locale === "zh" ? "ZH" : "EN";
  const localizedMarkup = markup.replace(
    /(<a\b[^>]*class="[^"]*\blanguage-toggle\b[^"]*"[^>]*>)[^<]*(<\/a>)/g,
    `$1${label}$2`
  );
  return html(localizedMarkup, status);
}

export default {
  async fetch(request, env) {
    const { pathname, locale, ipInfo } = getRouteInfo(request);

    if (pathname === "/api/auth/signup") {
      if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
      return handleRegistrationSignup(request, env, ipInfo);
    }

    if (pathname === "/api/auth/login") {
      if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
      return handleIdentifierPasswordLogin(request, env, ipInfo);
    }

    if (pathname === "/auth/handoff") {
      if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
      return handleAuthHandoff(request, env, locale);
    }

    if (pathname === "/api/storage/files") {
      if (request.method !== "GET") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
      return handleStorageFiles(request, env);
    }

    if (pathname === "/api/storage/upload") {
      if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
      return handleStorageUpload(request, env);
    }

    if (pathname === "/api/storage/object") {
      if (request.method !== "GET" && request.method !== "DELETE") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
      return handleStorageObject(request, env);
    }

    if (pathname === "/api/summaries") {
      if (!new Set(["GET", "PUT", "DELETE"]).has(request.method)) return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
      return handleSummaries(request, env);
    }

    if (pathname === "/api/notes") {
      if (!new Set(["GET", "POST", "PUT", "DELETE"]).has(request.method)) return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
      return handleNotes(request, env);
    }

    const legacyTarget = LEGACY_REDIRECTS.get(pathname);
    if (legacyTarget) return localizedRedirect(request, locale, legacyTarget);

    const t = TEXT[locale];
    const links = buildLinks(locale, pathname);

    if (OS_PATHS.has(pathname)) {
      const cachedOsUserLabel = getRequestCookie(request, "qssed-os-user-name");
      return localizedPage(osPage(t, links, pathname, ipInfo, cachedOsUserLabel), locale);
    }

    if (pathname === "/sign-up") return localizedPage(signUpPage(t, links, ipInfo), locale);
    if (pathname === "/login") return localizedPage(identifierLoginPage(loginPage(t, links, ipInfo), t, locale === "zh"), locale);
    return localizedPage(notFoundPage(t, links), locale, 404);
  }
};
