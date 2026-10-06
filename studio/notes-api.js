/**
 * 【初学者导读】
 * 文件：studio/notes-api.js
 * 服务端 API 模块：接收已路由的请求，校验身份与参数，并执行数据读写后返回 JSON/HTTP 响应。
 * 阅读顺序：先看对外导出和路由入口，再看参数归一化、权限/语言处理，最后追踪存储或模板渲染。
 * 初学者重点：区分“数据来源”“业务规则”“展示格式”三层，不要把一个显示问题直接当成数据库问题。
 * 修改注意：尽量保持现有路径、字段和返回结构兼容；规则改变时补充对应回归检查。
 * 调试方法：先确认实际命中的路由和 locale，再检查 handler 输入，最后验证最终 Response。
 */
import { hasStorageBinding, isStorageObjectId, verifyStorageUser } from "./storage-api.js";
import { json } from "./routing.js";
import { workerLog } from "./server-runtime.js";

const NOTES_ROOT = "_system/notes/";
const MAX_NOTE_BYTES = 96 * 1024;
const MAX_NOTES = 240;

function notesPrefix(userId) {
  return `${NOTES_ROOT}${userId}/`;
}

function noteKey(userId, noteId) {
  return `${notesPrefix(userId)}${noteId}.json`;
}

function cleanText(value, maximum) {
  return String(value ?? "").replace(/\u0000/g, "").slice(0, maximum);
}

function normalizeNote(input, ownerId, noteId, previous = null) {
  const source = input && typeof input === "object" ? input : {};
  const now = new Date().toISOString();
  return {
    id: noteId,
    owner_id: ownerId,
    title: cleanText(source.title, 180),
    project: cleanText(source.project, 120),
    kind: cleanText(source.kind, 80),
    tags: cleanText(source.tags, 800),
    source: cleanText(source.source, 1600),
    body: cleanText(source.body, 48000),
    conclusion: cleanText(source.conclusion, 8000),
    next_steps: cleanText(source.next_steps, 5000),
    status: ["active", "reference", "done"].includes(source.status) ? source.status : (previous?.status || "active"),
    pinned: source.pinned === true,
    created_at: previous?.created_at || cleanText(source.created_at, 80) || now,
    updated_at: now
  };
}

function hasContent(note) {
  return [note.title, note.project, note.kind, note.tags, note.source, note.body, note.conclusion, note.next_steps]
    .some(value => String(value || "").trim());
}

function noteSummary(note) {
  return {
    id: note.id,
    title: note.title,
    project: note.project,
    kind: note.kind,
    tags: note.tags,
    status: note.status,
    pinned: note.pinned,
    created_at: note.created_at,
    updated_at: note.updated_at,
    preview: String(note.body || note.conclusion || "").trim().slice(0, 220)
  };
}

async function readNote(env, userId, noteId) {
  const object = await env.STORAGE.get(noteKey(userId, noteId));
  if (!object) return null;
  try {
    const parsed = JSON.parse(await object.text());
    if (!parsed || parsed.owner_id !== userId || parsed.id !== noteId) return null;
    return {
      ...normalizeNote(parsed, userId, noteId, parsed),
      updated_at: parsed.updated_at || object.uploaded?.toISOString?.() || new Date().toISOString()
    };
  } catch (error) {
    workerLog("warn", "notes.read.invalid", { user_id: userId, note_id: noteId, message: String(error?.message || error) });
    return null;
  }
}

async function listNotes(env, userId) {
  const notes = [];
  let cursor;
  do {
    const page = await env.STORAGE.list({ prefix: notesPrefix(userId), cursor, limit: Math.min(1000, MAX_NOTES - notes.length) });
    for (const object of page.objects) {
      const filename = String(object.key || "").slice(notesPrefix(userId).length);
      const noteId = filename.endsWith(".json") ? filename.slice(0, -5) : "";
      if (!isStorageObjectId(noteId)) continue;
      const note = await readNote(env, userId, noteId);
      if (note && hasContent(note)) notes.push(noteSummary(note));
      if (notes.length >= MAX_NOTES) break;
    }
    cursor = page.cursor;
    if (!page.truncated || !cursor || notes.length >= MAX_NOTES) break;
  } while (cursor);

  notes.sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
    return String(b.updated_at || "").localeCompare(String(a.updated_at || ""));
  });
  return notes;
}

