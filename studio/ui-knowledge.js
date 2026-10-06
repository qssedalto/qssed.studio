// 初学者导读：知识库页面的 SSR 内容与元数据；搜索交互由 knowledge-search.js 负责，知识数据来自 knowledge-* 模块。
import { KNOWLEDGE_CATEGORIES, KNOWLEDGE_ROOT, getKnowledgeRoute } from "./knowledge-routes.js";
import { PROJECT_KNOWLEDGE } from "./knowledge-projects.js";
import { TECHNOLOGY_KNOWLEDGE } from "./knowledge-technology.js";
import { STUDY_KNOWLEDGE } from "./knowledge-study.js";
import { METHODOLOGY_KNOWLEDGE } from "./knowledge-methodology.js";
import { REFERENCE_KNOWLEDGE } from "./knowledge-references.js";
import { ARCHIVE_KNOWLEDGE } from "./knowledge-archive.js";
import { knowledgeSearchPanel } from "./knowledge-search.js";

const KNOWLEDGE_UI = {
  "en-us": {
    rootTitle:"Knowledge Base", rootDescription:"Organized by project, technology, study, and reference topics, with full-text search.",
    introTitle:"Projects, technology, and study notes", introLead:"Project notes, development records, course material, and references are organized by category. Each topic has a stable page and can be searched directly.",
    structure:"Knowledge structure",categoriesLabel:"categories",topicsLabel:"topics",languagesLabel:"languages",topicCount:n=>n+" topics",open:"Open",
    guidelines:"Guidelines",guidelineTitle:"Keep material you expect to use again",guidelinesList:["Record the reasons and constraints behind project decisions.","For debugging notes, keep the symptom, cause, and final fix.","Keep temporary tasks and raw files in their dedicated tools."],
    base:"Knowledge Base",category:"Category",previous:"Previous",next:"Next",back:"Back",categories:"Knowledge categories",
    cats:{projects:["Projects","Project decisions, implementation notes, and reusable context."],technology:["Technology","Technical references, platforms, tools, and engineering notes."],study:["Study","Courses, learning notes, concepts, and exercises."],methodology:["Methodology","Reusable methods, workflows, and ways to reason about problems."],references:["References","Papers, documentation, references, and external material."],archive:["Archive","Older material retained for reference."]}
  },
  "zh-cn": {
    rootTitle:"知识库", rootDescription:"按项目、技术、课程和资料分类整理，支持全文搜索。",
    introTitle:"项目、技术和学习资料", introLead:"按分类保存项目说明、开发记录、课程内容和常用资料。每个主题都有固定页面，可以直接搜索和回看。",
    structure:"知识库结构",categoriesLabel:"大类",topicsLabel:"主题",languagesLabel:"语言",topicCount:n=>n+" 个主题",open:"查看",
    guidelines:"整理建议",guidelineTitle:"只放以后还会查的内容",guidelinesList:["项目决策要写清原因和约束。","排错记录保留现象、原因和最终修复。","临时待办和文件继续放在对应工具里。"],
    base:"知识库",category:"分类",previous:"上一篇",next:"下一篇",back:"返回",categories:"知识分类",
    cats:{projects:["项目","项目决策、实现记录和可复用上下文。"],technology:["技术","技术参考、平台、工具与工程记录。"],study:["学习","课程、学习笔记、概念与练习。"],methodology:["方法论","可复用的方法、流程与问题分析方式。"],references:["参考资料","论文、文档、参考链接与外部材料。"],archive:["归档","保留供以后查阅的旧资料。"]}
  },
  "zh-tw": {
    rootTitle:"知識庫", rootDescription:"依專案、技術、學習與參考資料分類整理，並支援全文搜尋。",
    introTitle:"專案、技術與學習資料", introLead:"依分類保存專案說明、開發記錄、課程內容與常用資料。每個主題都有固定頁面，可直接搜尋與回顧。",
    structure:"知識庫結構",categoriesLabel:"分類",topicsLabel:"主題",languagesLabel:"語言",topicCount:n=>n+" 個主題",open:"開啟",
    guidelines:"整理建議",guidelineTitle:"只保留之後還會查閱的內容",guidelinesList:["專案決策要記錄原因與限制。","除錯記錄保留現象、原因與最終修正。","臨時待辦與原始檔案繼續放在對應工具中。"],
    base:"知識庫",category:"分類",previous:"上一篇",next:"下一篇",back:"返回",categories:"知識分類",
    cats:{projects:["專案","專案決策、實作記錄與可重用背景。"],technology:["技術","技術參考、平台、工具與工程記錄。"],study:["學習","課程、學習筆記、概念與練習。"],methodology:["方法論","可重用的方法、流程與問題分析方式。"],references:["參考資料","論文、文件、參考連結與外部材料。"],archive:["封存","保留供日後查閱的舊資料。"]}
  },
  "ja-jp": {
    rootTitle:"ナレッジベース",rootDescription:"プロジェクト、技術、学習、参考資料ごとに整理し、全文検索できます。",
    introTitle:"プロジェクト、技術、学習ノート",introLead:"プロジェクトメモ、開発記録、講義資料、参考情報をカテゴリ別に整理します。各トピックには固定ページがあり、直接検索できます。",
    structure:"ナレッジ構成",categoriesLabel:"カテゴリ",topicsLabel:"トピック",languagesLabel:"言語",topicCount:n=>n+" 件",open:"開く",
    guidelines:"整理の指針",guidelineTitle:"後で使う情報だけを残す",guidelinesList:["プロジェクト判断の理由と制約を記録します。","デバッグ記録には現象、原因、最終修正を残します。","一時的なタスクや生ファイルは専用ツールに置きます。"],
    base:"ナレッジベース",category:"カテゴリ",previous:"前へ",next:"次へ",back:"戻る",categories:"ナレッジカテゴリ",
    cats:{projects:["プロジェクト","プロジェクト判断、実装メモ、再利用できる背景情報。"],technology:["テクノロジー","技術資料、プラットフォーム、ツール、エンジニアリングノート。"],study:["学習","講義、学習ノート、概念、演習。"],methodology:["方法論","再利用できる手法、ワークフロー、問題解決方法。"],references:["参考資料","論文、ドキュメント、参考リンク、外部資料。"],archive:["アーカイブ","後で参照するために残した過去の資料。"]}
  },
  "ko-kr": {
    rootTitle:"지식 베이스",rootDescription:"프로젝트, 기술, 학습 및 참고 자료별로 정리하고 전체 텍스트 검색을 지원합니다.",
    introTitle:"프로젝트, 기술 및 학습 노트",introLead:"프로젝트 메모, 개발 기록, 강의 자료 및 참고 자료를 범주별로 정리합니다. 각 주제에는 고정 페이지가 있으며 직접 검색할 수 있습니다.",
    structure:"지식 구조",categoriesLabel:"범주",topicsLabel:"주제",languagesLabel:"언어",topicCount:n=>n+"개 주제",open:"열기",
    guidelines:"정리 지침",guidelineTitle:"다시 사용할 자료만 보관하세요",guidelinesList:["프로젝트 결정의 이유와 제약을 기록하세요.","디버깅 기록에는 현상, 원인 및 최종 수정 내용을 남기세요.","임시 작업과 원본 파일은 해당 도구에 보관하세요."],
    base:"지식 베이스",category:"범주",previous:"이전",next:"다음",back:"뒤로",categories:"지식 범주",
    cats:{projects:["프로젝트","프로젝트 결정, 구현 기록 및 재사용 가능한 맥락."],technology:["기술","기술 참고 자료, 플랫폼, 도구 및 엔지니어링 노트."],study:["학습","강의, 학습 노트, 개념 및 연습."],methodology:["방법론","재사용 가능한 방법, 워크플로 및 문제 해결 방식."],references:["참고 자료","논문, 문서, 참고 링크 및 외부 자료."],archive:["보관함","나중에 참고할 이전 자료."]}
  },
  "fr-fr": {
    rootTitle:"Base de connaissances",rootDescription:"Organisation par projets, technologie, études et références, avec recherche en texte intégral.",
    introTitle:"Projets, technologie et notes d’étude",introLead:"Les notes de projet, journaux de développement, cours et références sont organisés par catégorie. Chaque sujet dispose d’une page stable et peut être recherché directement.",
    structure:"Structure des connaissances",categoriesLabel:"catégories",topicsLabel:"sujets",languagesLabel:"langues",topicCount:n=>n+" sujets",open:"Ouvrir",
    guidelines:"Principes",guidelineTitle:"Conservez ce que vous prévoyez de réutiliser",guidelinesList:["Notez les raisons et contraintes des décisions de projet.","Pour le débogage, conservez le symptôme, la cause et la correction finale.","Gardez les tâches temporaires et fichiers bruts dans leurs outils dédiés."],
    base:"Base de connaissances",category:"Catégorie",previous:"Précédent",next:"Suivant",back:"Retour",categories:"Catégories de connaissances",
    cats:{projects:["Projets","Décisions, notes d’implémentation et contexte réutilisable."],technology:["Technologie","Références techniques, plateformes, outils et notes d’ingénierie."],study:["Études","Cours, notes d’apprentissage, concepts et exercices."],methodology:["Méthodologie","Méthodes, flux de travail et approches de résolution réutilisables."],references:["Références","Articles, documentation, liens et ressources externes."],archive:["Archives","Anciennes ressources conservées pour référence."]}
  },
  "es-es": {
    rootTitle:"Base de conocimiento",rootDescription:"Organizada por proyectos, tecnología, estudio y referencias, con búsqueda de texto completo.",
    introTitle:"Proyectos, tecnología y notas de estudio",introLead:"Las notas de proyectos, registros de desarrollo, material de cursos y referencias se organizan por categoría. Cada tema tiene una página estable y puede buscarse directamente.",
    structure:"Estructura del conocimiento",categoriesLabel:"categorías",topicsLabel:"temas",languagesLabel:"idiomas",topicCount:n=>n+" temas",open:"Abrir",
    guidelines:"Directrices",guidelineTitle:"Conserva el material que esperas volver a usar",guidelinesList:["Registra las razones y restricciones de las decisiones del proyecto.","En las notas de depuración, conserva el síntoma, la causa y la solución final.","Mantén las tareas temporales y archivos sin procesar en sus herramientas correspondientes."],
    base:"Base de conocimiento",category:"Categoría",previous:"Anterior",next:"Siguiente",back:"Volver",categories:"Categorías de conocimiento",
    cats:{projects:["Proyectos","Decisiones, notas de implementación y contexto reutilizable."],technology:["Tecnología","Referencias técnicas, plataformas, herramientas y notas de ingeniería."],study:["Estudio","Cursos, notas de aprendizaje, conceptos y ejercicios."],methodology:["Metodología","Métodos, flujos de trabajo y formas de resolver problemas reutilizables."],references:["Referencias","Artículos, documentación, enlaces y material externo."],archive:["Archivo","Material antiguo conservado para consulta."]}
  },
  "el-gr": {
    rootTitle:"Βάση γνώσεων",rootDescription:"Οργανωμένη ανά έργο, τεχνολογία, μελέτη και αναφορές, με αναζήτηση πλήρους κειμένου.",
    introTitle:"Έργα, τεχνολογία και σημειώσεις μελέτης",introLead:"Οι σημειώσεις έργων, τα αρχεία ανάπτυξης, το υλικό μαθημάτων και οι αναφορές οργανώνονται ανά κατηγορία. Κάθε θέμα έχει σταθερή σελίδα και μπορεί να αναζητηθεί άμεσα.",
    structure:"Δομή γνώσεων",categoriesLabel:"κατηγορίες",topicsLabel:"θέματα",languagesLabel:"γλώσσες",topicCount:n=>n+" θέματα",open:"Άνοιγμα",
    guidelines:"Οδηγίες",guidelineTitle:"Κρατήστε υλικό που θα χρησιμοποιήσετε ξανά",guidelinesList:["Καταγράψτε τους λόγους και τους περιορισμούς πίσω από τις αποφάσεις έργου.","Στις σημειώσεις εντοπισμού σφαλμάτων κρατήστε το σύμπτωμα, την αιτία και την τελική διόρθωση.","Διατηρήστε προσωρινές εργασίες και ακατέργαστα αρχεία στα αντίστοιχα εργαλεία."],
    base:"Βάση γνώσεων",category:"Κατηγορία",previous:"Προηγούμενο",next:"Επόμενο",back:"Πίσω",categories:"Κατηγορίες γνώσεων",
    cats:{projects:["Έργα","Αποφάσεις έργων, σημειώσεις υλοποίησης και επαναχρησιμοποιήσιμο πλαίσιο."],technology:["Τεχνολογία","Τεχνικές αναφορές, πλατφόρμες, εργαλεία και σημειώσεις μηχανικής."],study:["Μελέτη","Μαθήματα, σημειώσεις μάθησης, έννοιες και ασκήσεις."],methodology:["Μεθοδολογία","Επαναχρησιμοποιήσιμες μέθοδοι, ροές εργασίας και τρόποι επίλυσης προβλημάτων."],references:["Αναφορές","Άρθρα, τεκμηρίωση, σύνδεσμοι και εξωτερικό υλικό."],archive:["Αρχείο","Παλαιότερο υλικό που διατηρείται για αναφορά."]}
  },
  "ar-sa": {
    rootTitle:"قاعدة المعرفة",rootDescription:"منظمة حسب المشروعات والتقنية والدراسة والمراجع، مع دعم البحث في النص الكامل.",
    introTitle:"المشروعات والتقنية وملاحظات الدراسة",introLead:"تُنظَّم ملاحظات المشروعات وسجلات التطوير ومواد الدراسة والمراجع حسب الفئة. لكل موضوع صفحة ثابتة ويمكن البحث فيه مباشرة.",
    structure:"بنية المعرفة",categoriesLabel:"فئات",topicsLabel:"موضوعات",languagesLabel:"لغات",topicCount:n=>n+" موضوعًا",open:"فتح",
    guidelines:"إرشادات",guidelineTitle:"احتفظ بالمواد التي تتوقع استخدامها مرة أخرى",guidelinesList:["سجّل أسباب وقيود قرارات المشروع.","في ملاحظات تصحيح الأخطاء احتفظ بالعرض والسبب والحل النهائي.","احتفظ بالمهام المؤقتة والملفات الخام في أدواتها المخصصة."],
    base:"قاعدة المعرفة",category:"الفئة",previous:"السابق",next:"التالي",back:"رجوع",categories:"فئات المعرفة",
    cats:{projects:["المشروعات","قرارات المشروعات وملاحظات التنفيذ والسياق القابل لإعادة الاستخدام."],technology:["التقنية","المراجع التقنية والمنصات والأدوات وملاحظات الهندسة."],study:["الدراسة","الدورات وملاحظات التعلم والمفاهيم والتمارين."],methodology:["المنهجية","الأساليب وسير العمل وطرق حل المشكلات القابلة لإعادة الاستخدام."],references:["المراجع","الأوراق والوثائق والروابط والمواد الخارجية."],archive:["الأرشيف","مواد أقدم محفوظة للرجوع إليها."]}
  }
};
KNOWLEDGE_UI["en-gb"]=KNOWLEDGE_UI["en-us"]; KNOWLEDGE_UI["en-au"]=KNOWLEDGE_UI["en-us"];

