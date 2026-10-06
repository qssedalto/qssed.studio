// 初学者导读：认证审计入口：把登录/会话相关事件整理成可查询的审计记录，供安全中心显示。
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
import authEntry from "../auth-entry.js";
import { recordAccessAudit } from "./access-audit.js";

export default {
  async fetch(request, env, ctx) {
    const deviceGate = await huaweiHarmonyGate(request);
    if (deviceGate) return deviceGate;

    const startedAt = Date.now();
    let response;

    try {
      response = await authEntry.fetch(request, env, ctx);
    } catch (error) {
      scheduleAudit(ctx, request, new Response(null, { status: 500 }), env, startedAt);
      throw error;
    }

    scheduleAudit(ctx, request, response, env, startedAt);
    return response;
  }
};

function scheduleAudit(ctx, request, response, env, startedAt) {
  const promise = recordAccessAudit(request, response, env, startedAt, "auth")
    .catch(error => console.error("Auth access audit write failed", error));
  if (ctx?.waitUntil) ctx.waitUntil(promise);
}

