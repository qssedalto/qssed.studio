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
      .tex-editor-command svg .tex-icon-accent{stroke:var(--primary)!important}
      .tex-editor-command svg .tex-icon-accent-fill{fill:var(--primary)!important;stroke:none!important}
      .tex-editor-command svg.tex-pixel-traced-icon{width:30px!important;height:30px!important;stroke:none!important;fill:none!important}
      .tex-editor-command svg.tex-pixel-traced-icon .tex-source-gray{fill:currentColor!important;stroke:none!important}
      .tex-editor-command svg.tex-pixel-traced-icon .tex-source-accent{fill:var(--primary)!important;stroke:none!important}
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
          const locale = location.pathname.startsWith('/en/') ? 'en' : 'zh-cn';
          const exempt = location.pathname.includes('/huawei-exempt/') ? 'huawei-exempt/' : '';
          return '/' + locale + '/d/' + exempt + encodeURIComponent(id);
        };

        function createButton(name, svg, className = '') {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'tex-editor-command' + (className ? ' ' + className : '');
          button.title = name;
          button.setAttribute('aria-label', name);
          button.innerHTML = svg;
          return button;
        }

        // Large, independently drawn Windows Explorer-style vector icons.
        // Muted strokes follow the page theme; their colored details use --primary.
        // Exact silhouettes vector-traced from the user-provided pixel references.
        const undoSvg = '<svg class="tex-pixel-traced-icon" viewBox="0 0 30 30" aria-hidden="true"><path class="tex-source-gray" fill-rule="evenodd" d="M2 2 2 13 3 14 14 14 14 12 7 12 6 11 13 4 14 4 15 3 19 3 20 4 21 4 25 8 25 14 24 15 24 16 23 17 22 17 12 27 12 28 13 28 26 15 26 13 27 12 26 7 22 3 21 3 20 2 14 2 13 3 12 3 5 10 4 9 4 2Z"/></svg>';
        const icons = {
          save: '<svg class="tex-pixel-traced-icon" viewBox="0 0 29 29" aria-hidden="true"><path class="tex-source-gray" fill-rule="evenodd" d="M4 2 2 4 2 24 4 26 24 26 26 24 26 7 21 2Z M7 16 8 15 20 15 21 16 21 24 20 25 8 25 7 24Z M8 4 9 3 17 3 18 4 18 8 17 9 9 9 8 8Z M5 3 6 3 7 4 7 8 8 9 8 10 17 10 19 8 19 4 20 3 21 4 22 4 25 7 25 23 23 25 22 24 22 15 21 15 20 14 8 14 7 15 6 15 6 24 5 25 3 23 3 5Z"/></svg>',
          saveAs: '<svg class="tex-pixel-traced-icon" viewBox="0 0 30 31" aria-hidden="true"><path class="tex-source-gray" fill-rule="evenodd" d="M26 13 23 13 14 22 14 23 13 24 13 27 14 28 15 27 17 27 28 16 28 15Z M21 2 4 2 2 4 2 24 4 26 10 26 10 25 8 25 7 24 7 16 8 15 18 15 18 14 8 14 7 15 6 15 6 24 5 25 3 23 3 5 5 3 6 3 7 4 7 8 8 9 8 10 18 10 19 9 19 4 20 3 21 4 22 4 25 7 25 10 26 10 26 7Z M8 4 9 3 17 3 18 4 18 8 17 9 9 9 8 8Z"/></svg>',
          cut: '<svg class="tex-pixel-traced-icon" viewBox="3 5 32 32" aria-hidden="true"><path class="tex-source-gray" fill-rule="evenodd" d="M29 7 27 8 27 9 23 14 22 17 24 16 24 15 28 10Z M12 7 12 8 16 13 17 16 19 18 19 21 17 23 17 25 18 25 18 24 20 22 21 22 23 24 23 25 24 25 24 23 22 21 14 8Z"/><path class="tex-source-accent" fill-rule="evenodd" d="M27 24 23 27 23 33 25 35 30 35 32 33 32 27 30 25Z M26 26 29 26 31 29 31 32 29 34 26 34 24 32 24 29Z M13 24 9 27 9 33 11 35 16 35 18 33 18 27 16 25Z M12 26 15 26 17 29 17 32 15 34 12 34 10 32 10 29Z"/></svg>',
          copy: '<svg class="tex-pixel-traced-icon" viewBox="3 5 32 32" aria-hidden="true"><path class="tex-source-gray" fill-rule="evenodd" d="M10 14 8 16 8 18 7 19 7 29 8 30 8 32 12 34 18 34 19 33 21 33 22 32 22 30 20 32 10 32 9 31 9 17 11 15 14 15 14 14Z"/><path class="tex-source-accent" fill-rule="evenodd" d="M18 9 16 12 16 24 17 26 18 26 19 28 29 28 29 27 31 25 31 10 29 9Z M19 10 29 10 30 11 30 24 28 26 19 26 17 23 17 13Z"/></svg>',
          paste: '<svg class="tex-pixel-traced-icon" viewBox="3 5 32 32" aria-hidden="true"><path class="tex-source-gray" fill-rule="evenodd" d="M26 9 22 8 21 7 13 7 12 8 9 8 7 9 6 11 6 32 8 35 15 35 14 34 9 34 8 33 8 11 9 10 12 10 15 12 19 12 22 10 25 10 26 11 26 13 27 13 27 10Z M13 9 14 8 19 8 20 9 19 10 14 10Z"/><path class="tex-source-accent" fill-rule="evenodd" d="M18 16 17 17 17 34 18 35 29 35 30 34 30 16Z M19 17 28 17 29 18 29 33 28 34 19 34 18 33 18 18Z"/></svg>',
          rename: '<svg class="tex-pixel-traced-icon" viewBox="3 5 32 32" aria-hidden="true"><path class="tex-source-gray" fill-rule="evenodd" d="M25 10 25 12 28 12 30 14 30 28 28 30 25 30 25 32 27 32 31 29 31 13 29 11Z M6 11 4 13 4 29 8 32 19 32 18 30 7 30 5 28 5 14 7 12 18 12 19 10 8 10Z"/><path class="tex-source-accent" fill-rule="evenodd" d="M14 14 12 15 9 21 8 25 9 25 9 24 11 22 15 22 17 24 17 25 18 25 18 23 15 18Z M11 20 13 17 15 19 14 21 12 21Z M18 7 18 8 20 8 21 9 21 33 20 34 18 34 18 35 26 35 26 34 23 34 22 33 22 9 23 8 26 8 26 7Z"/></svg>',
          delete: '<svg class="tex-pixel-traced-icon" viewBox="3 5 32 32" aria-hidden="true"><path class="tex-source-gray" fill-rule="evenodd" d="M5 10 5 11 7 13 7 20 8 21 8 30 9 31 9 34 10 35 25 35 26 34 26 31 27 30 28 13 30 11 30 10 22 10 21 8 19 7 16 7 13 10Z M9 12 26 12 27 13 27 18 26 19 26 28 25 29 25 33 24 34 11 34 10 33 9 19 8 18 8 13Z M20 17 19 19 19 26 20 28 21 28 21 18Z M15 17 14 18 14 28 15 28 16 26 16 19Z M16 9 17 8 19 9 18 10Z"/></svg>',
          undo: undoSvg,
          redo: undoSvg.replace('class="tex-pixel-traced-icon"', 'class="tex-pixel-traced-icon tex-icon-mirror"'),
          history: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5v5h5"/><path d="M5.2 9.6A8 8 0 1 1 4 14"/><path class="tex-icon-accent" d="M12 8v5l3 2"/></svg>'
        };

        const bar = document.createElement('div');
        bar.className = 'tex-editor-commandbar';
        const saveButton = createButton(labels.save, icons.save);
        const saveAsButton = createButton(labels.saveAs, icons.saveAs);
        const undoButton = createButton(labels.undo, icons.undo);
        const redoButton = createButton(labels.redo, icons.redo);
        const cutButton = createButton(labels.cut, icons.cut);
        const copyButton = createButton(labels.copy, icons.copy);
        const pasteButton = createButton(labels.paste, icons.paste);
        const renameButton = createButton(labels.rename, icons.rename);
        const deleteButton = createButton(labels.delete, icons.delete, 'is-delete');
        const historyButton = createButton(labels.history, icons.history, 'is-history');
        const separator = () => { const node = document.createElement('span'); node.className = 'tex-editor-command-separator'; node.setAttribute('aria-hidden', 'true'); return node; };
        // Keep the Explorer-style edit group visible first even in narrow editor panes.
        bar.append(cutButton, copyButton, pasteButton, renameButton, deleteButton, separator(), saveButton, saveAsButton, separator(), undoButton, redoButton, separator(), historyButton);
        const counts = sourceLabel.lastElementChild;
        if (counts) sourceLabel.insertBefore(bar, counts);
        else sourceLabel.append(bar);

        const dialog = document.createElement('dialog');
        dialog.className = 'tex-save-as-dialog';
        dialog.innerHTML = '<form method="dialog" class="tex-save-as-sheet"><strong>' + labels.saveAsTitle + '</strong><label><span>' + labels.saveAsName + '</span><input maxlength="180" autocomplete="off"></label><div class="tex-save-as-actions"><button value="cancel">' + labels.cancel + '</button><button class="is-primary" value="confirm">' + labels.create + '</button></div></form>';
        document.body.append(dialog);
        const saveAsInput = dialog.querySelector('input');

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
          const nextTitle = String(name || '').trim();
          if (!nextTitle) return;
          saveAsButton.disabled = true;
          try {
            const data = await api('/api/tex/documents', { method: 'POST', body: JSON.stringify({ ...snapshot(), title: nextTitle }) });
            if (data?.document?.id) {
              location.assign(workDocumentRoute(data.document.id));
            }
          } catch (error) {
            showMessage(error?.message || labels.saveFailed, true);
          } finally { saveAsButton.disabled = false; }
        }

        saveButton.addEventListener('click', () => void saveNow());
        saveAsButton.addEventListener('click', () => {
          saveAsInput.value = (title.value || 'TeX') + labels.copySuffix;
          dialog.showModal();
          window.setTimeout(() => { saveAsInput.focus(); saveAsInput.select(); }, 20);
        });
        dialog.addEventListener('close', () => { if (dialog.returnValue === 'confirm') void saveAs(saveAsInput.value); });

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

        copyButton.addEventListener('click', async () => {
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
