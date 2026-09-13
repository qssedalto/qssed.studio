import { KNOWLEDGE_CATEGORIES, KNOWLEDGE_ROOT, getKnowledgeRoute } from "./knowledge-routes.js";
import { PROJECT_KNOWLEDGE } from "./knowledge-projects.js";
import { TECHNOLOGY_KNOWLEDGE } from "./knowledge-technology.js";
import { STUDY_KNOWLEDGE } from "./knowledge-study.js";
import { METHODOLOGY_KNOWLEDGE } from "./knowledge-methodology.js";
import { REFERENCE_KNOWLEDGE } from "./knowledge-references.js";
import { ARCHIVE_KNOWLEDGE } from "./knowledge-archive.js";
import { knowledgeSearchPanel } from "./knowledge-search.js";

const CONTENT_BY_CATEGORY = {
  projects: PROJECT_KNOWLEDGE,
  technology: TECHNOLOGY_KNOWLEDGE,
  study: STUDY_KNOWLEDGE,
  methodology: METHODOLOGY_KNOWLEDGE,
  references: REFERENCE_KNOWLEDGE,
  archive: ARCHIVE_KNOWLEDGE
};

const CATEGORY_ICONS = {
  projects: '<path d="M4 7.5h6l1.7 2H20v8.8a1.7 1.7 0 01-1.7 1.7H5.7A1.7 1.7 0 014 18.3V7.5z"/><path d="M4 10h16"/>',
  technology: '<rect x="4" y="5" width="16" height="14" rx="3"/><path d="M8 9l-2 3 2 3M16 9l2 3-2 3M13 8l-2 8"/>',
  study: '<path d="M3 7.5L12 3l9 4.5-9 4.5-9-4.5z"/><path d="M6 10v5.5c2.5 2 9.5 2 12 0V10"/>',
  methodology: '<circle cx="12" cy="12" r="8"/><path d="M8.5 12l2.2 2.2 4.8-5M12 4v2M20 12h-2M12 20v-2M4 12h2"/>',
  references: '<path d="M5 4.5h10a2 2 0 012 2v13H7a2 2 0 01-2-2v-13z"/><path d="M7 17.5h12V7.5h-2M9 8h5M9 11h5"/>',
  archive: '<path d="M5 7h14v12H5z"/><path d="M4 4h16v3H4zM9 11h6"/>'
};

function iconFor(category) {
  return `<span class="knowledge-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${CATEGORY_ICONS[category.slug] || CATEGORY_ICONS.references}</svg></span>`;
}

function prefixFor(zh) {
  return zh ? "/zh-cn" : "/en";
}

function categoryHref(category, zh) {
  return `${prefixFor(zh)}${KNOWLEDGE_ROOT}/${category.slug}`;
}

function topicHref(category, item, zh) {
  return `${categoryHref(category, zh)}/${item[0]}`;
}

export function knowledgePageMeta(path, zh) {
  const route = getKnowledgeRoute(path);
  if (!route) return null;
  if (route.type === "root") {
    return {
      section: "info",
      title: zh ? "知识库" : "Knowledge Base",
      description: zh
        ? "把项目、技术、学习、方法论、参考资料和长期档案整理成可以持续积累和检索的个人知识系统。"
        : "A durable personal knowledge system for projects, technology, study, methodology, references, and long-term archives."
    };
  }
  if (route.type === "category") {
    return {
      section: "info",
      title: zh ? route.category.zh : route.category.en,
      description: zh ? route.category.zhDescription : route.category.enDescription
    };
  }
  const content = CONTENT_BY_CATEGORY[route.category.slug]?.[route.item[0]]?.[zh ? "zh" : "en"];
  return {
    section: "info",
    title: zh ? route.item[1] : route.item[2],
    description: content?.summary || (zh ? route.category.zhDescription : route.category.enDescription)
  };
}

export function knowledgeContent(path, zh) {
  const route = getKnowledgeRoute(path);
  if (!route) throw new Error("Unhandled knowledge path: " + path);
  if (route.type === "root") return knowledgeRootContent(zh);
  if (route.type === "category") return knowledgeCategoryContent(route.category, zh);
  return knowledgeTopicContent(route.category, route.item, zh);
}

