// 初学者导读：笔记页面 UI 与客户端交互；服务端持久化由 notes-api.js 完成，页面负责编辑体验和状态反馈。
import { normalizeSupportedLocale } from "./locale.js";

const NOTES_EN = {
  eyebrow:"Research workspace",introTitle:"Keep ideas, sources, and reasoning in one place",
  intro:"Research notes are linked to your account and autosaved to a hidden R2 system path. Use them for literature reviews, derivations, experiments, data observations, quick ideas, and next steps.",
  total:"Notes",active:"Active",pinned:"Pinned",projects:"Projects",library:"Notebook",libraryHint:"Search titles, projects, tags, or previews",search:"Search notes",
  newNote:"New note",all:"All",activeFilter:"Active",referenceFilter:"Reference",doneFilter:"Done",emptyTitle:"No research notes yet",
  emptyHint:"Create your first note and start building your research trail here.",noMatches:"No matching notes",editorEmptyTitle:"Select a note to start editing",
  editorEmptyHint:"Your notebook is on the left. Create a note or pick an existing one to continue working.",title:"Title",
  titlePlaceholder:"For example: When bootstrap confidence intervals work",project:"Project / topic",
  projectPlaceholder:"For example: Probability homework / Modeling contest / Paper review",kind:"Type",
  kindOptions:[["question","Research question"],["literature","Literature"],["method","Method & derivation"],["experiment","Experiment"],["data","Data observation"],["idea","Idea"],["meeting","Discussion / meeting"]],
  status:"Status",statusOptions:[["active","Active"],["reference","Reference"],["done","Done"]],source:"Source / reference",
  sourcePlaceholder:"Paper, webpage, book section, class, dataset URL, or other source",tags:"Tags",tagsPlaceholder:"For example: inference, bootstrap, Python",
  body:"Research record",bodyPlaceholder:"Capture the problem, context, derivation, experiment results, code ideas, counterexamples, questions, and your own judgment. It does not need to be polished on the first pass.",
  conclusion:"Working conclusion",conclusionPlaceholder:"What can you say with confidence so far? What is worth finding quickly later?",nextSteps:"Next steps",
  nextStepsPlaceholder:"What still needs validation, more data, further reading, or continuation next time?",pin:"Pin note",pinHint:"Pinned notes stay at the top of the notebook",
  save:"Save",delete:"Delete note",deleteConfirm:"Delete this research note? This cannot be undone.",saved:"Saved to account",autosaved:"Autosaved",saving:"Saving…",
  loading:"Loading account notes…",unavailable:"Research notes are temporarily unavailable",updated:"Updated",chars:"characters",untitled:"Untitled note",
  newDefault:"New research note",select:"Select",sessionExpired:"Session expired"
};

