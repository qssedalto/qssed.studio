import fs from "node:fs";
import { normalizeHandoffNext } from "../studio/auth-handoff.js";
import { notFoundPage } from "../studio/auth-pages.js";
import { TEXT } from "../studio/config.js";
import { huaweiHarmonyGate } from "../studio/huawei-harmony-gate.js";
import { SUPPORTED_LOCALES } from "../studio/locale.js";
import { rewriteWorkSubdomainRequest, workDocumentNotFound, resolveWorkDocumentLink, workDocumentUnavailableRedirect } from "../studio/work-subdomain.js";

const worker = fs.readFileSync(new URL("../worker.js", import.meta.url), "utf8");
const workAuditWrapper = fs.readFileSync(new URL("../studio/worker-audit.js", import.meta.url), "utf8");
const work = fs.readFileSync(new URL("../studio/work-subdomain.js", import.meta.url), "utf8");
const entry = fs.readFileSync(new URL("../studio/entry.js", import.meta.url), "utf8");
const shell = fs.readFileSync(new URL("../studio/ui-shell.js", import.meta.url), "utf8");
const dashboardStyles = fs.readFileSync(new URL("../studio/ui-style-dashboard.js", import.meta.url), "utf8");
const workspaceUi = fs.readFileSync(new URL("../studio/ui-workspace.js", import.meta.url), "utf8");
const uiPage = fs.readFileSync(new URL("../studio/ui-page.js", import.meta.url), "utf8");
const appearance = fs.readFileSync(new URL("../studio/appearance.js", import.meta.url), "utf8");
const accountMenu = fs.readFileSync(new URL("../studio/account-menu.js", import.meta.url), "utf8");
const handoff = fs.readFileSync(new URL("../studio/auth-handoff.js", import.meta.url), "utf8");
const sessionGate = fs.readFileSync(new URL("../studio/session-gate.js", import.meta.url), "utf8");
const authEntry = fs.readFileSync(new URL("../auth-entry.js", import.meta.url), "utf8");
const workTexUi = fs.readFileSync(new URL("../studio/ui-work-tex.js", import.meta.url), "utf8");
const texApp = fs.readFileSync(new URL("../studio/ui-tex-app.js", import.meta.url), "utf8");
const workTexPanels = fs.readFileSync(new URL("../studio/ui-work-tex-panels.js", import.meta.url), "utf8");
const workTexCollaboration = fs.readFileSync(new URL("../studio/ui-work-tex-collaboration.js", import.meta.url), "utf8");
const workUi = fs.readFileSync(new URL("../studio/ui-work.js", import.meta.url), "utf8");
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
assert(worker.includes("workDocumentId") && worker.includes('handleTexApi(new Request(validationUrl.toString()'), "Work document deep links must continue to validate the owner document before rendering.");
assert(worker.includes('if (mapped.notFound) return workDocumentNotFound(workPublicRequest);'), "Malformed Work document paths must continue to produce the branded 404.");
assert(worker.includes("resolveWorkDocumentLink(") && worker.includes("handleTexSharedCollaboration(new Request(sharedUrl.toString()"), "Invited TeX deep links must validate collaborator membership before showing an error.");
assert(worker.includes("workDocumentUnavailableRedirect(workPublicRequest)"), "Expired or revoked TeX document links must return to Work start, not display a 404.");
assert(work.includes("WORK_DOCUMENT_ID_RE"), "Work must constrain document routes to UUID-shaped identifiers.");
assert(work.includes("parseWorkDocumentPath") && work.includes("parseShortWorkDocumentPath"), "Work must support localized and short document deep-link forms.");
assert(work.includes("/d/"), "Work canonical document routes must use the /d/<uuid> namespace.");
assert(work.includes("huawei-exempt/"), "Work document deep links must accept the existing Huawei exemption alias marker.");
const TEST_DOCUMENT_ID = "123e4567-e89b-12d3-a456-426614174000";

