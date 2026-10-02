import fs from "node:fs";
import { normalizeHandoffNext } from "../studio/auth-handoff.js";
import { SUPPORTED_LOCALES } from "../studio/locale.js";

const read = path => fs.readFileSync(path, "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const cash = read("cash-worker.js");
const main = read("worker.js");
const handoff = read("studio/cash-subdomain.js");
const session = read("studio/session-gate.js");
const authHandoff = read("studio/auth-handoff.js");
const authWorker = read("auth-worker.js");
const huaweiGate = read("studio/huawei-harmony-gate.js");
const app = read("cash-web/app.js");
const model = read("cash-web/model.js");
const index = read("cash-web/index.html");
const shell = read("studio/ui-shell.js");
const entry = read("studio/entry.js");
const wrangler = JSON.parse(read("wrangler.cash.jsonc").replace(/^\s*\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, ""));

for (const required of [
  'verifyStudioPageSession(request)',
  'cashSessionRedirect(request, pathname)',
  'pathname === "/auth/handoff"',
  'pathname === "/api/cash/data"',
  'env.STORAGE.put',
  'env.STORAGE.get',
  'env.ASSETS.fetch'
]) assert(cash.includes(required), `Cash worker is missing invariant: ${required}`);

for (const required of [
  'isMainCashHandoffPath(pathname)',
  'handleMainCashHandoff(request)'
]) assert(main.includes(required), `Main worker is missing Cash handoff invariant: ${required}`);

for (const required of [
  'mainOriginForRequest(request)',
  'authOriginForRequest(request)',
  'cashOriginForRequest(request)',
  'name="access_token"',
  'name="refresh_token"',
  'verifyStudioPageSession(request)'
]) assert(handoff.includes(required), `Cash handoff is missing secure transfer invariant: ${required}`);

assert(!handoff.includes("access_token="), "Cash handoff must not place access tokens in a URL");
assert(!handoff.includes("refresh_token="), "Cash handoff must not place refresh tokens in a URL");
assert(session.includes('isServiceHost(hostname, "cash")'), "Session gate must recognize Cash as an isolated product host");
assert(authHandoff.includes('isServiceHost(hostname, "cash")'), "Auth handoff must recognize Cash");
assert(authHandoff.includes('cashTarget ? "AERTEX Cash"'), "Auth handoff must render the Cash product label");
assert(authWorker.includes('service === "cash"'), "AERTEX ID /continue must resolve Cash handoffs");
assert(huaweiGate.includes('/cash/handoff?next='), "Device verification must preserve Cash return targets");

for (const locale of SUPPORTED_LOCALES) {
  assert(
    normalizeHandoffNext(`/${locale}`, locale, false, false, true) === `/${locale}`,
    `Cash handoff must preserve locale root for ${locale}`
  );
  assert(
    normalizeHandoffNext("/unexpected/path", locale, false, false, true) === `/${locale}`,
    `Cash handoff must constrain arbitrary return paths for ${locale}`
  );
}

for (const [host, zone] of [["cash.qsseda.com","qsseda.com"],["cash.qsseda.online","qsseda.online"],["cash.qsseda.studio","qsseda.studio"]]) {
  assert(wrangler.routes?.some(route => route.pattern === `${host}/*` && route.zone_name === zone), `${host} exact Worker route is missing`);
  assert(wrangler.routes?.some(route => route.pattern === host && route.custom_domain === true), `${host} custom domain route is missing`);
}
assert(wrangler.assets?.directory === "./cash-web", "Cash static asset directory is missing");
assert(wrangler.assets?.binding === "ASSETS", "Cash ASSETS binding is missing");
assert(wrangler.assets?.run_worker_first === true, "Cash authentication must run before the app shell");
assert(wrangler.r2_buckets?.some(item => item.binding === "STORAGE" && item.bucket_name === "qsseda-studio-storage"), "Cash R2 binding is missing");

assert(entry.includes('cashHref: `${cashOrigin}/${fullLocale}`'), "Main shell must expose Cash as an independent product.");
assert(shell.includes('title:"AERTEX Cash"'), "Compact product menu must list AERTEX Cash.");
assert(shell.includes('id: "cash", label: "AERTEX Cash"'), "Desktop product navigation must list AERTEX Cash.");
assert(shell.includes('title:"AERTEX Watch"'), "Compact product menu must use the AERTEX Watch brand.");
assert(shell.includes('id: "activitywatch", label: "AERTEX Watch"'), "Desktop product navigation must use the AERTEX Watch brand.");
assert(!shell.includes('title:"ActivityWatch"') && !shell.includes('label: "ActivityWatch"'), "Legacy ActivityWatch must not remain as a rendered product name.");

assert(!app.includes("window.desktopAPI"), "Cash web client must not depend on Electron desktop APIs");
assert(app.includes("fetch('/api/cash/data'"), "Cash web client must load/save account cloud data");
assert(app.includes("advancedJson"), "Cash web client must expose full JSON editing");
assert(index.includes("起始余额") && index.includes("全部可修改"), "Cash settings must visibly mark the opening balance and configuration as editable.");
assert(index.includes("每项可修改") && index.includes("每笔可修改"), "Cash records and plans must visibly communicate editability.");
assert(app.includes("recurring-card") && app.includes("mini-field"), "Recurring expenses must render as roomy editable cards.");
assert(!index.includes('id="openingCash" type="number" min="0"'), "Opening balance must not be artificially constrained to non-negative values.");
assert(app.includes("function addRecurring()"), "Cash UI must support adding recurring expenses.");
assert(app.includes("data-delete-recurring"), "Cash UI must support deleting recurring expenses.");
assert(app.includes("function renderExpected()"), "Cash UI must expose expected monthly events.");
assert(app.includes("function deleteExpected("), "Cash UI must support deleting expected monthly events.");
assert(app.includes("freeCategory('planCategory'"), "Cash plans must accept custom categories.");
for (const id of ["periodStart","periodEnd","manualEntryEnd","oddMondayAnchor","advancedData","addRecurring","addExpected","expectedBody","expectedDialog","planEnabled"]) {
  assert(index.includes(`id="${id}"`), `Cash UI is missing editable field: ${id}`);
}
assert(model.includes("manualEntryEnd"), "Cash model must expose the manual-entry cutoff in settings");
assert(model.includes("oddMondayAnchor"), "Cash model must expose the odd-week anchor in settings");
assert(!model.includes("[4605, 6205].includes"), "Cash web model must not silently rewrite user-entered opening cash");
assert(!model.includes("settings.periodStart === '2026-10-12'"), "Cash web model must not silently rewrite a user-entered planning start date");

console.log("Cash subdomain, cloud storage, and editable model look valid.");
