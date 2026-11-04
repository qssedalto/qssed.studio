package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"syscall"
	"time"
	"unsafe"
)

const (
	appName       = "QssedA Collaboration"
	bridgeExeName = "QssedA-Local-Bridge.exe"
	bridgeBaseURL = "http://127.0.0.1:32145"
	workURL       = "https://qsseda.studio/zh-cn/work"
	texURL        = "https://qsseda.studio/zh-cn/workspace/experiments/tex"
)

var version = "0.1.0-dev"

type healthPayload struct {
	Service      string   `json:"service"`
	Protocol     int      `json:"protocol"`
	Version      string   `json:"version"`
	Runtime      string   `json:"runtime"`
	Capabilities []string `json:"capabilities"`
}

type texStatusPayload struct {
	Available  bool     `json:"available"`
	Engine     string   `json:"engine"`
	Engines    []string `json:"engines"`
	Version    string   `json:"version"`
	Platform   string   `json:"platform"`
	Arch       string   `json:"arch"`
	Configured bool     `json:"configured"`
	Runtime    string   `json:"runtime"`
}

func main() {
	args := os.Args[1:]
	mode := "work"
	if hasArg(args, "--tex") {
		mode = "tex"
	}
	if hasArg(args, "--bridge-only") {
		mode = "bridge"
	}
	if hasArg(args, "--status") {
		mode = "status"
	}

	baseDir, err := executableDir()
	if err != nil {
		showMessage(appName, "无法定位协作程序目录：\n"+err.Error(), true)
		return
	}

	logLine("launch version=%s mode=%s base=%s", version, mode, baseDir)

	portable := discoverPortableRuntime(baseDir)
	if portable.XeLaTeX != "" {
		logLine("portable xelatex=%s", portable.XeLaTeX)
	}

	bridgePath, started, err := ensureBridge(baseDir, portable)
	if err != nil {
		showMessage(appName, "无法启动 QssedA Local Bridge：\n\n"+err.Error()+"\n\n请确认 "+bridgeExeName+" 与协作程序一起提供。", true)
		return
	}
	logLine("bridge ready path=%s started=%t", bridgePath, started)

	if mode == "bridge" {
		return
	}

	if mode == "status" {
		showCurrentStatus(portable)
		return
	}

	url := workURL
	if mode == "tex" {
		url = texURL
	}
	if err := openURL(url); err != nil {
		showMessage(appName, "Bridge 已启动，但无法打开浏览器：\n"+err.Error()+"\n\n请手动访问：\n"+url, true)
	}
}

type portableRuntime struct {
	Root     string
	XeLaTeX string
	PDFLaTeX string
	TeXworks string
}

func executableDir() (string, error) {
	executable, err := os.Executable()
	if err != nil {
		return "", err
	}
	executable, err = filepath.Abs(executable)
	if err != nil {
		return "", err
	}
	return filepath.Dir(executable), nil
}

func ensureBridge(baseDir string, portable portableRuntime) (string, bool, error) {
	if bridgeAlive() {
		return "already-running", false, nil
	}

	bridgePath := findBridgeExecutable(baseDir)
	if bridgePath == "" {
		return "", false, errors.New("未找到本机 Bridge EXE")
	}

	cmd := exec.Command(bridgePath, "--background")
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	cmd.Env = append([]string{}, os.Environ()...)
	if portable.XeLaTeX != "" {
		cmd.Env = append(cmd.Env, "QSSEDA_XELATEX="+portable.XeLaTeX)
	}
	if portable.PDFLaTeX != "" {
		cmd.Env = append(cmd.Env, "QSSEDA_PDFLATEX="+portable.PDFLaTeX)
	}
	if portable.Root != "" {
		cmd.Env = append(cmd.Env, "QSSEDA_TEX_RUNTIME_ROOT="+portable.Root)
	}

	if err := cmd.Start(); err != nil {
		return bridgePath, false, fmt.Errorf("启动 Bridge：%w", err)
	}

	deadline := time.Now().Add(5 * time.Second)
	for time.Now().Before(deadline) {
		if bridgeAlive() {
			return bridgePath, true, nil
		}
		time.Sleep(120 * time.Millisecond)
	}
	return bridgePath, true, errors.New("Bridge 已启动进程，但 localhost 健康检查未在 5 秒内就绪")
}

func findBridgeExecutable(baseDir string) string {
	candidates := []string{
		filepath.Join(baseDir, bridgeExeName),
		filepath.Join(baseDir, "bridge", bridgeExeName),
		filepath.Join(filepath.Dir(baseDir), bridgeExeName),
	}
	if local := strings.TrimSpace(os.Getenv("LOCALAPPDATA")); local != "" {
		candidates = append(candidates, filepath.Join(local, "QssedA", "LocalBridge", bridgeExeName))
	}
	for _, candidate := range uniquePaths(candidates) {
		if fileExists(candidate) {
			return candidate
		}
	}
	return ""
}

