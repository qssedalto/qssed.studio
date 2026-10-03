import { normalizeSupportedLocale } from "./locale.js";

const WISHES_COPY = {
  "en-us":{title:"Wish Links · AERTEX",heading:"Send a wish to someone.",lead:"Choose a greeting page. A name is optional; AERTEX creates a clean share route and redirects it to the selected greeting.",choose:"Choose a wish",birthday:"Happy Birthday",birthdayNote:"For birthdays.",midAutumn:"Happy Mid-Autumn Festival",midAutumnNote:"For the Mid-Autumn Festival.",recipient:"Who is this for?",optional:"Optional",placeholder:"Enter a name or leave it blank",share:"Share route",destination:"Destination",open:"Open wish",copy:"Copy link",copied:"Copied",failed:"Copy failed. Press and hold the link to copy it.",note:"Leave the name blank for a generic link. Adding a name automatically appends ?name=xxx."},
  "zh-cn":{title:"祝福链接 · AERTEX",heading:"把祝福发给想祝福的人。",lead:"选择一个祝福页面。名字可以填写，也可以留空；AERTEX 会生成一条简洁的分享路由，再自动导向对应的祝福。",choose:"选择祝福",birthday:"生日快乐",birthdayNote:"适合生日当天发送。",midAutumn:"中秋快乐",midAutumnNote:"适合中秋节发送。",recipient:"要祝福谁？",optional:"可选",placeholder:"输入名字，也可以留空",share:"分享路由",destination:"实际导向",open:"打开祝福",copy:"复制链接",copied:"已复制",failed:"复制失败，请长按链接复制。",note:"留空时会生成不带 ?name= 的通用祝福链接；填写名字后会自动附加 ?name=xxx。"},
  "zh-tw":{title:"祝福連結 · AERTEX",heading:"把祝福送給想祝福的人。",lead:"選擇一個祝福頁面。姓名可填也可留空；AERTEX 會產生簡潔的分享路由，再導向對應的祝福。",choose:"選擇祝福",birthday:"生日快樂",birthdayNote:"適合生日當天傳送。",midAutumn:"中秋快樂",midAutumnNote:"適合中秋節傳送。",recipient:"要祝福誰？",optional:"選填",placeholder:"輸入名字，也可以留空",share:"分享路由",destination:"實際導向",open:"開啟祝福",copy:"複製連結",copied:"已複製",failed:"複製失敗，請長按連結複製。",note:"留空時會產生不含 ?name= 的通用祝福連結；填寫姓名後會自動加入 ?name=xxx。"},
  "ja-jp":{title:"グリーティングリンク · AERTEX",heading:"大切な人にメッセージを贈りましょう。",lead:"グリーティングページを選びます。名前は任意です。AERTEX がシンプルな共有ルートを作成し、選んだページへ案内します。",choose:"グリーティングを選択",birthday:"お誕生日おめでとう",birthdayNote:"誕生日に送るメッセージ。",midAutumn:"中秋節おめでとう",midAutumnNote:"中秋節に送るメッセージ。",recipient:"誰に贈りますか？",optional:"任意",placeholder:"名前を入力するか空欄のままにします",share:"共有ルート",destination:"移動先",open:"グリーティングを開く",copy:"リンクをコピー",copied:"コピーしました",failed:"コピーできませんでした。リンクを長押ししてコピーしてください。",note:"名前を空欄にすると汎用リンクになります。名前を入れると ?name=xxx が自動で追加されます。"},
  "ko-kr":{title:"축하 링크 · AERTEX",heading:"축하하고 싶은 사람에게 마음을 보내세요.",lead:"축하 페이지를 선택하세요. 이름은 선택 사항이며 AERTEX가 간단한 공유 경로를 만들어 해당 축하 페이지로 연결합니다.",choose:"축하 선택",birthday:"생일 축하합니다",birthdayNote:"생일에 보내기 좋습니다.",midAutumn:"즐거운 중추절",midAutumnNote:"중추절에 보내기 좋습니다.",recipient:"누구에게 보낼까요?",optional:"선택",placeholder:"이름을 입력하거나 비워 두세요",share:"공유 경로",destination:"이동 대상",open:"축하 열기",copy:"링크 복사",copied:"복사됨",failed:"복사하지 못했습니다. 링크를 길게 눌러 복사하세요.",note:"이름을 비워 두면 일반 링크를 만들고, 이름을 입력하면 ?name=xxx가 자동으로 추가됩니다."},
  "fr-fr":{title:"Liens de vœux · AERTEX",heading:"Envoyez un vœu à quelqu’un.",lead:"Choisissez une page de vœux. Le nom est facultatif ; AERTEX crée un lien de partage simple puis redirige vers la page choisie.",choose:"Choisir un vœu",birthday:"Joyeux anniversaire",birthdayNote:"À envoyer pour un anniversaire.",midAutumn:"Bonne fête de la mi-automne",midAutumnNote:"À envoyer pour la fête de la mi-automne.",recipient:"Pour qui ?",optional:"Facultatif",placeholder:"Saisissez un nom ou laissez vide",share:"Lien de partage",destination:"Destination",open:"Ouvrir le vœu",copy:"Copier le lien",copied:"Copié",failed:"Échec de la copie. Maintenez le lien pour le copier.",note:"Laissez le nom vide pour un lien générique. Ajouter un nom ajoute automatiquement ?name=xxx."},
  "es-es":{title:"Enlaces de felicitación · AERTEX",heading:"Envía una felicitación a alguien.",lead:"Elige una página de felicitación. El nombre es opcional; AERTEX crea una ruta sencilla para compartir y redirige a la felicitación seleccionada.",choose:"Elegir felicitación",birthday:"Feliz cumpleaños",birthdayNote:"Para cumpleaños.",midAutumn:"Feliz Festival del Medio Otoño",midAutumnNote:"Para el Festival del Medio Otoño.",recipient:"¿Para quién es?",optional:"Opcional",placeholder:"Escribe un nombre o déjalo vacío",share:"Ruta para compartir",destination:"Destino",open:"Abrir felicitación",copy:"Copiar enlace",copied:"Copiado",failed:"No se pudo copiar. Mantén pulsado el enlace para copiarlo.",note:"Deja el nombre vacío para un enlace genérico. Añadir un nombre agrega automáticamente ?name=xxx."},
  "el-gr":{title:"Σύνδεσμοι ευχών · AERTEX",heading:"Στείλτε μια ευχή σε κάποιον.",lead:"Επιλέξτε μια σελίδα ευχών. Το όνομα είναι προαιρετικό· το AERTEX δημιουργεί έναν καθαρό σύνδεσμο κοινοποίησης και οδηγεί στην επιλεγμένη ευχή.",choose:"Επιλέξτε ευχή",birthday:"Χρόνια πολλά",birthdayNote:"Για γενέθλια.",midAutumn:"Χαρούμενη Γιορτή του Μεσοφθινοπώρου",midAutumnNote:"Για τη Γιορτή του Μεσοφθινοπώρου.",recipient:"Για ποιον είναι;",optional:"Προαιρετικό",placeholder:"Γράψτε όνομα ή αφήστε κενό",share:"Σύνδεσμος κοινοποίησης",destination:"Προορισμός",open:"Άνοιγμα ευχής",copy:"Αντιγραφή συνδέσμου",copied:"Αντιγράφηκε",failed:"Η αντιγραφή απέτυχε. Πατήστε παρατεταμένα τον σύνδεσμο.",note:"Αφήστε το όνομα κενό για γενικό σύνδεσμο. Με όνομα προστίθεται αυτόματα ?name=xxx."},
  "ar-sa":{title:"روابط التهاني · AERTEX",heading:"أرسل تهنئة إلى من تريد.",lead:"اختر صفحة تهنئة. الاسم اختياري؛ ينشئ AERTEX رابط مشاركة بسيطًا ثم يوجّه إلى التهنئة المختارة.",choose:"اختر تهنئة",birthday:"عيد ميلاد سعيد",birthdayNote:"مناسبة لأعياد الميلاد.",midAutumn:"مهرجان منتصف الخريف السعيد",midAutumnNote:"مناسبة لمهرجان منتصف الخريف.",recipient:"لمن هذه التهنئة؟",optional:"اختياري",placeholder:"أدخل اسمًا أو اتركه فارغًا",share:"رابط المشاركة",destination:"الوجهة",open:"فتح التهنئة",copy:"نسخ الرابط",copied:"تم النسخ",failed:"تعذر النسخ. اضغط مطولًا على الرابط لنسخه.",note:"اترك الاسم فارغًا لإنشاء رابط عام. عند إضافة اسم يُلحق ?name=xxx تلقائيًا."}
};
WISHES_COPY["en-gb"]=WISHES_COPY["en-us"]; WISHES_COPY["en-au"]=WISHES_COPY["en-us"];


