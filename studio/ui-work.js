function workStyles() {
  return `
    <style id="qsseda-work-product-ui">
      .work-shell{
        display:grid;
        gap:16px;
        width:100%;
        color:var(--text,#1d1d1f);
      }
      .work-hero-card,
      .work-card{
        border:1px solid color-mix(in srgb,var(--border,#d2d2d7) 72%,transparent);
        background:color-mix(in srgb,var(--surface,#fff) 96%,var(--fill,#f5f5f7));
        box-shadow:0 1px 2px rgba(0,0,0,.025);
      }
      .work-hero-card{
        display:grid;
        grid-template-columns:minmax(0,1.32fr) minmax(280px,.68fr);
        gap:18px;
        align-items:stretch;
        padding:28px;
        border-radius:28px;
      }
      .work-hero-copy{
        display:flex;
        flex-direction:column;
        justify-content:center;
        min-height:230px;
        padding:4px 2px;
      }
      .work-eyebrow{
        margin:0 0 10px;
        color:var(--quiet,#86868b);
        font-size:12px;
        font-weight:700;
        letter-spacing:.08em;
      }
      .work-hero-card h2{
        max-width:820px;
        margin:0;
        font-size:clamp(34px,4.7vw,58px);
        font-weight:700;
        line-height:1.03;
        letter-spacing:-.05em;
      }
      .work-hero-card .work-hero-description{
        max-width:760px;
        margin:18px 0 0;
        color:var(--muted,#6e6e73);
        font-size:clamp(15px,1.45vw,18px);
        line-height:1.62;
        letter-spacing:-.01em;
      }
      .work-actions{
        display:flex;
        flex-wrap:wrap;
        gap:10px;
        margin-top:24px;
      }
      .work-button{
        appearance:none;
        -webkit-appearance:none;
        min-height:44px;
        padding:0 18px;
        border:0;
        border-radius:14px;
        font:inherit;
        font-size:14px;
        font-weight:650;
        line-height:1;
        text-decoration:none;
        cursor:pointer;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:7px;
        transition:transform .16s ease,background .16s ease,opacity .16s ease,box-shadow .16s ease;
        -webkit-tap-highlight-color:transparent;
      }
      .work-button.primary{
        background:var(--primary,#007aff);
        color:#fff;
        box-shadow:0 1px 2px color-mix(in srgb,var(--primary,#007aff) 22%,transparent);
      }
      .work-button.secondary{
        background:var(--fill,#f2f2f7);
        color:var(--text,#1d1d1f);
        box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--border,#d2d2d7) 62%,transparent);
      }
      .work-button:disabled{cursor:default;opacity:.46;transform:none!important}

      .work-status-card{
        display:flex;
        flex-direction:column;
        justify-content:space-between;
        gap:20px;
        min-height:230px;
        padding:22px;
        border-radius:22px;
        background:var(--fill,#f5f5f7);
        box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--border,#d2d2d7) 46%,transparent);
        transition:background .2s ease,box-shadow .2s ease;
      }
      .work-status-card.is-online{
        background:color-mix(in srgb,#34c759 6%,var(--fill,#f5f5f7));
        box-shadow:inset 0 0 0 1px color-mix(in srgb,#34c759 20%,var(--border,#d2d2d7));
      }
      .work-status-card.is-checking{
        background:color-mix(in srgb,#ff9f0a 5%,var(--fill,#f5f5f7));
      }
      .work-status-head{display:flex;align-items:flex-start;gap:12px}
      .work-status-indicator{
        display:grid;
        place-items:center;
        flex:0 0 auto;
        width:34px;
        height:34px;
        margin-top:1px;
        border-radius:50%;
        background:color-mix(in srgb,var(--quiet,#86868b) 10%,transparent);
      }
      .work-dot{
        width:10px;
        height:10px;
        border-radius:50%;
        background:#a1a1a6;
        box-shadow:0 0 0 5px color-mix(in srgb,#a1a1a6 12%,transparent);
        transition:background .18s ease,box-shadow .18s ease,transform .18s ease;
      }
      .work-status-card.is-online .work-dot,
      .work-dot.is-online{
        background:#34c759;
        box-shadow:0 0 0 5px color-mix(in srgb,#34c759 14%,transparent);
      }
      .work-status-card.is-checking .work-dot,
      .work-dot.is-checking{
        background:#ff9f0a;
        box-shadow:0 0 0 5px color-mix(in srgb,#ff9f0a 14%,transparent);
        animation:work-status-pulse 1.25s ease-in-out infinite;
      }
      .work-status-copy{display:grid;gap:3px;min-width:0}
      .work-status-label{color:var(--quiet,#86868b);font-size:12px;font-weight:600}
      .work-status-copy strong{font-size:19px;line-height:1.2;letter-spacing:-.025em}
      .work-status-card.is-online .work-status-copy strong{color:color-mix(in srgb,#248a3d 84%,var(--text,#1d1d1f))}
      .work-status-detail{margin:10px 0 0;color:var(--muted,#6e6e73);font-size:13px;line-height:1.5}
      .work-status-list{
        display:grid;
        gap:0;
        overflow:hidden;
        border-radius:14px;
        background:color-mix(in srgb,var(--surface,#fff) 72%,transparent);
      }
      .work-status-item{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:14px;
        min-height:42px;
        padding:0 12px;
        border-bottom:1px solid color-mix(in srgb,var(--border,#d2d2d7) 48%,transparent);
        font-size:12px;
      }
      .work-status-item:last-child{border-bottom:0}
      .work-status-item span{color:var(--muted,#6e6e73)}
      .work-status-item strong{font-size:12px;font-weight:650;text-align:right}
      .work-status-item strong.is-positive{color:#248a3d}

      .work-details{
        margin-top:12px;
        color:var(--muted,#6e6e73);
        font-size:12px;
      }
      .work-details summary{
        width:max-content;
        color:var(--muted,#6e6e73);
        font-weight:600;
        cursor:pointer;
        list-style:none;
        -webkit-tap-highlight-color:transparent;
      }
      .work-details summary::-webkit-details-marker{display:none}
      .work-details summary::after{content:"›";display:inline-block;margin-left:6px;transform:rotate(90deg);transition:transform .16s ease}
      .work-details[open] summary::after{transform:rotate(-90deg)}
      .work-detail-grid{
        display:grid;
        gap:7px;
        margin-top:10px;
        padding:12px;
        border-radius:12px;
        background:color-mix(in srgb,var(--surface,#fff) 66%,transparent);
        font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
        font-size:10px;
        line-height:1.45;
      }
      .work-detail-grid div{display:flex;justify-content:space-between;gap:16px}
      .work-detail-grid span:first-child{color:var(--quiet,#86868b)}
      .work-detail-grid span:last-child{text-align:right;word-break:break-word}

      .work-grid{
        display:grid;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:12px;
      }
      .work-card{
        position:relative;
        min-height:192px;
        padding:22px;
        border-radius:22px;
        display:flex;
        flex-direction:column;
        align-items:flex-start;
        gap:10px;
      }
      .work-card-link{color:inherit;text-decoration:none;cursor:pointer;transition:transform .18s ease,background .18s ease,box-shadow .18s ease}
      .work-card-icon{
        display:grid;
        place-items:center;
        width:40px;
        height:40px;
        margin-bottom:4px;
        border-radius:12px;
        background:var(--fill,#f2f2f7);
        color:var(--primary,#007aff);
        box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--border,#d2d2d7) 48%,transparent);
      }
      .work-card-icon svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      .work-card h3{margin:0;font-size:18px;line-height:1.25;letter-spacing:-.02em}
      .work-card p{margin:0;color:var(--muted,#6e6e73);font-size:13px;line-height:1.55}
      .work-card-action{margin-top:auto;padding-top:12px;color:var(--primary,#007aff);font-size:12px;font-weight:650}
      .work-card-action::after{content:"›";margin-left:4px}

      .work-panel{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px}
      .work-panel .work-card{min-height:180px}
      .work-capabilities{display:flex;flex-wrap:wrap;gap:7px;margin-top:4px}
      .work-capability{
        padding:6px 9px;
        border-radius:10px;
        background:var(--fill,#f2f2f7);
        color:var(--muted,#6e6e73);
        font-size:11px;
        font-weight:600;
      }
      .work-note{margin:2px 0 0;color:var(--muted,#6e6e73);font-size:12px;line-height:1.55}
      .work-privacy-row{display:flex;align-items:flex-start;gap:10px;margin-top:6px}
      .work-privacy-symbol{
        display:grid;place-items:center;flex:0 0 auto;width:28px;height:28px;border-radius:9px;
        background:color-mix(in srgb,#34c759 8%,var(--fill,#f2f2f7));color:#248a3d
      }
      .work-privacy-symbol svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
      .work-connection-message{
        margin-top:4px;
        padding:12px 13px;
        border-radius:13px;
        background:var(--fill,#f2f2f7);
        color:var(--muted,#6e6e73);
        font-size:12px;
        line-height:1.52;
      }
      .work-native-slot:empty{display:none}

      @keyframes work-status-pulse{50%{transform:scale(.78);opacity:.68}}
      @media(hover:hover) and (pointer:fine){
        .work-button:not(:disabled):hover{transform:translateY(-1px)}
        .work-button.primary:hover{background:color-mix(in srgb,var(--primary,#007aff) 90%,#000)}
        .work-button.secondary:hover{background:color-mix(in srgb,var(--fill,#f2f2f7) 88%,var(--text,#1d1d1f) 4%)}
        .work-card-link:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(0,0,0,.055)}
      }
      @media(max-width:900px){
        .work-hero-card{grid-template-columns:1fr;padding:22px}
        .work-hero-copy{min-height:auto;padding:2px 0}
        .work-grid{grid-template-columns:1fr}
        .work-panel{grid-template-columns:1fr}
        .work-status-card{min-height:0}
      }
      @media(max-width:560px){
        .work-shell{gap:10px}
        .work-hero-card{padding:18px;border-radius:22px;gap:14px}
        .work-hero-card h2{font-size:34px;line-height:1.06}
        .work-hero-card .work-hero-description{font-size:14px;line-height:1.58;margin-top:14px}
        .work-actions{display:grid;grid-template-columns:1fr;margin-top:20px}
        .work-button{width:100%}
        .work-status-card{padding:17px;border-radius:18px}
        .work-card{min-height:0;padding:18px;border-radius:18px}
        .work-card-link:active{transform:scale(.99);background:color-mix(in srgb,var(--surface,#fff) 94%,var(--fill,#f2f2f7))}
      }
      @media(prefers-reduced-motion:reduce){
        .work-button,.work-card-link,.work-dot,.work-details summary::after{transition:none!important}
        .work-dot.is-checking,.work-status-card.is-checking .work-dot{animation:none!important}
      }
    </style>
  `;
}

