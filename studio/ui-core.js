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

