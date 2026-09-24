import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";

const enc = new TextEncoder();
const dec = new TextDecoder();
const OPENAI_BASE = "https://api.openai.com";
const ZHIPU_BASE = "https://open.bigmodel.cn/api/paas/v4";
const ZHIPU_MODELS = ["glm-4.7-flash"];
const BAILIAN_BASE = "https://ws-v0ogv72bnj1vwnsv.cn-beijing.maas.aliyuncs.com/compatible-mode/v1";
const BAILIAN_MODELS_ENDPOINT = "https://ws-v0ogv72bnj1vwnsv.cn-beijing.maas.aliyuncs.com/api/v1/models";
const BAILIAN_PREFERRED_MODELS = ["qwen3.7-plus", "glm-5", "qwen-max", "qwen-plus-2025-07-28"];
const KNOWN_PRICES = {
  "gpt-5.6": { input: 4, output: 20 },
  "gpt-5.6-sol": { input: 4, output: 20 },
  "gpt-5.6-terra": { input: 2, output: 12 },
  "gpt-5.6-luna": { input: 0.2, output: 1.2 }
};

export async function handleAiApi(request, env, session) {
  const path = new URL(request.url).pathname;
  if (path === "/api/ai/config" && request.method === "GET") return userConfig(request, session);
  if (path === "/api/ai/conversations" && request.method === "GET") {
    return rest(session, "/ai_conversations?select=id,title,model,created_at,updated_at&order=updated_at.desc&limit=50");
  }
  if (path === "/api/ai/chat" && request.method === "POST") return chat(request, env, session);
  return json({ error: "AI route not found." }, 404);
}

