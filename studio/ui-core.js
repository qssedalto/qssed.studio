import { SUPABASE_URL, SUPABASE_KEY, TEXT } from "./config.js";
import { html } from "./routing.js";

export function baseHead(title) {
  return `
    <title>${title}</title>

    <meta name="viewport"
        content="width=device-width, initial-scale=1.0">
    <script>
      (function () {
        try {
          const savedTheme = localStorage.getItem("qssed-theme");
          const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
          document.documentElement.dataset.theme = savedTheme || (prefersLight ? "light" : "dark");
        } catch {
          document.documentElement.dataset.theme = "dark";
        }
      })();
    </script>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <style>
      :root{
        color-scheme:dark;
        --bg:#101318;
        --bg-soft:#171b22;
        --surface:#191f29;
        --surface-strong:#202735;
        --surface-soft:#141820;
        --card:rgba(25,31,41,0.92);
        --text:#f7f8fb;
        --muted:#a6afbf;
        --quiet:#737f91;
        --border:#303947;
        --border-strong:#465365;
        --primary:#6aa6ff;
        --primary-hover:#8bb9ff;
        --primary-ink:#07111f;
        --secondary:#273141;
        --secondary-hover:#344155;
        --success:#7dd8b4;
        --danger:#ff9a9a;
        --shadow:0 24px 70px rgba(0,0,0,.42);
        --shadow-soft:0 14px 34px rgba(0,0,0,.24);
        --radius:8px;
        --radius-lg:8px;
      }

      :root[data-theme="light"]{
        color-scheme:light;
        --bg:#f4f6f9;
        --bg-soft:#e9edf3;
        --surface:#ffffff;
        --surface-strong:#f8fafc;
        --surface-soft:#eef2f7;
        --card:rgba(255,255,255,0.96);
        --text:#111827;
        --muted:#526071;
        --quiet:#7a8797;
        --border:#d9e0ea;
        --border-strong:#c3cedc;
        --primary:#2459d6;
        --primary-hover:#1d48ad;
        --primary-ink:#ffffff;
        --secondary:#e8edf4;
        --secondary-hover:#dce4ee;
        --success:#0d8a61;
        --danger:#b42318;
        --shadow:0 24px 70px rgba(18, 26, 38, .12);
        --shadow-soft:0 14px 34px rgba(18, 26, 38, .08);
      }

      *{
        box-sizing:border-box;
      }

      html{
        font-size:16px;
        background:var(--bg);
      }

      body{
        margin:0;
        padding:24px;
        min-height:100vh;
        background:
          linear-gradient(180deg, color-mix(in srgb, var(--surface-soft) 34%, transparent) 0%, transparent 42%),
          linear-gradient(135deg, var(--bg) 0%, var(--bg-soft) 100%);
        background-size:100% 100%, 180% 180%;
        color:var(--text);
        display:flex;
        justify-content:center;
        align-items:center;
        font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        letter-spacing:0;
        animation:ambient-pan 18s ease-in-out infinite alternate;
      }

      body::before{
        content:"";
        position:fixed;
        inset:0;
        pointer-events:none;
        background:
          linear-gradient(120deg, transparent 0%, color-mix(in srgb, var(--primary) 8%, transparent) 42%, transparent 76%),
          repeating-linear-gradient(90deg, color-mix(in srgb, var(--border) 22%, transparent) 0 1px, transparent 1px 88px);
        opacity:.36;
        mask-image:linear-gradient(to bottom, rgba(0,0,0,.75), transparent 70%);
        animation:surface-scan 16s linear infinite;
      }

      .card{
        width:100%;
        max-width:560px;
        background:var(--card);
        padding:34px;
        border-radius:var(--radius-lg);
        box-shadow:var(--shadow);
        text-align:left;
        border:1px solid var(--border);
        position:relative;
        overflow:hidden;
        animation:panel-enter .58s cubic-bezier(.2,.8,.2,1) both;
      }

      .card::before{
        content:"";
        position:absolute;
        inset:0 0 auto;
        height:3px;
        background:linear-gradient(90deg, transparent, var(--primary), transparent);
        transform:translateX(-80%);
        animation:accent-pass 1.3s ease .18s both;
      }

      h1{
        margin-top:0;
        margin-bottom:14px;
        font-size:clamp(34px, 5vw, 58px);
        line-height:1.02;
        letter-spacing:0;
        word-break:normal;
        overflow-wrap:anywhere;
        white-space:normal;
        color:var(--text);
      }

      .brand-title{
        white-space:nowrap;
        overflow-wrap:normal;
      }

      p{
        color:var(--muted);
        line-height:1.65;
      }

      input,
      select{
        width:100%;
        margin-top:12px;
        padding:0 14px;
        border-radius:var(--radius);
        border:1px solid var(--border);
        background:var(--surface-soft);
        color:var(--text);
        font-size:15px;
        outline:none;
        transition:border-color .18s ease, box-shadow .18s ease, background .18s ease;
      }

      input:focus,
      select:focus{
        border-color:var(--primary);
        box-shadow:0 0 0 4px color-mix(in srgb, var(--primary) 18%, transparent);
        background:var(--surface);
      }

      button,a.button{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:8px;
        width:100%;
        margin-top:14px;
        padding:0 16px;
        border:1px solid transparent;
        border-radius:var(--radius);
        background:var(--primary);
        color:var(--primary-ink);
        font-size:15px;
        font-weight:700;
        cursor:pointer;
        text-decoration:none;
        transition:background .18s ease, transform .18s ease, border-color .18s ease, box-shadow .18s ease;
      }

      input,
      select,
      button,
      a.button{
        min-height:52px;
      }

      button:hover,
      a.button:hover{
        background:var(--primary-hover);
        transform:translateY(-1px);
        box-shadow:var(--shadow-soft);
      }

      button:active,
      a.button:active{
        transform:translateY(0) scale(.985);
      }

      .secondary{
        background:var(--secondary);
        color:var(--text);
        border-color:var(--border);
      }

      .secondary:hover{
        background:var(--secondary-hover);
      }

      #message{
        margin-top:15px;
        color:var(--primary);
        font-size:14px;
        word-break:break-word;
      }
      .checkbox-row{
        display:flex;
        align-items:center;
        gap:10px;
        margin-top:14px;
        color:var(--muted);
        font-size:14px;
        text-align:left;
      }

      .checkbox-row input{
        width:auto;
        min-height:auto;
        margin:0;
      }

      .choice-row{
        display:flex;
        align-items:center;
        gap:10px;
        margin-top:12px;
        padding:12px;
        border:1px solid var(--border);
        border-radius:var(--radius);
        background:var(--surface-soft);
        color:var(--text);
        text-align:left;
      }

      .choice-row input{
        width:auto;
        min-height:auto;
        margin:0;
      }

      .birthdate-grid{
        display:grid;
        grid-template-columns:repeat(3, minmax(0, 1fr));
        gap:12px;
      }

      .birthdate-grid select{
        margin-top:12px;
      }

      @media (max-width: 560px){
        body{
          padding:14px;
        }

        .card{
          padding:24px 18px;
        }

        .birthdate-grid{
          grid-template-columns:1fr;
          gap:0;
        }
      }

      .theme-toggle{
        position:fixed;
        top:18px;
        right:18px;
        z-index:20;
        width:44px;
        min-height:44px;
        margin:0;
        padding:0;
        border-radius:var(--radius);
        border:1px solid var(--border);
        background:var(--card);
        color:var(--text);
        box-shadow:var(--shadow-soft);
      }

      .language-toggle{
        position:fixed;
        top:18px;
        right:68px;
        z-index:20;
        display:flex;
        align-items:center;
        justify-content:center;
        width:44px;
        height:44px;
        min-width:44px;
        min-height:44px;
        margin:0;
        padding:0;
        border-radius:var(--radius);
        border:1px solid var(--border);
        background:var(--card);
        color:var(--text);
        box-shadow:var(--shadow-soft);
        text-decoration:none;
        font-size:12px;
        line-height:1;
        font-weight:850;
        letter-spacing:0;
      }

      .theme-toggle:hover{
        background:var(--surface-strong);
      }

      .language-toggle:hover{
        background:var(--surface-strong);
        transform:translateY(-1px);
      }

      .theme-toggle:active{
        transform:rotate(12deg) scale(.96);
      }

      .theme-toggle .theme-sun,
      :root[data-theme="light"] .theme-toggle .theme-moon{
        display:none;
      }

      :root[data-theme="light"] .theme-toggle .theme-sun{
        display:inline;
      }

      :root.theme-switching body,
      :root.theme-switching .card{
        transition:background .28s ease, color .28s ease, border-color .28s ease, box-shadow .28s ease;
      }

      @keyframes panel-enter{
        from{
          opacity:0;
          transform:translateY(16px) scale(.985);
          filter:blur(8px);
        }
        to{
          opacity:1;
          transform:translateY(0) scale(1);
          filter:blur(0);
        }
      }

      @keyframes accent-pass{
        from{ transform:translateX(-86%); opacity:.35; }
        to{ transform:translateX(86%); opacity:.9; }
      }

      @keyframes ambient-pan{
        from{ background-position:0% 0%, 0% 50%; }
        to{ background-position:0% 0%, 100% 50%; }
      }

      @keyframes surface-scan{
        from{ transform:translateX(-36px); }
        to{ transform:translateX(36px); }
      }

      @keyframes item-rise{
        from{
          opacity:0;
          transform:translateY(12px);
        }
        to{
          opacity:1;
          transform:translateY(0);
        }
      }

      @media (prefers-reduced-motion: reduce){
        *,
        *::before,
        *::after{
          animation-duration:.001ms !important;
          animation-iteration-count:1 !important;
          scroll-behavior:auto !important;
          transition-duration:.001ms !important;
        }
      }

      @media (max-width: 560px){
        .theme-toggle{
          top:12px;
          right:12px;
        }

        .language-toggle{
          top:12px;
          right:62px;
          min-width:62px;
        }
      }

      /* APPLE_DESIGN_SYSTEM_V2_SHARED */
/* APPLE_DESIGN_SYSTEM_V2 — shared surfaces */
:root{
  color-scheme:dark;
  --bg:#0b0b0d;
  --bg-soft:#141416;
  --surface:#1c1c1e;
  --surface-strong:#2c2c2e;
  --surface-soft:rgba(118,118,128,.14);
  --card:rgba(28,28,30,.74);
  --text:#f5f5f7;
  --muted:#a1a1a6;
  --quiet:#6e6e73;
  --border:rgba(255,255,255,.105);
  --border-strong:rgba(255,255,255,.19);
  --primary:#0a84ff;
  --primary-hover:#409cff;
  --primary-ink:#fff;
  --secondary:rgba(118,118,128,.18);
  --secondary-hover:rgba(118,118,128,.28);
  --success:#32d74b;
  --danger:#ff453a;
  --warning:#ffd60a;
  --shadow:0 30px 80px rgba(0,0,0,.34);
  --shadow-soft:0 12px 34px rgba(0,0,0,.18);
  --radius:14px;
  --radius-lg:26px;
  --hairline:rgba(255,255,255,.09);
  --glass:rgba(28,28,30,.68);
  --glass-heavy:rgba(24,24,26,.82);
  --fill:rgba(118,118,128,.16);
}
:root[data-theme="light"]{
  color-scheme:light;
  --bg:#f5f5f7;
  --bg-soft:#ffffff;
  --surface:#ffffff;
  --surface-strong:#f2f2f7;
  --surface-soft:rgba(118,118,128,.10);
  --card:rgba(255,255,255,.72);
  --text:#1d1d1f;
  --muted:#6e6e73;
  --quiet:#8e8e93;
  --border:rgba(60,60,67,.13);
  --border-strong:rgba(60,60,67,.22);
  --primary:#007aff;
  --primary-hover:#1687ff;
  --primary-ink:#fff;
  --secondary:rgba(118,118,128,.12);
  --secondary-hover:rgba(118,118,128,.20);
  --success:#248a3d;
  --danger:#d70015;
  --warning:#b25000;
  --shadow:0 28px 72px rgba(0,0,0,.13);
  --shadow-soft:0 10px 30px rgba(0,0,0,.075);
  --hairline:rgba(60,60,67,.12);
  --glass:rgba(255,255,255,.72);
  --glass-heavy:rgba(247,247,249,.86);
  --fill:rgba(118,118,128,.10);
}
*{-webkit-tap-highlight-color:transparent}
html{font-size:16px;background:var(--bg);font-optical-sizing:auto}
body{
  padding:clamp(16px,3vw,32px);
  background:
    radial-gradient(900px 560px at 15% -5%,color-mix(in srgb,var(--primary) 12%,transparent),transparent 64%),
    radial-gradient(720px 520px at 96% 104%,color-mix(in srgb,#af52de 8%,transparent),transparent 68%),
    var(--bg);
  background-size:auto;
  color:var(--text);
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display","Segoe UI",system-ui,sans-serif;
  letter-spacing:0;
  animation:none;
}
body::before{
  background:none!important;
  opacity:0!important;
  animation:none!important;
}
.card{
  max-width:560px;
  padding:32px;
  border:1px solid var(--border);
  border-radius:28px;
  background:var(--glass);
  -webkit-backdrop-filter:blur(30px) saturate(180%);
  backdrop-filter:blur(30px) saturate(180%);
  box-shadow:var(--shadow);
  overflow:visible;
  animation:apple-materialize .34s cubic-bezier(.2,.8,.2,1) both;
}
.card::before{display:none}
h1,.brand-title{
  margin-bottom:12px;
  font-weight:720;
  letter-spacing:-.035em;
  line-height:1.04;
}
h1{font-size:clamp(34px,5vw,54px)}
p{color:var(--muted);line-height:1.55}
input,select{
  min-height:50px;
  margin-top:12px;
  padding:0 14px;
  border:1px solid transparent;
  border-radius:13px;
  background:var(--fill);
  color:var(--text);
  font:inherit;
  font-size:15px;
  box-shadow:inset 0 0 0 1px var(--border);
  transition:background .16s ease,border-color .16s ease,box-shadow .16s ease;
}
input:hover,select:hover{background:color-mix(in srgb,var(--fill) 82%,var(--surface) 18%)}
input:focus,select:focus{
  border-color:color-mix(in srgb,var(--primary) 70%,transparent);
  background:color-mix(in srgb,var(--surface) 88%,transparent);
  box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 16%,transparent);
}
button,a.button{
  min-height:50px;
  margin-top:14px;
  padding:0 16px;
  border:0;
  border-radius:13px;
  background:var(--primary);
  color:var(--primary-ink);
  font:inherit;
  font-size:15px;
  font-weight:680;
  box-shadow:none;
  touch-action:manipulation;
  transition:filter .14s ease,background .14s ease,transform .10s ease,opacity .14s ease;
}
button:hover,a.button:hover{background:var(--primary);filter:brightness(1.06);transform:none;box-shadow:none}
button:active,a.button:active{transform:scale(.975);filter:brightness(.97)}
button:disabled,a.button[aria-disabled="true"]{opacity:.42;cursor:not-allowed;filter:none;transform:none}
.secondary{
  background:var(--secondary)!important;
  color:var(--text)!important;
  border:0!important;
}
.secondary:hover{background:var(--secondary-hover)!important}
.choice-row{
  min-height:50px;
  padding:12px 14px;
  border:1px solid transparent;
  border-radius:14px;
  background:var(--fill);
  box-shadow:inset 0 0 0 1px var(--border);
  transition:background .14s ease,box-shadow .14s ease,transform .10s ease;
}
.choice-row:hover{background:var(--secondary)}
.choice-row:active{transform:scale(.99)}
.checkbox-row{color:var(--muted)}
input[type="radio"],input[type="checkbox"]{accent-color:var(--primary)}
.theme-toggle,.language-toggle{
  top:18px;
  width:44px;
  height:44px;
  min-width:44px;
  min-height:44px;
  margin:0;
  padding:0;
  border:1px solid color-mix(in srgb,var(--border-strong) 72%,transparent);
  border-radius:50%;
  background:var(--glass);
  color:var(--text);
  -webkit-backdrop-filter:blur(20px) saturate(180%);
  backdrop-filter:blur(20px) saturate(180%);
  box-shadow:0 8px 28px rgba(0,0,0,.12),inset 0 1px 0 color-mix(in srgb,#fff 32%,transparent);
}
.theme-toggle{right:18px}
.language-toggle{right:70px;font-size:11px;font-weight:720}
.theme-toggle:hover,.language-toggle:hover{background:color-mix(in srgb,var(--glass) 84%,var(--surface-strong) 16%);transform:none}
.theme-toggle:active,.language-toggle:active{transform:scale(.92)}
#message{color:var(--primary);font-size:13px;line-height:1.5}
@keyframes apple-materialize{
  from{opacity:0;transform:scale(.985) translateY(8px);filter:blur(4px)}
  to{opacity:1;transform:none;filter:none}
}
@media (max-width:560px){
  body{padding:12px}
  .card{padding:24px 18px;border-radius:24px}
  .theme-toggle,.language-toggle{top:12px}
  .theme-toggle{right:12px}.language-toggle{right:62px}
}
@media (prefers-reduced-motion:reduce){
  .card{animation:none!important}
  button,a.button,.choice-row,.theme-toggle,.language-toggle{transition:opacity .12s ease,background .12s ease,color .12s ease!important}
}
@media (prefers-reduced-transparency:reduce){
  .card,.theme-toggle,.language-toggle{background:var(--surface)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
}
@media (prefers-contrast:more){
  .card,.theme-toggle,.language-toggle,input,select,.choice-row{border-color:var(--border-strong)!important}
}
</style>
  `;
}

