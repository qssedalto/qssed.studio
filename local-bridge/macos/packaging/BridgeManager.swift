import AppKit
import SwiftUI

// Optional user-facing companion. The actual Bridge remains a per-user launchd service.
@main
struct AERTEXBridgeManagerApp: App {
    var body: some Scene {
        WindowGroup("AERTEX Bridge") {
            BridgeManagerView()
        }
        .windowResizability(.contentSize)
    }
}

@MainActor
private struct BridgeManagerView: View {
    @State private var bridgeState = "Checking..."
    @State private var texState = "Checking..."
    @State private var detail = ""
    @State private var busy = false

    private var chinese: Bool {
        Locale.preferredLanguages.first?.lowercased().hasPrefix("zh") ?? false
    }

    private func localized(_ zh: String, _ en: String) -> String {
        chinese ? zh : en
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack(spacing: 16) {
                Image(nsImage: NSApp.applicationIconImage)
                    .resizable()
                    .interpolation(.high)
                    .frame(width: 72, height: 72)
                VStack(alignment: .leading, spacing: 5) {
                    Text("AERTEX Bridge")
                        .font(.system(size: 23, weight: .bold))
                    Text(localized("本地 LaTeX 编译桥接服务", "Local LaTeX compilation bridge"))
                        .foregroundColor(.secondary)
                }
            }

            Divider()

            HStack {
                Text(localized("桥接服务", "Bridge service"))
                    .fontWeight(.semibold)
                Spacer()
                Text(bridgeState).foregroundColor(.secondary)
            }
            HStack {
                Text(localized("TeX 环境", "TeX environment"))
                    .fontWeight(.semibold)
                Spacer()
                Text(texState).foregroundColor(.secondary)
            }
            if !detail.isEmpty {
                Text(detail)
                    .font(.system(size: 12))
                    .foregroundColor(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
                    .textSelection(.enabled)
            }

            HStack {
                Button(localized("刷新状态", "Refresh")) {
                    Task { await refresh() }
                }
                .disabled(busy)
                Button(localized("启动／重启服务", "Start / Restart")) {
                    restart()
                }
                .disabled(busy)
                Spacer()
                Button(localized("打开工作台", "Open Work")) {
                    if let url = URL(string: "https://work.qsseda.com") {
                        NSWorkspace.shared.open(url)
                    }
                }
            }
            HStack {
                Button(localized("查看日志", "View Logs")) {
                    let url = FileManager.default.homeDirectoryForCurrentUser
                        .appendingPathComponent("Library/Logs/AERTEX Bridge")
                    try? FileManager.default.createDirectory(at: url, withIntermediateDirectories: true)
                    NSWorkspace.shared.open(url)
                }
                .buttonStyle(.link)
                Spacer()
                Text(localized("无需持续打开此窗口", "You can close this window; the service keeps running."))
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
            }
        }
        .padding(26)
        .frame(width: 490)
        .task { await refresh() }
    }

    private func fetch(_ path: String) async throws -> [String: Any] {
        guard let url = URL(string: "http://127.0.0.1:32145" + path) else {
            throw URLError(.badURL)
        }
        var request = URLRequest(url: url)
        request.timeoutInterval = 3
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200,
              let result = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw URLError(.badServerResponse)
        }
        return result
    }

    private func refresh() async {
        busy = true
        defer { busy = false }

        do {
            let health = try await fetch("/health")
            guard health["service"] as? String == "qsseda-local-bridge",
                  health["runtime"] as? String == "native-macos",
                  health["protocol"] as? Int == 1 else {
                bridgeState = localized("端口被其他程序占用", "Unexpected service on port 32145")
                texState = localized("未检测", "Not checked")
                return
            }
            bridgeState = localized("正在运行", "Running")
            detail = localized("版本：", "Version: ") + (health["version"] as? String ?? "unknown")
            let tex = try await fetch("/tex/status")
            let engines = (tex["engines"] as? [String] ?? []).joined(separator: ", ")
            texState = engines.isEmpty ? localized("未找到 MacTeX / TeX Live", "MacTeX / TeX Live not found") : engines
        } catch {
            bridgeState = localized("未连接", "Not responding")
            texState = localized("未检测", "Not checked")
            detail = localized("可尝试点击「启动／重启服务」，或重新登录 macOS。", "Try Start / Restart, or sign out and back in.")
        }
    }

    private func restart() {
        busy = true
        let service = "gui/\(getuid())/com.aertex.bridge"
        let plist = "/Library/LaunchAgents/com.aertex.bridge.plist"
        let bootstrap = Process()
        bootstrap.executableURL = URL(fileURLWithPath: "/bin/launchctl")
        bootstrap.arguments = ["bootstrap", "gui/\(getuid())", plist]
        // Bootstrap may fail if the job is already loaded; kickstart covers that case.
        try? bootstrap.run()
        bootstrap.waitUntilExit()

        let kickstart = Process()
        kickstart.executableURL = URL(fileURLWithPath: "/bin/launchctl")
        kickstart.arguments = ["kickstart", "-k", service]
        do {
            try kickstart.run()
            kickstart.waitUntilExit()
            if kickstart.terminationStatus != 0 {
                detail = localized("无法启动服务，请检查安装和登录项。", "Could not start the service; check the installation and login agent.")
            }
        } catch {
            detail = error.localizedDescription
        }
        busy = false
        Task {
            try? await Task.sleep(nanoseconds: 900_000_000)
            await refresh()
        }
    }
}
