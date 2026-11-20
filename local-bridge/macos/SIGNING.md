# AERTEX Bridge for macOS: signing and notarization

This guide applies to the **0.5.5 preview** from PR #439. The preview is **not signed or notarized**; never label it as a Developer ID release until Apple verifies it.

## 1. Inspect local identities (read-only)

On the Mac that will sign the build:

~~~zsh
security find-identity -v -p codesigning
security find-certificate -a -c "Developer ID Installer" -Z
~~~

An `Apple Development` certificate (including a Personal Team certificate) is **not** a `Developer ID Application` or `Developer ID Installer` distribution certificate.

For normal Gatekeeper-compatible downloads outside the Mac App Store, enroll in the **Apple Developer Program** and issue these two identities from your developer account (Account Holder role):

- `Developer ID Application` — signs the Go executable and `AERTEX Bridge.app`.
- `Developer ID Installer` — signs the final `.pkg`.

See https://developer.apple.com/help/account/certificates/create-developer-id-certificates

## 2. Build an unsigned test artifact

Use the workflow **Build AERTEX Bridge macOS Packages (unsigned)** from PR #439. Download its artifact `aertex-bridge-macos-universal` from the successful macOS GitHub Actions run.

If you have checked out the branch locally, build using macOS/Xcode tools: Go, `swift`, `swiftc`, `iconutil`, `pkgbuild`, and `productbuild`. Do not sign or publish until you have verified the actual installed service.

## 3. Understand the signing order

The correct sequence is **build binaries → Developer ID Application sign each executable and app bundle → create the PKG → Developer ID Installer sign the final PKG → notarize → staple and verify**.

Do not merely run `productsign` on the existing preview PKG: the executables inside are not Developer ID signed.

For illustration, after rebuilding a staging tree, and after replacing the placeholders with your actual installed identity names:

~~~zsh
codesign --force --options runtime --timestamp --sign "Developer ID Application: YOUR TEAM (TEAMID)" "pkgroot/Library/Application Support/AERTEX Bridge/AERTEX-Bridge"
codesign --force --options runtime --timestamp --sign "Developer ID Application: YOUR TEAM (TEAMID)" "pkgroot/Applications/AERTEX Bridge.app"
codesign --verify --strict --verbose=2 "pkgroot/Applications/AERTEX Bridge.app"
~~~

Now rebuild the **component package** with `pkgbuild` and the **distribution package** with `productbuild`, then sign the final distribution package:

~~~zsh
productsign --sign "Developer ID Installer: YOUR TEAM (TEAMID)" AERTEX-Bridge-macOS-universal-unsigned.pkg AERTEX-Bridge-macOS-universal-signed.pkg
pkgutil --check-signature AERTEX-Bridge-macOS-universal-signed.pkg
~~~

Choose exact installed identity names from Keychain / `security find-identity`; the placeholders are not literal commands to run unchanged.

## 4. Set up notarization credentials (once)

After enabling two-factor authentication and creating an app-specific password, register credentials in macOS Keychain:

~~~zsh
xcrun notarytool store-credentials "aertex-notary" --apple-id "YOUR_APPLE_ID" --team-id "YOUR_TEAM_ID" --password "YOUR_APP_SPECIFIC_PASSWORD"
~~~

Do not commit these credentials, passwords, private keys or `.p12` files to GitHub.

Submit the signed package:

~~~zsh
xcrun notarytool submit AERTEX-Bridge-macOS-universal-signed.pkg --keychain-profile "aertex-notary" --wait
xcrun stapler staple AERTEX-Bridge-macOS-universal-signed.pkg
xcrun stapler validate AERTEX-Bridge-macOS-universal-signed.pkg
pkgutil --check-signature AERTEX-Bridge-macOS-universal-signed.pkg
~~~

`notarytool` must report **Accepted** before stapling. If rejected, inspect the submission log first; do not distribute as notarized.

## 5. Test on the actual Mac

Install the candidate PKG. Verify the app icon and status window, then verify the background service:

~~~zsh
"/Library/Application Support/AERTEX Bridge/AERTEX-Bridge" --status
curl -fsS http://127.0.0.1:32145/health
curl -fsS http://127.0.0.1:32145/tex/status
~~~

Verify actual XeLaTeX PDF compilation, sign out and back in to test LaunchAgent login start, and test uninstall. Only after all checks pass should the release job replace the existing R2 objects.

## 6. Current limitations

A free Personal Team may sign development builds for personal testing but cannot produce the Developer ID distribution identities required for Apple notarization. If you keep the build unsigned, retain truthful installer disclosures; never disable Gatekeeper globally to create an illusion of successful signing.

Official references:
- https://developer.apple.com/developer-id/
- https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution
- https://developer.apple.com/documentation/security/resolving-common-notarization-issues
