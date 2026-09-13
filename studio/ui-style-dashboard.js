export function dashboardStyles() {
  return `    /* DASHBOARD_APPLE_V2 */
    .os-main:has(.dashboard-welcome) .os-hero{margin-bottom:18px}
    .os-main:has(.dashboard-welcome) .os-hero h1{font-size:clamp(38px,4.6vw,58px)}

    .dashboard-welcome{
      position:relative;
      display:grid;
      grid-template-columns:minmax(0,1fr) minmax(220px,300px);
      gap:18px;
      min-height:250px;
      padding:28px;
      overflow:hidden;
      border:1px solid color-mix(in srgb,var(--primary) 17%,var(--border));
      border-radius:28px;
      background:
        radial-gradient(circle at 86% 12%,color-mix(in srgb,var(--primary) 25%,transparent),transparent 34%),
        radial-gradient(circle at 18% 120%,color-mix(in srgb,#af52de 16%,transparent),transparent 38%),
        color-mix(in srgb,var(--card) 82%,transparent);
      -webkit-backdrop-filter:blur(24px) saturate(160%);
      backdrop-filter:blur(24px) saturate(160%);
      box-shadow:0 18px 44px rgba(0,0,0,.075),inset 0 1px 0 color-mix(in srgb,#fff 28%,transparent);
    }
    .dashboard-welcome::after{
      content:"";
      position:absolute;
      right:-90px;
      bottom:-130px;
      width:310px;
      height:310px;
      border-radius:50%;
      background:linear-gradient(135deg,color-mix(in srgb,var(--primary) 18%,transparent),color-mix(in srgb,#af52de 16%,transparent));
      filter:blur(8px);
      pointer-events:none;
    }
    .dashboard-welcome-copy{position:relative;z-index:1;align-self:center}
    .dashboard-eyebrow{
      display:inline-flex;
      align-items:center;
      min-height:28px;
      padding:0 11px;
      border-radius:999px;
      color:var(--primary);
      background:color-mix(in srgb,var(--primary) 11%,var(--surface-soft));
      font-size:12px;
      font-weight:780;
    }
    .dashboard-welcome h2{
      margin:14px 0 9px;
      font-size:clamp(34px,4.2vw,52px);
      line-height:1.02;
      letter-spacing:-.04em;
    }
    .dashboard-welcome p{
      max-width:760px;
      margin:0;
      color:var(--muted);
      font-size:15px;
      line-height:1.62;
    }
    .dashboard-welcome-actions{
      display:flex;
      flex-wrap:wrap;
      gap:9px;
      margin-top:22px;
    }
    .dashboard-primary-action,.dashboard-secondary-action{
      min-height:42px;
      display:inline-flex;
      align-items:center;
      gap:10px;
      padding:0 15px;
      border-radius:13px;
      color:var(--text);
      text-decoration:none;
      font-size:13px;
      font-weight:760;
      transition:transform 90ms ease,background 150ms ease,border-color 150ms ease;
      -webkit-tap-highlight-color:transparent;
    }
    .dashboard-primary-action{
      color:var(--primary-ink);
      background:var(--primary);
      box-shadow:0 8px 20px color-mix(in srgb,var(--primary) 22%,transparent);
    }
    .dashboard-secondary-action{
      border:1px solid var(--border);
      background:color-mix(in srgb,var(--surface-soft) 74%,transparent);
    }
    .dashboard-primary-action:active,.dashboard-secondary-action:active{transform:scale(.975)}
    .dashboard-primary-action span,.dashboard-secondary-action span{font-size:18px;line-height:1}

    .dashboard-today-card{
      position:relative;
      z-index:1;
      align-self:stretch;
      display:grid;
      grid-template-columns:auto minmax(0,1fr);
      gap:13px;
      align-content:end;
      min-height:170px;
      padding:18px;
      border:1px solid color-mix(in srgb,var(--border) 82%,transparent);
      border-radius:22px;
      background:color-mix(in srgb,var(--surface-soft) 66%,transparent);
      -webkit-backdrop-filter:blur(18px) saturate(145%);
      backdrop-filter:blur(18px) saturate(145%);
      box-shadow:inset 0 1px 0 color-mix(in srgb,#fff 20%,transparent);
    }
    .dashboard-icon{
      width:42px;
      height:42px;
      display:grid;
      place-items:center;
      flex:0 0 auto;
      border-radius:14px;
      color:var(--primary);
      background:color-mix(in srgb,var(--primary) 12%,var(--surface-soft));
      box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 10%,var(--border));
    }
    .dashboard-icon svg{width:21px;height:21px}
    .dashboard-today-card>div>small,.dashboard-today-card>div>strong,.dashboard-today-card>div>span{display:block}
    .dashboard-today-card>div>small{color:var(--muted);font-size:11px;font-weight:750}
    .dashboard-today-card>div>strong{margin-top:3px;font-size:32px;line-height:1;letter-spacing:-.04em}
    .dashboard-today-card>div>span{margin-top:7px;color:var(--muted);font-size:12px}

    .dashboard-section{margin-top:18px}
    .dashboard-section-head{
      display:flex;
      justify-content:space-between;
      align-items:end;
      gap:14px;
      padding:0 3px;
      margin-bottom:11px;
    }
    .dashboard-section-head.compact{margin-bottom:14px;padding:0}
    .dashboard-section-head small{display:block;color:var(--primary);font-size:11px;font-weight:780}
    .dashboard-section-head h2{margin:3px 0 0;font-size:22px;letter-spacing:-.025em}
    .dashboard-section-head>span{color:var(--muted);font-size:12px}

    .dashboard-shortcuts{
      display:grid;
      grid-template-columns:repeat(3,minmax(0,1fr));
      gap:10px;
    }
    .dashboard-shortcut{
      min-height:100px;
      display:grid;
      grid-template-columns:auto minmax(0,1fr) auto;
      gap:12px;
      align-items:center;
      padding:14px;
      color:var(--text);
      text-decoration:none;
      border:1px solid var(--border);
      border-radius:19px;
      background:color-mix(in srgb,var(--card) 84%,transparent);
      box-shadow:0 6px 18px rgba(0,0,0,.035),inset 0 1px 0 color-mix(in srgb,#fff 20%,transparent);
      transition:transform 100ms ease,border-color 150ms ease,background 150ms ease;
      -webkit-tap-highlight-color:transparent;
    }
    .dashboard-shortcut:hover{
      border-color:color-mix(in srgb,var(--primary) 28%,var(--border));
      background:color-mix(in srgb,var(--primary) 4%,var(--card));
    }
    .dashboard-shortcut:active{transform:scale(.985)}
    .dashboard-shortcut span strong,.dashboard-shortcut span small{display:block}
    .dashboard-shortcut span strong{font-size:14px}
    .dashboard-shortcut span small{margin-top:4px;color:var(--muted);font-size:11px;line-height:1.4}
    .dashboard-shortcut b{color:var(--muted);font-size:20px;font-weight:500}

    .dashboard-split{
      display:grid;
      grid-template-columns:minmax(0,1.45fr) minmax(280px,.75fr);
      gap:14px;
      margin-top:18px;
    }
    .dashboard-module-card,.dashboard-session-card,.dashboard-activity-card{border-radius:24px}
    .dashboard-module-list{display:grid;gap:8px}
    .dashboard-module-list>a{
      display:grid;
      grid-template-columns:auto minmax(0,1fr) auto auto;
      gap:12px;
      align-items:center;
      min-height:72px;
      padding:10px 11px;
      color:var(--text);
      text-decoration:none;
      border-radius:15px;
      background:var(--surface-soft);
      transition:transform 90ms ease,background 150ms ease;
    }
    .dashboard-module-list>a:hover{background:color-mix(in srgb,var(--primary) 6%,var(--surface-soft))}
    .dashboard-module-list>a:active{transform:scale(.992)}
    .dashboard-module-list span strong,.dashboard-module-list span small{display:block}
    .dashboard-module-list span strong{font-size:14px}
    .dashboard-module-list span small{margin-top:3px;color:var(--muted);font-size:11px;line-height:1.4}
    .dashboard-module-list em{
      min-height:24px;
      display:inline-flex;
      align-items:center;
      padding:0 9px;
      border-radius:999px;
      color:var(--primary);
      background:color-mix(in srgb,var(--primary) 10%,var(--card));
      font-size:10px;
      font-style:normal;
      font-weight:780;
      white-space:nowrap;
    }
    .dashboard-module-list b{color:var(--muted);font-size:19px;font-weight:500}

    .dashboard-session-card{display:flex;flex-direction:column}
    .dashboard-session-facts{display:grid;gap:8px;flex:1}
    .dashboard-session-facts>div{
      display:grid;
      grid-template-columns:auto minmax(0,1fr);
      gap:11px;
      align-items:center;
      padding:10px;
      border-radius:15px;
      background:var(--surface-soft);
    }
    .dashboard-session-facts .dashboard-icon{width:38px;height:38px;border-radius:12px}
    .dashboard-session-facts .dashboard-icon svg{width:18px;height:18px}
    .dashboard-session-facts span small,.dashboard-session-facts span strong{display:block}
    .dashboard-session-facts span small{color:var(--muted);font-size:10px}
    .dashboard-session-facts span strong{margin-top:2px;font-size:13px}
    .dashboard-session-settings{
      min-height:42px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      margin-top:10px;
      padding:0 13px;
      border-radius:13px;
      color:var(--text);
      text-decoration:none;
      background:color-mix(in srgb,var(--primary) 8%,var(--surface-soft));
      font-size:12px;
      font-weight:760;
    }

    .dashboard-activity-card{margin-top:14px}
    .dashboard-empty-activity{
      display:grid;
      place-items:center;
      min-height:170px;
      padding:22px;
      text-align:center;
      border:1px dashed color-mix(in srgb,var(--border) 82%,transparent);
      border-radius:18px;
      background:color-mix(in srgb,var(--surface-soft) 46%,transparent);
    }
    .dashboard-empty-activity>span{
      width:9px;
      height:9px;
      margin-bottom:10px;
      border-radius:50%;
      background:var(--primary);
      box-shadow:0 0 0 7px color-mix(in srgb,var(--primary) 10%,transparent);
    }
    .dashboard-empty-activity strong{font-size:15px}
    .dashboard-empty-activity p{max-width:680px;margin:7px 0 0;color:var(--muted);font-size:12px;line-height:1.55}
    .dashboard-empty-activity a{margin-top:12px;color:var(--primary);text-decoration:none;font-size:12px;font-weight:760}
    .dashboard-empty-activity b{font-size:16px}

    @media(max-width:1080px){
      .dashboard-shortcuts{grid-template-columns:repeat(2,minmax(0,1fr))}
      .dashboard-split{grid-template-columns:1fr}
    }
    @media(max-width:760px){
      .dashboard-welcome{grid-template-columns:1fr;padding:20px;border-radius:23px}
      .dashboard-today-card{min-height:120px}
      .dashboard-shortcuts{grid-template-columns:1fr}
      .dashboard-module-list>a{grid-template-columns:auto minmax(0,1fr) auto}
      .dashboard-module-list em{display:none}
    }
    @media(prefers-reduced-motion:reduce){
      .dashboard-primary-action,.dashboard-secondary-action,.dashboard-shortcut,.dashboard-module-list>a{transition:none!important}
      .dashboard-primary-action:active,.dashboard-secondary-action:active,.dashboard-shortcut:active,.dashboard-module-list>a:active{transform:none!important}
    }
    @media(prefers-reduced-transparency:reduce){
      .dashboard-welcome,.dashboard-today-card{background:var(--card)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
    }
    @media(prefers-contrast:more){
      .dashboard-welcome,.dashboard-shortcut,.dashboard-module-list>a,.dashboard-empty-activity{border-color:var(--text)}
    }`;
}
