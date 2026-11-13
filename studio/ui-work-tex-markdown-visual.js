// Optional in-place Markdown WYSIWYG for .md/.markdown supplementary project files.
// CodeMirror remains the authoritative source editor and existing save/ACL path.
function markdownVisualRuntime() {
  if (window.__aertexMarkdownVisualReady) return;
  const root = document.querySelector('.tex-work-app[data-tex-root]');
  const editor = document.getElementById('tex-editor');
  const sourceLabel = editor?.querySelector('.tex-source-label');
  const source = document.getElementById('tex-source');
  const fallback = editor?.querySelector('.tex-inline-file-viewer textarea');
  if (!root || !editor || !sourceLabel || !source) return;
  window.__aertexMarkdownVisualReady = true;

  const zh = document.documentElement.lang.toLowerCase().startsWith('zh');
  const translation = zh ? {
    source:'源码', visual:'可视化', bold:'加粗', italic:'斜体',
    h1:'一级标题', h2:'二级标题', bullet:'无序列表',
    ordered:'有序列表', task:'任务列表', quote:'引用',
    code:'代码块', table:'插入表格', link:'插入链接',
    undo:'撤销', redo:'重做', loading:'正在加载可视化编辑器…',
    failed:'可视化编辑器无法加载，已保留原始 Markdown。',
    unsupported:'这份 Markdown 含有扩展语法。为防止内容丢失，请在源码模式修改。',
    changed:'源码已在其他地方更新。已切回源码，未覆盖任何更改。',
    readonly:'当前账户没有此文件的编辑权限。',
    invalid:'此文件太大，暂不支持可视化编辑。',
    linkPrompt:'输入链接地址（https:// 或项目内相对路径）',
    note:'可视化修改将同步到原始 Markdown；保存仍使用上方保存按钮。'
  } : {
    source:'Source', visual:'Visual', bold:'Bold', italic:'Italic',
    h1:'Heading 1', h2:'Heading 2', bullet:'Bulleted list',
    ordered:'Numbered list', task:'Task list', quote:'Quote',
    code:'Code block', table:'Insert table', link:'Insert link',
    undo:'Undo', redo:'Redo', loading:'Loading visual editor…',
    failed:'Visual editor unavailable; the original Markdown is unchanged.',
    unsupported:'This Markdown contains extensions that cannot safely round-trip. Edit it in Source mode.',
    changed:'The source changed elsewhere. Returned to Source without overwriting changes.',
    readonly:'You do not have edit access to this file.',
    invalid:'This file is too large for visual editing.',
    linkPrompt:'Enter a link (https:// or relative project path)',
    note:'Visual edits sync to Markdown; use the existing Save control to persist.'
  };

  // Markdown uses the SAME native selector design/location as TeX,
  // not a wide segmented switch competing with the source command toolbar.
  const tabs = document.createElement('label');
  tabs.id = 'tex-markdown-view-modes';
  tabs.className = 'tex-markdown-view-modes tex-editor-choice-label';
  tabs.hidden = true;
  const caption = document.createElement('span');
  caption.textContent = zh ? '编辑器选择' : 'Editor';
  const viewSelect = document.createElement('select');
  viewSelect.id = 'tex-markdown-editor-mode';
  viewSelect.setAttribute('aria-label',caption.textContent);
  for (const [value,label] of [['source',translation.source],['visual',translation.visual]]) {
    const option=document.createElement('option');
    option.value=value;
    option.textContent=label;
    viewSelect.append(option);
  }
  tabs.append(caption,viewSelect);
  const engineLabel = document.getElementById('tex-engine')?.closest('label');
  if(engineLabel?.parentElement) engineLabel.parentElement.insertBefore(tabs,engineLabel);
  else root.querySelector('.tex-editor-toolbar')?.append(tabs);

  const panel = document.createElement('section');
  panel.id = 'tex-markdown-visual-panel';
  panel.className = 'tex-markdown-visual-panel';
  panel.hidden = true;
  panel.setAttribute('aria-label', zh ? 'Markdown 可视化编辑区' : 'Markdown visual editor');
  const toolbar = document.createElement('div');
  toolbar.className = 'tex-markdown-formatbar';
  toolbar.setAttribute('role', 'toolbar');
  toolbar.setAttribute('aria-label', zh ? 'Markdown 格式' : 'Markdown formatting');
  const surface = document.createElement('div');
  surface.className = 'tex-markdown-visual-surface';
  const hint = document.createElement('div');
  hint.className = 'tex-markdown-visual-hint';
  hint.textContent = translation.note;
  panel.append(toolbar, surface, hint);
  editor.insertBefore(panel, editor.querySelector('.tex-editor-footer'));

  let visualEditor = null;
  let mode = 'source';
  let selectedKey = '';
  let committed = '';
  let loadingTicket = 0;
  let writingBridge = false;
  let loadingPromise = null;
  const formatActions = [
    ['bold','B', e => e.chain().focus().toggleBold().run()],
    ['italic','I', e => e.chain().focus().toggleItalic().run()],
    ['h1','H1', e => e.chain().focus().toggleHeading({level:1}).run()],
    ['h2','H2', e => e.chain().focus().toggleHeading({level:2}).run()],
    ['bullet','• ≡', e => e.chain().focus().toggleBulletList().run()],
    ['ordered','1. ≡', e => e.chain().focus().toggleOrderedList().run()],
    ['task','☑', e => e.chain().focus().toggleTaskList().run()],
    ['quote','❞', e => e.chain().focus().toggleBlockquote().run()],
    ['code','</>', e => e.chain().focus().toggleCodeBlock().run()],
    ['table','▦', e => e.chain().focus().insertTable({rows:3,cols:3,withHeaderRow:true}).run()],
    ['link','↗', e => {
      const value = window.prompt(translation.linkPrompt, 'https://');
      if (!value) return;
      const href = value.trim();
      if (!/^(https?:\/\/|mailto:|\.?\.?\/|#|[^:/?#]+(?:[/?#]|$))/i.test(href)) return;
      e.chain().focus().setLink({href}).run();
    }],
    ['undo','↶', e => e.chain().focus().undo().run()],
    ['redo','↷', e => e.chain().focus().redo().run()]
  ];
  for (const [key,label,action] of formatActions) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tex-markdown-format-button';
    button.dataset.format = key;
    button.textContent = label;
    button.title = translation[key];
    button.setAttribute('aria-label', translation[key]);
    button.addEventListener('click', () => {
      if (visualEditor && canEdit()) action(visualEditor);
    });
    toolbar.append(button);
  }

  const selection = () => window.__aertexTexExplorerAsset?.() || null;
  const isMarkdown = item => Boolean(item && !item.main &&
    item.encoding !== 'base64' && /\.(?:md|markdown)$/i.test(item.name || ''));
  const docId = () => String(root.dataset.texCollaborationDocumentId || '');
  const keyFor = item => String(docId()) + '::' + String(item.name);
  const assetValue = () => {
    const bridge = window.__qssedaTexEditorBridge;
    const current = selection();
    const active = bridge?.getActiveAsset?.();
    if (bridge && active && active.name === current?.name && active.documentId === docId())
      return String(bridge.getAssetValue() ?? '');
    return String(fallback?.value ?? current?.content ?? '');
  };
  const canEdit = () => {
    const role = root.dataset.texCollaborationAccessRole || 'owner';
    return role !== 'viewer' && role !== 'editor' && !source.readOnly && !fallback?.readOnly;
  };
  const report = message => {
    const msg = document.getElementById('tex-message');
    if (!msg || !message) return;
    msg.hidden = false;
    msg.textContent = message;
    msg.classList.remove('is-error');
  };
  const updateButtons = () => {
    const showing = isMarkdown(selection()) && !editor.hidden && editor.classList.contains('is-asset-mode');
    tabs.hidden = !showing;
    viewSelect.value = mode;
    viewSelect.disabled = !showing || Boolean(loadingPromise);
    for (const button of toolbar.querySelectorAll('button')) button.disabled = !canEdit();
  };
  const fallbackToSource = message => {
    loadingTicket++;
    mode = 'source';
    editor.classList.remove('md-visual-mode');
    panel.hidden = true;
    if (visualEditor) {
      try { visualEditor.destroy(); } catch {}
      visualEditor = null;
    }
    surface.replaceChildren();
    selectedKey = '';
    committed = '';
    if (message) report(message);
    updateButtons();
  };
  const unsupported = value =>
    /(?:^|\n)---\r?\n[\s\S]{0,1000}?\r?\n---(?:\r?\n|$)/.test(value) ||
    /^\s*<\/?(?:script|style|iframe|svg|table|div|details|summary)\b/im.test(value) ||
    /\$\$|\\begin\{|^\s*:::\w+/m.test(value);
  const commitMarkdown = markdown => {
    if (mode !== 'visual' || !visualEditor || !canEdit()) return;
    if (String(markdown).length > 180000) { fallbackToSource(translation.invalid); return; }
    const before = assetValue();
    if (before !== committed) {
      fallbackToSource(translation.changed);
      return;
    }
    if (markdown === before) return;
    const bridge = window.__qssedaTexEditorBridge;
    const active = bridge?.getActiveAsset?.();
    if (!active || active.name !== selection()?.name || active.documentId !== docId() ||
        typeof bridge.replaceRange !== 'function') {
      fallbackToSource(translation.changed);
      return;
    }
    // Surgical diff keeps the CodeMirror event/undo/save path intact rather
    // than injecting a second file-editing backend.
    let start = 0;
    while (start < before.length && start < markdown.length && before[start] === markdown[start]) start++;
    let end = 0;
    while (end < before.length - start && end < markdown.length - start &&
      before[before.length - end - 1] === markdown[markdown.length - end - 1]) end++;
    writingBridge = true;
    try {
      if (!bridge.replaceRange(start, before.length - end, markdown.slice(start, markdown.length - end), false)) {
        fallbackToSource(translation.readonly);
        return;
      }
      committed = String(bridge.getAssetValue() ?? markdown);
    } finally {
      writingBridge = false;
    }
  };
  const reveal = async () => {
    if (mode === 'visual') return;
    const item = selection();
    if (!isMarkdown(item) || editor.hidden) return;
    const id = keyFor(item);
    const initial = assetValue();
    if (initial.length > 180000) { report(translation.invalid); return; }
    // Raw HTML, frontmatter and math directives may not survive a visual
    // round-trip. Preserve the file and require the lossless CodeMirror mode.
    if (unsupported(initial)) { report(translation.unsupported); return; }
    const ticket = ++loadingTicket;
    tabs.title = translation.loading;
    // A runtime URL prevents the Worker bundler from trying to resolve this
    // browser-only self-hosted ESM asset as a Worker source import.
    const visualModuleUrl = () => '/assets/tex/markdown-visual.js';
    loadingPromise ||= import(visualModuleUrl());
    updateButtons();
    let factory;
    try { factory = await loadingPromise; }
    catch (error) {
      console.warn('[AERTEX Markdown] optional visual module unavailable', error);
      loadingPromise = null;
      if (ticket === loadingTicket) report(translation.failed);
      tabs.title = '';
      updateButtons();
      return;
    }
    loadingPromise = null;
    tabs.title = '';
    if (ticket !== loadingTicket || !isMarkdown(selection()) || id !== keyFor(selection())) {
      updateButtons(); return;
    }
    if (initial !== assetValue()) { report(translation.changed); updateButtons(); return; }
    try {
      committed = initial;
      selectedKey = id;
      visualEditor = factory.createMarkdownVisualEditor({
        element: surface, markdown: initial, editable: canEdit(),
        onUpdate: next => commitMarkdown(next)
      });
      // Mode switching alone must never mutate the persisted Markdown.
      mode = 'visual';
      panel.hidden = false;
      editor.classList.add('md-visual-mode');
      updateButtons();
      visualEditor.commands.focus('start');
    } catch(error) {
      console.warn('[AERTEX Markdown] unable to mount visual editor', error);
      fallbackToSource(translation.failed);
    }
  };
  viewSelect.addEventListener('change', () => {
    if(viewSelect.value==='visual')void reveal();
    else fallbackToSource();
  });
  const syncSelection = () => {
    const selected = selection();
    if (mode === 'visual' && (!isMarkdown(selected) || keyFor(selected) !== selectedKey ||
      editor.hidden || !editor.classList.contains('is-asset-mode'))) {
      fallbackToSource();
    }
    updateButtons();
    if (visualEditor) visualEditor.setEditable(canEdit());
  };
  window.addEventListener('aertex:tex-project-asset-selected', syncSelection);
  window.addEventListener('qsseda:tex-editor-ready', syncSelection);
  window.addEventListener('aertex:tex-code-asset-updated', event => {
    if (mode !== 'visual' || writingBridge) return;
    if (event.detail?.name !== selection()?.name) return;
    if (assetValue() !== committed) fallbackToSource(translation.changed);
  });
  const observer = new MutationObserver(syncSelection);
  observer.observe(editor, {attributes:true,attributeFilter:['hidden','class']});
  observer.observe(root, {attributes:true,attributeFilter:['data-tex-collaboration-document-id','data-tex-collaboration-access-role']});
  window.addEventListener('pagehide', () => {
    observer.disconnect(); fallbackToSource();
  }, {once:true});
  syncSelection();
}

const markdownVisualStyle = `
/* Identical size, typography and layout to native #tex-editor-mode. */
.tex-work-app .tex-editor-toolbar>.tex-markdown-view-modes{
  display:grid!important;align-content:end!important;gap:3px!important;
  flex:0 0 auto!important;min-width:118px!important;margin:0!important;
}
.tex-work-app .tex-editor-toolbar>.tex-markdown-view-modes>span{
  font-size:8px!important;font-weight:600!important;color:var(--muted)!important
}
.tex-work-app .tex-markdown-view-modes[hidden]{display:none!important}
.tex-work-app #tex-markdown-editor-mode{
  box-sizing:border-box;height:38px!important;min-height:38px!important;
  width:142px!important;max-width:160px!important;
  padding:0 24px 0 9px!important;margin:0!important;
  border-radius:10px!important;border:0!important;
  background:var(--surface)!important;color:var(--text)!important;
  box-shadow:inset 0 0 0 1px var(--border)!important;
  font-size:11px!important;font-weight:500!important;cursor:pointer
}
.tex-work-app #tex-markdown-editor-mode:disabled{opacity:.6!important;cursor:default}
.tex-work-app #tex-markdown-visual-panel[hidden]{display:none!important}
.tex-work-app #tex-editor.md-visual-mode.is-codemirror-asset>.tex-codemirror-host{display:none!important}
.tex-work-app #tex-editor.md-visual-mode>.tex-markdown-visual-panel{display:flex!important;grid-row:3;grid-column:1;min-width:0;min-height:470px;height:100%;box-sizing:border-box;flex-direction:column;overflow:hidden;background:var(--surface);color:var(--text)}
.tex-work-app .tex-markdown-formatbar{display:flex;gap:3px;align-items:center;flex:0 0 auto;min-height:42px;padding:4px 12px;border-bottom:1px solid var(--hairline);overflow-x:auto;scrollbar-width:thin}
.tex-work-app .tex-markdown-format-button{display:grid;place-items:center;flex:0 0 auto;min-width:30px!important;width:auto!important;height:30px!important;min-height:30px!important;padding:0 8px!important;border:0!important;border-radius:7px!important;background:transparent!important;color:var(--text)!important;font:650 12px/1 system-ui,sans-serif!important;white-space:nowrap;cursor:pointer}
.tex-work-app .tex-markdown-format-button:hover{background:var(--fill)!important}
.tex-work-app .tex-markdown-format-button:disabled{opacity:.4;cursor:default}
.tex-work-app .tex-markdown-visual-surface{flex:1;min-height:0;overflow:auto;padding:30px clamp(16px,5%,54px);scrollbar-gutter:stable}
.tex-work-app .tex-markdown-visual-surface .ProseMirror{width:min(850px,100%);min-height:90%;margin:0 auto;outline:none!important;color:var(--text);font:15px/1.8 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow-wrap:anywhere;white-space:normal}
.tex-work-app .tex-markdown-visual-surface .ProseMirror h1{font-size:2em;line-height:1.3;margin:.3em 0 .75em;font-weight:730}
.tex-work-app .tex-markdown-visual-surface .ProseMirror h2{font-size:1.5em;line-height:1.35;margin:1.3em 0 .55em;font-weight:700}
.tex-work-app .tex-markdown-visual-surface .ProseMirror h3{font-size:1.2em;line-height:1.45;margin:1.2em 0 .5em;font-weight:690}
.tex-work-app .tex-markdown-visual-surface .ProseMirror p{margin:.65em 0}
.tex-work-app .tex-markdown-visual-surface .ProseMirror ul,.tex-work-app .tex-markdown-visual-surface .ProseMirror ol{padding-left:1.6em}
.tex-work-app .tex-markdown-visual-surface .ProseMirror li{padding-left:.2em}
.tex-work-app .tex-markdown-visual-surface .ProseMirror blockquote{margin:1.2em 0;padding:.3em 1em;border-left:3px solid var(--primary);background:var(--fill);border-radius:0 6px 6px 0}
.tex-work-app .tex-markdown-visual-surface .ProseMirror pre{overflow-x:auto;padding:14px 17px;border-radius:8px;background:var(--fill);font:13px/1.6 ui-monospace,SFMono-Regular,Consolas,monospace}
.tex-work-app .tex-markdown-visual-surface .ProseMirror code{padding:.1em .3em;border-radius:4px;background:var(--fill);font: .88em/1.5 ui-monospace,Consolas,monospace}
.tex-work-app .tex-markdown-visual-surface .ProseMirror pre code{padding:0;background:transparent}
.tex-work-app .tex-markdown-visual-surface .ProseMirror a{color:var(--primary);text-decoration:underline}
.tex-work-app .tex-markdown-visual-surface .ProseMirror img{max-width:100%;height:auto}
.tex-work-app .tex-markdown-visual-surface .ProseMirror table{width:100%;border-collapse:collapse;margin:1em 0;font-size:.92em;table-layout:auto}
.tex-work-app .tex-markdown-visual-surface .ProseMirror th,.tex-work-app .tex-markdown-visual-surface .ProseMirror td{padding:8px 10px;border:1px solid var(--border);min-width:60px;vertical-align:top}
.tex-work-app .tex-markdown-visual-surface .ProseMirror th{background:var(--fill);font-weight:700}
.tex-work-app .tex-markdown-visual-surface .ProseMirror .selectedCell{background:color-mix(in srgb,var(--primary) 12%,transparent)}
.tex-work-app .tex-markdown-visual-surface .ProseMirror:focus-visible{outline:none!important}
.tex-work-app .tex-markdown-visual-hint{flex:0 0 auto;padding:5px 14px;border-top:1px solid var(--hairline);color:var(--muted);font-size:10px}
@media(max-width:760px){.tex-work-app .tex-editor-toolbar>.tex-markdown-view-modes{min-width:0!important;width:100%!important}.tex-work-app #tex-markdown-editor-mode{width:100%!important;max-width:100%!important}.tex-work-app .tex-markdown-visual-surface{padding:15px}.tex-work-app .tex-markdown-visual-surface .ProseMirror{font-size:16px}}
`;

export function enhanceWorkTexMarkdownVisual(markup) {
  const output = String(markup || "");
  if (!output.includes('id="tex-editor"') || output.includes('id="tex-markdown-visual-runtime"')) return output;
  return output +
    '<style id="tex-markdown-visual-style">' + markdownVisualStyle + '</style>' +
    '<script id="tex-markdown-visual-runtime">(' + markdownVisualRuntime.toString() + ')();</script>';
}
