# AERTEX Bridge: enable Safari with private localhost HTTPS

## Why

Safari on some macOS versions blocks active mixed content from public HTTPS websites such as `https://work.qsseda.com` to `http://127.0.0.1:32145`. Safari may return `Request.targetAddressSpace === undefined`, so setting the experimental `targetAddressSpace: "loopback"` option is not a general solution.

AERTEX Bridge 0.5.7 adds an optional HTTPS listener **only on `127.0.0.1:32146`**. It retains the existing HTTP listener `127.0.0.1:32145` for the native manager and browsers that support it. The Work website first tries HTTPS, then the earlier endpoints.

The private key is generated *on your Mac* and stays in your home directory. We do not embed it in the app, website, GitHub Actions artifacts, or Cloudflare.

## Setup — once per Mac

Using ZSH on the Mac, with Homebrew already installed:

~~~zsh
command -v mkcert >/dev/null 2>&1 || brew install mkcert
~~~

Trust the development CA on your own Mac:

~~~zsh
mkcert -install
~~~

**Important**: This creates and trusts a local development CA. You may be asked for an administrator password to approve keychain trust. Trust only your own CA; protect `$(mkcert -CAROOT)/rootCA-key.pem` and never upload, email, or commit it. This step is distinct from signing the app, and does not require any paid Apple Developer certificates.

Create the localhost service certificate and a local private key:

~~~zsh
TLS_DIR="$HOME/Library/Application Support/AERTEX Bridge/tls"; mkdir -p "$TLS_DIR" && chmod 700 "$TLS_DIR" && mkcert -cert-file "$TLS_DIR/localhost.pem" -key-file "$TLS_DIR/localhost-key.pem" localhost 127.0.0.1 ::1 && chmod 600 "$TLS_DIR/localhost-key.pem"
~~~

Do not put the key in the `.app`. No certificate is bundled in public downloads.

## Upgrade from 0.5.6

1. In 0.5.6 manager, click **停止并取消自启**, then quit the App. This avoids a port conflict.
2. Replace it with the portable 0.5.7 `AERTEX Bridge.app` in your preferred directory (including an external SSD).
3. Use your existing **Apple Development** certificate to sign the new app and its embedded Go service for personal use. This app signing is independent of local TLS.
4. Open the 0.5.7 manager, click **启动服务并登录自启**. If you generated the certificate after startup, restart the Bridge via the same button.
5. The manager should show **Safari 安全连接：已启用**. If it does not, check the local Bridge startup log under `~/Library/Logs/AERTEX Bridge/`.

## Verify local HTTPS

Do NOT use `curl -k` on your own Mac during normal verification: that would hide certificate trust problems.

~~~zsh
curl -fsSi -H 'Origin: https://work.qsseda.com' https://127.0.0.1:32146/health
~~~

You should see HTTP 200 and `Access-Control-Allow-Origin: https://work.qsseda.com`. Then test the actual TeX endpoint:

~~~zsh
curl -fsS -H 'Origin: https://work.qsseda.com' https://127.0.0.1:32146/tex/status
~~~

Finally, fully restart Safari (if necessary), open `https://work.qsseda.com/zh-cn/tex`, and click **检测连接**. A trusted `https://127.0.0.1:32146` fetch will not be mixed active HTTP content.

If the page still reports offline, check Safari Web Inspector **Network** to see which localhost URL failed and why. Do not disable Gatekeeper or Safari security settings globally.

## Scope

- This is **personal development HTTPS**, not Internet-facing PKI or Developer ID notarization.
- The listener binds to **127.0.0.1 only**, not 0.0.0.0.
- The certificate and key are never bundled or transmitted to the website.
- Existing origin/Host validation, protocol checks, TeX security checks, and Windows functionality remain unchanged.
- If the certificate is not installed, the HTTP service still starts and the portable app remains usable.
- A local root CA is powerful. Avoid using it beyond development and keep its private key secure.

References:
- https://github.com/FiloSottile/mkcert
- https://developer.mozilla.org/en-US/docs/Web/API/Request/targetAddressSpace
- https://bugs.webkit.org/show_bug.cgi?id=171934