function knowledgeUi(locale, zh) {
  return KNOWLEDGE_UI[locale] || KNOWLEDGE_UI[zh ? "zh-cn" : "en-us"];
}

const CONTENT_BY_CATEGORY = {
  projects: PROJECT_KNOWLEDGE,
  technology: TECHNOLOGY_KNOWLEDGE,
  study: STUDY_KNOWLEDGE,
  methodology: METHODOLOGY_KNOWLEDGE,
  references: REFERENCE_KNOWLEDGE,
  archive: ARCHIVE_KNOWLEDGE
};

const CATEGORY_ICONS = {
  projects: '<path d="M4 7.5h6l1.7 2H20v8.8a1.7 1.7 0 01-1.7 1.7H5.7A1.7 1.7 0 014 18.3V7.5z"/><path d="M4 10h16"/>',
  technology: '<rect x="4" y="5" width="16" height="14" rx="3"/><path d="M8 9l-2 3 2 3M16 9l2 3-2 3M13 8l-2 8"/>',
  study: '<path d="M3 7.5L12 3l9 4.5-9 4.5-9-4.5z"/><path d="M6 10v5.5c2.5 2 9.5 2 12 0V10"/>',
  methodology: '<circle cx="12" cy="12" r="8"/><path d="M8.5 12l2.2 2.2 4.8-5M12 4v2M20 12h-2M12 20v-2M4 12h2"/>',
  references: '<path d="M5 4.5h10a2 2 0 012 2v13H7a2 2 0 01-2-2v-13z"/><path d="M7 17.5h12V7.5h-2M9 8h5M9 11h5"/>',
  archive: '<path d="M5 7h14v12H5z"/><path d="M4 4h16v3H4zM9 11h6"/>'
};

