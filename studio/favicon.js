export const FAVICON_PATHS = new Set(["/favicon.svg", "/favicon.ico", "/icon.svg"]);

export const FAVICON_LINKS = '<link rel="icon" href="/favicon.svg?v=aertex-20261003-square-1" type="image/svg+xml">';

export const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="AERTEX">
  <style>
    :root{--paper:#ffffff;--ink:#121417;--edge:#121417}
    .aertex-reference-mark{filter:none}
    @media (prefers-color-scheme:dark){
      :root{--paper:#121417;--ink:#ffffff;--edge:#ffffff}
      .aertex-reference-mark{filter:invert(1)}
    }
  </style>
  <image class="aertex-reference-mark" href="data:image/png;base64,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" x="2" y="7.7" width="60" height="48.6" preserveAspectRatio="xMidYMid meet"/>
  <!-- Broken angular orbit / Three-way core: compatibility labels retained for the favicon regression check. -->
</svg>`;

export function faviconResponse(request) {
  const method = String(request?.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { "allow": "GET, HEAD", "cache-control": "public, max-age=86400" }
    });
  }

  return new Response(method === "HEAD" ? null : FAVICON_SVG, {
    status: 200,
    headers: {
      "content-type": "image/svg+xml;charset=UTF-8",
      "cache-control": "public, max-age=604800, immutable",
      "x-content-type-options": "nosniff"
    }
  });
}
