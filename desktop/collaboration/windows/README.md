# QssedA Collaboration for Windows

`QssedA-Collaboration.exe` 是 QssedA Windows 协作入口的第一阶段实现。它不把浏览器、Bridge 和 TeX Runtime 强耦合在一起，而是负责发现本机能力、启动 Local Bridge，然后打开 QssedA Studio。

## 当前职责

- 检测 `127.0.0.1:32145` 上的 QssedA Local Bridge；
- Bridge 未运行时，从协作程序旁边、`bridge/` 或 `%LOCALAPPDATA%\QssedA\LocalBridge` 查找 `QssedA-Local-Bridge.exe`；
- 自动寻找移动盘根目录中的 `QssedA-TeX-Portable\texlive\bin\windows\xelatex.exe`；
- 找到便携 TeX 后，通过 `QSSEDA_XELATEX` / `QSSEDA_PDFLATEX` 只传给新启动的 Bridge 进程，不修改系统 PATH；
- 默认打开 QssedA Work；
- `--tex` 直接打开 TeX Workbench；
- `--bridge-only` 只启动 Bridge；
- `--status` 显示 Bridge / TeX 状态。

## 推荐测试目录

```text
QssedA-Test/
├─ QssedA-Collaboration.exe
├─ QssedA-Local-Bridge.exe
└─ QssedA-TeX-Portable/
   └─ texlive/
      └─ bin/
         └─ windows/
            ├─ xelatex.exe
            └─ pdflatex.exe
```

也支持 Portable Runtime 位于移动盘根目录，例如：

```text
E:\QssedA-TeX-Portable\...
```

即使协作程序位于其他目录，它也会扫描 `C:` 到 `Z:` 的固定根路径，不依赖原来的 `F:` 盘符。

## 安全边界

- 协作程序不提供任意命令执行接口；
- 只会启动固定名称的 `QssedA-Local-Bridge.exe --background`；
- 不修改系统 PATH；
- 不写 HKLM；
- Portable TeX 路径只通过子进程环境变量传给 Bridge；
- 真正的 TeX 编译仍由 Bridge 的固定 `/tex/compile` 能力处理，并继续使用 `-no-shell-escape`。

## 后续封装

最终安装包可以统一包含：

```text
QssedA Setup.exe
├─ QssedA-Collaboration.exe
├─ QssedA-Local-Bridge.exe
└─ QssedA TeX Runtime（可选）
```

安装器负责部署；协作程序负责运行时发现和启动。这样 Portable Runtime、系统 TeX 和未来内置 Runtime 可以共用同一个协作入口。
