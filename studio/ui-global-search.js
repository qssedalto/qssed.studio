/**
 * 【初学者导读】
 * 文件：studio/ui-global-search.js
 * 这是 AERTEX 前端 UI 模块（global-search）：通常同时包含页面模板、局部状态、DOM 更新、事件绑定以及对后端 API 的调用。
 * 阅读顺序：①先搜索页面上能看到的标题/按钮文字定位 render；②找 render 依赖的 state；③找 state 在哪里被 API/事件更新；④再去后端搜索相同 API 路径。
 * 初学者提醒：HTML 字符串负责结构，CSS class 负责样式，事件监听负责交互，fetch/API 负责数据；这四层出现问题时要分别排查。
 * 修改注意：不要随意改掉已有 id/data-* 属性，它们可能被事件绑定、自动测试或别的模块引用；动态插入用户文本时要继续做转义。
 * 响应式注意：桌面布局正常并不代表窄屏正常，修改结构后至少检查大屏、平板和手机断点。
 */
import { normalizeSupportedLocale } from "./locale.js";

const GLOBAL_SEARCH_EN = {
  eyebrow:"Global Search",title:"Search your Studio",
  intro:"Search Knowledge, research notes, summaries, account links, community links, and curated links in one place. Private content keeps its existing visibility rules; search never expands access.",
  placeholder:"Search knowledge, notes, links, summaries…",hint:"Enter at least one keyword",searching:"Searching…",empty:"No results",
  emptyDetail:"Try another keyword or switch back to All.",error:"Search is temporarily unavailable",
  partial:"Some modules are temporarily unavailable. Available results are still shown below.",result:"results",all:"All",knowledge:"Knowledge",
  note:"Research notes",summary:"Summaries",link:"Account / admin links",community_link:"Community",curated_link:"Curated",private:"Private",
  community:"Community",curated:"Curated",admin:"Admin scope",current:"Current account",open:"Open",external:"External link",shortcut:"Press / to focus search"
};

