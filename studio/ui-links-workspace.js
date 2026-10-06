/**
 * 【初学者导读】
 * 文件：studio/ui-links-workspace.js
 * 这是 AERTEX 前端 UI 模块（links-workspace）：通常同时包含页面模板、局部状态、DOM 更新、事件绑定以及对后端 API 的调用。
 * 阅读顺序：①先搜索页面上能看到的标题/按钮文字定位 render；②找 render 依赖的 state；③找 state 在哪里被 API/事件更新；④再去后端搜索相同 API 路径。
 * 初学者提醒：HTML 字符串负责结构，CSS class 负责样式，事件监听负责交互，fetch/API 负责数据；这四层出现问题时要分别排查。
 * 修改注意：不要随意改掉已有 id/data-* 属性，它们可能被事件绑定、自动测试或别的模块引用；动态插入用户文本时要继续做转义。
 * 响应式注意：桌面布局正常并不代表窄屏正常，修改结构后至少检查大屏、平板和手机断点。
 */
import { curatedLinksContent } from "./curated-links.js";
import { curatedLinksFavoritesEnhancer } from "./curated-links-favorites.js";
import { normalizeSupportedLocale } from "./locale.js";

const LINKS_WORKSPACE_COPY = {
  "en-us":{invalid:"Enter a valid http(s) link.",unavailable:"Account links are currently unavailable.",creating:"Creating link…",created:"Link created. Opening My Links…",failed:"Could not create the link. Try again later.",empty:"No private links yet.",adminEmpty:"No user-created private links yet.",mineTitle:"My links",adminTitle:"User-created links",mineHint:"These private links belong only to the current account.",owner:"Created by",me:"Created by me",loginRequired:"Sign in before creating a link.",accountPrivate:"private links for this account",noMatches:"No links match your search.",hub:["Account links","Create a saved link","Enter a site you want to save. It will be stored directly in your private account link library.","Enter the link you want to save","Create link","Private library","My links","View private links created by this account.","Public library","Curated links","System picks, projects used in prior chats, tools, services, and official references. Search and filters live on a dedicated page.","curated links · 8 categories","Loading account links"],private:["Private library","My links","This area shows private links created by the current account only.","Back to Saved Links","Search private links","Loading account links…","visible links"],curated:["Public library","Curated links","Browse the complete curated library here with search, category, and source filters.","Back to Saved Links"]},
  "zh-cn":{invalid:"请输入有效的 http(s) 链接。",unavailable:"当前无法读取账号链接。",creating:"正在新建链接…",created:"链接已创建，正在打开“我的链接”…",failed:"新建失败，请稍后重试。",empty:"还没有私人链接。",adminEmpty:"目前还没有任何用户创建私人链接。",mineTitle:"我的链接",adminTitle:"用户创建的链接",mineHint:"这些私人链接仅属于当前账号。",owner:"创建者",me:"我创建的",loginRequired:"请先登录后再新建链接。",accountPrivate:"当前账号私人链接",noMatches:"没有符合搜索条件的链接。",hub:["账号链接","新建收藏链接","输入你想收藏的网址，提交后会直接保存到当前账号的私人链接库。","输入你希望收藏的链接","新建链接","私人链接库","我的链接","查看当前账号创建的私人链接。","公共链接库","精选链接","系统精选、历史对话中使用过的项目、工具、服务和官方资料。搜索和筛选放在独立页面里。","精选链接 · 8 个分类","正在读取账号链接"],private:["私人链接库","我的链接","这里仅展示当前账号创建的私人链接。","返回收藏链接","搜索我的链接","正在读取账号链接…","可见链接"],curated:["公共链接库","精选链接","在独立页面里浏览全部系统精选链接，并使用搜索、分类和来源筛选。","返回收藏链接"]},
  "zh-tw":{invalid:"請輸入有效的 http(s) 連結。",unavailable:"目前無法讀取帳號連結。",creating:"正在建立連結…",created:"連結已建立，正在開啟「我的連結」…",failed:"建立失敗，請稍後再試。",empty:"尚無私人連結。",adminEmpty:"目前尚無使用者建立私人連結。",mineTitle:"我的連結",adminTitle:"使用者建立的連結",mineHint:"這些私人連結只屬於目前帳號。",owner:"建立者",me:"我建立的",loginRequired:"請先登入再建立連結。",accountPrivate:"目前帳號的私人連結",noMatches:"沒有符合搜尋條件的連結。",hub:["帳號連結","建立收藏連結","輸入想收藏的網址，提交後會直接儲存到目前帳號的私人連結庫。","輸入想收藏的連結","建立連結","私人連結庫","我的連結","查看目前帳號建立的私人連結。","公共連結庫","精選連結","系統精選、歷史對話使用過的專案、工具、服務與官方資料。搜尋與篩選放在獨立頁面。","精選連結 · 8 個分類","正在讀取帳號連結"],private:["私人連結庫","我的連結","這裡只顯示目前帳號建立的私人連結。","返回收藏連結","搜尋我的連結","正在讀取帳號連結…","可見連結"],curated:["公共連結庫","精選連結","在獨立頁面瀏覽完整精選連結，並使用搜尋、分類與來源篩選。","返回收藏連結"]},
  "ja-jp":{invalid:"有効な http(s) リンクを入力してください。",unavailable:"現在、アカウントリンクを読み込めません。",creating:"リンクを作成中…",created:"リンクを作成しました。「マイリンク」を開きます…",failed:"リンクを作成できませんでした。後でもう一度お試しください。",empty:"プライベートリンクはまだありません。",adminEmpty:"ユーザー作成のプライベートリンクはまだありません。",mineTitle:"マイリンク",adminTitle:"ユーザー作成リンク",mineHint:"これらのプライベートリンクは現在のアカウントだけに属します。",owner:"作成者",me:"自分が作成",loginRequired:"リンクを作成する前にサインインしてください。",accountPrivate:"このアカウントのプライベートリンク",noMatches:"検索条件に一致するリンクはありません。",hub:["アカウントリンク","保存リンクを作成","保存したいサイトを入力すると、現在のアカウントのプライベートリンクライブラリに直接保存されます。","保存したいリンクを入力","リンクを作成","プライベートライブラリ","マイリンク","このアカウントで作成したプライベートリンクを表示します。","公開ライブラリ","厳選リンク","システム選定、過去のチャットで利用したプロジェクト、ツール、サービス、公式資料をまとめています。検索と絞り込みは専用ページで行えます。","厳選リンク · 8 カテゴリ","アカウントリンクを読み込み中"],private:["プライベートライブラリ","マイリンク","現在のアカウントで作成したプライベートリンクだけを表示します。","保存済みリンクに戻る","プライベートリンクを検索","アカウントリンクを読み込み中…","表示中のリンク"],curated:["公開ライブラリ","厳選リンク","検索、カテゴリ、出典フィルターを使って厳選リンク全体を閲覧します。","保存済みリンクに戻る"]},
  "ko-kr":{invalid:"유효한 http(s) 링크를 입력하세요.",unavailable:"현재 계정 링크를 불러올 수 없습니다.",creating:"링크 만드는 중…",created:"링크를 만들었습니다. 내 링크를 여는 중…",failed:"링크를 만들 수 없습니다. 나중에 다시 시도하세요.",empty:"아직 개인 링크가 없습니다.",adminEmpty:"사용자가 만든 개인 링크가 아직 없습니다.",mineTitle:"내 링크",adminTitle:"사용자 생성 링크",mineHint:"이 개인 링크는 현재 계정에만 속합니다.",owner:"생성자",me:"내가 생성",loginRequired:"링크를 만들기 전에 로그인하세요.",accountPrivate:"현재 계정의 개인 링크",noMatches:"검색 조건에 맞는 링크가 없습니다.",hub:["계정 링크","저장 링크 만들기","저장할 사이트를 입력하면 현재 계정의 개인 링크 라이브러리에 바로 저장됩니다.","저장할 링크 입력","링크 만들기","개인 라이브러리","내 링크","현재 계정에서 만든 개인 링크를 확인합니다.","공개 라이브러리","선별 링크","시스템 추천, 이전 대화의 프로젝트, 도구, 서비스 및 공식 자료를 모았습니다. 검색과 필터는 전용 페이지에서 사용할 수 있습니다.","선별 링크 · 8개 범주","계정 링크 불러오는 중"],private:["개인 라이브러리","내 링크","현재 계정에서 만든 개인 링크만 표시합니다.","저장된 링크로 돌아가기","개인 링크 검색","계정 링크 불러오는 중…","표시 중인 링크"],curated:["공개 라이브러리","선별 링크","검색, 범주 및 출처 필터로 전체 선별 링크 라이브러리를 둘러봅니다.","저장된 링크로 돌아가기"]},
  "fr-fr":{invalid:"Saisissez un lien http(s) valide.",unavailable:"Les liens du compte sont actuellement indisponibles.",creating:"Création du lien…",created:"Lien créé. Ouverture de Mes liens…",failed:"Impossible de créer le lien. Réessayez plus tard.",empty:"Aucun lien privé.",adminEmpty:"Aucun lien privé créé par un utilisateur.",mineTitle:"Mes liens",adminTitle:"Liens créés par les utilisateurs",mineHint:"Ces liens privés appartiennent uniquement au compte actuel.",owner:"Créé par",me:"Créé par moi",loginRequired:"Connectez-vous avant de créer un lien.",accountPrivate:"liens privés de ce compte",noMatches:"Aucun lien ne correspond à la recherche.",hub:["Liens du compte","Créer un lien enregistré","Saisissez un site à enregistrer. Il sera ajouté directement à la bibliothèque privée du compte.","Saisissez le lien à enregistrer","Créer le lien","Bibliothèque privée","Mes liens","Consultez les liens privés créés par ce compte.","Bibliothèque publique","Liens sélectionnés","Sélection du système, projets utilisés dans les conversations, outils, services et références officielles. Recherche et filtres sont disponibles sur une page dédiée.","liens sélectionnés · 8 catégories","Chargement des liens du compte"],private:["Bibliothèque privée","Mes liens","Cette zone affiche uniquement les liens privés créés par le compte actuel.","Retour aux liens enregistrés","Rechercher dans mes liens","Chargement des liens du compte…","liens visibles"],curated:["Bibliothèque publique","Liens sélectionnés","Parcourez toute la bibliothèque avec la recherche et les filtres de catégorie et de source.","Retour aux liens enregistrés"]},
  "es-es":{invalid:"Introduce un enlace http(s) válido.",unavailable:"Los enlaces de la cuenta no están disponibles en este momento.",creating:"Creando enlace…",created:"Enlace creado. Abriendo Mis enlaces…",failed:"No se pudo crear el enlace. Inténtalo más tarde.",empty:"Todavía no hay enlaces privados.",adminEmpty:"Todavía no hay enlaces privados creados por usuarios.",mineTitle:"Mis enlaces",adminTitle:"Enlaces creados por usuarios",mineHint:"Estos enlaces privados pertenecen únicamente a la cuenta actual.",owner:"Creado por",me:"Creado por mí",loginRequired:"Inicia sesión antes de crear un enlace.",accountPrivate:"enlaces privados de esta cuenta",noMatches:"Ningún enlace coincide con la búsqueda.",hub:["Enlaces de la cuenta","Crear enlace guardado","Introduce un sitio para guardarlo directamente en la biblioteca privada de la cuenta.","Introduce el enlace que quieres guardar","Crear enlace","Biblioteca privada","Mis enlaces","Consulta los enlaces privados creados por esta cuenta.","Biblioteca pública","Enlaces seleccionados","Selección del sistema, proyectos usados en conversaciones, herramientas, servicios y referencias oficiales. La búsqueda y los filtros están en una página dedicada.","enlaces seleccionados · 8 categorías","Cargando enlaces de la cuenta"],private:["Biblioteca privada","Mis enlaces","Esta zona muestra únicamente los enlaces privados creados por la cuenta actual.","Volver a Enlaces guardados","Buscar enlaces privados","Cargando enlaces de la cuenta…","enlaces visibles"],curated:["Biblioteca pública","Enlaces seleccionados","Explora toda la biblioteca con búsqueda y filtros de categoría y fuente.","Volver a Enlaces guardados"]},
  "el-gr":{invalid:"Εισαγάγετε έγκυρο σύνδεσμο http(s).",unavailable:"Οι σύνδεσμοι λογαριασμού δεν είναι διαθέσιμοι αυτή τη στιγμή.",creating:"Δημιουργία συνδέσμου…",created:"Ο σύνδεσμος δημιουργήθηκε. Άνοιγμα των συνδέσμων μου…",failed:"Δεν ήταν δυνατή η δημιουργία του συνδέσμου. Δοκιμάστε αργότερα.",empty:"Δεν υπάρχουν ιδιωτικοί σύνδεσμοι ακόμη.",adminEmpty:"Δεν υπάρχουν ακόμη ιδιωτικοί σύνδεσμοι χρηστών.",mineTitle:"Οι σύνδεσμοί μου",adminTitle:"Σύνδεσμοι χρηστών",mineHint:"Αυτοί οι ιδιωτικοί σύνδεσμοι ανήκουν μόνο στον τρέχοντα λογαριασμό.",owner:"Δημιουργήθηκε από",me:"Δημιουργήθηκε από εμένα",loginRequired:"Συνδεθείτε πριν δημιουργήσετε σύνδεσμο.",accountPrivate:"ιδιωτικοί σύνδεσμοι αυτού του λογαριασμού",noMatches:"Δεν υπάρχουν σύνδεσμοι που να ταιριάζουν στην αναζήτηση.",hub:["Σύνδεσμοι λογαριασμού","Δημιουργία αποθηκευμένου συνδέσμου","Εισαγάγετε έναν ιστότοπο για άμεση αποθήκευση στην ιδιωτική βιβλιοθήκη του λογαριασμού.","Εισαγάγετε τον σύνδεσμο","Δημιουργία συνδέσμου","Ιδιωτική βιβλιοθήκη","Οι σύνδεσμοί μου","Δείτε τους ιδιωτικούς συνδέσμους αυτού του λογαριασμού.","Δημόσια βιβλιοθήκη","Επιλεγμένοι σύνδεσμοι","Επιλογές συστήματος, έργα από προηγούμενες συνομιλίες, εργαλεία, υπηρεσίες και επίσημες αναφορές. Η αναζήτηση και τα φίλτρα βρίσκονται σε ειδική σελίδα.","επιλεγμένοι σύνδεσμοι · 8 κατηγορίες","Φόρτωση συνδέσμων λογαριασμού"],private:["Ιδιωτική βιβλιοθήκη","Οι σύνδεσμοί μου","Εμφανίζονται μόνο οι ιδιωτικοί σύνδεσμοι που δημιουργήθηκαν από τον τρέχοντα λογαριασμό.","Πίσω στους αποθηκευμένους συνδέσμους","Αναζήτηση ιδιωτικών συνδέσμων","Φόρτωση συνδέσμων λογαριασμού…","ορατοί σύνδεσμοι"],curated:["Δημόσια βιβλιοθήκη","Επιλεγμένοι σύνδεσμοι","Περιηγηθείτε σε όλη τη βιβλιοθήκη με αναζήτηση και φίλτρα κατηγορίας και πηγής.","Πίσω στους αποθηκευμένους συνδέσμους"]},
  "ar-sa":{invalid:"أدخل رابط http(s) صالحًا.",unavailable:"روابط الحساب غير متاحة حاليًا.",creating:"جارٍ إنشاء الرابط…",created:"تم إنشاء الرابط. جارٍ فتح روابطك…",failed:"تعذر إنشاء الرابط. حاول لاحقًا.",empty:"لا توجد روابط خاصة بعد.",adminEmpty:"لا توجد روابط خاصة أنشأها المستخدمون بعد.",mineTitle:"روابطي",adminTitle:"روابط أنشأها المستخدمون",mineHint:"هذه الروابط الخاصة تخص الحساب الحالي فقط.",owner:"أنشأه",me:"أنشأته أنا",loginRequired:"سجّل الدخول قبل إنشاء رابط.",accountPrivate:"روابط خاصة لهذا الحساب",noMatches:"لا توجد روابط تطابق البحث.",hub:["روابط الحساب","إنشاء رابط محفوظ","أدخل موقعًا تريد حفظه وسيُضاف مباشرة إلى مكتبة الروابط الخاصة بالحساب.","أدخل الرابط الذي تريد حفظه","إنشاء رابط","المكتبة الخاصة","روابطي","اعرض الروابط الخاصة التي أنشأها هذا الحساب.","المكتبة العامة","روابط مختارة","اختيارات النظام ومشروعات المحادثات السابقة والأدوات والخدمات والمراجع الرسمية. البحث وعوامل التصفية في صفحة مستقلة.","روابط مختارة · 8 فئات","جارٍ تحميل روابط الحساب"],private:["المكتبة الخاصة","روابطي","تعرض هذه المنطقة الروابط الخاصة التي أنشأها الحساب الحالي فقط.","العودة إلى الروابط المحفوظة","البحث في الروابط الخاصة","جارٍ تحميل روابط الحساب…","روابط ظاهرة"],curated:["المكتبة العامة","روابط مختارة","تصفح المكتبة الكاملة باستخدام البحث وتصفية الفئة والمصدر.","العودة إلى الروابط المحفوظة"]}
};
LINKS_WORKSPACE_COPY["en-gb"]=LINKS_WORKSPACE_COPY["en-us"]; LINKS_WORKSPACE_COPY["en-au"]=LINKS_WORKSPACE_COPY["en-us"];

