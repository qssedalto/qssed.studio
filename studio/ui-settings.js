/**
 * 【初学者导读】
 * 文件：studio/ui-settings.js
 * 这是 AERTEX 前端 UI 模块（settings）：负责页面结构、状态、事件和 API 数据的展示。
 * 阅读顺序：先通过可见文字定位 render/模板，再追 state、事件监听和 fetch/API，最后去后端找同一路径。
 * 初学者重点：把“结构、样式、交互、数据”分开理解；一个页面 bug 往往只属于其中一层。
 * 修改注意：已有 class/id/data-* 可能被其他模块和自动测试依赖；不要因为当前页面能显示就随意删除。动态用户内容继续保持转义。
 * 响应式：涉及布局的修改至少检查宽屏、普通笔记本、平板和手机，避免只在一个尺寸上看起来正确。
 */
import { osHubGrid, osHubIcon } from "./ui-primitives.js";
import { dashboardIcon } from "./ui-dashboard.js";
import { IPHONE_THEME_DEFAULT, IPHONE_THEME_PALETTE } from "./iphone-theme-palette.js";

const SETTINGS_COMMON = {
  "en-us": {
    general:"General", common:"Common Settings", commonLead:"Appearance, language, and account security.", more:"More Settings", moreLead:"More controls will appear as their services become available.",
    appearance:["Theme & Appearance","System, light, dark, and accent"], language:["Language","11 display languages"], security:["Account & Security","Devices and sign-ins"],
    securitySections:["Current Device","Signed-in Devices","Sign-in History","Security Alerts"],
    notifications:["Notifications","Notification methods, reminders, and in-app message preferences will be managed here. Notification delivery is not connected yet."],
    integrations:["Integrations","Manage connected third-party services and account authorizations here. User-level integrations are not available yet."]
  },
  "zh-cn": {
    general:"通用", common:"常用设置", commonLead:"外观、语言和账户安全。", more:"更多设置", moreLead:"对应服务接入后会显示在这里。",
    appearance:["主题与外观","系统、浅色、深色与强调色"], language:["语言","11 种显示语言"], security:["账户与安全","设备和登录记录"],
    securitySections:["当前设备","登录设备","登录历史","安全提醒"],
    notifications:["通知","通知方式、提醒和站内消息偏好将在这里统一管理。当前尚未接入通知服务。"],
    integrations:["第三方集成","这里将用于管理可连接的第三方服务与账号授权。当前尚未开放用户级集成配置。"]
  },
  "zh-tw": {
    general:"一般", common:"常用設定", commonLead:"外觀、語言與帳號安全性。", more:"更多設定", moreLead:"相關服務接入後會顯示在這裡。",
    appearance:["主題與外觀","系統、淺色、深色與強調色"], language:["語言","11 種顯示語言"], security:["帳號與安全性","裝置與登入記錄"],
    securitySections:["目前裝置","已登入裝置","登入記錄","安全性提醒"],
    notifications:["通知","通知方式、提醒與站內訊息偏好將集中在這裡管理。目前尚未接入通知服務。"],
    integrations:["第三方整合","在這裡管理可連接的第三方服務與帳號授權。目前尚未提供使用者層級的整合設定。"]
  },
  "ja-jp": {
    general:"一般", common:"よく使う設定", commonLead:"外観、言語、アカウントセキュリティ。", more:"その他の設定", moreLead:"対応するサービスが利用可能になると、ここに追加されます。",
    appearance:["テーマと外観","システム、ライト、ダーク、アクセント"], language:["言語","11 の表示言語"], security:["アカウントとセキュリティ","デバイスとサインイン履歴"],
    securitySections:["現在のデバイス","サインイン中のデバイス","サインイン履歴","セキュリティ通知"],
    notifications:["通知","通知方法、リマインダー、アプリ内メッセージの設定をここで管理します。通知配信はまだ接続されていません。"],
    integrations:["連携","接続する外部サービスとアカウント認証を管理します。ユーザー向け連携設定はまだ利用できません。"]
  },
  "ko-kr": {
    general:"일반", common:"주요 설정", commonLead:"모양, 언어 및 계정 보안.", more:"추가 설정", moreLead:"관련 서비스가 연결되면 여기에 표시됩니다.",
    appearance:["테마 및 모양","시스템, 라이트, 다크 및 강조 색상"], language:["언어","11개 표시 언어"], security:["계정 및 보안","기기 및 로그인 기록"],
    securitySections:["현재 기기","로그인된 기기","로그인 기록","보안 알림"],
    notifications:["알림","알림 방식, 미리 알림 및 앱 내 메시지 환경설정을 여기에서 관리합니다. 알림 전송 서비스는 아직 연결되지 않았습니다."],
    integrations:["연동","연결 가능한 외부 서비스와 계정 권한을 관리합니다. 사용자 수준 연동 설정은 아직 사용할 수 없습니다."]
  },
  "fr-fr": {
    general:"Général", common:"Réglages courants", commonLead:"Apparence, langue et sécurité du compte.", more:"Autres réglages", moreLead:"D’autres contrôles apparaîtront à mesure que les services seront disponibles.",
    appearance:["Thème et apparence","Système, clair, sombre et accent"], language:["Langue","11 langues d’affichage"], security:["Compte et sécurité","Appareils et connexions"],
    securitySections:["Appareil actuel","Appareils connectés","Historique des connexions","Alertes de sécurité"],
    notifications:["Notifications","Les modes de notification, rappels et messages intégrés seront gérés ici. Le service de notification n’est pas encore connecté."],
    integrations:["Intégrations","Gérez ici les services tiers connectés et les autorisations de compte. Les intégrations utilisateur ne sont pas encore disponibles."]
  },
  "es-es": {
    general:"General", common:"Ajustes habituales", commonLead:"Apariencia, idioma y seguridad de la cuenta.", more:"Más ajustes", moreLead:"Aparecerán más controles a medida que estén disponibles sus servicios.",
    appearance:["Tema y apariencia","Sistema, claro, oscuro y acento"], language:["Idioma","11 idiomas de visualización"], security:["Cuenta y seguridad","Dispositivos e inicios de sesión"],
    securitySections:["Dispositivo actual","Dispositivos con sesión iniciada","Historial de inicio de sesión","Alertas de seguridad"],
    notifications:["Notificaciones","Aquí se gestionarán los métodos de notificación, recordatorios y mensajes internos. El servicio de notificaciones aún no está conectado."],
    integrations:["Integraciones","Gestiona servicios externos conectados y autorizaciones de cuenta. Las integraciones a nivel de usuario aún no están disponibles."]
  },
  "el-gr": {
    general:"Γενικά", common:"Συχνές ρυθμίσεις", commonLead:"Εμφάνιση, γλώσσα και ασφάλεια λογαριασμού.", more:"Περισσότερες ρυθμίσεις", moreLead:"Περισσότερα στοιχεία ελέγχου θα εμφανιστούν καθώς γίνονται διαθέσιμες οι αντίστοιχες υπηρεσίες.",
    appearance:["Θέμα και εμφάνιση","Σύστημα, φωτεινό, σκοτεινό και έμφαση"], language:["Γλώσσα","11 γλώσσες εμφάνισης"], security:["Λογαριασμός και ασφάλεια","Συσκευές και συνδέσεις"],
    securitySections:["Τρέχουσα συσκευή","Συνδεδεμένες συσκευές","Ιστορικό σύνδεσης","Ειδοποιήσεις ασφαλείας"],
    notifications:["Ειδοποιήσεις","Οι μέθοδοι ειδοποιήσεων, οι υπενθυμίσεις και τα μηνύματα εφαρμογής θα διαχειρίζονται εδώ. Η αποστολή ειδοποιήσεων δεν έχει ακόμη συνδεθεί."],
    integrations:["Ενσωματώσεις","Διαχειριστείτε συνδεδεμένες εξωτερικές υπηρεσίες και εξουσιοδοτήσεις λογαριασμού. Οι ενσωματώσεις χρήστη δεν είναι ακόμη διαθέσιμες."]
  },
  "ar-sa": {
    general:"عام", common:"الإعدادات الشائعة", commonLead:"المظهر واللغة وأمان الحساب.", more:"إعدادات إضافية", moreLead:"ستظهر عناصر تحكم إضافية عند توفر الخدمات المرتبطة بها.",
    appearance:["السمة والمظهر","النظام والفاتح والداكن ولون التمييز"], language:["اللغة","11 لغة عرض"], security:["الحساب والأمان","الأجهزة وعمليات تسجيل الدخول"],
    securitySections:["الجهاز الحالي","الأجهزة المسجّل دخولها","سجل تسجيل الدخول","تنبيهات الأمان"],
    notifications:["الإشعارات","ستتم إدارة طرق الإشعارات والتذكيرات والرسائل داخل التطبيق هنا. خدمة إرسال الإشعارات غير متصلة بعد."],
    integrations:["عمليات التكامل","أدِر الخدمات الخارجية المتصلة وتفويضات الحساب هنا. إعدادات التكامل على مستوى المستخدم غير متاحة بعد."]
  }
};
SETTINGS_COMMON["en-gb"]=SETTINGS_COMMON["en-us"]; SETTINGS_COMMON["en-au"]=SETTINGS_COMMON["en-us"];

