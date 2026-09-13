const INVALID_MESSAGE = "Invalid login credentials";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });
}

function parseKeyMap(name: string): Record<string, string> {
  try {
    const value = Deno.env.get(name) || "{}";
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function firstKey(map: Record<string, string>, legacyName: string) {
  return map.default || Object.values(map)[0] || Deno.env.get(legacyName) || "";
}

function clean(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function safeUsernameMatch(candidate: unknown, identifier: string) {
  return typeof candidate === "string" && candidate.trim().toLocaleLowerCase() === identifier.toLocaleLowerCase();
}

async function passwordGrant(supabaseUrl: string, publishableKey: string, email: string, password: string) {
  return fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: publishableKey,
      "content-type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const publishableKey = firstKey(parseKeyMap("SUPABASE_PUBLISHABLE_KEYS"), "SUPABASE_ANON_KEY");
  const secretKey = firstKey(parseKeyMap("SUPABASE_SECRET_KEYS"), "SUPABASE_SERVICE_ROLE_KEY");
  const requestKey = req.headers.get("apikey") || "";

  if (!supabaseUrl || !publishableKey || !secretKey) {
    return json({ error: "Authentication service unavailable", code: "auth_configuration" }, 503);
  }
  if (!requestKey || requestKey !== publishableKey) {
    return json({ error: "Unauthorized", code: "invalid_api_key" }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body", code: "invalid_request" }, 400);
  }

  const identifier = clean(body?.identifier ?? body?.email, 180);
  const password = typeof body?.password === "string" ? body.password.slice(0, 1024) : "";
  if (!identifier || !password) {
    return json({ error: "Username/email and password are required", code: "missing_credentials" }, 400);
  }

  let email = identifier;

  if (!identifier.includes("@")) {
    try {
      const url = new URL(`${supabaseUrl}/rest/v1/profiles`);
      url.searchParams.set("select", "id,username");
      url.searchParams.set("username", `ilike.${identifier}`);
      url.searchParams.set("limit", "100");
      const profileResponse = await fetch(url.toString(), {
        headers: { apikey: secretKey }
      });
      if (!profileResponse.ok) {
        return json({ error: "Authentication service unavailable", code: "lookup_unavailable" }, 503);
      }

      const rows = await profileResponse.json();
      const exact = Array.isArray(rows) ? rows.filter(row => safeUsernameMatch(row?.username, identifier)) : [];
      if (exact.length !== 1 || !exact[0]?.id) {
        const upstream = await passwordGrant(supabaseUrl, publishableKey, "invalid-login@invalid.qsseda.local", password);
        await upstream.arrayBuffer().catch(() => new ArrayBuffer(0));
        return json({ error: INVALID_MESSAGE, code: "invalid_credentials" }, 401);
      }

      const userResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(exact[0].id)}`, {
        headers: { apikey: secretKey }
      });
      if (!userResponse.ok) {
        return json({ error: "Authentication service unavailable", code: "lookup_unavailable" }, 503);
      }
      const userPayload = await userResponse.json();
      email = clean(userPayload?.email ?? userPayload?.user?.email, 180);
      if (!email) return json({ error: INVALID_MESSAGE, code: "invalid_credentials" }, 401);
    } catch {
      return json({ error: "Authentication service unavailable", code: "lookup_unavailable" }, 503);
    }
  }

  let upstream: Response;
  try {
    upstream = await passwordGrant(supabaseUrl, publishableKey, email, password);
  } catch {
    return json({ error: "Authentication service unavailable", code: "auth_unavailable" }, 503);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await upstream.json();
  } catch {
    return json({ error: "Authentication service returned an invalid response", code: "invalid_upstream" }, 502);
  }

  if (!upstream.ok) {
    const message = String(payload?.msg || payload?.message || payload?.error_description || "");
    return json({
      ...payload,
      error: message || INVALID_MESSAGE,
      code: payload?.error_code || payload?.code || "invalid_credentials"
    }, upstream.status === 400 ? 401 : upstream.status);
  }

  return json(payload, 200);
});
