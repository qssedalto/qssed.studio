/**
 * 【初学者导读】
 * 文件：studio/ui-work-tex-preview-session.js
 * 这是 AERTEX Work/TeX 前端模块（work-tex-preview-session）。这组文件把编辑器、预览、协作、移动端适配或性能优化拆成多个小模块，避免一个超大文件承担全部职责。
 * 阅读顺序：先找本文件 export 的安装/初始化函数，再看它接收的 editor/state/session 参数；之后沿事件监听、缓存和 DOM 更新理解副作用。
 * 初学者重点：编辑器状态、服务器版本、协作会话和预览缓存是不同层次的数据；修改其中一层时不要假设其他层会自动同步。
 * 修改注意：协作/实时模块尤其要考虑乱序消息、重复消息、断线重连和旧版本客户端；性能优化模块不能以牺牲正确性为代价。
 * 调试方法：先区分“编辑器内容错”“预览错”“协作同步错”“移动布局错”，再进入对应模块，不要在整个 Work 链路里盲查。
 */
export function enhanceWorkTexPreviewSession(markup, zh) {
  const restoredLabel = zh ? "已立即恢复上次预览" : "Last preview restored instantly";
  return String(markup || "") + `
    <script id="qsseda-work-tex-preview-session">
      (() => {
        if (window.__qssedaTexPreviewSessionReady) return;
        window.__qssedaTexPreviewSessionReady = true;

        const STORAGE_KEY = 'qsseda.tex.preview-session.v2';
        const HISTORY_KEY = '__qssedaTexPreviewBlobV2';
        const MAX_SESSION_PDF_BYTES = 2.75 * 1024 * 1024;
        const MAX_HISTORY_PDF_BYTES = 12 * 1024 * 1024;
        const restoredLabel = ${JSON.stringify(restoredLabel)};
        const root = document.querySelector('.tex-work-app[data-tex-root], [data-tex-root]');
        const frame = document.getElementById('tex-live-preview-frame');
        const placeholder = document.getElementById('tex-live-preview-placeholder');
        const open = document.getElementById('tex-live-preview-open');
        const status = document.getElementById('tex-live-preview-status');
        const statusRow = status?.closest('.tex-live-preview-status');
        if (!root || !frame) return;

        let restoredUrl = '';
        let restoring = false;
        let persistToken = 0;
        let identityPromise = null;

        const activeDocumentId = () => String(
          root.dataset.texCollaborationDocumentId ||
          document.querySelector('.tex-document-item.is-active')?.dataset?.texDocumentId ||
          ''
        ).trim();

        const fastHash = value => {
          const text = String(value || '');
          let hash = 2166136261;
          for (let index = 0; index < text.length; index += 1) {
            hash ^= text.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
          }
          return (hash >>> 0).toString(36);
        };

        const currentMeta = () => ({
          documentId: activeDocumentId(),
          engine: String(document.getElementById('tex-engine')?.value || '').toLowerCase(),
          sourceHash: fastHash(document.getElementById('tex-source')?.value || '')
        });

        const currentUserId = () => {
          if (identityPromise) return identityPromise;
          identityPromise = (async () => {
            try {
              if (typeof supabaseClient === 'undefined') return '';
              const result = await supabaseClient.auth.getSession();
              return String(result?.data?.session?.user?.id || '').trim();
            } catch {
              return '';
            }
          })();
          return identityPromise;
        };

        const clearPreviewCache = () => {
          try { window.sessionStorage.removeItem(STORAGE_KEY); } catch {}
          try {
            const state = window.history.state;
            if (state && typeof state === 'object' && Object.prototype.hasOwnProperty.call(state, HISTORY_KEY)) {
              const next = { ...state };
              delete next[HISTORY_KEY];
              window.history.replaceState(next, document.title);
            }
          } catch {}
        };

        const readHistoryCache = userId => {
          try {
            const value = window.history.state?.[HISTORY_KEY];
            const blob = value?.blob;
            if (!value || value.version !== 2 || value.userId !== userId || !(blob instanceof Blob) || blob.size <= 0 || !String(blob.type || '').toLowerCase().includes('pdf')) return null;
            return { ...value, blob };
          } catch {
            return null;
          }
        };

        const readSessionCache = userId => {
          try {
            const raw = window.sessionStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const value = JSON.parse(raw);
            if (!value || value.version !== 2 || value.userId !== userId || typeof value.data !== 'string' || !value.data.startsWith('data:application/pdf')) return null;
            return value;
          } catch {
            return null;
          }
        };

        const readCache = userId => readHistoryCache(userId) || readSessionCache(userId);

        const dataUrlToBlob = dataUrl => {
          const comma = dataUrl.indexOf(',');
          if (comma < 0) return null;
          const header = dataUrl.slice(0, comma);
          const body = dataUrl.slice(comma + 1);
          const binary = atob(body);
          const bytes = new Uint8Array(binary.length);
          for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
          const type = /data:([^;]+)/.exec(header)?.[1] || 'application/pdf';
          return new Blob([bytes], { type });
        };

        const restoreImmediately = async () => {
          const userId = await currentUserId();
          if (!userId) {
            clearPreviewCache();
            return;
          }
          const cached = readCache(userId);
          if (!cached) {
            // Old unscoped caches are deliberately discarded instead of being
            // displayed first and validated later.
            clearPreviewCache();
            return;
          }
          try {
            const blob = cached.blob instanceof Blob ? cached.blob : dataUrlToBlob(cached.data);
            if (!blob) return;
            restoredUrl = URL.createObjectURL(blob);
            restoring = true;
            frame.src = restoredUrl + '#zoom=page-width';
            frame.hidden = false;
            if (placeholder) placeholder.hidden = true;
            if (open) {
              open.href = restoredUrl;
              open.hidden = false;
            }
            if (status) status.textContent = restoredLabel;
            statusRow?.classList.add('is-ready');
            window.__qssedaTexSessionPreview = {
              restored: true,
              userId,
              documentId: String(cached.documentId || ''),
              engine: String(cached.engine || ''),
              sourceHash: String(cached.sourceHash || '')
            };
            window.setTimeout(() => { restoring = false; }, 0);
          } catch {}
        };

        const persistHistoryBlob = (blob, meta, userId) => {
          if (!(blob instanceof Blob) || blob.size <= 0 || blob.size > MAX_HISTORY_PDF_BYTES || !userId) return false;
          try {
            const base = window.history.state && typeof window.history.state === 'object' ? window.history.state : {};
            const next = { ...base, [HISTORY_KEY]: { version: 2, savedAt: Date.now(), blob, userId, ...meta } };
            window.history.replaceState(next, document.title);
            return true;
          } catch {
            return false;
          }
        };

        const persistSessionData = async (blob, meta, userId, token) => {
          if (!(blob instanceof Blob) || blob.size <= 0 || blob.size > MAX_SESSION_PDF_BYTES || !userId) return;
          try {
            const reader = new FileReader();
            const data = await new Promise((resolve, reject) => {
              reader.onload = () => resolve(String(reader.result || ''));
              reader.onerror = () => reject(reader.error || new Error('read failed'));
              reader.readAsDataURL(blob);
            });
            if (token !== persistToken || !String(data).startsWith('data:application/pdf')) return;
            const payload = JSON.stringify({ version: 2, savedAt: Date.now(), data, userId, ...meta });
            try { window.sessionStorage.setItem(STORAGE_KEY, payload); } catch {}
          } catch {}
        };

        const persistBlobUrl = async src => {
          if (restoring || !src.startsWith('blob:')) return;
          const base = src.split('#')[0];
          if (base === restoredUrl) return;
          const token = ++persistToken;
          try {
            const userId = await currentUserId();
            if (!userId) return;
            const response = await fetch(base);
            if (!response.ok) return;
            const blob = await response.blob();
            if (token !== persistToken || !String(blob.type || '').toLowerCase().includes('pdf') || blob.size <= 0) return;
            const meta = currentMeta();
            persistHistoryBlob(blob, meta, userId);
            void persistSessionData(blob, meta, userId, token);
          } catch {}
        };

        const validateRestoredPreview = async () => {
          const userId = await currentUserId();
          if (!userId) {
            clearPreviewCache();
            return;
          }
          const cached = readCache(userId);
          if (!cached || !restoredUrl) return;
          const meta = currentMeta();
          if (!meta.documentId || !meta.engine) return;
          const sameDocument = !cached.documentId || cached.documentId === meta.documentId;
          const sameEngine = !cached.engine || cached.engine === meta.engine;
          if (!sameDocument || !sameEngine) {
            frame.hidden = true;
            if (placeholder) placeholder.hidden = false;
            if (open) open.hidden = true;
            try { URL.revokeObjectURL(restoredUrl); } catch {}
            restoredUrl = '';
            window.__qssedaTexSessionPreview = null;
          }
        };

        void restoreImmediately();

        const frameObserver = new MutationObserver(() => {
          const src = frame.getAttribute('src') || '';
          if (src.startsWith('blob:')) void persistBlobUrl(src);
        });
        frameObserver.observe(frame, { attributes: true, attributeFilter: ['src'] });

        const documentList = document.getElementById('tex-document-list');
        const documentObserver = documentList ? new MutationObserver(() => window.setTimeout(() => void validateRestoredPreview(), 0)) : null;
        documentObserver?.observe(documentList, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

        window.setTimeout(() => void validateRestoredPreview(), 700);
        window.addEventListener('pagehide', () => {
          frameObserver.disconnect();
          documentObserver?.disconnect();
          if (restoredUrl) {
            try { URL.revokeObjectURL(restoredUrl); } catch {}
            restoredUrl = '';
          }
        }, { once: true });
      })();
    </script>`;
}
