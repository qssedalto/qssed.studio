import { json } from "./routing.js";
import { verifyStudioApiSession, withStudioSessionCookies } from "./session-gate.js";
import { hasStorageBinding, isStorageObjectId, verifyStorageUser } from "./storage-api.js";
import { workerLog } from "./server-runtime.js";

const DRAFT_ROOT = "_system/drafts/";
const PROJECT_ROOT = "_system/projects/";
const MAX_DRAFTS = 300;
const MAX_SEARCH_RESULTS = 100;
const MAX_PAYLOAD_BYTES = 128 * 1024;

function draftPrefix(userId) {
  return `${DRAFT_ROOT}${userId}/`;
}

// 草稿按用户 ID 分隔存储，避免把客户端传入的标识拼成跨用户 R2 路径。
function draftKey(userId, draftId) {
  return `${draftPrefix(userId)}${draftId}.json`;
}

function projectKey(userId, projectId) {
  return `${PROJECT_ROOT}${userId}/${projectId}.json`;
}

export async function handleDrafts(request, env) {
  const session = await verifyStudioApiSession(request);
  if (!session.ok) return withStudioSessionCookies(json({ error: "Authentication required." }, 401), session.cookies);

  const authRequest = new Request(request.url, {
    method: "GET",
    headers: { Authorization: `Bearer ${session.accessToken}` }
  });
  const auth = await verifyStorageUser(authRequest, env);
  if (auth.error) return withStudioSessionCookies(auth.error, session.cookies);
  if (!hasStorageBinding(env)) return withStudioSessionCookies(json({ error: "Draft storage is temporarily unavailable." }, 503), session.cookies);

  let response;
  if (request.method === "GET") response = await getDrafts(request, env, auth.user.id);
  else if (request.method === "POST") response = await createDraft(request, env, auth.user.id);
  else if (request.method === "PUT") response = await updateDraft(request, env, auth.user.id);
  else if (request.method === "DELETE") response = await deleteDraft(request, env, auth.user.id);
  else response = json({ error: "Method not allowed" }, 405);

  return withStudioSessionCookies(response, session.cookies);
}

async function getDrafts(request, env, userId) {
  const url = new URL(request.url);
  const id = cleanDraftId(url.searchParams.get("id"));
  if (id) {
    const draft = await readDraft(env, userId, id);
    return draft ? json({ draft }) : json({ error: "Draft not found." }, 404);
  }

  const query = cleanSearchQuery(url.searchParams.get("q"));
  try {
    const drafts = [];
    let cursor;
    do {
      const page = await env.STORAGE.list({
        prefix: draftPrefix(userId),
        cursor,
        limit: Math.min(1000, MAX_DRAFTS),
        include: ["customMetadata"]
      });
      for (const object of page.objects) {
        const reference = parseDraftKey(object.key, userId);
        if (!reference) continue;
        if (query) {
          const draft = await readDraft(env, userId, reference.draftId);
          if (draft && matchesDraft(draft, query)) drafts.push(draftSummary(draft));
        } else {
          let summary = summaryFromMetadata(object.customMetadata, userId, reference.draftId);
          if (!summary) {
            const draft = await readDraft(env, userId, reference.draftId);
            if (draft) summary = draftSummary(draft);
          }
          if (summary) drafts.push(summary);
        }
        if (query && drafts.length >= MAX_SEARCH_RESULTS) break;
        if (!query && drafts.length >= MAX_DRAFTS) break;
      }
      cursor = page.cursor;
      if (!page.truncated || !cursor || (query && drafts.length >= MAX_SEARCH_RESULTS) || (!query && drafts.length >= MAX_DRAFTS)) break;
    } while (cursor);

    drafts.sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")));
    return json({ drafts, count: drafts.length, scope: "own", query });
  } catch (error) {
    workerLog("error", "drafts.list.failed", { user_id: userId, search: Boolean(query), message: String(error?.message || error) });
    return json({ error: "Draft storage is temporarily unavailable." }, 503);
  }
}

async function createDraft(request, env, userId) {
  const parsed = await parsePayload(request);
  if (parsed.error) return parsed.error;
  const draftId = crypto.randomUUID();
  const draft = normalizeDraft(parsed.value, userId, draftId, null);
  if (!draft.ok) return json({ error: draft.error }, 400);
  const projectError = await validateProjectReference(env, userId, draft.value.project_id);
  if (projectError) return projectError;

  try {
    const existing = await env.STORAGE.list({ prefix: draftPrefix(userId), limit: MAX_DRAFTS + 1 });
    if (existing.objects.length >= MAX_DRAFTS) return json({ error: "Draft limit reached." }, 409);
    await writeDraft(env, draft.value);
    return json({ draft: draft.value, created: true }, 201);
  } catch (error) {
    workerLog("error", "drafts.create.failed", { user_id: userId, message: String(error?.message || error) });
    return json({ error: "Could not create draft." }, 503);
  }
}

async function updateDraft(request, env, userId) {
  const draftId = cleanDraftId(new URL(request.url).searchParams.get("id"));
  if (!draftId) return json({ error: "Invalid draft identifier." }, 400);
  const parsed = await parsePayload(request);
  if (parsed.error) return parsed.error;

  try {
    const previous = await readDraft(env, userId, draftId);
    if (!previous) return json({ error: "Draft not found." }, 404);
    const draft = normalizeDraft(parsed.value, userId, draftId, previous);
    if (!draft.ok) return json({ error: draft.error }, 400);
    const projectError = await validateProjectReference(env, userId, draft.value.project_id);
    if (projectError) return projectError;
    await writeDraft(env, draft.value);
    return json({ draft: draft.value, saved: true });
  } catch (error) {
    workerLog("error", "drafts.update.failed", { user_id: userId, draft_id: draftId, message: String(error?.message || error) });
    return json({ error: "Could not save draft." }, 503);
  }
}

