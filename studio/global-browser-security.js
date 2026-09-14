import { hardenBrowserMarkup } from "./browser-security.js";
import { hardenAdminBrowserMarkup } from "./admin-browser-security.js";

export async function hardenGlobalBrowserResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const source = await response.text();
  const hardened = hardenAdminBrowserMarkup(hardenBrowserMarkup(source));
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(hardened, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