function knowledgeRootContent(zh) {
  const topicCount = KNOWLEDGE_CATEGORIES.reduce((sum, category) => sum + category.items.length, 0);
  return `
    <div class="knowledge-shell knowledge-root">
      ${knowledgeSearchPanel(zh)}
      <section class="knowledge-intro-panel">
        <div>
          <span class="knowledge-overline">${zh ? "QssedA Knowledge" : "QssedA Knowledge"}</span>
          <h2>${zh ? "把值得保留的东西，变成以后真的找得到的知识" : "Turn things worth keeping into knowledge you can actually find later"}</h2>
          <p>${zh ? "这里不是临时笔记堆。每个大类都有独立路由，每个主题也有自己的页面，用来保存会反复使用、需要解释上下文、或者几个月后仍然值得重新查的内容。" : "This is not a pile of temporary notes. Every category and topic has its own route for knowledge that remains useful, contextual, and retrievable months later."}</p>
        </div>
        <div class="knowledge-intro-stats" aria-label="${zh ? "知识库结构" : "Knowledge structure"}">
          <div><strong>${KNOWLEDGE_CATEGORIES.length}</strong><span>${zh ? "大类" : "categories"}</span></div>
          <div><strong>${topicCount}</strong><span>${zh ? "主题" : "topics"}</span></div>
          <div><strong>2</strong><span>${zh ? "语言" : "languages"}</span></div>
        </div>
      </section>
      <section class="knowledge-category-grid">
        ${KNOWLEDGE_CATEGORIES.map(category => `
          <a class="knowledge-category-card" href="${categoryHref(category, zh)}">
            ${iconFor(category)}
            <span class="knowledge-category-count">${category.items.length} ${zh ? "个主题" : "topics"}</span>
            <h3>${zh ? category.zh : category.en}</h3>
            <p>${zh ? category.zhDescription : category.enDescription}</p>
            <span class="knowledge-card-action">${zh ? "打开分类" : "Open category"}<b aria-hidden="true">›</b></span>
          </a>
        `).join("")}
      </section>
      <section class="knowledge-guidance os-card">
        <div>
          <small>${zh ? "收录原则" : "What belongs here"}</small>
          <h3>${zh ? "三个月后还可能需要重新查，就值得进入知识库" : "If you may need it again in three months, it belongs here"}</h3>
        </div>
        <ul>
          <li>${zh ? "记录原因、条件和上下文，不只保存结论。" : "Keep reasons, conditions, and context—not just conclusions."}</li>
          <li>${zh ? "优先保存可复用方法、项目决策、公式、排错经验与高质量来源。" : "Prioritize reusable methods, project decisions, formulas, debugging lessons, and strong sources."}</li>
          <li>${zh ? "临时待办、一次性提醒和纯文件更适合 Tasks / Notes / Storage。" : "Temporary todos, reminders, and raw files belong in Tasks, Notes, or Storage."}</li>
        </ul>
      </section>
    </div>`;
}

function knowledgeCategoryContent(category, zh) {
  return `
    <div class="knowledge-shell">
      ${knowledgeSearchPanel(zh)}
      ${breadcrumbs([{ label: zh ? "知识库" : "Knowledge Base", href: `${prefixFor(zh)}${KNOWLEDGE_ROOT}` }, { label: zh ? category.zh : category.en }])}
      <section class="knowledge-category-hero">
        ${iconFor(category)}
        <div>
          <span class="knowledge-overline">${zh ? "知识分类" : "Knowledge category"}</span>
          <h2>${zh ? category.zh : category.en}</h2>
          <p>${zh ? category.zhDescription : category.enDescription}</p>
        </div>
      </section>
      <section class="knowledge-topic-grid">
        ${category.items.map((item, index) => `
          <a class="knowledge-topic-card" href="${topicHref(category, item, zh)}">
            <span class="knowledge-topic-index">${String(index + 1).padStart(2, "0")}</span>
            <div><h3>${zh ? item[1] : item[2]}</h3><p>${topicSummary(category, item, zh)}</p></div>
            <b aria-hidden="true">›</b>
          </a>
        `).join("")}
      </section>
      ${categorySwitcher(category, zh)}
    </div>`;
}

function topicSummary(category, item, zh) {
  return CONTENT_BY_CATEGORY[category.slug]?.[item[0]]?.[zh ? "zh" : "en"]?.summary || (zh ? category.zhDescription : category.enDescription);
}

