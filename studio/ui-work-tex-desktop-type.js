export function enhanceWorkTexDesktopTypography(markup) {
  return String(markup || "") + `
    <style id="qsseda-work-tex-desktop-type">
      @media (min-width:761px){
        .tex-work-app .tex-shell{font-size:14px}

        .tex-work-app .tex-panel-head,
        .tex-work-app .tex-runs-head{padding-top:16px!important;padding-bottom:11px!important}
        .tex-work-app .tex-panel-head strong,
        .tex-work-app .tex-runs-head strong{
          font-size:14px!important;
          line-height:1.25!important;
          letter-spacing:-.012em!important;
        }
        .tex-work-app .tex-panel-head #tex-document-count{
          min-width:22px!important;
          height:22px!important;
          padding:0 6px!important;
          font-size:10.5px!important;
        }

        .tex-work-app .tex-create-row select,
        .tex-work-app .tex-editor-toolbar select{
          font-size:12.5px!important;
        }
        .tex-work-app .tex-search input{
          font-size:12.5px!important;
        }
        .tex-work-app .tex-search svg{
          width:15px!important;
          height:15px!important;
        }

        .tex-work-app .tex-document-item{
          gap:6px!important;
          padding:11px!important;
        }
        .tex-work-app .tex-document-item strong{
          font-size:13.5px!important;
          line-height:1.3!important;
        }
        .tex-work-app .tex-document-item p{
          font-size:11px!important;
          line-height:1.48!important;
        }
        .tex-work-app .tex-document-meta{
          font-size:10px!important;
          line-height:1.35!important;
        }
        .tex-work-app .tex-empty strong{
          font-size:13px!important;
          line-height:1.35!important;
        }
        .tex-work-app .tex-empty span{
          font-size:11px!important;
          line-height:1.5!important;
        }

        .tex-work-app .tex-start-surface{
          gap:22px!important;
        }
        .tex-work-app .tex-start-surface>.tex-start-mark{
          width:58px!important;
          height:58px!important;
          border-radius:18px!important;
          font-size:14px!important;
        }
        .tex-work-app .tex-start-surface>.tex-start-copy{
          gap:8px!important;
          width:min(100%,640px)!important;
        }
        .tex-work-app .tex-start-copy strong{
          font-size:24px!important;
          line-height:1.2!important;
          letter-spacing:-.035em!important;
        }
        .tex-work-app .tex-start-copy span{
          font-size:14px!important;
          line-height:1.58!important;
        }
        .tex-work-app .tex-start-surface>.tex-start-grid{
          width:min(100%,760px)!important;
          gap:12px!important;
        }
        .tex-work-app .tex-start-card{
          min-height:108px!important;
          padding:17px 18px!important;
          border-radius:16px!important;
          gap:7px!important;
        }
        .tex-work-app .tex-start-card b{
          font-size:14px!important;
          line-height:1.3!important;
        }
        .tex-work-app .tex-start-card span{
          font-size:11.5px!important;
          line-height:1.5!important;
        }
        .tex-work-app .tex-start-features{
          gap:16px!important;
        }
        .tex-work-app .tex-start-features span{
          font-size:10.5px!important;
          line-height:1.4!important;
        }

        .tex-work-app .tex-editor-toolbar>input{
          font-size:19px!important;
        }
        .tex-work-app .tex-editor-toolbar label span{
          font-size:10px!important;
        }
        .tex-work-app .tex-source-label{
          font-size:10px!important;
        }
        .tex-work-app #tex-source{
          font-size:15.5px!important;
          line-height:1.62!important;
        }
        .tex-work-app .tex-save-state{
          font-size:10.5px!important;
        }
        .tex-work-app .tex-editor-actions button{
          font-size:11.5px!important;
        }

        .tex-work-app .tex-live-preview-head>strong{
          font-size:14px!important;
          line-height:1.3!important;
        }
        .tex-work-app .tex-live-preview-toggle{
          font-size:11.5px!important;
        }
        .tex-work-app .tex-live-preview-status{
          font-size:11.5px!important;
          line-height:1.45!important;
        }
        .tex-work-app .tex-live-preview-placeholder{
          font-size:12px!important;
          line-height:1.55!important;
        }
        .tex-work-app .tex-live-preview-foot{
          font-size:10.5px!important;
          line-height:1.45!important;
        }

        .tex-work-app .tex-compiler-state strong{
          font-size:13.5px!important;
          line-height:1.35!important;
        }
        .tex-work-app .tex-compiler-card p{
          font-size:11.5px!important;
          line-height:1.55!important;
        }
        .tex-work-app .tex-compiler-card small{
          font-size:10.5px!important;
          line-height:1.5!important;
        }
        .tex-work-app .tex-connection-check{
          min-height:34px!important;
          padding:0 13px!important;
          font-size:11px!important;
        }

        .tex-work-app .tex-run-item strong,
        .tex-work-app .tex-run-top strong{
          font-size:12.5px!important;
          line-height:1.35!important;
        }
        .tex-work-app .tex-run-status{
          font-size:10.5px!important;
        }
        .tex-work-app .tex-run-meta{
          font-size:10px!important;
          line-height:1.4!important;
        }
        .tex-work-app .tex-run-error{
          font-size:10.5px!important;
          line-height:1.5!important;
        }
        .tex-work-app .tex-run-item a{
          font-size:11.5px!important;
        }

        .tex-work-app .tex-side-toggle{
          width:30px!important;
          min-width:30px!important;
          height:30px!important;
          min-height:30px!important;
          font-size:17px!important;
        }
      }

      @media (min-width:1081px){
        .tex-work-app .tex-shell{
          grid-template-columns:260px minmax(460px,1fr) minmax(390px,.82fr)!important;
        }
        .tex-work-app .tex-shell.is-left-collapsed{
          grid-template-columns:46px minmax(460px,1fr) minmax(390px,.82fr)!important;
        }
        .tex-work-app .tex-shell.is-right-collapsed{
          grid-template-columns:260px minmax(460px,1fr) 46px!important;
        }
        .tex-work-app .tex-shell.is-left-collapsed.is-right-collapsed{
          grid-template-columns:46px minmax(0,1fr) 46px!important;
        }
      }
    </style>
    <style id="qsseda-work-tex-runtime-refinements">
      .tex-collaboration-drawer .tex-collaboration-member{align-items:center!important}
      .tex-collaboration-drawer .tex-collaboration-member-actions{
        display:grid!important;
        grid-template-columns:112px 72px!important;
        align-items:center!important;
        justify-content:end!important;
        gap:10px!important;
        min-width:194px!important;
        margin:0!important;
      }
      .tex-collaboration-drawer .tex-collaboration-member-actions select,
      .tex-collaboration-drawer .tex-collaboration-member-actions .tex-collaboration-remove{
        box-sizing:border-box!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        width:100%!important;
        min-width:0!important;
        height:44px!important;
        min-height:44px!important;
        max-height:44px!important;
        margin:0!important;
        padding-top:0!important;
        padding-bottom:0!important;
        align-self:center!important;
        line-height:1!important;
      }
      .tex-collaboration-drawer .tex-collaboration-member-actions select{
        display:block!important;
        padding-left:13px!important;
        padding-right:34px!important;
      }
      @media(max-width:760px), (max-width:950px) and (pointer:coarse){
        .tex-collaboration-drawer .tex-collaboration-member:not(.is-owner) .tex-collaboration-member-actions{
          grid-column:1/-1!important;
          grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
          width:100%!important;
          min-width:0!important;
          margin-top:2px!important;
        }
      }
    </style>
    <script id="qsseda-work-tex-runtime-performance">
      (() => {
        if (window.__qssedaTexRuntimePerformanceReady) return;
        window.__qssedaTexRuntimePerformanceReady = true;

        const nativeFetch = window.fetch.bind(window);
        const collaborationMemory = new Map();
        const collaborationMaxAge = 5 * 60 * 1000;
        const collaborationRevalidateAge = 30 * 1000;
        const previewCacheName = 'qsseda-tex-preview-v1';
        const previewPrefix = location.origin + '/__qsseda_tex_preview_cache__/';
        let restoredPreviewUrl = '';
        let restoredPreviewKey = '';
        let restoreSequence = 0;

        const isZh = String(document.documentElement.lang || '').toLowerCase().startsWith('zh');
        const restoredLabel = isZh ? '已恢复上次预览' : 'Restored previous preview';
        const loadingLabels = new Set(['正在读取协作设置…', 'Loading collaboration settings…']);

        function collaborationStorageKey(id) {
          return 'qsseda.tex.collaboration.snapshot.' + String(id || '');
        }

        function readCollaborationSnapshot(id) {
          const key = String(id || '');
          if (!key) return null;
          const memory = collaborationMemory.get(key);
          if (memory?.data) return memory;
          try {
            const parsed = JSON.parse(window.sessionStorage.getItem(collaborationStorageKey(key)) || 'null');
            if (parsed?.data && Number.isFinite(Number(parsed.ts))) {
              collaborationMemory.set(key, parsed);
              return parsed;
            }
          } catch {}
          return null;
        }

        function writeCollaborationSnapshot(id, data) {
          const key = String(id || data?.document_id || '');
          if (!key || !data || !Array.isArray(data.participants)) return;
          const entry = { ts: Date.now(), data };
          collaborationMemory.set(key, entry);
          try { window.sessionStorage.setItem(collaborationStorageKey(key), JSON.stringify(entry)); } catch {}
          window.dispatchEvent(new CustomEvent('qsseda:tex-collaboration-snapshot', { detail: data }));
        }

        function jsonResponse(data) {
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json;charset=UTF-8', 'Cache-Control': 'no-store' }
          });
        }

        async function digestText(value) {
          const bytes = new TextEncoder().encode(String(value || ''));
          if (globalThis.crypto?.subtle) {
            const digest = await crypto.subtle.digest('SHA-256', bytes);
            return Array.from(new Uint8Array(digest)).map(value => value.toString(16).padStart(2, '0')).join('');
          }
          let hash = 2166136261;
          for (const byte of bytes) {
            hash ^= byte;
            hash = Math.imul(hash, 16777619);
          }
          return (hash >>> 0).toString(16);
        }

        async function previewCacheKey(engine, source) {
          return previewPrefix + await digestText(String(engine || '').toLowerCase() + String.fromCharCode(10) + String(source || ''));
        }

        async function cachePdfResponse(engine, source, response) {
          if (!('caches' in window) || !response?.ok) return;
          const type = String(response.headers.get('content-type') || '').toLowerCase();
          if (!type.includes('application/pdf')) return;
          try {
            const cache = await caches.open(previewCacheName);
            const key = await previewCacheKey(engine, source);
            await cache.put(new Request(key), response.clone());
            const keys = await cache.keys();
            while (keys.length > 12) {
              const oldest = keys.shift();
              if (oldest) await cache.delete(oldest);
            }
          } catch {}
        }

        async function cachedPdfResponse(engine, source) {
          if (!('caches' in window)) return null;
          try {
            const cache = await caches.open(previewCacheName);
            const key = await previewCacheKey(engine, source);
            const response = await cache.match(new Request(key));
            return response ? { key, response } : null;
          } catch {
            return null;
          }
        }

        async function requestParts(input, init) {
          const request = input instanceof Request ? input : null;
          const url = request ? request.url : String(input || '');
          const method = String(init?.method || request?.method || 'GET').toUpperCase();
          let body = init?.body;
          if (body == null && request && method !== 'GET' && method !== 'HEAD') {
            try { body = await request.clone().text(); } catch {}
          }
          return { request, url, method, body };
        }

        window.fetch = async function qssedaWarmFetch(input, init) {
          const parts = await requestParts(input, init);
          let parsedUrl = null;
          try { parsedUrl = new URL(parts.url, location.href); } catch {}

          if (parsedUrl && parts.method === 'GET' && parsedUrl.origin === location.origin && parsedUrl.pathname === '/api/tex/collaboration' && !parsedUrl.searchParams.get('action')) {
            const documentId = String(parsedUrl.searchParams.get('document') || '');
            const cached = readCollaborationSnapshot(documentId);
            if (cached?.data && Date.now() - cached.ts < collaborationMaxAge) {
              if (Date.now() - cached.ts > collaborationRevalidateAge) {
                void nativeFetch(input, init).then(async response => {
                  if (!response.ok) return;
                  const data = await response.clone().json().catch(() => null);
                  if (data) writeCollaborationSnapshot(documentId, data);
                }).catch(() => {});
              }
              return jsonResponse(cached.data);
            }
          }

          const isLocalCompile = parsedUrl && parts.method === 'POST' && (parsedUrl.hostname === '127.0.0.1' || parsedUrl.hostname === 'localhost') && parsedUrl.port === '32145' && parsedUrl.pathname === '/tex/compile';
          if (isLocalCompile) {
            let payload = null;
            try { payload = JSON.parse(String(parts.body || '{}')); } catch {}
            const engine = String(payload?.engine || '').toLowerCase();
            const source = String(payload?.source || '');
            if (engine) {
              const cached = await cachedPdfResponse(engine, source);
              if (cached?.response) return cached.response.clone();
              const response = await nativeFetch(input, init);
              if (response.ok) void cachePdfResponse(engine, source, response.clone());
              return response;
            }
          }

          const response = await nativeFetch(input, init);
          if (parsedUrl && parsedUrl.origin === location.origin && parsedUrl.pathname === '/api/tex/collaboration' && ['POST', 'PATCH', 'DELETE'].includes(parts.method) && response.ok) {
            void response.clone().json().then(data => {
              if (data?.document_id) writeCollaborationSnapshot(data.document_id, data);
            }).catch(() => {});
          }
          return response;
        };

        function activeDocumentId(root, documentList) {
          const stored = String(root?.dataset?.texCollaborationDocumentId || '').trim();
          if (stored) return stored;
          return String(documentList?.querySelector('.tex-document-item.is-active')?.dataset?.texDocumentId || '').trim();
        }

        function avatarInitials(person) {
          const source = String(person?.display_name || person?.username || '?').trim();
          return source ? source.slice(0, 2).toUpperCase() : '?';
        }

        function renderWarmAvatars(data) {
          const host = document.querySelector('#tex-collaboration-open .tex-collaboration-avatars');
          if (!host || !Array.isArray(data?.participants)) return;
          host.replaceChildren();
          const participants = data.participants.slice(0, 3);
          for (const participant of participants) {
            const avatar = document.createElement('span');
            avatar.className = 'tex-collaboration-avatar-dot';
            if (participant?.avatar_url) {
              const image = document.createElement('img');
              image.src = participant.avatar_url;
              image.alt = '';
              image.referrerPolicy = 'no-referrer';
              avatar.append(image);
            } else {
              avatar.textContent = avatarInitials(participant);
            }
            host.append(avatar);
          }
          if (data.participants.length > 3) {
            const more = document.createElement('span');
            more.className = 'tex-collaboration-avatar-dot';
            more.textContent = '+' + String(data.participants.length - 3);
            host.append(more);
          }
        }

        async function prefetchCollaboration(root, documentList) {
          const id = activeDocumentId(root, documentList);
          if (!id) return;
          const cached = readCollaborationSnapshot(id);
          if (cached?.data) renderWarmAvatars(cached.data);
          try {
            const response = await nativeFetch('/api/tex/collaboration?document=' + encodeURIComponent(id), {
              credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' }
            });
            if (!response.ok || id !== activeDocumentId(root, documentList)) return;
            const data = await response.json().catch(() => null);
            if (data) {
              writeCollaborationSnapshot(id, data);
              renderWarmAvatars(data);
            }
          } catch {}
        }

        async function restorePreview(root) {
          const source = document.getElementById('tex-source');
          const engine = document.getElementById('tex-engine');
          const editor = document.getElementById('tex-editor');
          const frame = document.getElementById('tex-live-preview-frame');
          const placeholder = document.getElementById('tex-live-preview-placeholder');
          const open = document.getElementById('tex-live-preview-open');
          const status = document.getElementById('tex-live-preview-status');
          const statusRow = status?.closest('.tex-live-preview-status');
          if (!source || !engine || !editor || !frame || editor.hidden) return;
          const current = ++restoreSequence;
          const cached = await cachedPdfResponse(engine.value, source.value || '');
          if (current !== restoreSequence || !cached?.response) return;
          if (cached.key === restoredPreviewKey && !frame.hidden) return;
          const blob = await cached.response.blob();
          if (current !== restoreSequence) return;
          const url = URL.createObjectURL(blob);
          if (restoredPreviewUrl) URL.revokeObjectURL(restoredPreviewUrl);
          restoredPreviewUrl = url;
          restoredPreviewKey = cached.key;
          frame.src = url + '#zoom=page-width';
          frame.hidden = false;
          if (placeholder) placeholder.hidden = true;
          if (open) {
            open.href = url;
            open.hidden = false;
          }
          if (status) status.textContent = restoredLabel;
          statusRow?.classList.add('is-ready');
          statusRow?.classList.remove('is-busy', 'is-error');
        }

        function initRuntimeRefinements() {
          const root = document.querySelector('.tex-work-app[data-tex-root]');
          const documentList = document.getElementById('tex-document-list');
          const openButton = document.getElementById('tex-collaboration-open');
          if (!root || !documentList || !openButton) {
            window.setTimeout(initRuntimeRefinements, 60);
            return;
          }

          let scheduled = 0;
          const warm = () => {
            window.clearTimeout(scheduled);
            scheduled = window.setTimeout(() => {
              const id = activeDocumentId(root, documentList);
              const cached = readCollaborationSnapshot(id);
              if (cached?.data) renderWarmAvatars(cached.data);
              void prefetchCollaboration(root, documentList);
              void restorePreview(root);
            }, 80);
          };

          openButton.addEventListener('click', () => {
            const id = activeDocumentId(root, documentList);
            if (!readCollaborationSnapshot(id)?.data) return;
            queueMicrotask(() => {
              const message = document.getElementById('tex-collaboration-message');
              if (message && loadingLabels.has(String(message.textContent || '').trim())) {
                message.textContent = '';
                message.classList.remove('is-visible', 'is-error');
              }
            });
          }, true);

          window.addEventListener('qsseda:tex-collaboration-snapshot', event => {
            const data = event.detail;
            if (data?.document_id === activeDocumentId(root, documentList)) renderWarmAvatars(data);
          });

          const observer = new MutationObserver(warm);
          observer.observe(root, { attributes: true, attributeFilter: ['data-tex-collaboration-document-id'] });
          observer.observe(documentList, { subtree: true, attributes: true, attributeFilter: ['class', 'data-tex-document-id'], childList: true });
          document.getElementById('tex-source')?.addEventListener('input', () => {
            window.setTimeout(() => void restorePreview(root), 40);
          });
          document.getElementById('tex-engine')?.addEventListener('change', () => {
            window.setTimeout(() => void restorePreview(root), 40);
          });
          window.addEventListener('pagehide', () => {
            observer.disconnect();
            if (restoredPreviewUrl) URL.revokeObjectURL(restoredPreviewUrl);
          }, { once: true });
          warm();
        }

        window.setTimeout(initRuntimeRefinements, 0);
      })();
    </script>`;
}