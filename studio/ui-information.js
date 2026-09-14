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
    intro: "把一篇文章、网页、论文、课程内容、会议记录或长对话压缩成可快速回看的结构化摘要。先写清楚材料是什么，再提炼核心结论、关键依据、限制条件和后续行动。当前草稿保存在这个浏览器中。",
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
    save: "保存草稿",
    clear: "清空",
    saved: "草稿已保存在此浏览器",
    autosaved: "已自动保存",
    empty: "还没有内容",
    chars: "字"
  } : {
    eyebrow: "Summary workspace",
    title: "Start a summary",
    intro: "Turn an article, webpage, paper, class, meeting, or long conversation into a structured summary you can actually revisit. Identify the source first, then capture the main conclusion, evidence, limitations, and next actions. The current draft is stored in this browser.",
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
    save: "Save draft",
    clear: "Clear",
    saved: "Draft saved in this browser",
    autosaved: "Autosaved",
    empty: "No content yet",
    chars: "characters"
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
          <span id="summary-save-state" class="summary-save-state">${text.empty}</span>
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

    <style>
      .summary-workspace{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,340px);gap:14px;align-items:start}
      .summary-editor-card,.summary-guide-card{border:1px solid var(--border);border-radius:20px;background:var(--card);box-shadow:none}
      .summary-editor-card{padding:22px}.summary-guide-card{position:sticky;top:0;padding:20px}
      .summary-editor-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:20px}
      .summary-eyebrow{display:block;color:var(--muted);font-size:11px;font-weight:680;letter-spacing:.01em}
      .summary-editor-head h2,.summary-guide-card h3{margin:4px 0 0;letter-spacing:-.03em}.summary-editor-head h2{font-size:26px}.summary-guide-card h3{font-size:20px}
      .summary-editor-head p,.summary-guide-card>p{max-width:850px;margin:8px 0 0;color:var(--muted);font-size:13px;line-height:1.62}
      .summary-counter{display:flex;align-items:baseline;gap:5px;min-width:max-content;padding:8px 10px;border-radius:12px;background:var(--fill);color:var(--muted)}.summary-counter strong{color:var(--text);font-size:18px;letter-spacing:-.03em}.summary-counter span{font-size:10px}
      .summary-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.summary-form-grid-tall{margin-top:12px}
      .summary-field{display:grid;gap:7px;margin-top:12px}.summary-field>span{color:var(--muted);font-size:12px;font-weight:650}
      .summary-field input,.summary-field textarea{width:100%;margin:0;border:0;border-radius:13px;background:var(--fill);color:var(--text);box-shadow:inset 0 0 0 1px var(--border)}
      .summary-field textarea{min-height:112px;padding:12px 14px;resize:vertical;line-height:1.58}.summary-primary-field textarea{min-height:240px;font-size:15px}
      .summary-actions{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:18px;padding-top:16px;border-top:1px solid var(--hairline)}.summary-actions-buttons{display:flex;gap:8px}.summary-action{width:auto!important;min-height:40px!important;margin:0!important;padding:0 14px!important;border-radius:11px!important;font-size:13px!important}.summary-action-secondary{background:var(--fill)!important;color:var(--text)!important}.summary-action-secondary:hover{background:var(--secondary)!important}.summary-save-state{color:var(--muted);font-size:11px}
      .summary-guide-list{display:grid;gap:8px;margin-top:16px}.summary-guide-list article{display:grid;grid-template-columns:34px minmax(0,1fr);gap:10px;padding:11px;border-radius:14px;background:var(--fill)}.summary-guide-list article>span{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:color-mix(in srgb,var(--primary) 12%,transparent);color:var(--primary);font-size:10px;font-weight:800}.summary-guide-list strong{display:block;font-size:13px}.summary-guide-list p{margin:3px 0 0;color:var(--muted);font-size:11px;line-height:1.5}
      @media(max-width:980px){.summary-workspace{grid-template-columns:1fr}.summary-guide-card{position:static}.summary-form-grid{grid-template-columns:1fr}}
      @media(max-width:620px){.summary-editor-card,.summary-guide-card{padding:16px;border-radius:17px}.summary-editor-head{display:grid}.summary-counter{justify-self:start}.summary-actions{align-items:flex-start;flex-direction:column}.summary-actions-buttons{width:100%}.summary-action{flex:1}.summary-primary-field textarea{min-height:210px}}
    </style>

    <script>
      (() => {
        const root=document.querySelector('[data-summary-workspace]');
        if(!root)return;
        const key='qssed-summary-draft-v1';
        const ids=['summary-title','summary-source','summary-purpose','summary-core','summary-points','summary-evidence','summary-limits','summary-actions','summary-tags'];
        const fields=ids.map(id=>document.getElementById(id)).filter(Boolean);
        const state=document.getElementById('summary-save-state');
        const counter=document.getElementById('summary-char-count');
        let timer=null;

        function snapshot(){const data={};fields.forEach(field=>{data[field.id]=field.value});return data;}
        function count(){const total=fields.reduce((sum,field)=>sum+field.value.length,0);if(counter)counter.textContent=String(total);return total;}
        function write(label){try{localStorage.setItem(key,JSON.stringify(snapshot()));if(state)state.textContent=label;}catch{if(state)state.textContent=${JSON.stringify(zh ? "浏览器无法保存草稿" : "Browser storage is unavailable")};}}
        function restore(){try{const raw=localStorage.getItem(key);if(!raw){count();return;}const data=JSON.parse(raw);fields.forEach(field=>{if(typeof data?.[field.id]==='string')field.value=data[field.id]});count();if(state)state.textContent=${JSON.stringify(text.saved)};}catch{count();}}
        function queueAutosave(){count();window.clearTimeout(timer);timer=window.setTimeout(()=>write(${JSON.stringify(text.autosaved)}),550);}

        fields.forEach(field=>field.addEventListener('input',queueAutosave));
        document.getElementById('summary-save')?.addEventListener('click',()=>write(${JSON.stringify(text.saved)}));
        document.getElementById('summary-clear')?.addEventListener('click',()=>{fields.forEach(field=>{field.value=''});try{localStorage.removeItem(key)}catch{}count();if(state)state.textContent=${JSON.stringify(text.empty)};document.getElementById('summary-title')?.focus();});
        restore();
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
      "知识库和收藏链接可以使用；笔记、摘要和全局搜索还在接入。",
      "Information",
      "Knowledge and saved links are available. Notes, summaries, and global search are still being connected."
    );
  }
  if (path === "/info/knowledge" || path.startsWith("/info/knowledge/")) return knowledgeContent(path, zh);
  if (path === "/info/links") return linksContent(zh);
  if (path === "/info/notes") return notesContent(zh);
  if (path === "/info/summaries") return summariesContent(zh);
  if (path === "/info/search") return searchContent(zh);
  throw new Error("Unhandled OS path: " + path);
}
