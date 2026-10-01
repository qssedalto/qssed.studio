import fs from "node:fs";

const worker = fs.readFileSync(new URL("../worker.js", import.meta.url), "utf8");
const workAuditWrapper = fs.readFileSync(new URL("../studio/worker-audit.js", import.meta.url), "utf8");
const work = fs.readFileSync(new URL("../studio/work-subdomain.js", import.meta.url), "utf8");
const entry = fs.readFileSync(new URL("../studio/entry.js", import.meta.url), "utf8");
const shell = fs.readFileSync(new URL("../studio/ui-shell.js", import.meta.url), "utf8");
const uiPage = fs.readFileSync(new URL("../studio/ui-page.js", import.meta.url), "utf8");
const accountMenu = fs.readFileSync(new URL("../studio/account-menu.js", import.meta.url), "utf8");
const handoff = fs.readFileSync(new URL("../studio/auth-handoff.js", import.meta.url), "utf8");
const sessionGate = fs.readFileSync(new URL("../studio/session-gate.js", import.meta.url), "utf8");
const authEntry = fs.readFileSync(new URL("../auth-entry.js", import.meta.url), "utf8");
const workTexUi = fs.readFileSync(new URL("../studio/ui-work-tex.js", import.meta.url), "utf8");
const bridge = fs.readFileSync(new URL("../local-bridge/server.mjs", import.meta.url), "utf8");
const nativeOrigin = fs.readFileSync(new URL("../local-bridge/native/origins_work_windows.go", import.meta.url), "utf8");
const workWranglerText = fs.readFileSync(new URL("../wrangler.work.jsonc", import.meta.url), "utf8");
const workWrangler = JSON.parse(workWranglerText.replace(/^\s*\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, ""));

assert(worker.includes("rewriteWorkSubdomainRequest"), "Worker must route the Work custom domain explicitly");
assert(worker.includes("handleMainWorkHandoff"), "Main site must expose the Work session handoff");
assert(worker.includes("workSessionRedirect(request, workPageNext)"), "Unauthenticated Work pages must preserve domain-family context");
assert(worker.includes("mapped.canonical"), "Work aliases must redirect to localized canonical URLs");
assert(worker.includes("suppressWorkClientSessionBounce"), "Authenticated Work HTML must suppress the main-site origin-local session bounce");
assert(worker.includes('markup.replace(\n    "    hydrateOsUser();"'), "Work suppression must target the inherited main-site hydrateOsUser call only");
assert(worker.includes("server-side host-only session gate"), "Work session suppression must document that the server-side gate remains authoritative");
assert(workAuditWrapper.includes('isServiceHost(url.hostname, "work")'), "Huawei exemption aliases must normalize on the Work custom domain.");
assert(worker.includes("workDocumentId") && worker.includes('handleTexApi(validationRequest, env, "documents")'), "Work document deep links must be server-validated through the existing TeX ACL path before rendering.");
assert(worker.includes("workDocumentNotFound(workPublicRequest)"), "Missing or inaccessible Work document deep links must render the branded 404 page.");
assert(work.includes("WORK_DOCUMENT_ID_RE"), "Work must constrain document routes to UUID-shaped identifiers.");
assert(work.includes("parseWorkDocumentPath") && work.includes("parseShortWorkDocumentPath"), "Work must support localized and short document deep-link forms.");
assert(work.includes("/d/"), "Work canonical document routes must use the /d/<uuid> namespace.");
assert(work.includes("huawei-exempt/"), "Work document deep links must accept the existing Huawei exemption alias marker.");
assert(handoff.includes("/d/huawei-exempt/") && handoff.includes("/d/"), "Auth handoff must preserve ordinary and Huawei-exempt Work document targets.");
assert(accountMenu.includes('new RegExp("^/(?:zh-cn|en)/d/') && accountMenu.includes("/work/handoff?next="), "Work account switching must preserve the active document deep link.");

