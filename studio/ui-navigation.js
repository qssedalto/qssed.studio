/**
 * 【初学者导读】
 * 文件：studio/ui-navigation.js
 * 这是 AERTEX 前端 UI 模块（navigation）：通常同时包含页面模板、局部状态、DOM 更新、事件绑定以及对后端 API 的调用。
 * 阅读顺序：①先搜索页面上能看到的标题/按钮文字定位 render；②找 render 依赖的 state；③找 state 在哪里被 API/事件更新；④再去后端搜索相同 API 路径。
 * 初学者提醒：HTML 字符串负责结构，CSS class 负责样式，事件监听负责交互，fetch/API 负责数据；这四层出现问题时要分别排查。
 * 修改注意：不要随意改掉已有 id/data-* 属性，它们可能被事件绑定、自动测试或别的模块引用；动态插入用户文本时要继续做转义。
 * 响应式注意：桌面布局正常并不代表窄屏正常，修改结构后至少检查大屏、平板和手机断点。
 */
import { KNOWLEDGE_ROOT } from "./knowledge-routes.js";

function prefixFor(zh) {
  return zh ? "/zh-cn" : "/en";
}

const COMPACT_MENU_ROOTS = new Set([
  "/",
  "/dashboard",
  "/info",
  "/profile",
  "/wishes",
  "/workspace",
  "/admin",
  "/settings"
]);

export function isCompactMenuRoot(path) {
  return COMPACT_MENU_ROOTS.has(path);
}

export function compactBackHref(path, zh) {
  const prefix = prefixFor(zh);
  if (path === "/") return prefix;

  if (path === KNOWLEDGE_ROOT) return `${prefix}/info`;
  if (path.startsWith(KNOWLEDGE_ROOT + "/")) {
    const parts = path.slice(KNOWLEDGE_ROOT.length + 1).split("/").filter(Boolean);
    if (parts.length >= 2) return `${prefix}${KNOWLEDGE_ROOT}/${parts[0]}`;
    return `${prefix}${KNOWLEDGE_ROOT}`;
  }

  const sectionRoots = ["/info", "/profile", "/wishes", "/workspace", "/admin", "/settings"];
  for (const root of sectionRoots) {
    if (path.startsWith(root + "/")) return `${prefix}${root}`;
  }

  return `${prefix}`;
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
