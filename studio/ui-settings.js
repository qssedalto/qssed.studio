import { osHubGrid, osHubIcon } from "./ui-primitives.js";
import { dashboardIcon } from "./ui-dashboard.js";

export function settingsGeneralContent(zh) {
  const prefix = zh ? "/zh-cn" : "/en";
  const rows = zh ? [
    ["主题与外观", "系统、浅色、深色与强调色", `${prefix}/settings/appearance`, "appearance"],
    ["语言", "中文或 English", `${prefix}/settings/language`, "language"],
    ["账户与安全", "设备和登录记录", `${prefix}/settings/security`, "shield"]
  ] : [
    ["Theme & Appearance", "System, light, dark, and accent", `${prefix}/settings/appearance`, "appearance"],
    ["Language", "Chinese or English", `${prefix}/settings/language`, "language"],
    ["Account & Security", "Devices and sign-ins", `${prefix}/settings/security`, "shield"]
  ];
  return `
    <section class="os-card settings-general-card">
      <div class="settings-general-heading">
        ${osHubIcon("general")}
        <div>
          <small>${zh ? "通用" : "General"}</small>
          <h2>${zh ? "常用设置" : "Common Settings"}</h2>
          <p>${zh ? "外观、语言和账户安全。" : "Appearance, language, and account security."}</p>
        </div>
      </div>
      <div class="settings-general-list">
        ${rows.map(row => `<a href="${row[2]}">${osHubIcon(row[3])}<span><strong>${row[0]}</strong><small>${row[1]}</small></span><b aria-hidden="true">›</b></a>`).join("")}
      </div>
    </section>
    <section class="os-card settings-general-note">
      <strong>${zh ? "更多设置" : "More Settings"}</strong>
      <p>${zh ? "对应服务接入后会显示在这里。" : "More controls will appear as their services become available."}</p>
    </section>
  `;
}

export function securityAuditContent(zh) {
  return `
    <section class="os-card audit-section">
      <h2>${zh ? "当前设备" : "Current Device"}</h2>
      <div id="audit-current-device" class="audit-current">...</div>
    </section>
    <section class="os-card audit-section">
      <h2>${zh ? "登录设备" : "Signed-in Devices"}</h2>
      <div id="audit-device-list" class="audit-devices"></div>
    </section>
    <section class="os-card audit-section">
      <h2>${zh ? "登录历史" : "Sign-in History"}</h2>
      <div id="audit-login-timeline" class="audit-timeline"></div>
    </section>
    <section class="os-card audit-section">
      <h2>${zh ? "安全提醒" : "Security Alerts"}</h2>
      <div id="audit-risk-alerts" class="audit-alerts"></div>
    </section>
  `;
}

