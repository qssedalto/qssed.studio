import {
  QUESTION_CATEGORIES,
  QUESTION_INDEX_LOCALES,
  QUESTIONS,
  publishedQuestions,
  questionById,
  questionTranslation
} from "../studio/public-questions.js";
import { publicSitemapUrls } from "../studio/public-indexing.js";
import { questionDetailPage, questionHubPage } from "../studio/public-question-pages.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const published = publishedQuestions();
assert(published.length === 59, "Questions must ship the complete 59-entry first-party knowledge base.");
assert(new Set(QUESTIONS.map(item => item.id)).size === QUESTIONS.length, "Question UUIDs must be unique.");
for (const item of QUESTIONS) {
  assert(UUID.test(item.id), "Question id must be a UUID: " + item.id);
  assert(QUESTION_CATEGORIES.includes(item.category), "Unknown question category: " + item.category);
  assert(item.status === "published" || item.status === "draft" || item.status === "archived", "Invalid question status.");
  for (const locale of ["zh-cn","en-us"]) {
    const t = item.translations?.[locale];
    assert(t?.question && t?.short && Array.isArray(t?.answer) && t.answer.length, item.id + " is missing " + locale + " content.");
  }
}

const correction = questionTranslation(questionById("b67754bb-86a5-4c74-a408-160858c23603"), "zh-cn");
assert(correction?.short.includes("没有") && correction?.short.includes("AERTEX"), "qsseda/Qasida entity correction must remain explicit.");

const cash = questionTranslation(questionById("f113af43-d9c2-4d64-b087-a4a35c729f06"), "zh-cn");
assert(cash?.short.startsWith("是。AERTEX Cash 是 AERTEX 的独立产品"), "Cash must remain documented as an official independent product.");

const workBoundary = questionTranslation(questionById("f0f54a63-a553-40c1-af5b-6278021b3011"), "zh-cn");
assert(workBoundary?.short.includes("不会"), "Intelligence must not be documented as automatically reading Work documents.");

const e2ee = questionTranslation(questionById("4097a1f4-f41d-4669-9bd1-a9be6e64c427"), "zh-cn");
assert(e2ee?.short.startsWith("不是"), "Watch must not be described as end-to-end encrypted.");

const privacyTraining = questionTranslation(questionById("fe346326-40af-471e-812d-2f22e3c51050"), "zh-cn");
assert(privacyTraining?.short.includes("没有公开的正式 AI 数据训练政策"), "AI training policy must remain explicitly unclaimed until published.");

const accountDeletion = questionTranslation(questionById("7eb2c50f-3031-4e9e-90c4-a1e95bcbe037"), "zh-cn");
assert(accountDeletion?.short.includes("没有公开的自助"), "Account deletion must not be described as an implemented self-service flow.");

// Watch FAQ 也是技术边界回归：不能把通用 Bucket 同步说成固定 allowlist，也不能遗漏自动端口发现。
const watchBuckets = questionTranslation(questionById("a9924bd6-b7e4-4416-a2e7-e82074121042"), "zh-cn");
assert(watchBuckets?.short.includes("没有固定的官方 bucket allowlist"), "Watch bucket scope must remain technically accurate.");
const watchSync = questionTranslation(questionById("87333a55-58bc-45e8-91cf-39012c988118"), "zh-cn");
assert(watchSync?.answer.some(line => line.includes("5000–6000") && line.includes("自动")), "Watch FAQ must describe automatic local ActivityWatch port discovery.");

assert(JSON.stringify(QUESTION_INDEX_LOCALES) === JSON.stringify(["zh-cn","en-us"]), "Questions sitemap must only publish locales with distinct first-party translations.");
assert(questionHubPage("en-gb").includes('/en-us/q'), "en-gb Questions must canonicalize to the en-us question route.");
assert(questionHubPage("en-au").includes('/en-us/q'), "en-au Questions must canonicalize to the en-us question route.");

const expectedSitemapCount = 56 + QUESTION_INDEX_LOCALES.length * (1 + published.length);
const sitemap = publicSitemapUrls();
assert(expectedSitemapCount === 176, "The 59-question bilingual sitemap should contain 176 canonical URLs.");
assert(sitemap.length === expectedSitemapCount, "Question sitemap expansion count mismatch.");
for (const locale of QUESTION_INDEX_LOCALES) {
  assert(sitemap.includes("https://qsseda.com/" + locale + "/q"), "Question hub missing from sitemap for " + locale);
  assert(sitemap.includes("https://qsseda.com/" + locale + "/q/" + published[0].id), "Question detail missing from sitemap for " + locale);
}
assert(!sitemap.some(url => url.includes("/en-gb/q")), "Duplicate en-gb Questions must not be listed in sitemap.");
assert(!sitemap.some(url => url.includes("/en-au/q")), "Duplicate en-au Questions must not be listed in sitemap.");

const hub = questionHubPage("zh-cn");
assert(hub.includes("问题与解答") && hub.includes("data-category-filter"), "Question hub must render searchable categories.");
const detail = questionDetailPage("zh-cn", published[0].id);
assert(detail.includes('"@type":"Question"') && detail.includes("当前产品行为"), "Question detail must render semantic question content.");

console.log("Public Questions knowledge base checks passed with", published.length, "published questions and", sitemap.length, "sitemap URLs.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
