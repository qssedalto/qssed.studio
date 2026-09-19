const CODEX_BRIDGE = "http://127.0.0.1:32146";

export function renderGptApp(locale) {
  const zh = locale === "zh-cn";
  const t = zh ? {
    title: "QssedA GPT",
    subtitle: "Codex 订阅聊天",
    disconnected: "未连接本机 Codex Bridge",
    connectHint: "在这台电脑上运行 QssedA Codex Bridge，然后使用你的 ChatGPT 账号连接 Codex。",
    retry: "重新检测",
    connect: "连接 ChatGPT / Codex",
    connecting: "正在连接…",
    openLogin: "打开 OpenAI 登录页",
    codeLabel: "设备代码",
    codeHint: "打开登录页并输入上面的代码。完成后这里会自动识别登录状态。",
    account: "账户",
    plan: "套餐",
    models: "模型",
    usage: "额度",
    newChat: "新对话",
    send: "发送",
    placeholder: "给 Codex 发消息…",
    bridgeOffline: "Codex Bridge 离线",
    codexMissing: "未检测到 Codex CLI。请先安装 OpenAI Codex CLI。",
    signedOut: "尚未登录 ChatGPT / Codex",
    signedIn: "已连接",
    loadingModels: "正在读取模型…",
    thinking: "Codex 正在思考…",
    error: "发生错误",
    noModels: "没有读取到可用模型",
    effort: "推理",
    empty: "开始一个新的对话",
    emptyHint: "消息会通过你电脑上的 Codex App Server 发送，并使用已登录 ChatGPT 账户的 Codex 权益。",
    localOnly: "本机桥接",
    privacy: "ChatGPT 登录令牌保存在你电脑上的独立 Codex Home 中，不会发送给 QssedA Cloudflare Worker。",
    logout: "退出 Codex"
  } : {
    title: "QssedA GPT",
    subtitle: "Codex subscription chat",
    disconnected: "Local Codex Bridge is not connected",
    connectHint: "Run QssedA Codex Bridge on this computer, then connect your ChatGPT account to Codex.",
    retry: "Check again",
    connect: "Connect ChatGPT / Codex",
    connecting: "Connecting…",
    openLogin: "Open OpenAI sign-in",
    codeLabel: "Device code",
    codeHint: "Open the sign-in page and enter the code above. This page will detect completion automatically.",
    account: "Account",
    plan: "Plan",
    models: "Model",
    usage: "Limits",
    newChat: "New chat",
    send: "Send",
    placeholder: "Message Codex…",
    bridgeOffline: "Codex Bridge offline",
    codexMissing: "Codex CLI was not found. Install the OpenAI Codex CLI first.",
    signedOut: "Not signed in to ChatGPT / Codex",
    signedIn: "Connected",
    loadingModels: "Loading models…",
    thinking: "Codex is thinking…",
    error: "Error",
    noModels: "No available models were returned",
    effort: "Reasoning",
    empty: "Start a new conversation",
    emptyHint: "Messages are sent through Codex App Server on your computer and use the Codex allowance of the signed-in ChatGPT account.",
    localOnly: "Local bridge",
    privacy: "Your ChatGPT login tokens stay inside a dedicated Codex Home on this computer and are not sent to the QssedA Cloudflare Worker.",
    logout: "Sign out of Codex"
  };

  return `<!doctype html>
<html lang="${zh ? "zh-CN" : "en"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="color-scheme" content="light dark">
  <title>QssedA GPT</title>
  <style>
    :root{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;--bg:#f7f7f5;--panel:#fff;--panel2:#f1f1ef;--text:#171717;--muted:#777;--line:rgba(0,0,0,.09);--accent:#111;--accentText:#fff;--danger:#b42318;--success:#18864b}
    @media(prefers-color-scheme:dark){:root{--bg:#101010;--panel:#181818;--panel2:#202020;--text:#f4f4f4;--muted:#9b9b9b;--line:rgba(255,255,255,.09);--accent:#f3f3f3;--accentText:#111;--danger:#ff766d;--success:#52c986}}
    *{box-sizing:border-box}
    body{margin:0;background:var(--bg);color:var(--text);min-height:100vh}
    button,select,textarea{font:inherit}
    .app{min-height:100vh;display:grid;grid-template-columns:270px minmax(0,1fr)}
    .sidebar{border-right:1px solid var(--line);padding:18px;display:flex;flex-direction:column;gap:14px;background:var(--panel2)}
    .brand{font-weight:750;letter-spacing:-.03em;font-size:20px;padding:8px 6px}
    .brand small{display:block;color:var(--muted);font-size:12px;font-weight:500;letter-spacing:0;margin-top:4px}
    .sideButton{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:12px;padding:10px 12px;text-align:left;cursor:pointer}
    .sideButton:hover{filter:brightness(.98)}
    .privacy{margin-top:auto;color:var(--muted);font-size:11px;line-height:1.5;padding:6px}
    .main{min-width:0;display:flex;flex-direction:column;height:100vh}
    .topbar{height:62px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:10px;padding:0 18px;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(18px)}
    .model{min-width:180px;max-width:330px;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:10px;padding:8px 10px}
    .effort{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:10px;padding:8px 10px}
    .account{margin-left:auto;color:var(--muted);font-size:13px;white-space:nowrap}
    .content{flex:1;min-height:0;overflow:auto}
    .messages{width:min(820px,calc(100% - 32px));margin:0 auto;padding:42px 0 160px}
    .empty{min-height:58vh;display:grid;place-items:center;text-align:center}
    .empty h1{font-size:30px;letter-spacing:-.04em;margin:0 0 8px}
    .empty p{max-width:580px;margin:0;color:var(--muted);line-height:1.7}
    .msg{margin:0 0 28px}
    .msg.user{display:flex;justify-content:flex-end}
    .msg.user .bubble{max-width:78%;padding:11px 15px;background:var(--panel2);border-radius:18px;white-space:pre-wrap;line-height:1.55}
    .msg.assistant .bubble{white-space:pre-wrap;line-height:1.72}
    .status{color:var(--muted);font-size:13px;margin-top:8px}
    .composerWrap{position:fixed;left:270px;right:0;bottom:0;padding:18px;background:linear-gradient(to top,var(--bg) 72%,transparent)}
    .composer{width:min(820px,calc(100% - 32px));margin:0 auto;border:1px solid var(--line);background:var(--panel);border-radius:20px;padding:12px;box-shadow:0 12px 42px rgba(0,0,0,.08)}
    textarea{display:block;width:100%;min-height:48px;max-height:180px;resize:none;border:0;outline:0;background:transparent;color:var(--text);padding:4px 6px;line-height:1.5}
    .composerFoot{display:flex;align-items:center;justify-content:flex-end;margin-top:8px}
    .primary{border:0;background:var(--accent);color:var(--accentText);border-radius:11px;padding:8px 14px;cursor:pointer;font-weight:650}
    .primary:disabled{opacity:.45;cursor:not-allowed}
    .gate{width:min(650px,calc(100% - 36px));margin:80px auto;padding:28px;border:1px solid var(--line);background:var(--panel);border-radius:22px}
    .gate h2{margin:0 0 8px;font-size:23px}.gate p{color:var(--muted);line-height:1.6}
    .gateActions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
    .code{font:700 28px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;margin:18px 0 8px}
    .hidden{display:none!important}
    .error{color:var(--danger)}
    .good{color:var(--success)}
    @media(max-width:760px){
      .app{grid-template-columns:1fr}
      .sidebar{display:none}
      .composerWrap{left:0}
      .topbar{padding:0 10px}
      .model{min-width:0;flex:1}
      .account{display:none}
      .messages{padding-top:28px}
    }
  </style>
</head>
<body>
<div class="app">
  <aside class="sidebar">
    <div class="brand">${t.title}<small>${t.subtitle}</small></div>
    <button class="sideButton" id="newChat">${t.newChat}</button>
    <div id="sideStatus" class="status">${t.disconnected}</div>
    <div class="privacy"><strong>${t.localOnly}</strong><br>${t.privacy}</div>
  </aside>

  <main class="main">
    <header class="topbar">
      <select class="model" id="modelSelect"><option>${t.loadingModels}</option></select>
      <select class="effort" id="effortSelect" aria-label="${t.effort}">
        <option value="low">Low</option>
        <option value="medium" selected>Medium</option>
        <option value="high">High</option>
        <option value="xhigh">Extra High</option>
      </select>
      <div class="account" id="accountLabel">${t.disconnected}</div>
    </header>

    <section class="content" id="content">
      <div class="gate" id="bridgeGate">
        <h2>${t.disconnected}</h2>
        <p>${t.connectHint}</p>
        <div id="bridgeDetail" class="status"></div>
        <div class="gateActions"><button class="primary" id="retryBridge">${t.retry}</button></div>
      </div>

      <div class="gate hidden" id="loginGate">
        <h2>${t.signedOut}</h2>
        <p>${t.connectHint}</p>
        <div class="gateActions"><button class="primary" id="startLogin">${t.connect}</button></div>
        <div id="devicePanel" class="hidden">
          <div class="code" id="deviceCode"></div>
          <div class="status">${t.codeLabel}</div>
          <div class="gateActions"><a class="primary" id="deviceLink" target="_blank" rel="noopener noreferrer">${t.openLogin}</a></div>
          <p>${t.codeHint}</p>
        </div>
      </div>

      <div class="messages hidden" id="messages">
        <div class="empty" id="emptyState"><div><h1>${t.empty}</h1><p>${t.emptyHint}</p></div></div>
      </div>
    </section>

    <div class="composerWrap hidden" id="composerWrap">
      <div class="composer">
        <textarea id="composer" placeholder="${t.placeholder}" rows="1"></textarea>
        <div class="composerFoot"><button class="primary" id="sendButton">${t.send}</button></div>
      </div>
    </div>
  </main>
</div>

<script>
(() => {
  const BRIDGE = ${JSON.stringify(CODEX_BRIDGE)};
  const text = ${JSON.stringify(t)};
  const $ = id => document.getElementById(id);
  const state = { bridge:false, account:null, models:[], threadId:"", busy:false, loginTimer:null };

  async function request(path, options={}) {
    const response = await fetch(BRIDGE + path, {
      ...options,
      cache:"no-store",
      credentials:"omit",
      targetAddressSpace:"loopback",
      headers:{Accept:"application/json", ...(options.headers||{})}
    });
    const type = response.headers.get("content-type") || "";
    const data = type.includes("application/json") ? await response.json() : null;
    if (!response.ok) throw new Error(data?.error || ("HTTP " + response.status));
    return data;
  }

  async function probe() {
    $("bridgeDetail").textContent = "";
    try {
      const health = await request("/health");
      state.bridge = health?.service === "qsseda-codex-bridge";
      if (!state.bridge) throw new Error("Unexpected local service");
      if (!health?.codex?.available) {
        $("bridgeDetail").textContent = text.codexMissing;
        $("bridgeDetail").className = "status error";
        setBridgeOffline();
        return;
      }
      $("sideStatus").textContent = "Codex " + (health.codex.version || "");
      await refreshAccount();
    } catch (error) {
      $("bridgeDetail").textContent = error?.message || text.bridgeOffline;
      $("bridgeDetail").className = "status error";
      setBridgeOffline();
    }
  }

  function setBridgeOffline() {
    $("bridgeGate").classList.remove("hidden");
    $("loginGate").classList.add("hidden");
    $("messages").classList.add("hidden");
    $("composerWrap").classList.add("hidden");
    $("accountLabel").textContent = text.bridgeOffline;
  }

  async function refreshAccount() {
    try {
      const data = await request("/codex/account");
      state.account = data?.account || null;
      if (!state.account) {
        $("bridgeGate").classList.add("hidden");
        $("loginGate").classList.remove("hidden");
        $("messages").classList.add("hidden");
        $("composerWrap").classList.add("hidden");
        $("accountLabel").textContent = text.signedOut;
        return false;
      }
      $("bridgeGate").classList.add("hidden");
      $("loginGate").classList.add("hidden");
      $("messages").classList.remove("hidden");
      $("composerWrap").classList.remove("hidden");
      const plan = state.account.planType ? " · " + state.account.planType : "";
      $("accountLabel").textContent = (state.account.email || text.signedIn) + plan;
      $("sideStatus").textContent = text.signedIn + plan;
      await loadModels();
      return true;
    } catch {
      setBridgeOffline();
      return false;
    }
  }

  async function loadModels() {
    try {
      const result = await request("/codex/models");
      state.models = Array.isArray(result?.data) ? result.data : [];
      const select = $("modelSelect");
      select.textContent = "";
      if (!state.models.length) {
        const option = document.createElement("option");
        option.textContent = text.noModels;
        option.value = "";
        select.appendChild(option);
        return;
      }
      for (const model of state.models) {
        const option = document.createElement("option");
        option.value = model.model || model.id;
        option.textContent = model.displayName || model.model || model.id;
        if (model.isDefault) option.selected = true;
        select.appendChild(option);
      }
      syncEfforts();
    } catch (error) {
      $("modelSelect").innerHTML = "";
      const option = document.createElement("option");
      option.textContent = error?.message || text.noModels;
      $("modelSelect").appendChild(option);
    }
  }

  function syncEfforts() {
    const model = state.models.find(item => (item.model || item.id) === $("modelSelect").value);
    const supported = Array.isArray(model?.supportedReasoningEfforts) ? model.supportedReasoningEfforts.map(x => x.reasoningEffort) : [];
    if (!supported.length) return;
    for (const option of $("effortSelect").options) option.disabled = !supported.includes(option.value);
    if (!supported.includes($("effortSelect").value)) $("effortSelect").value = model.defaultReasoningEffort || supported[0];
  }

  async function startLogin() {
    $("startLogin").disabled = true;
    $("startLogin").textContent = text.connecting;
    try {
      const data = await request("/codex/login/device", {method:"POST", headers:{"Content-Type":"application/json"}, body:"{}"});
      if (!data?.verificationUrl || !data?.userCode) throw new Error("Device login was not returned by Codex");
      $("deviceCode").textContent = data.userCode;
      $("deviceLink").href = data.verificationUrl;
      $("devicePanel").classList.remove("hidden");
      clearInterval(state.loginTimer);
      state.loginTimer = setInterval(async () => {
        if (await refreshAccount()) {
          clearInterval(state.loginTimer);
          state.loginTimer = null;
        }
      }, 1800);
    } catch (error) {
      $("devicePanel").classList.remove("hidden");
      $("deviceCode").textContent = error?.message || text.error;
      $("deviceCode").classList.add("error");
    } finally {
      $("startLogin").disabled = false;
      $("startLogin").textContent = text.connect;
    }
  }

  function appendMessage(role, content) {
    $("emptyState").classList.add("hidden");
    const root = document.createElement("div");
    root.className = "msg " + role;
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = content;
    root.appendChild(bubble);
    $("messages").appendChild(root);
    $("content").scrollTop = $("content").scrollHeight;
    return bubble;
  }

  async function ensureThread() {
    if (state.threadId) return state.threadId;
    const result = await request("/codex/thread", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:$("modelSelect").value})
    });
    state.threadId = result?.thread?.id || "";
    if (!state.threadId) throw new Error("Codex did not return a thread ID");
    return state.threadId;
  }

  async function send() {
    const message = $("composer").value.trim();
    if (!message || state.busy) return;
    state.busy = true;
    $("sendButton").disabled = true;
    $("composer").value = "";
    appendMessage("user", message);
    const assistant = appendMessage("assistant", "");
    const status = document.createElement("div");
    status.className = "status";
    status.textContent = text.thinking;
    assistant.parentElement.appendChild(status);

    try {
      const threadId = await ensureThread();
      const response = await fetch(BRIDGE + "/codex/turn", {
        method:"POST",
        cache:"no-store",
        credentials:"omit",
        targetAddressSpace:"loopback",
        headers:{"Content-Type":"application/json",Accept:"text/event-stream"},
        body:JSON.stringify({
          threadId,
          message,
          model:$("modelSelect").value,
          effort:$("effortSelect").value
        })
      });
      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || ("HTTP " + response.status));
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamed = "";
      while (true) {
        const {value, done} = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, {stream:true});
        let boundary;
        while ((boundary = buffer.indexOf("\n\n")) >= 0) {
          const block = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          let event = "message";
          let payload = null;
          for (const line of block.split("\n")) {
            if (line.startsWith("event:")) event = line.slice(6).trim();
            if (line.startsWith("data:")) {
              try { payload = JSON.parse(line.slice(5).trim()); } catch {}
            }
          }
          if (event === "delta" && payload?.delta) {
            streamed += payload.delta;
            assistant.textContent = streamed;
            $("content").scrollTop = $("content").scrollHeight;
          } else if (event === "message" && payload?.text && !streamed) {
            assistant.textContent = payload.text;
          } else if (event === "error") {
            throw new Error(payload?.error || text.error);
          } else if (event === "done") {
            status.textContent = payload?.status || "";
          }
        }
      }
      if (!assistant.textContent) assistant.textContent = "—";
      if (status.textContent === text.thinking) status.textContent = "";
    } catch (error) {
      assistant.textContent = error?.message || text.error;
      assistant.classList.add("error");
      status.textContent = "";
    } finally {
      state.busy = false;
      $("sendButton").disabled = false;
      $("composer").focus();
    }
  }

  $("retryBridge").addEventListener("click", probe);
  $("startLogin").addEventListener("click", startLogin);
  $("newChat").addEventListener("click", () => {
    state.threadId = "";
    $("messages").querySelectorAll(".msg").forEach(node => node.remove());
    $("emptyState").classList.remove("hidden");
  });
  $("modelSelect").addEventListener("change", syncEfforts);
  $("sendButton").addEventListener("click", send);
  $("composer").addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  });
  $("composer").addEventListener("input", event => {
    event.currentTarget.style.height = "auto";
    event.currentTarget.style.height = Math.min(event.currentTarget.scrollHeight, 180) + "px";
  });

  void probe();
})();
</script>
</body>
</html>`;
}
