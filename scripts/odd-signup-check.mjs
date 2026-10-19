/**
 * Standalone client-only regression suite for the deliberately fictional odd signup.
 * Run: node scripts/odd-signup-check.mjs
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { signUpPage } from "../studio/auth-pages.js";
import { TEXT } from "../studio/config.js";
import { buildLinks, getRouteInfo } from "../studio/routing.js";

const source = await readFile(new URL("../studio/odd-signup.js", import.meta.url), "utf8");
const privacySource = await readFile(new URL("../studio/odd-privacy.js", import.meta.url), "utf8");
const routeSource = await readFile(new URL("../studio/entry.js", import.meta.url), "utf8");
const { oddSignUpPage } = await import("data:text/javascript," + encodeURIComponent(source));
const { oddPrivacyPage, ODD_PRIVACY_CLAUSE_COUNT } = await import("data:text/javascript," + encodeURIComponent(privacySource));
const markup = oddSignUpPage("/zh-cn/sign-up");
const policyMarkup = oddPrivacyPage("/zh-cn/sign-up/odd");

// A persistent navigational button lives outside the real signup wizard steps.
const zhLinks = buildLinks("zh", "/sign-up", "zh-cn");
const zhSignup = signUpPage(TEXT.zh, zhLinks, { country: "CN" });
assert.equal(getRouteInfo(new Request("https://qsseda.com/zh-cn/sign-up/")).pathname, "/sign-up");
assert.match(zhSignup, /class="signup-vip-entry" href="\/zh-cn\/sign-up\/odd"/);
assert.equal((zhSignup.match(/class="signup-vip-entry"/g) || []).length, 1);
assert.match(zhSignup, />VIP注册通道<\/a>/);
assert.ok(zhSignup.indexOf('class="signup-vip-entry"') < zhSignup.indexOf('id="step-username"'), "VIP entry must stay outside stage toggling");
assert.match(zhSignup, /\.signup-vip-entry\{[\s\S]*?position:fixed/);
const enLinks = buildLinks("en", "/sign-up", "en-us");
const enSignup = signUpPage(TEXT.en, enLinks, { country: "US" });
assert.match(enSignup, /class="signup-vip-entry" href="\/en-us\/sign-up\/odd"/);
assert.match(enSignup, />VIP Registration<\/a>/);


assert.match(routeSource, /pathname === "\/sign-up\/odd"/);
assert.match(routeSource, /pathname === "\/sign-up\/odd\/privacy"/);
assert.match(routeSource, /oddPrivacyPage\(links\.signUp\.replace/);
assert.match(markup, /<title>离谱注册中心 · AERTEX ODD<\/title>/);
assert.match(markup, /href="\/zh-cn\/sign-up\/odd\/privacy"/);
assert.match(markup, /target="_blank" rel="noopener noreferrer">隐私政策<\/a>/);
assert.match(markup, /id="email-strength" role="progressbar"/);
assert.match(markup, /id="percent" aria-live="polite">0%/);
assert.match(markup, /class="captcha-noise"/);
assert.match(markup, /id="odd-consent"/);
assert.match(markup, /novalidate/);
assert.doesNotMatch(markup, /趣味模拟|实际上，系统可能|没错，是邮箱|剩余库存：0|一键体验所有报错|当前系统处于|互动玩法|想认真注册/);
assert.doesNotMatch(markup, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB/i);
assert.equal(oddSignUpPage("https://bad.example/sign-up").includes('href="/sign-up"'), true);

assert.equal(ODD_PRIVACY_CLAUSE_COUNT, 1000, "Expected 1000 fictional privacy clauses");
assert.equal((policyMarkup.match(/class="idx"/g) || []).length, 1000);
assert.equal((policyMarkup.match(/<details class="chapter"/g) || []).length, 20);
assert.match(policyMarkup, /纯属虚构|戏仿创作/);
assert.match(policyMarkup, /href="\/zh-cn\/sign-up\/odd"/);
assert.equal(oddPrivacyPage("https://malicious.invalid/").includes('href="/sign-up/odd"'), true);
assert.doesNotMatch(policyMarkup, /<script>|\bfetch\s*\(/i);

const script = markup.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, "Client-side script is missing");

const ids = [
  "odd-form", "odd-email", "odd-username", "odd-gender", "odd-password", "odd-confirm",
  "odd-captcha", "odd-consent", "percent", "email-strength", "email-meter",
  "email-message", "username-message", "gender-message", "password-message", "confirm-message",
  "captcha-message", "reveal", "captcha-code", "captcha-refresh", "result",
  "progress-segment-0", "progress-segment-1", "progress-segment-2", "progress-segment-3"
];
const elements = new Map(ids.map((id) => [id, {
  id, value: "", textContent: "", checked: false,
  type: id === "odd-password" || id === "odd-confirm" ? "password" : "text",
  hidden: true,
  style: { setProperty(name, value) { this[name] = value; } },
  attributes: {},
  setAttribute(name, value) { this.attributes[name] = value; },
  children: [],
  replaceChildren() { this.children = []; },
  appendChild(node) { this.children.push(node); },
  listeners: {},
  selectedIndex: 0,
  options: [{ text: "请选择" }, { text: "男" }, { text: "女" }],
  addEventListener(name, callback) { this.listeners[name] = callback; },
  scrollIntoView() {}
}]));

let networkCalls = 0;
runInNewContext(script, {
  document: {
    createElement(tag) { assert.equal(tag, "i"); return { textContent: "" }; },
    getElementById(id) {
      const element = elements.get(id);
      assert.ok(element, "Script looked up an unexpected element: " + id);
      return element;
    }
  },
  fetch() { networkCalls++; throw new Error("Network is prohibited"); }
}, { timeout: 1000 });

const get = id => elements.get(id);
const fire = (id, type, event = {}) => {
  assert.equal(typeof get(id).listeners[type], "function", id + " has no " + type + " handler");
  get(id).listeners[type](event);
};
const visibleCaptcha = () => get("captcha-code").children.map(node => node.textContent).join("");
assert.equal(get("percent").textContent, "0%");
assert.equal(get("progress-segment-0").style["--fill"], "0%");
assert.equal(get("email-meter").style.width, undefined);
assert.equal(visibleCaptcha(), "7M?Q");

const checkEmail = (value, expected) => {
  get("odd-email").value = value;
  fire("odd-email", "input");
  assert.equal(get("email-meter").style.width, expected + "%", "Email composition score mismatch for: " + value);
  assert.equal(get("email-strength").attributes["aria-valuenow"], String(expected));
};
checkEmail("a", 25);
assert.match(get("email-message").textContent, /还缺少：大写字母、数字、特殊字符/);
checkEmail("a1", 50);
checkEmail("a1@", 75);
checkEmail("Aa1@", 100);
assert.match(get("email-message").textContent, /均已包含/);
checkEmail("", 0);
checkEmail("a1", 50);

get("odd-username").value = "12345678";
fire("odd-username", "input");
assert.match(get("username-message").textContent, /已被占用/);
get("odd-gender").value = "male";
get("odd-gender").selectedIndex = 1;
fire("odd-gender", "change");
assert.match(get("gender-message").textContent, /请重新选择/);
assert.doesNotMatch(get("gender-message").textContent, /库存/);
get("odd-password").value = "test-password-only";
fire("odd-password", "input");
fire("reveal", "click");
assert.equal(get("odd-password").type, "text");
get("odd-confirm").value = get("odd-password").value;
fire("odd-confirm", "input");
assert.match(get("confirm-message").textContent, /完全一致/);
get("odd-captcha").value = "7M?Q";
fire("odd-captcha", "input");
assert.equal(get("percent").textContent, "100%");

// Regression: 1036 distinct codes, even after cycling through the entire collection.
const captchaCodes = new Set([visibleCaptcha()]);
for (let i = 1; i < 1036; i++) {
  fire("captcha-refresh", "click");
  assert.ok(!captchaCodes.has(visibleCaptcha()), "CAPTCHA repeated early at index " + i);
  captchaCodes.add(visibleCaptcha());
}
assert.equal(captchaCodes.size, 1036);
fire("captcha-refresh", "click");
assert.equal(visibleCaptcha(), "7M?Q", "CAPTCHA must wrap only after all 1036 codes");
assert.match(get("captcha-message").textContent, /新验证码已经生成/);

get("odd-consent").checked = true;
let prevented = false;
fire("odd-form", "submit", { preventDefault() { prevented = true; } });
assert.ok(prevented, "Submitting must not navigate");
assert.match(get("result").textContent, /成功完成注册失败/);
assert.equal(get("result").hidden, false);
assert.equal(networkCalls, 0, "Demo must never send anything");

console.log("Odd signup: UI removals, live email strength, 1036 unique CAPTCHAs, linked 1000-clause policy and offline submission OK");
