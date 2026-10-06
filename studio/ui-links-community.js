/**
 * 【初学者导读】
 * 文件：studio/ui-links-community.js
 * 这是 AERTEX 前端 UI 模块（links-community）：通常同时包含页面模板、局部状态、DOM 更新、事件绑定以及对后端 API 的调用。
 * 阅读顺序：①先搜索页面上能看到的标题/按钮文字定位 render；②找 render 依赖的 state；③找 state 在哪里被 API/事件更新；④再去后端搜索相同 API 路径。
 * 初学者提醒：HTML 字符串负责结构，CSS class 负责样式，事件监听负责交互，fetch/API 负责数据；这四层出现问题时要分别排查。
 * 修改注意：不要随意改掉已有 id/data-* 属性，它们可能被事件绑定、自动测试或别的模块引用；动态插入用户文本时要继续做转义。
 * 响应式注意：桌面布局正常并不代表窄屏正常，修改结构后至少检查大屏、平板和手机断点。
 */
import { normalizeSupportedLocale } from "./locale.js";

const COMMUNITY_EN = {
  submit:"Create link",publish:"Publish to Community",publishHint:"Turn on to make this link public. Off keeps it private to you and administrators.",
  library:"Community library",title:"Community links",intro:"Only links explicitly shared by their creators appear here. Private and non-shared links never enter Community search results.",
  shared:"shared by users",back:"Back to Saved Links",search:"Search community links",loading:"Loading community links…",
  empty:"No links have been shared to the community yet.",noResults:"No community links match your search.",owner:"Shared by",count:"community links",
  signIn:"Sign in to view community links.",unavailable:"Community links are currently unavailable."
};

