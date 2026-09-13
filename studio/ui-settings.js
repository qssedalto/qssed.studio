import { osHubGrid, osHubIcon } from "./ui-primitives.js";

export function settingsGeneralContent(zh) {
  const prefix = zh ? "/zh-cn" : "/en";
  const rows = zh ? [
    ["外观", "浅色 / 深色", `${prefix}/settings/appearance`, "appearance"],
    ["语言", "中文 / English", `${prefix}/settings/language`, "language"],
    ["账户与安全", "设备与登录", `${prefix}/settings/security`, "shield"]
  ] : [
    ["Appearance", "Light / Dark", `${prefix}/settings/appearance`, "appearance"],
    ["Language", "Chinese / English", `${prefix}/settings/language`, "language"],
    ["Account & Security", "Devices & sign-ins", `${prefix}/settings/security`, "shield"]
  ];
  return `
    <section class="os-card settings-general-card">
      <div class="settings-general-heading">
        ${osHubIcon("general")}
        <div>
          <small>${zh ? "通用设置" : "General Settings"}</small>
          <h2>${zh ? "基础与常用设置" : "Basics & Common Settings"}</h2>
          <p>${zh ? "这里保留跨模块的基础设置入口。具体选项仍在各自页面中管理，避免把不同层级的控制混在一起。" : "This page keeps cross-module basics together. Detailed controls remain on their dedicated pages instead of mixing unrelated levels."}</p>
        </div>
      </div>
      <div class="settings-general-list">
        ${rows.map(row => `<a href="${row[2]}">${osHubIcon(row[3])}<span><strong>${row[0]}</strong><small>${row[1]}</small></span><b aria-hidden="true">›</b></a>`).join("")}
      </div>
    </section>
    <section class="os-card settings-general-note">
      <strong>${zh ? "关于通用设置" : "About General"}</strong>
      <p>${zh ? "当前没有为尚未接入的功能创建无实际作用的开关。等对应服务具备真实配置与持久化能力后，再在这里加入可操作选项。" : "No placeholder switches are shown for features that are not connected yet. Controls will appear here only when they have real configuration and persistence behind them."}</p>
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
      <h2>${zh ? "登录设备列表" : "Login Devices"}</h2>
      <div id="audit-device-list" class="audit-devices"></div>
    </section>
    <section class="os-card audit-section">
      <h2>${zh ? "登录历史" : "Login History"}</h2>
      <div id="audit-login-timeline" class="audit-timeline"></div>
    </section>
    <section class="os-card audit-section">
      <h2>${zh ? "异常登录提示" : "Risk Alerts"}</h2>
      <div id="audit-risk-alerts" class="audit-alerts"></div>
    </section>
  `;
}

