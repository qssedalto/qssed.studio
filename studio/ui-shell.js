import { TEXT } from "./config.js";
import { escapeHtmlText } from "./html-utils.js";
import { profileClientScript, profileContent } from "./ui-profile.js";
import { appearanceSettingsContent, languageSettingsContent, securityAuditContent, settingsGeneralContent } from "./ui-settings.js";
import { storageClientScript, storageSettingsContent } from "./ui-storage.js";
import { html, json } from "./routing.js";
import { adminClientScript, auditClientScript, baseHead, supabaseScript, themeScript, topControls } from "./ui-core.js";
import { osStyles } from "./ui-styles.js";

export function osPage(t, links, pathname, ipInfo, cachedOsUserLabel = "") {
  const path = pathname;
  const zh = t === TEXT.zh;
  const copy = buildOsCopy(zh);
  const page = copy.pages[path] || copy.pages["/dashboard"];
  const activeSection = page.section;
  const adminPath = path.startsWith("/admin");
  const dashboardPath = path === "/dashboard";

  return `
<!DOCTYPE html>
<html>
<head>
  ${baseHead(page.title + " · " + t.studioName)}
  ${osStyles()}
  <script>
    (() => {
      try {
        const compactMedia = window.matchMedia("(max-width:1050px)");
        if (!compactMedia.matches) return;
        const state = sessionStorage.getItem("qssed-compact-view-v1");
        const currentPath = ${JSON.stringify(path)};
        const showContent = state === "content" || (state !== "menu" && currentPath !== "/dashboard");
        document.documentElement.classList.toggle("compact-content-view", showContent);
        document.documentElement.classList.toggle("compact-menu-view", !showContent);
      } catch {}
    })();
  </script>
</head>
<body class="os-shell" data-admin-path="${adminPath ? "true" : "false"}">
  ${topControls(links, t)}
  <div id="compact-back-zone" class="compact-back-zone">
    <button id="compact-back-button" class="compact-back-button" type="button" aria-label="${zh ? "返回导航" : "Back to navigation"}">
      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
        <path d="M14.5 5.5 8 12l6.5 6.5"/>
      </svg>
    </button>
  </div>
  <div class="os-layout">
    <aside id="os-sidebar" class="os-sidebar">
      <a class="os-brand" href="${links.dashboard}">
        <span class="os-brand-mark">Q</span>
        <span>
          <strong>QssedA Studio</strong>
          <small>${copy.platform}</small>
        </span>
      </a>
      <div class="os-user">
        <strong>${t.account}</strong>
        <span id="os-user-name">${escapeHtmlText(cachedOsUserLabel)}</span>
        <button id="os-signout-button" class="os-signout-button" type="button">
          <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
            <path d="M10 5H6.8A1.8 1.8 0 0 0 5 6.8v10.4A1.8 1.8 0 0 0 6.8 19H10"/>
            <path d="M14.5 8.5 18 12l-3.5 3.5M18 12H9"/>
          </svg>
          <span id="os-signout-label">${zh ? "退出登录" : "Sign Out"}</span>
        </button>
      </div>
      ${renderOsNav(copy, activeSection, path)}
    </aside>
    <script>
      try {
        const sidebar = document.getElementById("os-sidebar");
        const sidebarKey = "qssed-sidebar-scroll-v1";
        const compactViewKey = "qssed-compact-view-v1";
        const compactMedia = window.matchMedia("(max-width:1050px)");
        const savedSidebarScroll = Number(sessionStorage.getItem(sidebarKey) || "0");
        if (sidebar && Number.isFinite(savedSidebarScroll)) {
          sidebar.scrollTop = savedSidebarScroll;
          requestAnimationFrame(() => { sidebar.scrollTop = savedSidebarScroll; });
          const saveSidebarScroll = () => {
            try { sessionStorage.setItem(sidebarKey, String(sidebar.scrollTop)); } catch {}
          };
          sidebar.addEventListener("scroll", saveSidebarScroll, { passive: true });
          sidebar.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
            saveSidebarScroll();
            if (compactMedia.matches) {
              try { sessionStorage.setItem(compactViewKey, "content"); } catch {}
            }
          }, { capture: true }));
        }
      } catch {}
    </script>

    <main class="os-main">
      <section class="os-hero">
        <div>
          ${dashboardPath ? `<p class="os-kicker">${copy.kicker}</p>` : ""}
          <h1>${page.title}</h1>
          ${page.description ? `<p>${page.description}</p>` : ""}
        </div>
        ${dashboardPath ? `<a class="os-ai" href="${copy.aiHref}">
          <span>${copy.aiLabel}</span>
          <strong>${copy.aiTitle}</strong>
        </a>` : ""}
      </section>

      <section id="admin-lock" class="os-lock" style="display:none;">
        <strong>${t.adminOnly}</strong>
        <p>${copy.adminLock}</p>
      </section>

      <section id="os-content"${adminPath ? ' style="visibility:hidden"' : ""}>
        ${renderOsContent(path, copy)}
      </section>
    </main>
  </div>

  ${supabaseScript()}
  ${path === "/settings/storage" ? storageClientScript(zh, links.login) : ""}
  ${auditClientScript(ipInfo)}
  ${profileClientScript()}
  ${adminClientScript(ipInfo)}
  <script>
    const loginUrl = ${JSON.stringify(links.login)};
    const isAdminPath = document.body.dataset.adminPath === "true";
    const compactViewKey = "qssed-compact-view-v1";
    const compactSidebarKey = "qssed-sidebar-scroll-v1";
    const compactMedia = window.matchMedia("(max-width:1050px)");

    function applyCompactViewMode() {
      if (!compactMedia.matches) {
        document.documentElement.classList.remove("compact-content-view", "compact-menu-view");
        return;
      }
      let state = null;
      try { state = sessionStorage.getItem(compactViewKey); } catch {}
      const showContent = state === "content" || (state !== "menu" && ${JSON.stringify(path)} !== "/dashboard");
      document.documentElement.classList.toggle("compact-content-view", showContent);
      document.documentElement.classList.toggle("compact-menu-view", !showContent);
    }

    function showCompactNavigation() {
      if (!compactMedia.matches) return;
      try { sessionStorage.setItem(compactViewKey, "menu"); } catch {}
      document.documentElement.classList.remove("compact-content-view");
      document.documentElement.classList.add("compact-menu-view");
      const sidebar = document.getElementById("os-sidebar");
      const saved = Number(sessionStorage.getItem(compactSidebarKey) || "0");
      requestAnimationFrame(() => {
        if (sidebar && Number.isFinite(saved)) sidebar.scrollTop = saved;
      });
    }

    document.getElementById("compact-back-button")?.addEventListener("click", showCompactNavigation);

    const signOutButton = document.getElementById("os-signout-button");
    const signOutLabel = document.getElementById("os-signout-label");

    async function signOutCurrentSession() {
      if (!signOutButton || signOutButton.disabled) return;

      const idleLabel = ${JSON.stringify(zh ? "退出登录" : "Sign Out")};
      signOutButton.disabled = true;
      if (signOutLabel) signOutLabel.textContent = ${JSON.stringify(zh ? "正在退出…" : "Signing out…")};

      try {
        const { error } = await supabaseClient.auth.signOut({ scope: "local" });
        if (error) throw error;
      } catch (error) {
        console.error("Sign out failed", error);
        if (signOutLabel) signOutLabel.textContent = ${JSON.stringify(zh ? "退出失败" : "Sign out failed")};
        window.setTimeout(() => {
          signOutButton.disabled = false;
          if (signOutLabel) signOutLabel.textContent = idleLabel;
        }, 1600);
        return;
      }

      try {
        document.cookie = "qssed-os-user-name=; Path=/; Max-Age=0; SameSite=Lax; Secure";
      } catch {}
      try { if (typeof clearProfileUiCaches === "function") clearProfileUiCaches(); } catch {}
      try { if (typeof clearAdminUiCaches === "function") clearAdminUiCaches(); } catch {}
      try {
        [
          "qssed-os-user-name",
          "qssed-sidebar-scroll-v1",
          "qssed-compact-view-v1"
        ].forEach(key => sessionStorage.removeItem(key));
      } catch {}

      window.location.replace(loginUrl);
    }

    signOutButton?.addEventListener("click", signOutCurrentSession);

    if (typeof compactMedia.addEventListener === "function") {
      compactMedia.addEventListener("change", applyCompactViewMode);
    } else if (typeof compactMedia.addListener === "function") {
      compactMedia.addListener(applyCompactViewMode);
    }

    async function restoreWarmAdminSnapshot() {
      if (!isAdminPath) return;
      try {
        const access = JSON.parse(sessionStorage.getItem("qssed-admin-access-v1") || "null");
        const snapshot = sessionStorage.getItem("qssed-admin-view-v1:" + location.pathname);
        if (!access?.user_id || !snapshot) return;

        const { data } = await supabaseClient.auth.getSession();
        const localUserId = data?.session?.user?.id || "";
        if (!localUserId || localUserId !== access.user_id) return;

        const content = document.getElementById("os-content");
        if (!content) return;
        content.innerHTML = snapshot;
        content.style.visibility = "visible";
      } catch {}
    }

    async function hydrateOsUser() {
      let data;
      let adminCheck = null;

      if (isAdminPath) {
        const [userResult, adminResult] = await Promise.all([
          supabaseClient.auth.getUser(),
          supabaseClient.rpc("is_admin")
        ]);
        data = userResult.data;
        adminCheck = adminResult;
      } else {
        const userResult = await supabaseClient.auth.getUser();
        data = userResult.data;
      }

      if (!data.user) {
        try {
          document.cookie = "qssed-os-user-name=; Path=/; Max-Age=0; SameSite=Lax; Secure";
          sessionStorage.removeItem("qssed-os-user-name");
        } catch {}
        try { if (typeof clearProfileUiCaches === "function") clearProfileUiCaches(); } catch {}
        try { if (typeof clearAdminUiCaches === "function") clearAdminUiCaches(); } catch {}
        window.location.href = loginUrl;
        return;
      }

      const name = data.user.user_metadata.username || data.user.user_metadata.display_name || data.user.email;
      const userLabel = "@" + name;
      document.getElementById("os-user-name").innerText = userLabel;
      try {
        document.cookie = "qssed-os-user-name=" + encodeURIComponent(userLabel) + "; Path=/; Max-Age=2592000; SameSite=Lax; Secure";
        sessionStorage.removeItem("qssed-os-user-name");
      } catch {}

      if (isAdminPath) {
        const allowed = !adminCheck?.error && adminCheck?.data === true;
        const lock = document.getElementById("admin-lock");
        const content = document.getElementById("os-content");
        lock.style.display = allowed ? "none" : "block";

        if (!allowed) {
          content.style.display = "none";
          content.style.visibility = "hidden";
          try { if (typeof clearAdminUiCaches === "function") clearAdminUiCaches(); } catch {}
          void updateCurrentDevice(data.user);
          return;
        }

        try {
          sessionStorage.setItem("qssed-admin-access-v1", JSON.stringify({ user_id: data.user.id }));
        } catch {}
        await hydrateAdminModule(data.user);
        content.style.display = "block";
        content.style.visibility = "visible";
        void updateCurrentDevice(data.user);
        return;
      }

      await updateCurrentDevice(data.user);
      await hydrateProfileSummary(data.user);
      await hydrateProfileHome(data.user);
      await hydrateProfileAudit(data.user);
    }

    void restoreWarmAdminSnapshot();
    hydrateOsUser();
  </script>
  ${themeScript()}
</body>
</html>
`;
}

