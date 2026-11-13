# AERTEX Bridge 原版内核 + 安装包

这个目录是**真正的 Windows 安装包**：从用户原版轻量 EXE 对应的 Go 内核（仓库提交 `d5e4cfd`）构建本地服务，再用 Inno Setup 打包为 **`AERTEX-Bridge-Setup.exe`**。

原版参照文件来自用户上传的 `AERTEX-Bridge.zip`，归档中仅有 `AERTEX-Bridge.exe`（7,529,984 字节）；原版 SHA-256 为：

```
62a81a095a8294a963c18ae4bcfa46db4b926d75c7535c28af5fb80f493f150a
```

原版 Go build info 内版本号：`0.3.0-d5e4cfd`。这里的 `original-engine/` 完整复制仓库当时对应的 Go 源文件；构建输出是**从同一源码重新编译**，不宣称与用户上传的 PE 字节完全相同。内核 HTTP 服务、TeX API、Origin 保护以及编译行为不做修改。

## 安装行为

- 下载的文件是安装器，不是放在下载目录运行的便携程序。
- 默认且固定安装到当前 Windows 用户的 `%LOCALAPPDATA%\QssedA\LocalBridge\`，不要求管理员。
- 安装必须写入 `HKCU\Software\Microsoft\Windows\CurrentVersion\Run\AERTEX Bridge`，登录此 Windows 账户后自动启动 `AERTEX-Bridge.exe --background`。
- 安装结束立即启动内核，并验证本地 `http://127.0.0.1:32145/health`、实际进程路径和版本。无法验证则报告失败，不伪装成功。
- 升级只停止安装目录里确切的进程；不会仅因端口被占用就结束任何不相关程序。
- Windows「已安装的应用」中有独立卸载项，卸载时停止服务并删除自启动项。
- 诊断信息写在 `%LOCALAPPDATA%\QssedA\LocalBridge\install.log`，不会记录账号或文档内容。

启动项由 Windows 管理，**用户或系统策略仍可禁用**；这是每次**登录用户账户**后的自动启动，而不是登录前的 Windows Service。不能绕过 Windows 管理员或用户的启动控制。

## 测试和发布

GitHub Actions 在 `windows-latest` 中运行 Go vet 和 Inno Setup，真实运行安装器，验证原版 /health、/tex/status、注册表启动项、原地升级、模拟登录后重启和完整卸载。全部通过后，才会将完整安装器覆盖到 R2 中的原有对象。

下载 URL **保持不变**：`https://qsseda.com/api/work/bridge/windows`。服务端改为返回 `AERTEX-Bridge-Setup.exe`，旧下载内容会在新安装包通过验证后替换。
