import worker from "../worker.js";
import { cleanupAccessAudit, handleAccessAuditAdmin, recordAccessAudit } from "./access-audit.js";
import { handleAccessAuditPage } from "./access-audit-page.js";
export { TexCollaborationRoom } from "./tex-collaboration-room.js";

const ACCESS_AUDIT_API = "/api/admin/access-audit";
const ACCESS_AUDIT_PAGES = new Set([
  "/admin/access-audit",
  "/zh-cn/admin/access-audit",
  "/en/admin/access-audit"
]);

export default {
  async fetch(request, env, ctx) {
    const startedAt = Date.now();
    let response;

    try {
      const url = new URL(request.url);
      if (url.hostname === "qsseda.studio" && url.pathname === ACCESS_AUDIT_API) {
        response = await handleAccessAuditAdmin(request, env);
      } else if (url.hostname === "qsseda.studio" && ACCESS_AUDIT_PAGES.has(url.pathname)) {
        const zh = url.pathname.startsWith("/zh-cn/") || (url.pathname === "/admin/access-audit" && /^zh(?:-|_|,|;|$)/i.test(request.headers.get("Accept-Language") || ""));
        response = await handleAccessAuditPage(request, zh);
      } else {
        response = await worker.fetch(request, env, ctx);
      }
    } catch (error) {
      scheduleAudit(ctx, request, new Response(null, { status: 500 }), env, startedAt, auditSource(request));
      throw error;
    }

    scheduleAudit(ctx, request, response, env, startedAt, auditSource(request));
    return response;
  },

  async scheduled(_controller, env, ctx) {
    if (ctx?.waitUntil) {
      ctx.waitUntil(cleanupAccessAudit(env).catch(error => console.error("Access audit cleanup failed", error)));
      return;
    }
    await cleanupAccessAudit(env);
  }
};

function scheduleAudit(ctx, request, response, env, startedAt, source) {
  const promise = recordAccessAudit(request, response, env, startedAt, source)
    .catch(error => console.error("Access audit write failed", error));
  if (ctx?.waitUntil) ctx.waitUntil(promise);
}

function auditSource(request) {
  try {
    const host = new URL(request.url).hostname;
    if (host === "work.qsseda.studio") return "work";
    if (host === "qsseda.studio") return "studio";
    return host || "studio";
  } catch {
    return "studio";
  }
}