function workspaceLocale(zh, locale) {
  return normalizeSupportedLocale(locale) || (zh ? "zh-cn" : "en-us");
}
function localePrefix(zh, locale) {
  return "/" + workspaceLocale(zh, locale);
}

function sharedStyles() {
  return `
    <style>
      .links-hub{display:grid;gap:16px;min-width:0}
      .links-create-card,.links-route-card,.links-detail-shell{border:1px solid var(--border);border-radius:22px;background:var(--card)}
      .links-create-card{padding:24px}
      .links-card-eyebrow{display:block;color:var(--muted);font-size:11px;font-weight:680;letter-spacing:.02em}
      .links-create-card h2,.links-route-card h2,.links-detail-head h2{margin:5px 0 7px;font-size:25px;letter-spacing:-.035em}
      .links-create-card p,.links-route-card p,.links-detail-head p{max-width:860px;margin:0;color:var(--muted);font-size:13px;line-height:1.55}
      .links-quick-form{display:grid;grid-template-columns:minmax(0,1fr);gap:10px;margin-top:18px;max-width:980px}
      .links-quick-input{width:100%;height:48px;min-height:48px;margin:0!important;padding:0 14px!important;border:0!important;border-radius:13px!important;background:var(--fill)!important;color:var(--text)!important;box-shadow:inset 0 0 0 1px var(--border)!important;font-size:14px!important}
      .links-quick-input:focus{box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 14%,transparent),inset 0 0 0 1px var(--primary)!important}
      .links-quick-submit{justify-self:start;width:auto!important;min-width:128px!important;height:48px!important;min-height:48px!important;margin:0!important;padding:0 18px!important;border:0!important;border-radius:13px!important;background:var(--primary)!important;color:#fff!important;font-size:14px!important;font-weight:700!important;box-shadow:none!important;transition:transform 100ms ease-out,filter .12s ease!important}
      .links-quick-submit:hover{filter:brightness(1.04)}.links-quick-submit:active{transform:scale(.98)!important}.links-quick-submit:disabled{opacity:.52}
      .links-quick-status{min-height:18px;margin-top:8px;color:var(--muted);font-size:11px}.links-quick-status.is-error{color:var(--danger)}.links-quick-status.is-success{color:var(--success,#2f8f46)}
      .links-route-card{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:20px;align-items:center;padding:24px;color:var(--text);text-decoration:none;transition:background .12s ease,transform 100ms ease-out}
      .links-route-card:hover{background:var(--fill)}.links-route-card:active{transform:scale(.995)}
      .links-route-meta{display:flex;align-items:center;gap:8px;margin-top:12px;color:var(--muted);font-size:11px}.links-route-meta strong{display:grid;place-items:center;min-width:30px;height:26px;padding:0 9px;border-radius:999px;background:var(--fill);color:var(--text);font-size:12px}
      .links-route-arrow{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:var(--fill);color:var(--primary);font-size:22px;transition:transform 100ms ease-out}.links-route-card:hover .links-route-arrow{transform:translateX(2px)}
      .links-detail-shell{padding:0;overflow:hidden}.links-detail-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;padding:22px 24px;border-bottom:1px solid var(--hairline)}
      .links-detail-back{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 11px;border-radius:10px;background:var(--fill);color:var(--text);text-decoration:none;font-size:12px;font-weight:650}.links-detail-back:hover{background:var(--secondary)}
      .links-detail-body{padding:18px}
      .links-private-toolbar{display:flex;align-items:center;gap:10px;margin-bottom:12px}.links-private-search{width:100%;height:44px;min-height:44px;margin:0!important;padding:0 13px!important;border:0!important;border-radius:12px!important;background:var(--fill)!important;box-shadow:inset 0 0 0 1px var(--border)!important;color:var(--text)!important}
      .links-private-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.links-private-card{display:flex;min-width:0;min-height:150px;flex-direction:column;padding:14px;border:0;border-radius:14px;background:var(--fill);color:var(--text);text-decoration:none;box-shadow:inset 0 0 0 1px var(--border);transition:background .12s ease,transform 100ms ease-out}.links-private-card:hover{background:var(--secondary)}.links-private-card:active{transform:scale(.985)}
      .links-private-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.links-private-card-top strong{font-size:14px;line-height:1.3}.links-private-card-top span{color:var(--primary)}.links-private-card p{margin:8px 0 12px;color:var(--muted);font-size:12.5px;line-height:1.45}.links-private-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:auto;color:var(--quiet)}.links-private-meta span{font-size:10px}.links-private-meta code{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:10px ui-monospace,SFMono-Regular,Menlo,monospace}
      .links-private-empty{display:grid;place-items:center;min-height:180px;padding:28px;border-radius:16px;background:var(--fill);color:var(--muted);font-size:12px;text-align:center}.links-private-empty[hidden]{display:none}
      .links-curated-route .curated-links-shell{gap:14px}.links-curated-route .curated-links-note{margin-bottom:0}
      @media(max-width:980px){.links-private-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:700px){.links-hub{gap:12px}.links-create-card,.links-route-card{padding:18px}.links-quick-submit{width:100%!important}.links-route-card{grid-template-columns:minmax(0,1fr) auto}.links-detail-head{align-items:flex-start;flex-direction:column;padding:18px}.links-detail-body{padding:12px}.links-private-grid{grid-template-columns:1fr}.links-route-arrow{width:38px;height:38px}}
    </style>
  `;
}

