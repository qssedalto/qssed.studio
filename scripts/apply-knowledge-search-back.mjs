import fs from "node:fs";

function read(path) { return fs.readFileSync(path, "utf8"); }
function write(path, text) { fs.writeFileSync(path, text); }
function replaceOnce(text, from, to, label) {
  const first = text.indexOf(from);
  if (first < 0) throw new Error(`Missing ${label}`);
  if (text.indexOf(from, first + from.length) >= 0) throw new Error(`Duplicate ${label}`);
  return text.slice(0, first) + to + text.slice(first + from.length);
}

// Knowledge UI: put one shared search surface at root, category, and article level.
{
  const path = "studio/ui-knowledge.js";
  let text = read(path);
  text = replaceOnce(
    text,
    'import { ARCHIVE_KNOWLEDGE } from "./knowledge-archive.js";\n',
    'import { ARCHIVE_KNOWLEDGE } from "./knowledge-archive.js";\nimport { knowledgeSearchPanel } from "./knowledge-search.js";\n',
    "knowledge search import"
  );
  text = replaceOnce(text, '<div class="knowledge-shell knowledge-root">\n', '<div class="knowledge-shell knowledge-root">\n      ${knowledgeSearchPanel(zh)}\n', "root search panel");
  text = replaceOnce(text, '<div class="knowledge-shell">\n      ${breadcrumbs', '<div class="knowledge-shell">\n      ${knowledgeSearchPanel(zh)}\n      ${breadcrumbs', "category search panel");
  text = replaceOnce(text, '<div class="knowledge-shell knowledge-article-layout">\n      ${breadcrumbs', '<div class="knowledge-shell knowledge-article-layout">\n      ${knowledgeSearchPanel(zh)}\n      ${breadcrumbs', "article search panel");
  write(path, text);
}

// Shell: deterministic/historical mobile back behavior + Supabase/static search runtime.
{
  const path = "studio/ui-shell.js";
  let text = read(path);
  text = replaceOnce(
    text,
    'import { informationContent } from "./ui-information.js";\n',
    'import { informationContent } from "./ui-information.js";\nimport { knowledgeSearchClientScript } from "./knowledge-search.js";\nimport { compactBackHref, compactBackScript } from "./ui-navigation.js";\n',
    "shell imports"
  );
  text = replaceOnce(
    text,
    '  const dashboardPath = path === "/dashboard";\n',
    '  const dashboardPath = path === "/dashboard";\n  const knowledgePath = path.startsWith("/info/knowledge");\n  const compactBackUrl = compactBackHref(path, zh);\n',
    "shell route state"
  );
  text = replaceOnce(
    text,
    '<button id="compact-back-button" class="compact-back-button" type="button" aria-label="${zh ? "返回导航" : "Back to navigation"}">\n      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">\n        <path d="M14.5 5.5 8 12l6.5 6.5"/>\n      </svg>\n    </button>',
    '<button id="compact-back-button" class="compact-back-button" type="button" aria-label="${zh ? "返回上一级" : "Back"}" data-fallback-href="${compactBackUrl}">\n      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">\n        <path d="M14.5 5.5 8 12l6.5 6.5"/>\n      </svg>\n      <span>${zh ? "返回" : "Back"}</span>\n    </button>',
    "back button markup"
  );
  text = replaceOnce(
    text,
    '  ${supabaseScript()}\n  ${path === "/settings/storage" ? storageClientScript(zh, links.login) : ""}',
    '  ${supabaseScript()}\n  ${knowledgePath ? knowledgeSearchClientScript(zh) : ""}\n  ${path === "/settings/storage" ? storageClientScript(zh, links.login) : ""}',
    "knowledge search runtime"
  );
  text = replaceOnce(text, '    const compactSidebarKey = "qssed-sidebar-scroll-v1";\n', '', "obsolete compact sidebar key");
  text = replaceOnce(
    text,
    `    function showCompactNavigation() {\n      if (!compactMedia.matches) return;\n      try { sessionStorage.setItem(compactViewKey, "menu"); } catch {}\n      document.documentElement.classList.remove("compact-content-view");\n      document.documentElement.classList.add("compact-menu-view");\n      const sidebar = document.getElementById("os-sidebar");\n      const saved = Number(sessionStorage.getItem(compactSidebarKey) || "0");\n      requestAnimationFrame(() => {\n        if (sidebar && Number.isFinite(saved)) sidebar.scrollTop = saved;\n      });\n    }\n\n    document.getElementById("compact-back-button")?.addEventListener("click", showCompactNavigation);`,
    '    ${compactBackScript(path, zh)}',
    "old menu back behavior"
  );
  write(path, text);
}

