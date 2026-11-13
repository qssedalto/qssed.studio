package main

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/exec"
	"errors"
	"strconv"
	"strings"
	"time"
)

// Upgrades are explicit and occur only after installer preflight checks.
// There are deliberately no init() side effects or process kills on launch.
type upgradeHealth struct {
	Service  string `json:"service"`
	Protocol int    `json:"protocol"`
	Runtime string `json:"runtime"`
}

func stopVerifiedBridgeForUpgrade() error {
	if !verifiedBridgeForUpgrade() {
		return nil
	}

	pid := listenerPIDForUpgrade()
	if pid == "" {
		return errors.New("could not identify the previous Bridge listener; refusing to kill an unknown process")
	}
	if pid == fmt.Sprint(os.Getpid()) {
		return errors.New("refusing to stop the currently running installer")
	}
	pidNumber, parseErr := strconv.Atoi(pid)
	if parseErr != nil { return fmt.Errorf("invalid listener PID: %w",parseErr) }
	actualPath, pathErr := processImagePath(pidNumber)
	if pathErr != nil { return fmt.Errorf("cannot verify previous Bridge process path: %w",pathErr) }
	installedPath, installErr := installedBridgePath()
	if installErr != nil { return installErr }
	if !samePath(actualPath,installedPath) {
		return fmt.Errorf("listener PID %s belongs to %q, not installed AERTEX Bridge; no process was terminated",pid,actualPath)
	}

	cmd := exec.Command("taskkill.exe", "/PID", pid, "/F")
	hideWindow(cmd)
	if output, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("stop existing bridge: %w (%s)", err, strings.TrimSpace(string(output)))
	}

	deadline := time.Now().Add(3 * time.Second)
	for time.Now().Before(deadline) {
		connection, err := net.DialTimeout("tcp", net.JoinHostPort(bridgeHost, bridgePort), 120*time.Millisecond)
		if err != nil {
			return nil
		}
		_ = connection.Close()
		time.Sleep(80 * time.Millisecond)
	}
	return fmt.Errorf("existing bridge did not release %s:%s", bridgeHost, bridgePort)
}

func verifiedBridgeForUpgrade() bool {
	client := &http.Client{Timeout: 650 * time.Millisecond}
	response, err := client.Get("http://" + net.JoinHostPort(bridgeHost, bridgePort) + "/health")
	if err != nil {
		return false
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return false
	}

	var payload upgradeHealth
	if err := json.NewDecoder(response.Body).Decode(&payload); err != nil {
		return false
	}
	return payload.Service == bridgeService && payload.Protocol == protocol && payload.Runtime == "native-windows"
}

func listenerPIDForUpgrade() string {
	cmd := exec.Command("netstat.exe", "-ano", "-p", "tcp")
	hideWindow(cmd)
	output, err := cmd.Output()
	if err != nil {
		return ""
	}

	target := net.JoinHostPort(bridgeHost, bridgePort)
	for _, line := range strings.Split(string(output), "\n") {
		fields := strings.Fields(line)
		if len(fields) < 5 || !strings.EqualFold(fields[0], "TCP") {
			continue
		}
		if fields[1] != target || !strings.EqualFold(fields[3], "LISTENING") {
			continue
		}
		return fields[len(fields)-1]
	}
	return ""
}