export async function handleAiAdminApi(request, env, session) {
  const path = new URL(request.url).pathname;
  const admin = await rpc(session, "is_admin", {});
  if (!admin.ok || admin.data !== true) return json({ error: "Administrator access required." }, 403);

  if (path === "/api/ai/admin/me" && request.method === "GET") {
    return json({ admin: true });
  }

  if (path === "/api/ai/admin/validate-project-key" && request.method === "POST") {
    if (!sameOrigin(request)) return json({ error: "Invalid origin." }, 403);
    const b = await body(request);
    const key = clean(b.api_key, 800);
    const provider = cleanProvider(b.provider);
    if (!key) return json({ error: "API Key is required." }, 400);
    const check = await validateProviderKey(provider, key);
    if (!check.ok) {
      const status = check.code === "REGION_UNSUPPORTED"
        ? 403
        : check.code === "RATE_LIMITED"
          ? 429
          : 400;
      return json(
        {
          error: check.error || "Provider API key validation failed.",
          code: check.code || null,
          diagnostic: check.diagnostic || null
        },
        status
      );
    }
    return json({ ok: true, provider, models: check.models || [] });
  }

  const providerModelsMatch = path.match(/^\/api\/ai\/admin\/provider\/([0-9a-f-]{36})\/models$/i);
  if (providerModelsMatch && request.method === "GET") {
    if (!env.AI_CREDENTIAL_KEY) return json({ error: "AI credential encryption is not configured." }, 503);
    const providerId = providerModelsMatch[1];
    if (!uuid(providerId)) return json({ error: "Invalid provider." }, 400);
    const current = await restData(session, "/ai_providers?id=eq." + providerId + "&select=id,provider,encrypted_api_key,api_key_iv&limit=1");
    const row = current.ok && Array.isArray(current.data) ? current.data[0] : null;
    if (!row) return json({ error: "Provider not found." }, 404);
    try {
      const key = await decrypt(row.encrypted_api_key, row.api_key_iv, env.AI_CREDENTIAL_KEY);
      const check = await validateProviderKey(cleanProvider(row.provider), key);
      if (!check.ok) {
        const status = check.code === "REGION_UNSUPPORTED" ? 403 : check.code === "RATE_LIMITED" ? 429 : 400;
        return json(
          {
            error: check.error || "Stored API Key could not be verified.",
            code: check.code || null,
            diagnostic: check.diagnostic || null
          },
          status
        );
      }
      return json({ ok: true, provider: cleanProvider(row.provider), models: check.models || [] });
    } catch {
      return json({ error: "Stored Project API Key cannot be decrypted." }, 503);
    }
  }

  const providerMatch = path.match(/^\/api\/ai\/admin\/provider\/([0-9a-f-]{36})$/i);
  if (providerMatch && request.method === "PATCH") {
    if (!sameOrigin(request)) return json({ error: "Invalid origin." }, 403);
    if (!env.AI_CREDENTIAL_KEY) return json({ error: "AI credential encryption is not configured." }, 503);
    const providerId = providerMatch[1];
    if (!uuid(providerId)) return json({ error: "Invalid provider." }, 400);

    const current = await restData(session,
      "/ai_providers?id=eq." + providerId +
      "&select=id,provider,encrypted_api_key,api_key_iv,encrypted_admin_key,admin_key_iv,admin_key_hint,allowed_models,default_model&limit=1");
    const existing = current.ok && Array.isArray(current.data) ? current.data[0] : null;
    if (!existing) return json({ error: "Provider not found." }, 404);

    const b = await body(request);
    const name = String(b.name || "").trim().slice(0, 80);
    const allowedModels = models(b.allowed_models);
    const defaultModel = cleanModel(b.default_model);
    if (!name) return json({ error: "Provider name is required." }, 400);
    if (!allowedModels.length) return json({ error: "Select at least one allowed model." }, 400);
    if (!defaultModel || !allowedModels.includes(defaultModel)) {
      return json({ error: "Default model must be included in the allowed model list." }, 400);
    }

    const replacementKey = clean(b.api_key, 800);
    const existingAllowedModels = models(existing.allowed_models);
    const needsOnlineModelValidation =
      Boolean(replacementKey) ||
      allowedModels.some(model => !existingAllowedModels.includes(model));

    if (needsOnlineModelValidation) {
      let projectKey;
      try {
        projectKey = replacementKey || await decrypt(existing.encrypted_api_key, existing.api_key_iv, env.AI_CREDENTIAL_KEY);
      } catch {
        return json({ error: "Stored Project API Key cannot be decrypted." }, 503);
      }
      const keyCheck = await validateProviderKey(cleanProvider(existing.provider), projectKey);
      if (!keyCheck.ok) {
        const status = keyCheck.code === "REGION_UNSUPPORTED" ? 403 : keyCheck.code === "RATE_LIMITED" ? 429 : 400;
        return json(
          {
            error: keyCheck.error || "Provider API key validation failed.",
            code: keyCheck.code || null,
            diagnostic: keyCheck.diagnostic || null
          },
          status
        );
      }
      const accessibleModels = new Set(keyCheck.models || []);
      if (!allowedModels.every(model => accessibleModels.has(model))) {
        return json({ error: "One or more selected models are not available to this Project API Key." }, 400);
      }
    }

    const patch = {
      name,
      default_model: defaultModel,
      allowed_models: allowedModels.slice(0, 30),
      monthly_budget_usd: numOrNull(b.monthly_budget_usd),
      input_price_per_million: numOrZero(b.input_price_per_million),
      output_price_per_million: numOrZero(b.output_price_per_million),
      is_active: b.is_active !== false,
      updated_at: new Date().toISOString()
    };

    if (replacementKey) {
      const encrypted = await encrypt(replacementKey, env.AI_CREDENTIAL_KEY);
      patch.encrypted_api_key = encrypted.cipher;
      patch.api_key_iv = encrypted.iv;
      patch.key_hint = replacementKey.slice(-4);
    }

    const replacementAdminKey = clean(b.admin_key, 800);
    if (cleanProvider(existing.provider) !== "openai") {
      patch.encrypted_admin_key = null;
      patch.admin_key_iv = null;
      patch.admin_key_hint = null;
    } else if (b.clear_admin_key === true) {
      patch.encrypted_admin_key = null;
      patch.admin_key_iv = null;
      patch.admin_key_hint = null;
    } else if (replacementAdminKey) {
      const adminCheck = await readOpenAiMonthCosts(replacementAdminKey);
      if (!adminCheck.available) {
        return json({ error: adminCheck.error || "OpenAI Admin Key could not read organization costs." }, 400);
      }
      const encryptedAdmin = await encrypt(replacementAdminKey, env.AI_CREDENTIAL_KEY);
      patch.encrypted_admin_key = encryptedAdmin.cipher;
      patch.admin_key_iv = encryptedAdmin.iv;
      patch.admin_key_hint = replacementAdminKey.slice(-4);
    }

    const saved = await restData(session, "/ai_providers?id=eq." + providerId, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(patch)
    });
    if (!saved.ok) return json({ error: saved.data?.message || "Unable to update provider." }, saved.status || 502);
    return json({ provider: saved.data?.[0] ? sanitizeProvider(saved.data[0]) : null });
  }

  if (providerMatch && request.method === "DELETE") {
    if (!sameOrigin(request)) return json({ error: "Invalid origin." }, 403);
    const providerId = providerMatch[1];
    if (!uuid(providerId)) return json({ error: "Invalid provider." }, 400);

    const bindings = await restData(session, "/ai_user_provider_access?provider_id=eq." + providerId + "&select=user_id&limit=1");
    if (!bindings.ok) return json({ error: "Unable to check provider usage." }, 502);
    if (Array.isArray(bindings.data) && bindings.data.length) {
      return json({ error: "This provider is still assigned to one or more users. Remove those assignments before deleting it." }, 409);
    }

    const removed = await restData(session, "/ai_providers?id=eq." + providerId, {
      method: "DELETE",
      headers: { Prefer: "return=representation" }
    });
    if (!removed.ok) return json({ error: removed.data?.message || "Unable to delete provider." }, removed.status || 502);
    if (!Array.isArray(removed.data) || !removed.data.length) return json({ error: "Provider not found." }, 404);
    return json({ deleted: true, id: providerId });
  }

  if (path === "/api/ai/admin/state" && request.method === "GET") {
    const state = await rpc(session, "get_ai_admin_state", {});
    if (!state.ok) return json({ error: "Unable to load AI administration." }, 502);

    const result = state.data || { providers: [], users: [] };
    if (env.AI_CREDENTIAL_KEY && Array.isArray(result.providers) && result.providers.length) {
      const secretRows = await restData(
        session,
        "/ai_providers?select=id,encrypted_admin_key,admin_key_iv,admin_key_hint"
      );
      const byId = new Map((secretRows.ok && Array.isArray(secretRows.data) ? secretRows.data : []).map(row => [row.id, row]));
      await Promise.all(result.providers.map(async provider => {
        const row = byId.get(provider.id);
        provider.admin_key_configured = provider.provider === "openai" && Boolean(row?.encrypted_admin_key && row?.admin_key_iv);
        provider.admin_key_hint = provider.provider === "openai" ? (row?.admin_key_hint || null) : null;
        provider.billing = { available: false, official_month_usd: null, error: null };
        if (provider.provider !== "openai" || !provider.admin_key_configured) return;
        try {
          const adminKey = await decrypt(row.encrypted_admin_key, row.admin_key_iv, env.AI_CREDENTIAL_KEY);
          provider.billing = await readOpenAiMonthCosts(adminKey);
        } catch {
          provider.billing = { available: false, official_month_usd: null, error: "Billing credential unavailable." };
        }
      }));
    }
    return json(result);
  }

  if (path === "/api/ai/admin/provider" && request.method === "POST") {
    if (!sameOrigin(request)) return json({ error: "Invalid origin." }, 403);
    if (!env.AI_CREDENTIAL_KEY) return json({ error: "AI credential encryption is not configured." }, 503);

    const b = await body(request);
    const key = clean(b.api_key, 800);
    const provider = cleanProvider(b.provider);
    const adminKey = provider === "openai" ? clean(b.admin_key, 800) : "";
    const name = String(b.name || "").trim().slice(0, 80);
    const providerDefault = provider === "zhipu"
      ? ZHIPU_MODELS[0]
      : provider === "bailian"
        ? BAILIAN_PREFERRED_MODELS[0]
        : "gpt-5.6";
    const defaultModel = cleanModel(b.default_model) || providerDefault;
    const allowedModels = models(b.allowed_models);
    if (!allowedModels.includes(defaultModel)) allowedModels.unshift(defaultModel);

    if (!key || !name) return json({ error: "Provider name and API key are required." }, 400);

    const keyCheck = await validateProviderKey(provider, key);
    if (!keyCheck.ok) {
      const status = keyCheck.code === "REGION_UNSUPPORTED" ? 403 : keyCheck.code === "RATE_LIMITED" ? 429 : 400;
      return json(
        {
          error: keyCheck.error || "Provider API key validation failed.",
          code: keyCheck.code || null,
          diagnostic: keyCheck.diagnostic || null
        },
        status
      );
    }
    const accessibleModels = new Set(keyCheck.models || []);
    if (!allowedModels.length) return json({ error: "Select at least one allowed model." }, 400);
    if (!allowedModels.every(model => accessibleModels.has(model))) {
      return json({ error: "One or more selected models are not available to this API Key." }, 400);
    }
    if (!allowedModels.includes(defaultModel)) {
      return json({ error: "Default model must be included in the allowed model list." }, 400);
    }

    let adminEncrypted = null;
    let adminCheck = null;
    if (provider === "openai" && adminKey) {
      adminCheck = await readOpenAiMonthCosts(adminKey);
      if (!adminCheck.available) {
        return json({ error: adminCheck.error || "OpenAI Admin Key could not read organization costs." }, 400);
      }
      adminEncrypted = await encrypt(adminKey, env.AI_CREDENTIAL_KEY);
    }

    const encrypted = await encrypt(key, env.AI_CREDENTIAL_KEY);
    const row = {
      name,
      provider,
      base_url: providerBase(provider),
      encrypted_api_key: encrypted.cipher,
      api_key_iv: encrypted.iv,
      key_hint: key.slice(-4),
      encrypted_admin_key: adminEncrypted?.cipher || null,
      admin_key_iv: adminEncrypted?.iv || null,
      admin_key_hint: adminKey ? adminKey.slice(-4) : null,
      default_model: defaultModel,
      allowed_models: allowedModels.slice(0, 30),
      monthly_budget_usd: numOrNull(b.monthly_budget_usd),
      input_price_per_million: numOrZero(b.input_price_per_million),
      output_price_per_million: numOrZero(b.output_price_per_million),
      is_active: b.is_active !== false,
      created_by: session.user.id
    };
    const saved = await restData(session, "/ai_providers", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(row)
    });
    if (!saved.ok) return json({ error: saved.data?.message || "Unable to save provider." }, saved.status || 502);

    return json({
      provider: saved.data?.[0] ? sanitizeProvider(saved.data[0]) : null,
      validation: {
        project_key: true,
        billing_key: Boolean(adminKey),
        official_month_usd: adminCheck?.official_month_usd ?? null
      }
    });
  }

  if (path === "/api/ai/admin/access" && request.method === "POST") {
    if (!sameOrigin(request)) return json({ error: "Invalid origin." }, 403);
    const b = await body(request);
    if (!uuid(b.user_id)) return json({ error: "Invalid user." }, 400);

    const requested = Array.isArray(b.provider_access) ? b.provider_access : [];
    const normalized = [];
    const seen = new Set();
    for (const item of requested) {
      const providerId = String(item?.provider_id || "");
      if (!uuid(providerId) || seen.has(providerId)) continue;
      seen.add(providerId);
      normalized.push({
        provider_id: providerId,
        allowed_models: models(item?.allowed_models)
      });
    }
    if (Boolean(b.enabled) && !normalized.length) {
      return json({ error: "Select at least one provider." }, 400);
    }

    if (normalized.length) {
      const ids = normalized.map(item => item.provider_id);
      const providerRows = await restData(
        session,
        "/ai_providers?id=in.(" + ids.join(",") + ")&select=id,allowed_models,is_active"
      );
      if (!providerRows.ok) return json({ error: "Unable to validate provider access." }, 502);
      const byId = new Map((Array.isArray(providerRows.data) ? providerRows.data : []).map(row => [row.id, row]));
      for (const item of normalized) {
        const provider = byId.get(item.provider_id);
        if (!provider || provider.is_active === false) return json({ error: "One or more providers are unavailable." }, 400);
        const providerModels = models(provider.allowed_models);
        if (!item.allowed_models.length) item.allowed_models = [...providerModels];
        if (!item.allowed_models.length || !item.allowed_models.every(model => providerModels.includes(model))) {
          return json({ error: "One or more selected models are not allowed by their provider." }, 400);
        }
      }
    }

    const accessRow = {
      user_id: b.user_id,
      provider_id: normalized[0]?.provider_id || null,
      enabled: Boolean(b.enabled),
      allowed_models: normalized[0]?.allowed_models || [],
      daily_limit_usd: numOrNull(b.daily_limit_usd),
      monthly_limit_usd: numOrNull(b.monthly_limit_usd),
      requests_per_minute: Math.max(1, Math.min(300, Number(b.requests_per_minute) || 20)),
      updated_by: session.user.id,
      updated_at: new Date().toISOString()
    };

    const saved = await restData(session, "/ai_user_access?on_conflict=user_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(accessRow)
    });
    if (!saved.ok) return json({ error: saved.data?.message || "Unable to save AI access." }, saved.status || 502);

    const cleared = await restData(session, "/ai_user_provider_access?user_id=eq." + b.user_id, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" }
    });
    if (!cleared.ok) return json({ error: "Unable to replace provider assignments." }, 502);

    if (normalized.length) {
      const rows = normalized.map(item => ({
        user_id: b.user_id,
        provider_id: item.provider_id,
        enabled: true,
        allowed_models: item.allowed_models,
        updated_by: session.user.id,
        updated_at: new Date().toISOString()
      }));
      const linked = await restData(session, "/ai_user_provider_access", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(rows)
      });
      if (!linked.ok) return json({ error: linked.data?.message || "Unable to save provider assignments." }, linked.status || 502);
    }

    return json({ ok: true, access: saved.data?.[0] || null, provider_access: normalized });
  }

  return json({ error: "AI administrator route not found." }, 404);
}

