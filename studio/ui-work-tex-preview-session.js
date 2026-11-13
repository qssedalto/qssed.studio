// Work TeX does not restore PDFs from browser history or session storage.
// Chromium's built-in PDF renderer can resurrect a previous project's page
// (and temporarily omit fonts) even while the Work welcome screen is visible.
// Keep document source caches separate; retire only the unsafe PDF blob cache.
export function enhanceWorkTexPreviewSession(markup, _zh) {
  return String(markup || "") + `
    <style id="qsseda-work-tex-preview-empty-guard">
      /* This guard applies before any compiler probe or async document fetch.
         The welcome screen must never paint a previous PDF or its open link. */
      .tex-work-app:has(#tex-editor[hidden]) #tex-live-preview-frame,
      .tex-work-app:has(#tex-editor[hidden]) #tex-live-preview-open{
        display:none!important;
      }
      .tex-work-app:has(#tex-editor[hidden]) #tex-live-preview-placeholder{
        display:flex!important;
      }
    </style>
    <script id="qsseda-work-tex-preview-session">
      (() => {
        if (window.__qssedaTexPreviewSessionReady) return;
        window.__qssedaTexPreviewSessionReady = true;

        const STORAGE_KEYS = [
          'qsseda.tex.preview-session.v2',
          'qsseda.tex.preview-session.v1'
        ];
        const HISTORY_KEYS = [
          '__qssedaTexPreviewBlobV2'
        ];
        const clearPreviewCache = () => {
          // Remove the old blob/data-URL PDF snapshots without touching the
          // legitimate IndexedDB source cache for documents.
          try {
            for (const key of STORAGE_KEYS) window.sessionStorage.removeItem(key);
          } catch {}
          try {
            const state = window.history.state;
            if (!state || typeof state !== 'object') return;
            if (!HISTORY_KEYS.some(key => Object.prototype.hasOwnProperty.call(state, key))) return;
            const next = { ...state };
            for (const key of HISTORY_KEYS) delete next[key];
            window.history.replaceState(next, document.title);
          } catch {}
        };
        clearPreviewCache();
      })();
    <\/script>`;
}
