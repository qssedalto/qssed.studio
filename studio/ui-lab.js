import { LAB_TOOL_CATEGORIES, LAB_TOOLS, LAB_TOOL_LOCALIZATIONS } from "./lab-tools.js";
import { normalizeSupportedLocale } from "./locale.js";
import { escapeHtmlText } from "./html-utils.js";

const LAB_EN = {
  eyebrow:"Workspace · Lab",title:"Lab",
  intro:"A unified container for TeX, AI, media processing, and engineering tools. Live Studio capabilities open directly; future tools are clearly marked as planned.",
  search:"Search tools, capabilities, or categories…",all:"All",ready:"Ready",planned:"Planned",tools:"tools",categories:"categories",
  readyCount:"ready tools",plannedCount:"planned tools",open:"Open tool",plannedAction:"Not available yet",empty:"No matching tools",
  emptyDetail:"Try another keyword or category.",registry:"Tool Registry",
  registryIntro:"Lab does not store business data itself; each tool keeps its own account data and permission boundaries."
};
const LAB_COPY = {
  "en-us":LAB_EN,"en-gb":LAB_EN,"en-au":LAB_EN,
  "zh-cn":{eyebrow:"工作区 · 实验室",title:"实验室",intro:"这里作为 TeX、AI、媒体处理与工程工具的统一容器。已经可用的 Studio 能力可以直接打开，尚未实现的工具会明确标记为规划中。",search:"搜索工具、能力或分类…",all:"全部",ready:"可用",planned:"规划中",tools:"工具",categories:"分类",readyCount:"可用工具",plannedCount:"规划工具",open:"打开工具",plannedAction:"尚未开放",empty:"没有匹配的工具",emptyDetail:"换一个关键词或分类。",registry:"工具注册中心",registryIntro:"实验室本身不存储业务数据；每个工具继续使用自己的账号数据和权限边界。"},
  "zh-tw":{eyebrow:"工作區 · 實驗室",title:"實驗室",intro:"這裡是 TeX、AI、媒體處理與工程工具的統一容器。已可用的 Studio 能力可以直接開啟，尚未實作的工具會明確標示為規劃中。",search:"搜尋工具、能力或分類…",all:"全部",ready:"可用",planned:"規劃中",tools:"工具",categories:"分類",readyCount:"可用工具",plannedCount:"規劃工具",open:"開啟工具",plannedAction:"尚未開放",empty:"沒有符合的工具",emptyDetail:"換一個關鍵字或分類。",registry:"工具註冊中心",registryIntro:"實驗室本身不儲存業務資料；每個工具仍使用自己的帳號資料與權限邊界。"},
  "ja-jp":{eyebrow:"ワークスペース · Lab",title:"ラボ",intro:"TeX、AI、メディア処理、エンジニアリングツールをまとめた統合コンテナです。利用可能な Studio 機能は直接開け、未実装のツールは計画中として明示されます。",search:"ツール、機能、カテゴリを検索…",all:"すべて",ready:"利用可能",planned:"計画中",tools:"ツール",categories:"カテゴリ",readyCount:"利用可能",plannedCount:"計画中",open:"ツールを開く",plannedAction:"未提供",empty:"一致するツールがありません",emptyDetail:"別のキーワードまたはカテゴリを試してください。",registry:"ツールレジストリ",registryIntro:"Lab 自体は業務データを保存しません。各ツールはそれぞれのアカウントデータと権限境界を維持します。"},
  "ko-kr":{eyebrow:"작업 공간 · Lab",title:"랩",intro:"TeX, AI, 미디어 처리 및 엔지니어링 도구를 위한 통합 컨테이너입니다. 사용 가능한 Studio 기능은 바로 열 수 있고, 아직 구현되지 않은 도구는 계획 중으로 표시됩니다.",search:"도구, 기능 또는 분류 검색…",all:"전체",ready:"사용 가능",planned:"계획 중",tools:"도구",categories:"분류",readyCount:"사용 가능 도구",plannedCount:"계획 도구",open:"도구 열기",plannedAction:"아직 사용할 수 없음",empty:"일치하는 도구가 없습니다",emptyDetail:"다른 검색어나 분류를 사용해 보세요.",registry:"도구 레지스트리",registryIntro:"Lab 자체는 업무 데이터를 저장하지 않습니다. 각 도구는 자체 계정 데이터와 권한 경계를 유지합니다."},
  "fr-fr":{eyebrow:"Espace de travail · Lab",title:"Lab",intro:"Un conteneur unifié pour TeX, l’IA, le traitement multimédia et les outils d’ingénierie. Les capacités Studio disponibles s’ouvrent directement ; les outils futurs sont clairement indiqués comme planifiés.",search:"Rechercher des outils, capacités ou catégories…",all:"Tout",ready:"Disponible",planned:"Planifié",tools:"outils",categories:"catégories",readyCount:"outils disponibles",plannedCount:"outils planifiés",open:"Ouvrir l’outil",plannedAction:"Pas encore disponible",empty:"Aucun outil correspondant",emptyDetail:"Essayez un autre mot-clé ou une autre catégorie.",registry:"Registre des outils",registryIntro:"Lab ne stocke pas lui-même les données métier ; chaque outil conserve ses propres données de compte et limites d’autorisation."},
  "es-es":{eyebrow:"Espacio de trabajo · Lab",title:"Lab",intro:"Un contenedor unificado para TeX, IA, procesamiento multimedia y herramientas de ingeniería. Las capacidades de Studio disponibles se abren directamente; las futuras aparecen claramente como planificadas.",search:"Buscar herramientas, capacidades o categorías…",all:"Todo",ready:"Disponible",planned:"Planificado",tools:"herramientas",categories:"categorías",readyCount:"herramientas disponibles",plannedCount:"herramientas planificadas",open:"Abrir herramienta",plannedAction:"Aún no disponible",empty:"No hay herramientas coincidentes",emptyDetail:"Prueba otra palabra clave o categoría.",registry:"Registro de herramientas",registryIntro:"Lab no almacena datos de negocio por sí mismo; cada herramienta mantiene sus propios datos de cuenta y límites de permisos."},
  "el-gr":{eyebrow:"Χώρος εργασίας · Lab",title:"Lab",intro:"Ένας ενιαίος χώρος για TeX, AI, επεξεργασία πολυμέσων και εργαλεία μηχανικής. Οι διαθέσιμες δυνατότητες του Studio ανοίγουν άμεσα, ενώ τα μελλοντικά εργαλεία επισημαίνονται καθαρά ως προγραμματισμένα.",search:"Αναζήτηση εργαλείων, δυνατοτήτων ή κατηγοριών…",all:"Όλα",ready:"Διαθέσιμο",planned:"Προγραμματισμένο",tools:"εργαλεία",categories:"κατηγορίες",readyCount:"διαθέσιμα εργαλεία",plannedCount:"προγραμματισμένα εργαλεία",open:"Άνοιγμα εργαλείου",plannedAction:"Δεν είναι ακόμη διαθέσιμο",empty:"Δεν βρέθηκαν εργαλεία",emptyDetail:"Δοκιμάστε άλλη λέξη-κλειδί ή κατηγορία.",registry:"Μητρώο εργαλείων",registryIntro:"Το Lab δεν αποθηκεύει επιχειρησιακά δεδομένα· κάθε εργαλείο διατηρεί τα δικά του δεδομένα λογαριασμού και όρια δικαιωμάτων."},
  "ar-sa":{eyebrow:"مساحة العمل · Lab",title:"المختبر",intro:"حاوية موحدة لأدوات TeX والذكاء الاصطناعي ومعالجة الوسائط والهندسة. يمكن فتح قدرات Studio المتاحة مباشرة، بينما تُعرض الأدوات المستقبلية بوضوح على أنها مخطط لها.",search:"البحث في الأدوات أو القدرات أو التصنيفات…",all:"الكل",ready:"متاح",planned:"مخطط",tools:"أدوات",categories:"تصنيفات",readyCount:"أدوات متاحة",plannedCount:"أدوات مخططة",open:"فتح الأداة",plannedAction:"غير متاحة بعد",empty:"لا توجد أدوات مطابقة",emptyDetail:"جرّب كلمة أخرى أو تصنيفًا مختلفًا.",registry:"سجل الأدوات",registryIntro:"لا يخزن Lab بيانات العمل بنفسه؛ تحتفظ كل أداة ببيانات حسابها وحدود صلاحياتها الخاصة."}
};