function workIcon(kind) {
  if (kind === "computer") return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2.5"></rect><path d="M8 21h8M12 17v4"></path></svg>`;
  if (kind === "tex") return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h8l4 4V20.5H6z"></path><path d="M14 3.5v4h4"></path><path d="m10 11-2 2 2 2M14 11l2 2-2 2"></path></svg>`;
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 4.4 2.8 8.2 7 10 4.2-1.8 7-5.6 7-10V6z"></path><path d="m9.2 12 1.8 1.8 3.8-4"></path></svg>`;
}

export function workHubContent(zh) {
  const prefix = zh ? "/zh-cn" : "/en";
  const workTexUrl = zh ? "https://work.qsseda.studio/zh-cn/tex" : "https://work.qsseda.studio/en/tex";
  const copy = zh ? {
    statusLabel: "本机连接",
    idle: "尚未连接",
    idleDetail: "连接这台电脑后，Work 会显示可用的本机工具。",
    online: "已连接",
    onlineDetail: "这台电脑已可供 Work 使用。",
    recentOffline: "未连接",
    recentOfflineDetail: "刚才没有检测到本机连接，可以重新检查。",
    computer: "这台电脑",
    available: "可用",
    notConnected: "等待连接",
    tex: "TeX",
    privacy: "隐私",
    localOnly: "仅本机访问",
    texReady: "可用",
    texMissing: "未检测到",
    details: "连接详情",
    endpoint: "地址",
    version: "版本"
  } : {
    statusLabel: "Computer connection",
    idle: "Not connected",
    idleDetail: "Connect this computer to show local tools available to Work.",
    online: "Connected",
    onlineDetail: "This computer is ready to use with Work.",
    recentOffline: "Not connected",
    recentOfflineDetail: "The local connection was not detected. You can check again.",
    computer: "This computer",
    available: "Available",
    notConnected: "Waiting",
    tex: "TeX",
    privacy: "Privacy",
    localOnly: "Local only",
    texReady: "Available",
    texMissing: "Not detected",
    details: "Connection details",
    endpoint: "Address",
    version: "Version"
  };

  return `
    ${workStyles()}
    <div class="work-shell" id="work-hub-root">
      <section class="work-hero-card">
        <div class="work-hero-copy">
          <p class="work-eyebrow">QssedA Work</p>
          <h2>${zh ? "让网页和这台电脑一起工作。" : "Let the web and this computer work together."}</h2>
          <p class="work-hero-description">${zh ? "连接这台电脑后，Work 可以使用本机的 TeX 等工具。连接只在当前设备上进行，账号信息不会发送到本机服务。" : "Connect this computer so Work can use local tools such as TeX. The connection stays on this device, and account credentials are never sent to the local service."}</p>
          <div class="work-actions">
            <a class="work-button primary" href="${prefix}/work/local">${zh ? "连接这台电脑" : "Connect this computer"}</a>
            <a class="work-button secondary" href="${workTexUrl}">${zh ? "打开 TeX" : "Open TeX"}</a>
          </div>
        </div>

        <aside class="work-status-card" id="work-hub-status-card" aria-live="polite">
          <div>
            <div class="work-status-head">
              <span class="work-status-indicator"><span class="work-dot" id="work-hub-status-dot"></span></span>
              <div class="work-status-copy">
                <span class="work-status-label">${copy.statusLabel}</span>
                <strong id="work-hub-status">${copy.idle}</strong>
              </div>
            </div>
            <p class="work-status-detail" id="work-hub-status-detail">${copy.idleDetail}</p>
          </div>
          <div>
            <div class="work-status-list">
              <div class="work-status-item"><span>${copy.computer}</span><strong id="work-hub-computer">${copy.notConnected}</strong></div>
              <div class="work-status-item"><span>${copy.tex}</span><strong id="work-hub-tex">${copy.notConnected}</strong></div>
              <div class="work-status-item"><span>${copy.privacy}</span><strong class="is-positive">${copy.localOnly}</strong></div>
            </div>
            <details class="work-details">
              <summary>${copy.details}</summary>
              <div class="work-detail-grid">
                <div><span>${copy.endpoint}</span><span id="work-hub-endpoint">—</span></div>
                <div><span>${copy.version}</span><span id="work-hub-version">—</span></div>
              </div>
            </details>
          </div>
        </aside>
      </section>

      <section class="work-grid" aria-label="${zh ? "Work 功能" : "Work features"}">
        <a class="work-card work-card-link" href="${prefix}/work/local">
          <span class="work-card-icon">${workIcon("computer")}</span>
          <h3>${zh ? "本机连接" : "Computer connection"}</h3>
          <p>${zh ? "连接当前电脑，并确认哪些本机工具可以安全地与 Work 配合使用。" : "Connect this computer and see which local tools are safely available to Work."}</p>
          <span class="work-card-action">${zh ? "管理连接" : "Manage connection"}</span>
        </a>
        <a class="work-card work-card-link" href="${workTexUrl}">
          <span class="work-card-icon">${workIcon("tex")}</span>
          <h3>${zh ? "TeX 工作台" : "TeX Workbench"}</h3>
          <p>${zh ? "创建、编辑并预览 TeX 文档；可用时自动使用这台电脑上的编译工具。" : "Create, edit, and preview TeX documents, using local compilation when available."}</p>
          <span class="work-card-action">${zh ? "打开 TeX" : "Open TeX"}</span>
        </a>
        <article class="work-card">
          <span class="work-card-icon">${workIcon("privacy")}</span>
          <h3>${zh ? "隐私优先" : "Privacy first"}</h3>
          <p>${zh ? "连接检查不会把你的登录凭据或文档内容发送给本机服务。需要新的本机能力时，会单独说明并请求权限。" : "Connection checks never send sign-in credentials or document content to the local service. New local capabilities request permission separately."}</p>
        </article>
      </section>
    </div>
    <script id="qsseda-work-hub-state">
      (() => {
        const stateKey = "qsseda.work.local.state.v2";
        const copy = ${JSON.stringify(copy)};
        const card = document.getElementById("work-hub-status-card");
        const status = document.getElementById("work-hub-status");
        const detail = document.getElementById("work-hub-status-detail");
        const computer = document.getElementById("work-hub-computer");
        const tex = document.getElementById("work-hub-tex");
        const endpoint = document.getElementById("work-hub-endpoint");
        const version = document.getElementById("work-hub-version");

        function readSnapshot() {
          try { return JSON.parse(window.sessionStorage.getItem(stateKey) || "null"); }
          catch { return null; }
        }

        function setPositive(node, positive) {
          node?.classList.toggle("is-positive", Boolean(positive));
        }

        function render() {
          const snapshot = readSnapshot();
          const age = snapshot ? Date.now() - Number(snapshot.at || 0) : Infinity;
          const freshOnline = Boolean(snapshot?.connected && age < 30 * 60 * 1000);
          const recentOffline = Boolean(snapshot && snapshot.connected === false && age < 5 * 60 * 1000);

          card?.classList.toggle("is-online", freshOnline);
          card?.classList.remove("is-checking");

          if (freshOnline) {
            if (status) status.textContent = copy.online;
            if (detail) detail.textContent = copy.onlineDetail;
            if (computer) computer.textContent = copy.available;
            if (tex) tex.textContent = snapshot.texAvailable ? copy.texReady : copy.texMissing;
            if (endpoint) endpoint.textContent = snapshot.endpoint || "—";
            if (version) version.textContent = snapshot.bridgeVersion || "—";
            setPositive(computer, true);
            setPositive(tex, Boolean(snapshot.texAvailable));
            return;
          }

          if (status) status.textContent = recentOffline ? copy.recentOffline : copy.idle;
          if (detail) detail.textContent = recentOffline ? copy.recentOfflineDetail : copy.idleDetail;
          if (computer) computer.textContent = copy.notConnected;
          if (tex) tex.textContent = copy.notConnected;
          if (endpoint) endpoint.textContent = "—";
          if (version) version.textContent = "—";
          setPositive(computer, false);
          setPositive(tex, false);
        }

        window.addEventListener("pageshow", render, { passive: true });
        document.addEventListener("visibilitychange", () => { if (!document.hidden) render(); }, { passive: true });
        render();
      })();
    </script>
  `;
}

