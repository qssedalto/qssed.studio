import { TEXT } from "../studio/config.js";
import { buildLinks } from "../studio/routing.js";
import { signUpPage } from "../studio/auth-pages.js";
import { osPage } from "../studio/ui-shell.js";
import { hardenBrowserMarkup } from "../studio/browser-security.js";

const ipInfo = { ip: "203.0.113.10", country: "CN", region: "Test", city: "Test" };
const links = buildLinks("zh", "/sign-up");

const signup = hardenBrowserMarkup(signUpPage(TEXT.zh, links, ipInfo));
assertContains(signup, "/api/auth/username-check", "Sign-up page must use the Worker username endpoint");
assertAbsent(signup, "check_registration_username", "Sign-up page leaked the registration RPC name");

const profileLinks = buildLinks("zh", "/profile/details");
const profile = hardenBrowserMarkup(osPage(TEXT.zh, profileLinks, "/profile/details", ipInfo, "Test User"));
for (const endpoint of [
  "/api/account/summary",
  "/api/account/audit",
  "/api/account/device",
  "/api/profile/home",
  "/api/profile/personalization",
  "/api/profile/link",
  "/api/profile/media"
]) {
  assertContains(profile, endpoint, `Profile page must use ${endpoint}`);
}
for (const forbidden of [
  'from("profiles")',
  "login_events",
  "user_devices",
  "profile_personalization",
  "profile_links",
  "supabaseClient.storage.from("
]) {
  assertAbsent(profile, forbidden, `Profile page leaked database detail: ${forbidden}`);
}

console.log("Browser security markup checks passed.");

function assertContains(source, needle, message) {
  if (!source.includes(needle)) throw new Error(message);
}

function assertAbsent(source, needle, message) {
  if (source.includes(needle)) throw new Error(message);
}
