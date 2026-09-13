import fs from 'node:fs';

const file = 'auth-oauth.js';
let text = fs.readFileSync(file, 'utf8');

function repairRange(source, startMarker, endMarker = null) {
  const start = source.indexOf(startMarker);
  if (start < 0) throw new Error(`Missing marker: ${startMarker}`);
  const end = endMarker ? source.indexOf(endMarker, start) : source.length;
  if (endMarker && end < 0) throw new Error(`Missing marker: ${endMarker}`);
  const before = source.slice(0, start);
  let section = source.slice(start, end);
  const after = source.slice(end);
  section = section.replaceAll('\\`', '`').replaceAll('\\${', '${');
  return before + section + after;
}

text = repairRange(text, 'function authorizePage(data) {', 'function scopeLabel(scope) {');
text = repairRange(text, 'function pageCss() {');

// A previous one-off generator accidentally left an extra top-level brace after pageCss.
if (text.endsWith('\n\n}\n')) text = text.slice(0, -3);
else if (text.endsWith('\n\n}')) text = text.slice(0, -2);

fs.writeFileSync(file, text);
console.log('Repaired OAuth template literals for Worker bundling.');
// Trigger after workflow creation.
