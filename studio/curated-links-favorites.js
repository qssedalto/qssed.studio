export function curatedLinksFavoritesEnhancer(zh) {
  const favoriteLabel = zh ? "星标" : "Favorites";
  const emptyLabel = zh ? "还没有星标" : "No favorites yet";
  const emptyHint = zh ? "点击链接上的星标即可添加。" : "Use the star on a link to add it here.";
  const addLabel = zh ? "添加星标" : "Add favorite";
  const removeLabel = zh ? "取消星标" : "Remove favorite";
  const localLabel = zh ? "仅此设备" : "This device only";
  const syncingLabel = zh ? "正在同步…" : "Syncing…";
  const cloudLabel = zh ? "已同步" : "Synced";
  const errorLabel = zh ? "同步失败 · 已保留本地" : "Sync failed · saved locally";

  return `<style>
    .curated-link-card-wrap{position:relative;min-width:0}.curated-link-card-wrap>.curated-link-card{height:100%}
    .curated-star-button{position:absolute;z-index:2;top:9px;right:34px;display:grid;place-items:center;width:30px!important;min-width:30px!important;height:30px!important;min-height:30px!important;margin:0!important;padding:0!important;border:0!important;border-radius:50%!important;background:var(--surface)!important;color:var(--quiet)!important;box-shadow:inset 0 0 0 1px var(--border)!important;font-size:15px!important;line-height:1!important;transition:background .12s ease,color .12s ease,transform 100ms ease-out!important}
    .curated-star-button:hover{background:var(--surface-strong)!important;color:var(--primary)!important;transform:none!important}.curated-star-button:active{transform:scale(.90)!important}.curated-star-button[aria-pressed="true"]{background:color-mix(in srgb,var(--primary) 12%,var(--surface))!important;color:var(--primary)!important;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 30%,var(--border))!important}
    .curated-local-favorites{display:none;padding:18px;border:1px solid var(--border);border-radius:18px;background:var(--card)}.curated-local-favorites.is-visible{display:block}.curated-local-favorites-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:12px}.curated-local-favorites-head h2{margin:0;font-size:20px;font-weight:680;letter-spacing:-.025em}.curated-local-favorites-head p{margin:0;color:var(--muted);font-size:11px}.curated-local-favorites-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.curated-local-favorites-empty{display:grid;place-items:center;gap:5px;min-height:110px;padding:18px;text-align:center;color:var(--muted);font-size:12px}.curated-local-favorites-empty strong{color:var(--text);font-size:15px}.curated-favorite-count{display:inline;margin-left:5px;color:var(--muted);font-size:12px;font-weight:620;vertical-align:middle}
    @media(max-width:1180px){.curated-local-favorites-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:760px){.curated-local-favorites{padding:14px}.curated-local-favorites-grid{grid-template-columns:1fr}.curated-local-favorites-head{align-items:flex-start;flex-direction:column}}
    @media(prefers-reduced-motion:reduce){.curated-star-button{transition:background .12s ease,color .12s ease!important;transform:none!important}}
  </style>
  <script>(function(){
    const root=document.querySelector('[data-curated-links-root]');
    if(!root)return;
    const anonymousStorageKey='qsseda.curatedLinks.favorites.v1';
    const accountStoragePrefix='qsseda.curatedLinks.favorites.user.';
    const origin=document.getElementById('curated-link-origin');
    const category=document.getElementById('curated-link-category');
    const search=document.getElementById('curated-link-search');
    const reset=document.getElementById('curated-link-reset');
    const resultCount=document.getElementById('curated-link-result-count');
    const resultLabel=document.getElementById('curated-link-result-label');
    const empty=document.getElementById('curated-links-empty');
    const featured=root.querySelector('[data-curated-featured-section]');
    const groups=Array.from(root.querySelectorAll('[data-curated-group]'));
    const primaryCards=groups.flatMap(group=>Array.from(group.querySelectorAll('[data-curated-card]')));
    let favorites=new Set();
    let accountUserId='';
    let syncSequence=0;

    function readSet(key){
      try{
        const stored=JSON.parse(localStorage.getItem(key)||'[]');
        return new Set(Array.isArray(stored)?stored.filter(value=>typeof value==='string'&&value.startsWith('https://')):[]);
      }catch{return new Set();}
    }
    function writeSet(key,set){try{localStorage.setItem(key,JSON.stringify(Array.from(set)));}catch{}}
    function accountStorageKey(userId){return accountStoragePrefix+userId+'.v1';}
    function activeStorageKey(){return accountUserId?accountStorageKey(accountUserId):anonymousStorageKey;}
    function persist(){writeSet(activeStorageKey(),favorites);}
    favorites=readSet(anonymousStorageKey);

    if(origin&&!Array.from(origin.options).some(option=>option.value==='favorite')){
      const option=document.createElement('option');
      option.value='favorite';
      option.textContent=${JSON.stringify(favoriteLabel)};
      origin.append(option);
    }

    const localSection=document.createElement('section');
    localSection.className='curated-local-favorites';
    localSection.dataset.curatedLocalFavorites='';
    localSection.innerHTML='<div class="curated-local-favorites-head"><h2>${favoriteLabel}<span class="curated-favorite-count" data-favorite-count>0</span></h2><p data-favorite-storage-label>${syncingLabel}</p></div><div class="curated-local-favorites-grid" data-favorite-grid></div><div class="curated-local-favorites-empty" data-favorite-empty><strong>${emptyLabel}</strong><span>${emptyHint}</span></div>';
    const nav=root.querySelector('.curated-link-nav');
    if(nav)nav.after(localSection);else if(featured)featured.before(localSection);else root.prepend(localSection);
    const favoriteGrid=localSection.querySelector('[data-favorite-grid]');
    const favoriteEmpty=localSection.querySelector('[data-favorite-empty]');
    const favoriteCount=localSection.querySelector('[data-favorite-count]');
    const storageLabel=localSection.querySelector('[data-favorite-storage-label]');

    function setStorageLabel(mode){
      storageLabel.textContent=mode==='cloud'?${JSON.stringify(cloudLabel)}:mode==='syncing'?${JSON.stringify(syncingLabel)}:mode==='error'?${JSON.stringify(errorLabel)}:${JSON.stringify(localLabel)};
    }
    function cardUrl(card){return String(card.getAttribute('href')||'');}
    function wrapCard(card){
      if(card.parentElement?.classList.contains('curated-link-card-wrap'))return card.parentElement;
      const wrapper=document.createElement('div');
      wrapper.className='curated-link-card-wrap';
      card.replaceWith(wrapper);wrapper.append(card);
      const button=document.createElement('button');
      button.type='button';button.className='curated-star-button';button.dataset.favoriteUrl=cardUrl(card);wrapper.append(button);
      return wrapper;
    }
    primaryCards.forEach(wrapCard);
    Array.from(root.querySelectorAll('[data-curated-featured-section] [data-curated-card]')).forEach(wrapCard);

    function syncButtons(){
      root.querySelectorAll('.curated-star-button').forEach(button=>{
        const active=favorites.has(button.dataset.favoriteUrl||'');
        button.setAttribute('aria-pressed',active?'true':'false');
        button.setAttribute('aria-label',active?${JSON.stringify(removeLabel)}:${JSON.stringify(addLabel)});
        button.title=active?${JSON.stringify(removeLabel)}:${JSON.stringify(addLabel)};
        button.textContent=active?'★':'☆';
      });
      favoriteCount.textContent=String(favorites.size);
    }
    function matchesFavoriteView(card){
      const query=String(search?.value||'').trim().toLocaleLowerCase();
      const categoryValue=category?.value||'all';
      if(query&&!String(card.dataset.curatedSearch||'').toLocaleLowerCase().includes(query))return false;
      if(categoryValue!=='all'&&card.dataset.curatedCategory!==categoryValue)return false;
      return favorites.has(cardUrl(card));
    }
    function renderFavorites(){
      favoriteGrid.innerHTML='';
      const matched=primaryCards.filter(matchesFavoriteView);
      matched.forEach(card=>{
        const clone=card.cloneNode(true);clone.hidden=false;
        const wrapper=document.createElement('div');wrapper.className='curated-link-card-wrap';wrapper.append(clone);
        const button=document.createElement('button');button.type='button';button.className='curated-star-button';button.dataset.favoriteUrl=cardUrl(card);wrapper.append(button);
        favoriteGrid.append(wrapper);
      });
      favoriteGrid.hidden=matched.length===0;favoriteEmpty.hidden=matched.length!==0;syncButtons();return matched.length;
    }
    function applyFavoriteMode(){
      const favoriteMode=origin?.value==='favorite';
      const noOtherFilters=!String(search?.value||'').trim()&&(category?.value||'all')==='all'&&(origin?.value||'all')==='all';
      const matched=renderFavorites();
      localSection.classList.toggle('is-visible',favoriteMode||favorites.size>0&&noOtherFilters);
      if(favoriteMode){
        groups.forEach(group=>group.hidden=true);if(featured)featured.hidden=true;
        if(resultCount)resultCount.textContent=String(matched);if(resultLabel)resultLabel.textContent=${zh ? "' 个星标'" : "' favorites'"};if(empty)empty.classList.remove('is-visible');
      }
    }
    function refresh(){syncButtons();applyFavoriteMode();}

    async function api(pathOptions={}){
      const response=await fetch('/api/curated-favorites',{
        credentials:'same-origin',cache:'no-store',...pathOptions,
        headers:{Accept:'application/json',...(pathOptions.body?{'Content-Type':'application/json'}:{}),...(pathOptions.headers||{})}
      });
      const payload=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(payload?.error||'Favorites request failed');
      return payload;
    }

    async function loadAccountFavorites(){
      const sequence=++syncSequence;setStorageLabel('syncing');refresh();
      try{
        const payload=await api();
        if(sequence!==syncSequence)return;
        accountUserId=String(payload?.user_id||'');
        if(!accountUserId)throw new Error('Missing account');
        const cloud=new Set(Array.isArray(payload?.urls)?payload.urls.filter(Boolean):[]);
        const cached=readSet(accountStorageKey(accountUserId));
        const anonymous=readSet(anonymousStorageKey);
        const toMerge=new Set([...cached,...anonymous]);
        const missing=Array.from(toMerge).filter(url=>!cloud.has(url));
        if(missing.length){
          await api({method:'PUT',body:JSON.stringify({urls:missing})});
          missing.forEach(url=>cloud.add(url));
        }
        if(sequence!==syncSequence)return;
        favorites=cloud;writeSet(accountStorageKey(accountUserId),favorites);
        try{localStorage.removeItem(anonymousStorageKey);}catch{}
        setStorageLabel('cloud');refresh();
      }catch(error){
        console.error('Favorite account sync failed',error);accountUserId='';favorites=readSet(anonymousStorageKey);setStorageLabel('error');refresh();
      }
    }

    async function syncToggle(url,shouldFavorite,previous){
      try{
        if(!accountUserId)throw new Error('Account not ready');
        await api({method:'POST',body:JSON.stringify({url,favorite:shouldFavorite})});
        setStorageLabel('cloud');
      }catch(error){
        console.error('Favorite write failed',error);favorites=new Set(previous);persist();setStorageLabel('error');refresh();
      }
    }

    root.addEventListener('click',event=>{
      const button=event.target.closest('.curated-star-button');if(!button)return;
      event.preventDefault();event.stopPropagation();const url=button.dataset.favoriteUrl||'';if(!url)return;
      const previous=new Set(favorites);const shouldFavorite=!favorites.has(url);
      if(shouldFavorite)favorites.add(url);else favorites.delete(url);persist();refresh();syncToggle(url,shouldFavorite,previous);
    });
    search?.addEventListener('input',applyFavoriteMode);category?.addEventListener('change',applyFavoriteMode);origin?.addEventListener('change',applyFavoriteMode);reset?.addEventListener('click',()=>setTimeout(applyFavoriteMode,0));
    window.addEventListener('storage',event=>{if(event.key!==activeStorageKey())return;favorites=readSet(activeStorageKey());refresh();});

    refresh();setStorageLabel('syncing');
    if(document.readyState==='complete')loadAccountFavorites();else window.addEventListener('load',loadAccountFavorites,{once:true});
  })();</script>`;
}
