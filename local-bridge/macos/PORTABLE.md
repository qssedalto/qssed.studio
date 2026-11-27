# AERTEX Bridge — 便携版 macOS App

**0.5.6 预览版**，只需 `AERTEX Bridge.app`，不使用 PKG 安装器。

## 安装与运行

1. 下载 `AERTEX-Bridge-0.5.6-macOS-portable.zip`，双击解压出 `AERTEX Bridge.app`。
2. **自由选择放置位置**：内置磁盘、`/Volumes/Macintosh SSD/Applications/`、其他可写磁盘或任意文件夹均可。无需安装至系统盘。
3. 首次启动时，若 macOS 阻止未公证的应用，请先确认来源，然后通过系统设置 → 隐私与安全性 → 仍要打开（如果系统提供）允许该 App。不要关闭整台 Mac 的 Gatekeeper。
4. 在管理窗口点击「启动服务并登录自启」。这会在 **当前用户** 的 `~/Library/LaunchAgents/com.aertex.bridge.portable.plist` 登记服务，不需要管理员密码，不修改 `/Library/LaunchAgents`。
5. 窗口可以关闭，后台 Bridge 继续运行。访问 `https://work.qsseda.com` 使用服务。
6. 若把 App 移动到新位置，重新打开并点击「启动服务并登录自启」，以更新可执行文件路径。**移动到外置磁盘后须保证登录启动时磁盘已挂载**。
7. 删除 App 前点击「停止并取消自启」，避免留下指向不存在 App 路径的登录项。

如果系统已有旧版 PKG Bridge 运行、占用了 `127.0.0.1:32145`，请先停止或卸载旧版；便携版不会结束其他进程来抢占端口。

MacTeX、TeX Live 单独安装；只检查 Bridge 运行不需要 TeX，但编译 PDF 必须有可用的 XeLaTeX 或 pdfLaTeX。

## 免费 Apple Development 签名：仅供本机使用

可使用已经存在的 **Apple Development** 个人开发证书在自己的 Mac 上签署下载后的 App。请在 Mac 上运行，而不是在 GitHub 云端运行：你的私钥留在本机钥匙串。

### 第一步：确认身份

~~~zsh
security find-identity -v -p codesigning
~~~

应看到 `Apple Development: ...` 且身份有效。

### 第二步：为内嵌 Go 后端和外层 App 分别签名

注意替换 `APP` 为你的实际放置位置。这一行默认使用你已创建的外置 SSD 应用目录。

~~~zsh
APP="/Volumes/Macintosh SSD/Applications/AERTEX Bridge.app"; ID="$(security find-identity -v -p codesigning | sed -n 's/.*"\(Apple Development:[^"]*\)".*/\1/p' | head -n 1)"; test -d "$APP" && test -n "$ID" && codesign --force --sign "$ID" --identifier "com.aertex.bridge.portable.engine" "$APP/Contents/Resources/AERTEX-Bridge" && codesign --force --sign "$ID" "$APP" && codesign --verify --deep --strict --verbose=2 "$APP"
~~~

这不会签名 PKG，因为便携版根本没有 PKG。签名成功后也可以查看：

~~~zsh
codesign -dv --verbose=4 "/Volumes/Macintosh SSD/Applications/AERTEX Bridge.app" 2>&1
~~~

**重要**：Apple Development 签名适合本机开发与测试，**不能**用于 Developer ID 公证或向其他用户提供普通可信的互联网下载安装体验。个人本机首次启动仍可能遇到 Gatekeeper 安全提示。

正式分发若要无这类提示，需付费 Apple Developer Program、Developer ID Application、Hardened Runtime 和苹果公证；目前不需要为了个人自用升级付费计划。

官方资料：https://developer.apple.com/developer-id/

## 状态与诊断

~~~zsh
curl -fsS http://127.0.0.1:32145/health
curl -fsS http://127.0.0.1:32145/tex/status
~~~

管理窗口提供刷新、查看日志、登录启动和停止。服务只监听 `127.0.0.1:32145`，不会开放公网监听端口。
