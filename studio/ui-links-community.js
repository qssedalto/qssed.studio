export function enhanceLinksHubWithCommunity(content, zh) {
  const communityHref = zh ? "/zh-cn/info/links/community" : "/en/info/links/community";
  let output = String(content || "");

  const submitButton = zh
    ? '<button class="links-quick-submit" id="links-quick-submit" type="submit" disabled>新建链接</button>'
    : '<button class="links-quick-submit" id="links-quick-submit" type="submit" disabled>Create link</button>';
  const shareText = zh ? "同时发布到社区" : "Also publish to Community";
  const shareHint = zh
    ? "勾选后，这条链接仍属于你的账号，同时会公开出现在社区链接中。"
    : "When selected, the link still belongs to your account and is also published in Community Links.";

  output = output.replace(
    submitButton,
    `<div class="links-create-actions">${submitButton}<label class="links-community-option"><input id="links-community-opt-in" type="checkbox"><span><strong>${shareText}</strong><small>${shareHint}</small></span></label></div>`
  );

  output = output.replace(
    "body:JSON.stringify({ title:inferTitle(url), url, category:'tools', description:'' })",
    "body:JSON.stringify({ title:inferTitle(url), url, category:'tools', description:'', community:Boolean(document.getElementById('links-community-opt-in')?.checked) })"
  );

  const curatedNeedle = zh
    ? '<a class="links-route-card" href="/zh-cn/info/links/curated">'
    : '<a class="links-route-card" href="/en/info/links/curated">';
  const communityCard = `
      <a class="links-route-card links-community-route-card" href="${communityHref}">
        <div>
          <span class="links-card-eyebrow">${zh ? "社区链接库" : "Community library"}</span>
          <h2>${zh ? "社区链接" : "Community links"}</h2>
          <p>${zh ? "浏览用户主动公开分享的链接。只有创建时明确勾选发布到社区的内容才会出现在这里。" : "Browse links users explicitly chose to share. Private links never appear here unless the creator opted in."}</p>
          <div class="links-route-meta"><strong>↗</strong><span>${zh ? "用户公开分享" : "shared by users"}</span></div>
        </div>
        <span class="links-route-arrow" aria-hidden="true">→</span>
      </a>

      `;
  output = output.replace(curatedNeedle, communityCard + curatedNeedle);

  output += `
    <style>
      .links-create-actions{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
      .links-community-option{display:flex;align-items:center;gap:9px;min-height:48px;padding:7px 11px;border-radius:13px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border);cursor:pointer;user-select:none}
      .links-community-option input{width:18px;height:18px;margin:0;accent-color:var(--primary)}
      .links-community-option span{display:grid;gap:1px}.links-community-option strong{font-size:12px}.links-community-option small{max-width:430px;color:var(--muted);font-size:10px;line-height:1.35}
      @media(max-width:700px){.links-create-actions{align-items:stretch;flex-direction:column}.links-community-option{width:100%}}
    </style>
  `;
  return output;
}