const APPEARANCE_COPY = {
  "zh-tw":{title:"主題與外觀",intro:"把 AERTEX 調整成你喜歡的樣子。模式與強調色會即時預覽，並儲存在目前瀏覽器。",modeTitle:"外觀模式",modeHint:"選擇跟隨裝置，或固定使用淺色 / 深色。",system:"系統",systemHint:"預設 · 跟隨裝置外觀",light:"淺色",lightHint:"永遠使用淺色",dark:"深色",darkHint:"永遠使用深色",accentTitle:"強調色",accentHint:"用於互動焦點、選取狀態與品牌點綴，不會將整個介面染色。",preview:"即時預覽",previewSubtitle:"個人工作空間",previewCard:"今日工作",previewMeta:"3 個專案進行中",previewButton:"開啟工作台",current:"目前強調色",saved:"已儲存在目前瀏覽器"},
  "ja-jp":{title:"テーマと外観",intro:"AERTEX の見た目を好みに合わせて調整できます。モードとアクセントカラーはすぐにプレビューされ、このブラウザに保存されます。",modeTitle:"外観モード",modeHint:"デバイスに合わせるか、ライト / ダークを固定します。",system:"システム",systemHint:"デフォルト · デバイスの外観に従う",light:"ライト",lightHint:"常にライトを使用",dark:"ダーク",darkHint:"常にダークを使用",accentTitle:"アクセントカラー",accentHint:"フォーカス、選択状態、控えめなブランドアクセントに使用します。",preview:"ライブプレビュー",previewSubtitle:"パーソナルワークスペース",previewCard:"今日の作業",previewMeta:"3 件のプロジェクトが進行中",previewButton:"ワークベンチを開く",current:"現在のアクセント",saved:"このブラウザに保存済み"},
  "ko-kr":{title:"테마 및 모양",intro:"AERTEX를 원하는 모습으로 조정하세요. 모드와 강조 색상은 즉시 미리보기되며 현재 브라우저에 저장됩니다.",modeTitle:"모양 모드",modeHint:"기기를 따르거나 라이트 / 다크 모드를 고정하세요.",system:"시스템",systemHint:"기본값 · 기기 모양 따르기",light:"라이트",lightHint:"항상 라이트 사용",dark:"다크",darkHint:"항상 다크 사용",accentTitle:"강조 색상",accentHint:"상호작용 포커스, 선택 상태 및 절제된 브랜드 강조에 사용됩니다.",preview:"실시간 미리보기",previewSubtitle:"개인 작업 공간",previewCard:"오늘의 작업",previewMeta:"3개 프로젝트 진행 중",previewButton:"워크벤치 열기",current:"현재 강조 색상",saved:"현재 브라우저에 저장됨"},
  "fr-fr":{title:"Thème et apparence",intro:"Adaptez AERTEX à vos préférences. Les changements de mode et de couleur d’accent sont prévisualisés immédiatement et enregistrés dans ce navigateur.",modeTitle:"Mode d’apparence",modeHint:"Suivez l’appareil ou choisissez un mode clair / sombre fixe.",system:"Système",systemHint:"Par défaut · suit l’apparence de l’appareil",light:"Clair",lightHint:"Toujours utiliser le mode clair",dark:"Sombre",darkHint:"Toujours utiliser le mode sombre",accentTitle:"Couleur d’accent",accentHint:"Utilisée pour le focus, les états sélectionnés et des touches de marque discrètes.",preview:"Aperçu en direct",previewSubtitle:"Espace personnel",previewCard:"Travail du jour",previewMeta:"3 projets en cours",previewButton:"Ouvrir l’atelier",current:"Accent actuel",saved:"Enregistré dans ce navigateur"},
  "es-es":{title:"Tema y apariencia",intro:"Haz que AERTEX tenga el aspecto que prefieras. Los cambios de modo y color de acento se previsualizan al instante y se guardan en este navegador.",modeTitle:"Modo de apariencia",modeHint:"Sigue el dispositivo o fija el modo claro / oscuro.",system:"Sistema",systemHint:"Predeterminado · seguir apariencia del dispositivo",light:"Claro",lightHint:"Usar siempre claro",dark:"Oscuro",darkHint:"Usar siempre oscuro",accentTitle:"Color de acento",accentHint:"Se usa para el foco, estados seleccionados y detalles de marca discretos.",preview:"Vista previa en vivo",previewSubtitle:"Espacio personal",previewCard:"Trabajo de hoy",previewMeta:"3 proyectos en curso",previewButton:"Abrir mesa de trabajo",current:"Acento actual",saved:"Guardado en este navegador"},
  "el-gr":{title:"Θέμα και εμφάνιση",intro:"Προσαρμόστε το AERTEX στις προτιμήσεις σας. Οι αλλαγές λειτουργίας και χρώματος έμφασης προβάλλονται άμεσα και αποθηκεύονται σε αυτό το πρόγραμμα περιήγησης.",modeTitle:"Λειτουργία εμφάνισης",modeHint:"Ακολουθήστε τη συσκευή ή επιλέξτε σταθερό φωτεινό / σκοτεινό.",system:"Σύστημα",systemHint:"Προεπιλογή · ακολουθεί την εμφάνιση της συσκευής",light:"Φωτεινό",lightHint:"Πάντα φωτεινό",dark:"Σκοτεινό",darkHint:"Πάντα σκοτεινό",accentTitle:"Χρώμα έμφασης",accentHint:"Χρησιμοποιείται για εστίαση, επιλεγμένες καταστάσεις και διακριτικές πινελιές επωνυμίας.",preview:"Ζωντανή προεπισκόπηση",previewSubtitle:"Προσωπικός χώρος",previewCard:"Σημερινή εργασία",previewMeta:"3 έργα σε εξέλιξη",previewButton:"Άνοιγμα πάγκου εργασίας",current:"Τρέχουσα έμφαση",saved:"Αποθηκεύτηκε σε αυτό το πρόγραμμα περιήγησης"},
  "ar-sa":{title:"السمة والمظهر",intro:"اضبط AERTEX بالشكل الذي تفضله. تتم معاينة تغييرات الوضع ولون التمييز فورًا وتُحفظ في هذا المتصفح.",modeTitle:"وضع المظهر",modeHint:"اتبع إعداد الجهاز أو ثبّت المظهر الفاتح / الداكن.",system:"النظام",systemHint:"الافتراضي · اتبع مظهر الجهاز",light:"فاتح",lightHint:"استخدم الفاتح دائمًا",dark:"داكن",darkHint:"استخدم الداكن دائمًا",accentTitle:"لون التمييز",accentHint:"يُستخدم للتركيز وحالات التحديد ولمسات العلامة التجارية المحدودة.",preview:"معاينة مباشرة",previewSubtitle:"مساحة العمل الشخصية",previewCard:"عمل اليوم",previewMeta:"3 مشروعات قيد التنفيذ",previewButton:"فتح منضدة العمل",current:"لون التمييز الحالي",saved:"تم الحفظ في هذا المتصفح"}
};

export function settingsGeneralContent(zh, locale = "") {
  const activeLocale=locale||(zh?"zh-cn":"en-us");
  const prefix="/"+activeLocale;
  const lc=SETTINGS_COMMON[activeLocale]||SETTINGS_COMMON["en-us"];
  const rows = [
    [lc.appearance[0],lc.appearance[1],`${prefix}/settings/appearance`,"appearance"],
    [lc.language[0],lc.language[1],`${prefix}/settings/language`,"language"],
    [lc.security[0],lc.security[1],`${prefix}/settings/security`,"shield"]
  ];
  return `
    <section class="os-card settings-general-card">
      <div class="settings-general-heading">
        ${osHubIcon("general")}
        <div>
          <small>${lc.general}</small>
          <h2>${lc.common}</h2>
          <p>${lc.commonLead}</p>
        </div>
      </div>
      <div class="settings-general-list">
        ${rows.map(row => `<a href="${row[2]}">${osHubIcon(row[3])}<span><strong>${row[0]}</strong><small>${row[1]}</small></span><b aria-hidden="true">›</b></a>`).join("")}
      </div>
    </section>
    <section class="os-card settings-general-note">
      <strong>${lc.more}</strong>
      <p>${lc.moreLead}</p>
    </section>
  `;
}

export function settingsStatusContent(locale = "", kind = "notifications") {
  const lc=SETTINGS_COMMON[locale]||SETTINGS_COMMON["en-us"];
  const value=kind==="integrations"?lc.integrations:lc.notifications;
  return '<section class="os-card is-large status-card"><h2>'+value[0]+'</h2><p>'+value[1]+'</p></section>';
}

export function securityAuditContent(zh, locale = "") {
  const lc=SETTINGS_COMMON[locale]||SETTINGS_COMMON[zh?"zh-cn":"en-us"];
  const sec=lc.securitySections;
  return `
    <section class="os-card audit-section">
      <h2>${sec[0]}</h2>
      <div id="audit-current-device" class="audit-current">...</div>
    </section>
    <section class="os-card audit-section">
      <h2>${sec[1]}</h2>
      <div id="audit-device-list" class="audit-devices"></div>
    </section>
    <section class="os-card audit-section">
      <h2>${sec[2]}</h2>
      <div id="audit-login-timeline" class="audit-timeline"></div>
    </section>
    <section class="os-card audit-section">
      <h2>${sec[3]}</h2>
      <div id="audit-risk-alerts" class="audit-alerts"></div>
    </section>
  `;
}

