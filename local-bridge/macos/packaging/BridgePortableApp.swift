import AppKit
import SwiftUI

// Self-contained, drag-and-drop edition of AERTEX Bridge.
// It never writes to /Library, /Applications or other system locations.
@main
struct AERTEXPortableApp: App {
    var body: some Scene {
        WindowGroup("AERTEX Bridge") {
            PortableBridgeView()
        }
    }
}

@MainActor
private final class PortableBridge: ObservableObject {
    @Published var serviceStatus = "Checking..."
    @Published var texStatus = "Checking..."
    @Published var httpsStatus = "Checking..."
    @Published var detail = ""
    @Published var isBusy = false
    @Published var isManaged = false

    private let label = "com.aertex.bridge.portable"
    private let expectedVersion = "0.5.7-macos"

    var chinese: Bool {
        Locale.preferredLanguages.first?.lowercased().hasPrefix("zh") ?? false
    }

    func localized(_ zh: String, _ en: String) -> String {
        chinese ? zh : en
    }

    private var executable: URL? {
        Bundle.main.resourceURL?.appendingPathComponent("AERTEX-Bridge")
    }

    private var launchAgent: URL {
        FileManager.default.homeDirectoryForCurrentUser
            .appendingPathComponent("Library/LaunchAgents/\(label).plist")
    }

    private var launchDomain: String {
        "gui/\(getuid())"
    }

    private var launchJob: String {
        "\(launchDomain)/\(label)"
    }

    private func runLaunchctl(_ arguments: [String]) throws {
        let command = Process()
        command.executableURL = URL(fileURLWithPath: "/bin/launchctl")
        command.arguments = arguments
        let errorOutput = Pipe()
        command.standardError = errorOutput
        try command.run()
        command.waitUntilExit()
        if command.terminationStatus != 0 {
            let bytes = errorOutput.fileHandleForReading.readDataToEndOfFile()
            let message = String(data: bytes, encoding: .utf8) ?? "launchctl failed"
            throw NSError(domain: "AERTEXBridge", code: Int(command.terminationStatus),
                          userInfo: [NSLocalizedDescriptionKey: message])
        }
    }

    private func getJSON(_ path: String) async throws -> [String: Any] {
        let url = URL(string: "http://127.0.0.1:32145" + path)!
        var request = URLRequest(url: url)
        request.timeoutInterval = 3
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200,
              let value = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw URLError(.badServerResponse)
        }
        return value
    }

    private func getHTTPSHealth() async throws -> [String: Any] {
        guard let url = URL(string: "https://127.0.0.1:32146/health") else { throw URLError(.badURL) }
        var request = URLRequest(url: url)
        request.timeoutInterval = 2
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200,
              let value = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw URLError(.badServerResponse)
        }
        return value
    }

    func refresh() async {
        isBusy = true
        defer { isBusy = false }
        isManaged = FileManager.default.fileExists(atPath: launchAgent.path)
        do {
            let health = try await getJSON("/health")
            guard health["service"] as? String == "qsseda-local-bridge",
                  health["runtime"] as? String == "native-macos",
                  health["protocol"] as? Int == 1 else {
                serviceStatus = localized("32145 端口不是 AERTEX Bridge", "Port 32145 is not AERTEX Bridge")
                texStatus = localized("未检测", "Not checked")
                detail = localized("请先检查其他占用该端口的程序。", "Check which application owns port 32145.")
                return
            }
            let version = health["version"] as? String ?? "unknown"
            if version == expectedVersion {
                serviceStatus = localized("运行正常", "Running")
                detail = localized("当前版本：", "Running version: ") + version
            } else {
                serviceStatus = localized("发现其他 Bridge 版本", "Other Bridge version running")
                detail = localized("端口 32145 正在由版本 ", "Port 32145 belongs to version ") + version +
                    localized(" 使用。请先停止旧版服务再启动便携版。", ". Stop the old service before starting the portable version.")
            }
            // The HTTPS endpoint is optional. The native manager still uses the
            // original HTTP listener, so a missing cert never breaks the App.
            if let tls = try? await getHTTPSHealth(),
               tls["service"] as? String == "qsseda-local-bridge",
               tls["runtime"] as? String == "native-macos" {
                httpsStatus = localized("已启用 · Safari 可连接", "Ready · Safari compatible")
            } else {
                httpsStatus = localized("未配置可信本机证书", "Trusted local certificate not configured")
            }
            let tex = try await getJSON("/tex/status")
            let engines = (tex["engines"] as? [String] ?? []).joined(separator: ", ")
            texStatus = engines.isEmpty
                ? localized("未发现 MacTeX / TeX Live", "MacTeX / TeX Live not found")
                : engines
        } catch {
            serviceStatus = localized("服务未启动", "Service not running")
            texStatus = localized("未检测", "Not checked")
            httpsStatus = localized("未连接", "Not connected")
            detail = localized("点击「启动服务」，无需管理员密码。", "Click Start Service; no administrator password is required.")
        }
    }

    func start() async {
        isBusy = true
        defer { isBusy = false }
        guard let executable, FileManager.default.isExecutableFile(atPath: executable.path) else {
            detail = localized("App 内未找到可执行的 Bridge，请重新下载完整版。", "Embedded Bridge binary is missing; re-download the complete app.")
            return
        }
        // Avoid running two Bridge versions on the same localhost port.
        if let health = try? await getJSON("/health") {
            let version = health["version"] as? String ?? "unknown"
            if version != expectedVersion {
                detail = localized("检测到另一版本（", "Another Bridge version (") + version +
                    localized("）正在运行。请先卸载／停止旧版。", ") is running; stop or uninstall it first.")
                return
            }
        }

        let home = FileManager.default.homeDirectoryForCurrentUser
        let logFolder = home.appendingPathComponent("Library/Logs/AERTEX Bridge", isDirectory: true)
        do {
            try FileManager.default.createDirectory(at: launchAgent.deletingLastPathComponent(),
                                                     withIntermediateDirectories: true)
            try FileManager.default.createDirectory(at: logFolder, withIntermediateDirectories: true)
            let plist: [String: Any] = [
                "Label": label,
                "ProgramArguments": [executable.path, "--background"],
                "RunAtLoad": true,
                "KeepAlive": ["SuccessfulExit": false],
                "ProcessType": "Background",
                "StandardOutPath": "/dev/null",
                "StandardErrorPath": logFolder.appendingPathComponent("service-stderr.log").path
            ]
            let contents = try PropertyListSerialization.data(fromPropertyList: plist,
                                                              format: .xml, options: 0)
            // Re-register on each Start so relocating the .app updates the binary path.
            if FileManager.default.fileExists(atPath: launchAgent.path) {
                try? runLaunchctl(["bootout", launchDomain, launchAgent.path])
            }
            try contents.write(to: launchAgent, options: .atomic)
            try runLaunchctl(["bootstrap", launchDomain, launchAgent.path])
            try runLaunchctl(["kickstart", "-k", launchJob])
            detail = localized("已注册当前用户登录启动。关闭此窗口不会停止服务。",
                               "Enabled login start for this user. Closing this window does not stop the service.")
        } catch {
            detail = localized("启动失败：", "Could not start: ") + error.localizedDescription
        }
        isManaged = FileManager.default.fileExists(atPath: launchAgent.path)
        // Let the daemon bind its port before polling its status.
        try? await Task.sleep(nanoseconds: 900_000_000)
        await refresh()
    }

    func stop() async {
        isBusy = true
        defer { isBusy = false }
        guard FileManager.default.fileExists(atPath: launchAgent.path) else {
            detail = localized("当前用户没有注册便携版服务。", "No portable Bridge service is registered for this user.")
            return
        }
        do {
            // Only remove this bundle's precise launchd label; never kill by port number.
            try? runLaunchctl(["bootout", launchDomain, launchAgent.path])
            try FileManager.default.removeItem(at: launchAgent)
            serviceStatus = localized("服务已停止", "Stopped")
            detail = localized("已取消当前用户的登录启动，App 可以直接移动或删除。",
                               "Login start disabled. You can move or delete the app.")
        } catch {
            detail = localized("停止失败：", "Could not stop: ") + error.localizedDescription
        }
        isManaged = FileManager.default.fileExists(atPath: launchAgent.path)
    }

    func openLogs() {
        let url = FileManager.default.homeDirectoryForCurrentUser
            .appendingPathComponent("Library/Logs/AERTEX Bridge")
        try? FileManager.default.createDirectory(at: url, withIntermediateDirectories: true)
        NSWorkspace.shared.open(url)
    }
}