export function workLocalBridgeContent(zh) {
  const copy = zh ? {
    statusLabel: "本机连接",
    idle: "尚未连接",
    idleDetail: "点击检查连接，确认这台电脑是否已准备好。",
    checking: "正在连接…",
    checkingDetail: "正在确认这台电脑上的 Work 连接组件。",
    online: "已连接",
    onlineDetail: "这台电脑已可供 Work 使用。",
    offline: "未连接",
    offlineDetail: "没有检测到本机连接。可以安装连接组件，或检查浏览器权限后重试。",
    computer: "这台电脑",
    available: "可用",
    unavailable: "未连接",
    tex: "TeX",
    privacy: "隐私",
    localOnly: "仅本机访问",
    texReady: "可用",
    texMissing: "未检测到",
    retry: "重新检查",
    details: "连接详情",
    endpoint: "地址",
    version: "版本",
    capabilities: "可用功能",
    capabilitiesDetail: "Work 只会显示当前真正可用的本机功能。新的功能需要单独授权。",
    privacyTitle: "连接保持在这台电脑上",
    privacyDetail: "连接检查不会发送账号 Cookie、Bearer Token 或文档内容。",
    logIdle: "尚未检查连接。",
    logChecking: "正在检查这台电脑上的连接组件。",
    logOnline: "连接正常。这台电脑已经可以与 Work 配合使用。",
    logOffline: "暂时没有检测到连接。安装或启动连接组件后再试一次。",
    texStatusUnavailable: "未能读取 TeX 状态"
  } : {
    statusLabel: "Computer connection",
    idle: "Not connected",
    idleDetail: "Check the connection to see whether this computer is ready.",
    checking: "Connecting…",
    checkingDetail: "Checking the Work connection component on this computer.",
    online: "Connected",
    onlineDetail: "This computer is ready to use with Work.",
    offline: "Not connected",
    offlineDetail: "The local connection was not detected. Install the connection component or check browser permissions and try again.",
    computer: "This computer",
    available: "Available",
    unavailable: "Not connected",
    tex: "TeX",
    privacy: "Privacy",
    localOnly: "Local only",
    texReady: "Available",
    texMissing: "Not detected",
    retry: "Check again",
    details: "Connection details",
    endpoint: "Address",
    version: "Version",
    capabilities: "Available features",
    capabilitiesDetail: "Work only shows local capabilities that are actually available. New capabilities request permission separately.",
    privacyTitle: "The connection stays on this computer",
    privacyDetail: "Connection checks do not send account cookies, bearer tokens, or document content.",
    logIdle: "The connection has not been checked yet.",
    logChecking: "Checking the connection component on this computer.",
    logOnline: "Connection looks good. This computer is ready to work with Work.",
    logOffline: "The connection was not detected. Install or start the connection component, then try again.",
    texStatusUnavailable: "Could not read TeX status"
  };

  return `
    ${workStyles()}
    <div class="work-shell" id="work-local-root">
      <section class="work-hero-card">
        <div class="work-hero-copy">
          <p class="work-eyebrow">QssedA Work</p>
          <h2>${zh ? "连接这台电脑。" : "Connect this computer."}</h2>
          <p class="work-hero-description">${zh ? "连接完成后，Work 可以发现这台电脑上可用的 TeX 等工具。连接检查只发生在本机，不会把账号凭据或文档内容发送给连接组件。" : "Once connected, Work can discover local tools such as TeX. Connection checks happen locally and do not send account credentials or document content to the connection component."}</p>
          <div class="work-actions">
            <button class="work-button primary" id="work-local-connect" type="button">${zh ? "检查连接" : "Check connection"}</button>
            <a class="work-button secondary" href="${zh ? "/zh-cn/work" : "/en/work"}">${zh ? "返回 Work" : "Back to Work"}</a>
            <!--QSSedaWorkNativeAction-->
          </div>
        </div>

        <aside class="work-status-card" id="work-local-status-card" aria-live="polite">
          <div>
            <div class="work-status-head">
              <span class="work-status-indicator"><span class="work-dot" id="work-local-dot"></span></span>
              <div class="work-status-copy">
                <span class="work-status-label">${copy.statusLabel}</span>
                <strong id="work-local-status">${copy.idle}</strong>
              </div>
            </div>
            <p class="work-status-detail" id="work-local-status-detail">${copy.idleDetail}</p>
          </div>
          <div>
            <div class="work-status-list">
              <div class="work-status-item"><span>${copy.computer}</span><strong id="work-local-computer">${copy.unavailable}</strong></div>
              <div class="work-status-item"><span>${copy.tex}</span><strong id="work-local-tex">${copy.unavailable}</strong></div>
              <div class="work-status-item"><span>${copy.privacy}</span><strong class="is-positive">${copy.localOnly}</strong></div>
            </div>
            <details class="work-details">
              <summary>${copy.details}</summary>
              <div class="work-detail-grid">
                <div><span>${copy.endpoint}</span><span id="work-local-endpoint">—</span></div>
                <div><span>${copy.version}</span><span id="work-local-version">—</span></div>
              </div>
            </details>
          </div>
        </aside>
      </section>

      <section class="work-panel">
        <article class="work-card">
          <span class="work-card-icon">${workIcon("computer")}</span>
          <h3>${copy.capabilities}</h3>
          <p>${copy.capabilitiesDetail}</p>
          <div class="work-capabilities" id="work-local-capabilities"><span class="work-capability">${zh ? "等待连接" : "Waiting"}</span></div>
          <div class="work-native-slot" id="work-native-note-slot"><!--QSSedaWorkNativeNote--></div>
        </article>
        <article class="work-card">
          <span class="work-card-icon">${workIcon("privacy")}</span>
          <h3>${copy.privacyTitle}</h3>
          <div class="work-privacy-row">
            <span class="work-privacy-symbol"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg></span>
            <p class="work-note">${copy.privacyDetail}</p>
          </div>
          <div class="work-connection-message" id="work-local-log">${copy.logIdle}</div>
        </article>
      </section>
    </div>
    <script>
      (() => {
        const endpoints = ["http://127.0.0.1:32145", "http://localhost:32145"];
        const expectedService = "qsseda-local-bridge";
        const expectedProtocol = 1;
        const stateKey = "qsseda.work.local.state.v2";
        const button = document.getElementById("work-local-connect");
        const card = document.getElementById("work-local-status-card");
        const dot = document.getElementById("work-local-dot");
        const status = document.getElementById("work-local-status");
        const statusDetail = document.getElementById("work-local-status-detail");
        const computerLabel = document.getElementById("work-local-computer");
        const endpointLabel = document.getElementById("work-local-endpoint");
        const versionLabel = document.getElementById("work-local-version");
        const texLabel = document.getElementById("work-local-tex");
        const capabilities = document.getElementById("work-local-capabilities");
        const log = document.getElementById("work-local-log");
        const text = ${JSON.stringify(copy)};

        function persist(snapshot) {
          try { window.sessionStorage.setItem(stateKey, JSON.stringify({ ...snapshot, at: Date.now() })); }
          catch {}
        }

        function setPositive(node, positive) {
          node?.classList.toggle("is-positive", Boolean(positive));
        }

        function setState(kind, message, description) {
          card?.classList.toggle("is-online", kind === "online");
          card?.classList.toggle("is-checking", kind === "checking");
          dot?.classList.toggle("is-online", kind === "online");
          dot?.classList.toggle("is-checking", kind === "checking");
          if (status) status.textContent = message;
          if (statusDetail) statusDetail.textContent = description || "";
        }

        async function loopbackFetch(base, path) {
          const controller = new AbortController();
          const timer = window.setTimeout(() => controller.abort(), 1800);
          try {
            const request = new Request(base + path, {
              method: "GET",
              mode: "cors",
              cache: "no-store",
              credentials: "omit",
              headers: { Accept: "application/json" },
              signal: controller.signal,
              targetAddressSpace: "loopback"
            });
            return await fetch(request);
          } finally {
            window.clearTimeout(timer);
          }
        }

        async function readJson(response) {
          if (!response?.ok) throw new Error("HTTP " + (response?.status || 0));
          return response.json();
        }

        function capabilityLabel(value) {
          const key = String(value || "");
          if (key === "health") return ${JSON.stringify(zh ? "连接检查" : "Connection check")};
          if (key === "tex.status") return ${JSON.stringify(zh ? "TeX 状态" : "TeX status")};
          if (key === "tex.compile") return ${JSON.stringify(zh ? "TeX 编译" : "TeX compile")};
          return key.replace(/[._-]+/g, " ");
        }

        function renderCapabilities(items) {
          if (!capabilities) return;
          capabilities.replaceChildren();
          const list = Array.isArray(items) ? items.slice(0, 12) : [];
          if (!list.length) {
            const chip = document.createElement("span");
            chip.className = "work-capability";
            chip.textContent = text.unavailable;
            capabilities.appendChild(chip);
            return;
          }
          for (const item of list) {
            const chip = document.createElement("span");
            chip.className = "work-capability";
            chip.textContent = capabilityLabel(item);
            capabilities.appendChild(chip);
          }
        }

        async function probe() {
          if (!button || button.disabled) return;
          button.disabled = true;
          setState("checking", text.checking, text.checkingDetail);
          if (log) log.textContent = text.logChecking;

          let connectedBase = "";
          let health = null;
          for (const base of endpoints) {
            try {
              const candidate = await readJson(await loopbackFetch(base, "/health"));
              if (candidate?.service !== expectedService || Number(candidate?.protocol) !== expectedProtocol) continue;
              connectedBase = base;
              health = candidate;
              break;
            } catch {}
          }

          if (!connectedBase || !health) {
            setState("offline", text.offline, text.offlineDetail);
            if (computerLabel) computerLabel.textContent = text.unavailable;
            if (texLabel) texLabel.textContent = text.unavailable;
            if (endpointLabel) endpointLabel.textContent = "—";
            if (versionLabel) versionLabel.textContent = "—";
            setPositive(computerLabel, false);
            setPositive(texLabel, false);
            renderCapabilities([]);
            if (log) log.textContent = text.logOffline;
            persist({ connected: false, texAvailable: false });
            button.disabled = false;
            button.textContent = text.retry;
            return;
          }

          const endpoint = connectedBase.replace(/^https?:\\/\\//, "");
          const bridgeVersion = String(health.version || "unknown");
          setState("online", text.online, text.onlineDetail);
          if (computerLabel) computerLabel.textContent = text.available;
          if (endpointLabel) endpointLabel.textContent = endpoint;
          if (versionLabel) versionLabel.textContent = "Bridge " + bridgeVersion + " · protocol " + String(health.protocol);
          setPositive(computerLabel, true);
          renderCapabilities(health.capabilities || []);
          if (log) log.textContent = text.logOnline;

          let texAvailable = false;
          let texVersion = "";
          try {
            const tex = await readJson(await loopbackFetch(connectedBase, "/tex/status"));
            texAvailable = Boolean(tex.available);
            texVersion = tex.version ? String(tex.version) : "";
            if (texLabel) texLabel.textContent = texAvailable ? text.texReady : text.texMissing;
            setPositive(texLabel, texAvailable);
          } catch {
            if (texLabel) texLabel.textContent = text.texStatusUnavailable;
            setPositive(texLabel, false);
          }

          persist({
            connected: true,
            endpoint,
            bridgeVersion,
            protocol: Number(health.protocol) || expectedProtocol,
            capabilities: Array.isArray(health.capabilities) ? health.capabilities : [],
            texAvailable,
            texVersion
          });
          button.disabled = false;
          button.textContent = text.retry;
        }

        async function autoProbeWhenAlreadyAllowed() {
          try {
            if (!navigator.permissions?.query) return;
            const permission = await navigator.permissions.query({ name: "loopback-network" });
            if (permission?.state === "granted") void probe();
          } catch {}
        }

        button?.addEventListener("click", () => void probe());
        void autoProbeWhenAlreadyAllowed();
      })();
    </script>
  `;
}

