/**
 * 【初学者导读】
 * 文件：scripts/locale-routing-check.mjs
 * CI 回归检查主题：locale routing。
 * 作用：把当前产品必须保持的路由、数据、界面或架构规则写成自动断言，让未来改动在合并前就暴露问题。
 * 阅读顺序：先看加载了哪些源文件，再逐条读 assert；每条 assert 都可以理解为一条最小产品规格。
 * 修改原则：先判断失败来自实现错误还是规格变化；只有规格确实调整时，才同时更新实现与检查。
 * 初学者提示：字符串检查适合固定结构，算法应使用小型输入/输出样例验证，二者各有用途。
 */
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  localeFromAcceptLanguage,
  localeFromPath,
  normalizeSupportedLocale,
  preferredLocaleFromRequest
} from "../studio/locale.js";

function equal(actual, expected, label) {
  if (actual !== expected) throw new Error(label + ": expected " + expected + ", received " + actual);
}

const expected = ["en-us","en-gb","en-au","zh-cn","zh-tw","ja-jp","ko-kr","fr-fr","es-es","el-gr","ar-sa"];
equal(JSON.stringify(SUPPORTED_LOCALES), JSON.stringify(expected), "supported locale registry");
equal(DEFAULT_LOCALE, "en-us", "default locale");

for (const code of expected) {
  equal(normalizeSupportedLocale(code), code, "normalize " + code);
  equal(localeFromPath("/" + code + "/settings"), code, "route " + code);
}

equal(normalizeSupportedLocale("en-UK"), "en-gb", "legacy UK alias");
equal(normalizeSupportedLocale("zh-HK"), "zh-tw", "Hong Kong Traditional Chinese");
equal(normalizeSupportedLocale("zh-Hant-HK"), "zh-tw", "Hant Traditional Chinese");
equal(normalizeSupportedLocale("zh-SG"), "zh-cn", "Singapore Simplified Chinese");
equal(normalizeSupportedLocale("ja"), "ja-jp", "Japanese");
equal(normalizeSupportedLocale("ko"), "ko-kr", "Korean");
equal(normalizeSupportedLocale("fr-CA"), "fr-fr", "French family");
equal(normalizeSupportedLocale("es-MX"), "es-es", "Spanish family");
equal(normalizeSupportedLocale("el-CY"), "el-gr", "Greek family");
equal(normalizeSupportedLocale("ar-AE"), "ar-sa", "Arabic family");

equal(localeFromAcceptLanguage("en-GB,en;q=0.9"), "en-gb", "British English device");
equal(localeFromAcceptLanguage("en-AU,en;q=0.9"), "en-au", "Australian English device");
equal(localeFromAcceptLanguage("zh-TW,zh;q=0.9"), "zh-tw", "Traditional Chinese device");
equal(localeFromAcceptLanguage("ja-JP,en-US;q=0.8"), "ja-jp", "Japanese device");
equal(localeFromAcceptLanguage("ko-KR,en-US;q=0.8"), "ko-kr", "Korean device");
equal(localeFromAcceptLanguage("fr-FR,en-US;q=0.8"), "fr-fr", "French device");
equal(localeFromAcceptLanguage("es-ES,en-US;q=0.8"), "es-es", "Spanish device");
equal(localeFromAcceptLanguage("el-GR,en-US;q=0.8"), "el-gr", "Greek device");
equal(localeFromAcceptLanguage("ar-SA,en-US;q=0.8"), "ar-sa", "Arabic device");
equal(localeFromAcceptLanguage("de-DE,en-GB;q=0.8,en-US;q=0.7"), "en-gb", "highest supported preference");
equal(localeFromAcceptLanguage("de-DE"), "en-us", "unsupported device fallback");

const request = new Request("https://qsseda.com/", {headers:{"Accept-Language":"en-AU,en;q=0.9"}});
equal(preferredLocaleFromRequest(request), "en-au", "request header preference");

const localeSource = await (await import("node:fs/promises")).readFile(new URL("../studio/locale.js", import.meta.url), "utf8");
for (const forbidden of ["CF-IPCountry", "request.cf", "localStorage", "document.cookie", "searchParams.get(\\\"lang\\\")"]) {
  if (localeSource.includes(forbidden)) throw new Error("Locale detector must not persist or geo-detect language: " + forbidden);
}

console.log("Locale routing checks passed for " + expected.length + " locales.");
