/**
 * 【初学者导读】
 * 文件：studio/global-browser-security.js
 * 安全/访问门禁模块：在请求进入业务逻辑前执行浏览器、设备或边缘侧限制。
 * 阅读顺序：先找 export/主入口，再沿事件、路由或 API 调用向下；看到共享 helper 时先确认它是否被多个产品复用。
 * 数据流：输入通常来自 Request、会话或前端状态；重点跟踪校验、状态转换、存储读写以及最终 Response/DOM 输出。
 * 修改注意：这是入口/安全敏感区域，域名、重定向、会话和设备判断都应保持最小权限原则。
 * 调试方法：先锁定调用链，再打印/检查最小必要状态，不要从最终页面表现反推所有中间步骤。
 */
import { hardenBrowserMarkup } from "./browser-security.js";
import { hardenLegacyApiBrowserMarkup } from "./legacy-api-browser-security.js";
import { injectAccountMenuRuntime } from "./account-menu.js";

// 全站浏览器响应加固：对 HTML 统一施加客户端安全修补/头部策略；非 HTML、流式或二进制响应不应被错误重写。\nexport async function hardenGlobalBrowserResponse(response) {
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
