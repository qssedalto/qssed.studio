import {
  protectEdgeRequest,
  applyEdgeProtectionHeaders,
  botSignals,
  hasStudioSessionCookie,
  requestBodyLimit
} from "../studio/edge-protection.js";
import { publicSitemapUrls } from "../studio/public-indexing.js";
import studioWorker, { rateLimitKey } from "../worker.js";
import { QUESTION_INDEX_LOCALES, publishedQuestions } from "../studio/public-questions.js";

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
    url: `https://qsseda.com${path}`,
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
const robotsText = await robots.text();
assert(robotsText.includes("Allow: /"), "Canonical robots.txt must allow public crawling");
assert(robotsText.includes("Sitemap: https://qsseda.com/sitemap.xml"), "Canonical robots.txt must publish the sitemap");

const sitemap = await protectEdgeRequest(browserRequest("/sitemap.xml"), env());
assert(sitemap?.status === 200, "Canonical sitemap.xml should be served at the edge");
const sitemapText = await sitemap.text();
const sitemapUrls = publicSitemapUrls();
const expectedSitemapCount = 56 + QUESTION_INDEX_LOCALES.length * (1 + publishedQuestions().length);
assert(sitemapUrls.length === expectedSitemapCount, "Complete public sitemap count is out of sync with public Questions.");
for (const required of [
  "https://qsseda.com/",
  "https://qsseda.com/zh-cn",
  "https://qsseda.com/zh-cn/aw/setup",
  "https://qsseda.com/zh-cn/wishes",
  "https://qsseda.com/zh-cn/birthday",
  "https://qsseda.com/zh-cn/mid-autumn",
  "https://qsseda.com/ar-sa/aw/setup",
  "https://qsseda.com/fr-fr/birthday",
  "https://qsseda.com/zh-cn/q",
  "https://qsseda.com/en-us/q/0e5f2ec8-99cf-4bd1-93a0-66ec12360f01"
]) {
  assert(sitemapText.includes("<loc>" + required + "</loc>"), "Sitemap is missing " + required);
}

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
assert(hasStudioSessionCookie(forgedSessionCurl), "QssedA session cookie shape detection failed");
result = await protectEdgeRequest(forgedSessionCurl, env({ EDGE_ANON_RATE_LIMITER: deny, EDGE_SUSPECT_RATE_LIMITER: deny }));
assert(result?.status === 429, "A forged session cookie must not bypass suspicious automation limiting");

const normalClaimedSession = browserRequest("/zh-cn/dashboard", {
  Cookie: "__Host-qsseda-studio-access=session-token"
});
result = await protectEdgeRequest(normalClaimedSession, env({ EDGE_ANON_RATE_LIMITER: deny }));
assert(result?.status === 429, "A cookie without verified identity must not bypass the per-IP request budget");

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
const cookieBudgetKeys = [];
const recordBudget = { limit: async ({key}) => { cookieBudgetKeys.push(key); return { success: true }; } };
for (const headers of [
  { Authorization: "Bearer attacker-first" },
  { Authorization: "Bearer attacker-second" },
  { Cookie: "__Host-qsseda-studio-access=forged" },
  {}
]) await protectEdgeRequest(browserRequest("/zh-cn/dashboard", headers), env({ EDGE_ANON_RATE_LIMITER: recordBudget }));
assert(cookieBudgetKeys.length === 4 && cookieBudgetKeys.every(key => key === cookieBudgetKeys[0]), "Changing client-controlled credentials must not change per-IP edge budget keys");
const apiIdentityKeys = [
  { Authorization: "Bearer forged-token-1" },
  { Authorization: "Bearer forged-token-2" },
  { Cookie: "__Host-qsseda-studio-access=forged-cookie" },
  {}
].map(headers => rateLimitKey(browserRequest("/api/tasks", headers), "read:/api/tasks"));
assert(apiIdentityKeys.every(key => key === "read:/api/tasks:ip:203.0.113.77"), "API limiter keys must ignore forged bearer tokens and cookies");



assert(requestBodyLimit("/api/storage/upload") === 52 * 1024 * 1024, "Storage upload body ceiling changed unexpectedly");
assert(requestBodyLimit("/wallpapers/proled-xdr/upload") === 8 * 1024 * 1024, "Removed wallpaper upload route must not receive an elevated body-size allowance");
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
assert(protectedHtml.headers.get("x-robots-tag")?.includes("noindex"), "HTML without an explicit indexing policy must remain noindex");

const publicHtml = applyEdgeProtectionHeaders(
  browserRequest("/"),
  new Response("<html><body>public</body></html>", {
    headers: {
      "content-type": "text/html;charset=UTF-8",
      "x-robots-tag": "index, follow, max-snippet:-1, max-image-preview:large"
    }
  })
);
assert(publicHtml.headers.get("x-robots-tag")?.startsWith("index, follow"), "Explicit public indexing policy must survive edge hardening");
assert(protectedHtml.headers.get("x-content-type-options") === "nosniff", "nosniff header is required");
assert(protectedHtml.headers.get("permissions-policy")?.includes("camera=()"), "Restrictive permissions policy is required");

const protectedJson = applyEdgeProtectionHeaders(
  fakeRequest("/api/test"),
  new Response("{}", { headers: { "content-type": "application/json;charset=UTF-8" } })
);
assert(protectedJson.headers.get("x-robots-tag")?.includes("noarchive"), "JSON responses must opt out of indexing and archives");

// Auth-sensitive Studio routes must fail closed if their dedicated limiter
// is missing, errors, or returns an invalid shape. Ordinary API read fallback
// is intentionally unchanged for availability.
const studioAuthRequest = () => new Request("https://qsseda.com/api/auth/login", {
  method: "POST",
  headers: { "CF-Connecting-IP": "203.0.113.77" }
});
const limiterOutage = { limit: async () => { throw new Error("simulated limiter outage"); } };
for (const limiter of [undefined, limiterOutage, { limit: async () => ({}) }]) {
  const limitedResponse = await studioWorker.fetch(studioAuthRequest(), env({ AUTH_RATE_LIMITER: limiter }));
  assert(limitedResponse.status === 503, "Studio auth mutations must fail closed if throttling cannot be established");
  assert(limitedResponse.headers.get("retry-after") === "30", "Studio auth limiter outage must advertise retry timing");
}
const quotaExceeded = await studioWorker.fetch(studioAuthRequest(), env({ AUTH_RATE_LIMITER: deny }));
assert(quotaExceeded.status === 429, "Studio auth quota exhaustion must remain HTTP 429");

console.log("Edge anti-crawl and surge protection checks passed.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
