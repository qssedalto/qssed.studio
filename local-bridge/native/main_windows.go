package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
	"syscall"
	"time"
	"unsafe"
)

const (
	bridgeHost    = "127.0.0.1"
	bridgePort    = "32145"
	bridgeService = "qsseda-local-bridge"
	protocol      = 1
	appName       = "QssedA Local Bridge"
	exeName       = "QssedA-Local-Bridge.exe"
)

var version = "0.2.0-dev"

var allowedOrigins = map[string]bool{
	"https://qsseda.studio":     true,
	"https://www.qsseda.studio": true,
}

func main() {
	args := os.Args[1:]
	if hasArg(args, "--background") {
		_ = runBridge()
		return
	}
	if hasArg(args, "--uninstall") {
		if err := uninstallAutostart(); err != nil {
			showMessage(appName, "卸载自动启动失败：\n"+err.Error(), true)
			return
		}
		showMessage(appName, "已移除 QssedA Local Bridge 的自动启动。\n已安装的 EXE 会保留在本机，便于检查或手动删除。", false)
		return
	}

	installedExe, err := installSelf()
	if err != nil {
		showMessage(appName, "安装失败：\n"+err.Error(), true)
		return
	}
	_ = launchBackground(installedExe)

	tex := findXeLaTeX()
	message := "QssedA Local Bridge 已安装。\n\n以后登录 Windows 后会自动在后台启动，不需要 Node.js，也不需要 PowerShell。"
	if tex != "" {
		message += "\n\n已检测到 XeLaTeX：\n" + tex
	} else {
		message += "\n\n暂未检测到 XeLaTeX；Bridge 本身仍可正常运行。"
	}
	showMessage(appName, message, false)
}

func hasArg(args []string, target string) bool {
	for _, arg := range args {
		if strings.EqualFold(strings.TrimSpace(arg), target) {
			return true
		}
	}
	return false
}

func installSelf() (string, error) {
	localAppData := strings.TrimSpace(os.Getenv("LOCALAPPDATA"))
	if localAppData == "" {
		return "", errors.New("LOCALAPPDATA is unavailable")
	}
	installDir := filepath.Join(localAppData, "QssedA", "LocalBridge")
	if err := os.MkdirAll(installDir, 0o755); err != nil {
		return "", fmt.Errorf("create install directory: %w", err)
	}

	currentExe, err := os.Executable()
	if err != nil {
		return "", fmt.Errorf("locate current executable: %w", err)
	}
	currentExe, _ = filepath.Abs(currentExe)
	installedExe := filepath.Join(installDir, exeName)

	if !samePath(currentExe, installedExe) {
		if err := copyFile(currentExe, installedExe); err != nil {
			return "", fmt.Errorf("copy bridge executable: %w", err)
		}
	}

	runValue := fmt.Sprintf("\"%s\" --background", installedExe)
	if err := regAdd(`HKCU\Software\Microsoft\Windows\CurrentVersion\Run`, appName, runValue); err != nil {
		return "", fmt.Errorf("register autostart: %w", err)
	}

	uninstallKey := `HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\QssedALocalBridge`
	_ = regAdd(uninstallKey, "DisplayName", appName)
	_ = regAdd(uninstallKey, "DisplayVersion", version)
	_ = regAdd(uninstallKey, "Publisher", "QssedA")
	_ = regAdd(uninstallKey, "InstallLocation", installDir)
	_ = regAdd(uninstallKey, "UninstallString", fmt.Sprintf("\"%s\" --uninstall", installedExe))
	_ = regAdd(uninstallKey, "NoModify", "1")
	_ = regAdd(uninstallKey, "NoRepair", "1")

	return installedExe, nil
}

func uninstallAutostart() error {
	var errs []string
	if err := regDeleteValue(`HKCU\Software\Microsoft\Windows\CurrentVersion\Run`, appName); err != nil {
		errs = append(errs, err.Error())
	}
	if err := regDeleteKey(`HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\QssedALocalBridge`); err != nil {
		errs = append(errs, err.Error())
	}
	if len(errs) > 0 {
		return errors.New(strings.Join(errs, "; "))
	}
	return nil
}