function iconFor(category) {
  return `<span class="knowledge-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${CATEGORY_ICONS[category.slug] || CATEGORY_ICONS.references}</svg></span>`;
}

function prefixFor(zh, locale = "") {
  return "/" + (locale || (zh ? "zh-cn" : "en-us"));
}

function categoryHref(category, zh, locale = "") {
  return `${prefixFor(zh, locale)}${KNOWLEDGE_ROOT}/${category.slug}`;
}

function topicHref(category, item, zh, locale = "") {
  return `${categoryHref(category, zh, locale)}/${item[0]}`;
}

function categoryLabel(category, ui, zh) {
  return ui.cats?.[category.slug]?.[0] || (zh ? category.zh : category.en);
}

function categoryDescription(category, ui, zh) {
  return ui.cats?.[category.slug]?.[1] || (zh ? category.zhDescription : category.enDescription);
}

function itemLabel(item, locale, zh) {
  return zh ? item[1] : item[2];
}


export function knowledgePageMeta(path, zh, locale = "") {
  const route = getKnowledgeRoute(path);
  if (!route) return null;
  const ui = knowledgeUi(locale, zh);
  if (route.type === "root") return { section:"info", title:ui.rootTitle, description:ui.rootDescription };
  if (route.type === "category") return { section:"info", title:categoryLabel(route.category, ui, zh), description:categoryDescription(route.category, ui, zh) };
  const content = CONTENT_BY_CATEGORY[route.category.slug]?.[route.item[0]]?.[zh ? "zh" : "en"];
  return { section:"info", title:itemLabel(route.item, locale, zh), description:content?.summary || categoryDescription(route.category, ui, zh) };
}

