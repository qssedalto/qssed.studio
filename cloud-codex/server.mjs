import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { spawn } from "node:child_process";
import { EventEmitter } from "node:events";

const HOST = "0.0.0.0";
const PORT = Number.parseInt(process.env.PORT || "8080", 10) || 8080;
const VERSION = "0.2.0";
const SERVICE = "qsseda-cloud-codex";
const CODEX_COMMAND = process.env.QSSEDA_CODEX || "codex";
const CODEX_HOME = path.resolve(process.env.CODEX_HOME || "/data/codex-home");
const CHAT_ROOT = path.resolve(process.env.QSSEDA_CODEX_CHAT_ROOT || "/data/chat-workspace");
const AUTH_FILE = path.join(CODEX_HOME, "auth.json");
const CONFIG_FILE = path.join(CODEX_HOME, "config.toml");
const MAX_BODY = 128 * 1024;
const MAX_MESSAGE = 48 * 1024;

for (const directory of [CODEX_HOME, CHAT_ROOT]) fs.mkdirSync(directory, { recursive: true });
ensureCodexConfig();

class CodexAppServer extends EventEmitter {
  constructor() {
    super();
    this.child = null;
    this.pending = new Map();
    this.nextId = 1;
    this.ready = false;
    this.startPromise = null;
    this.stderrTail = "";
  }

  async ensureStarted() {
    if (this.ready && this.child && !this.child.killed) return;
    if (this.startPromise) return this.startPromise;
    this.startPromise = this.start();
    try { await this.startPromise; }
    finally { this.startPromise = null; }
  }

  async start() {
    this.stop();
    this.stderrTail = "";
    const child = spawn(CODEX_COMMAND, ["app-server"], {
      cwd: CHAT_ROOT,
      env: { ...process.env, CODEX_HOME },
      shell: false,
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"]
    });

    this.child = child;
    const lines = readline.createInterface({ input: child.stdout });
    lines.on("line", line => this.handleLine(line));
    child.stderr.on("data", chunk => {
      this.stderrTail = (this.stderrTail + String(chunk)).slice(-8192);
    });
    child.on("error", error => {
      this.ready = false;
      this.failAll(new Error(`Codex process error: ${error?.message || error}`));
    });
    child.on("close", code => {
      const message = this.stderrTail.trim() || `Codex app-server exited with code ${code}`;
      this.ready = false;
      this.child = null;
      this.failAll(new Error(message));
    });

    await this.rpc("initialize", {
      clientInfo: {
        name: "qsseda_gpt_cloud",
        title: "QssedA GPT Cloud",
        version: VERSION
      }
    }, 20000, true);
    this.notify("initialized", {});
    this.ready = true;
  }

  stop() {
    if (this.child) {
      try { this.child.kill(); } catch {}
    }
    this.child = null;
    this.ready = false;
  }

  handleLine(line) {
    let message;
    try { message = JSON.parse(String(line || "")); }
    catch { return; }

    if (Object.prototype.hasOwnProperty.call(message, "id")) {
      const key = String(message.id);
      const pending = this.pending.get(key);
      if (!pending) return;
      this.pending.delete(key);
      clearTimeout(pending.timer);
      if (message.error) pending.reject(new Error(String(message.error.message || "Codex request failed")));
      else pending.resolve(message.result);
      return;
    }

    if (message?.method) this.emit("notification", message);
  }

  rpc(method, params = {}, timeoutMs = 20000, allowBeforeReady = false) {
    if ((!this.child || this.child.killed) && !allowBeforeReady) {
      return Promise.reject(new Error("Codex app-server is not running."));
    }
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(String(id));
        reject(new Error(`Codex request timed out: ${method}`));
      }, timeoutMs);
      this.pending.set(String(id), { resolve, reject, timer });
      this.write({ method, id, params });
    });
  }

  notify(method, params = {}) {
    this.write({ method, params });
  }

  write(message) {
    if (!this.child?.stdin?.writable) throw new Error("Codex app-server stdin is unavailable.");
    this.child.stdin.write(`${JSON.stringify(message)}\n`);
  }

  failAll(error) {
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(error);
    }
    this.pending.clear();
  }
}