func regAdd(key, name, value string) error {
	cmd := exec.Command("reg.exe", "add", key, "/v", name, "/t", "REG_SZ", "/d", value, "/f")
	hideWindow(cmd)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("reg add %s: %v (%s)", name, err, strings.TrimSpace(string(out)))
	}
	return nil
}

func regDeleteValue(key, name string) error {
	cmd := exec.Command("reg.exe", "delete", key, "/v", name, "/f")
	hideWindow(cmd)
	out, err := cmd.CombinedOutput()
	if err != nil && !strings.Contains(strings.ToLower(string(out)), "unable to find") {
		return fmt.Errorf("reg delete value: %v (%s)", err, strings.TrimSpace(string(out)))
	}
	return nil
}

func regDeleteKey(key string) error {
	cmd := exec.Command("reg.exe", "delete", key, "/f")
	hideWindow(cmd)
	out, err := cmd.CombinedOutput()
	if err != nil && !strings.Contains(strings.ToLower(string(out)), "unable to find") {
		return fmt.Errorf("reg delete key: %v (%s)", err, strings.TrimSpace(string(out)))
	}
	return nil
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	tmp := dst + ".new"
	out, err := os.Create(tmp)
	if err != nil {
		return err
	}
	_, copyErr := io.Copy(out, in)
	closeErr := out.Close()
	if copyErr != nil {
		_ = os.Remove(tmp)
		return copyErr
	}
	if closeErr != nil {
		_ = os.Remove(tmp)
		return closeErr
	}
	_ = os.Remove(dst)
	if err := os.Rename(tmp, dst); err != nil {
		_ = os.Remove(tmp)
		return err
	}
	return nil
}

func samePath(a, b string) bool {
	return strings.EqualFold(filepath.Clean(a), filepath.Clean(b))
}

func launchBackground(executable string) error {
	// If a bridge already owns the port, there is nothing to launch.
	conn, err := net.DialTimeout("tcp", net.JoinHostPort(bridgeHost, bridgePort), 250*time.Millisecond)
	if err == nil {
		_ = conn.Close()
		return nil
	}
	cmd := exec.Command(executable, "--background")
	hideWindow(cmd)
	return cmd.Start()
}

func runBridge() error {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", handleHealth)
	mux.HandleFunc("/tex/status", handleTexStatus)

	server := &http.Server{
		Addr:              net.JoinHostPort(bridgeHost, bridgePort),
		Handler:           secureHandler(mux),
		ReadHeaderTimeout: 3 * time.Second,
		ReadTimeout:       5 * time.Second,
		WriteTimeout:      5 * time.Second,
		IdleTimeout:       30 * time.Second,
	}
	return server.ListenAndServe()
}

func secureHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		host := strings.ToLower(strings.TrimSpace(r.Host))
		if host != "127.0.0.1:32145" && host != "localhost:32145" {
			sendJSON(w, http.StatusMisdirectedRequest, map[string]any{"error": "Unrecognized local host."})
			return
		}

		origin := strings.TrimSpace(r.Header.Get("Origin"))
		if origin != "" && !allowedOrigins[origin] {
			sendJSON(w, http.StatusForbidden, map[string]any{"error": "Origin is not allowed."})
			return
		}

		if origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Add("Vary", "Origin")
		}
		w.Header().Set("Cache-Control", "no-store")
		w.Header().Set("X-Content-Type-Options", "nosniff")

		if r.Method == http.MethodOptions {
			if origin == "" {
				sendJSON(w, http.StatusBadRequest, map[string]any{"error": "Origin is required for preflight."})
				return
			}
			w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type")
			w.Header().Set("Access-Control-Max-Age", "600")
			if strings.EqualFold(strings.TrimSpace(r.Header.Get("Access-Control-Request-Private-Network")), "true") {
				w.Header().Set("Access-Control-Allow-Private-Network", "true")
			}
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if r.Method != http.MethodGet {
			sendJSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "Method not allowed."})
			return
		}
		next.ServeHTTP(w, r)
	})
}