async function userConfig(request, session) {
  const r = await rpc(session, "get_ai_runtime_config", {});
  if (!r.ok) return json({ enabled: false, error: "AI access is not enabled." }, 403);

  const a = r.data.access;
  const country = String(request.cf?.country || request.headers.get("CF-IPCountry") || "").toUpperCase() || null;
  const providers = Array.isArray(r.data.providers) ? r.data.providers : [];
  const publicProviders = [];
  const modelOptions = [];

  for (const p of providers) {
    const availability = providerAvailability(p.provider, country);
    const allowed = models(p.allowed_models);
    publicProviders.push({
      id: p.id,
      name: p.name,
      provider: p.provider,
      default_model: p.default_model,
      available: availability.available,
      unavailable_code: availability.code || null
    });
    for (const model of allowed) {
      modelOptions.push({
        provider_id: p.id,
        provider_name: p.name,
        provider: p.provider,
        model,
        available: availability.available,
        unavailable_code: availability.code || null
      });
    }
  }

  const firstAvailable = modelOptions.find(item => item.available) || modelOptions[0] || null;
  let preferred = firstAvailable;
  if (firstAvailable) {
    const preferredProvider = providers.find(p => p.id === firstAvailable.provider_id);
    preferred = modelOptions.find(item =>
      item.available &&
      item.provider_id === preferredProvider?.id &&
      item.model === preferredProvider?.default_model
    ) || firstAvailable;
  }

  return json({
    enabled: true,
    country,
    providers: publicProviders,
    models: modelOptions,
    default_provider_id: preferred?.provider_id || null,
    default_model: preferred?.model || null,
    usage: r.data.usage,
    limits: {
      daily: a.daily_limit_usd,
      monthly: a.monthly_limit_usd,
      rpm: a.requests_per_minute
    }
  });
}

