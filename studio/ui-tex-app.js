export function polishTexWorkbenchApp(markup, zh) {
  const copy = zh ? {
    startTitle: "开始一份 TeX 文档",
    startLead: "开始一份",
    startAccent: "TeX 文档",
    startKicker: "从灵感到排版",
    chooseTemplate: "选择模板",
    startDetail: "选择一种结构，直接进入写作与排版。",
    blank: "空白文档",
    blankDetail: "最简 article 结构，适合从零开始",
    article: "中文文稿",
    articleDetail: "预设中文排版、章节与常用页面设置",
    math: "数学笔记",
    mathDetail: "预设公式环境，适合推导与课程记录",
    local: "本机编译",
    autosave: "自动保存",
    preview: "PDF 预览",
    previewToggle: "自动预览"
  } : {
    startTitle: "Start a TeX document",
    startLead: "Start a",
    startAccent: "TeX document",
    startKicker: "FROM IDEA TO TYPESET",
    chooseTemplate: "Choose a template",
    startDetail: "Choose a structure and start writing and typesetting.",
    blank: "Blank",
    blankDetail: "A minimal article structure for a clean start",
    article: "Chinese Document",
    articleDetail: "Chinese typesetting, sections, and common page settings",
    math: "Math Notes",
    mathDetail: "Formula environments for derivations and course notes",
    local: "Local compile",
    autosave: "Autosave",
    preview: "PDF preview",
    previewToggle: "Auto preview"
  };

  const oldPlaceholder = zh
    ? '<div id="tex-editor-placeholder" class="tex-editor-placeholder"><div>TeX</div><strong>选择一份文档开始编辑</strong><span>也可以从左侧模板新建文档。</span></div>'
    : '<div id="tex-editor-placeholder" class="tex-editor-placeholder"><div>TeX</div><strong>Select a document to start editing</strong><span>Or create one from a template on the left.</span></div>';

  const startSurface = `<div id="tex-editor-placeholder" class="tex-editor-placeholder">
    <section class="qtex-welcome" aria-label="${copy.startTitle}">
      <div class="qtex-welcome-bar">
        <span class="qtex-welcome-brand"><i aria-hidden="true"></i>AERTEX <span>/</span> WORK</span>
        <span class="qtex-welcome-number">EDITOR / 01</span>
      </div>
      <div class="qtex-welcome-hero">
        <div class="qtex-welcome-copy">
          <span class="qtex-welcome-kicker">${copy.startKicker}</span>
          <h2><span>${copy.startLead}</span><em>${copy.startAccent}</em></h2>
          <p>${copy.startDetail}</p>
        </div>
        <div class="qtex-welcome-art" aria-hidden="true">
          <div class="qtex-paper">
            <div class="qtex-paper-header"><span><i></i>main.tex</span><span>XeLaTeX</span></div>
            <div class="qtex-code"><span>01</span><code>&#92;documentclass{article}</code></div>
            <div class="qtex-code"><span>02</span><code>&#92;begin{document}</code></div>
            <div class="qtex-code"><span>03</span><code>Hello, TeX!</code></div>
            <div class="qtex-code"><span>04</span><code>&#92;end{document}</code></div>
            <div class="qtex-paper-bottom"><span>TeX</span><span>→</span><span>PDF</span></div>
          </div>
        </div>
      </div>
      <div class="qtex-templates">
        <div class="qtex-templates-header"><strong>${copy.chooseTemplate}</strong><span>03 / TEMPLATES</span></div>
        <div class="qtex-template-grid">
          <button type="button" class="qtex-template qtex-template-blank" data-tex-start-template="blank">
            <span class="qtex-template-top"><span class="qtex-template-icon" aria-hidden="true">＋</span><span class="qtex-template-arrow" aria-hidden="true">↗</span></span>
            <span class="qtex-template-info"><strong>${copy.blank}</strong><span>${copy.blankDetail}</span></span>
          </button>
          <button type="button" class="qtex-template qtex-template-article" data-tex-start-template="article">
            <span class="qtex-template-top"><span class="qtex-template-icon" aria-hidden="true">文</span><span class="qtex-template-arrow" aria-hidden="true">↗</span></span>
            <span class="qtex-template-info"><strong>${copy.article}</strong><span>${copy.articleDetail}</span></span>
          </button>
          <button type="button" class="qtex-template qtex-template-math" data-tex-start-template="math">
            <span class="qtex-template-top"><span class="qtex-template-icon" aria-hidden="true">∑</span><span class="qtex-template-arrow" aria-hidden="true">↗</span></span>
            <span class="qtex-template-info"><strong>${copy.math}</strong><span>${copy.mathDetail}</span></span>
          </button>
        </div>
      </div>
      <div class="qtex-welcome-footer"><span>${copy.local}</span><span>${copy.autosave}</span><span>${copy.preview}</span></div>
    </section>
  </div>`;

  let output = String(markup || "")
    .replace('<section class="tex-workbench" data-tex-root>', '<section class="tex-workbench tex-work-app" data-tex-root>')
    .replace(oldPlaceholder, startSurface)
    .replace(
      /<label class="tex-live-preview-toggle"><input id="tex-live-preview-toggle" type="checkbox" checked><span>[^<]*<\/span><\/label>/,
      `<label class="tex-live-preview-toggle"><span class="tex-live-preview-switch"><input id="tex-live-preview-toggle" type="checkbox" checked><span aria-hidden="true"></span></span><span>${copy.previewToggle}</span></label>`
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

      @media(max-width:760px){.tex-work-app .tex-hero{padding:14px}.tex-work-app .tex-hero p{display:none}}
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
