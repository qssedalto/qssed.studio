export function enhanceWorkTexVersionHistory(markup, zh) {
  let output = String(markup || "");
  const copy = zh ? {
    history: "版本历史",
    empty: "还没有历史版本",
    current: "当前版本",
    compile: "编译版本",
    created: "初始版本",
    autosave: "自动版本",
    manual: "手动版本",
    restore: "已恢复版本",
    beforeRestore: "恢复前保护",
    downloadPdf: "编译并下载 PDF",
    downloadTex: "下载 .tex",
    restoreVersion: "恢复此版本",
    restoreConfirm: "恢复这个历史版本？当前版本会先自动保存到历史记录，因此之后仍可恢复回来。",
    restored: "已恢复历史版本",
    loading: "正在读取云端版本…",
    error: "版本历史暂时不可用",
    localMissing: "本机 TeX 编译器未连接，无法生成这个历史版本的 PDF。",
    compiling: "正在本机生成 PDF…",
    versionSaved: "已保存编译版本",
    versionSaveFailed: "历史版本保存失败，本次仍会在本机编译。",
  } : {
    history: "Version History",
    empty: "No saved versions yet",
    current: "Current",
    compile: "Compiled",
    created: "Initial",
    autosave: "Auto version",
    manual: "Manual",
    restore: "Restored",
    beforeRestore: "Before restore",
    downloadPdf: "Compile & download PDF",
    downloadTex: "Download .tex",
    restoreVersion: "Restore this version",
    restoreConfirm: "Restore this version? The current state will be protected in history first, so you can return to it later.",
    restored: "Historical version restored",
    loading: "Loading cloud versions…",
    error: "Version history is temporarily unavailable",
    localMissing: "The local TeX compiler is not connected, so this historical PDF cannot be generated.",
    compiling: "Generating PDF locally…",
    versionSaved: "Compile version saved",
    versionSaveFailed: "Could not save the history version. Local compilation will continue.",
  };

  output = output.replaceAll("编译历史", copy.history).replaceAll("Compile History", copy.history);
  output = output.replaceAll("还没有编译记录", copy.empty).replaceAll("No compile runs yet", copy.empty);

  output += `
    <style id="qsseda-work-tex-version-history">
      .tex-run-list.is-version-history>.tex-run-item:not([data-tex-version-item]){display:none!important}
      .tex-version-policy{margin:0 8px 8px;padding:8px 9px;border-radius:10px;background:color-mix(in srgb,var(--primary) 5%,var(--surface));color:var(--quiet);font-size:8px;line-height:1.5}
      .tex-version-loading{display:flex;align-items:center;gap:7px;margin:2px 8px 8px;padding:9px 10px;border-radius:10px;background:var(--surface);color:var(--muted);font-size:9px}
      .tex-version-loading i{width:7px;height:7px;border-radius:999px;background:var(--primary);animation:texLivePulse 1s ease-in-out infinite}
      .tex-version-item{position:relative!important;display:grid!important;gap:7px!important;margin:0!important;padding:10px 10px 10px 18px!important;border-radius:12px!important;background:transparent!important;box-shadow:none!important}
      .tex-version-item:before{content:"";position:absolute;left:8px;top:17px;width:5px;height:5px;border-radius:50%;background:var(--quiet);box-shadow:0 0 0 3px var(--fill)}
      .tex-version-item:after{content:"";position:absolute;left:10px;top:24px;bottom:-7px;width:1px;background:var(--hairline)}
      .tex-version-item:last-child:after{display:none}
      .tex-version-item.is-current{background:var(--surface)!important}.tex-version-item.is-current:before{background:var(--primary)}
      .tex-version-top{display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:0}.tex-version-top strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px}
      .tex-version-badge{flex:0 0 auto;padding:4px 6px;border-radius:999px;background:var(--fill);color:var(--muted);font-size:7px;font-weight:750;white-space:nowrap}.tex-version-item.is-current .tex-version-badge{background:color-mix(in srgb,var(--primary) 10%,var(--fill));color:var(--primary)}
      .tex-version-preview{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;margin:0;color:var(--muted);font-size:8px;line-height:1.45}
      .tex-version-meta{display:flex;align-items:center;justify-content:space-between;gap:7px;color:var(--quiet);font-size:7.5px}.tex-version-meta span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .tex-version-actions{display:flex;flex-wrap:wrap;gap:5px;margin-top:1px}.tex-version-action{appearance:none!important;min-height:28px!important;margin:0!important;padding:0 8px!important;border:0!important;border-radius:8px!important;background:var(--fill)!important;color:var(--text)!important;box-shadow:inset 0 0 0 1px var(--border)!important;font-size:7.5px!important;font-weight:700!important;cursor:pointer!important}.tex-version-action:hover{background:var(--card)!important}.tex-version-action.is-primary{color:var(--primary)!important}.tex-version-action:disabled{opacity:.45!important;cursor:wait!important}
      @media(max-width:1080px){.tex-version-actions{gap:7px}.tex-version-action{min-height:34px!important;font-size:9px!important}}
    </style>
    <script id="qsseda-work-tex-version-history-runtime">
      (() => {
        if (window.__qssedaTexVersionHistoryReady) return;
        window.__qssedaTexVersionHistoryReady = true;
        const labels = ${JSON.stringify(copy)};
        const endpoints = ['http://127.0.0.1:32145', 'http://localhost:32145'];
        let loadSequence = 0;
        let rendering = false;
        let scheduled = 0;
        let compilePass = false;
        let shownDocumentId = '';
        let lastVersionFingerprint = '';
        let lastFetchedId = '';

        const inheritedFetch = window.fetch.bind(window);
        window.fetch = async function qssedaVersionAwareFetch(input, init) {
          let parsed = null;
          try { parsed = new URL(input instanceof Request ? input.url : String(input || ''), location.href); } catch {}
          const method = String(init?.method || (input instanceof Request ? input.method : 'GET') || 'GET').toUpperCase();
          if (parsed && parsed.origin === location.origin && parsed.pathname === '/api/tex/runs' && method === 'GET') {
            return new Response(JSON.stringify({ runs: [], count: 0, scope: 'version-history' }), { status: 200, headers: { 'Content-Type': 'application/json;charset=UTF-8', 'Cache-Control': 'no-store' } });
          }
          return inheritedFetch(input, init);
        };

        const activeDocumentId = () => {
          const root = document.querySelector('.tex-work-app[data-tex-root]');
          const stored = String(root?.dataset?.texCollaborationDocumentId || '').trim();
          if (stored) return stored;
          return String(document.querySelector('.tex-document-item.is-active')?.dataset?.texDocumentId || '').trim();
        };

        const api = async (path, options = {}) => {
          const response = await inheritedFetch(path, {
            ...options,
            credentials: 'same-origin',
            cache: 'no-store',
            headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json;charset=UTF-8' } : {}), ...(options.headers || {}) }
          });
          const payload = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(payload?.error || labels.error);
          return payload;
        };

        const showMessage = (text, error = false) => {
          const node = document.getElementById('tex-message');
          if (!node) return;
          node.hidden = !text;
          node.textContent = text || '';
          node.classList.toggle('is-error', Boolean(error));
        };

        const formatVersionTime = value => {
          const date = new Date(value || 0);
          if (!Number.isFinite(date.getTime())) return '';
          const now = new Date();
          const sameDay = date.toDateString() === now.toDateString();
          return sameDay
            ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        };

        const reasonLabel = version => {
          if (version?.is_current) return labels.current;
          const reason = String(version?.reason || 'manual');
          if (reason === 'compile') return labels.compile;
          if (reason === 'created') return labels.created;
          if (reason === 'autosave' || reason === 'current') return labels.autosave;
          if (reason === 'restore') return labels.restore;
          if (reason === 'before_restore') return labels.beforeRestore;
          return labels.manual;
        };

        const safeName = value => String(value || 'qsseda-tex').replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'qsseda-tex';
        const downloadBlob = (blob, filename) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.append(link);
          link.click();
          link.remove();
          window.setTimeout(() => URL.revokeObjectURL(url), 12000);
        };

        // Preserve the generated PDF in the primary preview even when the
        // independent PDF.js controller is temporarily unavailable.
        let compiledPreviewUrl = '';
        function showCompiledPreview(blob) {
          if (window.__aertexOpenCompiledPdf?.(blob)) return;
          const frame = document.getElementById('tex-live-preview-frame');
          if (!frame) return;
          if (compiledPreviewUrl) URL.revokeObjectURL(compiledPreviewUrl);
          compiledPreviewUrl = URL.createObjectURL(blob);
          frame.src = compiledPreviewUrl + '#zoom=page-width';
          frame.hidden = false;
          const placeholder = document.getElementById('tex-live-preview-placeholder');
          if (placeholder) placeholder.hidden = true;
          const open = document.getElementById('tex-live-preview-open');
          if (open) { open.href = compiledPreviewUrl; open.hidden = false; }
        }
        window.addEventListener('pagehide', () => {
          if (compiledPreviewUrl) URL.revokeObjectURL(compiledPreviewUrl);
        }, { once: true });

        async function getVersion(documentId, versionId) {
          const data = await api('/api/tex/versions?document=' + encodeURIComponent(documentId) + '&version=' + encodeURIComponent(versionId));
          return data.version;
        }

        async function loopbackFetch(base, path, options = {}) {
          const controller = new AbortController();
          const timer = window.setTimeout(() => controller.abort(), options.method === 'POST' ? 110000 : 1800);
          try {
            const request = new Request(base + path, {
              method: options.method || 'GET', mode: 'cors', cache: 'no-store', credentials: 'omit',
              headers: { Accept: options.accept || 'application/json', ...(options.body ? { 'Content-Type': 'application/json;charset=UTF-8' } : {}) },
              body: options.body, signal: controller.signal, targetAddressSpace: 'loopback'
            });
            return await fetch(request);
          } finally { window.clearTimeout(timer); }
        }

        async function compileVersionPdf(version) {
          const projectFiles = window.__aertexLoadTexCompileFiles;
          if (typeof projectFiles !== 'function')
            throw new Error("TeX 工程文件尚未加载，请刷新页面后重试。");
          const files = await projectFiles(version.document_id);
          let lastError = null;
          for (const base of endpoints) {
            try {
              const healthResponse = await loopbackFetch(base, '/health');
              const health = await healthResponse.json().catch(() => ({}));
              if (!healthResponse.ok || health?.service !== 'qsseda-local-bridge') continue;
              if (files.length && !health?.capabilities?.includes('tex.project-files')) {
                throw new Error("本机 Bridge 版本过旧，无法编译包含子文件的 TeX 工程。请从 https://qsseda.com/api/work/bridge/windows 安装新版 Bridge。");
              }
              const response = await loopbackFetch(base, '/tex/compile', {
                method: 'POST', accept: 'application/pdf, application/json',
                body: JSON.stringify({ engine: version.engine, source: version.source, title: version.title, files })
              });
              if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload?.error || labels.localMissing);
              }
              const type = String(response.headers.get('content-type') || '').toLowerCase();
              if (!type.includes('application/pdf')) throw new Error(labels.localMissing);
              return response.blob();
            } catch (error) { lastError = error; }
          }
          throw lastError || new Error(labels.localMissing);
        }

        function actionButton(text, className, handler) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'tex-version-action' + (className ? ' ' + className : '');
          button.textContent = text;
          button.addEventListener('click', async () => {
            if (button.disabled) return;
            button.disabled = true;
            const original = button.textContent;
            try { await handler(button); }
            catch (error) { showMessage(error?.message || labels.error, true); }
            finally { button.disabled = false; button.textContent = original; }
          });
          return button;
        }

        function renderVersions(versions) {
          const list = document.getElementById('tex-run-list');
          const empty = document.getElementById('tex-runs-empty');
          if (!list || !empty) return;
          const currentId = activeDocumentId();
          const fingerprint = JSON.stringify((versions || []).map(v =>
            [v.id,v.is_current,v.created_at,v.source_chars,v.title]));
          const foreignRows = Array.from(list.children).some(node =>
            !node.matches?.('[data-tex-version-item]'));
          if (shownDocumentId === currentId && lastVersionFingerprint === fingerprint && !foreignRows) return;
          shownDocumentId = currentId;
          lastVersionFingerprint = fingerprint;
          rendering = true;
          list.classList.add('is-version-history');
          list.replaceChildren();
          empty.hidden = Array.isArray(versions) && versions.length > 0;
          if (!Array.isArray(versions) || !versions.length) {
            rendering = false;
            return;
          }

          for (const version of versions) {
            const item = document.createElement('article');
            item.className = 'tex-run-item tex-version-item' + (version.is_current ? ' is-current' : '');
            item.dataset.texVersionItem = '1';
            item.dataset.versionId = version.id;

            const top = document.createElement('div');
            top.className = 'tex-version-top';
            const title = document.createElement('strong');
            title.textContent = version.title || 'TeX';
            const badge = document.createElement('span');
            badge.className = 'tex-version-badge';
            badge.textContent = reasonLabel(version);
            top.append(title, badge);

            const preview = document.createElement('p');
            preview.className = 'tex-version-preview';
            preview.textContent = version.preview || ' ';

            const meta = document.createElement('div');
            meta.className = 'tex-version-meta';
            const left = document.createElement('span');
            left.textContent = (version.engine || 'xelatex') + ' · ' + Number(version.source_chars || 0).toLocaleString() + ' chars';
            const time = document.createElement('time');
            time.textContent = formatVersionTime(version.created_at);
            meta.append(left, time);

            const actions = document.createElement('div');
            actions.className = 'tex-version-actions';
            actions.append(actionButton(labels.downloadPdf, 'is-primary', async button => {
              button.textContent = labels.compiling;
              const full = await getVersion(version.document_id, version.id);
              const pdf = await compileVersionPdf(full);
              showCompiledPreview(pdf);
              downloadBlob(pdf, safeName(full.title) + '.pdf');
            }));
            actions.append(actionButton(labels.downloadTex, '', async () => {
              const full = await getVersion(version.document_id, version.id);
              downloadBlob(new Blob([full.source || ''], { type: 'application/x-tex;charset=UTF-8' }), safeName(full.title) + '.tex');
            }));
            if (!version.is_current) {
              actions.append(actionButton(labels.restoreVersion, '', async () => {
                if (!window.confirm(labels.restoreConfirm)) return;
                const data = await api('/api/tex/versions?action=restore', {
                  method: 'POST', body: JSON.stringify({ document_id: version.document_id, version_id: version.id })
                });
                const restored = data.document;
                const titleInput = document.getElementById('tex-title');
                const engineInput = document.getElementById('tex-engine');
                const sourceInput = document.getElementById('tex-source');
                if (restored && titleInput && engineInput && sourceInput) {
                  titleInput.value = restored.title || '';
                  engineInput.value = restored.engine || 'xelatex';
                  sourceInput.value = restored.source || '';
                  titleInput.dispatchEvent(new Event('input', { bubbles: true }));
                  engineInput.dispatchEvent(new Event('change', { bubbles: true }));
                  sourceInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
                showMessage(labels.restored);
                window.dispatchEvent(new CustomEvent('qsseda:tex-version-created'));
              }));
            }
            item.append(top, preview, meta, actions);
            list.append(item);
          }
          rendering = false;
        }

        async function loadVersions() {
          const list = document.getElementById('tex-run-list');
          const empty = document.getElementById('tex-runs-empty');
          if (!list || !empty) return;
          const documentId = activeDocumentId();
          const sequence = ++loadSequence;
          list.classList.add('is-version-history');
          empty.hidden = true;
          if (!documentId) { lastFetchedId=''; renderVersions([]); return; }
          // Repeated folder interactions must not erase the visible history.
          // Show the spinner only when the actual document identifier changes.
          if (lastFetchedId !== documentId) {
            lastFetchedId = documentId;
            rendering = true;
            list.innerHTML = '<div class="tex-version-loading"><i></i><span>' + labels.loading + '</span></div>';
            rendering = false;
          }
          try {
            const data = await api('/api/tex/versions?document=' + encodeURIComponent(documentId));
            if (sequence !== loadSequence || documentId !== activeDocumentId()) return;
            renderVersions(Array.isArray(data.versions) ? data.versions : []);
          } catch (error) {
            if (sequence !== loadSequence) return;
            renderVersions([]);
            showMessage(error?.message || labels.error, true);
          }
        }

        function scheduleLoad(delay = 50) {
          window.clearTimeout(scheduled);
          scheduled = window.setTimeout(() => void loadVersions(), delay);
        }

        function install() {
          const root = document.querySelector('.tex-work-app[data-tex-root]');
          const list = document.getElementById('tex-run-list');
          const empty = document.getElementById('tex-runs-empty');
          const refresh = document.getElementById('tex-refresh-runs');
          if (!root || !list || !empty || !refresh) { window.setTimeout(install, 60); return; }

          list.classList.add('is-version-history');
          empty.querySelector('strong').textContent = labels.empty;

          refresh.addEventListener('click', event => {
            event.preventDefault();
            event.stopImmediatePropagation();
            void loadVersions();
          }, true);

          const runObserver = new MutationObserver(() => {
            if (rendering) return;
            const foreign = Array.from(list.children).some(node => !node.matches?.('[data-tex-version-item], .tex-version-loading'));
            if (foreign) scheduleLoad(120);
          });
          runObserver.observe(list, { childList: true });

          const documentObserver = new MutationObserver(() => scheduleLoad(80));
          documentObserver.observe(root, { attributes: true, attributeFilter: ['data-tex-collaboration-document-id'] });
          // The file tree is not a history source. Never observe file rows or
          // folders: their hover/expand/selection classes change constantly.

          window.addEventListener('qsseda:tex-version-created', () => scheduleLoad(20));
          window.addEventListener('pagehide', () => { runObserver.disconnect(); documentObserver.disconnect(); }, { once: true });
          scheduleLoad(120);
        }

        document.addEventListener('click', event => {
          const button = event.target?.closest?.('#tex-compile');
          if (!button) return;
          if (compilePass) { compilePass = false; return; }
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          const documentId = activeDocumentId();
          const title = document.getElementById('tex-title');
          const engine = document.getElementById('tex-engine');
          const source = document.getElementById('tex-source');
          void (async () => {
            if (documentId && title && engine && source) {
              try {
                await api('/api/tex/versions?action=snapshot', {
                  method: 'POST',
                  body: JSON.stringify({ document_id: documentId, title: title.value, engine: engine.value, source: source.value, reason: 'compile' })
                });
                window.dispatchEvent(new CustomEvent('qsseda:tex-version-created'));
              } catch (error) {
                showMessage(labels.versionSaveFailed, true);
              }
            }
            compilePass = true;
            button.click();
          })();
        }, true);

        install();
      })();
    </script>`;

  return output;
}
