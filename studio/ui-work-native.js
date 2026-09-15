export function enhanceWorkLocalBridgeNative(markup, zh) {
  let output = String(markup || "");

  output = output
    .replace("连接检查不会发送账号 Cookie、Bearer Token 或文档内容。", "连接检查不会发送你的账号凭据或文档内容。")
    .replace("Connection checks do not send account cookies, bearer tokens, or document content.", "Connection checks do not send your account credentials or document content.");

  const nativeButton = `<a class="work-button secondary" id="work-native-bridge-download" href="/api/work/bridge/windows" download="QssedA-Local-Bridge.exe" data-qsseda-native-bridge-download="1">${zh ? "安装 Windows 连接组件" : "Install Windows component"}</a>`;
  output = output.replace("<!--QSSedaWorkNativeAction-->", nativeButton);

  const nativeNote = zh
    ? `<details class="work-details" id="work-native-install-details"><summary>Windows 安装说明</summary><div class="work-detail-grid"><div><span>安装</span><span>下载后双击一次即可</span></div><div><span>启动</span><span>以后随当前用户自动启动</span></div><div><span>依赖</span><span>不要求安装 Node.js，也不需要 PowerShell</span></div></div></details><div class="work-connection-message" id="work-bridge-upgrade-note" hidden>检测到连接组件版本较旧。请安装新版后重新检查连接。</div>`
    : `<details class="work-details" id="work-native-install-details"><summary>Windows installation</summary><div class="work-detail-grid"><div><span>Install</span><span>Download and run once</span></div><div><span>Startup</span><span>Starts automatically for this user</span></div><div><span>Dependencies</span><span>No Node.js or PowerShell required</span></div></div></details><div class="work-connection-message" id="work-bridge-upgrade-note" hidden>This connection component is out of date. Install the latest version, then check the connection again.</div>`;
  output = output.replace("<!--QSSedaWorkNativeNote-->", nativeNote);

  output = output.replace(
    "void autoProbeWhenAlreadyAllowed();",
    "window.setTimeout(() => void probe(), 260);"
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
        const installDetails = document.getElementById("work-native-install-details");
        if (!version || !note || !download) return;

        const isWindows = /Windows/i.test(navigator.userAgent || "");
        download.hidden = !isWindows;
        if (installDetails) installDetails.hidden = !isWindows;

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

  return output;
}
