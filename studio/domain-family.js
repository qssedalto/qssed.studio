/**
 * 【初学者导读】
 * 文件：studio/domain-family.js
 * 域名/子域路由模块：决定不同 AERTEX 产品域名如何归一化、跳转和互相交接。
 * 阅读顺序：先看 export/入口函数，再看它调用的辅助函数；遇到 API 路径、存储键或域名判断时，向上追到 Worker 路由，向下追到具体数据源。
 * 数据流：建议始终回答四个问题——输入从哪里来？在哪里校验？修改了什么状态/存储？最后返回/渲染了什么？
 * 修改注意：先确认公开路由/API/数据结构的兼容性；规则改变时同步更新对应 scripts/*-check.mjs。
 * 调试方法：先使用最小请求复现，再逐步检查分支条件和中间状态，避免只根据最终 UI 猜原因。
 */
export const QSS_DOMAIN_ROOTS = Object.freeze([
  "qsseda.com",
  "qsseda.online",
  "qsseda.studio"
]);

// 根域识别：把 qsseda.com / qsseda.online / qsseda.studio 等同族域名归一化，后续服务 host 都从这个根域派生。\nexport function rootDomainForHost(hostname) {
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

// 服务 Origin 构造：从可信 root + 固定 service 名生成 https Origin；不要用它拼用户输入的任意子域。\nexport function serviceOrigin(root, service = "") {
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

export function awOriginForRequest(request) {
  const root = rootDomainForRequest(request) || "qsseda.com";
  const canonicalRoot = root === "qsseda.studio" ? "qsseda.com" : root;
  return serviceOrigin(canonicalRoot, "aw");
}

export function awdOriginForRequest(request) {
  return serviceOrigin(rootDomainForRequest(request) || "qsseda.com", "awd");
}

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

// 服务域名判断：统一识别 auth/work/aw/gpt/cash/admin 等子域，避免不同 Worker 各写一套字符串比较。\nexport function isServiceHost(hostname, service) {
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