// 账户链接客户端脚本：根据 mode 加载私人/社区链接，处理快速新增、搜索和状态提示；所有持久化仍走 User Links API。\nfunction accountLinksScript(zh, mode, locale = "") {
  const code = workspaceLocale(zh, locale);
  const prefix = localePrefix(zh, code);
  const mineHref = `${prefix}/info/links/mine`;
  const strings = LINKS_WORKSPACE_COPY[code] || LINKS_WORKSPACE_COPY["en-us"];

  return `
    <script>
      (() => {
        const mode = ${JSON.stringify(mode)};
        const mineHref = ${JSON.stringify(mineHref)};
        let session = null;
        let links = [];

        function esc(value) { return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
        function normalizeUrl(value) {
          const raw = String(value || '').trim();
          if (!raw) return '';
          const candidate = /^https?:\/\//i.test(raw) ? raw : 'https://' + raw;
          try {
            const parsed = new URL(candidate);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : '';
          } catch { return ''; }
        }
        function inferTitle(value) {
          try {
            const parsed = new URL(value);
            const host = parsed.hostname.replace(/^www\./, '');
            const parts = parsed.pathname.split('/').filter(Boolean);
            const tail = parts.length ? decodeURIComponent(parts.at(-1)).replace(/[-_]+/g, ' ').trim() : '';
            return tail ? host + ' · ' + tail.slice(0, 90) : host;
          } catch { return value.slice(0, 160); }
        }
        function hostname(value) { try { return new URL(value).hostname.replace(/^www\./, ''); } catch { return 'external'; } }
        function authHeaders() { return session?.access_token ? { Authorization: 'Bearer ' + session.access_token } : {}; }

        async function getSession() {
          if (typeof supabaseClient === 'undefined') return null;
          const result = await supabaseClient.auth.getSession();
          return result?.data?.session || null;
        }

        // 获取当前模式链接：使用当前 Supabase session token，请求后端返回已按权限过滤的数据。前端不会自行猜哪些链接“应该可见”。\nasync function fetchLinks() {
          if (!session) return [];
          const response = await fetch('/api/user-links', { headers: { ...authHeaders(), Accept:'application/json' }, cache:'no-store' });
          if (!response.ok) throw new Error('HTTP ' + response.status);
          const payload = await response.json();
          links = Array.isArray(payload.links) ? payload.links : [];
          return links;
        }

        function setStatus(message, kind='') {
          const el = document.getElementById('links-quick-status');
          if (!el) return;
          el.textContent = message;
          el.classList.toggle('is-error', kind === 'error');
          el.classList.toggle('is-success', kind === 'success');
        }

        // 快速新增链接：前端先标准化 URL/标题用于体验，服务端仍会再次清洗并强制 ownerId 为当前用户。\nasync function createQuickLink(event) {
          event.preventDefault();
          const input = document.getElementById('links-quick-url');
          const button = document.getElementById('links-quick-submit');
          if (!session) { setStatus(${JSON.stringify(strings.loginRequired)}, 'error'); return; }
          const url = normalizeUrl(input?.value || '');
          if (!url) { setStatus(${JSON.stringify(strings.invalid)}, 'error'); input?.focus(); return; }
          button.disabled = true;
          setStatus(${JSON.stringify(strings.creating)});
          try {
            const response = await fetch('/api/user-links', {
              method:'POST',
              headers:{ ...authHeaders(), 'Content-Type':'application/json', Accept:'application/json' },
              body:JSON.stringify({ title:inferTitle(url), url, category:'tools', description:'' })
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(payload.error || ('HTTP ' + response.status));
            if (input) input.value = '';
            setStatus(${JSON.stringify(strings.created)}, 'success');
            window.setTimeout(() => { window.location.href = mineHref; }, 420);
          } catch (error) {
            console.error('Quick link creation failed', error);
            setStatus(${JSON.stringify(strings.failed)}, 'error');
            button.disabled = false;
          }
        }

        function renderHubCount() {
          const count = document.getElementById('links-hub-private-count');
          const label = document.getElementById('links-hub-private-label');
          if (count) count.textContent = String(links.length);
          if (label) label.textContent = ${JSON.stringify(strings.accountPrivate)};
        }

        function renderPrivate() {
          const title = document.getElementById('links-private-page-title');
          const hint = document.getElementById('links-private-page-hint');
          const count = document.getElementById('links-private-page-count');
          const grid = document.getElementById('links-private-grid');
          const empty = document.getElementById('links-private-empty');
          const search = document.getElementById('links-private-search');
          if (!grid || !empty) return;
          if (title) title.textContent = ${JSON.stringify(strings.mineTitle)};
          if (hint) hint.textContent = ${JSON.stringify(strings.mineHint)};
          if (count) count.textContent = String(links.length);

          const draw = () => {
            const query = String(search?.value || '').trim().toLocaleLowerCase();
            const visible = links.filter(link => !query || [link.title, link.description, link.url, link.owner_label].join(' ').toLocaleLowerCase().includes(query));
            grid.innerHTML = visible.map(link => {
              const ownerText = link.is_own ? ${JSON.stringify(strings.me)} + ' · ' + (link.owner_label || '') : ${JSON.stringify(strings.owner)} + ' ' + (link.owner_label || '');
              return '<a class="links-private-card" href="' + esc(link.url) + '" target="_blank" rel="noopener noreferrer"><div class="links-private-card-top"><strong>' + esc(link.title) + '</strong><span aria-hidden="true">↗</span></div><p>' + esc(link.description || link.url) + '</p><div class="links-private-meta"><span>' + esc(ownerText) + '</span><code>' + esc(hostname(link.url)) + '</code></div></a>';
            }).join('');
            empty.hidden = visible.length > 0;
            if (!visible.length) empty.textContent = links.length ? ${JSON.stringify(strings.noMatches)} : ${JSON.stringify(strings.empty)};
          };
          search?.addEventListener('input', draw);
          draw();
        }

        async function init() {
          try {
            session = await getSession();
            const submit = document.getElementById('links-quick-submit');
            if (submit) submit.disabled = !session;
            document.getElementById('links-quick-form')?.addEventListener('submit', createQuickLink);
            if (!session) {
              setStatus(${JSON.stringify(strings.loginRequired)}, 'error');
              if (mode === 'private') {
                const empty = document.getElementById('links-private-empty');
                if (empty) empty.textContent = ${JSON.stringify(strings.loginRequired)};
              }
              return;
            }
            await fetchLinks();
            if (mode === 'hub') renderHubCount();
            if (mode === 'private') renderPrivate();
          } catch (error) {
            console.error('Account links initialization failed', error);
            if (mode === 'hub') setStatus(${JSON.stringify(strings.unavailable)}, 'error');
            if (mode === 'private') {
              const empty = document.getElementById('links-private-empty');
              if (empty) empty.textContent = ${JSON.stringify(strings.unavailable)};
            }
          }
        }

        if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', init, { once:true });
        else window.setTimeout(init, 0);
      })();
    </script>
  `;
}

