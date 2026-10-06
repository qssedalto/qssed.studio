// 【初学者导读】
// 文件：local-bridge/native/main_windows.go
// Windows 本地桥接原生模块：提供本机进程/升级/允许来源等能力。
// 阅读顺序：先确认本文件导出的数据/函数被谁使用，再看数据键、转换规则和失败/回退逻辑；数据型文件也要理解“谁消费它”。
// 修改注意：这是网页到本机的安全边界，必须严格限制允许来源、命令和升级来源。
// 调试方法：优先验证输入 key/ID/locale/host 是否正确，再检查转换后的结构，不要一开始就改最终展示。
package main

import (
	"bytes"
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
	"strconv"
	"strings"
	"syscall"
	"time"
	"unicode/utf8"
	"unsafe"
)

const (
	bridgeHost       = "127.0.0.1"
	bridgePort       = "32145"
	bridgeService    = "qsseda-local-bridge"
	protocol         = 1
	appName          = "AERTEX Bridge"
	exeName          = "AERTEX-Bridge.exe"
	maxCompileBody   = 768 * 1024
	maxSourceBytes   = 512 * 1024
	maxSourceRunes   = 180000
	maxResultBytes   = 16 * 1024 * 1024
	compileTimeout   = 20 * time.Second
	maxDiagnosticLen = 24000
)

var version = "0.3.0-dev"
var compileSlots = make(chan struct{}, 2)

var allowedOrigins = map[string]bool{
	"https://qsseda.com":        true,
	"https://www.qsseda.com":    true,
	"https://qsseda.online":     true,
	"https://www.qsseda.online": true,
	"https://qsseda.studio":     true,
	"https://www.qsseda.studio": true,
}

var allowedLocalEngines = map[string]bool{
	"xelatex":  true,
	"pdflatex": true,
}

type compileRequest struct {
	Engine string `json:"engine"`
	Source string `json:"source"`
	Title  string `json:"title,omitempty"`
}

// Windows 原生桥接入口：启动本机 HTTP 服务前先建立单实例/来源/监听边界；本程序的目标是提供最小必要本机能力，而不是通用命令服务器。\nfunc main() {
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
		showMessage(appName, "已移除 AERTEX Bridge 的自动启动。\n已安装的 EXE 会保留在本机，便于检查或手动删除。", false)
		return
	}

	installedExe, err := installSelf()
	if err != nil {
		showMessage(appName, "安装失败：\n"+err.Error(), true)
		return
	}
	_ = launchBackground(installedExe)

	tex := findTeXExecutable("xelatex")
	message := "AERTEX Bridge 已安装。\n\n以后登录 Windows 后会自动在后台启动，不需要 Node.js，也不需要 PowerShell。"
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
	_ = regAdd(uninstallKey, "Publisher", "AERTEX")
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
	mux.HandleFunc("/tex/compile", handleTexCompile)

	server := &http.Server{
		Addr:              net.JoinHostPort(bridgeHost, bridgePort),
		Handler:           secureHandler(mux),
		ReadHeaderTimeout: 3 * time.Second,
		ReadTimeout:       8 * time.Second,
		WriteTimeout:      30 * time.Second,
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
		if r.Method == http.MethodPost && origin == "" {
			sendJSON(w, http.StatusForbidden, map[string]any{"error": "Origin is required for local actions."})
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
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type")
			w.Header().Set("Access-Control-Max-Age", "600")
			if strings.EqualFold(strings.TrimSpace(r.Header.Get("Access-Control-Request-Private-Network")), "true") {
				w.Header().Set("Access-Control-Allow-Private-Network", "true")
			}
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if r.Method != http.MethodGet && r.Method != http.MethodPost {
			sendJSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "Method not allowed."})
			return
		}
		next.ServeHTTP(w, r)
	})
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendJSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "Method not allowed."})
		return
	}
	sendJSON(w, http.StatusOK, map[string]any{
		"service":      bridgeService,
		"protocol":     protocol,
		"version":      version,
		"runtime":      "native-windows",
		"capabilities": []string{"health", "tex.status", "tex.compile", "native.autostart"},
	})
}

func handleTexStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendJSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "Method not allowed."})
		return
	}
	engines := detectLocalEngines()
	path := findTeXExecutable("xelatex")
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
		"engines":    engines,
		"version":    versionLine,
		"platform":   "win32",
		"arch":       arch,
		"configured": path != "",
		"runtime":    "native-windows",
	})
}

