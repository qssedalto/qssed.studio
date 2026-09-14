export function workbenchContent(zh) {
  const copy = zh ? {
    eyebrow: "工作区 · Workbench",
    title: "工作台",
    intro: "把进行中的项目、今天和逾期任务、最近草稿与最近研究笔记放到一个真正的工作入口。这里不保存第二份数据，只显示各模块的当前状态。",
    refresh: "刷新",
    loading: "正在整理工作区…",
    unavailable: "工作台暂时不可用",
    activeProjects: "进行中的项目",
    activeProjectsIntro: "当前正在推进的项目与下一步行动。",
    tasks: "今天与逾期任务",
    tasksIntro: "优先处理已经逾期或今天到期的事项。",
    drafts: "最近草稿",
    draftsIntro: "按最近编辑时间排列。",
    notes: "最近笔记",
    notesIntro: "最近更新的研究笔记。",
    projectsCount: "进行中项目",
    openTasks: "未完成任务",
    draftsCount: "草稿",
    notesCount: "笔记",
    viewAll: "查看全部",
    noProjects: "没有进行中的项目",
    noProjectsDetail: "把项目状态设为“进行中”后会出现在这里。",
    noTasks: "今天没有到期或逾期任务",
    noTasksDetail: "其他未完成任务仍可在任务中心查看。",
    noDrafts: "还没有草稿",
    noDraftsDetail: "新建草稿后，最近编辑内容会显示在这里。",
    noNotes: "还没有研究笔记",
    noNotesDetail: "最近更新的笔记会显示在这里。",
    next: "下一步",
    high: "高优先级",
    normal: "普通",
    low: "低",
    overdue: "逾期",
    today: "今天",
    noProject: "无项目",
    updated: "更新",
    privateLabel: "当前账号工作区"
  } : {
    eyebrow: "Workspace · Workbench",
    title: "Workbench",
    intro: "Bring active projects, today's and overdue tasks, recent drafts, and recent research notes into one real working surface. Workbench stores no second copy; it reflects the current state of each module.",
    refresh: "Refresh",
    loading: "Organizing your workspace…",
    unavailable: "Workbench is temporarily unavailable",
    activeProjects: "Active Projects",
    activeProjectsIntro: "Projects currently moving forward and their next actions.",
    tasks: "Today & Overdue Tasks",
    tasksIntro: "Prioritize items already overdue or due today.",
    drafts: "Recent Drafts",
    draftsIntro: "Sorted by the most recent edit.",
    notes: "Recent Notes",
    notesIntro: "Recently updated research notes.",
    projectsCount: "active projects",
    openTasks: "open tasks",
    draftsCount: "drafts",
    notesCount: "notes",
    viewAll: "View all",
    noProjects: "No active projects",
    noProjectsDetail: "Projects with Active status will appear here.",
    noTasks: "Nothing due today or overdue",
    noTasksDetail: "Other open tasks are still available in Task Center.",
    noDrafts: "No drafts yet",
    noDraftsDetail: "Recently edited drafts will appear here after you create one.",
    noNotes: "No research notes yet",
    noNotesDetail: "Recently updated notes will appear here.",
    next: "Next",
    high: "High priority",
    normal: "Normal",
    low: "Low",
    overdue: "Overdue",
    today: "Today",
    noProject: "No project",
    updated: "Updated",
    privateLabel: "Current account workspace"
  };

  return `
    <section class="workbench" data-workbench>
      <div class="workbench-hero">
        <div><span>${copy.eyebrow}</span><h2>${copy.title}</h2><p>${copy.intro}</p></div>
        <div class="workbench-hero-actions"><span>${copy.privateLabel}</span><button id="workbench-refresh" type="button">↻ ${copy.refresh}</button></div>
      </div>

      <div class="workbench-stats">
        <a data-workbench-prefix href="/workspace/projects"><strong id="workbench-project-count">—</strong><span>${copy.projectsCount}</span></a>
        <a data-workbench-prefix href="/workspace/tasks"><strong id="workbench-task-count">—</strong><span>${copy.openTasks}</span></a>
        <a data-workbench-prefix href="/workspace/drafts"><strong id="workbench-draft-count">—</strong><span>${copy.draftsCount}</span></a>
        <a data-workbench-prefix href="/info/notes"><strong id="workbench-note-count">—</strong><span>${copy.notesCount}</span></a>
      </div>

      <div id="workbench-message" class="workbench-message">${copy.loading}</div>

      <div class="workbench-grid">
        <section class="workbench-panel workbench-project-panel">
          <header><div><span>${copy.activeProjects}</span><p>${copy.activeProjectsIntro}</p></div><a data-workbench-prefix href="/workspace/projects">${copy.viewAll} →</a></header>
          <div id="workbench-projects" class="workbench-items"></div>
          <div id="workbench-projects-empty" class="workbench-empty" hidden><strong>${copy.noProjects}</strong><span>${copy.noProjectsDetail}</span></div>
        </section>

        <section class="workbench-panel workbench-task-panel">
          <header><div><span>${copy.tasks}</span><p>${copy.tasksIntro}</p></div><a data-workbench-prefix href="/workspace/tasks">${copy.viewAll} →</a></header>
          <div id="workbench-tasks" class="workbench-items"></div>
          <div id="workbench-tasks-empty" class="workbench-empty" hidden><strong>${copy.noTasks}</strong><span>${copy.noTasksDetail}</span></div>
        </section>

        <section class="workbench-panel">
          <header><div><span>${copy.drafts}</span><p>${copy.draftsIntro}</p></div><a data-workbench-prefix href="/workspace/drafts">${copy.viewAll} →</a></header>
          <div id="workbench-drafts" class="workbench-items"></div>
          <div id="workbench-drafts-empty" class="workbench-empty" hidden><strong>${copy.noDrafts}</strong><span>${copy.noDraftsDetail}</span></div>
        </section>

        <section class="workbench-panel">
          <header><div><span>${copy.notes}</span><p>${copy.notesIntro}</p></div><a data-workbench-prefix href="/info/notes">${copy.viewAll} →</a></header>
          <div id="workbench-notes" class="workbench-items"></div>
          <div id="workbench-notes-empty" class="workbench-empty" hidden><strong>${copy.noNotes}</strong><span>${copy.noNotesDetail}</span></div>
        </section>
      </div>
    </section>

    <style>
      .workbench{display:grid;gap:14px;min-width:0}.workbench-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:22px;padding:23px;border:1px solid var(--border);border-radius:21px;background:var(--card)}.workbench-hero>div:first-child>span{display:block;color:var(--muted);font-size:11px;font-weight:700}.workbench-hero h2{margin:5px 0 7px;font-size:29px;letter-spacing:-.042em}.workbench-hero p{max-width:800px;margin:0;color:var(--muted);font-size:13px;line-height:1.58}.workbench-hero-actions{display:flex;align-items:center;gap:8px}.workbench-hero-actions>span{padding:6px 9px;border-radius:999px;background:var(--fill);color:var(--muted);font-size:9px;white-space:nowrap}.workbench-hero-actions button{width:auto!important;min-height:38px!important;margin:0!important;padding:0 12px!important;border:0!important;border-radius:11px!important;background:var(--fill)!important;color:var(--text)!important;box-shadow:none!important;font-size:11px!important;font-weight:650!important}.workbench-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.workbench-stats a{display:grid;gap:2px;padding:14px 16px;border:1px solid var(--border);border-radius:15px;background:var(--card);color:var(--text);text-decoration:none}.workbench-stats strong{font-size:23px;letter-spacing:-.04em}.workbench-stats span{color:var(--muted);font-size:10px}.workbench-message{padding:10px 12px;border-radius:11px;background:var(--fill);color:var(--muted);font-size:11px}.workbench-message.is-error{background:color-mix(in srgb,var(--danger) 9%,var(--fill));color:var(--danger)}.workbench-message[hidden]{display:none}
      .workbench-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.workbench-panel{min-width:0;padding:16px;border:1px solid var(--border);border-radius:18px;background:var(--card)}.workbench-panel>header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}.workbench-panel>header span{font-size:14px;font-weight:700}.workbench-panel>header p{margin:4px 0 0;color:var(--muted);font-size:10px;line-height:1.45}.workbench-panel>header a{flex:0 0 auto;color:var(--primary);font-size:10px;text-decoration:none}.workbench-items{display:grid;gap:6px}.workbench-item{display:block;padding:11px 12px;border-radius:12px;background:var(--fill);color:var(--text);text-decoration:none}.workbench-item-top{display:flex;align-items:center;justify-content:space-between;gap:10px}.workbench-item strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}.workbench-badge{flex:0 0 auto;padding:3px 6px;border-radius:999px;background:var(--surface);color:var(--muted);font-size:8px;font-weight:700}.workbench-badge.is-danger{background:color-mix(in srgb,var(--danger) 10%,var(--fill));color:var(--danger)}.workbench-badge.is-primary{background:color-mix(in srgb,var(--primary) 10%,var(--fill));color:var(--primary)}.workbench-item p{display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;margin:6px 0 0;color:var(--muted);font-size:10px;line-height:1.45}.workbench-item-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px;color:var(--quiet);font-size:8px}.workbench-item-meta span:not(:last-child)::after{content:'·';margin-left:6px}.workbench-empty{display:grid;gap:4px;min-height:90px;place-content:center;padding:16px;border-radius:12px;background:var(--fill);text-align:center}.workbench-empty strong{font-size:11px}.workbench-empty span{color:var(--muted);font-size:9px;line-height:1.4}.workbench-empty[hidden]{display:none}
      @media(max-width:900px){.workbench-grid{grid-template-columns:1fr}.workbench-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:620px){.workbench-hero{display:grid;padding:18px}.workbench-hero-actions{justify-content:space-between}.workbench-stats{grid-template-columns:1fr 1fr}.workbench-panel{padding:13px}}
    </style>

    <script>
      (()=>{
        const start=()=>{
          const root=document.querySelector('[data-workbench]');if(!root)return;
          const prefix=location.pathname.startsWith('/zh-cn/')?'/zh-cn':location.pathname.startsWith('/en/')?'/en':'';
          document.querySelectorAll('[data-workbench-prefix]').forEach(link=>{const raw=link.getAttribute('href')||'';link.setAttribute('href',prefix+raw);});
          const message=document.getElementById('workbench-message');
          async function api(){const response=await fetch('/api/workbench/overview',{credentials:'same-origin',headers:{Accept:'application/json'},cache:'no-store'});const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload?.error||${JSON.stringify(copy.unavailable)});return payload;}
          function setMessage(text,error=false){message.hidden=!text;message.textContent=text||'';message.classList.toggle('is-error',error);}
          function dayKey(value){const date=value instanceof Date?value:new Date(value);if(Number.isNaN(date.getTime()))return '';return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');}
          function taskBucket(task){if(!task.due_at)return '';const due=new Date(task.due_at);if(Number.isNaN(due.getTime()))return '';const today=dayKey(new Date());const dueDay=dayKey(due);if(dueDay===today)return 'today';return due.getTime()<Date.now()?'overdue':'';}
          function formatTime(value){const date=new Date(value);return Number.isNaN(date.getTime())?'':date.toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});}
          function itemLink(path){return prefix+path;}
          function emptyState(id,empty){document.getElementById(id).hidden=!empty;}
          function renderProjects(items){const target=document.getElementById('workbench-projects');target.replaceChildren();const list=Array.isArray(items)?items:[];emptyState('workbench-projects-empty',!list.length);list.forEach(project=>{const card=document.createElement('a');card.className='workbench-item';card.href=itemLink('/workspace/projects');const top=document.createElement('div');top.className='workbench-item-top';const title=document.createElement('strong');title.textContent=project.name||'—';const badge=document.createElement('span');badge.className='workbench-badge'+(project.priority==='high'?' is-danger':'');badge.textContent=project.priority==='high'?${JSON.stringify(copy.high)}:project.priority==='low'?${JSON.stringify(copy.low)}:${JSON.stringify(copy.normal)};top.append(title,badge);card.append(top);if(project.summary){const p=document.createElement('p');p.textContent=project.summary;card.append(p);}const meta=document.createElement('div');meta.className='workbench-item-meta';if(project.next_action){const next=document.createElement('span');next.textContent=${JSON.stringify(copy.next)}+' · '+project.next_action;meta.append(next);}const time=document.createElement('span');time.textContent=${JSON.stringify(copy.updated)}+' '+formatTime(project.updated_at);meta.append(time);card.append(meta);target.append(card);});}
          function renderTasks(items){const target=document.getElementById('workbench-tasks');target.replaceChildren();const relevant=(Array.isArray(items)?items:[]).map(task=>({...task,bucket:taskBucket(task)})).filter(task=>task.bucket).sort((a,b)=>{if(a.bucket!==b.bucket)return a.bucket==='overdue'?-1:1;return String(a.due_at||'').localeCompare(String(b.due_at||''));}).slice(0,10);emptyState('workbench-tasks-empty',!relevant.length);relevant.forEach(task=>{const card=document.createElement('a');card.className='workbench-item';card.href=itemLink('/workspace/tasks');const top=document.createElement('div');top.className='workbench-item-top';const title=document.createElement('strong');title.textContent=task.title||'—';const badge=document.createElement('span');badge.className='workbench-badge '+(task.bucket==='overdue'?'is-danger':'is-primary');badge.textContent=task.bucket==='overdue'?${JSON.stringify(copy.overdue)}:${JSON.stringify(copy.today)};top.append(title,badge);card.append(top);if(task.description){const p=document.createElement('p');p.textContent=task.description;card.append(p);}const meta=document.createElement('div');meta.className='workbench-item-meta';const project=document.createElement('span');project.textContent=task.project_name||${JSON.stringify(copy.noProject)};const due=document.createElement('span');due.textContent=formatTime(task.due_at);meta.append(project,due);card.append(meta);target.append(card);});}
          function renderDrafts(items){const target=document.getElementById('workbench-drafts');target.replaceChildren();const list=Array.isArray(items)?items:[];emptyState('workbench-drafts-empty',!list.length);list.forEach(draft=>{const card=document.createElement('a');card.className='workbench-item';card.href=itemLink('/workspace/drafts');const top=document.createElement('div');top.className='workbench-item-top';const title=document.createElement('strong');title.textContent=draft.title||${JSON.stringify(zh?'未命名草稿':'Untitled draft')};top.append(title);card.append(top);if(draft.preview){const p=document.createElement('p');p.textContent=draft.preview;card.append(p);}const meta=document.createElement('div');meta.className='workbench-item-meta';const project=document.createElement('span');project.textContent=draft.project_name||${JSON.stringify(copy.noProject)};const time=document.createElement('span');time.textContent=formatTime(draft.updated_at);meta.append(project,time);card.append(meta);target.append(card);});}
          function renderNotes(items){const target=document.getElementById('workbench-notes');target.replaceChildren();const list=Array.isArray(items)?items:[];emptyState('workbench-notes-empty',!list.length);list.forEach(note=>{const card=document.createElement('a');card.className='workbench-item';card.href=itemLink('/info/notes');const top=document.createElement('div');top.className='workbench-item-top';const title=document.createElement('strong');title.textContent=note.title||${JSON.stringify(zh?'未命名笔记':'Untitled note')};top.append(title);card.append(top);const meta=document.createElement('div');meta.className='workbench-item-meta';const time=document.createElement('span');time.textContent=${JSON.stringify(copy.updated)}+' '+formatTime(note.updated_at);meta.append(time);card.append(meta);target.append(card);});}
          async function load(){setMessage(${JSON.stringify(copy.loading)},false);try{const data=await api();const counts=data?.counts||{};document.getElementById('workbench-project-count').textContent=String(counts.active_projects||0);document.getElementById('workbench-task-count').textContent=String(counts.open_tasks||0);document.getElementById('workbench-draft-count').textContent=String(counts.drafts||0);document.getElementById('workbench-note-count').textContent=String(counts.notes||0);renderProjects(data.projects);renderTasks(data.tasks);renderDrafts(data.drafts);renderNotes(data.notes);setMessage('',false);}catch(error){setMessage(error?.message||${JSON.stringify(copy.unavailable)},true);}}
          document.getElementById('workbench-refresh').addEventListener('click',()=>void load());void load();
        };window.setTimeout(start,0);
      })();
    </script>
  `;
}
