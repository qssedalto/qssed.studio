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
import { polishWorkHubTexRoute, polishWorkTexNavigation } from "./ui-work-tex.js";
import { enhanceWorkTexCollapsiblePanels } from "./ui-work-tex-panels.js";
import { normalizeFeatureAvailabilityCopy } from "./feature-availability-copy.js";
import { getRequestCookie, handleRegistrationSignup } from "./account-api.js";
import { handleIdentifierPasswordLogin, identifierLoginPage } from "./login-identifier-api.js";
import { getRouteInfo, buildLinks, html, localizedRedirect } from "./routing.js";
import { osPage } from "./ui-shell.js";
import { signUpPage, loginPage, notFoundPage } from "./auth-pages.js";
import { birthdayPage } from "./ui-birthday.js";
import { midAutumnPage } from "./ui-mid-autumn.js";
import { adminOriginForRequest, authOriginForRequest, gptOriginForRequest, mainOriginForRequest, workOriginForRequest } from "./domain-family.js";

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
  target.pathname = `${locale === "zh" ? "/zh-cn" : "/en"}${destination}`;
  const name = String(source.searchParams.get("name") || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 36);
  target.search = "";
  if (name) target.searchParams.set("name", name);
  return Response.redirect(target.toString(), 302);
}

function wishesPage(locale = "zh") {
  const zh = locale === "zh";
  const lang = zh ? "zh-CN" : "en";
  const prefix = zh ? "/zh-cn" : "/en";
  const text = zh ? {
    title: "祝福链接 · AERTEX",
    eyebrow: "AERTEX · WISHES",
    heading: "把祝福发给想祝福的人。",
    lead: "选择一个祝福页面。名字可以填写，也可以留空；AERTEX 会生成一条简洁的分享路由，再自动导向对应的祝福。",
    choose: "选择祝福",
    birthday: "生日快乐",
    birthdayNote: "适合生日当天发送。",
    midAutumn: "中秋快乐",
    midAutumnNote: "适合中秋节发送。",
    recipient: "要祝福谁？",
    optional: "可选",
    placeholder: "输入名字，也可以留空",
    share: "分享路由",
    destination: "实际导向",
    open: "打开祝福",
    copy: "复制链接",
    copied: "已复制",
    failed: "复制失败，请长按链接复制。",
    note: "留空时会生成不带 ?name= 的通用祝福链接；填写名字后会自动附加 ?name=xxx。",
    lang: "EN"
  } : {
    title: "Wish Links · AERTEX",
    eyebrow: "AERTEX · WISHES",
    heading: "Send a wish to someone.",
    lead: "Choose a greeting page. A name is optional; AERTEX creates a clean share route and redirects it to the selected greeting.",
    choose: "Choose a wish",
    birthday: "Happy Birthday",
    birthdayNote: "For birthdays.",
    midAutumn: "Happy Mid-Autumn Festival",
    midAutumnNote: "For the Mid-Autumn Festival.",
    recipient: "Who is this for?",
    optional: "Optional",
    placeholder: "Enter a name or leave it blank",
    share: "Share route",
    destination: "Destination",
    open: "Open wish",
    copy: "Copy link",
    copied: "Copied",
    failed: "Copy failed. Press and hold the link to copy it.",
    note: "Leave the name blank for a generic link. Adding a name automatically appends ?name=xxx.",
    lang: "ZH"
  };

  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="color-scheme" content="light dark">
  <title>${text.title}</title>
  <style>
    :root{color-scheme:light dark;--bg:#f6f6f4;--panel:rgba(255,255,255,.82);--solid:#fff;--text:#171719;--muted:#737378;--line:rgba(0,0,0,.09);--soft:#efefed;--shadow:0 26px 80px rgba(0,0,0,.08)}
    @media(prefers-color-scheme:dark){:root{--bg:#101011;--panel:rgba(28,28,30,.82);--solid:#1c1c1e;--text:#f5f5f7;--muted:#a1a1a7;--line:rgba(255,255,255,.1);--soft:#252527;--shadow:0 30px 90px rgba(0,0,0,.35)}}
    *{box-sizing:border-box}html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","PingFang SC","Helvetica Neue",Arial,sans-serif}
    body{padding:max(18px,env(safe-area-inset-top)) 18px max(28px,env(safe-area-inset-bottom))}
    button,input{font:inherit}.shell{width:min(920px,100%);margin:0 auto}.topbar{height:46px;display:flex;align-items:center;justify-content:space-between}
    .brand,.language-toggle{color:inherit;text-decoration:none}.brand{font-size:15px;font-weight:760;letter-spacing:.08em}.language-toggle{font-size:12px;font-weight:700;padding:8px 10px;border:1px solid var(--line);border-radius:999px;background:var(--panel)}
    .hero{padding:72px 0 34px}.eyebrow{font-size:12px;font-weight:760;letter-spacing:.17em;color:var(--muted)}h1{font-size:clamp(38px,7vw,68px);line-height:.99;letter-spacing:-.055em;margin:14px 0 18px;max-width:830px}.lead{max-width:730px;margin:0;color:var(--muted);font-size:17px;line-height:1.7}
    .panel{background:var(--panel);backdrop-filter:blur(28px) saturate(150%);-webkit-backdrop-filter:blur(28px) saturate(150%);border:1px solid var(--line);border-radius:28px;box-shadow:var(--shadow);overflow:hidden}.section{padding:24px}.section+.section{border-top:1px solid var(--line)}
    .label{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted);margin-bottom:14px}.optional{font-size:11px;padding:3px 7px;border-radius:999px;background:var(--soft)}
    .choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.choice{appearance:none;border:1px solid var(--line);background:var(--solid);color:var(--text);border-radius:20px;padding:18px;text-align:left;cursor:pointer;transition:.18s ease;min-height:112px}.choice:hover{transform:translateY(-1px)}.choice.active{border-color:var(--text);box-shadow:inset 0 0 0 1px var(--text)}.choice strong{display:block;font-size:18px;letter-spacing:-.02em;margin-bottom:8px}.choice span{display:block;font-size:13px;color:var(--muted);line-height:1.45}
    .name{width:100%;border:1px solid var(--line);background:var(--solid);color:var(--text);border-radius:16px;padding:14px 15px;outline:none}.name:focus{border-color:var(--text);box-shadow:0 0 0 3px rgba(127,127,127,.14)}
    .results{display:grid;grid-template-columns:1fr 1fr;gap:12px}.result{min-width:0;padding:16px;border-radius:18px;background:var(--soft);border:1px solid var(--line)}.result small{display:block;color:var(--muted);font-size:11px;margin-bottom:8px}.result a{display:block;color:inherit;text-decoration:none;font:600 13px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}.action{border:0;border-radius:14px;padding:12px 16px;font-weight:720;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}.primary{background:var(--text);color:var(--bg)}.secondary{background:var(--soft);color:var(--text);border:1px solid var(--line)}.note{margin:14px 0 0;color:var(--muted);font-size:12px;line-height:1.55}.status{min-height:18px;margin-top:10px;font-size:12px;color:var(--muted)}footer{padding:28px 4px 4px;color:var(--muted);font-size:12px}
    @media(max-width:680px){body{padding-left:14px;padding-right:14px}.hero{padding-top:48px}.choices,.results{grid-template-columns:1fr}.section{padding:18px}.panel{border-radius:24px}.actions{display:grid;grid-template-columns:1fr 1fr}.action{width:100%}}
  </style>
</head>
<body>
  <main class="shell">
    <div class="topbar">
      <a class="brand" href="${prefix}/dashboard">AERTEX</a>
      <a class="language-toggle" href="${zh ? "/en/wishes" : "/zh-cn/wishes"}">${text.lang}</a>
    </div>
    <section class="hero">
      <div class="eyebrow">${text.eyebrow}</div>
      <h1>${text.heading}</h1>
      <p class="lead">${text.lead}</p>
    </section>
    <section class="panel">
      <div class="section">
        <div class="label">${text.choose}</div>
        <div class="choices" role="radiogroup" aria-label="${text.choose}">
          <button class="choice active" type="button" data-kind="birthday" role="radio" aria-checked="true"><strong>${text.birthday}</strong><span>${text.birthdayNote}</span></button>
          <button class="choice" type="button" data-kind="mid-autumn" role="radio" aria-checked="false"><strong>${text.midAutumn}</strong><span>${text.midAutumnNote}</span></button>
        </div>
      </div>
      <div class="section">
        <div class="label">${text.recipient}<span class="optional">${text.optional}</span></div>
        <input id="wish-name" class="name" type="text" maxlength="36" autocomplete="off" placeholder="${text.placeholder}" aria-label="${text.recipient}">
      </div>
      <div class="section">
        <div class="results">
          <div class="result"><small>${text.share}</small><a id="share-link" href="${prefix}/wish/birthday">${prefix}/wish/birthday</a></div>
          <div class="result"><small>${text.destination}</small><a id="destination-link" href="${prefix}/birthday">${prefix}/birthday</a></div>
        </div>
        <div class="actions">
          <a id="open-link" class="action primary" href="${prefix}/wish/birthday">${text.open}</a>
          <button id="copy-link" class="action secondary" type="button">${text.copy}</button>
        </div>
        <p class="note">${text.note}</p>
        <div id="copy-status" class="status" role="status" aria-live="polite"></div>
      </div>
    </section>
    <footer>© AERTEX</footer>
  </main>
  <script>
    (() => {
      const prefix=${JSON.stringify(prefix)};
      const copyLabel=${JSON.stringify(text.copy)};
      const copiedLabel=${JSON.stringify(text.copied)};
      const failedLabel=${JSON.stringify(text.failed)};
      const choices=[...document.querySelectorAll("[data-kind]")];
      const nameInput=document.getElementById("wish-name");
      const shareLink=document.getElementById("share-link");
      const destinationLink=document.getElementById("destination-link");
      const openLink=document.getElementById("open-link");
      const copyButton=document.getElementById("copy-link");
      const status=document.getElementById("copy-status");
      let kind="birthday";
      const cleanName=value=>String(value||"").replace(/[\\u0000-\\u001f\\u007f]/g," ").replace(/\\s+/g," ").trim().slice(0,36);
      const paint=()=>{
        const name=cleanName(nameInput.value);
        const suffix=name?"?name="+encodeURIComponent(name):"";
        const shortPath=prefix+"/wish/"+kind+suffix;
        const targetPath=prefix+"/"+kind+suffix;
        const shortUrl=location.origin+shortPath;
        shareLink.href=shortUrl;shareLink.textContent=shortPath;shareLink.title=shortUrl;
        destinationLink.href=location.origin+targetPath;destinationLink.textContent=targetPath;
        openLink.href=shortUrl;
        const state=new URLSearchParams();state.set("type",kind);if(name)state.set("name",name);
        history.replaceState(null,"",location.pathname+"?"+state.toString());
      };
      const select=next=>{
        kind=next==="mid-autumn"?"mid-autumn":"birthday";
        choices.forEach(button=>{const active=button.dataset.kind===kind;button.classList.toggle("active",active);button.setAttribute("aria-checked",active?"true":"false")});
        status.textContent="";copyButton.textContent=copyLabel;paint();
      };
      choices.forEach(button=>button.addEventListener("click",()=>select(button.dataset.kind)));
      nameInput.addEventListener("input",()=>{status.textContent="";copyButton.textContent=copyLabel;paint()});
      copyButton.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(shareLink.href);copyButton.textContent=copiedLabel;status.textContent=copiedLabel;setTimeout(()=>copyButton.textContent=copyLabel,1600)}catch{status.textContent=failedLabel}});
      const initial=new URLSearchParams(location.search);const initialName=cleanName(initial.get("name"));if(initialName)nameInput.value=initialName;select(initial.get("type"));
    })();
  <\/script>