func handleTexCompile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		sendJSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "Method not allowed."})
		return
	}

	select {
	case compileSlots <- struct{}{}:
		defer func() { <-compileSlots }()
	default:
		sendJSON(w, http.StatusTooManyRequests, map[string]any{"error": "Too many local TeX jobs are already running."})
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, maxCompileBody)
	decoder := json.NewDecoder(r.Body)
	var payload compileRequest
	if err := decoder.Decode(&payload); err != nil {
		sendJSON(w, http.StatusBadRequest, map[string]any{"error": "Invalid compile request."})
		return
	}

	engine := strings.ToLower(strings.TrimSpace(payload.Engine))
	if !allowedLocalEngines[engine] {
		sendJSON(w, http.StatusBadRequest, map[string]any{"error": "This engine is not enabled for local compilation."})
		return
	}
	if payload.Source == "" {
		sendJSON(w, http.StatusBadRequest, map[string]any{"error": "TeX source is empty."})
		return
	}
	if len(payload.Source) > maxSourceBytes || utf8.RuneCountInString(payload.Source) > maxSourceRunes {
		sendJSON(w, http.StatusRequestEntityTooLarge, map[string]any{"error": "TeX source is too large."})
		return
	}

	executable := findTeXExecutable(engine)
	if executable == "" {
		sendJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "The selected TeX engine is not installed locally."})
		return
	}

	workDir, err := os.MkdirTemp("", "qsseda-tex-")
	if err != nil {
		sendJSON(w, http.StatusInternalServerError, map[string]any{"error": "Could not create an isolated TeX working directory."})
		return
	}
	defer os.RemoveAll(workDir)

	sourcePath := filepath.Join(workDir, "main.tex")
	if err := os.WriteFile(sourcePath, []byte(payload.Source), 0o600); err != nil {
		sendJSON(w, http.StatusInternalServerError, map[string]any{"error": "Could not prepare TeX source."})
		return
	}

	started := time.Now()
	ctx, cancel := context.WithTimeout(r.Context(), compileTimeout)
	defer cancel()
	args := []string{
		"-no-shell-escape",
		"-interaction=nonstopmode",
		"-halt-on-error",
		"-file-line-error",
		"-output-directory=" + workDir,
		"main.tex",
	}
	cmd := exec.CommandContext(ctx, executable, args...)
	cmd.Dir = workDir
	cmd.Env = texEnvironment(workDir)
	hideWindow(cmd)
	var output bytes.Buffer
	cmd.Stdout = &output
	cmd.Stderr = &output
	err = cmd.Run()
	elapsed := time.Since(started)
	logText := cleanCompileLog(output.String(), workDir)

	if ctx.Err() == context.DeadlineExceeded {
		sendJSON(w, http.StatusRequestTimeout, map[string]any{"error": "Local TeX compilation timed out.", "log": logText})
		return
	}
	if err != nil {
		sendJSON(w, http.StatusUnprocessableEntity, map[string]any{"error": "Local TeX compilation failed.", "log": logText})
		return
	}

	pdfPath := filepath.Join(workDir, "main.pdf")
	info, err := os.Stat(pdfPath)
	if err != nil || info.IsDir() || info.Size() <= 4 {
		sendJSON(w, http.StatusUnprocessableEntity, map[string]any{"error": "TeX finished without producing a PDF.", "log": logText})
		return
	}
	if info.Size() > maxResultBytes {
		sendJSON(w, http.StatusRequestEntityTooLarge, map[string]any{"error": "Compiled PDF is too large."})
		return
	}
	pdf, err := os.ReadFile(pdfPath)
	if err != nil || len(pdf) < 5 || string(pdf[:5]) != "%PDF-" {
		sendJSON(w, http.StatusUnprocessableEntity, map[string]any{"error": "The local compiler returned an invalid PDF.", "log": logText})
		return
	}

	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", `inline; filename="qsseda-local.pdf"`)
	w.Header().Set("Content-Length", strconv.Itoa(len(pdf)))
	w.Header().Set("X-Qsseda-Tex-Engine", engine)
	w.Header().Set("X-Qsseda-Compile-Ms", strconv.FormatInt(elapsed.Milliseconds(), 10))
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(pdf)
}

func detectLocalEngines() []string {
	engines := make([]string, 0, len(allowedLocalEngines))
	for _, name := range []string{"xelatex", "pdflatex"} {
		if findTeXExecutable(name) != "" {
			engines = append(engines, name)
		}
	}
	return engines
}

func findTeXExecutable(engine string) string {
	engine = strings.ToLower(strings.TrimSpace(engine))
	if !allowedLocalEngines[engine] {
		return ""
	}

	envName := "QSSEDA_" + strings.ToUpper(engine)
	if configured := strings.TrimSpace(os.Getenv(envName)); configured != "" && fileExists(configured) {
		return configured
	}
	exe := engine + ".exe"
	if path, err := exec.LookPath(exe); err == nil && fileExists(path) {
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
			candidate := filepath.Join(root, entry.Name(), "bin", "windows", exe)
			if fileExists(candidate) {
				candidates = append(candidates, candidate)
			}
		}
	}

	if programFiles := strings.TrimSpace(os.Getenv("ProgramFiles")); programFiles != "" {
		candidate := filepath.Join(programFiles, "MiKTeX", "miktex", "bin", "x64", exe)
		if fileExists(candidate) {
			candidates = append(candidates, candidate)
		}
	}
	if local := strings.TrimSpace(os.Getenv("LOCALAPPDATA")); local != "" {
		candidate := filepath.Join(local, "Programs", "MiKTeX", "miktex", "bin", "x64", exe)
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

func texEnvironment(workDir string) []string {
	keep := []string{"SystemRoot", "WINDIR", "PATH", "PATHEXT", "COMSPEC", "LOCALAPPDATA", "APPDATA", "USERPROFILE", "ProgramFiles", "ProgramFiles(x86)", "ProgramData"}
	env := make([]string, 0, len(keep)+6)
	for _, key := range keep {
		if value, ok := os.LookupEnv(key); ok && value != "" {
			env = append(env, key+"="+value)
		}
	}
	env = append(env,
		"TEMP="+workDir,
		"TMP="+workDir,
		"TEXMFOUTPUT="+workDir,
		"openin_any=p",
		"openout_any=p",
	)
	return env
}

func cleanCompileLog(value, workDir string) string {
	text := strings.ReplaceAll(value, workDir, "<workdir>")
	text = strings.ReplaceAll(text, filepath.ToSlash(workDir), "<workdir>")
	text = strings.TrimSpace(text)
	if len(text) > maxDiagnosticLen {
		text = text[len(text)-maxDiagnosticLen:]
		text = "…\n" + text
	}
	return text
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
	flags := uintptr(0x00000040)
	if isError {
		flags = 0x00000010
	}
	_, _, _ = messageBox.Call(0, uintptr(unsafe.Pointer(messagePtr)), uintptr(unsafe.Pointer(titlePtr)), flags)
}
