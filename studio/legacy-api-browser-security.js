/**
 * 【初学者导读】
 * 文件：studio/legacy-api-browser-security.js
 * 兼容层模块：保留旧 API/旧浏览器安全或 Cookie 行为，用来避免历史客户端/页面突然失效。
 * 阅读顺序：先看对外导出和路由入口，再看参数归一化、权限/语言处理，最后追踪存储或模板渲染。
 * 初学者重点：区分“数据来源”“业务规则”“展示格式”三层，不要把一个显示问题直接当成数据库问题。
 * 修改注意：此文件涉及兼容/身份/浏览器边界，改动前先确认旧调用者和安全假设。
 * 调试方法：先确认实际命中的路由和 locale，再检查 handler 输入，最后验证最终 Response。
 */
// 旧页面 API 客户端加固：把历史页面里直接访问旧 Cookie/API 的实现替换为新的受控接口，同时维持 DOM/UI 兼容。\nexport function hardenLegacyApiBrowserMarkup(markup) {
  let output = String(markup || "");
  output = hardenStorageClient(output);
  output = hardenNotesClient(output);
  output = hardenSummariesClient(output);
  output = hardenUserLinksClients(output);
  return output;
}

function hardenStorageClient(markup) {
  const start = "        async function accessToken() {";
  const end = "        function visibleFiles() {";
  let output = markup;
  if (output.includes(start) && output.includes(end)) {
    const replacement = `        async function storageRequest(path, options) {
          const headers = new Headers(options?.headers || {});
          let response;
          try {
            response = await fetch(path, { ...options, headers, credentials: "same-origin", cache: "no-store" });
          } catch {
            throw new Error(copy.unavailable);
          }
          if (response.status === 401) throw new SessionExpiredError();
          if (response.status === 403) throw new StorageForbiddenError();
          if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            const error = new Error(payload?.error || copy.unavailable);
            error.status = response.status;
            throw error;
          }
          return response;
        }

`;
    output = replaceRange(output, start, end, replacement, false);
  }
  output = output.replaceAll("if (!session?.access_token || !session?.user?.id)", "if (!session?.user?.id)");
  return output;
}

function hardenNotesClient(markup) {
  const start = "          async function token() {";
  const end = "          function setState(text, error) {";
  if (!markup.includes(start) || !markup.includes(end)) return markup;
  const replacement = `          async function api(path, options) {
            const headers = new Headers(options?.headers || {});
            if (options?.body) headers.set('Content-Type', 'application/json;charset=UTF-8');
            const response = await fetch(path, { ...options, headers, credentials: 'same-origin', cache: 'no-store' });
            if (!response.ok) {
              const payload = await response.json().catch(() => ({}));
              throw new Error(payload?.error || copy.unavailable);
            }
            return response.json();
          }

`;
  return replaceRange(markup, start, end, replacement, false);
}

function hardenSummariesClient(markup) {
  const start = "          async function token(){";
  const end = "          async function save(label){";
  if (!markup.includes(start) || !markup.includes(end)) return markup;
  const replacement = `          async function api(path,options){const headers=new Headers(options?.headers||{});if(options?.body)headers.set('Content-Type','application/json;charset=UTF-8');const response=await fetch(path,{...options,headers,credentials:'same-origin',cache:'no-store'});if(!response.ok){const payload=await response.json().catch(()=>({}));throw new Error(payload?.error||'Service unavailable');}return response.json();}
`;
  return replaceRange(markup, start, end, replacement, false);
}

function hardenUserLinksClients(markup) {
  return markup
    .replaceAll(
      "function authorization(){return session?.access_token?{'Authorization':'Bearer '+session.access_token}:{};}",
      "function authorization(){return {}; }"
    )
    .replace(
      /function authHeaders\(\)\s*\{\s*return session\?\.access_token\s*\?\s*\{\s*Authorization:\s*'Bearer '\s*\+\s*session\.access_token\s*\}\s*:\s*\{\};\s*\}/g,
      "function authHeaders() { return {}; }"
    )
    .replace(
      /fetch\((['"])\/api\/user-links([^'"]*)\1,\s*\{/g,
      "fetch($1/api/user-links$2$1, { credentials:'same-origin',"
    );
}

// 旧页面脚本定点替换器：依赖明确 marker，避免正则大范围修改未知 JavaScript。marker 丢失应由测试提醒维护者。\nfunction replaceRange(source, startMarker, endMarker, replacement, consumeEnd) {
  const start = source.indexOf(startMarker);
  if (start < 0) return source;
  const endStart = source.indexOf(endMarker, start + startMarker.length);
  if (endStart < 0) return source;
  const end = consumeEnd ? endStart + endMarker.length : endStart;
  return source.slice(0, start) + replacement + source.slice(end);
}
