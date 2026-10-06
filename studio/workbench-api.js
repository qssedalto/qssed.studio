/**
 * 【初学者导读】
 * 文件：studio/workbench-api.js
 * AERTEX Work 服务端 API：处理工作台相关请求、数据与响应。
 * 阅读顺序：先确认这个模块从哪里被导入，再看入口函数接收什么状态/Request；随后追踪 API、DOM、缓存或重定向副作用。
 * 初学者重点：Work/Watch 等独立产品虽然共享登录和品牌，但域名、路由和部署边界是分开的，不能把一个产品的假设直接复制到另一个。
 * 修改注意：保持已有 URL、查询参数、DOM 标识和登录交接兼容；如果产品边界变化，必须同步修改对应 CI 检查。
 * 调试方法：先确认 host/path 命中了哪个入口，再检查会话和内部状态，最后看具体 UI 或 API 结果。
 */
import { json } from "./routing.js";
import { verifyStudioApiSession, withStudioSessionCookies } from "./session-gate.js";
import { hasStorageBinding, isStorageObjectId, verifyStorageUser } from "./storage-api.js";
import { workerLog } from "./server-runtime.js";

const PROJECT_ROOT = "_system/projects/";
const TASK_ROOT = "_system/tasks/";
const DRAFT_ROOT = "_system/drafts/";
const NOTE_ROOT = "_system/notes/";
const PROJECT_LIMIT = 200;
const TASK_LIMIT = 500;
const DRAFT_LIMIT = 300;
const NOTE_LIMIT = 240;

function prefix(root, userId) {
  return `${root}${userId}/`;
}

export async function handleWorkbenchOverview(request, env) {
  if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);

  const session = await verifyStudioApiSession(request);
  if (!session.ok) return withStudioSessionCookies(json({ error: "Authentication required." }, 401), session.cookies);

  const authRequest = new Request(request.url, {
    method: "GET",
    headers: { Authorization: `Bearer ${session.accessToken}` }
  });
  const auth = await verifyStorageUser(authRequest, env);
  if (auth.error) return withStudioSessionCookies(auth.error, session.cookies);
  if (!hasStorageBinding(env)) return withStudioSessionCookies(json({ error: "Workbench is temporarily unavailable." }, 503), session.cookies);

  try {
    const userId = auth.user.id;
    const [projects, tasks, drafts, notes] = await Promise.all([
      listMetadata(env, prefix(PROJECT_ROOT, userId), PROJECT_LIMIT, "project", userId, projectFromObject),
      listMetadata(env, prefix(TASK_ROOT, userId), TASK_LIMIT, "task", userId, taskFromObject),
      listMetadata(env, prefix(DRAFT_ROOT, userId), DRAFT_LIMIT, "draft", userId, draftFromObject),
      listMetadata(env, prefix(NOTE_ROOT, userId), NOTE_LIMIT, "research-note", userId, noteFromObject)
    ]);

    const projectById = new Map(projects.map(project => [project.id, project]));
    const activeProjects = projects
      .filter(project => project.status === "active")
      .sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")))
      .slice(0, 8);

    const openTasks = tasks
      .filter(task => task.status !== "done")
      .map(task => ({
        ...task,
        project_name: task.project_id ? (projectById.get(task.project_id)?.name || "") : ""
      }))
      .sort(compareTasks)
      .slice(0, 120);

    const recentDrafts = drafts
      .sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")))
      .slice(0, 8)
      .map(draft => ({
        ...draft,
        project_name: draft.project_id ? (projectById.get(draft.project_id)?.name || "") : ""
      }));

    const recentNotes = notes
      .sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")))
      .slice(0, 8);

    return withStudioSessionCookies(json({
      scope: "own",
      generated_at: new Date().toISOString(),
      projects: activeProjects,
      tasks: openTasks,
      drafts: recentDrafts,
      notes: recentNotes,
      counts: {
        active_projects: projects.filter(project => project.status === "active").length,
        open_tasks: tasks.filter(task => task.status !== "done").length,
        drafts: drafts.length,
        notes: notes.length
      }
    }), session.cookies);
  } catch (error) {
    workerLog("error", "workbench.overview.failed", { user_id: auth.user.id, message: String(error?.message || error) });
    return withStudioSessionCookies(json({ error: "Workbench is temporarily unavailable." }, 503), session.cookies);
  }
}

