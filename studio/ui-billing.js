/**
 * 【初学者导读】
 * 文件：studio/ui-billing.js
 * 这是 AERTEX 前端 UI 模块（billing）：通常同时包含页面模板、局部状态、DOM 更新、事件绑定以及对后端 API 的调用。
 * 阅读顺序：①先搜索页面上能看到的标题/按钮文字定位 render；②找 render 依赖的 state；③找 state 在哪里被 API/事件更新；④再去后端搜索相同 API 路径。
 * 初学者提醒：HTML 字符串负责结构，CSS class 负责样式，事件监听负责交互，fetch/API 负责数据；这四层出现问题时要分别排查。
 * 修改注意：不要随意改掉已有 id/data-* 属性，它们可能被事件绑定、自动测试或别的模块引用；动态插入用户文本时要继续做转义。
 * 响应式注意：桌面布局正常并不代表窄屏正常，修改结构后至少检查大屏、平板和手机断点。
 */
const BILLING_CORE = {
  "zh-tw":{billingTitle:"訂閱與權益",billingIntro:"查看目前方案、有效期與 AERTEX Drive 權益。",progress:"學生驗證進度",pendingHelp:"你已提交學生驗證，目前正在等待審核。審核期間無法重複提交；如需重新提交，請先取消目前申請。",privacyTitle:"隱私提醒",studentPricingFootnote:"學生驗證通過後可使用學生價格；學生資格只影響價格，不改變方案容量與權益。",loading:"正在讀取訂閱…",current:"目前方案",renew:"有效期",free:"長期有效",plans:"可用方案",student:"學生資格",studentBenefitTitle:"學生價格",studentBenefitAction:"管理學生資格"},
  "ja-jp":{billingTitle:"サブスクリプションと特典",billingIntro:"現在のプラン、有効期間、AERTEX Drive の特典を確認します。",progress:"学生認証の進捗",pendingHelp:"学生認証はすでに提出され、審査待ちです。審査中は再提出できません。再提出する場合は現在の申請を取り消してください。",privacyTitle:"プライバシーに関する注意",studentPricingFootnote:"学生認証後は対応プランで学生価格を利用できます。学生資格は価格だけに影響し、容量や特典は変わりません。",loading:"サブスクリプションを読み込み中…",current:"現在のプラン",renew:"有効期限",free:"期限なし",plans:"利用可能なプラン",student:"学生資格",studentBenefitTitle:"学生価格",studentBenefitAction:"学生資格を管理"},
  "ko-kr":{billingTitle:"구독 및 혜택",billingIntro:"현재 요금제, 유효 기간 및 AERTEX Drive 혜택을 확인합니다.",progress:"학생 인증 진행 상황",pendingHelp:"학생 인증 요청이 이미 제출되어 검토 중입니다. 검토 중에는 다시 제출할 수 없습니다. 다시 제출하려면 현재 요청을 먼저 취소하세요.",privacyTitle:"개인정보 안내",studentPricingFootnote:"학생 인증 후 지원되는 요금제에서 학생 가격을 사용할 수 있습니다. 학생 자격은 가격에만 영향을 주며 용량과 혜택은 변경되지 않습니다.",loading:"구독을 불러오는 중…",current:"현재 요금제",renew:"유효 기간",free:"만료 없음",plans:"사용 가능한 요금제",student:"학생 자격",studentBenefitTitle:"학생 가격",studentBenefitAction:"학생 자격 관리"},
  "fr-fr":{billingTitle:"Abonnement et avantages",billingIntro:"Consultez votre offre actuelle, sa période de validité et les avantages AERTEX Drive.",progress:"Progression de la vérification étudiante",pendingHelp:"Une demande de vérification étudiante est déjà en attente. Vous ne pouvez pas en soumettre une autre pendant l’examen. Annulez d’abord la demande actuelle si vous devez recommencer.",privacyTitle:"Avis de confidentialité",studentPricingFootnote:"Après vérification, les étudiants peuvent utiliser le tarif étudiant sur les offres compatibles. L’éligibilité modifie uniquement le prix, pas la capacité ni les avantages.",loading:"Chargement de l’abonnement…",current:"Offre actuelle",renew:"Valide jusqu’au",free:"Sans expiration",plans:"Offres disponibles",student:"Statut étudiant",studentBenefitTitle:"Tarif étudiant",studentBenefitAction:"Gérer le statut étudiant"},
  "es-es":{billingTitle:"Suscripción y ventajas",billingIntro:"Consulta tu plan actual, su periodo de validez y las ventajas de AERTEX Drive.",progress:"Progreso de verificación de estudiante",pendingHelp:"Ya has enviado una solicitud de verificación de estudiante y está pendiente de revisión. No puedes enviar otra durante la revisión. Cancela primero la solicitud actual si necesitas volver a enviarla.",privacyTitle:"Aviso de privacidad",studentPricingFootnote:"Tras verificar la condición de estudiante, podrás usar precios para estudiantes en los planes compatibles. La elegibilidad solo cambia el precio, no la capacidad ni las ventajas.",loading:"Cargando suscripción…",current:"Plan actual",renew:"Válido hasta",free:"Sin caducidad",plans:"Planes disponibles",student:"Elegibilidad de estudiante",studentBenefitTitle:"Precio para estudiantes",studentBenefitAction:"Gestionar elegibilidad"},
  "el-gr":{billingTitle:"Συνδρομή και παροχές",billingIntro:"Δείτε το τρέχον πρόγραμμα, τη διάρκεια ισχύος και τις παροχές AERTEX Drive.",progress:"Πρόοδος φοιτητικής επαλήθευσης",pendingHelp:"Έχει ήδη υποβληθεί αίτημα φοιτητικής επαλήθευσης και αναμένει έλεγχο. Δεν μπορείτε να υποβάλετε νέο αίτημα κατά τον έλεγχο. Ακυρώστε πρώτα το τρέχον αν χρειάζεται νέα υποβολή.",privacyTitle:"Ειδοποίηση απορρήτου",studentPricingFootnote:"Μετά την επαλήθευση μπορείτε να χρησιμοποιείτε φοιτητική τιμή στα υποστηριζόμενα προγράμματα. Η ιδιότητα επηρεάζει μόνο την τιμή, όχι τη χωρητικότητα ή τις παροχές.",loading:"Φόρτωση συνδρομής…",current:"Τρέχον πρόγραμμα",renew:"Ισχύει έως",free:"Χωρίς λήξη",plans:"Διαθέσιμα προγράμματα",student:"Φοιτητική ιδιότητα",studentBenefitTitle:"Φοιτητική τιμή",studentBenefitAction:"Διαχείριση φοιτητικής ιδιότητας"},
  "ar-sa":{billingTitle:"الاشتراك والمزايا",billingIntro:"اعرض خطتك الحالية وفترة صلاحيتها ومزايا AERTEX Drive.",progress:"تقدم التحقق من أهلية الطالب",pendingHelp:"لقد أرسلت طلب تحقق من أهلية الطالب وهو قيد المراجعة. لا يمكنك إرسال طلب آخر أثناء المراجعة. ألغِ الطلب الحالي أولاً إذا كنت بحاجة إلى إعادة التقديم.",privacyTitle:"تنبيه الخصوصية",studentPricingFootnote:"بعد التحقق من أهلية الطالب يمكنك استخدام سعر الطلاب في الخطط المدعومة. تؤثر الأهلية في السعر فقط ولا تغيّر السعة أو المزايا.",loading:"جارٍ تحميل الاشتراك…",current:"الخطة الحالية",renew:"صالح حتى",free:"بلا انتهاء",plans:"الخطط المتاحة",student:"أهلية الطالب",studentBenefitTitle:"سعر الطلاب",studentBenefitAction:"إدارة أهلية الطالب"}
};

