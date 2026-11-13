// Keep the mobile PDF scroll fix. The former sessionStorage PDF writer is
// deliberately removed: no cross-document PDF blobs may survive navigation.
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
    `;
}