async function chat(request, env, session) {
  if (!sameOrigin(request)) return json({ error: "Invalid origin." }, 403);
  if (!env.AI_CREDENTIAL_KEY) return json({ error: "AI service is not configured." }, 503);

  const b = await body(request);
  const message = String(b.message || "").trim();
  if (!message || message.length > 30000) return json({ error: "Message is empty or too long." }, 400);

  const cfg = await rpc(session, "get_ai_runtime_config", {});
  if (!cfg.ok) return json({ error: "AI access is not enabled for this account." }, 403);

  const a = cfg.data.access;
  const providers = Array.isArray(cfg.data.providers) ? cfg.data.providers : [];
  const u = cfg.data.usage;
  if (a.daily_limit_usd != null && Number(u.today_usd) >= Number(a.daily_limit_usd)) {
    return json({ error: "Daily AI quota reached." }, 429);
  }
  if (a.monthly_limit_usd != null && Number(u.month_usd) >= Number(a.monthly_limit_usd)) {
    return json({ error: "Monthly AI quota reached." }, 429);
  }
  if (Number(u.minute_requests) >= Number(a.requests_per_minute || 20)) {
    return json({ error: "AI request rate limit reached." }, 429);
  }

  const requestedProviderId = uuid(b.provider_id) ? b.provider_id : "";
  const requestedModel = cleanModel(b.model);
  let p = requestedProviderId ? providers.find(item => item.id === requestedProviderId) : null;
  if (!p && requestedModel) {
    p = providers.find(item => models(item.allowed_models).includes(requestedModel));
  }
  if (!p) p = providers[0] || null;
  if (!p) return json({ error: "No active AI provider is available for this account." }, 403);

  const country = String(request.cf?.country || request.headers.get("CF-IPCountry") || "").toUpperCase();
  const availability = providerAvailability(p.provider, country);
  if (!availability.available) {
    return json(
      {
        error: p.provider === "openai"
          ? "OpenAI is unavailable from the current network region."
          : "This provider is unavailable from the current network region.",
        code: availability.code || "REGION_UNSUPPORTED",
        provider_id: p.id
      },
      403
    );
  }

  const allowed = models(p.allowed_models);
  const model = requestedModel || cleanModel(p.default_model) || allowed[0];
  if (!model || !allowed.includes(model)) {
    return json({ error: "This model is not enabled for your account." }, 403);
  }

  let conversationId = uuid(b.conversation_id) ? b.conversation_id : null;
  if (!conversationId) {
    const created = await restData(session, "/ai_conversations", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        user_id: session.user.id,
        provider_id: p.id,
        model,
        title: message.slice(0, 80)
      })
    });
    if (!created.ok || !created.data?.[0]?.id) return json({ error: "Unable to create conversation." }, 502);
    conversationId = created.data[0].id;
  }

  const history = await restData(
    session,
    "/ai_messages?conversation_id=eq." + conversationId + "&select=role,content&order=created_at.asc&limit=40"
  );
  if (!history.ok) return json({ error: "Unable to load conversation." }, 502);

  const inserted = await restData(session, "/ai_messages", {
    method: "POST",
    body: JSON.stringify({
      conversation_id: conversationId,
      user_id: session.user.id,
      role: "user",
      content: message
    })
  });
  if (!inserted.ok) return json({ error: "Unable to save message." }, 502);

  let apiKey;
  try {
    apiKey = await decrypt(p.encrypted_api_key, p.api_key_iv, env.AI_CREDENTIAL_KEY);
  } catch {
    return json({ error: "AI provider credential cannot be decrypted." }, 503);
  }

  const input = [
    ...(history.data || []).map(item => ({ role: item.role, content: item.content })),
    { role: "user", content: message }
  ];

  const normalizedProvider = cleanProvider(p.provider);
  const usesChatCompletions = isChatCompletionsProvider(normalizedProvider);
  const providerRoot = String(p.base_url || providerBase(normalizedProvider)).replace(/\/$/, "");
  const upstreamUrl = providerRoot + (usesChatCompletions ? "/chat/completions" : "/v1/responses");
  const upstreamBody = usesChatCompletions
    ? { model, messages: input, stream: true, stream_options: { include_usage: true } }
    : { model, input, stream: true };
  const upstream = await fetch(upstreamUrl, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
      Accept: "text/event-stream"
    },
    body: JSON.stringify(upstreamBody)
  });

  if (!upstream.ok) {
    const raw = await upstream.text();
    const diagnostic = upstreamDiagnostic(upstream, raw);
    const detail = diagnostic.message;
    if (p.provider === "openai" && isUnsupportedRegionMessage(detail)) {
      return json(
        { error: "OpenAI is unavailable from the current network region.", code: "REGION_UNSUPPORTED", provider_id: p.id },
        403
      );
    }
    if (usesChatCompletions && upstream.status === 429) {
      return json(
        {
          error: providerDisplayName(normalizedProvider) + " returned HTTP 429 rate limit.",
          code: "RATE_LIMITED",
          provider_id: p.id,
          diagnostic
        },
        429
      );
    }
    return json(
      {
        error: providerDisplayName(normalizedProvider) + " request failed.",
        detail,
        code: "PROVIDER_REQUEST_FAILED",
        provider_id: p.id,
        diagnostic
      },
      upstream.status === 429 ? 429 : 502
    );
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let full = "";
  let buffer = "";
  let inputTokens = 0;
  let outputTokens = 0;
  let responseId = "";

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event, data) => controller.enqueue(
        encoder.encode("event: " + event + "\ndata: " + JSON.stringify(data) + "\n\n")
      );
      emit("meta", { conversation_id: conversationId, model, provider_id: p.id, provider: p.provider });
      try {
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          buffer += decoder.decode(chunk.value, { stream: true });
          let boundary;
          while ((boundary = buffer.indexOf("\n\n")) >= 0) {
            const block = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            for (const line of block.split("\n")) {
              if (!line.startsWith("data:")) continue;
              const raw = line.slice(5).trim();
              if (!raw || raw === "[DONE]") continue;
              let event;
              try { event = JSON.parse(raw); } catch { continue; }

              if (usesChatCompletions) {
                responseId = event.id || responseId;
                const content = event.choices?.[0]?.delta?.content;
                if (typeof content === "string" && content) {
                  full += content;
                  emit("delta", { delta: content });
                } else if (Array.isArray(content)) {
                  const textDelta = content.map(part => part?.text || part?.content || "").join("");
                  if (textDelta) {
                    full += textDelta;
                    emit("delta", { delta: textDelta });
                  }
                }
                if (event.usage) {
                  inputTokens = Number(event.usage.prompt_tokens ?? event.usage.input_tokens) || inputTokens;
                  outputTokens = Number(event.usage.completion_tokens ?? event.usage.output_tokens) || outputTokens;
                }
                if (event.error) {
                  throw new Error(event.error?.message || providerDisplayName(normalizedProvider) + " stream error");
                }
              } else {
                if (event.type === "response.output_text.delta" && event.delta) {
                  full += event.delta;
                  emit("delta", { delta: event.delta });
                }
                if (event.type === "response.completed") {
                  responseId = event.response?.id || event.id || "";
                  inputTokens = Number(event.response?.usage?.input_tokens ?? event.usage?.input_tokens) || 0;
                  outputTokens = Number(event.response?.usage?.output_tokens ?? event.usage?.output_tokens) || 0;
                }
                if (event.type === "error") {
                  throw new Error(event.error?.message || "Provider stream error");
                }
              }
            }
          }
        }

        const cost = estimateCost(model, inputTokens, outputTokens, p);
        if (full) {
          await restData(session, "/ai_messages", {
            method: "POST",
            body: JSON.stringify({
              conversation_id: conversationId,
              user_id: session.user.id,
              role: "assistant",
              content: full,
              provider_response_id: responseId,
              input_tokens: inputTokens,
              output_tokens: outputTokens
            })
          });
        }
        await restData(session, "/ai_usage", {
          method: "POST",
          body: JSON.stringify({
            user_id: session.user.id,
            provider_id: p.id,
            conversation_id: conversationId,
            model,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            estimated_cost_usd: cost,
            request_id: responseId
          })
        });
        await restData(session, "/ai_conversations?id=eq." + conversationId, {
          method: "PATCH",
          body: JSON.stringify({ provider_id: p.id, model, updated_at: new Date().toISOString() })
        });
        emit("done", {
          conversation_id: conversationId,
          provider_id: p.id,
          model,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          estimated_cost_usd: cost
        });
        controller.close();
      } catch (error) {
        emit("error", { error: String(error?.message || "Stream failed").slice(0, 240) });
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream;charset=UTF-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });
}

