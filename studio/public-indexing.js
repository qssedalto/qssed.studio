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