// Knowledge search styles.
{
  const path = "studio/ui-style-knowledge.js";
  let text = read(path);
  const css = `    .knowledge-search-panel{display:grid;gap:13px;padding:18px;border:1px solid color-mix(in srgb,var(--border) 88%,transparent);border-radius:22px;background:color-mix(in srgb,var(--card) 90%,transparent);box-shadow:0 10px 30px rgba(15,23,42,.045)}\n    .knowledge-search-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:18px}\n    .knowledge-search-heading h3{margin:5px 0 5px;font-size:18px;letter-spacing:-.02em}\n    .knowledge-search-heading p{max-width:760px;margin:0;color:var(--muted);font-size:12px;line-height:1.55}\n    .knowledge-search-count{flex:0 0 auto;min-height:28px;padding:6px 10px;border-radius:999px;background:var(--surface-soft);color:var(--muted);font-size:11px;font-weight:760}\n    .knowledge-search-count:empty{display:none}\n    .knowledge-search-box{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:9px;min-height:50px;padding:0 11px;border:1px solid var(--border);border-radius:15px;background:var(--surface-soft);transition:border-color .15s ease,box-shadow .15s ease,background .15s ease}\n    .knowledge-search-box:focus-within{border-color:color-mix(in srgb,var(--primary) 58%,var(--border));box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 11%,transparent);background:var(--card)}\n    .knowledge-search-box>svg{width:19px;height:19px;color:var(--muted)}\n    .knowledge-search-box input{width:100%;min-height:48px;margin:0!important;padding:0!important;border:0!important;background:transparent!important;color:var(--text);box-shadow:none!important;font:inherit;font-size:14px;outline:0}\n    .knowledge-search-clear{display:grid!important;place-items:center;width:32px!important;min-width:32px!important;height:32px!important;min-height:32px!important;margin:0!important;padding:0!important;border:0!important;border-radius:50%!important;background:var(--secondary)!important;color:var(--text)!important;box-shadow:none!important;font-size:20px!important;font-weight:500!important;line-height:1!important}\n    .knowledge-search-clear[hidden]{display:none!important}\n    .knowledge-search-clear:active{transform:scale(.92)!important}\n    .knowledge-search-results{display:grid;gap:7px;max-height:min(58vh,620px);overflow:auto;padding:3px 1px 1px;overscroll-behavior:contain}\n    .knowledge-search-result{display:grid;gap:5px;padding:13px 14px;border:1px solid var(--border);border-radius:14px;background:var(--surface-soft);color:var(--text);text-decoration:none;transition:background .13s ease,border-color .13s ease,transform .1s ease}\n    a.knowledge-search-result:hover{border-color:color-mix(in srgb,var(--primary) 34%,var(--border));background:color-mix(in srgb,var(--primary) 5%,var(--surface-soft))}\n    a.knowledge-search-result:active{transform:scale(.994)}\n    .knowledge-search-result-meta{color:var(--primary);font-size:10px;font-weight:790}\n    .knowledge-search-result strong{font-size:14px;line-height:1.35}\n    .knowledge-search-result p{margin:0;color:var(--muted);font-size:11px;line-height:1.55}\n    .knowledge-search-empty{padding:20px;border:1px dashed var(--border);border-radius:14px;text-align:center}\n    .knowledge-search-empty strong{font-size:14px}\n    .knowledge-search-empty p,.knowledge-search-notice{margin:5px 0 0;color:var(--muted);font-size:11px;line-height:1.5}\n    .knowledge-search-notice{padding:4px 3px}\n\n`;
  text = replaceOnce(text, '    @media(max-width:1180px){', css + '    @media(max-width:1180px){', "knowledge search CSS insertion");
  text = replaceOnce(text, '    @media(max-width:640px){\n', '    @media(max-width:640px){\n      .knowledge-search-panel{padding:15px;border-radius:19px}\n      .knowledge-search-heading{display:grid;gap:8px}\n', "knowledge search mobile CSS");
  text = replaceOnce(text, '.knowledge-category-card,.knowledge-topic-card{transition:none!important}', '.knowledge-category-card,.knowledge-topic-card,.knowledge-search-result{transition:none!important}', "reduced motion search CSS");
  text = replaceOnce(text, '.knowledge-intro-panel,.knowledge-category-hero,.knowledge-category-card,.knowledge-topic-card,.knowledge-article,.knowledge-local-nav{border-color:var(--text)}', '.knowledge-intro-panel,.knowledge-category-hero,.knowledge-category-card,.knowledge-topic-card,.knowledge-article,.knowledge-local-nav,.knowledge-search-panel,.knowledge-search-result{border-color:var(--text)}', "high contrast search CSS");
  write(path, text);
}