const NOTES_COPY = {
  "en-us":NOTES_EN,"en-gb":NOTES_EN,"en-au":NOTES_EN,
  "zh-cn":{
    eyebrow:"研究工作区",introTitle:"把想法、资料和推导留在一个地方",intro:"研究笔记与当前账号关联，自动保存到 R2 的隐藏系统目录。适合记录文献阅读、方法推导、实验过程、数据观察、临时想法和下一步计划。",
    total:"笔记总数",active:"进行中",pinned:"已固定",projects:"项目数",library:"笔记库",libraryHint:"搜索标题、项目、标签或正文摘要",search:"搜索笔记",newNote:"新建笔记",
    all:"全部",activeFilter:"进行中",referenceFilter:"参考",doneFilter:"已完成",emptyTitle:"还没有研究笔记",emptyHint:"新建第一条笔记，把研究过程从这里开始积累。",
    noMatches:"没有匹配的笔记",editorEmptyTitle:"选择一条笔记开始编辑",editorEmptyHint:"左侧是你的笔记库。可以新建笔记，或选择已有条目继续研究。",
    title:"标题",titlePlaceholder:"例如：Bootstrap 置信区间的适用条件",project:"项目 / 课题",projectPlaceholder:"例如：概率论作业 / 数模竞赛 / 论文阅读",kind:"类型",
    kindOptions:[["question","研究问题"],["literature","文献阅读"],["method","方法与推导"],["experiment","实验记录"],["data","数据观察"],["idea","想法"],["meeting","讨论 / 会议"]],
    status:"状态",statusOptions:[["active","进行中"],["reference","参考"],["done","已完成"]],source:"来源 / 参考",sourcePlaceholder:"论文、网页、书籍章节、课程、数据集链接或其他来源",
    tags:"标签",tagsPlaceholder:"例如：统计推断, Bootstrap, Python",body:"研究记录",bodyPlaceholder:"记录问题、背景、推导过程、实验结果、代码思路、反例、疑问和自己的判断。这里可以写得很长，不需要一开始就整理得很完美。",
    conclusion:"阶段结论",conclusionPlaceholder:"目前能确定什么？哪些判断最值得以后快速回看？",nextSteps:"下一步",nextStepsPlaceholder:"还要验证什么、补什么数据、继续读什么、下一次从哪里接着做？",
    pin:"固定笔记",pinHint:"固定后会排在笔记库最前面",save:"保存",delete:"删除笔记",deleteConfirm:"确定删除这条研究笔记吗？此操作无法撤销。",saved:"已保存到账号",
    autosaved:"已自动保存",saving:"正在保存…",loading:"正在读取账号笔记…",unavailable:"研究笔记服务暂时不可用",updated:"更新",chars:"字",untitled:"未命名笔记",
    newDefault:"新的研究笔记",select:"选择",sessionExpired:"登录状态已失效"
  },
  "zh-tw":{
    eyebrow:"研究工作區",introTitle:"把想法、資料與推導留在同一個地方",intro:"研究筆記會連結到目前帳號，並自動儲存到 R2 的隱藏系統目錄。適合記錄文獻閱讀、方法推導、實驗過程、資料觀察、臨時想法與下一步計畫。",
    total:"筆記總數",active:"進行中",pinned:"已固定",projects:"專案數",library:"筆記庫",libraryHint:"搜尋標題、專案、標籤或內容摘要",search:"搜尋筆記",newNote:"新增筆記",
    all:"全部",activeFilter:"進行中",referenceFilter:"參考",doneFilter:"已完成",emptyTitle:"還沒有研究筆記",emptyHint:"建立第一則筆記，從這裡開始累積研究過程。",
    noMatches:"沒有符合的筆記",editorEmptyTitle:"選擇一則筆記開始編輯",editorEmptyHint:"左側是你的筆記庫。可以新增筆記，或選擇現有內容繼續研究。",
    title:"標題",titlePlaceholder:"例如：Bootstrap 信賴區間的適用條件",project:"專案 / 主題",projectPlaceholder:"例如：機率論作業 / 數模競賽 / 論文閱讀",kind:"類型",
    kindOptions:[["question","研究問題"],["literature","文獻閱讀"],["method","方法與推導"],["experiment","實驗記錄"],["data","資料觀察"],["idea","想法"],["meeting","討論 / 會議"]],
    status:"狀態",statusOptions:[["active","進行中"],["reference","參考"],["done","已完成"]],source:"來源 / 參考",sourcePlaceholder:"論文、網頁、書籍章節、課程、資料集連結或其他來源",
    tags:"標籤",tagsPlaceholder:"例如：統計推論, Bootstrap, Python",body:"研究記錄",bodyPlaceholder:"記錄問題、背景、推導過程、實驗結果、程式碼思路、反例、疑問與自己的判斷。可以先完整記下來，不必一開始就整理得很完美。",
    conclusion:"階段結論",conclusionPlaceholder:"目前能確定什麼？哪些判斷最值得之後快速回顧？",nextSteps:"下一步",nextStepsPlaceholder:"還要驗證什麼、補哪些資料、繼續讀什麼、下次要從哪裡接著做？",
    pin:"固定筆記",pinHint:"固定後會排在筆記庫最前面",save:"儲存",delete:"刪除筆記",deleteConfirm:"確定要刪除這則研究筆記嗎？此操作無法復原。",saved:"已儲存到帳號",
    autosaved:"已自動儲存",saving:"正在儲存…",loading:"正在讀取帳號筆記…",unavailable:"研究筆記服務暫時無法使用",updated:"更新",chars:"字元",untitled:"未命名筆記",
    newDefault:"新的研究筆記",select:"選擇",sessionExpired:"登入狀態已失效"
  },
  "ja-jp":{
    eyebrow:"研究ワークスペース",introTitle:"アイデア、資料、推論をひとつの場所に",intro:"研究ノートは現在のアカウントに紐づき、R2 の非表示システム領域へ自動保存されます。文献レビュー、導出、実験、データ観察、思いつき、次のステップの記録に使えます。",
    total:"ノート",active:"進行中",pinned:"固定",projects:"プロジェクト",library:"ノートブック",libraryHint:"タイトル、プロジェクト、タグ、概要を検索",search:"ノートを検索",newNote:"新規ノート",
    all:"すべて",activeFilter:"進行中",referenceFilter:"参考",doneFilter:"完了",emptyTitle:"研究ノートはまだありません",emptyHint:"最初のノートを作成して、研究の記録をここから積み上げましょう。",
    noMatches:"一致するノートがありません",editorEmptyTitle:"ノートを選択して編集を開始",editorEmptyHint:"左側にノートブックがあります。新規作成するか、既存のノートを選んで研究を続けられます。",
    title:"タイトル",titlePlaceholder:"例：Bootstrap 信頼区間が有効になる条件",project:"プロジェクト / テーマ",projectPlaceholder:"例：確率論の課題 / モデリングコンテスト / 論文レビュー",kind:"種類",
    kindOptions:[["question","研究課題"],["literature","文献レビュー"],["method","方法・導出"],["experiment","実験記録"],["data","データ観察"],["idea","アイデア"],["meeting","議論 / ミーティング"]],
    status:"ステータス",statusOptions:[["active","進行中"],["reference","参考"],["done","完了"]],source:"出典 / 参考",sourcePlaceholder:"論文、Web ページ、書籍の章、授業、データセット URL、その他の資料",
    tags:"タグ",tagsPlaceholder:"例：統計的推論, Bootstrap, Python",body:"研究記録",bodyPlaceholder:"問題、背景、導出、実験結果、コードのアイデア、反例、疑問、自分の判断を記録します。最初から整った文章にする必要はありません。",
    conclusion:"暫定結論",conclusionPlaceholder:"現時点で確かなことは何ですか？後で素早く見返したい判断は何ですか？",nextSteps:"次のステップ",nextStepsPlaceholder:"何を検証し、どのデータを補い、何を読み、次回どこから再開しますか？",
    pin:"ノートを固定",pinHint:"固定したノートはノートブックの先頭に表示されます",save:"保存",delete:"ノートを削除",deleteConfirm:"この研究ノートを削除しますか？元に戻せません。",saved:"アカウントに保存済み",
    autosaved:"自動保存済み",saving:"保存中…",loading:"アカウントのノートを読み込み中…",unavailable:"研究ノートは一時的に利用できません",updated:"更新",chars:"文字",untitled:"無題のノート",
    newDefault:"新しい研究ノート",select:"選択",sessionExpired:"セッションの有効期限が切れました"
  },
  "ko-kr":{
    eyebrow:"연구 작업 공간",introTitle:"아이디어, 자료, 추론을 한곳에",intro:"연구 노트는 현재 계정에 연결되고 R2의 숨겨진 시스템 경로에 자동 저장됩니다. 문헌 검토, 유도 과정, 실험, 데이터 관찰, 아이디어와 다음 단계를 기록하는 데 사용할 수 있습니다.",
    total:"노트",active:"진행 중",pinned:"고정됨",projects:"프로젝트",library:"노트북",libraryHint:"제목, 프로젝트, 태그 또는 미리보기 검색",search:"노트 검색",newNote:"새 노트",
    all:"전체",activeFilter:"진행 중",referenceFilter:"참고",doneFilter:"완료",emptyTitle:"아직 연구 노트가 없습니다",emptyHint:"첫 노트를 만들고 연구 기록을 여기에서 쌓아 보세요.",
    noMatches:"일치하는 노트가 없습니다",editorEmptyTitle:"노트를 선택해 편집 시작",editorEmptyHint:"왼쪽에 노트북이 있습니다. 새 노트를 만들거나 기존 노트를 선택해 연구를 이어갈 수 있습니다.",
    title:"제목",titlePlaceholder:"예: Bootstrap 신뢰구간이 잘 작동하는 조건",project:"프로젝트 / 주제",projectPlaceholder:"예: 확률론 과제 / 모델링 대회 / 논문 검토",kind:"유형",
    kindOptions:[["question","연구 질문"],["literature","문헌 검토"],["method","방법 및 유도"],["experiment","실험 기록"],["data","데이터 관찰"],["idea","아이디어"],["meeting","토론 / 회의"]],
    status:"상태",statusOptions:[["active","진행 중"],["reference","참고"],["done","완료"]],source:"출처 / 참고",sourcePlaceholder:"논문, 웹페이지, 책의 장, 수업, 데이터셋 URL 또는 기타 출처",
    tags:"태그",tagsPlaceholder:"예: 통계 추론, Bootstrap, Python",body:"연구 기록",bodyPlaceholder:"문제, 배경, 유도 과정, 실험 결과, 코드 아이디어, 반례, 질문과 자신의 판단을 기록하세요. 처음부터 완벽하게 정리할 필요는 없습니다.",
    conclusion:"중간 결론",conclusionPlaceholder:"현재 확실하게 말할 수 있는 것은 무엇인가요? 나중에 빠르게 다시 볼 가치가 있는 판단은 무엇인가요?",nextSteps:"다음 단계",nextStepsPlaceholder:"무엇을 더 검증하고, 어떤 데이터를 보완하고, 무엇을 더 읽고, 다음에는 어디서 이어갈까요?",
    pin:"노트 고정",pinHint:"고정된 노트는 노트북 맨 위에 표시됩니다",save:"저장",delete:"노트 삭제",deleteConfirm:"이 연구 노트를 삭제할까요? 이 작업은 되돌릴 수 없습니다.",saved:"계정에 저장됨",
    autosaved:"자동 저장됨",saving:"저장 중…",loading:"계정 노트 불러오는 중…",unavailable:"연구 노트 서비스를 일시적으로 사용할 수 없습니다",updated:"업데이트",chars:"자",untitled:"제목 없는 노트",
    newDefault:"새 연구 노트",select:"선택",sessionExpired:"세션이 만료되었습니다"
  },
  "fr-fr":{
    eyebrow:"Espace de recherche",introTitle:"Gardez idées, sources et raisonnement au même endroit",intro:"Les notes de recherche sont liées à votre compte et enregistrées automatiquement dans un chemin système R2 masqué. Utilisez-les pour les lectures, démonstrations, expériences, observations de données, idées rapides et prochaines étapes.",
    total:"Notes",active:"Actives",pinned:"Épinglées",projects:"Projets",library:"Carnet",libraryHint:"Rechercher titres, projets, tags ou aperçus",search:"Rechercher des notes",newNote:"Nouvelle note",
    all:"Tout",activeFilter:"Actives",referenceFilter:"Référence",doneFilter:"Terminées",emptyTitle:"Aucune note de recherche",emptyHint:"Créez votre première note et commencez à construire votre fil de recherche ici.",
    noMatches:"Aucune note correspondante",editorEmptyTitle:"Sélectionnez une note pour commencer",editorEmptyHint:"Votre carnet se trouve à gauche. Créez une note ou choisissez-en une pour poursuivre votre travail.",
    title:"Titre",titlePlaceholder:"Par exemple : Quand les intervalles de confiance bootstrap fonctionnent",project:"Projet / sujet",projectPlaceholder:"Par exemple : devoir de probabilités / concours de modélisation / lecture d’article",kind:"Type",
    kindOptions:[["question","Question de recherche"],["literature","Lecture / littérature"],["method","Méthode et dérivation"],["experiment","Expérience"],["data","Observation de données"],["idea","Idée"],["meeting","Discussion / réunion"]],
    status:"État",statusOptions:[["active","Active"],["reference","Référence"],["done","Terminée"]],source:"Source / référence",sourcePlaceholder:"Article, page web, chapitre de livre, cours, URL de jeu de données ou autre source",
    tags:"Tags",tagsPlaceholder:"Par exemple : inférence, bootstrap, Python",body:"Journal de recherche",bodyPlaceholder:"Consignez le problème, le contexte, les dérivations, résultats d’expérience, idées de code, contre-exemples, questions et votre propre jugement. Le texte n’a pas besoin d’être parfait dès le départ.",
    conclusion:"Conclusion provisoire",conclusionPlaceholder:"Que pouvez-vous affirmer avec confiance à ce stade ? Quelles conclusions voudrez-vous retrouver rapidement plus tard ?",nextSteps:"Prochaines étapes",nextStepsPlaceholder:"Que faut-il encore valider, quelles données compléter, que lire ensuite et où reprendre la prochaine fois ?",
    pin:"Épingler la note",pinHint:"Les notes épinglées restent en haut du carnet",save:"Enregistrer",delete:"Supprimer la note",deleteConfirm:"Supprimer cette note de recherche ? Cette action est irréversible.",saved:"Enregistrée dans le compte",
    autosaved:"Enregistrement automatique effectué",saving:"Enregistrement…",loading:"Chargement des notes du compte…",unavailable:"Les notes de recherche sont temporairement indisponibles",updated:"Mis à jour",chars:"caractères",untitled:"Note sans titre",
    newDefault:"Nouvelle note de recherche",select:"Sélectionner",sessionExpired:"Session expirée"
  },
  "es-es":{
    eyebrow:"Espacio de investigación",introTitle:"Guarda ideas, fuentes y razonamiento en un solo lugar",intro:"Las notas de investigación están vinculadas a tu cuenta y se guardan automáticamente en una ruta oculta de R2. Úsalas para lecturas, derivaciones, experimentos, observaciones de datos, ideas rápidas y próximos pasos.",
    total:"Notas",active:"Activas",pinned:"Fijadas",projects:"Proyectos",library:"Cuaderno",libraryHint:"Buscar títulos, proyectos, etiquetas o vistas previas",search:"Buscar notas",newNote:"Nueva nota",
    all:"Todo",activeFilter:"Activas",referenceFilter:"Referencia",doneFilter:"Completadas",emptyTitle:"Todavía no hay notas de investigación",emptyHint:"Crea tu primera nota y empieza a construir aquí tu historial de investigación.",
    noMatches:"No hay notas coincidentes",editorEmptyTitle:"Selecciona una nota para empezar a editar",editorEmptyHint:"Tu cuaderno está a la izquierda. Crea una nota o elige una existente para continuar trabajando.",
    title:"Título",titlePlaceholder:"Por ejemplo: Cuándo funcionan los intervalos de confianza bootstrap",project:"Proyecto / tema",projectPlaceholder:"Por ejemplo: tarea de probabilidad / concurso de modelización / lectura de artículo",kind:"Tipo",
    kindOptions:[["question","Pregunta de investigación"],["literature","Lectura / bibliografía"],["method","Método y derivación"],["experiment","Experimento"],["data","Observación de datos"],["idea","Idea"],["meeting","Discusión / reunión"]],
    status:"Estado",statusOptions:[["active","Activa"],["reference","Referencia"],["done","Completada"]],source:"Fuente / referencia",sourcePlaceholder:"Artículo, página web, capítulo de libro, clase, URL de conjunto de datos u otra fuente",
    tags:"Etiquetas",tagsPlaceholder:"Por ejemplo: inferencia, bootstrap, Python",body:"Registro de investigación",bodyPlaceholder:"Registra el problema, contexto, derivación, resultados experimentales, ideas de código, contraejemplos, preguntas y tu propio criterio. No hace falta dejarlo perfecto en el primer intento.",
    conclusion:"Conclusión provisional",conclusionPlaceholder:"¿Qué puedes afirmar con confianza hasta ahora? ¿Qué conclusiones conviene encontrar rápidamente más adelante?",nextSteps:"Próximos pasos",nextStepsPlaceholder:"¿Qué falta validar, qué datos completar, qué leer después y dónde continuar la próxima vez?",
    pin:"Fijar nota",pinHint:"Las notas fijadas permanecen al principio del cuaderno",save:"Guardar",delete:"Eliminar nota",deleteConfirm:"¿Eliminar esta nota de investigación? Esta acción no se puede deshacer.",saved:"Guardada en la cuenta",
    autosaved:"Guardado automático",saving:"Guardando…",loading:"Cargando notas de la cuenta…",unavailable:"Las notas de investigación no están disponibles temporalmente",updated:"Actualizado",chars:"caracteres",untitled:"Nota sin título",
    newDefault:"Nueva nota de investigación",select:"Seleccionar",sessionExpired:"La sesión ha caducado"
  },
  "el-gr":{
    eyebrow:"Χώρος έρευνας",introTitle:"Κρατήστε ιδέες, πηγές και συλλογισμούς σε ένα μέρος",intro:"Οι ερευνητικές σημειώσεις συνδέονται με τον λογαριασμό σας και αποθηκεύονται αυτόματα σε κρυφή διαδρομή συστήματος στο R2. Χρησιμοποιήστε τις για βιβλιογραφία, παραγώγους, πειράματα, παρατηρήσεις δεδομένων, γρήγορες ιδέες και επόμενα βήματα.",
    total:"Σημειώσεις",active:"Ενεργές",pinned:"Καρφιτσωμένες",projects:"Έργα",library:"Σημειωματάριο",libraryHint:"Αναζήτηση τίτλων, έργων, ετικετών ή προεπισκοπήσεων",search:"Αναζήτηση σημειώσεων",newNote:"Νέα σημείωση",
    all:"Όλα",activeFilter:"Ενεργές",referenceFilter:"Αναφορά",doneFilter:"Ολοκληρωμένες",emptyTitle:"Δεν υπάρχουν ακόμη ερευνητικές σημειώσεις",emptyHint:"Δημιουργήστε την πρώτη σημείωση και αρχίστε να χτίζετε εδώ το ιστορικό της έρευνάς σας.",
    noMatches:"Δεν βρέθηκαν σημειώσεις",editorEmptyTitle:"Επιλέξτε μια σημείωση για επεξεργασία",editorEmptyHint:"Το σημειωματάριό σας βρίσκεται αριστερά. Δημιουργήστε νέα σημείωση ή επιλέξτε μία υπάρχουσα για να συνεχίσετε.",
    title:"Τίτλος",titlePlaceholder:"Για παράδειγμα: Πότε λειτουργούν τα bootstrap διαστήματα εμπιστοσύνης",project:"Έργο / θέμα",projectPlaceholder:"Για παράδειγμα: εργασία πιθανοτήτων / διαγωνισμός μοντελοποίησης / ανάγνωση άρθρου",kind:"Τύπος",
    kindOptions:[["question","Ερευνητικό ερώτημα"],["literature","Βιβλιογραφία"],["method","Μέθοδος και παραγωγή"],["experiment","Πείραμα"],["data","Παρατήρηση δεδομένων"],["idea","Ιδέα"],["meeting","Συζήτηση / συνάντηση"]],
    status:"Κατάσταση",statusOptions:[["active","Ενεργή"],["reference","Αναφορά"],["done","Ολοκληρωμένη"]],source:"Πηγή / αναφορά",sourcePlaceholder:"Άρθρο, ιστοσελίδα, κεφάλαιο βιβλίου, μάθημα, URL συνόλου δεδομένων ή άλλη πηγή",
    tags:"Ετικέτες",tagsPlaceholder:"Για παράδειγμα: inference, bootstrap, Python",body:"Ερευνητική καταγραφή",bodyPlaceholder:"Καταγράψτε το πρόβλημα, το πλαίσιο, την παραγωγή, τα αποτελέσματα πειραμάτων, ιδέες κώδικα, αντιπαραδείγματα, ερωτήσεις και τη δική σας κρίση. Δεν χρειάζεται να είναι τέλειο από την πρώτη φορά.",
    conclusion:"Προσωρινό συμπέρασμα",conclusionPlaceholder:"Τι μπορείτε να πείτε με βεβαιότητα μέχρι τώρα; Ποιες κρίσεις αξίζει να βρίσκετε γρήγορα αργότερα;",nextSteps:"Επόμενα βήματα",nextStepsPlaceholder:"Τι χρειάζεται ακόμη επαλήθευση, ποια δεδομένα λείπουν, τι να διαβάσετε και από πού να συνεχίσετε την επόμενη φορά;",
    pin:"Καρφίτσωμα σημείωσης",pinHint:"Οι καρφιτσωμένες σημειώσεις μένουν στην κορυφή",save:"Αποθήκευση",delete:"Διαγραφή σημείωσης",deleteConfirm:"Να διαγραφεί αυτή η ερευνητική σημείωση; Η ενέργεια δεν αναιρείται.",saved:"Αποθηκεύτηκε στον λογαριασμό",
    autosaved:"Αυτόματη αποθήκευση",saving:"Αποθήκευση…",loading:"Φόρτωση σημειώσεων λογαριασμού…",unavailable:"Οι ερευνητικές σημειώσεις δεν είναι προσωρινά διαθέσιμες",updated:"Ενημερώθηκε",chars:"χαρακτήρες",untitled:"Σημείωση χωρίς τίτλο",
    newDefault:"Νέα ερευνητική σημείωση",select:"Επιλογή",sessionExpired:"Η συνεδρία έληξε"
  },
  "ar-sa":{
    eyebrow:"مساحة البحث",introTitle:"احتفظ بالأفكار والمصادر والاستدلال في مكان واحد",intro:"ترتبط ملاحظات البحث بحسابك وتُحفظ تلقائيًا في مسار نظام مخفي داخل R2. استخدمها لمراجعة الأدبيات والاشتقاقات والتجارب وملاحظات البيانات والأفكار السريعة والخطوات التالية.",
    total:"الملاحظات",active:"نشطة",pinned:"مثبتة",projects:"المشاريع",library:"دفتر الملاحظات",libraryHint:"ابحث في العناوين والمشاريع والوسوم والمعاينات",search:"البحث في الملاحظات",newNote:"ملاحظة جديدة",
    all:"الكل",activeFilter:"نشطة",referenceFilter:"مرجع",doneFilter:"مكتملة",emptyTitle:"لا توجد ملاحظات بحث بعد",emptyHint:"أنشئ أول ملاحظة وابدأ ببناء سجل بحثك هنا.",
    noMatches:"لا توجد ملاحظات مطابقة",editorEmptyTitle:"اختر ملاحظة لبدء التحرير",editorEmptyHint:"دفتر ملاحظاتك على اليسار. أنشئ ملاحظة جديدة أو اختر ملاحظة موجودة لمتابعة العمل.",
    title:"العنوان",titlePlaceholder:"مثال: متى تعمل فترات الثقة Bootstrap جيدًا",project:"المشروع / الموضوع",projectPlaceholder:"مثال: واجب احتمالات / مسابقة نمذجة / مراجعة ورقة",kind:"النوع",
    kindOptions:[["question","سؤال بحثي"],["literature","مراجعة الأدبيات"],["method","الطريقة والاشتقاق"],["experiment","تجربة"],["data","ملاحظة بيانات"],["idea","فكرة"],["meeting","نقاش / اجتماع"]],
    status:"الحالة",statusOptions:[["active","نشطة"],["reference","مرجع"],["done","مكتملة"]],source:"المصدر / المرجع",sourcePlaceholder:"ورقة، صفحة ويب، فصل كتاب، مقرر، رابط مجموعة بيانات أو مصدر آخر",
    tags:"الوسوم",tagsPlaceholder:"مثال: inference, bootstrap, Python",body:"سجل البحث",bodyPlaceholder:"سجّل المشكلة والسياق والاشتقاق ونتائج التجارب وأفكار الشفرة والأمثلة المضادة والأسئلة وحكمك الشخصي. لا يلزم أن يكون النص مصقولًا من المحاولة الأولى.",
    conclusion:"استنتاج مرحلي",conclusionPlaceholder:"ما الذي يمكنك قوله بثقة حتى الآن؟ وما الأحكام التي تستحق الرجوع إليها بسرعة لاحقًا؟",nextSteps:"الخطوات التالية",nextStepsPlaceholder:"ما الذي ما زال يحتاج إلى تحقق، وما البيانات الناقصة، وما الذي ستقرأه، ومن أين ستكمل في المرة القادمة؟",
    pin:"تثبيت الملاحظة",pinHint:"تبقى الملاحظات المثبتة في أعلى الدفتر",save:"حفظ",delete:"حذف الملاحظة",deleteConfirm:"هل تريد حذف ملاحظة البحث هذه؟ لا يمكن التراجع عن ذلك.",saved:"تم الحفظ في الحساب",
    autosaved:"تم الحفظ تلقائيًا",saving:"جارٍ الحفظ…",loading:"جارٍ تحميل ملاحظات الحساب…",unavailable:"ملاحظات البحث غير متاحة مؤقتًا",updated:"آخر تحديث",chars:"حرفًا",untitled:"ملاحظة بلا عنوان",
    newDefault:"ملاحظة بحث جديدة",select:"اختيار",sessionExpired:"انتهت صلاحية الجلسة"
  }
};

