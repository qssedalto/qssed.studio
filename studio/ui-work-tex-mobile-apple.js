export function enhanceWorkTexMobileApple(markup) {
  return String(markup || "") + `
    <style id="qsseda-work-tex-mobile-apple-polish">
      @media (max-width:760px), (max-width:950px) and (pointer:coarse){
        :root{--tex-mobile-tabs-h:calc(52px + env(safe-area-inset-bottom,0px))}

        .tex-work-app .tex-start-surface{
          align-items:stretch!important;
          justify-content:flex-start!important;
          padding:calc(30px + env(safe-area-inset-top,0px)) 18px 28px!important;
          gap:0!important;
          background:var(--surface)!important;
        }
        .tex-work-app .tex-start-surface>.tex-start-mark{
          align-self:flex-start!important;
          width:44px!important;
          height:44px!important;
          margin:0 0 18px!important;
          border-radius:13px!important;
          background:color-mix(in srgb,var(--primary) 8%,var(--fill))!important;
          box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 14%,var(--hairline))!important;
          font-size:12px!important;
        }
        .tex-work-app .tex-start-surface>.tex-start-copy{
          width:100%!important;
          max-width:none!important;
          gap:5px!important;
          text-align:left!important;
        }
        .tex-work-app .tex-start-copy strong{
          display:block!important;
          width:100%!important;
          text-align:left!important;
          font-size:22px!important;
          line-height:1.2!important;
          letter-spacing:-.035em!important;
        }
        .tex-work-app .tex-start-copy span{
          display:block!important;
          width:100%!important;
          max-width:34rem!important;
          text-align:left!important;
          font-size:13px!important;
          line-height:1.5!important;
        }
        .tex-work-app .tex-start-surface>.tex-start-grid{
          width:100%!important;
          max-width:none!important;
          grid-template-columns:1fr!important;
          gap:10px!important;
          margin-top:20px!important;
        }
        .tex-work-app .tex-start-card{
          display:grid!important;
          align-content:center!important;
          justify-items:start!important;
          min-height:82px!important;
          padding:15px 16px!important;
          border-radius:16px!important;
          text-align:left!important;
          background:var(--card)!important;
          box-shadow:inset 0 0 0 1px var(--hairline)!important;
          transition:transform .14s ease,background .14s ease,box-shadow .14s ease!important;
          -webkit-tap-highlight-color:transparent;
        }
        .tex-work-app .tex-start-card:hover{
          transform:none!important;
          background:var(--card)!important;
          box-shadow:inset 0 0 0 1px var(--hairline)!important;
        }
        .tex-work-app .tex-start-card:active{
          transform:scale(.985)!important;
          background:color-mix(in srgb,var(--primary) 4%,var(--card))!important;
        }
        .tex-work-app .tex-start-card b{
          width:100%!important;
          text-align:left!important;
          font-size:15px!important;
          line-height:1.3!important;
          letter-spacing:-.012em!important;
        }
        .tex-work-app .tex-start-card span{
          width:100%!important;
          text-align:left!important;
          font-size:12px!important;
          line-height:1.45!important;
        }
        .tex-work-app .tex-start-surface>.tex-start-features{
          width:100%!important;
          justify-content:flex-start!important;
          gap:8px 14px!important;
          margin-top:16px!important;
          padding:0 2px!important;
          color:var(--quiet)!important;
        }
        .tex-work-app .tex-start-features span{
          font-size:9px!important;
          line-height:1.35!important;
        }

        .tex-work-app .tex-live-preview-viewport{
          height:calc(var(--tex-mobile-vh) - var(--tex-mobile-tabs-h) - 170px)!important;
        }

        .tex-mobile-tabs{
          height:var(--tex-mobile-tabs-h)!important;
          padding:2px 10px env(safe-area-inset-bottom,0px)!important;
          border-top:1px solid color-mix(in srgb,var(--hairline) 92%,transparent)!important;
          background:color-mix(in srgb,var(--surface) 84%,transparent)!important;
          -webkit-backdrop-filter:blur(26px) saturate(170%)!important;
          backdrop-filter:blur(26px) saturate(170%)!important;
          transition:transform .18s ease,opacity .14s ease!important;
        }
        .tex-mobile-tab{
          gap:1px!important;
          min-height:46px!important;
          padding:2px 4px!important;
          border-radius:10px!important;
          font-size:10px!important;
          font-weight:550!important;
          line-height:1.1!important;
        }
        .tex-mobile-tab svg{
          width:22px!important;
          height:22px!important;
          stroke-width:1.75!important;
        }
        .tex-mobile-tab[aria-selected="true"]{
          color:var(--primary)!important;
          font-weight:650!important;
          background:transparent!important;
        }
        .tex-mobile-tab[aria-selected="true"] svg{stroke-width:2!important}
        .tex-mobile-tab:active{background:color-mix(in srgb,var(--fill) 72%,transparent)!important}

        body.tex-mobile-keyboard-open .tex-work-app .tex-shell>.tex-documents-panel,
        body.tex-mobile-keyboard-open .tex-work-app .tex-shell>.tex-editor-panel,
        body.tex-mobile-keyboard-open .tex-work-app .tex-shell>.tex-runs-panel{
          bottom:0!important;
        }
        body.tex-mobile-keyboard-open .tex-mobile-tabs{
          opacity:0!important;
          pointer-events:none!important;
          transform:translateY(100%)!important;
        }
      }
    </style>`;
}
