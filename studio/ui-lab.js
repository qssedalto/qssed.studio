import { LAB_TOOL_CATEGORIES, LAB_TOOLS } from "./lab-tools.js";
import { escapeHtmlText } from "./html-utils.js";

export function labContent(zh) {
  const copy = zh ? {
    eyebrow: "工作区 · 实验室",
    title: "实验室",
    intro: "这里作为 TeX、AI、媒体处理与工程工具的统一容器。已经可用的 Studio 能力可以直接打开，尚未实现的工具会明确标记为规划中。",
    search: "搜索工具、能力或分类…",
    all: "全部",
    ready: "可用",
    planned: "规划中",
    tools: "工具",
    categories: "分类",
    readyCount: "可用工具",
    plannedCount: "规划工具",
    open: "打开工具",
    plannedAction: "尚未开放",
    empty: "没有匹配的工具",
    emptyDetail: "换一个关键词或分类。",
    registry: "工具注册中心",
    registryIntro: "实验室本身不存储业务数据；每个工具继续使用自己的账号数据和权限边界。"
  } : {
    eyebrow: "Workspace · Lab",
    title: "Lab",
    intro: "A unified container for TeX, AI, media processing, and engineering tools. Live Studio capabilities open directly; future tools are clearly marked as planned.",
    search: "Search tools, capabilities, or categories…",
    all: "All",
    ready: "Ready",
    planned: "Planned",
    tools: "tools",
    categories: "categories",
    readyCount: "ready tools",
    plannedCount: "planned tools",
    open: "Open tool",
    plannedAction: "Not available yet",
    empty: "No matching tools",
    emptyDetail: "Try another keyword or category.",
    registry: "Tool Registry",
    registryIntro: "Lab does not store business data itself; each tool keeps its own account data and permission boundaries."
  };

  const localeKey = zh ? "zh" : "en";
  const categories = Object.entries(LAB_TOOL_CATEGORIES).filter(([id]) => LAB_TOOLS.some(tool => tool.category === id));
  const readyCount = LAB_TOOLS.filter(tool => tool.status === "ready").length;
  const plannedCount = LAB_TOOLS.filter(tool => tool.status === "planned").length;
  const categoryButtons = categories.map(([id, labels]) => `<button type="button" data-lab-category="${escapeHtmlText(id)}">${escapeHtmlText(labels[localeKey])}<b>${LAB_TOOLS.filter(tool => tool.category === id).length}</b></button>`).join("");
  const cards = LAB_TOOLS.map(tool => renderTool(tool, localeKey, copy)).join("");

  return `
    <section class="lab-shell" data-lab-root>
      <div class="lab-hero">
        <div><span>${copy.eyebrow}</span><h2>${copy.title}</h2><p>${copy.intro}</p></div>
        <div class="lab-hero-stats">
          <div><strong>${LAB_TOOLS.length}</strong><span>${copy.tools}</span></div>
          <div><strong>${categories.length}</strong><span>${copy.categories}</span></div>
          <div><strong>${readyCount}</strong><span>${copy.readyCount}</span></div>
          <div><strong>${plannedCount}</strong><span>${copy.plannedCount}</span></div>
        </div>
      </div>

      <div class="lab-registry-note"><div><strong>${copy.registry}</strong><p>${copy.registryIntro}</p></div><span>Registry v1</span></div>

      <div class="lab-controls">
        <div class="lab-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path></svg><input id="lab-search" type="search" autocomplete="off" spellcheck="false" placeholder="${copy.search}" aria-label="${copy.search}"></div>
        <div class="lab-filter-row">
          <div class="lab-status-filters"><button class="is-active" type="button" data-lab-status="all">${copy.all}</button><button type="button" data-lab-status="ready">${copy.ready}</button><button type="button" data-lab-status="planned">${copy.planned}</button></div>
          <div class="lab-category-filters"><button class="is-active" type="button" data-lab-category="all">${copy.all}</button>${categoryButtons}</div>
        </div>
      </div>

      <div id="lab-grid" class="lab-grid">${cards}</div>
      <div id="lab-empty" class="lab-empty" hidden><strong>${copy.empty}</strong><span>${copy.emptyDetail}</span></div>
    </section>

    <style>
      .lab-shell{display:grid;gap:14px;min-width:0}.lab-hero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px;align-items:center;padding:23px;border:1px solid var(--border);border-radius:21px;background:var(--card)}.lab-hero>div:first-child>span{display:block;color:var(--muted);font-size:11px;font-weight:700}.lab-hero h2{margin:5px 0 7px;font-size:29px;letter-spacing:-.042em}.lab-hero p{max-width:780px;margin:0;color:var(--muted);font-size:13px;line-height:1.58}.lab-hero-stats{display:grid;grid-template-columns:repeat(2,minmax(96px,1fr));gap:8px}.lab-hero-stats div{padding:11px 13px;border-radius:13px;background:var(--fill)}.lab-hero-stats strong{display:block;font-size:20px;letter-spacing:-.035em}.lab-hero-stats span{display:block;margin-top:2px;color:var(--muted);font-size:9px}.lab-registry-note{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:13px 15px;border-radius:15px;background:var(--fill)}.lab-registry-note strong{font-size:12px}.lab-registry-note p{margin:3px 0 0;color:var(--muted);font-size:10px;line-height:1.45}.lab-registry-note>span{flex:0 0 auto;padding:5px 8px;border-radius:8px;background:var(--surface);color:var(--quiet);font:9px ui-monospace,SFMono-Regular,Menlo,monospace}
      .lab-controls{display:grid;gap:8px;padding:10px;border:1px solid var(--border);border-radius:17px;background:var(--card)}.lab-search{display:flex;align-items:center;gap:9px;padding:0 11px;border-radius:11px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border)}.lab-search svg{width:16px;height:16px;fill:none;stroke:var(--muted);stroke-width:1.8;stroke-linecap:round}.lab-search input{width:100%;height:42px;min-height:0;margin:0;padding:0;border:0!important;background:transparent!important;box-shadow:none!important;font-size:12px}.lab-filter-row{display:flex;align-items:center;justify-content:space-between;gap:10px}.lab-status-filters,.lab-category-filters{display:flex;gap:5px;overflow:auto;scrollbar-width:none}.lab-status-filters::-webkit-scrollbar,.lab-category-filters::-webkit-scrollbar{display:none}.lab-filter-row button{display:inline-flex;align-items:center;gap:6px;width:auto!important;min-width:max-content!important;min-height:32px!important;margin:0!important;padding:0 9px!important;border:0!important;border-radius:9px!important;background:transparent!important;color:var(--muted)!important;box-shadow:none!important;font-size:10px!important;font-weight:650!important}.lab-filter-row button:hover,.lab-filter-row button.is-active{background:var(--fill)!important;color:var(--text)!important}.lab-filter-row b{color:var(--quiet);font-size:8px}
      .lab-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.lab-card{display:flex;min-width:0;min-height:210px;flex-direction:column;padding:15px;border:1px solid var(--border);border-radius:16px;background:var(--card);color:var(--text);text-decoration:none}.lab-card.is-planned{opacity:.78}.lab-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.lab-card-kicker{display:flex;align-items:center;gap:6px;color:var(--muted);font-size:9px}.lab-status{padding:3px 6px;border-radius:999px;background:var(--fill);font-size:8px;font-weight:700}.lab-status.is-ready{background:color-mix(in srgb,var(--primary) 10%,var(--fill));color:var(--primary)}.lab-status.is-planned{color:var(--quiet)}.lab-card h3{margin:13px 0 0;font-size:16px;letter-spacing:-.025em}.lab-card>p{margin:7px 0 0;color:var(--muted);font-size:11px;line-height:1.5}.lab-capabilities{display:flex;flex-wrap:wrap;gap:5px;margin-top:12px}.lab-capabilities span{padding:4px 7px;border-radius:8px;background:var(--fill);color:var(--muted);font-size:8px}.lab-card-action{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:auto;padding-top:14px;color:var(--primary);font-size:10px;font-weight:680}.lab-card.is-planned .lab-card-action{color:var(--quiet)}.lab-empty{display:grid;place-items:center;gap:5px;min-height:180px;padding:30px;border:1px solid var(--border);border-radius:17px;background:var(--card);text-align:center}.lab-empty[hidden]{display:none}.lab-empty strong{font-size:13px}.lab-empty span{color:var(--muted);font-size:10px}
      @media(max-width:1000px){.lab-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.lab-hero{grid-template-columns:1fr}.lab-hero-stats{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:700px){.lab-grid{grid-template-columns:1fr}.lab-hero{padding:18px}.lab-hero-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.lab-filter-row{align-items:stretch;flex-direction:column}}
    </style>

    <script>
      (()=>{
        const start=()=>{
          const root=document.querySelector('[data-lab-root]');if(!root)return;
          const search=document.getElementById('lab-search');const grid=document.getElementById('lab-grid');const empty=document.getElementById('lab-empty');let status='all';let category='all';
          const prefix=location.pathname.startsWith('/zh-cn/')?'/zh-cn':location.pathname.startsWith('/en/')?'/en':'';
          grid.querySelectorAll('[data-lab-href]').forEach(card=>{const path=card.dataset.labHref||'';if(path)card.setAttribute('href',prefix+path);});
          function apply(){const query=search.value.trim().toLocaleLowerCase();let visible=0;grid.querySelectorAll('[data-lab-card]').forEach(card=>{const matchStatus=status==='all'||card.dataset.labStatus===status;const matchCategory=category==='all'||card.dataset.labCategory===category;const matchSearch=!query||(card.dataset.labSearch||'').includes(query);const show=matchStatus&&matchCategory&&matchSearch;card.hidden=!show;if(show)visible+=1;});empty.hidden=visible>0;}
          search.addEventListener('input',apply);document.querySelectorAll('[data-lab-status]').forEach(button=>button.addEventListener('click',()=>{status=button.dataset.labStatus||'all';document.querySelectorAll('[data-lab-status]').forEach(item=>item.classList.toggle('is-active',item===button));apply();}));document.querySelectorAll('[data-lab-category]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.labCategory||'all';document.querySelectorAll('[data-lab-category]').forEach(item=>item.classList.toggle('is-active',item===button));apply();}));apply();
        };window.setTimeout(start,0);
      })();
    </script>
  `;
}

