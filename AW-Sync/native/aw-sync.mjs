#!/usr/bin/env node
/**
 * 【初学者导读】
 * 文件：AW-Sync/native/aw-sync.mjs
 * 旧版/调试用 JavaScript 同步实现：用于协议对照和故障排查，不是普通用户当前安装的主客户端。
 * 建议阅读链路：main.rs → runtime.rs → activitywatch.rs / sync.rs → state.rs / credentials.rs → ui.rs。
 * 数据流：ActivityWatch 本地 REST API → Rust 结构体 → 去重/游标/批处理 → AERTEX Watch Data API → 本地状态更新。
 * 错误处理：网络不可用、JSON 结构变化、重复事件和 ActivityWatch 未启动都应是可恢复错误，不能直接让后台线程崩溃。
 * 安全原则：设备令牌只存 Windows Credential Manager；日志和 state.json 不应包含完整令牌。
 * 修改后至少运行 cargo fmt --check、cargo clippy、cargo test，并通过 scripts/watch-cloud-check.mjs。
 */

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
