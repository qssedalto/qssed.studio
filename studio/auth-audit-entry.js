/**
 * 【初学者导读】
 * 文件：studio/auth-audit-entry.js
 * 认证/安全模块：负责登录态、来源、Cookie、边缘保护或授权边界。
 * 阅读顺序：先看 export/入口函数，再看它调用的辅助函数；遇到 API 路径、存储键或域名判断时，向上追到 Worker 路由，向下追到具体数据源。
 * 数据流：建议始终回答四个问题——输入从哪里来？在哪里校验？修改了什么状态/存储？最后返回/渲染了什么？
 * 修改注意：这是安全敏感区域；不要省略来源校验、权限判断、Cookie/redirect 限制或失败分支。
 * 调试方法：先使用最小请求复现，再逐步检查分支条件和中间状态，避免只根据最终 UI 猜原因。
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

