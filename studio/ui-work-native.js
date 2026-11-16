export function enhanceWorkLocalBridgeNative(markup, zh) {
  let output = String(markup || "");

  output = output
    .replace("连接检查不会发送账号 Cookie、Bearer Token 或文档内容。", "连接检查不会发送你的账号凭据或文档内容。")
    .replace("Connection checks do not send account cookies, bearer tokens, or document content.", "Connection checks do not send your account credentials or document content.");

  const nativeButton = `<a class="work-button secondary" id="work-native-bridge-download" href="/api/work/bridge/windows" download="AERTEX-Bridge-Setup.exe" data-qsseda-native-bridge-download="1">${zh ? "安装 Windows 连接组件" : "Install Windows component"}</a>`;
  const guideHref = `https://qsseda.com/${zh ? "zh-cn" : "en-us"}/q/ac429c78-7e82-4cea-9b12-90188b0c0c60`;
  const texliveButton = `<span class="work-texlive-download-group" id="work-native-texlive-group"><span class="work-texlive-action-row"><a class="work-button secondary" id="work-native-texlive-download" href="https://1drv.ms/u/c/45a22b56b9646fc7/IQDExSUns1FzR6M3luj0QRQaAZ8Pc6frUc6zaYEr-Qnexvo?e=Ek9bsc" target="_blank" rel="noopener noreferrer">${zh ? "下载 TeX Live（ISO）" : "Download TeX Live (ISO)"}</a><a class="work-texlive-help-link" id="work-native-texlive-guide" href="${guideHref}" target="_blank" rel="noopener noreferrer">${zh ? "安装前必读：组件使用指南 ↗" : "Setup guide for both components ↗"}</a></span><small class="work-texlive-prerequisite">${zh ? "此为 Windows 连接组件使用的前置条件，请先安装完此内容再打开 Windows 连接组件。" : "This is a prerequisite for the Windows connection component. Please complete the installation before opening the Windows component."}</small></span>`;
  const macButton = `<a class="work-button secondary" id="work-native-macos-bridge-download" href="/api/work/bridge/macos" download="AERTEX-Bridge-macOS-universal.pkg" data-qsseda-native-bridge-download="macos" hidden>${zh ? "安装 macOS 连接组件" : "Install macOS component"}</a>`;
  const macTexButton = `<span id="work-native-mactex-group" class="work-texlive-download-group" hidden><span class="work-texlive-action-row"><a class="work-button secondary" href="https://tug.org/mactex/" target="_blank" rel="noopener noreferrer">${zh ? "获取 MacTeX（官方）" : "Get MacTeX (official)"}</a><a class="work-texlive-help-link" id="work-native-macos-guide-link" href="#work-macos-install-guide">${zh ? "Mac 安装指南 ↓" : "Mac installation guide ↓"}</a></span><small class="work-texlive-prerequisite">${zh ? "Mac 的 TeX 环境由 MacTeX 提供；如果已安装 XeLaTeX，可直接检查本机连接。" : "MacTeX provides the macOS TeX toolchain. If XeLaTeX is already installed, check your connection directly."}</small><small class="work-macos-unsigned-note">${zh ? "此 macOS Bridge 安装包未使用 Apple Developer ID 签名或公证。下载后若被系统阻止，请先核实文件来源，再前往「系统设置 → 隐私与安全性 → 仍要打开」单独允许；不要关闭系统整体安全保护。" : "This macOS Bridge installer is not signed with an Apple Developer ID or notarized. If blocked, verify the source first, then use System Settings → Privacy & Security → Open Anyway for this file only. Do not disable system-wide protections."}</small></span>`;
  output = output.replace("<!--QSSedaWorkNativeAction-->", nativeButton + texliveButton + macButton + macTexButton);
  output += `
    <style id="work-texlive-prerequisite-style">
      #work-local-root .work-actions{align-items:flex-start}
      #work-local-root .work-texlive-download-group{display:inline-flex;flex:0 1 580px;flex-direction:column;align-items:flex-start;gap:6px;max-width:100%}
      #work-local-root .work-texlive-action-row{display:flex;align-items:center;flex-wrap:wrap;gap:8px 14px;max-width:100%}
      #work-local-root .work-texlive-help-link{display:inline-flex;align-items:center;min-height:44px;color:#007aff;text-decoration:underline;text-underline-offset:3px;font-size:13px;font-weight:600;line-height:1.4}
      #work-local-root .work-texlive-help-link:hover{color:#005bc7}
      #work-local-root .work-texlive-help-link:focus-visible{outline:2px solid #007aff;outline-offset:3px;border-radius:4px}
      #work-local-root .work-texlive-prerequisite{display:block;color:var(--muted,#6e6e73);font-size:11px;line-height:1.5;font-weight:400}
      #work-local-root .work-texlive-download-group[hidden]{display:none!important}
       #work-local-root #work-native-macos-bridge-download[hidden]{display:none!important}
       #work-local-root #work-native-macos-bridge-download[aria-disabled="true"]{opacity:.55;cursor:not-allowed}
      #work-local-root .work-macos-guide[hidden]{display:none!important}
      #work-local-root .work-macos-guide{margin-top:22px;padding:24px;border:1px solid var(--border);border-radius:20px;background:var(--surface);color:var(--text);display:grid;gap:20px}
      #work-local-root .work-macos-guide-head{display:grid;gap:7px}
      #work-local-root .work-macos-guide-eyebrow{font-size:11px;font-weight:700;letter-spacing:.09em;color:var(--muted)}
      #work-local-root .work-macos-guide h3{font-size:clamp(21px,2.4vw,28px);line-height:1.3;margin:0;letter-spacing:-.025em}
      #work-local-root .work-macos-guide-head p{font-size:13px;color:var(--muted);line-height:1.7;margin:0;max-width:900px}
      #work-local-root .work-macos-guide-steps{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;list-style:none;counter-reset:mac-guide; margin:0;padding:0}
      #work-local-root .work-macos-guide-steps>li{position:relative;min-width:0;counter-increment:mac-guide;display:grid;align-content:start;gap:10px;padding:17px;border-radius:13px;background:var(--card,var(--surface));border:1px solid var(--border)}
      #work-local-root .work-macos-guide-steps>li h4{display:flex;align-items:center;gap:9px;font-size:14px;margin:0;font-weight:700;line-height:1.5}
      #work-local-root .work-macos-guide-steps>li h4:before{content:counter(mac-guide);display:grid;place-items:center;width:23px;height:23px;min-width:23px;border-radius:50%;background:var(--primary,#007aff);color:white;font-size:11px}
      #work-local-root .work-macos-guide-steps p,#work-local-root .work-macos-guide-diagnostics p{font-size:12px;line-height:1.75;margin:0;color:var(--muted)}
      #work-local-root .work-macos-guide-steps a{font-size:12px;color:var(--primary,#007aff);font-weight:600;text-decoration:underline;text-underline-offset:3px;justify-self:start}
      #work-local-root .work-macos-guide-warning{font-size:12px;line-height:1.7;padding:12px 13px;border-radius:9px;border:1px solid var(--border);background:var(--surface)}
      #work-local-root .work-macos-guide-diagnostics{padding:12px 15px;border:1px solid var(--border);border-radius:12px}
      #work-local-root .work-macos-guide-diagnostics>summary{cursor:pointer;font-size:13px;font-weight:650}
      #work-local-root .work-macos-guide-diagnostics[open]{display:grid;gap:10px}
      #work-local-root .work-macos-guide-commands{display:grid;gap:8px}
      #work-local-root .work-macos-guide-commands>div{display:grid;gap:4px;font-size:11px;color:var(--muted)}
      #work-local-root .work-macos-guide-commands code{display:block;overflow-x:auto;padding:9px 11px;border:1px solid var(--border);border-radius:8px;background:var(--card,var(--surface));font-size:12px;color:var(--text);white-space:nowrap}
      #work-local-root .work-macos-guide a:focus-visible,#work-local-root .work-macos-guide summary:focus-visible{outline:2px solid var(--primary,#007aff);outline-offset:3px;border-radius:4px}
      @media(max-width:760px){#work-local-root .work-macos-guide-steps{grid-template-columns:minmax(0,1fr)}}
      @media(max-width:560px){
        #work-local-root .work-macos-guide{padding:15px;gap:15px}

        #work-local-root .work-texlive-download-group{width:100%;flex-basis:100%}
        #work-local-root .work-texlive-action-row{width:100%}
        #work-local-root .work-texlive-action-row>.work-button{width:100%}
      }
    </style>`;

  // Keep the version-update alert in the hero; remove the two redundant informational cards.
  const nativeNote = `<div class="work-connection-message" id="work-bridge-upgrade-note" hidden>${zh ? "检测到连接组件版本较旧。请安装新版后重新检查连接。" : "This connection component is out of date. Install the latest version, then check the connection again."}</div>`;
  output = output.replace("<!--QSSedaWorkNativeNote-->", nativeNote);

  const macGuideCopy = zh ? {
    eyebrow: "AERTEX Bridge · macOS",
    title: "Mac 安装与连接指南",
    subtitle: "适用于 Apple Silicon 与 Intel Mac。先安装 MacTeX，再安装 AERTEX Bridge；两者均不需要 PowerShell、Node.js 或 Windows 虚拟机。",
    step1: "安装 MacTeX",
    detail1: "从 TeX Users Group 官方网站下载 MacTeX，打开安装包并完成安装。完整的 MacTeX 提供 XeLaTeX 和 pdfLaTeX；如果已经安装且能够使用，可以跳过这一步。",
    mactex: "前往 MacTeX 官方网站 ↗",
    step2: "下载 AERTEX Bridge",
    detail2: "点击本页面上方的“安装 macOS 连接组件（未签名）”。下载的是通用 PKG 安装器；如果使用 DMG，打开后运行其中的 PKG 即可，不需要重复安装两个文件。安装可能需要管理员授权。",
    step3: "处理未签名安装提示",
    detail3: "AERTEX Bridge 未进行 Apple Developer ID 签名或 Apple 公证。若首次打开时 macOS 提示无法验证开发者，请先确认来源可信、文件未被篡改，然后关闭提示，打开“系统设置 → 隐私与安全性”，找到对应项目并点击“仍要打开”，按系统提示授权。",
    warning: "请仅对已经核实来源的 AERTEX 安装包使用单文件例外。如果 macOS 明确提示文件损坏、已被修改或包含恶意软件，请停止安装并重新核实，不要强行绕过。无需关闭 Gatekeeper 或修改整台 Mac 的安全设置。",
    apple: "查看 Apple 官方安全安装说明 ↗",
    step4: "检查本机连接",
    detail4: "Bridge 安装后会在当前登录用户的后台运行，并在以后登录 macOS 时自动启动。回到本页面点击“检查连接”，确认显示 Bridge 已连接及 XeLaTeX 可用，然后在 AERTEX Work 中试编译一个 TeX 文件。",
    diagnoseTitle: "连接失败时如何排查？",
    diagnose: "先确认 Bridge 安装完成、MacTeX 已安装；允许浏览器请求本机网络访问。若 Bridge 已连接但显示编译器不可用，检查 MacTeX 的 XeLaTeX。进阶排查可在“终端”分别执行下列只读命令：",
    status: "检测 Bridge 服务", tex: "检测 TeX 编译器", path: "检查 MacTeX 路径",
    note: "以上命令仅用于检查，不会修改 macOS 设置。如果没有出现“仍要打开”，请先尝试打开一次下载的 PKG，再查看“隐私与安全性”。"
  } : {
    eyebrow: "AERTEX Bridge · macOS",
    title: "Install and connect on your Mac",
    subtitle: "For Apple Silicon and Intel Macs. Install MacTeX first, then AERTEX Bridge. No PowerShell, Node.js, or Windows VM required.",
    step1: "Install MacTeX",
    detail1: "Download MacTeX from the TeX Users Group and complete its installer. Full MacTeX includes XeLaTeX and pdfLaTeX. Skip this step if your local TeX installation already works.",
    mactex: "Visit the official MacTeX site ↗",
    step2: "Download AERTEX Bridge",
    detail2: "Use the “Install macOS component (unsigned)” button above. The universal PKG is the installer; if you download the DMG, open it and run its included PKG. Do not install both. Administrator approval may be required.",
    step3: "Approve an unsigned installer, if blocked",
    detail3: "AERTEX Bridge has not been signed with an Apple Developer ID or notarized. If macOS cannot verify the developer on first open, verify the source and integrity of the file. Dismiss the alert, then go to System Settings → Privacy & Security and choose Open Anyway for that installer, if the option appears.",
    warning: "Only use a per-file exception for a source you trust. If macOS reports that the file is damaged, modified, or contains malware, stop and investigate instead of bypassing the warning. Never disable Gatekeeper system-wide.",
    apple: "Apple's official guidance for opening apps safely ↗",
    step4: "Check the local connection",
    detail4: "Bridge runs in the background for the signed-in user and starts automatically at future macOS logins. Return here and select Check connection. Confirm that Bridge is connected and XeLaTeX is available, then try compiling a TeX file in AERTEX Work.",
    diagnoseTitle: "Connection troubleshooting",
    diagnose: "Confirm that Bridge and MacTeX are installed and allow browser local-network access when prompted. If Bridge connects but the compiler is missing, check XeLaTeX. For advanced diagnostics, run these read-only Terminal commands:",
    status: "Bridge service", tex: "TeX engines", path: "MacTeX path",
    note: "These commands do not change macOS settings. If Open Anyway is missing, try opening the downloaded PKG once before returning to Privacy & Security."
  };
  const macGuide = `
    <section class="work-macos-guide" id="work-macos-install-guide" aria-labelledby="work-macos-guide-title" hidden>
      <header class="work-macos-guide-head">
        <span class="work-macos-guide-eyebrow">${macGuideCopy.eyebrow}</span>
        <h3 id="work-macos-guide-title">${macGuideCopy.title}</h3>
        <p>${macGuideCopy.subtitle}</p>
      </header>
      <ol class="work-macos-guide-steps">
        <li><h4>${macGuideCopy.step1}</h4><p>${macGuideCopy.detail1}</p>
          <a href="https://tug.org/mactex/" target="_blank" rel="noopener noreferrer">${macGuideCopy.mactex}</a>
        </li>
        <li><h4>${macGuideCopy.step2}</h4><p>${macGuideCopy.detail2}</p></li>
        <li><h4>${macGuideCopy.step3}</h4><p>${macGuideCopy.detail3}</p>
          <div class="work-macos-guide-warning" role="note">${macGuideCopy.warning}</div>
          <a href="https://support.apple.com/en-us/102445" target="_blank" rel="noopener noreferrer">${macGuideCopy.apple}</a>
        </li>
        <li><h4>${macGuideCopy.step4}</h4><p>${macGuideCopy.detail4}</p></li>
      </ol>
      <details class="work-macos-guide-diagnostics">
        <summary>${macGuideCopy.diagnoseTitle}</summary>
        <p>${macGuideCopy.diagnose}</p>
        <div class="work-macos-guide-commands">
          <div><span>${macGuideCopy.status}</span><code>curl -fsS http://127.0.0.1:32145/health</code></div>
          <div><span>${macGuideCopy.tex}</span><code>curl -fsS http://127.0.0.1:32145/tex/status</code></div>
          <div><span>${macGuideCopy.path}</span><code>ls -l /Library/TeX/texbin/xelatex</code></div>
        </div>
        <p class="work-macos-guide-note">${macGuideCopy.note}</p>
      </details>
    </section>`;
  // Place the guide below the existing hero/status section; do not change
  // Windows connection actions, layout or the mobile Work redirect.
  output = output.replace(/(<\/aside>\s*<\/section>)/, "$1" + macGuide);


  output = output.replace(
    "void autoProbeWhenAlreadyAllowed();",
    "if (!(/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || \"\") || (navigator.platform === \"MacIntel\" && Number(navigator.maxTouchPoints) > 1))) window.setTimeout(() => void probe(), 260);"
  );

  output = output.replace(
    "</script>",
    `
      (() => {
        const incompatibleBuilds = ["0.3.0-d642c4b"];
        const version = document.getElementById("work-local-version");
        const statusCard = document.getElementById("work-local-status-card");
        const note = document.getElementById("work-bridge-upgrade-note");
        const download = document.getElementById("work-native-bridge-download");
        const texliveDownload = document.getElementById("work-native-texlive-download");
        const texliveGroup = document.getElementById("work-native-texlive-group");
        const macDownload = document.getElementById("work-native-macos-bridge-download");
        const macTexGroup = document.getElementById("work-native-mactex-group");
        const macGuide = document.getElementById("work-macos-install-guide");
        if (!version || !note || !download || !texliveDownload) return;

        const userAgent = navigator.userAgent || "";
        const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent) ||
          (navigator.platform === "MacIntel" && Number(navigator.maxTouchPoints) > 1);
        const isWindows = !mobile && /Windows NT/i.test(userAgent);
        const isMac = !mobile && /Macintosh|Mac OS X/i.test(userAgent);
        let macPublished = false;
        download.hidden = !isWindows;
        texliveDownload.hidden = !isWindows;
        if (texliveGroup) texliveGroup.hidden = !isWindows;
        if (macTexGroup) macTexGroup.hidden = !isMac;
        if (macGuide) macGuide.hidden = !isMac;

        // Do not navigate away on cancellation; confirmation opens a new tab.
        texliveDownload.addEventListener("click", (event) => {
          const warning = ${JSON.stringify(zh ? "即将打开 Microsoft OneDrive 上的 TeX Live 安装镜像（texlive.iso）。访问或下载可能需要额外的网络环境。是否继续？" : "You are about to open the TeX Live installation image (texlive.iso) on Microsoft OneDrive. Access or download may require additional network access. Continue?")};
          if (!window.confirm(warning)) event.preventDefault();
        });

        const syncUpgradeState = () => {
          const versionText = String(version.textContent || "");
          const incompatible = incompatibleBuilds.some(build => versionText.includes(build));
          const connected = Boolean(statusCard?.classList.contains("is-online"));
          note.hidden = !incompatible;
          if (isWindows) download.hidden = connected && !incompatible;
          download.textContent = incompatible
            ? ${JSON.stringify(zh ? "更新 Windows 连接组件" : "Update Windows component")}
            : ${JSON.stringify(zh ? "安装 Windows 连接组件" : "Install Windows component")};
          if (macDownload) {
            macDownload.hidden = !isMac || (connected && !incompatible);
            macDownload.textContent = !macPublished
              ? ${JSON.stringify(zh ? "macOS 安装包尚未发布" : "macOS installer not published")}
              : incompatible
                ? ${JSON.stringify(zh ? "更新 macOS 连接组件（未签名）" : "Update macOS component (unsigned)")}
                : ${JSON.stringify(zh ? "安装 macOS 连接组件（未签名）" : "Install macOS component (unsigned)")};
            macDownload.setAttribute("aria-disabled", String(!macPublished));
            if (macPublished) macDownload.setAttribute("href", "/api/work/bridge/macos");
            else macDownload.removeAttribute("href");
          }
        };

        new MutationObserver(syncUpgradeState).observe(version, { childList: true, subtree: true, characterData: true });
        if (statusCard) new MutationObserver(syncUpgradeState).observe(statusCard, { attributes: true, attributeFilter: ["class"] });
        syncUpgradeState();
        // Never link users to an unpublished R2 object or a 503 response.
        if (isMac) {
          fetch("/api/work/bridge/macos", {
            method: "HEAD", cache: "no-store", credentials: "omit"
          }).then(response => {
            macPublished = response.ok;
            syncUpgradeState();
          }).catch(() => { macPublished = false; syncUpgradeState(); });
        }
      })();
    </script>`
  );

  // Device-specific local setup: the offline dashboard is not actionable
  // on iPad/phone, so link to the existing Work remote compilation flow.
  const mobileTitle = zh ? "移动设备无需安装本机连接组件" : "Local Bridge setup is for computers";
  const mobileDetail = zh
    ? "本机 Bridge 和 TeX Live 需要安装在电脑上。iPad 和手机可在 Work 编辑 TeX；需要生成 PDF 时，可按额度规则使用远程编译。"
    : "Install TeX Live and Bridge on a computer. On mobile, edit TeX in Work and use remote compilation when quota is available.";
  const mobileUrl = "https://work.qsseda.com/" + (zh ? "zh-cn" : "en") + "/tex";
  const mobileGuide = '<div class="work-mobile-local-note" id="work-mobile-local-note" hidden>' +
    '<strong>' + mobileTitle + '</strong><p>' + mobileDetail + '</p>' +
    '<a class="work-button primary" href="' + mobileUrl + '">' +
    (zh ? "打开 TeX 工作台" : "Open TeX Workbench") + '</a></div>';
  output=output.replace('<div class="work-native-slot" id="work-native-note-slot">',
    mobileGuide + '<div class="work-native-slot" id="work-native-note-slot">');
  output += '<style id="work-native-mobile-copy">' +
    '#work-local-root.is-mobile-local #work-local-status-card,' +
    '#work-local-root.is-mobile-local #work-local-connect,' +
    '#work-local-root.is-mobile-local #work-native-bridge-download,' +
    '#work-local-root.is-mobile-local #work-native-texlive-group,' +
    '#work-local-root.is-mobile-local #work-native-note-slot{display:none!important}' +
    '#work-local-root.is-mobile-local #work-mobile-local-note{' +
    'display:grid;gap:12px;margin-top:18px;max-width:650px;padding:16px;' +
    'border:1px solid var(--border);border-radius:14px;background:var(--surface)}' +
    '#work-local-root.is-mobile-local #work-mobile-local-note strong{font-size:15px}' +
    '#work-local-root.is-mobile-local #work-mobile-local-note p{' +
    'margin:0;color:var(--muted);line-height:1.6;font-size:13px}' +
    '#work-local-root.is-mobile-local #work-mobile-local-note a{justify-self:start}' +
    '</style><script id="work-native-mobile-copy-script">(()=>{' +
    'const ua=navigator.userAgent||"";' +
    'const mobile=/Android|iPhone|iPad|iPod|Mobile/i.test(ua)||' +
    '(navigator.platform==="MacIntel"&&Number(navigator.maxTouchPoints)>1);' +
    'if(!mobile)return;' +
    'const root=document.getElementById("work-local-root");' +
    'if(root)root.classList.add("is-mobile-local");' +
    'const note=document.getElementById("work-mobile-local-note");if(note)note.hidden=false;' +
    'const title=root?.querySelector(".work-hero-copy h2");' +
    'if(title)title.textContent=' + JSON.stringify(zh ? "移动端 TeX 工作台" : "TeX Workbench on mobile") + ';' +
    'const intro=root?.querySelector(".work-hero-copy .work-hero-description");' +
    'if(intro)intro.textContent=' + JSON.stringify(zh ? "使用手机或 iPad 编辑项目，并在需要时申请远程编译额度；本机连接组件只需在电脑上安装。" : "Edit projects on a phone or iPad and use remote compilation when needed. The local connection component belongs on a computer.") + ';' +
    '})();</script>';
  return output;
}
