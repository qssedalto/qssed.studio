import { FAVICON_LINKS } from "./favicon.js";
import { localeDirection } from "./locale.js";
import {
  QUESTION_CATEGORIES,
  QUESTION_INDEX_LOCALES,
  publishedQuestions,
  questionById,
  questionContentLocale,
  questionRouteLocale,
  questionTranslation
} from "./public-questions.js";

const UI = {
  "zh-cn":{
    site:"AERTEX Questions",
    home:"AERTEX",
    title:"问题与解答",
    lead:"这里记录 AERTEX 当前产品的官方事实、功能边界和容易被搜索引擎或 AI 误解的问题。",
    search:"搜索问题、产品或关键词",
    all:"全部",
    noResults:"没有找到匹配的问题。",
    updated:"最后更新",
    back:"返回问题中心",
    related:"相关问题",
    current:"当前产品行为",
    note:"本页面描述当前已经实现或公开定义的产品行为；以后功能变化时，答案也会随之更新。",
    categories:{about:"关于 AERTEX",products:"产品",account:"账户与数据边界",watch:"AERTEX Watch",availability:"可用性与兼容性"}
  },
  "en-us":{
    site:"AERTEX Questions",
    home:"AERTEX",
    title:"Questions & Answers",
    lead:"Official AERTEX facts, product boundaries, and questions that search engines or AI systems can easily misunderstand.",
    search:"Search questions, products, or keywords",
    all:"All",
    noResults:"No matching questions found.",
    updated:"Last updated",
    back:"Back to Questions",
    related:"Related questions",
    current:"Current product behavior",
    note:"This page describes product behavior that is currently implemented or officially defined. Answers can change when the product changes.",
    categories:{about:"About AERTEX",products:"Products",account:"Account & data boundaries",watch:"AERTEX Watch",availability:"Availability & compatibility"}
  }
};

export function isQuestionRoute(pathname) {
  const path = String(pathname || "");
  return path === "/q" || /^\/q\/[0-9a-f-]{36}$/i.test(path);
}

export function questionRouteId(pathname) {
  const match = String(pathname || "").match(/^\/q\/([0-9a-f-]{36})$/i);
  return match ? match[1].toLowerCase() : "";
}

export function questionIndexPath(locale) {
  return "/" + questionRouteLocale(locale) + "/q";
}

export function questionDetailPath(locale, id) {
  return questionIndexPath(locale) + "/" + String(id || "").toLowerCase();
}

export function questionHubDescription(locale) {
  const ui = uiFor(locale);
  return ui.lead;
}

export function questionDetailDescription(locale, id) {
  const item = questionById(id);
  return questionTranslation(item, locale)?.short || "";
}

export function questionHubPage(locale) {
  const routeLocale = questionRouteLocale(locale);
  const contentLocale = questionContentLocale(routeLocale);
  const ui = UI[contentLocale] || UI["en-us"];
  const questions = publishedQuestions();
  const cards = questions.map(item => {
    const t = questionTranslation(item, routeLocale);
    if (!t) return "";
    return `<a class="q-card" href="${questionDetailPath(routeLocale,item.id)}" data-category="${escapeHtml(item.category)}" data-search="${escapeHtml((t.question+" "+t.short+" "+item.product).toLowerCase())}">
      <span class="q-meta">${escapeHtml(ui.categories[item.category] || item.category)} · ${escapeHtml(item.product)}</span>
      <strong>${escapeHtml(t.question)}</strong>
      <p>${escapeHtml(t.short)}</p>
      <span class="q-arrow" aria-hidden="true">→</span>
    </a>`;
  }).join("");

  const categoryButtons = [
    `<button class="chip active" type="button" data-category-filter="">${escapeHtml(ui.all)}</button>`,
    ...QUESTION_CATEGORIES.map(category => `<button class="chip" type="button" data-category-filter="${escapeHtml(category)}">${escapeHtml(ui.categories[category] || category)}</button>`)
  ].join("");

  return `<!doctype html>
<html lang="${routeLocale}" dir="${localeDirection(routeLocale)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<title>${escapeHtml(ui.title)} · AERTEX</title>
${FAVICON_LINKS}
${styles()}
</head>
<body>
<header class="topbar"><a class="brand" href="/${routeLocale}">${escapeHtml(ui.home)}</a><span class="product">Questions</span><div class="spacer"></div><a class="toplink" href="/${routeLocale}">${escapeHtml(ui.home)}</a></header>
<main class="shell">
<section class="hero">
  <p class="eyebrow">AERTEX · QUESTIONS</p>
  <h1>${escapeHtml(ui.title)}</h1>
  <p class="lead">${escapeHtml(ui.lead)}</p>
</section>
<section class="controls" aria-label="${escapeHtml(ui.title)}">
  <label class="search"><span aria-hidden="true">⌕</span><input id="q-search" type="search" autocomplete="off" placeholder="${escapeHtml(ui.search)}"></label>
  <div class="chips" id="q-filters">${categoryButtons}</div>
</section>
<section class="q-grid" id="q-grid">${cards}</section>
<p class="empty" id="q-empty" hidden>${escapeHtml(ui.noResults)}</p>
</main>
<footer>© AERTEX · ${escapeHtml(ui.site)}</footer>
<script>
(() => {
  const input=document.getElementById("q-search");
  const cards=[...document.querySelectorAll(".q-card")];
  const buttons=[...document.querySelectorAll("[data-category-filter]")];
  const empty=document.getElementById("q-empty");
  let category="";
  function apply(){
    const q=(input?.value||"").trim().toLowerCase();
    let visible=0;
    for(const card of cards){
      const okCategory=!category||card.dataset.category===category;
      const okQuery=!q||(card.dataset.search||"").includes(q);
      const show=okCategory&&okQuery;
      card.hidden=!show;
      if(show) visible++;
    }
    if(empty) empty.hidden=visible!==0;
  }
  input?.addEventListener("input",apply);
  for(const button of buttons) button.addEventListener("click",()=>{
    category=button.dataset.categoryFilter||"";
    for(const other of buttons) other.classList.toggle("active",other===button);
    apply();
  });
})();
</script>
</body>
</html>`;
}

