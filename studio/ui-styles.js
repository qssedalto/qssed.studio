import { dashboardStyles } from "./ui-style-dashboard.js";
import { profileStyles } from "./ui-style-profile.js";
import { knowledgeStyles } from "./ui-style-knowledge.js";
import { html } from "./routing.js";

export function osStyles() {
  return `
  <style>
    body.os-shell{
      display:block;
      padding:24px;
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--surface-soft) 36%, transparent) 0%, transparent 44%),
        linear-gradient(135deg, var(--bg) 0%, var(--bg-soft) 100%) !important;
      background-size:100% 100%, 180% 180%;
      animation:ambient-pan 18s ease-in-out infinite alternate;
    }
    .os-layout{min-height:calc(100vh - 48px);display:grid;grid-template-columns:286px minmax(0,1fr);gap:18px;}
    .os-sidebar,.os-main,.os-card,.os-profile-card,.os-lock{
      border:1px solid var(--border);background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow-soft);
    }
    .os-sidebar{padding:18px;animation:panel-enter .55s cubic-bezier(.2,.8,.2,1) both;}
    .os-main{padding:30px;animation:panel-enter .62s cubic-bezier(.2,.8,.2,1) .08s both;}
    .compact-back-zone{display:none;}
    @media (min-width:1051px){
      body.os-shell.os-hover-back>.compact-back-zone{
        display:block;
        position:fixed;
        top:0;
        left:0;
        width:104px;
        height:104px;
        z-index:2147481900;
        pointer-events:auto;
      }
      body.os-shell.os-hover-back>.compact-back-zone .compact-back-button{
        position:absolute;
        top:14px;
        left:14px;
        display:grid;
        place-items:center;
        width:48px!important;
        min-width:48px!important;
        max-width:48px!important;
        height:48px!important;
        min-height:48px!important;
        max-height:48px!important;
        margin:0!important;
        padding:0!important;
        border:1px solid rgba(255,255,255,.58)!important;
        border-radius:50%!important;
        background:linear-gradient(145deg,rgba(255,255,255,.72),rgba(255,255,255,.34))!important;
        -webkit-backdrop-filter:blur(22px) saturate(180%);
        backdrop-filter:blur(22px) saturate(180%);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.82),inset 0 -1px 0 rgba(255,255,255,.18),0 8px 24px rgba(15,23,42,.16)!important;
        color:#111!important;
        opacity:0;
        transform:translateY(-6px) scale(.94);
        pointer-events:none;
        cursor:pointer;
        transition:opacity .16s ease,transform .18s cubic-bezier(.2,.8,.2,1),background .18s ease,box-shadow .18s ease;
      }
      body.os-shell.os-hover-back>.compact-back-zone .compact-back-button span{display:none!important}
      body.os-shell.os-hover-back>.compact-back-zone .compact-back-button svg{
        width:24px;
        height:24px;
        fill:none;
        stroke:#111;
        stroke-width:2.35;
        stroke-linecap:round;
        stroke-linejoin:round;
      }
      body.os-shell.os-hover-back>.compact-back-zone:hover .compact-back-button,
      body.os-shell.os-hover-back>.compact-back-zone:focus-within .compact-back-button{
        opacity:1;
        transform:translateY(0) scale(1);
        pointer-events:auto;
      }
      body.os-shell.os-hover-back>.compact-back-zone .compact-back-button:hover{
        background:linear-gradient(145deg,rgba(255,255,255,.82),rgba(255,255,255,.44))!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.9),inset 0 -1px 0 rgba(255,255,255,.22),0 10px 28px rgba(15,23,42,.2)!important;
        transform:translateY(0) scale(1.04);
      }
      body.os-shell.os-hover-back>.compact-back-zone .compact-back-button:active{transform:translateY(0) scale(.94)}
    }
    @media (min-width:901px){
      body.os-shell{height:100vh;overflow:hidden;box-sizing:border-box;}
      .os-layout{height:calc(100vh - 48px);min-height:0;}
      .os-sidebar,.os-main{min-height:0;overflow-y:auto;overscroll-behavior:contain;}
      .os-main{min-width:0;scrollbar-gutter:stable;}
      .os-sidebar{scrollbar-width:thin;scrollbar-color:transparent transparent;}
      .os-sidebar:hover{scrollbar-color:var(--border-strong) transparent;}
      .os-sidebar::-webkit-scrollbar{width:8px;}
      .os-sidebar::-webkit-scrollbar-track{background:transparent;}
      .os-sidebar::-webkit-scrollbar-thumb{background:transparent;border-radius:999px;}
      .os-sidebar:hover::-webkit-scrollbar-thumb{background:var(--border-strong);}
    }
    .os-brand{display:flex;align-items:center;gap:12px;color:var(--text);text-decoration:none;margin-bottom:16px;}
    .os-brand-mark,.os-avatar{display:grid;place-items:center;width:42px;height:42px;border-radius:var(--radius);font-weight:900}.os-brand-mark{background:transparent;color:inherit;border-radius:0}.os-brand-mark img{display:block;width:100%;height:100%;object-fit:contain}.os-avatar{background:var(--primary);color:var(--primary-ink)}
    .os-brand strong,.os-brand small{display:block}.os-brand small{color:var(--muted);font-size:12px;margin-top:2px;}
    .os-user{padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft);margin-bottom:16px;}
    .os-user strong,.os-user>span{display:block}.os-user strong{color:var(--quiet);font-size:12px;text-transform:uppercase}.os-user>span{margin-top:5px;color:var(--text);overflow-wrap:anywhere;}
    .os-signout-button{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:40px;margin:12px 0 0;padding:0 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--card);color:var(--muted);box-shadow:none;font-size:13px;font-weight:750;}
    .os-signout-button svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;flex:0 0 auto;}
    .os-signout-button span{display:inline;margin:0;color:inherit;overflow:visible;}
    .os-signout-button:hover{background:color-mix(in srgb,var(--danger) 8%,var(--card));border-color:color-mix(in srgb,var(--danger) 38%,var(--border));color:var(--danger);box-shadow:none;transform:none;}
    .os-signout-button:active{transform:scale(.985);}
    .os-signout-button:disabled{cursor:wait;opacity:.62;}
    .os-nav{display:grid;gap:10px}.os-nav-group{border:1px solid var(--border);border-radius:var(--radius);padding:8px;background:color-mix(in srgb,var(--surface-soft) 42%,transparent);}
    .os-nav-group.is-active{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 12%,transparent);}
    .os-nav-title{display:block;color:var(--text);text-decoration:none;font-weight:800;padding:8px;}
    .os-nav-items{display:grid;gap:3px}.os-nav-items a{color:var(--muted);text-decoration:none;padding:7px 8px;border-radius:var(--radius);font-size:14px}.os-nav-items a:hover{background:var(--surface-soft);color:var(--text);}
    .os-hero{display:flex;justify-content:space-between;gap:18px;align-items:stretch;margin-bottom:24px;}
    .os-kicker{margin:0 0 8px;color:var(--primary);font-weight:800}.os-hero h1{margin:0 0 10px;font-size:clamp(34px,5vw,64px);letter-spacing:0;line-height:1.02}.os-hero p{max-width:780px;margin:0;color:var(--muted);}
    .os-ai{min-width:230px;display:flex;flex-direction:column;justify-content:center;gap:6px;padding:18px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft);color:var(--text);text-decoration:none}.os-ai span{color:var(--muted);font-size:13px}.os-ai strong{font-size:18px;}
    .os-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.os-card{padding:20px;animation:item-rise .48s cubic-bezier(.2,.8,.2,1) both}.os-card h2{margin:8px 0 8px;font-size:20px}.os-card small{color:var(--primary);font-weight:800}.os-card p{color:var(--muted);margin:0}.os-card.is-large{min-height:220px;}.settings-card-link{display:block;position:relative;color:inherit;text-decoration:none;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.settings-card-link:hover{transform:translateY(-3px);border-color:var(--border-strong);box-shadow:var(--shadow)}.settings-card-arrow{position:absolute;right:18px;bottom:16px;color:var(--muted);font-size:24px;line-height:1}.settings-detail-card p{max-width:760px}.settings-choice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:22px}.settings-choice{display:grid;gap:5px;padding:16px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft);color:var(--text);text-align:left;text-decoration:none;font:inherit;cursor:pointer;box-shadow:none}.settings-choice strong{font-size:17px}.settings-choice span{color:var(--muted);font-size:13px}.settings-choice:hover{border-color:var(--border-strong);background:color-mix(in srgb,var(--surface-soft) 82%,var(--primary) 4%);box-shadow:none;transform:none}.settings-choice.is-selected{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 12%,transparent)}
    .os-main:has(#storage-manager) .os-hero{margin-bottom:20px}.os-main:has(#storage-manager) .os-hero h1{font-size:clamp(38px,4.3vw,56px);letter-spacing:-.035em}.storage-manager{display:grid;gap:16px}.storage-overview-panel{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(520px,.9fr);gap:28px;align-items:center;padding:22px 24px;border:1px solid color-mix(in srgb,var(--border) 82%,transparent);border-radius:24px;background:color-mix(in srgb,var(--card) 84%,transparent);-webkit-backdrop-filter:blur(22px) saturate(160%);backdrop-filter:blur(22px) saturate(160%);box-shadow:0 16px 44px rgba(15,23,42,.08),inset 0 1px 0 color-mix(in srgb,#fff 62%,transparent)}.storage-overview-copy{min-width:0}.storage-service-line{display:flex;align-items:center;gap:9px;min-width:0}.storage-service-line>strong{font-size:17px;color:var(--text);letter-spacing:-.01em}.storage-connection-state{display:inline-flex;align-items:center;min-height:26px;padding:0 9px;border-radius:999px;background:color-mix(in srgb,var(--success) 10%,transparent);color:var(--success);font-size:12px;font-weight:800}.storage-overview-copy p{max-width:680px;margin:8px 0 0;color:var(--muted);font-size:14px;line-height:1.55}.storage-status-dot{flex:0 0 auto;width:9px;height:9px;border-radius:50%;background:var(--success);box-shadow:0 0 0 4px color-mix(in srgb,var(--success) 13%,transparent)}.storage-overview-stats{display:grid;grid-template-columns:minmax(88px,.55fr) minmax(200px,1.25fr) minmax(170px,1fr);align-items:stretch}.storage-stat,.storage-refresh-group{min-width:0;padding:2px 16px;border-left:1px solid color-mix(in srgb,var(--border) 78%,transparent)}.storage-stat span,.storage-refresh-group span{display:block;color:var(--muted);font-size:12px;font-weight:700}.storage-stat strong,.storage-refresh-group strong{display:block;max-width:100%;margin-top:5px;color:var(--text);font-size:clamp(20px,1.6vw,24px);line-height:1.08;letter-spacing:-.035em;white-space:nowrap}.storage-refresh-group{display:flex;align-items:center;justify-content:space-between;gap:10px}.storage-refresh-group strong{font-size:14px;letter-spacing:0}.storage-refresh-button{display:grid;place-items:center;flex:0 0 auto;width:38px;height:38px;min-width:38px;min-height:38px;margin:0;padding:0;border:1px solid color-mix(in srgb,var(--border) 82%,transparent);border-radius:50%;background:var(--surface-soft);color:var(--text);box-shadow:none;cursor:pointer;transition:transform .12s ease,background .15s ease,border-color .15s ease}.storage-refresh-button:hover{background:var(--surface-strong);border-color:var(--border-strong)}.storage-refresh-button:active{transform:scale(.94)}.storage-refresh-button svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.storage-refresh-button.is-refreshing svg{animation:storage-spin .8s linear infinite}.storage-toolbar{display:grid;grid-template-columns:auto minmax(220px,1fr);gap:10px;align-items:center;padding:10px;border:1px solid color-mix(in srgb,var(--border) 78%,transparent);border-radius:18px;background:color-mix(in srgb,var(--surface-soft) 68%,transparent);-webkit-backdrop-filter:blur(18px) saturate(150%);backdrop-filter:blur(18px) saturate(150%)}.storage-upload-button,.storage-empty-upload,.storage-action-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:42px;min-height:42px;margin:0;box-sizing:border-box;padding:0 15px;border:1px solid transparent;border-radius:12px;background:var(--primary);color:var(--primary-ink);font:inherit;font-size:14px;font-weight:800;cursor:pointer;text-decoration:none;white-space:nowrap;box-shadow:none;transition:transform .1s ease,filter .15s ease,background .15s ease,border-color .15s ease}.storage-upload-button:hover,.storage-empty-upload:hover{filter:brightness(1.03)}.storage-upload-button:active,.storage-empty-upload:active,.storage-action-button:active{transform:scale(.97)}.storage-upload-button svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}.storage-search-shell{display:flex;align-items:center;gap:8px;height:42px;min-height:42px;box-sizing:border-box;padding:0 12px;border:1px solid transparent;border-radius:12px;background:var(--card);color:var(--muted);transition:border-color .15s ease,box-shadow .15s ease,background .15s ease}.storage-search-shell:focus-within{border-color:color-mix(in srgb,var(--primary) 55%,var(--border));box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 10%,transparent);background:var(--card)}.storage-search-shell svg{flex:0 0 auto;width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round}.storage-search{width:100%;height:40px;min-height:0;margin:0;padding:0;border:0!important;outline:0!important;background:transparent!important;color:var(--text);font:inherit;font-size:14px;box-shadow:none!important}.storage-feedback{display:flex;align-items:center;gap:12px;min-height:20px;padding:0 3px}.storage-upload-status,.storage-api-status{margin:0;color:var(--muted);font-size:13px}.storage-api-status:empty{display:none}.storage-upload-status.is-error,.storage-api-status.is-error{color:var(--danger)}.storage-upload-status.is-success{color:var(--success)}.storage-upload-status.is-loading,.storage-api-status.is-loading{color:var(--primary)}.storage-login-link{color:var(--primary);font-size:13px;font-weight:800}.storage-browser{overflow:hidden;border:1px solid color-mix(in srgb,var(--border) 84%,transparent);border-radius:20px;background:var(--card);box-shadow:0 12px 34px rgba(15,23,42,.055)}.storage-table{overflow:auto}.storage-file-row{display:grid;grid-template-columns:minmax(180px,1.8fr) minmax(120px,1fr) minmax(78px,.55fr) minmax(130px,.9fr) minmax(150px,.85fr);gap:12px;align-items:center;min-width:760px;padding:13px 18px;border-top:1px solid color-mix(in srgb,var(--border) 72%,transparent)}.storage-file-head{position:sticky;top:0;z-index:1;border-top:0;background:color-mix(in srgb,var(--surface-soft) 88%,var(--card));color:var(--muted);font-size:12px;font-weight:750}.storage-file-row>span,.storage-file-row time{min-width:0;color:var(--muted);font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.storage-file-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text);font-size:14px}.storage-actions{display:flex;gap:7px;justify-content:flex-end}.storage-action-button{min-height:34px;padding:0 10px;border-color:var(--border);border-radius:10px;background:var(--surface-soft);color:var(--text);font-size:13px;font-weight:700}.storage-action-button:hover{border-color:var(--border-strong);background:var(--surface-strong)}.storage-action-button.is-danger{color:var(--danger)}.storage-upload-button:disabled,.storage-refresh-button:disabled,.storage-action-button:disabled,.storage-empty-upload:disabled{opacity:.5;cursor:not-allowed;transform:none;filter:none}.storage-empty{display:grid;place-items:center;gap:7px;min-height:260px;padding:38px 20px;color:var(--muted);text-align:center}.storage-empty strong{color:var(--text);font-size:17px;letter-spacing:-.01em}.storage-empty>span{max-width:360px;font-size:13px;line-height:1.55}.storage-empty-icon{display:grid;place-items:center;width:52px;height:52px;margin-bottom:4px;border-radius:16px;background:var(--surface-soft);color:var(--muted)}.storage-empty-icon svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.55;stroke-linecap:round;stroke-linejoin:round}.storage-empty-upload{min-height:38px;margin-top:7px;padding:0 14px}.storage-empty-compact{min-height:150px}.storage-partial-notice{margin:0;padding:11px 18px;border-top:1px solid var(--border);color:var(--muted);font-size:13px}.storage-manager.is-checking .storage-status-dot{background:var(--muted);box-shadow:0 0 0 4px color-mix(in srgb,var(--muted) 13%,transparent)}.storage-manager.is-checking .storage-connection-state{background:var(--surface-soft);color:var(--muted)}.storage-manager.is-unavailable .storage-status-dot{background:var(--danger);box-shadow:0 0 0 4px color-mix(in srgb,var(--danger) 13%,transparent)}.storage-manager.is-unavailable .storage-connection-state{background:color-mix(in srgb,var(--danger) 9%,transparent);color:var(--danger)}.storage-manager.is-stale .storage-status-dot{background:#d99a2b;box-shadow:0 0 0 4px color-mix(in srgb,#d99a2b 13%,transparent)}@keyframes storage-spin{to{transform:rotate(360deg)}}@media (max-width:1180px){.storage-overview-panel{grid-template-columns:1fr;gap:18px}.storage-overview-stats{border-top:1px solid var(--border);padding-top:16px}.storage-stat:first-child{border-left:0;padding-left:0}}@media (max-width:620px){.os-main:has(#storage-manager) .os-hero h1{font-size:38px}.storage-overview-panel{padding:18px;border-radius:20px}.storage-overview-stats{grid-template-columns:1fr 1fr}.storage-refresh-group{grid-column:1/-1;margin-top:14px;padding:14px 0 0;border-left:0;border-top:1px solid var(--border)}.storage-stat:nth-child(1){border-left:0;padding-left:0}.storage-toolbar{grid-template-columns:1fr}.storage-upload-button{width:100%}.storage-browser{border-radius:16px}}@media (prefers-reduced-transparency:reduce){.storage-overview-panel,.storage-toolbar{background:var(--card);-webkit-backdrop-filter:none;backdrop-filter:none}}@media (prefers-contrast:more){.storage-overview-panel,.storage-toolbar,.storage-browser{border-color:var(--border-strong)}}
    .os-chip-row{display:flex;flex-wrap:wrap;gap:8px;align-content:flex-start}.os-chip-row span{border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft);color:var(--text);padding:8px 10px;font-weight:700;}
    .os-search{font-size:18px;margin:0 0 18px}.os-profile-card{display:flex;gap:18px;align-items:center;padding:24px}.os-profile-card .os-avatar{width:84px;height:84px;font-size:36px}
    .os-lock{padding:18px;margin-bottom:18px;border-color:var(--danger, #ff9a9a)}
    .audit-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(280px,.8fr);gap:14px;margin-bottom:14px}
    .audit-facts{display:grid;gap:12px;margin:0}.audit-facts div{padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft)}.audit-facts dt{color:var(--muted);font-size:13px}.audit-facts dd{margin:6px 0 0;color:var(--text);overflow-wrap:anywhere;font-weight:750}
    .audit-stats{display:grid;gap:10px}.audit-stats span{display:flex;align-items:center;justify-content:space-between;padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft);color:var(--muted)}.audit-stats strong{color:var(--text);font-size:26px}
    .audit-section{margin-top:14px}.audit-table{overflow:auto}.audit-row{display:grid;grid-template-columns:1.1fr .8fr 1fr .8fr .8fr .8fr .8fr .7fr .8fr;gap:10px;padding:12px;border-top:1px solid var(--border);min-width:980px}.audit-row:first-child{border-top:0}.audit-head{background:var(--surface-soft)}.audit-row span{color:var(--muted);overflow-wrap:anywhere}
    .audit-current,.audit-devices,.audit-timeline,.audit-alerts{display:grid;gap:10px;color:var(--muted)}.audit-device-card{display:grid;gap:6px;padding:14px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft)}.audit-device-card strong{color:var(--text)}.audit-device-card em{color:var(--primary);font-style:normal;font-weight:800}.audit-timeline section{padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft)}.audit-timeline h3{margin:0 0 8px}.audit-timeline p,.audit-alerts p{margin:0;padding:8px 0;border-top:1px solid var(--border)}.audit-timeline p:first-of-type{border-top:0}
    .admin-motion-page{animation:admin-page-enter .25s ease both}.admin-scan{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;align-items:center;margin-bottom:16px;padding:16px;border:1px solid var(--border);border-radius:var(--radius);background:linear-gradient(135deg,var(--card),var(--surface-soft));overflow:hidden;position:relative}.admin-scan:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--primary) 14%,transparent),transparent);transform:translateX(-100%);animation:none}.admin-scan span{width:12px;height:12px;border-radius:99px;background:var(--primary);box-shadow:0 0 0 6px color-mix(in srgb,var(--primary) 12%,transparent);animation:none}.admin-scan strong{position:relative;color:var(--text)}.admin-scan p{position:relative;grid-column:2;margin:0;color:var(--muted)}
    .admin-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:16px}.admin-motion-card,.admin-metrics article{padding:18px;border:1px solid var(--border);border-radius:var(--radius);background:var(--card);box-shadow:var(--shadow-soft);animation:admin-item-enter .34s ease both;animation-delay:calc(var(--stagger,0) * 54ms);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.admin-motion-card:hover,.admin-metrics article:hover{transform:translateY(-3px);border-color:var(--border-strong);box-shadow:var(--shadow)}.admin-metrics span,.admin-motion-card small{display:block;color:var(--muted);font-weight:750}.admin-metrics strong{display:block;margin-top:8px;font-size:34px;color:var(--text)}
    .admin-dashboard-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:14px}.admin-dashboard-grid .danger-event-card{grid-column:1/-1}.admin-section-card{min-height:260px}.admin-section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.admin-section-head h2{margin:0}.admin-section-head span{color:var(--muted);font-size:13px}.status-pulse{width:10px;height:10px;border-radius:50%;background:var(--primary);animation:none}
    .admin-mini-row,.admin-log-row,.admin-risk{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center;padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft);transition:background .18s ease,border-color .18s ease,transform .18s ease}.admin-mini-row+.admin-mini-row,.admin-log-row+.admin-log-row,.admin-risk+.admin-risk{margin-top:8px}.admin-mini-row:hover,.admin-log-row:hover{background:color-mix(in srgb,var(--surface-soft) 70%,var(--primary) 5%);border-color:var(--border-strong)}.admin-mini-row strong,.admin-log-row strong,.admin-risk strong{display:block;color:var(--text)}.admin-mini-row small,.admin-log-row small,.admin-risk small{color:var(--muted)}.admin-avatar{display:grid;place-items:center;width:34px;height:34px;border-radius:var(--radius);background:var(--primary);color:var(--primary-ink);font-weight:900}.admin-badge{display:inline-flex;align-items:center;justify-content:center;min-width:70px;padding:6px 8px;border-radius:var(--radius);border:1px solid var(--border);background:var(--surface-soft);color:var(--muted);font-style:normal;font-size:12px;font-weight:800;transition:background .18s ease,color .18s ease,border-color .18s ease}.admin-badge.active,.admin-badge.info{color:var(--primary);border-color:color-mix(in srgb,var(--primary) 40%,var(--border))}.admin-badge.suspended,.admin-badge.warning{color:#d99a2b;border-color:color-mix(in srgb,#d99a2b 46%,var(--border))}.admin-badge.banned,.admin-badge.danger{color:var(--danger);border-color:color-mix(in srgb,var(--danger) 46%,var(--border))}
    .admin-risk.warning{border-color:color-mix(in srgb,#d99a2b 44%,var(--border))}.admin-risk.danger,.danger-event-card.pulse-once{border-color:color-mix(in srgb,var(--danger) 58%,var(--border));box-shadow:0 0 0 1px color-mix(in srgb,var(--danger) 18%,transparent),var(--shadow-soft)}.pulse-once{animation:danger-glow 1.1s ease 1}.log-dot{width:10px;height:10px;border-radius:99px;background:var(--primary)}.admin-log-row.warning .log-dot{background:#d99a2b}.admin-log-row.danger .log-dot{background:var(--danger)}
    .admin-toolbar{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-bottom:14px}.admin-toolbar .os-search{margin:0}.admin-toolbar input,.admin-toolbar select{width:100%;height:56px;min-height:56px;box-sizing:border-box;background:var(--surface-soft);color:var(--text);border:1px solid var(--border);border-radius:var(--radius);padding:0 14px;font-size:16px}.admin-table-row select{width:100%;min-height:42px;background:var(--surface-soft);color:var(--text);border:1px solid var(--border);border-radius:var(--radius);padding:8px 10px}.admin-toolbar input:focus,.admin-toolbar select:focus{border-color:var(--primary);box-shadow:0 0 0 4px color-mix(in srgb,var(--primary) 14%,transparent)}
    .admin-table-card{overflow:hidden}.admin-data-table{overflow:auto}.admin-table-row{display:grid;grid-template-columns:.8fr 1fr 1.45fr .55fr .8fr .9fr 1fr 1fr 1fr .8fr;gap:10px;align-items:center;min-width:1180px;padding:12px;border-top:1px solid var(--border);transition:background .18s ease}.admin-table-row:first-child{border-top:0}.admin-table-row:hover{background:color-mix(in srgb,var(--surface-soft) 68%,var(--primary) 5%)}.admin-table-head{position:sticky;top:0;z-index:1;background:var(--surface-soft)}.admin-table-row span{color:var(--muted);overflow-wrap:anywhere}.admin-table-row .mono{font-family:ui-monospace,Consolas,monospace;color:var(--quiet)}
    .animated-row{animation:admin-row-enter .24s ease both;animation-delay:calc(var(--stagger,0) * 28ms)}[data-admin-path="true"] .admin-motion-card,[data-admin-path="true"] .admin-metrics article,[data-admin-path="true"] .admin-user-table .animated-row,[data-admin-path="true"] .admin-log-timeline .animated-row{animation:none!important}.row-flash-warning{animation:row-flash-warning .8s ease 1}.row-flash-success{animation:row-flash-success .8s ease 1}.admin-detail-card{margin-top:14px}.admin-detail-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}.admin-detail-grid>div{padding:14px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft)}.admin-detail-grid p{margin:6px 0;color:var(--muted);overflow-wrap:anywhere}
    .admin-role-summary{margin-bottom:14px}.admin-role-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-bottom:14px}.admin-role-cards strong{display:block;margin-top:12px;color:var(--text)}.admin-unsaved{padding:10px 12px;margin-top:12px;border:1px solid color-mix(in srgb,#d99a2b 50%,var(--border));border-radius:var(--radius);background:color-mix(in srgb,#d99a2b 12%,transparent);color:var(--text);animation:admin-item-enter .18s ease both}.permission-group{border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft);margin-top:10px;overflow:hidden}.permission-group summary{cursor:pointer;padding:13px 14px;color:var(--text);font-weight:900}.permission-grid{display:grid;grid-template-columns:minmax(220px,1fr) repeat(3,110px);gap:1px;background:var(--border);border-top:1px solid var(--border)}.permission-grid>*{background:var(--card);padding:12px}.permission-key strong,.permission-key small{display:block}.permission-key small{margin-top:4px;color:var(--muted)}.switch-cell{display:grid;place-items:center}.switch-cell input{position:absolute;opacity:0;pointer-events:none}.switch-cell span{width:42px;height:24px;border-radius:99px;border:1px solid var(--border);background:var(--surface-soft);position:relative;transition:background .18s ease,border-color .18s ease,box-shadow .18s ease}.switch-cell span:before{content:"";position:absolute;width:18px;height:18px;left:2px;top:2px;border-radius:50%;background:var(--muted);transition:transform .18s ease,background .18s ease}.switch-cell input:checked+span{background:color-mix(in srgb,var(--primary) 30%,var(--surface-soft));border-color:var(--primary)}.switch-cell input:checked+span:before{transform:translateX(18px);background:var(--primary)}.switch-cell.updated span{box-shadow:0 0 0 4px color-mix(in srgb,var(--primary) 18%,transparent)}
    #admin-recent-users,#admin-recent-users *,#admin-recent-logs,#admin-recent-logs *,#admin-risk-list,#admin-risk-list *{cursor:default!important}#admin-recent-logs .animated-row,.admin-user-table .animated-row{animation:none!important}.danger-event-card.pulse-once{animation:none!important}
    .admin-log-timeline{display:grid;gap:8px}.admin-log-row{cursor:pointer;grid-template-columns:auto minmax(0,1fr) auto}#admin-recent-logs .admin-log-row{cursor:default}.admin-drawer{position:fixed;inset:0 0 0 auto;width:min(520px,calc(100vw - 24px));padding:22px;background:var(--card);border-left:1px solid var(--border);box-shadow:var(--shadow);transform:translateX(104%);transition:transform .22s ease;z-index:40;overflow:auto}.admin-drawer.is-open{transform:translateX(0)}.admin-drawer h2{margin-top:34px}.admin-drawer-facts{display:grid;gap:8px}.admin-drawer-facts div{padding:10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft)}.admin-drawer-facts dt{color:var(--muted);font-size:12px}.admin-drawer-facts dd{margin:4px 0 0;color:var(--text);overflow-wrap:anywhere}.admin-drawer pre{white-space:pre-wrap;padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft);color:var(--muted)}
    .admin-primary,.admin-ghost,.admin-danger{min-height:38px;width:auto;border-radius:var(--radius);font-weight:850;transition:transform .14s ease,box-shadow .14s ease,background .14s ease,border-color .14s ease}.admin-primary{background:var(--primary);color:var(--primary-ink);border:1px solid var(--primary)}.admin-primary:disabled{opacity:.48;cursor:not-allowed}.admin-ghost{background:var(--surface-soft);color:var(--text);border:1px solid var(--border)}.admin-danger{background:linear-gradient(135deg,color-mix(in srgb,var(--danger) 85%,#111),var(--danger));color:#fff;border:1px solid color-mix(in srgb,var(--danger) 70%,var(--border))}.admin-ghost:hover,.admin-primary:hover,.admin-danger:hover{transform:translateY(-1px);box-shadow:var(--shadow-soft)}.admin-danger:hover{box-shadow:0 12px 26px color-mix(in srgb,var(--danger) 24%,transparent)}.admin-ghost:active,.admin-primary:active,.admin-danger:active{transform:scale(.96)}
    .admin-empty-state{display:grid;place-items:center;gap:10px;min-height:150px;padding:22px;border:1px dashed var(--border-strong);border-radius:var(--radius);background:var(--surface-soft);text-align:center;animation:admin-item-enter .24s ease both}.admin-empty-orb{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:var(--primary);color:var(--primary-ink);font-weight:900;animation:empty-float 2.8s ease-in-out infinite}.admin-empty{color:var(--muted)}
    .skeleton-line{height:44px;border-radius:var(--radius);background:linear-gradient(90deg,var(--surface-soft),color-mix(in srgb,var(--primary) 10%,var(--surface-soft)),var(--surface-soft));background-size:240% 100%;animation:skeleton-shimmer 1.2s ease-in-out infinite;margin-bottom:10px}.admin-skeleton strong{color:transparent;border-radius:var(--radius);background:linear-gradient(90deg,var(--surface-soft),color-mix(in srgb,var(--primary) 10%,var(--surface-soft)),var(--surface-soft));background-size:240% 100%;animation:skeleton-shimmer 1.2s ease-in-out infinite}
    #admin-toast-host{position:fixed;right:18px;top:18px;z-index:60;display:grid;gap:10px;max-width:min(360px,calc(100vw - 36px))}.admin-toast{display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid var(--border);border-radius:var(--radius);background:var(--card);box-shadow:var(--shadow);color:var(--text);animation:toast-in .2s ease both}.admin-toast strong{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:var(--primary);color:var(--primary-ink)}.admin-toast.warning strong{background:#d99a2b;color:#121212}.admin-toast.danger strong{background:var(--danger);color:#fff}.admin-toast.is-hiding{animation:toast-out .25s ease both}
    .admin-confirm-backdrop{position:fixed;inset:0;z-index:55;display:grid;place-items:center;background:rgba(0,0,0,.42);opacity:0;pointer-events:none;transition:opacity .18s ease}.admin-confirm-backdrop.is-open{opacity:1;pointer-events:auto}.admin-confirm{width:min(440px,calc(100vw - 32px));padding:20px;border:1px solid var(--border);border-radius:var(--radius);background:var(--card);box-shadow:var(--shadow);transform:scale(.95);opacity:0;transition:transform .18s ease,opacity .18s ease}.admin-confirm-backdrop.is-open .admin-confirm{transform:scale(1);opacity:1}.admin-confirm.is-danger{border-color:color-mix(in srgb,var(--danger) 48%,var(--border))}.admin-confirm h3{margin:0 0 8px}.admin-confirm p{margin:0 0 14px;color:var(--muted)}.admin-confirm input{margin-bottom:10px;background:var(--surface-soft)}.admin-confirm input.is-error{border-color:var(--danger);box-shadow:0 0 0 4px color-mix(in srgb,var(--danger) 16%,transparent)}.admin-confirm-actions{display:flex;justify-content:flex-end;gap:10px}
    @keyframes admin-page-enter{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes admin-item-enter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes admin-row-enter{from{opacity:0}to{opacity:1}}@keyframes admin-scan{0%{transform:translateX(-100%)}45%,100%{transform:translateX(100%)}}@keyframes status-pulse{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--primary) 28%,transparent)}50%{box-shadow:0 0 0 8px transparent}}@keyframes skeleton-shimmer{from{background-position:120% 0}to{background-position:-120% 0}}@keyframes toast-in{from{opacity:0;transform:translateX(22px)}to{opacity:1;transform:translateX(0)}}@keyframes toast-out{to{opacity:0;transform:translateX(22px)}}@keyframes danger-glow{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--danger) 34%,transparent)}100%{box-shadow:0 0 0 16px transparent}}@keyframes row-flash-warning{0%{background:color-mix(in srgb,#d99a2b 20%,transparent)}100%{background:transparent}}@keyframes row-flash-success{0%{background:color-mix(in srgb,#22c55e 18%,transparent)}100%{background:transparent}}@keyframes empty-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@keyframes confirm-shake{0%,100%{transform:translateX(0) scale(1)}25%{transform:translateX(-6px) scale(1)}75%{transform:translateX(6px) scale(1)}}.shake-once{animation:confirm-shake .25s ease 1}
    @media (max-width:1050px){
      body.os-shell{height:100dvh;overflow:hidden;box-sizing:border-box}
      .os-layout{height:calc(100dvh - 48px);min-height:0;display:block}
      .os-sidebar,.os-main{height:100%;min-height:0;box-sizing:border-box;overflow-y:auto;overscroll-behavior:contain}
      .os-sidebar{position:static;scrollbar-width:thin;scrollbar-color:transparent transparent}
      .os-sidebar::-webkit-scrollbar{width:8px}
      .os-sidebar::-webkit-scrollbar-track{background:transparent}
      .os-sidebar::-webkit-scrollbar-thumb{background:transparent;border-radius:999px}
      .os-sidebar:hover{scrollbar-color:var(--border-strong) transparent}
      .os-sidebar:hover::-webkit-scrollbar-thumb{background:var(--border-strong)}
      html.compact-menu-view .os-sidebar,
      html:not(.compact-content-view):not(.compact-menu-view) .os-sidebar{display:block}
      html.compact-menu-view .os-main,
      html:not(.compact-content-view):not(.compact-menu-view) .os-main{display:none}
      html.compact-content-view .os-sidebar{display:none}
      html.compact-content-view .os-main{display:block;padding-top:72px}
      .compact-back-zone{display:none;position:fixed;top:0;left:0;width:92px;height:92px;z-index:85}
      html.compact-content-view .compact-back-zone{display:block}
      .compact-back-button{
        position:absolute;
        top:14px;
        left:14px;
        display:grid;
        place-items:center;
        width:48px;
        height:48px;
        min-width:48px;
        min-height:48px;
        padding:0;
        border:1px solid rgba(255,255,255,.58);
        border-radius:50%;
        background:linear-gradient(145deg,rgba(255,255,255,.72),rgba(255,255,255,.34));
        -webkit-backdrop-filter:blur(22px) saturate(180%);
        backdrop-filter:blur(22px) saturate(180%);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.82),
          inset 0 -1px 0 rgba(255,255,255,.18),
          0 8px 24px rgba(15,23,42,.16);
        color:#111;
        opacity:0;
        transform:translateY(-6px) scale(.94);
        pointer-events:none;
        cursor:pointer;
        transition:opacity .16s ease,transform .18s cubic-bezier(.2,.8,.2,1),background .18s ease,box-shadow .18s ease;
      }
      .compact-back-button svg{width:24px;height:24px;fill:none;stroke:#111;stroke-width:2.35;stroke-linecap:round;stroke-linejoin:round}
      .compact-back-zone:hover .compact-back-button,
      .compact-back-zone:focus-within .compact-back-button{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}
      .compact-back-button:hover{
        background:linear-gradient(145deg,rgba(255,255,255,.82),rgba(255,255,255,.44));
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.9),
          inset 0 -1px 0 rgba(255,255,255,.22),
          0 10px 28px rgba(15,23,42,.2);
        transform:translateY(0) scale(1.04);
      }
      .compact-back-button:active{transform:translateY(0) scale(.94)}
      .os-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      .storage-summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.storage-connection-card{grid-column:span 2}.storage-toolbar{grid-template-columns:auto auto minmax(160px,1fr)}
      .os-hero{grid-template-columns:1fr;display:grid}
      .os-ai{min-width:0}
      .admin-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}
      .admin-dashboard-grid,.admin-role-cards,.admin-detail-grid{grid-template-columns:1fr}
      .admin-toolbar{grid-template-columns:1fr 1fr}
      .permission-grid{grid-template-columns:minmax(190px,1fr) repeat(3,86px)}
      .audit-grid{grid-template-columns:1fr}
    }
    @media (max-width:1050px) and (hover:none) and (pointer:coarse){
      .compact-back-button{opacity:1;transform:none;pointer-events:auto}
    }
    @media (max-width:560px){
      body.os-shell{padding:14px}
      .os-layout{height:calc(100dvh - 28px)}
      .os-main{padding:20px 16px}
      html.compact-content-view .os-main{padding-top:64px}
      .os-grid,.admin-metrics{grid-template-columns:1fr}
      .storage-summary-grid{grid-template-columns:1fr}.storage-connection-card{grid-column:auto}.storage-toolbar{grid-template-columns:1fr 1fr}.storage-search{grid-column:1 / -1}.storage-file-row{min-width:620px;padding:12px 14px;grid-template-columns:minmax(150px,1.45fr) minmax(104px,.85fr) minmax(68px,.48fr) minmax(112px,.75fr) minmax(132px,.78fr)}.storage-file-head{font-size:11px}.storage-actions{gap:5px}.storage-action-button{padding:0 8px}
      .os-profile-card{align-items:flex-start;flex-direction:column}
      .admin-toolbar{grid-template-columns:1fr}
      .permission-grid{grid-template-columns:minmax(150px,1fr) repeat(3,70px)}
      .admin-drawer{width:calc(100vw - 12px)}
    }
    @media (prefers-reduced-motion:reduce){body.os-shell,.os-sidebar,.os-main,.os-card,.admin-motion-page,.admin-motion-card,.admin-metrics article,.animated-row,.admin-scan:before,.status-pulse,.admin-empty-orb,.skeleton-line,.admin-skeleton strong{animation:none !important;transition:none !important}.admin-motion-card:hover,.admin-metrics article:hover,.admin-ghost:hover,.admin-primary:hover,.admin-danger:hover{transform:none !important}}

      /* APPLE_DESIGN_SYSTEM_V2_OS */
/* APPLE_DESIGN_SYSTEM_V2 — authenticated workspace */
body.os-shell{
  padding:18px!important;
  background:
    radial-gradient(1000px 620px at 10% -12%,color-mix(in srgb,var(--primary) 10%,transparent),transparent 66%),
    radial-gradient(820px 560px at 102% 108%,color-mix(in srgb,#af52de 7%,transparent),transparent 70%),
    var(--bg)!important;
  background-size:auto!important;
  animation:none!important;
}
.os-layout{
  max-width:1680px;
  margin:0 auto;
  grid-template-columns:276px minmax(0,1fr);
  gap:14px;
}
.os-sidebar,.os-main,.os-card,.os-profile-card,.os-lock{border-color:var(--border)}
.os-sidebar{
  padding:14px;
  border-radius:26px;
  background:var(--glass-heavy);
  -webkit-backdrop-filter:blur(34px) saturate(180%);
  backdrop-filter:blur(34px) saturate(180%);
  box-shadow:0 20px 56px rgba(0,0,0,.13),inset 0 1px 0 color-mix(in srgb,#fff 26%,transparent);
  animation:none;
}
.os-main{
  padding:clamp(24px,3vw,38px);
  border-radius:26px;
  background:color-mix(in srgb,var(--glass) 92%,transparent);
  -webkit-backdrop-filter:blur(28px) saturate(165%);
  backdrop-filter:blur(28px) saturate(165%);
  box-shadow:0 20px 56px rgba(0,0,0,.10),inset 0 1px 0 color-mix(in srgb,#fff 22%,transparent);
  animation:none;
}
.os-brand{gap:10px;margin:2px 4px 16px}
.os-brand-mark,.os-avatar{
  width:40px;height:40px;
  border-radius:12px;
  background:linear-gradient(145deg,color-mix(in srgb,var(--primary) 78%,#fff 22%),var(--primary));
  box-shadow:0 6px 16px color-mix(in srgb,var(--primary) 22%,transparent);
}
.os-brand strong{font-size:14px;letter-spacing:-.01em}
.os-brand small{font-size:11px;color:var(--muted)}
.os-user{
  margin:0 2px 12px;
  padding:11px 12px;
  border:0;
  border-radius:14px;
  background:var(--fill);
  box-shadow:inset 0 0 0 1px var(--border);
}
.os-user strong{font-size:10px;letter-spacing:.04em}
.os-user>span{margin-top:4px;font-size:13px}
.os-signout-button{
  min-height:36px;
  margin:9px 0 0;
  border:0;
  border-radius:10px;
  background:transparent;
  color:var(--muted);
  font-size:12px;
  box-shadow:none;
}
.os-signout-button:hover{background:color-mix(in srgb,var(--danger) 9%,transparent);color:var(--danger)}
.os-signout-button:active{transform:scale(.97)}
.os-nav{gap:5px}
.os-nav-group{
  padding:3px;
  border:0;
  border-radius:14px;
  background:transparent;
}
.os-nav-group.is-active{border:0;box-shadow:none;background:transparent}
.os-nav-title{
  padding:9px 10px;
  border-radius:11px;
  color:var(--text);
  font-size:13px;
  font-weight:680;
  transition:background .13s ease,color .13s ease,transform .1s ease;
}
.os-nav-title:hover{background:var(--fill)}
.os-nav-title:active{transform:scale(.985)}
.os-nav-group.is-active>.os-nav-title{
  background:color-mix(in srgb,var(--primary) 15%,transparent);
  color:var(--primary);
}
.os-nav-items{gap:1px;padding:2px 0 3px 9px}
.os-nav-items a{
  padding:7px 10px;
  border-radius:9px;
  color:var(--muted);
  font-size:12.5px;
  transition:background .13s ease,color .13s ease,transform .1s ease;
}
.os-nav-items a:hover{background:var(--fill);color:var(--text)}
.os-nav-items a:active{transform:scale(.985)}
.os-hero{
  align-items:flex-start;
  margin-bottom:24px;
  gap:20px;
}
.os-kicker{
  margin:0 0 6px;
  color:var(--primary);
  font-size:12px;
  font-weight:680;
  letter-spacing:.01em;
}
.os-hero h1{
  margin:0 0 8px;
  font-size:clamp(32px,4.4vw,50px);
  font-weight:730;
  letter-spacing:-.04em;
  line-height:1.02;
}
.os-hero p{max-width:760px;font-size:14px;line-height:1.5}
.os-ai{
  min-width:190px;
  padding:13px 15px;
  border:0;
  border-radius:15px;
  background:var(--fill);
  box-shadow:inset 0 0 0 1px var(--border);
  transition:background .14s ease,transform .1s ease;
}
.os-ai:hover{background:var(--secondary);transform:none}
.os-ai:active{transform:scale(.98)}
.os-ai span{font-size:11px}.os-ai strong{font-size:15px;letter-spacing:-.01em}
.os-grid{
  grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
  gap:12px;
}
.os-card,.os-profile-card,.os-lock{
  border:1px solid var(--border);
  border-radius:19px;
  background:color-mix(in srgb,var(--surface) 74%,transparent);
  box-shadow:0 8px 26px rgba(0,0,0,.055);
}
.os-card{
  padding:18px;
  animation:none;
}
.os-card h2{margin:7px 0 7px;font-size:18px;letter-spacing:-.02em}
.os-card small{color:var(--muted);font-size:11px;font-weight:650}
.os-card p{font-size:13.5px;line-height:1.5}
.os-card.is-large{min-height:190px}
.settings-card-link{
  transition:background .14s ease,border-color .14s ease,transform .1s ease;
}
.settings-card-link:hover{
  transform:none;
  border-color:var(--border-strong);
  background:color-mix(in srgb,var(--surface) 82%,var(--fill) 18%);
  box-shadow:0 8px 26px rgba(0,0,0,.055);
}
.settings-card-link:active{transform:scale(.988)}
.settings-card-arrow{right:16px;bottom:13px;font-size:20px;color:var(--quiet)}
.settings-choice-grid{gap:8px;margin-top:18px}
.settings-choice{
  min-height:72px;
  padding:13px 14px;
  border:1px solid transparent;
  border-radius:14px;
  background:var(--fill);
  box-shadow:inset 0 0 0 1px var(--border);
  transition:background .14s ease,box-shadow .14s ease,transform .1s ease;
}
.settings-choice:hover{background:var(--secondary);border-color:transparent;box-shadow:inset 0 0 0 1px var(--border);transform:none}
.settings-choice:active{transform:scale(.985)}
.settings-choice.is-selected{
  border-color:transparent;
  background:color-mix(in srgb,var(--primary) 14%,var(--fill));
  box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 38%,transparent);
}
.settings-choice strong{font-size:15px}.settings-choice span{font-size:12px}
.os-profile-card{padding:20px}
.os-profile-card .os-avatar{width:76px;height:76px;border-radius:50%;font-size:30px}
.os-chip-row{gap:7px}
.os-chip-row span{
  padding:7px 9px;
  border:0;
  border-radius:999px;
  background:var(--fill);
  font-size:12px;
  font-weight:620;
}
.audit-grid,.admin-dashboard-grid,.admin-metrics,.admin-role-cards,.admin-detail-grid{gap:12px}
.audit-facts div,.admin-detail-grid>div,.audit-stats span,.audit-timeline section,.admin-drawer-facts div{
  border:0;
  border-radius:13px;
  background:var(--fill);
  box-shadow:inset 0 0 0 1px var(--border);
}
.admin-motion-card,.admin-metrics article{
  padding:16px;
  border:1px solid var(--border);
  border-radius:17px;
  background:color-mix(in srgb,var(--surface) 74%,transparent);
  box-shadow:0 7px 22px rgba(0,0,0,.05);
  animation:none;
  transition:background .14s ease,border-color .14s ease,transform .1s ease;
}
.admin-motion-card:hover,.admin-metrics article:hover{
  transform:none;
  border-color:var(--border-strong);
  box-shadow:0 7px 22px rgba(0,0,0,.05);
}
.admin-metrics strong{font-size:30px;letter-spacing:-.035em}
.admin-mini-row,.admin-log-row,.admin-risk{
  padding:11px 12px;
  border:0;
  border-radius:12px;
  background:var(--fill);
  box-shadow:inset 0 0 0 1px var(--border);
  transition:background .13s ease,transform .1s ease;
}
.admin-mini-row:hover,.admin-log-row:hover{background:var(--secondary);border-color:transparent}
.admin-mini-row:active,.admin-log-row:active{transform:scale(.994)}
.admin-badge{
  min-width:64px;
  padding:5px 8px;
  border:0;
  border-radius:999px;
  background:var(--fill);
  font-size:11px;
}
.admin-toolbar{gap:8px}
.admin-toolbar input,.admin-toolbar select{
  height:48px;min-height:48px;
  border:0;
  border-radius:13px;
  background:var(--fill);
  box-shadow:inset 0 0 0 1px var(--border);
}
.admin-toolbar input:focus,.admin-toolbar select:focus{box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 14%,transparent),inset 0 0 0 1px var(--primary)}
.admin-table-card,.storage-browser{overflow:hidden}
.admin-table-row,.audit-row,.storage-file-row{border-top-color:var(--hairline)}
.admin-table-head,.audit-head,.storage-file-head{
  background:color-mix(in srgb,var(--glass-heavy) 92%,transparent);
  -webkit-backdrop-filter:blur(18px) saturate(160%);
  backdrop-filter:blur(18px) saturate(160%);
}
.admin-primary,.admin-ghost,.admin-danger{
  min-height:38px;
  border:0;
  border-radius:11px;
  box-shadow:none;
  font-weight:660;
}
.admin-primary{background:var(--primary);color:#fff}
.admin-ghost{background:var(--fill);color:var(--text)}
.admin-danger{background:var(--danger);color:#fff}
.admin-ghost:hover,.admin-primary:hover,.admin-danger:hover{transform:none;box-shadow:none;filter:brightness(1.04)}
.admin-ghost:active,.admin-primary:active,.admin-danger:active{transform:scale(.96)}
.admin-drawer{
  padding:22px;
  background:var(--glass-heavy);
  -webkit-backdrop-filter:blur(32px) saturate(180%);
  backdrop-filter:blur(32px) saturate(180%);
  box-shadow:-18px 0 60px rgba(0,0,0,.18);
}
.admin-confirm-backdrop{background:rgba(0,0,0,.34);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
.admin-confirm{
  padding:20px;
  border:1px solid var(--border);
  border-radius:20px;
  background:var(--glass-heavy);
  -webkit-backdrop-filter:blur(28px) saturate(180%);
  backdrop-filter:blur(28px) saturate(180%);
  box-shadow:var(--shadow);
}
#admin-toast-host{right:18px;top:18px}
.admin-toast{
  padding:11px 13px;
  border:1px solid var(--border);
  border-radius:15px;
  background:var(--glass-heavy);
  -webkit-backdrop-filter:blur(24px) saturate(180%);
  backdrop-filter:blur(24px) saturate(180%);
  box-shadow:0 14px 38px rgba(0,0,0,.16);
  animation:apple-toast-in .22s cubic-bezier(.2,.8,.2,1) both;
}
.admin-empty-state{
  min-height:150px;
  border:0;
  border-radius:16px;
  background:var(--fill);
  box-shadow:inset 0 0 0 1px var(--border);
  animation:none;
}
.admin-empty-orb{background:var(--fill);color:var(--primary);animation:none}
.skeleton-line,.admin-skeleton strong{
  background:linear-gradient(90deg,var(--fill),color-mix(in srgb,var(--fill) 62%,var(--surface-strong) 38%),var(--fill));
  background-size:220% 100%;
}
.permission-group{
  border:0;
  border-radius:15px;
  background:var(--fill);
  box-shadow:inset 0 0 0 1px var(--border);
}
.permission-group summary{padding:12px 14px;font-weight:680}
.switch-cell span{border:0;background:var(--secondary);box-shadow:inset 0 0 0 1px var(--border)}
.switch-cell input:checked+span{background:var(--primary);border-color:transparent}
.switch-cell input:checked+span:before{background:#fff}
.os-lock{padding:16px}
.storage-overview-panel{
  border-radius:20px;
  background:color-mix(in srgb,var(--surface) 72%,transparent);
  box-shadow:0 8px 26px rgba(0,0,0,.055),inset 0 1px 0 color-mix(in srgb,#fff 18%,transparent);
}
.storage-toolbar{
  border-radius:15px;
  background:var(--fill);
  -webkit-backdrop-filter:none;
  backdrop-filter:none;
}
.storage-upload-button,.storage-empty-upload{border-radius:11px;font-weight:660}
.storage-search-shell{
  border-radius:11px;
  background:color-mix(in srgb,var(--surface) 72%,transparent);
  box-shadow:inset 0 0 0 1px var(--border);
}
.storage-search-shell:focus-within{border-color:transparent;box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 13%,transparent),inset 0 0 0 1px var(--primary)}
.storage-browser{
  border-radius:18px;
  background:color-mix(in srgb,var(--surface) 76%,transparent);
  box-shadow:0 8px 26px rgba(0,0,0,.045);
}
.storage-action-button{border:0;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border)}
.storage-empty-icon{border-radius:14px;background:var(--fill)}
@keyframes apple-toast-in{from{opacity:0;transform:translateY(-8px) scale(.98)}to{opacity:1;transform:none}}
@media (max-width:1050px){
  body.os-shell{padding:12px!important}
  .os-layout{height:calc(100dvh - 24px)}
  .os-main{border-radius:22px}
  .os-sidebar{border-radius:22px}
}
@media (max-width:620px){
  .os-main{padding:22px 16px}
  .os-hero{gap:14px}
  .os-hero h1{font-size:36px}
  .os-ai{min-width:0}
}
@media (prefers-reduced-motion:reduce){
  .admin-toast{animation:none!important}
  .admin-motion-card,.admin-metrics article,.settings-card-link,.admin-mini-row,.admin-log-row,.os-ai,.os-nav-title,.os-nav-items a{transition:background .12s ease,color .12s ease,opacity .12s ease!important}
}
@media (prefers-reduced-transparency:reduce){
  .os-sidebar,.os-main,.admin-drawer,.admin-confirm,.admin-toast,.admin-table-head,.audit-head,.storage-file-head{background:var(--surface)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
}
@media (prefers-contrast:more){
  .os-sidebar,.os-main,.os-card,.os-profile-card,.admin-motion-card,.admin-metrics article,.storage-overview-panel,.storage-browser{border-color:var(--border-strong)!important}
}

${profileStyles()}    /* SETTINGS_GENERAL_ROUTE_V1 */

    /* OS_APPLE_HUBS_V1 */
    .os-hub-grid{
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:14px;
      align-items:stretch;
    }
    .settings-hub-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
    .os-hub-card{
      position:relative;
      min-height:158px;
      display:flex;
      flex-direction:column;
      justify-content:space-between;
      gap:22px;
      padding:20px;
      overflow:hidden;
      color:var(--text);
      text-decoration:none;
      border:1px solid color-mix(in srgb,var(--border) 82%,transparent);
      border-radius:24px;
      background:color-mix(in srgb,var(--card) 78%,transparent);
      -webkit-backdrop-filter:blur(22px) saturate(150%);
      backdrop-filter:blur(22px) saturate(150%);
      box-shadow:0 10px 30px rgba(0,0,0,.055),inset 0 1px 0 color-mix(in srgb,#fff 24%,transparent);
      transform:translateZ(0);
      transition:transform 180ms cubic-bezier(.2,.8,.2,1),border-color 180ms ease,box-shadow 180ms ease,background 180ms ease;
      -webkit-tap-highlight-color:transparent;
    }
    .os-hub-card::after{
      content:"";
      position:absolute;
      inset:auto -50px -72px auto;
      width:150px;
      height:150px;
      border-radius:50%;
      background:color-mix(in srgb,var(--primary) 8%,transparent);
      filter:blur(4px);
      pointer-events:none;
    }
    .os-hub-card:hover{
      transform:translateY(-2px);
      border-color:color-mix(in srgb,var(--primary) 30%,var(--border));
      box-shadow:0 16px 38px rgba(0,0,0,.085),inset 0 1px 0 color-mix(in srgb,#fff 28%,transparent);
    }
    .os-hub-card:active{
      transform:scale(.985);
      transition-duration:80ms;
    }
    .os-hub-card:focus-visible{
      outline:none;
      border-color:var(--primary);
      box-shadow:0 0 0 4px color-mix(in srgb,var(--primary) 16%,transparent),0 16px 38px rgba(0,0,0,.08);
    }
    .os-hub-card.is-featured{
      grid-column:span 2;
      min-height:184px;
      background:
        radial-gradient(circle at 88% 18%,color-mix(in srgb,var(--primary) 20%,transparent),transparent 34%),
        linear-gradient(135deg,color-mix(in srgb,var(--primary) 11%,var(--card)),color-mix(in srgb,var(--card) 86%,transparent));
    }
    .settings-hub-grid .os-hub-card.is-featured{grid-column:span 2}
    .os-hub-card-top{
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap:12px;
    }
    .os-hub-icon{
      width:46px;
      height:46px;
      display:grid;
      place-items:center;
      flex:0 0 auto;
      border-radius:15px;
      color:var(--primary);
      background:color-mix(in srgb,var(--primary) 13%,var(--surface-soft));
      box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 11%,var(--border));
    }
    .os-hub-icon svg{width:23px;height:23px}
    .is-featured .os-hub-icon{
      width:52px;
      height:52px;
      border-radius:17px;
      color:var(--primary-ink);
      background:var(--primary);
      box-shadow:0 8px 20px color-mix(in srgb,var(--primary) 22%,transparent);
    }
    .os-hub-arrow{
      width:32px;
      height:32px;
      display:grid;
      place-items:center;
      border-radius:50%;
      color:var(--muted);
      background:color-mix(in srgb,var(--surface-soft) 88%,transparent);
      font-size:24px;
      font-weight:500;
      line-height:1;
      transition:transform 160ms ease,color 160ms ease,background 160ms ease;
    }
    .os-hub-card:hover .os-hub-arrow{
      transform:translateX(2px);
      color:var(--primary);
      background:color-mix(in srgb,var(--primary) 10%,var(--surface-soft));
    }
    .os-hub-card-copy{position:relative;z-index:1}
    .os-hub-card-title-row{
      display:flex;
      align-items:center;
      flex-wrap:wrap;
      gap:8px 10px;
    }
    .os-hub-card h2{
      margin:0;
      font-size:22px;
      line-height:1.15;
      letter-spacing:-.025em;
    }
    .os-hub-card small{
      display:inline-flex;
      align-items:center;
      min-height:24px;
      padding:0 9px;
      border-radius:999px;
      color:var(--muted);
      background:color-mix(in srgb,var(--surface-soft) 90%,transparent);
      font-size:11px;
      font-weight:760;
    }
    .os-hub-card p{
      max-width:620px;
      margin:9px 0 0;
      color:var(--muted);
      font-size:14px;
      line-height:1.55;
    }

    .settings-general-card{
      display:grid;
      gap:22px;
      padding:24px;
      border-radius:24px;
    }
    .settings-general-heading{
      display:grid;
      grid-template-columns:auto minmax(0,1fr);
      gap:15px;
      align-items:start;
    }
    .settings-general-heading h2{
      margin:3px 0 7px;
      font-size:24px;
      letter-spacing:-.025em;
    }
    .settings-general-heading p{
      max-width:760px;
      margin:0;
      color:var(--muted);
      line-height:1.6;
    }
    .settings-general-list{
      display:grid;
      border:1px solid var(--border);
      border-radius:18px;
      overflow:hidden;
      background:color-mix(in srgb,var(--surface-soft) 62%,transparent);
    }
    .settings-general-list>a{
      display:grid;
      grid-template-columns:auto minmax(0,1fr) auto;
      gap:13px;
      align-items:center;
      min-height:72px;
      padding:11px 14px;
      color:var(--text);
      text-decoration:none;
      border-top:1px solid var(--border);
      transition:background 130ms ease,transform 90ms ease;
    }
    .settings-general-list>a:first-child{border-top:0}
    .settings-general-list>a:hover{background:color-mix(in srgb,var(--primary) 6%,var(--surface-soft))}
    .settings-general-list>a:active{transform:scale(.995)}
    .settings-general-list .os-hub-icon{
      width:38px;
      height:38px;
      border-radius:12px;
    }
    .settings-general-list .os-hub-icon svg{width:19px;height:19px}
    .settings-general-list span strong,
    .settings-general-list span small{display:block}
    .settings-general-list span strong{font-size:15px}
    .settings-general-list span small{margin-top:3px;color:var(--muted);font-size:12px}
    .settings-general-list b{color:var(--muted);font-size:22px;font-weight:500}
    .settings-general-note{
      margin-top:14px;
      padding:18px 20px;
      border-radius:20px;
      background:color-mix(in srgb,var(--surface-soft) 58%,var(--card));
    }
    .settings-general-note p{margin:7px 0 0;color:var(--muted);line-height:1.55}

    @media(max-width:1080px){
      .settings-hub-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
    }
    @media(max-width:720px){
      .os-hub-grid,.settings-hub-grid{grid-template-columns:1fr}
      .os-hub-card.is-featured,.settings-hub-grid .os-hub-card.is-featured{grid-column:auto}
      .os-hub-card{min-height:146px;border-radius:21px}
      .settings-general-card{padding:18px}
    }
    @media(prefers-reduced-motion:reduce){
      .os-hub-card,.os-hub-arrow,.settings-general-list>a{transition:none!important}
      .os-hub-card:hover,.os-hub-card:active,.settings-general-list>a:active{transform:none!important}
    }
    @media(prefers-reduced-transparency:reduce){
      .os-hub-card{
        background:var(--card)!important;
        -webkit-backdrop-filter:none!important;
        backdrop-filter:none!important;
      }
    }
    @media(prefers-contrast:more){
      .os-hub-card,.settings-general-list{border-color:var(--text)}
      .os-hub-card small{color:var(--text)}
    }
    /* COMPACT_BACK_NAV_V2 */
    @media(max-width:900px){
      .compact-back-zone{width:72px;height:72px}
      .compact-back-button{width:48px!important;min-width:48px!important;max-width:48px!important;height:48px!important;min-height:48px!important;max-height:48px!important;padding:0!important;border-radius:50%!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:0!important;margin:0!important;font-size:0!important;line-height:0!important;letter-spacing:0!important;-webkit-backdrop-filter:blur(22px) saturate(160%);backdrop-filter:blur(22px) saturate(160%);transition:transform .12s ease,background .15s ease,border-color .15s ease,box-shadow .15s ease!important}
      .compact-back-button span{display:none!important}
      .compact-back-button svg{display:block!important;width:22px!important;height:22px!important;flex:0 0 22px!important;overflow:visible!important;fill:none!important;stroke:currentColor!important;stroke-width:2.2!important;stroke-linecap:round!important;stroke-linejoin:round!important;transform:none!important;transform-origin:50% 50%!important}
      :root:not([data-theme="light"]) .compact-back-button{background:#000!important;color:#fff!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:0 10px 28px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.09)!important}
      :root[data-theme="light"] .compact-back-button{background:rgba(255,255,255,.94)!important;color:#111!important;border:1px solid rgba(17,24,39,.10)!important;box-shadow:0 10px 26px rgba(18,26,38,.12),inset 0 1px 0 rgba(255,255,255,.75)!important}
      .compact-back-button:active{transform:scale(.955)!important}
    }

    /* MAIN_MENU_IA_2026 */
    .compact-main-menu{display:none}
    .os-nav-entry>.os-nav-title{position:relative;display:flex;align-items:center;gap:10px;flex-wrap:nowrap}
    .os-nav-entry>.os-nav-title .dashboard-icon{flex:0 0 auto}
    .os-nav-entry>.os-nav-title span{min-width:0;flex:1}
    .os-nav-entry>.os-nav-title::after{margin-left:0}
    .os-nav-group:not(.is-active) .os-nav-title{color:var(--muted)}
    .os-nav-group:not(.is-active) .os-nav-title:hover{color:var(--text)}
    .os-nav-group.is-active>.os-nav-title{font-weight:760}
    .os-nav-group.is-active .os-nav-items{margin-top:4px;padding-left:46px!important}
    .os-nav-group.is-active .os-nav-items .dashboard-icon{display:none!important}

    /* DESKTOP_MAIN_MENU_V2
       Root / reuses the compact/mobile card language at desktop scale. */
    @media(min-width:1051px){
      body.os-shell.os-root-menu{
        height:auto!important;
        min-height:100vh!important;
        overflow-x:hidden!important;
        overflow-y:auto!important;
        padding:24px!important
      }
      body.os-shell.os-root-menu .os-layout{
        display:block!important;
        width:100%!important;
        height:auto!important;
        min-height:calc(100vh - 48px)!important;
        max-width:1440px!important;
        margin:0 auto!important;
      }
      body.os-shell.os-root-menu .os-sidebar{display:none!important}
      body.os-shell.os-root-menu .os-main{
        width:100%!important;
        height:auto!important;
        min-height:calc(100vh - 48px)!important;
        overflow:visible!important;
        padding:clamp(34px,4.4vw,68px)!important;
        border-radius:30px!important;
        background:
          radial-gradient(760px 420px at 96% -4%,color-mix(in srgb,var(--primary) 13%,transparent),transparent 72%),
          var(--surface)!important;
      }
      body.os-shell.os-root-menu #os-content{max-width:1260px;margin:0 auto}
      .desktop-main-menu .compact-main-menu{display:grid;gap:30px}
      .desktop-main-menu .compact-menu-hero{max-width:820px;padding:4px 0 8px}
      .desktop-main-menu .compact-menu-hero small{
        display:block;margin:0 0 12px;color:var(--primary);
        font-size:11px;font-weight:800;letter-spacing:.16em
      }
      .desktop-main-menu .compact-menu-hero h1{
        margin:0;max-width:11ch;font-size:clamp(52px,5vw,82px);
        line-height:.93;letter-spacing:-.065em;font-weight:780
      }
      .desktop-main-menu .compact-menu-hero p{
        max-width:58ch;margin:16px 0 0;color:var(--muted);
        font-size:15px;line-height:1.65
      }
      .desktop-main-menu .compact-menu-grid{
        display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px
      }
      .desktop-main-menu .compact-menu-product-grid{
        display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px
      }
      .desktop-main-menu .compact-menu-card{
        position:relative;overflow:hidden;display:grid;
        grid-template-columns:auto minmax(0,1fr);align-items:center;gap:15px;
        min-height:128px;padding:20px 54px 20px 20px;border:1px solid color-mix(in srgb,var(--primary) 20%,var(--border));
        border-radius:24px;
        background:
          radial-gradient(300px 170px at 96% 0%,color-mix(in srgb,var(--primary) 13%,transparent),transparent 74%),
          linear-gradient(155deg,color-mix(in srgb,var(--card) 97%,var(--primary) 3%),var(--card));
        color:var(--text);text-decoration:none;
        box-shadow:0 12px 32px rgba(0,0,0,.055),inset 0 1px 0 color-mix(in srgb,#fff 16%,transparent);
        transition:transform .28s cubic-bezier(.16,1,.3,1),border-color .2s ease,box-shadow .28s cubic-bezier(.16,1,.3,1),background .2s ease
      }
      .desktop-main-menu .compact-menu-card-icon{
        display:grid;place-items:center;width:46px;height:46px;border-radius:15px;
        background:var(--fill);color:var(--primary);box-shadow:inset 0 0 0 1px var(--border)
      }

      .desktop-main-menu .compact-menu-card-icon .dashboard-icon{
        width:22px!important;height:22px!important;padding:0!important;border:0!important;
        border-radius:0!important;background:transparent!important;color:inherit!important;box-shadow:none!important
      }
      .desktop-main-menu .compact-menu-card-icon .dashboard-icon svg{width:22px!important;height:22px!important}
      .desktop-main-menu .compact-menu-card-copy{min-width:0;display:block}
      .desktop-main-menu .compact-menu-card-copy strong{
        display:block;font-size:19px;line-height:1.15;letter-spacing:-.035em
      }

      .desktop-main-menu .compact-menu-card-copy small{
        display:block;margin-top:7px;color:var(--muted);font-size:12px;line-height:1.48
      }
      .desktop-main-menu .compact-menu-card::after{
        content:"↗";
        position:absolute;
        right:20px;
        top:50%;
        color:var(--quiet);
        font-size:18px;
        font-weight:500;
        line-height:1;
        transform:translateY(-50%);
        pointer-events:none
      }

      .desktop-main-menu .compact-menu-products{display:grid;gap:10px}
      .desktop-main-menu .compact-menu-section-label{
        margin:0 2px;color:var(--muted);font-size:10px;font-weight:760;
        letter-spacing:.12em;text-transform:uppercase
      }
      .desktop-main-menu .compact-menu-product-grid .compact-menu-card{
        min-height:128px
      }
      @media(hover:hover) and (pointer:fine){
        .desktop-main-menu .compact-menu-card:hover{
          transform:translateY(-3px);border-color:var(--border-strong);
          box-shadow:0 20px 46px rgba(0,0,0,.085),inset 0 1px 0 color-mix(in srgb,#fff 18%,transparent)
        }

      }
    }

    @media(max-width:1050px){
      html.compact-menu-view .os-sidebar,
      html:not(.compact-content-view):not(.compact-menu-view) .os-sidebar{
        padding:clamp(18px,3.8vw,34px)!important;
        background:
          radial-gradient(760px 440px at 92% -10%,color-mix(in srgb,var(--primary) 14%,transparent),transparent 70%),
          color-mix(in srgb,var(--glass-heavy) 96%,transparent)!important;
      }
      html.compact-menu-view .os-sidebar>.os-brand,
      html:not(.compact-content-view):not(.compact-menu-view) .os-sidebar>.os-brand{
        margin:0 0 22px!important;
      }
      html.compact-menu-view .os-sidebar>.os-user,
      html:not(.compact-content-view):not(.compact-menu-view) .os-sidebar>.os-user,
      html.compact-menu-view .os-sidebar>.os-nav,
      html:not(.compact-content-view):not(.compact-menu-view) .os-sidebar>.os-nav{
        display:none!important;
      }
      html.compact-menu-view .compact-main-menu,
      html:not(.compact-content-view):not(.compact-menu-view) .compact-main-menu{
        display:grid;
        gap:22px;
      }
      .compact-menu-hero{
        max-width:760px;
        padding:6px 0 4px;
      }
      .compact-menu-hero small{
        display:block;
        margin:0 0 10px;
        color:var(--primary);
        font-size:11px;
        font-weight:800;
        letter-spacing:.16em;
      }
      .compact-menu-hero h1{
        margin:0;
        max-width:10ch;
        font-size:clamp(44px,9vw,74px);
        line-height:.94;
        letter-spacing:-.065em;
        font-weight:780;
      }
      .compact-menu-hero p{
        max-width:52ch;
        margin:14px 0 0;
        color:var(--muted);
        font-size:14px;
        line-height:1.6;
      }
      .compact-menu-grid,
      .compact-menu-product-grid{
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:12px;
      }
      .compact-menu-card{
        position:relative;
        overflow:hidden;
        display:grid;
        grid-template-columns:auto minmax(0,1fr);
        align-items:center;
        gap:14px;
        min-height:118px;
        padding:18px 52px 18px 18px;
        border:1px solid color-mix(in srgb,var(--primary) 20%,var(--border));
        border-radius:22px;
        background:
          radial-gradient(280px 160px at 96% 0%,color-mix(in srgb,var(--primary) 12%,transparent),transparent 74%),
          linear-gradient(155deg,color-mix(in srgb,var(--card) 97%,var(--primary) 3%),var(--card));
        color:var(--text);
        text-decoration:none;
        box-shadow:0 12px 32px rgba(0,0,0,.055),inset 0 1px 0 color-mix(in srgb,#fff 16%,transparent);
        transition:transform .28s cubic-bezier(.16,1,.3,1),border-color .2s ease,box-shadow .28s cubic-bezier(.16,1,.3,1),background .2s ease;
      }
      .compact-menu-card-icon{
        display:grid;
        place-items:center;
        width:44px;
        height:44px;
        border-radius:14px;
        background:var(--fill);
        color:var(--primary);
        box-shadow:inset 0 0 0 1px var(--border);
      }

      .compact-menu-card-icon .dashboard-icon{
        width:22px!important;
        height:22px!important;
        padding:0!important;
        border:0!important;
        border-radius:0!important;
        background:transparent!important;
        color:inherit!important;
        box-shadow:none!important;
      }
      .compact-menu-card-icon .dashboard-icon svg{width:22px!important;height:22px!important}
      .compact-menu-card-copy{min-width:0;display:block}
      .compact-menu-card-copy strong{
        display:block;
        font-size:18px;
        line-height:1.15;
        letter-spacing:-.035em;
      }

      .compact-menu-card-copy small{
        display:block;
        margin-top:6px;
        color:var(--muted);
        font-size:11.5px;
        line-height:1.45;
      }
      .compact-menu-card::after{
        content:"↗";
        position:absolute;
        right:18px;
        top:50%;
        color:var(--quiet);
        font-size:18px;
        font-weight:500;
        line-height:1;
        transform:translateY(-50%);
        pointer-events:none;
      }

      .compact-menu-products{display:grid;gap:10px}
      .compact-menu-section-label{
        margin:0 2px;
        color:var(--muted);
        font-size:10px;
        font-weight:760;
        letter-spacing:.12em;
        text-transform:uppercase;
      }
      .compact-menu-product-grid .compact-menu-card{
        min-height:118px;
      }
      @media(hover:hover) and (pointer:fine){
        .compact-menu-card:hover{
          transform:translateY(-3px);
          border-color:var(--border-strong);
          box-shadow:0 20px 46px rgba(0,0,0,.085),inset 0 1px 0 color-mix(in srgb,#fff 18%,transparent);
        }

      }
    }
    @media(max-width:620px){
      html.compact-menu-view .os-sidebar,
      html:not(.compact-content-view):not(.compact-menu-view) .os-sidebar{
        padding:18px 14px 24px!important;
      }
      .compact-menu-grid,.compact-menu-product-grid{grid-template-columns:1fr}
      .compact-menu-card{min-height:104px;padding:16px 48px 16px 16px}
      .compact-menu-hero h1{font-size:clamp(44px,14vw,62px)}
      .compact-menu-hero p{font-size:13px}
    }
    @media(prefers-reduced-motion:reduce){
      .compact-menu-card{transition:none!important;transform:none!important}
    }

${dashboardStyles()}${knowledgeStyles()}</style>`;
}