export function appearanceSettingsContent(zh) {
  const copy = zh ? {
    eyebrow:"THEME STUDIO",
    title:"主题与外观",
    intro:"把 AERTEX 调成你喜欢的样子。模式与强调色会即时预览并保存在当前浏览器。",
    modeTitle:"外观模式",
    modeHint:"选择跟随设备，或固定使用浅色 / 深色。",
    system:"系统",
    systemHint:"默认 · 跟随设备外观",
    light:"浅色",
    lightHint:"始终使用浅色",
    dark:"深色",
    darkHint:"始终使用深色",
    accentTitle:"强调色",
    accentHint:"只用于交互焦点、选中状态和品牌点缀，不会把整个界面染色。",
    preview:"实时预览",
    previewTitle:"AERTEX",
    previewSubtitle:"Personal Workspace",
    previewCard:"今日工作",
    previewMeta:"3 个项目正在进行",
    previewButton:"打开工作台",
    current:"当前强调色",
    saved:"已保存到当前浏览器",
    colors:{
      sapphire:"宝石蓝",aqua:"青色",jade:"玉绿",lime:"青柠绿",amber:"琥珀黄",
      coral:"珊瑚橙",rose:"莓果粉",magenta:"洋红",violet:"紫罗兰",graphite:"石墨黑"
    }
  } : {
    eyebrow:"THEME STUDIO",
    title:"Theme & Appearance",
    intro:"Make AERTEX feel like yours. Mode and accent changes preview instantly and are saved in this browser.",
    modeTitle:"Appearance mode",
    modeHint:"Follow your device, or keep a fixed light / dark appearance.",
    system:"System",
    systemHint:"Default · Follow device appearance",
    light:"Light",
    lightHint:"Always use light",
    dark:"Dark",
    darkHint:"Always use dark",
    accentTitle:"Accent color",
    accentHint:"Used for interaction focus, selected states, and restrained brand accents—not as an all-over tint.",
    preview:"Live preview",
    previewTitle:"AERTEX",
    previewSubtitle:"Personal Workspace",
    previewCard:"Today's work",
    previewMeta:"3 projects in progress",
    previewButton:"Open Workbench",
    current:"Current accent",
    saved:"Saved in this browser",
    colors:{
      sapphire:"Sapphire",aqua:"Aqua",jade:"Jade",lime:"Lime",amber:"Amber",
      coral:"Coral",rose:"Rose",magenta:"Magenta",violet:"Violet",graphite:"Graphite"
    }
  };
  const colors = [
    ["sapphire","#4964d8"],["aqua","#2a9d8f"],["jade","#3a9d72"],["lime","#86a93b"],["amber","#d49a2a"],
    ["coral","#e26d5a"],["rose","#d95686"],["magenta","#b755c7"],["violet","#7559d9"],["graphite","#5a5d64"]
  ];
  const accentButtons = colors.map(([key,value]) =>
    '<button class="theme-accent" type="button" data-accent="'+key+'" style="--swatch:'+value+'"><span class="theme-accent-dot"></span><span>'+copy.colors[key]+'</span></button>'
  ).join("");
  return `
    <style>
      body.os-shell:has(.theme-studio){
        background:
          radial-gradient(900px 560px at 98% 2%,color-mix(in srgb,var(--primary) 13%,transparent),transparent 68%),
          radial-gradient(760px 520px at 4% 104%,color-mix(in srgb,var(--primary) 7%,transparent),transparent 72%),
          var(--bg)!important;
      }
      body.os-shell:has(.theme-studio) .os-hero{display:none!important}
      body.os-shell:has(.theme-studio) .os-hero h1{font-size:clamp(42px,5vw,66px)!important}
      .theme-studio{display:grid;gap:18px}
      .theme-studio-intro{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:22px;align-items:end;min-height:190px;padding:clamp(24px,3.2vw,38px);border:1px solid var(--border);border-radius:28px;background:linear-gradient(145deg,color-mix(in srgb,var(--card) 98%,#fff 2%),color-mix(in srgb,var(--surface) 93%,var(--primary) 4%));box-shadow:0 18px 50px rgba(0,0,0,.07),inset 0 1px 0 color-mix(in srgb,#fff 20%,transparent)}
      .theme-studio-intro:after{content:"";position:absolute;width:420px;aspect-ratio:1;border-radius:50%;right:-190px;top:-250px;background:radial-gradient(circle,color-mix(in srgb,var(--primary) 20%,transparent),transparent 65%);pointer-events:none}
      .theme-studio-intro small{display:block;margin-bottom:10px;color:var(--primary);font-size:11px;font-weight:780;letter-spacing:.15em}
      .theme-studio-intro h2{margin:0;font-size:clamp(34px,4vw,52px)!important;line-height:.98;letter-spacing:-.055em!important}
      .theme-studio-intro p{max-width:650px;margin:12px 0 0;font-size:15px;line-height:1.65}
      .theme-studio-current{position:relative;z-index:1;display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:999px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border);white-space:nowrap}
      .theme-studio-current i{width:14px;height:14px;border-radius:50%;background:var(--primary);box-shadow:0 0 0 4px color-mix(in srgb,var(--primary) 12%,transparent)}
      .theme-studio-current span{font-size:12px;color:var(--muted)}.theme-studio-current strong{font-size:12px}
      .theme-studio-layout{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(330px,.92fr);gap:18px;align-items:start}
      .theme-control-stack{display:grid;gap:18px}
      .theme-panel{padding:clamp(20px,2.4vw,28px);border:1px solid var(--border);border-radius:24px;background:var(--card);box-shadow:0 10px 30px rgba(0,0,0,.045)}
      .theme-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}
      .theme-panel-head h3{margin:0;font-size:21px;letter-spacing:-.035em}.theme-panel-head p{max-width:600px;margin:5px 0 0;font-size:12.5px;line-height:1.55}
      .theme-mode-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
      .theme-mode{appearance:none;display:grid;gap:12px;min-height:150px;padding:14px;margin:0;text-align:left;border:1px solid var(--border);border-radius:18px;background:var(--surface-soft);color:var(--text);box-shadow:none;cursor:pointer;transition:transform .24s cubic-bezier(.16,1,.3,1),border-color .2s ease,background .2s ease,box-shadow .24s ease}
      .theme-mode-visual{position:relative;display:block;height:74px;border-radius:13px;overflow:hidden;border:1px solid var(--border);background:#f1f2f4}
      .theme-mode-visual:before{content:"";position:absolute;inset:10px 42% 10px 9px;border-radius:9px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.06)}
      .theme-mode-visual:after{content:"";position:absolute;right:10px;top:11px;width:28%;height:10px;border-radius:5px;background:#d7d8dc;box-shadow:0 18px 0 #e1e2e5,0 36px 0 #e1e2e5}
      .theme-mode[data-mode="dark"] .theme-mode-visual{background:#111316}.theme-mode[data-mode="dark"] .theme-mode-visual:before{background:#202327;box-shadow:0 0 0 1px rgba(255,255,255,.08)}.theme-mode[data-mode="dark"] .theme-mode-visual:after{background:#5a5d64;box-shadow:0 18px 0 #34373b,0 36px 0 #34373b}
      .theme-mode[data-mode="system"] .theme-mode-visual{background:linear-gradient(90deg,#f1f2f4 0 50%,#111316 50%)}.theme-mode[data-mode="system"] .theme-mode-visual:before{left:9px;right:auto;top:10px;bottom:10px;width:calc(50% - 13px);border-radius:9px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.06)}.theme-mode[data-mode="system"] .theme-mode-visual:after{right:10px;background:#5a5d64;box-shadow:0 18px 0 #34373b,0 36px 0 #34373b}
      .theme-mode-copy{display:grid;gap:3px}.theme-mode-copy strong{font-size:14px}.theme-mode-copy span{color:var(--muted);font-size:11px;line-height:1.4}
      .theme-mode.is-selected{border-color:color-mix(in srgb,var(--primary) 52%,var(--border));background:color-mix(in srgb,var(--primary) 8%,var(--surface-soft));box-shadow:0 10px 24px color-mix(in srgb,var(--primary) 10%,transparent)}
      .theme-mode.is-selected .theme-mode-copy strong{color:var(--primary)}
      .theme-accent-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:9px}
      .theme-accent{appearance:none;display:grid;justify-items:center;gap:8px;min-height:82px;padding:11px 6px;margin:0;border:1px solid transparent;border-radius:16px;background:var(--surface-soft);color:var(--text);box-shadow:inset 0 0 0 1px var(--border);cursor:pointer;transition:transform .2s cubic-bezier(.16,1,.3,1),box-shadow .2s ease,background .2s ease}
      .theme-accent-dot{display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--swatch);box-shadow:inset 0 0 0 1px rgba(255,255,255,.25),0 5px 12px color-mix(in srgb,var(--swatch) 20%,transparent)}
      .theme-accent-dot:after{content:"";width:8px;height:5px;border-left:2px solid #fff;border-bottom:2px solid #fff;transform:rotate(-45deg) translateY(-1px);opacity:0}
      .theme-accent span:last-child{font-size:10.5px;color:var(--muted);white-space:nowrap}
      .theme-accent.is-selected{background:color-mix(in srgb,var(--primary) 8%,var(--surface-soft));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 48%,transparent),0 8px 22px color-mix(in srgb,var(--primary) 8%,transparent)}
      .theme-accent.is-selected .theme-accent-dot:after{opacity:1}.theme-accent.is-selected span:last-child{color:var(--text);font-weight:700}
      .theme-preview-wrap{position:sticky;top:26px}
      .theme-preview-label{display:flex;align-items:center;justify-content:space-between;margin:0 2px 10px;color:var(--muted);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
      .theme-preview{position:relative;overflow:hidden;min-height:500px;padding:16px;border:1px solid var(--border);border-radius:28px;background:radial-gradient(420px 280px at 90% -5%,color-mix(in srgb,var(--primary) 16%,transparent),transparent 72%),var(--bg-soft);box-shadow:0 22px 60px rgba(0,0,0,.10)}
      .theme-preview-window{display:grid;grid-template-columns:88px minmax(0,1fr);gap:10px;height:466px;padding:10px;border:1px solid var(--border);border-radius:21px;background:var(--surface);box-shadow:0 14px 34px rgba(0,0,0,.075)}
      .theme-preview-side{display:flex;flex-direction:column;gap:8px;padding:8px;border-radius:14px;background:var(--fill)}
      .theme-preview-brand{width:28px;height:28px;border-radius:9px;background:linear-gradient(145deg,color-mix(in srgb,var(--primary) 70%,#fff 30%),var(--primary));box-shadow:0 7px 16px color-mix(in srgb,var(--primary) 18%,transparent)}
      .theme-preview-nav{height:7px;border-radius:999px;background:var(--border-strong)}.theme-preview-nav.is-active{width:84%;background:var(--primary)}.theme-preview-nav:nth-child(3){width:70%}.theme-preview-nav:nth-child(4){width:76%}
      .theme-preview-main{min-width:0;padding:14px 10px}
      .theme-preview-kicker{display:block;width:54px;height:7px;border-radius:999px;background:var(--primary);opacity:.75}
      .theme-preview-main h4{margin:12px 0 4px;font-size:28px;line-height:1;letter-spacing:-.055em}.theme-preview-main>p{font-size:10.5px}
      .theme-preview-card{margin-top:22px;padding:17px;border:1px solid var(--border);border-radius:18px;background:var(--card);box-shadow:0 10px 24px rgba(0,0,0,.05)}
      .theme-preview-card small{font-size:9px;color:var(--muted)}.theme-preview-card strong{display:block;margin-top:5px;font-size:18px;letter-spacing:-.04em}.theme-preview-card p{margin-top:5px;font-size:10px}
      .theme-preview-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}.theme-preview-stat{height:62px;border-radius:13px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border)}.theme-preview-stat:first-child{background:color-mix(in srgb,var(--primary) 11%,var(--fill))}
      .theme-preview-action{display:inline-flex;align-items:center;justify-content:center;min-height:34px;margin-top:14px;padding:0 12px;border-radius:10px;background:var(--primary);color:#fff;font-size:10px;font-weight:750}
      .theme-feedback{min-height:18px;margin-top:10px;color:var(--muted);font-size:11px}
      @media(hover:hover) and (pointer:fine){.theme-mode:hover,.theme-accent:hover{transform:translateY(-2px)}.theme-accent:hover{box-shadow:inset 0 0 0 1px var(--border),0 10px 22px rgba(0,0,0,.06)}}
      @media(max-width:1100px){.theme-studio-layout{grid-template-columns:1fr}.theme-preview-wrap{position:static}.theme-preview{min-height:390px}.theme-preview-window{height:360px}}
      @media(max-width:680px){.theme-studio-intro{grid-template-columns:1fr;min-height:0;padding:22px 18px;border-radius:22px}.theme-studio-current{justify-self:start}.theme-panel{padding:18px 14px;border-radius:20px}.theme-mode-grid{grid-template-columns:1fr}.theme-mode{grid-template-columns:110px minmax(0,1fr);align-items:center;min-height:104px}.theme-mode-visual{height:74px}.theme-accent-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.theme-preview{display:none}}
      @media(prefers-reduced-motion:reduce){.theme-mode,.theme-accent{transition:none!important;transform:none!important}}
    </style>
    <section class="theme-studio" data-theme-studio>
      <header class="theme-studio-intro">
        <div><small>${copy.eyebrow}</small><h2>${copy.title}</h2><p>${copy.intro}</p></div>
        <div class="theme-studio-current"><i></i><span>${copy.current}</span><strong id="theme-current-accent">${copy.colors.sapphire}</strong></div>
      </header>
      <div class="theme-studio-layout">
        <div class="theme-control-stack">
          <section class="theme-panel">
            <div class="theme-panel-head"><div><h3>${copy.modeTitle}</h3><p>${copy.modeHint}</p></div></div>
            <div class="theme-mode-grid">
              <button class="theme-mode" type="button" data-mode="system"><span class="theme-mode-visual"></span><span class="theme-mode-copy"><strong>${copy.system}</strong><span>${copy.systemHint}</span></span></button>
              <button class="theme-mode" type="button" data-mode="light"><span class="theme-mode-visual"></span><span class="theme-mode-copy"><strong>${copy.light}</strong><span>${copy.lightHint}</span></span></button>
              <button class="theme-mode" type="button" data-mode="dark"><span class="theme-mode-visual"></span><span class="theme-mode-copy"><strong>${copy.dark}</strong><span>${copy.darkHint}</span></span></button>
            </div>
          </section>
          <section class="theme-panel">
            <div class="theme-panel-head"><div><h3>${copy.accentTitle}</h3><p>${copy.accentHint}</p></div></div>
            <div class="theme-accent-grid">${accentButtons}</div>
            <div id="theme-feedback" class="theme-feedback" aria-live="polite"></div>
          </section>
        </div>
        <aside class="theme-preview-wrap" aria-label="${copy.preview}">
          <div class="theme-preview-label"><span>${copy.preview}</span><span>01 / 01</span></div>
          <div class="theme-preview"><div class="theme-preview-window">
            <div class="theme-preview-side"><span class="theme-preview-brand"></span><span class="theme-preview-nav is-active"></span><span class="theme-preview-nav"></span><span class="theme-preview-nav"></span></div>
            <div class="theme-preview-main"><span class="theme-preview-kicker"></span><h4>${copy.previewTitle}</h4><p>${copy.previewSubtitle}</p><div class="theme-preview-card"><small>${copy.previewCard}</small><strong>${copy.previewMeta}</strong><div class="theme-preview-stats"><span class="theme-preview-stat"></span><span class="theme-preview-stat"></span></div><span class="theme-preview-action">${copy.previewButton}</span></div></div>
          </div></div>
        </aside>
      </div>
    </section>
    <script>
      (() => {
        const api=window.AERTEXTheme;if(!api)return;
        const modes=[...document.querySelectorAll("[data-mode]")];
        const accents=[...document.querySelectorAll("[data-accent]")];
        const current=document.getElementById("theme-current-accent");
        const feedback=document.getElementById("theme-feedback");
        const colorNames=${JSON.stringify(copy.colors)};
        let feedbackTimer=0;
        const announce=()=>{if(!feedback)return;feedback.textContent=${JSON.stringify(copy.saved)};window.clearTimeout(feedbackTimer);feedbackTimer=window.setTimeout(()=>{feedback.textContent=""},1600)};
        const refresh=()=>{const mode=api.getMode();const accent=api.getAccent();modes.forEach(button=>{const selected=button.dataset.mode===mode;button.classList.toggle("is-selected",selected);button.setAttribute("aria-pressed",selected?"true":"false")});accents.forEach(button=>{const selected=button.dataset.accent===accent;button.classList.toggle("is-selected",selected);button.setAttribute("aria-pressed",selected?"true":"false")});if(current)current.textContent=colorNames[accent]||colorNames.sapphire};
        modes.forEach(button=>button.addEventListener("click",()=>{document.documentElement.classList.add("theme-switching");api.setMode(button.dataset.mode);window.setTimeout(()=>document.documentElement.classList.remove("theme-switching"),260);refresh();announce()}));
        accents.forEach(button=>button.addEventListener("click",()=>{document.documentElement.classList.add("theme-switching");api.setAccent(button.dataset.accent);window.setTimeout(()=>document.documentElement.classList.remove("theme-switching"),260);refresh();announce()}));
        window.addEventListener("aertex-themechange",refresh);refresh();
      })();
    </script>
  `;
}