const BILLING_FLOW_PATCH = {
  "zh-tw":{
    source:"來源",unavailable:"付款功能尚未開放",unavailableDetail:"目前階段用於驗證方案、權益與管理員授權；付款功能接入後會在這裡啟用購買。",error:"暫時無法讀取訂閱資訊。",active:"有效",grace:"寬限期",manual:"管理員授權",system:"系統",autoRenew:"自動續訂",off:"關閉",on:"開啟",quota:"雲端硬碟容量",
    studentIntro:"先選擇你的在讀資格來源，再使用對應的官方方式驗證學生身分。分類依學籍或在讀關係由哪個機構出具，與國籍、戶籍或居住地無關。",
    regionTitle:"你的在讀資格由哪個地區的學校或教育機構出具？",regionHint:"請依學籍或在讀關係的出具機構選擇，不要依國籍、戶籍、目前居住地或實際上課地點選擇。",
    regionMainlandHigher:"中國大陸高等教育 · 可透過學信網驗證",regionMainlandHigherHint:"你的在讀學籍可產生學信網《教育部學籍線上驗證報告》",regionMainlandOther:"中國大陸其他學校 / 教育機構",regionMainlandOtherHint:"中學、中職或其他無法使用學信網學籍報告的在讀情況",regionHmt:"香港、澳門或台灣地區院校",regionHmtHint:"在香港、澳門或台灣註冊並就讀的學校或院校",regionInternational:"其他國家或地區院校",regionInternationalHint:"在讀關係由中國大陸及港澳台以外的學校或教育機構出具",regionOther:"不確定 / 其他情況",regionOtherHint:"例如跨境辦學、聯合培養、境外分校，或不確定應選哪一項",
    methodTitle:"選擇學生身分驗證方式",methodHint:"AERTEX 只驗證在讀狀態，不要求提交國籍證明或政府核發的身分證件。",changeRegion:"更改就讀地區",supportedNow:"目前可用",comingSoon:"即將開放",methodChsi:"學信網學籍線上驗證",methodChsiHint:"使用《教育部學籍線上驗證報告》的官方 QR Code 或 16 位線上驗證碼。",methodSchoolEmail:"學校官方電子郵件",methodSchoolEmailHint:"透過學校分配的官方教育電子郵件驗證在讀關係。",methodEnrollment:"官方在讀證明",methodEnrollmentHint:"使用學校官方出具的在讀狀態證明進行人工審核。",methodUnavailable:"此地區的學生驗證方式仍在完善中。目前不會要求你上傳身分證、護照或完整學生證件。",
    privacy:"只選擇 QR Code 區域。不要提交完整報告，也不要提交身分證號、學號、姓名、證件照片、帳號密碼或其他無關個資。",localOnly:"QR Code 圖片只會在瀏覽器本機解析，不會上傳到 AERTEX。伺服器只接收 16 位線上驗證碼或學信網官方驗證網址。",consent:"我確認所選圖片只包含用於驗證的 QR Code，不包含其他敏感個資。",chooseQr:"選擇 QR Code 圖片",chooseQrHint:"可從照片圖庫、檔案或系統相機選擇",pasteLink:"貼上 16 位線上驗證碼或學信網官方驗證網址",submitStudent:"提交學生驗證",previewTitle:"已選擇的 QR Code 圖片",replaceQr:"重新選擇",manualLink:"無法辨識？手動輸入驗證碼 / 網址",hideManualLink:"收起手動輸入",localPreview:"圖片只在本機預覽與辨識，不會上傳伺服器",
    cancelStudent:"取消待審核申請",pending:"待審核",verified:"已驗證",rejected:"未通過",expired:"已過期",notSubmitted:"尚未驗證",unsupportedQr:"目前瀏覽器無法在本機辨識 QR Code，請使用系統相機掃描後貼上官方驗證網址。",invalidQr:"未辨識到學信網 QR Code 中的 16 位線上驗證碼或支援的官方驗證網址。",tooLarge:"圖片過大，請選擇 5 MB 以內的 QR Code 截圖。",imageOnly:"僅支援 PNG、JPEG 或 WebP 圖片。",multipleQr:"圖片中偵測到多個 QR Code，請裁切到只剩一個。",submitted:"學生驗證申請已提交。",canceled:"待審核申請已取消。",verifyingUntil:"有效期至",
    tutorialTitle:"驗證教學",tutorialIntro:"先準備好學信網《教育部學籍線上驗證報告》的 QR Code，再開始上傳。",tutorialStep1:"開啟學信網並登入「學信檔案」。",tutorialStep2:"進入「線上驗證報告」，申請《教育部學籍線上驗證報告》。",tutorialStep3:"開啟或下載報告，找到其中的官方驗證 QR Code。",tutorialStep4:"只截取 QR Code 區域，不要包含完整報告、姓名、身分證號、學號或照片。",tutorialStep5:"返回 AERTEX，點選「我已準備好 QR Code」，再選擇圖片完成驗證。",tutorialReady:"我已準備好 QR Code，開始驗證",tutorialOfficial:"前往學信網申請報告 ↗",tutorialTip:"提示：新版學信網 QR Code 可能包含驗證提示與 16 位線上驗證碼，不一定是網址；AERTEX 會自動擷取驗證碼。",stepSource:"在讀資格來源",stepMethod:"驗證方式",stepVerify:"提交驗證",currentStatus:"驗證狀態",studentBenefitIntro:"完成學生資格驗證後，可在支援的方案使用學生價格。容量與產品權益不變。",verificationPrivacy:"只驗證在讀狀態",verificationPrivacyDetail:"AERTEX 不以國籍區分資格，也不要求政府核發的身分證件。"
  },
  "ja-jp":{
    source:"提供元",unavailable:"決済はまだ利用できません",unavailableDetail:"現在はプラン、特典、管理者による付与を検証する段階です。決済機能が接続されると、ここから購入できます。",error:"サブスクリプション情報を一時的に取得できません。",active:"有効",grace:"猶予期間",manual:"管理者による付与",system:"システム",autoRenew:"自動更新",off:"オフ",on:"オン",quota:"Drive 容量",
    studentIntro:"在籍情報を発行する教育機関の地域を選び、対応する公式手段で学生資格を確認します。国籍や居住地では分類しません。",regionTitle:"現在の在籍情報はどの地域の学校・教育機関が発行していますか？",regionHint:"国籍、住所、現在地、授業を受ける場所ではなく、在籍情報を発行する機関に基づいて選択してください。",
    regionMainlandHigher:"中国本土の高等教育 · CHSI で確認可能",regionMainlandHigherHint:"CHSI の Online Verification Report of Student Record を発行できる在籍情報",regionMainlandOther:"中国本土のその他の教育機関",regionMainlandOtherHint:"中等教育、職業教育など、CHSI の在籍報告を利用できないケース",regionHmt:"香港・マカオ・台湾の教育機関",regionHmtHint:"香港、マカオ、台湾で登録・在籍している学校または教育機関",regionInternational:"その他の国・地域の教育機関",regionInternationalHint:"中国本土・香港・マカオ・台湾以外の機関が在籍情報を発行する場合",regionOther:"不明 / その他",regionOtherHint:"国境をまたぐ課程、共同教育、海外キャンパスなど、上記に明確に当てはまらない場合",
    methodTitle:"学生資格の確認方法を選択",methodHint:"AERTEX は在籍状況のみを確認します。国籍証明や政府発行の身分証明書は必要ありません。",changeRegion:"教育機関の地域を変更",supportedNow:"現在利用可能",comingSoon:"近日対応",methodChsi:"CHSI 在籍情報確認",methodChsiHint:"Online Verification Report of Student Record の公式 QR コードまたは 16 文字のオンライン確認コードを使用します。",methodSchoolEmail:"学校公式メール",methodSchoolEmailHint:"学校が発行した教育機関の公式メールアドレスで在籍を確認します。",methodEnrollment:"公式在籍証明",methodEnrollmentHint:"教育機関が発行した在籍証明を使用して手動審査します。",methodUnavailable:"この教育制度向けの確認方法は準備中です。パスポート、政府 ID、学生証全体の画像は要求しません。",
    privacy:"QR コード部分だけを選択してください。報告書全体、身分証番号、学生番号、氏名、顔写真、パスワードなどは送信しないでください。",localOnly:"QR 画像はブラウザ内でのみ解析され、AERTEX にはアップロードされません。サーバーには 16 文字の確認コードまたは CHSI 公式確認 URL だけが送信されます。",consent:"選択した画像には確認用 QR コードだけが含まれ、その他の機密情報は含まれていないことを確認します。",chooseQr:"QR 画像を選択",chooseQrHint:"写真、ファイル、システムカメラから選択できます",pasteLink:"16 文字の確認コードまたは CHSI 公式確認 URL を貼り付け",submitStudent:"学生資格確認を送信",previewTitle:"選択した QR 画像",replaceQr:"別の画像を選択",manualLink:"読み取れませんか？コード / URL を手動入力",hideManualLink:"手動入力を閉じる",localPreview:"画像はこのデバイス上でのみプレビュー・認識され、サーバーには送信されません",
    cancelStudent:"審査中の申請を取り消す",pending:"審査中",verified:"確認済み",rejected:"却下",expired:"期限切れ",notSubmitted:"未確認",unsupportedQr:"このブラウザでは QR コードをローカル解析できません。システムカメラで読み取り、公式確認 URL を貼り付けてください。",invalidQr:"CHSI の 16 文字確認コードまたは対応する公式確認 URL が見つかりませんでした。",tooLarge:"画像が大きすぎます。5 MB 未満の QR 部分を選択してください。",imageOnly:"PNG、JPEG、WebP のみ対応しています。",multipleQr:"複数の QR コードが検出されました。1 つだけ残るように切り抜いてください。",submitted:"学生資格確認を送信しました。",canceled:"審査中の申請を取り消しました。",verifyingUntil:"有効期限",
    tutorialTitle:"確認ガイド",tutorialIntro:"アップロード前に CHSI の Online Verification Report of Student Record の QR コードを準備してください。",tutorialStep1:"CHSI を開き、CHSI Archive にサインインします。",tutorialStep2:"Online Verification Reports を開き、在籍情報のオンライン確認報告を申請します。",tutorialStep3:"報告書を開くかダウンロードし、公式確認 QR コードを探します。",tutorialStep4:"QR コード部分だけを切り抜き、報告書全体、氏名、ID 番号、学生番号、顔写真を含めないでください。",tutorialStep5:"AERTEX に戻り、「QR コードの準備ができました」を選び、画像を選択して続行します。",tutorialReady:"QR コードの準備ができました",tutorialOfficial:"CHSI で報告書を申請 ↗",tutorialTip:"新しい CHSI QR コードには URL ではなく 16 文字の確認コードが含まれる場合があります。AERTEX が自動で抽出します。",stepSource:"在籍情報の発行元",stepMethod:"確認方法",stepVerify:"確認を送信",currentStatus:"確認状況",studentBenefitIntro:"学生資格確認後、対応プランで学生価格を利用できます。容量や製品特典は変わりません。",verificationPrivacy:"在籍状況のみを確認",verificationPrivacyDetail:"AERTEX は国籍で資格を分類せず、政府発行の身分証明書も要求しません。"
  },
  "ko-kr":{
    source:"출처",unavailable:"결제 기능은 아직 사용할 수 없습니다",unavailableDetail:"현재 단계에서는 요금제, 혜택 및 관리자 권한 부여를 검증합니다. 결제 기능이 연결되면 여기에서 구매할 수 있습니다.",error:"구독 정보를 일시적으로 불러올 수 없습니다.",active:"활성",grace:"유예 기간",manual:"관리자 부여",system:"시스템",autoRenew:"자동 갱신",off:"끔",on:"켬",quota:"Drive 용량",
    studentIntro:"재학 정보를 발급하는 교육기관의 지역을 선택한 뒤 해당 공식 방법으로 학생 자격을 확인합니다. 국적이나 거주지는 기준이 아닙니다.",regionTitle:"현재 재학 정보는 어느 지역의 학교 또는 교육기관에서 발급하나요?",regionHint:"국적, 주소, 현재 위치나 실제 수업 장소가 아니라 재학 정보를 발급하는 기관을 기준으로 선택하세요.",
    regionMainlandHigher:"중국 본토 고등교육 · CHSI 확인 가능",regionMainlandHigherHint:"CHSI Online Verification Report of Student Record를 발급할 수 있는 재학 정보",regionMainlandOther:"중국 본토 기타 교육기관",regionMainlandOtherHint:"CHSI 학생 기록 보고서를 사용할 수 없는 중등·직업교육 등",regionHmt:"홍콩·마카오·대만 교육기관",regionHmtHint:"홍콩, 마카오 또는 대만에 등록된 학교나 교육기관",regionInternational:"기타 국가 또는 지역의 교육기관",regionInternationalHint:"중국 본토·홍콩·마카오·대만 외 지역의 기관이 재학 정보를 발급하는 경우",regionOther:"잘 모르겠음 / 기타",regionOtherHint:"국경 간 프로그램, 공동 과정, 해외 캠퍼스 등 위 항목에 명확히 해당하지 않는 경우",
    methodTitle:"학생 자격 확인 방법 선택",methodHint:"AERTEX는 재학 상태만 확인합니다. 국적 증명이나 정부 발행 신분증은 요구하지 않습니다.",changeRegion:"교육기관 지역 변경",supportedNow:"현재 사용 가능",comingSoon:"준비 중",methodChsi:"CHSI 학생 기록 확인",methodChsiHint:"Online Verification Report of Student Record의 공식 QR 코드 또는 16자리 온라인 확인 코드를 사용합니다.",methodSchoolEmail:"학교 공식 이메일",methodSchoolEmailHint:"학교에서 발급한 공식 교육 이메일 주소로 재학 관계를 확인합니다.",methodEnrollment:"공식 재학 증명",methodEnrollmentHint:"교육기관이 발급한 재학 증명서를 사용해 수동 검토합니다.",methodUnavailable:"이 교육 체계의 확인 방법은 준비 중입니다. 여권, 정부 신분증 또는 전체 학생증 이미지는 요구하지 않습니다.",
    privacy:"QR 코드 영역만 선택하세요. 전체 보고서, 신분증 번호, 학번, 이름, 사진, 비밀번호 등은 제출하지 마세요.",localOnly:"QR 이미지는 브라우저에서 로컬로만 해석되며 AERTEX에 업로드되지 않습니다. 서버에는 16자리 확인 코드 또는 CHSI 공식 확인 URL만 전송됩니다.",consent:"선택한 이미지에 확인용 QR 코드만 포함되고 다른 민감 정보는 포함되지 않았음을 확인합니다.",chooseQr:"QR 이미지 선택",chooseQrHint:"사진, 파일 또는 시스템 카메라에서 선택할 수 있습니다",pasteLink:"16자리 확인 코드 또는 CHSI 공식 확인 URL 붙여넣기",submitStudent:"학생 인증 제출",previewTitle:"선택한 QR 이미지",replaceQr:"다른 이미지 선택",manualLink:"인식되지 않나요? 코드 / URL 직접 입력",hideManualLink:"직접 입력 닫기",localPreview:"이미지는 이 기기에서만 미리보기 및 인식되며 서버에 업로드되지 않습니다",
    cancelStudent:"대기 중인 요청 취소",pending:"검토 대기",verified:"인증됨",rejected:"거절됨",expired:"만료됨",notSubmitted:"미인증",unsupportedQr:"이 브라우저는 QR 코드를 로컬에서 해석할 수 없습니다. 시스템 카메라로 스캔한 뒤 공식 확인 URL을 붙여넣으세요.",invalidQr:"CHSI 16자리 확인 코드 또는 지원되는 공식 확인 URL을 찾지 못했습니다.",tooLarge:"이미지가 너무 큽니다. 5 MB 미만의 QR 영역을 사용하세요.",imageOnly:"PNG, JPEG 또는 WebP만 지원합니다.",multipleQr:"여러 QR 코드가 감지되었습니다. 하나만 남도록 이미지를 잘라 주세요.",submitted:"학생 인증 요청을 제출했습니다.",canceled:"대기 중인 인증 요청을 취소했습니다.",verifyingUntil:"유효 기간",
    tutorialTitle:"인증 안내",tutorialIntro:"업로드 전에 CHSI Online Verification Report of Student Record의 QR 코드를 준비하세요.",tutorialStep1:"CHSI를 열고 CHSI Archive에 로그인합니다.",tutorialStep2:"Online Verification Reports에서 학생 기록 온라인 확인 보고서를 신청합니다.",tutorialStep3:"보고서를 열거나 다운로드하고 공식 확인 QR 코드를 찾습니다.",tutorialStep4:"QR 코드 영역만 잘라 전체 보고서, 이름, ID 번호, 학번, 사진이 포함되지 않게 합니다.",tutorialStep5:"AERTEX로 돌아와 QR 코드 준비 완료를 선택한 뒤 이미지를 선택해 계속합니다.",tutorialReady:"QR 코드 준비 완료 · 인증 시작",tutorialOfficial:"CHSI 보고서 신청 열기 ↗",tutorialTip:"새 CHSI QR 코드는 URL 대신 16자리 온라인 확인 코드를 포함할 수 있으며 AERTEX가 자동으로 추출합니다.",stepSource:"재학 정보 출처",stepMethod:"인증 방법",stepVerify:"인증 제출",currentStatus:"인증 상태",studentBenefitIntro:"학생 자격 확인 후 지원되는 요금제에서 학생 가격을 사용할 수 있습니다. 용량과 제품 혜택은 동일합니다.",verificationPrivacy:"재학 상태만 확인",verificationPrivacyDetail:"AERTEX는 국적에 따라 자격을 분류하지 않으며 정부 발행 신분증을 요구하지 않습니다."
  },
  "fr-fr":{
    source:"Source",unavailable:"Le paiement n’est pas encore disponible",unavailableDetail:"Cette phase valide les offres, les avantages et les attributions administrateur. L’achat sera activé ici lorsque le paiement sera connecté.",error:"Les informations d’abonnement sont temporairement indisponibles.",active:"Actif",grace:"Période de grâce",manual:"Attribution administrateur",system:"Système",autoRenew:"Renouvellement automatique",off:"Désactivé",on:"Activé",quota:"Capacité Drive",
    studentIntro:"Choisissez la région de l’établissement qui délivre votre statut d’inscription, puis utilisez la méthode officielle correspondante. La nationalité et le lieu de résidence ne déterminent pas la catégorie.",regionTitle:"Dans quelle région se trouve l’établissement qui délivre votre statut d’inscription ?",regionHint:"Choisissez selon l’établissement qui délivre le dossier d’inscription, et non selon votre nationalité, votre domicile, votre position actuelle ou le lieu physique des cours.",
    regionMainlandHigher:"Enseignement supérieur en Chine continentale · vérifiable via CHSI",regionMainlandHigherHint:"Votre inscription permet d’obtenir un Online Verification Report of Student Record de CHSI",regionMainlandOther:"Autres établissements en Chine continentale",regionMainlandOtherHint:"Secondaire, professionnel ou autres cas sans rapport CHSI",regionHmt:"Établissements de Hong Kong, Macao ou Taïwan",regionHmtHint:"Écoles ou établissements enregistrés à Hong Kong, Macao ou Taïwan",regionInternational:"Établissements d’autres pays ou régions",regionInternationalHint:"Votre statut est délivré hors de Chine continentale, Hong Kong, Macao et Taïwan",regionOther:"Incertain / autre cas",regionOtherHint:"Programmes transfrontaliers, formations conjointes, campus à l’étranger ou cas ne correspondant pas clairement aux catégories ci-dessus",
    methodTitle:"Choisir une méthode de vérification étudiante",methodHint:"AERTEX vérifie uniquement le statut d’inscription. Aucun justificatif de nationalité ni document d’identité gouvernemental n’est requis.",changeRegion:"Changer la région de l’établissement",supportedNow:"Disponible",comingSoon:"Bientôt",methodChsi:"Vérification CHSI du dossier étudiant",methodChsiHint:"Utilisez le QR code officiel ou le code de vérification en ligne à 16 caractères du rapport CHSI.",methodSchoolEmail:"E-mail officiel de l’établissement",methodSchoolEmailHint:"Vérifiez l’inscription avec une adresse e-mail éducative officielle fournie par l’établissement.",methodEnrollment:"Attestation officielle d’inscription",methodEnrollmentHint:"Utilisez une attestation officielle de l’établissement pour un examen manuel.",methodUnavailable:"La vérification pour ce système éducatif est en préparation. AERTEX ne demandera pas de passeport, de pièce d’identité gouvernementale ni de carte étudiante complète.",
    privacy:"Sélectionnez uniquement la zone du QR code. N’envoyez pas le rapport complet, un numéro d’identité, un numéro étudiant, un nom, un portrait, un mot de passe ou d’autres informations inutiles.",localOnly:"L’image du QR code est décodée localement dans le navigateur et n’est jamais envoyée à AERTEX. Le serveur reçoit uniquement un code de vérification à 16 caractères ou une URL officielle CHSI.",consent:"Je confirme que l’image sélectionnée contient uniquement le QR code de vérification et aucune autre donnée sensible.",chooseQr:"Choisir une image QR",chooseQrHint:"Choisissez depuis Photos, Fichiers ou l’appareil photo système",pasteLink:"Coller le code à 16 caractères ou l’URL officielle CHSI",submitStudent:"Envoyer la vérification",previewTitle:"Image QR sélectionnée",replaceQr:"Choisir une autre image",manualLink:"Impossible à lire ? Saisir le code / l’URL manuellement",hideManualLink:"Masquer la saisie manuelle",localPreview:"L’image reste sur cet appareil pour l’aperçu et la reconnaissance et n’est pas envoyée au serveur",
    cancelStudent:"Annuler la demande en attente",pending:"En attente",verified:"Vérifié",rejected:"Refusé",expired:"Expiré",notSubmitted:"Non vérifié",unsupportedQr:"Ce navigateur ne peut pas décoder localement les QR codes. Utilisez l’appareil photo système puis collez l’URL officielle.",invalidQr:"Aucun code CHSI à 16 caractères ni URL officielle compatible n’a été trouvé.",tooLarge:"Image trop volumineuse. Utilisez un recadrage QR de moins de 5 Mo.",imageOnly:"Seules les images PNG, JPEG ou WebP sont prises en charge.",multipleQr:"Plusieurs QR codes ont été détectés. Recadrez l’image pour n’en conserver qu’un.",submitted:"Demande de vérification étudiante envoyée.",canceled:"Demande en attente annulée.",verifyingUntil:"Valide jusqu’au",
    tutorialTitle:"Guide de vérification",tutorialIntro:"Préparez le QR code de votre Online Verification Report of Student Record CHSI avant de téléverser quoi que ce soit.",tutorialStep1:"Ouvrez CHSI et connectez-vous à CHSI Archive.",tutorialStep2:"Ouvrez Online Verification Reports et demandez le rapport étudiant.",tutorialStep3:"Ouvrez ou téléchargez le rapport et repérez son QR code officiel.",tutorialStep4:"Recadrez uniquement le QR code. N’incluez pas le rapport complet, le nom, le numéro d’identité, le numéro étudiant ou le portrait.",tutorialStep5:"Revenez dans AERTEX, choisissez que votre QR code est prêt, puis sélectionnez l’image recadrée.",tutorialReady:"Mon QR code est prêt · commencer",tutorialOfficial:"Ouvrir la demande de rapport CHSI ↗",tutorialTip:"Les QR codes CHSI récents peuvent contenir un code de vérification à 16 caractères plutôt qu’une URL. AERTEX l’extrait automatiquement.",stepSource:"Source de l’inscription",stepMethod:"Méthode de vérification",stepVerify:"Envoyer la vérification",currentStatus:"État de la vérification",studentBenefitIntro:"Après vérification, utilisez le tarif étudiant sur les offres compatibles. La capacité et les avantages produit restent inchangés.",verificationPrivacy:"Vérification du statut d’inscription uniquement",verificationPrivacyDetail:"AERTEX ne classe pas l’éligibilité selon la nationalité et ne demande pas de document d’identité gouvernemental."
  },
  "es-es":{
    source:"Fuente",unavailable:"El pago aún no está disponible",unavailableDetail:"Esta fase valida planes, ventajas y concesiones de administrador. La compra se habilitará aquí cuando el pago esté conectado.",error:"La información de suscripción no está disponible temporalmente.",active:"Activo",grace:"Periodo de gracia",manual:"Concesión de administrador",system:"Sistema",autoRenew:"Renovación automática",off:"Desactivado",on:"Activado",quota:"Capacidad de Drive",
    studentIntro:"Elige la región de la institución que emite tu estado de matrícula y usa el método oficial correspondiente. La categoría no depende de la nacionalidad ni de la residencia.",regionTitle:"¿En qué región está la institución que emite tu estado de matrícula?",regionHint:"Elige según la institución que emite tu matrícula, no según tu nacionalidad, residencia, ubicación actual o lugar físico de las clases.",
    regionMainlandHigher:"Educación superior en China continental · verificable mediante CHSI",regionMainlandHigherHint:"Tu matrícula puede generar un Online Verification Report of Student Record de CHSI",regionMainlandOther:"Otros centros educativos de China continental",regionMainlandOtherHint:"Secundaria, formación profesional u otros casos sin informe CHSI",regionHmt:"Instituciones de Hong Kong, Macao o Taiwán",regionHmtHint:"Escuelas o instituciones registradas en Hong Kong, Macao o Taiwán",regionInternational:"Instituciones de otros países o regiones",regionInternationalHint:"Tu estado de matrícula se emite fuera de China continental, Hong Kong, Macao y Taiwán",regionOther:"No estoy seguro / otro caso",regionOtherHint:"Programas transfronterizos, programas conjuntos, campus en el extranjero u otros casos",
    methodTitle:"Elige un método de verificación de estudiante",methodHint:"AERTEX solo verifica el estado de matrícula. No necesitas proporcionar documentos de nacionalidad ni identidad gubernamental.",changeRegion:"Cambiar región de la institución",supportedNow:"Disponible",comingSoon:"Próximamente",methodChsi:"Verificación de matrícula CHSI",methodChsiHint:"Usa el QR oficial o el código de verificación en línea de 16 caracteres del informe CHSI.",methodSchoolEmail:"Correo oficial de la institución",methodSchoolEmailHint:"Verifica la matrícula con una dirección educativa oficial emitida por tu centro.",methodEnrollment:"Certificado oficial de matrícula",methodEnrollmentHint:"Usa un certificado oficial de la institución para revisión manual.",methodUnavailable:"La verificación para este sistema educativo está en preparación. AERTEX no pedirá pasaporte, documento de identidad gubernamental ni una credencial estudiantil completa.",
    privacy:"Selecciona solo la zona del QR. No envíes el informe completo, números de identidad o estudiante, nombre, retrato, credenciales ni información innecesaria.",localOnly:"La imagen QR se decodifica localmente en el navegador y no se sube a AERTEX. El servidor recibe solo el código de 16 caracteres o una URL oficial de CHSI.",consent:"Confirmo que la imagen seleccionada contiene únicamente el QR de verificación y ninguna otra información sensible.",chooseQr:"Elegir imagen QR",chooseQrHint:"Elige desde Fotos, Archivos o la cámara del sistema",pasteLink:"Pega el código de 16 caracteres o la URL oficial de CHSI",submitStudent:"Enviar verificación",previewTitle:"Imagen QR seleccionada",replaceQr:"Elegir otra imagen",manualLink:"¿No se puede leer? Introduce el código / URL manualmente",hideManualLink:"Ocultar entrada manual",localPreview:"La imagen permanece en este dispositivo para vista previa y reconocimiento y no se sube al servidor",
    cancelStudent:"Cancelar solicitud pendiente",pending:"Pendiente de revisión",verified:"Verificado",rejected:"Rechazado",expired:"Caducado",notSubmitted:"Sin verificar",unsupportedQr:"Este navegador no puede decodificar QR localmente. Escanéalo con la cámara del sistema y pega la URL oficial.",invalidQr:"No se encontró ningún código CHSI de 16 caracteres ni URL oficial compatible.",tooLarge:"La imagen es demasiado grande. Usa un recorte QR de menos de 5 MB.",imageOnly:"Solo se admiten imágenes PNG, JPEG o WebP.",multipleQr:"Se detectaron varios QR. Recorta la imagen para que quede solo uno.",submitted:"Solicitud de verificación de estudiante enviada.",canceled:"Solicitud pendiente cancelada.",verifyingUntil:"Válido hasta",
    tutorialTitle:"Guía de verificación",tutorialIntro:"Prepara el QR del Online Verification Report of Student Record de CHSI antes de subir nada.",tutorialStep1:"Abre CHSI e inicia sesión en CHSI Archive.",tutorialStep2:"Abre Online Verification Reports y solicita el informe de matrícula.",tutorialStep3:"Abre o descarga el informe y localiza su QR oficial.",tutorialStep4:"Recorta solo el QR; no incluyas el informe completo, nombre, número de identidad, número de estudiante ni retrato.",tutorialStep5:"Vuelve a AERTEX, indica que el QR está listo y selecciona la imagen recortada.",tutorialReady:"Mi QR está listo · iniciar verificación",tutorialOfficial:"Abrir solicitud de informe CHSI ↗",tutorialTip:"Los QR recientes de CHSI pueden contener un código de 16 caracteres en vez de una URL. AERTEX lo extrae automáticamente.",stepSource:"Origen de matrícula",stepMethod:"Método de verificación",stepVerify:"Enviar verificación",currentStatus:"Estado de verificación",studentBenefitIntro:"Tras verificar tu condición de estudiante, usa el precio para estudiantes en los planes compatibles. La capacidad y las ventajas no cambian.",verificationPrivacy:"Solo se verifica el estado de matrícula",verificationPrivacyDetail:"AERTEX no clasifica la elegibilidad por nacionalidad ni requiere documentos de identidad gubernamentales."
  },
  "el-gr":{
    source:"Πηγή",unavailable:"Η πληρωμή δεν είναι ακόμη διαθέσιμη",unavailableDetail:"Σε αυτή τη φάση επαληθεύονται προγράμματα, παροχές και παραχωρήσεις διαχειριστή. Η αγορά θα ενεργοποιηθεί εδώ όταν συνδεθεί η πληρωμή.",error:"Οι πληροφορίες συνδρομής δεν είναι προσωρινά διαθέσιμες.",active:"Ενεργό",grace:"Περίοδος χάριτος",manual:"Παραχώρηση διαχειριστή",system:"Σύστημα",autoRenew:"Αυτόματη ανανέωση",off:"Ανενεργό",on:"Ενεργό",quota:"Χωρητικότητα Drive",
    studentIntro:"Επιλέξτε την περιοχή του ιδρύματος που εκδίδει την εγγραφή σας και χρησιμοποιήστε την αντίστοιχη επίσημη μέθοδο. Η κατηγορία δεν βασίζεται στην εθνικότητα ή την κατοικία.",regionTitle:"Σε ποια περιοχή βρίσκεται το ίδρυμα που εκδίδει την τρέχουσα εγγραφή σας;",regionHint:"Επιλέξτε βάσει του ιδρύματος που εκδίδει την εγγραφή και όχι βάσει εθνικότητας, κατοικίας, τρέχουσας τοποθεσίας ή τόπου μαθημάτων.",
    regionMainlandHigher:"Ανώτατη εκπαίδευση στην ηπειρωτική Κίνα · επαληθεύσιμη μέσω CHSI",regionMainlandHigherHint:"Η εγγραφή σας μπορεί να εκδώσει Online Verification Report of Student Record από CHSI",regionMainlandOther:"Άλλα εκπαιδευτικά ιδρύματα στην ηπειρωτική Κίνα",regionMainlandOtherHint:"Δευτεροβάθμια, επαγγελματική ή άλλη εκπαίδευση χωρίς αναφορά CHSI",regionHmt:"Ιδρύματα Χονγκ Κονγκ, Μακάο ή Ταϊβάν",regionHmtHint:"Σχολεία ή ιδρύματα εγγεγραμμένα σε Χονγκ Κονγκ, Μακάο ή Ταϊβάν",regionInternational:"Ιδρύματα άλλων χωρών ή περιοχών",regionInternationalHint:"Η εγγραφή εκδίδεται εκτός ηπειρωτικής Κίνας, Χονγκ Κονγκ, Μακάο και Ταϊβάν",regionOther:"Δεν είμαι βέβαιος / άλλη περίπτωση",regionOtherHint:"Διασυνοριακά ή κοινά προγράμματα, υπερπόντιες πανεπιστημιουπόλεις ή άλλες περιπτώσεις",
    methodTitle:"Επιλέξτε μέθοδο φοιτητικής επαλήθευσης",methodHint:"Το AERTEX επαληθεύει μόνο την κατάσταση εγγραφής. Δεν απαιτείται απόδειξη εθνικότητας ή κρατικό έγγραφο ταυτότητας.",changeRegion:"Αλλαγή περιοχής ιδρύματος",supportedNow:"Διαθέσιμο τώρα",comingSoon:"Σύντομα",methodChsi:"Επαλήθευση φοιτητικού μητρώου CHSI",methodChsiHint:"Χρησιμοποιήστε το επίσημο QR ή τον 16-χαρακτήρων κωδικό της αναφοράς CHSI.",methodSchoolEmail:"Επίσημο email ιδρύματος",methodSchoolEmailHint:"Επαληθεύστε την εγγραφή με επίσημη εκπαιδευτική διεύθυνση email του ιδρύματος.",methodEnrollment:"Επίσημη βεβαίωση εγγραφής",methodEnrollmentHint:"Χρησιμοποιήστε επίσημη βεβαίωση του ιδρύματος για χειροκίνητο έλεγχο.",methodUnavailable:"Η επαλήθευση για αυτό το εκπαιδευτικό σύστημα προετοιμάζεται. Το AERTEX δεν θα ζητήσει διαβατήριο, κρατική ταυτότητα ή πλήρη φοιτητική κάρτα.",
    privacy:"Επιλέξτε μόνο την περιοχή QR. Μην υποβάλετε πλήρη αναφορά, αριθμό ταυτότητας ή φοιτητή, όνομα, φωτογραφία, διαπιστευτήρια ή άσχετα προσωπικά δεδομένα.",localOnly:"Η εικόνα QR αποκωδικοποιείται τοπικά στο πρόγραμμα περιήγησης και δεν μεταφορτώνεται στο AERTEX. Ο διακομιστής λαμβάνει μόνο τον 16-χαρακτήρων κωδικό ή επίσημο URL CHSI.",consent:"Επιβεβαιώνω ότι η επιλεγμένη εικόνα περιέχει μόνο το QR επαλήθευσης και καμία άλλη ευαίσθητη πληροφορία.",chooseQr:"Επιλογή εικόνας QR",chooseQrHint:"Επιλέξτε από Φωτογραφίες, Αρχεία ή την κάμερα συστήματος",pasteLink:"Επικολλήστε τον 16-χαρακτήρων κωδικό ή το επίσημο URL CHSI",submitStudent:"Υποβολή επαλήθευσης",previewTitle:"Επιλεγμένη εικόνα QR",replaceQr:"Επιλογή άλλης εικόνας",manualLink:"Δεν αναγνωρίζεται; Εισαγάγετε κωδικό / URL χειροκίνητα",hideManualLink:"Απόκρυψη χειροκίνητης εισαγωγής",localPreview:"Η εικόνα παραμένει σε αυτή τη συσκευή για προεπισκόπηση και αναγνώριση και δεν μεταφορτώνεται",
    cancelStudent:"Ακύρωση εκκρεμούς αιτήματος",pending:"Σε αναμονή",verified:"Επαληθευμένο",rejected:"Απορρίφθηκε",expired:"Έληξε",notSubmitted:"Μη επαληθευμένο",unsupportedQr:"Το πρόγραμμα περιήγησης δεν μπορεί να αποκωδικοποιήσει QR τοπικά. Σαρώστε με την κάμερα συστήματος και επικολλήστε το επίσημο URL.",invalidQr:"Δεν βρέθηκε 16-χαρακτήρων κωδικός CHSI ή υποστηριζόμενο επίσημο URL.",tooLarge:"Η εικόνα είναι πολύ μεγάλη. Χρησιμοποιήστε περικοπή QR κάτω από 5 MB.",imageOnly:"Υποστηρίζονται μόνο PNG, JPEG ή WebP.",multipleQr:"Εντοπίστηκαν πολλά QR. Περικόψτε την εικόνα ώστε να απομείνει ένα.",submitted:"Το αίτημα φοιτητικής επαλήθευσης υποβλήθηκε.",canceled:"Το εκκρεμές αίτημα ακυρώθηκε.",verifyingUntil:"Ισχύει έως",
    tutorialTitle:"Οδηγός επαλήθευσης",tutorialIntro:"Προετοιμάστε το QR από το CHSI Online Verification Report of Student Record πριν από οποιαδήποτε μεταφόρτωση.",tutorialStep1:"Ανοίξτε το CHSI και συνδεθείτε στο CHSI Archive.",tutorialStep2:"Ανοίξτε το Online Verification Reports και ζητήστε την αναφορά φοιτητικού μητρώου.",tutorialStep3:"Ανοίξτε ή κατεβάστε την αναφορά και βρείτε το επίσημο QR.",tutorialStep4:"Περικόψτε μόνο το QR και μην συμπεριλάβετε πλήρη αναφορά, όνομα, αριθμό ταυτότητας, φοιτητικό αριθμό ή φωτογραφία.",tutorialStep5:"Επιστρέψτε στο AERTEX, δηλώστε ότι το QR είναι έτοιμο και επιλέξτε την περικομμένη εικόνα.",tutorialReady:"Το QR είναι έτοιμο · έναρξη",tutorialOfficial:"Άνοιγμα αίτησης αναφοράς CHSI ↗",tutorialTip:"Νεότερα QR CHSI μπορεί να περιέχουν 16-χαρακτήρων κωδικό αντί για URL. Το AERTEX τον εξάγει αυτόματα.",stepSource:"Πηγή εγγραφής",stepMethod:"Μέθοδος επαλήθευσης",stepVerify:"Υποβολή επαλήθευσης",currentStatus:"Κατάσταση επαλήθευσης",studentBenefitIntro:"Μετά την επαλήθευση χρησιμοποιήστε φοιτητική τιμή στα υποστηριζόμενα προγράμματα. Η χωρητικότητα και οι παροχές δεν αλλάζουν.",verificationPrivacy:"Επαληθεύεται μόνο η εγγραφή",verificationPrivacyDetail:"Το AERTEX δεν ταξινομεί την επιλεξιμότητα βάσει εθνικότητας και δεν απαιτεί κρατικό έγγραφο ταυτότητας."
  },
  "ar-sa":{
    source:"المصدر",unavailable:"الدفع غير متاح بعد",unavailableDetail:"تتحقق هذه المرحلة من الخطط والمزايا ومنح المسؤول. سيُفعّل الشراء هنا عند ربط الدفع.",error:"معلومات الاشتراك غير متاحة مؤقتًا.",active:"نشط",grace:"فترة سماح",manual:"منحة المسؤول",system:"النظام",autoRenew:"التجديد التلقائي",off:"إيقاف",on:"تشغيل",quota:"سعة Drive",
    studentIntro:"اختر منطقة المؤسسة التعليمية التي تصدر حالة تسجيلك، ثم استخدم وسيلة التحقق الرسمية المناسبة. لا يعتمد التصنيف على الجنسية أو محل الإقامة.",regionTitle:"في أي منطقة تقع المؤسسة التي تصدر حالة تسجيلك الحالية؟",regionHint:"اختر وفق المؤسسة التي تصدر سجل التسجيل، لا وفق الجنسية أو الإقامة أو الموقع الحالي أو مكان الدراسة الفعلي.",
    regionMainlandHigher:"التعليم العالي في بر الصين الرئيسي · قابل للتحقق عبر CHSI",regionMainlandHigherHint:"يمكن لسجل تسجيلك إصدار Online Verification Report of Student Record من CHSI",regionMainlandOther:"مؤسسات تعليمية أخرى في بر الصين الرئيسي",regionMainlandOtherHint:"التعليم الثانوي أو المهني أو حالات أخرى لا تستخدم تقرير CHSI",regionHmt:"مؤسسات هونغ كونغ أو ماكاو أو تايوان",regionHmtHint:"مدارس أو مؤسسات مسجلة في هونغ كونغ أو ماكاو أو تايوان",regionInternational:"مؤسسات في دول أو مناطق أخرى",regionInternationalHint:"تُصدر حالة تسجيلك خارج بر الصين الرئيسي وهونغ كونغ وماكاو وتايوان",regionOther:"غير متأكد / حالة أخرى",regionOtherHint:"مثل البرامج العابرة للحدود أو البرامج المشتركة أو الفروع الخارجية أو الحالات غير الواضحة",
    methodTitle:"اختر طريقة التحقق من أهلية الطالب",methodHint:"يتحقق AERTEX من حالة التسجيل فقط. لا تحتاج إلى تقديم إثبات جنسية أو وثيقة هوية حكومية.",changeRegion:"تغيير منطقة المؤسسة",supportedNow:"متاح الآن",comingSoon:"قريبًا",methodChsi:"التحقق من سجل الطالب عبر CHSI",methodChsiHint:"استخدم رمز QR الرسمي أو رمز التحقق عبر الإنترنت المكوّن من 16 محرفًا من تقرير CHSI.",methodSchoolEmail:"البريد الرسمي للمؤسسة",methodSchoolEmailHint:"تحقق من التسجيل باستخدام عنوان بريد تعليمي رسمي تصدره المؤسسة.",methodEnrollment:"إثبات تسجيل رسمي",methodEnrollmentHint:"استخدم إثباتًا رسميًا صادرًا من المؤسسة للمراجعة اليدوية.",methodUnavailable:"طريقة التحقق لهذا النظام التعليمي قيد الإعداد. لن يطلب AERTEX جواز سفر أو هوية حكومية أو بطاقة طالب كاملة.",
    privacy:"اختر منطقة رمز QR فقط. لا ترسل التقرير الكامل أو رقم الهوية أو الرقم الطلابي أو الاسم أو الصورة أو بيانات الدخول أو أي معلومات غير لازمة.",localOnly:"تُفك شفرة صورة QR محليًا في المتصفح ولا تُرفع إلى AERTEX. لا يستلم الخادم سوى رمز التحقق ذي 16 محرفًا أو رابط CHSI الرسمي.",consent:"أؤكد أن الصورة المختارة تحتوي فقط على رمز QR للتحقق ولا تتضمن معلومات حساسة أخرى.",chooseQr:"اختيار صورة QR",chooseQrHint:"اختر من الصور أو الملفات أو كاميرا النظام",pasteLink:"الصق رمز التحقق ذي 16 محرفًا أو رابط CHSI الرسمي",submitStudent:"إرسال التحقق",previewTitle:"صورة QR المختارة",replaceQr:"اختيار صورة أخرى",manualLink:"تعذر التعرف؟ أدخل الرمز / الرابط يدويًا",hideManualLink:"إخفاء الإدخال اليدوي",localPreview:"تبقى الصورة على هذا الجهاز للمعاينة والتعرف ولا تُرفع إلى الخادم",
    cancelStudent:"إلغاء الطلب المعلّق",pending:"قيد المراجعة",verified:"تم التحقق",rejected:"مرفوض",expired:"منتهي",notSubmitted:"غير متحقق",unsupportedQr:"لا يستطيع هذا المتصفح فك QR محليًا. امسحه بكاميرا النظام ثم الصق الرابط الرسمي.",invalidQr:"لم يتم العثور على رمز CHSI ذي 16 محرفًا أو رابط رسمي مدعوم.",tooLarge:"الصورة كبيرة جدًا. استخدم قصاصة QR أصغر من 5 MB.",imageOnly:"تُدعم صور PNG وJPEG وWebP فقط.",multipleQr:"تم اكتشاف عدة رموز QR. قص الصورة بحيث يبقى رمز واحد فقط.",submitted:"تم إرسال طلب التحقق من أهلية الطالب.",canceled:"تم إلغاء الطلب المعلّق.",verifyingUntil:"صالح حتى",
    tutorialTitle:"دليل التحقق",tutorialIntro:"جهّز رمز QR من CHSI Online Verification Report of Student Record قبل رفع أي شيء.",tutorialStep1:"افتح CHSI وسجّل الدخول إلى CHSI Archive.",tutorialStep2:"افتح Online Verification Reports واطلب تقرير سجل الطالب.",tutorialStep3:"افتح التقرير أو نزّله وحدد رمز QR الرسمي.",tutorialStep4:"اقتصّ رمز QR فقط ولا تضمّن التقرير الكامل أو الاسم أو رقم الهوية أو الرقم الطلابي أو الصورة.",tutorialStep5:"ارجع إلى AERTEX، اختر أن رمز QR جاهز، ثم حدد الصورة المقصوصة.",tutorialReady:"رمز QR جاهز · بدء التحقق",tutorialOfficial:"فتح طلب تقرير CHSI ↗",tutorialTip:"قد تحتوي رموز CHSI الجديدة على رمز تحقق من 16 محرفًا بدلًا من رابط. يستخرجه AERTEX تلقائيًا.",stepSource:"مصدر التسجيل",stepMethod:"طريقة التحقق",stepVerify:"إرسال التحقق",currentStatus:"حالة التحقق",studentBenefitIntro:"بعد التحقق من أهلية الطالب يمكنك استخدام سعر الطلاب في الخطط المدعومة. لا تتغير السعة أو مزايا المنتج.",verificationPrivacy:"التحقق من حالة التسجيل فقط",verificationPrivacyDetail:"لا يصنف AERTEX الأهلية حسب الجنسية ولا يطلب وثيقة هوية حكومية."
  }
};
for (const [locale, values] of Object.entries(BILLING_FLOW_PATCH)) Object.assign(BILLING_CORE[locale], values);

