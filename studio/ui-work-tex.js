export function polishWorkTexNavigation(markup, zh, pathname, workOrigin = "https://work.qsseda.com") {
  let output = String(markup || "");
  const prefix = zh ? "/zh-cn" : "/en";
  const workTexUrl = `${workOrigin}${zh ? "/zh-cn/tex" : "/en/tex"}`;
  const texLabel = zh ? "TeX 工作台" : "TeX Workbench";

  // Studio's Collaboration Hub and Local Bridge are distinct products. Only
  // TeX aliases normalize to the standalone Work TeX surface.
  output = output
    .replaceAll(`href="${prefix}/work/tex"`, `href="${workTexUrl}"`)
    .replaceAll(`href="${workOrigin}/${zh ? "zh-cn" : "en"}"`, `href="${workTexUrl}"`)
    .replaceAll(`href="${workOrigin}/${zh ? "zh-cn" : "en"}/local"`, `href="${workTexUrl}"`);

  if (pathname !== "/work/tex") return output;

  const shellTitle = zh ? "工作区" : "Workspace";
  output = output.replace(`${shellTitle} · AERTEX`, `${texLabel} · AERTEX Work`);

  // The Work host must expose only the TeX application itself. The Studio shell
  // remains in the document for its shared session/client plumbing, but all of
  // its product chrome is removed from layout so the TeX app owns the viewport.
  output = output.replace(
    "</head>",
    `<style id="qsseda-work-tex-only">
      html{background:var(--bg-soft)!important}
      body.os-shell{
        display:block!important;
        min-height:100vh!important;
        margin:0!important;
        padding:8px!important;
        overflow:hidden!important;
        background:var(--bg-soft)!important;
      }
      body.os-shell>.top-controls-zone,
      body.os-shell>.compact-back-zone,
      body.os-shell .os-sidebar,
      body.os-shell .os-hero,
      body.os-shell #admin-lock{display:none!important}
      body.os-shell .os-layout{
        display:block!important;
        width:100%!important;
        max-width:none!important;
        min-height:calc(100vh - 16px)!important;
        margin:0!important;
        padding:0!important;
      }
      body.os-shell .os-main{
        display:block!important;
        width:100%!important;
        max-width:none!important;
        min-height:calc(100vh - 16px)!important;
        margin:0!important;
        padding:0!important;
      }
      body.os-shell #os-content{
        width:100%!important;
        min-height:calc(100vh - 16px)!important;
        margin:0!important;
        padding:0!important;
      }
      body.os-shell .tex-workbench{
        width:100%!important;
        min-height:calc(100vh - 16px)!important;
        gap:0!important;
      }
      body.os-shell .tex-workbench .tex-hero{display:none!important}
      body.os-shell .tex-workbench .tex-shell{
        width:100%!important;
        height:calc(100vh - 16px)!important;
        min-height:calc(100vh - 16px)!important;
        border-radius:24px!important;
      }
      .tex-connection-actions{
        display:flex!important;
        align-items:center!important;
        justify-content:flex-start!important;
        gap:8px!important;
        margin-top:10px!important;
      }
      .tex-connection-check{
        width:auto!important;
        min-width:88px!important;
        min-height:30px!important;
        margin:0!important;
        padding:0 11px!important;
        border:0!important;
        border-radius:9px!important;
        background:var(--fill)!important;
        color:var(--text)!important;
        box-shadow:inset 0 0 0 1px var(--border)!important;
        font-size:9px!important;
        font-weight:700!important;
      }
      .tex-connection-check:hover{
        background:var(--surface-strong)!important;
        filter:none!important;
      }
      .tex-connection-check:disabled{opacity:.52!important}
      @media(max-width:760px){
        body.os-shell{padding:0!important}
        body.os-shell .os-layout,
        body.os-shell .os-main,
        body.os-shell #os-content,
        body.os-shell .tex-workbench{
          min-height:100vh!important;
        }
        body.os-shell .tex-workbench .tex-shell{
          height:100vh!important;
          min-height:100vh!important;
          border-radius:0!important;
        }
      }
    </style></head>`
  );

  const connectionCopy = zh ? {
    check: "检测连接",
    recheck: "重新检测",
    checking: "正在检测…",
    checkingTitle: "正在检测编译连接",
    checkingDetail: "正在检测本机 AERTEX Bridge 与云端 TeX 编译服务。",
    localReady: "本机 TeX 已连接",
    localDetail: "已检测到本机 AERTEX Bridge",
    cloudReady: "云端编译服务已连接",
    cloudDetail: "本机 Bridge 未连接；当前可使用已配置的云端 TeX 编译服务。",
    permissionPromptTitle: "需要本机网络权限",
    permissionPromptDetail: "work.qsseda.com 需要单独获得浏览器的本机网络访问权限。检测时请允许它访问这台电脑，然后会连接 127.0.0.1:32145。",
    permissionDeniedTitle: "本机网络权限已被阻止",
    permissionDeniedDetail: "浏览器已阻止 work.qsseda.com 访问这台电脑。请在地址栏左侧的网站权限中，把“本地网络访问”改为允许，然后重新检测。",
    offline: "编译服务尚未连接",
    offlineDetail: "仍未检测到本机 TeX Bridge，云端编译服务也不可用。若“本机桥接”页已经显示连接，请检查 Work 子域名的本地网络权限，并确认 Bridge 已更新到支持 work.qsseda.com 的版本。"
  } : {
    check: "Check connection",
    recheck: "Check again",
    checking: "Checking…",
    checkingTitle: "Checking compiler connection",
    checkingDetail: "Checking AERTEX Bridge on this computer and the cloud TeX compiler.",
    localReady: "Local TeX connected",
    localDetail: "AERTEX Bridge detected",
    cloudReady: "Cloud compiler connected",
    cloudDetail: "Local Bridge is offline; the configured cloud TeX compiler is available.",
    permissionPromptTitle: "Local network permission required",
    permissionPromptDetail: "work.qsseda.com needs its own browser permission to access this computer. Allow local network access when prompted, then it can connect to 127.0.0.1:32145.",
    permissionDeniedTitle: "Local network access is blocked",
    permissionDeniedDetail: "Your browser is blocking work.qsseda.com from accessing this computer. Open the site's permissions from the address bar, allow Local network access, then check again.",
    offline: "Compiler not connected",
    offlineDetail: "Local TeX Bridge is still unavailable and the cloud compiler is offline. If the Local Bridge page is already connected, check the Work subdomain's local-network permission and update Bridge to a build that trusts work.qsseda.com."
  };

  output = output.replace(
    "</body>",
    `<script id="qsseda-work-tex-connection-check">
      (() => {
        const copy = ${JSON.stringify(connectionCopy)};
        const endpoints = ["http://127.0.0.1:32145", "http://localhost:32145"];
        const expectedService = "qsseda-local-bridge";
        const expectedProtocol = 1;
        let checking = false;
        let loopbackPermission = 'unknown';

        async function readLoopbackPermission() {
          if (!navigator.permissions?.query) return 'unknown';
          for (const name of ['loopback-network', 'local-network-access']) {
            try {
              const permission = await navigator.permissions.query({ name });
              const state = String(permission?.state || 'unknown');
              permission?.addEventListener?.('change', () => {
                loopbackPermission = String(permission.state || 'unknown');
              }, { once: true });
              return state;
            } catch {}
          }
          return 'unknown';
        }

        function install() {
          const card = document.querySelector('.tex-compiler-card');
          const state = document.getElementById('tex-compiler-state');
          const detail = document.getElementById('tex-compiler-detail');
          if (!card || !state || !detail) {
            window.setTimeout(install, 80);
            return;
          }
          if (document.getElementById('tex-connection-check')) return;

          void readLoopbackPermission().then(value => { loopbackPermission = value; });

          const actions = document.createElement('div');
          actions.className = 'tex-connection-actions';
          const button = document.createElement('button');
          button.id = 'tex-connection-check';
          button.className = 'tex-connection-check';
          button.type = 'button';
          button.textContent = state.classList.contains('is-ready') ? copy.recheck : copy.check;
          actions.append(button);
          const privacy = card.querySelector('small');
          if (privacy) card.insertBefore(actions, privacy);
          else card.append(actions);

          const syncButtonLabel = () => {
            if (checking) return;
            button.textContent = state.classList.contains('is-ready') ? copy.recheck : copy.check;
          };
          const observer = new MutationObserver(syncButtonLabel);
          observer.observe(state, { attributes: true, childList: true, subtree: true });

          button.addEventListener('click', async () => {
            if (checking) return;
            checking = true;
            button.disabled = true;
            button.textContent = copy.checking;

            if (loopbackPermission === 'denied') {
              setSurface(copy.permissionDeniedTitle, copy.permissionDeniedDetail, false);
              checking = false;
              button.disabled = false;
              button.textContent = copy.recheck;
              return;
            }

            if (loopbackPermission === 'prompt') {
              setSurface(copy.permissionPromptTitle, copy.permissionPromptDetail, false);
            } else {
              setSurface(copy.checkingTitle, copy.checkingDetail, false);
            }

            const [local, cloud] = await Promise.all([probeLocal(), probeCloud()]);
            loopbackPermission = await readLoopbackPermission();
            if (local) {
              const engineText = local.engines.length ? ' · ' + local.engines.join(' / ') : '';
              setSurface(copy.localReady, copy.localDetail + ' · ' + local.host + engineText, true);
              // The existing editor/preview must stay mounted. Tell the local
              // compiler adapter to re-probe its connection in place instead of
              // losing unsaved editor state with a full page reload.
              window.dispatchEvent(new CustomEvent('qsseda:tex-local-recheck', {
                detail: { host: local.host, engines: local.engines }
              }));
              checking = false;
              button.disabled = false;
              button.textContent = copy.recheck;
              return;
            }

            if (cloud) {
              setSurface(copy.cloudReady, copy.cloudDetail, true);
              checking = false;
              button.disabled = false;
              button.textContent = copy.recheck;
              return;
            }

            if (loopbackPermission === 'denied') {
              setSurface(copy.permissionDeniedTitle, copy.permissionDeniedDetail, false);
            } else if (loopbackPermission === 'prompt') {
              setSurface(copy.permissionPromptTitle, copy.permissionPromptDetail, false);
            } else {
              setSurface(copy.offline, copy.offlineDetail, false);
            }
            checking = false;
            button.disabled = false;
            button.textContent = copy.recheck;
          });

          function setSurface(label, description, ready) {
            const stateText = state.querySelector('strong');
            if (stateText) stateText.textContent = label;
            detail.textContent = description;
            state.classList.toggle('is-ready', Boolean(ready));
            const pill = document.getElementById('tex-compiler-pill');
            const pillText = pill?.querySelector('span');
            if (pillText) pillText.textContent = label;
            pill?.classList.toggle('is-ready', Boolean(ready));
            pill?.classList.toggle('is-offline', !ready);
          }

          async function loopbackFetch(base, path) {
            const controller = new AbortController();
            const timer = window.setTimeout(() => controller.abort(), 3000);
            try {
              return await fetch(new Request(base + path, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-store',
                credentials: 'omit',
                headers: { Accept: 'application/json' },
                signal: controller.signal,
                targetAddressSpace: 'loopback'
              }));
            } finally {
              window.clearTimeout(timer);
            }
          }

          async function probeLocal() {
            for (const base of endpoints) {
              try {
                const healthResponse = await loopbackFetch(base, '/health');
                if (!healthResponse.ok) continue;
                const health = await healthResponse.json();
                if (health?.service !== expectedService || Number(health?.protocol) !== expectedProtocol) continue;
                if (!Array.isArray(health?.capabilities) || !health.capabilities.includes('tex.compile')) continue;

                const texResponse = await loopbackFetch(base, '/tex/status');
                if (!texResponse.ok) continue;
                const tex = await texResponse.json();
                if (!tex?.available) continue;
                const engines = Array.isArray(tex.engines)
                  ? tex.engines.map(value => String(value))
                  : [String(tex.engine || 'xelatex')];
                return { host: base.replace(/^https?:\\/\\//, ''), engines };
              } catch {}
            }
            return null;
          }

          async function probeCloud() {
            try {
              const response = await fetch('/api/tex/status', {
                credentials: 'same-origin',
                cache: 'no-store',
                headers: { Accept: 'application/json' }
              });
              const payload = await response.json().catch(() => ({}));
              return Boolean(response.ok && payload?.compiler_available);
            } catch {
              return false;
            }
          }
        }

        install();
      })();
    </script></body>`
  );

  output = output.replace('const currentPath = "/workspace";', `const currentPath = ${JSON.stringify(`${prefix}/tex`)};`);
  return output;
}

