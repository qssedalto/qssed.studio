/**
 * 【初学者导读】
 * 文件：studio/ui-profile.js
 * 这是 AERTEX 前端 UI 模块（profile）：负责页面结构、状态、事件和 API 数据的展示。
 * 阅读顺序：先通过可见文字定位 render/模板，再追 state、事件监听和 fetch/API，最后去后端找同一路径。
 * 初学者重点：把“结构、样式、交互、数据”分开理解；一个页面 bug 往往只属于其中一层。
 * 修改注意：已有 class/id/data-* 可能被其他模块和自动测试依赖；不要因为当前页面能显示就随意删除。动态用户内容继续保持转义。
 * 响应式：涉及布局的修改至少检查宽屏、普通笔记本、平板和手机，避免只在一个尺寸上看起来正确。
 */
import { osHubIcon } from "./ui-primitives.js";

const PROFILE_COPY = {
  "en-us": {preferences:"Preferences",preferencesLead:"Theme and language can be switched from the top-right controls. Additional communication and notification preferences will live here.",change:"Change",name:"Name",username:"Username",email:"Email",birth:"Date of Birth",gender:"Gender",visibility:"Gender Visibility",security:"Sign-In & Security",communication:"Communication & Preferences",note:"Name, date of birth, and gender come from the account information submitted during registration. You can change your profile photo here.",badImage:"Choose a JPG, PNG, or WebP image no larger than 5 MB.",updating:"Updating…",updateFailed:"Could not update the profile photo.",accountInfo:"Account Information",registered:"Registered at",accountId:"Account ID",lastSignIn:"Last sign-in",auditStats:"Recent Audit Stats",events:"recent events",devices:"recent devices",risks:"recent risks",loginRecords:"Login Records"},
  "zh-cn": {preferences:"偏好设置",preferencesLead:"主题和语言可通过页面右上角按钮切换。其他通信与通知偏好会逐步集中到这里。",change:"更改",name:"姓名",username:"用户名",email:"电子邮件",birth:"出生日期",gender:"性别",visibility:"性别展示",security:"登录与安全",communication:"通信与偏好设置",note:"姓名、出生日期与性别来自注册时提交的账户资料。头像可在这里更改。",badImage:"请选择不超过 5 MB 的 JPG、PNG 或 WebP 图片。",updating:"正在更新…",updateFailed:"头像更新失败，请稍后再试。",accountInfo:"账号基本信息",registered:"注册时间",accountId:"账号 ID",lastSignIn:"最近登录",auditStats:"最近审计统计",events:"最近登录记录",devices:"最近设备",risks:"最近风险",loginRecords:"登录记录"},
  "zh-tw": {preferences:"偏好設定",preferencesLead:"主題與語言可透過頁面右上角控制項切換。其他通訊與通知偏好會逐步集中到這裡。",change:"更改",name:"姓名",username:"使用者名稱",email:"電子郵件",birth:"出生日期",gender:"性別",visibility:"性別顯示",security:"登入與安全性",communication:"通訊與偏好設定",note:"姓名、出生日期與性別來自註冊時提交的帳號資料。你可以在這裡更改個人照片。",badImage:"請選擇不超過 5 MB 的 JPG、PNG 或 WebP 圖片。",updating:"正在更新…",updateFailed:"無法更新個人照片，請稍後再試。",accountInfo:"帳號資訊",registered:"註冊時間",accountId:"帳號 ID",lastSignIn:"最近登入",auditStats:"最近稽核統計",events:"最近登入記錄",devices:"最近裝置",risks:"最近風險",loginRecords:"登入記錄"},
  "ja-jp": {preferences:"環境設定",preferencesLead:"テーマと言語は右上のコントロールから切り替えられます。その他の通信・通知設定も順次ここに追加されます。",change:"変更",name:"氏名",username:"ユーザー名",email:"メール",birth:"生年月日",gender:"性別",visibility:"性別の表示",security:"サインインとセキュリティ",communication:"通信と環境設定",note:"氏名、生年月日、性別は登録時のアカウント情報から取得されます。プロフィール写真はここで変更できます。",badImage:"5 MB 以下の JPG、PNG、WebP 画像を選択してください。",updating:"更新中…",updateFailed:"プロフィール写真を更新できませんでした。",accountInfo:"アカウント情報",registered:"登録日時",accountId:"アカウント ID",lastSignIn:"最終サインイン",auditStats:"最近の監査統計",events:"最近のイベント",devices:"最近のデバイス",risks:"最近のリスク",loginRecords:"サインイン履歴"},
  "ko-kr": {preferences:"환경설정",preferencesLead:"테마와 언어는 오른쪽 위 컨트롤에서 변경할 수 있습니다. 추가 통신 및 알림 환경설정도 여기에 모입니다.",change:"변경",name:"이름",username:"사용자 이름",email:"이메일",birth:"생년월일",gender:"성별",visibility:"성별 표시",security:"로그인 및 보안",communication:"통신 및 환경설정",note:"이름, 생년월일 및 성별은 가입 시 제출한 계정 정보에서 가져옵니다. 프로필 사진은 여기에서 변경할 수 있습니다.",badImage:"5 MB 이하의 JPG, PNG 또는 WebP 이미지를 선택하세요.",updating:"업데이트 중…",updateFailed:"프로필 사진을 업데이트할 수 없습니다.",accountInfo:"계정 정보",registered:"가입일",accountId:"계정 ID",lastSignIn:"최근 로그인",auditStats:"최근 감사 통계",events:"최근 이벤트",devices:"최근 기기",risks:"최근 위험",loginRecords:"로그인 기록"},
  "fr-fr": {preferences:"Préférences",preferencesLead:"Le thème et la langue peuvent être modifiés depuis les contrôles en haut à droite. Les autres préférences de communication et de notification seront regroupées ici.",change:"Modifier",name:"Nom",username:"Nom d’utilisateur",email:"E-mail",birth:"Date de naissance",gender:"Genre",visibility:"Visibilité du genre",security:"Connexion et sécurité",communication:"Communication et préférences",note:"Le nom, la date de naissance et le genre proviennent des informations fournies lors de l’inscription. Vous pouvez modifier la photo de profil ici.",badImage:"Choisissez une image JPG, PNG ou WebP de 5 Mo maximum.",updating:"Mise à jour…",updateFailed:"Impossible de mettre à jour la photo de profil.",accountInfo:"Informations du compte",registered:"Inscrit le",accountId:"ID du compte",lastSignIn:"Dernière connexion",auditStats:"Statistiques d’audit récentes",events:"événements récents",devices:"appareils récents",risks:"risques récents",loginRecords:"Historique des connexions"},
  "es-es": {preferences:"Preferencias",preferencesLead:"El tema y el idioma se pueden cambiar desde los controles de la esquina superior derecha. Otras preferencias de comunicación y notificaciones se reunirán aquí.",change:"Cambiar",name:"Nombre",username:"Usuario",email:"Correo electrónico",birth:"Fecha de nacimiento",gender:"Género",visibility:"Visibilidad del género",security:"Inicio de sesión y seguridad",communication:"Comunicación y preferencias",note:"El nombre, la fecha de nacimiento y el género proceden de la información enviada al registrarse. Puedes cambiar la foto de perfil aquí.",badImage:"Elige una imagen JPG, PNG o WebP de no más de 5 MB.",updating:"Actualizando…",updateFailed:"No se pudo actualizar la foto de perfil.",accountInfo:"Información de la cuenta",registered:"Registro",accountId:"ID de cuenta",lastSignIn:"Último inicio de sesión",auditStats:"Estadísticas de auditoría recientes",events:"eventos recientes",devices:"dispositivos recientes",risks:"riesgos recientes",loginRecords:"Registros de inicio de sesión"},
  "el-gr": {preferences:"Προτιμήσεις",preferencesLead:"Το θέμα και η γλώσσα αλλάζουν από τα στοιχεία ελέγχου επάνω δεξιά. Πρόσθετες προτιμήσεις επικοινωνίας και ειδοποιήσεων θα συγκεντρωθούν εδώ.",change:"Αλλαγή",name:"Όνομα",username:"Όνομα χρήστη",email:"Email",birth:"Ημερομηνία γέννησης",gender:"Φύλο",visibility:"Ορατότητα φύλου",security:"Σύνδεση και ασφάλεια",communication:"Επικοινωνία και προτιμήσεις",note:"Το όνομα, η ημερομηνία γέννησης και το φύλο προέρχονται από τα στοιχεία που υποβλήθηκαν κατά την εγγραφή. Μπορείτε να αλλάξετε τη φωτογραφία προφίλ εδώ.",badImage:"Επιλέξτε εικόνα JPG, PNG ή WebP έως 5 MB.",updating:"Ενημέρωση…",updateFailed:"Δεν ήταν δυνατή η ενημέρωση της φωτογραφίας προφίλ.",accountInfo:"Στοιχεία λογαριασμού",registered:"Εγγραφή",accountId:"ID λογαριασμού",lastSignIn:"Τελευταία σύνδεση",auditStats:"Πρόσφατα στατιστικά ελέγχου",events:"πρόσφατα συμβάντα",devices:"πρόσφατες συσκευές",risks:"πρόσφατοι κίνδυνοι",loginRecords:"Καταγραφές σύνδεσης"},
  "ar-sa": {preferences:"التفضيلات",preferencesLead:"يمكن تغيير السمة واللغة من عناصر التحكم أعلى اليمين. وستُجمع تفضيلات الاتصال والإشعارات الأخرى هنا.",change:"تغيير",name:"الاسم",username:"اسم المستخدم",email:"البريد الإلكتروني",birth:"تاريخ الميلاد",gender:"الجنس",visibility:"إظهار الجنس",security:"تسجيل الدخول والأمان",communication:"الاتصال والتفضيلات",note:"يأتي الاسم وتاريخ الميلاد والجنس من معلومات الحساب المقدمة عند التسجيل. ويمكنك تغيير صورة الملف الشخصي هنا.",badImage:"اختر صورة JPG أو PNG أو WebP لا يزيد حجمها عن 5 MB.",updating:"جارٍ التحديث…",updateFailed:"تعذر تحديث صورة الملف الشخصي.",accountInfo:"معلومات الحساب",registered:"تاريخ التسجيل",accountId:"معرّف الحساب",lastSignIn:"آخر تسجيل دخول",auditStats:"إحصاءات التدقيق الأخيرة",events:"أحداث حديثة",devices:"أجهزة حديثة",risks:"مخاطر حديثة",loginRecords:"سجلات تسجيل الدخول"}
};
PROFILE_COPY["en-gb"]=PROFILE_COPY["en-us"]; PROFILE_COPY["en-au"]=PROFILE_COPY["en-us"];
const PROFILE_STATUS_COPY = {
  "en-us":{online:"Online",focus:"Focus",busy:"Busy",away:"Away",offline:"Offline"},
  "zh-cn":{online:"在线",focus:"专注中",busy:"忙碌",away:"离开",offline:"隐身"},
  "zh-tw":{online:"線上",focus:"專注中",busy:"忙碌",away:"離開",offline:"隱身"},
  "ja-jp":{online:"オンライン",focus:"集中中",busy:"取り込み中",away:"離席中",offline:"オフライン"},
  "ko-kr":{online:"온라인",focus:"집중 중",busy:"바쁨",away:"자리 비움",offline:"오프라인"},
  "fr-fr":{online:"En ligne",focus:"Concentration",busy:"Occupé",away:"Absent",offline:"Hors ligne"},
  "es-es":{online:"En línea",focus:"Concentrado",busy:"Ocupado",away:"Ausente",offline:"Desconectado"},
  "el-gr":{online:"Σε σύνδεση",focus:"Συγκέντρωση",busy:"Απασχολημένος",away:"Απουσία",offline:"Εκτός σύνδεσης"},
  "ar-sa":{online:"متصل",focus:"وضع التركيز",busy:"مشغول",away:"بعيد",offline:"غير متصل"}
};
PROFILE_STATUS_COPY["en-gb"]=PROFILE_STATUS_COPY["en-us"]; PROFILE_STATUS_COPY["en-au"]=PROFILE_STATUS_COPY["en-us"];