function knowledgeTopicContent(category, item, zh) {
  const localized = CONTENT_BY_CATEGORY[category.slug]?.[item[0]]?.[zh ? "zh" : "en"];
  if (!localized) throw new Error(`Missing knowledge content: ${category.slug}/${item[0]}`);
  const currentIndex = category.items.findIndex(entry => entry[0] === item[0]);
  const previous = currentIndex > 0 ? category.items[currentIndex - 1] : null;
  const next = currentIndex < category.items.length - 1 ? category.items[currentIndex + 1] : null;

  return `
    <div class="knowledge-shell knowledge-article-layout">
      ${knowledgeSearchPanel(zh)}
      ${breadcrumbs([
        { label: zh ? "知识库" : "Knowledge Base", href: `${prefixFor(zh)}${KNOWLEDGE_ROOT}` },
        { label: zh ? category.zh : category.en, href: categoryHref(category, zh) },
        { label: zh ? item[1] : item[2] }
      ])}
      <div class="knowledge-article-grid">
        <aside class="knowledge-local-nav">
          <a class="knowledge-local-heading" href="${categoryHref(category, zh)}">${iconFor(category)}<span>${zh ? category.zh : category.en}</span></a>
          <div>
            ${category.items.map(entry => `<a href="${topicHref(category, entry, zh)}"${entry[0] === item[0] ? ' aria-current="page"' : ""}>${zh ? entry[1] : entry[2]}</a>`).join("")}
          </div>
        </aside>
        <article class="knowledge-article">
          <header class="knowledge-article-header">
            <span class="knowledge-overline">${zh ? category.zh : category.en}</span>
            <h2>${zh ? item[1] : item[2]}</h2>
            <p>${localized.summary}</p>
          </header>
          <div class="knowledge-article-body">
            ${(localized.sections || []).map((section, index) => renderSection(section, index)).join("")}
          </div>
          <footer class="knowledge-article-footer">
            ${previous ? `<a class="knowledge-page-link previous" href="${topicHref(category, previous, zh)}"><small>${zh ? "上一篇" : "Previous"}</small><strong>‹ ${zh ? previous[1] : previous[2]}</strong></a>` : `<span></span>`}
            ${next ? `<a class="knowledge-page-link next" href="${topicHref(category, next, zh)}"><small>${zh ? "下一篇" : "Next"}</small><strong>${zh ? next[1] : next[2]} ›</strong></a>` : `<a class="knowledge-page-link next" href="${categoryHref(category, zh)}"><small>${zh ? "返回" : "Back"}</small><strong>${zh ? category.zh : category.en} ›</strong></a>`}
          </footer>
        </article>
      </div>
      ${categorySwitcher(category, zh)}
    </div>`;
}

function renderSection(section, index) {
  return `
    <section class="knowledge-section" id="knowledge-section-${index + 1}">
      <span class="knowledge-section-number">${String(index + 1).padStart(2, "0")}</span>
      <div>
        <h3>${section.title}</h3>
        ${(section.paragraphs || []).map(paragraph => `<p>${paragraph}</p>`).join("")}
        ${section.bullets?.length ? `<ul>${section.bullets.map(item => `<li>${item}</li>`).join("")}</ul>` : ""}
        ${section.code ? `<pre class="knowledge-code"><code>${escapeCode(section.code)}</code></pre>` : ""}
      </div>
    </section>`;
}

function escapeCode(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function breadcrumbs(items) {
  return `<nav class="knowledge-breadcrumbs" aria-label="Breadcrumb">${items.map((item, index) => `${index ? '<span aria-hidden="true">›</span>' : ""}${item.href ? `<a href="${item.href}">${item.label}</a>` : `<strong>${item.label}</strong>`}`).join("")}</nav>`;
}

function categorySwitcher(activeCategory, zh) {
  return `
    <nav class="knowledge-category-switcher" aria-label="${zh ? "知识分类" : "Knowledge categories"}">
      ${KNOWLEDGE_CATEGORIES.map(category => `<a href="${categoryHref(category, zh)}"${category.slug === activeCategory.slug ? ' aria-current="page"' : ""}>${zh ? category.zh : category.en}</a>`).join("")}
    </nav>`;
}
