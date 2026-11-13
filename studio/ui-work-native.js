export function enhanceWorkLocalBridgeNative(markup, zh) {
  let output = String(markup || "");

  output = output
    .replace("连接检查不会发送账号 Cookie、Bearer Token 或文档内容。", "连接检查不会发送你的账号凭据或文档内容。")
    .replace("Connection checks do not send account cookies, bearer tokens, or document content.", "Connection checks do not send your account credentials or document content.");

  const nativeButton = `<a class="work-button secondary" id="work-native-bridge-download" href="/api/work/bridge/windows" download="AERTEX-Bridge-Setup.exe" data-qsseda-native-bridge-download="1">${zh ? "安装 Windows 连接组件" : "Install Windows component"}</a>`;
  const guideHref = `https://qsseda.com/${zh ? "zh-cn" : "en-us"}/q/ac429c78-7e82-4cea-9b12-90188b0c0c60`;
  const texliveButton = `<span class="work-texlive-download-group" id="work-native-texlive-group"><span class="work-texlive-action-row"><a class="work-button secondary" id="work-native-texlive-download" href="https://1drv.ms/u/c/45a22b56b9646fc7/IQDExSUns1FzR6M3luj0QRQaAZ8Pc6frUc6zaYEr-Qnexvo?e=w9mHFn" target="_blank" rel="noopener noreferrer">${zh ? "下载 TeX Live（ISO）" : "Download TeX Live (ISO)"}</a><a class="work-texlive-help-link" id="work-native-texlive-guide" href="${guideHref}" target="_blank" rel="noopener noreferrer">${zh ? "安装前必读：组件使用指南 ↗" : "Setup guide for both components ↗"}</a></span><small class="work-texlive-prerequisite">${zh ? "此为 Windows 连接组件使用的前置条件，请先安装完此内容再打开 Windows 连接组件。" : "This is a prerequisite for the Windows connection component. Please complete the installation before opening the Windows component."}</small></span>`;
  output = output.replace("<!--QSSedaWorkNativeAction-->", nativeButton + texliveButton);
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
      @media(max-width:560px){
        #work-local-root .work-texlive-download-group{width:100%;flex-basis:100%}
        #work-local-root .work-texlive-action-row{width:100%}
        #work-local-root .work-texlive-action-row>.work-button{width:100%}
      }
    </style>`;

  // Keep the version-update alert in the hero; remove the two redundant informational cards.
  const nativeNote = `<div class="work-connection-message" id="work-bridge-upgrade-note" hidden>${zh ? "检测到连接组件版本较旧。请安装新版后重新检查连接。" : "This connection component is out of date. Install the latest version, then check the connection again."}</div>`;
  output = output.replace("<!--QSSedaWorkNativeNote-->", nativeNote);

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
        if (!version || !note || !download || !texliveDownload) return;

        const isWindows = /Windows/i.test(navigator.userAgent || "");
        download.hidden = !isWindows;
        texliveDownload.hidden = !isWindows;
        if (texliveGroup) texliveGroup.hidden = !isWindows;

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
        };

        new MutationObserver(syncUpgradeState).observe(version, { childList: true, subtree: true, characterData: true });
        if (statusCard) new MutationObserver(syncUpgradeState).observe(statusCard, { attributes: true, attributeFilter: ["class"] });
        syncUpgradeState();
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
