import { TEXT } from "./config.js";
import { escapeHtmlText } from "./html-utils.js";
import { profileClientScript, profileContent, profileHubContent } from "./ui-profile.js";
import { dashboardContent } from "./ui-dashboard.js";
import { informationContent } from "./ui-information.js";
import { knowledgeSearchClientScript } from "./knowledge-search.js";
import { compactBackHref, compactBackScript } from "./ui-navigation.js";
import { knowledgePageMeta } from "./ui-knowledge.js";
import { workspaceContent } from "./ui-workspace.js";
import { appearanceSettingsContent, languageSettingsContent, securityAuditContent, settingsFallbackContent, settingsGeneralContent, settingsHubContent } from "./ui-settings.js";
import { storageClientScript, storageSettingsContent } from "./ui-storage.js";
import { html } from "./routing.js";
import { statusContent } from "./ui-primitives.js";
import { auditClientScript } from "./ui-audit.js";
import { baseHead, supabaseScript, themeScript, topControls } from "./ui-page.js";
import { osStyles } from "./ui-styles.js";

export function osPage(t, links, pathname, ipInfo, cachedOsUserLabel = "", productLinks = {}) {
  const path = pathname;
  const zh = t === TEXT.zh;
  const copy = buildOsCopy(zh);
  const page = copy.pages[path] || knowledgePageMeta(path, zh) || copy.pages["/dashboard"];
  const activeSection = page.section;
  const dashboardPath = path === "/dashboard";
  const knowledgePath = path.startsWith("/info/knowledge");
  const compactBackUrl = compactBackHref(path, zh);

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
<body class="os-shell">
  ${topControls(links, t)}
  <div id="compact-back-zone" class="compact-back-zone">
    <button id="compact-back-button" class="compact-back-button" type="button" aria-label="${zh ? "返回上一级" : "Back"}" data-fallback-href="${compactBackUrl}">
      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
        <path d="M14.5 5.5 8 12l6.5 6.5"/>
      </svg>
      <span>${zh ? "返回" : "Back"}</span>
    </button>
  </div>
  <div class="os-layout">
    <aside id="os-sidebar" class="os-sidebar">
      <a class="os-brand" href="${links.dashboard}">
        <span class="os-brand-mark" aria-hidden="true"><img src="/favicon.svg?v=aertex-20260924-3" alt=""></span>
        <span>
          <strong>AERTEX</strong>
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
      ${renderOsNav(copy, activeSection, path, productLinks)}
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

      <section id="os-content">
        ${renderOsContent(path, copy, productLinks)}
      </section>
    </main>
  </div>

  ${supabaseScript()}
  ${knowledgePath ? knowledgeSearchClientScript(zh) : ""}
  ${path === "/settings/storage" ? storageClientScript(zh, links.login) : ""}
  ${auditClientScript(ipInfo)}
  ${profileClientScript()}
  <script>
    const loginUrl = ${JSON.stringify(links.login)};
    const compactViewKey = "qssed-compact-view-v1";
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

    ${compactBackScript(path, zh)}

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

    const hadCachedOsUser = ${JSON.stringify(Boolean(cachedOsUserLabel))};
    const authPause = ms => new Promise(resolve => window.setTimeout(resolve, ms));

    async function readStableOsUser() {
      let sessionResult = null;
      try {
        sessionResult = await supabaseClient.auth.getSession();
      } catch (error) {
        console.warn("Studio session restore failed", error);
      }
      let session = sessionResult?.data?.session || null;

      // A cached label is only a hint that this browser was recently signed in.
      // It never grants access; it only prevents a transient empty restore from
      // immediately bouncing the user through the login page during refresh.
      if (!session && hadCachedOsUser) {
        await authPause(320);
        try {
          sessionResult = await supabaseClient.auth.getSession();
          session = sessionResult?.data?.session || null;
        } catch (error) {
          console.warn("Studio session restore retry failed", error);
        }
      }

      if (!session?.user) {
        return { user: null, definiteSignedOut: !sessionResult?.error };
      }

      let lastError = null;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const userResult = await supabaseClient.auth.getUser();
          if (userResult?.data?.user) {
            return { user: userResult.data.user, definiteSignedOut: false };
          }
          lastError = userResult?.error || null;

          const status = Number(lastError?.status || 0);
          if ((status === 401 || status === 403) && attempt === 0) {
            try {
              const refreshResult = await supabaseClient.auth.refreshSession();
              if (refreshResult?.data?.session?.user) {
                session = refreshResult.data.session;
              } else if (refreshResult?.error) {
                lastError = refreshResult.error;
              }
            } catch (error) {
              lastError = error;
            }
          }
        } catch (error) {
          lastError = error;
        }

        if (attempt === 0) await authPause(320);
      }

      const status = Number(lastError?.status || 0);
      if (status === 401 || status === 403) {
        return { user: null, definiteSignedOut: true };
      }

      // Network or refresh uncertainty is not the same as signing out. Keep the
      // restored local session and let RLS / RPC authorization remain authoritative.
      console.warn("Studio user verification is temporarily unavailable; keeping restored session", lastError);
      return { user: session.user, definiteSignedOut: false, transient: true };
    }

    async function hydrateOsUser() {
      const authState = await readStableOsUser();
      const data = { user: authState.user };
      if (!data.user) {
        if (!authState.definiteSignedOut) {
          window.setTimeout(() => { void hydrateOsUser(); }, 900);
          return;
        }
        try {
          document.cookie = "qssed-os-user-name=; Path=/; Max-Age=0; SameSite=Lax; Secure";
          sessionStorage.removeItem("qssed-os-user-name");
        } catch {}
        try { if (typeof clearProfileUiCaches === "function") clearProfileUiCaches(); } catch {}
        try { if (typeof clearAdminUiCaches === "function") clearAdminUiCaches(); } catch {}
        window.location.replace(loginUrl);
        return;
      }

      const name = data.user.user_metadata.username || data.user.user_metadata.display_name || data.user.email;
      const userLabel = "@" + name;
      document.getElementById("os-user-name").innerText = userLabel;
      try {
        document.cookie = "qssed-os-user-name=" + encodeURIComponent(userLabel) + "; Path=/; Max-Age=2592000; SameSite=Lax; Secure";
        sessionStorage.removeItem("qssed-os-user-name");
      } catch {}

      await updateCurrentDevice(data.user);
      await hydrateProfileSummary(data.user);
      await hydrateProfileHome(data.user);
      await hydrateProfileAudit(data.user);
    }

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
      platform: "个人工作空间",
      kicker: "个人工作空间",
      aiLabel: "工作流",
      aiTitle: "实验与工具入口",
      aiHref: `${prefix}/workspace/experiments`,
      nav: [
        { id: "dashboard", label: "首页", href: `${prefix}/dashboard`, items: [] },
        { id: "info", label: "信息中心", href: `${prefix}/info`, items: [
          ["AERTEX Knowledge", `${prefix}/info/knowledge`],
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
        { id: "settings", label: "设置", href: `${prefix}/settings`, items: [
          ["通用", `${prefix}/settings/general`],
          ["外观", `${prefix}/settings/appearance`],
          ["语言", `${prefix}/settings/language`],
          ["账户与安全", `${prefix}/settings/security`],
          ["通知", `${prefix}/settings/notifications`],
          ["AI 设置", `${prefix}/settings/ai`],
          ["第三方集成", `${prefix}/settings/integrations`],
          ["AERTEX Drive", `${prefix}/settings/storage`]
        ] }
      ],
      pages: buildOsPages(true)
    };
  }

  return {
    platform: "Personal Workspace",
    kicker: "Personal Workspace",
    aiLabel: "Workflow",
    aiTitle: "Experiments & tools",
    aiHref: `${prefix}/workspace/experiments`,
    nav: [
      { id: "dashboard", label: "Dashboard", href: `${prefix}/dashboard`, items: [] },
      { id: "info", label: "Information", href: `${prefix}/info`, items: [
        ["AERTEX Knowledge", `${prefix}/info/knowledge`],
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
      { id: "settings", label: "Settings", href: `${prefix}/settings`, items: [
        ["General", `${prefix}/settings/general`],
        ["Appearance", `${prefix}/settings/appearance`],
        ["Language", `${prefix}/settings/language`],
        ["Account & Security", `${prefix}/settings/security`],
        ["Notifications", `${prefix}/settings/notifications`],
        ["AI", `${prefix}/settings/ai`],
        ["Integrations", `${prefix}/settings/integrations`],
        ["AERTEX Drive", `${prefix}/settings/storage`]
      ] }
    ],
    pages: buildOsPages(false)
  };
}

export function buildOsPages(zh) {
  const z = {
    dashboard: ["仪表盘", "汇总账号状态与核心模块，快速查看当前可用功能。"],
    info: ["信息中心", "知识模块尚未建立持久化数据表；当前仅保留清晰的模块入口。"],
    knowledge: ["AERTEX Knowledge", "整理值得长期保留的知识内容，方便持续积累、查找与回顾。"],
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
    settings: ["设置", "集中管理通用、外观、语言、账户安全、通知、AI、第三方集成和存储等设置。"],
    general: ["通用", "管理网站的基础行为与通用偏好。"],
    appearance: ["外观", "当前支持浅色与深色主题，可使用右上角主题按钮切换。"],
    language: ["语言", "设置网页显示语言；当前支持中文与 English。"],
    notifications: ["通知", "管理提醒、站内消息与其他通知偏好。"],
    ai: ["AI 设置", "当前没有浏览器端 API Key 配置功能；敏感密钥不应保存在前端。"],
    integrations: ["第三方集成", "当前站点运行依赖 Cloudflare 与 Supabase；此页尚无用户级集成配置。"],
    storage: ["AERTEX Drive", "管理仅属于当前账号的私人 Cloudflare R2 文件。"]
  };
  const e = {
    dashboard: ["Dashboard", "Overview of your account status and core modules, with quick access to currently available features."],
    info: ["Information Center", "Persistent knowledge tables are not implemented yet; this area currently provides module entry points."],
    knowledge: ["AERTEX Knowledge", "Organize knowledge worth keeping so it stays easy to build on, find, and revisit."],
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
    settings: ["Settings", "Manage general, appearance, language, account security, notifications, AI, integrations, and storage settings."],
    general: ["General", "Manage the site's basic behavior and general preferences."],
    appearance: ["Appearance", "Light and dark themes are available through the theme button in the top-right corner."],
    language: ["Language", "Choose the site language; Chinese and English are currently supported."],
    notifications: ["Notifications", "Manage reminders, in-app messages, and other notification preferences."],
    ai: ["AI Settings", "There is no browser-side API-key configuration. Sensitive keys should not be stored in frontend code."],
    integrations: ["Integrations", "The site currently depends on Cloudflare and Supabase; user-configurable integrations are not implemented."],
    storage: ["AERTEX Drive", "Manage private Cloudflare R2 files belonging only to your account."]
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

export function renderOsNav(copy, activeSection, currentPath = "", productLinks = {}) {
  const zh = copy.platform.includes("个人");
  const gptHref = String(productLinks?.gptHref || "");
  const adminHref = String(productLinks?.adminHref || "");
  const productGroups = [
    ...(gptHref ? [{ id: "intelligence", label: "AERTEX Intelligence", href: gptHref }] : []),
    ...(adminHref ? [{ id: "admin-console", label: zh ? "管理员控制台" : "Admin Console", href: adminHref }] : [])
  ];

  return `
    <nav class="os-nav">
      ${productGroups.map(group => `
        <section class="os-nav-group os-nav-product">
          <a class="os-nav-title" href="${group.href}" data-product-link="${group.id}">${group.label}</a>
        </section>
      `).join("")}
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

export function renderOsContent(path, copy, productLinks = {}) {
  const zh = copy.platform.includes("个人");
  if (path === "/dashboard") return dashboardContent(zh, productLinks);
  if (path.startsWith("/info")) return informationContent(path, zh);
  if (path === "/profile") return profileHubContent(zh);
  if (path.startsWith("/profile/")) return profileContent(path, zh);
  if (path.startsWith("/workspace")) return workspaceContent(path, zh);
  if (path.startsWith("/settings")) return settingsContent(path, zh);
  throw new Error("Unhandled OS path: " + path);
}

export function settingsContent(path, zh) {
  if (path === "/settings") return settingsHubContent(zh);
  if (path.endsWith("/general")) return settingsGeneralContent(zh);
  if (path.endsWith("/appearance")) return appearanceSettingsContent(zh);
  if (path.endsWith("/language")) return languageSettingsContent(zh);
  if (path.endsWith("/security")) return securityAuditContent(zh);
  if (path.endsWith("/notifications")) return statusContent(zh, "通知", "通知方式、提醒和站内消息偏好将在这里统一管理。当前尚未接入通知服务。", "Notifications", "Notification methods, reminders, and in-app message preferences will be managed here. Notification delivery is not connected yet.");
  if (path.endsWith("/ai")) return statusContent(zh, "AI 设置", "这里将用于管理 AI Provider、模型与个人 AI 偏好。当前尚未开放用户级 AI 配置。", "AI Settings", "Manage AI providers, models, and personal AI preferences here. User-level AI configuration is not available yet.");
  if (path.endsWith("/integrations")) return statusContent(zh, "第三方集成", "这里将用于管理可连接的第三方服务与账号授权。当前尚未开放用户级集成配置。", "Integrations", "Manage connected third-party services and account authorizations here. User-level integrations are not available yet.");
  if (path.endsWith("/storage")) return storageSettingsContent(zh);

  return settingsFallbackContent(zh);
}
