export function enhanceWorkTexDesktopTypography(markup) {
  return String(markup || "") + `
    <style id="qsseda-work-tex-desktop-type">
      @media (min-width:761px){
        .tex-work-app .tex-shell{font-size:14px}

        .tex-work-app .tex-panel-head,
        .tex-work-app .tex-runs-head{padding-top:16px!important;padding-bottom:11px!important}
        .tex-work-app .tex-panel-head strong,
        .tex-work-app .tex-runs-head strong{
          font-size:14px!important;
          line-height:1.25!important;
          letter-spacing:-.012em!important;
        }
        .tex-work-app .tex-panel-head #tex-document-count{
          min-width:22px!important;
          height:22px!important;
          padding:0 6px!important;
          font-size:10.5px!important;
        }

        .tex-work-app .tex-create-row select,
        .tex-work-app .tex-editor-toolbar select{
          font-size:12.5px!important;
        }
        .tex-work-app .tex-search input{
          font-size:12.5px!important;
        }
        .tex-work-app .tex-search svg{
          width:15px!important;
          height:15px!important;
        }

        .tex-work-app .tex-document-item{
          gap:6px!important;
          padding:11px!important;
        }
        .tex-work-app .tex-document-item strong{
          font-size:13.5px!important;
          line-height:1.3!important;
        }
        .tex-work-app .tex-document-item p{
          font-size:11px!important;
          line-height:1.48!important;
        }
        .tex-work-app .tex-document-meta{
          font-size:10px!important;
          line-height:1.35!important;
        }
        .tex-work-app .tex-empty strong{
          font-size:13px!important;
          line-height:1.35!important;
        }
        .tex-work-app .tex-empty span{
          font-size:11px!important;
          line-height:1.5!important;
        }

        .tex-work-app .tex-start-surface{
          gap:22px!important;
        }
        .tex-work-app .tex-start-surface>.tex-start-mark{
          width:58px!important;
          height:58px!important;
          border-radius:18px!important;
          font-size:14px!important;
        }
        .tex-work-app .tex-start-surface>.tex-start-copy{
          gap:8px!important;
          width:min(100%,640px)!important;
        }
        .tex-work-app .tex-start-copy strong{
          font-size:24px!important;
          line-height:1.2!important;
          letter-spacing:-.035em!important;
        }
        .tex-work-app .tex-start-copy span{
          font-size:14px!important;
          line-height:1.58!important;
        }
        .tex-work-app .tex-start-surface>.tex-start-grid{
          width:min(100%,760px)!important;
          gap:12px!important;
        }
        .tex-work-app .tex-start-card{
          min-height:108px!important;
          padding:17px 18px!important;
          border-radius:16px!important;
          gap:7px!important;
        }
        .tex-work-app .tex-start-card b{
          font-size:14px!important;
          line-height:1.3!important;
        }
        .tex-work-app .tex-start-card span{
          font-size:11.5px!important;
          line-height:1.5!important;
        }
        .tex-work-app .tex-start-features{
          gap:16px!important;
        }
        .tex-work-app .tex-start-features span{
          font-size:10.5px!important;
          line-height:1.4!important;
        }

        .tex-work-app .tex-editor-toolbar>input{
          font-size:19px!important;
        }
        .tex-work-app .tex-editor-toolbar label span{
          font-size:10px!important;
        }
        .tex-work-app .tex-source-label{
          font-size:10px!important;
        }
        .tex-work-app #tex-source{
          font-size:15.5px!important;
          line-height:1.62!important;
        }
        .tex-work-app .tex-save-state{
          font-size:10.5px!important;
        }
        .tex-work-app .tex-editor-actions button{
          font-size:11.5px!important;
        }

        .tex-work-app .tex-live-preview-head>strong{
          font-size:14px!important;
          line-height:1.3!important;
        }
        .tex-work-app .tex-live-preview-toggle{
          font-size:11.5px!important;
        }
        .tex-work-app .tex-live-preview-status{
          font-size:11.5px!important;
          line-height:1.45!important;
        }
        .tex-work-app .tex-live-preview-placeholder{
          font-size:12px!important;
          line-height:1.55!important;
        }
        .tex-work-app .tex-live-preview-foot{
          font-size:10.5px!important;
          line-height:1.45!important;
        }

        .tex-work-app .tex-compiler-state strong{
          font-size:13.5px!important;
          line-height:1.35!important;
        }
        .tex-work-app .tex-compiler-card p{
          font-size:11.5px!important;
          line-height:1.55!important;
        }
        .tex-work-app .tex-compiler-card small{
          font-size:10.5px!important;
          line-height:1.5!important;
        }
        .tex-work-app .tex-connection-check{
          min-height:34px!important;
          padding:0 13px!important;
          font-size:11px!important;
        }

        .tex-work-app .tex-run-item strong,
        .tex-work-app .tex-run-top strong{
          font-size:12.5px!important;
          line-height:1.35!important;
        }
        .tex-work-app .tex-run-status{
          font-size:10.5px!important;
        }
        .tex-work-app .tex-run-meta{
          font-size:10px!important;
          line-height:1.4!important;
        }
        .tex-work-app .tex-run-error{
          font-size:10.5px!important;
          line-height:1.5!important;
        }
        .tex-work-app .tex-run-item a{
          font-size:11.5px!important;
        }

        .tex-work-app .tex-side-toggle{
          width:30px!important;
          min-width:30px!important;
          height:30px!important;
          min-height:30px!important;
          font-size:17px!important;
        }
      }

      @media (min-width:1081px){
        .tex-work-app .tex-shell{
          grid-template-columns:260px minmax(460px,1fr) minmax(390px,.82fr)!important;
        }
        .tex-work-app .tex-shell.is-left-collapsed{
          grid-template-columns:46px minmax(460px,1fr) minmax(390px,.82fr)!important;
        }
        .tex-work-app .tex-shell.is-right-collapsed{
          grid-template-columns:260px minmax(460px,1fr) 46px!important;
        }
        .tex-work-app .tex-shell.is-left-collapsed.is-right-collapsed{
          grid-template-columns:46px minmax(0,1fr) 46px!important;
        }
      }
    </style>`;
}