// Links Hub：提供私人、精选、社区等入口和数量摘要，具体列表由各子页面独立加载。\nexport function linksHubContent(zh, locale = "") {
  const code=workspaceLocale(zh,locale),prefix=localePrefix(zh,code),all=LINKS_WORKSPACE_COPY[code]||LINKS_WORKSPACE_COPY["en-us"],copy=all.hub;
  return `${sharedStyles()}
    <div class="links-hub">
      <section class="links-create-card">
        <span class="links-card-eyebrow">${copy[0]}</span><h2>${copy[1]}</h2><p>${copy[2]}</p>
        <form class="links-quick-form" id="links-quick-form"><input class="links-quick-input" id="links-quick-url" type="text" inputmode="url" autocomplete="url" placeholder="${copy[3]}" aria-label="${copy[3]}" required><button class="links-quick-submit" id="links-quick-submit" type="submit" disabled>${copy[4]}</button></form>
        <div class="links-quick-status" id="links-quick-status" aria-live="polite"></div>
      </section>
      <a class="links-route-card" href="${prefix}/info/links/mine"><div><span class="links-card-eyebrow">${copy[5]}</span><h2>${copy[6]}</h2><p>${copy[7]}</p><div class="links-route-meta"><strong id="links-hub-private-count">—</strong><span id="links-hub-private-label">${copy[12]}</span></div></div><span class="links-route-arrow" aria-hidden="true">→</span></a>
      <a class="links-route-card" href="${prefix}/info/links/curated"><div><span class="links-card-eyebrow">${copy[8]}</span><h2>${copy[9]}</h2><p>${copy[10]}</p><div class="links-route-meta"><strong>140</strong><span>${copy[11]}</span></div></div><span class="links-route-arrow" aria-hidden="true">→</span></a>
    </div>
    ${accountLinksScript(zh,"hub",code)}`;
}

