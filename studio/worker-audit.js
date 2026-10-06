// 初学者导读：Worker 侧审计辅助：统一记录关键请求/错误或运行状态，便于排障而不把敏感凭据写入日志。
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

import { huaweiHarmonyGate } from "./huawei-harmony-gate.js";
import worker from "../worker.js";
import { cleanupAccessAudit, recordAccessAudit } from "./access-audit.js";
import { isMainHost, isServiceHost } from "./domain-family.js";
export { TexCollaborationRoom } from "./tex-collaboration-room.js";

function routeAliasRequest(request) {
  try {
    if (request.method !== "GET" && request.method !== "HEAD") return null;
    const url = new URL(request.url);
    if (!isMainHost(url.hostname) && !isServiceHost(url.hostname, "work")) return null;

    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length < 2) return null;
    const markerIndex = segments.length - 2;
    if (String(segments[markerIndex] || "").toLowerCase() !== "huawei-exempt") return null;

    segments.splice(markerIndex, 1);
    url.pathname = "/" + segments.join("/");
    return new Request(url.toString(), {
      method: request.method,
      headers: request.headers
    });
  } catch {
    return null;
  }
}

export default {
  async fetch(request, env, ctx) {
    const deviceGate = await huaweiHarmonyGate(request);
    if (deviceGate) return deviceGate;
    const aliasRequest = routeAliasRequest(request);
    const routedRequest = aliasRequest || request;

    const startedAt = Date.now();
    let response;

    try {
      response = await worker.fetch(routedRequest, env, ctx);
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
    if (isServiceHost(host, "work")) return "work";
    if (isMainHost(host)) return "studio";
    return host || "studio";
  } catch {
    return "studio";
  }
}