const COMMUNITY_COPY = {
  "en-us":COMMUNITY_EN,"en-gb":COMMUNITY_EN,"en-au":COMMUNITY_EN,
  "zh-cn":{submit:"新建链接",publish:"发布到社区",publishHint:"开启后公开给所有用户；关闭时仅你和管理员可见。",library:"社区链接库",title:"社区链接",intro:"这里仅展示用户主动选择公开到社区的链接。私人链接和未公开内容不会出现在社区搜索结果中。",shared:"用户公开分享",back:"返回收藏链接",search:"搜索社区链接",loading:"正在读取社区链接…",empty:"社区里还没有公开链接。",noResults:"没有符合搜索条件的社区链接。",owner:"分享者",count:"社区链接",signIn:"请先登录后查看社区链接。",unavailable:"当前无法读取社区链接。"},
  "zh-tw":{submit:"建立連結",publish:"發佈到社群",publishHint:"開啟後會公開給所有使用者；關閉時只有你與管理員可見。",library:"社群連結庫",title:"社群連結",intro:"這裡只顯示使用者主動公開到社群的連結。私人連結與未公開內容不會出現在社群搜尋結果中。",shared:"使用者公開分享",back:"返回收藏連結",search:"搜尋社群連結",loading:"正在讀取社群連結…",empty:"社群目前還沒有公開連結。",noResults:"沒有符合搜尋條件的社群連結。",owner:"分享者",count:"社群連結",signIn:"請先登入再查看社群連結。",unavailable:"目前無法讀取社群連結。"},
  "ja-jp":{submit:"リンクを作成",publish:"コミュニティに公開",publishHint:"オンにすると全ユーザーに公開されます。オフの場合は自分と管理者だけが閲覧できます。",library:"コミュニティライブラリ",title:"コミュニティリンク",intro:"作成者が明示的に公開したリンクだけを表示します。非公開リンクや未公開の内容がコミュニティ検索に表示されることはありません。",shared:"ユーザーによる公開",back:"保存済みリンクに戻る",search:"コミュニティリンクを検索",loading:"コミュニティリンクを読み込み中…",empty:"コミュニティに公開されたリンクはまだありません。",noResults:"検索条件に一致するコミュニティリンクはありません。",owner:"共有者",count:"コミュニティリンク",signIn:"コミュニティリンクを見るにはサインインしてください。",unavailable:"現在コミュニティリンクを読み込めません。"},
  "ko-kr":{submit:"링크 만들기",publish:"커뮤니티에 공개",publishHint:"켜면 모든 사용자에게 공개됩니다. 끄면 본인과 관리자만 볼 수 있습니다.",library:"커뮤니티 라이브러리",title:"커뮤니티 링크",intro:"작성자가 명시적으로 공개한 링크만 표시됩니다. 비공개 링크와 공개하지 않은 내용은 커뮤니티 검색 결과에 나타나지 않습니다.",shared:"사용자 공개 공유",back:"저장된 링크로 돌아가기",search:"커뮤니티 링크 검색",loading:"커뮤니티 링크 불러오는 중…",empty:"아직 커뮤니티에 공개된 링크가 없습니다.",noResults:"검색 조건에 맞는 커뮤니티 링크가 없습니다.",owner:"공유자",count:"커뮤니티 링크",signIn:"커뮤니티 링크를 보려면 로그인하세요.",unavailable:"현재 커뮤니티 링크를 불러올 수 없습니다."},
  "fr-fr":{submit:"Créer le lien",publish:"Publier dans la communauté",publishHint:"Activez cette option pour rendre le lien public. Désactivée, il reste visible uniquement par vous et les administrateurs.",library:"Bibliothèque communautaire",title:"Liens de la communauté",intro:"Seuls les liens explicitement partagés par leurs créateurs apparaissent ici. Les liens privés et non publiés n’entrent jamais dans les résultats de la communauté.",shared:"partagés par les utilisateurs",back:"Retour aux liens enregistrés",search:"Rechercher dans la communauté",loading:"Chargement des liens de la communauté…",empty:"Aucun lien n’a encore été partagé avec la communauté.",noResults:"Aucun lien de la communauté ne correspond à la recherche.",owner:"Partagé par",count:"liens de la communauté",signIn:"Connectez-vous pour voir les liens de la communauté.",unavailable:"Les liens de la communauté sont actuellement indisponibles."},
  "es-es":{submit:"Crear enlace",publish:"Publicar en la comunidad",publishHint:"Actívalo para hacer público este enlace. Desactivado, solo tú y los administradores podrán verlo.",library:"Biblioteca de la comunidad",title:"Enlaces de la comunidad",intro:"Aquí solo aparecen los enlaces que sus creadores han compartido explícitamente. Los enlaces privados y no publicados nunca entran en los resultados de la comunidad.",shared:"compartidos por usuarios",back:"Volver a Enlaces guardados",search:"Buscar enlaces de la comunidad",loading:"Cargando enlaces de la comunidad…",empty:"Todavía no se ha compartido ningún enlace con la comunidad.",noResults:"Ningún enlace de la comunidad coincide con la búsqueda.",owner:"Compartido por",count:"enlaces de la comunidad",signIn:"Inicia sesión para ver los enlaces de la comunidad.",unavailable:"Los enlaces de la comunidad no están disponibles en este momento."},
  "el-gr":{submit:"Δημιουργία συνδέσμου",publish:"Δημοσίευση στην κοινότητα",publishHint:"Ενεργοποιήστε το για να γίνει ο σύνδεσμος δημόσιος. Όταν είναι κλειστός, παραμένει ορατός μόνο σε εσάς και στους διαχειριστές.",library:"Βιβλιοθήκη κοινότητας",title:"Σύνδεσμοι κοινότητας",intro:"Εδώ εμφανίζονται μόνο σύνδεσμοι που οι δημιουργοί τους επέλεξαν ρητά να δημοσιεύσουν. Οι ιδιωτικοί και μη δημοσιευμένοι σύνδεσμοι δεν εμφανίζονται ποτέ στα αποτελέσματα της κοινότητας.",shared:"δημόσιες κοινοποιήσεις χρηστών",back:"Πίσω στους αποθηκευμένους συνδέσμους",search:"Αναζήτηση συνδέσμων κοινότητας",loading:"Φόρτωση συνδέσμων κοινότητας…",empty:"Δεν έχουν δημοσιευτεί ακόμη σύνδεσμοι στην κοινότητα.",noResults:"Δεν υπάρχουν σύνδεσμοι κοινότητας που να ταιριάζουν στην αναζήτηση.",owner:"Κοινοποιήθηκε από",count:"σύνδεσμοι κοινότητας",signIn:"Συνδεθείτε για να δείτε τους συνδέσμους κοινότητας.",unavailable:"Οι σύνδεσμοι κοινότητας δεν είναι διαθέσιμοι αυτή τη στιγμή."},
  "ar-sa":{submit:"إنشاء رابط",publish:"النشر في المجتمع",publishHint:"فعّل هذا الخيار لجعل الرابط عامًا. عند إيقافه يبقى مرئيًا لك وللمشرفين فقط.",library:"مكتبة المجتمع",title:"روابط المجتمع",intro:"لا تظهر هنا إلا الروابط التي اختار أصحابها مشاركتها علنًا. الروابط الخاصة وغير المنشورة لا تدخل نتائج بحث المجتمع.",shared:"مشاركات المستخدمين العامة",back:"العودة إلى الروابط المحفوظة",search:"البحث في روابط المجتمع",loading:"جارٍ تحميل روابط المجتمع…",empty:"لم تتم مشاركة أي روابط مع المجتمع بعد.",noResults:"لا توجد روابط مجتمع تطابق البحث.",owner:"شاركها",count:"روابط المجتمع",signIn:"سجّل الدخول لعرض روابط المجتمع.",unavailable:"روابط المجتمع غير متاحة حاليًا."}
};