async function parsePayload(request) {
  const declared = Number(request.headers.get("Content-Length") || 0);
  if (declared > MAX_NOTE_BYTES) return { error: json({ error: "Note is too large." }, 413) };
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_NOTE_BYTES) return { error: json({ error: "Note is too large." }, 413) };
    return { value: JSON.parse(raw || "{}") };
  } catch {
    return { error: json({ error: "Invalid note payload." }, 400) };
  }
}

export async function handleNotes(request, env) {
  const auth = await verifyStorageUser(request, env);
  if (auth.error) return auth.error;
  if (!hasStorageBinding(env)) return json({ error: "Notes service is temporarily unavailable." }, 503);

  const url = new URL(request.url);
  const requestedId = url.searchParams.get("id") || "";

  if (request.method === "GET") {
    try {
      if (requestedId) {
        if (!isStorageObjectId(requestedId)) return json({ error: "Invalid note id." }, 400);
        const note = await readNote(env, auth.user.id, requestedId);
        return note ? json({ note }) : json({ error: "Note not found." }, 404);
      }
      const notes = await listNotes(env, auth.user.id);
      return json({ connected: true, notes, count: notes.length, limit: MAX_NOTES });
    } catch (error) {
      workerLog("error", "notes.read.failed", { user_id: auth.user.id, message: String(error?.message || error) });
      return json({ error: "Notes service is temporarily unavailable." }, 503);
    }
  }

  if (request.method === "POST") {
    const parsed = await parsePayload(request);
    if (parsed.error) return parsed.error;
    const id = crypto.randomUUID();
    const note = normalizeNote(parsed.value, auth.user.id, id);
    if (!hasContent(note)) note.title = "Untitled note";
    try {
      await env.STORAGE.put(noteKey(auth.user.id, id), JSON.stringify(note), {
        httpMetadata: { contentType: "application/json;charset=UTF-8" },
        customMetadata: { ownerId: auth.user.id, hidden: "true", kind: "research-note", title: note.title.slice(0, 120) }
      });
      return json({ note, created: true }, 201);
    } catch (error) {
      workerLog("error", "notes.create.failed", { user_id: auth.user.id, message: String(error?.message || error) });
      return json({ error: "Could not create note." }, 503);
    }
  }

  if (request.method === "PUT") {
    if (!isStorageObjectId(requestedId)) return json({ error: "Invalid note id." }, 400);
    const parsed = await parsePayload(request);
    if (parsed.error) return parsed.error;
    try {
      const previous = await readNote(env, auth.user.id, requestedId);
      if (!previous) return json({ error: "Note not found." }, 404);
      const note = normalizeNote(parsed.value, auth.user.id, requestedId, previous);
      await env.STORAGE.put(noteKey(auth.user.id, requestedId), JSON.stringify(note), {
        httpMetadata: { contentType: "application/json;charset=UTF-8" },
        customMetadata: { ownerId: auth.user.id, hidden: "true", kind: "research-note", title: note.title.slice(0, 120) }
      });
      return json({ note, saved: true });
    } catch (error) {
      workerLog("error", "notes.save.failed", { user_id: auth.user.id, note_id: requestedId, message: String(error?.message || error) });
      return json({ error: "Could not save note." }, 503);
    }
  }

  if (request.method === "DELETE") {
    if (!isStorageObjectId(requestedId)) return json({ error: "Invalid note id." }, 400);
    try {
      const existing = await env.STORAGE.head(noteKey(auth.user.id, requestedId));
      if (!existing) return json({ error: "Note not found." }, 404);
      await env.STORAGE.delete(noteKey(auth.user.id, requestedId));
      return json({ deleted: true, id: requestedId });
    } catch (error) {
      workerLog("error", "notes.delete.failed", { user_id: auth.user.id, note_id: requestedId, message: String(error?.message || error) });
      return json({ error: "Could not delete note." }, 503);
    }
  }

  return json({ error: "Method not allowed" }, 405);
}
