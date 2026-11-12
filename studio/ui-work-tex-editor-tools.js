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
        color:var(--text)!important;
        box-shadow:none!important;
        cursor:pointer!important;
        transition:background .14s ease,color .14s ease,transform .14s ease!important;
      }
      .tex-editor-command:hover:not(:disabled){background:var(--fill)!important;color:var(--text)!important}
      .tex-editor-command:active:not(:disabled){transform:scale(.95)!important}
      .tex-editor-command:focus-visible{outline:none!important;box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 14%,transparent)!important}
      .tex-editor-command:disabled{opacity:.30!important;cursor:not-allowed!important;transform:none!important}
      .tex-editor-command svg{width:26px!important;height:26px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.7!important;stroke-linecap:round!important;stroke-linejoin:round!important;vector-effect:non-scaling-stroke!important}
      .tex-editor-command svg .tex-icon-accent{stroke:var(--primary)!important}
      .tex-editor-command svg .tex-icon-accent-fill{fill:var(--primary)!important;stroke:none!important}
      .tex-editor-command.is-history svg{width:25px!important;height:25px!important}
      .tex-editor-command svg.tex-icon-mirror{transform:scaleX(-1);transform-origin:center}
      .tex-editor-command.is-delete:hover:not(:disabled){background:color-mix(in srgb,var(--danger,#ac4137) 10%,transparent)!important;color:var(--danger,#ac4137)!important}
      .tex-delete-dialog{
        box-sizing:border-box;
        width:min(640px,calc(100vw - 32px));
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
        // Floppy disk and curved undo glyphs follow the supplied reference silhouettes;
        // redo is the exact horizontal mirror of undo, not a different path.
        const undoSvg = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M10.25 3.5v11H3.5"/><path d="M10.25 14.5H19a9.5 9.5 0 0 1 6.7 16.2l-3.9 3.8"/></svg>';
        const icons = {
          save: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6.5 3.5h17l4 4.2v19.8A2 2 0 0 1 25.5 29h-19a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z"/><path d="M10 3.5v9h12v-9M18.5 6v5"/><rect x="10" y="19.5" width="12" height="9.5" rx="1.25"/></svg>',
          saveAs: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6.5 3.5h17l4 4.2v12M19 29H6.5a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z"/><path d="M10 3.5v9h12v-9M18.5 6v5M10 29v-9.5h9"/><path d="m18.3 25.8 7.4-7.4a2.7 2.7 0 0 1 3.8 3.8l-7.4 7.4-5.3 1.2Z"/><path d="m23.6 20.4 3.8 3.8"/></svg>',
          undo: undoSvg,
          redo: undoSvg.replace('<svg ', '<svg class="tex-icon-mirror" '),
          cut: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 3.5 20.5 21M25 3.5 11.5 21"/><circle class="tex-icon-accent" cx="8" cy="24.3" r="4.1"/><circle class="tex-icon-accent" cx="24" cy="24.3" r="4.1"/></svg>',
          copy: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M17 27H8a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4h4"/><rect class="tex-icon-accent" x="13.5" y="3" width="14" height="22.8" rx="3"/></svg>',
          paste: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M9.5 5.8H7a3 3 0 0 0-3 3V26a3 3 0 0 0 3 3h5M23 5.8h2a3 3 0 0 1 3 3v1.8"/><rect x="10" y="3.5" width="12" height="5.6" rx="1.8"/><rect class="tex-icon-accent" x="14.5" y="11" width="14" height="18" rx="1.6"/></svg>',
          rename: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M12.5 6H8a4 4 0 0 0-4 4v12a4 4 0 0 0 4 4h4.5M22 6h2a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4h-2"/><path d="m9 21 4.4-11.5L18 21M10.2 17.5h6.5"/><path class="tex-icon-accent" d="M20.5 2.5v27M17.5 2.5h6M17.5 29.5h6"/></svg>',
          delete: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 8h24M12 8V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3M7 8l1.4 19a2.2 2.2 0 0 0 2.2 2h10.8a2.2 2.2 0 0 0 2.2-2L25 8M13 13v11M19 13v11"/></svg>',
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
          deleteFileName.textContent = /\.tex$/i.test(name) ? name : name + '.tex';
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
