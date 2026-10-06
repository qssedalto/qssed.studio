// 初学者导读：全局搜索 API：聚合多个工作区来源并返回统一结果。搜索层只做授权后的可见数据聚合，不应越权跨用户读取。
import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { CURATED_LINK_CATEGORIES, CURATED_LINKS_CORE } from "./curated-links-core.js";
import { CURATED_LINKS_EXTRA } from "./curated-links-extra.js";
import { json } from "./routing.js";
import { verifyStudioApiSession, withStudioSessionCookies } from "./session-gate.js";
import { hasStorageBinding, verifyStorageUser } from "./storage-api.js";
import { workerLog } from "./server-runtime.js";

const CURATED_LINKS = [...CURATED_LINKS_CORE, ...CURATED_LINKS_EXTRA];
const NOTES_ROOT = "_system/notes/";
const SUMMARY_ROOT = "_system/summaries/";
const USER_LINKS_ROOT = "_system/user-links/";
const MAX_RESULTS = 80;
const MAX_NOTES = 240;
const MAX_COMMUNITY_SCAN = 5000;

export async function handleGlobalSearch(request, env) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const session = await verifyStudioApiSession(request);
  if (!session.ok) {
    return withStudioSessionCookies(json({ error: "Authentication required." }, 401), session.cookies);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return withStudioSessionCookies(json({ error: "Invalid request body." }, 400), session.cookies);
  }

  const query = cleanQuery(payload?.query);
  if (!query) {
    return withStudioSessionCookies(json({ query: "", results: [], counts: {}, partial: false }), session.cookies);
  }

  const requestedLimit = Number(payload?.limit);
  const limit = Number.isFinite(requestedLimit)
    ? Math.max(1, Math.min(Math.trunc(requestedLimit), MAX_RESULTS))
    : 60;

  const authRequest = new Request(request.url, {
    method: "GET",
    headers: { Authorization: `Bearer ${session.accessToken}` }
  });
  const auth = await verifyStorageUser(authRequest, env);
  if (auth.error) return withStudioSessionCookies(auth.error, session.cookies);
  if (!hasStorageBinding(env)) {
    return withStudioSessionCookies(json({ error: "Search storage is temporarily unavailable." }, 503), session.cookies);
  }

  const warnings = [];
  const safeRun = async (name, operation) => {
    try {
      return await operation();
    } catch (error) {
      warnings.push(name);
      workerLog("warn", "global_search.module_failed", {
        user_id: auth.user.id,
        module: name,
        error_type: error?.name || "Error",
        message: String(error?.message || error).slice(0, 300)
      });
      return [];
    }
  };

  const [knowledge, notes, summaries, links] = await Promise.all([
    safeRun("knowledge", () => searchKnowledge(query, session.accessToken, limit)),
    safeRun("notes", () => searchNotes(env, auth.user.id, query)),
    safeRun("summaries", () => searchSummaries(env, auth, query)),
    safeRun("links", () => searchUserLinks(env, auth, query))
  ]);

  const curated = searchCuratedLinks(query);
  const results = [...knowledge, ...notes, ...summaries, ...links, ...curated];
  await attachOwnerLabels(results, auth);
  results.sort(compareResults);

  const sliced = results.slice(0, limit).map(({ score, owner_id, ...item }) => item);
  const counts = {};
  for (const item of sliced) counts[item.type] = (counts[item.type] || 0) + 1;

  return withStudioSessionCookies(json({
    query,
    results: sliced,
    counts,
    total: results.length,
    returned: sliced.length,
    partial: warnings.length > 0,
    unavailable_modules: warnings
  }), session.cookies);
}

async function searchKnowledge(query, accessToken, limit) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/search_knowledge_documents`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${accessToken}`,
      "content-type": "application/json;charset=UTF-8",
      Accept: "application/json"
    },
    body: JSON.stringify({ p_query: query, p_limit: Math.min(limit, 40) })
  });
  if (!response.ok) throw new Error(`knowledge:${response.status}`);
  const rows = await response.json();
  return (Array.isArray(rows) ? rows : []).map(row => ({
    id: `knowledge:${row.id}`,
    type: "knowledge",
    scope: "private",
    title: cleanText(row.title, 240) || "Untitled knowledge",
    subtitle: [cleanText(row.category, 80), cleanText(row.language, 24)].filter(Boolean).join(" · "),
    snippet: excerpt(row.summary || row.content, query, 260),
    href: "/info/knowledge",
    external: false,
    updated_at: row.updated_at || null,
    score: 4 + Math.max(0, Number(row.match_rank) || 0) * 8
  }));
}

