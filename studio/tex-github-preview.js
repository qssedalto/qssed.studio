// Isolated security-smoke entrypoint. Never bind production R2, DO, or GitHub secrets here.
import worker from "./worker-audit.js";

const ALLOWED_API = new Set([
  "/api/tex/github/status",
  "/api/tex/github/apply",
  "/api/tex/github/repository",
  "/api/tex/github/compile",
  "/api/tex/github/runs",
  "/api/tex/github/pdf",
  "/api/tex/github/download"
]);
function guarded(response) {
  const headers = new Headers(response.headers);
  headers.set("cache-control", "private, no-store");
  headers.set("x-robots-tag", "noindex, nofollow, noarchive");
  headers.set("x-content-type-options", "nosniff");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === "GET" && path === "/health") {
      return guarded(new Response(JSON.stringify({
        service: "aertex-tex-github-isolated-preview",
        ok: true,
        credentials: "not-bound",
        storage: "not-bound",
        production: false
      }), {status: 200, headers: {"content-type":"application/json; charset=utf-8"}}));
    }
    if (request.method === "GET" && path === "/") {
      return guarded(new Response(
        "<!doctype html><html lang=\"zh-CN\"><meta charset=\"utf-8\">"+
        "<title>AERTEX TeX · 隔离预览</title>"+
        "<meta name=\"robots\" content=\"noindex,nofollow\">"+
        "<body style=\"font:16px system-ui;margin:6vw;max-width:760px;line-height:1.7\">"+
        "<h1>AERTEX TeX · 隔离预览</h1>"+
        "<p>这是代码与认证边界的测试环境，不是真实生产编辑器。</p>"+
        "<p>未绑定任何 GitHub 凭证或用户存储，不能创建仓库、扣除额度或访问用户 PDF。</p>"+
        "<p>此环境仅用于确认新的 Worker 代码能够部署，以及未登录请求会被拒绝。</p>"+
        "<p>正式网站：<a href=\"https://work.qsseda.com/tex\">work.qsseda.com/tex</a></p>"+
        "</body></html>",
        {headers:{"content-type":"text/html; charset=utf-8"}}
      ));
    }
    if (ALLOWED_API.has(path)) {
      // Exercise the actual production API's session gate. No secrets or storage
      // are bound, so even an accidentally authenticated request cannot compile.
      return guarded(await worker.fetch(request, env, ctx));
    }
    return guarded(new Response("Not found", {status: 404}));
  }
};