for (const required of [
  'workOriginForRequest(request)',
  'mainOriginForRequest(request)',
  'authOriginForRequest(request)',
  'isServiceHost(new URL(request.url).hostname, "work")',
  'const canonicalPath = `/${locale}/tex`',
  'internalUrl.pathname = pathname.startsWith("/en/") ? "/en/work/tex" : "/zh-cn/work/tex"',
  '"/zh-cn/local", "/en/local"',
  'action="${workOrigin}/auth/handoff"',
  'canonicalWorkPath',
  '__Host-qsseda-studio-refresh'
]) assert(work.includes(required), `Work subdomain module is missing: ${required}`);

assert(!work.includes('internalPath = `/${locale}/work/local`'), "Work must not expose the Local Bridge as a standalone product page");
assert(!work.includes('internalPath = `/${locale}/work`'), "Work must not expose a standalone Work Hub page");

assert(handoff.includes('isServiceHost(hostname, "work")'), "Auth handoff must identify Work on every domain family");
assert(handoff.includes("new Set([authOrigin, mainOrigin])"), "Work handoff must allow only matching-family Auth and main-site origins");
assert(handoff.includes('return candidateLocale === "zh" ? "/zh-cn/tex" : "/en/tex"'), "Every Work handoff must land on localized TeX");

assert(sessionGate.includes('const ACCOUNT_COOKIE = "__Secure-qsseda-account-id"'), "Work sessions must use a domain-wide account identity marker");
assert(sessionGate.includes("rootDomainForHost(hostname)"), "The account identity marker must follow the active root domain");
assert(sessionGate.includes('if (isolatedAppHost && !accountId) return false'), "Work and other isolated app hosts must fail closed when the domain-wide account marker is missing");
assert(sessionGate.includes('if (accountId && accountId !== userId) return false'), "Work must reject a host session belonging to a different account");
assert(sessionGate.includes('accountId !== verified.user.id'), "Work bootstrap must not recreate a stale local account session");
assert(sessionGate.includes('globalLogoutCookies(request)'), "Logout must invalidate the active domain-family account identity marker");
assert(sessionGate.includes('Domain=${domain}'), "The identity marker must be sent across the active domain family");

assert(authEntry.includes('pathname === "/continue" && isLoginRedirect(response, url.origin)'), "Auth entry must preserve app return targets on every Auth domain");
assert(authEntry.includes('/login?next=${encodeURIComponent(effectiveReturn)}'), "Auth login redirect must retain the validated next path");
assert(authEntry.includes('const RETURN_COOKIE = "__Host-qsseda-auth-return"'), "Auth must keep a host-only pending return target for mobile login reloads");
assert(authEntry.includes("HttpOnly; Secure; SameSite=Lax"), "Pending Auth return target must use hardened host-only cookie attributes");
assert(authEntry.includes("requestedReturn || pendingReturn"), "Auth must recover the return target from the pending cookie when the query is lost");
assert(authEntry.includes("clearReturnCookie()"), "Auth must clear the pending return target after a successful continue handoff");
assert(authEntry.includes('id="qsseda-auth-return-target"'), "Auth login UI must resume the preserved return target after sign-in");
assert(authEntry.includes('location.replace(target)'), "Auth login must resume the original app handoff instead of falling back to Dashboard");
assert(authEntry.includes('path.startsWith("/")') && authEntry.includes('path.startsWith("//")'), "Auth return target must remain constrained to same-origin paths");