function communityLocale(zh, locale) {
  return normalizeSupportedLocale(locale) || (zh ? "zh-cn" : "en-us");
}

export function enhanceLinksHubWithCommunity(content, zh, locale = "") {
  const activeLocale = communityLocale(zh, locale);
  const prefix = "/" + activeLocale;
  const copy = COMMUNITY_COPY[activeLocale] || COMMUNITY_EN;
  const communityHref = prefix + "/info/links/community";
  let output = String(content || "");

  const submitButton = '<button class="links-quick-submit" id="links-quick-submit" type="submit" disabled>' + copy.submit + '</button>';
  output = output.replace(
    submitButton,
    `<div class="links-create-actions">${submitButton}<label class="links-community-option"><input id="links-community-opt-in" type="checkbox"><span class="links-community-switch" aria-hidden="true"></span><span class="links-community-copy"><strong>${copy.publish}</strong><small>${copy.publishHint}</small></span></label></div>`
  );

  output = output.replace(
    "body:JSON.stringify({ title:inferTitle(url), url, category:'tools', description:'' })",
    "body:JSON.stringify({ title:inferTitle(url), url, category:'tools', description:'', community:Boolean(document.getElementById('links-community-opt-in')?.checked) })"
  );

  const curatedNeedle = '<a class="links-route-card" href="' + prefix + '/info/links/curated">';
  const communityCard = `
      <a class="links-route-card links-community-route-card" href="${communityHref}">
        <div>
          <span class="links-card-eyebrow">${copy.library}</span>
          <h2>${copy.title}</h2>
          <p>${copy.intro}</p>
          <div class="links-route-meta"><strong>↗</strong><span>${copy.shared}</span></div>
        </div>
        <span class="links-route-arrow" aria-hidden="true">→</span>
      </a>

      `;
  output = output.replace(curatedNeedle, communityCard + curatedNeedle);

  output += `
    <style>
      .links-create-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
      .links-community-option{position:relative;display:flex;align-items:center;gap:10px;min-height:48px;padding:0 10px;border-radius:13px;background:transparent;cursor:pointer;user-select:none;transition:background .12s ease}
      .links-community-option:hover{background:var(--fill)}
      .links-community-option input{position:absolute!important;width:1px!important;height:1px!important;min-height:1px!important;margin:0!important;padding:0!important;border:0!important;opacity:0!important;pointer-events:none!important;box-shadow:none!important}
      .links-community-switch{position:relative;display:block!important;width:40px;height:24px;flex:0 0 40px;border-radius:999px;background:var(--secondary);box-shadow:inset 0 0 0 1px var(--border);transition:background .18s ease,box-shadow .18s ease}
      .links-community-switch::after{content:"";position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;background:var(--card);box-shadow:0 1px 3px rgba(0,0,0,.18);transition:transform .18s cubic-bezier(.2,.8,.2,1)}
      .links-community-option input:checked + .links-community-switch{background:var(--primary);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 82%,black)}
      .links-community-option input:checked + .links-community-switch::after{transform:translateX(16px)}
      .links-community-option input:focus-visible + .links-community-switch{outline:3px solid color-mix(in srgb,var(--primary) 18%,transparent);outline-offset:2px}
      .links-community-copy{display:grid!important;gap:1px;min-width:0}.links-community-copy strong{font-size:12px;font-weight:680;line-height:1.3}.links-community-copy small{max-width:390px;color:var(--muted);font-size:10px;line-height:1.35}
      @media(max-width:700px){.links-create-actions{align-items:stretch;flex-direction:column}.links-community-option{width:100%;padding:8px 2px}.links-community-option:hover{background:transparent}}
    </style>
  `;
  return output;
}

