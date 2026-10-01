import { shellText } from "./i18n-ui.js";
export function dashboardIcon(name) {
  const icons = {
    home: '<path d="M3.5 11.2 12 4l8.5 7.2"/><path d="M5.5 10.3V20h13v-9.7M9.5 20v-6h5v6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    knowledge: '<path d="M4.5 5.5A2.5 2.5 0 0 1 7 3h4v16H7a2.5 2.5 0 0 0-2.5 2z"/><path d="M19.5 5.5A2.5 2.5 0 0 0 17 3h-4v16h4a2.5 2.5 0 0 1 2.5 2z"/>',
    profile: '<circle cx="12" cy="8" r="3.2"/><path d="M5.5 19c.9-3.2 3.2-5 6.5-5s5.6 1.8 6.5 5"/>',
    account: '<rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="11" r="2"/><path d="M6.2 16c.6-1.8 1.6-2.7 2.8-2.7s2.2.9 2.8 2.7M14.5 10h3M14.5 14h3"/>',
    preferences: '<path d="M4 7h7M15 7h5M4 17h5M13 17h7M11 5v4M9 15v4"/>',
    workspace: '<rect x="3.5" y="4" width="7" height="7" rx="1.5"/><rect x="13.5" y="4" width="7" height="7" rx="1.5"/><rect x="3.5" y="14" width="7" height="6" rx="1.5"/><rect x="13.5" y="14" width="7" height="6" rx="1.5"/>',
    workbench: '<rect x="3.5" y="5" width="17" height="14" rx="3"/><path d="M7.5 9h9M7.5 13h5M7.5 17h7"/>',
    projects: '<path d="M3.5 7.5h6l1.7 2h9.3v9H3.5z"/><path d="M3.5 7.5V5h6l1.7 2h9.3v2.5"/>',
    experiments: '<path d="M9 3h6M10 3v5l-5 9a2.6 2.6 0 0 0 2.3 4h9.4a2.6 2.6 0 0 0 2.3-4l-5-9V3"/><path d="M8.2 15h7.6"/>',
    drafts: '<path d="M6 3.5h8l4 4V20.5H6z"/><path d="M14 3.5v4h4M9 12h6M9 16h4"/>',
    tasks: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m7.5 9 1.5 1.5L12 7.5M13.5 9H17M7.5 15 9 16.5l3-3M13.5 15H17"/>',
    links: '<path d="M9.5 14.5l5-5M7.2 16.8l-1.3 1.3a3.2 3.2 0 0 1-4.5-4.5l3.4-3.4a3.2 3.2 0 0 1 4.5 0M16.8 7.2l1.3-1.3a3.2 3.2 0 0 1 4.5 4.5l-3.4 3.4a3.2 3.2 0 0 1-4.5 0"/>',
    notes: '<path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/><path d="m15.5 18.5 4-4"/>',
    summary: '<path d="M6 3.5h8l4 4V20.5H6z"/><path d="M14 3.5v4h4M9 11h6M9 14h6M9 17h4"/>',
    search: '<circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5"/>',
    security: '<path d="M12 3l7 3v5c0 4.4-2.6 7.8-7 10-4.4-2.2-7-5.6-7-10V6l7-3z"/><path d="M9.3 12l1.8 1.8 3.7-4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7.4 7.4 0 0 0-.1-1l2-1.5-2-3.4-2.5 1A8.3 8.3 0 0 0 14.7 6L14.4 3H9.6L9.3 6a8.3 8.3 0 0 0-1.7 1.1l-2.5-1-2 3.4 2 1.5a7.4 7.4 0 0 0 0 2l-2 1.5 2 3.4 2.5-1A8.3 8.3 0 0 0 9.3 18l.3 3h4.8l.3-3a8.3 8.3 0 0 0 1.7-1.1l2.5 1 2-3.4-2-1.5c.1-.3.1-.7.1-1z"/>',
    general: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    appearance: '<circle cx="12" cy="12" r="4"/><path d="M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M18.5 5.5l-1.4 1.4M6.9 17.1l-1.4 1.4"/>',
    language: '<path d="M4 5h10M9 5c-.2 5-2.3 8.3-5 10M6 9c1.8 2.8 4 4.8 7 6M14 10h6M17 7v10M14 17h6"/>',
    notifications: '<path d="M6 16.5h12l-1.5-2V10a4.5 4.5 0 0 0-9 0v4.5z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
    ai: '<path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4z"/><path d="m18.5 14 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8zM5.5 15l.6 1.6 1.6.6-1.6.6-.6 1.7-.6-1.7-1.6-.6 1.6-.6z"/>',
    integrations: '<path d="M8 3v4M16 3v4M5 7h14v5a7 7 0 0 1-14 0z"/><path d="M12 19v2"/>',
    storage: '<path d="M4 7.5C4 5.6 7.6 4 12 4s8 1.6 8 3.5S16.4 11 12 11 4 9.4 4 7.5z"/><path d="M4 7.5v4C4 13.4 7.6 15 12 15s8-1.6 8-3.5v-4M4 11.5v4C4 17.4 7.6 19 12 19s8-1.6 8-3.5v-4"/>',
    work: '<path d="M4 6.5h16v11H4z"/><path d="M8 20h8M12 17.5V20"/><path d="M8 10h8M8 13.5h5"/>',
    computer: '<rect x="3" y="4" width="18" height="13" rx="2.5"/><path d="M8 21h8M12 17v4"/>',
    tex: '<path d="M5 5h14M8 5l3.8 7L8 19M13 9h6M13 15h6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    intelligence: '<path d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v6a2.5 2.5 0 0 1-2.5 2.5H11l-4 3v-3.2A2.5 2.5 0 0 1 5 13.5z"/><path d="M9 9.5h6M9 12.5h4"/>',
    admin: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M8 9h8M8 13h5M16 13h.01"/>',
    wishes: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M12 7v6M9.5 10h5"/>',
    gift: '<rect x="4.5" y="11" width="15" height="9" rx="1.5"/><path d="M4.5 15h15M12 11V7"/><path d="M12 4.2c1.15 1 1.15 1.9 0 2.8-1.15-.9-1.15-1.8 0-2.8Z"/>',
    moon: '<path d="M19.2 15.4A7.8 7.8 0 0 1 8.6 4.8 8.2 8.2 0 1 0 19.2 15.4z"/>'
  };
  const key = icons[name] ? name : "info";
  return '<span class="dashboard-icon dashboard-icon-' + key + '" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false">' + icons[key] + '</svg></span>';
}

