export function tasksWorkspaceContent(zh) {
  const copy = zh ? {
    eyebrow: "工作区 · 任务",
    title: "任务中心",
    intro: "把任务直接关联到项目，集中管理待办、进行中、完成状态、优先级和截止时间。",
    create: "新建任务",
    search: "搜索任务…",
    all: "全部",
    todo: "待办",
    inProgress: "进行中",
    done: "已完成",
    total: "任务",
    today: "今天到期",
    overdue: "已逾期",
    doneCount: "已完成",
    allProjects: "全部项目",
    noProject: "无项目",
    projectUnavailable: "项目不可用",
    loading: "正在读取任务…",
    empty: "还没有任务",
    emptyDetail: "创建第一条任务，并按需要关联到一个项目。",
    noMatch: "没有匹配的任务",
    noMatchDetail: "换一个关键词、状态或项目筛选。",
    edit: "编辑",
    complete: "完成",
    reopen: "重新打开",
    due: "截止",
    project: "项目",
    priority: "优先级",
    low: "低",
    normal: "普通",
    high: "高",
    modalCreate: "新建任务",
    modalEdit: "编辑任务",
    titleLabel: "任务名称",
    titlePlaceholder: "例如：完成任务中心第一版",
    description: "说明",
    descriptionPlaceholder: "补充任务背景、验收条件或需要注意的内容",
    status: "状态",
    dueAt: "截止时间",
    save: "保存任务",
    saving: "正在保存…",
    cancel: "取消",
    delete: "删除任务",
    deleteConfirm: "确定删除这条任务吗？此操作不可撤销。",
    error: "任务服务暂时不可用",
    saved: "任务已保存",
    deleted: "任务已删除",
    privateLabel: "当前账号私人任务",
    overdueLabel: "逾期",
    todayLabel: "今天"
  } : {
    eyebrow: "Workspace · Tasks",
    title: "Task Center",
    intro: "Attach tasks directly to projects and manage todo, in-progress, and completed work with priority and due dates.",
    create: "New Task",
    search: "Search tasks…",
    all: "All",
    todo: "Todo",
    inProgress: "In Progress",
    done: "Done",
    total: "tasks",
    today: "due today",
    overdue: "overdue",
    doneCount: "done",
    allProjects: "All Projects",
    noProject: "No Project",
    projectUnavailable: "Project unavailable",
    loading: "Loading tasks…",
    empty: "No tasks yet",
    emptyDetail: "Create your first task and attach it to a project when useful.",
    noMatch: "No matching tasks",
    noMatchDetail: "Try another keyword, status, or project filter.",
    edit: "Edit",
    complete: "Complete",
    reopen: "Reopen",
    due: "Due",
    project: "Project",
    priority: "Priority",
    low: "Low",
    normal: "Normal",
    high: "High",
    modalCreate: "New Task",
    modalEdit: "Edit Task",
    titleLabel: "Task title",
    titlePlaceholder: "For example: Finish the first Task Center version",
    description: "Description",
    descriptionPlaceholder: "Add context, acceptance criteria, or anything worth keeping with the task",
    status: "Status",
    dueAt: "Due date",
    save: "Save Task",
    saving: "Saving…",
    cancel: "Cancel",
    delete: "Delete Task",
    deleteConfirm: "Delete this task? This cannot be undone.",
    error: "Task service is temporarily unavailable",
    saved: "Task saved",
    deleted: "Task deleted",
    privateLabel: "Private to current account",
    overdueLabel: "Overdue",
    todayLabel: "Today"
  };

  return `
    <section class="tasks-workspace" data-tasks-workspace>
      <div class="tasks-hero">
        <div class="tasks-hero-copy"><span>${copy.eyebrow}</span><h2>${copy.title}</h2><p>${copy.intro}</p></div>
        <button id="tasks-create" class="tasks-primary" type="button">＋ ${copy.create}</button>
      </div>

      <div class="tasks-overview">
        <div class="tasks-stats">
          <div><strong id="tasks-total">0</strong><span>${copy.total}</span></div>
          <div><strong id="tasks-today-count">0</strong><span>${copy.today}</span></div>
          <div><strong id="tasks-overdue-count">0</strong><span>${copy.overdue}</span></div>
          <div><strong id="tasks-done-count">0</strong><span>${copy.doneCount}</span></div>
        </div>
        <span class="tasks-private-note">${copy.privateLabel}</span>
      </div>

      <div class="tasks-filter-panel">
        <div class="tasks-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path></svg><input id="tasks-search" type="search" autocomplete="off" spellcheck="false" placeholder="${copy.search}" aria-label="${copy.search}"></div>
        <div class="tasks-filter-row">
          <div class="tasks-status-filters" role="tablist">
            <button class="is-active" data-task-status="all" type="button">${copy.all}<b data-task-count="all">0</b></button>
            <button data-task-status="todo" type="button">${copy.todo}<b data-task-count="todo">0</b></button>
            <button data-task-status="in_progress" type="button">${copy.inProgress}<b data-task-count="in_progress">0</b></button>
            <button data-task-status="done" type="button">${copy.done}<b data-task-count="done">0</b></button>
          </div>
          <label class="tasks-project-filter"><span>${copy.project}</span><select id="tasks-project-filter"><option value="all">${copy.allProjects}</option><option value="none">${copy.noProject}</option></select></label>
        </div>
      </div>

      <div id="tasks-message" class="tasks-message" hidden></div>
      <div id="tasks-list" class="tasks-list"></div>
      <div id="tasks-empty" class="tasks-empty"><div class="tasks-empty-icon">✓</div><strong>${copy.loading}</strong><span>${copy.emptyDetail}</span></div>
    </section>

    <div id="task-dialog" class="task-dialog" aria-hidden="true">
      <button class="task-dialog-backdrop" type="button" data-task-close aria-label="${copy.cancel}"></button>
      <section class="task-editor" role="dialog" aria-modal="true" aria-labelledby="task-dialog-title">
        <div class="task-editor-head"><div><span>${copy.eyebrow}</span><h2 id="task-dialog-title">${copy.modalCreate}</h2></div><button class="task-close" type="button" data-task-close aria-label="${copy.cancel}">×</button></div>
        <form id="task-form">
          <label class="task-field"><span>${copy.titleLabel}</span><input id="task-title" maxlength="180" required placeholder="${copy.titlePlaceholder}"></label>
          <label class="task-field"><span>${copy.description}</span><textarea id="task-description" rows="5" maxlength="2400" placeholder="${copy.descriptionPlaceholder}"></textarea></label>
          <div class="task-form-grid">
            <label class="task-field"><span>${copy.project}</span><select id="task-project"><option value="">${copy.noProject}</option></select></label>
            <label class="task-field"><span>${copy.status}</span><select id="task-status"><option value="todo">${copy.todo}</option><option value="in_progress">${copy.inProgress}</option><option value="done">${copy.done}</option></select></label>
          </div>
          <div class="task-form-grid">
            <label class="task-field"><span>${copy.priority}</span><select id="task-priority"><option value="low">${copy.low}</option><option value="normal" selected>${copy.normal}</option><option value="high">${copy.high}</option></select></label>
            <label class="task-field"><span>${copy.dueAt}</span><input id="task-due" type="datetime-local"></label>
          </div>
          <div class="task-editor-actions"><button id="task-delete" class="task-danger" type="button" hidden>${copy.delete}</button><div><button class="task-secondary" type="button" data-task-close>${copy.cancel}</button><button id="task-save" class="tasks-primary" type="submit">${copy.save}</button></div></div>
        </form>
      </section>
    </div>

    <style>
      .tasks-workspace{display:grid;gap:14px;min-width:0}.tasks-hero,.tasks-overview,.tasks-filter-panel,.tasks-empty{border:1px solid var(--border);background:var(--card)}
      .tasks-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;padding:23px;border-radius:21px}.tasks-hero-copy>span,.task-editor-head span{display:block;color:var(--muted);font-size:11px;font-weight:700}.tasks-hero-copy h2{margin:5px 0 7px;font-size:29px;letter-spacing:-.042em}.tasks-hero-copy p{max-width:760px;margin:0;color:var(--muted);font-size:13px;line-height:1.58}.tasks-primary,.task-secondary,.task-danger,.task-close,.task-action{width:auto!important;margin:0!important;border:0!important;box-shadow:none!important}.tasks-primary{min-height:42px!important;padding:0 15px!important;border-radius:12px!important;background:var(--primary)!important;color:white!important;font-size:13px!important;font-weight:700!important;white-space:nowrap}
      .tasks-overview{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:15px 18px;border-radius:17px}.tasks-stats{display:flex;gap:26px;flex-wrap:wrap}.tasks-stats div{display:grid;gap:2px}.tasks-stats strong{font-size:22px;letter-spacing:-.035em}.tasks-stats span,.tasks-private-note{color:var(--muted);font-size:10px}.tasks-private-note{padding:6px 9px;border-radius:999px;background:var(--fill)}
      .tasks-filter-panel{display:grid;gap:9px;padding:10px;border-radius:17px}.tasks-search{display:flex;align-items:center;gap:10px;min-height:46px;padding:0 12px;border-radius:12px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border)}.tasks-search:focus-within{box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 13%,transparent),inset 0 0 0 1px var(--primary)}.tasks-search svg{width:17px;height:17px;fill:none;stroke:var(--muted);stroke-width:1.8;stroke-linecap:round}.tasks-search input{width:100%;height:44px;min-height:0;margin:0;padding:0;border:0!important;background:transparent!important;box-shadow:none!important}.tasks-filter-row{display:flex;align-items:end;justify-content:space-between;gap:10px}.tasks-status-filters{display:flex;gap:5px;overflow:auto;scrollbar-width:none}.tasks-status-filters::-webkit-scrollbar{display:none}.tasks-status-filters button{display:inline-flex;align-items:center;gap:6px;width:auto!important;min-width:max-content!important;min-height:34px!important;margin:0!important;padding:0 10px!important;border:0!important;border-radius:9px!important;background:transparent!important;color:var(--muted)!important;box-shadow:none!important;font-size:11px!important;font-weight:650!important}.tasks-status-filters button:hover,.tasks-status-filters button.is-active{background:var(--fill)!important;color:var(--text)!important}.tasks-status-filters b{display:grid;place-items:center;min-width:19px;height:19px;padding:0 5px;border-radius:999px;background:var(--surface);color:var(--quiet);font-size:9px}.tasks-project-filter{display:grid;gap:4px;min-width:210px;color:var(--muted);font-size:10px}.tasks-project-filter select{height:34px;min-height:34px;margin:0;padding:0 30px 0 10px;border:0;border-radius:9px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border);font-size:11px}
      .tasks-message{padding:10px 12px;border-radius:11px;background:var(--fill);color:var(--muted);font-size:11px}.tasks-message.is-error{background:color-mix(in srgb,var(--danger) 9%,var(--fill));color:var(--danger)}.tasks-list{display:grid;gap:8px}.task-card{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:13px;align-items:start;padding:16px 17px;border:1px solid var(--border);border-radius:17px;background:var(--card)}.task-state-dot{width:24px;height:24px;margin-top:1px;border:1px solid var(--border);border-radius:999px;background:var(--fill)}.task-state-dot.is-done{display:grid;place-items:center;background:color-mix(in srgb,var(--primary) 12%,var(--fill));color:var(--primary);font-size:12px}.task-card-main{min-width:0}.task-card-head{display:flex;align-items:center;gap:7px;min-width:0}.task-card-head h3{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0;font-size:14px}.task-chip{padding:3px 7px;border-radius:999px;background:var(--fill);color:var(--muted);font-size:9px;font-weight:720}.task-chip.is-high,.task-due.is-overdue{background:color-mix(in srgb,var(--danger) 10%,var(--fill));color:var(--danger)}.task-chip.is-progress{background:color-mix(in srgb,var(--primary) 10%,var(--fill));color:var(--primary)}.task-card-description{display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;margin:7px 0 0;color:var(--muted);font-size:11px;line-height:1.5}.task-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}.task-meta span{padding:4px 7px;border-radius:8px;background:var(--fill);color:var(--muted);font-size:9px}.task-due.is-today{color:var(--primary)}.task-card.is-done h3{text-decoration:line-through;color:var(--muted)}.task-card-actions{display:flex;gap:6px}.task-action{min-height:32px!important;padding:0 9px!important;border-radius:9px!important;background:var(--fill)!important;color:var(--text)!important;font-size:10px!important;font-weight:650!important}
      .tasks-empty{display:grid;place-items:center;gap:6px;min-height:210px;padding:34px;border-radius:18px;text-align:center}.tasks-empty[hidden]{display:none}.tasks-empty-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:var(--fill);color:var(--muted);font-size:20px}.tasks-empty strong{font-size:14px}.tasks-empty span{max-width:520px;color:var(--muted);font-size:11px;line-height:1.5}
      .task-dialog{position:fixed;inset:0;z-index:140;display:none;place-items:center;padding:22px}.task-dialog.is-open{display:grid}.task-dialog-backdrop{position:absolute;inset:0;width:100%!important;height:100%!important;margin:0!important;border:0!important;border-radius:0!important;background:rgba(0,0,0,.34)!important;backdrop-filter:blur(8px)}.task-editor{position:relative;width:min(720px,calc(100vw - 32px));max-height:min(820px,calc(100vh - 38px));overflow:auto;padding:20px;border:1px solid var(--border);border-radius:21px;background:var(--surface);box-shadow:0 24px 70px rgba(0,0,0,.18)}.task-editor-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.task-editor-head h2{margin:4px 0 0;font-size:22px}.task-close{min-width:34px!important;height:34px!important;padding:0!important;border-radius:10px!important;background:var(--fill)!important;color:var(--text)!important;font-size:20px!important}.task-field{display:grid;gap:6px;margin-top:13px}.task-field>span{color:var(--muted);font-size:11px;font-weight:650}.task-field input,.task-field textarea,.task-field select{width:100%;margin:0;border:0;border-radius:11px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border)}.task-field textarea{padding:11px 12px;resize:vertical;line-height:1.5}.task-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.task-editor-actions{display:flex;justify-content:space-between;gap:12px;margin-top:18px;padding-top:15px;border-top:1px solid var(--hairline)}.task-editor-actions>div{display:flex;gap:7px;margin-left:auto}.task-secondary,.task-danger{min-height:40px!important;padding:0 13px!important;border-radius:11px!important;font-size:12px!important;font-weight:650!important}.task-secondary{background:var(--fill)!important;color:var(--text)!important}.task-danger{background:color-mix(in srgb,var(--danger) 10%,var(--fill))!important;color:var(--danger)!important}
      @media(max-width:760px){.tasks-hero{display:grid;padding:18px}.tasks-primary{justify-self:start}.tasks-overview{align-items:flex-start;flex-direction:column}.tasks-filter-row{align-items:stretch;flex-direction:column}.tasks-project-filter{min-width:0}.task-card{grid-template-columns:auto minmax(0,1fr)}.task-card-actions{grid-column:2;justify-content:flex-start}.task-form-grid{grid-template-columns:1fr}.task-editor-actions{align-items:stretch;flex-direction:column}.task-editor-actions>div{margin-left:0}.task-editor-actions button{flex:1}}
    </style>

    <script>
      (()=>{
        const start=()=>{
          const root=document.querySelector('[data-tasks-workspace]');
          if(!root)return;
          const list=document.getElementById('tasks-list');
          const empty=document.getElementById('tasks-empty');
          const message=document.getElementById('tasks-message');
          const dialog=document.getElementById('task-dialog');
          const form=document.getElementById('task-form');
          const search=document.getElementById('tasks-search');
          const projectFilter=document.getElementById('tasks-project-filter');
          const projectField=document.getElementById('task-project');
          let tasks=[];
          let projects=[];
          let editingId='';
          let activeStatus='all';

          const statusLabels={todo:${JSON.stringify(copy.todo)},in_progress:${JSON.stringify(copy.inProgress)},done:${JSON.stringify(copy.done)}};
          const priorityLabels={low:${JSON.stringify(copy.low)},normal:${JSON.stringify(copy.normal)},high:${JSON.stringify(copy.high)}};
          const projectMap=()=>new Map(projects.map(item=>[item.id,item]));
          function showMessage(text,error){message.hidden=!text;message.textContent=text||'';message.classList.toggle('is-error',Boolean(error));}
          async function api(path,options={}){const response=await fetch(path,{...options,credentials:'same-origin',headers:{Accept:'application/json',...(options.body?{'Content-Type':'application/json;charset=UTF-8'}:{}),...(options.headers||{})},cache:'no-store'});const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload?.error||${JSON.stringify(copy.error)});return payload;}
          function dayKey(value){const date=value instanceof Date?value:new Date(value);if(Number.isNaN(date.getTime()))return '';return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');}
          function isToday(task){return task.status!=='done'&&task.due_at&&dayKey(task.due_at)===dayKey(new Date());}
          function isOverdue(task){if(task.status==='done'||!task.due_at)return false;const due=new Date(task.due_at);return !Number.isNaN(due.getTime())&&due.getTime()<Date.now()&&!isToday(task);}
          function projectName(id){if(!id)return ${JSON.stringify(copy.noProject)};return projectMap().get(id)?.name||${JSON.stringify(copy.projectUnavailable)};}
          function formatDue(task){if(!task.due_at)return '';const date=new Date(task.due_at);if(Number.isNaN(date.getTime()))return '';return date.toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});}
          function toLocalInput(value){if(!value)return '';const date=new Date(value);if(Number.isNaN(date.getTime()))return '';const offset=date.getTimezoneOffset()*60000;return new Date(date.getTime()-offset).toISOString().slice(0,16);}
          function updateProjectOptions(){
            const currentFilter=projectFilter.value||'all';const currentField=projectField.value||'';
            projectFilter.replaceChildren(new Option(${JSON.stringify(copy.allProjects)},'all'),new Option(${JSON.stringify(copy.noProject)},'none'));
            projectField.replaceChildren(new Option(${JSON.stringify(copy.noProject)},''));
            projects.filter(item=>item.status!=='archived').forEach(project=>{projectFilter.add(new Option(project.name,project.id));projectField.add(new Option(project.name,project.id));});
            if([...projectFilter.options].some(option=>option.value===currentFilter))projectFilter.value=currentFilter;
            if([...projectField.options].some(option=>option.value===currentField))projectField.value=currentField;
          }
          function visibleTasks(){const query=search.value.trim().toLocaleLowerCase();const projectValue=projectFilter.value;return tasks.filter(task=>{if(activeStatus!=='all'&&task.status!==activeStatus)return false;if(projectValue==='none'&&task.project_id)return false;if(projectValue!=='all'&&projectValue!=='none'&&task.project_id!==projectValue)return false;if(!query)return true;const text=[task.title,task.description,projectName(task.project_id),priorityLabels[task.priority],statusLabels[task.status]].join(' ').toLocaleLowerCase();return text.includes(query);});}
          function updateStats(){
            const counts={all:tasks.length,todo:0,in_progress:0,done:0};tasks.forEach(task=>{counts[task.status]=(counts[task.status]||0)+1;});
            document.getElementById('tasks-total').textContent=String(tasks.length);document.getElementById('tasks-today-count').textContent=String(tasks.filter(isToday).length);document.getElementById('tasks-overdue-count').textContent=String(tasks.filter(isOverdue).length);document.getElementById('tasks-done-count').textContent=String(counts.done||0);
            document.querySelectorAll('[data-task-count]').forEach(node=>{node.textContent=String(counts[node.dataset.taskCount]||0);});
          }
          function render(){
            updateStats();const visible=visibleTasks();list.replaceChildren();empty.hidden=visible.length>0;
            if(!visible.length){empty.querySelector('strong').textContent=tasks.length?${JSON.stringify(copy.noMatch)}:${JSON.stringify(copy.empty)};empty.querySelector('span').textContent=tasks.length?${JSON.stringify(copy.noMatchDetail)}:${JSON.stringify(copy.emptyDetail)};return;}
            visible.forEach(task=>{
              const card=document.createElement('article');card.className='task-card'+(task.status==='done'?' is-done':'');
              const dot=document.createElement('div');dot.className='task-state-dot'+(task.status==='done'?' is-done':'');dot.textContent=task.status==='done'?'✓':'';
              const main=document.createElement('div');main.className='task-card-main';const head=document.createElement('div');head.className='task-card-head';
              const title=document.createElement('h3');title.textContent=task.title;const status=document.createElement('span');status.className='task-chip'+(task.status==='in_progress'?' is-progress':'');status.textContent=statusLabels[task.status]||task.status;const priority=document.createElement('span');priority.className='task-chip'+(task.priority==='high'?' is-high':'');priority.textContent=priorityLabels[task.priority]||task.priority;head.append(title,status,priority);main.append(head);
              if(task.description){const description=document.createElement('p');description.className='task-card-description';description.textContent=task.description;main.append(description);}
              const meta=document.createElement('div');meta.className='task-meta';if(task.project_id){const p=document.createElement('span');p.textContent=${JSON.stringify(copy.project)}+' · '+projectName(task.project_id);meta.append(p);}if(task.due_at){const due=document.createElement('span');due.className='task-due'+(isOverdue(task)?' is-overdue':isToday(task)?' is-today':'');due.textContent=(isOverdue(task)?${JSON.stringify(copy.overdueLabel)}+' · ':isToday(task)?${JSON.stringify(copy.todayLabel)}+' · ':${JSON.stringify(copy.due)}+' · ')+formatDue(task);meta.append(due);}main.append(meta);
              const actions=document.createElement('div');actions.className='task-card-actions';const toggle=document.createElement('button');toggle.type='button';toggle.className='task-action';toggle.textContent=task.status==='done'?${JSON.stringify(copy.reopen)}:${JSON.stringify(copy.complete)};toggle.addEventListener('click',()=>void toggleDone(task));const edit=document.createElement('button');edit.type='button';edit.className='task-action';edit.textContent=${JSON.stringify(copy.edit)};edit.addEventListener('click',()=>openDialog(task));actions.append(toggle,edit);card.append(dot,main,actions);list.append(card);
            });
          }
          function openDialog(task=null){editingId=task?.id||'';document.getElementById('task-dialog-title').textContent=task?${JSON.stringify(copy.modalEdit)}:${JSON.stringify(copy.modalCreate)};document.getElementById('task-title').value=task?.title||'';document.getElementById('task-description').value=task?.description||'';document.getElementById('task-project').value=task?.project_id&&[...projectField.options].some(option=>option.value===task.project_id)?task.project_id:'';document.getElementById('task-status').value=task?.status||'todo';document.getElementById('task-priority').value=task?.priority||'normal';document.getElementById('task-due').value=toLocalInput(task?.due_at||'');document.getElementById('task-delete').hidden=!task;dialog.classList.add('is-open');dialog.setAttribute('aria-hidden','false');document.getElementById('task-title').focus();}
          function closeDialog(){dialog.classList.remove('is-open');dialog.setAttribute('aria-hidden','true');editingId='';form.reset();document.getElementById('task-priority').value='normal';}
          function snapshot(){const due=document.getElementById('task-due').value;return {title:document.getElementById('task-title').value,description:document.getElementById('task-description').value,project_id:document.getElementById('task-project').value,status:document.getElementById('task-status').value,priority:document.getElementById('task-priority').value,due_at:due?new Date(due).toISOString():''};}
          async function load(){showMessage('',false);empty.hidden=false;empty.querySelector('strong').textContent=${JSON.stringify(copy.loading)};try{const [taskData,projectData]=await Promise.all([api('/api/tasks'),api('/api/projects')]);tasks=Array.isArray(taskData.tasks)?taskData.tasks:[];projects=Array.isArray(projectData.projects)?projectData.projects:[];updateProjectOptions();render();}catch(error){tasks=[];projects=[];updateProjectOptions();render();showMessage(error?.message||${JSON.stringify(copy.error)},true);}}
          async function toggleDone(task){try{const next={...task,status:task.status==='done'?'todo':'done'};delete next.id;delete next.owner_id;delete next.created_at;delete next.updated_at;delete next.completed_at;await api('/api/tasks?id='+encodeURIComponent(task.id),{method:'PUT',body:JSON.stringify(next)});await load();}catch(error){showMessage(error?.message||${JSON.stringify(copy.error)},true);}}
          form.addEventListener('submit',async event=>{event.preventDefault();const save=document.getElementById('task-save');save.disabled=true;save.textContent=${JSON.stringify(copy.saving)};try{const path='/api/tasks'+(editingId?'?id='+encodeURIComponent(editingId):'');await api(path,{method:editingId?'PUT':'POST',body:JSON.stringify(snapshot())});closeDialog();showMessage(${JSON.stringify(copy.saved)},false);await load();}catch(error){showMessage(error?.message||${JSON.stringify(copy.error)},true);}finally{save.disabled=false;save.textContent=${JSON.stringify(copy.save)};}});
          document.getElementById('task-delete').addEventListener('click',async()=>{if(!editingId||!window.confirm(${JSON.stringify(copy.deleteConfirm)}))return;try{await api('/api/tasks?id='+encodeURIComponent(editingId),{method:'DELETE'});closeDialog();showMessage(${JSON.stringify(copy.deleted)},false);await load();}catch(error){showMessage(error?.message||${JSON.stringify(copy.error)},true);}});
          document.getElementById('tasks-create').addEventListener('click',()=>openDialog());document.querySelectorAll('[data-task-close]').forEach(button=>button.addEventListener('click',closeDialog));search.addEventListener('input',render);projectFilter.addEventListener('change',render);document.querySelectorAll('[data-task-status]').forEach(button=>button.addEventListener('click',()=>{activeStatus=button.dataset.taskStatus||'all';document.querySelectorAll('[data-task-status]').forEach(item=>item.classList.toggle('is-active',item===button));render();}));document.addEventListener('keydown',event=>{if(event.key==='Escape'&&dialog.classList.contains('is-open'))closeDialog();});void load();
        };window.setTimeout(start,0);
      })();
    </script>
  `;
}
