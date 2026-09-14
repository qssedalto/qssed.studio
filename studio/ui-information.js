import { statusContent } from "./ui-primitives.js";
import { knowledgeContent } from "./ui-knowledge.js";
import { curatedLinksContent } from "./curated-links.js";
import { curatedLinksFavoritesEnhancer } from "./curated-links-favorites.js";

export function linksContent(zh) {
  return curatedLinksContent(zh) + curatedLinksFavoritesEnhancer(zh);
}

export function notesContent(zh) {
  return statusContent(
    zh,
    "笔记尚未开放",
    "笔记保存接口还没接入。",
    "Notes aren’t available yet",
    "Note storage is not connected yet."
  );
}

export function summariesContent(zh) {
  const text = zh ? {
    eyebrow: "摘要工作区",
    title: "开始写摘要",
    intro: "摘要现在与当前账号关联并保存到 R2 的隐藏系统目录中，不会出现在普通文件列表。管理员账号可以在本页下方查看所有用户的摘要。",
    titleLabel: "摘要标题",
    titlePlaceholder: "例如：某篇论文的核心结论与方法摘要",
    sourceLabel: "来源 / 原始材料",
    sourcePlaceholder: "粘贴网页链接、论文名称、课程章节、会议主题或其他来源说明",
    purposeLabel: "阅读背景与摘要目的",
    purposePlaceholder: "为什么要读这份材料？你最想解决什么问题？这份摘要以后准备怎么用？",
    summaryLabel: "核心摘要",
    summaryPlaceholder: "用完整段落写清楚材料讲了什么。建议先给结论，再解释背景、核心逻辑、关键方法和最终结果。不要只堆关键词。",
    pointsLabel: "关键要点",
    pointsPlaceholder: "每行一个要点。\n例如：\n1. 核心观点是什么\n2. 使用了什么方法或证据\n3. 哪些条件会影响结论",
    evidenceLabel: "重要数据、证据与例子",
    evidencePlaceholder: "记录最值得保留的数字、实验结果、定义、公式、案例、引用位置或反例。尽量说明这些证据支持了什么结论。",
    limitsLabel: "限制、争议与不确定性",
    limitsPlaceholder: "写清楚材料没有解决什么、结论依赖哪些假设、可能有哪些偏差，以及哪些内容还需要进一步核实。",
    actionLabel: "结论与下一步",
    actionPlaceholder: "这份材料最终对你意味着什么？接下来要验证什么、继续读什么、修改什么或执行什么？",
    tagsLabel: "标签",
    tagsPlaceholder: "例如：统计学, AI, 论文, 方法论",
    guideTitle: "建议结构",
    guideIntro: "一份以后真的能用上的摘要，至少回答下面五件事：",
    guideItems: [
      ["01", "背景", "材料讨论的对象、范围和问题是什么。"],
      ["02", "结论", "最重要的答案是什么，先写结论再展开。"],
      ["03", "依据", "哪些数据、方法、事实或例子支持这个结论。"],
      ["04", "边界", "哪些假设、限制和争议会改变你对结论的理解。"],
      ["05", "行动", "读完以后需要记住、验证或执行什么。"]
    ],
    save: "保存到账号",
    clear: "清空",
    saved: "已保存到账号",
    saving: "正在保存…",
    loading: "正在读取账号摘要…",
    autosaved: "已自动保存到账号",
    empty: "还没有内容",
    chars: "字",
    unavailable: "摘要服务暂时不可用",
    adminTitle: "所有用户摘要",
    adminIntro: "仅管理员可见。这里读取 R2 隐藏摘要文件，不会把这些文件暴露到普通存储管理器。",
    adminEmpty: "暂时没有用户摘要。",
    updated: "更新",
    owner: "账号",
    migration: "已把这个浏览器里的旧草稿迁移到账号"
  } : {
    eyebrow: "Summary workspace",
    title: "Start a summary",
    intro: "Summaries are now linked to the signed-in account and stored in a hidden R2 system path, so they do not appear in the normal file browser. Administrators can review all users’ summaries below.",
    titleLabel: "Summary title",
    titlePlaceholder: "For example: Core findings and methods from a paper",
    sourceLabel: "Source / original material",
    sourcePlaceholder: "Paste a URL, paper title, class section, meeting topic, or other source information",
    purposeLabel: "Context and purpose",
    purposePlaceholder: "Why are you reading this? What question should the summary answer? How will you use it later?",
    summaryLabel: "Core summary",
    summaryPlaceholder: "Explain what the material says in complete paragraphs. Lead with the conclusion, then cover context, reasoning, methods, and results. Avoid a list of disconnected keywords.",
    pointsLabel: "Key points",
    pointsPlaceholder: "One point per line.\nFor example:\n1. What is the central claim?\n2. What method or evidence supports it?\n3. What conditions affect the conclusion?",
    evidenceLabel: "Evidence, data, and examples",
    evidencePlaceholder: "Keep the numbers, findings, definitions, formulas, examples, references, or counterexamples that are worth revisiting. Explain what each piece of evidence supports.",
    limitsLabel: "Limits, disputes, and uncertainty",
    limitsPlaceholder: "Record what the material does not resolve, the assumptions behind the conclusion, possible bias, and anything that still needs verification.",
    actionLabel: "Conclusion and next steps",
    actionPlaceholder: "What does this material mean for you? What should you verify, read, change, or do next?",
    tagsLabel: "Tags",
    tagsPlaceholder: "For example: Statistics, AI, Paper, Methods",
    guideTitle: "Recommended structure",
    guideIntro: "A useful summary should answer at least these five questions:",
    guideItems: [
      ["01", "Context", "What object, scope, and problem does the material address?"],
      ["02", "Conclusion", "What is the most important answer? Lead with it."],
      ["03", "Evidence", "Which data, methods, facts, or examples support the conclusion?"],
      ["04", "Boundaries", "Which assumptions, limits, or disputes change how the conclusion should be read?"],
      ["05", "Action", "What should be remembered, verified, or done next?"]
    ],
    save: "Save to account",
    clear: "Clear",
    saved: "Saved to account",
    saving: "Saving…",
    loading: "Loading account summary…",
    autosaved: "Autosaved to account",
    empty: "No content yet",
    chars: "characters",
    unavailable: "Summary service is temporarily unavailable",
    adminTitle: "All user summaries",
    adminIntro: "Administrators only. These records come from hidden R2 summary objects and are not exposed in the normal storage browser.",
    adminEmpty: "No user summaries yet.",
    updated: "Updated",
    owner: "Account",
    migration: "Migrated this browser’s old draft to your account"
  };

  return `
    <section class="summary-workspace" data-summary-workspace>
      <div class="summary-editor-card">
        <div class="summary-editor-head">
          <div>
            <span class="summary-eyebrow">${text.eyebrow}</span>
            <h2>${text.title}</h2>
            <p>${text.intro}</p>
          </div>
          <div class="summary-counter" aria-live="polite"><strong id="summary-char-count">0</strong><span>${text.chars}</span></div>
        </div>

        <div class="summary-form-grid">
          <label class="summary-field"><span>${text.titleLabel}</span><input id="summary-title" type="text" maxlength="160" placeholder="${text.titlePlaceholder}"></label>
          <label class="summary-field"><span>${text.sourceLabel}</span><input id="summary-source" type="text" maxlength="1000" placeholder="${text.sourcePlaceholder}"></label>
        </div>

        <label class="summary-field"><span>${text.purposeLabel}</span><textarea id="summary-purpose" rows="4" maxlength="2400" placeholder="${text.purposePlaceholder}"></textarea></label>
        <label class="summary-field summary-primary-field"><span>${text.summaryLabel}</span><textarea id="summary-core" rows="10" maxlength="12000" placeholder="${text.summaryPlaceholder}"></textarea></label>

        <div class="summary-form-grid summary-form-grid-tall">
          <label class="summary-field"><span>${text.pointsLabel}</span><textarea id="summary-points" rows="8" maxlength="6000" placeholder="${text.pointsPlaceholder}"></textarea></label>
          <label class="summary-field"><span>${text.evidenceLabel}</span><textarea id="summary-evidence" rows="8" maxlength="6000" placeholder="${text.evidencePlaceholder}"></textarea></label>
        </div>

        <div class="summary-form-grid summary-form-grid-tall">
          <label class="summary-field"><span>${text.limitsLabel}</span><textarea id="summary-limits" rows="7" maxlength="5000" placeholder="${text.limitsPlaceholder}"></textarea></label>
          <label class="summary-field"><span>${text.actionLabel}</span><textarea id="summary-actions" rows="7" maxlength="5000" placeholder="${text.actionPlaceholder}"></textarea></label>
        </div>

        <label class="summary-field"><span>${text.tagsLabel}</span><input id="summary-tags" type="text" maxlength="500" placeholder="${text.tagsPlaceholder}"></label>

        <div class="summary-actions">
          <div class="summary-actions-buttons">
            <button id="summary-save" class="summary-action summary-action-primary" type="button">${text.save}</button>
            <button id="summary-clear" class="summary-action summary-action-secondary" type="button">${text.clear}</button>
          </div>
          <span id="summary-save-state" class="summary-save-state">${text.loading}</span>
        </div>
      </div>

      <aside class="summary-guide-card">
        <span class="summary-eyebrow">${text.eyebrow}</span>
        <h3>${text.guideTitle}</h3>
        <p>${text.guideIntro}</p>
        <div class="summary-guide-list">
          ${text.guideItems.map(([number, title, detail]) => `<article><span>${number}</span><div><strong>${title}</strong><p>${detail}</p></div></article>`).join("")}
        </div>
      </aside>
    </section>

    <section id="summary-admin-panel" class="summary-admin-panel" hidden>
      <div class="summary-admin-head">
        <div><span class="summary-eyebrow">Admin</span><h2>${text.adminTitle}</h2><p>${text.adminIntro}</p></div>
        <strong id="summary-admin-count">0</strong>
      </div>
      <div id="summary-admin-list" class="summary-admin-list"></div>
    </section>

    <style>
      .summary-workspace{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,340px);gap:14px;align-items:start}
      .summary-editor-card,.summary-guide-card,.summary-admin-panel{border:1px solid var(--border);border-radius:20px;background:var(--card);box-shadow:none}
      .summary-editor-card{padding:22px}.summary-guide-card{position:sticky;top:0;padding:20px}.summary-admin-panel{margin-top:14px;padding:20px}
      .summary-editor-head,.summary-admin-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.summary-editor-head{margin-bottom:20px}
      .summary-eyebrow{display:block;color:var(--muted);font-size:11px;font-weight:680;letter-spacing:.01em}
      .summary-editor-head h2,.summary-guide-card h3,.summary-admin-head h2{margin:4px 0 0;letter-spacing:-.03em}.summary-editor-head h2{font-size:26px}.summary-guide-card h3,.summary-admin-head h2{font-size:20px}
      .summary-editor-head p,.summary-guide-card>p,.summary-admin-head p{max-width:850px;margin:8px 0 0;color:var(--muted);font-size:13px;line-height:1.62}
      .summary-counter{display:flex;align-items:baseline;gap:5px;min-width:max-content;padding:8px 10px;border-radius:12px;background:var(--fill);color:var(--muted)}.summary-counter strong{color:var(--text);font-size:18px;letter-spacing:-.03em}.summary-counter span{font-size:10px}
      .summary-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.summary-form-grid-tall{margin-top:12px}
      .summary-field{display:grid;gap:7px;margin-top:12px}.summary-field>span{color:var(--muted);font-size:12px;font-weight:650}
      .summary-field input,.summary-field textarea{width:100%;margin:0;border:0;border-radius:13px;background:var(--fill);color:var(--text);box-shadow:inset 0 0 0 1px var(--border)}
      .summary-field textarea{min-height:112px;padding:12px 14px;resize:vertical;line-height:1.58}.summary-primary-field textarea{min-height:240px;font-size:15px}
      .summary-actions{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:18px;padding-top:16px;border-top:1px solid var(--hairline)}.summary-actions-buttons{display:flex;gap:8px}.summary-action{width:auto!important;min-height:40px!important;margin:0!important;padding:0 14px!important;border-radius:11px!important;font-size:13px!important}.summary-action-secondary{background:var(--fill)!important;color:var(--text)!important}.summary-action-secondary:hover{background:var(--secondary)!important}.summary-save-state{color:var(--muted);font-size:11px}.summary-save-state.is-error{color:var(--danger)}
      .summary-guide-list{display:grid;gap:8px;margin-top:16px}.summary-guide-list article{display:grid;grid-template-columns:34px minmax(0,1fr);gap:10px;padding:11px;border-radius:14px;background:var(--fill)}.summary-guide-list article>span{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:color-mix(in srgb,var(--primary) 12%,transparent);color:var(--primary);font-size:10px;font-weight:800}.summary-guide-list strong{display:block;font-size:13px}.summary-guide-list p{margin:3px 0 0;color:var(--muted);font-size:11px;line-height:1.5}
      .summary-admin-head>strong{display:grid;place-items:center;min-width:42px;height:42px;padding:0 10px;border-radius:12px;background:var(--fill);font-size:18px}.summary-admin-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:16px}.summary-admin-item{padding:15px;border-radius:15px;background:var(--fill)}.summary-admin-item-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.summary-admin-item strong{display:block;font-size:14px}.summary-admin-item time{color:var(--muted);font-size:10px;white-space:nowrap}.summary-admin-item small{display:block;margin-top:3px;color:var(--muted);font-size:10px}.summary-admin-item p{display:-webkit-box;overflow:hidden;-webkit-line-clamp:4;-webkit-box-orient:vertical;margin:10px 0 0;color:var(--text);font-size:12px;line-height:1.55;white-space:pre-wrap}.summary-admin-empty{grid-column:1/-1;padding:22px;border-radius:14px;background:var(--fill);color:var(--muted);text-align:center;font-size:12px}
      @media(max-width:980px){.summary-workspace{grid-template-columns:1fr}.summary-guide-card{position:static}.summary-form-grid,.summary-admin-list{grid-template-columns:1fr}}
      @media(max-width:620px){.summary-editor-card,.summary-guide-card,.summary-admin-panel{padding:16px;border-radius:17px}.summary-editor-head,.summary-admin-head{display:grid}.summary-counter{justify-self:start}.summary-actions{align-items:flex-start;flex-direction:column}.summary-actions-buttons{width:100%}.summary-action{flex:1}.summary-primary-field textarea{min-height:210px}}
    </style>

    <script>
      (() => {
        const start = () => {
          const root=document.querySelector('[data-summary-workspace]');
          if(!root)return;
          const ids=['summary-title','summary-source','summary-purpose','summary-core','summary-points','summary-evidence','summary-limits','summary-actions','summary-tags'];
          const fields=ids.map(id=>document.getElementById(id)).filter(Boolean);
          const state=document.getElementById('summary-save-state');
          const counter=document.getElementById('summary-char-count');
          const adminPanel=document.getElementById('summary-admin-panel');
          const adminList=document.getElementById('summary-admin-list');
          const adminCount=document.getElementById('summary-admin-count');
          let timer=null;
          let saveSequence=0;
          let ready=false;

          function setState(label,error){if(!state)return;state.textContent=label;state.classList.toggle('is-error',Boolean(error));}
          function snapshot(){return {title:document.getElementById('summary-title')?.value||'',source:document.getElementById('summary-source')?.value||'',purpose:document.getElementById('summary-purpose')?.value||'',core:document.getElementById('summary-core')?.value||'',points:document.getElementById('summary-points')?.value||'',evidence:document.getElementById('summary-evidence')?.value||'',limits:document.getElementById('summary-limits')?.value||'',actions:document.getElementById('summary-actions')?.value||'',tags:document.getElementById('summary-tags')?.value||''};}
          function count(){const total=fields.reduce((sum,field)=>sum+field.value.length,0);if(counter)counter.textContent=String(total);return total;}
          function fill(summary){const map={title:'summary-title',source:'summary-source',purpose:'summary-purpose',core:'summary-core',points:'summary-points',evidence:'summary-evidence',limits:'summary-limits',actions:'summary-actions',tags:'summary-tags'};Object.entries(map).forEach(([key,id])=>{const field=document.getElementById(id);if(field)field.value=summary?.[key]||''});count();}
          async function token(){const result=await supabaseClient.auth.getSession();const value=result?.data?.session?.access_token;if(!value)throw new Error(${JSON.stringify(zh ? '登录状态已失效' : 'Session expired')});return value;}
          async function api(path,options){const access=await token();const headers=new Headers(options?.headers||{});headers.set('Authorization','Bearer '+access);if(options?.body)headers.set('Content-Type','application/json;charset=UTF-8');const response=await fetch(path,{...options,headers,cache:'no-store'});if(!response.ok){const payload=await response.json().catch(()=>({}));throw new Error(payload?.error||${JSON.stringify(text.unavailable)});}return response.json();}
          async function save(label){const sequence=++saveSequence;setState(${JSON.stringify(text.saving)},false);try{await api('/api/summaries',{method:'PUT',body:JSON.stringify(snapshot())});if(sequence!==saveSequence)return;setState(label||${JSON.stringify(text.saved)},false);void refreshAdmin();}catch(error){if(sequence!==saveSequence)return;setState(error?.message||${JSON.stringify(text.unavailable)},true);}}
          function queueSave(){count();if(!ready)return;window.clearTimeout(timer);timer=window.setTimeout(()=>void save(${JSON.stringify(text.autosaved)}),700);}
          function renderAdmin(items){if(!adminPanel||!adminList||!adminCount)return;const list=Array.isArray(items)?items:[];adminPanel.hidden=false;adminCount.textContent=String(list.length);adminList.replaceChildren();if(!list.length){const empty=document.createElement('div');empty.className='summary-admin-empty';empty.textContent=${JSON.stringify(text.adminEmpty)};adminList.append(empty);return;}list.forEach(item=>{const card=document.createElement('article');card.className='summary-admin-item';const head=document.createElement('div');head.className='summary-admin-item-head';const left=document.createElement('div');const title=document.createElement('strong');title.textContent=item.title||(${JSON.stringify(zh ? '未命名摘要' : 'Untitled summary')});const owner=document.createElement('small');owner.textContent=${JSON.stringify(text.owner)}+' · '+(item.owner_label||item.owner_id||'—');left.append(title,owner);const time=document.createElement('time');time.textContent=item.updated_at?new Date(item.updated_at).toLocaleString():'—';head.append(left,time);const body=document.createElement('p');body.textContent=item.core||item.purpose||item.points||${JSON.stringify(zh ? '没有正文内容' : 'No body content')};card.append(head,body);adminList.append(card);});}
          async function refreshAdmin(){try{const data=await api('/api/summaries?scope=all',{method:'GET'});if(data?.is_admin)renderAdmin(data.summaries||[]);}catch{}}
          async function migrateLocalDraftIfNeeded(serverSummary){if(serverSummary)return false;let local=null;try{local=JSON.parse(localStorage.getItem('qssed-summary-draft-v1')||'null');}catch{}if(!local||typeof local!=='object')return false;const migrated={title:local['summary-title']||'',source:local['summary-source']||'',purpose:local['summary-purpose']||'',core:local['summary-core']||'',points:local['summary-points']||'',evidence:local['summary-evidence']||'',limits:local['summary-limits']||'',actions:local['summary-actions']||'',tags:local['summary-tags']||''};if(!Object.values(migrated).some(value=>String(value||'').trim()))return false;fill(migrated);await api('/api/summaries',{method:'PUT',body:JSON.stringify(migrated)});try{localStorage.removeItem('qssed-summary-draft-v1')}catch{}setState(${JSON.stringify(text.migration)},false);return true;}
          async function initialize(){setState(${JSON.stringify(text.loading)},false);try{const data=await api('/api/summaries?scope=all',{method:'GET'});fill(data?.summary||null);const migrated=await migrateLocalDraftIfNeeded(data?.summary||null);if(!migrated)setState(data?.summary?${JSON.stringify(text.saved)}:${JSON.stringify(text.empty)},false);if(data?.is_admin)renderAdmin(data.summaries||[]);ready=true;}catch(error){ready=true;setState(error?.message||${JSON.stringify(text.unavailable)},true);}}

          fields.forEach(field=>field.addEventListener('input',queueSave));
          document.getElementById('summary-save')?.addEventListener('click',()=>void save(${JSON.stringify(text.saved)}));
          document.getElementById('summary-clear')?.addEventListener('click',async()=>{window.clearTimeout(timer);fields.forEach(field=>{field.value=''});count();setState(${JSON.stringify(text.saving)},false);try{await api('/api/summaries',{method:'DELETE'});setState(${JSON.stringify(text.empty)},false);void refreshAdmin();}catch(error){setState(error?.message||${JSON.stringify(text.unavailable)},true);}document.getElementById('summary-title')?.focus();});
          void initialize();
        };
        window.setTimeout(start,0);
      })();
    </script>
  `;
}

export function searchContent(zh) {
  return statusContent(
    zh,
    "全局搜索尚未开放",
    "跨模块搜索索引还没接入。",
    "Global search isn’t available yet",
    "The cross-module search index is not connected yet."
  );
}

export function informationContent(path, zh) {
  if (path === "/info") {
    return statusContent(
      zh,
      "信息中心",
      "知识库、收藏链接和账号摘要可以使用；笔记与全局搜索还在接入。",
      "Information",
      "Knowledge, saved links, and account summaries are available. Notes and global search are still being connected."
    );
  }
  if (path === "/info/knowledge" || path.startsWith("/info/knowledge/")) return knowledgeContent(path, zh);
  if (path === "/info/links") return linksContent(zh);
  if (path === "/info/notes") return notesContent(zh);
  if (path === "/info/summaries") return summariesContent(zh);
  if (path === "/info/search") return searchContent(zh);
  throw new Error("Unhandled OS path: " + path);
}
