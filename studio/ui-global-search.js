export function globalSearchContent(zh) {
  const copy = zh ? {
    eyebrow: "全局搜索",
    title: "搜索你的 Studio",
    intro: "统一搜索知识库、研究笔记、摘要、账号链接、社区链接和精选链接。私人内容仍按原有权限隔离，搜索不会扩大任何内容的可见范围。",
    placeholder: "搜索知识、笔记、链接、摘要…",
    hint: "输入至少 1 个关键词",
    searching: "正在搜索…",
    empty: "没有找到结果",
    emptyDetail: "换一个关键词，或切换到“全部”。",
    error: "搜索暂时不可用",
    partial: "部分模块暂时不可用，下面仍展示已完成的结果。",
    result: "个结果",
    all: "全部",
    knowledge: "知识库",
    note: "研究笔记",
    summary: "摘要",
    link: "我的 / 管理链接",
    community_link: "社区",
    curated_link: "精选",
    private: "私人",
    community: "社区",
    curated: "精选",
    admin: "管理员范围",
    current: "当前账号",
    open: "打开",
    external: "外部链接",
    shortcut: "按 / 聚焦搜索"
  } : {
    eyebrow: "Global Search",
    title: "Search your Studio",
    intro: "Search Knowledge, research notes, summaries, account links, community links, and curated links in one place. Private content keeps its existing visibility rules; search never expands access.",
    placeholder: "Search knowledge, notes, links, summaries…",
    hint: "Enter at least one keyword",
    searching: "Searching…",
    empty: "No results",
    emptyDetail: "Try another keyword or switch back to All.",
    error: "Search is temporarily unavailable",
    partial: "Some modules are temporarily unavailable. Available results are still shown below.",
    result: "results",
    all: "All",
    knowledge: "Knowledge",
    note: "Research notes",
    summary: "Summaries",
    link: "Account / admin links",
    community_link: "Community",
    curated_link: "Curated",
    private: "Private",
    community: "Community",
    curated: "Curated",
    admin: "Admin scope",
    current: "Current account",
    open: "Open",
    external: "External link",
    shortcut: "Press / to focus search"
  };

  return `
    <section class="global-search-shell" data-global-search>
      <div class="global-search-hero">
        <div class="global-search-heading">
          <span>${copy.eyebrow}</span>
          <h2>${copy.title}</h2>
          <p>${copy.intro}</p>
        </div>
        <div class="global-search-box">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path></svg>
          <input id="global-search-input" type="search" autocomplete="off" spellcheck="false" placeholder="${copy.placeholder}" aria-label="${copy.placeholder}">
          <kbd>/</kbd>
        </div>
        <div class="global-search-meta"><span id="global-search-status">${copy.hint}</span><span>${copy.shortcut}</span></div>
      </div>

      <div class="global-search-toolbar" id="global-search-toolbar" hidden>
        <div class="global-search-filters" role="tablist" aria-label="${copy.eyebrow}">
          <button type="button" class="is-active" data-search-filter="all">${copy.all}<b data-filter-count="all">0</b></button>
          <button type="button" data-search-filter="knowledge">${copy.knowledge}<b data-filter-count="knowledge">0</b></button>
          <button type="button" data-search-filter="note">${copy.note}<b data-filter-count="note">0</b></button>
          <button type="button" data-search-filter="summary">${copy.summary}<b data-filter-count="summary">0</b></button>
          <button type="button" data-search-filter="link">${copy.link}<b data-filter-count="link">0</b></button>
          <button type="button" data-search-filter="community_link">${copy.community_link}<b data-filter-count="community_link">0</b></button>
          <button type="button" data-search-filter="curated_link">${copy.curated_link}<b data-filter-count="curated_link">0</b></button>
        </div>
      </div>

      <div id="global-search-notice" class="global-search-notice" hidden></div>
      <div id="global-search-results" class="global-search-results" aria-live="polite"></div>
      <div id="global-search-empty" class="global-search-empty">
        <div class="global-search-empty-icon">⌕</div>
        <strong>${copy.hint}</strong>
        <span>${copy.intro}</span>
      </div>
    </section>

    <style>
      .global-search-shell{display:grid;gap:14px;min-width:0}.global-search-hero{display:grid;gap:16px;padding:26px;border:1px solid var(--border);border-radius:22px;background:var(--card)}
      .global-search-heading>span{display:block;color:var(--muted);font-size:11px;font-weight:700}.global-search-heading h2{margin:5px 0 7px;font-size:30px;letter-spacing:-.045em}.global-search-heading p{max-width:820px;margin:0;color:var(--muted);font-size:13px;line-height:1.6}
      .global-search-box{display:flex;align-items:center;gap:11px;min-height:58px;padding:0 16px;border-radius:16px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border);transition:box-shadow .15s ease,background .15s ease}.global-search-box:focus-within{background:var(--surface);box-shadow:0 0 0 4px color-mix(in srgb,var(--primary) 13%,transparent),inset 0 0 0 1px color-mix(in srgb,var(--primary) 58%,var(--border))}.global-search-box svg{width:20px;height:20px;flex:0 0 auto;fill:none;stroke:var(--muted);stroke-width:1.8;stroke-linecap:round}.global-search-box input{width:100%;height:56px;min-height:0;margin:0;padding:0;border:0!important;background:transparent!important;box-shadow:none!important;color:var(--text);font-size:16px}.global-search-box kbd{display:grid;place-items:center;min-width:26px;height:26px;padding:0 7px;border-radius:7px;background:var(--surface);color:var(--quiet);font:11px ui-monospace,SFMono-Regular,Menlo,monospace;box-shadow:inset 0 0 0 1px var(--border)}
      .global-search-meta{display:flex;justify-content:space-between;gap:12px;color:var(--quiet);font-size:11px}.global-search-toolbar{overflow:hidden;padding:9px;border-radius:15px;background:var(--fill)}.global-search-filters{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none}.global-search-filters::-webkit-scrollbar{display:none}.global-search-filters button{display:inline-flex;align-items:center;gap:7px;width:auto!important;min-width:max-content!important;min-height:36px!important;margin:0!important;padding:0 11px!important;border:0!important;border-radius:10px!important;background:transparent!important;color:var(--muted)!important;font-size:12px!important;font-weight:650!important;box-shadow:none!important}.global-search-filters button:hover{background:var(--surface)!important;color:var(--text)!important}.global-search-filters button.is-active{background:var(--surface)!important;color:var(--text)!important;box-shadow:inset 0 0 0 1px var(--border)!important}.global-search-filters b{display:grid;place-items:center;min-width:20px;height:20px;padding:0 5px;border-radius:999px;background:var(--fill);color:var(--quiet);font-size:10px}
      .global-search-notice{padding:11px 13px;border-radius:12px;background:color-mix(in srgb,var(--warning) 10%,var(--fill));color:var(--muted);font-size:12px}.global-search-results{display:grid;gap:8px}.global-search-result{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center;padding:16px 17px;border:1px solid var(--border);border-radius:16px;background:var(--card);color:var(--text);text-decoration:none;transition:background .13s ease,transform 100ms ease-out}.global-search-result:hover{background:var(--secondary)}.global-search-result:active{transform:scale(.993)}.global-search-result-main{min-width:0}.global-search-result-top{display:flex;align-items:center;gap:8px;min-width:0}.global-search-result-top strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px}.global-search-result-type{flex:0 0 auto;padding:3px 7px;border-radius:999px;background:var(--fill);color:var(--muted);font-size:9px;font-weight:720}.global-search-result p{display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;margin:7px 0 0;color:var(--muted);font-size:12px;line-height:1.5}.global-search-result-foot{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px;color:var(--quiet);font-size:10px}.global-search-result-foot span:not(:last-child)::after{content:'·';margin-left:7px}.global-search-result-open{display:flex;align-items:center;gap:7px;color:var(--primary);font-size:11px;font-weight:680;white-space:nowrap}.global-search-result-open span{font-size:15px}
      .global-search-empty{display:grid;place-items:center;gap:6px;min-height:220px;padding:34px;border:1px solid var(--border);border-radius:18px;background:var(--card);text-align:center}.global-search-empty-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:var(--fill);color:var(--muted);font-size:22px}.global-search-empty strong{font-size:14px}.global-search-empty span{max-width:560px;color:var(--muted);font-size:11px;line-height:1.55}
      @media(max-width:680px){.global-search-hero{padding:18px;border-radius:18px}.global-search-heading h2{font-size:25px}.global-search-meta>span:last-child{display:none}.global-search-result{grid-template-columns:1fr}.global-search-result-open{justify-self:start}.global-search-box kbd{display:none}}
      @media(prefers-reduced-motion:reduce){.global-search-result,.global-search-box{transition:none!important}}
    </style>

    <script>
      (()=>{
        const start=()=>{
          const root=document.querySelector('[data-global-search]');
          const input=document.getElementById('global-search-input');
          const results=document.getElementById('global-search-results');
          const empty=document.getElementById('global-search-empty');
          const status=document.getElementById('global-search-status');
          const toolbar=document.getElementById('global-search-toolbar');
          const notice=document.getElementById('global-search-notice');
          if(!root||!input||!results||!empty||!status)return;

          const labels=${JSON.stringify({
            knowledge:copy.knowledge,
            note:copy.note,
            summary:copy.summary,
            link:copy.link,
            community_link:copy.community_link,
            curated_link:copy.curated_link,
            private:copy.private,
            community:copy.community,
            curated:copy.curated,
            admin:copy.admin,
            current:copy.current,
            open:copy.open,
            external:copy.external
          })};
          let timer=null;
          let sequence=0;
          let allResults=[];
          let activeFilter='all';
          const prefix=location.pathname.startsWith('/zh-cn/')?'/zh-cn':location.pathname.startsWith('/en/')?'/en':'';

          function internalHref(value){if(!value)return '#';if(String(value).startsWith('https://')||String(value).startsWith('http://'))return value;return prefix+value;}
          function setStatus(value){status.textContent=value;}
          function resetEmpty(title,detail){empty.hidden=false;empty.querySelector('strong').textContent=title;empty.querySelector('span').textContent=detail;}
          function filterResults(){return activeFilter==='all'?allResults:allResults.filter(item=>item.type===activeFilter);}
          function typeLabel(type){return labels[type]||type;}
          function scopeLabel(item){if(item.scope==='community')return labels.community;if(item.scope==='curated')return labels.curated;if(item.scope==='admin')return labels.admin;if(item.is_own||!item.owner_label)return labels.private;return labels.admin;}
          function render(){
            const visible=filterResults();
            results.replaceChildren();
            empty.hidden=visible.length>0;
            if(!visible.length){resetEmpty(${JSON.stringify(copy.empty)},${JSON.stringify(copy.emptyDetail)});return;}
            visible.forEach(item=>{
              const anchor=document.createElement('a');anchor.className='global-search-result';anchor.href=internalHref(item.href);if(item.external){anchor.target='_blank';anchor.rel='noopener noreferrer';}
              const main=document.createElement('div');main.className='global-search-result-main';
              const top=document.createElement('div');top.className='global-search-result-top';
              const badge=document.createElement('span');badge.className='global-search-result-type';badge.textContent=typeLabel(item.type);
              const title=document.createElement('strong');title.textContent=item.title||'—';top.append(badge,title);
              const body=document.createElement('p');body.textContent=item.snippet||item.subtitle||'';
              const foot=document.createElement('div');foot.className='global-search-result-foot';
              [item.subtitle,scopeLabel(item),item.owner_label,item.updated_at?new Date(item.updated_at).toLocaleString():null].filter(Boolean).forEach(value=>{const span=document.createElement('span');span.textContent=value;foot.append(span);});
              main.append(top,body,foot);
              const open=document.createElement('div');open.className='global-search-result-open';open.textContent=item.external?labels.external:labels.open;const arrow=document.createElement('span');arrow.textContent='↗';open.append(arrow);
              anchor.append(main,open);results.append(anchor);
            });
          }
          function updateCounts(payload){
            const counts=payload?.counts||{};document.querySelectorAll('[data-filter-count]').forEach(node=>{const key=node.dataset.filterCount;node.textContent=String(key==='all'?(payload?.returned||0):(counts[key]||0));});
          }
          async function search(){
            const query=input.value.trim();window.clearTimeout(timer);const current=++sequence;
            if(!query){allResults=[];toolbar.hidden=true;notice.hidden=true;results.replaceChildren();resetEmpty(${JSON.stringify(copy.hint)},${JSON.stringify(copy.intro)});setStatus(${JSON.stringify(copy.hint)});return;}
            setStatus(${JSON.stringify(copy.searching)});empty.hidden=true;
            try{
              const response=await fetch('/api/search/global',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json;charset=UTF-8',Accept:'application/json'},body:JSON.stringify({query,limit:80}),cache:'no-store'});
              const payload=await response.json().catch(()=>({}));if(current!==sequence)return;if(!response.ok)throw new Error(payload?.error||${JSON.stringify(copy.error)});
              allResults=Array.isArray(payload?.results)?payload.results:[];toolbar.hidden=false;updateCounts(payload);setStatus(String(payload.returned||0)+' '+${JSON.stringify(copy.result)});
              if(payload.partial){notice.hidden=false;notice.textContent=${JSON.stringify(copy.partial)};}else notice.hidden=true;
              render();
            }catch(error){if(current!==sequence)return;allResults=[];toolbar.hidden=true;notice.hidden=true;results.replaceChildren();resetEmpty(error?.message||${JSON.stringify(copy.error)},${JSON.stringify(copy.emptyDetail)});setStatus(${JSON.stringify(copy.error)});}
          }
          input.addEventListener('input',()=>{window.clearTimeout(timer);timer=window.setTimeout(()=>void search(),220);});
          document.querySelectorAll('[data-search-filter]').forEach(button=>button.addEventListener('click',()=>{activeFilter=button.dataset.searchFilter||'all';document.querySelectorAll('[data-search-filter]').forEach(item=>item.classList.toggle('is-active',item===button));render();}));
          document.addEventListener('keydown',event=>{if(event.key==='/'&&!event.metaKey&&!event.ctrlKey&&!event.altKey&&!/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName||'')){event.preventDefault();input.focus();}});
        };
        window.setTimeout(start,0);
      })();
    </script>
  `;
}