export function communityLinksPageContent(zh, locale = "") {
  const activeLocale = communityLocale(zh, locale);
  const prefix = "/" + activeLocale;
  const copy = COMMUNITY_COPY[activeLocale] || COMMUNITY_EN;
  const backHref = prefix + "/info/links";
  return `
    <style>
      .community-links-shell{border:1px solid var(--border);border-radius:22px;background:var(--card);overflow:hidden}
      .community-links-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;padding:22px 24px;border-bottom:1px solid var(--hairline)}
      .community-links-head small{display:block;color:var(--muted);font-size:11px;font-weight:680}.community-links-head h2{margin:5px 0 7px;font-size:25px;letter-spacing:-.035em}.community-links-head p{max-width:850px;margin:0;color:var(--muted);font-size:13px;line-height:1.55}
      .community-links-back{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 11px;border-radius:10px;background:var(--fill);color:var(--text);text-decoration:none;font-size:12px;font-weight:650}.community-links-back:hover{background:var(--secondary)}
      .community-links-body{padding:18px}.community-search-shell{display:flex;align-items:center;gap:9px;min-height:46px;padding:0 12px;border-radius:12px;background:var(--surface);box-shadow:inset 0 0 0 1px var(--border)}.community-search-shell:focus-within{box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 14%,transparent),inset 0 0 0 1px var(--primary)}
      .community-search-shell svg{width:17px;height:17px;flex:0 0 auto;fill:none;stroke:var(--muted);stroke-width:1.8;stroke-linecap:round}.community-search-shell input{width:100%;height:44px;margin:0!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;color:var(--text)!important;font-size:14px!important;outline:none!important}.community-search-shell kbd{display:grid;place-items:center;min-width:24px;height:24px;padding:0 6px;border-radius:6px;background:var(--fill);color:var(--quiet);font:11px ui-monospace,SFMono-Regular,Menlo,monospace}
      .community-count{display:flex;align-items:center;gap:6px;margin:12px 2px;color:var(--muted);font-size:11px}.community-count strong{display:grid;place-items:center;min-width:30px;height:26px;padding:0 9px;border-radius:999px;background:var(--fill);color:var(--text);font-size:12px}
      .community-links-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.community-link-card{display:flex;min-width:0;min-height:150px;flex-direction:column;padding:14px;border-radius:14px;background:var(--fill);color:var(--text);text-decoration:none;box-shadow:inset 0 0 0 1px var(--border)}.community-link-card:hover{background:var(--secondary)}.community-link-card-top{display:flex;justify-content:space-between;gap:10px}.community-link-card-top strong{font-size:14px;line-height:1.3}.community-link-card-top span{color:var(--primary)}.community-link-card p{margin:8px 0 12px;color:var(--muted);font-size:12.5px;line-height:1.45}.community-link-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:auto;color:var(--quiet)}.community-link-meta span{font-size:10px}.community-link-meta code{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:10px ui-monospace,SFMono-Regular,Menlo,monospace}
      .community-empty{display:grid;place-items:center;min-height:180px;padding:28px;border-radius:16px;background:var(--fill);color:var(--muted);font-size:12px;text-align:center}.community-empty[hidden]{display:none}
      @media(max-width:980px){.community-links-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:700px){.community-links-head{align-items:flex-start;flex-direction:column;padding:18px}.community-links-body{padding:12px}.community-links-grid{grid-template-columns:1fr}.community-search-shell kbd{display:none}}
    </style>
    <section class="community-links-shell">
      <header class="community-links-head">
        <div><small>${copy.eyebrow}</small><h2>${copy.title}</h2><p>${copy.intro}</p></div>
        <a class="community-links-back" href="${backHref}">← ${copy.back}</a>
      </header>
      <div class="community-links-body">
        <div class="community-search-shell"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path></svg><input id="community-link-search" type="search" autocomplete="off" placeholder="${copy.search}" aria-label="${copy.search}"><kbd aria-hidden="true">/</kbd></div>
        <div class="community-count"><strong id="community-link-count">0</strong><span>${copy.count}</span></div>
        <div class="community-links-grid" id="community-links-grid"></div>
        <div class="community-empty" id="community-links-empty">${copy.loading}</div>
      </div>
    </section>
    <script>
      (() => {
        const copy=${JSON.stringify(copy)};
        let links=[];
        const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
        const host=value=>{try{return new URL(value).hostname.replace(/^www\./,'')}catch{return 'external'}};
        async function session(){if(typeof supabaseClient==='undefined')return null;const result=await supabaseClient.auth.getSession();return result?.data?.session||null;}
        function draw(){const search=document.getElementById('community-link-search');const grid=document.getElementById('community-links-grid');const empty=document.getElementById('community-links-empty');const count=document.getElementById('community-link-count');if(!grid||!empty)return;const q=String(search?.value||'').trim().toLocaleLowerCase();const visible=links.filter(link=>!q||[link.title,link.description,link.url,link.owner_label].join(' ').toLocaleLowerCase().includes(q));grid.innerHTML=visible.map(link=>'<a class="community-link-card" href="'+esc(link.url)+'" target="_blank" rel="noopener noreferrer"><div class="community-link-card-top"><strong>'+esc(link.title)+'</strong><span>↗</span></div><p>'+esc(link.description||link.url)+'</p><div class="community-link-meta"><span>'+esc(copy.owner)+' '+esc(link.owner_label||'')+'</span><code>'+esc(host(link.url))+'</code></div></a>').join('');empty.hidden=visible.length>0;empty.textContent=links.length?copy.noResults:copy.empty;if(count)count.textContent=String(links.length);}
        async function init(){const s=await session();const empty=document.getElementById('community-links-empty');if(!s){if(empty)empty.textContent=${JSON.stringify(copy.signIn)};return;}try{const response=await fetch('/api/user-links?scope=community',{headers:{Authorization:'Bearer '+s.access_token,Accept:'application/json'},cache:'no-store'});if(!response.ok)throw new Error('HTTP '+response.status);const payload=await response.json();links=Array.isArray(payload.links)?payload.links:[];const search=document.getElementById('community-link-search');search?.addEventListener('input',draw);document.addEventListener('keydown',event=>{const target=event.target;const typing=target instanceof HTMLInputElement||target instanceof HTMLTextAreaElement||target instanceof HTMLSelectElement||target?.isContentEditable;if(event.key==='/'&&!typing){event.preventDefault();search?.focus();}if(event.key==='Escape'&&document.activeElement===search&&search?.value){search.value='';draw();}});draw();}catch(error){console.error('Community links failed',error);if(empty)empty.textContent=${JSON.stringify(copy.unavailable)};}}
        if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',init,{once:true});else window.setTimeout(init,0);
      })();
    </script>
  `;
}
