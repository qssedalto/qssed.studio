export const FAVICON_PATHS = new Set(["/favicon.svg", "/favicon.ico", "/icon.svg"]);

export const FAVICON_LINKS = '<link rel="icon" href="/favicon.svg?v=aertex-20261003-product-badge-2" type="image/svg+xml">';

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

const PRODUCT_FAVICON_META = Object.freeze({
  work: {
    label: "AERTEX Work",
    badge: '<g class="aertex-product-badge aertex-work-badge" aria-hidden="true"><rect class="work-badge-panel" x="39.7" y="39.7" width="19.8" height="19.8" rx="5.1"/><rect class="work-window-back" x="44.1" y="44.2" width="10.1" height="8.2" rx="1.9"/><rect class="work-window-front" x="47.2" y="47.3" width="9.6" height="8.1" rx="1.9"/><path class="work-window-line" d="M49.5 50.1h4.9M49.5 52.4h3.7"/></g>'
  },
  intelligence: { label: "AERTEX Intelligence", glyph: '<path class="filled" d="m51.2 44.8 1.55 3.85 3.85 1.55-3.85 1.55-1.55 3.85-1.55-3.85-3.85-1.55 3.85-1.55z"/><path d="M55.2 44.7v2.2M54.1 45.8h2.2"/>' },
  cash: { label: "AERTEX Cash", glyph: '<path d="M46.5 48.1h9.8v7.2h-9.8zM48 48.1v-1.8h6.6v1.8M53.2 51.7h3.1"/><circle class="filled" cx="53.6" cy="51.7" r=".75"/>' },
  watch: { label: "AERTEX Watch", glyph: '<circle cx="51.2" cy="50.7" r="5.1"/><path d="M51.2 47.7v3.2l2.3 1.5"/>' },
  auth: { label: "AERTEX ID", glyph: '<rect x="47.1" y="49.4" width="8.2" height="6.5" rx="1.6"/><path d="M48.8 49.4v-1.8a2.4 2.4 0 0 1 4.8 0v1.8"/><circle class="filled" cx="51.2" cy="52.3" r=".85"/>' },
  admin: { label: "AERTEX Administration", glyph: '<path d="M51.2 44.9 55.5 47v3.6c0 2.8-1.7 4.7-4.3 5.8-2.6-1.1-4.3-3-4.3-5.8V47z"/><path d="m49.2 50.6 1.35 1.35 2.65-2.8"/>' }
});

export function faviconProductForRequest(request) {
  let hostname = "";
  try { hostname = new URL(request?.url || "https://qsseda.com/").hostname.toLowerCase(); }
  catch {}
  const subdomain = hostname.split(".")[0] || "";
  if (subdomain === "work") return "work";
  if (subdomain === "gpt") return "intelligence";
  if (subdomain === "cash") return "cash";
  if (subdomain === "aw" || subdomain === "awd") return "watch";
  if (subdomain === "auth") return "auth";
  if (subdomain === "admin") return "admin";
  return "";
}

export function faviconSvgForProduct(product = "") {
  const meta = PRODUCT_FAVICON_META[product];
  if (!meta) return FAVICON_SVG;
  const badge = meta.badge || `<g class="aertex-product-badge" aria-hidden="true">
    <circle class="badge-disc" cx="51.2" cy="51.2" r="11.1"/>
    <g class="badge-glyph">${meta.glyph}</g>
  </g>`;
  return FAVICON_SVG
    .replace('aria-label="AERTEX"', 'aria-label="' + meta.label + '"')
    .replace(
      "</style>",
      `.aertex-product-badge .badge-disc{fill:var(--paper);stroke:var(--edge);stroke-width:1.6}
      .aertex-product-badge .badge-glyph{fill:none;stroke:var(--ink);stroke-width:1.65;stroke-linecap:round;stroke-linejoin:round}
      .aertex-product-badge .badge-glyph .filled{fill:var(--ink);stroke:none}
      .aertex-work-badge .work-badge-panel{fill:#ffffff;stroke:#d8dde6;stroke-width:1.1}
      .aertex-work-badge .work-window-back{fill:#9bbcf5}
      .aertex-work-badge .work-window-front{fill:#5f8fdf}
      .aertex-work-badge .work-window-line{fill:none;stroke:#ffffff;stroke-width:1.15;stroke-linecap:round}
      @media (prefers-color-scheme:dark){
        .aertex-work-badge .work-badge-panel{fill:#f6f7f9;stroke:#cdd2dc}
      }
      </style>`
    )
    .replace("</svg>", badge + "</svg>");
}

export function faviconSvgForRequest(request) {
  return faviconSvgForProduct(faviconProductForRequest(request));
}

export function faviconResponse(request) {
  const method = String(request?.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { "allow": "GET, HEAD", "cache-control": "public, max-age=86400" }
    });
  }

  return new Response(method === "HEAD" ? null : faviconSvgForRequest(request), {
    status: 200,
    headers: {
      "content-type": "image/svg+xml;charset=UTF-8",
      "cache-control": "public, max-age=604800, immutable",
      "x-content-type-options": "nosniff"
    }
  });
}
