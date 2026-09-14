import {
  protectEdgeRequest,
  applyEdgeProtectionHeaders,
  botSignals,
  hasStudioSessionCookie,
  requestBodyLimit
} from "../studio/edge-protection.js";

const allow = { limit: async () => ({ success: true }) };
const deny = { limit: async () => ({ success: false }) };

function env(overrides = {}) {
  return {
    EDGE_GLOBAL_RATE_LIMITER: allow,
    EDGE_ANON_RATE_LIMITER: allow,
    EDGE_SUSPECT_RATE_LIMITER: allow,
    EDGE_EXPENSIVE_RATE_LIMITER: allow,
    ...overrides
  };
}

function browserRequest(path = "/zh-cn/login", extraHeaders = {}) {
  return fakeRequest(path, {
    headers: {
      "User-Agent": "Mozilla/5.0 Chrome/142.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-Dest": "document",
      ...extraHeaders
    }
  });
}

function fakeRequest(path, options = {}) {
  const request = {
    url: `https://qsseda.studio${path}`,
    method: options.method || "GET",
    headers: new Headers({ "CF-Connecting-IP": "203.0.113.77", ...(options.headers || {}) }),
    cf: options.cf || undefined
  };
  return request;
}

let result = await protectEdgeRequest(browserRequest(), env());
assert(result === null, "Normal browser navigation should pass edge protection");

const robots = await protectEdgeRequest(browserRequest("/robots.txt"), env());
assert(robots?.status === 200, "robots.txt should be served at the edge");
assert((await robots.text()).includes("Disallow: /"), "robots.txt must disallow crawling");

const scanner = await protectEdgeRequest(browserRequest("/.env"), env({ EDGE_GLOBAL_RATE_LIMITER: deny }));
assert(scanner?.status === 404, "Common scanner paths must be rejected before business routing");

const longPath = "/" + "a".repeat(2050);
const longResponse = await protectEdgeRequest(browserRequest(longPath), env());
assert(longResponse?.status === 414, "Oversized request targets must be rejected");

const curlRequest = fakeRequest("/zh-cn/dashboard", {
  headers: { "User-Agent": "curl/8.12.0", Accept: "*/*" }
});
assert(botSignals(curlRequest).score >= 3, "Command-line automation should be classified as suspicious");
result = await protectEdgeRequest(curlRequest, env({ EDGE_SUSPECT_RATE_LIMITER: deny }));
assert(result?.status === 429, "Suspicious anonymous automation must use the strict limiter");

const forgedSessionCurl = fakeRequest("/zh-cn/dashboard", {
  headers: {
    "User-Agent": "curl/8.12.0",
    Accept: "*/*",
    Cookie: "__Host-qsseda-studio-access=forged-token"
  }
});
assert(hasStudioSessionCookie(forgedSessionCurl), "Studio session cookie shape detection failed");
result = await protectEdgeRequest(forgedSessionCurl, env({ EDGE_ANON_RATE_LIMITER: deny, EDGE_SUSPECT_RATE_LIMITER: deny }));
assert(result?.status === 429, "A forged session cookie must not bypass suspicious automation limiting");

const normalClaimedSession = browserRequest("/zh-cn/dashboard", {
  Cookie: "__Host-qsseda-studio-access=session-token"
});
result = await protectEdgeRequest(normalClaimedSession, env({ EDGE_ANON_RATE_LIMITER: deny }));
assert(result === null, "Normal Studio sessions should retain the anonymous-capacity exemption");

const verifiedBot = fakeRequest("/zh-cn/login", {
  headers: { "User-Agent": "Googlebot/2.1", Accept: "text/html" },
  cf: { botManagement: { verifiedBot: true, score: 1 } }
});
assert(botSignals(verifiedBot).verified === true, "Cloudflare verified bots must be recognized");
result = await protectEdgeRequest(verifiedBot, env({ EDGE_SUSPECT_RATE_LIMITER: deny }));
assert(result === null, "Verified bots should not be pushed through the suspicious limiter");

