import { CURATED_LINK_CATEGORIES, CURATED_LINKS_CORE } from "./curated-links-core.js";
import { CURATED_LINKS_EXTRA } from "./curated-links-extra.js";
import { escapeHtmlText } from "./html-utils.js";

const CURATED_LINKS = [...CURATED_LINKS_CORE, ...CURATED_LINKS_EXTRA];

const LINKS_UI = {
  "en-us":{library:"Link Library",title:"Projects and sites",lead:"A collection of useful projects, tools, services, and official references.",links:"links",archived:"archived",categories:"categories",filter:"Filter links",search:"Search links",category:"Category",all:"All",source:"Source",archivedLabel:"Archived",official:"Official / curated",priority:"Priority",reset:"Reset",of:n=>"of "+n,categoryNav:"Link categories",common:"Common entries",noResults:"No results",tryAnother:"Try another keyword or filter.",sources:"Sources: ",sourceNote:"“Archived” marks useful projects and references kept over time. “Official / curated” contains related primary references. Search runs locally on this page."},
  "zh-cn":{library:"链接库",title:"常用项目和网站",lead:"收录常用项目、工具、服务和官方资料。",links:"链接",archived:"历史收录",categories:"分类",filter:"筛选链接",search:"搜索链接",category:"分类",all:"全部",source:"来源",archivedLabel:"历史收录",official:"官方 / 精选",priority:"优先",reset:"重置",of:n=>" / "+n,categoryNav:"链接分类",common:"常用入口",noResults:"没有结果",tryAnother:"换个关键词或筛选条件。",sources:"来源：",sourceNote:"“历史收录”表示长期保留的常用项目与资料；“官方 / 精选”表示相关官方文档或补充入口。搜索在当前页面本地完成。"},
  "zh-tw":{library:"連結庫",title:"常用專案與網站",lead:"收錄常用專案、工具、服務與官方資料。",links:"連結",archived:"歷史收錄",categories:"分類",filter:"篩選連結",search:"搜尋連結",category:"分類",all:"全部",source:"來源",archivedLabel:"歷史收錄",official:"官方 / 精選",priority:"優先",reset:"重設",of:n=>" / "+n,categoryNav:"連結分類",common:"常用入口",noResults:"沒有結果",tryAnother:"請更換關鍵字或篩選條件。",sources:"來源：",sourceNote:"「歷史收錄」表示長期保留的常用專案與資料；「官方 / 精選」表示相關官方文件或補充入口。搜尋只在目前頁面本機執行。"},
  "ja-jp":{library:"リンクライブラリ",title:"プロジェクトとサイト",lead:"よく使うプロジェクト、ツール、サービス、公式資料をまとめています。",links:"リンク",archived:"アーカイブ",categories:"カテゴリ",filter:"リンクを絞り込む",search:"リンクを検索",category:"カテゴリ",all:"すべて",source:"出典",archivedLabel:"アーカイブ",official:"公式 / 厳選",priority:"優先",reset:"リセット",of:n=>"全 "+n+" 件",categoryNav:"リンクカテゴリ",common:"よく使う項目",noResults:"結果がありません",tryAnother:"別のキーワードや条件を試してください。",sources:"出典: ",sourceNote:"「アーカイブ」は長期保存した有用な項目、「公式 / 厳選」は関連する一次資料です。検索はこのページ内で行われます。"},
  "ko-kr":{library:"링크 라이브러리",title:"프로젝트와 사이트",lead:"자주 사용하는 프로젝트, 도구, 서비스 및 공식 자료를 모았습니다.",links:"링크",archived:"보관됨",categories:"범주",filter:"링크 필터",search:"링크 검색",category:"범주",all:"전체",source:"출처",archivedLabel:"보관됨",official:"공식 / 선별",priority:"우선",reset:"초기화",of:n=>"전체 "+n+"개",categoryNav:"링크 범주",common:"자주 사용하는 항목",noResults:"결과 없음",tryAnother:"다른 검색어나 필터를 사용해 보세요.",sources:"출처: ",sourceNote:"‘보관됨’은 장기간 유지한 유용한 항목을, ‘공식 / 선별’은 관련 공식 자료를 뜻합니다. 검색은 이 페이지에서 로컬로 수행됩니다."},
  "fr-fr":{library:"Bibliothèque de liens",title:"Projets et sites",lead:"Une sélection de projets, outils, services et références officielles utiles.",links:"liens",archived:"archivés",categories:"catégories",filter:"Filtrer les liens",search:"Rechercher des liens",category:"Catégorie",all:"Tous",source:"Source",archivedLabel:"Archivés",official:"Officiel / sélection",priority:"Priorité",reset:"Réinitialiser",of:n=>"sur "+n,categoryNav:"Catégories de liens",common:"Accès fréquents",noResults:"Aucun résultat",tryAnother:"Essayez un autre mot-clé ou filtre.",sources:"Sources : ",sourceNote:"« Archivés » désigne les projets et références conservés dans le temps. « Officiel / sélection » contient les références principales associées. La recherche s’effectue localement sur cette page."},
  "es-es":{library:"Biblioteca de enlaces",title:"Proyectos y sitios",lead:"Una colección de proyectos, herramientas, servicios y referencias oficiales útiles.",links:"enlaces",archived:"archivados",categories:"categorías",filter:"Filtrar enlaces",search:"Buscar enlaces",category:"Categoría",all:"Todos",source:"Fuente",archivedLabel:"Archivados",official:"Oficial / seleccionado",priority:"Prioridad",reset:"Restablecer",of:n=>"de "+n,categoryNav:"Categorías de enlaces",common:"Accesos frecuentes",noResults:"Sin resultados",tryAnother:"Prueba otra palabra clave o filtro.",sources:"Fuentes: ",sourceNote:"«Archivados» identifica proyectos y referencias conservados a largo plazo. «Oficial / seleccionado» contiene referencias principales relacionadas. La búsqueda se realiza localmente en esta página."},
  "el-gr":{library:"Βιβλιοθήκη συνδέσμων",title:"Έργα και ιστότοποι",lead:"Συλλογή χρήσιμων έργων, εργαλείων, υπηρεσιών και επίσημων αναφορών.",links:"σύνδεσμοι",archived:"αρχειοθετημένα",categories:"κατηγορίες",filter:"Φιλτράρισμα συνδέσμων",search:"Αναζήτηση συνδέσμων",category:"Κατηγορία",all:"Όλα",source:"Πηγή",archivedLabel:"Αρχειοθετημένα",official:"Επίσημα / επιλεγμένα",priority:"Προτεραιότητα",reset:"Επαναφορά",of:n=>"από "+n,categoryNav:"Κατηγορίες συνδέσμων",common:"Συχνές επιλογές",noResults:"Δεν βρέθηκαν αποτελέσματα",tryAnother:"Δοκιμάστε άλλη λέξη ή φίλτρο.",sources:"Πηγές: ",sourceNote:"Τα «Αρχειοθετημένα» είναι χρήσιμα έργα και αναφορές που διατηρούνται στον χρόνο. Τα «Επίσημα / επιλεγμένα» περιέχουν σχετικές κύριες πηγές. Η αναζήτηση εκτελείται τοπικά στη σελίδα."},
  "ar-sa":{library:"مكتبة الروابط",title:"المشروعات والمواقع",lead:"مجموعة من المشروعات والأدوات والخدمات والمراجع الرسمية المفيدة.",links:"روابط",archived:"مؤرشفة",categories:"فئات",filter:"تصفية الروابط",search:"البحث في الروابط",category:"الفئة",all:"الكل",source:"المصدر",archivedLabel:"مؤرشفة",official:"رسمي / مختار",priority:"الأولوية",reset:"إعادة تعيين",of:n=>"من "+n,categoryNav:"فئات الروابط",common:"مداخل شائعة",noResults:"لا توجد نتائج",tryAnother:"جرّب كلمة مفتاحية أو عامل تصفية آخر.",sources:"المصادر: ",sourceNote:"تشير «مؤرشفة» إلى المشروعات والمراجع المفيدة المحتفظ بها مع الوقت، بينما تضم «رسمي / مختار» المراجع الأساسية ذات الصلة. يتم البحث محليًا داخل هذه الصفحة."}
};
LINKS_UI["en-gb"]=LINKS_UI["en-us"]; LINKS_UI["en-au"]=LINKS_UI["en-us"];

