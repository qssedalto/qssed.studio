// 初学者导读：全站语言代码、规范化、路径解析与方向性（LTR/RTL）基础模块；其他模块应复用这里，避免各自发明 locale 规则。
// 统一 UI 语言解析。
//
// 初学者要区分两个概念：
// - URL 语言（例如 /zh-cn）是用户明确选择，优先级最高；
// - Accept-Language 只在 URL 没有语言时做回退。
// Cloudflare 的国家/地区信息绝不能自动改变界面语言；Watch 的 setup 页可以用国家信息选择“下载源”，但不能因此偷偷改语言。

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

/// 把浏览器常见语言标签归一到 AERTEX 支持的 11 个 locale。
/// 例如 zh-Hant-HK -> zh-tw，en-CA -> en-us；不认识的语言返回空字符串。
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

/// 只读取路径第一段，避免把正文或资源名里的语言样式字符串误当 locale。
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

/// 按 RFC 风格的 q 权重读取 Accept-Language，并保持原始顺序作为同权重时的 tie-break。
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

/// Worker 侧默认语言入口。Watch / Cash / GPT 等独立产品都复用这里，避免各自实现不同的语言推断。
export function preferredLocaleFromRequest(request, fallback = DEFAULT_LOCALE) {
  let header = "";
  try { header = request?.headers?.get?.("Accept-Language") || ""; } catch {}
  return localeFromAcceptLanguage(header, fallback);
}

export function preferredLocaleForPath(request, pathname, fallback = DEFAULT_LOCALE) {
  return localeFromPath(pathname) || preferredLocaleFromRequest(request, fallback);
}