const anonymousFlood = browserRequest();
result = await protectEdgeRequest(anonymousFlood, env({ EDGE_ANON_RATE_LIMITER: deny }));
assert(result?.status === 429, "Anonymous traffic must have its own surge limiter");
assert(result.headers.get("retry-after") === "60", "Rate-limited responses must publish Retry-After");

const globalFlood = browserRequest();
result = await protectEdgeRequest(globalFlood, env({ EDGE_GLOBAL_RATE_LIMITER: deny }));
assert(result?.status === 429, "Global per-IP flood protection must execute before routing");

const expensive = fakeRequest("/api/knowledge/search", {
  method: "POST",
  headers: {
    "User-Agent": "Mozilla/5.0 Chrome/142.0 Safari/537.36",
    Accept: "application/json",
    Cookie: "__Host-qsseda-studio-access=test-token"
  }
});
result = await protectEdgeRequest(expensive, env({ EDGE_EXPENSIVE_RATE_LIMITER: deny }));
assert(result?.status === 429, "Expensive endpoints must have a dedicated limiter");

const expensiveKeys = [];
const recordingExpensiveLimiter = {
  limit: async ({ key }) => {
    expensiveKeys.push(key);
    return { success: true };
  }
};
for (const cookie of ["first-forged-cookie", "second-forged-cookie"]) {
  await protectEdgeRequest(fakeRequest("/api/knowledge/search", {
    method: "POST",
    headers: {
      "User-Agent": "Mozilla/5.0 Chrome/142.0 Safari/537.36",
      Accept: "application/json",
      Cookie: `__Host-qsseda-studio-access=${cookie}`
    }
  }), env({ EDGE_EXPENSIVE_RATE_LIMITER: recordingExpensiveLimiter }));
}
assert(expensiveKeys.length === 2, "Expensive limiter was not invoked for both requests");
assert(expensiveKeys[0] === expensiveKeys[1], "Rotating attacker-controlled cookies must not create new expensive-endpoint limiter buckets");
assert(expensiveKeys[0].endsWith(":ip:203.0.113.77"), "Expensive endpoint limiter must be keyed by Cloudflare source IP");

assert(requestBodyLimit("/api/storage/upload") === 52 * 1024 * 1024, "Storage upload body ceiling changed unexpectedly");
assert(requestBodyLimit("/api/profile/media") === 10 * 1024 * 1024, "Profile media body ceiling changed unexpectedly");
assert(requestBodyLimit("/api/auth/signup") === 6 * 1024 * 1024, "Signup body ceiling changed unexpectedly");
assert(requestBodyLimit("/api/notes") === 2 * 1024 * 1024, "Default API body ceiling changed unexpectedly");

const oversized = fakeRequest("/api/profile/media", {
  method: "POST",
  headers: {
    "User-Agent": "Mozilla/5.0 Chrome/142.0 Safari/537.36",
    Accept: "application/json",
    "Content-Length": String(11 * 1024 * 1024),
    Cookie: "__Host-qsseda-studio-access=test-token"
  }
});
result = await protectEdgeRequest(oversized, env());
assert(result?.status === 413, "Declared oversized request bodies must be rejected before parsing");

const protectedHtml = applyEdgeProtectionHeaders(
  browserRequest(),
  new Response("<html><body>ok</body></html>", { headers: { "content-type": "text/html;charset=UTF-8" } })
);
assert(protectedHtml.headers.get("x-robots-tag")?.includes("noindex"), "HTML responses must opt out of indexing");
assert(protectedHtml.headers.get("x-content-type-options") === "nosniff", "nosniff header is required");
assert(protectedHtml.headers.get("permissions-policy")?.includes("camera=()"), "Restrictive permissions policy is required");

const protectedJson = applyEdgeProtectionHeaders(
  fakeRequest("/api/test"),
  new Response("{}", { headers: { "content-type": "application/json;charset=UTF-8" } })
);
assert(protectedJson.headers.get("x-robots-tag")?.includes("noarchive"), "JSON responses must opt out of indexing and archives");

console.log("Edge anti-crawl and surge protection checks passed.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
