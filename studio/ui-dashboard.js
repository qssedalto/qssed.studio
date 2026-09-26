export function dashboardIcon(name) {
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
    language: '<path d="M4 5h10M9 5c-.2 5-2.3 8.3-5 10M6 9c1.8 2.8 4 4.8 7 6M14 10h6M17 7v10M14 17h6"/>',
    intelligence: '<path d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v6a2.5 2.5 0 0 1-2.5 2.5H11l-4 3v-3.2A2.5 2.5 0 0 1 5 13.5z"/><path d="M9 9.5h6M9 12.5h4"/>',
    admin: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M8 9h8M8 13h5M16 13h.01"/>',
    wishes: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M12 7v6M9.5 10h5"/>'
  };
  return '<span class="dashboard-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (icons[name] || icons.info) + '</svg></span>';
}

export function dashboardContent(zh, options = {}) {
  const prefix = zh ? "/zh-cn" : "/en";
  const productLinks = options && typeof options === "object" ? options : {};
  const gptHref = String(productLinks.gptHref || "");
  const adminHref = String(productLinks.adminHref || "");

  const shortcuts = zh ? [
    ...(gptHref ? [["AERTEX Intelligence","打开 GPT 工作空间","intelligence",gptHref]] : []),
    ...(adminHref ? [["管理员控制台","进入独立管理控制面","admin",adminHref]] : []),
    ["祝福链接","生日、中秋与专属姓名分享链接","wishes",`${prefix}/wishes`],
    ["用户资料","头像、签名和主页信息","profile",`${prefix}/profile/details`],
    ["工作台","打开工作区","workbench",`${prefix}/workspace/workbench`],
    ["私人存储","管理 R2 文件","storage",`${prefix}/settings/storage`],
    ["收藏链接","常用链接和收藏","links",`${prefix}/info/links`],
    ["账户与安全","设备和登录记录","security",`${prefix}/settings/security`],
    ["设置","外观、语言和其他设置","settings",`${prefix}/settings`]
  ] : [
    ...(gptHref ? [["AERTEX Intelligence","Open GPT workspace","intelligence",gptHref]] : []),
    ...(adminHref ? [["Administration","Open isolated control plane","admin",adminHref]] : []),
    ["Wish Links","Birthday, Mid-Autumn, and named greeting links","wishes",`${prefix}/wishes`],
    ["Profile","Photo, signature, and profile details","profile",`${prefix}/profile/details`],
    ["Workbench","Open Workspace","workbench",`${prefix}/workspace/workbench`],
    ["Private Storage","Manage R2 files","storage",`${prefix}/settings/storage`],
    ["Saved Links","Links and bookmarks","links",`${prefix}/info/links`],
    ["Account & Security","Devices and sign-in history","security",`${prefix}/settings/security`],
    ["Settings","Appearance, language, and more","settings",`${prefix}/settings`]
  ];

  const moduleRows = zh ? [
    ["个人主页","可用","资料、状态、兴趣和链接。","profile",`${prefix}/profile`],
    ["私人存储","可用","Cloudflare R2 私人文件。","storage",`${prefix}/settings/storage`],
    ["工作区","部分可用","工作台、项目、实验、草稿和任务。","workbench",`${prefix}/workspace`],
    ["信息中心","部分可用","知识库、链接和账号摘要。","info",`${prefix}/info`]
  ] : [
    ["Profile","Available","Profile details, presence, interests, and links.","profile",`${prefix}/profile`],
    ["Private Storage","Available","Private Cloudflare R2 files.","storage",`${prefix}/settings/storage`],
    ["Workspace","Partial","Workbench, projects, experiments, drafts, and tasks.","workbench",`${prefix}/workspace`],
    ["Information","Partial","Knowledge, links, and account summaries.","info",`${prefix}/info`]
  ];

  return `
    <section class="dashboard-welcome">
      <div class="dashboard-welcome-copy">
        <span class="dashboard-eyebrow">AERTEX</span>
        <h2>${zh ? "欢迎回来" : "Welcome back"}</h2>
        <p>${zh ? "继续上次的工作，或者直接打开常用功能。" : "Pick up where you left off or open a common tool."}</p>
        <div class="dashboard-welcome-actions">
          <a class="dashboard-primary-action" href="${prefix}/workspace/workbench">${zh ? "打开工作台" : "Open Workbench"}<span>›</span></a>
          <a class="dashboard-secondary-action" href="${prefix}/profile/details">${zh ? "用户资料" : "Profile"}<span>›</span></a>
        </div>
      </div>
      <div class="dashboard-today-card" aria-label="${zh ? "当前时间" : "Current time"}">
        <div class="dashboard-today-main">
          ${dashboardIcon("clock")}
          <div class="dashboard-today-copy">
            <small>${zh ? "现在" : "Now"}</small>
            <strong id="dashboard-live-time">--:--</strong>
            <span id="dashboard-live-date">----</span>
          </div>
        </div>
        <div class="dashboard-today-meta">
          <div><small>${zh ? "时区" : "Time zone"}</small><strong id="dashboard-live-zone">—</strong></div>
          <div><small>${zh ? "日历" : "Calendar"}</small><strong id="dashboard-live-week">—</strong></div>
        </div>
      </div>
    </section>

    <section class="dashboard-section">
      <div class="dashboard-section-head">
        <div><small>${zh ? "快捷入口" : "Shortcuts"}</small><h2>${zh ? "常用" : "Common"}</h2></div>
      </div>
      <div class="dashboard-shortcuts">
        ${shortcuts.map(item => `<a class="dashboard-shortcut" href="${item[3]}">${dashboardIcon(item[2])}<span><strong>${item[0]}</strong><small>${item[1]}</small></span><b aria-hidden="true">›</b></a>`).join("")}
      </div>
    </section>

    <section class="dashboard-split">
      <article class="os-card dashboard-module-card">
        <div class="dashboard-section-head compact">
          <div><small>${zh ? "模块" : "Modules"}</small><h2>${zh ? "当前状态" : "Status"}</h2></div>
        </div>
        <div class="dashboard-module-list">
          ${moduleRows.map(row => `<a href="${row[4]}">${dashboardIcon(row[3])}<span><strong>${row[0]}</strong><small>${row[2]}</small></span><em>${row[1]}</em><b aria-hidden="true">›</b></a>`).join("")}
        </div>
      </article>

      <article class="os-card dashboard-session-card">
        <div class="dashboard-section-head compact">
          <div><small>${zh ? "当前" : "Current"}</small><h2>${zh ? "环境" : "Environment"}</h2></div>
        </div>
        <div class="dashboard-session-facts">
          <div>${dashboardIcon("appearance")}<span><small>${zh ? "外观" : "Appearance"}</small><strong id="dashboard-theme-label">—</strong></span></div>
          <div>${dashboardIcon("language")}<span><small>${zh ? "语言" : "Language"}</small><strong>${zh ? "简体中文" : "English"}</strong></span></div>
          <div>${dashboardIcon("storage")}<span><small>${zh ? "存储" : "Storage"}</small><strong>Cloudflare R2</strong></span></div>
        </div>
        <a class="dashboard-session-settings" href="${prefix}/settings">${zh ? "设置" : "Settings"}<span>›</span></a>
      </article>
    </section>

    <section class="os-card dashboard-activity-card">
      <div class="dashboard-section-head compact">
        <div><small>${zh ? "活动" : "Activity"}</small><h2>${zh ? "最近动态" : "Recent"}</h2></div>
      </div>
      <div class="dashboard-empty-activity">
        <span></span>
        <strong>${zh ? "暂无动态" : "No recent activity"}</strong>
        <p>${zh ? "项目、草稿和任务接入后会显示在这里。" : "Projects, drafts, and tasks will appear here once connected."}</p>
        <a href="${prefix}/workspace">${zh ? "打开工作区" : "Open Workspace"} <b>›</b></a>
      </div>
    </section>

    <script>
      (() => {
        const time = document.getElementById("dashboard-live-time");
        const date = document.getElementById("dashboard-live-date");
        const zone = document.getElementById("dashboard-live-zone");
        const week = document.getElementById("dashboard-live-week");
        const theme = document.getElementById("dashboard-theme-label");
        const zh = ${zh ? "true" : "false"};
        const isoWeek = value => {
          const d = new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
          const day = d.getUTCDay() || 7;
          d.setUTCDate(d.getUTCDate() + 4 - day);
          const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
          return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        };
        const paint = () => {
          const now = new Date();
          if (time) time.textContent = new Intl.DateTimeFormat(zh ? "zh-CN" : "en", { hour:"2-digit", minute:"2-digit", hour12:false }).format(now);
          if (date) date.textContent = new Intl.DateTimeFormat(zh ? "zh-CN" : "en", { year:"numeric", month:"long", day:"numeric", weekday:"short" }).format(now);
          if (zone) zone.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
          if (week) week.textContent = zh ? ("第 " + isoWeek(now) + " 周") : ("Week " + isoWeek(now));
          if (theme) {
            const current = document.documentElement.dataset.theme || "light";
            theme.textContent = current === "dark" ? (zh ? "深色" : "Dark") : (zh ? "浅色" : "Light");
          }
        };
        paint();
        window.setInterval(paint, 30000);
        new MutationObserver(paint).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
      })();
    </script>
  `;
}