// Profile 页面路由渲染：根据 path 选择资料主页、审计、安全等内容，保持同一账户中心壳结构。\nexport function profileContent(path, zh, locale = "") {
  const activeLocale=locale||(zh?"zh-cn":"en-us");
  const pc=PROFILE_COPY[activeLocale]||PROFILE_COPY["en-us"];
  if (path.endsWith("/account")) return accountAuditContent(zh, activeLocale);

  if (path.endsWith("/preferences")) return `<section class="os-card is-large"><h2>${pc.preferences}</h2><p>${pc.preferencesLead}</p></section>`;

  const prefix = "/" + activeLocale;
  return `
    <section id="profile-summary" class="profile-personal-info" data-profile-personal-info>
      <div class="profile-personal-avatar-block">
        <div id="profile-avatar" class="profile-personal-avatar">A</div>
        <button id="profile-avatar-change" class="profile-personal-change" type="button">${pc.change}</button>
        <input id="profile-avatar-file-simple" type="file" accept="image/jpeg,image/png,image/webp" hidden>
        <span id="profile-avatar-status-simple" class="profile-personal-avatar-status" aria-live="polite"></span>
      </div>

      <section class="profile-personal-group">
        <div class="profile-personal-row">
          <span>${pc.name}</span>
          <strong id="profile-real-name-value">—</strong>
        </div>
      </section>

      <section class="profile-personal-group">
        <div class="profile-personal-row">
          <span>${pc.username}</span>
          <strong id="profile-username-value">—</strong>
        </div>
        <div class="profile-personal-row">
          <span>${pc.email}</span>
          <strong id="profile-email-value">—</strong>
        </div>
      </section>

      <section class="profile-personal-group">
        <div class="profile-personal-row">
          <span>${pc.birth}</span>
          <strong id="profile-birth-date-value">—</strong>
        </div>
        <div class="profile-personal-row">
          <span>${pc.gender}</span>
          <strong id="profile-gender-value">—</strong>
        </div>
        <div class="profile-personal-row">
          <span>${pc.visibility}</span>
          <strong id="profile-gender-privacy-value">—</strong>
        </div>
      </section>

      <section class="profile-personal-group">
        <a class="profile-personal-row is-link" href="${prefix}/settings/security">
          <span>${pc.security}</span>
          <span class="profile-personal-chevron" aria-hidden="true">›</span>
        </a>
        <a class="profile-personal-row is-link" href="${prefix}/profile/preferences">
          <span>${pc.communication}</span>
          <span class="profile-personal-chevron" aria-hidden="true">›</span>
        </a>
      </section>

      <p class="profile-personal-note">${pc.note}</p>
    </section>

    <script>
      (() => {
        const button = document.getElementById("profile-avatar-change");
        const input = document.getElementById("profile-avatar-file-simple");
        const status = document.getElementById("profile-avatar-status-simple");
        if (!button || !input) return;
        button.addEventListener("click", () => input.click());
        input.addEventListener("change", async event => {
          const file = event.target.files && event.target.files[0];
          event.target.value = "";
          if (!file) return;
          if (!["image/jpeg","image/png","image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
            if (status) status.textContent = ${JSON.stringify(pc.badImage)};
            return;
          }
          button.disabled = true;
          if (status) status.textContent = ${JSON.stringify(pc.updating)};
          try {
            const form = new FormData();
            form.append("kind", "avatar");
            form.append("file", file);
            const response = await fetch("/api/profile/media", { method:"POST", credentials:"same-origin", body:form, cache:"no-store" });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || !data.url) throw new Error(data.error || "Upload failed");
            const avatar = document.getElementById("profile-avatar");
            if (avatar) avatar.innerHTML = '<img src="' + String(data.url).replace(/"/g, "%22") + '" alt="">';
            try { sessionStorage.removeItem("qssed-profile-summary-v2"); } catch {}
            if (status) status.textContent = "";
          } catch (error) {
            console.error("Profile photo update failed", error);
            if (status) status.textContent = ${JSON.stringify(pc.updateFailed)};
          } finally {
            button.disabled = false;
          }
        });
      })();
    <\/script>
  `;
}