export function labContent(zh, locale = "") {
  const activeLocale = normalizeSupportedLocale(locale) || (zh ? "zh-cn" : "en-us");
  const copy = LAB_COPY[activeLocale] || LAB_EN;
  const localizedRegistry = LAB_TOOL_LOCALIZATIONS[activeLocale] || null;
  const localeKey = activeLocale === "zh-cn" ? "zh" : "en";
  const categories = Object.entries(LAB_TOOL_CATEGORIES).filter(([id]) => LAB_TOOLS.some(tool => tool.category === id));
  const readyCount = LAB_TOOLS.filter(tool => tool.status === "ready").length;
  const plannedCount = LAB_TOOLS.filter(tool => tool.status === "planned").length;
  const categoryButtons = categories.map(([id, labels]) => {
    const label = localizedRegistry?.categories?.[id] || labels[localeKey] || labels.en || id;
    return `<button type="button" data-lab-category="${escapeHtmlText(id)}">${escapeHtmlText(label)}<b>${LAB_TOOLS.filter(tool => tool.category === id).length}</b></button>`;
  }).join("");
  const cards = LAB_TOOLS.map(tool => renderTool(tool, localeKey, copy, localizedRegistry)).join("");

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
          const prefix=${JSON.stringify("/" + activeLocale)};
          grid.querySelectorAll('[data-lab-href]').forEach(card=>{const path=card.dataset.labHref||'';if(path)card.setAttribute('href',prefix+path);});
          function apply(){const query=search.value.trim().toLocaleLowerCase();let visible=0;grid.querySelectorAll('[data-lab-card]').forEach(card=>{const matchStatus=status==='all'||card.dataset.labStatus===status;const matchCategory=category==='all'||card.dataset.labCategory===category;const matchSearch=!query||(card.dataset.labSearch||'').includes(query);const show=matchStatus&&matchCategory&&matchSearch;card.hidden=!show;if(show)visible+=1;});empty.hidden=visible>0;}
          search.addEventListener('input',apply);document.querySelectorAll('[data-lab-status]').forEach(button=>button.addEventListener('click',()=>{status=button.dataset.labStatus||'all';document.querySelectorAll('[data-lab-status]').forEach(item=>item.classList.toggle('is-active',item===button));apply();}));document.querySelectorAll('[data-lab-category]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.labCategory||'all';document.querySelectorAll('[data-lab-category]').forEach(item=>item.classList.toggle('is-active',item===button));apply();}));apply();
        };window.setTimeout(start,0);
      })();
    </script>
  `;
}

function renderTool(tool, localeKey, copy, localizedRegistry) {
  const localized = localizedRegistry?.tools?.[tool.id] || null;
  const category = localizedRegistry?.categories?.[tool.category] || LAB_TOOL_CATEGORIES[tool.category]?.[localeKey] || tool.category;
  const title = localized?.[0] || tool.title?.[localeKey] || tool.id;
  const description = localized?.[1] || tool.description?.[localeKey] || "";
  const capabilities = Array.isArray(localized?.[2]) ? localized[2] : (Array.isArray(tool.capabilities?.[localeKey]) ? tool.capabilities[localeKey] : []);
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