const linkCases = [
  { owned: 200, shared: 200, action: "open", sharedCalls: 0 },
  { owned: 404, shared: 200, action: "open", sharedCalls: 1 },
  { owned: 404, shared: 404, action: "home", sharedCalls: 1 },
  { owned: 401, shared: 200, action: "sign-in", sharedCalls: 0 },
  { owned: 404, shared: 401, action: "sign-in", sharedCalls: 1 },
  { owned: 403, shared: 200, action: "response", sharedCalls: 0 },
  { owned: 503, shared: 200, action: "response", sharedCalls: 0 },
  { owned: 404, shared: 503, action: "response", sharedCalls: 1 }
];
for (const scenario of linkCases) {
  let sharedCalls = 0;
  const outcome = await resolveWorkDocumentLink(
    async () => ({ status: scenario.owned }),
    async () => { sharedCalls += 1; return { status: scenario.shared }; }
  );
  assert(outcome.action === scenario.action, `Wrong link action for owner=${scenario.owned}, invited=${scenario.shared}`);
  assert(sharedCalls === scenario.sharedCalls, "Shared-membership lookup must only run after owner-document 404.");
  if (scenario.action === "response") {
    assert(outcome.response.status === (scenario.owned === 404 ? scenario.shared : scenario.owned), "Backend outages and 403 errors must not be disguised as missing invites.");
  }
}

const unavailableLink = workDocumentUnavailableRedirect(new Request(
  `https://work.qsseda.com/zh-cn/d/${TEST_DOCUMENT_ID}?source=invitation`
));
assert(unavailableLink.status === 302, "Revoked or nonexistent shared document URLs must redirect.");
assert(
  unavailableLink.headers.get("location") === "https://work.qsseda.com/zh-cn/tex?notice=document-unavailable",
  "Unavailable deep links must land on the regional Work home, without leaking the document ID."
);
assert(unavailableLink.headers.get("cache-control") === "no-store", "Work invite redirects must never be cached.");
const alternateDomain = workDocumentUnavailableRedirect(new Request(
  `https://work.qsseda.studio/en-us/d/${TEST_DOCUMENT_ID}`
));
assert(
  alternateDomain.headers.get("location") === "https://work.qsseda.studio/en-us/tex?notice=document-unavailable",
  "Expired links must preserve both region and first-party Work domain."
);
assert(entry.includes("document-unavailable") && entry.includes("邀请可能已失效"), "Returned Work home must display a localized explanation.");


const hwPreviewResponse = await huaweiHarmonyGate(new Request(
  `https://work.qsseda.com/zh-cn/d/${TEST_DOCUMENT_ID}/hw`,
  { method: "GET", headers: { Accept: "text/html" } }
));
assert(hwPreviewResponse?.status === 200, "A trailing /hw segment must force the Huawei preview page on a valid Work document URL.");
const hwPreviewMarkup = await hwPreviewResponse.text();
assert(hwPreviewMarkup.includes("检测到您使用华为手机"), "Trailing /hw must render the Huawei unsupported-device preview instead of Work 404.");

const validExemptionResponse = await huaweiHarmonyGate(new Request(
  `https://work.qsseda.com/zh-cn/d/huawei-exempt/${TEST_DOCUMENT_ID}`,
  { method: "GET", headers: { Accept: "text/html" } }
));
assert(validExemptionResponse?.status === 200, "A single correctly placed huawei-exempt marker must remain a valid exemption route.");

