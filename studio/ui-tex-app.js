export function polishTexWorkbenchApp(markup, zh) {
  const copy = zh ? {
    startTitle: "开始一个 TeX 项目",
    startLead: "开始一个",
    startAccent: "TeX 项目",
    startKicker: "从灵感到排版",
    chooseTemplate: "选择项目类型",
    startDetail: "选择一种结构，直接进入写作与排版。",
    blank: "空白项目",
    blankDetail: "基础 article 结构，自动填入项目名与真实姓名",
    article: "示例项目",
    articleDetail: "包含 main.tex、sample.bib 和 frog.jpg",
    math: "上传项目",
    mathDetail: "上传 ZIP 文件，保留项目内的多个文件",
    local: "本机编译",
    autosave: "自动保存",
    preview: "PDF 预览",
    previewToggle: "自动预览"
  } : {
    startTitle: "Start a TeX project",
    startLead: "Start a",
    startAccent: "TeX project",
    startKicker: "FROM IDEA TO TYPESET",
    chooseTemplate: "Choose a project type",
    startDetail: "Choose a structure and start writing and typesetting.",
    blank: "Blank project",
    blankDetail: "A minimal article structure for a clean start",
    article: "Example project",
    articleDetail: "Includes main.tex, sample.bib and frog.jpg",
    math: "Upload project",
    mathDetail: "Upload a ZIP archive with your project files",
    local: "Local compile",
    autosave: "Autosave",
    preview: "PDF preview",
    previewToggle: "Auto preview"
  };

  const oldPlaceholder = zh
    ? '<div id="tex-editor-placeholder" class="tex-editor-placeholder"><div>TeX</div><strong>选择一份文档开始编辑</strong><span>也可以从左侧模板新建文档。</span></div>'
    : '<div id="tex-editor-placeholder" class="tex-editor-placeholder"><div>TeX</div><strong>Select a document to start editing</strong><span>Or create one from a template on the left.</span></div>';

  const startSurface = `<div id="tex-editor-placeholder" class="tex-editor-placeholder">
    <section class="qtex-welcome" aria-label="${zh ? "TeX 工作台首页" : "TeX workspace home"}">
      <div class="qtex-welcome-hero">
        <div class="qtex-welcome-copy">
          <div class="qtex-welcome-brand"><span class="qtex-brand-dot" aria-hidden="true"></span><span>AERTEX</span><span class="qtex-brand-divider" aria-hidden="true">/</span><span>Work</span></div>
          <h2><span>${zh ? "欢迎回来" : "Welcome back"}</span></h2>
          <p>${zh ? "继续你的创作，或从一个新项目开始。" : "Pick up where you left off, or start something new."}</p>
        </div>
      </div>
      <div class="qtex-templates">
        <div class="qtex-templates-header"><strong>${zh ? "开始创作" : "Get started"}</strong></div>
        <div class="qtex-template-grid">
          <button type="button" class="qtex-template qtex-template-blank" data-tex-start-template="blank">
            <span class="qtex-template-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 4.5v15M4.5 12h15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <span class="qtex-template-info"><strong>${zh ? "新建项目" : "New project"}</strong><span>${zh ? "创建一个空白 TeX 项目" : "Start with a blank TeX project"}</span></span>
            <svg class="qtex-template-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 5 7 7-7 7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button type="button" class="qtex-template qtex-template-article" data-tex-start-template="article">
            <span class="qtex-template-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M7 3.75h7.5l3.75 3.75v12.75H7a2 2 0 0 1-2-2V5.75a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.65" stroke-linejoin="round"/><path d="M14.5 3.75V7.5h3.75M8.5 11h6.5M8.5 14.5H15" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            <span class="qtex-template-info"><strong>${zh ? "示例项目" : "Example project"}</strong><span>${zh ? "从完整的模板开始" : "Explore a ready-made example"}</span></span>
            <svg class="qtex-template-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 5 7 7-7 7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button type="button" class="qtex-template qtex-template-math" data-tex-start-template="math">
            <span class="qtex-template-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 16V4m0 0L8 8m4-4 4 4M5 16.5v2A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-2" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            <span class="qtex-template-info"><strong>${zh ? "导入项目" : "Import project"}</strong><span>${zh ? "上传已有 ZIP 项目" : "Upload an existing ZIP project"}</span></span>
            <svg class="qtex-template-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 5 7 7-7 7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
      <section class="qtex-recent" aria-label="${zh ? "最近使用的项目" : "Recent projects"}">
        <div class="qtex-recent-heading">
          <strong>${zh ? "最近使用" : "Recent projects"}</strong>
          <span>${zh ? "按最近修改排序" : "Sorted by last edit"}</span>
        </div>
        <div id="qtex-recent-list" class="qtex-recent-list" aria-live="polite">
          <div class="qtex-recent-empty">${zh ? "还没有最近使用的项目。" : "No recent projects yet."}</div>
        </div>
      </section>
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
            if(typeof window.__aertexTexProjectOpenDialog === 'function'){
              const kind=button.dataset.texStartTemplate;
              window.__aertexTexProjectOpenDialog(kind==='article'?'example':kind==='math'?'upload':'blank');
              return;
            }
            template.value = button.dataset.texStartTemplate || 'blank';
            create.click();
          });
        }
      })();
    </script>`;

  return output;
}
