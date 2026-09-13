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
    language: '<path d="M4 5h10M9 5c-.2 5-2.3 8.3-5 10M6 9c1.8 2.8 4 4.8 7 6M14 10h6M17 7v10M14 17h6"/>'
  };
  return '<span class="dashboard-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (icons[name] || icons.info) + '</svg></span>';
}

export function dashboardContent(zh) {
  const prefix = zh ? "/zh-cn" : "/en";
  const shortcuts = zh ? [
    ["用户资料","完善你的头像、签名与主页","profile",`${prefix}/profile/details`],
    ["工作台","进入工作区主要操作界面","workbench",`${prefix}/workspace/workbench`],
    ["私人存储","管理当前账号的 R2 文件","storage",`${prefix}/settings/storage`],
    ["收藏链接","打开你的链接收藏与常用入口","links",`${prefix}/info/links`],
    ["账户与安全","查看设备、登录与安全记录","security",`${prefix}/settings/security`],
    ["设置","外观、语言与其他偏好入口","settings",`${prefix}/settings`]
  ] : [
    ["Profile Details","Edit your photo, signature, and personal page","profile",`${prefix}/profile/details`],
    ["Workbench","Open the main operating surface in Workspace","workbench",`${prefix}/workspace/workbench`],
    ["Private Storage","Manage R2 files for this account","storage",`${prefix}/settings/storage`],
    ["Saved Links","Open saved links and common destinations","links",`${prefix}/info/links`],
    ["Account & Security","Review devices, sign-ins, and security records","security",`${prefix}/settings/security`],
    ["Settings","Appearance, language, and preference entry points","settings",`${prefix}/settings`]
  ];

  const moduleRows = zh ? [
    ["个人主页","已接入","头像、背景、个性签名、状态、兴趣与链接库。","profile",`${prefix}/profile`],
    ["私人存储","已连接","Cloudflare R2 私人文件空间。","storage",`${prefix}/settings/storage`],
    ["工作区","入口已建立","工作台、项目、实验、草稿与任务已有独立路由。","workbench",`${prefix}/workspace`],
    ["信息中心","部分可用","收藏链接等入口可用，其余模块等待数据源。","info",`${prefix}/info`]
  ] : [
    ["Profile","Connected","Profile photo, background, signature, presence, interests, and links.","profile",`${prefix}/profile`],
    ["Private Storage","Connected","Private Cloudflare R2 file space.","storage",`${prefix}/settings/storage`],
    ["Workspace","Routes ready","Workbench, projects, experiments, drafts, and tasks have distinct routes.","workbench",`${prefix}/workspace`],
    ["Information","Partially available","Saved links are available; other modules still await data sources.","info",`${prefix}/info`]
  ];

  return `
    <section class="dashboard-welcome">
      <div class="dashboard-welcome-copy">
        <span class="dashboard-eyebrow">${zh ? "QssedA Studio" : "QssedA Studio"}</span>
        <h2>${zh ? "欢迎回来" : "Welcome back"}</h2>
        <p>${zh ? "从这里继续进入你的个人空间、工作区、收藏内容与私人存储。首页只展示真实可用的入口，不制造没有数据来源的统计数字。" : "Continue into your profile, workspace, saved content, and private storage. The dashboard only surfaces real entry points rather than invented statistics."}</p>
        <div class="dashboard-welcome-actions">
          <a class="dashboard-primary-action" href="${prefix}/workspace/workbench">${zh ? "打开工作台" : "Open Workbench"}<span>›</span></a>
          <a class="dashboard-secondary-action" href="${prefix}/profile/details">${zh ? "编辑用户资料" : "Edit Profile"}<span>›</span></a>
        </div>
      </div>
      <div class="dashboard-today-card" aria-label="${zh ? "本次访问" : "This visit"}">
        ${dashboardIcon("clock")}
        <div>
          <small>${zh ? "本次访问" : "This visit"}</small>
          <strong id="dashboard-live-time">--:--</strong>
          <span id="dashboard-live-date">----</span>
        </div>
      </div>
    </section>

    <section class="dashboard-section">
      <div class="dashboard-section-head">
        <div><small>${zh ? "快速开始" : "Quick Start"}</small><h2>${zh ? "继续使用" : "Continue"}</h2></div>
        <span>${zh ? "常用入口" : "Common destinations"}</span>
      </div>
      <div class="dashboard-shortcuts">
        ${shortcuts.map(item => `<a class="dashboard-shortcut" href="${item[3]}">${dashboardIcon(item[2])}<span><strong>${item[0]}</strong><small>${item[1]}</small></span><b aria-hidden="true">›</b></a>`).join("")}
      </div>
    </section>

    <section class="dashboard-split">
      <article class="os-card dashboard-module-card">
        <div class="dashboard-section-head compact">
          <div><small>${zh ? "Studio 概览" : "Studio Overview"}</small><h2>${zh ? "当前模块" : "Current Modules"}</h2></div>
        </div>
        <div class="dashboard-module-list">
          ${moduleRows.map(row => `<a href="${row[4]}">${dashboardIcon(row[3])}<span><strong>${row[0]}</strong><small>${row[2]}</small></span><em>${row[1]}</em><b aria-hidden="true">›</b></a>`).join("")}
        </div>
      </article>

      <article class="os-card dashboard-session-card">
        <div class="dashboard-section-head compact">
          <div><small>${zh ? "当前环境" : "Current Environment"}</small><h2>${zh ? "本次使用" : "This Session"}</h2></div>
        </div>
        <div class="dashboard-session-facts">
          <div>${dashboardIcon("appearance")}<span><small>${zh ? "外观" : "Appearance"}</small><strong id="dashboard-theme-label">—</strong></span></div>
          <div>${dashboardIcon("language")}<span><small>${zh ? "语言" : "Language"}</small><strong>${zh ? "简体中文" : "English"}</strong></span></div>
          <div>${dashboardIcon("storage")}<span><small>${zh ? "存储" : "Storage"}</small><strong>Cloudflare R2</strong></span></div>
        </div>
        <a class="dashboard-session-settings" href="${prefix}/settings">${zh ? "管理设置" : "Manage settings"}<span>›</span></a>
      </article>
    </section>

    <section class="os-card dashboard-activity-card">
      <div class="dashboard-section-head compact">
        <div><small>${zh ? "活动" : "Activity"}</small><h2>${zh ? "最近动态" : "Recent Activity"}</h2></div>
      </div>
      <div class="dashboard-empty-activity">
        <span></span>
        <strong>${zh ? "暂时没有统一活动流" : "No unified activity feed yet"}</strong>
        <p>${zh ? "项目、实验、草稿和任务的数据模型接入后，这里再展示真实的最近活动；目前不使用示例数据冒充历史记录。" : "Real recent activity will appear here after projects, experiments, drafts, and tasks share persistent data. Placeholder activity is intentionally not shown as history."}</p>
        <a href="${prefix}/workspace">${zh ? "查看工作区" : "View Workspace"} <b>›</b></a>
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
