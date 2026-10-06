/**
 * 【初学者导读】
 * 文件：studio/public-indexing.js
 * 公开页面/索引模块：生成无需登录也能访问或被搜索引擎理解的页面与元数据。
 * 阅读顺序：先看对外导出和路由入口，再看参数归一化、权限/语言处理，最后追踪存储或模板渲染。
 * 初学者重点：区分“数据来源”“业务规则”“展示格式”三层，不要把一个显示问题直接当成数据库问题。
 * 修改注意：尽量保持现有路径、字段和返回结构兼容；规则改变时补充对应回归检查。
 * 调试方法：先确认实际命中的路由和 locale，再检查 handler 输入，最后验证最终 Response。
 */
import { SUPPORTED_LOCALES, normalizeSupportedLocale } from "./locale.js";
import { QUESTION_INDEX_LOCALES, publishedQuestionIds } from "./public-questions.js";

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

export function injectPublicSeo(markup, locale, pathname, description = "", options = {}) {
  const source = String(markup || "");
  const meta = publicSeoHeadMarkup(locale, pathname, description, options);
  if (!source.includes("</head>")) return source;
  return source.replace("</head>", meta + "</head>");
}

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
