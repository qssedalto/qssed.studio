// Desktop-only viewport refinements; preserve the existing three-pane layout.
// Scroll remains functional via wheel, trackpad, touch and keyboard.
export function polishWorkTexViewportEdges(markup) {
  const style = `
    <style id="qsseda-work-tex-viewport-edges">
      @media (min-width:1081px) {
        body.os-shell:has(.tex-work-app) .tex-runs-panel {
          scrollbar-gutter:auto!important;
          scrollbar-width:none!important;
          -ms-overflow-style:none!important;
          background:var(--work-panel-soft)!important;
        }
        body.os-shell:has(.tex-work-app) .tex-runs-panel::-webkit-scrollbar,
        body.os-shell:has(.tex-work-app) .tex-runs-panel *::-webkit-scrollbar {
          display:none!important;
          width:0!important;
          height:0!important;
        }
        body.os-shell:has(.tex-work-app) .tex-runs-panel .tex-live-preview-card {
          box-sizing:border-box!important;
          flex:0 0 calc(100% - 24px)!important;
          align-self:stretch!important;
          width:auto!important;
          min-width:0!important;
          max-width:none!important;
          height:calc(100% - 24px)!important;
          min-height:calc(100% - 24px)!important;
          margin:12px!important;
        }
        body.os-shell:has(.tex-work-app) .tex-shell.is-right-collapsed .tex-runs-panel {
          overflow:hidden!important;
          scrollbar-gutter:auto!important;
        }
        body.os-shell:has(.tex-work-app) .tex-shell.is-right-collapsed .tex-right-panel-toggle {
          left:50%!important;
          right:auto!important;
          top:12px!important;
          transform:translateX(-50%)!important;
          transform-origin:center!important;
        }
        body.os-shell:has(.tex-work-app) .tex-shell.is-right-collapsed .tex-right-panel-toggle:active {
          transform:translateX(-50%) scale(.94)!important;
        }
      }
      /* A single continuous surface, not a contrasting white header strip. */
      body.os-shell:has(.tex-work-app) .tex-documents-panel {
        background:var(--work-panel-soft)!important;
        background-clip:padding-box!important;
      }
      body.os-shell:has(.tex-work-app) .tex-documents-panel > .tex-panel-head {
        background:transparent!important;
        border-bottom:0!important;
        box-shadow:none!important;
      }
      body.os-shell:has(.tex-work-app) .tex-documents-panel > .tex-create-row,
      body.os-shell:has(.tex-work-app) .tex-documents-panel > .tex-search,
      body.os-shell:has(.tex-work-app) .tex-documents-panel > .tex-document-list {
        background:transparent!important;
        border-top:0!important;
      }
      body.os-shell:has(.tex-work-app) .tex-documents-panel .tex-document-item {
        -webkit-tap-highlight-color:transparent;
        touch-action:manipulation;
      }
      body.os-shell:has(.tex-work-app) .tex-documents-panel .tex-document-item.is-opening {
        background:color-mix(in srgb,var(--primary) 10%,var(--work-card))!important;
        border-color:color-mix(in srgb,var(--primary) 36%,var(--border))!important;
        cursor:progress!important;
      }
    </style>
  `;
  const source = String(markup || "");
  if (!source.includes("</body>")) return source;
  return source.replace("</body>", style + "</body>");
}
