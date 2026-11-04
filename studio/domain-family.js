// 统一域名族映射：所有产品都通过这里从当前请求推导“同一根域下”的服务地址。
//
// Watch 有一个特殊历史约束：UI 主域是 aw.*，数据面同时保留 awd.*（短域名）和
// aw.data.*（语义别名）。旧 qsseda.studio 的 Watch UI 不再作为正式入口，因此
// awOriginForRequest() 会把 studio 根规范化到 qsseda.com；数据域别名仍按请求根推导。
export const QSS_DOMAIN_ROOTS = Object.freeze([
  "qsseda.com",
  "qsseda.studio"
]);

export function rootDomainForHost(hostname) {
  const host = String(hostname || "").trim().toLowerCase().replace(/\.$/, "");
  for (const root of QSS_DOMAIN_ROOTS) {
    if (host === root || host.endsWith(`.${root}`)) return root;
  }
  return "";
}

export function rootDomainForRequest(request) {
  try { return rootDomainForHost(new URL(request.url).hostname); }
  catch { return ""; }
}

export function serviceHost(root, service = "") {
  const normalizedRoot = QSS_DOMAIN_ROOTS.includes(root) ? root : "qsseda.com";
  const label = String(service || "").trim().toLowerCase();
  return label ? `${label}.${normalizedRoot}` : normalizedRoot;
}

export function serviceOrigin(root, service = "") {
  return `https://${serviceHost(root, service)}`;
}

export function mainOriginForRequest(request) {
  return serviceOrigin(rootDomainForRequest(request) || "qsseda.com");
}

export function authOriginForRequest(request) {
  return serviceOrigin(rootDomainForRequest(request) || "qsseda.com", "auth");
}

export function workOriginForRequest(request) {
  return serviceOrigin(rootDomainForRequest(request) || "qsseda.com", "work");
}

/// AERTEX Watch 的浏览器 UI 入口。
/// qsseda.studio 仅保留兼容/历史用途，正式 Watch UI 统一规范到 qsseda.com。
export function awOriginForRequest(request) {
  const root = rootDomainForRequest(request) || "qsseda.com";
  const canonicalRoot = root === "qsseda.studio" ? "qsseda.com" : root;
  return serviceOrigin(canonicalRoot, "aw");
}

/// AERTEX Watch 数据面的短域名，主要给同步客户端和 API 使用。
export function awdOriginForRequest(request) {
  return serviceOrigin(rootDomainForRequest(request) || "qsseda.com", "awd");
}

/// 与 awd.* 指向同一数据面，但名称更直观，便于文档和诊断时理解其用途。
export function awDataOriginForRequest(request) {
  return serviceOrigin(rootDomainForRequest(request) || "qsseda.com", "aw.data");
}

export function gptOriginForRequest(request) {
  return serviceOrigin(rootDomainForRequest(request) || "qsseda.com", "gpt");
}

export function cashOriginForRequest(request) {
  return serviceOrigin(rootDomainForRequest(request) || "qsseda.com", "cash");
}

export function adminOriginForRequest(request) {
  return serviceOrigin(rootDomainForRequest(request) || "qsseda.com", "admin");
}

export function isServiceHost(hostname, service) {
  const root = rootDomainForHost(hostname);
  return Boolean(root) && String(hostname || "").toLowerCase() === serviceHost(root, service);
}

export function isMainHost(hostname) {
  const root = rootDomainForHost(hostname);
  return Boolean(root) && String(hostname || "").toLowerCase() === root;
}

export function authOrigins() {
  return QSS_DOMAIN_ROOTS.map(root => serviceOrigin(root, "auth"));
}

export function isAuthOrigin(value) {
  try { return authOrigins().includes(new URL(value).origin); }
  catch { return false; }
}
