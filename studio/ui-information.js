// 初学者导读：信息中心 UI 聚合层：把知识、收藏链接、笔记/搜索状态等模块组合成一个页面，实际数据能力由对应 API 决定。
import { statusContent } from "./ui-primitives.js";
import { knowledgeContent } from "./ui-knowledge.js";
import { curatedLinksContent } from "./curated-links.js";
import { curatedLinksFavoritesEnhancer } from "./curated-links-favorites.js";

const INFO_COPY = {
  "en-us": {info:["Information","Knowledge, saved links, and account summaries are available. Notes and global search are still being connected."],notes:["Notes aren’t available yet","Note storage is not connected yet."],search:["Global search isn’t available yet","The cross-module search index is not connected yet."],sessionExpired:"Session expired"},
  "zh-cn": {info:["信息中心","知识库、收藏链接和账号摘要可以使用；笔记与全局搜索还在接入。"],notes:["笔记尚未开放","笔记保存接口还没接入。"],search:["全局搜索尚未开放","跨模块搜索索引还没接入。"],sessionExpired:"登录状态已失效"},
  "zh-tw": {info:["資訊中心","知識庫、收藏連結與帳號摘要已可使用；筆記與全域搜尋仍在接入。"],notes:["筆記尚未開放","筆記儲存介面尚未接入。"],search:["全域搜尋尚未開放","跨模組搜尋索引尚未接入。"],sessionExpired:"登入狀態已失效"},
  "ja-jp": {info:["情報センター","ナレッジ、保存済みリンク、アカウント要約を利用できます。ノートとグローバル検索は接続中です。"],notes:["ノートはまだ利用できません","ノート保存機能はまだ接続されていません。"],search:["グローバル検索はまだ利用できません","モジュール横断検索インデックスはまだ接続されていません。"],sessionExpired:"セッションの有効期限が切れました"},
  "ko-kr": {info:["정보 센터","지식, 저장된 링크 및 계정 요약을 사용할 수 있습니다. 노트와 전체 검색은 아직 연결 중입니다."],notes:["노트는 아직 사용할 수 없습니다","노트 저장 기능이 아직 연결되지 않았습니다."],search:["전체 검색은 아직 사용할 수 없습니다","모듈 간 검색 인덱스가 아직 연결되지 않았습니다."],sessionExpired:"로그인 세션이 만료되었습니다"},
  "fr-fr": {info:["Centre d’informations","Les connaissances, les liens enregistrés et les résumés de compte sont disponibles. Les notes et la recherche globale sont encore en cours de connexion."],notes:["Les notes ne sont pas encore disponibles","Le stockage des notes n’est pas encore connecté."],search:["La recherche globale n’est pas encore disponible","L’index de recherche intermodules n’est pas encore connecté."],sessionExpired:"La session a expiré"},
  "es-es": {info:["Centro de información","El conocimiento, los enlaces guardados y los resúmenes de cuenta están disponibles. Las notas y la búsqueda global siguen en proceso de conexión."],notes:["Las notas aún no están disponibles","El almacenamiento de notas aún no está conectado."],search:["La búsqueda global aún no está disponible","El índice de búsqueda entre módulos aún no está conectado."],sessionExpired:"La sesión ha caducado"},
  "el-gr": {info:["Κέντρο πληροφοριών","Οι γνώσεις, οι αποθηκευμένοι σύνδεσμοι και οι περιλήψεις λογαριασμού είναι διαθέσιμα. Οι σημειώσεις και η καθολική αναζήτηση συνδέονται ακόμη."],notes:["Οι σημειώσεις δεν είναι ακόμη διαθέσιμες","Η αποθήκευση σημειώσεων δεν έχει ακόμη συνδεθεί."],search:["Η καθολική αναζήτηση δεν είναι ακόμη διαθέσιμη","Το ευρετήριο αναζήτησης μεταξύ μονάδων δεν έχει ακόμη συνδεθεί."],sessionExpired:"Η συνεδρία έληξε"},
  "ar-sa": {info:["مركز المعلومات","المعرفة والروابط المحفوظة وملخصات الحساب متاحة. ما زال ربط الملاحظات والبحث الشامل جاريًا."],notes:["الملاحظات غير متاحة بعد","لم يتم ربط تخزين الملاحظات بعد."],search:["البحث الشامل غير متاح بعد","لم يتم ربط فهرس البحث بين الوحدات بعد."],sessionExpired:"انتهت صلاحية جلسة تسجيل الدخول"}
};
INFO_COPY["en-gb"]=INFO_COPY["en-us"]; INFO_COPY["en-au"]=INFO_COPY["en-us"];

