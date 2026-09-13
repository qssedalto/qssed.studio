import authWorker from "./auth-worker.js";
import { handlePkceTestRequest } from "./auth-pkce-test.js";

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
    return authWorker.fetch(request, env, ctx);
  }
};

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}
