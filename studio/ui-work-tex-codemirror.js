import { WORK_TEX_CODE_PALETTES, WORK_TEX_CODE_CHOICES } from "./tex-code-palettes.js";

function replaceExact(source, needle, replacement) {
  const index = source.indexOf(needle);
  if (index < 0) return source;
  return source.slice(0, index) + replacement + source.slice(index + needle.length);
}

export function enhanceWorkTexCodeMirror(markup, zh) {
  const copy = zh ? {
    loading: "正在加载高级编辑器…",
    failed: "高级编辑器加载失败，已继续使用基础编辑器。",
    remoteCursor: "协作者光标",
    remoteSelection: "协作者选区",
    cursorReady: "远程光标与选区已启用；每位协作者使用稳定的独立颜色。"
  } : {
    loading: "Loading the advanced editor…",
    failed: "The advanced editor could not load. The basic editor remains available.",
    remoteCursor: "Collaborator cursor",
    remoteSelection: "Collaborator selection",
    cursorReady: "Remote cursors and selections are enabled with a stable color for each collaborator."
  };

  let output = String(markup || "");

  output = replaceExact(
    output,
    `          if (connection) connection.presence = items;\n          const role = connection?.role || 'owner';\n          setStatus(role === 'viewer' ? 'readonly' : 'live', role === 'viewer' ? labels.readOnly : labels.connected, count);`,
    `          if (connection) connection.presence = items;\n          const role = connection?.role || 'owner';\n          const localSource = document.getElementById('tex-source');\n          const localStart = Number(localSource?.selectionStart) || 0;\n          const localEnd = Number(localSource?.selectionEnd) || 0;\n          const exactLocal = items.filter(person => person?.role === role && Number(person?.selection_start) === localStart && Number(person?.selection_end) === localEnd);\n          if (!window.__qssedaTexSelfParticipantId && exactLocal.length === 1) window.__qssedaTexSelfParticipantId = String(exactLocal[0]?.id || '');\n          const root = document.querySelector('.tex-work-app[data-tex-root]');\n          const documentId = String(root?.dataset?.texCollaborationDocumentId || document.querySelector('.tex-document-item.is-active')?.dataset?.texDocumentId || '');\n          const presenceSnapshot = {\n            document_id: documentId,\n            role,\n            participants: items.map(person => ({ ...person, self: Boolean(window.__qssedaTexSelfParticipantId && String(person?.id || '') === window.__qssedaTexSelfParticipantId) })),\n            at: Date.now()\n          };\n          window.__qssedaTexPresenceSnapshot = presenceSnapshot;\n          window.dispatchEvent(new CustomEvent('qsseda:tex-presence', { detail: presenceSnapshot }));\n          setStatus(role === 'viewer' ? 'readonly' : 'live', role === 'viewer' ? labels.readOnly : labels.connected, count);`
  );

  output = replaceExact(
    output,
    `        undoButton.addEventListener('click', () => { source.focus(); document.execCommand('undo'); });\n        redoButton.addEventListener('click', () => { source.focus(); document.execCommand('redo'); });`,
    `        undoButton.addEventListener('click', () => {\n          const bridge = window.__qssedaTexEditorBridge;\n          if (bridge?.undo) bridge.undo();\n          else { source.focus(); document.execCommand('undo'); }\n        });\n        redoButton.addEventListener('click', () => {\n          const bridge = window.__qssedaTexEditorBridge;\n          if (bridge?.redo) bridge.redo();\n          else { source.focus(); document.execCommand('redo'); }\n        });`
  );

  output = output
    .replaceAll("远程位置已同步，彩色光标绘制将在编辑器升级为 CodeMirror 后启用。", copy.cursorReady)
    .replaceAll("Remote positions are synchronized; visual cursor rendering will enable after the editor moves to CodeMirror.", copy.cursorReady);

  output += `
    <style id="qsseda-work-tex-codemirror-style">
      .tex-work-app .tex-codemirror-host{
        position:relative!important;
        min-width:0!important;
        min-height:470px!important;
        height:100%!important;
        overflow:hidden!important;
        background:transparent!important;
      }
      .tex-work-app #tex-source.tex-source-bridge{
        position:absolute!important;
        left:-10000px!important;
        top:0!important;
        width:1px!important;
        min-width:1px!important;
        height:1px!important;
        min-height:1px!important;
        padding:0!important;
        margin:0!important;
        opacity:0!important;
        pointer-events:none!important;
        overflow:hidden!important;
        resize:none!important;
      }
      .tex-work-app .tex-codemirror-host>.cm-editor{
        width:100%!important;
        height:100%!important;
        min-height:470px!important;
        background:transparent!important;
        color:var(--text)!important;
        outline:none!important;
      }
      .tex-work-app .tex-codemirror-host .cm-scroller{
        height:100%!important;
        overflow:auto!important;
        overscroll-behavior:contain!important;
        font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace!important;
        font-size:13px!important;
        line-height:1.62!important;
        scrollbar-gutter:stable;
      }
      .tex-work-app .tex-codemirror-host .cm-content{
        min-height:100%!important;
        padding:11px 0 24px!important;
        caret-color:var(--primary)!important;
      }
      .tex-work-app .tex-codemirror-host .cm-content:focus,
      .tex-work-app .tex-codemirror-host .cm-content:focus-visible{
        outline:none!important;
        box-shadow:none!important;
      }
      .tex-work-app .tex-codemirror-host>.cm-editor.cm-focused{
        outline:none!important;
        box-shadow:none!important;
      }
      .tex-work-app .tex-codemirror-host .cm-line{padding:0 16px!important}
      .tex-work-app .tex-codemirror-host .cm-gutters{
        border-right:1px solid var(--hairline)!important;
        background:color-mix(in srgb,var(--fill) 60%,transparent)!important;
        color:var(--quiet)!important;
      }
      .tex-work-app .tex-codemirror-host .cm-lineNumbers .cm-gutterElement{padding:0 9px 0 8px!important;font-size:9px!important}
      .tex-work-app .tex-codemirror-host .cm-activeLine,
      .tex-work-app .tex-codemirror-host .cm-activeLineGutter{background:color-mix(in srgb,var(--primary) 4%,transparent)!important}
      .tex-work-app .tex-codemirror-host .cm-selectionBackground,
      .tex-work-app .tex-codemirror-host .cm-content ::selection{background:color-mix(in srgb,var(--primary) 20%,transparent)!important}
      .tex-work-app .tex-codemirror-host .cm-cursor{border-left-color:var(--primary)!important;border-left-width:1.5px!important}
      .tex-work-app .tex-codemirror-host .cm-panels{background:var(--surface)!important;color:var(--text)!important}
      .tex-work-app .tex-codemirror-host .cm-panels input{background:var(--fill)!important;color:var(--text)!important;border:1px solid var(--border)!important;border-radius:7px!important}
      .tex-work-app .tex-codemirror-host .cm-tooltip{border:1px solid var(--border)!important;border-radius:10px!important;background:var(--surface)!important;color:var(--text)!important;box-shadow:0 10px 30px rgba(0,0,0,.12)!important;overflow:hidden!important}
      .tex-work-app .tex-codemirror-host.is-readonly .cm-content{cursor:default!important}
      .tex-work-app .tex-codemirror-host.is-readonly .cm-cursor{display:none!important}

      .tex-cm-remote-layer{
        position:absolute!important;
        inset:0!important;
        z-index:8!important;
        overflow:hidden!important;
        pointer-events:none!important;
      }
      .tex-cm-remote-selection{
        position:absolute!important;
        border-radius:2px!important;
        pointer-events:none!important;
      }
      .tex-cm-remote-caret{
        position:absolute!important;
        width:2px!important;
        min-width:2px!important;
        border-radius:999px!important;
        pointer-events:none!important;
        transform:translateX(-1px);
      }
      .tex-cm-remote-caret.is-typing{animation:qssedaRemoteCaretPulse .72s ease-in-out infinite alternate}
      .tex-cm-remote-label{
        position:absolute!important;
        left:0!important;
        bottom:calc(100% + 3px)!important;
        max-width:150px!important;
        padding:3px 6px!important;
        border-radius:6px!important;
        color:#fff!important;
        font:700 8px/1.25 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;
        white-space:nowrap!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        box-shadow:0 2px 7px rgba(0,0,0,.16)!important;
      }
      @keyframes qssedaRemoteCaretPulse{from{opacity:.55}to{opacity:1}}
      @media(max-width:760px), (max-width:950px) and (pointer:coarse){
        .tex-work-app .tex-codemirror-host{min-height:0!important;height:100%!important}
        .tex-work-app .tex-codemirror-host>.cm-editor{min-height:0!important;height:100%!important}
        .tex-work-app .tex-codemirror-host .cm-scroller{font-size:16px!important;line-height:1.58!important;-webkit-overflow-scrolling:touch}
        .tex-work-app .tex-codemirror-host .cm-content{padding:12px 0 24px!important}
        .tex-work-app .tex-codemirror-host .cm-line{padding:0 14px!important}
        .tex-work-app .tex-codemirror-host .cm-gutters{display:none!important}
        .tex-cm-remote-label{font-size:9px!important;padding:4px 6px!important}
      }

      /* Code palettes are independent of the site and preview surfaces. */
      .tex-work-app .tex-editor-toolbar .tex-code-theme-picker{
        display:flex;flex:0 0 auto;align-items:center;align-self:end;position:relative;
        min-width:0;margin:0;z-index:4
      }
      .tex-work-app .tex-editor-toolbar #tex-code-theme-toggle{
        display:flex!important;align-items:center!important;gap:5px!important;
        min-height:34px!important;height:34px!important;max-width:165px!important;
        padding:0 9px!important;margin:0!important;border:1px solid var(--border)!important;
        border-radius:8px!important;background:var(--fill)!important;color:var(--text)!important;
        box-shadow:none!important;cursor:pointer;font:600 11px/1.3 system-ui,sans-serif!important;
        white-space:nowrap!important
      }
      .tex-work-app #tex-code-theme-toggle:focus-visible{
        outline:2px solid var(--primary)!important;outline-offset:2px
      }
      .tex-code-theme-swatch{width:9px;height:9px;display:inline-block;flex:0 0 9px;
        border-radius:3px;border:2px solid currentColor;box-sizing:content-box}
      .tex-code-theme-swatch+.tex-code-theme-swatch{margin-left:-8px;margin-right:4px}
      .tex-code-theme-caret{margin-left:2px;font-size:13px;color:var(--muted)}
      .tex-work-app #tex-editor.md-visual-mode .tex-code-theme-picker{display:none!important}
      .tex-code-theme-popover{
        box-sizing:border-box;position:fixed;z-index:2147480000;
        width:min(560px,calc(100vw - 20px));max-height:calc(100dvh - 20px);
        overflow:auto;padding:16px;border:1px solid var(--border);
        border-radius:14px;background:var(--surface);color:var(--text);
        box-shadow:0 14px 48px rgba(0,0,0,.28);
        font:12px/1.5 system-ui,-apple-system,Segoe UI,sans-serif
      }
      .tex-code-theme-popover[hidden]{display:none!important}
      .tex-code-theme-popover>header{display:flex;align-items:center;justify-content:space-between;gap:10px}
      .tex-code-theme-popover>header strong{font-size:15px;font-weight:700}
      .tex-code-theme-popover>p{margin:6px 0 12px;color:var(--muted);font-size:11px}
      .tex-code-theme-close{width:29px;height:29px;min-width:29px;border:0;border-radius:7px;
        background:var(--fill);color:var(--text);font-size:19px;cursor:pointer}
      .tex-code-theme-card-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
      .tex-code-theme-card{display:flex;min-width:0;flex-direction:column;gap:9px}
      .tex-code-theme-card>label{font:650 12px/1.4 system-ui,sans-serif;display:grid;gap:7px}
      .tex-code-theme-card select{height:36px;min-height:36px;width:100%;box-sizing:border-box;
        border:1px solid var(--border);border-radius:8px;padding:0 9px;
        background:var(--fill);color:var(--text);font-size:12px;cursor:pointer}
      .tex-code-theme-card select:focus-visible,.tex-code-theme-close:focus-visible{
        outline:2px solid var(--primary);outline-offset:2px}
      .tex-code-theme-preview{box-sizing:border-box;border-radius:9px;
        min-width:0;min-height:130px;padding:10px 7px;overflow:auto;
        border:1px solid color-mix(in srgb,var(--text) 12%,transparent)}
      .tex-code-theme-preview pre{margin:0;font:11px/1.75 ui-monospace,SFMono-Regular,Consolas,monospace}
      .tex-code-theme-preview pre>div{white-space:pre}
      .tex-code-preview-number{display:inline-block;min-width:19px;margin-right:9px;text-align:right;user-select:none}
      .tex-code-theme-card>small{font-size:10px;color:var(--muted)}
      @media(max-width:570px){
        .tex-code-theme-card-row{grid-template-columns:minmax(0,1fr)}
        .tex-code-theme-preview{min-height:108px}
        .tex-code-theme-preview pre{font-size:11px}
        .tex-code-theme-popover{padding:12px}
      }
      .tex-work-app #tex-editor[data-code-theme] .tex-codemirror-host,
      .tex-work-app #tex-editor[data-code-theme] .tex-codemirror-host>.cm-editor,
      .tex-work-app #tex-editor[data-code-theme] .tex-codemirror-host .cm-scroller{
        background:var(--aertex-code-bg)!important;color:var(--aertex-code-fg)!important
      }
      .tex-work-app #tex-editor[data-code-theme] .tex-codemirror-host .cm-gutters{
        background:var(--aertex-code-gutter)!important;
        border-right:1px solid var(--aertex-code-line)!important;
        color:var(--aertex-code-gutter-text)!important
      }
      .tex-work-app #tex-editor[data-code-theme] .tex-codemirror-host .cm-activeLine,
      .tex-work-app #tex-editor[data-code-theme] .tex-codemirror-host .cm-activeLineGutter{
        background:var(--aertex-code-line)!important
      }
      .tex-work-app #tex-editor[data-code-theme] .tex-codemirror-host .cm-selectionBackground,
      .tex-work-app #tex-editor[data-code-theme] .tex-codemirror-host .cm-content ::selection{
        background:var(--aertex-code-selection)!important
      }
      .tex-work-app #tex-editor[data-code-theme] .tex-codemirror-host .cm-cursor{
        border-left-color:var(--aertex-code-caret)!important
      }
      .tex-work-app #tex-editor[data-code-theme] #tex-source:not(.tex-source-bridge){
        background:var(--aertex-code-bg)!important;color:var(--aertex-code-fg)!important
      }
      @media(max-width:760px){
        .tex-work-app .tex-editor-toolbar{flex-wrap:wrap}
        .tex-work-app .tex-editor-toolbar .tex-code-theme-picker{
          flex:0 0 auto;max-width:138px
        }
        .tex-work-app .tex-editor-toolbar #tex-code-theme-toggle{
          height:32px!important;min-height:32px!important;font-size:10px!important
        }
      }
    </style>
    <script id="qsseda-work-tex-codemirror-runtime">
      (() => {
        if (window.__qssedaTexCodeMirrorReady) return;
        window.__qssedaTexCodeMirrorReady = true;

        const labels = ${JSON.stringify(copy)};
        const root = document.querySelector('.tex-work-app[data-tex-root]');
        const source = document.getElementById('tex-source');
        const editor = document.getElementById('tex-editor');
        if (!root || !source || !editor) return;
        let view = null;


        // Work code colors have two independently persisted choices.
        // The SITE controls which choice is active; code colors never
        // mutate the site theme, PDF canvas, or Markdown WYSIWYG.
        const codeColorSchemes = ${JSON.stringify(WORK_TEX_CODE_PALETTES)};
        const codeThemeChoices = ${JSON.stringify(WORK_TEX_CODE_CHOICES)};
        const codeThemeStorageKey = 'aertex.work.code-color-scheme.v1';
        const colorKeys = {
          light: 'aertex.work.code-color-scheme.light.v2',
          dark: 'aertex.work.code-color-scheme.dark.v2'
        };
        const codeThemeById = new Map(codeThemeChoices.map(item => [item[0],item]));
        const modeForSite = () => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
        const safeId = (id, mode) => codeColorSchemes[id] &&
          codeColorSchemes[id].dark === (mode === 'dark') ? id : '';
        const defaultId = mode => mode === 'dark' ? 'auto-dark' : 'auto-light';
        const readChoice = mode => {
          try {
            const current = safeId(localStorage.getItem(colorKeys[mode]), mode);
            if (current) return current;
            // One-way compatibility with the earlier single-selector setting.
            const legacy = safeId(localStorage.getItem(codeThemeStorageKey), mode);
            if (legacy) return legacy;
          } catch {}
          return defaultId(mode);
        };
        const selectedCodeThemes = {
          light: readChoice('light'),
          dark: readChoice('dark')
        };
        let codeThemeCompartment = null;
        let makeCodeThemeExtension = null;
        const resolvedCodeThemeId = () => selectedCodeThemes[modeForSite()];
        const resolvedCodePalette = () => codeColorSchemes[resolvedCodeThemeId()];
        const zhPaletteUi = document.documentElement.lang.toLowerCase().startsWith('zh');
        const toolbar = editor.querySelector('.tex-editor-toolbar');
        const picker = document.createElement('div');
        picker.className = 'tex-code-theme-picker';
        picker.id = 'tex-code-theme-picker';
        const pickerButton = document.createElement('button');
        pickerButton.type = 'button';
        pickerButton.id = 'tex-code-theme-toggle';
        pickerButton.setAttribute('aria-expanded','false');
        pickerButton.setAttribute('aria-haspopup','dialog');
        pickerButton.setAttribute('aria-controls','tex-code-theme-popover');
        pickerButton.setAttribute('aria-label',zhPaletteUi ? '选择代码配色' : 'Choose code colors');
        const lightSwatch = document.createElement('i');
        lightSwatch.className = 'tex-code-theme-swatch';
        lightSwatch.setAttribute('aria-hidden','true');
        const darkSwatch = document.createElement('i');
        darkSwatch.className = 'tex-code-theme-swatch';
        darkSwatch.setAttribute('aria-hidden','true');
        const pickerText = document.createElement('span');
        pickerText.textContent = zhPaletteUi ? '代码配色' : 'Code colors';
        const caret = document.createElement('span');
        caret.className = 'tex-code-theme-caret';
        caret.textContent = '⌄';
        caret.setAttribute('aria-hidden','true');
        pickerButton.append(lightSwatch,darkSwatch,pickerText,caret);
        picker.append(pickerButton);
        toolbar?.append(picker);
        const popover = document.createElement('section');
        popover.id = 'tex-code-theme-popover';
        popover.className = 'tex-code-theme-popover';
        popover.hidden = true;
        popover.setAttribute('role','dialog');
        popover.setAttribute('aria-label',
          zhPaletteUi ? '为浅色和深色模式分别选择代码配色' :
          'Choose separate code colors for light and dark modes');
        const header = document.createElement('header');
        const headline = document.createElement('strong');
        headline.textContent = zhPaletteUi ? '编辑器配色' : 'Editor colors';
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'tex-code-theme-close';
        closeButton.textContent = '×';
        closeButton.setAttribute('aria-label',zhPaletteUi ? '关闭' : 'Close');
        header.append(headline,closeButton);
        const explanations = document.createElement('p');
        explanations.textContent = zhPaletteUi ?
          '浅色与深色分别记忆，随网站外观自动切换。不影响 PDF 或全站主题。' :
          'Each appearance has its own saved palette. Switching follows the website without affecting PDFs.';
        const cardRow = document.createElement('div');
        cardRow.className = 'tex-code-theme-card-row';
        const controls = {};
        const previews = {};
        for (const mode of ['light','dark']) {
          const card = document.createElement('section');
          card.className = 'tex-code-theme-card';
          card.dataset.mode = mode;
          const caption = document.createElement('label');
          caption.textContent = mode === 'light'
            ? (zhPaletteUi ? '☀ 浅色模式' : '☀ Light mode')
            : (zhPaletteUi ? '☾ 深色模式' : '☾ Dark mode');
          const select = document.createElement('select');
          select.id = 'tex-code-theme-' + mode;
          for (const option of codeThemeChoices) {
            if (!safeId(option[0],mode)) continue;
            const el = document.createElement('option');
            el.value = option[0];
            el.textContent = zhPaletteUi ? option[1] : option[2];
            select.append(el);
          }
          select.value = selectedCodeThemes[mode];
          controls[mode] = select;
          caption.append(select);
          const preview = document.createElement('div');
          preview.className = 'tex-code-theme-preview';
          preview.setAttribute('aria-label',mode === 'light' ?
            (zhPaletteUi?'浅色代码预览':'Light source preview') :
            (zhPaletteUi?'深色代码预览':'Dark source preview'));
          previews[mode] = preview;
          const hint = document.createElement('small');
          hint.textContent = mode === 'light'
            ? (zhPaletteUi?'网站浅色时自动采用':'Applied when site is light')
            : (zhPaletteUi?'网站深色时自动采用':'Applied when site is dark');
          card.append(caption,preview,hint);
          cardRow.append(card);
        }
        popover.append(header,explanations,cardRow);
        document.body.append(popover);
        function showPreview(mode) {
          const p = codeColorSchemes[selectedCodeThemes[mode]];
          const target = previews[mode];
          target.replaceChildren();
          target.style.background = p.bg;
          target.style.color = p.fg;
          const sample = [
            [[ 'command', String.fromCharCode(92)+'documentclass' ],['symbol','{article}']],
            [[ 'command', String.fromCharCode(92)+'usepackage' ],['symbol','{graphicx}']],
            [[ 'comment','% Example source' ]],
            [[ 'command', String.fromCharCode(92)+'section' ],['symbol','{Introduction}']],
            [[ 'string','Hello, TeX!']]
          ];
          const pre = document.createElement('pre');
          for (let line = 0; line < sample.length; line++) {
            const row = document.createElement('div');
            const number = document.createElement('span');
            number.textContent = String(line + 1);
            number.className = 'tex-code-preview-number';
            number.style.color = p.gutterText;
            row.append(number);
            for (const [type,fragment] of sample[line]) {
              const chunk = document.createElement('span');
              chunk.textContent = fragment;
              chunk.style.color = p[type] || p.fg;
              row.append(chunk);
            }
            pre.append(row);
          }
          target.append(pre);
        }
        function refreshPicker() {
          lightSwatch.style.background = codeColorSchemes[selectedCodeThemes.light].bg;
          darkSwatch.style.background = codeColorSchemes[selectedCodeThemes.dark].bg;
          lightSwatch.style.borderColor = codeColorSchemes[selectedCodeThemes.light].command;
          darkSwatch.style.borderColor = codeColorSchemes[selectedCodeThemes.dark].command;
          for (const mode of ['light','dark']) {
            controls[mode].value = selectedCodeThemes[mode];
            showPreview(mode);
          }
          pickerButton.title = (zhPaletteUi ? '浅色：' : 'Light: ') +
            (codeThemeById.get(selectedCodeThemes.light)?.[zhPaletteUi?1:2] || '') +
            ' · ' + (zhPaletteUi ? '深色：' : 'Dark: ') +
            (codeThemeById.get(selectedCodeThemes.dark)?.[zhPaletteUi?1:2] || '');
        }
        function applyCodeColors() {
          const palette = resolvedCodePalette();
          editor.dataset.codeTheme = resolvedCodeThemeId();
          editor.style.setProperty('--aertex-code-bg',palette.bg);
          editor.style.setProperty('--aertex-code-fg',palette.fg);
          editor.style.setProperty('--aertex-code-gutter',palette.gutter);
          editor.style.setProperty('--aertex-code-gutter-text',palette.gutterText);
          editor.style.setProperty('--aertex-code-line',palette.line);
          editor.style.setProperty('--aertex-code-selection',palette.selection);
          editor.style.setProperty('--aertex-code-caret',palette.caret);
          if (view && codeThemeCompartment && makeCodeThemeExtension) {
            view.dispatch({
              effects: codeThemeCompartment.reconfigure(makeCodeThemeExtension())
            });
          }
        }
        function positionPopover() {
          if (popover.hidden) return;
          const rect = pickerButton.getBoundingClientRect();
          const w = popover.offsetWidth, h = popover.offsetHeight;
          const left = Math.max(10,Math.min(window.innerWidth-w-10,rect.right-w));
          const below = rect.bottom+8;
          const top = below+h+10 <= window.innerHeight ?
            below : Math.max(10,rect.top-h-8);
          popover.style.left = left+'px';
          popover.style.top = top+'px';
        }
        function closePopover(returnFocus=false) {
          if (popover.hidden) return;
          popover.hidden = true;
          pickerButton.setAttribute('aria-expanded','false');
          if (returnFocus) pickerButton.focus();
        }
        pickerButton.addEventListener('click',() => {
          if (!popover.hidden) { closePopover();return; }
          popover.hidden=false;
          pickerButton.setAttribute('aria-expanded','true');
          positionPopover();
          controls[modeForSite()].focus({preventScroll:true});
        });
        closeButton.addEventListener('click',()=>closePopover(true));
        for (const mode of ['light','dark']) controls[mode].addEventListener('change',() => {
          const value = safeId(controls[mode].value,mode) || defaultId(mode);
          selectedCodeThemes[mode] = value;
          try { localStorage.setItem(colorKeys[mode],value); } catch {}
          refreshPicker();
          if (modeForSite() === mode) applyCodeColors();
        });
        document.addEventListener('pointerdown',event=>{
          if (!popover.hidden && !popover.contains(event.target) && !picker.contains(event.target))
            closePopover();
        },true);
        document.addEventListener('keydown',event=>{
          if (event.key === 'Escape' && !popover.hidden) {
            event.preventDefault();
            closePopover(true);
          }
        });
        window.addEventListener('resize',positionPopover,{passive:true});
        window.addEventListener('scroll',positionPopover,{passive:true,capture:true});
        const onGlobalThemeChange = () => applyCodeColors();
        window.addEventListener('aertex-themechange',onGlobalThemeChange);
        const themeObserver = new MutationObserver(onGlobalThemeChange);
        themeObserver.observe(document.documentElement,{
          attributes:true,attributeFilter:['data-theme']
        });
        const pickerObserver = new MutationObserver(()=>{
          if (editor.hidden || editor.classList.contains('md-visual-mode'))closePopover();
        });
        pickerObserver.observe(editor,{attributes:true,attributeFilter:['hidden','class']});
        window.addEventListener('storage',event=>{
          if (event.key !== colorKeys.light && event.key !== colorKeys.dark) return;
          const mode = event.key === colorKeys.light ? 'light' : 'dark';
          const next = safeId(event.newValue,mode) || defaultId(mode);
          if (selectedCodeThemes[mode] === next) return;
          selectedCodeThemes[mode] = next;
          refreshPicker();
          if (modeForSite() === mode) applyCodeColors();
        });
        window.addEventListener('pagehide',()=>{
          themeObserver.disconnect();
          pickerObserver.disconnect();
          window.removeEventListener('aertex-themechange',onGlobalThemeChange);
          window.removeEventListener('resize',positionPopover);
          window.removeEventListener('scroll',positionPopover,true);
          popover.remove();
        },{once:true});
        refreshPicker();
        applyCodeColors();

        let host = null;
        let remoteLayer = null;
        let remoteParticipants = [];
        let remoteFrame = 0;
        let resizeObserver = null;
        let sourceSyncQueued = false;
        let syncingToSource = false;
        let syncingFromSource = false;
        let applyingHistory = false;
        let activeHistoryDocument = '';
        let undoStack = [];
        let redoStack = [];
        let historyGroupStartedAt = 0;
        let inferredSelfId = String(window.__qssedaTexSelfParticipantId || '');
        // The same CodeMirror view edits main.tex or any supplementary UTF-8 file.
        // The main source bridge must never receive supplementary text.
        let currentAsset = null;
        let parkedMainState = null;
        let parkedMainHistory = null;
        let parkedMainDocumentId = '';
        let EditorStateClass = null;
        let texExtensions = null;
        let textExtensions = null;
        let languageParserForFilename = null;
        let streamLanguageClass = null;

        const valueDescriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
        const nativeFocus = source.focus.bind(source);
        const nativeValue = () => String(valueDescriptor?.get ? valueDescriptor.get.call(source) : source.textContent || '');

        function activeDocumentId() {
          return String(root.dataset.texCollaborationDocumentId || document.querySelector('.tex-document-item.is-active')?.dataset?.texDocumentId || '').trim();
        }

        function accessRole() {
          const role = String(root.dataset.texCollaborationAccessRole || 'owner');
          return role === 'viewer' ? 'viewer' : role === 'editor' ? 'editor' : 'owner';
        }

        function clamp(value, maximum) {
          const number = Number(value);
          if (!Number.isFinite(number)) return 0;
          return Math.max(0, Math.min(maximum, Math.floor(number)));
        }

        function resetHistoryIfDocumentChanged(nextValue = null) {
          const id = activeDocumentId();
          if (id === activeHistoryDocument) return;
          activeHistoryDocument = id;
          undoStack = [];
          redoStack = [];
          historyGroupStartedAt = 0;
          remoteParticipants = [];
          if (nextValue !== null) scheduleRemoteRender();
        }

        function recordUndo(startState) {
          if (applyingHistory || syncingFromSource) return;
          const now = Date.now();
          if (!historyGroupStartedAt || now - historyGroupStartedAt > 1200) {
            const selection = startState.selection.main;
            undoStack.push({ doc: startState.doc.toString(), anchor: selection.anchor, head: selection.head });
            if (undoStack.length > 120) undoStack.shift();
            historyGroupStartedAt = now;
          }
          redoStack = [];
        }

        function setBridgeSelection(anchor, head, notify = true) {
          const maximum = nativeValue().length;
          const a = clamp(anchor, maximum);
          const h = clamp(head, maximum);
          const start = Math.min(a, h);
          const end = Math.max(a, h);
          try { source.setSelectionRange(start, end, a <= h ? 'forward' : 'backward'); } catch {}
          if (notify) source.dispatchEvent(new Event('select', { bubbles: true }));
        }

        function publishViewToBridge(update) {
          if (!view || syncingFromSource) return;
          if (currentAsset) {
            if (update.docChanged) recordUndo(update.startState);
            if (update.docChanged || update.selectionSet) {
              window.dispatchEvent(new CustomEvent('aertex:tex-code-asset-updated', {
                detail: { name: currentAsset.name, document_id: currentAsset.documentId,
                  content: update.state.doc.toString(), changed: update.docChanged }
              }));
            }
            applyReadOnly();
            return;
          }
          resetHistoryIfDocumentChanged();
          if (update.docChanged) recordUndo(update.startState);
          const selection = update.state.selection.main;
          syncingToSource = true;
          try {
            if (update.docChanged) {
              source.value = update.state.doc.toString();
              setBridgeSelection(selection.anchor, selection.head, false);
              source.dispatchEvent(new Event('input', { bubbles: true }));
            } else if (update.selectionSet) {
              setBridgeSelection(selection.anchor, selection.head, true);
            }
          } finally {
            syncingToSource = false;
          }
          if (update.docChanged || update.selectionSet || update.viewportChanged || update.geometryChanged) scheduleRemoteRender();
          applyReadOnly();
        }

        function syncViewFromSource() {
          if (!view || syncingToSource || currentAsset) return;
          const next = nativeValue();
          resetHistoryIfDocumentChanged(next);
          const current = view.state.doc.toString();
          const maximum = next.length;
          const anchor = clamp(source.selectionStart, maximum);
          const head = clamp(source.selectionEnd, maximum);
          const currentSelection = view.state.selection.main;
          if (current === next && currentSelection.anchor === anchor && currentSelection.head === head) return;
          syncingFromSource = true;
          try {
            const transaction = {};
            if (current !== next) transaction.changes = { from: 0, to: current.length, insert: next };
            transaction.selection = { anchor, head };
            view.dispatch(transaction);
          } finally {
            syncingFromSource = false;
          }
          scheduleRemoteRender();
        }

        function queueSourceSync() {
          if (!view || syncingToSource || sourceSyncQueued) return;
          sourceSyncQueued = true;
          queueMicrotask(() => {
            sourceSyncQueued = false;
            syncViewFromSource();
          });
        }

        function applyReadOnly() {
          if (!view || !host) return;
          const readOnly = source.readOnly || accessRole() === 'viewer' || (currentAsset && accessRole() === 'editor');
          host.classList.toggle('is-readonly', readOnly);
          if (view.contentDOM.contentEditable !== String(!readOnly)) view.contentDOM.contentEditable = String(!readOnly);
          view.contentDOM.setAttribute('aria-readonly', String(readOnly));
        }

        function colorFor(person) {
          const key = String(person?.id || person?.username || person?.display_name || 'collaborator');
          let hash = 2166136261;
          for (let index = 0; index < key.length; index += 1) {
            hash ^= key.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
          }
          return Math.abs(hash) % 360;
        }

        function inferSelf(participants) {
          // Self identity comes from the server-assigned WebSocket client id,
          // never inferred from matching cursor positions or membership roles.
          const self = (Array.isArray(participants) ? participants : [])
            .find(person => person?.self === true);
          inferredSelfId = self ? String(self?.client_id || '') : '';
          return inferredSelfId;
        }

        function participantName(person) {
          return String(person?.display_name || person?.username || labels.remoteCursor).trim().slice(0, 80) || labels.remoteCursor;
        }

        function appendSelectionRect(from, to, hue, hostRect) {
          if (!view || !remoteLayer || from >= to) return;
          const doc = view.state.doc;
          let line = doc.lineAt(from);
          let rendered = 0;
          while (line && rendered < 120) {
            const segmentFrom = Math.max(from, line.from);
            const segmentTo = Math.min(to, line.to);
            const a = view.coordsAtPos(segmentFrom, 1);
            const b = view.coordsAtPos(segmentTo, -1);
            if (a && b) {
              const left = Math.min(a.left, b.left) - hostRect.left;
              const right = Math.max(a.left, b.left) - hostRect.left;
              const top = a.top - hostRect.top;
              const height = Math.max(2, a.bottom - a.top);
              const rect = document.createElement('span');
              rect.className = 'tex-cm-remote-selection';
              rect.setAttribute('aria-label', labels.remoteSelection);
              rect.style.left = left + 'px';
              rect.style.top = top + 'px';
              rect.style.width = Math.max(3, right - left) + 'px';
              rect.style.height = height + 'px';
              rect.style.background = 'hsla(' + hue + ',72%,52%,.16)';
              remoteLayer.append(rect);
            }
            rendered += 1;
            if (line.to >= to || line.number >= doc.lines) break;
            line = doc.line(line.number + 1);
          }
        }

        function renderRemotePresence() {
          remoteFrame = 0;
          if (!view || !host || !remoteLayer) return;
          remoteLayer.replaceChildren();
          if (editor.hidden || !activeDocumentId() || currentAsset) return;
          const hostRect = host.getBoundingClientRect();
          const docLength = view.state.doc.length;
          const selfId = inferSelf(remoteParticipants);
          let labelOffset = 0;
          for (const person of remoteParticipants) {
            if (!person || person.self || (selfId && String(person.client_id || '') === selfId)) continue;
            const start = clamp(person.selection_start, docLength);
            const end = clamp(person.selection_end, docLength);
            const from = Math.min(start, end);
            const to = Math.max(start, end);
            const hue = colorFor(person);
            if (from !== to) appendSelectionRect(from, to, hue, hostRect);

            const caretPosition = clamp(person.caret_position ?? end, docLength);
            const coords = view.coordsAtPos(caretPosition, caretPosition === docLength ? -1 : 1);
            if (!coords) continue;
            const top = coords.top - hostRect.top;
            const left = coords.left - hostRect.left;
            const height = Math.max(14, coords.bottom - coords.top);
            const caret = document.createElement('span');
            caret.className = 'tex-cm-remote-caret' + (person.typing ? ' is-typing' : '');
            caret.setAttribute('aria-label', labels.remoteCursor + ': ' + participantName(person));
            caret.style.left = left + 'px';
            caret.style.top = top + 'px';
            caret.style.height = height + 'px';
            caret.style.background = 'hsl(' + hue + ' 72% 48%)';

            const label = document.createElement('span');
            label.className = 'tex-cm-remote-label';
            label.textContent = participantName(person);
            label.style.background = 'hsl(' + hue + ' 72% 42%)';
            if (top < 24) {
              label.style.bottom = 'auto';
              label.style.top = 'calc(100% + 3px)';
            }
            if (labelOffset) label.style.transform = 'translateY(' + ((labelOffset % 3) * 2) + 'px)';
            labelOffset += 1;
            caret.append(label);
            remoteLayer.append(caret);
          }
        }

        function scheduleRemoteRender() {
          if (remoteFrame) return;
          remoteFrame = window.requestAnimationFrame(renderRemotePresence);
        }

        function onPresence(event) {
          const detail = event?.detail || window.__qssedaTexPresenceSnapshot || {};
          const currentId = activeDocumentId();
          if (detail?.document_id && currentId && String(detail.document_id) !== currentId) return;
          remoteParticipants = Array.isArray(detail?.participants) ? detail.participants : [];
          scheduleRemoteRender();
        }

        function applyHistorySnapshot(snapshot, targetStack) {
          if (!view || !snapshot || accessRole() === 'viewer' || source.readOnly) return false;
          const currentSelection = view.state.selection.main;
          targetStack.push({ doc: view.state.doc.toString(), anchor: currentSelection.anchor, head: currentSelection.head });
          if (targetStack.length > 120) targetStack.shift();
          applyingHistory = true;
          try {
            view.dispatch({
              changes: { from: 0, to: view.state.doc.length, insert: snapshot.doc },
              selection: {
                anchor: clamp(snapshot.anchor, snapshot.doc.length),
                head: clamp(snapshot.head, snapshot.doc.length)
              },
              scrollIntoView: true
            });
          } finally {
            applyingHistory = false;
          }
          historyGroupStartedAt = 0;
          return true;
        }

        function undo() {
          const snapshot = undoStack.pop();
          if (!snapshot) return false;
          return applyHistorySnapshot(snapshot, redoStack);
        }

        function redo() {
          const snapshot = redoStack.pop();
          if (!snapshot) return false;
          return applyHistorySnapshot(snapshot, undoStack);
        }


        // Swap CodeMirror EditorState, not DOM editors. Restore main.tex's state,
        // native undo history, source synchronization and collaboration on return.
        function openAssetEditor(asset) {
          if (!view || !EditorStateClass || !asset || asset.encoding !== 'utf8' || !asset.name) return false;
          const documentId = activeDocumentId();
          if (!currentAsset) {
            parkedMainState = view.state;
            parkedMainDocumentId = documentId;
            parkedMainHistory = { undo: undoStack, redo: redoStack, startedAt: historyGroupStartedAt };
          }
          currentAsset = { name: String(asset.name), documentId };
          undoStack = [];
          redoStack = [];
          historyGroupStartedAt = 0;
          const isTeX = /\.(?:tex|ltx|sty|cls|dtx|ins)$/i.test(currentAsset.name);
          let extensions = isTeX ? texExtensions : textExtensions;
          if (!isTeX && languageParserForFilename && streamLanguageClass) {
            try {
              const parser = languageParserForFilename(currentAsset.name);
              if (parser) extensions = [...textExtensions, streamLanguageClass.define(parser)];
            } catch (error) {
              console.warn('AERTEX: syntax mode unavailable for ' + currentAsset.name, error);
            }
          }
          view.setState(EditorStateClass.create({
            doc: String(asset.content ?? ''),
            extensions
          }));
          host?.classList.add('is-project-asset');
          remoteLayer?.replaceChildren();
          applyReadOnly();
          return true;
        }

        function closeAssetEditor() {
          if (!view || !currentAsset) return false;
          const sameProject = parkedMainDocumentId === activeDocumentId();
          currentAsset = null;
          const savedState = parkedMainState;
          const savedHistory = parkedMainHistory;
          parkedMainState = null;
          parkedMainHistory = null;
          parkedMainDocumentId = '';
          if (sameProject && savedHistory) {
            undoStack = savedHistory.undo;
            redoStack = savedHistory.redo;
            historyGroupStartedAt = savedHistory.startedAt;
          } else {
            undoStack = [];
            redoStack = [];
            historyGroupStartedAt = 0;
          }
          view.setState(sameProject && savedState ? savedState : EditorStateClass.create({
            doc: nativeValue(), extensions: texExtensions
          }));
          host?.classList.remove('is-project-asset');
          syncViewFromSource();
          resetHistoryIfDocumentChanged(nativeValue());
          applyReadOnly();
          scheduleRemoteRender();
          return true;
        }

        // Self-hosted ESM can still fail due to browser networking or storage
        // restrictions. The existing timeout/retry keeps the textarea usable.
        let mounting = false;
        function announceEditor(kind, reason = '') {
          const detail = { kind, reason, at: Date.now() };
          window.__qssedaTexEditorStatus = detail;
          window.dispatchEvent(new CustomEvent('qsseda:tex-editor-state', { detail }));
        }
        async function timedModule(url, milliseconds) {
          let timer;
          try {
            return await Promise.race([
              import(url),
              new Promise((_, reject) => {
                timer = window.setTimeout(() => reject(new Error('Editor module request timed out')), milliseconds);
              })
            ]);
          } finally {
            if (timer) window.clearTimeout(timer);
          }
        }
        // Production editor code is bundled in this repository at build time
        // and served from the same AERTEX Work origin as the protected page.
        async function mount() {
          if (mounting || view) return;
          mounting = true;
          announceEditor('loading');
          let cm;
          try {
            cm = await timedModule('/assets/tex/codemirror.js', 11000);
          } catch (error) {
            mounting = false;
            console.warn(labels.failed, error);
            announceEditor('failed', 'self-hosted-module-unavailable');
            return;
          }

          const { EditorView, EditorState, basicSetup, StreamLanguage, stex, parserForFilename } = cm || {};
          if (!EditorView || !EditorState || !basicSetup) {
            mounting = false;
            console.warn(labels.failed, 'Invalid CodeMirror module exports');
            announceEditor('failed', 'module-invalid');
            return;
          }

          host = document.createElement('div');
          host.id = 'tex-codemirror-host';
          host.className = 'tex-codemirror-host';
          source.before(host);

          const theme = EditorView.theme({
            '&': { height: '100%', backgroundColor: 'transparent' },
            '.cm-scroller': { fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace' },
            '.cm-content': { caretColor: 'var(--primary)' },
            '.cm-gutters': { backgroundColor: 'transparent' },
            '&.cm-focused': { outline: 'none' }
          });


          // Use Lezer highlight tags, not hardcoded CodeMirror class names:
          // the SAME palette works with TeX and every supplementary file.
          const { Compartment, HighlightStyle, syntaxHighlighting, tags } = cm || {};
          if (Compartment && HighlightStyle && syntaxHighlighting && tags) {
            codeThemeCompartment = new Compartment();
            makeCodeThemeExtension = () => {
              const p = resolvedCodePalette();
              const highlight = HighlightStyle.define([
                { tag: [tags.keyword, tags.controlKeyword, tags.operatorKeyword, tags.modifier], color: p.keyword },
                { tag: [tags.macroName, tags.tagName, tags.function(tags.variableName)], color: p.command },
                { tag: [tags.atom, tags.bool, tags.labelName, tags.typeName], color: p.symbol },
                { tag: [tags.variableName, tags.propertyName, tags.attributeName, tags.namespace], color: p.variable },
                { tag: [tags.string, tags.regexp, tags.escape], color: p.string },
                { tag: tags.number, color: p.number },
                { tag: [tags.link, tags.url], color: p.link, textDecoration: 'underline' },
                { tag: [tags.comment, tags.lineComment, tags.blockComment], color: p.comment, fontStyle: 'italic' },
                { tag: [tags.heading, tags.strong], color: p.command, fontWeight: 'bold' },
                { tag: tags.invalid, color: p.dark ? '#ff8ca1' : '#bf293c', textDecoration: 'underline' }
              ]);
              return [EditorView.theme({}, { dark: Boolean(p.dark) }), syntaxHighlighting(highlight)];
            };
          }
          const paletteExtension = () => codeThemeCompartment
            ? [codeThemeCompartment.of(makeCodeThemeExtension())] : [];

          const baseExtensions = [
            basicSetup,
            theme,
            ...paletteExtension(),
            EditorView.lineWrapping,
            EditorView.updateListener.of(publishViewToBridge)
          ];
          let resolvedExtensions = baseExtensions;
          try {
            let extensions = baseExtensions;
            if (StreamLanguage && stex) {
              try {
                extensions = [basicSetup, StreamLanguage.define(stex),
                  theme, ...paletteExtension(), EditorView.lineWrapping, EditorView.updateListener.of(publishViewToBridge)];
                view = new EditorView({ parent: host, doc: nativeValue(), extensions });
              } catch (syntaxError) {
                // Some CDN bundles load a second @codemirror/state version.
                // Fall back to the editor rather than failing the entire page.
                console.warn('AERTEX TeX syntax plugin unavailable; continuing without syntax highlighting', syntaxError);
                try { view?.destroy(); } catch {}
                view = null;
                host.replaceChildren();
                extensions = baseExtensions;
              }
            }
            if (!view) view = new EditorView({
              parent: host, doc: nativeValue(), extensions: baseExtensions
            });
            resolvedExtensions = extensions;
          } catch (error) {
            mounting = false;
            host.remove();
            host = null;
            console.warn(labels.failed, error);
            announceEditor('failed', 'editor-init-failed');
            return;
          }

          EditorStateClass = EditorState;
          streamLanguageClass = StreamLanguage;
          languageParserForFilename = typeof parserForFilename === 'function' ? parserForFilename : null;
          texExtensions = resolvedExtensions;
          textExtensions = baseExtensions;
          remoteLayer = document.createElement('div');
          remoteLayer.className = 'tex-cm-remote-layer';
          remoteLayer.setAttribute('aria-hidden', 'true');
          host.append(remoteLayer);

          source.classList.add('tex-source-bridge');
          source.setAttribute('aria-hidden', 'true');
          source.tabIndex = -1;

          if (valueDescriptor?.get && valueDescriptor?.set) {
            try {
              Object.defineProperty(source, 'value', {
                configurable: true,
                enumerable: true,
                get() { return valueDescriptor.get.call(source); },
                set(value) {
                  valueDescriptor.set.call(source, String(value ?? ''));
                  if (!syncingToSource) queueSourceSync();
                }
              });
            } catch {}
          }

          try {
            source.focus = () => { if (view) view.focus(); else nativeFocus(); };
          } catch {}

          source.addEventListener('input', () => {
            if (!syncingToSource) syncViewFromSource();
          });

          const roleObserver = new MutationObserver(() => {
            applyReadOnly();
            resetHistoryIfDocumentChanged(nativeValue());
            scheduleRemoteRender();
          });
          roleObserver.observe(root, { attributes: true, attributeFilter: ['data-tex-collaboration-access-role', 'data-tex-collaboration-document-id'] });
          roleObserver.observe(source, { attributes: true, attributeFilter: ['readonly'] });

          host.addEventListener('beforeinput', event => {
            if (source.readOnly || accessRole() === 'viewer') event.preventDefault();
          }, true);
          host.addEventListener('paste', event => {
            if (source.readOnly || accessRole() === 'viewer') event.preventDefault();
          }, true);
          host.addEventListener('drop', event => {
            if (source.readOnly || accessRole() === 'viewer') event.preventDefault();
          }, true);
          host.addEventListener('keydown', event => {
            if (!(source.readOnly || accessRole() === 'viewer')) return;
            const key = String(event.key || '');
            const editingKey = key.length === 1 || ['Backspace', 'Delete', 'Enter', 'Tab'].includes(key) || ((event.ctrlKey || event.metaKey) && ['v', 'x', 'z', 'y'].includes(key.toLowerCase()));
            if (editingKey) event.preventDefault();
          }, true);

          view.scrollDOM.addEventListener('scroll', scheduleRemoteRender, { passive: true });
          window.addEventListener('resize', scheduleRemoteRender, { passive: true });
          window.addEventListener('qsseda:tex-presence', onPresence);
          resizeObserver = new ResizeObserver(scheduleRemoteRender);
          resizeObserver.observe(host);

          window.__qssedaTexEditorBridge = {
            kind: 'codemirror6',
            focus: () => view?.focus(),
            undo,
            redo,
            openAssetEditor,
            closeAssetEditor,
            getActiveAsset: () => currentAsset ? { ...currentAsset } : null,
            getAssetValue: () => currentAsset ? view?.state.doc.toString() : null,
            getValue: () => view ? view.state.doc.toString() : nativeValue(),
            getSelection: () => {
              const selection = view?.state.selection.main;
              return selection ? { anchor: selection.anchor, head: selection.head } : { anchor: source.selectionStart || 0, head: source.selectionEnd || 0 };
            },
            syncFromSource: syncViewFromSource,
            scrollToRemote(position) {
              if (!view || !activeDocumentId() || currentAsset) return false;
              const at = clamp(position, view.state.doc.length);
              try {
                view.dispatch({ effects: EditorView.scrollIntoView(at, { y: 'center', x: 'nearest' }) });
                scheduleRemoteRender();
                return true;
              } catch { return false; }
            },
            // Surgical replacement used by the source-aware visual editor:
            // preserve CodeMirror/Yjs input events, the original TeX syntax,
            // and the existing undo/collaboration pipeline.
            replaceRange(from, to, text, focus = false) {
              if (!view || accessRole() === 'viewer' || (currentAsset && accessRole() === 'editor')) return false;
              if ((!currentAsset && source.readOnly) || (currentAsset && document.querySelector('.tex-inline-file-viewer textarea')?.readOnly)) return false;
              const a = Math.max(0, Math.min(view.state.doc.length, Number(from) || 0));
              const b = Math.max(a, Math.min(view.state.doc.length, Number(to) || 0));
              const insert = String(text ?? '');
              view.dispatch({ changes: { from: a, to: b, insert },
                selection: { anchor: a + insert.length } });
              if (focus) view.focus();
              return true;
            },
            replaceSelection(text) {
              if (!view || source.readOnly || accessRole() === 'viewer' || (currentAsset && accessRole() === 'editor')) return false;
              const selection = view.state.selection.main;
              const insert = String(text ?? '');
              view.dispatch({ changes: { from: selection.from, to: selection.to, insert }, selection: { anchor: selection.from + insert.length }, scrollIntoView: true });
              view.focus();
              return true;
            }
          };

          resetHistoryIfDocumentChanged(nativeValue());
          applyReadOnly();
          syncViewFromSource();
          if (window.__qssedaTexPresenceSnapshot) onPresence({ detail: window.__qssedaTexPresenceSnapshot });
          scheduleRemoteRender();
          mounting = false;
          announceEditor('ready');
          window.dispatchEvent(new CustomEvent('qsseda:tex-editor-ready', {
            detail: { kind: 'codemirror6' }
          }));

          window.addEventListener('pagehide', () => {
            if (remoteFrame) cancelAnimationFrame(remoteFrame);
            resizeObserver?.disconnect();
            roleObserver.disconnect();
            try { view?.destroy(); } catch {}
            view = null;
          }, { once: true });
        }

        function startMount() {
          if (view || mounting) return;
          void mount().catch(error => {
            console.warn(labels.failed, error);
            mounting = false;
            try { view?.destroy(); } catch {}
            view = null;
            try { host?.remove(); } catch {}
            host = null;
            source.classList.remove('tex-source-bridge');
            source.removeAttribute('aria-hidden');
            source.tabIndex = 0;
            announceEditor('failed', 'unexpected-init-error');
          });
        }
        window.addEventListener('qsseda:tex-editor-retry', startMount);
        startMount();
      })();
    </script>`;

  return output;
}
