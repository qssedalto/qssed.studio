import { osHubGrid, osHubIcon } from "./ui-primitives.js";

export function settingsGeneralContent(zh) {
  const prefix = zh ? "/zh-cn" : "/en";
  const rows = zh ? [
    ["外观", "浅色或深色", `${prefix}/settings/appearance`, "appearance"],
    ["语言", "中文或 English", `${prefix}/settings/language`, "language"],
    ["账户与安全", "设备和登录记录", `${prefix}/settings/security`, "shield"]
  ] : [
    ["Appearance", "Light or dark", `${prefix}/settings/appearance`, "appearance"],
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
  return `
    <section class="os-card is-large settings-detail-card">
      <h2>${zh ? "显示模式" : "Appearance"}</h2>
      <p>${zh ? "选择浅色或深色。设置保存在当前浏览器。" : "Choose light or dark. This setting is saved in the current browser."}</p>
      <div class="settings-choice-grid">
        <button class="settings-choice" type="button" data-settings-theme="light"><strong>${zh ? "浅色" : "Light"}</strong><span>${zh ? "浅色界面" : "Light interface"}</span></button>
        <button class="settings-choice" type="button" data-settings-theme="dark"><strong>${zh ? "深色" : "Dark"}</strong><span>${zh ? "深色界面" : "Dark interface"}</span></button>
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
    </script>
  `;
}

export function languageSettingsContent(zh) {
  return `
    <section class="os-card is-large settings-detail-card">
      <h2>${zh ? "显示语言" : "Language"}</h2>
      <p>${zh ? "选择 AERTEX 的界面语言。" : "Choose the interface language for AERTEX."}</p>
      <div class="settings-choice-grid">
        <a class="settings-choice ${zh ? "is-selected" : ""}" href="/zh-cn/settings/language"><strong>中文</strong><span>简体中文</span></a>
        <a class="settings-choice ${zh ? "" : "is-selected"}" href="/en/settings/language"><strong>English</strong><span>English</span></a>
      </div>
    </section>
  `;
}

export function settingsHubContent(zh) {
  const prefix = zh ? "/zh-cn" : "/en";
  const items = zh ? [
    { title:"通用", meta:"设置", description:"常用设置。", href:`${prefix}/settings/general`, icon:"general", featured:true, tone:"blue" },
    { title:"外观", meta:"可用", description:"浅色或深色。", href:`${prefix}/settings/appearance`, icon:"appearance" },
    { title:"语言", meta:"可用", description:"中文或 English。", href:`${prefix}/settings/language`, icon:"language" },
    { title:"账户与安全", meta:"可用", description:"设备、登录历史和安全提醒。", href:`${prefix}/settings/security`, icon:"shield" },
    { title:"通知", meta:"未开放", description:"提醒和站内消息。", href:`${prefix}/settings/notifications`, icon:"notifications" },
    { title:"AI", meta:"未开放", description:"Provider、模型和偏好。", href:`${prefix}/settings/ai`, icon:"ai" },
    { title:"第三方集成", meta:"未开放", description:"外部服务和授权。", href:`${prefix}/settings/integrations`, icon:"integrations" },
    { title:"存储", meta:"可用", description:"私人 Cloudflare R2 文件。", href:`${prefix}/settings/storage`, icon:"storage" }
  ] : [
    { title:"General", meta:"Settings", description:"Common settings.", href:`${prefix}/settings/general`, icon:"general", featured:true, tone:"blue" },
    { title:"Appearance", meta:"Available", description:"Light or dark.", href:`${prefix}/settings/appearance`, icon:"appearance" },
    { title:"Language", meta:"Available", description:"Chinese or English.", href:`${prefix}/settings/language`, icon:"language" },
    { title:"Account & Security", meta:"Available", description:"Devices, sign-in history, and alerts.", href:`${prefix}/settings/security`, icon:"shield" },
    { title:"Notifications", meta:"Unavailable", description:"Alerts and in-app messages.", href:`${prefix}/settings/notifications`, icon:"notifications" },
    { title:"AI", meta:"Unavailable", description:"Providers, models, and preferences.", href:`${prefix}/settings/ai`, icon:"ai" },
    { title:"Integrations", meta:"Unavailable", description:"External services and authorization.", href:`${prefix}/settings/integrations`, icon:"integrations" },
    { title:"Storage", meta:"Available", description:"Private Cloudflare R2 files.", href:`${prefix}/settings/storage`, icon:"storage" }
  ];
  return osHubGrid(items, "settings-hub-grid");
}

export function settingsFallbackContent(zh) {
  const prefix = zh ? "/zh-cn" : "/en";
  const items = zh
    ? [
        ["外观", "可用", "浅色或深色。", `${prefix}/settings/appearance`],
        ["语言", "可用", "中文或 English。", `${prefix}/settings/language`],
        ["账户与安全", "可用", "设备、登录历史和安全提醒。", `${prefix}/settings/security`],
        ["通知", "未开放", "提醒和站内消息。", `${prefix}/settings/notifications`],
        ["AI", "未开放", "Provider、模型和偏好。", `${prefix}/settings/ai`],
        ["第三方集成", "未开放", "外部服务和授权。", `${prefix}/settings/integrations`],
        ["存储", "可用", "私人 R2 文件。", `${prefix}/settings/storage`]
      ]
    : [
        ["Appearance", "Available", "Light or dark.", `${prefix}/settings/appearance`],
        ["Language", "Available", "Chinese or English.", `${prefix}/settings/language`],
        ["Account & Security", "Available", "Devices, sign-in history, and alerts.", `${prefix}/settings/security`],
        ["Notifications", "Unavailable", "Alerts and in-app messages.", `${prefix}/settings/notifications`],
        ["AI", "Unavailable", "Providers, models, and preferences.", `${prefix}/settings/ai`],
        ["Integrations", "Unavailable", "External services and authorization.", `${prefix}/settings/integrations`],
        ["Storage", "Available", "Private R2 files.", `${prefix}/settings/storage`]
      ];
  return `<section class="os-grid settings-grid">${items.map(item => `<a class="os-card settings-card-link" href="${item[3]}"><small>${item[1]}</small><h2>${item[0]}</h2><p>${item[2]}</p><span class="settings-card-arrow" aria-hidden="true">›</span></a>`).join("")}</section>`;
}
