import { TEXT } from "../studio/config.js";
import { buildLinks } from "../studio/routing.js";
import { signUpPage } from "../studio/auth-pages.js";
import { osPage } from "../studio/ui-shell.js";
import { hardenBrowserMarkup } from "../studio/browser-security.js";
import { hardenAdminBrowserMarkup } from "../studio/admin-browser-security.js";

const ipInfo = { ip: "203.0.113.10", country: "CN", region: "Test", city: "Test" };
const harden = source => hardenAdminBrowserMarkup(hardenBrowserMarkup(source));

const signupLinks = buildLinks("zh", "/sign-up");
const signup = harden(signUpPage(TEXT.zh, signupLinks, ipInfo));
assertContains(signup, "/api/auth/username-check", "Sign-up page must use the Worker username endpoint");
assertAbsent(signup, "check_registration_username", "Sign-up page leaked the registration RPC name");

const profileLinks = buildLinks("zh", "/profile/details");
const profile = harden(osPage(TEXT.zh, profileLinks, "/profile/details", ipInfo, "Test User"));
for (const endpoint of [
  "/api/account/summary",
  "/api/account/audit",
  "/api/account/device",
  "/api/profile/home",
  "/api/profile/personalization",
  "/api/profile/link",
  "/api/profile/media",
  "/api/admin/",
  "/api/admin/access"
]) {
  assertContains(profile, endpoint, `Profile page must use ${endpoint}`);
}
assertBrowserInternalsHidden(profile, "Profile");

const dashboardLinks = buildLinks("zh", "/dashboard");
const dashboard = harden(osPage(TEXT.zh, dashboardLinks, "/dashboard", ipInfo, "Test User"));
assertContains(dashboard, "/api/account/device", "Dashboard must use the Worker device endpoint from the shared runtime");
assertContains(dashboard, "/api/admin/", "Dashboard shared admin runtime must use the Worker admin endpoint");
assertBrowserInternalsHidden(dashboard, "Dashboard");

const legacyAdminProxy = `
      async function adminRpc(name, params) {
        const sessionResult = await supabaseClient.auth.getSession();
        const accessToken = sessionResult?.data?.session?.access_token || "";
        if (!accessToken) {
          const error = new Error("Session expired");
          return { data: null, error };
        }
        let response;
        let payload;
        try {
          response = await fetch("/api/admin/" + encodeURIComponent(name), {
            method: "POST",
            headers: {
              Authorization: "Bearer " + accessToken,
              "Content-Type": "application/json",
              Accept: "application/json"
            },
            body: JSON.stringify(params || {}),
            cache: "no-store"
          });
          payload = await response.json().catch(() => ({}));
        } catch (requestError) {
          return { data: null, error: requestError };
        }
        if (!response.ok) {
          const error = new Error(payload?.error || "Administrator request failed");
          return { data: null, error };
        }
        const data = payload?.data;
        const error = null;
      }

      if (isAdminPath) {
        const adminSessionResult = await supabaseClient.auth.getSession();
        const adminAccessToken = adminSessionResult?.data?.session?.access_token || "";
        if (!adminAccessToken) {
          adminCheck = { data: false, error: new Error("Session expired") };
        } else {
          try {
            const adminAccessResponse = await fetch("/api/admin/access", {
              headers: { Authorization: "Bearer " + adminAccessToken, Accept: "application/json" },
              cache: "no-store"
            });
            const adminAccessPayload = await adminAccessResponse.json().catch(() => ({}));
            adminCheck = adminAccessResponse.ok
              ? { data: Boolean(adminAccessPayload?.is_admin), error: null }
              : { data: false, error: new Error(adminAccessPayload?.error || "Administrator access check failed") };
          } catch (adminAccessError) {
            adminCheck = { data: false, error: adminAccessError };
          }
        }
      }

      const name = data.user.user_metadata.username || data.user.email;
`;
const hardenedLegacyAdmin = hardenAdminBrowserMarkup(legacyAdminProxy);
assertAbsent(hardenedLegacyAdmin, "adminSessionResult", "Legacy admin access proxy still reads the browser session");
assertAbsent(hardenedLegacyAdmin, "const sessionResult = await supabaseClient.auth.getSession()", "Legacy admin RPC proxy still reads the browser session");
assertAbsent(hardenedLegacyAdmin, 'Authorization: "Bearer " + accessToken', "Legacy admin RPC proxy still sends a browser bearer token");
assertAbsent(hardenedLegacyAdmin, 'Authorization: "Bearer " + adminAccessToken', "Legacy admin access proxy still sends a browser bearer token");
assertContains(hardenedLegacyAdmin, 'credentials: "same-origin"', "Legacy admin proxy was not converted to cookie authentication");

console.log("Browser security markup checks passed.");

function assertBrowserInternalsHidden(source, label) {
  for (const forbidden of [
    'from("profiles")',
    "login_events",
    "user_devices",
    "profile_personalization",
    "profile_links",
    "supabaseClient.storage.from(",
    "supabaseClient.rpc(",
    "get_admin_overview",
    "get_admin_users",
    "get_role_permissions",
    "get_audit_logs",
    "update_user_role",
    "update_user_status",
    "update_role_permissions",
    "adminAccessToken"
  ]) {
    assertAbsent(source, forbidden, `${label} page leaked browser/database detail: ${forbidden}`);
  }
}

function assertContains(source, needle, message) {
  if (!source.includes(needle)) throw new Error(message);
}

function assertAbsent(source, needle, message) {
  if (source.includes(needle)) throw new Error(message);
}
