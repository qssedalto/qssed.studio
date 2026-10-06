// 初学者导读：公开页面 SEO/索引辅助：生成 canonical、robots、结构化信息等。这里描述公开内容，不能泄漏登录后资源。
import { SUPPORTED_LOCALES, normalizeSupportedLocale } from "./locale.js";
import { QUESTION_INDEX_LOCALES, publishedQuestionIds } from "./public-questions.js";

// 只有明确列在这里的公开页面才允许被搜索引擎索引。
//
// Watch 私有仪表盘 aw.* 永远不在这里；只有主站的 /aw/setup 安装教程是公开可索引内容。
export const PUBLIC_INDEXABLE_ROUTES = Object.freeze([
  "/",
  "/aw/setup",
  "/wishes",
  "/birthday",
  "/mid-autumn"
]);

export function isPublicIndexableRoute(pathname) {
  return PUBLIC_INDEXABLE_ROUTES.includes(normalizeRoute(pathname));
}

export function canonicalPublicUrl(locale, pathname) {
  const code = normalizeSupportedLocale(locale) || "en-us";
  const route = normalizeRoute(pathname);
  if (route === "/") return "https://qsseda.com/" + code;
  return "https://qsseda.com/" + code + route;
}

/// 为公开页生成 canonical / hreflang / robots 元数据。
/// canonical 永远指向 qsseda.com，避免 .online/.studio 或产品子域把相同教程拆成多份搜索结果。
export function publicSeoHeadMarkup(locale, pathname, description = "", options = {}) {
  const route = normalizeRoute(pathname);
  const code = normalizeSupportedLocale(locale) || "en-us";
  const canonical = canonicalPublicUrl(code, route);
  const alternateLocales = Array.isArray(options?.alternateLocales) && options.alternateLocales.length
    ? options.alternateLocales
    : SUPPORTED_LOCALES;
  const alternates = alternateLocales.map(item =>
    '<link rel="alternate" hreflang="' + item + '" href="' + canonicalPublicUrl(item, route) + '">'
  ).join("");
  const xDefault = options?.xDefault || (route === "/"
    ? "https://qsseda.com/"
    : canonicalPublicUrl("en-us", route));
  const descriptionMeta = description
    ? '<meta name="description" content="' + escapeHtml(description) + '">'
    : "";
  return [
    descriptionMeta,
    '<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1">',
    '<link rel="canonical" href="' + canonical + '">',
    alternates,
    '<link rel="alternate" hreflang="x-default" href="' + xDefault + '">'
  ].filter(Boolean).join("");
}

/// 在已有 HTML </head> 前注入 SEO；如果模板不完整则保持原样，而不是猜测插入位置。
export function injectPublicSeo(markup, locale, pathname, description = "", options = {}) {
  const source = String(markup || "");
  const meta = publicSeoHeadMarkup(locale, pathname, description, options);
  if (!source.includes("</head>")) return source;
  return source.replace("</head>", meta + "</head>");
}

/// Sitemap 只枚举公开路由和已发布 Questions，不包含任何需要 AERTEX 会话的 Watch 数据页面。
export function publicSitemapUrls() {
  const urls = ["https://qsseda.com/"];
  for (const route of PUBLIC_INDEXABLE_ROUTES) {
    for (const locale of SUPPORTED_LOCALES) {
      urls.push(canonicalPublicUrl(locale, route));
    }
  }
  for (const locale of QUESTION_INDEX_LOCALES) {
    urls.push(canonicalPublicUrl(locale, "/q"));
    for (const id of publishedQuestionIds()) {
      urls.push(canonicalPublicUrl(locale, "/q/" + id));
    }
  }
  return [...new Set(urls)];
}

function normalizeRoute(pathname) {
  const value = String(pathname || "/").trim() || "/";
  if (value === "/") return "/";
  return "/" + value.split("/").filter(Boolean).join("/");
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[character]));
}