const CATEGORY_UI = {
  "ja-jp":{projects:"プロジェクトとリポジトリ",design:"デザインとUI",ai:"AIとメディア",development:"開発ツール",cloud:"クラウドとプロトコル",apple:"Apple エコシステム",services:"セキュリティとサービス",research:"研究とメディア"},
  "ko-kr":{projects:"프로젝트 및 저장소",design:"디자인 및 인터페이스",ai:"AI 및 미디어",development:"개발 도구",cloud:"클라우드 및 프로토콜",apple:"Apple 생태계",services:"보안 및 서비스",research:"연구 및 미디어"},
  "fr-fr":{projects:"Projets et dépôts",design:"Design et interface",ai:"IA et médias",development:"Développement",cloud:"Cloud et protocoles",apple:"Écosystème Apple",services:"Sécurité et services",research:"Recherche et médias"},
  "es-es":{projects:"Proyectos y repositorios",design:"Diseño e interfaz",ai:"IA y medios",development:"Desarrollo",cloud:"Nube y protocolos",apple:"Ecosistema Apple",services:"Seguridad y servicios",research:"Investigación y medios"},
  "el-gr":{projects:"Έργα και αποθετήρια",design:"Σχεδίαση και διεπαφή",ai:"AI και πολυμέσα",development:"Ανάπτυξη",cloud:"Cloud και πρωτόκολλα",apple:"Οικοσύστημα Apple",services:"Ασφάλεια και υπηρεσίες",research:"Έρευνα και μέσα"},
  "ar-sa":{projects:"المشروعات والمستودعات",design:"التصميم والواجهة",ai:"الذكاء الاصطناعي والوسائط",development:"أدوات التطوير",cloud:"السحابة والبروتوكولات",apple:"منظومة Apple",services:"الأمان والخدمات",research:"البحث والوسائط"},
  "zh-tw":{projects:"專案與儲存庫",design:"設計與介面",ai:"AI 與媒體",development:"開發工具",cloud:"雲端與協定",apple:"Apple 生態系",services:"安全性與服務",research:"研究與媒體"}
};
function categoryLabel(category, locale, zh) {
  if (CATEGORY_UI[locale]?.[category]) return CATEGORY_UI[locale][category];
  return CURATED_LINK_CATEGORIES[category]?.[locale === "zh-cn" || zh ? "zh" : "en"] || category;
}


