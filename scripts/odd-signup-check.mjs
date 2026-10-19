/**
 * Standalone regression check for the fictional, local-only sign-up parody.
 * Run: node scripts/odd-signup-check.mjs
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

const pageSource = await readFile(new URL("../studio/odd-signup.js", import.meta.url), "utf8");
const routeSource = await readFile(new URL("../studio/entry.js", import.meta.url), "utf8");
const { oddSignUpPage } = await import("data:text/javascript," + encodeURIComponent(pageSource));
const markup = oddSignUpPage("/zh-cn/sign-up");

assert.match(routeSource, /pathname === "\/sign-up\/odd"/, "Parody route is missing");
assert.match(routeSource, /oddSignUpPage\(links\.signUp\)/, "Normal sign-up fallback is missing");
assert.match(markup, /<title>离谱注册中心 · AERTEX ODD<\/title>/);
assert.match(markup, /href="\/zh-cn\/sign-up"/);
assert.match(markup, /role="status"/);
assert.match(markup, /novalidate/);
assert.match(markup, /demo@example\.invalid/);
assert.match(markup, /placeholder="请输入密码"/);
assert.match(markup, /id="percent" aria-live="polite">0%/);
assert.match(markup, /趣味模拟/);
assert.match(markup, /class="captcha-noise"/);
assert.doesNotMatch(markup, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB/i, "Demo must stay client-only");
assert.equal(oddSignUpPage("https://bad.example/sign-up").includes('href="/sign-up"'), true, "Untrusted outbound URL should not render");

const script = markup.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, "Client-side script is missing");
const ids = [
  "odd-form", "odd-email", "odd-username", "odd-gender", "odd-password", "odd-confirm",
  "odd-captcha", "odd-consent", "percent", "email-meter", "email-message",
  "username-message", "gender-message", "password-message", "confirm-message",
  "captcha-message", "reveal", "captcha-code", "captcha-refresh", "demo", "result",
  "progress-segment-0", "progress-segment-1", "progress-segment-2", "progress-segment-3"
];
const elements = new Map(ids.map((id) => [id, {
  id,
  value: "",
  textContent: "",
  checked: false,
  type: id === "odd-password" || id === "odd-confirm" ? "password" : "text",
  hidden: true,
  style: { setProperty(name, value) { this[name] = value; } },
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
      const el = elements.get(id);
      assert.ok(el, "Script looked up an unexpected element: " + id);
      return el;
    }
  },
  fetch() { networkCalls++; throw new Error("No network permitted"); }
}, { timeout: 1000 });
const get = (id) => elements.get(id);
assert.equal(get("percent").textContent, "0%");
assert.equal(get("progress-segment-0").style["--fill"], "0%");
assert.equal(get("captcha-code").children.length, 4);
const fire = (id, name, event = {}) => {
  assert.equal(typeof get(id).listeners[name], "function", id + " does not handle " + name);
  get(id).listeners[name](event);
};

get("odd-username").value = "12345678";
fire("odd-username", "input");
assert.match(get("username-message").textContent, /已被占用/);
get("odd-gender").value = "male";
get("odd-gender").selectedIndex = 1;
fire("odd-gender", "change");
assert.match(get("gender-message").textContent, /剩余库存：0/);
get("odd-password").value = "not-a-real-password";
fire("odd-password", "input");
fire("reveal", "click");
assert.equal(get("odd-password").type, "text");
get("odd-confirm").value = "not-a-real-password";
fire("odd-confirm", "input");
assert.match(get("confirm-message").textContent, /完全一致/);
fire("captcha-refresh", "click");
assert.match(get("captcha-message").textContent, /新验证码已经生成/);
assert.equal(get("captcha-code").children.map(x => x.textContent).join(""), "404!");

fire("demo", "click");
assert.equal(get("odd-email").value, "demo@example.invalid");
assert.match(get("email-message").textContent, /邮箱强度/);
assert.equal(get("percent").textContent, "100%");
assert.equal(get("progress-segment-3").style["--fill"], "100%");
let prevented = false;
fire("odd-form", "submit", { preventDefault() { prevented = true; } });
assert.ok(prevented, "Submitting must not navigate");
assert.match(get("result").textContent, /成功完成注册失败/);
assert.equal(get("result").hidden, false);
assert.equal(networkCalls, 0, "Demo must never send data");

console.log("Odd sign-up: route, markup, safe fallback, no network, and absurd interactions OK");
