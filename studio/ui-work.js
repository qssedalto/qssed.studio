function workStyles() {
  return `
    <style>
      .work-shell{display:grid;gap:18px}
      .work-hero-card,.work-card{border:1px solid rgba(127,127,127,.18);background:rgba(127,127,127,.065);border-radius:22px;box-shadow:0 16px 38px rgba(0,0,0,.055)}
      .work-hero-card{padding:24px;display:grid;grid-template-columns:minmax(0,1.35fr) minmax(240px,.65fr);gap:18px;align-items:stretch}
      .work-hero-copy{display:flex;flex-direction:column;justify-content:center;min-height:176px}
      .work-eyebrow{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;opacity:.58;margin:0 0 10px}
      .work-hero-card h2{font-size:clamp(28px,4vw,42px);line-height:1.05;margin:0;letter-spacing:-.035em}
      .work-hero-card p{margin:14px 0 0;max-width:720px;line-height:1.72;opacity:.72}
      .work-hero-status{border-radius:18px;padding:18px;background:rgba(127,127,127,.08);display:flex;flex-direction:column;justify-content:space-between;gap:16px}
      .work-status-row{display:flex;align-items:center;gap:10px;font-weight:750}
      .work-dot{width:10px;height:10px;border-radius:50%;background:#9a9aa0;box-shadow:0 0 0 5px rgba(127,127,127,.1)}
      .work-dot.is-online{background:#34c759;box-shadow:0 0 0 5px rgba(52,199,89,.14)}
      .work-dot.is-checking{background:#ff9f0a;box-shadow:0 0 0 5px rgba(255,159,10,.14)}
      .work-meta{display:grid;gap:7px;font-size:13px;opacity:.72}
      .work-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}
      .work-button{appearance:none;border:0;border-radius:999px;padding:11px 17px;font:inherit;font-weight:760;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:transform .16s ease,opacity .16s ease,background .16s ease}
      .work-button:hover{transform:translateY(-1px)}
      .work-button:disabled{cursor:not-allowed;opacity:.45;transform:none}
      .work-button.primary{background:#0a84ff;color:white}
      .work-button.secondary{background:rgba(127,127,127,.12);color:inherit;border:1px solid rgba(127,127,127,.14)}
      .work-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
      .work-card{padding:19px;min-height:170px;display:flex;flex-direction:column;gap:10px}
      .work-card h3{margin:0;font-size:17px;letter-spacing:-.01em}
      .work-card p{margin:0;line-height:1.62;opacity:.68;font-size:14px}
      .work-card .work-tag{margin-top:auto;align-self:flex-start;font-size:12px;font-weight:760;padding:6px 9px;border-radius:999px;background:rgba(127,127,127,.1)}
      .work-panel{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.72fr);gap:14px}
      .work-log{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:1.55;white-space:pre-wrap;word-break:break-word;min-height:122px;padding:14px;border-radius:15px;background:rgba(0,0,0,.06);margin-top:8px}
      .work-capabilities{display:flex;flex-wrap:wrap;gap:7px;margin-top:6px}
      .work-capability{font-size:12px;border-radius:999px;padding:6px 9px;background:rgba(127,127,127,.1)}
      .work-note{font-size:13px;line-height:1.62;opacity:.65;margin:0}
      @media(max-width:900px){.work-hero-card,.work-panel{grid-template-columns:1fr}.work-grid{grid-template-columns:1fr}.work-hero-copy{min-height:auto}}
    </style>
  `;
}

