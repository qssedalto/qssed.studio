/**
 * 【初学者导读】
 * 文件：studio/worker-audit.js
 * Worker 审计/包装入口：把主 Worker 与审计/保护逻辑组合在一起供生产部署使用。
 * 阅读顺序：先确认这个模块从哪里被导入，再看入口函数接收什么状态/Request；随后追踪 API、DOM、缓存或重定向副作用。
 * 初学者重点：Work/Watch 等独立产品虽然共享登录和品牌，但域名、路由和部署边界是分开的，不能把一个产品的假设直接复制到另一个。
 * 修改注意：保持已有 URL、查询参数、DOM 标识和登录交接兼容；如果产品边界变化，必须同步修改对应 CI 检查。
 * 调试方法：先确认 host/path 命中了哪个入口，再检查会话和内部状态，最后看具体 UI 或 API 结果。
 */
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