export function wishesContent(locale = "en-us") {
  const code = normalizeSupportedLocale(locale) || (locale === "zh" ? "zh-cn" : "en-us");
  const prefix = "/" + code;
  const text = WISHES_COPY[code] || WISHES_COPY["en-us"];

  return `
    <section class="wishes-studio" data-wishes-center>
      <header class="wishes-studio-hero">
        <div class="wishes-studio-heading">
          <span>AERTEX · WISHES</span>
          <h2>${text.heading}</h2>
          <p>${text.lead}</p>
        </div>
        <div class="wishes-studio-badge" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>
            <path d="M12 7v6M9.5 10h5"/>
          </svg>
        </div>
      </header>

      <section class="wishes-studio-panel">
        <div class="wishes-studio-section">
          <div class="wishes-studio-label">${text.choose}</div>
          <div class="wishes-studio-choices" role="radiogroup" aria-label="${text.choose}">
            <button class="wishes-studio-choice is-active" type="button" data-kind="birthday" role="radio" aria-checked="true">
              <span class="wishes-studio-choice-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="11" width="15" height="9" rx="1.5"/><path d="M4.5 15h15M12 11V7"/><path d="M12 4.2c1.15 1 1.15 1.9 0 2.8-1.15-.9-1.15-1.8 0-2.8Z"/></svg></span>
              <span><strong>${text.birthday}</strong><small>${text.birthdayNote}</small></span>
            </button>
            <button class="wishes-studio-choice" type="button" data-kind="mid-autumn" role="radio" aria-checked="false">
              <span class="wishes-studio-choice-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M19.2 15.4A7.8 7.8 0 0 1 8.6 4.8 8.2 8.2 0 1 0 19.2 15.4z"/></svg></span>
              <span><strong>${text.midAutumn}</strong><small>${text.midAutumnNote}</small></span>
            </button>
          </div>
        </div>

        <div class="wishes-studio-section">
          <div class="wishes-studio-label">${text.recipient}<span>${text.optional}</span></div>
          <input id="wish-name" class="wishes-studio-name" type="text" maxlength="36" autocomplete="off" placeholder="${text.placeholder}" aria-label="${text.recipient}">
        </div>

        <div class="wishes-studio-section">
          <div class="wishes-studio-results">
            <div class="wishes-studio-result"><small>${text.share}</small><a id="share-link" href="${prefix}/wish/birthday">${prefix}/wish/birthday</a></div>
            <div class="wishes-studio-result"><small>${text.destination}</small><a id="destination-link" href="${prefix}/birthday">${prefix}/birthday</a></div>
          </div>
          <div class="wishes-studio-actions">
            <a id="open-link" class="wishes-studio-action is-primary" href="${prefix}/wish/birthday">${text.open}</a>
            <button id="copy-link" class="wishes-studio-action" type="button">${text.copy}</button>
          </div>
          <p class="wishes-studio-note">${text.note}</p>
          <div id="copy-status" class="wishes-studio-status" role="status" aria-live="polite"></div>
        </div>
      </section>
    </section>

    <style>
      .wishes-studio{display:grid;gap:16px;min-width:0}
      .wishes-studio-hero{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px;align-items:end;padding:28px;border:1px solid color-mix(in srgb,var(--border) 82%,transparent);border-radius:24px;background:radial-gradient(520px 260px at 94% 0%,color-mix(in srgb,var(--primary) 14%,transparent),transparent 72%),linear-gradient(145deg,color-mix(in srgb,var(--primary) 5%,var(--card)),var(--card));box-shadow:inset 0 1px 0 color-mix(in srgb,#fff 18%,transparent),0 18px 46px rgba(0,0,0,.06)}
      .wishes-studio-heading>span{display:block;color:var(--primary);font-size:11px;font-weight:720;letter-spacing:.11em}
      .wishes-studio-heading h2{max-width:860px;margin:8px 0 10px;font-size:clamp(34px,4.2vw,54px);line-height:.98;letter-spacing:-.055em;text-wrap:balance}
      .wishes-studio-heading p{max-width:760px;margin:0;color:var(--muted);font-size:13px;line-height:1.62}
      .wishes-studio-badge{width:72px;height:72px;display:grid;place-items:center;border-radius:22px;color:var(--primary);background:color-mix(in srgb,var(--primary) 12%,var(--fill));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 18%,var(--border)),0 12px 30px color-mix(in srgb,var(--primary) 10%,transparent)}
      .wishes-studio-badge svg{width:34px;height:34px}
      .wishes-studio-panel{overflow:hidden;border:1px solid color-mix(in srgb,var(--border) 84%,transparent);border-radius:22px;background:color-mix(in srgb,var(--card) 94%,transparent);box-shadow:0 14px 38px rgba(0,0,0,.045)}
      .wishes-studio-section{padding:22px}.wishes-studio-section+.wishes-studio-section{border-top:1px solid var(--hairline)}
      .wishes-studio-label{display:flex;align-items:center;gap:8px;margin-bottom:13px;color:var(--muted);font-size:12px;font-weight:650}.wishes-studio-label>span{padding:3px 7px;border-radius:999px;background:var(--fill);color:var(--quiet);font-size:9px;font-weight:700}
      .wishes-studio-choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
      .wishes-studio-choice{display:grid!important;grid-template-columns:44px minmax(0,1fr)!important;gap:13px!important;align-items:center!important;min-height:106px!important;margin:0!important;padding:16px!important;border:1px solid var(--border)!important;border-radius:18px!important;background:var(--surface)!important;color:var(--text)!important;text-align:left!important;box-shadow:none!important;cursor:pointer;transition:transform .16s ease,border-color .16s ease,background .16s ease,box-shadow .16s ease!important}
      .wishes-studio-choice:hover{transform:translateY(-1px);border-color:color-mix(in srgb,var(--primary) 28%,var(--border))!important;background:color-mix(in srgb,var(--primary) 3%,var(--surface))!important}
      .wishes-studio-choice.is-active{border-color:color-mix(in srgb,var(--primary) 58%,var(--border))!important;background:color-mix(in srgb,var(--primary) 7%,var(--surface))!important;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 18%,transparent)!important}
      .wishes-studio-choice-icon{width:44px;height:44px;display:grid;place-items:center;border-radius:13px;background:var(--fill);color:var(--primary);line-height:1}.wishes-studio-choice-icon svg{width:22px;height:22px}
      .wishes-studio-choice strong,.wishes-studio-choice small{display:block}.wishes-studio-choice strong{font-size:16px;line-height:1.25;letter-spacing:-.02em}.wishes-studio-choice small{margin-top:6px;color:var(--muted);font-size:11px;line-height:1.45}
      .wishes-studio-name{width:100%!important;height:48px!important;min-height:48px!important;margin:0!important;padding:0 14px!important;border:1px solid var(--border)!important;border-radius:14px!important;background:var(--surface)!important;color:var(--text)!important;box-shadow:none!important;outline:none!important}
      .wishes-studio-name:focus{border-color:color-mix(in srgb,var(--primary) 56%,var(--border))!important;box-shadow:0 0 0 4px color-mix(in srgb,var(--primary) 10%,transparent)!important}
      .wishes-studio-results{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.wishes-studio-result{min-width:0;padding:14px 15px;border-radius:15px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border)}.wishes-studio-result small{display:block;margin-bottom:7px;color:var(--muted);font-size:10px}.wishes-studio-result a{display:block;overflow:hidden;color:var(--text);font:600 12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;text-decoration:none;text-overflow:ellipsis;white-space:nowrap}
      .wishes-studio-actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:14px}.wishes-studio-action{display:inline-flex!important;align-items:center;justify-content:center;width:auto!important;min-height:40px!important;margin:0!important;padding:0 14px!important;border:0!important;border-radius:12px!important;background:var(--fill)!important;color:var(--text)!important;box-shadow:none!important;text-decoration:none;font-size:12px!important;font-weight:700!important}.wishes-studio-action.is-primary{background:var(--primary)!important;color:#fff!important}
      .wishes-studio-note{margin:13px 0 0;color:var(--muted);font-size:11px;line-height:1.55}.wishes-studio-status{min-height:18px;margin-top:8px;color:var(--muted);font-size:11px}
      @media(max-width:760px){.wishes-studio-hero{grid-template-columns:1fr;padding:20px}.wishes-studio-badge{width:58px;height:58px;border-radius:18px}.wishes-studio-choices,.wishes-studio-results{grid-template-columns:1fr}.wishes-studio-section{padding:18px}.wishes-studio-actions{display:grid;grid-template-columns:1fr 1fr}.wishes-studio-action{width:100%!important}}
    </style>

    <script>
      (() => {
        const root=document.querySelector("[data-wishes-center]");
        if(!root)return;
        const prefix=${JSON.stringify(prefix)};
        const copyLabel=${JSON.stringify(text.copy)};
        const copiedLabel=${JSON.stringify(text.copied)};
        const failedLabel=${JSON.stringify(text.failed)};
        const choices=[...root.querySelectorAll("[data-kind]")];
        const nameInput=root.querySelector("#wish-name");
        const shareLink=root.querySelector("#share-link");
        const destinationLink=root.querySelector("#destination-link");
        const openLink=root.querySelector("#open-link");
        const copyButton=root.querySelector("#copy-link");
        const status=root.querySelector("#copy-status");
        let kind="birthday";
        const cleanName=value=>String(value||"").replace(/[\\u0000-\\u001f\\u007f]/g," ").replace(/\\s+/g," ").trim().slice(0,36);
        const paint=()=>{
          const name=cleanName(nameInput.value);
          const suffix=name?"?name="+encodeURIComponent(name):"";
          const shortPath=prefix+"/wish/"+kind+suffix;
          const targetPath=prefix+"/"+kind+suffix;
          const shortUrl=location.origin+shortPath;
          shareLink.href=shortUrl;shareLink.textContent=shortPath;shareLink.title=shortUrl;
          destinationLink.href=location.origin+targetPath;destinationLink.textContent=targetPath;
          openLink.href=shortUrl;
          const state=new URLSearchParams();state.set("type",kind);if(name)state.set("name",name);
          history.replaceState(null,"",location.pathname+"?"+state.toString());
        };
        const select=next=>{
          kind=next==="mid-autumn"?"mid-autumn":"birthday";
          choices.forEach(button=>{const active=button.dataset.kind===kind;button.classList.toggle("is-active",active);button.setAttribute("aria-checked",active?"true":"false")});
          status.textContent="";copyButton.textContent=copyLabel;paint();
        };
        choices.forEach(button=>button.addEventListener("click",()=>select(button.dataset.kind)));
        nameInput.addEventListener("input",()=>{status.textContent="";copyButton.textContent=copyLabel;paint()});
        copyButton.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(shareLink.href);copyButton.textContent=copiedLabel;status.textContent=copiedLabel;setTimeout(()=>copyButton.textContent=copyLabel,1600)}catch{status.textContent=failedLabel}});
        const initial=new URLSearchParams(location.search);const initialName=cleanName(initial.get("name"));if(initialName)nameInput.value=initialName;select(initial.get("type"));
      })();
    <\/script>`;
}
