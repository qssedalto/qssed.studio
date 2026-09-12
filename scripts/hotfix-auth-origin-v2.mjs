import fs from 'node:fs';

function replaceOnce(text, needle, replacement, label) {
  const count = text.split(needle).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, found ${count}`);
  return text.replace(needle, replacement);
}

let auth = fs.readFileSync('auth-worker.js', 'utf8');
let main = fs.readFileSync('worker.js', 'utf8');

auth = replaceOnce(
  auth,
  '  headers.set("referrer-policy", "no-referrer");',
  '  headers.set("referrer-policy", "origin");',
  'Auth handoff referrer policy'
);

main = replaceOnce(
  main,
  `  const origin = request.headers.get("Origin") || "";\n  const referer = request.headers.get("Referer") || "";\n  const productionOrigin = "https://auth.qsseda.studio";\n  const previewAllowed = env?.AUTH_PREVIEW_ALLOW_WORKERS_DEV === "1";\n  let refererOrigin = "";\n  try { refererOrigin = referer ? new URL(referer).origin : ""; } catch {}\n  const missingOrigin = origin === "" || origin === "null";\n  const trustedProductionHandoff = origin === productionOrigin || (missingOrigin && refererOrigin === productionOrigin);\n  if (!trustedProductionHandoff && !previewAllowed) {\n    return json({ error: "Invalid authentication origin" }, 403);\n  }`,
  `  const origin = request.headers.get("Origin") || "";\n  const referer = request.headers.get("Referer") || "";\n  const fetchSite = (request.headers.get("Sec-Fetch-Site") || "").toLowerCase();\n  const fetchMode = (request.headers.get("Sec-Fetch-Mode") || "").toLowerCase();\n  const fetchDest = (request.headers.get("Sec-Fetch-Dest") || "").toLowerCase();\n  const productionOrigin = "https://auth.qsseda.studio";\n  const previewAllowed = env?.AUTH_PREVIEW_ALLOW_WORKERS_DEV === "1";\n  let refererOrigin = "";\n  try { refererOrigin = referer ? new URL(referer).origin : ""; } catch {}\n  const missingOrigin = origin === "" || origin === "null";\n  const trustedRefererFallback = missingOrigin && refererOrigin === productionOrigin;\n  const trustedSameSiteNavigation = missingOrigin && (fetchSite === "same-site" || fetchSite === "same-origin") && (fetchMode === "navigate" || fetchMode === "") && (fetchDest === "document" || fetchDest === "");\n  const trustedProductionHandoff = origin === productionOrigin || trustedRefererFallback || trustedSameSiteNavigation;\n  if (!trustedProductionHandoff && !previewAllowed) {\n    return json({ error: "Invalid authentication origin" }, 403);\n  }`,
  'Studio Auth handoff origin validation'
);

fs.writeFileSync('auth-worker.js', auth);
fs.writeFileSync('worker.js', main);
console.log('Applied iOS-compatible production Auth handoff validation.');
