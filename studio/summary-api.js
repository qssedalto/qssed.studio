import { hasStorageBinding, verifyStorageUser } from "./storage-api.js";
import { json } from "./routing.js";
import { workerLog } from "./server-runtime.js";

const SUMMARY_ROOT = "_system/summaries/";
const MAX_SUMMARY_BYTES = 64 * 1024;

function summaryKey(userId) {
  return `${SUMMARY_ROOT}${userId}/current.json`;
}

function cleanText(value, max) {
  return String(value ?? "").replace(/\u0000/g, "").slice(0, max);
}

function normalizeSummary(input, ownerId, updatedAt = new Date().toISOString()) {
  const source = input && typeof input === "object" ? input : {};
  return {
    owner_id: ownerId,
    title: cleanText(source.title, 160),
    source: cleanText(source.source, 1000),
    purpose: cleanText(source.purpose, 2400),
    core: cleanText(source.core, 12000),
    points: cleanText(source.points, 6000),
    evidence: cleanText(source.evidence, 6000),
    limits: cleanText(source.limits, 5000),
    actions: cleanText(source.actions, 5000),
    tags: cleanText(source.tags, 500),
    updated_at: updatedAt
  };
}

function summaryHasContent(summary) {
  return [summary.title, summary.source, summary.purpose, summary.core, summary.points, summary.evidence, summary.limits, summary.actions, summary.tags]
    .some(value => String(value || "").trim());
}

async function readSummaryObject(env, key, ownerId) {
  const object = await env.STORAGE.get(key);
  if (!object) return null;
  try {
    const parsed = JSON.parse(await object.text());
    return normalizeSummary(parsed, ownerId, parsed?.updated_at || object.uploaded?.toISOString?.() || new Date().toISOString());
  } catch (error) {
    workerLog("warn", "summary.read.invalid_json", { owner_user_id: ownerId, message: String(error?.message || error) });
    return null;
  }
}

export async function handleSummaries(request, env) {
  const auth = await verifyStorageUser(request, env);
  if (auth.error) return auth.error;
  if (!hasStorageBinding(env)) return json({ error: "Summary storage is temporarily unavailable." }, 503);

  if (request.method === "GET") {
    try {
      const own = await readSummaryObject(env, summaryKey(auth.user.id), auth.user.id);
      return json({
        connected: true,
        summary: own,
        scope: "own"
      });
    } catch (error) {
      workerLog("error", "summary.read.failed", { user_id: auth.user.id, message: String(error?.message || error) });
      return json({ error: "Summary storage is temporarily unavailable." }, 503);
    }
  }

  if (request.method === "DELETE") {
    try {
      await env.STORAGE.delete(summaryKey(auth.user.id));
      return json({ deleted: true });
    } catch (error) {
      workerLog("error", "summary.delete.failed", { user_id: auth.user.id, message: String(error?.message || error) });
      return json({ error: "Could not clear summary." }, 503);
    }
  }

  if (request.method !== "PUT") return json({ error: "Method not allowed" }, 405);

  const declared = Number(request.headers.get("Content-Length") || 0);
  if (declared > MAX_SUMMARY_BYTES) return json({ error: "Summary is too large." }, 413);

  let payload;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_SUMMARY_BYTES) return json({ error: "Summary is too large." }, 413);
    payload = JSON.parse(raw || "{}");
  } catch {
    return json({ error: "Invalid summary payload." }, 400);
  }

  const summary = normalizeSummary(payload, auth.user.id);
  if (!summaryHasContent(summary)) {
    try { await env.STORAGE.delete(summaryKey(auth.user.id)); } catch {}
    return json({ summary: null, deleted: true });
  }

  const body = JSON.stringify(summary);
  try {
    await env.STORAGE.put(summaryKey(auth.user.id), body, {
      httpMetadata: { contentType: "application/json;charset=UTF-8" },
      customMetadata: {
        ownerId: auth.user.id,
        hidden: "true",
        kind: "summary",
        title: summary.title.slice(0, 120)
      }
    });
    return json({ summary, saved: true });
  } catch (error) {
    workerLog("error", "summary.save.failed", { user_id: auth.user.id, message: String(error?.message || error) });
    return json({ error: "Could not save summary." }, 503);
  }
}
