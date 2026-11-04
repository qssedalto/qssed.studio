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

// 远程桥接先验证调用环境和允许的请求路径，再代理受控能力；不应将它变成无认证的通用 HTTP 转发器。
export async function handleRemoteCodexApi(request, env) {
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

// 桥接地址归一化要限制协议与目标，防止把可配置端点扩展成任意内网探测或敏感服务代理。
function normalizeBridgeUrl(value) {
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

function isTunnelOfflineStatus(status) {
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