export function knowledgeContent(path, zh, locale = "") {
  const route = getKnowledgeRoute(path);
  if (!route) throw new Error("Unhandled knowledge path: " + path);
  if (route.type === "root") return knowledgeRootContent(zh, locale);
  if (route.type === "category") return knowledgeCategoryContent(route.category, zh, locale);
  return knowledgeTopicContent(route.category, route.item, zh, locale);
}

function knowledgeRootContent(zh, locale) {
  const ui = knowledgeUi(locale, zh);
  const topicCount = KNOWLEDGE_CATEGORIES.reduce((sum, category) => sum + category.items.length, 0);
  return `
    <div class="knowledge-shell knowledge-root">
      ${knowledgeSearchPanel(zh)}
      <section class="knowledge-intro-panel">
        <div>
          <span class="knowledge-overline">AERTEX Knowledge</span>
          <h2>${ui.introTitle}</h2>
          <p>${ui.introLead}</p>
        </div>
        <div class="knowledge-intro-stats" aria-label="${ui.structure}">
          <div><strong>${KNOWLEDGE_CATEGORIES.length}</strong><span>${ui.categoriesLabel}</span></div>
          <div><strong>${topicCount}</strong><span>${ui.topicsLabel}</span></div>
          <div><strong>11</strong><span>${ui.languagesLabel}</span></div>
        </div>
      </section>
      <section class="knowledge-category-grid">
        ${KNOWLEDGE_CATEGORIES.map(category => `
          <a class="knowledge-category-card" href="${categoryHref(category, zh, locale)}">
            ${iconFor(category)}
            <span class="knowledge-category-count">${ui.topicCount(category.items.length)}</span>
            <h3>${categoryLabel(category, ui, zh)}</h3>
            <p>${categoryDescription(category, ui, zh)}</p>
            <span class="knowledge-card-action">${ui.open}<b aria-hidden="true">›</b></span>
          </a>
        `).join("")}
      </section>
      <section class="knowledge-guidance os-card">
        <div><small>${ui.guidelines}</small><h3>${ui.guidelineTitle}</h3></div>
        <ul>${ui.guidelinesList.map(item => `<li>${item}</li>`).join("")}</ul>
      </section>
    </div>`;
}

