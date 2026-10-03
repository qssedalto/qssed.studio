import { FAVICON_LINKS } from "./favicon.js";
import { localeDirection } from "./locale.js";
import {
  QUESTION_CATEGORIES,
  publicQuestion,
  publicQuestions,
  questionLanguage,
  questionLocale
} from "./public-questions-content.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isQuestionPath(pathname) {
  const value = String(pathname || "").replace(/\/+$/, "") || "/";
  if (value === "/q") return true;
  const match = value.match(/^\/q\/([^/]+)$/i);
  return Boolean(match && UUID.test(match[1]));
}

export function questionIdFromPath(pathname) {
  const match = String(pathname || "").replace(/\/+$/, "").match(/^\/q\/([^/]+)$/i);
  return match && UUID.test(match[1]) ? match[1].toLowerCase() : "";
}

export function questionIndexPage(locale = "en-us", indexable = true) {
  const code = questionLocale(locale);
  const lang = questionLanguage(code);
  const zh = lang === "zh";
  const title = zh ? "问题与解答 · AERTEX" : "Questions & Answers · AERTEX";
  const description = zh
    ? "AERTEX 官方问题与解答：产品、账户、订阅、Work、Cash、Watch、Intelligence、兼容性与数据边界。"
    : "Official AERTEX questions and answers covering products, accounts, subscriptions, Work, Cash, Watch, Intelligence, compatibility, and data boundaries.";
  const grouped = new Map();
  for (const item of publicQuestions()) {
    if (!grouped.has(item.category)) grouped.set(item.category, []);
    grouped.get(item.category).push(item);
  }
  const sections = [...grouped.entries()].map(([category, items]) => {
    const label = QUESTION_CATEGORIES[category]?.[lang] || category;
    const cards = items.map(item => {
      const copy = item[lang];
      const href = "/" + code + "/q/" + item.id;
      return '<a class="qcard" href="' + href + '"><strong>' + escapeHtml(copy.q) + '</strong><span>' + escapeHtml(copy.short) + '</span></a>';
    }).join("");
    return '<section class="category" id="' + escapeHtml(category) + '"><h2>' + escapeHtml(label) + '</h2><div class="questions">' + cards + '</div></section>';
  }).join("");

  return shell({
    code,
    title,
    description,
    canonicalPath:"/" + code + "/q",
    zh,
    indexable,
    extraHead:
      '<link rel="alternate" hreflang="zh-CN" href="https://qsseda.com/zh-cn/q">' +
      '<link rel="alternate" hreflang="en" href="https://qsseda.com/en-us/q">' +
      '<link rel="alternate" hreflang="x-default" href="https://qsseda.com/en-us/q">',
    body:'<main class="shell"><header class="hero"><p class="eyebrow">AERTEX · Q</p><h1>' + (zh ? "问题与解答" : "Questions & Answers") + '</h1><p class="lead">' + escapeHtml(description) + '</p></header>' + sections + '</main>',
    structuredData:{
      "@context":"https://schema.org",
      "@type":"CollectionPage",
      name:title,
      description,
      url:"https://qsseda.com/" + code + "/q",
      isPartOf:{"@type":"WebSite",name:"AERTEX",url:"https://qsseda.com/"}
    }
  });
}

