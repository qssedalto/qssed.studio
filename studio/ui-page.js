import { SUPABASE_URL, SUPABASE_KEY, TEXT } from "./config.js";

export function baseHead(title) {
  return `
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
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
      .theme-toggle:hover,.language-toggle:hover{background:color-mix(in srgb,var(--glass-heavy) 82%,var(--surface-strong) 18%);filter:none;transform:none}
      .theme-toggle:active,.language-toggle:active{transform:scale(.92)}
      .theme-toggle .theme-sun,:root[data-theme="light"] .theme-toggle .theme-moon{display:none}
      :root[data-theme="light"] .theme-toggle .theme-sun{display:inline}
      :root.theme-switching body,:root.theme-switching .card{transition:background .20s ease,color .20s ease,border-color .20s ease}

      .top-controls-zone{position:fixed;top:0;right:0;width:132px;height:72px;z-index:80;pointer-events:none}
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
      body.os-shell .os-brand-mark{border-radius:11px!important;box-shadow:none!important;background:var(--primary)!important}
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
  const label = t === TEXT.zh ? "EN" : "中";
  const title = t === TEXT.zh ? "Switch to English" : "切换到中文";
  return `<a class="language-toggle" href="${targetUrl}" aria-label="${title}" title="${title}">${label}</a>`;
}

export function topControls(links, t) {
  return `
    <div class="top-controls-zone" aria-label="Page controls">
      <div class="top-controls">
        ${languageToggle(links, t)}
        ${themeToggle()}
      </div>
    </div>
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
          try { localStorage.setItem("qssed-theme", theme); } catch {}
          window.setTimeout(() => document.documentElement.classList.remove("theme-switching"), 220);
        }

        button.addEventListener("click", () => {
          const currentTheme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
          setTheme(currentTheme === "light" ? "dark" : "light");
        });
      })();
    </script>
  `;
}
