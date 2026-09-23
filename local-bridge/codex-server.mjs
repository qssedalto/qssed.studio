import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";
import { spawn } from "node:child_process";
import { EventEmitter } from "node:events";

const HOST = "127.0.0.1";
const PORT = 32146;
const PROTOCOL = 1;
const VERSION = "0.1.0";
const SERVICE = "qsseda-codex-bridge";
const DEFAULT_ORIGINS = [
  "https://gpt.qsseda.com",
  "https://gpt.qsseda.online",
  "https://gpt.qsseda.studio"
];
const EXTRA_ORIGINS = String(process.env.QSSEDA_CODEX_BRIDGE_ORIGINS || "")
  .split(",")
  .map(value => value.trim())
  .filter(Boolean);
const ALLOWED_ORIGINS = new Set([...DEFAULT_ORIGINS, ...EXTRA_ORIGINS]);
const ALLOWED_HOSTS = new Set([`${HOST}:${PORT}`, `localhost:${PORT}`]);
const BRIDGE_TOKEN = String(process.env.QSSEDA_CODEX_BRIDGE_TOKEN || "").trim();
const CODEX_COMMAND = String(process.env.QSSEDA_CODEX || "codex").trim() || "codex";
const DATA_ROOT = process.env.QSSEDA_CODEX_BRIDGE_HOME
  ? path.resolve(process.env.QSSEDA_CODEX_BRIDGE_HOME)
  : path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), ".qsseda"), "QssedA", "CodexBridge");
const CODEX_HOME = path.join(DATA_ROOT, "codex-home");
const CHAT_ROOT = path.join(DATA_ROOT, "chat-workspace");
const MAX_BODY = 64 * 1024;
const MAX_MESSAGE = 48 * 1024;

