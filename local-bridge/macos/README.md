# AERTEX Bridge for macOS (native)

This is a source-level port of the Go Windows Bridge, not an EXE renamed to DMG. It implements the same loopback HTTP endpoints and TeX compilation pipeline. The native macOS response uses `runtime: native-macos` and `platform: darwin`, instead of deliberately misreporting Windows.

## Features / compatibility

- Loopback only: `127.0.0.1:32145`; `GET /health`, `GET /tex/status`, `POST /tex/compile`.
- Strict allowed web origins and Host checking, including `https://work.qsseda.com` and `https://qsseda.com`.
- XeLaTeX and pdfLaTeX via MacTeX/TeX Live/Homebrew, three compilation passes, BibTeX/Biber, multi-file projects and PDF response.
- Original request limits, TeX source and asset protections, per-job temporary directories, no shell escape, bounded execution time and compilation concurrency.
- Autostart via `/Library/LaunchAgents/com.aertex.bridge.plist` on user login. No root daemon.
- Native universal executable (Apple Silicon + Intel); no Node, PowerShell, or Windows emulation.

The existing Windows package remains untouched. The site may still only advertise the Windows download: update the frontend and add a macOS API download route separately after verifying the browser platform logic.

## Build, install and test

A successful `Build AERTEX Bridge macOS Packages` GitHub Actions run uploads `AERTEX-Bridge-macOS-universal.pkg` and `AERTEX-Bridge-macOS-universal.dmg` as build artifacts. The DMG contains the PKG; use either file, not both.

If installing the unsigned development PKG, macOS Gatekeeper may require explicit user approval. No signing or notarization is claimed. For public distribution, supply an Apple Developer ID Installer signing identity and notarize both deliverables.

The PKG installs the executable at `/Library/Application Support/AERTEX Bridge/AERTEX-Bridge`. Once a logged-in user session is active, `launchctl` loads it through the LaunchAgent. Verify:

```sh
"/Library/Application Support/AERTEX Bridge/AERTEX-Bridge" --status
curl -fsS http://127.0.0.1:32145/health
curl -fsS http://127.0.0.1:32145/tex/status
```

`QSSEDA_XELATEX` / `QSSEDA_PDFLATEX` can override the compiler executable path. Because LaunchAgents do not inherit interactive shell environment, default lookup checks `/Library/TeX/texbin` and standard Homebrew / TeX Live installation directories.

For uninstall, run `sudo "/Library/Application Support/AERTEX Bridge/uninstall.command"` (also removes launch-on-login).

**Security scope:** this port preserves the Windows engine's restrictions; it is not a complete operating-system sandbox. TeX should still be treated as processing untrusted documents. The installer is intended to be reviewed and signed before public distribution.