const codex = new CodexAppServer();

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://127.0.0.1:${PORT}`);

  try {
    if (request.method === "GET" && url.pathname === "/health") {
      const probe = await runProbe(CODEX_COMMAND, ["--version"], 3000);
      return sendJson(response, 200, {
        service: SERVICE,
        version: VERSION,
        codex: {
          available: probe.ok,
          version: safeString((probe.stdout || probe.stderr).split(/\r?\n/).find(Boolean), 200),
          appServerReady: codex.ready
        }
      });
    }

    if (request.method === "POST" && url.pathname === "/internal/auth/restore") {
      if (codex.ready) return sendJson(response, 409, { error: "Cannot restore auth after Codex has started." });
      const body = await readJsonBody(request);
      const authJson = typeof body?.authJson === "string" ? body.authJson : "";
      if (!authJson) {
        try { fs.rmSync(AUTH_FILE, { force: true }); } catch {}
        return sendJson(response, 200, { ok: true, restored: false });
      }
      validateAuthJson(authJson);
      fs.writeFileSync(AUTH_FILE, authJson, { encoding: "utf8", mode: 0o600 });
      return sendJson(response, 200, { ok: true, restored: true });
    }

    if (request.method === "GET" && url.pathname === "/internal/auth/export") {
      let authJson = "";
      try { authJson = fs.readFileSync(AUTH_FILE, "utf8"); } catch {}
      if (authJson) validateAuthJson(authJson);
      return sendJson(response, 200, { authJson });
    }

    if (request.method === "GET" && url.pathname === "/codex/account") {
      await codex.ensureStarted();
      const result = await codex.rpc("account/read", { refreshToken: true }, 30000);
      return sendJson(response, 200, sanitizeAccount(result));
    }

    if (request.method === "GET" && url.pathname === "/codex/models") {
      await codex.ensureStarted();
      const result = await codex.rpc("model/list", { limit: 50, includeHidden: false }, 30000);
      return sendJson(response, 200, { data: sanitizeModels(result?.data), nextCursor: result?.nextCursor || null });
    }

    if (request.method === "GET" && url.pathname === "/codex/rate-limits") {
      await codex.ensureStarted();
      const result = await codex.rpc("account/rateLimits/read", {}, 30000);
      return sendJson(response, 200, sanitizeRateLimits(result));
    }

    if (request.method === "GET" && url.pathname === "/codex/threads") {
      await codex.ensureStarted();
      const result = await codex.rpc("thread/list", {
        limit: clampInt(url.searchParams.get("limit"), 1, 50, 20),
        archived: false,
        cwd: CHAT_ROOT
      }, 30000);
      return sendJson(response, 200, { data: sanitizeThreads(result?.data), nextCursor: result?.nextCursor || null });
    }

    if (request.method === "POST" && url.pathname === "/codex/login/device") {
      await codex.ensureStarted();
      const result = await codex.rpc("account/login/start", { type: "chatgptDeviceCode" }, 30000);
      return sendJson(response, 200, {
        type: result?.type || "chatgptDeviceCode",
        loginId: safeString(result?.loginId, 160),
        verificationUrl: safeHttpsUrl(result?.verificationUrl),
        userCode: safeString(result?.userCode, 80)
      });
    }

    if (request.method === "POST" && url.pathname === "/codex/logout") {
      await codex.ensureStarted();
      await readJsonBody(request);
      await codex.rpc("account/logout", {}, 20000);
      return sendJson(response, 200, { ok: true });
    }

    if (request.method === "POST" && url.pathname === "/codex/thread") {
      await codex.ensureStarted();
      const body = await readJsonBody(request);
      const model = safeModel(body?.model);
      const params = {
        cwd: CHAT_ROOT,
        approvalPolicy: "never",
        sandbox: "readOnly",
        serviceName: "qsseda_gpt_cloud"
      };
      if (model) params.model = model;
      const result = await codex.rpc("thread/start", params, 45000);
      return sendJson(response, 200, { thread: sanitizeThread(result?.thread) });
    }

    if (request.method === "POST" && url.pathname === "/codex/turn") {
      return streamTurn(request, response);
    }

    return sendJson(response, 404, { error: "Unknown cloud Codex route." });
  } catch (error) {
    return sendJson(response, error?.statusCode || 503, {
      error: safeString(error?.message || error, 1000) || "Cloud Codex request failed."
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`QssedA Cloud Codex ${VERSION} listening on ${HOST}:${PORT}`);
});

