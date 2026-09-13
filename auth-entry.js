import authWorker from "./auth-worker.js";
import { handlePkceTestRequest } from "./auth-pkce-test.js";
import { handleIdentifierLogin, rewriteIdentifierLoginPage } from "./auth-login-identifier.js";

const PKCE_TEST_PATHS = new Set([
  "/pkce-test",
  "/pkce-test/callback"
]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = normalizePath(url.pathname);

    if (PKCE_TEST_PATHS.has(pathname)) {
      return handlePkceTestRequest(request);
    }

    if (pathname === "/api/login") {
      if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
      if ((request.headers.get("Origin") || "") !== url.origin) return new Response(JSON.stringify({ error: "Invalid origin" }), { status: 403, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
      return handleIdentifierLogin(request);
    }

    const response = await authWorker.fetch(request, env, ctx);
    if ((pathname === "/" || pathname === "/login") && (response.headers.get("content-type") || "").includes("text/html")) {
      const markup = rewriteIdentifierLoginPage(await response.text());
      return new Response(markup, { status: response.status, headers: response.headers });
    }
    return response;
  }
};

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}