assert(workTexUi.includes('id="qsseda-work-tex-only"'), "Work TeX must include the dedicated full-viewport shell override");
assert(workTexUi.includes('.tex-workbench .tex-hero{display:none!important}'), "Work must hide inherited product chrome above the workspace");
assert(workTexUi.includes('.os-sidebar'), "Work must remove the inherited sidebar from layout");
assert(workTexUi.includes('height:calc(100vh - 16px)!important'), "Work TeX must own the viewport");
assert(workTexUi.includes('tex-connection-check'), "Work TeX must expose a manual compiler connection check");
assert(workTexUi.includes("targetAddressSpace: 'loopback'"), "Manual Work TeX connection checks must remain scoped to loopback");
assert(workTexUi.includes("loopbackFetch(base, '/tex/status')"), "Manual Work TeX connection checks must verify TeX availability after Bridge health");
assert(workTexUi.includes("fetch('/api/tex/status'"), "Manual Work TeX connection checks must also verify cloud compiler availability");
assert(workTexUi.includes('id="qsseda-work-tex-visual-system-v2"'), "Standalone Work TeX must include the final shared visual-system layer.");
assert(workTexUi.includes(':root[data-accent="sapphire"] body.os-shell:has(.tex-work-app)'), "Work TeX must map Studio accent tokens into the standalone product.");
assert(workTexUi.includes('.tex-mobile-tab[aria-selected="true"]'), "Work mobile navigation must expose an accent-aware selected state.");
assert(workTexUi.includes('.tex-start-card::after'), "Work start templates must use the upgraded product-card treatment.");
assert(entry.includes("polishWorkTexVisualTheme(markup)"), "Work visual theme must be applied only after existing TeX behavior enhancements.");
assert(uiPage.includes('const ACCENT_COOKIE = "qssed_accent"'), "Shared appearance runtime must publish the accent across the active AERTEX domain family.");
assert(uiPage.includes('const MODE_COOKIE = "qssed_theme_mode"'), "Shared appearance runtime must publish theme mode across the active AERTEX domain family.");
assert(uiPage.includes("readCookieAccent()"), "Shared appearance runtime must read the cross-subdomain accent preference.");
assert(uiPage.includes("readCookieMode()"), "Shared appearance runtime must read the cross-subdomain theme-mode preference.");
assert(uiPage.includes("isRootPreferenceHost()"), "Main-site appearance preferences must migrate into the shared domain cookie without changing app logic.");

assert(workWrangler.name === "qsseda-work", "Work Worker must use a dedicated script name");
assert(workWrangler.main === "studio/worker-audit.js", "Work Worker must enter through the audited main-site facade");
assert(workAuditWrapper.includes('import worker from "../worker.js"'), "Work audit wrapper must reuse the hardened main-site facade");
assert(workAuditWrapper.includes("recordAccessAudit"), "Work audit wrapper must preserve private access auditing");
for (const [host, zone] of [["work.qsseda.com","qsseda.com"],["work.qsseda.online","qsseda.online"],["work.qsseda.studio","qsseda.studio"]]) {
  assert(workWrangler.routes?.some(route => route.pattern === `${host}/*` && route.zone_name === zone), `${host} exact Worker route must outrank the main-site wildcard route`);
  assert(workWrangler.routes?.some(route => route.pattern === host && route.custom_domain === true), `${host} custom domain route is missing`);
}
assert(!workAuditWrapper.includes("canonicalQssedaAlias"), "Work .online/.studio hosts must stay on their own domains");
assert(entry.includes('workHref: `${workOrigin}/${zh ? "zh-cn/tex" : "en/tex"}`'), "Studio shell must receive the canonical localized AERTEX Work product URL.");
assert(shell.includes('title:"AERTEX Work"'), "Compact main menu must list AERTEX Work as an independent product.");
assert(shell.includes('id: "work", label: "AERTEX Work"'), "Desktop product navigation must list AERTEX Work as an independent product.");
assert(shell.indexOf('title:"AERTEX Work"') < shell.indexOf('title:"AERTEX Intelligence"'), "Compact independent products must order AERTEX Work before Intelligence.");
assert(workWrangler.r2_buckets?.some(bucket => bucket.binding === "STORAGE" && bucket.bucket_name === "qsseda-studio-storage"), "Work Worker must share the protected main-site storage binding");

for (const host of ["work.qsseda.com","work.qsseda.online","work.qsseda.studio"]) {
  assert(bridge.includes(`"https://${host}"`), `Legacy Bridge must allow ${host}`);
  assert(nativeOrigin.includes(`allowedOrigins["https://${host}"] = true`), `Native Bridge must allow ${host}`);
}

console.log("Work TeX-only custom domain checks passed.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
