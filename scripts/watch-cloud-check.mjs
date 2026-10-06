import fs from "node:fs";
import vm from "node:vm";

const read = path => fs.readFileSync(path, "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

// 这份脚本不是浏览器端单元测试，而是 Watch 的“架构回归检查清单”。
//
// 初学者阅读方式：
// 1. 第一段确认安全边界、域名和安装器入口没有被改坏；
// 2. 第二段确认 ActivityWatch 算法口径（AFK、flood、多设备去重、网站前台交集）；
// 3. 最后一段把 watch-web/app.js 装进 VM，用小型事件样本验证关键纯函数的结果。
const worker = read("watch-worker.js");
const wrangler = read("wrangler.watch.jsonc");
const app = read("watch-web/app.js");
const index = read("watch-web/index.html");
const styles = read("watch-web/styles.css");
const sync = read("AW-Sync/native/aw-sync.mjs");
const publicSync = read("watch-web/aw-sync.mjs");
const nativeCargo = read("AW-Sync/native/Cargo.toml");
const nativeMain = read("AW-Sync/native/src/main.rs");
const nativeCredentials = read("AW-Sync/native/src/credentials.rs");
const nativeAutostart = read("AW-Sync/native/src/autostart.rs");
const nativeDiscovery = read("AW-Sync/native/src/activitywatch.rs");
const nativeWorkflow = read(".github/workflows/aertex-watch-sync-windows.yml");
const nativeInstaller = read("AW-Sync/native/installer/AERTEX-Watch-Sync.iss");
const nativeBuild = read("AW-Sync/native/build.rs");
const handoff = read("studio/watch-subdomain.js");
const studioWorker = read("worker.js");
const authWorker = read("auth-worker.js");
const authHandoff = read("studio/auth-handoff.js");
const domains = read("studio/domain-family.js");
const setupPage = read("studio/watch-setup-page.js");
const entry = read("studio/entry.js");

// —— 安全边界与云端存储结构 ——
assert(worker.includes('const TOKEN_PREFIX = "awd1"'), "Watch device tokens need an explicit prefix.");
assert(worker.includes('sha256Hex(token)'), "Raw device tokens must not be used as storage keys.");
assert(worker.includes('WATCH_PREFIX = "watch/v1"'), "Watch data must have an isolated storage namespace.");
assert(worker.includes('pathname === "/api/sync"'), "Watch data worker must expose the sync endpoint.");
assert(worker.includes('isWatchDataHost'), "Watch worker must distinguish UI and data hosts.");
assert(worker.includes('url.hostname.startsWith("awd.")') && worker.includes('url.hostname.startsWith("aw.data.")'), "Both awd.* and aw.data.* must identify the data service.");
assert(worker.includes('handleEventQuery') && worker.includes('/api/0/buckets/'), "Cloud UI must expose ActivityWatch-compatible bucket reads.");
assert(worker.includes('mergeEvents') && worker.includes('dayObjectKey'), "Cloud ingestion must deduplicate and shard events.");
assert(worker.includes('verifyStudioPageSession'), "Watch browser reads must remain behind the AERTEX session gate.");

for (const root of ["qsseda.com","qsseda.online"]) {
  assert(wrangler.includes("aw." + root), "Missing Watch UI domain for aw." + root);
}
for (const root of ["qsseda.com","qsseda.online","qsseda.studio"]) {
  for (const host of ["awd.","aw.data."]) {
    assert(wrangler.includes(host + root), "Missing Watch data domain for " + host + root);
  }
}
assert(!wrangler.includes('"pattern": "aw.qsseda.studio'), "Legacy aw.qsseda.studio must stay outside the cloud Worker configuration.");

assert(wrangler.includes('"bucket_name": "qsseda-studio-storage"'), "Watch must use the existing private R2 binding until a dedicated bucket is provisioned.");
// —— UI、设置教程与认证跳转 ——
assert(index.includes("AERTEX Watch") && index.includes("生成设备令牌") && index.includes("连接电脑"), "Watch UI must expose product identity and device onboarding.");
assert(index.includes("https://qsseda.com/zh-cn/aw/setup") && index.includes("查看设置教程"), "Watch UI must link to the computer setup tutorial.");
assert(entry.includes('pathname === "/aw/setup"') && entry.includes("watchSetupPage(request)"), "Studio must route the localized Watch setup tutorial.");
assert(setupPage.includes("ActivityWatch") && setupPage.includes("AERTEX-Watch-Sync-Setup.exe"), "Watch setup tutorial must cover ActivityWatch and the native Windows installer.");
for (const legacyInstruction of ["node --version", "AERTEX_WATCH_TOKEN", "Invoke-WebRequest", "保持 PowerShell", "Keep the PowerShell"]) {
  assert(!setupPage.includes(legacyInstruction), "Watch setup must not expose legacy command-line instructions: " + legacyInstruction);
}
assert(setupPage.includes("https://aw.qsseda.com/AERTEX-Watch-Sync-Setup.exe"), "Watch setup must use the public Windows installer URL.");
assert(app.includes("/api/watch/tokens") && app.includes("/api/0/buckets/"), "Watch UI must use authenticated cloud APIs.");
// —— ActivityWatch 统计口径：同设备选最新 Bucket，多设备时间做并集，AFK/heartbeat 与原版保持一致 ——
assert(app.includes("latestBucketsByHost") && app.includes("unionHostSegments"), "Watch metrics must select one current bucket per host and remove cross-device overlap.");
assert(app.includes("afkEvents === null") && app.includes("if (!activeIntervals.length) return [];"), "Watch metrics must distinguish a missing AFK bucket from an all-AFK period.");
assert(app.includes("function floodEvents") && app.includes("gap <= pulseMs"), "Watch metrics must reproduce ActivityWatch five-second flood behavior before AFK intersection.");
assert(app.includes("for (let dayIndex=0; dayIndex<7; dayIndex++)") && app.includes("addDays(start,dayIndex+1)"), "Weekly Watch distribution must use local calendar-day boundaries instead of fixed 24-hour milliseconds.");
assert(app.includes("appLabels") && app.includes('"msedge.exe":"Microsoft Edge"'), "Watch UI must preserve the uploaded custom dashboard app display names.");
assert(index.includes('data-usage-mode="apps"') && index.includes('data-usage-mode="windows"') && index.includes('data-usage-mode="websites"'), "Watch UI must expose ActivityWatch-style application, window-title, and website time views.");
assert(app.includes('type === "web.tab.current"') && app.includes("intersectBrowserEvents") && app.includes("browserFamilies"), "Website time must be derived from ActivityWatch browser buckets intersected with foreground browser windows.");
assert(styles.includes("grid-template-rows:minmax(0,1fr)"), "Hourly activity chart must reserve a real vertical grid track so percentage-height bars cannot collapse.");
assert(worker.includes("MAX_EVENT_DURATION_SECONDS") && worker.includes("eventStart < endMs && eventEnd > startMs"), "Watch event reads must include events that overlap query boundaries.");
assert(worker.includes('JSON.stringify([normalized.timestamp, normalized.data])'), "Watch heartbeat deduplication must ignore changing event duration.");
assert(worker.includes('normalized.id !== undefined') && worker.includes('"id:" + normalized.id'), "Watch heartbeat deduplication must prefer stable ActivityWatch event IDs when present.");
assert(worker.includes("events = await mergeEvents([], events)"), "Watch event reads must deduplicate legacy overlapping heartbeat copies.");
// —— 同步客户端与 Windows 安装器 ——
assert(sync.includes("http://127.0.0.1:5600"), "Native sync must default to ActivityWatch localhost.");
assert(sync.includes("https://awd.qsseda.com"), "Native sync must default to the short cloud data domain.");
assert(sync.includes("limit:\"-1\""), "Native sync must request the complete incremental ActivityWatch event range.");
assert(sync.includes("Date.parse(raw)") && sync.includes("bestMs"), "Legacy Node sync progress must compare RFC3339 timestamps as instants, not strings.");
assert(publicSync === sync, "The public /aw-sync.mjs asset must stay byte-for-byte aligned with the audited legacy sync script.");
assert(sync.includes("--watch"), "Native sync must support continuous operation.");
assert(handoff.includes("/aw/handoff") && handoff.includes("/auth/handoff"), "Watch must support the secure main-site session handoff.");
assert(studioWorker.includes("isMainWatchHandoffPath") && studioWorker.includes("handleMainWatchHandoff"), "Main Studio worker must route Watch handoffs.");
assert(authWorker.includes('service === "aw"') && authWorker.includes("awOriginForRequest(request)"), "AERTEX ID must route Watch through the canonical Watch origin.");
assert(authHandoff.includes('const watchTarget = isServiceHost(hostname, "aw");'), "Watch auth handoff must classify aw.* as an isolated product target.");
assert(authHandoff.includes("workTarget || gptTarget || cashTarget || watchTarget"), "Watch auth handoff must trust the main-site origin for Watch just like other isolated products.");
assert(authHandoff.includes("if (cashTarget || watchTarget) return prefix;"), "Watch auth handoff must constrain post-login navigation to the localized Watch root.");
assert(authHandoff.includes('watchTarget ? "AERTEX Watch"'), "Watch auth handoff completion page must use the Watch product identity.");
assert(domains.includes("awdOriginForRequest") && domains.includes("awDataOriginForRequest"), "Domain family must define both Watch data names.");
assert(domains.includes('root === "qsseda.studio" ? "qsseda.com" : root'), "The legacy qsseda.studio Watch UI must canonicalize to the cloud .com UI.");
assert(setupPage.includes('country === "CN" || locale === "zh-cn"'), "Watch setup must use Mainland country detection with a zh-cn fallback for the China download source.");
assert(setupPage.includes("https://www.icloud.com.cn/iclouddrive/0f1o93e_H_OyQJtlbDfArEeUQ"), "Mainland China ActivityWatch download must use the iCloud China link.");
assert(setupPage.includes('mainlandChina ? activityWatchChinaUrl : activityWatchOfficialUrl'), "ActivityWatch download must switch between iCloud China and the official site by request country.");
assert(worker.includes('"/aw-sync.mjs"'), "Watch Worker must serve the first-party sync script asset.");
assert(worker.includes('"/AERTEX-Watch-Sync-Setup.exe"') && worker.includes('"watch/releases/windows/AERTEX-Watch-Sync-Setup.exe"'), "Watch Worker must expose the fixed Windows installer object.");
assert(worker.includes('LEGACY_WINDOWS_SYNC_PATH = "/AERTEX-Watch-Sync.exe"') && worker.includes("url.origin + WINDOWS_SYNC_PATH"), "Legacy portable download path must redirect to the installer.");
assert(worker.includes("application/vnd.microsoft.portable-executable") && worker.includes('attachment; filename="AERTEX-Watch-Sync-Setup.exe"'), "Windows installer download headers are missing.");
assert(worker.includes('"cache-control": "no-store, max-age=0"'), "Windows installer downloads must not be cacheable.");
assert(nativeCargo.includes('name = "AERTEX-Watch-Sync"'), "Rust project must produce the required executable name.");
assert(nativeMain.includes('windows_subsystem = "windows"'), "Release client must use the Windows GUI subsystem.");
assert(nativeCredentials.includes("CredWriteW") && nativeCredentials.includes("CredReadW"), "Device tokens must use Windows Credential Manager.");
assert(nativeAutostart.includes("HKEY_CURRENT_USER") && nativeAutostart.includes("--background"), "Native client must register per-user background startup.");
assert(nativeDiscovery.includes("5000..=6000") && nativeDiscovery.includes("SCAN_CONCURRENCY"), "Native client must implement bounded localhost ActivityWatch discovery.");
assert(read("AW-Sync/native/src/sync.rs").includes("DateTime::parse_from_rfc3339(&event.timestamp)"), "Native sync progress must compare RFC3339 timestamps as instants, not strings.");
assert(nativeWorkflow.includes("windows-latest") && nativeWorkflow.includes("cargo clippy") && nativeWorkflow.includes("AERTEX-Watch-Sync-Setup.exe") && nativeWorkflow.includes("Inno Setup"), "Native Windows installer build workflow is incomplete.");
assert(nativeWorkflow.includes("watch/releases/windows/AERTEX-Watch-Sync-Setup.exe"), "Windows installer must publish to the fixed R2 key.");
assert(!nativeWorkflow.includes("path: AW-Sync/native/dist/AERTEX-Watch-Sync.exe"), "Portable executable must not be published as the user-facing artifact.");
assert(nativeInstaller.includes("DelTree(TargetDir, True, True, True)") && nativeInstaller.includes("/delete:AERTEX/WatchSync/DeviceToken"), "Installer must reset the previous install directory and stored device token.");
assert(nativeInstaller.includes("taskkill.exe") && nativeInstaller.includes("Software\\Microsoft\\Windows\\CurrentVersion\\Run"), "Installer must replace a running old client and configure per-user startup.");
assert(nativeInstaller.includes("SetupIconFile=..\\assets\\aertex-watch.ico"), "Installer must use the AERTEX Watch icon.");
assert(nativeBuild.includes('set_icon') && nativeBuild.includes("aertex-watch.ico"), "Windows executable must embed the AERTEX Watch icon.");
assert(!nativeMain.includes("ensure_installed_and_relaunch"), "Production client must no longer use the portable self-install flow.");
assert(setupPage.includes('"cache-control": "private, no-store"'), "Region-specific Watch setup responses must not be shared-cacheable.");


// —— 纯算法样例：把 app.js 的内部函数暴露给 VM，验证真实数值而不仅仅是“源码里有这个函数名” ——
const testAppSource = app.replace(
  /\n  bind\(\);\n  load\(\);[\s\S]*?\n\}\)\(\);\s*$/,
  '\n  globalThis.__watchTest = { activeWindowEvents, floodEvents, latestBucketsByHost, unionHostSegments, metrics, groupWindowUsage, groupWebsiteUsage, intersectBrowserEvents, browserFamilyForBucket, browserAppMatches, state };\n})();'
);
const testContext = {
  location: { pathname: "/zh-cn", hostname: "aw.qsseda.com" },
  console,
  URLSearchParams,
  URL,
  Date,
  Intl,
  Math,
  JSON,
  Map,
  Set,
};
vm.runInNewContext(testAppSource, testContext, { filename: "watch-web/app.js" });
const watchTest = testContext.__watchTest;
assert(watchTest, "Unable to expose Watch metric functions for regression tests.");