const GLOBAL_SEARCH_COPY = {
  "en-us":GLOBAL_SEARCH_EN,"en-gb":GLOBAL_SEARCH_EN,"en-au":GLOBAL_SEARCH_EN,
  "zh-cn":{eyebrow:"全局搜索",title:"搜索你的 Studio",intro:"统一搜索知识库、研究笔记、摘要、账号链接、社区链接和精选链接。私人内容仍按原有权限隔离，搜索不会扩大任何内容的可见范围。",placeholder:"搜索知识、笔记、链接、摘要…",hint:"输入至少 1 个关键词",searching:"正在搜索…",empty:"没有找到结果",emptyDetail:"换一个关键词，或切换到“全部”。",error:"搜索暂时不可用",partial:"部分模块暂时不可用，下面仍展示已完成的结果。",result:"个结果",all:"全部",knowledge:"知识库",note:"研究笔记",summary:"摘要",link:"我的 / 管理链接",community_link:"社区",curated_link:"精选",private:"私人",community:"社区",curated:"精选",admin:"管理员范围",current:"当前账号",open:"打开",external:"外部链接",shortcut:"按 / 聚焦搜索"},
  "zh-tw":{eyebrow:"全域搜尋",title:"搜尋你的 Studio",intro:"一次搜尋知識庫、研究筆記、摘要、帳號連結、社群連結與精選連結。私人內容仍沿用原有可見性規則，搜尋不會擴大存取權限。",placeholder:"搜尋知識、筆記、連結、摘要…",hint:"請輸入至少 1 個關鍵字",searching:"正在搜尋…",empty:"找不到結果",emptyDetail:"換一個關鍵字，或切回「全部」。",error:"搜尋暫時無法使用",partial:"部分模組暫時無法使用，以下仍顯示已完成的結果。",result:"個結果",all:"全部",knowledge:"知識庫",note:"研究筆記",summary:"摘要",link:"帳號 / 管理連結",community_link:"社群",curated_link:"精選",private:"私人",community:"社群",curated:"精選",admin:"管理員範圍",current:"目前帳號",open:"開啟",external:"外部連結",shortcut:"按 / 聚焦搜尋"},
  "ja-jp":{eyebrow:"グローバル検索",title:"Studio 全体を検索",intro:"Knowledge、研究ノート、要約、アカウントリンク、コミュニティリンク、厳選リンクをまとめて検索します。非公開コンテンツの公開範囲は変わらず、検索によってアクセス権が広がることはありません。",placeholder:"知識、ノート、リンク、要約を検索…",hint:"キーワードを1つ以上入力してください",searching:"検索中…",empty:"結果がありません",emptyDetail:"別のキーワードを試すか、「すべて」に戻してください。",error:"検索は一時的に利用できません",partial:"一部のモジュールは一時的に利用できません。取得できた結果は引き続き表示しています。",result:"件",all:"すべて",knowledge:"Knowledge",note:"研究ノート",summary:"要約",link:"アカウント / 管理リンク",community_link:"コミュニティ",curated_link:"厳選",private:"非公開",community:"コミュニティ",curated:"厳選",admin:"管理者範囲",current:"現在のアカウント",open:"開く",external:"外部リンク",shortcut:"/ キーで検索にフォーカス"},
  "ko-kr":{eyebrow:"전체 검색",title:"Studio 전체 검색",intro:"Knowledge, 연구 노트, 요약, 계정 링크, 커뮤니티 링크와 선별 링크를 한곳에서 검색합니다. 비공개 콘텐츠의 기존 공개 범위는 유지되며 검색으로 접근 권한이 확대되지 않습니다.",placeholder:"지식, 노트, 링크, 요약 검색…",hint:"검색어를 1개 이상 입력하세요",searching:"검색 중…",empty:"검색 결과가 없습니다",emptyDetail:"다른 검색어를 입력하거나 ‘전체’로 돌아가세요.",error:"검색을 일시적으로 사용할 수 없습니다",partial:"일부 모듈을 일시적으로 사용할 수 없습니다. 확인된 결과는 아래에 계속 표시됩니다.",result:"개 결과",all:"전체",knowledge:"Knowledge",note:"연구 노트",summary:"요약",link:"계정 / 관리자 링크",community_link:"커뮤니티",curated_link:"선별",private:"비공개",community:"커뮤니티",curated:"선별",admin:"관리자 범위",current:"현재 계정",open:"열기",external:"외부 링크",shortcut:"/ 키로 검색창에 포커스"},
  "fr-fr":{eyebrow:"Recherche globale",title:"Rechercher dans votre Studio",intro:"Recherchez au même endroit dans Knowledge, les notes de recherche, les résumés, les liens du compte, les liens communautaires et les liens sélectionnés. Les règles de visibilité restent inchangées et la recherche n’élargit jamais les accès.",placeholder:"Rechercher connaissances, notes, liens, résumés…",hint:"Saisissez au moins un mot-clé",searching:"Recherche…",empty:"Aucun résultat",emptyDetail:"Essayez un autre mot-clé ou revenez à « Tout ».",error:"La recherche est temporairement indisponible",partial:"Certains modules sont temporairement indisponibles. Les résultats disponibles restent affichés ci-dessous.",result:"résultats",all:"Tout",knowledge:"Knowledge",note:"Notes de recherche",summary:"Résumés",link:"Liens compte / admin",community_link:"Communauté",curated_link:"Sélection",private:"Privé",community:"Communauté",curated:"Sélection",admin:"Portée administrateur",current:"Compte actuel",open:"Ouvrir",external:"Lien externe",shortcut:"Appuyez sur / pour rechercher"},
  "es-es":{eyebrow:"Búsqueda global",title:"Busca en todo tu Studio",intro:"Busca en Knowledge, notas de investigación, resúmenes, enlaces de la cuenta, enlaces de la comunidad y enlaces seleccionados desde un solo lugar. El contenido privado conserva sus reglas de visibilidad y la búsqueda nunca amplía el acceso.",placeholder:"Buscar conocimiento, notas, enlaces, resúmenes…",hint:"Introduce al menos una palabra clave",searching:"Buscando…",empty:"No hay resultados",emptyDetail:"Prueba otra palabra o vuelve a «Todo».",error:"La búsqueda no está disponible temporalmente",partial:"Algunos módulos no están disponibles temporalmente. Los resultados disponibles se siguen mostrando abajo.",result:"resultados",all:"Todo",knowledge:"Knowledge",note:"Notas de investigación",summary:"Resúmenes",link:"Enlaces de cuenta / admin",community_link:"Comunidad",curated_link:"Seleccionados",private:"Privado",community:"Comunidad",curated:"Seleccionados",admin:"Ámbito de administrador",current:"Cuenta actual",open:"Abrir",external:"Enlace externo",shortcut:"Pulsa / para enfocar la búsqueda"},
  "el-gr":{eyebrow:"Καθολική αναζήτηση",title:"Αναζήτηση σε όλο το Studio",intro:"Αναζητήστε Knowledge, ερευνητικές σημειώσεις, περιλήψεις, συνδέσμους λογαριασμού, συνδέσμους κοινότητας και επιλεγμένους συνδέσμους από ένα σημείο. Οι κανόνες ορατότητας των ιδιωτικών δεδομένων παραμένουν ίδιοι και η αναζήτηση δεν διευρύνει την πρόσβαση.",placeholder:"Αναζήτηση γνώσης, σημειώσεων, συνδέσμων, περιλήψεων…",hint:"Εισαγάγετε τουλάχιστον μία λέξη-κλειδί",searching:"Αναζήτηση…",empty:"Δεν βρέθηκαν αποτελέσματα",emptyDetail:"Δοκιμάστε άλλη λέξη-κλειδί ή επιστρέψτε στο «Όλα».",error:"Η αναζήτηση δεν είναι προσωρινά διαθέσιμη",partial:"Ορισμένες ενότητες δεν είναι προσωρινά διαθέσιμες. Τα διαθέσιμα αποτελέσματα εμφανίζονται παρακάτω.",result:"αποτελέσματα",all:"Όλα",knowledge:"Knowledge",note:"Ερευνητικές σημειώσεις",summary:"Περιλήψεις",link:"Σύνδεσμοι λογαριασμού / διαχειριστή",community_link:"Κοινότητα",curated_link:"Επιλεγμένα",private:"Ιδιωτικό",community:"Κοινότητα",curated:"Επιλεγμένα",admin:"Πεδίο διαχειριστή",current:"Τρέχων λογαριασμός",open:"Άνοιγμα",external:"Εξωτερικός σύνδεσμος",shortcut:"Πατήστε / για εστίαση στην αναζήτηση"},
  "ar-sa":{eyebrow:"البحث الشامل",title:"ابحث في Studio بالكامل",intro:"ابحث في Knowledge وملاحظات البحث والملخصات وروابط الحساب وروابط المجتمع والروابط المختارة من مكان واحد. تظل قواعد ظهور المحتوى الخاص كما هي، ولا يوسّع البحث صلاحيات الوصول.",placeholder:"ابحث في المعرفة والملاحظات والروابط والملخصات…",hint:"أدخل كلمة مفتاحية واحدة على الأقل",searching:"جارٍ البحث…",empty:"لا توجد نتائج",emptyDetail:"جرّب كلمة أخرى أو عُد إلى «الكل».",error:"البحث غير متاح مؤقتًا",partial:"بعض الوحدات غير متاحة مؤقتًا. ما زالت النتائج المتاحة معروضة أدناه.",result:"نتائج",all:"الكل",knowledge:"Knowledge",note:"ملاحظات البحث",summary:"الملخصات",link:"روابط الحساب / الإدارة",community_link:"المجتمع",curated_link:"مختارة",private:"خاص",community:"المجتمع",curated:"مختارة",admin:"نطاق الإدارة",current:"الحساب الحالي",open:"فتح",external:"رابط خارجي",shortcut:"اضغط / للتركيز على البحث"}
};