const DASHBOARD_COPY = {
  "en-us": {
    currentTime:"Current time", now:"Now", timeZone:"Time zone", calendar:"Calendar", primary:"Primary destinations",
    openWorkbench:"Open Workbench", workflowLead:"Bring projects, drafts, experiments, and tasks into one working flow.",
    privateDrive:"Private Drive", driveLead:"Files, capacity, and private storage.", customizeTheme:"Customize Theme", themeLead:"Mode, accent color, and live preview.",
    wishes:"Wishes", sendWish:"Send a wish", wishLead:"Create birthday or Mid-Autumn greeting links directly from Home. The recipient name is optional.",
    chooseWish:"Choose a wish", birthday:"Happy Birthday", birthdayGreeting:"Birthday greeting", midAutumn:"Happy Mid-Autumn", midAutumnGreeting:"Mid-Autumn greeting",
    who:"Who is this for?", optional:"Optional", namePlaceholder:"Enter a name or leave it blank", shareRoute:"Share route", createOpen:"Create & Open", openWishes:"Open Wish Links",
    shortcuts:"Shortcuts", common:"Common", modules:"Modules", status:"Status", current:"Current", environment:"Environment", appearance:"Appearance", storage:"Storage",
    activity:"Activity", recent:"Recent", noActivity:"No recent activity", activityLead:"Projects, drafts, and tasks will appear here once connected.", openWorkspace:"Open Workspace",
    week:n=>"Week "+n, dark:"Dark", light:"Light", system:"System",
    available:"Available", partial:"Partial",
    shortcutRows:{gpt:"Open GPT workspace",admin:"Open isolated control plane",wishes:"Birthday, Mid-Autumn, and named greeting links",account:"Personal information, sign-in & security, and account services",links:"Links and bookmarks",security:"Devices and sign-in history"},
    moduleRows:[["Profile","Available","Profile details, presence, interests, and links.","profile","profile"],["AERTEX Drive","Available","Private cloud-drive files.","storage","storage"],["Workspace","Partial","Workbench, projects, experiments, drafts, and tasks.","workbench","workspace"],["Information","Partial","Knowledge, links, and account summaries.","info","info"]]
  },
  "zh-cn": {
    currentTime:"当前时间", now:"现在", timeZone:"时区", calendar:"日历", primary:"主要入口",
    openWorkbench:"进入工作台", workflowLead:"把项目、草稿、实验和任务集中到一个工作流里。",
    privateDrive:"私人云盘", driveLead:"文件、容量与私人存储。", customizeTheme:"调整主题", themeLead:"模式、强调色与实时预览。",
    wishes:"祝福", sendWish:"送一份祝福", wishLead:"生日快乐和中秋快乐现在可以直接从首页生成。名字可以填写，也可以留空。",
    chooseWish:"选择祝福", birthday:"生日快乐", birthdayGreeting:"生日祝福", midAutumn:"中秋快乐", midAutumnGreeting:"中秋祝福",
    who:"要祝福谁？", optional:"可选", namePlaceholder:"输入名字，也可以留空", shareRoute:"分享路由", createOpen:"生成并打开", openWishes:"打开祝福中心",
    shortcuts:"快捷入口", common:"常用", modules:"模块", status:"当前状态", current:"当前", environment:"环境", appearance:"外观", storage:"存储",
    activity:"活动", recent:"最近动态", noActivity:"暂无动态", activityLead:"项目、草稿和任务接入后会显示在这里。", openWorkspace:"打开工作区",
    week:n=>"第 "+n+" 周", dark:"深色", light:"浅色", system:"系统",
    available:"可用", partial:"部分可用",
    shortcutRows:{gpt:"打开 GPT 工作空间",admin:"进入独立管理控制面",wishes:"生日、中秋与专属姓名分享链接",account:"个人信息、登录与安全和账户服务",links:"常用链接和收藏",security:"设备和登录记录"},
    moduleRows:[["AERTEX 账户","可用","个人信息、安全、偏好和账户服务。","profile","profile"],["AERTEX Drive","可用","私人云盘文件。","storage","storage"],["工作区","部分可用","工作台、项目、实验、草稿和任务。","workbench","workspace"],["信息中心","部分可用","知识库、链接和账号摘要。","info","info"]]
  },
  "zh-tw": {
    currentTime:"目前時間", now:"現在", timeZone:"時區", calendar:"日曆", primary:"主要入口",
    openWorkbench:"開啟工作台", workflowLead:"把專案、草稿、實驗與任務集中到同一個工作流程。",
    privateDrive:"私人雲端硬碟", driveLead:"檔案、容量與私人儲存空間。", customizeTheme:"調整主題", themeLead:"模式、強調色與即時預覽。",
    wishes:"祝福", sendWish:"送一份祝福", wishLead:"可直接從首頁建立生日或中秋祝福連結，收件人姓名可填也可留空。",
    chooseWish:"選擇祝福", birthday:"生日快樂", birthdayGreeting:"生日祝福", midAutumn:"中秋快樂", midAutumnGreeting:"中秋祝福",
    who:"要祝福誰？", optional:"選填", namePlaceholder:"輸入名字，也可以留空", shareRoute:"分享路由", createOpen:"建立並開啟", openWishes:"開啟祝福中心",
    shortcuts:"快速入口", common:"常用", modules:"模組", status:"目前狀態", current:"目前", environment:"環境", appearance:"外觀", storage:"儲存空間",
    activity:"活動", recent:"最近動態", noActivity:"暫無動態", activityLead:"專案、草稿與任務接入後會顯示在這裡。", openWorkspace:"開啟工作區",
    week:n=>"第 "+n+" 週", dark:"深色", light:"淺色", system:"系統", available:"可用", partial:"部分可用",
    shortcutRows:{gpt:"開啟 GPT 工作空間",admin:"進入獨立管理控制台",wishes:"生日、中秋與姓名祝福連結",account:"個人資料、登入與安全性和帳號服務",links:"常用連結與收藏",security:"裝置與登入記錄"},
    moduleRows:[["AERTEX 帳號","可用","個人資料、安全性、偏好設定與帳號服務。","profile","profile"],["AERTEX Drive","可用","私人雲端硬碟檔案。","storage","storage"],["工作區","部分可用","工作台、專案、實驗、草稿與任務。","workbench","workspace"],["資訊中心","部分可用","知識庫、連結與帳號摘要。","info","info"]]
  },
  "ja-jp": {
    currentTime:"現在の時刻", now:"現在", timeZone:"タイムゾーン", calendar:"カレンダー", primary:"主な入口",
    openWorkbench:"ワークベンチを開く", workflowLead:"プロジェクト、下書き、実験、タスクをひとつのワークフローにまとめます。",
    privateDrive:"プライベート Drive", driveLead:"ファイル、容量、プライベートストレージ。", customizeTheme:"テーマを調整", themeLead:"モード、アクセントカラー、ライブプレビュー。",
    wishes:"グリーティング", sendWish:"メッセージを贈る", wishLead:"ホームから誕生日や中秋のグリーティングリンクを作成できます。名前は任意です。",
    chooseWish:"グリーティングを選択", birthday:"お誕生日おめでとう", birthdayGreeting:"誕生日のメッセージ", midAutumn:"中秋節おめでとう", midAutumnGreeting:"中秋のメッセージ",
    who:"誰に贈りますか？", optional:"任意", namePlaceholder:"名前を入力するか空欄のままにします", shareRoute:"共有ルート", createOpen:"作成して開く", openWishes:"グリーティングセンターを開く",
    shortcuts:"ショートカット", common:"よく使う項目", modules:"モジュール", status:"状態", current:"現在", environment:"環境", appearance:"外観", storage:"ストレージ",
    activity:"アクティビティ", recent:"最近", noActivity:"最近のアクティビティはありません", activityLead:"プロジェクト、下書き、タスクが接続されるとここに表示されます。", openWorkspace:"ワークスペースを開く",
    week:n=>"第 "+n+" 週", dark:"ダーク", light:"ライト", system:"システム", available:"利用可能", partial:"一部利用可能",
    shortcutRows:{gpt:"GPT ワークスペースを開く",admin:"管理コンソールを開く",wishes:"誕生日・中秋・名前付きグリーティング",account:"個人情報、サインイン、セキュリティ、アカウントサービス",links:"リンクとブックマーク",security:"デバイスとサインイン履歴"},
    moduleRows:[["AERTEX アカウント","利用可能","個人情報、セキュリティ、設定、アカウントサービス。","profile","profile"],["AERTEX Drive","利用可能","プライベートクラウドファイル。","storage","storage"],["ワークスペース","一部利用可能","ワークベンチ、プロジェクト、実験、下書き、タスク。","workbench","workspace"],["情報センター","一部利用可能","ナレッジ、リンク、アカウント要約。","info","info"]]
  },
  "ko-kr": {
    currentTime:"현재 시간", now:"지금", timeZone:"시간대", calendar:"캘린더", primary:"주요 이동",
    openWorkbench:"워크벤치 열기", workflowLead:"프로젝트, 초안, 실험 및 작업을 하나의 워크플로로 모읍니다.",
    privateDrive:"개인 Drive", driveLead:"파일, 용량 및 개인 저장 공간.", customizeTheme:"테마 조정", themeLead:"모드, 강조 색상 및 실시간 미리보기.",
    wishes:"축하", sendWish:"축하 보내기", wishLead:"홈에서 생일 또는 중추절 축하 링크를 만들 수 있습니다. 이름은 선택 사항입니다.",
    chooseWish:"축하 선택", birthday:"생일 축하합니다", birthdayGreeting:"생일 축하", midAutumn:"중추절 축하", midAutumnGreeting:"중추절 축하",
    who:"누구에게 보낼까요?", optional:"선택", namePlaceholder:"이름을 입력하거나 비워 두세요", shareRoute:"공유 경로", createOpen:"만들고 열기", openWishes:"축하 센터 열기",
    shortcuts:"바로가기", common:"자주 사용", modules:"모듈", status:"상태", current:"현재", environment:"환경", appearance:"모양", storage:"저장 공간",
    activity:"활동", recent:"최근", noActivity:"최근 활동 없음", activityLead:"프로젝트, 초안 및 작업이 연결되면 여기에 표시됩니다.", openWorkspace:"작업 공간 열기",
    week:n=>n+"주차", dark:"다크", light:"라이트", system:"시스템", available:"사용 가능", partial:"일부 사용 가능",
    shortcutRows:{gpt:"GPT 작업 공간 열기",admin:"관리 콘솔 열기",wishes:"생일, 중추절 및 이름 포함 축하 링크",account:"개인 정보, 로그인, 보안 및 계정 서비스",links:"링크와 북마크",security:"기기 및 로그인 기록"},
    moduleRows:[["AERTEX 계정","사용 가능","개인 정보, 보안, 환경설정 및 계정 서비스.","profile","profile"],["AERTEX Drive","사용 가능","개인 클라우드 파일.","storage","storage"],["작업 공간","일부 사용 가능","워크벤치, 프로젝트, 실험, 초안 및 작업.","workbench","workspace"],["정보 센터","일부 사용 가능","지식, 링크 및 계정 요약.","info","info"]]
  },
  "fr-fr": {
    currentTime:"Heure actuelle", now:"Maintenant", timeZone:"Fuseau horaire", calendar:"Calendrier", primary:"Destinations principales",
    openWorkbench:"Ouvrir l’atelier", workflowLead:"Regroupez projets, brouillons, expériences et tâches dans un même flux de travail.",
    privateDrive:"Drive privé", driveLead:"Fichiers, capacité et stockage privé.", customizeTheme:"Personnaliser le thème", themeLead:"Mode, couleur d’accent et aperçu en direct.",
    wishes:"Vœux", sendWish:"Envoyer un vœu", wishLead:"Créez depuis l’accueil des liens d’anniversaire ou de fête de la mi-automne. Le nom du destinataire est facultatif.",
    chooseWish:"Choisir un vœu", birthday:"Joyeux anniversaire", birthdayGreeting:"Message d’anniversaire", midAutumn:"Bonne fête de la mi-automne", midAutumnGreeting:"Message de mi-automne",
    who:"Pour qui ?", optional:"Facultatif", namePlaceholder:"Saisissez un nom ou laissez vide", shareRoute:"Route de partage", createOpen:"Créer et ouvrir", openWishes:"Ouvrir le centre de vœux",
    shortcuts:"Raccourcis", common:"Fréquents", modules:"Modules", status:"État", current:"Actuel", environment:"Environnement", appearance:"Apparence", storage:"Stockage",
    activity:"Activité", recent:"Récent", noActivity:"Aucune activité récente", activityLead:"Les projets, brouillons et tâches apparaîtront ici une fois connectés.", openWorkspace:"Ouvrir l’espace de travail",
    week:n=>"Semaine "+n, dark:"Sombre", light:"Clair", system:"Système", available:"Disponible", partial:"Partiel",
    shortcutRows:{gpt:"Ouvrir l’espace GPT",admin:"Ouvrir la console d’administration",wishes:"Liens d’anniversaire, de mi-automne et nominatifs",account:"Informations personnelles, connexion, sécurité et services de compte",links:"Liens et favoris",security:"Appareils et historique de connexion"},
    moduleRows:[["Compte AERTEX","Disponible","Informations personnelles, sécurité, préférences et services de compte.","profile","profile"],["AERTEX Drive","Disponible","Fichiers cloud privés.","storage","storage"],["Espace de travail","Partiel","Atelier, projets, expériences, brouillons et tâches.","workbench","workspace"],["Informations","Partiel","Connaissances, liens et résumés de compte.","info","info"]]
  },
  "es-es": {
    currentTime:"Hora actual", now:"Ahora", timeZone:"Zona horaria", calendar:"Calendario", primary:"Destinos principales",
    openWorkbench:"Abrir mesa de trabajo", workflowLead:"Reúne proyectos, borradores, experimentos y tareas en un solo flujo.",
    privateDrive:"Drive privado", driveLead:"Archivos, capacidad y almacenamiento privado.", customizeTheme:"Personalizar tema", themeLead:"Modo, color de acento y vista previa en tiempo real.",
    wishes:"Felicitaciones", sendWish:"Enviar una felicitación", wishLead:"Crea enlaces de cumpleaños o del Festival del Medio Otoño desde Inicio. El nombre es opcional.",
    chooseWish:"Elegir felicitación", birthday:"Feliz cumpleaños", birthdayGreeting:"Felicitación de cumpleaños", midAutumn:"Feliz Festival del Medio Otoño", midAutumnGreeting:"Felicitación del Medio Otoño",
    who:"¿Para quién es?", optional:"Opcional", namePlaceholder:"Escribe un nombre o déjalo vacío", shareRoute:"Ruta compartida", createOpen:"Crear y abrir", openWishes:"Abrir centro de felicitaciones",
    shortcuts:"Accesos directos", common:"Frecuentes", modules:"Módulos", status:"Estado", current:"Actual", environment:"Entorno", appearance:"Apariencia", storage:"Almacenamiento",
    activity:"Actividad", recent:"Reciente", noActivity:"Sin actividad reciente", activityLead:"Los proyectos, borradores y tareas aparecerán aquí cuando estén conectados.", openWorkspace:"Abrir espacio de trabajo",
    week:n=>"Semana "+n, dark:"Oscuro", light:"Claro", system:"Sistema", available:"Disponible", partial:"Parcial",
    shortcutRows:{gpt:"Abrir espacio GPT",admin:"Abrir consola de administración",wishes:"Enlaces de cumpleaños, Medio Otoño y felicitaciones con nombre",account:"Información personal, acceso, seguridad y servicios de cuenta",links:"Enlaces y marcadores",security:"Dispositivos e historial de acceso"},
    moduleRows:[["Cuenta AERTEX","Disponible","Información personal, seguridad, preferencias y servicios de cuenta.","profile","profile"],["AERTEX Drive","Disponible","Archivos privados en la nube.","storage","storage"],["Espacio de trabajo","Parcial","Mesa de trabajo, proyectos, experimentos, borradores y tareas.","workbench","workspace"],["Información","Parcial","Conocimiento, enlaces y resúmenes de cuenta.","info","info"]]
  },
  "el-gr": {
    currentTime:"Τρέχουσα ώρα", now:"Τώρα", timeZone:"Ζώνη ώρας", calendar:"Ημερολόγιο", primary:"Κύριοι προορισμοί",
    openWorkbench:"Άνοιγμα πάγκου εργασίας", workflowLead:"Συγκεντρώστε έργα, πρόχειρα, πειράματα και εργασίες σε μία ροή.",
    privateDrive:"Ιδιωτικό Drive", driveLead:"Αρχεία, χωρητικότητα και ιδιωτική αποθήκευση.", customizeTheme:"Προσαρμογή θέματος", themeLead:"Λειτουργία, χρώμα έμφασης και ζωντανή προεπισκόπηση.",
    wishes:"Ευχές", sendWish:"Στείλτε μια ευχή", wishLead:"Δημιουργήστε συνδέσμους γενεθλίων ή Μεσοφθινοπωρινής Γιορτής από την αρχική σελίδα. Το όνομα είναι προαιρετικό.",
    chooseWish:"Επιλογή ευχής", birthday:"Χρόνια πολλά", birthdayGreeting:"Ευχή γενεθλίων", midAutumn:"Καλή Μεσοφθινοπωρινή Γιορτή", midAutumnGreeting:"Ευχή γιορτής",
    who:"Για ποιον είναι;", optional:"Προαιρετικό", namePlaceholder:"Πληκτρολογήστε όνομα ή αφήστε κενό", shareRoute:"Διαδρομή κοινής χρήσης", createOpen:"Δημιουργία και άνοιγμα", openWishes:"Άνοιγμα κέντρου ευχών",
    shortcuts:"Συντομεύσεις", common:"Συχνά", modules:"Μονάδες", status:"Κατάσταση", current:"Τρέχον", environment:"Περιβάλλον", appearance:"Εμφάνιση", storage:"Αποθήκευση",
    activity:"Δραστηριότητα", recent:"Πρόσφατα", noActivity:"Δεν υπάρχει πρόσφατη δραστηριότητα", activityLead:"Έργα, πρόχειρα και εργασίες θα εμφανίζονται εδώ όταν συνδεθούν.", openWorkspace:"Άνοιγμα χώρου εργασίας",
    week:n=>"Εβδομάδα "+n, dark:"Σκοτεινό", light:"Φωτεινό", system:"Σύστημα", available:"Διαθέσιμο", partial:"Μερικό",
    shortcutRows:{gpt:"Άνοιγμα χώρου GPT",admin:"Άνοιγμα κονσόλας διαχείρισης",wishes:"Σύνδεσμοι γενεθλίων, γιορτής και ονομαστικών ευχών",account:"Προσωπικά στοιχεία, σύνδεση, ασφάλεια και υπηρεσίες λογαριασμού",links:"Σύνδεσμοι και σελιδοδείκτες",security:"Συσκευές και ιστορικό σύνδεσης"},
    moduleRows:[["Λογαριασμός AERTEX","Διαθέσιμο","Προσωπικά στοιχεία, ασφάλεια, προτιμήσεις και υπηρεσίες λογαριασμού.","profile","profile"],["AERTEX Drive","Διαθέσιμο","Ιδιωτικά αρχεία cloud.","storage","storage"],["Χώρος εργασίας","Μερικό","Πάγκος εργασίας, έργα, πειράματα, πρόχειρα και εργασίες.","workbench","workspace"],["Πληροφορίες","Μερικό","Γνώσεις, σύνδεσμοι και περιλήψεις λογαριασμού.","info","info"]]
  },
  "ar-sa": {
    currentTime:"الوقت الحالي", now:"الآن", timeZone:"المنطقة الزمنية", calendar:"التقويم", primary:"الوجهات الرئيسية",
    openWorkbench:"فتح منضدة العمل", workflowLead:"اجمع المشروعات والمسودات والتجارب والمهام في سير عمل واحد.",
    privateDrive:"Drive خاص", driveLead:"الملفات والسعة والتخزين الخاص.", customizeTheme:"تخصيص السمة", themeLead:"الوضع ولون التمييز والمعاينة المباشرة.",
    wishes:"التهاني", sendWish:"أرسل تهنئة", wishLead:"أنشئ روابط تهنئة بعيد الميلاد أو مهرجان منتصف الخريف من الصفحة الرئيسية. الاسم اختياري.",
    chooseWish:"اختر تهنئة", birthday:"عيد ميلاد سعيد", birthdayGreeting:"تهنئة عيد ميلاد", midAutumn:"مهرجان منتصف الخريف سعيد", midAutumnGreeting:"تهنئة منتصف الخريف",
    who:"لمن هذه التهنئة؟", optional:"اختياري", namePlaceholder:"اكتب اسمًا أو اتركه فارغًا", shareRoute:"مسار المشاركة", createOpen:"إنشاء وفتح", openWishes:"فتح مركز التهاني",
    shortcuts:"اختصارات", common:"شائع", modules:"الوحدات", status:"الحالة", current:"الحالي", environment:"البيئة", appearance:"المظهر", storage:"التخزين",
    activity:"النشاط", recent:"الأحدث", noActivity:"لا يوجد نشاط حديث", activityLead:"ستظهر المشروعات والمسودات والمهام هنا بعد ربطها.", openWorkspace:"فتح مساحة العمل",
    week:n=>"الأسبوع "+n, dark:"داكن", light:"فاتح", system:"النظام", available:"متاح", partial:"متاح جزئيًا",
    shortcutRows:{gpt:"فتح مساحة GPT",admin:"فتح وحدة تحكم الإدارة",wishes:"روابط عيد الميلاد ومنتصف الخريف والتهاني المخصصة بالاسم",account:"المعلومات الشخصية وتسجيل الدخول والأمان وخدمات الحساب",links:"الروابط والإشارات المرجعية",security:"الأجهزة وسجل تسجيل الدخول"},
    moduleRows:[["حساب AERTEX","متاح","المعلومات الشخصية والأمان والتفضيلات وخدمات الحساب.","profile","profile"],["AERTEX Drive","متاح","ملفات سحابية خاصة.","storage","storage"],["مساحة العمل","متاح جزئيًا","منضدة العمل والمشروعات والتجارب والمسودات والمهام.","workbench","workspace"],["المعلومات","متاح جزئيًا","المعرفة والروابط وملخصات الحساب.","info","info"]]
  }
};
DASHBOARD_COPY["en-gb"]=DASHBOARD_COPY["en-us"];
DASHBOARD_COPY["en-au"]=DASHBOARD_COPY["en-us"];

