export function curatedLinksFavoritesEnhancer(zh) {
  const favoriteLabel = zh ? "我的星标" : "My favorites";
  const emptyLabel = zh ? "还没有星标链接" : "No favorites yet";
  const emptyHint = zh ? "点击任意链接右上角的星标，就会固定到这里。" : "Use the star on any link to pin it here.";
  const addLabel = zh ? "加入星标" : "Add to favorites";
  const removeLabel = zh ? "取消星标" : "Remove from favorites";

  return `<style>
    .curated-link-card-wrap{position:relative;min-width:0}.curated-link-card-wrap>.curated-link-card{height:100%}.curated-star-button{position:absolute;z-index:2;top:10px;right:38px;display:grid;place-items:center;width:30px!important;min-width:30px!important;height:30px!important;min-height:30px!important;margin:0!important;padding:0!important;border:1px solid color-mix(in srgb,var(--border) 86%,transparent)!important;border-radius:999px!important;background:color-mix(in srgb,var(--card) 92%,transparent)!important;color:var(--quiet)!important;box-shadow:0 2px 10px color-mix(in srgb,#000 8%,transparent)!important;font-size:16px!important;line-height:1!important;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);transition:transform .14s ease,border-color .14s ease,background .14s ease,color .14s ease!important}.curated-star-button:hover{transform:scale(1.06);border-color:color-mix(in srgb,var(--primary) 38%,var(--border))!important;color:var(--primary)!important}.curated-star-button[aria-pressed="true"]{border-color:color-mix(in srgb,var(--primary) 44%,var(--border))!important;background:color-mix(in srgb,var(--primary) 11%,var(--card))!important;color:var(--primary)!important}.curated-star-button:focus-visible{outline:2px solid var(--primary)!important;outline-offset:2px}.curated-local-favorites{display:none;padding:20px;border:1px solid color-mix(in srgb,var(--primary) 26%,var(--border));border-radius:22px;background:linear-gradient(135deg,color-mix(in srgb,var(--primary) 6%,var(--card)),var(--card));box-shadow:var(--shadow-soft)}.curated-local-favorites.is-visible{display:block}.curated-local-favorites-head{display:flex;justify-content:space-between;align-items:end;gap:12px;margin-bottom:13px}.curated-local-favorites-head h2{margin:0;font-size:21px}.curated-local-favorites-head p{margin:0;color:var(--muted);font-size:12px}.curated-local-favorites-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.curated-local-favorites-empty{display:grid;place-items:center;gap:6px;min-height:120px;padding:20px;text-align:center;color:var(--muted);font-size:12px}.curated-local-favorites-empty strong{color:var(--text);font-size:15px}.curated-favorite-count{display:inline-grid;place-items:center;min-width:24px;height:24px;padding:0 7px;margin-left:6px;border-radius:999px;background:var(--surface-soft);color:var(--muted);font-size:11px;vertical-align:middle}
    @media(max-width:1180px){.curated-local-favorites-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:760px){.curated-local-favorites{padding:15px}.curated-local-favorites-grid{grid-template-columns:1fr}.curated-local-favorites-head{align-items:flex-start;flex-direction:column}}
  </style>
  <script>(function(){
    const root=document.querySelector('[data-curated-links-root]');
    if(!root)return;
    const storageKey='qsseda.curatedLinks.favorites.v1';
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

    try{
      const stored=JSON.parse(localStorage.getItem(storageKey)||'[]');
      if(Array.isArray(stored))favorites=new Set(stored.filter(value=>typeof value==='string'));
    }catch{}

    if(origin&&!Array.from(origin.options).some(option=>option.value==='favorite')){
      const option=document.createElement('option');
      option.value='favorite';
      option.textContent=${JSON.stringify(favoriteLabel)};
      origin.append(option);
    }

    const localSection=document.createElement('section');
    localSection.className='curated-local-favorites';
    localSection.dataset.curatedLocalFavorites='';
    localSection.innerHTML='<div class="curated-local-favorites-head"><h2>${favoriteLabel}<span class="curated-favorite-count" data-favorite-count>0</span></h2><p>${zh ? "仅保存在当前浏览器" : "Stored only in this browser"}</p></div><div class="curated-local-favorites-grid" data-favorite-grid></div><div class="curated-local-favorites-empty" data-favorite-empty><strong>${emptyLabel}</strong><span>${emptyHint}</span></div>';
    const nav=root.querySelector('.curated-link-nav');
    if(nav)nav.after(localSection);else if(featured)featured.before(localSection);else root.prepend(localSection);
    const favoriteGrid=localSection.querySelector('[data-favorite-grid]');
    const favoriteEmpty=localSection.querySelector('[data-favorite-empty]');
    const favoriteCount=localSection.querySelector('[data-favorite-count]');

    function cardUrl(card){return String(card.getAttribute('href')||'');}
    function wrapCard(card){
      if(card.parentElement?.classList.contains('curated-link-card-wrap'))return card.parentElement;
      const wrapper=document.createElement('div');
      wrapper.className='curated-link-card-wrap';
      card.replaceWith(wrapper);
      wrapper.append(card);
      const button=document.createElement('button');
      button.type='button';
      button.className='curated-star-button';
      button.dataset.favoriteUrl=cardUrl(card);
      wrapper.append(button);
      return wrapper;
    }

    primaryCards.forEach(wrapCard);
    Array.from(root.querySelectorAll('[data-curated-featured-section] [data-curated-card]')).forEach(wrapCard);

    function persist(){
      try{localStorage.setItem(storageKey,JSON.stringify(Array.from(favorites)));}catch{}
    }
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
        const clone=card.cloneNode(true);
        clone.hidden=false;
        const wrapper=document.createElement('div');
        wrapper.className='curated-link-card-wrap';
        wrapper.append(clone);
        const button=document.createElement('button');
        button.type='button';
        button.className='curated-star-button';
        button.dataset.favoriteUrl=cardUrl(card);
        wrapper.append(button);
        favoriteGrid.append(wrapper);
      });
      favoriteGrid.hidden=matched.length===0;
      favoriteEmpty.hidden=matched.length!==0;
      syncButtons();
      return matched.length;
    }
    function applyFavoriteMode(){
      const favoriteMode=origin?.value==='favorite';
      const noOtherFilters=!String(search?.value||'').trim()&&(category?.value||'all')==='all'&&(origin?.value||'all')==='all';
      const matched=renderFavorites();
      localSection.classList.toggle('is-visible',favoriteMode||favorites.size>0&&noOtherFilters);
      if(favoriteMode){
        groups.forEach(group=>group.hidden=true);
        if(featured)featured.hidden=true;
        if(resultCount)resultCount.textContent=String(matched);
        if(resultLabel)resultLabel.textContent=${zh ? "'条星标结果'" : "'favorite results'"};
        if(empty)empty.classList.remove('is-visible');
      }
    }
    function refresh(){
      syncButtons();
      applyFavoriteMode();
    }

    root.addEventListener('click',event=>{
      const button=event.target.closest('.curated-star-button');
      if(!button)return;
      event.preventDefault();
      event.stopPropagation();
      const url=button.dataset.favoriteUrl||'';
      if(!url)return;
      if(favorites.has(url))favorites.delete(url);else favorites.add(url);
      persist();
      refresh();
    });
    search?.addEventListener('input',applyFavoriteMode);
    category?.addEventListener('change',applyFavoriteMode);
    origin?.addEventListener('change',applyFavoriteMode);
    reset?.addEventListener('click',()=>setTimeout(applyFavoriteMode,0));
    window.addEventListener('storage',event=>{
      if(event.key!==storageKey)return;
      try{const next=JSON.parse(event.newValue||'[]');favorites=new Set(Array.isArray(next)?next:[]);}catch{favorites=new Set();}
      refresh();
    });
    refresh();
  })();</script>`;
}