// 全局搜索页面：浏览器只负责输入、筛选和结果呈现；跨 Knowledge/Notes/Links 等多源检索与评分由 /api/search 后端统一完成。\nexport function globalSearchContent(zh, locale = "") {
  const activeLocale = normalizeSupportedLocale(locale) || (zh ? "zh-cn" : "en-us");
  const copy = GLOBAL_SEARCH_COPY[activeLocale] || GLOBAL_SEARCH_EN;

  return `
    <section class="global-search-shell" data-global-search>
      <div class="global-search-hero">
        <div class="global-search-heading">
          <span>${copy.eyebrow}</span>
          <h2>${copy.title}</h2>
          <p>${copy.intro}</p>
        </div>
        <div class="global-search-box">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path></svg>
          <input id="global-search-input" type="search" autocomplete="off" spellcheck="false" placeholder="${copy.placeholder}" aria-label="${copy.placeholder}">
          <kbd>/</kbd>
        </div>
        <div class="global-search-meta"><span id="global-search-status">${copy.hint}</span><span>${copy.shortcut}</span></div>
      </div>

      <div class="global-search-toolbar" id="global-search-toolbar" hidden>
        <div class="global-search-filters" role="tablist" aria-label="${copy.eyebrow}">
          <button type="button" class="is-active" data-search-filter="all">${copy.all}<b data-filter-count="all">0</b></button>
          <button type="button" data-search-filter="knowledge">${copy.knowledge}<b data-filter-count="knowledge">0</b></button>
          <button type="button" data-search-filter="note">${copy.note}<b data-filter-count="note">0</b></button>
          <button type="button" data-search-filter="summary">${copy.summary}<b data-filter-count="summary">0</b></button>
          <button type="button" data-search-filter="link">${copy.link}<b data-filter-count="link">0</b></button>
          <button type="button" data-search-filter="community_link">${copy.community_link}<b data-filter-count="community_link">0</b></button>
          <button type="button" data-search-filter="curated_link">${copy.curated_link}<b data-filter-count="curated_link">0</b></button>
        </div>
      </div>

      <div id="global-search-notice" class="global-search-notice" hidden></div>
      <div id="global-search-results" class="global-search-results" aria-live="polite"></div>
      <div id="global-search-empty" class="global-search-empty">
        <div class="global-search-empty-icon">⌕</div>
        <strong>${copy.hint}</strong>
        <span>${copy.intro}</span>
      </div>
    </section>

    <style>
      .global-search-shell{display:grid;gap:14px;min-width:0}.global-search-hero{display:grid;gap:16px;padding:26px;border:1px solid var(--border);border-radius:22px;background:var(--card)}
      .global-search-heading>span{display:block;color:var(--muted);font-size:11px;font-weight:700}.global-search-heading h2{margin:5px 0 7px;font-size:30px;letter-spacing:-.045em}.global-search-heading p{max-width:820px;margin:0;color:var(--muted);font-size:13px;line-height:1.6}
      .global-search-box{display:flex;align-items:center;gap:11px;min-height:58px;padding:0 16px;border-radius:16px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border);transition:box-shadow .15s ease,background .15s ease}.global-search-box:focus-within{background:var(--surface);box-shadow:0 0 0 4px color-mix(in srgb,var(--primary) 13%,transparent),inset 0 0 0 1px color-mix(in srgb,var(--primary) 58%,var(--border))}.global-search-box svg{width:20px;height:20px;flex:0 0 auto;fill:none;stroke:var(--muted);stroke-width:1.8;stroke-linecap:round}.global-search-box input{width:100%;height:56px;min-height:0;margin:0;padding:0;border:0!important;background:transparent!important;box-shadow:none!important;color:var(--text);font-size:16px}.global-search-box kbd{display:grid;place-items:center;min-width:26px;height:26px;padding:0 7px;border-radius:7px;background:var(--surface);color:var(--quiet);font:11px ui-monospace,SFMono-Regular,Menlo,monospace;box-shadow:inset 0 0 0 1px var(--border)}
      .global-search-meta{display:flex;justify-content:space-between;gap:12px;color:var(--quiet);font-size:11px}.global-search-toolbar{overflow:hidden;padding:9px;border-radius:15px;background:var(--fill)}.global-search-filters{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none}.global-search-filters::-webkit-scrollbar{display:none}.global-search-filters button{display:inline-flex;align-items:center;gap:7px;width:auto!important;min-width:max-content!important;min-height:36px!important;margin:0!important;padding:0 11px!important;border:0!important;border-radius:10px!important;background:transparent!important;color:var(--muted)!important;font-size:12px!important;font-weight:650!important;box-shadow:none!important}.global-search-filters button:hover{background:var(--surface)!important;color:var(--text)!important}.global-search-filters button.is-active{background:var(--surface)!important;color:var(--text)!important;box-shadow:inset 0 0 0 1px var(--border)!important}.global-search-filters b{display:grid;place-items:center;min-width:20px;height:20px;padding:0 5px;border-radius:999px;background:var(--fill);color:var(--quiet);font-size:10px}
      .global-search-notice{padding:11px 13px;border-radius:12px;background:color-mix(in srgb,var(--warning) 10%,var(--fill));color:var(--muted);font-size:12px}.global-search-results{display:grid;gap:8px}.global-search-result{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center;padding:16px 17px;border:1px solid var(--border);border-radius:16px;background:var(--card);color:var(--text);text-decoration:none;transition:background .13s ease,transform 100ms ease-out}.global-search-result:hover{background:var(--secondary)}.global-search-result:active{transform:scale(.993)}.global-search-result-main{min-width:0}.global-search-result-top{display:flex;align-items:center;gap:8px;min-width:0}.global-search-result-top strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px}.global-search-result-type{flex:0 0 auto;padding:3px 7px;border-radius:999px;background:var(--fill);color:var(--muted);font-size:9px;font-weight:720}.global-search-result p{display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;margin:7px 0 0;color:var(--muted);font-size:12px;line-height:1.5}.global-search-result-foot{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px;color:var(--quiet);font-size:10px}.global-search-result-foot span:not(:last-child)::after{content:'·';margin-left:7px}.global-search-result-open{display:flex;align-items:center;gap:7px;color:var(--primary);font-size:11px;font-weight:680;white-space:nowrap}.global-search-result-open span{font-size:15px}
      .global-search-empty{display:grid;place-items:center;gap:6px;min-height:220px;padding:34px;border:1px solid var(--border);border-radius:18px;background:var(--card);text-align:center}.global-search-empty-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:var(--fill);color:var(--muted);font-size:22px}.global-search-empty strong{font-size:14px}.global-search-empty span{max-width:560px;color:var(--muted);font-size:11px;line-height:1.55}
      @media(max-width:680px){.global-search-hero{padding:18px;border-radius:18px}.global-search-heading h2{font-size:25px}.global-search-meta>span:last-child{display:none}.global-search-result{grid-template-columns:1fr}.global-search-result-open{justify-self:start}.global-search-box kbd{display:none}}
      @media(prefers-reduced-motion:reduce){.global-search-result,.global-search-box{transition:none!important}}
    </style>

    <script>
      (()=>{
        const start=()=>{
          const root=document.querySelector('[data-global-search]');
          const input=document.getElementById('global-search-input');
          const results=document.getElementById('global-search-results');
          const empty=document.getElementById('global-search-empty');
          const status=document.getElementById('global-search-status');
          const toolbar=document.getElementById('global-search-toolbar');
          const notice=document.getElementById('global-search-notice');
          if(!root||!input||!results||!empty||!status)return;

          const labels=${JSON.stringify({
            knowledge:copy.knowledge,
            note:copy.note,
            summary:copy.summary,
            link:copy.link,
            community_link:copy.community_link,
            curated_link:copy.curated_link,
            private:copy.private,
            community:copy.community,
            curated:copy.curated,
            admin:copy.admin,
            current:copy.current,
            open:copy.open,
            external:copy.external
          })};
          let timer=null;
          let sequence=0;
          let allResults=[];
          let activeFilter='all';
          const prefix=${JSON.stringify("/" + activeLocale)};

          function internalHref(value){if(!value)return '#';if(String(value).startsWith('https://')||String(value).startsWith('http://'))return value;return prefix+value;}
          function setStatus(value){status.textContent=value;}
          function resetEmpty(title,detail){empty.hidden=false;empty.querySelector('strong').textContent=title;empty.querySelector('span').textContent=detail;}
          function filterResults(){return activeFilter==='all'?allResults:allResults.filter(item=>item.type===activeFilter);}
          function typeLabel(type){return labels[type]||type;}
          function scopeLabel(item){if(item.scope==='community')return labels.community;if(item.scope==='curated')return labels.curated;if(item.scope==='admin')return labels.admin;if(item.is_own||!item.owner_label)return labels.private;return labels.admin;}
          // 搜索结果渲染：基于当前 filter 选择结果，并用 DOM/textContent 输出标题与摘要；结果 URL 通过 internalHref 区分站内/外链。\nfunction render(){
            const visible=filterResults();
            results.replaceChildren();
            empty.hidden=visible.length>0;
            if(!visible.length){resetEmpty(${JSON.stringify(copy.empty)},${JSON.stringify(copy.emptyDetail)});return;}
            visible.forEach(item=>{
              const anchor=document.createElement('a');anchor.className='global-search-result';anchor.href=internalHref(item.href);if(item.external){anchor.target='_blank';anchor.rel='noopener noreferrer';}
              const main=document.createElement('div');main.className='global-search-result-main';
              const top=document.createElement('div');top.className='global-search-result-top';
              const badge=document.createElement('span');badge.className='global-search-result-type';badge.textContent=typeLabel(item.type);
              const title=document.createElement('strong');title.textContent=item.title||'—';top.append(badge,title);
              const body=document.createElement('p');body.textContent=item.snippet||item.subtitle||'';
              const foot=document.createElement('div');foot.className='global-search-result-foot';
              [item.subtitle,scopeLabel(item),item.owner_label,item.updated_at?new Date(item.updated_at).toLocaleString():null].filter(Boolean).forEach(value=>{const span=document.createElement('span');span.textContent=value;foot.append(span);});
              main.append(top,body,foot);
              const open=document.createElement('div');open.className='global-search-result-open';open.textContent=item.external?labels.external:labels.open;const arrow=document.createElement('span');arrow.textContent='↗';open.append(arrow);
              anchor.append(main,open);results.append(anchor);
            });
          }
          function updateCounts(payload){
            const counts=payload?.counts||{};document.querySelectorAll('[data-filter-count]').forEach(node=>{const key=node.dataset.filterCount;node.textContent=String(key==='all'?(payload?.returned||0):(counts[key]||0));});
          }
          // 发起搜索：对输入做最小长度/状态控制，发送到统一 API；异步返回后替换 allResults 并更新类型计数。\nasync function search(){
            const query=input.value.trim();window.clearTimeout(timer);const current=++sequence;
            if(!query){allResults=[];toolbar.hidden=true;notice.hidden=true;results.replaceChildren();resetEmpty(${JSON.stringify(copy.hint)},${JSON.stringify(copy.intro)});setStatus(${JSON.stringify(copy.hint)});return;}
            setStatus(${JSON.stringify(copy.searching)});empty.hidden=true;
            try{
              const response=await fetch('/api/search/global',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json;charset=UTF-8',Accept:'application/json'},body:JSON.stringify({query,limit:80}),cache:'no-store'});
              const payload=await response.json().catch(()=>({}));if(current!==sequence)return;if(!response.ok)throw new Error(payload?.error||${JSON.stringify(copy.error)});
              allResults=Array.isArray(payload?.results)?payload.results:[];toolbar.hidden=false;updateCounts(payload);setStatus(String(payload.returned||0)+' '+${JSON.stringify(copy.result)});
              if(payload.partial){notice.hidden=false;notice.textContent=${JSON.stringify(copy.partial)};}else notice.hidden=true;
              render();
            }catch(error){if(current!==sequence)return;allResults=[];toolbar.hidden=true;notice.hidden=true;results.replaceChildren();resetEmpty(error?.message||${JSON.stringify(copy.error)},${JSON.stringify(copy.emptyDetail)});setStatus(${JSON.stringify(copy.error)});}
          }
          input.addEventListener('input',()=>{window.clearTimeout(timer);timer=window.setTimeout(()=>void search(),220);});
          document.querySelectorAll('[data-search-filter]').forEach(button=>button.addEventListener('click',()=>{activeFilter=button.dataset.searchFilter||'all';document.querySelectorAll('[data-search-filter]').forEach(item=>item.classList.toggle('is-active',item===button));render();}));
          document.addEventListener('keydown',event=>{if(event.key==='/'&&!event.metaKey&&!event.ctrlKey&&!event.altKey&&!/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName||'')){event.preventDefault();input.focus();}});
        };
        window.setTimeout(start,0);
      })();
    </script>
  `;
}
