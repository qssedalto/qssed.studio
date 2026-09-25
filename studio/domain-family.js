export const QSS_DOMAIN_ROOTS = Object.freeze([
  "qsseda.com",
  "qsseda.online",
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

export function gptOriginForRequest(request) {
  return serviceOrigin(rootDomainForRequest(request) || "qsseda.com", "gpt");
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