async function validateProviderKey(provider, key) {
  const normalized = cleanProvider(provider);
  if (normalized === "zhipu") return validateZhipuKey(key);
  if (normalized === "bailian") return validateBailianKey(key);
  return validateProjectKey(key);
}

async function validateZhipuKey(key) {
  let response;
  try {
    response = await fetch(ZHIPU_BASE + "/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        model: ZHIPU_MODELS[0],
        messages: [{ role: "user", content: "OK" }],
        max_tokens: 1,
        stream: false
      })
    });
  } catch {
    return { ok: false, error: "Unable to reach Zhipu GLM.", code: "PROVIDER_UNREACHABLE" };
  }

  const raw = await response.text();
  if (!response.ok) {
    const diagnostic = upstreamDiagnostic(response, raw);
    if (response.status === 429) {
      return {
        ok: false,
        code: "RATE_LIMITED",
        error: "Zhipu GLM returned HTTP 429 rate limit.",
        diagnostic
      };
    }
    if (response.status === 401) {
      return {
        ok: false,
        code: "PROVIDER_AUTH_INVALID",
        error: "Zhipu GLM rejected the API Key authentication.",
        diagnostic
      };
    }
    if (response.status === 402) {
      return {
        ok: false,
        code: "PROVIDER_QUOTA_EXHAUSTED",
        error: "Zhipu GLM reports insufficient account quota.",
        diagnostic
      };
    }
    if (response.status === 403) {
      return {
        ok: false,
        code: "PROVIDER_PERMISSION_DENIED",
        error: "Zhipu GLM denied access to this model or account.",
        diagnostic
      };
    }
    if (response.status === 503) {
      return {
        ok: false,
        code: "PROVIDER_OVERLOADED",
        error: "Zhipu GLM is temporarily overloaded.",
        diagnostic
      };
    }
    return {
      ok: false,
      code: "PROVIDER_REJECTED",
      error: "Zhipu GLM validation request failed: " + diagnostic.message,
      diagnostic
    };
  }

  return { ok: true, models: [...ZHIPU_MODELS] };
}