func handleHealth(w http.ResponseWriter, _ *http.Request) {
	sendJSON(w, http.StatusOK, map[string]any{
		"service":      bridgeService,
		"protocol":     protocol,
		"version":      version,
		"runtime":      "native-windows",
		"capabilities": []string{"health", "tex.status", "native.autostart"},
	})
}

func handleTexStatus(w http.ResponseWriter, _ *http.Request) {
	path := findXeLaTeX()
	available := path != ""
	versionLine := ""
	if available {
		ctx, cancel := context.WithTimeout(context.Background(), 2200*time.Millisecond)
		defer cancel()
		cmd := exec.CommandContext(ctx, path, "--version")
		hideWindow(cmd)
		out, err := cmd.CombinedOutput()
		if err == nil {
			for _, line := range strings.Split(string(out), "\n") {
				line = strings.TrimSpace(line)
				if line != "" {
					if len(line) > 180 {
						line = line[:180]
					}
					versionLine = line
					break
				}
			}
		} else {
			available = false
		}
	}

	arch := runtime.GOARCH
	if arch == "amd64" {
		arch = "x64"
	}
	sendJSON(w, http.StatusOK, map[string]any{
		"available":  available,
		"engine":     "xelatex",
		"version":    versionLine,
		"platform":   "win32",
		"arch":       arch,
		"configured": path != "",
		"runtime":    "native-windows",
	})
}

func findXeLaTeX() string {
	if configured := strings.TrimSpace(os.Getenv("QSSEDA_XELATEX")); configured != "" && fileExists(configured) {
		return configured
	}
	if path, err := exec.LookPath("xelatex.exe"); err == nil && fileExists(path) {
		return path
	}

	var candidates []string
	for _, drive := range []string{"D:", "C:", "E:"} {
		root := drive + `\texlive`
		entries, err := os.ReadDir(root)
		if err != nil {
			continue
		}
		for _, entry := range entries {
			if !entry.IsDir() {
				continue
			}
			candidate := filepath.Join(root, entry.Name(), "bin", "windows", "xelatex.exe")
			if fileExists(candidate) {
				candidates = append(candidates, candidate)
			}
		}
	}

	if programFiles := strings.TrimSpace(os.Getenv("ProgramFiles")); programFiles != "" {
		candidate := filepath.Join(programFiles, "MiKTeX", "miktex", "bin", "x64", "xelatex.exe")
		if fileExists(candidate) {
			candidates = append(candidates, candidate)
		}
	}
	if local := strings.TrimSpace(os.Getenv("LOCALAPPDATA")); local != "" {
		candidate := filepath.Join(local, "Programs", "MiKTeX", "miktex", "bin", "x64", "xelatex.exe")
		if fileExists(candidate) {
			candidates = append(candidates, candidate)
		}
	}

	if len(candidates) == 0 {
		return ""
	}
	sort.Slice(candidates, func(i, j int) bool { return strings.ToLower(candidates[i]) > strings.ToLower(candidates[j]) })
	return candidates[0]
}

func fileExists(path string) bool {
	info, err := os.Stat(path)
	return err == nil && !info.IsDir()
}

func sendJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json;charset=UTF-8")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func hideWindow(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
}

func showMessage(title, message string, isError bool) {
	user32 := syscall.NewLazyDLL("user32.dll")
	messageBox := user32.NewProc("MessageBoxW")
	titlePtr, _ := syscall.UTF16PtrFromString(title)
	messagePtr, _ := syscall.UTF16PtrFromString(message)
	flags := uintptr(0x00000040) // MB_ICONINFORMATION
	if isError {
		flags = 0x00000010 // MB_ICONERROR
	}
	_, _, _ = messageBox.Call(0, uintptr(unsafe.Pointer(messagePtr)), uintptr(unsafe.Pointer(titlePtr)), flags)
}
