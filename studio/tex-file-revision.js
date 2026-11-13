// Identical digest code is used by the server and the two browser editors.
// Binding encoding + exact content prevents stale sequential replacement
// without falsely conflicting when an unrelated file/main source was saved.
export async function texFileContentDigest(file) {
  const input = new TextEncoder().encode(String(file?.encoding || 'utf8') + '\0' + String(file?.content || ''));
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', input));
  return Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('');
}
export const TEX_FILE_DIGEST_RUNTIME = texFileContentDigest.toString();
