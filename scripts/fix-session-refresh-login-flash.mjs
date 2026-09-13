import fs from "node:fs";

const file = "studio/ui-shell.js";
let source = fs.readFileSync(file, "utf8");

const startMarker = "    async function hydrateOsUser() {";
const endMarker = "      const name = data.user.user_metadata.username || data.user.user_metadata.display_name || data.user.email;";
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);
if (start < 0 || end < 0) throw new Error("hydrateOsUser markers not found");

const replacement = [
  "    const hadCachedOsUser = ${JSON.stringify(Boolean(cachedOsUserLabel))};",
  "    const authPause = ms => new Promise(resolve => window.setTimeout(resolve, ms));",
  "",
  "    async function readStableOsUser() {",
  "      let sessionResult = null;",
  "      try {",
  "        sessionResult = await supabaseClient.auth.getSession();",
  "      } catch (error) {",
  "        console.warn(\"Studio session restore failed\", error);",
  "      }",
  "      let session = sessionResult?.data?.session || null;",
  "",
  "      // A cached label is only a hint that this browser was recently signed in.",
  "      // It never grants access; it only prevents a transient empty restore from",
  "      // immediately bouncing the user through the login page during refresh.",
  "      if (!session && hadCachedOsUser) {",
  "        await authPause(320);",
  "        try {",
  "          sessionResult = await supabaseClient.auth.getSession();",
  "          session = sessionResult?.data?.session || null;",
  "        } catch (error) {",
  "          console.warn(\"Studio session restore retry failed\", error);",
  "        }",
  "      }",
  "",
  "      if (!session?.user) {",
  "        return { user: null, definiteSignedOut: !sessionResult?.error };",
  "      }",
  "",
  "      let lastError = null;",
  "      for (let attempt = 0; attempt < 2; attempt += 1) {",
  "        try {",
  "          const userResult = await supabaseClient.auth.getUser();",
  "          if (userResult?.data?.user) {",
  "            return { user: userResult.data.user, definiteSignedOut: false };",
  "          }",
  "          lastError = userResult?.error || null;",
  "",
  "          const status = Number(lastError?.status || 0);",
  "          if ((status === 401 || status === 403) && attempt === 0) {",
  "            try {",
  "              const refreshResult = await supabaseClient.auth.refreshSession();",
  "              if (refreshResult?.data?.session?.user) {",
  "                session = refreshResult.data.session;",
  "              } else if (refreshResult?.error) {",
  "                lastError = refreshResult.error;",
  "              }",
  "            } catch (error) {",
  "              lastError = error;",
  "            }",
  "          }",
  "        } catch (error) {",
  "          lastError = error;",
  "        }",
  "",
  "        if (attempt === 0) await authPause(320);",
  "      }",
  "",
  "      const status = Number(lastError?.status || 0);",
  "      if (status === 401 || status === 403) {",
  "        return { user: null, definiteSignedOut: true };",
  "      }",
  "",
  "      // Network or refresh uncertainty is not the same as signing out. Keep the",
  "      // restored local session and let RLS / RPC authorization remain authoritative.",
  "      console.warn(\"Studio user verification is temporarily unavailable; keeping restored session\", lastError);",
  "      return { user: session.user, definiteSignedOut: false, transient: true };",
  "    }",
  "",
  "    async function hydrateOsUser() {",
  "      const authState = await readStableOsUser();",
  "      const data = { user: authState.user };",
  "      let adminCheck = null;",
  "",
  "      if (!data.user) {",
  "        if (!authState.definiteSignedOut) {",
  "          window.setTimeout(() => { void hydrateOsUser(); }, 900);",
  "          return;",
  "        }",
  "        try {",
  "          document.cookie = \"qssed-os-user-name=; Path=/; Max-Age=0; SameSite=Lax; Secure\";",
  "          sessionStorage.removeItem(\"qssed-os-user-name\");",
  "        } catch {}",
  "        try { if (typeof clearProfileUiCaches === \"function\") clearProfileUiCaches(); } catch {}",
  "        try { if (typeof clearAdminUiCaches === \"function\") clearAdminUiCaches(); } catch {}",
  "        window.location.replace(loginUrl);",
  "        return;",
  "      }",
  "",
  "      if (isAdminPath) {",
  "        adminCheck = await supabaseClient.rpc(\"is_admin\");",
  "      }",
  "",
  "      const name = data.user.user_metadata.username || data.user.user_metadata.display_name || data.user.email;"
].join("\n");

source = source.slice(0, start) + replacement + source.slice(end + endMarker.length);

if (!source.includes("const hadCachedOsUser = ${JSON.stringify(Boolean(cachedOsUserLabel))};")) {
  throw new Error("stable session hint was not installed");
}
if (source.includes("const [userResult, adminResult] = await Promise.all([")) {
  throw new Error("old eager auth/admin race still present");
}
if (!source.includes("window.location.replace(loginUrl);")) {
  throw new Error("definitive signed-out redirect missing");
}

fs.writeFileSync(file, source);