async function validateBailianKey(key) {
  const collected = [];
  let total = Infinity;

  for (let page = 1; page <= 3 && collected.length < 120 && collected.length < total; page += 1) {
    const url = new URL(BAILIAN_MODELS_ENDPOINT);
    url.searchParams.set("capabilities", "TG");
    url.searchParams.set("supports", "inference");
    url.searchParams.set("page_no", String(page));
    url.searchParams.set("page_size", "100");

    let response;
    try {
      response = await fetch(url.toString(), {
        headers: {
          Authorization: "Bearer " + key,
          Accept: "application/json"
        }
      });
    } catch {
      return { ok: false, error: "Unable to reach Alibaba Cloud Bailian.", code: "PROVIDER_UNREACHABLE" };
    }

    const raw = await response.text();
    if (!response.ok) {
      const diagnostic = upstreamDiagnostic(response, raw);
      if (response.status === 429) {
        return { ok: false, code: "RATE_LIMITED", error: "Alibaba Cloud Bailian returned HTTP 429 rate limit.", diagnostic };
      }
      if (response.status === 401) {
        return { ok: false, code: "PROVIDER_AUTH_INVALID", error: "Alibaba Cloud Bailian rejected the API Key authentication.", diagnostic };
      }
      if (response.status === 402) {
        return { ok: false, code: "PROVIDER_QUOTA_EXHAUSTED", error: "Alibaba Cloud Bailian reports insufficient account quota.", diagnostic };
      }
      if (response.status === 403) {
        return { ok: false, code: "PROVIDER_PERMISSION_DENIED", error: "Alibaba Cloud Bailian denied access for this workspace or API Key.", diagnostic };
      }
      if (response.status === 503) {
        return { ok: false, code: "PROVIDER_OVERLOADED", error: "Alibaba Cloud Bailian is temporarily overloaded.", diagnostic };
      }
      return {
        ok: false,
        code: "PROVIDER_REJECTED",
        error: "Alibaba Cloud Bailian model-list request failed: " + diagnostic.message,
        diagnostic
      };
    }

    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return { ok: false, code: "INVALID_MODEL_LIST", error: "Alibaba Cloud Bailian returned an invalid model list." };
    }
    if (payload?.success === false) {
      return {
        ok: false,
        code: "PROVIDER_REJECTED",
        error: "Alibaba Cloud Bailian model-list request failed: " + String(payload?.message || payload?.code || "request failed").slice(0, 200)
      };
    }

    total = Number(payload?.output?.total);
    if (!Number.isFinite(total) || total < 0) total = 0;
    const pageModels = Array.isArray(payload?.output?.models) ? payload.output.models : [];
    for (const item of pageModels) {
      const model = cleanModel(item?.model);
      if (model) collected.push(model);
    }
    if (!pageModels.length) break;
  }

  const found = [...new Set(collected)].sort(compareBailianModelIds).slice(0, 120);
  if (!found.length) {
    return { ok: false, code: "INVALID_MODEL_LIST", error: "Alibaba Cloud Bailian returned no text-generation models for this API Key." };
  }
  return { ok: true, models: found };
}

