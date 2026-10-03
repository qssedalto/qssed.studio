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
    .dashboard-icon{width:40px;height:40px;display:flex;align-items:center;justify-content:center;flex:0 0 auto;border-radius:12px;color:var(--primary);background:color-mix(in srgb,var(--primary) 10%,var(--fill));line-height:0}.dashboard-icon svg{display:block;width:20px;height:20px;flex:0 0 20px;overflow:visible;transform:none;transform-origin:50% 50%}.dashboard-today-copy>*{display:block}.dashboard-today-copy small{color:var(--muted);font-size:11px}.dashboard-today-copy strong{margin-top:2px;font-size:36px;line-height:1;letter-spacing:-.045em}.dashboard-today-copy span{margin-top:7px;color:var(--muted);font-size:12px;line-height:1.35}
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
    .os-nav-title{position:relative;min-height:50px;display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px;align-items:center;padding:6px 40px 6px 12px;font-size:14px;font-weight:620;transition:background .12s ease,transform .1s ease}
    .os-nav-title:hover{background:var(--secondary)}
    .os-nav-title:active{transform:scale(.992)}
    .os-nav-title .dashboard-icon{width:32px;height:32px;border-radius:9px;color:#fff;background:#8e8e93;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)}
    .os-nav-title .dashboard-icon svg{width:17px;height:17px;stroke-width:1.9}
    .os-nav-entry.is-active>.os-nav-title .dashboard-icon{background:#0a84ff}
    .os-nav-product-link[data-product-link="intelligence"] .dashboard-icon{background:#5856d6}
    .os-nav-product-link[data-product-link="admin-console"] .dashboard-icon{background:#8e8e93}
    .os-nav-title::after{
      content:"›";
      position:absolute;
      right:12px;
      top:50%;
      display:grid;
      place-items:center;
      width:18px;
      height:18px;
      color:var(--quiet);
      font-size:19px;
      font-weight:450;
      line-height:1;
      opacity:.72;
      transform:translateY(-50%);
      transform-origin:50% 50%;
      pointer-events:none;
      transition:transform .16s ease,color .16s ease,opacity .16s ease;
    }
    .os-nav-entry.is-active>.os-nav-title.has-subnav::after{
      transform:translateY(-50%) rotate(90deg);
      color:var(--primary);
      opacity:.94;
    }
    .os-nav-items{gap:0;padding:0 10px 8px 54px}
    .os-nav-items a{position:relative;box-sizing:border-box;width:100%;min-height:34px;display:flex;align-items:center;gap:8px;padding:5px 30px 5px 8px;border-radius:9px;font-size:12px;color:var(--muted)}
    .os-nav-items a>span{min-width:0;flex:1 1 auto}
    .os-nav-items a::after{
      content:"›";
      position:absolute;
      right:8px;
      top:50%;
      display:grid;
      place-items:center;
      width:15px;
      height:15px;
      color:var(--quiet);
      font-size:15px;
      font-weight:500;
      line-height:1;
      opacity:.62;
      transform:translateY(-50%);
      pointer-events:none;
      transition:transform .14s ease,color .14s ease,opacity .14s ease;
    }
    .os-nav-items a[aria-current="page"]{color:var(--text);background:var(--fill);font-weight:650}
    .os-nav-items a[aria-current="page"]::after{color:var(--primary);opacity:.9}
    @media(hover:hover) and (pointer:fine){
      .os-nav-title:hover::after{color:var(--text);opacity:.92}
      .os-nav-items a:hover::after{transform:translate(1px,-50%);color:var(--primary);opacity:.92}
    }

    /* DASHBOARD_ACTION_ICONS_V6 */
    .dashboard-primary-action>.dashboard-icon,.dashboard-secondary-action>.dashboard-icon,.dashboard-session-settings>.dashboard-icon,.dashboard-activity-action>.dashboard-icon{
      width:24px;height:24px;border-radius:7px;flex:0 0 auto;color:currentColor;background:color-mix(in srgb,currentColor 10%,transparent)
    }
    .dashboard-primary-action>.dashboard-icon{background:rgba(255,255,255,.16);color:#fff}
    .dashboard-primary-action>.dashboard-icon svg,.dashboard-secondary-action>.dashboard-icon svg,.dashboard-session-settings>.dashboard-icon svg,.dashboard-activity-action>.dashboard-icon svg{width:14px;height:14px}
    .dashboard-action-label{min-width:0}
    .dashboard-action-arrow{margin-left:auto}
    .dashboard-home-wish-type{display:grid;grid-template-columns:auto minmax(0,1fr);gap:9px;align-items:center}
    .dashboard-home-wish-type>.dashboard-icon{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;line-height:0}.dashboard-home-wish-type>.dashboard-icon svg{width:18px;height:18px;flex:0 0 18px}
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


    /* WORKSPACE_NAV_V9 — full labels, reliable layout, and cohesive workspace surfaces */
    .os-nav-entry[data-nav-section="workspace"]{
      position:relative;
      box-sizing:border-box;
      padding:6px!important;
      border-radius:18px!important;
      overflow:visible!important;
      background:
        linear-gradient(180deg,color-mix(in srgb,var(--primary) 4%,var(--card)),color-mix(in srgb,var(--card) 97%,transparent))!important;
      box-shadow:
        inset 0 0 0 1px color-mix(in srgb,var(--border) 74%,transparent),
        0 8px 22px rgba(0,0,0,.035)!important;
    }
    .os-nav-entry[data-nav-section="workspace"]>.os-nav-title{
      box-sizing:border-box;
      min-height:52px!important;
      display:grid!important;
      grid-template-columns:36px minmax(0,1fr) 18px!important;
      gap:10px!important;
      align-items:center!important;
      padding:7px 36px 7px 9px!important;
      border-radius:14px!important;
      color:var(--text)!important;
      background:transparent!important;
      font-size:14px!important;
      font-weight:700!important;
      letter-spacing:-.015em;
    }
    .os-nav-entry[data-nav-section="workspace"].is-active>.os-nav-title{
      color:var(--primary)!important;
      background:
        linear-gradient(135deg,color-mix(in srgb,var(--primary) 15%,transparent),color-mix(in srgb,var(--primary) 7%,transparent))!important;
      box-shadow:
        inset 0 0 0 1px color-mix(in srgb,var(--primary) 18%,transparent),
        0 7px 18px color-mix(in srgb,var(--primary) 7%,transparent)!important;
    }
    .os-nav-entry[data-nav-section="workspace"]>.os-nav-title .dashboard-icon{
      width:36px!important;
      height:36px!important;
      border-radius:11px!important;
      background:linear-gradient(145deg,#756eff,#5856d6)!important;
      color:#fff!important;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,.22),
        inset 0 0 0 1px rgba(255,255,255,.16),
        0 6px 16px rgba(88,86,214,.20)!important;
    }
    .os-nav-entry[data-nav-section="workspace"]>.os-nav-title .dashboard-icon svg{
      width:18px!important;height:18px!important;stroke-width:1.85!important
    }
    .os-nav-entry[data-nav-section="workspace"]>.os-nav-title::after{
      right:9px!important;
      top:50%!important;
      width:18px!important;
      height:18px!important;
      color:var(--quiet)!important;
      font-size:17px!important;
    }
    .os-nav-entry[data-nav-section="workspace"].is-active>.os-nav-title.has-subnav::after{
      transform:translateY(-50%) rotate(90deg)!important;
      color:var(--primary)!important;
      opacity:1!important;
    }
    .os-nav-entry[data-nav-section="workspace"]>.os-nav-items{
      display:grid!important;
      gap:3px!important;
      width:100%!important;
      min-width:0!important;
      margin-top:5px!important;
      padding:0!important;
      overflow:visible!important;
    }
    .os-nav-entry[data-nav-section="workspace"]>.os-nav-items>a{
      position:relative;
      box-sizing:border-box;
      display:flex!important;
      align-items:center!important;
      width:100%!important;
      min-width:0!important;
      min-height:40px!important;
      gap:9px!important;
      padding:5px 30px 5px 8px!important;
      border-radius:11px!important;
      overflow:visible!important;
      color:var(--muted)!important;
      background:transparent!important;
      font-size:12.5px!important;
      font-weight:580!important;
      letter-spacing:-.01em;
      transition:background .14s ease,color .14s ease,box-shadow .14s ease,transform .1s ease!important;
    }
    .os-nav-entry[data-nav-section="workspace"]>.os-nav-items>a .dashboard-icon{
      flex:0 0 28px!important;
      width:28px!important;
      height:28px!important;
      border-radius:8px!important;
      box-shadow:inset 0 0 0 1px color-mix(in srgb,currentColor 13%,transparent)!important;
    }
    .os-nav-entry[data-nav-section="workspace"]>.os-nav-items>a .dashboard-icon svg{
      width:14px!important;height:14px!important;stroke-width:1.8!important
    }
    .os-nav-entry[data-nav-section="workspace"]>.os-nav-items>a>span{
      display:block!important;
      flex:1 1 auto!important;
      min-width:0!important;
      max-width:none!important;
      overflow:visible!important;
      text-overflow:clip!important;
      white-space:nowrap!important;
      line-height:1.25!important;
    }
    .os-nav-entry[data-nav-section="workspace"]>.os-nav-items>a[href*="/workspace/workbench"] .dashboard-icon{
      background:color-mix(in srgb,#0a84ff 13%,var(--fill))!important;color:#0a84ff!important
    }
    .os-nav-entry[data-nav-section="workspace"]>.os-nav-items>a[href*="/workspace/projects"] .dashboard-icon{
      background:color-mix(in srgb,#ff9f0a 13%,var(--fill))!important;color:#ff9f0a!important
    }
    .os-nav-entry[data-nav-section="workspace"]>.os-nav-items>a[href*="/workspace/experiments"] .dashboard-icon{
      background:color-mix(in srgb,#af52de 13%,var(--fill))!important;color:#af52de!important
    }
    .os-nav-entry[data-nav-section="workspace"]>.os-nav-items>a[href*="/workspace/drafts"] .dashboard-icon{
      background:color-mix(in srgb,#8e8e93 14%,var(--fill))!important;color:#8e8e93!important
    }
    .os-nav-entry[data-nav-section="workspace"]>.os-nav-items>a[href*="/workspace/tasks"] .dashboard-icon{
      background:color-mix(in srgb,#34c759 13%,var(--fill))!important;color:#34c759!important
    }
    .os-nav-entry[data-nav-section="workspace"]>.os-nav-items>a[aria-current="page"]{
      color:var(--text)!important;
      background:
        linear-gradient(90deg,color-mix(in srgb,var(--primary) 10%,var(--fill)),color-mix(in srgb,var(--primary) 4%,var(--fill)))!important;
      font-weight:680!important;
      box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 14%,transparent)!important;
    }
    .os-nav-entry[data-nav-section="workspace"]>.os-nav-items>a[aria-current="page"]::before{
      content:"";
      position:absolute;
      left:0;
      top:9px;
      bottom:9px;
      width:3px;
      border-radius:0 3px 3px 0;
      background:var(--primary);
      box-shadow:0 0 10px color-mix(in srgb,var(--primary) 30%,transparent);
    }
    .os-nav-entry[data-nav-section="workspace"]>.os-nav-items>a[aria-current="page"]::after{
      color:var(--primary);
      opacity:.9;
    }
    @media(hover:hover) and (pointer:fine){
      .os-nav-entry[data-nav-section="workspace"]>.os-nav-items>a:hover{
        color:var(--text)!important;
        background:color-mix(in srgb,var(--primary) 5%,var(--fill))!important;
      }
      .os-nav-entry[data-nav-section="workspace"]>.os-nav-items>a:hover::after{
        transform:translate(1px,-50%);
        color:var(--primary);
        opacity:.9;
      }
    }

    /* WORKSPACE_HUB_V2 — replace stale placeholder copy with five real destinations */
    .workspace-hub{display:grid;gap:16px;min-width:0}
    .workspace-hub-hero{
      position:relative;
      overflow:hidden;
      display:grid;
      grid-template-columns:minmax(0,1fr) auto;
      gap:24px;
      align-items:end;
      padding:28px;
      border:1px solid color-mix(in srgb,var(--border) 82%,transparent);
      border-radius:24px;
      background:
        radial-gradient(520px 240px at 92% 0%,color-mix(in srgb,var(--primary) 15%,transparent),transparent 72%),
        linear-gradient(145deg,color-mix(in srgb,var(--primary) 5%,var(--card)),var(--card));
      box-shadow:inset 0 1px 0 color-mix(in srgb,#fff 20%,transparent),0 18px 46px rgba(0,0,0,.065);
    }
    .workspace-hub-hero-copy>span{display:block;color:var(--primary);font-size:11px;font-weight:720;letter-spacing:.08em;text-transform:uppercase}
    .workspace-hub-hero h2{margin:7px 0 9px;font-size:clamp(32px,3.2vw,44px);line-height:1;letter-spacing:-.05em}
    .workspace-hub-hero p{max-width:720px;margin:0;color:var(--muted);font-size:13px;line-height:1.6}
    .workspace-hub-summary{display:grid;grid-template-columns:repeat(2,minmax(92px,1fr));gap:8px}
    .workspace-hub-summary>div{min-width:92px;padding:11px 12px;border-radius:13px;background:color-mix(in srgb,var(--fill) 84%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--border) 74%,transparent)}
    .workspace-hub-summary strong,.workspace-hub-summary span{display:block}.workspace-hub-summary strong{font-size:18px;letter-spacing:-.03em}.workspace-hub-summary span{margin-top:2px;color:var(--muted);font-size:9px}
    .workspace-hub-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
    .workspace-hub-grid .os-hub-card{min-height:168px!important}
    .workspace-hub-grid .os-hub-card.is-featured{grid-column:span 2!important;min-height:188px!important}
    .workspace-hub-grid .os-hub-card:nth-child(1) .os-hub-icon{color:#0a84ff;background:color-mix(in srgb,#0a84ff 13%,var(--surface-soft))}
    .workspace-hub-grid .os-hub-card:nth-child(2) .os-hub-icon{color:#ff9f0a;background:color-mix(in srgb,#ff9f0a 13%,var(--surface-soft))}
    .workspace-hub-grid .os-hub-card:nth-child(3) .os-hub-icon{color:#af52de;background:color-mix(in srgb,#af52de 13%,var(--surface-soft))}
    .workspace-hub-grid .os-hub-card:nth-child(4) .os-hub-icon{color:#8e8e93;background:color-mix(in srgb,#8e8e93 13%,var(--surface-soft))}
    .workspace-hub-grid .os-hub-card:nth-child(5) .os-hub-icon{color:#34c759;background:color-mix(in srgb,#34c759 13%,var(--surface-soft))}

    /* WORKSPACE_SURFACES_V2 — visually unify the five real workspace modules without changing behavior */
    body.os-shell .workbench,
    body.os-shell .projects-workspace,
    body.os-shell .lab-shell,
    body.os-shell .drafts-workspace,
    body.os-shell .tasks-workspace{gap:16px!important}
    body.os-shell .workbench-hero,
    body.os-shell .projects-hero,
    body.os-shell .lab-hero,
    body.os-shell .drafts-hero,
    body.os-shell .tasks-hero{
      border-radius:23px!important;
      border-color:color-mix(in srgb,var(--border) 82%,transparent)!important;
      background:
        radial-gradient(460px 220px at 94% 0%,color-mix(in srgb,var(--primary) 11%,transparent),transparent 72%),
        linear-gradient(145deg,color-mix(in srgb,var(--primary) 4%,var(--card)),var(--card))!important;
      box-shadow:inset 0 1px 0 color-mix(in srgb,#fff 18%,transparent),0 14px 38px rgba(0,0,0,.055)!important;
    }
    body.os-shell .workbench-hero h2,
    body.os-shell .projects-hero h2,
    body.os-shell .lab-hero h2,
    body.os-shell .drafts-hero h2,
    body.os-shell .tasks-hero h2{
      font-size:clamp(28px,2.8vw,36px)!important;
      line-height:1.02!important;
      letter-spacing:-.045em!important;
    }
    body.os-shell .workbench-stats>a,
    body.os-shell .projects-overview,
    body.os-shell .projects-filter-panel,
    body.os-shell .tasks-overview,
    body.os-shell .tasks-filter-panel,
    body.os-shell .lab-controls,
    body.os-shell .lab-registry-note{
      border-radius:17px!important;
      border-color:color-mix(in srgb,var(--border) 80%,transparent)!important;
      background:color-mix(in srgb,var(--card) 90%,transparent)!important;
      box-shadow:inset 0 1px 0 color-mix(in srgb,#fff 14%,transparent),0 8px 22px rgba(0,0,0,.035)!important;
    }
    body.os-shell .workbench-panel,
    body.os-shell .projects-list>article,
    body.os-shell .tasks-list>article{
      border-radius:18px!important;
      border-color:color-mix(in srgb,var(--border) 82%,transparent)!important;
      box-shadow:0 8px 22px rgba(0,0,0,.025)!important;
    }
    body.os-shell .drafts-shell{
      border-radius:22px!important;
      border-color:color-mix(in srgb,var(--border) 82%,transparent)!important;
      box-shadow:0 14px 34px rgba(0,0,0,.045)!important;
    }
    @media(max-width:900px){
      .workspace-hub-hero{grid-template-columns:1fr}
      .workspace-hub-summary{grid-template-columns:repeat(2,minmax(0,1fr));width:min(100%,360px)}
      .workspace-hub-grid{grid-template-columns:1fr!important}
      .workspace-hub-grid .os-hub-card.is-featured{grid-column:auto!important}
    }
    @media(max-width:760px){
      .os-nav-entry[data-nav-section="workspace"]{padding:5px!important;border-radius:16px!important}
      .os-nav-entry[data-nav-section="workspace"]>.os-nav-title{min-height:48px!important}
      .os-nav-entry[data-nav-section="workspace"]>.os-nav-items>a{min-height:39px!important;font-size:12px!important}
      .workspace-hub-hero{padding:20px}
    }

    /* AWARD_DASHBOARD_PASS_2026 — editorial hierarchy + restrained motion */
    .dashboard-welcome{
      position:relative;
      isolation:isolate;
      overflow:hidden;
      grid-template-columns:minmax(0,1.35fr) minmax(300px,.65fr);
      gap:clamp(22px,3vw,46px);
      min-height:310px;
      padding:clamp(28px,3.4vw,46px);
      border-radius:28px;
      border-color:color-mix(in srgb,var(--border) 82%,transparent);
      background:
        linear-gradient(145deg,color-mix(in srgb,var(--card) 96%,#fff 4%),color-mix(in srgb,var(--surface) 88%,var(--primary) 2%));
      box-shadow:
        inset 0 1px 0 color-mix(in srgb,#fff 24%,transparent),
        0 22px 60px rgba(0,0,0,.075);
    }
    .dashboard-welcome::before{
      content:"";
      position:absolute;
      width:min(520px,52vw);
      aspect-ratio:1;
      right:-18%;
      top:-62%;
      border-radius:50%;
      background:radial-gradient(circle,color-mix(in srgb,var(--primary) 14%,transparent),transparent 64%);
      filter:blur(4px);
      z-index:-1;
      pointer-events:none;
    }
    .dashboard-welcome::after{
      content:"";
      position:absolute;
      inset:0;
      z-index:-1;
      pointer-events:none;
      background:linear-gradient(118deg,transparent 18%,color-mix(in srgb,#fff 4%,transparent) 48%,transparent 72%);
      transform:translateX(-32%);
      opacity:.75;
    }
    .dashboard-welcome-copy{align-self:end;max-width:760px}
    .dashboard-eyebrow{
      font-size:11px;
      font-weight:720;
      letter-spacing:.14em;
      text-transform:uppercase;
      color:color-mix(in srgb,var(--muted) 86%,var(--primary) 14%);
    }
    .dashboard-welcome h2{
      max-width:10ch;
      margin:10px 0 14px;
      font-size:clamp(42px,5.6vw,76px);
      line-height:.94;
      letter-spacing:-.065em;
      font-weight:780;
      text-wrap:balance;
    }
    .dashboard-welcome p{
      max-width:56ch;
      font-size:clamp(15px,1.4vw,18px);
      line-height:1.62;
    }
    .dashboard-welcome-actions{
      margin-top:28px;
      display:flex;
      flex-wrap:wrap;
      gap:10px;
    }
    .dashboard-primary-action,.dashboard-secondary-action,
    .dashboard-session-settings,.dashboard-activity-action{
      min-height:48px;
      border-radius:15px;
      padding:0 16px;
      transition:
        transform .28s var(--ease-emphasized),
        box-shadow .28s var(--ease-emphasized),
        background .2s ease,
        border-color .2s ease;
    }
    .dashboard-primary-action{
      box-shadow:0 12px 28px color-mix(in srgb,var(--primary) 20%,transparent);
    }
    @media (hover:hover) and (pointer:fine){
      .dashboard-primary-action:hover,.dashboard-secondary-action:hover,
      .dashboard-session-settings:hover,.dashboard-activity-action:hover{
        transform:translateY(-2px);
      }
      .dashboard-primary-action:hover{
        box-shadow:0 18px 38px color-mix(in srgb,var(--primary) 24%,transparent);
      }
    }
    .dashboard-today-card{
      align-self:stretch;
      display:flex;
      flex-direction:column;
      justify-content:space-between;
      min-height:220px;
      padding:22px;
      border-radius:24px;
      background:color-mix(in srgb,var(--glass-heavy) 88%,transparent);
      border:1px solid color-mix(in srgb,var(--border) 90%,transparent);
      -webkit-backdrop-filter:blur(24px) saturate(160%);
      backdrop-filter:blur(24px) saturate(160%);
      box-shadow:
        inset 0 1px 0 color-mix(in srgb,#fff 20%,transparent),
        0 16px 36px rgba(0,0,0,.08);
    }
    .dashboard-today-main{align-items:flex-start}
    .dashboard-today-copy strong{
      display:block;
      margin-top:5px;
      font-size:clamp(42px,5vw,64px);
      line-height:.95;
      letter-spacing:-.065em;
      font-variant-numeric:tabular-nums;
    }
    .dashboard-today-copy span{margin-top:10px;line-height:1.4}
    .dashboard-today-meta{
      grid-template-columns:1fr;
      gap:8px;
    }
    .dashboard-today-meta>div{
      min-height:58px;
      padding:10px 12px;
      border-radius:14px;
      background:color-mix(in srgb,var(--fill) 78%,transparent);
      box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--border) 82%,transparent);
    }

    .dashboard-home-wishes{
      margin-top:18px;
      padding:clamp(24px,3vw,38px);
      gap:clamp(22px,4vw,54px);
      border-radius:28px;
      border-color:color-mix(in srgb,var(--border) 82%,transparent);
      background:
        radial-gradient(620px 360px at 104% 0%,color-mix(in srgb,#ff9f0a 7%,transparent),transparent 68%),
        var(--card);
      box-shadow:0 14px 40px rgba(0,0,0,.055);
    }
    .dashboard-home-wishes-copy h2,
    .dashboard-section-head h2{
      letter-spacing:-.045em;
    }
    .dashboard-home-wishes-copy h2{
      margin:8px 0 12px;
      font-size:clamp(30px,3.6vw,48px);
      line-height:1;
    }
    .dashboard-home-wishes-builder{
      padding:18px;
      border-radius:22px;
      background:color-mix(in srgb,var(--fill) 72%,transparent);
      box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--border) 82%,transparent);
    }
    .dashboard-home-wish-type{
      min-height:72px;
      border-radius:17px;
      transition:
        transform .24s var(--ease-standard),
        background .18s ease,
        box-shadow .2s ease;
    }
    @media (hover:hover) and (pointer:fine){
      .dashboard-home-wish-type:hover{transform:translateY(-1px)}
    }
    .dashboard-home-wish-type.is-active{
      box-shadow:
        inset 0 0 0 1px color-mix(in srgb,var(--primary) 42%,transparent),
        0 8px 22px color-mix(in srgb,var(--primary) 8%,transparent);
    }

    .dashboard-section{margin-top:34px}
    .dashboard-section-head{margin-bottom:14px}
    .dashboard-section-head small{
      font-size:11px;
      letter-spacing:.12em;
      text-transform:uppercase;
    }
    .dashboard-section-head h2{
      margin-top:5px;
      font-size:clamp(26px,3vw,36px);
      line-height:1;
    }
    .dashboard-shortcuts{
      display:grid;
      grid-template-columns:repeat(3,minmax(0,1fr));
      gap:12px;
    }
    .dashboard-shortcut{
      min-height:94px;
      padding:15px;
      border-radius:19px;
      background:color-mix(in srgb,var(--card) 96%,transparent);
      border-color:color-mix(in srgb,var(--border) 88%,transparent);
      box-shadow:0 8px 24px rgba(0,0,0,.045);
      transition:
        transform .3s var(--ease-emphasized),
        box-shadow .3s var(--ease-emphasized),
        border-color .2s ease,
        background .2s ease;
    }
    .dashboard-shortcut strong{
      font-size:15px;
      letter-spacing:-.025em;
    }
    .dashboard-shortcut small{margin-top:5px;line-height:1.42}
    @media (hover:hover) and (pointer:fine){
      .dashboard-shortcut:hover{
        transform:translateY(-3px);
        border-color:var(--border-strong);
        box-shadow:0 18px 40px rgba(0,0,0,.08);
      }
      .dashboard-shortcut:hover>.dashboard-icon{transform:scale(1.06)}
    }
    .dashboard-shortcut>.dashboard-icon{
      transition:transform .3s var(--ease-emphasized);
    }

    .dashboard-split{
      margin-top:18px;
      gap:16px;
      grid-template-columns:minmax(0,1.2fr) minmax(300px,.8fr);
    }
    .dashboard-module-card,.dashboard-session-card,.dashboard-activity-card{
      border-radius:24px!important;
    }
    .dashboard-module-list>a{
      min-height:62px;
      border-radius:14px;
      transition:
        transform .22s var(--ease-standard),
        background .18s ease;
    }
    @media (hover:hover) and (pointer:fine){
      .dashboard-module-list>a:hover{transform:translateX(3px)}
    }
    .dashboard-session-facts>div{
      min-height:66px;
      border-radius:15px;
    }
    .dashboard-activity-card{margin-top:18px}
    .dashboard-empty-activity{
      min-height:250px;
      padding:38px 24px;
      border-radius:18px;
      background:
        radial-gradient(360px 220px at 50% 0%,color-mix(in srgb,var(--primary) 5%,transparent),transparent 72%),
        color-mix(in srgb,var(--fill) 60%,transparent);
    }

    @keyframes award-dashboard-enter{
      from{opacity:0;transform:translateY(12px);filter:blur(3px)}
      to{opacity:1;transform:none;filter:none}
    }
    .dashboard-welcome,
    .dashboard-home-wishes,
    .dashboard-section,
    .dashboard-split,
    .dashboard-activity-card{
      animation:award-dashboard-enter .64s var(--ease-emphasized) both;
    }
    .dashboard-home-wishes{animation-delay:.05s}
    .dashboard-section{animation-delay:.09s}
    .dashboard-split{animation-delay:.13s}
    .dashboard-activity-card{animation-delay:.17s}

    @media (max-width:1260px){
      .dashboard-welcome{grid-template-columns:minmax(0,1fr) 300px}
      .dashboard-shortcuts{grid-template-columns:repeat(2,minmax(0,1fr))}
    }
    @media (max-width:860px){
      .dashboard-welcome{
        grid-template-columns:1fr;
        min-height:0;
        gap:22px;
      }
      .dashboard-welcome-copy{align-self:auto}
      .dashboard-welcome h2{max-width:12ch}
      .dashboard-today-card{min-height:180px}
      .dashboard-today-meta{grid-template-columns:repeat(2,minmax(0,1fr))}
      .dashboard-home-wishes{grid-template-columns:1fr}
      .dashboard-split{grid-template-columns:1fr}
    }
    @media (max-width:560px){
      .dashboard-welcome,
      .dashboard-home-wishes{
        margin-left:-3px;
        margin-right:-3px;
        padding:22px 18px;
        border-radius:22px;
      }
      .dashboard-welcome{gap:18px}
      .dashboard-welcome h2{
        font-size:clamp(38px,14vw,56px);
        max-width:9ch;
      }
      .dashboard-welcome p{font-size:15px}
      .dashboard-welcome-actions{display:grid;grid-template-columns:1fr;margin-top:22px}
      .dashboard-primary-action,.dashboard-secondary-action{width:100%}
      .dashboard-today-card{padding:18px;border-radius:19px}
      .dashboard-today-copy strong{font-size:48px}
      .dashboard-home-wishes-builder{padding:12px;border-radius:18px}
      .dashboard-shortcuts{grid-template-columns:1fr;gap:9px}
      .dashboard-shortcut{min-height:82px;border-radius:16px}
      .dashboard-section{margin-top:28px}
    }
    @media (prefers-reduced-motion:reduce){
      .dashboard-welcome,.dashboard-home-wishes,.dashboard-section,.dashboard-split,.dashboard-activity-card{
        animation:none!important;
      }
      .dashboard-primary-action,.dashboard-secondary-action,.dashboard-session-settings,
      .dashboard-activity-action,.dashboard-shortcut,.dashboard-shortcut>.dashboard-icon,
      .dashboard-home-wish-type,.dashboard-module-list>a{
        transition:none!important;
        transform:none!important;
      }
    }


    /* DASHBOARD_FOCUS_BENTO_2026 — large, asymmetric primary destinations */
    .dashboard-focus{
      display:grid;
      grid-template-columns:minmax(0,1.35fr) minmax(300px,.65fr);
      gap:16px;
      margin-top:18px;
    }
    .dashboard-focus a{color:var(--text);text-decoration:none}
    .dashboard-focus-primary{
      position:relative;
      isolation:isolate;
      overflow:hidden;
      display:flex;
      flex-direction:column;
      min-height:360px;
      padding:clamp(26px,3vw,40px);
      border:1px solid color-mix(in srgb,var(--primary) 22%,var(--border));
      border-radius:28px;
      background:
        radial-gradient(520px 360px at 96% 4%,color-mix(in srgb,var(--primary) 24%,transparent),transparent 72%),
        linear-gradient(150deg,color-mix(in srgb,var(--card) 95%,var(--primary) 5%),var(--card));
      box-shadow:0 22px 58px rgba(0,0,0,.08),inset 0 1px 0 color-mix(in srgb,#fff 20%,transparent);
      transition:transform .34s var(--ease-emphasized),box-shadow .34s var(--ease-emphasized),border-color .22s ease;
    }
    .dashboard-focus-primary:before{
      content:"";
      position:absolute;
      inset:auto -90px -170px auto;
      width:360px;
      aspect-ratio:1;
      border-radius:50%;
      background:radial-gradient(circle,color-mix(in srgb,var(--primary) 18%,transparent),transparent 68%);
      pointer-events:none;
      z-index:-1;
    }
    .dashboard-focus-kicker{
      display:block;
      color:var(--primary);
      font-size:11px;
      font-weight:780;
      letter-spacing:.16em;
    }
    .dashboard-focus-icon{
      display:grid;
      place-items:center;
      width:56px;
      height:56px;
      margin-top:24px;
      border-radius:18px;
      background:var(--primary);
      color:#fff;
      box-shadow:0 14px 30px color-mix(in srgb,var(--primary) 24%,transparent);
    }
    .dashboard-focus-icon .dashboard-icon{width:28px;height:28px;background:transparent!important;color:inherit!important}
    .dashboard-focus-icon .dashboard-icon svg{width:28px;height:28px}
    .dashboard-focus-primary>div{margin-top:auto;max-width:640px}
    .dashboard-focus-primary h3{
      margin:0;
      max-width:12ch;
      font-size:clamp(36px,4.2vw,62px);
      line-height:.96;
      letter-spacing:-.06em;
      font-weight:770;
    }
    .dashboard-focus-primary p{
      max-width:48ch;
      margin:13px 0 0;
      color:var(--muted);
      font-size:14px;
      line-height:1.58;
    }
    .dashboard-focus-arrow{
      position:absolute;
      right:22px;
      top:22px;
      display:grid;
      place-items:center;
      width:42px;
      height:42px;
      border-radius:50%;
      background:color-mix(in srgb,var(--fill) 86%,transparent);
      box-shadow:inset 0 0 0 1px var(--border);
      font-size:21px;
      transition:transform .28s var(--ease-emphasized),background .2s ease;
    }
    .dashboard-focus-side{display:grid;grid-template-rows:1fr 1fr;gap:16px}
    .dashboard-focus-card{
      position:relative;
      overflow:hidden;
      display:flex;
      flex-direction:column;
      min-height:172px;
      padding:22px;
      border:1px solid var(--border);
      border-radius:24px;
      background:var(--card);
      box-shadow:0 12px 34px rgba(0,0,0,.055),inset 0 1px 0 color-mix(in srgb,#fff 16%,transparent);
      transition:transform .3s var(--ease-emphasized),box-shadow .3s var(--ease-emphasized),border-color .2s ease;
    }
    .dashboard-focus-card.is-theme{
      background:
        radial-gradient(360px 220px at 100% 0%,color-mix(in srgb,var(--primary) 14%,transparent),transparent 74%),
        var(--card);
    }
    .dashboard-focus-card-top{display:flex;align-items:center;justify-content:space-between;gap:12px}
    .dashboard-focus-card-top>.dashboard-icon{
      width:38px;
      height:38px;
      border-radius:12px;
      background:var(--fill);
      color:var(--primary);
      box-shadow:inset 0 0 0 1px var(--border);
    }
    .dashboard-focus-card-top>.dashboard-icon svg{width:19px;height:19px}
    .dashboard-focus-card-top>b{font-size:18px;color:var(--quiet);font-weight:500}
    .dashboard-focus-card>div:last-child{margin-top:auto}
    .dashboard-focus-card small{display:block;color:var(--muted);font-size:10px;font-weight:760;letter-spacing:.12em}
    .dashboard-focus-card h3{margin:5px 0 0;font-size:24px;letter-spacing:-.045em}
    .dashboard-focus-card p{margin:6px 0 0;font-size:11.5px;line-height:1.46;color:var(--muted)}
    .dashboard-focus-swatches{display:flex;gap:6px;margin:14px 0 4px}
    .dashboard-focus-swatches i{width:16px;height:16px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(255,255,255,.22)}
    .dashboard-focus-swatches i:nth-child(1){background:#4964d8}.dashboard-focus-swatches i:nth-child(2){background:#2a9d8f}.dashboard-focus-swatches i:nth-child(3){background:#3a9d72}.dashboard-focus-swatches i:nth-child(4){background:#d49a2a}.dashboard-focus-swatches i:nth-child(5){background:#7559d9}
    @media(hover:hover) and (pointer:fine){
      .dashboard-focus-primary:hover{transform:translateY(-4px);border-color:color-mix(in srgb,var(--primary) 42%,var(--border));box-shadow:0 30px 72px rgba(0,0,0,.105)}
      .dashboard-focus-primary:hover .dashboard-focus-arrow{transform:rotate(8deg) scale(1.06);background:color-mix(in srgb,var(--primary) 12%,var(--fill))}
      .dashboard-focus-card:hover{transform:translateY(-3px);border-color:var(--border-strong);box-shadow:0 22px 48px rgba(0,0,0,.09)}
    }
    @media(max-width:980px){
      .dashboard-focus{grid-template-columns:1fr}
      .dashboard-focus-primary{min-height:310px}
      .dashboard-focus-side{grid-template-columns:1fr 1fr;grid-template-rows:none}
    }
    @media(max-width:620px){
      .dashboard-focus{gap:10px}
      .dashboard-focus-primary{min-height:280px;padding:22px 18px;border-radius:22px}
      .dashboard-focus-primary h3{font-size:clamp(36px,13vw,50px)}
      .dashboard-focus-side{grid-template-columns:1fr}
      .dashboard-focus-card{min-height:160px;border-radius:20px}
    }
    @media(prefers-reduced-motion:reduce){
      .dashboard-focus-primary,.dashboard-focus-card,.dashboard-focus-arrow{transition:none!important;transform:none!important}
    }

  `;
}