const invalidHuaweiMarkerPaths = [
  `/zh-cn/d/${TEST_DOCUMENT_ID}/hw/hw`,
  `/zh-cn/d/hw/${TEST_DOCUMENT_ID}`,
  `/zh-cn/d/${TEST_DOCUMENT_ID}/hw/extra`,
  `/zh-cn/d/huawei-exempt/huawei-exempt/${TEST_DOCUMENT_ID}`,
  `/zh-cn/d/${TEST_DOCUMENT_ID}/huawei-exempt`,
  `/zh-cn/d/huawei-exempt/${TEST_DOCUMENT_ID}/hw`,
  `/zh-cn/d/hw/huawei-exempt/${TEST_DOCUMENT_ID}`
];
for (const path of invalidHuaweiMarkerPaths) {
  const response = await huaweiHarmonyGate(new Request(
    "https://work.qsseda.com" + path,
    { method: "GET", headers: { Accept: "text/html" } }
  ));
  assert(response?.status === 404, `Invalid Huawei marker ordering/count must be rejected at the gate: ${path}`);
}

const hostAware404 = notFoundPage(TEXT.zh, { dashboard: "/zh-cn/dashboard" }, {
  host: "work.qsseda.com",
  requestedPath: `/zh-cn/d/${TEST_DOCUMENT_ID}/unexpected`,
  returnHref: "https://work.qsseda.com/zh-cn/tex"
});
assert(hostAware404.includes("返回 work.qsseda.com"), "Work 404 must name the complete prefixed hostname in its return action.");
assert(hostAware404.includes('href="https://work.qsseda.com/zh-cn/tex"'), "Work 404 must bind its return link explicitly to the Work hostname.");
assert(hostAware404.includes(`work.qsseda.com/zh-cn/d/${TEST_DOCUMENT_ID}/unexpected`), "404 must show the rejected hostname and route for diagnosis.");

const legacyZhWork = rewriteWorkSubdomainRequest(new Request("https://work.qsseda.com/zh/tex"));
assert(
  legacyZhWork.canonical === "https://work.qsseda.com/zh-cn/tex",
  "Legacy Work /zh/tex links must normalize on work.qsseda.com instead of falling through to qsseda.com."
);
const legacyZhDocument = rewriteWorkSubdomainRequest(new Request(`https://work.qsseda.com/zh/d/${TEST_DOCUMENT_ID}`));
assert(
  legacyZhDocument.canonical === `https://work.qsseda.com/zh-cn/d/${TEST_DOCUMENT_ID}`,
  "Legacy Work /zh/d/<uuid> links must normalize to zh-cn without leaving the Work hostname."
);

const actualWork404 = await workDocumentNotFound(new Request(
  `https://work.qsseda.com/zh-cn/d/${TEST_DOCUMENT_ID}/unexpected`,
  { headers: { "Accept-Language": "zh-CN" } }
));
const actualWork404Markup = await actualWork404.text();
assert(actualWork404.status === 404, "Invalid Work document URLs must remain 404 responses.");
assert(
  actualWork404Markup.includes('href="https://work.qsseda.com/zh-cn/tex"'),
  "Rendered Work 404 must use an absolute same-host localized return URL."
);
assert(
  actualWork404Markup.includes(`work.qsseda.com/zh-cn/d/${TEST_DOCUMENT_ID}/unexpected`),
  "Rendered Work 404 must display the complete original localized URL."
);

