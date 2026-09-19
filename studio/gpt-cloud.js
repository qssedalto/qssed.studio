import { DurableObject } from "cloudflare:workers";

const CONTAINER_PORT = 8080;
const INSTANCE_NAME = "primary";
const OWNER_KEY = "owner_user_id";
const AUTH_KEY = "codex_auth_json";
const IDLE_MS = 10 * 60 * 1000;
const ALLOWED_PATHS = new Map([
  ["/api/gpt/account", { target: "/codex/account", methods: ["GET"], owner: false }],
  ["/api/gpt/models", { target: "/codex/models", methods: ["GET"], owner: true }],
  ["/api/gpt/rate-limits", { target: "/codex/rate-limits", methods: ["GET"], owner: true }],
  ["/api/gpt/threads", { target: "/codex/threads", methods: ["GET"], owner: true }],
  ["/api/gpt/login/device", { target: "/codex/login/device", methods: ["POST"], owner: false, claim: true }],
  ["/api/gpt/logout", { target: "/codex/logout", methods: ["POST"], owner: true }],
  ["/api/gpt/thread", { target: "/codex/thread", methods: ["POST"], owner: true }],
  ["/api/gpt/turn", { target: "/codex/turn", methods: ["POST"], owner: true }]
]);

export class CodexCloudContainer extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.restoredForProcess = false;
  }

  async fetch(request) {
    const userId = cleanUuid(request.headers.get("x-qsseda-user-id"));
    if (!userId) return responseJson({ error: "Missing authenticated QssedA identity." }, 401);

    const url = new URL(request.url);
    const route = ALLOWED_PATHS.get(url.pathname);
    if (!route || !route.methods.includes(request.method)) return responseJson({ error: "Cloud Codex route not found." }, 404);

    let ownerId = cleanUuid(await this.ctx.storage.get(OWNER_KEY));
    if (route.claim && !ownerId) {
      await this.ctx.storage.put(OWNER_KEY, userId);
      ownerId = userId;
    }

    if (route.owner && ownerId !== userId) {
      if (!ownerId) return responseJson({ error: "Cloud Codex has not been bound to a QssedA account yet.", code: "provider_unbound" }, 409);
      return responseJson({ error: "Cloud Codex belongs to another QssedA account.", code: "provider_owner_mismatch" }, 403);
    }

    if (url.pathname === "/api/gpt/account" && ownerId && ownerId !== userId) {
      return responseJson({ error: "Cloud Codex belongs to another QssedA account.", code: "provider_owner_mismatch" }, 403);
    }

    await this.ensureContainer();
    await this.ctx.storage.setAlarm(Date.now() + IDLE_MS);

    const target = new URL(`http://container${route.target}`);
    target.search = url.search;
    const headers = new Headers();
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);
    headers.set("accept", request.headers.get("accept") || "application/json");

    const upstreamRequest = new Request(target.toString(), {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? null : request.body,
      redirect: "manual"
    });

    const upstream = await this.ctx.container.getTcpPort(CONTAINER_PORT).fetch(upstreamRequest);
    const contentTypeOut = upstream.headers.get("content-type") || "";

    if (contentTypeOut.includes("text/event-stream") && upstream.body) {
      const { readable, writable } = new TransformStream();
      this.ctx.waitUntil((async () => {
        try {
          await upstream.body.pipeTo(writable);
        } finally {
          await this.persistAuth();
          await this.ctx.storage.setAlarm(Date.now() + IDLE_MS);
        }
      })());
      return new Response(readable, {
        status: upstream.status,
        headers: cleanUpstreamHeaders(upstream.headers)
      });
    }

    const body = await upstream.arrayBuffer();
    if (url.pathname === "/api/gpt/account" || url.pathname === "/api/gpt/models" || url.pathname === "/api/gpt/rate-limits" || url.pathname === "/api/gpt/thread" || url.pathname === "/api/gpt/logout") {
      await this.persistAuth();
    }
    if (url.pathname === "/api/gpt/logout" && upstream.ok) {
      await this.ctx.storage.delete(AUTH_KEY);
    }

    return new Response(body, {
      status: upstream.status,
      headers: cleanUpstreamHeaders(upstream.headers)
    });
  }

  async alarm() {
    try { await this.persistAuth(); } catch {}
    if (this.ctx.container.running) this.ctx.container.signal(15);
    this.restoredForProcess = false;
  }

  async ensureContainer() {
    if (!this.ctx.container.running) {
      this.ctx.container.start({
        enableInternet: true,
        entrypoint: ["node", "/app/server.mjs"],
        env: {
          PORT: String(CONTAINER_PORT),
          CODEX_HOME: "/data/codex-home",
          QSSEDA_CODEX_CHAT_ROOT: "/data/chat-workspace"
        }
      });
      this.restoredForProcess = false;
    }

    const port = this.ctx.container.getTcpPort(CONTAINER_PORT);
    let ready = false;
    let lastError = "";
    for (let attempt = 0; attempt < 80; attempt += 1) {
      try {
        const response = await port.fetch("http://container/health", { headers: { accept: "application/json" } });
        if (response.ok) {
          ready = true;
          break;
        }
        lastError = `HTTP ${response.status}`;
      } catch (error) {
        lastError = String(error?.message || error);
      }
      await sleep(250);
    }
    if (!ready) throw new Error(`Cloud Codex container did not become ready: ${lastError || "timeout"}`);

    if (!this.restoredForProcess) {
      const authJson = typeof await this.ctx.storage.get(AUTH_KEY) === "string"
        ? await this.ctx.storage.get(AUTH_KEY)
        : "";
      const restore = await port.fetch("http://container/internal/auth/restore", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ authJson })
      });
      if (!restore.ok) throw new Error(`Unable to restore Codex authentication state (HTTP ${restore.status}).`);
      this.restoredForProcess = true;
    }
  }

  async persistAuth() {
    if (!this.ctx.container.running || !this.restoredForProcess) return;
    const response = await this.ctx.container.getTcpPort(CONTAINER_PORT).fetch("http://container/internal/auth/export", {
      headers: { accept: "application/json" }
    });
    if (!response.ok) return;
    const data = await response.json();
    const authJson = typeof data?.authJson === "string" ? data.authJson : "";
    if (authJson && authJson.length <= 128 * 1024) await this.ctx.storage.put(AUTH_KEY, authJson);
  }
}

export async function handleCloudCodexApi(request, env, userId) {
  if (!env?.GPT_CODEX?.getByName) return responseJson({ error: "Cloud Codex binding is unavailable." }, 503);
  const stub = env.GPT_CODEX.getByName(INSTANCE_NAME);
  const url = new URL(request.url);
  const internalUrl = new URL(url.pathname + url.search, "https://qsseda-codex.internal");
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  headers.set("accept", request.headers.get("accept") || "application/json");
  headers.set("x-qsseda-user-id", userId);

  return stub.fetch(new Request(internalUrl.toString(), {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? null : request.body,
    redirect: "manual"
  }));
}

function cleanUpstreamHeaders(source) {
  const headers = new Headers();
  for (const name of ["content-type", "cache-control", "x-content-type-options"]) {
    const value = source.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("cache-control", "no-store");
  headers.set("x-content-type-options", "nosniff");
  return headers;
}

function responseJson(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });
}

function cleanUuid(value) {
  const text = String(value || "").trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text) ? text : "";
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
