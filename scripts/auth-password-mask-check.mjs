import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const code = await readFile(new URL("../auth-worker.js", import.meta.url), "utf8");
const nativeField = /<input id="password" name="password" type="password" autocomplete="current-password" autocapitalize="none" autocorrect="off" spellcheck="false" required>/;
assert.match(code, nativeField, "Auth login must keep a native password input, Safari Password AutoFill, and safe keyboard settings");
const begin = code.indexOf('#loginForm input[type="password"]{');
const end = code.indexOf("}", begin);
assert(begin > 0 && end > begin, "Missing iPad Safari password-mask CSS");
const style = code.slice(begin, end + 1);
for (const required of [
  'font-family:-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif',
  "font-size:16px",
  "font-weight:400",
  "letter-spacing:normal"
]) {
  assert(style.includes(required), "Missing minimal native secure-input style: " + required);
}
assert(!/-webkit-text-security\\s*:/.test(style),
  "Native type=password already masks input; CSS must not apply a second masking layer.");
assert(!/(?:font-feature-settings|font-variant|text-rendering|font-kerning)\\s*:/.test(style),
  "Do not force password glyph-rendering features in iPad Safari.");
assert(!style.includes("font-family:Inter"), "Password mask must not inherit a potentially unsuitable Inter fallback");
assert(code.indexOf('input:focus{') < begin, "Password override must follow generic input styling");
assert(code.includes('document.getElementById("password").value'), "Login submission must read the native password input");
assert(!code.includes('type="text" autocomplete="current-password"'), "Never display unmasked credentials by default");
console.log("Auth iPad Safari native password-mask typography contract passed.");
