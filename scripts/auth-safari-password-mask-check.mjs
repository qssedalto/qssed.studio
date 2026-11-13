import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../auth-worker.js", import.meta.url), "utf8");
const start = source.indexOf('#loginForm input[type="password"]{');
assert(start >= 0, "Login password field must have its own targeted Safari style.");
const end = source.indexOf("}", start);
const rule = source.slice(start, end + 1);

assert.match(rule, /font-size:16px/, "Prevent Safari focus zoom on the password input.");
assert.match(rule, /-apple-system/, "Use the native Apple system font for masking glyphs.");
assert.doesNotMatch(rule, /-webkit-text-security\s*:/,
  "Never override native password masking with -webkit-text-security.");
assert.doesNotMatch(rule, /(?:font-feature-settings|font-variant|text-rendering|font-kerning)\s*:/,
  "Do not force experimental glyph settings onto a native secure input.");

const input = source.match(/<input id="password"[^>]+>/)?.[0] || "";
assert.match(input, /type="password"/, "Password must remain a secure native input.");
assert.match(input, /autocomplete="current-password"/, "Keep Apple Password AutoFill.");
assert.match(input, /name="password"/, "Do not break the login request.");
assert.match(input, /autocorrect="off"/);
assert.match(input, /autocapitalize="none"/);
assert.match(source, /<input id="email"[^>]+type="email"/,
  "Email field must remain unchanged.");

console.log("AERTEX auth: Safari native login password masking regression checks passed.");
