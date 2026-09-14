export function enhanceWorkLocalBridgeNative(markup, zh) {
  let output = String(markup || "");
  const detectLabel = zh ? "检测本机服务" : "Detect local service";
  const detectButton = `<button class="work-button primary" id="work-local-connect" type="button">${detectLabel}</button>`;
  const nativeButton = `<a class="work-button secondary" id="work-native-bridge-download" href="/api/work/bridge/windows" download="QssedA-Local-Bridge.exe" data-qsseda-native-bridge-download="1">${zh ? "下载 Windows Bridge" : "Download Windows Bridge"}</a>`;
  output = output.replace(detectButton, detectButton + nativeButton);

  const permissionCopy = zh
    ? "浏览器可能会询问是否允许访问本机网络；只允许你确认是 QssedA Studio 发起的请求。"
    : "Your browser may ask for permission to access the local device. Only allow it when you confirm the request came from QssedA Studio.";
  const nativeCopy = zh
    ? "Windows 版 Bridge 是独立 EXE：双击一次即可安装并注册当前用户自动启动，不要求安装 Node.js，也不需要 PowerShell。新版安装程序会先停止已验证的旧 Bridge，再替换并重新启动，避免旧进程继续占用 32145。"
    : "The Windows Bridge is a standalone EXE. Run it once to install per-user autostart; Node.js and PowerShell are not required. New installers stop a verified older Bridge before replacing and restarting it, so the old process cannot keep port 32145.";
  const upgradeCopy = zh
    ? "检测到当前 Bridge 是 Work 子域名启用前的旧版本。它能连接 qsseda.studio，但会拒绝 work.qsseda.studio，因此 TeX 工作台会显示“未连接”。请更新 Windows Bridge，运行新版 EXE 后再检测。"
    : "This Bridge predates the Work subdomain. It can connect to qsseda.studio but rejects work.qsseda.studio, so the TeX Workbench appears offline. Update the Windows Bridge, run the new EXE, then check again.";
  output = output.replace(
    `<p class="work-note">${permissionCopy}</p>`,
    `<p class="work-note">${permissionCopy}</p><p class="work-note" data-qsseda-native-bridge-note="1">${nativeCopy}</p><p class="work-note" id="work-bridge-upgrade-note" hidden>${upgradeCopy}</p>`
  );

  output = output.replace(
    "void autoProbeWhenAlreadyAllowed();",
    "window.setTimeout(() => void probe(), 260);"
  );

  const oldOfflineZh = "无法连接 127.0.0.1:32145。请先启动 QssedA Local Bridge，或检查浏览器的本机网络权限。";
  const oldOfflineEn = "Could not reach 127.0.0.1:32145. Start QssedA Local Bridge or check the browser's local-network permission.";
  const newOfflineZh = "无法连接 127.0.0.1:32145。若尚未安装，请下载 Windows Bridge 并双击运行一次；已安装时请检查浏览器的本机网络权限。";
  const newOfflineEn = "Could not reach 127.0.0.1:32145. If the Bridge is not installed, download the Windows EXE and run it once; otherwise check the browser's local-network permission.";
  output = output.replace(oldOfflineZh, newOfflineZh).replace(oldOfflineEn, newOfflineEn);

  output = output.replace(
    "</script>",
    `
      (() => {
        const incompatibleBuilds = ["0.3.0-d642c4b"];
        const version = document.getElementById("work-local-version");
        const note = document.getElementById("work-bridge-upgrade-note");
        const download = document.getElementById("work-native-bridge-download");
        if (!version || !note || !download) return;
        const syncUpgradeState = () => {
          const text = String(version.textContent || "");
          const incompatible = incompatibleBuilds.some(build => text.includes(build));
          note.hidden = !incompatible;
          download.textContent = incompatible
            ? ${JSON.stringify(zh ? "更新 Windows Bridge" : "Update Windows Bridge")}
            : ${JSON.stringify(zh ? "下载 Windows Bridge" : "Download Windows Bridge")};
        };
        new MutationObserver(syncUpgradeState).observe(version, { childList: true, subtree: true, characterData: true });
        syncUpgradeState();
      })();
    </script>`
  );

  return output;
}