// 外观设置页面：只调用全站 AERTEXTheme 运行时修改主题和主色；其他产品页面应读取这些共享偏好，而不是再放一套独立设置。\nexport function appearanceSettingsContent(zh, locale = "") {
  let copy = zh ? {
    eyebrow:"THEME STUDIO",
    title:"主题与外观",
    intro:"把 AERTEX 调成你喜欢的样子。模式与强调色会即时预览并保存在当前浏览器。",
    modeTitle:"外观模式",
    modeHint:"选择跟随设备，或固定使用浅色 / 深色。",
    system:"系统",
    systemHint:"默认 · 跟随设备外观",
    light:"浅色",
    lightHint:"始终使用浅色",
    dark:"深色",
    darkHint:"始终使用深色",
    accentTitle:"强调色",
    accentHint:"只用于交互焦点、选中状态和品牌点缀，不会把整个界面染色。",
    preview:"实时预览",
    previewTitle:"AERTEX",
    previewSubtitle:"Personal Workspace",
    previewCard:"今日工作",
    previewMeta:"3 个项目正在进行",
    previewButton:"打开工作台",
    current:"当前强调色",
    saved:"已保存到当前浏览器"
  } : {
    eyebrow:"THEME STUDIO",
    title:"Theme & Appearance",
    intro:"Make AERTEX feel like yours. Mode and accent changes preview instantly and are saved in this browser.",
    modeTitle:"Appearance mode",
    modeHint:"Follow your device, or keep a fixed light / dark appearance.",
    system:"System",
    systemHint:"Default · Follow device appearance",
    light:"Light",
    lightHint:"Always use light",
    dark:"Dark",
    darkHint:"Always use dark",
    accentTitle:"Accent color",
    accentHint:"Used for interaction focus, selected states, and restrained brand accents—not as an all-over tint.",
    preview:"Live preview",
    previewTitle:"AERTEX",
    previewSubtitle:"Personal Workspace",
    previewCard:"Today's work",
    previewMeta:"3 projects in progress",
    previewButton:"Open Workbench",
    current:"Current accent",
    saved:"Saved in this browser"
  };
  const activeLocale = locale || (zh ? "zh-cn" : "en-us");
  if (APPEARANCE_COPY[activeLocale]) copy = { ...copy, ...APPEARANCE_COPY[activeLocale] };
  const colors = IPHONE_THEME_PALETTE;
  const colorMeta = Object.fromEntries(colors.map(color => [color.id, {
    name: color.names[activeLocale] || color.names["en-us"]
  }]));
  const accentButtons = colors.map(color => {
    const name=color.names[activeLocale]||color.names["en-us"];
    return '<button class="theme-accent" type="button" data-accent="'+color.id+'" style="--swatch:'+color.hex+';--swatch-ink:'+color.ink+'" aria-label="'+name+'">'+
      '<span class="theme-accent-dot"><b aria-hidden="true">✓</b></span>'+
      '<span class="theme-accent-copy"><strong>'+name+'</strong></span></button>';
  }).join("");
  return `
    <style>
      body.os-shell:has(.theme-studio){
        background:
          radial-gradient(900px 560px at 98% 2%,color-mix(in srgb,var(--primary) 13%,transparent),transparent 68%),
          radial-gradient(760px 520px at 4% 104%,color-mix(in srgb,var(--primary) 7%,transparent),transparent 72%),
          var(--bg)!important;
      }
      body.os-shell:has(.theme-studio) .os-hero{display:none!important}
      body.os-shell:has(.theme-studio) .os-hero h1{font-size:clamp(42px,5vw,66px)!important}
      .theme-studio{display:grid;gap:18px}
      .theme-studio-intro{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:22px;align-items:end;min-height:190px;padding:clamp(24px,3.2vw,38px);border:1px solid var(--border);border-radius:28px;background:linear-gradient(145deg,color-mix(in srgb,var(--card) 98%,#fff 2%),color-mix(in srgb,var(--surface) 93%,var(--primary) 4%));box-shadow:0 18px 50px rgba(0,0,0,.07),inset 0 1px 0 color-mix(in srgb,#fff 20%,transparent)}
      .theme-studio-intro:after{content:"";position:absolute;width:420px;aspect-ratio:1;border-radius:50%;right:-190px;top:-250px;background:radial-gradient(circle,color-mix(in srgb,var(--primary) 20%,transparent),transparent 65%);pointer-events:none}
      .theme-studio-intro small{display:block;margin-bottom:10px;color:var(--primary);font-size:11px;font-weight:780;letter-spacing:.15em}
      .theme-studio-intro h2{margin:0;font-size:clamp(34px,4vw,52px)!important;line-height:.98;letter-spacing:-.055em!important}
      .theme-studio-intro p{max-width:650px;margin:12px 0 0;font-size:15px;line-height:1.65}
      .theme-studio-current{position:relative;z-index:1;display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:999px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border);white-space:nowrap}
      .theme-studio-current i{width:14px;height:14px;border-radius:50%;background:var(--primary);box-shadow:0 0 0 4px color-mix(in srgb,var(--primary) 12%,transparent)}
      .theme-studio-current span{font-size:12px;color:var(--muted)}.theme-studio-current strong{font-size:12px}
      .theme-studio-layout{display:grid;grid-template-columns:minmax(0,1.32fr) minmax(285px,.68fr);gap:16px;align-items:start}
      .theme-control-stack{display:grid;gap:18px}
      .theme-panel{padding:clamp(20px,2.4vw,28px);border:1px solid var(--border);border-radius:24px;background:var(--card);box-shadow:0 10px 30px rgba(0,0,0,.045)}
      .theme-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}
      .theme-panel-head h3{margin:0;font-size:21px;letter-spacing:-.035em}.theme-panel-head p{max-width:600px;margin:5px 0 0;font-size:12.5px;line-height:1.55}
      .theme-mode-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
      .theme-mode{appearance:none;display:grid;gap:12px;min-height:150px;padding:14px;margin:0;text-align:left;border:1px solid var(--border);border-radius:18px;background:var(--surface-soft);color:var(--text);box-shadow:none;cursor:pointer;transition:transform .24s cubic-bezier(.16,1,.3,1),border-color .2s ease,background .2s ease,box-shadow .24s ease}
      .theme-mode-visual{position:relative;display:block;height:74px;border-radius:13px;overflow:hidden;border:1px solid var(--border);background:#f1f2f4}
      .theme-mode-visual:before{content:"";position:absolute;inset:10px 42% 10px 9px;border-radius:9px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.06)}
      .theme-mode-visual:after{content:"";position:absolute;right:10px;top:11px;width:28%;height:10px;border-radius:5px;background:#d7d8dc;box-shadow:0 18px 0 #e1e2e5,0 36px 0 #e1e2e5}
      .theme-mode[data-mode="dark"] .theme-mode-visual{background:#111316}.theme-mode[data-mode="dark"] .theme-mode-visual:before{background:#202327;box-shadow:0 0 0 1px rgba(255,255,255,.08)}.theme-mode[data-mode="dark"] .theme-mode-visual:after{background:#5a5d64;box-shadow:0 18px 0 #34373b,0 36px 0 #34373b}
      .theme-mode[data-mode="system"] .theme-mode-visual{border-color:#45484d;background:linear-gradient(90deg,#f1f2f4 0 49.5%,#111316 50.5% 100%);box-shadow:none}.theme-mode[data-mode="system"] .theme-mode-visual:before{left:9px;right:auto;top:10px;bottom:10px;width:calc(50% - 15px);border-radius:9px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.06)}.theme-mode[data-mode="system"] .theme-mode-visual:after{right:10px;background:#5a5d64;box-shadow:0 18px 0 #34373b,0 36px 0 #34373b}
      .theme-mode-copy{display:grid;gap:3px}.theme-mode-copy strong{font-size:14px}.theme-mode-copy span{color:var(--muted);font-size:11px;line-height:1.4}
      .theme-mode.is-selected{border-color:color-mix(in srgb,var(--primary) 52%,var(--border));background:color-mix(in srgb,var(--primary) 8%,var(--surface-soft));box-shadow:0 10px 24px color-mix(in srgb,var(--primary) 10%,transparent)}
      .theme-mode.is-selected .theme-mode-copy strong{color:var(--primary)}
      .theme-accent-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;max-height:min(72vh,760px);padding:2px;overflow:auto;overscroll-behavior:contain;scrollbar-gutter:stable}
      .theme-accent{appearance:none;position:relative;display:grid;grid-template-columns:44px minmax(0,1fr);align-items:center;gap:12px;min-height:78px;padding:12px 13px;margin:0;text-align:left;border:1px solid transparent;border-radius:18px;background:var(--surface-soft);color:var(--text);box-shadow:inset 0 0 0 1px var(--border);cursor:pointer;transition:transform .2s cubic-bezier(.16,1,.3,1),box-shadow .2s ease,background .2s ease}
      .theme-accent-dot{display:grid;place-items:center;width:44px;height:44px;border-radius:14px;background:var(--swatch);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--swatch-ink) 20%,transparent),0 5px 14px color-mix(in srgb,var(--swatch) 20%,transparent)}
      .theme-accent-dot b{color:var(--swatch-ink);font-size:15px;line-height:1;opacity:0}
      .theme-accent-copy{min-width:0;display:grid;align-content:center}.theme-accent-copy strong{white-space:normal;overflow-wrap:anywhere;font-size:12.5px;line-height:1.32}
      .theme-accent.is-selected{background:color-mix(in srgb,var(--primary) 8%,var(--surface-soft));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 48%,transparent),0 8px 22px color-mix(in srgb,var(--primary) 8%,transparent)}
      .theme-accent.is-selected .theme-accent-dot b{opacity:1}.theme-accent.is-selected .theme-accent-copy strong{color:var(--text);font-weight:750}
      .theme-preview-wrap{position:sticky;top:26px;width:100%;max-width:400px;justify-self:end}
      .theme-preview-label{display:flex;align-items:center;justify-content:space-between;margin:0 2px 10px;color:var(--muted);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
      .theme-preview{position:relative;overflow:hidden;min-height:410px;padding:12px;border:1px solid var(--border);border-radius:24px;background:radial-gradient(360px 240px at 90% -5%,color-mix(in srgb,var(--primary) 16%,transparent),transparent 72%),var(--bg-soft);box-shadow:0 18px 46px rgba(0,0,0,.09)}
      .theme-preview-window{display:grid;grid-template-columns:72px minmax(0,1fr);gap:8px;height:382px;padding:8px;border:1px solid var(--border);border-radius:18px;background:var(--surface);box-shadow:0 12px 28px rgba(0,0,0,.07)}
      .theme-preview-side{display:flex;flex-direction:column;gap:7px;padding:7px;border-radius:12px;background:var(--fill)}
      .theme-preview-brand{width:24px;height:24px;border-radius:8px;background:linear-gradient(145deg,color-mix(in srgb,var(--primary) 70%,#fff 30%),var(--primary));box-shadow:0 6px 13px color-mix(in srgb,var(--primary) 18%,transparent)}
      .theme-preview-nav{height:6px;border-radius:999px;background:var(--border-strong)}.theme-preview-nav.is-active{width:84%;background:var(--primary)}.theme-preview-nav:nth-child(3){width:70%}.theme-preview-nav:nth-child(4){width:76%}
      .theme-preview-main{min-width:0;padding:11px 8px}
      .theme-preview-kicker{display:block;width:46px;height:6px;border-radius:999px;background:var(--primary);opacity:.75}
      .theme-preview-main h4{margin:10px 0 4px;font-size:23px;line-height:1;letter-spacing:-.05em}.theme-preview-main>p{font-size:9.5px}
      .theme-preview-card{margin-top:17px;padding:14px;border:1px solid var(--border);border-radius:15px;background:var(--card);box-shadow:0 8px 20px rgba(0,0,0,.045)}
      .theme-preview-card small{font-size:8.5px;color:var(--muted)}.theme-preview-card strong{display:block;margin-top:5px;font-size:15px;letter-spacing:-.035em}.theme-preview-card p{margin-top:5px;font-size:9px}
      .theme-preview-stats{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:12px}.theme-preview-stat{height:52px;border-radius:11px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border)}.theme-preview-stat:first-child{background:color-mix(in srgb,var(--primary) 11%,var(--fill))}
      .theme-preview-action{display:inline-flex;align-items:center;justify-content:center;min-height:31px;margin-top:12px;padding:0 10px;border-radius:9px;background:var(--primary);color:var(--primary-ink);font-size:9px;font-weight:750}
      .theme-feedback{min-height:18px;margin-top:10px;color:var(--muted);font-size:11px}
      @media(hover:hover) and (pointer:fine){.theme-mode:hover,.theme-accent:hover{transform:translateY(-2px)}.theme-accent:hover{box-shadow:inset 0 0 0 1px var(--border),0 10px 22px rgba(0,0,0,.06)}}
      @media(max-width:1100px){.theme-studio-layout{grid-template-columns:1fr}.theme-preview-wrap{position:static;max-width:none;justify-self:stretch}.theme-preview{min-height:390px}.theme-preview-window{height:360px}}
      @media(max-width:680px){.theme-studio-intro{grid-template-columns:1fr;min-height:0;padding:22px 18px;border-radius:22px}.theme-studio-current{justify-self:start}.theme-panel{padding:18px 14px;border-radius:20px}.theme-mode-grid{grid-template-columns:1fr}.theme-mode{grid-template-columns:110px minmax(0,1fr);align-items:center;min-height:104px}.theme-mode-visual{height:74px}.theme-accent-grid{grid-template-columns:repeat(2,minmax(0,1fr));max-height:none}.theme-preview{display:none}}
      @media(prefers-reduced-motion:reduce){.theme-mode,.theme-accent{transition:none!important;transform:none!important}}
    </style>
    <section class="theme-studio" data-theme-studio>
      <header class="theme-studio-intro">
        <div><small>${copy.eyebrow}</small><h2>${copy.title}</h2><p>${copy.intro}</p></div>
        <div class="theme-studio-current"><i></i><span>${copy.current}</span><strong id="theme-current-accent">${colorMeta[IPHONE_THEME_DEFAULT].name}</strong></div>
      </header>
      <div class="theme-studio-layout">
        <div class="theme-control-stack">
          <section class="theme-panel">
            <div class="theme-panel-head"><div><h3>${copy.modeTitle}</h3><p>${copy.modeHint}</p></div></div>
            <div class="theme-mode-grid">
              <button class="theme-mode" type="button" data-mode="system"><span class="theme-mode-visual"></span><span class="theme-mode-copy"><strong>${copy.system}</strong><span>${copy.systemHint}</span></span></button>
              <button class="theme-mode" type="button" data-mode="light"><span class="theme-mode-visual"></span><span class="theme-mode-copy"><strong>${copy.light}</strong><span>${copy.lightHint}</span></span></button>
              <button class="theme-mode" type="button" data-mode="dark"><span class="theme-mode-visual"></span><span class="theme-mode-copy"><strong>${copy.dark}</strong><span>${copy.darkHint}</span></span></button>
            </div>
          </section>
          <section class="theme-panel">
            <div class="theme-panel-head"><div><h3>${copy.accentTitle}</h3><p>${copy.accentHint}</p></div></div>
            <div class="theme-accent-grid">${accentButtons}</div>
            <div id="theme-feedback" class="theme-feedback" aria-live="polite"></div>
          </section>
        </div>
        <aside class="theme-preview-wrap" aria-label="${copy.preview}">
          <div class="theme-preview-label"><span>${copy.preview}</span></div>
          <div class="theme-preview"><div class="theme-preview-window">
            <div class="theme-preview-side"><span class="theme-preview-brand"></span><span class="theme-preview-nav is-active"></span><span class="theme-preview-nav"></span><span class="theme-preview-nav"></span></div>
            <div class="theme-preview-main"><span class="theme-preview-kicker"></span><h4>${copy.previewTitle}</h4><p>${copy.previewSubtitle}</p><div class="theme-preview-card"><small>${copy.previewCard}</small><strong>${copy.previewMeta}</strong><div class="theme-preview-stats"><span class="theme-preview-stat"></span><span class="theme-preview-stat"></span></div><span class="theme-preview-action">${copy.previewButton}</span></div></div>
          </div></div>
        </aside>
      </div>
    </section>
    <script>
      (() => {
        const api=window.AERTEXTheme;if(!api)return;
        const modes=[...document.querySelectorAll("[data-mode]")];
        const accents=[...document.querySelectorAll("[data-accent]")];
        const current=document.getElementById("theme-current-accent");
        const feedback=document.getElementById("theme-feedback");
        const colorMeta=${JSON.stringify(Object.fromEntries(IPHONE_THEME_PALETTE.map(color => [color.id, { name: color.names[activeLocale] || color.names["en-us"] }])))};
        let feedbackTimer=0;
        const announce=()=>{if(!feedback)return;feedback.textContent=${JSON.stringify(copy.saved)};window.clearTimeout(feedbackTimer);feedbackTimer=window.setTimeout(()=>{feedback.textContent=""},1600)};
        const refresh=()=>{const mode=api.getMode();const accent=api.getAccent();modes.forEach(button=>{const selected=button.dataset.mode===mode;button.classList.toggle("is-selected",selected);button.setAttribute("aria-pressed",selected?"true":"false")});accents.forEach(button=>{const selected=button.dataset.accent===accent;button.classList.toggle("is-selected",selected);button.setAttribute("aria-pressed",selected?"true":"false")});if(current){const meta=colorMeta[accent]||colorMeta[${JSON.stringify(IPHONE_THEME_DEFAULT)}];current.textContent=meta.name}};
        modes.forEach(button=>button.addEventListener("click",()=>{document.documentElement.classList.add("theme-switching");api.setMode(button.dataset.mode);window.setTimeout(()=>document.documentElement.classList.remove("theme-switching"),260);refresh();announce()}));
        accents.forEach(button=>button.addEventListener("click",()=>{document.documentElement.classList.add("theme-switching");api.setAccent(button.dataset.accent);window.setTimeout(()=>document.documentElement.classList.remove("theme-switching"),260);refresh();announce()}));
        window.addEventListener("aertex-themechange",refresh);refresh();
      })();
    </script>
  `;
}

