/**
 * 【初学者导读】
 * 文件：studio/ui-shell.js
 * 这是 AERTEX 前端 UI 模块（shell）：负责页面结构、状态、事件和 API 数据的展示。
 * 阅读顺序：先通过可见文字定位 render/模板，再追 state、事件监听和 fetch/API，最后去后端找同一路径。
 * 初学者重点：把“结构、样式、交互、数据”分开理解；一个页面 bug 往往只属于其中一层。
 * 修改注意：已有 class/id/data-* 可能被其他模块和自动测试依赖；不要因为当前页面能显示就随意删除。动态用户内容继续保持转义。
 * 响应式：涉及布局的修改至少检查宽屏、普通笔记本、平板和手机，避免只在一个尺寸上看起来正确。
 */
import { TEXT } from "./config.js";
import { escapeHtmlText } from "./html-utils.js";
import { profileClientScript, profileContent, profileHubContent } from "./ui-profile.js";
import { dashboardContent, dashboardIcon } from "./ui-dashboard.js";
import { informationContent } from "./ui-information.js";
import { knowledgeSearchClientScript } from "./knowledge-search.js";
import { compactBackHref, compactBackScript, isCompactMenuRoot } from "./ui-navigation.js";
import { knowledgePageMeta } from "./ui-knowledge.js";
import { workspaceContent } from "./ui-workspace.js";
import { wishesContent } from "./ui-wishes.js";
import { aiSettingsContent, appearanceSettingsContent, languageSettingsContent, securityAuditContent, settingsFallbackContent, settingsGeneralContent, settingsHubContent, settingsStatusContent } from "./ui-settings.js";
import { storageClientScript, storageSettingsContent } from "./ui-storage.js";
import { billingSettingsContent } from "./ui-billing.js";
import { html } from "./routing.js";
import { statusContent } from "./ui-primitives.js";
import { auditClientScript } from "./ui-audit.js";
import { baseHead, supabaseScript, themeScript, topControls } from "./ui-page.js";
import { osStyles } from "./ui-styles.js";
import { shellText } from "./i18n-ui.js";
import { localeDirection } from "./locale.js";