async function deleteDraft(request, env, userId) {
  const draftId = cleanDraftId(new URL(request.url).searchParams.get("id"));
  if (!draftId) return json({ error: "Invalid draft identifier." }, 400);
  try {
    const existing = await env.STORAGE.head(draftKey(userId, draftId));
    if (!existing) return json({ error: "Draft not found." }, 404);
    await env.STORAGE.delete(draftKey(userId, draftId));
    return json({ deleted: true, id: draftId });
  } catch (error) {
    workerLog("error", "drafts.delete.failed", { user_id: userId, draft_id: draftId, message: String(error?.message || error) });
    return json({ error: "Could not delete draft." }, 503);
  }
}

async function validateProjectReference(env, userId, projectId) {
  if (!projectId) return null;
  try {
    const object = await env.STORAGE.head(projectKey(userId, projectId));
    return object ? null : json({ error: "Selected project is not available to this account." }, 400);
  } catch {
    return json({ error: "Could not validate the selected project." }, 503);
  }
}

async function writeDraft(env, draft) {
  await env.STORAGE.put(draftKey(draft.owner_id, draft.id), JSON.stringify(draft), {
    httpMetadata: { contentType: "application/json;charset=UTF-8" },
    customMetadata: draftMetadata(draft)
  });
}

async function readDraft(env, userId, draftId) {
  const object = await env.STORAGE.get(draftKey(userId, draftId));
  if (!object) return null;
  try {
    const parsed = JSON.parse(await object.text());
    if (!parsed || parsed.owner_id !== userId || parsed.id !== draftId) return null;
    const normalized = normalizeDraft(parsed, userId, draftId, parsed);
    return normalized.ok ? normalized.value : null;
  } catch {
    return null;
  }
}

// 统一清洗草稿字段、关联项目 ID 和时间信息；更新旧草稿时需要保留必要的历史字段而不是直接覆盖全部对象。
function normalizeDraft(input, userId, draftId, previous) {
  const source = input && typeof input === "object" ? input : {};
  const projectIdRaw = cleanText(source.project_id, 64);
  const projectId = projectIdRaw ? cleanProjectId(projectIdRaw) : "";
  if (projectIdRaw && !projectId) return { ok: false, error: "Invalid project identifier." };

  const now = new Date().toISOString();
  return {
    ok: true,
    value: {
      id: draftId,
      owner_id: userId,
      project_id: projectId,
      title: cleanText(source.title, 180),
      body: cleanBody(source.body, 90000),
      created_at: previous?.created_at || now,
      updated_at: now
    }
  };
}

async function parsePayload(request) {
  const declared = Number(request.headers.get("Content-Length") || 0);
  if (declared > MAX_PAYLOAD_BYTES) return { error: json({ error: "Draft payload is too large." }, 413) };
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_PAYLOAD_BYTES) return { error: json({ error: "Draft payload is too large." }, 413) };
    return { value: JSON.parse(raw || "{}") };
  } catch {
    return { error: json({ error: "Invalid draft payload." }, 400) };
  }
}

function draftMetadata(draft) {
  return {
    ownerId: draft.owner_id,
    hidden: "true",
    kind: "draft",
    projectId: draft.project_id,
    title: draft.title,
    preview: draft.body.replace(/\s+/g, " ").trim().slice(0, 240),
    createdAt: draft.created_at,
    updatedAt: draft.updated_at
  };
}

function draftSummary(draft) {
  return {
    id: draft.id,
    project_id: draft.project_id,
    title: draft.title,
    preview: draft.body.replace(/\s+/g, " ").trim().slice(0, 240),
    created_at: draft.created_at,
    updated_at: draft.updated_at
  };
}

function summaryFromMetadata(meta, userId, draftId) {
  if (!meta || meta.kind !== "draft" || meta.ownerId !== userId) return null;
  const projectId = meta.projectId ? cleanProjectId(meta.projectId) : "";
  if (meta.projectId && !projectId) return null;
  return {
    id: draftId,
    project_id: projectId,
    title: cleanText(meta.title, 180),
    preview: cleanText(meta.preview, 240),
    created_at: cleanTimestamp(meta.createdAt),
    updated_at: cleanTimestamp(meta.updatedAt)
  };
}

function matchesDraft(draft, query) {
  const haystack = `${draft.title}\n${draft.body}`.toLocaleLowerCase();
  return haystack.includes(query);
}

function parseDraftKey(key, expectedOwnerId) {
  const parts = String(key || "").split("/");
  if (parts.length !== 4 || parts[0] !== "_system" || parts[1] !== "drafts" || parts[2] !== expectedOwnerId || !parts[3].endsWith(".json")) return null;
  const draftId = parts[3].slice(0, -5);
  return isStorageObjectId(draftId) ? { draftId } : null;
}

function cleanDraftId(value) {
  const text = String(value || "").trim();
  return isStorageObjectId(text) ? text : "";
}

function cleanProjectId(value) {
  const text = String(value || "").trim();
  return isStorageObjectId(text) ? text : "";
}

function cleanSearchQuery(value) {
  return cleanText(value, 200).toLocaleLowerCase();
}

function cleanTimestamp(value) {
  const timestamp = Date.parse(String(value || ""));
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : new Date(0).toISOString();
}

function cleanBody(value, maximum) {
  return String(value ?? "").replace(/\u0000/g, "").slice(0, maximum);
}

function cleanText(value, maximum) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maximum);
}
