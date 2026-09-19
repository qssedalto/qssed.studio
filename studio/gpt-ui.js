export function renderGptApp(locale) {
  const zh = locale === "zh-cn";
  const t = zh ? {
    title: "QssedA GPT",
    subtitle: "Cloud Codex",
    cloud: "云端 Codex",
    connecting: "正在连接…",
    connected: "已连接",
    signedOut: "尚未连接 ChatGPT / Codex",
    connectHint: "只需要绑定一次 ChatGPT 账号。绑定完成后，你可以在手机、平板或任意电脑上直接使用这个页面。",
    connect: "连接 ChatGPT / Codex",
    openLogin: "打开 OpenAI 登录页",
    codeLabel: "设备代码",
    codeHint: "在 OpenAI 页面输入设备代码完成授权。授权后这里会自动继续。",
    newChat: "新对话",
    send: "发送",
    placeholder: "给 Codex 发消息…",
    loadingModels: "正在读取模型…",
    noModels: "没有读取到可用模型",
    reasoning: "推理",
    thinking: "Codex 正在思考…",
    empty: "开始一个新的对话",
    emptyHint: "消息由 QssedA 云端 Codex Server 处理，使用后台已绑定 ChatGPT 账号的 Codex 权益。",
    account: "账户",
    plan: "套餐",
    logout: "退出 Codex",
    providerMismatch: "这个 Cloud Codex 已绑定到另一个 QssedA 账户。",
    providerUnbound: "Cloud Codex 尚未绑定。",
    error: "发生错误",
    privateNote: "ChatGPT 登录状态只保存在后台，不会写入网页代码，也不会发送到你的设备。",
    retry: "重新检测"
  } : {
    title: "QssedA GPT",
    subtitle: "Cloud Codex",
    cloud: "Cloud Codex",
    connecting: "Connecting…",
    connected: "Connected",
    signedOut: "ChatGPT / Codex is not connected",
    connectHint: "Connect a ChatGPT account once. After that, this page works from your phone, tablet, or any computer.",
    connect: "Connect ChatGPT / Codex",
    openLogin: "Open OpenAI sign-in",
    codeLabel: "Device code",
    codeHint: "Enter this device code on the OpenAI page. This page will continue automatically after authorization.",
    newChat: "New chat",
    send: "Send",
    placeholder: "Message Codex…",
    loadingModels: "Loading models…",
    noModels: "No available models were returned",
    reasoning: "Reasoning",
    thinking: "Codex is thinking…",
    empty: "Start a new conversation",
    emptyHint: "Messages are handled by QssedA Cloud Codex using the Codex allowance of the ChatGPT account connected on the backend.",
    account: "Account",
    plan: "Plan",
    logout: "Sign out of Codex",
    providerMismatch: "This Cloud Codex is bound to another QssedA account.",
    providerUnbound: "Cloud Codex is not bound yet.",
    error: "Error",
    privateNote: "ChatGPT login state stays on the backend. It is not embedded in page code or sent to your device.",
    retry: "Check again"
  };

  return `<!doctype html>
<html lang="${zh ? "zh-CN" : "en"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="color-scheme" content="light dark">
  <title>QssedA GPT</title>
  <style>
    :root{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;--bg:#f7f7f5;--panel:#fff;--panel2:#f0f0ee;--text:#171717;--muted:#777;--line:rgba(0,0,0,.09);--accent:#111;--accentText:#fff;--danger:#b42318;--success:#18864b}
    @media(prefers-color-scheme:dark){:root{--bg:#101010;--panel:#181818;--panel2:#202020;--text:#f4f4f4;--muted:#9b9b9b;--line:rgba(255,255,255,.09);--accent:#f4f4f4;--accentText:#111;--danger:#ff766d;--success:#52c986}}
    *{box-sizing:border-box}
    html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text)}
    button,select,textarea{font:inherit}
    .app{min-height:100vh;display:grid;grid-template-columns:270px minmax(0,1fr)}
    .sidebar{border-right:1px solid var(--line);padding:18px;background:var(--panel2);display:flex;flex-direction:column;gap:14px}
    .brand{font-weight:760;letter-spacing:-.03em;font-size:20px;padding:8px 6px}
    .brand small{display:block;color:var(--muted);font-size:12px;font-weight:500;letter-spacing:0;margin-top:4px}
    .sideButton,.quietButton{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:12px;padding:10px 12px;cursor:pointer}
    .sideButton{text-align:left}
    .quietButton{font-size:12px}
    .meta{margin-top:auto;color:var(--muted);font-size:11px;line-height:1.55;padding:6px}
    .main{min-width:0;height:100vh;display:flex;flex-direction:column}
    .topbar{height:62px;display:flex;align-items:center;gap:10px;padding:0 18px;border-bottom:1px solid var(--line);background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(18px)}
    select{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:10px;padding:8px 10px}
    .model{min-width:190px;max-width:340px}
    .account{margin-left:auto;color:var(--muted);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:360px}
    .content{flex:1;min-height:0;overflow:auto}
    .messages{width:min(820px,calc(100% - 32px));margin:0 auto;padding:42px 0 160px}
    .empty{min-height:58vh;display:grid;place-items:center;text-align:center}
    .empty h1{font-size:30px;letter-spacing:-.04em;margin:0 0 8px}
    .empty p{max-width:600px;margin:0;color:var(--muted);line-height:1.7}
    .msg{margin:0 0 28px}
    .msg.user{display:flex;justify-content:flex-end}
    .msg.user .bubble{max-width:78%;padding:11px 15px;background:var(--panel2);border-radius:18px;white-space:pre-wrap;line-height:1.55}
    .msg.assistant .bubble{white-space:pre-wrap;line-height:1.72}
    .status{color:var(--muted);font-size:13px;margin-top:8px}
    .composerWrap{position:fixed;left:270px;right:0;bottom:0;padding:18px;background:linear-gradient(to top,var(--bg) 72%,transparent)}
    .composer{width:min(820px,calc(100% - 32px));margin:0 auto;border:1px solid var(--line);background:var(--panel);border-radius:20px;padding:12px;box-shadow:0 12px 42px rgba(0,0,0,.08)}
    textarea{display:block;width:100%;min-height:48px;max-height:180px;resize:none;border:0;outline:0;background:transparent;color:var(--text);padding:4px 6px;line-height:1.5}
    .composerFoot{display:flex;align-items:center;justify-content:flex-end;margin-top:8px}
    .primary{border:0;background:var(--accent);color:var(--accentText);border-radius:11px;padding:8px 14px;cursor:pointer;font-weight:650;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}
    .primary:disabled{opacity:.45;cursor:not-allowed}
    .gate{width:min(650px,calc(100% - 36px));margin:80px auto;padding:28px;border:1px solid var(--line);background:var(--panel);border-radius:22px}
    .gate h2{margin:0 0 8px;font-size:23px}.gate p{color:var(--muted);line-height:1.65}
    .gateActions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
    .code{font:700 28px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;margin:18px 0 8px}
    .hidden{display:none!important}.error{color:var(--danger)}.good{color:var(--success)}
    @media(max-width:760px){
      .app{grid-template-columns:1fr}.sidebar{display:none}.composerWrap{left:0}.topbar{padding:0 10px}.model{min-width:0;flex:1}.account{display:none}.messages{padding-top:28px}
    }
  </style>
</head>
<body>
<div class="app">
  <aside class="sidebar">
    <div class="brand">${t.title}<small>${t.subtitle}</small></div>
    <button class="sideButton" id="newChat">${t.newChat}</button>
    <div id="sideStatus" class="status">${t.connecting}</div>
    <div class="meta"><strong>${t.cloud}</strong><br>${t.privateNote}</div>
  </aside>

  <main class="main">
    <header class="topbar">
      <select class="model" id="modelSelect"><option>${t.loadingModels}</option></select>
      <select id="effortSelect" aria-label="${t.reasoning}">
        <option value="low">Low</option>
        <option value="medium" selected>Medium</option>
        <option value="high">High</option>
        <option value="xhigh">Extra High</option>
      </select>
      <div class="account" id="accountLabel">${t.connecting}</div>
    </header>

    <section class="content" id="content">
      <div class="gate" id="loginGate">
        <h2 id="gateTitle">${t.connecting}</h2>
        <p id="gateText">${t.connectHint}</p>
        <div class="gateActions">
          <button class="primary" id="startLogin">${t.connect}</button>
          <button class="quietButton" id="retry">${t.retry}</button>
        </div>
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
  const text = ${JSON.stringify(t)};
  const $ = id => document.getElementById(id);
  const state = { account:null, models:[], threadId:"", busy:false, loginTimer:null };

  async function api(path, options={}) {
    const response = await fetch("/api/gpt" + path, {
      ...options,
      cache:"no-store",
      credentials:"same-origin",
      headers:{Accept:"application/json", ...(options.headers||{})}
    });
    const type = response.headers.get("content-type") || "";
    const data = type.includes("application/json") ? await response.json() : null;
    if (response.status === 401) {
      location.reload();
      throw new Error("Authentication required");
    }
    if (!response.ok) {
      const error = new Error(data?.error || ("HTTP " + response.status));
      error.code = data?.code || "";
      throw error;
    }
    return data;
  }

  async function refreshAccount() {
    try {
      const result = await api("/account");
      state.account = result?.account || null;
      if (!state.account) {
        showLogin(text.signedOut, text.connectHint);
        return false;
      }
      showChat();
      const plan = state.account.planType ? " · " + state.account.planType : "";
      $("accountLabel").textContent = (state.account.email || text.connected) + plan;
      $("sideStatus").textContent = text.connected + plan;
      await loadModels();
      return true;
    } catch (error) {
      if (error?.code === "provider_owner_mismatch") {
        showLogin(text.providerMismatch, error.message, true);
      } else {
        showLogin(text.error, error?.message || text.error);
      }
      return false;
    }
  }

  function showLogin(title, message, disableConnect=false) {
    $("loginGate").classList.remove("hidden");
    $("messages").classList.add("hidden");
    $("composerWrap").classList.add("hidden");
    $("gateTitle").textContent = title;
    $("gateText").textContent = message;
    $("startLogin").disabled = disableConnect;
    $("accountLabel").textContent = title;
    $("sideStatus").textContent = title;
  }

  function showChat() {
    $("loginGate").classList.add("hidden");
    $("messages").classList.remove("hidden");
    $("composerWrap").classList.remove("hidden");
  }

  async function loadModels() {
    const select = $("modelSelect");
    try {
      const result = await api("/models");
      state.models = Array.isArray(result?.data) ? result.data : [];
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
      select.textContent = "";
      const option = document.createElement("option");
      option.textContent = error?.message || text.noModels;
      select.appendChild(option);
    }
  }

  function syncEfforts() {
    const model = state.models.find(item => (item.model || item.id) === $("modelSelect").value);
    const supported = Array.isArray(model?.supportedReasoningEfforts)
      ? model.supportedReasoningEfforts.map(item => item.reasoningEffort)
      : [];
    for (const option of $("effortSelect").options) option.disabled = Boolean(supported.length) && !supported.includes(option.value);
    if (supported.length && !supported.includes($("effortSelect").value)) {
      $("effortSelect").value = model?.defaultReasoningEffort || supported[0];
    }
  }

  async function startLogin() {
    $("startLogin").disabled = true;
    $("startLogin").textContent = text.connecting;
    try {
      const result = await api("/login/device", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:"{}"
      });
      if (!result?.verificationUrl || !result?.userCode) throw new Error("Device login was not returned by Codex");
      $("deviceCode").textContent = result.userCode;
      $("deviceLink").href = result.verificationUrl;
      $("devicePanel").classList.remove("hidden");
      clearInterval(state.loginTimer);
      state.loginTimer = setInterval(async () => {
        if (await refreshAccount()) {
          clearInterval(state.loginTimer);
          state.loginTimer = null;
        }
      }, 2000);
    } catch (error) {
      $("gateTitle").textContent = text.error;
      $("gateText").textContent = error?.message || text.error;
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
    const result = await api("/thread", {
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
      const response = await fetch("/api/gpt/turn", {
        method:"POST",
        cache:"no-store",
        credentials:"same-origin",
        headers:{"Content-Type":"application/json",Accept:"text/event-stream"},
        body:JSON.stringify({
          threadId,
          message,
          model:$("modelSelect").value,
          effort:$("effortSelect").value
        })
      });
      if (response.status === 401) {
        location.reload();
        return;
      }
      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || ("HTTP " + response.status));
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamed = "";
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, {stream:true});
        let boundary;
        while ((boundary = buffer.indexOf("\\n\\n")) >= 0) {
          const block = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          let event = "message";
          let payload = null;
          for (const line of block.split("\\n")) {
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

  $("retry").addEventListener("click", refreshAccount);
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

  void refreshAccount();
})();
</script>
</body>
</html>`;
}
