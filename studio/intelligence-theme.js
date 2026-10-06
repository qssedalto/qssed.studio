// AERTEX Intelligence 对共享 appearance.js 的薄适配层。
//
// GPT 页面仍使用全站同一套浅/深色与主题色偏好，只在这里提供 Intelligence 命名的包装函数，
// 避免 gpt-worker / gpt-ui 直接依赖 appearance 内部实现；不要在本文件再创造第二套主题状态。
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
