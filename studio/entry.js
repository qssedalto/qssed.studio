// AERTEX 主站页面渲染入口。
//
// 它把 URL 解析成 locale + 规范 pathname，再决定公开页、登录/注册、受保护 OS 页面、Questions、Watch setup、祝福页等。
// 新手修改路由时要同时考虑：是否公开可索引、是否需要 Session Gate、是否属于独立产品子域，以及旧路径是否应重定向。
import { OS_PATHS, LEGACY_REDIRECTS, TEXT, SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { handleAuthHandoff } from "./auth-handoff.js";
import {
  handleStudioSessionBootstrap,
  handleStudioSessionLogout,
  studioSessionBootstrapPage,
  verifyStudioPageSession,
  withStudioSessionCookies
} from "./session-gate.js";
import { linksHubContent, privateLinksPageContent, curatedLinksPageContent } from "./ui-links-workspace.js";
import { polishLinksContent } from "./ui-links-polish.js";
import { enhanceLinksHubWithCommunity, communityLinksPageContent } from "./ui-links-community.js";
import { researchNotesContent } from "./ui-notes.js";
import { globalSearchContent } from "./ui-global-search.js";
import { projectsWorkspaceContent } from "./ui-projects.js";
import { tasksWorkspaceContent } from "./ui-tasks.js";
import { draftsWorkspaceContent } from "./ui-drafts.js";
import { workbenchContent } from "./ui-workbench.js";
import { labContent } from "./ui-lab.js";
import { texWorkbenchContent } from "./ui-tex-workbench.js";
import { enhanceTexWorkbenchLocal } from "./ui-tex-local.js";
import { polishTexWorkbenchApp } from "./ui-tex-app.js";
import { decorateWorkNavigation, workHubContent, workLocalBridgeContent } from "./ui-work.js";
import { enhanceWorkLocalBridgeNative } from "./ui-work-native.js";
import { injectWorkTexHomeLinks, polishWorkHubTexRoute, polishWorkTexNavigation, polishWorkTexVisualTheme } from "./ui-work-tex.js";
import { enhanceWorkTexCollapsiblePanels } from "./ui-work-tex-panels.js";
import { normalizeFeatureAvailabilityCopy } from "./feature-availability-copy.js";
import { getRequestCookie, handleRegistrationSignup } from "./account-api.js";
import { handleIdentifierPasswordLogin, identifierLoginPage } from "./login-identifier-api.js";
import { getRouteInfo, buildLinks, html, localizedRedirect } from "./routing.js";
import { osPage } from "./ui-shell.js";
import { publicHomeMarkup } from "./public-home.js";
import { injectPublicSeo } from "./public-indexing.js";
import { isQuestionRoute, questionAlternateLocales, questionDetailDescription, questionDetailPage, questionDetailPath, questionHubDescription, questionHubPage, questionIndexPath, questionRouteId } from "./public-question-pages.js";
import { questionRouteLocale } from "./public-questions.js";
import { signUpPage, loginPage, notFoundPage } from "./auth-pages.js";
import { birthdayPage } from "./ui-birthday.js";
import { midAutumnPage } from "./ui-mid-autumn.js";
import { watchSetupPage } from "./watch-setup-page.js";
import { adminOriginForRequest, authOriginForRequest, awOriginForRequest, cashOriginForRequest, gptOriginForRequest, mainOriginForRequest, workOriginForRequest } from "./domain-family.js";
import { localeFromPath, normalizeSupportedLocale } from "./locale.js";

function safeLocalNext(value) {
  const path = typeof value === "string" ? value.trim().slice(0, 500) : "";
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\u0000")) return "";
  return path;
}

function normalizePublicPrivacyCopy(markup) {
  let output = String(markup || "");
  const replacements = [
    ["开启后公开给所有用户；关闭时仅你和管理员可见。","开启后仅将此链接发布到社区。本网站重视并保障所有用户的隐私与权利。"],
    ["Turn on to make this link public. Off keeps it private to you and administrators.","Turn on to publish this link to the community. This website is committed to protecting the privacy and rights of every user."],
    ["只有当前账号和管理员可以看到这些链接。","本网站重视并保障所有用户的隐私与权利。"],
    ["Only this account and administrators can see these links.","This website is committed to protecting the privacy and rights of every user."],
    ["只有你和管理员可以看到这里的内容。","本网站重视并保障所有用户的隐私与权利。"],
    ["只有你和管理员可以看到这些内容。","本网站重视并保障所有用户的隐私与权利。"],
    ["Only you and administrators can see these links.","This website is committed to protecting the privacy and rights of every user."],
    ["你创建的链接只对当前账号和管理员可见，其他普通用户无法读取。","你创建的链接默认保持私密。本网站重视并保障所有用户的隐私与权利。"],
    ["Links you create are visible only to your account and administrators. Other regular users cannot read them.","Links you create remain private by default. This website is committed to protecting the privacy and rights of every user."],
    ["新建的链接只对你自己和管理员可见，不会公开给其他普通用户。","新建的链接默认保持私密，只有在你主动选择公开时才会出现在公共区域。本网站重视并保障所有用户的隐私与权利。"],
    ["Links you create are visible only to you and administrators, never to other regular users.","New links remain private by default and appear in public areas only when you choose to share them. This website is committed to protecting the privacy and rights of every user."],
    ["普通用户只会读取自己的链接；管理员会读取所有用户创建的私人链接并显示创建者。","这里展示与当前账号关联的私人链接。本网站重视并保障所有用户的隐私与权利。"],
    ["Regular users read only their own links. Administrators read all user-created private links and see the creator.","This area contains private links associated with the current account. This website is committed to protecting the privacy and rights of every user."],
    ["摘要现在与当前账号关联并保存到 R2 的隐藏系统目录中，不会出现在普通文件列表。管理员账号可以在本页下方查看所有用户的摘要。","摘要与当前账号关联，并保存到受保护的系统存储中，不会出现在普通文件列表。本网站重视并保障所有用户的隐私与权利。"],
    ["Summaries are now linked to the signed-in account and stored in a hidden R2 system path, so they do not appear in the normal file browser. Administrators can review all users’ summaries below.","Summaries are linked to the signed-in account and stored in protected system storage, separate from the normal file browser. This website is committed to protecting the privacy and rights of every user."]
  ];
  for (const [before, after] of replacements) output = output.replaceAll(before, after);
  return output;
}

function hardenSessionClientMarkup(markup) {
  return String(markup || "").replace(
    'const { error } = await supabaseClient.auth.signOut({ scope: "local" });',
    `await fetch("/api/auth/logout", {method: "POST",credentials: "same-origin",headers: { "Content-Type": "application/json", Accept: "application/json" },body: "{}",cache: "no-store"}).catch(() => {});\n        const { error } = await supabaseClient.auth.signOut({ scope: "local" });`
  );
}

function localizedPage(markup, locale, status = 200, options = {}) {
  const label = locale === "zh" ? "ZH" : "EN";
  const currentFeatureMarkup = normalizeFeatureAvailabilityCopy(markup);
  const privacySafeMarkup = normalizePublicPrivacyCopy(currentFeatureMarkup);
  const localizedMarkup = privacySafeMarkup.replace(/(<a\b[^>]*class="[^"]*\blanguage-toggle\b[^"]*"[^>]*>)[^<]*(<\/a>)/g,`$1${label}$2`);
  return html(localizedMarkup, status, options);
}

async function isAdminAccount(accessToken) {
  if (!accessToken) return false;
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/verify_admin_session`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${accessToken}`,
        "content-type": "application/json;charset=UTF-8",
        Accept: "application/json"
      },
      body: "{}"
    });
    if (!response.ok) return false;
    return (await response.json()) === true;
  } catch {
    return false;
  }
}