export function questionDetailPage(locale, id) {
  const routeLocale = questionRouteLocale(locale);
  const contentLocale = questionContentLocale(routeLocale);
  const ui = UI[contentLocale] || UI["en-us"];
  const item = questionById(id);
  if (!item || item.status !== "published") return "";
  const t = questionTranslation(item, routeLocale);
  if (!t) return "";

  const related = publishedQuestions()
    .filter(candidate => candidate.id !== item.id && candidate.category === item.category)
    .slice(0, 4)
    .map(candidate => {
      const candidateText = questionTranslation(candidate, routeLocale);
      return candidateText
        ? `<a class="related-card" href="${questionDetailPath(routeLocale,candidate.id)}"><span>${escapeHtml(candidate.product)}</span><strong>${escapeHtml(candidateText.question)}</strong></a>`
        : "";
    }).join("");

  const answerHtml = t.answer.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("");
  const canonical = "https://qsseda.com" + questionDetailPath(routeLocale, item.id);
  const structured = {
    "@context":"https://schema.org",
    "@type":"WebPage",
    name:t.question,
    description:t.short,
    url:canonical,
    isPartOf:{"@type":"WebSite",name:"AERTEX",url:"https://qsseda.com/"},
    mainEntity:{
      "@type":"Question",
      name:t.question,
      acceptedAnswer:{"@type":"Answer",text:t.answer.join("\n\n")}
    },
    dateModified:item.updated
  };

  return `<!doctype html>
<html lang="${routeLocale}" dir="${localeDirection(routeLocale)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<title>${escapeHtml(t.question)} · AERTEX Questions</title>
${FAVICON_LINKS}
<script type="application/ld+json">${safeJson(structured)}</script>
${styles()}
</head>
<body>
<header class="topbar"><a class="brand" href="/${routeLocale}">${escapeHtml(ui.home)}</a><span class="product">Questions</span><div class="spacer"></div><a class="toplink" href="${questionIndexPath(routeLocale)}">${escapeHtml(ui.back)}</a></header>
<main class="article-shell">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/${routeLocale}">${escapeHtml(ui.home)}</a><span>/</span><a href="${questionIndexPath(routeLocale)}">Questions</a><span>/</span><span>${escapeHtml(ui.categories[item.category] || item.category)}</span></nav>
<article>
  <p class="eyebrow">${escapeHtml(ui.categories[item.category] || item.category)} · ${escapeHtml(item.product)}</p>
  <h1>${escapeHtml(t.question)}</h1>
  <p class="answer-short">${escapeHtml(t.short)}</p>
  <div class="answer-body">${answerHtml}</div>
  <aside class="current-note"><strong>${escapeHtml(ui.current)}</strong><p>${escapeHtml(ui.note)}</p><span>${escapeHtml(ui.updated)} · ${escapeHtml(item.updated)}</span></aside>
</article>
${related ? `<section class="related"><h2>${escapeHtml(ui.related)}</h2><div class="related-grid">${related}</div></section>` : ""}
</main>
<footer>© AERTEX · ${escapeHtml(ui.site)}</footer>
</body>
</html>`;
}

export function questionAlternateLocales() {
  return QUESTION_INDEX_LOCALES;
}

