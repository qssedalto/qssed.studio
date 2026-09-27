const NAV = [
  ["/", "总览", "OV"],
  ["/users", "用户", "US"],
  ["/roles", "角色与权限", "RL"],
  ["/access", "访问控制", "AC"],
  ["/content", "内容", "CT"],
  ["/storage", "存储", "ST"],
  ["/billing", "订阅与权益", "BL"],
  ["/student-verification", "学生认证", "SV"],
  ["/intelligence", "AERTEX Intelligence", "AI"],
  ["/logs", "审计日志", "LG"],
  ["/system", "系统", "SY"]
];

export function renderAdminConsole(route, options = {}) {
  const current = NAV.some(([path]) => path === route) ? route : "/";
  const identity = escapeHtml(options.identity || "管理员");
  const root = escapeHtml(options.root || "qsseda.com");
  const build = escapeHtml(options.build || "control-plane-v1");

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="color-scheme" content="dark">
<title>AERTEX 管理控制台</title>
<style>
:root{
  color-scheme:dark;
  --bg:#090c10;--panel:#0e1319;--panel2:#121820;--line:#27313c;--line2:#1b232c;
  --text:#e8edf3;--muted:#8b98a7;--quiet:#657281;--accent:#78a9ff;--good:#50d890;
  --warn:#f0b35d;--bad:#ff6b6b;--code:#0a1016;
  font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text)}