export function polishWorkHubTexRoute(markup, workOrigin = "https://work.qsseda.com") {
  const source = String(markup || "");
  const workTexUrl = `${workOrigin}${source.includes("Open TeX Workbench") ? "/en/tex" : "/zh-cn/tex"}`;
  return source
    .replaceAll("/workspace/experiments/tex", workTexUrl)
    .replaceAll("/work/tex", workTexUrl);
}


const WORK_TEX_VISUAL_STYLE = `
  <style id="qsseda-work-tex-visual-system-v2">
    :root[data-accent] body.os-shell:has(.tex-work-app){--primary:var(--aertex-accent);--primary-ink:var(--aertex-accent-ink)}

    body.os-shell:has(.tex-work-app){
      --work-panel:color-mix(in srgb,var(--surface) 97%,var(--primary) 3%);
      --work-panel-soft:color-mix(in srgb,var(--surface-soft) 96%,var(--primary) 4%);
      --work-card:color-mix(in srgb,var(--card) 98%,var(--primary) 2%);
      --work-line:color-mix(in srgb,var(--border) 86%,transparent);
      --work-shadow:0 22px 64px rgba(0,0,0,.12);
      --work-shadow-soft:0 10px 30px rgba(0,0,0,.065);
      --work-ease:cubic-bezier(.16,1,.3,1);
      background:
        radial-gradient(920px 560px at 8% -8%,color-mix(in srgb,var(--primary) 13%,transparent),transparent 68%),
        radial-gradient(760px 520px at 105% 104%,color-mix(in srgb,var(--primary) 7%,transparent),transparent 72%),
        var(--bg)!important;
    }
    :root[data-theme="light"] body.os-shell:has(.tex-work-app){
      --work-shadow:0 22px 64px rgba(24,26,31,.10);
      --work-shadow-soft:0 10px 28px rgba(24,26,31,.055);
    }

    body.os-shell:has(.tex-work-app) .tex-shell{
      border:1px solid var(--work-line)!important;
      border-radius:28px!important;
      background:var(--work-panel)!important;
      box-shadow:var(--work-shadow)!important;
    }
    body.os-shell:has(.tex-work-app) .tex-documents-panel,
    body.os-shell:has(.tex-work-app) .tex-runs-panel{
      background:color-mix(in srgb,var(--work-panel-soft) 94%,transparent)!important;
    }
    body.os-shell:has(.tex-work-app) .tex-editor-panel{background:var(--work-panel)!important}
    body.os-shell:has(.tex-work-app) .tex-documents-panel{border-right:1px solid var(--work-line)!important}
    body.os-shell:has(.tex-work-app) .tex-runs-panel{border-left:1px solid var(--work-line)!important}

    /* Welcome presentation is now isolated in the qtex module. */

    body.os-shell:has(.tex-work-app) .tex-panel-head,
    body.os-shell:has(.tex-work-app) .tex-runs-head{
      border-bottom:1px solid color-mix(in srgb,var(--work-line) 82%,transparent);
    }
    body.os-shell:has(.tex-work-app) .tex-create-row select,
    body.os-shell:has(.tex-work-app) .tex-editor-toolbar select,
    body.os-shell:has(.tex-work-app) .tex-search{
      background:var(--work-card)!important;
      box-shadow:inset 0 0 0 1px var(--work-line)!important;
    }
    body.os-shell:has(.tex-work-app) .tex-create-row select:focus,
    body.os-shell:has(.tex-work-app) .tex-editor-toolbar select:focus,
    body.os-shell:has(.tex-work-app) .tex-search:focus-within{
      outline:none!important;
      box-shadow:0 0 0 4px color-mix(in srgb,var(--primary) 11%,transparent),inset 0 0 0 1px color-mix(in srgb,var(--primary) 62%,var(--border))!important;
    }
    body.os-shell:has(.tex-work-app) .tex-create-row button,
    body.os-shell:has(.tex-work-app) .tex-runs-head button,
    body.os-shell:has(.tex-work-app) .tex-side-toggle,
    body.os-shell:has(.tex-work-app) .tex-preview-expand,
    body.os-shell:has(.tex-work-app) .tex-connection-check{
      background:var(--work-card)!important;
      color:var(--text)!important;
      box-shadow:inset 0 0 0 1px var(--work-line)!important;
    }
    body.os-shell:has(.tex-work-app) .tex-document-list{gap:7px!important}
    body.os-shell:has(.tex-work-app) .tex-document-item{
      border:1px solid transparent!important;
      border-radius:15px!important;
      background:transparent!important;
      transition:transform .2s var(--work-ease),background .18s ease,border-color .18s ease!important;
    }
    body.os-shell:has(.tex-work-app) .tex-document-item.is-active{
      background:color-mix(in srgb,var(--primary) 8%,var(--work-card))!important;
      border-color:color-mix(in srgb,var(--primary) 30%,var(--border))!important;
    }
    @media(hover:hover) and (pointer:fine){
      body.os-shell:has(.tex-work-app) .tex-document-item:hover{
        transform:translateX(2px);
        background:var(--work-card)!important;
        border-color:var(--work-line)!important;
      }
    }

    body.os-shell:has(.tex-work-app) .tex-editor-toolbar{
      background:color-mix(in srgb,var(--glass-heavy) 90%,transparent)!important;
      -webkit-backdrop-filter:blur(24px) saturate(155%);
      backdrop-filter:blur(24px) saturate(155%);
      border-bottom:1px solid var(--work-line)!important;
    }
    body.os-shell:has(.tex-work-app) .tex-editor-toolbar>input{
      font-weight:740!important;
      letter-spacing:-.035em!important;
    }
    body.os-shell:has(.tex-work-app) .tex-source-label{
      border-bottom:1px solid color-mix(in srgb,var(--work-line) 68%,transparent);
    }
    body.os-shell:has(.tex-work-app) #tex-source{
      background:linear-gradient(180deg,color-mix(in srgb,var(--work-panel) 99%,#fff 1%),var(--work-panel))!important;
      caret-color:var(--primary)!important;
    }
    body.os-shell:has(.tex-work-app) .tex-editor-footer{
      background:color-mix(in srgb,var(--glass-heavy) 91%,transparent)!important;
      -webkit-backdrop-filter:blur(22px) saturate(150%);
      backdrop-filter:blur(22px) saturate(150%);
      border-top:1px solid var(--work-line)!important;
    }
    body.os-shell:has(.tex-work-app) .tex-primary{
      background:var(--primary)!important;
      color:var(--primary-ink)!important;
      box-shadow:0 8px 18px color-mix(in srgb,var(--primary) 18%,transparent)!important;
    }
    body.os-shell:has(.tex-work-app) .tex-secondary{
      background:var(--fill)!important;
      box-shadow:inset 0 0 0 1px var(--work-line)!important;
    }

    body.os-shell:has(.tex-work-app) .tex-live-preview-card,
    body.os-shell:has(.tex-work-app) .tex-compiler-card{
      border:1px solid var(--work-line)!important;
      background:var(--work-card)!important;
      box-shadow:var(--work-shadow-soft)!important;
    }
    body.os-shell:has(.tex-work-app) .tex-live-preview-card{border-radius:20px!important}
    body.os-shell:has(.tex-work-app) .tex-compiler-card{border-radius:18px!important}
    body.os-shell:has(.tex-work-app) .tex-compiler-state.is-ready{color:var(--primary)!important}
    body.os-shell:has(.tex-work-app) .tex-compiler-state.is-ready i{
      background:var(--primary)!important;
      box-shadow:0 0 0 5px color-mix(in srgb,var(--primary) 12%,transparent);
    }
    body.os-shell:has(.tex-work-app) .tex-live-preview-viewport{
      border:1px solid var(--work-line)!important;
      background:color-mix(in srgb,var(--fill) 80%,var(--surface))!important;
      box-shadow:none!important;
    }
    body.os-shell:has(.tex-work-app) .tex-run-item{
      border:1px solid var(--work-line)!important;
      border-radius:14px!important;
      background:var(--work-card)!important;
    }

    @media(max-width:760px), (max-width:950px) and (pointer:coarse){
      :root{--tex-mobile-tabs-h:calc(64px + env(safe-area-inset-bottom,0px))}
      body.os-shell:has(.tex-work-app){
        background:radial-gradient(620px 360px at 92% -4%,color-mix(in srgb,var(--primary) 12%,transparent),transparent 72%),var(--bg)!important;
      }
      body.os-shell:has(.tex-work-app) .tex-workbench .tex-shell{
        border:0!important;
        border-radius:0!important;
        box-shadow:none!important;
        background:var(--work-panel)!important;
      }
      body.os-shell:has(.tex-work-app) .tex-panel-head{
        background:color-mix(in srgb,var(--glass-heavy) 92%,transparent)!important;
        border-bottom:1px solid var(--work-line)!important;
      }
      body.os-shell:has(.tex-work-app) .tex-document-item{
        background:var(--work-card)!important;
        border-color:var(--work-line)!important;
        box-shadow:0 6px 18px rgba(0,0,0,.035)!important;
      }
      body.os-shell:has(.tex-work-app) .tex-document-item.is-active{
        background:color-mix(in srgb,var(--primary) 8%,var(--work-card))!important;
        border-color:color-mix(in srgb,var(--primary) 36%,var(--border))!important;
      }

      body.os-shell:has(.tex-work-app) .tex-mobile-tabs{
        height:var(--tex-mobile-tabs-h)!important;
        padding:6px 10px env(safe-area-inset-bottom,0px)!important;
        border-top:1px solid var(--work-line)!important;
        background:color-mix(in srgb,var(--glass-heavy) 90%,transparent)!important;
        -webkit-backdrop-filter:blur(30px) saturate(170%)!important;
        backdrop-filter:blur(30px) saturate(170%)!important;
        box-shadow:0 -10px 30px rgba(0,0,0,.06)!important;
      }
      body.os-shell:has(.tex-work-app) .tex-mobile-tab{
        gap:3px!important;
        min-height:50px!important;
        border-radius:15px!important;
        color:var(--quiet)!important;
        transition:background .18s ease,color .18s ease,transform .16s ease!important;
      }
      body.os-shell:has(.tex-work-app) .tex-mobile-tab[aria-selected="true"]{
        background:color-mix(in srgb,var(--primary) 10%,var(--fill))!important;
        color:var(--primary)!important;
        box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 20%,transparent)!important;
      }
      body.os-shell:has(.tex-work-app) .tex-mobile-tab:active{
        transform:scale(.97)!important;
        background:color-mix(in srgb,var(--primary) 8%,var(--fill))!important;
      }
      body.os-shell:has(.tex-work-app) .tex-mobile-tab svg{width:22px!important;height:22px!important}

      body.os-shell:has(.tex-work-app) .tex-live-preview-card{
        margin:12px!important;
        padding:14px!important;
        border-radius:20px!important;
      }
      body.os-shell:has(.tex-work-app) .tex-compiler-card{
        margin:0 12px 12px!important;
        padding:14px!important;
        border-radius:18px!important;
      }
    }

    @media(prefers-reduced-motion:reduce){
      body.os-shell:has(.tex-work-app) .tex-document-item,
      body.os-shell:has(.tex-work-app) .tex-mobile-tab{
        transition:none!important;
        transform:none!important;
      }
    }
  </style>
`;