function safeUrl(value) {
  const text = String(value || "").trim();
  return /^https:\/\//i.test(text) ? text : "#";
}

function safeHost(value) {
  try {
    return new URL(safeUrl(value)).hostname.replace(/^www\./, "");
  } catch {
    return "external";
  }
}

function originLabel(origin, locale, zh) {
  const c=LINKS_UI[locale]||LINKS_UI[zh?"zh-cn":"en-us"];
  return origin === "chat" ? c.archivedLabel : c.official;
}

function renderLink(link, zh, locale = "") {
  const description = locale === "zh-cn" ? link.zh : link.en;
  const host = safeHost(link.url);
  const searchText = [link.title, description, host, link.category].join(" ").toLocaleLowerCase();
  return `<a class="curated-link-card${link.featured ? " is-featured" : ""}" href="${escapeHtmlText(safeUrl(link.url))}" target="_blank" rel="noopener noreferrer" data-curated-card data-curated-category="${escapeHtmlText(link.category)}" data-curated-origin="${escapeHtmlText(link.origin || "related")}" data-curated-featured="${link.featured ? "1" : "0"}" data-curated-search="${escapeHtmlText(searchText)}">
    <div class="curated-link-card-top"><strong>${escapeHtmlText(link.title)}</strong><span aria-hidden="true">↗</span></div>
    <p>${escapeHtmlText(description)}</p>
    <div class="curated-link-meta"><span>${escapeHtmlText(originLabel(link.origin, locale, zh))}</span><code>${escapeHtmlText(host)}</code></div>
  </a>`;
}

function renderCategory(category, zh, locale = "") {
  const links = CURATED_LINKS.filter(link => link.category === category);
  if (!links.length) return "";
  const label = categoryLabel(category, locale, zh);
  return `<section class="curated-link-group" id="links-${escapeHtmlText(category)}" data-curated-group data-curated-category="${escapeHtmlText(category)}">
    <div class="curated-link-group-head"><h2>${escapeHtmlText(label)}</h2><span data-curated-group-count>${links.length}</span></div>
    <div class="curated-link-grid">${links.map(link => renderLink(link, zh, locale)).join("")}</div>
  </section>`;
}

