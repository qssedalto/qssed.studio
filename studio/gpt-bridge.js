/**
 * 【初学者导读】
 * 文件：studio/gpt-bridge.js
 * AERTEX Intelligence 共享模块：处理模型界面、桥接、富文本渲染或子域路由。
 * 阅读顺序：先找 export/主入口，再沿事件、路由或 API 调用向下；看到共享 helper 时先确认它是否被多个产品复用。
 * 数据流：输入通常来自 Request、会话或前端状态；重点跟踪校验、状态转换、存储读写以及最终 Response/DOM 输出。
 * 修改注意：保持公开 API、DOM 标识和共享数据结构稳定；产品规则变化时同步更新自动检查。
 * 调试方法：先锁定调用链，再打印/检查最小必要状态，不要从最终页面表现反推所有中间步骤。
 */
const ROUTES = new Map([
  ["/api/gpt/status", { target: "/health", methods: ["GET"] }],
  ["/api/gpt/account", { target: "/codex/account", methods: ["GET"] }],
  ["/api/gpt/models", { target: "/codex/models", methods: ["GET"] }],
  ["/api/gpt/rate-limits", { target: "/codex/rate-limits", methods: ["GET"] }],
  ["/api/gpt/threads", { target: "/codex/threads", methods: ["GET"] }],
  ["/api/gpt/login/device", { target: "/codex/login/device", methods: ["POST"] }],
  ["/api/gpt/logout", { target: "/codex/logout", methods: ["POST"] }],
  ["/api/gpt/thread", { target: "/codex/thread", methods: ["POST"] }],
  ["/api/gpt/turn", { target: "/codex/turn", methods: ["POST"] }]
]);

// 远程 Codex 桥接入口：把经过认证的网页请求转发给受控远端/本地桥接服务。目标 URL 必须经过 normalizeBridgeUrl，不能让客户端指定任意内网地址。\nexport async function handleRemoteCodexApi(request, env) {
  const url = new URL(request.url);
  const route = ROUTES.get(url.pathname);
  if (!route || !route.methods.includes(request.method)) {
    return json({ error: "GPT bridge route not found.", code: "route_not_found" }, 404);
  }

  const bridgeUrl = normalizeBridgeUrl(env?.GPT_CODEX_BRIDGE_URL);
  const token = String(env?.GPT_CODEX_BRIDGE_TOKEN || "").trim();
  if (!bridgeUrl || !token) {
    return json({
      error: "GPT bridge is not configured.",
      code: "gpt_not_configured"
    }, 503);
  }

  const target = new URL(route.target, bridgeUrl);
  target.search = url.search;

  const headers = new Headers();
  headers.set("authorization", `Bearer ${token}`);
  headers.set("accept", request.headers.get("accept") || "application/json");
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const controller = new AbortController();
  const statusProbe = url.pathname === "/api/gpt/status";
  const timeout = setTimeout(() => controller.abort(), statusProbe ? 4500 : 120000);

  try {
    const upstream = await fetch(target.toString(), {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? null : request.body,
      redirect: "manual",
      signal: controller.signal
    });

    if (isTunnelOfflineStatus(upstream.status)) {
      return offline();
    }

    if (upstream.status === 401 || upstream.status === 403) {
      return json({
        error: "GPT bridge authentication failed.",
        code: "bridge_auth_failed"
      }, 502);
    }

    const responseHeaders = new Headers({
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    });
    const upstreamType = upstream.headers.get("content-type");
    if (upstreamType) responseHeaders.set("content-type", upstreamType);

    if (upstream.body) {
      return new Response(upstream.body, {
        status: upstream.status,
        headers: responseHeaders
      });
    }

    return new Response(null, {
      status: upstream.status,
      headers: responseHeaders
    });
  } catch (error) {
    if (error?.name === "AbortError" || error?.name === "TimeoutError") return offline();
    return offline();
  } finally {
    clearTimeout(timeout);
  }
}

// 桥接地址归一化：只接受允许的 http(s) 结构并去掉多余路径/尾斜杠；部署配置错误应被拒绝，而不是拼出不可预测的上游地址。\nfunction normalizeBridgeUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return "";
    url.pathname = "/";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

// 把常见隧道离线状态统一归类，便于 UI 区分“桥接服务没上线”和“业务请求本身失败”。\nfunction isTunnelOfflineStatus(status) {
  return [502, 503, 504, 520, 521, 522, 523, 524, 525, 526, 530].includes(status);
}

function offline() {
  return json({
    error: "GPT is offline because the local Codex host is not reachable.",
    code: "gpt_offline",
    online: false
  }, 503);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });
}
