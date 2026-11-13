// Enforce the actual streamed byte count, not only the caller-controlled
// Content-Length. Reject before accumulating an unbounded request body.
export async function readJsonBounded(request, maximumBytes) {
  const tooLarge = () => Object.assign(new Error('Request too large.'), { status: 413 });
  const advertised = request.headers.get('content-length');
  if (advertised !== null && (!/^\d+$/.test(advertised) || Number(advertised) > maximumBytes)) throw tooLarge();
  if (!request.body) return {};
  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const parts = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximumBytes) {
        await reader.cancel().catch(() => {});
        throw tooLarge();
      }
      parts.push(decoder.decode(value, { stream: true }));
    }
    parts.push(decoder.decode());
    const result = JSON.parse(parts.join('') || '{}');
    if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error('JSON object required.');
    return result;
  } finally { reader.releaseLock(); }
}
