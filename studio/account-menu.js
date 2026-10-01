const DOMAIN_ROOTS = ["qsseda.com","qsseda.online","qsseda.studio"];

export function accountMenuStyles() {
  return `
.aertex-account-root{
  position:relative;display:inline-flex;align-items:center;z-index:120;
  --aertex-account-panel:var(--panel,var(--glass-heavy,var(--surface,#fff)));
  --aertex-account-panel2:var(--panel2,var(--surface-strong,var(--surface-soft,#f2f2f2)));
  --aertex-account-text:var(--text,#171717);
  --aertex-account-muted:var(--muted,#777);
  --aertex-account-line:var(--line,var(--border,rgba(0,0,0,.12)));
  --aertex-account-danger:var(--danger,#b42318);
}
@media(prefers-color-scheme:dark){
  :root:not([data-theme]) .aertex-account-root{
    --aertex-account-panel:var(--panel,var(--glass-heavy,var(--surface,#1c1c1e)));
    --aertex-account-panel2:var(--panel2,var(--surface-strong,var(--surface-soft,#2c2c2e)));
    --aertex-account-text:var(--text,#f5f5f7);
    --aertex-account-muted:var(--muted,#a1a1a6);
    --aertex-account-line:var(--line,var(--border,rgba(255,255,255,.12)));
    --aertex-account-danger:var(--danger,#ff453a);
  }
}
:root[data-theme="dark"] .aertex-account-root{
  --aertex-account-panel:var(--panel,var(--glass-heavy,var(--surface,#1c1c1e)));
  --aertex-account-panel2:var(--panel2,var(--surface-strong,var(--surface-soft,#2c2c2e)));
  --aertex-account-text:var(--text,#f5f5f7);
  --aertex-account-muted:var(--muted,#a1a1a6);
  --aertex-account-line:var(--line,var(--border,rgba(255,255,255,.12)));
  --aertex-account-danger:var(--danger,#ff453a);
}
:root[data-theme="light"] .aertex-account-root{
  --aertex-account-panel:var(--panel,var(--glass-heavy,var(--surface,#fff)));
  --aertex-account-panel2:var(--panel2,var(--surface-strong,var(--surface-soft,#f2f2f2)));
  --aertex-account-text:var(--text,#171717);
  --aertex-account-muted:var(--muted,#777);
  --aertex-account-line:var(--line,var(--border,rgba(0,0,0,.12)));
  --aertex-account-danger:var(--danger,#b42318);
}
.aertex-account-root[hidden]{display:none!important}
.aertex-account-button{width:44px;height:44px;min-width:44px;min-height:44px;margin:0;padding:0;border:1px solid var(--aertex-account-line);border-radius:50%;background:var(--aertex-account-panel);color:var(--aertex-account-text);display:grid;place-items:center;cursor:pointer;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.10);transition:transform .12s ease,background .12s ease,border-color .12s ease}
.aertex-account-button:hover{background:var(--aertex-account-panel2);filter:none}
.aertex-account-button:active{transform:scale(.93)}
.aertex-account-avatar{width:100%;height:100%;display:grid;place-items:center;border-radius:inherit;overflow:hidden;background:linear-gradient(145deg,var(--aertex-account-panel2),var(--aertex-account-panel));font-size:13px;font-weight:760;letter-spacing:-.02em}
.aertex-account-avatar img{width:100%;height:100%;display:block;object-fit:cover}
.aertex-account-menu{position:absolute;top:calc(100% + 10px);right:0;width:min(340px,calc(100vw - 24px));padding:10px;border:1px solid var(--aertex-account-line);border-radius:18px;background:var(--aertex-account-panel);color:var(--aertex-account-text);box-shadow:0 22px 60px rgba(0,0,0,.20);-webkit-backdrop-filter:blur(28px) saturate(170%);backdrop-filter:blur(28px) saturate(170%);text-align:left}
.aertex-account-menu[hidden]{display:none!important}
.aertex-account-head{display:grid;grid-template-columns:52px minmax(0,1fr);gap:12px;align-items:center;padding:8px}
.aertex-account-large{width:52px;height:52px;border-radius:50%;overflow:hidden;display:grid;place-items:center;background:var(--aertex-account-panel2);color:var(--aertex-account-text);font-weight:760}
.aertex-account-large img{width:100%;height:100%;display:block;object-fit:cover}
.aertex-account-identity{min-width:0}
.aertex-account-identity strong,.aertex-account-identity span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.aertex-account-identity strong{font-size:14px}
.aertex-account-identity span{margin-top:2px;color:var(--aertex-account-muted);font-size:12px}
.aertex-account-divider{height:1px;margin:6px 4px;background:var(--aertex-account-line)}
.aertex-account-action{width:100%;min-height:42px;margin:0;padding:0 11px;border:0;border-radius:11px;background:transparent;color:var(--aertex-account-text);display:flex;align-items:center;justify-content:flex-start;gap:10px;text-decoration:none;font:inherit;font-size:13px;font-weight:620;cursor:pointer;box-shadow:none}
.aertex-account-action:hover{background:var(--aertex-account-panel2);filter:none;transform:none}
.aertex-account-action:active{transform:scale(.99)}
.aertex-account-action.danger{color:var(--aertex-account-danger)}
.aertex-account-action svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:0 0 auto}
@media(max-width:560px){.aertex-account-menu{position:fixed;top:68px;right:12px}.aertex-account-button{width:42px;height:42px;min-width:42px;min-height:42px}}
`;
}

