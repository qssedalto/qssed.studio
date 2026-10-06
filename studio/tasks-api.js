// 初学者导读：任务中心 API：管理任务的创建、状态、截止时间与排序。所有任务操作都要经过当前用户资源归属校验。
import { json } from "./routing.js";
import { verifyStudioApiSession, withStudioSessionCookies } from "./session-gate.js";
import { hasStorageBinding, isStorageObjectId, verifyStorageUser } from "./storage-api.js";
import { workerLog } from "./server-runtime.js";

const TASK_ROOT = "_system/tasks/";
const PROJECT_ROOT = "_system/projects/";
const MAX_TASKS = 500;
const MAX_PAYLOAD_BYTES = 24 * 1024;
const STATUSES = new Set(["todo", "in_progress", "done"]);
const PRIORITIES = new Set(["low", "normal", "high"]);

function taskPrefix(userId) {
  return `${TASK_ROOT}${userId}/`;
}

function taskKey(userId, taskId) {
  return `${taskPrefix(userId)}${taskId}.json`;
}

function projectKey(userId, projectId) {
  return `${PROJECT_ROOT}${userId}/${projectId}.json`;
}

export async function handleTasks(request, env) {
  const session = await verifyStudioApiSession(request);
  if (!session.ok) return withStudioSessionCookies(json({ error: "Authentication required." }, 401), session.cookies);

  const authRequest = new Request(request.url, {
    method: "GET",
    headers: { Authorization: `Bearer ${session.accessToken}` }
  });
  const auth = await verifyStorageUser(authRequest, env);
  if (auth.error) return withStudioSessionCookies(auth.error, session.cookies);
  if (!hasStorageBinding(env)) return withStudioSessionCookies(json({ error: "Task storage is temporarily unavailable." }, 503), session.cookies);

  let response;
  if (request.method === "GET") response = await getTasks(request, env, auth.user.id);
  else if (request.method === "POST") response = await createTask(request, env, auth.user.id);
  else if (request.method === "PUT") response = await updateTask(request, env, auth.user.id);
  else if (request.method === "DELETE") response = await deleteTask(request, env, auth.user.id);
  else response = json({ error: "Method not allowed" }, 405);

  return withStudioSessionCookies(response, session.cookies);
}

async function getTasks(request, env, userId) {
  const url = new URL(request.url);
  const id = cleanTaskId(url.searchParams.get("id"));
  if (id) {
    const task = await readTask(env, userId, id);
    return task ? json({ task }) : json({ error: "Task not found." }, 404);
  }

  try {
    const tasks = [];
    let cursor;
    do {
      const page = await env.STORAGE.list({
        prefix: taskPrefix(userId),
        cursor,
        limit: Math.min(1000, MAX_TASKS - tasks.length),
        include: ["customMetadata"]
      });
      for (const object of page.objects) {
        const reference = parseTaskKey(object.key, userId);
        if (!reference) continue;
        let task = taskFromMetadata(object.customMetadata, userId, reference.taskId);
        if (!task) task = await readTask(env, userId, reference.taskId);
        if (task) tasks.push(task);
        if (tasks.length >= MAX_TASKS) break;
      }
      cursor = page.cursor;
      if (!page.truncated || !cursor || tasks.length >= MAX_TASKS) break;
    } while (cursor);

    tasks.sort(compareTasks);
    return json({ tasks, count: tasks.length, scope: "own" });
  } catch (error) {
    workerLog("error", "tasks.list.failed", { user_id: userId, message: String(error?.message || error) });
    return json({ error: "Task storage is temporarily unavailable." }, 503);
  }
}

async function createTask(request, env, userId) {
  const parsed = await parsePayload(request);
  if (parsed.error) return parsed.error;
  const taskId = crypto.randomUUID();
  const task = normalizeTask(parsed.value, userId, taskId, null);
  if (!task.ok) return json({ error: task.error }, 400);
  const projectError = await validateProjectReference(env, userId, task.value.project_id);
  if (projectError) return projectError;

  try {
    const existing = await env.STORAGE.list({ prefix: taskPrefix(userId), limit: MAX_TASKS + 1 });
    if (existing.objects.length >= MAX_TASKS) return json({ error: "Task limit reached." }, 409);
    await writeTask(env, task.value);
    return json({ task: task.value, created: true }, 201);
  } catch (error) {
    workerLog("error", "tasks.create.failed", { user_id: userId, message: String(error?.message || error) });
    return json({ error: "Could not create task." }, 503);
  }
}

async function updateTask(request, env, userId) {
  const taskId = cleanTaskId(new URL(request.url).searchParams.get("id"));
  if (!taskId) return json({ error: "Invalid task identifier." }, 400);
  const parsed = await parsePayload(request);
  if (parsed.error) return parsed.error;

  try {
    const previous = await readTask(env, userId, taskId);
    if (!previous) return json({ error: "Task not found." }, 404);
    const task = normalizeTask(parsed.value, userId, taskId, previous);
    if (!task.ok) return json({ error: task.error }, 400);
    const projectError = await validateProjectReference(env, userId, task.value.project_id);
    if (projectError) return projectError;
    await writeTask(env, task.value);
    return json({ task: task.value, saved: true });
  } catch (error) {
    workerLog("error", "tasks.update.failed", { user_id: userId, task_id: taskId, message: String(error?.message || error) });
    return json({ error: "Could not save task." }, 503);
  }
}

