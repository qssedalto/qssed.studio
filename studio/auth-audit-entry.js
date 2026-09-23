import { huaweiHarmonyGate } from "./huawei-harmony-gate.js";
import authEntry from "../auth-entry.js";
import { recordAccessAudit } from "./access-audit.js";

export default {
  async fetch(request, env, ctx) {
    const alias = canonicalAuthAlias(request);
    if (alias) return alias;

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

function canonicalAuthAlias(request) {
  try {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    if (host !== "auth.qsseda.online" && host !== "auth.qsseda.studio") return null;
    url.protocol = "https:";
    url.hostname = "auth.qsseda.com";
    url.port = "";
    return permanentRedirect(url.toString());
  } catch {
    return null;
  }
}

function permanentRedirect(location) {
  return new Response(null, {
    status: 308,
    headers: {
      location,
      "cache-control": "no-store",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff"
    }
  });
}