// 语言设置页面：修改站点首选 locale，并尽量跳转到同一功能的对应语言路径；显式 URL locale 仍然具有最高优先级。\nexport function languageSettingsContent(zh, activeLocale = "en-us") {
  const localeCopy = {
    "zh-cn":["显示语言","AERTEX 默认跟随当前设备语言。你可以临时切换界面语言；重新从网站入口打开或下次登录时，会再次跟随设备语言。"],
    "zh-tw":["顯示語言","AERTEX 預設跟隨目前裝置語言。你可以暫時切換介面語言；重新從網站入口開啟或下次登入時，會再次跟隨裝置語言。"],
    "ja-jp":["表示言語","AERTEX はデフォルトで現在のデバイス言語に従います。表示言語は一時的に切り替えられ、次回サイトを開くかサインインすると再びデバイス言語に従います。"],
    "ko-kr":["표시 언어","AERTEX는 기본적으로 현재 기기 언어를 따릅니다. 현재 방문 중에는 언어를 변경할 수 있으며, 다음에 사이트를 열거나 로그인하면 다시 기기 언어를 따릅니다."],
    "fr-fr":["Langue d’affichage","AERTEX suit par défaut la langue de l’appareil. Vous pouvez changer temporairement la langue ; lors de la prochaine ouverture ou connexion, la langue de l’appareil sera de nouveau utilisée."],
    "es-es":["Idioma de visualización","AERTEX sigue de forma predeterminada el idioma del dispositivo. Puedes cambiarlo temporalmente; al volver a abrir el sitio o iniciar sesión, se usará de nuevo el idioma del dispositivo."],
    "el-gr":["Γλώσσα εμφάνισης","Το AERTEX ακολουθεί από προεπιλογή τη γλώσσα της συσκευής. Μπορείτε να την αλλάξετε προσωρινά· στην επόμενη επίσκεψη ή σύνδεση θα χρησιμοποιηθεί ξανά η γλώσσα της συσκευής."],
    "ar-sa":["لغة العرض","يتبع AERTEX لغة جهازك افتراضيًا. يمكنك تغيير اللغة مؤقتًا أثناء الزيارة الحالية، وعند فتح الموقع أو تسجيل الدخول لاحقًا سيعود إلى لغة الجهاز."],
    "en-us":["Language","AERTEX follows the current device language by default. You can switch languages for the current visit; opening the site again or signing in next time follows the device language again."],
    "en-gb":["Language","AERTEX follows the current device language by default. You can switch languages for the current visit; opening the site again or signing in next time follows the device language again."],
    "en-au":["Language","AERTEX follows the current device language by default. You can switch languages for the current visit; opening the site again or signing in next time follows the device language again."]
  };
  const localized = localeCopy[activeLocale] || localeCopy["en-us"];
  const locales = [
    ["en-us", "English (US)", "English · United States"],
    ["en-gb", "English (UK)", "English · United Kingdom"],
    ["en-au", "English (Australia)", "English · Australia"],
    ["zh-cn", "简体中文", "中文 · 简体"],
    ["zh-tw", "繁體中文", "中文 · 繁體"],
    ["ja-jp", "日本語", "日本語"],
    ["ko-kr", "한국어", "한국어"],
    ["fr-fr", "Français", "Français"],
    ["es-es", "Español", "Español"],
    ["el-gr", "Ελληνικά", "Ελληνικά"],
    ["ar-sa", "العربية", "العربية"]
  ];
  const choices = locales.map(([code, name, detail]) => `
    <a class="settings-choice ${activeLocale === code ? "is-selected" : ""}" href="/${code}/settings/language" lang="${code}"${code === "ar-sa" ? ' dir="rtl"' : ""}>
      <strong>${name}</strong><span>${detail}</span>
    </a>`).join("");
  return `
    <section class="os-card is-large settings-detail-card">
      <h2>${localized[0]}</h2>
      <p>${localized[1]}</p>
      <div class="settings-choice-grid">${choices}</div>
    </section>
  `;
}