export function supabaseScript() {
  return `
    <script>
      const supabaseClient = supabase.createClient(
        "${SUPABASE_URL}",
        "${SUPABASE_KEY}"
      );
    </script>
  `;
}

export function auditClientScript(ipInfo) {
  return `
    <script>
      const auditRequestContext = ${JSON.stringify({
        ip_address: ipInfo?.ip || "",
        country: ipInfo?.country || "",
        region: ipInfo?.region || "",
        city: ipInfo?.city || ""
      })};

      function formatAuditDate(value) {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const hh = String(date.getHours()).padStart(2, "0");
        const min = String(date.getMinutes()).padStart(2, "0");
        return yyyy + "-" + mm + "-" + dd + " " + hh + ":" + min;
      }

      function auditEscape(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
      }

      function getAuditDeviceId() {
        const key = "qssed-device-id";
        let id = localStorage.getItem(key);
        if (!id) {
          id = crypto.randomUUID ? crypto.randomUUID() : "device-" + Date.now() + "-" + Math.random().toString(16).slice(2);
          localStorage.setItem(key, id);
        }
        return id;
      }

      function parseAuditUserAgent() {
        const ua = navigator.userAgent || "";
        const browser = ua.includes("Edg/") ? "Edge" : ua.includes("Chrome/") ? "Chrome" : ua.includes("Firefox/") ? "Firefox" : ua.includes("Safari/") ? "Safari" : "Unknown";
        const os = ua.includes("Windows") ? "Windows" : ua.includes("Mac OS") ? "macOS" : ua.includes("Android") ? "Android" : ua.includes("iPhone") || ua.includes("iPad") ? "iOS" : ua.includes("Linux") ? "Linux" : "Unknown";
        const device_type = /Mobile|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop";
        return { user_agent: ua, browser, os, device_type, device_name: browser + " on " + os };
      }

      async function updateCurrentDevice(user) {
        if (!user) return null;
        const device = parseAuditUserAgent();
        const device_id = getAuditDeviceId();
        const payload = {
          user_id: user.id,
          device_id,
          device_name: device.device_name,
          browser: device.browser,
          os: device.os,
          device_type: device.device_type,
          last_ip: auditRequestContext.ip_address,
          country: auditRequestContext.country,
          region: auditRequestContext.region,
          city: auditRequestContext.city,
          last_seen_at: new Date().toISOString()
        };

        const { data: existing } = await supabaseClient
          .from("user_devices")
          .select("id, first_seen_at")
          .eq("device_id", device_id)
          .eq("user_id", user.id)
          .maybeSingle();

        const { error } = existing
          ? await supabaseClient.from("user_devices").update(payload).eq("id", existing.id)
          : await supabaseClient.from("user_devices").insert(payload);

        if (error) {
          console.error("Device persistence failed", error.message);
          return null;
        }
        return { ...payload, first_seen_at: existing?.first_seen_at || new Date().toISOString() };
      }

      function getLastSignIn(user) {
        const identityTime = (user.identities || [])
          .map(identity => identity.last_sign_in_at)
          .filter(Boolean)
          .sort()
          .at(-1);
        return user.last_sign_in_at || identityTime || null;
      }

      const PROFILE_SUMMARY_CACHE_KEY = "qssed-profile-summary-v2";
      const PROFILE_AUDIT_CACHE_KEY = "qssed-profile-audit-v2";

      function readProfileCache(key) {
        try {
          const raw = sessionStorage.getItem(key);
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      }

      function writeProfileCache(key, value) {
        try {
          sessionStorage.setItem(key, JSON.stringify(value));
        } catch {}
      }

      function clearProfileUiCaches() {
        try {
          sessionStorage.removeItem(PROFILE_SUMMARY_CACHE_KEY);
          sessionStorage.removeItem(PROFILE_AUDIT_CACHE_KEY);
        } catch {}
      }

      function renderProfileSummarySnapshot(snapshot) {
        if (!snapshot) return;
        const root = document.getElementById("profile-summary");
        if (!root) return;
        const avatar = document.getElementById("profile-avatar");
        const name = document.getElementById("profile-display-name");
        const email = document.getElementById("profile-email");
        const tags = document.getElementById("profile-tags");
        if (avatar) {
          const fallback = String(snapshot.displayName || "User").slice(0, 1).toUpperCase();
          avatar.innerHTML = snapshot.avatar_url ? '<img src="' + auditEscape(snapshot.avatar_url) + '" alt="">' : auditEscape(fallback);
        }
        if (name) name.innerText = snapshot.displayName || "User";
        if (email) email.innerText = snapshot.email || "-";
        if (tags) {
          const values = [snapshot.role, snapshot.status].filter(Boolean);
          tags.innerHTML = values.map(value => "<span>" + auditEscape(value) + "</span>").join("");
        }
      }

      function buildAuditFingerprint(user, events, devices) {
        const eventKeys = events.map(event => [
          event.id || "",
          event.created_at || "",
          Boolean(event.success),
          event.risk_level || ""
        ]).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
        const deviceKeys = devices.map(device => [
          device.id || "",
          device.device_id || "",
          device.revoked_at || "",
          device.browser || "",
          device.os || "",
          device.device_type || ""
        ]).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
        return JSON.stringify({
          user: [user?.id || "", user?.email || "", user?.created_at || "", getLastSignIn(user) || ""],
          events: eventKeys,
          devices: deviceKeys
        });
      }

      function restoreProfileUiCaches() {
        const summary = readProfileCache(PROFILE_SUMMARY_CACHE_KEY);
        if (summary) renderProfileSummarySnapshot(summary);

        const audit = readProfileCache(PROFILE_AUDIT_CACHE_KEY);
        if (!audit || !audit.user) return;
        if (document.getElementById("audit-created-at")) {
          renderAccountAudit(audit.user, audit.events || [], audit.devices || [], false, false);
        }
        if (document.getElementById("audit-current-device")) {
          renderSecurityAudit(audit.events || [], audit.devices || [], false, false);
        }
      }

      async function hydrateProfileSummary(user) {
        const root = document.getElementById("profile-summary");
        if (!root || !user) return;

        const { data: profile, error: profileError } = await supabaseClient
          .from("profiles")
          .select("username, display_name, avatar_url, role, status")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile query failed", profileError.message);
          if (readProfileCache(PROFILE_SUMMARY_CACHE_KEY)) return;
        }

        const displayName =
          profile?.display_name ||
          profile?.username ||
          user.user_metadata?.display_name ||
          user.user_metadata?.username ||
          user.email ||
          "User";

        const snapshot = {
          user_id: user.id,
          displayName,
          email: user.email || "",
          role: profile?.role || "",
          status: profile?.status || "",
          avatar_url: profile?.avatar_url || ""
        };
        renderProfileSummarySnapshot(snapshot);
        writeProfileCache(PROFILE_SUMMARY_CACHE_KEY, snapshot);
      }

      /* PROFILE_HOME_V3 */
      const PROFILE_HOME_CACHE_PREFIX = "qssed-profile-home-v3:";
      let profileHomeState = { user: null, personalization: null, links: [], editingLinkId: null };

      function profileHomeIsZh() { return location.pathname.startsWith("/zh-cn/"); }
      function profileHomeEscape(value) { return auditEscape(value == null ? "" : String(value)); }
      function profileHomeCacheKey(userId) { return PROFILE_HOME_CACHE_PREFIX + String(userId || ""); }
      function profileHomeStatusLabel(kind) {
        const zh = profileHomeIsZh();
        const labels = zh ? { online:"在线", focus:"专注中", busy:"忙碌", away:"离开", offline:"隐身" } : { online:"Online", focus:"Focus", busy:"Busy", away:"Away", offline:"Offline" };
        return labels[kind] || labels.online;
      }
      function readProfileHomeCache(userId) {
        try { const raw = sessionStorage.getItem(profileHomeCacheKey(userId)); return raw ? JSON.parse(raw) : null; } catch { return null; }
      }
      function writeProfileHomeCache() {
        try { if (profileHomeState.user?.id) sessionStorage.setItem(profileHomeCacheKey(profileHomeState.user.id), JSON.stringify({ personalization: profileHomeState.personalization, links: profileHomeState.links })); } catch {}
      }
      function normalizeProfilePersonalization(row, userId) {
        return {
          user_id: userId,
          signature: row?.signature || "",
          bio: row?.bio || "",
          location: row?.location || "",
          status_kind: row?.status_kind || "online",
          status_text: row?.status_text || "",
          status_emoji: row?.status_emoji || "✨",
          interests: Array.isArray(row?.interests) ? row.interests.slice(0,12) : [],
          cover_style: row?.cover_style || "aurora",
          background_url: row?.background_url || ""
        };
      }
      function renderProfileHome() {
        if (!document.querySelector("[data-profile-home]")) return;
        const p = profileHomeState.personalization || normalizeProfilePersonalization(null, profileHomeState.user?.id);
        const cover = document.getElementById("profile-cover");
        if (cover) {
          cover.dataset.coverStyle = p.cover_style;
          cover.style.backgroundImage = p.background_url ? 'linear-gradient(rgba(0,0,0,.08),rgba(0,0,0,.08)),url("' + p.background_url.replace(/"/g,"%22") + '")' : "";
          cover.classList.toggle("has-custom-background", Boolean(p.background_url));
        }
        const signature = document.getElementById("profile-signature");
        if (signature) signature.textContent = p.signature || (profileHomeIsZh() ? "还没有设置个性签名。" : "No signature yet.");
        const bio = document.getElementById("profile-bio");
        if (bio) bio.textContent = p.bio || (profileHomeIsZh() ? "还没有填写个人介绍。" : "No bio yet.");
        const presence = document.getElementById("profile-presence");
        if (presence) presence.textContent = (p.status_emoji || "✨") + " " + (p.status_text || profileHomeStatusLabel(p.status_kind));
        const location = document.getElementById("profile-location");
        if (location) { location.textContent = p.location ? "⌖ " + p.location : ""; location.hidden = !p.location; }
        const interests = document.getElementById("profile-interests");
        if (interests) interests.innerHTML = p.interests.length ? p.interests.map(item => '<span>' + profileHomeEscape(item) + '</span>').join("") : '<span class="profile-interest-empty">' + (profileHomeIsZh() ? "添加兴趣标签，让主页更像你。" : "Add interests to make this profile yours.") + '</span>';
        renderProfileLinks();
      }
      function profileLinkIcon(title, category) {
        const t=String(title||"").toLowerCase();
        if(t.includes("qq")) return "Q";
        if(t.includes("github")) return "⌘";
        if(t.includes("bilibili")||t.includes("b站")) return "B";
        if(t==="x"||t.includes("twitter")) return "𝕏";
        if(category==="developer") return "</>";
        if(category==="contact") return "@";
        if(category==="site") return "⌂";
        return "↗";
      }
      function renderProfileLinks() {
        const list=document.getElementById("profile-link-list"); if(!list) return;
        const links=[...(profileHomeState.links||[])].sort((a,b)=>Number(b.pinned)-Number(a.pinned)||Number(a.sort_order||0)-Number(b.sort_order||0)||String(a.created_at||"").localeCompare(String(b.created_at||"")));
        if(!links.length){ list.innerHTML='<div class="profile-link-empty"><strong>'+(profileHomeIsZh()?"还没有链接":"No links yet")+'</strong><span>'+(profileHomeIsZh()?"添加 QQ、GitHub、个人网站或其他常用入口。":"Add QQ, GitHub, your website, or any other destination.")+'</span></div>'; return; }
        list.innerHTML=links.map(link => '<article class="profile-link-item">'+
          '<a class="profile-link-main" href="'+profileHomeEscape(link.url)+'" target="_blank" rel="noopener noreferrer"><span class="profile-link-icon">'+profileHomeEscape(profileLinkIcon(link.title,link.category))+'</span><span class="profile-link-copy"><strong>'+profileHomeEscape(link.title)+(link.pinned?' <em>★</em>':'')+'</strong><small>'+profileHomeEscape(link.note || link.url)+'</small></span><span class="profile-link-open">↗</span></a>'+
          '<div class="profile-link-actions"><button type="button" data-profile-link-edit="'+profileHomeEscape(link.id)+'">'+(profileHomeIsZh()?"编辑":"Edit")+'</button><button type="button" data-profile-link-delete="'+profileHomeEscape(link.id)+'">'+(profileHomeIsZh()?"删除":"Delete")+'</button></div>'+
        '</article>').join("");
        list.querySelectorAll("[data-profile-link-edit]").forEach(button=>button.addEventListener("click",()=>openProfileLinkSheet(button.dataset.profileLinkEdit)));
        list.querySelectorAll("[data-profile-link-delete]").forEach(button=>button.addEventListener("click",()=>deleteProfileLink(button.dataset.profileLinkDelete)));
      }
      function openProfileSheet() {
        const sheet=document.getElementById("profile-edit-sheet"), backdrop=document.getElementById("profile-sheet-backdrop"); if(!sheet||!backdrop) return;
        const p=profileHomeState.personalization || normalizeProfilePersonalization(null, profileHomeState.user?.id);
        document.getElementById("profile-readonly-name").value=document.getElementById("profile-display-name")?.textContent || "";
        const avatarPreview=document.getElementById("profile-avatar-preview"); if(avatarPreview) avatarPreview.innerHTML=document.getElementById("profile-avatar")?.innerHTML || "";
        const backgroundPreview=document.getElementById("profile-background-preview"); if(backgroundPreview){ backgroundPreview.dataset.coverStyle=p.cover_style; backgroundPreview.style.backgroundImage=p.background_url?'url("'+p.background_url.replace(/"/g,"%22")+'")':""; backgroundPreview.classList.toggle("has-custom-background",Boolean(p.background_url)); }
        document.getElementById("profile-edit-signature").value=p.signature;
        document.getElementById("profile-edit-bio").value=p.bio;
        document.getElementById("profile-edit-location").value=p.location;
        document.getElementById("profile-edit-status-kind").value=p.status_kind;
        document.getElementById("profile-edit-status-emoji").value=p.status_emoji;
        document.getElementById("profile-edit-status-text").value=p.status_text;
        document.getElementById("profile-edit-interests").value=p.interests.join(", ");
        document.querySelectorAll("[data-cover-choice]").forEach(button=>button.classList.toggle("is-selected",button.dataset.coverChoice===p.cover_style));
        document.documentElement.classList.add("profile-sheet-open"); backdrop.hidden=false; requestAnimationFrame(()=>{backdrop.classList.add("is-visible");sheet.classList.add("is-open");sheet.setAttribute("aria-hidden","false");});
      }
      function closeProfileSheets() {
        document.documentElement.classList.remove("profile-sheet-open"); const backdrop=document.getElementById("profile-sheet-backdrop"); document.querySelectorAll(".profile-sheet.is-open").forEach(sheet=>{sheet.classList.remove("is-open");sheet.setAttribute("aria-hidden","true")}); if(backdrop){backdrop.classList.remove("is-visible");setTimeout(()=>{if(!document.querySelector(".profile-sheet.is-open")) backdrop.hidden=true},220);}
      }
      async function saveProfilePersonalization() {
        if(!profileHomeState.user) return;
        const button=document.getElementById("profile-save-button"); button.disabled=true; button.textContent=profileHomeIsZh()?"正在保存…":"Saving…";
        const interests=document.getElementById("profile-edit-interests").value.split(/[,，]/).map(x=>x.trim()).filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).slice(0,12);
        const cover=document.querySelector("[data-cover-choice].is-selected")?.dataset.coverChoice || "aurora";
        const payload={ user_id:profileHomeState.user.id, signature:document.getElementById("profile-edit-signature").value.trim(), bio:document.getElementById("profile-edit-bio").value.trim(), location:document.getElementById("profile-edit-location").value.trim(), status_kind:document.getElementById("profile-edit-status-kind").value, status_emoji:document.getElementById("profile-edit-status-emoji").value.trim()||"✨", status_text:document.getElementById("profile-edit-status-text").value.trim(), interests, cover_style:cover, background_url:profileHomeState.personalization?.background_url || "" };
        const {data,error}=await supabaseClient.from("profile_personalization").upsert(payload,{onConflict:"user_id"}).select().single();
        button.disabled=false; button.textContent=profileHomeIsZh()?"保存":"Save";
        if(error){ console.error("Profile personalization save failed",error.message); alert(profileHomeIsZh()?"保存失败，请稍后重试。":"Could not save your profile. Please try again."); return; }
        profileHomeState.personalization=normalizeProfilePersonalization(data,profileHomeState.user.id); writeProfileHomeCache(); renderProfileHome(); closeProfileSheets();
      }
      function openProfileLinkSheet(id) {
        const sheet=document.getElementById("profile-link-sheet"), backdrop=document.getElementById("profile-sheet-backdrop"); if(!sheet||!backdrop) return;
        const link=(profileHomeState.links||[]).find(item=>item.id===id)||null; profileHomeState.editingLinkId=link?.id||null;
        document.getElementById("profile-link-sheet-title").textContent=link?(profileHomeIsZh()?"编辑链接":"Edit link"):(profileHomeIsZh()?"添加链接":"Add link");
        document.getElementById("profile-link-id").value=link?.id||"";
        document.getElementById("profile-link-title").value=link?.title||"";
        document.getElementById("profile-link-url").value=link?.url||"";
        document.getElementById("profile-link-category").value=link?.category||"social";
        document.getElementById("profile-link-note").value=link?.note||"";
        document.getElementById("profile-link-pinned").checked=Boolean(link?.pinned);
        document.documentElement.classList.add("profile-sheet-open"); backdrop.hidden=false; requestAnimationFrame(()=>{backdrop.classList.add("is-visible");sheet.classList.add("is-open");sheet.setAttribute("aria-hidden","false");document.getElementById("profile-link-title").focus();});
      }
      async function saveProfileLink() {
        if(!profileHomeState.user) return;
        const button=document.getElementById("profile-link-save"), title=document.getElementById("profile-link-title").value.trim(), url=document.getElementById("profile-link-url").value.trim();
        if(!title || !/^https?:\\/\\//i.test(url)){ alert(profileHomeIsZh()?"请填写名称，并输入以 http:// 或 https:// 开头的有效链接。":"Enter a title and a valid URL beginning with http:// or https://."); return; }
        button.disabled=true;
        const payload={ user_id:profileHomeState.user.id,title,url,category:document.getElementById("profile-link-category").value,note:document.getElementById("profile-link-note").value.trim(),pinned:document.getElementById("profile-link-pinned").checked,sort_order:profileHomeState.editingLinkId?((profileHomeState.links.find(x=>x.id===profileHomeState.editingLinkId)?.sort_order)||0):(profileHomeState.links.length*10)};
        let result;
        if(profileHomeState.editingLinkId) result=await supabaseClient.from("profile_links").update(payload).eq("id",profileHomeState.editingLinkId).select().single();
        else result=await supabaseClient.from("profile_links").insert(payload).select().single();
        button.disabled=false;
        if(result.error){console.error("Profile link save failed",result.error.message);alert(profileHomeIsZh()?"链接保存失败。":"Could not save the link.");return;}
        if(profileHomeState.editingLinkId) profileHomeState.links=profileHomeState.links.map(x=>x.id===profileHomeState.editingLinkId?result.data:x); else profileHomeState.links.push(result.data);
        writeProfileHomeCache(); renderProfileLinks(); closeProfileSheets();
      }
      async function deleteProfileLink(id) {
        const link=(profileHomeState.links||[]).find(item=>item.id===id); if(!link) return;
        if(!confirm((profileHomeIsZh()?"删除“":"Delete “")+link.title+"”"+(profileHomeIsZh()?"？":"?"))) return;
        const {error}=await supabaseClient.from("profile_links").delete().eq("id",id);
        if(error){alert(profileHomeIsZh()?"删除失败。":"Could not delete the link.");return;}
        profileHomeState.links=profileHomeState.links.filter(item=>item.id!==id); writeProfileHomeCache(); renderProfileLinks();
      }
      function profileMediaExtension(file) {
        const map={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
        return map[file?.type] || "";
      }
      async function uploadProfileMedia(file, kind) {
        if(!profileHomeState.user || !file) return null;
        const max=kind==="avatar"?5*1024*1024:8*1024*1024;
        const ext=profileMediaExtension(file);
        if(!ext || file.size>max){ alert(profileHomeIsZh()?(kind==="avatar"?"头像需为 JPG、PNG 或 WebP，且不超过 5 MB。":"背景需为 JPG、PNG 或 WebP，且不超过 8 MB。"):(kind==="avatar"?"Profile photo must be JPG, PNG, or WebP and no larger than 5 MB.":"Background must be JPG, PNG, or WebP and no larger than 8 MB.")); return null; }
        const bucket=kind==="avatar"?"avatars":"profile-media";
        const objectPath=profileHomeState.user.id+"/"+kind+"."+ext;
        const {error}=await supabaseClient.storage.from(bucket).upload(objectPath,file,{upsert:true,contentType:file.type,cacheControl:"3600"});
        if(error){console.error("Profile media upload failed",error.message);alert(profileHomeIsZh()?"图片上传失败，请稍后重试。":"Image upload failed. Please try again.");return null;}
        const {data}=supabaseClient.storage.from(bucket).getPublicUrl(objectPath);
        return data?.publicUrl ? data.publicUrl+"?v="+Date.now() : null;
      }
      async function changeProfileAvatar(file) {
        const url=await uploadProfileMedia(file,"avatar"); if(!url) return;
        const {error}=await supabaseClient.from("profiles").update({avatar_url:url,updated_at:new Date().toISOString()}).eq("id",profileHomeState.user.id);
        if(error){console.error("Avatar profile update failed",error.message);alert(profileHomeIsZh()?"头像已上传，但账号资料更新失败。":"The photo uploaded, but your profile could not be updated.");return;}
        const avatar=document.getElementById("profile-avatar"); if(avatar) avatar.innerHTML='<img src="'+profileHomeEscape(url)+'" alt="">';
        const preview=document.getElementById("profile-avatar-preview"); if(preview) preview.innerHTML='<img src="'+profileHomeEscape(url)+'" alt="">';
      }
      async function changeProfileBackground(file) {
        const url=await uploadProfileMedia(file,"background"); if(!url) return;
        profileHomeState.personalization=normalizeProfilePersonalization({...profileHomeState.personalization,background_url:url},profileHomeState.user.id);
        const {data,error}=await supabaseClient.from("profile_personalization").upsert(profileHomeState.personalization,{onConflict:"user_id"}).select().single();
        if(error){console.error("Background save failed",error.message);alert(profileHomeIsZh()?"背景保存失败。":"Could not save the background.");return;}
        profileHomeState.personalization=normalizeProfilePersonalization(data,profileHomeState.user.id);writeProfileHomeCache();renderProfileHome();openProfileSheet();
      }
      async function clearProfileBackground() {
        if(!profileHomeState.user) return;
        profileHomeState.personalization=normalizeProfilePersonalization({...profileHomeState.personalization,background_url:""},profileHomeState.user.id);
        const {data,error}=await supabaseClient.from("profile_personalization").upsert(profileHomeState.personalization,{onConflict:"user_id"}).select().single();
        if(error){alert(profileHomeIsZh()?"无法清除背景。":"Could not clear the background.");return;}
        profileHomeState.personalization=normalizeProfilePersonalization(data,profileHomeState.user.id);writeProfileHomeCache();renderProfileHome();openProfileSheet();
      }
      function bindCurrentPageNoReload() {
        document.querySelectorAll(".os-nav a[href]").forEach(link=>{
          const target=new URL(link.href,location.href);
          if(target.pathname!==location.pathname)return;
          link.setAttribute("aria-current","page");
          link.dataset.currentPage="true";
          link.addEventListener("click",event=>event.preventDefault());
        });
      }
      function bindProfileHome() {
        const modalBackdrop=document.getElementById("profile-sheet-backdrop"); if(modalBackdrop&&modalBackdrop.parentElement!==document.body)document.body.appendChild(modalBackdrop); document.querySelectorAll(".profile-sheet").forEach(sheet=>{if(sheet.parentElement!==document.body)document.body.appendChild(sheet);});
        if(!document.querySelector("[data-profile-home]")) return;
        document.getElementById("profile-edit-button")?.addEventListener("click",openProfileSheet);
        document.getElementById("profile-add-link")?.addEventListener("click",()=>openProfileLinkSheet(null));
        document.querySelectorAll("[data-close-profile-sheet],[data-close-profile-link-sheet]").forEach(button=>button.addEventListener("click",closeProfileSheets));
        document.getElementById("profile-sheet-backdrop")?.addEventListener("click",closeProfileSheets);
        document.getElementById("profile-save-button")?.addEventListener("click",saveProfilePersonalization);
        document.getElementById("profile-link-save")?.addEventListener("click",saveProfileLink);
        document.getElementById("profile-avatar-choose")?.addEventListener("click",()=>document.getElementById("profile-avatar-file")?.click());
        document.getElementById("profile-avatar-file")?.addEventListener("change",async event=>{const file=event.target.files?.[0];if(file)await changeProfileAvatar(file);event.target.value="";});
        document.getElementById("profile-background-choose")?.addEventListener("click",()=>document.getElementById("profile-background-file")?.click());
        document.getElementById("profile-background-file")?.addEventListener("change",async event=>{const file=event.target.files?.[0];if(file)await changeProfileBackground(file);event.target.value="";});
        document.getElementById("profile-background-clear")?.addEventListener("click",clearProfileBackground);
        bindCurrentPageNoReload();
        document.getElementById("profile-cover-picker")?.addEventListener("click",event=>{const button=event.target.closest("[data-cover-choice]");if(!button)return;document.querySelectorAll("[data-cover-choice]").forEach(x=>x.classList.toggle("is-selected",x===button));});
        document.querySelectorAll("[data-link-preset]").forEach(button=>button.addEventListener("click",()=>{document.getElementById("profile-link-title").value=button.dataset.linkPreset;}));
        window.addEventListener("keydown",event=>{if(event.key==="Escape")closeProfileSheets();});
      }
      async function hydrateProfileHome(user) {
        if(!document.querySelector("[data-profile-home]") || !user) return;
        profileHomeState.user=user;
        const cached=readProfileHomeCache(user.id);
        if(cached){profileHomeState.personalization=normalizeProfilePersonalization(cached.personalization,user.id);profileHomeState.links=Array.isArray(cached.links)?cached.links:[];renderProfileHome();}
        const [personalizationResult,linksResult]=await Promise.all([
          supabaseClient.from("profile_personalization").select("*").eq("user_id",user.id).maybeSingle(),
          supabaseClient.from("profile_links").select("*").eq("user_id",user.id).order("pinned",{ascending:false}).order("sort_order",{ascending:true}).order("created_at",{ascending:true})
        ]);
        if(personalizationResult.error) console.error("Profile personalization query failed",personalizationResult.error.message);
        if(linksResult.error) console.error("Profile links query failed",linksResult.error.message);
        if(!personalizationResult.error) profileHomeState.personalization=normalizeProfilePersonalization(personalizationResult.data,user.id);
        if(!linksResult.error) profileHomeState.links=linksResult.data||[];
        writeProfileHomeCache(); renderProfileHome();
      }
      async function hydrateProfileAudit(user) {
        if (!document.getElementById("audit-created-at") && !document.getElementById("audit-current-device")) return;

        const cached = readProfileCache(PROFILE_AUDIT_CACHE_KEY);
        const [eventsResult, devicesResult] = await Promise.all([
          supabaseClient.from("login_events").select("*").order("created_at", { ascending: false }).limit(50),
          supabaseClient.from("user_devices").select("*").order("last_seen_at", { ascending: false }).limit(20)
        ]);
        const eventsError = Boolean(eventsResult.error);
        const devicesError = Boolean(devicesResult.error);
        const events = eventsError ? [] : eventsResult.data || [];
        const devices = devicesError ? [] : devicesResult.data || [];

        if (eventsError) console.error("Login event query failed", eventsResult.error.message);
        if (devicesError) console.error("Device query failed", devicesResult.error.message);

        if (eventsError || devicesError) {
          if (!cached) {
            renderAccountAudit(user, events, devices, eventsError, devicesError);
            renderSecurityAudit(events, devices, eventsError, devicesError);
          }
          return;
        }

        const cachedUser = {
          id: user.id,
          email: user.email || "",
          created_at: user.created_at || null,
          last_sign_in_at: getLastSignIn(user)
        };
        const fingerprint = buildAuditFingerprint(cachedUser, events, devices);
        if (cached?.user?.id === user.id && cached.fingerprint === fingerprint) return;

        const snapshot = {
          user: cachedUser,
          events,
          devices,
          fingerprint
        };
        writeProfileCache(PROFILE_AUDIT_CACHE_KEY, snapshot);
        renderAccountAudit(cachedUser, events, devices, false, false);
        renderSecurityAudit(events, devices, false, false);
      }

      restoreProfileUiCaches();
      bindProfileHome();

      function renderAccountAudit(user, events, devices, eventsError, devicesError) {
        const set = (id, value) => { const el = document.getElementById(id); if (el) el.innerText = value || "-"; };
        set("audit-created-at", formatAuditDate(user.created_at));
        set("audit-user-id", user.id);
        set("audit-email", user.email);
        set("audit-last-sign-in", formatAuditDate(getLastSignIn(user)));
        set("audit-login-count", eventsError ? "—" : String(events.length));
        set("audit-device-count", devicesError ? "—" : String(devices.length));
        set("audit-risk-count", eventsError ? "—" : String(events.filter(event => event.risk_level && event.risk_level !== "正常").length));

        const table = document.getElementById("audit-login-table");
        if (table) {
          table.innerHTML = eventsError
            ? '<div class="audit-row"><span>无法读取登录记录 / Unable to load login records</span></div>'
            : renderAuditRows(events);
        }
      }

      function renderAuditRows(events) {
        const head = ["登录时间", "IP 地址", "地区", "浏览器", "操作系统", "设备类型", "登录方式", "登录结果", "风险提示"];
        const header = '<div class="audit-row audit-head">' + head.map(item => '<strong>' + item + '</strong>').join("") + '</div>';
        if (!events.length) return header + '<div class="audit-row"><span>暂无登录记录</span></div>';
        return header + events.map(event => '<div class="audit-row">' + [
          formatAuditDate(event.created_at),
          event.ip_address || "-",
          [event.country, event.region, event.city].filter(Boolean).join(" / ") || "-",
          event.browser || "-",
          event.os || "-",
          event.device_type || "-",
          event.provider || "password",
          event.success ? "成功" : "失败",
          event.risk_level || "正常"
        ].map(item => '<span>' + auditEscape(item) + '</span>').join("") + '</div>').join("");
      }

      function renderSecurityAudit(events, devices, eventsError, devicesError) {
        const currentId = getAuditDeviceId();
        const current = devices.find(device => device.device_id === currentId) || null;
        const currentBox = document.getElementById("audit-current-device");
        if (currentBox) currentBox.innerHTML = devicesError
          ? "无法读取设备数据 / Unable to load device data"
          : current ? renderDeviceCard(current, true) : "暂无当前设备数据";

        const list = document.getElementById("audit-device-list");
        if (list) list.innerHTML = devicesError
          ? "无法读取设备数据 / Unable to load device data"
          : devices.length ? devices.map(device => renderDeviceCard(device, device.device_id === currentId)).join("") : "暂无登录设备";

        const timeline = document.getElementById("audit-login-timeline");
        if (timeline) timeline.innerHTML = eventsError
          ? "无法读取登录历史 / Unable to load login history"
          : renderTimeline(events);

        const alerts = document.getElementById("audit-risk-alerts");
        if (alerts) {
          if (eventsError) {
            alerts.innerHTML = "<p>无法读取风险数据 / Unable to load risk data</p>";
          } else {
            const risks = events.filter(event => event.risk_level && event.risk_level !== "正常");
            alerts.innerHTML = risks.length ? risks.map(event => '<p>' + auditEscape(formatAuditDate(event.created_at)) + " · " + auditEscape(event.risk_level) + " · " + auditEscape(event.ip_address || "-") + '</p>').join("") : "<p>暂无异常登录提示</p>";
          }
        }
      }

      function renderDeviceCard(device, current) {
        const status = device.revoked_at ? "已退出" : "活跃";
        const name = device.device_name || ((device.browser || "Browser") + " on " + (device.os || "OS"));
        return '<article class="audit-device-card">' +
          '<strong>' + auditEscape(name + (current ? " · 当前设备" : "")) + '</strong>' +
          '<span>' + auditEscape([device.browser, device.os, device.device_type].filter(Boolean).join(" / ")) + '</span>' +
          '<span>' + auditEscape([device.last_ip, device.country, device.region, device.city].filter(Boolean).join(" · ")) + '</span>' +
          '<span>首次登录 ' + auditEscape(formatAuditDate(device.first_seen_at)) + ' · 最近活跃 ' + auditEscape(formatAuditDate(device.last_seen_at)) + '</span>' +
          '<em>' + auditEscape(status) + '</em>' +
        '</article>';
      }

      function renderTimeline(events) {
        const groups = { "今天": [], "昨天": [], "本周": [], "更早": [] };
        const now = new Date();
        events.forEach(event => {
          const date = new Date(event.created_at);
          const diffDays = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(date.getFullYear(), date.getMonth(), date.getDate())) / 86400000);
          const key = diffDays === 0 ? "今天" : diffDays === 1 ? "昨天" : diffDays < 7 ? "本周" : "更早";
          groups[key].push(event);
        });
        return Object.entries(groups).filter(([, items]) => items.length).map(([label, items]) =>
          '<section><h3>' + auditEscape(label) + '</h3>' + items.map(event =>
            '<p>' + [
              formatAuditDate(event.created_at),
              [event.city, event.region, event.country].filter(Boolean).join(" / ") || "-",
              event.ip_address || "-",
              (event.browser || "-") + " on " + (event.os || "-"),
              event.provider || "password",
              event.success ? "成功" : "失败",
              event.risk_level || "正常"
            ].map(auditEscape).join(" · ") + '</p>'
          ).join("") + '</section>'
        ).join("") || "<p>暂无登录历史</p>";
      }
    </script>
  `;
}

