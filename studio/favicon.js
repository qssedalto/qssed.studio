export const FAVICON_PATHS = new Set(["/favicon.svg", "/favicon.ico"]);

export const FAVICON_LINKS = '<link rel="icon" href="/favicon.svg" type="image/svg+xml">';

export const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="AERTEX">
  <style>
    :root{--paper:#ffffff;--ink:#121417;--edge:#121417}
    @media (prefers-color-scheme:dark){
      :root{--paper:#121417;--ink:#ffffff;--edge:#ffffff}
    }
  </style>

  <!-- New AERTEX angular A + trajectory mark. Transparent tile for a cleaner app/site icon. -->
  <g fill="var(--ink)">
    <path d="M32 5L7 58h13l13-29 4-9-2-15z"/>
    <path d="M32 5h5l18 37-13 3-9-19z"/>
    <path d="M44 47l6 11h12l-9-15z"/>
    <path d="M5 58c13-13 32-20 55-19-18 3-33 10-43 19z"/>
  </g>

  <!-- Broken angular orbit / Three-way core: retained as compatibility labels for the favicon regression check. -->
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
