/**
 * 【初学者导读】
 * 文件：studio/intelligence-theme.js
 * 共享展示模块：统一站点图标、主题或功能可用性文案，避免各页面重复实现。
 * 阅读顺序：先找 export/主入口，再沿事件、路由或 API 调用向下；看到共享 helper 时先确认它是否被多个产品复用。
 * 数据流：输入通常来自 Request、会话或前端状态；重点跟踪校验、状态转换、存储读写以及最终 Response/DOM 输出。
 * 修改注意：保持公开 API、DOM 标识和共享数据结构稳定；产品规则变化时同步更新自动检查。
 * 调试方法：先锁定调用链，再打印/检查最小必要状态，不要从最终页面表现反推所有中间步骤。
 */
import { appearanceBootScript, appearanceThemeAttr, appearanceThemeFromRequest } from "./appearance.js";

export function intelligenceThemeFromRequest(request) {
  return appearanceThemeFromRequest(request);
}

export function intelligenceThemeAttr(theme) {
  return appearanceThemeAttr(theme);
}

export function intelligenceThemeBootScript() {
  return appearanceBootScript();
}