function knowledgeCategoryContent(category, zh, locale) {
  const ui = knowledgeUi(locale, zh);
  return `
    <div class="knowledge-shell">
      ${knowledgeSearchPanel(zh)}
      ${breadcrumbs([{ label:ui.base, href:`${prefixFor(zh, locale)}${KNOWLEDGE_ROOT}` }, { label:categoryLabel(category, ui, zh) }])}
      <section class="knowledge-category-hero">
        ${iconFor(category)}
        <div><span class="knowledge-overline">${ui.category}</span><h2>${categoryLabel(category, ui, zh)}</h2><p>${categoryDescription(category, ui, zh)}</p></div>
      </section>
      <section class="knowledge-topic-grid">
        ${category.items.map((item, index) => `
          <a class="knowledge-topic-card" href="${topicHref(category, item, zh, locale)}">
            <span class="knowledge-topic-index">${String(index + 1).padStart(2, "0")}</span>
            <div><h3>${itemLabel(item, locale, zh)}</h3><p>${topicSummary(category, item, zh, locale)}</p></div><b aria-hidden="true">›</b>
          </a>
        `).join("")}
      </section>
      ${categorySwitcher(category, zh, locale)}
    </div>`;
}

function topicSummary(category, item, zh, locale) {
  const ui = knowledgeUi(locale, zh);
  return CONTENT_BY_CATEGORY[category.slug]?.[item[0]]?.[zh ? "zh" : "en"]?.summary || categoryDescription(category, ui, zh);
}

