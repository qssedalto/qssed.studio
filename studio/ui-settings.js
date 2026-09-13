export function settingsGeneralContent(zh, osHubIcon) {
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