export function workHubContent(zh) {
  const prefix = zh ? "/zh-cn" : "/en";
  return `
    ${workStyles()}
    <div class="work-shell">
      <section class="work-hero-card">
        <div class="work-hero-copy">
          <p class="work-eyebrow">QssedA Work</p>
          <h2>${zh ? "把网页工作区延伸到本机。" : "Extend the web workspace onto your computer."}</h2>
          <p>${zh ? "Work 是 QssedA Studio 的本机协作入口。第一阶段先连接 Local Bridge，只读取本机能力状态，不执行任意命令，也不会把浏览器登录令牌发送到 localhost。" : "Work is the local-collaboration surface for QssedA Studio. The first pilot connects to Local Bridge for capability discovery only: no arbitrary commands and no browser sign-in tokens are sent to localhost."}</p>
          <div class="work-actions">
            <a class="work-button primary" href="${prefix}/work/local">${zh ? "连接本机" : "Connect local device"}</a>
            <a class="work-button secondary" href="${prefix}/workspace/experiments/tex">${zh ? "打开 TeX 工作台" : "Open TeX Workbench"}</a>
          </div>
        </div>
        <div class="work-hero-status">
          <div>
            <p class="work-eyebrow">Phase 01</p>
            <div class="work-status-row"><span class="work-dot"></span><span>${zh ? "本机桥接试运行" : "Local bridge pilot"}</span></div>
          </div>
          <div class="work-meta">
            <span>${zh ? "回环地址：127.0.0.1:32145" : "Loopback: 127.0.0.1:32145"}</span>
            <span>${zh ? "协议：QssedA Local Bridge v1" : "Protocol: QssedA Local Bridge v1"}</span>
            <span>${zh ? "当前能力：设备发现、TeX 状态" : "Current scope: discovery and TeX status"}</span>
          </div>
        </div>
      </section>

      <section class="work-grid">
        <article class="work-card">
          <h3>${zh ? "本机桥接" : "Local Bridge"}</h3>
          <p>${zh ? "网站通过受限的 localhost 接口发现本机组件。Bridge 只绑定回环地址，并校验 QssedA Origin。" : "The site discovers local components through a constrained localhost interface. The bridge binds only to loopback and validates the QssedA origin."}</p>
          <span class="work-tag">${zh ? "可试用" : "Pilot ready"}</span>
        </article>
        <article class="work-card">
          <h3>${zh ? "本机 TeX" : "Local TeX"}</h3>
          <p>${zh ? "先检测 XeLaTeX 是否可用；下一阶段再接入受沙箱限制的本地编译，不开放任意 shell。" : "Detect XeLaTeX first; a later phase can add sandboxed local compilation without exposing arbitrary shell access."}</p>
          <span class="work-tag">${zh ? "状态检测" : "Status probe"}</span>
        </article>
        <article class="work-card">
          <h3>${zh ? "更多本机能力" : "More local capabilities"}</h3>
          <p>${zh ? "Git、本地文件和媒体工具可以沿用同一 Bridge 协议，但每项能力都需要独立授权与白名单。" : "Git, local files, and media tools can use the same bridge protocol, with separate authorization and allowlists for each capability."}</p>
          <span class="work-tag">${zh ? "后续扩展" : "Next"}</span>
        </article>
      </section>
    </div>
  `;
}