export function languageSettingsContent(zh, activeLocale = "en-us") {
  const localeCopy = {
    "zh-cn":["显示语言","AERTEX 默认跟随当前设备语言。你可以临时切换界面语言；重新从网站入口打开或下次登录时，会再次跟随设备语言。"],
    "zh-tw":["顯示語言","AERTEX 預設跟隨目前裝置語言。你可以暫時切換介面語言；重新從網站入口開啟或下次登入時，會再次跟隨裝置語言。"],
    "ja-jp":["表示言語","AERTEX はデフォルトで現在のデバイス言語に従います。表示言語は一時的に切り替えられ、次回サイトを開くかサインインすると再びデバイス言語に従います。"],
    "ko-kr":["표시 언어","AERTEX는 기본적으로 현재 기기 언어를 따릅니다. 현재 방문 중에는 언어를 변경할 수 있으며, 다음에 사이트를 열거나 로그인하면 다시 기기 언어를 따릅니다."],
    "fr-fr":["Langue d’affichage","AERTEX suit par défaut la langue de l’appareil. Vous pouvez changer temporairement la langue ; lors de la prochaine ouverture ou connexion, la langue de l’appareil sera de nouveau utilisée."],
    "es-es":["Idioma de visualización","AERTEX sigue de forma predeterminada el idioma del dispositivo. Puedes cambiarlo temporalmente; al volver a abrir el sitio o iniciar sesión, se usará de nuevo el idioma del dispositivo."],
    "el-gr":["Γλώσσα εμφάνισης","Το AERTEX ακολουθεί από προεπιλογή τη γλώσσα της συσκευής. Μπορείτε να την αλλάξετε προσωρινά· στην επόμενη επίσκεψη ή σύνδεση θα χρησιμοποιηθεί ξανά η γλώσσα της συσκευής."],
    "ar-sa":["لغة العرض","يتبع AERTEX لغة جهازك افتراضيًا. يمكنك تغيير اللغة مؤقتًا أثناء الزيارة الحالية، وعند فتح الموقع أو تسجيل الدخول لاحقًا سيعود إلى لغة الجهاز."],
    "en-us":["Language","AERTEX follows the current device language by default. You can switch languages for the current visit; opening the site again or signing in next time follows the device language again."],
    "en-gb":["Language","AERTEX follows the current device language by default. You can switch languages for the current visit; opening the site again or signing in next time follows the device language again."],
    "en-au":["Language","AERTEX follows the current device language by default. You can switch languages for the current visit; opening the site again or signing in next time follows the device language again."]
  };
  const localized = localeCopy[activeLocale] || localeCopy["en-us"];
  const locales = [
    ["en-us", "English (US)", "English · United States"],
    ["en-gb", "English (UK)", "English · United Kingdom"],
    ["en-au", "English (Australia)", "English · Australia"],
    ["zh-cn", "简体中文", "中文 · 简体"],
    ["zh-tw", "繁體中文", "中文 · 繁體"],
    ["ja-jp", "日本語", "日本語"],
    ["ko-kr", "한국어", "한국어"],
    ["fr-fr", "Français", "Français"],
    ["es-es", "Español", "Español"],
    ["el-gr", "Ελληνικά", "Ελληνικά"],
    ["ar-sa", "العربية", "العربية"]
  ];
  const choices = locales.map(([code, name, detail]) => `
    <a class="settings-choice ${activeLocale === code ? "is-selected" : ""}" href="/${code}/settings/language" lang="${code}"${code === "ar-sa" ? ' dir="rtl"' : ""}>
      <strong>${name}</strong><span>${detail}</span>
    </a>`).join("");
  return `
    <section class="os-card is-large settings-detail-card">
      <h2>${localized[0]}</h2>
      <p>${localized[1]}</p>
      <div class="settings-choice-grid">${choices}</div>
    </section>
  `;
}