const SUMMARY_COPY = {
  "zh-tw": {eyebrow:"摘要工作區",title:"開始撰寫摘要",intro:"摘要會與目前帳號關聯，並儲存在受保護的系統儲存空間中。",titleLabel:"摘要標題",sourceLabel:"來源 / 原始材料",purposeLabel:"閱讀背景與摘要目的",summaryLabel:"核心摘要",pointsLabel:"關鍵重點",evidenceLabel:"重要資料、證據與例子",limitsLabel:"限制、爭議與不確定性",actionLabel:"結論與下一步",tagsLabel:"標籤",guideTitle:"建議結構",guideIntro:"一份真正有用的摘要，至少應回答以下五件事：",save:"儲存到帳號",clear:"清除",saved:"已儲存到帳號",saving:"正在儲存…",loading:"正在讀取帳號摘要…",autosaved:"已自動儲存到帳號",empty:"尚無內容",chars:"字",unavailable:"摘要服務暫時無法使用",migration:"已將此瀏覽器的舊草稿移轉到帳號"},
  "ja-jp": {eyebrow:"要約ワークスペース",title:"要約を作成",intro:"要約は現在のアカウントに関連付けられ、保護されたシステムストレージに保存されます。",titleLabel:"要約タイトル",sourceLabel:"出典 / 元資料",purposeLabel:"背景と目的",summaryLabel:"主要な要約",pointsLabel:"重要ポイント",evidenceLabel:"重要なデータ・根拠・例",limitsLabel:"制約・論点・不確実性",actionLabel:"結論と次のステップ",tagsLabel:"タグ",guideTitle:"推奨構成",guideIntro:"後で役立つ要約は、少なくとも次の5点に答える必要があります。",save:"アカウントに保存",clear:"クリア",saved:"アカウントに保存済み",saving:"保存中…",loading:"要約を読み込み中…",autosaved:"自動保存しました",empty:"まだ内容がありません",chars:"文字",unavailable:"要約サービスは一時的に利用できません",migration:"このブラウザの旧下書きをアカウントへ移行しました"},
  "ko-kr": {eyebrow:"요약 작업 공간",title:"요약 작성 시작",intro:"요약은 현재 계정에 연결되며 보호된 시스템 저장 공간에 저장됩니다.",titleLabel:"요약 제목",sourceLabel:"출처 / 원본 자료",purposeLabel:"배경 및 목적",summaryLabel:"핵심 요약",pointsLabel:"핵심 포인트",evidenceLabel:"중요 데이터, 근거 및 예시",limitsLabel:"제한, 논쟁 및 불확실성",actionLabel:"결론 및 다음 단계",tagsLabel:"태그",guideTitle:"권장 구조",guideIntro:"나중에도 유용한 요약은 최소한 다음 다섯 가지에 답해야 합니다.",save:"계정에 저장",clear:"지우기",saved:"계정에 저장됨",saving:"저장 중…",loading:"계정 요약을 불러오는 중…",autosaved:"계정에 자동 저장됨",empty:"아직 내용 없음",chars:"자",unavailable:"요약 서비스를 일시적으로 사용할 수 없습니다",migration:"이 브라우저의 이전 초안을 계정으로 이전했습니다"},
  "fr-fr": {eyebrow:"Espace de résumé",title:"Commencer un résumé",intro:"Les résumés sont associés au compte actuel et enregistrés dans un stockage système protégé.",titleLabel:"Titre du résumé",sourceLabel:"Source / document d’origine",purposeLabel:"Contexte et objectif",summaryLabel:"Résumé principal",pointsLabel:"Points clés",evidenceLabel:"Données, preuves et exemples importants",limitsLabel:"Limites, débats et incertitudes",actionLabel:"Conclusion et prochaines étapes",tagsLabel:"Étiquettes",guideTitle:"Structure recommandée",guideIntro:"Un résumé réellement utile doit répondre au minimum à ces cinq points :",save:"Enregistrer dans le compte",clear:"Effacer",saved:"Enregistré dans le compte",saving:"Enregistrement…",loading:"Chargement du résumé…",autosaved:"Enregistré automatiquement",empty:"Aucun contenu",chars:"caractères",unavailable:"Le service de résumé est temporairement indisponible",migration:"L’ancien brouillon de ce navigateur a été migré vers le compte"},
  "es-es": {eyebrow:"Espacio de resúmenes",title:"Empezar un resumen",intro:"Los resúmenes se vinculan a la cuenta actual y se guardan en almacenamiento protegido del sistema.",titleLabel:"Título del resumen",sourceLabel:"Fuente / material original",purposeLabel:"Contexto y objetivo",summaryLabel:"Resumen principal",pointsLabel:"Puntos clave",evidenceLabel:"Datos, pruebas y ejemplos importantes",limitsLabel:"Límites, controversias e incertidumbre",actionLabel:"Conclusión y siguientes pasos",tagsLabel:"Etiquetas",guideTitle:"Estructura recomendada",guideIntro:"Un resumen útil debería responder al menos a estos cinco puntos:",save:"Guardar en la cuenta",clear:"Borrar",saved:"Guardado en la cuenta",saving:"Guardando…",loading:"Cargando resumen…",autosaved:"Guardado automáticamente",empty:"Todavía no hay contenido",chars:"caracteres",unavailable:"El servicio de resúmenes no está disponible temporalmente",migration:"El borrador antiguo de este navegador se migró a la cuenta"},
  "el-gr": {eyebrow:"Χώρος περιλήψεων",title:"Έναρξη περίληψης",intro:"Οι περιλήψεις συνδέονται με τον τρέχοντα λογαριασμό και αποθηκεύονται σε προστατευμένο χώρο του συστήματος.",titleLabel:"Τίτλος περίληψης",sourceLabel:"Πηγή / αρχικό υλικό",purposeLabel:"Πλαίσιο και σκοπός",summaryLabel:"Κύρια περίληψη",pointsLabel:"Βασικά σημεία",evidenceLabel:"Σημαντικά δεδομένα, στοιχεία και παραδείγματα",limitsLabel:"Περιορισμοί, διαφωνίες και αβεβαιότητα",actionLabel:"Συμπέρασμα και επόμενα βήματα",tagsLabel:"Ετικέτες",guideTitle:"Προτεινόμενη δομή",guideIntro:"Μια χρήσιμη περίληψη πρέπει να απαντά τουλάχιστον στα εξής πέντε σημεία:",save:"Αποθήκευση στον λογαριασμό",clear:"Εκκαθάριση",saved:"Αποθηκεύτηκε στον λογαριασμό",saving:"Αποθήκευση…",loading:"Φόρτωση περίληψης…",autosaved:"Αυτόματη αποθήκευση",empty:"Δεν υπάρχει ακόμη περιεχόμενο",chars:"χαρακτήρες",unavailable:"Η υπηρεσία περιλήψεων δεν είναι προσωρινά διαθέσιμη",migration:"Το παλιό πρόχειρο του προγράμματος περιήγησης μεταφέρθηκε στον λογαριασμό"},
  "ar-sa": {eyebrow:"مساحة الملخصات",title:"ابدأ ملخصًا",intro:"ترتبط الملخصات بالحساب الحالي وتُحفظ في تخزين نظام محمي.",titleLabel:"عنوان الملخص",sourceLabel:"المصدر / المادة الأصلية",purposeLabel:"السياق والهدف",summaryLabel:"الملخص الأساسي",pointsLabel:"النقاط الرئيسية",evidenceLabel:"البيانات والأدلة والأمثلة المهمة",limitsLabel:"القيود والخلافات وعدم اليقين",actionLabel:"الخلاصة والخطوات التالية",tagsLabel:"الوسوم",guideTitle:"البنية المقترحة",guideIntro:"ينبغي أن يجيب الملخص المفيد عن هذه النقاط الخمس على الأقل:",save:"حفظ في الحساب",clear:"مسح",saved:"تم الحفظ في الحساب",saving:"جارٍ الحفظ…",loading:"جارٍ تحميل الملخص…",autosaved:"تم الحفظ تلقائيًا",empty:"لا يوجد محتوى بعد",chars:"حرفًا",unavailable:"خدمة الملخصات غير متاحة مؤقتًا",migration:"تم نقل المسودة القديمة في هذا المتصفح إلى الحساب"}
};