async function listMetadata(env, storagePrefix, maximum, expectedKind, userId, convert) {
  const result = [];
  let cursor;
  do {
    const page = await env.STORAGE.list({
      prefix: storagePrefix,
      cursor,
      limit: Math.min(1000, Math.max(1, maximum - result.length)),
      include: ["customMetadata"]
    });
    for (const object of page.objects) {
      const item = convert(object, expectedKind, userId, storagePrefix);
      if (item) result.push(item);
      if (result.length >= maximum) break;
    }
    cursor = page.cursor;
    if (!page.truncated || !cursor || result.length >= maximum) break;
  } while (cursor);
  return result;
}

function objectId(object, storagePrefix) {
  const key = String(object?.key || "");
  if (!key.startsWith(storagePrefix) || !key.endsWith(".json")) return "";
  const id = key.slice(storagePrefix.length, -5);
  return isStorageObjectId(id) ? id : "";
}

function validMeta(object, expectedKind, userId, storagePrefix) {
  const id = objectId(object, storagePrefix);
  const meta = object?.customMetadata || {};
  if (!id || meta.kind !== expectedKind || meta.ownerId !== userId) return null;
  return { id, meta, uploaded: object.uploaded?.toISOString?.() || "" };
}

function projectFromObject(object, expectedKind, userId, storagePrefix) {
  const record = validMeta(object, expectedKind, userId, storagePrefix);
  if (!record) return null;
  const { id, meta, uploaded } = record;
  return {
    id,
    name: clean(meta.name, 160),
    summary: clean(meta.summary, 1000),
    status: clean(meta.status, 24),
    priority: clean(meta.priority, 24),
    next_action: clean(meta.nextAction, 500),
    updated_at: timestamp(meta.updatedAt, uploaded)
  };
}

function taskFromObject(object, expectedKind, userId, storagePrefix) {
  const record = validMeta(object, expectedKind, userId, storagePrefix);
  if (!record) return null;
  const { id, meta, uploaded } = record;
  const projectId = isStorageObjectId(String(meta.projectId || "")) ? String(meta.projectId) : "";
  return {
    id,
    project_id: projectId,
    title: clean(meta.title, 180),
    description: clean(meta.description, 2400),
    status: clean(meta.status, 24),
    priority: clean(meta.priority, 24),
    due_at: optionalTimestamp(meta.dueAt),
    updated_at: timestamp(meta.updatedAt, uploaded)
  };
}

function draftFromObject(object, expectedKind, userId, storagePrefix) {
  const record = validMeta(object, expectedKind, userId, storagePrefix);
  if (!record) return null;
  const { id, meta, uploaded } = record;
  const projectId = isStorageObjectId(String(meta.projectId || "")) ? String(meta.projectId) : "";
  return {
    id,
    project_id: projectId,
    title: clean(meta.title, 180),
    preview: clean(meta.preview, 240),
    updated_at: timestamp(meta.updatedAt, uploaded)
  };
}

function noteFromObject(object, expectedKind, userId, storagePrefix) {
  const record = validMeta(object, expectedKind, userId, storagePrefix);
  if (!record) return null;
  return {
    id: record.id,
    title: clean(record.meta.title, 120),
    updated_at: timestamp("", record.uploaded)
  };
}

function compareTasks(a, b) {
  const dueA = a.due_at ? Date.parse(a.due_at) : Number.POSITIVE_INFINITY;
  const dueB = b.due_at ? Date.parse(b.due_at) : Number.POSITIVE_INFINITY;
  if (dueA !== dueB) return dueA - dueB;
  const priority = { high: 0, normal: 1, low: 2 };
  const priorityDiff = (priority[a.priority] ?? 9) - (priority[b.priority] ?? 9);
  if (priorityDiff) return priorityDiff;
  return String(b.updated_at || "").localeCompare(String(a.updated_at || ""));
}

function clean(value, maximum) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maximum);
}

function optionalTimestamp(value) {
  const parsed = Date.parse(String(value || ""));
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : "";
}

function timestamp(value, fallback) {
  return optionalTimestamp(value) || optionalTimestamp(fallback) || new Date(0).toISOString();
}
