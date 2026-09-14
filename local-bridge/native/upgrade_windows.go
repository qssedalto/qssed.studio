package main

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"time"
)

// A foreground launch of a newly downloaded Bridge is also the update path.
// Stop only a verified QssedA listener on the fixed loopback port before
// installSelf replaces the installed EXE. This prevents an old Bridge process
// from continuing to own 32145 after an upgrade.
func init() {
	args := os.Args[1:]
	if hasArg(args, "--background") || hasArg(args, "--uninstall") {
		return
	}
	_ = stopVerifiedBridgeForUpgrade()
}

type upgradeHealth struct {
	Service  string `json:"service"`
	Protocol int    `json:"protocol"`
}

func stopVerifiedBridgeForUpgrade() error {
	if !verifiedBridgeForUpgrade() {
		return nil
	}

	pid := listenerPIDForUpgrade()
	if pid == "" || pid == fmt.Sprint(os.Getpid()) {
		return nil
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
	return payload.Service == bridgeService && payload.Protocol == protocol
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
