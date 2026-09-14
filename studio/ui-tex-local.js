export function enhanceTexWorkbenchLocal(markup, zh) {
  const copy = zh ? {
    localReady: "本机 TeX 已连接",
    localUnsupported: "本机不支持当前引擎",
    localDetail: "编译会直接在这台电脑的 QssedA Local Bridge 中完成；源码不会上传到 QssedA TeX 编译服务器。",
    localUnsupportedDetail: "本机 Bridge 当前只开放 XeLaTeX 与 pdfLaTeX。可切换引擎，或在云端编译服务可用时继续使用其他引擎。",
    cloudReady: "云端编译服务已连接",
    offline: "编译服务尚未连接",
    offlineDetail: "未检测到本机 TeX Bridge，云端编译服务也不可用。仍可编辑、自动保存和下载源码。",
    localCompiling: "正在本机编译…",
    localSuccess: "本机编译成功",
    localFailed: "本机编译失败",
    localOpen: "打开本机 PDF",
    localRun: "本机",
    privacy: "本机编译只把当前源码发送到 127.0.0.1；不会发送账号 Cookie 或 Bearer Token。",
    compile: "编译 PDF"
  } : {
    localReady: "Local TeX connected",
    localUnsupported: "Current engine is not enabled locally",
    localDetail: "Compilation runs directly through QssedA Local Bridge on this computer; source is not uploaded to the QssedA TeX compiler service.",
    localUnsupportedDetail: "The local Bridge currently enables XeLaTeX and pdfLaTeX only. Switch engines or use the cloud compiler when another engine is required.",
    cloudReady: "Cloud compiler connected",
    offline: "Compiler not connected",
    offlineDetail: "Neither the local TeX Bridge nor the cloud compiler is available. Editing, autosave, and source download still work.",
    localCompiling: "Compiling locally…",
    localSuccess: "Local compilation succeeded",
    localFailed: "Local compilation failed",
    localOpen: "Open local PDF",
    localRun: "Local",
    privacy: "Local compilation sends the current source only to 127.0.0.1; account cookies and bearer tokens are not sent.",
    compile: "Compile PDF"
  };

  return String(markup || "") + `
    <script>
      (() => {
        const localCopy = ${JSON.stringify(copy)};
        const endpoints = ["http://127.0.0.1:32145", "http://localhost:32145"];
        const expectedService = "qsseda-local-bridge";
        const expectedProtocol = 1;
        const localUrls = new Set();
        let localBase = "";
        let localEngines = [];
        let cloudAvailable = false;
        let localBusy = false;

        const start = async () => {
          const root = document.querySelector('[data-tex-root]');
          if (!root) return;
          const compile = document.getElementById('tex-compile');
          const editor = document.getElementById('tex-editor');
          const engine = document.getElementById('tex-engine');
          const source = document.getElementById('tex-source');
          const title = document.getElementById('tex-title');
          const pill = document.getElementById('tex-compiler-pill');
          const state = document.getElementById('tex-compiler-state');
          const detail = document.getElementById('tex-compiler-detail');
          const message = document.getElementById('tex-message');
          const runList = document.getElementById('tex-run-list');
          const runsEmpty = document.getElementById('tex-runs-empty');
          if (!compile || !editor || !engine || !source) return;

          function showMessage(text, error = false) {
            if (!message) return;
            message.hidden = !text;
            message.textContent = text || '';
            message.classList.toggle('is-error', Boolean(error));
          }

          async function loopbackFetch(base, path, options = {}) {
            const controller = new AbortController();
            const timer = window.setTimeout(() => controller.abort(), options.method === 'POST' ? 23000 : 1800);
            try {
              const headers = { Accept: options.accept || 'application/json', ...(options.body ? { 'Content-Type': 'application/json;charset=UTF-8' } : {}), ...(options.headers || {}) };
              const request = new Request(base + path, {
                method: options.method || 'GET',
                mode: 'cors',
                cache: 'no-store',
                credentials: 'omit',
                headers,
                body: options.body,
                signal: controller.signal,
                targetAddressSpace: 'loopback'
              });
              return await fetch(request);
            } finally {
              window.clearTimeout(timer);
            }
          }

          async function readJson(response) {
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
              const error = new Error(payload?.error || localCopy.localFailed);
              error.payload = payload;
              throw error;
            }
            return payload;
          }

          function supportsCurrentEngine() {
            return Boolean(localBase && localEngines.includes(String(engine.value || '').toLowerCase()));
          }

          function hasDocument() {
            return !editor.hidden && Boolean(source);
          }

          function setCompilerSurface(kind) {
            const pillText = pill?.querySelector('span');
            const stateText = state?.querySelector('strong');
            const privacy = state?.closest('.tex-compiler-card')?.querySelector('small');
            const ready = kind === 'local' || kind === 'cloud';
            pill?.classList.toggle('is-ready', ready);
            pill?.classList.toggle('is-offline', !ready);
            state?.classList.toggle('is-ready', ready);
            let label = localCopy.offline;
            let description = localCopy.offlineDetail;
            if (kind === 'local') {
              label = localCopy.localReady;
              description = localCopy.localDetail;
            } else if (kind === 'unsupported') {
              label = localCopy.localUnsupported;
              description = localCopy.localUnsupportedDetail;
            } else if (kind === 'cloud') {
              label = localCopy.cloudReady;
              description = ${JSON.stringify(zh ? "当前引擎将使用已配置的 QssedA 云端 TeX 编译服务。" : "The current engine will use the configured QssedA cloud TeX compiler service.")};
            }
            if (pillText) pillText.textContent = label;
            if (stateText) stateText.textContent = label;
            if (detail) detail.textContent = description;
            if (privacy && localBase) privacy.textContent = localCopy.privacy;
          }

          function syncCompiler() {
            const localSupported = supportsCurrentEngine();
            if (localSupported) setCompilerSurface('local');
            else if (cloudAvailable) setCompilerSurface('cloud');
            else if (localBase) setCompilerSurface('unsupported');
            else setCompilerSurface('offline');
            const available = localSupported || cloudAvailable;
            const shouldDisable = localBusy || !hasDocument() || !available;
            if (compile.disabled !== shouldDisable) compile.disabled = shouldDisable;
          }

          async function probeCloud() {
            try {
              const response = await fetch('/api/tex/status', { credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' } });
              const payload = await response.json().catch(() => ({}));
              cloudAvailable = Boolean(response.ok && payload?.compiler_available);
            } catch {
              cloudAvailable = false;
            }
          }

          async function probeLocal() {
            localBase = '';
            localEngines = [];
            for (const base of endpoints) {
              try {
                const health = await readJson(await loopbackFetch(base, '/health'));
                if (health?.service !== expectedService || Number(health?.protocol) !== expectedProtocol) continue;
                if (!Array.isArray(health?.capabilities) || !health.capabilities.includes('tex.compile')) continue;
                const tex = await readJson(await loopbackFetch(base, '/tex/status'));
                if (!tex?.available) continue;
                localBase = base;
                localEngines = Array.isArray(tex.engines) ? tex.engines.map(value => String(value).toLowerCase()) : [String(tex.engine || 'xelatex').toLowerCase()];
                break;
              } catch {}
            }
            syncCompiler();
          }

          function addLocalRun({ ok, url = '', engineName = '', error = '', elapsed = 0 }) {
            if (!runList) return;
            if (runsEmpty) runsEmpty.hidden = true;
            const item = document.createElement('article');
            item.className = 'tex-run-item';
            item.dataset.localTexRun = '1';
            const top = document.createElement('div');
            top.className = 'tex-run-top';
            const name = document.createElement('strong');
            name.textContent = (title?.value || ${JSON.stringify(zh ? "未命名 TeX 文档" : "Untitled TeX document")}) + ' · ' + localCopy.localRun;
            const status = document.createElement('span');
            status.className = 'tex-run-status is-' + (ok ? 'success' : 'failed');
            status.textContent = ok ? localCopy.localSuccess : localCopy.localFailed;
            top.append(name, status);
            const meta = document.createElement('div');
            meta.className = 'tex-run-meta';
            const engineMeta = document.createElement('span');
            engineMeta.textContent = engineName;
            const time = document.createElement('time');
            time.textContent = elapsed ? (Math.round(elapsed) + ' ms') : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            meta.append(engineMeta, time);
            item.append(top, meta);
            if (error) {
              const p = document.createElement('p');
              p.className = 'tex-run-error';
              p.textContent = error;
              item.append(p);
            }
            if (ok && url) {
              const link = document.createElement('a');
              link.href = url;
              link.target = '_blank';
              link.rel = 'noopener';
              link.textContent = localCopy.localOpen + ' ↗';
              item.append(link);
            }
            runList.prepend(item);
            while (runList.querySelectorAll('[data-local-tex-run="1"]').length > 8) {
              runList.querySelector('[data-local-tex-run="1"]:last-of-type')?.remove();
            }
          }

          async function compileLocal() {
            if (!supportsCurrentEngine() || localBusy) return;
            localBusy = true;
            compile.disabled = true;
            compile.textContent = localCopy.localCompiling;
            showMessage('');
            const engineName = String(engine.value || '').toLowerCase();
            const started = performance.now();
            try {
              const response = await loopbackFetch(localBase, '/tex/compile', {
                method: 'POST',
                accept: 'application/pdf, application/json',
                body: JSON.stringify({ engine: engineName, source: source.value || '', title: title?.value || '' })
              });
              if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                const error = new Error(payload?.error || localCopy.localFailed);
                error.payload = payload;
                throw error;
              }
              const type = String(response.headers.get('content-type') || '').toLowerCase();
              if (!type.includes('application/pdf')) throw new Error(localCopy.localFailed);
              const blob = await response.blob();
              const url = URL.createObjectURL(blob);
              localUrls.add(url);
              const elapsed = performance.now() - started;
              addLocalRun({ ok: true, url, engineName, elapsed });
              showMessage(localCopy.localSuccess);
            } catch (error) {
              const diagnostic = String(error?.payload?.log || '').trim().split(/\\r?\\n/).filter(Boolean).slice(-2).join(' · ');
              const display = String(error?.message || localCopy.localFailed) + (diagnostic ? ' · ' + diagnostic.slice(0, 420) : '');
              addLocalRun({ ok: false, engineName, error: display, elapsed: performance.now() - started });
              showMessage(display, true);
              console.warn('Local TeX compile failed', error?.payload?.log || error);
            } finally {
              localBusy = false;
              compile.textContent = localCopy.compile;
              syncCompiler();
            }
          }

          root.addEventListener('click', event => {
            if (event.target?.closest?.('#tex-compile') !== compile) return;
            if (!supportsCurrentEngine()) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            void compileLocal();
          }, true);

          engine.addEventListener('change', () => window.setTimeout(syncCompiler, 0));
          const observer = new MutationObserver(() => syncCompiler());
          observer.observe(editor, { attributes: true, attributeFilter: ['hidden'] });
          observer.observe(compile, { attributes: true, attributeFilter: ['disabled'] });
          window.addEventListener('pagehide', () => {
            observer.disconnect();
            for (const url of localUrls) URL.revokeObjectURL(url);
            localUrls.clear();
          }, { once: true });

          await Promise.all([probeCloud(), probeLocal()]);
          syncCompiler();
        };
        window.setTimeout(() => void start(), 420);
      })();
    </script>
  `;
}