Object.assign(SUMMARY_COPY["zh-tw"], {
  titlePlaceholder:"例如：某篇論文的核心結論與方法摘要",
  sourcePlaceholder:"貼上網頁連結、論文名稱、課程章節、會議主題或其他來源說明",
  purposePlaceholder:"為什麼要讀這份材料？最想解決什麼問題？這份摘要之後準備怎麼用？",
  summaryPlaceholder:"用完整段落說明材料內容。建議先寫結論，再補充背景、核心邏輯、方法與結果。",
  pointsPlaceholder:"每行一個重點。\n例如：\n1. 核心觀點是什麼\n2. 使用了什麼方法或證據\n3. 哪些條件會影響結論",
  evidencePlaceholder:"記錄最值得保留的數字、實驗結果、定義、公式、案例、引用位置或反例。",
  limitsPlaceholder:"寫清楚材料尚未解決的問題、結論依賴的假設、可能的偏差與仍需確認的內容。",
  actionPlaceholder:"這份材料對你意味著什麼？接下來要驗證、閱讀、修改或執行什麼？",
  tagsPlaceholder:"例如：統計學, AI, 論文, 方法論",
  guideItems:[["01","背景","材料討論的對象、範圍與問題是什麼。"],["02","結論","最重要的答案是什麼，先寫結論再展開。"],["03","依據","哪些資料、方法、事實或例子支持結論。"],["04","邊界","哪些假設、限制或爭議會改變對結論的理解。"],["05","行動","讀完後需要記住、驗證或執行什麼。"]]
});
Object.assign(SUMMARY_COPY["ja-jp"], {
  titlePlaceholder:"例：論文の主要な結論と手法の要約",
  sourcePlaceholder:"URL、論文名、授業の章、会議テーマなどの出典情報を入力",
  purposePlaceholder:"なぜ読むのか、何を明らかにしたいのか、この要約を後でどう使うのかを書きます。",
  summaryPlaceholder:"資料の内容を完整な段落で説明します。結論を先に書き、背景、論理、手法、結果を続けます。",
  pointsPlaceholder:"1 行に 1 つのポイント。\n例：\n1. 中心的な主張\n2. 根拠となる手法や証拠\n3. 結論に影響する条件",
  evidencePlaceholder:"重要な数値、実験結果、定義、数式、事例、参照箇所、反例を記録します。",
  limitsPlaceholder:"未解決点、前提、バイアスの可能性、追加確認が必要な点を記録します。",
  actionPlaceholder:"この資料から何を得たか、次に何を検証・読む・変更・実行するかを書きます。",
  tagsPlaceholder:"例：統計学, AI, 論文, 手法",
  guideItems:[["01","背景","対象、範囲、問題を明確にします。"],["02","結論","最も重要な答えを先に書きます。"],["03","根拠","結論を支えるデータ、手法、事実、例を整理します。"],["04","境界","前提、制約、論点を記録します。"],["05","行動","今後覚えること、検証すること、実行することを決めます。"]]
});
Object.assign(SUMMARY_COPY["ko-kr"], {
  titlePlaceholder:"예: 논문의 핵심 결론과 방법 요약",
  sourcePlaceholder:"URL, 논문 제목, 수업 단원, 회의 주제 등 출처 정보를 입력하세요",
  purposePlaceholder:"왜 읽는지, 어떤 질문에 답하려는지, 나중에 이 요약을 어떻게 사용할지 적으세요.",
  summaryPlaceholder:"자료의 내용을 완전한 문단으로 설명하세요. 결론부터 쓰고 배경, 논리, 방법 및 결과를 이어서 정리하세요.",
  pointsPlaceholder:"한 줄에 한 가지 핵심 포인트.\n예:\n1. 핵심 주장은 무엇인가\n2. 어떤 방법이나 근거를 사용했는가\n3. 어떤 조건이 결론에 영향을 주는가",
  evidencePlaceholder:"중요한 수치, 실험 결과, 정의, 공식, 사례, 인용 위치 또는 반례를 기록하세요.",
  limitsPlaceholder:"해결하지 못한 부분, 전제, 가능한 편향 및 추가 확인이 필요한 내용을 기록하세요.",
  actionPlaceholder:"이 자료가 무엇을 의미하는지, 다음에 무엇을 검증·읽기·수정·실행할지 적으세요.",
  tagsPlaceholder:"예: 통계학, AI, 논문, 방법론",
  guideItems:[["01","배경","대상, 범위 및 문제를 설명합니다."],["02","결론","가장 중요한 답을 먼저 제시합니다."],["03","근거","결론을 뒷받침하는 데이터, 방법, 사실 또는 사례를 정리합니다."],["04","경계","전제, 한계 및 논쟁점을 기록합니다."],["05","행동","기억하거나 검증하거나 실행할 다음 단계를 정합니다."]]
});
Object.assign(SUMMARY_COPY["fr-fr"], {
  titlePlaceholder:"Ex. : conclusions et méthodes principales d’un article",
  sourcePlaceholder:"Collez une URL, un titre d’article, un chapitre de cours, un sujet de réunion ou une autre source",
  purposePlaceholder:"Pourquoi lisez-vous ce document ? À quelle question le résumé doit-il répondre ? Comment l’utiliserez-vous ensuite ?",
  summaryPlaceholder:"Expliquez le contenu en paragraphes complets. Commencez par la conclusion, puis donnez le contexte, le raisonnement, les méthodes et les résultats.",
  pointsPlaceholder:"Un point par ligne.\nEx. :\n1. Quelle est l’idée centrale ?\n2. Quelle méthode ou preuve l’étaye ?\n3. Quelles conditions modifient la conclusion ?",
  evidencePlaceholder:"Conservez les chiffres, résultats, définitions, formules, exemples, références ou contre-exemples importants.",
  limitsPlaceholder:"Indiquez les questions non résolues, les hypothèses, les biais possibles et les points à vérifier.",
  actionPlaceholder:"Que signifie ce document pour vous ? Que faut-il vérifier, lire, modifier ou faire ensuite ?",
  tagsPlaceholder:"Ex. : Statistiques, IA, Article, Méthodes",
  guideItems:[["01","Contexte","Quel est l’objet, le périmètre et le problème traité ?"],["02","Conclusion","Quelle est la réponse la plus importante ? Commencez par elle."],["03","Preuves","Quelles données, méthodes, faits ou exemples soutiennent la conclusion ?"],["04","Limites","Quelles hypothèses, limites ou controverses modifient l’interprétation ?"],["05","Action","Que faut-il retenir, vérifier ou faire ensuite ?"]]
});
Object.assign(SUMMARY_COPY["es-es"], {
  titlePlaceholder:"Ej.: conclusiones y métodos principales de un artículo",
  sourcePlaceholder:"Pega una URL, título de artículo, capítulo de clase, tema de reunión u otra fuente",
  purposePlaceholder:"¿Por qué estás leyendo esto? ¿Qué pregunta debe responder el resumen? ¿Cómo lo usarás después?",
  summaryPlaceholder:"Explica el contenido en párrafos completos. Empieza por la conclusión y continúa con el contexto, el razonamiento, los métodos y los resultados.",
  pointsPlaceholder:"Un punto por línea.\nEj.:\n1. ¿Cuál es la idea central?\n2. ¿Qué método o prueba la respalda?\n3. ¿Qué condiciones afectan la conclusión?",
  evidencePlaceholder:"Guarda cifras, resultados, definiciones, fórmulas, ejemplos, referencias o contraejemplos importantes.",
  limitsPlaceholder:"Anota lo que no se resuelve, los supuestos, los posibles sesgos y lo que aún debe verificarse.",
  actionPlaceholder:"¿Qué significa este material para ti? ¿Qué deberías verificar, leer, cambiar o hacer después?",
  tagsPlaceholder:"Ej.: Estadística, IA, Artículo, Métodos",
  guideItems:[["01","Contexto","¿Qué objeto, alcance y problema aborda el material?"],["02","Conclusión","¿Cuál es la respuesta más importante? Empieza por ella."],["03","Pruebas","¿Qué datos, métodos, hechos o ejemplos respaldan la conclusión?"],["04","Límites","¿Qué supuestos, límites o controversias cambian la interpretación?"],["05","Acción","¿Qué conviene recordar, verificar o hacer a continuación?"]]
});
Object.assign(SUMMARY_COPY["el-gr"], {
  titlePlaceholder:"π.χ. βασικά συμπεράσματα και μέθοδοι μιας μελέτης",
  sourcePlaceholder:"Επικολλήστε URL, τίτλο μελέτης, ενότητα μαθήματος, θέμα συνάντησης ή άλλη πηγή",
  purposePlaceholder:"Γιατί διαβάζετε αυτό το υλικό; Σε ποια ερώτηση πρέπει να απαντήσει η περίληψη; Πώς θα τη χρησιμοποιήσετε αργότερα;",
  summaryPlaceholder:"Εξηγήστε το υλικό σε πλήρεις παραγράφους. Ξεκινήστε από το συμπέρασμα και συνεχίστε με πλαίσιο, συλλογισμό, μεθόδους και αποτελέσματα.",
  pointsPlaceholder:"Ένα σημείο ανά γραμμή.\nπ.χ.\n1. Ποιος είναι ο βασικός ισχυρισμός;\n2. Ποια μέθοδος ή απόδειξη τον στηρίζει;\n3. Ποιες συνθήκες επηρεάζουν το συμπέρασμα;",
  evidencePlaceholder:"Καταγράψτε σημαντικούς αριθμούς, αποτελέσματα, ορισμούς, τύπους, παραδείγματα, παραπομπές ή αντιπαραδείγματα.",
  limitsPlaceholder:"Καταγράψτε τι δεν επιλύεται, τις παραδοχές, πιθανές μεροληψίες και ό,τι χρειάζεται επιβεβαίωση.",
  actionPlaceholder:"Τι σημαίνει αυτό το υλικό για εσάς; Τι πρέπει να ελέγξετε, διαβάσετε, αλλάξετε ή κάνετε μετά;",
  tagsPlaceholder:"π.χ. Στατιστική, AI, Μελέτη, Μέθοδοι",
  guideItems:[["01","Πλαίσιο","Ποιο αντικείμενο, εύρος και πρόβλημα εξετάζεται;"],["02","Συμπέρασμα","Ποια είναι η σημαντικότερη απάντηση; Ξεκινήστε από αυτή."],["03","Στοιχεία","Ποια δεδομένα, μέθοδοι, γεγονότα ή παραδείγματα στηρίζουν το συμπέρασμα;"],["04","Όρια","Ποιες παραδοχές, περιορισμοί ή διαφωνίες αλλάζουν την ερμηνεία;"],["05","Ενέργεια","Τι πρέπει να θυμάστε, να επαληθεύσετε ή να κάνετε στη συνέχεια;"]]
});
Object.assign(SUMMARY_COPY["ar-sa"], {
  titlePlaceholder:"مثال: أهم نتائج وأساليب ورقة بحثية",
  sourcePlaceholder:"ألصق رابطًا أو عنوان ورقة أو فصلًا دراسيًا أو موضوع اجتماع أو معلومات مصدر أخرى",
  purposePlaceholder:"لماذا تقرأ هذه المادة؟ ما السؤال الذي ينبغي أن يجيب عنه الملخص؟ وكيف ستستخدمه لاحقًا؟",
  summaryPlaceholder:"اشرح محتوى المادة في فقرات كاملة. ابدأ بالخلاصة ثم قدّم السياق والمنطق والأساليب والنتائج.",
  pointsPlaceholder:"نقطة واحدة في كل سطر.\nمثال:\n1. ما الفكرة الأساسية؟\n2. ما الأسلوب أو الدليل الذي يدعمها؟\n3. ما الشروط التي تؤثر في النتيجة؟",
  evidencePlaceholder:"احتفظ بالأرقام والنتائج والتعريفات والصيغ والأمثلة والمراجع أو الأمثلة المضادة المهمة.",
  limitsPlaceholder:"سجّل ما لم تتم معالجته والافتراضات والتحيزات المحتملة وما يزال بحاجة إلى تحقق.",
  actionPlaceholder:"ماذا تعني هذه المادة لك؟ وما الذي ينبغي التحقق منه أو قراءته أو تغييره أو تنفيذه بعد ذلك؟",
  tagsPlaceholder:"مثال: إحصاء، ذكاء اصطناعي، بحث، مناهج",
  guideItems:[["01","السياق","ما الموضوع والنطاق والمشكلة التي تناقشها المادة؟"],["02","الخلاصة","ما أهم إجابة؟ ابدأ بها."],["03","الأدلة","ما البيانات أو الأساليب أو الحقائق أو الأمثلة التي تدعم الخلاصة؟"],["04","الحدود","ما الافتراضات أو القيود أو الخلافات التي تغيّر تفسير الخلاصة؟"],["05","الإجراء","ما الذي يجب تذكره أو التحقق منه أو فعله بعد ذلك؟"]]
});

