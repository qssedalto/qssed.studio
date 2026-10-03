import worker from "../studio/entry.js";

const cases = [
  ["/ja-jp/birthday", "https://qsseda.com/ja-jp/birthday"],
  ["/en-us/wishes", "https://qsseda.com/en-us/wishes"],
  ["/ar-sa/mid-autumn", "https://qsseda.com/ar-sa/mid-autumn"],
  ["/zh-cn/aw/setup", "https://qsseda.com/zh-cn/aw/setup"],
  ["/zh-cn/q", "https://qsseda.com/zh-cn/q"],
  ["/zh-cn/q/4e9a4ad1-22a3-4a63-a755-f7a3ca889101", "https://qsseda.com/zh-cn/q/4e9a4ad1-22a3-4a63-a755-f7a3ca889101"],
  ["/en-us/q/048deced-42b8-414c-bc1a-103f6f76c116", "https://qsseda.com/en-us/q/048deced-42b8-414c-bc1a-103f6f76c116"]
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
