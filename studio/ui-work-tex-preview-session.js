export function enhanceWorkTexPreviewSession(markup, zh) {
  const restoredLabel = zh ? "已立即恢复上次预览" : "Last preview restored instantly";
  return String(markup || "") + `
    <script id="qsseda-work-tex-preview-session">
      (() => {
        if (window.__qssedaTexPreviewSessionReady) return;
        window.__qssedaTexPreviewSessionReady = true;

        const STORAGE_KEY = 'qsseda.tex.preview-session.v1';
        const MAX_PDF_BYTES = 2.75 * 1024 * 1024;
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

        const readCache = () => {
          try {
            const raw = window.sessionStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const value = JSON.parse(raw);
            if (!value || value.version !== 1 || typeof value.data !== 'string' || !value.data.startsWith('data:application/pdf')) return null;
            return value;
          } catch {
            return null;
          }
        };

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

        const restoreImmediately = () => {
          const cached = readCache();
          if (!cached) return;
          try {
            const blob = dataUrlToBlob(cached.data);
            if (!blob) return;
            restoredUrl = URL.createObjectURL(blob);
            restoring = true;
            frame.src = restoredUrl + '#view=FitH';
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
              documentId: String(cached.documentId || ''),
              engine: String(cached.engine || ''),
              sourceHash: String(cached.sourceHash || '')
            };
            window.setTimeout(() => { restoring = false; }, 0);
          } catch {}
        };

        const persistBlobUrl = async src => {
          if (restoring || !src.startsWith('blob:')) return;
          const base = src.split('#')[0];
          if (base === restoredUrl) return;
          const token = ++persistToken;
          try {
            const response = await fetch(base);
            if (!response.ok) return;
            const blob = await response.blob();
            if (token !== persistToken || !blob.type.toLowerCase().includes('pdf') || blob.size <= 0 || blob.size > MAX_PDF_BYTES) return;
            const reader = new FileReader();
            const data = await new Promise((resolve, reject) => {
              reader.onload = () => resolve(String(reader.result || ''));
              reader.onerror = () => reject(reader.error || new Error('read failed'));
              reader.readAsDataURL(blob);
            });
            if (token !== persistToken || !String(data).startsWith('data:application/pdf')) return;
            const meta = currentMeta();
            const payload = JSON.stringify({ version: 1, savedAt: Date.now(), data, ...meta });
            try {
              window.sessionStorage.setItem(STORAGE_KEY, payload);
            } catch {
              try {
                window.sessionStorage.removeItem(STORAGE_KEY);
                window.sessionStorage.setItem(STORAGE_KEY, payload);
              } catch {}
            }
          } catch {}
        };

        const validateRestoredPreview = () => {
          const cached = readCache();
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

        restoreImmediately();

        const frameObserver = new MutationObserver(() => {
          const src = frame.getAttribute('src') || '';
          if (src.startsWith('blob:')) void persistBlobUrl(src);
        });
        frameObserver.observe(frame, { attributes: true, attributeFilter: ['src'] });

        const documentList = document.getElementById('tex-document-list');
        const documentObserver = documentList ? new MutationObserver(() => window.setTimeout(validateRestoredPreview, 0)) : null;
        documentObserver?.observe(documentList, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

        window.setTimeout(validateRestoredPreview, 700);
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