const AI_SETTINGS_COPY = {
  "en-us":{title:"AI Settings",intro:"View this account's Intelligence access, providers, models, and usage limits. The default model is saved in this browser.",loading:"Loading AI configuration…",enabled:"Enabled",disabled:"Not enabled",providers:"Available providers",models:"Default model",usage:"Usage & limits",today:"Today",month:"This month",tokens:"Tokens",cost:"Cost",unlimited:"Unlimited",unavailable:"Intelligence access has not been enabled for this account, or no provider has been assigned.",region:"Current network region",open:"Open AERTEX Intelligence",saved:"Default model saved in this browser",error:"Unable to load AI configuration",available:"Available",networkUnavailable:"Unavailable on current network"},
  "zh-cn":{title:"AI 设置",intro:"查看当前账号的 Intelligence 权限、Provider、模型和使用额度。默认模型保存在当前浏览器。",loading:"正在读取 AI 配置…",enabled:"已启用",disabled:"未启用",providers:"可用 Provider",models:"默认模型",usage:"用量与额度",today:"今日",month:"本月",tokens:"Token",cost:"费用",unlimited:"不限",unavailable:"当前账号尚未获得 Intelligence 权限，或管理员尚未分配可用 Provider。",region:"当前网络区域",open:"打开 AERTEX Intelligence",saved:"默认模型已保存到当前浏览器",error:"无法读取 AI 配置",available:"可用",networkUnavailable:"当前网络不可用"},
  "zh-tw":{title:"AI 設定",intro:"查看目前帳號的 Intelligence 權限、Provider、模型與使用額度。預設模型會儲存在目前瀏覽器。",loading:"正在讀取 AI 設定…",enabled:"已啟用",disabled:"未啟用",providers:"可用 Provider",models:"預設模型",usage:"用量與額度",today:"今日",month:"本月",tokens:"Token",cost:"費用",unlimited:"不限",unavailable:"目前帳號尚未啟用 Intelligence，或尚未分配可用 Provider。",region:"目前網路區域",open:"開啟 AERTEX Intelligence",saved:"預設模型已儲存在目前瀏覽器",error:"無法讀取 AI 設定",available:"可用",networkUnavailable:"目前網路無法使用"},
  "ja-jp":{title:"AI 設定",intro:"このアカウントの Intelligence アクセス、Provider、モデル、使用上限を確認します。既定のモデルはこのブラウザに保存されます。",loading:"AI 設定を読み込み中…",enabled:"有効",disabled:"未有効",providers:"利用可能な Provider",models:"既定のモデル",usage:"使用量と上限",today:"今日",month:"今月",tokens:"トークン",cost:"費用",unlimited:"無制限",unavailable:"このアカウントでは Intelligence が有効になっていないか、利用可能な Provider が割り当てられていません。",region:"現在のネットワーク地域",open:"AERTEX Intelligence を開く",saved:"既定のモデルをこのブラウザに保存しました",error:"AI 設定を読み込めません",available:"利用可能",networkUnavailable:"現在のネットワークでは利用不可"},
  "ko-kr":{title:"AI 설정",intro:"현재 계정의 Intelligence 권한, Provider, 모델 및 사용 한도를 확인합니다. 기본 모델은 이 브라우저에 저장됩니다.",loading:"AI 설정을 불러오는 중…",enabled:"사용 가능",disabled:"사용 안 함",providers:"사용 가능한 Provider",models:"기본 모델",usage:"사용량 및 한도",today:"오늘",month:"이번 달",tokens:"토큰",cost:"비용",unlimited:"무제한",unavailable:"이 계정에 Intelligence 권한이 활성화되지 않았거나 사용 가능한 Provider가 할당되지 않았습니다.",region:"현재 네트워크 지역",open:"AERTEX Intelligence 열기",saved:"기본 모델을 이 브라우저에 저장했습니다",error:"AI 설정을 불러올 수 없습니다",available:"사용 가능",networkUnavailable:"현재 네트워크에서 사용할 수 없음"},
  "fr-fr":{title:"Réglages IA",intro:"Consultez l’accès Intelligence, les providers, les modèles et les limites d’utilisation de ce compte. Le modèle par défaut est enregistré dans ce navigateur.",loading:"Chargement de la configuration IA…",enabled:"Activé",disabled:"Non activé",providers:"Providers disponibles",models:"Modèle par défaut",usage:"Utilisation et limites",today:"Aujourd’hui",month:"Ce mois-ci",tokens:"Tokens",cost:"Coût",unlimited:"Illimité",unavailable:"L’accès Intelligence n’est pas activé pour ce compte ou aucun provider disponible n’a été attribué.",region:"Région réseau actuelle",open:"Ouvrir AERTEX Intelligence",saved:"Modèle par défaut enregistré dans ce navigateur",error:"Impossible de charger la configuration IA",available:"Disponible",networkUnavailable:"Indisponible sur ce réseau"},
  "es-es":{title:"Ajustes de IA",intro:"Consulta el acceso a Intelligence, los providers, los modelos y los límites de uso de esta cuenta. El modelo predeterminado se guarda en este navegador.",loading:"Cargando configuración de IA…",enabled:"Activado",disabled:"No activado",providers:"Providers disponibles",models:"Modelo predeterminado",usage:"Uso y límites",today:"Hoy",month:"Este mes",tokens:"Tokens",cost:"Coste",unlimited:"Sin límite",unavailable:"Intelligence no está habilitado para esta cuenta o no se ha asignado ningún provider disponible.",region:"Región de red actual",open:"Abrir AERTEX Intelligence",saved:"Modelo predeterminado guardado en este navegador",error:"No se pudo cargar la configuración de IA",available:"Disponible",networkUnavailable:"No disponible en la red actual"},
  "el-gr":{title:"Ρυθμίσεις AI",intro:"Δείτε την πρόσβαση Intelligence, τους providers, τα μοντέλα και τα όρια χρήσης αυτού του λογαριασμού. Το προεπιλεγμένο μοντέλο αποθηκεύεται σε αυτό το πρόγραμμα περιήγησης.",loading:"Φόρτωση ρυθμίσεων AI…",enabled:"Ενεργό",disabled:"Μη ενεργό",providers:"Διαθέσιμοι providers",models:"Προεπιλεγμένο μοντέλο",usage:"Χρήση και όρια",today:"Σήμερα",month:"Αυτόν τον μήνα",tokens:"Tokens",cost:"Κόστος",unlimited:"Χωρίς όριο",unavailable:"Η πρόσβαση Intelligence δεν έχει ενεργοποιηθεί για αυτόν τον λογαριασμό ή δεν έχει εκχωρηθεί διαθέσιμος provider.",region:"Τρέχουσα περιοχή δικτύου",open:"Άνοιγμα AERTEX Intelligence",saved:"Το προεπιλεγμένο μοντέλο αποθηκεύτηκε σε αυτό το πρόγραμμα περιήγησης",error:"Δεν ήταν δυνατή η φόρτωση των ρυθμίσεων AI",available:"Διαθέσιμο",networkUnavailable:"Μη διαθέσιμο στο τρέχον δίκτυο"},
  "ar-sa":{title:"إعدادات الذكاء الاصطناعي",intro:"اعرض صلاحية Intelligence وموفري الخدمة والنماذج وحدود الاستخدام لهذا الحساب. يُحفظ النموذج الافتراضي في هذا المتصفح.",loading:"جارٍ تحميل إعدادات الذكاء الاصطناعي…",enabled:"مفعّل",disabled:"غير مفعّل",providers:"موفرو الخدمة المتاحون",models:"النموذج الافتراضي",usage:"الاستخدام والحدود",today:"اليوم",month:"هذا الشهر",tokens:"الرموز",cost:"التكلفة",unlimited:"بلا حد",unavailable:"لم يتم تفعيل Intelligence لهذا الحساب أو لم يتم تعيين Provider متاح.",region:"منطقة الشبكة الحالية",open:"فتح AERTEX Intelligence",saved:"تم حفظ النموذج الافتراضي في هذا المتصفح",error:"تعذر تحميل إعدادات الذكاء الاصطناعي",available:"متاح",networkUnavailable:"غير متاح على الشبكة الحالية"}
};
AI_SETTINGS_COPY["en-gb"]=AI_SETTINGS_COPY["en-us"]; AI_SETTINGS_COPY["en-au"]=AI_SETTINGS_COPY["en-us"];