export function polishWorkTexVisualTheme(markup) {
  const source = String(markup || "");
  return source.replace("</body>", WORK_TEX_VISUAL_STYLE + "</body>");
}


export function injectWorkTexHomeLinks(markup, locale = "en-us", mainOrigin = "https://qsseda.com") {
  const output = String(markup || "");
  const activeLocale = String(locale || "en-us");
  const mainHref = `${String(mainOrigin || "https://qsseda.com").replace(/\/$/, "")}/${activeLocale}`;
  const label = activeLocale === "zh-cn" ? "返回 AERTEX 主站" : "AERTEX Home";
  const script = `
    <style id="qsseda-work-tex-home-links">
      .tex-work-app .tex-panel-home-link{
        flex:0 0 auto;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:5px;
        min-height:28px;
        margin-left:auto;
        padding:0 8px;
        border:1px solid var(--border);
        border-radius:8px;
        background:var(--fill);
        color:var(--muted);
        text-decoration:none;
        font-size:9px;
        font-weight:700;
        line-height:1;
        white-space:nowrap;
        -webkit-tap-highlight-color:transparent;
      }
      .tex-work-app .tex-panel-home-link:hover{background:var(--surface-strong);color:var(--text)}
      .tex-work-app .tex-editor-placeholder>.tex-panel-home-link{margin:8px auto 0}
      .tex-work-app .tex-editor-toolbar>.tex-panel-home-link{align-self:center;margin-left:auto}
      .tex-work-app .tex-panel-home-link>svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
      .tex-work-app .tex-panel-home-link .aertex-wordmark-token{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        width:70px!important;
        min-width:70px!important;
        height:13.5px!important;
        min-height:13.5px!important;
        padding:0!important;
        border-radius:0!important;
        background:transparent!important;
        color:currentColor!important;
        line-height:1!important;
      }
      .tex-work-app .tex-panel-home-link .aertex-wordmark-token>svg{
        display:block!important;
        width:100%!important;
        height:100%!important;
        overflow:visible!important;
        fill:currentColor!important;
        stroke:none!important;
      }
      @media(max-width:760px){
        .tex-work-app .tex-panel-home-link{min-height:30px;padding:0 9px;font-size:10px}
        .tex-work-app .tex-panel-home-link .aertex-wordmark-token{width:66px!important;min-width:66px!important;height:12.7px!important;min-height:12.7px!important}
      }
    </style>
    <script id="qsseda-work-tex-home-links-runtime">
      (() => {
        const href = ${JSON.stringify(mainHref)};
        const label = ${JSON.stringify(label)};
        const targets = [
          [".tex-documents-panel .tex-panel-head", "documents"],
          [".tex-editor-panel .tex-editor-toolbar", "editor"],
          [".tex-editor-panel .tex-editor-placeholder", "editor-empty"],
          [".tex-runs-panel .tex-runs-head", "preview"]
        ];
        const icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11.25 12 4l8.5 7.25"/><path d="M5.5 10.5v8.25h13V10.5"/><path d="M9.5 18.75v-5.5h5v5.5"/></svg>';
        function mount() {
          let pending = false;
          for (const [selector, slot] of targets) {
            const head = document.querySelector(selector);
            if (!head) { pending = true; continue; }
            if (head.querySelector('[data-aertex-home-slot="' + slot + '"]')) continue;
            const link = document.createElement("a");
            link.className = "tex-panel-home-link";
            link.dataset.aertexHomeSlot = slot;
            link.href = href;
            link.title = label;
            link.setAttribute("aria-label", label);
            link.innerHTML = icon + "<span>AERTEX</span>";
            head.append(link);
          }
          if (pending) window.setTimeout(mount, 120);
        }
        if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once:true });
        else mount();
      })();
    <\/script>
  `;
  return output.replace("</head>", script + "</head>");
}
