import { KNOWLEDGE_CATEGORIES, KNOWLEDGE_ROOT } from "./knowledge-routes.js";
import { PROJECT_KNOWLEDGE } from "./knowledge-projects.js";
import { TECHNOLOGY_KNOWLEDGE } from "./knowledge-technology.js";
import { STUDY_KNOWLEDGE } from "./knowledge-study.js";
import { METHODOLOGY_KNOWLEDGE } from "./knowledge-methodology.js";
import { REFERENCE_KNOWLEDGE } from "./knowledge-references.js";
import { ARCHIVE_KNOWLEDGE } from "./knowledge-archive.js";

const CONTENT_BY_CATEGORY = {
  projects: PROJECT_KNOWLEDGE,
  technology: TECHNOLOGY_KNOWLEDGE,
  study: STUDY_KNOWLEDGE,
  methodology: METHODOLOGY_KNOWLEDGE,
  references: REFERENCE_KNOWLEDGE,
  archive: ARCHIVE_KNOWLEDGE
};

function prefixFor(zh) {
  return zh ? "/zh-cn" : "/en";
}

function flattenSections(sections = []) {
  return sections.flatMap(section => [
    section.title || "",
    ...(section.paragraphs || []),
    ...(section.bullets || []),
    section.code || ""
  ]).filter(Boolean).join("\n");
}

export function buildStaticKnowledgeSearchIndex(zh) {
  const lang = zh ? "zh" : "en";
  return KNOWLEDGE_CATEGORIES.flatMap(category => category.items.map(item => {
    const localized = CONTENT_BY_CATEGORY[category.slug]?.[item[0]]?.[lang];
    return {
      source: "builtin",
      title: zh ? item[1] : item[2],
      category: zh ? category.zh : category.en,
      summary: localized?.summary || (zh ? category.zhDescription : category.enDescription),
      content: flattenSections(localized?.sections),
      href: `${prefixFor(zh)}${KNOWLEDGE_ROOT}/${category.slug}/${item[0]}`
    };
  }));
}

export function knowledgeSearchPanel(zh) {
  return `
    <section class="knowledge-search-panel" aria-label="${zh ? "搜索知识库" : "Search Knowledge Base"}">
      <div class="knowledge-search-heading">
        <div>
          <span class="knowledge-overline">${zh ? "全文检索" : "Full-text search"}</span>
          <h3>${zh ? "搜索标题、正文、句子或单个字" : "Search titles, content, phrases, or a single character"}</h3>
          <p>${zh ? "同时检索内置知识与当前账号保存在 Supabase 的个人知识内容。中文不依赖分词，输入单个汉字也可以匹配。" : "Searches built-in knowledge and personal documents stored in Supabase for the current account. Literal substring matching also works for single characters."}</p>
        </div>
        <span id="knowledge-search-count" class="knowledge-search-count" aria-live="polite"></span>
      </div>
      <label class="knowledge-search-box">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
        <input id="knowledge-search-input" type="search" autocomplete="off" spellcheck="false" placeholder="${zh ? "输入关键词、句子或单个字…" : "Type a keyword, phrase, or single character…"}" aria-label="${zh ? "知识库搜索" : "Knowledge search"}">
        <button id="knowledge-search-clear" class="knowledge-search-clear" type="button" aria-label="${zh ? "清空搜索" : "Clear search"}" hidden>×</button>
      </label>
      <div id="knowledge-search-results" class="knowledge-search-results" hidden></div>
    </section>`;
}

