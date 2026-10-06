// 初学者导读：向多个 SSR 页面统一注入浏览器安全策略；用于减少 CSP/安全头在不同页面之间漂移。
import { hardenBrowserMarkup } from "./browser-security.js";
import { hardenLegacyApiBrowserMarkup } from "./legacy-api-browser-security.js";
import { injectAccountMenuRuntime } from "./account-menu.js";

export async function hardenGlobalBrowserResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const source = await response.text();
  const hardened = injectAccountMenuRuntime(hardenLegacyApiBrowserMarkup(hardenBrowserMarkup(source)));
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(hardened, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