function uiFor(locale) {
  return UI[questionContentLocale(locale)] || UI["en-us"];
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function styles() {
  return `<style>
:root{color-scheme:light dark;--bg:#f5f5f7;--panel:rgba(255,255,255,.78);--solid:#fff;--text:#111114;--muted:#6e6e73;--line:rgba(0,0,0,.09);--soft:rgba(0,0,0,.045);--accent:#007aff;--shadow:0 24px 80px rgba(0,0,0,.07)}
@media(prefers-color-scheme:dark){:root{--bg:#09090b;--panel:rgba(26,26,29,.82);--solid:#1c1c1e;--text:#f5f5f7;--muted:#a1a1a7;--line:rgba(255,255,255,.1);--soft:rgba(255,255,255,.055);--accent:#0a84ff;--shadow:0 28px 90px rgba(0,0,0,.32)}}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Segoe UI","PingFang SC",sans-serif}body{background-image:radial-gradient(circle at 12% -8%,rgba(10,132,255,.12),transparent 32%),radial-gradient(circle at 88% 0,rgba(175,82,222,.06),transparent 28%)}a{color:inherit}.topbar{height:60px;display:flex;align-items:center;gap:10px;max-width:1120px;margin:0 auto;padding:0 22px}.brand{font-weight:820;letter-spacing:-.03em;text-decoration:none}.product{color:var(--muted);font-size:14px}.spacer{flex:1}.toplink{color:var(--muted);font-size:13px;text-decoration:none}.toplink:hover{color:var(--text)}
.shell,.article-shell{max-width:1120px;margin:0 auto;padding:56px 22px 88px}.hero{max-width:860px}.eyebrow{margin:0 0 12px;color:var(--accent);font-size:12px;font-weight:780;letter-spacing:.11em;text-transform:uppercase}.hero h1,article h1{margin:0;letter-spacing:-.055em;line-height:1}.hero h1{font-size:clamp(48px,8vw,78px)}.lead{max-width:780px;margin:20px 0 0;color:var(--muted);font-size:18px;line-height:1.7}
.controls{margin-top:42px;display:grid;gap:14px}.search{height:50px;display:flex;align-items:center;gap:10px;padding:0 15px;border:1px solid var(--line);border-radius:16px;background:var(--panel);backdrop-filter:blur(22px)}.search span{color:var(--muted);font-size:22px}.search input{width:100%;border:0;outline:0;background:transparent;color:var(--text);font:inherit}.chips{display:flex;gap:8px;overflow:auto;padding-bottom:2px}.chip{white-space:nowrap;border:1px solid var(--line);background:var(--panel);color:var(--muted);border-radius:999px;padding:9px 13px;cursor:pointer;font:inherit;font-size:13px}.chip.active{background:var(--text);color:var(--bg);border-color:var(--text)}
.q-grid{margin-top:22px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.q-card{position:relative;display:block;min-height:190px;padding:22px 52px 22px 22px;border:1px solid var(--line);border-radius:22px;background:var(--panel);box-shadow:var(--shadow);text-decoration:none;transition:transform .16s ease,border-color .16s ease}.q-card:hover{transform:translateY(-2px);border-color:color-mix(in srgb,var(--accent) 35%,var(--line))}.q-card[hidden]{display:none}.q-meta{display:block;color:var(--accent);font-size:11px;font-weight:760;letter-spacing:.04em}.q-card strong{display:block;margin-top:11px;font-size:20px;line-height:1.25;letter-spacing:-.025em}.q-card p{margin:10px 0 0;color:var(--muted);font-size:14px;line-height:1.6}.q-arrow{position:absolute;right:20px;top:20px;color:var(--muted);font-size:20px}.empty{text-align:center;color:var(--muted);padding:50px 0}
.crumbs{display:flex;gap:8px;align-items:center;flex-wrap:wrap;color:var(--muted);font-size:12px;margin-bottom:58px}.crumbs a{text-decoration:none}.crumbs a:hover{color:var(--text)}article{max-width:820px}article h1{font-size:clamp(42px,7vw,70px)}.answer-short{margin:26px 0 0;padding:20px 22px;border-left:3px solid var(--accent);border-radius:0 16px 16px 0;background:var(--soft);font-size:19px;line-height:1.65;font-weight:650}.answer-body{margin-top:34px}.answer-body p{margin:0 0 20px;font-size:17px;line-height:1.82;color:color-mix(in srgb,var(--text) 88%,var(--muted))}.current-note{margin-top:38px;padding:18px 20px;border:1px solid var(--line);border-radius:18px;background:var(--panel)}.current-note strong{font-size:14px}.current-note p{margin:7px 0;color:var(--muted);font-size:13px;line-height:1.6}.current-note span{font-size:11px;color:var(--muted)}
.related{margin-top:72px;border-top:1px solid var(--line);padding-top:30px}.related h2{font-size:15px;color:var(--muted);font-weight:680}.related-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}.related-card{display:block;padding:18px;border:1px solid var(--line);border-radius:18px;background:var(--panel);text-decoration:none}.related-card span{display:block;color:var(--muted);font-size:11px}.related-card strong{display:block;margin-top:8px;font-size:15px;line-height:1.35}
footer{max-width:1120px;margin:0 auto;padding:0 22px 28px;color:var(--muted);font-size:12px}
@media(max-width:760px){.topbar{padding:0 16px}.shell,.article-shell{padding:36px 16px 68px}.hero h1{font-size:50px}.lead{font-size:16px}.q-grid,.related-grid{grid-template-columns:1fr}.q-card{min-height:0}.crumbs{margin-bottom:42px}article h1{font-size:44px}.answer-short{font-size:17px}}
</style>`;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, character => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[character]));
}
