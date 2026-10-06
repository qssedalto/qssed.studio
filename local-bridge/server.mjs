/**
 * 【初学者导读】
 * 文件：local-bridge/server.mjs
 * AERTEX 本地桥接组件：连接网页与用户电脑上的本地能力。
 * 阅读顺序：先找入口/初始化函数，再看状态对象、事件监听或请求处理；随后沿 API、存储或本机调用追踪真正副作用。
 * 初学者重点：把“界面/请求入口”“业务规则”“数据读写”“错误处理”分层理解，排错会快很多。
 * 修改注意：这是本机安全边界；新增命令、文件或网络能力时必须限制来源、参数和可访问范围。
 * 调试方法：先复现最小输入，再观察中间状态；不要通过删除校验或异常处理来“修复”症状。
 */
import http from "node:http";
import { spawn } from "node:child_process";

const HOST = "127.0.0.1";
const PORT = 32145;
const PROTOCOL = 1;
const VERSION = "0.1.0";
const DEFAULT_ORIGINS = [
  "https://qsseda.com", "https://www.qsseda.com", "https://work.qsseda.com",
  "https://qsseda.online", "https://www.qsseda.online", "https://work.qsseda.online",
  "https://qsseda.studio", "https://www.qsseda.studio", "https://work.qsseda.studio"
];
const EXTRA_ORIGINS = String(process.env.QSSEDA_BRIDGE_ORIGINS || "")
  .split(",")
  .map(value => value.trim())
  .filter(Boolean);
const ALLOWED_ORIGINS = new Set([...DEFAULT_ORIGINS, ...EXTRA_ORIGINS]);
const ALLOWED_HOSTS = new Set([`${HOST}:${PORT}`, `localhost:${PORT}`]);

const server = http.createServer(async (request, response) => {
  const host = String(request.headers.host || "").toLowerCase();
  if (!ALLOWED_HOSTS.has(host)) return sendJson(response, 421, { error: "Unrecognized local host." });

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

  if (request.method !== "GET") {
    applyCors(response, origin, request);
    return sendJson(response, 405, { error: "Method not allowed." });
  }

  const url = new URL(request.url || "/", `http://${host}`);
  applyCors(response, origin, request);

  if (url.pathname === "/health") {
    return sendJson(response, 200, {
      service: "qsseda-local-bridge",
      protocol: PROTOCOL,
      version: VERSION,
      capabilities: ["health", "tex.status"]
    });
  }

  if (url.pathname === "/tex/status") {
    const tex = await detectXeLaTeX();
    return sendJson(response, 200, tex);
  }

  return sendJson(response, 404, { error: "Unknown local bridge route." });
});

server.listen(PORT, HOST, () => {
  console.log(`AERTEX Bridge ${VERSION} listening on http://${HOST}:${PORT}`);
  console.log("Allowed web origins:", [...ALLOWED_ORIGINS].join(", "));
});

server.on("error", error => {
  console.error("AERTEX Bridge failed:", error?.message || error);
  process.exitCode = 1;
});

// CORS 是本地桥接的第一道边界：只有明确允许的 AERTEX 来源才能从网页调用 localhost 服务，不能为了调试直接放成 *。\nfunction applyCors(response, origin, request) {
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return;
  response.setHeader("access-control-allow-origin", origin);
  response.setHeader("vary", "Origin");
  response.setHeader("access-control-allow-methods", "GET, OPTIONS");
  response.setHeader("access-control-allow-headers", "Accept, Content-Type");
  if (String(request.headers["access-control-request-private-network"] || "").toLowerCase() === "true") {
    response.setHeader("access-control-allow-private-network", "true");
  }
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "content-type": "application/json;charset=UTF-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  response.end(JSON.stringify(payload));
}

// 本机能力探测：只检查固定的 XeLaTeX 可执行路径/命令，不执行网页传入的任意命令。探测结果用于告诉 Work 当前电脑具备哪些 TeX 能力。\nasync function detectXeLaTeX() {
  const configured = String(process.env.QSSEDA_XELATEX || "").trim();
  const executable = configured || "xelatex";
  const result = await runFixedProbe(executable, ["--version"], 2200);
  const firstLine = String(result.stdout || result.stderr || "")
    .split(/\r?\n/)
    .map(line => line.trim())
    .find(Boolean) || "";

  return {
    available: result.ok,
    engine: "xelatex",
    version: result.ok ? firstLine.slice(0, 180) : "",
    platform: process.platform,
    arch: process.arch,
    configured: Boolean(configured)
  };
}

// 固定命令探测器：command/args 来自代码预定义而不是用户输入，并带超时，避免本地桥接退化成通用远程命令执行器。\nfunction runFixedProbe(command, args, timeoutMs) {
  return new Promise(resolve => {
    let stdout = "";
    let stderr = "";
    let settled = false;
    let child;
    let timer = null;

    try {
      child = spawn(command, args, {
        shell: false,
        windowsHide: true,
        stdio: ["ignore", "pipe", "pipe"]
      });
    } catch (error) {
      resolve({ ok: false, stdout: "", stderr: String(error?.message || error) });
      return;
    }

    const finish = ok => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      resolve({ ok, stdout: stdout.slice(0, 4096), stderr: stderr.slice(0, 4096) });
    };

    child.stdout?.on("data", chunk => { stdout += String(chunk); });
    child.stderr?.on("data", chunk => { stderr += String(chunk); });
    child.on("error", error => {
      stderr += String(error?.message || error);
      finish(false);
    });
    child.on("close", code => finish(code === 0));

    timer = setTimeout(() => {
      try { child.kill(); } catch {}
      finish(false);
    }, timeoutMs);
  });
}