export function buildOsCopy(zh) {
  const prefix = zh ? "/zh-cn" : "/en";

  if (zh) {
    return {
      platform: "个人 AI 知识工作平台",
      kicker: "个人智能工作台",
      aiLabel: "工作流",
      aiTitle: "实验与工具入口",
      aiHref: `${prefix}/workspace/experiments`,
      adminLock: "当前账号没有管理权限。管理功能仅对授权管理员开放；如认为权限异常，请联系管理员确认账号角色。",
      nav: [
        { id: "dashboard", label: "首页", href: `${prefix}/dashboard`, items: [] },
        { id: "info", label: "信息中心", href: `${prefix}/info`, items: [
          ["知识库", `${prefix}/info/knowledge`],
          ["收藏链接", `${prefix}/info/links`],
          ["研究笔记", `${prefix}/info/notes`],
          ["内容摘要", `${prefix}/info/summaries`],
          ["全局搜索", `${prefix}/info/search`]
        ] },
        { id: "profile", label: "个人主页", href: `${prefix}/profile`, items: [
          ["用户资料", `${prefix}/profile/details`],
          ["账户信息", `${prefix}/profile/account`],
          ["偏好设置", `${prefix}/profile/preferences`]
        ] },
        { id: "workspace", label: "工作区", href: `${prefix}/workspace`, items: [
          ["工作台", `${prefix}/workspace/workbench`],
          ["项目管理", `${prefix}/workspace/projects`],
          ["实验室", `${prefix}/workspace/experiments`],
          ["草稿箱", `${prefix}/workspace/drafts`],
          ["任务中心", `${prefix}/workspace/tasks`]
        ] },
        { id: "admin", label: "管理", href: `${prefix}/admin`, items: [
          ["通用", `${prefix}/admin/general`],
          ["用户管理", `${prefix}/admin/users`],
          ["角色权限", `${prefix}/admin/roles`],
          ["操作日志", `${prefix}/admin/logs`],
          ["系统状态", `${prefix}/admin/system`]
        ] },
        { id: "settings", label: "设置", href: `${prefix}/settings`, items: [
          ["通用", `${prefix}/settings/general`],
          ["外观", `${prefix}/settings/appearance`],
          ["语言", `${prefix}/settings/language`],
          ["账户与安全", `${prefix}/settings/security`],
          ["通知", `${prefix}/settings/notifications`],
          ["AI 设置", `${prefix}/settings/ai`],
          ["第三方集成", `${prefix}/settings/integrations`],
          ["存储管理", `${prefix}/settings/storage`]
        ] }
      ],
      pages: buildOsPages(true)
    };
  }

  return {
    platform: "Personal AI Knowledge Platform",
    kicker: "Personal Intelligence Workspace",
    aiLabel: "Workflow",
    aiTitle: "Experiments & tools",
    aiHref: `${prefix}/workspace/experiments`,
    adminLock: "This account does not have management access. Administrative tools are available only to authorized administrators. If this seems incorrect, contact an administrator to verify your role.",
    nav: [
      { id: "dashboard", label: "Dashboard", href: `${prefix}/dashboard`, items: [] },
      { id: "info", label: "Information", href: `${prefix}/info`, items: [
        ["Knowledge base", `${prefix}/info/knowledge`],
        ["Links", `${prefix}/info/links`],
        ["Notes", `${prefix}/info/notes`],
        ["Summaries", `${prefix}/info/summaries`],
        ["Search", `${prefix}/info/search`]
      ] },
      { id: "profile", label: "Profile", href: `${prefix}/profile`, items: [
        ["Profile Details", `${prefix}/profile/details`],
        ["Account", `${prefix}/profile/account`],
        ["Preferences", `${prefix}/profile/preferences`]
      ] },
      { id: "workspace", label: "Workspace", href: `${prefix}/workspace`, items: [
        ["Workbench", `${prefix}/workspace/workbench`],
        ["Projects", `${prefix}/workspace/projects`],
        ["Experiments", `${prefix}/workspace/experiments`],
        ["Drafts", `${prefix}/workspace/drafts`],
        ["Tasks", `${prefix}/workspace/tasks`]
      ] },
      { id: "admin", label: "Admin", href: `${prefix}/admin`, items: [
        ["General", `${prefix}/admin/general`],
        ["Users", `${prefix}/admin/users`],
        ["Roles", `${prefix}/admin/roles`],
        ["Logs", `${prefix}/admin/logs`],
        ["System", `${prefix}/admin/system`]
      ] },
      { id: "settings", label: "Settings", href: `${prefix}/settings`, items: [
        ["General", `${prefix}/settings/general`],
        ["Appearance", `${prefix}/settings/appearance`],
        ["Language", `${prefix}/settings/language`],
        ["Account & Security", `${prefix}/settings/security`],
        ["Notifications", `${prefix}/settings/notifications`],
        ["AI", `${prefix}/settings/ai`],
        ["Integrations", `${prefix}/settings/integrations`],
        ["Storage", `${prefix}/settings/storage`]
      ] }
    ],
    pages: buildOsPages(false)
  };
}

