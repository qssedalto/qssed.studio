/**
 * 【初学者导读】
 * 文件：studio/locale.js
 * 语言与地区模块：负责 locale 解析、默认语言和路径语言的统一规则。
 * 阅读顺序：先看对外导出和路由入口，再看参数归一化、权限/语言处理，最后追踪存储或模板渲染。
 * 初学者重点：区分“数据来源”“业务规则”“展示格式”三层，不要把一个显示问题直接当成数据库问题。
 * 修改注意：尽量保持现有路径、字段和返回结构兼容；规则改变时补充对应回归检查。
 * 调试方法：先确认实际命中的路由和 locale，再检查 handler 输入，最后验证最终 Response。
 */
// Centralized UI locale detection.
// UI language comes from explicit locale routes and the browser/device
// Accept-Language preference. Network geography must never choose interface language.

export const DEFAULT_LOCALE = "en-us";

export const SUPPORTED_LOCALES = Object.freeze([
  "en-us",
  "en-gb",
  "en-au",
  "zh-cn",
  "zh-tw",
  "ja-jp",
  "ko-kr",
  "fr-fr",
  "es-es",
  "el-gr",
  "ar-sa"
]);

const SUPPORTED = new Set(SUPPORTED_LOCALES);

export const LOCALE_META = Object.freeze({
  "en-us": { label: "English (US)", nativeName: "English (US)", shortName: "EN", dir: "ltr" },
  "en-gb": { label: "English (UK)", nativeName: "English (UK)", shortName: "EN", dir: "ltr" },
  "en-au": { label: "English (Australia)", nativeName: "English (Australia)", shortName: "EN", dir: "ltr" },
  "zh-cn": { label: "简体中文", nativeName: "简体中文", shortName: "中", dir: "ltr" },
  "zh-tw": { label: "繁體中文", nativeName: "繁體中文", shortName: "繁", dir: "ltr" },
  "ja-jp": { label: "日本語", nativeName: "日本語", shortName: "日", dir: "ltr" },
  "ko-kr": { label: "한국어", nativeName: "한국어", shortName: "한", dir: "ltr" },
  "fr-fr": { label: "Français", nativeName: "Français", shortName: "FR", dir: "ltr" },
  "es-es": { label: "Español", nativeName: "Español", shortName: "ES", dir: "ltr" },
  "el-gr": { label: "Ελληνικά", nativeName: "Ελληνικά", shortName: "ΕΛ", dir: "ltr" },
  "ar-sa": { label: "العربية", nativeName: "العربية", shortName: "ع", dir: "rtl" }
});

export function normalizeSupportedLocale(value) {
  const tag = String(value || "").trim().toLowerCase().replaceAll("_", "-");
  if (!tag) return "";

  if (SUPPORTED.has(tag)) return tag;

  if (tag === "en" || tag === "en-us") return "en-us";
  if (tag === "en-gb" || tag === "en-uk") return "en-gb";
  if (tag === "en-au") return "en-au";
  if (tag.startsWith("en-")) return "en-us";

  if (tag === "zh-tw" || tag === "zh-hk" || tag === "zh-mo" || tag.startsWith("zh-hant")) return "zh-tw";
  if (tag === "zh" || tag === "zh-cn" || tag === "zh-sg" || tag.startsWith("zh-hans")) return "zh-cn";

  if (tag === "ja" || tag.startsWith("ja-")) return "ja-jp";
  if (tag === "ko" || tag.startsWith("ko-")) return "ko-kr";
  if (tag === "fr" || tag.startsWith("fr-")) return "fr-fr";
  if (tag === "es" || tag.startsWith("es-")) return "es-es";
  if (tag === "el" || tag.startsWith("el-")) return "el-gr";
  if (tag === "ar" || tag.startsWith("ar-")) return "ar-sa";

  return "";
}

export function localeFromPath(pathname) {
  const path = typeof pathname === "string" ? pathname.trim().toLowerCase() : "";
  const first = path.split("/").filter(Boolean)[0] || "";
  if (first === "en") return "en-us";
  return SUPPORTED.has(first) ? first : "";
}

export function localeContentLanguage(locale) {
  return normalizeSupportedLocale(locale) === "zh-cn" ? "zh" : "en";
}

export function localePrefix(locale) {
  return "/" + (normalizeSupportedLocale(locale) || DEFAULT_LOCALE);
}

export function localeDirection(locale) {
  return LOCALE_META[normalizeSupportedLocale(locale) || DEFAULT_LOCALE]?.dir || "ltr";
}

export function localeFromAcceptLanguage(header, fallback = DEFAULT_LOCALE) {
  const normalizedFallback = normalizeSupportedLocale(fallback) || DEFAULT_LOCALE;
  const entries = String(header || "").split(",").map((raw, index) => {
    const parts = raw.trim().split(";").map(part => part.trim()).filter(Boolean);
    const tag = (parts.shift() || "").toLowerCase();
    let q = 1;
    for (const parameter of parts) {
      const match = parameter.match(/^q\s*=\s*(0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/i);
      if (match) { q = Number(match[1]); break; }
    }
    return { tag, q: Number.isFinite(q) ? q : 0, index };
  }).filter(entry => entry.tag && entry.q > 0)
    .sort((a, b) => (b.q - a.q) || (a.index - b.index));

  for (const entry of entries) {
    if (entry.tag === "*") return normalizedFallback;
    const supported = normalizeSupportedLocale(entry.tag);
    if (supported) return supported;
  }
  return normalizedFallback;
}

export function preferredLocaleFromRequest(request, fallback = DEFAULT_LOCALE) {
  let header = "";
  try { header = request?.headers?.get?.("Accept-Language") || ""; } catch {}
  return localeFromAcceptLanguage(header, fallback);
}

export function preferredLocaleForPath(request, pathname, fallback = DEFAULT_LOCALE) {
  return localeFromPath(pathname) || preferredLocaleFromRequest(request, fallback);
}