function wishDestination(kind) {
  if (kind === "birthday") return "/birthday";
  if (kind === "mid-autumn") return "/mid-autumn";
  return "";
}

function wishRedirect(request, locale, pathname) {
  const match = String(pathname || "").match(/^\/wish\/(birthday|mid-autumn)$/);
  if (!match) return null;
  const destination = wishDestination(match[1]);
  if (!destination) return null;
  const source = new URL(request.url);
  const target = new URL(request.url);
  const code = normalizeSupportedLocale(locale) || (locale === "zh" ? "zh-cn" : "en-us");
  target.pathname = `/${code}${destination}`;
  const name = String(source.searchParams.get("name") || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 36);
  target.search = "";
  if (name) target.searchParams.set("name", name);
  return Response.redirect(target.toString(), 302);
}

function replaceOsContent(markup, content) {
  const opening = '<section id="os-content"';
  const start = markup.indexOf(opening);
  if (start < 0) return markup;
  const startTagEnd = markup.indexOf(">", start);
  if (startTagEnd < 0) return markup;
  const marker = "\n      </section>\n    </main>";
  const end = markup.lastIndexOf(marker);
  if (end < 0 || end <= startTagEnd) return markup;
  return markup.slice(0, startTagEnd + 1) + "\n        " + content + markup.slice(end);
}

