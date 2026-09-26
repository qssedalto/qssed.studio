export function dashboardStyles() {
  return `    /* GLOBAL_TOP_CONTROLS_HOVER */
    @media (hover:hover) and (pointer:fine){
      .top-controls-zone{width:176px!important;height:92px!important;pointer-events:auto!important}
      .top-controls{opacity:0!important;transform:translateY(-8px)!important;pointer-events:none!important;transition:opacity .16s ease,transform .16s ease!important}
      .top-controls-zone:hover .top-controls,.top-controls-zone:focus-within .top-controls{opacity:1!important;transform:translateY(0)!important;pointer-events:auto!important}
    }
    @media (hover:none), (pointer:coarse){
      .top-controls-zone{width:176px!important;height:76px!important;pointer-events:none!important}
      .top-controls{opacity:1!important;transform:none!important;pointer-events:auto!important}
    }
    html.profile-sheet-open .top-controls-zone .top-controls{opacity:0!important;visibility:hidden!important;pointer-events:none!important;transform:translateY(-8px)!important}

    /* SIGN_OUT_OUTLINE */
    .os-signout-button{border-color:color-mix(in srgb,var(--danger) 34%,var(--border))!important;background:color-mix(in srgb,var(--danger) 3%,var(--card))!important;color:color-mix(in srgb,var(--danger) 72%,var(--muted))!important;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--danger) 7%,transparent)!important}
    .os-signout-button:hover{border-color:color-mix(in srgb,var(--danger) 58%,var(--border))!important;background:color-mix(in srgb,var(--danger) 9%,var(--card))!important;color:var(--danger)!important}

    /* DASHBOARD_APPLE_V4 */
    .dashboard-welcome{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,320px);gap:16px;min-height:230px;padding:22px;border:1px solid var(--border);border-radius:18px;background:var(--card)}
    .dashboard-welcome-copy{align-self:center}.dashboard-eyebrow{display:block;color:var(--muted);font-size:11px;font-weight:620;letter-spacing:.02em}.dashboard-welcome h2{margin:5px 0 7px;font-size:clamp(32px,4vw,48px);line-height:1.03;letter-spacing:-.045em}.dashboard-welcome p{max-width:680px;margin:0;color:var(--muted);font-size:14px;line-height:1.5}
    .dashboard-welcome-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}.dashboard-primary-action,.dashboard-secondary-action{min-height:40px;display:inline-flex;align-items:center;gap:9px;padding:0 14px;border:0;border-radius:11px;color:var(--text);text-decoration:none;font-size:13px;font-weight:650;transition:background .12s ease,transform 100ms ease-out}.dashboard-primary-action{color:#fff;background:var(--primary)}.dashboard-secondary-action{background:var(--fill)}.dashboard-secondary-action:hover{background:var(--secondary)}.dashboard-primary-action:active,.dashboard-secondary-action:active{transform:scale(.97)}
    .dashboard-today-card{display:grid;grid-template-rows:1fr auto;gap:14px;min-height:180px;padding:16px;border:1px solid color-mix(in srgb,var(--primary) 10%,var(--border));border-radius:16px;background:linear-gradient(145deg,color-mix(in srgb,var(--primary) 6%,var(--fill)),var(--fill));overflow:hidden}.dashboard-today-main{display:grid;grid-template-columns:auto minmax(0,1fr);gap:12px;align-items:center}.dashboard-today-copy{min-width:0}.dashboard-today-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding-top:12px;border-top:1px solid color-mix(in srgb,var(--border) 78%,transparent)}.dashboard-today-meta>div{min-width:0;padding:9px 10px;border-radius:11px;background:color-mix(in srgb,var(--card) 58%,transparent)}.dashboard-today-meta small,.dashboard-today-meta strong{display:block}.dashboard-today-meta small{color:var(--muted);font-size:10px}.dashboard-today-meta strong{margin-top:3px;overflow:hidden;color:var(--text);font-size:11px;font-weight:680;text-overflow:ellipsis;white-space:nowrap}
    .dashboard-icon{width:40px;height:40px;display:grid;place-items:center;flex:0 0 auto;border-radius:12px;color:var(--primary);background:color-mix(in srgb,var(--primary) 10%,var(--fill))}.dashboard-icon svg{width:20px;height:20px}.dashboard-today-copy>*{display:block}.dashboard-today-copy small{color:var(--muted);font-size:11px}.dashboard-today-copy strong{margin-top:2px;font-size:36px;line-height:1;letter-spacing:-.045em}.dashboard-today-copy span{margin-top:7px;color:var(--muted);font-size:12px;line-height:1.35}
    .dashboard-home-wishes{display:grid;grid-template-columns:minmax(0,.82fr) minmax(0,1.18fr);gap:16px;margin-top:18px;padding:18px;border:1px solid var(--border);border-radius:18px;background:linear-gradient(145deg,color-mix(in srgb,var(--primary) 3%,var(--card)),var(--card))}
    .dashboard-home-wishes-copy{align-self:center;padding:4px}.dashboard-home-wishes-copy h2{margin:5px 0 7px;font-size:28px;letter-spacing:-.035em}.dashboard-home-wishes-copy p{max-width:460px;margin:0;color:var(--muted);font-size:13px;line-height:1.55}
    .dashboard-home-wishes-builder{display:grid;gap:10px;padding:13px;border-radius:15px;background:var(--fill)}
    .dashboard-home-wish-types{display:grid;grid-template-columns:1fr 1fr;gap:8px}.dashboard-home-wish-type{min-height:66px;padding:10px 11px;border:1px solid transparent;border-radius:12px;background:var(--card);color:var(--text);text-align:left;cursor:pointer;transition:background .12s ease,border-color .12s ease,transform 100ms ease-out}.dashboard-home-wish-type:hover{background:var(--secondary)}.dashboard-home-wish-type:active{transform:scale(.985)}.dashboard-home-wish-type.is-active{border-color:color-mix(in srgb,var(--primary) 48%,var(--border));background:color-mix(in srgb,var(--primary) 7%,var(--card))}.dashboard-home-wish-type strong,.dashboard-home-wish-type span{display:block}.dashboard-home-wish-type strong{font-size:13px}.dashboard-home-wish-type span{margin-top:3px;color:var(--muted);font-size:10px}
    .dashboard-home-wish-name{display:grid;gap:6px}.dashboard-home-wish-name>span{display:flex;align-items:center;gap:7px;color:var(--muted);font-size:11px}.dashboard-home-wish-name small{padding:2px 6px;border-radius:999px;background:var(--surface);font-size:9px}.dashboard-home-wish-name input{width:100%;height:40px;padding:0 12px;border:1px solid var(--border);border-radius:11px;background:var(--card);color:var(--text);outline:none}.dashboard-home-wish-name input:focus{border-color:color-mix(in srgb,var(--primary) 58%,var(--border));box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 9%,transparent)}
    .dashboard-home-wish-preview{min-width:0;padding:10px 11px;border-radius:11px;background:var(--card)}.dashboard-home-wish-preview small{display:block;color:var(--muted);font-size:9px}.dashboard-home-wish-preview code{display:block;margin-top:4px;overflow:hidden;color:var(--text);font:600 11px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;text-overflow:ellipsis;white-space:nowrap}
    .dashboard-home-wish-actions{display:flex;gap:8px;flex-wrap:wrap}.dashboard-home-wish-actions .dashboard-primary-action,.dashboard-home-wish-actions .dashboard-secondary-action{margin:0}
    .dashboard-section{margin-top:18px}.dashboard-section-head{display:flex;justify-content:space-between;align-items:end;gap:12px;padding:0 2px;margin-bottom:10px}.dashboard-section-head.compact{margin-bottom:12px;padding:0}.dashboard-section-head small{display:block;color:var(--muted);font-size:11px;font-weight:620}.dashboard-section-head h2{margin:2px 0 0;font-size:20px;letter-spacing:-.025em}.dashboard-section-head>span{color:var(--muted);font-size:11px}
    .dashboard-shortcuts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.dashboard-shortcut{min-height:92px;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:11px;align-items:center;padding:13px;color:var(--text);text-decoration:none;border:0;border-radius:15px;background:var(--fill);transition:background .12s ease,transform 100ms ease-out}.dashboard-shortcut:hover{background:var(--secondary)}.dashboard-shortcut:active{transform:scale(.985)}.dashboard-shortcut span>*{display:block}.dashboard-shortcut span strong{font-size:14px}.dashboard-shortcut span small{margin-top:3px;color:var(--muted);font-size:11px;line-height:1.4}.dashboard-shortcut b{color:var(--quiet);font-size:19px;font-weight:500}
    .dashboard-split{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(280px,.75fr);gap:12px;margin-top:18px}.dashboard-module-card,.dashboard-session-card,.dashboard-activity-card{border-radius:18px!important}.dashboard-module-list,.dashboard-session-facts{display:grid;gap:6px}.dashboard-module-list>a{display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;gap:11px;align-items:center;min-height:68px;padding:9px 10px;color:var(--text);text-decoration:none;border-radius:13px;background:var(--fill);transition:background .12s ease,transform 100ms ease-out}.dashboard-module-list>a:hover{background:var(--secondary)}.dashboard-module-list>a:active{transform:scale(.992)}.dashboard-module-list span>*{display:block}.dashboard-module-list span strong{font-size:13px}.dashboard-module-list span small{margin-top:2px;color:var(--muted);font-size:11px}.dashboard-module-list em{min-height:22px;display:inline-flex;align-items:center;padding:0 8px;border-radius:999px;color:var(--muted);background:var(--surface);font-size:10px;font-style:normal;font-weight:620;white-space:nowrap}.dashboard-module-list b{color:var(--quiet);font-size:18px;font-weight:500}
    .dashboard-session-card{display:flex;flex-direction:column}.dashboard-session-facts{flex:1}.dashboard-session-facts>div{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px;align-items:center;padding:9px;border-radius:13px;background:var(--fill)}.dashboard-session-facts .dashboard-icon{width:36px;height:36px;border-radius:11px}.dashboard-session-facts .dashboard-icon svg{width:18px;height:18px}.dashboard-session-facts span>*{display:block}.dashboard-session-facts span small{color:var(--muted);font-size:10px}.dashboard-session-facts span strong{margin-top:2px;font-size:13px}.dashboard-session-settings{min-height:40px;display:flex;align-items:center;justify-content:space-between;margin-top:8px;padding:0 12px;border-radius:11px;color:var(--text);text-decoration:none;background:var(--fill);font-size:12px;font-weight:650;transition:background .12s ease,transform 100ms ease-out}.dashboard-session-settings:hover{background:var(--secondary)}.dashboard-session-settings:active{transform:scale(.985)}
    .dashboard-activity-card{margin-top:12px}.dashboard-empty-activity{display:grid;place-items:center;min-height:150px;padding:20px;text-align:center;border:0;border-radius:14px;background:var(--fill)}.dashboard-empty-activity>span{width:8px;height:8px;margin-bottom:8px;border-radius:50%;background:var(--primary)}.dashboard-empty-activity strong{font-size:15px}.dashboard-empty-activity p{max-width:620px;margin:5px 0 0;color:var(--muted);font-size:12px}.dashboard-empty-activity a{margin-top:10px;color:var(--primary);text-decoration:none;font-size:12px;font-weight:650}
    @media(max-width:1080px){.dashboard-home-wishes{grid-template-columns:1fr}.dashboard-shortcuts{grid-template-columns:repeat(2,minmax(0,1fr))}.dashboard-split{grid-template-columns:1fr}}
    @media(max-width:760px){.dashboard-welcome{grid-template-columns:1fr;padding:17px}.dashboard-home-wishes{padding:15px}.dashboard-today-card{min-height:156px}.dashboard-today-meta{grid-template-columns:1fr 1fr}.dashboard-shortcuts{grid-template-columns:1fr}.dashboard-module-list>a{grid-template-columns:auto minmax(0,1fr) auto}.dashboard-module-list em{display:none}}
    @media(max-width:430px){.dashboard-home-wish-types{grid-template-columns:1fr}.dashboard-home-wish-actions{display:grid;grid-template-columns:1fr}.dashboard-home-wish-actions a{width:100%;justify-content:center}.dashboard-today-meta{grid-template-columns:1fr}}
    @media(prefers-reduced-motion:reduce){.dashboard-primary-action,.dashboard-secondary-action,.dashboard-shortcut,.dashboard-module-list>a,.dashboard-session-settings{transition:background .12s ease!important;transform:none!important}}
    /* SIDEBAR_SETTINGS_V5 */
    .os-nav{gap:12px}
    .os-nav-group{overflow:hidden;padding:0;border:0;border-radius:18px;background:var(--card);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--border) 68%,transparent)}
    .os-nav-group.is-active{border:0;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--border) 68%,transparent)}
    .os-nav-entry{position:relative}
    .os-nav-entry+.os-nav-entry:before,.os-nav-product-link+.os-nav-product-link:before{content:"";position:absolute;left:54px;right:12px;top:0;height:1px;background:var(--hairline)}
    .os-nav-product-link{position:relative}
    .os-nav-title{min-height:50px;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:10px;align-items:center;padding:6px 12px;font-size:14px;font-weight:620;transition:background .12s ease,transform .1s ease}
    .os-nav-title:hover{background:var(--secondary)}
    .os-nav-title:active{transform:scale(.992)}
    .os-nav-title .dashboard-icon{width:32px;height:32px;border-radius:9px;color:#fff;background:#8e8e93;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)}
    .os-nav-title .dashboard-icon svg{width:17px;height:17px;stroke-width:1.9}
    .os-nav-entry.is-active>.os-nav-title .dashboard-icon{background:#0a84ff}
    .os-nav-product-link[data-product-link="intelligence"] .dashboard-icon{background:#5856d6}
    .os-nav-product-link[data-product-link="admin-console"] .dashboard-icon{background:#8e8e93}
    .os-nav-title>b{color:var(--quiet);font-size:20px;font-weight:450}
    .os-nav-items{gap:0;padding:0 10px 8px 54px}
    .os-nav-items a{min-height:34px;display:flex;align-items:center;padding:5px 8px;border-radius:9px;font-size:12px;color:var(--muted)}
    .os-nav-items a[aria-current="page"]{color:var(--text);background:var(--fill);font-weight:650}

    /* DASHBOARD_ACTION_ICONS_V6 */
    .dashboard-primary-action>.dashboard-icon,.dashboard-secondary-action>.dashboard-icon,.dashboard-session-settings>.dashboard-icon,.dashboard-activity-action>.dashboard-icon{
      width:24px;height:24px;border-radius:7px;flex:0 0 auto;color:currentColor;background:color-mix(in srgb,currentColor 10%,transparent)
    }
    .dashboard-primary-action>.dashboard-icon{background:rgba(255,255,255,.16);color:#fff}
    .dashboard-primary-action>.dashboard-icon svg,.dashboard-secondary-action>.dashboard-icon svg,.dashboard-session-settings>.dashboard-icon svg,.dashboard-activity-action>.dashboard-icon svg{width:14px;height:14px}
    .dashboard-action-label{min-width:0}
    .dashboard-action-arrow{margin-left:auto}
    .dashboard-home-wish-type{display:grid;grid-template-columns:auto minmax(0,1fr);gap:9px;align-items:center}
    .dashboard-home-wish-type>.dashboard-icon{width:34px;height:34px;border-radius:10px}
    .dashboard-home-wish-type-copy{min-width:0}
    .dashboard-home-wish-type-copy strong,.dashboard-home-wish-type-copy>span{display:block}
    .dashboard-session-settings{justify-content:flex-start;gap:10px}
    .dashboard-session-settings .dashboard-action-arrow{margin-left:auto}
    .dashboard-activity-action{display:inline-flex!important;align-items:center;justify-content:center;gap:8px}
    .dashboard-activity-action>b{margin-left:2px}

    /* NAV_DISCOVERABILITY_V6 — keep every feature visible */
    .os-nav-entry+.os-nav-entry:before{display:none}
    .os-nav-items{display:grid;gap:3px;padding:0 8px 8px}
    .os-nav-items a{
      min-height:38px;
      display:grid;
      grid-template-columns:auto minmax(0,1fr);
      gap:9px;
      align-items:center;
      padding:5px 8px;
      border-radius:10px;
      font-size:12px;
      color:var(--muted);
    }
    .os-nav-items a .dashboard-icon{
      width:27px;height:27px;border-radius:8px;
      color:var(--muted);background:var(--fill);
      box-shadow:none;
    }
    .os-nav-items a .dashboard-icon svg{width:14px;height:14px;stroke-width:1.8}
    .os-nav-items a:hover{background:var(--secondary);color:var(--text)}
    .os-nav-items a[aria-current="page"]{color:var(--text);background:var(--fill);font-weight:650}
    .os-nav-items a[aria-current="page"] .dashboard-icon{color:#fff;background:#0a84ff}

    /* NAV_SEMANTIC_COLORS_V7 — distinct, SF Symbols-inspired semantic palette */
    .os-nav .dashboard-icon{color:#fff!important}
    .os-nav .dashboard-icon-home{background:#0a84ff!important}
    .os-nav .dashboard-icon-wishes,.os-nav .dashboard-icon-gift{background:#ff9f0a!important}
    .os-nav .dashboard-icon-info{background:#32ade6!important}
    .os-nav .dashboard-icon-knowledge{background:#af52de!important}
    .os-nav .dashboard-icon-links{background:#34c759!important}
    .os-nav .dashboard-icon-notes{background:#ff9f0a!important}
    .os-nav .dashboard-icon-summary{background:#5856d6!important}
    .os-nav .dashboard-icon-search{background:#0a84ff!important}
    .os-nav .dashboard-icon-profile{background:#30b0c7!important}
    .os-nav .dashboard-icon-account{background:#64d2ff!important}
    .os-nav .dashboard-icon-preferences{background:#bf5af2!important}
    .os-nav .dashboard-icon-workspace{background:#5856d6!important}
    .os-nav .dashboard-icon-workbench{background:#0a84ff!important}
    .os-nav .dashboard-icon-projects{background:#ff9f0a!important}
    .os-nav .dashboard-icon-experiments{background:#af52de!important}
    .os-nav .dashboard-icon-drafts{background:#8e8e93!important}
    .os-nav .dashboard-icon-tasks{background:#34c759!important}
    .os-nav .dashboard-icon-settings{background:#8e8e93!important}
    .os-nav .dashboard-icon-general{background:#636366!important}
    .os-nav .dashboard-icon-appearance{background:#5856d6!important}
    .os-nav .dashboard-icon-language{background:#0a84ff!important}
    .os-nav .dashboard-icon-security{background:#34c759!important}
    .os-nav .dashboard-icon-notifications{background:#ff453a!important}
    .os-nav .dashboard-icon-ai,.os-nav .dashboard-icon-intelligence{background:#af52de!important}
    .os-nav .dashboard-icon-integrations{background:#30b0c7!important}
    .os-nav .dashboard-icon-storage{background:#32ade6!important}
    .os-nav .dashboard-icon-work{background:#ff9f0a!important}
    .os-nav .dashboard-icon-computer{background:#34c759!important}
    .os-nav .dashboard-icon-tex{background:#5856d6!important}
    .os-nav .dashboard-icon-admin{background:#636366!important}
    .os-nav-items a .dashboard-icon{
      box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)!important;
    }
    .os-nav-items a[aria-current="page"] .dashboard-icon{
      filter:saturate(1.08) brightness(1.02);
    }
    .os-nav-entry[data-nav-section="work"]{margin:0}
    .os-nav-entry[data-nav-section="work"] .os-nav-title{font-weight:680}

  `;
}