export function adminClientScript(ipInfo) {
  return `
    <script>
      const adminRequestContext = ${JSON.stringify({
        ip_address: ipInfo?.ip || "",
        user_agent: ""
      })};


      const adminState = {
        currentUser: null,
        users: [],
        overview: null,
        roles: null,
        logs: [],
        pendingPermissions: null,
        permissionDirty: false
      };

      const ADMIN_OVERVIEW_CACHE_KEY = "qssed-admin-overview-v1";
      const ADMIN_USERS_CACHE_KEY = "qssed-admin-users-v1";
      const ADMIN_ROLES_CACHE_KEY = "qssed-admin-roles-v1";
      const ADMIN_LOGS_CACHE_KEY = "qssed-admin-logs-v1";
      const ADMIN_ACCESS_CACHE_KEY = "qssed-admin-access-v1";
      const ADMIN_VIEW_CACHE_PREFIX = "qssed-admin-view-v1:";

      function readAdminCache(key) {
        try {
          const raw = sessionStorage.getItem(key);
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      }

      function writeAdminCache(key, value) {
        try {
          sessionStorage.setItem(key, JSON.stringify(value));
        } catch {}
      }

      function clearAdminUiCaches() {
        try {
          sessionStorage.removeItem(ADMIN_OVERVIEW_CACHE_KEY);
          sessionStorage.removeItem(ADMIN_USERS_CACHE_KEY);
          sessionStorage.removeItem(ADMIN_ROLES_CACHE_KEY);
          sessionStorage.removeItem(ADMIN_LOGS_CACHE_KEY);
          sessionStorage.removeItem(ADMIN_ACCESS_CACHE_KEY);
          Object.keys(sessionStorage)
            .filter(key => key.startsWith(ADMIN_VIEW_CACHE_PREFIX))
            .forEach(key => sessionStorage.removeItem(key));
        } catch {}
      }

      function cacheAdminViewHtml() {
        try {
          const content = document.getElementById("os-content");
          if (!content) return;
          sessionStorage.setItem(ADMIN_VIEW_CACHE_PREFIX + location.pathname, content.innerHTML);
        } catch {}
      }

      function adminOverviewFingerprint(data) {
        const normalizeUsers = (data?.recent_users || []).map(user => [
          user.user_id || user.id || "",
          user.username || "",
          user.display_name || "",
          user.email || "",
          user.role || "",
          user.status || "",
          user.last_sign_in_at || ""
        ]).sort((a, b) => String(a[0]).localeCompare(String(b[0])));

        const normalizeLogs = items => (items || []).map(log => [
          log.id || "",
          log.action || "",
          log.severity || "",
          log.created_at || "",
          log.actor_email || "",
          log.target_id || "",
          log.target_label || ""
        ]).sort((a, b) => String(a[0]).localeCompare(String(b[0])));

        return JSON.stringify({
          user_count: Number(data?.user_count) || 0,
          admin_count: Number(data?.admin_count) || 0,
          recent_users: normalizeUsers,
          recent_logs: normalizeLogs(data?.recent_logs),
          risks: normalizeLogs(data?.risks)
        });
      }

      function adminUsersFingerprint(users) {
        return JSON.stringify((users || []).map(user => [
          user.user_id || "",
          user.username || "",
          user.display_name || "",
          user.email || "",
          user.role || "",
          user.status || "",
          user.created_at || "",
          user.last_sign_in_at || "",
          (user.recent_logins || []).map(login => [
            login.id || "",
            login.created_at || "",
            Boolean(login.success),
            login.risk_level || ""
          ]),
          (user.recent_actions || []).map(log => [
            log.id || "",
            log.created_at || "",
            log.action || "",
            log.severity || ""
          ])
        ]).sort((a, b) => String(a[0]).localeCompare(String(b[0]))));
      }

      function cacheAdminUsers() {
        writeAdminCache(ADMIN_USERS_CACHE_KEY, {
          user_id: adminState.currentUser?.id || "",
          fingerprint: adminUsersFingerprint(adminState.users),
          users: adminState.users
        });
      }

      function adminRolesFingerprint(data) {
        const normalized = normalizeRolePermissions(data || {});
        return JSON.stringify({
          roles: normalized.roles.map(role => [role.name || "", role.description || ""]).sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
          permissions: normalized.permissions.map(permission => [permission.key || "", permission.category || "", permission.description || ""]).sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
          role_permissions: normalized.role_permissions.map(item => [item.role || "", item.permission || ""]).sort((a, b) => (String(a[0]) + ":" + String(a[1])).localeCompare(String(b[0]) + ":" + String(b[1]))),
          user_counts: Object.entries(normalized.user_counts || {}).sort(([a], [b]) => a.localeCompare(b))
        });
      }

      function cacheAdminRoles() {
        if (!adminState.roles) return;
        writeAdminCache(ADMIN_ROLES_CACHE_KEY, {
          user_id: adminState.currentUser?.id || "",
          fingerprint: adminRolesFingerprint(adminState.roles),
          data: adminState.roles
        });
      }

      function adminLogsFingerprint(logs) {
        return JSON.stringify((logs || []).map(log => [
          log.id || "",
          log.action || "",
          log.severity || "",
          log.created_at || "",
          log.actor_user_id || "",
          log.actor_email || "",
          log.target_type || "",
          log.target_id || "",
          log.target_label || "",
          log.description || ""
        ]).sort((a, b) => String(a[0]).localeCompare(String(b[0]))));
      }

      function cacheAdminLogs(logs) {
        writeAdminCache(ADMIN_LOGS_CACHE_KEY, {
          user_id: adminState.currentUser?.id || "",
          fingerprint: adminLogsFingerprint(logs),
          logs
        });
      }

      function adminIsZh() {
        return location.pathname.startsWith("/zh-cn");
      }

      function adminText(zh, cn, en) {
        return zh ? cn : en;
      }

      // i18n marker: keep database/API canonical keys in English; localize labels only at render time.
      function adminRoleLabel(role) {
        const labels = adminIsZh()
          ? { admin: "管理员", editor: "编辑者", user: "普通成员" }
          : { admin: "Administrator", editor: "Editor", user: "Member" };
        return labels[role] || role || "-";
      }

      // i18n marker: status values remain active/suspended/banned for RPC filters and updates.
      function adminStatusLabel(status) {
        if (!adminIsZh()) return status || "-";
        return ({ active: "正常", suspended: "已停用", banned: "已封禁" })[status] || status || "-";
      }

      // i18n marker: severity values remain info/warning/danger for audit filtering.
      function adminSeverityLabel(severity) {
        if (!adminIsZh()) return severity || "-";
        return ({ info: "信息", warning: "警告", danger: "危险" })[severity] || severity || "-";
      }

      // i18n marker: audit action keys are stored as machine-readable English action names.
      function adminActionLabel(action) {
        if (!adminIsZh()) return action || "-";
        return ({
          "login": "登录",
          "auth.login.failed": "登录失败",
          "user.role.update": "修改用户角色",
          "user.ban": "封禁用户",
          "user.unban": "解除封禁",
          "user.suspend": "停用用户",
          "role.permissions.update": "修改角色权限"
        })[action] || action || "-";
      }

      // i18n marker: audit descriptions may come from database functions in English; render a Chinese hint without mutating stored logs.
      function adminLogDescription(log) {
        const text = log?.description || log?.target_label || "-";
        if (!adminIsZh()) return text;
        if (log?.action === "auth.login.failed") return "密码登录失败。";
        if (log?.action === "user.role.update") return "用户角色已更新。";
        if (log?.action === "user.ban") return "用户已被封禁。";
        if (log?.action === "user.unban") return "用户已解除封禁。";
        if (log?.action === "user.suspend") return "用户已停用。";
        if (log?.action === "role.permissions.update") return "角色权限矩阵已更新。";
        return text;
      }

      // i18n marker: permission keys stay stable for RBAC; Chinese copy is display-only.
      function adminPermissionLabel(key) {
        if (!adminIsZh()) return key || "-";
        return ({
          "users.read": "查看用户", "users.update": "更新用户", "users.ban": "封禁用户",
          "roles.read": "查看角色", "roles.update": "更新角色",
          "logs.read": "查看日志", "system.read": "查看系统",
          "notes.read": "查看笔记", "notes.create": "创建笔记", "notes.update": "更新笔记", "notes.delete": "删除笔记",
          "links.read": "查看链接", "links.create": "创建链接", "links.update": "更新链接", "links.delete": "删除链接",
          "projects.read": "查看项目", "projects.create": "创建项目", "projects.update": "更新项目", "projects.delete": "删除项目"
        })[key] || key || "-";
      }

      function adminPermissionDescription(permission) {
        if (!adminIsZh()) return permission.description || permission.key || "";
        return adminPermissionLabel(permission.key) + "权限";
      }

      function adminCategoryLabel(category) {
        if (!adminIsZh()) return category || "general";
        return ({ users: "用户", roles: "角色", logs: "日志", system: "系统", notes: "笔记", links: "链接", projects: "项目", general: "通用" })[category] || category || "通用";
      }

      function adminFieldLabel(key) {
        if (!adminIsZh()) return key;
        return ({
          id: "日志 ID",
          actor_user_id: "操作者 ID",
          actor_email: "操作者邮箱",
          action: "动作",
          target_type: "对象类型",
          target_id: "对象 ID",
          target_label: "对象名称",
          description: "描述",
          ip_address: "IP 地址",
          user_agent: "浏览器标识",
          severity: "级别",
          created_at: "创建时间"
        })[key] || key;
      }

      function adminRoleDescription(role) {
        const descriptions = adminIsZh()
          ? {
              admin: "拥有完整管理权限，可管理成员、角色权限与审计记录。仅应授予承担管理职责的账号。",
              editor: "适用于需要扩展工作区操作能力的成员，不包含用户管理、角色权限调整等管理员能力。",
              user: "普通成员，用于日常个人使用。可以访问获准的个人功能，但不能管理其他成员、修改角色权限或访问仅限管理员的审计信息。"
            }
          : {
              admin: "Full administrative access for member management, role permissions, and audit records. Grant this role only to accounts with administrative responsibilities.",
              editor: "For members who need broader workspace capabilities without user management or role-permission administration.",
              user: "Standard member for everyday personal use. Can use permitted personal features but cannot manage other members, change role permissions, or access administrator-only audit information."
            };
        return descriptions[role.name] || role.description || "-";
      }

      function adminEscape(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
      }

      function adminFormatDate(value) {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const hh = String(date.getHours()).padStart(2, "0");
        const min = String(date.getMinutes()).padStart(2, "0");
        return yyyy + "-" + mm + "-" + dd + " " + hh + ":" + min;
      }

      function adminSkeleton(target, rows) {
        if (!target) return;
        target.innerHTML = Array.from({ length: rows || 4 }).map(() => '<div class="skeleton-line"></div>').join("");
      }

      function adminEmpty(message, actionLabel, action) {
        return '<article class="admin-empty-state"><div class="admin-empty-orb">Q</div><strong>' + adminEscape(message) + '</strong>' + (actionLabel ? '<button class="admin-ghost" data-empty-action="' + adminEscape(action || "") + '">' + adminEscape(actionLabel) + '</button>' : "") + '</article>';
      }

      function adminToast(message, type) {
        let host = document.getElementById("admin-toast-host");
        if (!host) {
          host = document.createElement("div");
          host.id = "admin-toast-host";
          document.body.appendChild(host);
        }
        const toast = document.createElement("div");
        toast.className = "admin-toast " + (type || "info");
        toast.innerHTML = '<strong>' + (type === "danger" ? "!" : type === "warning" ? "?" : "✓") + '</strong><span>' + adminEscape(message) + '</span>';
        host.appendChild(toast);
        window.setTimeout(() => toast.classList.add("is-hiding"), 2800);
        window.setTimeout(() => toast.remove(), 3300);
      }

      function adminConfirm(options) {
        return new Promise(resolve => {
          const overlay = document.createElement("div");
          overlay.className = "admin-confirm-backdrop";
          const needsInput = Boolean(options.confirmText);
          overlay.innerHTML =
            '<div class="admin-confirm ' + (options.danger ? "is-danger" : "") + '">' +
              '<h3>' + adminEscape(options.title) + '</h3>' +
              '<p>' + adminEscape(options.message) + '</p>' +
              (needsInput ? '<input id="admin-confirm-input" placeholder="' + adminEscape(options.confirmText) + '">' : '') +
              '<div class="admin-confirm-actions">' +
                '<button class="admin-ghost" data-confirm-cancel>' + adminEscape(adminText(adminIsZh(), "取消", "Cancel")) + '</button>' +
                '<button class="' + (options.danger ? "admin-danger" : "admin-primary") + '" data-confirm-ok>' + adminEscape(options.confirmLabel || adminText(adminIsZh(), "确认", "Confirm")) + '</button>' +
              '</div>' +
            '</div>';
          document.body.appendChild(overlay);
          requestAnimationFrame(() => overlay.classList.add("is-open"));
          const close = value => {
            overlay.classList.remove("is-open");
            window.setTimeout(() => overlay.remove(), 180);
            resolve(value);
          };
          overlay.querySelector("[data-confirm-cancel]").addEventListener("click", () => close(false));
          overlay.addEventListener("click", event => { if (event.target === overlay) close(false); });
          overlay.querySelector("[data-confirm-ok]").addEventListener("click", () => {
            const input = overlay.querySelector("#admin-confirm-input");
            if (input && input.value.trim() !== options.confirmText) {
              overlay.querySelector(".admin-confirm").classList.remove("shake-once");
              void overlay.querySelector(".admin-confirm").offsetWidth;
              overlay.querySelector(".admin-confirm").classList.add("shake-once");
              input.classList.add("is-error");
              return;
            }
            close(true);
          });
        });
      }

      function animateNumber(el, value) {
        if (!el) return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) {
          el.innerText = String(value);
          return;
        }
        const target = Number(value) || 0;
        const start = performance.now();
        const duration = 520;
        function tick(now) {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.innerText = String(Math.round(target * eased));
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }

      async function adminRpc(name, params) {
        const { data, error } = await supabaseClient.rpc(name, params || {});
        if (error) {
          console.error("Admin RPC failed", name, error.message);
          return { data: null, error };
        }
        return { data, error: null };
      }

      function adminLoadError(message) {
        return adminEmpty(message || adminText(adminIsZh(), "无法读取管理数据，请稍后重试。", "Unable to load management data. Please try again later."));
      }

      async function hydrateAdminModule(user) {
        adminState.currentUser = user;
        adminRequestContext.user_agent = navigator.userAgent || "";
        const path = location.pathname.replace(/^\\/(zh-cn|en)/, "") || "/dashboard";
        if (path === "/admin/general") await loadAdminOverview();
        if (path === "/admin/users") await loadAdminUsers();
        if (path === "/admin/roles") await loadAdminRoles();
        if (path === "/admin/logs") await loadAdminLogs();
        bindAdminNavigation();
      }

      function bindAdminNavigation() {
        document.querySelectorAll("[data-admin-nav]").forEach(button => {
          button.addEventListener("click", () => {
            const prefix = adminIsZh() ? "/zh-cn" : "/en";
            location.href = prefix + button.dataset.adminNav;
          });
        });
      }

      async function loadAdminOverview() {
        const stored = readAdminCache(ADMIN_OVERVIEW_CACHE_KEY);
        const cached = stored?.user_id === adminState.currentUser?.id ? stored : null;

        if (cached?.data) {
          adminState.overview = cached.data;
          renderAdminOverview(cached.data);
          void refreshAdminOverview(cached);
          return;
        }

        ["admin-recent-users", "admin-recent-logs", "admin-risk-list"].forEach(id => adminSkeleton(document.getElementById(id), 4));
        await refreshAdminOverview(null);
      }

      async function refreshAdminOverview(cached) {
        const result = await adminRpc("get_admin_overview", {});
        if (result.error) {
          if (cached?.data) {
            console.warn("Admin overview refresh failed; keeping cached data.");
            return;
          }
          document.querySelectorAll("[data-admin-metric]").forEach(el => {
            el.closest("article")?.classList.remove("admin-skeleton");
            el.innerText = "—";
          });
          ["admin-recent-users", "admin-recent-logs", "admin-risk-list"].forEach(id => {
            const target = document.getElementById(id);
            if (!target) return;
            target.classList.remove("admin-list-skeleton");
            target.innerHTML = adminLoadError();
          });
          adminToast(adminText(adminIsZh(), "管理数据读取失败。", "Admin data failed to load."), "danger");
          return;
        }

        const fresh = result.data || {};
        const fingerprint = adminOverviewFingerprint(fresh);
        adminState.overview = fresh;

        if (cached?.fingerprint === fingerprint) return;

        writeAdminCache(ADMIN_OVERVIEW_CACHE_KEY, {
          user_id: adminState.currentUser?.id || "",
          fingerprint,
          data: fresh
        });
        renderAdminOverview(fresh);
      }

      function renderAdminOverview(data) {
        const values = [data.user_count, data.admin_count];
        document.querySelectorAll("[data-admin-metric]").forEach((el, index) => {
          el.closest("article")?.classList.remove("admin-skeleton");
          el.innerText = String(Number(values[index]) || 0);
        });
        const users = document.getElementById("admin-recent-users");
        if (users) {
          users.classList.remove("admin-list-skeleton");
          users.innerHTML = (data.recent_users || []).length ? data.recent_users.map(user =>
            '<article class="admin-mini-row"><span class="admin-avatar">' + adminEscape((user.display_name || user.email || "?").slice(0, 1).toUpperCase()) + '</span><div><strong>' + adminEscape(user.display_name || user.username || user.email || user.id) + '</strong><small>' + adminEscape(user.email || adminRoleLabel(user.role)) + '</small></div><em class="admin-badge ' + adminEscape(user.status || "active") + '">' + adminEscape(adminStatusLabel(user.status || "active")) + '</em></article>'
          ).join("") : adminEmpty(adminText(adminIsZh(), "暂无最近用户", "No recent users"));
        }
        const logs = document.getElementById("admin-recent-logs");
        if (logs) {
          logs.classList.remove("admin-list-skeleton");
          logs.innerHTML = renderAdminLogRows(data.recent_logs || [], true);
        }
        const risks = document.getElementById("admin-risk-list");
        if (risks) {
          risks.classList.remove("admin-list-skeleton");
          const riskItems = data.risks || [];
          risks.innerHTML = riskItems.length ? riskItems.map(log =>
            '<article class="admin-risk ' + adminEscape(log.severity) + '"><strong>' + adminEscape(adminActionLabel(log.action)) + '</strong><p>' + adminEscape(adminLogDescription(log)) + '</p><small>' + adminFormatDate(log.created_at) + '</small></article>'
          ).join("") : adminEmpty(adminText(adminIsZh(), "暂无风险事件", "No risk events"), adminText(adminIsZh(), "查看日志", "Open logs"), "/admin/logs");
          if (riskItems.some(log => log.severity === "danger")) risks.closest(".danger-event-card")?.classList.add("pulse-once");
        }
        cacheAdminViewHtml();
      }

      async function loadAdminUsers() {
        const table = document.getElementById("admin-users-table");
        const stored = readAdminCache(ADMIN_USERS_CACHE_KEY);
        const cached = stored?.user_id === adminState.currentUser?.id ? stored : null;

        bindAdminUserFilters();

        if (cached?.users) {
          adminState.users = cached.users;
          renderAdminUsers();
          void refreshAdminUsers(cached);
          return;
        }

        adminSkeleton(table, 6);
        await refreshAdminUsers(null);
      }

      async function refreshAdminUsers(cached) {
        const table = document.getElementById("admin-users-table");
        const result = await adminRpc("get_admin_users", {});
        if (result.error) {
          if (cached?.users) {
            console.warn("Admin users refresh failed; keeping cached data.");
            return;
          }
          adminState.users = [];
          table?.classList.remove("admin-list-skeleton");
          if (table) table.innerHTML = adminLoadError();
          const count = document.getElementById("admin-users-count");
          if (count) count.innerText = "—";
          adminToast(adminText(adminIsZh(), "用户列表读取失败。", "User list failed to load."), "danger");
          return;
        }

        const fresh = result.data || [];
        const fingerprint = adminUsersFingerprint(fresh);
        adminState.users = fresh;

        if (cached?.fingerprint === fingerprint) return;

        cacheAdminUsers();
        renderAdminUsers();
      }

      function bindAdminUserFilters() {
        ["admin-user-search", "admin-role-filter", "admin-status-filter"].forEach(id => {
          const el = document.getElementById(id);
          if (el && !el.dataset.bound) {
            el.dataset.bound = "true";
            el.addEventListener("input", renderAdminUsers);
            el.addEventListener("change", renderAdminUsers);
          }
        });
      }

      function filteredAdminUsers() {
        const q = (document.getElementById("admin-user-search")?.value || "").toLowerCase();
        const role = document.getElementById("admin-role-filter")?.value || "";
        const status = document.getElementById("admin-status-filter")?.value || "";
        return adminState.users.filter(user => {
          const haystack = [user.user_id, user.username, user.display_name, user.email, user.role, user.status].join(" ").toLowerCase();
          return (!q || haystack.includes(q)) && (!role || user.role === role) && (!status || user.status === status);
        });
      }

      function renderAdminUsers() {
        const zh = adminIsZh();
        const table = document.getElementById("admin-users-table");
        if (!table) return;
        const users = filteredAdminUsers();
        document.getElementById("admin-users-count").innerText = String(users.length);
        table.classList.remove("admin-list-skeleton");
        if (!users.length) {
          table.innerHTML = adminEmpty(adminText(zh, "暂无匹配用户", "No matching users"));
          return;
        }
        const head = ["ID", adminText(zh, "用户名", "Username"), adminText(zh, "邮箱", "Email"), adminText(zh, "头像", "Avatar"), adminText(zh, "角色", "Role"), adminText(zh, "状态", "Status"), adminText(zh, "创建时间", "Created"), adminText(zh, "最近登录", "Last login"), adminText(zh, "最近活跃", "Last active"), adminText(zh, "操作", "Actions")];
        table.innerHTML = '<div class="admin-table-row admin-table-head">' + head.map(item => '<strong>' + adminEscape(item) + '</strong>').join("") + '</div>' +
          users.map((user, index) => renderAdminUserRow(user, index)).join("");
        table.querySelectorAll("[data-user-detail]").forEach(button => button.addEventListener("click", () => showAdminUserDetail(button.dataset.userDetail)));
        table.querySelectorAll("[data-user-role]").forEach(select => select.addEventListener("change", () => changeAdminUserRole(select.dataset.userRole, select.value)));
        table.querySelectorAll("[data-user-status]").forEach(select => select.addEventListener("change", () => changeAdminUserStatus(select.dataset.userStatus, select.value)));
        cacheAdminViewHtml();
      }

      function renderAdminUserRow(user, index) {
        const isSelf = user.user_id === adminState.currentUser?.id;
        return '<div class="admin-table-row animated-row" data-user-row="' + adminEscape(user.user_id) + '" style="--stagger:' + Math.min(index, 12) + '">' +
          '<span class="mono">' + adminEscape(String(user.user_id || "-").slice(0, 8)) + '</span>' +
          '<span>' + adminEscape(user.display_name || user.username || "-") + '</span>' +
          '<span>' + adminEscape(user.email || "-") + '</span>' +
          '<span><span class="admin-avatar">' + adminEscape((user.display_name || user.email || "?").slice(0, 1).toUpperCase()) + '</span></span>' +
          '<span><select data-user-role="' + adminEscape(user.user_id) + '"' + (isSelf ? ' data-self="true"' : '') + '>' + ["admin","editor","user"].map(role => '<option value="' + role + '"' + (user.role === role ? " selected" : "") + '>' + adminEscape(adminRoleLabel(role)) + '</option>').join("") + '</select></span>' +
          '<span><select data-user-status="' + adminEscape(user.user_id) + '"' + (isSelf ? " disabled" : "") + '>' + ["active","suspended","banned"].map(status => '<option value="' + status + '"' + (user.status === status ? " selected" : "") + '>' + adminEscape(adminStatusLabel(status)) + '</option>').join("") + '</select></span>' +
          '<span>' + adminFormatDate(user.created_at) + '</span>' +
          '<span>' + adminFormatDate(user.last_sign_in_at) + '</span>' +
          '<span>' + adminFormatDate(user.last_seen_at) + '</span>' +
          '<span><button class="admin-ghost" data-user-detail="' + adminEscape(user.user_id) + '">' + adminEscape(adminText(adminIsZh(), "详情", "Detail")) + '</button></span>' +
        '</div>';
      }

      function getAdminUser(userId) {
        return adminState.users.find(user => user.user_id === userId);
      }

      function showAdminUserDetail(userId) {
        const user = getAdminUser(userId);
        const body = document.getElementById("admin-user-detail-body");
        if (!user || !body) return;
        const logins = user.recent_logins || [];
        const actions = user.recent_actions || [];
        body.innerHTML =
          '<div class="admin-detail-grid">' +
            '<div><strong>' + adminEscape(user.display_name || user.username || user.email) + '</strong><p>' + adminEscape(user.user_id) + '</p><p>' + adminEscape(adminRoleLabel(user.role)) + ' · ' + adminEscape(adminStatusLabel(user.status)) + '</p></div>' +
            '<div><h3>' + adminEscape(adminText(adminIsZh(), "最近登录", "Recent logins")) + '</h3>' + (logins.length ? logins.map(login => '<p>' + adminFormatDate(login.created_at) + ' · ' + adminEscape(login.ip_address || "-") + ' · ' + adminEscape(login.browser || "-") + '</p>').join("") : '<p>-</p>') + '</div>' +
            '<div><h3>' + adminEscape(adminText(adminIsZh(), "最近操作", "Recent actions")) + '</h3>' + (actions.length ? actions.map(log => '<p>' + adminFormatDate(log.created_at) + ' · ' + adminEscape(adminActionLabel(log.action)) + '</p>').join("") : '<p>-</p>') + '</div>' +
          '</div>';
        cacheAdminViewHtml();
      }

      async function changeAdminUserRole(userId, role) {
        const user = getAdminUser(userId);
        if (!user) return;
        if (user.user_id === adminState.currentUser?.id && role !== "admin") {
          adminToast(adminText(adminIsZh(), "不能移除自己的 admin 权限。", "You cannot remove your own admin role."), "danger");
          renderAdminUsers();
          return;
        }
        const ok = await adminConfirm({
          title: adminText(adminIsZh(), "确认修改角色", "Confirm role change"),
          message: (user.email || user.user_id) + " → " + adminRoleLabel(role),
          confirmLabel: adminText(adminIsZh(), "修改角色", "Update role"),
          danger: role === "admin" || user.role === "admin"
        });
        if (!ok) {
          renderAdminUsers();
          return;
        }
        const result = await adminRpc("update_user_role", { p_user_id: userId, p_role: role, p_ip_address: adminRequestContext.ip_address, p_user_agent: adminRequestContext.user_agent });
        if (result.error) {
          adminToast(result.error.message, "danger");
          renderAdminUsers();
          return;
        }
        user.role = role;
        cacheAdminUsers();

        pulseAdminRow(userId, "warning");
        adminToast(adminText(adminIsZh(), "角色已更新。", "Role updated."), "warning");
        renderAdminUsers();
      }

      async function changeAdminUserStatus(userId, status) {
        const user = getAdminUser(userId);
        if (!user) return;
        if (user.user_id === adminState.currentUser?.id && status !== "active") {
          adminToast(adminText(adminIsZh(), "不能封禁或停用自己。", "You cannot suspend or ban yourself."), "danger");
          renderAdminUsers();
          return;
        }
        const isDanger = status === "banned";
        const ok = await adminConfirm({
          title: adminText(adminIsZh(), isDanger ? "确认封禁用户" : "确认修改状态", isDanger ? "Confirm user ban" : "Confirm status change"),
          message: (user.email || user.user_id) + " → " + adminStatusLabel(status),
          confirmLabel: adminText(adminIsZh(), isDanger ? "封禁用户" : "修改状态", isDanger ? "Ban user" : "Update status"),
          danger: isDanger,
          confirmText: isDanger ? "BAN" : ""
        });
        if (!ok) {
          renderAdminUsers();
          return;
        }
        const result = await adminRpc("update_user_status", { p_user_id: userId, p_status: status, p_ip_address: adminRequestContext.ip_address, p_user_agent: adminRequestContext.user_agent });
        if (result.error) {
          adminToast(result.error.message, "danger");
          renderAdminUsers();
          return;
        }
        user.status = status;
        cacheAdminUsers();

        pulseAdminRow(userId, status === "active" ? "success" : "warning");
        adminToast(adminText(adminIsZh(), status === "active" ? "用户已解除封禁。" : "用户状态已更新。", status === "active" ? "User restored." : "User status updated."), status === "banned" ? "danger" : "success");
        renderAdminUsers();
      }

      function pulseAdminRow(userId, type) {
        const row = document.querySelector('[data-user-row="' + CSS.escape(userId) + '"]');
        if (!row) return;
        row.classList.remove("row-flash-warning", "row-flash-success");
        void row.offsetWidth;
        row.classList.add(type === "success" ? "row-flash-success" : "row-flash-warning");
      }

      async function loadAdminRoles() {
        const cards = document.getElementById("admin-role-cards");
        const matrix = document.getElementById("admin-permission-matrix");
        const stored = readAdminCache(ADMIN_ROLES_CACHE_KEY);
        const cached = stored?.user_id === adminState.currentUser?.id ? stored : null;

        if (cached?.data) {
          adminState.roles = normalizeRolePermissions(cached.data);
          adminState.pendingPermissions = JSON.parse(JSON.stringify(adminState.roles.role_permissions));
          adminState.permissionDirty = false;
          renderAdminRoles();
          void refreshAdminRoles(cached);
          return;
        }

        adminSkeleton(cards, 3);
        adminSkeleton(matrix, 8);
        await refreshAdminRoles(null);
      }

      async function refreshAdminRoles(cached) {
        const cards = document.getElementById("admin-role-cards");
        const matrix = document.getElementById("admin-permission-matrix");
        const result = await adminRpc("get_role_permissions", {});
        if (result.error) {
          if (cached?.data) {
            console.warn("Admin roles refresh failed; keeping cached data.");
            return;
          }
          [cards, matrix].forEach(target => {
            if (!target) return;
            target.classList.remove("admin-list-skeleton");
            target.innerHTML = adminLoadError();
          });
          adminToast(adminText(adminIsZh(), "角色权限读取失败。", "Role permissions failed to load."), "danger");
          return;
        }

        const fresh = normalizeRolePermissions(result.data || {});
        const fingerprint = adminRolesFingerprint(fresh);

        if (cached?.fingerprint === fingerprint) return;

        adminState.roles = fresh;
        adminState.pendingPermissions = JSON.parse(JSON.stringify(fresh.role_permissions));
        adminState.permissionDirty = false;
        cacheAdminRoles();
        renderAdminRoles();
      }

      function normalizeRolePermissions(data) {
        return {
          roles: data.roles || [],
          permissions: data.permissions || [],
          role_permissions: data.role_permissions || [],
          user_counts: data.user_counts || {}
        };
      }

      function roleHasPermission(role, permission) {
        return (adminState.pendingPermissions || []).some(item => item.role === role && item.permission === permission);
      }

      function setRolePermission(role, permission, enabled) {
        adminState.pendingPermissions = (adminState.pendingPermissions || []).filter(item => !(item.role === role && item.permission === permission));
        if (enabled) adminState.pendingPermissions.push({ role, permission });
        adminState.permissionDirty = true;
        document.getElementById("admin-unsaved-bar").hidden = false;
        document.getElementById("admin-save-permissions").disabled = false;
      }

      function renderAdminRoles() {
        const data = adminState.roles;
        const cards = document.getElementById("admin-role-cards");
        const matrix = document.getElementById("admin-permission-matrix");
        if (cards) {
          cards.classList.remove("admin-list-skeleton");
          cards.innerHTML = data.roles.map(role => {
            const count = data.user_counts?.[role.name] || 0;
            const perms = (adminState.pendingPermissions || []).filter(item => item.role === role.name).length;
            return '<article class="os-card admin-motion-card"><small>' + adminEscape(role.name) + '</small><h2>' + adminEscape(adminRoleLabel(role.name)) + '</h2><p>' + adminEscape(adminRoleDescription(role)) + '</p><strong>' + count + adminText(adminIsZh(), ' 位用户 · ', ' users · ') + perms + adminText(adminIsZh(), ' 项权限', ' permissions') + '</strong></article>';
          }).join("");
        }
        if (!matrix) return;
        matrix.classList.remove("admin-list-skeleton");
        const grouped = {};
        data.permissions.forEach(permission => {
          grouped[permission.category || "general"] ||= [];
          grouped[permission.category || "general"].push(permission);
        });
        matrix.innerHTML = Object.entries(grouped).map(([category, permissions]) =>
          '<details class="permission-group" open><summary>' + adminEscape(adminCategoryLabel(category)) + '</summary>' +
          '<div class="permission-grid">' +
            '<strong class="permission-head">' + adminEscape(adminText(adminIsZh(), "权限", "Permission")) + '</strong>' + data.roles.map(role => '<strong>' + adminEscape(adminRoleLabel(role.name)) + '</strong>').join("") +
            permissions.map(permission =>
              '<div class="permission-key"><strong>' + adminEscape(adminPermissionLabel(permission.key)) + '</strong><small>' + adminEscape(permission.key) + ' · ' + adminEscape(adminPermissionDescription(permission)) + '</small></div>' +
              data.roles.map(role => '<label class="switch-cell"><input type="checkbox" data-role="' + adminEscape(role.name) + '" data-permission="' + adminEscape(permission.key) + '"' + (roleHasPermission(role.name, permission.key) ? " checked" : "") + '><span></span></label>').join("")
            ).join("") +
          '</div></details>'
        ).join("");
        matrix.querySelectorAll('input[type="checkbox"]').forEach(input => input.addEventListener("change", async () => {
          const key = input.dataset.permission;
          const critical = ["users.ban", "roles.update", "users.update"].includes(key);
          if (critical && !input.checked) {
            const ok = await adminConfirm({
              title: adminText(adminIsZh(), "确认关闭关键权限", "Confirm critical permission change"),
              message: adminRoleLabel(input.dataset.role) + " / " + adminPermissionLabel(key),
              confirmLabel: adminText(adminIsZh(), "继续修改", "Continue"),
              danger: true
            });
            if (!ok) {
              input.checked = true;
              return;
            }
          }
          setRolePermission(input.dataset.role, key, input.checked);
          input.closest(".switch-cell")?.classList.add("updated");
          window.setTimeout(() => input.closest(".switch-cell")?.classList.remove("updated"), 2000);
        }));
        const save = document.getElementById("admin-save-permissions");
        if (save && !save.dataset.bound) {
          save.dataset.bound = "true";
          save.addEventListener("click", saveAdminPermissions);
        }
        cacheAdminViewHtml();
      }

      async function saveAdminPermissions() {
        const roles = adminState.roles.roles.map(role => role.name);
        for (const role of roles) {
          const permissions = (adminState.pendingPermissions || []).filter(item => item.role === role).map(item => item.permission);
          const result = await adminRpc("update_role_permissions", { p_role: role, p_permissions: permissions, p_ip_address: adminRequestContext.ip_address, p_user_agent: adminRequestContext.user_agent });
          if (result.error) {
            adminToast(result.error.message, "danger");
            return;
          }
          adminState.roles = normalizeRolePermissions(result.data || adminState.roles);
          adminState.pendingPermissions = JSON.parse(JSON.stringify(adminState.roles.role_permissions));
        }
        adminState.permissionDirty = false;
        cacheAdminRoles();
        document.getElementById("admin-unsaved-bar").hidden = true;
        const save = document.getElementById("admin-save-permissions");
        save.disabled = true;
        const old = save.innerText;
        save.innerText = adminText(adminIsZh(), "已保存", "Saved");
        window.setTimeout(() => save.innerText = old, 1400);
        adminToast(adminText(adminIsZh(), "权限矩阵已保存。", "Permission matrix saved."), "success");
        renderAdminRoles();
      }

      async function loadAdminLogs() {
        bindAdminLogFilters();
        await refreshAdminLogs({ useCache: true });
      }

      function bindAdminLogFilters() {
        ["admin-log-search","admin-log-action","admin-log-severity","admin-log-actor","admin-log-from","admin-log-to"].forEach(id => {
          const el = document.getElementById(id);
          if (el && !el.dataset.bound) {
            el.dataset.bound = "true";
            el.addEventListener("input", debounce(() => refreshAdminLogs({ useCache: false }), 180));
            el.addEventListener("change", () => refreshAdminLogs({ useCache: false }));
          }
        });
        const close = document.getElementById("admin-log-drawer-close");
        if (close && !close.dataset.bound) {
          close.dataset.bound = "true";
          close.addEventListener("click", () => toggleAdminLogDrawer(null));
        }
      }

      function debounce(fn, delay) {
        let timer;
        return () => {
          clearTimeout(timer);
          timer = setTimeout(fn, delay);
        };
      }

      async function refreshAdminLogs(options = {}) {
        const list = document.getElementById("admin-logs-list");
        const params = {
          p_action: document.getElementById("admin-log-action")?.value || null,
          p_severity: document.getElementById("admin-log-severity")?.value || null,
          p_actor: document.getElementById("admin-log-actor")?.value || null,
          p_search: document.getElementById("admin-log-search")?.value || null,
          p_from: document.getElementById("admin-log-from")?.value ? document.getElementById("admin-log-from").value + "T00:00:00" : null,
          p_to: document.getElementById("admin-log-to")?.value ? document.getElementById("admin-log-to").value + "T23:59:59" : null,
          p_limit: 120
        };
        const isDefault = !params.p_action && !params.p_severity && !params.p_actor && !params.p_search && !params.p_from && !params.p_to;
        const stored = options.useCache && isDefault ? readAdminCache(ADMIN_LOGS_CACHE_KEY) : null;
        const cached = stored?.user_id === adminState.currentUser?.id ? stored : null;

        if (cached?.logs) {
          adminState.logs = cached.logs;
          renderAdminLogs();
          void fetchAdminLogs(params, cached, true);
          return;
        }

        if (!list?.children.length) adminSkeleton(list, 8);
        await fetchAdminLogs(params, null, isDefault);
      }

      async function fetchAdminLogs(params, cached, cacheDefault) {
        const list = document.getElementById("admin-logs-list");
        const result = await adminRpc("get_audit_logs", params);
        if (result.error) {
          if (cached?.logs) {
            console.warn("Admin logs refresh failed; keeping cached data.");
            return;
          }
          adminState.logs = [];
          list?.classList.remove("admin-list-skeleton");
          if (list) list.innerHTML = adminLoadError();
          const count = document.getElementById("admin-logs-count");
          if (count) count.innerText = "—";
          adminToast(adminText(adminIsZh(), "操作日志读取失败。", "Audit logs failed to load."), "danger");
          return;
        }

        const fresh = result.data || [];
        const fingerprint = adminLogsFingerprint(fresh);

        if (cached?.fingerprint === fingerprint) return;

        adminState.logs = fresh;
        if (cacheDefault) cacheAdminLogs(fresh);
        renderAdminLogs();
      }

      function renderAdminLogs() {
        const list = document.getElementById("admin-logs-list");
        if (!list) return;
        list.classList.remove("admin-list-skeleton");
        document.getElementById("admin-logs-count").innerText = String(adminState.logs.length);
        list.innerHTML = renderAdminLogRows(adminState.logs, false);
        list.querySelectorAll("[data-log-id]").forEach(row => row.addEventListener("click", () => toggleAdminLogDrawer(row.dataset.logId)));
        cacheAdminViewHtml();
      }

      function renderAdminLogRows(logs, compact) {
        if (!logs.length) return adminEmpty(adminText(adminIsZh(), "暂无日志", "No logs yet"));
        return logs.map((log, index) =>
          '<article class="admin-log-row animated-row ' + adminEscape(log.severity || "info") + '" style="--stagger:' + Math.min(index, 12) + '" data-log-id="' + adminEscape(log.id || index) + '">' +
            '<span class="log-dot"></span>' +
            '<div><strong>' + adminEscape(adminActionLabel(log.action)) + '</strong><p>' + adminEscape(adminLogDescription(log)) + '</p><small>' + adminFormatDate(log.created_at) + ' · ' + adminEscape(log.actor_email || "-") + (compact ? "" : " · " + adminEscape(log.ip_address || "-")) + '</small></div>' +
            '<em class="admin-badge ' + adminEscape(log.severity || "info") + '">' + adminEscape(adminSeverityLabel(log.severity || "info")) + '</em>' +
          '</article>'
        ).join("");
      }

      function toggleAdminLogDrawer(logId) {
        const drawer = document.getElementById("admin-log-drawer");
        const body = document.getElementById("admin-log-drawer-body");
        if (!drawer || !body) return;
        if (!logId) {
          drawer.classList.remove("is-open");
          drawer.setAttribute("aria-hidden", "true");
          return;
        }
        const log = adminState.logs.find(item => String(item.id) === String(logId));
        if (!log) return;
        body.innerHTML =
          '<h2>' + adminEscape(adminActionLabel(log.action)) + '</h2>' +
          '<p>' + adminEscape(adminLogDescription(log)) + '</p>' +
          '<dl class="admin-drawer-facts">' +
            Object.entries(log).filter(([key]) => !["metadata"].includes(key)).map(([key, value]) => '<div><dt>' + adminEscape(adminFieldLabel(key)) + '<small> ' + adminEscape(key) + '</small></dt><dd>' + adminEscape(typeof value === "string" ? value : JSON.stringify(value)) + '</dd></div>').join("") +
          '</dl>' +
          '<pre>' + adminEscape(JSON.stringify(log.metadata || {}, null, 2)) + '</pre>';
        drawer.classList.add("is-open");
        drawer.setAttribute("aria-hidden", "false");
      }

      window.hydrateAdminModule = hydrateAdminModule;
    </script>
  `;
}

