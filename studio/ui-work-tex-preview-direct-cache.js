export function enhanceWorkTexPreviewDirectCache(markup) {
  return String(markup || "") + `
    <script id="qsseda-work-tex-preview-direct-cache">
      (() => {
        if (window.__qssedaTexPreviewDirectCacheReady) return;
        window.__qssedaTexPreviewDirectCacheReady = true;

        const STORAGE_KEY = 'qsseda.tex.preview-session.v2';
        const MAX_PDF_BYTES = 3.5 * 1024 * 1024;
        let writeToken = 0;

        const root = document.querySelector('.tex-work-app[data-tex-root], [data-tex-root]');
        if (!root) return;

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

        const onPreviewBlob = event => {
          const blob = event?.detail?.blob;
          if (!(blob instanceof Blob) || blob.size <= 0 || blob.size > MAX_PDF_BYTES) return;
          if (!String(blob.type || '').toLowerCase().includes('pdf')) return;
          const token = ++writeToken;
          const documentId = activeDocumentId();
          const engine = String(document.getElementById('tex-engine')?.value || '').toLowerCase();
          const sourceHash = fastHash(document.getElementById('tex-source')?.value || '');
          const reader = new FileReader();
          reader.onload = () => {
            if (token !== writeToken) return;
            const data = String(reader.result || '');
            if (!data.startsWith('data:application/pdf')) return;
            try {
              window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
                version: 2,
                savedAt: Date.now(),
                data,
                documentId,
                engine,
                sourceHash
              }));
            } catch {}
          };
          reader.readAsDataURL(blob);
        };

        window.addEventListener('qsseda:tex-preview-blob', onPreviewBlob);
        window.addEventListener('pagehide', () => {
          window.removeEventListener('qsseda:tex-preview-blob', onPreviewBlob);
        }, { once: true });
      })();
    </script>`;
}