export function buildOsPages(zh) {
  const z = {
    dashboard: ["仪表盘", "汇总账号状态与核心模块，快速查看当前可用功能。"],
    info: ["信息中心", "知识模块尚未建立持久化数据表；当前仅保留清晰的模块入口。"],
    knowledge: ["知识库", "整理值得长期保留的知识内容，方便持续积累、查找与回顾。"],
    links: ["收藏链接", "尚未接入收藏链接数据表。"],
    notes: ["研究笔记", "尚未接入笔记存储与 Markdown 保存接口。"],
    summaries: ["内容摘要", "尚未接入摘要数据源。"],
    search: ["全局搜索", "尚未接入跨模块搜索索引。"],
    profile: ["个人主页", ""],
    account: ["账户信息", "账号 ID、邮箱、创建时间、最近登录和登录记录。"],
    security: ["账户与安全", "管理登录设备、登录历史与账户安全记录。"],
    preferences: ["偏好设置", "主题与语言可直接切换；字体和通知设置尚未实现。"],
    workspace: ["工作区", "工作区总览，用于查看并进入工作台、项目、实验、草稿与任务。"],
    workbench: ["工作台", "工作区中的主要操作界面，用于集中处理项目、草稿、实验与任务。"],
    projects: ["项目管理", "尚未接入项目数据表。"],
    experiments: ["实验室", "实验工具尚未接入持久化数据。"],
    drafts: ["草稿箱", "尚未接入草稿数据表。"],
    tasks: ["任务中心", "尚未接入任务数据表。"],
    admin: ["管理", "显示真实用户与管理员数量、最近用户、操作日志和风险事件。"],
    users: ["用户管理", "用户列表、权限管理和封禁管理。"],
    roles: ["角色权限", "查看管理员、编辑者与普通成员的权限范围，并管理角色授权。"],
    logs: ["操作日志", "查看账户与管理操作的审计记录。"],
    system: ["系统状态", "查看管理功能、数据读取与审计能力的当前状态。"],
    settings: ["设置", "集中管理通用、外观、语言、账户安全、通知、AI、第三方集成和存储等设置。"],
    general: ["通用", "管理网站的基础行为与通用偏好。"],
    appearance: ["外观", "当前支持浅色与深色主题，可使用右上角主题按钮切换。"],
    language: ["语言", "设置网页显示语言；当前支持中文与 English。"],
    notifications: ["通知", "管理提醒、站内消息与其他通知偏好。"],
    ai: ["AI 设置", "当前没有浏览器端 API Key 配置功能；敏感密钥不应保存在前端。"],
    integrations: ["第三方集成", "当前站点运行依赖 Cloudflare 与 Supabase；此页尚无用户级集成配置。"],
    storage: ["存储管理", "管理仅属于当前账号的私人 Cloudflare R2 文件。"]
  };
  const e = {
    dashboard: ["Dashboard", "Overview of your account status and core modules, with quick access to currently available features."],
    info: ["Information Center", "Persistent knowledge tables are not implemented yet; this area currently provides module entry points."],
    knowledge: ["Knowledge Base", "Organize knowledge worth keeping so it stays easy to build on, find, and revisit."],
    links: ["Saved Links", "No saved-links table is connected yet."],
    notes: ["Research Notes", "Note storage and Markdown persistence are not connected yet."],
    summaries: ["Summaries", "No summary data source is connected yet."],
    search: ["Global Search", "No cross-module search index is connected yet."],
    profile: ["Profile", ""],
    account: ["Account", "Account ID, email, creation time, last sign-in, and login records."],
    security: ["Account & Security", "Manage signed-in devices, login history, and account security records."],
    preferences: ["Preferences", "Theme and language can be switched now; font and notification preferences are not implemented."],
    workspace: ["Workspace", "An overview for entering the Workbench, projects, experiments, drafts, and tasks."],
    workbench: ["Workbench", "The main operating surface inside Workspace for projects, drafts, experiments, and tasks."],
    projects: ["Projects", "No projects table is connected yet."],
    experiments: ["Lab", "Experiment tools are not connected to persistent data yet."],
    drafts: ["Drafts", "No drafts table is connected yet."],
    tasks: ["Tasks", "No tasks table is connected yet."],
    admin: ["Admin", "Shows live user/admin counts, recent users, operation logs, and risk events."],
    users: ["User Management", "User list, permissions, and bans."],
    roles: ["Roles", "Review the access scope for administrators, editors, and members, and manage role permissions."],
    logs: ["Logs", "Review audit records for account and administrative actions."],
    system: ["System Status", "Review the current availability of management features, data access, and auditing capabilities."],
    settings: ["Settings", "Manage general, appearance, language, account security, notifications, AI, integrations, and storage settings."],
    general: ["General", "Manage the site's basic behavior and general preferences."],
    appearance: ["Appearance", "Light and dark themes are available through the theme button in the top-right corner."],
    language: ["Language", "Choose the site language; Chinese and English are currently supported."],
    notifications: ["Notifications", "Manage reminders, in-app messages, and other notification preferences."],
    ai: ["AI Settings", "There is no browser-side API-key configuration. Sensitive keys should not be stored in frontend code."],
    integrations: ["Integrations", "The site currently depends on Cloudflare and Supabase; user-configurable integrations are not implemented."],
    storage: ["Storage", "Manage private Cloudflare R2 files belonging only to your account."]
  };
  const s = zh ? z : e;
  return {
    "/dashboard": { section: "dashboard", title: s.dashboard[0], description: s.dashboard[1] },
    "/info": { section: "info", title: s.info[0], description: s.info[1] },
    "/info/knowledge": { section: "info", title: s.knowledge[0], description: s.knowledge[1] },
    "/info/links": { section: "info", title: s.links[0], description: s.links[1] },
    "/info/notes": { section: "info", title: s.notes[0], description: s.notes[1] },
    "/info/summaries": { section: "info", title: s.summaries[0], description: s.summaries[1] },
    "/info/search": { section: "info", title: s.search[0], description: s.search[1] },
    "/profile": { section: "profile", title: s.profile[0], description: s.profile[1] },
    "/profile/details": { section: "profile", title: zh ? "用户资料" : "Profile Details", description: zh ? "查看和维护头像、个性签名、个人介绍、状态、兴趣与主页背景。" : "View and maintain your photo, signature, bio, presence, interests, and profile background." },
    "/profile/account": { section: "profile", title: s.account[0], description: s.account[1] },
    "/profile/preferences": { section: "profile", title: s.preferences[0], description: s.preferences[1] },
    "/workspace": { section: "workspace", title: s.workspace[0], description: s.workspace[1] },
    "/workspace/workbench": { section: "workspace", title: zh ? "工作台" : "Workbench", description: zh ? "工作区中的主要操作界面，用于集中处理项目、实验、草稿与任务。" : "The main operating surface inside Workspace for projects, experiments, drafts, and tasks." },
    "/workspace/projects": { section: "workspace", title: s.projects[0], description: s.projects[1] },
    "/workspace/experiments": { section: "workspace", title: s.experiments[0], description: s.experiments[1] },
    "/workspace/drafts": { section: "workspace", title: s.drafts[0], description: s.drafts[1] },
    "/workspace/tasks": { section: "workspace", title: s.tasks[0], description: s.tasks[1] },
    "/admin": { section: "admin", title: s.admin[0], description: s.admin[1] },
    "/admin/general": { section: "admin", title: zh ? "通用" : "General", description: zh ? "查看管理区域的核心概览、账户统计、近期操作与风险信息。" : "Review the core admin overview, account metrics, recent operations, and risk information." },
    "/admin/users": { section: "admin", title: s.users[0], description: s.users[1] },
    "/admin/roles": { section: "admin", title: s.roles[0], description: s.roles[1] },
    "/admin/logs": { section: "admin", title: s.logs[0], description: s.logs[1] },
    "/admin/system": { section: "admin", title: s.system[0], description: s.system[1] },
    "/settings": { section: "settings", title: s.settings[0], description: s.settings[1] },
    "/settings/general": { section: "settings", title: zh ? "通用" : "General", description: zh ? "管理网站的基础行为与通用偏好。" : "Manage the site's basic behavior and general preferences." },
    "/settings/appearance": { section: "settings", title: s.appearance[0], description: s.appearance[1] },
    "/settings/language": { section: "settings", title: s.language[0], description: s.language[1] },
    "/settings/security": { section: "settings", title: s.security[0], description: s.security[1] },
    "/settings/notifications": { section: "settings", title: s.notifications[0], description: s.notifications[1] },
    "/settings/ai": { section: "settings", title: s.ai[0], description: s.ai[1] },
    "/settings/integrations": { section: "settings", title: s.integrations[0], description: s.integrations[1] },
    "/settings/storage": { section: "settings", title: s.storage[0], description: s.storage[1] }
  };
}

