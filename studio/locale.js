// Centralized UI locale detection.
// UI language comes from explicit locale routes/query choices and the browser/device
// Accept-Language preference. Network geography must never choose interface language.

const DEFAULT_LOCALE = "en";

export function normalizeSupportedLocale(value) {
  const tag = String(value || "").trim().toLowerCase().replaceAll("_", "-");
  if (!tag) return "";
  if (tag === "en" || tag.startsWith("en-")) return "en";
  if (tag === "zh" || tag.startsWith("zh-")) return "zh-cn";
  return "";
}

export function localeFromPath(pathname) {
  const path = typeof pathname === "string" ? pathname.trim().toLowerCase() : "";
  if (path === "/en" || path.startsWith("/en/")) return "en";
  if (path === "/zh-cn" || path.startsWith("/zh-cn/")) return "zh-cn";
  return "";
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
