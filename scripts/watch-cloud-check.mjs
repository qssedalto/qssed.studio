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
assert(index.includes("AERTEX Watch") && index.includes("生成设备令牌") && index.includes("连接电脑"), "Watch UI must expose product identity and device onboarding.");
assert(index.includes("https://qsseda.com/zh-cn/aw/setup") && index.includes("查看设置教程"), "Watch UI must link to the computer setup tutorial.");
assert(entry.includes('pathname === "/aw/setup"') && entry.includes("watchSetupPage(request)"), "Studio must route the localized Watch setup tutorial.");
assert(setupPage.includes("ActivityWatch") && setupPage.includes("AERTEX-Watch-Sync-Setup.exe"), "Watch setup tutorial must cover ActivityWatch and the native Windows installer.");
for (const legacyInstruction of ["node --version", "AERTEX_WATCH_TOKEN", "Invoke-WebRequest", "保持 PowerShell", "Keep the PowerShell"]) {
  assert(!setupPage.includes(legacyInstruction), "Watch setup must not expose legacy command-line instructions: " + legacyInstruction);
}
assert(setupPage.includes("https://aw.qsseda.com/AERTEX-Watch-Sync-Setup.exe"), "Watch setup must use the public Windows installer URL.");
assert(app.includes("/api/watch/tokens") && app.includes("/api/0/buckets/"), "Watch UI must use authenticated cloud APIs.");
assert(sync.includes("http://127.0.0.1:5600"), "Native sync must default to ActivityWatch localhost.");
assert(sync.includes("https://awd.qsseda.com"), "Native sync must default to the short cloud data domain.");
assert(sync.includes("limit:\"-1\""), "Native sync must request the complete incremental ActivityWatch event range.");
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
assert(nativeWorkflow.includes("windows-latest") && nativeWorkflow.includes("cargo clippy") && nativeWorkflow.includes("AERTEX-Watch-Sync-Setup.exe") && nativeWorkflow.includes("Inno Setup"), "Native Windows installer build workflow is incomplete.");
assert(nativeWorkflow.includes("watch/releases/windows/AERTEX-Watch-Sync-Setup.exe"), "Windows installer must publish to the fixed R2 key.");
assert(!nativeWorkflow.includes("path: AW-Sync/native/dist/AERTEX-Watch-Sync.exe"), "Portable executable must not be published as the user-facing artifact.");
assert(nativeInstaller.includes("DelTree(TargetDir, True, True, True)") && nativeInstaller.includes("/delete:AERTEX/WatchSync/DeviceToken"), "Installer must reset the previous install directory and stored device token.");
assert(nativeInstaller.includes("taskkill.exe") && nativeInstaller.includes("Software\\Microsoft\\Windows\\CurrentVersion\\Run"), "Installer must replace a running old client and configure per-user startup.");
assert(nativeInstaller.includes("SetupIconFile=..\\assets\\aertex-watch.ico"), "Installer must use the AERTEX Watch icon.");
assert(nativeBuild.includes('set_icon') && nativeBuild.includes("aertex-watch.ico"), "Windows executable must embed the AERTEX Watch icon.");
assert(!nativeMain.includes("ensure_installed_and_relaunch"), "Production client must no longer use the portable self-install flow.");
assert(setupPage.includes('"cache-control": "private, no-store"'), "Region-specific Watch setup responses must not be shared-cacheable.");

console.log("AERTEX Watch cloud checks passed.");
