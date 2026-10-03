import {
  QUESTION_CATEGORIES,
  publicQuestion,
  publicQuestions,
  questionSitemapUrls
} from "../studio/public-questions-content.js";
import {
  questionDetailPage,
  questionIndexPage
} from "../studio/public-questions-page.js";

const questions = publicQuestions();
const ids = new Set(questions.map(item => item.id));

assert(questions.length === 28, "Public Q catalog must contain the first 28 official questions.");
assert(ids.size === questions.length, "Every public Q entry must have a unique UUID.");
assert(Object.keys(QUESTION_CATEGORIES).length >= 8, "Public Q catalog must retain its category structure.");
assert(questionSitemapUrls().length === 58, "Q sitemap must contain two indexes plus two locales for every question.");

for (const item of questions) {
  assert(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.id), "Invalid Q UUID: " + item.id);
  for (const lang of ["zh","en"]) {
    const copy = item[lang];
    assert(copy && copy.q && copy.short && Array.isArray(copy.body) && copy.body.length, item.id + " is missing " + lang + " content.");
  }
}

const disambiguation = publicQuestion("aef7f9a4-6830-4caa-81a8-89f247902103");
assert(disambiguation.zh.short.includes("没有"), "Qasida disambiguation must clearly reject the false association.");
assert(disambiguation.en.short.startsWith("No."), "English Qasida disambiguation must clearly reject the false association.");

const cash = publicQuestion("fc76c5bb-97f6-485c-a090-37021fc5b105");
assert(cash.zh.short.startsWith("是"), "Cash must be identified as an official AERTEX product.");

const accountBoundary = publicQuestion("b94ad98f-0af2-49dd-87dc-b86ae38fb107");
assert(accountBoundary.zh.short.startsWith("不意味着"), "Shared account must not imply cross-product data access.");

const watchEncryption = publicQuestion("35fd260b-3c28-4445-b7c4-ddb60e202121");
assert(watchEncryption.zh.short.includes("不是") || watchEncryption.zh.short.includes("不应称为"), "Watch encryption answer must not claim end-to-end encryption.");

const index = questionIndexPage("zh-cn");
assert(index.includes("问题与解答") && index.includes("/zh-cn/q/"), "Chinese Q index must render public question links.");

const detail = questionDetailPage("zh-cn", disambiguation.id);
assert(detail.includes('<link rel="canonical" href="https://qsseda.com/zh-cn/q/' + disambiguation.id + '">'), "Q detail must expose a stable canonical URL.");
assert(detail.includes('"@type":"Question"') && detail.includes('"@type":"Answer"'), "Q detail must expose Question/Answer structured data.");
assert(detail.includes("Qasida") && detail.includes("没有关联"), "Q detail must render the official disambiguation answer.");

console.log("Public AERTEX Q catalog checks passed.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