// Mobile back button visual treatment: pill, black/white in dark mode, white/black in light mode.
{
  const path = "studio/ui-styles.js";
  let text = read(path);
  const css = `    /* COMPACT_BACK_NAV_V2 */\n    @media(max-width:900px){\n      .compact-back-zone{width:142px;height:82px}\n      .compact-back-button{width:auto!important;min-width:88px!important;height:48px!important;min-height:48px!important;padding:0 15px 0 12px!important;border-radius:999px!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:5px!important;margin:0!important;font-size:13px!important;font-weight:760!important;letter-spacing:0!important;-webkit-backdrop-filter:blur(22px) saturate(160%);backdrop-filter:blur(22px) saturate(160%);transition:transform .12s ease,background .15s ease,border-color .15s ease,box-shadow .15s ease!important}\n      .compact-back-button span{display:inline!important;color:inherit!important;line-height:1!important}\n      .compact-back-button svg{width:21px!important;height:21px!important;stroke:currentColor!important}\n      :root:not([data-theme="light"]) .compact-back-button{background:#000!important;color:#fff!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:0 10px 28px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.09)!important}\n      :root[data-theme="light"] .compact-back-button{background:rgba(255,255,255,.94)!important;color:#111!important;border:1px solid rgba(17,24,39,.10)!important;box-shadow:0 10px 26px rgba(18,26,38,.12),inset 0 1px 0 rgba(255,255,255,.75)!important}\n      .compact-back-button:active{transform:scale(.955)!important}\n    }\n`;
  text = replaceOnce(text, '${dashboardStyles()}${knowledgeStyles()}</style>`;', css + '${dashboardStyles()}${knowledgeStyles()}</style>`;', "compact back v2 styles");
  write(path, text);
}

// Architecture notes.
{
  const path = "studio/README.md";
  let text = read(path);
  text = replaceOnce(
    text,
    '- `ui-knowledge.js` — Knowledge Base root/category/article composition for 54 bilingual routes.\n',
    '- `ui-knowledge.js` — Knowledge Base root/category/article composition for 54 bilingual routes.\n- `knowledge-search.js` — hybrid literal search across built-in knowledge and the current user’s Supabase `knowledge_documents`; supports phrases and single CJK characters.\n- `ui-navigation.js` — deterministic compact/mobile back targets with safe Knowledge Base history preservation.\n',
    "README knowledge runtime entries"
  );
  write(path, text);
}
