# AERTEX Bridge for macOS (native)

This is a source-level port of the Go Windows Bridge, not an EXE renamed to DMG. It implements the same loopback HTTP endpoints and TeX compilation pipeline. The native macOS response uses `runtime: native-macos` and `platform: darwin`, instead of deliberately misreporting Windows.

## Features / compatibility

- Loopback only: `127.0.0.1:32145`; `GET /health`, `GET /tex/status`, `POST /tex/compile`.
- Strict allowed web origins and Host checking, including `https://work.qsseda.com` and `https://qsseda.com`.
- XeLaTeX and pdfLaTeX via MacTeX/TeX Live/Homebrew, three compilation passes, BibTeX/Biber, multi-file projects and PDF response.
- Original request limits, TeX source and asset protections, per-job temporary directories, no shell escape, bounded execution time and compilation concurrency.
- Autostart via `/Library/LaunchAgents/com.aertex.bridge.plist` on user login. No root daemon.
- Native universal executable (Apple Silicon + Intel); no Node, PowerShell, or Windows emulation.

The existing Windows package and download URL remain untouched. On macOS, the AERTEX Work website recognizes the `native-macos` Bridge over the same localhost API and offers a macOS PKG when it has been published.

## Build, install and test

A successful `Build AERTEX Bridge macOS Packages` GitHub Actions run uploads `AERTEX-Bridge-macOS-universal.pkg` and `AERTEX-Bridge-macOS-universal.dmg` as build artifacts. The DMG contains the PKG; use either file, not both.

**Official release policy for this build: unsigned and not notarized.** We do **not** require a paid Apple Developer Program subscription, Developer ID Application/Installer certificate, notarization credentials, or an Apple ID to build AERTEX Bridge. The macOS workflow deliberately publishes these unsigned binaries after its unit tests and smoke tests pass on the `main` branch; PR builds are downloadable only as GitHub Actions artifacts.

Unsigned packages do **not** receive Apple's developer identity and notarization checks. macOS Gatekeeper can block them by default. Download only from the intended AERTEX/GitHub source, review the build workflow, and check the SHA-256 checksum in the Actions build log before choosing to trust the file.

To install the unsigned PKG without disabling macOS security globally:

1. Double-click `AERTEX-Bridge-macOS-universal.pkg`; a Gatekeeper warning may appear. Dismiss it.
2. Open **System Settings → Privacy & Security**. If macOS offers **Open Anyway** for this installer, select it, authenticate and follow the prompts. The override is limited to the chosen software. This button typically appears only after an initial blocked launch.
3. If macOS reports malware or a damaged/tampered installer, **do not bypass the warning**; check the artifact and source instead.

Apple's official instructions: https://support.apple.com/en-us/102445

The DMG contains the same unsigned PKG. There is no need to install both. This release process does **not** run `spctl --master-disable`, remove quarantine attributes automatically, or change system-wide Gatekeeper settings.

The PKG installs the executable at `/Library/Application Support/AERTEX Bridge/AERTEX-Bridge`. Once a logged-in user session is active, `launchctl` loads it through the LaunchAgent. Verify:

```sh
"/Library/Application Support/AERTEX Bridge/AERTEX-Bridge" --status
curl -fsS http://127.0.0.1:32145/health
curl -fsS http://127.0.0.1:32145/tex/status
```

`QSSEDA_XELATEX` / `QSSEDA_PDFLATEX` can override the compiler executable path. Because LaunchAgents do not inherit interactive shell environment, default lookup checks `/Library/TeX/texbin` and standard Homebrew / TeX Live installation directories.

For uninstall, run `sudo "/Library/Application Support/AERTEX Bridge/uninstall.command"` (also removes launch-on-login).

**Security scope:** this port preserves the Windows engine's restrictions; it is not a complete operating-system sandbox. TeX should still be treated as processing untrusted documents. An unsigned build gives users less verification of publisher identity and software integrity than an Apple-signed/notarized build; this is a deliberate trade-off, not proof of safety.
