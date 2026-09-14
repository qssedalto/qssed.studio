export function draftsWorkspaceContent(zh) {
  const copy = zh ? {
    eyebrow: "工作区 · 草稿",
    title: "草稿箱",
    intro: "快速记录还没有定稿的内容。草稿自动保存到当前账号，并可以关联项目、按最近编辑排序和搜索正文。",
    create: "新建草稿",
    search: "搜索标题或正文…",
    recent: "最近编辑",
    loading: "正在读取草稿…",
    empty: "还没有草稿",
    emptyDetail: "新建一份草稿，输入后会自动保存。",
    noMatch: "没有匹配的草稿",
    noMatchDetail: "换一个关键词再搜索。",
    untitled: "未命名草稿",
    noProject: "无项目",
    projectUnavailable: "项目不可用",
    project: "所属项目",
    titleLabel: "标题",
    titlePlaceholder: "未命名草稿",
    bodyPlaceholder: "开始写…",
    chars: "字",
    saved: "已自动保存",
    saving: "正在保存…",
    unsaved: "有未保存修改",
    error: "草稿服务暂时不可用",
    select: "选择左侧草稿开始编辑",
    selectDetail: "也可以新建一份草稿。",
    delete: "删除草稿",
    deleteConfirm: "确定删除这份草稿吗？此操作不可撤销。",
    deleted: "草稿已删除",
    privateLabel: "当前账号私人草稿"
  } : {
    eyebrow: "Workspace · Drafts",
    title: "Drafts",
    intro: "Capture unfinished work quickly. Drafts autosave to the current account, can attach to projects, stay sorted by recent edits, and support body search.",
    create: "New Draft",
    search: "Search titles or body text…",
    recent: "Recently edited",
    loading: "Loading drafts…",
    empty: "No drafts yet",
    emptyDetail: "Create a draft. Changes save automatically as you type.",
    noMatch: "No matching drafts",
    noMatchDetail: "Try another keyword.",
    untitled: "Untitled draft",
    noProject: "No Project",
    projectUnavailable: "Project unavailable",
    project: "Project",
    titleLabel: "Title",
    titlePlaceholder: "Untitled draft",
    bodyPlaceholder: "Start writing…",
    chars: "characters",
    saved: "Autosaved",
    saving: "Saving…",
    unsaved: "Unsaved changes",
    error: "Draft service is temporarily unavailable",
    select: "Select a draft to start editing",
    selectDetail: "Or create a new draft.",
    delete: "Delete Draft",
    deleteConfirm: "Delete this draft? This cannot be undone.",
    deleted: "Draft deleted",
    privateLabel: "Private to current account"
  };

  return `
    <section class="drafts-workspace" data-drafts-workspace>
      <div class="drafts-hero">
        <div><span>${copy.eyebrow}</span><h2>${copy.title}</h2><p>${copy.intro}</p></div>
        <button id="drafts-create" class="drafts-primary" type="button">＋ ${copy.create}</button>
      </div>

      <div class="drafts-shell">
        <aside class="drafts-sidebar">
          <div class="drafts-sidebar-head"><div><strong>${copy.recent}</strong><span id="drafts-count">0</span></div><small>${copy.privateLabel}</small></div>
          <div class="drafts-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path></svg><input id="drafts-search" type="search" autocomplete="off" spellcheck="false" placeholder="${copy.search}" aria-label="${copy.search}"></div>
          <div id="drafts-list" class="drafts-list"></div>
          <div id="drafts-empty" class="drafts-empty"><strong>${copy.loading}</strong><span>${copy.emptyDetail}</span></div>
        </aside>

        <main class="draft-editor-shell">
          <div id="draft-editor-placeholder" class="draft-editor-placeholder"><div>✎</div><strong>${copy.select}</strong><span>${copy.selectDetail}</span></div>
          <section id="draft-editor" class="draft-editor" hidden>
            <div class="draft-editor-toolbar">
              <label><span>${copy.project}</span><select id="draft-project"><option value="">${copy.noProject}</option></select></label>
              <div class="draft-editor-state"><span id="draft-save-state">${copy.saved}</span><strong id="draft-char-count">0</strong><small>${copy.chars}</small></div>
            </div>
            <input id="draft-title" class="draft-title" maxlength="180" placeholder="${copy.titlePlaceholder}" aria-label="${copy.titleLabel}">
            <textarea id="draft-body" class="draft-body" maxlength="90000" placeholder="${copy.bodyPlaceholder}" aria-label="${copy.bodyPlaceholder}"></textarea>
            <div class="draft-editor-footer"><button id="draft-delete" class="draft-danger" type="button">${copy.delete}</button></div>
          </section>
        </main>
      </div>
      <div id="drafts-message" class="drafts-message" hidden></div>
    </section>

    <style>
      .drafts-workspace{display:grid;gap:14px;min-width:0}.drafts-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;padding:23px;border:1px solid var(--border);border-radius:21px;background:var(--card)}.drafts-hero>div>span{display:block;color:var(--muted);font-size:11px;font-weight:700}.drafts-hero h2{margin:5px 0 7px;font-size:29px;letter-spacing:-.042em}.drafts-hero p{max-width:760px;margin:0;color:var(--muted);font-size:13px;line-height:1.58}.drafts-primary,.draft-danger{width:auto!important;margin:0!important;border:0!important;box-shadow:none!important}.drafts-primary{min-height:42px!important;padding:0 15px!important;border-radius:12px!important;background:var(--primary)!important;color:white!important;font-size:13px!important;font-weight:700!important;white-space:nowrap}
      .drafts-shell{display:grid;grid-template-columns:minmax(250px,320px) minmax(0,1fr);min-height:610px;border:1px solid var(--border);border-radius:20px;background:var(--card);overflow:hidden}.drafts-sidebar{display:flex;min-width:0;flex-direction:column;border-right:1px solid var(--hairline);background:var(--fill)}.drafts-sidebar-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:15px 14px 9px}.drafts-sidebar-head>div{display:flex;align-items:center;gap:7px}.drafts-sidebar-head strong{font-size:12px}.drafts-sidebar-head span{display:grid;place-items:center;min-width:20px;height:20px;padding:0 5px;border-radius:999px;background:var(--surface);color:var(--muted);font-size:9px}.drafts-sidebar-head small{color:var(--quiet);font-size:9px}.drafts-search{display:flex;align-items:center;gap:8px;margin:0 10px 9px;padding:0 10px;border-radius:10px;background:var(--surface);box-shadow:inset 0 0 0 1px var(--border)}.drafts-search svg{width:15px;height:15px;fill:none;stroke:var(--muted);stroke-width:1.8;stroke-linecap:round}.drafts-search input{width:100%;height:38px;min-height:0;margin:0;padding:0;border:0!important;background:transparent!important;box-shadow:none!important;font-size:11px}.drafts-list{display:grid;gap:3px;padding:0 7px 10px;overflow:auto}.draft-list-item{display:grid;gap:5px;width:100%;min-width:0;margin:0;padding:11px;border:0;border-radius:11px;background:transparent;color:var(--text);text-align:left}.draft-list-item:hover,.draft-list-item.is-active{background:var(--surface)}.draft-list-item strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}.draft-list-item p{display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;margin:0;color:var(--muted);font-size:10px;line-height:1.4}.draft-list-meta{display:flex;align-items:center;justify-content:space-between;gap:7px;color:var(--quiet);font-size:9px}.draft-list-meta span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.drafts-empty{display:grid;gap:5px;padding:26px 15px;color:var(--muted);text-align:center}.drafts-empty[hidden]{display:none}.drafts-empty strong{color:var(--text);font-size:12px}.drafts-empty span{font-size:10px;line-height:1.45}
      .draft-editor-shell{min-width:0;background:var(--surface)}.draft-editor-placeholder{display:grid;place-items:center;align-content:center;gap:7px;height:100%;min-height:500px;padding:40px;text-align:center}.draft-editor-placeholder>div{display:grid;place-items:center;width:46px;height:46px;border-radius:14px;background:var(--fill);color:var(--muted);font-size:21px}.draft-editor-placeholder strong{font-size:14px}.draft-editor-placeholder span{color:var(--muted);font-size:11px}.draft-editor{display:grid;grid-template-rows:auto auto minmax(420px,1fr) auto;height:100%;min-height:610px}.draft-editor[hidden]{display:none}.draft-editor-toolbar{display:flex;align-items:end;justify-content:space-between;gap:16px;padding:12px 16px;border-bottom:1px solid var(--hairline)}.draft-editor-toolbar label{display:grid;gap:4px;min-width:220px}.draft-editor-toolbar label>span{color:var(--muted);font-size:9px}.draft-editor-toolbar select{height:34px;min-height:34px;margin:0;padding:0 30px 0 10px;border:0;border-radius:9px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border);font-size:11px}.draft-editor-state{display:flex;align-items:baseline;gap:5px;color:var(--muted);font-size:9px}.draft-editor-state span{margin-right:7px}.draft-editor-state span.is-error{color:var(--danger)}.draft-editor-state strong{color:var(--text);font-size:13px}.draft-title{width:100%;height:auto!important;min-height:64px!important;margin:0!important;padding:18px 20px 10px!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;color:var(--text)!important;font-size:24px!important;font-weight:680!important;letter-spacing:-.035em}.draft-body{width:100%;height:100%;min-height:420px;margin:0;padding:10px 20px 24px;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;color:var(--text);resize:none;font:14px/1.72 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.draft-title:focus,.draft-body:focus{outline:none}.draft-editor-footer{display:flex;justify-content:flex-end;padding:10px 16px;border-top:1px solid var(--hairline)}.draft-danger{min-height:36px!important;padding:0 11px!important;border-radius:10px!important;background:color-mix(in srgb,var(--danger) 10%,var(--fill))!important;color:var(--danger)!important;font-size:10px!important;font-weight:650!important}.drafts-message{padding:10px 12px;border-radius:11px;background:var(--fill);color:var(--muted);font-size:11px}.drafts-message.is-error{background:color-mix(in srgb,var(--danger) 9%,var(--fill));color:var(--danger)}
      @media(max-width:860px){.drafts-shell{grid-template-columns:1fr;min-height:0}.drafts-sidebar{max-height:330px;border-right:0;border-bottom:1px solid var(--hairline)}.draft-editor{min-height:560px}.draft-editor-placeholder{min-height:340px}}@media(max-width:620px){.drafts-hero{display:grid;padding:18px}.drafts-primary{justify-self:start}.draft-editor-toolbar{align-items:stretch;flex-direction:column}.draft-editor-toolbar label{min-width:0}.draft-editor-state{justify-content:flex-end}.draft-title{font-size:21px!important}}
    </style>

    <script>
      (()=>{
        const start=()=>{
          const root=document.querySelector('[data-drafts-workspace]');if(!root)return;
          const list=document.getElementById('drafts-list');const empty=document.getElementById('drafts-empty');const search=document.getElementById('drafts-search');const editor=document.getElementById('draft-editor');const placeholder=document.getElementById('draft-editor-placeholder');const title=document.getElementById('draft-title');const body=document.getElementById('draft-body');const project=document.getElementById('draft-project');const saveState=document.getElementById('draft-save-state');const count=document.getElementById('draft-char-count');const message=document.getElementById('drafts-message');
          let drafts=[];let projects=[];let activeId='';let activeDraft=null;let saveTimer=null;let searchTimer=null;let saveSequence=0;let dirty=false;
          const projectMap=()=>new Map(projects.map(item=>[item.id,item]));
          async function api(path,options={}){const response=await fetch(path,{...options,credentials:'same-origin',headers:{Accept:'application/json',...(options.body?{'Content-Type':'application/json;charset=UTF-8'}:{}),...(options.headers||{})},cache:'no-store'});const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload?.error||${JSON.stringify(copy.error)});return payload;}
          function showMessage(text,error){message.hidden=!text;message.textContent=text||'';message.classList.toggle('is-error',Boolean(error));}
          function setSaveState(text,error=false){saveState.textContent=text;saveState.classList.toggle('is-error',error);}
          function projectName(id){if(!id)return ${JSON.stringify(copy.noProject)};return projectMap().get(id)?.name||${JSON.stringify(copy.projectUnavailable)};}
          function formatTime(value){const date=new Date(value);return Number.isNaN(date.getTime())?'':date.toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});}
          function summaryOf(draft){return {id:draft.id,project_id:draft.project_id||'',title:draft.title||'',preview:String(draft.body||'').split(String.fromCharCode(10)).join(' ').trim().slice(0,240),created_at:draft.created_at,updated_at:draft.updated_at};}
          function updateProjectOptions(){const current=project.value||'';project.replaceChildren(new Option(${JSON.stringify(copy.noProject)},''));projects.filter(item=>item.status!=='archived').forEach(item=>project.add(new Option(item.name,item.id)));if([...project.options].some(option=>option.value===current))project.value=current;}
          function renderList(){document.getElementById('drafts-count').textContent=String(drafts.length);list.replaceChildren();empty.hidden=drafts.length>0;if(!drafts.length){empty.querySelector('strong').textContent=search.value.trim()?${JSON.stringify(copy.noMatch)}:${JSON.stringify(copy.empty)};empty.querySelector('span').textContent=search.value.trim()?${JSON.stringify(copy.noMatchDetail)}:${JSON.stringify(copy.emptyDetail)};return;}drafts.forEach(item=>{const button=document.createElement('button');button.type='button';button.className='draft-list-item'+(item.id===activeId?' is-active':'');const name=document.createElement('strong');name.textContent=item.title||${JSON.stringify(copy.untitled)};const preview=document.createElement('p');preview.textContent=item.preview||' ';const meta=document.createElement('div');meta.className='draft-list-meta';const p=document.createElement('span');p.textContent=projectName(item.project_id);const time=document.createElement('time');time.textContent=formatTime(item.updated_at);meta.append(p,time);button.append(name,preview,meta);button.addEventListener('click',()=>void openDraft(item.id));list.append(button);});}
          function renderEditor(){const open=Boolean(activeDraft);editor.hidden=!open;placeholder.hidden=open;if(!open)return;title.value=activeDraft.title||'';body.value=activeDraft.body||'';project.value=activeDraft.project_id&&[...project.options].some(option=>option.value===activeDraft.project_id)?activeDraft.project_id:'';count.textContent=String(body.value.length);setSaveState(${JSON.stringify(copy.saved)},false);dirty=false;}
          function updateLocalSummary(draft){const summary=summaryOf(draft);const index=drafts.findIndex(item=>item.id===summary.id);if(index>=0)drafts[index]=summary;else drafts.unshift(summary);drafts.sort((a,b)=>String(b.updated_at||'').localeCompare(String(a.updated_at||'')));renderList();}
          async function openDraft(id){if(id===activeId)return;if(dirty)await saveCurrent(true);window.clearTimeout(saveTimer);activeId=id;try{const data=await api('/api/drafts?id='+encodeURIComponent(id));activeDraft=data.draft||null;renderEditor();renderList();}catch(error){showMessage(error?.message||${JSON.stringify(copy.error)},true);}}
          function snapshot(){return {title:title.value,body:body.value,project_id:project.value};}
          function markDirty(){if(!activeId)return;dirty=true;count.textContent=String(body.value.length);setSaveState(${JSON.stringify(copy.unsaved)},false);window.clearTimeout(saveTimer);saveTimer=window.setTimeout(()=>void saveCurrent(false),650);}
          async function saveCurrent(silent){if(!activeId||!dirty)return;const id=activeId;const sequence=++saveSequence;dirty=false;if(!silent)setSaveState(${JSON.stringify(copy.saving)},false);try{const data=await api('/api/drafts?id='+encodeURIComponent(id),{method:'PUT',body:JSON.stringify(snapshot())});if(sequence!==saveSequence||id!==activeId)return;activeDraft=data.draft||activeDraft;updateLocalSummary(activeDraft);setSaveState(${JSON.stringify(copy.saved)},false);}catch(error){if(sequence!==saveSequence)return;dirty=true;setSaveState(error?.message||${JSON.stringify(copy.error)},true);}}
          async function createDraft(){if(dirty)await saveCurrent(true);try{const data=await api('/api/drafts',{method:'POST',body:JSON.stringify({title:'',body:'',project_id:''})});const draft=data.draft;drafts.unshift(summaryOf(draft));activeId=draft.id;activeDraft=draft;renderList();renderEditor();title.focus();}catch(error){showMessage(error?.message||${JSON.stringify(copy.error)},true);}}
          async function deleteDraft(){if(!activeId||!window.confirm(${JSON.stringify(copy.deleteConfirm)}))return;window.clearTimeout(saveTimer);try{await api('/api/drafts?id='+encodeURIComponent(activeId),{method:'DELETE'});drafts=drafts.filter(item=>item.id!==activeId);activeId='';activeDraft=null;dirty=false;renderList();renderEditor();showMessage(${JSON.stringify(copy.deleted)},false);}catch(error){showMessage(error?.message||${JSON.stringify(copy.error)},true);}}
          async function searchDrafts(){const query=search.value.trim();empty.hidden=false;empty.querySelector('strong').textContent=${JSON.stringify(copy.loading)};try{const data=await api('/api/drafts'+(query?'?q='+encodeURIComponent(query):''));drafts=Array.isArray(data.drafts)?data.drafts:[];renderList();}catch(error){drafts=[];renderList();showMessage(error?.message||${JSON.stringify(copy.error)},true);}}
          async function initialize(){try{const [draftData,projectData]=await Promise.all([api('/api/drafts'),api('/api/projects')]);drafts=Array.isArray(draftData.drafts)?draftData.drafts:[];projects=Array.isArray(projectData.projects)?projectData.projects:[];updateProjectOptions();renderList();if(drafts[0])await openDraft(drafts[0].id);else renderEditor();}catch(error){drafts=[];projects=[];updateProjectOptions();renderList();renderEditor();showMessage(error?.message||${JSON.stringify(copy.error)},true);}}
          title.addEventListener('input',markDirty);body.addEventListener('input',markDirty);project.addEventListener('change',markDirty);document.getElementById('drafts-create').addEventListener('click',()=>void createDraft());document.getElementById('draft-delete').addEventListener('click',()=>void deleteDraft());search.addEventListener('input',()=>{window.clearTimeout(searchTimer);searchTimer=window.setTimeout(()=>void searchDrafts(),260);});window.addEventListener('beforeunload',()=>{if(dirty)void saveCurrent(true);});void initialize();
        };window.setTimeout(start,0);
      })();
    </script>
  `;
}
