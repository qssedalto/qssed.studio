// 初学者导读：公开索引页面运行时回归检查；确认 canonical/robots/公开路由能实际渲染，而不是只检查源码字符串。
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
