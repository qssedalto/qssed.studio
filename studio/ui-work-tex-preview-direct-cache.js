// 初学者导读：TeX 预览缓存策略：复用最近编译/预览结果以减少重复刷新。缓存只能优化显示，不能替代真实保存/版本记录。
export function enhanceWorkTexPreviewDirectCache(markup) {
  return String(markup || "") + `
    <style id="qsseda-work-tex-mobile-pdf-scroll-fix">
      @media (max-width:760px), (max-width:950px) and (pointer:coarse){
        .tex-work-app .tex-shell[data-mobile-pane="preview"]>.tex-runs-panel,
        .tex-work-app .tex-runs-panel{
          overflow-x:hidden!important;
          overflow-y:auto!important;
          overscroll-behavior-x:none!important;
          overscroll-behavior-y:contain!important;
          -webkit-overflow-scrolling:touch!important;
          touch-action:pan-y!important;
        }
        .tex-work-app .tex-live-preview-card{
          flex:0 0 auto!important;
          min-height:0!important;
          overflow:visible!important;
        }
        .tex-work-app .tex-live-preview-viewport{
          position:relative!important;
          overflow:hidden!important;
          touch-action:pan-y!important;
          overscroll-behavior:contain!important;
        }
        /* Native browser PDF viewers run inside an iframe and consume the touch
           stream before the mobile Work panel can scroll. Keep the inline
           preview passive on phones; the expand button switches it back to an
           interactive native PDF viewer. */
        .tex-work-app #tex-live-preview-frame{
          pointer-events:none!important;
          touch-action:none!important;
        }
        .tex-work-app .tex-preview-expand{
          display:grid!important;
          position:relative!important;
          z-index:8!important;
        }
        body.tex-preview-expanded .tex-live-preview-card.is-expanded{
          inset:0!important;
          padding:calc(10px + env(safe-area-inset-top,0px)) 10px calc(10px + env(safe-area-inset-bottom,0px))!important;
          border-radius:0!important;
        }
        body.tex-preview-expanded .tex-live-preview-card.is-expanded .tex-live-preview-viewport{
          overflow:hidden!important;
          touch-action:auto!important;
        }
        body.tex-preview-expanded .tex-live-preview-card.is-expanded #tex-live-preview-frame{
          pointer-events:auto!important;
          touch-action:auto!important;
        }
      }
    </style>
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

        const currentUserId = async () => {
          try {
            if (typeof supabaseClient === 'undefined') return '';
            const result = await supabaseClient.auth.getSession();
            return String(result?.data?.session?.user?.id || '').trim();
          } catch {
            return '';
          }
        };

        const onPreviewBlob = async event => {
          const blob = event?.detail?.blob;
          if (!(blob instanceof Blob) || blob.size <= 0 || blob.size > MAX_PDF_BYTES) return;
          if (!String(blob.type || '').toLowerCase().includes('pdf')) return;
          const userId = await currentUserId();
          if (!userId) return;
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
                userId,
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