export function accountAuditContent(zh, locale = "") {
  const pc=PROFILE_COPY[locale]||PROFILE_COPY[zh?"zh-cn":"en-us"];
  return `
    <section class="audit-grid">
      <article class="os-card is-large">
        <h2>${pc.accountInfo}</h2>
        <dl class="audit-facts">
          <div><dt>${pc.registered}</dt><dd id="audit-created-at">...</dd></div>
          <div><dt>${pc.accountId}</dt><dd id="audit-user-id">...</dd></div>
          <div><dt>${pc.email}</dt><dd id="audit-email">...</dd></div>
          <div><dt>${pc.lastSignIn}</dt><dd id="audit-last-sign-in">...</dd></div>
        </dl>
      </article>
      <article class="os-card">
        <h2>${pc.auditStats}</h2>
        <div class="audit-stats">
          <span><strong id="audit-login-count">0</strong>${pc.events}</span>
          <span><strong id="audit-device-count">0</strong>${pc.devices}</span>
          <span><strong id="audit-risk-count">0</strong>${pc.risks}</span>
        </div>
      </article>
    </section>
    <section class="os-card audit-section">
      <h2>${pc.loginRecords}</h2>
      <div id="audit-login-table" class="audit-table"></div>
    </section>
  `;
}

// Profile 客户端逻辑：负责资料 hydration、编辑 sheet、链接增删和头像/背景上传。所有写操作最终都走 /api/profile，由服务端确认用户身份。\nexport function profileClientScript(locale = "en-us") {
  const activeLocale = locale || "en-us";
  return `<script>
      /* PROFILE_HOME_V3 */
      const PROFILE_HOME_CACHE_PREFIX = "qssed-profile-home-v3:";
      let profileHomeState = { user: null, personalization: null, links: [], editingLinkId: null };

      function profileHomeIsZh() { return location.pathname.startsWith("/zh-cn/"); }
      function profileHomeEscape(value) { return auditEscape(value == null ? "" : String(value)); }
      function profileHomeCacheKey(userId) { return PROFILE_HOME_CACHE_PREFIX + String(userId || ""); }
      function profileHomeStatusLabel(kind) {
        const labels = ${JSON.stringify(PROFILE_STATUS_COPY[activeLocale] || PROFILE_STATUS_COPY["en-us"])};
        return labels[kind] || labels.online;
      }
      function readProfileHomeCache(userId) {
        try { const raw = sessionStorage.getItem(profileHomeCacheKey(userId)); return raw ? JSON.parse(raw) : null; } catch { return null; }
      }
      function writeProfileHomeCache() {
        try { if (profileHomeState.user?.id) sessionStorage.setItem(profileHomeCacheKey(profileHomeState.user.id), JSON.stringify({ personalization: profileHomeState.personalization, links: profileHomeState.links })); } catch {}
      }
      function normalizeProfilePersonalization(row, userId) {
        return {
          user_id: userId,
          signature: row?.signature || "",
          bio: row?.bio || "",
          location: row?.location || "",
          status_kind: row?.status_kind || "online",
          status_text: row?.status_text || "",
          status_emoji: row?.status_emoji || "✨",
          interests: Array.isArray(row?.interests) ? row.interests.slice(0,12) : [],
          cover_style: row?.cover_style || "aurora",
          background_url: row?.background_url || ""
        };
      }
      function renderProfileHome() {
        if (!document.querySelector("[data-profile-home]")) return;
        const p = profileHomeState.personalization || normalizeProfilePersonalization(null, profileHomeState.user?.id);
        const cover = document.getElementById("profile-cover");
        if (cover) {
          cover.dataset.coverStyle = p.cover_style;
          cover.style.backgroundImage = p.background_url ? 'linear-gradient(rgba(0,0,0,.08),rgba(0,0,0,.08)),url("' + p.background_url.replace(/"/g,"%22") + '")' : "";
          cover.classList.toggle("has-custom-background", Boolean(p.background_url));
        }
        const signature = document.getElementById("profile-signature");
        if (signature) signature.textContent = p.signature || (profileHomeIsZh() ? "还没有设置个性签名。" : "No signature yet.");
        const bio = document.getElementById("profile-bio");
        if (bio) bio.textContent = p.bio || (profileHomeIsZh() ? "还没有填写个人介绍。" : "No bio yet.");
        const presence = document.getElementById("profile-presence");
        if (presence) presence.textContent = (p.status_emoji || "✨") + " " + (p.status_text || profileHomeStatusLabel(p.status_kind));
        const location = document.getElementById("profile-location");
        if (location) { location.textContent = p.location ? "⌖ " + p.location : ""; location.hidden = !p.location; }
        const interests = document.getElementById("profile-interests");
        if (interests) interests.innerHTML = p.interests.length ? p.interests.map(item => '<span>' + profileHomeEscape(item) + '</span>').join("") : '<span class="profile-interest-empty">' + (profileHomeIsZh() ? "添加兴趣标签，让主页更像你。" : "Add interests to make this profile yours.") + '</span>';
        renderProfileLinks();
      }
      function profileLinkIcon(title, category) {
        const t=String(title||"").toLowerCase();
        if(t.includes("qq")) return "Q";
        if(t.includes("github")) return "⌘";
        if(t.includes("bilibili")||t.includes("b站")) return "B";
        if(t==="x"||t.includes("twitter")) return "𝕏";
        if(category==="developer") return "</>";
        if(category==="contact") return "@";
        if(category==="site") return "⌂";
        return "↗";
      }
      function renderProfileLinks() {
        const list=document.getElementById("profile-link-list"); if(!list) return;
        const links=[...(profileHomeState.links||[])].sort((a,b)=>Number(b.pinned)-Number(a.pinned)||Number(a.sort_order||0)-Number(b.sort_order||0)||String(a.created_at||"").localeCompare(String(b.created_at||"")));
        if(!links.length){ list.innerHTML='<div class="profile-link-empty"><strong>'+(profileHomeIsZh()?"还没有链接":"No links yet")+'</strong><span>'+(profileHomeIsZh()?"添加 QQ、GitHub、个人网站或其他常用入口。":"Add QQ, GitHub, your website, or any other destination.")+'</span></div>'; return; }
        list.innerHTML=links.map(link => '<article class="profile-link-item">'+
          '<a class="profile-link-main" href="'+profileHomeEscape(link.url)+'" target="_blank" rel="noopener noreferrer"><span class="profile-link-icon">'+profileHomeEscape(profileLinkIcon(link.title,link.category))+'</span><span class="profile-link-copy"><strong>'+profileHomeEscape(link.title)+(link.pinned?' <em>★</em>':'')+'</strong><small>'+profileHomeEscape(link.note || link.url)+'</small></span><span class="profile-link-open">↗</span></a>'+
          '<div class="profile-link-actions"><button type="button" data-profile-link-edit="'+profileHomeEscape(link.id)+'">'+(profileHomeIsZh()?"编辑":"Edit")+'</button><button type="button" data-profile-link-delete="'+profileHomeEscape(link.id)+'">'+(profileHomeIsZh()?"删除":"Delete")+'</button></div>'+
        '</article>').join("");
        list.querySelectorAll("[data-profile-link-edit]").forEach(button=>button.addEventListener("click",()=>openProfileLinkSheet(button.dataset.profileLinkEdit)));
        list.querySelectorAll("[data-profile-link-delete]").forEach(button=>button.addEventListener("click",()=>deleteProfileLink(button.dataset.profileLinkDelete)));
      }
      function openProfileSheet() {
        const sheet=document.getElementById("profile-edit-sheet"), backdrop=document.getElementById("profile-sheet-backdrop"); if(!sheet||!backdrop) return;
        const p=profileHomeState.personalization || normalizeProfilePersonalization(null, profileHomeState.user?.id);
        document.getElementById("profile-readonly-name").value=document.getElementById("profile-display-name")?.textContent || "";
        const avatarPreview=document.getElementById("profile-avatar-preview"); if(avatarPreview) avatarPreview.innerHTML=document.getElementById("profile-avatar")?.innerHTML || "";
        const backgroundPreview=document.getElementById("profile-background-preview"); if(backgroundPreview){ backgroundPreview.dataset.coverStyle=p.cover_style; backgroundPreview.style.backgroundImage=p.background_url?'url("'+p.background_url.replace(/"/g,"%22")+'")':""; backgroundPreview.classList.toggle("has-custom-background",Boolean(p.background_url)); }
        document.getElementById("profile-edit-signature").value=p.signature;
        document.getElementById("profile-edit-bio").value=p.bio;
        document.getElementById("profile-edit-location").value=p.location;
        document.getElementById("profile-edit-status-kind").value=p.status_kind;
        document.getElementById("profile-edit-status-emoji").value=p.status_emoji;
        document.getElementById("profile-edit-status-text").value=p.status_text;
        document.getElementById("profile-edit-interests").value=p.interests.join(", ");
        document.querySelectorAll("[data-cover-choice]").forEach(button=>button.classList.toggle("is-selected",button.dataset.coverChoice===p.cover_style));
        document.documentElement.classList.add("profile-sheet-open"); backdrop.hidden=false; requestAnimationFrame(()=>{backdrop.classList.add("is-visible");sheet.classList.add("is-open");sheet.setAttribute("aria-hidden","false");});
      }
      function closeProfileSheets() {
        document.documentElement.classList.remove("profile-sheet-open"); const backdrop=document.getElementById("profile-sheet-backdrop"); document.querySelectorAll(".profile-sheet.is-open").forEach(sheet=>{sheet.classList.remove("is-open");sheet.setAttribute("aria-hidden","true")}); if(backdrop){backdrop.classList.remove("is-visible");setTimeout(()=>{if(!document.querySelector(".profile-sheet.is-open")) backdrop.hidden=true},220);}
      }
      // 保存资料个性化：收集当前表单白名单字段发给服务端；成功后更新本地缓存与 UI，失败时不应先乐观覆盖服务器状态。\nasync function saveProfilePersonalization() {
        if(!profileHomeState.user) return;
        const button=document.getElementById("profile-save-button"); button.disabled=true; button.textContent=profileHomeIsZh()?"正在保存…":"Saving…";
        const interests=document.getElementById("profile-edit-interests").value.split(/[,，]/).map(x=>x.trim()).filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).slice(0,12);
        const cover=document.querySelector("[data-cover-choice].is-selected")?.dataset.coverChoice || "aurora";
        const payload={ user_id:profileHomeState.user.id, signature:document.getElementById("profile-edit-signature").value.trim(), bio:document.getElementById("profile-edit-bio").value.trim(), location:document.getElementById("profile-edit-location").value.trim(), status_kind:document.getElementById("profile-edit-status-kind").value, status_emoji:document.getElementById("profile-edit-status-emoji").value.trim()||"✨", status_text:document.getElementById("profile-edit-status-text").value.trim(), interests, cover_style:cover, background_url:profileHomeState.personalization?.background_url || "" };
        const {data,error}=await supabaseClient.from("profile_personalization").upsert(payload,{onConflict:"user_id"}).select().single();
        button.disabled=false; button.textContent=profileHomeIsZh()?"保存":"Save";
        if(error){ console.error("Profile personalization save failed",error.message); alert(profileHomeIsZh()?"保存失败，请稍后重试。":"Could not save your profile. Please try again."); return; }
        profileHomeState.personalization=normalizeProfilePersonalization(data,profileHomeState.user.id); writeProfileHomeCache(); renderProfileHome(); closeProfileSheets();
      }
      function openProfileLinkSheet(id) {
        const sheet=document.getElementById("profile-link-sheet"), backdrop=document.getElementById("profile-sheet-backdrop"); if(!sheet||!backdrop) return;
        const link=(profileHomeState.links||[]).find(item=>item.id===id)||null; profileHomeState.editingLinkId=link?.id||null;
        document.getElementById("profile-link-sheet-title").textContent=link?(profileHomeIsZh()?"编辑链接":"Edit link"):(profileHomeIsZh()?"添加链接":"Add link");
        document.getElementById("profile-link-id").value=link?.id||"";
        document.getElementById("profile-link-title").value=link?.title||"";
        document.getElementById("profile-link-url").value=link?.url||"";
        document.getElementById("profile-link-category").value=link?.category||"social";
        document.getElementById("profile-link-note").value=link?.note||"";
        document.getElementById("profile-link-pinned").checked=Boolean(link?.pinned);
        document.documentElement.classList.add("profile-sheet-open"); backdrop.hidden=false; requestAnimationFrame(()=>{backdrop.classList.add("is-visible");sheet.classList.add("is-open");sheet.setAttribute("aria-hidden","false");document.getElementById("profile-link-title").focus();});
      }
      async function saveProfileLink() {
        if(!profileHomeState.user) return;
        const button=document.getElementById("profile-link-save"), title=document.getElementById("profile-link-title").value.trim(), url=document.getElementById("profile-link-url").value.trim();
        if(!title || !/^https?:\\/\\//i.test(url)){ alert(profileHomeIsZh()?"请填写名称，并输入以 http:// 或 https:// 开头的有效链接。":"Enter a title and a valid URL beginning with http:// or https://."); return; }
        button.disabled=true;
        const payload={ user_id:profileHomeState.user.id,title,url,category:document.getElementById("profile-link-category").value,note:document.getElementById("profile-link-note").value.trim(),pinned:document.getElementById("profile-link-pinned").checked,sort_order:profileHomeState.editingLinkId?((profileHomeState.links.find(x=>x.id===profileHomeState.editingLinkId)?.sort_order)||0):(profileHomeState.links.length*10)};
        let result;
        if(profileHomeState.editingLinkId) result=await supabaseClient.from("profile_links").update(payload).eq("id",profileHomeState.editingLinkId).select().single();
        else result=await supabaseClient.from("profile_links").insert(payload).select().single();
        button.disabled=false;
        if(result.error){console.error("Profile link save failed",result.error.message);alert(profileHomeIsZh()?"链接保存失败。":"Could not save the link.");return;}
        if(profileHomeState.editingLinkId) profileHomeState.links=profileHomeState.links.map(x=>x.id===profileHomeState.editingLinkId?result.data:x); else profileHomeState.links.push(result.data);
        writeProfileHomeCache(); renderProfileLinks(); closeProfileSheets();
      }
      async function deleteProfileLink(id) {
        const link=(profileHomeState.links||[]).find(item=>item.id===id); if(!link) return;
        if(!confirm((profileHomeIsZh()?"删除“":"Delete “")+link.title+"”"+(profileHomeIsZh()?"？":"?"))) return;
        const {error}=await supabaseClient.from("profile_links").delete().eq("id",id);
        if(error){alert(profileHomeIsZh()?"删除失败。":"Could not delete the link.");return;}
        profileHomeState.links=profileHomeState.links.filter(item=>item.id!==id); writeProfileHomeCache(); renderProfileLinks();
      }
      function profileMediaExtension(file) {
        const map={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
        return map[file?.type] || "";
      }
      // 头像/背景上传：先做浏览器侧大小/类型体验校验，再由后端执行真正限制和存储。前端检查不能替代服务端检查。\nasync function uploadProfileMedia(file, kind) {
        if(!profileHomeState.user || !file) return null;
        const max=kind==="avatar"?5*1024*1024:8*1024*1024;
        const ext=profileMediaExtension(file);
        if(!ext || file.size>max){ alert(profileHomeIsZh()?(kind==="avatar"?"头像需为 JPG、PNG 或 WebP，且不超过 5 MB。":"背景需为 JPG、PNG 或 WebP，且不超过 8 MB。"):(kind==="avatar"?"Profile photo must be JPG, PNG, or WebP and no larger than 5 MB.":"Background must be JPG, PNG, or WebP and no larger than 8 MB.")); return null; }
        const bucket=kind==="avatar"?"avatars":"profile-media";
        const objectPath=profileHomeState.user.id+"/"+kind+"."+ext;
        const {error}=await supabaseClient.storage.from(bucket).upload(objectPath,file,{upsert:true,contentType:file.type,cacheControl:"3600"});
        if(error){console.error("Profile media upload failed",error.message);alert(profileHomeIsZh()?"图片上传失败，请稍后重试。":"Image upload failed. Please try again.");return null;}
        const {data}=supabaseClient.storage.from(bucket).getPublicUrl(objectPath);
        return data?.publicUrl ? data.publicUrl+"?v="+Date.now() : null;
      }
      async function changeProfileAvatar(file) {
        const url=await uploadProfileMedia(file,"avatar"); if(!url) return;
        const {error}=await supabaseClient.from("profiles").update({avatar_url:url,updated_at:new Date().toISOString()}).eq("id",profileHomeState.user.id);
        if(error){console.error("Avatar profile update failed",error.message);alert(profileHomeIsZh()?"头像已上传，但账号资料更新失败。":"The photo uploaded, but your profile could not be updated.");return;}
        const avatar=document.getElementById("profile-avatar"); if(avatar) avatar.innerHTML='<img src="'+profileHomeEscape(url)+'" alt="">';
        const preview=document.getElementById("profile-avatar-preview"); if(preview) preview.innerHTML='<img src="'+profileHomeEscape(url)+'" alt="">';
      }
      async function changeProfileBackground(file) {
        const url=await uploadProfileMedia(file,"background"); if(!url) return;
        profileHomeState.personalization=normalizeProfilePersonalization({...profileHomeState.personalization,background_url:url},profileHomeState.user.id);
        const {data,error}=await supabaseClient.from("profile_personalization").upsert(profileHomeState.personalization,{onConflict:"user_id"}).select().single();
        if(error){console.error("Background save failed",error.message);alert(profileHomeIsZh()?"背景保存失败。":"Could not save the background.");return;}
        profileHomeState.personalization=normalizeProfilePersonalization(data,profileHomeState.user.id);writeProfileHomeCache();renderProfileHome();openProfileSheet();
      }
      async function clearProfileBackground() {
        if(!profileHomeState.user) return;
        profileHomeState.personalization=normalizeProfilePersonalization({...profileHomeState.personalization,background_url:""},profileHomeState.user.id);
        const {data,error}=await supabaseClient.from("profile_personalization").upsert(profileHomeState.personalization,{onConflict:"user_id"}).select().single();
        if(error){alert(profileHomeIsZh()?"无法清除背景。":"Could not clear the background.");return;}
        profileHomeState.personalization=normalizeProfilePersonalization(data,profileHomeState.user.id);writeProfileHomeCache();renderProfileHome();openProfileSheet();
      }
      function bindCurrentPageNoReload() {
        document.querySelectorAll(".os-nav a[href]").forEach(link=>{
          const target=new URL(link.href,location.href);
          if(target.pathname!==location.pathname)return;
          link.setAttribute("aria-current","page");
          link.dataset.currentPage="true";
          link.addEventListener("click",event=>event.preventDefault());
        });
      }
      function bindProfileHome() {
        const modalBackdrop=document.getElementById("profile-sheet-backdrop"); if(modalBackdrop&&modalBackdrop.parentElement!==document.body)document.body.appendChild(modalBackdrop); document.querySelectorAll(".profile-sheet").forEach(sheet=>{if(sheet.parentElement!==document.body)document.body.appendChild(sheet);});
        if(!document.querySelector("[data-profile-home]")) return;
        document.getElementById("profile-edit-button")?.addEventListener("click",openProfileSheet);
        document.getElementById("profile-add-link")?.addEventListener("click",()=>openProfileLinkSheet(null));
        document.querySelectorAll("[data-close-profile-sheet],[data-close-profile-link-sheet]").forEach(button=>button.addEventListener("click",closeProfileSheets));
        document.getElementById("profile-sheet-backdrop")?.addEventListener("click",closeProfileSheets);
        document.getElementById("profile-save-button")?.addEventListener("click",saveProfilePersonalization);
        document.getElementById("profile-link-save")?.addEventListener("click",saveProfileLink);
        document.getElementById("profile-avatar-choose")?.addEventListener("click",()=>document.getElementById("profile-avatar-file")?.click());
        document.getElementById("profile-avatar-file")?.addEventListener("change",async event=>{const file=event.target.files?.[0];if(file)await changeProfileAvatar(file);event.target.value="";});
        document.getElementById("profile-background-choose")?.addEventListener("click",()=>document.getElementById("profile-background-file")?.click());
        document.getElementById("profile-background-file")?.addEventListener("change",async event=>{const file=event.target.files?.[0];if(file)await changeProfileBackground(file);event.target.value="";});
        document.getElementById("profile-background-clear")?.addEventListener("click",clearProfileBackground);
        bindCurrentPageNoReload();
        document.getElementById("profile-cover-picker")?.addEventListener("click",event=>{const button=event.target.closest("[data-cover-choice]");if(!button)return;document.querySelectorAll("[data-cover-choice]").forEach(x=>x.classList.toggle("is-selected",x===button));});
        document.querySelectorAll("[data-link-preset]").forEach(button=>button.addEventListener("click",()=>{document.getElementById("profile-link-title").value=button.dataset.linkPreset;}));
        window.addEventListener("keydown",event=>{if(event.key==="Escape")closeProfileSheets();});
      }
      // Profile hydration：先恢复可用缓存，再请求最新 profile/links/audit 摘要并重绘；缓存键绑定 userId，避免不同账户串资料。\nasync function hydrateProfileHome(user) {
        if(!document.querySelector("[data-profile-home]") || !user) return;
        profileHomeState.user=user;
        const cached=readProfileHomeCache(user.id);
        if(cached){profileHomeState.personalization=normalizeProfilePersonalization(cached.personalization,user.id);profileHomeState.links=Array.isArray(cached.links)?cached.links:[];renderProfileHome();}
        const [personalizationResult,linksResult]=await Promise.all([
          supabaseClient.from("profile_personalization").select("*").eq("user_id",user.id).maybeSingle(),
          supabaseClient.from("profile_links").select("*").eq("user_id",user.id).order("pinned",{ascending:false}).order("sort_order",{ascending:true}).order("created_at",{ascending:true})
        ]);
        if(personalizationResult.error) console.error("Profile personalization query failed",personalizationResult.error.message);
        if(linksResult.error) console.error("Profile links query failed",linksResult.error.message);
        if(!personalizationResult.error) profileHomeState.personalization=normalizeProfilePersonalization(personalizationResult.data,user.id);
        if(!linksResult.error) profileHomeState.links=linksResult.data||[];
        writeProfileHomeCache(); renderProfileHome();
      }

    </script>`;
}

