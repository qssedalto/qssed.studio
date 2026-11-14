// Final, strictly visual Work TeX refinements. All SVGs remain vector DOM nodes;
// only the command bar scrolls, and existing ACL/editor/compiler handlers stay put.
export function enhanceWorkTexUiPolish(markup, zh) {
  const text = zh ? {
    wrap: '自动换行', noWrap: '关闭自动换行'
  } : { wrap: 'Word wrap', noWrap: 'Disable word wrap' };
  const css = `
    /* Design-system glyphs use equal 24px viewports and follow site appearance. */
    .tex-work-app #tex-code-theme-toggle .tex-code-theme-swatch,
    .tex-work-app #tex-code-theme-toggle .tex-code-theme-caret {display:none!important}
    .tex-work-app #tex-code-theme-toggle .tex-palette-glyph {width:24px;height:24px;flex:0 0 24px;display:inline-grid;place-items:center;line-height:0}
    .tex-work-app #tex-code-theme-toggle .tex-palette-glyph svg {width:24px;height:24px;display:block;overflow:visible}
    .tex-work-app #tex-code-theme-toggle .tex-palette-glyph-dark {display:none!important}
    :root[data-theme="dark"] .tex-work-app #tex-code-theme-toggle .tex-palette-glyph-dark {display:inline-grid!important}
    :root[data-theme="dark"] .tex-work-app #tex-code-theme-toggle .tex-palette-glyph-light {display:none!important}
    .tex-work-app #tex-code-theme-toggle {gap:8px!important}
    .tex-work-app #tex-code-theme-toggle>span:not(.tex-palette-glyph) {min-width:0;white-space:nowrap}

    /* The status indicator belongs before the title, not next to the Home link. */
    .tex-work-app .tex-static-title-row>.tex-build-indicator {order:0!important;align-self:flex-start!important}
    .tex-work-app .tex-static-title-row>.tex-static-title-stack {order:1!important}
    .tex-work-app .tex-static-title-row>.tex-build-log {order:2!important}

    /* Consistent circular Play SVG; align geometrically to the 39px command grid. */
    body.os-shell:has(.tex-work-app) .tex-work-app .tex-compile-fixed>.tex-compile-vector {
      display:grid!important;place-items:center!important;top:0!important;left:0!important;
      width:39px!important;height:39px!important;inset:0 auto auto 0!important;
    }
    body.os-shell:has(.tex-work-app) .tex-work-app .tex-compile-fixed>.tex-compile-vector svg {
      width:33px!important;height:33px!important;display:block!important;overflow:visible!important;
    }
    .tex-work-app .tex-editor-commandbar #tex-word-wrap-toggle {
      display:grid!important;place-items:center!important;flex:0 0 39px!important;
      box-sizing:border-box!important;width:39px!important;min-width:39px!important;
      max-width:39px!important;height:39px!important;margin:0!important;padding:0!important;
    }
    .tex-work-app #tex-word-wrap-toggle svg {
      width:27px!important;height:27px!important;display:block!important;fill:none!important;
      stroke:currentColor!important;stroke-width:1.75!important;
      stroke-linecap:round!important;stroke-linejoin:round!important;
    }
    .tex-work-app #tex-word-wrap-toggle[aria-pressed="true"] {
      color:var(--primary)!important;background:color-mix(in srgb,var(--primary) 10%,transparent)!important;
    }
    .tex-work-app #tex-word-wrap-toggle:focus-visible {outline:2px solid var(--primary)!important;outline-offset:-3px!important}

    /* Markdown uses the same single-line header layout as main.tex. */
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-editor>.tex-editor-toolbar>.tex-markdown-view-modes:not([hidden]) {
      grid-column:1!important;grid-row:2!important;align-self:end!important;
      width:100%!important;min-width:0!important;margin:0!important;
    }
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-editor>.tex-editor-toolbar>.tex-markdown-view-modes[hidden] {display:none!important}
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-editor.is-asset-mode>.tex-editor-toolbar>.tex-editor-choice-label:not(.tex-markdown-view-modes) {display:none!important}
    @container aertex-editor (max-width:620px) {
      body.os-shell:has(.tex-work-app) .tex-work-app #tex-editor>.tex-editor-toolbar>.tex-markdown-view-modes:not([hidden]) {
        grid-column:1!important;grid-row:2!important;
      }
    }

    /* Project and child-folder SVGs share the same optical size and palette. */
    .tex-work-app #tex-document-list svg.aertex-project-grid-icon,
    .tex-work-app #tex-document-list svg.aertex-project-book-icon {
      display:block!important;width:20px!important;height:20px!important;min-width:20px!important;
      flex:0 0 20px!important;margin:0!important;fill:none!important;
      color:#606770!important;stroke:currentColor!important;stroke-width:1.9!important;
      stroke-linecap:round!important;stroke-linejoin:round!important;
    }
    :root[data-theme="dark"] .tex-work-app #tex-document-list svg.aertex-project-grid-icon,
    :root[data-theme="dark"] .tex-work-app #tex-document-list svg.aertex-project-book-icon {
      color:#9fa5af!important;
    }

    /* Compact Windows Explorer tree: one vertical rhythm, 18px per nested level.
       Do not change font sizes, row menu interactions, or drag / file ACL. */
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-document-list > .tex-document-item {
      min-height:34px!important;height:34px!important;padding-block:3px!important;
      margin:0!important;
    }
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-document-list .tex-tree-file,
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-document-list .tex-tree-folder {
      min-height:30px!important;height:30px!important;margin:0!important;
      padding-block:2px!important;line-height:1.2!important;gap:5px!important;
    }
    /* Empty disclosure slot aligns document and folder glyphs at each depth. */
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-document-list .tex-tree-file::before {
      content:"";display:block;flex:0 0 17px;width:17px;height:1px;
      pointer-events:none;
    }
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-document-list .tex-tree-children {
      margin:0 0 1px 14px!important;padding:0 0 0 4px!important;
    }
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-document-list .tex-tree-folder-children {
      margin:0 0 0 13px!important;padding:0 0 0 5px!important;
    }
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-document-list .tex-tree-children > div,
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-document-list .tex-tree-folder-children > div {
      margin:0!important;padding:0!important;min-height:0!important;
    }
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-document-list .tex-tree-folder > .tex-project-chevron {
      flex:0 0 17px!important;width:17px!important;height:26px!important;
    }
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-document-list .tex-tree-document-icon,
    body.os-shell:has(.tex-work-app) .tex-work-app .tex-source-label .tex-tree-document-icon {
      display:block!important;flex:0 0 18px!important;width:18px!important;
      height:20px!important;min-width:18px!important;max-width:18px!important;
      color:#606770!important;fill:none!important;stroke:currentColor!important;
    }
    :root[data-theme="dark"] body.os-shell:has(.tex-work-app) .tex-work-app #tex-document-list .tex-tree-document-icon,
    :root[data-theme="dark"] body.os-shell:has(.tex-work-app) .tex-work-app .tex-source-label .tex-tree-document-icon {
      color:#9fa5af!important;
    }
    /* Native Windows background-working pointer. No visible in-page loader. */
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-document-list.is-tree-loading,
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-document-list.is-tree-loading * {
      cursor:progress!important;
    }
    .tex-work-app .tex-project-chevron:focus:not(:focus-visible){outline:none!important;box-shadow:none!important}
    .tex-work-app .tex-project-chevron:focus-visible{outline:2px solid var(--primary)!important;outline-offset:0!important;border-radius:4px!important}

    .tex-work-app .tex-link-panel .tex-link-intro {padding:13px 14px 10px!important;}
    /* Native radio controls should never inherit the site's wide text-input box. */
    .tex-work-app .tex-link-panel .tex-link-choice {
      display:grid!important;grid-template-columns:20px minmax(0,1fr)!important;
      align-items:center!important;column-gap:13px!important;
      padding:11px 12px!important;min-height:54px!important;box-sizing:border-box!important;
    }
    .tex-work-app .tex-link-panel .tex-link-choice input[type="radio"] {
      appearance:radio!important;-webkit-appearance:radio!important;
      display:block!important;box-sizing:border-box!important;position:static!important;
      width:18px!important;height:18px!important;min-width:18px!important;min-height:18px!important;
      max-width:18px!important;max-height:18px!important;aspect-ratio:1!important;
      padding:0!important;margin:0!important;border:0!important;border-radius:50%!important;
      background:transparent!important;box-shadow:none!important;accent-color:var(--primary)!important;
      transform:none!important;flex:0 0 18px!important;vertical-align:middle!important;
    }
    .tex-work-app .tex-link-panel .tex-link-fieldset {
      min-width:0!important;margin:0!important;padding:13px 13px 9px!important;
      border-radius:14px!important;
    }
    .tex-work-app .tex-link-panel .tex-link-fieldset>legend {
      margin-left:9px!important;padding:0 9px!important;max-width:calc(100% - 18px)!important;
    }
    .tex-work-app .tex-link-panel .tex-link-choice span {min-width:0!important;gap:3px!important}
    .tex-work-app .tex-link-panel .tex-link-choice small {overflow-wrap:break-word!important}

    /* Remove the unwanted bright paper border/background on PDF dark pages;
       do not filter the PDF canvas or recolor images. */
    :root[data-theme="dark"] body.os-shell:has(.tex-work-app) .tex-work-app .tex-live-preview-viewport,
    :root[data-theme="dark"] body.os-shell:has(.tex-work-app) .tex-work-app .aertex-pdf-reader,
    :root[data-theme="dark"] body.os-shell:has(.tex-work-app) .tex-work-app .aertex-pdf-pages {
      background:#1b1c20!important;border-color:#303238!important;
    }
    :root[data-theme="dark"] body.os-shell:has(.tex-work-app) .tex-work-app .aertex-pdf-page {
      background:#202126!important;outline:0!important;border:0!important;
      box-shadow:0 1px 7px rgba(0,0,0,.32)!important;
    }
    /* The native PDF iframe remains behind the PDF.js reader and used to
       paint a bright rectangular layer while the overlay initializes.
       Only change the iframe's chrome, never the PDF pixels. */
    :root[data-theme="dark"] body.os-shell:has(.tex-work-app) .tex-work-app #tex-live-preview-frame {
      background:#1b1c20!important;color-scheme:dark!important;
    }
    :root[data-theme="dark"] body.os-shell:has(.tex-work-app) .tex-work-app .aertex-pdf-page>canvas {
      display:block!important;background:transparent!important;filter:none!important;
    }
    .aertex-filechat .banner:empty{display:none!important}
    .tex-work-app #tex-editor.tex-word-wrap-off .tex-inline-file-viewer textarea{white-space:pre!important;overflow-wrap:normal!important}
    /* The full CRDT diagnostics paragraph is not UI copy; live editor stays active. */
    .tex-work-app .tex-collaboration-page[data-page="live"] .tex-collaboration-state {display:none!important}
  `;
  const script = `
    (() => {
      const root=document.querySelector('.tex-work-app[data-tex-root]');
      if(!root || window.__aertexWorkTexUiPolished) return;
      window.__aertexWorkTexUiPolished=true;
      const tr=${JSON.stringify(text)};
      const palette=document.getElementById('tex-code-theme-toggle');
      // Preserve the supplied paths and geometry. viewBox crops unequal
      // transparent padding rather than stretching or redrawing the subjects.
      const paletteDark='<span class="tex-palette-glyph tex-palette-glyph-dark" aria-hidden="true"><svg viewBox="30 14 65 65" focusable="false"><circle cx="62.5" cy="46.5" r="31.5" fill="#080808" stroke="#fafafa" stroke-width=".55"/><path d="M 62.5,21.0 A 25.5,25.5 0 0 1 62.5,72.0 L 62.5,58.9 A 12.4,12.4 0 0 0 62.5,34.1 Z" fill="#fff"/><path d="M 62.5,34.1 A 12.4,12.4 0 0 0 62.5,58.9 Z" fill="#fff"/></svg></span>';
      const paletteLight='<span class="tex-palette-glyph tex-palette-glyph-light" aria-hidden="true"><svg viewBox="25.5 38.5 64 64" focusable="false"><circle cx="57.5" cy="70.5" r="31.25" fill="#fff" stroke="#454b55" stroke-width=".55"/><path d="M 57.5,45.0 A 25.5,25.5 0 0 0 57.5,96.0 L 57.5,82.9 A 12.4,12.4 0 0 1 57.5,58.1 Z" fill="#000"/><path d="M 57.5,58.1 A 12.4,12.4 0 0 1 57.5,82.9 Z" fill="#000"/></svg></span>';
      function updatePalette(){
        const button=document.getElementById('tex-code-theme-toggle');
        if(!button||button.querySelector('.tex-palette-glyph'))return;
        button.insertAdjacentHTML('afterbegin',paletteLight+paletteDark);
      }
      function updateBuildIcon(){
        const row=root.querySelector('.tex-static-title-row');
        const indicator=row?.querySelector('.tex-build-indicator');
        const title=row?.querySelector('.tex-static-title-stack');
        if(row&&indicator&&title&&indicator.nextElementSibling!==title)row.insertBefore(indicator,title);
      }
      const grid='<svg class="aertex-project-grid-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="2.7" y="2.7" width="18.6" height="18.6" rx="1.15"/><path d="M8.8 3.5v17M9.0 9.1h11.6"/></svg>';
      const book='<svg class="aertex-project-book-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20c-2.25-1.78-4.53-2.48-9.3-2.15V4.1C6.3 3.9 9.55 4.65 12 6.65c2.45-2 5.7-2.75 9.3-2.55v13.75C16.53 17.52 14.25 18.22 12 20Z"/><path d="M12 6.65V20"/></svg>';
      const list=document.getElementById('tex-document-list');
      const template=document.createElement('template');
      function glyph(html){template.innerHTML=html;return template.content.firstElementChild;}
      function updateTree(){
        if(!list)return;
        for(const row of list.querySelectorAll(':scope > .tex-document-item')){
          const original=row.querySelector(':scope > svg.tex-project-folder-icon');
          if(original)original.replaceWith(glyph(grid));
        }
        for(const row of list.querySelectorAll('.tex-tree-folder')){
          const original=row.querySelector(':scope > svg.tex-project-folder-icon');
          if(original)original.replaceWith(glyph(book));
        }
      }
      let pending=false;
      function scheduleTree(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;updateTree()});}
      if(list){
        const observer=new MutationObserver(scheduleTree);
        observer.observe(list,{childList:true,subtree:true});
        window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
      }
      function readWrap(){try{return localStorage.getItem('aertex.tex.word-wrap.v1')!=='0'}catch{return true}}
      const commands=root.querySelector('.tex-editor-commandbar');
      function createWrap(){
        if(!commands||commands.querySelector('#tex-word-wrap-toggle'))return;
        const button=document.createElement('button');
        button.id='tex-word-wrap-toggle';button.type='button';
        button.className='tex-editor-command tex-command-wrap';
        button.innerHTML='<svg viewBox="0 0 28 28" aria-hidden="true" focusable="false"><path d="M3.3 6.1H24.2M3.3 11.5H20.5a4.2 4.2 0 0 1 0 8.4h-5.3"/><path d="m18.5 16.9-3.9 3 3.9 3"/><path d="M3.3 17.2h8.1M3.3 22.5h8.1"/></svg>';
        const sync=()=>{
          const on=readWrap();button.setAttribute('aria-pressed',String(on));
          button.title=on?tr.noWrap:tr.wrap;
          button.setAttribute('aria-label',button.title);
        };
        button.addEventListener('click',()=>{
          const enabled=!readWrap();
          try{localStorage.setItem('aertex.tex.word-wrap.v1',enabled?'1':'0')}catch{}
          document.dispatchEvent(new CustomEvent('aertex:tex-word-wrap',{detail:{enabled}}));
          sync();
        });
        sync();commands.appendChild(button);
        document.dispatchEvent(new CustomEvent('aertex:tex-word-wrap',{detail:{enabled:readWrap()}}));
      }
      function initialize(){
        updatePalette();updateBuildIcon();updateTree();createWrap();
      }
      if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});
      else initialize();
      // Async CodeMirror and explorer handlers add children after DOM ready.
      let retry=0;
      const refresh=()=>{
        updatePalette();updateBuildIcon();createWrap();
        if(++retry<16&&(!document.querySelector('.tex-palette-glyph')||!document.querySelector('#tex-word-wrap-toggle')))
          window.setTimeout(refresh,100);
      };
      window.setTimeout(refresh,100);
    })();
  `;
  return String(markup||'').replace('</head>', '<style id="aertex-tex-ui-polish">'+css+'</style></head>')
    .replace('</body>', '<script id="aertex-tex-ui-polish-runtime">'+script+'</script></body>');
}