export default {
  async fetch(request, env) {
    const { pathname, locale, fullLocale, ipInfo } = getRouteInfo(request);
    if (pathname === "/api/auth/signup") { if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } }); return handleRegistrationSignup(request, env, ipInfo); }
    if (pathname === "/api/auth/login") { if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } }); return handleIdentifierPasswordLogin(request, env, ipInfo); }
    if (pathname === "/api/auth/bootstrap") { if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } }); return handleStudioSessionBootstrap(request); }
    if (pathname === "/api/auth/logout") { if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } }); return handleStudioSessionLogout(request); }
    if (pathname === "/auth/handoff") { if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } }); return handleAuthHandoff(request, env, fullLocale); }

    const legacyTarget = LEGACY_REDIRECTS.get(pathname);
    if (legacyTarget) return localizedRedirect(request, locale, legacyTarget);

    const wishRoute = wishRedirect(request, fullLocale, pathname);
    if (wishRoute) return wishRoute;

    if (isQuestionRoute(pathname)) {
      const sourceUrl = new URL(request.url);
      const explicitLocale = localeFromPath(sourceUrl.pathname);
      const routeLocale = questionRouteLocale(fullLocale);
      const questionId = questionRouteId(pathname);
      const targetPath = questionId ? questionDetailPath(routeLocale, questionId) : questionIndexPath(routeLocale);

      if (!explicitLocale || explicitLocale !== routeLocale) {
        sourceUrl.pathname = targetPath;
        sourceUrl.search = "";
        return Response.redirect(sourceUrl.toString(), 302);
      }

      const markup = questionId ? questionDetailPage(routeLocale, questionId) : questionHubPage(routeLocale);
      if (markup) {
        const canonicalHost = sourceUrl.hostname.toLowerCase() === "qsseda.com";
        const publicPath = questionId ? "/q/" + questionId : "/q";
        const description = questionId
          ? questionDetailDescription(routeLocale, questionId)
          : questionHubDescription(routeLocale);
        return localizedPage(
          injectPublicSeo(markup, routeLocale, publicPath, description, {
            alternateLocales: questionAlternateLocales(),
            xDefault: "https://qsseda.com/en-us" + publicPath
          }),
          locale,
          200,
          { indexable: canonicalHost }
        );
      }
    }

    const t = TEXT[locale];
    const links = buildLinks(locale, pathname, fullLocale);
    const linksSubroute = pathname === "/info/links/mine" || pathname === "/info/links/community" || pathname === "/info/links/curated";
    const labSubroute = pathname === "/workspace/experiments/tex";
    const workRoute = pathname === "/work" || pathname === "/work/local" || pathname === "/work/tex";
    const isHomeRoute = pathname === "/";
    const isProtectedOsRoute = (OS_PATHS.has(pathname) && pathname !== "/wishes") || linksSubroute;

    if (isHomeRoute || isProtectedOsRoute) {
      const gate = await verifyStudioPageSession(request);
      if (!gate.ok) {
        if (isHomeRoute) {
          const canonicalHost = new URL(request.url).hostname.toLowerCase() === "qsseda.com";
          return withStudioSessionCookies(
            localizedPage(publicHomeMarkup(fullLocale, request), locale, 200, { indexable: canonicalHost }),
            gate.cookies
          );
        }
        return withStudioSessionCookies(studioSessionBootstrapPage(locale, request), gate.cookies);
      }

      const cachedOsUserLabel = getRequestCookie(request, "qssed-os-user-name");
      const zh = locale === "zh";
      const mainOrigin = mainOriginForRequest(request);
      const workOrigin = workOriginForRequest(request);
      const cashOrigin = cashOriginForRequest(request);
      const gptOrigin = gptOriginForRequest(request);
      const shellProductLinks = {
        workHref: `${workOrigin}/${fullLocale}/tex`,
        cashHref: `${cashOrigin}/${fullLocale}`,
        // Watch URL 不直接拼 hostname，统一走 domain-family，才能正确处理 .com/.online 与旧 .studio 规范化。
        awHref: awOriginForRequest(request),
        gptHref: `${gptOrigin}/${fullLocale}`,
        adminHref: await isAdminAccount(gate.accessToken) ? adminOriginForRequest(request) + "/" : "",
        activeLocale: fullLocale
      };
      const shellPath = pathname === "/" ? "/" : linksSubroute ? "/info/links" : labSubroute ? "/workspace/experiments" : workRoute ? "/workspace" : pathname;
      let markup = osPage(t, links, shellPath, ipInfo, cachedOsUserLabel, shellProductLinks);
      markup = decorateWorkNavigation(markup, zh, pathname, mainOrigin, workOrigin, fullLocale);
      markup = polishWorkTexNavigation(markup, zh, pathname, workOrigin);
      markup = hardenSessionClientMarkup(markup);
      if (pathname === "/info/links") { const baseContent = polishLinksContent(linksHubContent(zh, fullLocale), pathname, zh); markup = replaceOsContent(markup, enhanceLinksHubWithCommunity(baseContent, zh, fullLocale)); }
      if (pathname === "/info/links/mine") markup = replaceOsContent(markup, polishLinksContent(privateLinksPageContent(zh, fullLocale), pathname, zh));
      if (pathname === "/info/links/community") markup = replaceOsContent(markup, communityLinksPageContent(zh, fullLocale));
      if (pathname === "/info/links/curated") markup = replaceOsContent(markup, polishLinksContent(curatedLinksPageContent(zh, fullLocale), pathname, zh));
      if (pathname === "/info/notes") markup = replaceOsContent(markup, researchNotesContent(zh, fullLocale));
      if (pathname === "/info/search") markup = replaceOsContent(markup, globalSearchContent(zh, fullLocale));
      if (pathname === "/workspace/workbench") markup = replaceOsContent(markup, workbenchContent(zh, fullLocale));
      if (pathname === "/workspace/projects") markup = replaceOsContent(markup, projectsWorkspaceContent(zh, fullLocale));
      if (pathname === "/workspace/tasks") markup = replaceOsContent(markup, tasksWorkspaceContent(zh, fullLocale));
      if (pathname === "/workspace/drafts") markup = replaceOsContent(markup, draftsWorkspaceContent(zh, fullLocale));
      if (pathname === "/workspace/experiments") markup = replaceOsContent(markup, labContent(zh, fullLocale));
      if (pathname === "/workspace/experiments/tex") markup = replaceOsContent(markup, enhanceTexWorkbenchLocal(texWorkbenchContent(zh), zh));
      if (pathname === "/work") markup = replaceOsContent(markup, polishWorkHubTexRoute(workHubContent(zh, workOrigin, fullLocale, mainOrigin), workOrigin));
      if (pathname === "/work/local") markup = replaceOsContent(markup, enhanceWorkLocalBridgeNative(workLocalBridgeContent(zh, fullLocale, mainOrigin), zh));
      if (pathname === "/work/tex") { markup = replaceOsContent(markup, enhanceWorkTexCollapsiblePanels(polishTexWorkbenchApp(enhanceTexWorkbenchLocal(texWorkbenchContent(zh), zh), zh), zh)); markup = polishWorkTexVisualTheme(markup); markup = injectWorkTexHomeLinks(markup, fullLocale, mainOrigin); }
      const pageOptions = pathname === "/work/local" || pathname === "/work/tex" || pathname === "/workspace/experiments/tex" ? { allowLoopback: true } : {};
      return withStudioSessionCookies(localizedPage(markup, locale, 200, pageOptions), gate.cookies);
    }

    if (pathname === "/wishes") {
      const canonicalHost = new URL(request.url).hostname.toLowerCase() === "qsseda.com";
      const markup = osPage(t, links, pathname, ipInfo, "", {
        activeLocale: fullLocale,
        publicMode: true
      });
      return localizedPage(
        injectPublicSeo(markup, fullLocale, "/wishes"),
        locale,
        200,
        { indexable: canonicalHost }
      );
    }

    // Watch 安装教程是主站的公开帮助页；真正的活动仪表盘仍由独立 aw.* Worker 提供。
    if (pathname === "/aw/setup") return watchSetupPage(request);
    if (pathname === "/birthday") {
      const canonicalHost = new URL(request.url).hostname.toLowerCase() === "qsseda.com";
      return localizedPage(
        injectPublicSeo(birthdayPage(fullLocale), fullLocale, "/birthday"),
        locale,
        200,
        { indexable: canonicalHost }
      );
    }
    if (pathname === "/mid-autumn") {
      const canonicalHost = new URL(request.url).hostname.toLowerCase() === "qsseda.com";
      return localizedPage(
        injectPublicSeo(midAutumnPage(fullLocale), fullLocale, "/mid-autumn"),
        locale,
        200,
        { indexable: canonicalHost }
      );
    }
    if (pathname === "/sign-up") return localizedPage(signUpPage(t, links, ipInfo), locale);
    if (pathname === "/login") {
      const authUrl = new URL("/login", authOriginForRequest(request));
      const requestedNext = new URL(request.url).searchParams.get("next");
      const fallbackNext = `/${fullLocale}`;
      authUrl.searchParams.set("next", safeLocalNext(requestedNext) || fallbackNext);
      return Response.redirect(authUrl.toString(), 302);
    }
    let notFoundHost = "qsseda.com";
    try { notFoundHost = new URL(request.url).hostname.toLowerCase(); } catch {}
    return localizedPage(notFoundPage(t, links, {
      locale: fullLocale,
      host: notFoundHost,
      requestedPath: pathname,
      returnHref: "/"
    }), locale, 404);
  }
};