import { KNOWLEDGE_ROOT } from "./knowledge-routes.js";

function prefixFor(zh) {
  return zh ? "/zh-cn" : "/en";
}

const COMPACT_MENU_ROOTS = new Set([
  "/dashboard",
  "/info",
  "/profile",
  "/workspace",
  "/admin",
  "/settings"
]);

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
    if (path.startsWith(root + "/")) return `${prefix}${root}`;
  }

  return `${prefix}/dashboard`;
}

export function compactBackScript(path, zh) {
  const fallbackHref = compactBackHref(path, zh);
  const knowledgePath = path.startsWith(KNOWLEDGE_ROOT);
  const menuRoot = COMPACT_MENU_ROOTS.has(path);
  return `
    const compactBackButton = document.getElementById("compact-back-button");
    const compactFallbackHref = ${JSON.stringify(fallbackHref)};
    const compactKnowledgePath = ${JSON.stringify(knowledgePath)};
    const compactMenuRoot = ${JSON.stringify(menuRoot)};

    // Mobile back is an icon control, not a text button. Keep the accessible
    // label for screen readers while rendering only the chevron visually.
    if (compactBackButton) {
      compactBackButton.querySelector("span")?.remove();
      compactBackButton.style.width = "48px";
      compactBackButton.style.minWidth = "48px";
      compactBackButton.style.height = "48px";
      compactBackButton.style.minHeight = "48px";
      compactBackButton.style.padding = "0";
      compactBackButton.style.gap = "0";
      compactBackButton.style.borderRadius = "50%";
    }

    function showCompactMenu() {
      try { sessionStorage.setItem("qssed-compact-view-v2", "menu"); } catch {}
      document.documentElement.classList.remove("compact-content-view");
      document.documentElement.classList.add("compact-menu-view");
      if (typeof applyCompactViewMode === "function") applyCompactViewMode();
    }

    function goBackFromCompactContent() {
      if (!compactBackButton) return;

      // Dashboard and the five main Studio sections are peers in the mobile
      // navigation hierarchy. Their parent is the mobile menu, not Dashboard.
      if (compactMenuRoot) {
        showCompactMenu();
        return;
      }

      let referrer = null;
      try { referrer = document.referrer ? new URL(document.referrer) : null; } catch {}
      const sameOrigin = referrer?.origin === window.location.origin;
      const referrerIsKnowledge = sameOrigin && /\\/(?:zh-cn|en)\\/info\\/knowledge(?:\\/|$)/.test(referrer.pathname);

      // Preserve the actual reading path inside Knowledge when possible.
      if (compactKnowledgePath && referrerIsKnowledge && window.history.length > 1) {
        window.history.back();
        return;
      }

      // Child pages use their deterministic parent route. The parent remains in
      // content mode; pressing back once more from that top-level page opens menu.
      try { sessionStorage.setItem("qssed-compact-view-v2", "content"); } catch {}
      window.location.assign(compactFallbackHref);
    }

    compactBackButton?.addEventListener("click", goBackFromCompactContent);
  `;
}