export function renderOsNav(copy, activeSection, currentPath = "") {
  return `
    <nav class="os-nav">
      ${copy.nav.map(group => `
        <section class="os-nav-group ${group.id === activeSection ? "is-active" : ""}">
          <a class="os-nav-title" href="${group.href}">${group.label}</a>
          ${group.items.length ? `<div class="os-nav-items">
            ${group.items.map(item => `<a href="${item[1]}"${item[1].endsWith(currentPath) ? ` aria-current="page"` : ""}>${item[0]}</a>`).join("")}
          </div>` : ""}
        </section>
      `).join("")}
    </nav>
  `;
}

export function renderOsContent(path, copy) {
  const zh = copy.platform.includes("个人");
  if (path === "/dashboard") return dashboardContent(zh);
  if (path === "/info") return statusContent(zh, "信息中心尚未接入", "收藏链接、笔记、摘要和 AI 对话目前没有持久化数据源。", "Information Center is not connected yet", "Saved links, notes, summaries, and AI conversations do not have persistent data sources yet.");
  if (path === "/info/knowledge") return statusContent(zh, "知识库", "用于整理值得长期保留的知识内容，让信息更容易积累、查找和回顾。", "Knowledge Base", "Organize knowledge worth keeping so it remains easy to build on, find, and revisit.");
  if (path === "/info/links") return linksContent(zh);
  if (path === "/info/notes") return notesContent(zh);
  if (path === "/info/summaries") return summariesContent(zh);
  if (path === "/info/search") return searchContent(zh);
  if (path === "/profile") return profileHubContent(zh);
  if (path.startsWith("/profile/")) return profileContent(path, zh);
  if (path.startsWith("/workspace")) return workspaceContent(path, zh);
  if (path.startsWith("/admin")) return adminContent(path, zh);
  if (path.startsWith("/settings")) return settingsContent(path, zh);
  throw new Error("Unhandled OS path: " + path);
}