export function accountMenuMarkup(locale = "zh") {
  const zh = locale !== "en";
  const copy = zh ? {
    aria:"账号菜单",manage:"管理 AERTEX ID",switchAccount:"切换账号 / 重新登录",signOut:"退出登录",fallback:"AERTEX 用户"
  } : {
    aria:"Account menu",manage:"Manage AERTEX ID",switchAccount:"Switch account / sign in again",signOut:"Sign out",fallback:"AERTEX User"
  };
  return `
<div class="aertex-account-root" id="aertex-account-root" hidden>
  <button class="aertex-account-button" id="aertex-account-button" type="button" aria-label="${copy.aria}" title="${copy.aria}" aria-haspopup="menu" aria-expanded="false">
    <span class="aertex-account-avatar" id="aertex-account-avatar">A</span>
  </button>
  <div class="aertex-account-menu" id="aertex-account-menu" role="menu" hidden>
    <div class="aertex-account-head">
      <div class="aertex-account-large" id="aertex-account-large">A</div>
      <div class="aertex-account-identity">
        <strong id="aertex-account-name">${copy.fallback}</strong>
        <span id="aertex-account-email"></span>
        <span id="aertex-account-username"></span>
      </div>
    </div>
    <div class="aertex-account-divider"></div>
    <a class="aertex-account-action" id="aertex-account-manage" role="menuitem" href="#">
      <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.2"/><path d="M5.5 19c.7-3.3 3.1-5.1 6.5-5.1s5.8 1.8 6.5 5.1"/></svg>
      <span>${copy.manage}</span>
    </a>
    <button class="aertex-account-action" id="aertex-account-switch" role="menuitem" type="button">
      <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 7h10l-2.7-2.7M17 17H7l2.7 2.7"/><path d="M17 7l-2.7 2.7M7 17l2.7-2.7"/></svg>
      <span>${copy.switchAccount}</span>
    </button>
    <button class="aertex-account-action danger" id="aertex-account-signout" role="menuitem" type="button">
      <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M10 5H6.8A1.8 1.8 0 0 0 5 6.8v10.4A1.8 1.8 0 0 0 6.8 19H10"/><path d="M14.5 8.5 18 12l-3.5 3.5M18 12H9"/></svg>
      <span>${copy.signOut}</span>
    </button>
  </div>
</div>`;
}

