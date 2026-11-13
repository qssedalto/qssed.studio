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
  'font-family:Arial,"Helvetica Neue",Helvetica,sans-serif!important',
  "font-size:16px!important",
  "font-weight:400!important",
  "font-feature-settings:normal!important",
  "letter-spacing:normal!important",
  "-webkit-text-security:disc",
  "-webkit-text-size-adjust:100%"
]) {
  assert(style.includes(required), "Missing Safari password-mask compatibility property: " + required);
}
assert(!style.includes("font-family:Inter"), "Password mask must not inherit a potentially unsuitable Inter fallback");
assert(code.indexOf('input:focus{') < begin, "Password override must follow generic input styling");
assert(code.includes('document.getElementById("password").value'), "Login submission must read the native password input");
assert(!code.includes('type="text" autocomplete="current-password"'), "Never display unmasked credentials by default");
console.log("Auth iPad Safari native password-mask typography contract passed.");
