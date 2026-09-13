import { CURATED_LINK_CATEGORIES, CURATED_LINKS_CORE } from "./curated-links-core.js";
import { CURATED_LINKS_EXTRA } from "./curated-links-extra.js";
import { escapeHtmlText } from "./html-utils.js";

const CURATED_LINKS = [...CURATED_LINKS_CORE, ...CURATED_LINKS_EXTRA];

function safeUrl(value) {
  const text = String(value || "").trim();
  return /^https:\/\//i.test(text) ? text : "#";
}

function originLabel(origin, zh) {
  if (origin === "chat") return zh ? "对话中提到" : "From chats";
  return zh ? "相关官方 / 精选" : "Related / official";
}

function renderLink(link, zh) {
  const description = zh ? link.zh : link.en;
  return `<a class="curated-link-card${link.featured ? " is-featured" : ""}" href="${escapeHtmlText(safeUrl(link.url))}" target="_blank" rel="noopener noreferrer">
    <div class="curated-link-card-top"><strong>${escapeHtmlText(link.title)}</strong><span aria-hidden="true">↗</span></div>
    <p>${escapeHtmlText(description)}</p>
    <div class="curated-link-meta"><span>${escapeHtmlText(originLabel(link.origin, zh))}</span><code>${escapeHtmlText(new URL(safeUrl(link.url)).hostname.replace(/^www\./, ""))}</code></div>
  </a>`;
}

function renderCategory(category, zh) {
  const links = CURATED_LINKS.filter(link => link.category === category);
  if (!links.length) return "";
  const label = CURATED_LINK_CATEGORIES[category]?.[zh ? "zh" : "en"] || category;
  return `<section class="curated-link-group" id="links-${escapeHtmlText(category)}">
    <div class="curated-link-group-head"><div><small>${escapeHtmlText(label)}</small><h2>${escapeHtmlText(label)}</h2></div><span>${links.length}</span></div>
    <div class="curated-link-grid">${links.map(link => renderLink(link, zh)).join("")}</div>
  </section>`;
}

