/**
 * 【初学者导读】
 * 文件：studio/projects-api.js
 * 服务端 API 模块：接收已路由的请求，校验身份与参数，并执行数据读写后返回 JSON/HTTP 响应。
 * 阅读顺序：先看对外导出和路由入口，再看参数归一化、权限/语言处理，最后追踪存储或模板渲染。
 * 初学者重点：区分“数据来源”“业务规则”“展示格式”三层，不要把一个显示问题直接当成数据库问题。
 * 修改注意：尽量保持现有路径、字段和返回结构兼容；规则改变时补充对应回归检查。
 * 调试方法：先确认实际命中的路由和 locale，再检查 handler 输入，最后验证最终 Response。
 */
import { json } from "./routing.js";
import { verifyStudioApiSession, withStudioSessionCookies } from "./session-gate.js";
import { hasStorageBinding, isStorageObjectId, verifyStorageUser } from "./storage-api.js";
import { workerLog } from "./server-runtime.js";

const PROJECT_ROOT = "_system/projects/";
const MAX_PROJECTS = 200;
const MAX_PAYLOAD_BYTES = 32 * 1024;
const STATUSES = new Set(["planning", "active", "paused", "done", "archived"]);
const PRIORITIES = new Set(["low", "normal", "high"]);

function projectPrefix(userId) {
  return `${PROJECT_ROOT}${userId}/`;
}

function projectKey(userId, projectId) {
  return `${projectPrefix(userId)}${projectId}.json`;
}

// Projects 总入口：从会话解析当前用户，再按 method/path 分派列表、创建、更新、删除。项目 ID 和 ownerId 都由服务端规则约束。\nexport async function handleProjects(request, env) {
  const session = await verifyStudioApiSession(request);
  if (!session.ok) return withStudioSessionCookies(json({ error: "Authentication required." }, 401), session.cookies);

  const authRequest = new Request(request.url, {
    method: "GET",
    headers: { Authorization: `Bearer ${session.accessToken}` }
  });
  const auth = await verifyStorageUser(authRequest, env);
  if (auth.error) return withStudioSessionCookies(auth.error, session.cookies);
  if (!hasStorageBinding(env)) return withStudioSessionCookies(json({ error: "Project storage is temporarily unavailable." }, 503), session.cookies);

  let response;
  if (request.method === "GET") response = await getProjects(request, env, auth.user.id);
  else if (request.method === "POST") response = await createProject(request, env, auth.user.id);
  else if (request.method === "PUT") response = await updateProject(request, env, auth.user.id);
  else if (request.method === "DELETE") response = await deleteProject(request, env, auth.user.id);
  else response = json({ error: "Method not allowed" }, 405);

  return withStudioSessionCookies(response, session.cookies);
}

async function getProjects(request, env, userId) {
  const url = new URL(request.url);
  const id = cleanProjectId(url.searchParams.get("id"));
  if (id) {
    const project = await readProject(env, userId, id);
    return project ? json({ project }) : json({ error: "Project not found." }, 404);
  }

  try {
    const projects = [];
    let cursor;
    do {
      const page = await env.STORAGE.list({
        prefix: projectPrefix(userId),
        cursor,
        limit: Math.min(500, MAX_PROJECTS - projects.length),
        include: ["customMetadata"]
      });
      for (const object of page.objects) {
        const reference = parseProjectKey(object.key, userId);
        if (!reference) continue;
        let project = projectFromMetadata(object.customMetadata, userId, reference.projectId);
        if (!project) project = await readProject(env, userId, reference.projectId);
        if (project) projects.push(project);
        if (projects.length >= MAX_PROJECTS) break;
      }
      cursor = page.cursor;
      if (!page.truncated || !cursor || projects.length >= MAX_PROJECTS) break;
    } while (cursor);
    projects.sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")));
    return json({ projects, count: projects.length, scope: "own" });
  } catch (error) {
    workerLog("error", "projects.list.failed", { user_id: userId, message: String(error?.message || error) });
    return json({ error: "Project storage is temporarily unavailable." }, 503);
  }
}