</body>
</html>`;
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
    const { pathname, locale, ipInfo } = getRouteInfo(request);
    if (pathname === "/api/auth/signup") { if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } }); return handleRegistrationSignup(request, env, ipInfo); }
    if (pathname === "/api/auth/login") { if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } }); return handleIdentifierPasswordLogin(request, env, ipInfo); }
    if (pathname === "/api/auth/bootstrap") { if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } }); return handleStudioSessionBootstrap(request); }
    if (pathname === "/api/auth/logout") { if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } }); return handleStudioSessionLogout(request); }
    if (pathname === "/auth/handoff") { if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } }); return handleAuthHandoff(request, env, locale); }

    const legacyTarget = LEGACY_REDIRECTS.get(pathname);
    if (legacyTarget) return localizedRedirect(request, locale, legacyTarget);

    const wishRoute = wishRedirect(request, locale, pathname);
    if (wishRoute) return wishRoute;

    const t = TEXT[locale];
    const links = buildLinks(locale, pathname);
    const linksSubroute = pathname === "/info/links/mine" || pathname === "/info/links/community" || pathname === "/info/links/curated";
    const labSubroute = pathname === "/workspace/experiments/tex";
    const workRoute = pathname === "/work" || pathname === "/work/local" || pathname === "/work/tex";
    const isHomeRoute = pathname === "/";
    const isProtectedOsRoute = OS_PATHS.has(pathname) || linksSubroute;

    if (isHomeRoute || isProtectedOsRoute) {
      const gate = await verifyStudioPageSession(request);
      if (!gate.ok) return withStudioSessionCookies(studioSessionBootstrapPage(locale, request), gate.cookies);

      const cachedOsUserLabel = getRequestCookie(request, "qssed-os-user-name");
      const zh = locale === "zh";
      const mainOrigin = mainOriginForRequest(request);
      const workOrigin = workOriginForRequest(request);
      const gptOrigin = gptOriginForRequest(request);
      const shellProductLinks = {
        workHref: `${workOrigin}/${zh ? "zh-cn/tex" : "en/tex"}`,
        gptHref: `${gptOrigin}/${zh ? "zh-cn" : "en"}`,
        adminHref: await isAdminAccount(gate.accessToken) ? adminOriginForRequest(request) + "/" : ""
      };
      const shellPath = pathname === "/" ? "/" : linksSubroute ? "/info/links" : labSubroute ? "/workspace/experiments" : workRoute ? "/workspace" : pathname;
      let markup = osPage(t, links, shellPath, ipInfo, cachedOsUserLabel, shellProductLinks);
      markup = decorateWorkNavigation(markup, zh, pathname, mainOrigin, workOrigin);
      markup = polishWorkTexNavigation(markup, zh, pathname, workOrigin);
      markup = hardenSessionClientMarkup(markup);
      if (pathname === "/info/links") { const baseContent = polishLinksContent(linksHubContent(zh), pathname, zh); markup = replaceOsContent(markup, enhanceLinksHubWithCommunity(baseContent, zh)); }
      if (pathname === "/info/links/mine") markup = replaceOsContent(markup, polishLinksContent(privateLinksPageContent(zh), pathname, zh));
      if (pathname === "/info/links/community") markup = replaceOsContent(markup, communityLinksPageContent(zh));
      if (pathname === "/info/links/curated") markup = replaceOsContent(markup, polishLinksContent(curatedLinksPageContent(zh), pathname, zh));
      if (pathname === "/info/notes") markup = replaceOsContent(markup, researchNotesContent(zh));
      if (pathname === "/info/search") markup = replaceOsContent(markup, globalSearchContent(zh));
      if (pathname === "/workspace/workbench") markup = replaceOsContent(markup, workbenchContent(zh));
      if (pathname === "/workspace/projects") markup = replaceOsContent(markup, projectsWorkspaceContent(zh));
      if (pathname === "/workspace/tasks") markup = replaceOsContent(markup, tasksWorkspaceContent(zh));
      if (pathname === "/workspace/drafts") markup = replaceOsContent(markup, draftsWorkspaceContent(zh));
      if (pathname === "/workspace/experiments") markup = replaceOsContent(markup, labContent(zh));
      if (pathname === "/workspace/experiments/tex") markup = replaceOsContent(markup, enhanceTexWorkbenchLocal(texWorkbenchContent(zh), zh));
      if (pathname === "/work") markup = replaceOsContent(markup, polishWorkHubTexRoute(workHubContent(zh, workOrigin), workOrigin));
      if (pathname === "/work/local") markup = replaceOsContent(markup, enhanceWorkLocalBridgeNative(workLocalBridgeContent(zh), zh));
      if (pathname === "/work/tex") markup = replaceOsContent(markup, enhanceWorkTexCollapsiblePanels(polishTexWorkbenchApp(enhanceTexWorkbenchLocal(texWorkbenchContent(zh), zh), zh), zh));
      const pageOptions = pathname === "/work/local" || pathname === "/work/tex" || pathname === "/workspace/experiments/tex" ? { allowLoopback: true } : {};
      return withStudioSessionCookies(localizedPage(markup, locale, 200, pageOptions), gate.cookies);
    }

    if (pathname === "/wishes") return localizedPage(wishesPage(locale), locale);
    if (pathname === "/birthday") return localizedPage(birthdayPage(locale), locale);
    if (pathname === "/mid-autumn") return localizedPage(midAutumnPage(locale), locale);
    if (pathname === "/sign-up") return localizedPage(signUpPage(t, links, ipInfo), locale);
    if (pathname === "/login") {
      const authUrl = new URL("/login", authOriginForRequest(request));
      const requestedNext = new URL(request.url).searchParams.get("next");
      const fallbackNext = locale === "zh" ? "/zh-cn" : "/en";
      authUrl.searchParams.set("next", safeLocalNext(requestedNext) || fallbackNext);
      return Response.redirect(authUrl.toString(), 302);
    }
    return localizedPage(notFoundPage(t, links), locale, 404);
  }
};