for (const directory of [DATA_ROOT, CODEX_HOME, CHAT_ROOT]) {
  fs.mkdirSync(directory, { recursive: true });
}

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
    const env = { ...process.env, CODEX_HOME };
    let child;
    try {
      child = spawn(CODEX_COMMAND, ["app-server"], {
        cwd: CHAT_ROOT,
        env,
        shell: false,
        windowsHide: true,
        stdio: ["pipe", "pipe", "pipe"]
      });
    } catch (error) {
      throw new Error(`Unable to start Codex: ${error?.message || error}`);
    }

    this.child = child;
    const rl = readline.createInterface({ input: child.stdout });
    rl.on("line", line => this.handleLine(line));
    child.stderr.on("data", chunk => {
      this.stderrTail = (this.stderrTail + String(chunk)).slice(-8192);
    });
    child.on("error", error => this.failAll(new Error(`Codex process error: ${error?.message || error}`)));
    child.on("close", code => {
      const message = this.stderrTail.trim() || `Codex app-server exited with code ${code}`;
      this.ready = false;
      this.child = null;
      this.failAll(new Error(message));
      this.emit("process/closed", { code, message });
    });

    await this.rpc("initialize", {
      clientInfo: {
        name: "qsseda_gpt_local_bridge",
        title: "AERTEX Bridge",
        version: VERSION
      }
    }, 15000, true);
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
      const pending = this.pending.get(String(message.id));
      if (!pending) return;
      this.pending.delete(String(message.id));
      clearTimeout(pending.timer);
      if (message.error) {
        pending.reject(new Error(String(message.error.message || "Codex request failed")));
      } else {
        pending.resolve(message.result);
      }
      return;
    }

    if (message?.method) this.emit("notification", message);
  }

  rpc(method, params = {}, timeoutMs = 15000, allowBeforeReady = false) {
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
  const host = String(request.headers.host || "").toLowerCase();
  const remoteAddress = String(request.socket?.remoteAddress || "");
  const localRequest = isLoopback(remoteAddress);
  if (!localRequest) return sendJson(response, 403, { error: "Bridge accepts loopback connections only." });

  const origin = String(request.headers.origin || "");
  if (origin && !ALLOWED_ORIGINS.has(origin)) return sendJson(response, 403, { error: "Origin is not allowed." });

  if (request.method === "OPTIONS") {
    if (!origin) return sendJson(response, 400, { error: "Origin is required for preflight." });
    applyCors(response, origin, request);
    response.writeHead(204, {
      "cache-control": "no-store",
      "access-control-max-age": "600"
    });
    return response.end();
  }

  const url = new URL(request.url || "/", `http://${ALLOWED_HOSTS.has(host) ? host : `${HOST}:${PORT}`}`);
  applyCors(response, origin, request);

  if (!isAuthorizedBridgeRequest(request, url.pathname, origin, host)) {
    return sendJson(response, 401, { error: "Bridge authentication required." });
  }

  try {
    if (request.method === "GET" && url.pathname === "/health") {
      const probe = await probeCodex();
      return sendJson(response, 200, {
        service: SERVICE,
        protocol: PROTOCOL,
        version: VERSION,
        codex: probe,
        capabilities: [
          "codex.account",
          "codex.chatgpt-device-login",
          "codex.models",
          "codex.rate-limits",
          "codex.threads",
          "codex.chat-stream"
        ]
      });
    }

    if (request.method === "GET" && url.pathname === "/codex/account") {
      await codex.ensureStarted();
      const result = await codex.rpc("account/read", { refreshToken: false });
      return sendJson(response, 200, sanitizeAccount(result));
    }

    if (request.method === "GET" && url.pathname === "/codex/models") {
      await codex.ensureStarted();
      const result = await codex.rpc("model/list", { limit: 50, includeHidden: false });
      return sendJson(response, 200, { data: sanitizeModels(result?.data), nextCursor: result?.nextCursor || null });
    }

    if (request.method === "GET" && url.pathname === "/codex/rate-limits") {
      await codex.ensureStarted();
      const result = await codex.rpc("account/rateLimits/read", {});
      return sendJson(response, 200, sanitizeRateLimits(result));
    }

    if (request.method === "GET" && url.pathname === "/codex/threads") {
      await codex.ensureStarted();
      const result = await codex.rpc("thread/list", {
        limit: clampInt(url.searchParams.get("limit"), 1, 50, 20),
        archived: false,
        cwd: CHAT_ROOT
      });
      return sendJson(response, 200, { data: sanitizeThreads(result?.data), nextCursor: result?.nextCursor || null });
    }

    if (request.method === "POST" && url.pathname === "/codex/login/device") {
      await codex.ensureStarted();
      const result = await codex.rpc("account/login/start", { type: "chatgptDeviceCode" }, 20000);
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
      const result = await codex.rpc("account/logout", {}, 15000);
      return sendJson(response, 200, { ok: true, result: result ?? null });
    }

    if (request.method === "POST" && url.pathname === "/codex/thread") {
      await codex.ensureStarted();
      const body = await readJsonBody(request);
      const model = safeModel(body?.model);
      const params = {
        cwd: CHAT_ROOT,
        approvalPolicy: "never",
        sandbox: "readOnly",
        personality: "friendly",
        serviceName: "qsseda_gpt_local_bridge"
      };
      if (model) params.model = model;
      const result = await codex.rpc("thread/start", params, 30000);
      return sendJson(response, 200, {
        thread: sanitizeThread(result?.thread),
        instructionSources: Array.isArray(result?.instructionSources) ? [] : undefined
      });
    }

    if (request.method === "POST" && url.pathname === "/codex/turn") {
      return streamTurn(request, response, origin);
    }

    return sendJson(response, 404, { error: "Unknown Codex bridge route." });
  } catch (error) {
    return sendJson(response, error?.statusCode || 503, {
      error: safeString(error?.message || error, 1000) || "Codex bridge request failed."
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`AERTEX Bridge ${VERSION} listening on http://${HOST}:${PORT}`);
  console.log("Allowed web origins:", [...ALLOWED_ORIGINS].join(", "));
  console.log("Codex home:", CODEX_HOME);
});

server.on("error", error => {
  console.error("AERTEX Bridge failed:", error?.message || error);
  process.exitCode = 1;
});

async function streamTurn(request, response, origin) {
  await codex.ensureStarted();
  const body = await readJsonBody(request);
  const threadId = safeOpaqueId(body?.threadId, 240);
  const message = safeString(body?.message, MAX_MESSAGE);
  const model = safeModel(body?.model);
  const effort = safeEffort(body?.effort);
  if (!threadId || !message) {
    return sendJson(response, 400, { error: "threadId and message are required." });
  }

  response.statusCode = 200;
  response.setHeader("content-type", "text/event-stream;charset=UTF-8");
  response.setHeader("cache-control", "no-store");
  response.setHeader("x-content-type-options", "nosniff");
  response.setHeader("connection", "keep-alive");
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    response.setHeader("access-control-allow-origin", origin);
    response.setHeader("vary", "Origin");
  }
  response.flushHeaders?.();

  let closed = false;
  let turnId = "";
  const sendEvent = (event, data) => {
    if (closed || response.writableEnded) return;
    response.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const listener = notification => {
    const method = String(notification?.method || "");
    const params = notification?.params || {};
    if (safeString(params.threadId, 240) && params.threadId !== threadId) return;
    if (turnId && safeString(params.turnId, 240) && params.turnId !== turnId) return;

    if (method === "item/agentMessage/delta") {
      const delta = safeString(params.delta, 64 * 1024);
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

  const cleanup = () => {
    if (closed) return;
    closed = true;
    codex.off("notification", listener);
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
      },
      personality: "friendly"
    };
    if (model) params.model = model;
    if (effort) params.effort = effort;
    const result = await codex.rpc("turn/start", params, 30000);
    turnId = safeOpaqueId(result?.turn?.id, 240);
    sendEvent("started", {
      turnId,
      status: safeString(result?.turn?.status, 80) || "inProgress"
    });
  } catch (error) {
    sendEvent("error", { error: safeString(error?.message || error, 1200) || "Unable to start Codex turn." });
    cleanup();
    try { response.end(); } catch {}
  }
}

function isAuthorizedBridgeRequest(request, pathname, origin, host) {
  const browserLocalRequest = ALLOWED_HOSTS.has(host) && Boolean(origin) && ALLOWED_ORIGINS.has(origin);
  if (browserLocalRequest) return true;
  if (!BRIDGE_TOKEN) return false;
  const header = String(request.headers.authorization || "");
  return header === `Bearer ${BRIDGE_TOKEN}`;
}

function isLoopback(address) {
  return address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1";
}

function applyCors(response, origin, request) {
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return;
  response.setHeader("access-control-allow-origin", origin);
  response.setHeader("vary", "Origin");
  response.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
  response.setHeader("access-control-allow-headers", "Accept, Content-Type");
  if (String(request.headers["access-control-request-private-network"] || "").toLowerCase() === "true") {
    response.setHeader("access-control-allow-private-network", "true");
  }
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

async function probeCodex() {
  const result = await runProbe(CODEX_COMMAND, ["--version"], 2500);
  return {
    available: result.ok,
    version: safeString((result.stdout || result.stderr).split(/\r?\n/).find(Boolean), 200),
    appServerReady: codex.ready
  };
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
  return JSON.parse(JSON.stringify(raw, (_key, value) => {
    if (typeof value === "string") return value.slice(0, 500);
    return value;
  }));
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
  if (typeof item?.text === "string") return safeString(item.text, 256 * 1024);
  if (typeof item?.content === "string") return safeString(item.content, 256 * 1024);
  if (Array.isArray(item?.content)) {
    return item.content.map(part => safeString(part?.text, 64 * 1024)).filter(Boolean).join("");
  }
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
