export function profileStyles() {
  return `    /* PROFILE_HOME_V3 */
    .profile-home{display:grid;gap:14px}
    .profile-cover{position:relative;min-height:210px;border-radius:22px;overflow:hidden;background:linear-gradient(135deg,#1d7fff 0%,#7d62ff 52%,#ff6ea8 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.28)}
    .profile-cover[data-cover-style="sky"],[data-cover-style="sky"]{background:linear-gradient(135deg,#5ac8fa,#007aff)}
    .profile-cover[data-cover-style="sunset"],[data-cover-style="sunset"]{background:linear-gradient(135deg,#ff9f0a,#ff375f 55%,#af52de)}
    .profile-cover[data-cover-style="grape"],[data-cover-style="grape"]{background:linear-gradient(135deg,#5856d6,#af52de)}
    .profile-cover[data-cover-style="graphite"],[data-cover-style="graphite"]{background:linear-gradient(135deg,#3a3a3c,#1c1c1e)}
    .profile-cover[data-cover-style="mint"],[data-cover-style="mint"]{background:linear-gradient(135deg,#30d158,#64d2ff)}
    .profile-cover-noise{position:absolute;inset:0;background:radial-gradient(circle at 18% 15%,rgba(255,255,255,.34),transparent 28%),radial-gradient(circle at 82% 72%,rgba(255,255,255,.16),transparent 32%);mix-blend-mode:screen;pointer-events:none}
    .profile-cover-actions{position:absolute;top:16px;right:16px}
    .profile-pill-button{width:auto;min-height:38px;margin:0;padding:0 14px;border:1px solid rgba(255,255,255,.32);border-radius:999px;background:rgba(255,255,255,.22);color:#fff;-webkit-backdrop-filter:blur(18px) saturate(160%);backdrop-filter:blur(18px) saturate(160%);font-size:13px;font-weight:680;box-shadow:none}
    .profile-pill-button:hover{background:rgba(255,255,255,.28);filter:none}
    .profile-pill-secondary{border-color:var(--border);background:var(--fill);color:var(--text);-webkit-backdrop-filter:none;backdrop-filter:none}
    .profile-pill-secondary:hover{background:var(--secondary)}
    .profile-identity{display:grid;grid-template-columns:auto minmax(0,1fr);gap:18px;align-items:end;margin:-64px 24px 0;position:relative;z-index:2}
    .profile-avatar-large{width:116px!important;height:116px!important;border-radius:50%!important;border:5px solid color-mix(in srgb,var(--surface) 94%,transparent);font-size:42px!important;box-shadow:0 14px 34px rgba(0,0,0,.18)!important}
    .profile-identity-copy{padding-bottom:4px;min-width:0}
    .profile-name-row{display:flex;align-items:center;gap:8px}
    .profile-name-row h2{margin:0;font-size:28px;letter-spacing:-.035em}
    .profile-name-lock{font-size:13px;opacity:.5}
    .profile-identity-copy>p{margin:4px 0 0;color:var(--muted)}
    .profile-signature{font-size:14px!important;color:var(--text)!important;max-width:760px}
    .profile-home-grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(320px,.9fr);gap:14px}
    .profile-section-card{padding:19px;border:1px solid var(--border);border-radius:19px;background:color-mix(in srgb,var(--surface) 76%,transparent);box-shadow:0 8px 26px rgba(0,0,0,.045)}
    .profile-section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}
    .profile-section-head h3{margin:3px 0 0;font-size:18px;letter-spacing:-.02em}
    .profile-section-head p{margin:7px 0 0;font-size:13px}
    .profile-eyebrow{display:block;color:var(--muted);font-size:11px;font-weight:680}
    .profile-bio{min-height:48px;margin:16px 0;color:var(--text);font-size:14px;line-height:1.55;white-space:pre-wrap}
    .profile-meta-row{display:flex;flex-wrap:wrap;gap:8px}
    .profile-presence,.profile-location{display:inline-flex;align-items:center;min-height:30px;padding:0 10px;border-radius:999px;background:var(--fill);color:var(--muted);font-size:12px;font-weight:620}
    .profile-interest-list{display:flex;flex-wrap:wrap;gap:7px;margin-top:14px}
    .profile-interest-list>span{padding:7px 10px;border-radius:999px;background:var(--fill);color:var(--text);font-size:12px}
    .profile-interest-list .profile-interest-empty{color:var(--muted)}
    .profile-quick-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:15px}
    .profile-quick-grid a{display:grid;grid-template-columns:34px 1fr;grid-template-rows:auto auto;column-gap:9px;align-items:center;padding:11px;border-radius:14px;background:var(--fill);color:var(--text);text-decoration:none;transition:background .13s ease,transform .1s ease}
    .profile-quick-grid a:hover{background:var(--secondary)}.profile-quick-grid a:active{transform:scale(.985)}
    .profile-quick-grid a>span{grid-row:1/-1;display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:color-mix(in srgb,var(--primary) 14%,transparent);color:var(--primary);font-weight:800}
    .profile-quick-grid strong{font-size:13px}.profile-quick-grid small{color:var(--muted);font-size:11px}
    .profile-link-list{display:grid;gap:8px;margin-top:15px}
    .profile-link-item{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:8px;padding:8px;border-radius:15px;background:var(--fill)}
    .profile-link-main{display:grid;grid-template-columns:42px minmax(0,1fr) auto;align-items:center;gap:10px;min-width:0;padding:3px;color:var(--text);text-decoration:none}
    .profile-link-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:var(--surface);box-shadow:inset 0 0 0 1px var(--border);font-size:14px;font-weight:800}
    .profile-link-copy{min-width:0}.profile-link-copy strong,.profile-link-copy small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.profile-link-copy strong{font-size:13px}.profile-link-copy strong em{font-style:normal;color:var(--warning)}.profile-link-copy small{margin-top:3px;color:var(--muted);font-size:11px}
    .profile-link-open{color:var(--muted)}
    .profile-link-actions{display:flex;gap:4px}.profile-link-actions button{width:auto;min-height:34px;margin:0;padding:0 9px;border-radius:9px;background:transparent;color:var(--muted);font-size:11px}.profile-link-actions button:hover{background:var(--secondary);color:var(--text)}
    .profile-link-empty{display:grid;place-items:center;min-height:120px;padding:20px;text-align:center;color:var(--muted)}.profile-link-empty strong{color:var(--text);font-size:14px}.profile-link-empty span{margin-top:4px;font-size:12px}
    .profile-sheet-backdrop{position:fixed;inset:0;z-index:70;background:rgba(0,0,0,.24);opacity:0;-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);transition:opacity .18s ease}.profile-sheet-backdrop.is-visible{opacity:1}
    .profile-sheet{position:fixed;top:12px;right:12px;bottom:12px;z-index:80;display:flex;flex-direction:column;width:min(480px,calc(100vw - 24px));border:1px solid var(--border);border-radius:24px;background:var(--glass-heavy);-webkit-backdrop-filter:blur(34px) saturate(180%);backdrop-filter:blur(34px) saturate(180%);box-shadow:-18px 0 60px rgba(0,0,0,.2);transform:translateX(calc(100% + 28px));opacity:.78;transition:transform .28s cubic-bezier(.2,.8,.2,1),opacity .18s ease;overflow:hidden}
    .profile-sheet.is-open{transform:none;opacity:1}.profile-sheet-grabber{display:none}
    .profile-sheet-head{display:flex;justify-content:space-between;gap:14px;align-items:center;padding:20px 20px 12px}.profile-sheet-head h3{margin:3px 0 0;font-size:22px;letter-spacing:-.03em}
    .profile-sheet-close{width:36px;height:36px;min-height:36px;margin:0;padding:0;border-radius:50%;background:var(--fill);color:var(--text);font-size:22px;font-weight:400}
    .profile-sheet-body{flex:1;overflow:auto;padding:4px 20px 22px}
    .profile-field{display:grid;gap:7px;margin-top:15px}.profile-field>span{font-size:12px;font-weight:650;color:var(--muted)}.profile-field small{color:var(--quiet);font-size:11px;line-height:1.4}
    .profile-field input,.profile-field select,.profile-field textarea{width:100%;margin:0;border:0;border-radius:12px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border);font:inherit;color:var(--text)}
    .profile-field textarea{min-height:110px;padding:12px 14px;resize:vertical;line-height:1.5}
    .profile-field input[readonly]{opacity:.72;cursor:not-allowed}
    .profile-status-editor{display:grid;grid-template-columns:1fr 64px 1.3fr;gap:7px}.profile-status-editor>*{min-width:0}
    .profile-cover-picker{display:grid;grid-template-columns:repeat(6,1fr);gap:7px}.profile-cover-picker button{width:auto;min-height:46px;margin:0;padding:3px;border:2px solid transparent;border-radius:13px;background:transparent}.profile-cover-picker button.is-selected{border-color:var(--primary)}.profile-cover-picker span{display:block;height:36px;border-radius:9px}
    .profile-pin-row{display:flex;align-items:center;gap:9px;margin-top:16px;color:var(--text);font-size:13px}.profile-pin-row input{width:auto;min-height:auto;margin:0}
    .profile-link-presets{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 10px}.profile-link-presets button{width:auto;min-height:34px;margin:0;padding:0 10px;border-radius:999px;background:var(--fill);color:var(--text);font-size:11px}
    .profile-sheet-actions{padding:12px 20px 20px;border-top:1px solid var(--hairline);background:color-mix(in srgb,var(--glass-heavy) 94%,transparent)}.profile-save-button{margin:0}
    @media(max-width:900px){.profile-home-grid{grid-template-columns:1fr}.profile-identity{margin-left:18px;margin-right:18px}}
    @media(max-width:620px){.profile-cover{min-height:160px;border-radius:18px}.profile-identity{grid-template-columns:88px minmax(0,1fr);gap:12px;margin-top:-44px}.profile-avatar-large{width:88px!important;height:88px!important;font-size:30px!important}.profile-name-row h2{font-size:22px}.profile-section-card{padding:16px}.profile-quick-grid{grid-template-columns:1fr}.profile-link-item{grid-template-columns:1fr}.profile-link-actions{justify-content:flex-end}.profile-sheet{top:auto;right:8px;left:8px;bottom:8px;width:auto;max-height:88dvh;border-radius:24px;transform:translateY(calc(100% + 20px));opacity:1}.profile-sheet-grabber{display:block;width:42px;height:5px;margin:8px auto 0;border-radius:999px;background:var(--quiet);opacity:.45}.profile-status-editor{grid-template-columns:1fr 58px}.profile-status-editor input:last-child{grid-column:1/-1}.profile-cover-picker{grid-template-columns:repeat(3,1fr)}}
    @media(prefers-reduced-motion:reduce){.profile-sheet,.profile-sheet-backdrop,.profile-link-item,.profile-quick-grid a{transition:opacity .12s ease,background .12s ease!important}}
    @media(prefers-reduced-transparency:reduce){.profile-sheet{background:var(--surface)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}.profile-pill-button{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}}
    /* PROFILE_HOME_V3_POLISH_1 */
    :root:not([data-theme="light"]) .profile-status-editor select{
      color-scheme:dark;
      background:#242426;
      color:#f5f5f7;
    }
    :root:not([data-theme="light"]) .profile-status-editor select option{
      background:#242426;
      color:#f5f5f7;
    }
    :root[data-theme="light"] .profile-status-editor select{
      color-scheme:light;
      background:rgba(118,118,128,.10);
      color:#1d1d1f;
    }
    :root[data-theme="light"] .profile-status-editor select option{
      background:#fff;
      color:#1d1d1f;
    }

    html.profile-sheet-open .top-controls{
      opacity:0!important;
      visibility:hidden!important;
      pointer-events:none!important;
      transform:translateY(-10px)!important;
    }
    .top-controls{
      transition:opacity .16s ease,transform .18s cubic-bezier(.2,.8,.2,1),visibility .16s step-end;
    }
    html:not(.profile-sheet-open) .top-controls{
      visibility:visible;
    }
    .profile-sheet{z-index:120}
    .profile-sheet-backdrop{z-index:110}
    .profile-sheet-close{
      position:relative;
      z-index:3;
      pointer-events:auto;
    }

    .profile-cover-picker{
      display:flex;
      flex-wrap:wrap;
      align-items:center;
      justify-content:flex-start;
      gap:10px;
    }
    .profile-cover-picker button{
      flex:0 0 auto;
      width:58px;
      height:48px;
      min-height:48px;
      margin:0;
      padding:4px;
      border:2px solid transparent;
      border-radius:14px;
      background:transparent;
      box-shadow:none;
    }
    .profile-cover-picker button:hover{
      background:var(--fill);
      filter:none;
      transform:none;
    }
    .profile-cover-picker button:active{transform:scale(.94)}
    .profile-cover-picker button.is-selected{
      border-color:var(--primary);
      box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 13%,transparent);
    }
    .profile-cover-picker span{
      display:block;
      width:46px;
      height:36px;
      border-radius:10px;
      border:1px solid color-mix(in srgb,#fff 20%,var(--border));
      box-shadow:inset 0 1px 0 rgba(255,255,255,.22);
    }
    .profile-cover-picker [data-cover-style="aurora"]{background:linear-gradient(135deg,#1d7fff 0%,#7d62ff 52%,#ff6ea8 100%)}
    .profile-cover-picker [data-cover-style="sky"]{background:linear-gradient(135deg,#5ac8fa,#007aff)}
    .profile-cover-picker [data-cover-style="sunset"]{background:linear-gradient(135deg,#ff9f0a,#ff375f 55%,#af52de)}
    .profile-cover-picker [data-cover-style="grape"]{background:linear-gradient(135deg,#5856d6,#af52de)}
    .profile-cover-picker [data-cover-style="graphite"]{background:linear-gradient(135deg,#636366,#1c1c1e)}
    .profile-cover-picker [data-cover-style="mint"]{background:linear-gradient(135deg,#30d158,#64d2ff)}

    .profile-identity{
      align-items:start;
      margin-top:-58px;
    }
    .profile-identity-copy{
      padding-top:72px;
      padding-bottom:0;
    }
    .profile-identity-copy>p{
      margin-top:7px;
    }
    .profile-signature{
      margin-top:10px!important;
    }

    @media(max-width:620px){
      .profile-identity{margin-top:-44px}
      .profile-identity-copy{padding-top:56px}
      .profile-cover-picker{gap:8px}
      .profile-cover-picker button{width:54px;height:46px;min-height:46px}
      .profile-cover-picker span{width:42px;height:34px}
    }
    @media(prefers-reduced-motion:reduce){
      .top-controls{transition:none!important}
    }
    /* PROFILE_HOME_V3_POLISH_2 */
    .profile-avatar-large{overflow:hidden}
    .profile-avatar-large img{width:100%;height:100%;display:block;object-fit:cover}
    .profile-cover.has-custom-background{background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important}
    .profile-media-editor{display:grid;grid-template-columns:88px minmax(0,1fr);gap:14px;align-items:center;padding:12px;border-radius:15px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border)}
    .profile-media-preview{width:88px;height:70px;border-radius:13px;background:var(--surface-soft);background-size:cover;background-position:center;overflow:hidden;box-shadow:inset 0 0 0 1px var(--border)}
    .profile-avatar-preview{width:74px;height:74px;border-radius:50%;display:grid;place-items:center;font-size:26px;font-weight:800;color:#fff;background:linear-gradient(145deg,#64a8ff,#3f7ff4)}
    .profile-avatar-preview img{width:100%;height:100%;object-fit:cover}
    .profile-background-preview[data-cover-style="aurora"]{background:linear-gradient(135deg,#1d7fff 0%,#7d62ff 52%,#ff6ea8 100%)}
    .profile-background-preview[data-cover-style="sky"]{background:linear-gradient(135deg,#5ac8fa,#007aff)}
    .profile-background-preview[data-cover-style="sunset"]{background:linear-gradient(135deg,#ff9f0a,#ff375f 55%,#af52de)}
    .profile-background-preview[data-cover-style="grape"]{background:linear-gradient(135deg,#5856d6,#af52de)}
    .profile-background-preview[data-cover-style="graphite"]{background:linear-gradient(135deg,#636366,#1c1c1e)}
    .profile-background-preview[data-cover-style="mint"]{background:linear-gradient(135deg,#30d158,#64d2ff)}
    .profile-media-copy{display:grid;gap:5px;min-width:0}.profile-media-copy strong{font-size:13px}.profile-media-copy small{color:var(--muted);font-size:11px;line-height:1.45}
    .profile-media-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:3px}
    .profile-inline-button{width:max-content;min-height:34px;margin:3px 0 0;padding:0 11px;border-radius:10px;background:var(--primary);color:#fff;font-size:11px;font-weight:680}
    .profile-inline-button.secondary{background:var(--secondary)!important;color:var(--text)!important}
    .os-nav-items a[aria-current="page"],.os-nav-title[aria-current="page"]{background:color-mix(in srgb,var(--primary) 15%,transparent);color:var(--primary)}
    @media(max-width:620px){.profile-media-editor{grid-template-columns:72px minmax(0,1fr)}.profile-media-preview{width:72px;height:58px}.profile-avatar-preview{width:64px;height:64px}}
    /* PROFILE_HOME_V3_POLISH_2_HOTFIX */
    /* PROFILE_HOME_V3_CONTROLS_HITBOX_FIX */ html.profile-sheet-open .top-controls{opacity:1!important;visibility:visible!important;pointer-events:auto!important;transform:none!important;right:calc(min(520px,92vw) + 20px)!important;z-index:130!important}.profile-sheet-head{position:relative!important;padding-right:62px!important}.profile-sheet-close{position:absolute!important;top:14px!important;right:14px!important;width:44px!important;height:44px!important;min-width:44px!important;min-height:44px!important;padding:0!important;margin:0!important;display:grid!important;place-items:center!important;border-radius:50%!important;z-index:160!important;pointer-events:auto!important;touch-action:manipulation!important;line-height:1!important}.profile-sheet-close::before{content:"";position:absolute;inset:-4px}@media(max-width:760px){html.profile-sheet-open .top-controls{right:16px!important;z-index:130!important}.profile-sheet-head{padding-right:62px!important}}    /* PROFILE_SHEET_VIEWPORT_FIX */ .profile-sheet-backdrop{position:fixed!important;inset:0!important;top:0!important;right:0!important;bottom:0!important;left:0!important;width:100vw!important;height:100vh!important;height:100dvh!important;max-width:none!important;max-height:none!important;margin:0!important;z-index:110!important}.profile-sheet-backdrop.is-visible{pointer-events:auto!important}html.profile-sheet-open,html.profile-sheet-open body{overflow:hidden!important;overscroll-behavior:none!important}
    /* PROFILE_ACCOUNT_HOME_V4 */
    body.os-shell:has(.profile-account-home) .os-hero{display:flex;justify-content:center;align-items:center!important;margin:0 auto 28px!important;text-align:center}
    body.os-shell:has(.profile-account-home) .os-hero>div{width:100%}
    body.os-shell:has(.profile-account-home) .os-hero h1{margin:0!important;font-size:clamp(25px,3vw,32px)!important;font-weight:720!important;letter-spacing:-.035em!important}
    body.os-shell:has(.profile-account-home) .os-hero>div>p{display:none!important}
    .profile-account-home{width:min(760px,100%);margin:0 auto;padding:4px 0 34px}
    .profile-account-identity{display:grid;justify-items:center;text-align:center;padding:8px 18px 26px}
    .profile-account-avatar{width:116px;height:116px;display:grid;place-items:center;overflow:hidden;border-radius:50%;background:linear-gradient(180deg,#89e5f2 0%,#1f7f92 100%);color:#fff;font-size:48px;font-weight:720;line-height:1;box-shadow:inset 0 0 0 1px rgba(255,255,255,.38),0 10px 28px rgba(0,0,0,.08)}
    .profile-account-avatar img{width:100%;height:100%;display:block;object-fit:cover}
    .profile-account-identity h2{margin:17px 0 0;font-size:30px;line-height:1.08;letter-spacing:-.04em;font-weight:730}
    .profile-account-identity p{margin:7px 0 0;color:var(--muted);font-size:16px;line-height:1.35}
    .profile-account-section{margin-top:22px}
    .profile-account-group{overflow:hidden;border-radius:24px;background:var(--card);box-shadow:0 1px 0 color-mix(in srgb,var(--border) 72%,transparent),0 14px 36px rgba(0,0,0,.035)}
    .profile-account-row{position:relative;min-height:76px;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:14px;align-items:center;padding:10px 18px;color:var(--text);text-decoration:none;transition:background .13s ease,transform .1s ease}
    .profile-account-row+.profile-account-row:before{content:"";position:absolute;left:72px;right:18px;top:0;height:1px;background:var(--hairline)}
    .profile-account-row:hover{background:var(--secondary)}
    .profile-account-row:active{transform:scale(.994)}
    .profile-account-row-icon{width:42px;height:42px;display:grid;place-items:center;border-radius:11px;color:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)}
    .profile-account-row-icon .os-hub-icon{width:42px!important;height:42px!important;display:grid!important;place-items:center!important;border:0!important;border-radius:11px!important;background:transparent!important;color:inherit!important;box-shadow:none!important}
    .profile-account-row-icon .os-hub-icon svg{width:22px!important;height:22px!important}
    .profile-account-row-icon.tone-blue{background:#0a84ff}
    .profile-account-row-icon.tone-green{background:#34c759}
    .profile-account-row-icon.tone-gray{background:#8e8e93}
    .profile-account-row-icon.tone-purple{background:#af52de}
    .profile-account-row-icon.tone-cyan{background:#32ade6}
    .profile-account-row-icon.tone-orange{background:#ff9f0a}
    .profile-account-row-copy{min-width:0}
    .profile-account-row-copy strong,.profile-account-row-copy small{display:block}
    .profile-account-row-copy strong{font-size:17px;line-height:1.25;font-weight:620;letter-spacing:-.015em}
    .profile-account-row-copy small{margin-top:4px;overflow:hidden;color:var(--muted);font-size:12px;line-height:1.35;text-overflow:ellipsis;white-space:nowrap}
    .profile-account-chevron{color:var(--quiet);font-size:28px;font-weight:420;line-height:1}
    .profile-account-footnote{margin:18px 16px 0;color:var(--muted);font-size:11px;line-height:1.55;text-align:center}
    @media(max-width:760px){
      body.os-shell:has(.profile-account-home) .os-hero{margin-bottom:20px!important}
      .profile-account-home{padding-top:0}
      .profile-account-identity{padding-top:0}
      .profile-account-avatar{width:104px;height:104px;font-size:43px}
      .profile-account-identity h2{font-size:28px}
      .profile-account-identity p{font-size:15px}
      .profile-account-section{margin-top:18px}
      .profile-account-group{border-radius:22px}
      .profile-account-row{min-height:72px;padding:9px 15px}
      .profile-account-row+.profile-account-row:before{left:68px;right:15px}
      .profile-account-row-icon,.profile-account-row-icon .os-hub-icon{width:40px!important;height:40px!important}
      .profile-account-row-copy strong{font-size:16px}
    }

    /* PROFILE_PERSONAL_INFO_V5 — minimal Apple Personal Information-inspired layout */
    body.os-shell:has(.profile-personal-info) .os-hero{
      width:min(760px,100%);
      margin:0 auto 26px!important;
      display:flex;
      justify-content:center;
      text-align:center;
    }
    body.os-shell:has(.profile-personal-info) .os-hero>div{width:100%}
    body.os-shell:has(.profile-personal-info) .os-hero h1{
      margin:0!important;
      font-size:clamp(26px,3vw,34px)!important;
      line-height:1.1!important;
      font-weight:700!important;
      letter-spacing:-.035em!important;
    }
    body.os-shell:has(.profile-personal-info) .os-hero>div>p{display:none!important}
    .profile-personal-info{
      width:min(760px,100%);
      margin:0 auto;
      padding:0 0 42px;
    }
    .profile-personal-avatar-block{
      display:grid;
      justify-items:center;
      gap:12px;
      padding:14px 0 32px;
    }
    .profile-personal-avatar{
      width:188px;
      height:188px;
      display:grid;
      place-items:center;
      overflow:hidden;
      border-radius:50%;
      background:linear-gradient(180deg,#8de6f2 0%,#1d7588 100%);
      color:#fff;
      font-size:78px;
      font-weight:720;
      line-height:1;
      box-shadow:inset 0 0 0 1px rgba(255,255,255,.38);
    }
    .profile-personal-avatar img{
      width:100%;
      height:100%;
      display:block;
      object-fit:cover;
    }
    .profile-personal-change{
      width:auto!important;
      min-height:38px!important;
      margin:2px 0 0!important;
      padding:0 18px!important;
      border:0!important;
      border-radius:999px!important;
      background:color-mix(in srgb,var(--primary) 16%,transparent)!important;
      color:var(--primary)!important;
      box-shadow:none!important;
      font-size:14px!important;
      font-weight:620!important;
    }
    .profile-personal-change:hover{background:color-mix(in srgb,var(--primary) 22%,transparent)!important}
    .profile-personal-change:disabled{opacity:.55}
    .profile-personal-avatar-status{
      min-height:17px;
      color:var(--muted);
      font-size:11px;
      text-align:center;
    }
    .profile-personal-group{
      overflow:hidden;
      margin-top:22px;
      border-radius:22px;
      background:var(--card);
      box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--border) 72%,transparent);
    }
    .profile-personal-row{
      position:relative;
      min-height:68px;
      display:grid;
      grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);
      gap:18px;
      align-items:center;
      padding:11px 20px;
      color:var(--text);
      text-decoration:none;
    }
    .profile-personal-row+.profile-personal-row:before{
      content:"";
      position:absolute;
      left:20px;
      right:20px;
      top:0;
      height:1px;
      background:var(--hairline);
    }
    .profile-personal-row>span:first-child{
      font-size:16px;
      font-weight:510;
      letter-spacing:-.01em;
    }
    .profile-personal-row strong{
      min-width:0;
      overflow:hidden;
      color:var(--muted);
      font-size:16px;
      font-weight:430;
      text-align:right;
      text-overflow:ellipsis;
      white-space:nowrap;
    }
    .profile-personal-row.is-link{
      grid-template-columns:minmax(0,1fr) auto;
      transition:background .12s ease,transform .1s ease;
    }
    .profile-personal-row.is-link:hover{background:var(--secondary)}
    .profile-personal-row.is-link:active{transform:scale(.996)}
    .profile-personal-chevron{
      color:var(--quiet);
      font-size:28px;
      font-weight:420;
      line-height:1;
    }
    .profile-personal-note{
      margin:26px 18px 0;
      color:var(--muted);
      font-size:11px;
      line-height:1.55;
      text-align:center;
    }
    @media(max-width:760px){
      body.os-shell:has(.profile-personal-info) .os-hero{margin-bottom:18px!important}
      .profile-personal-info{padding-bottom:34px}
      .profile-personal-avatar-block{padding:8px 0 24px}
      .profile-personal-avatar{width:174px;height:174px;font-size:70px}
      .profile-personal-group{margin-top:18px;border-radius:20px}
      .profile-personal-row{min-height:64px;padding:10px 17px;gap:14px}
      .profile-personal-row+.profile-personal-row:before{left:17px;right:17px}
      .profile-personal-row>span:first-child,.profile-personal-row strong{font-size:15px}
    }
    @media(max-width:430px){
      .profile-personal-avatar{width:166px;height:166px;font-size:66px}
      .profile-personal-row{grid-template-columns:minmax(0,.88fr) minmax(0,1.25fr)}
    }

`;
}
