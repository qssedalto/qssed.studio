import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { MICHELANGELUS_ITALIC_BASE64, MICHELANGELUS_BOLDITALIC_BASE64 } from '../studio/michelangelus-font-data.js';
import { MICHELANGELUS_ITALIC_PATH, MICHELANGELUS_BOLDITALIC_PATH, michelangelusFontAssetResponse } from '../studio/michelangelus-font.js';
import { enhanceWorkTexSearchFilter } from '../studio/ui-work-tex-search-filter.js';
import fs from 'node:fs';

const fixtures = [
  [MICHELANGELUS_ITALIC_PATH,MICHELANGELUS_ITALIC_BASE64,9856,'e86e25c92a3294ecc6eba97c171a3aaee80b44c7de9a8322ed5514e73fe532a5'],
  [MICHELANGELUS_BOLDITALIC_PATH,MICHELANGELUS_BOLDITALIC_BASE64,9848,'8f0b76cf7cc1abfcb634a674edbba141cc4b2cee8e356406922dd85a991ea38c']
];
for (const [path,base64,size,sha] of fixtures) {
  const decoded = Buffer.from(base64,'base64');
  assert.equal(decoded.byteLength,size);
  assert.equal(decoded.subarray(0,4).toString(),'wOF2');
  assert.equal(createHash('sha256').update(decoded).digest('hex'),sha,
    'A deployed font must be byte-for-byte identical to its validated upload');
  const response=michelangelusFontAssetResponse(path,'GET');
  assert.equal(response.status,200);
  assert.equal(response.headers.get('content-type'),'font/woff2');
  assert.equal(response.headers.get('cache-control'),'public, max-age=31536000, immutable');
  assert.equal(Buffer.compare(Buffer.from(await response.arrayBuffer()),decoded),0);
  const head=michelangelusFontAssetResponse(path,'HEAD');
  assert.equal(head.status,200);
  assert.equal((await head.arrayBuffer()).byteLength,0);
  assert.equal(michelangelusFontAssetResponse(path,'POST').status,405);
}
assert.equal(michelangelusFontAssetResponse('/_aertex/fonts/other.woff2'),null);
const html=enhanceWorkTexSearchFilter('<html><head></head><body></body></html>',true,'admin');
for (const [path] of fixtures) assert(html.includes(path));
assert(html.includes('unicode-range:U+0020-007E'),
  'Provided Latin fonts must leave Chinese glyphs to the normal site face');
const worker=fs.readFileSync(new URL('../worker.js',import.meta.url),'utf8');
assert(worker.includes('michelangelusFontAssetResponse(pathname, request.method)'));
console.log('Both self-hosted Michelangelus WOFF2 files, exact byte SHA256, cache/HEAD/MIME routes and CJK fallback passed.');
