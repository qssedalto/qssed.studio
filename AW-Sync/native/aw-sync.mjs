#!/usr/bin/env node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

// 这是早期 Node.js 同步脚本，仍保留作兼容/诊断入口；正式 Windows 客户端已经使用 Rust。
// 它仍遵循同一核心思路：枚举 Bucket、增量读取事件、上传成功后再推进进度。
const localOrigin = (process.env.ACTIVITYWATCH_ORIGIN || "http://127.0.0.1:5600").replace(/\/$/, "");
const cloudOrigin = (process.env.AERTEX_WATCH_DATA_ORIGIN || "https://awd.qsseda.com").replace(/\/$/, "");
const token = String(process.env.AERTEX_WATCH_TOKEN || "").trim();
const watchMode = process.argv.includes("--watch");
const initialDays = Math.max(1, Math.min(3650, Number(process.env.AERTEX_WATCH_INITIAL_DAYS || 30)));
const statePath = process.env.AERTEX_WATCH_STATE || path.join(os.homedir(), ".aertex-watch-sync.json");

if (!token) {
  console.error("AERTEX_WATCH_TOKEN is required. Generate one from AERTEX Watch and set it in the environment.");
  process.exit(2);
}

// 统一 JSON 请求封装：非 2xx 直接抛错，避免把错误响应继续当数据处理。
async function jsonFetch(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(response.status + " " + response.statusText + ": " + await response.text());
  return response.status === 204 ? null : response.json();
}

// 状态只保存各 Bucket 的同步位置；读取失败时从空状态恢复。
async function readState() {
  try { return JSON.parse(await fs.readFile(statePath, "utf8")); }
  catch { return { version:1, buckets:{} }; }
}

// 同样采用“写临时文件 -> rename”的方式，减少进程中断造成状态文件损坏的概率。
async function writeState(state) {
  const tmp = statePath + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(state, null, 2), "utf8");
  await fs.rename(tmp, statePath);
}

// 找出本批次最新事件时间，只有上传成功后才把它写回同步进度。
function maxTimestamp(events, fallback) {
  // RFC3339 文本不能可靠地直接做字典序比较：例如不同的时区偏移可能让“字符串更大”却代表更早的时刻。
  // 和 Rust 正式客户端一样，这里先解析为毫秒时间戳；原始字符串只用于最终写回状态。
  let best = fallback || "";
  let bestMs = Date.parse(best);
  if (!Number.isFinite(bestMs)) bestMs = Number.NEGATIVE_INFINITY;
  for (const event of events) {
    const raw = String(event.timestamp || "");
    const value = Date.parse(raw);
    if (Number.isFinite(value) && value > bestMs) {
      best = raw;
      bestMs = value;
    }
  }
  return best;
}

// 一轮同步：读取所有 Bucket -> 按各自断点拉事件 -> 上传 -> 成功后推进断点。
async function syncOnce() {
  const buckets = await jsonFetch(localOrigin + "/api/0/buckets/");
  const state = await readState();
  let uploaded = 0;

  for (const [bucketId, bucket] of Object.entries(buckets || {})) {
    const last = state.buckets?.[bucketId]?.timestamp || "";
    const startDate = last ? new Date(new Date(last).getTime() - 2000) : new Date(Date.now() - initialDays * 86400000);
    const query = new URLSearchParams({ start:startDate.toISOString(), limit:"-1" });
    const events = await jsonFetch(localOrigin + "/api/0/buckets/" + encodeURIComponent(bucketId) + "/events?" + query);
    if (!Array.isArray(events) || !events.length) continue;

    for (let offset = 0; offset < events.length; offset += 2000) {
      const chunk = events.slice(offset, offset + 2000);
      await jsonFetch(cloudOrigin + "/api/sync", {
        method:"POST",
        headers:{
          "authorization":"Bearer " + token,
          "content-type":"application/json",
          "accept":"application/json"
        },
        body:JSON.stringify({
          bucket:{
            id:bucketId,
            type:bucket.type || "",
            client:bucket.client || "",
            hostname:bucket.hostname || "",
            name:bucket.name || ""
          },
          events:chunk
        })
      });
      uploaded += chunk.length;
    }

    state.buckets ||= {};
    state.buckets[bucketId] = { timestamp:maxTimestamp(events, last), synced_at:new Date().toISOString() };
    await writeState(state);
  }

  console.log("[" + new Date().toISOString() + "] synced " + uploaded + " events across " + Object.keys(buckets || {}).length + " buckets");
}

// --watch 模式常驻循环；单轮异常只记录并退出/等待下一次，由启动方式决定是否重试。
async function main() {
  await syncOnce();
  if (!watchMode) return;
  setInterval(() => syncOnce().catch(error => console.error("[" + new Date().toISOString() + "] sync failed:", error.message)), 10 * 60 * 1000);
}

main().catch(error => {
  console.error("AERTEX Watch sync failed:", error);
  process.exit(1);
});