const event = (timestamp, duration, data) => ({ timestamp, duration, data });
const rangeStart = new Date("2026-10-06T00:00:00Z");
const rangeEnd = new Date("2026-10-07T00:00:00Z");

const flooded = watchTest.floodEvents([
  event("2026-10-06T10:00:00Z", 2, { app: "same" }),
  event("2026-10-06T10:00:05Z", 2, { app: "same" }),
]);
assert(flooded.length === 1 && Math.abs(flooded[0].duration - 7) < 0.001, "Five-second ActivityWatch flood regression failed.");

const windowSample = [event("2026-10-06T10:00:00Z", 60, { app: "editor" })];
assert(watchTest.activeWindowEvents(windowSample, [], rangeStart, rangeEnd).length === 0, "An existing AFK bucket with no not-afk interval must yield zero active window time.");
assert(watchTest.activeWindowEvents(windowSample, null, rangeStart, rangeEnd).length === 1, "A missing AFK bucket must not erase otherwise valid window events.");

const latest = watchTest.latestBucketsByHost([
  { id: "old", type: "currentwindow", hostname: "pc", last_sync: "2026-10-06T10:00:00Z" },
  { id: "new", type: "currentwindow", hostname: "pc", last_sync: "2026-10-06T11:00:00Z" },
], "currentwindow");
assert(latest.length === 1 && latest[0].id === "new", "Newest bucket per host selection regression failed.");

