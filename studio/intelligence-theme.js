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
