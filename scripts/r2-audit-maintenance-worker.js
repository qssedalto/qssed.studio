const AUDIT_PREFIX = "__system/access-audit/";
const MARKER_KEY = "__system/maintenance/r2-audit-security-filter-v1.json";
const SECURITY_PATH = /^\/(?:admin(?:\/|$)|api\/admin(?:\/|$)|auth(?:\/|$)|login(?:\/|$)|logout(?:\/|$)|oauth(?:\/|$)|gpt\/handoff(?:\/|$)|api\/storage(?:\/|$)|api\/ai\/admin(?:\/|$))/i;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (
      request.method !== "POST"
      || url.pathname !== "/__r2_maintenance/run"
      || request.headers.get("Authorization") !== "Bearer " + String(env.MAINTENANCE_TOKEN || "")
    ) {
      return new Response("Not Found", { status: 404 });
    }

    const prior = await env.STORAGE.head(MARKER_KEY);
    if (prior) {
      return json({ ok: true, skipped: true, reason: "maintenance marker already exists" });
    }

    let cursor;
    let scanned = 0;
    let scannedBytes = 0;
    const deleteKeys = [];
    let deleteBytes = 0;
    const keepCounts = { security: 0, write: 0, auth_error: 0, server_error: 0, unknown: 0 };

    do {
      const page = await env.STORAGE.list({
        prefix: AUDIT_PREFIX,
        cursor,
        limit: 1000,
        include: ["customMetadata"]
      });

      for (const object of page.objects || []) {
        scanned += 1;
        scannedBytes += Number(object.size) || 0;
        const decision = classify(object.customMetadata || {});
        if (decision.keep) {
          keepCounts[decision.reason] = (keepCounts[decision.reason] || 0) + 1;
          continue;
        }
        deleteKeys.push(object.key);
        deleteBytes += Number(object.size) || 0;
      }

      cursor = page.cursor;
      if (!page.truncated || !cursor) break;
    } while (cursor);

    let deleted = 0;
    for (let index = 0; index < deleteKeys.length; index += 500) {
      const batch = deleteKeys.slice(index, index + 500);
      await env.STORAGE.delete(batch);
      deleted += batch.length;
    }

    let remaining = 0;
    let remainingBytes = 0;
    cursor = undefined;
    do {
      const page = await env.STORAGE.list({ prefix: AUDIT_PREFIX, cursor, limit: 1000 });
      for (const object of page.objects || []) {
        remaining += 1;
        remainingBytes += Number(object.size) || 0;
      }
      cursor = page.cursor;
      if (!page.truncated || !cursor) break;
    } while (cursor);

    const result = {
      ok: true,
      skipped: false,
      scanned,
      scanned_bytes: scannedBytes,
      deleted,
      deleted_bytes: deleteBytes,
      remaining,
      remaining_bytes: remainingBytes,
      kept: keepCounts,
      completed_at: new Date().toISOString()
    };

    await env.STORAGE.put(MARKER_KEY, JSON.stringify(result), {
      httpMetadata: { contentType: "application/json;charset=UTF-8" },
      customMetadata: { maintenance: "r2-audit-security-filter-v1", completed_at: result.completed_at }
    });

    return json(result);
  }
};

function classify(meta) {
  const method = String(meta.method || "").toUpperCase();
  const status = Number(meta.status || 0);
  const path = String(meta.path || "");

  if (!method || !Number.isFinite(status) || status <= 0) return { keep: true, reason: "unknown" };
  if (method !== "GET" && method !== "HEAD") return { keep: true, reason: "write" };
  if (status === 401 || status === 403 || status === 429) return { keep: true, reason: "auth_error" };
  if (status >= 500) return { keep: true, reason: "server_error" };
  if (SECURITY_PATH.test(path)) return { keep: true, reason: "security" };
  return { keep: false, reason: "routine" };
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" }
  });
}
