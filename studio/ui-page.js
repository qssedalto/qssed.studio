import { SUPABASE_URL, SUPABASE_KEY, TEXT } from "./config.js";
import { FAVICON_LINKS } from "./favicon.js";
import { accountMenuClientScript, accountMenuMarkup, accountMenuStyles } from "./account-menu.js";
import { LOCALE_META } from "./locale.js";
import { appearanceBootScript } from "./appearance.js";

// 共享页面 <head> 基座：favicon、viewport、外观首屏脚本、Supabase 浏览器 SDK 与基础 UI token。
// Watch 的 auth handoff 会调用它，但 Watch 仪表盘自己的 HTML/CSS 不依赖这套卡片布局。
export function baseHead(title) {
  return `
    <title>${title}</title>
    ${FAVICON_LINKS}
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    ${appearanceBootScript()}
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
      .language-toggle{display:inline-flex;align-items:center;justify-content:center;flex:0 0 44px;white-space:nowrap;overflow:hidden}
      .control-menu{position:relative}
      .control-menu>summary{list-style:none;cursor:pointer;width:44px!important;height:44px!important;min-width:44px!important;max-width:44px!important;padding:0!important;border-radius:50%!important;display:inline-flex!important;align-items:center;justify-content:center}
      .control-menu>summary::-webkit-details-marker{display:none}
      .language-menu-popover,.theme-menu-popover{position:absolute;top:calc(100% + 8px);right:0;overflow:auto;padding:8px;border:1px solid var(--line);border-radius:16px;background:var(--surface-strong);box-shadow:0 18px 48px rgba(0,0,0,.18);z-index:3;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
      .language-menu-popover{width:230px;max-height:min(70vh,480px)}
      .theme-menu-popover{width:190px;max-height:min(60vh,320px)}
      .language-menu-item,.theme-menu-item{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:44px;margin:0;padding:10px 11px;border:0;border-radius:10px;background:transparent;color:var(--text);text-decoration:none;font:inherit;font-size:13px;box-shadow:none;cursor:pointer}
      .language-menu-item:hover,.language-menu-item[aria-current="true"],.theme-menu-item:hover,.theme-menu-item[aria-current="true"]{background:var(--glass-heavy);filter:none;transform:none}
      .language-menu-item small,.theme-menu-item small{color:var(--muted);font-size:10px;text-transform:uppercase}
      .theme-menu-item span:first-child{display:flex;align-items:center;gap:9px}
      .theme-menu-dot{width:10px;height:10px;border-radius:50%;border:1px solid var(--border-strong);background:var(--fill)}
      .theme-menu-item[data-theme-option="system"] .theme-menu-dot{background:linear-gradient(90deg,#f5f5f7 0 50%,#1c1c1e 50% 100%)}
      .theme-menu-item[data-theme-option="light"] .theme-menu-dot{background:#f5f5f7}
      .theme-menu-item[data-theme-option="dark"] .theme-menu-dot{background:#1c1c1e}
      .theme-menu-item[aria-current="true"]{font-weight:700}
      .theme-menu-item[aria-current="true"] small:after{content:"✓";margin-left:6px;color:var(--primary);font-weight:800}
      .theme-toggle:hover,.language-toggle:hover{background:color-mix(in srgb,var(--glass-heavy) 82%,var(--surface-strong) 18%);filter:none;transform:none}
      .theme-toggle:active,.language-toggle:active{transform:scale(.92)}
      .theme-toggle .theme-sun,:root[data-theme="light"] .theme-toggle .theme-moon{display:none}
      :root[data-theme="light"] .theme-toggle .theme-sun{display:inline}
      :root.theme-switching body,:root.theme-switching .card{transition:background .20s ease,color .20s ease,border-color .20s ease}
      html.aertex-control-menu-open,html.aertex-control-menu-open body{overflow:hidden!important;overscroll-behavior:none!important}
      .control-menu-backdrop{position:fixed;inset:0;z-index:0;background:transparent;pointer-events:auto;touch-action:none}
      .control-menu-backdrop[hidden]{display:none!important}

      .top-controls-zone{position:fixed;top:0;right:0;width:190px;height:72px;z-index:2147482000;pointer-events:none}
      .top-controls{position:absolute;top:14px;right:14px;z-index:1;display:flex;align-items:center;gap:8px;opacity:1;transform:none;pointer-events:auto}
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
      :root[data-theme="dark"] body.os-shell .os-brand-mark img{filter:brightness(0) invert(1)!important}
      :root[data-theme="light"] body.os-shell .os-brand-mark img{filter:none!important}
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

      :root[data-accent] body.os-shell:not(:has(.tex-work-app)):not(:has(#student-verification)){--primary:var(--aertex-accent);--primary-ink:var(--aertex-accent-ink)}

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

/// 创建浏览器 Supabase client，并把 auth storage 做成受控适配器。
/// 产品 handoff（包括 Watch）先由服务端验证 token，再调用这个脚本让浏览器 SDK 恢复本地会话。
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

// 主站的外观设置 UI 只负责写共享 appearance 偏好；Watch 页面不会再渲染第二个主题切换器。
export function themeToggle(locale = "en-us") {
  const copy = {
    "zh-cn": { title:"外观", system:"跟随系统", light:"浅色", dark:"深色" },
    "zh-tw": { title:"外觀", system:"跟隨系統", light:"淺色", dark:"深色" },
    "ja-jp": { title:"外観", system:"システム", light:"ライト", dark:"ダーク" },
    "ko-kr": { title:"화면 모드", system:"시스템", light:"라이트", dark:"다크" },
    "fr-fr": { title:"Apparence", system:"Système", light:"Clair", dark:"Sombre" },
    "es-es": { title:"Apariencia", system:"Sistema", light:"Claro", dark:"Oscuro" },
    "el-gr": { title:"Εμφάνιση", system:"Σύστημα", light:"Φωτεινό", dark:"Σκούρο" },
    "ar-sa": { title:"المظهر", system:"النظام", light:"فاتح", dark:"داكن" }
  }[locale] || { title:"Appearance", system:"System", light:"Light", dark:"Dark" };
  const option = (mode, label) => `<button class="theme-menu-item" type="button" data-theme-option="${mode}" aria-current="false"><span><i class="theme-menu-dot" aria-hidden="true"></i>${label}</span><small>${mode}</small></button>`;
  return `
    <details class="theme-menu control-menu">
      <summary id="theme-toggle" class="theme-toggle" aria-label="${copy.title}" title="${copy.title}" aria-haspopup="menu" aria-expanded="false">
        <span class="theme-moon">◐</span>
        <span class="theme-sun">◑</span>
      </summary>
      <div class="theme-menu-popover" role="menu" aria-label="${copy.title}">
        ${option("system", copy.system)}
        ${option("light", copy.light)}
        ${option("dark", copy.dark)}
      </div>
    </details>
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
  return `<details class="language-menu control-menu"><summary class="language-toggle" aria-label="Language" title="Language" aria-haspopup="menu" aria-expanded="false">${label}</summary><div class="language-menu-popover" role="menu">${items}</div></details>`;
}