export function profileHubContent(zh, locale = "") {
  const activeLocale = locale || (zh ? "zh-cn" : "en-us");
  const prefix = "/" + activeLocale;
  const localized = {
    "zh-tw": {
      loading:"正在讀取帳號...", foot:"在這裡集中管理與你的 AERTEX 帳號相關的個人資料、安全性與內容入口。",
      primary:[["個人資料","照片、姓名、使用者名稱、出生日期與性別","profile","blue"],["登入與安全性","裝置、登入記錄與帳號安全性","shield","green"],["帳號資訊","電子郵件、帳號 ID、註冊時間與稽核記錄","account","gray"],["偏好設定","個人使用體驗與偏好入口","preferences","purple"]],
      services:[["AERTEX Drive","私人檔案與儲存空間","storage","cyan"],["收藏連結","你的連結與常用入口","links","orange"]]
    },
    "ja-jp": {loading:"アカウントを読み込み中…",foot:"AERTEX アカウントに関連する個人情報、セキュリティ、コンテンツへの入口を管理します。",primary:[["個人情報","写真、氏名、ユーザー名、生年月日、性別","profile","blue"],["サインインとセキュリティ","デバイス、サインイン履歴、アカウント保護","shield","green"],["アカウント情報","メール、アカウント ID、登録日時、監査履歴","account","gray"],["環境設定","個人設定と利用体験","preferences","purple"]],services:[["AERTEX Drive","プライベートファイルとストレージ","storage","cyan"],["保存したリンク","リンクとよく使う項目","links","orange"]]},
    "ko-kr": {loading:"계정을 불러오는 중…",foot:"AERTEX 계정과 연결된 개인 정보, 보안 및 콘텐츠 진입점을 관리합니다.",primary:[["개인 정보","사진, 이름, 사용자 이름, 생년월일 및 성별","profile","blue"],["로그인 및 보안","기기, 로그인 기록 및 계정 보안","shield","green"],["계정 정보","이메일, 계정 ID, 가입 및 감사 기록","account","gray"],["환경설정","개인 사용 환경 및 기본 설정","preferences","purple"]],services:[["AERTEX Drive","개인 파일 및 저장 공간","storage","cyan"],["저장된 링크","링크 및 자주 사용하는 항목","links","orange"]]},
    "fr-fr": {loading:"Chargement du compte…",foot:"Gérez les informations personnelles, la sécurité et les contenus associés à votre compte AERTEX.",primary:[["Informations personnelles","Photo, nom, identifiant, date de naissance et genre","profile","blue"],["Connexion et sécurité","Appareils, historique des connexions et sécurité","shield","green"],["Informations du compte","E-mail, ID du compte, inscription et audit","account","gray"],["Préférences","Expérience personnelle et préférences","preferences","purple"]],services:[["AERTEX Drive","Fichiers privés et stockage","storage","cyan"],["Liens enregistrés","Vos liens et destinations fréquentes","links","orange"]]},
    "es-es": {loading:"Cargando cuenta…",foot:"Gestiona la información personal, la seguridad y el contenido conectado a tu cuenta AERTEX.",primary:[["Información personal","Foto, nombre, usuario, fecha de nacimiento y género","profile","blue"],["Inicio de sesión y seguridad","Dispositivos, historial de acceso y seguridad","shield","green"],["Información de la cuenta","Correo, ID de cuenta, registro y auditoría","account","gray"],["Preferencias","Experiencia personal y preferencias","preferences","purple"]],services:[["AERTEX Drive","Archivos privados y almacenamiento","storage","cyan"],["Enlaces guardados","Tus enlaces y destinos frecuentes","links","orange"]]},
    "el-gr": {loading:"Φόρτωση λογαριασμού…",foot:"Διαχειριστείτε τα προσωπικά στοιχεία, την ασφάλεια και το περιεχόμενο που συνδέονται με τον λογαριασμό AERTEX.",primary:[["Προσωπικά στοιχεία","Φωτογραφία, όνομα, όνομα χρήστη, ημερομηνία γέννησης και φύλο","profile","blue"],["Σύνδεση και ασφάλεια","Συσκευές, ιστορικό σύνδεσης και ασφάλεια","shield","green"],["Στοιχεία λογαριασμού","Email, ID λογαριασμού, εγγραφή και έλεγχος","account","gray"],["Προτιμήσεις","Προσωπική εμπειρία και προτιμήσεις","preferences","purple"]],services:[["AERTEX Drive","Ιδιωτικά αρχεία και αποθήκευση","storage","cyan"],["Αποθηκευμένοι σύνδεσμοι","Οι σύνδεσμοι και οι συχνές επιλογές σας","links","orange"]]},
    "ar-sa": {loading:"جارٍ تحميل الحساب…",foot:"أدِر المعلومات الشخصية والأمان والمحتوى المرتبط بحساب AERTEX.",primary:[["المعلومات الشخصية","الصورة والاسم واسم المستخدم وتاريخ الميلاد والجنس","profile","blue"],["تسجيل الدخول والأمان","الأجهزة وسجل تسجيل الدخول وأمان الحساب","shield","green"],["معلومات الحساب","البريد الإلكتروني ومعرّف الحساب والتسجيل وسجل التدقيق","account","gray"],["التفضيلات","تجربة الاستخدام والتفضيلات الشخصية","preferences","purple"]],services:[["AERTEX Drive","الملفات الخاصة والتخزين","storage","cyan"],["الروابط المحفوظة","روابطك والوجهات المتكررة","links","orange"]]}
  }[activeLocale];
  const primaryRows = localized ? localized.primary.map((row,index)=>[...row,index===0?`${prefix}/profile/details`:index===1?`${prefix}/settings/security`:index===2?`${prefix}/profile/account`:`${prefix}/profile/preferences`]) : zh ? [
    ["个人信息", "头像、姓名、用户名、出生日期与性别", "profile", "blue", `${prefix}/profile/details`],
    ["登录与安全", "设备、登录记录与账户安全", "shield", "green", `${prefix}/settings/security`],
    ["账户信息", "邮箱、账号 ID、注册时间与审计记录", "account", "gray", `${prefix}/profile/account`],
    ["偏好设置", "个人使用体验与偏好入口", "preferences", "purple", `${prefix}/profile/preferences`]
  ] : [
    ["Personal Information", "Photo, name, username, date of birth, and gender", "profile", "blue", `${prefix}/profile/details`],
    ["Sign-In & Security", "Devices, sign-in history, and account security", "shield", "green", `${prefix}/settings/security`],
    ["Account Information", "Email, account ID, registration, and audit history", "account", "gray", `${prefix}/profile/account`],
    ["Preferences", "Personal experience and preference entry points", "preferences", "purple", `${prefix}/profile/preferences`]
  ];
  const serviceRows = localized ? localized.services.map((row,index)=>[...row,index===0?`${prefix}/settings/storage`:`${prefix}/info/links`]) : zh ? [
    ["AERTEX Drive", "私人文件与存储", "storage", "cyan", `${prefix}/settings/storage`],
    ["收藏链接", "你的链接与常用入口", "links", "orange", `${prefix}/info/links`]
  ] : [
    ["AERTEX Drive", "Private files and storage", "storage", "cyan", `${prefix}/settings/storage`],
    ["Saved Links", "Your links and frequent destinations", "links", "orange", `${prefix}/info/links`]
  ];

  const renderRow = ([title, detail, icon, tone, href]) => `
    <a class="profile-account-row" href="${href}">
      <span class="profile-account-row-icon tone-${tone}">${osHubIcon(icon)}</span>
      <span class="profile-account-row-copy">
        <strong>${title}</strong>
        <small>${detail}</small>
      </span>
      <span class="profile-account-chevron" aria-hidden="true">›</span>
    </a>`;

  return `
    <section id="profile-summary" class="profile-account-home" data-profile-account-home>
      <header class="profile-account-identity">
        <div id="profile-avatar" class="profile-account-avatar">A</div>
        <h2 id="profile-display-name">${localized?.loading || (zh ? "正在读取账户..." : "Loading account...")}</h2>
        <p id="profile-email">...</p>
      </header>

      <section class="profile-account-section">
        <div class="profile-account-group">${primaryRows.map(renderRow).join("")}</div>
      </section>

      <section class="profile-account-section">
        <div class="profile-account-group">${serviceRows.map(renderRow).join("")}</div>
      </section>

      <p class="profile-account-footnote">${localized?.foot || (zh ? "这里集中管理与你的 AERTEX 账户相关的个人资料、安全与内容入口。" : "Manage the personal information, security, and content connected to your AERTEX account.")}</p>
    </section>
  `;
}
