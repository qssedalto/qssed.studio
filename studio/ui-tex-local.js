export function enhanceTexWorkbenchLocal(markup, zh) {
  const copy = zh ? {
    localReady: "本机 TeX 已连接",
    localUnsupported: "本机不支持当前引擎",
    localDetail: "",
    localUnsupportedDetail: "本机 Bridge 当前只开放 XeLaTeX 与 pdfLaTeX。可切换引擎，或在云端编译服务可用时继续使用其他引擎。",
    cloudReady: "云端编译服务已连接",
    offline: "编译服务尚未连接",
    offlineDetail: "未检测到本机 TeX Bridge，云端编译服务也不可用。仍可编辑、自动保存和下载源码。",
    localCompiling: "正在本机编译…",
    localSuccess: "本机编译成功",
    localFailed: "本机编译失败",
    localOpen: "打开本机 PDF",
    localRun: "本机",
    compile: "编译 PDF",
    previewTitle: "PDF 实时预览",
    previewToggle: "自动预览",
    previewWaiting: "等待修改",
    previewCompiling: "正在刷新预览…",
    previewUpdated: "预览已更新",
    previewPaused: "自动预览已暂停",
    previewUnavailable: "当前引擎暂不能本机预览",
    previewError: "当前源码编译失败，已保留上一版 PDF",
    previewOpen: "在新窗口打开",
    previewNever: "尚未生成预览",
    mobileNoPdf: "暂无 PDF。需要编译时可使用下方的远程编译功能。",
    mobileSelect: "请选择一个项目文件以查看 PDF。"
  } : {
    localReady: "Local TeX connected",
    localUnsupported: "Current engine is not enabled locally",
    localDetail: "",
    localUnsupportedDetail: "The local Bridge currently enables XeLaTeX and pdfLaTeX only. Switch engines or use the cloud compiler when another engine is required.",
    cloudReady: "Cloud compiler connected",
    offline: "Compiler not connected",
    offlineDetail: "Neither the local TeX Bridge nor the cloud compiler is available. Editing, autosave, and source download still work.",
    localCompiling: "Compiling locally…",
    localSuccess: "Local compilation succeeded",
    localFailed: "Local compilation failed",
    localOpen: "Open local PDF",
    localRun: "Local",
    compile: "Compile PDF",
    previewTitle: "Live PDF Preview",
    previewToggle: "Auto preview",
    previewWaiting: "Waiting for changes",
    previewCompiling: "Refreshing preview…",
    previewUpdated: "Preview updated",
    previewPaused: "Auto preview paused",
    previewUnavailable: "The current engine cannot be previewed locally",
    previewError: "The current source failed to compile; the last good PDF is still shown",
    previewOpen: "Open in new window",
    previewNever: "No preview generated yet",
    mobileNoPdf: "No PDF yet. Use the remote compilation option below when needed.",
    mobileSelect: "Select a project file to view its PDF."
  };

  const previewPanel = `
    <section class="tex-live-preview-card" id="tex-live-preview-card">
      <div class="tex-live-preview-head">
        <strong>${copy.previewTitle}</strong>
        <label class="tex-live-preview-toggle"><input id="tex-live-preview-toggle" type="checkbox" checked><span>${copy.previewToggle}</span></label>
      </div>
      <div class="tex-live-preview-status"><span id="tex-live-preview-dot"></span><strong id="tex-live-preview-status">${copy.previewNever}</strong></div>
      <div class="tex-live-preview-viewport">
        <div class="tex-live-preview-placeholder" id="tex-live-preview-placeholder" aria-hidden="true"></div>
        <iframe id="tex-live-preview-frame" title="${copy.previewTitle}" hidden></iframe>
      </div>
      <div class="tex-live-preview-foot"><a id="tex-live-preview-open" href="#" target="_blank" rel="noopener" hidden>${copy.previewOpen} ↗</a></div>
    </section>`;

  const enhancedMarkup = String(markup || "").replace(
    '<aside class="tex-runs-panel">',
    '<aside class="tex-runs-panel">' + previewPanel
  );

  return enhancedMarkup + `
    <style>
      .tex-live-preview-card{display:grid;gap:8px;margin:9px;padding:10px;border-radius:13px;background:var(--surface);box-shadow:inset 0 0 0 1px var(--border)}
      .tex-live-preview-head,.tex-live-preview-foot,.tex-live-preview-status{display:flex;align-items:center;justify-content:space-between;gap:8px}.tex-live-preview-head>strong{font-size:10px}.tex-live-preview-toggle{display:flex;align-items:center;gap:5px;color:var(--muted);font-size:8px;cursor:pointer}.tex-live-preview-toggle input{width:13px;height:13px;margin:0;accent-color:var(--primary)}.tex-live-preview-toggle input:disabled+span{opacity:.45}.tex-live-preview-status{justify-content:flex-start;color:var(--muted);font-size:8px}.tex-live-preview-status>span{width:6px;height:6px;border-radius:50%;background:var(--quiet)}.tex-live-preview-status.is-ready>span{background:var(--primary)}.tex-live-preview-status.is-busy>span{background:var(--primary);animation:texLivePulse 1s ease-in-out infinite}.tex-live-preview-status.is-error{color:var(--danger)}.tex-live-preview-status.is-error>span{background:var(--danger)}
      .tex-live-preview-viewport{position:relative;height:330px;overflow:hidden;border-radius:10px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--hairline)}.tex-live-preview-frame{display:block;width:100%;height:100%;border:0;background:white}.tex-live-preview-frame[hidden]{display:none}.tex-live-preview-placeholder{display:grid;place-items:center;height:100%;padding:24px;color:var(--muted);font-size:9px;line-height:1.5;text-align:center}.tex-live-preview-placeholder[hidden]{display:none}.tex-live-preview-foot{align-items:flex-start;color:var(--quiet);font-size:7px;line-height:1.4}.tex-live-preview-foot span{max-width:190px}.tex-live-preview-foot a{flex:0 0 auto;color:var(--primary);text-decoration:none;white-space:nowrap}.tex-live-preview-card.is-unavailable{opacity:.72}.tex-runs-panel .tex-run-list{flex:1;min-height:110px}
      @keyframes texLivePulse{0%,100%{opacity:.35}50%{opacity:1}}
      @media(min-width:1081px){.tex-shell{grid-template-columns:230px minmax(420px,1fr) minmax(350px,.82fr)}}
      @media(max-width:1080px){.tex-live-preview-viewport{height:420px}.tex-live-preview-foot span{max-width:none}}
      @media(max-width:760px){.tex-live-preview-viewport{height:360px}}
    </style>
    <script>
      (() => {
        const localCopy = ${JSON.stringify(copy)};
        const endpoints = ["http://127.0.0.1:32145", "http://localhost:32145"];
        const expectedService = "qsseda-local-bridge";
        const expectedProtocol = 1;
        const localUrls = new Set();
        let localBase = "";
        let localEngines = [];
        let bridgeDetected = false;
        let cloudAvailable = false;
        let probesReady = false;
        const mobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '') ||
          (navigator.platform === 'MacIntel' && Number(navigator.maxTouchPoints) > 1);
        let localBusy = false;
        let previewEnabled = true;
        let previewDirty = false;
        let previewPending = false;
        // Initial page-load preview is a background warm-up, not an explicit
        // build result. Do not paint a scary red failure badge on every reload.
        // Subsequent previews caused by an actual edit DO report their result.
        let previewUserEdited = false;
        let previewTimer = 0;
        let lastEditorInputAt = 0;
        let previewUrl = "";
        let lastPreviewSnapshot = "";
        let destroyed = false;

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
          const previewCard = document.getElementById('tex-live-preview-card');
          const previewToggle = document.getElementById('tex-live-preview-toggle');
          const previewStatus = document.getElementById('tex-live-preview-status');
          const previewStatusRow = previewStatus?.closest('.tex-live-preview-status');
          const previewFrame = document.getElementById('tex-live-preview-frame');
          const previewPlaceholder = document.getElementById('tex-live-preview-placeholder');
          const previewOpen = document.getElementById('tex-live-preview-open');
          if (!compile || !editor || !engine || !source || !previewToggle || !previewFrame) return;

          try {
            previewEnabled = window.localStorage.getItem('qsseda.tex.live-preview') !== 'off';
          } catch {
            previewEnabled = true;
          }
          previewToggle.checked = previewEnabled;

          function showMessage(text, error = false) {
            if (!message) return;
            message.hidden = !text;
            message.textContent = text || '';
            message.classList.toggle('is-error', Boolean(error));
          }

          function setPreviewStatus(kind, text) {
            if (!previewStatus || !previewStatusRow) return;
            previewStatus.textContent = text || '';
            previewStatusRow.classList.toggle('is-ready', kind === 'ready');
            previewStatusRow.classList.toggle('is-busy', kind === 'busy');
            previewStatusRow.classList.toggle('is-error', kind === 'error');
          }

          async function loopbackFetch(base, path, options = {}) {
            const controller = new AbortController();
            const timer = window.setTimeout(() => controller.abort(), options.method === 'POST' ? 110000 : 1800);
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

          function currentPreviewSnapshot() {
            return JSON.stringify([String(engine.value || '').toLowerCase(), source.value || '']);
          }

          function setCompilerSurface(kind) {
            const pillText = pill?.querySelector('span');
            const stateText = state?.querySelector('strong');
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
              description = ${JSON.stringify(zh ? "当前引擎将使用已配置的 AERTEX 云端 TeX 编译服务。" : "The current engine will use the configured AERTEX cloud TeX compiler service.")};
            }
            if (pillText) pillText.textContent = label;
            if (stateText) stateText.textContent = label;
            if (detail) {
              detail.textContent = description;
              detail.hidden = !description;
            }
          }

          function syncPreviewAvailability() {
            const selected = hasDocument();
            if (mobileDevice) {
              previewToggle.disabled = true;
              previewCard?.classList.add('is-tex-mobile-preview');
              if (!previewFrame.hidden) setPreviewStatus('ready', localCopy.previewUpdated);
              else setPreviewStatus('idle', selected ? localCopy.mobileNoPdf : localCopy.mobileSelect);
              return;
            }
            const supported = selected && supportsCurrentEngine();
            previewToggle.disabled = !supported;
            previewCard?.classList.toggle('is-unavailable', !supported);
            // No selected document is not an unsupported LaTeX engine.
            // Show a truthful neutral state even when Bridge is connected.
            if (!selected) {
              setPreviewStatus('idle', localCopy.previewNever);
            } else if (!previewEnabled) {
              setPreviewStatus('idle', localCopy.previewPaused);
            } else if (!supported && !localBusy) {
              setPreviewStatus('idle', localCopy.previewUnavailable);
            } else if (supported && !previewUrl && !previewDirty && !localBusy) {
              setPreviewStatus('idle', localCopy.previewWaiting);
            }
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
            syncPreviewAvailability();
            if (probesReady) {
              const result = {
                localDetected: Boolean(bridgeDetected || localBase),
                localEngineReady: Boolean(localBase),
                localSupported,
                cloudAvailable,
                selectedEngine: String(engine.value || '').toLowerCase()
              };
              window.__aertexTexCompilerProbe = result;
              window.dispatchEvent(new CustomEvent('qsseda:tex-compiler-probed', { detail: result }));
            }
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
            bridgeDetected = false;
            for (const base of endpoints) {
              try {
                const health = await readJson(await loopbackFetch(base, '/health'));
                if (health?.service !== expectedService || Number(health?.protocol) !== expectedProtocol) continue;
                if (!Array.isArray(health?.capabilities) || !health.capabilities.includes('tex.compile')) continue;
                // /health proves Bridge is running even when XeLaTeX is not
                // installed. Do not confuse "no TeX engine" with "no service".
                bridgeDetected = true;
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

          function installPreviewBlob(blob, snapshot, elapsed) {
            if (snapshot !== currentPreviewSnapshot()) return false;
            const nextUrl = URL.createObjectURL(blob);
            localUrls.add(nextUrl);
            if (previewUrl) {
              URL.revokeObjectURL(previewUrl);
              localUrls.delete(previewUrl);
            }
            previewUrl = nextUrl;
            lastPreviewSnapshot = snapshot;
            previewDirty = false;
            previewFrame.src = nextUrl + '#view=FitH';
            previewFrame.hidden = false;
            if (previewPlaceholder) previewPlaceholder.hidden = true;
            if (previewOpen) {
              previewOpen.href = nextUrl;
              previewOpen.hidden = false;
            }
            const stamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setPreviewStatus('ready', localCopy.previewUpdated + ' · ' + stamp + ' · ' + Math.round(elapsed) + ' ms');
            return true;
          }

          const compileAssetExtensions = /\.(?:tex|sty|cls|bib|bst|bbx|cbx|def|dtx|ins|ltx|tikz|pgf|txt|csv|tsv|cfg|png|jpe?g|pdf|eps|ttf|otf)$/i;
          const projectAssetCache = new Map();
          function normalizedProjectAssets(record) {
            if (!record || !Array.isArray(record.files)) throw new Error('Project files are unavailable.');
            return record.files
              .filter(asset => asset && typeof asset.name === 'string' && compileAssetExtensions.test(asset.name) && !['main.tex', 'main.pdf'].includes(asset.name.toLowerCase()))
              .map(asset => ({ name: asset.name, encoding: asset.encoding, content: asset.content }));
          }
          async function loadProjectAssets(id = String(root.dataset.texCollaborationDocumentId || '')) {
            if (!id) return [];
            const existing = window.__aertexFileGetContext?.()?.document;
            if (existing?.id === id && Array.isArray(existing.files)) return normalizedProjectAssets(existing);
            const cached = projectAssetCache.get(id);
            if (cached && Date.now() - cached.at < 6000) return cached.files;
            const response = await fetch('/api/tex/documents?id=' + encodeURIComponent(id), {
              credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' }
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok || payload?.document?.id !== id)
              throw new Error(payload?.error || 'Unable to load TeX project dependencies.');
            const files = normalizedProjectAssets(payload.document);
            projectAssetCache.set(id, { files, at: Date.now() });
            return files;
          }
          window.__aertexLoadTexCompileFiles = loadProjectAssets;
          window.addEventListener('aertex:tex-file-updated', (event) => {
            projectAssetCache.clear();
            // File-list hydration and remote sync can emit this signal during
            // page startup. Only explicit user-originated edits may set the
            // header's compilation status; boot refresh stays visually neutral.
            if (event?.detail?.userInitiated === true) previewUserEdited = true;
            if (previewEnabled) markPreviewDirty(250);
          });
          window.addEventListener('aertex:tex-project-asset-selected', () => projectAssetCache.clear());

          async function requestLocalPdf(engineName, sourceText) {
            const started = performance.now();
            const documentId = String(root.dataset.texCollaborationDocumentId || '');
            const files = await loadProjectAssets(documentId);
            if (files.length) {
              const health = await readJson(await loopbackFetch(localBase, '/health'));
              if (!Array.isArray(health?.capabilities) || !health.capabilities.includes('tex.project-files')) {
                throw new Error("当前 AERTEX Bridge 版本不支持多文件 TeX 工程。请从 https://qsseda.com/api/work/bridge/windows 安装新版 Bridge 后重试。");
              }
            }
            const response = await loopbackFetch(localBase, '/tex/compile', {
              method: 'POST',
              accept: 'application/pdf, application/json',
              body: JSON.stringify({ engine: engineName, source: sourceText, title: title?.value || '', files })
            });
            if (!response.ok) {
              const payload = await response.json().catch(() => ({}));
              const error = new Error(payload?.error || localCopy.localFailed);
              error.payload = payload;
              throw error;
            }
            const type = String(response.headers.get('content-type') || '').toLowerCase();
            if (!type.includes('application/pdf')) throw new Error(localCopy.localFailed);
            return { blob: await response.blob(), elapsed: performance.now() - started };
          }

          async function compileLocal(previewOnly = false) {
            if (!supportsCurrentEngine() || localBusy || !hasDocument()) {
              if (previewOnly && localBusy) previewPending = true;
              return;
            }
            localBusy = true;
            previewPending = false;
            const engineName = String(engine.value || '').toLowerCase();
            const sourceText = source.value || '';
            const snapshot = currentPreviewSnapshot();
            const compilingDocumentId = String(root.dataset.texCollaborationDocumentId || '');
            const showTitleBuildResult = !previewOnly || previewUserEdited;
            if (showTitleBuildResult) {
              window.dispatchEvent(new CustomEvent('aertex:tex-build-started', {
                detail: { documentId: compilingDocumentId, engine: engineName, automatic: previewOnly }
              }));
            }
            if (previewOnly) {
              previewDirty = false;
              setPreviewStatus('busy', localCopy.previewCompiling);
            } else {
              compile.disabled = true;
              compile.textContent = localCopy.localCompiling;
              showMessage('');
            }
            try {
              const result = await requestLocalPdf(engineName, sourceText);
              const stale = snapshot !== currentPreviewSnapshot();
              if (!stale) {
                installPreviewBlob(result.blob, snapshot, result.elapsed);
                if (showTitleBuildResult) {
                  window.dispatchEvent(new CustomEvent('aertex:tex-build-result', {
                    detail: { documentId: compilingDocumentId, engine: engineName, ok: true, automatic: previewOnly }
                  }));
                }
              } else {
                previewDirty = true;
                previewPending = true;
                setPreviewStatus('idle', localCopy.previewWaiting);
              }
              if (!previewOnly) {
                const historyUrl = URL.createObjectURL(result.blob);
                localUrls.add(historyUrl);
                addLocalRun({ ok: true, url: historyUrl, engineName, elapsed: result.elapsed });
                showMessage(localCopy.localSuccess);
              }
            } catch (error) {
              const diagnostic = String(error?.payload?.log || '').trim().split(/\\r?\\n/).filter(Boolean).slice(-2).join(' · ');
              const display = String(error?.message || localCopy.localFailed) + (diagnostic ? ' · ' + diagnostic.slice(0, 420) : '');
              if (showTitleBuildResult && snapshot === currentPreviewSnapshot()) {
                window.dispatchEvent(new CustomEvent('aertex:tex-build-result', {
                  detail: {
                    documentId: compilingDocumentId,
                    engine: engineName,
                    ok: false,
                    automatic: previewOnly,
                    // Full bounded compiler output stays in browser memory until
                    // the user explicitly downloads the log as a local file.
                    log: [String(error?.message || localCopy.localFailed), String(error?.payload?.log || '')].filter(Boolean).join('\\n\\n')
                  }
                }));
              }
              if (previewOnly) {
                if (snapshot === currentPreviewSnapshot()) {
                  setPreviewStatus('error', display);
                  if (message && !previewUrl) showMessage(display, true);
                }
                else {
                  previewDirty = true;
                  previewPending = true;
                }
              } else {
                addLocalRun({ ok: false, engineName, error: display });
                showMessage(display, true);
              }
              console.warn('Local TeX compile failed', error?.payload?.log || error);
            } finally {
              localBusy = false;
              if (!previewOnly) compile.textContent = localCopy.compile;
              syncCompiler();
              // Always signal completion even after a stale compile that
              // intentionally cannot emit a success/error result.
              window.dispatchEvent(new CustomEvent('aertex:tex-build-finished', {
                detail: { documentId: compilingDocumentId, engine: engineName, automatic: previewOnly }
              }));
              if ((previewPending || previewDirty) && previewEnabled && supportsCurrentEngine()) {
                // Never start another preview until the last edit has settled.
                schedulePreview(Math.max(180, 1500 - (Date.now() - lastEditorInputAt)));
              }
            }
          }

          function schedulePreview(delay = 1500) {
            window.clearTimeout(previewTimer);
            if (!previewEnabled || !supportsCurrentEngine() || !hasDocument()) return;
            previewDirty = true;
            if (!localBusy) setPreviewStatus('idle', localCopy.previewWaiting);
            previewTimer = window.setTimeout(() => {
              if (destroyed || !previewEnabled || !previewDirty) return;
              // No polling or compilation during continuous typing.
              if (localBusy) {
                previewPending = true;
                return;
              }
              if (currentPreviewSnapshot() !== lastPreviewSnapshot) void compileLocal(true);
              else previewDirty = false;
            }, delay);
          }

          function markPreviewDirty(delay = 1500) {
            lastEditorInputAt = Date.now();
            schedulePreview(delay);
          }

          root.addEventListener('click', event => {
            if (event.target?.closest?.('#tex-compile') !== compile) return;
            if (!supportsCurrentEngine()) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            void compileLocal(false);
          }, true);

          root.addEventListener('click', event => {
            if (!event.target?.closest?.('.tex-document-item, #tex-create')) return;
            window.setTimeout(() => {
              if (hasDocument()) markPreviewDirty(500);
            }, 420);
          });

          source.addEventListener('input', () => {
            previewUserEdited = true;
            markPreviewDirty(1500);
          });
          engine.addEventListener('change', () => {
            previewUserEdited = true;
            window.setTimeout(() => {
              syncCompiler();
              markPreviewDirty(260);
            }, 0);
          });
          previewToggle.addEventListener('change', () => {
            previewEnabled = previewToggle.checked;
            try {
              window.localStorage.setItem('qsseda.tex.live-preview', previewEnabled ? 'on' : 'off');
            } catch {}
            if (!previewEnabled) {
              window.clearTimeout(previewTimer);
              setPreviewStatus('idle', localCopy.previewPaused);
              return;
            }
            markPreviewDirty(180);
          });

          const observer = new MutationObserver(() => syncCompiler());
          observer.observe(editor, { attributes: true, attributeFilter: ['hidden'] });
          observer.observe(compile, { attributes: true, attributeFilter: ['disabled'] });

          // Connection-check UI can restore local compiler access after the
          // browser's local-network permission prompt. Refresh adapter state
          // without navigating away from the active document or losing edits.
          let recheckPromise = null;
          const refreshCompilerInPlace = (event) => {
            if (destroyed) return;
            // Connection-check UI already verified /health and /tex/status.
            // Accept only a known loopback endpoint and the supported engines;
            // the local adapter should not immediately erase this valid result
            // by issuing a second, potentially permission-blocked probe.
            const host = String(event?.detail?.host || '');
            const base = endpoints.find(endpoint => endpoint.replace(/^https?:\\/\\//, '') === host);
            const engines = Array.isArray(event?.detail?.engines)
              ? event.detail.engines.map(value => String(value).toLowerCase())
                .filter(value => value === 'xelatex' || value === 'pdflatex')
              : [];
            if (base && engines.length) {
              localBase = base;
              localEngines = engines;
              bridgeDetected = true;
              syncCompiler();
              if (previewEnabled && supportsCurrentEngine() && hasDocument()) schedulePreview(240);
              return;
            }
            if (recheckPromise) return;
            recheckPromise = Promise.all([probeCloud(), probeLocal()])
              .then(() => {
                if (destroyed) return;
                syncCompiler();
                if (previewEnabled && supportsCurrentEngine() && hasDocument()) {
                  schedulePreview(240);
                }
              })
              .catch(() => {})
              .finally(() => { recheckPromise = null; });
          };
          window.addEventListener('qsseda:tex-local-recheck', refreshCompilerInPlace);

          window.addEventListener('pagehide', () => {
            window.removeEventListener('qsseda:tex-local-recheck', refreshCompilerInPlace);
            destroyed = true;
            observer.disconnect();
            window.clearTimeout(previewTimer);
            for (const url of localUrls) URL.revokeObjectURL(url);
            localUrls.clear();
          }, { once: true });

          await Promise.all([probeCloud(), mobileDevice ? Promise.resolve() : probeLocal()]);
          probesReady = true;
          syncCompiler();
          if (previewEnabled && supportsCurrentEngine() && hasDocument()) schedulePreview(450);
        };
        window.setTimeout(() => void start(), 420);
      })();
    </script>
  `;
}