export function statusContent(zh, zhTitle, zhBody, enTitle, enBody) {
  return `<section class="os-card is-large"><h2>${zh ? zhTitle : enTitle}</h2><p>${zh ? zhBody : enBody}</p></section>`;
}

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
export function linksContent(zh) {
  return `<section class="os-card is-large"><h2>${zh ? "尚未接入收藏链接" : "Saved links are not connected yet"}</h2><p>${zh ? "当前数据库没有收藏链接表，因此这里不再展示固定示例链接或伪造收藏时间。" : "There is no saved-links table in the current database, so this page no longer shows fixed sample links or fabricated saved dates."}</p></section>`;
}

export function notesContent(zh) {
  return `<section class="os-card is-large"><h2>${zh ? "笔记存储尚未接入" : "Note storage is not connected yet"}</h2><p>${zh ? "当前没有 notes 数据表或保存接口，因此这里不再显示一个看似可编辑但无法持久化的 Markdown 编辑器。" : "There is no notes table or save API, so this page no longer presents an editor that looks functional but cannot persist changes."}</p></section>`;
}

export function summariesContent(zh) {
  return statusContent(zh, "摘要数据尚未接入", "当前没有用于保存 B 站、YouTube、网页或 PDF 摘要的数据源。", "Summary data is not connected yet", "There is no persistent data source for Bilibili, YouTube, webpage, or PDF summaries yet.");
}

export function searchContent(zh) {
  return `<section class="os-card is-large"><h2>${zh ? "全局搜索尚未接入" : "Global search is not connected yet"}</h2><p>${zh ? "当前没有笔记、链接、项目或聊天记录的数据索引，因此不展示无实际搜索行为的输入框。" : "There is no index for notes, links, projects, or chat records yet, so this page does not show a search box with no real search behavior."}</p></section>`;
}