// AI 设置：加载用户当前模型/供应商/额度，再保存首选模型。可用模型由服务端配置决定，前端不能自行解锁不存在的模型。\nexport function aiSettingsContent(zh, locale = "") {
  const activeLocale = locale || (zh ? "zh-cn" : "en-us");
  const copy = AI_SETTINGS_COPY[activeLocale] || AI_SETTINGS_COPY["en-us"];
  return `
    <style>
      .ai-settings-stack{display:grid;gap:16px}
      .ai-settings-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin-top:14px}
      .ai-settings-panel{padding:18px;border:1px solid var(--border);border-radius:18px;background:var(--card)}
      .ai-settings-panel small{display:block;color:var(--muted);font-size:12px;margin-bottom:8px}
      .ai-settings-panel strong{display:block;font-size:18px}
      .ai-settings-panel p{margin:7px 0 0;color:var(--muted);line-height:1.5}
      .ai-provider-list{display:grid;gap:9px;margin-top:12px}
      .ai-provider-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-top:1px solid var(--border)}
      .ai-provider-row:first-child{border-top:0;padding-top:0}
      .ai-provider-row span{min-width:0;color:var(--muted);font-size:13px;text-align:right}
      .ai-model-select{width:100%;min-height:48px;margin-top:12px;padding:0 12px;border:1px solid var(--border);border-radius:12px;background:var(--card);color:var(--text);font:inherit}
      .ai-settings-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:14px}
      .ai-settings-feedback{color:var(--muted);font-size:12px}
      .ai-usage-line{display:flex;justify-content:space-between;gap:12px;margin-top:9px;font-size:13px}
      @media(max-width:620px){.ai-settings-grid{grid-template-columns:1fr}}
    </style>
    <section class="os-card is-large settings-detail-card">
      <div class="settings-general-heading">
        ${osHubIcon("ai")}
        <div>
          <small>AERTEX INTELLIGENCE</small>
          <h2>${copy.title}</h2>
          <p>${copy.intro}</p>
        </div>
      </div>
      <div id="ai-settings-state" class="ai-settings-stack">
        <div class="ai-settings-panel"><strong>${copy.loading}</strong></div>
      </div>
    </section>
    <script>
      (() => {
        const copy=${JSON.stringify(copy)};
        const root=document.getElementById("ai-settings-state");
        const preferenceKey="aertex-ai-default-model-v1";
        const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
        const money=value=>Number.isFinite(Number(value))?"$"+Number(value).toFixed(4):"—";
        const integer=value=>Number.isFinite(Number(value))?Math.round(Number(value)).toLocaleString():"—";
        const limit=(used,max,kind)=>{
          const usedText=kind==="usd"?money(used):integer(used);
          const maxText=max==null?copy.unlimited:(kind==="usd"?money(max):integer(max));
          return usedText+" / "+maxText;
        };
        const providerLabel=p=>{
          const name=String(p?.name||"");
          const vendor=p?.provider==="zhipu"?"智谱 GLM":p?.provider==="bailian"?"阿里云百炼":p?.provider==="openai"?"OpenAI":String(p?.provider||"Provider");
          return vendor+(name?" · "+name:"");
        };
        const preferenceDomain=()=>{
          const host=String(location.hostname||"").toLowerCase();
          return ["qsseda.com","qsseda.online","qsseda.studio"].find(domain=>host===domain||host.endsWith("."+domain))||"";
        };
        const readPreference=()=>{
          try{
            const prefix=preferenceKey+"=";
            const raw=document.cookie.split(";").map(part=>part.trim()).find(part=>part.startsWith(prefix));
            if(raw)return JSON.parse(decodeURIComponent(raw.slice(prefix.length)));
          }catch{}
          try{return JSON.parse(localStorage.getItem(preferenceKey)||"null")}catch{return null}
        };
        const savePreference=(providerId,model)=>{
          const value=JSON.stringify({provider_id:providerId,model});
          try{localStorage.setItem(preferenceKey,value)}catch{}
          try{
            const domain=preferenceDomain();
            document.cookie=preferenceKey+"="+encodeURIComponent(value)+"; Path=/; Max-Age=31536000; SameSite=Lax; Secure"+(domain?"; Domain="+domain:"");
          }catch{}
        };
        // AI 设置加载：并行/顺序读取配置与用量，并把不可用、未配置、额度不足等状态区分显示，而不是都归成一个“失败”。\nasync function load(){
          try{
            const response=await fetch("/api/ai/config",{credentials:"same-origin",cache:"no-store",headers:{Accept:"application/json"}});
            const cfg=await response.json().catch(()=>null);
            if(!response.ok||!cfg?.enabled)throw new Error(cfg?.error||copy.unavailable);
            const providers=Array.isArray(cfg.providers)?cfg.providers:[];
            const models=Array.isArray(cfg.models)?cfg.models:[];
            const available=models.filter(item=>item.available!==false);
            const saved=readPreference();
            const chosen=available.find(item=>item.provider_id===saved?.provider_id&&item.model===saved?.model)
              || available.find(item=>item.provider_id===cfg.default_provider_id&&item.model===cfg.default_model)
              || available[0]
              || null;
            root.innerHTML=
              '<div class="ai-settings-grid">'+
                '<div class="ai-settings-panel"><small>'+esc(copy.enabled)+'</small><strong>AERTEX Intelligence</strong><p>'+esc(copy.region)+': '+esc(cfg.country||"—")+'</p></div>'+
                '<div class="ai-settings-panel"><small>'+esc(copy.providers)+'</small><strong>'+esc(String(providers.filter(p=>p.available!==false).length))+'</strong><p>'+esc(available.length+" "+copy.models)+'</p></div>'+
              '</div>'+
              '<div class="ai-settings-panel"><small>'+esc(copy.providers)+'</small><div class="ai-provider-list">'+
                providers.map(p=>'<div class="ai-provider-row"><strong>'+esc(providerLabel(p))+'</strong><span>'+esc(p.available===false?copy.networkUnavailable:copy.available)+'</span></div>').join("")+
              '</div></div>'+
              '<div class="ai-settings-panel"><small>'+esc(copy.models)+'</small><strong>'+esc(chosen?.model||"—")+'</strong>'+
                '<select id="ai-default-model" class="ai-model-select" '+(available.length?"":"disabled")+'>'+
                  available.map(item=>'<option value="'+esc(item.provider_id+"|"+item.model)+'" '+(chosen&&item.provider_id===chosen.provider_id&&item.model===chosen.model?"selected":"")+'>'+esc(providerLabel(providers.find(p=>p.id===item.provider_id)))+' · '+esc(item.model)+'</option>').join("")+
                '</select><div class="ai-settings-actions"><a class="btn primary" href="'+esc(("/"+(location.pathname.split("/").filter(Boolean)[0]||"en-us"))+"/gpt/handoff?next="+encodeURIComponent("/"+(location.pathname.split("/").filter(Boolean)[0]||"en-us")))+'">'+esc(copy.open)+'</a><span id="ai-settings-feedback" class="ai-settings-feedback"></span></div></div>'+
              '<div class="ai-settings-panel"><small>'+esc(copy.usage)+'</small>'+
                '<div class="ai-usage-line"><span>'+esc(copy.today+" · "+copy.tokens)+'</span><strong>'+esc(limit(cfg.usage?.today_tokens,cfg.limits?.daily_tokens,"tokens"))+'</strong></div>'+
                '<div class="ai-usage-line"><span>'+esc(copy.month+" · "+copy.tokens)+'</span><strong>'+esc(limit(cfg.usage?.month_tokens,cfg.limits?.monthly_tokens,"tokens"))+'</strong></div>'+
                '<div class="ai-usage-line"><span>'+esc(copy.today+" · "+copy.cost)+'</span><strong>'+esc(limit(cfg.usage?.today_usd,cfg.limits?.daily_usd,"usd"))+'</strong></div>'+
                '<div class="ai-usage-line"><span>'+esc(copy.month+" · "+copy.cost)+'</span><strong>'+esc(limit(cfg.usage?.month_usd,cfg.limits?.monthly_usd,"usd"))+'</strong></div>'+
              '</div>';
            const select=document.getElementById("ai-default-model");
            const feedback=document.getElementById("ai-settings-feedback");
            select?.addEventListener("change",()=>{
              const [providerId,...rest]=select.value.split("|");
              const model=rest.join("|");
              savePreference(providerId,model);
              const chosenOption=available.find(item=>item.provider_id===providerId&&item.model===model);
              const heading=select.previousElementSibling;
              if(heading&&chosenOption)heading.textContent=chosenOption.model;
              if(feedback){feedback.textContent=copy.saved;window.setTimeout(()=>{feedback.textContent=""},1800)}
            });
          }catch(error){
            root.innerHTML='<div class="ai-settings-panel"><small>'+esc(copy.disabled)+'</small><strong>'+esc(copy.unavailable)+'</strong><p>'+esc(String(error?.message||copy.error))+'</p></div>';
          }
        }
        void load();
      })();
    </script>
  `;
}

