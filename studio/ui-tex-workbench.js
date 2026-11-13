// 页面包含文档列表、源码编辑和编译交互；文档写入与编译必须依赖后端会话，而不是在浏览器长期保存 Bearer 凭证。
export function texWorkbenchContent(zh) {
  const copy = zh ? {
    eyebrow: "实验室 · TeX",
    title: "TeX 工作台",
    intro: "账号级 TeX 源码工作区。编辑、模板、自动保存和源码下载现在即可使用；PDF 编译只会通过受保护的 Worker 编译桥接。",
    newDoc: "新建文档",
    search: "搜索 TeX 文档…",
    documents: "文档",
    blank: "空白文档",
    article: "中文文章",
    math: "数学笔记",
    noDocs: "还没有 TeX 文档",
    noDocsDetail: "选择模板并新建第一份文档。",
    untitled: "未命名 TeX 文档",
    engine: "编译引擎",
    saved: "已自动保存",
    saving: "正在保存…",
    unsaved: "有未保存修改",
    source: "TeX 源码",
    sourcePlaceholder: "在这里输入 LaTeX / TeX 源码…",
    download: "下载 .tex",
    compile: "编译 PDF",
    compiling: "正在编译…",
    compilerReady: "编译服务已连接",
    compilerOffline: "编译服务尚未连接",
    compilerDetailReady: "点击编译时，当前源码会通过 QssedA Worker 发送到受保护的 TeX 编译服务。",
    compilerDetailOffline: "当前仍可编辑、自动保存和下载源码。连接专用 TeX 服务后，这里会自动启用 PDF 编译。",
    history: "编译历史",
    noHistory: "还没有编译记录",
    openPdf: "打开 PDF",
    failed: "编译失败",
    unavailable: "服务未连接",
    success: "编译成功",
    running: "编译中",
    delete: "删除文档",
    deleteConfirm: "确定删除这份 TeX 文档吗？关联的编译记录和 PDF 结果也会一起删除。",
    deleteDone: "TeX 文档已删除",
    error: "TeX 工作台暂时不可用",
    select: "选择一份文档开始编辑",
    selectDetail: "也可以从左侧模板新建文档。",
    chars: "字符",
    lines: "行",
  } : {
    eyebrow: "Lab · TeX",
    title: "TeX Workbench",
    intro: "An account-scoped TeX source workspace. Editing, templates, autosave, and source download work now; PDF compilation is available only through the protected Worker compiler bridge.",
    newDoc: "New Document",
    search: "Search TeX documents…",
    documents: "Documents",
    blank: "Blank",
    article: "Chinese Article",
    math: "Math Notes",
    noDocs: "No TeX documents yet",
    noDocsDetail: "Choose a template and create your first document.",
    untitled: "Untitled TeX document",
    engine: "Engine",
    saved: "Autosaved",
    saving: "Saving…",
    unsaved: "Unsaved changes",
    source: "TeX source",
    sourcePlaceholder: "Write LaTeX / TeX source here…",
    download: "Download .tex",
    compile: "Compile PDF",
    compiling: "Compiling…",
    compilerReady: "Compiler connected",
    compilerOffline: "Compiler not connected yet",
    compilerDetailReady: "When you compile, the current source is sent through QssedA Worker to the protected TeX compiler service.",
    compilerDetailOffline: "Editing, autosave, and source download remain available. PDF compilation enables automatically after the dedicated TeX service is connected.",
    history: "Compile History",
    noHistory: "No compile runs yet",
    openPdf: "Open PDF",
    failed: "Compile failed",
    unavailable: "Service unavailable",
    success: "Compile succeeded",
    running: "Compiling",
    delete: "Delete Document",
    deleteConfirm: "Delete this TeX document? Its compile history and PDF results will be removed too.",
    deleteDone: "TeX document deleted",
    error: "TeX Workbench is temporarily unavailable",
    select: "Select a document to start editing",
    selectDetail: "Or create one from a template on the left.",
    chars: "chars",
    lines: "lines",
  };

  const templates = {
    blank: {
      title: zh ? "空白 TeX 文档" : "Blank TeX Document",
      engine: "xelatex",
      source: "\\documentclass{article}\n\\begin{document}\n\nHello, TeX!\n\n\\end{document}\n"
    },
    article: {
      title: zh ? "中文文章" : "Chinese Article",
      engine: "xelatex",
      source: "\\documentclass[12pt]{ctexart}\n\\usepackage{amsmath,amssymb}\n\\usepackage[a4paper,margin=2.5cm]{geometry}\n\\title{标题}\n\\author{}\n\\date{}\n\n\\begin{document}\n\\maketitle\n\n\\section{引言}\n在这里开始写作。\n\n\\end{document}\n"
    },
    math: {
      title: zh ? "数学笔记" : "Math Notes",
      engine: "xelatex",
      source: "\\documentclass[12pt]{ctexart}\n\\usepackage{amsmath,amssymb,mathtools}\n\\usepackage[a4paper,margin=2.4cm]{geometry}\n\\title{数学笔记}\n\\date{}\n\n\\begin{document}\n\\maketitle\n\n\\section{公式}\n\\[\n  e^{i\\pi}+1=0\n\\]\n\n\\end{document}\n"
    }
  };

  return `
    <section class="tex-workbench" data-tex-root>
      <div class="tex-hero">
        <div><span>${copy.eyebrow}</span><h2>${copy.title}</h2><p>${copy.intro}</p></div>
        <div id="tex-compiler-pill" class="tex-compiler-pill is-offline"><i></i><span>${copy.compilerOffline}</span></div>
      </div>

      <div class="tex-shell">
        <aside class="tex-documents-panel">
          <div class="tex-panel-head"><strong>${copy.documents}</strong><span id="tex-document-count">0</span></div>
          <div class="tex-create-row">
            <select id="tex-template" aria-label="${copy.newDoc}"><option value="blank">${copy.blank}</option><option value="article">${copy.article}</option><option value="math">${copy.math}</option></select>
            <button id="tex-create" type="button">＋</button>
          </div>
          <div class="tex-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path></svg><input id="tex-search" type="search" autocomplete="off" spellcheck="false" placeholder="${copy.search}" aria-label="${copy.search}"></div>
          <div id="tex-document-list" class="tex-document-list"></div>
          <div id="tex-documents-empty" class="tex-empty"><strong>${copy.noDocs}</strong><span>${copy.noDocsDetail}</span></div>
        </aside>

        <main class="tex-editor-panel">
          <div id="tex-editor-placeholder" class="tex-editor-placeholder"><div>TeX</div><strong>${copy.select}</strong><span>${copy.selectDetail}</span></div>
          <section id="tex-editor" class="tex-editor" hidden>
            <div class="tex-editor-toolbar">
              <input id="tex-title" maxlength="180" placeholder="${copy.untitled}" aria-label="${copy.untitled}">
              <label><span>${copy.engine}</span><select id="tex-engine"><option value="xelatex">XeLaTeX</option><option value="lualatex">LuaLaTeX</option><option value="pdflatex">pdfLaTeX</option></select></label>
            </div>
            <div class="tex-source-label"><span>${copy.source}</span><div><strong id="tex-line-count">0</strong> ${copy.lines} · <strong id="tex-char-count">0</strong> ${copy.chars}</div></div>
            <textarea id="tex-source" maxlength="180000" spellcheck="false" placeholder="${copy.sourcePlaceholder}" aria-label="${copy.source}"></textarea>
            <div class="tex-editor-footer">
              <div class="tex-save-state"><span id="tex-save-state">${copy.saved}</span></div>
              <div class="tex-editor-actions"><button id="tex-delete" class="tex-danger" type="button">${copy.delete}</button><button id="tex-download" class="tex-secondary" type="button">${copy.download}</button><button id="tex-compile" class="tex-primary" type="button" disabled>${copy.compile}</button></div>
            </div>
          </section>
        </main>

        <aside class="tex-runs-panel">
          <div class="tex-compiler-card"><div id="tex-compiler-state" class="tex-compiler-state"><i></i><strong>${copy.compilerOffline}</strong></div><p id="tex-compiler-detail">${copy.compilerDetailOffline}</p></div>
          <div class="tex-runs-head"><strong>${copy.history}</strong><button id="tex-refresh-runs" type="button" aria-label="${copy.history}">↻</button></div>
          <div id="tex-run-list" class="tex-run-list"></div>
          <div id="tex-runs-empty" class="tex-empty tex-runs-empty"><strong>${copy.noHistory}</strong></div>
        </aside>
      </div>
      <div id="tex-message" class="tex-message" hidden></div>
    </section>

    <style>
      .tex-workbench{display:grid;gap:14px;min-width:0}.tex-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:22px;padding:22px;border:1px solid var(--border);border-radius:21px;background:var(--card)}.tex-hero>div:first-child>span{display:block;color:var(--muted);font-size:11px;font-weight:700}.tex-hero h2{margin:5px 0 7px;font-size:29px;letter-spacing:-.042em}.tex-hero p{max-width:780px;margin:0;color:var(--muted);font-size:13px;line-height:1.58}.tex-compiler-pill{display:flex;align-items:center;gap:7px;padding:8px 10px;border-radius:999px;background:var(--fill);color:var(--muted);font-size:10px;white-space:nowrap}.tex-compiler-pill i,.tex-compiler-state i{width:7px;height:7px;border-radius:999px;background:var(--quiet)}.tex-compiler-pill.is-ready{color:var(--primary)}.tex-compiler-pill.is-ready i,.tex-compiler-state.is-ready i{background:var(--primary)}
      .tex-shell{display:grid;grid-template-columns:250px minmax(0,1fr) 270px;min-height:650px;border:1px solid var(--border);border-radius:20px;background:var(--card);overflow:hidden}.tex-documents-panel,.tex-runs-panel{display:flex;min-width:0;flex-direction:column;background:var(--fill)}.tex-documents-panel{border-right:1px solid var(--hairline)}.tex-runs-panel{border-left:1px solid var(--hairline)}.tex-panel-head,.tex-runs-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 12px 9px}.tex-panel-head strong,.tex-runs-head strong{font-size:11px}.tex-panel-head span{display:grid;place-items:center;min-width:20px;height:20px;padding:0 5px;border-radius:999px;background:var(--surface);color:var(--muted);font-size:9px}.tex-create-row{display:grid;grid-template-columns:minmax(0,1fr) 38px;gap:6px;padding:0 9px 8px}.tex-create-row select,.tex-editor-toolbar select{min-height:38px;margin:0;padding:0 28px 0 9px;border:0;border-radius:10px;background:var(--surface);box-shadow:inset 0 0 0 1px var(--border);font-size:10px}.tex-create-row button,.tex-runs-head button{width:auto!important;min-width:38px!important;min-height:38px!important;margin:0!important;padding:0!important;border:0!important;border-radius:10px!important;background:var(--surface)!important;color:var(--text)!important;box-shadow:inset 0 0 0 1px var(--border)!important;font-size:16px!important}.tex-search{display:flex;align-items:center;gap:7px;margin:0 9px 8px;padding:0 9px;border-radius:10px;background:var(--surface);box-shadow:inset 0 0 0 1px var(--border)}.tex-search svg{width:14px;height:14px;fill:none;stroke:var(--muted);stroke-width:1.8;stroke-linecap:round}.tex-search input{width:100%;height:36px;min-height:0;margin:0;padding:0;border:0!important;background:transparent!important;box-shadow:none!important;font-size:10px}.tex-document-list,.tex-run-list{display:grid;gap:3px;padding:0 7px 10px;overflow:auto}.tex-document-item{display:grid;gap:5px;width:100%;margin:0;padding:10px;border:0;border-radius:11px;background:transparent;color:var(--text);text-align:left}.tex-document-item:hover,.tex-document-item.is-active{background:var(--surface)}.tex-document-item strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px}.tex-document-item p{display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;margin:0;color:var(--muted);font-size:9px;line-height:1.42}.tex-document-meta{display:flex;justify-content:space-between;gap:6px;color:var(--quiet);font-size:8px}
      .tex-editor-panel{min-width:0;background:var(--surface)}.tex-editor-placeholder{display:grid;place-items:center;align-content:center;gap:7px;height:100%;padding:40px;text-align:center}.tex-editor-placeholder>div{display:grid;place-items:center;width:52px;height:52px;border-radius:15px;background:var(--fill);font:700 13px ui-monospace,SFMono-Regular,Menlo,monospace}.tex-editor-placeholder strong{font-size:13px}.tex-editor-placeholder span{color:var(--muted);font-size:10px}.tex-editor{display:grid;grid-template-rows:auto auto minmax(470px,1fr) auto;height:100%}.tex-editor[hidden]{display:none}.tex-editor-toolbar{display:flex;align-items:end;gap:12px;padding:12px 14px;border-bottom:1px solid var(--hairline)}.tex-editor-toolbar>input{flex:1;min-width:0;height:38px;min-height:0;margin:0;padding:0 4px;border:0!important;background:transparent!important;box-shadow:none!important;color:var(--text)!important;font-size:17px!important;font-weight:680!important;letter-spacing:-.02em}.tex-editor-toolbar label{display:grid;gap:3px;min-width:120px}.tex-editor-toolbar label span{color:var(--muted);font-size:8px}.tex-source-label{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px 5px;color:var(--muted);font-size:8px}.tex-source-label>span{font-weight:700}.tex-source-label strong{color:var(--text);font-weight:650}.tex-source{width:100%;height:100%;min-height:470px;margin:0;padding:11px 16px 24px;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;color:var(--text);resize:none;font:13px/1.62 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;tab-size:2}.tex-source:focus{outline:none}.tex-editor-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 12px;border-top:1px solid var(--hairline)}.tex-save-state{color:var(--muted);font-size:9px}.tex-save-state .is-error{color:var(--danger)}.tex-editor-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.tex-primary,.tex-secondary,.tex-danger{width:auto!important;min-height:36px!important;margin:0!important;padding:0 11px!important;border:0!important;border-radius:10px!important;box-shadow:none!important;font-size:10px!important;font-weight:680!important}.tex-primary{background:var(--primary)!important;color:white!important}.tex-primary:disabled{opacity:.42}.tex-secondary{background:var(--fill)!important;color:var(--text)!important}.tex-danger{background:color-mix(in srgb,var(--danger) 9%,var(--fill))!important;color:var(--danger)!important}
      .tex-compiler-card{display:grid;gap:7px;margin:9px;padding:11px;border-radius:13px;background:var(--surface);box-shadow:inset 0 0 0 1px var(--border)}.tex-compiler-state{display:flex;align-items:center;gap:7px}.tex-compiler-state strong{font-size:10px}.tex-compiler-card p{margin:0;color:var(--muted);font-size:9px;line-height:1.45}.tex-compiler-card small{color:var(--quiet);font-size:8px;line-height:1.45}.tex-run-item{display:grid;gap:6px;padding:10px;border-radius:11px;background:var(--surface)}.tex-run-top{display:flex;align-items:center;justify-content:space-between;gap:8px}.tex-run-top strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px}.tex-run-status{padding:3px 6px;border-radius:999px;background:var(--fill);color:var(--muted);font-size:7px;font-weight:700}.tex-run-status.is-success{color:var(--primary)}.tex-run-status.is-failed,.tex-run-status.is-unavailable{color:var(--danger)}.tex-run-meta{display:flex;justify-content:space-between;gap:7px;color:var(--quiet);font-size:8px}.tex-run-error{margin:0;color:var(--danger);font-size:8px;line-height:1.4}.tex-run-item a{justify-self:start;color:var(--primary);font-size:9px;text-decoration:none}.tex-empty{display:grid;gap:5px;padding:24px 12px;text-align:center}.tex-empty[hidden]{display:none}.tex-empty strong{font-size:10px}.tex-empty span{color:var(--muted);font-size:9px}.tex-runs-empty{padding-top:18px}.tex-message{padding:10px 12px;border-radius:11px;background:var(--fill);color:var(--muted);font-size:10px}.tex-message.is-error{background:color-mix(in srgb,var(--danger) 9%,var(--fill));color:var(--danger)}
      @media(max-width:1080px){.tex-shell{grid-template-columns:230px minmax(0,1fr)}.tex-runs-panel{grid-column:1/-1;max-height:300px;border-top:1px solid var(--hairline);border-left:0}.tex-run-list{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:760px){.tex-hero{display:grid;padding:18px}.tex-shell{grid-template-columns:1fr}.tex-documents-panel{max-height:330px;border-right:0;border-bottom:1px solid var(--hairline)}.tex-editor{min-height:590px}.tex-editor-toolbar{align-items:stretch;flex-direction:column}.tex-editor-toolbar label{min-width:0}.tex-editor-footer{align-items:stretch;flex-direction:column}.tex-editor-actions{justify-content:flex-start}.tex-runs-panel{grid-column:auto}.tex-run-list{grid-template-columns:1fr}}
    </style>

    <script>
      (()=>{
        const templates=${JSON.stringify(templates)};
        const copy=${JSON.stringify(copy)};
        const start=()=>{
          const root=document.querySelector('[data-tex-root]');if(!root)return;
          const list=document.getElementById('tex-document-list');const empty=document.getElementById('tex-documents-empty');const search=document.getElementById('tex-search');const editor=document.getElementById('tex-editor');const placeholder=document.getElementById('tex-editor-placeholder');const title=document.getElementById('tex-title');const engine=document.getElementById('tex-engine');const source=document.getElementById('tex-source');const saveState=document.getElementById('tex-save-state');const compile=document.getElementById('tex-compile');const runList=document.getElementById('tex-run-list');const runsEmpty=document.getElementById('tex-runs-empty');const message=document.getElementById('tex-message');
          let documents=[];let runs=[];let activeId='';let activeDocument=null;let dirty=false;let saveTimer=null;let saveSequence=0;let compilerAvailable=false;
          async function api(path,options={}){const response=await fetch(path,{...options,credentials:'same-origin',headers:{Accept:'application/json',...(options.body?{'Content-Type':'application/json;charset=UTF-8'}:{}),...(options.headers||{})},cache:'no-store'});const contentType=response.headers.get('content-type')||'';const payload=contentType.includes('application/json')?await response.json().catch(()=>({})):{};if(!response.ok){const error=new Error(payload?.error||copy.error);error.payload=payload;throw error;}return payload;}
          function showMessage(text,error=false){message.hidden=!text;message.textContent=text||'';message.classList.toggle('is-error',Boolean(error));}
          function setSaveState(text,error=false){saveState.textContent=text;saveState.classList.toggle('is-error',error);}
          function formatTime(value){const date=new Date(value);return Number.isNaN(date.getTime())?'':date.toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});}
          function sourcePreview(value){return String(value||'').split(String.fromCharCode(10)).join(' ').replace(/\s+/g,' ').trim().slice(0,180);}
          function summary(document){return {id:document.id,title:document.title||copy.untitled,engine:document.engine||'xelatex',preview:sourcePreview(document.source),created_at:document.created_at,updated_at:document.updated_at};}
          function updateStats(){const text=source.value||'';document.getElementById('tex-char-count').textContent=String(text.length);document.getElementById('tex-line-count').textContent=String(text?text.split(String.fromCharCode(10)).length:0);}
          function renderDocuments(){const query=search.value.trim().toLocaleLowerCase();const filtered=documents.filter(item=>!query||[item.title,item.preview,item.engine].join(' ').toLocaleLowerCase().includes(query));document.getElementById('tex-document-count').textContent=String(documents.length);list.replaceChildren();empty.hidden=filtered.length>0;if(!filtered.length){empty.querySelector('strong').textContent=documents.length?copy.search:copy.noDocs;empty.querySelector('span').textContent=copy.noDocsDetail;return;}filtered.forEach(item=>{const button=document.createElement('button');button.type='button';button.className='tex-document-item'+(item.id===activeId?' is-active':'');button.dataset.texDocumentId=item.id;const name=document.createElement('strong');name.textContent=item.title||copy.untitled;const preview=document.createElement('p');preview.textContent=item.preview||' ';const meta=document.createElement('div');meta.className='tex-document-meta';const e=document.createElement('span');e.textContent=item.engine||'xelatex';const time=document.createElement('time');time.textContent=formatTime(item.updated_at);meta.append(e,time);button.append(name,preview,meta);button.addEventListener('click',()=>void openDocument(item.id));list.append(button);});}
          function renderEditor(){const open=Boolean(activeDocument);editor.hidden=!open;placeholder.hidden=open;if(!open){compile.disabled=true;return;}title.value=activeDocument.title||'';engine.value=activeDocument.engine||'xelatex';source.value=activeDocument.source||'';dirty=false;setSaveState(copy.saved);updateStats();compile.disabled=!compilerAvailable;}
          function updateLocal(document){const item=summary(document);const index=documents.findIndex(entry=>entry.id===item.id);if(index>=0)documents[index]=item;else documents.unshift(item);documents.sort((a,b)=>String(b.updated_at||'').localeCompare(String(a.updated_at||'')));renderDocuments();}
          function markDirty(){if(!activeId)return;dirty=true;setSaveState(copy.unsaved);updateStats();window.clearTimeout(saveTimer);saveTimer=window.setTimeout(()=>void saveCurrent(false),700);}
          function snapshot(){return {title:title.value,engine:engine.value,source:source.value};}
          async function saveCurrent(silent){if(!activeId||!dirty)return;const id=activeId;const sequence=++saveSequence;dirty=false;if(!silent)setSaveState(copy.saving);try{const data=await api('/api/tex/documents?id='+encodeURIComponent(id),{method:'PUT',body:JSON.stringify(snapshot())});if(sequence!==saveSequence||id!==activeId)return;activeDocument=data.document||activeDocument;updateLocal(activeDocument);setSaveState(copy.saved);}catch(error){if(sequence!==saveSequence)return;dirty=true;setSaveState(error?.message||copy.error,true);}}
          async function openDocument(id){if(id===activeId)return;if(dirty)await saveCurrent(true);window.clearTimeout(saveTimer);try{const data=await api('/api/tex/documents?id='+encodeURIComponent(id));activeId=id;activeDocument=data.document||null;renderEditor();renderDocuments();await loadRuns();}catch(error){showMessage(error?.message||copy.error,true);}}
          async function createDocument(){if(dirty)await saveCurrent(true);const template=templates[document.getElementById('tex-template').value]||templates.blank;try{const data=await api('/api/tex/documents',{method:'POST',body:JSON.stringify(template)});activeId=data.document.id;activeDocument=data.document;updateLocal(activeDocument);renderEditor();await loadRuns();source.focus();}catch(error){showMessage(error?.message||copy.error,true);}}
          async function deleteDocument(){if(!activeId||!window.confirm(copy.deleteConfirm))return;window.clearTimeout(saveTimer);try{await api('/api/tex/documents?id='+encodeURIComponent(activeId),{method:'DELETE'});documents=documents.filter(item=>item.id!==activeId);activeId='';activeDocument=null;dirty=false;runs=[];renderDocuments();renderEditor();renderRuns();showMessage(copy.deleteDone);if(documents[0])await openDocument(documents[0].id);}catch(error){showMessage(error?.message||copy.error,true);}}
          function downloadSource(){if(!activeDocument)return;const blob=new Blob([source.value||''],{type:'application/x-tex;charset=UTF-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');const safe=(title.value||'qsseda-tex').replace(/[^a-z0-9._-]+/gi,'-').replace(/^-+|-+$/g,'').slice(0,80)||'qsseda-tex';a.href=url;a.download=safe+'.tex';document.body.append(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);}
          function runStatusLabel(status){return status==='success'?copy.success:status==='running'?copy.running:status==='unavailable'?copy.unavailable:copy.failed;}
          function renderRuns(){runList.replaceChildren();runsEmpty.hidden=runs.length>0;if(!runs.length)return;runs.forEach(run=>{const item=document.createElement('article');item.className='tex-run-item';const top=document.createElement('div');top.className='tex-run-top';const name=document.createElement('strong');name.textContent=run.document_title||copy.untitled;const status=document.createElement('span');status.className='tex-run-status is-'+(run.status||'failed');status.textContent=runStatusLabel(run.status);top.append(name,status);const meta=document.createElement('div');meta.className='tex-run-meta';const e=document.createElement('span');e.textContent=run.engine||'';const time=document.createElement('time');time.textContent=formatTime(run.completed_at||run.created_at);meta.append(e,time);item.append(top,meta);if(run.error){const p=document.createElement('p');p.className='tex-run-error';p.textContent=run.error;item.append(p);}if(run.result_available&&run.result_url){const link=document.createElement('a');link.href=run.result_url;link.target='_blank';link.rel='noopener';link.textContent=copy.openPdf+' ↗';item.append(link);}runList.append(item);});}
          async function loadRuns(){if(!activeId){runs=[];renderRuns();return;}try{const data=await api('/api/tex/runs?document='+encodeURIComponent(activeId));runs=Array.isArray(data.runs)?data.runs:[];renderRuns();}catch(error){runs=[];renderRuns();}}
          async function compileDocument(){if(!activeId||!compilerAvailable)return;if(dirty)await saveCurrent(true);const compilingId=activeId;compile.disabled=true;compile.textContent=copy.compiling;window.dispatchEvent(new CustomEvent('aertex:tex-build-started',{detail:{documentId:compilingId,automatic:false}}));try{const data=await api('/api/tex/compile',{method:'POST',body:JSON.stringify({document_id:compilingId})});if(data.run){runs.unshift(data.run);renderRuns();}const result=data.run||{};if(result.status==='success'||result.status==='failed'||result.status==='error'){window.dispatchEvent(new CustomEvent('aertex:tex-build-result',{detail:{documentId:compilingId,ok:result.status==='success',log:String(result.log||result.error||'')}}));}showMessage(result.status==='success'?copy.success:'');}catch(error){const run=error?.payload?.run;if(run){runs.unshift(run);renderRuns();}window.dispatchEvent(new CustomEvent('aertex:tex-build-result',{detail:{documentId:compilingId,ok:false,log:String(error?.payload?.log||run?.log||run?.error||error?.message||copy.failed)}}));showMessage(error?.message||copy.failed,true);}finally{compile.textContent=copy.compile;compile.disabled=!compilerAvailable||!activeId;}}
          function applyCompilerStatus(status){compilerAvailable=Boolean(status?.compiler_available);const pill=document.getElementById('tex-compiler-pill');const state=document.getElementById('tex-compiler-state');const detail=document.getElementById('tex-compiler-detail');pill.classList.toggle('is-ready',compilerAvailable);pill.classList.toggle('is-offline',!compilerAvailable);state.classList.toggle('is-ready',compilerAvailable);pill.querySelector('span').textContent=compilerAvailable?copy.compilerReady:copy.compilerOffline;state.querySelector('strong').textContent=compilerAvailable?copy.compilerReady:copy.compilerOffline;detail.textContent=compilerAvailable?copy.compilerDetailReady:copy.compilerDetailOffline;compile.disabled=!compilerAvailable||!activeId;}
          async function initialize(){try{const [statusData,documentData]=await Promise.all([api('/api/tex/status'),api('/api/tex/documents')]);applyCompilerStatus(statusData);documents=Array.isArray(documentData.documents)?documentData.documents:[];renderDocuments();if(documents[0])await openDocument(documents[0].id);else renderEditor();}catch(error){documents=[];renderDocuments();renderEditor();showMessage(error?.message||copy.error,true);}}
          title.addEventListener('input',markDirty);engine.addEventListener('change',markDirty);source.addEventListener('input',markDirty);search.addEventListener('input',renderDocuments);document.getElementById('tex-create').addEventListener('click',()=>void createDocument());document.getElementById('tex-delete').addEventListener('click',()=>void deleteDocument());document.getElementById('tex-download').addEventListener('click',downloadSource);compile.addEventListener('click',()=>void compileDocument());document.getElementById('tex-refresh-runs').addEventListener('click',()=>void loadRuns());void initialize();
        };window.setTimeout(start,0);
      })();
    </script>
  `;
}
