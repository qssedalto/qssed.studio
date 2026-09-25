import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const gpt = read("gpt-worker.js");
const main = read("worker.js");
const handoff = read("studio/gpt-subdomain.js");
const session = read("studio/session-gate.js");
const authHandoff = read("studio/auth-handoff.js");
const gptWrangler = JSON.parse(read("wrangler.gpt.jsonc").replace(/^\s*\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, ""));
const aiGateway = read("studio/ai-gateway.js");
const huaweiGate = read("studio/huawei-harmony-gate.js");

for (const required of [
  'verifyStudioPageSession(request)',
  'gptSessionRedirect(request, pathname)',
  'pathname === "/auth/handoff"',
  'pathname.startsWith("/api/ai/")',
  'renderAiAdmin(locale, { state: adminState, theme: intelligenceTheme })',
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
assert(authHandoff.includes('if (adminTarget) return candidateLocale === "zh" ? "/zh-cn/admin" : "/en/admin"'), "GPT handoff must preserve the administrator route safely");
assert(authHandoff.includes('/c/huawei-exempt/'), "Auth handoff must preserve Huawei-exempt GPT conversation targets.");
assert(authHandoff.includes('return candidateLocale === "zh" ? "/zh-cn" : "/en"'), "GPT handoff must constrain ordinary return paths to GPT locale roots");
for (const [host, zone] of [["gpt.qsseda.com","qsseda.com"],["gpt.qsseda.online","qsseda.online"],["gpt.qsseda.studio","qsseda.studio"]]) {
  assert(gptWrangler.routes?.some(route => route.pattern === `${host}/*` && route.zone_name === zone), `${host} exact Worker route must outrank the main-site wildcard route`);
  assert(gptWrangler.routes?.some(route => route.pattern === host && route.custom_domain === true), `${host} custom domain route is missing`);
}
assert(!gpt.includes("canonicalGptAlias"), "GPT .online/.studio hosts must stay on their own domains");
assert(gpt.includes('conversationRoute = pathname.match'), "GPT Worker must support per-conversation routes.");
assert(gpt.includes('(?:huawei-exempt\\/)?'), "GPT Worker must accept Huawei-exempt conversation aliases.");
assert(gpt.includes("await huaweiHarmonyGate(request)"), "GPT Worker must await Huawei exemption verification.");
assert(huaweiGate.includes("handleHuaweiExemptionRoute(request)"), "Huawei exemption routes must require first-use confirmation.");
assert(huaweiGate.includes('name="device_confirm" value="yes"'), "Huawei exemption challenge must require explicit device confirmation.");
assert(huaweiGate.includes('name="authorization_code"'), "Huawei exemption challenge must require an authorization code.");
assert(huaweiGate.includes("EXEMPTION_COOKIE"), "Huawei exemption verification must persist a server-issued browser grant.");
assert(huaweiGate.includes("HttpOnly"), "Huawei exemption grant cookie must not be readable by page JavaScript.");
assert(huaweiGate.includes("shouldAutoApplyExemptionRoute(request)"), "Huawei exemption grant must automatically add the exemption route on future page visits.");
assert(huaweiGate.includes("redirectToHuaweiExemptionRoute(request)"), "Huawei exemption grant must redirect ordinary page URLs into the exemption route.");
assert(gpt.includes("normalizeHuaweiExemptPath"), "Auto-applied Huawei exemption routes must normalize back to Intelligence routes internally.");
assert(huaweiGate.includes('url.pathname === "/gpt/handoff"'), "Huawei gate must allow the GPT handoff transport.");
assert(huaweiGate.includes('url.pathname === "/zh-cn/gpt/handoff"'), "Huawei gate must allow the localized GPT handoff transport.");
assert(gpt.includes('loadGptBootstrap(request, env, gate, conversationId)'), "GPT Worker must bootstrap Intelligence data before first paint.");
assert(gpt.includes('pathname.match(/^\\/share\\/'), "GPT Worker must expose explicit read-only share routes.");
assert(gpt.includes("get_shared_ai_conversation"), "GPT Worker must load explicitly shared conversations through the public RPC.");
assert(gpt.includes("renderIntelligenceNotFound"), "GPT Worker must reuse the branded Intelligence not-found renderer.");
assert(!gpt.includes("<h1>404</h1>"), "Intelligence not-found pages must not expose a raw 404 heading.");
assert(gpt.includes("intelligenceThemeFromRequest(request)"), "GPT Worker must resolve the shared color mode before rendering.");

assert(gpt.includes("handleAiApi(request, env, gate)"), "GPT Worker must proxy authenticated AI API calls.");
assert(gpt.includes("renderAdminDenied(locale, identity, intelligenceTheme)"), "GPT Worker must render a dedicated non-admin denial page with verified identity context.");
assert(gpt.includes("loadDeniedIdentity(gate)"), "GPT Worker must prefill denied-admin support mail with authenticated account context.");
assert(!gpt.includes("utm_source=chatgpt.com"), "GPT admin links must not include tracking parameters.");
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
  'Conversation not found.'
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
assert(chatSource.includes("if (createdConversation)"), "New conversations must be removed when a provider stream fails.");
assert(chatSource.includes('method: "DELETE"'), "Failed newly-created conversations must be deleted.");

console.log("GPT authentication handoff looks valid.");