function cleanProvider(value) {
  const normalized = String(value || "").toLowerCase();
  return normalized === "zhipu" || normalized === "bailian" ? normalized : "openai";
}

function providerBase(provider) {
  const normalized = cleanProvider(provider);
  if (normalized === "zhipu") return ZHIPU_BASE;
  if (normalized === "bailian") return BAILIAN_BASE;
  return OPENAI_BASE;
}

function isChatCompletionsProvider(provider) {
  const normalized = cleanProvider(provider);
  return normalized === "zhipu" || normalized === "bailian";
}

function providerDisplayName(provider) {
  const normalized = cleanProvider(provider);
  if (normalized === "zhipu") return "Zhipu GLM";
  if (normalized === "bailian") return "Alibaba Cloud Bailian";
  return "OpenAI";
}

function providerAvailability(provider, country) {
  if (cleanProvider(provider) === "openai" && String(country || "").toUpperCase() === "CN") {
    return { available: false, code: "REGION_UNSUPPORTED" };
  }
  return { available: true, code: null };
}

async function validateProjectKey(key) {
  let response;
  try {
    response = await fetch(OPENAI_BASE + "/v1/models", {
      headers: { Authorization: "Bearer " + key, Accept: "application/json" }
    });
  } catch {
    return { ok: false, error: "Unable to reach OpenAI.", code: "OPENAI_UNREACHABLE" };
  }
  if (!response.ok) {
    const payload = await response.text();
    const detail = safeUpstreamError(payload);
    if (isUnsupportedRegionMessage(detail)) {
      return {
        ok: false,
        code: "REGION_UNSUPPORTED",
        error: "OpenAI API is unavailable from the current service region."
      };
    }
    return { ok: false, error: "OpenAI API key rejected: " + detail, code: "KEY_REJECTED" };
  }
  let payload;
  try {
    payload = await response.json();
  } catch {
    return { ok: false, error: "OpenAI returned an invalid model list.", code: "INVALID_MODEL_LIST" };
  }
  const models = [...new Set((payload?.data || [])
    .map(item => cleanModel(item?.id))
    .filter(Boolean)
    .filter(isChatModel))]
    .sort(compareModelIds)
    .slice(0, 120);
  return { ok: true, models };
}

function isUnsupportedRegionMessage(value) {
  return /country,? region,? or territory not supported|unsupported countr|unsupported region|unsupported territor/i.test(String(value || ""));
}

function isChatModel(id) {
  const value = String(id || "").toLowerCase();
  if (!/^(gpt-|o[134](?:-|$)|chatgpt-)/.test(value)) return false;
  return !/(realtime|audio|transcrib|tts|image|embedding|moderation|whisper|dall-e)/.test(value);
}

function compareModelIds(a, b) {
  const priority = ["gpt-5.6", "gpt-5.6-sol", "gpt-5.6-terra", "gpt-5.6-luna"];
  const ai = priority.indexOf(a);
  const bi = priority.indexOf(b);
  if (ai >= 0 || bi >= 0) {
    if (ai < 0) return 1;
    if (bi < 0) return -1;
    return ai - bi;
  }
  return a.localeCompare(b);
}

function compareBailianModelIds(a, b) {
  const ai = BAILIAN_PREFERRED_MODELS.indexOf(a);
  const bi = BAILIAN_PREFERRED_MODELS.indexOf(b);
  if (ai >= 0 || bi >= 0) {
    if (ai < 0) return 1;
    if (bi < 0) return -1;
    return ai - bi;
  }
  return a.localeCompare(b);
}

async function readOpenAiMonthCosts(adminKey) {
  const now = new Date();
  const start = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1) / 1000);
  const end = Math.floor(Date.now() / 1000) + 1;
  const url = new URL(OPENAI_BASE + "/v1/organization/costs");
  url.searchParams.set("start_time", String(start));
  url.searchParams.set("end_time", String(end));
  url.searchParams.set("bucket_width", "1d");
  url.searchParams.set("limit", "31");

  let response;
  try {
    response = await fetch(url.toString(), {
      headers: { Authorization: "Bearer " + adminKey, Accept: "application/json" }
    });
  } catch {
    return { available: false, official_month_usd: null, error: "Unable to reach OpenAI Costs API." };
  }

  if (!response.ok) {
    const payload = await response.text();
    return {
      available: false,
      official_month_usd: null,
      error: "OpenAI Costs API rejected the Admin Key: " + safeUpstreamError(payload)
    };
  }

  let payload;
  try { payload = await response.json(); }
  catch { return { available: false, official_month_usd: null, error: "OpenAI Costs API returned invalid JSON." }; }

  let total = 0;
  for (const bucket of payload?.data || []) {
    for (const result of bucket?.results || []) {
      if (String(result?.amount?.currency || "").toLowerCase() === "usd") {
        total += Number(result?.amount?.value) || 0;
      }
    }
  }
  return {
    available: true,
    official_month_usd: Number(total.toFixed(6)),
    currency: "usd",
    as_of: new Date().toISOString()
  };
}

