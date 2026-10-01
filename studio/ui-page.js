import { SUPABASE_URL, SUPABASE_KEY, TEXT } from "./config.js";
import { FAVICON_LINKS } from "./favicon.js";
import { accountMenuClientScript, accountMenuMarkup, accountMenuStyles } from "./account-menu.js";
import { LOCALE_META } from "./locale.js";

export function baseHead(title) {
  return `
    <title>${title}</title>
    ${FAVICON_LINKS}
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <script>
      (function () {
        const MODE_KEY = "qssed-theme-mode";
        const RESOLVED_KEY = "qssed-theme";
        const ACCENT_KEY = "qssed-accent";
        const MODE_COOKIE = "qssed_theme_mode";
        const ACCENT_COOKIE = "qssed_accent";
        const VALID_MODES = new Set(["system","light","dark"]);
        const VALID_ACCENTS = new Set(["sapphire","aqua","jade","lime","amber","coral","rose","magenta","violet","graphite"]);
        const media = window.matchMedia("(prefers-color-scheme: light)");

        function preferenceDomain() {
          const host = String(location.hostname || "").toLowerCase();
          return ["qsseda.com","qsseda.online","qsseda.studio"].find(domain => host === domain || host.endsWith("." + domain)) || "";
        }
        function isRootPreferenceHost() {
          const host = String(location.hostname || "").toLowerCase();
          const domain = preferenceDomain();
          return Boolean(domain && host === domain);
        }
        function readCookieTheme() {
          const match = document.cookie.match(/(?:^|;\\s*)qssed_theme=(light|dark)(?:;|$)/);
          return match ? match[1] : "";
        }
        function resolvedTheme(mode) {
          if (mode === "light" || mode === "dark") return mode;
          return media.matches ? "light" : "dark";
        }
        function persistResolved(theme) {
          try { localStorage.setItem(RESOLVED_KEY, theme); } catch {}
          try {
            const domain = preferenceDomain();
            document.cookie = "qssed_theme=" + theme + "; Path=/; Max-Age=31536000; SameSite=Lax" + (domain ? "; Domain=." + domain : "");
          } catch {}
        }
        function persistMode(mode) {
          try {
            const domain = preferenceDomain();
            document.cookie = MODE_COOKIE + "=" + mode + "; Path=/; Max-Age=31536000; SameSite=Lax" + (domain ? "; Domain=." + domain : "");
          } catch {}
        }
        function persistAccent(accent) {
          try {
            const domain = preferenceDomain();
            document.cookie = ACCENT_COOKIE + "=" + accent + "; Path=/; Max-Age=31536000; SameSite=Lax" + (domain ? "; Domain=." + domain : "");
          } catch {}
        }
        function readMode() {
          const sharedMode = readCookieMode();
          if (VALID_MODES.has(sharedMode)) return sharedMode;
          try {
            const savedMode = localStorage.getItem(MODE_KEY);
            if (VALID_MODES.has(savedMode)) {
              if (isRootPreferenceHost()) persistMode(savedMode);
              return savedMode;
            }
          } catch {}
          return "system";
        }
        function readAccent() {
          const sharedAccent = readCookieAccent();
          if (VALID_ACCENTS.has(sharedAccent)) return sharedAccent;
          try {
            const saved = localStorage.getItem(ACCENT_KEY);
            if (VALID_ACCENTS.has(saved)) {
              if (isRootPreferenceHost()) persistAccent(saved);
              return saved;
            }
          } catch {}
          return "sapphire";
        }
        function setMode(mode, options = {}) {
          const nextMode = VALID_MODES.has(mode) ? mode : "system";
          const nextTheme = resolvedTheme(nextMode);
          document.documentElement.dataset.themeMode = nextMode;
          document.documentElement.dataset.theme = nextTheme;
          if (options.persist !== false) {
            try { localStorage.setItem(MODE_KEY, nextMode); } catch {}
            persistMode(nextMode);
          }
          persistResolved(nextTheme);
          if (options.announce !== false) {
            window.dispatchEvent(new CustomEvent("aertex-themechange",{detail:{mode:nextMode,theme:nextTheme,accent:readAccent()}}));
          }
          return nextTheme;
        }
        function setAccent(accent, options = {}) {
          const next = VALID_ACCENTS.has(accent) ? accent : "sapphire";
          document.documentElement.dataset.accent = next;
          if (options.persist !== false) {
            try { localStorage.setItem(ACCENT_KEY, next); } catch {}
            persistAccent(next);
          }
          if (options.announce !== false) {
            window.dispatchEvent(new CustomEvent("aertex-themechange",{detail:{mode:readMode(),theme:document.documentElement.dataset.theme || resolvedTheme(readMode()),accent:next}}));
          }
          return next;
        }

        const initialMode = readMode();
        const initialAccent = readAccent();
        setMode(initialMode,{persist:false,announce:false});
        setAccent(initialAccent,{persist:false,announce:false});

        media.addEventListener?.("change", () => {
          if (readMode() === "system") setMode("system",{persist:false});
        });

        window.AERTEXTheme = {
          setMode,
          setAccent,
          getMode: readMode,
          getAccent: readAccent,
          getResolvedTheme: () => document.documentElement.dataset.theme || resolvedTheme(readMode()),
          palette: Array.from(VALID_ACCENTS)
        };
      })();
    </script>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <style>
      :root{
        color-scheme:dark;
        --bg:#000000;
        --bg-soft:#0b0b0d;
        --surface:#1c1c1e;
        --surface-strong:#2c2c2e;
        --surface-soft:#242426;
        --card:#1c1c1e;
        --text:#f5f5f7;
        --muted:#a1a1a6;
        --quiet:#747477;
        --border:rgba(255,255,255,.10);
        --border-strong:rgba(255,255,255,.20);
        --hairline:rgba(255,255,255,.08);
        --primary:#0a84ff;
        --primary-hover:#409cff;
        --primary-ink:#ffffff;
        --secondary:rgba(118,118,128,.20);
        --secondary-hover:rgba(118,118,128,.30);
        --fill:rgba(118,118,128,.16);
        --glass:rgba(28,28,30,.72);
        --glass-heavy:rgba(22,22,24,.88);
        --success:#32d74b;
        --danger:#ff453a;
        --warning:#ffd60a;
        --shadow:0 28px 70px rgba(0,0,0,.34);
        --shadow-soft:0 10px 30px rgba(0,0,0,.16);
        --radius-sm:10px;
        --radius:14px;
        --radius-lg:24px;
        --press-scale:.975;
      }

      :root[data-theme="light"]{
        color-scheme:light;
        --bg:#f5f5f7;
        --bg-soft:#eeeeF0;
        --surface:#ffffff;
        --surface-strong:#f2f2f7;
        --surface-soft:#f2f2f7;
        --card:#ffffff;
        --text:#1d1d1f;
        --muted:#6e6e73;
        --quiet:#8e8e93;
        --border:rgba(60,60,67,.13);
        --border-strong:rgba(60,60,67,.24);
        --hairline:rgba(60,60,67,.11);
        --primary:#007aff;
        --primary-hover:#1687ff;
        --primary-ink:#ffffff;
        --secondary:rgba(118,118,128,.12);
        --secondary-hover:rgba(118,118,128,.20);
        --fill:rgba(118,118,128,.10);
        --glass:rgba(255,255,255,.76);
        --glass-heavy:rgba(247,247,249,.90);
        --success:#248a3d;
        --danger:#d70015;
        --warning:#9a6700;
        --shadow:0 28px 70px rgba(0,0,0,.12);
        --shadow-soft:0 10px 28px rgba(0,0,0,.07);
      }

      *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
      html{font-size:16px;background:var(--bg);font-optical-sizing:auto;text-rendering:optimizeLegibility}
      body{
        margin:0;
        min-height:100vh;
        padding:clamp(14px,2.4vw,28px);
        display:flex;
        align-items:center;
        justify-content:center;
        background:
          radial-gradient(900px 540px at 12% -8%,color-mix(in srgb,var(--primary) 8%,transparent),transparent 68%),
          var(--bg);
        color:var(--text);
        font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display","Segoe UI",system-ui,sans-serif;
        font-size:15px;
        line-height:1.5;
        letter-spacing:0;
      }
      body::before{display:none!important}

      ::selection{background:color-mix(in srgb,var(--primary) 28%,transparent)}
      :focus-visible{outline:3px solid color-mix(in srgb,var(--primary) 42%,transparent);outline-offset:2px}

      .card{
        width:100%;
        max-width:560px;
        padding:32px;
        position:relative;
        overflow:visible;
        border:1px solid var(--border);
        border-radius:var(--radius-lg);
        background:var(--glass);
        -webkit-backdrop-filter:blur(28px) saturate(170%);
        backdrop-filter:blur(28px) saturate(170%);
        box-shadow:var(--shadow);
        text-align:left;
        animation:materialize .28s cubic-bezier(.2,.8,.2,1) both;
      }
      .card::before{display:none!important}

      h1,h2,h3,.brand-title{color:var(--text);font-weight:700;text-wrap:balance}
      h1,.brand-title{margin:0 0 12px;font-size:clamp(34px,5vw,54px);line-height:1.04;letter-spacing:-.04em}
      h2{letter-spacing:-.025em}
      h3{letter-spacing:-.015em}
      p{margin:0;color:var(--muted);line-height:1.58}
      small{letter-spacing:.01em}

      input,select,textarea{
        width:100%;
        min-height:50px;
        margin-top:12px;
        padding:0 14px;
        border:0;
        border-radius:13px;
        background:var(--fill);
        color:var(--text);
        font:inherit;
        font-size:15px;
        outline:none;
        box-shadow:inset 0 0 0 1px var(--border);
        transition:background .14s ease,box-shadow .14s ease;
      }
      textarea{padding-top:12px;padding-bottom:12px;resize:vertical}
      input:hover,select:hover,textarea:hover{background:color-mix(in srgb,var(--fill) 82%,var(--surface) 18%)}
      input:focus,select:focus,textarea:focus{
        background:var(--surface);
        box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 16%,transparent),inset 0 0 0 1px var(--primary);
      }
      input::placeholder,textarea::placeholder{color:var(--quiet);opacity:1}

      button,a.button{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:8px;
        width:100%;
        min-height:50px;
        margin-top:14px;
        padding:0 16px;
        border:0;
        border-radius:13px;
        background:var(--primary);
        color:var(--primary-ink);
        font:inherit;
        font-size:15px;
        font-weight:650;
        text-decoration:none;
        cursor:pointer;
        box-shadow:none;
        touch-action:manipulation;
        transition:filter .12s ease,background .12s ease,transform 100ms ease-out,opacity .12s ease;
      }
      button:hover,a.button:hover{background:var(--primary);filter:brightness(1.06);box-shadow:none;transform:none}
      button:active,a.button:active{transform:scale(var(--press-scale));filter:brightness(.96)}
      button:disabled,a.button[aria-disabled="true"]{opacity:.42;cursor:not-allowed;filter:none;transform:none}
      .secondary{background:var(--secondary)!important;color:var(--text)!important}
      .secondary:hover{background:var(--secondary-hover)!important}

      #message{margin-top:14px;color:var(--primary);font-size:13px;line-height:1.5;overflow-wrap:anywhere}
      .checkbox-row{display:flex;align-items:center;gap:10px;margin-top:14px;color:var(--muted);font-size:14px}
      .checkbox-row input,.choice-row input{width:auto;min-height:auto;margin:0;accent-color:var(--primary)}
      .choice-row{
        display:flex;
        align-items:center;
        gap:10px;
        min-height:50px;
        margin-top:12px;
        padding:12px 14px;
        border:0;
        border-radius:14px;
        background:var(--fill);
        color:var(--text);
        box-shadow:inset 0 0 0 1px var(--border);
        transition:background .12s ease,transform 100ms ease-out;
      }
      .choice-row:hover{background:var(--secondary)}
      .choice-row:active{transform:scale(.99)}
      .birthdate-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
      .birthdate-grid select{margin-top:12px}

      .theme-toggle,.language-toggle{
        width:44px;
        height:44px;
        min-width:44px;
        min-height:44px;
        margin:0;
        padding:0;
        border:1px solid var(--border);
        border-radius:50%;
        background:var(--glass-heavy);
        color:var(--text);
        -webkit-backdrop-filter:blur(20px) saturate(170%);
        backdrop-filter:blur(20px) saturate(170%);
        box-shadow:0 8px 24px rgba(0,0,0,.10),inset 0 1px 0 color-mix(in srgb,#fff 20%,transparent);
        text-decoration:none;
        font-size:11px;
        font-weight:680;
        line-height:1;
        transition:background .12s ease,transform 100ms ease-out;
      }
      .language-toggle{display:inline-flex;align-items:center;justify-content:center;flex:0 0 44px;white-space:nowrap;overflow:hidden}.language-menu{position:relative}.language-menu summary{list-style:none;cursor:pointer;width:44px!important;height:44px!important;min-width:44px!important;max-width:44px!important;padding:0!important;border-radius:50%!important;display:inline-flex!important;align-items:center;justify-content:center}.language-menu summary::-webkit-details-marker{display:none}.language-menu-popover{position:absolute;top:calc(100% + 8px);right:0;width:230px;max-height:min(70vh,480px);overflow:auto;padding:8px;border:1px solid var(--line);border-radius:16px;background:var(--surface-strong);box-shadow:0 18px 48px rgba(0,0,0,.18);z-index:2147483001}.language-menu-item{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 11px;border-radius:10px;color:var(--text);text-decoration:none;font-size:13px}.language-menu-item:hover,.language-menu-item[aria-current="true"]{background:var(--glass-heavy)}.language-menu-item small{color:var(--muted);font-size:10px;text-transform:uppercase}
      .theme-toggle:hover,.language-toggle:hover{background:color-mix(in srgb,var(--glass-heavy) 82%,var(--surface-strong) 18%);filter:none;transform:none}
      .theme-toggle:active,.language-toggle:active{transform:scale(.92)}
      .theme-toggle .theme-sun,:root[data-theme="light"] .theme-toggle .theme-moon{display:none}
      :root[data-theme="light"] .theme-toggle .theme-sun{display:inline}
      :root.theme-switching body,:root.theme-switching .card{transition:background .20s ease,color .20s ease,border-color .20s ease}

      .top-controls-zone{position:fixed;top:0;right:0;width:190px;height:72px;z-index:120;pointer-events:none}
      .top-controls{position:absolute;top:14px;right:14px;display:flex;align-items:center;gap:8px;opacity:1;transform:none;pointer-events:auto}
      .top-controls .language-toggle,.top-controls .theme-toggle{position:static!important;top:auto!important;right:auto!important}

      /* Site-wide authenticated workspace pass. Keep structural app CSS, but make
         hierarchy, materials and interaction behavior consistent everywhere. */
      body.os-shell{
        display:block!important;
        align-items:initial!important;
        justify-content:initial!important;
        padding:16px!important;
        background:
          radial-gradient(1000px 620px at 8% -14%,color-mix(in srgb,var(--primary) 7%,transparent),transparent 68%),
          var(--bg)!important;
        background-size:auto!important;
        animation:none!important;
      }
      body.os-shell .os-layout{max-width:1680px!important;margin:0 auto!important;grid-template-columns:272px minmax(0,1fr)!important;gap:14px!important}
      body.os-shell .os-sidebar{
        border:1px solid var(--border)!important;
        border-radius:24px!important;
        background:var(--glass-heavy)!important;
        -webkit-backdrop-filter:blur(30px) saturate(165%)!important;
        backdrop-filter:blur(30px) saturate(165%)!important;
        box-shadow:0 18px 52px rgba(0,0,0,.13)!important;
      }
      body.os-shell .os-main{
        border:1px solid var(--border)!important;
        border-radius:24px!important;
        background:var(--surface)!important;
        -webkit-backdrop-filter:none!important;
        backdrop-filter:none!important;
        box-shadow:0 18px 52px rgba(0,0,0,.09)!important;
      }
      body.os-shell .os-brand small{display:none!important}
      body.os-shell .os-brand-mark{border-radius:0!important;box-shadow:none!important;background:transparent!important;overflow:visible!important} body.os-shell .os-brand-mark img{display:block;width:100%;height:100%;object-fit:contain}
      body.os-shell .os-user{background:var(--fill)!important;border:0!important;box-shadow:none!important}
      body.os-shell .os-nav-group{border:0!important;box-shadow:none!important;background:transparent!important}
      body.os-shell .os-nav-group.is-active{background:transparent!important}
      body.os-shell .os-nav-title,body.os-shell .os-nav-items a{transition:background .12s ease,color .12s ease,transform 100ms ease-out!important}
      body.os-shell .os-nav-title:active,body.os-shell .os-nav-items a:active{transform:scale(.985)!important}
      body.os-shell .os-nav-group.is-active>.os-nav-title{background:color-mix(in srgb,var(--primary) 14%,transparent)!important;color:var(--primary)!important}
      body.os-shell .os-nav-items a[aria-current="page"]{background:var(--fill)!important;color:var(--text)!important;font-weight:650!important}
      body.os-shell .os-kicker{display:none!important}
      body.os-shell .os-hero{align-items:flex-start!important;margin-bottom:22px!important}
      body.os-shell .os-hero h1{font-size:clamp(34px,4.4vw,52px)!important;font-weight:700!important;line-height:1.03!important;letter-spacing:-.045em!important}
      body.os-shell .os-hero>div>p:not(.os-kicker){display:none!important}
      body.os-shell .os-ai{border:0!important;background:var(--fill)!important;box-shadow:none!important;transition:background .12s ease,transform 100ms ease-out!important}
      body.os-shell .os-ai:hover{background:var(--secondary)!important}
      body.os-shell .os-ai:active{transform:scale(.98)!important}
      body.os-shell .os-card,body.os-shell .os-profile-card,body.os-shell .os-lock,
      body.os-shell .admin-motion-card,body.os-shell .admin-metrics article,
      body.os-shell .storage-overview-panel,body.os-shell .storage-browser{
        border:1px solid var(--border)!important;
        border-radius:18px!important;
        background:var(--card)!important;
        -webkit-backdrop-filter:none!important;
        backdrop-filter:none!important;
        box-shadow:none!important;
      }
      body.os-shell .os-card{animation:none!important}
      body.os-shell .os-card h2{font-weight:680!important;letter-spacing:-.025em!important}
      body.os-shell .os-card small{font-weight:620!important;letter-spacing:.01em!important}
      body.os-shell .os-hub-card{
        border:1px solid var(--border)!important;
        border-radius:18px!important;
        background:var(--card)!important;
        -webkit-backdrop-filter:none!important;
        backdrop-filter:none!important;
        box-shadow:none!important;
        transition:background .12s ease,border-color .12s ease,transform 100ms ease-out!important;
      }
      body.os-shell .os-hub-card::after{display:none!important}
      body.os-shell .os-hub-card:hover{transform:none!important;background:var(--surface-strong)!important;border-color:var(--border)!important;box-shadow:none!important}
      body.os-shell .os-hub-card:active{transform:scale(.985)!important}
      body.os-shell .os-hub-card small{background:var(--fill)!important;color:var(--muted)!important}
      body.os-shell .settings-choice,body.os-shell .storage-action-button,body.os-shell .admin-ghost{
        background:var(--fill)!important;border:0!important;box-shadow:none!important;
      }
      body.os-shell .settings-choice:hover,body.os-shell .storage-action-button:hover,body.os-shell .admin-ghost:hover{background:var(--secondary)!important}
      body.os-shell .admin-primary,body.os-shell .storage-upload-button,body.os-shell .storage-empty-upload{background:var(--primary)!important;color:#fff!important;box-shadow:none!important}
      body.os-shell .admin-danger{background:var(--danger)!important;color:#fff!important;box-shadow:none!important}
      body.os-shell .admin-primary:active,body.os-shell .admin-ghost:active,body.os-shell .admin-danger:active,
      body.os-shell .storage-upload-button:active,body.os-shell .storage-action-button:active,body.os-shell .settings-choice:active{transform:scale(.97)!important}
      body.os-shell .admin-table-head,body.os-shell .audit-head,body.os-shell .storage-file-head{
        background:var(--glass-heavy)!important;
        -webkit-backdrop-filter:blur(18px) saturate(160%)!important;
        backdrop-filter:blur(18px) saturate(160%)!important;
        border-bottom:0!important;
      }
      body.os-shell .admin-table-row,body.os-shell .audit-row,body.os-shell .storage-file-row{border-top-color:var(--hairline)!important}
      body.os-shell .storage-toolbar{background:var(--fill)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border:0!important}
      body.os-shell .storage-search-shell{background:var(--surface)!important;border:0!important;box-shadow:inset 0 0 0 1px var(--border)!important}
      body.os-shell .admin-drawer,body.os-shell .admin-confirm,body.os-shell .admin-toast{
        background:var(--glass-heavy)!important;
        -webkit-backdrop-filter:blur(28px) saturate(170%)!important;
        backdrop-filter:blur(28px) saturate(170%)!important;
      }

      @keyframes materialize{from{opacity:0;transform:scale(.988) translateY(6px);filter:blur(3px)}to{opacity:1;transform:none;filter:none}}

      @media (max-width:1050px){
        body.os-shell{padding:10px!important}
        body.os-shell .os-layout{height:calc(100dvh - 20px)!important}
        body.os-shell .os-main,body.os-shell .os-sidebar{border-radius:20px!important}
      }
      @media (max-width:560px){
        body{padding:12px}
        .card{padding:24px 18px;border-radius:22px}
        .birthdate-grid{grid-template-columns:1fr;gap:0}
        .top-controls{top:12px;right:12px}
        body.os-shell .os-main{padding:20px 16px!important}
        body.os-shell .os-hero h1{font-size:36px!important}
      }
      @media (prefers-reduced-motion:reduce){
        *,*::before,*::after{animation:none!important;scroll-behavior:auto!important}
        button,a.button,.choice-row,.theme-toggle,.language-toggle,
        body.os-shell .os-nav-title,body.os-shell .os-nav-items a,body.os-shell .os-ai,
        body.os-shell .os-hub-card,body.os-shell .settings-choice{
          transition:background .12s ease,color .12s ease,opacity .12s ease!important;
          transform:none!important;
        }
      }
      @media (prefers-reduced-transparency:reduce){
        .card,.theme-toggle,.language-toggle,
        body.os-shell .os-sidebar,body.os-shell .admin-drawer,body.os-shell .admin-confirm,body.os-shell .admin-toast,
        body.os-shell .admin-table-head,body.os-shell .audit-head,body.os-shell .storage-file-head{
          background:var(--surface)!important;
          -webkit-backdrop-filter:none!important;
          backdrop-filter:none!important;
        }
      }
      @media (prefers-contrast:more){
        .card,.theme-toggle,.language-toggle,input,select,textarea,.choice-row,
        body.os-shell .os-sidebar,body.os-shell .os-main,body.os-shell .os-card,
        body.os-shell .os-hub-card,body.os-shell .storage-browser,body.os-shell .admin-motion-card{
          border-color:var(--border-strong)!important;
        }
      }

      /* AWARD_QUALITY_SYSTEM_2026 — Studio shell only.
         Protected product surfaces keep their dedicated layout contracts:
         Intelligence/Watch are standalone; Work TeX and Student Verification
         are explicitly excluded from this shared visual pass. */
      :root[data-theme="light"] body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)){
        --bg:#f4f4f2;
        --bg-soft:#ebece9;
        --surface:#fbfbfa;
        --surface-strong:#f0f1ee;
        --surface-soft:#f4f5f2;
        --card:#ffffff;
        --text:#18181a;
        --muted:#6f7075;
        --quiet:#94959a;
        --border:rgba(24,24,27,.10);
        --border-strong:rgba(24,24,27,.18);
        --hairline:rgba(24,24,27,.075);
        --glass:rgba(255,255,255,.74);
        --glass-heavy:rgba(250,250,248,.88);
        --shadow:0 36px 90px rgba(22,24,29,.12);
        --shadow-soft:0 12px 36px rgba(22,24,29,.075);
        --ease-emphasized:cubic-bezier(.16,1,.3,1);
        --ease-standard:cubic-bezier(.2,.8,.2,1);
      }
      :root:not([data-theme="light"]) body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)){
        --bg:#08090b;
        --bg-soft:#101114;
        --surface:#15171a;
        --surface-strong:#1d2024;
        --surface-soft:#1a1c20;
        --card:#15171a;
        --text:#f4f4f5;
        --muted:#a5a7ad;
        --quiet:#73767e;
        --border:rgba(255,255,255,.095);
        --border-strong:rgba(255,255,255,.17);
        --hairline:rgba(255,255,255,.065);
        --glass:rgba(18,20,23,.74);
        --glass-heavy:rgba(14,16,19,.88);
        --shadow:0 36px 100px rgba(0,0,0,.42);
        --shadow-soft:0 14px 40px rgba(0,0,0,.24);
        --ease-emphasized:cubic-bezier(.16,1,.3,1);
        --ease-standard:cubic-bezier(.2,.8,.2,1);
      }

      :root[data-accent="sapphire"] body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)){--primary:#4964d8}
      :root[data-accent="aqua"] body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)){--primary:#2a9d8f}
      :root[data-accent="jade"] body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)){--primary:#3a9d72}
      :root[data-accent="lime"] body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)){--primary:#86a93b;--primary-ink:#151515}
      :root[data-accent="amber"] body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)){--primary:#d49a2a;--primary-ink:#151515}
      :root[data-accent="coral"] body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)){--primary:#e26d5a}
      :root[data-accent="rose"] body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)){--primary:#d95686}
      :root[data-accent="magenta"] body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)){--primary:#b755c7}
      :root[data-accent="violet"] body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)){--primary:#7559d9}
      :root[data-accent="graphite"] body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)){--primary:#5a5d64}

      body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)){
        --primary-hover:color-mix(in srgb,var(--primary) 82%,#fff 18%);
        padding:clamp(12px,1.55vw,24px)!important;
        background:
          radial-gradient(1200px 760px at 4% -18%,color-mix(in srgb,var(--primary) 11%,transparent),transparent 66%),
          radial-gradient(940px 720px at 104% 104%,color-mix(in srgb,#af52de 7%,transparent),transparent 71%),
          var(--bg)!important;
        -webkit-font-smoothing:antialiased;
        -moz-osx-font-smoothing:grayscale;
      }
      body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)) .os-layout{
        max-width:1760px!important;
        grid-template-columns:286px minmax(0,1fr)!important;
        gap:18px!important;
      }
      body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)) .os-sidebar{
        padding:16px!important;
        border-radius:30px!important;
        background:color-mix(in srgb,var(--glass-heavy) 94%,transparent)!important;
        border-color:color-mix(in srgb,var(--border) 88%,transparent)!important;
        box-shadow:
          0 1px 0 color-mix(in srgb,#fff 22%,transparent) inset,
          0 26px 80px rgba(0,0,0,.13)!important;
      }
      body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)) .os-main{
        padding:clamp(28px,3.5vw,54px)!important;
        border-radius:30px!important;
        background:linear-gradient(180deg,color-mix(in srgb,var(--surface) 97%,#fff 3%),var(--surface))!important;
        border-color:color-mix(in srgb,var(--border) 88%,transparent)!important;
        box-shadow:
          0 1px 0 color-mix(in srgb,#fff 19%,transparent) inset,
          0 28px 88px rgba(0,0,0,.11)!important;
      }
      body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)) .os-hero{
        margin-bottom:34px!important;
        gap:24px!important;
      }
      body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)) .os-hero h1{
        max-width:12ch;
        font-size:clamp(42px,5vw,68px)!important;
        line-height:.96!important;
        letter-spacing:-.058em!important;
        font-weight:760!important;
      }
      body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)) .os-nav-title{
        min-height:42px;
        display:flex;
        align-items:center;
        padding:10px 11px!important;
        border-radius:13px!important;
      }
      body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)) .os-nav-items a{
        min-height:40px;
        border-radius:11px!important;
      }
      body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)) :is(.os-card,.os-profile-card,.os-lock,.os-hub-card,.storage-overview-panel,.storage-browser){
        border-radius:22px!important;
        border-color:color-mix(in srgb,var(--border) 88%,transparent)!important;
        background:linear-gradient(180deg,color-mix(in srgb,var(--card) 97%,#fff 3%),var(--card))!important;
        box-shadow:
          0 1px 0 color-mix(in srgb,#fff 18%,transparent) inset,
          0 10px 30px rgba(0,0,0,.055)!important;
      }
      body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)) .os-card{
        padding:clamp(20px,2vw,28px)!important;
      }
      body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)) .os-card h2{
        font-size:clamp(19px,2vw,24px);
        letter-spacing:-.035em!important;
      }
      @media (hover:hover) and (pointer:fine){
        body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)) :is(.os-hub-card,.settings-card-link){
          transition:
            transform .3s var(--ease-emphasized),
            background .22s ease,
            border-color .22s ease,
            box-shadow .3s var(--ease-emphasized)!important;
        }
        body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)) :is(.os-hub-card,.settings-card-link):hover{
          transform:translateY(-2px)!important;
          border-color:var(--border-strong)!important;
          box-shadow:0 18px 42px rgba(0,0,0,.08)!important;
        }
      }
      @media (max-width:1180px){
        body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)) .os-layout{
          grid-template-columns:264px minmax(0,1fr)!important;
          gap:14px!important;
        }
        body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)) .os-main{padding:30px!important}
      }
      @media (max-width:1050px){
        body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)){padding:10px!important}
        body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)) .os-layout{height:calc(100dvh - 20px)!important}
        body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)) :is(.os-main,.os-sidebar){border-radius:24px!important}
      }
      @media (max-width:560px){
        body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)){padding:8px!important}
        body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)) .os-layout{height:calc(100dvh - 16px)!important}
        body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)) .os-main{padding:22px 17px!important;border-radius:22px!important}
        html.compact-content-view body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)) .os-main{padding-top:68px!important}
        body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)) .os-hero{margin-bottom:24px!important}
        body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)) .os-hero h1{font-size:clamp(38px,12vw,52px)!important}
      }
      @media (prefers-reduced-motion:reduce){
        body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)) :is(.os-hub-card,.settings-card-link){
          transform:none!important;
          transition-duration:.01ms!important;
        }
      }

    </style>
    <style>${accountMenuStyles()}</style>
  `;
}

