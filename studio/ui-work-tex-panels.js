import { enhanceWorkTexMobile } from "./ui-work-tex-mobile.js";
import { enhanceWorkTexMobileTools } from "./ui-work-tex-mobile-tools.js";
import { enhanceWorkTexMobileApple } from "./ui-work-tex-mobile-apple.js";
import { enhanceWorkTexDesktopTypography } from "./ui-work-tex-desktop-type.js";
import { enhanceWorkTexCollaboration } from "./ui-work-tex-collaboration-instant.js";

export function enhanceWorkTexCollapsiblePanels(markup, zh) {
  const copy = zh ? {
    collapseDocuments: "隐藏文档栏",
    expandDocuments: "展开文档栏",
    collapsePreview: "隐藏预览栏",
    expandPreview: "展开预览栏",
    expandPdf: "放大 PDF 预览",
    restorePdf: "退出全屏预览"
  } : {
    collapseDocuments: "Hide documents panel",
    expandDocuments: "Show documents panel",
    collapsePreview: "Hide preview panel",
    expandPreview: "Show preview panel",
    expandPdf: "Expand PDF preview",
    restorePdf: "Exit full preview"
  };

  let output = String(markup || "");

  output = output.replace(
    /<div class="tex-panel-head"><strong>([^<]*)<\/strong><span id="tex-document-count">0<\/span><\/div>/,
    (_match, label) => `<div class="tex-panel-head"><div class="tex-panel-title"><strong>${label}</strong><span id="tex-document-count">0</span></div><button id="tex-left-panel-toggle" class="tex-side-toggle tex-left-panel-toggle" type="button" aria-expanded="true" title="${copy.collapseDocuments}">−</button></div>`
  );

  output = output.replace(
    '<aside class="tex-runs-panel">',
    `<aside class="tex-runs-panel"><button id="tex-right-panel-toggle" class="tex-side-toggle tex-right-panel-toggle" type="button" aria-expanded="true" title="${copy.collapsePreview}">−</button>`
  );

  output += `
    <style id="qsseda-work-tex-collapsible-panels">
      .tex-work-app .tex-panel-head{justify-content:flex-start!important}
      .tex-work-app .tex-panel-title{display:flex;align-items:center;gap:8px;min-width:0}
      .tex-work-app .tex-panel-title strong{white-space:nowrap}
      .tex-work-app #tex-editor-placeholder[hidden]{display:none!important}
      .tex-work-app .tex-side-toggle{
        display:grid!important;
        place-items:center!important;
        width:28px!important;
        min-width:28px!important;
        height:28px!important;
        min-height:28px!important;
        margin:0!important;
        padding:0!important;
        border:0!important;
        border-radius:9px!important;
        background:var(--surface)!important;
        color:var(--muted)!important;
        box-shadow:inset 0 0 0 1px var(--border)!important;
        font-size:16px!important;
        font-weight:500!important;
        line-height:1!important;
        cursor:pointer!important;
        transition:background .16s ease,color .16s ease,box-shadow .16s ease,transform .16s ease!important;
      }
      .tex-work-app .tex-side-toggle:hover{
        background:var(--card)!important;
        color:var(--text)!important;
        box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 28%,var(--border))!important;
      }
      .tex-work-app .tex-side-toggle:active{transform:scale(.94)}
      .tex-work-app .tex-side-toggle:focus-visible{
        outline:none!important;
        box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 14%,transparent),inset 0 0 0 1px var(--primary)!important;
      }
      .tex-work-app .tex-left-panel-toggle{margin-left:auto!important}
      .tex-work-app .tex-runs-panel{position:relative}
      .tex-work-app .tex-right-panel-toggle{position:absolute!important;top:16px!important;left:16px!important;z-index:6}
      .tex-work-app .tex-runs-panel .tex-live-preview-head{padding-left:34px}
      .tex-work-app .tex-live-preview-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-left:auto}
      .tex-work-app .tex-preview-expand{
        display:grid;
        place-items:center;
        width:28px;
        min-width:28px;
        height:28px;
        min-height:28px;
        margin:0;
        padding:0;
        border:0;
        border-radius:9px;
        background:var(--fill);
        color:var(--muted);
        box-shadow:inset 0 0 0 1px var(--border);
        cursor:pointer;
        transition:background .16s ease,color .16s ease,box-shadow .16s ease,transform .16s ease;
      }
      .tex-work-app .tex-preview-expand svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      .tex-work-app .tex-preview-expand:hover{background:var(--surface-strong);color:var(--text);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 28%,var(--border))}
      .tex-work-app .tex-preview-expand:active{transform:scale(.94)}
      .tex-work-app .tex-preview-expand:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 14%,transparent),inset 0 0 0 1px var(--primary)}
      body.tex-preview-expanded{overflow:hidden!important}
      body.tex-preview-expanded .tex-live-preview-card.is-expanded{
        position:fixed!important;
        inset:8px!important;
        z-index:2147483000!important;
        width:auto!important;
        height:auto!important;
        min-height:0!important;
        margin:0!important;
        padding:14px!important;
        border-radius:20px!important;
        background:var(--surface)!important;
        box-shadow:0 24px 80px rgba(0,0,0,.22),inset 0 0 0 1px var(--border)!important;
        grid-template-rows:auto auto minmax(0,1fr) auto!important;
      }
      body.tex-preview-expanded .tex-live-preview-card.is-expanded .tex-live-preview-head{padding-left:0!important}
      body.tex-preview-expanded .tex-live-preview-card.is-expanded .tex-live-preview-viewport{height:auto!important;min-height:0!important}
      body.tex-preview-expanded .tex-live-preview-card.is-expanded #tex-live-preview-frame{width:100%!important;height:100%!important}

      @media(min-width:1081px){
        .tex-work-app .tex-shell{
          grid-template-columns:230px minmax(420px,1fr) minmax(350px,.82fr)!important;
          transition:grid-template-columns .2s ease!important;
        }
        .tex-work-app .tex-runs-panel{
          display:flex!important;
          flex-direction:column!important;
          min-height:0!important;
          overflow-x:hidden!important;
          overflow-y:auto!important;
          overscroll-behavior:contain;
          scrollbar-gutter:stable;
        }
        .tex-work-app .tex-live-preview-card{
          flex:0 0 calc(100% - 18px)!important;
          width:auto!important;
          height:calc(100% - 18px)!important;
          min-height:calc(100% - 18px)!important;
          grid-template-rows:auto auto minmax(0,1fr) auto!important;
        }
        .tex-work-app .tex-live-preview-viewport{
          height:auto!important;
          min-height:0!important;
        }
        .tex-work-app #tex-live-preview-frame{
          display:block!important;
          width:100%!important;
          height:100%!important;
          min-width:100%!important;
          min-height:100%!important;
          border:0!important;
          background:#fff!important;
        }
        .tex-work-app #tex-live-preview-frame[hidden]{display:none!important}
        .tex-work-app .tex-compiler-card{flex:0 0 auto!important}
        .tex-work-app .tex-run-list{flex:0 0 auto!important;min-height:240px!important}
        .tex-work-app .tex-shell.is-left-collapsed{
          grid-template-columns:44px minmax(420px,1fr) minmax(350px,.82fr)!important;
        }
        .tex-work-app .tex-shell.is-right-collapsed{
          grid-template-columns:230px minmax(420px,1fr) 44px!important;
        }
        .tex-work-app .tex-shell.is-left-collapsed.is-right-collapsed{
          grid-template-columns:44px minmax(0,1fr) 44px!important;
        }

        .tex-work-app .tex-shell.is-left-collapsed .tex-documents-panel{
          background:color-mix(in srgb,var(--fill) 88%,var(--surface));
        }
        .tex-work-app .tex-shell.is-left-collapsed .tex-documents-panel>.tex-panel-head{
          flex-direction:column!important;
          align-items:center!important;
          justify-content:flex-start!important;
          gap:8px!important;
          padding:10px 7px!important;
        }
        .tex-work-app .tex-shell.is-left-collapsed .tex-documents-panel>.tex-panel-head .tex-panel-title,
        .tex-work-app .tex-shell.is-left-collapsed .tex-documents-panel>:not(.tex-panel-head){
          display:none!important;
        }
        .tex-work-app .tex-shell.is-left-collapsed .tex-left-panel-toggle{
          order:1!important;
          margin-left:0!important;
        }
        /* The 44px collapsed rail has room only for the expand toggle. */
        .tex-work-app .tex-shell.is-left-collapsed .tex-documents-panel>.tex-panel-head .tex-panel-home-link{
          display:none!important;
        }

        .tex-work-app .tex-shell.is-right-collapsed .tex-runs-panel{
          background:color-mix(in srgb,var(--fill) 88%,var(--surface));
        }
        .tex-work-app .tex-shell.is-right-collapsed .tex-runs-panel>:not(.tex-right-panel-toggle){
          display:none!important;
        }
        .tex-work-app .tex-shell.is-right-collapsed .tex-right-panel-toggle{
          top:10px!important;
          left:8px!important;
        }

        .tex-work-app .tex-shell.is-left-collapsed .tex-documents-panel,
        .tex-work-app .tex-shell.is-right-collapsed .tex-runs-panel{
          overflow:hidden!important;
        }
        .tex-work-app .tex-shell.is-left-collapsed .tex-editor-panel,
        .tex-work-app .tex-shell.is-right-collapsed .tex-editor-panel{
          min-width:0!important;
        }
      }

      @media(max-width:1080px){
        .tex-work-app .tex-side-toggle{display:none!important}
        .tex-work-app .tex-preview-expand{display:none!important}
        .tex-work-app .tex-runs-panel .tex-live-preview-head{padding-left:0}
      }
    </style>
    <script id="qsseda-work-tex-panel-layout">
      (() => {
        const shell = document.querySelector('.tex-work-app .tex-shell');
        const leftButton = document.getElementById('tex-left-panel-toggle');
        const rightButton = document.getElementById('tex-right-panel-toggle');
        if (!shell || !leftButton || !rightButton) return;

        const storageKey = 'qsseda.work.tex.panel-layout.v1';
        const labels = ${JSON.stringify(copy)};
        const state = { left: false, right: false };

        try {
          const saved = JSON.parse(window.localStorage.getItem(storageKey) || '{}');
          state.left = saved?.left === true;
          state.right = saved?.right === true;
        } catch {}

        const persist = () => {
          try { window.localStorage.setItem(storageKey, JSON.stringify(state)); } catch {}
        };

        const apply = () => {
          shell.classList.toggle('is-left-collapsed', state.left);
          shell.classList.toggle('is-right-collapsed', state.right);

          leftButton.textContent = state.left ? '＋' : '−';
          leftButton.setAttribute('aria-expanded', String(!state.left));
          leftButton.setAttribute('aria-label', state.left ? labels.expandDocuments : labels.collapseDocuments);
          leftButton.title = state.left ? labels.expandDocuments : labels.collapseDocuments;

          rightButton.textContent = state.right ? '＋' : '−';
          rightButton.setAttribute('aria-expanded', String(!state.right));
          rightButton.setAttribute('aria-label', state.right ? labels.expandPreview : labels.collapsePreview);
          rightButton.title = state.right ? labels.expandPreview : labels.collapsePreview;

          window.requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
        };

        leftButton.addEventListener('click', () => {
          state.left = !state.left;
          persist();
          apply();
        });

        rightButton.addEventListener('click', () => {
          state.right = !state.right;
          persist();
          apply();
        });

        apply();
      })();
    </script>
    <script id="qsseda-work-tex-preview-layout">
      (() => {
        const labels = ${JSON.stringify(copy)};
        const previewCard = document.getElementById('tex-live-preview-card');
        const previewHead = previewCard?.querySelector('.tex-live-preview-head');
        const previewToggle = previewHead?.querySelector('.tex-live-preview-toggle');
        const previewFrame = document.getElementById('tex-live-preview-frame');
        if (!previewCard || !previewHead || !previewToggle || !previewFrame) return;

        previewFrame.classList.add('tex-live-preview-frame');

        const actions = document.createElement('div');
        actions.className = 'tex-live-preview-actions';
        previewToggle.before(actions);
        actions.append(previewToggle);

        const expandButton = document.createElement('button');
        expandButton.id = 'tex-preview-expand';
        expandButton.className = 'tex-preview-expand';
        expandButton.type = 'button';
        expandButton.setAttribute('aria-expanded', 'false');
        expandButton.setAttribute('aria-label', labels.expandPdf);
        expandButton.title = labels.expandPdf;
        expandButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg>';
        actions.append(expandButton);

        const setExpanded = expanded => {
          previewCard.classList.toggle('is-expanded', expanded);
          document.body.classList.toggle('tex-preview-expanded', expanded);
          expandButton.setAttribute('aria-expanded', String(expanded));
          expandButton.setAttribute('aria-label', expanded ? labels.restorePdf : labels.expandPdf);
          expandButton.title = expanded ? labels.restorePdf : labels.expandPdf;
          expandButton.innerHTML = expanded
            ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6"/></svg>'
            : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg>';
          window.requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
        };

        expandButton.addEventListener('click', () => {
          setExpanded(!previewCard.classList.contains('is-expanded'));
        });

        document.addEventListener('keydown', event => {
          if (event.key === 'Escape' && previewCard.classList.contains('is-expanded')) setExpanded(false);
        });

        // PDF URL fragments are managed by the dedicated preview toolbar.
        // Do not force '#zoom=page-width': Chromium parses zoom as a numeric
        // percentage, and that unrecognized value broke reliable page fitting.
      })();
    </script>`;

  output = enhanceWorkTexDesktopTypography(output);
  output = enhanceWorkTexMobileApple(enhanceWorkTexMobileTools(enhanceWorkTexMobile(output, zh), zh));
  // The final stylesheet loads AFTER collaboration/mobile rules; it must use
  // the same compact 38px desktop height as ui-work-tex-desktop-type.js.
  // A stale 64px override here previously superseded that earlier fix.
  return enhanceWorkTexCollaboration(output, zh) + `
    <style id="qsseda-work-tex-toolbar-final-height">
      @media (min-width:951px), (min-width:761px) and (pointer:fine){
        .tex-work-app .tex-editor-toolbar{align-items:flex-end!important}
        .tex-work-app .tex-editor-toolbar>label{align-self:flex-end!important;margin-block:0!important}
        .tex-work-app .tex-editor-toolbar>label>#tex-engine,
        .tex-work-app .tex-editor-toolbar>#tex-collaboration-open,
        .tex-work-app .tex-editor-toolbar>.tex-panel-home-link{
          box-sizing:border-box!important;
          height:38px!important;
          min-height:38px!important;
          max-height:38px!important;
          padding-block:0!important;
          margin-block:0!important;
          align-self:flex-end!important;
        }
      }
      @media (max-width:760px), (max-width:950px) and (pointer:coarse){
        .tex-work-app .tex-editor-toolbar>label>#tex-engine,
        .tex-work-app .tex-editor-toolbar>#tex-collaboration-open,
        .tex-work-app .tex-editor-toolbar>.tex-panel-home-link{
          box-sizing:border-box!important;
          height:42px!important;
          min-height:42px!important;
          max-height:42px!important;
        }
      }
    </style>`;
}