const localized404Expectations = {
  "en-us": { title: "Page not found", action: "Return to work.qsseda.com" },
  "en-gb": { title: "Page not found", action: "Return to work.qsseda.com" },
  "en-au": { title: "Page not found", action: "Return to work.qsseda.com" },
  "zh-cn": { title: "找不到该网页", action: "返回 work.qsseda.com" },
  "zh-tw": { title: "找不到此網頁", action: "返回 work.qsseda.com" },
  "ja-jp": { title: "ページが見つかりません", action: "work.qsseda.com に戻る" },
  "ko-kr": { title: "페이지를 찾을 수 없습니다", action: "work.qsseda.com로 돌아가기" },
  "fr-fr": { title: "Page introuvable", action: "Retour à work.qsseda.com" },
  "es-es": { title: "Página no encontrada", action: "Volver a work.qsseda.com" },
  "el-gr": { title: "Η σελίδα δεν βρέθηκε", action: "Επιστροφή στο work.qsseda.com" },
  "ar-sa": { title: "لم يتم العثور على الصفحة", action: "العودة إلى work.qsseda.com" }
};
for (const locale of SUPPORTED_LOCALES) {
  const expected = localized404Expectations[locale];
  const contentLanguage = locale === "zh-cn" ? TEXT.zh : TEXT.en;
  const markup = notFoundPage(contentLanguage, { activeLocale: locale }, {
    locale,
    host: "work.qsseda.com",
    requestedPath: `/${locale}/missing`,
    returnHref: `https://work.qsseda.com/${locale}/tex`
  });
  assert(markup.includes(`<html lang="${locale}" dir="${locale === "ar-sa" ? "rtl" : "ltr"}">`), `404 document language/direction must match ${locale}.`);
  assert(markup.includes(expected.title), `404 title must be localized for ${locale}.`);
  assert(markup.includes(expected.action), `404 return action must be localized for ${locale}.`);
  assert(markup.includes(`href="https://work.qsseda.com/${locale}/tex"`), `404 return target must preserve ${locale} on the Work hostname.`);
}
assert(work.includes("locale: fullLocale"), "Work 404 must pass the full regional locale to the renderer.");
assert(work.includes('returnHref = `\${workOriginForRequest(request)}/\${fullLocale}/tex`'), "Work 404 must build an absolute same-host localized Work return URL.");
assert(entry.includes("locale: fullLocale"), "Main-site 404 must pass the full regional locale to the renderer.");
for (const locale of SUPPORTED_LOCALES) {
  assert(
    normalizeHandoffNext(`/${locale}/d/${TEST_DOCUMENT_ID}`, locale, true, false) === `/${locale}/d/${TEST_DOCUMENT_ID}`,
    `Auth handoff must preserve ordinary Work document targets for ${locale}.`
  );
  assert(
    normalizeHandoffNext(`/${locale}/d/huawei-exempt/${TEST_DOCUMENT_ID}`, locale, true, false) === `/${locale}/d/huawei-exempt/${TEST_DOCUMENT_ID}`,
    `Auth handoff must preserve Huawei-exempt Work document targets for ${locale}.`
  );
  assert(
    normalizeHandoffNext(`/d/${TEST_DOCUMENT_ID}`, locale, true, false) === `/${locale}/d/${TEST_DOCUMENT_ID}`,
    `Auth handoff must localize short Work document targets for ${locale}.`
  );
}
assert(
  normalizeHandoffNext(`/en/d/${TEST_DOCUMENT_ID}`, "ja-jp", true, false) === `/en-us/d/${TEST_DOCUMENT_ID}`,
  "Legacy /en Work document links must normalize to en-us without losing the document."
);
assert(accountMenu.includes("supportedLocales: SUPPORTED_LOCALES") && accountMenu.includes('const localePattern=(config.supportedLocales||[]).join("|");') && accountMenu.includes("/work/handoff?next="), "Work account switching must preserve multilingual document deep links.");

for (const required of [
  'workOriginForRequest(request)',
  'mainOriginForRequest(request)',
  'authOriginForRequest(request)',
  'isServiceHost(new URL(request.url).hostname, "work")',
  'const canonicalPath = `/${locale}/tex`',
  'internalUrl.pathname = `/${localizedDocument.locale}/work/tex`',
  'internalUrl.pathname = `/${routeLocale}/work/tex`',
  'const canonicalAliases = new Set(["", "tex", "local", "work", "work/local", "work/tex"])',
  'action="${workOrigin}/auth/handoff"',
  'canonicalWorkPath',
  '__Host-qsseda-studio-refresh'
]) assert(work.includes(required), `Work subdomain module is missing: ${required}`);

assert(!work.includes('internalPath = `/${locale}/work/local`'), "Work must not expose the Local Bridge as a standalone product page");
assert(!work.includes('internalPath = `/${locale}/work`'), "Work must not expose a standalone Work Hub page");

