export function polishTexWorkbenchApp(markup, zh) {
  const copy = zh ? {
    startTitle: "开始一份 TeX 文档",
    startDetail: "选择一个起点。文档会自动保存，本机 Bridge 可用时会在右侧刷新 PDF。",
    blank: "空白文档",
    blankDetail: "从最小 article 开始",
    article: "中文文章",
    articleDetail: "CTeX、数学与常用页面设置",
    math: "数学笔记",
    mathDetail: "适合公式、推导与课程笔记",
    local: "本机编译",
    autosave: "自动保存",
    preview: "PDF 预览",
    previewToggle: "自动预览"
  } : {
    startTitle: "Start a TeX document",
    startDetail: "Choose a starting point. Documents autosave, and the PDF refreshes on the right when Local Bridge is available.",
    blank: "Blank",
    blankDetail: "Start from a minimal article",
    article: "Chinese Article",
    articleDetail: "CTeX, math, and practical page settings",
    math: "Math Notes",
    mathDetail: "For formulas, derivations, and course notes",
    local: "Local compile",
    autosave: "Autosave",
    preview: "PDF preview",
    previewToggle: "Auto preview"
  };

  const oldPlaceholder = zh
    ? '<div id="tex-editor-placeholder" class="tex-editor-placeholder"><div>TeX</div><strong>选择一份文档开始编辑</strong><span>也可以从左侧模板新建文档。</span></div>'
    : '<div id="tex-editor-placeholder" class="tex-editor-placeholder"><div>TeX</div><strong>Select a document to start editing</strong><span>Or create one from a template on the left.</span></div>';

  const startSurface = `<div id="tex-editor-placeholder" class="tex-editor-placeholder tex-start-surface">
    <div class="tex-start-mark">TeX</div>
    <div class="tex-start-copy"><strong>${copy.startTitle}</strong><span>${copy.startDetail}</span></div>
    <div class="tex-start-grid">
      <button type="button" class="tex-start-card" data-tex-start-template="blank"><b>${copy.blank}</b><span>${copy.blankDetail}</span></button>
      <button type="button" class="tex-start-card" data-tex-start-template="article"><b>${copy.article}</b><span>${copy.articleDetail}</span></button>
      <button type="button" class="tex-start-card" data-tex-start-template="math"><b>${copy.math}</b><span>${copy.mathDetail}</span></button>
    </div>
    <div class="tex-start-features"><span>● ${copy.local}</span><span>● ${copy.autosave}</span><span>● ${copy.preview}</span></div>
  </div>`;

  let output = String(markup || "")
    .replace('<section class="tex-workbench" data-tex-root>', '<section class="tex-workbench tex-work-app" data-tex-root>')
    .replace(oldPlaceholder, startSurface)
    .replace(
      /<label class="tex-live-preview-toggle"><input id="tex-live-preview-toggle" type="checkbox" checked><span>[^<]*<\/span><\/label>/,
      `<label class="tex-live-preview-toggle"><span class="tex-live-switch"><input id="tex-live-preview-toggle" type="checkbox" checked><span aria-hidden="true"></span></span><span>${copy.previewToggle}</span></label>`
    );

  output += `
    <style>
      .tex-work-app{gap:10px}
      .tex-work-app .tex-hero{padding:16px 18px;border-radius:18px;align-items:center;background:color-mix(in srgb,var(--card) 94%,transparent)}
      .tex-work-app .tex-hero>div:first-child>span{font-size:9px;letter-spacing:.06em;text-transform:uppercase}
      .tex-work-app .tex-hero h2{margin:3px 0 3px;font-size:22px;letter-spacing:-.035em}
      .tex-work-app .tex-hero p{max-width:680px;font-size:11px;line-height:1.48}
      .tex-work-app .tex-shell{min-height:calc(100vh - 265px);border-radius:18px;box-shadow:0 10px 34px rgba(0,0,0,.035)}

      .tex-work-app .tex-create-row select,.tex-work-app .tex-editor-toolbar select{
        appearance:none!important;-webkit-appearance:none!important;padding-right:34px!important;
        background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14' fill='none'%3E%3Cpath d='M3 5.25 7 9l4-3.75' stroke='%23777' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")!important;
        background-repeat:no-repeat!important;background-position:right 11px center!important;background-size:14px 14px!important
      }
      .tex-work-app .tex-create-row select:focus,.tex-work-app .tex-editor-toolbar select:focus{outline:none!important;box-shadow:inset 0 0 0 1px rgba(10,132,255,.5),0 0 0 3px rgba(10,132,255,.07)!important}

      .tex-work-app .tex-search{transition:box-shadow .16s ease,background .16s ease}
      .tex-work-app .tex-search:focus-within{background:var(--card);box-shadow:inset 0 0 0 1px rgba(10,132,255,.52),0 0 0 3px rgba(10,132,255,.07)}
      .tex-work-app .tex-search input,.tex-work-app .tex-search input:focus,.tex-work-app .tex-search input:focus-visible{outline:none!important;border:0!important;box-shadow:none!important;-webkit-appearance:none!important}

      .tex-live-preview-toggle{gap:7px!important;font-size:9px!important;user-select:none}
      .tex-live-preview-switch{position:relative;display:inline-block;width:30px;height:18px;flex:0 0 30px}
      .tex-live-preview-switch input{position:absolute!important;inset:0!important;width:30px!important;height:18px!important;margin:0!important;opacity:0!important;cursor:pointer;z-index:2}
      .tex-live-preview-switch>span{position:absolute;inset:0;border-radius:999px;background:rgba(127,127,127,.22);box-shadow:inset 0 0 0 1px rgba(127,127,127,.16);transition:background .18s ease,box-shadow .18s ease}
      .tex-live-preview-switch>span:after{content:"";position:absolute;width:14px;height:14px;left:2px;top:2px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:transform .18s ease}
      .tex-live-preview-switch input:checked+span{background:var(--primary);box-shadow:none}
      .tex-live-preview-switch input:checked+span:after{transform:translateX(12px)}
      .tex-live-preview-switch input:focus-visible+span{box-shadow:0 0 0 3px rgba(10,132,255,.14),inset 0 0 0 1px rgba(10,132,255,.55)}
      .tex-live-preview-switch input:disabled{cursor:not-allowed}
      .tex-live-preview-toggle:has(input:disabled){opacity:.48;cursor:default}
      .tex-live-preview-card.is-unavailable{opacity:1!important}

      .tex-start-surface{display:flex!important;flex-direction:column;justify-content:center;align-items:center;gap:18px!important;padding:42px 36px!important;background:radial-gradient(circle at 50% 38%,rgba(10,132,255,.045),transparent 42%)}
      .tex-start-mark{display:grid!important;place-items:center;width:52px!important;height:52px!important;border-radius:16px!important;background:var(--fill)!important;box-shadow:inset 0 0 0 1px var(--hairline);font:700 13px ui-monospace,SFMono-Regular,Menlo,monospace!important}
      .tex-start-copy{display:grid;gap:6px;max-width:560px;text-align:center}
      .tex-start-copy strong{font-size:18px!important;letter-spacing:-.025em}
      .tex-start-copy span{font-size:11px!important;line-height:1.55;color:var(--muted)}
      .tex-start-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;width:min(100%,650px)}
      .tex-start-card{appearance:none;display:grid;gap:5px;min-height:92px;padding:14px;border:0;border-radius:14px;background:var(--card);color:var(--text);text-align:left;box-shadow:inset 0 0 0 1px var(--border);cursor:pointer;transition:transform .16s ease,box-shadow .16s ease,background .16s ease}
      .tex-start-card:hover{transform:translateY(-1px);background:var(--surface);box-shadow:inset 0 0 0 1px rgba(10,132,255,.28),0 8px 24px rgba(0,0,0,.04)}
      .tex-start-card:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(10,132,255,.1),inset 0 0 0 1px rgba(10,132,255,.55)}
      .tex-start-card b{font-size:11px}.tex-start-card span{font-size:9px!important;line-height:1.45;color:var(--muted);text-align:left}
      .tex-start-features{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;color:var(--quiet);font-size:8px}
      .tex-start-features span::first-letter{color:var(--primary)}

      @media(max-width:760px){.tex-start-grid{grid-template-columns:1fr}.tex-start-surface{padding:28px 18px!important}.tex-work-app .tex-hero{padding:14px}.tex-work-app .tex-hero p{display:none}}
    </style>
    <script>
      (() => {
        const template = document.getElementById('tex-template');
        const create = document.getElementById('tex-create');
        for (const button of document.querySelectorAll('[data-tex-start-template]')) {
          button.addEventListener('click', () => {
            if (!template || !create) return;
            template.value = button.dataset.texStartTemplate || 'blank';
            create.click();
          });
        }
      })();
    </script>`;

  return output;
}