export function questionDetailPage(locale = "en-us", id = "", indexable = true) {
  const item = publicQuestion(id);
  if (!item) return "";
  const code = questionLocale(locale);
  const lang = questionLanguage(code);
  const zh = lang === "zh";
  const copy = item[lang];
  const category = QUESTION_CATEGORIES[item.category]?.[lang] || item.category;
  const canonicalPath = "/" + code + "/q/" + item.id;
  const altLocale = code === "zh-cn" ? "en-us" : "zh-cn";
  const altLang = questionLanguage(altLocale);
  const altLabel = code === "zh-cn" ? "English" : "简体中文";
  const paragraphs = copy.body.map(text => "<p>" + escapeHtml(text) + "</p>").join("");
  const related = publicQuestions()
    .filter(candidate => candidate.category === item.category && candidate.id !== item.id)
    .slice(0, 4)
    .map(candidate => '<a href="/' + code + '/q/' + candidate.id + '">' + escapeHtml(candidate[lang].q) + "</a>")
    .join("");

  const body = '<main class="shell detail">' +
    '<nav class="crumbs" aria-label="' + (zh ? "面包屑" : "Breadcrumb") + '">' +
      '<a href="/' + code + '">' + (zh ? "AERTEX 首页" : "AERTEX Home") + '</a><span>›</span>' +
      '<a href="/' + code + '/q">Q</a><span>›</span><span>' + escapeHtml(category) + '</span>' +
    '</nav>' +
    '<article>' +
      '<p class="eyebrow">' + escapeHtml(category) + '</p>' +
      '<h1>' + escapeHtml(copy.q) + '</h1>' +
      '<p class="answer">' + escapeHtml(copy.short) + '</p>' +
      '<div class="bodycopy">' + paragraphs + '</div>' +
      '<div class="meta"><span>AERTEX Official Answer</span><span>Q · ' + escapeHtml(item.id.slice(0,8)) + '</span></div>' +
    '</article>' +
    (related ? '<aside class="related"><h2>' + (zh ? "相关问题" : "Related questions") + '</h2>' + related + '</aside>' : '') +
  '</main>';

  return shell({
    code,
    title:copy.q + " · AERTEX",
    description:copy.short,
    canonicalPath,
    zh,
    indexable,
    extraHead:
      '<link rel="alternate" hreflang="zh-CN" href="https://qsseda.com/zh-cn/q/' + item.id + '">' +
      '<link rel="alternate" hreflang="en" href="https://qsseda.com/en-us/q/' + item.id + '">' +
      '<link rel="alternate" hreflang="x-default" href="https://qsseda.com/en-us/q/' + item.id + '">',
    topAction:'<a class="lang" href="/' + altLocale + '/q/' + item.id + '">' + escapeHtml(altLabel) + '</a>',
    body,
    structuredData:{
      "@context":"https://schema.org",
      "@graph":[
        {
          "@type":"WebPage",
          name:copy.q,
          description:copy.short,
          url:"https://qsseda.com" + canonicalPath,
          isPartOf:{"@type":"WebSite",name:"AERTEX",url:"https://qsseda.com/"},
          mainEntity:{"@id":"https://qsseda.com" + canonicalPath + "#question"}
        },
        {
          "@type":"Question",
          "@id":"https://qsseda.com" + canonicalPath + "#question",
          name:copy.q,
          acceptedAnswer:{"@type":"Answer",text:[copy.short,...copy.body].join("\n\n")}
        },
        {
          "@type":"BreadcrumbList",
          itemListElement:[
            {"@type":"ListItem",position:1,name:"AERTEX",item:"https://qsseda.com/" + code},
            {"@type":"ListItem",position:2,name:"Q",item:"https://qsseda.com/" + code + "/q"},
            {"@type":"ListItem",position:3,name:copy.q,item:"https://qsseda.com" + canonicalPath}
          ]
        }
      ]
    }
  });
}