export function workLocalBridgeContent(zh) {
  const copy = {
    idle: zh ? "等待检测" : "Waiting",
    checking: zh ? "正在检测本机服务…" : "Checking local service…",
    online: zh ? "本机桥接已连接" : "Local bridge connected",
    offline: zh ? "未检测到本机桥接" : "Local bridge not detected",
    permission: zh ? "浏览器可能会询问是否允许访问本机网络；只允许你确认是 QssedA Studio 发起的请求。" : "Your browser may ask for permission to access the local device. Only allow it when you confirm the request came from QssedA Studio.",
    texReady: zh ? "XeLaTeX 可用" : "XeLaTeX available",
    texMissing: zh ? "未检测到 XeLaTeX" : "XeLaTeX not detected",
    retry: zh ? "重新检测" : "Check again",
    logIdle: zh ? "尚未向 localhost 发送请求。" : "No localhost request has been sent yet.",
    logOnline: zh ? "已完成只读握手。没有发送账号 Cookie、Bearer Token 或 TeX 源码。" : "Read-only handshake completed. No account cookies, bearer tokens, or TeX source were sent.",
    logOffline: zh ? "无法连接 127.0.0.1:32145。请先启动 QssedA Local Bridge，或检查浏览器的本机网络权限。" : "Could not reach 127.0.0.1:32145. Start QssedA Local Bridge or check the browser's local-network permission."
  };
  return `
    ${workStyles()}
    <div class="work-shell" id="work-local-root">
      <section class="work-hero-card">
        <div class="work-hero-copy">
          <p class="work-eyebrow">Local Bridge</p>
          <h2>${zh ? "网页 ↔ 本机，先做一次安全握手。" : "Web ↔ local, starting with a safe handshake."}</h2>
          <p>${zh ? "这个试运行页面只访问固定的回环端口并读取 /health 与 /tex/status。它不会把 QssedA 登录凭据发送给本机服务，也不会接受网页传入的可执行命令。" : "This pilot only contacts a fixed loopback port and reads /health and /tex/status. It does not send QssedA sign-in credentials to the local service and does not expose a web-controlled command runner."}</p>
          <div class="work-actions">
            <button class="work-button primary" id="work-local-connect" type="button">${zh ? "检测本机服务" : "Detect local service"}</button>
            <a class="work-button secondary" href="${zh ? "/zh-cn/work" : "/en/work"}">${zh ? "返回 Work" : "Back to Work"}</a>
          </div>
        </div>
        <div class="work-hero-status">
          <div>
            <p class="work-eyebrow">Connection</p>
            <div class="work-status-row"><span class="work-dot" id="work-local-dot"></span><span id="work-local-status">${copy.idle}</span></div>
          </div>
          <div class="work-meta">
            <span id="work-local-endpoint">127.0.0.1:32145</span>
            <span id="work-local-version">${zh ? "协议：等待握手" : "Protocol: waiting for handshake"}</span>
            <span id="work-local-tex">${zh ? "TeX：等待检测" : "TeX: waiting"}</span>
          </div>
        </div>
      </section>

      <section class="work-panel">
        <article class="work-card">
          <h3>${zh ? "协作通道" : "Collaboration channel"}</h3>
          <p>${zh ? "网页只发起只读能力探测。后续若加入 TeX 编译、Git 或文件操作，会为每类动作增加明确授权、请求签名和能力白名单。" : "The web page currently performs read-only capability discovery. TeX compile, Git, or file actions will require explicit authorization, request signing, and per-capability allowlists."}</p>
          <div class="work-capabilities" id="work-local-capabilities"><span class="work-capability">health</span><span class="work-capability">tex.status</span></div>
          <p class="work-note">${copy.permission}</p>
        </article>
        <article class="work-card">
          <h3>${zh ? "连接日志" : "Connection log"}</h3>
          <div class="work-log" id="work-local-log">${copy.logIdle}</div>
        </article>
      </section>
    </div>
    <script>
      (() => {
        const endpoints = ["http://127.0.0.1:32145", "http://localhost:32145"];
        const expectedService = "qsseda-local-bridge";
        const expectedProtocol = 1;
        const button = document.getElementById("work-local-connect");
        const dot = document.getElementById("work-local-dot");
        const status = document.getElementById("work-local-status");
        const endpointLabel = document.getElementById("work-local-endpoint");
        const versionLabel = document.getElementById("work-local-version");
        const texLabel = document.getElementById("work-local-tex");
        const capabilities = document.getElementById("work-local-capabilities");
        const log = document.getElementById("work-local-log");
        const text = ${JSON.stringify(copy)};

        function setState(kind, message) {
          dot?.classList.remove("is-online", "is-checking");
          if (kind === "online") dot?.classList.add("is-online");
          if (kind === "checking") dot?.classList.add("is-checking");
          if (status) status.textContent = message;
        }

        async function loopbackFetch(base, path) {
          const controller = new AbortController();
          const timer = window.setTimeout(() => controller.abort(), 1800);
          try {
            const request = new Request(base + path, {
              method: "GET",
              mode: "cors",
              cache: "no-store",
              credentials: "omit",
              headers: { Accept: "application/json" },
              signal: controller.signal,
              targetAddressSpace: "loopback"
            });
            return await fetch(request);
          } finally {
            window.clearTimeout(timer);
          }
        }

        async function readJson(response) {
          if (!response?.ok) throw new Error("HTTP " + (response?.status || 0));
          return response.json();
        }

        function renderCapabilities(items) {
          if (!capabilities || !Array.isArray(items)) return;
          capabilities.replaceChildren();
          for (const item of items.slice(0, 12)) {
            const chip = document.createElement("span");
            chip.className = "work-capability";
            chip.textContent = String(item);
            capabilities.appendChild(chip);
          }
        }

        async function probe() {
          if (!button || button.disabled) return;
          button.disabled = true;
          setState("checking", text.checking);
          if (log) log.textContent = text.checking;

          let connectedBase = "";
          let health = null;
          for (const base of endpoints) {
            try {
              const candidate = await readJson(await loopbackFetch(base, "/health"));
              if (candidate?.service !== expectedService || Number(candidate?.protocol) !== expectedProtocol) continue;
              connectedBase = base;
              health = candidate;
              break;
            } catch {}
          }

          if (!connectedBase || !health) {
            setState("offline", text.offline);
            if (versionLabel) versionLabel.textContent = ${JSON.stringify(zh ? "协议：未连接" : "Protocol: offline")};
            if (texLabel) texLabel.textContent = ${JSON.stringify(zh ? "TeX：未检测" : "TeX: not detected")};
            if (log) log.textContent = text.logOffline;
            button.disabled = false;
            button.textContent = text.retry;
            return;
          }

          if (endpointLabel) endpointLabel.textContent = connectedBase.replace(/^https?:\/\//, "");
          if (versionLabel) versionLabel.textContent = ${JSON.stringify(zh ? "协议：" : "Protocol: ")} + String(health?.service || "") + " v" + String(health?.protocol || "");
          renderCapabilities(health?.capabilities || []);
          let tex = null;
          try { tex = await readJson(await loopbackFetch(connectedBase, "/tex/status")); } catch {}
          if (texLabel) texLabel.textContent = tex?.available ? text.texReady : text.texMissing;
          setState("online", text.online);
          if (log) log.textContent = text.logOnline;
          button.disabled = false;
          button.textContent = text.retry;
        }

        async function autoProbeWhenAlreadyAllowed() {
          try {
            const permissionState = await navigator.permissions?.query?.({ name: "local-network-access" });
            if (permissionState?.state === "granted") return void probe();
          } catch {}
        }

        button?.addEventListener("click", () => void probe());
        void autoProbeWhenAlreadyAllowed();
      })();
    </script>
  `;
}

