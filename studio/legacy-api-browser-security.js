export function hardenLegacyApiBrowserMarkup(markup) {
  let output = String(markup || "");
  output = hardenStorageClient(output);
  output = hardenNotesClient(output);
  output = hardenSummariesClient(output);
  output = hardenUserLinksClients(output);
  return output;
}

function hardenStorageClient(markup) {
  const start = "        async function accessToken() {";
  const end = "        function visibleFiles() {";
  let output = markup;
  if (output.includes(start) && output.includes(end)) {
    const replacement = `        async function storageRequest(path, options) {
          const headers = new Headers(options?.headers || {});
          let response;
          try {
            response = await fetch(path, { ...options, headers, credentials: "same-origin", cache: "no-store" });
          } catch {
            throw new Error(copy.unavailable);
          }
          if (response.status === 401) throw new SessionExpiredError();
          if (response.status === 403) throw new StorageForbiddenError();
          if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            const error = new Error(payload?.error || copy.unavailable);
            error.status = response.status;
            throw error;
          }
          return response;
        }

`;
    output = replaceRange(output, start, end, replacement, false);
  }
  output = output.replaceAll("if (!session?.access_token || !session?.user?.id)", "if (!session?.user?.id)");
  return output;
}

function hardenNotesClient(markup) {
  const start = "          async function token() {";
  const end = "          function setState(text, error) {";
  if (!markup.includes(start) || !markup.includes(end)) return markup;
  const replacement = `          async function api(path, options) {
            const headers = new Headers(options?.headers || {});
            if (options?.body) headers.set('Content-Type', 'application/json;charset=UTF-8');
            const response = await fetch(path, { ...options, headers, credentials: 'same-origin', cache: 'no-store' });
            if (!response.ok) {
              const payload = await response.json().catch(() => ({}));
              throw new Error(payload?.error || copy.unavailable);
            }
            return response.json();
          }

`;
  return replaceRange(markup, start, end, replacement, false);
}

function hardenSummariesClient(markup) {
  const start = "          async function token(){";
  const end = "          async function save(label){";
  if (!markup.includes(start) || !markup.includes(end)) return markup;
  const replacement = `          async function api(path,options){const headers=new Headers(options?.headers||{});if(options?.body)headers.set('Content-Type','application/json;charset=UTF-8');const response=await fetch(path,{...options,headers,credentials:'same-origin',cache:'no-store'});if(!response.ok){const payload=await response.json().catch(()=>({}));throw new Error(payload?.error||'Service unavailable');}return response.json();}
`;
  return replaceRange(markup, start, end, replacement, false);
}

function hardenUserLinksClients(markup) {
  return markup
    .replaceAll(
      "function authorization(){return session?.access_token?{'Authorization':'Bearer '+session.access_token}:{};}",
      "function authorization(){return {}; }"
    )
    .replace(
      /function authHeaders\(\)\s*\{\s*return session\?\.access_token\s*\?\s*\{\s*Authorization:\s*'Bearer '\s*\+\s*session\.access_token\s*\}\s*:\s*\{\};\s*\}/g,
      "function authHeaders() { return {}; }"
    );
}

function replaceRange(source, startMarker, endMarker, replacement, consumeEnd) {
  const start = source.indexOf(startMarker);
  if (start < 0) return source;
  const endStart = source.indexOf(endMarker, start + startMarker.length);
  if (endStart < 0) return source;
  const end = consumeEnd ? endStart + endMarker.length : endStart;
  return source.slice(0, start) + replacement + source.slice(end);
}
