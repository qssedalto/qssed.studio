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
      /* qsseda.dev-inspired editorial type and bright, accessible tiles. */
      body.os-shell:has(.tex-work-app) .tex-start-surface {
        font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif!important;
        background:
          radial-gradient(closest-side at 17% 22%,color-mix(in srgb,#cbf476 23%,transparent),transparent 96%),
          radial-gradient(closest-side at 87% 72%,color-mix(in srgb,#c9b2ff 20%,transparent),transparent 96%),
          radial-gradient(closest-side at 79% 9%,color-mix(in srgb,#a9c6ff 17%,transparent),transparent 96%),
          var(--work-panel)!important;
      }
      body.os-shell:has(.tex-work-app) .tex-start-surface > .tex-start-kicker {
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:8px!important;
        color:var(--muted)!important;
        font:700 10px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace!important;
        letter-spacing:.12em!important;
        text-transform:uppercase!important;
      }
      body.os-shell:has(.tex-work-app) .tex-start-kicker .tex-start-signal {
        display:inline-block;
        width:8px;height:8px;border-radius:50%;
        background:#4dc97b;
        box-shadow:0 0 0 4px rgba(77,201,123,.13);
      }
      body.os-shell:has(.tex-work-app) .tex-start-surface > .tex-start-mark {
        width:64px!important;height:64px!important;
        border-radius:20px!important;
        background:#cbf476!important;
        color:#161819!important;
        box-shadow:0 12px 28px rgba(99,142,62,.13),inset 0 0 0 1px rgba(35,59,15,.12)!important;
        font:850 21px/1 ui-monospace,SFMono-Regular,Consolas,monospace!important;
        letter-spacing:-.075em!important;
        transform:rotate(-6deg);
      }
      body.os-shell:has(.tex-work-app) .tex-start-copy strong {
        font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif!important;
        font-size:clamp(35px,4.1vw,66px)!important;
        font-weight:820!important;
        line-height:1.13!important;
        letter-spacing:-.065em!important;
        color:var(--text)!important;
        text-wrap:balance;
      }
      body.os-shell:has(.tex-work-app) .tex-start-copy strong em {
        color:#1b52ec!important;
        font-style:normal!important;
      }
      body.os-shell:has(.tex-work-app) .tex-start-copy > span {
        font-size:clamp(12px,1.15vw,16px)!important;
        line-height:1.75!important;
        color:var(--muted)!important;
      }
      body.os-shell:has(.tex-work-app) .tex-start-surface > .tex-start-grid {
        width:min(100%,900px)!important;
        gap:14px!important;
        margin-top:17px!important;
      }
      body.os-shell:has(.tex-work-app) .tex-start-grid > .tex-start-card {
        position:relative!important;
        display:flex!important;
        flex-direction:column!important;
        align-items:flex-start!important;
        gap:12px!important;
        min-height:174px!important;
        padding:21px 22px!important;
        border-radius:20px!important;
        border:1px solid rgba(20,30,30,.08)!important;
        color:#171819!important;
        box-shadow:0 15px 35px rgba(18,29,24,.07)!important;
        transition:transform .2s cubic-bezier(.16,1,.3,1),box-shadow .2s!important;
      }
      body.os-shell:has(.tex-work-app) .tex-start-grid > .tex-start-card:nth-child(1) {background:#cbf476!important;}
      body.os-shell:has(.tex-work-app) .tex-start-grid > .tex-start-card:nth-child(2) {background:#c9b2ff!important;}
      body.os-shell:has(.tex-work-app) .tex-start-grid > .tex-start-card:nth-child(3) {background:#a9c6ff!important;}
      body.os-shell:has(.tex-work-app) .tex-start-grid > .tex-start-card:hover {
        transform:translateY(-4px)!important;
        box-shadow:0 22px 44px rgba(22,29,31,.14)!important;
      }
      body.os-shell:has(.tex-work-app) .tex-start-grid > .tex-start-card:focus-visible {
        outline:3px solid #1b52ec!important;outline-offset:3px!important;
      }
      body.os-shell:has(.tex-work-app) .tex-start-card-icon {
        display:grid;place-items:center;
        width:41px;height:41px;
        border-radius:12px;
        background:rgba(255,255,255,.48)!important;
        font:750 23px/1 ui-monospace,SFMono-Regular,Consolas,monospace!important;
        color:#162020!important;
      }
      body.os-shell:has(.tex-work-app) .tex-start-card b {
        font-size:clamp(15px,1.4vw,21px)!important;
        font-weight:790!important;
        letter-spacing:-.04em!important;
        line-height:1.2!important;
        margin-top:auto!important;
      }
      body.os-shell:has(.tex-work-app) .tex-start-card > span:not(.tex-start-card-icon) {
        font-size:clamp(11px,.92vw,13px)!important;
        line-height:1.65!important;
        color:#36423c!important;
      }
      body.os-shell:has(.tex-work-app) .tex-start-features {
        font-family:ui-monospace,SFMono-Regular,Consolas,monospace!important;
        font-size:10px!important;
        letter-spacing:.035em!important;
        gap:18px!important;
      }
      @media(max-width:760px) {
        body.os-shell:has(.tex-work-app) .tex-start-copy strong{font-size:clamp(30px,8.8vw,43px)!important}
        body.os-shell:has(.tex-work-app) .tex-start-grid > .tex-start-card {
          min-height:120px!important;
          padding:16px 19px!important;
          gap:8px!important;
        }
        body.os-shell:has(.tex-work-app) .tex-start-card-icon{width:34px;height:34px;font-size:19px}
      }
      :root[data-theme="dark"] body.os-shell:has(.tex-work-app) .tex-start-copy strong em {
        color:#99b6ff!important;
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
