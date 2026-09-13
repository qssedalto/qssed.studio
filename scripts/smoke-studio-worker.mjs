import { pathToFileURL } from 'node:url';
import path from 'node:path';

const baselinePath = process.argv[2];
if (!baselinePath) throw new Error('Usage: node scripts/smoke-studio-worker.mjs <baseline-worker-file>');

const baseline = (await import(pathToFileURL(path.resolve(baselinePath)).href + `?v=${Date.now()}`)).default;
const modular = (await import(pathToFileURL(path.resolve('worker.js')).href + `?v=${Date.now()}`)).default;

const cases = [
  { name:'root redirect', url:'https://qsseda.studio/', method:'GET', env:{} },
  { name:'zh dashboard', url:'https://qsseda.studio/zh-cn/dashboard', method:'GET', env:{} },
  { name:'en profile', url:'https://qsseda.studio/en/profile', method:'GET', env:{} },
  { name:'zh signup', url:'https://qsseda.studio/zh-cn/sign-up', method:'GET', env:{} },
  { name:'en login', url:'https://qsseda.studio/en/login', method:'GET', env:{} },
  { name:'legacy redirect', url:'https://qsseda.studio/en/general', method:'GET', env:{} },
  { name:'404', url:'https://qsseda.studio/en/does-not-exist', method:'GET', env:{} },
  { name:'storage unavailable', url:'https://qsseda.studio/api/storage/files', method:'GET', env:{} },
  { name:'storage method guard', url:'https://qsseda.studio/api/storage/upload', method:'GET', env:{} },
  { name:'login validation', url:'https://qsseda.studio/api/auth/login', method:'POST', headers:{'content-type':'application/json'}, body:'{}', env:{} },
  { name:'signup validation', url:'https://qsseda.studio/api/auth/signup', method:'POST', headers:{'content-type':'application/json'}, body:'{}', env:{} },
  { name:'handoff origin guard', url:'https://qsseda.studio/auth/handoff', method:'POST', headers:{'content-type':'application/x-www-form-urlencoded','origin':'https://example.com'}, body:'next=%2Fdashboard', env:{} }
];

async function snapshot(worker, test) {
  const init = { method:test.method, headers:test.headers || {} };
  if (test.body !== undefined) init.body = test.body;
  const response = await worker.fetch(new Request(test.url, init), test.env || {});
  const headers = {};
  for (const key of ['content-type','cache-control','location','referrer-policy','x-content-type-options']) {
    const value = response.headers.get(key);
    if (value !== null) headers[key] = value;
  }
  return { status:response.status, headers, body:await response.text() };
}

let failures=0;
for (const test of cases) {
  try {
    const before = await snapshot(baseline, test);
    const after = await snapshot(modular, test);
    const same = JSON.stringify(before) === JSON.stringify(after);
    console.log(`${same ? 'PASS' : 'FAIL'} ${test.name} :: ${before.status} -> ${after.status} :: ${before.body.length} bytes`);
    if (!same) {
      failures++;
      console.log('BEFORE', JSON.stringify({status:before.status,headers:before.headers,bodyPrefix:before.body.slice(0,300)},null,2));
      console.log('AFTER ', JSON.stringify({status:after.status,headers:after.headers,bodyPrefix:after.body.slice(0,300)},null,2));
    }
  } catch (error) {
    failures++;
    console.error(`ERROR ${test.name}`, error);
  }
}

if (failures) throw new Error(`${failures} differential smoke test(s) failed`);
console.log(`All ${cases.length} differential smoke tests passed.`);
