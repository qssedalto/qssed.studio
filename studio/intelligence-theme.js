// 初学者导读：Intelligence 对共享 appearance 系统的薄适配层；避免 GPT 产品自己维护一套主题 Cookie/变量。
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
