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

// Intelligence 主题读取兼容层：从全站外观 Cookie/请求中解析当前主题，保持 gpt 子域与主站一致。\nexport function intelligenceThemeFromRequest(request) {
  return appearanceThemeFromRequest(request);
}

export function intelligenceThemeAttr(theme) {
  return appearanceThemeAttr(theme);
}

// Intelligence 首屏主题脚本：在完整 JS 加载前尽早设置正确主题，减少浅/深色闪烁；真实偏好仍来自共享 appearance 规则。\nexport function intelligenceThemeBootScript() {
  return appearanceBootScript();
}