export function aiSettingsContent(zh) {
  const copy = zh ? {
    title:"AI 设置",
    intro:"查看当前账号的 Intelligence 权限、Provider、模型和使用额度。默认模型保存在当前浏览器。",
    loading:"正在读取 AI 配置…",
    enabled:"已启用",
    disabled:"未启用",
    providers:"可用 Provider",
    models:"默认模型",
    usage:"用量与额度",
    today:"今日",
    month:"本月",
    tokens:"Token",
    cost:"费用",
    unlimited:"不限",
    unavailable:"当前账号尚未获得 Intelligence 权限，或管理员尚未分配可用 Provider。",
    region:"当前网络区域",
    open:"打开 AERTEX Intelligence",
    saved:"默认模型已保存到当前浏览器",
    error:"无法读取 AI 配置"
  } : {
    title:"AI Settings",
    intro:"View this account's Intelligence access, providers, models, and usage limits. The default model is saved in this browser.",
    loading:"Loading AI configuration…",
    enabled:"Enabled",
    disabled:"Not enabled",
    providers:"Available providers",
    models:"Default model",
    usage:"Usage & limits",
    today:"Today",
    month:"This month",
    tokens:"Tokens",
    cost:"Cost",
    unlimited:"Unlimited",
    unavailable:"Intelligence access has not been enabled for this account, or no provider has been assigned.",
    region:"Current network region",
    open:"Open AERTEX Intelligence",
    saved:"Default model saved in this browser",
    error:"Unable to load AI configuration"
  };
  return `
    <style>
      .ai-settings-stack{display:grid;gap:16px}
      .ai-settings-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin-top:14px}
      .ai-settings-panel{padding:18px;border:1px solid var(--border);border-radius:18px;background:var(--card)}
      .ai-settings-panel small{display:block;color:var(--muted);font-size:12px;margin-bottom:8px}
      .ai-settings-panel strong{display:block;font-size:18px}
      .ai-settings-panel p{margin:7px 0 0;color:var(--muted);line-height:1.5}
      .ai-provider-list{display:grid;gap:9px;margin-top:12px}
      .ai-provider-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-top:1px solid var(--border)}
      .ai-provider-row:first-child{border-top:0;padding-top:0}
      .ai-provider-row span{min-width:0;color:var(--muted);font-size:13px;text-align:right}
      .ai-model-select{width:100%;min-height:48px;margin-top:12px;padding:0 12px;border:1px solid var(--border);border-radius:12px;background:var(--card);color:var(--text);font:inherit}
      .ai-settings-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:14px}
      .ai-settings-feedback{color:var(--muted);font-size:12px}
      .ai-usage-line{display:flex;justify-content:space-between;gap:12px;margin-top:9px;font-size:13px}
      @media(max-width:620px){.ai-settings-grid{grid-template-columns:1fr}}
    </style>
    <section class="os-card is-large settings-detail-card">
      <div class="settings-general-heading">
        ${osHubIcon("ai")}
        <div>
          <small>AERTEX INTELLIGENCE</small>
          <h2>${copy.title}</h2>
          <p>${copy.intro}</p>
        </div>
      </div>
      <div id="ai-settings-state" class="ai-settings-stack">
        <div class="ai-settings-panel"><strong>${copy.loading}</strong></div>
      </div>
    </section>
    <script>
      (() => {
        const copy=${JSON.stringify(copy)};
        const isZh=${JSON.stringify(zh)};
        const root=document.getElementById("ai-settings-state");
        const preferenceKey="aertex-ai-default-model-v1";
        const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
        const money=value=>Number.isFinite(Number(value))?"$"+Number(value).toFixed(4):"—";
        const integer=value=>Number.isFinite(Number(value))?Math.round(Number(value)).toLocaleString():"—";
        const limit=(used,max,kind)=>{
          const usedText=kind==="usd"?money(used):integer(used);
          const maxText=max==null?copy.unlimited:(kind==="usd"?money(max):integer(max));
          return usedText+" / "+maxText;
        };
        const providerLabel=p=>{
          const name=String(p?.name||"");
          const vendor=p?.provider==="zhipu"?"智谱 GLM":p?.provider==="bailian"?"阿里云百炼":p?.provider==="openai"?"OpenAI":String(p?.provider||"Provider");
          return vendor+(name?" · "+name:"");
        };
        const preferenceDomain=()=>{
          const host=String(location.hostname||"").toLowerCase();
          return ["qsseda.com","qsseda.online","qsseda.studio"].find(domain=>host===domain||host.endsWith("."+domain))||"";
        };
        const readPreference=()=>{
          try{
            const prefix=preferenceKey+"=";
            const raw=document.cookie.split(";").map(part=>part.trim()).find(part=>part.startsWith(prefix));
            if(raw)return JSON.parse(decodeURIComponent(raw.slice(prefix.length)));
          }catch{}
          try{return JSON.parse(localStorage.getItem(preferenceKey)||"null")}catch{return null}
        };
        const savePreference=(providerId,model)=>{
          const value=JSON.stringify({provider_id:providerId,model});
          try{localStorage.setItem(preferenceKey,value)}catch{}
          try{
            const domain=preferenceDomain();
            document.cookie=preferenceKey+"="+encodeURIComponent(value)+"; Path=/; Max-Age=31536000; SameSite=Lax; Secure"+(domain?"; Domain="+domain:"");
          }catch{}
        };
        async function load(){
          try{
            const response=await fetch("/api/ai/config",{credentials:"same-origin",cache:"no-store",headers:{Accept:"application/json"}});
            const cfg=await response.json().catch(()=>null);
            if(!response.ok||!cfg?.enabled)throw new Error(cfg?.error||copy.unavailable);
            const providers=Array.isArray(cfg.providers)?cfg.providers:[];
            const models=Array.isArray(cfg.models)?cfg.models:[];
            const available=models.filter(item=>item.available!==false);
            const saved=readPreference();
            const chosen=available.find(item=>item.provider_id===saved?.provider_id&&item.model===saved?.model)
              || available.find(item=>item.provider_id===cfg.default_provider_id&&item.model===cfg.default_model)
              || available[0]
              || null;
            root.innerHTML=
              '<div class="ai-settings-grid">'+
                '<div class="ai-settings-panel"><small>'+esc(copy.enabled)+'</small><strong>AERTEX Intelligence</strong><p>'+esc(copy.region)+': '+esc(cfg.country||"—")+'</p></div>'+
                '<div class="ai-settings-panel"><small>'+esc(copy.providers)+'</small><strong>'+esc(String(providers.filter(p=>p.available!==false).length))+'</strong><p>'+esc(available.length+" "+copy.models)+'</p></div>'+
              '</div>'+
              '<div class="ai-settings-panel"><small>'+esc(copy.providers)+'</small><div class="ai-provider-list">'+
                providers.map(p=>'<div class="ai-provider-row"><strong>'+esc(providerLabel(p))+'</strong><span>'+esc(p.available===false?(isZh?"当前网络不可用":"Unavailable on current network"):(isZh?"可用":"Available"))+'</span></div>').join("")+
              '</div></div>'+
              '<div class="ai-settings-panel"><small>'+esc(copy.models)+'</small><strong>'+esc(chosen?.model||"—")+'</strong>'+
                '<select id="ai-default-model" class="ai-model-select" '+(available.length?"":"disabled")+'>'+
                  available.map(item=>'<option value="'+esc(item.provider_id+"|"+item.model)+'" '+(chosen&&item.provider_id===chosen.provider_id&&item.model===chosen.model?"selected":"")+'>'+esc(providerLabel(providers.find(p=>p.id===item.provider_id)))+' · '+esc(item.model)+'</option>').join("")+
                '</select><div class="ai-settings-actions"><a class="btn primary" href="'+esc((location.pathname.startsWith("/en")?"/en":"/zh-cn")+"/gpt/handoff?next="+encodeURIComponent(location.pathname.startsWith("/en")?"/en":"/zh-cn"))+'">'+esc(copy.open)+'</a><span id="ai-settings-feedback" class="ai-settings-feedback"></span></div></div>'+
              '<div class="ai-settings-panel"><small>'+esc(copy.usage)+'</small>'+
                '<div class="ai-usage-line"><span>'+esc(copy.today+" · "+copy.tokens)+'</span><strong>'+esc(limit(cfg.usage?.today_tokens,cfg.limits?.daily_tokens,"tokens"))+'</strong></div>'+
                '<div class="ai-usage-line"><span>'+esc(copy.month+" · "+copy.tokens)+'</span><strong>'+esc(limit(cfg.usage?.month_tokens,cfg.limits?.monthly_tokens,"tokens"))+'</strong></div>'+
                '<div class="ai-usage-line"><span>'+esc(copy.today+" · "+copy.cost)+'</span><strong>'+esc(limit(cfg.usage?.today_usd,cfg.limits?.daily_usd,"usd"))+'</strong></div>'+
                '<div class="ai-usage-line"><span>'+esc(copy.month+" · "+copy.cost)+'</span><strong>'+esc(limit(cfg.usage?.month_usd,cfg.limits?.monthly_usd,"usd"))+'</strong></div>'+
              '</div>';
            const select=document.getElementById("ai-default-model");
            const feedback=document.getElementById("ai-settings-feedback");
            select?.addEventListener("change",()=>{
              const [providerId,...rest]=select.value.split("|");
              const model=rest.join("|");
              savePreference(providerId,model);
              const chosenOption=available.find(item=>item.provider_id===providerId&&item.model===model);
              const heading=select.previousElementSibling;
              if(heading&&chosenOption)heading.textContent=chosenOption.model;
              if(feedback){feedback.textContent=copy.saved;window.setTimeout(()=>{feedback.textContent=""},1800)}
            });
          }catch(error){
            root.innerHTML='<div class="ai-settings-panel"><small>'+esc(copy.disabled)+'</small><strong>'+esc(copy.unavailable)+'</strong><p>'+esc(String(error?.message||copy.error))+'</p></div>';
          }
        }
        void load();
      })();
    </script>
  `;
}