// AERTEX 主壳页面生成器：统一输出侧栏、顶部区域、主内容容器、共享外观/账户状态脚本。具体功能页只提供 content，不应重复整个壳。\nexport function osPage(t, links, pathname, ipInfo, cachedOsUserLabel = "", productLinks = {}) {
  const publicMode = Boolean(productLinks?.publicMode);
  const path = pathname;
  const zh = t === TEXT.zh;
  const activeLocale = productLinks.activeLocale || (zh ? "zh-cn" : "en-us");
  const ui = shellText(activeLocale);
  const copy = buildOsCopy(zh, activeLocale);
  const page = copy.pages[path] || knowledgePageMeta(path, zh, activeLocale) || copy.pages["/dashboard"];
  const activeSection = page.section;
  const rootMenuPath = path === "/";
  const dashboardPath = path === "/dashboard";
  const knowledgePath = path.startsWith("/info/knowledge");
  const compactBackUrl = compactBackHref(path, zh);
  const desktopHoverBack = !isCompactMenuRoot(path);

  return `
<!DOCTYPE html>
<html lang="${activeLocale}" dir="${localeDirection(activeLocale)}">
<head>
  ${baseHead(page.title + " · " + t.studioName)}
  ${osStyles()}
  <style>html[dir="rtl"] .os-layout{direction:rtl}html[dir="rtl"] .os-main,html[dir="rtl"] .os-sidebar{text-align:right}html[dir="rtl"] .top-controls-zone{left:14px;right:auto}html[dir="rtl"] .language-menu-popover,html[dir="rtl"] .theme-menu-popover{left:0;right:auto}html[dir="rtl"] .compact-back-button svg,html[dir="rtl"] .os-nav-group>a>b{transform:scaleX(-1)}</style>
  <script>
    (() => {
      try {
        const compactMedia = window.matchMedia("(max-width:1050px)");
        if (!compactMedia.matches) return;
        const state = sessionStorage.getItem("qssed-compact-view-v2");
        const currentPath = ${JSON.stringify(path)};
        const rootEntry = currentPath === "/";
        const showContent = rootEntry ? false : state !== "menu";
        document.documentElement.classList.toggle("compact-content-view", showContent);
        document.documentElement.classList.toggle("compact-menu-view", !showContent);
      } catch {}
    })();
  </script>
</head>
<body class="os-shell${rootMenuPath ? " os-root-menu" : ""}${desktopHoverBack ? " os-hover-back" : ""}">
  ${topControls(links, t)}
  <div id="compact-back-zone" class="compact-back-zone">
    <button id="compact-back-button" class="compact-back-button" type="button" aria-label="${ui.backLevel}" data-fallback-href="${compactBackUrl}">
      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
        <path d="M15 5.5 8.5 12 15 18.5"/>
      </svg>
      <span>${ui.back}</span>
    </button>
  </div>
  <div class="os-layout">
    <aside id="os-sidebar" class="os-sidebar">
      <a class="os-brand" href="${links.menu || links.dashboard}">
        <span class="os-brand-mark" aria-hidden="true"><img src="/favicon.svg?v=aertex-20261003-square-1" alt=""></span>
        <span>
          <strong>AERTEX</strong>
          <small>${copy.platform}</small>
        </span>
      </a>
      ${publicMode ? `<div class="os-user os-user-public">
        <strong>${ui.account}</strong>
        <a class="os-signout-button" href="${links.login}">
          <span>${t.signIn}</span>
        </a>
      </div>` : `<div class="os-user">
        <strong>${ui.account}</strong>
        <span id="os-user-name">${escapeHtmlText(cachedOsUserLabel)}</span>
        <button id="os-signout-button" class="os-signout-button" type="button">
          <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
            <path d="M10 5H6.8A1.8 1.8 0 0 0 5 6.8v10.4A1.8 1.8 0 0 0 6.8 19H10"/>
            <path d="M14.5 8.5 18 12l-3.5 3.5M18 12H9"/>
          </svg>
          <span id="os-signout-label">${ui.signOut}</span>
        </button>
      </div>`}
      ${renderCompactMainMenu(copy, productLinks)}
      ${renderOsNav(copy, activeSection, path, productLinks)}
    </aside>
    <script>
      try {
        const sidebar = document.getElementById("os-sidebar");
        const sidebarKey = "qssed-sidebar-scroll-v1";
        const compactViewKey = "qssed-compact-view-v2";
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
      ${rootMenuPath ? "" : `<section class="os-hero">
        <div>
          ${dashboardPath ? `<p class="os-kicker">${copy.kicker}</p>` : ""}
          <h1>${page.title}</h1>
          ${page.description ? `<p>${page.description}</p>` : ""}
        </div>
        ${dashboardPath ? `<a class="os-ai" href="${copy.aiHref}">
          <span>${copy.aiLabel}</span>
          <strong>${copy.aiTitle}</strong>
        </a>` : ""}
      </section>`}

      <section id="os-content">
        ${rootMenuPath ? `<div class="desktop-main-menu">${renderCompactMainMenu(copy, productLinks)}</div>` : renderOsContent(path, copy, productLinks)}
      </section>
    </main>
  </div>

  ${supabaseScript()}
  ${knowledgePath ? knowledgeSearchClientScript(zh) : ""}
  ${path === "/settings/storage" ? storageClientScript(zh, links.login, activeLocale) : ""}
  ${auditClientScript(ipInfo)}
  ${profileClientScript(activeLocale)}
  <script>
    const loginUrl = ${JSON.stringify(links.login)};
    const compactViewKey = "qssed-compact-view-v2";
    const compactMedia = window.matchMedia("(max-width:1050px)");

    // 窄屏模式切换：根据 viewport 给侧栏/主内容应用紧凑布局。这里仅控制布局状态，不改变当前路由和业务数据。\nfunction applyCompactViewMode() {
      if (!compactMedia.matches) {
        document.documentElement.classList.remove("compact-content-view", "compact-menu-view");
        return;
      }
      let state = null;
      try { state = sessionStorage.getItem(compactViewKey); } catch {}
      const rootEntry = ${JSON.stringify(path === "/")};
      const showContent = rootEntry ? false : state !== "menu";
      document.documentElement.classList.toggle("compact-content-view", showContent);
      document.documentElement.classList.toggle("compact-menu-view", !showContent);
    }

    ${compactBackScript(path, zh)}

    const signOutButton = document.getElementById("os-signout-button");
    const signOutLabel = document.getElementById("os-signout-label");

    async function signOutCurrentSession() {
      if (!signOutButton || signOutButton.disabled) return;

      const idleLabel = ${JSON.stringify(ui.signOut)};
      signOutButton.disabled = true;
      if (signOutLabel) signOutLabel.textContent = ${JSON.stringify(ui.signingOut)};

      try {
        const { error } = await supabaseClient.auth.signOut({ scope: "local" });
        if (error) throw error;
      } catch (error) {
        console.error("Sign out failed", error);
        if (signOutLabel) signOutLabel.textContent = ${JSON.stringify(ui.signOutFailed)};
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
          "qssed-compact-view-v2",
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
        try {
          const response = await fetch("/api/account/security/summary", {
            credentials: "same-origin",
            cache: "no-store",
            headers: { Accept: "application/json" }
          });
          if (response.ok) {
            const summary = await response.json();
            const profile = summary?.profile || {};
            const serverUser = summary?.user || {};
            return {
              user: {
                id: serverUser.id || "",
                email: serverUser.email || "",
                user_metadata: {
                  username: profile.username || "",
                  display_name: profile.display_name || "",
                  avatar_url: profile.avatar_url || "",
                  role: profile.role || "",
                  status: profile.status || "",
                  first_name: profile.first_name || "",
                  last_name: profile.last_name || "",
                  birth_date: profile.birth_date || "",
                  gender: profile.gender || "",
                  hide_gender_on_profile: Boolean(profile.hide_gender_on_profile),
                  created_at: profile.created_at || serverUser.created_at || ""
                }
              },
              definiteSignedOut: false,
              serverOnly: true
            };
          }
          if (response.status === 401) return { user: null, definiteSignedOut: true };
        } catch (error) {
          console.warn("Server session summary is temporarily unavailable", error);
        }
        return { user: null, definiteSignedOut: false };
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

    // 用户信息 hydration：页面先用缓存快速绘制，再异步读取真实会话/资料覆盖；缓存只用于体验，不能当作权限依据。\nasync function hydrateOsUser() {
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

      // A valid server session is enough to hydrate account UI. Browser-side
      // Supabase persistence may be unavailable on Safari/private modes, so never
      // leave Profile stuck on "Loading..." just because authState.serverOnly is true.
      try {
        if (typeof renderProfileSummarySnapshot === "function" && document.getElementById("profile-summary")) {
          renderProfileSummarySnapshot({
            user_id: data.user.id || "",
            displayName: data.user.user_metadata?.display_name || data.user.user_metadata?.username || data.user.email || "User",
            email: data.user.email || "",
            role: data.user.user_metadata?.role || "",
            status: data.user.user_metadata?.status || "",
            avatar_url: data.user.user_metadata?.avatar_url || "",
            username: data.user.user_metadata?.username || "",
            first_name: data.user.user_metadata?.first_name || "",
            last_name: data.user.user_metadata?.last_name || "",
            birth_date: data.user.user_metadata?.birth_date || "",
            gender: data.user.user_metadata?.gender || "",
            hide_gender_on_profile: Boolean(data.user.user_metadata?.hide_gender_on_profile)
          });
        }
      } catch (error) {
        console.warn("Immediate account summary render failed", error);
      }

      try {
        await hydrateProfileSummary(data.user);
      } catch (error) {
        console.warn("Account summary hydration failed", error);
      }
      void Promise.allSettled([
        updateCurrentDevice(data.user),
        hydrateProfileHome(data.user),
        hydrateProfileAudit(data.user)
      ]);
    }

    ${publicMode ? "" : "hydrateOsUser();"}
  </script>
  ${themeScript()}
</body>
</html>
`;
}

