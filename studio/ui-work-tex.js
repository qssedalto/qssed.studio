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
              button.textContent = copy.recheck;
              window.setTimeout(() => window.location.reload(), 420);
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
