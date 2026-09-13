import fs from 'node:fs';

const path = 'studio/ui-profile.js';
let source = fs.readFileSync(path, 'utf8');

const marker = 'const PROFILE_CLIENT_BODY = ';
const start = source.indexOf(marker);
if (start < 0) throw new Error('PROFILE_CLIENT_BODY marker not found');
const functionMarker = '\n\nexport function profileClientScript() {';
const functionStart = source.indexOf(functionMarker, start);
if (functionStart < 0) throw new Error('profileClientScript marker not found');

const literal = source.slice(start + marker.length, functionStart).trim().replace(/;$/, '');
let body;
try {
  body = JSON.parse(literal);
} catch (error) {
  throw new Error('Could not decode PROFILE_CLIENT_BODY: ' + error.message);
}

const functionEndMarker = '\n}\n';
const functionEnd = source.indexOf(functionEndMarker, functionStart + functionMarker.length);
if (functionEnd < 0) throw new Error('profileClientScript end not found');
const afterFunction = functionEnd + functionEndMarker.length;

// Keep the generated runtime string byte-for-byte identical to the encoded form:
// "<script>\n" + body + "\n    </script>".
// Only the source representation changes so the Profile runtime stays readable/editable.
const readable = `export function profileClientScript() {\n  return \`<script>\n${body}\n    </script>\`;\n}\n`;
source = source.slice(0, start) + readable + source.slice(afterFunction);

fs.writeFileSync(path, source);
console.log('Converted Profile client runtime to readable source without changing rendered output.');
