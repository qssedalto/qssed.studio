export const LAB_TOOL_CATEGORIES = {
  core: { zh: "AERTEX 工具", en: "AERTEX Tools" },
  tex: { zh: "TeX 与文档", en: "TeX & Documents" },
  ai: { zh: "AI 工具", en: "AI Tools" },
  media: { zh: "媒体处理", en: "Media Processing" },
  engineering: { zh: "工程工具", en: "Engineering" }
};

export const LAB_TOOLS = [
  {
    id: "global-search",
    category: "core",
    status: "ready",
    href: "/info/search",
    title: { zh: "全局搜索", en: "Global Search" },
    description: { zh: "统一搜索知识库、笔记、摘要和链接。", en: "Search Knowledge, notes, summaries, and links in one place." },
    capabilities: { zh: ["账号范围", "跨模块", "中文搜索"], en: ["Account scoped", "Cross-module", "CJK search"] }
  },
  {
    id: "knowledge",
    category: "core",
    status: "ready",
    href: "/info/knowledge",
    title: { zh: "知识库", en: "Knowledge Base" },
    description: { zh: "整理、保存并检索长期知识内容。", en: "Organize, preserve, and search long-term knowledge." },
    capabilities: { zh: ["持久化", "搜索", "分类"], en: ["Persistent", "Search", "Categories"] }
  },
  {
    id: "notes",
    category: "core",
    status: "ready",
    href: "/info/notes",
    title: { zh: "研究笔记", en: "Research Notes" },
    description: { zh: "记录研究过程、结论与下一步。", en: "Capture research process, conclusions, and next steps." },
    capabilities: { zh: ["账号笔记", "持续编辑", "研究结构"], en: ["Account notes", "Ongoing editing", "Research structure"] }
  },
  {
    id: "summaries",
    category: "core",
    status: "ready",
    href: "/info/summaries",
    title: { zh: "内容摘要", en: "Summaries" },
    description: { zh: "把长材料整理成可回顾的结构化摘要。", en: "Turn long material into structured summaries worth revisiting." },
    capabilities: { zh: ["结构化", "自动保存", "全局搜索"], en: ["Structured", "Autosave", "Global search"] }
  },
  {
    id: "tex-workbench",
    category: "tex",
    status: "ready",
    href: "/work/tex",
    title: { zh: "TeX 工作台", en: "TeX Workbench" },
    description: { zh: "账号级 TeX 源码编辑、模板、自动保存与安全编译桥接。", en: "Account-scoped TeX editing, templates, autosave, and a protected compiler bridge." },
    capabilities: { zh: ["源码编辑", "自动保存", "编译桥接"], en: ["Source editor", "Autosave", "Compiler bridge"] }
  },
  {
    id: "document-pipeline",
    category: "tex",
    status: "planned",
    href: "",
    title: { zh: "文档处理管线", en: "Document Pipeline" },
    description: { zh: "把 Markdown、TeX、PDF 和结构化内容串成可重复工作流。", en: "Connect Markdown, TeX, PDF, and structured content into repeatable workflows." },
    capabilities: { zh: ["Markdown", "PDF", "转换"], en: ["Markdown", "PDF", "Conversion"] }
  },
  {
    id: "ai-extract",
    category: "ai",
    status: "planned",
    href: "",
    title: { zh: "AI 信息提取", en: "AI Extraction" },
    description: { zh: "从文档或长文本提取结构、结论、实体与待办。", en: "Extract structure, conclusions, entities, and actions from documents or long text." },
    capabilities: { zh: ["提取", "结构化", "自动归档"], en: ["Extraction", "Structuring", "Auto filing"] }
  },
  {
    id: "ai-rewrite",
    category: "ai",
    status: "planned",
    href: "",
    title: { zh: "AI 改写与整理", en: "AI Rewrite & Organize" },
    description: { zh: "把草稿改写为摘要、笔记、说明或其他目标格式。", en: "Transform drafts into summaries, notes, explanations, or other target formats." },
    capabilities: { zh: ["改写", "格式转换", "账号内容"], en: ["Rewrite", "Format conversion", "Account content"] }
  },
  {
    id: "media-enhance",
    category: "media",
    status: "planned",
    href: "",
    title: { zh: "媒体增强", en: "Media Enhancement" },
    description: { zh: "为后续图像、视频增强和转码工作流预留统一入口。", en: "A future home for image/video enhancement and transcoding workflows." },
    capabilities: { zh: ["图像", "视频", "转码"], en: ["Image", "Video", "Transcode"] }
  },
  {
    id: "repo-helper",
    category: "engineering",
    status: "planned",
    href: "",
    title: { zh: "工程辅助工具", en: "Engineering Helper" },
    description: { zh: "为仓库检查、构建、发布和工程自动化保留可扩展位置。", en: "An extensible home for repository checks, builds, deployment, and engineering automation." },
    capabilities: { zh: ["Git", "构建", "自动化"], en: ["Git", "Build", "Automation"] }
  }
];