export function curatedLinksContent(zh, locale = "") {
  const c=LINKS_UI[locale]||LINKS_UI[zh?"zh-cn":"en-us"];
  const categories = Object.keys(CURATED_LINK_CATEGORIES).filter(category => CURATED_LINKS.some(link => link.category === category));
  const archivedCount = CURATED_LINKS.filter(link => link.origin === "chat").length;
  const featured = CURATED_LINKS.filter(link => link.featured).slice(0, 12);
  const categoryNav = categories.map(category => {
    const label = CURATED_LINK_CATEGORIES[category]?.[zh ? "zh" : "en"] || category;
    const count = CURATED_LINKS.filter(link => link.category === category).length;
    return `<a href="#links-${escapeHtmlText(category)}"><span>${escapeHtmlText(label)}</span><b>${count}</b></a>`;
  }).join("");
  const categoryOptions = categories.map(category => {
    const label = CURATED_LINK_CATEGORIES[category]?.[zh ? "zh" : "en"] || category;
    return `<option value="${escapeHtmlText(category)}">${escapeHtmlText(label)}</option>`;
  }).join("");

  return `<style>
    .curated-links-shell{display:grid;gap:14px;min-width:0}
    .curated-links-overview{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px;align-items:center;padding:20px 22px;border:1px solid var(--border);border-radius:18px;background:var(--card)}
    .curated-links-overview small{color:var(--muted);font-size:11px;font-weight:620;letter-spacing:.02em}.curated-links-overview h2{margin:4px 0 6px;font-size:26px;font-weight:690;letter-spacing:-.035em}.curated-links-overview p{max-width:680px;margin:0;color:var(--muted);font-size:13px;line-height:1.5}
    .curated-links-stats{display:flex;gap:18px}.curated-links-stat{min-width:72px;padding-left:16px;border-left:1px solid var(--hairline)}.curated-links-stat strong{display:block;font-size:23px;letter-spacing:-.035em}.curated-links-stat span{display:block;margin-top:3px;color:var(--muted);font-size:11px}
    .curated-filter-panel{display:grid;gap:10px;padding:12px;border:0;border-radius:16px;background:var(--fill)}
    .curated-search-shell{display:flex;align-items:center;gap:9px;min-height:46px;padding:0 12px;border:0;border-radius:12px;background:var(--surface);box-shadow:inset 0 0 0 1px var(--border);transition:box-shadow .12s ease}
    .curated-search-shell:focus-within{box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 14%,transparent),inset 0 0 0 1px var(--primary)}
    .curated-search-shell svg{width:17px;height:17px;flex:0 0 auto;fill:none;stroke:var(--muted);stroke-width:1.8;stroke-linecap:round}.curated-search-input{width:100%;height:44px;min-height:0;margin:0;padding:0;border:0!important;background:transparent!important;box-shadow:none!important;font-size:14px}.curated-search-shell kbd{display:grid;place-items:center;min-width:24px;height:24px;padding:0 6px;border:0;border-radius:6px;background:var(--fill);color:var(--quiet);font:11px ui-monospace,SFMono-Regular,Menlo,monospace}
    .curated-filter-row{display:grid;grid-template-columns:minmax(170px,1fr) minmax(170px,1fr) auto;gap:8px;align-items:end}.curated-filter-field{display:grid;gap:5px;color:var(--muted);font-size:11px;font-weight:620}.curated-filter-field select{height:42px;min-height:42px;margin:0;padding:0 34px 0 11px;border:0;border-radius:11px;background:var(--surface);box-shadow:inset 0 0 0 1px var(--border);font-size:13px}.curated-filter-reset{width:auto!important;min-width:76px!important;height:42px!important;min-height:42px!important;margin:0!important;padding:0 13px!important;border:0!important;border-radius:11px!important;background:var(--surface)!important;color:var(--text)!important;box-shadow:inset 0 0 0 1px var(--border)!important;font-size:13px!important;font-weight:620!important}.curated-filter-reset:hover{background:var(--surface-strong)!important}.curated-filter-reset:active{transform:scale(.96)!important}.curated-filter-status{display:flex;gap:5px;padding:0 2px;color:var(--muted);font-size:12px}.curated-filter-status strong{color:var(--text)}
    .curated-link-nav{display:flex;flex-wrap:wrap;gap:6px}.curated-link-nav a{display:inline-flex;align-items:center;gap:7px;min-height:34px;padding:0 10px;border:0;border-radius:999px;background:var(--fill);color:var(--text);text-decoration:none;font-size:12px;font-weight:620;transition:background .12s ease,transform 100ms ease-out}.curated-link-nav a:hover{background:var(--secondary)}.curated-link-nav a:active{transform:scale(.97)}.curated-link-nav b{color:var(--muted);font-size:10px;font-weight:620}
    .curated-featured,.curated-link-group{padding:18px;border:1px solid var(--border);border-radius:18px;background:var(--card)}.curated-featured-head,.curated-link-group-head{display:flex;justify-content:space-between;gap:12px;align-items:baseline;margin-bottom:12px}.curated-featured-head h2,.curated-link-group-head h2{margin:0;font-size:20px;font-weight:680;letter-spacing:-.025em}.curated-featured-head p{margin:0;color:var(--muted);font-size:12px}.curated-link-group-head>span{color:var(--muted);font-size:12px;font-weight:620}
    .curated-featured-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.curated-link-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
    .curated-link-card{display:flex;min-width:0;min-height:152px;flex-direction:column;padding:14px;border:0;border-radius:14px;background:var(--fill);color:var(--text);text-decoration:none;box-shadow:inset 0 0 0 1px var(--border);transition:background .12s ease,transform 100ms ease-out}.curated-link-card:hover{background:var(--secondary);transform:none;box-shadow:inset 0 0 0 1px var(--border)}.curated-link-card:active{transform:scale(.985)}.curated-link-card.is-featured{background:color-mix(in srgb,var(--primary) 8%,var(--fill));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 24%,var(--border))}.curated-link-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.curated-link-card-top strong{font-size:14px;line-height:1.3}.curated-link-card-top span{color:var(--primary)}.curated-link-card p{margin:8px 0 12px;color:var(--muted);font-size:12.5px;line-height:1.45}.curated-link-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:auto;color:var(--quiet)}.curated-link-meta span{font-size:10px}.curated-link-meta code{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:10px ui-monospace,SFMono-Regular,Menlo,monospace}
    .curated-links-empty{display:none;place-items:center;gap:5px;min-height:150px;padding:28px 18px;border-radius:16px;background:var(--fill);text-align:center}.curated-links-empty.is-visible{display:grid}.curated-links-empty strong{font-size:16px}.curated-links-empty span{color:var(--muted);font-size:12px}.curated-links-note{padding:12px 14px;border-radius:14px;background:var(--fill);color:var(--muted);font-size:11px;line-height:1.5}.curated-links-note strong{color:var(--text)}
    @media(max-width:1180px){.curated-featured-row{grid-template-columns:repeat(3,minmax(0,1fr))}.curated-link-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:760px){.curated-links-overview{grid-template-columns:1fr;padding:17px}.curated-links-stats{gap:12px}.curated-links-stat{padding-left:12px}.curated-featured-row,.curated-link-grid{grid-template-columns:1fr}.curated-featured,.curated-link-group{padding:14px}.curated-link-card{min-height:0}.curated-featured-head{align-items:flex-start;flex-direction:column}.curated-link-nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.curated-link-nav a{justify-content:space-between}.curated-filter-row{grid-template-columns:1fr 1fr}.curated-filter-reset{grid-column:1/-1;width:100%!important}.curated-search-shell kbd{display:none}}
    @media(max-width:520px){.curated-links-stats{display:grid;grid-template-columns:repeat(3,1fr)}.curated-link-nav,.curated-filter-row{grid-template-columns:1fr}.curated-filter-reset{grid-column:auto}}
    @media(prefers-reduced-motion:reduce){.curated-link-card,.curated-link-nav a,.curated-filter-reset{transition:background .12s ease!important;transform:none!important}}
  </style>
  <div class="curated-links-shell" data-curated-links-root>
    <section class="curated-links-overview">
      <div><small>${c.library}</small><h2>${c.title}</h2><p>${c.lead}</p></div>
      <div class="curated-links-stats"><div class="curated-links-stat"><strong>${CURATED_LINKS.length}</strong><span>${c.links}</span></div><div class="curated-links-stat"><strong>${archivedCount}</strong><span>${c.archived}</span></div><div class="curated-links-stat"><strong>${categories.length}</strong><span>${c.categories}</span></div></div>
    </section>
    <section class="curated-filter-panel" aria-label="${c.filter}">
      <div class="curated-search-shell"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path></svg><input class="curated-search-input" id="curated-link-search" type="search" autocomplete="off" spellcheck="false" placeholder="${c.search}" aria-label="${c.search}"><kbd aria-hidden="true">/</kbd></div>
      <div class="curated-filter-row">
        <label class="curated-filter-field"><span>${c.category}</span><select id="curated-link-category"><option value="all">${c.all}</option>${categoryOptions}</select></label>
        <label class="curated-filter-field"><span>${c.source}</span><select id="curated-link-origin"><option value="all">${c.all}</option><option value="chat">${c.archivedLabel}</option><option value="related">${c.official}</option><option value="featured">${c.priority}</option></select></label>
        <button class="curated-filter-reset" id="curated-link-reset" type="button">${c.reset}</button>
      </div>
      <div class="curated-filter-status" aria-live="polite"><strong id="curated-link-result-count">${CURATED_LINKS.length}</strong><span id="curated-link-result-label">${c.of(CURATED_LINKS.length)}</span></div>
    </section>
    <nav class="curated-link-nav" aria-label="${c.categoryNav}">${categoryNav}</nav>
    <section class="curated-featured" data-curated-featured-section><div class="curated-featured-head"><h2>${c.priority}</h2><p>${c.common}</p></div><div class="curated-featured-row">${featured.map(link => renderLink(link, zh, locale)).join("")}</div></section>
    <div class="curated-links-empty" id="curated-links-empty"><strong>${c.noResults}</strong><span>${c.tryAnother}</span></div>
    ${categories.map(category => renderCategory(category, zh, locale)).join("")}
    <div class="curated-links-note"><strong>${c.sources}</strong>${c.sourceNote}</div>
  </div>
  <script>(function(){
    const root=document.querySelector('[data-curated-links-root]');
    if(!root)return;
    const search=document.getElementById('curated-link-search');
    const category=document.getElementById('curated-link-category');
    const origin=document.getElementById('curated-link-origin');
    const reset=document.getElementById('curated-link-reset');
    const resultCount=document.getElementById('curated-link-result-count');
    const resultLabel=document.getElementById('curated-link-result-label');
    const empty=document.getElementById('curated-links-empty');
    const featuredSection=root.querySelector('[data-curated-featured-section]');
    const groups=Array.from(root.querySelectorAll('[data-curated-group]'));
    const primaryCards=groups.flatMap(group=>Array.from(group.querySelectorAll('[data-curated-card]')));
    const featuredCards=featuredSection?Array.from(featuredSection.querySelectorAll('[data-curated-card]')):[];
    const total=primaryCards.length;
    const resultSuffix=${JSON.stringify(c.of(CURATED_LINKS.length))};
    const normalize=value=>String(value||'').trim().toLocaleLowerCase();
    const matches=(card,query,categoryValue,originValue)=>{
      if(query&&!normalize(card.dataset.curatedSearch).includes(query))return false;
      if(categoryValue!=='all'&&card.dataset.curatedCategory!==categoryValue)return false;
      if(originValue==='chat'&&card.dataset.curatedOrigin!=='chat')return false;
      if(originValue==='related'&&card.dataset.curatedOrigin==='chat')return false;
      if(originValue==='featured'&&card.dataset.curatedFeatured!=='1')return false;
      return true;
    };
    function apply(){
      const query=normalize(search.value);
      const categoryValue=category.value;
      const originValue=origin.value;
      let visible=0;
      groups.forEach(group=>{
        let groupVisible=0;
        Array.from(group.querySelectorAll('[data-curated-card]')).forEach(card=>{
          const show=matches(card,query,categoryValue,originValue);
          card.hidden=!show;
          if(show){visible+=1;groupVisible+=1;}
        });
        group.hidden=groupVisible===0;
        const badge=group.querySelector('[data-curated-group-count]');
        if(badge)badge.textContent=String(groupVisible);
      });
      const filtered=Boolean(query)||categoryValue!=='all'||originValue!=='all';
      if(featuredSection)featuredSection.hidden=filtered;
      featuredCards.forEach(card=>{card.hidden=filtered;});
      resultCount.textContent=String(visible);
      resultLabel.textContent=resultSuffix;
      empty.classList.toggle('is-visible',visible===0);
    }
    search.addEventListener('input',apply);
    category.addEventListener('change',apply);
    origin.addEventListener('change',apply);
    reset.addEventListener('click',()=>{search.value='';category.value='all';origin.value='all';apply();search.focus();});
    document.addEventListener('keydown',event=>{
      const target=event.target;
      const typing=target instanceof HTMLInputElement||target instanceof HTMLTextAreaElement||target instanceof HTMLSelectElement||target?.isContentEditable;
      if(event.key==='/'&&!typing){event.preventDefault();search.focus();}
      if(event.key==='Escape'&&document.activeElement===search&&search.value){search.value='';apply();}
    });
    apply();
  })();</script>`;
}

export const CURATED_LINK_COUNT = CURATED_LINKS.length;