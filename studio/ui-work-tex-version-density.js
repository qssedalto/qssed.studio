export function enhanceWorkTexVersionDensity(markup) {
  return String(markup || "") + `
    <style id="qsseda-work-tex-version-density">
      /* The base run list is a CSS grid with a large minimum height. With only one
         version, grid track stretching made that single row fill the whole panel.
         Pin history rows to their content height and let the parent panel own scroll. */
      .tex-work-app .tex-run-list.is-version-history{
        flex:0 0 auto!important;
        min-height:0!important;
        height:auto!important;
        align-content:start!important;
        align-items:start!important;
        grid-auto-rows:max-content!important;
        grid-template-rows:none!important;
        overflow:visible!important;
      }
      .tex-work-app .tex-run-list.is-version-history>.tex-version-item{
        align-self:start!important;
        min-height:52px!important;
        height:52px!important;
        max-height:52px!important;
        overflow:hidden!important;
      }
      .tex-work-app .tex-run-list.is-version-history>.tex-version-item .tex-version-top,
      .tex-work-app .tex-run-list.is-version-history>.tex-version-item .tex-version-meta{
        min-height:0!important;
      }
      .tex-work-app .tex-run-list.is-version-history>.tex-version-item .tex-version-actions{
        align-self:center!important;
      }
      @media(max-width:1080px){
        .tex-work-app .tex-run-list.is-version-history{
          overflow:visible!important;
        }
        .tex-work-app .tex-run-list.is-version-history>.tex-version-item{
          height:auto!important;
          max-height:none!important;
          min-height:72px!important;
          overflow:visible!important;
        }
      }
    </style>`;
}
