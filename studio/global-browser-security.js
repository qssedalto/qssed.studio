// 主站所有浏览器响应的最后一层统一硬化。
//
// Worker 路由完成后，这里补/收紧 CSP、Permissions-Policy、Referrer-Policy、X-Content-Type-Options 等，
// 让某个页面模板即使忘了部分头也不至于完全裸奔；但它不会替代页面/API 自己的鉴权和输入校验。
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
