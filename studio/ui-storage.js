import { MAX_STORAGE_FILE_BYTES } from "./config.js";

const STORAGE_EN = {
  connected:"Connected",checking:"Checking",files:"Files",used:"Cloud storage",refreshed:"Updated",select:"Choose Files",refresh:"Refresh",search:"Search files",name:"File name",type:"Type",size:"Size",uploaded:"Uploaded",actions:"Actions",download:"Download",remove:"Delete",loading:"Loading your private files…",empty:"No files yet. Choose files to upload them to your private storage.",emptyTitle:"No files yet",emptyHint:"Choose files to upload them to your private storage.",noMatches:"No matching files or owners.",partial:"There are many files; this statistic includes only the first 10,000 objects.",uploadIdle:"50 MB maximum per file. Files upload one at a time.",storage:"AERTEX Drive",unavailable:"Storage service is temporarily unavailable.",notAuthorized:"This account is not allowed to use private storage.",signInAgain:"Unable to verify the current session. Refresh the page.",login:"Sign in",deleteConfirm:"Delete “{name}”? This cannot be undone.",uploadComplete:"Uploaded {count} files.",uploadCompleteWithSkipped:"Uploaded {count} files and skipped {skipped} files larger than 50 MB.",uploadFailed:"Upload failed: {message}",uploading:"Uploading {current}/{total} · {name}",deleting:"Deleting {name}…",downloadFailed:"Download failed: {message}",deleteFailed:"Delete failed: {message}",refreshedNow:"Just now",tooLarge:"“{name}” exceeds 50 MB and was not uploaded.",connectionDescription:"AERTEX Drive is your private cloud drive. Files are visible only to the current signed-in account.",userDescription:"AERTEX Drive is your private cloud drive. Files are visible only to the current signed-in account.",quotaExceeded:"Your cloud drive is full. Delete some files before uploading more."
};
const STORAGE_COPY = {
  "en-us":STORAGE_EN,"en-gb":STORAGE_EN,"en-au":STORAGE_EN,
  "zh-cn":{...STORAGE_EN,connected:"已连接",checking:"检查中",files:"文件",used:"云盘空间",refreshed:"最近更新",select:"选择文件",refresh:"刷新",search:"搜索文件名",name:"文件名",type:"类型",size:"大小",uploaded:"上传时间",actions:"操作",download:"下载",remove:"删除",loading:"正在读取你的私人文件…",empty:"还没有文件。选择文件后即可上传到你的私人存储空间。",emptyTitle:"还没有文件",emptyHint:"选择文件后即可上传到你的私人存储空间。",noMatches:"没有匹配的文件或所属账号。",partial:"文件数量较多，当前统计仅包含前 10,000 个对象。",uploadIdle:"每个文件最大 50 MB，文件会逐个上传。",unavailable:"存储服务暂时不可用。",notAuthorized:"当前账号不可使用私人存储。",signInAgain:"暂时无法验证当前登录状态，请刷新页面。",login:"前往登录",deleteConfirm:"确定要删除“{name}”吗？此操作无法撤销。",uploadComplete:"已上传 {count} 个文件。",uploadCompleteWithSkipped:"已上传 {count} 个文件，跳过 {skipped} 个超过 50 MB 的文件。",uploadFailed:"上传失败：{message}",uploading:"正在上传 {current}/{total} · {name}",deleting:"正在删除 {name}…",downloadFailed:"下载失败：{message}",deleteFailed:"删除失败：{message}",refreshedNow:"刚刚",tooLarge:"“{name}”超过 50 MB，未上传。",connectionDescription:"AERTEX Drive 是你的私人云盘。文件仅对当前账号可见，并通过登录状态安全存取。",userDescription:"AERTEX Drive 是你的私人云盘。文件仅对当前账号可见，并通过登录状态安全存取。",quotaExceeded:"云盘空间已满，请删除部分文件后再上传。"},
  "zh-tw":{...STORAGE_EN,connected:"已連線",checking:"檢查中",files:"檔案",used:"雲端空間",refreshed:"最近更新",select:"選擇檔案",refresh:"重新整理",search:"搜尋檔案",name:"檔案名稱",type:"類型",size:"大小",uploaded:"上傳時間",actions:"操作",download:"下載",remove:"刪除",loading:"正在讀取你的私人檔案…",empty:"尚無檔案。選擇檔案後即可上傳到私人儲存空間。",emptyTitle:"尚無檔案",emptyHint:"選擇檔案後即可上傳到私人儲存空間。",noMatches:"沒有符合的檔案。",uploadIdle:"每個檔案上限 50 MB，會逐一上傳。",unavailable:"儲存服務暫時無法使用。",notAuthorized:"目前帳號無法使用私人儲存空間。",signInAgain:"暫時無法驗證目前登入狀態，請重新整理頁面。",login:"前往登入",deleteConfirm:"確定要刪除「{name}」嗎？此操作無法復原。",uploadComplete:"已上傳 {count} 個檔案。",uploadFailed:"上傳失敗：{message}",uploading:"正在上傳 {current}/{total} · {name}",deleting:"正在刪除 {name}…",downloadFailed:"下載失敗：{message}",deleteFailed:"刪除失敗：{message}",refreshedNow:"剛剛",tooLarge:"「{name}」超過 50 MB，未上傳。",connectionDescription:"AERTEX Drive 是你的私人雲端硬碟，檔案僅目前帳號可見。",userDescription:"AERTEX Drive 是你的私人雲端硬碟，檔案僅目前帳號可見。",quotaExceeded:"雲端硬碟空間已滿，請先刪除部分檔案。"},
  "ja-jp":{...STORAGE_EN,connected:"接続済み",checking:"確認中",files:"ファイル",used:"クラウド使用量",refreshed:"更新",select:"ファイルを選択",refresh:"更新",search:"ファイルを検索",name:"ファイル名",type:"種類",size:"サイズ",uploaded:"アップロード日時",actions:"操作",download:"ダウンロード",remove:"削除",loading:"プライベートファイルを読み込み中…",empty:"まだファイルがありません。ファイルを選択してアップロードできます。",emptyTitle:"ファイルはまだありません",emptyHint:"ファイルを選択してプライベートストレージへアップロードします。",noMatches:"一致するファイルがありません。",uploadIdle:"1 ファイル最大 50 MB。順番にアップロードします。",unavailable:"ストレージサービスは一時的に利用できません。",notAuthorized:"このアカウントではプライベートストレージを利用できません。",signInAgain:"セッションの有効期限が切れました。再度サインインしてください。",login:"サインイン",deleteConfirm:"「{name}」を削除しますか？元に戻せません。",uploadComplete:"{count} 件のファイルをアップロードしました。",uploadFailed:"アップロード失敗: {message}",uploading:"アップロード中 {current}/{total} · {name}",deleting:"{name} を削除中…",downloadFailed:"ダウンロード失敗: {message}",deleteFailed:"削除失敗: {message}",refreshedNow:"たった今",tooLarge:"「{name}」は 50 MB を超えているためアップロードされませんでした。",connectionDescription:"AERTEX Drive はあなた専用のクラウドドライブです。ファイルは現在のアカウントだけに表示されます。",userDescription:"AERTEX Drive はあなた専用のクラウドドライブです。",quotaExceeded:"クラウドドライブがいっぱいです。不要なファイルを削除してください。"},
  "ko-kr":{...STORAGE_EN,connected:"연결됨",checking:"확인 중",files:"파일",used:"클라우드 저장 공간",refreshed:"업데이트",select:"파일 선택",refresh:"새로 고침",search:"파일 검색",name:"파일 이름",type:"유형",size:"크기",uploaded:"업로드 시간",actions:"작업",download:"다운로드",remove:"삭제",loading:"개인 파일을 불러오는 중…",empty:"아직 파일이 없습니다. 파일을 선택해 개인 저장 공간에 업로드하세요.",emptyTitle:"아직 파일 없음",emptyHint:"파일을 선택해 개인 저장 공간에 업로드하세요.",noMatches:"일치하는 파일이 없습니다.",uploadIdle:"파일당 최대 50 MB이며 하나씩 업로드됩니다.",unavailable:"저장 서비스를 일시적으로 사용할 수 없습니다.",notAuthorized:"이 계정은 개인 저장 공간을 사용할 수 없습니다.",signInAgain:"세션이 만료되었습니다. 다시 로그인하세요.",login:"로그인",deleteConfirm:"“{name}”을 삭제할까요? 되돌릴 수 없습니다.",uploadComplete:"{count}개 파일을 업로드했습니다.",uploadFailed:"업로드 실패: {message}",uploading:"업로드 중 {current}/{total} · {name}",deleting:"{name} 삭제 중…",downloadFailed:"다운로드 실패: {message}",deleteFailed:"삭제 실패: {message}",refreshedNow:"방금",tooLarge:"“{name}”이 50 MB를 초과해 업로드되지 않았습니다.",connectionDescription:"AERTEX Drive는 개인 클라우드 드라이브입니다. 파일은 현재 계정에만 표시됩니다.",userDescription:"AERTEX Drive는 개인 클라우드 드라이브입니다.",quotaExceeded:"클라우드 드라이브가 가득 찼습니다. 일부 파일을 삭제하세요."},
  "fr-fr":{...STORAGE_EN,connected:"Connecté",checking:"Vérification",files:"Fichiers",used:"Stockage cloud",refreshed:"Mis à jour",select:"Choisir des fichiers",refresh:"Actualiser",search:"Rechercher des fichiers",name:"Nom du fichier",type:"Type",size:"Taille",uploaded:"Téléversé",actions:"Actions",download:"Télécharger",remove:"Supprimer",loading:"Chargement de vos fichiers privés…",empty:"Aucun fichier. Choisissez des fichiers à téléverser.",emptyTitle:"Aucun fichier",emptyHint:"Choisissez des fichiers à téléverser dans votre espace privé.",noMatches:"Aucun fichier correspondant.",uploadIdle:"50 Mo maximum par fichier. Les fichiers sont téléversés un par un.",unavailable:"Le service de stockage est temporairement indisponible.",notAuthorized:"Ce compte ne peut pas utiliser le stockage privé.",signInAgain:"Votre session a expiré. Reconnectez-vous.",login:"Se connecter",deleteConfirm:"Supprimer « {name} » ? Cette action est irréversible.",uploadComplete:"{count} fichiers téléversés.",uploadFailed:"Échec du téléversement : {message}",uploading:"Téléversement {current}/{total} · {name}",deleting:"Suppression de {name}…",downloadFailed:"Échec du téléchargement : {message}",deleteFailed:"Échec de la suppression : {message}",refreshedNow:"À l’instant",tooLarge:"« {name} » dépasse 50 Mo et n’a pas été téléversé.",connectionDescription:"AERTEX Drive est votre espace cloud privé. Les fichiers ne sont visibles que par le compte actuel.",userDescription:"AERTEX Drive est votre espace cloud privé.",quotaExceeded:"Votre espace cloud est plein. Supprimez des fichiers avant d’en ajouter."},
  "es-es":{...STORAGE_EN,connected:"Conectado",checking:"Comprobando",files:"Archivos",used:"Almacenamiento en la nube",refreshed:"Actualizado",select:"Elegir archivos",refresh:"Actualizar",search:"Buscar archivos",name:"Nombre del archivo",type:"Tipo",size:"Tamaño",uploaded:"Subido",actions:"Acciones",download:"Descargar",remove:"Eliminar",loading:"Cargando tus archivos privados…",empty:"Todavía no hay archivos. Elige archivos para subirlos.",emptyTitle:"Todavía no hay archivos",emptyHint:"Elige archivos para subirlos a tu almacenamiento privado.",noMatches:"No hay archivos coincidentes.",uploadIdle:"Máximo 50 MB por archivo. Se suben uno a uno.",unavailable:"El servicio de almacenamiento no está disponible temporalmente.",notAuthorized:"Esta cuenta no puede usar almacenamiento privado.",signInAgain:"La sesión ha caducado. Inicia sesión de nuevo.",login:"Iniciar sesión",deleteConfirm:"¿Eliminar «{name}»? Esta acción no se puede deshacer.",uploadComplete:"Se subieron {count} archivos.",uploadFailed:"Error de subida: {message}",uploading:"Subiendo {current}/{total} · {name}",deleting:"Eliminando {name}…",downloadFailed:"Error de descarga: {message}",deleteFailed:"Error al eliminar: {message}",refreshedNow:"Ahora mismo",tooLarge:"«{name}» supera los 50 MB y no se subió.",connectionDescription:"AERTEX Drive es tu nube privada. Los archivos solo son visibles para la cuenta actual.",userDescription:"AERTEX Drive es tu nube privada.",quotaExceeded:"Tu unidad está llena. Elimina algunos archivos antes de subir más."},
  "el-gr":{...STORAGE_EN,connected:"Συνδεδεμένο",checking:"Έλεγχος",files:"Αρχεία",used:"Χώρος cloud",refreshed:"Ενημερώθηκε",select:"Επιλογή αρχείων",refresh:"Ανανέωση",search:"Αναζήτηση αρχείων",name:"Όνομα αρχείου",type:"Τύπος",size:"Μέγεθος",uploaded:"Μεταφορτώθηκε",actions:"Ενέργειες",download:"Λήψη",remove:"Διαγραφή",loading:"Φόρτωση ιδιωτικών αρχείων…",empty:"Δεν υπάρχουν ακόμη αρχεία. Επιλέξτε αρχεία για μεταφόρτωση.",emptyTitle:"Δεν υπάρχουν αρχεία",emptyHint:"Επιλέξτε αρχεία για μεταφόρτωση στον ιδιωτικό χώρο.",noMatches:"Δεν βρέθηκαν αρχεία.",uploadIdle:"Μέγιστο 50 MB ανά αρχείο. Τα αρχεία μεταφορτώνονται διαδοχικά.",unavailable:"Η υπηρεσία αποθήκευσης δεν είναι προσωρινά διαθέσιμη.",notAuthorized:"Αυτός ο λογαριασμός δεν μπορεί να χρησιμοποιήσει ιδιωτικό χώρο.",signInAgain:"Η συνεδρία έληξε. Συνδεθείτε ξανά.",login:"Σύνδεση",deleteConfirm:"Διαγραφή του «{name}»; Δεν είναι δυνατή η αναίρεση.",uploadComplete:"Μεταφορτώθηκαν {count} αρχεία.",uploadFailed:"Αποτυχία μεταφόρτωσης: {message}",uploading:"Μεταφόρτωση {current}/{total} · {name}",deleting:"Διαγραφή {name}…",downloadFailed:"Αποτυχία λήψης: {message}",deleteFailed:"Αποτυχία διαγραφής: {message}",refreshedNow:"Μόλις τώρα",tooLarge:"Το «{name}» υπερβαίνει τα 50 MB και δεν μεταφορτώθηκε.",connectionDescription:"Το AERTEX Drive είναι ο ιδιωτικός σας χώρος cloud. Τα αρχεία είναι ορατά μόνο στον τρέχοντα λογαριασμό.",userDescription:"Το AERTEX Drive είναι ο ιδιωτικός σας χώρος cloud.",quotaExceeded:"Ο χώρος cloud είναι πλήρης. Διαγράψτε αρχεία πριν προσθέσετε άλλα."},
  "ar-sa":{...STORAGE_EN,connected:"متصل",checking:"جارٍ التحقق",files:"الملفات",used:"التخزين السحابي",refreshed:"آخر تحديث",select:"اختيار ملفات",refresh:"تحديث",search:"البحث في الملفات",name:"اسم الملف",type:"النوع",size:"الحجم",uploaded:"وقت الرفع",actions:"الإجراءات",download:"تنزيل",remove:"حذف",loading:"جارٍ تحميل ملفاتك الخاصة…",empty:"لا توجد ملفات بعد. اختر ملفات لرفعها إلى مساحة التخزين الخاصة.",emptyTitle:"لا توجد ملفات بعد",emptyHint:"اختر ملفات لرفعها إلى مساحة التخزين الخاصة.",noMatches:"لا توجد ملفات مطابقة.",uploadIdle:"الحد الأقصى 50 MB لكل ملف، ويتم الرفع واحدًا تلو الآخر.",unavailable:"خدمة التخزين غير متاحة مؤقتًا.",notAuthorized:"هذا الحساب غير مخول لاستخدام التخزين الخاص.",signInAgain:"انتهت صلاحية الجلسة. سجّل الدخول مرة أخرى.",login:"تسجيل الدخول",deleteConfirm:"هل تريد حذف «{name}»؟ لا يمكن التراجع عن ذلك.",uploadComplete:"تم رفع {count} ملف.",uploadFailed:"فشل الرفع: {message}",uploading:"جارٍ الرفع {current}/{total} · {name}",deleting:"جارٍ حذف {name}…",downloadFailed:"فشل التنزيل: {message}",deleteFailed:"فشل الحذف: {message}",refreshedNow:"الآن",tooLarge:"يتجاوز «{name}» حجم 50 MB ولم يتم رفعه.",connectionDescription:"AERTEX Drive هو محركك السحابي الخاص. الملفات مرئية للحساب الحالي فقط.",userDescription:"AERTEX Drive هو محركك السحابي الخاص.",quotaExceeded:"مساحة التخزين ممتلئة. احذف بعض الملفات قبل رفع المزيد."}
};