export function osHubIcon(name) {
  const icons = {
    profile: '<circle cx="12" cy="8" r="3.1"/><path d="M5.5 19c.9-3.2 3.2-5 6.5-5s5.6 1.8 6.5 5"/>',
    account: '<rect x="4" y="5" width="16" height="14" rx="3"/><path d="M8 9h8M8 13h5"/>',
    preferences: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9M8 4v6M16 14v6"/>',
    links: '<path d="M9.5 14.5l5-5M7.2 16.8l-1.3 1.3a3.2 3.2 0 01-4.5-4.5l3.4-3.4a3.2 3.2 0 014.5 0M16.8 7.2l1.3-1.3a3.2 3.2 0 014.5 4.5l-3.4 3.4a3.2 3.2 0 01-4.5 0"/>',
    storage: '<path d="M4 7.5C4 5.6 7.6 4 12 4s8 1.6 8 3.5S16.4 11 12 11 4 9.4 4 7.5z"/><path d="M4 7.5v4C4 13.4 7.6 15 12 15s8-1.6 8-3.5v-4M4 11.5v4C4 17.4 7.6 19 12 19s8-1.6 8-3.5v-4"/>',
    shield: '<path d="M12 3l7 3v5c0 4.4-2.6 7.8-7 10-4.4-2.2-7-5.6-7-10V6l7-3z"/><path d="M9.3 12l1.8 1.8 3.7-4"/>',
    general: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
    users: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.2"/><path d="M3.5 19c.7-3.4 2.7-5 5.5-5s4.8 1.6 5.5 5M14 15c2.8-.2 4.8 1.1 5.8 4"/>',
    roles: '<path d="M4 6h16v12H4z"/><path d="M8 10h8M8 14h5"/>',
    logs: '<path d="M6 4h12v16H6z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    system: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.8 1.8"/>',
    appearance: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 000 16z"/>',
    language: '<path d="M4 5h10M9 5c-.2 5-2.3 8.3-5 10M6 9c1.8 2.8 4 4.8 7 6M14 10h6M17 7v10M14 17h6"/>',
    notifications: '<path d="M6 16h12l-1.5-2V10a4.5 4.5 0 00-9 0v4L6 16z"/><path d="M10 19h4"/>',
    ai: '<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3zM18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15z"/>',
    integrations: '<path d="M8 8V5a3 3 0 016 0v3M16 16v3a3 3 0 01-6 0v-3M7 12h10"/>'
  };
  const body = icons[name] || icons.general;
  return `<span class="os-hub-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg></span>`;
}

export function osHubCard(item) {
  const classes = ["os-hub-card"];
  if (item.featured) classes.push("is-featured");
  if (item.tone) classes.push("tone-" + item.tone);
  return `<a class="${classes.join(" ")}" href="${item.href}">
    <div class="os-hub-card-top">
      ${osHubIcon(item.icon)}
      <span class="os-hub-arrow" aria-hidden="true">›</span>
    </div>
    <div class="os-hub-card-copy">
      <div class="os-hub-card-title-row">
        <h2>${item.title}</h2>
        ${item.meta ? `<small>${item.meta}</small>` : ""}
      </div>
      <p>${item.description}</p>
    </div>
  </a>`;
}

export function osHubGrid(items, extraClass = "") {
  return `<section class="os-hub-grid ${extraClass}">${items.map(osHubCard).join("")}</section>`;
}

export function profileHubContent(zh) {
  const prefix = zh ? "/zh-cn" : "/en";
  const items = zh ? [
    { title:"用户资料", meta:"个人空间", description:"头像、主页背景、个性签名、个人介绍、在线状态与兴趣标签。", href:`${prefix}/profile/details`, icon:"profile", featured:true, tone:"blue" },
    { title:"账户信息", meta:"账号", description:"查看账号 ID、邮箱、注册时间、最近登录与登录记录。", href:`${prefix}/profile/account`, icon:"account" },
    { title:"账户与安全", meta:"安全", description:"查看当前设备、登录历史与异常登录提示。", href:`${prefix}/settings/security`, icon:"shield" },
    { title:"偏好设置", meta:"偏好", description:"管理与个人使用体验相关的设置入口。", href:`${prefix}/profile/preferences`, icon:"preferences" },
    { title:"收藏链接", meta:"内容", description:"进入你的链接收藏与常用入口。", href:`${prefix}/info/links`, icon:"links" },
    { title:"私人存储", meta:"R2", description:"上传、下载并管理只属于当前账号的私人文件。", href:`${prefix}/settings/storage`, icon:"storage" }
  ] : [
    { title:"Profile Details", meta:"Personal", description:"Profile photo, background, signature, bio, presence, and interests.", href:`${prefix}/profile/details`, icon:"profile", featured:true, tone:"blue" },
    { title:"Account", meta:"Account", description:"Review account ID, email, registration time, recent sign-in, and login records.", href:`${prefix}/profile/account`, icon:"account" },
    { title:"Account & Security", meta:"Security", description:"Review the current device, login history, and risk alerts.", href:`${prefix}/settings/security`, icon:"shield" },
    { title:"Preferences", meta:"Preferences", description:"Manage entry points related to your personal experience.", href:`${prefix}/profile/preferences`, icon:"preferences" },
    { title:"Saved Links", meta:"Content", description:"Open your saved links and frequently used destinations.", href:`${prefix}/info/links`, icon:"links" },
    { title:"Private Storage", meta:"R2", description:"Upload, download, and manage files private to this account.", href:`${prefix}/settings/storage`, icon:"storage" }
  ];
  return osHubGrid(items, "profile-hub-grid");
}

