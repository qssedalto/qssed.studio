import { verifyStudioPageSession, withStudioSessionCookies } from "./studio/session-gate.js";
import { handleAuthHandoff } from "./studio/auth-handoff.js";
import { gptSessionRedirect } from "./studio/gpt-subdomain.js";

const GPT_ORIGIN = "https://gpt.qsseda.studio";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = normalizePath(url.pathname);

    if (pathname === "/health") {
      return json({
        service: "qsseda-gpt",
        status: "ok",
        origin: GPT_ORIGIN
      });
    }

    if (pathname === "/robots.txt") {
      return text("User-agent: *\nDisallow: /\n", 200, "text/plain;charset=UTF-8");
    }

    if (pathname === "/auth/handoff") {
      if (request.method !== "POST") return text("Method not allowed", 405);
      const locale = preferredLocale(request) === "en" ? "en" : "zh";
      return handleAuthHandoff(request, env, locale);
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return text("Method not allowed", 405);
    }

    if (pathname === "/") {
      const locale = preferredLocale(request);
      return redirect(`${GPT_ORIGIN}/${locale}`);
    }

    if (pathname === "/zh-cn" || pathname === "/en") {
      const locale = pathname === "/en" ? "en" : "zh-cn";
      const gate = await verifyStudioPageSession(request);
      if (!gate.ok) {
        return withStudioSessionCookies(gptSessionRedirect(pathname), gate.cookies || []);
      }
      const response = withStudioSessionCookies(html(renderShell(locale)), gate.cookies || []);
      return request.method === "HEAD"
        ? new Response(null, { status: response.status, headers: response.headers })
        : response;
    }

    return text("Not found", 404);
  }
};

function renderShell(locale) {
  const zh = locale === "zh-cn";
  const copy = zh
    ? {
        lang: "zh-CN",
        badge: "AI · PREVIEW",
        title: "QssedA GPT",
        subtitle: "新的 AI 界面入口已经建立。",
        body: "这里将作为 QssedA Studio 的独立 AI 产品界面。当前先完成域名、Worker 与部署链路，后续聊天、模型选择、会话历史和工具能力都可以在这个入口继续迭代。",
        status: "gpt.qsseda.studio 已就绪",
        back: "返回 QssedA Studio"
      }
    : {
        lang: "en",
        badge: "AI · PREVIEW",
        title: "QssedA GPT",
        subtitle: "The new AI interface entry point is ready.",
        body: "This will be the standalone AI surface for QssedA Studio. The domain, Worker, and deployment path are now isolated so chat, model selection, history, and tools can evolve here independently.",
        status: "gpt.qsseda.studio is ready",
        back: "Back to QssedA Studio"
      };

  return `<!doctype html>
<html lang="${copy.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="color-scheme" content="light dark">
  <title>QssedA GPT</title>
  <style>
    :root{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#111;background:#f6f6f4}
    *{box-sizing:border-box}
    body{margin:0;min-height:100vh;background:radial-gradient(circle at 50% 0%,rgba(255,255,255,.95),rgba(246,246,244,.78) 38%,#ecece8 100%);color:#111}
    main{min-height:100vh;display:grid;place-items:center;padding:32px}
    .panel{width:min(760px,100%);padding:56px;border:1px solid rgba(17,17,17,.08);border-radius:32px;background:rgba(255,255,255,.78);backdrop-filter:blur(28px);box-shadow:0 24px 80px rgba(0,0,0,.08)}
    .badge{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;background:#111;color:#fff;font-size:12px;font-weight:700;letter-spacing:.12em}
    h1{margin:24px 0 8px;font-size:clamp(42px,8vw,76px);line-height:.95;letter-spacing:-.055em}
    h2{margin:0;font-size:clamp(20px,3vw,28px);font-weight:600;letter-spacing:-.025em}
    p{margin:24px 0 0;max-width:620px;font-size:16px;line-height:1.75;color:#555}
    .status{margin-top:32px;padding-top:24px;border-top:1px solid rgba(17,17,17,.08);display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap}
    .ready{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600}
    .dot{width:9px;height:9px;border-radius:50%;background:#20a464;box-shadow:0 0 0 5px rgba(32,164,100,.12)}
    a{color:inherit;text-decoration:none;font-size:14px;font-weight:600}
    a:hover{text-decoration:underline}
    @media (prefers-color-scheme:dark){
      :root{color:#f5f5f5;background:#111}
      body{background:radial-gradient(circle at 50% 0%,#262626 0,#171717 42%,#0d0d0d 100%);color:#f5f5f5}
      .panel{background:rgba(24,24,24,.82);border-color:rgba(255,255,255,.09);box-shadow:0 24px 90px rgba(0,0,0,.35)}
      .badge{background:#f5f5f5;color:#111}
      p{color:#aaa}
      .status{border-color:rgba(255,255,255,.09)}
    }
    @media (max-width:640px){main{padding:18px}.panel{padding:32px 26px;border-radius:26px}}
  </style>
</head>
<body>
  <main>
    <section class="panel" aria-labelledby="gpt-title">
      <span class="badge">${copy.badge}</span>
      <h1 id="gpt-title">${copy.title}</h1>
      <h2>${copy.subtitle}</h2>
      <p>${copy.body}</p>
      <div class="status">
        <span class="ready"><span class="dot" aria-hidden="true"></span>${copy.status}</span>
        <a href="https://qsseda.studio">${copy.back} →</a>
      </div>
    </section>
  </main>
</body>
</html>`;
}

function preferredLocale(request) {
  const language = (request.headers.get("Accept-Language") || "").toLowerCase();
  return language.includes("zh") ? "zh-cn" : "en";
}

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function securityHeaders(contentType) {
  return new Headers({
    "content-type": contentType,
    "cache-control": "no-store",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "strict-transport-security": "max-age=31536000; includeSubDomains",
    "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"
  });
}

function html(markup, status = 200) {
  return new Response(markup, { status, headers: securityHeaders("text/html;charset=UTF-8") });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: securityHeaders("application/json;charset=UTF-8") });
}

function text(body, status = 200, contentType = "text/plain;charset=UTF-8") {
  return new Response(body, { status, headers: securityHeaders(contentType) });
}

function redirect(location) {
  return new Response(null, {
    status: 302,
    headers: {
      location,
      "cache-control": "no-store",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff"
    }
  });
}