export function themeToggle() {
  return `
    <button id="theme-toggle" class="theme-toggle" type="button" aria-label="Toggle color mode" title="Toggle color mode">
      <span class="theme-moon">◐</span>
      <span class="theme-sun">◑</span>
    </button>
  `;
}

export function languageToggle(links, t) {
  const targetUrl = t === TEXT.zh ? links.enCurrent : links.zhCurrent;
  const label = t === TEXT.zh ? "ZH" : "EN";
  const title = t === TEXT.zh ? "Switch to English" : "切换到中文";

  return `
    <a class="language-toggle" href="${targetUrl}" aria-label="${title}" title="${title}">${label}</a>
  `;
}

export function topControls(links, t) {
  return `
    <div class="top-controls-zone">
      <div class="top-controls">
        ${languageToggle(links, t)}
        ${themeToggle()}
      </div>
    </div>
    <style>
      .top-controls-zone{
        position:fixed;
        top:0;
        right:0;
        width:176px;
        height:92px;
        z-index:80;
      }
      .top-controls{
        position:absolute;
        top:14px;
        right:14px;
        display:flex;
        align-items:center;
        gap:10px;
        opacity:0;
        transform:translateY(-8px);
        pointer-events:none;
        transition:opacity .16s ease, transform .16s ease;
      }
      .top-controls-zone:hover .top-controls,
      .top-controls-zone:focus-within .top-controls{
        opacity:1;
        transform:translateY(0);
        pointer-events:auto;
      }
      .top-controls .language-toggle,
      .top-controls .theme-toggle{
        position:static !important;
        top:auto !important;
        right:auto !important;
        margin:0 !important;
      }
      @media (max-width:760px) and (hover:none) and (pointer:coarse){
        .top-controls-zone{
          width:176px;
          height:76px;
        }
        .top-controls{
          top:12px;
          right:12px;
          opacity:1;
          transform:none;
          pointer-events:auto;
        }
      }
    </style>
  `;
}

export function themeScript() {
  return `
    <script>
      (function () {
        const button = document.getElementById("theme-toggle");
        if (!button) return;

        function setTheme(theme) {
          document.documentElement.classList.add("theme-switching");
          document.documentElement.dataset.theme = theme;
          try {
            localStorage.setItem("qssed-theme", theme);
          } catch {}
          window.setTimeout(() => {
            document.documentElement.classList.remove("theme-switching");
          }, 320);
        }

        button.addEventListener("click", () => {
          const currentTheme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
          setTheme(currentTheme === "light" ? "dark" : "light");
        });
      })();
    </script>
  `;
}

