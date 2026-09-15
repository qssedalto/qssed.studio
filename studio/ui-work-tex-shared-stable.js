export function enhanceWorkTexSharedStable(markup) {
  let output = String(markup || "");

  const original = `            rememberSharedDocuments(shared);\n            const documents = [...(Array.isArray(ownData.documents) ? ownData.documents : []), ...shared]\n              .sort((a, b) => String(b?.updated_at || '').localeCompare(String(a?.updated_at || '')));\n            return responseJson({ ...ownData, documents, count: documents.length, scope: shared.length ? 'own-and-shared' : (ownData.scope || 'own') });`;

  const replacement = `            const ownDocuments = Array.isArray(ownData.documents) ? ownData.documents : [];\n            rememberSharedDocuments([...ownDocuments.filter(item => item?.shared === true), ...shared]);\n            const byId = new Map();\n            for (const item of [...ownDocuments, ...shared]) {\n              const id = String(item?.id || '').trim();\n              if (!id || byId.has(id)) continue;\n              byId.set(id, item);\n            }\n            const documents = [...byId.values()]\n              .sort((a, b) => String(b?.updated_at || '').localeCompare(String(a?.updated_at || '')));\n            const hasShared = documents.some(item => item?.shared === true);\n            return responseJson({ ...ownData, documents, count: documents.length, scope: hasShared ? 'own-and-shared' : (ownData.scope || 'own') });`;

  if (output.includes(original)) output = output.replace(original, replacement);
  return output;
}
