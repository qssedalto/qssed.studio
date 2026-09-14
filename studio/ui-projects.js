export function projectsWorkspaceContent(zh) {
  const copy = zh ? {
    eyebrow: "工作区 · 项目",
    title: "项目管理",
    intro: "把正在推进的项目集中到一个账号工作区。项目默认只属于当前账号，之后的任务和草稿可以继续关联到这里。",
    create: "新建项目",
    search: "搜索项目、标签或下一步…",
    all: "全部",
    planning: "规划中",
    active: "进行中",
    paused: "已暂停",
    done: "已完成",
    archived: "已归档",
    total: "项目",
    activeCount: "进行中",
    doneCount: "已完成",
    loading: "正在读取项目…",
    empty: "还没有项目",
    emptyDetail: "创建第一个项目，把目标、链接和下一步行动放在一起。",
    noMatch: "没有匹配的项目",
    noMatchDetail: "换一个关键词或状态筛选。",
    edit: "编辑",
    repository: "仓库",
    website: "项目链接",
    next: "下一步",
    updated: "更新",
    modalCreate: "新建项目",
    modalEdit: "编辑项目",
    name: "项目名称",
    namePlaceholder: "例如：QssedA Studio",
    summary: "项目说明",
    summaryPlaceholder: "这个项目解决什么问题，现在推进到什么阶段？",
    status: "状态",
    priority: "优先级",
    low: "低",
    normal: "普通",
    high: "高",
    tags: "标签",
    tagsPlaceholder: "例如：网站, Cloudflare, UI",
    repositoryUrl: "仓库地址",
    repositoryPlaceholder: "https://github.com/...",
    projectUrl: "项目地址",
    projectPlaceholder: "https://...",
    nextAction: "下一步行动",
    nextPlaceholder: "下一件明确要推进的事情",
    save: "保存项目",
    saving: "正在保存…",
    cancel: "取消",
    delete: "删除项目",
    deleteConfirm: "确定删除这个项目吗？此操作不可撤销。",
    error: "项目服务暂时不可用",
    saved: "项目已保存",
    deleted: "项目已删除",
    privateLabel: "当前账号私人项目"
  } : {
    eyebrow: "Workspace · Projects",
    title: "Project Management",
    intro: "Keep active projects in one account workspace. Projects belong to the current account by default, and tasks and drafts can later attach to them.",
    create: "New Project",
    search: "Search projects, tags, or next actions…",
    all: "All",
    planning: "Planning",
    active: "Active",
    paused: "Paused",
    done: "Done",
    archived: "Archived",
    total: "projects",
    activeCount: "active",
    doneCount: "done",
    loading: "Loading projects…",
    empty: "No projects yet",
    emptyDetail: "Create your first project and keep its goal, links, and next action together.",
    noMatch: "No matching projects",
    noMatchDetail: "Try another keyword or status filter.",
    edit: "Edit",
    repository: "Repository",
    website: "Project link",
    next: "Next",
    updated: "Updated",
    modalCreate: "New Project",
    modalEdit: "Edit Project",
    name: "Project name",
    namePlaceholder: "For example: QssedA Studio",
    summary: "Project summary",
    summaryPlaceholder: "What problem does this project solve, and where is it now?",
    status: "Status",
    priority: "Priority",
    low: "Low",
    normal: "Normal",
    high: "High",
    tags: "Tags",
    tagsPlaceholder: "For example: Website, Cloudflare, UI",
    repositoryUrl: "Repository URL",
    repositoryPlaceholder: "https://github.com/...",
    projectUrl: "Project URL",
    projectPlaceholder: "https://...",
    nextAction: "Next action",
    nextPlaceholder: "The next concrete thing to move forward",
    save: "Save Project",
    saving: "Saving…",
    cancel: "Cancel",
    delete: "Delete Project",
    deleteConfirm: "Delete this project? This cannot be undone.",
    error: "Project service is temporarily unavailable",
    saved: "Project saved",
    deleted: "Project deleted",
    privateLabel: "Private to current account"
  };

  return `
    <section class="projects-workspace" data-projects-workspace>
      <div class="projects-hero">
        <div class="projects-hero-copy">
          <span>${copy.eyebrow}</span>
          <h2>${copy.title}</h2>
          <p>${copy.intro}</p>
        </div>
        <button id="projects-create" class="projects-primary" type="button">＋ ${copy.create}</button>
      </div>

      <div class="projects-overview">
        <div class="projects-stats">
          <div><strong id="projects-total">0</strong><span>${copy.total}</span></div>
          <div><strong id="projects-active-count">0</strong><span>${copy.activeCount}</span></div>
          <div><strong id="projects-done-count">0</strong><span>${copy.doneCount}</span></div>
        </div>
        <span class="projects-private-note">${copy.privateLabel}</span>
      </div>

      <div class="projects-filter-panel">
        <div class="projects-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path></svg>
          <input id="projects-search" type="search" autocomplete="off" spellcheck="false" placeholder="${copy.search}" aria-label="${copy.search}">
        </div>
        <div class="projects-status-filters" role="tablist">
          <button class="is-active" data-project-status="all" type="button">${copy.all}<b data-project-count="all">0</b></button>
          <button data-project-status="planning" type="button">${copy.planning}<b data-project-count="planning">0</b></button>
          <button data-project-status="active" type="button">${copy.active}<b data-project-count="active">0</b></button>
          <button data-project-status="paused" type="button">${copy.paused}<b data-project-count="paused">0</b></button>
          <button data-project-status="done" type="button">${copy.done}<b data-project-count="done">0</b></button>
          <button data-project-status="archived" type="button">${copy.archived}<b data-project-count="archived">0</b></button>
        </div>
      </div>

      <div id="projects-message" class="projects-message" hidden></div>
      <div id="projects-list" class="projects-list"></div>
      <div id="projects-empty" class="projects-empty">
        <div class="projects-empty-icon">◇</div>
        <strong>${copy.loading}</strong>
        <span>${copy.emptyDetail}</span>
      </div>
    </section>

    <div id="project-dialog" class="project-dialog" aria-hidden="true">
      <button class="project-dialog-backdrop" type="button" data-project-close aria-label="${copy.cancel}"></button>
      <section class="project-editor" role="dialog" aria-modal="true" aria-labelledby="project-dialog-title">
        <div class="project-editor-head">
          <div><span>${copy.eyebrow}</span><h2 id="project-dialog-title">${copy.modalCreate}</h2></div>
          <button class="project-close" type="button" data-project-close aria-label="${copy.cancel}">×</button>
        </div>
        <form id="project-form">
          <label class="project-field project-field-wide"><span>${copy.name}</span><input id="project-name" maxlength="160" required placeholder="${copy.namePlaceholder}"></label>
          <label class="project-field project-field-wide"><span>${copy.summary}</span><textarea id="project-summary" rows="4" maxlength="1000" placeholder="${copy.summaryPlaceholder}"></textarea></label>
          <div class="project-form-grid">
            <label class="project-field"><span>${copy.status}</span><select id="project-status"><option value="planning">${copy.planning}</option><option value="active">${copy.active}</option><option value="paused">${copy.paused}</option><option value="done">${copy.done}</option><option value="archived">${copy.archived}</option></select></label>
            <label class="project-field"><span>${copy.priority}</span><select id="project-priority"><option value="low">${copy.low}</option><option value="normal" selected>${copy.normal}</option><option value="high">${copy.high}</option></select></label>
          </div>
          <label class="project-field project-field-wide"><span>${copy.tags}</span><input id="project-tags" maxlength="500" placeholder="${copy.tagsPlaceholder}"></label>
          <div class="project-form-grid">
            <label class="project-field"><span>${copy.repositoryUrl}</span><input id="project-repository" type="url" maxlength="1200" placeholder="${copy.repositoryPlaceholder}"></label>
            <label class="project-field"><span>${copy.projectUrl}</span><input id="project-url" type="url" maxlength="1200" placeholder="${copy.projectPlaceholder}"></label>
          </div>
          <label class="project-field project-field-wide"><span>${copy.nextAction}</span><textarea id="project-next" rows="3" maxlength="500" placeholder="${copy.nextPlaceholder}"></textarea></label>
          <div class="project-editor-actions">
            <button id="project-delete" class="project-danger" type="button" hidden>${copy.delete}</button>
            <div class="project-editor-actions-main">
              <button class="project-secondary" type="button" data-project-close>${copy.cancel}</button>
              <button id="project-save" class="projects-primary" type="submit">${copy.save}</button>
            </div>
          </div>
        </form>
      </section>
    </div>

    <style>
      .projects-workspace{display:grid;gap:14px;min-width:0}.projects-hero,.projects-overview,.projects-filter-panel,.projects-empty{border:1px solid var(--border);background:var(--card)}
      .projects-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;padding:23px;border-radius:21px}.projects-hero-copy>span,.project-editor-head span{display:block;color:var(--muted);font-size:11px;font-weight:700}.projects-hero-copy h2{margin:5px 0 7px;font-size:29px;letter-spacing:-.042em}.projects-hero-copy p{max-width:760px;margin:0;color:var(--muted);font-size:13px;line-height:1.58}
      .projects-primary,.project-secondary,.project-danger,.project-close{width:auto!important;margin:0!important;border:0!important;box-shadow:none!important}.projects-primary{min-height:42px!important;padding:0 15px!important;border-radius:12px!important;background:var(--primary)!important;color:white!important;font-size:13px!important;font-weight:700!important;white-space:nowrap}.projects-primary:active{transform:scale(.97)}
      .projects-overview{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:15px 18px;border-radius:17px}.projects-stats{display:flex;gap:26px}.projects-stats div{display:grid;gap:2px}.projects-stats strong{font-size:22px;letter-spacing:-.035em}.projects-stats span,.projects-private-note{color:var(--muted);font-size:10px}.projects-private-note{padding:6px 9px;border-radius:999px;background:var(--fill)}
      .projects-filter-panel{display:grid;gap:9px;padding:10px;border-radius:17px}.projects-search{display:flex;align-items:center;gap:10px;min-height:46px;padding:0 12px;border-radius:12px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border)}.projects-search:focus-within{box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 13%,transparent),inset 0 0 0 1px var(--primary)}.projects-search svg{width:17px;height:17px;fill:none;stroke:var(--muted);stroke-width:1.8;stroke-linecap:round}.projects-search input{width:100%;height:44px;min-height:0;margin:0;padding:0;border:0!important;background:transparent!important;box-shadow:none!important}
      .projects-status-filters{display:flex;gap:5px;overflow:auto;scrollbar-width:none}.projects-status-filters::-webkit-scrollbar{display:none}.projects-status-filters button{display:inline-flex;align-items:center;gap:6px;width:auto!important;min-width:max-content!important;min-height:34px!important;margin:0!important;padding:0 10px!important;border:0!important;border-radius:9px!important;background:transparent!important;color:var(--muted)!important;box-shadow:none!important;font-size:11px!important;font-weight:650!important}.projects-status-filters button:hover,.projects-status-filters button.is-active{background:var(--fill)!important;color:var(--text)!important}.projects-status-filters b{display:grid;place-items:center;min-width:19px;height:19px;padding:0 5px;border-radius:999px;background:var(--surface);color:var(--quiet);font-size:9px}
      .projects-message{padding:10px 12px;border-radius:11px;background:var(--fill);color:var(--muted);font-size:11px}.projects-message.is-error{background:color-mix(in srgb,var(--danger) 9%,var(--fill));color:var(--danger)}
      .projects-list{display:grid;gap:8px}.project-card{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;padding:17px 18px;border:1px solid var(--border);border-radius:17px;background:var(--card)}.project-card-main{min-width:0}.project-card-head{display:flex;align-items:center;gap:8px;min-width:0}.project-card-head h3{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0;font-size:15px;letter-spacing:-.015em}.project-chip{flex:0 0 auto;padding:4px 7px;border-radius:999px;background:var(--fill);color:var(--muted);font-size:9px;font-weight:720}.project-chip.is-high{background:color-mix(in srgb,var(--danger) 10%,var(--fill));color:var(--danger)}.project-card-summary{display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;margin:8px 0 0;color:var(--muted);font-size:12px;line-height:1.52}.project-card-next{margin-top:10px;padding:9px 10px;border-radius:10px;background:var(--fill);font-size:11px}.project-card-next span{color:var(--muted);margin-right:5px}.project-tags,.project-links,.project-foot{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}.project-tags span{padding:3px 6px;border-radius:7px;background:var(--fill);color:var(--muted);font-size:9px}.project-links a{color:var(--primary);font-size:10px;text-decoration:none}.project-foot{color:var(--quiet);font-size:9px}.project-card-actions{display:flex;align-items:flex-start}.project-edit{width:auto!important;min-height:34px!important;margin:0!important;padding:0 11px!important;border:0!important;border-radius:9px!important;background:var(--fill)!important;color:var(--text)!important;box-shadow:none!important;font-size:11px!important;font-weight:650!important}
      .projects-empty{display:grid;place-items:center;gap:6px;min-height:210px;padding:34px;border-radius:18px;text-align:center}.projects-empty[hidden]{display:none}.projects-empty-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:var(--fill);color:var(--muted);font-size:22px}.projects-empty strong{font-size:14px}.projects-empty span{max-width:540px;color:var(--muted);font-size:11px;line-height:1.55}
      .project-dialog{position:fixed;inset:0;z-index:1200;display:none;place-items:center;padding:22px}.project-dialog.is-open{display:grid}.project-dialog-backdrop{position:absolute;inset:0;width:100%!important;height:100%!important;margin:0!important;border:0!important;border-radius:0!important;background:rgba(0,0,0,.28)!important;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}.project-editor{position:relative;width:min(720px,100%);max-height:min(830px,calc(100vh - 44px));overflow:auto;padding:22px;border:1px solid var(--border);border-radius:22px;background:var(--surface);box-shadow:0 28px 80px rgba(0,0,0,.25)}.project-editor-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:15px}.project-editor-head h2{margin:4px 0 0;font-size:23px;letter-spacing:-.035em}.project-close{display:grid!important;place-items:center!important;width:34px!important;height:34px!important;min-height:34px!important;padding:0!important;border-radius:10px!important;background:var(--fill)!important;color:var(--text)!important;font-size:20px!important}.project-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.project-field{display:grid;gap:6px;margin-top:10px}.project-field>span{color:var(--muted);font-size:11px;font-weight:650}.project-field input,.project-field select,.project-field textarea{width:100%;margin:0;border:0;border-radius:11px;background:var(--fill);color:var(--text);box-shadow:inset 0 0 0 1px var(--border)}.project-field textarea{padding:11px 12px;resize:vertical;line-height:1.5}.project-editor-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:18px;padding-top:15px;border-top:1px solid var(--hairline)}.project-editor-actions-main{display:flex;gap:7px;margin-left:auto}.project-secondary,.project-danger{min-height:40px!important;padding:0 13px!important;border-radius:11px!important;font-size:12px!important;font-weight:650!important}.project-secondary{background:var(--fill)!important;color:var(--text)!important}.project-danger{background:color-mix(in srgb,var(--danger) 10%,var(--fill))!important;color:var(--danger)!important}
      @media(max-width:720px){.projects-hero{display:grid;padding:18px}.projects-primary{justify-self:start}.projects-overview{align-items:flex-start;flex-direction:column}.projects-stats{width:100%;justify-content:space-between}.project-card{grid-template-columns:1fr}.project-card-actions{justify-content:flex-start}.project-form-grid{grid-template-columns:1fr}.project-dialog{padding:10px}.project-editor{max-height:calc(100vh - 20px);padding:17px;border-radius:18px}}
      @media(prefers-reduced-motion:reduce){.projects-primary{transition:none!important}.project-dialog-backdrop{backdrop-filter:none;-webkit-backdrop-filter:none}}
    </style>

    <script>
      (()=>{
        const start=()=>{
          const root=document.querySelector('[data-projects-workspace]');
          if(!root)return;
          const list=document.getElementById('projects-list');
          const empty=document.getElementById('projects-empty');
          const search=document.getElementById('projects-search');
          const dialog=document.getElementById('project-dialog');
          const form=document.getElementById('project-form');
          const message=document.getElementById('projects-message');
          const deleteButton=document.getElementById('project-delete');
          const saveButton=document.getElementById('project-save');
          const labels=${JSON.stringify({planning:copy.planning,active:copy.active,paused:copy.paused,done:copy.done,archived:copy.archived,low:copy.low,normal:copy.normal,high:copy.high,edit:copy.edit,repository:copy.repository,website:copy.website,next:copy.next,updated:copy.updated})};
          let projects=[];
          let activeStatus='all';
          let editingId='';

          function showMessage(text,error){if(!message)return;message.hidden=!text;message.textContent=text||'';message.classList.toggle('is-error',Boolean(error));}
          function api(path,options){return fetch(path,{...options,credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json',...(options&&options.body?{'Content-Type':'application/json;charset=UTF-8'}:{}),...(options?.headers||{})}}).then(async response=>{const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload?.error||${JSON.stringify(copy.error)});return payload;});}
          function statusLabel(value){return labels[value]||value;}
          function priorityLabel(value){return labels[value]||value;}
          function updateStats(){
            document.getElementById('projects-total').textContent=String(projects.length);
            document.getElementById('projects-active-count').textContent=String(projects.filter(item=>item.status==='active').length);
            document.getElementById('projects-done-count').textContent=String(projects.filter(item=>item.status==='done').length);
            document.querySelectorAll('[data-project-count]').forEach(node=>{const key=node.dataset.projectCount;node.textContent=String(key==='all'?projects.length:projects.filter(item=>item.status===key).length);});
          }
          function matching(){
            const query=(search?.value||'').trim().toLocaleLowerCase();
            return projects.filter(project=>{
              if(activeStatus!=='all'&&project.status!==activeStatus)return false;
              if(!query)return true;
              const text=[project.name,project.summary,project.next_action,(project.tags||[]).join(' '),project.repository_url,project.project_url].join(' ').toLocaleLowerCase();
              return text.includes(query);
            });
          }
          function addText(parent,tag,className,text){const node=document.createElement(tag);if(className)node.className=className;node.textContent=text;parent.append(node);return node;}
          function addExternal(parent,label,url){if(!url)return;const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=label+' ↗';parent.append(link);}
          function render(){
            const visible=matching();list.replaceChildren();updateStats();
            if(!projects.length){empty.hidden=false;empty.querySelector('strong').textContent=${JSON.stringify(copy.empty)};empty.querySelector('span').textContent=${JSON.stringify(copy.emptyDetail)};return;}
            if(!visible.length){empty.hidden=false;empty.querySelector('strong').textContent=${JSON.stringify(copy.noMatch)};empty.querySelector('span').textContent=${JSON.stringify(copy.noMatchDetail)};return;}
            empty.hidden=true;
            visible.forEach(project=>{
              const card=document.createElement('article');card.className='project-card';
              const main=document.createElement('div');main.className='project-card-main';
              const head=document.createElement('div');head.className='project-card-head';
              addText(head,'h3','',project.name||'—');addText(head,'span','project-chip',statusLabel(project.status));const priority=addText(head,'span','project-chip'+(project.priority==='high'?' is-high':''),priorityLabel(project.priority));priority.title=${JSON.stringify(copy.priority)};
              main.append(head);
              if(project.summary)addText(main,'p','project-card-summary',project.summary);
              if(project.next_action){const next=document.createElement('div');next.className='project-card-next';addText(next,'span','',${JSON.stringify(copy.next)}+' ·');next.append(document.createTextNode(project.next_action));main.append(next);}
              if(Array.isArray(project.tags)&&project.tags.length){const tags=document.createElement('div');tags.className='project-tags';project.tags.forEach(tag=>addText(tags,'span','',tag));main.append(tags);}
              if(project.repository_url||project.project_url){const links=document.createElement('div');links.className='project-links';addExternal(links,${JSON.stringify(copy.repository)},project.repository_url);addExternal(links,${JSON.stringify(copy.website)},project.project_url);main.append(links);}
              const foot=document.createElement('div');foot.className='project-foot';addText(foot,'span','',${JSON.stringify(copy.updated)}+' '+(project.updated_at?new Date(project.updated_at).toLocaleString():'—'));main.append(foot);
              const actions=document.createElement('div');actions.className='project-card-actions';const edit=document.createElement('button');edit.type='button';edit.className='project-edit';edit.textContent=${JSON.stringify(copy.edit)};edit.addEventListener('click',()=>openEditor(project));actions.append(edit);
              card.append(main,actions);list.append(card);
            });
          }
          function formValue(id){return document.getElementById(id)?.value||'';}
          function payload(){return {name:formValue('project-name'),summary:formValue('project-summary'),status:formValue('project-status'),priority:formValue('project-priority'),tags:formValue('project-tags'),repository_url:formValue('project-repository'),project_url:formValue('project-url'),next_action:formValue('project-next')};}
          function fill(project){
            document.getElementById('project-name').value=project?.name||'';document.getElementById('project-summary').value=project?.summary||'';document.getElementById('project-status').value=project?.status||'planning';document.getElementById('project-priority').value=project?.priority||'normal';document.getElementById('project-tags').value=Array.isArray(project?.tags)?project.tags.join(', '):'';document.getElementById('project-repository').value=project?.repository_url||'';document.getElementById('project-url').value=project?.project_url||'';document.getElementById('project-next').value=project?.next_action||'';
          }
          function openEditor(project){editingId=project?.id||'';fill(project||null);document.getElementById('project-dialog-title').textContent=editingId?${JSON.stringify(copy.modalEdit)}:${JSON.stringify(copy.modalCreate)};deleteButton.hidden=!editingId;dialog.classList.add('is-open');dialog.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';window.setTimeout(()=>document.getElementById('project-name')?.focus(),30);}
          function closeEditor(){dialog.classList.remove('is-open');dialog.setAttribute('aria-hidden','true');document.body.style.overflow='';editingId='';fill(null);}
          async function refresh(){showMessage('',false);try{const data=await api('/api/projects',{method:'GET'});projects=Array.isArray(data?.projects)?data.projects:[];render();}catch(error){projects=[];render();showMessage(error?.message||${JSON.stringify(copy.error)},true);empty.hidden=false;empty.querySelector('strong').textContent=${JSON.stringify(copy.error)};}}

          document.getElementById('projects-create')?.addEventListener('click',()=>openEditor(null));
          document.querySelectorAll('[data-project-close]').forEach(button=>button.addEventListener('click',closeEditor));
          search?.addEventListener('input',render);
          document.querySelectorAll('[data-project-status]').forEach(button=>button.addEventListener('click',()=>{activeStatus=button.dataset.projectStatus||'all';document.querySelectorAll('[data-project-status]').forEach(item=>item.classList.toggle('is-active',item===button));render();}));
          form?.addEventListener('submit',async event=>{event.preventDefault();saveButton.disabled=true;saveButton.textContent=${JSON.stringify(copy.saving)};try{const path=editingId?'/api/projects?id='+encodeURIComponent(editingId):'/api/projects';await api(path,{method:editingId?'PUT':'POST',body:JSON.stringify(payload())});showMessage(${JSON.stringify(copy.saved)},false);closeEditor();await refresh();}catch(error){showMessage(error?.message||${JSON.stringify(copy.error)},true);}finally{saveButton.disabled=false;saveButton.textContent=${JSON.stringify(copy.save)};}});
          deleteButton?.addEventListener('click',async()=>{if(!editingId||!window.confirm(${JSON.stringify(copy.deleteConfirm)}))return;deleteButton.disabled=true;try{await api('/api/projects?id='+encodeURIComponent(editingId),{method:'DELETE'});showMessage(${JSON.stringify(copy.deleted)},false);closeEditor();await refresh();}catch(error){showMessage(error?.message||${JSON.stringify(copy.error)},true);}finally{deleteButton.disabled=false;}});
          document.addEventListener('keydown',event=>{if(event.key==='Escape'&&dialog.classList.contains('is-open'))closeEditor();});
          void refresh();
        };
        window.setTimeout(start,0);
      })();
    </script>
  `;
}
