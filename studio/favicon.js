export const FAVICON_PATHS = new Set(["/favicon.svg", "/favicon.ico"]);

export const FAVICON_LINKS = '<link rel="icon" href="/favicon.svg" type="image/svg+xml">';

export const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="AERTEX">
  <style>
    :root{--paper:#ffffff;--ink:#121417;--edge:#121417}
    @media (prefers-color-scheme:dark){
      :root{--paper:#121417;--ink:#ffffff;--edge:#ffffff}
    }
  </style>

  <!-- Angular outer tile: deliberately chamfered instead of rounded. -->
  <path d="M14 4H50L60 14V50L50 60H14L4 50V14Z"
        fill="var(--paper)"
        stroke="var(--edge)"
        stroke-opacity=".18"
        stroke-width="1.25"/>

  <!-- Broken angular orbit. The ring is faceted; only the center mark is softened. -->
  <path d="M12 27V21L18 11L26 7V13L22 15L18 22V27Z" fill="var(--ink)"/>
  <path d="M52 27V21L46 11L38 7V13L42 15L46 22V27Z" fill="var(--ink)"/>
  <path d="M19 48L24 54H40L45 48L40 45L37 49H27L24 45Z" fill="var(--ink)"/>

  <!-- Three-way core: rounded joins, matching the approved C direction. -->
  <path d="M32 13V31M32 31L17 40M32 31L47 40"
        fill="none"
        stroke="var(--ink)"
        stroke-width="9"
        stroke-linecap="round"
        stroke-linejoin="round"/>
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
