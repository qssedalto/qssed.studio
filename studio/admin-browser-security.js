const RPC_ALIASES = [
  ["get_admin_overview", "overview"],
  ["get_admin_users", "users"],
  ["get_role_permissions", "roles"],
  ["get_audit_logs", "logs"],
  ["update_user_role", "user-role"],
  ["update_user_status", "user-status"],
  ["update_role_permissions", "permissions"]
];

export function hardenAdminBrowserMarkup(markup) {
  let output = String(markup || "");
  for (const [rpcName, alias] of RPC_ALIASES) output = output.replaceAll(`\"${rpcName}\"`, `\"${alias}\"`);

  output = output.replace(
    '        const { data, error } = await supabaseClient.rpc(name, params || {});',
    adminRpcProxyCode()
  );
  output = output.replace(
    '        adminCheck = await supabaseClient.rpc("is_admin");',
    adminAccessCode()
  );

  output = replaceLegacyRpcProxy(output);
  output = replaceLegacyAccessProxy(output);
  return output;
}

function replaceLegacyRpcProxy(markup) {
  const start = "        const sessionResult = await supabaseClient.auth.getSession();";
  const end = "        const error = null;";
  if (!markup.includes(start) || !markup.includes(end)) return markup;
  return replaceRange(markup, start, end, adminRpcProxyCode(), true);
}

function replaceLegacyAccessProxy(markup) {
  const start = "        const adminSessionResult = await supabaseClient.auth.getSession();";
  const end = "\n      }\n\n      const name = data.user.user_metadata.username";
  if (!markup.includes(start) || !markup.includes(end)) return markup;
  return replaceRange(markup, start, end, adminAccessCode(), false);
}

function adminRpcProxyCode() {
  return `        let response;
        let payload;
        try {
          response = await fetch("/api/admin/" + encodeURIComponent(name), {
            method: "POST",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json"
            },
            body: JSON.stringify(params || {}),
            cache: "no-store"
          });
          payload = await response.json().catch(() => ({}));
        } catch (requestError) {
          return { data: null, error: requestError };
        }
        if (!response.ok) {
          const error = new Error(payload?.error || "Administrator request failed");
          return { data: null, error };
        }
        const data = payload?.data;
        const error = null;`;
}

function adminAccessCode() {
  return `        try {
          const adminAccessResponse = await fetch("/api/admin/access", {
            credentials: "same-origin",
            headers: { Accept: "application/json" },
            cache: "no-store"
          });
          const adminAccessPayload = await adminAccessResponse.json().catch(() => ({}));
          adminCheck = adminAccessResponse.ok
            ? { data: Boolean(adminAccessPayload?.is_admin), error: null }
            : { data: false, error: new Error(adminAccessPayload?.error || "Administrator access check failed") };
        } catch (adminAccessError) {
          adminCheck = { data: false, error: adminAccessError };
        }`;
}

function replaceRange(source, startMarker, endMarker, replacement, consumeEnd) {
  const start = source.indexOf(startMarker);
  if (start < 0) return source;
  const endStart = source.indexOf(endMarker, start + startMarker.length);
  if (endStart < 0) return source;
  const end = consumeEnd ? endStart + endMarker.length : endStart;
  return source.slice(0, start) + replacement + source.slice(end);
}
