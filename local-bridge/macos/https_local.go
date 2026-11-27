package main

import (
	"crypto/tls"
	"errors"
	"fmt"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

const httpsBridgePort = "32146"

// Local TLS keys belong to the current Mac user, not the app bundle or Git.
// Users generate and trust a per-device certificate with mkcert. The existing
// 127.0.0.1:32145 HTTP listener remains available for the native status app.
func localTLSPaths() (string, string, error) {
	home, err := os.UserHomeDir()
	if err != nil { return "", "", err }
	dir := filepath.Join(home, "Library", "Application Support", "AERTEX Bridge", "tls")
	return filepath.Join(dir, "localhost.pem"), filepath.Join(dir, "localhost-key.pem"), nil
}

func startOptionalLocalHTTPS(handler http.Handler) {
	certFile, keyFile, err := localTLSPaths()
	if err != nil {
		logBridgeStartupFailure(fmt.Errorf("local HTTPS certificate location: %w", err))
		return
	}
	_, certErr := os.Stat(certFile)
	_, keyErr := os.Stat(keyFile)
	if errors.Is(certErr, os.ErrNotExist) && errors.Is(keyErr, os.ErrNotExist) {
		// HTTPS is an opt-in feature; this is a valid state for new installs.
		return
	}
	if certErr != nil || keyErr != nil {
		logBridgeStartupFailure(fmt.Errorf("local HTTPS certificate pair incomplete: certificate=%v key=%v", certErr, keyErr))
		return
	}

	// Validate the pair before claiming a listening port.
	if _, err := tls.LoadX509KeyPair(certFile, keyFile); err != nil {
		logBridgeStartupFailure(fmt.Errorf("local HTTPS certificate pair invalid: %w", err))
		return
	}
	addr := net.JoinHostPort(bridgeHost, httpsBridgePort)
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		logBridgeStartupFailure(fmt.Errorf("could not listen on local HTTPS %s: %w", addr, err))
		return
	}
	server := &http.Server{
		Addr:              addr,
		Handler:           handler,
		TLSConfig:         &tls.Config{MinVersion: tls.VersionTLS12},
		ReadHeaderTimeout: 3 * time.Second,
		ReadTimeout:       8 * time.Second,
		WriteTimeout:      115 * time.Second,
		IdleTimeout:       30 * time.Second,
	}
	go func() {
		if err := server.ServeTLS(listener, certFile, keyFile); err != nil {
			logBridgeStartupFailure(fmt.Errorf("local HTTPS server: %w", err))
		}
	}()
}
