// Browser-side session continuity for AERTEX products. This deliberately keeps
// long-lived Supabase refresh tokens ONLY on the Auth host. An authenticated
// same-site, origin-restricted iframe supplies a short-lived access token and
// updates the destination's host-only cookie without navigation or losing drafts.
export function ssoBrowserRuntime() {
  return String.raw`
      (function aertexSsoBrowserContinuity() {
        if (window.__aertexSsoRenew) return;
        var host = location.hostname.toLowerCase();
        var root = host === "qsseda.com" || host.endsWith(".qsseda.com") ? "qsseda.com"
          : host === "qsseda.studio" || host.endsWith(".qsseda.studio") ? "qsseda.studio" : "";
        if (!root || host.startsWith("auth.")) return;
        var authOrigin = "https://auth." + root;
        var placeholder = "aertex-sso-browser-no-refresh-v1";
        var pending = null;
        var timer = null;
        var nextAttempt = 0;
        function decodeExpiry(token) {
          try {
            var payload = JSON.parse(atob(token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));
            return Number(payload.exp) * 1000 || 0;
          } catch { return 0; }
        }
        function schedule(delay) {
          if (timer) clearTimeout(timer);
          timer = setTimeout(function() { void window.__aertexSsoRenew("timer"); }, Math.max(2000, Math.min(delay, 2147483647)));
        }
        function planFromToken(token) {
          var exp = decodeExpiry(token);
          schedule(exp ? Math.max(2000, exp - Date.now() - 10 * 60 * 1000) : 5 * 60 * 1000);
        }
        window.__aertexSsoRenew = function (reason) {
          if (pending) return pending;
          if (document.visibilityState === "hidden" && reason === "timer") {
            schedule(2 * 60 * 1000);
            return Promise.resolve(false);
          }
          if (Date.now() < nextAttempt && reason !== "manual") return Promise.resolve(false);
          pending = new Promise(function (resolve) {
            var iframe = document.createElement("iframe");
            var bytes = new Uint8Array(20);
            crypto.getRandomValues(bytes);
            var nonce = Array.from(bytes, function(x){return x.toString(16).padStart(2,"0")}).join("");
            var settled = false, handling = false;
            var timeout = setTimeout(function(){finish(false)}, 14000);
            function finish(ok, token) {
              if (settled) return;
              settled = true;
              clearTimeout(timeout);
              window.removeEventListener("message", receive);
              iframe.remove();
              if (ok && token) {
                nextAttempt = 0;
                planFromToken(token);
              } else {
                nextAttempt = Date.now() + 2 * 60 * 1000;
                schedule(2 * 60 * 1000);
              }
              resolve(Boolean(ok));
            }
            async function receive(event) {
              if (settled || handling || event.origin !== authOrigin || event.source !== iframe.contentWindow) return;
              var data = event.data;
              if (!data || data.kind !== "aertex.sso.renew.v1" || data.nonce !== nonce) return;
              handling = true;
              if (!data.ok || typeof data.access_token !== "string" || !data.access_token) { finish(false); return; }
              try {
                // Establish the authoritative server cookie first. A stale
                // account marker or revoked role must not touch browser auth.
                var res = await fetch("/api/auth/bootstrap", {
                  method:"POST", credentials:"same-origin", cache:"no-store",
                  headers:{"Content-Type":"application/json",Accept:"application/json"},
                  body:JSON.stringify({access_token:data.access_token})
                });
                if (!res.ok) { finish(false); return; }
                if (typeof supabaseClient === "undefined" || !supabaseClient?.auth?.setSession) {
                  // Cash, Watch and Intelligence use server-cookie APIs, not
                  // the Supabase browser SDK. Their host cookie is sufficient.
                  finish(true, data.access_token);
                  return;
                }
                var synced = await supabaseClient.auth.setSession({
                  access_token:data.access_token, refresh_token:placeholder
                });
                finish(!synced.error, data.access_token);
              } catch { finish(false); }
            }
            window.addEventListener("message", receive);
            iframe.setAttribute("aria-hidden", "true");
            iframe.tabIndex = -1;
            iframe.style.cssText = "position:absolute;width:0;height:0;border:0;visibility:hidden;pointer-events:none";
            iframe.referrerPolicy = "no-referrer";
            iframe.src = authOrigin + "/sso/silent?parent_origin=" + encodeURIComponent(location.origin) + "&nonce=" + nonce;
            document.body.appendChild(iframe);
          });
          var current = pending;
          current.finally(function() { if (pending === current) pending = null; });
          return current;
        };
        function readStoredSession() {
          try {
            if (typeof aertexAuthStorage === "undefined" || typeof AERTEX_SUPABASE_STORAGE_KEY === "undefined") return null;
            return JSON.parse(aertexAuthStorage.getItem(AERTEX_SUPABASE_STORAGE_KEY) || "null");
          } catch { return null; }
        }
        function initialize() {
          var stored = readStoredSession();
          if (stored && typeof stored.access_token === "string") {
            planFromToken(stored.access_token);
          } else {
            // Safari/private browsing may have refused persistent storage.
            schedule(2500);
          }
        }
        if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, {once:true});
        else initialize();
        document.addEventListener("visibilitychange", function () {
          if (document.visibilityState !== "visible") return;
          var stored = readStoredSession();
          if (!stored || decodeExpiry(stored.access_token || "") < Date.now() + 10 * 60 * 1000) {
            void window.__aertexSsoRenew("resume");
          }
        });
        window.addEventListener("online", function() { void window.__aertexSsoRenew("online"); });
      })();
  `;
}