export function decorateWorkNavigation(markup, zh, pathname) {
  let output = String(markup || "");
  const workUrl = zh ? "https://work.qsseda.studio/zh-cn/tex" : "https://work.qsseda.studio/en/tex";
  const group = `
        <section class="os-nav-group" data-qsseda-work-nav="1">
          <span class="os-nav-title">${zh ? "协作" : "Work"}</span>
          <div class="os-nav-items">
            <a href="${workUrl}">${zh ? "Work" : "Work"}</a>
          </div>
        </section>
      `;

  // Keep exactly one Studio-side entry into the standalone Work product.
  // Work Hub and Local Bridge are implementation details and must not appear
  // as separate navigation destinations in Studio.
  output = output.replace(/\s*<section class="os-nav-group[^"]*" data-qsseda-work-nav="1">[\s\S]*?<\/section>\s*/g, "\n");

  const adminAnchorZh = '<a class="os-nav-title" href="/zh-cn/admin">';
  const adminAnchorEn = '<a class="os-nav-title" href="/en/admin">';
  const adminAnchor = zh ? adminAnchorZh : adminAnchorEn;
  const anchorIndex = output.indexOf(adminAnchor);
  const sectionIndex = anchorIndex >= 0 ? output.lastIndexOf('<section class="os-nav-group', anchorIndex) : -1;
  if (sectionIndex >= 0) output = output.slice(0, sectionIndex) + group + output.slice(sectionIndex);
  else output = output.replace("</nav>", group + "</nav>");

  return output;
}