async function deleteTask(request, env, userId) {
  const taskId = cleanTaskId(new URL(request.url).searchParams.get("id"));
  if (!taskId) return json({ error: "Invalid task identifier." }, 400);
  try {
    const existing = await env.STORAGE.head(taskKey(userId, taskId));
    if (!existing) return json({ error: "Task not found." }, 404);
    await env.STORAGE.delete(taskKey(userId, taskId));
    return json({ deleted: true, id: taskId });
  } catch (error) {
    workerLog("error", "tasks.delete.failed", { user_id: userId, task_id: taskId, message: String(error?.message || error) });
    return json({ error: "Could not delete task." }, 503);
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

async function writeTask(env, task) {
  await env.STORAGE.put(taskKey(task.owner_id, task.id), JSON.stringify(task), {
    httpMetadata: { contentType: "application/json;charset=UTF-8" },
    customMetadata: taskMetadata(task)
  });
}

async function readTask(env, userId, taskId) {
  const object = await env.STORAGE.get(taskKey(userId, taskId));
  if (!object) return null;
  try {
    const parsed = JSON.parse(await object.text());
    if (!parsed || parsed.owner_id !== userId || parsed.id !== taskId) return null;
    const normalized = normalizeTask(parsed, userId, taskId, parsed);
    return normalized.ok ? normalized.value : null;
  } catch {
    return null;
  }
}

function normalizeTask(input, userId, taskId, previous) {
  const source = input && typeof input === "object" ? input : {};
  const title = cleanText(source.title, 180);
  if (!title) return { ok: false, error: "Task title is required." };

  const status = cleanText(source.status, 24) || previous?.status || "todo";
  const priority = cleanText(source.priority, 24) || previous?.priority || "normal";
  if (!STATUSES.has(status)) return { ok: false, error: "Invalid task status." };
  if (!PRIORITIES.has(priority)) return { ok: false, error: "Invalid task priority." };

  const projectIdRaw = cleanText(source.project_id, 64);
  const projectId = projectIdRaw ? cleanProjectId(projectIdRaw) : "";
  if (projectIdRaw && !projectId) return { ok: false, error: "Invalid project identifier." };

  const dueAt = cleanDueAt(source.due_at);
  if (String(source.due_at || "").trim() && !dueAt) return { ok: false, error: "Invalid task due date." };

  const now = new Date().toISOString();
  const completedAt = status === "done"
    ? (previous?.status === "done" && previous?.completed_at ? previous.completed_at : now)
    : "";

  return {
    ok: true,
    value: {
      id: taskId,
      owner_id: userId,
      project_id: projectId,
      title,
      description: cleanText(source.description, 2400),
      status,
      priority,
      due_at: dueAt,
      completed_at: completedAt,
      created_at: previous?.created_at || now,
      updated_at: now
    }
  };
}

async function parsePayload(request) {
  const declared = Number(request.headers.get("Content-Length") || 0);
  if (declared > MAX_PAYLOAD_BYTES) return { error: json({ error: "Task payload is too large." }, 413) };
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_PAYLOAD_BYTES) return { error: json({ error: "Task payload is too large." }, 413) };
    return { value: JSON.parse(raw || "{}") };
  } catch {
    return { error: json({ error: "Invalid task payload." }, 400) };
  }
}

function taskMetadata(task) {
  return {
    ownerId: task.owner_id,
    hidden: "true",
    kind: "task",
    projectId: task.project_id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueAt: task.due_at,
    completedAt: task.completed_at,
    createdAt: task.created_at,
    updatedAt: task.updated_at
  };
}

function taskFromMetadata(meta, userId, taskId) {
  if (!meta || meta.kind !== "task" || meta.ownerId !== userId) return null;
  const normalized = normalizeTask({
    project_id: meta.projectId,
    title: meta.title,
    description: meta.description,
    status: meta.status,
    priority: meta.priority,
    due_at: meta.dueAt
  }, userId, taskId, {
    created_at: meta.createdAt || new Date().toISOString(),
    status: meta.status,
    priority: meta.priority,
    completed_at: meta.completedAt || ""
  });
  if (!normalized.ok) return null;
  normalized.value.created_at = meta.createdAt || normalized.value.created_at;
  normalized.value.updated_at = meta.updatedAt || normalized.value.updated_at;
  normalized.value.completed_at = meta.completedAt || normalized.value.completed_at;
  return normalized.value;
}

function parseTaskKey(key, expectedOwnerId) {
  const parts = String(key || "").split("/");
  if (parts.length !== 4 || parts[0] !== "_system" || parts[1] !== "tasks" || parts[2] !== expectedOwnerId || !parts[3].endsWith(".json")) return null;
  const taskId = parts[3].slice(0, -5);
  return isStorageObjectId(taskId) ? { taskId } : null;
}

function compareTasks(a, b) {
  const statusOrder = { in_progress: 0, todo: 1, done: 2 };
  const statusDiff = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
  if (statusDiff) return statusDiff;
  const aDue = a.due_at ? Date.parse(a.due_at) : Number.POSITIVE_INFINITY;
  const bDue = b.due_at ? Date.parse(b.due_at) : Number.POSITIVE_INFINITY;
  if (aDue !== bDue) return aDue - bDue;
  return String(b.updated_at || "").localeCompare(String(a.updated_at || ""));
}

function cleanTaskId(value) {
  const text = String(value || "").trim();
  return isStorageObjectId(text) ? text : "";
}

function cleanProjectId(value) {
  const text = String(value || "").trim();
  return isStorageObjectId(text) ? text : "";
}

function cleanDueAt(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const timestamp = Date.parse(text);
  if (!Number.isFinite(timestamp)) return "";
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  if (year < 2000 || year > 2200) return "";
  return date.toISOString();
}

function cleanText(value, maximum) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maximum);
}