assert(handoff.includes('isServiceHost(hostname, "work")'), "Auth handoff must identify Work on every domain family");
assert(handoff.includes("new Set([authOrigin, mainOrigin])"), "Work handoff must allow only matching-family Auth and main-site origins");
for (const locale of SUPPORTED_LOCALES) {
  assert(
    normalizeHandoffNext("/not-a-work-document", locale, true, false) === `/${locale}/tex`,
    `Every Work handoff must fall back to localized TeX for ${locale}.`
  );
}

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

assert(workUi.includes('AERTEX 主站') && workUi.includes('AERTEX Home'), "Work Hub/navigation must expose a localized AERTEX Home exit.");
assert(workUi.includes('work-home-button'), "Work Hub and Local Bridge must provide an explicit main-site action.");
assert(workUi.includes('dashboardIcon("work")') && workUi.includes('workTexUrl'), "Work sidebar navigation must retain Work overview and TeX destinations.");
assert(!workUi.includes('<b aria-hidden="true">›</b>'), "Work top-level sidebar navigation must rely on the shared CSS chevron and must not render a second inline arrow.");
assert(entry.includes("workHubContent(zh, workOrigin, fullLocale, mainOrigin)"), "Work Hub must receive the active domain-family main origin.");
assert(entry.includes("workLocalBridgeContent(zh, fullLocale, mainOrigin)"), "Work Local Bridge must receive the active domain-family main origin.");
assert(workTexUi.includes("injectWorkTexHomeLinks"), "Standalone Work TeX must expose the three-pane main-site exit injector.");
assert(workTexUi.includes('id="qsseda-work-tex-only"'), "Work TeX must include the dedicated full-viewport shell override");
assert(workTexUi.includes('.tex-workbench .tex-hero{display:none!important}'), "Work must hide inherited product chrome above the workspace");
assert(workTexUi.includes('.os-sidebar'), "Work must remove the inherited sidebar from layout");
assert(workTexUi.includes('height:calc(100vh - 16px)!important'), "Work TeX must own the viewport");
assert(workTexUi.includes('tex-connection-check'), "Work TeX must expose a manual compiler connection check");
assert(workTexUi.includes("targetAddressSpace: 'loopback'"), "Manual Work TeX connection checks must remain scoped to loopback");
assert(workTexUi.includes("loopbackFetch(base, '/tex/status')"), "Manual Work TeX connection checks must verify TeX availability after Bridge health");
assert(workTexUi.includes("fetch('/api/tex/status'"), "Manual Work TeX connection checks must also verify cloud compiler availability");
assert(workTexUi.includes('id="qsseda-work-tex-visual-system-v2"'), "Standalone Work TeX must include the final shared visual-system layer.");
assert(workTexUi.includes(':root[data-accent] body.os-shell:has(.tex-work-app){--primary:var(--aertex-accent)'), "Work TeX must consume the shared iPhone accent variables.");
assert(workTexUi.includes('.tex-mobile-tab[aria-selected="true"]'), "Work mobile navigation must expose an accent-aware selected state.");
assert(!workTexUi.includes('.tex-start-card::after') && !workTexUi.includes('.tex-start-card[data-tex-start-template'), "Remove decorative pseudo-elements that caused duplicate card icons.");
assert(!workTexUi.includes('radial-gradient(760px 330px at 50% -6%'), "Remove excessive legacy welcome glow and stacked rules.");
assert(texApp.includes('class="qtex-welcome"') && texApp.includes('class="qtex-welcome-hero"'), "New welcome must render a compact editorial hero.");
assert(texApp.includes('class="qtex-template-grid"') && texApp.includes('class="qtex-template-top"'), "Welcome cards must have one explicit template icon and a separate heading.");
assert(texApp.includes('data-tex-start-template="blank"') && texApp.includes('data-tex-start-template="math"'), "Template actions must retain existing create handlers.");
assert(entry.includes('polishWorkTexWelcome(polishWorkTexViewportEdges(markup))'), "Isolated Welcome styles must mount after Work pane styles.");
assert(texApp.includes('startDetail: "选择一种结构，直接进入写作与排版。"'), "Chinese TeX start copy must stay concise and task-focused.");
assert(texApp.includes('blankDetail: "基础 article 结构，自动填入项目名与真实姓名"') && texApp.includes('articleDetail: "包含 main.tex、sample.bib 和 frog.jpg"') && texApp.includes('mathDetail: "上传 ZIP 文件，保留项目内的多个文件"'), "All three project cards must describe their actual files and behavior.");
assert(workTexPanels.includes("order:1!important") && workTexPanels.includes(".tex-shell.is-left-collapsed .tex-documents-panel>.tex-panel-head .tex-panel-home-link{\n          display:none!important;"), "Collapsed Work document rail must show only its restore control; Home belongs to expanded panels.");
assert(workTexCollaboration.includes("window.setTimeout(()=>void initialize(),0)"), "The first TeX document load must wait for the invited-document fetch adapter to initialize.");
assert(workTexCollaboration.includes("const workLocale=location.pathname.split('/')[1]||'zh-cn';"), "Invited-document navigation must preserve the current full regional locale.");
assert(workTexCollaboration.includes("const requested=routeDocumentId();if(requested)await openDocument(requested,'replace');else renderEditor();"), "Work TeX root must stay on the start/recommendation surface unless a document deep link is explicitly requested.");
assert(!workTexCollaboration.includes("else if(documents[0])await openDocument(documents[0].id,'replace')"), "Work TeX must not auto-open the first document on a fresh root visit.");
assert(entry.includes("polishWorkTexVisualTheme(markup)"), "Work visual theme must be applied only after existing TeX behavior enhancements.");
assert(uiPage.includes('appearanceBootScript()'), "Studio and Work must inject the shared appearance runtime.");
assert(appearance.includes('const ACCENT_COOKIE="qssed_accent"'), "Shared appearance runtime must publish the accent across the active AERTEX domain family.");
assert(appearance.includes('const MODE_COOKIE="qssed_theme_mode"'), "Shared appearance runtime must publish theme mode across the active AERTEX domain family.");
assert(appearance.includes('cookieValue(ACCENT_COOKIE)'), "Shared appearance runtime must read the cross-subdomain accent preference.");
assert(appearance.includes('cookieValue(MODE_COOKIE)'), "Shared appearance runtime must read the cross-subdomain theme-mode preference.");
assert(appearance.includes('persistCookie(ACCENT_COOKIE,saved)'), "Legacy local accent preferences must migrate into the shared domain cookie.");

