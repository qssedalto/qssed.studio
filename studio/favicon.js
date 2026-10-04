const FAVICON_VERSION = "aertex-20261004-safari-theme-1";

export const FAVICON_PATHS = new Set([
  "/favicon.svg",
  "/favicon.ico",
  "/icon.svg",
  "/favicon-light.svg",
  "/favicon-dark.svg",
  "/apple-touch-icon.png"
]);

export const FAVICON_LINKS = [
  '<link rel="icon" href="/favicon-dark.svg?v=' + FAVICON_VERSION + '" type="image/svg+xml">',
  '<link rel="icon" href="/favicon-light.svg?v=' + FAVICON_VERSION + '" type="image/svg+xml" media="(prefers-color-scheme: light)">',
  '<link rel="icon" href="/favicon-dark.svg?v=' + FAVICON_VERSION + '" type="image/svg+xml" media="(prefers-color-scheme: dark)">',
  '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=' + FAVICON_VERSION + '">'
].join("");

const APPLE_TOUCH_ICON_PNG_BASE64 = "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";

export const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="AERTEX">
  <style>
    :root{--paper:#ffffff;--ink:#121417;--edge:#121417}
    .aertex-reference-mark,.aertex-badge-mark{filter:none}
    @media (prefers-color-scheme:dark){
      :root{--paper:#121417;--ink:#ffffff;--edge:#ffffff}
      .aertex-reference-mark,.aertex-badge-mark{filter:invert(1)}
    }
  </style>
  <image class="aertex-reference-mark" href="data:image/png;base64,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" x="2" y="7.7" width="60" height="48.6" preserveAspectRatio="xMidYMid meet"/>
  <!-- Broken angular orbit / Three-way core: compatibility labels retained for the favicon regression check. -->
</svg>`;

const AERTEX_REFERENCE_HREF = FAVICON_SVG.match(/<image class="aertex-reference-mark" href="([^"]+)"/)?.[1] || "";

const PRODUCT_FAVICON_META = Object.freeze({
  work: {
    label: "AERTEX Work",
    mainX: 27.1,
    mainY: 28,
    mainScale: 3.25,
    glyph: '<path d="M-1.4-4.6h-1.8A1.8 1.8 0 0 0-5-2.8v6A1.8 1.8 0 0 0-3.2 5h6A1.8 1.8 0 0 0 4.6 3.2V1.4"/><path d="M-1.55 1.8-.85-.45 2.6-3.9a1.05 1.05 0 0 1 1.48 0l.48.48a1.05 1.05 0 0 1 0 1.48L1.1 1.5l-2.65.3z"/>'
  },
  intelligence: {
    label: "AERTEX Intelligence",
    mainX: 27.1,
    mainY: 27.8,
    mainScale: 3.25,
    glyph: '<g class="intelligence-stars" transform="scale(1.16)"><path class="filled intelligence-star-main" d="M-1-3.04-.10-.75 2.25.15-.10 1.05-1 3.34-1.90 1.05-4.25.15-1.90-.75Z"/><path class="filled intelligence-star-small" d="M2.8-3.7 3.1-3 3.8-2.7 3.1-2.4 2.8-1.7 2.5-2.4 1.8-2.7 2.5-3Z"/></g>'
  },
  cash: {
    label: "AERTEX Cash",
    mainX: 27,
    mainY: 28.4,
    mainScale: 3.1,
    glyph: '<rect x="-5.2" y="-2.6" width="10.4" height="6.6" rx="1.35"/><path d="M-3.5-2.6V-4h7v1.4M2 .7h3.2"/><circle class="filled" cx="2.8" cy=".7" r=".72"/>'
  },
  watch: {
    label: "AERTEX Watch",
    mainX: 27.2,
    mainY: 27.7,
    mainScale: 3.2,
    glyph: '<circle cx="0" cy="0" r="5"/><path d="M0-3.1V0l2.45 1.65"/>'
  },
  auth: {
    label: "AERTEX ID",
    mainX: 27,
    mainY: 28.7,
    mainScale: 3.45,
    glyph: '<rect x="-4.3" y="-.7" width="8.6" height="5.5" rx="1.5"/><path d="M-2.6-.7v-1.6a2.6 2.6 0 0 1 5.2 0v1.6"/><circle class="filled" cx="0" cy="2" r=".75"/>'
  },
  admin: {
    label: "AERTEX Administration",
    mainX: 27.2,
    mainY: 27.7,
    mainScale: 3.1,
    glyph: '<path d="M0-5 4.5-2.8V.4c0 2.55-1.65 4.25-4.5 5.4C-2.85 4.65-4.5 2.95-4.5.4v-3.2z"/><path d="m-2 0 1.35 1.35L2.25-1.7"/>'
  }
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

  const productShell = FAVICON_SVG
    .replace('aria-label="AERTEX"', 'aria-label="' + meta.label + '"')
    .replace(/\s*<image class="aertex-reference-mark"[^>]*\/>/, "");

  const knockout = `<defs>
    <mask id="aertex-product-main-knockout" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
      <rect x="0" y="0" width="64" height="64" fill="#fff"/>
      <circle class="brand-badge-cutout" cx="51.6" cy="51.6" r="10.5" fill="#000"/>
    </mask>
  </defs>`;

  const mainGlyph = `<g class="aertex-product-main aertex-${product}-main" aria-hidden="true" mask="url(#aertex-product-main-knockout)">
    <g class="product-main-glyph" transform="translate(${meta.mainX} ${meta.mainY}) scale(${meta.mainScale})">${meta.glyph}</g>
  </g>`;

  const brandBadge = `<g class="aertex-brand-badge" aria-hidden="true">
    <circle class="brand-badge-disc" cx="51.6" cy="51.6" r="8.7"/>
    <image class="aertex-badge-mark" href="${AERTEX_REFERENCE_HREF}" x="45.4" y="46.55" width="12.4" height="10.05" preserveAspectRatio="xMidYMid meet"/>
  </g>`;

  return productShell
    .replace(
      "</style>",
      `.aertex-product-main .product-main-glyph{fill:none;stroke:var(--ink);stroke-width:.52;stroke-linecap:round;stroke-linejoin:round}
      .aertex-product-main .product-main-glyph .filled{fill:var(--ink);stroke:none}
      .aertex-brand-badge .brand-badge-disc{fill:none;stroke:var(--edge);stroke-width:1.4}
      </style>`
    )
    .replace("</svg>", knockout + mainGlyph + brandBadge + "</svg>");
}

function forcedFaviconTheme(svg, theme) {
  const dark = theme === "dark";
  const paper = dark ? "#121417" : "#ffffff";
  const ink = dark ? "#ffffff" : "#121417";
  const filter = dark ? "invert(1)" : "none";
  const override = `
    :root{--paper:${paper}!important;--ink:${ink}!important;--edge:${ink}!important}
    .aertex-reference-mark,.aertex-badge-mark{filter:${filter}!important}
  `;
  return String(svg)
    .replace("</style>", override + "</style>")
    .replace("</style>", "</style>\n  <rect class=\"favicon-background\" x=\"0\" y=\"0\" width=\"64\" height=\"64\" rx=\"12\" fill=\"var(--paper)\"/>");
}

function faviconPathForRequest(request) {
  try { return new URL(request?.url || "https://qsseda.com/favicon.svg").pathname; }
  catch { return "/favicon.svg"; }
}

export function faviconSvgForRequest(request) {
  const svg = faviconSvgForProduct(faviconProductForRequest(request));
  const pathname = faviconPathForRequest(request);
  if (pathname === "/favicon-light.svg") return forcedFaviconTheme(svg, "light");
  if (pathname === "/favicon-dark.svg") return forcedFaviconTheme(svg, "dark");
  return svg;
}

function appleTouchIconBytes() {
  const binary = atob(APPLE_TOUCH_ICON_PNG_BASE64);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

export function faviconResponse(request) {
  const method = String(request?.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { "allow": "GET, HEAD", "cache-control": "public, max-age=86400" }
    });
  }

  const pathname = faviconPathForRequest(request);
  if (pathname === "/apple-touch-icon.png") {
    return new Response(method === "HEAD" ? null : appleTouchIconBytes(), {
      status: 200,
      headers: {
        "content-type": "image/png",
        "cache-control": "public, max-age=604800, immutable",
        "x-content-type-options": "nosniff"
      }
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
