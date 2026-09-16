export function enhanceWorkTexSharedStable(markup) {
  let output = String(markup || "");

  const original = `            rememberSharedDocuments(shared);\n            const documents = [...(Array.isArray(ownData.documents) ? ownData.documents : []), ...shared]\n              .sort((a, b) => String(b?.updated_at || '').localeCompare(String(a?.updated_at || '')));\n            return responseJson({ ...ownData, documents, count: documents.length, scope: shared.length ? 'own-and-shared' : (ownData.scope || 'own') });`;

  const replacement = `            const ownDocuments = Array.isArray(ownData.documents) ? ownData.documents : [];\n            rememberSharedDocuments([...ownDocuments.filter(item => item?.shared === true), ...shared]);\n            const byId = new Map();\n            for (const item of [...ownDocuments, ...shared]) {\n              const id = String(item?.id || '').trim();\n              if (!id || byId.has(id)) continue;\n              byId.set(id, item);\n            }\n            const documents = [...byId.values()]\n              .sort((a, b) => String(b?.updated_at || '').localeCompare(String(a?.updated_at || '')));\n            const hasShared = documents.some(item => item?.shared === true);\n            return responseJson({ ...ownData, documents, count: documents.length, scope: hasShared ? 'own-and-shared' : (ownData.scope || 'own') });`;

  if (output.includes(original)) output = output.replace(original, replacement);

  output += `
    <style id="qsseda-work-tex-document-card-alignment">
      .tex-work-app .tex-document-item{
        grid-template-columns:minmax(0,1fr)!important;
        justify-items:stretch!important;
        align-items:start!important;
        text-align:left!important;
      }
      .tex-work-app .tex-document-item>strong,
      .tex-work-app .tex-document-item>p,
      .tex-work-app .tex-document-item>.tex-document-meta{
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
        justify-self:stretch!important;
        text-align:left!important;
        margin-left:0!important;
        margin-right:0!important;
      }
      .tex-work-app .tex-document-item>.tex-document-meta{
        display:flex!important;
        align-items:center!important;
        justify-content:space-between!important;
      }

      @media (max-width:760px), (max-width:950px) and (pointer:coarse){
        .tex-work-app .tex-editor-toolbar{
          display:grid!important;
          grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
          grid-template-rows:auto auto!important;
          align-items:end!important;
          gap:8px!important;
        }
        .tex-work-app .tex-editor-toolbar>input{
          grid-column:1/-1!important;
          grid-row:1!important;
          width:100%!important;
          min-width:0!important;
          height:42px!important;
          min-height:42px!important;
        }
        .tex-work-app .tex-editor-toolbar>label{
          grid-column:1!important;
          grid-row:2!important;
          width:100%!important;
          min-width:0!important;
          margin:0!important;
        }
        .tex-work-app .tex-editor-toolbar>label select{
          width:100%!important;
          min-width:0!important;
          height:42px!important;
          min-height:42px!important;
        }
        .tex-work-app .tex-editor-toolbar>.tex-collaboration-button{
          grid-column:2!important;
          grid-row:2!important;
          align-self:end!important;
          width:100%!important;
          min-width:0!important;
          height:42px!important;
          min-height:42px!important;
          margin:0!important;
          padding:0 10px!important;
        }
      }
    </style>`;

  return output;
}
