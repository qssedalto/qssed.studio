// Native macOS port of the original AERTEX Bridge Go engine.
// HTTP protocol, TeX pipeline, limits and security checks share the Windows engine's behavior.
package main

import (
	"bytes"
	"context"
	"encoding/base64"
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
	"time"
	"unicode/utf8"
)

const (
	bridgeHost       = "127.0.0.1"
	bridgePort       = "32145"
	bridgeService    = "qsseda-local-bridge"
	protocol         = 1
	appName          = "AERTEX Bridge"
	exeName          = "AERTEX-Bridge"
	maxCompileBody   = 48 * 1024 * 1024
	maxProjectBytes  = 32 * 1024 * 1024
	maxProjectFile   = 8 * 1024 * 1024
	maxProjectCount  = 499
	maxSourceBytes   = 512 * 1024
	maxSourceRunes   = 180000
	maxResultBytes   = 16 * 1024 * 1024
	compileTimeout   = 100 * time.Second
	maxDiagnosticLen = 24000
)

var version = "0.3.2-dev"
var compileSlots = make(chan struct{}, 2)

var allowedOrigins = map[string]bool{
	"https://qsseda.com":        true,
	"https://www.qsseda.com":    true,
	"https://qsseda.studio":     true,
	"https://www.qsseda.studio": true,
}

var allowedLocalEngines = map[string]bool{
	"xelatex":  true,
	"pdflatex": true,
}

type compileRequest struct {
	Engine string         `json:"engine"`
	Source string         `json:"source"`
	Title  string         `json:"title,omitempty"`
	Files  []projectAsset `json:"files,omitempty"`
}

type projectAsset struct {
	Name     string `json:"name"`
	Encoding string `json:"encoding"`
	Content  string `json:"content"`
}

var localTeXAssetExtensions = map[string]bool{
	".tex": true, ".sty": true, ".cls": true, ".bib": true, ".bst": true,
	".bbx": true, ".cbx": true, ".def": true, ".dtx": true, ".ins": true,
	".ltx": true, ".tikz": true, ".pgf": true, ".png": true, ".jpg": true,
	".jpeg": true, ".pdf": true, ".eps": true, ".ttf": true, ".otf": true,
	".txt": true, ".csv": true, ".tsv": true, ".cfg": true,
}

// Reject traversal, Windows device names and alternate data streams before writing
// any project asset into the disposable working directory.
func safeProjectAssetName(name string) bool {
	if name == "" || len(name) > 240 || strings.ContainsAny(name, "\\\\:<>\"|?*") ||
		strings.HasPrefix(name, "/") {
		return false
	}
	parts := strings.Split(name, "/")
	if len(parts) > 20 { return false }
	for _, part := range parts {
		if part == "" || part == "." || part == ".." || len(part) > 100 ||
			strings.HasSuffix(part, ".") || strings.HasSuffix(part, " ") { return false }
		for _, r := range part { if r < 0x20 || r == 0x7f { return false } }
		stem := strings.ToLower(strings.SplitN(part, ".", 2)[0])
		if stem == "con" || stem == "prn" || stem == "aux" || stem == "nul" ||
			stem == "com1" || stem == "com2" || stem == "com3" || stem == "com4" ||
			stem == "com5" || stem == "com6" || stem == "com7" || stem == "com8" ||
			stem == "com9" || stem == "lpt1" || stem == "lpt2" || stem == "lpt3" ||
			stem == "lpt4" || stem == "lpt5" || stem == "lpt6" || stem == "lpt7" ||
			stem == "lpt8" || stem == "lpt9" { return false }
	}
	lower := strings.ToLower(name)
	return lower != "main.tex" && lower != "main.pdf" && localTeXAssetExtensions[strings.ToLower(filepath.Ext(name))]
}