async function searchNotes(env, userId, query) {
  const results = [];
  let cursor;
  let scanned = 0;
  do {
    const page = await env.STORAGE.list({ prefix: `${NOTES_ROOT}${userId}/`, cursor, limit: Math.min(500, MAX_NOTES - scanned) });
    for (const object of page.objects) {
      scanned += 1;
      const parsed = await readJsonObject(env, object.key);
      if (!parsed || parsed.owner_id !== userId) continue;
      const score = matchScore(query, parsed.title, parsed.project, parsed.kind, parsed.tags, parsed.source, parsed.body, parsed.conclusion, parsed.next_steps);
      if (score === null) continue;
      results.push({
        id: `note:${parsed.id || object.key}`,
        type: "note",
        scope: "private",
        title: cleanText(parsed.title, 180) || "Untitled note",
        subtitle: [cleanText(parsed.project, 120), cleanText(parsed.kind, 80)].filter(Boolean).join(" · "),
        snippet: excerpt(parsed.body || parsed.conclusion || parsed.source, query, 260),
        href: "/info/notes",
        external: false,
        updated_at: parsed.updated_at || object.uploaded?.toISOString?.() || null,
        score
      });
    }
    cursor = page.cursor;
    if (!page.truncated || !cursor || scanned >= MAX_NOTES) break;
  } while (cursor);
  return results;
}

async function searchSummaries(env, auth, query) {
  const results = [];
  const key = `${SUMMARY_ROOT}${auth.user.id}/current.json`;
  const parsed = await readJsonObject(env, key);
  if (parsed) pushSummaryResult(results, parsed, auth.user.id, auth.user.id, query);
  return results;
}

function pushSummaryResult(results, parsed, ownerId, currentUserId, query) {
  const score = matchScore(query, parsed.title, parsed.source, parsed.purpose, parsed.core, parsed.points, parsed.evidence, parsed.limits, parsed.actions, parsed.tags);
  if (score === null) return;
  results.push({
    id: `summary:${ownerId}`,
    type: "summary",
    scope: "private",
    title: cleanText(parsed.title, 160) || "Untitled summary",
    subtitle: cleanText(parsed.source, 180),
    snippet: excerpt(parsed.core || parsed.purpose || parsed.points, query, 260),
    href: "/info/summaries",
    external: false,
    updated_at: parsed.updated_at || null,
    owner_id: ownerId,
    score
  });
}

async function searchUserLinks(env, auth, query) {
  const results = [];
  const seen = new Set();
  const privatePrefix = `${USER_LINKS_ROOT}${auth.user.id}/`;
  let cursor;
  let scanned = 0;

  do {
    const page = await env.STORAGE.list({ prefix: privatePrefix, cursor, limit: 500 });
    for (const object of page.objects) {
      scanned += 1;
      const ref = userLinkReference(object.key);
      if (!ref || ref.ownerId !== auth.user.id) continue;
      const parsed = await readJsonObject(env, object.key);
      if (!validStoredLink(parsed, ref)) continue;
      const score = matchScore(query, parsed.title, parsed.url, parsed.category, parsed.description);
      if (score === null) continue;
      const key = `${ref.ownerId}:${ref.linkId}`;
      seen.add(key);
      results.push(linkResult(parsed, ref, auth.user.id, score, "private"));
    }
    cursor = page.cursor;
    if (!page.truncated || !cursor || scanned >= 240) break;
  } while (cursor);

  cursor = undefined;
  scanned = 0;
  do {
    const page = await env.STORAGE.list({ prefix: USER_LINKS_ROOT, cursor, limit: 500, include: ["customMetadata"] });
    for (const object of page.objects) {
      scanned += 1;
      if (object.customMetadata?.community !== "true") continue;
      const ref = userLinkReference(object.key);
      if (!ref) continue;
      const key = `${ref.ownerId}:${ref.linkId}`;
      if (seen.has(key)) continue;
      const parsed = await readJsonObject(env, object.key);
      if (!validStoredLink(parsed, ref) || parsed.community !== true) continue;
      const score = matchScore(query, parsed.title, parsed.url, parsed.category, parsed.description);
      if (score === null) continue;
      seen.add(key);
      results.push(linkResult(parsed, ref, auth.user.id, score, "community"));
    }
    cursor = page.cursor;
    if (!page.truncated || !cursor || scanned >= MAX_COMMUNITY_SCAN) break;
  } while (cursor);
  return results;
}

function linkResult(parsed, ref, currentUserId, score, scope) {
  return {
    id: `link:${ref.ownerId}:${ref.linkId}`,
    type: scope === "community" ? "community_link" : "link",
    scope,
    title: cleanText(parsed.title, 180) || "Untitled link",
    subtitle: cleanText(parsed.category, 80),
    snippet: cleanText(parsed.description, 260) || safeHost(parsed.url),
    href: parsed.url,
    external: true,
    updated_at: parsed.updated_at || parsed.created_at || null,
    owner_id: ref.ownerId,
    is_own: ref.ownerId === currentUserId,
    community: parsed.community === true,
    score
  };
}