export function decorateWorkNavigation(markup, zh, pathname) {
  let output = String(markup || "");
  const prefix = zh ? "/zh-cn" : "/en";
  const mainOrigin = "https://qsseda.studio";
  const workTexUrl = zh ? "https://work.qsseda.studio/zh-cn/tex" : "https://work.qsseda.studio/en/tex";
  const isWork = pathname === "/work" || pathname === "/work/local";
  const rootCurrent = pathname === "/work" ? ' aria-current="page"' : "";
  const localCurrent = pathname === "/work/local" ? ' aria-current="page"' : "";
  const group = `
        <section class="os-nav-group ${isWork ? "is-active" : ""}" data-qsseda-work-nav="1">
          <span class="os-nav-title">Work</span>
          <div class="os-nav-items">
            <a href="${mainOrigin}${prefix}/work"${rootCurrent}>${zh ? "概览" : "Overview"}</a>
            <a href="${mainOrigin}${prefix}/work/local"${localCurrent}>${zh ? "本机连接" : "Computer"}</a>
            <a href="${workTexUrl}">${zh ? "TeX 工作台" : "TeX Workbench"}</a>
          </div>
        </section>
      `;

  output = output.replace(/\s*<section class="os-nav-group[^"]*" data-qsseda-work-nav="1">[\s\S]*?<\/section>\s*/g, "\n");

  if (isWork) output = output.replaceAll("os-nav-group is-active", "os-nav-group ");
  const adminAnchor = `<a class="os-nav-title" href="${prefix}/admin">`;
  const anchorIndex = output.indexOf(adminAnchor);
  const sectionIndex = anchorIndex >= 0 ? output.lastIndexOf('<section class="os-nav-group', anchorIndex) : -1;
  if (sectionIndex >= 0) output = output.slice(0, sectionIndex) + group + output.slice(sectionIndex);
  else output = output.replace("</nav>", group + "</nav>");

  if (!isWork) return output;

  const title = pathname === "/work/local" ? (zh ? "本机连接" : "Computer Connection") : "Work";
  const description = pathname === "/work/local"
    ? (zh ? "管理这台电脑与 QssedA Work 的连接。" : "Manage the connection between this computer and QssedA Work.")
    : (zh ? "让网页工作区与这台电脑配合使用。" : "Let the web workspace work together with this computer.");
  const shellTitle = zh ? "工作区" : "Workspace";
  const shellDescription = zh ? "工作区总览，用于查看并进入工作台、项目、实验、草稿与任务。" : "An overview for entering the Workbench, projects, experiments, drafts, and tasks.";

  output = output.replace(`<h1>${shellTitle}</h1>`, `<h1>${title}</h1>`);
  output = output.replace(`<p>${shellDescription}</p>`, `<p>${description}</p>`);
  output = output.replace(`${shellTitle} · QssedA Studio`, `${title} · QssedA Studio`);
  output = output.replace('const currentPath = "/workspace";', `const currentPath = ${JSON.stringify(pathname)};`);

  if (pathname === "/work/local") {
    output = output.replace(`data-fallback-href="${prefix}/dashboard"`, `data-fallback-href="${prefix}/work"`);
    output = output.replace(`const compactFallbackHref = "${prefix}/dashboard";`, `const compactFallbackHref = "${prefix}/work";`);
    output = output.replace("const compactMenuRoot = true;", "const compactMenuRoot = false;");
  }

  return output;
}