assert(workWrangler.name === "qsseda-work", "Work Worker must use a dedicated script name");
assert(workWrangler.main === "studio/worker-audit.js", "Work Worker must enter through the audited main-site facade");
assert(workAuditWrapper.includes('import worker from "../worker.js"'), "Work audit wrapper must reuse the hardened main-site facade");
assert(workAuditWrapper.includes("recordAccessAudit"), "Work audit wrapper must preserve private access auditing");
for (const [host, zone] of [["work.qsseda.com","qsseda.com"],["work.qsseda.studio","qsseda.studio"]]) {
  assert(workWrangler.routes?.some(route => route.pattern === `${host}/*` && route.zone_name === zone), `${host} exact Worker route must outrank the main-site wildcard route`);
  assert(workWrangler.routes?.some(route => route.pattern === host && route.custom_domain === true), `${host} custom domain route is missing`);
}
assert(!workAuditWrapper.includes("canonicalQssedaAlias"), "Work .studio hosts must stay on their own domains");
assert(entry.includes('workHref: `${workOrigin}/${fullLocale}/tex`'), "Studio shell must preserve the complete locale in the AERTEX Work product URL.");
assert(entry.includes('cashHref: `${cashOrigin}/${fullLocale}`'), "Studio shell must expose AERTEX Cash as an independent product.");
// Work 的共享产品导航也承担 Watch 跨产品入口，因此这里顺便锁定 Watch 的 canonical 域名推导与菜单顺序。
assert(entry.includes('awHref: awOriginForRequest(request)'), "Studio shell must derive AERTEX Watch from the active qsseda root instead of hard-coding one domain.");
assert(shell.includes('title:"AERTEX Work"'), "Compact main menu must list AERTEX Work as an independent product.");
assert(shell.includes('id: "work", label: "AERTEX Work"'), "Desktop product navigation must list AERTEX Work as an independent product.");
assert(shell.includes('title:"AERTEX Cash"'), "Compact main menu must list AERTEX Cash as an independent product.");
assert(shell.includes('id: "cash", label: "AERTEX Cash"'), "Desktop product navigation must list AERTEX Cash as an independent product.");
assert(shell.includes('title:"AERTEX Watch"'), "Compact main menu must list AERTEX Watch as an independent product.");
assert(shell.includes('id: "activitywatch", label: "AERTEX Watch"'), "Desktop product navigation must list AERTEX Watch as an independent product.");
assert(dashboardStyles.includes('WORKSPACE_NAV_V9'), "Workspace navigation must keep the full-label layout.");
assert(dashboardStyles.includes('display:flex!important') && dashboardStyles.includes('text-overflow:clip!important'), "Workspace child labels must render in full instead of collapsing to one character plus ellipsis.");
assert(dashboardStyles.includes('.os-nav-entry[data-nav-section="workspace"]>.os-nav-items>a[aria-current="page"]'), "Workspace child routes must keep a compact current-page treatment.");
for (const route of ["workbench","projects","experiments","drafts","tasks"]) {
  assert(dashboardStyles.includes('href*="/workspace/' + route + '"'), 'Workspace navigation must style ' + route + ' independently.');
  assert(workspaceUi.includes('"/workspace/' + route + '"'), 'Workspace hub must link to ' + route + '.');
}
assert(workspaceUi.includes('data-workspace-hub') && workspaceUi.includes('osHubGrid(items,"workspace-hub-grid")'), "Workspace root must render a real five-module hub instead of a placeholder status card.");
assert(!workspaceUi.includes('尚未开放') && !workspaceUi.includes("isn’t available yet"), "Workspace root must not retain stale unavailable placeholder copy.");
assert(dashboardStyles.includes('WORKSPACE_SURFACES_V2'), "The five Workspace modules must share the refined visual system.");
assert(shell.includes('(openInNewTab ? \' target="_blank" rel="noopener noreferrer"\' : \'\')'), "Compact independent-product cards must open in a new browser tab with opener isolation.");
assert(shell.includes('href="${group.href}" target="_blank" rel="noopener noreferrer" data-product-link="${group.id}"'), "Desktop independent-product navigation must open each product in a new browser tab.");
assert(shell.indexOf('title:"AERTEX Work"') < shell.indexOf('title:"AERTEX Cash"') && shell.indexOf('title:"AERTEX Cash"') < shell.indexOf('title:"AERTEX Watch"') && shell.indexOf('title:"AERTEX Watch"') < shell.indexOf('title:"AERTEX Intelligence"'), "Compact independent products must order AERTEX Work, AERTEX Cash, AERTEX Watch, then Intelligence.");
assert(workWrangler.r2_buckets?.some(bucket => bucket.binding === "STORAGE" && bucket.bucket_name === "qsseda-studio-storage"), "Work Worker must share the protected main-site storage binding");

for (const host of ["work.qsseda.com","work.qsseda.studio"]) {
  assert(bridge.includes(`"https://${host}"`), `Legacy Bridge must allow ${host}`);
  assert(nativeOrigin.includes(`allowedOrigins["https://${host}"] = true`), `Native Bridge must allow ${host}`);
}

console.log("Work TeX-only custom domain checks passed.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
