// 回归检查：AERTEX ID 边缘反滥用层。
//
// 使用假的 Cloudflare Rate Limiter binding 构造允许/拒绝场景，验证扫描路径、自动化 UA、超长请求、
// OAuth 协议例外和响应安全头。这里检查的是“进入登录业务前”的防护，不替代密码/OAuth 本身的认证测试。
import {
  protectAuthEdgeRequest,
  applyAuthEdgeHeaders,
  authBotSignals
} from "../auth-edge-protection.js";

const allow = { limit: async () => ({ success: true }) };
const deny = { limit: async () => ({ success: false }) };

function env(overrides = {}) {
  return {
    AUTH_EDGE_GLOBAL_RATE_LIMITER: allow,
    AUTH_EDGE_ANON_RATE_LIMITER: allow,
    AUTH_EDGE_SUSPECT_RATE_LIMITER: allow,
    ...overrides
  };
}

function request(path, options = {}) {
  return {
    url: `https://auth.qsseda.com${path}`,
    method: options.method || "GET",
    headers: new Headers({ "CF-Connecting-IP": "203.0.113.88", ...(options.headers || {}) }),
    cf: options.cf || undefined
  };
}

function browser(path = "/login", extra = {}) {
  return request(path, {
    headers: {
      "User-Agent": "Mozilla/5.0 Chrome/142.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-Dest": "document",
      ...extra
    }
  });
}

let result = await protectAuthEdgeRequest(browser(), env());
assert(result === null, "Normal Auth browser navigation should pass edge protection");

const robots = await protectAuthEdgeRequest(browser("/robots.txt"), env());
assert(robots?.status === 200, "Auth robots.txt should be served at the edge");
assert((await robots.text()).includes("Disallow: /"), "Auth robots.txt must disallow crawling");

const scanner = await protectAuthEdgeRequest(browser("/.env"), env({ AUTH_EDGE_GLOBAL_RATE_LIMITER: deny }));
assert(scanner?.status === 404, "Auth scanner probes must be rejected before routing");

const curlLogin = request("/login", {
  headers: { "User-Agent": "curl/8.12.0", Accept: "*/*" }
});
assert(authBotSignals(curlLogin).score >= 3, "Auth page command-line automation should be suspicious");
result = await protectAuthEdgeRequest(curlLogin, env({ AUTH_EDGE_SUSPECT_RATE_LIMITER: deny }));
assert(result?.status === 429, "Suspicious Auth page automation must use the strict limiter");

const forgedIdentityLogin = request("/login", {
  headers: {
    "User-Agent": "curl/8.12.0",
    Accept: "*/*",
    Authorization: "Bearer forged-token",
    Cookie: "fake-session=fake"
  }
});
result = await protectAuthEdgeRequest(forgedIdentityLogin, env({ AUTH_EDGE_SUSPECT_RATE_LIMITER: deny }));
assert(result?.status === 429, "Forged identity headers must not bypass Auth page crawler limiting");
result = await protectAuthEdgeRequest(browser("/login", { Authorization: "Bearer forged-token" }), env({ AUTH_EDGE_ANON_RATE_LIMITER: deny }));
assert(result?.status === 429, "Forged identity headers must not bypass Auth page surge limiting");

const oauthClient = request("/oauth/token", {
  method: "POST",
  headers: { "User-Agent": "curl/8.12.0", Accept: "application/json" }
});
result = await protectAuthEdgeRequest(oauthClient, env({ AUTH_EDGE_ANON_RATE_LIMITER: deny, AUTH_EDGE_SUSPECT_RATE_LIMITER: deny }));
assert(result === null, "OAuth protocol clients must not be rejected by page crawler/anonymous heuristics");

const identifiedOauthClient = request("/oauth/token", {
  method: "POST",
  headers: {
    "User-Agent": "curl/8.12.0",
    Accept: "application/json",
    Authorization: "Basic dGVzdDp0ZXN0"
  }
});
result = await protectAuthEdgeRequest(identifiedOauthClient, env({ AUTH_EDGE_ANON_RATE_LIMITER: deny, AUTH_EDGE_SUSPECT_RATE_LIMITER: deny }));
assert(result === null, "OAuth protocol clients must remain compatible with programmatic authentication");

const verifiedBot = request("/login", {
  headers: { "User-Agent": "Googlebot/2.1", Accept: "text/html" },
  cf: { botManagement: { verifiedBot: true, score: 1 } }
});
assert(authBotSignals(verifiedBot).verified === true, "Auth edge should recognize Cloudflare verified bots");
result = await protectAuthEdgeRequest(verifiedBot, env({ AUTH_EDGE_SUSPECT_RATE_LIMITER: deny }));
assert(result === null, "Verified bots should not be sent to the suspicious limiter");

result = await protectAuthEdgeRequest(browser(), env({ AUTH_EDGE_ANON_RATE_LIMITER: deny }));
assert(result?.status === 429, "Auth page traffic must have a dedicated surge limiter");

result = await protectAuthEdgeRequest(browser(), env({ AUTH_EDGE_GLOBAL_RATE_LIMITER: deny }));
assert(result?.status === 429, "Auth global per-IP limiter must execute before routing");
assert(result.headers.get("retry-after") === "60", "Auth 429 responses must include Retry-After");

const oversized = request("/api/login", {
  method: "POST",
  headers: {
    "User-Agent": "Mozilla/5.0 Chrome/142.0 Safari/537.36",
    Accept: "application/json",
    "Content-Length": String(3 * 1024 * 1024)
  }
});
result = await protectAuthEdgeRequest(oversized, env());
assert(result?.status === 413, "Auth oversized bodies must be rejected before parsing");

const protectedHtml = applyAuthEdgeHeaders(
  browser(),
  new Response("<html><body>auth</body></html>", { headers: { "content-type": "text/html;charset=UTF-8" } })
);
assert(protectedHtml.headers.get("x-robots-tag")?.includes("noindex"), "Auth HTML must opt out of indexing");
assert(protectedHtml.headers.get("referrer-policy") === "no-referrer", "Auth pages must use no-referrer");
assert(protectedHtml.headers.get("x-content-type-options") === "nosniff", "Auth responses must use nosniff");

console.log("Auth edge anti-crawl and surge protection checks passed.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