export function dashboardContent(zh, options = {}, locale = "") {
  const activeLocale = locale || options?.activeLocale || (zh ? "zh-cn" : "en-us");
  const prefix = "/" + activeLocale;
  const ui = shellText(activeLocale);
  const dc = DASHBOARD_COPY[activeLocale] || DASHBOARD_COPY["en-us"];
  const productLinks = options && typeof options === "object" ? options : {};
  const gptHref = String(productLinks.gptHref || "");
  const adminHref = String(productLinks.adminHref || "");

  const shortcuts = [
    ...(gptHref ? [["AERTEX Intelligence",dc.shortcutRows.gpt,"intelligence",gptHref]] : []),
    ...(adminHref ? [[ui.nav.admin || (activeLocale === "zh-cn" ? "管理员控制台" : "Administration"),dc.shortcutRows.admin,"admin",adminHref]] : []),
    [ui.nav.wishes,dc.shortcutRows.wishes,"wishes",`${prefix}/wishes`],
    [ui.nav.profile,dc.shortcutRows.account,"profile",`${prefix}/profile`],
    [ui.nav.links,dc.shortcutRows.links,"links",`${prefix}/info/links`],
    [ui.nav.security,dc.shortcutRows.security,"security",`${prefix}/settings/security`]
  ];

  const moduleRows = dc.moduleRows.map(row => {
    const href = row[4] === "profile" ? `${prefix}/profile` : row[4] === "storage" ? `${prefix}/settings/storage` : row[4] === "workspace" ? `${prefix}/workspace` : `${prefix}/info`;
    return [row[0],row[1],row[2],row[3],href];
  });

  return `
    <section class="dashboard-welcome">
      <div class="dashboard-welcome-copy">
        <span class="dashboard-eyebrow">AERTEX</span>
        <h2>${activeLocale === "zh-cn" ? "欢迎回来" : activeLocale === "zh-tw" ? "歡迎回來" : activeLocale === "ja-jp" ? "おかえりなさい" : activeLocale === "ko-kr" ? "다시 오신 것을 환영합니다" : activeLocale === "fr-fr" ? "Bon retour" : activeLocale === "es-es" ? "Te damos la bienvenida" : activeLocale === "el-gr" ? "Καλώς ήρθατε ξανά" : activeLocale === "ar-sa" ? "مرحبًا بعودتك" : "Welcome back"}</h2>
        <p>${activeLocale === "zh-cn" ? "继续上次的工作，或者直接打开常用功能。" : activeLocale === "zh-tw" ? "繼續上次的工作，或直接開啟常用功能。" : activeLocale === "ja-jp" ? "前回の作業を続けるか、よく使う機能を開きます。" : activeLocale === "ko-kr" ? "이전 작업을 계속하거나 자주 사용하는 기능을 여세요." : activeLocale === "fr-fr" ? "Reprenez votre travail ou ouvrez un outil courant." : activeLocale === "es-es" ? "Continúa donde lo dejaste o abre una herramienta habitual." : activeLocale === "el-gr" ? "Συνεχίστε από εκεί που σταματήσατε ή ανοίξτε ένα συχνό εργαλείο." : activeLocale === "ar-sa" ? "تابع عملك السابق أو افتح إحدى الأدوات الشائعة." : "Pick up where you left off or open a common tool."}</p>
        <div class="dashboard-welcome-actions">
          <a class="dashboard-primary-action" href="${prefix}/workspace/workbench">${dashboardIcon("workbench")}<span class="dashboard-action-label">${ui.nav.workbench}</span><span class="dashboard-action-arrow">›</span></a>
          <a class="dashboard-secondary-action" href="${prefix}/profile">${dashboardIcon("profile")}<span class="dashboard-action-label">${ui.nav.profile}</span><span class="dashboard-action-arrow">›</span></a>
        </div>
      </div>
      <div class="dashboard-today-card" aria-label="${dc.currentTime}">
        <div class="dashboard-today-main">
          ${dashboardIcon("clock")}
          <div class="dashboard-today-copy">
            <small>${dc.now}</small>
            <strong id="dashboard-live-time">--:--</strong>
            <span id="dashboard-live-date">----</span>
          </div>
        </div>
        <div class="dashboard-today-meta">
          <div><small>${dc.timeZone}</small><strong id="dashboard-live-zone">—</strong></div>
          <div><small>${dc.calendar}</small><strong id="dashboard-live-week">—</strong></div>
        </div>
      </div>
    </section>

    <section class="dashboard-focus" aria-label="${dc.primary}">
      <a class="dashboard-focus-primary" href="${prefix}/workspace/workbench">
        <span class="dashboard-focus-kicker">WORKSPACE</span>
        <span class="dashboard-focus-icon">${dashboardIcon("workbench")}</span>
        <div>
          <h3>${dc.openWorkbench}</h3>
          <p>${dc.workflowLead}</p>
        </div>
        <span class="dashboard-focus-arrow" aria-hidden="true">↗</span>
      </a>
      <div class="dashboard-focus-side">
        <a class="dashboard-focus-card" href="${prefix}/settings/storage">
          <span class="dashboard-focus-card-top">${dashboardIcon("storage")}<b aria-hidden="true">↗</b></span>
          <div><small>AERTEX DRIVE</small><h3>${dc.privateDrive}</h3><p>${dc.driveLead}</p></div>
        </a>
        <a class="dashboard-focus-card is-theme" href="${prefix}/settings/appearance">
          <span class="dashboard-focus-card-top">${dashboardIcon("appearance")}<b aria-hidden="true">↗</b></span>
          <div class="dashboard-focus-swatches" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
          <div><small>THEME STUDIO</small><h3>${dc.customizeTheme}</h3><p>${dc.themeLead}</p></div>
        </a>
      </div>
    </section>

    <section class="dashboard-home-wishes" aria-labelledby="dashboard-home-wishes-title">
      <div class="dashboard-home-wishes-copy">
        <span class="dashboard-eyebrow">${dc.wishes}</span>
        <h2 id="dashboard-home-wishes-title">${dc.sendWish}</h2>
        <p>${dc.wishLead}</p>
      </div>
      <div class="dashboard-home-wishes-builder" data-home-wish-builder>
        <div class="dashboard-home-wish-types" role="radiogroup" aria-label="${dc.chooseWish}">
          <button class="dashboard-home-wish-type is-active" type="button" data-home-wish-kind="birthday" role="radio" aria-checked="true">
            ${dashboardIcon("gift")}<span class="dashboard-home-wish-type-copy"><strong>${dc.birthday}</strong><span>${dc.birthdayGreeting}</span></span>
          </button>
          <button class="dashboard-home-wish-type" type="button" data-home-wish-kind="mid-autumn" role="radio" aria-checked="false">
            ${dashboardIcon("moon")}<span class="dashboard-home-wish-type-copy"><strong>${dc.midAutumn}</strong><span>${dc.midAutumnGreeting}</span></span>
          </button>
        </div>
        <label class="dashboard-home-wish-name">
          <span>${dc.who}<small>${dc.optional}</small></span>
          <input id="dashboard-home-wish-name" type="text" maxlength="36" autocomplete="off" placeholder="${dc.namePlaceholder}">
        </label>
        <div class="dashboard-home-wish-preview">
          <small>${dc.shareRoute}</small>
          <code id="dashboard-home-wish-route">${prefix}/wish/birthday</code>
        </div>
        <div class="dashboard-home-wish-actions">
          <a id="dashboard-home-wish-open" class="dashboard-primary-action" href="${prefix}/wish/birthday">${dashboardIcon("wishes")}<span class="dashboard-action-label">${dc.createOpen}</span><span class="dashboard-action-arrow">›</span></a>
          <a class="dashboard-secondary-action" href="${prefix}/wishes">${dashboardIcon("wishes")}<span class="dashboard-action-label">${dc.openWishes}</span><span class="dashboard-action-arrow">›</span></a>
        </div>
      </div>
    </section>

    <section class="dashboard-section">
      <div class="dashboard-section-head">
        <div><small>${dc.shortcuts}</small><h2>${dc.common}</h2></div>
      </div>
      <div class="dashboard-shortcuts">
        ${shortcuts.map(item => `<a class="dashboard-shortcut" href="${item[3]}">${dashboardIcon(item[2])}<span><strong>${item[0]}</strong><small>${item[1]}</small></span><b aria-hidden="true">›</b></a>`).join("")}
      </div>
    </section>

    <section class="dashboard-split">
      <article class="os-card dashboard-module-card">
        <div class="dashboard-section-head compact">
          <div><small>${dc.modules}</small><h2>${dc.status}</h2></div>
        </div>
        <div class="dashboard-module-list">
          ${moduleRows.map(row => `<a href="${row[4]}">${dashboardIcon(row[3])}<span><strong>${row[0]}</strong><small>${row[2]}</small></span><em>${row[1]}</em><b aria-hidden="true">›</b></a>`).join("")}
        </div>
      </article>

      <article class="os-card dashboard-session-card">
        <div class="dashboard-section-head compact">
          <div><small>${dc.current}</small><h2>${dc.environment}</h2></div>
        </div>
        <div class="dashboard-session-facts">
          <div>${dashboardIcon("appearance")}<span><small>${dc.appearance}</small><strong id="dashboard-theme-label">—</strong></span></div>
          <div>${dashboardIcon("language")}<span><small>${ui.nav.language}</small><strong>${ui.langName}</strong></span></div>
          <div>${dashboardIcon("storage")}<span><small>${dc.storage}</small><strong>AERTEX Drive</strong></span></div>
        </div>
        <a class="dashboard-session-settings" href="${prefix}/settings">${dashboardIcon("settings")}<span class="dashboard-action-label">${ui.nav.settings}</span><span class="dashboard-action-arrow">›</span></a>
      </article>
    </section>

    <section class="os-card dashboard-activity-card">
      <div class="dashboard-section-head compact">
        <div><small>${dc.activity}</small><h2>${dc.recent}</h2></div>
      </div>
      <div class="dashboard-empty-activity">
        <span></span>
        <strong>${dc.noActivity}</strong>
        <p>${dc.activityLead}</p>
        <a class="dashboard-activity-action" href="${prefix}/workspace">${dashboardIcon("workbench")}<span>${dc.openWorkspace}</span><b>›</b></a>
      </div>
    </section>

    <script>
      (() => {
        const time = document.getElementById("dashboard-live-time");
        const date = document.getElementById("dashboard-live-date");
        const zone = document.getElementById("dashboard-live-zone");
        const week = document.getElementById("dashboard-live-week");
        const theme = document.getElementById("dashboard-theme-label");
        const wishNameInput = document.getElementById("dashboard-home-wish-name");
        const wishRoute = document.getElementById("dashboard-home-wish-route");
        const wishOpen = document.getElementById("dashboard-home-wish-open");
        const wishTypeButtons = [...document.querySelectorAll("[data-home-wish-kind]")];
        let wishKind = "birthday";
        const zh = ${zh ? "true" : "false"};
        const locale = ${JSON.stringify(activeLocale)};
        const isoWeek = value => {
          const d = new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
          const day = d.getUTCDay() || 7;
          d.setUTCDate(d.getUTCDate() + 4 - day);
          const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
          return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        };
        const cleanWishName = value => String(value || "")
          .replace(/[\\u0000-\\u001f\\u007f]/g, " ")
          .replace(/\\s+/g, " ")
          .trim()
          .slice(0, 36);
        const paintWish = () => {
          if (!wishRoute || !wishOpen) return;
          const name = cleanWishName(wishNameInput?.value || "");
          const suffix = name ? "?name=" + encodeURIComponent(name) : "";
          const path = ${JSON.stringify(prefix)} + "/wish/" + wishKind + suffix;
          wishRoute.textContent = path;
          wishOpen.href = path;
        };
        wishTypeButtons.forEach(button => button.addEventListener("click", () => {
          wishKind = button.dataset.homeWishKind === "mid-autumn" ? "mid-autumn" : "birthday";
          wishTypeButtons.forEach(item => {
            const active = item.dataset.homeWishKind === wishKind;
            item.classList.toggle("is-active", active);
            item.setAttribute("aria-checked", active ? "true" : "false");
          });
          paintWish();
        }));
        wishNameInput?.addEventListener("input", paintWish);
        paintWish();

        const paint = () => {
          const now = new Date();
          if (time) time.textContent = new Intl.DateTimeFormat(locale, { hour:"2-digit", minute:"2-digit", hour12:false }).format(now);
          if (date) date.textContent = new Intl.DateTimeFormat(locale, { year:"numeric", month:"long", day:"numeric", weekday:"short" }).format(now);
          if (zone) zone.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
          if (week) week.textContent = dc.week(isoWeek(now));
          if (theme) {
            const current = document.documentElement.dataset.theme || "light";
            const mode = window.AERTEXTheme?.getMode?.() || document.documentElement.dataset.themeMode || current;
            const resolved = current === "dark" ? ${JSON.stringify(dc.dark)} : ${JSON.stringify(dc.light)};
            theme.textContent = mode === "system" ? (${JSON.stringify(dc.system)} + " · " + resolved) : resolved;
          }
        };
        paint();
        window.setInterval(paint, 30000);
        new MutationObserver(paint).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme","data-theme-mode","data-accent"]});
      })();
    </script>
  `;
}