export function researchNotesContent(zh, locale = "") {
  const activeLocale = normalizeSupportedLocale(locale) || (zh ? "zh-cn" : "en-us");
  const copy = NOTES_COPY[activeLocale] || NOTES_EN;

  const kindOptions = copy.kindOptions.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
  const statusOptions = copy.statusOptions.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");

  return `
    <section class="notes-overview">
      <div class="notes-intro-card">
        <span class="notes-eyebrow">${copy.eyebrow}</span>
        <h2>${copy.introTitle}</h2>
        <p>${copy.intro}</p>
        <button id="notes-new-top" class="notes-primary-button" type="button">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
          <span>${copy.newNote}</span>
        </button>
      </div>
      <div class="notes-stats" aria-label="${copy.eyebrow}">
        <article><span>${copy.total}</span><strong id="notes-stat-total">—</strong></article>
        <article><span>${copy.active}</span><strong id="notes-stat-active">—</strong></article>
        <article><span>${copy.pinned}</span><strong id="notes-stat-pinned">—</strong></article>
        <article><span>${copy.projects}</span><strong id="notes-stat-projects">—</strong></article>
      </div>
    </section>

    <section id="notes-workspace" class="notes-workspace" data-notes-workspace>
      <aside class="notes-library">
        <div class="notes-library-head">
          <div><span class="notes-eyebrow">${copy.eyebrow}</span><h2>${copy.library}</h2><p>${copy.libraryHint}</p></div>
          <button id="notes-new" class="notes-icon-button" type="button" aria-label="${copy.newNote}" title="${copy.newNote}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
        <label class="notes-search-shell">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg>
          <input id="notes-search" type="search" placeholder="${copy.search}" aria-label="${copy.search}" autocomplete="off">
        </label>
        <div id="notes-filters" class="notes-filters" role="group" aria-label="${copy.status}">
          <button type="button" class="is-active" data-note-filter="all">${copy.all}</button>
          <button type="button" data-note-filter="active">${copy.activeFilter}</button>
          <button type="button" data-note-filter="reference">${copy.referenceFilter}</button>
          <button type="button" data-note-filter="done">${copy.doneFilter}</button>
        </div>
        <div id="notes-list" class="notes-list" aria-live="polite"></div>
      </aside>

      <div class="notes-editor-shell">
        <div id="notes-editor-empty" class="notes-editor-empty">
          <div class="notes-editor-empty-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h10l4 4v12H5z"/><path d="M15 4v5h5M8 13h8M8 17h6"/></svg>
          </div>
          <h2>${copy.editorEmptyTitle}</h2>
          <p>${copy.editorEmptyHint}</p>
          <button id="notes-empty-new" class="notes-primary-button" type="button">${copy.newNote}</button>
        </div>

        <form id="notes-editor" class="notes-editor" hidden autocomplete="off">
          <div class="notes-editor-header">
            <div class="notes-editor-title-wrap">
              <span class="notes-eyebrow">${copy.eyebrow}</span>
              <input id="note-title" class="note-title-input" type="text" maxlength="180" placeholder="${copy.titlePlaceholder}" aria-label="${copy.title}">
            </div>
            <div class="notes-editor-actions">
              <button id="note-pin" class="notes-pin-button" type="button" aria-pressed="false" title="${copy.pin}">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 4 8 0-1 5 3 3-5 1-1 7-1-7-5-1 3-3z"/></svg>
              </button>
              <button id="note-save" class="notes-save-button" type="button">${copy.save}</button>
            </div>
          </div>

          <div class="notes-meta-grid">
            <label><span>${copy.project}</span><input id="note-project" type="text" maxlength="120" placeholder="${copy.projectPlaceholder}"></label>
            <label><span>${copy.kind}</span><select id="note-kind">${kindOptions}</select></label>
            <label><span>${copy.status}</span><select id="note-status">${statusOptions}</select></label>
            <label><span>${copy.tags}</span><input id="note-tags" type="text" maxlength="800" placeholder="${copy.tagsPlaceholder}"></label>
          </div>

          <label class="notes-field"><span>${copy.source}</span><input id="note-source" type="text" maxlength="1600" placeholder="${copy.sourcePlaceholder}"></label>
          <label class="notes-field notes-body-field"><span>${copy.body}</span><textarea id="note-body" maxlength="48000" placeholder="${copy.bodyPlaceholder}"></textarea></label>

          <div class="notes-two-column">
            <label class="notes-field"><span>${copy.conclusion}</span><textarea id="note-conclusion" maxlength="8000" placeholder="${copy.conclusionPlaceholder}"></textarea></label>
            <label class="notes-field"><span>${copy.nextSteps}</span><textarea id="note-next-steps" maxlength="5000" placeholder="${copy.nextStepsPlaceholder}"></textarea></label>
          </div>

          <div class="notes-editor-footer">
            <div class="notes-save-state-wrap">
              <span id="note-save-state" class="notes-save-state">${copy.loading}</span>
              <span class="notes-char-count"><strong id="note-char-count">0</strong> ${copy.chars}</span>
            </div>
            <button id="note-delete" class="notes-delete-button" type="button">${copy.delete}</button>
          </div>
        </form>
      </div>
    </section>

    <style>
      .notes-overview{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(420px,.65fr);gap:12px;margin-bottom:14px}
      .notes-intro-card,.notes-stats,.notes-library,.notes-editor-shell{border:1px solid var(--border);background:var(--card);border-radius:20px}
      .notes-intro-card{padding:22px}.notes-eyebrow{display:block;color:var(--muted);font-size:11px;font-weight:680;letter-spacing:.01em}.notes-intro-card h2{margin:5px 0 8px;font-size:25px;letter-spacing:-.035em}.notes-intro-card p{max-width:780px;margin:0;color:var(--muted);font-size:13px;line-height:1.65}
      .notes-primary-button{width:auto!important;min-height:40px!important;margin:17px 0 0!important;padding:0 14px!important;display:inline-flex!important;align-items:center;justify-content:center;gap:8px;border:0!important;border-radius:11px!important;background:var(--primary)!important;color:var(--primary-ink)!important;font-size:13px!important;font-weight:700!important}.notes-primary-button svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round}
      .notes-stats{display:grid;grid-template-columns:1fr 1fr;gap:1px;overflow:hidden;background:var(--border)}.notes-stats article{display:flex;min-height:92px;flex-direction:column;justify-content:flex-end;padding:15px;background:var(--card)}.notes-stats span{color:var(--muted);font-size:11px}.notes-stats strong{margin-top:4px;font-size:25px;letter-spacing:-.04em}
      .notes-workspace{display:grid;grid-template-columns:minmax(280px,340px) minmax(0,1fr);gap:12px;align-items:stretch;min-height:650px}.notes-library,.notes-editor-shell{min-height:650px;overflow:hidden}.notes-library{display:flex;flex-direction:column;padding:16px}.notes-library-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.notes-library-head h2{margin:3px 0 0;font-size:20px;letter-spacing:-.03em}.notes-library-head p{margin:4px 0 0;color:var(--muted);font-size:11px;line-height:1.45}
      .notes-icon-button,.notes-pin-button{width:38px!important;height:38px!important;min-height:38px!important;margin:0!important;padding:0!important;display:grid!important;place-items:center;border:1px solid var(--border)!important;border-radius:11px!important;background:var(--fill)!important;color:var(--text)!important}.notes-icon-button svg,.notes-pin-button svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.notes-pin-button.is-pinned{color:var(--primary)!important;background:color-mix(in srgb,var(--primary) 10%,var(--fill))!important;border-color:color-mix(in srgb,var(--primary) 24%,var(--border))!important}
      .notes-search-shell{display:flex;align-items:center;gap:8px;margin-top:14px;padding:0 10px;border:1px solid var(--border);border-radius:11px;background:var(--fill)}.notes-search-shell svg{width:16px;height:16px;flex:0 0 auto;fill:none;stroke:var(--muted);stroke-width:1.8}.notes-search-shell input{min-width:0;height:38px;margin:0!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;font-size:12px!important}
      .notes-filters{display:flex;gap:5px;margin-top:10px;overflow-x:auto}.notes-filters button{width:auto!important;min-height:29px!important;margin:0!important;padding:0 9px!important;border:0!important;border-radius:9px!important;background:transparent!important;color:var(--muted)!important;font-size:10px!important;font-weight:650!important;white-space:nowrap}.notes-filters button.is-active{background:var(--fill)!important;color:var(--text)!important}
      .notes-list{display:grid;gap:7px;margin-top:12px;overflow:auto;padding-right:2px}.notes-list-item{width:100%;margin:0!important;padding:12px!important;border:1px solid transparent!important;border-radius:13px!important;background:var(--fill)!important;color:var(--text)!important;text-align:left!important}.notes-list-item:hover{background:var(--secondary)!important}.notes-list-item.is-selected{border-color:color-mix(in srgb,var(--primary) 28%,var(--border))!important;background:color-mix(in srgb,var(--primary) 7%,var(--fill))!important}.notes-list-top{display:flex;align-items:flex-start;gap:8px}.notes-list-top strong{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}.notes-list-pin{color:var(--primary);font-size:10px}.notes-list-item p{display:-webkit-box;overflow:hidden;-webkit-line-clamp:2;-webkit-box-orient:vertical;margin:6px 0 0;color:var(--muted);font-size:10px;line-height:1.45}.notes-list-meta{display:flex;justify-content:space-between;gap:8px;margin-top:8px;color:var(--quiet);font-size:9px}.notes-list-meta span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.notes-list-empty{display:grid;place-items:center;min-height:170px;padding:18px;text-align:center;color:var(--muted)}.notes-list-empty strong{color:var(--text);font-size:13px}.notes-list-empty span{max-width:230px;margin-top:5px;font-size:10px;line-height:1.5}
      .notes-editor-shell{position:relative;padding:20px}.notes-editor-empty{min-height:608px;display:grid;place-items:center;align-content:center;text-align:center}.notes-editor-empty-icon{width:56px;height:56px;display:grid;place-items:center;border-radius:17px;background:var(--fill);color:var(--muted)}.notes-editor-empty-icon svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}.notes-editor-empty h2{margin:14px 0 0;font-size:20px;letter-spacing:-.03em}.notes-editor-empty p{max-width:420px;margin:7px 0 0;color:var(--muted);font-size:12px;line-height:1.55}.notes-editor-empty .notes-primary-button{margin-top:15px!important}
      .notes-editor{display:block}.notes-editor[hidden]{display:none}.notes-editor-header{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding-bottom:16px;border-bottom:1px solid var(--hairline)}.notes-editor-title-wrap{min-width:0;flex:1}.note-title-input{width:100%;height:auto!important;margin:2px 0 0!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;color:var(--text)!important;font-size:27px!important;font-weight:760!important;letter-spacing:-.04em}.notes-editor-actions{display:flex;gap:7px}.notes-save-button{width:auto!important;min-height:38px!important;margin:0!important;padding:0 13px!important;border:0!important;border-radius:11px!important;background:var(--primary)!important;color:var(--primary-ink)!important;font-size:12px!important;font-weight:700!important}
      .notes-meta-grid{display:grid;grid-template-columns:1.25fr .85fr .85fr 1.15fr;gap:9px;margin-top:16px}.notes-meta-grid label,.notes-field{display:grid;gap:6px}.notes-meta-grid span,.notes-field>span{color:var(--muted);font-size:10px;font-weight:650}.notes-meta-grid input,.notes-meta-grid select,.notes-field input,.notes-field textarea{width:100%;margin:0!important;border:1px solid var(--border)!important;border-radius:11px!important;background:var(--fill)!important;color:var(--text)!important;box-shadow:none!important}.notes-meta-grid input,.notes-meta-grid select,.notes-field input{height:40px!important;padding:0 11px!important;font-size:11px!important}.notes-field{margin-top:11px}.notes-field textarea{min-height:132px;padding:11px 12px!important;resize:vertical;font-size:12px!important;line-height:1.6}.notes-body-field textarea{min-height:300px;font-size:13px!important}.notes-two-column{display:grid;grid-template-columns:1fr 1fr;gap:10px}.notes-two-column .notes-field textarea{min-height:145px}
      .notes-editor-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:14px;padding-top:14px;border-top:1px solid var(--hairline)}.notes-save-state-wrap{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:10px}.notes-save-state.is-error{color:var(--danger)}.notes-char-count{color:var(--quiet)}.notes-delete-button{width:auto!important;min-height:36px!important;margin:0!important;padding:0 11px!important;border:1px solid color-mix(in srgb,var(--danger) 24%,var(--border))!important;border-radius:10px!important;background:color-mix(in srgb,var(--danger) 5%,var(--card))!important;color:var(--danger)!important;font-size:10px!important;font-weight:700!important}.notes-delete-button:hover{background:color-mix(in srgb,var(--danger) 10%,var(--card))!important;border-color:color-mix(in srgb,var(--danger) 42%,var(--border))!important}
      @media(max-width:1100px){.notes-overview{grid-template-columns:1fr}.notes-workspace{grid-template-columns:290px minmax(0,1fr)}.notes-meta-grid{grid-template-columns:1fr 1fr}}
      @media(max-width:820px){.notes-workspace{grid-template-columns:1fr}.notes-library,.notes-editor-shell{min-height:auto}.notes-list{max-height:340px}.notes-editor-empty{min-height:340px}.notes-two-column{grid-template-columns:1fr}}
      @media(max-width:580px){.notes-intro-card,.notes-library,.notes-editor-shell{padding:15px}.notes-stats{grid-template-columns:1fr 1fr}.notes-meta-grid{grid-template-columns:1fr}.notes-editor-header{display:grid}.notes-editor-actions{justify-content:flex-start}.note-title-input{font-size:23px!important}.notes-editor-footer{align-items:flex-start;flex-direction:column}}
    </style>

    <script>
      (() => {
        const start = () => {
          const root = document.getElementById('notes-workspace');
          if (!root) return;

          const copy = ${JSON.stringify(copy)};
          const list = document.getElementById('notes-list');
          const search = document.getElementById('notes-search');
          const filters = document.getElementById('notes-filters');
          const editor = document.getElementById('notes-editor');
          const editorEmpty = document.getElementById('notes-editor-empty');
          const saveState = document.getElementById('note-save-state');
          const charCount = document.getElementById('note-char-count');
          const pinButton = document.getElementById('note-pin');
          const fields = {
            title: document.getElementById('note-title'),
            project: document.getElementById('note-project'),
            kind: document.getElementById('note-kind'),
            status: document.getElementById('note-status'),
            tags: document.getElementById('note-tags'),
            source: document.getElementById('note-source'),
            body: document.getElementById('note-body'),
            conclusion: document.getElementById('note-conclusion'),
            next_steps: document.getElementById('note-next-steps')
          };

          let notes = [];
          let selectedId = '';
          let selectedNote = null;
          let filter = 'all';
          let query = '';
          let loadingNote = false;
          let saveTimer = null;
          let saveSequence = 0;

          async function token() {
            const result = await supabaseClient.auth.getSession();
            const value = result?.data?.session?.access_token;
            if (!value) throw new Error(${JSON.stringify(copy.sessionExpired)});
            return value;
          }

          async function api(path, options) {
            const access = await token();
            const headers = new Headers(options?.headers || {});
            headers.set('Authorization', 'Bearer ' + access);
            if (options?.body) headers.set('Content-Type', 'application/json;charset=UTF-8');
            const response = await fetch(path, { ...options, headers, cache: 'no-store' });
            if (!response.ok) {
              const payload = await response.json().catch(() => ({}));
              throw new Error(payload?.error || copy.unavailable);
            }
            return response.json();
          }

          function setState(text, error) {
            if (!saveState) return;
            saveState.textContent = text || '';
            saveState.classList.toggle('is-error', Boolean(error));
          }

          function notePayload() {
            return {
              title: fields.title.value,
              project: fields.project.value,
              kind: fields.kind.value,
              status: fields.status.value,
              tags: fields.tags.value,
              source: fields.source.value,
              body: fields.body.value,
              conclusion: fields.conclusion.value,
              next_steps: fields.next_steps.value,
              pinned: Boolean(selectedNote?.pinned)
            };
          }

          function updateCharCount() {
            const total = [fields.body.value, fields.conclusion.value, fields.next_steps.value].reduce((sum, value) => sum + value.length, 0);
            if (charCount) charCount.textContent = String(total);
          }

          function summaryFromNote(note) {
            return {
              id: note.id,
              title: note.title,
              project: note.project,
              kind: note.kind,
              tags: note.tags,
              status: note.status,
              pinned: note.pinned,
              created_at: note.created_at,
              updated_at: note.updated_at,
              preview: String(note.body || note.conclusion || '').trim().slice(0, 220)
            };
          }

          function updateStats() {
            const projects = new Set(notes.map(note => String(note.project || '').trim()).filter(Boolean));
            document.getElementById('notes-stat-total').textContent = String(notes.length);
            document.getElementById('notes-stat-active').textContent = String(notes.filter(note => note.status === 'active').length);
            document.getElementById('notes-stat-pinned').textContent = String(notes.filter(note => note.pinned).length);
            document.getElementById('notes-stat-projects').textContent = String(projects.size);
          }

          function filteredNotes() {
            const normalized = query.trim().toLocaleLowerCase();
            return notes.filter(note => {
              if (filter !== 'all' && note.status !== filter) return false;
              if (!normalized) return true;
              return [note.title, note.project, note.tags, note.kind, note.preview].some(value => String(value || '').toLocaleLowerCase().includes(normalized));
            });
          }

          function formatDate(value) {
            if (!value) return '—';
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return '—';
            const now = new Date();
            if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          }

          function renderList() {
            list.replaceChildren();
            const visible = filteredNotes();
            if (!visible.length) {
              const empty = document.createElement('div');
              empty.className = 'notes-list-empty';
              const strong = document.createElement('strong');
              strong.textContent = notes.length ? copy.noMatches : copy.emptyTitle;
              const hint = document.createElement('span');
              hint.textContent = notes.length ? copy.libraryHint : copy.emptyHint;
              empty.append(strong, hint);
              list.append(empty);
              updateStats();
              return;
            }

            visible.forEach(note => {
              const button = document.createElement('button');
              button.type = 'button';
              button.className = 'notes-list-item' + (note.id === selectedId ? ' is-selected' : '');
              const top = document.createElement('div');
              top.className = 'notes-list-top';
              const title = document.createElement('strong');
              title.textContent = note.title || copy.untitled;
              top.append(title);
              if (note.pinned) {
                const pin = document.createElement('span');
                pin.className = 'notes-list-pin';
                pin.textContent = '●';
                top.append(pin);
              }
              const preview = document.createElement('p');
              preview.textContent = note.preview || note.project || note.tags || '—';
              const meta = document.createElement('div');
              meta.className = 'notes-list-meta';
              const project = document.createElement('span');
              project.textContent = note.project || note.status || '—';
              const time = document.createElement('time');
              time.textContent = formatDate(note.updated_at);
              meta.append(project, time);
              button.append(top, preview, meta);
              button.addEventListener('click', () => void selectNote(note.id));
              list.append(button);
            });
            updateStats();
          }

          function showEditor(note) {
            selectedNote = note;
            selectedId = note?.id || '';
            editor.hidden = !note;
            editorEmpty.hidden = Boolean(note);
            if (!note) {
              renderList();
              return;
            }
            loadingNote = true;
            fields.title.value = note.title || '';
            fields.project.value = note.project || '';
            fields.kind.value = note.kind || 'question';
            fields.status.value = note.status || 'active';
            fields.tags.value = note.tags || '';
            fields.source.value = note.source || '';
            fields.body.value = note.body || '';
            fields.conclusion.value = note.conclusion || '';
            fields.next_steps.value = note.next_steps || '';
            pinButton.classList.toggle('is-pinned', Boolean(note.pinned));
            pinButton.setAttribute('aria-pressed', note.pinned ? 'true' : 'false');
            updateCharCount();
            setState(copy.saved, false);
            loadingNote = false;
            renderList();
          }

          async function loadNotes(preserveSelection) {
            try {
              const data = await api('/api/notes', { method: 'GET' });
              notes = Array.isArray(data?.notes) ? data.notes : [];
              renderList();
              if (preserveSelection && selectedId && notes.some(note => note.id === selectedId)) return;
              if (!selectedId && notes.length) await selectNote(notes[0].id);
            } catch (error) {
              list.replaceChildren();
              const empty = document.createElement('div');
              empty.className = 'notes-list-empty';
              const strong = document.createElement('strong');
              strong.textContent = error?.message || copy.unavailable;
              empty.append(strong);
              list.append(empty);
              ['notes-stat-total','notes-stat-active','notes-stat-pinned','notes-stat-projects'].forEach(id => { document.getElementById(id).textContent = '—'; });
            }
          }

          async function selectNote(id) {
            if (!id || id === selectedId && selectedNote) return;
            window.clearTimeout(saveTimer);
            setState(copy.loading, false);
            try {
              const data = await api('/api/notes?id=' + encodeURIComponent(id), { method: 'GET' });
              showEditor(data.note);
            } catch (error) {
              setState(error?.message || copy.unavailable, true);
            }
          }

          async function createNote() {
            window.clearTimeout(saveTimer);
            try {
              const data = await api('/api/notes', { method: 'POST', body: JSON.stringify({ title: copy.newDefault, kind: 'question', status: 'active' }) });
              const note = data.note;
              notes.unshift(summaryFromNote(note));
              showEditor(note);
              fields.title.focus();
              fields.title.select();
            } catch (error) {
              setState(error?.message || copy.unavailable, true);
            }
          }

          async function saveNote(label) {
            if (!selectedId || loadingNote) return;
            const sequence = ++saveSequence;
            setState(copy.saving, false);
            try {
              const data = await api('/api/notes?id=' + encodeURIComponent(selectedId), { method: 'PUT', body: JSON.stringify(notePayload()) });
              if (sequence !== saveSequence) return;
              selectedNote = data.note;
              const next = summaryFromNote(data.note);
              const index = notes.findIndex(note => note.id === selectedId);
              if (index >= 0) notes.splice(index, 1, next); else notes.unshift(next);
              notes.sort((a, b) => Boolean(a.pinned) !== Boolean(b.pinned) ? (a.pinned ? -1 : 1) : String(b.updated_at || '').localeCompare(String(a.updated_at || '')));
              setState(label || copy.saved, false);
              renderList();
            } catch (error) {
              if (sequence !== saveSequence) return;
              setState(error?.message || copy.unavailable, true);
            }
          }

          function queueSave() {
            updateCharCount();
            if (!selectedId || loadingNote) return;
            window.clearTimeout(saveTimer);
            saveTimer = window.setTimeout(() => void saveNote(copy.autosaved), 750);
          }

          async function deleteNote() {
            if (!selectedId || !window.confirm(copy.deleteConfirm)) return;
            window.clearTimeout(saveTimer);
            const deletingId = selectedId;
            try {
              await api('/api/notes?id=' + encodeURIComponent(deletingId), { method: 'DELETE' });
              notes = notes.filter(note => note.id !== deletingId);
              selectedId = '';
              selectedNote = null;
              showEditor(null);
              if (notes.length) await selectNote(notes[0].id);
            } catch (error) {
              setState(error?.message || copy.unavailable, true);
            }
          }

          Object.values(fields).forEach(field => {
            field.addEventListener('input', queueSave);
            field.addEventListener('change', queueSave);
          });
          pinButton.addEventListener('click', () => {
            if (!selectedNote) return;
            selectedNote.pinned = !selectedNote.pinned;
            pinButton.classList.toggle('is-pinned', selectedNote.pinned);
            pinButton.setAttribute('aria-pressed', selectedNote.pinned ? 'true' : 'false');
            queueSave();
          });
          document.getElementById('note-save').addEventListener('click', () => void saveNote(copy.saved));
          document.getElementById('note-delete').addEventListener('click', () => void deleteNote());
          document.getElementById('notes-new').addEventListener('click', () => void createNote());
          document.getElementById('notes-new-top').addEventListener('click', () => void createNote());
          document.getElementById('notes-empty-new').addEventListener('click', () => void createNote());
          search.addEventListener('input', () => { query = search.value || ''; renderList(); });
          filters.addEventListener('click', event => {
            const button = event.target.closest('[data-note-filter]');
            if (!button) return;
            filter = button.dataset.noteFilter || 'all';
            filters.querySelectorAll('[data-note-filter]').forEach(item => item.classList.toggle('is-active', item === button));
            renderList();
          });

          void loadNotes(false);
        };
        window.setTimeout(start, 0);
      })();
    </script>
  `;
}