export function topControls(links, t) {
  const locale = links.activeLocale || (t === TEXT.zh ? "zh-cn" : "en-us");
  return `
    <div class="top-controls-zone" aria-label="Page controls">
      <div class="control-menu-backdrop" data-control-menu-backdrop hidden aria-hidden="true"></div>
      <div class="top-controls">
        ${languageToggle(links, t)}
        ${themeToggle(locale)}
        ${accountMenuMarkup(locale)}
      </div>
    </div>
    ${accountMenuClientScript({ locale })}
  `;
}

/// 主题菜单只调用 window.AERTEX_APPEARANCE；真正的 Cookie/localStorage 同步逻辑集中在 appearance.js。
export function themeScript() {
  return `
    <script>
      (function () {
        const root = document.documentElement;
        const themeTrigger = document.getElementById("theme-toggle");
        const menus = Array.from(document.querySelectorAll(".control-menu"));
        const backdrop = document.querySelector("[data-control-menu-backdrop]");
        if (!menus.length) return;

        const openMenus = () => menus.filter(menu => menu.open);
        const syncOverlayState = () => {
          const open = openMenus().length > 0;
          root.classList.toggle("aertex-control-menu-open", open);
          if (backdrop) backdrop.hidden = !open;
        };
        const closeMenus = (except = null) => {
          menus.forEach(menu => {
            if (menu !== except && menu.open) menu.open = false;
          });
          syncOverlayState();
        };

        menus.forEach(menu => {
          const trigger = menu.querySelector("summary");
          const syncExpanded = () => trigger?.setAttribute("aria-expanded", menu.open ? "true" : "false");
          menu.addEventListener("toggle", () => {
            if (menu.open) closeMenus(menu);
            syncExpanded();
            syncOverlayState();
          });
          syncExpanded();
        });

        if (backdrop) {
          backdrop.addEventListener("pointerdown", event => {
            event.preventDefault();
            closeMenus();
          });
          backdrop.addEventListener("touchmove", event => event.preventDefault(), { passive:false });
          backdrop.addEventListener("wheel", event => event.preventDefault(), { passive:false });
        }

        document.addEventListener("keydown", event => {
          if (event.key === "Escape" && openMenus().length) {
            event.preventDefault();
            closeMenus();
          }
        });

        document.querySelectorAll(".language-menu-item").forEach(item => {
          item.setAttribute("role", "menuitem");
          item.addEventListener("click", () => closeMenus());
        });
        document.getElementById("aertex-account-button")?.addEventListener("click", () => closeMenus());

        if (themeTrigger && window.AERTEXTheme) {
          const syncThemeMenu = () => {
            const mode = window.AERTEXTheme.getMode();
            themeTrigger.dataset.themeMode = mode;
            document.querySelectorAll("[data-theme-option]").forEach(option => {
              option.setAttribute("aria-current", option.dataset.themeOption === mode ? "true" : "false");
            });
          };

          document.querySelectorAll("[data-theme-option]").forEach(option => {
            option.addEventListener("click", () => {
              const mode = option.dataset.themeOption || "system";
              document.documentElement.classList.add("theme-switching");
              window.AERTEXTheme.setMode(mode);
              window.setTimeout(() => document.documentElement.classList.remove("theme-switching"), 260);
              closeMenus();
            });
          });

          window.addEventListener("aertex-themechange", syncThemeMenu);
          syncThemeMenu();
        }

        syncOverlayState();
      })();
    </script>
  `;
}
