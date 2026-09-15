export function enhanceWorkTexMobile(markup, zh) {
  const copy = zh ? {
    documents: "文档",
    edit: "编辑",
    preview: "PDF",
    documentsAria: "打开文档列表",
    editAria: "打开 TeX 编辑器",
    previewAria: "打开 PDF 预览"
  } : {
    documents: "Documents",
    edit: "Edit",
    preview: "PDF",
    documentsAria: "Open document list",
    editAria: "Open TeX editor",
    previewAria: "Open PDF preview"
  };

  return String(markup || "") + `
    <style id="qsseda-work-tex-mobile-ui">
      .tex-mobile-tabs{display:none}

      @media (max-width:760px), (max-width:950px) and (pointer:coarse){
        :root{--tex-mobile-vh:100dvh;--tex-mobile-tabs-h:calc(58px + env(safe-area-inset-bottom,0px))}
        html,body{height:100%;overscroll-behavior:none}
        body.os-shell{
          width:100%!important;
          min-height:var(--tex-mobile-vh)!important;
          margin:0!important;
          padding:0!important;
          overflow:hidden!important;
          background:var(--surface)!important;
        }
        body.os-shell .os-layout,
        body.os-shell .os-main,
        body.os-shell #os-content,
        body.os-shell .tex-workbench{
          width:100%!important;
          min-height:var(--tex-mobile-vh)!important;
          height:var(--tex-mobile-vh)!important;
          margin:0!important;
          padding:0!important;
          overflow:hidden!important;
        }
        body.os-shell .tex-workbench .tex-shell{
          position:relative!important;
          display:block!important;
          width:100%!important;
          height:var(--tex-mobile-vh)!important;
          min-height:0!important;
          margin:0!important;
          border:0!important;
          border-radius:0!important;
          overflow:hidden!important;
          background:var(--surface)!important;
          box-shadow:none!important;
        }

        .tex-work-app .tex-side-toggle{display:none!important}
        .tex-work-app .tex-runs-panel .tex-live-preview-head{padding-left:0!important}

        .tex-work-app .tex-shell>.tex-documents-panel,
        .tex-work-app .tex-shell>.tex-editor-panel,
        .tex-work-app .tex-shell>.tex-runs-panel{
          position:absolute!important;
          inset:0 0 var(--tex-mobile-tabs-h) 0!important;
          width:100%!important;
          min-width:0!important;
          height:auto!important;
          min-height:0!important;
          margin:0!important;
          border:0!important;
          border-radius:0!important;
          overflow:hidden!important;
          background:var(--surface)!important;
        }
        .tex-work-app .tex-shell>.tex-documents-panel,
        .tex-work-app .tex-shell>.tex-runs-panel{display:none!important}
        .tex-work-app .tex-shell>.tex-editor-panel{display:none!important}
        .tex-work-app .tex-shell[data-mobile-pane="documents"]>.tex-documents-panel{display:flex!important}
        .tex-work-app .tex-shell[data-mobile-pane="editor"]>.tex-editor-panel{display:block!important}
        .tex-work-app .tex-shell[data-mobile-pane="preview"]>.tex-runs-panel{display:flex!important}

        .tex-work-app .tex-documents-panel{
          flex-direction:column!important;
          background:var(--bg-soft)!important;
          overflow:auto!important;
          -webkit-overflow-scrolling:touch;
        }
        .tex-work-app .tex-panel-head{
          position:sticky;
          top:0;
          z-index:5;
          min-height:58px;
          justify-content:flex-start!important;
          padding:calc(12px + env(safe-area-inset-top,0px)) 16px 10px!important;
          background:color-mix(in srgb,var(--bg-soft) 90%,transparent)!important;
          -webkit-backdrop-filter:blur(22px) saturate(150%);
          backdrop-filter:blur(22px) saturate(150%);
          border-bottom:1px solid var(--hairline);
        }
        .tex-work-app .tex-panel-title{gap:8px!important}
        .tex-work-app .tex-panel-title strong{font-size:18px!important;letter-spacing:-.035em}
        .tex-work-app .tex-panel-title #tex-document-count{
          min-width:24px!important;
          height:24px!important;
          padding:0 7px!important;
          font-size:10px!important;
          background:var(--fill)!important;
        }
        .tex-work-app .tex-create-row{
          grid-template-columns:minmax(0,1fr) 48px!important;
          gap:8px!important;
          padding:12px 14px 9px!important;
        }
        .tex-work-app .tex-create-row select,
        .tex-work-app .tex-create-row button{
          min-height:48px!important;
          border-radius:14px!important;
          font-size:14px!important;
        }
        .tex-work-app .tex-create-row button{font-size:24px!important}
        .tex-work-app .tex-search{
          min-height:46px!important;
          margin:0 14px 10px!important;
          padding:0 13px!important;
          border-radius:14px!important;
        }
        .tex-work-app .tex-search input{height:46px!important;font-size:16px!important}
        .tex-work-app .tex-search svg{width:17px!important;height:17px!important}
        .tex-work-app .tex-document-list{
          display:grid!important;
          gap:6px!important;
          padding:0 10px calc(18px + env(safe-area-inset-bottom,0px))!important;
          overflow:visible!important;
        }
        .tex-work-app .tex-document-item{
          gap:7px!important;
          min-height:78px!important;
          padding:13px 14px!important;
          border-radius:15px!important;
          background:var(--card)!important;
          box-shadow:inset 0 0 0 1px var(--hairline)!important;
        }
        .tex-work-app .tex-document-item.is-active{
          background:color-mix(in srgb,var(--primary) 7%,var(--card))!important;
          box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 28%,var(--hairline))!important;
        }
        .tex-work-app .tex-document-item strong{font-size:14px!important}
        .tex-work-app .tex-document-item p{font-size:11px!important;line-height:1.45!important}
        .tex-work-app .tex-document-meta{font-size:10px!important}
        .tex-work-app #tex-documents-empty{padding:52px 24px!important}

        .tex-work-app .tex-editor-panel{
          overflow:hidden!important;
          background:var(--surface)!important;
        }
        .tex-work-app .tex-editor-placeholder{
          height:100%!important;
          min-height:0!important;
          padding:30px 20px!important;
          overflow:auto!important;
          -webkit-overflow-scrolling:touch;
        }
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

        .tex-work-app .tex-editor{
          height:100%!important;
          min-height:0!important;
          grid-template-rows:auto auto minmax(0,1fr) auto!important;
          overflow:hidden!important;
        }
        .tex-work-app .tex-editor-toolbar{
          position:relative!important;
          z-index:4!important;
          display:grid!important;
          grid-template-columns:minmax(0,1fr) 116px!important;
          align-items:end!important;
          gap:8px!important;
          min-height:64px!important;
          padding:calc(10px + env(safe-area-inset-top,0px)) 12px 9px!important;
          border-bottom:1px solid var(--hairline)!important;
          background:color-mix(in srgb,var(--surface) 92%,transparent)!important;
          -webkit-backdrop-filter:blur(20px) saturate(150%);
          backdrop-filter:blur(20px) saturate(150%);
        }
        .tex-work-app .tex-editor-toolbar>input{
          height:42px!important;
          min-height:42px!important;
          padding:0 4px!important;
          font-size:17px!important;
        }
        .tex-work-app .tex-editor-toolbar label{min-width:0!important;gap:2px!important}
        .tex-work-app .tex-editor-toolbar select{
          width:100%!important;
          min-height:42px!important;
          border-radius:12px!important;
          font-size:11px!important;
        }
        .tex-work-app .tex-source-label{padding:7px 12px 5px!important;font-size:9px!important}
        .tex-work-app #tex-source{
          width:100%!important;
          height:100%!important;
          min-height:0!important;
          padding:12px 14px 24px!important;
          resize:none!important;
          font-size:16px!important;
          line-height:1.58!important;
          -webkit-overflow-scrolling:touch;
          overscroll-behavior:contain;
        }
        .tex-work-app .tex-editor-footer{
          display:grid!important;
          gap:7px!important;
          padding:8px 10px 9px!important;
          border-top:1px solid var(--hairline)!important;
          background:var(--surface)!important;
        }
        .tex-work-app .tex-save-state{min-height:16px!important;font-size:9px!important}
        .tex-work-app .tex-editor-actions{
          display:grid!important;
          grid-template-columns:repeat(3,minmax(0,1fr))!important;
          gap:6px!important;
        }
        .tex-work-app .tex-editor-actions button{
          min-width:0!important;
          min-height:38px!important;
          margin:0!important;
          padding:0 6px!important;
          border-radius:11px!important;
          font-size:9px!important;
          white-space:nowrap!important;
          overflow:hidden!important;
          text-overflow:ellipsis!important;
        }

        .tex-work-app .tex-runs-panel{
          flex-direction:column!important;
          gap:0!important;
          overflow:auto!important;
          -webkit-overflow-scrolling:touch;
          background:var(--bg-soft)!important;
          padding-top:env(safe-area-inset-top,0px)!important;
        }
        .tex-work-app .tex-live-preview-card{
          display:grid!important;
          flex:0 0 auto!important;
          gap:9px!important;
          margin:10px!important;
          padding:12px!important;
          border-radius:16px!important;
          background:var(--card)!important;
        }
        .tex-work-app .tex-live-preview-head>strong{font-size:14px!important}
        .tex-work-app .tex-live-preview-toggle{font-size:10px!important}
        .tex-work-app .tex-live-preview-status{font-size:10px!important}
        .tex-work-app .tex-live-preview-viewport{
          height:calc(var(--tex-mobile-vh) - var(--tex-mobile-tabs-h) - 176px)!important;
          min-height:300px!important;
          max-height:720px!important;
          border-radius:12px!important;
          touch-action:pan-x pan-y pinch-zoom;
        }
        .tex-work-app .tex-live-preview-placeholder{padding:26px!important;font-size:11px!important}
        .tex-work-app .tex-live-preview-foot{font-size:9px!important}
        .tex-work-app .tex-live-preview-foot span{max-width:72%!important}
        .tex-work-app .tex-compiler-card{
          margin:0 10px 10px!important;
          padding:12px!important;
          border-radius:15px!important;
          background:var(--card)!important;
        }
        .tex-work-app .tex-runs-head{padding:10px 14px 8px!important}
        .tex-work-app .tex-runs-head strong{font-size:12px!important}
        .tex-work-app .tex-run-list{padding:0 10px 18px!important;overflow:visible!important}
        .tex-work-app #tex-runs-empty{padding:26px 18px!important}

        .tex-mobile-tabs{
          position:absolute!important;
          left:0!important;
          right:0!important;
          bottom:0!important;
          z-index:50!important;
          display:grid!important;
          grid-template-columns:repeat(3,minmax(0,1fr))!important;
          height:var(--tex-mobile-tabs-h)!important;
          padding:4px 8px env(safe-area-inset-bottom,0px)!important;
          border-top:1px solid var(--hairline)!important;
          background:color-mix(in srgb,var(--surface) 88%,transparent)!important;
          -webkit-backdrop-filter:blur(24px) saturate(165%);
          backdrop-filter:blur(24px) saturate(165%);
        }
        .tex-mobile-tab{
          appearance:none!important;
          display:flex!important;
          flex-direction:column!important;
          align-items:center!important;
          justify-content:center!important;
          gap:2px!important;
          min-width:0!important;
          min-height:48px!important;
          margin:0!important;
          padding:3px 4px!important;
          border:0!important;
          border-radius:11px!important;
          background:transparent!important;
          color:var(--quiet)!important;
          box-shadow:none!important;
          font-size:9px!important;
          font-weight:650!important;
          line-height:1.15!important;
          cursor:pointer!important;
          -webkit-tap-highlight-color:transparent;
        }
        .tex-mobile-tab svg{
          width:21px!important;
          height:21px!important;
          fill:none!important;
          stroke:currentColor!important;
          stroke-width:1.8!important;
          stroke-linecap:round!important;
          stroke-linejoin:round!important;
        }
        .tex-mobile-tab[aria-selected="true"]{color:var(--primary)!important}
        .tex-mobile-tab:active{background:var(--fill)!important}
        .tex-mobile-tab:focus-visible{outline:none!important;box-shadow:0 0 0 2px color-mix(in srgb,var(--primary) 28%,transparent)!important}

        body.tex-mobile-keyboard-open .tex-mobile-tabs{opacity:.96}
      }
    </style>
    <script id="qsseda-work-tex-mobile-runtime">
      (() => {
        const shell = document.querySelector('.tex-work-app .tex-shell');
        if (!shell || document.getElementById('tex-mobile-tabs')) return;

        const media = window.matchMedia('(max-width:760px), (max-width:950px) and (pointer:coarse)');
        const labels = ${JSON.stringify(copy)};
        const panes = ['documents', 'editor', 'preview'];
        let pane = 'editor';

        try {
          const saved = window.sessionStorage.getItem('qsseda.work.tex.mobile-pane.v1');
          if (panes.includes(saved)) pane = saved;
        } catch {}

        const tabs = document.createElement('nav');
        tabs.id = 'tex-mobile-tabs';
        tabs.className = 'tex-mobile-tabs';
        tabs.setAttribute('aria-label', ${JSON.stringify(zh ? "TeX 工作区视图" : "TeX workspace views")});
        tabs.innerHTML = [
          ['documents', labels.documents, labels.documentsAria, '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h8l4 4V20.5H6z"></path><path d="M14 3.5v4h4"></path><path d="M9 12h6M9 15.5h5"></path></svg>'],
          ['editor', labels.edit, labels.editAria, '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 8-4 4 4 4"></path><path d="m16 8 4 4-4 4"></path><path d="m14 5-4 14"></path></svg>'],
          ['preview', labels.preview, labels.previewAria, '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h8l4 4V20.5H6z"></path><path d="M14 3.5v4h4"></path><path d="M8.5 15h7"></path></svg>']
        ].map(([name, label, aria, icon]) => '<button class="tex-mobile-tab" type="button" role="tab" data-mobile-pane="' + name + '" aria-label="' + aria + '">' + icon + '<span>' + label + '</span></button>').join('');
        shell.append(tabs);

        const buttons = [...tabs.querySelectorAll('[data-mobile-pane]')];

        function setPane(next, persist = true) {
          if (!panes.includes(next)) next = 'editor';
          pane = next;
          shell.dataset.mobilePane = pane;
          for (const button of buttons) {
            const active = button.dataset.mobilePane === pane;
            button.setAttribute('aria-selected', String(active));
            button.tabIndex = active ? 0 : -1;
          }
          if (persist) {
            try { window.sessionStorage.setItem('qsseda.work.tex.mobile-pane.v1', pane); } catch {}
          }
          window.requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
        }

        for (const button of buttons) {
          button.addEventListener('click', () => setPane(button.dataset.mobilePane || 'editor'));
        }

        const documentList = document.getElementById('tex-document-list');
        documentList?.addEventListener('click', event => {
          if (!media.matches || !event.target.closest('.tex-document-item')) return;
          window.setTimeout(() => setPane('editor'), 0);
        });

        const createButton = document.getElementById('tex-create');
        createButton?.addEventListener('click', () => {
          if (!media.matches) return;
          window.setTimeout(() => setPane('editor'), 120);
        });

        function updateViewport() {
          if (!media.matches) {
            document.documentElement.style.removeProperty('--tex-mobile-vh');
            document.body.classList.remove('tex-mobile-keyboard-open');
            return;
          }
          const viewport = window.visualViewport;
          const height = Math.max(320, Math.round(viewport?.height || window.innerHeight));
          document.documentElement.style.setProperty('--tex-mobile-vh', height + 'px');
          const keyboardOpen = Boolean(viewport && window.innerHeight - viewport.height > 140);
          document.body.classList.toggle('tex-mobile-keyboard-open', keyboardOpen);
        }

        function syncMode() {
          if (media.matches) {
            setPane(pane, false);
            updateViewport();
          } else {
            shell.removeAttribute('data-mobile-pane');
            document.documentElement.style.removeProperty('--tex-mobile-vh');
            document.body.classList.remove('tex-mobile-keyboard-open');
          }
        }

        media.addEventListener?.('change', syncMode);
        window.visualViewport?.addEventListener('resize', updateViewport, { passive: true });
        window.visualViewport?.addEventListener('scroll', updateViewport, { passive: true });
        window.addEventListener('orientationchange', () => window.setTimeout(updateViewport, 100), { passive: true });
        window.addEventListener('resize', updateViewport, { passive: true });

        syncMode();
      })();
    </script>`;
}