function knowledgeTopicContent(category, item, zh, locale) {
  const ui = knowledgeUi(locale, zh);
  const localized = CONTENT_BY_CATEGORY[category.slug]?.[item[0]]?.[zh ? "zh" : "en"];
  if (!localized) throw new Error(`Missing knowledge content: ${category.slug}/${item[0]}`);
  const currentIndex = category.items.findIndex(entry => entry[0] === item[0]);
  const previous = currentIndex > 0 ? category.items[currentIndex - 1] : null;
  const next = currentIndex < category.items.length - 1 ? category.items[currentIndex + 1] : null;
  return `
    <div class="knowledge-shell knowledge-article-layout">
      ${knowledgeSearchPanel(zh)}
      ${breadcrumbs([
        { label:ui.base, href:`${prefixFor(zh, locale)}${KNOWLEDGE_ROOT}` },
        { label:categoryLabel(category, ui, zh), href:categoryHref(category, zh, locale) },
        { label:itemLabel(item, locale, zh) }
      ])}
      <div class="knowledge-article-grid">
        <aside class="knowledge-local-nav">
          <a class="knowledge-local-heading" href="${categoryHref(category, zh, locale)}">${iconFor(category)}<span>${categoryLabel(category, ui, zh)}</span></a>
          <div>${category.items.map(entry => `<a href="${topicHref(category, entry, zh, locale)}"${entry[0] === item[0] ? ' aria-current="page"' : ""}>${itemLabel(entry, locale, zh)}</a>`).join("")}</div>
        </aside>
        <article class="knowledge-article">
          <header class="knowledge-article-header"><span class="knowledge-overline">${categoryLabel(category, ui, zh)}</span><h2>${itemLabel(item, locale, zh)}</h2><p>${localized.summary}</p></header>
          <div class="knowledge-article-body">${(localized.sections || []).map((section, index) => renderSection(section, index)).join("")}</div>
          <footer class="knowledge-article-footer">
            ${previous ? `<a class="knowledge-page-link previous" href="${topicHref(category, previous, zh, locale)}"><small>${ui.previous}</small><strong>‹ ${itemLabel(previous, locale, zh)}</strong></a>` : `<span></span>`}
            ${next ? `<a class="knowledge-page-link next" href="${topicHref(category, next, zh, locale)}"><small>${ui.next}</small><strong>${itemLabel(next, locale, zh)} ›</strong></a>` : `<a class="knowledge-page-link next" href="${categoryHref(category, zh, locale)}"><small>${ui.back}</small><strong>${categoryLabel(category, ui, zh)} ›</strong></a>`}
          </footer>
        </article>
      </div>
      ${categorySwitcher(category, zh, locale)}
    </div>`;
}

function categorySwitcher(activeCategory, zh, locale) {
  const ui = knowledgeUi(locale, zh);
  return `
    <nav class="knowledge-category-switcher" aria-label="${ui.categories}">
      ${KNOWLEDGE_CATEGORIES.map(category => `<a href="${categoryHref(category, zh, locale)}"${category.slug === activeCategory.slug ? ' aria-current="page"' : ""}>${categoryLabel(category, ui, zh)}</a>`).join("")}
    </nav>`;
}

function renderSection(section, index) {
  return `
    <section class="knowledge-section" id="knowledge-section-${index + 1}">
      <span class="knowledge-section-number">${String(index + 1).padStart(2, "0")}</span>
      <div>
        <h3>${section.title}</h3>
        ${(section.paragraphs || []).map(paragraph => `<p>${paragraph}</p>`).join("")}
        ${section.bullets?.length ? `<ul>${section.bullets.map(item => `<li>${item}</li>`).join("")}</ul>` : ""}
        ${section.code ? `<pre class="knowledge-code"><code>${escapeCode(section.code)}</code></pre>` : ""}
      </div>
    </section>`;
}

function escapeCode(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function breadcrumbs(items) {
  return `<nav class="knowledge-breadcrumbs" aria-label="Breadcrumb">${items.map((item, index) => `${index ? '<span aria-hidden="true">›</span>' : ""}${item.href ? `<a href="${item.href}">${item.label}</a>` : `<strong>${item.label}</strong>`}`).join("")}</nav>`;
}