function renderTool(tool, localeKey, copy) {
  const category = LAB_TOOL_CATEGORIES[tool.category]?.[localeKey] || tool.category;
  const title = tool.title?.[localeKey] || tool.id;
  const description = tool.description?.[localeKey] || "";
  const capabilities = Array.isArray(tool.capabilities?.[localeKey]) ? tool.capabilities[localeKey] : [];
  const statusLabel = tool.status === "ready" ? copy.ready : copy.planned;
  const action = tool.status === "ready" ? copy.open : copy.plannedAction;
  const searchText = [title, description, category, ...capabilities].join(" ").toLocaleLowerCase();
  const tag = tool.status === "ready" && tool.href ? "a" : "article";
  const href = tag === "a" ? ` href="#" data-lab-href="${escapeHtmlText(tool.href)}"` : "";
  return `<${tag}${href} class="lab-card ${tool.status === "ready" ? "is-ready" : "is-planned"}" data-lab-card data-lab-status="${escapeHtmlText(tool.status)}" data-lab-category="${escapeHtmlText(tool.category)}" data-lab-search="${escapeHtmlText(searchText)}">
    <div class="lab-card-top"><div class="lab-card-kicker"><span>${escapeHtmlText(category)}</span></div><span class="lab-status ${tool.status === "ready" ? "is-ready" : "is-planned"}">${escapeHtmlText(statusLabel)}</span></div>
    <h3>${escapeHtmlText(title)}</h3><p>${escapeHtmlText(description)}</p>
    <div class="lab-capabilities">${capabilities.map(item => `<span>${escapeHtmlText(item)}</span>`).join("")}</div>
    <div class="lab-card-action"><span>${escapeHtmlText(action)}</span><span>${tool.status === "ready" ? "↗" : "—"}</span></div>
  </${tag}>`;
}
