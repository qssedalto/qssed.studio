import { SUPPORTED_LOCALES, normalizeSupportedLocale } from "./locale.js";
import { QUESTION_INDEX_LOCALES, publishedQuestions } from "./public-questions.js";

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

export function publicQuestionSitemapEntries() {
  const questions = publishedQuestions();
  const latestQuestionUpdate = questions.reduce(
    (latest, item) => String(item.updated || "") > latest ? String(item.updated || "") : latest,
    ""
  );
  const entries = [];
  for (const locale of QUESTION_INDEX_LOCALES) {
    entries.push({
      url: canonicalPublicUrl(locale, "/q"),
      lastmod: latestQuestionUpdate
    });
    for (const item of questions) {
      entries.push({
        url: canonicalPublicUrl(locale, "/q/" + item.id),
        lastmod: String(item.updated || latestQuestionUpdate || "")
      });
    }
  }
  return entries;
}

export function publicSitemapEntries() {
  const entries = [{ url: "https://qsseda.com/", lastmod: "" }];
  for (const route of PUBLIC_INDEXABLE_ROUTES) {
    for (const locale of SUPPORTED_LOCALES) {
      entries.push({ url: canonicalPublicUrl(locale, route), lastmod: "" });
    }
  }
  entries.push(...publicQuestionSitemapEntries());

  const unique = new Map();
  for (const entry of entries) {
    if (!unique.has(entry.url)) unique.set(entry.url, entry);
  }
  return [...unique.values()];
}

export function publicSitemapUrls() {
  return publicSitemapEntries().map(entry => entry.url);
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