func writeProjectAssets(workDir string, assets []projectAsset) error {
	if len(assets) > maxProjectCount { return fmt.Errorf("too many project files") }
	seen := make(map[string]bool, len(assets))
	total := 0
	for _, asset := range assets {
		if !safeProjectAssetName(asset.Name) { return fmt.Errorf("unsafe or unsupported project file: %s", asset.Name) }
		key := strings.ToLower(asset.Name)
		if seen[key] { return fmt.Errorf("duplicate project file: %s", asset.Name) }
		seen[key] = true
		var data []byte
		switch asset.Encoding {
		case "utf8":
			if !utf8.ValidString(asset.Content) { return fmt.Errorf("invalid UTF-8 in %s", asset.Name) }
			data = []byte(asset.Content)
		case "base64":
			if len(asset.Content) > (maxProjectFile+2)/3*4+8 { return fmt.Errorf("project file too large") }
			decoded, err := base64.StdEncoding.DecodeString(asset.Content)
			if err != nil { return fmt.Errorf("invalid base64 project asset") }
			data = decoded
		default:
			return fmt.Errorf("unsupported project asset encoding")
		}
		if len(data) > maxProjectFile { return fmt.Errorf("project asset exceeds 8 MiB") }
		total += len(data)
		if total > maxProjectBytes { return fmt.Errorf("project exceeds 32 MiB") }
		target := filepath.Join(workDir, filepath.FromSlash(asset.Name))
		rel, err := filepath.Rel(workDir, target)
		if err != nil || rel == ".." || strings.HasPrefix(rel, ".."+string(filepath.Separator)) {
			return fmt.Errorf("project file escapes temporary directory")
		}
		if err := os.MkdirAll(filepath.Dir(target), 0700); err != nil { return err }
		if err := os.WriteFile(target, data, 0600); err != nil { return err }
	}
	return nil
}


func main() {
	args := os.Args[1:]
	if hasArg(args, "--version") {
		fmt.Println("AERTEX Bridge", version)
		return
	}
	if hasArg(args, "--help") {
		fmt.Println("AERTEX Bridge (native macOS)\n  --background  Start the loopback service\n  --status      Check the running service\n  --version     Print version")
		return
	}
	if hasArg(args, "--status") {
		if err := printStatus(); err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		return
	}
	if hasArg(args, "--uninstall") {
		fmt.Fprintln(os.Stderr, "To uninstall, run /Applications/AERTEX Bridge.app/Contents/Resources/uninstall.command with administrator privileges.")
		os.Exit(2)
	}
	if err := runBridge(); err != nil {
		logBridgeStartupFailure(err)
		fmt.Fprintln(os.Stderr, "AERTEX Bridge:", err)
		os.Exit(1)
	}
}

func hasArg(args []string, target string) bool {
	for _, arg := range args {
		if strings.EqualFold(strings.TrimSpace(arg), target) {
			return true
		}
	}
	return false
}

func printStatus() error {
	client := &http.Client{Timeout: 2 * time.Second}
	response, err := client.Get("http://127.0.0.1:32145/health")
	if err != nil {
		return fmt.Errorf("AERTEX Bridge is not responding: %w", err)
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return fmt.Errorf("AERTEX Bridge returned HTTP %d", response.StatusCode)
	}
	var result struct {
		Service string `json:"service"`
		Protocol int `json:"protocol"`
		Runtime string `json:"runtime"`
		Version string `json:"version"`
	}
	if err := json.NewDecoder(io.LimitReader(response.Body, 8192)).Decode(&result); err != nil {
		return err
	}
	if result.Service != bridgeService || result.Protocol != protocol || result.Runtime != "native-macos" {
		return errors.New("Port 32145 is not owned by a compatible AERTEX macOS Bridge")
	}
	fmt.Printf("AERTEX Bridge is running (%s, protocol %d, version %s)\n", result.Runtime, result.Protocol, result.Version)
	return nil
}

// Store only startup errors, never document bodies or request data.
func logBridgeStartupFailure(reason error) {
	if reason == nil { return }
	home, err := os.UserHomeDir()
	if err != nil { return }
	dir := filepath.Join(home, "Library", "Logs", "AERTEX Bridge")
	if os.MkdirAll(dir, 0700) != nil { return }
	file, err := os.OpenFile(filepath.Join(dir, "bridge.log"), os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0600)
	if err != nil { return }
	defer file.Close()
	_, _ = fmt.Fprintf(file, "%s Bridge startup failed: %v\n", time.Now().Format(time.RFC3339), reason)
}

