import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const worker = read("watch-worker.js");
const wrangler = read("wrangler.watch.jsonc");
const app = read("watch-web/app.js");
const index = read("watch-web/index.html");
const sync = read("AW-Sync/native/aw-sync.mjs");
const handoff = read("studio/watch-subdomain.js");
const studioWorker = read("worker.js");
const authWorker = read("auth-worker.js");
const domains = read("studio/domain-family.js");

assert(worker.includes('const TOKEN_PREFIX = "awd1"'), "Watch device tokens need an explicit prefix.");
assert(worker.includes('sha256Hex(token)'), "Raw device tokens must not be used as storage keys.");
assert(worker.includes('WATCH_PREFIX = "watch/v1"'), "Watch data must have an isolated storage namespace.");
assert(worker.includes('pathname === "/api/sync"'), "Watch data worker must expose the sync endpoint.");
assert(worker.includes('isWatchDataHost'), "Watch worker must distinguish UI and data hosts.");
assert(worker.includes('url.hostname.startsWith("awd.")') && worker.includes('url.hostname.startsWith("aw.data.")'), "Both awd.* and aw.data.* must identify the data service.");
assert(worker.includes('handleEventQuery') && worker.includes('/api/0/buckets/'), "Cloud UI must expose ActivityWatch-compatible bucket reads.");
assert(worker.includes('mergeEvents') && worker.includes('dayObjectKey'), "Cloud ingestion must deduplicate and shard events.");
assert(worker.includes('verifyStudioPageSession'), "Watch browser reads must remain behind the AERTEX session gate.");

for (const root of ["qsseda.com","qsseda.online","qsseda.studio"]) {
  for (const host of ["aw.","awd.","aw.data."]) {
    assert(wrangler.includes(host + root), "Missing Watch route for " + host + root);
  }
}

assert(wrangler.includes('"bucket_name": "qsseda-studio-storage"'), "Watch must use the existing private R2 binding until a dedicated bucket is provisioned.");
assert(index.includes("AERTEX Watch Cloud") && index.includes("生成设备令牌"), "Watch UI must expose cloud status and device onboarding.");
assert(app.includes("/api/watch/tokens") && app.includes("/api/0/buckets/"), "Watch UI must use authenticated cloud APIs.");
assert(sync.includes("http://127.0.0.1:5600"), "Native sync must default to ActivityWatch localhost.");
assert(sync.includes("https://awd.qsseda.com"), "Native sync must default to the short cloud data domain.");
assert(sync.includes("limit:\"-1\""), "Native sync must request the complete incremental ActivityWatch event range.");
assert(sync.includes("--watch"), "Native sync must support continuous operation.");
assert(handoff.includes("/aw/handoff") && handoff.includes("/auth/handoff"), "Watch must support the secure main-site session handoff.");
assert(studioWorker.includes("isMainWatchHandoffPath") && studioWorker.includes("handleMainWatchHandoff"), "Main Studio worker must route Watch handoffs.");
assert(authWorker.includes('service === "aw"'), "AERTEX ID must allow Watch as a handoff target.");
assert(domains.includes("awdOriginForRequest") && domains.includes("awDataOriginForRequest"), "Domain family must define both Watch data names.");

console.log("AERTEX Watch cloud checks passed.");