func discoverPortableRuntime(baseDir string) portableRuntime {
	roots := []string{
		baseDir,
		filepath.Join(baseDir, "QssedA-TeX-Portable"),
		filepath.Join(baseDir, "runtime"),
		filepath.Join(baseDir, "runtime", "QssedA-TeX-Portable"),
		filepath.Join(filepath.Dir(baseDir), "QssedA-TeX-Portable"),
	}

	for drive := 'C'; drive <= 'Z'; drive++ {
		roots = append(roots, fmt.Sprintf("%c:\\QssedA-TeX-Portable", drive))
	}

	for _, root := range uniquePaths(roots) {
		bin := filepath.Join(root, "texlive", "bin", "windows")
		xe := filepath.Join(bin, "xelatex.exe")
		if !fileExists(xe) {
			continue
		}
		return portableRuntime{
			Root:     root,
			XeLaTeX: xe,
			PDFLaTeX: existingFile(filepath.Join(bin, "pdflatex.exe")),
			TeXworks: existingFile(filepath.Join(bin, "texworks.exe")),
		}
	}
	return portableRuntime{}
}

func bridgeAlive() bool {
	client := &http.Client{Timeout: 700 * time.Millisecond}
	response, err := client.Get(bridgeBaseURL + "/health")
	if err != nil {
		return false
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return false
	}
	var payload healthPayload
	if err := json.NewDecoder(response.Body).Decode(&payload); err != nil {
		return false
	}
	return payload.Service == "qsseda-local-bridge" && payload.Protocol == 1
}

func showCurrentStatus(portable portableRuntime) {
	client := &http.Client{Timeout: 3500 * time.Millisecond}
	response, err := client.Get(bridgeBaseURL + "/tex/status")
	if err != nil {
		showMessage(appName, "Bridge 已连接，但 TeX 状态读取失败：\n"+err.Error(), true)
		return
	}
	defer response.Body.Close()
	var payload texStatusPayload
	if err := json.NewDecoder(response.Body).Decode(&payload); err != nil {
		showMessage(appName, "TeX 状态格式无效：\n"+err.Error(), true)
		return
	}

	text := "QssedA Collaboration " + version + "\n\nBridge：已连接"
	if payload.Available {
		text += "\nTeX：可用"
		if payload.Version != "" {
			text += "\n" + payload.Version
		}
	} else {
		text += "\nTeX：未检测到可用引擎"
	}
	if portable.Root != "" {
		text += "\n\n便携 Runtime：\n" + portable.Root
	}
	showMessage(appName, text, false)
}

func openURL(url string) error {
	shell32 := syscall.NewLazyDLL("shell32.dll")
	proc := shell32.NewProc("ShellExecuteW")
	operation, _ := syscall.UTF16PtrFromString("open")
	target, _ := syscall.UTF16PtrFromString(url)
	result, _, callErr := proc.Call(0, uintptr(unsafe.Pointer(operation)), uintptr(unsafe.Pointer(target)), 0, 0, 1)
	if result <= 32 {
		return fmt.Errorf("ShellExecuteW failed (%d): %v", result, callErr)
	}
	return nil
}

func showMessage(title, message string, isError bool) {
	user32 := syscall.NewLazyDLL("user32.dll")
	proc := user32.NewProc("MessageBoxW")
	titlePtr, _ := syscall.UTF16PtrFromString(title)
	messagePtr, _ := syscall.UTF16PtrFromString(message)
	flags := uintptr(0x00000040)
	if isError {
		flags = 0x00000010
	}
	_, _, _ = proc.Call(0, uintptr(unsafe.Pointer(messagePtr)), uintptr(unsafe.Pointer(titlePtr)), flags)
}

func hasArg(args []string, target string) bool {
	for _, arg := range args {
		if strings.EqualFold(strings.TrimSpace(arg), target) {
			return true
		}
	}
	return false
}

func existingFile(path string) string {
	if fileExists(path) {
		return path
	}
	return ""
}

func fileExists(path string) bool {
	info, err := os.Stat(path)
	return err == nil && !info.IsDir()
}

func uniquePaths(values []string) []string {
	seen := make(map[string]bool, len(values))
	result := make([]string, 0, len(values))
	for _, value := range values {
		value = filepath.Clean(strings.TrimSpace(value))
		if value == "." || value == "" {
			continue
		}
		key := strings.ToLower(value)
		if seen[key] {
			continue
		}
		seen[key] = true
		result = append(result, value)
	}
	return result
}

func logLine(format string, args ...any) {
	local := strings.TrimSpace(os.Getenv("LOCALAPPDATA"))
	if local == "" {
		return
	}
	dir := filepath.Join(local, "QssedA", "Collaboration")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return
	}
	file, err := os.OpenFile(filepath.Join(dir, "collaboration.log"), os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o600)
	if err != nil {
		return
	}
	defer file.Close()
	_, _ = fmt.Fprintf(file, "%s "+format+"\n", append([]any{time.Now().Format(time.RFC3339)}, args...)...)
}