export const LAB_TOOL_LOCALIZATIONS = {
  "zh-tw": {
    categories:{core:"AERTEX 工具",tex:"TeX 與文件",ai:"AI 工具",media:"媒體處理",engineering:"工程工具"},
    tools:{
      "global-search":["全域搜尋","統一搜尋知識庫、筆記、摘要與連結。",["帳號範圍","跨模組","CJK 搜尋"]],
      "knowledge":["知識庫","整理、保存並搜尋長期知識內容。",["持久化","搜尋","分類"]],
      "notes":["研究筆記","記錄研究過程、結論與下一步。",["帳號筆記","持續編輯","研究結構"]],
      "summaries":["內容摘要","把長篇材料整理成方便回顧的結構化摘要。",["結構化","自動儲存","全域搜尋"]],
      "tex-workbench":["TeX 工作台","帳號級 TeX 原始碼編輯、範本、自動儲存與安全編譯橋接。",["原始碼編輯","自動儲存","編譯橋接"]],
      "document-pipeline":["文件處理管線","把 Markdown、TeX、PDF 與結構化內容串成可重複工作流程。",["Markdown","PDF","轉換"]],
      "ai-extract":["AI 資訊擷取","從文件或長文字擷取結構、結論、實體與待辦。",["擷取","結構化","自動歸檔"]],
      "ai-rewrite":["AI 改寫與整理","把草稿轉換成摘要、筆記、說明或其他目標格式。",["改寫","格式轉換","帳號內容"]],
      "media-enhance":["媒體增強","為後續圖像、影片增強與轉碼工作流程提供統一入口。",["圖像","影片","轉碼"]],
      "repo-helper":["工程輔助工具","為儲存庫檢查、建置、部署與工程自動化保留可擴充位置。",["Git","建置","自動化"]]
    }
  },
  "ja-jp": {
    categories:{core:"AERTEX ツール",tex:"TeX・ドキュメント",ai:"AI ツール",media:"メディア処理",engineering:"エンジニアリング"},
    tools:{
      "global-search":["グローバル検索","Knowledge、ノート、要約、リンクをまとめて検索します。",["アカウント範囲","横断検索","CJK 検索"]],
      "knowledge":["ナレッジベース","長期的な知識を整理、保存、検索します。",["永続化","検索","カテゴリ"]],
      "notes":["研究ノート","研究過程、結論、次のステップを記録します。",["アカウントノート","継続編集","研究構造"]],
      "summaries":["要約","長い資料を再確認しやすい構造化要約にします。",["構造化","自動保存","グローバル検索"]],
      "tex-workbench":["TeX ワークベンチ","アカウント単位の TeX 編集、テンプレート、自動保存、安全なコンパイラ連携。",["ソース編集","自動保存","コンパイラ連携"]],
      "document-pipeline":["ドキュメントパイプライン","Markdown、TeX、PDF、構造化コンテンツを再利用可能なワークフローにつなぎます。",["Markdown","PDF","変換"]],
      "ai-extract":["AI 情報抽出","文書や長文から構造、結論、エンティティ、アクションを抽出します。",["抽出","構造化","自動整理"]],
      "ai-rewrite":["AI リライト・整理","下書きを要約、ノート、説明などの形式へ変換します。",["リライト","形式変換","アカウントコンテンツ"]],
      "media-enhance":["メディア強化","画像・動画の強化やトランスコード用ワークフローの入口です。",["画像","動画","トランスコード"]],
      "repo-helper":["エンジニアリング支援","リポジトリ検査、ビルド、デプロイ、自動化のための拡張可能な領域です。",["Git","ビルド","自動化"]]
    }
  },
  "ko-kr": {
    categories:{core:"AERTEX 도구",tex:"TeX 및 문서",ai:"AI 도구",media:"미디어 처리",engineering:"엔지니어링"},
    tools:{
      "global-search":["전체 검색","Knowledge, 노트, 요약과 링크를 한곳에서 검색합니다.",["계정 범위","모듈 간 검색","CJK 검색"]],
      "knowledge":["지식 베이스","장기 지식을 정리하고 저장하며 검색합니다.",["영구 저장","검색","분류"]],
      "notes":["연구 노트","연구 과정, 결론과 다음 단계를 기록합니다.",["계정 노트","지속 편집","연구 구조"]],
      "summaries":["요약","긴 자료를 다시 보기 좋은 구조화된 요약으로 정리합니다.",["구조화","자동 저장","전체 검색"]],
      "tex-workbench":["TeX 워크벤치","계정 단위 TeX 편집, 템플릿, 자동 저장 및 안전한 컴파일러 브리지를 제공합니다.",["소스 편집","자동 저장","컴파일러 브리지"]],
      "document-pipeline":["문서 파이프라인","Markdown, TeX, PDF와 구조화된 콘텐츠를 반복 가능한 워크플로로 연결합니다.",["Markdown","PDF","변환"]],
      "ai-extract":["AI 정보 추출","문서나 긴 텍스트에서 구조, 결론, 엔터티와 할 일을 추출합니다.",["추출","구조화","자동 정리"]],
      "ai-rewrite":["AI 재작성 및 정리","초안을 요약, 노트, 설명 또는 다른 목표 형식으로 변환합니다.",["재작성","형식 변환","계정 콘텐츠"]],
      "media-enhance":["미디어 향상","이미지·동영상 향상 및 트랜스코딩 워크플로를 위한 통합 진입점입니다.",["이미지","동영상","트랜스코딩"]],
      "repo-helper":["엔지니어링 도우미","저장소 검사, 빌드, 배포 및 엔지니어링 자동화를 위한 확장 가능한 공간입니다.",["Git","빌드","자동화"]]
    }
  },
  "fr-fr": {
    categories:{core:"Outils AERTEX",tex:"TeX et documents",ai:"Outils IA",media:"Traitement multimédia",engineering:"Ingénierie"},
    tools:{
      "global-search":["Recherche globale","Recherchez Knowledge, notes, résumés et liens au même endroit.",["Portée du compte","Inter-modules","Recherche CJK"]],
      "knowledge":["Base de connaissances","Organisez, conservez et recherchez les connaissances à long terme.",["Persistant","Recherche","Catégories"]],
      "notes":["Notes de recherche","Consignez le processus de recherche, les conclusions et les prochaines étapes.",["Notes du compte","Édition continue","Structure de recherche"]],
      "summaries":["Résumés","Transformez les contenus longs en résumés structurés faciles à retrouver.",["Structuré","Enregistrement auto","Recherche globale"]],
      "tex-workbench":["Workbench TeX","Édition TeX par compte, modèles, enregistrement automatique et passerelle de compilation protégée.",["Éditeur source","Enregistrement auto","Passerelle de compilation"]],
      "document-pipeline":["Pipeline documentaire","Reliez Markdown, TeX, PDF et contenu structuré dans des workflows reproductibles.",["Markdown","PDF","Conversion"]],
      "ai-extract":["Extraction IA","Extrayez structure, conclusions, entités et actions depuis des documents ou textes longs.",["Extraction","Structuration","Classement auto"]],
      "ai-rewrite":["Réécriture et organisation IA","Transformez des brouillons en résumés, notes, explications ou autres formats.",["Réécriture","Conversion de format","Contenu du compte"]],
      "media-enhance":["Amélioration multimédia","Point d’entrée futur pour l’amélioration d’images/vidéos et le transcodage.",["Image","Vidéo","Transcodage"]],
      "repo-helper":["Assistant d’ingénierie","Espace extensible pour contrôles de dépôt, builds, déploiement et automatisation.",["Git","Build","Automatisation"]]
    }
  },
  "es-es": {
    categories:{core:"Herramientas AERTEX",tex:"TeX y documentos",ai:"Herramientas de IA",media:"Procesamiento multimedia",engineering:"Ingeniería"},
    tools:{
      "global-search":["Búsqueda global","Busca Knowledge, notas, resúmenes y enlaces en un solo lugar.",["Ámbito de cuenta","Entre módulos","Búsqueda CJK"]],
      "knowledge":["Base de conocimiento","Organiza, conserva y busca conocimiento a largo plazo.",["Persistente","Búsqueda","Categorías"]],
      "notes":["Notas de investigación","Registra el proceso de investigación, conclusiones y próximos pasos.",["Notas de cuenta","Edición continua","Estructura de investigación"]],
      "summaries":["Resúmenes","Convierte materiales largos en resúmenes estructurados fáciles de revisar.",["Estructurado","Guardado automático","Búsqueda global"]],
      "tex-workbench":["Workbench TeX","Edición TeX por cuenta, plantillas, guardado automático y puente de compilación protegido.",["Editor de código","Guardado automático","Puente de compilación"]],
      "document-pipeline":["Pipeline de documentos","Conecta Markdown, TeX, PDF y contenido estructurado en flujos repetibles.",["Markdown","PDF","Conversión"]],
      "ai-extract":["Extracción con IA","Extrae estructura, conclusiones, entidades y acciones de documentos o textos largos.",["Extracción","Estructuración","Archivo automático"]],
      "ai-rewrite":["Reescritura y organización con IA","Transforma borradores en resúmenes, notas, explicaciones u otros formatos.",["Reescritura","Conversión de formato","Contenido de cuenta"]],
      "media-enhance":["Mejora multimedia","Punto de entrada futuro para mejora de imagen/vídeo y transcodificación.",["Imagen","Vídeo","Transcodificación"]],
      "repo-helper":["Asistente de ingeniería","Espacio extensible para comprobaciones de repositorio, builds, despliegue y automatización.",["Git","Build","Automatización"]]
    }
  },
  "el-gr": {
    categories:{core:"Εργαλεία AERTEX",tex:"TeX και έγγραφα",ai:"Εργαλεία AI",media:"Επεξεργασία πολυμέσων",engineering:"Μηχανική"},
    tools:{
      "global-search":["Καθολική αναζήτηση","Αναζητήστε Knowledge, σημειώσεις, περιλήψεις και συνδέσμους σε ένα σημείο.",["Πεδίο λογαριασμού","Διαμονάδες","Αναζήτηση CJK"]],
      "knowledge":["Βάση γνώσης","Οργανώστε, διατηρήστε και αναζητήστε μακροχρόνια γνώση.",["Μόνιμη αποθήκευση","Αναζήτηση","Κατηγορίες"]],
      "notes":["Ερευνητικές σημειώσεις","Καταγράψτε τη διαδικασία έρευνας, συμπεράσματα και επόμενα βήματα.",["Σημειώσεις λογαριασμού","Συνεχής επεξεργασία","Δομή έρευνας"]],
      "summaries":["Περιλήψεις","Μετατρέψτε μεγάλα κείμενα σε δομημένες περιλήψεις για εύκολη επανάληψη.",["Δομημένο","Αυτόματη αποθήκευση","Καθολική αναζήτηση"]],
      "tex-workbench":["Workbench TeX","Επεξεργασία TeX ανά λογαριασμό, πρότυπα, αυτόματη αποθήκευση και προστατευμένη γέφυρα μεταγλώττισης.",["Επεξεργαστής πηγαίου","Αυτόματη αποθήκευση","Γέφυρα μεταγλώττισης"]],
      "document-pipeline":["Ροή εγγράφων","Συνδέστε Markdown, TeX, PDF και δομημένο περιεχόμενο σε επαναχρησιμοποιήσιμες ροές.",["Markdown","PDF","Μετατροπή"]],
      "ai-extract":["Εξαγωγή AI","Εξαγάγετε δομή, συμπεράσματα, οντότητες και ενέργειες από έγγραφα ή μεγάλα κείμενα.",["Εξαγωγή","Δόμηση","Αυτόματη αρχειοθέτηση"]],
      "ai-rewrite":["Επανεγγραφή και οργάνωση AI","Μετατρέψτε προσχέδια σε περιλήψεις, σημειώσεις, επεξηγήσεις ή άλλες μορφές.",["Επανεγγραφή","Μετατροπή μορφής","Περιεχόμενο λογαριασμού"]],
      "media-enhance":["Βελτίωση πολυμέσων","Μελλοντική είσοδος για βελτίωση εικόνας/βίντεο και διακωδικοποίηση.",["Εικόνα","Βίντεο","Διακωδικοποίηση"]],
      "repo-helper":["Βοηθός μηχανικής","Επεκτάσιμος χώρος για ελέγχους αποθετηρίου, builds, ανάπτυξη και αυτοματοποίηση.",["Git","Build","Αυτοματισμός"]]
    }
  },
  "ar-sa": {
    categories:{core:"أدوات AERTEX",tex:"TeX والمستندات",ai:"أدوات الذكاء الاصطناعي",media:"معالجة الوسائط",engineering:"الهندسة"},
    tools:{
      "global-search":["البحث الشامل","ابحث في Knowledge والملاحظات والملخصات والروابط من مكان واحد.",["نطاق الحساب","عبر الوحدات","بحث CJK"]],
      "knowledge":["قاعدة المعرفة","نظّم المعرفة طويلة الأجل واحفظها وابحث فيها.",["دائم","بحث","تصنيفات"]],
      "notes":["ملاحظات البحث","سجّل عملية البحث والاستنتاجات والخطوات التالية.",["ملاحظات الحساب","تحرير مستمر","بنية البحث"]],
      "summaries":["الملخصات","حوّل المواد الطويلة إلى ملخصات منظمة يسهل الرجوع إليها.",["منظم","حفظ تلقائي","بحث شامل"]],
      "tex-workbench":["منضدة TeX","تحرير TeX على مستوى الحساب وقوالب وحفظ تلقائي وجسر تجميع محمي.",["تحرير المصدر","حفظ تلقائي","جسر التجميع"]],
      "document-pipeline":["مسار معالجة المستندات","اربط Markdown وTeX وPDF والمحتوى المنظم في سير عمل قابل للتكرار.",["Markdown","PDF","تحويل"]],
      "ai-extract":["استخراج المعلومات بالذكاء الاصطناعي","استخرج البنية والاستنتاجات والكيانات والإجراءات من المستندات أو النصوص الطويلة.",["استخراج","تنظيم","أرشفة تلقائية"]],
      "ai-rewrite":["إعادة الكتابة والتنظيم بالذكاء الاصطناعي","حوّل المسودات إلى ملخصات أو ملاحظات أو شروحات أو صيغ أخرى.",["إعادة كتابة","تحويل الصيغة","محتوى الحساب"]],
      "media-enhance":["تحسين الوسائط","مدخل مستقبلي لتحسين الصور والفيديو والتحويل بين الصيغ.",["صورة","فيديو","تحويل ترميز"]],
      "repo-helper":["مساعد هندسي","مساحة قابلة للتوسعة لفحوصات المستودع والبناء والنشر وأتمتة الهندسة.",["Git","Build","أتمتة"]]
    }
  }
};
