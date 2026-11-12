export function enhanceWorkTexEditorTools(markup, zh) {
  let output = String(markup || "");
  // Route the existing document deletion flow through the same accessible
  // confirmation dialog, so the footer and toolbar cannot disagree.
  output = output.replace(
    "window.confirm(copy.deleteConfirm)",
    "await window.__qssedaTexConfirmDelete?.(activeDocument?.title || title.value || copy.untitled)"
  );
  const copy = zh ? {
    save: "保存",
    saveAs: "另存为",
    undo: "撤销",
    redo: "重做",
    cut: "剪切",
    copy: "复制",
    paste: "粘贴",
    rename: "重命名文档",
    history: "历史版本",
    delete: "删除文件",
    deleteDialogTitle: "删除",
    deleteQuestion: "确定要永久删除以下文件吗？",
    deleteCancel: "取消",
    deleteAction: "删除",
    deleteClose: "关闭",
    saved: "已保存",
    saving: "正在保存…",
    saveFailed: "保存失败",
    saveAsTitle: "另存为新文档",
    saveAsName: "文档名称",
    saveAsNameRequired: "请输入新文档的名称。",
    saveAsFailed: "无法创建文档副本，请检查名称或稍后重试。",
    cancel: "取消",
    create: "另存",
    copySuffix: " 副本",
    copied: "已复制",
    cutFailed: "无法使用剪贴板执行剪切，请选中文本后按 Ctrl+X。",
    copyFailed: "复制失败，请选中文本后按 Ctrl+C。",
    pasteDenied: "浏览器未授权读取剪贴板，请使用 Ctrl+V。",
    historyOpened: "已定位到版本历史"
  } : {
    save: "Save",
    saveAs: "Save As",
    undo: "Undo",
    redo: "Redo",
    cut: "Cut",
    copy: "Copy",
    paste: "Paste",
    rename: "Rename document",
    history: "Version History",
    delete: "Delete document",
    deleteDialogTitle: "Delete",
    deleteQuestion: "Permanently delete the following file?",
    deleteCancel: "Cancel",
    deleteAction: "Delete",
    deleteClose: "Close",
    saved: "Saved",
    saving: "Saving…",
    saveFailed: "Save failed",
    saveAsTitle: "Save as a new document",
    saveAsName: "Document name",
    saveAsNameRequired: "Enter a name for the new document.",
    saveAsFailed: "Could not create a copy. Check the name or try again.",
    cancel: "Cancel",
    create: "Save Copy",
    copySuffix: " Copy",
    copied: "Copied",
    cutFailed: "Clipboard permission denied. Select text and use Ctrl+X.",
    copyFailed: "Copy failed. Select text and use Ctrl+C.",
    pasteDenied: "Clipboard access was denied. Use Ctrl+V instead.",
    historyOpened: "Version history opened"
  };

  return output + `
    <style id="qsseda-work-tex-editor-tools">
      .tex-work-app .tex-source-label{
        min-height:56px!important;
        padding:7px 12px!important;
        display:flex!important;
        align-items:center!important;
        gap:10px!important;
        border-bottom:1px solid var(--hairline)!important;
      }
      .tex-work-app .tex-source-label>span{
        flex:0 0 auto!important;
        font-weight:700!important;
        white-space:nowrap!important;
      }
      .tex-work-app .tex-source-label>div:last-child{
        margin-left:auto!important;
        flex:0 0 auto!important;
        white-space:nowrap!important;
      }
      .tex-editor-commandbar{
        display:flex!important;
        align-items:center!important;
        gap:3px!important;
        flex:1 1 auto!important;
        min-width:0!important;
        overflow-x:auto!important;
        overflow-y:hidden!important;
        scrollbar-width:none!important;
      }
      .tex-editor-commandbar::-webkit-scrollbar{display:none!important}
      .tex-editor-command-separator{
        width:1px!important;
        height:24px!important;
        margin:0 5px!important;
        background:var(--hairline)!important;
        flex:0 0 auto!important;
      }
      .tex-editor-command{
        appearance:none!important;
        position:relative!important;
        isolation:isolate!important;
        flex:0 0 39px!important;
        touch-action:manipulation!important;
        display:grid!important;
        place-items:center!important;
        width:39px!important;
        min-width:39px!important;
        height:39px!important;
        min-height:39px!important;
        margin:0!important;
        padding:0!important;
        border:0!important;
        border-radius:8px!important;
        background:transparent!important;
        color:color-mix(in srgb,var(--text) 74%,var(--surface))!important;
        box-shadow:none!important;
        cursor:pointer!important;
        transition:background .14s ease,color .14s ease,transform .14s ease!important;
      }
      .tex-editor-command:hover:not(:disabled){background:var(--fill)!important;color:color-mix(in srgb,var(--text) 85%,var(--surface))!important}
      .tex-editor-command:active:not(:disabled){transform:scale(.95)!important}
      .tex-editor-command:focus-visible{outline:none!important;box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 14%,transparent)!important}
      .tex-editor-command:disabled{opacity:.30!important;cursor:not-allowed!important;transform:none!important}
      .tex-editor-command svg{width:26px!important;height:26px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.7!important;stroke-linecap:round!important;stroke-linejoin:round!important;vector-effect:non-scaling-stroke!important}
      .tex-editor-command svg{pointer-events:none!important}
      .tex-editor-command svg .tex-icon-accent{stroke:var(--primary)!important}
      .tex-editor-command svg .tex-icon-accent-fill{fill:var(--primary)!important;stroke:none!important}
      /* Rounded, precision-stroked icons stay smooth at fractional pixel sizes. */
      .tex-editor-command svg.tex-smooth-icon{width:30px!important;height:30px!important;fill:none!important;stroke:none!important;overflow:visible!important}
      .tex-editor-command svg.tex-smooth-icon path{fill:none!important;stroke-width:1.65!important;stroke-linecap:round!important;stroke-linejoin:round!important;vector-effect:non-scaling-stroke!important}
      .tex-editor-command svg.tex-smooth-icon .tex-source-gray{fill:none!important;stroke:currentColor!important}
      .tex-editor-command svg.tex-smooth-icon .tex-source-accent{fill:none!important;stroke:var(--primary)!important}
      .tex-editor-command.is-history svg{width:25px!important;height:25px!important}
      .tex-editor-command svg.tex-icon-mirror{transform:scaleX(-1);transform-origin:center}
      .tex-editor-command.is-delete:hover:not(:disabled){background:color-mix(in srgb,var(--danger,#ac4137) 10%,transparent)!important;color:var(--danger,#ac4137)!important}
      .tex-delete-dialog{
        box-sizing:border-box;
        width:min(860px,calc(100vw - 32px));
        max-height:calc(100dvh - 32px);
        padding:0;
        border:1px solid var(--border,#d8d8df);
        border-radius:7px;
        background:var(--surface,#fff);
        color:var(--text,#1c1c22);
        box-shadow:0 24px 80px rgba(0,0,0,.24);
        overflow:auto;
      }
      .tex-delete-dialog::backdrop{background:rgba(10,14,22,.48)}
      .tex-delete-dialog-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 24px;border-bottom:1px solid var(--border,#ddd)}
      .tex-delete-dialog-header strong{font-size:21px;font-weight:730;letter-spacing:-.02em}
      .tex-delete-dialog-close{display:grid;place-items:center;width:32px;height:32px;padding:0;border:0;background:transparent;color:var(--text);cursor:pointer}
      .tex-delete-dialog-close svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
      .tex-delete-dialog-body{padding:24px;min-height:132px}
      .tex-delete-dialog-body p{margin:0 0 20px;color:var(--muted,#616775);font-size:17px;line-height:1.5}
      .tex-delete-dialog-body ul{margin:0;padding-left:29px;color:var(--muted,#616775);font-size:17px;line-height:1.6;overflow-wrap:anywhere}
      .tex-delete-dialog-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px;padding:16px 24px;border-top:1px solid var(--border,#ddd)}
      .tex-delete-dialog-actions button{appearance:none;min-width:80px;min-height:40px;padding:0 18px;border-radius:999px;font:inherit;font-weight:700;font-size:14px;cursor:pointer}
      .tex-delete-dialog-cancel{background:transparent;border:1px solid var(--muted,#687080);color:var(--text)}
      .tex-delete-dialog-confirm{background:var(--danger,#a5453a);border:1px solid transparent;color:#fff}
      .tex-delete-dialog-confirm:hover{filter:brightness(.94)}
      .tex-delete-dialog button:focus-visible{outline:2px solid var(--primary);outline-offset:3px}
      @media(max-width:560px){
        .tex-delete-dialog-header{padding:16px 18px}
        .tex-delete-dialog-body{padding:19px 18px}
        .tex-delete-dialog-actions{padding:14px 18px}
      }

      .tex-save-as-dialog{
        width:min(420px,calc(100vw - 28px));
        padding:0;
        border:0;
        border-radius:20px;
        background:var(--surface);
        color:var(--text);
        box-shadow:0 24px 80px rgba(0,0,0,.28),inset 0 0 0 1px var(--border);
      }
      .tex-save-as-dialog::backdrop{background:rgba(0,0,0,.26);backdrop-filter:blur(3px)}
      .tex-save-as-sheet{display:grid;gap:16px;padding:20px}
      .tex-save-as-sheet strong{font-size:18px;letter-spacing:-.02em}
      .tex-save-as-error{margin:0!important;padding:10px 12px;border-radius:9px;background:color-mix(in srgb,var(--danger,#a5453a) 12%,var(--surface));color:var(--danger,#a5453a);font-size:12px;line-height:1.5}
      .tex-save-as-error[hidden]{display:none!important}
      .tex-save-as-actions button:disabled{opacity:.55;cursor:progress}
      .tex-save-as-sheet label{display:grid;gap:7px;color:var(--muted);font-size:11px}
      .tex-save-as-sheet input{box-sizing:border-box;width:100%;height:44px;margin:0;padding:0 12px;border:0;border-radius:12px;background:var(--fill);color:var(--text);box-shadow:inset 0 0 0 1px var(--border);outline:none}
      .tex-save-as-sheet input:focus{box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 12%,transparent),inset 0 0 0 1px var(--primary)}
      .tex-save-as-actions{display:flex;justify-content:flex-end;gap:8px}
      .tex-save-as-actions button{appearance:none;min-width:76px;height:38px;margin:0;padding:0 14px;border:0;border-radius:10px;background:var(--fill);color:var(--text);font-size:11px;font-weight:700;cursor:pointer}
      .tex-save-as-actions button.is-primary{background:var(--primary);color:#fff}

      /* Browser/iWork-like compact version timeline rows. */
      .tex-run-list.is-version-history{
        gap:0!important;
        padding:0 8px 10px!important;
      }
      .tex-run-list.is-version-history .tex-version-item{
        position:relative!important;
        display:grid!important;
        grid-template-columns:minmax(0,1fr) auto!important;
        grid-template-areas:"top actions" "meta actions"!important;
        align-items:center!important;
        column-gap:9px!important;
        row-gap:2px!important;
        min-height:58px!important;
        margin:0!important;
        padding:7px 8px 7px 17px!important;
        border-radius:8px!important;
        background:transparent!important;
        box-shadow:none!important;
      }
      .tex-run-list.is-version-history .tex-version-item:hover{background:color-mix(in srgb,var(--surface) 72%,transparent)!important}
      .tex-run-list.is-version-history .tex-version-item.is-current{background:color-mix(in srgb,var(--primary) 5%,var(--surface))!important}
      .tex-run-list.is-version-history .tex-version-item:before{left:7px!important;top:18px!important;width:5px!important;height:5px!important}
      .tex-run-list.is-version-history .tex-version-item:after{left:9px!important;top:25px!important;bottom:-7px!important}
      .tex-run-list.is-version-history .tex-version-top{grid-area:top!important;justify-content:flex-start!important;gap:6px!important;min-width:0!important}
      .tex-run-list.is-version-history .tex-version-top strong{font-size:10px!important;line-height:1.25!important}
      .tex-run-list.is-version-history .tex-version-badge{padding:3px 6px!important;font-size:7px!important}
      .tex-run-list.is-version-history .tex-version-preview{display:none!important}
      .tex-run-list.is-version-history .tex-version-meta{
        grid-area:meta!important;
        justify-content:flex-start!important;
        gap:8px!important;
        min-width:0!important;
        font-size:7.5px!important;
      }
      .tex-run-list.is-version-history .tex-version-meta time{margin-left:0!important;white-space:nowrap!important}
      .tex-run-list.is-version-history .tex-version-actions{
        grid-area:actions!important;
        display:flex!important;
        flex-wrap:nowrap!important;
        align-items:center!important;
        justify-content:flex-end!important;
        gap:4px!important;
        margin:0!important;
      }
      .tex-run-list.is-version-history .tex-version-action{
        min-height:26px!important;
        height:26px!important;
        padding:0 7px!important;
        border-radius:7px!important;
        font-size:7px!important;
        white-space:nowrap!important;
      }
      .tex-version-policy{
        margin:0 8px 6px!important;
        padding:6px 8px!important;
        border-radius:8px!important;
        font-size:7.5px!important;
        line-height:1.35!important;
      }
      @media(max-width:1080px){
        .tex-editor-commandbar{overflow-x:auto!important;scrollbar-width:none!important}
        .tex-editor-commandbar::-webkit-scrollbar{display:none!important}
        .tex-work-app .tex-source-label{gap:7px!important;padding-inline:10px!important}
        .tex-run-list.is-version-history .tex-version-item{grid-template-columns:minmax(0,1fr)!important;grid-template-areas:"top" "meta" "actions"!important;min-height:0!important;padding-block:8px!important}
        .tex-run-list.is-version-history .tex-version-actions{justify-content:flex-start!important;margin-top:3px!important}
        .tex-run-list.is-version-history .tex-version-action{height:30px!important;min-height:30px!important;font-size:8px!important}
      }
    </style>
    <script id="qsseda-work-tex-editor-tools-runtime">
      (() => {
        if (window.__qssedaTexEditorToolsReady) return;
        window.__qssedaTexEditorToolsReady = true;
        const labels = ${JSON.stringify(copy)};

        const root = document.querySelector('.tex-work-app[data-tex-root]');
        const sourceLabel = root?.querySelector('.tex-source-label');
        const source = document.getElementById('tex-source');
        const title = document.getElementById('tex-title');
        const engine = document.getElementById('tex-engine');
        const editor = document.getElementById('tex-editor');
        if (!root || !sourceLabel || !source || !title || !engine || !editor) return;

        const activeDocumentId = () => {
          const stored = String(root.dataset.texCollaborationDocumentId || '').trim();
          if (stored) return stored;
          return String(document.querySelector('.tex-document-item.is-active')?.dataset?.texDocumentId || '').trim();
        };

        const api = async (path, options = {}) => {
          const response = await fetch(path, {
            ...options,
            credentials: 'same-origin',
            cache: 'no-store',
            headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json;charset=UTF-8' } : {}), ...(options.headers || {}) }
          });
          const payload = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(payload?.error || labels.saveFailed);
          return payload;
        };

        const showMessage = (text, error = false) => {
          const node = document.getElementById('tex-message');
          if (!node) return;
          node.hidden = !text;
          node.textContent = text || '';
          node.classList.toggle('is-error', Boolean(error));
        };

        const setSaveState = text => {
          const node = document.getElementById('tex-save-state');
          if (node) node.textContent = text;
        };

        const snapshot = () => ({ title: title.value, engine: engine.value, source: source.value });
        const safeName = value => String(value || 'qsseda-tex').replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'qsseda-tex';
        const workDocumentRoute = id => {
          // Preserve the actual route locale (including en-us) on Save As.
          const locale = String(location.pathname.split('/')[1] || 'zh-cn');
          const exempt = location.pathname.includes('/huawei-exempt/') ? 'huawei-exempt/' : '';
          return '/' + locale + '/d/' + exempt + encodeURIComponent(id);
        };

        function createButton(action, name, svg, className = '') {
          const button = document.createElement('button');
          button.type = 'button';
          button.id = 'tex-command-' + action;
          button.dataset.texAction = action;
          button.className = 'tex-editor-command' + (className ? ' ' + className : '');
          button.title = name;
          button.setAttribute('aria-label', name);
          button.innerHTML = svg;
          // An icon click must never be interpreted as an adjacent command or
          // reach a document-level click handler.
          button.addEventListener('click', event => event.stopPropagation());
          return button;
        }

        // Large, independently drawn Windows Explorer-style vector icons.
        // Muted strokes follow the page theme; their colored details use --primary.
        // Reference-matched SVGs with rounded Bezier strokes instead of jagged raster outlines.
        const undoSvg = '<svg class="tex-smooth-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path class="tex-source-gray" d="M4.6 4.5v10.4h10.2"/><path class="tex-source-gray" d="M4.8 14.8 15.6 4.2"/><path class="tex-source-gray" d="M15.4 4.9c6.6 0 11.6 4.9 11.6 11.3 0 3.1-1.4 5.8-4.1 8.5L16.7 30"/></svg>';
        const icons = {
          save: '<svg class="tex-smooth-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path class="tex-source-gray" d="M6.5 3.5h15.2l5.8 5.8v17.8a2.4 2.4 0 0 1-2.4 2.4H6.5a2.4 2.4 0 0 1-2.4-2.4V5.9a2.4 2.4 0 0 1 2.4-2.4Z"/><path class="tex-source-gray" d="M9 3.6v9.3h12.5V3.7M19 6.2v4"/><path class="tex-source-gray" d="M9.1 29V18.8c0-.8.6-1.4 1.4-1.4h11.1c.8 0 1.4.6 1.4 1.4V29"/></svg>',
          // Pencil body is detached from the disk inset: no crossed-out bar.
          saveAs: '<svg class="tex-smooth-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path class="tex-source-gray" d="M7 3.5h14.8l5.2 5.2v10.2M17 29H7a2.5 2.5 0 0 1-2.5-2.5V6A2.5 2.5 0 0 1 7 3.5Z"/><path class="tex-source-gray" d="M9 3.8v9.1h12V3.8M18.8 6.2v4.2M9 27.6v-8.2a1.6 1.6 0 0 1 1.6-1.6H18"/><path class="tex-source-gray" d="m19 25.1 7.4-7.4a2.55 2.55 0 0 1 3.6 3.6l-7.4 7.4-5.3 1.3Z"/><path class="tex-source-gray" d="m24.8 19.3 3.6 3.6"/></svg>',
          cut: '<svg class="tex-smooth-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path class="tex-source-gray" d="M6.6 3.5 18.7 20.9M25.4 3.5 13.2 20.9"/><path class="tex-source-accent" d="M12.5 25.1a4.2 4.2 0 1 1-8.4 0 4.2 4.2 0 0 1 8.4 0ZM27.9 25.1a4.2 4.2 0 1 1-8.4 0 4.2 4.2 0 0 1 8.4 0Z"/></svg>',
          copy: '<svg class="tex-smooth-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path class="tex-source-gray" d="M14 8H10a4 4 0 0 0-4 4v12a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4"/><rect class="tex-source-accent" x="14.5" y="3.5" width="14" height="21" rx="3.5"/></svg>',
          paste: '<svg class="tex-smooth-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path class="tex-source-gray" d="M10.7 6.3H8.5a3.7 3.7 0 0 0-3.7 3.7v17.6a2.5 2.5 0 0 0 2.5 2.5h5M21.3 6.3h1.4a3.7 3.7 0 0 1 3.7 3.7v2.2"/><path class="tex-source-gray" d="M12.8 4.6c0-.8.7-1.5 1.5-1.5h5.1c.8 0 1.5.7 1.5 1.5v3c0 .8-.7 1.5-1.5 1.5h-5.1c-.8 0-1.5-.7-1.5-1.5v-3Z"/><path class="tex-source-accent" d="M18.1 13.2h9.3c.8 0 1.4.6 1.4 1.4v14c0 .8-.6 1.4-1.4 1.4h-9.3c-.8 0-1.4-.6-1.4-1.4v-14c0-.8.6-1.4 1.4-1.4Z"/></svg>',
          rename: '<svg class="tex-smooth-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path class="tex-source-gray" d="M12.5 6.9H9A4.2 4.2 0 0 0 4.8 11v13A4.2 4.2 0 0 0 9 28.2h4M24.3 6.9H25a4.2 4.2 0 0 1 4.2 4.2v13a4.2 4.2 0 0 1-4.2 4.1h-.9"/><path class="tex-source-accent" d="m8.9 23.8 4.7-12 4.7 12M10.4 20h6.4"/><path class="tex-source-accent" d="M20.7 3v26M17.4 3h6.6M17.4 29h6.6"/></svg>',
          delete: '<svg class="tex-smooth-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path class="tex-source-gray" d="M4.2 9.8h23.6M12.1 9.8V7.1a3.1 3.1 0 0 1 3.1-3.1h1.6a3.1 3.1 0 0 1 3.1 3.1v2.7"/><path class="tex-source-gray" d="m7.8 10.1 1.3 16.6a2.5 2.5 0 0 0 2.5 2.3h8.8a2.5 2.5 0 0 0 2.5-2.3l1.3-16.6"/><path class="tex-source-gray" d="M13.2 15.1v9.1M18.8 15.1v9.1"/></svg>',
          undo: undoSvg,
          redo: undoSvg.replace('class="tex-smooth-icon"', 'class="tex-smooth-icon tex-icon-mirror"'),
          history: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5v5h5"/><path d="M5.2 9.6A8 8 0 1 1 4 14"/><path class="tex-icon-accent" d="M12 8v5l3 2"/></svg>'
        };

        const bar = document.createElement('div');
        bar.className = 'tex-editor-commandbar';
        const saveButton = createButton('save', labels.save, icons.save);
        const saveAsButton = createButton('save-as', labels.saveAs, icons.saveAs);
        const undoButton = createButton('undo', labels.undo, icons.undo);
        const redoButton = createButton('redo', labels.redo, icons.redo);
        const cutButton = createButton('cut', labels.cut, icons.cut);
        const copyButton = createButton('copy', labels.copy, icons.copy);
        const pasteButton = createButton('paste', labels.paste, icons.paste);
        const renameButton = createButton('rename', labels.rename, icons.rename);
        const deleteButton = createButton('delete', labels.delete, icons.delete, 'is-delete');
        const historyButton = createButton('history', labels.history, icons.history, 'is-history');
        const separator = () => { const node = document.createElement('span'); node.className = 'tex-editor-command-separator'; node.setAttribute('aria-hidden', 'true'); return node; };
        // Keep the Explorer-style edit group visible first even in narrow editor panes.
        bar.append(cutButton, copyButton, pasteButton, renameButton, deleteButton, separator(), saveButton, saveAsButton, separator(), undoButton, redoButton, separator(), historyButton);
        const counts = sourceLabel.lastElementChild;
        if (counts) sourceLabel.insertBefore(bar, counts);
        else sourceLabel.append(bar);

        const dialog = document.createElement('dialog');
        dialog.className = 'tex-save-as-dialog';
        dialog.innerHTML = '<form class="tex-save-as-sheet"><strong id="tex-save-as-title">' + labels.saveAsTitle + '</strong><label><span>' + labels.saveAsName + '</span><input name="newTitle" maxlength="180" autocomplete="off" required></label><p class="tex-save-as-error" role="alert" hidden></p><div class="tex-save-as-actions"><button type="button" data-action="cancel">' + labels.cancel + '</button><button type="submit" class="is-primary" data-action="create">' + labels.create + '</button></div></form>';
        dialog.setAttribute('aria-labelledby', 'tex-save-as-title');
        document.body.append(dialog);
        const saveAsForm = dialog.querySelector('form');
        const saveAsInput = dialog.querySelector('input');
        const saveAsError = dialog.querySelector('.tex-save-as-error');
        const saveAsCancel = dialog.querySelector('[data-action="cancel"]');
        const saveAsConfirm = dialog.querySelector('[data-action="create"]');
        let saveAsPending = false;

        const deleteDialog = document.createElement('dialog');
        deleteDialog.className = 'tex-delete-dialog';
        deleteDialog.setAttribute('aria-labelledby', 'tex-delete-dialog-title');
        deleteDialog.innerHTML = '<div class="tex-delete-dialog-header"><strong id="tex-delete-dialog-title">' + labels.deleteDialogTitle + '</strong><button type="button" class="tex-delete-dialog-close" aria-label="' + labels.deleteClose + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19"/></svg></button></div>' +
          '<div class="tex-delete-dialog-body"><p>' + labels.deleteQuestion + '</p><ul><li class="tex-delete-file-name"></li></ul></div>' +
          '<div class="tex-delete-dialog-actions"><button type="button" class="tex-delete-dialog-cancel">' + labels.deleteCancel + '</button><button type="button" class="tex-delete-dialog-confirm">' + labels.deleteAction + '</button></div>';
        document.body.append(deleteDialog);
        const deleteFileName = deleteDialog.querySelector('.tex-delete-file-name');
        let resolveDelete = null;
        const closeDelete = accepted => { if (deleteDialog.open) deleteDialog.close(accepted ? 'delete' : 'cancel'); };
        deleteDialog.querySelector('.tex-delete-dialog-close').addEventListener('click', () => closeDelete(false));
        deleteDialog.querySelector('.tex-delete-dialog-cancel').addEventListener('click', () => closeDelete(false));
        deleteDialog.querySelector('.tex-delete-dialog-confirm').addEventListener('click', () => closeDelete(true));
        deleteDialog.addEventListener('click', event => { if (event.target === deleteDialog) closeDelete(false); });
        deleteDialog.addEventListener('close', () => {
          const resolve = resolveDelete;
          resolveDelete = null;
          if (resolve) resolve(deleteDialog.returnValue === 'delete');
        });
        window.__qssedaTexConfirmDelete = filename => {
          if (!activeDocumentId() || root.dataset.texCollaborationAccessRole === 'viewer' ||
              root.dataset.texCollaborationAccessRole === 'editor' || deleteDialog.open) return Promise.resolve(false);
          const name = String(filename || title.value || 'main.tex').trim();
          deleteFileName.textContent = name.toLowerCase().endsWith('.tex') ? name : name + '.tex';
          deleteDialog.returnValue = 'cancel';
          return new Promise(resolve => {
            resolveDelete = resolve;
            try { deleteDialog.showModal(); }
            catch { resolveDelete = null; resolve(false); }
          });
        };

        async function saveNow() {
          const id = activeDocumentId();
          if (!id) return;
          saveButton.disabled = true;
          setSaveState(labels.saving);
          try {
            const data = await api('/api/tex/documents?id=' + encodeURIComponent(id), { method: 'PUT', body: JSON.stringify(snapshot()) });
            setSaveState(labels.saved);
            try {
              await api('/api/tex/versions?action=snapshot', { method: 'POST', body: JSON.stringify({ document_id: id, ...snapshot(), reason: 'manual' }) });
              window.dispatchEvent(new CustomEvent('qsseda:tex-version-created'));
            } catch {}
            const activeItem = document.querySelector('.tex-document-item.is-active');
            if (activeItem && data?.document) {
              const name = activeItem.querySelector('strong');
              const preview = activeItem.querySelector('p');
              const time = activeItem.querySelector('time');
              if (name) name.textContent = data.document.title || title.value;
              if (preview) preview.textContent = String(data.document.source || '').replace(/\\s+/g, ' ').trim().slice(0, 220) || ' ';
              if (time) time.textContent = new Date(data.document.updated_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
          } catch (error) {
            setSaveState(labels.saveFailed);
            showMessage(error?.message || labels.saveFailed, true);
          } finally { saveButton.disabled = false; }
        }

        async function saveAs(name) {
          if (saveAsPending || saveAsButton.disabled) return;
          const nextTitle = String(name || '').trim();
          if (!nextTitle) {
            saveAsError.textContent = labels.saveAsNameRequired;
            saveAsError.hidden = false;
            saveAsInput.focus();
            return;
          }
          saveAsPending = true;
          saveAsButton.disabled = true;
          saveAsCancel.disabled = true;
          saveAsConfirm.disabled = true;
          saveAsConfirm.textContent = labels.saving;
          saveAsError.hidden = true;
          try {
            const data = await api('/api/tex/documents', { method: 'POST', body: JSON.stringify({ ...snapshot(), title: nextTitle }) });
            const createdId = String(data?.document?.id || '').trim();
            if (!createdId) throw new Error(labels.saveAsFailed);
            // Close only on success. If the request fails, the error is visible
            // inside the dialog rather than silently disappearing.
            dialog.close('created');
            location.assign(workDocumentRoute(createdId));
          } catch (error) {
            saveAsError.textContent = error?.message || labels.saveAsFailed;
            saveAsError.hidden = false;
            showMessage(saveAsError.textContent, true);
          } finally {
            saveAsPending = false;
            saveAsCancel.disabled = false;
            saveAsConfirm.disabled = false;
            saveAsConfirm.textContent = labels.create;
            saveAsButton.disabled = !canEditSource();
          }
        }

        saveButton.addEventListener('click', () => void saveNow());
        saveAsButton.addEventListener('click', event => {
          event.preventDefault();
          if (saveAsButton.disabled || dialog.open) return;
          saveAsInput.value = (title.value || 'TeX') + labels.copySuffix;
          saveAsError.hidden = true;
          saveAsError.textContent = '';
          try {
            dialog.showModal();
            window.setTimeout(() => { saveAsInput.focus(); saveAsInput.select(); }, 20);
          } catch (error) {
            showMessage(error?.message || labels.saveAsFailed, true);
          }
        });
        saveAsForm.addEventListener('submit', event => {
          event.preventDefault();
          void saveAs(saveAsInput.value);
        });
        saveAsCancel.addEventListener('click', () => { if (!saveAsPending) dialog.close('cancel'); });
        dialog.addEventListener('cancel', event => { if (saveAsPending) event.preventDefault(); });

        undoButton.addEventListener('click', () => { source.focus(); document.execCommand('undo'); });
        redoButton.addEventListener('click', () => { source.focus(); document.execCommand('redo'); });

        function sourceSelection() {
          // CodeMirror mirrors the source into the hidden textarea, but its own
          // selection is authoritative when the enhanced editor is active.
          const bridge = window.__qssedaTexEditorBridge;
          const selection = bridge?.getSelection?.();
          const maximum = source.value.length;
          const clamp = value => Math.max(0, Math.min(maximum, Number(value) || 0));
          const anchor = clamp(selection?.anchor ?? source.selectionStart);
          const head = clamp(selection?.head ?? source.selectionEnd);
          return { start: Math.min(anchor, head), end: Math.max(anchor, head) };
        }

        const canEditSource = () => !editor.hidden && Boolean(activeDocumentId()) &&
          !source.readOnly && root.dataset.texCollaborationAccessRole !== 'viewer';

        async function writeClipboard(text) {
          if (navigator.clipboard?.writeText) {
            try { await navigator.clipboard.writeText(text); return true; }
            catch {}
          }
          // Legacy clipboard fallback: never remove text unless copying succeeds.
          const temporary = document.createElement('textarea');
          temporary.value = text;
          temporary.readOnly = true;
          temporary.setAttribute('aria-hidden', 'true');
          temporary.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
          document.body.append(temporary);
          temporary.select();
          let success = false;
          try { success = Boolean(document.execCommand('copy')); }
          catch {}
          temporary.remove();
          return success;
        }

        cutButton.addEventListener('click', async () => {
          if (!canEditSource()) return;
          const { start, end } = sourceSelection();
          if (start === end) return;
          const selectionText = source.value.slice(start, end);
          if (!await writeClipboard(selectionText)) {
            showMessage(labels.cutFailed, true);
            return;
          }
          // A concurrent collaborative edit or another selection must not
          // trigger an accidental deletion after an asynchronous clipboard call.
          const current = sourceSelection();
          if (start !== current.start || end !== current.end ||
              source.value.slice(start, end) !== selectionText || !canEditSource()) return;
          const bridge = window.__qssedaTexEditorBridge;
          if (!bridge?.replaceSelection?.('')) {
            source.setRangeText('', start, end, 'start');
            source.dispatchEvent(new Event('input', { bubbles: true }));
            source.focus();
          }
          syncDisabled();
        });

        copyButton.addEventListener('click', async event => {
          // Copy is a pure clipboard command. Never open another document or
          // invoke the Save As dialog (including via parent click handlers).
          event.preventDefault();
          if (copyButton.disabled) return;
          const { start, end } = sourceSelection();
          const text = start !== end ? source.value.slice(start, end) : source.value;
          if (await writeClipboard(text)) showMessage(labels.copied);
          else showMessage(labels.copyFailed, true);
        });

        pasteButton.addEventListener('click', async () => {
          if (!canEditSource()) return;
          try {
            const text = await navigator.clipboard.readText();
            if (!canEditSource()) return;
            const bridge = window.__qssedaTexEditorBridge;
            if (!bridge?.replaceSelection?.(text)) {
              const { start, end } = sourceSelection();
              source.setRangeText(text, start, end, 'end');
              source.dispatchEvent(new Event('input', { bubbles: true }));
              source.focus();
            }
            syncDisabled();
          } catch {
            showMessage(labels.pasteDenied, true);
            source.focus();
          }
        });

        renameButton.addEventListener('click', () => {
          if (!canEditSource()) return;
          title.focus();
          title.select();
        });

        deleteButton.addEventListener('click', () => {
          if (editor.hidden || !activeDocumentId() || root.dataset.texCollaborationAccessRole === 'viewer' ||
              root.dataset.texCollaborationAccessRole === 'editor') return;
          const footerDelete = document.getElementById('tex-delete');
          if (footerDelete && !footerDelete.disabled) footerDelete.click();
        });

        historyButton.addEventListener('click', () => {
          const rightToggle = document.getElementById('tex-right-panel-toggle');
          if (rightToggle?.getAttribute('aria-expanded') === 'false') rightToggle.click();
          window.requestAnimationFrame(() => {
            const panel = document.querySelector('.tex-runs-panel');
            const head = document.querySelector('.tex-runs-head');
            if (panel && head) panel.scrollTo({ top: Math.max(0, head.offsetTop - 10), behavior: 'smooth' });
            head?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
          });
        });

        document.addEventListener('keydown', event => {
          const modifier = event.ctrlKey || event.metaKey;
          if (!modifier || event.altKey) return;
          if (event.key.toLowerCase() === 's') {
            event.preventDefault();
            if (event.shiftKey) saveAsButton.click();
            else saveButton.click();
          }
        }, true);

        // Force the bottom source-download button to use a normal browser download
        // instead of opening a new page. Browser settings still decide whether the
        // user is prompted for a location or the configured Downloads folder is used.
        const sourceDownload = document.getElementById('tex-download');
        sourceDownload?.addEventListener('click', event => {
          event.preventDefault();
          event.stopImmediatePropagation();
          const blob = new Blob([source.value || ''], { type: 'application/x-tex;charset=UTF-8' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = safeName(title.value) + '.tex';
          document.body.append(link);
          link.click();
          link.remove();
          window.setTimeout(() => URL.revokeObjectURL(url), 1500);
        }, true);

        const syncDisabled = () => {
          const noDocument = editor.hidden || !activeDocumentId();
          const readOnly = source.readOnly || root.dataset.texCollaborationAccessRole === 'viewer';
          [saveButton, saveAsButton, undoButton, redoButton, pasteButton, renameButton].forEach(button => {
            button.disabled = noDocument || readOnly;
          });
          [copyButton, historyButton].forEach(button => { button.disabled = noDocument; });
          const footerDelete = document.getElementById('tex-delete');
          deleteButton.disabled = noDocument || readOnly || root.dataset.texCollaborationAccessRole === 'editor' || Boolean(footerDelete?.disabled);
          const { start, end } = sourceSelection();
          cutButton.disabled = noDocument || readOnly || start === end;
        };
        new MutationObserver(syncDisabled).observe(editor, { attributes: true, attributeFilter: ['hidden'] });
        new MutationObserver(syncDisabled).observe(root, { attributes: true, attributeFilter: ['data-tex-collaboration-access-role', 'data-tex-collaboration-document-id'] });
        new MutationObserver(syncDisabled).observe(source, { attributes: true, attributeFilter: ['readonly'] });
        const list = document.getElementById('tex-document-list');
        if (list) new MutationObserver(syncDisabled).observe(list, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
        // CodeMirror forwards selection changes to the underlying textarea.
        // The basic textarea uses native select/keyup/pointerup events.
        ['select', 'keyup', 'pointerup', 'input'].forEach(type => source.addEventListener(type, syncDisabled));
        syncDisabled();
      })();
    </script>`;
}