export function privateLinksPageContent(zh, locale = "") {
  const code=workspaceLocale(zh,locale),prefix=localePrefix(zh,code),all=LINKS_WORKSPACE_COPY[code]||LINKS_WORKSPACE_COPY["en-us"],copy=all.private;
  return `${sharedStyles()}<section class="links-detail-shell"><header class="links-detail-head"><div><span class="links-card-eyebrow">${copy[0]}</span><h2 id="links-private-page-title">${copy[1]}</h2><p id="links-private-page-hint">${copy[2]}</p></div><a class="links-detail-back" href="${prefix}/info/links">← ${copy[3]}</a></header><div class="links-detail-body"><div class="links-private-toolbar"><input class="links-private-search" id="links-private-search" type="search" autocomplete="off" placeholder="${copy[4]}" aria-label="${copy[4]}"></div><div class="links-route-meta" style="margin:0 0 12px"><strong id="links-private-page-count">0</strong><span>${copy[6]}</span></div><div class="links-private-grid" id="links-private-grid"></div><div class="links-private-empty" id="links-private-empty">${copy[5]}</div></div></section>${accountLinksScript(zh,"private",code)}`;
}

export function curatedLinksPageContent(zh, locale = "") {
  const code=workspaceLocale(zh,locale),prefix=localePrefix(zh,code),all=LINKS_WORKSPACE_COPY[code]||LINKS_WORKSPACE_COPY["en-us"],copy=all.curated;
  return `${sharedStyles()}<section class="links-detail-shell links-curated-route"><header class="links-detail-head"><div><span class="links-card-eyebrow">${copy[0]}</span><h2>${copy[1]}</h2><p>${copy[2]}</p></div><a class="links-detail-back" href="${prefix}/info/links">← ${copy[3]}</a></header><div class="links-detail-body">${curatedLinksContent(zh,code)}${curatedLinksFavoritesEnhancer(zh,code)}</div></section>`;
}