SUMMARY_COPY["en-gb"] = SUMMARY_COPY["en-us"] || {};
SUMMARY_COPY["en-au"] = SUMMARY_COPY["en-us"] || {};

export function linksContent(zh, locale = "") {
  return curatedLinksContent(zh, locale) + curatedLinksFavoritesEnhancer(zh, locale);
}

export function notesContent(zh, locale = "") {
  const copy=INFO_COPY[locale]||INFO_COPY[zh?"zh-cn":"en-us"];
  return '<section class="os-card is-large status-card"><h2>'+copy.notes[0]+'</h2><p>'+copy.notes[1]+'</p></section>';
}

export function summariesContent(zh, locale = "") {
  let text = zh ? {
    eyebrow: "摘要工作区",
    title: "开始写摘要",
    intro: "摘要与当前账号关联，并保存到受保护的系统存储中，不会出现在普通文件列表。",
    titleLabel: "摘要标题",
    titlePlaceholder: "例如：某篇论文的核心结论与方法摘要",
    sourceLabel: "来源 / 原始材料",
    sourcePlaceholder: "粘贴网页链接、论文名称、课程章节、会议主题或其他来源说明",
    purposeLabel: "阅读背景与摘要目的",
    purposePlaceholder: "为什么要读这份材料？你最想解决什么问题？这份摘要以后准备怎么用？",
    summaryLabel: "核心摘要",
    summaryPlaceholder: "用完整段落写清楚材料讲了什么。建议先给结论，再解释背景、核心逻辑、关键方法和最终结果。不要只堆关键词。",
    pointsLabel: "关键要点",
    pointsPlaceholder: "每行一个要点。\n例如：\n1. 核心观点是什么\n2. 使用了什么方法或证据\n3. 哪些条件会影响结论",
    evidenceLabel: "重要数据、证据与例子",
    evidencePlaceholder: "记录最值得保留的数字、实验结果、定义、公式、案例、引用位置或反例。尽量说明这些证据支持了什么结论。",
    limitsLabel: "限制、争议与不确定性",
    limitsPlaceholder: "写清楚材料没有解决什么、结论依赖哪些假设、可能有哪些偏差，以及哪些内容还需要进一步核实。",
    actionLabel: "结论与下一步",
    actionPlaceholder: "这份材料最终对你意味着什么？接下来要验证什么、继续读什么、修改什么或执行什么？",
    tagsLabel: "标签",
    tagsPlaceholder: "例如：统计学, AI, 论文, 方法论",
    guideTitle: "建议结构",
    guideIntro: "一份以后真的能用上的摘要，至少回答下面五件事：",
    guideItems: [
      ["01", "背景", "材料讨论的对象、范围和问题是什么。"],
      ["02", "结论", "最重要的答案是什么，先写结论再展开。"],
      ["03", "依据", "哪些数据、方法、事实或例子支持这个结论。"],
      ["04", "边界", "哪些假设、限制和争议会改变你对结论的理解。"],
      ["05", "行动", "读完以后需要记住、验证或执行什么。"]
    ],
    save: "保存到账号",
    clear: "清空",
    saved: "已保存到账号",
    saving: "正在保存…",
    loading: "正在读取账号摘要…",
    autosaved: "已自动保存到账号",
    empty: "还没有内容",
    chars: "字",
    unavailable: "摘要服务暂时不可用",
    migration: "已把这个浏览器里的旧草稿迁移到账号"
  } : {
    eyebrow: "Summary workspace",
    title: "Start a summary",
    intro: "Summaries are linked to the signed-in account and stored in protected system storage, separate from the normal file browser.",
    titleLabel: "Summary title",
    titlePlaceholder: "For example: Core findings and methods from a paper",
    sourceLabel: "Source / original material",
    sourcePlaceholder: "Paste a URL, paper title, class section, meeting topic, or other source information",
    purposeLabel: "Context and purpose",
    purposePlaceholder: "Why are you reading this? What question should the summary answer? How will you use it later?",
    summaryLabel: "Core summary",
    summaryPlaceholder: "Explain what the material says in complete paragraphs. Lead with the conclusion, then cover context, reasoning, methods, and results. Avoid a list of disconnected keywords.",
    pointsLabel: "Key points",
    pointsPlaceholder: "One point per line.\nFor example:\n1. What is the central claim?\n2. What method or evidence supports it?\n3. What conditions affect the conclusion?",
    evidenceLabel: "Evidence, data, and examples",
    evidencePlaceholder: "Keep the numbers, findings, definitions, formulas, examples, references, or counterexamples that are worth revisiting. Explain what each piece of evidence supports.",
    limitsLabel: "Limits, disputes, and uncertainty",
    limitsPlaceholder: "Record what the material does not resolve, the assumptions behind the conclusion, possible bias, and anything that still needs verification.",
    actionLabel: "Conclusion and next steps",
    actionPlaceholder: "What does this material mean for you? What should you verify, read, change, or do next?",
    tagsLabel: "Tags",
    tagsPlaceholder: "For example: Statistics, AI, Paper, Methods",
    guideTitle: "Recommended structure",
    guideIntro: "A useful summary should answer at least these five questions:",
    guideItems: [
      ["01", "Context", "What object, scope, and problem does the material address?"],
      ["02", "Conclusion", "What is the most important answer? Lead with it."],
      ["03", "Evidence", "Which data, methods, facts, or examples support the conclusion?"],
      ["04", "Boundaries", "Which assumptions, limits, or disputes change how the conclusion should be read?"],
      ["05", "Action", "What should be remembered, verified, or done next?"]
    ],
    save: "Save to account",
    clear: "Clear",
    saved: "Saved to account",
    saving: "Saving…",
    loading: "Loading account summary…",
    autosaved: "Autosaved to account",
    empty: "No content yet",
    chars: "characters",
    unavailable: "Summary service is temporarily unavailable",
    migration: "Migrated this browser’s old draft to your account"
  };
  if (SUMMARY_COPY[locale]) text = { ...text, ...SUMMARY_COPY[locale] };

  return `
    <section class="summary-workspace" data-summary-workspace>
      <div class="summary-editor-card">
        <div class="summary-editor-head">
          <div>
            <span class="summary-eyebrow">${text.eyebrow}</span>
            <h2>${text.title}</h2>
            <p>${text.intro}</p>
          </div>
          <div class="summary-counter" aria-live="polite"><strong id="summary-char-count">0</strong><span>${text.chars}</span></div>
        </div>

        <div class="summary-form-grid">
          <label class="summary-field"><span>${text.titleLabel}</span><input id="summary-title" type="text" maxlength="160" placeholder="${text.titlePlaceholder}"></label>
          <label class="summary-field"><span>${text.sourceLabel}</span><input id="summary-source" type="text" maxlength="1000" placeholder="${text.sourcePlaceholder}"></label>
        </div>

        <label class="summary-field"><span>${text.purposeLabel}</span><textarea id="summary-purpose" rows="4" maxlength="2400" placeholder="${text.purposePlaceholder}"></textarea></label>
        <label class="summary-field summary-primary-field"><span>${text.summaryLabel}</span><textarea id="summary-core" rows="10" maxlength="12000" placeholder="${text.summaryPlaceholder}"></textarea></label>

        <div class="summary-form-grid summary-form-grid-tall">
          <label class="summary-field"><span>${text.pointsLabel}</span><textarea id="summary-points" rows="8" maxlength="6000" placeholder="${text.pointsPlaceholder}"></textarea></label>
          <label class="summary-field"><span>${text.evidenceLabel}</span><textarea id="summary-evidence" rows="8" maxlength="6000" placeholder="${text.evidencePlaceholder}"></textarea></label>
        </div>

        <div class="summary-form-grid summary-form-grid-tall">
          <label class="summary-field"><span>${text.limitsLabel}</span><textarea id="summary-limits" rows="7" maxlength="5000" placeholder="${text.limitsPlaceholder}"></textarea></label>
          <label class="summary-field"><span>${text.actionLabel}</span><textarea id="summary-actions" rows="7" maxlength="5000" placeholder="${text.actionPlaceholder}"></textarea></label>
        </div>

        <label class="summary-field"><span>${text.tagsLabel}</span><input id="summary-tags" type="text" maxlength="500" placeholder="${text.tagsPlaceholder}"></label>

        <div class="summary-actions">
          <div class="summary-actions-buttons">
            <button id="summary-save" class="summary-action summary-action-primary" type="button">${text.save}</button>
            <button id="summary-clear" class="summary-action summary-action-secondary" type="button">${text.clear}</button>
          </div>
          <span id="summary-save-state" class="summary-save-state">${text.loading}</span>
        </div>
      </div>

      <aside class="summary-guide-card">
        <span class="summary-eyebrow">${text.eyebrow}</span>
        <h3>${text.guideTitle}</h3>
        <p>${text.guideIntro}</p>
        <div class="summary-guide-list">
          ${text.guideItems.map(([number, title, detail]) => `<article><span>${number}</span><div><strong>${title}</strong><p>${detail}</p></div></article>`).join("")}
        </div>
      </aside>
    </section>


    <style>
      .summary-workspace{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,340px);gap:14px;align-items:start}
      .summary-editor-card,.summary-guide-card{border:1px solid var(--border);border-radius:20px;background:var(--card);box-shadow:none}
      .summary-editor-card{padding:22px}.summary-guide-card{position:sticky;top:0;padding:20px}
      .summary-editor-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.summary-editor-head{margin-bottom:20px}
      .summary-eyebrow{display:block;color:var(--muted);font-size:11px;font-weight:680;letter-spacing:.01em}
      .summary-editor-head h2,.summary-guide-card h3{margin:4px 0 0;letter-spacing:-.03em}.summary-editor-head h2{font-size:26px}.summary-guide-card h3{font-size:20px}
      .summary-editor-head p,.summary-guide-card>p{max-width:850px;margin:8px 0 0;color:var(--muted);font-size:13px;line-height:1.62}
      .summary-counter{display:flex;align-items:baseline;gap:5px;min-width:max-content;padding:8px 10px;border-radius:12px;background:var(--fill);color:var(--muted)}.summary-counter strong{color:var(--text);font-size:18px;letter-spacing:-.03em}.summary-counter span{font-size:10px}
      .summary-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.summary-form-grid-tall{margin-top:12px}
      .summary-field{display:grid;gap:7px;margin-top:12px}.summary-field>span{color:var(--muted);font-size:12px;font-weight:650}
      .summary-field input,.summary-field textarea{width:100%;margin:0;border:0;border-radius:13px;background:var(--fill);color:var(--text);box-shadow:inset 0 0 0 1px var(--border)}
      .summary-field textarea{min-height:112px;padding:12px 14px;resize:vertical;line-height:1.58}.summary-primary-field textarea{min-height:240px;font-size:15px}
      .summary-actions{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:18px;padding-top:16px;border-top:1px solid var(--hairline)}.summary-actions-buttons{display:flex;gap:8px}.summary-action{width:auto!important;min-height:40px!important;margin:0!important;padding:0 14px!important;border-radius:11px!important;font-size:13px!important}.summary-action-secondary{background:var(--fill)!important;color:var(--text)!important}.summary-action-secondary:hover{background:var(--secondary)!important}.summary-save-state{color:var(--muted);font-size:11px}.summary-save-state.is-error{color:var(--danger)}
      .summary-guide-list{display:grid;gap:8px;margin-top:16px}.summary-guide-list article{display:grid;grid-template-columns:34px minmax(0,1fr);gap:10px;padding:11px;border-radius:14px;background:var(--fill)}.summary-guide-list article>span{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:color-mix(in srgb,var(--primary) 12%,transparent);color:var(--primary);font-size:10px;font-weight:800}.summary-guide-list strong{display:block;font-size:13px}.summary-guide-list p{margin:3px 0 0;color:var(--muted);font-size:11px;line-height:1.5}
      @media(max-width:980px){.summary-workspace{grid-template-columns:1fr}.summary-guide-card{position:static}.summary-form-grid{grid-template-columns:1fr}}
      @media(max-width:620px){.summary-editor-card,.summary-guide-card{padding:16px;border-radius:17px}.summary-editor-head{display:grid}.summary-counter{justify-self:start}.summary-actions{align-items:flex-start;flex-direction:column}.summary-actions-buttons{width:100%}.summary-action{flex:1}.summary-primary-field textarea{min-height:210px}}
    </style>

    <script>
      (() => {
        const start = () => {
          const root=document.querySelector('[data-summary-workspace]');
          if(!root)return;
          const ids=['summary-title','summary-source','summary-purpose','summary-core','summary-points','summary-evidence','summary-limits','summary-actions','summary-tags'];
          const fields=ids.map(id=>document.getElementById(id)).filter(Boolean);
          const state=document.getElementById('summary-save-state');
          const counter=document.getElementById('summary-char-count');
          let timer=null;
          let saveSequence=0;
          let ready=false;

          function setState(label,error){if(!state)return;state.textContent=label;state.classList.toggle('is-error',Boolean(error));}
          function snapshot(){return {title:document.getElementById('summary-title')?.value||'',source:document.getElementById('summary-source')?.value||'',purpose:document.getElementById('summary-purpose')?.value||'',core:document.getElementById('summary-core')?.value||'',points:document.getElementById('summary-points')?.value||'',evidence:document.getElementById('summary-evidence')?.value||'',limits:document.getElementById('summary-limits')?.value||'',actions:document.getElementById('summary-actions')?.value||'',tags:document.getElementById('summary-tags')?.value||''};}
          function count(){const total=fields.reduce((sum,field)=>sum+field.value.length,0);if(counter)counter.textContent=String(total);return total;}
          function fill(summary){const map={title:'summary-title',source:'summary-source',purpose:'summary-purpose',core:'summary-core',points:'summary-points',evidence:'summary-evidence',limits:'summary-limits',actions:'summary-actions',tags:'summary-tags'};Object.entries(map).forEach(([key,id])=>{const field=document.getElementById(id);if(field)field.value=summary?.[key]||''});count();}
          async function token(){const result=await supabaseClient.auth.getSession();const value=result?.data?.session?.access_token;if(!value)throw new Error(${JSON.stringify((INFO_COPY[locale]||INFO_COPY[zh?'zh-cn':'en-us']).sessionExpired)});return value;}
          async function api(path,options){const access=await token();const headers=new Headers(options?.headers||{});headers.set('Authorization','Bearer '+access);if(options?.body)headers.set('Content-Type','application/json;charset=UTF-8');const response=await fetch(path,{...options,headers,cache:'no-store'});if(!response.ok){const payload=await response.json().catch(()=>({}));throw new Error(payload?.error||${JSON.stringify(text.unavailable)});}return response.json();}
          async function save(label){const sequence=++saveSequence;setState(${JSON.stringify(text.saving)},false);try{await api('/api/summaries',{method:'PUT',body:JSON.stringify(snapshot())});if(sequence!==saveSequence)return;setState(label||${JSON.stringify(text.saved)},false);}catch(error){if(sequence!==saveSequence)return;setState(error?.message||${JSON.stringify(text.unavailable)},true);}}
          function queueSave(){count();if(!ready)return;window.clearTimeout(timer);timer=window.setTimeout(()=>void save(${JSON.stringify(text.autosaved)}),700);}
          async function migrateLocalDraftIfNeeded(serverSummary){if(serverSummary)return false;let local=null;try{local=JSON.parse(localStorage.getItem('qssed-summary-draft-v1')||'null');}catch{}if(!local||typeof local!=='object')return false;const migrated={title:local['summary-title']||'',source:local['summary-source']||'',purpose:local['summary-purpose']||'',core:local['summary-core']||'',points:local['summary-points']||'',evidence:local['summary-evidence']||'',limits:local['summary-limits']||'',actions:local['summary-actions']||'',tags:local['summary-tags']||''};if(!Object.values(migrated).some(value=>String(value||'').trim()))return false;fill(migrated);await api('/api/summaries',{method:'PUT',body:JSON.stringify(migrated)});try{localStorage.removeItem('qssed-summary-draft-v1')}catch{}setState(${JSON.stringify(text.migration)},false);return true;}
          async function initialize(){setState(${JSON.stringify(text.loading)},false);try{const data=await api('/api/summaries',{method:'GET'});fill(data?.summary||null);const migrated=await migrateLocalDraftIfNeeded(data?.summary||null);if(!migrated)setState(data?.summary?${JSON.stringify(text.saved)}:${JSON.stringify(text.empty)},false);ready=true;}catch(error){ready=true;setState(error?.message||${JSON.stringify(text.unavailable)},true);}}

          fields.forEach(field=>field.addEventListener('input',queueSave));
          document.getElementById('summary-save')?.addEventListener('click',()=>void save(${JSON.stringify(text.saved)}));
          document.getElementById('summary-clear')?.addEventListener('click',async()=>{window.clearTimeout(timer);fields.forEach(field=>{field.value=''});count();setState(${JSON.stringify(text.saving)},false);try{await api('/api/summaries',{method:'DELETE'});setState(${JSON.stringify(text.empty)},false);}catch(error){setState(error?.message||${JSON.stringify(text.unavailable)},true);}document.getElementById('summary-title')?.focus();});
          void initialize();
        };
        window.setTimeout(start,0);
      })();
    </script>
  `;
}

export function searchContent(zh, locale = "") {
  const copy=INFO_COPY[locale]||INFO_COPY[zh?"zh-cn":"en-us"];
  return '<section class="os-card is-large status-card"><h2>'+copy.search[0]+'</h2><p>'+copy.search[1]+'</p></section>';
}

export function informationContent(path, zh, locale = "") {
  const copy=INFO_COPY[locale]||INFO_COPY[zh?"zh-cn":"en-us"];
  if (path === "/info") return '<section class="os-card is-large status-card"><h2>'+copy.info[0]+'</h2><p>'+copy.info[1]+'</p></section>';
  if (path === "/info/knowledge" || path.startsWith("/info/knowledge/")) return knowledgeContent(path, zh, locale);
  if (path === "/info/links") return linksContent(zh, locale);
  if (path === "/info/notes") return notesContent(zh, locale);
  if (path === "/info/summaries") return summariesContent(zh, locale);
  if (path === "/info/search") return searchContent(zh, locale);
  throw new Error("Unhandled OS path: " + path);
}