private struct PortableBridgeView: View {
    @StateObject private var service = PortableBridge()

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack(spacing: 16) {
                Image(nsImage: NSApp.applicationIconImage)
                    .resizable()
                    .interpolation(.high)
                    .frame(width: 76, height: 76)
                VStack(alignment: .leading, spacing: 5) {
                    Text("AERTEX Bridge").font(.system(size: 24, weight: .bold))
                    Text(service.localized("便携版 · 随处拖放 · 无需安装器",
                                           "Portable · Drag anywhere · No installer"))
                        .foregroundColor(.secondary)
                }
            }
            Divider()
            HStack {
                Text(service.localized("桥接服务", "Bridge service")).fontWeight(.semibold)
                Spacer()
                Text(service.serviceStatus).foregroundColor(.secondary)
            }
            HStack {
                Text(service.localized("Safari 安全连接", "Safari HTTPS"))
                    .fontWeight(.semibold)
                Spacer()
                Text(service.httpsStatus).foregroundColor(.secondary)
            }
            HStack {
                Text(service.localized("TeX 环境", "TeX environment")).fontWeight(.semibold)
                Spacer()
                Text(service.texStatus).foregroundColor(.secondary)
            }
            Text(service.detail)
                .font(.system(size: 12))
                .foregroundColor(.secondary)
                .fixedSize(horizontal: false, vertical: true)
                .textSelection(.enabled)
            Divider()
            HStack(spacing: 10) {
                Button(service.localized("启动服务并登录自启", "Start + Login Start")) {
                    Task { await service.start() }
                }.disabled(service.isBusy)
                Button(service.localized("停止并取消自启", "Stop + Disable Login")) {
                    Task { await service.stop() }
                }.disabled(service.isBusy || !service.isManaged)
            }
            HStack {
                Button(service.localized("刷新状态", "Refresh")) {
                    Task { await service.refresh() }
                }.disabled(service.isBusy)
                Button(service.localized("查看日志", "View Logs")) { service.openLogs() }
                Spacer()
                Button(service.localized("打开工作台", "Open Work")) {
                    if let url = URL(string: "https://work.qsseda.com") { NSWorkspace.shared.open(url) }
                }
            }
            Text(service.localized(
                "可将此 App 放在内置或外置磁盘的任何文件夹。移动 App 后重新打开并点击“启动服务”以更新登录项；删除 App 前请点击“停止并取消自启”。",
                "Keep this app on any internal or external volume. After moving it, open it and click Start to refresh the login agent. Click Stop before deleting it."
            ))
                .font(.system(size: 11))
                .foregroundColor(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(26)
        .frame(width: 540)
        .task { await service.refresh() }
    }
}
