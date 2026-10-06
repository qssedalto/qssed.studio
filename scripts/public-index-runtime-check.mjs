/**
 * 【初学者导读】
 * 文件：scripts/public-index-runtime-check.mjs
 * CI 回归检查主题：public index runtime。
 * 作用：把当前产品必须保持的路由、数据、界面或架构规则写成自动断言，让未来改动在合并前就暴露问题。
 * 阅读顺序：先看加载了哪些源文件，再逐条读 assert；每条 assert 都可以理解为一条最小产品规格。
 * 修改原则：先判断失败来自实现错误还是规格变化；只有规格确实调整时，才同时更新实现与检查。
 * 初学者提示：字符串检查适合固定结构，算法应使用小型输入/输出样例验证，二者各有用途。
 */
import worker from "../studio/entry.js";

const QUESTION_ID = "0e5f2ec8-99cf-4bd1-93a0-66ec12360f01";

const cases = [
  ["/zh-cn/q", "https://qsseda.com/zh-cn/q"],
  ["/zh-cn/q/" + QUESTION_ID, "https://qsseda.com/zh-cn/q/" + QUESTION_ID],
  ["/ja-jp/birthday", "https://qsseda.com/ja-jp/birthday"],
  ["/ar-sa/mid-autumn", "https://qsseda.com/ar-sa/mid-autumn"],
  ["/zh-cn/aw/setup", "https://qsseda.com/zh-cn/aw/setup"]
];

for (const [path, canonical] of cases) {
  const request = new Request("https://qsseda.com" + path, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "text/html,application/xhtml+xml",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-Dest": "document",
      "CF-IPCountry": "US"
    }
  });
  let response;
  try {
    response = await worker.fetch(request, {});
  } catch (error) {
    console.error("Public route threw:", path);
    throw error;
  }
  if (response.status !== 200) throw new Error(path + " returned " + response.status);
  const robots = response.headers.get("x-robots-tag") || "";
  if (!robots.startsWith("index, follow")) throw new Error(path + " is not indexable: " + robots);
  const html = await response.text();
  if (!html.includes('<link rel="canonical" href="' + canonical + '">')) {
    throw new Error(path + " canonical mismatch");
  }
}

console.log("Public indexable route runtime checks passed.");
