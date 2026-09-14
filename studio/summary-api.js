import { hasStorageBinding, verifyStorageUser } from "./storage-api.js";
import { json } from "./routing.js";
import { workerLog } from "./server-runtime.js";

const SUMMARY_ROOT = "_system/summaries/";
const MAX_SUMMARY_BYTES = 64 * 1024;
const MAX_ADMIN_SUMMARIES = 500;

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

function serviceHeaders(secret) {
  return {
    apikey: secret,
    ...(secret.split(".").length === 3 ? { Authorization: `Bearer ${secret}` } : {})
  };
}

async function fetchOwnerLabels(secret, ownerIds) {
  const unique = [...new Set(ownerIds.filter(Boolean))];
  const labels = new Map();
  for (let index = 0; index < unique.length; index += 100) {
    const chunk = unique.slice(index, index + 100);
    const url = new URL("https://qssedalto.supabase.co/rest/v1/profiles");
    url.searchParams.set("select", "id,username,display_name");
    url.searchParams.set("id", `in.(${chunk.join(",")})`);
    try {
      const response = await fetch(url.toString(), { headers: serviceHeaders(secret) });
      if (!response.ok) continue;
      const rows = await response.json();
      for (const row of Array.isArray(rows) ? rows : []) {
        const username = String(row?.username || "").trim();
        const displayName = String(row?.display_name || "").trim();
        const label = displayName && username && displayName.toLowerCase() !== username.toLowerCase()
          ? `${displayName} · @${username}`
          : username ? `@${username}` : displayName || `用户 ${String(row?.id || "").slice(0, 8)}`;
        labels.set(row.id, label);
      }
    } catch {}
  }
  return labels;
}

async function listAllSummaries(env, auth) {
  const items = [];
  let cursor;
  do {
    const page = await env.STORAGE.list({ prefix: SUMMARY_ROOT, cursor, limit: Math.min(1000, MAX_ADMIN_SUMMARIES - items.length), include: ["customMetadata"] });
    for (const object of page.objects) {
      const parts = String(object.key || "").split("/");
      const ownerId = parts.length === 4 && parts[0] === "_system" && parts[1] === "summaries" && parts[3] === "current.json" ? parts[2] : "";
      if (!ownerId) continue;
      const summary = await readSummaryObject(env, object.key, ownerId);
      if (summary && summaryHasContent(summary)) items.push(summary);
      if (items.length >= MAX_ADMIN_SUMMARIES) break;
    }
    cursor = page.cursor;
    if (!page.truncated || !cursor || items.length >= MAX_ADMIN_SUMMARIES) break;
  } while (cursor);

  const labels = await fetchOwnerLabels(auth.secret, items.map(item => item.owner_id));
  for (const item of items) item.owner_label = labels.get(item.owner_id) || `用户 ${String(item.owner_id).slice(0, 8)}`;
  items.sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")));
  return items;
}

export async function handleSummaries(request, env) {
  const auth = await verifyStorageUser(request, env);
  if (auth.error) return auth.error;
  if (!hasStorageBinding(env)) return json({ error: "Summary storage is temporarily unavailable." }, 503);

  if (request.method === "GET") {
    try {
      const own = await readSummaryObject(env, summaryKey(auth.user.id), auth.user.id);
      const scope = new URL(request.url).searchParams.get("scope") || "own";
      const all = auth.isAdmin && scope === "all" ? await listAllSummaries(env, auth) : undefined;
      return json({
        connected: true,
        is_admin: auth.isAdmin,
        summary: own,
        summaries: all,
        scope: all ? "all" : "own"
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