export function settingsHubContent(zh) {
  const prefix = zh ? "/zh-cn" : "/en";
  const copy = zh ? {
    eyebrow:"SETTINGS",
    title:"设置你的 AERTEX",
    intro:"把最常用的偏好放在最前面，其余设置按功能分组。主题、语言、安全、AI 与存储都从这里进入。",
    theme:"主题与外观",
    themeMeta:"个性化",
    themeDetail:"系统、浅色、深色与强调色",
    openTheme:"调整主题",
    essentials:"常用",
    services:"服务",
    advanced:"其他",
    language:["语言","中文或 English"],
    security:["账户与安全","设备、登录历史与提醒"],
    ai:["AI 设置","Provider、模型与额度"],
    subscription:["订阅与权益","套餐、有效期与产品权益"],
    student:["学生资格","认证状态与学生价格资格"],
    storage:["AERTEX Drive","私人云盘与容量"],
    notifications:["通知","提醒与站内消息"],
    integrations:["第三方集成","外部服务与授权"]
  } : {
    eyebrow:"SETTINGS",
    title:"Make AERTEX yours",
    intro:"Keep the preferences you use most at the top, with everything else grouped by purpose. Theme, language, security, AI, and storage all start here.",
    theme:"Theme & Appearance",
    themeMeta:"Personalization",
    themeDetail:"System, light, dark, and accent color",
    openTheme:"Customize theme",
    essentials:"Essentials",
    services:"Services",
    advanced:"Other",
    language:["Language","Chinese or English"],
    security:["Account & Security","Devices, sign-ins, and alerts"],
    ai:["AI Settings","Providers, models, and limits"],
    subscription:["Subscription","Plans, validity, and entitlements"],
    student:["Student Eligibility","Verification status and student pricing"],
    storage:["AERTEX Drive","Private files and capacity"],
    notifications:["Notifications","Alerts and in-app messages"],
    integrations:["Integrations","External services and authorization"]
  };
  const availability = zh
    ? { ai:{meta:"可用"}, storage:{meta:"可用"}, subscription:{meta:"测试中"}, student:{meta:"可用"} }
    : { ai:{meta:"Available"}, storage:{meta:"Available"}, subscription:{meta:"Testing"}, student:{meta:"Available"} };
  const row = (item, href, icon, status = "") => `
    <a class="settings-stage-row" href="${href}">
      <span class="settings-stage-row-icon">${dashboardIcon(icon)}</span>
      <span class="settings-stage-row-copy"><strong>${item[0]}</strong><small>${item[1]}</small></span>
      ${status ? `<em>${status}</em>` : ""}
      <b aria-hidden="true">›</b>
    </a>`;
  return `
    <style>
      body.os-shell:has(.settings-stage) .os-hero{display:none!important}
      .settings-stage{display:grid;gap:18px}
      .settings-stage-hero{
        position:relative;isolation:isolate;overflow:hidden;
        display:grid;grid-template-columns:minmax(0,1.25fr) minmax(280px,.75fr);gap:clamp(24px,4vw,56px);align-items:end;
        min-height:290px;padding:clamp(28px,3.8vw,48px);
        border:1px solid var(--border);border-radius:30px;
        background:
          radial-gradient(520px 320px at 95% 0%,color-mix(in srgb,var(--primary) 18%,transparent),transparent 72%),
          linear-gradient(145deg,color-mix(in srgb,var(--card) 98%,#fff 2%),color-mix(in srgb,var(--surface) 92%,var(--primary) 3%));
        box-shadow:0 22px 64px rgba(0,0,0,.075),inset 0 1px 0 color-mix(in srgb,#fff 20%,transparent)
      }
      .settings-stage-hero-copy{align-self:end}.settings-stage-hero-copy>small{display:block;color:var(--primary);font-size:11px;font-weight:780;letter-spacing:.16em}
      .settings-stage-hero h2{max-width:12ch;margin:10px 0 13px;font-size:clamp(40px,5vw,70px)!important;line-height:.94;letter-spacing:-.062em!important}
      .settings-stage-hero p{max-width:58ch;margin:0;font-size:15px;line-height:1.65}
      .settings-theme-feature{
        position:relative;z-index:1;display:grid;gap:18px;min-height:205px;padding:20px;border:1px solid color-mix(in srgb,var(--border) 90%,transparent);
        border-radius:24px;background:color-mix(in srgb,var(--glass-heavy) 90%,transparent);-webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
        box-shadow:0 16px 38px rgba(0,0,0,.09),inset 0 1px 0 color-mix(in srgb,#fff 20%,transparent);color:var(--text);text-decoration:none;
        transition:transform .3s cubic-bezier(.16,1,.3,1),box-shadow .3s cubic-bezier(.16,1,.3,1),border-color .2s ease
      }
      .settings-theme-feature-top{display:flex;align-items:center;justify-content:space-between;gap:14px}.settings-theme-feature-top small{color:var(--muted);font-size:10px;font-weight:750;letter-spacing:.09em;text-transform:uppercase}
      .settings-theme-arrow{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:var(--fill);font-size:20px}
      .settings-theme-swatches{display:flex;align-items:center;gap:7px}.settings-theme-swatches i{width:25px;height:25px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(255,255,255,.22)}
      .settings-theme-swatches i:nth-child(1){background:#4964d8}.settings-theme-swatches i:nth-child(2){background:#2a9d8f}.settings-theme-swatches i:nth-child(3){background:#3a9d72}.settings-theme-swatches i:nth-child(4){background:#d49a2a}.settings-theme-swatches i:nth-child(5){background:#d95686}.settings-theme-swatches i:nth-child(6){background:#7559d9}
      .settings-theme-feature h3{margin:0;font-size:25px;letter-spacing:-.045em}.settings-theme-feature p{margin:5px 0 0;font-size:12px;line-height:1.5}
      .settings-theme-feature-bottom{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:auto}.settings-theme-feature-bottom strong{font-size:12px;color:var(--primary)}
      .settings-stage-columns{display:grid;grid-template-columns:1fr 1fr;gap:18px}
      .settings-stage-group{overflow:hidden;border:1px solid var(--border);border-radius:24px;background:var(--card);box-shadow:0 10px 30px rgba(0,0,0,.045)}
      .settings-stage-group-head{padding:18px 18px 10px;color:var(--muted);font-size:11px;font-weight:750;letter-spacing:.12em;text-transform:uppercase}
      .settings-stage-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;gap:12px;align-items:center;min-height:74px;padding:12px 16px;color:var(--text);text-decoration:none;border-top:1px solid var(--hairline);transition:background .18s ease,transform .2s cubic-bezier(.16,1,.3,1)}
      .settings-stage-row:first-of-type{border-top:0}.settings-stage-row-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:13px;background:var(--fill);color:var(--primary);box-shadow:inset 0 0 0 1px var(--border)}
      .settings-stage-row-icon .dashboard-icon{width:22px;height:22px;border-radius:0;background:transparent;box-shadow:none;color:currentColor;line-height:0}.settings-stage-row-icon .dashboard-icon svg{display:block;width:22px;height:22px;flex:0 0 22px;overflow:visible}.settings-stage-row-copy{min-width:0}.settings-stage-row-copy strong,.settings-stage-row-copy small{display:block}.settings-stage-row-copy strong{font-size:14px;letter-spacing:-.02em}.settings-stage-row-copy small{margin-top:4px;color:var(--muted);font-size:11px;line-height:1.35}
      .settings-stage-row em{font-style:normal;color:var(--quiet);font-size:10px}.settings-stage-row>b{color:var(--quiet);font-size:20px;font-weight:500}
      @media(hover:hover) and (pointer:fine){.settings-theme-feature:hover{transform:translateY(-3px);border-color:var(--border-strong);box-shadow:0 24px 56px rgba(0,0,0,.10)}.settings-stage-row:hover{background:var(--fill);transform:translateX(2px)}}
      @media(max-width:900px){.settings-stage-hero{grid-template-columns:1fr;min-height:0}.settings-stage-columns{grid-template-columns:1fr}}
      @media(max-width:560px){.settings-stage-hero{padding:22px 18px;border-radius:22px}.settings-stage-hero h2{font-size:clamp(38px,13vw,54px)!important}.settings-theme-feature{min-height:180px;border-radius:20px}.settings-stage-group{border-radius:20px}}
      @media(prefers-reduced-motion:reduce){.settings-theme-feature,.settings-stage-row{transition:none!important;transform:none!important}}
    </style>
    <section class="settings-stage">
      <section class="settings-stage-hero">
        <div class="settings-stage-hero-copy">
          <small>${copy.eyebrow}</small>
          <h2>${copy.title}</h2>
          <p>${copy.intro}</p>
        </div>
        <a class="settings-theme-feature" href="${prefix}/settings/appearance">
          <div class="settings-theme-feature-top"><small>${copy.themeMeta}</small><span class="settings-theme-arrow" aria-hidden="true">↗</span></div>
          <div class="settings-theme-swatches" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
          <div><h3>${copy.theme}</h3><p>${copy.themeDetail}</p></div>
          <div class="settings-theme-feature-bottom"><strong>${copy.openTheme}</strong><span>→</span></div>
        </a>
      </section>
      <div class="settings-stage-columns">
        <section class="settings-stage-group">
          <div class="settings-stage-group-head">${copy.essentials}</div>
          ${row(copy.language, prefix+"/settings/language", "language")}
          ${row(copy.security, prefix+"/settings/security", "security")}
          ${row(copy.ai, prefix+"/settings/ai", "ai", availability.ai.meta)}
        </section>
        <section class="settings-stage-group">
          <div class="settings-stage-group-head">${copy.services}</div>
          ${row(copy.subscription, prefix+"/settings/subscription", "account", availability.subscription.meta)}
          ${row(copy.student, prefix+"/settings/student", "users", availability.student.meta)}
          ${row(copy.storage, prefix+"/settings/storage", "storage", availability.storage.meta)}
          ${row(copy.notifications, prefix+"/settings/notifications", "notifications", zh ? "未开放" : "Soon")}
          ${row(copy.integrations, prefix+"/settings/integrations", "integrations", zh ? "未开放" : "Soon")}
        </section>
      </div>
    </section>
  `;
}

