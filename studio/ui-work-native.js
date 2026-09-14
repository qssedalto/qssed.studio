export function enhanceWorkLocalBridgeNative(markup, zh) {
  let output = String(markup || "");
  const detectLabel = zh ? "检测本机服务" : "Detect local service";
  const detectButton = `<button class="work-button primary" id="work-local-connect" type="button">${detectLabel}</button>`;
  const nativeButton = `<a class="work-button secondary" href="/api/work/bridge/windows" download="QssedA-Local-Bridge.exe" data-qsseda-native-bridge-download="1">${zh ? "下载 Windows Bridge" : "Download Windows Bridge"}</a>`;
  output = output.replace(detectButton, detectButton + nativeButton);

  const permissionCopy = zh
    ? "浏览器可能会询问是否允许访问本机网络；只允许你确认是 QssedA Studio 发起的请求。"
    : "Your browser may ask for permission to access the local device. Only allow it when you confirm the request came from QssedA Studio.";
  const nativeCopy = zh
    ? "Windows 版 Bridge 是独立 EXE：双击一次即可安装并注册当前用户自动启动，不要求安装 Node.js，也不需要 PowerShell。"
    : "The Windows Bridge is a standalone EXE. Run it once to install per-user autostart; Node.js and PowerShell are not required.";
  output = output.replace(
    `<p class="work-note">${permissionCopy}</p>`,
    `<p class="work-note">${permissionCopy}</p><p class="work-note" data-qsseda-native-bridge-note="1">${nativeCopy}</p>`
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

  return output;
}