function shell({code,title,description,canonicalPath,zh,body,structuredData,extraHead="",topAction="",indexable=true}) {
  const other = code === "zh-cn" ? "en-us" : "zh-cn";
  const indexLanguage = code === "zh-cn" ? "English" : "简体中文";
  const action = topAction || '<a class="lang" href="/' + other + '/q">' + escapeHtml(indexLanguage) + '</a>';
  return `<!doctype html>
<html lang="${code}" dir="${localeDirection(code)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="${indexable ? "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" : "noindex,nofollow,noarchive,nosnippet"}">
<link rel="canonical" href="https://qsseda.com${canonicalPath}">
${extraHead}
${FAVICON_LINKS}
<script type="application/ld+json">${safeJson(structuredData)}</script>
<style>
:root{color-scheme:light dark;--bg:#f5f5f7;--panel:rgba(255,255,255,.8);--solid:#fff;--text:#111114;--muted:#6e6e73;--line:rgba(0,0,0,.09);--accent:#007aff;--shadow:0 20px 70px rgba(0,0,0,.07)}
@media(prefers-color-scheme:dark){:root{--bg:#09090b;--panel:rgba(27,27,30,.84);--solid:#1c1c1e;--text:#f5f5f7;--muted:#9b9ba1;--line:rgba(255,255,255,.11);--accent:#0a84ff;--shadow:0 24px 80px rgba(0,0,0,.34)}}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Segoe UI","PingFang SC",sans-serif}
body{background-image:radial-gradient(circle at 10% -5%,rgba(10,132,255,.11),transparent 31rem)}
a{color:inherit}.topbar{height:62px;max-width:1080px;margin:0 auto;padding:0 22px;display:flex;align-items:center;gap:14px}.brand{font-weight:820;letter-spacing:-.025em;text-decoration:none}.qmark{font-weight:760;color:var(--muted)}.spacer{flex:1}.lang{font-size:13px;color:var(--muted);text-decoration:none}.shell{max-width:960px;margin:0 auto;padding:54px 22px 96px}.hero{padding:14px 0 38px}.eyebrow{margin:0 0 12px;color:var(--accent);font-size:12px;font-weight:780;letter-spacing:.11em;text-transform:uppercase}.hero h1,.detail h1{margin:0;letter-spacing:-.055em;line-height:1}.hero h1{font-size:clamp(48px,8vw,76px)}.detail h1{max-width:880px;font-size:clamp(38px,6.6vw,64px)}.lead{max-width:760px;margin:19px 0 0;color:var(--muted);font-size:18px;line-height:1.65}
.category{padding:32px 0;border-top:1px solid var(--line)}.category h2{margin:0 0 16px;font-size:15px;color:var(--muted);font-weight:700}.questions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.qcard{display:block;padding:20px;border:1px solid var(--line);border-radius:20px;background:var(--panel);box-shadow:var(--shadow);text-decoration:none}.qcard strong{display:block;font-size:18px;line-height:1.35;letter-spacing:-.02em}.qcard span{display:block;margin-top:10px;color:var(--muted);font-size:14px;line-height:1.55}
.crumbs{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-bottom:42px;color:var(--muted);font-size:13px}.crumbs a{text-decoration:none}.detail article{padding:0 0 42px}.answer{max-width:850px;margin:24px 0 0;font-size:22px;line-height:1.55;font-weight:680;letter-spacing:-.02em}.bodycopy{max-width:820px;margin-top:28px}.bodycopy p{margin:0 0 18px;font-size:17px;line-height:1.78;color:color-mix(in srgb,var(--text) 88%,var(--muted))}.meta{display:flex;gap:18px;flex-wrap:wrap;margin-top:32px;color:var(--muted);font-size:12px}.related{padding-top:30px;border-top:1px solid var(--line)}.related h2{margin:0 0 14px;font-size:14px;color:var(--muted)}.related a{display:block;padding:12px 0;border-top:1px solid var(--line);text-decoration:none;font-weight:620;line-height:1.45}.related a:first-of-type{border-top:0}
footer{max-width:1080px;margin:0 auto;padding:0 22px 28px;color:var(--muted);font-size:12px}
@media(max-width:680px){.topbar{padding:0 16px}.shell{padding:35px 16px 72px}.questions{grid-template-columns:1fr}.hero h1{font-size:48px}.detail h1{font-size:40px}.answer{font-size:19px}.bodycopy p{font-size:16px}}
</style>
</head>
<body>
<header class="topbar"><a class="brand" href="/${code}">AERTEX</a><a class="qmark" href="/${code}/q">Q</a><div class="spacer"></div>${action}</header>
${body}
<footer>© AERTEX · ${zh ? "官方问题与解答" : "Official Questions & Answers"}</footer>
</body>
</html>`;
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, character => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[character]));
}