// 创建项目：先 parse/normalize 用户输入，再补齐服务端生成的 ID、时间戳和 owner；不要把整段客户端 JSON 原样写入存储。\nasync function createProject(request, env, userId) {
  const parsed = await parsePayload(request);
  if (parsed.error) return parsed.error;
  const projectId = crypto.randomUUID();
  const project = normalizeProject(parsed.value, userId, projectId, null);
  if (!project.ok) return json({ error: project.error }, 400);

  try {
    const existing = await env.STORAGE.list({ prefix: projectPrefix(userId), limit: MAX_PROJECTS + 1 });
    if (existing.objects.length >= MAX_PROJECTS) return json({ error: "Project limit reached." }, 409);
    await writeProject(env, project.value);
    return json({ project: project.value, created: true }, 201);
  } catch (error) {
    workerLog("error", "projects.create.failed", { user_id: userId, message: String(error?.message || error) });
    return json({ error: "Could not create project." }, 503);
  }
}

// 更新项目：先读取旧项目并确认归属，再基于旧值归一化新字段；这样未提交的字段不会被意外清空。\nasync function updateProject(request, env, userId) {
  const url = new URL(request.url);
  const projectId = cleanProjectId(url.searchParams.get("id"));
  if (!projectId) return json({ error: "Invalid project identifier." }, 400);
  const parsed = await parsePayload(request);
  if (parsed.error) return parsed.error;

  try {
    const previous = await readProject(env, userId, projectId);
    if (!previous) return json({ error: "Project not found." }, 404);
    const project = normalizeProject(parsed.value, userId, projectId, previous);
    if (!project.ok) return json({ error: project.error }, 400);
    await writeProject(env, project.value);
    return json({ project: project.value, saved: true });
  } catch (error) {
    workerLog("error", "projects.update.failed", { user_id: userId, project_id: projectId, message: String(error?.message || error) });
    return json({ error: "Could not save project." }, 503);
  }
}

async function deleteProject(request, env, userId) {
  const url = new URL(request.url);
  const projectId = cleanProjectId(url.searchParams.get("id"));
  if (!projectId) return json({ error: "Invalid project identifier." }, 400);
  try {
    const existing = await env.STORAGE.head(projectKey(userId, projectId));
    if (!existing) return json({ error: "Project not found." }, 404);
    await env.STORAGE.delete(projectKey(userId, projectId));
    return json({ deleted: true, id: projectId });
  } catch (error) {
    workerLog("error", "projects.delete.failed", { user_id: userId, project_id: projectId, message: String(error?.message || error) });
    return json({ error: "Could not delete project." }, 503);
  }
}

async function writeProject(env, project) {
  await env.STORAGE.put(projectKey(project.owner_id, project.id), JSON.stringify(project), {
    httpMetadata: { contentType: "application/json;charset=UTF-8" },
    customMetadata: projectMetadata(project)
  });
}

async function readProject(env, userId, projectId) {
  const object = await env.STORAGE.get(projectKey(userId, projectId));
  if (!object) return null;
  try {
    const parsed = JSON.parse(await object.text());
    if (!parsed || parsed.owner_id !== userId || parsed.id !== projectId) return null;
    const normalized = normalizeProject(parsed, userId, projectId, parsed);
    return normalized.ok ? normalized.value : null;
  } catch {
    return null;
  }
}