const BILLING_RUNTIME = {
  "en-us":{pendingReview:"Waiting for administrator review through the official CHSI verification service.",expiredResubmit:"Submit a new valid student verification.",recognizedCode:"CHSI 16-character online verification code recognized. The image remains only as a local preview on this page and is never uploaded.",recognizedUrl:"Official CHSI verification URL recognized. The image remains only as a local preview on this page and is never uploaded.",currentPlan:"Current",popular:"Popular",free:"Free",perMonth:"/ month",studentPerMonth:"/ month · Student",guideDone:"Guide completed ✓",privacyConfirmed:"Privacy notice confirmed. Choose a QR image, or enter the 16-character code / official verification URL to continue.",privacyRequired:"You must confirm the privacy notice before submitting; QR images are still decoded locally."},
  "zh-cn":{pendingReview:"正在等待管理员通过学信网官方渠道核验。",expiredResubmit:"请重新提交有效的学生认证。",recognizedCode:"已识别学信网 16 位在线验证码。图片仅保留在当前页面本地预览，不会上传。",recognizedUrl:"已识别学信网官方验证链接。图片仅保留在当前页面本地预览，不会上传。",currentPlan:"当前套餐",popular:"推荐",free:"免费",perMonth:"/ 月",studentPerMonth:"/月 · 学生",guideDone:"教程已阅读 ✓",privacyConfirmed:"已确认隐私提示。选择二维码，或输入 16 位在线验证码 / 官方验证链接后即可提交。",privacyRequired:"提交前需要勾选隐私确认；二维码图片仍只在本地解析。"},
  "zh-tw":{pendingReview:"正在等待管理員透過學信網官方管道核驗。",expiredResubmit:"請重新提交有效的學生驗證。",recognizedCode:"已辨識學信網 16 位線上驗證碼。圖片只保留在目前頁面本機預覽，不會上傳。",recognizedUrl:"已辨識學信網官方驗證網址。圖片只保留在目前頁面本機預覽，不會上傳。",currentPlan:"目前方案",popular:"推薦",free:"免費",perMonth:"/ 月",studentPerMonth:"/ 月 · 學生",guideDone:"已閱讀教學 ✓",privacyConfirmed:"已確認隱私提示。選擇 QR Code，或輸入 16 位驗證碼 / 官方驗證網址後即可提交。",privacyRequired:"提交前需要勾選隱私確認；QR Code 圖片仍只在本機解析。"},
  "ja-jp":{pendingReview:"CHSI の公式確認サービスを通じた管理者レビューを待っています。",expiredResubmit:"有効な学生資格確認を再提出してください。",recognizedCode:"CHSI の 16 文字オンライン確認コードを認識しました。画像はこのページ上のローカルプレビューにのみ保持され、アップロードされません。",recognizedUrl:"CHSI の公式確認 URL を認識しました。画像はこのページ上のローカルプレビューにのみ保持され、アップロードされません。",currentPlan:"現在のプラン",popular:"おすすめ",free:"無料",perMonth:"/ 月",studentPerMonth:"/ 月 · 学生",guideDone:"ガイド確認済み ✓",privacyConfirmed:"プライバシー通知を確認しました。QR 画像を選択するか、16 文字コード / 公式 URL を入力して続行できます。",privacyRequired:"送信前にプライバシー確認が必要です。QR 画像は引き続きローカルでのみ解析されます。"},
  "ko-kr":{pendingReview:"CHSI 공식 확인 서비스를 통한 관리자 검토를 기다리고 있습니다.",expiredResubmit:"유효한 학생 인증을 다시 제출하세요.",recognizedCode:"CHSI 16자리 온라인 확인 코드를 인식했습니다. 이미지는 이 페이지의 로컬 미리보기에만 유지되며 업로드되지 않습니다.",recognizedUrl:"CHSI 공식 확인 URL을 인식했습니다. 이미지는 이 페이지의 로컬 미리보기에만 유지되며 업로드되지 않습니다.",currentPlan:"현재 요금제",popular:"추천",free:"무료",perMonth:"/월",studentPerMonth:"/월 · 학생",guideDone:"안내 확인 완료 ✓",privacyConfirmed:"개인정보 안내를 확인했습니다. QR 이미지를 선택하거나 16자리 코드 / 공식 URL을 입력해 계속하세요.",privacyRequired:"제출하기 전에 개인정보 확인이 필요합니다. QR 이미지는 계속 로컬에서만 해석됩니다."},
  "fr-fr":{pendingReview:"En attente d’un examen administratif via le service officiel de vérification CHSI.",expiredResubmit:"Soumettez une nouvelle vérification étudiante valide.",recognizedCode:"Code de vérification CHSI à 16 caractères reconnu. L’image reste uniquement en aperçu local et n’est jamais téléversée.",recognizedUrl:"URL officielle de vérification CHSI reconnue. L’image reste uniquement en aperçu local et n’est jamais téléversée.",currentPlan:"Offre actuelle",popular:"Populaire",free:"Gratuit",perMonth:"/ mois",studentPerMonth:"/ mois · Étudiant",guideDone:"Guide terminé ✓",privacyConfirmed:"Avis de confidentialité confirmé. Choisissez une image QR ou saisissez le code à 16 caractères / l’URL officielle pour continuer.",privacyRequired:"Vous devez confirmer l’avis de confidentialité avant l’envoi ; les images QR restent analysées localement."},
  "es-es":{pendingReview:"Esperando la revisión del administrador mediante el servicio oficial de verificación de CHSI.",expiredResubmit:"Envía una nueva verificación de estudiante válida.",recognizedCode:"Se reconoció el código de verificación de CHSI de 16 caracteres. La imagen permanece solo como vista previa local y no se sube.",recognizedUrl:"Se reconoció la URL oficial de verificación de CHSI. La imagen permanece solo como vista previa local y no se sube.",currentPlan:"Plan actual",popular:"Popular",free:"Gratis",perMonth:"/ mes",studentPerMonth:"/ mes · Estudiante",guideDone:"Guía completada ✓",privacyConfirmed:"Aviso de privacidad confirmado. Elige una imagen QR o introduce el código de 16 caracteres / URL oficial para continuar.",privacyRequired:"Debes confirmar el aviso de privacidad antes de enviar; las imágenes QR siguen procesándose localmente."},
  "el-gr":{pendingReview:"Αναμονή ελέγχου διαχειριστή μέσω της επίσημης υπηρεσίας επαλήθευσης CHSI.",expiredResubmit:"Υποβάλετε νέα έγκυρη φοιτητική επαλήθευση.",recognizedCode:"Αναγνωρίστηκε ο 16-ψήφιος κωδικός επαλήθευσης CHSI. Η εικόνα παραμένει μόνο ως τοπική προεπισκόπηση και δεν μεταφορτώνεται.",recognizedUrl:"Αναγνωρίστηκε επίσημο URL επαλήθευσης CHSI. Η εικόνα παραμένει μόνο ως τοπική προεπισκόπηση και δεν μεταφορτώνεται.",currentPlan:"Τρέχον πρόγραμμα",popular:"Δημοφιλές",free:"Δωρεάν",perMonth:"/ μήνα",studentPerMonth:"/ μήνα · Φοιτητής",guideDone:"Ο οδηγός ολοκληρώθηκε ✓",privacyConfirmed:"Επιβεβαιώθηκε η ειδοποίηση απορρήτου. Επιλέξτε εικόνα QR ή εισαγάγετε τον 16-ψήφιο κωδικό / επίσημο URL.",privacyRequired:"Πρέπει να επιβεβαιώσετε την ειδοποίηση απορρήτου πριν την υποβολή· οι εικόνες QR συνεχίζουν να αναλύονται τοπικά."},
  "ar-sa":{pendingReview:"بانتظار مراجعة المسؤول عبر خدمة التحقق الرسمية من CHSI.",expiredResubmit:"أرسل تحققًا جديدًا وصالحًا لأهلية الطالب.",recognizedCode:"تم التعرف على رمز التحقق المكوّن من 16 حرفًا من CHSI. تبقى الصورة للمعاينة المحلية فقط ولا يتم رفعها.",recognizedUrl:"تم التعرف على رابط التحقق الرسمي من CHSI. تبقى الصورة للمعاينة المحلية فقط ولا يتم رفعها.",currentPlan:"الخطة الحالية",popular:"شائع",free:"مجاني",perMonth:"/ شهر",studentPerMonth:"/ شهر · طالب",guideDone:"اكتمل الدليل ✓",privacyConfirmed:"تم تأكيد تنبيه الخصوصية. اختر صورة QR أو أدخل الرمز المكوّن من 16 حرفًا / الرابط الرسمي للمتابعة.",privacyRequired:"يجب تأكيد تنبيه الخصوصية قبل الإرسال؛ وتظل صور QR تُحلل محليًا فقط."}
};
BILLING_RUNTIME["en-gb"]=BILLING_RUNTIME["en-us"]; BILLING_RUNTIME["en-au"]=BILLING_RUNTIME["en-us"];

