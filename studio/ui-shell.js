import { TEXT } from "./config.js";
import { escapeHtmlText } from "./html-utils.js";
import { profileClientScript, profileContent, profileHubContent } from "./ui-profile.js";
import { adminClientScript, adminHubContent, adminLogsContent, adminOverviewContent, adminRolesContent, adminSystemContent, adminUsersContent } from "./ui-admin.js";
import { dashboardContent } from "./ui-dashboard.js";
import { informationContent } from "./ui-information.js";
import { workspaceContent } from "./ui-workspace.js";
import { appearanceSettingsContent, languageSettingsContent, securityAuditContent, settingsFallbackContent, settingsGeneralContent, settingsHubContent } from "./ui-settings.js";
import { storageClientScript, storageSettingsContent } from "./ui-storage.js";
import { html, json } from "./routing.js";
import { auditClientScript } from "./ui-audit.js";
import { baseHead, supabaseScript, themeScript, topControls } from "./ui-page.js";
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
  if (path.startsWith("/info")) return informationContent(path, zh, statusContent);
  if (path === "/profile") return profileHubContent(zh, osHubGrid);
  if (path.startsWith("/profile/")) return profileContent(path, zh);
  if (path.startsWith("/workspace")) return workspaceContent(path, zh, statusContent);
  if (path.startsWith("/admin")) return adminContent(path, zh);
  if (path.startsWith("/settings")) return settingsContent(path, zh);
  throw new Error("Unhandled OS path: " + path);
}

export function statusContent(zh, zhTitle, zhBody, enTitle, enBody) {
  return `<section class="os-card is-large"><h2>${zh ? zhTitle : enTitle}</h2><p>${zh ? zhBody : enBody}</p></section>`;
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

export function adminContent(path, zh) {
  if (path === "/admin") return adminHubContent(zh, osHubGrid);
  if (path.endsWith("/general")) return adminOverviewContent(zh);
  if (path.endsWith("/users")) return adminUsersContent(zh);
  if (path.endsWith("/roles")) return adminRolesContent(zh);
  if (path.endsWith("/logs")) return adminLogsContent(zh);
  if (path.endsWith("/system")) return adminSystemContent(zh);
  return adminOverviewContent(zh);
}

export function settingsContent(path, zh) {
  if (path === "/settings") return settingsHubContent(zh, osHubGrid);
  if (path.endsWith("/general")) return settingsGeneralContent(zh, osHubIcon);
  if (path.endsWith("/appearance")) return appearanceSettingsContent(zh);
  if (path.endsWith("/language")) return languageSettingsContent(zh);
  if (path.endsWith("/security")) return securityAuditContent(zh);
  if (path.endsWith("/notifications")) return statusContent(zh, "通知", "通知方式、提醒和站内消息偏好将在这里统一管理。当前尚未接入通知服务。", "Notifications", "Notification methods, reminders, and in-app message preferences will be managed here. Notification delivery is not connected yet.");
  if (path.endsWith("/ai")) return statusContent(zh, "AI 设置", "这里将用于管理 AI Provider、模型与个人 AI 偏好。当前尚未开放用户级 AI 配置。", "AI Settings", "Manage AI providers, models, and personal AI preferences here. User-level AI configuration is not available yet.");
  if (path.endsWith("/integrations")) return statusContent(zh, "第三方集成", "这里将用于管理可连接的第三方服务与账号授权。当前尚未开放用户级集成配置。", "Integrations", "Manage connected third-party services and account authorizations here. User-level integrations are not available yet.");
  if (path.endsWith("/storage")) return storageSettingsContent(zh);

  return settingsFallbackContent(zh);
}
