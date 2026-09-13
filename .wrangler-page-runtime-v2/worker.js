var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// studio/config.js
var SUPABASE_URL = "https://xunbsoxijasekzadckob.supabase.co";
var SUPABASE_KEY = "sb_publishable_1ScwEvseisteYNgc5xM1pQ_NNekUmF1";
var ZH_COUNTRIES = ["CN", "HK", "MO", "TW", "SG"];
var ADMIN_EMAILS = [
  "qssed_a@icloud.com"
];
var MAX_STORAGE_FILE_BYTES = 50 * 1024 * 1024;
var MAX_STORAGE_LIST_OBJECTS = 1e4;
var UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
var OS_PATHS = /* @__PURE__ */ new Set([
  "/dashboard",
  "/info",
  "/info/knowledge",
  "/info/links",
  "/info/notes",
  "/info/summaries",
  "/info/search",
  "/profile",
  "/profile/details",
  "/profile/account",
  "/profile/preferences",
  "/workspace",
  "/workspace/workbench",
  "/workspace/projects",
  "/workspace/experiments",
  "/workspace/drafts",
  "/workspace/tasks",
  "/admin",
  "/admin/general",
  "/admin/users",
  "/admin/roles",
  "/admin/logs",
  "/admin/system",
  "/settings",
  "/settings/general",
  "/settings/appearance",
  "/settings/language",
  "/settings/security",
  "/settings/notifications",
  "/settings/ai",
  "/settings/integrations",
  "/settings/storage"
]);
var LEGACY_REDIRECTS = /* @__PURE__ */ new Map([
  ["/", "/dashboard"],
  ["/general", "/dashboard"],
  ["/general/infohub", "/info"],
  ["/personal", "/profile"],
  ["/profile/security", "/settings/security"]
]);
var TEXT = {
  en: {
    studioName: "QssedA Studio",
    signIn: "Sign In",
    signUp: "Sign Up",
    continue: "Continue",
    getStarted: "Get Started",
    adminOnly: "This area is reserved for listed administrators.",
    enterBirthDate: "Enter your birth date.",
    birthYear: "Year",
    birthMonth: "Month",
    birthDay: "Day",
    adminApprovalMessage: "Registration successful. An administrator will grant your account permissions later. Please tell the administrator that your account has been registered successfully. Click the button below to sign in. If you need to contact us, please email:",
    selectGender: "Select your gender.",
    male: "Male",
    female: "Female",
    hideGenderOnProfile: "Do not show my gender on my profile",
    chooseUsername: "Choose your username.",
    addProfileDetails: "Add your profile details, or skip for a faster setup.",
    skipName: "I do not want to provide this",
    enterEmail: "Enter your email.",
    setPassword: "Set your password to finish.",
    alreadyHaveAccount: "Already have an account? Sign in",
    dontHaveAccount: "Don't have an account? Sign up",
    loginDescription: "Sign in to continue.",
    signUpDescription: "Create an account to start using Studio.",
    usernamePlaceholder: "Username",
    firstNamePlaceholder: "First name",
    lastNamePlaceholder: "Last name",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Password",
    loading: "Loading...",
    account: "Account"
  },
  zh: {
    studioName: "QssedA Studio",
    signIn: "\u767B\u5F55",
    signUp: "\u6CE8\u518C",
    continue: "\u7EE7\u7EED",
    getStarted: "\u5F00\u59CB\u4F7F\u7528",
    adminOnly: "\u6B64\u533A\u57DF\u4EC5\u9650\u5DF2\u5217\u5165\u540D\u5355\u7684\u7BA1\u7406\u5458\u4F7F\u7528\u3002",
    enterBirthDate: "\u8BF7\u8F93\u5165\u4F60\u7684\u51FA\u751F\u65E5\u671F\u3002",
    birthYear: "\u5E74",
    birthMonth: "\u6708",
    birthDay: "\u65E5",
    adminApprovalMessage: "\u6CE8\u518C\u6210\u529F\u3002\u7BA1\u7406\u5458\u7A0D\u540E\u4F1A\u7ED9\u4E88\u4F60\u76F8\u5E94\u6743\u9650\u3002\u8BF7\u544A\u77E5\u7BA1\u7406\u5458\u4F60\u7684\u8D26\u53F7\u5DF2\u6CE8\u518C\u6210\u529F\u3002\u70B9\u51FB\u4E0B\u65B9\u6309\u94AE\u5373\u53EF\u767B\u5F55\u3002\u5982\u9700\u8054\u7CFB\u7BA1\u7406\u5458\uFF0C\u8BF7\u53D1\u90AE\u4EF6\u81F3\uFF1A",
    selectGender: "\u8BF7\u9009\u62E9\u4F60\u7684\u6027\u522B",
    male: "\u7537",
    female: "\u5973",
    hideGenderOnProfile: "\u4E0D\u5728\u4E2A\u4EBA\u8D44\u6599\u4E2D\u5C55\u793A\u6211\u7684\u6027\u522B",
    chooseUsername: "\u8BF7\u9009\u62E9\u4F60\u7684\u7528\u6237\u540D\u3002",
    addProfileDetails: "\u8BF7\u586B\u5199\u4F60\u7684\u8D44\u6599\uFF0C\u6216\u8DF3\u8FC7\u4EE5\u66F4\u5FEB\u5B8C\u6210\u8BBE\u7F6E\u3002",
    skipName: "\u6211\u4E0D\u60F3\u63D0\u4F9B",
    enterEmail: "\u8BF7\u8F93\u5165\u4F60\u7684\u90AE\u7BB1",
    setPassword: "\u8BF7\u8BBE\u7F6E\u5BC6\u7801\u4EE5\u5B8C\u6210\u6CE8\u518C",
    alreadyHaveAccount: "\u5DF2\u6709\u8D26\u53F7\uFF1F\u767B\u5F55",
    dontHaveAccount: "\u8FD8\u6CA1\u6709\u8D26\u53F7\uFF1F\u6CE8\u518C",
    loginDescription: "\u767B\u5F55\u540E\u7EE7\u7EED",
    signUpDescription: "\u521B\u5EFA\u8D26\u53F7\u5E76\u5F00\u59CB\u4F7F\u7528 Studio",
    usernamePlaceholder: "\u7528\u6237\u540D",
    firstNamePlaceholder: "\u59D3",
    lastNamePlaceholder: "\u540D",
    emailPlaceholder: "\u90AE\u7BB1",
    passwordPlaceholder: "\u5BC6\u7801",
    loading: "\u52A0\u8F7D\u4E2D...",
    account: "\u8D26\u53F7"
  }
};

// studio/routing.js
function getRouteInfo(request) {
  const url = new URL(request.url);
  const ip = request.headers.get("CF-Connecting-IP") || "Unknown";
  const country = request.cf?.country || "Unknown";
  const region = request.cf?.region || request.cf?.regionCode || "";
  const city = request.cf?.city || "";
  const pathParts = url.pathname.split("/").filter(Boolean);
  const firstSegment = pathParts[0]?.toLowerCase();
  let pathname = url.pathname;
  let locale;
  if (firstSegment === "zh-cn") {
    locale = "zh";
    pathname = "/" + pathParts.slice(1).join("/");
  } else if (firstSegment === "en") {
    locale = "en";
    pathname = "/" + pathParts.slice(1).join("/");
  }
  if (!pathname || pathname === "//") {
    pathname = "/";
  }
  if (!locale) {
    const lang = (url.searchParams.get("lang") || "").toLowerCase();
    if (lang === "zh" || lang === "zh-cn") {
      locale = "zh";
    } else if (lang === "en") {
      locale = "en";
    } else {
      locale = ZH_COUNTRIES.includes(country) ? "zh" : "en";
    }
  }
  return {
    pathname,
    locale,
    ipInfo: {
      ip,
      country,
      region,
      city,
      locale
    }
  };
}
__name(getRouteInfo, "getRouteInfo");
function buildLinks(locale, pathname) {
  const prefix = locale === "zh" ? "/zh-cn" : "/en";
  const currentPath = pathname === "/" ? "" : pathname;
  return {
    login: `${prefix}/login`,
    signUp: `${prefix}/sign-up`,
    dashboard: `${prefix}/dashboard`,
    zhCurrent: `/zh-cn${currentPath}`,
    enCurrent: `/en${currentPath}`
  };
}
__name(buildLinks, "buildLinks");
function html(content, status = 200) {
  return new Response(content, {
    status,
    headers: {
      "content-type": "text/html;charset=UTF-8"
    }
  });
}
__name(html, "html");
function localizedRedirect(request, locale, pathname) {
  const url = new URL(request.url);
  const prefix = locale === "zh" ? "/zh-cn" : "/en";
  url.pathname = `${prefix}${pathname}`;
  return Response.redirect(url.toString(), 302);
}
__name(localizedRedirect, "localizedRedirect");
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "cache-control": "no-store"
    }
  });
}
__name(json, "json");

// studio/ui-page.js
function baseHead(title) {
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
    <\/script>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"><\/script>
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
/* APPLE_DESIGN_SYSTEM_V2 \u2014 shared surfaces */
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
__name(baseHead, "baseHead");
function supabaseScript() {
  return `
    <script>
      const supabaseClient = supabase.createClient(
        "${SUPABASE_URL}",
        "${SUPABASE_KEY}"
      );
    <\/script>
  `;
}
__name(supabaseScript, "supabaseScript");
function themeToggle() {
  return `
    <button id="theme-toggle" class="theme-toggle" type="button" aria-label="Toggle color mode" title="Toggle color mode">
      <span class="theme-moon">\u25D0</span>
      <span class="theme-sun">\u25D1</span>
    </button>
  `;
}
__name(themeToggle, "themeToggle");
function languageToggle(links, t) {
  const targetUrl = t === TEXT.zh ? links.enCurrent : links.zhCurrent;
  const label = t === TEXT.zh ? "ZH" : "EN";
  const title = t === TEXT.zh ? "Switch to English" : "\u5207\u6362\u5230\u4E2D\u6587";
  return `
    <a class="language-toggle" href="${targetUrl}" aria-label="${title}" title="${title}">${label}</a>
  `;
}
__name(languageToggle, "languageToggle");
function topControls(links, t) {
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
__name(topControls, "topControls");
function themeScript() {
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
    <\/script>
  `;
}
__name(themeScript, "themeScript");

// studio/auth-handoff.js
async function handleAuthHandoff(request, env, locale) {
  const origin = request.headers.get("Origin") || "";
  const referer = request.headers.get("Referer") || "";
  const fetchSite = (request.headers.get("Sec-Fetch-Site") || "").toLowerCase();
  const fetchMode = (request.headers.get("Sec-Fetch-Mode") || "").toLowerCase();
  const fetchDest = (request.headers.get("Sec-Fetch-Dest") || "").toLowerCase();
  const productionOrigin = "https://auth.qsseda.studio";
  const previewAllowed = env?.AUTH_PREVIEW_ALLOW_WORKERS_DEV === "1";
  let refererOrigin = "";
  try {
    refererOrigin = referer ? new URL(referer).origin : "";
  } catch {
  }
  const missingOrigin = origin === "" || origin === "null";
  const trustedRefererFallback = missingOrigin && refererOrigin === productionOrigin;
  const trustedSameSiteNavigation = missingOrigin && (fetchSite === "same-site" || fetchSite === "same-origin") && (fetchMode === "navigate" || fetchMode === "") && (fetchDest === "document" || fetchDest === "");
  const trustedProductionHandoff = origin === productionOrigin || trustedRefererFallback || trustedSameSiteNavigation;
  if (!trustedProductionHandoff && !previewAllowed) {
    return json({ error: "Invalid authentication origin" }, 403);
  }
  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Invalid handoff request" }, 400);
  }
  const accessToken = typeof form.get("access_token") === "string" ? form.get("access_token") : "";
  const refreshToken = typeof form.get("refresh_token") === "string" ? form.get("refresh_token") : "";
  const next = normalizeHandoffNext(form.get("next"), locale);
  if (!accessToken || !refreshToken) return json({ error: "Missing session" }, 400);
  let userResponse;
  try {
    userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}` } });
  } catch {
    return json({ error: "Authentication service unavailable" }, 503);
  }
  if (!userResponse.ok) return json({ error: "Session is invalid or expired" }, 401);
  const authUser = await userResponse.json();
  let profileResponse;
  try {
    profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=status&id=eq.${encodeURIComponent(authUser.id)}&limit=1`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}` } });
  } catch {
    return json({ error: "Account service unavailable" }, 503);
  }
  if (!profileResponse.ok) return json({ error: "Account service unavailable" }, 503);
  const profiles = await profileResponse.json();
  if (!Array.isArray(profiles) || profiles[0]?.status !== "active") return json({ error: "Account is not active" }, 403);
  return authHandoffHtml(accessToken, refreshToken, next);
}
__name(handleAuthHandoff, "handleAuthHandoff");
function normalizeHandoffNext(value, locale) {
  const candidate = typeof value === "string" ? value.trim() : "";
  const fallback = locale === "zh" ? "/zh-cn/dashboard" : "/en/dashboard";
  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\0")) return fallback;
  if (candidate.startsWith("/zh-cn/") || candidate.startsWith("/en/")) return candidate;
  const prefix = locale === "zh" ? "/zh-cn" : "/en";
  return `${prefix}${candidate === "/" ? "/dashboard" : candidate}`;
}
__name(normalizeHandoffNext, "normalizeHandoffNext");
function scriptLiteral(value) {
  return JSON.stringify(String(value || "")).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
__name(scriptLiteral, "scriptLiteral");
function authHandoffHtml(accessToken, refreshToken, next) {
  const page = `<!DOCTYPE html><html><head>${baseHead("QssedA Studio")}</head><body><main style="min-height:100vh;display:grid;place-items:center;padding:24px"><section style="text-align:center"><h1 style="font-size:24px;margin:0 0 8px">QssedA Studio</h1><p id="handoff-status" style="color:var(--muted,#8e8e93)">\u6B63\u5728\u540C\u6B65\u767B\u5F55\u72B6\u6001\u2026</p></section></main>${supabaseScript()}<script>(async()=>{const status=document.getElementById("handoff-status");const result=await supabaseClient.auth.setSession({access_token:${scriptLiteral(accessToken)},refresh_token:${scriptLiteral(refreshToken)}});if(result.error){status.textContent="\u767B\u5F55\u72B6\u6001\u540C\u6B65\u5931\u8D25\uFF0C\u8BF7\u8FD4\u56DE\u8BA4\u8BC1\u4E2D\u5FC3\u91CD\u8BD5\u3002";return}location.replace(${scriptLiteral(next)})})().catch(()=>{document.getElementById("handoff-status").textContent="\u767B\u5F55\u72B6\u6001\u540C\u6B65\u5931\u8D25\uFF0C\u8BF7\u8FD4\u56DE\u8BA4\u8BC1\u4E2D\u5FC3\u91CD\u8BD5\u3002"})<\/script></body></html>`;
  return new Response(page, { status: 200, headers: { "content-type": "text/html;charset=UTF-8", "cache-control": "no-store", "referrer-policy": "no-referrer", "x-content-type-options": "nosniff" } });
}
__name(authHandoffHtml, "authHandoffHtml");

// studio/server-runtime.js
function getSupabaseSecret(env) {
  return env?.SUPABASE_SECRET_KEY || env?.SUPABASE_SERVICE_ROLE_KEY || "";
}
__name(getSupabaseSecret, "getSupabaseSecret");
function workerLog(level, event, details = {}) {
  const payload = JSON.stringify({
    source: "qsseda-worker",
    event,
    ...details
  });
  const method = level === "error" ? "error" : level === "warn" ? "warn" : "info";
  console[method](payload);
}
__name(workerLog, "workerLog");

// studio/storage-api.js
function storageUnavailable() {
  return json({ error: "Storage service is temporarily unavailable." }, 503);
}
__name(storageUnavailable, "storageUnavailable");
function hasStorageBinding(env) {
  return Boolean(env?.STORAGE && ["list", "get", "put", "head", "delete"].every((method) => typeof env.STORAGE[method] === "function"));
}
__name(hasStorageBinding, "hasStorageBinding");
function isStorageObjectId(value) {
  return typeof value === "string" && UUID_PATTERN.test(value);
}
__name(isStorageObjectId, "isStorageObjectId");
function storageKey(ownerId, objectId) {
  return `users/${ownerId}/${objectId}`;
}
__name(storageKey, "storageKey");
function storagePrefix(ownerId) {
  return `users/${ownerId}/`;
}
__name(storagePrefix, "storagePrefix");
function cleanStorageFilename(value) {
  const normalized = String(value || "").normalize("NFC").replace(/[\u0000-\u001f\u007f]/g, "").replace(/[\\/]/g, " ").replace(/\s+/g, " ").trim();
  return Array.from(normalized).slice(0, 180).join("") || "file";
}
__name(cleanStorageFilename, "cleanStorageFilename");
function storageContentType(value) {
  const type = String(value || "").trim().toLowerCase();
  return /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+(?:\s*;\s*charset=[a-z0-9._-]+)?$/.test(type) ? type.slice(0, 160) : "application/octet-stream";
}
__name(storageContentType, "storageContentType");
function storageDownloadDisposition(filename) {
  const safeName = cleanStorageFilename(filename);
  const fallback = Array.from(safeName).map((char) => /[A-Za-z0-9._-]/.test(char) ? char : "_").join("").replace(/^_+|_+$/g, "").slice(0, 120) || "file";
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encodeRfc8187Filename(safeName)}`;
}
__name(storageDownloadDisposition, "storageDownloadDisposition");
function encodeRfc8187Filename(value) {
  return encodeURIComponent(value).replace(/['()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}
__name(encodeRfc8187Filename, "encodeRfc8187Filename");
async function verifyStorageUser(request, env) {
  const authorization = request.headers.get("Authorization") || "";
  if (!/^Bearer\s+\S+$/i.test(authorization)) {
    return { error: json({ error: "Authentication required." }, 401) };
  }
  let response;
  try {
    response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: authorization
      }
    });
  } catch {
    return { error: json({ error: "Authentication service is temporarily unavailable." }, 503) };
  }
  if (response.status === 401 || response.status === 403) {
    return { error: json({ error: "Session is invalid or expired." }, 401) };
  }
  if (!response.ok) {
    return { error: json({ error: "Authentication service is temporarily unavailable." }, 503) };
  }
  let user;
  try {
    user = await response.json();
  } catch {
    return { error: json({ error: "Authentication service is temporarily unavailable." }, 503) };
  }
  if (!isStorageObjectId(user?.id)) {
    return { error: json({ error: "Session is invalid or expired." }, 401) };
  }
  const secret = getSupabaseSecret(env);
  if (!secret) {
    return { error: json({ error: "Account service is temporarily unavailable." }, 503) };
  }
  let profileResponse;
  try {
    profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=status&id=eq.${encodeURIComponent(user.id)}`, {
      headers: {
        apikey: secret,
        ...secret.split(".").length === 3 ? { Authorization: `Bearer ${secret}` } : {}
      }
    });
  } catch {
    return { error: json({ error: "Account service is temporarily unavailable." }, 503) };
  }
  if (!profileResponse.ok) {
    return { error: json({ error: "Account service is temporarily unavailable." }, 503) };
  }
  let profiles;
  try {
    profiles = await profileResponse.json();
  } catch {
    return { error: json({ error: "Account service is temporarily unavailable." }, 503) };
  }
  if (!Array.isArray(profiles) || profiles.length !== 1 || profiles[0]?.status !== "active") {
    return { error: json({ error: "Account is not authorized to use storage." }, 403) };
  }
  return { user };
}
__name(verifyStorageUser, "verifyStorageUser");
var StorageSizeLimitError = class extends Error {
  static {
    __name(this, "StorageSizeLimitError");
  }
};
function sizeLimitedStorageBody(body, maximumBytes) {
  if (!body) return null;
  const reader = body.getReader();
  let total = 0;
  return new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        total += value.byteLength;
        if (total > maximumBytes) {
          await reader.cancel();
          controller.error(new StorageSizeLimitError("File exceeds the 50 MB limit."));
          return;
        }
        controller.enqueue(value);
      } catch (error) {
        controller.error(error);
      }
    },
    async cancel(reason) {
      await reader.cancel(reason);
    }
  });
}
__name(sizeLimitedStorageBody, "sizeLimitedStorageBody");
async function handleStorageFiles(request, env) {
  const auth = await verifyStorageUser(request, env);
  if (auth.error) return auth.error;
  if (!hasStorageBinding(env)) return storageUnavailable();
  const files = [];
  let cursor;
  let scanned = 0;
  let partial = false;
  try {
    do {
      const remaining = MAX_STORAGE_LIST_OBJECTS - scanned;
      const page = await env.STORAGE.list({
        prefix: storagePrefix(auth.user.id),
        cursor,
        limit: Math.min(1e3, remaining),
        include: ["httpMetadata", "customMetadata"]
      });
      scanned += page.objects.length;
      for (const object of page.objects) {
        const id = object.key.slice(storagePrefix(auth.user.id).length);
        if (!isStorageObjectId(id)) continue;
        files.push({
          id,
          name: cleanStorageFilename(object.customMetadata?.originalName),
          size: Number(object.size) || 0,
          uploadedAt: object.uploaded?.toISOString?.() || null,
          contentType: storageContentType(object.httpMetadata?.contentType)
        });
      }
      cursor = page.cursor;
      if (!page.truncated) break;
      if (scanned >= MAX_STORAGE_LIST_OBJECTS || !cursor) {
        partial = true;
        break;
      }
    } while (cursor);
  } catch (error) {
    workerLog("error", "storage.list.failed", { message: String(error?.message || error) });
    return storageUnavailable();
  }
  files.sort((a, b) => String(b.uploadedAt || "").localeCompare(String(a.uploadedAt || "")));
  return json({
    connected: true,
    files,
    file_count: files.length,
    used_bytes: files.reduce((total, file) => total + file.size, 0),
    partial
  });
}
__name(handleStorageFiles, "handleStorageFiles");
async function handleStorageUpload(request, env) {
  const auth = await verifyStorageUser(request, env);
  if (auth.error) return auth.error;
  if (!hasStorageBinding(env)) return storageUnavailable();
  const headerSize = request.headers.get("Content-Length") || request.headers.get("X-File-Size");
  if (headerSize && (!/^\d+$/.test(headerSize) || Number(headerSize) > MAX_STORAGE_FILE_BYTES)) {
    return json({ error: "File exceeds the 50 MB limit." }, 413);
  }
  if (!request.body) return json({ error: "A file body is required." }, 400);
  const id = crypto.randomUUID();
  const key = storageKey(auth.user.id, id);
  const name = cleanStorageFilename(new URL(request.url).searchParams.get("name"));
  try {
    await env.STORAGE.put(key, sizeLimitedStorageBody(request.body, MAX_STORAGE_FILE_BYTES), {
      httpMetadata: { contentType: storageContentType(request.headers.get("Content-Type")) },
      customMetadata: { originalName: name, ownerId: auth.user.id }
    });
  } catch (error) {
    try {
      await env.STORAGE.delete(key);
    } catch {
    }
    if (error instanceof StorageSizeLimitError || /50\s*MB|exceeds the 50 MB/i.test(String(error?.message || error))) {
      return json({ error: "File exceeds the 50 MB limit." }, 413);
    }
    workerLog("error", "storage.upload.failed", { message: String(error?.message || error) });
    return storageUnavailable();
  }
  return json({ id, name, message: "File uploaded." }, 201);
}
__name(handleStorageUpload, "handleStorageUpload");
async function handleStorageObject(request, env) {
  const auth = await verifyStorageUser(request, env);
  if (auth.error) return auth.error;
  if (!hasStorageBinding(env)) return storageUnavailable();
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!isStorageObjectId(id)) return json({ error: "Invalid object id." }, 400);
  const key = storageKey(auth.user.id, id);
  if (request.method === "DELETE") {
    try {
      const existing = await env.STORAGE.head(key);
      if (!existing) return json({ error: "File not found." }, 404);
      await env.STORAGE.delete(key);
      return json({ id, message: "File deleted." });
    } catch (error) {
      workerLog("error", "storage.delete.failed", { message: String(error?.message || error) });
      return storageUnavailable();
    }
  }
  try {
    const object = await env.STORAGE.get(key);
    if (!object) return json({ error: "File not found." }, 404);
    return new Response(object.body, {
      headers: {
        "content-type": "application/octet-stream",
        "content-disposition": storageDownloadDisposition(object.customMetadata?.originalName),
        "cache-control": "private, no-store",
        "x-content-type-options": "nosniff"
      }
    });
  } catch (error) {
    workerLog("error", "storage.download.failed", { message: String(error?.message || error) });
    return storageUnavailable();
  }
}
__name(handleStorageObject, "handleStorageObject");

// studio/account-api.js
function getRequestCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  const prefix = name + "=";
  const item = header.split(";").map((part) => part.trim()).find((part) => part.startsWith(prefix));
  if (!item) return "";
  try {
    return decodeURIComponent(item.slice(prefix.length));
  } catch {
    return "";
  }
}
__name(getRequestCookie, "getRequestCookie");
function getWorkerRequestId(request) {
  return request.headers.get("CF-Ray") || crypto.randomUUID();
}
__name(getWorkerRequestId, "getWorkerRequestId");
function parseServerUserAgent(userAgent) {
  const ua = userAgent || "";
  const browser = ua.includes("Edg/") ? "Edge" : ua.includes("Chrome/") ? "Chrome" : ua.includes("Firefox/") ? "Firefox" : ua.includes("Safari/") ? "Safari" : "Unknown";
  const os = ua.includes("Windows") ? "Windows" : ua.includes("Mac OS") ? "macOS" : ua.includes("Android") ? "Android" : ua.includes("iPhone") || ua.includes("iPad") ? "iOS" : ua.includes("Linux") ? "Linux" : "Unknown";
  const device_type = /Mobile|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop";
  return { user_agent: ua, browser, os, device_type };
}
__name(parseServerUserAgent, "parseServerUserAgent");
async function recentFailedLoginCount(env, ipAddress, logContext) {
  const secret = getSupabaseSecret(env);
  if (!secret || !ipAddress || ipAddress === "Unknown") return 0;
  const since = new Date(Date.now() - 15 * 60 * 1e3).toISOString();
  const url = new URL(`${SUPABASE_URL}/rest/v1/login_events`);
  url.searchParams.set("select", "id");
  url.searchParams.set("success", "eq.false");
  url.searchParams.set("ip_address", `eq.${ipAddress}`);
  url.searchParams.set("created_at", `gte.${since}`);
  url.searchParams.set("limit", "20");
  try {
    const response = await fetch(url.toString(), { headers: { apikey: secret, ...secret.split(".").length === 3 ? { Authorization: `Bearer ${secret}` } : {} } });
    if (!response.ok) {
      workerLog("warn", "auth.risk_query_failed", { ...logContext, upstream_status: response.status });
      return 0;
    }
    const rows = await response.json();
    return Array.isArray(rows) ? rows.length : 0;
  } catch (error) {
    workerLog("error", "auth.risk_query_error", { ...logContext, error_type: error?.name || "Error" });
    return 0;
  }
}
__name(recentFailedLoginCount, "recentFailedLoginCount");
async function recordServerLoginEvent(env, request, ipInfo, user, success, deviceId, logContext) {
  const secret = getSupabaseSecret(env);
  if (!secret) {
    workerLog("warn", "auth.audit.disabled", { ...logContext, reason: "missing_supabase_secret" });
    return {
      loginEventWritten: false,
      auditLogWritten: false,
      riskLevel: success ? "\u6B63\u5E38" : "\u6CE8\u610F",
      recentFailures: success ? 0 : 1
    };
  }
  const userAgent = request.headers.get("User-Agent") || "";
  const device = parseServerUserAgent(userAgent);
  const previousFailures = success ? 0 : await recentFailedLoginCount(env, ipInfo?.ip || "", logContext);
  const riskLevel = success ? "\u6B63\u5E38" : previousFailures >= 4 ? "\u9AD8\u98CE\u9669" : "\u6CE8\u610F";
  const severity = riskLevel === "\u9AD8\u98CE\u9669" ? "danger" : riskLevel === "\u6CE8\u610F" ? "warning" : "info";
  const safeDeviceId = typeof deviceId === "string" ? deviceId.slice(0, 160) : "";
  let loginEventWritten = false;
  let auditLogWritten = success;
  const event = {
    user_id: user?.id || null,
    event_type: "login",
    success: Boolean(success),
    provider: "password",
    ip_address: ipInfo?.ip || "",
    country: ipInfo?.country || "",
    region: ipInfo?.region || "",
    city: ipInfo?.city || "",
    user_agent: userAgent.slice(0, 1024),
    browser: device.browser,
    os: device.os,
    device_type: device.device_type,
    device_id: safeDeviceId,
    risk_level: riskLevel
  };
  try {
    const eventResponse = await fetch(`${SUPABASE_URL}/rest/v1/login_events`, {
      method: "POST",
      headers: {
        apikey: secret,
        ...secret.split(".").length === 3 ? { Authorization: `Bearer ${secret}` } : {},
        "content-type": "application/json",
        prefer: "return=minimal"
      },
      body: JSON.stringify(event)
    });
    loginEventWritten = eventResponse.ok;
    if (!eventResponse.ok) {
      workerLog("error", "auth.audit.write_failed", {
        ...logContext,
        target: "login_events",
        upstream_status: eventResponse.status
      });
    }
    if (!success) {
      const auditResponse = await fetch(`${SUPABASE_URL}/rest/v1/audit_logs`, {
        method: "POST",
        headers: {
          apikey: secret,
          ...secret.split(".").length === 3 ? { Authorization: `Bearer ${secret}` } : {},
          "content-type": "application/json",
          prefer: "return=minimal"
        },
        body: JSON.stringify({
          actor_user_id: null,
          actor_email: null,
          action: "auth.login.failed",
          target_type: "auth",
          target_id: null,
          target_label: "Password login",
          description: "Failed password login attempt",
          ip_address: ipInfo?.ip || "",
          user_agent: userAgent.slice(0, 1024),
          severity,
          metadata: {
            country: ipInfo?.country || "",
            region: ipInfo?.region || "",
            city: ipInfo?.city || "",
            browser: device.browser,
            os: device.os,
            device_type: device.device_type,
            risk_level: riskLevel,
            recent_failures_15m: previousFailures + 1
          }
        })
      });
      auditLogWritten = auditResponse.ok;
      if (!auditResponse.ok) {
        workerLog("error", "auth.audit.write_failed", {
          ...logContext,
          target: "audit_logs",
          upstream_status: auditResponse.status
        });
      }
    }
  } catch (error) {
    workerLog("error", "auth.audit.error", { ...logContext, error_type: error?.name || "Error" });
  }
  return {
    loginEventWritten,
    auditLogWritten,
    riskLevel,
    recentFailures: success ? 0 : previousFailures + 1
  };
}
__name(recordServerLoginEvent, "recordServerLoginEvent");
function registrationUsernameRule(username) {
  const value = String(username || "").trim();
  const key = value.toLowerCase();
  if (value.length < 3) return "too_short";
  if (key.includes("tianguo")) return "reserved_tianguo";
  if (key.includes("admin")) return "reserved_admin";
  return "";
}
__name(registrationUsernameRule, "registrationUsernameRule");
function registrationEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}
__name(registrationEmailValid, "registrationEmailValid");
function registrationPasswordChecks(password) {
  const value = String(password || "");
  return {
    length: value.length >= 8,
    number: /\d/.test(value),
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    special: /[^A-Za-z0-9\s]/.test(value)
  };
}
__name(registrationPasswordChecks, "registrationPasswordChecks");
function registrationHanNameValid(value, expectedLength) {
  const text = String(value || "").trim();
  return (expectedLength === 1 || expectedLength === 2) && Array.from(text).length === expectedLength && /^\p{Script=Han}+$/u.test(text);
}
__name(registrationHanNameValid, "registrationHanNameValid");
function registrationInternationalNameValid(value) {
  const text = String(value || "").trim();
  return text.length > 0 && text.length <= 80;
}
__name(registrationInternationalNameValid, "registrationInternationalNameValid");
async function handleRegistrationSignup(request, env, ipInfo) {
  const requestId = getWorkerRequestId(request);
  const secret = getSupabaseSecret(env);
  if (!secret) {
    workerLog("error", "auth.signup.disabled", { request_id: requestId, reason: "missing_supabase_secret" });
    return json({ error: "Registration service is temporarily unavailable." }, 503);
  }
  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Invalid registration request." }, 400);
  }
  const username = String(form.get("username") || "").trim();
  const firstName = String(form.get("first_name") || "").trim();
  const lastName = String(form.get("last_name") || "").trim();
  const surnameLength = Number(form.get("surname_length"));
  const givenNameLength = Number(form.get("given_name_length"));
  const birthDate = String(form.get("birth_date") || "").trim();
  const gender = String(form.get("gender") || "").trim();
  const hideGenderOnProfile = String(form.get("hide_gender_on_profile") || "") === "true";
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  const avatarValue = form.get("avatar");
  const avatarFile = avatarValue && typeof avatarValue !== "string" && typeof avatarValue.arrayBuffer === "function" ? avatarValue : null;
  const enforceChineseNameRules = ZH_COUNTRIES.includes(ipInfo?.country || "");
  const usernameRule = registrationUsernameRule(username);
  if (usernameRule) return json({ error: usernameRule, field: "username" }, 400);
  if (enforceChineseNameRules) {
    if (!registrationHanNameValid(firstName, surnameLength) || !registrationHanNameValid(lastName, givenNameLength)) {
      return json({ error: "invalid_real_name", field: "name" }, 400);
    }
  } else if (!registrationInternationalNameValid(firstName) || !registrationInternationalNameValid(lastName)) {
    return json({ error: "invalid_real_name", field: "name" }, 400);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return json({ error: "invalid_birth_date", field: "birth_date" }, 400);
  }
  if (gender !== "male" && gender !== "female") {
    return json({ error: "invalid_gender", field: "gender" }, 400);
  }
  if (!registrationEmailValid(email)) {
    return json({ error: "invalid_email", field: "email" }, 400);
  }
  const passwordChecks = registrationPasswordChecks(password);
  if (!Object.values(passwordChecks).every(Boolean)) {
    return json({ error: "weak_password", field: "password" }, 400);
  }
  const allowedAvatarTypes = /* @__PURE__ */ new Map([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"]
  ]);
  if (avatarFile) {
    if (!allowedAvatarTypes.has(avatarFile.type)) {
      return json({ error: "invalid_avatar_type", field: "avatar" }, 400);
    }
    if (avatarFile.size > 5 * 1024 * 1024) {
      return json({ error: "avatar_too_large", field: "avatar" }, 400);
    }
  }
  const privilegedHeaders = {
    apikey: secret,
    ...secret.split(".").length === 3 ? { Authorization: `Bearer ${secret}` } : {}
  };
  try {
    const availabilityResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/check_registration_username`, {
      method: "POST",
      headers: {
        ...privilegedHeaders,
        "content-type": "application/json"
      },
      body: JSON.stringify({ p_username: username })
    });
    if (!availabilityResponse.ok) {
      workerLog("error", "auth.signup.username_check_failed", { request_id: requestId, upstream_status: availabilityResponse.status });
      return json({ error: "Registration service is temporarily unavailable." }, 503);
    }
    const availability = await availabilityResponse.json();
    if (!availability?.available) {
      return json({ error: availability?.reason || "username_taken", field: "username" }, 409);
    }
  } catch (error) {
    workerLog("error", "auth.signup.username_check_error", { request_id: requestId, error_type: error?.name || "Error" });
    return json({ error: "Registration service is temporarily unavailable." }, 503);
  }
  let authPayload;
  try {
    const signupResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        email,
        password,
        data: {
          display_name: username,
          username,
          first_name: firstName,
          last_name: lastName,
          skipped_name: false,
          birth_date: birthDate,
          gender,
          hide_gender_on_profile: hideGenderOnProfile
        }
      })
    });
    authPayload = await signupResponse.json().catch(() => ({}));
    if (!signupResponse.ok) {
      workerLog("warn", "auth.signup.failed", { request_id: requestId, upstream_status: signupResponse.status });
      return json({ error: authPayload?.msg || authPayload?.message || authPayload?.error_description || "Unable to create account." }, signupResponse.status);
    }
  } catch (error) {
    workerLog("error", "auth.signup.error", { request_id: requestId, error_type: error?.name || "Error" });
    return json({ error: "Unable to create account." }, 502);
  }
  const userId = authPayload?.user?.id || authPayload?.id || "";
  let avatarStatus = avatarFile ? "failed" : "skipped";
  if (avatarFile && userId) {
    const ext = allowedAvatarTypes.get(avatarFile.type);
    const objectPath = `${userId}/avatar.${ext}`;
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/avatars/${objectPath}`;
    try {
      const uploadResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/avatars/${objectPath}`, {
        method: "POST",
        headers: {
          ...privilegedHeaders,
          "content-type": avatarFile.type,
          "x-upsert": "true"
        },
        body: await avatarFile.arrayBuffer()
      });
      if (uploadResponse.ok) {
        const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
          method: "PATCH",
          headers: {
            ...privilegedHeaders,
            "content-type": "application/json",
            prefer: "return=minimal"
          },
          body: JSON.stringify({ avatar_url: publicUrl, updated_at: (/* @__PURE__ */ new Date()).toISOString() })
        });
        avatarStatus = profileResponse.ok ? "saved" : "failed";
        if (!profileResponse.ok) {
          workerLog("warn", "auth.signup.avatar_profile_update_failed", { request_id: requestId, upstream_status: profileResponse.status });
        }
      } else {
        workerLog("warn", "auth.signup.avatar_upload_failed", { request_id: requestId, upstream_status: uploadResponse.status });
      }
    } catch (error) {
      workerLog("warn", "auth.signup.avatar_error", { request_id: requestId, error_type: error?.name || "Error" });
    }
  }
  workerLog("info", "auth.signup.succeeded", {
    request_id: requestId,
    avatar_status: avatarStatus,
    name_rules: enforceChineseNameRules ? "zh_ip" : "international_ip"
  });
  return json({ success: true, avatar_status: avatarStatus }, 200);
}
__name(handleRegistrationSignup, "handleRegistrationSignup");
async function handlePasswordLogin(request, env, ipInfo) {
  const startedAt = Date.now();
  const logContext = {
    request_id: getWorkerRequestId(request),
    country: ipInfo?.country || "Unknown"
  };
  let body;
  try {
    body = await request.json();
  } catch {
    workerLog("warn", "auth.login.invalid_request", { ...logContext, reason: "invalid_json" });
    return json({ error: "Invalid request body" }, 400);
  }
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const deviceId = typeof body?.device_id === "string" ? body.device_id : "";
  if (!email || !password) {
    workerLog("warn", "auth.login.invalid_request", { ...logContext, reason: "missing_credentials" });
    return json({ error: "Email and password are required" }, 400);
  }
  let authResponse;
  try {
    authResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });
  } catch (error) {
    workerLog("error", "auth.login.upstream_error", {
      ...logContext,
      error_type: error?.name || "Error",
      duration_ms: Date.now() - startedAt
    });
    return json({ error: "Authentication service unavailable" }, 502);
  }
  let authData;
  try {
    authData = await authResponse.json();
  } catch {
    workerLog("error", "auth.login.invalid_upstream_response", {
      ...logContext,
      upstream_status: authResponse.status,
      duration_ms: Date.now() - startedAt
    });
    return json({ error: "Authentication service returned an invalid response" }, 502);
  }
  const audit = await recordServerLoginEvent(
    env,
    request,
    ipInfo,
    authData?.user || null,
    authResponse.ok,
    deviceId,
    logContext
  );
  workerLog(authResponse.ok ? "info" : "warn", authResponse.ok ? "auth.login.success" : "auth.login.failed", {
    ...logContext,
    upstream_status: authResponse.status,
    risk_level: audit.riskLevel,
    recent_failures_15m: audit.recentFailures,
    login_event_written: audit.loginEventWritten,
    audit_log_written: audit.auditLogWritten,
    duration_ms: Date.now() - startedAt
  });
  return json(authData, authResponse.status);
}
__name(handlePasswordLogin, "handlePasswordLogin");

// studio/html-utils.js
function escapeHtmlText(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}
__name(escapeHtmlText, "escapeHtmlText");

// studio/ui-profile.js
function profileContent(path, zh) {
  if (path.endsWith("/account")) return accountAuditContent(zh);
  if (path.endsWith("/preferences")) return `<section class="os-card is-large"><h2>${zh ? "\u504F\u597D\u8BBE\u7F6E" : "Preferences"}</h2><p>${zh ? "\u4E3B\u9898\u548C\u8BED\u8A00\u53EF\u901A\u8FC7\u9875\u9762\u53F3\u4E0A\u89D2\u6309\u94AE\u5207\u6362\u3002\u5B57\u4F53\u548C\u901A\u77E5\u504F\u597D\u76EE\u524D\u6CA1\u6709\u4FDD\u5B58\u6216\u914D\u7F6E\u63A5\u53E3\u3002" : "Theme and language can be switched with the controls in the top-right corner. Font and notification preferences do not currently have configuration or persistence APIs."}</p></section>`;
  return `
    <section id="profile-summary" class="profile-home" data-profile-home>
      <div id="profile-cover" class="profile-cover" data-cover-style="aurora">
        <div class="profile-cover-noise" aria-hidden="true"></div>
        <div class="profile-cover-actions">
          <button id="profile-edit-button" class="profile-pill-button" type="button">${zh ? "\u7F16\u8F91\u8D44\u6599" : "Edit profile"}</button>
        </div>
      </div>

      <div class="profile-identity">
        <div id="profile-avatar" class="os-avatar profile-avatar-large">...</div>
        <div class="profile-identity-copy">
          <div class="profile-name-row">
            <h2 id="profile-display-name">${zh ? "\u6B63\u5728\u8BFB\u53D6\u8D26\u53F7\u8D44\u6599..." : "Loading account profile..."}</h2>
            <span class="profile-name-lock" title="${zh ? "\u59D3\u540D\u4E0D\u53EF\u4FEE\u6539" : "Name cannot be changed"}">\u{1F512}</span>
          </div>
          <p id="profile-email">...</p>
          <div id="profile-tags" class="os-chip-row"></div>
          <p id="profile-signature" class="profile-signature"></p>
        </div>
      </div>

      <div class="profile-home-grid">
        <article class="profile-section-card profile-about-card">
          <div class="profile-section-head">
            <div>
              <span class="profile-eyebrow">${zh ? "\u5173\u4E8E\u6211" : "About"}</span>
              <h3>${zh ? "\u4E2A\u4EBA\u4ECB\u7ECD" : "Profile"}</h3>
            </div>
          </div>
          <p id="profile-bio" class="profile-bio">${zh ? "\u8FD8\u6CA1\u6709\u586B\u5199\u4E2A\u4EBA\u4ECB\u7ECD\u3002" : "No bio yet."}</p>
          <div class="profile-meta-row">
            <span id="profile-presence" class="profile-presence">\u2728 ${zh ? "\u5728\u7EBF" : "Online"}</span>
            <span id="profile-location" class="profile-location"></span>
          </div>
          <div id="profile-interests" class="profile-interest-list"></div>
        </article>

        <article class="profile-section-card">
          <div class="profile-section-head">
            <div>
              <span class="profile-eyebrow">${zh ? "\u5FEB\u6377\u5165\u53E3" : "Quick access"}</span>
              <h3>${zh ? "\u6211\u7684\u7A7A\u95F4" : "My space"}</h3>
            </div>
          </div>
          <div class="profile-quick-grid">
            <a href="${zh ? "/zh-cn/profile/account" : "/en/profile/account"}"><span>\u25F7</span><strong>${zh ? "\u8D26\u6237\u4FE1\u606F" : "Account"}</strong><small>${zh ? "\u767B\u5F55\u3001\u8BBE\u5907\u4E0E\u5BA1\u8BA1" : "Sign-in, devices & audit"}</small></a>
            <a href="${zh ? "/zh-cn/settings/storage" : "/en/settings/storage"}"><span>\u2601\uFE0E</span><strong>${zh ? "\u79C1\u4EBA\u5B58\u50A8" : "Private storage"}</strong><small>${zh ? "\u7BA1\u7406 R2 \u6587\u4EF6" : "Manage R2 files"}</small></a>
            <a href="${zh ? "/zh-cn/info/links" : "/en/info/links"}"><span>\u2318</span><strong>${zh ? "\u6536\u85CF\u94FE\u63A5" : "Saved links"}</strong><small>${zh ? "\u4FE1\u606F\u4E2D\u5FC3\u5165\u53E3" : "Information center"}</small></a>
            <a href="${zh ? "/zh-cn/profile/preferences" : "/en/profile/preferences"}"><span>\u2699\uFE0E</span><strong>${zh ? "\u504F\u597D\u8BBE\u7F6E" : "Preferences"}</strong><small>${zh ? "\u5916\u89C2\u4E0E\u8BED\u8A00" : "Appearance & language"}</small></a>
          </div>
        </article>
      </div>

      <article class="profile-section-card profile-links-card">
        <div class="profile-section-head">
          <div>
            <span class="profile-eyebrow">${zh ? "\u8054\u7CFB\u4E0E\u94FE\u63A5" : "Contact & links"}</span>
            <h3>${zh ? "\u6211\u7684\u94FE\u63A5\u5E93" : "My link library"}</h3>
            <p>${zh ? "\u628A QQ\u3001GitHub\u3001Bilibili\u3001X\u3001\u4E2A\u4EBA\u7F51\u7AD9\u6216\u5176\u4ED6\u5165\u53E3\u96C6\u4E2D\u5728\u8FD9\u91CC\u3002" : "Keep QQ, GitHub, Bilibili, X, personal sites, and other destinations in one place."}</p>
          </div>
          <button id="profile-add-link" class="profile-pill-button profile-pill-secondary" type="button">\uFF0B ${zh ? "\u6DFB\u52A0\u94FE\u63A5" : "Add link"}</button>
        </div>
        <div id="profile-link-list" class="profile-link-list"></div>
      </article>
    </section>

    <div id="profile-sheet-backdrop" class="profile-sheet-backdrop" hidden></div>

    <aside id="profile-edit-sheet" class="profile-sheet" aria-hidden="true">
      <div class="profile-sheet-grabber" aria-hidden="true"></div>
      <div class="profile-sheet-head">
        <div><span class="profile-eyebrow">${zh ? "\u4E2A\u4EBA\u4E3B\u9875" : "Profile"}</span><h3>${zh ? "\u7F16\u8F91\u8D44\u6599" : "Edit profile"}</h3></div>
        <button class="profile-sheet-close" type="button" data-close-profile-sheet aria-label="${zh ? "\u5173\u95ED" : "Close"}">\xD7</button>
      </div>
      <div class="profile-sheet-body">
        <label class="profile-field"><span>${zh ? "\u59D3\u540D" : "Name"}</span><input id="profile-readonly-name" type="text" readonly aria-readonly="true"><small>${zh ? "\u59D3\u540D\u7531\u8D26\u53F7\u8D44\u6599\u786E\u5B9A\uFF0C\u4E0D\u5141\u8BB8\u5728\u4E2A\u4EBA\u4E3B\u9875\u4E2D\u4FEE\u6539\u3002" : "Your name comes from your account profile and cannot be changed here."}</small></label>
        <div class="profile-field">
          <span>${zh ? "\u5934\u50CF" : "Profile photo"}</span>
          <div class="profile-media-editor">
            <div id="profile-avatar-preview" class="profile-media-preview profile-avatar-preview"></div>
            <div class="profile-media-copy"><strong>${zh ? "\u66F4\u6362\u5934\u50CF" : "Change profile photo"}</strong><small>${zh ? "\u652F\u6301 JPG\u3001PNG\u3001WebP\uFF0C\u6700\u5927 5 MB\u3002\u5934\u50CF\u4F1A\u4FDD\u5B58\u5230\u4F60\u7684\u8D26\u53F7\u8D44\u6599\u4E2D\u3002" : "JPG, PNG, or WebP up to 5 MB. Your photo is saved to your account profile."}</small><button id="profile-avatar-choose" class="profile-inline-button" type="button">${zh ? "\u9009\u62E9\u56FE\u7247" : "Choose image"}</button></div>
            <input id="profile-avatar-file" type="file" accept="image/jpeg,image/png,image/webp" hidden>
          </div>
        </div>
        <div class="profile-field">
          <span>${zh ? "\u81EA\u5B9A\u4E49\u80CC\u666F" : "Custom background"}</span>
          <div class="profile-media-editor">
            <div id="profile-background-preview" class="profile-media-preview profile-background-preview"></div>
            <div class="profile-media-copy"><strong>${zh ? "\u4E0A\u4F20\u5C01\u9762\u80CC\u666F" : "Upload cover background"}</strong><small>${zh ? "\u652F\u6301 JPG\u3001PNG\u3001WebP\uFF0C\u6700\u5927 8 MB\u3002\u4E0A\u4F20\u56FE\u7247\u540E\u4F1A\u8986\u76D6\u4E0B\u9762\u7684\u4E3B\u9875\u914D\u8272\uFF1B\u6E05\u9664\u540E\u4F1A\u6062\u590D\u914D\u8272\u3002" : "JPG, PNG, or WebP up to 8 MB. An uploaded image overrides the color preset below; clearing it restores the preset."}</small><div class="profile-media-actions"><button id="profile-background-choose" class="profile-inline-button" type="button">${zh ? "\u9009\u62E9\u56FE\u7247" : "Choose image"}</button><button id="profile-background-clear" class="profile-inline-button secondary" type="button">${zh ? "\u6E05\u9664\u80CC\u666F" : "Clear background"}</button></div></div>
            <input id="profile-background-file" type="file" accept="image/jpeg,image/png,image/webp" hidden>
          </div>
        </div>
        <label class="profile-field"><span>${zh ? "\u4E2A\u6027\u7B7E\u540D" : "Signature"}</span><input id="profile-edit-signature" type="text" maxlength="80" placeholder="${zh ? "\u4E00\u53E5\u8BDD\u4ECB\u7ECD\u73B0\u5728\u7684\u4F60" : "A short line about you"}"><small>${zh ? "\u4F1A\u663E\u793A\u5728\u59D3\u540D\u4E0E\u90AE\u7BB1\u4E0B\u65B9\uFF0C\u5EFA\u8BAE\u63A7\u5236\u5728\u4E00\u53E5\u8BDD\u5185\u3002" : "Shown under your name and email. Keep it to one concise line."}</small></label>
        <label class="profile-field"><span>${zh ? "\u4E2A\u4EBA\u4ECB\u7ECD" : "Bio"}</span><textarea id="profile-edit-bio" maxlength="500" rows="5" placeholder="${zh ? "\u4ECB\u7ECD\u4F60\u7684\u5174\u8DA3\u3001\u65B9\u5411\u6216\u6B63\u5728\u505A\u7684\u4E8B" : "Share your interests, focus, or what you are working on"}"></textarea><small>${zh ? "\u7528\u4E8E\u201C\u5173\u4E8E\u6211\u201D\u533A\u57DF\uFF0C\u9002\u5408\u5199\u957F\u671F\u5174\u8DA3\u3001\u5B66\u4E60\u65B9\u5411\u6216\u6B63\u5728\u8FDB\u884C\u7684\u9879\u76EE\u3002" : "Used in the About section for longer-term interests, focus areas, or current projects."}</small></label>
        <label class="profile-field"><span>${zh ? "\u6240\u5728\u5730" : "Location"}</span><input id="profile-edit-location" type="text" maxlength="80" placeholder="${zh ? "\u4F8B\u5982\uFF1A\u82CF\u5DDE" : "For example: Suzhou"}"><small>${zh ? "\u4EC5\u586B\u5199\u4F60\u613F\u610F\u516C\u5F00\u5C55\u793A\u7684\u57CE\u5E02\u6216\u5730\u533A\uFF0C\u4E0D\u5EFA\u8BAE\u586B\u5199\u5177\u4F53\u4F4F\u5740\u3002" : "Only add a city or region you are comfortable showing. Avoid a precise address."}</small></label>
        <div class="profile-field"><span>${zh ? "\u5728\u7EBF\u72B6\u6001" : "Status"}</span><div class="profile-status-editor"><select id="profile-edit-status-kind"><option value="online">${zh ? "\u5728\u7EBF" : "Online"}</option><option value="focus">${zh ? "\u4E13\u6CE8\u4E2D" : "Focus"}</option><option value="busy">${zh ? "\u5FD9\u788C" : "Busy"}</option><option value="away">${zh ? "\u79BB\u5F00" : "Away"}</option><option value="offline">${zh ? "\u9690\u8EAB" : "Offline"}</option></select><input id="profile-edit-status-emoji" type="text" maxlength="8" value="\u2728" aria-label="${zh ? "\u72B6\u6001\u8868\u60C5" : "Status emoji"}"><input id="profile-edit-status-text" type="text" maxlength="80" placeholder="${zh ? "\u81EA\u5B9A\u4E49\u72B6\u6001\u6587\u5B57" : "Custom status text"}"></div></div>
        <label class="profile-field"><span>${zh ? "\u5174\u8DA3\u6807\u7B7E" : "Interests"}</span><input id="profile-edit-interests" type="text" placeholder="${zh ? "\u7528\u9017\u53F7\u5206\u9694\uFF0C\u4F8B\u5982\uFF1A\u7EDF\u8BA1\u5B66, AI, \u9A91\u884C" : "Comma-separated, e.g. Statistics, AI, Cycling"}"><small>${zh ? "\u6700\u591A 12 \u4E2A\u6807\u7B7E\u3002" : "Up to 12 tags."}</small></label>
        <div class="profile-field"><span>${zh ? "\u4E3B\u9875\u914D\u8272" : "Profile cover"}</span><div id="profile-cover-picker" class="profile-cover-picker">${["aurora", "sky", "sunset", "grape", "graphite", "mint"].map((value) => `<button type="button" data-cover-choice="${value}" aria-label="${value}"><span data-cover-style="${value}"></span></button>`).join("")}</div></div>
      </div>
      <div class="profile-sheet-actions"><button id="profile-save-button" class="profile-save-button" type="button">${zh ? "\u4FDD\u5B58" : "Save"}</button></div>
    </aside>

    <aside id="profile-link-sheet" class="profile-sheet profile-link-sheet" aria-hidden="true">
      <div class="profile-sheet-grabber" aria-hidden="true"></div>
      <div class="profile-sheet-head">
        <div><span class="profile-eyebrow">${zh ? "\u94FE\u63A5\u5E93" : "Link library"}</span><h3 id="profile-link-sheet-title">${zh ? "\u6DFB\u52A0\u94FE\u63A5" : "Add link"}</h3></div>
        <button class="profile-sheet-close" type="button" data-close-profile-link-sheet aria-label="${zh ? "\u5173\u95ED" : "Close"}">\xD7</button>
      </div>
      <div class="profile-sheet-body">
        <input id="profile-link-id" type="hidden">
        <div class="profile-link-presets"><button type="button" data-link-preset="QQ">QQ</button><button type="button" data-link-preset="GitHub">GitHub</button><button type="button" data-link-preset="Bilibili">Bilibili</button><button type="button" data-link-preset="X">X</button><button type="button" data-link-preset="${zh ? "\u4E2A\u4EBA\u7F51\u7AD9" : "Website"}">${zh ? "\u4E2A\u4EBA\u7F51\u7AD9" : "Website"}</button></div>
        <label class="profile-field"><span>${zh ? "\u540D\u79F0" : "Title"}</span><input id="profile-link-title" type="text" maxlength="50" placeholder="QQ / GitHub / Website"></label>
        <label class="profile-field"><span>${zh ? "\u94FE\u63A5" : "URL"}</span><input id="profile-link-url" type="url" maxlength="1024" placeholder="https://"></label>
        <label class="profile-field"><span>${zh ? "\u5206\u7C7B" : "Category"}</span><select id="profile-link-category"><option value="social">${zh ? "\u793E\u4EA4" : "Social"}</option><option value="developer">${zh ? "\u5F00\u53D1\u8005" : "Developer"}</option><option value="site">${zh ? "\u7F51\u7AD9" : "Website"}</option><option value="contact">${zh ? "\u8054\u7CFB\u65B9\u5F0F" : "Contact"}</option><option value="other">${zh ? "\u5176\u4ED6" : "Other"}</option></select></label>
        <label class="profile-field"><span>${zh ? "\u5907\u6CE8" : "Note"}</span><input id="profile-link-note" type="text" maxlength="140" placeholder="${zh ? "\u53EF\u9009" : "Optional"}"></label>
        <label class="profile-pin-row"><input id="profile-link-pinned" type="checkbox"><span>${zh ? "\u7F6E\u9876\u8FD9\u4E2A\u94FE\u63A5" : "Pin this link"}</span></label>
      </div>
      <div class="profile-sheet-actions"><button id="profile-link-save" class="profile-save-button" type="button">${zh ? "\u4FDD\u5B58\u94FE\u63A5" : "Save link"}</button></div>
    </aside>
  `;
}
__name(profileContent, "profileContent");
function accountAuditContent(zh) {
  return `
    <section class="audit-grid">
      <article class="os-card is-large">
        <h2>${zh ? "\u8D26\u53F7\u57FA\u672C\u4FE1\u606F" : "Account Information"}</h2>
        <dl class="audit-facts">
          <div><dt>${zh ? "\u6CE8\u518C\u65F6\u95F4" : "Registered at"}</dt><dd id="audit-created-at">...</dd></div>
          <div><dt>${zh ? "\u8D26\u53F7 ID" : "Account ID"}</dt><dd id="audit-user-id">...</dd></div>
          <div><dt>${zh ? "\u90AE\u7BB1" : "Email"}</dt><dd id="audit-email">...</dd></div>
          <div><dt>${zh ? "\u6700\u8FD1\u767B\u5F55" : "Last sign-in"}</dt><dd id="audit-last-sign-in">...</dd></div>
        </dl>
      </article>
      <article class="os-card">
        <h2>${zh ? "\u6700\u8FD1\u5BA1\u8BA1\u7EDF\u8BA1" : "Recent Audit Stats"}</h2>
        <div class="audit-stats">
          <span><strong id="audit-login-count">0</strong>${zh ? "\u6700\u8FD1\u767B\u5F55\u8BB0\u5F55" : "recent events"}</span>
          <span><strong id="audit-device-count">0</strong>${zh ? "\u6700\u8FD1\u8BBE\u5907" : "recent devices"}</span>
          <span><strong id="audit-risk-count">0</strong>${zh ? "\u6700\u8FD1\u98CE\u9669" : "recent risks"}</span>
        </div>
      </article>
    </section>
    <section class="os-card audit-section">
      <h2>${zh ? "\u767B\u5F55\u8BB0\u5F55" : "Login Records"}</h2>
      <div id="audit-login-table" class="audit-table"></div>
    </section>
  `;
}
__name(accountAuditContent, "accountAuditContent");
function profileClientScript() {
  return `<script>
      /* PROFILE_HOME_V3 */
      const PROFILE_HOME_CACHE_PREFIX = "qssed-profile-home-v3:";
      let profileHomeState = { user: null, personalization: null, links: [], editingLinkId: null };

      function profileHomeIsZh() { return location.pathname.startsWith("/zh-cn/"); }
      function profileHomeEscape(value) { return auditEscape(value == null ? "" : String(value)); }
      function profileHomeCacheKey(userId) { return PROFILE_HOME_CACHE_PREFIX + String(userId || ""); }
      function profileHomeStatusLabel(kind) {
        const zh = profileHomeIsZh();
        const labels = zh ? { online:"\u5728\u7EBF", focus:"\u4E13\u6CE8\u4E2D", busy:"\u5FD9\u788C", away:"\u79BB\u5F00", offline:"\u9690\u8EAB" } : { online:"Online", focus:"Focus", busy:"Busy", away:"Away", offline:"Offline" };
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
          status_emoji: row?.status_emoji || "\u2728",
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
        if (signature) signature.textContent = p.signature || (profileHomeIsZh() ? "\u8FD8\u6CA1\u6709\u8BBE\u7F6E\u4E2A\u6027\u7B7E\u540D\u3002" : "No signature yet.");
        const bio = document.getElementById("profile-bio");
        if (bio) bio.textContent = p.bio || (profileHomeIsZh() ? "\u8FD8\u6CA1\u6709\u586B\u5199\u4E2A\u4EBA\u4ECB\u7ECD\u3002" : "No bio yet.");
        const presence = document.getElementById("profile-presence");
        if (presence) presence.textContent = (p.status_emoji || "\u2728") + " " + (p.status_text || profileHomeStatusLabel(p.status_kind));
        const location = document.getElementById("profile-location");
        if (location) { location.textContent = p.location ? "\u2316 " + p.location : ""; location.hidden = !p.location; }
        const interests = document.getElementById("profile-interests");
        if (interests) interests.innerHTML = p.interests.length ? p.interests.map(item => '<span>' + profileHomeEscape(item) + '</span>').join("") : '<span class="profile-interest-empty">' + (profileHomeIsZh() ? "\u6DFB\u52A0\u5174\u8DA3\u6807\u7B7E\uFF0C\u8BA9\u4E3B\u9875\u66F4\u50CF\u4F60\u3002" : "Add interests to make this profile yours.") + '</span>';
        renderProfileLinks();
      }
      function profileLinkIcon(title, category) {
        const t=String(title||"").toLowerCase();
        if(t.includes("qq")) return "Q";
        if(t.includes("github")) return "\u2318";
        if(t.includes("bilibili")||t.includes("b\u7AD9")) return "B";
        if(t==="x"||t.includes("twitter")) return "\u{1D54F}";
        if(category==="developer") return "</>";
        if(category==="contact") return "@";
        if(category==="site") return "\u2302";
        return "\u2197";
      }
      function renderProfileLinks() {
        const list=document.getElementById("profile-link-list"); if(!list) return;
        const links=[...(profileHomeState.links||[])].sort((a,b)=>Number(b.pinned)-Number(a.pinned)||Number(a.sort_order||0)-Number(b.sort_order||0)||String(a.created_at||"").localeCompare(String(b.created_at||"")));
        if(!links.length){ list.innerHTML='<div class="profile-link-empty"><strong>'+(profileHomeIsZh()?"\u8FD8\u6CA1\u6709\u94FE\u63A5":"No links yet")+'</strong><span>'+(profileHomeIsZh()?"\u6DFB\u52A0 QQ\u3001GitHub\u3001\u4E2A\u4EBA\u7F51\u7AD9\u6216\u5176\u4ED6\u5E38\u7528\u5165\u53E3\u3002":"Add QQ, GitHub, your website, or any other destination.")+'</span></div>'; return; }
        list.innerHTML=links.map(link => '<article class="profile-link-item">'+
          '<a class="profile-link-main" href="'+profileHomeEscape(link.url)+'" target="_blank" rel="noopener noreferrer"><span class="profile-link-icon">'+profileHomeEscape(profileLinkIcon(link.title,link.category))+'</span><span class="profile-link-copy"><strong>'+profileHomeEscape(link.title)+(link.pinned?' <em>\u2605</em>':'')+'</strong><small>'+profileHomeEscape(link.note || link.url)+'</small></span><span class="profile-link-open">\u2197</span></a>'+
          '<div class="profile-link-actions"><button type="button" data-profile-link-edit="'+profileHomeEscape(link.id)+'">'+(profileHomeIsZh()?"\u7F16\u8F91":"Edit")+'</button><button type="button" data-profile-link-delete="'+profileHomeEscape(link.id)+'">'+(profileHomeIsZh()?"\u5220\u9664":"Delete")+'</button></div>'+
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
        const button=document.getElementById("profile-save-button"); button.disabled=true; button.textContent=profileHomeIsZh()?"\u6B63\u5728\u4FDD\u5B58\u2026":"Saving\u2026";
        const interests=document.getElementById("profile-edit-interests").value.split(/[,\uFF0C]/).map(x=>x.trim()).filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).slice(0,12);
        const cover=document.querySelector("[data-cover-choice].is-selected")?.dataset.coverChoice || "aurora";
        const payload={ user_id:profileHomeState.user.id, signature:document.getElementById("profile-edit-signature").value.trim(), bio:document.getElementById("profile-edit-bio").value.trim(), location:document.getElementById("profile-edit-location").value.trim(), status_kind:document.getElementById("profile-edit-status-kind").value, status_emoji:document.getElementById("profile-edit-status-emoji").value.trim()||"\u2728", status_text:document.getElementById("profile-edit-status-text").value.trim(), interests, cover_style:cover, background_url:profileHomeState.personalization?.background_url || "" };
        const {data,error}=await supabaseClient.from("profile_personalization").upsert(payload,{onConflict:"user_id"}).select().single();
        button.disabled=false; button.textContent=profileHomeIsZh()?"\u4FDD\u5B58":"Save";
        if(error){ console.error("Profile personalization save failed",error.message); alert(profileHomeIsZh()?"\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002":"Could not save your profile. Please try again."); return; }
        profileHomeState.personalization=normalizeProfilePersonalization(data,profileHomeState.user.id); writeProfileHomeCache(); renderProfileHome(); closeProfileSheets();
      }
      function openProfileLinkSheet(id) {
        const sheet=document.getElementById("profile-link-sheet"), backdrop=document.getElementById("profile-sheet-backdrop"); if(!sheet||!backdrop) return;
        const link=(profileHomeState.links||[]).find(item=>item.id===id)||null; profileHomeState.editingLinkId=link?.id||null;
        document.getElementById("profile-link-sheet-title").textContent=link?(profileHomeIsZh()?"\u7F16\u8F91\u94FE\u63A5":"Edit link"):(profileHomeIsZh()?"\u6DFB\u52A0\u94FE\u63A5":"Add link");
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
        if(!title || !/^https?:\\/\\//i.test(url)){ alert(profileHomeIsZh()?"\u8BF7\u586B\u5199\u540D\u79F0\uFF0C\u5E76\u8F93\u5165\u4EE5 http:// \u6216 https:// \u5F00\u5934\u7684\u6709\u6548\u94FE\u63A5\u3002":"Enter a title and a valid URL beginning with http:// or https://."); return; }
        button.disabled=true;
        const payload={ user_id:profileHomeState.user.id,title,url,category:document.getElementById("profile-link-category").value,note:document.getElementById("profile-link-note").value.trim(),pinned:document.getElementById("profile-link-pinned").checked,sort_order:profileHomeState.editingLinkId?((profileHomeState.links.find(x=>x.id===profileHomeState.editingLinkId)?.sort_order)||0):(profileHomeState.links.length*10)};
        let result;
        if(profileHomeState.editingLinkId) result=await supabaseClient.from("profile_links").update(payload).eq("id",profileHomeState.editingLinkId).select().single();
        else result=await supabaseClient.from("profile_links").insert(payload).select().single();
        button.disabled=false;
        if(result.error){console.error("Profile link save failed",result.error.message);alert(profileHomeIsZh()?"\u94FE\u63A5\u4FDD\u5B58\u5931\u8D25\u3002":"Could not save the link.");return;}
        if(profileHomeState.editingLinkId) profileHomeState.links=profileHomeState.links.map(x=>x.id===profileHomeState.editingLinkId?result.data:x); else profileHomeState.links.push(result.data);
        writeProfileHomeCache(); renderProfileLinks(); closeProfileSheets();
      }
      async function deleteProfileLink(id) {
        const link=(profileHomeState.links||[]).find(item=>item.id===id); if(!link) return;
        if(!confirm((profileHomeIsZh()?"\u5220\u9664\u201C":"Delete \u201C")+link.title+"\u201D"+(profileHomeIsZh()?"\uFF1F":"?"))) return;
        const {error}=await supabaseClient.from("profile_links").delete().eq("id",id);
        if(error){alert(profileHomeIsZh()?"\u5220\u9664\u5931\u8D25\u3002":"Could not delete the link.");return;}
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
        if(!ext || file.size>max){ alert(profileHomeIsZh()?(kind==="avatar"?"\u5934\u50CF\u9700\u4E3A JPG\u3001PNG \u6216 WebP\uFF0C\u4E14\u4E0D\u8D85\u8FC7 5 MB\u3002":"\u80CC\u666F\u9700\u4E3A JPG\u3001PNG \u6216 WebP\uFF0C\u4E14\u4E0D\u8D85\u8FC7 8 MB\u3002"):(kind==="avatar"?"Profile photo must be JPG, PNG, or WebP and no larger than 5 MB.":"Background must be JPG, PNG, or WebP and no larger than 8 MB.")); return null; }
        const bucket=kind==="avatar"?"avatars":"profile-media";
        const objectPath=profileHomeState.user.id+"/"+kind+"."+ext;
        const {error}=await supabaseClient.storage.from(bucket).upload(objectPath,file,{upsert:true,contentType:file.type,cacheControl:"3600"});
        if(error){console.error("Profile media upload failed",error.message);alert(profileHomeIsZh()?"\u56FE\u7247\u4E0A\u4F20\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002":"Image upload failed. Please try again.");return null;}
        const {data}=supabaseClient.storage.from(bucket).getPublicUrl(objectPath);
        return data?.publicUrl ? data.publicUrl+"?v="+Date.now() : null;
      }
      async function changeProfileAvatar(file) {
        const url=await uploadProfileMedia(file,"avatar"); if(!url) return;
        const {error}=await supabaseClient.from("profiles").update({avatar_url:url,updated_at:new Date().toISOString()}).eq("id",profileHomeState.user.id);
        if(error){console.error("Avatar profile update failed",error.message);alert(profileHomeIsZh()?"\u5934\u50CF\u5DF2\u4E0A\u4F20\uFF0C\u4F46\u8D26\u53F7\u8D44\u6599\u66F4\u65B0\u5931\u8D25\u3002":"The photo uploaded, but your profile could not be updated.");return;}
        const avatar=document.getElementById("profile-avatar"); if(avatar) avatar.innerHTML='<img src="'+profileHomeEscape(url)+'" alt="">';
        const preview=document.getElementById("profile-avatar-preview"); if(preview) preview.innerHTML='<img src="'+profileHomeEscape(url)+'" alt="">';
      }
      async function changeProfileBackground(file) {
        const url=await uploadProfileMedia(file,"background"); if(!url) return;
        profileHomeState.personalization=normalizeProfilePersonalization({...profileHomeState.personalization,background_url:url},profileHomeState.user.id);
        const {data,error}=await supabaseClient.from("profile_personalization").upsert(profileHomeState.personalization,{onConflict:"user_id"}).select().single();
        if(error){console.error("Background save failed",error.message);alert(profileHomeIsZh()?"\u80CC\u666F\u4FDD\u5B58\u5931\u8D25\u3002":"Could not save the background.");return;}
        profileHomeState.personalization=normalizeProfilePersonalization(data,profileHomeState.user.id);writeProfileHomeCache();renderProfileHome();openProfileSheet();
      }
      async function clearProfileBackground() {
        if(!profileHomeState.user) return;
        profileHomeState.personalization=normalizeProfilePersonalization({...profileHomeState.personalization,background_url:""},profileHomeState.user.id);
        const {data,error}=await supabaseClient.from("profile_personalization").upsert(profileHomeState.personalization,{onConflict:"user_id"}).select().single();
        if(error){alert(profileHomeIsZh()?"\u65E0\u6CD5\u6E05\u9664\u80CC\u666F\u3002":"Could not clear the background.");return;}
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

    <\/script>`;
}
__name(profileClientScript, "profileClientScript");
function profileHubContent(zh, osHubGrid2) {
  const prefix = zh ? "/zh-cn" : "/en";
  const items = zh ? [
    { title: "\u7528\u6237\u8D44\u6599", meta: "\u4E2A\u4EBA\u7A7A\u95F4", description: "\u5934\u50CF\u3001\u4E3B\u9875\u80CC\u666F\u3001\u4E2A\u6027\u7B7E\u540D\u3001\u4E2A\u4EBA\u4ECB\u7ECD\u3001\u5728\u7EBF\u72B6\u6001\u4E0E\u5174\u8DA3\u6807\u7B7E\u3002", href: `${prefix}/profile/details`, icon: "profile", featured: true, tone: "blue" },
    { title: "\u8D26\u6237\u4FE1\u606F", meta: "\u8D26\u53F7", description: "\u67E5\u770B\u8D26\u53F7 ID\u3001\u90AE\u7BB1\u3001\u6CE8\u518C\u65F6\u95F4\u3001\u6700\u8FD1\u767B\u5F55\u4E0E\u767B\u5F55\u8BB0\u5F55\u3002", href: `${prefix}/profile/account`, icon: "account" },
    { title: "\u8D26\u6237\u4E0E\u5B89\u5168", meta: "\u5B89\u5168", description: "\u67E5\u770B\u5F53\u524D\u8BBE\u5907\u3001\u767B\u5F55\u5386\u53F2\u4E0E\u5F02\u5E38\u767B\u5F55\u63D0\u793A\u3002", href: `${prefix}/settings/security`, icon: "shield" },
    { title: "\u504F\u597D\u8BBE\u7F6E", meta: "\u504F\u597D", description: "\u7BA1\u7406\u4E0E\u4E2A\u4EBA\u4F7F\u7528\u4F53\u9A8C\u76F8\u5173\u7684\u8BBE\u7F6E\u5165\u53E3\u3002", href: `${prefix}/profile/preferences`, icon: "preferences" },
    { title: "\u6536\u85CF\u94FE\u63A5", meta: "\u5185\u5BB9", description: "\u8FDB\u5165\u4F60\u7684\u94FE\u63A5\u6536\u85CF\u4E0E\u5E38\u7528\u5165\u53E3\u3002", href: `${prefix}/info/links`, icon: "links" },
    { title: "\u79C1\u4EBA\u5B58\u50A8", meta: "R2", description: "\u4E0A\u4F20\u3001\u4E0B\u8F7D\u5E76\u7BA1\u7406\u53EA\u5C5E\u4E8E\u5F53\u524D\u8D26\u53F7\u7684\u79C1\u4EBA\u6587\u4EF6\u3002", href: `${prefix}/settings/storage`, icon: "storage" }
  ] : [
    { title: "Profile Details", meta: "Personal", description: "Profile photo, background, signature, bio, presence, and interests.", href: `${prefix}/profile/details`, icon: "profile", featured: true, tone: "blue" },
    { title: "Account", meta: "Account", description: "Review account ID, email, registration time, recent sign-in, and login records.", href: `${prefix}/profile/account`, icon: "account" },
    { title: "Account & Security", meta: "Security", description: "Review the current device, login history, and risk alerts.", href: `${prefix}/settings/security`, icon: "shield" },
    { title: "Preferences", meta: "Preferences", description: "Manage entry points related to your personal experience.", href: `${prefix}/profile/preferences`, icon: "preferences" },
    { title: "Saved Links", meta: "Content", description: "Open your saved links and frequently used destinations.", href: `${prefix}/info/links`, icon: "links" },
    { title: "Private Storage", meta: "R2", description: "Upload, download, and manage files private to this account.", href: `${prefix}/settings/storage`, icon: "storage" }
  ];
  return osHubGrid2(items, "profile-hub-grid");
}
__name(profileHubContent, "profileHubContent");

// studio/ui-admin.js
function adminOverviewContent(zh) {
  const labels = zh ? ["\u7528\u6237\u603B\u6570", "\u7BA1\u7406\u5458\u6570\u91CF"] : ["Total Users", "Admins"];
  return `
    <section class="admin-scan">
      <span></span>
      <strong>${zh ? "\u7BA1\u7406\u6570\u636E\u6982\u89C8" : "Admin Data Overview"}</strong>
      <p>${zh ? "\u6C47\u603B\u7528\u6237\u3001\u89D2\u8272\u3001\u6743\u9650\u548C\u64CD\u4F5C\u65E5\u5FD7\u3002" : "Overview of users, roles, permissions, and operation logs."}</p>
    </section>
    <section class="admin-metrics" id="admin-overview-metrics">
      ${labels.map((label, index) => `<article class="admin-motion-card admin-skeleton" style="--stagger:${index}"><span>${label}</span><strong data-admin-metric="${index}">0</strong></article>`).join("")}
    </section>
    <section class="admin-dashboard-grid">
      <article class="os-card admin-section-card">
        <div class="admin-section-head"><h2>${zh ? "\u6700\u8FD1\u767B\u5F55\u7528\u6237" : "Recent Login Users"}</h2><span class="status-pulse"></span></div>
        <div id="admin-recent-users" class="admin-list-skeleton"></div>
      </article>
      <article class="os-card admin-section-card">
        <div class="admin-section-head"><h2>${zh ? "\u6700\u8FD1\u64CD\u4F5C\u65E5\u5FD7" : "Recent Operation Logs"}</h2><button class="admin-ghost" data-admin-nav="/admin/logs">${zh ? "\u67E5\u770B\u5168\u90E8" : "View all"}</button></div>
        <div id="admin-recent-logs" class="admin-log-list admin-list-skeleton"></div>
      </article>
      <article class="os-card admin-section-card danger-event-card">
        <div class="admin-section-head"><h2>${zh ? "\u7CFB\u7EDF\u98CE\u9669\u63D0\u793A" : "System Risk Signals"}</h2><span>${zh ? "\u5BA1\u8BA1\u89C4\u5219" : "Audit rules"}</span></div>
        <div id="admin-risk-list" class="admin-risk-list admin-list-skeleton"></div>
      </article>
    </section>
  `;
}
__name(adminOverviewContent, "adminOverviewContent");
function adminUsersContent(zh) {
  const roleOptions = zh ? [["", "\u5168\u90E8\u89D2\u8272"], ["admin", "\u7BA1\u7406\u5458"], ["editor", "\u7F16\u8F91\u8005"], ["user", "\u666E\u901A\u6210\u5458"]] : [["", "All roles"], ["admin", "Administrator"], ["editor", "Editor"], ["user", "Member"]];
  const statusOptions = zh ? [["", "\u5168\u90E8\u72B6\u6001"], ["active", "\u6B63\u5E38"], ["suspended", "\u5DF2\u505C\u7528"], ["banned", "\u5DF2\u5C01\u7981"]] : [["", "All status"], ["active", "active"], ["suspended", "suspended"], ["banned", "banned"]];
  return `
    <section class="admin-toolbar os-card">
      <input id="admin-user-search" class="os-search" placeholder="${zh ? "\u641C\u7D22\u7528\u6237\u3001\u90AE\u7BB1\u3001ID..." : "Search users, email, ID..."}">
      <select id="admin-role-filter">${roleOptions.map((option) => `<option value="${option[0]}">${option[1]}</option>`).join("")}</select>
      <select id="admin-status-filter">${statusOptions.map((option) => `<option value="${option[0]}">${option[1]}</option>`).join("")}</select>
    </section>
    <section class="os-card admin-table-card">
      <div class="admin-section-head"><h2>${zh ? "\u7528\u6237\u5217\u8868" : "Users"}</h2><span id="admin-users-count">0</span></div>
      <div id="admin-users-table" class="admin-data-table admin-user-table admin-list-skeleton"></div>
    </section>
    <section class="os-card admin-detail-card" id="admin-user-detail">
      <h2>${zh ? "\u7528\u6237\u8BE6\u60C5" : "User Detail"}</h2>
      <div id="admin-user-detail-body" class="admin-empty">${zh ? "\u9009\u62E9\u4E00\u4F4D\u7528\u6237\u67E5\u770B\u6700\u8FD1\u767B\u5F55\u548C\u64CD\u4F5C\u8BB0\u5F55\u3002" : "Select a user to review recent logins and operations."}</div>
    </section>
  `;
}
__name(adminUsersContent, "adminUsersContent");
function adminRolesContent(zh) {
  return `
    <section class="os-card admin-role-summary">
      <div class="admin-section-head">
        <h2>${zh ? "RBAC \u89D2\u8272\u6743\u9650" : "RBAC Roles"}</h2>
        <button id="admin-save-permissions" class="admin-primary" disabled>${zh ? "\u4FDD\u5B58\u6743\u9650" : "Save permissions"}</button>
      </div>
      <p>${zh ? "\u89D2\u8272\u7528\u4E8E\u63A7\u5236\u6210\u5458\u53EF\u8BBF\u95EE\u7684\u529F\u80FD\u3002\u666E\u901A\u6210\u5458\u9002\u5408\u65E5\u5E38\u4F7F\u7528\uFF0C\u4E0D\u5177\u5907\u7528\u6237\u7BA1\u7406\u3001\u89D2\u8272\u6743\u9650\u8C03\u6574\u6216\u7BA1\u7406\u7EA7\u5BA1\u8BA1\u8BBF\u95EE\u80FD\u529B\uFF1B\u7BA1\u7406\u5458\u4E0E\u7F16\u8F91\u8005\u5E94\u4EC5\u6388\u4E88\u786E\u6709\u9700\u8981\u7684\u8D26\u53F7\u3002\u6240\u6709\u6743\u9650\u8C03\u6574\u90FD\u4F1A\u4FDD\u7559\u64CD\u4F5C\u8BB0\u5F55\u3002" : "Roles control which features members can access. Members are intended for everyday use and cannot manage users, change role permissions, or access administrator-only audit data. Administrator and editor roles should be granted only when needed. Permission changes are recorded."}</p>
      <div id="admin-unsaved-bar" class="admin-unsaved" hidden>${zh ? "\u6709\u672A\u4FDD\u5B58\u7684\u6743\u9650\u53D8\u66F4" : "Unsaved permission changes"}</div>
    </section>
    <section id="admin-role-cards" class="admin-role-cards admin-list-skeleton"></section>
    <section class="os-card admin-table-card">
      <div class="admin-section-head"><h2>${zh ? "\u6743\u9650\u77E9\u9635" : "Permission Matrix"}</h2><span>${zh ? "\u5206\u7EC4\u5F00\u5173" : "Grouped switches"}</span></div>
      <div id="admin-permission-matrix" class="admin-permission-matrix admin-list-skeleton"></div>
    </section>
  `;
}
__name(adminRolesContent, "adminRolesContent");
function adminLogsContent(zh) {
  const actions = zh ? [["", "\u5168\u90E8\u52A8\u4F5C"], ["auth.login.failed", "\u767B\u5F55\u5931\u8D25"], ["user.role.update", "\u4FEE\u6539\u7528\u6237\u89D2\u8272"], ["user.ban", "\u5C01\u7981\u7528\u6237"], ["user.unban", "\u89E3\u9664\u5C01\u7981"], ["user.suspend", "\u505C\u7528\u7528\u6237"], ["role.permissions.update", "\u4FEE\u6539\u89D2\u8272\u6743\u9650"]] : [["", "All actions"], ["auth.login.failed", "auth.login.failed"], ["user.role.update", "user.role.update"], ["user.ban", "user.ban"], ["user.unban", "user.unban"], ["user.suspend", "user.suspend"], ["role.permissions.update", "role.permissions.update"]];
  const severities = zh ? [["", "\u5168\u90E8\u7EA7\u522B"], ["info", "\u4FE1\u606F"], ["warning", "\u8B66\u544A"], ["danger", "\u5371\u9669"]] : [["", "All severity"], ["info", "info"], ["warning", "warning"], ["danger", "danger"]];
  return `
    <section class="admin-toolbar os-card">
      <input id="admin-log-search" class="os-search" placeholder="${zh ? "\u641C\u7D22\u63CF\u8FF0\u3001\u5BF9\u8C61\u3001\u52A8\u4F5C..." : "Search description, target, action..."}">
      <select id="admin-log-action">${actions.map((action) => `<option value="${action[0]}">${action[1]}</option>`).join("")}</select>
      <select id="admin-log-severity">${severities.map((severity) => `<option value="${severity[0]}">${severity[1]}</option>`).join("")}</select>
      <input id="admin-log-actor" placeholder="${zh ? "\u7528\u6237\u90AE\u7BB1 / ID" : "Actor email / ID"}">
      <input id="admin-log-from" type="date">
      <input id="admin-log-to" type="date">
    </section>
    <section class="os-card admin-table-card">
      <div class="admin-section-head"><h2>${zh ? "\u64CD\u4F5C\u65E5\u5FD7" : "Operation Logs"}</h2><span id="admin-logs-count">0</span></div>
      <div id="admin-logs-list" class="admin-log-timeline admin-list-skeleton"></div>
    </section>
    <aside id="admin-log-drawer" class="admin-drawer" aria-hidden="true">
      <button id="admin-log-drawer-close" class="admin-ghost">\xD7</button>
      <div id="admin-log-drawer-body"></div>
    </aside>
  `;
}
__name(adminLogsContent, "adminLogsContent");
function adminSystemContent(zh) {
  return `<section class="os-card is-large"><h2>${zh ? "\u7CFB\u7EDF\u72B6\u6001" : "System Status"}</h2><p>${zh ? "\u5F53\u524D\u7BA1\u7406\u754C\u9762\u5C1A\u672A\u63A5\u5165\u8FD0\u884C\u72B6\u6001\u3001\u5B58\u50A8\u5360\u7528\u4E0E\u5BB9\u91CF\u7EDF\u8BA1\u7B49\u76D1\u63A7\u6570\u636E\uFF1B\u8D26\u6237\u3001\u6743\u9650\u4E0E\u5BA1\u8BA1\u76F8\u5173\u4FE1\u606F\u4ECD\u53EF\u5728\u5BF9\u5E94\u7BA1\u7406\u9875\u9762\u67E5\u770B\u3002" : "Runtime health, storage usage, and capacity metrics are not yet available in the management interface. Account, permission, and audit information remains available in the corresponding administration pages."}</p></section>`;
}
__name(adminSystemContent, "adminSystemContent");
function adminClientScript(ipInfo) {
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
          ? { admin: "\u7BA1\u7406\u5458", editor: "\u7F16\u8F91\u8005", user: "\u666E\u901A\u6210\u5458" }
          : { admin: "Administrator", editor: "Editor", user: "Member" };
        return labels[role] || role || "-";
      }

      // i18n marker: status values remain active/suspended/banned for RPC filters and updates.
      function adminStatusLabel(status) {
        if (!adminIsZh()) return status || "-";
        return ({ active: "\u6B63\u5E38", suspended: "\u5DF2\u505C\u7528", banned: "\u5DF2\u5C01\u7981" })[status] || status || "-";
      }

      // i18n marker: severity values remain info/warning/danger for audit filtering.
      function adminSeverityLabel(severity) {
        if (!adminIsZh()) return severity || "-";
        return ({ info: "\u4FE1\u606F", warning: "\u8B66\u544A", danger: "\u5371\u9669" })[severity] || severity || "-";
      }

      // i18n marker: audit action keys are stored as machine-readable English action names.
      function adminActionLabel(action) {
        if (!adminIsZh()) return action || "-";
        return ({
          "login": "\u767B\u5F55",
          "auth.login.failed": "\u767B\u5F55\u5931\u8D25",
          "user.role.update": "\u4FEE\u6539\u7528\u6237\u89D2\u8272",
          "user.ban": "\u5C01\u7981\u7528\u6237",
          "user.unban": "\u89E3\u9664\u5C01\u7981",
          "user.suspend": "\u505C\u7528\u7528\u6237",
          "role.permissions.update": "\u4FEE\u6539\u89D2\u8272\u6743\u9650"
        })[action] || action || "-";
      }

      // i18n marker: audit descriptions may come from database functions in English; render a Chinese hint without mutating stored logs.
      function adminLogDescription(log) {
        const text = log?.description || log?.target_label || "-";
        if (!adminIsZh()) return text;
        if (log?.action === "auth.login.failed") return "\u5BC6\u7801\u767B\u5F55\u5931\u8D25\u3002";
        if (log?.action === "user.role.update") return "\u7528\u6237\u89D2\u8272\u5DF2\u66F4\u65B0\u3002";
        if (log?.action === "user.ban") return "\u7528\u6237\u5DF2\u88AB\u5C01\u7981\u3002";
        if (log?.action === "user.unban") return "\u7528\u6237\u5DF2\u89E3\u9664\u5C01\u7981\u3002";
        if (log?.action === "user.suspend") return "\u7528\u6237\u5DF2\u505C\u7528\u3002";
        if (log?.action === "role.permissions.update") return "\u89D2\u8272\u6743\u9650\u77E9\u9635\u5DF2\u66F4\u65B0\u3002";
        return text;
      }

      // i18n marker: permission keys stay stable for RBAC; Chinese copy is display-only.
      function adminPermissionLabel(key) {
        if (!adminIsZh()) return key || "-";
        return ({
          "users.read": "\u67E5\u770B\u7528\u6237", "users.update": "\u66F4\u65B0\u7528\u6237", "users.ban": "\u5C01\u7981\u7528\u6237",
          "roles.read": "\u67E5\u770B\u89D2\u8272", "roles.update": "\u66F4\u65B0\u89D2\u8272",
          "logs.read": "\u67E5\u770B\u65E5\u5FD7", "system.read": "\u67E5\u770B\u7CFB\u7EDF",
          "notes.read": "\u67E5\u770B\u7B14\u8BB0", "notes.create": "\u521B\u5EFA\u7B14\u8BB0", "notes.update": "\u66F4\u65B0\u7B14\u8BB0", "notes.delete": "\u5220\u9664\u7B14\u8BB0",
          "links.read": "\u67E5\u770B\u94FE\u63A5", "links.create": "\u521B\u5EFA\u94FE\u63A5", "links.update": "\u66F4\u65B0\u94FE\u63A5", "links.delete": "\u5220\u9664\u94FE\u63A5",
          "projects.read": "\u67E5\u770B\u9879\u76EE", "projects.create": "\u521B\u5EFA\u9879\u76EE", "projects.update": "\u66F4\u65B0\u9879\u76EE", "projects.delete": "\u5220\u9664\u9879\u76EE"
        })[key] || key || "-";
      }

      function adminPermissionDescription(permission) {
        if (!adminIsZh()) return permission.description || permission.key || "";
        return adminPermissionLabel(permission.key) + "\u6743\u9650";
      }

      function adminCategoryLabel(category) {
        if (!adminIsZh()) return category || "general";
        return ({ users: "\u7528\u6237", roles: "\u89D2\u8272", logs: "\u65E5\u5FD7", system: "\u7CFB\u7EDF", notes: "\u7B14\u8BB0", links: "\u94FE\u63A5", projects: "\u9879\u76EE", general: "\u901A\u7528" })[category] || category || "\u901A\u7528";
      }

      function adminFieldLabel(key) {
        if (!adminIsZh()) return key;
        return ({
          id: "\u65E5\u5FD7 ID",
          actor_user_id: "\u64CD\u4F5C\u8005 ID",
          actor_email: "\u64CD\u4F5C\u8005\u90AE\u7BB1",
          action: "\u52A8\u4F5C",
          target_type: "\u5BF9\u8C61\u7C7B\u578B",
          target_id: "\u5BF9\u8C61 ID",
          target_label: "\u5BF9\u8C61\u540D\u79F0",
          description: "\u63CF\u8FF0",
          ip_address: "IP \u5730\u5740",
          user_agent: "\u6D4F\u89C8\u5668\u6807\u8BC6",
          severity: "\u7EA7\u522B",
          created_at: "\u521B\u5EFA\u65F6\u95F4"
        })[key] || key;
      }

      function adminRoleDescription(role) {
        const descriptions = adminIsZh()
          ? {
              admin: "\u62E5\u6709\u5B8C\u6574\u7BA1\u7406\u6743\u9650\uFF0C\u53EF\u7BA1\u7406\u6210\u5458\u3001\u89D2\u8272\u6743\u9650\u4E0E\u5BA1\u8BA1\u8BB0\u5F55\u3002\u4EC5\u5E94\u6388\u4E88\u627F\u62C5\u7BA1\u7406\u804C\u8D23\u7684\u8D26\u53F7\u3002",
              editor: "\u9002\u7528\u4E8E\u9700\u8981\u6269\u5C55\u5DE5\u4F5C\u533A\u64CD\u4F5C\u80FD\u529B\u7684\u6210\u5458\uFF0C\u4E0D\u5305\u542B\u7528\u6237\u7BA1\u7406\u3001\u89D2\u8272\u6743\u9650\u8C03\u6574\u7B49\u7BA1\u7406\u5458\u80FD\u529B\u3002",
              user: "\u666E\u901A\u6210\u5458\uFF0C\u7528\u4E8E\u65E5\u5E38\u4E2A\u4EBA\u4F7F\u7528\u3002\u53EF\u4EE5\u8BBF\u95EE\u83B7\u51C6\u7684\u4E2A\u4EBA\u529F\u80FD\uFF0C\u4F46\u4E0D\u80FD\u7BA1\u7406\u5176\u4ED6\u6210\u5458\u3001\u4FEE\u6539\u89D2\u8272\u6743\u9650\u6216\u8BBF\u95EE\u4EC5\u9650\u7BA1\u7406\u5458\u7684\u5BA1\u8BA1\u4FE1\u606F\u3002"
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
        toast.innerHTML = '<strong>' + (type === "danger" ? "!" : type === "warning" ? "?" : "\u2713") + '</strong><span>' + adminEscape(message) + '</span>';
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
                '<button class="admin-ghost" data-confirm-cancel>' + adminEscape(adminText(adminIsZh(), "\u53D6\u6D88", "Cancel")) + '</button>' +
                '<button class="' + (options.danger ? "admin-danger" : "admin-primary") + '" data-confirm-ok>' + adminEscape(options.confirmLabel || adminText(adminIsZh(), "\u786E\u8BA4", "Confirm")) + '</button>' +
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
        return adminEmpty(message || adminText(adminIsZh(), "\u65E0\u6CD5\u8BFB\u53D6\u7BA1\u7406\u6570\u636E\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002", "Unable to load management data. Please try again later."));
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
            el.innerText = "\u2014";
          });
          ["admin-recent-users", "admin-recent-logs", "admin-risk-list"].forEach(id => {
            const target = document.getElementById(id);
            if (!target) return;
            target.classList.remove("admin-list-skeleton");
            target.innerHTML = adminLoadError();
          });
          adminToast(adminText(adminIsZh(), "\u7BA1\u7406\u6570\u636E\u8BFB\u53D6\u5931\u8D25\u3002", "Admin data failed to load."), "danger");
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
          ).join("") : adminEmpty(adminText(adminIsZh(), "\u6682\u65E0\u6700\u8FD1\u7528\u6237", "No recent users"));
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
          ).join("") : adminEmpty(adminText(adminIsZh(), "\u6682\u65E0\u98CE\u9669\u4E8B\u4EF6", "No risk events"), adminText(adminIsZh(), "\u67E5\u770B\u65E5\u5FD7", "Open logs"), "/admin/logs");
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
          if (count) count.innerText = "\u2014";
          adminToast(adminText(adminIsZh(), "\u7528\u6237\u5217\u8868\u8BFB\u53D6\u5931\u8D25\u3002", "User list failed to load."), "danger");
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
          table.innerHTML = adminEmpty(adminText(zh, "\u6682\u65E0\u5339\u914D\u7528\u6237", "No matching users"));
          return;
        }
        const head = ["ID", adminText(zh, "\u7528\u6237\u540D", "Username"), adminText(zh, "\u90AE\u7BB1", "Email"), adminText(zh, "\u5934\u50CF", "Avatar"), adminText(zh, "\u89D2\u8272", "Role"), adminText(zh, "\u72B6\u6001", "Status"), adminText(zh, "\u521B\u5EFA\u65F6\u95F4", "Created"), adminText(zh, "\u6700\u8FD1\u767B\u5F55", "Last login"), adminText(zh, "\u6700\u8FD1\u6D3B\u8DC3", "Last active"), adminText(zh, "\u64CD\u4F5C", "Actions")];
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
          '<span><button class="admin-ghost" data-user-detail="' + adminEscape(user.user_id) + '">' + adminEscape(adminText(adminIsZh(), "\u8BE6\u60C5", "Detail")) + '</button></span>' +
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
            '<div><strong>' + adminEscape(user.display_name || user.username || user.email) + '</strong><p>' + adminEscape(user.user_id) + '</p><p>' + adminEscape(adminRoleLabel(user.role)) + ' \xB7 ' + adminEscape(adminStatusLabel(user.status)) + '</p></div>' +
            '<div><h3>' + adminEscape(adminText(adminIsZh(), "\u6700\u8FD1\u767B\u5F55", "Recent logins")) + '</h3>' + (logins.length ? logins.map(login => '<p>' + adminFormatDate(login.created_at) + ' \xB7 ' + adminEscape(login.ip_address || "-") + ' \xB7 ' + adminEscape(login.browser || "-") + '</p>').join("") : '<p>-</p>') + '</div>' +
            '<div><h3>' + adminEscape(adminText(adminIsZh(), "\u6700\u8FD1\u64CD\u4F5C", "Recent actions")) + '</h3>' + (actions.length ? actions.map(log => '<p>' + adminFormatDate(log.created_at) + ' \xB7 ' + adminEscape(adminActionLabel(log.action)) + '</p>').join("") : '<p>-</p>') + '</div>' +
          '</div>';
        cacheAdminViewHtml();
      }

      async function changeAdminUserRole(userId, role) {
        const user = getAdminUser(userId);
        if (!user) return;
        if (user.user_id === adminState.currentUser?.id && role !== "admin") {
          adminToast(adminText(adminIsZh(), "\u4E0D\u80FD\u79FB\u9664\u81EA\u5DF1\u7684 admin \u6743\u9650\u3002", "You cannot remove your own admin role."), "danger");
          renderAdminUsers();
          return;
        }
        const ok = await adminConfirm({
          title: adminText(adminIsZh(), "\u786E\u8BA4\u4FEE\u6539\u89D2\u8272", "Confirm role change"),
          message: (user.email || user.user_id) + " \u2192 " + adminRoleLabel(role),
          confirmLabel: adminText(adminIsZh(), "\u4FEE\u6539\u89D2\u8272", "Update role"),
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
        adminToast(adminText(adminIsZh(), "\u89D2\u8272\u5DF2\u66F4\u65B0\u3002", "Role updated."), "warning");
        renderAdminUsers();
      }

      async function changeAdminUserStatus(userId, status) {
        const user = getAdminUser(userId);
        if (!user) return;
        if (user.user_id === adminState.currentUser?.id && status !== "active") {
          adminToast(adminText(adminIsZh(), "\u4E0D\u80FD\u5C01\u7981\u6216\u505C\u7528\u81EA\u5DF1\u3002", "You cannot suspend or ban yourself."), "danger");
          renderAdminUsers();
          return;
        }
        const isDanger = status === "banned";
        const ok = await adminConfirm({
          title: adminText(adminIsZh(), isDanger ? "\u786E\u8BA4\u5C01\u7981\u7528\u6237" : "\u786E\u8BA4\u4FEE\u6539\u72B6\u6001", isDanger ? "Confirm user ban" : "Confirm status change"),
          message: (user.email || user.user_id) + " \u2192 " + adminStatusLabel(status),
          confirmLabel: adminText(adminIsZh(), isDanger ? "\u5C01\u7981\u7528\u6237" : "\u4FEE\u6539\u72B6\u6001", isDanger ? "Ban user" : "Update status"),
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
        adminToast(adminText(adminIsZh(), status === "active" ? "\u7528\u6237\u5DF2\u89E3\u9664\u5C01\u7981\u3002" : "\u7528\u6237\u72B6\u6001\u5DF2\u66F4\u65B0\u3002", status === "active" ? "User restored." : "User status updated."), status === "banned" ? "danger" : "success");
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
          adminToast(adminText(adminIsZh(), "\u89D2\u8272\u6743\u9650\u8BFB\u53D6\u5931\u8D25\u3002", "Role permissions failed to load."), "danger");
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
            return '<article class="os-card admin-motion-card"><small>' + adminEscape(role.name) + '</small><h2>' + adminEscape(adminRoleLabel(role.name)) + '</h2><p>' + adminEscape(adminRoleDescription(role)) + '</p><strong>' + count + adminText(adminIsZh(), ' \u4F4D\u7528\u6237 \xB7 ', ' users \xB7 ') + perms + adminText(adminIsZh(), ' \u9879\u6743\u9650', ' permissions') + '</strong></article>';
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
            '<strong class="permission-head">' + adminEscape(adminText(adminIsZh(), "\u6743\u9650", "Permission")) + '</strong>' + data.roles.map(role => '<strong>' + adminEscape(adminRoleLabel(role.name)) + '</strong>').join("") +
            permissions.map(permission =>
              '<div class="permission-key"><strong>' + adminEscape(adminPermissionLabel(permission.key)) + '</strong><small>' + adminEscape(permission.key) + ' \xB7 ' + adminEscape(adminPermissionDescription(permission)) + '</small></div>' +
              data.roles.map(role => '<label class="switch-cell"><input type="checkbox" data-role="' + adminEscape(role.name) + '" data-permission="' + adminEscape(permission.key) + '"' + (roleHasPermission(role.name, permission.key) ? " checked" : "") + '><span></span></label>').join("")
            ).join("") +
          '</div></details>'
        ).join("");
        matrix.querySelectorAll('input[type="checkbox"]').forEach(input => input.addEventListener("change", async () => {
          const key = input.dataset.permission;
          const critical = ["users.ban", "roles.update", "users.update"].includes(key);
          if (critical && !input.checked) {
            const ok = await adminConfirm({
              title: adminText(adminIsZh(), "\u786E\u8BA4\u5173\u95ED\u5173\u952E\u6743\u9650", "Confirm critical permission change"),
              message: adminRoleLabel(input.dataset.role) + " / " + adminPermissionLabel(key),
              confirmLabel: adminText(adminIsZh(), "\u7EE7\u7EED\u4FEE\u6539", "Continue"),
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
        save.innerText = adminText(adminIsZh(), "\u5DF2\u4FDD\u5B58", "Saved");
        window.setTimeout(() => save.innerText = old, 1400);
        adminToast(adminText(adminIsZh(), "\u6743\u9650\u77E9\u9635\u5DF2\u4FDD\u5B58\u3002", "Permission matrix saved."), "success");
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
          if (count) count.innerText = "\u2014";
          adminToast(adminText(adminIsZh(), "\u64CD\u4F5C\u65E5\u5FD7\u8BFB\u53D6\u5931\u8D25\u3002", "Audit logs failed to load."), "danger");
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
        if (!logs.length) return adminEmpty(adminText(adminIsZh(), "\u6682\u65E0\u65E5\u5FD7", "No logs yet"));
        return logs.map((log, index) =>
          '<article class="admin-log-row animated-row ' + adminEscape(log.severity || "info") + '" style="--stagger:' + Math.min(index, 12) + '" data-log-id="' + adminEscape(log.id || index) + '">' +
            '<span class="log-dot"></span>' +
            '<div><strong>' + adminEscape(adminActionLabel(log.action)) + '</strong><p>' + adminEscape(adminLogDescription(log)) + '</p><small>' + adminFormatDate(log.created_at) + ' \xB7 ' + adminEscape(log.actor_email || "-") + (compact ? "" : " \xB7 " + adminEscape(log.ip_address || "-")) + '</small></div>' +
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
    <\/script>
  `;
}
__name(adminClientScript, "adminClientScript");
function adminHubContent(zh, osHubGrid2) {
  const prefix = zh ? "/zh-cn" : "/en";
  const items = zh ? [
    { title: "\u901A\u7528", meta: "\u7BA1\u7406\u6982\u89C8", description: "\u8D26\u6237\u7EDF\u8BA1\u3001\u8FD1\u671F\u767B\u5F55\u3001\u64CD\u4F5C\u65E5\u5FD7\u4E0E\u7CFB\u7EDF\u98CE\u9669\u4FE1\u53F7\u3002", href: `${prefix}/admin/general`, icon: "general", featured: true, tone: "blue" },
    { title: "\u7528\u6237\u7BA1\u7406", meta: "\u6210\u5458", description: "\u641C\u7D22\u7528\u6237\uFF0C\u67E5\u770B\u8D44\u6599\u5E76\u8C03\u6574\u89D2\u8272\u6216\u8D26\u53F7\u72B6\u6001\u3002", href: `${prefix}/admin/users`, icon: "users" },
    { title: "\u89D2\u8272\u6743\u9650", meta: "RBAC", description: "\u67E5\u770B\u89D2\u8272\u8303\u56F4\u5E76\u7BA1\u7406\u7BA1\u7406\u5458\u3001\u7F16\u8F91\u8005\u4E0E\u666E\u901A\u6210\u5458\u6743\u9650\u3002", href: `${prefix}/admin/roles`, icon: "roles" },
    { title: "\u64CD\u4F5C\u65E5\u5FD7", meta: "\u5BA1\u8BA1", description: "\u6309\u52A8\u4F5C\u3001\u7EA7\u522B\u3001\u7528\u6237\u548C\u65E5\u671F\u7B5B\u9009\u7BA1\u7406\u64CD\u4F5C\u8BB0\u5F55\u3002", href: `${prefix}/admin/logs`, icon: "logs" },
    { title: "\u7CFB\u7EDF\u72B6\u6001", meta: "\u7CFB\u7EDF", description: "\u67E5\u770B\u7BA1\u7406\u80FD\u529B\u4E0E\u8FD0\u884C\u72B6\u6001\u76F8\u5173\u4FE1\u606F\u3002", href: `${prefix}/admin/system`, icon: "system" }
  ] : [
    { title: "General", meta: "Overview", description: "Account metrics, recent sign-ins, operation logs, and system risk signals.", href: `${prefix}/admin/general`, icon: "general", featured: true, tone: "blue" },
    { title: "Users", meta: "Members", description: "Search users, review profiles, and adjust roles or account status.", href: `${prefix}/admin/users`, icon: "users" },
    { title: "Roles", meta: "RBAC", description: "Review role scopes and manage administrator, editor, and member permissions.", href: `${prefix}/admin/roles`, icon: "roles" },
    { title: "Logs", meta: "Audit", description: "Filter administration records by action, severity, user, and date.", href: `${prefix}/admin/logs`, icon: "logs" },
    { title: "System", meta: "System", description: "Review management capabilities and runtime-related status information.", href: `${prefix}/admin/system`, icon: "system" }
  ];
  return osHubGrid2(items, "admin-hub-grid");
}
__name(adminHubContent, "adminHubContent");

// studio/ui-dashboard.js
function dashboardIcon(name) {
  const icons = {
    profile: '<circle cx="12" cy="8" r="3.2"/><path d="M5.5 19c.9-3.2 3.2-5 6.5-5s5.6 1.8 6.5 5"/>',
    workbench: '<rect x="4" y="5" width="16" height="14" rx="3"/><path d="M8 9h8M8 13h5"/>',
    storage: '<path d="M4 7.5C4 5.6 7.6 4 12 4s8 1.6 8 3.5S16.4 11 12 11 4 9.4 4 7.5z"/><path d="M4 7.5v4C4 13.4 7.6 15 12 15s8-1.6 8-3.5v-4M4 11.5v4C4 17.4 7.6 19 12 19s8-1.6 8-3.5v-4"/>',
    links: '<path d="M9.5 14.5l5-5M7.2 16.8l-1.3 1.3a3.2 3.2 0 01-4.5-4.5l3.4-3.4a3.2 3.2 0 014.5 0M16.8 7.2l1.3-1.3a3.2 3.2 0 014.5 4.5l-3.4 3.4a3.2 3.2 0 01-4.5 0"/>',
    security: '<path d="M12 3l7 3v5c0 4.4-2.6 7.8-7 10-4.4-2.2-7-5.6-7-10V6l7-3z"/><path d="M9.3 12l1.8 1.8 3.7-4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7.4 7.4 0 00-.1-1l2-1.5-2-3.4-2.5 1A8.3 8.3 0 0014.7 6L14.4 3h-4.8L9.3 6a8.3 8.3 0 00-1.7 1.1l-2.5-1-2 3.4 2 1.5a7.4 7.4 0 000 2l-2 1.5 2 3.4 2.5-1A8.3 8.3 0 009.3 18l.3 3h4.8l.3-3a8.3 8.3 0 001.7-1.1l2.5 1 2-3.4-2-1.5c.1-.3.1-.7.1-1z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    appearance: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 000 16z"/>',
    language: '<path d="M4 5h10M9 5c-.2 5-2.3 8.3-5 10M6 9c1.8 2.8 4 4.8 7 6M14 10h6M17 7v10M14 17h6"/>'
  };
  return '<span class="dashboard-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (icons[name] || icons.info) + "</svg></span>";
}
__name(dashboardIcon, "dashboardIcon");
function dashboardContent(zh) {
  const prefix = zh ? "/zh-cn" : "/en";
  const shortcuts = zh ? [
    ["\u7528\u6237\u8D44\u6599", "\u5B8C\u5584\u4F60\u7684\u5934\u50CF\u3001\u7B7E\u540D\u4E0E\u4E3B\u9875", "profile", `${prefix}/profile/details`],
    ["\u5DE5\u4F5C\u53F0", "\u8FDB\u5165\u5DE5\u4F5C\u533A\u4E3B\u8981\u64CD\u4F5C\u754C\u9762", "workbench", `${prefix}/workspace/workbench`],
    ["\u79C1\u4EBA\u5B58\u50A8", "\u7BA1\u7406\u5F53\u524D\u8D26\u53F7\u7684 R2 \u6587\u4EF6", "storage", `${prefix}/settings/storage`],
    ["\u6536\u85CF\u94FE\u63A5", "\u6253\u5F00\u4F60\u7684\u94FE\u63A5\u6536\u85CF\u4E0E\u5E38\u7528\u5165\u53E3", "links", `${prefix}/info/links`],
    ["\u8D26\u6237\u4E0E\u5B89\u5168", "\u67E5\u770B\u8BBE\u5907\u3001\u767B\u5F55\u4E0E\u5B89\u5168\u8BB0\u5F55", "security", `${prefix}/settings/security`],
    ["\u8BBE\u7F6E", "\u5916\u89C2\u3001\u8BED\u8A00\u4E0E\u5176\u4ED6\u504F\u597D\u5165\u53E3", "settings", `${prefix}/settings`]
  ] : [
    ["Profile Details", "Edit your photo, signature, and personal page", "profile", `${prefix}/profile/details`],
    ["Workbench", "Open the main operating surface in Workspace", "workbench", `${prefix}/workspace/workbench`],
    ["Private Storage", "Manage R2 files for this account", "storage", `${prefix}/settings/storage`],
    ["Saved Links", "Open saved links and common destinations", "links", `${prefix}/info/links`],
    ["Account & Security", "Review devices, sign-ins, and security records", "security", `${prefix}/settings/security`],
    ["Settings", "Appearance, language, and preference entry points", "settings", `${prefix}/settings`]
  ];
  const moduleRows = zh ? [
    ["\u4E2A\u4EBA\u4E3B\u9875", "\u5DF2\u63A5\u5165", "\u5934\u50CF\u3001\u80CC\u666F\u3001\u4E2A\u6027\u7B7E\u540D\u3001\u72B6\u6001\u3001\u5174\u8DA3\u4E0E\u94FE\u63A5\u5E93\u3002", "profile", `${prefix}/profile`],
    ["\u79C1\u4EBA\u5B58\u50A8", "\u5DF2\u8FDE\u63A5", "Cloudflare R2 \u79C1\u4EBA\u6587\u4EF6\u7A7A\u95F4\u3002", "storage", `${prefix}/settings/storage`],
    ["\u5DE5\u4F5C\u533A", "\u5165\u53E3\u5DF2\u5EFA\u7ACB", "\u5DE5\u4F5C\u53F0\u3001\u9879\u76EE\u3001\u5B9E\u9A8C\u3001\u8349\u7A3F\u4E0E\u4EFB\u52A1\u5DF2\u6709\u72EC\u7ACB\u8DEF\u7531\u3002", "workbench", `${prefix}/workspace`],
    ["\u4FE1\u606F\u4E2D\u5FC3", "\u90E8\u5206\u53EF\u7528", "\u6536\u85CF\u94FE\u63A5\u7B49\u5165\u53E3\u53EF\u7528\uFF0C\u5176\u4F59\u6A21\u5757\u7B49\u5F85\u6570\u636E\u6E90\u3002", "info", `${prefix}/info`]
  ] : [
    ["Profile", "Connected", "Profile photo, background, signature, presence, interests, and links.", "profile", `${prefix}/profile`],
    ["Private Storage", "Connected", "Private Cloudflare R2 file space.", "storage", `${prefix}/settings/storage`],
    ["Workspace", "Routes ready", "Workbench, projects, experiments, drafts, and tasks have distinct routes.", "workbench", `${prefix}/workspace`],
    ["Information", "Partially available", "Saved links are available; other modules still await data sources.", "info", `${prefix}/info`]
  ];
  return `
    <section class="dashboard-welcome">
      <div class="dashboard-welcome-copy">
        <span class="dashboard-eyebrow">${zh ? "QssedA Studio" : "QssedA Studio"}</span>
        <h2>${zh ? "\u6B22\u8FCE\u56DE\u6765" : "Welcome back"}</h2>
        <p>${zh ? "\u4ECE\u8FD9\u91CC\u7EE7\u7EED\u8FDB\u5165\u4F60\u7684\u4E2A\u4EBA\u7A7A\u95F4\u3001\u5DE5\u4F5C\u533A\u3001\u6536\u85CF\u5185\u5BB9\u4E0E\u79C1\u4EBA\u5B58\u50A8\u3002\u9996\u9875\u53EA\u5C55\u793A\u771F\u5B9E\u53EF\u7528\u7684\u5165\u53E3\uFF0C\u4E0D\u5236\u9020\u6CA1\u6709\u6570\u636E\u6765\u6E90\u7684\u7EDF\u8BA1\u6570\u5B57\u3002" : "Continue into your profile, workspace, saved content, and private storage. The dashboard only surfaces real entry points rather than invented statistics."}</p>
        <div class="dashboard-welcome-actions">
          <a class="dashboard-primary-action" href="${prefix}/workspace/workbench">${zh ? "\u6253\u5F00\u5DE5\u4F5C\u53F0" : "Open Workbench"}<span>\u203A</span></a>
          <a class="dashboard-secondary-action" href="${prefix}/profile/details">${zh ? "\u7F16\u8F91\u7528\u6237\u8D44\u6599" : "Edit Profile"}<span>\u203A</span></a>
        </div>
      </div>
      <div class="dashboard-today-card" aria-label="${zh ? "\u672C\u6B21\u8BBF\u95EE" : "This visit"}">
        ${dashboardIcon("clock")}
        <div>
          <small>${zh ? "\u672C\u6B21\u8BBF\u95EE" : "This visit"}</small>
          <strong id="dashboard-live-time">--:--</strong>
          <span id="dashboard-live-date">----</span>
        </div>
      </div>
    </section>

    <section class="dashboard-section">
      <div class="dashboard-section-head">
        <div><small>${zh ? "\u5FEB\u901F\u5F00\u59CB" : "Quick Start"}</small><h2>${zh ? "\u7EE7\u7EED\u4F7F\u7528" : "Continue"}</h2></div>
        <span>${zh ? "\u5E38\u7528\u5165\u53E3" : "Common destinations"}</span>
      </div>
      <div class="dashboard-shortcuts">
        ${shortcuts.map((item) => `<a class="dashboard-shortcut" href="${item[3]}">${dashboardIcon(item[2])}<span><strong>${item[0]}</strong><small>${item[1]}</small></span><b aria-hidden="true">\u203A</b></a>`).join("")}
      </div>
    </section>

    <section class="dashboard-split">
      <article class="os-card dashboard-module-card">
        <div class="dashboard-section-head compact">
          <div><small>${zh ? "Studio \u6982\u89C8" : "Studio Overview"}</small><h2>${zh ? "\u5F53\u524D\u6A21\u5757" : "Current Modules"}</h2></div>
        </div>
        <div class="dashboard-module-list">
          ${moduleRows.map((row) => `<a href="${row[4]}">${dashboardIcon(row[3])}<span><strong>${row[0]}</strong><small>${row[2]}</small></span><em>${row[1]}</em><b aria-hidden="true">\u203A</b></a>`).join("")}
        </div>
      </article>

      <article class="os-card dashboard-session-card">
        <div class="dashboard-section-head compact">
          <div><small>${zh ? "\u5F53\u524D\u73AF\u5883" : "Current Environment"}</small><h2>${zh ? "\u672C\u6B21\u4F7F\u7528" : "This Session"}</h2></div>
        </div>
        <div class="dashboard-session-facts">
          <div>${dashboardIcon("appearance")}<span><small>${zh ? "\u5916\u89C2" : "Appearance"}</small><strong id="dashboard-theme-label">\u2014</strong></span></div>
          <div>${dashboardIcon("language")}<span><small>${zh ? "\u8BED\u8A00" : "Language"}</small><strong>${zh ? "\u7B80\u4F53\u4E2D\u6587" : "English"}</strong></span></div>
          <div>${dashboardIcon("storage")}<span><small>${zh ? "\u5B58\u50A8" : "Storage"}</small><strong>Cloudflare R2</strong></span></div>
        </div>
        <a class="dashboard-session-settings" href="${prefix}/settings">${zh ? "\u7BA1\u7406\u8BBE\u7F6E" : "Manage settings"}<span>\u203A</span></a>
      </article>
    </section>

    <section class="os-card dashboard-activity-card">
      <div class="dashboard-section-head compact">
        <div><small>${zh ? "\u6D3B\u52A8" : "Activity"}</small><h2>${zh ? "\u6700\u8FD1\u52A8\u6001" : "Recent Activity"}</h2></div>
      </div>
      <div class="dashboard-empty-activity">
        <span></span>
        <strong>${zh ? "\u6682\u65F6\u6CA1\u6709\u7EDF\u4E00\u6D3B\u52A8\u6D41" : "No unified activity feed yet"}</strong>
        <p>${zh ? "\u9879\u76EE\u3001\u5B9E\u9A8C\u3001\u8349\u7A3F\u548C\u4EFB\u52A1\u7684\u6570\u636E\u6A21\u578B\u63A5\u5165\u540E\uFF0C\u8FD9\u91CC\u518D\u5C55\u793A\u771F\u5B9E\u7684\u6700\u8FD1\u6D3B\u52A8\uFF1B\u76EE\u524D\u4E0D\u4F7F\u7528\u793A\u4F8B\u6570\u636E\u5192\u5145\u5386\u53F2\u8BB0\u5F55\u3002" : "Real recent activity will appear here after projects, experiments, drafts, and tasks share persistent data. Placeholder activity is intentionally not shown as history."}</p>
        <a href="${prefix}/workspace">${zh ? "\u67E5\u770B\u5DE5\u4F5C\u533A" : "View Workspace"} <b>\u203A</b></a>
      </div>
    </section>

    <script>
      (() => {
        const time = document.getElementById("dashboard-live-time");
        const date = document.getElementById("dashboard-live-date");
        const theme = document.getElementById("dashboard-theme-label");
        const zh = ${zh ? "true" : "false"};
        const paint = () => {
          const now = new Date();
          if (time) time.textContent = new Intl.DateTimeFormat(zh ? "zh-CN" : "en", { hour:"2-digit", minute:"2-digit", hour12:false }).format(now);
          if (date) date.textContent = new Intl.DateTimeFormat(zh ? "zh-CN" : "en", { year:"numeric", month:"long", day:"numeric", weekday:"short" }).format(now);
          if (theme) {
            const current = document.documentElement.dataset.theme || "light";
            theme.textContent = current === "dark" ? (zh ? "\u6DF1\u8272" : "Dark") : (zh ? "\u6D45\u8272" : "Light");
          }
        };
        paint();
        window.setInterval(paint, 30000);
        new MutationObserver(paint).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
      })();
    <\/script>
  `;
}
__name(dashboardContent, "dashboardContent");

// studio/ui-information.js
function linksContent(zh) {
  return `<section class="os-card is-large"><h2>${zh ? "\u5C1A\u672A\u63A5\u5165\u6536\u85CF\u94FE\u63A5" : "Saved links are not connected yet"}</h2><p>${zh ? "\u5F53\u524D\u6570\u636E\u5E93\u6CA1\u6709\u6536\u85CF\u94FE\u63A5\u8868\uFF0C\u56E0\u6B64\u8FD9\u91CC\u4E0D\u518D\u5C55\u793A\u56FA\u5B9A\u793A\u4F8B\u94FE\u63A5\u6216\u4F2A\u9020\u6536\u85CF\u65F6\u95F4\u3002" : "There is no saved-links table in the current database, so this page no longer shows fixed sample links or fabricated saved dates."}</p></section>`;
}
__name(linksContent, "linksContent");
function notesContent(zh) {
  return `<section class="os-card is-large"><h2>${zh ? "\u7B14\u8BB0\u5B58\u50A8\u5C1A\u672A\u63A5\u5165" : "Note storage is not connected yet"}</h2><p>${zh ? "\u5F53\u524D\u6CA1\u6709 notes \u6570\u636E\u8868\u6216\u4FDD\u5B58\u63A5\u53E3\uFF0C\u56E0\u6B64\u8FD9\u91CC\u4E0D\u518D\u663E\u793A\u4E00\u4E2A\u770B\u4F3C\u53EF\u7F16\u8F91\u4F46\u65E0\u6CD5\u6301\u4E45\u5316\u7684 Markdown \u7F16\u8F91\u5668\u3002" : "There is no notes table or save API, so this page no longer presents an editor that looks functional but cannot persist changes."}</p></section>`;
}
__name(notesContent, "notesContent");
function summariesContent(zh, statusContent2) {
  return statusContent2(zh, "\u6458\u8981\u6570\u636E\u5C1A\u672A\u63A5\u5165", "\u5F53\u524D\u6CA1\u6709\u7528\u4E8E\u4FDD\u5B58 B \u7AD9\u3001YouTube\u3001\u7F51\u9875\u6216 PDF \u6458\u8981\u7684\u6570\u636E\u6E90\u3002", "Summary data is not connected yet", "There is no persistent data source for Bilibili, YouTube, webpage, or PDF summaries yet.");
}
__name(summariesContent, "summariesContent");
function searchContent(zh) {
  return `<section class="os-card is-large"><h2>${zh ? "\u5168\u5C40\u641C\u7D22\u5C1A\u672A\u63A5\u5165" : "Global search is not connected yet"}</h2><p>${zh ? "\u5F53\u524D\u6CA1\u6709\u7B14\u8BB0\u3001\u94FE\u63A5\u3001\u9879\u76EE\u6216\u804A\u5929\u8BB0\u5F55\u7684\u6570\u636E\u7D22\u5F15\uFF0C\u56E0\u6B64\u4E0D\u5C55\u793A\u65E0\u5B9E\u9645\u641C\u7D22\u884C\u4E3A\u7684\u8F93\u5165\u6846\u3002" : "There is no index for notes, links, projects, or chat records yet, so this page does not show a search box with no real search behavior."}</p></section>`;
}
__name(searchContent, "searchContent");
function informationContent(path, zh, statusContent2) {
  if (path === "/info") return statusContent2(zh, "\u4FE1\u606F\u4E2D\u5FC3\u5C1A\u672A\u63A5\u5165", "\u6536\u85CF\u94FE\u63A5\u3001\u7B14\u8BB0\u3001\u6458\u8981\u548C AI \u5BF9\u8BDD\u76EE\u524D\u6CA1\u6709\u6301\u4E45\u5316\u6570\u636E\u6E90\u3002", "Information Center is not connected yet", "Saved links, notes, summaries, and AI conversations do not have persistent data sources yet.");
  if (path === "/info/knowledge") return statusContent2(zh, "\u77E5\u8BC6\u5E93", "\u7528\u4E8E\u6574\u7406\u503C\u5F97\u957F\u671F\u4FDD\u7559\u7684\u77E5\u8BC6\u5185\u5BB9\uFF0C\u8BA9\u4FE1\u606F\u66F4\u5BB9\u6613\u79EF\u7D2F\u3001\u67E5\u627E\u548C\u56DE\u987E\u3002", "Knowledge Base", "Organize knowledge worth keeping so it remains easy to build on, find, and revisit.");
  if (path === "/info/links") return linksContent(zh);
  if (path === "/info/notes") return notesContent(zh);
  if (path === "/info/summaries") return summariesContent(zh, statusContent2);
  if (path === "/info/search") return searchContent(zh);
  throw new Error("Unhandled OS path: " + path);
}
__name(informationContent, "informationContent");

// studio/ui-workspace.js
function workspaceContent(path, zh, statusContent2) {
  if (path.endsWith("/workbench")) return statusContent2(zh, "\u5DE5\u4F5C\u53F0\u6570\u636E\u5C1A\u672A\u63A5\u5165", "\u5DE5\u4F5C\u53F0\u662F\u5DE5\u4F5C\u533A\u4E2D\u7684\u4E3B\u8981\u64CD\u4F5C\u754C\u9762\uFF1B\u5F53\u524D\u5C1A\u672A\u5EFA\u7ACB\u72EC\u7ACB\u7684\u6301\u4E45\u5316\u5DE5\u4F5C\u53F0\u6570\u636E\u6A21\u578B\u3002", "Workbench data is not connected yet", "The Workbench is the primary operating surface inside Workspace; a dedicated persistent workbench data model has not been established yet.");
  if (path.endsWith("/projects")) return statusContent2(zh, "\u9879\u76EE\u6570\u636E\u5C1A\u672A\u63A5\u5165", "\u5F53\u524D\u6570\u636E\u5E93\u6CA1\u6709 projects \u8868\uFF0C\u56E0\u6B64\u4E0D\u5C55\u793A\u9879\u76EE\u540D\u79F0\u3001\u72B6\u6001\u6216\u5B8C\u6210\u767E\u5206\u6BD4\u3002", "Project data is not connected yet", "There is no projects table in the current database, so project names, statuses, and completion percentages are not shown.");
  if (path.endsWith("/experiments")) return statusContent2(zh, "\u5B9E\u9A8C\u5DE5\u5177\u5C1A\u672A\u63A5\u5165", "Prompt\u3001Agent \u548C API \u5B9E\u9A8C\u76EE\u524D\u6CA1\u6709\u6301\u4E45\u5316\u6570\u636E\u6216\u72EC\u7ACB\u5DE5\u5177\u63A5\u53E3\u3002", "Experiment tools are not connected yet", "Prompt, agent, and API experiments do not currently have persistent data or dedicated tool APIs.");
  if (path.endsWith("/drafts")) return statusContent2(zh, "\u8349\u7A3F\u5B58\u50A8\u5C1A\u672A\u63A5\u5165", "\u5F53\u524D\u6570\u636E\u5E93\u6CA1\u6709 drafts \u8868\u6216\u8349\u7A3F\u4FDD\u5B58\u63A5\u53E3\u3002", "Draft storage is not connected yet", "There is no drafts table or draft persistence API yet.");
  if (path.endsWith("/tasks")) return statusContent2(zh, "\u4EFB\u52A1\u6570\u636E\u5C1A\u672A\u63A5\u5165", "\u5F53\u524D\u6570\u636E\u5E93\u6CA1\u6709 tasks \u8868\uFF0C\u56E0\u6B64\u4E0D\u5C55\u793A Todo \u6216 Kanban \u6570\u636E\u3002", "Task data is not connected yet", "There is no tasks table in the current database, so Todo or Kanban data is not shown.");
  return statusContent2(zh, "\u5DE5\u4F5C\u533A\u6570\u636E\u5C1A\u672A\u63A5\u5165", "\u9879\u76EE\u3001\u5B9E\u9A8C\u3001\u8349\u7A3F\u548C\u4EFB\u52A1\u76EE\u524D\u6CA1\u6709\u7EDF\u4E00\u7684\u6301\u4E45\u5316\u5DE5\u4F5C\u533A\u6570\u636E\u6A21\u578B\u3002", "Workspace data is not connected yet", "Projects, experiments, drafts, and tasks do not yet have a unified persistent workspace data model.");
}
__name(workspaceContent, "workspaceContent");

// studio/ui-settings.js
function settingsGeneralContent(zh, osHubIcon2) {
  const prefix = zh ? "/zh-cn" : "/en";
  const rows = zh ? [
    ["\u5916\u89C2", "\u6D45\u8272 / \u6DF1\u8272", `${prefix}/settings/appearance`, "appearance"],
    ["\u8BED\u8A00", "\u4E2D\u6587 / English", `${prefix}/settings/language`, "language"],
    ["\u8D26\u6237\u4E0E\u5B89\u5168", "\u8BBE\u5907\u4E0E\u767B\u5F55", `${prefix}/settings/security`, "shield"]
  ] : [
    ["Appearance", "Light / Dark", `${prefix}/settings/appearance`, "appearance"],
    ["Language", "Chinese / English", `${prefix}/settings/language`, "language"],
    ["Account & Security", "Devices & sign-ins", `${prefix}/settings/security`, "shield"]
  ];
  return `
    <section class="os-card settings-general-card">
      <div class="settings-general-heading">
        ${osHubIcon2("general")}
        <div>
          <small>${zh ? "\u901A\u7528\u8BBE\u7F6E" : "General Settings"}</small>
          <h2>${zh ? "\u57FA\u7840\u4E0E\u5E38\u7528\u8BBE\u7F6E" : "Basics & Common Settings"}</h2>
          <p>${zh ? "\u8FD9\u91CC\u4FDD\u7559\u8DE8\u6A21\u5757\u7684\u57FA\u7840\u8BBE\u7F6E\u5165\u53E3\u3002\u5177\u4F53\u9009\u9879\u4ECD\u5728\u5404\u81EA\u9875\u9762\u4E2D\u7BA1\u7406\uFF0C\u907F\u514D\u628A\u4E0D\u540C\u5C42\u7EA7\u7684\u63A7\u5236\u6DF7\u5728\u4E00\u8D77\u3002" : "This page keeps cross-module basics together. Detailed controls remain on their dedicated pages instead of mixing unrelated levels."}</p>
        </div>
      </div>
      <div class="settings-general-list">
        ${rows.map((row) => `<a href="${row[2]}">${osHubIcon2(row[3])}<span><strong>${row[0]}</strong><small>${row[1]}</small></span><b aria-hidden="true">\u203A</b></a>`).join("")}
      </div>
    </section>
    <section class="os-card settings-general-note">
      <strong>${zh ? "\u5173\u4E8E\u901A\u7528\u8BBE\u7F6E" : "About General"}</strong>
      <p>${zh ? "\u5F53\u524D\u6CA1\u6709\u4E3A\u5C1A\u672A\u63A5\u5165\u7684\u529F\u80FD\u521B\u5EFA\u65E0\u5B9E\u9645\u4F5C\u7528\u7684\u5F00\u5173\u3002\u7B49\u5BF9\u5E94\u670D\u52A1\u5177\u5907\u771F\u5B9E\u914D\u7F6E\u4E0E\u6301\u4E45\u5316\u80FD\u529B\u540E\uFF0C\u518D\u5728\u8FD9\u91CC\u52A0\u5165\u53EF\u64CD\u4F5C\u9009\u9879\u3002" : "No placeholder switches are shown for features that are not connected yet. Controls will appear here only when they have real configuration and persistence behind them."}</p>
    </section>
  `;
}
__name(settingsGeneralContent, "settingsGeneralContent");
function securityAuditContent(zh) {
  return `
    <section class="os-card audit-section">
      <h2>${zh ? "\u5F53\u524D\u8BBE\u5907" : "Current Device"}</h2>
      <div id="audit-current-device" class="audit-current">...</div>
    </section>
    <section class="os-card audit-section">
      <h2>${zh ? "\u767B\u5F55\u8BBE\u5907\u5217\u8868" : "Login Devices"}</h2>
      <div id="audit-device-list" class="audit-devices"></div>
    </section>
    <section class="os-card audit-section">
      <h2>${zh ? "\u767B\u5F55\u5386\u53F2" : "Login History"}</h2>
      <div id="audit-login-timeline" class="audit-timeline"></div>
    </section>
    <section class="os-card audit-section">
      <h2>${zh ? "\u5F02\u5E38\u767B\u5F55\u63D0\u793A" : "Risk Alerts"}</h2>
      <div id="audit-risk-alerts" class="audit-alerts"></div>
    </section>
  `;
}
__name(securityAuditContent, "securityAuditContent");
function appearanceSettingsContent(zh) {
  return `
    <section class="os-card is-large settings-detail-card">
      <h2>${zh ? "\u663E\u793A\u6A21\u5F0F" : "Display Mode"}</h2>
      <p>${zh ? "\u9009\u62E9\u7F51\u9875\u4F7F\u7528\u6D45\u8272\u6216\u6DF1\u8272\u5916\u89C2\u3002\u8BBE\u7F6E\u4F1A\u4FDD\u5B58\u5728\u5F53\u524D\u6D4F\u89C8\u5668\u4E2D\u3002" : "Choose light or dark appearance. The preference is saved in this browser."}</p>
      <div class="settings-choice-grid">
        <button class="settings-choice" type="button" data-settings-theme="light"><strong>${zh ? "\u6D45\u8272" : "Light"}</strong><span>${zh ? "\u59CB\u7EC8\u4F7F\u7528\u6D45\u8272\u5916\u89C2" : "Always use the light appearance"}</span></button>
        <button class="settings-choice" type="button" data-settings-theme="dark"><strong>${zh ? "\u6DF1\u8272" : "Dark"}</strong><span>${zh ? "\u59CB\u7EC8\u4F7F\u7528\u6DF1\u8272\u5916\u89C2" : "Always use the dark appearance"}</span></button>
      </div>
    </section>
    <script>
      (() => {
        const choices = Array.from(document.querySelectorAll("[data-settings-theme]"));
        if (!choices.length) return;
        const refresh = () => {
          const current = document.documentElement.dataset.theme || "light";
          choices.forEach(button => button.classList.toggle("is-selected", button.dataset.settingsTheme === current));
        };
        choices.forEach(button => button.addEventListener("click", () => {
          const theme = button.dataset.settingsTheme;
          document.documentElement.classList.add("theme-switching");
          document.documentElement.dataset.theme = theme;
          try { localStorage.setItem("qssed-theme", theme); } catch {}
          window.setTimeout(() => document.documentElement.classList.remove("theme-switching"), 220);
          refresh();
        }));
        refresh();
      })();
    <\/script>
  `;
}
__name(appearanceSettingsContent, "appearanceSettingsContent");
function languageSettingsContent(zh) {
  return `
    <section class="os-card is-large settings-detail-card">
      <h2>${zh ? "\u7F51\u9875\u8BED\u8A00" : "Site Language"}</h2>
      <p>${zh ? "\u9009\u62E9 QssedA Studio \u7684\u663E\u793A\u8BED\u8A00\u3002\u5207\u6362\u540E\u4F1A\u4FDD\u7559\u5F53\u524D\u8BBE\u7F6E\u9875\u9762\u3002" : "Choose the display language for QssedA Studio. Switching keeps you on the current settings page."}</p>
      <div class="settings-choice-grid">
        <a class="settings-choice ${zh ? "is-selected" : ""}" href="/zh-cn/settings/language"><strong>\u4E2D\u6587</strong><span>\u7B80\u4F53\u4E2D\u6587</span></a>
        <a class="settings-choice ${zh ? "" : "is-selected"}" href="/en/settings/language"><strong>English</strong><span>English</span></a>
      </div>
    </section>
  `;
}
__name(languageSettingsContent, "languageSettingsContent");
function settingsHubContent(zh, osHubGrid2) {
  const prefix = zh ? "/zh-cn" : "/en";
  const items = zh ? [
    { title: "\u901A\u7528", meta: "\u57FA\u7840", description: "\u67E5\u770B\u7F51\u7AD9\u57FA\u7840\u884C\u4E3A\u4E0E\u5E38\u7528\u8BBE\u7F6E\u5165\u53E3\u3002", href: `${prefix}/settings/general`, icon: "general", featured: true, tone: "blue" },
    { title: "\u5916\u89C2", meta: "\u53EF\u7528", description: "\u5207\u6362\u6D45\u8272\u4E0E\u6DF1\u8272\u663E\u793A\u6A21\u5F0F\u3002", href: `${prefix}/settings/appearance`, icon: "appearance" },
    { title: "\u8BED\u8A00", meta: "\u53EF\u7528", description: "\u5728\u4E2D\u6587\u4E0E English \u4E4B\u95F4\u5207\u6362\u7F51\u9875\u8BED\u8A00\u3002", href: `${prefix}/settings/language`, icon: "language" },
    { title: "\u8D26\u6237\u4E0E\u5B89\u5168", meta: "\u53EF\u7528", description: "\u67E5\u770B\u8BBE\u5907\u3001\u767B\u5F55\u5386\u53F2\u4E0E\u5B89\u5168\u8BB0\u5F55\u3002", href: `${prefix}/settings/security`, icon: "shield" },
    { title: "\u901A\u77E5", meta: "\u89C4\u5212\u4E2D", description: "\u7BA1\u7406\u63D0\u9192\u3001\u7AD9\u5185\u6D88\u606F\u4E0E\u901A\u77E5\u504F\u597D\u3002", href: `${prefix}/settings/notifications`, icon: "notifications" },
    { title: "AI \u8BBE\u7F6E", meta: "\u89C4\u5212\u4E2D", description: "\u7BA1\u7406 AI Provider\u3001\u6A21\u578B\u4E0E\u4E2A\u4EBA AI \u504F\u597D\u3002", href: `${prefix}/settings/ai`, icon: "ai" },
    { title: "\u7B2C\u4E09\u65B9\u96C6\u6210", meta: "\u89C4\u5212\u4E2D", description: "\u7BA1\u7406\u5916\u90E8\u670D\u52A1\u4E0E\u8D26\u53F7\u6388\u6743\u3002", href: `${prefix}/settings/integrations`, icon: "integrations" },
    { title: "\u5B58\u50A8\u7BA1\u7406", meta: "\u5DF2\u8FDE\u63A5", description: "\u7BA1\u7406\u5F53\u524D\u8D26\u53F7\u7684\u79C1\u4EBA Cloudflare R2 \u6587\u4EF6\u3002", href: `${prefix}/settings/storage`, icon: "storage" }
  ] : [
    { title: "General", meta: "Basics", description: "Review general site behavior and common settings entry points.", href: `${prefix}/settings/general`, icon: "general", featured: true, tone: "blue" },
    { title: "Appearance", meta: "Available", description: "Switch between light and dark display modes.", href: `${prefix}/settings/appearance`, icon: "appearance" },
    { title: "Language", meta: "Available", description: "Switch the interface between Chinese and English.", href: `${prefix}/settings/language`, icon: "language" },
    { title: "Account & Security", meta: "Available", description: "Review devices, login history, and security records.", href: `${prefix}/settings/security`, icon: "shield" },
    { title: "Notifications", meta: "Planned", description: "Manage reminders, in-app messages, and notification preferences.", href: `${prefix}/settings/notifications`, icon: "notifications" },
    { title: "AI Settings", meta: "Planned", description: "Manage AI providers, models, and personal AI preferences.", href: `${prefix}/settings/ai`, icon: "ai" },
    { title: "Integrations", meta: "Planned", description: "Manage external services and account authorizations.", href: `${prefix}/settings/integrations`, icon: "integrations" },
    { title: "Storage", meta: "Connected", description: "Manage private Cloudflare R2 files for this account.", href: `${prefix}/settings/storage`, icon: "storage" }
  ];
  return osHubGrid2(items, "settings-hub-grid");
}
__name(settingsHubContent, "settingsHubContent");
function settingsFallbackContent(zh) {
  const prefix = zh ? "/zh-cn" : "/en";
  const items = zh ? [
    ["\u5916\u89C2", "\u53EF\u7528", "\u8BBE\u7F6E\u6D45\u8272\u6216\u6DF1\u8272\u4E3B\u9898\uFF0C\u4EE5\u53CA\u7F51\u9875\u7684\u6574\u4F53\u663E\u793A\u65B9\u5F0F\u3002", `${prefix}/settings/appearance`],
    ["\u8BED\u8A00", "\u53EF\u7528", "\u8BBE\u7F6E\u7F51\u9875\u663E\u793A\u8BED\u8A00\uFF1B\u5F53\u524D\u652F\u6301\u4E2D\u6587\u4E0E English\u3002", `${prefix}/settings/language`],
    ["\u8D26\u6237\u4E0E\u5B89\u5168", "\u53EF\u7528", "\u67E5\u770B\u5F53\u524D\u8BBE\u5907\u3001\u767B\u5F55\u8BBE\u5907\u3001\u767B\u5F55\u5386\u53F2\u4E0E\u5F02\u5E38\u767B\u5F55\u8BB0\u5F55\u3002", `${prefix}/settings/security`],
    ["\u901A\u77E5", "\u89C4\u5212\u4E2D", "\u7BA1\u7406\u63D0\u9192\u3001\u7AD9\u5185\u6D88\u606F\u4E0E\u5176\u4ED6\u901A\u77E5\u504F\u597D\u3002", `${prefix}/settings/notifications`],
    ["AI \u8BBE\u7F6E", "\u89C4\u5212\u4E2D", "\u7BA1\u7406 AI Provider\u3001\u6A21\u578B\u4E0E\u4E2A\u4EBA AI \u504F\u597D\u3002", `${prefix}/settings/ai`],
    ["\u7B2C\u4E09\u65B9\u96C6\u6210", "\u89C4\u5212\u4E2D", "\u7BA1\u7406\u53EF\u8FDE\u63A5\u7684\u7B2C\u4E09\u65B9\u670D\u52A1\u4E0E\u8D26\u53F7\u6388\u6743\u3002", `${prefix}/settings/integrations`],
    ["\u5B58\u50A8\u7BA1\u7406", "\u5DF2\u8FDE\u63A5", "\u4E0A\u4F20\u3001\u4E0B\u8F7D\u548C\u7BA1\u7406\u4EC5\u5C5E\u4E8E\u5F53\u524D\u8D26\u53F7\u7684\u79C1\u4EBA R2 \u6587\u4EF6\u3002", `${prefix}/settings/storage`]
  ] : [
    ["Appearance", "Available", "Choose light or dark mode and manage the site's overall display.", `${prefix}/settings/appearance`],
    ["Language", "Available", "Choose the site language; Chinese and English are currently supported.", `${prefix}/settings/language`],
    ["Account & Security", "Available", "Review the current device, signed-in devices, login history, and risk records.", `${prefix}/settings/security`],
    ["Notifications", "Planned", "Manage reminders, in-app messages, and other notification preferences.", `${prefix}/settings/notifications`],
    ["AI Settings", "Planned", "Manage AI providers, models, and personal AI preferences.", `${prefix}/settings/ai`],
    ["Integrations", "Planned", "Manage connected third-party services and account authorizations.", `${prefix}/settings/integrations`],
    ["Storage", "Connected", "Upload, download, and manage private R2 files belonging only to your account.", `${prefix}/settings/storage`]
  ];
  return `<section class="os-grid settings-grid">${items.map((item) => `<a class="os-card settings-card-link" href="${item[3]}"><small>${item[1]}</small><h2>${item[0]}</h2><p>${item[2]}</p><span class="settings-card-arrow" aria-hidden="true">\u203A</span></a>`).join("")}</section>`;
}
__name(settingsFallbackContent, "settingsFallbackContent");

// studio/ui-storage.js
function storageSettingsContent(zh) {
  const copy = zh ? {
    connected: "\u5DF2\u8FDE\u63A5",
    checking: "\u68C0\u67E5\u4E2D",
    files: "\u6587\u4EF6",
    used: "\u5DF2\u7528\u7A7A\u95F4",
    refreshed: "\u6700\u8FD1\u66F4\u65B0",
    select: "\u9009\u62E9\u6587\u4EF6",
    refresh: "\u5237\u65B0",
    search: "\u641C\u7D22\u6587\u4EF6\u540D",
    name: "\u6587\u4EF6\u540D",
    type: "\u7C7B\u578B",
    size: "\u5927\u5C0F",
    uploaded: "\u4E0A\u4F20\u65F6\u95F4",
    actions: "\u64CD\u4F5C",
    download: "\u4E0B\u8F7D",
    remove: "\u5220\u9664",
    loading: "\u6B63\u5728\u8BFB\u53D6\u4F60\u7684\u79C1\u4EBA\u6587\u4EF6\u2026",
    empty: "\u8FD8\u6CA1\u6709\u6587\u4EF6\u3002\u9009\u62E9\u6587\u4EF6\u540E\u5373\u53EF\u4E0A\u4F20\u5230\u4F60\u7684\u79C1\u4EBA\u5B58\u50A8\u7A7A\u95F4\u3002",
    partial: "\u6587\u4EF6\u6570\u91CF\u8F83\u591A\uFF0C\u5F53\u524D\u7EDF\u8BA1\u4EC5\u5305\u542B\u524D 10,000 \u4E2A\u5BF9\u8C61\u3002",
    uploadIdle: "\u6BCF\u4E2A\u6587\u4EF6\u6700\u5927 50 MB\uFF0C\u6587\u4EF6\u4F1A\u9010\u4E2A\u4E0A\u4F20\u3002",
    storage: "Cloudflare R2",
    unavailable: "\u5B58\u50A8\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528\u3002",
    notAuthorized: "\u5F53\u524D\u8D26\u53F7\u4E0D\u53EF\u4F7F\u7528\u79C1\u4EBA\u5B58\u50A8\u3002",
    signInAgain: "\u767B\u5F55\u72B6\u6001\u5DF2\u5931\u6548\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55\u3002",
    login: "\u524D\u5F80\u767B\u5F55",
    deleteConfirm: "\u786E\u5B9A\u8981\u5220\u9664\u201C{name}\u201D\u5417\uFF1F\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\u3002",
    uploadComplete: "\u5DF2\u4E0A\u4F20 {count} \u4E2A\u6587\u4EF6\u3002",
    uploadFailed: "\u4E0A\u4F20\u5931\u8D25\uFF1A{message}",
    uploading: "\u6B63\u5728\u4E0A\u4F20 {current}/{total} \xB7 {name}",
    deleting: "\u6B63\u5728\u5220\u9664 {name}\u2026",
    downloadFailed: "\u4E0B\u8F7D\u5931\u8D25\uFF1A{message}",
    deleteFailed: "\u5220\u9664\u5931\u8D25\uFF1A{message}",
    refreshedNow: "\u521A\u521A",
    tooLarge: "\u201C{name}\u201D\u8D85\u8FC7 50 MB\uFF0C\u672A\u4E0A\u4F20\u3002",
    connectionDescription: "\u6587\u4EF6\u4EC5\u5BF9\u5F53\u524D\u8D26\u53F7\u53EF\u89C1\uFF0C\u5E76\u901A\u8FC7\u5DF2\u767B\u5F55\u7684 Worker API \u5B89\u5168\u5B58\u53D6\uFF1B\u6D4F\u89C8\u5668\u4E0D\u4F1A\u76F4\u63A5\u8BBF\u95EE R2\u3002"
  } : {
    connected: "Connected",
    checking: "Checking",
    files: "Files",
    used: "Used",
    refreshed: "Updated",
    select: "Choose Files",
    refresh: "Refresh",
    search: "Search files",
    name: "File name",
    type: "Type",
    size: "Size",
    uploaded: "Uploaded",
    actions: "Actions",
    download: "Download",
    remove: "Delete",
    loading: "Loading your private files\u2026",
    empty: "No files yet. Choose files to upload them to your private storage.",
    partial: "There are many files; this statistic includes only the first 10,000 objects.",
    uploadIdle: "50 MB maximum per file. Files upload one at a time.",
    storage: "Cloudflare R2",
    unavailable: "Storage service is temporarily unavailable.",
    notAuthorized: "This account is not allowed to use private storage.",
    signInAgain: "Your session has expired. Please sign in again.",
    login: "Sign in",
    deleteConfirm: "Delete \u201C{name}\u201D? This cannot be undone.",
    uploadComplete: "Uploaded {count} files.",
    uploadFailed: "Upload failed: {message}",
    uploading: "Uploading {current}/{total} \xB7 {name}",
    deleting: "Deleting {name}\u2026",
    downloadFailed: "Download failed: {message}",
    deleteFailed: "Delete failed: {message}",
    refreshedNow: "Just now",
    tooLarge: "\u201C{name}\u201D exceeds 50 MB and was not uploaded.",
    connectionDescription: "Files are private to the current account and accessed securely through the signed-in Worker API; the browser never connects to R2 directly."
  };
  return `
    <section id="storage-manager" class="storage-manager">
      <section class="storage-overview-panel">
        <div class="storage-overview-copy">
          <div class="storage-service-line">
            <span class="storage-status-dot" aria-hidden="true"></span>
            <strong>${copy.storage}</strong>
            <span id="storage-connection" class="storage-connection-state">${copy.checking}</span>
          </div>
          <p>${copy.connectionDescription}</p>
        </div>
        <div class="storage-overview-stats">
          <div class="storage-stat">
            <span>${copy.files}</span>
            <strong id="storage-file-count">\u2014</strong>
          </div>
          <div class="storage-stat">
            <span>${copy.used}</span>
            <strong id="storage-used-bytes">\u2014</strong>
          </div>
          <div class="storage-refresh-group">
            <div>
              <span>${copy.refreshed}</span>
              <strong id="storage-refreshed-at">\u2014</strong>
            </div>
            <button id="storage-refresh-button" class="storage-refresh-button" type="button" aria-label="${copy.refresh}" title="${copy.refresh}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6v5h-5"/><path d="M19 11a7 7 0 1 0 1 4"/></svg>
            </button>
          </div>
        </div>
      </section>

      <section class="storage-toolbar">
        <button id="storage-upload-button" class="storage-upload-button" type="button">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
          <span>${copy.select}</span>
        </button>
        <input id="storage-file-input" type="file" multiple hidden>
        <label class="storage-search-shell">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg>
          <input id="storage-search" class="storage-search" type="search" placeholder="${copy.search}" aria-label="${copy.search}" autocomplete="off">
        </label>
      </section>

      <div class="storage-feedback">
        <p id="storage-upload-status" class="storage-upload-status">${copy.uploadIdle}</p>
        <p id="storage-api-status" class="storage-api-status" role="status"></p>
        <a id="storage-login-link" class="storage-login-link" href="#" hidden>${copy.login}</a>
      </div>

      <section class="storage-browser">
        <div class="storage-table" role="table" aria-label="${copy.files}">
          <div class="storage-file-row storage-file-head" role="row">
            <span role="columnheader">${copy.name}</span>
            <span role="columnheader">${copy.type}</span>
            <span role="columnheader">${copy.size}</span>
            <span role="columnheader">${copy.uploaded}</span>
            <span role="columnheader">${copy.actions}</span>
          </div>
          <div id="storage-file-list" class="storage-file-list" role="rowgroup"></div>
        </div>
        <p id="storage-partial-notice" class="storage-partial-notice" hidden>${copy.partial}</p>
      </section>
    </section>
  `;
}
__name(storageSettingsContent, "storageSettingsContent");
function storageClientScript(zh, loginUrl) {
  const copy = zh ? {
    connected: "\u5DF2\u8FDE\u63A5",
    checking: "\u68C0\u67E5\u4E2D",
    loading: "\u6B63\u5728\u8BFB\u53D6\u4F60\u7684\u79C1\u4EBA\u6587\u4EF6\u2026",
    emptyTitle: "\u8FD8\u6CA1\u6709\u6587\u4EF6",
    emptyHint: "\u9009\u62E9\u6587\u4EF6\u540E\u5373\u53EF\u4E0A\u4F20\u5230\u4F60\u7684\u79C1\u4EBA\u5B58\u50A8\u7A7A\u95F4\u3002",
    noMatches: "\u6CA1\u6709\u5339\u914D\u7684\u6587\u4EF6\u3002",
    unavailable: "\u5B58\u50A8\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528\u3002",
    notAuthorized: "\u5F53\u524D\u8D26\u53F7\u4E0D\u53EF\u4F7F\u7528\u79C1\u4EBA\u5B58\u50A8\u3002",
    signInAgain: "\u767B\u5F55\u72B6\u6001\u5DF2\u5931\u6548\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55\u3002",
    login: "\u524D\u5F80\u767B\u5F55",
    download: "\u4E0B\u8F7D",
    remove: "\u5220\u9664",
    select: "\u9009\u62E9\u6587\u4EF6",
    uploadIdle: "\u6BCF\u4E2A\u6587\u4EF6\u6700\u5927 50 MB\uFF0C\u6587\u4EF6\u4F1A\u9010\u4E2A\u4E0A\u4F20\u3002",
    partial: "\u6587\u4EF6\u6570\u91CF\u8F83\u591A\uFF0C\u5F53\u524D\u7EDF\u8BA1\u4EC5\u5305\u542B\u524D 10,000 \u4E2A\u5BF9\u8C61\u3002",
    uploadComplete: "\u5DF2\u4E0A\u4F20 {count} \u4E2A\u6587\u4EF6\u3002",
    uploadCompleteWithSkipped: "\u5DF2\u4E0A\u4F20 {count} \u4E2A\u6587\u4EF6\uFF0C\u8DF3\u8FC7 {skipped} \u4E2A\u8D85\u8FC7 50 MB \u7684\u6587\u4EF6\u3002",
    uploadFailed: "\u4E0A\u4F20\u5931\u8D25\uFF1A{message}",
    uploading: "\u6B63\u5728\u4E0A\u4F20 {current}/{total} \xB7 {name}",
    deleting: "\u6B63\u5728\u5220\u9664 {name}\u2026",
    downloadFailed: "\u4E0B\u8F7D\u5931\u8D25\uFF1A{message}",
    deleteFailed: "\u5220\u9664\u5931\u8D25\uFF1A{message}",
    deleteConfirm: "\u786E\u5B9A\u8981\u5220\u9664\u201C{name}\u201D\u5417\uFF1F\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\u3002",
    tooLarge: "\u201C{name}\u201D\u8D85\u8FC7 50 MB\uFF0C\u672A\u4E0A\u4F20\u3002",
    refreshedNow: "\u521A\u521A"
  } : {
    connected: "Connected",
    checking: "Checking",
    loading: "Loading your private files\u2026",
    emptyTitle: "No files yet",
    emptyHint: "Choose files to upload them to your private storage.",
    noMatches: "No matching files.",
    unavailable: "Storage service is temporarily unavailable.",
    notAuthorized: "This account is not allowed to use private storage.",
    signInAgain: "Your session has expired. Please sign in again.",
    login: "Sign in",
    download: "Download",
    remove: "Delete",
    select: "Choose Files",
    uploadIdle: "50 MB maximum per file. Files upload one at a time.",
    partial: "There are many files; this statistic includes only the first 10,000 objects.",
    uploadComplete: "Uploaded {count} files.",
    uploadCompleteWithSkipped: "Uploaded {count} files and skipped {skipped} files larger than 50 MB.",
    uploadFailed: "Upload failed: {message}",
    uploading: "Uploading {current}/{total} \xB7 {name}",
    deleting: "Deleting {name}\u2026",
    downloadFailed: "Download failed: {message}",
    deleteFailed: "Delete failed: {message}",
    deleteConfirm: "Delete \u201C{name}\u201D? This cannot be undone.",
    tooLarge: "\u201C{name}\u201D exceeds 50 MB and was not uploaded.",
    refreshedNow: "Just now"
  };
  return `
    <script>
      (() => {
        const copy = ${JSON.stringify(copy)};
        const loginUrl = ${JSON.stringify(loginUrl)};
        const maximumBytes = ${MAX_STORAGE_FILE_BYTES};
        const STORAGE_CACHE_PREFIX = "qssed-storage-v2:";
        const root = document.getElementById("storage-manager");
        if (!root) return;

        const fileInput = document.getElementById("storage-file-input");
        const uploadButton = document.getElementById("storage-upload-button");
        const refreshButton = document.getElementById("storage-refresh-button");
        const searchInput = document.getElementById("storage-search");
        const fileList = document.getElementById("storage-file-list");
        const apiStatus = document.getElementById("storage-api-status");
        const uploadStatus = document.getElementById("storage-upload-status");
        const loginLink = document.getElementById("storage-login-link");
        const partialNotice = document.getElementById("storage-partial-notice");
        const connection = document.getElementById("storage-connection");
        const fileCount = document.getElementById("storage-file-count");
        const usedBytes = document.getElementById("storage-used-bytes");
        const refreshedAt = document.getElementById("storage-refreshed-at");

        let files = [];
        let partial = false;
        let currentFilter = "";
        let isBusy = false;
        let currentUserId = "";
        let storageCacheFingerprint = "";
        let hasStorageSnapshot = false;
        let refreshSequence = 0;

        class SessionExpiredError extends Error {}
        class StorageForbiddenError extends Error {}

        function message(template, values) {
          return Object.entries(values || {}).reduce((text, entry) => text.replace("{" + entry[0] + "}", entry[1]), template);
        }

        function formatBytes(bytes) {
          const value = Number(bytes) || 0;
          if (value < 1024) return value + " B";
          const units = ["KB", "MB", "GB", "TB"];
          let size = value / 1024;
          let index = 0;
          while (size >= 1024 && index < units.length - 1) { size /= 1024; index += 1; }
          return size.toLocaleString(undefined, { maximumFractionDigits: size >= 100 ? 0 : 1 }) + " " + units[index];
        }

        function formatDate(value) {
          if (!value) return "\u2014";
          const date = new Date(value);
          return Number.isNaN(date.getTime()) ? "\u2014" : date.toLocaleString();
        }

        function formatRefreshTime(value) {
          const timestamp = Number(value) || Date.now();
          const date = new Date(timestamp);
          if (Number.isNaN(date.getTime())) return copy.refreshedNow;
          const age = Date.now() - timestamp;
          if (age < 60000) return copy.refreshedNow;
          const now = new Date();
          if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
          }
          return date.toLocaleDateString();
        }

        function setApiStatus(text, kind) {
          apiStatus.textContent = text || "";
          apiStatus.className = "storage-api-status" + (kind ? " is-" + kind : "");
        }

        function setUploadStatus(text, kind) {
          uploadStatus.textContent = text || "";
          uploadStatus.className = "storage-upload-status" + (kind ? " is-" + kind : "");
        }

        function storageCacheKey(userId) {
          return STORAGE_CACHE_PREFIX + String(userId || "");
        }

        function readStorageCache(userId) {
          if (!userId) return null;
          try {
            const parsed = JSON.parse(sessionStorage.getItem(storageCacheKey(userId)) || "null");
            return parsed && parsed.data && Array.isArray(parsed.data.files) ? parsed : null;
          } catch {
            return null;
          }
        }

        function writeStorageCache(data, fingerprint, refreshedAtValue) {
          if (!currentUserId) return;
          try {
            sessionStorage.setItem(storageCacheKey(currentUserId), JSON.stringify({
              fingerprint,
              refreshedAt: refreshedAtValue,
              data
            }));
          } catch {}
        }

        function clearStorageCache() {
          if (!currentUserId) return;
          try { sessionStorage.removeItem(storageCacheKey(currentUserId)); } catch {}
        }

        function storageFingerprint(data) {
          const normalizedFiles = (Array.isArray(data?.files) ? data.files : []).map(file => [
            file?.id || "",
            file?.name || "",
            Number(file?.size) || 0,
            file?.uploadedAt || "",
            file?.contentType || ""
          ]);
          return JSON.stringify([
            Number(data?.file_count) || 0,
            Number(data?.used_bytes) || 0,
            Boolean(data?.partial),
            normalizedFiles
          ]);
        }

        function resetMetrics() {
          fileCount.textContent = "\u2014";
          usedBytes.textContent = "\u2014";
          refreshedAt.textContent = "\u2014";
          partial = false;
          partialNotice.hidden = true;
        }

        function setBusy(busy) {
          isBusy = busy;
          const unavailable = root.classList.contains("is-unavailable");
          uploadButton.disabled = busy || unavailable;
          refreshButton.disabled = busy;
          fileInput.disabled = busy || unavailable;
          root.querySelectorAll(".storage-action-button,.storage-empty-upload").forEach(button => {
            button.disabled = busy || unavailable;
          });
        }

        function clearStorageView() {
          resetMetrics();
          files = [];
          hasStorageSnapshot = false;
          renderFiles();
        }

        function showSessionExpired() {
          clearStorageCache();
          clearStorageView();
          root.classList.remove("is-checking", "is-stale");
          root.classList.add("is-unavailable");
          setApiStatus(copy.signInAgain, "error");
          loginLink.hidden = false;
          loginLink.href = loginUrl;
          connection.textContent = copy.signInAgain;
        }

        function showStorageForbidden() {
          clearStorageCache();
          clearStorageView();
          root.classList.remove("is-checking", "is-stale");
          root.classList.add("is-unavailable");
          loginLink.hidden = true;
          connection.textContent = copy.notAuthorized;
          setApiStatus(copy.notAuthorized, "error");
        }

        async function accessToken() {
          const result = await supabaseClient.auth.getSession();
          const token = result?.data?.session?.access_token;
          if (!token) throw new SessionExpiredError();
          return token;
        }

        async function storageRequest(path, options) {
          const token = await accessToken();
          const headers = new Headers(options?.headers || {});
          headers.set("Authorization", "Bearer " + token);
          let response;
          try {
            response = await fetch(path, { ...options, headers, cache: "no-store" });
          } catch {
            throw new Error(copy.unavailable);
          }
          if (response.status === 401) throw new SessionExpiredError();
          if (response.status === 403) throw new StorageForbiddenError();
          if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            const error = new Error(payload?.error || copy.unavailable);
            error.status = response.status;
            throw error;
          }
          return response;
        }

        function visibleFiles() {
          const query = currentFilter.trim().toLocaleLowerCase();
          return query ? files.filter(file => String(file.name || "").toLocaleLowerCase().includes(query)) : files;
        }

        function renderFiles() {
          const visible = visibleFiles();
          fileList.replaceChildren();

          if (!visible.length) {
            if (files.length) {
              const noMatches = document.createElement("div");
              noMatches.className = "storage-empty storage-empty-compact";
              noMatches.textContent = copy.noMatches;
              fileList.append(noMatches);
              return;
            }

            const empty = document.createElement("div");
            empty.className = "storage-empty";

            const icon = document.createElement("div");
            icon.className = "storage-empty-icon";
            icon.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5h5l1.5 2H20v8.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7.5Z"/><path d="M4 7.5V6a2 2 0 0 1 2-2h3l1.5 2H18a2 2 0 0 1 2 2v1.5"/></svg>';

            const title = document.createElement("strong");
            title.textContent = copy.emptyTitle;

            const hint = document.createElement("span");
            hint.textContent = copy.emptyHint;

            const choose = document.createElement("button");
            choose.type = "button";
            choose.className = "storage-empty-upload";
            choose.textContent = copy.select;
            choose.addEventListener("click", () => fileInput.click());

            empty.append(icon, title, hint, choose);
            fileList.append(empty);
            return;
          }

          visible.forEach(file => {
            const row = document.createElement("div");
            row.className = "storage-file-row";
            row.setAttribute("role", "row");

            const name = document.createElement("strong");
            name.className = "storage-file-name";
            name.textContent = file.name;
            name.title = file.name;

            const type = document.createElement("span");
            type.textContent = file.contentType || "application/octet-stream";

            const size = document.createElement("span");
            size.textContent = formatBytes(file.size);

            const uploaded = document.createElement("time");
            uploaded.dateTime = file.uploadedAt || "";
            uploaded.textContent = formatDate(file.uploadedAt);

            const actions = document.createElement("div");
            actions.className = "storage-actions";

            const download = document.createElement("button");
            download.type = "button";
            download.className = "storage-action-button";
            download.textContent = copy.download;
            download.addEventListener("click", () => void downloadFile(file, download));

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "storage-action-button is-danger";
            remove.textContent = copy.remove;
            remove.addEventListener("click", () => void deleteFile(file, remove));

            actions.append(download, remove);
            row.append(name, type, size, uploaded, actions);
            fileList.append(row);
          });
        }

        function renderMetrics(data, refreshedAtValue) {
          fileCount.textContent = String(Number(data.file_count) || 0) + (data.partial ? "+" : "");
          usedBytes.textContent = formatBytes(data.used_bytes);
          refreshedAt.textContent = formatRefreshTime(refreshedAtValue);
          partial = Boolean(data.partial);
          partialNotice.hidden = !partial;
          if (partial) partialNotice.textContent = copy.partial;
        }

        function applyStorageData(data, refreshedAtValue) {
          files = Array.isArray(data?.files) ? data.files : [];
          renderMetrics(data || {}, refreshedAtValue);
          renderFiles();
          hasStorageSnapshot = true;
        }

        async function refreshFiles(options) {
          const config = options || {};
          const force = Boolean(config.force);
          const silent = Boolean(config.silent);
          if (isBusy && !force) return;

          const sequence = ++refreshSequence;
          root.classList.remove("is-unavailable", "is-stale");
          loginLink.hidden = true;

          if (!silent) {
            root.classList.add("is-checking");
            refreshButton.classList.add("is-refreshing");
            refreshButton.setAttribute("aria-busy", "true");
            setBusy(true);
            setApiStatus(copy.loading, "loading");
          }

          try {
            const response = await storageRequest("/api/storage/files", { method: "GET" });
            const data = await response.json();
            if (sequence !== refreshSequence) return;

            const fingerprint = storageFingerprint(data);
            const changed = fingerprint !== storageCacheFingerprint;
            const refreshedAtValue = Date.now();

            storageCacheFingerprint = fingerprint;
            writeStorageCache(data, fingerprint, refreshedAtValue);

            if (changed || !hasStorageSnapshot || !config.preservePaint) {
              applyStorageData(data, refreshedAtValue);
            } else {
              refreshedAt.textContent = formatRefreshTime(refreshedAtValue);
            }

            root.classList.remove("is-checking", "is-unavailable", "is-stale");
            connection.textContent = copy.connected;
            setApiStatus("", "");
          } catch (error) {
            if (sequence !== refreshSequence) return;
            root.classList.remove("is-checking");

            if (error instanceof SessionExpiredError) {
              showSessionExpired();
            } else if (error instanceof StorageForbiddenError) {
              showStorageForbidden();
            } else if (silent && hasStorageSnapshot) {
              root.classList.add("is-stale");
              setApiStatus(error.message || copy.unavailable, "error");
            } else {
              clearStorageView();
              root.classList.add("is-unavailable");
              connection.textContent = copy.unavailable;
              setApiStatus(error.message || copy.unavailable, "error");
            }
          } finally {
            if (!silent) {
              refreshButton.classList.remove("is-refreshing");
              refreshButton.removeAttribute("aria-busy");
              setBusy(false);
            }
          }
        }

        async function initializeStorage() {
          try {
            const result = await supabaseClient.auth.getSession();
            const session = result?.data?.session;

            if (!session?.access_token || !session?.user?.id) {
              showSessionExpired();
              return;
            }

            currentUserId = String(session.user.id);
            const cached = readStorageCache(currentUserId);

            if (cached?.data) {
              storageCacheFingerprint = cached.fingerprint || storageFingerprint(cached.data);
              applyStorageData(cached.data, cached.refreshedAt);
              root.classList.remove("is-checking", "is-unavailable", "is-stale");
              connection.textContent = copy.connected;
              setApiStatus("", "");
              void refreshFiles({ silent: true, preservePaint: true });
              return;
            }

            root.classList.add("is-checking");
            setApiStatus(copy.loading, "loading");
            await refreshFiles({ force: true });
          } catch {
            showSessionExpired();
          }
        }

        async function uploadFiles(selected) {
          const queue = Array.from(selected || []);
          if (!queue.length || isBusy) return;

          refreshSequence += 1;
          const oversized = queue.filter(file => file.size > maximumBytes);
          const uploadQueue = queue.filter(file => file.size <= maximumBytes);

          if (!uploadQueue.length) {
            setUploadStatus(message(copy.tooLarge, { name: oversized[0]?.name || "file" }), "error");
            fileInput.value = "";
            return;
          }

          setBusy(true);
          let completed = 0;

          try {
            for (let index = 0; index < uploadQueue.length; index += 1) {
              const file = uploadQueue[index];
              setUploadStatus(message(copy.uploading, { current: index + 1, total: uploadQueue.length, name: file.name }), "loading");
              const response = await storageRequest("/api/storage/upload?name=" + encodeURIComponent(file.name), {
                method: "POST",
                headers: {
                  "Content-Type": file.type || "application/octet-stream",
                  "X-File-Size": String(file.size)
                },
                body: file
              });
              if (response.status === 201) completed += 1;
            }

            setUploadStatus(
              oversized.length
                ? message(copy.uploadCompleteWithSkipped, { count: completed, skipped: oversized.length })
                : message(copy.uploadComplete, { count: completed }),
              "success"
            );
            await refreshFiles({ force: true });
          } catch (error) {
            if (error instanceof SessionExpiredError) {
              showSessionExpired();
            } else if (error instanceof StorageForbiddenError) {
              showStorageForbidden();
            } else {
              setUploadStatus(message(copy.uploadFailed, { message: error.message || copy.unavailable }), "error");
              if (completed) await refreshFiles({ force: true });
            }
          } finally {
            fileInput.value = "";
            if (isBusy) setBusy(false);
          }
        }

        async function downloadFile(file, button) {
          button.disabled = true;
          try {
            const response = await storageRequest("/api/storage/object?id=" + encodeURIComponent(file.id), { method: "GET" });
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = objectUrl;
            anchor.download = file.name || "file";
            anchor.style.display = "none";
            document.body.append(anchor);
            anchor.click();
            anchor.remove();
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
          } catch (error) {
            if (error instanceof SessionExpiredError) showSessionExpired();
            else if (error instanceof StorageForbiddenError) showStorageForbidden();
            else setApiStatus(message(copy.downloadFailed, { message: error.message || copy.unavailable }), "error");
          } finally {
            button.disabled = false;
          }
        }

        async function deleteFile(file, button) {
          if (isBusy || !window.confirm(message(copy.deleteConfirm, { name: file.name }))) return;

          refreshSequence += 1;
          setBusy(true);
          button.disabled = true;
          setUploadStatus(message(copy.deleting, { name: file.name }), "loading");

          try {
            await storageRequest("/api/storage/object?id=" + encodeURIComponent(file.id), { method: "DELETE" });
            setUploadStatus(copy.uploadIdle, "");
            await refreshFiles({ force: true });
          } catch (error) {
            if (error instanceof SessionExpiredError) showSessionExpired();
            else if (error instanceof StorageForbiddenError) showStorageForbidden();
            else setApiStatus(message(copy.deleteFailed, { message: error.message || copy.unavailable }), "error");
          } finally {
            button.disabled = false;
            if (isBusy) setBusy(false);
          }
        }

        searchInput.addEventListener("input", () => {
          currentFilter = searchInput.value || "";
          renderFiles();
        });

        uploadButton.addEventListener("click", () => fileInput.click());
        refreshButton.addEventListener("click", () => void refreshFiles({ force: true }));
        fileInput.addEventListener("change", event => void uploadFiles(event.target.files));
        void initializeStorage();
      })();
    <\/script>
  `;
}
__name(storageClientScript, "storageClientScript");

// studio/ui-audit.js
function auditClientScript(ipInfo) {
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
        set("audit-login-count", eventsError ? "\u2014" : String(events.length));
        set("audit-device-count", devicesError ? "\u2014" : String(devices.length));
        set("audit-risk-count", eventsError ? "\u2014" : String(events.filter(event => event.risk_level && event.risk_level !== "\u6B63\u5E38").length));

        const table = document.getElementById("audit-login-table");
        if (table) {
          table.innerHTML = eventsError
            ? '<div class="audit-row"><span>\u65E0\u6CD5\u8BFB\u53D6\u767B\u5F55\u8BB0\u5F55 / Unable to load login records</span></div>'
            : renderAuditRows(events);
        }
      }

      function renderAuditRows(events) {
        const head = ["\u767B\u5F55\u65F6\u95F4", "IP \u5730\u5740", "\u5730\u533A", "\u6D4F\u89C8\u5668", "\u64CD\u4F5C\u7CFB\u7EDF", "\u8BBE\u5907\u7C7B\u578B", "\u767B\u5F55\u65B9\u5F0F", "\u767B\u5F55\u7ED3\u679C", "\u98CE\u9669\u63D0\u793A"];
        const header = '<div class="audit-row audit-head">' + head.map(item => '<strong>' + item + '</strong>').join("") + '</div>';
        if (!events.length) return header + '<div class="audit-row"><span>\u6682\u65E0\u767B\u5F55\u8BB0\u5F55</span></div>';
        return header + events.map(event => '<div class="audit-row">' + [
          formatAuditDate(event.created_at),
          event.ip_address || "-",
          [event.country, event.region, event.city].filter(Boolean).join(" / ") || "-",
          event.browser || "-",
          event.os || "-",
          event.device_type || "-",
          event.provider || "password",
          event.success ? "\u6210\u529F" : "\u5931\u8D25",
          event.risk_level || "\u6B63\u5E38"
        ].map(item => '<span>' + auditEscape(item) + '</span>').join("") + '</div>').join("");
      }

      function renderSecurityAudit(events, devices, eventsError, devicesError) {
        const currentId = getAuditDeviceId();
        const current = devices.find(device => device.device_id === currentId) || null;
        const currentBox = document.getElementById("audit-current-device");
        if (currentBox) currentBox.innerHTML = devicesError
          ? "\u65E0\u6CD5\u8BFB\u53D6\u8BBE\u5907\u6570\u636E / Unable to load device data"
          : current ? renderDeviceCard(current, true) : "\u6682\u65E0\u5F53\u524D\u8BBE\u5907\u6570\u636E";

        const list = document.getElementById("audit-device-list");
        if (list) list.innerHTML = devicesError
          ? "\u65E0\u6CD5\u8BFB\u53D6\u8BBE\u5907\u6570\u636E / Unable to load device data"
          : devices.length ? devices.map(device => renderDeviceCard(device, device.device_id === currentId)).join("") : "\u6682\u65E0\u767B\u5F55\u8BBE\u5907";

        const timeline = document.getElementById("audit-login-timeline");
        if (timeline) timeline.innerHTML = eventsError
          ? "\u65E0\u6CD5\u8BFB\u53D6\u767B\u5F55\u5386\u53F2 / Unable to load login history"
          : renderTimeline(events);

        const alerts = document.getElementById("audit-risk-alerts");
        if (alerts) {
          if (eventsError) {
            alerts.innerHTML = "<p>\u65E0\u6CD5\u8BFB\u53D6\u98CE\u9669\u6570\u636E / Unable to load risk data</p>";
          } else {
            const risks = events.filter(event => event.risk_level && event.risk_level !== "\u6B63\u5E38");
            alerts.innerHTML = risks.length ? risks.map(event => '<p>' + auditEscape(formatAuditDate(event.created_at)) + " \xB7 " + auditEscape(event.risk_level) + " \xB7 " + auditEscape(event.ip_address || "-") + '</p>').join("") : "<p>\u6682\u65E0\u5F02\u5E38\u767B\u5F55\u63D0\u793A</p>";
          }
        }
      }

      function renderDeviceCard(device, current) {
        const status = device.revoked_at ? "\u5DF2\u9000\u51FA" : "\u6D3B\u8DC3";
        const name = device.device_name || ((device.browser || "Browser") + " on " + (device.os || "OS"));
        return '<article class="audit-device-card">' +
          '<strong>' + auditEscape(name + (current ? " \xB7 \u5F53\u524D\u8BBE\u5907" : "")) + '</strong>' +
          '<span>' + auditEscape([device.browser, device.os, device.device_type].filter(Boolean).join(" / ")) + '</span>' +
          '<span>' + auditEscape([device.last_ip, device.country, device.region, device.city].filter(Boolean).join(" \xB7 ")) + '</span>' +
          '<span>\u9996\u6B21\u767B\u5F55 ' + auditEscape(formatAuditDate(device.first_seen_at)) + ' \xB7 \u6700\u8FD1\u6D3B\u8DC3 ' + auditEscape(formatAuditDate(device.last_seen_at)) + '</span>' +
          '<em>' + auditEscape(status) + '</em>' +
        '</article>';
      }

      function renderTimeline(events) {
        const groups = { "\u4ECA\u5929": [], "\u6628\u5929": [], "\u672C\u5468": [], "\u66F4\u65E9": [] };
        const now = new Date();
        events.forEach(event => {
          const date = new Date(event.created_at);
          const diffDays = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(date.getFullYear(), date.getMonth(), date.getDate())) / 86400000);
          const key = diffDays === 0 ? "\u4ECA\u5929" : diffDays === 1 ? "\u6628\u5929" : diffDays < 7 ? "\u672C\u5468" : "\u66F4\u65E9";
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
              event.success ? "\u6210\u529F" : "\u5931\u8D25",
              event.risk_level || "\u6B63\u5E38"
            ].map(auditEscape).join(" \xB7 ") + '</p>'
          ).join("") + '</section>'
        ).join("") || "<p>\u6682\u65E0\u767B\u5F55\u5386\u53F2</p>";
      }
    <\/script>
  `;
}
__name(auditClientScript, "auditClientScript");

// studio/ui-styles.js
function osStyles() {
  return `
  <style>
    body.os-shell{
      display:block;
      padding:24px;
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--surface-soft) 36%, transparent) 0%, transparent 44%),
        linear-gradient(135deg, var(--bg) 0%, var(--bg-soft) 100%) !important;
      background-size:100% 100%, 180% 180%;
      animation:ambient-pan 18s ease-in-out infinite alternate;
    }
    .os-layout{min-height:calc(100vh - 48px);display:grid;grid-template-columns:286px minmax(0,1fr);gap:18px;}
    .os-sidebar,.os-main,.os-card,.os-profile-card,.os-lock{
      border:1px solid var(--border);background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow-soft);
    }
    .os-sidebar{padding:18px;animation:panel-enter .55s cubic-bezier(.2,.8,.2,1) both;}
    .os-main{padding:30px;animation:panel-enter .62s cubic-bezier(.2,.8,.2,1) .08s both;}
    .compact-back-zone{display:none;}
    @media (min-width:901px){
      body.os-shell{height:100vh;overflow:hidden;box-sizing:border-box;}
      .os-layout{height:calc(100vh - 48px);min-height:0;}
      .os-sidebar,.os-main{min-height:0;overflow-y:auto;overscroll-behavior:contain;}
      .os-main{min-width:0;scrollbar-gutter:stable;}
      .os-sidebar{scrollbar-width:thin;scrollbar-color:transparent transparent;}
      .os-sidebar:hover{scrollbar-color:var(--border-strong) transparent;}
      .os-sidebar::-webkit-scrollbar{width:8px;}
      .os-sidebar::-webkit-scrollbar-track{background:transparent;}
      .os-sidebar::-webkit-scrollbar-thumb{background:transparent;border-radius:999px;}
      .os-sidebar:hover::-webkit-scrollbar-thumb{background:var(--border-strong);}
    }
    .os-brand{display:flex;align-items:center;gap:12px;color:var(--text);text-decoration:none;margin-bottom:16px;}
    .os-brand-mark,.os-avatar{display:grid;place-items:center;width:42px;height:42px;border-radius:var(--radius);background:var(--primary);color:var(--primary-ink);font-weight:900;}
    .os-brand strong,.os-brand small{display:block}.os-brand small{color:var(--muted);font-size:12px;margin-top:2px;}
    .os-user{padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft);margin-bottom:16px;}
    .os-user strong,.os-user>span{display:block}.os-user strong{color:var(--quiet);font-size:12px;text-transform:uppercase}.os-user>span{margin-top:5px;color:var(--text);overflow-wrap:anywhere;}
    .os-signout-button{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:40px;margin:12px 0 0;padding:0 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--card);color:var(--muted);box-shadow:none;font-size:13px;font-weight:750;}
    .os-signout-button svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;flex:0 0 auto;}
    .os-signout-button span{display:inline;margin:0;color:inherit;overflow:visible;}
    .os-signout-button:hover{background:color-mix(in srgb,var(--danger) 8%,var(--card));border-color:color-mix(in srgb,var(--danger) 38%,var(--border));color:var(--danger);box-shadow:none;transform:none;}
    .os-signout-button:active{transform:scale(.985);}
    .os-signout-button:disabled{cursor:wait;opacity:.62;}
    .os-nav{display:grid;gap:10px}.os-nav-group{border:1px solid var(--border);border-radius:var(--radius);padding:8px;background:color-mix(in srgb,var(--surface-soft) 42%,transparent);}
    .os-nav-group.is-active{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 12%,transparent);}
    .os-nav-title{display:block;color:var(--text);text-decoration:none;font-weight:800;padding:8px;}
    .os-nav-items{display:grid;gap:3px}.os-nav-items a{color:var(--muted);text-decoration:none;padding:7px 8px;border-radius:var(--radius);font-size:14px}.os-nav-items a:hover{background:var(--surface-soft);color:var(--text);}
    .os-hero{display:flex;justify-content:space-between;gap:18px;align-items:stretch;margin-bottom:24px;}
    .os-kicker{margin:0 0 8px;color:var(--primary);font-weight:800}.os-hero h1{margin:0 0 10px;font-size:clamp(34px,5vw,64px);letter-spacing:0;line-height:1.02}.os-hero p{max-width:780px;margin:0;color:var(--muted);}
    .os-ai{min-width:230px;display:flex;flex-direction:column;justify-content:center;gap:6px;padding:18px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft);color:var(--text);text-decoration:none}.os-ai span{color:var(--muted);font-size:13px}.os-ai strong{font-size:18px;}
    .os-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.os-card{padding:20px;animation:item-rise .48s cubic-bezier(.2,.8,.2,1) both}.os-card h2{margin:8px 0 8px;font-size:20px}.os-card small{color:var(--primary);font-weight:800}.os-card p{color:var(--muted);margin:0}.os-card.is-large{min-height:220px;}.settings-card-link{display:block;position:relative;color:inherit;text-decoration:none;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.settings-card-link:hover{transform:translateY(-3px);border-color:var(--border-strong);box-shadow:var(--shadow)}.settings-card-arrow{position:absolute;right:18px;bottom:16px;color:var(--muted);font-size:24px;line-height:1}.settings-detail-card p{max-width:760px}.settings-choice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:22px}.settings-choice{display:grid;gap:5px;padding:16px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft);color:var(--text);text-align:left;text-decoration:none;font:inherit;cursor:pointer;box-shadow:none}.settings-choice strong{font-size:17px}.settings-choice span{color:var(--muted);font-size:13px}.settings-choice:hover{border-color:var(--border-strong);background:color-mix(in srgb,var(--surface-soft) 82%,var(--primary) 4%);box-shadow:none;transform:none}.settings-choice.is-selected{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 12%,transparent)}
    .os-main:has(#storage-manager) .os-hero{margin-bottom:20px}.os-main:has(#storage-manager) .os-hero h1{font-size:clamp(38px,4.3vw,56px);letter-spacing:-.035em}.storage-manager{display:grid;gap:16px}.storage-overview-panel{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(420px,.75fr);gap:28px;align-items:center;padding:22px 24px;border:1px solid color-mix(in srgb,var(--border) 82%,transparent);border-radius:24px;background:color-mix(in srgb,var(--card) 84%,transparent);-webkit-backdrop-filter:blur(22px) saturate(160%);backdrop-filter:blur(22px) saturate(160%);box-shadow:0 16px 44px rgba(15,23,42,.08),inset 0 1px 0 color-mix(in srgb,#fff 62%,transparent)}.storage-overview-copy{min-width:0}.storage-service-line{display:flex;align-items:center;gap:9px;min-width:0}.storage-service-line>strong{font-size:17px;color:var(--text);letter-spacing:-.01em}.storage-connection-state{display:inline-flex;align-items:center;min-height:26px;padding:0 9px;border-radius:999px;background:color-mix(in srgb,var(--success) 10%,transparent);color:var(--success);font-size:12px;font-weight:800}.storage-overview-copy p{max-width:680px;margin:8px 0 0;color:var(--muted);font-size:14px;line-height:1.55}.storage-status-dot{flex:0 0 auto;width:9px;height:9px;border-radius:50%;background:var(--success);box-shadow:0 0 0 4px color-mix(in srgb,var(--success) 13%,transparent)}.storage-overview-stats{display:grid;grid-template-columns:minmax(80px,.7fr) minmax(100px,.8fr) minmax(150px,1.25fr);align-items:stretch}.storage-stat,.storage-refresh-group{min-width:0;padding:2px 16px;border-left:1px solid color-mix(in srgb,var(--border) 78%,transparent)}.storage-stat span,.storage-refresh-group span{display:block;color:var(--muted);font-size:12px;font-weight:700}.storage-stat strong,.storage-refresh-group strong{display:block;margin-top:5px;color:var(--text);font-size:24px;line-height:1.05;letter-spacing:-.035em;white-space:nowrap}.storage-refresh-group{display:flex;align-items:center;justify-content:space-between;gap:10px}.storage-refresh-group strong{font-size:14px;letter-spacing:0}.storage-refresh-button{display:grid;place-items:center;flex:0 0 auto;width:38px;height:38px;min-width:38px;min-height:38px;margin:0;padding:0;border:1px solid color-mix(in srgb,var(--border) 82%,transparent);border-radius:50%;background:var(--surface-soft);color:var(--text);box-shadow:none;cursor:pointer;transition:transform .12s ease,background .15s ease,border-color .15s ease}.storage-refresh-button:hover{background:var(--surface-strong);border-color:var(--border-strong)}.storage-refresh-button:active{transform:scale(.94)}.storage-refresh-button svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.storage-refresh-button.is-refreshing svg{animation:storage-spin .8s linear infinite}.storage-toolbar{display:grid;grid-template-columns:auto minmax(220px,1fr);gap:10px;align-items:center;padding:10px;border:1px solid color-mix(in srgb,var(--border) 78%,transparent);border-radius:18px;background:color-mix(in srgb,var(--surface-soft) 68%,transparent);-webkit-backdrop-filter:blur(18px) saturate(150%);backdrop-filter:blur(18px) saturate(150%)}.storage-upload-button,.storage-empty-upload,.storage-action-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:42px;min-height:42px;margin:0;box-sizing:border-box;padding:0 15px;border:1px solid transparent;border-radius:12px;background:var(--primary);color:var(--primary-ink);font:inherit;font-size:14px;font-weight:800;cursor:pointer;text-decoration:none;white-space:nowrap;box-shadow:none;transition:transform .1s ease,filter .15s ease,background .15s ease,border-color .15s ease}.storage-upload-button:hover,.storage-empty-upload:hover{filter:brightness(1.03)}.storage-upload-button:active,.storage-empty-upload:active,.storage-action-button:active{transform:scale(.97)}.storage-upload-button svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}.storage-search-shell{display:flex;align-items:center;gap:8px;height:42px;min-height:42px;box-sizing:border-box;padding:0 12px;border:1px solid transparent;border-radius:12px;background:var(--card);color:var(--muted);transition:border-color .15s ease,box-shadow .15s ease,background .15s ease}.storage-search-shell:focus-within{border-color:color-mix(in srgb,var(--primary) 55%,var(--border));box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 10%,transparent);background:var(--card)}.storage-search-shell svg{flex:0 0 auto;width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round}.storage-search{width:100%;height:40px;min-height:0;margin:0;padding:0;border:0!important;outline:0!important;background:transparent!important;color:var(--text);font:inherit;font-size:14px;box-shadow:none!important}.storage-feedback{display:flex;align-items:center;gap:12px;min-height:20px;padding:0 3px}.storage-upload-status,.storage-api-status{margin:0;color:var(--muted);font-size:13px}.storage-api-status:empty{display:none}.storage-upload-status.is-error,.storage-api-status.is-error{color:var(--danger)}.storage-upload-status.is-success{color:var(--success)}.storage-upload-status.is-loading,.storage-api-status.is-loading{color:var(--primary)}.storage-login-link{color:var(--primary);font-size:13px;font-weight:800}.storage-browser{overflow:hidden;border:1px solid color-mix(in srgb,var(--border) 84%,transparent);border-radius:20px;background:var(--card);box-shadow:0 12px 34px rgba(15,23,42,.055)}.storage-table{overflow:auto}.storage-file-row{display:grid;grid-template-columns:minmax(180px,1.8fr) minmax(120px,1fr) minmax(78px,.55fr) minmax(130px,.9fr) minmax(150px,.85fr);gap:12px;align-items:center;min-width:760px;padding:13px 18px;border-top:1px solid color-mix(in srgb,var(--border) 72%,transparent)}.storage-file-head{position:sticky;top:0;z-index:1;border-top:0;background:color-mix(in srgb,var(--surface-soft) 88%,var(--card));color:var(--muted);font-size:12px;font-weight:750}.storage-file-row>span,.storage-file-row time{min-width:0;color:var(--muted);font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.storage-file-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text);font-size:14px}.storage-actions{display:flex;gap:7px;justify-content:flex-end}.storage-action-button{min-height:34px;padding:0 10px;border-color:var(--border);border-radius:10px;background:var(--surface-soft);color:var(--text);font-size:13px;font-weight:700}.storage-action-button:hover{border-color:var(--border-strong);background:var(--surface-strong)}.storage-action-button.is-danger{color:var(--danger)}.storage-upload-button:disabled,.storage-refresh-button:disabled,.storage-action-button:disabled,.storage-empty-upload:disabled{opacity:.5;cursor:not-allowed;transform:none;filter:none}.storage-empty{display:grid;place-items:center;gap:7px;min-height:260px;padding:38px 20px;color:var(--muted);text-align:center}.storage-empty strong{color:var(--text);font-size:17px;letter-spacing:-.01em}.storage-empty>span{max-width:360px;font-size:13px;line-height:1.55}.storage-empty-icon{display:grid;place-items:center;width:52px;height:52px;margin-bottom:4px;border-radius:16px;background:var(--surface-soft);color:var(--muted)}.storage-empty-icon svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.55;stroke-linecap:round;stroke-linejoin:round}.storage-empty-upload{min-height:38px;margin-top:7px;padding:0 14px}.storage-empty-compact{min-height:150px}.storage-partial-notice{margin:0;padding:11px 18px;border-top:1px solid var(--border);color:var(--muted);font-size:13px}.storage-manager.is-checking .storage-status-dot{background:var(--muted);box-shadow:0 0 0 4px color-mix(in srgb,var(--muted) 13%,transparent)}.storage-manager.is-checking .storage-connection-state{background:var(--surface-soft);color:var(--muted)}.storage-manager.is-unavailable .storage-status-dot{background:var(--danger);box-shadow:0 0 0 4px color-mix(in srgb,var(--danger) 13%,transparent)}.storage-manager.is-unavailable .storage-connection-state{background:color-mix(in srgb,var(--danger) 9%,transparent);color:var(--danger)}.storage-manager.is-stale .storage-status-dot{background:#d99a2b;box-shadow:0 0 0 4px color-mix(in srgb,#d99a2b 13%,transparent)}@keyframes storage-spin{to{transform:rotate(360deg)}}@media (max-width:980px){.storage-overview-panel{grid-template-columns:1fr;gap:18px}.storage-overview-stats{border-top:1px solid var(--border);padding-top:16px}.storage-stat:first-child{border-left:0;padding-left:0}}@media (max-width:620px){.os-main:has(#storage-manager) .os-hero h1{font-size:38px}.storage-overview-panel{padding:18px;border-radius:20px}.storage-overview-stats{grid-template-columns:1fr 1fr}.storage-refresh-group{grid-column:1/-1;margin-top:14px;padding:14px 0 0;border-left:0;border-top:1px solid var(--border)}.storage-stat:nth-child(1){border-left:0;padding-left:0}.storage-toolbar{grid-template-columns:1fr}.storage-upload-button{width:100%}.storage-browser{border-radius:16px}}@media (prefers-reduced-transparency:reduce){.storage-overview-panel,.storage-toolbar{background:var(--card);-webkit-backdrop-filter:none;backdrop-filter:none}}@media (prefers-contrast:more){.storage-overview-panel,.storage-toolbar,.storage-browser{border-color:var(--border-strong)}}
    .os-chip-row{display:flex;flex-wrap:wrap;gap:8px;align-content:flex-start}.os-chip-row span{border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft);color:var(--text);padding:8px 10px;font-weight:700;}
    .os-search{font-size:18px;margin:0 0 18px}.os-profile-card{display:flex;gap:18px;align-items:center;padding:24px}.os-profile-card .os-avatar{width:84px;height:84px;font-size:36px}
    .os-lock{padding:18px;margin-bottom:18px;border-color:var(--danger, #ff9a9a)}
    .audit-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(280px,.8fr);gap:14px;margin-bottom:14px}
    .audit-facts{display:grid;gap:12px;margin:0}.audit-facts div{padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft)}.audit-facts dt{color:var(--muted);font-size:13px}.audit-facts dd{margin:6px 0 0;color:var(--text);overflow-wrap:anywhere;font-weight:750}
    .audit-stats{display:grid;gap:10px}.audit-stats span{display:flex;align-items:center;justify-content:space-between;padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft);color:var(--muted)}.audit-stats strong{color:var(--text);font-size:26px}
    .audit-section{margin-top:14px}.audit-table{overflow:auto}.audit-row{display:grid;grid-template-columns:1.1fr .8fr 1fr .8fr .8fr .8fr .8fr .7fr .8fr;gap:10px;padding:12px;border-top:1px solid var(--border);min-width:980px}.audit-row:first-child{border-top:0}.audit-head{background:var(--surface-soft)}.audit-row span{color:var(--muted);overflow-wrap:anywhere}
    .audit-current,.audit-devices,.audit-timeline,.audit-alerts{display:grid;gap:10px;color:var(--muted)}.audit-device-card{display:grid;gap:6px;padding:14px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft)}.audit-device-card strong{color:var(--text)}.audit-device-card em{color:var(--primary);font-style:normal;font-weight:800}.audit-timeline section{padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft)}.audit-timeline h3{margin:0 0 8px}.audit-timeline p,.audit-alerts p{margin:0;padding:8px 0;border-top:1px solid var(--border)}.audit-timeline p:first-of-type{border-top:0}
    .admin-motion-page{animation:admin-page-enter .25s ease both}.admin-scan{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;align-items:center;margin-bottom:16px;padding:16px;border:1px solid var(--border);border-radius:var(--radius);background:linear-gradient(135deg,var(--card),var(--surface-soft));overflow:hidden;position:relative}.admin-scan:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--primary) 14%,transparent),transparent);transform:translateX(-100%);animation:none}.admin-scan span{width:12px;height:12px;border-radius:99px;background:var(--primary);box-shadow:0 0 0 6px color-mix(in srgb,var(--primary) 12%,transparent);animation:none}.admin-scan strong{position:relative;color:var(--text)}.admin-scan p{position:relative;grid-column:2;margin:0;color:var(--muted)}
    .admin-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:16px}.admin-motion-card,.admin-metrics article{padding:18px;border:1px solid var(--border);border-radius:var(--radius);background:var(--card);box-shadow:var(--shadow-soft);animation:admin-item-enter .34s ease both;animation-delay:calc(var(--stagger,0) * 54ms);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.admin-motion-card:hover,.admin-metrics article:hover{transform:translateY(-3px);border-color:var(--border-strong);box-shadow:var(--shadow)}.admin-metrics span,.admin-motion-card small{display:block;color:var(--muted);font-weight:750}.admin-metrics strong{display:block;margin-top:8px;font-size:34px;color:var(--text)}
    .admin-dashboard-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:14px}.admin-dashboard-grid .danger-event-card{grid-column:1/-1}.admin-section-card{min-height:260px}.admin-section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.admin-section-head h2{margin:0}.admin-section-head span{color:var(--muted);font-size:13px}.status-pulse{width:10px;height:10px;border-radius:50%;background:var(--primary);animation:none}
    .admin-mini-row,.admin-log-row,.admin-risk{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center;padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft);transition:background .18s ease,border-color .18s ease,transform .18s ease}.admin-mini-row+.admin-mini-row,.admin-log-row+.admin-log-row,.admin-risk+.admin-risk{margin-top:8px}.admin-mini-row:hover,.admin-log-row:hover{background:color-mix(in srgb,var(--surface-soft) 70%,var(--primary) 5%);border-color:var(--border-strong)}.admin-mini-row strong,.admin-log-row strong,.admin-risk strong{display:block;color:var(--text)}.admin-mini-row small,.admin-log-row small,.admin-risk small{color:var(--muted)}.admin-avatar{display:grid;place-items:center;width:34px;height:34px;border-radius:var(--radius);background:var(--primary);color:var(--primary-ink);font-weight:900}.admin-badge{display:inline-flex;align-items:center;justify-content:center;min-width:70px;padding:6px 8px;border-radius:var(--radius);border:1px solid var(--border);background:var(--surface-soft);color:var(--muted);font-style:normal;font-size:12px;font-weight:800;transition:background .18s ease,color .18s ease,border-color .18s ease}.admin-badge.active,.admin-badge.info{color:var(--primary);border-color:color-mix(in srgb,var(--primary) 40%,var(--border))}.admin-badge.suspended,.admin-badge.warning{color:#d99a2b;border-color:color-mix(in srgb,#d99a2b 46%,var(--border))}.admin-badge.banned,.admin-badge.danger{color:var(--danger);border-color:color-mix(in srgb,var(--danger) 46%,var(--border))}
    .admin-risk.warning{border-color:color-mix(in srgb,#d99a2b 44%,var(--border))}.admin-risk.danger,.danger-event-card.pulse-once{border-color:color-mix(in srgb,var(--danger) 58%,var(--border));box-shadow:0 0 0 1px color-mix(in srgb,var(--danger) 18%,transparent),var(--shadow-soft)}.pulse-once{animation:danger-glow 1.1s ease 1}.log-dot{width:10px;height:10px;border-radius:99px;background:var(--primary)}.admin-log-row.warning .log-dot{background:#d99a2b}.admin-log-row.danger .log-dot{background:var(--danger)}
    .admin-toolbar{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-bottom:14px}.admin-toolbar .os-search{margin:0}.admin-toolbar input,.admin-toolbar select{width:100%;height:56px;min-height:56px;box-sizing:border-box;background:var(--surface-soft);color:var(--text);border:1px solid var(--border);border-radius:var(--radius);padding:0 14px;font-size:16px}.admin-table-row select{width:100%;min-height:42px;background:var(--surface-soft);color:var(--text);border:1px solid var(--border);border-radius:var(--radius);padding:8px 10px}.admin-toolbar input:focus,.admin-toolbar select:focus{border-color:var(--primary);box-shadow:0 0 0 4px color-mix(in srgb,var(--primary) 14%,transparent)}
    .admin-table-card{overflow:hidden}.admin-data-table{overflow:auto}.admin-table-row{display:grid;grid-template-columns:.8fr 1fr 1.45fr .55fr .8fr .9fr 1fr 1fr 1fr .8fr;gap:10px;align-items:center;min-width:1180px;padding:12px;border-top:1px solid var(--border);transition:background .18s ease}.admin-table-row:first-child{border-top:0}.admin-table-row:hover{background:color-mix(in srgb,var(--surface-soft) 68%,var(--primary) 5%)}.admin-table-head{position:sticky;top:0;z-index:1;background:var(--surface-soft)}.admin-table-row span{color:var(--muted);overflow-wrap:anywhere}.admin-table-row .mono{font-family:ui-monospace,Consolas,monospace;color:var(--quiet)}
    .animated-row{animation:admin-row-enter .24s ease both;animation-delay:calc(var(--stagger,0) * 28ms)}[data-admin-path="true"] .admin-motion-card,[data-admin-path="true"] .admin-metrics article,[data-admin-path="true"] .admin-user-table .animated-row,[data-admin-path="true"] .admin-log-timeline .animated-row{animation:none!important}.row-flash-warning{animation:row-flash-warning .8s ease 1}.row-flash-success{animation:row-flash-success .8s ease 1}.admin-detail-card{margin-top:14px}.admin-detail-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}.admin-detail-grid>div{padding:14px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft)}.admin-detail-grid p{margin:6px 0;color:var(--muted);overflow-wrap:anywhere}
    .admin-role-summary{margin-bottom:14px}.admin-role-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-bottom:14px}.admin-role-cards strong{display:block;margin-top:12px;color:var(--text)}.admin-unsaved{padding:10px 12px;margin-top:12px;border:1px solid color-mix(in srgb,#d99a2b 50%,var(--border));border-radius:var(--radius);background:color-mix(in srgb,#d99a2b 12%,transparent);color:var(--text);animation:admin-item-enter .18s ease both}.permission-group{border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft);margin-top:10px;overflow:hidden}.permission-group summary{cursor:pointer;padding:13px 14px;color:var(--text);font-weight:900}.permission-grid{display:grid;grid-template-columns:minmax(220px,1fr) repeat(3,110px);gap:1px;background:var(--border);border-top:1px solid var(--border)}.permission-grid>*{background:var(--card);padding:12px}.permission-key strong,.permission-key small{display:block}.permission-key small{margin-top:4px;color:var(--muted)}.switch-cell{display:grid;place-items:center}.switch-cell input{position:absolute;opacity:0;pointer-events:none}.switch-cell span{width:42px;height:24px;border-radius:99px;border:1px solid var(--border);background:var(--surface-soft);position:relative;transition:background .18s ease,border-color .18s ease,box-shadow .18s ease}.switch-cell span:before{content:"";position:absolute;width:18px;height:18px;left:2px;top:2px;border-radius:50%;background:var(--muted);transition:transform .18s ease,background .18s ease}.switch-cell input:checked+span{background:color-mix(in srgb,var(--primary) 30%,var(--surface-soft));border-color:var(--primary)}.switch-cell input:checked+span:before{transform:translateX(18px);background:var(--primary)}.switch-cell.updated span{box-shadow:0 0 0 4px color-mix(in srgb,var(--primary) 18%,transparent)}
    #admin-recent-users,#admin-recent-users *,#admin-recent-logs,#admin-recent-logs *,#admin-risk-list,#admin-risk-list *{cursor:default!important}#admin-recent-logs .animated-row,.admin-user-table .animated-row{animation:none!important}.danger-event-card.pulse-once{animation:none!important}
    .admin-log-timeline{display:grid;gap:8px}.admin-log-row{cursor:pointer;grid-template-columns:auto minmax(0,1fr) auto}#admin-recent-logs .admin-log-row{cursor:default}.admin-drawer{position:fixed;inset:0 0 0 auto;width:min(520px,calc(100vw - 24px));padding:22px;background:var(--card);border-left:1px solid var(--border);box-shadow:var(--shadow);transform:translateX(104%);transition:transform .22s ease;z-index:40;overflow:auto}.admin-drawer.is-open{transform:translateX(0)}.admin-drawer h2{margin-top:34px}.admin-drawer-facts{display:grid;gap:8px}.admin-drawer-facts div{padding:10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft)}.admin-drawer-facts dt{color:var(--muted);font-size:12px}.admin-drawer-facts dd{margin:4px 0 0;color:var(--text);overflow-wrap:anywhere}.admin-drawer pre{white-space:pre-wrap;padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft);color:var(--muted)}
    .admin-primary,.admin-ghost,.admin-danger{min-height:38px;width:auto;border-radius:var(--radius);font-weight:850;transition:transform .14s ease,box-shadow .14s ease,background .14s ease,border-color .14s ease}.admin-primary{background:var(--primary);color:var(--primary-ink);border:1px solid var(--primary)}.admin-primary:disabled{opacity:.48;cursor:not-allowed}.admin-ghost{background:var(--surface-soft);color:var(--text);border:1px solid var(--border)}.admin-danger{background:linear-gradient(135deg,color-mix(in srgb,var(--danger) 85%,#111),var(--danger));color:#fff;border:1px solid color-mix(in srgb,var(--danger) 70%,var(--border))}.admin-ghost:hover,.admin-primary:hover,.admin-danger:hover{transform:translateY(-1px);box-shadow:var(--shadow-soft)}.admin-danger:hover{box-shadow:0 12px 26px color-mix(in srgb,var(--danger) 24%,transparent)}.admin-ghost:active,.admin-primary:active,.admin-danger:active{transform:scale(.96)}
    .admin-empty-state{display:grid;place-items:center;gap:10px;min-height:150px;padding:22px;border:1px dashed var(--border-strong);border-radius:var(--radius);background:var(--surface-soft);text-align:center;animation:admin-item-enter .24s ease both}.admin-empty-orb{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:var(--primary);color:var(--primary-ink);font-weight:900;animation:empty-float 2.8s ease-in-out infinite}.admin-empty{color:var(--muted)}
    .skeleton-line{height:44px;border-radius:var(--radius);background:linear-gradient(90deg,var(--surface-soft),color-mix(in srgb,var(--primary) 10%,var(--surface-soft)),var(--surface-soft));background-size:240% 100%;animation:skeleton-shimmer 1.2s ease-in-out infinite;margin-bottom:10px}.admin-skeleton strong{color:transparent;border-radius:var(--radius);background:linear-gradient(90deg,var(--surface-soft),color-mix(in srgb,var(--primary) 10%,var(--surface-soft)),var(--surface-soft));background-size:240% 100%;animation:skeleton-shimmer 1.2s ease-in-out infinite}
    #admin-toast-host{position:fixed;right:18px;top:18px;z-index:60;display:grid;gap:10px;max-width:min(360px,calc(100vw - 36px))}.admin-toast{display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid var(--border);border-radius:var(--radius);background:var(--card);box-shadow:var(--shadow);color:var(--text);animation:toast-in .2s ease both}.admin-toast strong{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:var(--primary);color:var(--primary-ink)}.admin-toast.warning strong{background:#d99a2b;color:#121212}.admin-toast.danger strong{background:var(--danger);color:#fff}.admin-toast.is-hiding{animation:toast-out .25s ease both}
    .admin-confirm-backdrop{position:fixed;inset:0;z-index:55;display:grid;place-items:center;background:rgba(0,0,0,.42);opacity:0;pointer-events:none;transition:opacity .18s ease}.admin-confirm-backdrop.is-open{opacity:1;pointer-events:auto}.admin-confirm{width:min(440px,calc(100vw - 32px));padding:20px;border:1px solid var(--border);border-radius:var(--radius);background:var(--card);box-shadow:var(--shadow);transform:scale(.95);opacity:0;transition:transform .18s ease,opacity .18s ease}.admin-confirm-backdrop.is-open .admin-confirm{transform:scale(1);opacity:1}.admin-confirm.is-danger{border-color:color-mix(in srgb,var(--danger) 48%,var(--border))}.admin-confirm h3{margin:0 0 8px}.admin-confirm p{margin:0 0 14px;color:var(--muted)}.admin-confirm input{margin-bottom:10px;background:var(--surface-soft)}.admin-confirm input.is-error{border-color:var(--danger);box-shadow:0 0 0 4px color-mix(in srgb,var(--danger) 16%,transparent)}.admin-confirm-actions{display:flex;justify-content:flex-end;gap:10px}
    @keyframes admin-page-enter{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes admin-item-enter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes admin-row-enter{from{opacity:0}to{opacity:1}}@keyframes admin-scan{0%{transform:translateX(-100%)}45%,100%{transform:translateX(100%)}}@keyframes status-pulse{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--primary) 28%,transparent)}50%{box-shadow:0 0 0 8px transparent}}@keyframes skeleton-shimmer{from{background-position:120% 0}to{background-position:-120% 0}}@keyframes toast-in{from{opacity:0;transform:translateX(22px)}to{opacity:1;transform:translateX(0)}}@keyframes toast-out{to{opacity:0;transform:translateX(22px)}}@keyframes danger-glow{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--danger) 34%,transparent)}100%{box-shadow:0 0 0 16px transparent}}@keyframes row-flash-warning{0%{background:color-mix(in srgb,#d99a2b 20%,transparent)}100%{background:transparent}}@keyframes row-flash-success{0%{background:color-mix(in srgb,#22c55e 18%,transparent)}100%{background:transparent}}@keyframes empty-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@keyframes confirm-shake{0%,100%{transform:translateX(0) scale(1)}25%{transform:translateX(-6px) scale(1)}75%{transform:translateX(6px) scale(1)}}.shake-once{animation:confirm-shake .25s ease 1}
    @media (max-width:1050px){
      body.os-shell{height:100dvh;overflow:hidden;box-sizing:border-box}
      .os-layout{height:calc(100dvh - 48px);min-height:0;display:block}
      .os-sidebar,.os-main{height:100%;min-height:0;box-sizing:border-box;overflow-y:auto;overscroll-behavior:contain}
      .os-sidebar{position:static;scrollbar-width:thin;scrollbar-color:transparent transparent}
      .os-sidebar::-webkit-scrollbar{width:8px}
      .os-sidebar::-webkit-scrollbar-track{background:transparent}
      .os-sidebar::-webkit-scrollbar-thumb{background:transparent;border-radius:999px}
      .os-sidebar:hover{scrollbar-color:var(--border-strong) transparent}
      .os-sidebar:hover::-webkit-scrollbar-thumb{background:var(--border-strong)}
      html.compact-menu-view .os-sidebar,
      html:not(.compact-content-view):not(.compact-menu-view) .os-sidebar{display:block}
      html.compact-menu-view .os-main,
      html:not(.compact-content-view):not(.compact-menu-view) .os-main{display:none}
      html.compact-content-view .os-sidebar{display:none}
      html.compact-content-view .os-main{display:block;padding-top:72px}
      .compact-back-zone{display:none;position:fixed;top:0;left:0;width:92px;height:92px;z-index:85}
      html.compact-content-view .compact-back-zone{display:block}
      .compact-back-button{
        position:absolute;
        top:14px;
        left:14px;
        display:grid;
        place-items:center;
        width:48px;
        height:48px;
        min-width:48px;
        min-height:48px;
        padding:0;
        border:1px solid rgba(255,255,255,.58);
        border-radius:50%;
        background:linear-gradient(145deg,rgba(255,255,255,.72),rgba(255,255,255,.34));
        -webkit-backdrop-filter:blur(22px) saturate(180%);
        backdrop-filter:blur(22px) saturate(180%);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.82),
          inset 0 -1px 0 rgba(255,255,255,.18),
          0 8px 24px rgba(15,23,42,.16);
        color:#111;
        opacity:0;
        transform:translateY(-6px) scale(.94);
        pointer-events:none;
        cursor:pointer;
        transition:opacity .16s ease,transform .18s cubic-bezier(.2,.8,.2,1),background .18s ease,box-shadow .18s ease;
      }
      .compact-back-button svg{width:24px;height:24px;fill:none;stroke:#111;stroke-width:2.35;stroke-linecap:round;stroke-linejoin:round}
      .compact-back-zone:hover .compact-back-button,
      .compact-back-zone:focus-within .compact-back-button{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}
      .compact-back-button:hover{
        background:linear-gradient(145deg,rgba(255,255,255,.82),rgba(255,255,255,.44));
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.9),
          inset 0 -1px 0 rgba(255,255,255,.22),
          0 10px 28px rgba(15,23,42,.2);
        transform:translateY(0) scale(1.04);
      }
      .compact-back-button:active{transform:translateY(0) scale(.94)}
      .os-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      .storage-summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.storage-connection-card{grid-column:span 2}.storage-toolbar{grid-template-columns:auto auto minmax(160px,1fr)}
      .os-hero{grid-template-columns:1fr;display:grid}
      .os-ai{min-width:0}
      .admin-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}
      .admin-dashboard-grid,.admin-role-cards,.admin-detail-grid{grid-template-columns:1fr}
      .admin-toolbar{grid-template-columns:1fr 1fr}
      .permission-grid{grid-template-columns:minmax(190px,1fr) repeat(3,86px)}
      .audit-grid{grid-template-columns:1fr}
    }
    @media (max-width:1050px) and (hover:none) and (pointer:coarse){
      .compact-back-button{opacity:1;transform:none;pointer-events:auto}
    }
    @media (max-width:560px){
      body.os-shell{padding:14px}
      .os-layout{height:calc(100dvh - 28px)}
      .os-main{padding:20px 16px}
      html.compact-content-view .os-main{padding-top:64px}
      .os-grid,.admin-metrics{grid-template-columns:1fr}
      .storage-summary-grid{grid-template-columns:1fr}.storage-connection-card{grid-column:auto}.storage-toolbar{grid-template-columns:1fr 1fr}.storage-search{grid-column:1 / -1}.storage-file-row{min-width:620px;padding:12px 14px;grid-template-columns:minmax(150px,1.45fr) minmax(104px,.85fr) minmax(68px,.48fr) minmax(112px,.75fr) minmax(132px,.78fr)}.storage-file-head{font-size:11px}.storage-actions{gap:5px}.storage-action-button{padding:0 8px}
      .os-profile-card{align-items:flex-start;flex-direction:column}
      .admin-toolbar{grid-template-columns:1fr}
      .permission-grid{grid-template-columns:minmax(150px,1fr) repeat(3,70px)}
      .admin-drawer{width:calc(100vw - 12px)}
    }
    @media (prefers-reduced-motion:reduce){body.os-shell,.os-sidebar,.os-main,.os-card,.admin-motion-page,.admin-motion-card,.admin-metrics article,.animated-row,.admin-scan:before,.status-pulse,.admin-empty-orb,.skeleton-line,.admin-skeleton strong{animation:none !important;transition:none !important}.admin-motion-card:hover,.admin-metrics article:hover,.admin-ghost:hover,.admin-primary:hover,.admin-danger:hover{transform:none !important}}

      /* APPLE_DESIGN_SYSTEM_V2_OS */
/* APPLE_DESIGN_SYSTEM_V2 \u2014 authenticated workspace */
body.os-shell{
  padding:18px!important;
  background:
    radial-gradient(1000px 620px at 10% -12%,color-mix(in srgb,var(--primary) 10%,transparent),transparent 66%),
    radial-gradient(820px 560px at 102% 108%,color-mix(in srgb,#af52de 7%,transparent),transparent 70%),
    var(--bg)!important;
  background-size:auto!important;
  animation:none!important;
}
.os-layout{
  max-width:1680px;
  margin:0 auto;
  grid-template-columns:276px minmax(0,1fr);
  gap:14px;
}
.os-sidebar,.os-main,.os-card,.os-profile-card,.os-lock{border-color:var(--border)}
.os-sidebar{
  padding:14px;
  border-radius:26px;
  background:var(--glass-heavy);
  -webkit-backdrop-filter:blur(34px) saturate(180%);
  backdrop-filter:blur(34px) saturate(180%);
  box-shadow:0 20px 56px rgba(0,0,0,.13),inset 0 1px 0 color-mix(in srgb,#fff 26%,transparent);
  animation:none;
}
.os-main{
  padding:clamp(24px,3vw,38px);
  border-radius:26px;
  background:color-mix(in srgb,var(--glass) 92%,transparent);
  -webkit-backdrop-filter:blur(28px) saturate(165%);
  backdrop-filter:blur(28px) saturate(165%);
  box-shadow:0 20px 56px rgba(0,0,0,.10),inset 0 1px 0 color-mix(in srgb,#fff 22%,transparent);
  animation:none;
}
.os-brand{gap:10px;margin:2px 4px 16px}
.os-brand-mark,.os-avatar{
  width:40px;height:40px;
  border-radius:12px;
  background:linear-gradient(145deg,color-mix(in srgb,var(--primary) 78%,#fff 22%),var(--primary));
  box-shadow:0 6px 16px color-mix(in srgb,var(--primary) 22%,transparent);
}
.os-brand strong{font-size:14px;letter-spacing:-.01em}
.os-brand small{font-size:11px;color:var(--muted)}
.os-user{
  margin:0 2px 12px;
  padding:11px 12px;
  border:0;
  border-radius:14px;
  background:var(--fill);
  box-shadow:inset 0 0 0 1px var(--border);
}
.os-user strong{font-size:10px;letter-spacing:.04em}
.os-user>span{margin-top:4px;font-size:13px}
.os-signout-button{
  min-height:36px;
  margin:9px 0 0;
  border:0;
  border-radius:10px;
  background:transparent;
  color:var(--muted);
  font-size:12px;
  box-shadow:none;
}
.os-signout-button:hover{background:color-mix(in srgb,var(--danger) 9%,transparent);color:var(--danger)}
.os-signout-button:active{transform:scale(.97)}
.os-nav{gap:5px}
.os-nav-group{
  padding:3px;
  border:0;
  border-radius:14px;
  background:transparent;
}
.os-nav-group.is-active{border:0;box-shadow:none;background:transparent}
.os-nav-title{
  padding:9px 10px;
  border-radius:11px;
  color:var(--text);
  font-size:13px;
  font-weight:680;
  transition:background .13s ease,color .13s ease,transform .1s ease;
}
.os-nav-title:hover{background:var(--fill)}
.os-nav-title:active{transform:scale(.985)}
.os-nav-group.is-active>.os-nav-title{
  background:color-mix(in srgb,var(--primary) 15%,transparent);
  color:var(--primary);
}
.os-nav-items{gap:1px;padding:2px 0 3px 9px}
.os-nav-items a{
  padding:7px 10px;
  border-radius:9px;
  color:var(--muted);
  font-size:12.5px;
  transition:background .13s ease,color .13s ease,transform .1s ease;
}
.os-nav-items a:hover{background:var(--fill);color:var(--text)}
.os-nav-items a:active{transform:scale(.985)}
.os-hero{
  align-items:flex-start;
  margin-bottom:24px;
  gap:20px;
}
.os-kicker{
  margin:0 0 6px;
  color:var(--primary);
  font-size:12px;
  font-weight:680;
  letter-spacing:.01em;
}
.os-hero h1{
  margin:0 0 8px;
  font-size:clamp(32px,4.4vw,50px);
  font-weight:730;
  letter-spacing:-.04em;
  line-height:1.02;
}
.os-hero p{max-width:760px;font-size:14px;line-height:1.5}
.os-ai{
  min-width:190px;
  padding:13px 15px;
  border:0;
  border-radius:15px;
  background:var(--fill);
  box-shadow:inset 0 0 0 1px var(--border);
  transition:background .14s ease,transform .1s ease;
}
.os-ai:hover{background:var(--secondary);transform:none}
.os-ai:active{transform:scale(.98)}
.os-ai span{font-size:11px}.os-ai strong{font-size:15px;letter-spacing:-.01em}
.os-grid{
  grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
  gap:12px;
}
.os-card,.os-profile-card,.os-lock{
  border:1px solid var(--border);
  border-radius:19px;
  background:color-mix(in srgb,var(--surface) 74%,transparent);
  box-shadow:0 8px 26px rgba(0,0,0,.055);
}
.os-card{
  padding:18px;
  animation:none;
}
.os-card h2{margin:7px 0 7px;font-size:18px;letter-spacing:-.02em}
.os-card small{color:var(--muted);font-size:11px;font-weight:650}
.os-card p{font-size:13.5px;line-height:1.5}
.os-card.is-large{min-height:190px}
.settings-card-link{
  transition:background .14s ease,border-color .14s ease,transform .1s ease;
}
.settings-card-link:hover{
  transform:none;
  border-color:var(--border-strong);
  background:color-mix(in srgb,var(--surface) 82%,var(--fill) 18%);
  box-shadow:0 8px 26px rgba(0,0,0,.055);
}
.settings-card-link:active{transform:scale(.988)}
.settings-card-arrow{right:16px;bottom:13px;font-size:20px;color:var(--quiet)}
.settings-choice-grid{gap:8px;margin-top:18px}
.settings-choice{
  min-height:72px;
  padding:13px 14px;
  border:1px solid transparent;
  border-radius:14px;
  background:var(--fill);
  box-shadow:inset 0 0 0 1px var(--border);
  transition:background .14s ease,box-shadow .14s ease,transform .1s ease;
}
.settings-choice:hover{background:var(--secondary);border-color:transparent;box-shadow:inset 0 0 0 1px var(--border);transform:none}
.settings-choice:active{transform:scale(.985)}
.settings-choice.is-selected{
  border-color:transparent;
  background:color-mix(in srgb,var(--primary) 14%,var(--fill));
  box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 38%,transparent);
}
.settings-choice strong{font-size:15px}.settings-choice span{font-size:12px}
.os-profile-card{padding:20px}
.os-profile-card .os-avatar{width:76px;height:76px;border-radius:50%;font-size:30px}
.os-chip-row{gap:7px}
.os-chip-row span{
  padding:7px 9px;
  border:0;
  border-radius:999px;
  background:var(--fill);
  font-size:12px;
  font-weight:620;
}
.audit-grid,.admin-dashboard-grid,.admin-metrics,.admin-role-cards,.admin-detail-grid{gap:12px}
.audit-facts div,.admin-detail-grid>div,.audit-stats span,.audit-timeline section,.admin-drawer-facts div{
  border:0;
  border-radius:13px;
  background:var(--fill);
  box-shadow:inset 0 0 0 1px var(--border);
}
.admin-motion-card,.admin-metrics article{
  padding:16px;
  border:1px solid var(--border);
  border-radius:17px;
  background:color-mix(in srgb,var(--surface) 74%,transparent);
  box-shadow:0 7px 22px rgba(0,0,0,.05);
  animation:none;
  transition:background .14s ease,border-color .14s ease,transform .1s ease;
}
.admin-motion-card:hover,.admin-metrics article:hover{
  transform:none;
  border-color:var(--border-strong);
  box-shadow:0 7px 22px rgba(0,0,0,.05);
}
.admin-metrics strong{font-size:30px;letter-spacing:-.035em}
.admin-mini-row,.admin-log-row,.admin-risk{
  padding:11px 12px;
  border:0;
  border-radius:12px;
  background:var(--fill);
  box-shadow:inset 0 0 0 1px var(--border);
  transition:background .13s ease,transform .1s ease;
}
.admin-mini-row:hover,.admin-log-row:hover{background:var(--secondary);border-color:transparent}
.admin-mini-row:active,.admin-log-row:active{transform:scale(.994)}
.admin-badge{
  min-width:64px;
  padding:5px 8px;
  border:0;
  border-radius:999px;
  background:var(--fill);
  font-size:11px;
}
.admin-toolbar{gap:8px}
.admin-toolbar input,.admin-toolbar select{
  height:48px;min-height:48px;
  border:0;
  border-radius:13px;
  background:var(--fill);
  box-shadow:inset 0 0 0 1px var(--border);
}
.admin-toolbar input:focus,.admin-toolbar select:focus{box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 14%,transparent),inset 0 0 0 1px var(--primary)}
.admin-table-card,.storage-browser{overflow:hidden}
.admin-table-row,.audit-row,.storage-file-row{border-top-color:var(--hairline)}
.admin-table-head,.audit-head,.storage-file-head{
  background:color-mix(in srgb,var(--glass-heavy) 92%,transparent);
  -webkit-backdrop-filter:blur(18px) saturate(160%);
  backdrop-filter:blur(18px) saturate(160%);
}
.admin-primary,.admin-ghost,.admin-danger{
  min-height:38px;
  border:0;
  border-radius:11px;
  box-shadow:none;
  font-weight:660;
}
.admin-primary{background:var(--primary);color:#fff}
.admin-ghost{background:var(--fill);color:var(--text)}
.admin-danger{background:var(--danger);color:#fff}
.admin-ghost:hover,.admin-primary:hover,.admin-danger:hover{transform:none;box-shadow:none;filter:brightness(1.04)}
.admin-ghost:active,.admin-primary:active,.admin-danger:active{transform:scale(.96)}
.admin-drawer{
  padding:22px;
  background:var(--glass-heavy);
  -webkit-backdrop-filter:blur(32px) saturate(180%);
  backdrop-filter:blur(32px) saturate(180%);
  box-shadow:-18px 0 60px rgba(0,0,0,.18);
}
.admin-confirm-backdrop{background:rgba(0,0,0,.34);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
.admin-confirm{
  padding:20px;
  border:1px solid var(--border);
  border-radius:20px;
  background:var(--glass-heavy);
  -webkit-backdrop-filter:blur(28px) saturate(180%);
  backdrop-filter:blur(28px) saturate(180%);
  box-shadow:var(--shadow);
}
#admin-toast-host{right:18px;top:18px}
.admin-toast{
  padding:11px 13px;
  border:1px solid var(--border);
  border-radius:15px;
  background:var(--glass-heavy);
  -webkit-backdrop-filter:blur(24px) saturate(180%);
  backdrop-filter:blur(24px) saturate(180%);
  box-shadow:0 14px 38px rgba(0,0,0,.16);
  animation:apple-toast-in .22s cubic-bezier(.2,.8,.2,1) both;
}
.admin-empty-state{
  min-height:150px;
  border:0;
  border-radius:16px;
  background:var(--fill);
  box-shadow:inset 0 0 0 1px var(--border);
  animation:none;
}
.admin-empty-orb{background:var(--fill);color:var(--primary);animation:none}
.skeleton-line,.admin-skeleton strong{
  background:linear-gradient(90deg,var(--fill),color-mix(in srgb,var(--fill) 62%,var(--surface-strong) 38%),var(--fill));
  background-size:220% 100%;
}
.permission-group{
  border:0;
  border-radius:15px;
  background:var(--fill);
  box-shadow:inset 0 0 0 1px var(--border);
}
.permission-group summary{padding:12px 14px;font-weight:680}
.switch-cell span{border:0;background:var(--secondary);box-shadow:inset 0 0 0 1px var(--border)}
.switch-cell input:checked+span{background:var(--primary);border-color:transparent}
.switch-cell input:checked+span:before{background:#fff}
.os-lock{padding:16px}
.storage-overview-panel{
  border-radius:20px;
  background:color-mix(in srgb,var(--surface) 72%,transparent);
  box-shadow:0 8px 26px rgba(0,0,0,.055),inset 0 1px 0 color-mix(in srgb,#fff 18%,transparent);
}
.storage-toolbar{
  border-radius:15px;
  background:var(--fill);
  -webkit-backdrop-filter:none;
  backdrop-filter:none;
}
.storage-upload-button,.storage-empty-upload{border-radius:11px;font-weight:660}
.storage-search-shell{
  border-radius:11px;
  background:color-mix(in srgb,var(--surface) 72%,transparent);
  box-shadow:inset 0 0 0 1px var(--border);
}
.storage-search-shell:focus-within{border-color:transparent;box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 13%,transparent),inset 0 0 0 1px var(--primary)}
.storage-browser{
  border-radius:18px;
  background:color-mix(in srgb,var(--surface) 76%,transparent);
  box-shadow:0 8px 26px rgba(0,0,0,.045);
}
.storage-action-button{border:0;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border)}
.storage-empty-icon{border-radius:14px;background:var(--fill)}
@keyframes apple-toast-in{from{opacity:0;transform:translateY(-8px) scale(.98)}to{opacity:1;transform:none}}
@media (max-width:1050px){
  body.os-shell{padding:12px!important}
  .os-layout{height:calc(100dvh - 24px)}
  .os-main{border-radius:22px}
  .os-sidebar{border-radius:22px}
}
@media (max-width:620px){
  .os-main{padding:22px 16px}
  .os-hero{gap:14px}
  .os-hero h1{font-size:36px}
  .os-ai{min-width:0}
}
@media (prefers-reduced-motion:reduce){
  .admin-toast{animation:none!important}
  .admin-motion-card,.admin-metrics article,.settings-card-link,.admin-mini-row,.admin-log-row,.os-ai,.os-nav-title,.os-nav-items a{transition:background .12s ease,color .12s ease,opacity .12s ease!important}
}
@media (prefers-reduced-transparency:reduce){
  .os-sidebar,.os-main,.admin-drawer,.admin-confirm,.admin-toast,.admin-table-head,.audit-head,.storage-file-head{background:var(--surface)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
}
@media (prefers-contrast:more){
  .os-sidebar,.os-main,.os-card,.os-profile-card,.admin-motion-card,.admin-metrics article,.storage-overview-panel,.storage-browser{border-color:var(--border-strong)!important}
}

    /* PROFILE_HOME_V3 */
    .profile-home{display:grid;gap:14px}
    .profile-cover{position:relative;min-height:210px;border-radius:22px;overflow:hidden;background:linear-gradient(135deg,#1d7fff 0%,#7d62ff 52%,#ff6ea8 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.28)}
    .profile-cover[data-cover-style="sky"],[data-cover-style="sky"]{background:linear-gradient(135deg,#5ac8fa,#007aff)}
    .profile-cover[data-cover-style="sunset"],[data-cover-style="sunset"]{background:linear-gradient(135deg,#ff9f0a,#ff375f 55%,#af52de)}
    .profile-cover[data-cover-style="grape"],[data-cover-style="grape"]{background:linear-gradient(135deg,#5856d6,#af52de)}
    .profile-cover[data-cover-style="graphite"],[data-cover-style="graphite"]{background:linear-gradient(135deg,#3a3a3c,#1c1c1e)}
    .profile-cover[data-cover-style="mint"],[data-cover-style="mint"]{background:linear-gradient(135deg,#30d158,#64d2ff)}
    .profile-cover-noise{position:absolute;inset:0;background:radial-gradient(circle at 18% 15%,rgba(255,255,255,.34),transparent 28%),radial-gradient(circle at 82% 72%,rgba(255,255,255,.16),transparent 32%);mix-blend-mode:screen;pointer-events:none}
    .profile-cover-actions{position:absolute;top:16px;right:16px}
    .profile-pill-button{width:auto;min-height:38px;margin:0;padding:0 14px;border:1px solid rgba(255,255,255,.32);border-radius:999px;background:rgba(255,255,255,.22);color:#fff;-webkit-backdrop-filter:blur(18px) saturate(160%);backdrop-filter:blur(18px) saturate(160%);font-size:13px;font-weight:680;box-shadow:none}
    .profile-pill-button:hover{background:rgba(255,255,255,.28);filter:none}
    .profile-pill-secondary{border-color:var(--border);background:var(--fill);color:var(--text);-webkit-backdrop-filter:none;backdrop-filter:none}
    .profile-pill-secondary:hover{background:var(--secondary)}
    .profile-identity{display:grid;grid-template-columns:auto minmax(0,1fr);gap:18px;align-items:end;margin:-64px 24px 0;position:relative;z-index:2}
    .profile-avatar-large{width:116px!important;height:116px!important;border-radius:50%!important;border:5px solid color-mix(in srgb,var(--surface) 94%,transparent);font-size:42px!important;box-shadow:0 14px 34px rgba(0,0,0,.18)!important}
    .profile-identity-copy{padding-bottom:4px;min-width:0}
    .profile-name-row{display:flex;align-items:center;gap:8px}
    .profile-name-row h2{margin:0;font-size:28px;letter-spacing:-.035em}
    .profile-name-lock{font-size:13px;opacity:.5}
    .profile-identity-copy>p{margin:4px 0 0;color:var(--muted)}
    .profile-signature{font-size:14px!important;color:var(--text)!important;max-width:760px}
    .profile-home-grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(320px,.9fr);gap:14px}
    .profile-section-card{padding:19px;border:1px solid var(--border);border-radius:19px;background:color-mix(in srgb,var(--surface) 76%,transparent);box-shadow:0 8px 26px rgba(0,0,0,.045)}
    .profile-section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}
    .profile-section-head h3{margin:3px 0 0;font-size:18px;letter-spacing:-.02em}
    .profile-section-head p{margin:7px 0 0;font-size:13px}
    .profile-eyebrow{display:block;color:var(--muted);font-size:11px;font-weight:680}
    .profile-bio{min-height:48px;margin:16px 0;color:var(--text);font-size:14px;line-height:1.55;white-space:pre-wrap}
    .profile-meta-row{display:flex;flex-wrap:wrap;gap:8px}
    .profile-presence,.profile-location{display:inline-flex;align-items:center;min-height:30px;padding:0 10px;border-radius:999px;background:var(--fill);color:var(--muted);font-size:12px;font-weight:620}
    .profile-interest-list{display:flex;flex-wrap:wrap;gap:7px;margin-top:14px}
    .profile-interest-list>span{padding:7px 10px;border-radius:999px;background:var(--fill);color:var(--text);font-size:12px}
    .profile-interest-list .profile-interest-empty{color:var(--muted)}
    .profile-quick-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:15px}
    .profile-quick-grid a{display:grid;grid-template-columns:34px 1fr;grid-template-rows:auto auto;column-gap:9px;align-items:center;padding:11px;border-radius:14px;background:var(--fill);color:var(--text);text-decoration:none;transition:background .13s ease,transform .1s ease}
    .profile-quick-grid a:hover{background:var(--secondary)}.profile-quick-grid a:active{transform:scale(.985)}
    .profile-quick-grid a>span{grid-row:1/-1;display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:color-mix(in srgb,var(--primary) 14%,transparent);color:var(--primary);font-weight:800}
    .profile-quick-grid strong{font-size:13px}.profile-quick-grid small{color:var(--muted);font-size:11px}
    .profile-link-list{display:grid;gap:8px;margin-top:15px}
    .profile-link-item{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:8px;padding:8px;border-radius:15px;background:var(--fill)}
    .profile-link-main{display:grid;grid-template-columns:42px minmax(0,1fr) auto;align-items:center;gap:10px;min-width:0;padding:3px;color:var(--text);text-decoration:none}
    .profile-link-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:var(--surface);box-shadow:inset 0 0 0 1px var(--border);font-size:14px;font-weight:800}
    .profile-link-copy{min-width:0}.profile-link-copy strong,.profile-link-copy small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.profile-link-copy strong{font-size:13px}.profile-link-copy strong em{font-style:normal;color:var(--warning)}.profile-link-copy small{margin-top:3px;color:var(--muted);font-size:11px}
    .profile-link-open{color:var(--muted)}
    .profile-link-actions{display:flex;gap:4px}.profile-link-actions button{width:auto;min-height:34px;margin:0;padding:0 9px;border-radius:9px;background:transparent;color:var(--muted);font-size:11px}.profile-link-actions button:hover{background:var(--secondary);color:var(--text)}
    .profile-link-empty{display:grid;place-items:center;min-height:120px;padding:20px;text-align:center;color:var(--muted)}.profile-link-empty strong{color:var(--text);font-size:14px}.profile-link-empty span{margin-top:4px;font-size:12px}
    .profile-sheet-backdrop{position:fixed;inset:0;z-index:70;background:rgba(0,0,0,.24);opacity:0;-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);transition:opacity .18s ease}.profile-sheet-backdrop.is-visible{opacity:1}
    .profile-sheet{position:fixed;top:12px;right:12px;bottom:12px;z-index:80;display:flex;flex-direction:column;width:min(480px,calc(100vw - 24px));border:1px solid var(--border);border-radius:24px;background:var(--glass-heavy);-webkit-backdrop-filter:blur(34px) saturate(180%);backdrop-filter:blur(34px) saturate(180%);box-shadow:-18px 0 60px rgba(0,0,0,.2);transform:translateX(calc(100% + 28px));opacity:.78;transition:transform .28s cubic-bezier(.2,.8,.2,1),opacity .18s ease;overflow:hidden}
    .profile-sheet.is-open{transform:none;opacity:1}.profile-sheet-grabber{display:none}
    .profile-sheet-head{display:flex;justify-content:space-between;gap:14px;align-items:center;padding:20px 20px 12px}.profile-sheet-head h3{margin:3px 0 0;font-size:22px;letter-spacing:-.03em}
    .profile-sheet-close{width:36px;height:36px;min-height:36px;margin:0;padding:0;border-radius:50%;background:var(--fill);color:var(--text);font-size:22px;font-weight:400}
    .profile-sheet-body{flex:1;overflow:auto;padding:4px 20px 22px}
    .profile-field{display:grid;gap:7px;margin-top:15px}.profile-field>span{font-size:12px;font-weight:650;color:var(--muted)}.profile-field small{color:var(--quiet);font-size:11px;line-height:1.4}
    .profile-field input,.profile-field select,.profile-field textarea{width:100%;margin:0;border:0;border-radius:12px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border);font:inherit;color:var(--text)}
    .profile-field textarea{min-height:110px;padding:12px 14px;resize:vertical;line-height:1.5}
    .profile-field input[readonly]{opacity:.72;cursor:not-allowed}
    .profile-status-editor{display:grid;grid-template-columns:1fr 64px 1.3fr;gap:7px}.profile-status-editor>*{min-width:0}
    .profile-cover-picker{display:grid;grid-template-columns:repeat(6,1fr);gap:7px}.profile-cover-picker button{width:auto;min-height:46px;margin:0;padding:3px;border:2px solid transparent;border-radius:13px;background:transparent}.profile-cover-picker button.is-selected{border-color:var(--primary)}.profile-cover-picker span{display:block;height:36px;border-radius:9px}
    .profile-pin-row{display:flex;align-items:center;gap:9px;margin-top:16px;color:var(--text);font-size:13px}.profile-pin-row input{width:auto;min-height:auto;margin:0}
    .profile-link-presets{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 10px}.profile-link-presets button{width:auto;min-height:34px;margin:0;padding:0 10px;border-radius:999px;background:var(--fill);color:var(--text);font-size:11px}
    .profile-sheet-actions{padding:12px 20px 20px;border-top:1px solid var(--hairline);background:color-mix(in srgb,var(--glass-heavy) 94%,transparent)}.profile-save-button{margin:0}
    @media(max-width:900px){.profile-home-grid{grid-template-columns:1fr}.profile-identity{margin-left:18px;margin-right:18px}}
    @media(max-width:620px){.profile-cover{min-height:160px;border-radius:18px}.profile-identity{grid-template-columns:88px minmax(0,1fr);gap:12px;margin-top:-44px}.profile-avatar-large{width:88px!important;height:88px!important;font-size:30px!important}.profile-name-row h2{font-size:22px}.profile-section-card{padding:16px}.profile-quick-grid{grid-template-columns:1fr}.profile-link-item{grid-template-columns:1fr}.profile-link-actions{justify-content:flex-end}.profile-sheet{top:auto;right:8px;left:8px;bottom:8px;width:auto;max-height:88dvh;border-radius:24px;transform:translateY(calc(100% + 20px));opacity:1}.profile-sheet-grabber{display:block;width:42px;height:5px;margin:8px auto 0;border-radius:999px;background:var(--quiet);opacity:.45}.profile-status-editor{grid-template-columns:1fr 58px}.profile-status-editor input:last-child{grid-column:1/-1}.profile-cover-picker{grid-template-columns:repeat(3,1fr)}}
    @media(prefers-reduced-motion:reduce){.profile-sheet,.profile-sheet-backdrop,.profile-link-item,.profile-quick-grid a{transition:opacity .12s ease,background .12s ease!important}}
    @media(prefers-reduced-transparency:reduce){.profile-sheet{background:var(--surface)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}.profile-pill-button{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}}
    /* PROFILE_HOME_V3_POLISH_1 */
    :root:not([data-theme="light"]) .profile-status-editor select{
      color-scheme:dark;
      background:#242426;
      color:#f5f5f7;
    }
    :root:not([data-theme="light"]) .profile-status-editor select option{
      background:#242426;
      color:#f5f5f7;
    }
    :root[data-theme="light"] .profile-status-editor select{
      color-scheme:light;
      background:rgba(118,118,128,.10);
      color:#1d1d1f;
    }
    :root[data-theme="light"] .profile-status-editor select option{
      background:#fff;
      color:#1d1d1f;
    }

    html.profile-sheet-open .top-controls{
      opacity:0!important;
      visibility:hidden!important;
      pointer-events:none!important;
      transform:translateY(-10px)!important;
    }
    .top-controls{
      transition:opacity .16s ease,transform .18s cubic-bezier(.2,.8,.2,1),visibility .16s step-end;
    }
    html:not(.profile-sheet-open) .top-controls{
      visibility:visible;
    }
    .profile-sheet{z-index:120}
    .profile-sheet-backdrop{z-index:110}
    .profile-sheet-close{
      position:relative;
      z-index:3;
      pointer-events:auto;
    }

    .profile-cover-picker{
      display:flex;
      flex-wrap:wrap;
      align-items:center;
      justify-content:flex-start;
      gap:10px;
    }
    .profile-cover-picker button{
      flex:0 0 auto;
      width:58px;
      height:48px;
      min-height:48px;
      margin:0;
      padding:4px;
      border:2px solid transparent;
      border-radius:14px;
      background:transparent;
      box-shadow:none;
    }
    .profile-cover-picker button:hover{
      background:var(--fill);
      filter:none;
      transform:none;
    }
    .profile-cover-picker button:active{transform:scale(.94)}
    .profile-cover-picker button.is-selected{
      border-color:var(--primary);
      box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 13%,transparent);
    }
    .profile-cover-picker span{
      display:block;
      width:46px;
      height:36px;
      border-radius:10px;
      border:1px solid color-mix(in srgb,#fff 20%,var(--border));
      box-shadow:inset 0 1px 0 rgba(255,255,255,.22);
    }
    .profile-cover-picker [data-cover-style="aurora"]{background:linear-gradient(135deg,#1d7fff 0%,#7d62ff 52%,#ff6ea8 100%)}
    .profile-cover-picker [data-cover-style="sky"]{background:linear-gradient(135deg,#5ac8fa,#007aff)}
    .profile-cover-picker [data-cover-style="sunset"]{background:linear-gradient(135deg,#ff9f0a,#ff375f 55%,#af52de)}
    .profile-cover-picker [data-cover-style="grape"]{background:linear-gradient(135deg,#5856d6,#af52de)}
    .profile-cover-picker [data-cover-style="graphite"]{background:linear-gradient(135deg,#636366,#1c1c1e)}
    .profile-cover-picker [data-cover-style="mint"]{background:linear-gradient(135deg,#30d158,#64d2ff)}

    .profile-identity{
      align-items:start;
      margin-top:-58px;
    }
    .profile-identity-copy{
      padding-top:72px;
      padding-bottom:0;
    }
    .profile-identity-copy>p{
      margin-top:7px;
    }
    .profile-signature{
      margin-top:10px!important;
    }

    @media(max-width:620px){
      .profile-identity{margin-top:-44px}
      .profile-identity-copy{padding-top:56px}
      .profile-cover-picker{gap:8px}
      .profile-cover-picker button{width:54px;height:46px;min-height:46px}
      .profile-cover-picker span{width:42px;height:34px}
    }
    @media(prefers-reduced-motion:reduce){
      .top-controls{transition:none!important}
    }
    /* PROFILE_HOME_V3_POLISH_2 */
    .profile-avatar-large{overflow:hidden}
    .profile-avatar-large img{width:100%;height:100%;display:block;object-fit:cover}
    .profile-cover.has-custom-background{background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important}
    .profile-media-editor{display:grid;grid-template-columns:88px minmax(0,1fr);gap:14px;align-items:center;padding:12px;border-radius:15px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border)}
    .profile-media-preview{width:88px;height:70px;border-radius:13px;background:var(--surface-soft);background-size:cover;background-position:center;overflow:hidden;box-shadow:inset 0 0 0 1px var(--border)}
    .profile-avatar-preview{width:74px;height:74px;border-radius:50%;display:grid;place-items:center;font-size:26px;font-weight:800;color:#fff;background:linear-gradient(145deg,#64a8ff,#3f7ff4)}
    .profile-avatar-preview img{width:100%;height:100%;object-fit:cover}
    .profile-background-preview[data-cover-style="aurora"]{background:linear-gradient(135deg,#1d7fff 0%,#7d62ff 52%,#ff6ea8 100%)}
    .profile-background-preview[data-cover-style="sky"]{background:linear-gradient(135deg,#5ac8fa,#007aff)}
    .profile-background-preview[data-cover-style="sunset"]{background:linear-gradient(135deg,#ff9f0a,#ff375f 55%,#af52de)}
    .profile-background-preview[data-cover-style="grape"]{background:linear-gradient(135deg,#5856d6,#af52de)}
    .profile-background-preview[data-cover-style="graphite"]{background:linear-gradient(135deg,#636366,#1c1c1e)}
    .profile-background-preview[data-cover-style="mint"]{background:linear-gradient(135deg,#30d158,#64d2ff)}
    .profile-media-copy{display:grid;gap:5px;min-width:0}.profile-media-copy strong{font-size:13px}.profile-media-copy small{color:var(--muted);font-size:11px;line-height:1.45}
    .profile-media-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:3px}
    .profile-inline-button{width:max-content;min-height:34px;margin:3px 0 0;padding:0 11px;border-radius:10px;background:var(--primary);color:#fff;font-size:11px;font-weight:680}
    .profile-inline-button.secondary{background:var(--secondary)!important;color:var(--text)!important}
    .os-nav-items a[aria-current="page"],.os-nav-title[aria-current="page"]{background:color-mix(in srgb,var(--primary) 15%,transparent);color:var(--primary)}
    @media(max-width:620px){.profile-media-editor{grid-template-columns:72px minmax(0,1fr)}.profile-media-preview{width:72px;height:58px}.profile-avatar-preview{width:64px;height:64px}}
    /* PROFILE_HOME_V3_POLISH_2_HOTFIX */
    /* PROFILE_HOME_V3_CONTROLS_HITBOX_FIX */ html.profile-sheet-open .top-controls{opacity:1!important;visibility:visible!important;pointer-events:auto!important;transform:none!important;right:calc(min(520px,92vw) + 20px)!important;z-index:130!important}.profile-sheet-head{position:relative!important;padding-right:62px!important}.profile-sheet-close{position:absolute!important;top:14px!important;right:14px!important;width:44px!important;height:44px!important;min-width:44px!important;min-height:44px!important;padding:0!important;margin:0!important;display:grid!important;place-items:center!important;border-radius:50%!important;z-index:160!important;pointer-events:auto!important;touch-action:manipulation!important;line-height:1!important}.profile-sheet-close::before{content:"";position:absolute;inset:-4px}@media(max-width:760px){html.profile-sheet-open .top-controls{right:16px!important;z-index:130!important}.profile-sheet-head{padding-right:62px!important}}    /* PROFILE_SHEET_VIEWPORT_FIX */ .profile-sheet-backdrop{position:fixed!important;inset:0!important;top:0!important;right:0!important;bottom:0!important;left:0!important;width:100vw!important;height:100vh!important;height:100dvh!important;max-width:none!important;max-height:none!important;margin:0!important;z-index:110!important}.profile-sheet-backdrop.is-visible{pointer-events:auto!important}html.profile-sheet-open,html.profile-sheet-open body{overflow:hidden!important;overscroll-behavior:none!important}
    /* SETTINGS_GENERAL_ROUTE_V1 */

    /* ADMIN_UI_POLISH_V1 */

    .admin-toolbar:has(#admin-user-search){
      grid-template-columns:repeat(3,minmax(0,1fr))!important;
      align-items:stretch!important;
      gap:12px!important;
    }

    .admin-toolbar:has(#admin-log-search){
      grid-template-columns:repeat(3,minmax(0,1fr))!important;
      align-items:stretch!important;
      gap:12px!important;
    }

    .admin-toolbar:has(#admin-user-search)>*,
    .admin-toolbar:has(#admin-log-search)>*{
      width:100%!important;
      min-width:0!important;
      height:54px!important;
      min-height:54px!important;
      margin:0!important;
      align-self:stretch!important;
      box-sizing:border-box!important;
    }

    .admin-toolbar:has(#admin-user-search) input,
    .admin-toolbar:has(#admin-user-search) select,
    .admin-toolbar:has(#admin-log-search) input,
    .admin-toolbar:has(#admin-log-search) select{
      padding-left:16px!important;
      padding-right:16px!important;
      border-radius:16px!important;
      line-height:normal!important;
    }

    #admin-users-table .admin-table-row{
      grid-template-columns:
        minmax(100px,.72fr)
        minmax(132px,.92fr)
        minmax(220px,1.40fr)
        68px
        minmax(156px,1fr)
        minmax(156px,1fr)
        minmax(142px,.94fr)
        minmax(142px,.94fr)
        minmax(142px,.94fr)
        minmax(112px,.78fr)!important;
      min-width:1430px!important;
      column-gap:12px!important;
    }

    #admin-users-table .admin-table-row select{
      width:100%!important;
      min-width:0!important;
      height:44px!important;
      min-height:44px!important;
      padding:0 36px 0 13px!important;
      border-radius:14px!important;
      white-space:nowrap!important;
      font-size:15px!important;
    }

    .permission-grid{
      grid-template-columns:minmax(320px,1.75fr) repeat(3,minmax(132px,.58fr))!important;
    }

    .permission-head{
      display:flex!important;
      align-items:center!important;
      color:var(--muted)!important;
      font-size:13px!important;
      font-weight:800!important;
      letter-spacing:.01em!important;
    }

    .permission-grid>strong:not(.permission-head){
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
      min-width:0!important;
      text-align:center!important;
    }

    .permission-key{
      min-width:0!important;
    }

    #admin-user-search,
    #admin-role-filter,
    #admin-status-filter,
    #admin-log-search,
    #admin-log-action,
    #admin-log-severity,
    #admin-log-actor,
    #admin-log-from,
    #admin-log-to{
      vertical-align:middle!important;
    }

    @media(max-width:980px){
      .admin-toolbar:has(#admin-user-search),
      .admin-toolbar:has(#admin-log-search){
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
      }
      .permission-grid{
        grid-template-columns:minmax(260px,1.5fr) repeat(3,minmax(118px,.62fr))!important;
      }
    }

    @media(max-width:640px){
      .admin-toolbar:has(#admin-user-search),
      .admin-toolbar:has(#admin-log-search){
        grid-template-columns:1fr!important;
      }
    }
    /* OS_APPLE_HUBS_V1 */
    .os-hub-grid{
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:14px;
      align-items:stretch;
    }
    .settings-hub-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
    .os-hub-card{
      position:relative;
      min-height:158px;
      display:flex;
      flex-direction:column;
      justify-content:space-between;
      gap:22px;
      padding:20px;
      overflow:hidden;
      color:var(--text);
      text-decoration:none;
      border:1px solid color-mix(in srgb,var(--border) 82%,transparent);
      border-radius:24px;
      background:color-mix(in srgb,var(--card) 78%,transparent);
      -webkit-backdrop-filter:blur(22px) saturate(150%);
      backdrop-filter:blur(22px) saturate(150%);
      box-shadow:0 10px 30px rgba(0,0,0,.055),inset 0 1px 0 color-mix(in srgb,#fff 24%,transparent);
      transform:translateZ(0);
      transition:transform 180ms cubic-bezier(.2,.8,.2,1),border-color 180ms ease,box-shadow 180ms ease,background 180ms ease;
      -webkit-tap-highlight-color:transparent;
    }
    .os-hub-card::after{
      content:"";
      position:absolute;
      inset:auto -50px -72px auto;
      width:150px;
      height:150px;
      border-radius:50%;
      background:color-mix(in srgb,var(--primary) 8%,transparent);
      filter:blur(4px);
      pointer-events:none;
    }
    .os-hub-card:hover{
      transform:translateY(-2px);
      border-color:color-mix(in srgb,var(--primary) 30%,var(--border));
      box-shadow:0 16px 38px rgba(0,0,0,.085),inset 0 1px 0 color-mix(in srgb,#fff 28%,transparent);
    }
    .os-hub-card:active{
      transform:scale(.985);
      transition-duration:80ms;
    }
    .os-hub-card:focus-visible{
      outline:none;
      border-color:var(--primary);
      box-shadow:0 0 0 4px color-mix(in srgb,var(--primary) 16%,transparent),0 16px 38px rgba(0,0,0,.08);
    }
    .os-hub-card.is-featured{
      grid-column:span 2;
      min-height:184px;
      background:
        radial-gradient(circle at 88% 18%,color-mix(in srgb,var(--primary) 20%,transparent),transparent 34%),
        linear-gradient(135deg,color-mix(in srgb,var(--primary) 11%,var(--card)),color-mix(in srgb,var(--card) 86%,transparent));
    }
    .settings-hub-grid .os-hub-card.is-featured{grid-column:span 2}
    .os-hub-card-top{
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap:12px;
    }
    .os-hub-icon{
      width:46px;
      height:46px;
      display:grid;
      place-items:center;
      flex:0 0 auto;
      border-radius:15px;
      color:var(--primary);
      background:color-mix(in srgb,var(--primary) 13%,var(--surface-soft));
      box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 11%,var(--border));
    }
    .os-hub-icon svg{width:23px;height:23px}
    .is-featured .os-hub-icon{
      width:52px;
      height:52px;
      border-radius:17px;
      color:var(--primary-ink);
      background:var(--primary);
      box-shadow:0 8px 20px color-mix(in srgb,var(--primary) 22%,transparent);
    }
    .os-hub-arrow{
      width:32px;
      height:32px;
      display:grid;
      place-items:center;
      border-radius:50%;
      color:var(--muted);
      background:color-mix(in srgb,var(--surface-soft) 88%,transparent);
      font-size:24px;
      font-weight:500;
      line-height:1;
      transition:transform 160ms ease,color 160ms ease,background 160ms ease;
    }
    .os-hub-card:hover .os-hub-arrow{
      transform:translateX(2px);
      color:var(--primary);
      background:color-mix(in srgb,var(--primary) 10%,var(--surface-soft));
    }
    .os-hub-card-copy{position:relative;z-index:1}
    .os-hub-card-title-row{
      display:flex;
      align-items:center;
      flex-wrap:wrap;
      gap:8px 10px;
    }
    .os-hub-card h2{
      margin:0;
      font-size:22px;
      line-height:1.15;
      letter-spacing:-.025em;
    }
    .os-hub-card small{
      display:inline-flex;
      align-items:center;
      min-height:24px;
      padding:0 9px;
      border-radius:999px;
      color:var(--muted);
      background:color-mix(in srgb,var(--surface-soft) 90%,transparent);
      font-size:11px;
      font-weight:760;
    }
    .os-hub-card p{
      max-width:620px;
      margin:9px 0 0;
      color:var(--muted);
      font-size:14px;
      line-height:1.55;
    }

    .settings-general-card{
      display:grid;
      gap:22px;
      padding:24px;
      border-radius:24px;
    }
    .settings-general-heading{
      display:grid;
      grid-template-columns:auto minmax(0,1fr);
      gap:15px;
      align-items:start;
    }
    .settings-general-heading h2{
      margin:3px 0 7px;
      font-size:24px;
      letter-spacing:-.025em;
    }
    .settings-general-heading p{
      max-width:760px;
      margin:0;
      color:var(--muted);
      line-height:1.6;
    }
    .settings-general-list{
      display:grid;
      border:1px solid var(--border);
      border-radius:18px;
      overflow:hidden;
      background:color-mix(in srgb,var(--surface-soft) 62%,transparent);
    }
    .settings-general-list>a{
      display:grid;
      grid-template-columns:auto minmax(0,1fr) auto;
      gap:13px;
      align-items:center;
      min-height:72px;
      padding:11px 14px;
      color:var(--text);
      text-decoration:none;
      border-top:1px solid var(--border);
      transition:background 130ms ease,transform 90ms ease;
    }
    .settings-general-list>a:first-child{border-top:0}
    .settings-general-list>a:hover{background:color-mix(in srgb,var(--primary) 6%,var(--surface-soft))}
    .settings-general-list>a:active{transform:scale(.995)}
    .settings-general-list .os-hub-icon{
      width:38px;
      height:38px;
      border-radius:12px;
    }
    .settings-general-list .os-hub-icon svg{width:19px;height:19px}
    .settings-general-list span strong,
    .settings-general-list span small{display:block}
    .settings-general-list span strong{font-size:15px}
    .settings-general-list span small{margin-top:3px;color:var(--muted);font-size:12px}
    .settings-general-list b{color:var(--muted);font-size:22px;font-weight:500}
    .settings-general-note{
      margin-top:14px;
      padding:18px 20px;
      border-radius:20px;
      background:color-mix(in srgb,var(--surface-soft) 58%,var(--card));
    }
    .settings-general-note p{margin:7px 0 0;color:var(--muted);line-height:1.55}

    @media(max-width:1080px){
      .settings-hub-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
    }
    @media(max-width:720px){
      .os-hub-grid,.settings-hub-grid{grid-template-columns:1fr}
      .os-hub-card.is-featured,.settings-hub-grid .os-hub-card.is-featured{grid-column:auto}
      .os-hub-card{min-height:146px;border-radius:21px}
      .settings-general-card{padding:18px}
    }
    @media(prefers-reduced-motion:reduce){
      .os-hub-card,.os-hub-arrow,.settings-general-list>a{transition:none!important}
      .os-hub-card:hover,.os-hub-card:active,.settings-general-list>a:active{transform:none!important}
    }
    @media(prefers-reduced-transparency:reduce){
      .os-hub-card{
        background:var(--card)!important;
        -webkit-backdrop-filter:none!important;
        backdrop-filter:none!important;
      }
    }
    @media(prefers-contrast:more){
      .os-hub-card,.settings-general-list{border-color:var(--text)}
      .os-hub-card small{color:var(--text)}
    }
    /* DASHBOARD_APPLE_V2 */
    .os-main:has(.dashboard-welcome) .os-hero{margin-bottom:18px}
    .os-main:has(.dashboard-welcome) .os-hero h1{font-size:clamp(38px,4.6vw,58px)}

    .dashboard-welcome{
      position:relative;
      display:grid;
      grid-template-columns:minmax(0,1fr) minmax(220px,300px);
      gap:18px;
      min-height:250px;
      padding:28px;
      overflow:hidden;
      border:1px solid color-mix(in srgb,var(--primary) 17%,var(--border));
      border-radius:28px;
      background:
        radial-gradient(circle at 86% 12%,color-mix(in srgb,var(--primary) 25%,transparent),transparent 34%),
        radial-gradient(circle at 18% 120%,color-mix(in srgb,#af52de 16%,transparent),transparent 38%),
        color-mix(in srgb,var(--card) 82%,transparent);
      -webkit-backdrop-filter:blur(24px) saturate(160%);
      backdrop-filter:blur(24px) saturate(160%);
      box-shadow:0 18px 44px rgba(0,0,0,.075),inset 0 1px 0 color-mix(in srgb,#fff 28%,transparent);
    }
    .dashboard-welcome::after{
      content:"";
      position:absolute;
      right:-90px;
      bottom:-130px;
      width:310px;
      height:310px;
      border-radius:50%;
      background:linear-gradient(135deg,color-mix(in srgb,var(--primary) 18%,transparent),color-mix(in srgb,#af52de 16%,transparent));
      filter:blur(8px);
      pointer-events:none;
    }
    .dashboard-welcome-copy{position:relative;z-index:1;align-self:center}
    .dashboard-eyebrow{
      display:inline-flex;
      align-items:center;
      min-height:28px;
      padding:0 11px;
      border-radius:999px;
      color:var(--primary);
      background:color-mix(in srgb,var(--primary) 11%,var(--surface-soft));
      font-size:12px;
      font-weight:780;
    }
    .dashboard-welcome h2{
      margin:14px 0 9px;
      font-size:clamp(34px,4.2vw,52px);
      line-height:1.02;
      letter-spacing:-.04em;
    }
    .dashboard-welcome p{
      max-width:760px;
      margin:0;
      color:var(--muted);
      font-size:15px;
      line-height:1.62;
    }
    .dashboard-welcome-actions{
      display:flex;
      flex-wrap:wrap;
      gap:9px;
      margin-top:22px;
    }
    .dashboard-primary-action,.dashboard-secondary-action{
      min-height:42px;
      display:inline-flex;
      align-items:center;
      gap:10px;
      padding:0 15px;
      border-radius:13px;
      color:var(--text);
      text-decoration:none;
      font-size:13px;
      font-weight:760;
      transition:transform 90ms ease,background 150ms ease,border-color 150ms ease;
      -webkit-tap-highlight-color:transparent;
    }
    .dashboard-primary-action{
      color:var(--primary-ink);
      background:var(--primary);
      box-shadow:0 8px 20px color-mix(in srgb,var(--primary) 22%,transparent);
    }
    .dashboard-secondary-action{
      border:1px solid var(--border);
      background:color-mix(in srgb,var(--surface-soft) 74%,transparent);
    }
    .dashboard-primary-action:active,.dashboard-secondary-action:active{transform:scale(.975)}
    .dashboard-primary-action span,.dashboard-secondary-action span{font-size:18px;line-height:1}

    .dashboard-today-card{
      position:relative;
      z-index:1;
      align-self:stretch;
      display:grid;
      grid-template-columns:auto minmax(0,1fr);
      gap:13px;
      align-content:end;
      min-height:170px;
      padding:18px;
      border:1px solid color-mix(in srgb,var(--border) 82%,transparent);
      border-radius:22px;
      background:color-mix(in srgb,var(--surface-soft) 66%,transparent);
      -webkit-backdrop-filter:blur(18px) saturate(145%);
      backdrop-filter:blur(18px) saturate(145%);
      box-shadow:inset 0 1px 0 color-mix(in srgb,#fff 20%,transparent);
    }
    .dashboard-icon{
      width:42px;
      height:42px;
      display:grid;
      place-items:center;
      flex:0 0 auto;
      border-radius:14px;
      color:var(--primary);
      background:color-mix(in srgb,var(--primary) 12%,var(--surface-soft));
      box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 10%,var(--border));
    }
    .dashboard-icon svg{width:21px;height:21px}
    .dashboard-today-card small,.dashboard-today-card strong,.dashboard-today-card span{display:block}
    .dashboard-today-card small{color:var(--muted);font-size:11px;font-weight:750}
    .dashboard-today-card strong{margin-top:3px;font-size:32px;line-height:1;letter-spacing:-.04em}
    .dashboard-today-card span{margin-top:7px;color:var(--muted);font-size:12px}

    .dashboard-section{margin-top:18px}
    .dashboard-section-head{
      display:flex;
      justify-content:space-between;
      align-items:end;
      gap:14px;
      padding:0 3px;
      margin-bottom:11px;
    }
    .dashboard-section-head.compact{margin-bottom:14px;padding:0}
    .dashboard-section-head small{display:block;color:var(--primary);font-size:11px;font-weight:780}
    .dashboard-section-head h2{margin:3px 0 0;font-size:22px;letter-spacing:-.025em}
    .dashboard-section-head>span{color:var(--muted);font-size:12px}

    .dashboard-shortcuts{
      display:grid;
      grid-template-columns:repeat(3,minmax(0,1fr));
      gap:10px;
    }
    .dashboard-shortcut{
      min-height:100px;
      display:grid;
      grid-template-columns:auto minmax(0,1fr) auto;
      gap:12px;
      align-items:center;
      padding:14px;
      color:var(--text);
      text-decoration:none;
      border:1px solid var(--border);
      border-radius:19px;
      background:color-mix(in srgb,var(--card) 84%,transparent);
      box-shadow:0 6px 18px rgba(0,0,0,.035),inset 0 1px 0 color-mix(in srgb,#fff 20%,transparent);
      transition:transform 100ms ease,border-color 150ms ease,background 150ms ease;
      -webkit-tap-highlight-color:transparent;
    }
    .dashboard-shortcut:hover{
      border-color:color-mix(in srgb,var(--primary) 28%,var(--border));
      background:color-mix(in srgb,var(--primary) 4%,var(--card));
    }
    .dashboard-shortcut:active{transform:scale(.985)}
    .dashboard-shortcut span strong,.dashboard-shortcut span small{display:block}
    .dashboard-shortcut span strong{font-size:14px}
    .dashboard-shortcut span small{margin-top:4px;color:var(--muted);font-size:11px;line-height:1.4}
    .dashboard-shortcut b{color:var(--muted);font-size:20px;font-weight:500}

    .dashboard-split{
      display:grid;
      grid-template-columns:minmax(0,1.45fr) minmax(280px,.75fr);
      gap:14px;
      margin-top:18px;
    }
    .dashboard-module-card,.dashboard-session-card,.dashboard-activity-card{border-radius:24px}
    .dashboard-module-list{display:grid;gap:8px}
    .dashboard-module-list>a{
      display:grid;
      grid-template-columns:auto minmax(0,1fr) auto auto;
      gap:12px;
      align-items:center;
      min-height:72px;
      padding:10px 11px;
      color:var(--text);
      text-decoration:none;
      border-radius:15px;
      background:var(--surface-soft);
      transition:transform 90ms ease,background 150ms ease;
    }
    .dashboard-module-list>a:hover{background:color-mix(in srgb,var(--primary) 6%,var(--surface-soft))}
    .dashboard-module-list>a:active{transform:scale(.992)}
    .dashboard-module-list span strong,.dashboard-module-list span small{display:block}
    .dashboard-module-list span strong{font-size:14px}
    .dashboard-module-list span small{margin-top:3px;color:var(--muted);font-size:11px;line-height:1.4}
    .dashboard-module-list em{
      min-height:24px;
      display:inline-flex;
      align-items:center;
      padding:0 9px;
      border-radius:999px;
      color:var(--primary);
      background:color-mix(in srgb,var(--primary) 10%,var(--card));
      font-size:10px;
      font-style:normal;
      font-weight:780;
      white-space:nowrap;
    }
    .dashboard-module-list b{color:var(--muted);font-size:19px;font-weight:500}

    .dashboard-session-card{display:flex;flex-direction:column}
    .dashboard-session-facts{display:grid;gap:8px;flex:1}
    .dashboard-session-facts>div{
      display:grid;
      grid-template-columns:auto minmax(0,1fr);
      gap:11px;
      align-items:center;
      padding:10px;
      border-radius:15px;
      background:var(--surface-soft);
    }
    .dashboard-session-facts .dashboard-icon{width:38px;height:38px;border-radius:12px}
    .dashboard-session-facts .dashboard-icon svg{width:18px;height:18px}
    .dashboard-session-facts span small,.dashboard-session-facts span strong{display:block}
    .dashboard-session-facts span small{color:var(--muted);font-size:10px}
    .dashboard-session-facts span strong{margin-top:2px;font-size:13px}
    .dashboard-session-settings{
      min-height:42px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      margin-top:10px;
      padding:0 13px;
      border-radius:13px;
      color:var(--text);
      text-decoration:none;
      background:color-mix(in srgb,var(--primary) 8%,var(--surface-soft));
      font-size:12px;
      font-weight:760;
    }

    .dashboard-activity-card{margin-top:14px}
    .dashboard-empty-activity{
      display:grid;
      place-items:center;
      min-height:170px;
      padding:22px;
      text-align:center;
      border:1px dashed color-mix(in srgb,var(--border) 82%,transparent);
      border-radius:18px;
      background:color-mix(in srgb,var(--surface-soft) 46%,transparent);
    }
    .dashboard-empty-activity>span{
      width:9px;
      height:9px;
      margin-bottom:10px;
      border-radius:50%;
      background:var(--primary);
      box-shadow:0 0 0 7px color-mix(in srgb,var(--primary) 10%,transparent);
    }
    .dashboard-empty-activity strong{font-size:15px}
    .dashboard-empty-activity p{max-width:680px;margin:7px 0 0;color:var(--muted);font-size:12px;line-height:1.55}
    .dashboard-empty-activity a{margin-top:12px;color:var(--primary);text-decoration:none;font-size:12px;font-weight:760}
    .dashboard-empty-activity b{font-size:16px}

    @media(max-width:1080px){
      .dashboard-shortcuts{grid-template-columns:repeat(2,minmax(0,1fr))}
      .dashboard-split{grid-template-columns:1fr}
    }
    @media(max-width:760px){
      .dashboard-welcome{grid-template-columns:1fr;padding:20px;border-radius:23px}
      .dashboard-today-card{min-height:120px}
      .dashboard-shortcuts{grid-template-columns:1fr}
      .dashboard-module-list>a{grid-template-columns:auto minmax(0,1fr) auto}
      .dashboard-module-list em{display:none}
    }
    @media(prefers-reduced-motion:reduce){
      .dashboard-primary-action,.dashboard-secondary-action,.dashboard-shortcut,.dashboard-module-list>a{transition:none!important}
      .dashboard-primary-action:active,.dashboard-secondary-action:active,.dashboard-shortcut:active,.dashboard-module-list>a:active{transform:none!important}
    }
    @media(prefers-reduced-transparency:reduce){
      .dashboard-welcome,.dashboard-today-card{background:var(--card)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
    }
    @media(prefers-contrast:more){
      .dashboard-welcome,.dashboard-shortcut,.dashboard-module-list>a,.dashboard-empty-activity{border-color:var(--text)}
    }</style>`;
}
__name(osStyles, "osStyles");

// studio/ui-shell.js
function osPage(t, links, pathname, ipInfo, cachedOsUserLabel = "") {
  const path = pathname;
  const zh = t === TEXT.zh;
  const copy = buildOsCopy(zh);
  const page = copy.pages[path] || copy.pages["/dashboard"];
  const activeSection = page.section;
  const adminPath = path.startsWith("/admin");
  const dashboardPath = path === "/dashboard";
  return `
<!DOCTYPE html>
<html>
<head>
  ${baseHead(page.title + " \xB7 " + t.studioName)}
  ${osStyles()}
  <script>
    (() => {
      try {
        const compactMedia = window.matchMedia("(max-width:1050px)");
        if (!compactMedia.matches) return;
        const state = sessionStorage.getItem("qssed-compact-view-v1");
        const currentPath = ${JSON.stringify(path)};
        const showContent = state === "content" || (state !== "menu" && currentPath !== "/dashboard");
        document.documentElement.classList.toggle("compact-content-view", showContent);
        document.documentElement.classList.toggle("compact-menu-view", !showContent);
      } catch {}
    })();
  <\/script>
</head>
<body class="os-shell" data-admin-path="${adminPath ? "true" : "false"}">
  ${topControls(links, t)}
  <div id="compact-back-zone" class="compact-back-zone">
    <button id="compact-back-button" class="compact-back-button" type="button" aria-label="${zh ? "\u8FD4\u56DE\u5BFC\u822A" : "Back to navigation"}">
      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
        <path d="M14.5 5.5 8 12l6.5 6.5"/>
      </svg>
    </button>
  </div>
  <div class="os-layout">
    <aside id="os-sidebar" class="os-sidebar">
      <a class="os-brand" href="${links.dashboard}">
        <span class="os-brand-mark">Q</span>
        <span>
          <strong>QssedA Studio</strong>
          <small>${copy.platform}</small>
        </span>
      </a>
      <div class="os-user">
        <strong>${t.account}</strong>
        <span id="os-user-name">${escapeHtmlText(cachedOsUserLabel)}</span>
        <button id="os-signout-button" class="os-signout-button" type="button">
          <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
            <path d="M10 5H6.8A1.8 1.8 0 0 0 5 6.8v10.4A1.8 1.8 0 0 0 6.8 19H10"/>
            <path d="M14.5 8.5 18 12l-3.5 3.5M18 12H9"/>
          </svg>
          <span id="os-signout-label">${zh ? "\u9000\u51FA\u767B\u5F55" : "Sign Out"}</span>
        </button>
      </div>
      ${renderOsNav(copy, activeSection, path)}
    </aside>
    <script>
      try {
        const sidebar = document.getElementById("os-sidebar");
        const sidebarKey = "qssed-sidebar-scroll-v1";
        const compactViewKey = "qssed-compact-view-v1";
        const compactMedia = window.matchMedia("(max-width:1050px)");
        const savedSidebarScroll = Number(sessionStorage.getItem(sidebarKey) || "0");
        if (sidebar && Number.isFinite(savedSidebarScroll)) {
          sidebar.scrollTop = savedSidebarScroll;
          requestAnimationFrame(() => { sidebar.scrollTop = savedSidebarScroll; });
          const saveSidebarScroll = () => {
            try { sessionStorage.setItem(sidebarKey, String(sidebar.scrollTop)); } catch {}
          };
          sidebar.addEventListener("scroll", saveSidebarScroll, { passive: true });
          sidebar.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
            saveSidebarScroll();
            if (compactMedia.matches) {
              try { sessionStorage.setItem(compactViewKey, "content"); } catch {}
            }
          }, { capture: true }));
        }
      } catch {}
    <\/script>

    <main class="os-main">
      <section class="os-hero">
        <div>
          ${dashboardPath ? `<p class="os-kicker">${copy.kicker}</p>` : ""}
          <h1>${page.title}</h1>
          ${page.description ? `<p>${page.description}</p>` : ""}
        </div>
        ${dashboardPath ? `<a class="os-ai" href="${copy.aiHref}">
          <span>${copy.aiLabel}</span>
          <strong>${copy.aiTitle}</strong>
        </a>` : ""}
      </section>

      <section id="admin-lock" class="os-lock" style="display:none;">
        <strong>${t.adminOnly}</strong>
        <p>${copy.adminLock}</p>
      </section>

      <section id="os-content"${adminPath ? ' style="visibility:hidden"' : ""}>
        ${renderOsContent(path, copy)}
      </section>
    </main>
  </div>

  ${supabaseScript()}
  ${path === "/settings/storage" ? storageClientScript(zh, links.login) : ""}
  ${auditClientScript(ipInfo)}
  ${profileClientScript()}
  ${adminClientScript(ipInfo)}
  <script>
    const loginUrl = ${JSON.stringify(links.login)};
    const isAdminPath = document.body.dataset.adminPath === "true";
    const compactViewKey = "qssed-compact-view-v1";
    const compactSidebarKey = "qssed-sidebar-scroll-v1";
    const compactMedia = window.matchMedia("(max-width:1050px)");

    function applyCompactViewMode() {
      if (!compactMedia.matches) {
        document.documentElement.classList.remove("compact-content-view", "compact-menu-view");
        return;
      }
      let state = null;
      try { state = sessionStorage.getItem(compactViewKey); } catch {}
      const showContent = state === "content" || (state !== "menu" && ${JSON.stringify(path)} !== "/dashboard");
      document.documentElement.classList.toggle("compact-content-view", showContent);
      document.documentElement.classList.toggle("compact-menu-view", !showContent);
    }

    function showCompactNavigation() {
      if (!compactMedia.matches) return;
      try { sessionStorage.setItem(compactViewKey, "menu"); } catch {}
      document.documentElement.classList.remove("compact-content-view");
      document.documentElement.classList.add("compact-menu-view");
      const sidebar = document.getElementById("os-sidebar");
      const saved = Number(sessionStorage.getItem(compactSidebarKey) || "0");
      requestAnimationFrame(() => {
        if (sidebar && Number.isFinite(saved)) sidebar.scrollTop = saved;
      });
    }

    document.getElementById("compact-back-button")?.addEventListener("click", showCompactNavigation);

    const signOutButton = document.getElementById("os-signout-button");
    const signOutLabel = document.getElementById("os-signout-label");

    async function signOutCurrentSession() {
      if (!signOutButton || signOutButton.disabled) return;

      const idleLabel = ${JSON.stringify(zh ? "\u9000\u51FA\u767B\u5F55" : "Sign Out")};
      signOutButton.disabled = true;
      if (signOutLabel) signOutLabel.textContent = ${JSON.stringify(zh ? "\u6B63\u5728\u9000\u51FA\u2026" : "Signing out\u2026")};

      try {
        const { error } = await supabaseClient.auth.signOut({ scope: "local" });
        if (error) throw error;
      } catch (error) {
        console.error("Sign out failed", error);
        if (signOutLabel) signOutLabel.textContent = ${JSON.stringify(zh ? "\u9000\u51FA\u5931\u8D25" : "Sign out failed")};
        window.setTimeout(() => {
          signOutButton.disabled = false;
          if (signOutLabel) signOutLabel.textContent = idleLabel;
        }, 1600);
        return;
      }

      try {
        document.cookie = "qssed-os-user-name=; Path=/; Max-Age=0; SameSite=Lax; Secure";
      } catch {}
      try { if (typeof clearProfileUiCaches === "function") clearProfileUiCaches(); } catch {}
      try { if (typeof clearAdminUiCaches === "function") clearAdminUiCaches(); } catch {}
      try {
        [
          "qssed-os-user-name",
          "qssed-sidebar-scroll-v1",
          "qssed-compact-view-v1"
        ].forEach(key => sessionStorage.removeItem(key));
      } catch {}

      window.location.replace(loginUrl);
    }

    signOutButton?.addEventListener("click", signOutCurrentSession);

    if (typeof compactMedia.addEventListener === "function") {
      compactMedia.addEventListener("change", applyCompactViewMode);
    } else if (typeof compactMedia.addListener === "function") {
      compactMedia.addListener(applyCompactViewMode);
    }

    async function restoreWarmAdminSnapshot() {
      if (!isAdminPath) return;
      try {
        const access = JSON.parse(sessionStorage.getItem("qssed-admin-access-v1") || "null");
        const snapshot = sessionStorage.getItem("qssed-admin-view-v1:" + location.pathname);
        if (!access?.user_id || !snapshot) return;

        const { data } = await supabaseClient.auth.getSession();
        const localUserId = data?.session?.user?.id || "";
        if (!localUserId || localUserId !== access.user_id) return;

        const content = document.getElementById("os-content");
        if (!content) return;
        content.innerHTML = snapshot;
        content.style.visibility = "visible";
      } catch {}
    }

    async function hydrateOsUser() {
      let data;
      let adminCheck = null;

      if (isAdminPath) {
        const [userResult, adminResult] = await Promise.all([
          supabaseClient.auth.getUser(),
          supabaseClient.rpc("is_admin")
        ]);
        data = userResult.data;
        adminCheck = adminResult;
      } else {
        const userResult = await supabaseClient.auth.getUser();
        data = userResult.data;
      }

      if (!data.user) {
        try {
          document.cookie = "qssed-os-user-name=; Path=/; Max-Age=0; SameSite=Lax; Secure";
          sessionStorage.removeItem("qssed-os-user-name");
        } catch {}
        try { if (typeof clearProfileUiCaches === "function") clearProfileUiCaches(); } catch {}
        try { if (typeof clearAdminUiCaches === "function") clearAdminUiCaches(); } catch {}
        window.location.href = loginUrl;
        return;
      }

      const name = data.user.user_metadata.username || data.user.user_metadata.display_name || data.user.email;
      const userLabel = "@" + name;
      document.getElementById("os-user-name").innerText = userLabel;
      try {
        document.cookie = "qssed-os-user-name=" + encodeURIComponent(userLabel) + "; Path=/; Max-Age=2592000; SameSite=Lax; Secure";
        sessionStorage.removeItem("qssed-os-user-name");
      } catch {}

      if (isAdminPath) {
        const allowed = !adminCheck?.error && adminCheck?.data === true;
        const lock = document.getElementById("admin-lock");
        const content = document.getElementById("os-content");
        lock.style.display = allowed ? "none" : "block";

        if (!allowed) {
          content.style.display = "none";
          content.style.visibility = "hidden";
          try { if (typeof clearAdminUiCaches === "function") clearAdminUiCaches(); } catch {}
          void updateCurrentDevice(data.user);
          return;
        }

        try {
          sessionStorage.setItem("qssed-admin-access-v1", JSON.stringify({ user_id: data.user.id }));
        } catch {}
        await hydrateAdminModule(data.user);
        content.style.display = "block";
        content.style.visibility = "visible";
        void updateCurrentDevice(data.user);
        return;
      }

      await updateCurrentDevice(data.user);
      await hydrateProfileSummary(data.user);
      await hydrateProfileHome(data.user);
      await hydrateProfileAudit(data.user);
    }

    void restoreWarmAdminSnapshot();
    hydrateOsUser();
  <\/script>
  ${themeScript()}
</body>
</html>
`;
}
__name(osPage, "osPage");
function buildOsCopy(zh) {
  const prefix = zh ? "/zh-cn" : "/en";
  if (zh) {
    return {
      platform: "\u4E2A\u4EBA AI \u77E5\u8BC6\u5DE5\u4F5C\u5E73\u53F0",
      kicker: "\u4E2A\u4EBA\u667A\u80FD\u5DE5\u4F5C\u53F0",
      aiLabel: "\u5DE5\u4F5C\u6D41",
      aiTitle: "\u5B9E\u9A8C\u4E0E\u5DE5\u5177\u5165\u53E3",
      aiHref: `${prefix}/workspace/experiments`,
      adminLock: "\u5F53\u524D\u8D26\u53F7\u6CA1\u6709\u7BA1\u7406\u6743\u9650\u3002\u7BA1\u7406\u529F\u80FD\u4EC5\u5BF9\u6388\u6743\u7BA1\u7406\u5458\u5F00\u653E\uFF1B\u5982\u8BA4\u4E3A\u6743\u9650\u5F02\u5E38\uFF0C\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\u786E\u8BA4\u8D26\u53F7\u89D2\u8272\u3002",
      nav: [
        { id: "dashboard", label: "\u9996\u9875", href: `${prefix}/dashboard`, items: [] },
        { id: "info", label: "\u4FE1\u606F\u4E2D\u5FC3", href: `${prefix}/info`, items: [
          ["\u77E5\u8BC6\u5E93", `${prefix}/info/knowledge`],
          ["\u6536\u85CF\u94FE\u63A5", `${prefix}/info/links`],
          ["\u7814\u7A76\u7B14\u8BB0", `${prefix}/info/notes`],
          ["\u5185\u5BB9\u6458\u8981", `${prefix}/info/summaries`],
          ["\u5168\u5C40\u641C\u7D22", `${prefix}/info/search`]
        ] },
        { id: "profile", label: "\u4E2A\u4EBA\u4E3B\u9875", href: `${prefix}/profile`, items: [
          ["\u7528\u6237\u8D44\u6599", `${prefix}/profile/details`],
          ["\u8D26\u6237\u4FE1\u606F", `${prefix}/profile/account`],
          ["\u504F\u597D\u8BBE\u7F6E", `${prefix}/profile/preferences`]
        ] },
        { id: "workspace", label: "\u5DE5\u4F5C\u533A", href: `${prefix}/workspace`, items: [
          ["\u5DE5\u4F5C\u53F0", `${prefix}/workspace/workbench`],
          ["\u9879\u76EE\u7BA1\u7406", `${prefix}/workspace/projects`],
          ["\u5B9E\u9A8C\u5BA4", `${prefix}/workspace/experiments`],
          ["\u8349\u7A3F\u7BB1", `${prefix}/workspace/drafts`],
          ["\u4EFB\u52A1\u4E2D\u5FC3", `${prefix}/workspace/tasks`]
        ] },
        { id: "admin", label: "\u7BA1\u7406", href: `${prefix}/admin`, items: [
          ["\u901A\u7528", `${prefix}/admin/general`],
          ["\u7528\u6237\u7BA1\u7406", `${prefix}/admin/users`],
          ["\u89D2\u8272\u6743\u9650", `${prefix}/admin/roles`],
          ["\u64CD\u4F5C\u65E5\u5FD7", `${prefix}/admin/logs`],
          ["\u7CFB\u7EDF\u72B6\u6001", `${prefix}/admin/system`]
        ] },
        { id: "settings", label: "\u8BBE\u7F6E", href: `${prefix}/settings`, items: [
          ["\u901A\u7528", `${prefix}/settings/general`],
          ["\u5916\u89C2", `${prefix}/settings/appearance`],
          ["\u8BED\u8A00", `${prefix}/settings/language`],
          ["\u8D26\u6237\u4E0E\u5B89\u5168", `${prefix}/settings/security`],
          ["\u901A\u77E5", `${prefix}/settings/notifications`],
          ["AI \u8BBE\u7F6E", `${prefix}/settings/ai`],
          ["\u7B2C\u4E09\u65B9\u96C6\u6210", `${prefix}/settings/integrations`],
          ["\u5B58\u50A8\u7BA1\u7406", `${prefix}/settings/storage`]
        ] }
      ],
      pages: buildOsPages(true)
    };
  }
  return {
    platform: "Personal AI Knowledge Platform",
    kicker: "Personal Intelligence Workspace",
    aiLabel: "Workflow",
    aiTitle: "Experiments & tools",
    aiHref: `${prefix}/workspace/experiments`,
    adminLock: "This account does not have management access. Administrative tools are available only to authorized administrators. If this seems incorrect, contact an administrator to verify your role.",
    nav: [
      { id: "dashboard", label: "Dashboard", href: `${prefix}/dashboard`, items: [] },
      { id: "info", label: "Information", href: `${prefix}/info`, items: [
        ["Knowledge base", `${prefix}/info/knowledge`],
        ["Links", `${prefix}/info/links`],
        ["Notes", `${prefix}/info/notes`],
        ["Summaries", `${prefix}/info/summaries`],
        ["Search", `${prefix}/info/search`]
      ] },
      { id: "profile", label: "Profile", href: `${prefix}/profile`, items: [
        ["Profile Details", `${prefix}/profile/details`],
        ["Account", `${prefix}/profile/account`],
        ["Preferences", `${prefix}/profile/preferences`]
      ] },
      { id: "workspace", label: "Workspace", href: `${prefix}/workspace`, items: [
        ["Workbench", `${prefix}/workspace/workbench`],
        ["Projects", `${prefix}/workspace/projects`],
        ["Experiments", `${prefix}/workspace/experiments`],
        ["Drafts", `${prefix}/workspace/drafts`],
        ["Tasks", `${prefix}/workspace/tasks`]
      ] },
      { id: "admin", label: "Admin", href: `${prefix}/admin`, items: [
        ["General", `${prefix}/admin/general`],
        ["Users", `${prefix}/admin/users`],
        ["Roles", `${prefix}/admin/roles`],
        ["Logs", `${prefix}/admin/logs`],
        ["System", `${prefix}/admin/system`]
      ] },
      { id: "settings", label: "Settings", href: `${prefix}/settings`, items: [
        ["General", `${prefix}/settings/general`],
        ["Appearance", `${prefix}/settings/appearance`],
        ["Language", `${prefix}/settings/language`],
        ["Account & Security", `${prefix}/settings/security`],
        ["Notifications", `${prefix}/settings/notifications`],
        ["AI", `${prefix}/settings/ai`],
        ["Integrations", `${prefix}/settings/integrations`],
        ["Storage", `${prefix}/settings/storage`]
      ] }
    ],
    pages: buildOsPages(false)
  };
}
__name(buildOsCopy, "buildOsCopy");
function buildOsPages(zh) {
  const z = {
    dashboard: ["\u4EEA\u8868\u76D8", "\u6C47\u603B\u8D26\u53F7\u72B6\u6001\u4E0E\u6838\u5FC3\u6A21\u5757\uFF0C\u5FEB\u901F\u67E5\u770B\u5F53\u524D\u53EF\u7528\u529F\u80FD\u3002"],
    info: ["\u4FE1\u606F\u4E2D\u5FC3", "\u77E5\u8BC6\u6A21\u5757\u5C1A\u672A\u5EFA\u7ACB\u6301\u4E45\u5316\u6570\u636E\u8868\uFF1B\u5F53\u524D\u4EC5\u4FDD\u7559\u6E05\u6670\u7684\u6A21\u5757\u5165\u53E3\u3002"],
    knowledge: ["\u77E5\u8BC6\u5E93", "\u6574\u7406\u503C\u5F97\u957F\u671F\u4FDD\u7559\u7684\u77E5\u8BC6\u5185\u5BB9\uFF0C\u65B9\u4FBF\u6301\u7EED\u79EF\u7D2F\u3001\u67E5\u627E\u4E0E\u56DE\u987E\u3002"],
    links: ["\u6536\u85CF\u94FE\u63A5", "\u5C1A\u672A\u63A5\u5165\u6536\u85CF\u94FE\u63A5\u6570\u636E\u8868\u3002"],
    notes: ["\u7814\u7A76\u7B14\u8BB0", "\u5C1A\u672A\u63A5\u5165\u7B14\u8BB0\u5B58\u50A8\u4E0E Markdown \u4FDD\u5B58\u63A5\u53E3\u3002"],
    summaries: ["\u5185\u5BB9\u6458\u8981", "\u5C1A\u672A\u63A5\u5165\u6458\u8981\u6570\u636E\u6E90\u3002"],
    search: ["\u5168\u5C40\u641C\u7D22", "\u5C1A\u672A\u63A5\u5165\u8DE8\u6A21\u5757\u641C\u7D22\u7D22\u5F15\u3002"],
    profile: ["\u4E2A\u4EBA\u4E3B\u9875", ""],
    account: ["\u8D26\u6237\u4FE1\u606F", "\u8D26\u53F7 ID\u3001\u90AE\u7BB1\u3001\u521B\u5EFA\u65F6\u95F4\u3001\u6700\u8FD1\u767B\u5F55\u548C\u767B\u5F55\u8BB0\u5F55\u3002"],
    security: ["\u8D26\u6237\u4E0E\u5B89\u5168", "\u7BA1\u7406\u767B\u5F55\u8BBE\u5907\u3001\u767B\u5F55\u5386\u53F2\u4E0E\u8D26\u6237\u5B89\u5168\u8BB0\u5F55\u3002"],
    preferences: ["\u504F\u597D\u8BBE\u7F6E", "\u4E3B\u9898\u4E0E\u8BED\u8A00\u53EF\u76F4\u63A5\u5207\u6362\uFF1B\u5B57\u4F53\u548C\u901A\u77E5\u8BBE\u7F6E\u5C1A\u672A\u5B9E\u73B0\u3002"],
    workspace: ["\u5DE5\u4F5C\u533A", "\u5DE5\u4F5C\u533A\u603B\u89C8\uFF0C\u7528\u4E8E\u67E5\u770B\u5E76\u8FDB\u5165\u5DE5\u4F5C\u53F0\u3001\u9879\u76EE\u3001\u5B9E\u9A8C\u3001\u8349\u7A3F\u4E0E\u4EFB\u52A1\u3002"],
    workbench: ["\u5DE5\u4F5C\u53F0", "\u5DE5\u4F5C\u533A\u4E2D\u7684\u4E3B\u8981\u64CD\u4F5C\u754C\u9762\uFF0C\u7528\u4E8E\u96C6\u4E2D\u5904\u7406\u9879\u76EE\u3001\u8349\u7A3F\u3001\u5B9E\u9A8C\u4E0E\u4EFB\u52A1\u3002"],
    projects: ["\u9879\u76EE\u7BA1\u7406", "\u5C1A\u672A\u63A5\u5165\u9879\u76EE\u6570\u636E\u8868\u3002"],
    experiments: ["\u5B9E\u9A8C\u5BA4", "\u5B9E\u9A8C\u5DE5\u5177\u5C1A\u672A\u63A5\u5165\u6301\u4E45\u5316\u6570\u636E\u3002"],
    drafts: ["\u8349\u7A3F\u7BB1", "\u5C1A\u672A\u63A5\u5165\u8349\u7A3F\u6570\u636E\u8868\u3002"],
    tasks: ["\u4EFB\u52A1\u4E2D\u5FC3", "\u5C1A\u672A\u63A5\u5165\u4EFB\u52A1\u6570\u636E\u8868\u3002"],
    admin: ["\u7BA1\u7406", "\u663E\u793A\u771F\u5B9E\u7528\u6237\u4E0E\u7BA1\u7406\u5458\u6570\u91CF\u3001\u6700\u8FD1\u7528\u6237\u3001\u64CD\u4F5C\u65E5\u5FD7\u548C\u98CE\u9669\u4E8B\u4EF6\u3002"],
    users: ["\u7528\u6237\u7BA1\u7406", "\u7528\u6237\u5217\u8868\u3001\u6743\u9650\u7BA1\u7406\u548C\u5C01\u7981\u7BA1\u7406\u3002"],
    roles: ["\u89D2\u8272\u6743\u9650", "\u67E5\u770B\u7BA1\u7406\u5458\u3001\u7F16\u8F91\u8005\u4E0E\u666E\u901A\u6210\u5458\u7684\u6743\u9650\u8303\u56F4\uFF0C\u5E76\u7BA1\u7406\u89D2\u8272\u6388\u6743\u3002"],
    logs: ["\u64CD\u4F5C\u65E5\u5FD7", "\u67E5\u770B\u8D26\u6237\u4E0E\u7BA1\u7406\u64CD\u4F5C\u7684\u5BA1\u8BA1\u8BB0\u5F55\u3002"],
    system: ["\u7CFB\u7EDF\u72B6\u6001", "\u67E5\u770B\u7BA1\u7406\u529F\u80FD\u3001\u6570\u636E\u8BFB\u53D6\u4E0E\u5BA1\u8BA1\u80FD\u529B\u7684\u5F53\u524D\u72B6\u6001\u3002"],
    settings: ["\u8BBE\u7F6E", "\u96C6\u4E2D\u7BA1\u7406\u901A\u7528\u3001\u5916\u89C2\u3001\u8BED\u8A00\u3001\u8D26\u6237\u5B89\u5168\u3001\u901A\u77E5\u3001AI\u3001\u7B2C\u4E09\u65B9\u96C6\u6210\u548C\u5B58\u50A8\u7B49\u8BBE\u7F6E\u3002"],
    general: ["\u901A\u7528", "\u7BA1\u7406\u7F51\u7AD9\u7684\u57FA\u7840\u884C\u4E3A\u4E0E\u901A\u7528\u504F\u597D\u3002"],
    appearance: ["\u5916\u89C2", "\u5F53\u524D\u652F\u6301\u6D45\u8272\u4E0E\u6DF1\u8272\u4E3B\u9898\uFF0C\u53EF\u4F7F\u7528\u53F3\u4E0A\u89D2\u4E3B\u9898\u6309\u94AE\u5207\u6362\u3002"],
    language: ["\u8BED\u8A00", "\u8BBE\u7F6E\u7F51\u9875\u663E\u793A\u8BED\u8A00\uFF1B\u5F53\u524D\u652F\u6301\u4E2D\u6587\u4E0E English\u3002"],
    notifications: ["\u901A\u77E5", "\u7BA1\u7406\u63D0\u9192\u3001\u7AD9\u5185\u6D88\u606F\u4E0E\u5176\u4ED6\u901A\u77E5\u504F\u597D\u3002"],
    ai: ["AI \u8BBE\u7F6E", "\u5F53\u524D\u6CA1\u6709\u6D4F\u89C8\u5668\u7AEF API Key \u914D\u7F6E\u529F\u80FD\uFF1B\u654F\u611F\u5BC6\u94A5\u4E0D\u5E94\u4FDD\u5B58\u5728\u524D\u7AEF\u3002"],
    integrations: ["\u7B2C\u4E09\u65B9\u96C6\u6210", "\u5F53\u524D\u7AD9\u70B9\u8FD0\u884C\u4F9D\u8D56 Cloudflare \u4E0E Supabase\uFF1B\u6B64\u9875\u5C1A\u65E0\u7528\u6237\u7EA7\u96C6\u6210\u914D\u7F6E\u3002"],
    storage: ["\u5B58\u50A8\u7BA1\u7406", "\u7BA1\u7406\u4EC5\u5C5E\u4E8E\u5F53\u524D\u8D26\u53F7\u7684\u79C1\u4EBA Cloudflare R2 \u6587\u4EF6\u3002"]
  };
  const e = {
    dashboard: ["Dashboard", "Overview of your account status and core modules, with quick access to currently available features."],
    info: ["Information Center", "Persistent knowledge tables are not implemented yet; this area currently provides module entry points."],
    knowledge: ["Knowledge Base", "Organize knowledge worth keeping so it stays easy to build on, find, and revisit."],
    links: ["Saved Links", "No saved-links table is connected yet."],
    notes: ["Research Notes", "Note storage and Markdown persistence are not connected yet."],
    summaries: ["Summaries", "No summary data source is connected yet."],
    search: ["Global Search", "No cross-module search index is connected yet."],
    profile: ["Profile", ""],
    account: ["Account", "Account ID, email, creation time, last sign-in, and login records."],
    security: ["Account & Security", "Manage signed-in devices, login history, and account security records."],
    preferences: ["Preferences", "Theme and language can be switched now; font and notification preferences are not implemented."],
    workspace: ["Workspace", "An overview for entering the Workbench, projects, experiments, drafts, and tasks."],
    workbench: ["Workbench", "The main operating surface inside Workspace for projects, drafts, experiments, and tasks."],
    projects: ["Projects", "No projects table is connected yet."],
    experiments: ["Lab", "Experiment tools are not connected to persistent data yet."],
    drafts: ["Drafts", "No drafts table is connected yet."],
    tasks: ["Tasks", "No tasks table is connected yet."],
    admin: ["Admin", "Shows live user/admin counts, recent users, operation logs, and risk events."],
    users: ["User Management", "User list, permissions, and bans."],
    roles: ["Roles", "Review the access scope for administrators, editors, and members, and manage role permissions."],
    logs: ["Logs", "Review audit records for account and administrative actions."],
    system: ["System Status", "Review the current availability of management features, data access, and auditing capabilities."],
    settings: ["Settings", "Manage general, appearance, language, account security, notifications, AI, integrations, and storage settings."],
    general: ["General", "Manage the site's basic behavior and general preferences."],
    appearance: ["Appearance", "Light and dark themes are available through the theme button in the top-right corner."],
    language: ["Language", "Choose the site language; Chinese and English are currently supported."],
    notifications: ["Notifications", "Manage reminders, in-app messages, and other notification preferences."],
    ai: ["AI Settings", "There is no browser-side API-key configuration. Sensitive keys should not be stored in frontend code."],
    integrations: ["Integrations", "The site currently depends on Cloudflare and Supabase; user-configurable integrations are not implemented."],
    storage: ["Storage", "Manage private Cloudflare R2 files belonging only to your account."]
  };
  const s = zh ? z : e;
  return {
    "/dashboard": { section: "dashboard", title: s.dashboard[0], description: s.dashboard[1] },
    "/info": { section: "info", title: s.info[0], description: s.info[1] },
    "/info/knowledge": { section: "info", title: s.knowledge[0], description: s.knowledge[1] },
    "/info/links": { section: "info", title: s.links[0], description: s.links[1] },
    "/info/notes": { section: "info", title: s.notes[0], description: s.notes[1] },
    "/info/summaries": { section: "info", title: s.summaries[0], description: s.summaries[1] },
    "/info/search": { section: "info", title: s.search[0], description: s.search[1] },
    "/profile": { section: "profile", title: s.profile[0], description: s.profile[1] },
    "/profile/details": { section: "profile", title: zh ? "\u7528\u6237\u8D44\u6599" : "Profile Details", description: zh ? "\u67E5\u770B\u548C\u7EF4\u62A4\u5934\u50CF\u3001\u4E2A\u6027\u7B7E\u540D\u3001\u4E2A\u4EBA\u4ECB\u7ECD\u3001\u72B6\u6001\u3001\u5174\u8DA3\u4E0E\u4E3B\u9875\u80CC\u666F\u3002" : "View and maintain your photo, signature, bio, presence, interests, and profile background." },
    "/profile/account": { section: "profile", title: s.account[0], description: s.account[1] },
    "/profile/preferences": { section: "profile", title: s.preferences[0], description: s.preferences[1] },
    "/workspace": { section: "workspace", title: s.workspace[0], description: s.workspace[1] },
    "/workspace/workbench": { section: "workspace", title: zh ? "\u5DE5\u4F5C\u53F0" : "Workbench", description: zh ? "\u5DE5\u4F5C\u533A\u4E2D\u7684\u4E3B\u8981\u64CD\u4F5C\u754C\u9762\uFF0C\u7528\u4E8E\u96C6\u4E2D\u5904\u7406\u9879\u76EE\u3001\u5B9E\u9A8C\u3001\u8349\u7A3F\u4E0E\u4EFB\u52A1\u3002" : "The main operating surface inside Workspace for projects, experiments, drafts, and tasks." },
    "/workspace/projects": { section: "workspace", title: s.projects[0], description: s.projects[1] },
    "/workspace/experiments": { section: "workspace", title: s.experiments[0], description: s.experiments[1] },
    "/workspace/drafts": { section: "workspace", title: s.drafts[0], description: s.drafts[1] },
    "/workspace/tasks": { section: "workspace", title: s.tasks[0], description: s.tasks[1] },
    "/admin": { section: "admin", title: s.admin[0], description: s.admin[1] },
    "/admin/general": { section: "admin", title: zh ? "\u901A\u7528" : "General", description: zh ? "\u67E5\u770B\u7BA1\u7406\u533A\u57DF\u7684\u6838\u5FC3\u6982\u89C8\u3001\u8D26\u6237\u7EDF\u8BA1\u3001\u8FD1\u671F\u64CD\u4F5C\u4E0E\u98CE\u9669\u4FE1\u606F\u3002" : "Review the core admin overview, account metrics, recent operations, and risk information." },
    "/admin/users": { section: "admin", title: s.users[0], description: s.users[1] },
    "/admin/roles": { section: "admin", title: s.roles[0], description: s.roles[1] },
    "/admin/logs": { section: "admin", title: s.logs[0], description: s.logs[1] },
    "/admin/system": { section: "admin", title: s.system[0], description: s.system[1] },
    "/settings": { section: "settings", title: s.settings[0], description: s.settings[1] },
    "/settings/general": { section: "settings", title: zh ? "\u901A\u7528" : "General", description: zh ? "\u7BA1\u7406\u7F51\u7AD9\u7684\u57FA\u7840\u884C\u4E3A\u4E0E\u901A\u7528\u504F\u597D\u3002" : "Manage the site's basic behavior and general preferences." },
    "/settings/appearance": { section: "settings", title: s.appearance[0], description: s.appearance[1] },
    "/settings/language": { section: "settings", title: s.language[0], description: s.language[1] },
    "/settings/security": { section: "settings", title: s.security[0], description: s.security[1] },
    "/settings/notifications": { section: "settings", title: s.notifications[0], description: s.notifications[1] },
    "/settings/ai": { section: "settings", title: s.ai[0], description: s.ai[1] },
    "/settings/integrations": { section: "settings", title: s.integrations[0], description: s.integrations[1] },
    "/settings/storage": { section: "settings", title: s.storage[0], description: s.storage[1] }
  };
}
__name(buildOsPages, "buildOsPages");
function renderOsNav(copy, activeSection, currentPath = "") {
  return `
    <nav class="os-nav">
      ${copy.nav.map((group) => `
        <section class="os-nav-group ${group.id === activeSection ? "is-active" : ""}">
          <a class="os-nav-title" href="${group.href}">${group.label}</a>
          ${group.items.length ? `<div class="os-nav-items">
            ${group.items.map((item) => `<a href="${item[1]}"${item[1].endsWith(currentPath) ? ` aria-current="page"` : ""}>${item[0]}</a>`).join("")}
          </div>` : ""}
        </section>
      `).join("")}
    </nav>
  `;
}
__name(renderOsNav, "renderOsNav");
function renderOsContent(path, copy) {
  const zh = copy.platform.includes("\u4E2A\u4EBA");
  if (path === "/dashboard") return dashboardContent(zh);
  if (path.startsWith("/info")) return informationContent(path, zh, statusContent);
  if (path === "/profile") return profileHubContent(zh, osHubGrid);
  if (path.startsWith("/profile/")) return profileContent(path, zh);
  if (path.startsWith("/workspace")) return workspaceContent(path, zh, statusContent);
  if (path.startsWith("/admin")) return adminContent(path, zh);
  if (path.startsWith("/settings")) return settingsContent(path, zh);
  throw new Error("Unhandled OS path: " + path);
}
__name(renderOsContent, "renderOsContent");
function statusContent(zh, zhTitle, zhBody, enTitle, enBody) {
  return `<section class="os-card is-large"><h2>${zh ? zhTitle : enTitle}</h2><p>${zh ? zhBody : enBody}</p></section>`;
}
__name(statusContent, "statusContent");
function osHubIcon(name) {
  const icons = {
    profile: '<circle cx="12" cy="8" r="3.1"/><path d="M5.5 19c.9-3.2 3.2-5 6.5-5s5.6 1.8 6.5 5"/>',
    account: '<rect x="4" y="5" width="16" height="14" rx="3"/><path d="M8 9h8M8 13h5"/>',
    preferences: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9M8 4v6M16 14v6"/>',
    links: '<path d="M9.5 14.5l5-5M7.2 16.8l-1.3 1.3a3.2 3.2 0 01-4.5-4.5l3.4-3.4a3.2 3.2 0 014.5 0M16.8 7.2l1.3-1.3a3.2 3.2 0 014.5 4.5l-3.4 3.4a3.2 3.2 0 01-4.5 0"/>',
    storage: '<path d="M4 7.5C4 5.6 7.6 4 12 4s8 1.6 8 3.5S16.4 11 12 11 4 9.4 4 7.5z"/><path d="M4 7.5v4C4 13.4 7.6 15 12 15s8-1.6 8-3.5v-4M4 11.5v4C4 17.4 7.6 19 12 19s8-1.6 8-3.5v-4"/>',
    shield: '<path d="M12 3l7 3v5c0 4.4-2.6 7.8-7 10-4.4-2.2-7-5.6-7-10V6l7-3z"/><path d="M9.3 12l1.8 1.8 3.7-4"/>',
    general: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
    users: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.2"/><path d="M3.5 19c.7-3.4 2.7-5 5.5-5s4.8 1.6 5.5 5M14 15c2.8-.2 4.8 1.1 5.8 4"/>',
    roles: '<path d="M4 6h16v12H4z"/><path d="M8 10h8M8 14h5"/>',
    logs: '<path d="M6 4h12v16H6z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    system: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.8 1.8"/>',
    appearance: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 000 16z"/>',
    language: '<path d="M4 5h10M9 5c-.2 5-2.3 8.3-5 10M6 9c1.8 2.8 4 4.8 7 6M14 10h6M17 7v10M14 17h6"/>',
    notifications: '<path d="M6 16h12l-1.5-2V10a4.5 4.5 0 00-9 0v4L6 16z"/><path d="M10 19h4"/>',
    ai: '<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3zM18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15z"/>',
    integrations: '<path d="M8 8V5a3 3 0 016 0v3M16 16v3a3 3 0 01-6 0v-3M7 12h10"/>'
  };
  const body = icons[name] || icons.general;
  return `<span class="os-hub-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg></span>`;
}
__name(osHubIcon, "osHubIcon");
function osHubCard(item) {
  const classes = ["os-hub-card"];
  if (item.featured) classes.push("is-featured");
  if (item.tone) classes.push("tone-" + item.tone);
  return `<a class="${classes.join(" ")}" href="${item.href}">
    <div class="os-hub-card-top">
      ${osHubIcon(item.icon)}
      <span class="os-hub-arrow" aria-hidden="true">\u203A</span>
    </div>
    <div class="os-hub-card-copy">
      <div class="os-hub-card-title-row">
        <h2>${item.title}</h2>
        ${item.meta ? `<small>${item.meta}</small>` : ""}
      </div>
      <p>${item.description}</p>
    </div>
  </a>`;
}
__name(osHubCard, "osHubCard");
function osHubGrid(items, extraClass = "") {
  return `<section class="os-hub-grid ${extraClass}">${items.map(osHubCard).join("")}</section>`;
}
__name(osHubGrid, "osHubGrid");
function adminContent(path, zh) {
  if (path === "/admin") return adminHubContent(zh, osHubGrid);
  if (path.endsWith("/general")) return adminOverviewContent(zh);
  if (path.endsWith("/users")) return adminUsersContent(zh);
  if (path.endsWith("/roles")) return adminRolesContent(zh);
  if (path.endsWith("/logs")) return adminLogsContent(zh);
  if (path.endsWith("/system")) return adminSystemContent(zh);
  return adminOverviewContent(zh);
}
__name(adminContent, "adminContent");
function settingsContent(path, zh) {
  if (path === "/settings") return settingsHubContent(zh, osHubGrid);
  if (path.endsWith("/general")) return settingsGeneralContent(zh, osHubIcon);
  if (path.endsWith("/appearance")) return appearanceSettingsContent(zh);
  if (path.endsWith("/language")) return languageSettingsContent(zh);
  if (path.endsWith("/security")) return securityAuditContent(zh);
  if (path.endsWith("/notifications")) return statusContent(zh, "\u901A\u77E5", "\u901A\u77E5\u65B9\u5F0F\u3001\u63D0\u9192\u548C\u7AD9\u5185\u6D88\u606F\u504F\u597D\u5C06\u5728\u8FD9\u91CC\u7EDF\u4E00\u7BA1\u7406\u3002\u5F53\u524D\u5C1A\u672A\u63A5\u5165\u901A\u77E5\u670D\u52A1\u3002", "Notifications", "Notification methods, reminders, and in-app message preferences will be managed here. Notification delivery is not connected yet.");
  if (path.endsWith("/ai")) return statusContent(zh, "AI \u8BBE\u7F6E", "\u8FD9\u91CC\u5C06\u7528\u4E8E\u7BA1\u7406 AI Provider\u3001\u6A21\u578B\u4E0E\u4E2A\u4EBA AI \u504F\u597D\u3002\u5F53\u524D\u5C1A\u672A\u5F00\u653E\u7528\u6237\u7EA7 AI \u914D\u7F6E\u3002", "AI Settings", "Manage AI providers, models, and personal AI preferences here. User-level AI configuration is not available yet.");
  if (path.endsWith("/integrations")) return statusContent(zh, "\u7B2C\u4E09\u65B9\u96C6\u6210", "\u8FD9\u91CC\u5C06\u7528\u4E8E\u7BA1\u7406\u53EF\u8FDE\u63A5\u7684\u7B2C\u4E09\u65B9\u670D\u52A1\u4E0E\u8D26\u53F7\u6388\u6743\u3002\u5F53\u524D\u5C1A\u672A\u5F00\u653E\u7528\u6237\u7EA7\u96C6\u6210\u914D\u7F6E\u3002", "Integrations", "Manage connected third-party services and account authorizations here. User-level integrations are not available yet.");
  if (path.endsWith("/storage")) return storageSettingsContent(zh);
  return settingsFallbackContent(zh);
}
__name(settingsContent, "settingsContent");

// studio/auth-pages.js
function notFoundPage(t, links) {
  const zh = t === TEXT.zh;
  return `
<!DOCTYPE html>
<html>
<head>
  ${baseHead("404 \xB7 " + t.studioName)}
</head>
<body>
  ${topControls(links, t)}
  <div class="card">
    <h1 class="brand-title">404</h1>
    <p>${zh ? "\u6CA1\u6709\u627E\u5230\u8FD9\u4E2A\u9875\u9762\u3002" : "This page could not be found."}</p>
    <a class="button" href="${links.dashboard}">${zh ? "\u8FD4\u56DE\u9996\u9875" : "Back to dashboard"}</a>
    <a class="button secondary" href="${links.login}">${t.signIn}</a>
  </div>
  ${themeScript()}
</body>
</html>
`;
}
__name(notFoundPage, "notFoundPage");
function signUpPage(t, links, ipInfo) {
  const zh = t === TEXT.zh;
  const enforceChineseNameRules = ZH_COUNTRIES.includes(ipInfo?.country || "");
  const copy = zh ? {
    usernameHelp: "\u7528\u6237\u540D\u9700\u4FDD\u6301\u552F\u4E00\uFF0C\u4E14\u4E0D\u80FD\u5305\u542B Tianguo\u3001admin\u3001administrator\uFF0C\u6216\u4EFB\u4F55\u5305\u542B admin \u7684\u5927\u5C0F\u5199\u53D8\u4F53\u3002",
    usernameChecking: "\u6B63\u5728\u68C0\u67E5\u7528\u6237\u540D\u2026",
    usernameAvailable: "\u7528\u6237\u540D\u53EF\u7528",
    usernameTaken: "\u8FD9\u4E2A\u7528\u6237\u540D\u5DF2\u7ECF\u88AB\u4F7F\u7528\u3002",
    usernameReserved: "\u8FD9\u4E2A\u7528\u6237\u540D\u5C5E\u4E8E\u4FDD\u7559\u540D\u79F0\uFF0C\u8BF7\u66F4\u6362\u3002",
    usernameTooShort: "\u7528\u6237\u540D\u81F3\u5C11\u9700\u8981 3 \u4E2A\u5B57\u7B26\u3002",
    realNameTitle: "\u586B\u5199\u771F\u5B9E\u59D3\u540D",
    realNameHelpZhIp: "\u8BF7\u586B\u5199\u771F\u5B9E\u59D3\u540D\uFF1B\u59D3\u548C\u540D\u5747\u4F7F\u7528\u6C49\u5B57\uFF0C\u5E76\u5206\u522B\u9009\u62E9\u5BF9\u5E94\u5B57\u6570\u3002",
    realNameHelpInternational: "\u68C0\u6D4B\u5230\u975E\u4E2D\u6587\u5730\u533A\u7F51\u7EDC\uFF1A\u8BF7\u586B\u5199\u771F\u5B9E\u59D3\u540D\uFF0C\u4F46\u4E0D\u9650\u5236\u6C49\u5B57\u3001\u59D3\u6216\u540D\u7684\u5B57\u6570\u3002",
    surnameCount: "\u59D3\u662F\u51E0\u4E2A\u5B57",
    givenCount: "\u540D\u662F\u51E0\u4E2A\u5B57",
    oneChar: "1 \u4E2A\u5B57",
    twoChars: "2 \u4E2A\u5B57",
    invalidNameZhIp: "\u59D3\u540D\u5FC5\u987B\u5168\u90E8\u4E3A\u6C49\u5B57\uFF0C\u5E76\u4E0E\u6240\u9009\u5B57\u6570\u5B8C\u5168\u4E00\u81F4\u3002",
    invalidNameInternational: "\u59D3\u548C\u540D\u90FD\u5FC5\u987B\u586B\u5199\u3002",
    avatarTitle: "\u8BBE\u7F6E\u5934\u50CF",
    avatarHelp: "\u4F60\u53EF\u4EE5\u73B0\u5728\u9009\u62E9\u5934\u50CF\uFF0C\u4E5F\u53EF\u4EE5\u7A0D\u540E\u518D\u8BBE\u7F6E\u3002\u652F\u6301 JPG\u3001PNG\u3001WebP\uFF0C\u6700\u5927 5 MB\u3002",
    choosePhoto: "\u9009\u62E9\u7167\u7247",
    usePhoto: "\u4F7F\u7528\u8FD9\u5F20\u7167\u7247",
    later: "\u7A0D\u540E\u8BBE\u7F6E",
    invalidAvatar: "\u8BF7\u9009\u62E9 JPG\u3001PNG \u6216 WebP \u56FE\u7247\uFF0C\u4E14\u6587\u4EF6\u4E0D\u80FD\u8D85\u8FC7 5 MB\u3002",
    emailHelp: "\u8BF7\u786E\u4FDD\u90AE\u7BB1\u771F\u5B9E\u4E14\u53EF\u6B63\u5E38\u4F7F\u7528\u3002\u65E0\u6548\u6216\u65E0\u6CD5\u4F7F\u7528\u7684\u90AE\u7BB1\u53EF\u80FD\u5BFC\u81F4\u8D26\u53F7\u53D7\u5230\u9650\u5236\u6216\u5C01\u7981\u3002",
    invalidEmail: "\u8BF7\u8F93\u5165\u6709\u6548\u90AE\u7BB1",
    passwordTitle: "\u8BBE\u7F6E\u5BC6\u7801",
    passwordHelp: "\u5BC6\u7801\u9700\u8981\u6EE1\u8DB3\u4EE5\u4E0B\u6240\u6709\u8981\u6C42\u3002",
    passwordStrength: "\u5BC6\u7801\u5F3A\u5EA6",
    passwordLength: "\u81F3\u5C11 8 \u4E2A\u5B57\u7B26",
    passwordNumber: "\u81F3\u5C11 1 \u4E2A\u6570\u5B57",
    passwordUpper: "\u81F3\u5C11 1 \u4E2A\u5927\u5199\u5B57\u6BCD",
    passwordLower: "\u81F3\u5C11 1 \u4E2A\u5C0F\u5199\u5B57\u6BCD",
    passwordSpecial: "\u81F3\u5C11 1 \u4E2A\u7279\u6B8A\u5B57\u7B26",
    confirmPassword: "\u786E\u8BA4\u5BC6\u7801",
    confirmPasswordRequired: "\u8BF7\u518D\u6B21\u8F93\u5165\u5BC6\u7801\u4EE5\u786E\u8BA4\u3002",
    passwordMismatch: "\u4E24\u6B21\u8F93\u5165\u7684\u5BC6\u7801\u4E0D\u4E00\u81F4\uFF0C\u8BF7\u68C0\u67E5\u540E\u91CD\u65B0\u8F93\u5165\u3002",
    showPassword: "\u663E\u793A\u5BC6\u7801",
    hidePassword: "\u9690\u85CF\u5BC6\u7801",
    creating: "\u6B63\u5728\u521B\u5EFA\u8D26\u6237\u2026",
    avatarFailed: "\u8D26\u6237\u5DF2\u521B\u5EFA\uFF0C\u4F46\u5934\u50CF\u4FDD\u5B58\u5931\u8D25\uFF0C\u4F60\u53EF\u4EE5\u7A0D\u540E\u91CD\u65B0\u8BBE\u7F6E\u3002"
  } : {
    usernameHelp: "Your username must be unique and cannot contain Tianguo, admin, administrator, or any case variation that includes admin.",
    usernameChecking: "Checking username\u2026",
    usernameAvailable: "Username is available",
    usernameTaken: "This username is already in use.",
    usernameReserved: "This username is reserved. Choose another one.",
    usernameTooShort: "Username must contain at least 3 characters.",
    realNameTitle: "Enter your real name",
    realNameHelpZhIp: "Enter your real name in Chinese characters, then choose the exact length of your family and given names.",
    realNameHelpInternational: "Enter your real first and last name. No Chinese-character or 1\u20132 character restriction is applied for your region.",
    surnameCount: "Family-name length",
    givenCount: "Given-name length",
    oneChar: "1 character",
    twoChars: "2 characters",
    invalidNameZhIp: "Both name fields must contain only Chinese characters and exactly match the selected lengths.",
    invalidNameInternational: "First name and last name are both required.",
    avatarTitle: "Set a profile photo",
    avatarHelp: "Choose a profile photo now or set one later. JPG, PNG, and WebP up to 5 MB are supported.",
    choosePhoto: "Choose Photo",
    usePhoto: "Use This Photo",
    later: "Set Up Later",
    invalidAvatar: "Choose a JPG, PNG, or WebP image no larger than 5 MB.",
    emailHelp: "Use a real, working email address. Invalid or unusable addresses may result in account restrictions or suspension.",
    invalidEmail: "Enter a valid email address.",
    passwordTitle: "Set a password",
    passwordHelp: "Your password must meet all of the requirements below.",
    passwordStrength: "Password strength",
    passwordLength: "At least 8 characters",
    passwordNumber: "At least 1 number",
    passwordUpper: "At least 1 uppercase letter",
    passwordLower: "At least 1 lowercase letter",
    passwordSpecial: "At least 1 special character",
    confirmPassword: "Confirm password",
    confirmPasswordRequired: "Please enter your password again to confirm it.",
    passwordMismatch: "The passwords do not match. Please check and try again.",
    showPassword: "Show password",
    hidePassword: "Hide password",
    creating: "Creating account\u2026",
    avatarFailed: "Your account was created, but the profile photo could not be saved. You can set it later."
  };
  return `
<!DOCTYPE html>
<html>
<head>
  ${baseHead(t.studioName)}
  <style>
    .signup-help{display:block;margin:6px 0 2px;color:var(--quiet);font-size:13px;line-height:1.55}
    .signup-status{min-height:22px;margin-top:8px;font-size:13px;color:var(--muted)}
    .signup-status.is-good{color:#2f9b63}.signup-status.is-bad{color:var(--danger)}
    .signup-input-shell{position:relative;margin-top:12px}
    .signup-input-shell input{margin-top:0;padding-right:50px}
    .signup-validity{position:absolute;right:15px;top:50%;display:grid;place-items:center;width:24px;height:24px;transform:translateY(-50%);font-size:19px;font-weight:900;line-height:1;opacity:0;pointer-events:none;transition:opacity .15s ease,color .15s ease,transform .15s ease}
    .signup-validity.is-checking{opacity:1;color:var(--muted)}
    .signup-validity.is-good{opacity:1;color:#2f9b63;transform:translateY(-50%) scale(1.04)}
    .signup-validity.is-bad{opacity:1;color:var(--danger)}
    .name-count-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
    .name-count-group{padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft)}
    .name-count-group>span{display:block;margin-bottom:8px;color:var(--muted);font-size:13px;font-weight:700}
    .name-count-options{display:flex;gap:8px}
    .name-count-choice{flex:1;display:flex;align-items:center;gap:7px;padding:9px;border:1px solid var(--border);border-radius:var(--radius);background:var(--card);color:var(--text);font-size:13px;cursor:pointer}
    .name-count-choice input{width:auto;min-height:auto;margin:0}
    .avatar-shell{display:grid;place-items:center;gap:14px;margin:18px 0}
    .avatar-preview{width:112px;height:112px;border-radius:50%;overflow:hidden;display:grid;place-items:center;border:1px solid color-mix(in srgb,var(--border-strong) 80%,transparent);background:linear-gradient(145deg,var(--surface),var(--surface-soft));box-shadow:var(--shadow-soft)}
    .avatar-preview img{width:100%;height:100%;object-fit:cover;display:none}
    .avatar-preview svg{width:48px;height:48px;fill:none;stroke:var(--muted);stroke-width:1.6}
    .avatar-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%}
    .avatar-actions button{margin-top:0}
    .password-heading{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-top:8px}
    .password-heading strong{font-size:15px;color:var(--text)}
    .password-heading span{font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}
    .password-input-shell{position:relative;margin-top:12px}
    .password-input-shell input{margin-top:0;padding-right:54px}
    .password-toggle{position:absolute;right:8px;top:50%;transform:translateY(-50%);display:grid;place-items:center;width:40px;height:40px;min-height:0;margin:0;padding:0;border:0;border-radius:10px;background:transparent;color:var(--muted);box-shadow:none;cursor:pointer}
    .password-toggle:hover{background:var(--surface-soft);color:var(--text)}
    .password-toggle svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
    .password-toggle .eye-off{display:none}
    .password-toggle.is-visible .eye-open{display:none}
    .password-toggle.is-visible .eye-off{display:block}
    .confirm-password-block .password-input-shell input{padding-right:96px}
    .password-confirm-validity{right:52px}
    .confirm-password-block{margin-top:16px}
    .confirm-password-label{display:block;margin-bottom:6px;font-size:13px;font-weight:700;color:var(--text)}
    .password-meter{height:7px;margin-top:10px;border-radius:999px;background:var(--surface-soft);overflow:hidden;border:1px solid var(--border)}
    .password-meter span{display:block;width:0;height:100%;background:var(--primary);transition:width .18s ease,background .18s ease}
    .password-rules{display:grid;gap:7px;margin:12px 0 0;padding:0;list-style:none}
    .password-rules li{display:flex;align-items:center;gap:8px;color:var(--muted);font-size:13px}
    .password-rules li::before{content:"\u25CB";font-weight:900;color:var(--quiet)}
    .password-rules li.is-met{color:var(--text)}
    .password-rules li.is-met::before{content:"\u2713";color:#2f9b63}
    @media (max-width:560px){.name-count-grid,.avatar-actions{grid-template-columns:1fr}}

      /* APPLE_DESIGN_SYSTEM_V2_SIGNUP */
/* APPLE_DESIGN_SYSTEM_V2 \u2014 sign-up components */
.signup-help{margin:7px 0 3px;color:var(--muted);font-size:13px;line-height:1.5}
.signup-status{min-height:20px;margin-top:7px;font-size:13px}
.signup-status.is-good{color:var(--success)}.signup-status.is-bad{color:var(--danger)}
.signup-input-shell,.password-input-shell{margin-top:12px}
.signup-validity{right:14px;width:22px;height:22px;font-size:18px}
.signup-validity.is-good{color:var(--success);transform:translateY(-50%) scale(1)}
.name-count-grid{gap:10px}
.name-count-group{
  padding:12px;
  border:0;
  border-radius:15px;
  background:var(--fill);
  box-shadow:inset 0 0 0 1px var(--border);
}
.name-count-group>span{margin-bottom:9px;color:var(--muted);font-size:12px;font-weight:650}
.name-count-options{
  gap:4px;
  padding:3px;
  border-radius:11px;
  background:color-mix(in srgb,var(--surface-soft) 85%,transparent);
}
.name-count-choice{
  min-height:36px;
  justify-content:center;
  padding:7px 9px;
  border:0;
  border-radius:9px;
  background:transparent;
  font-size:13px;
  transition:background .14s ease,transform .1s ease;
}
.name-count-choice:has(input:checked){
  background:var(--surface);
  box-shadow:0 1px 4px rgba(0,0,0,.10);
}
.name-count-choice input{position:absolute;opacity:0;pointer-events:none}
.name-count-choice:active{transform:scale(.97)}
.avatar-shell{gap:13px;margin:20px 0 4px}
.avatar-preview{
  width:108px;height:108px;
  border:1px solid var(--border);
  background:var(--fill);
  box-shadow:0 12px 30px rgba(0,0,0,.10);
}
.avatar-actions{gap:8px}
.password-heading{margin-top:16px}
.password-heading strong{font-size:14px;font-weight:680}
.password-heading span{font-size:12px}
.password-toggle{
  right:6px;width:38px;height:38px;border-radius:10px;
  color:var(--muted);
  transition:background .12s ease,color .12s ease,transform .1s ease;
}
.password-toggle:hover{background:var(--secondary);color:var(--text)}
.password-toggle:active{transform:translateY(-50%) scale(.9)}
.confirm-password-block{margin-top:18px}
.confirm-password-label{margin-bottom:6px;font-size:13px;font-weight:650}
.password-meter{
  height:5px;margin-top:11px;border:0;background:var(--fill)
}
.password-meter span{border-radius:999px;transition:width .18s ease,background .18s ease}
.password-rules{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px 10px;margin-top:12px}
.password-rules li{gap:7px;font-size:12px;line-height:1.35}
.password-rules li::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--quiet)}
.password-rules li.is-met::before{content:"";background:var(--success);box-shadow:0 0 0 3px color-mix(in srgb,var(--success) 13%,transparent)}
#step-username,#step-name,#step-avatar,#step-birthday,#step-gender,#step-email,#step-password{transform-origin:50% 16%}
@media (max-width:560px){
  .password-rules{grid-template-columns:1fr}
  .name-count-grid,.avatar-actions{grid-template-columns:1fr}
}
</style>
</head>
<body>
  ${topControls(links, t)}
  <div class="card">
    <h1 class="brand-title">${t.studioName}</h1>

    <div id="step-username">
      <p>${t.chooseUsername}</p>
      <div class="signup-input-shell">
        <input id="username" type="text" placeholder="${t.usernamePlaceholder}" autocomplete="username" aria-describedby="username-status" aria-invalid="false">
        <span id="username-validity" class="signup-validity" aria-hidden="true"></span>
      </div>
      <div id="username-status" class="signup-status" role="status"></div>
      <button id="username-next-btn" disabled>${t.continue}</button>
      <a class="button secondary" href="${links.login}">${t.alreadyHaveAccount}</a>
    </div>

    <div id="step-name" style="display:none;">
      <p>${copy.realNameTitle}</p>
      <small class="signup-help">${enforceChineseNameRules ? copy.realNameHelpZhIp : copy.realNameHelpInternational}</small>

      <input id="first-name" type="text" ${enforceChineseNameRules ? 'maxlength="2"' : 'maxlength="80"'} placeholder="${t.firstNamePlaceholder}" autocomplete="${enforceChineseNameRules ? "family-name" : "given-name"}">
      ${enforceChineseNameRules ? `
      <div class="name-count-group">
        <span>${copy.surnameCount}</span>
        <div class="name-count-options">
          <label class="name-count-choice"><input type="radio" name="surname-length" value="1"><span>${copy.oneChar}</span></label>
          <label class="name-count-choice"><input type="radio" name="surname-length" value="2"><span>${copy.twoChars}</span></label>
        </div>
      </div>` : ""}

      <input id="last-name" type="text" ${enforceChineseNameRules ? 'maxlength="2"' : 'maxlength="80"'} placeholder="${t.lastNamePlaceholder}" autocomplete="${enforceChineseNameRules ? "given-name" : "family-name"}">
      ${enforceChineseNameRules ? `
      <div class="name-count-group">
        <span>${copy.givenCount}</span>
        <div class="name-count-options">
          <label class="name-count-choice"><input type="radio" name="given-name-length" value="1"><span>${copy.oneChar}</span></label>
          <label class="name-count-choice"><input type="radio" name="given-name-length" value="2"><span>${copy.twoChars}</span></label>
        </div>
      </div>` : ""}

      <div id="name-status" class="signup-status"></div>
      <button id="name-next-btn" disabled>${t.continue}</button>
    </div>

    <div id="step-avatar" style="display:none;">
      <p>${copy.avatarTitle}</p>
      <small class="signup-help">${copy.avatarHelp}</small>
      <div class="avatar-shell">
        <div class="avatar-preview">
          <svg id="avatar-placeholder" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 20c.8-4.2 3.3-6.3 7.5-6.3s6.7 2.1 7.5 6.3"/></svg>
          <img id="avatar-preview-image" alt="">
        </div>
        <input id="avatar-file" type="file" accept="image/jpeg,image/png,image/webp" style="display:none;">
        <div id="avatar-status" class="signup-status"></div>
        <div class="avatar-actions">
          <button id="avatar-choose-btn" type="button">${copy.choosePhoto}</button>
          <button id="avatar-later-btn" type="button" class="secondary">${copy.later}</button>
        </div>
        <button id="avatar-next-btn" type="button" disabled>${copy.usePhoto}</button>
      </div>
    </div>

    <div id="step-birthday" style="display:none;">
      <p>${t.enterBirthDate}</p>
      <div class="birthdate-grid">
        <select id="birth-year"><option value="">${t.birthYear}</option></select>
        <select id="birth-month"><option value="">${t.birthMonth}</option></select>
        <select id="birth-day"><option value="">${t.birthDay}</option></select>
      </div>
      <button id="birthday-next-btn" disabled>${t.continue}</button>
    </div>

    <div id="step-gender" style="display:none;">
      <p>${t.selectGender}</p>
      <label class="choice-row"><input type="radio" name="gender" value="male"><span>${t.male}</span></label>
      <label class="choice-row"><input type="radio" name="gender" value="female"><span>${t.female}</span></label>
      <label class="checkbox-row"><input id="hide-gender-on-profile" type="checkbox"><span>${t.hideGenderOnProfile}</span></label>
      <button id="gender-next-btn" disabled>${t.continue}</button>
    </div>

    <div id="step-email" style="display:none;">
      <p>${t.enterEmail}</p>
      <small class="signup-help">${copy.emailHelp}</small>
      <input id="email" type="email" placeholder="name@example.com" autocomplete="email">
      <div id="email-status" class="signup-status"></div>
      <button id="email-next-btn" disabled>${t.continue}</button>
    </div>

    <div id="step-password" style="display:none;">
      <p>${copy.passwordTitle}</p>
      <small class="signup-help">${copy.passwordHelp}</small>
      <div class="password-heading">
        <strong>${t.passwordPlaceholder}</strong>
        <span id="password-strength">${copy.passwordStrength}\uFF1A0%</span>
      </div>
      <div class="password-input-shell">
        <input id="password" type="password" placeholder="${t.passwordPlaceholder}" autocomplete="new-password">
        <button id="password-toggle" class="password-toggle" type="button" aria-label="${copy.showPassword}" title="${copy.showPassword}">
          <svg class="eye-open" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
          <svg class="eye-off" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 6.2A11 11 0 0 1 12 6c6.5 0 10 6 10 6a17.7 17.7 0 0 1-2.1 2.8"/><path d="M6.2 6.2C3.5 8 2 12 2 12s3.5 6 10 6c1.6 0 3-.4 4.2-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>
        </button>
      </div>
      <div class="password-meter"><span id="password-meter-fill"></span></div>
      <ul class="password-rules">
        <li id="password-rule-length">${copy.passwordLength}</li>
        <li id="password-rule-number">${copy.passwordNumber}</li>
        <li id="password-rule-upper">${copy.passwordUpper}</li>
        <li id="password-rule-lower">${copy.passwordLower}</li>
        <li id="password-rule-special">${copy.passwordSpecial}</li>
      </ul>
      <div class="confirm-password-block">
        <label class="confirm-password-label" for="confirm-password">${copy.confirmPassword}</label>
        <div class="password-input-shell">
          <input id="confirm-password" type="password" placeholder="${copy.confirmPassword}" autocomplete="new-password" aria-describedby="confirm-password-status" aria-invalid="false">
          <span id="confirm-password-validity" class="signup-validity password-confirm-validity" aria-hidden="true"></span>
          <button id="confirm-password-toggle" class="password-toggle" type="button" aria-label="${copy.showPassword}" title="${copy.showPassword}">
            <svg class="eye-open" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg class="eye-off" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 6.2A11 11 0 0 1 12 6c6.5 0 10 6 10 6a17.7 17.7 0 0 1-2.1 2.8"/><path d="M6.2 6.2C3.5 8 2 12 2 12s3.5 6 10 6c1.6 0 3-.4 4.2-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>
          </button>
        </div>
        <div id="confirm-password-status" class="signup-status" role="status"></div>
      </div>
      <button id="create-account-btn" disabled>${t.getStarted}</button>
    </div>

    <div id="message"></div>
    <div id="post-signup-actions" style="display:none;">
      <a class="button secondary" href="${links.login}">${t.alreadyHaveAccount}</a>
    </div>
  </div>

  ${supabaseScript()}
  ${auditClientScript(ipInfo)}

  <script>
    const adminEmails = ${JSON.stringify(ADMIN_EMAILS)};
    const enforceChineseNameRules = ${JSON.stringify(enforceChineseNameRules)};
    let username = "";
    let firstName = "";
    let lastName = "";
    let surnameLength = 0;
    let givenNameLength = 0;
    let birthDate = "";
    let gender = "";
    let hideGenderOnProfile = false;
    let userEmail = "";
    let avatarFile = null;
    let avatarPreviewUrl = "";
    let usernameCheckTimer = 0;
    let usernameCheckSequence = 0;
    let usernameIsAvailable = false;

    const message = document.getElementById("message");
    const postSignupActions = document.getElementById("post-signup-actions");

    function showStep(id) {
      ["step-username","step-name","step-avatar","step-birthday","step-gender","step-email","step-password"].forEach(step => {
        document.getElementById(step).style.display = "none";
      });
      document.getElementById(id).style.display = "block";
      message.innerText = "";
      postSignupActions.style.display = "none";
    }

    function setButtonState(button, enabled) {
      button.disabled = !enabled;
      button.style.opacity = enabled ? "1" : "0.45";
      button.style.cursor = enabled ? "pointer" : "not-allowed";
    }

    function setStatus(element, text, tone = "") {
      element.textContent = text || "";
      element.classList.remove("is-good", "is-bad");
      if (tone) element.classList.add(tone);
    }

    function usernameLocalReason(value) {
      const text = value.trim();
      const key = text.toLowerCase();
      if (!text) return "";
      if (text.length < 3) return "too_short";
      if (key.includes("tianguo")) return "reserved_tianguo";
      if (key.includes("admin")) return "reserved_admin";
      return "";
    }

    function usernameMessage(reason) {
      if (reason === "too_short") return ${JSON.stringify(copy.usernameTooShort)};
      if (reason === "reserved_tianguo" || reason === "reserved_admin") return ${JSON.stringify(copy.usernameReserved)};
      if (reason === "username_taken") return ${JSON.stringify(copy.usernameTaken)};
      return ${JSON.stringify(copy.usernameTaken)};
    }

    const usernameInput = document.getElementById("username");
    const usernameStatus = document.getElementById("username-status");
    const usernameValidity = document.getElementById("username-validity");
    const usernameNextBtn = document.getElementById("username-next-btn");

    function setUsernameValidity(state) {
      usernameValidity.classList.remove("is-checking", "is-good", "is-bad");
      usernameInput.setAttribute("aria-invalid", state === "bad" ? "true" : "false");
      if (state === "checking") {
        usernameValidity.textContent = "\u2026";
        usernameValidity.classList.add("is-checking");
      } else if (state === "good") {
        usernameValidity.textContent = "\u2713";
        usernameValidity.classList.add("is-good");
      } else if (state === "bad") {
        usernameValidity.textContent = "\xD7";
        usernameValidity.classList.add("is-bad");
      } else {
        usernameValidity.textContent = "";
      }
    }

    async function checkUsernameAvailability() {
      const value = usernameInput.value.trim();
      usernameIsAvailable = false;
      setButtonState(usernameNextBtn, false);

      if (!value) {
        setStatus(usernameStatus, "");
        setUsernameValidity("");
        return false;
      }

      const localReason = usernameLocalReason(value);
      if (localReason) {
        setStatus(usernameStatus, usernameMessage(localReason), "is-bad");
        setUsernameValidity("bad");
        return false;
      }

      const sequence = ++usernameCheckSequence;
      setStatus(usernameStatus, "");
      setUsernameValidity("checking");
      const { data, error } = await supabaseClient.rpc("check_registration_username", { p_username: value });
      if (sequence !== usernameCheckSequence) return false;
      if (error) {
        setStatus(usernameStatus, ${JSON.stringify(zh ? "\u6682\u65F6\u65E0\u6CD5\u68C0\u67E5\u7528\u6237\u540D\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002" : "Unable to check the username right now.")}, "is-bad");
        setUsernameValidity("bad");
        return false;
      }
      if (!data?.available) {
        setStatus(usernameStatus, usernameMessage(data?.reason || "username_taken"), "is-bad");
        setUsernameValidity("bad");
        return false;
      }
      usernameIsAvailable = true;
      setStatus(usernameStatus, "");
      setUsernameValidity("good");
      setButtonState(usernameNextBtn, true);
      return true;
    }

    usernameInput.addEventListener("input", () => {
      clearTimeout(usernameCheckTimer);
      usernameCheckSequence += 1;
      usernameIsAvailable = false;
      setButtonState(usernameNextBtn, false);

      const value = usernameInput.value.trim();
      if (!value) {
        setStatus(usernameStatus, "");
        setUsernameValidity("");
        return;
      }

      const reason = usernameLocalReason(value);
      if (reason) {
        setStatus(usernameStatus, usernameMessage(reason), "is-bad");
        setUsernameValidity("bad");
        return;
      }

      setStatus(usernameStatus, "");
      setUsernameValidity("checking");
      usernameCheckTimer = window.setTimeout(checkUsernameAvailability, 250);
    });

    usernameNextBtn.addEventListener("click", async () => {
      if (!usernameIsAvailable && !(await checkUsernameAvailability())) return;
      username = usernameInput.value.trim();
      showStep("step-name");
    });

    const firstNameInput = document.getElementById("first-name");
    const lastNameInput = document.getElementById("last-name");
    const surnameLengthInputs = document.querySelectorAll('input[name="surname-length"]');
    const givenNameLengthInputs = document.querySelectorAll('input[name="given-name-length"]');
    const nameStatus = document.getElementById("name-status");
    const nameNextBtn = document.getElementById("name-next-btn");

    function exactHanName(value, expectedLength) {
      const text = value.trim();
      return (expectedLength === 1 || expectedLength === 2) &&
        Array.from(text).length === expectedLength &&
        /^\\p{Script=Han}+$/u.test(text);
    }

    function updateNameButton() {
      let ready = false;

      if (enforceChineseNameRules) {
        surnameLength = Number(document.querySelector('input[name="surname-length"]:checked')?.value || 0);
        givenNameLength = Number(document.querySelector('input[name="given-name-length"]:checked')?.value || 0);
        ready = exactHanName(firstNameInput.value, surnameLength) && exactHanName(lastNameInput.value, givenNameLength);
      } else {
        surnameLength = 0;
        givenNameLength = 0;
        ready =
          firstNameInput.value.trim().length > 0 &&
          firstNameInput.value.trim().length <= 80 &&
          lastNameInput.value.trim().length > 0 &&
          lastNameInput.value.trim().length <= 80;
      }

      setButtonState(nameNextBtn, ready);
      const hasAny = firstNameInput.value.trim() || lastNameInput.value.trim() || surnameLength || givenNameLength;
      const invalidText = enforceChineseNameRules ? ${JSON.stringify(copy.invalidNameZhIp)} : ${JSON.stringify(copy.invalidNameInternational)};
      setStatus(nameStatus, hasAny && !ready ? invalidText : "", hasAny && !ready ? "is-bad" : "");
    }

    firstNameInput.addEventListener("input", updateNameButton);
    lastNameInput.addEventListener("input", updateNameButton);
    surnameLengthInputs.forEach(input => input.addEventListener("change", updateNameButton));
    givenNameLengthInputs.forEach(input => input.addEventListener("change", updateNameButton));

    nameNextBtn.addEventListener("click", () => {
      updateNameButton();
      if (nameNextBtn.disabled) return;
      firstName = firstNameInput.value.trim();
      lastName = lastNameInput.value.trim();
      showStep("step-avatar");
    });

    const avatarInput = document.getElementById("avatar-file");
    const avatarChooseBtn = document.getElementById("avatar-choose-btn");
    const avatarLaterBtn = document.getElementById("avatar-later-btn");
    const avatarNextBtn = document.getElementById("avatar-next-btn");
    const avatarPreview = document.getElementById("avatar-preview-image");
    const avatarPlaceholder = document.getElementById("avatar-placeholder");
    const avatarStatus = document.getElementById("avatar-status");

    avatarChooseBtn.addEventListener("click", () => avatarInput.click());

    avatarInput.addEventListener("change", () => {
      const file = avatarInput.files?.[0] || null;
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!file || !allowed.includes(file.type) || file.size > 5 * 1024 * 1024) {
        avatarFile = null;
        setButtonState(avatarNextBtn, false);
        setStatus(avatarStatus, ${JSON.stringify(copy.invalidAvatar)}, "is-bad");
        return;
      }

      avatarFile = file;
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
      avatarPreviewUrl = URL.createObjectURL(file);
      avatarPreview.src = avatarPreviewUrl;
      avatarPreview.style.display = "block";
      avatarPlaceholder.style.display = "none";
      setStatus(avatarStatus, file.name, "is-good");
      setButtonState(avatarNextBtn, true);
    });

    avatarNextBtn.addEventListener("click", () => {
      if (!avatarFile) return;
      showStep("step-birthday");
    });

    avatarLaterBtn.addEventListener("click", () => {
      avatarFile = null;
      avatarInput.value = "";
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
      avatarPreviewUrl = "";
      avatarPreview.removeAttribute("src");
      avatarPreview.style.display = "none";
      avatarPlaceholder.style.display = "block";
      showStep("step-birthday");
    });

    const birthYearInput = document.getElementById("birth-year");
    const birthMonthInput = document.getElementById("birth-month");
    const birthDayInput = document.getElementById("birth-day");
    const birthdayNextBtn = document.getElementById("birthday-next-btn");
    const currentYear = new Date().getFullYear();

    for (let year = currentYear; year >= 1900; year -= 1) {
      birthYearInput.insertAdjacentHTML("beforeend", '<option value="' + year + '">' + year + '</option>');
    }
    for (let month = 1; month <= 12; month += 1) {
      const value = String(month).padStart(2, "0");
      birthMonthInput.insertAdjacentHTML("beforeend", '<option value="' + value + '">' + month + '</option>');
    }

    function updateBirthDayOptions() {
      const selectedYear = Number(birthYearInput.value);
      const selectedMonth = Number(birthMonthInput.value);
      const previousDay = birthDayInput.value;
      const daysInMonth = selectedYear && selectedMonth ? new Date(selectedYear, selectedMonth, 0).getDate() : 31;
      birthDayInput.innerHTML = '<option value="">${t.birthDay}</option>';
      for (let day = 1; day <= daysInMonth; day += 1) {
        const value = String(day).padStart(2, "0");
        birthDayInput.insertAdjacentHTML("beforeend", '<option value="' + value + '">' + day + '</option>');
      }
      if (previousDay && Number(previousDay) <= daysInMonth) birthDayInput.value = previousDay;
    }

    function updateBirthDateButton() {
      setButtonState(birthdayNextBtn, Boolean(birthYearInput.value && birthMonthInput.value && birthDayInput.value));
    }

    birthYearInput.addEventListener("change", () => { updateBirthDayOptions(); updateBirthDateButton(); });
    birthMonthInput.addEventListener("change", () => { updateBirthDayOptions(); updateBirthDateButton(); });
    birthDayInput.addEventListener("change", updateBirthDateButton);

    birthdayNextBtn.addEventListener("click", () => {
      birthDate = birthYearInput.value + "-" + birthMonthInput.value + "-" + birthDayInput.value;
      showStep("step-gender");
    });

    const genderInputs = document.querySelectorAll('input[name="gender"]');
    const hideGenderOnProfileInput = document.getElementById("hide-gender-on-profile");
    const genderNextBtn = document.getElementById("gender-next-btn");
    function updateGenderButton() {
      setButtonState(genderNextBtn, Boolean(document.querySelector('input[name="gender"]:checked')));
    }
    genderInputs.forEach(input => input.addEventListener("change", updateGenderButton));
    genderNextBtn.addEventListener("click", () => {
      const selectedGender = document.querySelector('input[name="gender"]:checked');
      gender = selectedGender ? selectedGender.value : "";
      hideGenderOnProfile = hideGenderOnProfileInput.checked;
      showStep("step-email");
    });

    const emailInput = document.getElementById("email");
    const emailStatus = document.getElementById("email-status");
    const emailNextBtn = document.getElementById("email-next-btn");

    function emailValid(value) {
      return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value.trim());
    }

    emailInput.addEventListener("input", () => {
      const value = emailInput.value;
      const valid = emailValid(value);
      setButtonState(emailNextBtn, valid);
      setStatus(emailStatus, value && !valid ? ${JSON.stringify(copy.invalidEmail)} : "", value && !valid ? "is-bad" : "");
    });

    emailNextBtn.addEventListener("click", () => {
      if (!emailValid(emailInput.value)) return;
      userEmail = emailInput.value.trim();
      showStep("step-password");
    });

    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    const passwordToggle = document.getElementById("password-toggle");
    const confirmPasswordToggle = document.getElementById("confirm-password-toggle");
    const confirmPasswordValidity = document.getElementById("confirm-password-validity");
    const confirmPasswordStatus = document.getElementById("confirm-password-status");
    const showPasswordLabel = ${JSON.stringify(copy.showPassword)};
    const hidePasswordLabel = ${JSON.stringify(copy.hidePassword)};
    let passwordConfirmationValid = false;

    function wirePasswordToggle(button, input) {
      button.addEventListener("click", () => {
        const willShow = input.type === "password";
        input.type = willShow ? "text" : "password";
        button.classList.toggle("is-visible", willShow);
        const label = willShow ? hidePasswordLabel : showPasswordLabel;
        button.setAttribute("aria-label", label);
        button.setAttribute("title", label);
        input.focus({ preventScroll: true });
      });
    }

    function setConfirmPasswordValidity(state) {
      confirmPasswordValidity.classList.remove("is-good", "is-bad");
      confirmPasswordInput.setAttribute("aria-invalid", state === "bad" ? "true" : "false");
      if (state === "good") {
        confirmPasswordValidity.textContent = "\u2713";
        confirmPasswordValidity.classList.add("is-good");
      } else if (state === "bad") {
        confirmPasswordValidity.textContent = "\xD7";
        confirmPasswordValidity.classList.add("is-bad");
      } else {
        confirmPasswordValidity.textContent = "";
      }
    }

    wirePasswordToggle(passwordToggle, passwordInput);
    wirePasswordToggle(confirmPasswordToggle, confirmPasswordInput);
    const passwordStrength = document.getElementById("password-strength");
    const passwordMeterFill = document.getElementById("password-meter-fill");
    const createAccountBtn = document.getElementById("create-account-btn");

    const passwordRuleEls = {
      length: document.getElementById("password-rule-length"),
      number: document.getElementById("password-rule-number"),
      upper: document.getElementById("password-rule-upper"),
      lower: document.getElementById("password-rule-lower"),
      special: document.getElementById("password-rule-special")
    };

    function passwordChecks(value) {
      return {
        length: value.length >= 8,
        number: /\\d/.test(value),
        upper: /[A-Z]/.test(value),
        lower: /[a-z]/.test(value),
        special: /[^A-Za-z0-9\\s]/.test(value)
      };
    }

    function updatePasswordStrength() {
      const checks = passwordChecks(passwordInput.value);
      const passed = Object.values(checks).filter(Boolean).length;
      const percent = passed * 20;
      passwordStrength.textContent = ${JSON.stringify(copy.passwordStrength + "\uFF1A")} + percent + "%";
      passwordMeterFill.style.width = percent + "%";
      passwordMeterFill.style.background = percent === 100 ? "#2f9b63" : percent >= 60 ? "#d99a2b" : "var(--danger)";
      Object.entries(checks).forEach(([key, met]) => passwordRuleEls[key].classList.toggle("is-met", met));
      setButtonState(createAccountBtn, percent === 100 && passwordConfirmationValid);
    }

    passwordInput.addEventListener("input", () => {
      passwordConfirmationValid = false;
      setConfirmPasswordValidity("");
      setStatus(confirmPasswordStatus, "");
      updatePasswordStrength();
    });

    confirmPasswordInput.addEventListener("input", () => {
      passwordConfirmationValid = false;
      setConfirmPasswordValidity("");
      setStatus(confirmPasswordStatus, "");
      updatePasswordStrength();
    });

    confirmPasswordInput.addEventListener("blur", () => {
      const value = confirmPasswordInput.value;
      if (!value) {
        passwordConfirmationValid = false;
        setConfirmPasswordValidity("bad");
        setStatus(confirmPasswordStatus, ${JSON.stringify(copy.confirmPasswordRequired)}, "is-bad");
      } else if (value !== passwordInput.value) {
        passwordConfirmationValid = false;
        setConfirmPasswordValidity("bad");
        setStatus(confirmPasswordStatus, ${JSON.stringify(copy.passwordMismatch)}, "is-bad");
      } else {
        passwordConfirmationValid = true;
        setConfirmPasswordValidity("good");
        setStatus(confirmPasswordStatus, "");
      }
      updatePasswordStrength();
    });

    createAccountBtn.addEventListener("click", async () => {
      updatePasswordStrength();
      if (createAccountBtn.disabled) return;

      const originalLabel = createAccountBtn.textContent;
      createAccountBtn.disabled = true;
      createAccountBtn.textContent = ${JSON.stringify(copy.creating)};
      message.textContent = "";

      const form = new FormData();
      form.set("username", username);
      form.set("first_name", firstName);
      form.set("last_name", lastName);
      form.set("surname_length", String(surnameLength));
      form.set("given_name_length", String(givenNameLength));
      form.set("birth_date", birthDate);
      form.set("gender", gender);
      form.set("hide_gender_on_profile", String(hideGenderOnProfile));
      form.set("email", userEmail);
      form.set("password", passwordInput.value);
      if (avatarFile) form.set("avatar", avatarFile, avatarFile.name);

      try {
        const response = await fetch("/api/auth/signup", { method: "POST", body: form });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (payload?.field === "username") {
            showStep("step-username");
            setStatus(usernameStatus, usernameMessage(payload?.error || "username_taken"), "is-bad");
            setUsernameValidity("bad");
            usernameIsAvailable = false;
            setButtonState(usernameNextBtn, false);
          } else {
            message.textContent = payload?.error || ${JSON.stringify(zh ? "\u6CE8\u518C\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u586B\u5199\u5185\u5BB9\u3002" : "Registration failed. Check your details and try again.")};
          }
          return;
        }

        const randomEmail = adminEmails[Math.floor(Math.random() * adminEmails.length)];
        message.textContent = ${JSON.stringify(t.adminApprovalMessage + " ")} + randomEmail;
        if (payload?.avatar_status === "failed") {
          message.textContent += " " + ${JSON.stringify(copy.avatarFailed)};
        }
        postSignupActions.style.display = "block";
      } finally {
        createAccountBtn.textContent = originalLabel;
        updatePasswordStrength();
      }
    });

    setButtonState(usernameNextBtn, false);
    setButtonState(nameNextBtn, false);
    setButtonState(avatarNextBtn, false);
    updateBirthDayOptions();
    setButtonState(birthdayNextBtn, false);
    setButtonState(genderNextBtn, false);
    setButtonState(emailNextBtn, false);
    updatePasswordStrength();
  <\/script>
  ${themeScript()}
</body>
</html>
`;
}
__name(signUpPage, "signUpPage");
function loginPage(t, links, ipInfo) {
  return `
<!DOCTYPE html>
<html>
<head>
  ${baseHead(t.signIn)}
</head>
<body>
  ${topControls(links, t)}
  <div class="card">
    <h1>${t.signIn}</h1>
    <p id="login-description">${t.loginDescription}</p>

    <input id="email" type="email" placeholder="${t.emailPlaceholder}">
    <input id="password" type="password" placeholder="${t.passwordPlaceholder}">

    <button id="login-btn">${t.signIn}</button>
    <a id="signup-link" class="button secondary" href="${links.signUp}">
      ${t.dontHaveAccount}
    </a>

    <div id="message"></div>
  </div>

  ${supabaseScript()}
  ${auditClientScript(ipInfo)}

  <script>
    const dashboardUrl = ${JSON.stringify(links.dashboard)};
    const emptyCredentialsMessage = ${JSON.stringify(
    t === TEXT.zh ? "\u8BF7\u8F93\u5165\u90AE\u7BB1\u548C\u5BC6\u7801\u3002" : "Please enter email and password."
  )};
    const loginBtn = document.getElementById("login-btn");
    const message = document.getElementById("message");

    loginBtn.addEventListener("click", async () => {
      message.innerText = "";

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      if (!email || !password) {
        message.innerText = emptyCredentialsMessage;
        return;
      }

      const authResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          device_id: getAuditDeviceId()
        })
      });
      const authData = await authResponse.json().catch(() => ({}));

      if (!authResponse.ok) {
        message.innerText = authData.error_description || authData.msg || authData.error || "Login failed.";
        return;
      }

      const { error: sessionError } = await supabaseClient.auth.setSession({
        access_token: authData.access_token,
        refresh_token: authData.refresh_token
      });
      if (sessionError) {
        message.innerText = sessionError.message;
        return;
      }

      const loginName = authData.user?.user_metadata?.username || authData.user?.user_metadata?.display_name || authData.user?.email;
      if (loginName) {
        try {
          document.cookie = "qssed-os-user-name=" + encodeURIComponent("@" + loginName) + "; Path=/; Max-Age=2592000; SameSite=Lax; Secure";
        } catch {}
      }
      try { if (typeof clearProfileUiCaches === "function") clearProfileUiCaches(); } catch {}
      try {
        ["qssed-admin-overview-v1","qssed-admin-users-v1","qssed-admin-roles-v1","qssed-admin-logs-v1","qssed-admin-access-v1"].forEach(key => sessionStorage.removeItem(key));
        Object.keys(sessionStorage).filter(key => key.startsWith("qssed-admin-view-v1:")).forEach(key => sessionStorage.removeItem(key));
      } catch {}
      await updateCurrentDevice(authData.user);
      window.location.href = dashboardUrl;
    });

    async function redirectIfLoggedIn() {
      const { data } = await supabaseClient.auth.getUser();

      if (data.user) {
        const existingName = data.user.user_metadata.username || data.user.user_metadata.display_name || data.user.email;
        if (existingName) {
          try {
            document.cookie = "qssed-os-user-name=" + encodeURIComponent("@" + existingName) + "; Path=/; Max-Age=2592000; SameSite=Lax; Secure";
          } catch {}
        }
        window.location.href = dashboardUrl;
      }
    }

    redirectIfLoggedIn();
  <\/script>
  ${themeScript()}
</body>
</html>
`;
}
__name(loginPage, "loginPage");

// studio/entry.js
var entry_default = {
  async fetch(request, env) {
    const { pathname, locale, ipInfo } = getRouteInfo(request);
    if (pathname === "/api/auth/signup") {
      if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
      return handleRegistrationSignup(request, env, ipInfo);
    }
    if (pathname === "/api/auth/login") {
      if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
      return handlePasswordLogin(request, env, ipInfo);
    }
    if (pathname === "/auth/handoff") {
      if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
      return handleAuthHandoff(request, env, locale);
    }
    if (pathname === "/api/storage/files") {
      if (request.method !== "GET") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
      return handleStorageFiles(request, env);
    }
    if (pathname === "/api/storage/upload") {
      if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
      return handleStorageUpload(request, env);
    }
    if (pathname === "/api/storage/object") {
      if (request.method !== "GET" && request.method !== "DELETE") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
      return handleStorageObject(request, env);
    }
    const legacyTarget = LEGACY_REDIRECTS.get(pathname);
    if (legacyTarget) return localizedRedirect(request, locale, legacyTarget);
    const t = TEXT[locale];
    const links = buildLinks(locale, pathname);
    if (OS_PATHS.has(pathname)) {
      const cachedOsUserLabel = getRequestCookie(request, "qssed-os-user-name");
      return html(osPage(t, links, pathname, ipInfo, cachedOsUserLabel));
    }
    if (pathname === "/sign-up") return html(signUpPage(t, links, ipInfo));
    if (pathname === "/login") return html(loginPage(t, links, ipInfo));
    return html(notFoundPage(t, links), 404);
  }
};
export {
  entry_default as default
};
//# sourceMappingURL=worker.js.map
