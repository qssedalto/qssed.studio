export const FAVICON_PATHS = new Set(["/favicon.svg", "/favicon.ico"]);

export const FAVICON_LINKS = '<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="alternate icon" href="/favicon.ico">';

export const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="QssedA">
  <defs>
    <linearGradient id="qsseda-orbit" x1="14" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
      <stop stop-color="#c8c5ff"/>
      <stop offset=".5" stop-color="#8fb5ff"/>
      <stop offset="1" stop-color="#8fe6ef"/>
    </linearGradient>
    <linearGradient id="qsseda-core" x1="21" y1="14" x2="44" y2="44" gradientUnits="userSpaceOnUse">
      <stop stop-color="#ffffff"/>
      <stop offset="1" stop-color="#dfe8ff"/>
    </linearGradient>
  </defs>
  <rect x="3" y="3" width="58" height="58" rx="15" fill="#101722"/>
  <path d="M17 43V24c0-6 4-10 10-10h11l9 9v20" fill="none" stroke="url(#qsseda-orbit)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
  <path d="M19 48c7 5 19 6 27 1" fill="none" stroke="url(#qsseda-orbit)" stroke-width="3.4" stroke-linecap="round" opacity=".92"/>
  <path d="M28.2 12.5c2.2-2 5.4-2 7.6 0l6.4 5.4c2.1 1.8 2.3 4.9.4 6.9l-5.8 5.6c-1.7 1.7-4.4 1.8-6.2.3l-6.7-5.4c-2.2-1.8-2.4-5.1-.3-7z" fill="url(#qsseda-core)"/>
  <path d="M15.6 32.3c-.7-2.9 1-5.7 3.8-6.5l7.9-2.3c2.6-.8 5.3.7 6 3.3l2 7.7c.6 2.3-.6 4.7-2.8 5.7l-7.7 3.5c-2.6 1.2-5.7-.1-6.5-2.9z" fill="url(#qsseda-core)"/>
  <path d="M48.4 32.3c.7-2.9-1-5.7-3.8-6.5l-7.9-2.3c-2.6-.8-5.3.7-6 3.3l-2 7.7c-.6 2.3.6 4.7 2.8 5.7l7.7 3.5c2.6 1.2 5.7-.1 6.5-2.9z" fill="url(#qsseda-core)"/>
  <path d="M32 29.2l4.6 7.1h-9.2z" fill="#101722"/>
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