export function knowledgeSearchClientScript(zh) {
  const staticIndex = buildStaticKnowledgeSearchIndex(zh);
  return `<script>
    (() => {
      const input = document.getElementById("knowledge-search-input");
      const results = document.getElementById("knowledge-search-results");
      const count = document.getElementById("knowledge-search-count");
      const clear = document.getElementById("knowledge-search-clear");
      if (!input || !results) return;

      const builtIn = ${JSON.stringify(staticIndex)};
      const copy = ${JSON.stringify(zh ? {
        builtin: "内置知识",
        personal: "个人知识",
        noResults: "没有找到匹配内容",
        noResultsHint: "试试更短的关键词、句子片段，或者直接输入一个汉字。",
        resultSuffix: "条结果",
        loading: "正在搜索个人知识…",
        supabaseUnavailable: "个人知识搜索暂时不可用，已显示内置知识结果。"
      } : {
        builtin: "Built-in",
        personal: "Personal",
        noResults: "No matching knowledge found",
        noResultsHint: "Try a shorter keyword, part of a sentence, or a single character.",
        resultSuffix: "results",
        loading: "Searching personal knowledge…",
        supabaseUnavailable: "Personal search is temporarily unavailable; built-in results are still shown."
      })};

      let sequence = 0;
      let timer = 0;

      const normalize = value => String(value || "").toLocaleLowerCase();
      const score = (doc, q) => {
        const title = normalize(doc.title);
        const summary = normalize(doc.summary);
        const content = normalize(doc.content);
        if (title === q) return 0;
        if (title.includes(q)) return 1;
        if (summary.includes(q)) return 2;
        if (content.includes(q)) return 3;
        return 99;
      };

      const snippet = (doc, q) => {
        const candidates = [doc.summary, doc.content].filter(Boolean);
        for (const text of candidates) {
          const source = String(text);
          const index = normalize(source).indexOf(q);
          if (index >= 0) {
            const start = Math.max(0, index - 54);
            const end = Math.min(source.length, index + q.length + 96);
            return (start ? "…" : "") + source.slice(start, end).replace(/\\s+/g, " ").trim() + (end < source.length ? "…" : "");
          }
        }
        return String(doc.summary || doc.content || "").replace(/\\s+/g, " ").trim().slice(0, 150);
      };

      const createResult = (doc, q) => {
        const canLink = Boolean(doc.href || doc.source_url);
        const node = document.createElement(canLink ? "a" : "article");
        node.className = "knowledge-search-result";
        if (canLink) node.href = doc.href || doc.source_url;
        if (doc.source_url && !doc.href) {
          node.target = "_blank";
          node.rel = "noopener noreferrer";
        }

        const meta = document.createElement("span");
        meta.className = "knowledge-search-result-meta";
        meta.textContent = (doc.source === "supabase" ? copy.personal : copy.builtin) + " · " + (doc.category || "");

        const title = document.createElement("strong");
        title.textContent = doc.title || "";

        const preview = document.createElement("p");
        preview.textContent = snippet(doc, q);

        node.append(meta, title, preview);
        return node;
      };

      const render = (docs, q, note = "") => {
        results.replaceChildren();
        if (!q) {
          results.hidden = true;
          count.textContent = "";
          return;
        }
        results.hidden = false;
        count.textContent = docs.length + " " + copy.resultSuffix;
        if (!docs.length) {
          const empty = document.createElement("div");
          empty.className = "knowledge-search-empty";
          const strong = document.createElement("strong");
          strong.textContent = copy.noResults;
          const p = document.createElement("p");
          p.textContent = note || copy.noResultsHint;
          empty.append(strong, p);
          results.append(empty);
          return;
        }
        const fragment = document.createDocumentFragment();
        docs.slice(0, 60).forEach(doc => fragment.append(createResult(doc, q)));
        if (note) {
          const notice = document.createElement("p");
          notice.className = "knowledge-search-notice";
          notice.textContent = note;
          fragment.append(notice);
        }
        results.append(fragment);
      };

      async function runSearch(raw) {
        const q = normalize(raw.trim());
        clear.hidden = !q;
        const current = ++sequence;
        if (!q) return render([], "");

        const local = builtIn
          .map(doc => ({ ...doc, rank: score(doc, q) }))
          .filter(doc => doc.rank < 99)
          .sort((a, b) => a.rank - b.rank || a.title.localeCompare(b.title));

        render(local, q, copy.loading);

        try {
          if (typeof supabaseClient === "undefined") throw new Error("Supabase client unavailable");
          const { data, error } = await supabaseClient.rpc("search_knowledge_documents", { p_query: raw.trim(), p_limit: 40 });
          if (error) throw error;
          if (current !== sequence) return;
          const personal = (data || []).map(doc => ({ ...doc, source: "supabase", rank: Number(doc.match_rank ?? 4) }));
          const combined = [...local, ...personal].sort((a, b) => a.rank - b.rank || String(a.title).localeCompare(String(b.title)));
          render(combined, q);
        } catch (error) {
          console.warn("Knowledge search RPC failed", error);
          if (current === sequence) render(local, q, copy.supabaseUnavailable);
        }
      }

      input.addEventListener("input", () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => runSearch(input.value), 110);
      });
      input.addEventListener("search", () => runSearch(input.value));
      clear.addEventListener("click", () => {
        input.value = "";
        input.focus();
        runSearch("");
      });
    })();
  </script>`;
}