const multiDevice = watchTest.unionHostSegments([
  [{ start: 0, end: 10_000, event: { data: { app: "primary" } } }],
  [{ start: 5_000, end: 15_000, event: { data: { app: "secondary" } } }],
]);
assert(multiDevice.reduce((sum, item) => sum + item.end - item.start, 0) === 15_000, "Cross-device overlap must be counted once.");

watchTest.state.range = "day";
const metricResult = watchTest.metrics([
  { start: Date.parse("2026-10-06T10:00:00Z"), end: Date.parse("2026-10-06T10:15:00Z"), event: { data: { app: "a" } } },
  { start: Date.parse("2026-10-06T10:15:00Z"), end: Date.parse("2026-10-06T10:30:00Z"), event: { data: { app: "b" } } },
], rangeStart, rangeEnd);
assert(metricResult.total === 1800, "Active duration must equal the union of actual active intervals.");
assert(metricResult.deepSeconds <= metricResult.total, "Deep-focus duration must never exceed active duration.");
assert(metricResult.focusScore >= 0 && metricResult.focusScore <= 100, "AERTEX focus score must remain within 0-100.");
assert(metricResult.switches === 1 && metricResult.focusScore === 96, "Switch-rate focus penalty must use actual active hours.");

const windowUsage = watchTest.groupWindowUsage([
  { start: Date.parse("2026-10-06T10:00:00Z"), end: Date.parse("2026-10-06T10:10:00Z"), event: { data: { app: "msedge.exe", title: "AERTEX Watch" } } },
  { start: Date.parse("2026-10-06T10:10:00Z"), end: Date.parse("2026-10-06T10:15:00Z"), event: { data: { app: "msedge.exe", title: "AERTEX Watch" } } },
]);
assert(windowUsage.length === 1 && windowUsage[0].seconds === 900, "Window-title time must merge the same app/title and preserve total duration.");

assert(watchTest.browserFamilyForBucket({ id: "aw-watcher-web-edge_unknown", type: "web.tab.current" }) === "edge", "Edge browser bucket identification must match ActivityWatch.");
assert(watchTest.browserAppMatches("edge", "msedge.exe"), "Foreground Edge process must match the Edge browser watcher.");

const browserSegments = watchTest.intersectBrowserEvents(
  [event("2026-10-06T10:00:00Z", 600, { url: "https://example.com/a", title: "Example" })],
  [{ start: Date.parse("2026-10-06T10:02:00Z"), end: Date.parse("2026-10-06T10:07:00Z"), event: { data: { app: "msedge.exe" } } }],
  rangeStart,
  rangeEnd,
  "pc"
);
assert(browserSegments.length === 1 && browserSegments[0].end-browserSegments[0].start === 300000, "Website time must count only the browser-event portion while the matching browser is foreground.");
const websiteUsage = watchTest.groupWebsiteUsage(browserSegments);
assert(websiteUsage.length === 1 && websiteUsage[0].name === "example.com" && websiteUsage[0].seconds === 300, "Website time must aggregate active browser time by domain.");

console.log("AERTEX Watch cloud checks passed.");
