import { enhanceWorkTexMobile } from "./ui-work-tex-mobile.js";
import { enhanceWorkTexMobileTools } from "./ui-work-tex-mobile-tools.js";
import { enhanceWorkTexMobileApple } from "./ui-work-tex-mobile-apple.js";
import { enhanceWorkTexDesktopTypography } from "./ui-work-tex-desktop-type.js";

export function enhanceWorkTexCollapsiblePanels(markup, zh) {
  const copy = zh ? {
    collapseDocuments: "隐藏文档栏",
    expandDocuments: "展开文档栏",
    collapsePreview: "隐藏预览栏",
    expandPreview: "展开预览栏"
  } : {
    collapseDocuments: "Hide documents panel",
    expandDocuments: "Show documents panel",
    collapsePreview: "Hide preview panel",
    expandPreview: "Show preview panel"
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

      @media(min-width:1081px){
        .tex-work-app .tex-shell{
          grid-template-columns:230px minmax(420px,1fr) minmax(350px,.82fr)!important;
          transition:grid-template-columns .2s ease!important;
        }
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
          justify-content:center!important;
          padding:10px 7px!important;
        }
        .tex-work-app .tex-shell.is-left-collapsed .tex-documents-panel>.tex-panel-head .tex-panel-title,
        .tex-work-app .tex-shell.is-left-collapsed .tex-documents-panel>:not(.tex-panel-head){
          display:none!important;
        }
        .tex-work-app .tex-shell.is-left-collapsed .tex-left-panel-toggle{
          margin-left:0!important;
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
    </script>`;

  output = enhanceWorkTexDesktopTypography(output);
  return enhanceWorkTexMobileApple(enhanceWorkTexMobileTools(enhanceWorkTexMobile(output, zh), zh));
}
