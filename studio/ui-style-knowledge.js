export function knowledgeStyles() {
  return `    /* KNOWLEDGE_BASE_V1 */
    .os-main:has(.knowledge-shell) .os-hero{margin-bottom:18px}
    .os-main:has(.knowledge-shell) .os-hero h1{font-size:clamp(36px,4.7vw,58px);letter-spacing:-.035em}
    .knowledge-shell{display:grid;gap:18px;min-width:0}
    .knowledge-intro-panel,.knowledge-category-hero{
      position:relative;
      overflow:hidden;
      display:grid;
      align-items:center;
      gap:22px;
      padding:26px;
      border:1px solid color-mix(in srgb,var(--primary) 16%,var(--border));
      border-radius:26px;
      background:
        radial-gradient(circle at 88% 10%,color-mix(in srgb,var(--primary) 18%,transparent),transparent 33%),
        radial-gradient(circle at 8% 110%,color-mix(in srgb,#af52de 11%,transparent),transparent 38%),
        color-mix(in srgb,var(--card) 86%,transparent);
      box-shadow:0 16px 44px rgba(15,23,42,.065),inset 0 1px 0 color-mix(in srgb,#fff 28%,transparent);
      -webkit-backdrop-filter:blur(22px) saturate(150%);
      backdrop-filter:blur(22px) saturate(150%);
    }
    .knowledge-intro-panel{grid-template-columns:minmax(0,1fr) auto}
    .knowledge-intro-panel h2,.knowledge-category-hero h2,.knowledge-article-header h2{margin:7px 0 10px;font-size:clamp(28px,4vw,45px);line-height:1.06;letter-spacing:-.035em}
    .knowledge-intro-panel p,.knowledge-category-hero p,.knowledge-article-header p{max-width:780px;margin:0;color:var(--muted);font-size:14px;line-height:1.65}
    .knowledge-overline{display:block;color:var(--primary);font-size:11px;font-weight:820;letter-spacing:.04em;text-transform:uppercase}
    .knowledge-intro-stats{display:grid;grid-template-columns:repeat(3,minmax(72px,1fr));gap:8px}
    .knowledge-intro-stats>div{min-width:82px;padding:14px 12px;border:1px solid color-mix(in srgb,var(--border) 80%,transparent);border-radius:17px;background:color-mix(in srgb,var(--surface-soft) 70%,transparent);text-align:center}
    .knowledge-intro-stats strong,.knowledge-intro-stats span{display:block}
    .knowledge-intro-stats strong{font-size:26px;line-height:1;letter-spacing:-.04em}
    .knowledge-intro-stats span{margin-top:6px;color:var(--muted);font-size:11px}

    .knowledge-category-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
    .knowledge-category-card{
      position:relative;
      min-height:220px;
      display:flex;
      flex-direction:column;
      padding:20px;
      border:1px solid var(--border);
      border-radius:22px;
      background:color-mix(in srgb,var(--card) 88%,transparent);
      color:var(--text);
      text-decoration:none;
      box-shadow:0 8px 24px rgba(15,23,42,.04),inset 0 1px 0 color-mix(in srgb,#fff 18%,transparent);
      transition:transform .12s ease,border-color .16s ease,box-shadow .16s ease,background .16s ease;
      -webkit-tap-highlight-color:transparent;
    }
    .knowledge-category-card:hover{border-color:color-mix(in srgb,var(--primary) 34%,var(--border));background:color-mix(in srgb,var(--primary) 3%,var(--card));box-shadow:0 12px 30px rgba(15,23,42,.065)}
    .knowledge-category-card:active{transform:scale(.985)}
    .knowledge-icon{display:grid;place-items:center;width:44px;height:44px;flex:0 0 auto;border-radius:14px;color:var(--primary);background:color-mix(in srgb,var(--primary) 11%,var(--surface-soft));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 12%,var(--border))}
    .knowledge-icon svg{width:22px;height:22px}
    .knowledge-category-count{position:absolute;top:20px;right:20px;color:var(--muted);font-size:11px;font-weight:730}
    .knowledge-category-card h3{margin:18px 0 7px;font-size:21px;letter-spacing:-.025em}
    .knowledge-category-card p{margin:0;color:var(--muted);font-size:12px;line-height:1.55}
    .knowledge-card-action{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:auto;padding-top:18px;color:var(--primary);font-size:12px;font-weight:790}
    .knowledge-card-action b{font-size:20px;font-weight:500}

    .knowledge-guidance{display:grid;grid-template-columns:minmax(220px,.7fr) minmax(0,1.3fr);gap:24px;align-items:start;border-radius:22px}
    .knowledge-guidance h3{margin:6px 0 0;font-size:20px;line-height:1.3}
    .knowledge-guidance ul{margin:0;padding-left:20px;color:var(--muted);font-size:13px;line-height:1.7}
    .knowledge-guidance li+li{margin-top:5px}

    .knowledge-breadcrumbs{display:flex;flex-wrap:wrap;align-items:center;gap:7px;padding:0 4px;color:var(--muted);font-size:12px}
    .knowledge-breadcrumbs a{color:var(--muted);text-decoration:none}
    .knowledge-breadcrumbs a:hover{color:var(--primary)}
    .knowledge-breadcrumbs strong{color:var(--text);font-weight:730}
    .knowledge-breadcrumbs>span{opacity:.55}

    .knowledge-category-hero{grid-template-columns:auto minmax(0,1fr);padding:22px 24px}
    .knowledge-category-hero .knowledge-icon{width:58px;height:58px;border-radius:18px}
    .knowledge-category-hero .knowledge-icon svg{width:28px;height:28px}
    .knowledge-category-hero h2{font-size:clamp(28px,3.6vw,40px)}

    .knowledge-topic-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .knowledge-topic-card{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:13px;align-items:center;min-height:116px;padding:16px 17px;border:1px solid var(--border);border-radius:19px;background:var(--card);color:var(--text);text-decoration:none;transition:transform .1s ease,border-color .15s ease,background .15s ease;-webkit-tap-highlight-color:transparent}
    .knowledge-topic-card:hover{border-color:color-mix(in srgb,var(--primary) 30%,var(--border));background:color-mix(in srgb,var(--primary) 3%,var(--card))}
    .knowledge-topic-card:active{transform:scale(.99)}
    .knowledge-topic-index{display:grid;place-items:center;width:37px;height:37px;border-radius:12px;background:var(--surface-soft);color:var(--primary);font-size:11px;font-weight:820}
    .knowledge-topic-card h3{margin:0;font-size:15px;line-height:1.35}
    .knowledge-topic-card p{display:-webkit-box;margin:5px 0 0;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;color:var(--muted);font-size:11px;line-height:1.5}
    .knowledge-topic-card>b{color:var(--muted);font-size:20px;font-weight:500}

    .knowledge-category-switcher{display:flex;flex-wrap:wrap;gap:7px;padding:5px 0 1px}
    .knowledge-category-switcher a{display:inline-flex;align-items:center;min-height:34px;padding:0 11px;border:1px solid var(--border);border-radius:999px;background:var(--surface-soft);color:var(--muted);font-size:11px;font-weight:720;text-decoration:none}
    .knowledge-category-switcher a[aria-current="page"]{border-color:color-mix(in srgb,var(--primary) 42%,var(--border));background:color-mix(in srgb,var(--primary) 10%,var(--surface-soft));color:var(--primary)}

    .knowledge-article-grid{display:grid;grid-template-columns:minmax(190px,240px) minmax(0,1fr);gap:16px;align-items:start}
    .knowledge-local-nav{position:sticky;top:0;display:grid;gap:9px;padding:12px;border:1px solid var(--border);border-radius:19px;background:color-mix(in srgb,var(--card) 90%,transparent);box-shadow:0 8px 22px rgba(15,23,42,.035)}
    .knowledge-local-heading{display:flex;align-items:center;gap:9px;padding:4px;color:var(--text);text-decoration:none;font-size:13px;font-weight:800}
    .knowledge-local-heading .knowledge-icon{width:34px;height:34px;border-radius:11px}
    .knowledge-local-heading .knowledge-icon svg{width:17px;height:17px}
    .knowledge-local-nav>div{display:grid;gap:2px}
    .knowledge-local-nav>div>a{padding:8px 9px;border-radius:10px;color:var(--muted);font-size:11px;line-height:1.35;text-decoration:none}
    .knowledge-local-nav>div>a:hover{background:var(--surface-soft);color:var(--text)}
    .knowledge-local-nav>div>a[aria-current="page"]{background:color-mix(in srgb,var(--primary) 10%,var(--surface-soft));color:var(--primary);font-weight:780}

    .knowledge-article{min-width:0;overflow:hidden;border:1px solid var(--border);border-radius:23px;background:var(--card);box-shadow:0 12px 34px rgba(15,23,42,.045)}
    .knowledge-article-header{padding:26px 26px 23px;border-bottom:1px solid var(--border);background:linear-gradient(145deg,color-mix(in srgb,var(--primary) 5%,var(--card)),var(--card) 62%)}
    .knowledge-article-header h2{font-size:clamp(27px,3.6vw,42px)}
    .knowledge-article-body{display:grid}
    .knowledge-section{display:grid;grid-template-columns:44px minmax(0,1fr);gap:15px;padding:24px 26px;border-bottom:1px solid color-mix(in srgb,var(--border) 78%,transparent)}
    .knowledge-section:last-child{border-bottom:0}
    .knowledge-section-number{display:grid;place-items:center;width:36px;height:36px;border-radius:11px;background:var(--surface-soft);color:var(--primary);font-size:10px;font-weight:820}
    .knowledge-section h3{margin:3px 0 11px;font-size:18px;letter-spacing:-.015em}
    .knowledge-section p{margin:0;color:var(--muted);font-size:13px;line-height:1.7}
    .knowledge-section p+p{margin-top:9px}
    .knowledge-section ul{margin:8px 0 0;padding-left:20px;color:var(--muted);font-size:13px;line-height:1.7}
    .knowledge-section li+li{margin-top:4px}
    .knowledge-code{max-width:100%;margin:14px 0 0;padding:15px 16px;overflow:auto;border:1px solid color-mix(in srgb,var(--border) 88%,transparent);border-radius:14px;background:color-mix(in srgb,var(--surface-soft) 78%,var(--card));color:var(--text);font:12px/1.65 ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;white-space:pre-wrap;word-break:break-word}
    .knowledge-code code{font:inherit}

    .knowledge-article-footer{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:18px 20px;border-top:1px solid var(--border);background:var(--surface-soft)}
    .knowledge-page-link{display:flex;flex-direction:column;gap:4px;min-height:62px;justify-content:center;padding:10px 12px;border:1px solid var(--border);border-radius:14px;background:var(--card);color:var(--text);text-decoration:none}
    .knowledge-page-link.next{text-align:right;align-items:flex-end}
    .knowledge-page-link small{color:var(--muted);font-size:10px}
    .knowledge-page-link strong{font-size:12px;line-height:1.4}

    .knowledge-search-panel{display:grid;gap:13px;padding:18px;border:1px solid color-mix(in srgb,var(--border) 88%,transparent);border-radius:22px;background:color-mix(in srgb,var(--card) 90%,transparent);box-shadow:0 10px 30px rgba(15,23,42,.045)}
    .knowledge-search-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:18px}
    .knowledge-search-heading h3{margin:5px 0 5px;font-size:18px;letter-spacing:-.02em}
    .knowledge-search-heading p{max-width:760px;margin:0;color:var(--muted);font-size:12px;line-height:1.55}
    .knowledge-search-count{flex:0 0 auto;min-height:28px;padding:6px 10px;border-radius:999px;background:var(--surface-soft);color:var(--muted);font-size:11px;font-weight:760}
    .knowledge-search-count:empty{display:none}
    .knowledge-search-box{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:9px;min-height:50px;padding:0 11px;border:1px solid var(--border);border-radius:15px;background:var(--surface-soft);transition:border-color .15s ease,box-shadow .15s ease,background .15s ease}
    .knowledge-search-box:focus-within{border-color:color-mix(in srgb,var(--primary) 58%,var(--border));box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 11%,transparent);background:var(--card)}
    .knowledge-search-box>svg{width:19px;height:19px;color:var(--muted)}
    .knowledge-search-box input{width:100%;min-height:48px;margin:0!important;padding:0!important;border:0!important;background:transparent!important;color:var(--text);box-shadow:none!important;font:inherit;font-size:14px;outline:0}
    .knowledge-search-clear{display:grid!important;place-items:center;width:32px!important;min-width:32px!important;height:32px!important;min-height:32px!important;margin:0!important;padding:0!important;border:0!important;border-radius:50%!important;background:var(--secondary)!important;color:var(--text)!important;box-shadow:none!important;font-size:20px!important;font-weight:500!important;line-height:1!important}
    .knowledge-search-clear[hidden]{display:none!important}
    .knowledge-search-clear:active{transform:scale(.92)!important}
    .knowledge-search-results{display:grid;gap:7px;max-height:min(58vh,620px);overflow:auto;padding:3px 1px 1px;overscroll-behavior:contain}
    .knowledge-search-result{display:grid;gap:5px;padding:13px 14px;border:1px solid var(--border);border-radius:14px;background:var(--surface-soft);color:var(--text);text-decoration:none;transition:background .13s ease,border-color .13s ease,transform .1s ease}
    a.knowledge-search-result:hover{border-color:color-mix(in srgb,var(--primary) 34%,var(--border));background:color-mix(in srgb,var(--primary) 5%,var(--surface-soft))}
    a.knowledge-search-result:active{transform:scale(.994)}
    .knowledge-search-result-meta{color:var(--primary);font-size:10px;font-weight:790}
    .knowledge-search-result strong{font-size:14px;line-height:1.35}
    .knowledge-search-result p{margin:0;color:var(--muted);font-size:11px;line-height:1.55}
    .knowledge-search-empty{padding:20px;border:1px dashed var(--border);border-radius:14px;text-align:center}
    .knowledge-search-empty strong{font-size:14px}
    .knowledge-search-empty p,.knowledge-search-notice{margin:5px 0 0;color:var(--muted);font-size:11px;line-height:1.5}
    .knowledge-search-notice{padding:4px 3px}

    @media(max-width:1180px){
      .knowledge-category-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      .knowledge-article-grid{grid-template-columns:200px minmax(0,1fr)}
    }
    @media(max-width:900px){
      .knowledge-intro-panel{grid-template-columns:1fr}
      .knowledge-intro-stats{max-width:420px}
      .knowledge-article-grid{grid-template-columns:1fr}
      .knowledge-local-nav{position:static}
      .knowledge-local-nav>div{grid-template-columns:repeat(2,minmax(0,1fr))}
    }
    @media(max-width:640px){
      .knowledge-search-panel{padding:15px;border-radius:19px}
      .knowledge-search-heading{display:grid;gap:8px}
      .knowledge-intro-panel,.knowledge-category-hero{padding:20px;border-radius:22px}
      .knowledge-intro-panel h2,.knowledge-category-hero h2,.knowledge-article-header h2{font-size:29px}
      .knowledge-intro-stats{grid-template-columns:repeat(3,minmax(0,1fr));width:100%}
      .knowledge-intro-stats>div{min-width:0;padding:12px 6px}
      .knowledge-category-grid,.knowledge-topic-grid{grid-template-columns:1fr}
      .knowledge-category-card{min-height:200px}
      .knowledge-guidance{grid-template-columns:1fr;gap:13px}
      .knowledge-category-hero{grid-template-columns:1fr}
      .knowledge-article-header{padding:21px 19px}
      .knowledge-section{grid-template-columns:1fr;gap:9px;padding:20px 19px}
      .knowledge-section-number{width:32px;height:32px}
      .knowledge-article-footer{grid-template-columns:1fr;padding:14px}
      .knowledge-page-link.next{text-align:left;align-items:flex-start}
      .knowledge-local-nav>div{grid-template-columns:1fr}
    }
    @media(prefers-reduced-motion:reduce){
      .knowledge-category-card,.knowledge-topic-card,.knowledge-search-result{transition:none!important}
      .knowledge-category-card:active,.knowledge-topic-card:active{transform:none!important}
    }
    @media(prefers-reduced-transparency:reduce){
      .knowledge-intro-panel,.knowledge-category-hero,.knowledge-local-nav{background:var(--card)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
    }
    @media(prefers-contrast:more){
      .knowledge-intro-panel,.knowledge-category-hero,.knowledge-category-card,.knowledge-topic-card,.knowledge-article,.knowledge-local-nav,.knowledge-search-panel,.knowledge-search-result{border-color:var(--text)}
    }`;
}
