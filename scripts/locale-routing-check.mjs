import {
  localeFromAcceptLanguage,
  localeFromPath,
  normalizeSupportedLocale,
  preferredLocaleFromRequest
} from "../studio/locale.js";

function equal(actual, expected, label) {
  if (actual !== expected) throw new Error(label + ": expected " + expected + ", received " + actual);
}

equal(normalizeSupportedLocale("zh-CN"), "zh-cn", "normalize zh-CN");
equal(normalizeSupportedLocale("zh-Hant-TW"), "zh-cn", "normalize supported Chinese UI");
equal(normalizeSupportedLocale("en-US"), "en", "normalize en-US");
equal(normalizeSupportedLocale("fr-FR"), "", "unsupported language");

equal(localeFromAcceptLanguage("zh-CN,zh;q=0.9,en;q=0.8"), "zh-cn", "Chinese device preference");
equal(localeFromAcceptLanguage("en-US,en;q=0.9,zh-CN;q=0.8"), "en", "English first must stay English");
equal(localeFromAcceptLanguage("fr-FR,zh-CN;q=0.9,en;q=0.8"), "zh-cn", "highest ranked supported language");
equal(localeFromAcceptLanguage("fr-FR,en;q=0.9,zh;q=0.8"), "en", "English supported fallback");
equal(localeFromAcceptLanguage("zh;q=0,en-US;q=0.8"), "en", "q=0 exclusion");
equal(localeFromAcceptLanguage("de-DE,*;q=0.5"), "en", "wildcard fallback");
equal(localeFromAcceptLanguage(""), "en", "empty header fallback");

equal(localeFromPath("/zh-cn/settings"), "zh-cn", "Chinese route override");
equal(localeFromPath("/en/settings"), "en", "English route override");
equal(localeFromPath("/settings"), "", "unlocalized route");

const request = new Request("https://qsseda.com/", {headers:{"Accept-Language":"en-US,en;q=0.9,zh-CN;q=0.8"}});
equal(preferredLocaleFromRequest(request), "en", "request header preference");

console.log("Locale routing checks passed.");