export function storageSettingsContent(zh, locale = "") {
  const copy = STORAGE_COPY[locale] || STORAGE_COPY[zh ? "zh-cn" : "en-us"];

  return `
    <style>
      .storage-capacity-track{height:5px;margin-top:9px;overflow:hidden;border-radius:999px;background:color-mix(in srgb,var(--border) 74%,transparent)}
      .storage-capacity-track>span{display:block;width:0;height:100%;border-radius:inherit;background:var(--primary);transition:width .28s ease}
    </style>
    <section id="storage-manager" class="storage-manager">
      <section class="storage-overview-panel">
        <div class="storage-overview-copy">
          <div class="storage-service-line">
            <span class="storage-status-dot" aria-hidden="true"></span>
            <strong>${copy.storage}</strong>
            <span id="storage-connection" class="storage-connection-state">${copy.checking}</span>
          </div>
          <p id="storage-description">${copy.connectionDescription}</p>
        </div>
        <div class="storage-overview-stats">
          <div class="storage-stat">
            <span>${copy.files}</span>
            <strong id="storage-file-count">—</strong>
          </div>
          <div class="storage-stat">
            <span>${copy.used}</span>
            <strong id="storage-used-bytes">—</strong>
            <div class="storage-capacity-track" aria-hidden="true"><span id="storage-capacity-fill"></span></div>
          </div>
          <div class="storage-refresh-group">
            <div>
              <span>${copy.refreshed}</span>
              <strong id="storage-refreshed-at">—</strong>
            </div>
            <button id="storage-refresh-button" class="storage-refresh-button" type="button" aria-label="${copy.refresh}" title="${copy.refresh}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6v5h-5"/><path d="M19 11a7 7 0 1 0 1 4"/></svg>
            </button>
          </div>
        </div>
      </section>

      <section class="storage-toolbar">
        <button id="storage-upload-button" class="storage-upload-button" type="button">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
          <span>${copy.select}</span>
        </button>
        <input id="storage-file-input" type="file" multiple hidden>
        <label class="storage-search-shell">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg>
          <input id="storage-search" class="storage-search" type="search" placeholder="${copy.search}" aria-label="${copy.search}" autocomplete="off">
        </label>
      </section>

      <div class="storage-feedback">
        <p id="storage-upload-status" class="storage-upload-status">${copy.uploadIdle}</p>
        <p id="storage-api-status" class="storage-api-status" role="status"></p>
      </div>

      <section class="storage-browser">
        <div class="storage-table" role="table" aria-label="${copy.files}">
          <div class="storage-file-row storage-file-head" role="row">
            <span role="columnheader">${copy.name}</span>
            <span role="columnheader">${copy.type}</span>
            <span role="columnheader">${copy.size}</span>
            <span role="columnheader">${copy.uploaded}</span>
            <span role="columnheader">${copy.actions}</span>
          </div>
          <div id="storage-file-list" class="storage-file-list" role="rowgroup"></div>
        </div>
        <p id="storage-partial-notice" class="storage-partial-notice" hidden>${copy.partial}</p>
      </section>
    </section>
  `;
}
export function storageClientScript(zh, loginUrl, locale = "") {
  const copy = STORAGE_COPY[locale] || STORAGE_COPY[zh ? "zh-cn" : "en-us"];

  return `
    <script>
      (() => {
        const copy = ${JSON.stringify(copy)};
        const maximumBytes = ${MAX_STORAGE_FILE_BYTES};
        const STORAGE_CACHE_PREFIX = "qssed-storage-v2:";
        const root = document.getElementById("storage-manager");
        if (!root) return;

        const fileInput = document.getElementById("storage-file-input");
        const uploadButton = document.getElementById("storage-upload-button");
        const refreshButton = document.getElementById("storage-refresh-button");
        const searchInput = document.getElementById("storage-search");
        const fileList = document.getElementById("storage-file-list");
        const apiStatus = document.getElementById("storage-api-status");
        const uploadStatus = document.getElementById("storage-upload-status");
        const partialNotice = document.getElementById("storage-partial-notice");
        const connection = document.getElementById("storage-connection");
        const fileCount = document.getElementById("storage-file-count");
        const usedBytes = document.getElementById("storage-used-bytes");
        const capacityFill = document.getElementById("storage-capacity-fill");
        const refreshedAt = document.getElementById("storage-refreshed-at");
        const storageDescription = document.getElementById("storage-description");

        let files = [];
        let partial = false;
        let currentFilter = "";
        let isBusy = false;
        let currentUserId = "";
        let storageCacheFingerprint = "";
        let hasStorageSnapshot = false;
        let refreshSequence = 0;

        class SessionExpiredError extends Error {}
        class StorageForbiddenError extends Error {}

        function message(template, values) {
          return Object.entries(values || {}).reduce((text, entry) => text.replace("{" + entry[0] + "}", entry[1]), template);
        }

        function formatBytes(bytes) {
          const value = Number(bytes) || 0;
          if (value < 1024) return value + " B";
          const units = ["KB", "MB", "GB", "TB"];
          let size = value / 1024;
          let index = 0;
          while (size >= 1024 && index < units.length - 1) { size /= 1024; index += 1; }
          return size.toLocaleString(undefined, { maximumFractionDigits: size >= 100 ? 0 : 1 }) + " " + units[index];
        }

        function formatDate(value) {
          if (!value) return "—";
          const date = new Date(value);
          return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
        }

        function formatRefreshTime(value) {
          const timestamp = Number(value) || Date.now();
          const date = new Date(timestamp);
          if (Number.isNaN(date.getTime())) return copy.refreshedNow;
          const age = Date.now() - timestamp;
          if (age < 60000) return copy.refreshedNow;
          const now = new Date();
          if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
          }
          return date.toLocaleDateString();
        }

        function setApiStatus(text, kind) {
          apiStatus.textContent = text || "";
          apiStatus.className = "storage-api-status" + (kind ? " is-" + kind : "");
        }

        function setUploadStatus(text, kind) {
          uploadStatus.textContent = text || "";
          uploadStatus.className = "storage-upload-status" + (kind ? " is-" + kind : "");
        }

        function storageCacheKey(userId) {
          return STORAGE_CACHE_PREFIX + String(userId || "");
        }

        function readStorageCache(userId) {
          if (!userId) return null;
          try {
            const parsed = JSON.parse(sessionStorage.getItem(storageCacheKey(userId)) || "null");
            return parsed && parsed.data && Array.isArray(parsed.data.files) ? parsed : null;
          } catch {
            return null;
          }
        }

        function writeStorageCache(data, fingerprint, refreshedAtValue) {
          if (!currentUserId) return;
          try {
            sessionStorage.setItem(storageCacheKey(currentUserId), JSON.stringify({
              fingerprint,
              refreshedAt: refreshedAtValue,
              data
            }));
          } catch {}
        }

        function clearStorageCache() {
          if (!currentUserId) return;
          try { sessionStorage.removeItem(storageCacheKey(currentUserId)); } catch {}
        }

        function storageFingerprint(data) {
          const normalizedFiles = (Array.isArray(data?.files) ? data.files : []).map(file => [
            file?.id || "",
            file?.name || "",
            file?.mediaType || file?.contentType || "",
            Number(file?.size) || 0,
            file?.uploadedAt || ""
          ]);
          return JSON.stringify([
            Number(data?.file_count) || 0,
            Number(data?.visible_used_bytes ?? data?.used_bytes) || 0,
            Number(data?.quota_bytes) || 0,
            Boolean(data?.partial),
            normalizedFiles
          ]);
        }

        function resetMetrics() {
          fileCount.textContent = "—";
          usedBytes.textContent = "—";
          if (capacityFill) capacityFill.style.width = "0%";
          refreshedAt.textContent = "—";
          partial = false;
          partialNotice.hidden = true;
        }

        function setBusy(busy) {
          isBusy = busy;
          const unavailable = root.classList.contains("is-unavailable");
          uploadButton.disabled = busy || unavailable;
          refreshButton.disabled = busy;
          fileInput.disabled = busy || unavailable;
          root.querySelectorAll(".storage-action-button,.storage-empty-upload").forEach(button => {
            button.disabled = busy || unavailable;
          });
        }

        function clearStorageView() {
          resetMetrics();
          files = [];
          hasStorageSnapshot = false;
          renderFiles();
        }

        function showSessionExpired() {
          clearStorageCache();
          clearStorageView();
          root.classList.remove("is-checking", "is-stale");
          root.classList.add("is-unavailable");
          setApiStatus(copy.signInAgain, "error");
          connection.textContent = copy.signInAgain;
        }

        function showStorageForbidden() {
          clearStorageCache();
          clearStorageView();
          root.classList.remove("is-checking", "is-stale");
          root.classList.add("is-unavailable");
          connection.textContent = copy.notAuthorized;
          setApiStatus(copy.notAuthorized, "error");
        }

        async function storageRequest(path, options) {
          const headers = new Headers(options?.headers || {});
          let response;
          try {
            response = await fetch(path, { ...options, headers, credentials: "same-origin", cache: "no-store" });
          } catch {
            throw new Error(copy.unavailable);
          }
          if (response.status === 401) throw new SessionExpiredError();
          if (response.status === 403) throw new StorageForbiddenError();
          if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            const error = new Error(payload?.error || copy.unavailable);
            error.status = response.status;
            error.code = payload?.code || "";
            throw error;
          }
          return response;
        }

        function visibleFiles() {
          const query = currentFilter.trim().toLocaleLowerCase();
          if (!query) return files;
          return files.filter(file => [
            file?.name,
            file?.mediaType,
            file?.contentType
          ].some(value => String(value || "").toLocaleLowerCase().includes(query)));
        }

        function renderFiles() {
          const visible = visibleFiles();
          fileList.replaceChildren();

          if (!visible.length) {
            if (files.length) {
              const noMatches = document.createElement("div");
              noMatches.className = "storage-empty storage-empty-compact";
              noMatches.textContent = copy.noMatches;
              fileList.append(noMatches);
              return;
            }

            const empty = document.createElement("div");
            empty.className = "storage-empty";

            const icon = document.createElement("div");
            icon.className = "storage-empty-icon";
            icon.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5h5l1.5 2H20v8.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7.5Z"/><path d="M4 7.5V6a2 2 0 0 1 2-2h3l1.5 2H18a2 2 0 0 1 2 2v1.5"/></svg>';

            const title = document.createElement("strong");
            title.textContent = copy.emptyTitle;

            const hint = document.createElement("span");
            hint.textContent = copy.emptyHint;

            const choose = document.createElement("button");
            choose.type = "button";
            choose.className = "storage-empty-upload";
            choose.textContent = copy.select;
            choose.addEventListener("click", () => fileInput.click());

            empty.append(icon, title, hint, choose);
            fileList.append(empty);
            return;
          }

          visible.forEach(file => {
            const row = document.createElement("div");
            row.className = "storage-file-row";
            row.setAttribute("role", "row");

            const name = document.createElement("strong");
            name.className = "storage-file-name";
            name.textContent = file.name;
            name.title = file.name;

            const type = document.createElement("span");
            type.textContent = file.mediaType || file.contentType || "application/octet-stream";

            const size = document.createElement("span");
            size.textContent = formatBytes(file.size);

            const uploaded = document.createElement("time");
            uploaded.dateTime = file.uploadedAt || "";
            uploaded.textContent = formatDate(file.uploadedAt);

            const actions = document.createElement("div");
            actions.className = "storage-actions";

            const download = document.createElement("button");
            download.type = "button";
            download.className = "storage-action-button";
            download.textContent = copy.download;
            download.addEventListener("click", () => void downloadFile(file, download));

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "storage-action-button is-danger";
            remove.textContent = copy.remove;
            remove.addEventListener("click", () => void deleteFile(file, remove));

            actions.append(download, remove);
            row.append(name, type, size, uploaded, actions);
            fileList.append(row);
          });
        }

        function renderMetrics(data, refreshedAtValue) {
          fileCount.textContent = String(Number(data.file_count) || 0) + (data.partial ? "+" : "");
          const used = Number(data.used_bytes ?? data.visible_used_bytes) || 0;
          const quota = Number(data.quota_bytes) || 0;
          usedBytes.textContent = quota > 0 ? (formatBytes(used) + " / " + formatBytes(quota)) : formatBytes(used);
          if (capacityFill) {
            const percentage = quota > 0 ? Math.min(100, Math.max(0, used / quota * 100)) : 0;
            capacityFill.style.width = percentage.toFixed(2) + "%";
          }
          refreshedAt.textContent = formatRefreshTime(refreshedAtValue);
          partial = Boolean(data.partial);
          partialNotice.hidden = !partial;
          if (partial) partialNotice.textContent = copy.partial;
        }

        function applyStorageData(data, refreshedAtValue) {
          if (storageDescription) storageDescription.textContent = copy.userDescription;
          files = Array.isArray(data?.files) ? data.files : [];
          renderMetrics(data || {}, refreshedAtValue);
          renderFiles();
          hasStorageSnapshot = true;
        }

        async function refreshFiles(options) {
          const config = options || {};
          const force = Boolean(config.force);
          const silent = Boolean(config.silent);
          if (isBusy && !force) return;

          const sequence = ++refreshSequence;
          root.classList.remove("is-unavailable", "is-stale");

          if (!silent) {
            root.classList.add("is-checking");
            refreshButton.classList.add("is-refreshing");
            refreshButton.setAttribute("aria-busy", "true");
            setBusy(true);
            setApiStatus(copy.loading, "loading");
          }

          try {
            const response = await storageRequest("/api/storage/files", { method: "GET" });
            const data = await response.json();
            if (sequence !== refreshSequence) return;

            const responseUserId = String(data?.user_id || "");
            if (responseUserId && responseUserId !== currentUserId) {
              if (currentUserId) clearStorageCache();
              currentUserId = responseUserId;
              storageCacheFingerprint = "";
            }

            const fingerprint = storageFingerprint(data);
            const changed = fingerprint !== storageCacheFingerprint;
            const refreshedAtValue = Date.now();

            storageCacheFingerprint = fingerprint;
            writeStorageCache(data, fingerprint, refreshedAtValue);

            if (changed || !hasStorageSnapshot || !config.preservePaint) {
              applyStorageData(data, refreshedAtValue);
            } else {
              refreshedAt.textContent = formatRefreshTime(refreshedAtValue);
            }

            root.classList.remove("is-checking", "is-unavailable", "is-stale");
            connection.textContent = copy.connected;
            setApiStatus("", "");
          } catch (error) {
            if (sequence !== refreshSequence) return;
            root.classList.remove("is-checking");

            if (error instanceof SessionExpiredError) {
              showSessionExpired();
            } else if (error instanceof StorageForbiddenError) {
              showStorageForbidden();
            } else if (silent && hasStorageSnapshot) {
              root.classList.add("is-stale");
              setApiStatus(error.message || copy.unavailable, "error");
            } else {
              clearStorageView();
              root.classList.add("is-unavailable");
              connection.textContent = copy.unavailable;
              setApiStatus(error.message || copy.unavailable, "error");
            }
          } finally {
            if (!silent) {
              refreshButton.classList.remove("is-refreshing");
              refreshButton.removeAttribute("aria-busy");
              setBusy(false);
            }
          }
        }

        async function initializeStorage() {
          root.classList.add("is-checking");
          setApiStatus(copy.loading, "loading");
          await refreshFiles({ force: true });
        }

        async function uploadFiles(selected) {
          const queue = Array.from(selected || []);
          if (!queue.length || isBusy) return;

          refreshSequence += 1;
          const oversized = queue.filter(file => file.size > maximumBytes);
          const uploadQueue = queue.filter(file => file.size <= maximumBytes);

          if (!uploadQueue.length) {
            setUploadStatus(message(copy.tooLarge, { name: oversized[0]?.name || "file" }), "error");
            fileInput.value = "";
            return;
          }

          setBusy(true);
          let completed = 0;

          try {
            for (let index = 0; index < uploadQueue.length; index += 1) {
              const file = uploadQueue[index];
              setUploadStatus(message(copy.uploading, { current: index + 1, total: uploadQueue.length, name: file.name }), "loading");
              const response = await storageRequest("/api/storage/upload?name=" + encodeURIComponent(file.name), {
                method: "POST",
                headers: {
                  "Content-Type": file.type || "application/octet-stream",
                  "X-File-Size": String(file.size)
                },
                body: file
              });
              if (response.status === 201) completed += 1;
            }

            setUploadStatus(
              oversized.length
                ? message(copy.uploadCompleteWithSkipped, { count: completed, skipped: oversized.length })
                : message(copy.uploadComplete, { count: completed }),
              "success"
            );
            await refreshFiles({ force: true });
          } catch (error) {
            if (error instanceof SessionExpiredError) {
              showSessionExpired();
            } else if (error instanceof StorageForbiddenError) {
              showStorageForbidden();
            } else if (error?.code === "storage_quota_exceeded") {
              setUploadStatus(copy.quotaExceeded, "error");
              if (completed) await refreshFiles({ force: true });
            } else {
              setUploadStatus(message(copy.uploadFailed, { message: error.message || copy.unavailable }), "error");
              if (completed) await refreshFiles({ force: true });
            }
          } finally {
            fileInput.value = "";
            if (isBusy) setBusy(false);
          }
        }

        async function downloadFile(file, button) {
          button.disabled = true;
          try {
            const response = await storageRequest("/api/storage/object?id=" + encodeURIComponent(file.id), { method: "GET" });
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = objectUrl;
            anchor.download = file.name || "file";
            anchor.style.display = "none";
            document.body.append(anchor);
            anchor.click();
            anchor.remove();
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
          } catch (error) {
            if (error instanceof SessionExpiredError) showSessionExpired();
            else if (error instanceof StorageForbiddenError) showStorageForbidden();
            else setApiStatus(message(copy.downloadFailed, { message: error.message || copy.unavailable }), "error");
          } finally {
            button.disabled = false;
          }
        }

        async function deleteFile(file, button) {
          if (isBusy || !window.confirm(message(copy.deleteConfirm, { name: file.name }))) return;

          refreshSequence += 1;
          setBusy(true);
          button.disabled = true;
          setUploadStatus(message(copy.deleting, { name: file.name }), "loading");

          try {
            await storageRequest("/api/storage/object?id=" + encodeURIComponent(file.id), { method: "DELETE" });
            setUploadStatus(copy.uploadIdle, "");
            await refreshFiles({ force: true });
          } catch (error) {
            if (error instanceof SessionExpiredError) showSessionExpired();
            else if (error instanceof StorageForbiddenError) showStorageForbidden();
            else setApiStatus(message(copy.deleteFailed, { message: error.message || copy.unavailable }), "error");
          } finally {
            button.disabled = false;
            if (isBusy) setBusy(false);
          }
        }

        searchInput.addEventListener("input", () => {
          currentFilter = searchInput.value || "";
          renderFiles();
        });

        uploadButton.addEventListener("click", () => fileInput.click());
        refreshButton.addEventListener("click", () => void refreshFiles({ force: true }));
        fileInput.addEventListener("change", event => void uploadFiles(event.target.files));
        void initializeStorage();
      })();
    </script>
  `;
}