body{font-size:13px}
button,input,select,textarea{font:inherit}
.app{min-height:100vh;display:grid;grid-template-columns:238px minmax(0,1fr)}
.side{position:sticky;top:0;height:100vh;border-right:1px solid var(--line);background:#0b0f14;padding:14px 12px;display:flex;flex-direction:column;gap:14px}
.brand{padding:8px 10px 12px;border-bottom:1px solid var(--line2)}
.brand strong{display:block;font-size:14px;letter-spacing:.09em}
.brand span{display:block;margin-top:5px;color:var(--quiet);font:10px ui-monospace,SFMono-Regular,Menlo,monospace}
.env{display:flex;align-items:center;gap:8px;margin:0 10px;padding:8px 10px;border:1px solid #2a3a2f;background:#0d1711;color:#9deab9;font:10px ui-monospace,SFMono-Regular,Menlo,monospace}
.env:before{content:"";width:7px;height:7px;border-radius:50%;background:var(--good)}
nav{display:grid;gap:3px}
nav a{display:grid;grid-template-columns:28px 1fr;align-items:center;min-height:38px;padding:0 9px;color:var(--muted);text-decoration:none;border:1px solid transparent}
nav a b{font:10px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--quiet)}
nav a:hover{background:var(--panel)}
nav a.active{color:var(--text);background:var(--panel2);border-color:var(--line)}
.sidefoot{margin-top:auto;padding:10px;color:var(--quiet);font:10px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}
.sidefoot button{margin-top:10px;width:100%;height:34px;border:1px solid var(--line);background:transparent;color:var(--muted);cursor:pointer}
.main{min-width:0}
.top{height:54px;position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:14px;padding:0 20px;border-bottom:1px solid var(--line);background:rgba(9,12,16,.92);backdrop-filter:blur(16px)}
.top .path{font:11px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--quiet)}
.top .who{margin-left:auto;color:var(--muted);font-size:11px}
.content{padding:22px;max-width:1500px;margin:0 auto}
.head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:18px}
.head h1{margin:0;font-size:24px;letter-spacing:-.025em}
.head p{margin:6px 0 0;color:var(--muted);line-height:1.5}
.tools{display:flex;gap:8px}
.btn{height:34px;padding:0 12px;border:1px solid var(--line);background:var(--panel2);color:var(--text);cursor:pointer}
.btn.primary{border-color:#355b93;background:#15335b;color:#d7e7ff}
.btn.danger{border-color:#6a3030;background:#251313;color:#ff9a9a}
.btn:disabled{opacity:.45;cursor:not-allowed}
.inline{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.inline select,.inline input,.compactInput,.multiSelect{min-height:32px;border:1px solid var(--line);background:#0b1016;color:var(--text);padding:5px 8px}
.multiSelect{min-height:78px;min-width:190px}
.stack{display:grid;gap:8px}
.stack label{display:grid;gap:4px;color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.05em}
.stack input,.stack select,.stack textarea{width:100%;border:1px solid var(--line);background:#0b1016;color:var(--text);padding:8px}
.stack textarea{min-height:72px;resize:vertical}
.controlGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:12px}
.permissionGrid{display:grid;gap:8px;padding:12px}
.permissionRole{border:1px solid var(--line2);background:#0b1016;padding:12px}
.permissionRoleHead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:9px}
.permissionChecks{display:flex;gap:7px;flex-wrap:wrap}
.permissionChecks label{display:flex;align-items:center;gap:5px;padding:5px 7px;border:1px solid var(--line2);color:var(--muted);font:10px ui-monospace,SFMono-Regular,Menlo,monospace}
.feedback{min-height:18px;padding:0 12px 10px;color:var(--muted);font-size:11px}
.feedback.ok{color:var(--good)}.feedback.bad{color:var(--bad)}
.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.card{border:1px solid var(--line);background:var(--panel);padding:14px}
.metric small{display:block;color:var(--quiet);font:10px ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;letter-spacing:.06em}
.metric strong{display:block;margin-top:8px;font-size:24px;letter-spacing:-.03em}
.section{margin-top:12px;border:1px solid var(--line);background:var(--panel)}
.sectionHead{min-height:42px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 13px;border-bottom:1px solid var(--line)}
.sectionHead h2{margin:0;font-size:12px;letter-spacing:.02em}
.state{padding:30px 14px;color:var(--muted)}
.tableWrap{overflow:auto}
table{border-collapse:collapse;width:100%;min-width:760px}
th,td{text-align:left;padding:9px 11px;border-bottom:1px solid var(--line2);vertical-align:top}
th{position:sticky;top:0;background:#10161d;color:var(--quiet);font:10px ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase}
td{font-size:11px;color:#cfd6df}
td.mono,.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
pre{margin:0;padding:14px;overflow:auto;background:var(--code);color:#c5d2df;font:11px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace}
.form{display:grid;grid-template-columns:1.3fr .7fr 1fr 1.5fr auto;gap:8px;padding:12px}
.form input,.form select{height:34px;border:1px solid var(--line);background:#0b1016;color:var(--text);padding:0 9px;min-width:0}
.split{display:grid;grid-template-columns:1.2fr .8fr;gap:12px}
.badge{display:inline-block;padding:3px 6px;border:1px solid var(--line);font:9px ui-monospace,SFMono-Regular,Menlo,monospace}
.badge.ok{border-color:#235d3c;color:#8de5ad;background:#0e1b14}

.badge.bad{border-color:#6a3030;color:#ff9999;background:#1c1010}

.studentVerify{display:grid;gap:14px}
.studentSummary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.studentSummaryCard{min-height:104px;border:1px solid var(--line);background:linear-gradient(180deg,#10161d,#0d1218);padding:16px;display:grid;grid-template-columns:48px minmax(0,1fr);gap:14px;align-items:center}
.studentSummaryIcon{width:48px;height:48px;display:grid;place-items:center;border:1px solid #29415e;background:#101d2c;color:#8eb7ff;font-size:19px;font-weight:800}
.studentSummaryCard small{display:block;color:var(--muted);font-size:11px}
.studentSummaryCard strong{display:block;margin-top:5px;font-size:28px;line-height:1}
.studentInfo{border:1px solid #2e537e;background:linear-gradient(180deg,rgba(21,51,91,.28),rgba(14,19,25,.92));padding:16px;display:grid;grid-template-columns:32px minmax(0,1fr);gap:12px}
.studentInfoIcon{width:28px;height:28px;border:1px solid #4c7db8;border-radius:50%;display:grid;place-items:center;color:#8eb7ff;font-weight:800}
.studentInfo h3{margin:0 0 7px;font-size:13px}
.studentInfo p{margin:0;color:var(--muted);font-size:11px;line-height:1.7}
.studentRequestSection{border:1px solid var(--line);background:var(--panel)}
.studentRequestHead{min-height:48px;padding:0 14px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:12px}
.studentRequestHead h2{margin:0;font-size:13px}
.studentRequestHead span{color:var(--muted);font-size:11px}
.studentRequestList{display:grid;gap:12px;padding:12px}
.studentRequestCard{border:1px solid var(--line2);background:#0b1016;padding:14px;display:grid;gap:12px}
.studentRequestTop{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.studentIdentity{min-width:0}
.studentIdentity strong{display:block;font-size:13px}
.studentIdentity span{display:block;margin-top:4px;color:var(--quiet);font:10px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;overflow-wrap:anywhere}
.studentStatus{display:inline-flex;align-items:center;justify-content:center;min-height:26px;padding:0 9px;border:1px solid #76551f;background:#241b0c;color:#f4c870;font-size:10px;white-space:nowrap}
.studentStatus.verified{border-color:#235d3c;background:#0e1b14;color:#8de5ad}
.studentStatus.expired{border-color:#495461;background:#151b22;color:#9ba7b4}
.studentStatus.rejected{border-color:#6a3030;background:#1c1010;color:#ff9999}
.studentRequestGrid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(160px,.8fr);gap:10px}
.studentField{min-width:0;border-top:1px solid var(--line2);padding-top:9px}
.studentField.wide{grid-column:1/-1}
.studentField label{display:block;margin-bottom:6px;color:var(--quiet);font-size:10px;text-transform:uppercase;letter-spacing:.04em}
.studentFieldValue{min-height:34px;display:flex;align-items:center;gap:7px;flex-wrap:wrap;color:var(--text);font-size:11px;line-height:1.5}
.studentCode{font:12px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.04em;overflow-wrap:anywhere}
.studentField input{width:100%;min-width:0;height:38px;border:1px solid var(--line);background:#0a0f15;color:var(--text);padding:0 10px}
.studentField input:focus{outline:none;border-color:#355b93;box-shadow:0 0 0 2px rgba(53,91,147,.18)}
.studentVerifyLinks{display:flex;gap:7px;flex-wrap:wrap}
.studentVerifyLinks .btn{height:32px}
.studentActions{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding-top:2px}
.studentActions .btn{height:44px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;white-space:nowrap}
.studentActions .primary{background:#174b89;border-color:#3a74ba;color:#eff6ff}
.studentActions .danger{background:#2a1414;border-color:#8a3a3a;color:#ffadad}
.studentEmpty{padding:28px 16px;color:var(--muted);text-align:center}
.aiSummary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:12px}
.aiSummary .metric{min-height:78px}
.aiWorkbench{display:grid;gap:12px}
.aiCreateGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:12px}
.aiField{display:grid;gap:5px;min-width:0}
.aiField label{color:var(--quiet);font-size:10px;text-transform:uppercase;letter-spacing:.05em}
.aiField input,.aiField select{width:100%;min-width:0;height:34px;border:1px solid var(--line);background:#0b1016;color:var(--text);padding:0 9px}
.aiKeyRow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px}
.aiStatusLine{min-height:18px;color:var(--muted);font-size:10px;line-height:1.45}
.aiStatusLine.ok{color:var(--good)}.aiStatusLine.bad{color:var(--bad)}.aiStatusLine.warn{color:var(--warn)}
.aiPicker{width:100%;min-height:34px;display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid var(--line);background:#0b1016;color:var(--text);padding:6px 9px;cursor:pointer;text-align:left}
.aiPicker:disabled{opacity:.45;cursor:not-allowed}.aiPicker span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.aiProviderList{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:12px}
.aiProviderCard{border:1px solid var(--line2);background:#0b1016;padding:13px;min-width:0}
.aiProviderHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.aiProviderTitle{min-width:0}.aiProviderTitle strong{display:block;font-size:13px}.aiProviderTitle span{display:block;margin-top:4px;color:var(--quiet);font:10px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;overflow-wrap:anywhere}
.aiProviderActions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.aiMetrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin-top:11px}
.aiMiniMetric{border:1px solid var(--line2);background:var(--panel);padding:9px;min-width:0}
.aiMiniMetric span{display:block;color:var(--quiet);font-size:9px;text-transform:uppercase;letter-spacing:.04em}
.aiMiniMetric strong{display:block;margin-top:5px;font-size:13px;overflow:hidden;text-overflow:ellipsis}
.aiUserList{display:grid;gap:8px;padding:12px}
.aiUserCard{border:1px solid var(--line2);background:#0b1016;padding:12px}
.aiUserHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px}
.aiUserHead strong{font-size:12px}.aiUserHead span{display:block;margin-top:3px;color:var(--quiet);font:10px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace}
.aiUserUsage{color:var(--muted);font-size:10px;text-align:right;white-space:nowrap}
.aiAccessGrid{display:grid;grid-template-columns:.7fr 1fr 1fr repeat(5,minmax(90px,.7fr)) auto;gap:7px;align-items:end}
.aiSaveCell{display:grid;gap:5px}.aiSaveFeedback{min-height:15px;font-size:10px;color:var(--muted)}.aiSaveFeedback.ok{color:var(--good)}.aiSaveFeedback.bad{color:var(--bad)}
.aiDialog{width:min(650px,calc(100vw - 28px));max-height:min(82vh,760px);padding:0;border:1px solid var(--line);background:var(--panel2);color:var(--text);box-shadow:0 24px 90px rgba(0,0,0,.55)}
.aiDialog::backdrop{background:rgba(0,0,0,.6);backdrop-filter:blur(3px)}
.aiDialogHead{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid var(--line)}
.aiDialogHead strong{font-size:13px}.aiDialogBody{padding:12px 16px;overflow:auto;max-height:60vh}.aiDialogFoot{display:flex;justify-content:flex-end;gap:7px;padding:12px 16px;border-top:1px solid var(--line)}
.aiChoice{display:flex;align-items:flex-start;gap:8px;padding:9px 2px;border-bottom:1px solid var(--line2);color:var(--muted);font-size:11px}.aiChoice:last-child{border-bottom:0}.aiChoice input{margin-top:1px;accent-color:var(--accent)}
.aiChoice strong{color:var(--text)}.aiDialogProvider{padding:10px 0}.aiDialogProvider+.aiDialogProvider{border-top:1px solid var(--line2)}
.aiDialogGrid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.aiDialogGrid .wide{grid-column:1/-1}
.aiEmpty{padding:26px 12px;color:var(--muted);text-align:center}
.aiWorkbench .hint{color:var(--muted);font-size:10px;line-height:1.5}.aiWorkbench .status{min-height:20px;margin:0 0 10px}
.aiWorkbench label{display:block;margin:7px 0 4px;color:var(--quiet);font-size:10px;text-transform:uppercase;letter-spacing:.04em}
.aiWorkbench input,.aiWorkbench select{width:100%;min-width:0;height:34px;border:1px solid var(--line);background:#0b1016;color:var(--text);padding:0 9px}
.aiWorkbench .keyRow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px}.aiWorkbench .checkKeyButton{border:1px solid var(--line);background:var(--panel2);color:var(--text);padding:0 11px;cursor:pointer}
.aiWorkbench .keyStatus{min-height:17px;margin-top:5px;color:var(--muted);font-size:10px}.aiWorkbench .keyStatus.ok{color:var(--good)}.aiWorkbench .keyStatus.bad{color:var(--bad)}.aiWorkbench .keyStatus.warn{color:var(--warn)}
.aiWorkbench .pickerButton{width:100%;min-height:34px;display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid var(--line);background:#0b1016;color:var(--text);padding:6px 9px;cursor:pointer;text-align:left}
.aiWorkbench .pickerButton:disabled{opacity:.45;cursor:not-allowed}.aiWorkbench .pickerValue{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.aiWorkbench .pickerChevron{color:var(--quiet)}
.aiWorkbench .providerCard{border-top:1px solid var(--line2);padding:13px 0}.aiWorkbench .providerTop{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.aiWorkbench .providerName{font-weight:700;font-size:12px}.aiWorkbench .providerActions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.aiWorkbench .smallButton{height:30px;padding:0 9px;border:1px solid var(--line);background:var(--panel2);color:var(--text);cursor:pointer}.aiWorkbench .dangerButton{color:var(--bad)}
.aiWorkbench .metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin-top:10px}.aiWorkbench .metrics .metric{border:1px solid var(--line2);background:var(--panel);padding:9px}.aiWorkbench .metrics .metric span{display:block;color:var(--quiet);font-size:9px}.aiWorkbench .metrics .metric strong{display:block;margin-top:4px;font-size:13px}
.aiWorkbench .statusPill{display:inline-flex;align-items:center;gap:6px}.aiWorkbench .statusDot{width:7px;height:7px;border-radius:50%;background:var(--quiet);display:inline-block}.aiWorkbench .statusDot.active{background:var(--good)}
.aiWorkbench .pill{display:inline-block;padding:3px 6px;border:1px solid var(--line);font:9px ui-monospace,SFMono-Regular,Menlo,monospace}
.aiWorkbench .user{display:grid;grid-template-columns:minmax(190px,1.4fr) repeat(4,minmax(115px,1fr));gap:8px;align-items:end;border-top:1px solid var(--line2);padding:12px 0;min-width:0}.aiWorkbench .user>*{min-width:0}.aiWorkbench .userName{align-self:center}.aiWorkbench .userName strong,.aiWorkbench .userName .hint{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.aiWorkbench .accessCell{display:grid;gap:5px}.aiWorkbench .accessFeedback{min-height:15px;font-size:10px;color:var(--muted)}.aiWorkbench .accessFeedback.ok{color:var(--good)}.aiWorkbench .accessFeedback.bad{color:var(--bad)}.aiWorkbench .access.isSaved{border-color:#235d3c;color:var(--good)}
.aiWorkbench .primary{height:32px;padding:0 11px;border:1px solid #355b93;background:#15335b;color:#d7e7ff;cursor:pointer}.aiWorkbench .primary:disabled{opacity:.45;cursor:not-allowed}
.aiDialog .keyRow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px}.aiDialog .checkKeyButton{height:34px;padding:0 10px;border:1px solid var(--line);background:var(--panel);color:var(--text);cursor:pointer}
.aiDialog .keyStatus{min-height:17px;margin-top:5px;color:var(--muted);font-size:10px}.aiDialog .keyStatus.ok{color:var(--good)}.aiDialog .keyStatus.bad{color:var(--bad)}.aiDialog .keyStatus.warn{color:var(--warn)}
.aiDialog .pickerButton{width:100%;min-height:34px;display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid var(--line);background:#0b1016;color:var(--text);padding:6px 9px;cursor:pointer;text-align:left}.aiDialog .pickerValue{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.aiDialog .pickerChevron{color:var(--quiet)}
.aiDialog .providerCard{padding:10px 0}.aiDialog .providerCard+.providerCard{border-top:1px solid var(--line2)}.aiDialog .providerName{font-weight:700;color:var(--text);margin-bottom:5px}
.aiDialog .choice strong{color:var(--text)}

.aiDialog .dialogHead{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid var(--line)}.aiDialog .dialogBody{padding:12px 16px;overflow:auto;max-height:60vh}.aiDialog .dialogFoot{display:flex;justify-content:flex-end;gap:7px;padding:12px 16px;border-top:1px solid var(--line)}
.aiDialog .secondaryBtn{height:32px;padding:0 10px;border:1px solid var(--line);background:var(--panel);color:var(--text)}.aiDialog .primary{height:32px;padding:0 10px;border:1px solid #355b93;background:#15335b;color:#d7e7ff}
.aiDialog .choice{display:flex;align-items:flex-start;gap:8px;padding:9px 2px;border-bottom:1px solid var(--line2);color:var(--muted);font-size:11px}.aiDialog .choice:last-child{border-bottom:0}.aiDialog .choice input{width:auto;height:auto;margin-top:1px;accent-color:var(--accent)}
.aiDialog label{display:block;margin:8px 0 4px;color:var(--quiet);font-size:10px;text-transform:uppercase;letter-spacing:.04em}.aiDialog input{width:100%;height:34px;border:1px solid var(--line);background:#0b1016;color:var(--text);padding:0 9px}
@media(max-width:1200px){.aiWorkbench .user{grid-template-columns:repeat(3,minmax(0,1fr))}.aiWorkbench .userName{grid-column:1/-1}.aiWorkbench .metrics{grid-template-columns:repeat(2,1fr)}}
@media(max-width:700px){.aiWorkbench .user{grid-template-columns:1fr 1fr}.aiWorkbench .providerTop{display:grid}.aiWorkbench .providerActions{justify-content:flex-start}.aiWorkbench .metrics{grid-template-columns:1fr 1fr}}

@media(max-width:1200px){.aiAccessGrid{grid-template-columns:repeat(4,minmax(0,1fr))}.aiSaveCell{grid-column:span 2}.aiProviderList{grid-template-columns:1fr}.aiMetrics{grid-template-columns:repeat(2,1fr)}}
@media(max-width:760px){.aiSummary{grid-template-columns:1fr 1fr}.aiCreateGrid{grid-template-columns:1fr}.aiAccessGrid{grid-template-columns:1fr 1fr}.aiSaveCell{grid-column:1/-1}.aiDialogGrid{grid-template-columns:1fr}.aiDialogGrid .wide{grid-column:auto}}

@media(max-width:1000px){.app{grid-template-columns:1fr}.side{position:static;height:auto;border-right:0;border-bottom:1px solid var(--line)}nav{grid-template-columns:repeat(3,minmax(0,1fr))}.sidefoot{display:none}.grid{grid-template-columns:repeat(2,1fr)}.split{grid-template-columns:1fr}.form{grid-template-columns:1fr 1fr}.form .wide{grid-column:1/-1}.controlGrid{grid-template-columns:1fr 1fr}}
@media(max-width:700px){
  .studentSummary{grid-template-columns:1fr 1fr}
  .studentSummaryCard{min-height:92px;padding:13px;grid-template-columns:40px minmax(0,1fr);gap:11px}
  .studentSummaryIcon{width:40px;height:40px}
  .studentRequestGrid{grid-template-columns:1fr}
  .studentField.wide{grid-column:auto}
  .studentActions{grid-template-columns:1fr 1fr}
}
@media(max-width:560px){
  .content{padding:14px}.grid{grid-template-columns:1fr 1fr}nav{grid-template-columns:1fr 1fr}.head{align-items:flex-start;display:grid}.form{grid-template-columns:1fr}.controlGrid{grid-template-columns:1fr}
  .studentVerify{gap:12px}
  .studentSummary{gap:8px}
  .studentSummaryCard{padding:12px;grid-template-columns:1fr;gap:8px;align-content:start}
  .studentSummaryIcon{width:36px;height:36px}
  .studentSummaryCard strong{font-size:24px}
  .studentInfo{padding:14px;grid-template-columns:28px minmax(0,1fr)}
  .studentInfo p{font-size:12px;line-height:1.65}
  .studentRequestList{padding:10px}
  .studentRequestCard{padding:12px}
  .studentActions .btn{height:46px;font-size:12px}
}
</style>
</head>
<body data-route="${escapeHtml(current)}">
<div class="app">
  <aside class="side">
    <div class="brand"><strong>AERTEX ADMIN</strong><span>管理控制面 · ${build}</span></div>
    <div class="env">生产环境 · ${root}</div>
    <nav>
      ${NAV.map(([path,label,code])=>`<a href="${path}" class="${path===current?"active":""}"><b>${code}</b><span>${escapeHtml(label)}</span></a>`).join("")}
    </nav>
    <div class="sidefoot">
      <div>${identity}</div>
      <div>此管理界面与用户产品完全隔离。</div>
      <button id="logout" type="button">退出管理员会话</button>
    </div>
  </aside>
  <main class="main">
    <header class="top"><span class="path">admin://${escapeHtml(current === "/" ? "overview" : current.slice(1))}</span><span class="who">${identity}</span></header>
    <div class="content">
      <div class="head">
        <div><h1 id="pageTitle">加载中…</h1><p id="pageDescription">正在读取管理状态。</p></div>
        <div class="tools"><button class="btn" id="refresh" type="button">刷新</button></div>
      </div>
      <div id="view"><div class="state">正在加载管理数据…</div></div>
    </div>
  </main>
</div>
<script>
(()=> {
  const route=document.body.dataset.route||"/";
  const view=document.getElementById("view");
  const title=document.getElementById("pageTitle");
  const description=document.getElementById("pageDescription");
  const pageMeta={
    "/":["系统总览","查看运行状态和仅管理员可见的指标。"],
    "/users":["用户","管理账户、状态与角色分配。"],
    "/roles":["角色与权限","管理角色与权限矩阵。"],
    "/logs":["审计日志","查看管理操作与账户变更审计事件。"],
    "/access":["访问控制","管理设备豁免并查看访问审计记录。"],
    "/content":["内容","跨账户管理摘要与私有链接；与用户产品保持隔离。"],
    "/storage":["存储","查看跨账户 R2 用户文件，并执行管理操作。"],
    "/billing":["订阅与权益","管理套餐、有效期与用户产品权益。"],
    "/student-verification":["学生认证","审核并管理学生的学信网验证申请。"],
    "/intelligence":["AERTEX Intelligence","管理服务商、模型和用户 AI 访问权限；此模块直接属于 admin.qsseda.com 管理控制面。"],
    "/system":["系统","查看管理控制面的健康状态与部署信息。"]
  };
  [title.textContent,description.textContent]=pageMeta[route]||pageMeta["/"];

  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const scalar=v=>v==null?"—":typeof v==="object"?JSON.stringify(v):String(v);
  const FIELD_LABELS={
    id:"ID",user_id:"用户 ID",display_name:"显示名称",username:"用户名",email:"邮箱",role:"角色",status:"状态",
    last_sign_in_at:"最近登录",last_seen_at:"最近活动",created_at:"创建时间",updated_at:"更新时间",
    owner:"所有者",owner_id:"所有者 ID",owner_label:"所有者",title:"标题",source:"来源",tags:"标签",
    url:"URL",scope:"范围",category:"分类",description:"说明",community:"社区公开",reference:"文件标识",
    name:"名称",content_type:"文件类型",size:"大小",uploaded_at:"上传时间",enabled:"启用",expires_at:"到期时间",
    note:"备注",ip:"IP",user_agent:"设备信息",action:"操作",resource_type:"资源类型",resource_id:"资源 ID",
    event_type:"事件类型",success:"成功",result:"结果",reason:"原因",timestamp:"时间",time:"时间",
    service:"服务",origin:"来源",files:"文件数",used:"已用空间",partial:"部分结果",summaries:"摘要数",
    private_links:"私有链接",community_links:"社区链接",providers:"服务商",users:"用户数",
    active_subscriptions:"有效订阅",manual_grants:"管理员授权",plan_id:"套餐",quota:"云盘配额",
    pending:"待审核",verified_active:"有效学生认证",expired:"已过期",rejected:"未通过",
    active_providers:"启用服务商",count:"数量",total:"总数",active:"正常",suspended:"已暂停",banned:"已封禁"
  };
  const fieldLabel=key=>FIELD_LABELS[String(key)]||String(key);
  const roleLabel=value=>({admin:"管理员",editor:"编辑者",user:"普通用户"}[String(value)]||String(value));
  const valueLabel=(key,value)=>{
    if(key==="role")return roleLabel(value);
    if(key==="status")return ({active:"正常",suspended:"已暂停",banned:"已封禁",disabled:"已停用"}[String(value)]||scalar(value));
    if(typeof value==="boolean")return value?"是":"否";
    return scalar(value);
  };
  const localizeForDisplay=value=>{
    if(Array.isArray(value))return value.map(localizeForDisplay);
    if(value&&typeof value==="object")return Object.fromEntries(Object.entries(value).map(([key,item])=>[fieldLabel(key),localizeForDisplay(item)]));
    if(typeof value==="boolean")return value?"是":"否";
    return value;
  };
  const permissionLabel=value=>({
    "users.read":"查看用户","users.update":"修改用户","users.ban":"暂停或封禁用户",
    "roles.read":"查看角色与权限","roles.update":"修改角色权限","logs.read":"查看操作日志",
    "system.read":"查看系统状态","notes.read":"查看笔记","notes.create":"创建笔记","notes.update":"修改笔记","notes.delete":"删除笔记",
    "links.read":"查看链接","links.create":"创建链接","links.update":"修改链接","links.delete":"删除链接"
  }[String(value)]||String(value));
  async function post(path,body={}){
    const r=await fetch(path,{method:"POST",credentials:"same-origin",cache:"no-store",headers:{"content-type":"application/json;charset=UTF-8",accept:"application/json"},body:JSON.stringify(body)});
    const data=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(data.error||("HTTP "+r.status));
    return data;
  }
  async function get(path){
    const r=await fetch(path,{credentials:"same-origin",cache:"no-store",headers:{accept:"application/json"}});
    const data=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(data.error||("HTTP "+r.status));
    return data;
  }
  async function requestJson(path,options={}){
    const r=await fetch(path,{...options,credentials:"same-origin",cache:"no-store",headers:{accept:"application/json",...(options.headers||{})}});
    const data=await r.json().catch(()=>({}));
    if(!r.ok){
      const error=new Error(data.error||("HTTP "+r.status));
      error.code=data.code||null;
      error.diagnostic=data.diagnostic||null;
      throw error;
    }
    return data;
  }
  function table(rows){
    const list=Array.isArray(rows)?rows:[];
    if(!list.length)return '<div class="state">暂无记录。</div>';
    const cols=[...new Set(list.flatMap(row=>Object.keys(row||{})))].slice(0,12);
    return '<div class="tableWrap"><table><thead><tr>'+cols.map(c=>'<th>'+esc(fieldLabel(c))+'</th>').join('')+'</tr></thead><tbody>'+
      list.map(row=>'<tr>'+cols.map(c=>'<td class="'+(/id|uuid|time|date|email|ip/i.test(c)?"mono":"")+'">'+esc(valueLabel(c,row?.[c]))+'</td>').join('')+'</tr>').join('')+
      '</tbody></table></div>';
  }
  function objCards(obj){
    const entries=Object.entries(obj||{});
    if(!entries.length)return '<div class="state">暂无指标。</div>';
    return '<div class="grid">'+entries.slice(0,12).map(([k,v])=>'<article class="card metric"><small>'+esc(fieldLabel(k))+'</small><strong>'+esc(typeof v==="object"?(Array.isArray(v)?v.length:"…"):v)+'</strong></article>').join('')+'</div>';
  }
  const num=value=>{const text=String(value??"").trim();if(!text)return null;const number=Number(text);return Number.isFinite(number)?number:null};
  const intOrNull=value=>{const number=num(value);return number==null?null:Math.max(0,Math.trunc(number))};
  const bytes=value=>{let n=Number(value)||0;const units=["B","KB","MB","GB","TB"];let i=0;while(n>=1024&&i<units.length-1){n/=1024;i++}return n.toLocaleString(undefined,{maximumFractionDigits:i?1:0})+" "+units[i]};
  function errorView(error){view.innerHTML='<div class="section"><div class="state">管理请求失败：'+esc(error?.message||error)+'</div></div>'}

  async function overview(){
    const result=await post("/api/admin/overview");
    const data=result.data||{};
    view.innerHTML=objCards(data)+'<section class="section"><div class="sectionHead"><h2>原始管理概览</h2></div><pre>'+esc(JSON.stringify(localizeForDisplay(data),null,2))+'</pre></section>';
  }
  async function users(){
    const result=await post("/api/admin/users");
    const rows=Array.isArray(result.data)?result.data:(result.data?.users||[]);
    if(!rows.length){view.innerHTML='<section class="section"><div class="state">暂无账户。</div></section>';return}
    view.innerHTML='<section class="section"><div class="sectionHead"><h2>账户</h2><span class="mono">'+rows.length+' 条记录</span></div><div class="tableWrap"><table><thead><tr><th>用户</th><th>邮箱</th><th>角色</th><th>状态</th><th>最近登录</th><th>操作</th></tr></thead><tbody>'+
      rows.map(row=>'<tr data-user-row="'+esc(row.user_id)+'"><td><strong>'+esc(row.display_name||row.username||"—")+'</strong><br><span class="mono">'+esc(row.user_id)+'</span></td><td class="mono">'+esc(row.email||"—")+'</td>'+
      '<td><select class="userRole compactInput"><option value="admin" '+(row.role==="admin"?"selected":"")+'>管理员</option><option value="editor" '+(row.role==="editor"?"selected":"")+'>编辑者</option><option value="user" '+(row.role==="user"?"selected":"")+'>普通用户</option></select></td>'+
      '<td><select class="userStatus compactInput"><option value="active" '+(row.status==="active"?"selected":"")+'>正常</option><option value="suspended" '+(row.status==="suspended"?"selected":"")+'>已暂停</option><option value="banned" '+(row.status==="banned"?"selected":"")+'>已封禁</option></select></td>'+
      '<td class="mono">'+esc(row.last_sign_in_at||row.last_seen_at||"—")+'</td><td><div class="inline"><button class="btn saveUser" type="button">应用</button></div></td></tr>').join('')+
      '</tbody></table></div><div class="feedback" id="usersFeedback"></div></section>';

    document.querySelectorAll(".saveUser").forEach(button=>button.addEventListener("click",async()=>{
      const row=button.closest("[data-user-row]");if(!row)return;
      const userId=row.dataset.userRow;
      const role=row.querySelector(".userRole")?.value||"user";
      const status=row.querySelector(".userStatus")?.value||"active";
      const feedback=document.getElementById("usersFeedback");
      button.disabled=true;
      try{
        await post("/api/admin/user-role",{p_user_id:userId,p_role:role});
        await post("/api/admin/user-status",{p_user_id:userId,p_status:status});
        feedback.textContent="账户设置已更新，并已写入审计日志。";
        feedback.className="feedback ok";
      }catch(error){
        feedback.textContent=error.message;
        feedback.className="feedback bad";
      }finally{button.disabled=false}
    }));
  }
  async function roles(){
    const result=await post("/api/admin/roles");
    const data=result.data||{};
    const roles=Array.isArray(data.roles)?data.roles:[];
    const permissions=Array.isArray(data.permissions)?data.permissions:[];
    const assigned=Array.isArray(data.role_permissions)?data.role_permissions:[];
    const selectedByRole=new Map(roles.map(role=>[role.name,new Set(assigned.filter(item=>item.role===role.name).map(item=>item.permission))]));
    view.innerHTML='<section class="section"><div class="sectionHead"><h2>权限矩阵</h2><span class="mono">'+permissions.length+' 项权限</span></div><div class="permissionGrid">'+
      roles.map(role=>'<article class="permissionRole" data-role="'+esc(role.name)+'"><div class="permissionRoleHead"><div><strong>'+esc(roleLabel(role.name))+'</strong><br><span class="mono">'+esc((data.user_counts||{})[role.name]??0)+' 位用户</span></div><button class="btn saveRole" type="button">保存角色</button></div><div class="permissionChecks">'+
        permissions.map(permission=>'<label title="'+esc(permissionLabel(permission.key))+'"><input type="checkbox" value="'+esc(permission.key)+'" '+(selectedByRole.get(role.name)?.has(permission.key)?"checked":"")+'><span>'+esc(permissionLabel(permission.key))+'</span></label>').join('')+
      '</div></article>').join('')+'</div><div class="feedback" id="rolesFeedback"></div></section>';

    document.querySelectorAll(".saveRole").forEach(button=>button.addEventListener("click",async()=>{
      const card=button.closest("[data-role]");if(!card)return;
      const role=card.dataset.role;
      const list=[...card.querySelectorAll('input[type="checkbox"]:checked')].map(input=>input.value);
      const feedback=document.getElementById("rolesFeedback");
      button.disabled=true;
      try{
        await post("/api/admin/permissions",{p_role:role,p_permissions:list});
        feedback.textContent="角色权限矩阵已更新，并已写入审计日志。";
        feedback.className="feedback ok";
      }catch(error){
        feedback.textContent=error.message;
        feedback.className="feedback bad";
      }finally{button.disabled=false}
    }));
  }
  async function logs(){
    const result=await post("/api/admin/logs",{p_limit:120});
    const rows=Array.isArray(result.data)?result.data:(result.data?.logs||[]);
    view.innerHTML='<section class="section"><div class="sectionHead"><h2>最近事件</h2></div>'+table(rows)+'</section>';
  }
  async function access(){
    const [exemptions,auditSummary,auditList]=await Promise.all([
      post("/api/admin/device-exemptions"),
      post("/api/admin/access-audit",{action:"summary"}),
      post("/api/admin/access-audit",{action:"list",limit:80,filters:{}})
    ]);
    const rows=Array.isArray(exemptions.data)?exemptions.data:[];
    const auditRows=Array.isArray(auditList.entries)?auditList.entries:[];
    view.innerHTML='<div class="split"><section class="section"><div class="sectionHead"><h2>华为设备 ID 豁免</h2></div>'+table(rows)+'</section>'+
      '<section class="section"><div class="sectionHead"><h2>访问审计摘要</h2></div><pre>'+esc(JSON.stringify(localizeForDisplay(auditSummary.summary||{}),null,2))+'</pre></section></div>'+
      '<section class="section"><div class="sectionHead"><h2>授予或撤销账户豁免</h2></div><form class="form" id="exemptionForm">'+
      '<input name="user" placeholder="用户 UUID" required><select name="enabled"><option value="true">授予</option><option value="false">撤销</option></select><input name="expires" placeholder="到期时间 ISO（可选）"><input class="wide" name="note" placeholder="管理备注"><button class="btn primary" type="submit">应用</button></form></section>'+
      '<section class="section"><div class="sectionHead"><h2>最近访问审计事件</h2></div>'+table(auditRows)+'</section>';
    document.getElementById("exemptionForm")?.addEventListener("submit",async event=>{
      event.preventDefault();const fd=new FormData(event.currentTarget);
      try{
        await post("/api/admin/device-exemption",{p_user_id:String(fd.get("user")||"").trim(),p_enabled:fd.get("enabled")==="true",p_expires_at:String(fd.get("expires")||"").trim()||null,p_note:String(fd.get("note")||"").trim()||null});
        await access();
      }catch(error){alert(error.message)}
    });
  }
  async function content(){
    const [summaries,links]=await Promise.all([
      get("/api/admin/content/summaries"),
      get("/api/admin/content/links")
    ]);
    const summaryRows=(summaries.rows||[]).map(row=>({
      owner:row.owner_label||row.owner_id,
      title:row.title||"—",
      source:row.source||"—",
      tags:row.tags||"—",
      updated_at:row.updated_at||"—"
    }));
    const linkRows=Array.isArray(links.rows)?links.rows:[];
    view.innerHTML=objCards({summaries:summaries.count||0,private_links:linkRows.filter(row=>!row.community).length,community_links:linkRows.filter(row=>row.community).length})+
      '<section class="section"><div class="sectionHead"><h2>用户摘要</h2><span class="mono">'+summaryRows.length+' 条记录</span></div>'+table(summaryRows)+'</section>'+
      '<section class="section"><div class="sectionHead"><h2>用户创建的链接</h2><span class="mono">'+linkRows.length+' 条记录</span></div><div class="tableWrap"><table><thead><tr><th>所有者</th><th>标题</th><th>URL</th><th>范围</th><th>更新时间</th><th>操作</th></tr></thead><tbody>'+
      linkRows.map(row=>'<tr data-link-owner="'+esc(row.owner_id)+'" data-link-id="'+esc(row.id)+'"><td>'+esc(row.owner_label||row.owner_id)+'</td><td>'+esc(row.title||"—")+'</td><td class="mono">'+esc(row.url||"—")+'</td><td><span class="badge '+(row.community?"ok":"")+'">'+(row.community?"社区":"私有")+'</span></td><td class="mono">'+esc(row.updated_at||"—")+'</td><td><div class="inline"><button class="btn toggleLinkScope" type="button">'+(row.community?"转为私有":"发布")+'</button><button class="btn danger deleteLink" type="button">删除</button></div></td></tr>').join('')+
      '</tbody></table></div><div class="feedback" id="contentFeedback"></div></section>';

    document.querySelectorAll(".toggleLinkScope").forEach(button=>button.addEventListener("click",async()=>{
      const row=button.closest("[data-link-owner]");if(!row)return;
      const item=linkRows.find(link=>link.owner_id===row.dataset.linkOwner&&link.id===row.dataset.linkId);if(!item)return;
      button.disabled=true;
      try{
        await requestJson("/api/admin/content/link?owner="+encodeURIComponent(item.owner_id)+"&id="+encodeURIComponent(item.id),{
          method:"PUT",headers:{"content-type":"application/json;charset=UTF-8"},
          body:JSON.stringify({title:item.title,url:item.url,category:item.category,description:item.description,community:!item.community})
        });
        await content();
      }catch(error){const feedback=document.getElementById("contentFeedback");if(feedback){feedback.textContent=error.message;feedback.className="feedback bad"}button.disabled=false}
    }));
    document.querySelectorAll(".deleteLink").forEach(button=>button.addEventListener("click",async()=>{
      const row=button.closest("[data-link-owner]");if(!row)return;
      const item=linkRows.find(link=>link.owner_id===row.dataset.linkOwner&&link.id===row.dataset.linkId);if(!item||!confirm("确定删除链接 “"+(item.title||item.id)+"” 吗？"))return;
      button.disabled=true;
      try{
        await requestJson("/api/admin/content/link?owner="+encodeURIComponent(item.owner_id)+"&id="+encodeURIComponent(item.id),{method:"DELETE"});
        await content();
      }catch(error){const feedback=document.getElementById("contentFeedback");if(feedback){feedback.textContent=error.message;feedback.className="feedback bad"}button.disabled=false}
    }));
  }

  async function storage(){
    const result=await get("/api/admin/storage/files");
    const rows=Array.isArray(result.rows)?result.rows:[];
    view.innerHTML=objCards({files:result.count||0,used:bytes(result.used_bytes||0),partial:result.partial?"是":"否"})+
      '<section class="section"><div class="sectionHead"><h2>用户文件</h2><span class="mono">'+rows.length+' 条记录</span></div><div class="tableWrap"><table><thead><tr><th>所有者</th><th>名称</th><th>类型</th><th>大小</th><th>上传时间</th><th>操作</th></tr></thead><tbody>'+
      rows.map(row=>'<tr data-storage-ref="'+esc(row.reference)+'"><td>'+esc(row.owner_label||row.owner_id)+'</td><td>'+esc(row.name||"file")+'<br><span class="mono">'+esc(row.reference)+'</span></td><td class="mono">'+esc(row.content_type||"application/octet-stream")+'</td><td>'+esc(bytes(row.size))+'</td><td class="mono">'+esc(row.uploaded_at||"—")+'</td><td><div class="inline"><a class="btn" href="/api/admin/storage/object?id='+encodeURIComponent(row.reference)+'">下载</a><button class="btn danger deleteStorage" type="button">删除</button></div></td></tr>').join('')+
      '</tbody></table></div><div class="feedback" id="storageFeedback"></div></section>';

    document.querySelectorAll(".deleteStorage").forEach(button=>button.addEventListener("click",async()=>{
      const row=button.closest("[data-storage-ref]");const ref=row?.dataset.storageRef;if(!ref||!confirm("确定删除存储对象 “"+ref+"” 吗？"))return;
      button.disabled=true;
      try{
        await requestJson("/api/admin/storage/object?id="+encodeURIComponent(ref),{method:"DELETE"});
        await storage();
      }catch(error){const feedback=document.getElementById("storageFeedback");if(feedback){feedback.textContent=error.message;feedback.className="feedback bad"}button.disabled=false}
    }));
  }

  async function billing(){
    const result=await post("/api/admin/billing");
    const data=result.data||{};
    const users=Array.isArray(data.users)?data.users:[];
    const plans=Array.isArray(data.plans)?data.plans:[];
    const paidPlans=plans.filter(plan=>plan.id!=="aertex_free");
    const summary=data.summary||{};
    const planOptions=paidPlans.map(plan=>'<option value="'+esc(plan.id)+'">'+esc(plan.display_name_zh||plan.display_name_en||plan.id)+'</option>').join("");
    view.innerHTML=objCards({
      users:summary.users||users.length,
      active_subscriptions:summary.active_subscriptions||0,
      manual_grants:summary.manual_grants||0,
      plans:plans.length
    })+
      '<section class="section"><div class="sectionHead"><h2>订阅与权益</h2><span class="mono">'+users.length+' 位用户</span></div><div class="tableWrap"><table><thead><tr><th>用户</th><th>当前套餐</th><th>云盘配额</th><th>有效期至</th><th>来源</th><th>操作</th></tr></thead><tbody>'+
      users.map(row=>{
        const state=row.billing||{};
        const plan=state.plan||{};
        const subscription=state.subscription||null;
        const quota=Number(state.entitlements?.drive_storage_bytes)||0;
        return '<tr data-billing-user="'+esc(row.user_id)+'"><td><strong>'+esc(row.display_name||row.username||row.email||"—")+'</strong><br><span class="mono">'+esc(row.email||row.user_id)+'</span></td>'+
          '<td><strong>'+esc(plan.display_name_zh||plan.display_name_en||plan.id||"AERTEX Free")+'</strong><br><span class="mono">'+esc(subscription?.status||"free")+'</span></td>'+
          '<td>'+esc(bytes(quota))+'</td><td class="mono">'+esc(subscription?.current_period_end||"长期有效")+'</td><td>'+esc(subscription?.source||"system")+'</td>'+
          '<td><div class="inline"><select class="billingPlan compactInput">'+planOptions+'</select><input class="billingDays compactInput" type="number" min="1" max="3650" value="30" style="width:82px" aria-label="授权天数"><button class="btn primary grantSubscription" type="button">授予套餐</button><button class="btn danger resetSubscription" type="button">恢复 Free</button></div></td></tr>';
      }).join('')+
      '</tbody></table></div><div class="feedback" id="billingFeedback"></div></section>';

    const feedback=document.getElementById("billingFeedback");
    document.querySelectorAll(".grantSubscription").forEach(button=>button.addEventListener("click",async()=>{
      const row=button.closest("[data-billing-user]");if(!row)return;
      const userId=row.dataset.billingUser;
      const planId=row.querySelector(".billingPlan")?.value||"";
      const days=Number(row.querySelector(".billingDays")?.value||30);
      if(!planId)return;
      button.disabled=true;
      try{
        await post("/api/admin/subscription-grant",{p_user_id:userId,p_plan_id:planId,p_days:days,p_note:"Admin Billing console grant"});
        if(feedback){feedback.textContent="管理员授权已更新。";feedback.className="feedback ok";}
        await billing();
      }catch(error){if(feedback){feedback.textContent=error.message;feedback.className="feedback bad"}button.disabled=false}
    }));
    document.querySelectorAll(".resetSubscription").forEach(button=>button.addEventListener("click",async()=>{
      const row=button.closest("[data-billing-user]");if(!row)return;
      const userId=row.dataset.billingUser;
      if(!confirm("恢复 AERTEX Free？当前有效付费权益将立即结束。"))return;
      button.disabled=true;
      try{
        await post("/api/admin/subscription-reset",{p_user_id:userId,p_note:"Admin Billing console reset"});
        if(feedback){feedback.textContent="管理员授权已更新。";feedback.className="feedback ok";}
        await billing();
      }catch(error){if(feedback){feedback.textContent=error.message;feedback.className="feedback bad"}button.disabled=false}
    }));
  }

  async function studentVerification(){
    const result=await post("/api/admin/student-verifications");
    const data=result.data||{};
    const rows=Array.isArray(data.rows)?data.rows:[];
    const summary=data.summary||{};

    const safeTarget=value=>{
      try{
        const url=new URL(String(value||""));
        const host=url.hostname.toLowerCase();
        return url.protocol==="https:"&&!url.username&&!url.password&&!url.port&&(host==="chsi.com.cn"||host==="www.chsi.com.cn")&&/^\\/xlcx\\//i.test(url.pathname)?url.toString():"";
      }catch{return ""}
    };
    const verificationEvidence=value=>{
      const target=safeTarget(value);
      if(!target)return {valid:false};
      const url=new URL(target);
      const code=String(url.searchParams.get("__aertex_online_code")||"").trim().toUpperCase();
      if(/^[A-Z0-9]{16}$/.test(code)){
        return {valid:true,kind:"code",code,verifyUrl:"https://www.chsi.com.cn/xlcx/bgcx.jsp"};
      }
      return {valid:true,kind:"url",url:target};
    };
    const statusLabel=value=>({pending:"待审核",verified:"已认证",expired:"已过期",rejected:"未通过"}[String(value)]||String(value||"—"));
    const statusClass=value=>({pending:"",verified:"verified",expired:"expired",rejected:"rejected"}[String(value)]||"");
    const dateInputValue=value=>{
      const d=new Date(value||Date.now()+15552000000);
      if(Number.isNaN(d.getTime()))return "";
      const local=new Date(d.getTime()-d.getTimezoneOffset()*60000);
      return local.toISOString().slice(0,16);
    };

    const requestCards=rows.map(row=>{
      const evidence=verificationEvidence(row.target_url);
      const pending=row.status==="pending";
      const verificationBlock=!pending||!evidence.valid
        ?'<div class="studentFieldValue"><span class="mono">'+esc(row.target_host||"—")+'</span></div>'
        :evidence.kind==="code"
          ?'<div class="studentFieldValue"><span class="studentCode">'+esc(evidence.code)+'</span><div class="studentVerifyLinks"><button class="btn copyStudentCode" type="button" data-code="'+esc(evidence.code)+'">复制验证码</button><a class="btn" href="'+esc(evidence.verifyUrl)+'" target="_blank" rel="noopener noreferrer">打开学信网验证 ↗</a></div></div>'
          :'<div class="studentFieldValue"><div class="studentVerifyLinks"><a class="btn" href="'+esc(evidence.url)+'" target="_blank" rel="noopener noreferrer">打开学信网官方验证 ↗</a></div></div>';

      const schoolField=pending
        ?'<input class="studentSchool" maxlength="180" placeholder="可选">'
        :'<div class="studentFieldValue">'+esc(row.school_name||"—")+'</div>';
      const levelField=pending
        ?'<input class="studentLevel" maxlength="120" placeholder="可选">'
        :'<div class="studentFieldValue">'+esc(row.education_level||"—")+'</div>';
      const expiryField=pending
        ?'<input class="studentExpires" type="datetime-local" value="'+esc(dateInputValue(row.report_expires_at))+'">'
        :'<div class="studentFieldValue mono">'+esc(row.report_expires_at||"—")+'</div>';
      const actions=pending
        ?'<div class="studentActions"><button class="btn primary verifyStudent" type="button" '+(!evidence.valid?'disabled':'')+'>认证通过</button><button class="btn danger rejectStudent" type="button">拒绝</button></div>'
        :'<div class="studentFieldValue mono">'+esc(row.reviewed_at||row.verified_at||"—")+'</div>';

      return '<article class="studentRequestCard" data-student-verification="'+esc(row.id)+'">'+
        '<div class="studentRequestTop"><div class="studentIdentity"><strong>'+esc(row.display_name||row.username||row.email||"—")+'</strong><span>'+esc(row.email||row.user_id||"")+'</span></div><span class="studentStatus '+esc(statusClass(row.status))+'">'+esc(statusLabel(row.status))+'</span></div>'+
        '<div class="studentRequestGrid">'+
          '<div class="studentField wide"><label>验证信息</label>'+verificationBlock+'</div>'+
          '<div class="studentField"><label>学校（可选）</label>'+schoolField+'</div>'+
          '<div class="studentField"><label>学历层次（可选）</label>'+levelField+'</div>'+
          '<div class="studentField wide"><label>报告有效期</label>'+expiryField+'</div>'+
        '</div>'+
        actions+
      '</article>';
    }).join("");

    view.innerHTML=
      '<div class="studentVerify">'+
        '<div class="studentSummary">'+
          '<article class="studentSummaryCard"><div class="studentSummaryIcon">SV</div><div><small>待审核申请</small><strong>'+esc(summary.pending||0)+'</strong></div></article>'+
          '<article class="studentSummaryCard"><div class="studentSummaryIcon">✓</div><div><small>已通过</small><strong>'+esc(summary.verified_active||0)+'</strong></div></article>'+
        '</div>'+
        '<section class="studentInfo"><div class="studentInfoIcon">i</div><div><h3>审核说明</h3><p>管理员仅核验经过白名单检查的学信网验证信息。新版报告二维码可能包含 16 位在线验证码而非网址；遇到验证码时，请在学信网“在线验证报告”页面完成核验。请勿要求用户提供学信网密码、身份证、完整学籍报告或人脸信息。</p></div></section>'+
        '<section class="studentRequestSection"><div class="studentRequestHead"><h2>待审核申请</h2><span>共 '+rows.length+' 条申请</span></div><div class="studentRequestList">'+(requestCards||'<div class="studentEmpty">暂无学生认证申请。</div>')+'</div><div class="feedback" id="studentVerificationFeedback"></div></section>'+
      '</div>';

    const feedback=document.getElementById("studentVerificationFeedback");
    document.querySelectorAll(".copyStudentCode").forEach(button=>button.addEventListener("click",async()=>{
      const code=String(button.dataset.code||"");
      if(!/^[A-Z0-9]{16}$/.test(code))return;
      try{
        await navigator.clipboard.writeText(code);
        button.textContent="已复制";
        setTimeout(()=>{button.textContent="复制验证码"},1200);
      }catch{
        feedback.textContent="无法自动复制，请手动复制验证码。";
        feedback.className="feedback bad";
      }
    }));
    document.querySelectorAll(".verifyStudent").forEach(button=>button.addEventListener("click",async()=>{
      const row=button.closest("[data-student-verification]");if(!row)return;
      const verificationId=row.dataset.studentVerification;
      const expiresRaw=row.querySelector(".studentExpires")?.value||"";
      const expiresAt=Date.parse(expiresRaw);
      if(!Number.isFinite(expiresAt)||expiresAt<=Date.now()){
        feedback.textContent="请输入未来的报告有效期。";feedback.className="feedback bad";return;
      }
      if(!confirm("已经通过学信网官方验证页面核验，并确认该用户当前具有学生身份？"))return;
      button.disabled=true;
      try{
        await post("/api/admin/student-verification-review",{
          p_verification_id:verificationId,
          p_decision:"verified",
          p_school_name:row.querySelector(".studentSchool")?.value||null,
          p_education_level:row.querySelector(".studentLevel")?.value||null,
          p_report_expires_at:new Date(expiresAt).toISOString(),
          p_note:"Verified using the official CHSI verification target."
        });
        feedback.textContent="学生资格已认证并写入审计日志。";feedback.className="feedback ok";
        await studentVerification();
      }catch(error){feedback.textContent=error.message;feedback.className="feedback bad";button.disabled=false}
    }));
    document.querySelectorAll(".rejectStudent").forEach(button=>button.addEventListener("click",async()=>{
      const row=button.closest("[data-student-verification]");if(!row)return;
      const reason=prompt("请输入拒绝原因（不要记录身份证号、学号等敏感信息）：","");
      if(reason===null)return;
      button.disabled=true;
      try{
        await post("/api/admin/student-verification-review",{
          p_verification_id:row.dataset.studentVerification,
          p_decision:"rejected",
          p_school_name:null,
          p_education_level:null,
          p_report_expires_at:null,
          p_note:String(reason||"Official verification did not pass.").slice(0,500)
        });
        feedback.textContent="申请已拒绝并写入审计日志。";feedback.className="feedback ok";
        await studentVerification();
      }catch(error){feedback.textContent=error.message;feedback.className="feedback bad";button.disabled=false}
    }));
  }

  async function intelligence(){
    if(window.__aertexAdminAiTimer){clearInterval(window.__aertexAdminAiTimer);window.__aertexAdminAiTimer=null;}
    const initialState=await get("/api/admin/ai/state");
    const initialProviders=Array.isArray(initialState.providers)?initialState.providers:[];
    const initialUsers=Array.isArray(initialState.users)?initialState.users:[];
    view.innerHTML=objCards({
      providers:initialProviders.length,
      users:initialUsers.length,
      active_providers:initialProviders.filter(provider=>provider.is_active!==false).length,
      configured_models:initialProviders.reduce((sum,provider)=>sum+(Array.isArray(provider.allowed_models)?provider.allowed_models.length:0),0)
    })+'<div class="aiWorkbench">'+"<div id=\\"msg\\" class=\\"status hint\\"></div>\\n\\n<section class=\\"section aiPanel\\">\\n  <div class=\\"sectionHead\\"><h2>添加 AI Provider</h2></div>\\n  <div class=\\"aiCreateGrid\\">\\n    <div><label>Provider 类型</label><select id=\\"providerType\\"><option value=\\"\\" disabled selected>请选择 Provider</option><option value=\\"openai\\">OpenAI</option><option value=\\"zhipu\\">智谱 GLM</option><option value=\\"bailian\\">阿里云百炼</option></select></div>\\n    <div><label>名称</label><input id=\\"name\\" value=\\"\\"></div>\\n    <div><label>API Key</label><div class=\\"keyRow\\"><input id=\\"key\\" type=\\"password\\" autocomplete=\\"off\\" spellcheck=\\"false\\"><button type=\\"button\\" class=\\"checkKeyButton\\" id=\\"checkKey\\" disabled>检查 Key</button></div><div class=\\"keyStatus\\" id=\\"keyStatus\\">尚未检查 Key</div></div>\\n    <div id=\\"adminKeyField\\"><label>OpenAI Admin Key（可选，仅账单）</label><input id=\\"adminKey\\" type=\\"password\\" autocomplete=\\"off\\" spellcheck=\\"false\\"><div class=\\"hint\\">Admin Key 只用于读取 OpenAI Organization Costs，不参与用户聊天</div></div>\\n    <div><label>允许模型</label><button type=\\"button\\" class=\\"pickerButton\\" id=\\"modelsPicker\\" disabled><span class=\\"pickerValue\\" id=\\"modelsPickerValue\\"></span><span class=\\"pickerChevron\\">›</span></button></div>\\n    <div><label>默认模型</label><button type=\\"button\\" class=\\"pickerButton\\" id=\\"defaultPicker\\" disabled><span class=\\"pickerValue\\" id=\\"defaultPickerValue\\"></span><span class=\\"pickerChevron\\">›</span></button></div>\\n    <div><label>AERTEX 月预算（USD）</label><input id=\\"budget\\" type=\\"number\\" min=\\"0\\" step=\\".01\\"></div>\\n    <div><label>自定义模型输入 $/百万 Token</label><input id=\\"input\\" type=\\"number\\" min=\\"0\\" step=\\".001\\" value=\\"4\\"></div>\\n    <div><label>自定义模型输出 $/百万 Token</label><input id=\\"output\\" type=\\"number\\" min=\\"0\\" step=\\".001\\" value=\\"20\\"></div>\\n  </div>\\n  <p><button class=\\"primary\\" id=\\"saveProvider\\">验证并保存 Provider</button></p>\\n</section>\\n\\n<section class=\\"section aiPanel\\">\\n  <div class=\\"sectionHead\\"><h2>API Providers</h2><span class=\\"hint\\" id=\\"refreshed\\"></span></div>\\n  <div id=\\"providers\\">正在加载…</div>\\n</section>\\n\\n<section class=\\"section aiPanel\\">\\n  <div class=\\"sectionHead\\"><h2>用户授权</h2></div>\\n  <div id=\\"users\\">正在加载…</div>\\n</section>\\n\\n\\n<dialog class=\\"aiDialog\\" id=\\"modelsDialog\\">\\n  <div class=\\"dialogHead\\"><strong>选择允许模型</strong></div>\\n  <div class=\\"dialogBody\\" id=\\"modelsDialogBody\\"></div>\\n  <div class=\\"dialogFoot\\"><button type=\\"button\\" class=\\"secondaryBtn\\" id=\\"modelsCancel\\">取消</button><button type=\\"button\\" class=\\"primary\\" id=\\"modelsDone\\">完成</button></div>\\n</dialog>\\n\\n<dialog class=\\"aiDialog\\" id=\\"defaultDialog\\">\\n  <div class=\\"dialogHead\\"><strong>选择默认模型</strong></div>\\n  <div class=\\"dialogBody\\" id=\\"defaultDialogBody\\"></div>\\n  <div class=\\"dialogFoot\\"><button type=\\"button\\" class=\\"secondaryBtn\\" id=\\"defaultCancel\\">取消</button><button type=\\"button\\" class=\\"primary\\" id=\\"defaultDone\\">完成</button></div>\\n</dialog>\\n\\n<dialog class=\\"aiDialog\\" id=\\"userProvidersDialog\\">\\n  <div class=\\"dialogHead\\"><strong>选择 Provider</strong></div>\\n  <div class=\\"dialogBody\\" id=\\"userProvidersDialogBody\\"></div>\\n  <div class=\\"dialogFoot\\"><button type=\\"button\\" class=\\"secondaryBtn\\" id=\\"userProvidersCancel\\">取消</button><button type=\\"button\\" class=\\"primary\\" id=\\"userProvidersDone\\">完成</button></div>\\n</dialog>\\n\\n<dialog class=\\"aiDialog\\" id=\\"userModelsDialog\\">\\n  <div class=\\"dialogHead\\"><strong>选择用户模型</strong></div>\\n  <div class=\\"dialogBody\\" id=\\"userModelsDialogBody\\"></div>\\n  <div class=\\"dialogFoot\\"><button type=\\"button\\" class=\\"secondaryBtn\\" id=\\"userModelsCancel\\">取消</button><button type=\\"button\\" class=\\"primary\\" id=\\"userModelsDone\\">完成</button></div>\\n</dialog>\\n\\n<dialog class=\\"aiDialog\\" id=\\"editProviderDialog\\">\\n  <div class=\\"dialogHead\\"><strong>编辑 Provider</strong></div>\\n  <div class=\\"dialogBody\\">\\n    <label>Provider 类型</label><div class=\\"pill\\" id=\\"editProviderType\\"></div>\\n    <label>名称</label><input id=\\"editName\\">\\n    <label>替换 Project API Key（留空则保留）</label>\\n    <div class=\\"keyRow\\"><input id=\\"editKey\\" type=\\"password\\" autocomplete=\\"off\\" spellcheck=\\"false\\"><button type=\\"button\\" class=\\"checkKeyButton\\" id=\\"editCheckKey\\">检查新 Key</button></div>\\n    <div class=\\"keyStatus\\" id=\\"editKeyStatus\\"></div>\\n    <div id=\\"editAdminKeyField\\"><label>替换 Admin Key（留空则保留）</label><input id=\\"editAdminKey\\" type=\\"password\\" autocomplete=\\"off\\" spellcheck=\\"false\\">\\n    <label class=\\"choice\\"><input id=\\"editClearAdminKey\\" type=\\"checkbox\\"><span>清除现有 Admin Key</span></label></div>\\n    <label>允许模型</label><button type=\\"button\\" class=\\"pickerButton\\" id=\\"editModelsPicker\\"><span class=\\"pickerValue\\" id=\\"editModelsValue\\"></span><span class=\\"pickerChevron\\">›</span></button>\\n    <label>默认模型</label><button type=\\"button\\" class=\\"pickerButton\\" id=\\"editDefaultPicker\\"><span class=\\"pickerValue\\" id=\\"editDefaultValue\\"></span><span class=\\"pickerChevron\\">›</span></button>\\n    <label>AERTEX 月预算（USD）</label><input id=\\"editBudget\\" type=\\"number\\" min=\\"0\\" step=\\".01\\">\\n    <label>自定义模型输入 $/百万 Token</label><input id=\\"editInput\\" type=\\"number\\" min=\\"0\\" step=\\".001\\">\\n    <label>自定义模型输出 $/百万 Token</label><input id=\\"editOutput\\" type=\\"number\\" min=\\"0\\" step=\\".001\\">\\n    <label class=\\"choice\\"><input id=\\"editActive\\" type=\\"checkbox\\"><span>启用 Provider</span></label>\\n  </div>\\n  <div class=\\"dialogFoot\\"><button type=\\"button\\" class=\\"secondaryBtn\\" id=\\"editCancel\\">取消</button><button type=\\"button\\" class=\\"primary\\" id=\\"editSave\\">保存修改</button></div>\\n</dialog>\\n\\n<dialog class=\\"aiDialog\\" id=\\"editModelsDialog\\">\\n  <div class=\\"dialogHead\\"><strong>选择允许模型</strong></div>\\n  <div class=\\"dialogBody\\" id=\\"editModelsDialogBody\\"></div>\\n  <div class=\\"dialogFoot\\"><button type=\\"button\\" class=\\"secondaryBtn\\" id=\\"editModelsCancel\\">取消</button><button type=\\"button\\" class=\\"primary\\" id=\\"editModelsDone\\">完成</button></div>\\n</dialog>\\n\\n<dialog class=\\"aiDialog\\" id=\\"editDefaultDialog\\">\\n  <div class=\\"dialogHead\\"><strong>选择默认模型</strong></div>\\n  <div class=\\"dialogBody\\" id=\\"editDefaultDialogBody\\"></div>\\n  <div class=\\"dialogFoot\\"><button type=\\"button\\" class=\\"secondaryBtn\\" id=\\"editDefaultCancel\\">取消</button><button type=\\"button\\" class=\\"primary\\" id=\\"editDefaultDone\\">完成</button></div>\\n</dialog>"+'</div>';
    const $=id=>document.getElementById(id);
    let state=initialState;
    const hasBootstrapState=true;
    let availableProjectModels=[];
    let selectedProviderModels=[];
    let selectedDefaultModel="";
    let projectKeyValidated=false;
    const userProviderAccessSelections=new Map();
    let activeUserProviderPicker=null;
    let activeUserModelPicker=null;
    let editingProvider=null;
    let editAvailableModels=[];
    let editSelectedModels=[];
    let editDefaultModel="";
    let editReplacementKeyChecked=true;
    const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
    const money=value=>value==null?"—":"$"+Number(value||0).toFixed(4);
    const tokenCount=value=>Number(value||0).toLocaleString();
    const normalizeApiKey=value=>String(value||"").replace(/[\\s\\u200B\\u200C\\u200D\\u2060\\uFEFF]+/g,"").trim();
    
    function updateProviderPickers(){
      $("modelsPicker").disabled=!projectKeyValidated;
      $("defaultPicker").disabled=!projectKeyValidated||!selectedProviderModels.length;
      $("modelsPickerValue").textContent=selectedProviderModels.length
        ? "已选择 "+selectedProviderModels.length+" 个模型"
        : (projectKeyValidated?"选择允许模型":"请先检查 API Key");
      $("defaultPickerValue").textContent=selectedDefaultModel||(projectKeyValidated?"选择默认模型":"—");
    }
    
    function invalidateProjectKey(){
      projectKeyValidated=false;
      availableProjectModels=[];
      selectedProviderModels=[];
      selectedDefaultModel="";
      $("keyStatus").textContent="尚未检查 Key";
      $("keyStatus").className="keyStatus";
      updateProviderPickers();
    }
    
    function renderModelsDialog(){
      $("modelsDialogBody").innerHTML=availableProjectModels.map(model=>'<label class="choice"><input type="checkbox" value="'+esc(model)+'" '+(selectedProviderModels.includes(model)?"checked":"")+'><span>'+esc(model)+'</span></label>').join("");
    }
    
    function renderDefaultDialog(){
      $("defaultDialogBody").innerHTML=selectedProviderModels.map(model=>'<label class="choice"><input type="radio" name="defaultModelChoice" value="'+esc(model)+'" '+(selectedDefaultModel===model?"checked":"")+'><span>'+esc(model)+'</span></label>').join("");
    }
    
    function syncProviderType(){
      const kind=$("providerType").value;
      $("checkKey").disabled=!kind;
      $("adminKeyField").classList.toggle("hidden",kind!=="openai");
      if(kind!=="openai")$("adminKey").value="";
      if(!kind){
        $("name").value="";
        $("input").value="0";
        $("output").value="0";
        return;
      }
      if(kind==="zhipu"&&(!$("name").value||$("name").value==="OpenAI Primary"||$("name").value==="Alibaba Cloud Bailian"))$("name").value="Zhipu GLM";
      if(kind==="bailian"&&(!$("name").value||$("name").value==="OpenAI Primary"||$("name").value==="Zhipu GLM"))$("name").value="Alibaba Cloud Bailian";
      if(kind==="openai"&&(!$("name").value||$("name").value==="Zhipu GLM"||$("name").value==="Alibaba Cloud Bailian"))$("name").value="OpenAI Primary";
      $("input").value=kind==="openai"?"4":"0";
      $("output").value=kind==="openai"?"20":"0";
    }
    $("providerType").addEventListener("change",()=>{invalidateProjectKey();syncProviderType();});
    $("key").addEventListener("input",invalidateProjectKey);
    $("checkKey").onclick=async()=>{
      const providerType=$("providerType").value;
      if(!providerType)return;
      const key=normalizeApiKey($("key").value);
      if(!key){
        invalidateProjectKey();
        $("keyStatus").textContent="请先检查 API Key";
        $("keyStatus").className="keyStatus bad";
        return;
      }
      const button=$("checkKey");
      button.disabled=true;
      button.textContent="正在检查…";
      $("keyStatus").textContent="正在检查…";
      $("keyStatus").className="keyStatus";
      try{
        const result=await api("/validate-project-key",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({api_key:key,provider:providerType})});
        availableProjectModels=Array.isArray(result.models)?result.models:[];
        if(!availableProjectModels.length)throw new Error("这个 API Key 没有返回可用于对话的模型");
        projectKeyValidated=true;
        const preferred=($("providerType").value==="zhipu"
          ? ["glm-4.7-flash"]
          : $("providerType").value==="bailian"
            ? ["qwen3.7-plus","glm-5","qwen-max","qwen-plus-2025-07-28"]
            : ["gpt-5.6","gpt-5.6-sol","gpt-5.6-terra","gpt-5.6-luna"])
          .filter(model=>availableProjectModels.includes(model));
        selectedProviderModels=preferred.length?preferred.slice(0,4):[availableProjectModels[0]];
        selectedDefaultModel=selectedProviderModels[0];
        $("keyStatus").textContent="Key 正常 · "+availableProjectModels.length+" 个模型";
        $("keyStatus").className="keyStatus ok";
        updateProviderPickers();
      }catch(error){
        invalidateProjectKey();
        $("keyStatus").textContent=friendlyError(error)||"请先检查 API Key";
        $("keyStatus").className=error?.code==="RATE_LIMITED"?"keyStatus warn":"keyStatus bad";
        if(error?.code==="RATE_LIMITED"){
          startRetryCooldown(button,"检查 Key",error);
          return;
        }
      }finally{
        if(!button.disabled||button.textContent==="正在检查…"){
          button.disabled=false;
          button.textContent="检查 Key";
        }
      }
    };
    
    $("modelsPicker").onclick=()=>{if(!projectKeyValidated)return;renderModelsDialog();$("modelsDialog").showModal();};
    $("modelsCancel").onclick=()=>$("modelsDialog").close();
    $("modelsDone").onclick=()=>{
      const values=[...$("modelsDialogBody").querySelectorAll('input[type="checkbox"]:checked')].map(input=>input.value);
      if(!values.length){$("msg").textContent="请至少选择一个允许模型";$("msg").className="status bad";return;}
      selectedProviderModels=values;
      if(!selectedProviderModels.includes(selectedDefaultModel))selectedDefaultModel=selectedProviderModels[0];
      updateProviderPickers();
      $("modelsDialog").close();
    };
    $("defaultPicker").onclick=()=>{
      if(!projectKeyValidated||!selectedProviderModels.length){$("msg").textContent="请先选择允许模型";$("msg").className="status bad";return;}
      renderDefaultDialog();$("defaultDialog").showModal();
    };
    $("defaultCancel").onclick=()=>$("defaultDialog").close();
    $("defaultDone").onclick=()=>{
      const selected=$("defaultDialogBody").querySelector('input[name="defaultModelChoice"]:checked');
      if(selected)selectedDefaultModel=selected.value;
      updateProviderPickers();
      $("defaultDialog").close();
    };
    
    async function api(path,options={}){
      const response=await fetch("/api/admin/ai"+path,{...options,credentials:"same-origin",cache:"no-store",headers:{Accept:"application/json",...(options.headers||{})}});
      const data=await response.json().catch(()=>({}));
      if(response.status===401&&!data.code){location.reload();throw new Error("Authentication required");}
      if(!response.ok){
        const error=new Error(data.error||("HTTP "+response.status));
        error.code=data.code||null;
        error.diagnostic=data.diagnostic||null;
        error.httpStatus=response.status;
        throw error;
      }
      return data;
    }
    function diagnosticSuffix(error){
      const d=error?.diagnostic||{};
      const parts=[];
      if(d.upstream_status)parts.push("上游状态: HTTP "+d.upstream_status);
      if(d.provider_code)parts.push("Provider 错误码: "+d.provider_code);
      if(d.retry_after_seconds!=null&&Number.isFinite(Number(d.retry_after_seconds)))parts.push("建议等待 "+d.retry_after_seconds+" 秒后重试");
      else if(error?.code==="RATE_LIMITED")parts.push("上游未返回 Retry-After；AERTEX 不会自动连续重试");
      if(d.request_id)parts.push("请求 ID: "+d.request_id);
      if(d.checked_at){
        const date=new Date(d.checked_at);
        if(!Number.isNaN(date.getTime()))parts.push("检查时间: "+date.toLocaleTimeString());
      }
      return parts.length?" · "+parts.join(" · "):"";
    }
    function friendlyError(error){
      if(error?.code==="REGION_UNSUPPORTED")return "当前网络或服务区域暂不支持 OpenAI API 检查这里不是在判定 Key 无效；请在 OpenAI 官方支持的国家或地区使用需要连接 OpenAI 的功能";
      if(error?.code==="RATE_LIMITED")return "已确认上游 Provider 限流：AERTEX 收到真实 HTTP 429这个结果不能判定 Key 无效"+diagnosticSuffix(error);
      if(error?.code==="PROVIDER_AUTH_INVALID")return "上游 Provider 明确拒绝了 API Key 身份验证"+diagnosticSuffix(error);
      if(error?.code==="PROVIDER_QUOTA_EXHAUSTED")return "上游 Provider 报告当前账户额度不足"+diagnosticSuffix(error);
      if(error?.code==="PROVIDER_PERMISSION_DENIED")return "上游 Provider 拒绝当前账户或模型的访问权限"+diagnosticSuffix(error);
      if(error?.code==="PROVIDER_OVERLOADED")return "上游 Provider 当前过载，请稍后重试"+diagnosticSuffix(error);
      return (error?.message||"Error")+diagnosticSuffix(error);
    }
    function startRetryCooldown(button,normalLabel,error){
      if(error?.code!=="RATE_LIMITED"){button.disabled=false;button.textContent=normalLabel;return;}
      const rawRetry=error?.diagnostic?.retry_after_seconds;
      const upstream=rawRetry==null?NaN:Number(rawRetry);
      let seconds=Number.isFinite(upstream)&&upstream>0?Math.min(120,Math.ceil(upstream)):15;
      button.disabled=true;
      const tick=()=>{
        button.textContent=seconds+"s 后重试";
        if(seconds<=0){button.disabled=false;button.textContent=normalLabel;return;}
        seconds-=1;
        window.setTimeout(tick,1000);
      };
      tick();
    }
    async function load(){
      try{
        state=await api("/state");
        render();
        $("refreshed").textContent=new Date().toLocaleTimeString();
      }catch(error){
        $("msg").textContent=friendlyError(error);
        $("msg").className="status bad";
      }
    }
    
    function userProvidersSummary(access){
      const values=Array.isArray(access)?access:[];
      return "已选择 "+values.length+" 个 Provider";
    }
    function userModelsSummary(access){
      const values=Array.isArray(access)?access:[];
      const count=values.reduce((sum,item)=>sum+(Array.isArray(item.allowed_models)?item.allowed_models.length:0),0);
      return "已选择 "+count+" 个模型";
    }
    function normalizedUserAccess(user){
      const raw=Array.isArray(user.provider_access)?user.provider_access.filter(item=>item&&item.enabled!==false):[];
      return raw.map(item=>{
        const provider=(state.providers||[]).find(p=>p.id===item.provider_id);
        if(!provider)return null;
        const available=Array.isArray(provider.allowed_models)?provider.allowed_models:[];
        const selected=(Array.isArray(item.allowed_models)&&item.allowed_models.length?item.allowed_models:available)
          .filter(model=>available.includes(model));
        return {provider_id:provider.id,allowed_models:selected.length?selected:[...available]};
      }).filter(Boolean);
    }
    function openUserProvidersDialog(userId){
      const row=document.querySelector('.user[data-user="'+CSS.escape(userId)+'"]');
      if(!row)return;
      const current=userProviderAccessSelections.get(userId)||[];
      const selectedIds=new Set(current.map(item=>item.provider_id));
      const providers=(state.providers||[]).filter(provider=>provider.is_active!==false);
      activeUserProviderPicker={userId};
      $("userProvidersDialogBody").innerHTML=providers.map(provider=>{
        const providerTypeLabel=provider.provider==="zhipu"?"智谱 GLM":provider.provider==="bailian"?"阿里云百炼":"OpenAI";
        return '<label class="choice"><input class="userProviderOnly" type="checkbox" value="'+esc(provider.id)+'" '+(selectedIds.has(provider.id)?"checked":"")+'><span><strong>'+esc(provider.name)+'</strong> · '+providerTypeLabel+'</span></label>';
      }).join("");
      $("userProvidersDialog").showModal();
    }
    $("userProvidersCancel").onclick=()=>{activeUserProviderPicker=null;$("userProvidersDialog").close();};
    $("userProvidersDone").onclick=()=>{
      if(!activeUserProviderPicker)return;
      const userId=activeUserProviderPicker.userId;
      const current=userProviderAccessSelections.get(userId)||[];
      const currentById=new Map(current.map(item=>[item.provider_id,item]));
      const selectedIds=[...$("userProvidersDialogBody").querySelectorAll(".userProviderOnly:checked")].map(input=>input.value);
      const access=selectedIds.map(providerId=>{
        const provider=(state.providers||[]).find(item=>item.id===providerId);
        const existing=currentById.get(providerId);
        const available=Array.isArray(provider?.allowed_models)?provider.allowed_models:[];
        const selected=(existing?.allowed_models||[]).filter(model=>available.includes(model));
        return {provider_id:providerId,allowed_models:selected.length?selected:[...available]};
      });
      userProviderAccessSelections.set(userId,access);
      const row=document.querySelector('.user[data-user="'+CSS.escape(userId)+'"]');
      if(row){
        row.querySelector(".userProvidersValue").textContent=userProvidersSummary(access);
        row.querySelector(".userModelsValue").textContent=userModelsSummary(access);
      }
      activeUserProviderPicker=null;
      $("userProvidersDialog").close();
    };
    
    function openUserModelsDialog(userId){
      const row=document.querySelector('.user[data-user="'+CSS.escape(userId)+'"]');
      if(!row)return;
      const current=userProviderAccessSelections.get(userId)||[];
      if(!current.length){
        $("msg").textContent="请至少为用户选择一个 Provider";
        $("msg").className="status bad";
        return;
      }
      activeUserModelPicker={userId};
      $("userModelsDialogBody").innerHTML=current.map(item=>{
        const provider=(state.providers||[]).find(value=>value.id===item.provider_id);
        if(!provider)return "";
        const selected=item.allowed_models||[];
        const models=provider.allowed_models||[];
        return '<div class="providerCard userProviderGroup" data-provider="'+esc(provider.id)+'">'
          +'<div class="providerName">'+esc(provider.name)+'</div>'
          +'<div class="providerModelChoices">'
          +models.map(model=>'<label class="choice"><input class="userProviderModel" data-provider="'+esc(provider.id)+'" type="checkbox" value="'+esc(model)+'" '+(selected.includes(model)?"checked":"")+'><span>'+esc(model)+'</span></label>').join("")
          +'</div></div>';
      }).join("");
      $("userModelsDialog").showModal();
    }
    $("userModelsCancel").onclick=()=>{activeUserModelPicker=null;$("userModelsDialog").close();};
    $("userModelsDone").onclick=()=>{
      if(!activeUserModelPicker)return;
      const userId=activeUserModelPicker.userId;
      const access=[];
      for(const group of $("userModelsDialogBody").querySelectorAll(".userProviderGroup")){
        const providerId=group.dataset.provider;
        const values=[...group.querySelectorAll(".userProviderModel:checked")].map(input=>input.value);
        if(!values.length){
          $("msg").textContent="请至少选择一个允许模型";
          $("msg").className="status bad";
          return;
        }
        access.push({provider_id:providerId,allowed_models:values});
      }
      userProviderAccessSelections.set(userId,access);
      const row=document.querySelector('.user[data-user="'+CSS.escape(userId)+'"]');
      if(row){
        row.querySelector(".userProvidersValue").textContent=userProvidersSummary(access);
        row.querySelector(".userModelsValue").textContent=userModelsSummary(access);
      }
      activeUserModelPicker=null;
      $("userModelsDialog").close();
    };
    
    function updateEditPickers(){
      $("editModelsValue").textContent="已选择 "+editSelectedModels.length+" 个模型";
      $("editDefaultValue").textContent=editDefaultModel||"—";
      $("editDefaultPicker").disabled=!editSelectedModels.length;
    }
    
    async function openEditProvider(providerId){
      const provider=(state.providers||[]).find(item=>item.id===providerId);
      if(!provider)return;
      editingProvider=provider;
      $("editProviderType").textContent=provider.provider==="zhipu"?"智谱 GLM":provider.provider==="bailian"?"阿里云百炼":"OpenAI";
      $("editAdminKeyField").classList.toggle("hidden",provider.provider!=="openai");
      $("editName").value=provider.name||"";
      $("editKey").value="";
      $("editAdminKey").value="";
      $("editClearAdminKey").checked=false;
      $("editBudget").value=provider.monthly_budget_usd??"";
      $("editInput").value=provider.input_price_per_million??0;
      $("editOutput").value=provider.output_price_per_million??0;
      $("editActive").checked=provider.is_active!==false;
      $("editKeyStatus").textContent="当前 Key · ****"+(provider.key_hint||"");
      $("editKeyStatus").className="keyStatus ok";
      editReplacementKeyChecked=true;
      editAvailableModels=[...(provider.allowed_models||[])];
      editSelectedModels=[...(provider.allowed_models||[])];
      editDefaultModel=editSelectedModels.includes(provider.default_model)?provider.default_model:(editSelectedModels[0]||"");
      updateEditPickers();
      $("editProviderDialog").showModal();
    }
    $("editKey").addEventListener("input",()=>{
      editReplacementKeyChecked=!$("editKey").value.trim();
      $("editKeyStatus").textContent=editReplacementKeyChecked?"当前 Key · ****"+(editingProvider?.key_hint||""):"尚未检查 Key";
      $("editKeyStatus").className="keyStatus";
    });
    
    $("editCheckKey").onclick=async()=>{
      const key=normalizeApiKey($("editKey").value);
      if(!key){editReplacementKeyChecked=true;$("editKeyStatus").textContent="当前 Key · ****"+(editingProvider?.key_hint||"");$("editKeyStatus").className="keyStatus ok";return;}
      const button=$("editCheckKey"); button.disabled=true; button.textContent="正在检查…";
      try{
        const result=await api("/validate-project-key",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({api_key:key,provider:editingProvider?.provider||"openai"})});
        editAvailableModels=Array.isArray(result.models)?result.models:[];
        if(!editAvailableModels.length)throw new Error("这个 API Key 没有返回可用于对话的模型");
        editSelectedModels=editSelectedModels.filter(model=>editAvailableModels.includes(model));
        if(!editSelectedModels.length)editSelectedModels=[editAvailableModels[0]];
        if(!editSelectedModels.includes(editDefaultModel))editDefaultModel=editSelectedModels[0];
        editReplacementKeyChecked=true;
        $("editKeyStatus").textContent="Key 正常 · "+editAvailableModels.length+" 个模型";
        $("editKeyStatus").className="keyStatus ok";
        updateEditPickers();
      }catch(error){
        editReplacementKeyChecked=false;
        $("editKeyStatus").textContent=friendlyError(error)||"尚未检查 Key";
        $("editKeyStatus").className=error?.code==="RATE_LIMITED"?"keyStatus warn":"keyStatus bad";
        if(error?.code==="RATE_LIMITED"){
          startRetryCooldown(button,"检查新 Key",error);
          return;
        }
      }finally{
        if(!button.disabled||button.textContent==="正在检查…"){
          button.disabled=false;
          button.textContent="检查新 Key";
        }
      }
    };
    
    $("editModelsPicker").onclick=()=>{
      $("editModelsDialogBody").innerHTML=editAvailableModels.map(model=>'<label class="choice"><input type="checkbox" value="'+esc(model)+'" '+(editSelectedModels.includes(model)?"checked":"")+'><span>'+esc(model)+'</span></label>').join("");
      $("editModelsDialog").showModal();
    };
    $("editModelsCancel").onclick=()=>$("editModelsDialog").close();
    $("editModelsDone").onclick=()=>{
      const values=[...$("editModelsDialogBody").querySelectorAll('input[type="checkbox"]:checked')].map(input=>input.value);
      if(!values.length){$("msg").textContent="请至少选择一个允许模型";$("msg").className="status bad";return;}
      editSelectedModels=values;
      if(!editSelectedModels.includes(editDefaultModel))editDefaultModel=editSelectedModels[0];
      updateEditPickers(); $("editModelsDialog").close();
    };
    
    $("editDefaultPicker").onclick=()=>{
      $("editDefaultDialogBody").innerHTML=editSelectedModels.map(model=>'<label class="choice"><input type="radio" name="editDefaultChoice" value="'+esc(model)+'" '+(editDefaultModel===model?"checked":"")+'><span>'+esc(model)+'</span></label>').join("");
      $("editDefaultDialog").showModal();
    };
    $("editDefaultCancel").onclick=()=>$("editDefaultDialog").close();
    $("editDefaultDone").onclick=()=>{
      const selected=$("editDefaultDialogBody").querySelector('input[name="editDefaultChoice"]:checked');
      if(selected)editDefaultModel=selected.value;
      updateEditPickers(); $("editDefaultDialog").close();
    };
    $("editCancel").onclick=()=>{$("editProviderDialog").close();editingProvider=null;};
    
    $("editSave").onclick=async()=>{
      if(!editingProvider)return;
      if($("editKey").value.trim()&&!editReplacementKeyChecked){
        $("msg").textContent="请先检查 API Key";$("msg").className="status bad";return;
      }
      const button=$("editSave");button.disabled=true;
      try{
        await api("/provider/"+encodeURIComponent(editingProvider.id),{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({
          name:$("editName").value,
          api_key:normalizeApiKey($("editKey").value),
          admin_key:normalizeApiKey($("editAdminKey").value),
          clear_admin_key:$("editClearAdminKey").checked,
          allowed_models:editSelectedModels,
          default_model:editDefaultModel,
          monthly_budget_usd:$("editBudget").value,
          input_price_per_million:$("editInput").value,
          output_price_per_million:$("editOutput").value,
          is_active:$("editActive").checked
        })});
        $("editProviderDialog").close(); editingProvider=null;
        $("msg").textContent="Provider 已更新";$("msg").className="status ok";
        await load();
      }catch(error){$("msg").textContent=friendlyError(error);$("msg").className="status bad";}
      finally{button.disabled=false;}
    };
    
    async function deleteProvider(providerId){
      if(!confirm("确定删除这个 Provider？此操作不可撤销"))return;
      try{
        await api("/provider/"+encodeURIComponent(providerId),{method:"DELETE",headers:{"Content-Type":"application/json"}});
        $("msg").textContent="Provider 已删除";$("msg").className="status ok";
        await load();
      }catch(error){$("msg").textContent=friendlyError(error);$("msg").className="status bad";}
    }
    
    function render(){
      $("providers").innerHTML=(state.providers||[]).length
        ? state.providers.map(provider=>{
            const official=provider.billing?.available?Number(provider.billing.official_month_usd||0):null;
            const local=Number(provider.month_usage_usd||0);
            const spent=official==null?local:official;
            const budget=provider.monthly_budget_usd==null?null:Number(provider.monthly_budget_usd);
            const remaining=budget==null?null:Math.max(0,budget-spent);
            const providerLabel=provider.provider==="zhipu"?"智谱 GLM":provider.provider==="bailian"?"阿里云百炼":"OpenAI";
            const billingLabel=provider.provider==="openai"
              ? (provider.admin_key_configured
                  ? (provider.billing?.available?"官方账单已连接":"官方账单已连接 · "+esc(provider.billing?.error||""))
                  : "未配置 Admin Key")
              : "兼容 API";
            const metricItems = []; // Render only metrics that apply to this provider.
            if(provider.provider==="openai"){
              metricItems.push('<div class="metric"><span>官方本月费用</span><strong>'+money(official)+'</strong></div>');
            }
            metricItems.push('<div class="metric"><span>AERTEX 本地估算</span><strong>'+money(local)+'</strong></div>');
            if(budget!=null){
              metricItems.push('<div class="metric"><span>预算剩余</span><strong>'+money(remaining)+'</strong></div>');
            }
            metricItems.push('<div class="metric"><span>本月请求</span><strong>'+Number(provider.month_requests||0).toLocaleString()+'</strong></div>');
            return '<div class="providerCard">'
              +'<div class="providerTop"><div><div class="providerName">'+esc(provider.name)+'</div>'
              +'<div class="hint">'+providerLabel+' · '+esc(provider.default_model)+' · API ****'+esc(provider.key_hint||"")+' · '+billingLabel+'</div></div>'
              +'<div class="providerActions"><span class="pill statusPill"><span class="statusDot '+(provider.is_active?"active":"")+'"></span>'+(provider.is_active?"Active":"Disabled")+'</span><button type="button" class="smallButton editProvider" data-provider="'+esc(provider.id)+'">编辑</button><button type="button" class="smallButton dangerButton deleteProvider" data-provider="'+esc(provider.id)+'">删除</button></div></div>'
              +'<div class="metrics">'+metricItems.join("")+'</div></div>';
          }).join("")
        : "尚未配置 Provider";
    
      $("users").innerHTML=(state.users||[]).map(user=>{
        const access=normalizedUserAccess(user);
        userProviderAccessSelections.set(user.user_id,access);
        return '<div class="user" data-user="'+esc(user.user_id)+'">'
          +'<div class="userName"><strong>'+esc(user.display_name||user.username||user.email)+'</strong><span class="hint">'+esc(user.email||"")+' · '+money(user.month_usage_usd||0)+' · '+tokenCount(user.month_usage_tokens||0)+' tokens</span></div>'
          +'<div><label>允许使用</label><select class="enabled"><option value="0">Off</option><option value="1" '+(user.enabled?"selected":"")+'>On</option></select></div>'
          +'<div><label>Providers</label><button type="button" class="pickerButton userProvidersPicker"><span class="pickerValue userProvidersValue">'+esc(userProvidersSummary(access))+'</span><span class="pickerChevron">›</span></button></div>'
          +'<div><label>用户可用模型</label><button type="button" class="pickerButton userModelsPicker"><span class="pickerValue userModelsValue">'+esc(userModelsSummary(access))+'</span><span class="pickerChevron">›</span></button></div>'
          +'<div><label>日费用上限 $</label><input class="daily" type="number" min="0" step=".01" value="'+esc(user.daily_limit_usd??"")+'"></div>'
          +'<div><label>月费用上限 $</label><input class="monthly" type="number" min="0" step=".01" value="'+esc(user.monthly_limit_usd??"")+'"></div>'
          +'<div><label>日 Token 上限</label><input class="dailyTokens" type="number" min="0" step="1000" value="'+esc(user.daily_limit_tokens??"")+'"></div>'
          +'<div><label>月 Token 上限</label><input class="monthlyTokens" type="number" min="0" step="1000" value="'+esc(user.monthly_limit_tokens??"")+'"></div>'
          +'<div><label>RPM</label><input class="rpm" type="number" min="1" max="300" value="'+esc(user.requests_per_minute||20)+'"></div>'
          +'<div class="accessCell"><button class="primary access" type="button">保存授权</button><div class="accessFeedback" aria-live="polite"></div></div></div>';
      }).join("");
    
      document.querySelectorAll(".editProvider").forEach(button=>button.onclick=()=>openEditProvider(button.dataset.provider));
      document.querySelectorAll(".deleteProvider").forEach(button=>button.onclick=()=>deleteProvider(button.dataset.provider));
      document.querySelectorAll(".access").forEach(button=>button.onclick=saveAccess);
      document.querySelectorAll(".userProvidersPicker").forEach(button=>button.onclick=event=>{
        const row=event.currentTarget.closest(".user");
        openUserProvidersDialog(row.dataset.user);
      });
      document.querySelectorAll(".userModelsPicker").forEach(button=>button.onclick=event=>{
        const row=event.currentTarget.closest(".user");
        openUserModelsDialog(row.dataset.user);
      });
    }
    
    
    $("saveProvider").onclick=async()=>{
      const button=$("saveProvider");
      button.disabled=true;
      button.textContent="正在验证…";
      $("msg").textContent="";
      if(!projectKeyValidated){
        $("msg").textContent="请先检查 API Key";
        $("msg").className="status bad";
        button.disabled=false;
        button.textContent="验证并保存 Provider";
        return;
      }
      try{
        const result=await api("/provider",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
          name:$("name").value,
          provider:$("providerType").value,
          api_key:normalizeApiKey($("key").value),
          admin_key:normalizeApiKey($("adminKey").value),
          allowed_models:selectedProviderModels,
          default_model:selectedDefaultModel,
          monthly_budget_usd:$("budget").value,
          input_price_per_million:$("input").value,
          output_price_per_million:$("output").value
        })});
        $("key").value="";
        $("adminKey").value="";
        invalidateProjectKey();
        $("msg").textContent="已保存 · Project Key 验证通过"+(result.validation?.billing_key?" · 官方账单已连接":"");
        $("msg").className="status ok";
        await load();
      }catch(error){
        $("msg").textContent=friendlyError(error);
        $("msg").className="status bad";
      }finally{
        button.disabled=false;
        button.textContent="验证并保存 Provider";
      }
    };
    
    async function saveAccess(event){
      const button=event.currentTarget;
      const row=button.closest(".user");
      const feedback=row.querySelector(".accessFeedback");
      const user=(state.users||[]).find(item=>item.user_id===row.dataset.user);
      if(!user)return;
    
      const providerAccess=userProviderAccessSelections.get(user.user_id)||[];
      const reset=()=>{
        button.disabled=false;
        button.classList.remove("isSaved");
        button.textContent="保存授权";
      };
      const fail=message=>{
        feedback.textContent=message;
        feedback.className="accessFeedback bad";
        reset();
      };
    
      if(row.querySelector(".enabled").value==="1"&&!providerAccess.length){
        fail("请至少为用户选择一个 Provider");
        return;
      }
      if(row.querySelector(".enabled").value==="1"&&providerAccess.some(item=>!item.allowed_models?.length)){
        fail("请至少选择一个允许模型");
        return;
      }
    
      button.disabled=true;
      button.classList.remove("isSaved");
      button.textContent="保存中…";
      feedback.textContent="保存中…";
      feedback.className="accessFeedback";
      $("msg").textContent="";
    
      try{
        await api("/access",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
          user_id:user.user_id,
          enabled:row.querySelector(".enabled").value==="1",
          provider_access:providerAccess,
          daily_limit_usd:row.querySelector(".daily").value,
          monthly_limit_usd:row.querySelector(".monthly").value,
          daily_limit_tokens:row.querySelector(".dailyTokens").value,
          monthly_limit_tokens:row.querySelector(".monthlyTokens").value,
          requests_per_minute:row.querySelector(".rpm").value
        })});
    
        button.textContent="已保存 ✓";
        button.classList.add("isSaved");
        feedback.textContent="已保存 ✓";
        feedback.className="accessFeedback ok";
        $("msg").textContent="已保存";
        $("msg").className="status ok";
    
        window.setTimeout(()=>{
          if(document.body.contains(button))reset();
        },1800);
        window.setTimeout(()=>{
          if(document.body.contains(feedback)){
            feedback.textContent="";
            feedback.className="accessFeedback";
          }
        },3500);
      }catch(error){
        const message=friendlyError(error);
        fail(message);
        $("msg").textContent=message;
        $("msg").className="status bad";
      }
    }
    
    
    syncProviderType();
    updateProviderPickers();
    if(hasBootstrapState){
      render();
      $("refreshed").textContent=new Date().toLocaleTimeString();
      window.setTimeout(()=>void load(),1200);
    }else{
      void load();
    }
    window.__aertexAdminAiTimer=setInterval(load,60000);
  }
  async function system(){
    const health=await get("/health");
    const overviewResult=await post("/api/admin/overview").catch(()=>({data:{}}));
    view.innerHTML=objCards({service:health.service||"admin",status:health.status||"unknown",origin:health.origin||location.origin,time:health.time||"—"})+
      '<section class="section"><div class="sectionHead"><h2>管理控制面</h2></div><pre>'+esc(JSON.stringify(localizeForDisplay({health,overview:overviewResult.data||{}}),null,2))+'</pre></section>';
  }
  const loaders={"/":overview,"/users":users,"/roles":roles,"/logs":logs,"/access":access,"/content":content,"/storage":storage,"/billing":billing,"/student-verification":studentVerification,"/intelligence":intelligence,"/system":system};
  async function load(){view.innerHTML='<div class="state">正在加载管理数据…</div>';try{await (loaders[route]||overview)()}catch(error){errorView(error)}}
  document.getElementById("refresh")?.addEventListener("click",()=>void load());
  document.getElementById("logout")?.addEventListener("click",async()=>{
    await fetch("/api/auth/logout",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:"{}"}).catch(()=>{});
    location.replace("/");
  });
  void load();
})();
</script>
</body></html>`;
}

export function hiddenAdminNotFound() {
  return new Response("Not found.", {
    status: 404,
    headers: {
      "content-type": "text/plain;charset=UTF-8",
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
      "x-robots-tag": "noindex, nofollow, noarchive, nosnippet"
    }
  });
}

export function adminHtml(markup, status = 200) {
  return new Response(markup, {
    status,
    headers: {
      "content-type": "text/html;charset=UTF-8",
      "cache-control": "private, no-store",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
      "x-robots-tag": "noindex, nofollow, noarchive, nosnippet",
      "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
      "content-security-policy": "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
    }
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
