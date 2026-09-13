import fs from 'node:fs';

function replaceOnce(text, needle, replacement, label) {
  const count = text.split(needle).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, found ${count}`);
  return text.replace(needle, replacement);
}

const accountPath = 'studio/account-api.js';
const storagePath = 'studio/storage-api.js';
const shellPath = 'studio/ui-shell.js';

let account = fs.readFileSync(accountPath, 'utf8');
let storage = fs.readFileSync(storagePath, 'utf8');
let shell = fs.readFileSync(shellPath, 'utf8');

account = replaceOnce(
  account,
  'import { SUPABASE_URL, SUPABASE_KEY, ZH_COUNTRIES } from "./config.js";\nimport { json } from "./routing.js";\n',
  'import { SUPABASE_URL, SUPABASE_KEY, ZH_COUNTRIES } from "./config.js";\nimport { json } from "./routing.js";\nimport { getSupabaseSecret, workerLog } from "./server-runtime.js";\n',
  'account shared runtime import'
);

account = replaceOnce(
  account,
  `export function escapeHtmlText(value) {\n  return String(value || "").replace(/[&<>"']/g, char => ({\n    "&": "&amp;",\n    "<": "&lt;",\n    ">": "&gt;",\n    '\"': "&quot;",\n    "'": "&#39;"\n  })[char]);\n}\n\n`,
  '',
  'remove account HTML utility'
);

account = replaceOnce(
  account,
  `export function getSupabaseSecret(env) {\n  return env?.SUPABASE_SECRET_KEY || env?.SUPABASE_SERVICE_ROLE_KEY || "";\n}\n\n`,
  '',
  'remove account Supabase secret helper'
);

account = replaceOnce(
  account,
  `export function workerLog(level, event, details = {}) {\n  const payload = JSON.stringify({\n    source: "qsseda-worker",\n    event,\n    ...details\n  });\n  const method = level === "error" ? "error" : level === "warn" ? "warn" : "info";\n  console[method](payload);\n}\n\n`,
  '',
  'remove account logging helper'
);

storage = replaceOnce(
  storage,
  'import { getSupabaseSecret, workerLog } from "./account-api.js";',
  'import { getSupabaseSecret, workerLog } from "./server-runtime.js";',
  'storage shared runtime import'
);

shell = replaceOnce(
  shell,
  'import { escapeHtmlText } from "./account-api.js";',
  'import { escapeHtmlText } from "./html-utils.js";',
  'UI shared HTML import'
);

fs.writeFileSync(accountPath, account);
fs.writeFileSync(storagePath, storage);
fs.writeFileSync(shellPath, shell);

console.log('Phase 2 slice applied: account/storage/UI generic dependency edges removed.');