export function settingsFallbackContent(zh) {
  const prefix = zh ? "/zh-cn" : "/en";
  const items = zh
    ? [
        ["主题与外观", "可用", "系统、浅色、深色与强调色。", `${prefix}/settings/appearance`],
        ["语言", "可用", "中文或 English。", `${prefix}/settings/language`],
        ["账户与安全", "可用", "设备、登录历史和安全提醒。", `${prefix}/settings/security`],
        ["通知", "未开放", "提醒和站内消息。", `${prefix}/settings/notifications`],
        ["AI", "可用", "Provider、模型、额度和默认模型。", `${prefix}/settings/ai`],
        ["第三方集成", "未开放", "外部服务和授权。", `${prefix}/settings/integrations`],
        ["订阅与权益", "测试中", "套餐、有效期和产品权益。", `${prefix}/settings/subscription`],
        ["学生资格", "可用", "学生身份认证、状态和学生价格资格。", `${prefix}/settings/student`],
        ["存储", "可用", "AERTEX Drive 私人云盘。", `${prefix}/settings/storage`]
      ]
    : [
        ["Theme & Appearance", "Available", "System, light, dark, and accent color.", `${prefix}/settings/appearance`],
        ["Language", "Available", "Chinese or English.", `${prefix}/settings/language`],
        ["Account & Security", "Available", "Devices, sign-in history, and alerts.", `${prefix}/settings/security`],
        ["Notifications", "Unavailable", "Alerts and in-app messages.", `${prefix}/settings/notifications`],
        ["AI", "Available", "Providers, models, quotas, and default model.", `${prefix}/settings/ai`],
        ["Integrations", "Unavailable", "External services and authorization.", `${prefix}/settings/integrations`],
        ["Subscription", "Testing", "Plans, validity, and product entitlements.", `${prefix}/settings/subscription`],
        ["Student Eligibility", "Available", "Student-status verification and student-pricing eligibility.", `${prefix}/settings/student`],
        ["Storage", "Available", "Private files in AERTEX Drive.", `${prefix}/settings/storage`]
      ];
  return `<section class="os-grid settings-grid">${items.map(item => `<a class="os-card settings-card-link" href="${item[3]}"><small>${item[1]}</small><h2>${item[0]}</h2><p>${item[2]}</p><span class="settings-card-arrow" aria-hidden="true">›</span></a>`).join("")}</section>`;
}
