/**
 * 【初学者导读】
 * 文件：watch-web/aw-sync.mjs
 * AERTEX Watch 网页端：把 ActivityWatch 云端 Bucket/Event 转换成统计、图表和设备连接界面。
 * 阅读顺序：先找入口/初始化函数，再看状态对象、事件监听或请求处理；随后沿 API、存储或本机调用追踪真正副作用。
 * 初学者重点：把“界面/请求入口”“业务规则”“数据读写”“错误处理”分层理解，排错会快很多。
 * 修改注意：保持已有接口、DOM 标识和数据格式兼容；重要规则变化时同步更新自动检查。
 * 调试方法：先复现最小输入，再观察中间状态；不要通过删除校验或异常处理来“修复”症状。
 */
#!/usr/bin/env node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

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

async function jsonFetch(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(response.status + " " + response.statusText + ": " + await response.text());
  return response.status === 204 ? null : response.json();
}

async function readState() {
  try { return JSON.parse(await fs.readFile(statePath, "utf8")); }
  catch { return { version:1, buckets:{} }; }
}

async function writeState(state) {
  const tmp = statePath + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(state, null, 2), "utf8");
  await fs.rename(tmp, statePath);
}

function maxTimestamp(events, fallback) {
  let best = fallback || "";
  for (const event of events) if (String(event.timestamp || "") > best) best = String(event.timestamp || "");
  return best;
}

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

async function main() {
  await syncOnce();
  if (!watchMode) return;
  setInterval(() => syncOnce().catch(error => console.error("[" + new Date().toISOString() + "] sync failed:", error.message)), 10 * 60 * 1000);
}

main().catch(error => {
  console.error("AERTEX Watch sync failed:", error);
  process.exit(1);
});