export function communityLinksPageContent(zh) {
  const backHref = zh ? "/zh-cn/info/links" : "/en/info/links";
  const copy = zh ? {
    eyebrow: "社区链接库",
    title: "社区链接",
    intro: "这里仅展示用户主动选择公开到社区的链接。私人链接和未公开内容不会出现在社区搜索结果中。",
    back: "返回收藏链接",
    search: "搜索社区链接",
    loading: "正在读取社区链接…",
    empty: "社区里还没有公开链接。",
    noResults: "没有符合搜索条件的社区链接。",
    owner: "分享者",
    count: "社区链接"
  } : {
    eyebrow: "Community library",
    title: "Community links",
    intro: "Only links explicitly shared by their creators appear here. Private and non-shared links never enter Community search results.",
    back: "Back to Saved Links",
    search: "Search community links",
    loading: "Loading community links…",
    empty: "No links have been shared to the community yet.",
    noResults: "No community links match your search.",
    owner: "Shared by",
    count: "community links"
  };

  return `
    <style>
      .community-links-shell{border:1px solid var(--border);border-radius:22px;background:var(--card);overflow:hidden}
      .community-links-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;padding:22px 24px;border-bottom:1px solid var(--hairline)}
      .community-links-head small{display:block;color:var(--muted);font-size:11px;font-weight:680}.community-links-head h2{margin:5px 0 7px;font-size:25px;letter-spacing:-.035em}.community-links-head p{max-width:850px;margin:0;color:var(--muted);font-size:13px;line-height:1.55}
      .community-links-back{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 11px;border-radius:10px;background:var(--fill);color:var(--text);text-decoration:none;font-size:12px;font-weight:650}.community-links-back:hover{background:var(--secondary)}
      .community-links-body{padding:18px}.community-search-shell{display:flex;align-items:center;gap:9px;min-height:46px;padding:0 12px;border-radius:12px;background:var(--surface);box-shadow:inset 0 0 0 1px var(--border)}.community-search-shell:focus-within{box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 14%,transparent),inset 0 0 0 1px var(--primary)}
      .community-search-shell svg{width:17px;height:17px;flex:0 0 auto;fill:none;stroke:var(--muted);stroke-width:1.8;stroke-linecap:round}.community-search-shell input{width:100%;height:44px;margin:0!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;color:var(--text)!important;font-size:14px!important;outline:none!important}.community-search-shell kbd{display:grid;place-items:center;min-width:24px;height:24px;padding:0 6px;border-radius:6px;background:var(--fill);color:var(--quiet);font:11px ui-monospace,SFMono-Regular,Menlo,monospace}
      .community-count{display:flex;align-items:center;gap:6px;margin:12px 2px;color:var(--muted);font-size:11px}.community-count strong{display:grid;place-items:center;min-width:30px;height:26px;padding:0 9px;border-radius:999px;background:var(--fill);color:var(--text);font-size:12px}
      .community-links-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.community-link-card{display:flex;min-width:0;min-height:150px;flex-direction:column;padding:14px;border-radius:14px;background:var(--fill);color:var(--text);text-decoration:none;box-shadow:inset 0 0 0 1px var(--border)}.community-link-card:hover{background:var(--secondary)}.community-link-card-top{display:flex;justify-content:space-between;gap:10px}.community-link-card-top strong{font-size:14px;line-height:1.3}.community-link-card-top span{color:var(--primary)}.community-link-card p{margin:8px 0 12px;color:var(--muted);font-size:12.5px;line-height:1.45}.community-link-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:auto;color:var(--quiet)}.community-link-meta span{font-size:10px}.community-link-meta code{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:10px ui-monospace,SFMono-Regular,Menlo,monospace}
      .community-empty{display:grid;place-items:center;min-height:180px;padding:28px;border-radius:16px;background:var(--fill);color:var(--muted);font-size:12px;text-align:center}.community-empty[hidden]{display:none}
      @media(max-width:980px){.community-links-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:700px){.community-links-head{align-items:flex-start;flex-direction:column;padding:18px}.community-links-body{padding:12px}.community-links-grid{grid-template-columns:1fr}.community-search-shell kbd{display:none}}
    </style>
    <section class="community-links-shell">
      <header class="community-links-head">
        <div><small>${copy.eyebrow}</small><h2>${copy.title}</h2><p>${copy.intro}</p></div>
        <a class="community-links-back" href="${backHref}">← ${copy.back}</a>
      </header>
      <div class="community-links-body">
        <div class="community-search-shell"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path></svg><input id="community-link-search" type="search" autocomplete="off" placeholder="${copy.search}" aria-label="${copy.search}"><kbd aria-hidden="true">/</kbd></div>
        <div class="community-count"><strong id="community-link-count">0</strong><span>${copy.count}</span></div>
        <div class="community-links-grid" id="community-links-grid"></div>
        <div class="community-empty" id="community-links-empty">${copy.loading}</div>
      </div>
    </section>
    <script>
      (() => {
        const copy=${JSON.stringify(copy)};
        let links=[];
        const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
        const host=value=>{try{return new URL(value).hostname.replace(/^www\./,'')}catch{return 'external'}};
        async function session(){if(typeof supabaseClient==='undefined')return null;const result=await supabaseClient.auth.getSession();return result?.data?.session||null;}
        function draw(){const search=document.getElementById('community-link-search');const grid=document.getElementById('community-links-grid');const empty=document.getElementById('community-links-empty');const count=document.getElementById('community-link-count');if(!grid||!empty)return;const q=String(search?.value||'').trim().toLocaleLowerCase();const visible=links.filter(link=>!q||[link.title,link.description,link.url,link.owner_label].join(' ').toLocaleLowerCase().includes(q));grid.innerHTML=visible.map(link=>'<a class="community-link-card" href="'+esc(link.url)+'" target="_blank" rel="noopener noreferrer"><div class="community-link-card-top"><strong>'+esc(link.title)+'</strong><span>↗</span></div><p>'+esc(link.description||link.url)+'</p><div class="community-link-meta"><span>'+esc(copy.owner)+' '+esc(link.owner_label||'')+'</span><code>'+esc(host(link.url))+'</code></div></a>').join('');empty.hidden=visible.length>0;empty.textContent=links.length?copy.noResults:copy.empty;if(count)count.textContent=String(links.length);}
        async function init(){const s=await session();const empty=document.getElementById('community-links-empty');if(!s){if(empty)empty.textContent=${JSON.stringify(zh ? "请先登录后查看社区链接。" : "Sign in to view community links.")};return;}try{const response=await fetch('/api/user-links?scope=community',{headers:{Authorization:'Bearer '+s.access_token,Accept:'application/json'},cache:'no-store'});if(!response.ok)throw new Error('HTTP '+response.status);const payload=await response.json();links=Array.isArray(payload.links)?payload.links:[];const search=document.getElementById('community-link-search');search?.addEventListener('input',draw);document.addEventListener('keydown',event=>{const target=event.target;const typing=target instanceof HTMLInputElement||target instanceof HTMLTextAreaElement||target instanceof HTMLSelectElement||target?.isContentEditable;if(event.key==='/'&&!typing){event.preventDefault();search?.focus();}if(event.key==='Escape'&&document.activeElement===search&&search?.value){search.value='';draw();}});draw();}catch(error){console.error('Community links failed',error);if(empty)empty.textContent=${JSON.stringify(zh ? "当前无法读取社区链接。" : "Community links are currently unavailable.")};}}
        if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',init,{once:true});else window.setTimeout(init,0);
      })();
    </script>
  `;
}
