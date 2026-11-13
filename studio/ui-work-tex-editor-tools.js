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
      /* Crisp native Fluent paths; 28px optical size in 39px hit targets. */
      .tex-editor-command svg.tex-fluent-icon{width:28px!important;height:28px!important;stroke:none!important;fill:none!important;overflow:hidden!important}
      .tex-editor-command svg.tex-fluent-icon .tex-fluent-neutral{fill:currentColor!important;stroke:none!important}
      .tex-editor-command svg.tex-fluent-icon .tex-fluent-accent{fill:var(--primary)!important;stroke:none!important}
      .tex-editor-command svg.tex-fluent-icon .tex-fluent-accent-ring{stroke:var(--primary)!important;stroke-width:1.5!important;fill:none!important}
      .tex-editor-command svg.tex-fluent-icon .tex-fluent-accent-line{stroke:var(--primary)!important;stroke-width:1.35!important;stroke-linecap:round!important;stroke-linejoin:round!important;fill:none!important}
      .tex-editor-command.is-history svg{width:30px!important;height:30px!important;display:block!important;margin:auto!important;transform:translateY(0)!important}
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

        // Official Microsoft Fluent UI System Icon vector geometry (MIT licensed).
        // Copyright (c) 2020 Microsoft Corporation.
        // See studio/vendor/fluent-ui-system-icons-LICENSE.txt for full notice.
        // Individual layers are recolored with user-selected --primary.
        const undoSvg = '<svg class="tex-fluent-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="tex-fluent-neutral" d="M4.75 2C5.1297 2 5.44349 2.28215 5.49315 2.64823L5.5 2.75V8.44L10.0743 3.88014C12.5163 1.43819 16.4385 1.37863 18.9526 3.70146L19.1385 3.88014C21.6415 6.38313 21.6415 10.4413 19.1385 12.9443L10.2933 21.7835C10.0003 22.0762 9.52558 22.0759 9.23269 21.783C8.93979 21.4901 8.94013 21.0151 9.23315 20.7223L18.0778 11.8836C19.995 9.96641 19.995 6.85801 18.0778 4.9408C16.2187 3.08169 13.2395 3.02535 11.3118 4.77248L11.1342 4.94156L6.562 9.5L12.25 9.50018C12.6297 9.50018 12.9435 9.78234 12.9932 10.1484L13 10.2502C13 10.6299 12.7178 10.9437 12.3518 10.9933L12.25 11.0002H4.75C4.3703 11.0002 4.05651 10.718 4.00685 10.352L4 10.2502V2.75C4 2.33579 4.33579 2 4.75 2Z"/></svg>';
        const icons = {
          save: '<svg class="tex-fluent-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="tex-fluent-neutral" d="M3 5.75C3 4.23122 4.23122 3 5.75 3H15.7145C16.5764 3 17.4031 3.34241 18.0126 3.9519L20.0481 5.98744C20.6576 6.59693 21 7.42358 21 8.28553V18.25C21 19.7688 19.7688 21 18.25 21H5.75C4.23122 21 3 19.7688 3 18.25V5.75ZM5.75 4.5C5.05964 4.5 4.5 5.05964 4.5 5.75V18.25C4.5 18.9404 5.05964 19.5 5.75 19.5H6V14.25C6 13.0074 7.00736 12 8.25 12H15.75C16.9926 12 18 13.0074 18 14.25V19.5H18.25C18.9404 19.5 19.5 18.9404 19.5 18.25V8.28553C19.5 7.8214 19.3156 7.37629 18.9874 7.0481L16.9519 5.01256C16.6918 4.75246 16.3582 4.58269 16 4.52344V7.25C16 8.49264 14.9926 9.5 13.75 9.5H9.25C8.00736 9.5 7 8.49264 7 7.25V4.5H5.75ZM16.5 19.5V14.25C16.5 13.8358 16.1642 13.5 15.75 13.5H8.25C7.83579 13.5 7.5 13.8358 7.5 14.25V19.5H16.5ZM8.5 4.5V7.25C8.5 7.66421 8.83579 8 9.25 8H13.75C14.1642 8 14.5 7.66421 14.5 7.25V4.5H8.5Z"/></svg>',
          saveAs: '<svg class="tex-fluent-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="tex-fluent-neutral" d="M5.75 3C4.23122 3 3 4.23122 3 5.75V18.25C3 19.7688 4.23122 21 5.75 21H9.99852C9.99129 20.8075 10.011 20.6088 10.0613 20.4075L10.2882 19.5H7.5V14.25C7.5 13.8358 7.83579 13.5 8.25 13.5H14.8531L16.2883 12.0648C16.1158 12.0225 15.9355 12 15.75 12H8.25C7.00736 12 6 13.0074 6 14.25V19.5H5.75C5.05964 19.5 4.5 18.9404 4.5 18.25V5.75C4.5 5.05964 5.05964 4.5 5.75 4.5H7V7.25C7 8.49264 8.00736 9.5 9.25 9.5H13.75C14.9926 9.5 16 8.49264 16 7.25V4.52344C16.3582 4.58269 16.6918 4.75246 16.9519 5.01256L18.9874 7.0481C19.3156 7.37629 19.5 7.8214 19.5 8.28553V10.007C19.5709 10.0024 19.642 10 19.713 10H19.7151C20.1521 10.0002 20.59 10.0874 21 10.2615V8.28553C21 7.42358 20.6576 6.59693 20.0481 5.98744L18.0126 3.9519C17.4031 3.34241 16.5764 3 15.7145 3H5.75ZM8.5 7.25V4.5H14.5V7.25C14.5 7.66421 14.1642 8 13.75 8H9.25C8.83579 8 8.5 7.66421 8.5 7.25ZM19.7152 11H19.7131C19.1285 11.0003 18.5439 11.2234 18.0979 11.6695L12.1955 17.5719C11.8513 17.916 11.6072 18.3472 11.4892 18.8194L11.0315 20.6501C10.8325 21.4462 11.5536 22.1674 12.3497 21.9683L14.1804 21.5106C14.6526 21.3926 15.0838 21.1485 15.4279 20.8043L21.3303 14.9019C22.223 14.0093 22.223 12.5621 21.3303 11.6695C20.8843 11.2234 20.2998 11.0003 19.7152 11Z"/></svg>',
          cut: '<svg class="tex-fluent-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="tex-fluent-neutral" d="M12.1409 9.3415L12.14 9.34286L7.37017 2.3284C7.13725 1.98587 6.67077 1.89702 6.32824 2.12994C5.98572 2.36286 5.89687 2.82934 6.12978 3.17187L11.2606 10.7171L8.86478 14.4605C8.30797 14.1665 7.67342 14.0001 7 14.0001C4.79086 14.0001 3 15.791 3 18.0001C3 20.2093 4.79086 22.0001 7 22.0001C9.20914 22.0001 11 20.2093 11 18.0001C11 17.0089 10.6395 16.1019 10.0424 15.4031L12.178 12.0662L14.2426 15.1024C13.4771 15.831 13 16.8599 13 18.0001C13 20.2093 14.7909 22.0001 17 22.0001C19.2091 22.0001 21 20.2093 21 18.0001C21 15.791 19.2091 14.0001 17 14.0001C16.471 14.0001 15.9659 14.1028 15.5037 14.2894L13.0575 10.692L13.0588 10.69L12.1409 9.3415ZM4.5 18.0001C4.5 16.6194 5.61929 15.5001 7 15.5001C8.38071 15.5001 9.5 16.6194 9.5 18.0001C9.5 19.3808 8.38071 20.5001 7 20.5001C5.61929 20.5001 4.5 19.3808 4.5 18.0001ZM14.5 18.0001C14.5 16.6194 15.6193 15.5001 17 15.5001C18.3807 15.5001 19.5 16.6194 19.5 18.0001C19.5 19.3808 18.3807 20.5001 17 20.5001C15.6193 20.5001 14.5 19.3808 14.5 18.0001ZM13.9381 9.31607L17.8815 3.15438C18.1048 2.8055 18.003 2.34167 17.6541 2.11839C17.3053 1.89511 16.8414 1.99692 16.6181 2.3458L13.0202 7.96756L13.9381 9.31607Z"/><circle class="tex-fluent-accent-ring" cx="7" cy="18" r="3.25"/><circle class="tex-fluent-accent-ring" cx="17" cy="18" r="3.25"/></svg>',
          copy: '<svg class="tex-fluent-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="tex-fluent-neutral" d="M8.5 8.5H5.25C4.2835 8.5 3.5 9.2835 3.5 10.25V18.75C3.5 19.7165 4.2835 20.5 5.25 20.5H11.25C12.2165 20.5 13 19.7165 13 18.75V18H14.5V18.75C14.5 20.5449 13.0449 22 11.25 22H5.25C3.45507 22 2 20.5449 2 18.75V10.25C2 8.45507 3.45507 7 5.25 7H8.5V8.5Z"/><path class="tex-fluent-accent" d="M18.75 2C20.5449 2 22 3.45507 22 5.25V13.75C22 15.5449 20.5449 17 18.75 17H12.75C10.9551 17 9.5 15.5449 9.5 13.75V5.25C9.5 3.45507 10.9551 2 12.75 2H18.75ZM12.75 3.5C11.7835 3.5 11 4.2835 11 5.25V13.75C11 14.7165 11.7835 15.5 12.75 15.5H18.75C19.7165 15.5 20.5 14.7165 20.5 13.75V5.25C20.5 4.2835 19.7165 3.5 18.75 3.5H12.75Z"/></svg>',
          paste: '<svg class="tex-fluent-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="tex-fluent-neutral" d="M12.7533 2C13.9109 2 14.8641 2.87549 14.9867 4.00046L16.75 4C17.9409 4 18.9156 4.92516 18.9948 6.09595L19 6.25C19 6.62919 18.7182 6.94257 18.3526 6.99216L18.249 6.999C17.8698 6.999 17.5564 6.71722 17.5068 6.35163L17.5 6.25C17.5 5.8703 17.2178 5.55651 16.8518 5.50685L16.75 5.5L14.6176 5.50082C14.2141 6.09953 13.5297 6.4933 12.7533 6.4933H9.24665C8.47031 6.4933 7.78594 6.09953 7.38237 5.50082L5.25 5.5C4.8703 5.5 4.55651 5.78215 4.50685 6.14823L4.5 6.25V19.7546C4.5 20.1343 4.78215 20.4481 5.14823 20.4977L5.25 20.5046L8.25 20.5041C8.62964 20.5041 8.94343 20.7861 8.99314 21.1521L9 21.254C9 21.6682 8.66423 22.0041 8.25 22.0041L5.25 22.0046C4.05914 22.0046 3.08436 21.0794 3.00519 19.9086L3 19.7546V6.25C3 5.05914 3.92516 4.08436 5.09595 4.00519L5.25 4L7.01333 4.00046C7.13595 2.87549 8.08906 2 9.24665 2H12.7533Z"/><path class="tex-fluent-accent" d="M18.75 8C19.9409 8 20.9156 8.92516 20.9948 10.096L21 10.25V19.75C21 20.9409 20.0748 21.9156 18.904 21.9948L18.75 22H12.25C11.0591 22 10.0844 21.0748 10.0052 19.904L10 19.75V10.25C10 9.05914 10.9252 8.08436 12.096 8.00519L12.25 8H18.75ZM18.75 9.5H12.25C11.8703 9.5 11.5565 9.78215 11.5068 10.1482L11.5 10.25V19.75C11.5 20.1297 11.7822 20.4435 12.1482 20.4932L12.25 20.5H18.75C19.1297 20.5 19.4435 20.2178 19.4932 19.8518L19.5 19.75V10.25C19.5 9.8703 19.2178 9.55651 18.8518 9.50685L18.75 9.5ZM12.7533 3.5H9.24665C8.83429 3.5 8.5 3.83429 8.5 4.24665C8.5 4.65902 8.83429 4.9933 9.24665 4.9933H12.7533C13.1657 4.9933 13.5 4.65902 13.5 4.24665C13.5 3.83429 13.1657 3.5 12.7533 3.5Z"/></svg>',
          rename: '<svg class="tex-fluent-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="tex-fluent-neutral" d="M14.2502 2C14.6645 2 15.0002 2.33579 15.0002 2.75C15.0002 3.16421 14.6645 3.5 14.2502 3.5H12.7502V20.5H14.2502C14.6645 20.5 15.0002 20.8358 15.0002 21.25C15.0002 21.6642 14.6645 22 14.2502 22H9.75024C9.33603 22 9.00024 21.6642 9.00024 21.25C9.00024 20.8358 9.33603 20.5 9.75024 20.5H11.2502V3.5H9.75024C9.33603 3.5 9.00024 3.16421 9.00024 2.75C9.00024 2.33579 9.33603 2 9.75024 2H14.2502ZM10.2502 6.5H5.25024C4.28375 6.5 3.50024 7.2835 3.50024 8.25V15.75C3.50024 16.7165 4.28375 17.5 5.25024 17.5H10.2502V19H5.25024C3.45532 19 2.00024 17.5449 2.00024 15.75V8.25C2.00024 6.45507 3.45532 5 5.25024 5H10.2502V6.5ZM18.7502 5C20.5452 5 22.0002 6.45507 22.0002 8.25V15.75C22.0002 17.5449 20.5452 19 18.7502 19H13.7502V17.5H18.7502C19.7167 17.5 20.5002 16.7165 20.5002 15.75V8.25C20.5002 7.2835 19.7167 6.5 18.7502 6.5H13.7502V5H18.7502Z"/><path class="tex-fluent-accent-line" d="M5.1 14.4 7 9.6 8.9 14.4M5.7 12.8h2.6"/></svg>',
          delete: '<svg class="tex-fluent-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="tex-fluent-neutral" d="M10 5H14C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5ZM8.5 5C8.5 3.067 10.067 1.5 12 1.5C13.933 1.5 15.5 3.067 15.5 5H21.25C21.6642 5 22 5.33579 22 5.75C22 6.16421 21.6642 6.5 21.25 6.5H19.9309L18.7589 18.6112C18.5729 20.5334 16.9575 22 15.0263 22H8.97369C7.04254 22 5.42715 20.5334 5.24113 18.6112L4.06908 6.5H2.75C2.33579 6.5 2 6.16421 2 5.75C2 5.33579 2.33579 5 2.75 5H8.5ZM10.5 9.75C10.5 9.33579 10.1642 9 9.75 9C9.33579 9 9 9.33579 9 9.75V17.25C9 17.6642 9.33579 18 9.75 18C10.1642 18 10.5 17.6642 10.5 17.25V9.75ZM14.25 9C14.6642 9 15 9.33579 15 9.75V17.25C15 17.6642 14.6642 18 14.25 18C13.8358 18 13.5 17.6642 13.5 17.25V9.75C13.5 9.33579 13.8358 9 14.25 9ZM6.73416 18.4667C6.84577 19.62 7.815 20.5 8.97369 20.5H15.0263C16.185 20.5 17.1542 19.62 17.2658 18.4667L18.4239 6.5H5.57608L6.73416 18.4667Z"/></svg>',
          undo: undoSvg,
          redo: undoSvg.replace('class="tex-fluent-icon"', 'class="tex-fluent-icon tex-icon-mirror"'),
          history: '<svg class="tex-fluent-icon" viewBox="0 0 24 24" aria-hidden="true"><path class="tex-fluent-neutral" d="M12 4.5C16.1421 4.5 19.5 7.85786 19.5 12C19.5 16.1421 16.1421 19.5 12 19.5C7.85786 19.5 4.5 16.1421 4.5 12C4.5 11.6236 4.52772 11.2538 4.58123 10.8923C4.64845 10.4382 4.31609 10 3.85708 10C3.48623 10 3.161 10.2562 3.10471 10.6228C3.03576 11.0718 3 11.5317 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C9.69494 3 7.59227 3.86656 6 5.29168V4.25C6 3.83579 5.66421 3.5 5.25 3.5C4.83579 3.5 4.5 3.83579 4.5 4.25V7.25C4.5 7.66421 4.83579 8 5.25 8H8.25C8.66421 8 9 7.66421 9 7.25C9 6.83579 8.66421 6.5 8.25 6.5H6.90093C8.23907 5.25883 10.0309 4.5 12 4.5ZM12.5 7.75C12.5 7.33579 12.1642 7 11.75 7C11.3358 7 11 7.33579 11 7.75V12.25C11 12.6642 11.3358 13 11.75 13H14.75C15.1642 13 15.5 12.6642 15.5 12.25C15.5 11.8358 15.1642 11.5 14.75 11.5H12.5V7.75Z"/></svg>'
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

        // Save As is a local file download, never a cloud document duplicate.
        function saveAsLocal() {
          const asset = window.__aertexTexCurrentAsset;
          const name = asset?.name || 'main.tex';
          const safeFile = String(name).split('/').pop().replace(/[\\/:*?"<>|]/g, '_') || 'main.tex';
          let data = source.value || '';
          let type = 'text/plain;charset=UTF-8';
          if (asset && !asset.main) {
            if (asset.encoding === 'base64') {
              const decoded = atob(asset.content || '');
              data = Uint8Array.from(decoded, c => c.charCodeAt(0));
              type = /\\.pdf$/i.test(name) ? 'application/pdf' :
                /\\.png$/i.test(name) ? 'image/png' : 'image/jpeg';
            } else data = String(window.__aertexTexExplorerEditableText?.() ?? asset.content ?? '');
          }
          const url = URL.createObjectURL(new Blob([data], { type }));
          const a = document.createElement('a');
          a.href = url;
          a.download = safeFile;
          document.body.append(a);
          a.click();
          a.remove();
          window.setTimeout(() => URL.revokeObjectURL(url), 3000);
        }

        saveButton.addEventListener('click', () => void saveNow());
        saveAsButton.addEventListener('click', event => {
          event.preventDefault();
          if (saveAsButton.disabled) return;
          saveAsLocal();
        });
        undoButton.addEventListener('click', () => { source.focus(); document.execCommand('undo'); });
        redoButton.addEventListener('click', () => { source.focus(); document.execCommand('redo'); });

        const activeFileText=()=>String(window.__aertexTexExplorerEditableText?.() ?? source.value ?? '');
        function sourceSelection() {
          // CodeMirror mirrors the source into the hidden textarea, but its own
          // selection is authoritative when the enhanced editor is active.
          const bridge = window.__qssedaTexEditorBridge;
          const selection = bridge?.getSelection?.();
          const maximum = activeFileText().length;
          const clamp = value => Math.max(0, Math.min(maximum, Number(value) || 0));
          const anchor = clamp(selection?.anchor ?? source.selectionStart);
          const head = clamp(selection?.head ?? source.selectionEnd);
          return { start: Math.min(anchor, head), end: Math.max(anchor, head) };
        }

        const canEditSource = () => !editor.hidden && Boolean(activeDocumentId()) &&
          !source.readOnly && root.dataset.texCollaborationAccessRole !== 'viewer' &&
          !(window.__aertexTexExplorerAsset?.()?.main === false && root.dataset.texCollaborationAccessRole === 'editor');

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
          const selectedName = window.__aertexTexExplorerAsset?.()?.name;
          const selectionText = activeFileText().slice(start, end);
          if (!await writeClipboard(selectionText)) {
            showMessage(labels.cutFailed, true);
            return;
          }
          // A concurrent collaborative edit or another selection must not
          // trigger an accidental deletion after an asynchronous clipboard call.
          const current = sourceSelection();
          if (start !== current.start || end !== current.end ||
              activeFileText().slice(start, end) !== selectionText ||
              selectedName !== window.__aertexTexExplorerAsset?.()?.name || !canEditSource()) return;
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
          if (start === end) return;
          const text = activeFileText().slice(start, end);
          if (await writeClipboard(text)) {
            window.__aertexTexClipboardKnown = text;
            window.dispatchEvent(new CustomEvent('aertex:tex-clipboard-changed'));
            showMessage(labels.copied);
          }
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
          window.dispatchEvent(new CustomEvent('aertex:tex-rename-file'));
        });

        deleteButton.addEventListener('click', () => {
          if (deleteButton.disabled) return;
          window.dispatchEvent(new CustomEvent('aertex:tex-delete-file'));
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
          const readOnly = source.readOnly || root.dataset.texCollaborationAccessRole === 'viewer' ||
            (window.__aertexTexExplorerAsset?.()?.main === false && root.dataset.texCollaborationAccessRole === 'editor');
          [saveButton, undoButton, redoButton, renameButton].forEach(button => {
            button.disabled = noDocument || readOnly;
          });
          [saveAsButton, historyButton].forEach(button => { button.disabled = noDocument; });
          const { start, end } = sourceSelection();
          copyButton.disabled = noDocument || start === end;
          cutButton.disabled = noDocument || readOnly || start === end;
          pasteButton.disabled = noDocument || readOnly || !Boolean(window.__aertexTexClipboardKnown);
          deleteButton.disabled = noDocument || readOnly || root.dataset.texCollaborationAccessRole === 'editor';
        };
        new MutationObserver(syncDisabled).observe(editor, { attributes: true, attributeFilter: ['hidden'] });
        new MutationObserver(syncDisabled).observe(root, { attributes: true, attributeFilter: ['data-tex-collaboration-access-role', 'data-tex-collaboration-document-id'] });
        new MutationObserver(syncDisabled).observe(source, { attributes: true, attributeFilter: ['readonly'] });
        const list = document.getElementById('tex-document-list');
        if (list) new MutationObserver(syncDisabled).observe(list, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
        // CodeMirror forwards selection changes to the underlying textarea.
        // The basic textarea uses native select/keyup/pointerup events.
        ['select', 'keyup', 'pointerup', 'input'].forEach(type => source.addEventListener(type, syncDisabled));
        window.addEventListener('aertex:tex-clipboard-changed', syncDisabled);
        window.addEventListener('aertex:tex-project-asset-selected', syncDisabled);
        window.addEventListener('aertex:tex-asset-selection-changed', syncDisabled);
        // Browser clipboard-read permission is not universal; only check it
        // when the current browser explicitly grants access, without prompting.
        async function checkExternalClipboard() {
          try {
            const permission = await navigator.permissions?.query?.({ name: 'clipboard-read' });
            if (permission?.state !== 'granted') return;
            const text = await navigator.clipboard?.readText?.();
            window.__aertexTexClipboardKnown = String(text || '');
            syncDisabled();
          } catch {}
        }
        window.addEventListener('focus', () => void checkExternalClipboard());
        syncDisabled();
      })();
    </script>`;
}