export function curatedLinksContent(zh) {
  const categories = Object.keys(CURATED_LINK_CATEGORIES).filter(category => CURATED_LINKS.some(link => link.category === category));
  const chatCount = CURATED_LINKS.filter(link => link.origin === "chat").length;
  const featured = CURATED_LINKS.filter(link => link.featured).slice(0, 12);
  const categoryNav = categories.map(category => {
    const label = CURATED_LINK_CATEGORIES[category]?.[zh ? "zh" : "en"] || category;
    const count = CURATED_LINKS.filter(link => link.category === category).length;
    return `<a href="#links-${escapeHtmlText(category)}"><span>${escapeHtmlText(label)}</span><b>${count}</b></a>`;
  }).join("");

  return `<style>
    .os-main:has(.curated-links-shell) .os-hero{margin-bottom:18px}.os-main:has(.curated-links-shell) .os-hero h1{font-size:clamp(36px,4.8vw,58px);letter-spacing:-.035em}
    .curated-links-shell{display:grid;gap:18px;min-width:0}.curated-links-overview{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(260px,.55fr);gap:18px;padding:24px;border:1px solid var(--border);border-radius:24px;background:linear-gradient(135deg,color-mix(in srgb,var(--primary) 8%,var(--card)),var(--card));box-shadow:var(--shadow-soft)}
    .curated-links-overview small,.curated-link-group-head small{color:var(--primary);font-weight:850}.curated-links-overview h2{margin:7px 0 10px;font-size:28px;letter-spacing:-.025em}.curated-links-overview p{max-width:760px;margin:0;color:var(--muted);line-height:1.65}.curated-links-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.curated-links-stat{padding:15px;border:1px solid var(--border);border-radius:16px;background:var(--surface-soft)}.curated-links-stat strong{display:block;font-size:26px;letter-spacing:-.03em}.curated-links-stat span{display:block;margin-top:4px;color:var(--muted);font-size:12px}
    .curated-link-nav{display:flex;flex-wrap:wrap;gap:8px}.curated-link-nav a{display:inline-flex;align-items:center;gap:8px;min-height:38px;padding:0 12px;border:1px solid var(--border);border-radius:999px;background:var(--card);color:var(--text);text-decoration:none;font-size:13px;font-weight:750}.curated-link-nav a:hover{border-color:var(--border-strong);background:var(--surface-soft)}.curated-link-nav b{display:grid;place-items:center;min-width:22px;height:22px;padding:0 6px;border-radius:999px;background:var(--surface-soft);color:var(--muted);font-size:11px}
    .curated-featured{padding:20px;border:1px solid var(--border);border-radius:22px;background:var(--card);box-shadow:var(--shadow-soft)}.curated-featured-head{display:flex;justify-content:space-between;gap:12px;align-items:end;margin-bottom:13px}.curated-featured-head h2{margin:0;font-size:21px}.curated-featured-head p{margin:0;color:var(--muted);font-size:12px}.curated-featured-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.curated-featured .curated-link-card{min-height:146px}
    .curated-link-group{scroll-margin-top:24px;padding:20px;border:1px solid var(--border);border-radius:22px;background:var(--card);box-shadow:var(--shadow-soft)}.curated-link-group-head{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-bottom:14px}.curated-link-group-head h2{margin:3px 0 0;font-size:23px}.curated-link-group-head>span{display:grid;place-items:center;min-width:40px;height:30px;padding:0 10px;border-radius:999px;background:var(--surface-soft);color:var(--muted);font-size:12px;font-weight:800}
    .curated-link-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.curated-link-card{display:flex;min-width:0;min-height:162px;flex-direction:column;padding:16px;border:1px solid var(--border);border-radius:17px;background:color-mix(in srgb,var(--surface-soft) 66%,var(--card));color:var(--text);text-decoration:none;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease,background .16s ease}.curated-link-card:hover{transform:translateY(-2px);border-color:var(--border-strong);background:var(--card);box-shadow:var(--shadow-soft)}.curated-link-card.is-featured{border-color:color-mix(in srgb,var(--primary) 32%,var(--border));background:color-mix(in srgb,var(--primary) 5%,var(--card))}.curated-link-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.curated-link-card-top strong{min-width:0;font-size:15px;line-height:1.3}.curated-link-card-top span{flex:0 0 auto;color:var(--primary);font-size:16px}.curated-link-card p{margin:10px 0 14px;color:var(--muted);font-size:13px;line-height:1.5}.curated-link-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:auto;padding-top:10px;border-top:1px solid color-mix(in srgb,var(--border) 72%,transparent)}.curated-link-meta span{color:var(--primary);font-size:10px;font-weight:800}.curated-link-meta code{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--quiet);font:10px ui-monospace,SFMono-Regular,Menlo,monospace}
    .curated-links-note{padding:15px 17px;border:1px dashed var(--border-strong);border-radius:16px;color:var(--muted);font-size:12px;line-height:1.6}.curated-links-note strong{color:var(--text)}
    @media(max-width:1180px){.curated-featured-row{grid-template-columns:repeat(3,minmax(0,1fr))}.curated-link-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:760px){.curated-links-overview{grid-template-columns:1fr;padding:19px}.curated-links-stats{grid-template-columns:repeat(3,minmax(0,1fr))}.curated-featured-row,.curated-link-grid{grid-template-columns:1fr}.curated-featured,.curated-link-group{padding:15px}.curated-link-card{min-height:0}.curated-featured-head{align-items:flex-start;flex-direction:column}.curated-link-nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.curated-link-nav a{justify-content:space-between}}
  </style>
  <div class="curated-links-shell">
    <section class="curated-links-overview">
      <div><small>${zh ? "对话精选链接库" : "Curated from conversations"}</small><h2>${zh ? "把反复出现的项目和网站真正收进来" : "A real library of repeatedly useful projects and sites"}</h2><p>${zh ? "从历史对话中回收明确提到、使用、比较或研究过的 GitHub 项目、开发工具、AI/设计资源、云服务、Apple 生态与资料站点；同时补入少量与这些技术直接相关的官方文档入口。" : "Collected from projects, tools, services, and references explicitly discussed, used, compared, or researched in prior chats, with a small number of directly related official documentation links."}</p></div>
      <div class="curated-links-stats"><div class="curated-links-stat"><strong>${CURATED_LINKS.length}</strong><span>${zh ? "精选链接" : "curated links"}</span></div><div class="curated-links-stat"><strong>${chatCount}</strong><span>${zh ? "对话直接出现" : "directly from chats"}</span></div><div class="curated-links-stat"><strong>${categories.length}</strong><span>${zh ? "分类" : "categories"}</span></div></div>
    </section>
    <nav class="curated-link-nav" aria-label="${zh ? "链接分类" : "Link categories"}">${categoryNav}</nav>
    <section class="curated-featured"><div class="curated-featured-head"><h2>${zh ? "优先保留" : "Priority picks"}</h2><p>${zh ? "项目与对话中复用频率最高的一批入口" : "The most reusable entries across projects and chats"}</p></div><div class="curated-featured-row">${featured.map(link => renderLink(link, zh)).join("")}</div></section>
    ${categories.map(category => renderCategory(category, zh)).join("")}
    <div class="curated-links-note"><strong>${zh ? "数据说明：" : "Data note: "}</strong>${zh ? "这不是数据库里的“用户收藏记录”，因此不伪造收藏时间、点击次数或个人标签。标记“对话中提到”的条目来自历史交流；“相关官方 / 精选”是围绕已经出现过的技术补入的高质量入口。" : "These are not fabricated database bookmark records, so no fake saved timestamps, click counts, or personal tags are shown. “From chats” entries came from prior conversations; “Related / official” entries are high-quality primary references around technologies already discussed."}</div>
  </div>`;
}

export const CURATED_LINK_COUNT = CURATED_LINKS.length;