func runBridge() error {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", handleHealth)
	mux.HandleFunc("/tex/status", handleTexStatus)
	mux.HandleFunc("/tex/compile", handleTexCompile)

	handler := secureHandler(mux)
	startOptionalLocalHTTPS(handler)

	server := &http.Server{
		Addr:              net.JoinHostPort(bridgeHost, bridgePort),
		Handler:           handler,
		ReadHeaderTimeout: 3 * time.Second,
		ReadTimeout:       8 * time.Second,
		WriteTimeout:      115 * time.Second,
		IdleTimeout:       30 * time.Second,
	}
	return server.ListenAndServe()
}

// 本机桥接先限制 Host 与 Origin，再路由到能力端点；localhost 并不代表任何网页都应获得调用权限。
func secureHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		host := strings.ToLower(strings.TrimSpace(r.Host))
		if host != "127.0.0.1:32145" && host != "localhost:32145" &&
			host != "127.0.0.1:32146" && host != "localhost:32146" {
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
		"runtime":      "native-macos",
		"capabilities": []string{"health", "tex.status", "tex.compile", "tex.project-files", "native.autostart"},
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
		"platform":   "darwin",
		"arch":       arch,
		"configured": path != "",
		"runtime":    "native-macos",
	})
}

// 编译请求只接受 POST，并通过并发槽位约束同时运行的编译数；编译器参数和可用能力仍须由本地端控制。
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
	if err := writeProjectAssets(workDir, payload.Files); err != nil {
		sendJSON(w, http.StatusBadRequest, map[string]any{"error": "Project files rejected: " + err.Error()})
		return
	}

	sourcePath := filepath.Join(workDir, "main.tex")
	if err := os.WriteFile(sourcePath, []byte(payload.Source), 0o600); err != nil {
		sendJSON(w, http.StatusInternalServerError, map[string]any{"error": "Could not prepare TeX source."})
		return
	}

	started := time.Now()
	ctx, cancel := context.WithTimeout(r.Context(), compileTimeout)
	defer cancel()
	// Each request has a fresh directory. One TeX pass leaves an empty TOC
	// and unresolved citations; keep every pass in this same disposable workspace.
	args := []string{
		"-no-shell-escape",
		"-interaction=nonstopmode",
		"-halt-on-error",
		"-file-line-error",
		"-output-directory=" + workDir,
		"main.tex",
	}
	var output bytes.Buffer
	var stageError string
	for pass := 1; pass <= 3; pass++ {
		_, _ = fmt.Fprintf(&output, "\n=== TeX pass %d of 3 ===\n", pass)
		if err = runLocalTeXTool(ctx, executable, args, workDir, &output); err != nil {
			stageError = fmt.Sprintf("TeX pass %d failed.", pass)
			break
		}
		if pass == 1 {
			// Biber produces a .bcf; classic BibTeX marks main.aux with \bibdata.
			// Neither the executable name nor its arguments come from the source.
			bibliography := bibliographyBackend(workDir)
			if bibliography != "" {
				tool := findBibliographyExecutable(bibliography, executable)
				if tool == "" {
					stageError = bibliography + " is needed for this document but is not installed next to the TeX engine or on PATH."
					err = errors.New(stageError)
					break
				}
				_, _ = fmt.Fprintf(&output, "\n=== %s bibliography pass ===\n", bibliography)
				if err = runLocalTeXTool(ctx, tool, []string{"main"}, workDir, &output); err != nil {
					stageError = bibliography + " bibliography pass failed."
					break
				}
			}
		}
	}
	elapsed := time.Since(started)
	logText := cleanCompileLog(output.String(), workDir)
	if ctx.Err() == context.DeadlineExceeded {
		sendJSON(w, http.StatusRequestTimeout, map[string]any{"error": "Local TeX compilation timed out.", "log": logText})
		return
	}
	if err != nil {
		sendJSON(w, http.StatusUnprocessableEntity, map[string]any{"error": stageError, "log": logText})
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

// Only fixed bibliography backends may be selected by generated TeX aux files.
func bibliographyBackend(workDir string) string {
	if fileExists(filepath.Join(workDir, "main.bcf")) {
		return "biber"
	}
	aux, err := os.ReadFile(filepath.Join(workDir, "main.aux"))
	if err == nil && bytes.Contains(aux, []byte("\\bibdata{")) {
		return "bibtex"
	}
	return ""
}

// Prefer the matching TeX Live / MiKTeX installation, even if it is not on PATH.

func findBibliographyExecutable(name, engineExecutable string) string {
	if name != "bibtex" && name != "biber" { return "" }
	sibling := filepath.Join(filepath.Dir(engineExecutable), name)
	if fileExists(sibling) { return sibling }
	if found, err := exec.LookPath(name); err == nil && fileExists(found) { return found }
	for _, dir := range macTeXBinDirs() {
		candidate := filepath.Join(dir, name)
		if fileExists(candidate) { return candidate }
	}
	return ""
}

func runLocalTeXTool(ctx context.Context, executable string, args []string, workDir string, output *bytes.Buffer) error {
	cmd := exec.CommandContext(ctx, executable, args...)
	cmd.Dir = workDir
	cmd.Env = texEnvironment(workDir)
	hideWindow(cmd)
	cmd.Stdout = output
	cmd.Stderr = output
	return cmd.Run()
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
	if !allowedLocalEngines[engine] { return "" }
	envName := "QSSEDA_" + strings.ToUpper(engine)
	if configured := strings.TrimSpace(os.Getenv(envName)); configured != "" && fileExists(configured) {
		return configured
	}
	if found, err := exec.LookPath(engine); err == nil && fileExists(found) {
		return found
	}
	for _, dir := range macTeXBinDirs() {
		candidate := filepath.Join(dir, engine)
		if fileExists(candidate) { return candidate }
	}
	return ""
}

// Finder-launched applications do not inherit interactive shell PATH. Search
// MacTeX's stable shim, Homebrew and yearly TeX Live layouts explicitly.
func macTeXBinDirs() []string {
	dirs := []string{
		"/Library/TeX/texbin",
		"/opt/homebrew/bin",
		"/usr/local/bin",
		"/usr/local/texlive/2026/bin/universal-darwin",
		"/usr/local/texlive/2025/bin/universal-darwin",
	}
	if home, err := os.UserHomeDir(); err == nil {
		dirs = append(dirs, filepath.Join(home, "bin"))
	}
	for _, root := range []string{"/usr/local/texlive", "/opt/texlive"} {
		entries, err := os.ReadDir(root)
		if err != nil { continue }
		candidates := make([]string, 0, len(entries))
		for _, entry := range entries {
			if !entry.IsDir() { continue }
			for _, architecture := range []string{"universal-darwin", "aarch64-darwin", "x86_64-darwin"} {
				candidate := filepath.Join(root, entry.Name(), "bin", architecture)
				if info, err := os.Stat(candidate); err == nil && info.IsDir() {
					candidates = append(candidates, candidate)
				}
			}
		}
		sort.Slice(candidates, func(i, j int) bool { return candidates[i] > candidates[j] })
		dirs = append(dirs, candidates...)
	}
	return dirs
}

func macTeXPath() string {
	paths := []string{"/Library/TeX/texbin", "/opt/homebrew/bin", "/usr/local/bin", "/usr/bin", "/bin", "/usr/sbin", "/sbin"}
	if configured := strings.TrimSpace(os.Getenv("PATH")); configured != "" {
		paths = append([]string{configured}, paths...)
	}
	return strings.Join(paths, string(os.PathListSeparator))
}

// TeX is confined to the per-request temporary directory with no shell escape.
// Only the minimal environment is passed to the compiler.
func texEnvironment(workDir string) []string {
	keep := []string{"HOME", "USER", "LOGNAME", "LANG", "LC_ALL", "SHELL", "TZ"}
	env := make([]string, 0, len(keep)+8)
	for _, key := range keep {
		if value, ok := os.LookupEnv(key); ok && value != "" {
			env = append(env, key+"="+value)
		}
	}
	env = append(env,
		"PATH="+macTeXPath(),
		"TMPDIR="+workDir,
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

// macOS has no Win32 console window to hide.
func hideWindow(_ *exec.Cmd) {}