export function buildOsCopy(zh, activeLocale = "") {
  const locale = activeLocale || (zh ? "zh-cn" : "en-us");
  const prefix = "/" + locale;
  const ui = shellText(locale);

  if (locale !== "zh-cn" && locale !== "en-us" && locale !== "en-gb" && locale !== "en-au") {
    return buildLocalizedOsCopy(ui, prefix, locale);
  }

  if (zh) {
    return {
      platform: "个人工作空间",
      kicker: "个人工作空间",
      aiLabel: "工作流",
      aiTitle: "实验与工具入口",
      aiHref: `${prefix}/workspace/experiments`,
      nav: [
        { id: "dashboard", label: "首页", href: `${prefix}/dashboard`, items: [] },
        { id: "wishes", label: "祝福中心", href: `${prefix}/wishes`, items: wishNavItems(prefix, "zh-cn") },
        { id: "info", label: "信息中心", href: `${prefix}/info`, items: [
          ["AERTEX Knowledge", `${prefix}/info/knowledge`],
          ["收藏链接", `${prefix}/info/links`],
          ["研究笔记", `${prefix}/info/notes`],
          ["内容摘要", `${prefix}/info/summaries`],
          ["全局搜索", `${prefix}/info/search`]
        ] },
        { id: "profile", label: "AERTEX 账户", href: `${prefix}/profile`, items: [
          ["个人信息", `${prefix}/profile/details`],
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
          ["主题与外观", `${prefix}/settings/appearance`],
          ["语言", `${prefix}/settings/language`],
          ["账户与安全", `${prefix}/settings/security`],
          ["通知", `${prefix}/settings/notifications`],
          ["AI 设置", `${prefix}/settings/ai`],
          ["第三方集成", `${prefix}/settings/integrations`],
          ["订阅与权益", `${prefix}/settings/subscription`],
          ["学生资格", `${prefix}/settings/student`],
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
      { id: "dashboard", label: "Home", href: `${prefix}/dashboard`, items: [] },
      { id: "wishes", label: "Wish Center", href: `${prefix}/wishes`, items: wishNavItems(prefix, "en-us") },
      { id: "info", label: "Information", href: `${prefix}/info`, items: [
        ["AERTEX Knowledge", `${prefix}/info/knowledge`],
        ["Links", `${prefix}/info/links`],
        ["Notes", `${prefix}/info/notes`],
        ["Summaries", `${prefix}/info/summaries`],
        ["Search", `${prefix}/info/search`]
      ] },
      { id: "profile", label: "AERTEX Account", href: `${prefix}/profile`, items: [
        ["Personal Information", `${prefix}/profile/details`],
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
        ["Theme & Appearance", `${prefix}/settings/appearance`],
        ["Language", `${prefix}/settings/language`],
        ["Account & Security", `${prefix}/settings/security`],
        ["Notifications", `${prefix}/settings/notifications`],
        ["AI", `${prefix}/settings/ai`],
        ["Integrations", `${prefix}/settings/integrations`],
        ["Subscription", `${prefix}/settings/subscription`],
        ["Student Eligibility", `${prefix}/settings/student`],
        ["AERTEX Drive", `${prefix}/settings/storage`]
      ] }
    ],
    pages: buildOsPages(false)
  };
}

function wishNavItems(prefix, locale = "en-us") {
  const code = String(locale || "en-us").toLowerCase();
  if (code === "zh-cn") return [
    ["新年与团圆", prefix + "/wishes/new-year"],
    ["传统与节气", prefix + "/wishes/traditions"],
    ["家庭与成长", prefix + "/wishes/family"],
    ["关系与表达", prefix + "/wishes/relationships"],
    ["社会与自然", prefix + "/wishes/society"]
  ];
  if (code === "zh-tw") return [
    ["新年與團圓", prefix + "/wishes/new-year"],
    ["傳統與節氣", prefix + "/wishes/traditions"],
    ["家庭與成長", prefix + "/wishes/family"],
    ["關係與表達", prefix + "/wishes/relationships"],
    ["社會與自然", prefix + "/wishes/society"]
  ];
  return [
    ["New Year & Reunion", prefix + "/wishes/new-year"],
    ["Traditions & Seasons", prefix + "/wishes/traditions"],
    ["Family & Growth", prefix + "/wishes/family"],
    ["Relationships", prefix + "/wishes/relationships"],
    ["Society & Nature", prefix + "/wishes/society"]
  ];
}

function wishPageLabels(locale = "en-us") {
  const code = String(locale || "en-us").toLowerCase();
  if (code === "zh-cn") return {
    root:["祝福中心","选择一个分类进入独立页面；每个分类只展示自己的节日、用途和当前可用模板。"],
    "new-year":["新年与团圆","跨年、团聚与传统年节祝福。"],
    traditions:["传统与节气","传统节日与季节节点，适合更克制、贴合场景的表达。"],
    family:["家庭与成长","面向家人、孩子与成长节点的祝福主题。"],
    relationships:["关系与表达","用于爱意、亲密关系与轻松互动场景。"],
    society:["社会与自然","公共纪念、劳动、自然与节日问候。"]
  };
  if (code === "zh-tw") return {
    root:["祝福中心","選擇一個分類進入獨立頁面；每個分類只展示自己的節日、用途與目前可用範本。"],
    "new-year":["新年與團圓","跨年、團聚與傳統年節祝福。"],
    traditions:["傳統與節氣","傳統節日與季節節點，適合更克制、貼合情境的表達。"],
    family:["家庭與成長","面向家人、孩子與成長節點的祝福主題。"],
    relationships:["關係與表達","用於愛意、親密關係與輕鬆互動情境。"],
    society:["社會與自然","公共紀念、勞動、自然與節日問候。"]
  };
  return {
    root:["Wish Center","Choose a category and open its own page. Each page only contains its occasions, guidance, and currently available templates."],
    "new-year":["New Year & Reunion","Greetings for year-end, reunion, and traditional new-year occasions."],
    traditions:["Traditions & Seasons","Traditional and seasonal occasions with more context-specific wording."],
    family:["Family & Growth","Greetings for family, childhood, and personal milestones."],
    relationships:["Relationships","Affection, close relationships, and playful occasions."],
    society:["Society & Nature","Public observances, work, nature, and holiday greetings."]
  };
}

function buildLocalizedOsCopy(ui, prefix, locale) {
  const n = ui.nav;
  return {
    platform: ui.platform,
    kicker: ui.kicker,
    aiLabel: ui.workflow,
    aiTitle: ui.tools,
    aiHref: prefix + "/workspace/experiments",
    locale,
    nav: [
      { id:"dashboard", label:n.home, href:prefix + "/dashboard", items:[] },
      { id:"wishes", label:n.wishes, href:prefix + "/wishes", items:wishNavItems(prefix, locale) },
      { id:"info", label:n.info, href:prefix + "/info", items:[[n.knowledge,prefix+"/info/knowledge"],[n.links,prefix+"/info/links"],[n.notes,prefix+"/info/notes"],[n.summaries,prefix+"/info/summaries"],[n.search,prefix+"/info/search"]] },
      { id:"profile", label:n.profile, href:prefix + "/profile", items:[[n.personal,prefix+"/profile/details"],[n.account,prefix+"/profile/account"],[n.preferences,prefix+"/profile/preferences"]] },
      { id:"workspace", label:n.workspace, href:prefix + "/workspace", items:[[n.workbench,prefix+"/workspace/workbench"],[n.projects,prefix+"/workspace/projects"],[n.experiments,prefix+"/workspace/experiments"],[n.drafts,prefix+"/workspace/drafts"],[n.tasks,prefix+"/workspace/tasks"]] },
      { id:"settings", label:n.settings, href:prefix + "/settings", items:[[n.general,prefix+"/settings/general"],[n.appearance,prefix+"/settings/appearance"],[n.language,prefix+"/settings/language"],[n.security,prefix+"/settings/security"],[n.notifications,prefix+"/settings/notifications"],[n.ai,prefix+"/settings/ai"],[n.integrations,prefix+"/settings/integrations"],[n.subscription,prefix+"/settings/subscription"],[n.student,prefix+"/settings/student"],[n.drive,prefix+"/settings/storage"]] }
    ],
    pages: buildLocalizedOsPages(ui, locale)
  };
}

function buildLocalizedOsPages(ui, locale = "en-us") {
  const n=ui.nav,p=ui.pages,w=wishPageLabels(locale);
  const page=(section,title,description="")=>({section,title,description});
  return {
    "/dashboard":page("dashboard",p.dashboard[0],p.dashboard[1]),
    "/wishes":page("wishes",w.root[0],w.root[1]),
    "/wishes/new-year":page("wishes",w["new-year"][0],w["new-year"][1]),
    "/wishes/traditions":page("wishes",w.traditions[0],w.traditions[1]),
    "/wishes/family":page("wishes",w.family[0],w.family[1]),
    "/wishes/relationships":page("wishes",w.relationships[0],w.relationships[1]),
    "/wishes/society":page("wishes",w.society[0],w.society[1]),
    "/info":page("info",p.info[0],p.info[1]), "/info/knowledge":page("info",n.knowledge), "/info/links":page("info",n.links), "/info/notes":page("info",n.notes), "/info/summaries":page("info",n.summaries), "/info/search":page("info",n.search),
    "/profile":page("profile",p.profile[0],p.profile[1]), "/profile/details":page("profile",n.personal), "/profile/account":page("profile",n.account), "/profile/preferences":page("profile",n.preferences),
    "/workspace":page("workspace",p.workspace[0],p.workspace[1]), "/workspace/workbench":page("workspace",n.workbench), "/workspace/projects":page("workspace",n.projects), "/workspace/experiments":page("workspace",n.experiments), "/workspace/drafts":page("workspace",n.drafts), "/workspace/tasks":page("workspace",n.tasks),
    "/settings":page("settings",p.settings[0],p.settings[1]), "/settings/general":page("settings",n.general), "/settings/appearance":page("settings",n.appearance), "/settings/language":page("settings",p.language[0],p.language[1]), "/settings/security":page("settings",n.security), "/settings/notifications":page("settings",n.notifications), "/settings/ai":page("settings",n.ai), "/settings/integrations":page("settings",n.integrations), "/settings/subscription":page("settings",n.subscription), "/settings/student":page("settings",n.student), "/settings/storage":page("settings",n.drive)
  };
}

export function buildOsPages(zh) {
  const z = {
    dashboard: ["首页", ""],
    wishes: ["祝福中心", "从分类进入对应节日页面；生日与中秋保留现有分享链接能力。"],
    info: ["信息中心", "知识模块尚未建立持久化数据表；当前仅保留清晰的模块入口。"],
    knowledge: ["AERTEX Knowledge", "整理值得长期保留的知识内容，方便持续积累、查找与回顾。"],
    links: ["收藏链接", "尚未接入收藏链接数据表。"],
    notes: ["研究笔记", "尚未接入笔记存储与 Markdown 保存接口。"],
    summaries: ["内容摘要", "尚未接入摘要数据源。"],
    search: ["全局搜索", "尚未接入跨模块搜索索引。"],
    profile: ["AERTEX 账户", ""],
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
    appearance: ["主题与外观", "跟随系统或固定浅色/深色，并为 Studio 选择独立强调色。"],
    language: ["语言", "设置网页显示语言；当前支持中文与 English。"],
    notifications: ["通知", "管理提醒、站内消息与其他通知偏好。"],
    ai: ["AI 设置", "查看 Intelligence 权限、可用 Provider 与模型、使用额度和当前浏览器默认模型。"],
    integrations: ["第三方集成", "当前站点运行依赖 Cloudflare 与 Supabase；此页尚无用户级集成配置。"],
    subscription: ["订阅与权益", "查看当前套餐、有效期、价格和 AERTEX 产品权益。"],
    student: ["学生资格", "管理学生身份认证、认证状态以及学生价格资格。"],
    storage: ["AERTEX Drive", "管理仅属于当前账号的私人云盘文件，并查看可用容量。"]
  };
  const e = {
    dashboard: ["Home", ""],
    wishes: ["Wish Center", "Open a dedicated category page for each group of occasions; Birthday and Mid-Autumn keep their existing share-link tools."],
    info: ["Information Center", "Persistent knowledge tables are not implemented yet; this area currently provides module entry points."],
    knowledge: ["AERTEX Knowledge", "Organize knowledge worth keeping so it stays easy to build on, find, and revisit."],
    links: ["Saved Links", "No saved-links table is connected yet."],
    notes: ["Research Notes", "Note storage and Markdown persistence are not connected yet."],
    summaries: ["Summaries", "No summary data source is connected yet."],
    search: ["Global Search", "No cross-module search index is connected yet."],
    profile: ["AERTEX Account", ""],
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
    appearance: ["Theme & Appearance", "Follow the system or choose a fixed light/dark mode and a Studio accent color."],
    language: ["Language", "Choose the site language; Chinese and English are currently supported."],
    notifications: ["Notifications", "Manage reminders, in-app messages, and other notification preferences."],
    ai: ["AI Settings", "View your Intelligence access, available providers and models, usage quotas, and browser default model."],
    integrations: ["Integrations", "The site currently depends on Cloudflare and Supabase; user-configurable integrations are not implemented."],
    subscription: ["Subscription & Entitlements", "View your current plan, validity period, pricing, and AERTEX product entitlements."],
    student: ["Student Eligibility", "Manage student-status verification, verification state, and student-pricing eligibility."],
    storage: ["AERTEX Drive", "Manage private cloud-drive files and view available capacity for your account."]
  };
  const s = zh ? z : e;
  return {
    "/dashboard": { section: "dashboard", title: s.dashboard[0], description: s.dashboard[1] },
    "/wishes": { section: "wishes", title: s.wishes[0], description: s.wishes[1] },
    "/wishes/new-year": { section: "wishes", title: zh ? "新年与团圆" : "New Year & Reunion", description: zh ? "跨年、团聚与传统年节祝福。" : "Greetings for year-end, reunion, and traditional new-year occasions." },
    "/wishes/traditions": { section: "wishes", title: zh ? "传统与节气" : "Traditions & Seasons", description: zh ? "传统节日与季节节点，适合更贴合场景的表达。" : "Traditional and seasonal occasions with context-specific wording." },
    "/wishes/family": { section: "wishes", title: zh ? "家庭与成长" : "Family & Growth", description: zh ? "面向家人、孩子与成长节点的祝福主题。" : "Greetings for family, childhood, and personal milestones." },
    "/wishes/relationships": { section: "wishes", title: zh ? "关系与表达" : "Relationships", description: zh ? "用于爱意、亲密关系与轻松互动场景。" : "Affection, close relationships, and playful occasions." },
    "/wishes/society": { section: "wishes", title: zh ? "社会与自然" : "Society & Nature", description: zh ? "公共纪念、劳动、自然与节日问候。" : "Public observances, work, nature, and holiday greetings." },
    "/info": { section: "info", title: s.info[0], description: s.info[1] },
    "/info/knowledge": { section: "info", title: s.knowledge[0], description: s.knowledge[1] },
    "/info/links": { section: "info", title: s.links[0], description: s.links[1] },
    "/info/notes": { section: "info", title: s.notes[0], description: s.notes[1] },
    "/info/summaries": { section: "info", title: s.summaries[0], description: s.summaries[1] },
    "/info/search": { section: "info", title: s.search[0], description: s.search[1] },
    "/profile": { section: "profile", title: s.profile[0], description: s.profile[1] },
    "/profile/details": { section: "profile", title: zh ? "个人信息" : "Personal Information", description: "" },
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
    "/settings/subscription": { section: "settings", title: s.subscription[0], description: s.subscription[1] },
    "/settings/student": { section: "settings", title: s.student[0], description: s.student[1] },
    "/settings/storage": { section: "settings", title: s.storage[0], description: s.storage[1] }
  };
}


function renderCompactMainMenu(copy, productLinks = {}) {
  const locale = productLinks.activeLocale || copy.locale || (copy.platform.includes("个人") ? "zh-cn" : "en-us");
  const ui = shellText(locale);
  const zh = locale === "zh-cn";
  const prefix = "/" + locale;
  const workHref = String(productLinks?.workHref || "");
  const cashHref = String(productLinks?.cashHref || "");
  const awHref = String(productLinks?.awHref || "");
  const gptHref = String(productLinks?.gptHref || "");
  const adminHref = String(productLinks?.adminHref || "");
  const mainItems = zh ? [
    { title:"首页", description:"概览、最近入口与当前状态", href:prefix + "/dashboard", icon:"home" },
    { title:"工作区", description:"工作台、项目、草稿与任务", href:prefix + "/workspace", icon:"workspace" },
    { title:"信息中心", description:"知识、收藏、笔记与搜索", href:prefix + "/info", icon:"info" },
    { title:"AERTEX 账户", description:"个人资料、账户与安全", href:prefix + "/profile", icon:"profile" },
    { title:"设置", description:"主题、语言、订阅与存储", href:prefix + "/settings", icon:"settings" },
    { title:"祝福中心", description:"生日与节日分享链接", href:prefix + "/wishes", icon:"wishes" }
  ] : [
    { title:"Home", description:"Overview, recent destinations, and status", href:prefix + "/dashboard", icon:"home" },
    { title:"Workspace", description:"Workbench, projects, drafts, and tasks", href:prefix + "/workspace", icon:"workspace" },
    { title:"Information", description:"Knowledge, links, notes, and search", href:prefix + "/info", icon:"info" },
    { title:"AERTEX Account", description:"Profile, account, and security", href:prefix + "/profile", icon:"profile" },
    { title:"Settings", description:"Theme, language, subscription, and storage", href:prefix + "/settings", icon:"settings" },
    { title:"Wish Center", description:"Birthday and seasonal greeting links", href:prefix + "/wishes", icon:"wishes" }
  ];
  const products = [
    ...(workHref ? [{ title:"AERTEX Work", description:zh ? "独立工作产品 · TeX 与本机能力" : "Independent work product · TeX and local capabilities", href:workHref, icon:"workbench" }] : []),
    ...(cashHref ? [{ title:"AERTEX Cash", description:zh ? "个人现金流、预算与预测" : "Personal cashflow, budgets, and forecasts", href:cashHref, icon:"cash" }] : []),
    ...(awHref ? [{ title:"AERTEX Watch", description:zh ? "本机活动记录与使用分析" : "Local activity tracking and usage analytics", href:awHref, icon:"activitywatch" }] : []),
    ...(gptHref ? [{ title:"AERTEX Intelligence", description:zh ? "AI 对话与工作空间" : "AI conversations and workspace", href:gptHref, icon:"intelligence" }] : []),
    ...(adminHref ? [{ title:zh ? "管理员控制台" : "Administration", description:zh ? "独立管理控制面" : "Isolated control plane", href:adminHref, icon:"admin" }] : [])
  ];

  const card = (item, openInNewTab = false) => '<a class="compact-menu-card" href="' + item.href + '"' +
    (openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' +
    '<span class="compact-menu-card-icon">' + dashboardIcon(item.icon) + '</span>' +
    '<span class="compact-menu-card-copy"><strong>' + item.title + '</strong><small>' + item.description + '</small></span></a>';

  return `
    <section class="compact-main-menu" aria-label="${ui.menu}">
      <header class="compact-menu-hero">
        <small>AERTEX · MENU</small>
        <h1>${ui.menu}</h1>
        <p>${ui.menuLead}</p>
      </header>
      <div class="compact-menu-grid">${mainItems.map(card).join("")}</div>
      ${products.length ? `
        <section class="compact-menu-products">
          <div class="compact-menu-section-label">${ui.products}</div>
          <div class="compact-menu-product-grid">${products.map(item => card(item, true)).join("")}</div>
        </section>` : ""}
    </section>
  `;
}

// 主导航渲染：根据 activeSection/currentPath 决定高亮和产品入口；导航项 URL 应来自统一配置/route helper，避免不同页面链接漂移。\nexport function renderOsNav(copy, activeSection, currentPath = "", productLinks = {}) {
  const locale = productLinks.activeLocale || copy.locale || (copy.platform.includes("个人") ? "zh-cn" : "en-us");
  const zh = locale === "zh-cn";
  const workHref = String(productLinks?.workHref || "");
  const cashHref = String(productLinks?.cashHref || "");
  const awHref = String(productLinks?.awHref || "");
  const gptHref = String(productLinks?.gptHref || "");
  const adminHref = String(productLinks?.adminHref || "");
  const iconBySection = {
    dashboard: "home",
    wishes: "wishes",
    info: "info",
    profile: "profile",
    workspace: "workspace",
    settings: "settings"
  };
  const iconForItem = href => {
    const value = String(href || "");
    if (value.includes("/wishes/new-year")) return "gift";
    if (value.includes("/wishes/traditions")) return "moon";
    if (value.includes("/wishes/family")) return "profile";
    if (value.includes("/wishes/relationships")) return "wishes";
    if (value.includes("/wishes/society")) return "info";
    if (value.includes("/knowledge")) return "knowledge";
    if (value.includes("/links")) return "links";
    if (value.includes("/notes")) return "notes";
    if (value.includes("/summaries")) return "summary";
    if (value.includes("/search")) return "search";
    if (value.includes("/profile/details")) return "profile";
    if (value.includes("/profile/account")) return "account";
    if (value.includes("/profile/preferences")) return "preferences";
    if (value.includes("/workspace/projects")) return "projects";
    if (value.includes("/workspace/experiments")) return "experiments";
    if (value.includes("/workspace/drafts")) return "drafts";
    if (value.includes("/workspace/tasks")) return "tasks";
    if (value.includes("/workspace/workbench")) return "workbench";
    if (value.includes("/settings/storage")) return "storage";
    if (value.includes("/settings/subscription")) return "account";
    if (value.includes("/settings/security")) return "security";
    if (value.includes("/settings/appearance")) return "appearance";
    if (value.includes("/settings/language")) return "language";
    if (value.includes("/settings/notifications")) return "notifications";
    if (value.includes("/settings/ai")) return "ai";
    if (value.includes("/settings/integrations")) return "integrations";
    if (value.includes("/settings/general")) return "general";
    if (value.includes("/settings")) return "settings";
    return "info";
  };
  const productGroups = [
    ...(workHref ? [{ id: "work", label: "AERTEX Work", href: workHref, icon: "workbench" }] : []),
    ...(cashHref ? [{ id: "cash", label: "AERTEX Cash", href: cashHref, icon: "cash" }] : []),
    ...(awHref ? [{ id: "activitywatch", label: "AERTEX Watch", href: awHref, icon: "activitywatch" }] : []),
    ...(gptHref ? [{ id: "intelligence", label: "AERTEX Intelligence", href: gptHref, icon: "intelligence" }] : []),
    ...(adminHref ? [{ id: "admin-console", label: zh ? "管理员控制台" : "Admin Console", href: adminHref, icon: "admin" }] : [])
  ];

  return `
    <nav class="os-nav">
      ${productGroups.length ? `<section class="os-nav-group os-nav-products">
        ${productGroups.map(group => `
          <a class="os-nav-title os-nav-product-link" href="${group.href}" target="_blank" rel="noopener noreferrer" data-product-link="${group.id}">
            ${dashboardIcon(group.icon)}
            <span>${group.label}</span>
          </a>
        `).join("")}
      </section>` : ""}
      ${copy.nav.map(group => {
        const active = group.id === activeSection;
        return `
          <section class="os-nav-group os-nav-entry ${active ? "is-active" : ""}" data-nav-section="${group.id}">
            <a class="os-nav-title${group.items.length ? " has-subnav" : ""}" href="${group.href}">
              ${dashboardIcon(iconBySection[group.id] || "info")}
              <span>${group.label}</span>
            </a>
            ${group.items.length && active ? `<div class="os-nav-items">
              ${group.items.map(item => `
                <a href="${item[1]}"${item[1].endsWith(currentPath) ? ` aria-current="page"` : ""}>
                  ${dashboardIcon(iconForItem(item[1]))}
                  <span>${item[0]}</span>
                </a>
              `).join("")}
            </div>` : ""}
          </section>
        `;
      }).join("")}
    </nav>
  `;
}

export function renderOsContent(path, copy, productLinks = {}) {
  const locale = productLinks.activeLocale || copy.locale || (copy.platform.includes("个人") ? "zh-cn" : "en-us");
  const zh = locale === "zh-cn";
  if (path === "/" || path === "/dashboard") return dashboardContent(zh, productLinks, locale);
  if (path === "/wishes" || path.startsWith("/wishes/")) return wishesContent(path, locale);
  if (path.startsWith("/info")) return informationContent(path, zh, locale);
  if (path === "/profile") return profileHubContent(zh, locale);
  if (path.startsWith("/profile/")) return profileContent(path, zh, locale);
  if (path.startsWith("/workspace")) return workspaceContent(path, zh, locale);
  if (path.startsWith("/settings")) return settingsContent(path, zh, locale);
  throw new Error("Unhandled OS path: " + path);
}

export function settingsContent(path, zh, activeLocale = "") {
  if (path === "/settings") return settingsHubContent(zh, activeLocale);
  if (path.endsWith("/general")) return settingsGeneralContent(zh, activeLocale);
  if (path.endsWith("/appearance")) return appearanceSettingsContent(zh, activeLocale);
  if (path.endsWith("/language")) return languageSettingsContent(zh, activeLocale || (zh ? "zh-cn" : "en-us"));
  if (path.endsWith("/security")) return securityAuditContent(zh, activeLocale);
  if (path.endsWith("/notifications")) return settingsStatusContent(activeLocale, "notifications");
  if (path.endsWith("/ai")) return aiSettingsContent(zh, activeLocale);
  if (path.endsWith("/integrations")) return settingsStatusContent(activeLocale, "integrations");
  if (path.endsWith("/subscription")) return billingSettingsContent(zh, "billing", activeLocale);
  if (path.endsWith("/student")) return billingSettingsContent(zh, "student", activeLocale);
  if (path.endsWith("/storage")) return storageSettingsContent(zh, activeLocale);

  return settingsFallbackContent(zh, activeLocale);
}
