const DETECTION_RE = /(HarmonyOS|OpenHarmony|HuaweiBrowser|HUAWEI)/i;

export function huaweiHarmonyGate(request) {
  if (!isHuaweiOrHarmonyRequest(request)) return null;
  return renderHuaweiUnsupportedPage(request);
}

export function isHuaweiOrHarmonyRequest(request) {
  const headers = request?.headers;
  if (!headers) return false;

  const fingerprint = [
    headers.get("user-agent") || "",
    headers.get("sec-ch-ua") || "",
    headers.get("sec-ch-ua-platform") || "",
    headers.get("sec-ch-ua-model") || ""
  ].join(" ");

  return DETECTION_RE.test(fingerprint);
}

function renderHuaweiUnsupportedPage(request) {
  const markup = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<title>暂未适配华为设备</title>
<style>
  :root{
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",Arial,sans-serif;
    color-scheme:light dark;
    --page-bg:#f7f9fc;
    --surface:#ffffff;
    --text:#111827;
    --muted:#4b5563;
    --card-border:#dfe4ea;
    --card-top:#fbfcfd;
    --card-bottom:#f6f8fa;
  }
  *{box-sizing:border-box}
  html,body{margin:0;min-height:100%;background:var(--page-bg);color:var(--text)}
  body{display:flex;justify-content:center}
  main{width:min(100%,760px);min-height:100vh;padding:clamp(40px,8vw,84px) clamp(24px,7vw,56px) 64px;background:var(--surface)}
  h1{margin:0 0 38px;font-size:clamp(34px,7vw,54px);line-height:1.18;letter-spacing:-.03em;font-weight:800}
  .lead{margin:0 0 58px;font-size:clamp(21px,4.4vw,31px);line-height:1.85;color:var(--muted)}
  .notice{margin:0 0 52px;font-size:clamp(22px,4.5vw,32px);line-height:1.8;font-weight:800;color:var(--text)}
  .card{border:1px solid var(--card-border);border-radius:34px;padding:clamp(30px,6vw,48px);background:linear-gradient(180deg,var(--card-top) 0%,var(--card-bottom) 100%)}
  .card h2{margin:0 0 34px;font-size:clamp(27px,5vw,38px);line-height:1.35}
  .card p{margin:0 0 34px;font-size:clamp(19px,4vw,28px);line-height:1.9;color:var(--muted)}
  .card p:last-child{margin-bottom:0}
  @media (prefers-color-scheme:dark){
    :root{
      --page-bg:#090d12;
      --surface:#0d1218;
      --text:#f3f6fa;
      --muted:#b3bdc9;
      --card-border:#303943;
      --card-top:#151b22;
      --card-bottom:#11171e;
    }
  }
</style>
</head>
<body>
<main>
  <h1>检测到您使用华为手机</h1>
  <p class="lead">本站目前暂未适配华为手机、鸿蒙系统及相关运行环境。</p>
  <p class="notice">需要明确说明：本站没有适配华为设备的义务。</p>
  <section class="card" aria-labelledby="why">
    <h2 id="why">关于“为什么不适配”</h2>
    <p>是否兼容某一品牌、系统或设备，属于本站自行决定的技术范围。用户选择什么手机，是用户的自由；本站选择支持什么设备，同样属于本站自身的产品决策。</p>
    <p>华为设备并不会因为其品牌、用户规模或市场地位，自动获得本站的适配资格。本站也不存在必须为所有品牌、所有系统、所有终端环境逐一完成兼容工作的责任。</p>
  </section>
</main>
</body>
</html>`;

  const headers = new Headers({
    "content-type": "text/html;charset=UTF-8",
    "cache-control": "no-store, no-cache, must-revalidate",
    "pragma": "no-cache",
    "expires": "0",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"
  });

  if (request?.method === "HEAD") return new Response(null, { status: 200, headers });
  return new Response(markup, { status: 200, headers });
}
