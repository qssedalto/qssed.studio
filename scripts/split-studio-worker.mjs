import fs from 'node:fs';
import path from 'node:path';

const sourcePath = 'worker.js';
const source = fs.readFileSync(sourcePath, 'utf8');
const lines = source.split('\n');

const functionRe = /^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/gm;
const starts = [];
let match;
while ((match = functionRe.exec(source))) {
  starts.push({ name: match[1], index: match.index, line: source.slice(0, match.index).split('\n').length });
}
if (!starts.length) throw new Error('No top-level functions found in worker.js');

const moduleForLine = line => {
  if (line >= 181 && line <= 245) return 'auth-handoff';
  if (line >= 246 && line <= 331) return 'routing';
  if (line >= 332 && line <= 603) return 'storage-api';
  if (line >= 604 && line <= 1077) return 'account-api';
  if (line >= 1078 && line <= 3352) return 'ui-core';
  if (line >= 3353 && line <= 5234) return 'ui-shell';
  if (line >= 5235 && line <= 6581) return 'ui-styles';
  if (line >= 6582) return 'auth-pages';
  return null;
};

const blocks = [];
for (let i = 0; i < starts.length; i++) {
  const current = starts[i];
  const end = i + 1 < starts.length ? starts[i + 1].index : source.length;
  const module = moduleForLine(current.line);
  if (!module) throw new Error(`Function ${current.name} at line ${current.line} was not assigned to a module`);
  blocks.push({ ...current, module, text: source.slice(current.index, end) });
}

const modules = new Map();
for (const block of blocks) {
  if (!modules.has(block.module)) modules.set(block.module, []);
  modules.get(block.module).push(block);
}

const preambleEnd = source.indexOf('\nexport default {');
if (preambleEnd < 0) throw new Error('Could not locate Studio Worker export default entrypoint');
let config = source.slice(0, preambleEnd).trimEnd() + '\n';
const constantNames = [];
config = config.replace(/^const\s+([A-Za-z_$][\w$]*)\s*=/gm, (_, name) => {
  constantNames.push(name);
  return `export const ${name} =`;
});

const functionModule = new Map(blocks.map(block => [block.name, block.module]));
const allFunctionNames = [...functionModule.keys()];

function hasWord(text, name) {
  return new RegExp(`\\b${name.replace(/[$]/g, '\\$&')}\\b`).test(text);
}

function modulePath(from, to) {
  return `./${to}.js`;
}

function exportedBlock(text) {
  return text.replace(/^(?:export\s+)?(async\s+)?function\s+/, (_, asyncPart = '') => `export ${asyncPart || ''}function `);
}

fs.mkdirSync('studio', { recursive: true });
fs.writeFileSync('studio/config.js', config);

for (const [moduleName, moduleBlocks] of modules) {
  const body = moduleBlocks.map(block => exportedBlock(block.text)).join('');
  const imports = [];

  const neededConstants = constantNames.filter(name => hasWord(body, name));
  if (neededConstants.length) imports.push(`import { ${neededConstants.join(', ')} } from "./config.js";`);

  const depsByModule = new Map();
  for (const fn of allFunctionNames) {
    const owner = functionModule.get(fn);
    if (owner === moduleName || !hasWord(body, fn)) continue;
    if (!depsByModule.has(owner)) depsByModule.set(owner, []);
    depsByModule.get(owner).push(fn);
  }
  for (const [owner, names] of [...depsByModule.entries()].sort(([a],[b]) => a.localeCompare(b))) {
    imports.push(`import { ${[...new Set(names)].sort().join(', ')} } from "${modulePath(moduleName, owner)}";`);
  }

  fs.writeFileSync(`studio/${moduleName}.js`, `${imports.join('\n')}${imports.length ? '\n\n' : ''}${body.trimStart()}`);
}

const entry = `import { OS_PATHS, LEGACY_REDIRECTS, TEXT } from "./config.js";
import { handleAuthHandoff } from "./auth-handoff.js";
import { handleStorageFiles, handleStorageUpload, handleStorageObject } from "./storage-api.js";
import { getRequestCookie, handleRegistrationSignup, handlePasswordLogin } from "./account-api.js";
import { getRouteInfo, buildLinks, html, localizedRedirect } from "./routing.js";
import { osPage } from "./ui-shell.js";
import { signUpPage, loginPage, notFoundPage } from "./auth-pages.js";

export default {
  async fetch(request, env) {
    const { pathname, locale, ipInfo } = getRouteInfo(request);

    if (pathname === "/api/auth/signup") {
      if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
      return handleRegistrationSignup(request, env, ipInfo);
    }

    if (pathname === "/api/auth/login") {
      if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
      return handlePasswordLogin(request, env, ipInfo);
    }

    if (pathname === "/auth/handoff") {
      if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
      return handleAuthHandoff(request, env, locale);
    }

    if (pathname === "/api/storage/files") {
      if (request.method !== "GET") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
      return handleStorageFiles(request, env);
    }

    if (pathname === "/api/storage/upload") {
      if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
      return handleStorageUpload(request, env);
    }

    if (pathname === "/api/storage/object") {
      if (request.method !== "GET" && request.method !== "DELETE") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
      return handleStorageObject(request, env);
    }

    const legacyTarget = LEGACY_REDIRECTS.get(pathname);
    if (legacyTarget) return localizedRedirect(request, locale, legacyTarget);

    const t = TEXT[locale];
    const links = buildLinks(locale, pathname);

    if (OS_PATHS.has(pathname)) {
      const cachedOsUserLabel = getRequestCookie(request, "qssed-os-user-name");
      return html(osPage(t, links, pathname, ipInfo, cachedOsUserLabel));
    }

    if (pathname === "/sign-up") return html(signUpPage(t, links, ipInfo));
    if (pathname === "/login") return html(loginPage(t, links, ipInfo));
    return html(notFoundPage(t, links), 404);
  }
};
`;
fs.writeFileSync('studio/entry.js', entry);
fs.writeFileSync(sourcePath, 'export { default } from "./studio/entry.js";\n');

const manifest = {
  originalBytes: Buffer.byteLength(source),
  originalLines: lines.length,
  modules: [...modules.entries()].map(([name, items]) => ({
    name,
    functions: items.map(item => item.name),
    sourceStartLine: items[0].line,
    sourceEndLine: items[items.length - 1].line
  }))
};
fs.writeFileSync('studio/README.md', `# Studio Worker modules\n\nGenerated from the former monolithic \`worker.js\` without changing public routes. \`worker.js\` is retained as a compatibility facade that exports \`studio/entry.js\`.\n\n## Modules\n\n- \`config.js\` — shared constants, locale text, route sets and limits.\n- \`entry.js\` — request routing and public Studio Worker entrypoint.\n- \`auth-handoff.js\` — Auth → Studio browser session handoff.\n- \`routing.js\` — locale/path normalization and shared HTTP response helpers.\n- \`storage-api.js\` — R2 storage authorization, listing, upload, download and delete.\n- \`account-api.js\` — registration, password login, server audit/logging helpers.\n- \`ui-core.js\` — shared HTML head and client-side admin/audit/theme scripts.\n- \`ui-shell.js\` — Studio OS shell, navigation, content panels and storage/settings UI.\n- \`ui-styles.js\` — Studio OS CSS.\n- \`auth-pages.js\` — Studio sign-up, login and not-found pages.\n\n## Original monolith\n\n- ${manifest.originalLines} lines\n- ${manifest.originalBytes} bytes\n`);
console.log(JSON.stringify(manifest, null, 2));