export function appearanceSettingsContent(zh) {
  return `
    <section class="os-card is-large settings-detail-card">
      <h2>${zh ? "显示模式" : "Display Mode"}</h2>
      <p>${zh ? "选择网页使用浅色或深色外观。设置会保存在当前浏览器中。" : "Choose light or dark appearance. The preference is saved in this browser."}</p>
      <div class="settings-choice-grid">
        <button class="settings-choice" type="button" data-settings-theme="light"><strong>${zh ? "浅色" : "Light"}</strong><span>${zh ? "始终使用浅色外观" : "Always use the light appearance"}</span></button>
        <button class="settings-choice" type="button" data-settings-theme="dark"><strong>${zh ? "深色" : "Dark"}</strong><span>${zh ? "始终使用深色外观" : "Always use the dark appearance"}</span></button>
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
      <h2>${zh ? "网页语言" : "Site Language"}</h2>
      <p>${zh ? "选择 QssedA Studio 的显示语言。切换后会保留当前设置页面。" : "Choose the display language for QssedA Studio. Switching keeps you on the current settings page."}</p>
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
    { title:"通用", meta:"基础", description:"查看网站基础行为与常用设置入口。", href:`${prefix}/settings/general`, icon:"general", featured:true, tone:"blue" },
    { title:"外观", meta:"可用", description:"切换浅色与深色显示模式。", href:`${prefix}/settings/appearance`, icon:"appearance" },
    { title:"语言", meta:"可用", description:"在中文与 English 之间切换网页语言。", href:`${prefix}/settings/language`, icon:"language" },
    { title:"账户与安全", meta:"可用", description:"查看设备、登录历史与安全记录。", href:`${prefix}/settings/security`, icon:"shield" },
    { title:"通知", meta:"规划中", description:"管理提醒、站内消息与通知偏好。", href:`${prefix}/settings/notifications`, icon:"notifications" },
    { title:"AI 设置", meta:"规划中", description:"管理 AI Provider、模型与个人 AI 偏好。", href:`${prefix}/settings/ai`, icon:"ai" },
    { title:"第三方集成", meta:"规划中", description:"管理外部服务与账号授权。", href:`${prefix}/settings/integrations`, icon:"integrations" },
    { title:"存储管理", meta:"已连接", description:"管理当前账号的私人 Cloudflare R2 文件。", href:`${prefix}/settings/storage`, icon:"storage" }
  ] : [
    { title:"General", meta:"Basics", description:"Review general site behavior and common settings entry points.", href:`${prefix}/settings/general`, icon:"general", featured:true, tone:"blue" },
    { title:"Appearance", meta:"Available", description:"Switch between light and dark display modes.", href:`${prefix}/settings/appearance`, icon:"appearance" },
    { title:"Language", meta:"Available", description:"Switch the interface between Chinese and English.", href:`${prefix}/settings/language`, icon:"language" },
    { title:"Account & Security", meta:"Available", description:"Review devices, login history, and security records.", href:`${prefix}/settings/security`, icon:"shield" },
    { title:"Notifications", meta:"Planned", description:"Manage reminders, in-app messages, and notification preferences.", href:`${prefix}/settings/notifications`, icon:"notifications" },
    { title:"AI Settings", meta:"Planned", description:"Manage AI providers, models, and personal AI preferences.", href:`${prefix}/settings/ai`, icon:"ai" },
    { title:"Integrations", meta:"Planned", description:"Manage external services and account authorizations.", href:`${prefix}/settings/integrations`, icon:"integrations" },
    { title:"Storage", meta:"Connected", description:"Manage private Cloudflare R2 files for this account.", href:`${prefix}/settings/storage`, icon:"storage" }
  ];
  return osHubGrid(items, "settings-hub-grid");
}

export function settingsFallbackContent(zh) {
  const prefix = zh ? "/zh-cn" : "/en";
  const items = zh
    ? [
        ["外观", "可用", "设置浅色或深色主题，以及网页的整体显示方式。", `${prefix}/settings/appearance`],
        ["语言", "可用", "设置网页显示语言；当前支持中文与 English。", `${prefix}/settings/language`],
        ["账户与安全", "可用", "查看当前设备、登录设备、登录历史与异常登录记录。", `${prefix}/settings/security`],
        ["通知", "规划中", "管理提醒、站内消息与其他通知偏好。", `${prefix}/settings/notifications`],
        ["AI 设置", "规划中", "管理 AI Provider、模型与个人 AI 偏好。", `${prefix}/settings/ai`],
        ["第三方集成", "规划中", "管理可连接的第三方服务与账号授权。", `${prefix}/settings/integrations`],
        ["存储管理", "已连接", "上传、下载和管理仅属于当前账号的私人 R2 文件。", `${prefix}/settings/storage`]
      ]
    : [
        ["Appearance", "Available", "Choose light or dark mode and manage the site's overall display.", `${prefix}/settings/appearance`],
        ["Language", "Available", "Choose the site language; Chinese and English are currently supported.", `${prefix}/settings/language`],
        ["Account & Security", "Available", "Review the current device, signed-in devices, login history, and risk records.", `${prefix}/settings/security`],
        ["Notifications", "Planned", "Manage reminders, in-app messages, and other notification preferences.", `${prefix}/settings/notifications`],
        ["AI Settings", "Planned", "Manage AI providers, models, and personal AI preferences.", `${prefix}/settings/ai`],
        ["Integrations", "Planned", "Manage connected third-party services and account authorizations.", `${prefix}/settings/integrations`],
        ["Storage", "Connected", "Upload, download, and manage private R2 files belonging only to your account.", `${prefix}/settings/storage`]
      ];
  return `<section class="os-grid settings-grid">${items.map(item => `<a class="os-card settings-card-link" href="${item[3]}"><small>${item[1]}</small><h2>${item[0]}</h2><p>${item[2]}</p><span class="settings-card-arrow" aria-hidden="true">›</span></a>`).join("")}</section>`;
}
