/**
 * 【初学者导读】
 * 文件：studio/summary-api.js
 * 服务端 API 模块：校验请求后执行对应业务读写并返回结构化响应。
 * 阅读顺序：先确定谁调用本模块，再查看入口 handler；随后依次检查权限、输入归一化、数据操作和错误返回。
 * 数据一致性：涉及多人协作、版本或存储时，要特别注意重复请求、并发更新和“旧客户端仍在使用旧字段”的情况。
 * 修改注意：公开 API 和路由应尽量向后兼容，改变规则时同时更新自动检查。
 * 调试方法：记录请求标识、用户/资源 ID 和关键分支结果，但不要把令牌、Cookie、私密内容写入日志。
 */
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

// 总结字段白名单：title/source/purpose/core/points/evidence/limits/actions/tags 等统一限长和补默认值，避免客户端写任意未知字段。\nfunction normalizeSummary(input, ownerId, updatedAt = new Date().toISOString()) {
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

// Summaries API：每个用户维护一份结构化总结对象，GET 读取、PUT 覆盖规范化后的字段。对象 key 由当前 userId 派生。\nexport async function handleSummaries(request, env) {
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
