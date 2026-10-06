// 初学者导读：AERTEX Intelligence 子域与认证 handoff 回归检查；锁定 gpt.* 路由、会话和共享主题/菜单集成。
import fs from "node:fs";
import { normalizeHandoffNext } from "../studio/auth-handoff.js";
import { SUPPORTED_LOCALES } from "../studio/locale.js";

const read = path => fs.readFileSync(path, "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const gpt = read("gpt-worker.js");
const main = read("worker.js");
const handoff = read("studio/gpt-subdomain.js");
const session = read("studio/session-gate.js");
const authHandoff = read("studio/auth-handoff.js");
const authWorker = read("auth-worker.js");
const authOauth = read("auth-oauth.js");
const appearance = read("studio/appearance.js");
const intelligenceTheme = read("studio/intelligence-theme.js");
const storageUi = read("studio/ui-storage.js");
const uiStyles = read("studio/ui-styles.js");
const uiPage = read("studio/ui-page.js");
const uiShell = read("studio/ui-shell.js");
const uiSettings = read("studio/ui-settings.js");
const uiPrimitives = read("studio/ui-primitives.js");
const legacyApi = read("studio/legacy-cookie-api.js");
const gptUi = read("studio/gpt-ui.js");
const gptWrangler = JSON.parse(read("wrangler.gpt.jsonc").replace(/^\s*\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, ""));
const aiGateway = read("studio/ai-gateway.js");
const huaweiGate = read("studio/huawei-harmony-gate.js");
const adminApi = read("admin/admin-api.js");
const deviceExemptionMigration = read("supabase/migrations/202609251510_huawei_device_access_exemptions.sql");
const shareAuthorMigration = read("supabase/migrations/202609261610_shared_conversation_author_choice.sql");
const chatOrganizationMigration = read("supabase/migrations/202610021530_intelligence_conversation_pin_archive.sql");

assert(gpt.includes('mainOriginForRequest(request)'), "Intelligence Worker must derive the main-site home from the active domain family.");
assert(gpt.includes('mainOrigin: mainOriginForRequest(request)'), "Intelligence render bootstrap must receive the active AERTEX main-site origin.");
assert(gptUi.includes('class="iconButton topbarHome"'), "Intelligence UI must expose a persistent top-bar AERTEX Home entry.");
assert(gptUi.includes('class="brand" href="${mainHref}"'), "Intelligence sidebar brand must return to AERTEX Home.");

for (const required of [
  'verifyStudioPageSession(request)',
  'gptSessionRedirect(request, pathname)',
  'pathname === "/auth/handoff"',
  'pathname.startsWith("/api/ai/")',
  'handleAuthHandoff(request, env, locale)'
]) {
  assert(gpt.includes(required), `GPT worker is missing authenticated routing invariant: ${required}`);
}

for (const required of [
  'isMainGptHandoffPath(pathname)',
  'handleMainGptHandoff(request)'
]) {
  assert(main.includes(required), `Main worker is missing GPT handoff invariant: ${required}`);
}

for (const required of [
  'mainOriginForRequest(request)',
  'authOriginForRequest(request)',
  'gptOriginForRequest(request)',
  'name="access_token"',
  'name="refresh_token"',
  'verifyStudioPageSession(request)'
]) {
  assert(handoff.includes(required), `GPT handoff is missing secure transfer invariant: ${required}`);
}

assert(!handoff.includes("access_token="), "GPT handoff must not place access tokens in a URL");
assert(!handoff.includes("refresh_token="), "GPT handoff must not place refresh tokens in a URL");
assert(handoff.includes('/c/huawei-exempt/'), "Main GPT handoff must preserve Huawei-exempt conversation aliases.");
assert(session.includes('isServiceHost(hostname, "gpt")'), "Session gate must recognize GPT on every domain family");
assert(session.includes("isolatedAppHost && !accountId"), "Isolated GPT session must require the domain-wide account marker");
assert(authHandoff.includes('isServiceHost(hostname, "gpt")'), "Auth handoff must recognize GPT on every domain family");
assert(authHandoff.includes('gptTarget ? "AERTEX Intelligence"'), "Auth handoff must render the AERTEX Intelligence product handoff");
const TEST_CONVERSATION_ID = "123e4567-e89b-12d3-a456-426614174000";
for (const locale of SUPPORTED_LOCALES) {
  assert(
    normalizeHandoffNext(`/${locale}/c/${TEST_CONVERSATION_ID}`, locale, false, true) === `/${locale}/c/${TEST_CONVERSATION_ID}`,
    `Auth handoff must preserve GPT conversation targets for ${locale}.`
  );
  assert(
    normalizeHandoffNext(`/${locale}/c/huawei-exempt/${TEST_CONVERSATION_ID}`, locale, false, true) === `/${locale}/c/huawei-exempt/${TEST_CONVERSATION_ID}`,
    `Auth handoff must preserve Huawei-exempt GPT conversation targets for ${locale}.`
  );
  assert(
    normalizeHandoffNext("/not-a-conversation", locale, false, true) === `/${locale}`,
    `GPT handoff must constrain ordinary return paths to the locale root for ${locale}.`
  );
}
assert(normalizeHandoffNext("/en", "ja-jp", false, true) === "/en-us", "Legacy /en GPT links must normalize to en-us.");
for (const [host, zone] of [["gpt.qsseda.com","qsseda.com"],["gpt.qsseda.online","qsseda.online"],["gpt.qsseda.studio","qsseda.studio"]]) {
  assert(gptWrangler.routes?.some(route => route.pattern === `${host}/*` && route.zone_name === zone), `${host} exact Worker route must outrank the main-site wildcard route`);
  assert(gptWrangler.routes?.some(route => route.pattern === host && route.custom_domain === true), `${host} custom domain route is missing`);
}
assert(!gpt.includes("canonicalGptAlias"), "GPT .online/.studio hosts must stay on their own domains");
assert(gpt.includes('const localizedRest = routeLocale ? routeParts.slice(1) : routeParts;') && gpt.includes('if (routeLocale && localizedRest[0] === "c")'), "GPT Worker must support localized per-conversation routes.");
assert(gpt.includes('const exempt = localizedRest[1] === "huawei-exempt"'), "GPT Worker must accept Huawei-exempt conversation aliases.");
assert(gpt.includes("await huaweiHarmonyGate(request)"), "GPT Worker must await Huawei exemption verification.");
assert(huaweiGate.includes("handleHuaweiExemptionRoute(request)"), "Huawei exemption routes must require first-use confirmation.");
assert(huaweiGate.includes('name="device_confirm" value="yes"'), "Huawei exemption challenge must require explicit device confirmation.");
assert(huaweiGate.includes('name="authorization_code"'), "Huawei exemption challenge must require an authorization code.");
assert(huaweiGate.includes("EXEMPTION_COOKIE"), "Huawei exemption verification must persist a server-issued browser grant.");
assert(huaweiGate.includes("HttpOnly"), "Huawei exemption grant cookie must not be readable by page JavaScript.");
assert(huaweiGate.includes("shouldAutoApplyExemptionRoute(request)"), "Huawei exemption grant must automatically add the exemption route on future page visits.");
assert(huaweiGate.includes("redirectToHuaweiExemptionRoute(request)"), "Huawei exemption grant must redirect ordinary page URLs into the exemption route.");
assert(huaweiGate.includes("device_access_exemptions"), "Huawei gate must check account-based device exemptions.");
assert(huaweiGate.includes("verifyStudioPageSession(request)"), "Huawei account exemption checks must use the authenticated AERTEX session.");
assert(!huaweiGate.includes("grantHuaweiExemptionFromAccount"), "AERTEX ID exemptions must remain separate from the route-code exemption system.");
assert(huaweiGate.includes("hasDomainAccountMarker(request)"), "Existing AERTEX ID sessions must be restored silently across product subdomains.");
assert(huaweiGate.includes("authorizedAccountSessionRefreshResponse"), "Authorized AERTEX IDs must continue through the normal route without receiving the route-code exemption.");
assert(huaweiGate.includes('/gpt/handoff?next='), "Huawei ID verification from Intelligence must preserve the GPT return target.");
assert(huaweiGate.includes('/work/handoff?next='), "Huawei ID verification from Work must preserve the Work return target.");
assert(adminApi.includes('"device-exemption"'), "Admin API must expose device exemption grant and revoke controls.");
assert(deviceExemptionMigration.includes("enable row level security"), "Device exemption records must remain protected by RLS.");
assert(deviceExemptionMigration.includes("device exemption own or admin read"), "Users may only read their own device exemption record unless they are administrators.");
assert(gpt.includes("normalizeHuaweiExemptPath"), "Auto-applied Huawei exemption routes must normalize back to Intelligence routes internally.");
assert(huaweiGate.includes("localeFromPath(url.pathname)") && huaweiGate.includes('rest[1] === "handoff"'), "Huawei gate must allow handoff transports for every supported locale.");
assert(gpt.includes('loadGptBootstrap(request, env, gate, conversationId)'), "GPT Worker must bootstrap Intelligence data before first paint.");
assert(gpt.includes('pathname.match(/^\\/share\\/'), "GPT Worker must expose explicit read-only share routes.");
assert(gpt.includes("get_shared_ai_conversation"), "GPT Worker must load explicitly shared conversations through the public RPC.");
assert(gpt.includes("renderIntelligenceNotFound"), "GPT Worker must reuse the branded Intelligence not-found renderer.");
assert(!gpt.includes("<h1>404</h1>"), "Intelligence not-found pages must not expose a raw 404 heading.");
assert(gpt.includes("intelligenceThemeFromRequest(request)"), "GPT Worker must resolve the shared color mode before rendering.");

assert(gpt.includes("handleAiApi(request, env, gate)"), "GPT Worker must proxy authenticated AI API calls.");
assert(!gpt.includes("renderAiAdmin"), "GPT Worker must not render an administrator console.");
assert(gpt.includes('pathname.startsWith("/_internal/admin-ai/")'), "GPT Worker must reserve a private AI admin bridge for the control plane.");
assert(gpt.includes("X-AERTEX-Control-Secret"), "Private AI admin bridge must require a server-side secret.");
assert(gpt.includes("handleAiAdminApi(proxied, env"), "AI admin handler may only be reached through the private bridge.");
assert(!gpt.includes("renderAdminDenied"), "GPT Worker must not carry legacy administrator pages.");
assert(gpt.includes("script-src 'unsafe-inline' https://cdn.jsdelivr.net"), "Intelligence CSP must allow the pinned KaTeX/highlight script origin.");
assert(gpt.includes("style-src 'unsafe-inline' https://cdn.jsdelivr.net"), "Intelligence CSP must allow the pinned KaTeX stylesheet origin.");
assert(gpt.includes("font-src https://cdn.jsdelivr.net data:"), "Intelligence CSP must allow KaTeX web fonts while keeping other font origins blocked.");
assert(gpt.includes('pathname.startsWith("/api/ai/admin/")'), "GPT Worker must explicitly hide legacy administrator API paths.");
assert(gpt.includes('if (localizedRest[0] === "admin")'), "GPT Worker must hide administrator page paths under every supported locale.");
for (const required of [
  'const ZHIPU_BASE = "https://open.bigmodel.cn/api/paas/v4"',
  'providerAvailability(p.provider, country)',
  'request.cf?.country',
  'ai_user_provider_access',
  'validateZhipuKey',
  'const ZHIPU_MODELS = ["glm-4.7-flash"]',
  'const BAILIAN_BASE = "https://ws-v0ogv72bnj1vwnsv.cn-beijing.maas.aliyuncs.com/compatible-mode/v1"',
  'validateBailianKey',
  'provider === "bailian"',
  'provider_id: p.id',
  'code: "RATE_LIMITED"',
  'function upstreamDiagnostic(response, rawBody)',
  'daily_limit_tokens',
  'monthly_limit_tokens',
  'DAILY_TOKEN_QUOTA_REACHED',
  'MONTHLY_TOKEN_QUOTA_REACHED',
  'response.status === 429',
  '/api/ai/conversations',
  'share_token',
  'share_author_name',
  'is_pinned',
  'is_archived',
  'order=is_pinned.desc,pinned_at.desc.nullslast,updated_at.desc',
  'Conversation not found.',
  'RICH_FORMAT_SYSTEM',
  'For every mathematical expression, always wrap inline LaTeX in $...$ and display LaTeX in $...$',
  'Never emit bare LaTeX commands such as \\\\frac',
  '{ role: "system", content: RICH_FORMAT_SYSTEM }'
]) {
  assert(aiGateway.includes(required), `AI gateway is missing multi-provider invariant: ${required}`);
}

const chatStart = aiGateway.indexOf("async function chat(");
const chatEnd = aiGateway.indexOf("async function validateProviderKey", chatStart);
const chatSource = aiGateway.slice(chatStart, chatEnd);
assert(chatStart >= 0 && chatEnd > chatStart, "AI chat implementation must remain discoverable for persistence checks.");
assert(!chatSource.includes('const inserted = await restData(session, "/ai_messages"'), "AI chat must not persist the user message before provider success.");
assert(
  chatSource.indexOf('const savedMessages = await restData(session, "/ai_messages"') > chatSource.indexOf("if (!upstream.ok)"),
  "AI chat messages must be persisted only after the provider accepts the request."
);
assert(chatSource.includes("provider_response_id: null"), "User and assistant ai_messages rows must keep the same PostgREST bulk-insert shape.");
assert(chatSource.includes("input_tokens: null"), "User ai_messages rows must explicitly include nullable token fields.");
assert(chatSource.includes("output_tokens: null"), "User ai_messages rows must explicitly include nullable token fields.");
assert(aiGateway.includes("Compatibility fallback: a schema migration must never make existing"), "Conversation history must survive missing pin/archive schema.");
assert(aiGateway.includes("&select=id,title,model,provider_id,is_shared,share_token,share_author_name,created_at,updated_at&order=updated_at.desc&limit=100"), "Conversation history fallback must use the legacy schema.");
assert(uiPage.includes('storageKey: AERTEX_SUPABASE_STORAGE_KEY'), "Browser Supabase auth must use the versioned AERTEX storage key.");
assert(uiPage.includes('sessionStorage.setItem(key, value)'), "Browser Supabase auth must fall back when localStorage persistence is unavailable.");
assert(uiPage.includes('appearanceBootScript()'), "Studio and Work must load the shared appearance runtime.");
assert(uiPage.includes('data-control-menu-backdrop'), "Top controls must include an outside-click dismissal layer.");
assert(uiPage.includes('aertex-control-menu-open'), "Top-control popovers must lock page scrolling while open.");
assert(uiPage.includes('data-theme-option="system"') && uiPage.includes('data-theme-option="light"') && uiPage.includes('data-theme-option="dark"'), "Appearance control must expose System, Light, and Dark.");
assert(uiPage.includes('window.AERTEXTheme.setMode(mode)'), "Appearance control must use the shared theme runtime.");
assert(appearance.includes('return "system";'), "Shared appearance runtime must default to System mode.");
assert(appearance.includes('function cookieValue(name)'), "Shared appearance runtime must define cookie readers instead of calling missing helpers.");
assert(appearance.includes('qssed_theme_generation'), "Shared appearance runtime must version the one-time System default migration.");
assert(appearance.includes('localStorage.setItem(MODE_KEY,"system")'), "Existing browser preferences must be reset to System once for this migration.");
assert(appearance.includes('["qsseda.com","qsseda.online","qsseda.studio"]'), "Shared appearance runtime must support every AERTEX domain family.");
assert(intelligenceTheme.includes('appearanceBootScript()'), "Intelligence and AERTEX ID must delegate to the shared appearance runtime.");
assert(gptUi.includes(':root[data-accent]{--accent:var(--aertex-accent);--accentText:var(--aertex-accent-ink)}'), "Intelligence must consume the shared iPhone accent variables.");
assert(authWorker.includes('requestCookieValue(request, "qssed_locale")'), "AERTEX ID must prefer the shared locale cookie when no localized return path exists.");
assert(authWorker.includes(':root[data-accent]{--accent:var(--aertex-accent)'), "AERTEX ID must consume the shared iPhone accent variables.");
assert(!authHandoff.includes('id="handoff-retry"'), "Auth handoff must not render the obsolete re-login button.");
assert(!storageUi.includes('id="storage-login-link"'), "AERTEX Drive must not render the obsolete re-login button.");
assert(!storageUi.includes('supabaseClient.auth.getSession()'), "AERTEX Drive must trust the validated server cookie session instead of a second browser token.");
assert(storageUi.includes('credentials: "same-origin"'), "AERTEX Drive must authenticate through the server session cookie.");
assert(!storageUi.includes('fetch("/api/account/security/summary"'), "AERTEX Drive must not preflight account summary before its own authenticated API.");
assert(storageUi.includes('await refreshFiles({ force: true });'), "AERTEX Drive must initialize directly from the Drive API.");
assert(uiStyles.includes("minmax(200px,1.25fr)"), "Drive storage metric must reserve enough width for used/quota text.");
assert(uiStyles.includes("@media (max-width:1180px){.storage-overview-panel{grid-template-columns:1fr"), "Drive overview must stack before narrow desktop layouts can overlap.");
assert(uiSettings.includes('systemHint:"默认 · 跟随设备外观"'), "Theme Studio must label System as the default appearance mode.");
assert(uiSettings.includes('49.5%,#111316 50.5% 100%'), "System preview must avoid a bright split seam on high-density displays.");
assert(uiSettings.includes('.theme-mode[data-mode="system"] .theme-mode-visual{border-color:#45484d'), "System preview must use a stable neutral outer edge.");
assert(uiShell.includes('fetch("/api/account/security/summary"'), "Authenticated UI must trust the server session before redirecting back to Auth.");
assert(uiShell.includes("serverOnly: true"), "Authenticated UI must support a server-session-only recovery path.");
assert(uiShell.includes("aiSettingsContent(zh, activeLocale)"), "Studio /settings/ai must render the live AI settings UI with the active locale.");
assert(!uiShell.includes("当前尚未开放用户级 AI 配置"), "Studio AI settings must not regress to the old unavailable placeholder.");
assert(uiSettings.includes('fetch("/api/ai/config"'), "AI settings must load the authenticated runtime configuration.");
assert(uiSettings.includes("const availability = { ai:{meta:statusCopy[0]}") && uiSettings.includes('activeLocale === "ar-sa" ? ["متاح","قيد الاختبار"]'), "Settings Hub must mark AI as available through the locale-aware status map.");
assert(uiSettings.includes("aertex-ai-default-model-v1"), "AI settings must persist the browser default model.");
assert(uiSettings.includes("document.cookie=preferenceKey"), "AI model preference must be shared across product subdomains.");
assert(legacyApi.includes('"/api/ai/config"'), "Main-site cookie API must expose the authenticated AI config route.");
assert(legacyApi.includes("handleAiApi"), "Main-site AI config must reuse the hardened Intelligence API handler.");
assert(gptUi.includes('modelPreferenceKey="aertex-ai-default-model-v1"'), "Intelligence must consume the AI default-model preference.");
assert(gptUi.includes("readModelPreference()"), "Intelligence must resolve the saved default model before rendering model options.");
assert(!uiPrimitives.includes("AI 设置尚未开放"), "Obsolete AI-unavailable copy must not remain in shared status primitives.");
assert(!authHandoff.includes("登录状态已失效，请重新登录。"), "A validated handoff must not dead-end solely because browser auth persistence failed.");
assert(!session.includes("登录状态已失效，正在返回登录页"), "Automatic session recovery must not falsely claim that a valid login expired.");
assert(session.includes('startsWith("zh")'), "Session recovery must keep zh-cn and zh-tw in Chinese.");
assert(session.includes("正在重新同步 AERTEX 登录状态"), "Chinese session recovery must use neutral resynchronization copy.");
assert(authOauth.includes("appearanceBootScript()"), "OAuth authorization pages must use the shared appearance runtime.");
assert(authOauth.includes(':root[data-theme="light"]') && authOauth.includes(':root[data-theme="dark"]'), "OAuth authorization pages must honor fixed light and dark selections.");
assert(authOauth.includes(':root[data-accent]{--accent:var(--aertex-accent)'), "OAuth authorization pages must honor the shared iPhone accent palette.");
assert(authHandoff.includes("Browser auth persistence failed; continuing with validated server session"), "Handoff must continue with its validated server session when client persistence is unavailable.");
assert(chatSource.includes("if (createdConversation)"), "New conversations must be removed when a provider stream fails.");
assert(chatSource.includes('method: "DELETE"'), "Failed newly-created conversations must be deleted.");
assert(shareAuthorMigration.includes("share_author_name boolean not null default false"), "Shared conversations must default to anonymous author identity.");
assert(shareAuthorMigration.includes("'author_name'"), "Public share RPC must expose an author name field.");
assert(shareAuthorMigration.includes("when c.share_author_name"), "Public share RPC must gate identity on explicit user consent.");
assert(chatOrganizationMigration.includes("is_pinned boolean not null default false"), "Intelligence conversations must support persistent pin state.");
assert(chatOrganizationMigration.includes("is_archived boolean not null default false"), "Intelligence conversations must support persistent archive state.");
assert(aiGateway.includes('patch.is_pinned = b.is_pinned === true'), "Conversation PATCH must support pin/unpin.");
assert(aiGateway.includes('patch.is_archived = b.is_archived === true'), "Conversation PATCH must support archiving.");
assert(aiGateway.includes('"&is_archived=eq.false&select='), "Archived chats must be excluded from the default Intelligence sidebar.");

console.log("GPT authentication handoff looks valid.");