export function adminHubContent(zh) {
  const prefix = zh ? "/zh-cn" : "/en";
  const items = zh ? [
    { title:"通用", meta:"管理概览", description:"账户统计、近期登录、操作日志与系统风险信号。", href:`${prefix}/admin/general`, icon:"general", featured:true, tone:"blue" },
    { title:"用户管理", meta:"成员", description:"搜索用户，查看资料并调整角色或账号状态。", href:`${prefix}/admin/users`, icon:"users" },
    { title:"角色权限", meta:"RBAC", description:"查看角色范围并管理管理员、编辑者与普通成员权限。", href:`${prefix}/admin/roles`, icon:"roles" },
    { title:"操作日志", meta:"审计", description:"按动作、级别、用户和日期筛选管理操作记录。", href:`${prefix}/admin/logs`, icon:"logs" },
    { title:"系统状态", meta:"系统", description:"查看管理能力与运行状态相关信息。", href:`${prefix}/admin/system`, icon:"system" }
  ] : [
    { title:"General", meta:"Overview", description:"Account metrics, recent sign-ins, operation logs, and system risk signals.", href:`${prefix}/admin/general`, icon:"general", featured:true, tone:"blue" },
    { title:"Users", meta:"Members", description:"Search users, review profiles, and adjust roles or account status.", href:`${prefix}/admin/users`, icon:"users" },
    { title:"Roles", meta:"RBAC", description:"Review role scopes and manage administrator, editor, and member permissions.", href:`${prefix}/admin/roles`, icon:"roles" },
    { title:"Logs", meta:"Audit", description:"Filter administration records by action, severity, user, and date.", href:`${prefix}/admin/logs`, icon:"logs" },
    { title:"System", meta:"System", description:"Review management capabilities and runtime-related status information.", href:`${prefix}/admin/system`, icon:"system" }
  ];
  return osHubGrid(items, "admin-hub-grid");
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

export function workspaceContent(path, zh) {
  if (path.endsWith("/workbench")) return statusContent(zh, "工作台数据尚未接入", "工作台是工作区中的主要操作界面；当前尚未建立独立的持久化工作台数据模型。", "Workbench data is not connected yet", "The Workbench is the primary operating surface inside Workspace; a dedicated persistent workbench data model has not been established yet.");
  if (path.endsWith("/projects")) return statusContent(zh, "项目数据尚未接入", "当前数据库没有 projects 表，因此不展示项目名称、状态或完成百分比。", "Project data is not connected yet", "There is no projects table in the current database, so project names, statuses, and completion percentages are not shown.");
  if (path.endsWith("/experiments")) return statusContent(zh, "实验工具尚未接入", "Prompt、Agent 和 API 实验目前没有持久化数据或独立工具接口。", "Experiment tools are not connected yet", "Prompt, agent, and API experiments do not currently have persistent data or dedicated tool APIs.");
  if (path.endsWith("/drafts")) return statusContent(zh, "草稿存储尚未接入", "当前数据库没有 drafts 表或草稿保存接口。", "Draft storage is not connected yet", "There is no drafts table or draft persistence API yet.");
  if (path.endsWith("/tasks")) return statusContent(zh, "任务数据尚未接入", "当前数据库没有 tasks 表，因此不展示 Todo 或 Kanban 数据。", "Task data is not connected yet", "There is no tasks table in the current database, so Todo or Kanban data is not shown.");
  return statusContent(zh, "工作区数据尚未接入", "项目、实验、草稿和任务目前没有统一的持久化工作区数据模型。", "Workspace data is not connected yet", "Projects, experiments, drafts, and tasks do not yet have a unified persistent workspace data model.");
}

export function adminContent(path, zh) {
  if (path === "/admin") return adminHubContent(zh);
  if (path.endsWith("/general")) return adminOverviewContent(zh);
  if (path.endsWith("/users")) return adminUsersContent(zh);
  if (path.endsWith("/roles")) return adminRolesContent(zh);
  if (path.endsWith("/logs")) return adminLogsContent(zh);
  if (path.endsWith("/system")) return `<section class="os-card is-large"><h2>${zh ? "系统状态" : "System Status"}</h2><p>${zh ? "当前管理界面尚未接入运行状态、存储占用与容量统计等监控数据；账户、权限与审计相关信息仍可在对应管理页面查看。" : "Runtime health, storage usage, and capacity metrics are not yet available in the management interface. Account, permission, and audit information remains available in the corresponding administration pages."}</p></section>`;
  return adminOverviewContent(zh);
}

export function adminOverviewContent(zh) {
  const labels = zh
    ? ["用户总数", "管理员数量"]
    : ["Total Users", "Admins"];
  return `
    <section class="admin-scan">
      <span></span>
      <strong>${zh ? "管理数据概览" : "Admin Data Overview"}</strong>
      <p>${zh ? "汇总用户、角色、权限和操作日志。" : "Overview of users, roles, permissions, and operation logs."}</p>
    </section>
    <section class="admin-metrics" id="admin-overview-metrics">
      ${labels.map((label, index) => `<article class="admin-motion-card admin-skeleton" style="--stagger:${index}"><span>${label}</span><strong data-admin-metric="${index}">0</strong></article>`).join("")}
    </section>
    <section class="admin-dashboard-grid">
      <article class="os-card admin-section-card">
        <div class="admin-section-head"><h2>${zh ? "最近登录用户" : "Recent Login Users"}</h2><span class="status-pulse"></span></div>
        <div id="admin-recent-users" class="admin-list-skeleton"></div>
      </article>
      <article class="os-card admin-section-card">
        <div class="admin-section-head"><h2>${zh ? "最近操作日志" : "Recent Operation Logs"}</h2><button class="admin-ghost" data-admin-nav="/admin/logs">${zh ? "查看全部" : "View all"}</button></div>
        <div id="admin-recent-logs" class="admin-log-list admin-list-skeleton"></div>
      </article>
      <article class="os-card admin-section-card danger-event-card">
        <div class="admin-section-head"><h2>${zh ? "系统风险提示" : "System Risk Signals"}</h2><span>${zh ? "审计规则" : "Audit rules"}</span></div>
        <div id="admin-risk-list" class="admin-risk-list admin-list-skeleton"></div>
      </article>
    </section>
  `;
}

export function adminUsersContent(zh) {
  const roleOptions = zh ? [["", "全部角色"], ["admin", "管理员"], ["editor", "编辑者"], ["user", "普通成员"]] : [["", "All roles"], ["admin", "Administrator"], ["editor", "Editor"], ["user", "Member"]];
  const statusOptions = zh ? [["", "全部状态"], ["active", "正常"], ["suspended", "已停用"], ["banned", "已封禁"]] : [["", "All status"], ["active", "active"], ["suspended", "suspended"], ["banned", "banned"]];
  return `
    <section class="admin-toolbar os-card">
      <input id="admin-user-search" class="os-search" placeholder="${zh ? "搜索用户、邮箱、ID..." : "Search users, email, ID..."}">
      <select id="admin-role-filter">${roleOptions.map(option => `<option value="${option[0]}">${option[1]}</option>`).join("")}</select>
      <select id="admin-status-filter">${statusOptions.map(option => `<option value="${option[0]}">${option[1]}</option>`).join("")}</select>
    </section>
    <section class="os-card admin-table-card">
      <div class="admin-section-head"><h2>${zh ? "用户列表" : "Users"}</h2><span id="admin-users-count">0</span></div>
      <div id="admin-users-table" class="admin-data-table admin-user-table admin-list-skeleton"></div>
    </section>
    <section class="os-card admin-detail-card" id="admin-user-detail">
      <h2>${zh ? "用户详情" : "User Detail"}</h2>
      <div id="admin-user-detail-body" class="admin-empty">${zh ? "选择一位用户查看最近登录和操作记录。" : "Select a user to review recent logins and operations."}</div>
    </section>
  `;
}

export function adminRolesContent(zh) {
  return `
    <section class="os-card admin-role-summary">
      <div class="admin-section-head">
        <h2>${zh ? "RBAC 角色权限" : "RBAC Roles"}</h2>
        <button id="admin-save-permissions" class="admin-primary" disabled>${zh ? "保存权限" : "Save permissions"}</button>
      </div>
      <p>${zh ? "角色用于控制成员可访问的功能。普通成员适合日常使用，不具备用户管理、角色权限调整或管理级审计访问能力；管理员与编辑者应仅授予确有需要的账号。所有权限调整都会保留操作记录。" : "Roles control which features members can access. Members are intended for everyday use and cannot manage users, change role permissions, or access administrator-only audit data. Administrator and editor roles should be granted only when needed. Permission changes are recorded."}</p>
      <div id="admin-unsaved-bar" class="admin-unsaved" hidden>${zh ? "有未保存的权限变更" : "Unsaved permission changes"}</div>
    </section>
    <section id="admin-role-cards" class="admin-role-cards admin-list-skeleton"></section>
    <section class="os-card admin-table-card">
      <div class="admin-section-head"><h2>${zh ? "权限矩阵" : "Permission Matrix"}</h2><span>${zh ? "分组开关" : "Grouped switches"}</span></div>
      <div id="admin-permission-matrix" class="admin-permission-matrix admin-list-skeleton"></div>
    </section>
  `;
}

export function adminLogsContent(zh) {
  const actions = zh
    ? [["", "全部动作"], ["auth.login.failed", "登录失败"], ["user.role.update", "修改用户角色"], ["user.ban", "封禁用户"], ["user.unban", "解除封禁"], ["user.suspend", "停用用户"], ["role.permissions.update", "修改角色权限"]]
    : [["", "All actions"], ["auth.login.failed", "auth.login.failed"], ["user.role.update", "user.role.update"], ["user.ban", "user.ban"], ["user.unban", "user.unban"], ["user.suspend", "user.suspend"], ["role.permissions.update", "role.permissions.update"]];
  const severities = zh ? [["", "全部级别"], ["info", "信息"], ["warning", "警告"], ["danger", "危险"]] : [["", "All severity"], ["info", "info"], ["warning", "warning"], ["danger", "danger"]];
  return `
    <section class="admin-toolbar os-card">
      <input id="admin-log-search" class="os-search" placeholder="${zh ? "搜索描述、对象、动作..." : "Search description, target, action..."}">
      <select id="admin-log-action">${actions.map(action => `<option value="${action[0]}">${action[1]}</option>`).join("")}</select>
      <select id="admin-log-severity">${severities.map(severity => `<option value="${severity[0]}">${severity[1]}</option>`).join("")}</select>
      <input id="admin-log-actor" placeholder="${zh ? "用户邮箱 / ID" : "Actor email / ID"}">
      <input id="admin-log-from" type="date">
      <input id="admin-log-to" type="date">
    </section>
    <section class="os-card admin-table-card">
      <div class="admin-section-head"><h2>${zh ? "操作日志" : "Operation Logs"}</h2><span id="admin-logs-count">0</span></div>
      <div id="admin-logs-list" class="admin-log-timeline admin-list-skeleton"></div>
    </section>
    <aside id="admin-log-drawer" class="admin-drawer" aria-hidden="true">
      <button id="admin-log-drawer-close" class="admin-ghost">×</button>
      <div id="admin-log-drawer-body"></div>
    </aside>
  `;
}

export function settingsContent(path, zh) {
  if (path === "/settings") return settingsHubContent(zh);
  if (path.endsWith("/general")) return settingsGeneralContent(zh, osHubIcon);
  if (path.endsWith("/appearance")) return appearanceSettingsContent(zh);
  if (path.endsWith("/language")) return languageSettingsContent(zh);
  if (path.endsWith("/security")) return securityAuditContent(zh);
  if (path.endsWith("/notifications")) return statusContent(zh, "通知", "通知方式、提醒和站内消息偏好将在这里统一管理。当前尚未接入通知服务。", "Notifications", "Notification methods, reminders, and in-app message preferences will be managed here. Notification delivery is not connected yet.");
  if (path.endsWith("/ai")) return statusContent(zh, "AI 设置", "这里将用于管理 AI Provider、模型与个人 AI 偏好。当前尚未开放用户级 AI 配置。", "AI Settings", "Manage AI providers, models, and personal AI preferences here. User-level AI configuration is not available yet.");
  if (path.endsWith("/integrations")) return statusContent(zh, "第三方集成", "这里将用于管理可连接的第三方服务与账号授权。当前尚未开放用户级集成配置。", "Integrations", "Manage connected third-party services and account authorizations here. User-level integrations are not available yet.");
  if (path.endsWith("/storage")) return storageSettingsContent(zh);

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