export function settingsHubContent(zh, locale = "") {
  const activeLocale = locale || (zh ? "zh-cn" : "en-us");
  const prefix = "/" + activeLocale;
  const copy = zh ? {
    eyebrow:"SETTINGS",
    title:"设置你的 AERTEX",
    intro:"把最常用的偏好放在最前面，其余设置按功能分组。主题、语言、安全、AI 与存储都从这里进入。",
    theme:"主题与外观",
    themeMeta:"个性化",
    themeDetail:"系统、浅色、深色与强调色",
    openTheme:"调整主题",
    essentials:"常用",
    services:"服务",
    advanced:"其他",
    language:["语言","中文或 English"],
    security:["账户与安全","设备、登录历史与提醒"],
    ai:["AI 设置","Provider、模型与额度"],
    subscription:["订阅与权益","套餐、有效期与产品权益"],
    student:["学生资格","认证状态与学生价格资格"],
    storage:["AERTEX Drive","私人云盘与容量"],
    notifications:["通知","提醒与站内消息"],
    integrations:["第三方集成","外部服务与授权"]
  } : {
    eyebrow:"SETTINGS",
    title:"Make AERTEX yours",
    intro:"Keep the preferences you use most at the top, with everything else grouped by purpose. Theme, language, security, AI, and storage all start here.",
    theme:"Theme & Appearance",
    themeMeta:"Personalization",
    themeDetail:"System, light, dark, and accent color",
    openTheme:"Customize theme",
    essentials:"Essentials",
    services:"Services",
    advanced:"Other",
    language:["Language","Chinese or English"],
    security:["Account & Security","Devices, sign-ins, and alerts"],
    ai:["AI Settings","Providers, models, and limits"],
    subscription:["Subscription","Plans, validity, and entitlements"],
    student:["Student Eligibility","Verification status and student pricing"],
    storage:["AERTEX Drive","Private files and capacity"],
    notifications:["Notifications","Alerts and in-app messages"],
    integrations:["Integrations","External services and authorization"]
  };
  const localeCopy = {
    "zh-tw":{title:"設定你的 AERTEX",intro:"把最常用的偏好放在最前面，其餘設定依功能分組。主題、語言、安全性、AI 與儲存空間都從這裡進入。",theme:"主題與外觀",themeMeta:"個人化",themeDetail:"系統、淺色、深色與強調色",openTheme:"調整主題",essentials:"常用",services:"服務",advanced:"其他",language:["語言","11 種顯示語言"],security:["帳號與安全性","裝置、登入記錄與提醒"],ai:["AI 設定","Provider、模型與額度"],subscription:["訂閱與權益","方案、有效期與產品權益"],student:["學生資格","驗證狀態與學生價格資格"],storage:["AERTEX Drive","私人雲端硬碟與容量"],notifications:["通知","提醒與站內訊息"],integrations:["第三方整合","外部服務與授權"]},
    "ja-jp":{title:"AERTEX を設定",intro:"よく使う設定を上にまとめ、その他は目的別に整理しています。テーマ、言語、セキュリティ、AI、ストレージをここから管理できます。",theme:"テーマと外観",themeMeta:"パーソナライズ",themeDetail:"システム、ライト、ダーク、アクセントカラー",openTheme:"テーマを変更",essentials:"基本設定",services:"サービス",advanced:"その他",language:["言語","11 の表示言語"],security:["アカウントとセキュリティ","デバイス、サインイン履歴、通知"],ai:["AI 設定","Provider、モデル、上限"],subscription:["サブスクリプション","プラン、有効期間、特典"],student:["学生資格","認証状況と学生料金"],storage:["AERTEX Drive","プライベートストレージと容量"],notifications:["通知","アラートとアプリ内メッセージ"],integrations:["連携","外部サービスと認証"]},
    "ko-kr":{title:"AERTEX 설정",intro:"자주 사용하는 환경설정을 위에 두고 나머지는 기능별로 정리했습니다. 테마, 언어, 보안, AI 및 저장 공간을 여기에서 관리할 수 있습니다.",theme:"테마 및 모양",themeMeta:"개인화",themeDetail:"시스템, 라이트, 다크 및 강조 색상",openTheme:"테마 조정",essentials:"주요 설정",services:"서비스",advanced:"기타",language:["언어","11개 표시 언어"],security:["계정 및 보안","기기, 로그인 기록 및 알림"],ai:["AI 설정","Provider, 모델 및 한도"],subscription:["구독","요금제, 유효 기간 및 혜택"],student:["학생 자격","인증 상태 및 학생 가격"],storage:["AERTEX Drive","개인 저장 공간 및 용량"],notifications:["알림","경고 및 앱 내 메시지"],integrations:["연동","외부 서비스 및 권한"]},
    "fr-fr":{title:"Personnalisez AERTEX",intro:"Les préférences les plus utilisées sont placées en premier, les autres sont regroupées par fonction. Thème, langue, sécurité, IA et stockage se gèrent ici.",theme:"Thème et apparence",themeMeta:"Personnalisation",themeDetail:"Système, clair, sombre et couleur d’accent",openTheme:"Personnaliser le thème",essentials:"Essentiels",services:"Services",advanced:"Autres",language:["Langue","11 langues d’affichage"],security:["Compte et sécurité","Appareils, connexions et alertes"],ai:["Réglages IA","Providers, modèles et limites"],subscription:["Abonnement","Offres, validité et avantages"],student:["Statut étudiant","Vérification et tarif étudiant"],storage:["AERTEX Drive","Fichiers privés et capacité"],notifications:["Notifications","Alertes et messages intégrés"],integrations:["Intégrations","Services externes et autorisations"]},
    "es-es":{title:"Configura AERTEX a tu gusto",intro:"Las preferencias más usadas aparecen primero y el resto se agrupa por función. Tema, idioma, seguridad, IA y almacenamiento se gestionan desde aquí.",theme:"Tema y apariencia",themeMeta:"Personalización",themeDetail:"Sistema, claro, oscuro y color de acento",openTheme:"Personalizar tema",essentials:"Esenciales",services:"Servicios",advanced:"Otros",language:["Idioma","11 idiomas de visualización"],security:["Cuenta y seguridad","Dispositivos, accesos y alertas"],ai:["Ajustes de IA","Providers, modelos y límites"],subscription:["Suscripción","Planes, vigencia y ventajas"],student:["Elegibilidad de estudiante","Verificación y precio para estudiantes"],storage:["AERTEX Drive","Archivos privados y capacidad"],notifications:["Notificaciones","Alertas y mensajes internos"],integrations:["Integraciones","Servicios externos y autorización"]},
    "el-gr":{title:"Ρυθμίστε το AERTEX",intro:"Οι πιο συχνές προτιμήσεις εμφανίζονται πρώτες και οι υπόλοιπες ομαδοποιούνται ανά λειτουργία. Θέμα, γλώσσα, ασφάλεια, AI και αποθήκευση διαχειρίζονται από εδώ.",theme:"Θέμα και εμφάνιση",themeMeta:"Εξατομίκευση",themeDetail:"Σύστημα, φωτεινό, σκοτεινό και χρώμα έμφασης",openTheme:"Προσαρμογή θέματος",essentials:"Βασικά",services:"Υπηρεσίες",advanced:"Άλλα",language:["Γλώσσα","11 γλώσσες εμφάνισης"],security:["Λογαριασμός και ασφάλεια","Συσκευές, συνδέσεις και ειδοποιήσεις"],ai:["Ρυθμίσεις AI","Providers, μοντέλα και όρια"],subscription:["Συνδρομή","Προγράμματα, διάρκεια και παροχές"],student:["Φοιτητική ιδιότητα","Επαλήθευση και φοιτητική τιμή"],storage:["AERTEX Drive","Ιδιωτικά αρχεία και χωρητικότητα"],notifications:["Ειδοποιήσεις","Ειδοποιήσεις και μηνύματα εφαρμογής"],integrations:["Ενσωματώσεις","Εξωτερικές υπηρεσίες και εξουσιοδότηση"]},
    "ar-sa":{title:"خصّص AERTEX",intro:"تظهر التفضيلات الأكثر استخدامًا أولاً، وتُجمع بقية الإعدادات حسب الوظيفة. يمكنك إدارة السمة واللغة والأمان والذكاء الاصطناعي والتخزين من هنا.",theme:"السمة والمظهر",themeMeta:"التخصيص",themeDetail:"النظام والفاتح والداكن ولون التمييز",openTheme:"تخصيص السمة",essentials:"الأساسيات",services:"الخدمات",advanced:"أخرى",language:["اللغة","11 لغة عرض"],security:["الحساب والأمان","الأجهزة وعمليات تسجيل الدخول والتنبيهات"],ai:["إعدادات الذكاء الاصطناعي","Providers والنماذج والحدود"],subscription:["الاشتراك","الخطط والصلاحية والمزايا"],student:["أهلية الطالب","التحقق وتسعير الطلاب"],storage:["AERTEX Drive","الملفات الخاصة والسعة"],notifications:["الإشعارات","التنبيهات والرسائل داخل التطبيق"],integrations:["عمليات التكامل","الخدمات الخارجية والتفويض"]}
  }[activeLocale];
  if (localeCopy) Object.assign(copy, localeCopy);
  const statusCopy = activeLocale === "zh-cn" ? ["可用","测试中"] : activeLocale === "zh-tw" ? ["可用","測試中"] : activeLocale === "ja-jp" ? ["利用可能","テスト中"] : activeLocale === "ko-kr" ? ["사용 가능","테스트 중"] : activeLocale === "fr-fr" ? ["Disponible","En test"] : activeLocale === "es-es" ? ["Disponible","En pruebas"] : activeLocale === "el-gr" ? ["Διαθέσιμο","Σε δοκιμή"] : activeLocale === "ar-sa" ? ["متاح","قيد الاختبار"] : ["Available","Testing"];
  const availability = { ai:{meta:statusCopy[0]}, storage:{meta:statusCopy[0]}, subscription:{meta:statusCopy[1]}, student:{meta:statusCopy[0]} };
  const soonLabel = activeLocale === "zh-cn" ? "未开放" : activeLocale === "zh-tw" ? "尚未開放" : activeLocale === "ja-jp" ? "近日対応" : activeLocale === "ko-kr" ? "준비 중" : activeLocale === "fr-fr" ? "Bientôt" : activeLocale === "es-es" ? "Próximamente" : activeLocale === "el-gr" ? "Σύντομα" : activeLocale === "ar-sa" ? "قريبًا" : "Soon";
  const row = (item, href, icon, status = "") => `
    <a class="settings-stage-row" href="${href}">
      <span class="settings-stage-row-icon">${dashboardIcon(icon)}</span>
      <span class="settings-stage-row-copy"><strong>${item[0]}</strong><small>${item[1]}</small></span>
      ${status ? `<em>${status}</em>` : ""}
      <b aria-hidden="true">›</b>
    </a>`;
  return `
    <style>
      body.os-shell:has(.settings-stage) .os-hero{display:none!important}
      .settings-stage{display:grid;gap:18px}
      .settings-stage-hero{
        position:relative;isolation:isolate;overflow:hidden;
        display:grid;grid-template-columns:minmax(0,1.25fr) minmax(280px,.75fr);gap:clamp(24px,4vw,56px);align-items:end;
        min-height:290px;padding:clamp(28px,3.8vw,48px);
        border:1px solid var(--border);border-radius:30px;
        background:
          radial-gradient(520px 320px at 95% 0%,color-mix(in srgb,var(--primary) 18%,transparent),transparent 72%),
          linear-gradient(145deg,color-mix(in srgb,var(--card) 98%,#fff 2%),color-mix(in srgb,var(--surface) 92%,var(--primary) 3%));
        box-shadow:0 22px 64px rgba(0,0,0,.075),inset 0 1px 0 color-mix(in srgb,#fff 20%,transparent)
      }
      .settings-stage-hero-copy{align-self:end}.settings-stage-hero-copy>small{display:block;color:var(--primary);font-size:11px;font-weight:780;letter-spacing:.16em}
      .settings-stage-hero h2{max-width:12ch;margin:10px 0 13px;font-size:clamp(40px,5vw,70px)!important;line-height:.94;letter-spacing:-.062em!important}
      .settings-stage-hero p{max-width:58ch;margin:0;font-size:15px;line-height:1.65}
      .settings-theme-feature{
        position:relative;z-index:1;display:grid;gap:18px;min-height:205px;padding:20px;border:1px solid color-mix(in srgb,var(--border) 90%,transparent);
        border-radius:24px;background:color-mix(in srgb,var(--glass-heavy) 90%,transparent);-webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
        box-shadow:0 16px 38px rgba(0,0,0,.09),inset 0 1px 0 color-mix(in srgb,#fff 20%,transparent);color:var(--text);text-decoration:none;
        transition:transform .3s cubic-bezier(.16,1,.3,1),box-shadow .3s cubic-bezier(.16,1,.3,1),border-color .2s ease
      }
      .settings-theme-feature-top{display:flex;align-items:center;justify-content:space-between;gap:14px}.settings-theme-feature-top small{color:var(--muted);font-size:10px;font-weight:750;letter-spacing:.09em;text-transform:uppercase}
      .settings-theme-arrow{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:var(--fill);font-size:20px}
      .settings-theme-swatches{display:flex;align-items:center;gap:7px}.settings-theme-swatches i{width:25px;height:25px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(255,255,255,.22)}
      .settings-theme-swatches i:nth-child(1){background:#222930}.settings-theme-swatches i:nth-child(2){background:#FC0324}.settings-theme-swatches i:nth-child(3){background:#9AADF6}.settings-theme-swatches i:nth-child(4){background:#A9B689}.settings-theme-swatches i:nth-child(5){background:#F77E2D}.settings-theme-swatches i:nth-child(6){background:#4D1821}
      .settings-theme-feature h3{margin:0;font-size:25px;letter-spacing:-.045em}.settings-theme-feature p{margin:5px 0 0;font-size:12px;line-height:1.5}
      .settings-theme-feature-bottom{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:auto}.settings-theme-feature-bottom strong{font-size:12px;color:var(--primary)}
      .settings-stage-columns{display:grid;grid-template-columns:1fr 1fr;gap:18px}
      .settings-stage-group{overflow:hidden;border:1px solid var(--border);border-radius:24px;background:var(--card);box-shadow:0 10px 30px rgba(0,0,0,.045)}
      .settings-stage-group-head{padding:18px 18px 10px;color:var(--muted);font-size:11px;font-weight:750;letter-spacing:.12em;text-transform:uppercase}
      .settings-stage-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;gap:12px;align-items:center;min-height:74px;padding:12px 16px;color:var(--text);text-decoration:none;border-top:1px solid var(--hairline);transition:background .18s ease,transform .2s cubic-bezier(.16,1,.3,1)}
      .settings-stage-row:first-of-type{border-top:0}.settings-stage-row-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:13px;background:var(--fill);color:var(--primary);box-shadow:inset 0 0 0 1px var(--border)}
      .settings-stage-row-icon .dashboard-icon{width:22px;height:22px;border-radius:0;background:transparent;box-shadow:none;color:currentColor;line-height:0}.settings-stage-row-icon .dashboard-icon svg{display:block;width:22px;height:22px;flex:0 0 22px;overflow:visible}.settings-stage-row-copy{min-width:0}.settings-stage-row-copy strong,.settings-stage-row-copy small{display:block}.settings-stage-row-copy strong{font-size:14px;letter-spacing:-.02em}.settings-stage-row-copy small{margin-top:4px;color:var(--muted);font-size:11px;line-height:1.35}
      .settings-stage-row em{font-style:normal;color:var(--quiet);font-size:10px}.settings-stage-row>b{color:var(--quiet);font-size:20px;font-weight:500}
      @media(hover:hover) and (pointer:fine){.settings-theme-feature:hover{transform:translateY(-3px);border-color:var(--border-strong);box-shadow:0 24px 56px rgba(0,0,0,.10)}.settings-stage-row:hover{background:var(--fill);transform:translateX(2px)}}
      @media(max-width:900px){.settings-stage-hero{grid-template-columns:1fr;min-height:0}.settings-stage-columns{grid-template-columns:1fr}}
      @media(max-width:560px){.settings-stage-hero{padding:22px 18px;border-radius:22px}.settings-stage-hero h2{font-size:clamp(38px,13vw,54px)!important}.settings-theme-feature{min-height:180px;border-radius:20px}.settings-stage-group{border-radius:20px}}
      @media(prefers-reduced-motion:reduce){.settings-theme-feature,.settings-stage-row{transition:none!important;transform:none!important}}
    </style>
    <section class="settings-stage">
      <section class="settings-stage-hero">
        <div class="settings-stage-hero-copy">
          <small>${copy.eyebrow}</small>
          <h2>${copy.title}</h2>
          <p>${copy.intro}</p>
        </div>
        <a class="settings-theme-feature" href="${prefix}/settings/appearance">
          <div class="settings-theme-feature-top"><small>${copy.themeMeta}</small><span class="settings-theme-arrow" aria-hidden="true">↗</span></div>
          <div class="settings-theme-swatches" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
          <div><h3>${copy.theme}</h3><p>${copy.themeDetail}</p></div>
          <div class="settings-theme-feature-bottom"><strong>${copy.openTheme}</strong><span>→</span></div>
        </a>
      </section>
      <div class="settings-stage-columns">
        <section class="settings-stage-group">
          <div class="settings-stage-group-head">${copy.essentials}</div>
          ${row(copy.language, prefix+"/settings/language", "language")}
          ${row(copy.security, prefix+"/settings/security", "security")}
          ${row(copy.ai, prefix+"/settings/ai", "ai", availability.ai.meta)}
        </section>
        <section class="settings-stage-group">
          <div class="settings-stage-group-head">${copy.services}</div>
          ${row(copy.subscription, prefix+"/settings/subscription", "account", availability.subscription.meta)}
          ${row(copy.student, prefix+"/settings/student", "users", availability.student.meta)}
          ${row(copy.storage, prefix+"/settings/storage", "storage", availability.storage.meta)}
          ${row(copy.notifications, prefix+"/settings/notifications", "notifications", soonLabel)}
          ${row(copy.integrations, prefix+"/settings/integrations", "integrations", soonLabel)}
        </section>
      </div>
    </section>
  `;
}

export function settingsFallbackContent(zh, locale = "") {
  return settingsHubContent(zh, locale);
}
