import { KNOWLEDGE_ROOT } from "./knowledge-routes.js";

function prefixFor(zh) {
  return zh ? "/zh-cn" : "/en";
}

export function compactBackHref(path, zh) {
  const prefix = prefixFor(zh);

  if (path === KNOWLEDGE_ROOT) return `${prefix}/info`;
  if (path.startsWith(KNOWLEDGE_ROOT + "/")) {
    const parts = path.slice(KNOWLEDGE_ROOT.length + 1).split("/").filter(Boolean);
    if (parts.length >= 2) return `${prefix}${KNOWLEDGE_ROOT}/${parts[0]}`;
    return `${prefix}${KNOWLEDGE_ROOT}`;
  }

  const sectionRoots = ["/info", "/profile", "/workspace", "/admin", "/settings"];
  for (const root of sectionRoots) {
    if (path === root) return `${prefix}/dashboard`;
    if (path.startsWith(root + "/")) return `${prefix}${root}`;
  }

  return `${prefix}/dashboard`;
}

export function compactBackScript(path, zh) {
  const fallbackHref = compactBackHref(path, zh);
  const knowledgePath = path.startsWith(KNOWLEDGE_ROOT);
  return `
    const compactBackButton = document.getElementById("compact-back-button");
    const compactFallbackHref = ${JSON.stringify(fallbackHref)};
    const compactKnowledgePath = ${JSON.stringify(knowledgePath)};

    function goBackFromCompactContent() {
      if (!compactBackButton) return;

      let referrer = null;
      try { referrer = document.referrer ? new URL(document.referrer) : null; } catch {}
      const sameOrigin = referrer?.origin === window.location.origin;
      const referrerIsKnowledge = sameOrigin && /\\/(?:zh-cn|en)\\/info\\/knowledge(?:\\/|$)/.test(referrer.pathname);

      // Inside the Knowledge Base, preserve the real reading path when the previous
      // document was also a Knowledge Base page (category, search page, article, etc.).
      // A direct deep link has no safe in-product history, so it uses the deterministic
      // parent route instead of leaving QssedA Studio.
      if (compactKnowledgePath && referrerIsKnowledge && window.history.length > 1) {
        window.history.back();
        return;
      }

      try { sessionStorage.setItem("qssed-compact-view-v1", "content"); } catch {}
      window.location.assign(compactFallbackHref);
    }

    compactBackButton?.addEventListener("click", goBackFromCompactContent);
  `;
}
