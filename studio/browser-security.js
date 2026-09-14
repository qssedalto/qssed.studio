export async function hardenBrowserResponse(response, pathname = "") {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;
  if (!isRelevantPath(pathname)) return response;

  const source = await response.text();
  const hardened = hardenBrowserMarkup(source);
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(hardened, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export function hardenBrowserMarkup(markup) {
  let output = String(markup || "");
  output = hardenUsernameAvailability(output);
  output = hardenAuditDeviceWriter(output);
  output = hardenProfileSummaryQuery(output);
  output = hardenProfileAuditQueries(output);
  return output;
}

function hardenUsernameAvailability(markup) {
  const direct = '      const { data, error } = await supabaseClient.rpc("check_registration_username", { p_username: value });';
  if (!markup.includes(direct)) return markup;
  const replacement = `      const usernameCheckResponse = await fetch("/api/auth/username-check", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ username: value }),
        cache: "no-store"
      });
      const data = await usernameCheckResponse.json().catch(() => ({}));
      const error = usernameCheckResponse.ok ? null : new Error(data?.error || "Username check failed");`;
  return markup.replace(direct, replacement);
}

function hardenAuditDeviceWriter(markup) {
  const start = "      async function updateCurrentDevice(user) {";
  const end = "      function getLastSignIn(user) {";
  if (!markup.includes(start) || !markup.includes(end)) return markup;
  const replacement = `      async function updateCurrentDevice(user) {
        if (!user) return null;
        const device_id = getAuditDeviceId();
        try {
          const response = await fetch("/api/account/device", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ device_id }),
            cache: "no-store"
          });
          const payload = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(payload?.error || "Device update failed");
          return payload?.device || null;
        } catch (error) {
          console.error("Device persistence failed", error);
          return null;
        }
      }

`;
  return replaceRange(markup, start, end, replacement, false);
}

function hardenProfileSummaryQuery(markup) {
  const start = "        const { data: profile, error: profileError } = await supabaseClient";
  const end = "          .maybeSingle();";
  if (!markup.includes(start)) return markup;
  const replacement = `        const profileResponse = await fetch("/api/account/summary", {
          credentials: "same-origin",
          headers: { Accept: "application/json" },
          cache: "no-store"
        });
        const profilePayload = await profileResponse.json().catch(() => ({}));
        const profile = profilePayload?.profile || null;
        const profileError = profileResponse.ok ? null : new Error(profilePayload?.error || "Profile query failed");`;
  return replaceRange(markup, start, end, replacement, true);
}

function hardenProfileAuditQueries(markup) {
  const start = "        const [eventsResult, devicesResult] = await Promise.all([";
  const end = "        ]);";
  if (!markup.includes(start)) return markup;
  const replacement = `        const auditResponse = await fetch("/api/account/audit", {
          credentials: "same-origin",
          headers: { Accept: "application/json" },
          cache: "no-store"
        });
        const auditPayload = await auditResponse.json().catch(() => ({}));
        const auditError = auditResponse.ok ? null : new Error(auditPayload?.error || "Account audit failed");
        const eventsResult = {
          error: auditPayload?.events_error || auditError ? (auditError || new Error("Login event query failed")) : null,
          data: Array.isArray(auditPayload?.events) ? auditPayload.events : []
        };
        const devicesResult = {
          error: auditPayload?.devices_error || auditError ? (auditError || new Error("Device query failed")) : null,
          data: Array.isArray(auditPayload?.devices) ? auditPayload.devices : []
        };`;
  return replaceRange(markup, start, end, replacement, true);
}

function replaceRange(source, startMarker, endMarker, replacement, consumeEnd) {
  const start = source.indexOf(startMarker);
  if (start < 0) return source;
  const endStart = source.indexOf(endMarker, start + startMarker.length);
  if (endStart < 0) return source;
  const end = consumeEnd ? endStart + endMarker.length : endStart;
  return source.slice(0, start) + replacement + source.slice(end);
}

function isRelevantPath(pathname) {
  return /\/(?:zh-cn|en)\/(?:sign-up|profile(?:\/|$))/.test(String(pathname || ""));
}
