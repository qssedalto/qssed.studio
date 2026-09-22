import { huaweiHarmonyGate } from "./huawei-harmony-gate.js";
import authEntry from "../auth-entry.js";
import { recordAccessAudit } from "./access-audit.js";

export default {
  async fetch(request, env, ctx) {
    const deviceGate = huaweiHarmonyGate(request);
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
