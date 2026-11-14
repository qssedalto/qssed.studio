// Authenticated Work TeX explorer search, metadata and accessible filter popover.
// Search only requests projects owned by the current authenticated account.
export function enhanceWorkTexSearchFilter(markup, zh=true, ownerSlug="account") {
  const css = String.raw`
    /* Local font lookup only; never distribute a user-supplied font binary. */
    @font-face{font-family:"AERTEX Michelangelus";src:local("Michelangelus Italic"),local("Michelangelus-Italic");font-weight:400;font-style:normal;unicode-range:U+0000-024F}
    @font-face{font-family:"AERTEX Michelangelus";src:local("Michelangelus Bold Italic"),local("Michelangelus-BoldItalic");font-weight:700;font-style:normal;unicode-range:U+0000-024F}
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-document-list .tex-tree-file,
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-document-list .tex-tree-file span,
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-search,
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-search::placeholder,
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-search-results,
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-search-results * {
      font-family:"AERTEX Michelangelus","Segoe UI","Microsoft YaHei UI",sans-serif!important;
      font-style:normal!important;font-weight:400!important;
    }
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-document-list .tex-tree-folder>span:not(.tex-row-menu-trigger),
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-document-list>.tex-document-item>strong,
    body.os-shell:has(.tex-work-app) .tex-work-app .tex-panel-head>strong {
      font-family:"AERTEX Michelangelus","Segoe UI","Microsoft YaHei UI",sans-serif!important;
      font-weight:700!important;font-style:normal!important;
    }
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-document-list .tex-tree-file,
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-document-list .tex-tree-file.is-active,
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-document-list .tex-tree-file>span {
      font-weight:400!important;
    }
    /* Keep the selected row's pale blue fill but remove ONLY its blue left rail. */
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-document-list .tex-tree-file.is-active {
      box-shadow:none!important;border-left:0!important;
    }
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-document-list .tex-tree-file.is-active::after {
      border-left:0!important;box-shadow:none!important;
    }
    /* Main file outline strokes should be optically as strong as book/grid glyphs. */
    body.os-shell:has(.tex-work-app) .tex-work-app .tex-tree-document-icon {
      stroke-width:43!important;fill:none!important;
    }
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-project-home {
      background:var(--card)!important;color:var(--text)!important;
      border:1px solid var(--border)!important;
      box-shadow:none!important;
    }
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-project-home:hover {
      background:var(--fill)!important;filter:none!important;
    }
    :root[data-theme="dark"] body.os-shell:has(.tex-work-app) .tex-work-app .tex-documents-panel #tex-project-home {
      background:var(--card)!important;color:var(--text)!important;
      border:1px solid var(--border)!important;box-shadow:none!important;
    }
    /* Search input and filter share a single unobtrusive surface. */
    body.os-shell:has(.tex-work-app) .tex-work-app .tex-search {
      position:relative!important;display:flex!important;align-items:center!important;
      padding-right:5px!important;gap:8px!important;min-width:0!important;
    }
    body.os-shell:has(.tex-work-app) .tex-work-app .tex-search #tex-search {
      min-width:0!important;flex:1 1 auto!important;width:0!important;
    }
    .tex-work-app #tex-search-filter {
      flex:0 0 30px;display:grid;place-items:center;width:30px;height:30px;
      padding:0;border:0;border-radius:8px;background:transparent;color:var(--text);
      cursor:pointer;position:relative;
    }
    .tex-work-app #tex-search-filter:hover,.tex-work-app #tex-search-filter[aria-expanded="true"] {
      background:color-mix(in srgb,var(--text) 8%,transparent);
    }
    .tex-work-app #tex-search-filter svg {width:23px!important;height:23px!important;
      stroke:currentColor!important;fill:none!important;stroke-width:2.2!important;
      stroke-linecap:round!important}
    .tex-work-app #tex-search-filter[data-has-filter="true"]::after {
      content:"";position:absolute;width:5px;height:5px;border-radius:50%;
      background:var(--primary);right:2px;top:2px;
    }
    .tex-work-app #tex-document-list[hidden],.tex-work-app #tex-documents-empty[hidden],
    .tex-work-app #tex-search-results[hidden],#tex-search-filter-panel[hidden] {display:none!important}
    .tex-work-app #tex-search-results {
      display:block;min-height:0;flex:1 1 0;overflow-y:auto;overflow-x:hidden;
      padding:2px 9px 12px;scrollbar-width:thin;
    }
    .tex-work-app #tex-search-results .tex-found-group {
      margin:9px 4px 5px;font-size:11px;font-weight:600!important;font-style:normal!important;
      color:var(--muted);
    }
    .tex-work-app #tex-search-results .tex-found-entry {
      display:flex;gap:9px;width:100%;padding:9px 8px;border:0;border-radius:8px;
      background:transparent;color:var(--text);text-align:left;cursor:pointer;align-items:flex-start;
    }
    .tex-work-app #tex-search-results .tex-found-entry:hover,
    .tex-work-app #tex-search-results .tex-found-entry:focus-visible {
      background:var(--fill);outline:0;
    }
    .tex-work-app #tex-search-results .tex-found-entry svg {
      flex:0 0 19px;width:19px;height:20px;stroke:#7e858e;stroke-width:1.9;
      fill:none;stroke-linejoin:round;
    }
    .tex-work-app #tex-search-results .tex-found-content{min-width:0;display:grid;gap:3px;flex:1}
    .tex-work-app #tex-search-results .tex-found-name{font-size:13px;overflow-wrap:anywhere}
    .tex-work-app #tex-search-results .tex-found-path,
    .tex-work-app #tex-search-results .tex-found-detail{
      font-size:10px;color:var(--muted);white-space:normal;overflow-wrap:anywhere;
    }
    .tex-work-app .tex-tree-name-tooltip {white-space:pre-line!important}
    .tex-work-app #tex-search-results .tex-search-progress,
    .tex-work-app #tex-search-results .tex-search-none{
      padding:13px 12px;font-size:12px;color:var(--muted);line-height:1.55;
    }
    /* Flat, non-glass Apple-style grouped filter popover. */
    #tex-search-filter-panel {
      position:fixed;z-index:11000;box-sizing:border-box;
      width:min(365px,calc(100vw - 20px));max-height:min(74dvh,650px);
      overflow-y:auto;overscroll-behavior:contain;
      padding:16px;background:var(--card,#fff);color:var(--text,#18191b);
      border:1px solid var(--border,#d5d5db);border-radius:19px;
      box-shadow:0 12px 45px rgba(0,0,0,.16);
      font-family:"Segoe UI","Microsoft YaHei UI",sans-serif;
    }
    #tex-search-filter-panel .tex-filter-head {
      display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;
      gap:12px;
    }
    #tex-search-filter-panel h2{margin:0;font-size:17px;font-weight:700}
    #tex-search-filter-panel h3{margin:15px 0 7px;font-size:11px;color:var(--muted);font-weight:600}
    #tex-search-filter-panel .tex-filter-group{
      background:var(--fill);border:1px solid var(--border);border-radius:13px;
      overflow:hidden;padding:0 10px;
    }
    #tex-search-filter-panel label{
      display:flex;align-items:center;justify-content:space-between;gap:9px;
      padding:10px 3px;min-height:40px;font-size:13px;cursor:pointer;
    }
    #tex-search-filter-panel label + label{border-top:1px solid var(--border)}
    #tex-search-filter-panel label input[type="checkbox"]{
      flex:0 0 18px;width:18px;height:18px;accent-color:var(--primary);margin:0;cursor:pointer;
    }
    #tex-search-filter-panel label input[type="radio"] {
      appearance:radio!important;-webkit-appearance:radio!important;
      flex:0 0 18px!important;width:18px!important;height:18px!important;
      max-width:18px!important;min-width:18px!important;min-height:18px!important;
      padding:0!important;margin:0!important;position:static!important;
      border:0!important;border-radius:50%!important;background:transparent!important;
      box-shadow:none!important;accent-color:var(--primary)!important;
    }
    #tex-search-filter-panel input[type="date"],
    #tex-search-filter-panel input[type="number"],
    #tex-search-filter-panel select{
      min-width:0;width:148px;max-width:55%;box-sizing:border-box;
      padding:7px 8px;border:1px solid var(--border);border-radius:7px;
      background:var(--card);color:var(--text);font:inherit;
    }
    #tex-search-filter-panel button {
      border:0;border-radius:9px;background:var(--fill);color:var(--text);
      min-height:31px;padding:6px 11px;cursor:pointer;font:inherit;font-size:12px;
    }
    #tex-search-filter-panel .tex-filter-apply{background:var(--primary);color:#fff}
    #tex-search-filter-panel button:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
    #tex-search-filter-panel .tex-filter-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}
  `;
  const script = String.raw`
    (() => {
      const root=document.querySelector('.tex-work-app[data-tex-root]');
      const input=document.getElementById('tex-search'),box=input?.closest('.tex-search');
      const list=document.getElementById('tex-document-list'),empty=document.getElementById('tex-documents-empty');
      if(!root||!input||!box||!list||window.__aertexTexAdvancedSearch)return;
      window.__aertexTexAdvancedSearch=true;
      const zh=__ZH__, owner=__OWNER__;
      const copy=zh?{
        title:'过滤条件',type:'包括类型',project:'项目',folder:'文件夹',file:'文件',
        status:'保存状态',saved:'已保存',unsaved:'未保存',created:'创建时间不早于',
        modified:'最后修改不早于',size:'大小不超过 (MB)',
        order:'排序',newest:'最近修改',name:'名称',
        reset:'重置',done:'完成',searching:'正在检索项目文件',
        noResults:'没有找到符合条件的项目或文件',unknown:'未记录',
        dateCreated:'创建',dateModified:'修改',byteSize:'大小',state:'状态',path:'路径'
      }:{
        title:'Filters',type:'Include types',project:'Projects',folder:'Folders',file:'Files',
        status:'Save status',saved:'Saved',unsaved:'Unsaved',created:'Created since',
        modified:'Modified since',size:'Maximum size (MB)',
        order:'Sort',newest:'Recently modified',name:'Name',
        reset:'Reset',done:'Done',searching:'Searching project files',
        noResults:'No matching projects or files',unknown:'Not recorded',
        dateCreated:'Created',dateModified:'Modified',byteSize:'Size',state:'State',path:'Path'
      };
      const api=async url=>{
        const response=await fetch(url,{credentials:'same-origin',cache:'no-store',headers:{accept:'application/json'}});
        if(!response.ok)throw Error('Search index unavailable');
        return response.json();
      };
      const state={types:{project:true,folder:true,file:true},status:'all',created:'',modified:'',maxSize:'',order:'recent'};
      const results=document.createElement('section');
      results.id='tex-search-results';results.hidden=true;results.setAttribute('aria-live','polite');
      list.before(results);
      const button=document.createElement('button');
      button.type='button';button.id='tex-search-filter';button.setAttribute('aria-label',copy.title);
      button.setAttribute('title',copy.title);button.setAttribute('aria-expanded','false');
      button.setAttribute('aria-haspopup','dialog');
      button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 6.5H21 M6 12H18 M9 17.5H15"/></svg>';
      box.append(button);
      const pop=document.createElement('section');
      pop.id='tex-search-filter-panel';pop.hidden=true;
      pop.setAttribute('role','dialog');pop.setAttribute('aria-modal','false');
      pop.setAttribute('aria-label',copy.title);
      pop.innerHTML='<div class="tex-filter-head"><h2></h2><button type="button" data-action="done">✓</button></div>'+
        '<h3 data-caption="type"></h3><div class="tex-filter-group" id="tex-filter-types"></div>'+
        '<h3 data-caption="status"></h3><div class="tex-filter-group" id="tex-filter-status"></div>'+
        '<h3 data-caption="dates"></h3><div class="tex-filter-group" id="tex-filter-dates"></div>'+
        '<div class="tex-filter-actions"><button type="button" data-action="reset"></button><button type="button" class="tex-filter-apply" data-action="done"></button></div>';
      document.body.append(pop);
      pop.querySelector('h2').textContent=copy.title;
      pop.querySelector('[data-caption="type"]').textContent=copy.type;
      pop.querySelector('[data-caption="status"]').textContent=copy.status;
      pop.querySelector('[data-caption="dates"]').textContent=zh?'时间、大小与排序':'Time, size and sorting';
      pop.querySelector('[data-action="reset"]').textContent=copy.reset;
      pop.querySelector('.tex-filter-apply').textContent=copy.done;
      const types=pop.querySelector('#tex-filter-types'),statuses=pop.querySelector('#tex-filter-status');
      for(const key of ['project','folder','file']){
        const l=document.createElement('label'),title=document.createElement('span'),check=document.createElement('input');
        title.textContent=copy[key];check.type='checkbox';check.checked=state.types[key];check.dataset.type=key;
        l.append(title,check);types.append(l);
      }
      for(const [value,label] of [['all',zh?'全部状态':'All statuses'],['saved',copy.saved],['unsaved',copy.unsaved]]){
        const l=document.createElement('label'),span=document.createElement('span'),check=document.createElement('input');
        span.textContent=label;check.type='radio';check.name='tex-filter-status-choice';check.value=value;check.checked=value==='all';
        l.append(span,check);statuses.append(l);
      }
      const dates=pop.querySelector('#tex-filter-dates');
      const addField=(label,type,key,props={})=>{
        const row=document.createElement('label'),span=document.createElement('span'),field=document.createElement('input');
        span.textContent=label;field.type=type;field.dataset.key=key;
        for(const [k,v]of Object.entries(props))field.setAttribute(k,v);
        row.append(span,field);dates.append(row);return field;
      };
      addField(copy.created,'date','created');
      addField(copy.modified,'date','modified');
      addField(copy.size,'number','maxSize',{min:'0',step:'0.1',placeholder:zh?'不限':'Any'});
      const sort=document.createElement('label'),sortTitle=document.createElement('span'),sortSelect=document.createElement('select');
      sortTitle.textContent=copy.order;for(const [value,label]of [['recent',copy.newest],['name',copy.name]]){
        const option=document.createElement('option');option.value=value;option.textContent=label;sortSelect.append(option);
      }
      sortSelect.dataset.key='order';sort.append(sortTitle,sortSelect);dates.append(sort);
      const position=()=>{
        const bounds=box.getBoundingClientRect();
        pop.style.left=Math.min(Math.max(10,bounds.left),innerWidth-pop.offsetWidth-10)+'px';
        pop.style.top=Math.max(10,Math.min(innerHeight-pop.offsetHeight-10,bounds.bottom+9))+'px';
      };
      const close=()=>{pop.hidden=true;button.setAttribute('aria-expanded','false')};
      button.addEventListener('click',()=>{pop.hidden=!pop.hidden;button.setAttribute('aria-expanded',String(!pop.hidden));if(!pop.hidden)position()});
      pop.addEventListener('click',e=>{
        if(e.target.closest('[data-action="done"]')){close();button.focus()}
        if(e.target.closest('[data-action="reset"]')){
          state.types={project:true,folder:true,file:true};state.status='all';
          state.created='';state.modified='';state.maxSize='';state.order='recent';
          for(const el of pop.querySelectorAll('[data-type]'))el.checked=true;
          for(const el of pop.querySelectorAll('[name="tex-filter-status-choice"]'))el.checked=el.value==='all';
          for(const el of pop.querySelectorAll('[data-key]'))el.value=el.dataset.key==='order'?'recent':'';
          refresh();
        }
      });
      pop.addEventListener('change',e=>{
        const el=e.target;
        if(el.dataset.type)state.types[el.dataset.type]=el.checked;
        if(el.name==='tex-filter-status-choice')state.status=el.value;
        if(el.dataset.key)state[el.dataset.key]=el.value;
        refresh();
      });
      document.addEventListener('pointerdown',e=>{
        if(!pop.hidden&&!pop.contains(e.target)&&!button.contains(e.target))close();
      },true);
      document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!pop.hidden){close();button.focus()}});
      window.addEventListener('resize',()=>{if(!pop.hidden)position()});
      window.addEventListener('pagehide',()=>pop.remove(),{once:true});
      let projects=[],listedAt=0,index=new Map(),inflight=new Map(),generation=0,timer=0;
      const textbytes=s=>new TextEncoder().encode(String(s||'')).length;
      const sizeOf=file=>file?.encoding==='base64'
        ?Math.max(0,Math.floor(String(file.content||'').replace(/=+$/,'').length*3/4))
        :textbytes(file?.content);
      const savedStatus=entry=>{
        const current=root.dataset.texCollaborationDocumentId||'';
        if(entry.projectId!==current)return 'saved';
        const active=window.__aertexTexExplorerAsset?.();
        const pending=window.__aertexTexExplorerHasUnsaved?.()===true;
        const mainDirty=window.__aertexTexMainDirty?.()===true ||
          /未保存|unsaved|正在保存|saving/i.test(document.getElementById('tex-save-state')?.textContent||'');
        const selectedName=active?.name||'main.tex';
        const matchingFile=entry.type==='file'&&entry.name===selectedName;
        const matchingFolder=entry.type==='folder'&&selectedName.startsWith(entry.name+'/');
        return (entry.type==='project' && (pending||mainDirty))||
          (matchingFile && (active?.main?mainDirty:pending))||
          (matchingFolder && pending) ? 'unsaved':'saved';
      };
      const dateOf=value=>{
        const t=Date.parse(value||'');
        return Number.isFinite(t)?new Date(t).toLocaleString(zh?'zh-CN':'en-US'):copy.unknown;
      };
      const formatSize=value=>{
        if(!Number.isFinite(value)||value<0)return copy.unknown;
        if(value<1024)return Math.round(value)+' B';
        if(value<1048576)return (value/1024).toFixed(1)+' KB';
        return (value/1048576).toFixed(2)+' MB';
      };
      const pathOf=e=>owner+'/'+e.projectTitle+(e.name?'/'+e.name:'');
      const info=e=>{
        const stateText=savedStatus(e)==='unsaved'?copy.unsaved:copy.saved;
        return copy.path+': '+pathOf(e)+'\n'+copy.dateCreated+': '+dateOf(e.created_at)+
          '\n'+copy.dateModified+': '+dateOf(e.updated_at)+
          '\n'+copy.byteSize+': '+formatSize(e.size_bytes)+'\n'+copy.state+': '+stateText;
      };
      const projectEntry=p=>({
        type:'project',id:p.id,projectId:p.id,projectTitle:p.title,name:'',
        created_at:p.created_at||null,updated_at:p.updated_at||null,
        size_bytes:index.get(p.id)?.projectSize ?? null,
        preview:p.preview||''
      });
      function summarize(doc){
        const fileEntries=[];
        if(!doc.main_deleted){
          fileEntries.push({name:doc.main_filename||'main.tex',main:true,created_at:doc.main_file_created_at||null,
            updated_at:doc.main_file_updated_at||null,size_bytes:textbytes(doc.source)});
        }
        for(const file of doc.files||[]){
          if(!file||typeof file.name!=='string')continue;
          fileEntries.push({name:file.name,main:false,
            created_at:file.created_at||null,updated_at:file.updated_at||null,size_bytes:sizeOf(file)});
        }
        const groups=new Map();
        for(const f of fileEntries){
          const parts=f.name.split('/');let prefix='';
          for(const segment of parts.slice(0,-1)){
            prefix=prefix?prefix+'/'+segment:segment;
            let group=groups.get(prefix);
            if(!group){group={name:prefix,size_bytes:0,created_at:null,updated_at:null};groups.set(prefix,group)}
            group.size_bytes+=f.size_bytes;
            if(f.created_at && (!group.created_at||f.created_at<group.created_at))group.created_at=f.created_at;
            if(f.updated_at && (!group.updated_at||f.updated_at>group.updated_at))group.updated_at=f.updated_at;
          }
        }
        return {files:fileEntries,folders:[...groups.values()],
          projectSize:fileEntries.reduce((n,f)=>n+f.size_bytes,0)};
      }
      const loadProjects=async()=>{
        if(Date.now()-listedAt<30000 && projects.length)return projects;
        const data=await api('/api/tex/documents');projects=Array.isArray(data.documents)?data.documents:[];
        listedAt=Date.now();return projects;
      };
      const getIndex=async p=>{
        const cached=index.get(p.id);
        if(cached&&cached.updatedAt===p.updated_at)return cached;
        if(inflight.has(p.id))return inflight.get(p.id);
        const request=api('/api/tex/documents?id='+encodeURIComponent(p.id)).then(data=>{
          if(!data.document||data.document.id!==p.id)throw Error('Project not accessible');
          const entry={...summarize(data.document),updatedAt:p.updated_at};
          index.set(p.id,entry);return entry;
        }).finally(()=>inflight.delete(p.id));
        inflight.set(p.id,request);return request;
      };
      function entries(){
        const out=[];
        for(const p of projects){
          out.push(projectEntry(p));
          const detail=index.get(p.id);
          if(!detail)continue;
          for(const f of detail.files)out.push({...f,type:'file',id:p.id,projectId:p.id,projectTitle:p.title});
          for(const f of detail.folders)out.push({...f,type:'folder',id:p.id,projectId:p.id,projectTitle:p.title});
        }
        return out;
      }
      const match=e=>{
        if(!state.types[e.type])return false;
        const status=savedStatus(e);
        if(state.status!=='all'&&status!==state.status)return false;
        if(state.created&&(!e.created_at||e.created_at.slice(0,10)<state.created))return false;
        if(state.modified&&(!e.updated_at||e.updated_at.slice(0,10)<state.modified))return false;
        if(state.maxSize!==''&&(!Number.isFinite(e.size_bytes)||e.size_bytes>Number(state.maxSize)*1048576))return false;
        const q=input.value.trim().toLocaleLowerCase();
        if(!q)return true;
        return [e.name,e.projectTitle,e.type==='project'?e.preview:'',pathOf(e)]
          .some(v=>String(v||'').toLocaleLowerCase().includes(q));
      };
      const filterActive=()=>state.status!=='all'||Boolean(state.created||state.modified||state.maxSize)||
        Object.values(state.types).some(x=>!x);
      const searchActive=()=>Boolean(input.value.trim()||filterActive());
      const icon=type=>type==='project'
        ?'<svg viewBox="0 0 24 24"><rect x="2.7" y="2.7" width="18.6" height="18.6" rx="1"/><path d="M8.8 3v18M9 9h12"/></svg>'
        :type==='folder'
        ?'<svg viewBox="0 0 24 24"><path d="M12 20c-2.4-2-5-2.8-9-2V4c4-.3 7.2.7 9 2.5 2-1.8 5.1-2.8 9-2.5v14c-4-.8-6.6 0-9 2Z M12 6.5V20"/></svg>'
        :'<svg viewBox="0 0 24 24"><path d="M4 2H15L21 8V22H4Z M15 2V8H21 M8 12H17 M8 16H15 M8 19H17"/></svg>';
      function addResult(entry){
        const row=document.createElement('button');row.type='button';row.className='tex-found-entry';
        row.dataset.type=entry.type;row.dataset.project=entry.id;row.title=info(entry);
        const svg=document.createElement('span');svg.innerHTML=icon(entry.type);
        const content=document.createElement('span');content.className='tex-found-content';
        const title=document.createElement('span');title.className='tex-found-name';
        title.textContent=entry.type==='project'?entry.projectTitle:entry.name.split('/').at(-1);
        const path=document.createElement('span');path.className='tex-found-path';path.textContent=pathOf(entry);
        const meta=document.createElement('span');meta.className='tex-found-detail';
        meta.textContent=copy.dateCreated+': '+dateOf(entry.created_at)+' · '+
          copy.dateModified+': '+dateOf(entry.updated_at)+' · '+
          copy.byteSize+': '+formatSize(entry.size_bytes)+' · '+
          copy.state+': '+(savedStatus(entry)==='unsaved'?copy.unsaved:copy.saved);
        content.append(title,path,meta);row.append(svg.firstElementChild,content);
        row.addEventListener('click',()=>void openResult(entry));return row;
      }
      function refresh(){
        button.dataset.hasFilter=String(filterActive());
        const active=searchActive();
        list.hidden=active;empty.hidden=active || Boolean(list.querySelector('.tex-document-item'));
        results.hidden=!active;
        if(!active){results.replaceChildren();return}
        const found=entries().filter(match);
        found.sort(state.order==='name'?
          (a,b)=>pathOf(a).localeCompare(pathOf(b),zh?'zh':'en',{numeric:true}):
          (a,b)=>String(b.updated_at||'').localeCompare(String(a.updated_at||''))||
            pathOf(a).localeCompare(pathOf(b)));
        results.replaceChildren();
        const subset=found.slice(0,300);
        for(const e of subset)results.append(addResult(e));
        if(!subset.length){
          const note=document.createElement('p');note.className='tex-search-none';
          note.textContent=copy.noResults;results.append(note);
        }
        const pending=projects.filter(p=>!index.has(p.id)).length;
        if(pending&&state.types.file||pending&&state.types.folder){
          const note=document.createElement('p');note.className='tex-search-progress';
          note.textContent=copy.searching+' · '+(projects.length-pending)+'/'+projects.length;
          results.append(note);
        }
      }
      async function indexAll(){
        const token=++generation;
        try {
          const all=await loadProjects();if(token!==generation)return;
          refresh();
          if(!state.types.file&&!state.types.folder)return;
          let cursor=0;
          const worker=async()=>{
            while(cursor<all.length && token===generation){
              const p=all[cursor++];
              try{await getIndex(p)}catch{}
              if(token===generation)refresh();
            }
          };
          await Promise.all([worker(),worker(),worker()]);
          if(token===generation)refresh();
        }catch(err){
          if(token===generation&&searchActive()){
            results.replaceChildren();
            const msg=document.createElement('p');msg.className='tex-search-none';
            msg.textContent=err.message||'Search unavailable';results.append(msg);
          }
        }
      }
      const schedule=()=>{
        clearTimeout(timer);refresh();
        if(searchActive())timer=setTimeout(()=>void indexAll(),180);
        else generation++;
      };
      // Intercept the legacy project-title-only search, which erased all
      // file/folder rows and replaced a valid query with an empty screen.
      input.addEventListener('input',e=>{
        if(searchActive())e.stopImmediatePropagation();
        schedule();
      },true);
      async function openResult(entry){
        const project=[...list.querySelectorAll(':scope > .tex-document-item[data-tex-document-id]')]
          .find(row=>row.dataset.texDocumentId===entry.projectId);
        if(!project)return;
        if(entry.type==='project'){project.click();return}
        const container=project.nextElementSibling;
        if(container?.hidden)project.querySelector('.tex-project-chevron')?.click();
        const selector=entry.type==='file'?'.tex-tree-file':'.tex-tree-folder';
        let item=null;
        for(let i=0;i<60;i++){
          item=[...list.querySelectorAll(selector)].find(row=>entry.type==='file'
            ?row.dataset.project===entry.projectId&&row.dataset.file===entry.name
            :row.dataset.projectId===entry.projectId&&row.dataset.projectFolder===entry.name);
          if(item)break;
          await new Promise(resolve=>setTimeout(resolve,60));
        }
        if(item){
          if(entry.type==='folder'){
            // The matched nested node exists even while ancestor groups are
            // collapsed. Reveal its full ancestry through the explorer's own
            // chevron handlers so expansion state is kept in sync.
            const ancestors=[];let parent=item.parentElement;
            while(parent&&parent!==list){
              if(parent.classList?.contains('tex-tree-folder-children')&&parent.hidden)
                ancestors.unshift(parent.previousElementSibling);
              parent=parent.parentElement;
            }
            for(const ancestor of ancestors)ancestor?.querySelector('.tex-project-chevron')?.click();
          }
          item.click();
        }
      }
      const getRowEntry=row=>{
        const projectRow=row.matches('.tex-document-item')?row:
          [...list.querySelectorAll(':scope > .tex-document-item[data-tex-document-id]')]
            .find(p=>p.dataset.texDocumentId===(row.dataset.project||row.dataset.projectId));
        const id=projectRow?.dataset.texDocumentId;if(!id)return null;
        const p=projects.find(p=>p.id===id)||{
          id,title:projectRow.querySelector('strong')?.textContent||'',created_at:null,updated_at:null
        };
        if(row.matches('.tex-document-item'))return projectEntry(p);
        const d=index.get(id);
        const type=row.matches('.tex-tree-file')?'file':'folder';
        const name=type==='file'?row.dataset.file:row.dataset.projectFolder;
        const file=d?.[type==='file'?'files':'folders']?.find(f=>f.name===name);
        return {type,id,projectId:id,projectTitle:p.title,name,
          created_at:file?.created_at||null,updated_at:file?.updated_at||null,
          size_bytes:file?.size_bytes??null};
      };
      list.addEventListener('pointerover',e=>{
        const row=e.target.closest('.tex-document-item,.tex-tree-file,.tex-tree-folder');
        if(!row)return;
        const entry=getRowEntry(row);if(!entry)return;
        row.title=info(entry);
        row.dataset.aertexMeta=info(entry);
        const p=projects.find(p=>p.id===entry.projectId);
        if(p&&!index.has(p.id)){
          void getIndex(p).then(()=>{
            if(row.isConnected){
              const updated=getRowEntry(row);
              if(updated){row.title=info(updated);row.dataset.aertexMeta=info(updated);}
            }
          }).catch(()=>{});
        }
      });
      document.addEventListener('aertex:tex-project-asset-selected',()=>{if(searchActive())refresh()});
      window.addEventListener('aertex:tex-file-updated',()=>{index.clear();listedAt=0; if(searchActive())schedule()});
      root.addEventListener('input',e=>{if(e.target.id==='tex-source'&&searchActive())refresh()},true);
      // Prime only the cheap project summaries. Full file bytes are loaded
      // lazily when search or a project tooltip actually needs them.
      void loadProjects().then(()=>{if(searchActive())refresh()}).catch(()=>{});
    })();
  `.replace('__ZH__', zh ? 'true':'false').replace('__OWNER__', JSON.stringify(String(ownerSlug||"account").replace(/[^A-Za-z0-9_.-]/g,"-").slice(0,48)));
  return String(markup||'').replace('</head>','<style id="aertex-tex-search-filter-css">'+css+'</style></head>')
    .replace('</body>','<script id="aertex-tex-search-filter-runtime">'+script+'</script></body>');
}
