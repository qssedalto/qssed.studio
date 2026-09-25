export function curatedLinksUserEnhancer(zh) {
  const copy = zh ? {
    add: "新增链接",
    dialogTitle: "新建收藏链接",
    dialogIntro: "新建的链接默认仅属于当前账号，只有你主动公开后才会出现在社区。",
    title: "名称",
    titlePlaceholder: "例如：OpenAI API 文档",
    url: "链接地址",
    urlPlaceholder: "https://example.com",
    category: "分类",
    description: "说明",
    descriptionPlaceholder: "简单说明这个链接是什么、为什么值得保存。",
    cancel: "取消",
    create: "创建链接",
    creating: "正在创建…",
    created: "链接已创建",
    mine: "我创建的",
    userCreated: "用户创建",
    sectionMine: "我的链接",
    sectionHintMine: "这里仅显示当前账号创建的私人链接。",
    owner: "创建者",
    loadError: "无法读取账号链接",
    createError: "创建失败，请检查链接地址后重试。",
    loginRequired: "登录后才能新建链接",
    noLinks: "还没有自己创建的链接"
  } : {
    add: "Add link",
    dialogTitle: "Create saved link",
    dialogIntro: "Links you create belong to the current account by default and appear in the community only when you publish them.",
    title: "Name",
    titlePlaceholder: "For example: OpenAI API docs",
    url: "URL",
    urlPlaceholder: "https://example.com",
    category: "Category",
    description: "Description",
    descriptionPlaceholder: "Briefly describe what this link is and why it is useful.",
    cancel: "Cancel",
    create: "Create link",
    creating: "Creating…",
    created: "Link created",
    mine: "Created by me",
    userCreated: "User created",
    sectionMine: "My links",
    sectionHintMine: "This area shows private links created by the current account only.",
    owner: "Created by",
    loadError: "Could not load account links",
    createError: "Could not create the link. Check the URL and try again.",
    loginRequired: "Sign in to create links",
    noLinks: "No links created yet"
  };

  return `<style>
    .curated-links-overview{grid-template-columns:minmax(0,1fr) auto auto}
    .curated-add-link-button{width:auto!important;min-width:max-content!important;height:42px!important;min-height:42px!important;margin:0!important;padding:0 15px!important;border:0!important;border-radius:11px!important;background:var(--primary)!important;color:#fff!important;font-size:13px!important;font-weight:680!important;box-shadow:none!important;transition:transform 100ms ease-out,filter .12s ease!important}.curated-add-link-button:hover{filter:brightness(1.03)}.curated-add-link-button:active{transform:scale(.96)!important}.curated-add-link-button:disabled{opacity:.5;cursor:not-allowed}
    .curated-user-links{display:none;padding:18px;border:1px solid var(--border);border-radius:18px;background:var(--card)}.curated-user-links.is-visible{display:block}.curated-user-links-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:12px}.curated-user-links-head h2{margin:0;font-size:20px;font-weight:680;letter-spacing:-.025em}.curated-user-links-head p{margin:0;color:var(--muted);font-size:11px}.curated-user-links-count{margin-left:6px;color:var(--muted);font-size:12px;font-weight:620}.curated-user-links-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.curated-user-link-owner{display:inline-flex;align-items:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.curated-user-link-owner::before{content:'•';margin-right:5px;color:var(--primary)}
    .curated-user-links-empty{display:grid;place-items:center;min-height:110px;border-radius:14px;background:var(--fill);color:var(--muted);font-size:12px}
    .curated-link-dialog-backdrop{position:fixed;z-index:120;inset:0;display:none;place-items:center;padding:24px;background:color-mix(in srgb,#000 24%,transparent);backdrop-filter:blur(8px)}.curated-link-dialog-backdrop.is-open{display:grid}.curated-link-dialog{width:min(620px,100%);max-height:min(760px,calc(100vh - 48px));overflow:auto;padding:20px;border:1px solid var(--border);border-radius:20px;background:var(--surface);box-shadow:0 24px 70px rgba(0,0,0,.18)}.curated-link-dialog-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.curated-link-dialog-head h2{margin:0;font-size:23px;letter-spacing:-.03em}.curated-link-dialog-head p{margin:6px 0 0;color:var(--muted);font-size:12px;line-height:1.5}.curated-link-dialog-close{display:grid;place-items:center;width:34px!important;min-width:34px!important;height:34px!important;min-height:34px!important;margin:0!important;padding:0!important;border:0!important;border-radius:50%!important;background:var(--fill)!important;color:var(--text)!important;font-size:19px!important}.curated-link-dialog-form{display:grid;gap:12px;margin-top:18px}.curated-link-dialog-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.curated-link-dialog-field{display:grid;gap:6px}.curated-link-dialog-field>span{color:var(--muted);font-size:11px;font-weight:650}.curated-link-dialog-field input,.curated-link-dialog-field select,.curated-link-dialog-field textarea{width:100%;margin:0;border:0;border-radius:12px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border);color:var(--text)}.curated-link-dialog-field input,.curated-link-dialog-field select{height:44px;min-height:44px;padding:0 12px}.curated-link-dialog-field textarea{min-height:110px;padding:12px;resize:vertical;line-height:1.5}.curated-link-dialog-status{min-height:18px;color:var(--muted);font-size:11px}.curated-link-dialog-status.is-error{color:var(--danger)}.curated-link-dialog-actions{display:flex;justify-content:flex-end;gap:8px;padding-top:4px}.curated-link-dialog-action{width:auto!important;min-width:88px!important;height:40px!important;min-height:40px!important;margin:0!important;padding:0 14px!important;border-radius:11px!important;font-size:13px!important}.curated-link-dialog-cancel{background:var(--fill)!important;color:var(--text)!important}.curated-link-dialog-submit{background:var(--primary)!important;color:#fff!important}
    @media(max-width:1180px){.curated-links-overview{grid-template-columns:minmax(0,1fr) auto}.curated-add-link-button{grid-column:2;justify-self:end}.curated-user-links-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:760px){.curated-links-overview{grid-template-columns:1fr}.curated-add-link-button{grid-column:auto;justify-self:start}.curated-user-links{padding:14px}.curated-user-links-grid{grid-template-columns:1fr}.curated-user-links-head{align-items:flex-start;flex-direction:column}.curated-link-dialog-row{grid-template-columns:1fr}}
    @media(prefers-reduced-motion:reduce){.curated-add-link-button{transition:none!important}}
  </style>
  <div class="curated-link-dialog-backdrop" id="curated-user-link-dialog" aria-hidden="true">
    <section class="curated-link-dialog" role="dialog" aria-modal="true" aria-labelledby="curated-user-link-dialog-title">
      <div class="curated-link-dialog-head"><div><h2 id="curated-user-link-dialog-title">${copy.dialogTitle}</h2><p>${copy.dialogIntro}</p></div><button class="curated-link-dialog-close" id="curated-user-link-close" type="button" aria-label="${copy.cancel}">×</button></div>
      <form class="curated-link-dialog-form" id="curated-user-link-form">
        <div class="curated-link-dialog-row">
          <label class="curated-link-dialog-field"><span>${copy.title}</span><input id="curated-user-link-title" maxlength="180" required placeholder="${copy.titlePlaceholder}"></label>
          <label class="curated-link-dialog-field"><span>${copy.url}</span><input id="curated-user-link-url" inputmode="url" maxlength="2048" required placeholder="${copy.urlPlaceholder}"></label>
        </div>
        <label class="curated-link-dialog-field"><span>${copy.category}</span><select id="curated-user-link-category"></select></label>
        <label class="curated-link-dialog-field"><span>${copy.description}</span><textarea id="curated-user-link-description" maxlength="1200" placeholder="${copy.descriptionPlaceholder}"></textarea></label>
        <div class="curated-link-dialog-status" id="curated-user-link-status" aria-live="polite"></div>
        <div class="curated-link-dialog-actions"><button class="curated-link-dialog-action curated-link-dialog-cancel" id="curated-user-link-cancel" type="button">${copy.cancel}</button><button class="curated-link-dialog-action curated-link-dialog-submit" id="curated-user-link-submit" type="submit">${copy.create}</button></div>
      </form>
    </section>
  </div>
  <script>(function(){
    const root=document.querySelector('[data-curated-links-root]');
    if(!root)return;
    const search=document.getElementById('curated-link-search');
    const categoryFilter=document.getElementById('curated-link-category');
    const originFilter=document.getElementById('curated-link-origin');
    const reset=document.getElementById('curated-link-reset');
    const resultCount=document.getElementById('curated-link-result-count');
    const resultLabel=document.getElementById('curated-link-result-label');
    const empty=document.getElementById('curated-links-empty');
    const overview=root.querySelector('.curated-links-overview');
    const stats=root.querySelector('.curated-links-stats');
    const nav=root.querySelector('.curated-link-nav');
    const featured=root.querySelector('[data-curated-featured-section]');
    const systemGroups=Array.from(root.querySelectorAll('[data-curated-group]'));
    const baseTotal=systemGroups.reduce((sum,group)=>sum+group.querySelectorAll('[data-curated-card]').length,0);
    const dialog=document.getElementById('curated-user-link-dialog');
    const form=document.getElementById('curated-user-link-form');
    const titleInput=document.getElementById('curated-user-link-title');
    const urlInput=document.getElementById('curated-user-link-url');
    const categoryInput=document.getElementById('curated-user-link-category');
    const descriptionInput=document.getElementById('curated-user-link-description');
    const status=document.getElementById('curated-user-link-status');
    const submit=document.getElementById('curated-user-link-submit');
    let session=null;
    let links=[];

    const addButton=document.createElement('button');
    addButton.type='button';
    addButton.className='curated-add-link-button';
    addButton.textContent=${JSON.stringify(copy.add)};
    addButton.disabled=true;
    if(stats)stats.before(addButton);else overview?.append(addButton);

    const userSection=document.createElement('section');
    userSection.className='curated-user-links';
    userSection.innerHTML='<div class="curated-user-links-head"><h2 data-user-links-title></h2><p data-user-links-hint></p></div><div class="curated-user-links-grid" data-user-links-grid></div><div class="curated-user-links-empty" data-user-links-empty>${copy.noLinks}</div>';
    const favoriteSection=root.querySelector('[data-curated-local-favorites]');
    if(favoriteSection)favoriteSection.after(userSection);else if(nav)nav.after(userSection);else if(featured)featured.before(userSection);else root.append(userSection);
    const sectionTitle=userSection.querySelector('[data-user-links-title]');
    const sectionHint=userSection.querySelector('[data-user-links-hint]');
    const grid=userSection.querySelector('[data-user-links-grid]');
    const sectionEmpty=userSection.querySelector('[data-user-links-empty]');

    const userOriginOption=document.createElement('option');
    userOriginOption.value='user';
    userOriginOption.textContent=${JSON.stringify(copy.userCreated)};
    originFilter?.append(userOriginOption);

    if(categoryFilter&&categoryInput){
      Array.from(categoryFilter.options).filter(option=>option.value!=='all').forEach(option=>{
        const clone=option.cloneNode(true);categoryInput.append(clone);
      });
    }

    function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
    function safeHref(value){try{const parsed=new URL(String(value||''));return ['https:','http:'].includes(parsed.protocol)?parsed.toString():'#';}catch{return '#';}}
    function host(value){try{return new URL(value).hostname.replace(/^www\./,'');}catch{return 'external';}}
    function normalize(value){return String(value||'').trim().toLocaleLowerCase();}
    function authorization(){return session?.access_token?{'Authorization':'Bearer '+session.access_token}:{};}
    function ownerText(link){return link.is_own?(${JSON.stringify(copy.mine)}+' · '+String(link.owner_label||'')):(${JSON.stringify(copy.owner)}+' '+String(link.owner_label||''));}

    function render(){
      grid.innerHTML='';
      links.forEach(link=>{
        const href=safeHref(link.url);
        const card=document.createElement('a');
        card.className='curated-link-card';
        card.href=href;card.target='_blank';card.rel='noopener noreferrer';
        card.dataset.userLink='';
        card.dataset.curatedCategory=link.category||'';
        card.dataset.curatedOrigin='user';
        card.dataset.curatedFeatured='0';
        card.dataset.curatedSearch=normalize([link.title,link.description,host(href),link.category,link.owner_label].join(' '));
        card.innerHTML='<div class="curated-link-card-top"><strong>'+escapeHtml(link.title||href)+'</strong><span aria-hidden="true">↗</span></div><p>'+escapeHtml(link.description||'')+'</p><div class="curated-link-meta"><span class="curated-user-link-owner">'+escapeHtml(ownerText(link))+'</span><code>'+escapeHtml(host(href))+'</code></div>';
        grid.append(card);
      });
      sectionTitle.innerHTML=escapeHtml(${JSON.stringify(copy.sectionMine)})+'<span class="curated-user-links-count">'+links.length+'</span>';
      sectionHint.textContent=${JSON.stringify(copy.sectionHintMine)};
      sectionEmpty.hidden=links.length>0;
      applyUserFilters();
      updateTopCount();
    }

    function updateTopCount(){
      const first=stats?.querySelector('.curated-links-stat strong');
      if(first)first.textContent=String(baseTotal+links.length);
    }

    function applyUserFilters(){
      const query=normalize(search?.value);
      const categoryValue=categoryFilter?.value||'all';
      const originValue=originFilter?.value||'all';
      let userVisible=0;
      Array.from(grid.querySelectorAll('[data-user-link]')).forEach(card=>{
        const show=(!query||normalize(card.dataset.curatedSearch).includes(query))&&(categoryValue==='all'||card.dataset.curatedCategory===categoryValue)&&(originValue==='all'||originValue==='user');
        card.hidden=!show;if(show)userVisible+=1;
      });
      const wantsUserOnly=originValue==='user';
      if(wantsUserOnly){
        systemGroups.forEach(group=>group.hidden=true);
        if(featured)featured.hidden=true;
      }
      const showSection=userVisible>0||(!links.length&&originValue==='user');
      userSection.classList.toggle('is-visible',showSection);
      sectionEmpty.hidden=links.length>0||originValue!=='user';
      let baseVisible=Number(resultCount?.textContent||0);
      if(wantsUserOnly)baseVisible=0;
      if(originValue==='favorite'||originValue==='chat'||originValue==='related'||originValue==='featured')userVisible=0;
      const combined=baseVisible+userVisible;
      if(resultCount)resultCount.textContent=String(combined);
      if(resultLabel)resultLabel.textContent=${zh ? "' / '" : "'of '"}+(baseTotal+links.length);
      if(empty)empty.classList.toggle('is-visible',combined===0&&!(originValue==='user'&&!links.length));
    }

    function openDialog(){
      if(!session){status.textContent=${JSON.stringify(copy.loginRequired)};return;}
      status.textContent='';status.classList.remove('is-error');form.reset();
      if(categoryInput.options.length)categoryInput.selectedIndex=0;
      dialog.classList.add('is-open');dialog.setAttribute('aria-hidden','false');
      document.documentElement.style.overflow='hidden';
      setTimeout(()=>titleInput.focus(),0);
    }
    function closeDialog(){dialog.classList.remove('is-open');dialog.setAttribute('aria-hidden','true');document.documentElement.style.overflow='';}
    function normalizeUrlInput(value){const text=String(value||'').trim();if(!text)return '';return /^https?:\/\//i.test(text)?text:'https://'+text;}

    async function loadLinks(){
      if(!session){links=[];addButton.disabled=true;render();return;}
      addButton.disabled=false;
      try{
        const response=await fetch('/api/user-links',{headers:{...authorization(),'Accept':'application/json'},cache:'no-store'});
        if(!response.ok)throw new Error('HTTP '+response.status);
        const payload=await response.json();links=Array.isArray(payload.links)?payload.links:[];userOriginOption.textContent=${JSON.stringify(copy.mine)};render();
      }catch(error){console.error('User links load failed',error);sectionTitle.textContent=${JSON.stringify(copy.loadError)};userSection.classList.add('is-visible');}
    }

    async function createLink(event){
      event.preventDefault();if(!session)return;
      submit.disabled=true;submit.textContent=${JSON.stringify(copy.creating)};status.textContent='';status.classList.remove('is-error');
      try{
        const response=await fetch('/api/user-links',{method:'POST',headers:{...authorization(),'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({title:titleInput.value,url:normalizeUrlInput(urlInput.value),category:categoryInput.value,description:descriptionInput.value})});
        const payload=await response.json().catch(()=>({}));
        if(!response.ok)throw new Error(payload.error||('HTTP '+response.status));
        status.textContent=${JSON.stringify(copy.created)};
        await loadLinks();closeDialog();
      }catch(error){console.error('User link create failed',error);status.textContent=${JSON.stringify(copy.createError)};status.classList.add('is-error');}
      finally{submit.disabled=false;submit.textContent=${JSON.stringify(copy.create)};}
    }

    addButton.addEventListener('click',openDialog);
    document.getElementById('curated-user-link-close')?.addEventListener('click',closeDialog);
    document.getElementById('curated-user-link-cancel')?.addEventListener('click',closeDialog);
    dialog.addEventListener('click',event=>{if(event.target===dialog)closeDialog();});
    form.addEventListener('submit',createLink);
    search?.addEventListener('input',applyUserFilters);
    categoryFilter?.addEventListener('change',applyUserFilters);
    originFilter?.addEventListener('change',applyUserFilters);
    reset?.addEventListener('click',()=>setTimeout(applyUserFilters,0));
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&dialog.classList.contains('is-open'))closeDialog();});

    async function initialize(){
      try{
        if(typeof supabaseClient==='undefined')throw new Error('Supabase client unavailable');
        const {data}=await supabaseClient.auth.getSession();session=data?.session||null;await loadLinks();
        supabaseClient.auth.onAuthStateChange(async(_event,next)=>{session=next||null;await loadLinks();});
      }catch(error){console.error('User links session init failed',error);addButton.disabled=true;}
    }
    if(document.readyState==='complete')initialize();else window.addEventListener('load',initialize,{once:true});
  })();</script>`;
}