// Billing/学生认证设置页面：展示当前订阅、权益、用量和学生认证流程。最终套餐/资格状态必须来自后端，不由前端按钮决定。\nexport function billingSettingsContent(zh, view = "billing", locale = "") {
  const activeLocale=locale||(zh?"zh-cn":"en-us");
  let text = zh ? {
    loading:"正在读取订阅…", current:"当前套餐", drive:"AERTEX Drive", renew:"有效期",
    free:"长期有效", source:"来源", plans:"可用套餐", unavailable:"支付接口尚未开放",
    unavailableDetail:"当前阶段用于验证套餐、权益和管理员授权。支付宝与微信支付接入后会在这里启用购买。",
    error:"暂时无法读取订阅信息。", active:"有效", grace:"宽限期", manual:"管理员授权",
    system:"系统", autoRenew:"自动续费", off:"关闭", on:"开启", quota:"云盘容量",
    student:"学生资格", studentIntro:"先选择你的在读资格来源，再使用对应的官方渠道验证学生身份。分类依据是学籍或在读关系由谁出具，与国籍、户籍和当前居住地无关。",
    regionTitle:"你的在读资格由哪一地区的学校或教育机构出具？", regionHint:"请按学籍或在读关系的出具机构选择，而不是按国籍、户籍、当前居住地或实际上课地点选择。",
    regionMainlandHigher:"中国大陆高等教育 · 可通过学信网验证", regionMainlandHigherHint:"你的在读学籍可生成学信网《教育部学籍在线验证报告》",
    regionMainlandOther:"中国大陆其他学校 / 教育机构", regionMainlandOtherHint:"中学、中职或其他无法使用学信网学籍报告的在读情况",
    regionHmt:"中国香港、澳门或台湾地区院校", regionHmtHint:"在香港、澳门或台湾地区注册并就读的学校或院校",
    regionInternational:"其他国家或地区院校", regionInternationalHint:"在读关系由中国大陆及港澳台地区以外的学校或教育机构出具",
    regionOther:"不确定 / 其他情况", regionOtherHint:"例如跨境办学、联合培养、境外分校，或你不确定应该选择哪一项",
    methodTitle:"选择学生身份验证方式", methodHint:"AERTEX 只要求验证在读状态，不要求你提交国籍证明或政府身份证件。",
    changeRegion:"更改就读地区", supportedNow:"当前可用", comingSoon:"即将开放",
    methodChsi:"学信网学籍在线验证", methodChsiHint:"使用《教育部学籍在线验证报告》的官方二维码或 16 位在线验证码。",
    methodSchoolEmail:"学校官方邮箱", methodSchoolEmailHint:"通过学校分配的官方教育邮箱验证在读关系。",
    methodEnrollment:"官方在读证明", methodEnrollmentHint:"通过学校官方出具的在读状态证明进行人工审核。",
    methodUnavailable:"这个地区的学生认证方式正在完善。目前不会要求你上传身份证、护照或完整学生证件。",
    privacy:"仅选择二维码区域。不要提交完整报告，也不要提交身份证号、学号、姓名、证件照片、账号密码或其他无关个人信息。",
    localOnly:"二维码图片只在你的浏览器本地解析，不会上传到 AERTEX。服务器只接收用于人工核验的 16 位在线验证码或学信网官方验证地址。",
    consent:"我确认所选图片仅包含用于认证的二维码，不包含其他敏感个人信息。",
    chooseQr:"选择二维码图片", chooseQrHint:"可从照片图库、文件或系统相机选择", pasteLink:"粘贴 16 位在线验证码或学信网官方验证链接", submitStudent:"提交学生认证",
    previewTitle:"已选择的二维码图片", replaceQr:"重新选择", manualLink:"无法识别？手动输入验证码 / 链接", hideManualLink:"收起手动输入", localPreview:"图片只在本机预览和识别，不上传服务器",
    cancelStudent:"取消待审核申请", pending:"待审核", verified:"已认证", rejected:"未通过", expired:"已过期",
    notSubmitted:"尚未认证", unsupportedQr:"当前浏览器无法本地识别二维码，请使用系统相机扫码后粘贴官方验证链接。",
    invalidQr:"未识别到学信网二维码中的 16 位在线验证码或受支持的官方验证链接。", tooLarge:"图片过大，请选择 5 MB 以内的二维码截图。",
    imageOnly:"仅支持 PNG、JPEG 或 WebP 图片。", multipleQr:"图片中检测到多个二维码，请裁剪到只剩一个二维码。",
    submitted:"学生认证申请已提交。", canceled:"待审核申请已取消。", verifyingUntil:"有效期至",
    tutorialTitle:"认证教程", tutorialIntro:"先准备好学信网《教育部学籍在线验证报告》的二维码，再开始上传。",
    tutorialStep1:"打开学信网并登录“学信档案”。",
    tutorialStep2:"进入“在线验证报告”，申请《教育部学籍在线验证报告》。",
    tutorialStep3:"打开或下载报告，找到报告中的官方验证二维码。",
    tutorialStep4:"只截取二维码区域，不要把整份报告、姓名、身份证号、学号、照片等内容截进去。",
    tutorialStep5:"返回 AERTEX，点击下方“我已准备好二维码”，再选择二维码图片完成认证。",
    tutorialReady:"我已准备好二维码，开始认证", tutorialOfficial:"前往学信网申请报告 ↗",
    tutorialTip:"提示：新版学信二维码可能编码的是“学信网报告在线验证”提示和 16 位在线验证码，不一定是网址；AERTEX 会自动提取验证码。",
    stepSource:"在读资格来源", stepMethod:"验证方式", stepVerify:"提交验证", currentStatus:"认证状态",
    studentBenefitTitle:"学生价格", studentBenefitIntro:"认证学生资格后，可在支持的套餐中使用学生价格。容量与产品权益不变。", studentBenefitAction:"管理学生资格",
    verificationPrivacy:"只验证在读状态", verificationPrivacyDetail:"AERTEX 不以国籍划分资格，也不会要求政府身份证件。"
  } : {
    loading:"Loading subscription…", current:"Current plan", drive:"AERTEX Drive", renew:"Valid through",
    free:"No expiry", source:"Source", plans:"Available plans", unavailable:"Checkout is not available yet",
    unavailableDetail:"This phase validates plans, entitlements, and administrator grants. Alipay and WeChat Pay checkout will be enabled here later.",
    error:"Subscription information is temporarily unavailable.", active:"Active", grace:"Grace period", manual:"Admin grant",
    system:"System", autoRenew:"Auto-renew", off:"Off", on:"On", quota:"Drive quota",
    student:"Student eligibility", studentIntro:"First choose the source of your enrollment status, then verify it through the appropriate official channel. Classification follows the institution that issues your enrollment record, not nationality or residence.",
    regionTitle:"Which education system issues your current enrollment status?", regionHint:"Choose the institution that issues your enrollment record—not your nationality, residence, current location, or where classes physically take place.",
    regionMainlandHigher:"Mainland China · CHSI-verifiable higher education", regionMainlandHigherHint:"Your enrollment can produce an official CHSI Online Verification Report of Student Record",
    regionMainlandOther:"Mainland China · Other education", regionMainlandOtherHint:"Secondary, vocational, or other study situations that cannot use a CHSI student-record report",
    regionHmt:"Hong Kong, Macao, or Taiwan institutions", regionHmtHint:"Schools or institutions registered in Hong Kong, Macao, or Taiwan",
    regionInternational:"Institutions in other countries or regions", regionInternationalHint:"Your enrollment status is issued outside Mainland China, Hong Kong, Macao, and Taiwan",
    regionOther:"Not sure / another situation", regionOtherHint:"For example, cross-border programs, joint programs, overseas campuses, or cases that do not clearly fit above",
    methodTitle:"Choose a student-status verification method", methodHint:"AERTEX verifies enrollment status only. You do not need to provide nationality documents or government-issued identity documents.",
    changeRegion:"Change school location", supportedNow:"Available now", comingSoon:"Coming soon",
    methodChsi:"CHSI student-record verification", methodChsiHint:"Use the official QR code or 16-character online verification code from the Online Verification Report of Student Record.",
    methodSchoolEmail:"Official school email", methodSchoolEmailHint:"Verify enrollment through an official education email address issued by your school.",
    methodEnrollment:"Official enrollment confirmation", methodEnrollmentHint:"Use an official enrollment-status confirmation from the institution for manual review.",
    methodUnavailable:"Verification for this education system is being prepared. AERTEX will not ask you to upload a passport, government ID, or a full student credential.",
    privacy:"Select only the QR-code area. Do not submit a full report or any image containing an ID number, student number, name, portrait, account credentials, or unrelated personal information.",
    localOnly:"The QR image is decoded locally in your browser and is never uploaded to AERTEX. The server receives only a 16-character online verification code or an official CHSI verification URL for manual review.",
    consent:"I confirm the selected image contains only the verification QR code and no other sensitive personal information.",
    chooseQr:"Choose QR image", chooseQrHint:"Choose from Photos, Files, or the system camera", pasteLink:"Paste the 16-character online verification code or official CHSI verification URL", submitStudent:"Submit verification",
    previewTitle:"Selected QR image", replaceQr:"Choose another image", manualLink:"Can't decode it? Enter the code / URL manually", hideManualLink:"Hide manual entry", localPreview:"The image stays on this device for preview and recognition and is not uploaded",
    cancelStudent:"Cancel pending request", pending:"Pending review", verified:"Verified", rejected:"Rejected", expired:"Expired",
    notSubmitted:"Not verified", unsupportedQr:"This browser cannot decode QR codes locally. Scan it with the system camera and paste the official verification URL instead.",
    invalidQr:"No CHSI 16-character online verification code or supported official verification URL was found in the QR code.", tooLarge:"Image is too large. Use a QR crop under 5 MB.",
    imageOnly:"Only PNG, JPEG, or WebP images are supported.", multipleQr:"Multiple QR codes were detected. Crop the image so only one QR code remains.",
    submitted:"Student verification request submitted.", canceled:"Pending verification request canceled.", verifyingUntil:"Valid through",
    tutorialTitle:"Verification guide", tutorialIntro:"Prepare the QR code from your official CHSI Online Verification Report of Student Record before uploading anything.",
    tutorialStep1:"Open CHSI and sign in to your CHSI Archive.",
    tutorialStep2:"Open Online Verification Reports and apply for the Online Verification Report of Student Record.",
    tutorialStep3:"Open or download the report and locate its official verification QR code.",
    tutorialStep4:"Crop only the QR-code area. Do not include the full report, name, ID number, student number, portrait, or other personal information.",
    tutorialStep5:"Return to AERTEX, choose “My QR code is ready”, then select the cropped QR image to continue.",
    tutorialReady:"My QR code is ready — start verification", tutorialOfficial:"Open CHSI report application ↗",
    tutorialTip:"Tip: newer CHSI QR codes can contain a CHSI verification instruction plus a 16-character online verification code rather than a URL. AERTEX extracts that code automatically.",
    stepSource:"Enrollment source", stepMethod:"Verification method", stepVerify:"Submit verification", currentStatus:"Verification status",
    studentBenefitTitle:"Student pricing", studentBenefitIntro:"Verify student eligibility to use student pricing on supported plans. Capacity and product entitlements stay unchanged.", studentBenefitAction:"Manage student eligibility",
    verificationPrivacy:"Enrollment status only", verificationPrivacyDetail:"AERTEX does not classify eligibility by nationality and does not require government-issued identity documents."
  };
  if (BILLING_CORE[activeLocale]) text = { ...text, ...BILLING_CORE[activeLocale] };

  const studentOnly = view === "student";
  const prefix = "/" + activeLocale;
  const billingMarkup = studentOnly ? "" : `    <section id="billing-settings" class="os-card is-large settings-detail-card">
      <div class="settings-general-heading">
        <div>
          <small>AERTEX</small>
          <h2>${text.billingTitle || "Subscription & Entitlements"}</h2>
          <p>${text.billingIntro || "View your current plan, validity period, and AERTEX Drive entitlement."}</p>
        </div>
      </div>
      <div id="billing-current" class="settings-choice-grid">
        <div class="settings-choice"><strong>${text.loading}</strong><span>—</span></div>
      </div>
    </section>
    <a class="student-benefit-card" href="${prefix}/settings/student">
      <span class="student-benefit-eyebrow">AERTEX STUDENT</span>
      <div>
        <strong>${text.studentBenefitTitle}</strong>
        <p>${text.studentBenefitIntro}</p>
      </div>
      <span class="student-benefit-action">${text.studentBenefitAction} <b aria-hidden="true">↗</b></span>
    </a>
`;
  const studentMarkup = studentOnly ? `    <section id="student-verification" class="student-eligibility-page">
      <header class="student-eligibility-hero">
        <div class="student-eligibility-copy">
          <small>AERTEX STUDENT</small>
          <h2>${text.student}</h2>
          <p>${text.studentIntro}</p>
          <div class="student-privacy-chip"><strong>${text.verificationPrivacy}</strong><span>${text.verificationPrivacyDetail}</span></div>
        </div>
        <aside class="student-status-card">
          <small>${text.currentStatus}</small>
          <div id="student-state" class="settings-choice-grid">
            <div class="settings-choice"><strong>${text.notSubmitted}</strong><span>—</span></div>
          </div>
        </aside>
      </header>
      <nav class="student-progress" aria-label="${text.progress || "Student verification progress"}">
        <div class="student-progress-track" aria-hidden="true"><i id="student-progress-fill"></i></div>
        <ol>
          <li data-student-progress="1"><span>1</span><strong>${text.stepSource}</strong></li>
          <li data-student-progress="2"><span>2</span><strong>${text.stepMethod}</strong></li>
          <li data-student-progress="3"><span>3</span><strong>${text.stepVerify}</strong></li>
        </ol>
      </nav>
      <div class="student-flow-panel">
      <div id="student-pending-actions" hidden>
        <p>${text.pendingHelp || "You already have a student verification request pending. Cancel it before resubmitting."}</p>
        <button id="student-cancel" class="btn" type="button">${text.cancelStudent}</button>
      </div>
      <section id="student-region-step" class="student-path">
        <div class="student-step-head">
          <div>
            <h3>${text.regionTitle}</h3>
            <p>${text.regionHint}</p>
          </div>
        </div>
        <div class="student-region-grid" role="radiogroup" aria-label="${text.regionTitle}">
          <button class="student-region-card" type="button" data-student-region="mainland_higher" aria-pressed="false">
            <span><strong>${text.regionMainlandHigher}</strong><span>${text.regionMainlandHigherHint}</span></span><b aria-hidden="true">›</b>
          </button>
          <button class="student-region-card" type="button" data-student-region="mainland_other" aria-pressed="false">
            <span><strong>${text.regionMainlandOther}</strong><span>${text.regionMainlandOtherHint}</span></span><b aria-hidden="true">›</b>
          </button>
          <button class="student-region-card" type="button" data-student-region="hmt" aria-pressed="false">
            <span><strong>${text.regionHmt}</strong><span>${text.regionHmtHint}</span></span><b aria-hidden="true">›</b>
          </button>
          <button class="student-region-card" type="button" data-student-region="international" aria-pressed="false">
            <span><strong>${text.regionInternational}</strong><span>${text.regionInternationalHint}</span></span><b aria-hidden="true">›</b>
          </button>
          <button class="student-region-card" type="button" data-student-region="other" aria-pressed="false">
            <span><strong>${text.regionOther}</strong><span>${text.regionOtherHint}</span></span><b aria-hidden="true">›</b>
          </button>
        </div>
      </section>
      <section id="student-method-step" class="student-path" hidden>
        <div class="student-step-head">
          <div>
            <h3>${text.methodTitle}</h3>
            <p>${text.methodHint}</p>
          </div>
        </div>
        <div class="student-path-summary">
          <strong id="student-region-summary"></strong>
          <button id="student-change-region" type="button">${text.changeRegion}</button>
        </div>
        <div id="student-method-list" class="student-method-list"></div>
        <p id="student-method-note" class="student-method-note" hidden>${text.methodUnavailable}</p>
      </section>
      <div id="student-tutorial" hidden style="margin-top:18px;padding:18px;border:1px solid var(--border);border-radius:16px">
        <div>
          <strong style="font-size:15px">${text.tutorialTitle}</strong>
          <p style="margin:8px 0 0">${text.tutorialIntro}</p>
        </div>
        <ol style="margin:14px 0 0;padding-left:22px;display:grid;gap:10px;line-height:1.55">
          <li>${text.tutorialStep1}</li>
          <li>${text.tutorialStep2}</li>
          <li>${text.tutorialStep3}</li>
          <li><strong>${text.tutorialStep4}</strong></li>
          <li>${text.tutorialStep5}</li>
        </ol>
        <p style="margin:14px 0 0"><a href="https://www.chsi.com.cn/xlcx/rhsq.jsp" target="_blank" rel="noopener noreferrer">${text.tutorialOfficial}</a></p>
        <p style="margin:10px 0 0;opacity:.78">${text.tutorialTip}</p>
        <button id="student-tutorial-ready" class="btn primary" type="button" style="margin-top:16px">${text.tutorialReady}</button>
      </div>
      <div id="student-verification-form" hidden style="margin-top:18px;padding:16px;border:1px solid var(--border);border-radius:16px">
        <strong>${text.privacyTitle || "Privacy notice"}</strong>
        <p style="margin:8px 0 0">${text.privacy}</p>
        <p style="margin:8px 0 0">${text.localOnly}</p>
        <label style="display:flex;gap:10px;align-items:flex-start;margin-top:14px">
          <input id="student-consent" type="checkbox" style="margin-top:3px">
          <span>${text.consent}</span>
        </label>
        <div style="display:grid;gap:10px;margin-top:14px">
          <div id="student-file-picker" class="student-file-picker">
            <input id="student-qr-file" type="file" accept="image/png,image/jpeg,image/webp">
            <label id="student-file-button" class="student-file-button" for="student-qr-file">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4M7.5 8.5 12 4l4.5 4.5M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>
              <span>${text.chooseQr}</span>
            </label>
            <small>${text.chooseQrHint}</small>
            <div id="student-file-preview" class="student-file-preview">
              <img id="student-file-preview-image" alt="">
              <div class="student-file-preview-copy">
                <strong>${text.previewTitle}</strong>
                <span id="student-file-preview-name" class="student-file-preview-name"></span>
                <span class="student-file-preview-note">${text.localPreview}</span>
              </div>
              <button id="student-file-replace" class="student-file-replace" type="button">${text.replaceQr}</button>
            </div>
          </div>
          <button id="student-manual-toggle" class="student-manual-toggle" type="button">${text.manualLink}</button>
          <div id="student-manual-wrap" hidden>
            <input id="student-target" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="${text.pasteLink}">
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button id="student-submit" class="btn primary" type="button" disabled>${text.submitStudent}</button>
          </div>
          <p id="student-feedback" style="margin:0"></p>
        </div>
      </div>
      </div>
    </section>
` : "";
  const planMarkup = studentOnly ? "" : `    <section class="os-card settings-general-note">
      <strong>${text.plans}</strong>
      <div id="billing-plan-list" class="pricing-grid"></div>
      <p class="pricing-footnote">${text.studentPricingFootnote || "Verified students can use student pricing. Student eligibility changes price only, not plan capacity or entitlements."}</p>
      <p id="billing-status" style="margin-top:12px">${text.unavailableDetail}</p>
    </section>
`;

  return `
    <style>
      body.os-shell:has(.student-eligibility-page) .os-hero{display:none!important}
      .student-eligibility-page{display:grid;gap:18px}
      .student-eligibility-hero{
        position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1.25fr) minmax(260px,.75fr);
        gap:clamp(22px,4vw,52px);align-items:end;min-height:270px;padding:clamp(26px,3.7vw,46px);
        border:1px solid var(--border);border-radius:30px;
        background:radial-gradient(560px 340px at 100% 0%,color-mix(in srgb,var(--primary) 15%,transparent),transparent 72%),linear-gradient(145deg,var(--card),color-mix(in srgb,var(--surface-soft) 96%,var(--primary) 4%));
        box-shadow:0 22px 64px rgba(0,0,0,.075),inset 0 1px 0 color-mix(in srgb,#fff 18%,transparent)
      }
      .student-eligibility-copy>small{display:block;color:var(--primary);font-size:11px;font-weight:800;letter-spacing:.16em}
      .student-eligibility-copy h2{max-width:10ch;margin:10px 0 12px;font-size:clamp(42px,5vw,68px);line-height:.94;letter-spacing:-.062em}
      .student-eligibility-copy>p{max-width:62ch;margin:0;color:var(--muted);font-size:14px;line-height:1.65}
      .student-privacy-chip{display:flex;gap:10px;align-items:center;max-width:640px;margin-top:18px;padding:10px 12px;border-radius:14px;background:color-mix(in srgb,var(--fill) 88%,transparent);box-shadow:inset 0 0 0 1px var(--border)}
      .student-privacy-chip strong{font-size:11px;white-space:nowrap}.student-privacy-chip span{color:var(--muted);font-size:10.5px;line-height:1.4}
      .student-status-card{min-width:0;padding:18px;border:1px solid var(--border);border-radius:22px;background:color-mix(in srgb,var(--glass-heavy) 91%,transparent);box-shadow:0 14px 36px rgba(0,0,0,.07)}
      .student-status-card>small{display:block;margin-bottom:10px;color:var(--muted);font-size:10px;font-weight:760;letter-spacing:.11em;text-transform:uppercase}
      .student-status-card .settings-choice-grid{display:grid;grid-template-columns:1fr!important;gap:0!important}
      .student-status-card .settings-choice{min-height:90px;padding:16px;border:0!important;border-radius:15px;background:var(--fill)}
      .student-status-card .settings-choice strong{font-size:20px;letter-spacing:-.035em}.student-status-card .settings-choice span{margin-top:7px;font-size:11px}
      .student-progress{position:relative;padding:18px 22px;border:1px solid var(--border);border-radius:22px;background:var(--card);box-shadow:0 10px 30px rgba(0,0,0,.045)}
      .student-progress ol{position:relative;z-index:2;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:0;padding:0;list-style:none}
      .student-progress li{display:grid;justify-items:center;gap:7px;color:var(--quiet);text-align:center}
      .student-progress li:first-child{justify-items:start;text-align:left}.student-progress li:last-child{justify-items:end;text-align:right}
      .student-progress li>span{display:grid;place-items:center;width:30px;height:30px;flex:0 0 30px;border-radius:50%;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border);font-size:11px;font-weight:800}
      .student-progress li>strong{font-size:11px;line-height:1.25}
      .student-progress li.is-active{color:var(--text)}.student-progress li.is-active>span{background:var(--primary);color:var(--primary-ink);box-shadow:0 7px 18px color-mix(in srgb,var(--primary) 18%,transparent)}
      .student-progress li.is-complete{color:var(--text)}.student-progress li.is-complete>span{background:color-mix(in srgb,var(--primary) 12%,var(--fill));color:var(--primary);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 28%,var(--border))}
      .student-progress-track{position:absolute;left:37px;right:37px;top:33px;height:2px;background:var(--border);z-index:1}
      .student-progress-track i{display:block;width:0;height:100%;background:var(--primary);transition:width .28s ease}
      .student-flow-panel{padding:clamp(18px,2.6vw,28px);border:1px solid var(--border);border-radius:26px;background:var(--card);box-shadow:0 14px 42px rgba(0,0,0,.055)}
      .student-benefit-card{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:end;margin-top:16px;padding:22px;border:1px solid color-mix(in srgb,var(--primary) 24%,var(--border));border-radius:22px;background:radial-gradient(380px 220px at 100% 0%,color-mix(in srgb,var(--primary) 13%,transparent),transparent 74%),var(--card);color:var(--text);text-decoration:none;box-shadow:0 12px 34px rgba(0,0,0,.05);transition:transform .24s ease,border-color .2s ease}
      .student-benefit-eyebrow{grid-column:1/-1;color:var(--primary);font-size:10px;font-weight:800;letter-spacing:.13em}.student-benefit-card strong{font-size:22px;letter-spacing:-.04em}.student-benefit-card p{max-width:58ch;margin:6px 0 0;color:var(--muted);font-size:12px;line-height:1.5}.student-benefit-action{align-self:end;color:var(--primary);font-size:12px;font-weight:760;white-space:nowrap}
      @media(hover:hover) and (pointer:fine){.student-benefit-card:hover{transform:translateY(-2px);border-color:color-mix(in srgb,var(--primary) 44%,var(--border))}}
      @media(max-width:760px){.student-eligibility-hero{grid-template-columns:1fr;min-height:0;padding:22px 18px;border-radius:22px}.student-eligibility-copy h2{font-size:clamp(40px,13vw,56px)}.student-privacy-chip{align-items:flex-start;flex-direction:column}.student-progress{padding:16px 13px}.student-progress-track{left:27px;right:27px;top:31px}.student-progress li{gap:6px}.student-progress li>strong{font-size:9.5px}.student-flow-panel{padding:16px 13px;border-radius:20px}.student-benefit-card{grid-template-columns:1fr}.student-benefit-action{justify-self:start}}
      #student-verification [hidden]{display:none!important}
      #student-consent{width:22px!important;height:22px!important;min-width:22px!important;min-height:22px!important;flex:0 0 22px;margin:2px 0 0!important;padding:0!important}
      #student-pending-actions{margin-top:14px;padding:14px 16px;border:1px solid var(--border);border-radius:14px;background:var(--surface-soft)}
      #student-pending-actions p{margin:0 0 12px}
      .student-path{display:grid;gap:14px;margin-top:18px}
      .student-step-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
      .student-step-head h3{margin:0;font-size:18px;letter-spacing:-.03em}
      .student-step-head p{margin:6px 0 0;color:var(--muted);font-size:13px;line-height:1.55}
      .student-region-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      .student-region-card,.student-method-card{
        appearance:none;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:start;
        min-height:116px;margin:0;padding:17px;text-align:left;border:1px solid var(--border);border-radius:18px;
        background:var(--surface-soft);color:var(--text);box-shadow:none;cursor:pointer;
        transition:transform .2s ease,border-color .18s ease,background .18s ease,box-shadow .2s ease
      }
      .student-region-card strong,.student-method-card strong{display:block;font-size:15px;line-height:1.3;letter-spacing:-.02em}
      .student-region-card span,.student-method-card span{display:block;margin-top:7px;color:var(--muted);font-size:12px;line-height:1.48}
      .student-region-card b,.student-method-card b{color:var(--quiet);font-size:18px;font-weight:500}
      .student-region-card.is-selected{border-color:color-mix(in srgb,var(--primary) 50%,var(--border));background:color-mix(in srgb,var(--primary) 8%,var(--surface-soft));box-shadow:0 10px 24px color-mix(in srgb,var(--primary) 8%,transparent)}
      .student-path-summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 14px;border-radius:15px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border)}
      .student-path-summary strong{font-size:13px}.student-path-summary button{width:auto!important;min-width:0!important;min-height:36px!important;margin:0!important;padding:0 11px!important;border-radius:10px!important;background:var(--card)!important;color:var(--text)!important;font-size:11px!important;box-shadow:inset 0 0 0 1px var(--border)!important}
      .student-method-list{display:grid;gap:10px}
      .student-method-card{min-height:96px;background:var(--card)}
      .student-method-card.is-supported{border-color:color-mix(in srgb,var(--primary) 28%,var(--border))}
      .student-method-card[disabled]{cursor:not-allowed;opacity:.64}
      .student-method-badge{display:inline-flex!important;align-items:center;min-height:24px;margin:0!important;padding:0 8px;border-radius:999px;background:var(--fill);color:var(--muted)!important;font-size:10px!important;font-weight:760!important;white-space:nowrap}
      .student-method-card.is-supported .student-method-badge{background:color-mix(in srgb,var(--primary) 11%,var(--fill));color:var(--primary)!important}
      .student-method-note{margin:0;padding:13px 14px;border-radius:14px;background:var(--fill);color:var(--muted);font-size:12px;line-height:1.55}
      @media(hover:hover) and (pointer:fine){.student-region-card:hover,.student-method-card:not([disabled]):hover{transform:translateY(-2px);border-color:var(--border-strong);box-shadow:0 10px 24px rgba(0,0,0,.055)}}
      .student-file-picker{display:grid;place-items:center;gap:7px;min-height:116px;padding:18px;border:1px solid var(--border);border-radius:18px;background:var(--surface-soft);text-align:center}
      .student-file-picker input[type="file"]{position:absolute!important;width:1px!important;height:1px!important;min-width:1px!important;min-height:1px!important;margin:0!important;padding:0!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;clip-path:inset(50%)!important}
      .student-file-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:0 18px;border-radius:13px;background:var(--primary);color:var(--primary-ink);font-weight:800;cursor:pointer;user-select:none}
      .student-file-button:active{transform:scale(.98)}
      .student-file-button svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
      .student-file-picker small{display:block;color:var(--muted);font-size:12px;line-height:1.45}
      .student-file-preview{display:none;gap:12px;align-items:center;width:100%;padding:12px;border-radius:14px;background:var(--card);box-shadow:inset 0 0 0 1px var(--border);text-align:left}
      .student-file-preview.is-visible{display:grid;grid-template-columns:76px minmax(0,1fr) auto}
      .student-file-preview img{display:block;width:76px;height:76px;object-fit:contain;border-radius:10px;background:#fff}
      .student-file-preview-copy{min-width:0}.student-file-preview-copy strong{display:block}.student-file-preview-name{display:block;margin-top:4px;color:var(--muted);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.student-file-preview-note{display:block;margin-top:4px;color:var(--muted);font-size:12px;line-height:1.45;white-space:normal;overflow:visible;text-overflow:clip;word-break:break-word}
      .student-file-replace{width:auto!important;min-width:0!important;min-height:38px!important;margin:0!important;padding:0 12px!important;border-radius:10px!important;background:var(--fill)!important;color:var(--text)!important;font-size:12px!important}
      .student-manual-toggle{width:auto!important;justify-self:start;min-height:40px!important;margin:2px 0 0!important;padding:0 12px!important;background:transparent!important;color:var(--primary)!important}
      #student-manual-wrap[hidden]{display:none!important}
      #student-target{font-size:16px!important;scroll-margin-top:120px}
      .student-file-picker.is-disabled{opacity:.48}
      .student-file-picker.is-disabled .student-file-button{cursor:not-allowed;pointer-events:none}
      .pricing-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin-top:14px}
      .pricing-card{position:relative;min-width:0;padding:18px;border:1px solid var(--border);border-radius:20px;background:var(--card);box-shadow:0 1px 2px rgba(0,0,0,.025);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}
      .pricing-card:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,0,0,.055)}
      .pricing-card.is-selected{border-color:var(--primary);box-shadow:0 0 0 1px var(--primary)}
      .pricing-card.is-featured{background:linear-gradient(180deg,var(--card),var(--surface-soft))}
      .pricing-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
      .pricing-name{font-size:18px;line-height:1.2;font-weight:800;letter-spacing:-.02em}
      .pricing-badge{display:inline-flex;align-items:center;min-height:24px;padding:0 9px;border-radius:999px;background:var(--fill);color:var(--text);font-size:11px;font-weight:750;white-space:nowrap}
      .pricing-capacity{margin-top:18px;font-size:30px;line-height:1;font-weight:850;letter-spacing:-.045em}
      .pricing-price-row{display:flex;align-items:baseline;gap:5px;margin-top:14px}
      .pricing-price{font-size:24px;line-height:1;font-weight:820;letter-spacing:-.035em}
      .pricing-period{color:var(--muted);font-size:12px}
      .pricing-student{display:inline-flex;align-items:baseline;gap:4px;margin-top:10px;padding:7px 10px;border-radius:999px;background:var(--surface-soft);font-size:13px;font-weight:760}
      .pricing-student strong{font-size:15px}
      .pricing-desc{margin:14px 0 0;color:var(--muted);font-size:13px;line-height:1.5}
      .pricing-footnote{margin:12px 0 0;color:var(--muted);font-size:12px;line-height:1.5}
      @media (max-width:620px){
        .student-region-grid{grid-template-columns:1fr}
        .student-region-card{min-height:104px;padding:15px}
        .student-path-summary{align-items:flex-start;flex-direction:column}
        .student-file-picker{min-height:104px;padding:16px 14px}
        .student-file-button{width:min(100%,320px)}
        .student-file-preview.is-visible{grid-template-columns:64px minmax(0,1fr)}
        .student-file-preview img{width:64px;height:64px}
        .student-file-replace{grid-column:1/-1;width:100%!important}
        #student-target{font-size:16px!important}
      }
      @media (max-width:1050px) and (hover:none) and (pointer:coarse){
        body.os-shell:has(#student-verification){height:auto!important;min-height:100dvh!important;overflow-y:auto!important;overscroll-behavior-y:none!important}
        body.os-shell:has(#student-verification) .os-layout{height:auto!important;min-height:calc(100dvh - 20px)!important}
        body.os-shell:has(#student-verification) .os-main{height:auto!important;min-height:calc(100dvh - 20px)!important;overflow:visible!important;overscroll-behavior-y:none!important}
      }
    </style>
    ${billingMarkup}
    ${studentMarkup}
    ${planMarkup}
    <script>
      (() => {
        const copy=${JSON.stringify(text)};
        const runtime=${JSON.stringify(BILLING_RUNTIME[activeLocale] || BILLING_RUNTIME["en-us"])};
        const locale=${JSON.stringify(activeLocale)};
        const isZh=${JSON.stringify(activeLocale === "zh-cn" || activeLocale === "zh-tw")};
        const isStudentView=${studentOnly ? "true" : "false"};
        const current=document.getElementById("billing-current");
        const planList=document.getElementById("billing-plan-list");
        const status=document.getElementById("billing-status");
        const studentState=document.getElementById("student-state");
        const studentPendingActions=document.getElementById("student-pending-actions");
        const studentRegionStep=document.getElementById("student-region-step");
        const studentMethodStep=document.getElementById("student-method-step");
        const studentRegionButtons=[...document.querySelectorAll("[data-student-region]")];
        const studentRegionSummary=document.getElementById("student-region-summary");
        const studentChangeRegion=document.getElementById("student-change-region");
        const studentMethodList=document.getElementById("student-method-list");
        const studentMethodNote=document.getElementById("student-method-note");
        const studentTutorial=document.getElementById("student-tutorial");
        const studentTutorialReady=document.getElementById("student-tutorial-ready");
        const studentVerificationForm=document.getElementById("student-verification-form");
        const studentConsent=document.getElementById("student-consent");
        const studentQrFile=document.getElementById("student-qr-file");
        const studentFilePicker=document.getElementById("student-file-picker");
        const studentFileButton=document.getElementById("student-file-button");
        const studentFilePreview=document.getElementById("student-file-preview");
        const studentFilePreviewImage=document.getElementById("student-file-preview-image");
        const studentFilePreviewName=document.getElementById("student-file-preview-name");
        const studentFileReplace=document.getElementById("student-file-replace");
        const studentManualToggle=document.getElementById("student-manual-toggle");
        const studentManualWrap=document.getElementById("student-manual-wrap");
        const studentTarget=document.getElementById("student-target");
        const studentSubmit=document.getElementById("student-submit");
        const studentCancel=document.getElementById("student-cancel");
        const studentFeedback=document.getElementById("student-feedback");
        const studentProgressItems=[...document.querySelectorAll("[data-student-progress]")];
        const studentProgressFill=document.getElementById("student-progress-fill");
        const bytes=value=>{let n=Number(value)||0;const units=["B","KB","MB","GB","TB"];let i=0;while(n>=1024&&i<units.length-1){n/=1024;i++}return n.toLocaleString(locale,{maximumFractionDigits:i?1:0})+" "+units[i]};
        const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
        const date=value=>{if(!value)return copy.free;const d=new Date(value);return Number.isNaN(d.getTime())?copy.free:d.toLocaleString(locale)};
        const source=value=>value==="admin_grant"?copy.manual:value==="system"?copy.system:String(value||copy.system);
        const pricingCatalog=[
          {id:"aertex_free",name:"Free",capacity:"10GB",price:"免费",student:"免费",descZh:"基础使用",descEn:"Core storage"},
          {id:"aertex_mini",name:"Mini",capacity:"20GB",price:"¥3.9",student:"¥2.9",descZh:"轻量扩容",descEn:"Light storage expansion"},
          {id:"aertex_plus",name:"Plus",capacity:"60GB",price:"¥9.9",student:"¥7.9",descZh:"日常文件",descEn:"Everyday files"},
          {id:"aertex_pro",name:"Pro",capacity:"200GB",price:"¥34.9",student:"¥25.9",descZh:"照片、文档、学习资料",descEn:"Photos, documents, and study files",featured:true},
          {id:"aertex_max",name:"Max",capacity:"1TB",price:"¥159",student:"¥119",descZh:"主力个人云盘",descEn:"Primary personal cloud storage"},
          {id:"aertex_ultra",name:"Ultra",capacity:"2TB",price:"¥309",student:"¥229",descZh:"重度存储",descEn:"Heavy storage"},
          {id:"aertex_studio",name:"Studio",capacity:"6TB",price:"¥899",student:"¥699",descZh:"创作者 / 大型项目",descEn:"Creators and large projects"},
          {id:"aertex_vault",name:"Vault",capacity:"12TB",price:"¥1,799",student:"¥1,399",descZh:"超大容量长期存储",descEn:"Very large long-term storage"}
        ];
        let studentTutorialAcknowledged=false;
        let studentLocked=false;
        let studentServerStatus="not_submitted";
        const studentRegionKey="aertex-student-school-region-v1";
        const validStudentRegions=new Set(["mainland_higher","mainland_other","hmt","international","other"]);
        let studentRegion="";
        let studentMethod="";
        let studentPreviewUrl="";
        const studentRegionLabel=value=>({
          mainland_higher:copy.regionMainlandHigher,
          mainland_other:copy.regionMainlandOther,
          hmt:copy.regionHmt,
          international:copy.regionInternational,
          other:copy.regionOther
        }[String(value)]||"");
        function loadStudentRegionPreference(){
          try{
            const saved=localStorage.getItem(studentRegionKey)||"";
            if(validStudentRegions.has(saved))studentRegion=saved;
          }catch{}
        }
        function saveStudentRegionPreference(){
          try{
            if(studentRegion)localStorage.setItem(studentRegionKey,studentRegion);
            else localStorage.removeItem(studentRegionKey);
          }catch{}
        }
        function renderStudentMethodOptions(){
          if(!studentMethodList)return;
          if(studentRegion==="mainland_higher"){
            studentMethodList.innerHTML=
              '<button class="student-method-card is-supported" type="button" data-student-method="chsi">'+
                '<span><strong>'+esc(copy.methodChsi)+'</strong><span>'+esc(copy.methodChsiHint)+'</span></span>'+
                '<span class="student-method-badge">'+esc(copy.supportedNow)+'</span>'+
              '</button>';
            studentMethodNote.hidden=true;
          }else{
            studentMethodList.innerHTML=
              '<button class="student-method-card" type="button" disabled>'+
                '<span><strong>'+esc(copy.methodSchoolEmail)+'</strong><span>'+esc(copy.methodSchoolEmailHint)+'</span></span>'+
                '<span class="student-method-badge">'+esc(copy.comingSoon)+'</span>'+
              '</button>'+
              '<button class="student-method-card" type="button" disabled>'+
                '<span><strong>'+esc(copy.methodEnrollment)+'</strong><span>'+esc(copy.methodEnrollmentHint)+'</span></span>'+
                '<span class="student-method-badge">'+esc(copy.comingSoon)+'</span>'+
              '</button>';
            studentMethodNote.hidden=false;
          }
          studentMethodList.querySelectorAll("[data-student-method]").forEach(button=>button.addEventListener("click",()=>{
            if(studentLocked)return;
            studentMethod=button.dataset.studentMethod||"";
            studentTutorialAcknowledged=false;
            studentVerificationForm.hidden=true;
            studentVerificationForm.style.display="none";
            studentTutorial.hidden=studentMethod!=="chsi";
            studentTutorial.style.display=studentMethod==="chsi"?"":"none";
            if(studentMethod==="chsi")studentTutorial.scrollIntoView({behavior:"smooth",block:"nearest"});
            syncStudentControls();
          }));
        }
        function paintStudentProgress(){
          if(!isStudentView)return;
          const hasRegion=validStudentRegions.has(studentRegion);
          const hasMethod=Boolean(studentMethod)||studentLocked;
          let stage=studentLocked?3:!hasRegion?1:!hasMethod?2:3;
          const verified=studentServerStatus==="verified";
          studentProgressItems.forEach(item=>{
            const index=Number(item.dataset.studentProgress||0);
            item.classList.toggle("is-complete",verified||index<stage);
            const active=!verified&&index===stage;
            item.classList.toggle("is-active",active);
            if(active)item.setAttribute("aria-current","step");else item.removeAttribute("aria-current");
          });
          if(studentProgressFill)studentProgressFill.style.width=verified||stage===3?"100%":stage===2?"50%":"0%";
        }
        function paintStudentPath(){
          paintStudentProgress();
          if(studentLocked){
            studentRegionStep.hidden=true;
            studentMethodStep.hidden=true;
            studentTutorial.hidden=true;
            studentTutorial.style.display="none";
            studentVerificationForm.hidden=true;
            studentVerificationForm.style.display="none";
            return;
          }
          const hasRegion=validStudentRegions.has(studentRegion);
          studentRegionStep.hidden=hasRegion;
          studentMethodStep.hidden=!hasRegion;
          studentRegionButtons.forEach(button=>{
            const selected=button.dataset.studentRegion===studentRegion;
            button.classList.toggle("is-selected",selected);
            button.setAttribute("aria-pressed",selected?"true":"false");
          });
          if(!hasRegion){
            studentMethod="";
            studentTutorial.hidden=true;
            studentTutorial.style.display="none";
            studentVerificationForm.hidden=true;
            studentVerificationForm.style.display="none";
            return;
          }
          studentRegionSummary.textContent=studentRegionLabel(studentRegion);
          if(studentRegion!=="mainland_higher")studentMethod="";
          renderStudentMethodOptions();
          const showTutorial=studentMethod==="chsi"&&studentRegion==="mainland_higher";
          studentTutorial.hidden=!showTutorial;
          studentTutorial.style.display=showTutorial?"":"none";
          if(!showTutorial){
            studentTutorialAcknowledged=false;
            if(studentTutorialReady)studentTutorialReady.textContent=copy.tutorialReady;
            studentVerificationForm.hidden=true;
            studentVerificationForm.style.display="none";
          }
        }
        const normalizeStudentCode=value=>{
          const code=String(value||"").trim().toUpperCase();
          return /^[A-Z0-9]{16}$/.test(code)?code:"";
        };
        const allowedStudentTarget=value=>{
          try{
            const url=new URL(String(value||"").trim());
            const host=url.hostname.toLowerCase();
            return url.protocol==="https:"&&!url.username&&!url.password&&!url.port&&(host==="chsi.com.cn"||host==="www.chsi.com.cn")&&/^\\/xlcx\\//i.test(url.pathname)?url.toString():"";
          }catch{return ""}
        };
        const studentEvidence=value=>{
          const raw=String(value||"").trim();
          const directCode=normalizeStudentCode(raw);
          if(directCode)return {kind:"code",code:directCode};
          const url=allowedStudentTarget(raw);
          if(url)return {kind:"url",url};
          const codeMatch=raw.match(/#([A-Z0-9]{16})#/i);
          if(codeMatch&&/学信网报告在线验证/.test(raw)&&/扫码验证/.test(raw)){
            const code=normalizeStudentCode(codeMatch[1]);
            if(code)return {kind:"code",code};
          }
          return null;
        };
        const studentTransportTarget=evidence=>{
          if(!evidence)return "";
          if(evidence.kind==="url")return evidence.url;
          return "https://www.chsi.com.cn/xlcx/bgcx.jsp?__aertex_online_code="+encodeURIComponent(evidence.code);
        };
        const studentStatusLabel=value=>({pending:copy.pending,verified:copy.verified,rejected:copy.rejected,expired:copy.expired,not_submitted:copy.notSubmitted}[String(value)]||copy.notSubmitted);
        function renderStudent(data){
          const state=data&&typeof data==="object"?data:{status:"not_submitted",eligible:false};
          studentServerStatus=String(state.status||"not_submitted");
          let detail="—";
          if(state.status==="verified"&&state.report_expires_at)detail=copy.verifyingUntil+" "+date(state.report_expires_at);
          else if(state.status==="pending")detail=runtime.pendingReview;
          else if(state.status==="rejected"&&state.review_note)detail=String(state.review_note);
          else if(state.status==="expired")detail=runtime.expiredResubmit;
          studentState.innerHTML='<div class="settings-choice '+(state.eligible?'is-selected':'')+'"><strong>'+esc(studentStatusLabel(state.status))+'</strong><span>'+esc(detail)+'</span></div>';
          const pending=state.status==="pending";
          studentPendingActions.hidden=!pending;
          studentLocked=pending||state.eligible;
          paintStudentProgress();
          studentTutorialReady.disabled=studentLocked;
          paintStudentPath();
          if(!studentLocked&&studentMethod==="chsi"&&studentTutorialAcknowledged){
            studentVerificationForm.hidden=false;
            studentVerificationForm.style.display="";
          }
          syncStudentControls();
        }
        function syncStudentControls(){
          const canUseForm=studentRegion==="mainland_higher"&&studentMethod==="chsi"&&studentTutorialAcknowledged&&!studentLocked&&!studentVerificationForm.hidden&&studentVerificationForm.style.display!=="none";
          studentConsent.disabled=!canUseForm;
          studentQrFile.disabled=!canUseForm;
          studentFilePicker.classList.toggle("is-disabled",!canUseForm);
          studentFileButton.setAttribute("aria-disabled",String(!canUseForm));
          studentTarget.disabled=!canUseForm;
          studentManualToggle.disabled=!canUseForm;
          studentFileReplace.disabled=!canUseForm;
          studentSubmit.disabled=!canUseForm||!studentConsent.checked||!studentEvidence(studentTarget.value);
        }
        // 学生认证状态加载：读取后端认证记录并渲染当前阶段，避免仅根据本地上传/扫码动作假设“已认证”。\nasync function loadStudent(){
          try{
            const response=await fetch("/api/student-verification",{credentials:"same-origin",cache:"no-store",headers:{Accept:"application/json"}});
            if(!response.ok)throw new Error("HTTP "+response.status);
            renderStudent(await response.json());
          }catch(error){
            console.error("Student verification state failed",error);
            studentFeedback.textContent=copy.error;
          }
        }
        function clearStudentPreview(){
          if(studentPreviewUrl){try{URL.revokeObjectURL(studentPreviewUrl)}catch{}}
          studentPreviewUrl="";
          studentFilePreview.classList.remove("is-visible");
          studentFilePreviewImage.removeAttribute("src");
          studentFilePreviewName.textContent="";
        }
        function showStudentPreview(file){
          clearStudentPreview();
          studentPreviewUrl=URL.createObjectURL(file);
          studentFilePreviewImage.src=studentPreviewUrl;
          studentFilePreviewName.textContent=file.name||copy.chooseQr;
          studentFilePreview.classList.add("is-visible");
        }
        async function decodeWithJsQr(bitmap){
          const canvas=document.createElement("canvas");
          canvas.width=bitmap.width;canvas.height=bitmap.height;
          const ctx=canvas.getContext("2d",{willReadFrequently:true});
          if(!ctx)return "";
          ctx.drawImage(bitmap,0,0);
          const imageData=ctx.getImageData(0,0,canvas.width,canvas.height);
          const mod=await import("https://cdn.jsdelivr.net/npm/jsqr@1.4.0/+esm");
          const jsQR=mod.default||mod;
          return String(jsQR(imageData.data,imageData.width,imageData.height,{inversionAttempts:"attemptBoth"})?.data||"");
        }
        // 本地 QR 解码：仅用于从用户选择的图片提取官方验证目标，图片无需先上传服务器；解析结果仍会经过后端目标白名单校验。\nasync function decodeQrLocally(file){
          studentFeedback.textContent="";
          if(!file)return;
          if(file.size>5*1024*1024){clearStudentPreview();studentFeedback.textContent=copy.tooLarge;return}
          if(!["image/png","image/jpeg","image/webp"].includes(file.type)){clearStudentPreview();studentFeedback.textContent=copy.imageOnly;return}
          showStudentPreview(file);
          let bitmap;
          try{
            bitmap=await createImageBitmap(file);
            let raw="";
            if(typeof BarcodeDetector==="function"){
              try{
                const detector=new BarcodeDetector({formats:["qr_code"]});
                const codes=await detector.detect(bitmap);
                if(codes.length>1){studentFeedback.textContent=copy.multipleQr;return}
                raw=String(codes[0]?.rawValue||"");
              }catch(error){console.warn("BarcodeDetector QR decode failed",error)}
            }
            if(!raw)raw=await decodeWithJsQr(bitmap);
            const evidence=studentEvidence(raw);
            if(!evidence){
              studentFeedback.textContent=copy.invalidQr;
              studentManualWrap.hidden=false;
              studentManualToggle.textContent=copy.hideManualLink;
              return;
            }
            studentTarget.value=evidence.kind==="code"?evidence.code:evidence.url;
            studentManualWrap.hidden=true;
            studentManualToggle.textContent=copy.manualLink;
            studentFeedback.textContent=evidence.kind==="code"
              ?runtime.recognizedCode
              :runtime.recognizedUrl;
          }catch(error){
            console.error("Local QR decode failed",error);
            studentFeedback.textContent=copy.invalidQr;
            studentManualWrap.hidden=false;
            studentManualToggle.textContent=copy.hideManualLink;
          }finally{
            try{bitmap?.close?.()}catch{}
            syncStudentControls();
          }
        }
        // Billing 主加载：读取账户 billing state/entitlements 后更新套餐、额度和学生优惠区域；失败时使用明确不可用状态而不是伪造免费/付费结果。\nasync function load(){
          try{
            const response=await fetch("/api/billing/state",{credentials:"same-origin",cache:"no-store",headers:{Accept:"application/json"}});
            if(!response.ok)throw new Error("HTTP "+response.status);
            const data=await response.json();
            const plan=data.plan||{};
            const subscription=data.subscription||null;
            const quota=Number(data.entitlements?.drive_storage_bytes)||0;
            current.innerHTML=
              '<div class="settings-choice is-selected"><strong>'+esc(plan.display_name_${activeLocale.startsWith("zh-") ? "zh" : "en"}||plan.display_name_en||plan.id||"AERTEX Free")+'</strong><span>'+esc(subscription?.status==="grace"?copy.grace:copy.active)+'</span></div>'+
              '<div class="settings-choice"><strong>'+esc(copy.quota)+'</strong><span>'+esc(bytes(quota))+'</span></div>'+
              '<div class="settings-choice"><strong>'+esc(copy.renew)+'</strong><span>'+esc(date(subscription?.current_period_end))+'</span></div>'+
              '<div class="settings-choice"><strong>'+esc(copy.autoRenew)+'</strong><span>'+esc(subscription?.auto_renew?copy.on:copy.off)+' · '+esc(source(subscription?.source))+'</span></div>';
            planList.innerHTML=pricingCatalog.map(item=>{
              const selected=item.id===plan.id;
              const description=isZh?item.descZh:item.descEn;
              const badge=selected?runtime.currentPlan:item.featured?runtime.popular:"";
              const ordinary=item.price==="免费"?runtime.free:item.price;
              const student=item.student==="免费"?runtime.free:item.student;
              return '<article class="pricing-card '+(selected?'is-selected ':'')+(item.featured?'is-featured':'')+'">'+
                '<div class="pricing-head"><strong class="pricing-name">'+esc(item.name)+'</strong>'+(badge?'<span class="pricing-badge">'+esc(badge)+'</span>':'')+'</div>'+
                '<div class="pricing-capacity">'+esc(item.capacity)+'</div>'+
                '<div class="pricing-price-row"><span class="pricing-price">'+esc(ordinary)+'</span>'+(ordinary===runtime.free?'':'<span class="pricing-period">'+runtime.perMonth+'</span>')+'</div>'+
                '<div class="pricing-student"><strong>'+esc(student)+'</strong>'+(student===runtime.free?'':'<span>'+runtime.studentPerMonth+'</span>')+'</div>'+
                '<p class="pricing-desc">'+esc(description)+'</p>'+
              '</article>';
            }).join("");
            status.textContent=copy.unavailable+" · "+copy.unavailableDetail;
          }catch(error){
            console.error("Billing state failed",error);
            current.innerHTML='<div class="settings-choice"><strong>'+esc(copy.error)+'</strong><span>—</span></div>';
            if(status)status.textContent=copy.error;
          }
        }
        studentRegionButtons.forEach(button=>button.addEventListener("click",()=>{
          if(studentLocked)return;
          const next=button.dataset.studentRegion||"";
          if(!validStudentRegions.has(next))return;
          studentRegion=next;
          studentMethod="";
          studentTutorialAcknowledged=false;
          if(studentTutorialReady)studentTutorialReady.textContent=copy.tutorialReady;
          saveStudentRegionPreference();
          clearStudentPreview();
          studentQrFile.value="";
          studentTarget.value="";
          studentConsent.checked=false;
          paintStudentPath();
          studentMethodStep.scrollIntoView({behavior:"smooth",block:"nearest"});
          syncStudentControls();
        }));
        studentChangeRegion?.addEventListener("click",()=>{
          if(studentLocked)return;
          studentRegion="";
          studentMethod="";
          studentTutorialAcknowledged=false;
          if(studentTutorialReady)studentTutorialReady.textContent=copy.tutorialReady;
          saveStudentRegionPreference();
          clearStudentPreview();
          studentQrFile.value="";
          studentTarget.value="";
          studentConsent.checked=false;
          paintStudentPath();
          studentRegionStep.scrollIntoView({behavior:"smooth",block:"nearest"});
          syncStudentControls();
        });
        studentTutorialReady?.addEventListener("click",()=>{
          if(studentLocked||studentRegion!=="mainland_higher"||studentMethod!=="chsi")return;
          studentTutorialAcknowledged=true;
          studentVerificationForm.hidden=false;
          studentVerificationForm.style.display="";
          studentTutorialReady.textContent=runtime.guideDone;
          studentVerificationForm.scrollIntoView({behavior:"smooth",block:"nearest"});
          syncStudentControls();
        });
        studentConsent?.addEventListener("change",()=>{
          if(studentConsent.checked){
            studentFeedback.textContent=runtime.privacyConfirmed;
          }else{
            studentFeedback.textContent=runtime.privacyRequired;
          }
          syncStudentControls();
        });
        studentQrFile?.addEventListener("change",event=>void decodeQrLocally(event.target.files?.[0]));
        studentFileReplace?.addEventListener("click",()=>studentQrFile.click());
        studentManualToggle?.addEventListener("click",()=>{
          const willShow=studentManualWrap.hidden;
          studentManualWrap.hidden=!willShow;
          studentManualToggle.textContent=willShow?copy.hideManualLink:copy.manualLink;
          if(willShow){
            requestAnimationFrame(()=>{
              studentTarget.focus({preventScroll:true});
              studentTarget.scrollIntoView({block:"center",behavior:"smooth"});
            });
          }
        });
        studentTarget?.addEventListener("input",()=>syncStudentControls());
        studentSubmit?.addEventListener("click",async()=>{
          const evidence=studentEvidence(studentTarget.value);
          const target=studentTransportTarget(evidence);
          if(!studentConsent.checked||!target){studentFeedback.textContent=copy.invalidQr;return}
          studentSubmit.disabled=true;
          try{
            const response=await fetch("/api/student-verification",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json",Accept:"application/json"},body:JSON.stringify({target_url:target})});
            const payload=await response.json().catch(()=>({}));
            if(!response.ok)throw new Error(payload.error||("HTTP "+response.status));
            studentTarget.value="";
            clearStudentPreview();
            studentQrFile.value="";
            studentFeedback.textContent=copy.submitted;
            renderStudent(payload);
          }catch(error){studentFeedback.textContent=String(error?.message||copy.error)}
        });
        studentCancel?.addEventListener("click",async()=>{
          studentCancel.disabled=true;
          try{
            const response=await fetch("/api/student-verification",{method:"DELETE",credentials:"same-origin",headers:{Accept:"application/json"}});
            const payload=await response.json().catch(()=>({}));
            if(!response.ok)throw new Error(payload.error||("HTTP "+response.status));
            studentFeedback.textContent=copy.canceled;
            renderStudent(payload);
          }catch(error){studentFeedback.textContent=String(error?.message||copy.error)}
          finally{studentCancel.disabled=false}
        });
        if(isStudentView){
          loadStudentRegionPreference();
          paintStudentPath();
          void loadStudent();
        }else{
          void load();
        }
      })();
    </script>
  `;
}