function estimateCost(model, inputTokens, outputTokens, provider) {
  const known = KNOWN_PRICES[model];
  const inputPrice = known?.input ?? Number(provider?.input_price_per_million || 0);
  const outputPrice = known?.output ?? Number(provider?.output_price_per_million || 0);
  return Number((((inputTokens / 1e6) * inputPrice) + ((outputTokens / 1e6) * outputPrice)).toFixed(6));
}

async function rpc(session, name, params) {
  const response = await fetch(SUPABASE_URL + "/rest/v1/rpc/" + name, {
    method: "POST",
    headers: auth(session, { "Content-Type": "application/json" }),
    body: JSON.stringify(params)
  });
  let data = null;
  try { data = await response.json(); } catch {}
  return { ok: response.ok, status: response.status, data };
}

async function restData(session, path, options = {}) {
  const response = await fetch(SUPABASE_URL + "/rest/v1" + path, {
    ...options,
    headers: auth(session, {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {})
    })
  });
  let data = null;
  try { data = await response.json(); } catch {}
  return { ok: response.ok, status: response.status, data };
}

async function rest(session, path, options = {}) {
  const result = await restData(session, path, options);
  return json(
    result.ok ? result.data : { error: result.data?.message || "Database request failed." },
    result.ok ? 200 : (result.status || 502)
  );
}

function auth(session, extra = {}) {
  return {
    apikey: SUPABASE_KEY,
    Authorization: "Bearer " + session.accessToken,
    ...extra
  };
}

async function body(request) {
  try { return await request.json(); }
  catch { return {}; }
}

function sameOrigin(request) {
  const url = new URL(request.url);
  return (request.headers.get("Origin") || "") === url.origin;
}

function models(value) {
  return [...new Set(
    (Array.isArray(value) ? value : String(value || "").split(","))
      .map(cleanModel)
      .filter(Boolean)
  )].slice(0, 30);
}

function cleanModel(value) {
  const s = String(value || "").trim();
  return /^[a-zA-Z0-9._:-]{1,100}$/.test(s) ? s : "";
}

function clean(value, maximum) {
  const s = String(value || "").trim();
  return s && s.length <= maximum && !/[\u0000-\u001f\u007f]/.test(s) ? s : "";
}

function numOrNull(value) {
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function numOrZero(value) {
  return numOrNull(value) || 0;
}

function uuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function sanitizeProvider(row) {
  return {
    id: row.id,
    name: row.name,
    provider: row.provider,
    base_url: row.base_url,
    key_hint: row.key_hint,
    admin_key_hint: row.admin_key_hint,
    default_model: row.default_model,
    allowed_models: row.allowed_models,
    monthly_budget_usd: row.monthly_budget_usd,
    is_active: row.is_active
  };
}

function upstreamDiagnostic(response, rawBody) {
  const raw = String(rawBody || "");
  let parsed = null;
  try { parsed = JSON.parse(raw); } catch {}

  const providerCode = cleanDiagnosticValue(
    parsed?.error?.code ?? parsed?.error_code ?? parsed?.code ?? parsed?.error?.type ?? ""
  );
  const requestId = cleanDiagnosticValue(
    response?.headers?.get("x-request-id") ||
    response?.headers?.get("x-zhipu-request-id") ||
    response?.headers?.get("request-id") ||
    parsed?.request_id ||
    parsed?.requestId ||
    ""
  );
  const retryAfter = parseRetryAfter(response?.headers?.get("retry-after"));
  return {
    upstream_status: Number(response?.status) || null,
    provider_code: providerCode || null,
    request_id: requestId || null,
    retry_after_seconds: retryAfter,
    checked_at: new Date().toISOString(),
    message: safeUpstreamError(raw)
  };
}

function cleanDiagnosticValue(value) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, 120);
}

function parseRetryAfter(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  if (/^\d+$/.test(raw)) return Math.max(0, Math.min(3600, Number(raw)));
  const timestamp = Date.parse(raw);
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(0, Math.min(3600, Math.ceil((timestamp - Date.now()) / 1000)));
}

function safeUpstreamError(value) {
  const raw = String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  if (!raw) return "request failed";
  try {
    const parsed = JSON.parse(raw);
    return String(parsed?.error?.message || parsed?.message || "request failed").slice(0, 240);
  } catch {
    return raw.slice(0, 240);
  }
}

function b64(bytes) {
  let s = "";
  for (const byte of bytes) s += String.fromCharCode(byte);
  return btoa(s);
}

function unb64(value) {
  const raw = atob(value);
  return Uint8Array.from(raw, char => char.charCodeAt(0));
}

async function cryptoKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    await crypto.subtle.digest("SHA-256", enc.encode(secret)),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encrypt(value, secret) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await cryptoKey(secret);
  const output = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(value));
  return { cipher: b64(new Uint8Array(output)), iv: b64(iv) };
}

async function decrypt(cipher, iv, secret) {
  const key = await cryptoKey(secret);
  const output = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, key, unb64(cipher));
  return dec.decode(output);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });
}