// 项目归一化：这里是字段白名单与默认值的中心。新增字段时优先在这里定义，而不是让各 API 分支各自拼对象。\nfunction normalizeProject(input, userId, projectId, previous) {
  const source = input && typeof input === "object" ? input : {};
  const name = cleanText(source.name, 160);
  if (!name) return { ok: false, error: "Project name is required." };
  const status = cleanText(source.status, 24) || previous?.status || "planning";
  const priority = cleanText(source.priority, 24) || previous?.priority || "normal";
  if (!STATUSES.has(status)) return { ok: false, error: "Invalid project status." };
  if (!PRIORITIES.has(priority)) return { ok: false, error: "Invalid project priority." };

  const repositoryUrl = cleanHttpUrl(source.repository_url, 1200);
  const projectUrl = cleanHttpUrl(source.project_url, 1200);
  if (String(source.repository_url || "").trim() && !repositoryUrl) return { ok: false, error: "Repository URL must use http or https." };
  if (String(source.project_url || "").trim() && !projectUrl) return { ok: false, error: "Project URL must use http or https." };

  const now = new Date().toISOString();
  return {
    ok: true,
    value: {
      id: projectId,
      owner_id: userId,
      name,
      summary: cleanText(source.summary, 1000),
      status,
      priority,
      tags: cleanTags(source.tags),
      repository_url: repositoryUrl,
      project_url: projectUrl,
      next_action: cleanText(source.next_action, 500),
      created_at: previous?.created_at || now,
      updated_at: now
    }
  };
}

async function parsePayload(request) {
  const declared = Number(request.headers.get("Content-Length") || 0);
  if (declared > MAX_PAYLOAD_BYTES) return { error: json({ error: "Project payload is too large." }, 413) };
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_PAYLOAD_BYTES) return { error: json({ error: "Project payload is too large." }, 413) };
    return { value: JSON.parse(raw || "{}") };
  } catch {
    return { error: json({ error: "Invalid project payload." }, 400) };
  }
}

function projectMetadata(project) {
  return {
    ownerId: project.owner_id,
    hidden: "true",
    kind: "project",
    name: project.name,
    summary: project.summary,
    status: project.status,
    priority: project.priority,
    tags: JSON.stringify(project.tags),
    repositoryUrl: project.repository_url,
    projectUrl: project.project_url,
    nextAction: project.next_action,
    createdAt: project.created_at,
    updatedAt: project.updated_at
  };
}

function projectFromMetadata(meta, userId, projectId) {
  if (!meta || meta.kind !== "project" || meta.ownerId !== userId) return null;
  let tags = [];
  try { tags = JSON.parse(meta.tags || "[]"); } catch {}
  const normalized = normalizeProject({
    name: meta.name,
    summary: meta.summary,
    status: meta.status,
    priority: meta.priority,
    tags,
    repository_url: meta.repositoryUrl,
    project_url: meta.projectUrl,
    next_action: meta.nextAction,
    created_at: meta.createdAt,
    updated_at: meta.updatedAt
  }, userId, projectId, {
    created_at: meta.createdAt || new Date().toISOString(),
    status: meta.status,
    priority: meta.priority
  });
  if (!normalized.ok) return null;
  normalized.value.created_at = meta.createdAt || normalized.value.created_at;
  normalized.value.updated_at = meta.updatedAt || normalized.value.updated_at;
  return normalized.value;
}

function parseProjectKey(key, expectedOwnerId) {
  const parts = String(key || "").split("/");
  if (parts.length !== 4 || parts[0] !== "_system" || parts[1] !== "projects" || parts[2] !== expectedOwnerId || !parts[3].endsWith(".json")) return null;
  const projectId = parts[3].slice(0, -5);
  return isStorageObjectId(projectId) ? { projectId } : null;
}

function cleanProjectId(value) {
  const text = String(value || "").trim();
  return isStorageObjectId(text) ? text : "";
}

function cleanTags(value) {
  const items = Array.isArray(value) ? value : String(value || "").split(/[,，\n]/);
  return [...new Set(items.map(item => cleanText(item, 32)).filter(Boolean))].slice(0, 12);
}

function cleanHttpUrl(value, maximum) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text.length > maximum) return "";
  try {
    const url = new URL(text);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function cleanText(value, maximum) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maximum);
}
