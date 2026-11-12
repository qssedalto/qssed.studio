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
          flex:0 0 calc(100% - 10px)!important;
          align-self:stretch!important;
          width:auto!important;
          min-width:0!important;
          max-width:none!important;
          height:calc(100% - 16px)!important;
          min-height:calc(100% - 16px)!important;
          margin:8px 2px 8px 8px!important;
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
      /* Flush PDF layout: no reserved track, no decorative 24px right stripe. */
      @media (min-width:1081px) {
        body.os-shell:has(.tex-work-app) .tex-runs-panel {
          padding:0!important;
          padding-right:0!important;
          box-sizing:border-box!important;
        }
        body.os-shell:has(.tex-work-app) .tex-runs-panel .tex-live-preview-card {
          padding:12px 5px 12px 12px!important;
          max-width:calc(100% - 10px)!important;
        }
        body.os-shell:has(.tex-work-app) .tex-runs-panel .tex-live-preview-viewport {
          width:100%!important;
          max-width:100%!important;
        }
        /* Collapse lives with the other preview actions, not beside the title. */
        body.os-shell:has(.tex-work-app) .tex-runs-panel:not(.unused) > .tex-right-panel-toggle {
          left:auto!important;
          right:10px!important;
          top:16px!important;
          transform:none!important;
        }
        body.os-shell:has(.tex-work-app) .tex-runs-panel .tex-live-preview-head {
          padding-left:0!important;
          min-width:0!important;
        }
        body.os-shell:has(.tex-work-app) .tex-runs-panel .tex-live-preview-actions {
          margin-right:33px!important;
        }
        body.os-shell:has(.tex-work-app) .tex-shell.is-right-collapsed .tex-right-panel-toggle {
          left:50%!important;
          right:auto!important;
          top:12px!important;
          transform:translateX(-50%)!important;
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