function searchCuratedLinks(query) {
  const results = [];
  for (let index = 0; index < CURATED_LINKS.length; index += 1) {
    const link = CURATED_LINKS[index];
    const category = CURATED_LINK_CATEGORIES[link.category];
    const score = matchScore(query, link.title, link.url, link.zh, link.en, category?.zh, category?.en);
    if (score === null) continue;
    results.push({
      id: `curated:${index}`,
      type: "curated_link",
      scope: "curated",
      title: cleanText(link.title, 180),
      subtitle: cleanText(category?.zh || category?.en || link.category, 80),
      snippet: cleanText(link.zh || link.en, 260),
      href: link.url,
      external: true,
      updated_at: null,
      featured: Boolean(link.featured),
      score: score + (link.featured ? -3 : 0)
    });
  }
  return results;
}

async function attachOwnerLabels(results, auth) {
  const ids = [...new Set(results.map(item => item.owner_id).filter(id => id && id !== auth.user.id))];
  const labels = new Map([[auth.user.id, "当前账号"]]);
  for (let index = 0; index < ids.length; index += 100) {
    const chunk = ids.slice(index, index + 100);
    const url = new URL(`${SUPABASE_URL}/rest/v1/profiles`);
    url.searchParams.set("select", "id,username,display_name");
    url.searchParams.set("id", `in.(${chunk.join(",")})`);
    try {
      const response = await fetch(url.toString(), { headers: serviceHeaders(auth.secret) });
      if (!response.ok) continue;
      const rows = await response.json();
      for (const row of Array.isArray(rows) ? rows : []) {
        const username = cleanText(row?.username, 80);
        const displayName = cleanText(row?.display_name, 120);
        labels.set(row.id, displayName && username && displayName.toLowerCase() !== username.toLowerCase()
          ? `${displayName} · @${username}`
          : username ? `@${username}` : displayName || `用户 ${String(row?.id || "").slice(0, 8)}`);
      }
    } catch {}
  }
  for (const item of results) {
    if (!item.owner_id) continue;
    item.owner_label = labels.get(item.owner_id) || `用户 ${String(item.owner_id).slice(0, 8)}`;
  }
}

async function readJsonObject(env, key) {
  const object = await env.STORAGE.get(key);
  if (!object) return null;
  try {
    const value = JSON.parse(await object.text());
    return value && typeof value === "object" ? value : null;
  } catch {
    return null;
  }
}

function userLinkReference(key) {
  const parts = String(key || "").split("/");
  if (parts.length !== 4 || parts[0] !== "_system" || parts[1] !== "user-links" || !parts[3].endsWith(".json")) return null;
  return { ownerId: parts[2], linkId: parts[3].slice(0, -5) };
}

function validStoredLink(parsed, ref) {
  return Boolean(parsed && parsed.owner_id === ref.ownerId && parsed.id === ref.linkId && parsed.title && /^https?:\/\//i.test(String(parsed.url || "")));
}

function summaryOwnerId(key) {
  const parts = String(key || "").split("/");
  return parts.length === 4 && parts[0] === "_system" && parts[1] === "summaries" && parts[3] === "current.json" ? parts[2] : "";
}

function serviceHeaders(secret) {
  return {
    apikey: secret,
    ...(String(secret || "").split(".").length === 3 ? { Authorization: `Bearer ${secret}` } : {})
  };
}

export function globalSearchMatchScore(query, ...values) {
  return matchScore(query, ...values);
}

function matchScore(query, ...values) {
  const q = normalize(query);
  if (!q) return null;
  const fields = values.map(value => normalize(value)).filter(Boolean);
  if (!fields.length) return null;
  const title = fields[0] || "";
  if (title === q) return 0;
  if (title.startsWith(q)) return 8;
  if (title.includes(q)) return 16;

  for (let index = 1; index < fields.length; index += 1) {
    if (fields[index].includes(q)) return 28 + index;
  }

  const tokens = q.split(/\s+/).filter(token => token.length > 1).slice(0, 8);
  if (tokens.length > 1) {
    const joined = fields.join(" ");
    const hits = tokens.filter(token => joined.includes(token)).length;
    if (hits === tokens.length) return 52;
    if (hits >= Math.ceil(tokens.length * 0.7)) return 66;
  }
  return null;
}

function compareResults(a, b) {
  if (a.score !== b.score) return a.score - b.score;
  const aTime = Date.parse(a.updated_at || "") || 0;
  const bTime = Date.parse(b.updated_at || "") || 0;
  if (aTime !== bTime) return bTime - aTime;
  return String(a.title || "").localeCompare(String(b.title || ""));
}

function excerpt(value, query, maximum) {
  const text = cleanText(value, 12000).replace(/\s+/g, " ").trim();
  if (!text) return "";
  const q = normalize(query);
  const lower = text.toLocaleLowerCase();
  const at = lower.indexOf(q);
  if (at < 0 || text.length <= maximum) return text.slice(0, maximum);
  const start = Math.max(0, at - Math.floor(maximum * 0.35));
  const end = Math.min(text.length, start + maximum);
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}

function safeHost(value) {
  try { return new URL(String(value || "")).hostname.replace(/^www\./, ""); } catch { return ""; }
}

function cleanQuery(value) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
}

function cleanText(value, maximum) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, maximum);
}

function normalize(value) {
  return cleanText(value, 200000).toLocaleLowerCase();
}