server.on("error", error => {
  console.error("QssedA Cloud Codex failed:", error?.message || error);
  process.exitCode = 1;
});

async function streamTurn(request, response) {
  await codex.ensureStarted();
  const body = await readJsonBody(request);
  const threadId = safeOpaqueId(body?.threadId, 240);
  const message = safeString(body?.message, MAX_MESSAGE);
  const model = safeModel(body?.model);
  const effort = safeEffort(body?.effort);
  if (!threadId || !message) return sendJson(response, 400, { error: "threadId and message are required." });

  response.statusCode = 200;
  response.setHeader("content-type", "text/event-stream;charset=UTF-8");
  response.setHeader("cache-control", "no-store");
  response.setHeader("x-content-type-options", "nosniff");
  response.setHeader("connection", "keep-alive");
  response.flushHeaders?.();

  let closed = false;
  let turnId = "";
  const sendEvent = (event, data) => {
    if (closed || response.writableEnded) return;
    response.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const cleanup = () => {
    if (closed) return;
    closed = true;
    codex.off("notification", listener);
  };

  const listener = notification => {
    const method = String(notification?.method || "");
    const params = notification?.params || {};
    if (safeString(params.threadId, 240) && params.threadId !== threadId) return;
    if (turnId && safeString(params.turnId, 240) && params.turnId !== turnId) return;

    if (method === "item/agentMessage/delta") {
      const delta = typeof params.delta === "string" ? params.delta.slice(0, 64 * 1024) : "";
      if (delta) sendEvent("delta", { delta });
      return;
    }

    if (method === "item/completed") {
      const item = params.item || {};
      if (item.type === "agentMessage") {
        const text = extractAgentMessageText(item);
        if (text) sendEvent("message", { text });
      }
      return;
    }

    if (method === "error") {
      sendEvent("error", { error: safeString(params?.error?.message || params?.message, 1200) || "Codex turn failed." });
      return;
    }

    if (method === "turn/completed") {
      const turn = params.turn || {};
      if (turnId && turn.id && turn.id !== turnId) return;
      sendEvent("done", {
        status: safeString(turn.status, 80) || "completed",
        error: safeString(turn?.error?.message, 1200)
      });
      cleanup();
      try { response.end(); } catch {}
    }
  };

  codex.on("notification", listener);
  request.on("close", cleanup);
  response.on("close", cleanup);

  try {
    const params = {
      threadId,
      input: [{ type: "text", text: message }],
      cwd: CHAT_ROOT,
      approvalPolicy: "never",
      sandboxPolicy: {
        type: "readOnly",
        access: {
          type: "restricted",
          includePlatformDefaults: true,
          readableRoots: [CHAT_ROOT]
        }
      }
    };
    if (model) params.model = model;
    if (effort) params.effort = effort;
    const result = await codex.rpc("turn/start", params, 45000);
    turnId = safeOpaqueId(result?.turn?.id, 240);
    sendEvent("started", { turnId, status: safeString(result?.turn?.status, 80) || "inProgress" });
  } catch (error) {
    sendEvent("error", { error: safeString(error?.message || error, 1200) || "Unable to start Codex turn." });
    cleanup();
    try { response.end(); } catch {}
  }
}

function ensureCodexConfig() {
  let current = "";
  try { current = fs.readFileSync(CONFIG_FILE, "utf8"); } catch {}
  if (current.includes('cli_auth_credentials_store = "file"')) return;
  const suffix = current && !current.endsWith("\n") ? "\n" : "";
  fs.writeFileSync(CONFIG_FILE, `${current}${suffix}cli_auth_credentials_store = "file"\n`, { encoding: "utf8", mode: 0o600 });
}

function validateAuthJson(value) {
  if (typeof value !== "string" || value.length > MAX_BODY) throw new Error("Stored Codex auth state is invalid.");
  const parsed = JSON.parse(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Stored Codex auth state must be a JSON object.");
}

function sendJson(response, status, payload) {
  if (response.writableEnded) return;
  response.writeHead(status, {
    "content-type": "application/json;charset=UTF-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch {
    const error = new Error("Invalid JSON request body.");
    error.statusCode = 400;
    throw error;
  }
}

function runProbe(command, args, timeoutMs) {
  return new Promise(resolve => {
    let stdout = "";
    let stderr = "";
    let settled = false;
    let child;
    try {
      child = spawn(command, args, { shell: false, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    } catch (error) {
      resolve({ ok: false, stdout: "", stderr: String(error?.message || error) });
      return;
    }
    const finish = ok => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ ok, stdout: stdout.slice(0, 4096), stderr: stderr.slice(0, 4096) });
    };
    child.stdout.on("data", chunk => { stdout += String(chunk); });
    child.stderr.on("data", chunk => { stderr += String(chunk); });
    child.on("error", error => { stderr += String(error?.message || error); finish(false); });
    child.on("close", code => finish(code === 0));
    const timer = setTimeout(() => {
      try { child.kill(); } catch {}
      finish(false);
    }, timeoutMs);
  });
}

function sanitizeAccount(result) {
  const account = result?.account || null;
  if (!account) return { account: null, requiresOpenaiAuth: Boolean(result?.requiresOpenaiAuth) };
  return {
    account: {
      type: safeString(account.type, 80),
      email: safeString(account.email, 240),
      planType: safeString(account.planType, 80),
      credentialSource: safeString(account.credentialSource, 80)
    },
    requiresOpenaiAuth: Boolean(result?.requiresOpenaiAuth)
  };
}

function sanitizeModels(data) {
  return Array.isArray(data) ? data.slice(0, 50).map(item => ({
    id: safeString(item?.id || item?.model, 160),
    model: safeString(item?.model || item?.id, 160),
    displayName: safeString(item?.displayName || item?.model || item?.id, 200),
    isDefault: Boolean(item?.isDefault),
    defaultReasoningEffort: safeString(item?.defaultReasoningEffort, 40),
    supportedReasoningEfforts: Array.isArray(item?.supportedReasoningEfforts)
      ? item.supportedReasoningEfforts.slice(0, 10).map(entry => ({
          reasoningEffort: safeString(entry?.reasoningEffort, 40),
          description: safeString(entry?.description, 240)
        }))
      : [],
    inputModalities: Array.isArray(item?.inputModalities) ? item.inputModalities.map(value => safeString(value, 40)).filter(Boolean) : []
  })).filter(item => item.id) : [];
}

function sanitizeRateLimits(result) {
  const raw = result?.rateLimits || result || {};
  return JSON.parse(JSON.stringify(raw, (_key, value) => typeof value === "string" ? value.slice(0, 500) : value));
}

function sanitizeThreads(data) {
  return Array.isArray(data) ? data.slice(0, 50).map(sanitizeThread).filter(Boolean) : [];
}

function sanitizeThread(thread) {
  if (!thread?.id) return null;
  return {
    id: safeOpaqueId(thread.id, 240),
    sessionId: safeOpaqueId(thread.sessionId, 240),
    name: safeString(thread.name, 240),
    preview: safeString(thread.preview, 600),
    modelProvider: safeString(thread.modelProvider, 100),
    createdAt: Number(thread.createdAt) || 0,
    updatedAt: Number(thread.updatedAt) || 0,
    status: safeString(thread.status, 80)
  };
}

function extractAgentMessageText(item) {
  if (typeof item?.text === "string") return item.text.slice(0, 256 * 1024);
  if (typeof item?.content === "string") return item.content.slice(0, 256 * 1024);
  if (Array.isArray(item?.content)) return item.content.map(part => typeof part?.text === "string" ? part.text.slice(0, 64 * 1024) : "").filter(Boolean).join("");
  return "";
}

function safeModel(value) {
  const model = safeString(value, 160);
  return /^[A-Za-z0-9._:-]+$/.test(model) ? model : "";
}

function safeEffort(value) {
  const effort = safeString(value, 40);
  return ["none", "minimal", "low", "medium", "high", "xhigh"].includes(effort) ? effort : "";
}

function safeOpaqueId(value, maxLength) {
  const id = safeString(value, maxLength);
  return /^[A-Za-z0-9._:-]+$/.test(id) ? id : "";
}

function safeString(value, maxLength = 1000) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function safeHttpsUrl(value) {
  const text = safeString(value, 2000);
  if (!text) return "";
  try {
    const url = new URL(text);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function clampInt(value, minimum, maximum, fallback) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? Math.max(minimum, Math.min(maximum, number)) : fallback;
}