export function accountMenuClientScript(options = {}) {
  const config = {
    summaryUrl: options.summaryUrl || "/api/account/security/summary",
    logoutUrl: options.logoutUrl || "/api/auth/logout",
    authMode: options.authMode === true,
    locale: options.locale === "en" ? "en" : "zh-cn"
  };
  return `<script>
(() => {
  const config=${scriptLiteral(config)};
  const root=document.getElementById("aertex-account-root");
  const button=document.getElementById("aertex-account-button");
  const menu=document.getElementById("aertex-account-menu");
  if(!root||!button||!menu)return;
  const byId=id=>document.getElementById(id);
  const roots=${scriptLiteral(DOMAIN_ROOTS)};
  const locale=config.locale==="en"?"en":"zh-cn";
  const host=location.hostname.toLowerCase();

  function domainRoot(){
    return roots.find(item=>host===item||host.endsWith("."+item))||"qsseda.com";
  }
  function authOrigin(){
    return location.protocol+"//auth."+domainRoot();
  }
  function mainNext(){
    if(host.startsWith("gpt.")){
      const current=(location.pathname.includes("/admin")?"/"+locale+"/admin":"/"+locale);
      return "/"+locale+"/gpt/handoff?next="+encodeURIComponent(current);
    }
    if(host.startsWith("work.")){
      const deep=location.pathname.match(/^\/(?:zh-cn|en)\/d\/(?:huawei-exempt\/)?[0-9a-f-]{36}$/i);
      const next=deep?location.pathname+location.search:"/"+locale+"/tex";
      return "/"+locale+"/work/handoff?next="+encodeURIComponent(next);
    }
    return location.pathname+location.search;
  }
  function normalizedIdentity(data){
    if(data&&data.authenticated&&data.user){
      return {
        name:data.user.displayName||data.user.username||data.user.email||"AERTEX User",
        email:data.user.email||"",
        username:data.user.username||"",
        avatar:data.user.avatarUrl||""
      };
    }
    if(data&&data.profile){
      return {
        name:data.profile.display_name||data.profile.username||data.user?.email||"AERTEX User",
        email:data.user?.email||"",
        username:data.profile.username||"",
        avatar:data.profile.avatar_url||""
      };
    }
    return null;
  }
  function initials(value){
    const raw=Array.from(String(value||"A").trim()).filter(Boolean);
    return (raw.slice(0,2).join("")||"A").toUpperCase();
  }
  function setAvatar(container,url,label){
    container.textContent=initials(label);
    if(!url)return;
    try{
      const parsed=new URL(url,location.href);
      if(parsed.protocol!=="https:")return;
      const img=document.createElement("img");
      img.alt="";
      img.src=parsed.toString();
      img.referrerPolicy="no-referrer";
      img.onload=()=>{container.textContent="";container.appendChild(img)};
    }catch{}
  }
  function closeMenu(){
    menu.hidden=true;
    button.setAttribute("aria-expanded","false");
  }
  function openMenu(){
    menu.hidden=false;
    button.setAttribute("aria-expanded","true");
  }
  button.addEventListener("click",event=>{
    event.stopPropagation();
    menu.hidden?openMenu():closeMenu();
  });
  document.addEventListener("click",event=>{if(!root.contains(event.target))closeMenu()});
  document.addEventListener("keydown",event=>{if(event.key==="Escape")closeMenu()});

  async function localLogout(){
    try{
      await fetch(config.logoutUrl,{method:"POST",credentials:"same-origin",headers:{Accept:"application/json","Content-Type":"application/json"},body:"{}",cache:"no-store"});
    }catch{}
  }
  async function leave(preserve){
    closeMenu();
    await localLogout();
    if(config.authMode){
      const target=new URL("/login",location.origin);
      if(preserve){
        const next=new URLSearchParams(location.search).get("next")||"";
        if(next)target.searchParams.set("next",next);
      }
      location.assign(target.toString());
      return;
    }
    const target=new URL("/logout",authOrigin());
    if(preserve)target.searchParams.set("next",mainNext());
    location.assign(target.toString());
  }

  byId("aertex-account-signout")?.addEventListener("click",()=>void leave(false));
  byId("aertex-account-switch")?.addEventListener("click",()=>void leave(true));

  (async()=>{
    try{
      const response=await fetch(config.summaryUrl,{credentials:"same-origin",cache:"no-store",headers:{Accept:"application/json"}});
      const data=await response.json().catch(()=>null);
      if(!response.ok)return;
      const identity=normalizedIdentity(data);
      if(!identity)return;
      const label=identity.name||identity.email||"AERTEX User";
      byId("aertex-account-name").textContent=label;
      byId("aertex-account-email").textContent=identity.email||"";
      byId("aertex-account-username").textContent=identity.username?("@"+identity.username):"";
      setAvatar(byId("aertex-account-avatar"),identity.avatar,label);
      setAvatar(byId("aertex-account-large"),identity.avatar,label);
      const manage=byId("aertex-account-manage");
      if(manage)manage.href=config.authMode?"/account":authOrigin()+"/account";
      root.hidden=false;
    }catch{}
  })();
})();
</script>`;
}

export function injectAccountMenuRuntime(markup, options = {}) {
  const source = String(markup || "");
  if (!source || source.includes('id="aertex-account-root"')) return source;
  const inferredLocale = /<html[^>]*lang=["']en(?:["'-]|\b)/i.test(source) ? "en" : "zh-cn";
  const locale = options.locale === "en" ? "en" : options.locale === "zh-cn" ? "zh-cn" : inferredLocale;
  const styles = `<style id="aertex-account-runtime-style">${accountMenuStyles()}.aertex-account-global-zone{position:fixed;top:14px;right:14px;z-index:2147483000}@media(max-width:560px){.aertex-account-global-zone{top:12px;right:12px}}</style>`;
  const block = `<div class="aertex-account-global-zone">${accountMenuMarkup(locale)}</div>${accountMenuClientScript({
    summaryUrl: options.summaryUrl || "/api/account/security/summary",
    logoutUrl: options.logoutUrl || "/api/auth/logout",
    authMode: options.authMode === true,
    locale
  })}`;
  let output = source.includes("</head>") ? source.replace("</head>", styles + "</head>") : styles + source;
  if (/<body\b[^>]*>/i.test(output)) {
    output = output.replace(/<body\b([^>]*)>/i, match => match + block);
  } else {
    output += block;
  }
  return output;
}

function scriptLiteral(value) {
  return JSON.stringify(value).replace(/</g,"\\u003c").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029");
}