export function supabaseScript() {
  return `
    <script>
      const AERTEX_SUPABASE_STORAGE_KEY = "aertex-supabase-auth-v3";
      const aertexAuthMemory = new Map();
      const aertexAuthStorage = {
        getItem(key) {
          try {
            const value = localStorage.getItem(key);
            if (value !== null) return value;
          } catch {}
          try {
            const value = sessionStorage.getItem(key);
            if (value !== null) return value;
          } catch {}
          return aertexAuthMemory.has(key) ? aertexAuthMemory.get(key) : null;
        },
        setItem(key, value) {
          let persisted = false;
          try { localStorage.setItem(key, value); persisted = true; } catch {}
          if (!persisted) {
            try { sessionStorage.setItem(key, value); persisted = true; } catch {}
          }
          aertexAuthMemory.set(key, value);
        },
        removeItem(key) {
          try { localStorage.removeItem(key); } catch {}
          try { sessionStorage.removeItem(key); } catch {}
          aertexAuthMemory.delete(key);
        }
      };
      try { localStorage.removeItem("sb-xunbsoxijasekzadckob-auth-token"); } catch {}
      try { sessionStorage.removeItem("sb-xunbsoxijasekzadckob-auth-token"); } catch {}
      const supabaseClient = supabase.createClient(
        "${SUPABASE_URL}",
        "${SUPABASE_KEY}",
        {
          auth: {
            storage: aertexAuthStorage,
            storageKey: AERTEX_SUPABASE_STORAGE_KEY,
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false
          }
        }
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
  const activeLocale = links.activeLocale || (t === TEXT.zh ? "zh-cn" : "en-us");
  const meta = LOCALE_META[activeLocale] || {};
  const label = meta.shortName || meta.nativeName || activeLocale;
  const items = Object.entries(links.localeLinks || {}).map(([code, href]) => {
    const meta = LOCALE_META[code];
    if (!meta) return "";
    const current = code === activeLocale ? ' aria-current="true"' : "";
    return `<a class="language-menu-item" href="${href}" lang="${code}"${meta.dir === "rtl" ? ' dir="rtl"' : ""}${current}><span>${meta.nativeName}</span><small>${code}</small></a>`;
  }).join("");
  return `<details class="language-menu"><summary class="language-toggle" aria-label="Language" title="Language">${label}</summary><div class="language-menu-popover">${items}</div></details>`;
}

export function topControls(links, t) {
  const locale = links.activeLocale || (t === TEXT.zh ? "zh-cn" : "en-us");
  return `
    <div class="top-controls-zone" aria-label="Page controls">
      <div class="top-controls">
        ${languageToggle(links, t)}
        ${themeToggle()}
        ${accountMenuMarkup(locale)}
      </div>
    </div>
    ${accountMenuClientScript({ locale })}
  `;
}

export function themeScript() {
  return `
    <script>
      (function () {
        const button = document.getElementById("theme-toggle");
        if (!button || !window.AERTEXTheme) return;

        const syncButton = () => {
          const resolved = window.AERTEXTheme.getResolvedTheme();
          const mode = window.AERTEXTheme.getMode();
          button.dataset.themeMode = mode;
          button.setAttribute("aria-label", resolved === "light" ? "Switch to dark mode" : "Switch to light mode");
          button.title = mode === "system" ? "System appearance" : (resolved === "light" ? "Light appearance" : "Dark appearance");
        };

        button.addEventListener("click", () => {
          const current = window.AERTEXTheme.getResolvedTheme();
          document.documentElement.classList.add("theme-switching");
          window.AERTEXTheme.setMode(current === "light" ? "dark" : "light");
          window.setTimeout(() => document.documentElement.classList.remove("theme-switching"), 260);
        });
        window.addEventListener("aertex-themechange", syncButton);
        syncButton();
      })();
    </script>
  `;
}
