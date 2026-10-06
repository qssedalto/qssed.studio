(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const locale = location.pathname.split("/").filter(Boolean)[0] || "en-us";
  const zh = locale.toLowerCase().startsWith("zh");
  const palette = ["#ff654c","#5f8fe8","#38a67a","#8b73de","#e69a3b","#e05d8b","#4ca6b7","#7f8c9b"];
  const appLabels = {
    "msedge":"Microsoft Edge","msedge.exe":"Microsoft Edge","microsoft edge":"Microsoft Edge",
    "microsoft-edge-stable":"Microsoft Edge","microsoft-edge":"Microsoft Edge","microsoft-edge-beta":"Microsoft Edge","microsoft-edge-dev":"Microsoft Edge",
    "chrome":"Google Chrome","chrome.exe":"Google Chrome","google chrome":"Google Chrome","google-chrome":"Google Chrome","google-chrome-stable":"Google Chrome",
    "chromium":"Chromium","chromium.exe":"Chromium","chromium-browser":"Chromium","chromium-browser-chromium":"Chromium",
    "firefox":"Firefox","firefox.exe":"Firefox","firefox developer edition":"Firefox Developer Edition","firefoxdeveloperedition":"Firefox Developer Edition",
    "librewolf":"LibreWolf","librewolf.exe":"LibreWolf","librewolf-portable.exe":"LibreWolf","waterfox":"Waterfox","waterfox.exe":"Waterfox",
    "brave-browser":"Brave","brave browser":"Brave","brave.exe":"Brave","opera":"Opera","opera.exe":"Opera",
    "arc":"Arc","arc.exe":"Arc","vivaldi":"Vivaldi","vivaldi-stable":"Vivaldi","vivaldi-snapshot":"Vivaldi","vivaldi.exe":"Vivaldi","orion":"Orion","yandex":"Yandex",
    "chatgpt":"ChatGPT","chatgpt.exe":"ChatGPT","codex":"Codex","codex.exe":"Codex","code":"Visual Studio Code","code.exe":"Visual Studio Code",
    "explorer":"文件资源管理器","explorer.exe":"文件资源管理器","windowsterminal":"Windows Terminal","windowsterminal.exe":"Windows Terminal",
    "powershell":"PowerShell","powershell.exe":"PowerShell","cmd":"命令提示符","cmd.exe":"命令提示符",
    "wechat":"微信","wechat.exe":"微信","qq":"QQ","qq.exe":"QQ",
    "winword":"Microsoft Word","winword.exe":"Microsoft Word","excel":"Microsoft Excel","excel.exe":"Microsoft Excel",
    "powerpnt":"Microsoft PowerPoint","powerpnt.exe":"Microsoft PowerPoint","notepad":"记事本","notepad.exe":"记事本",
    "steamwebhelper":"Steam","steamwebhelper.exe":"Steam","snippingtool":"截图工具","snippingtool.exe":"截图工具"
  };
  const state = { date:startOfDay(new Date()), range:"day", buckets:{}, apps:[], requestId:0 };

  function rootOrigin() {
    const host = location.hostname.toLowerCase();
    for (const root of ["qsseda.com","qsseda.online","qsseda.studio"]) {
      if (host === root || host.endsWith("." + root)) return "https://" + root;
    }
    return "/";
  }
  function startOfDay(date) { const value = new Date(date); value.setHours(0,0,0,0); return value; }
  function addDays(date, days) { const value = new Date(date); value.setDate(value.getDate() + days); return value; }
  function period() {
    if (state.range === "day") return { start:startOfDay(state.date), end:addDays(startOfDay(state.date),1) };
    const start = startOfDay(state.date);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    return { start, end:addDays(start,7) };
  }
  function formatDateLabel() {
    const now = startOfDay(new Date());
    const range = period();
    if (state.range === "week") {
      const endDate = addDays(range.end,-1);
      return (range.start.getMonth()+1) + "月" + range.start.getDate() + "日 – " + (endDate.getMonth()+1) + "月" + endDate.getDate() + "日";
    }
    const offset = Math.round((startOfDay(state.date)-now)/86400000);
    if (offset === 0) return zh ? "今天" : "Today";
    if (offset === -1) return zh ? "昨天" : "Yesterday";
    if (!zh) return state.date.toLocaleDateString("en-US",{month:"short",day:"numeric",weekday:"short"});
    return (state.date.getMonth()+1) + "月" + state.date.getDate() + "日 · 周" + "日一二三四五六"[state.date.getDay()];
  }
  function formatDuration(seconds, compact=false) {
    const value = Math.max(0,Number(seconds||0));
    if (!Number.isFinite(value) || value <= 0) return zh ? (compact ? "0 分钟" : "0 小时 00 分") : (compact ? "0 min" : "0h 00m");
    const minutes = Math.round(value/60), hours = Math.floor(minutes/60), mins = minutes%60;
    if (!hours) return zh ? mins + " 分钟" : mins + " min";
    if (compact && !mins) return zh ? hours + " 小时" : hours + "h";
    return zh ? hours + " 小时 " + String(mins).padStart(2,"0") + " 分" : hours + "h " + String(mins).padStart(2,"0") + "m";
  }
  function formatShort(seconds) {
    const value = Math.max(0,Number(seconds||0));
    if (value < 60) return zh ? Math.max(1,Math.round(value)) + " 秒" : Math.max(1,Math.round(value)) + " sec";
    if (value < 3600) return zh ? Math.round(value/60) + " 分钟" : Math.round(value/60) + " min";
    const hours = value/3600;
    return (hours >= 10 ? Math.round(hours) : hours.toFixed(1)) + (zh ? " 小时" : " h");
  }
  function formatTime(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat(zh ? "zh-CN" : "en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(date);
  }
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  }
  function hash(value) { return [...String(value)].reduce((sum,char)=>((sum<<5)-sum+char.charCodeAt(0))|0,0); }
  function appStyle(name) {
    const color = palette[Math.abs(hash(name)) % palette.length];
    return { color, soft:"color-mix(in srgb, " + color + ", transparent 84%)" };
  }
  function initials(name) {
    if (/^[\u4e00-\u9fa5]/.test(name)) return name.slice(0,1);
    return name.split(/\s+/).map(part=>part[0]).join("").slice(0,2).toUpperCase();
  }
  function appName(raw="Unknown") { const key=String(raw).toLowerCase(); return appLabels[key] || String(raw).replace(/\.exe$/i,""); }
  async function api(path, options={}) {
    const response = await fetch(path,{credentials:"same-origin",cache:"no-store",...options});
    if (!response.ok) {
      let detail = "";
      try { detail = (await response.json())?.error || ""; } catch {}
      throw new Error(detail || ("HTTP " + response.status));
    }
    return response.json();
  }

  function mergeIntervals(intervals) {
    const sorted = intervals.filter(x=>x.end>x.start).sort((a,b)=>a.start-b.start);
    const result = [];
    for (const interval of sorted) {
      const last = result.at(-1);
      if (last && interval.start <= last.end + 1000) last.end = Math.max(last.end,interval.end);
      else result.push({...interval});
    }
    return result;
  }
  function sameEventData(left,right) {
    return JSON.stringify(left?.data||{}) === JSON.stringify(right?.data||{});
  }

  function floodEvents(input,pulsetime=5) {
    const events = (input||[]).map(event=>({...event,data:{...(event?.data||{})}})).sort((left,right)=>Date.parse(left.timestamp)-Date.parse(right.timestamp));
    const trimThresholdMs = 100;
    const pulseMs = pulsetime*1000;

    for (let index=0; index<events.length-1; index++) {
      const first = events[index], second = events[index+1];
      let firstStart = Date.parse(first.timestamp), secondStart = Date.parse(second.timestamp);
      if (!Number.isFinite(firstStart) || !Number.isFinite(secondStart)) continue;
      let firstDurationMs = Math.max(0,Number(first.duration||0))*1000;
      let secondDurationMs = Math.max(0,Number(second.duration||0))*1000;
      const firstEnd = firstStart+firstDurationMs;
      const secondEnd = secondStart+secondDurationMs;
      const gap = secondStart-firstEnd;
      if (gap === 0) continue;

      if (gap < 0 && sameEventData(first,second)) {
        const start = Math.min(firstStart,secondStart);
        const end = Math.max(firstEnd,secondEnd);
        first.timestamp = new Date(start).toISOString();
        first.duration = (end-start)/1000;
        second.timestamp = new Date(end).toISOString();
        second.duration = 0;
      } else if (gap < -trimThresholdMs) {
        continue;
      } else if (gap > -trimThresholdMs && gap <= pulseMs) {
        if (firstDurationMs >= secondDurationMs) {
          if (sameEventData(first,second)) {
            first.duration = (secondEnd-firstStart)/1000;
            second.timestamp = new Date(secondEnd).toISOString();
            second.duration = 0;
          } else {
            first.duration = (secondStart-firstStart)/1000;
          }
        } else if (sameEventData(first,second)) {
          second.timestamp = new Date(firstStart).toISOString();
          second.duration = (secondEnd-firstStart)/1000;
          first.duration = 0;
        } else {
          second.timestamp = new Date(firstEnd).toISOString();
          second.duration = (secondEnd-firstEnd)/1000;
        }
      }
    }
    return events.filter(event=>Number(event.duration||0)>0);
  }

  function eventInterval(event,start,end) {
    const originalStart = new Date(event.timestamp).getTime();
    return { start:Math.max(originalStart,start.getTime()), end:Math.min(originalStart+Number(event.duration||0)*1000,end.getTime()), event };
  }
  function activeWindowEvents(windowEvents,afkEvents,start,end) {
    const windows = floodEvents(windowEvents).map(event=>eventInterval(event,start,end)).filter(x=>x.end>x.start).sort((a,b)=>a.start-b.start);
    if (afkEvents === null) return windows;
    const activeIntervals = mergeIntervals(floodEvents(afkEvents).filter(event=>event.data?.status==="not-afk").map(event=>eventInterval(event,start,end)));
    if (!activeIntervals.length) return [];
    const result = [];
    let cursor = 0;
    for (const window of windows) {
      while (cursor < activeIntervals.length && activeIntervals[cursor].end <= window.start) cursor++;
      for (let index=cursor; index<activeIntervals.length; index++) {
        const active = activeIntervals[index];
        if (active.start >= window.end) break;
        const from = Math.max(window.start,active.start), to = Math.min(window.end,active.end);
        if (to > from) result.push({start:from,end:to,event:window.event});
      }
    }
    return result;
  }

  function bucketKind(bucket,kind) {
    const type = String(bucket?.type||"").toLowerCase();
    const id = String(bucket?.id||"").toLowerCase();
    if (kind === "currentwindow") return type === "currentwindow" || id.startsWith("aw-watcher-window_");
    if (kind === "afkstatus") return type === "afkstatus" || id.startsWith("aw-watcher-afk_");
    return false;
  }

  function bucketHost(bucket) {
    const hostname = String(bucket?.hostname||"").trim();
    if (hostname) return hostname.toLowerCase();
    const id = String(bucket?.id||"");
    for (const prefix of ["aw-watcher-window_","aw-watcher-afk_"]) {
      if (id.toLowerCase().startsWith(prefix)) return id.slice(prefix.length).toLowerCase();
    }
    return id.toLowerCase();
  }

  function bucketRecency(bucket) {
    return Date.parse(bucket?.last_sync||bucket?.last_event||"") || 0;
  }

  function latestBucketsByHost(entries,kind) {
    const selected = new Map();
    for (const bucket of entries.filter(item=>bucketKind(item,kind))) {
      const host = bucketHost(bucket);
      const current = selected.get(host);
      if (!current || bucketRecency(bucket) > bucketRecency(current)) selected.set(host,bucket);
    }
    return [...selected.values()].sort((left,right)=>bucketRecency(right)-bucketRecency(left) || bucketHost(left).localeCompare(bucketHost(right)));
  }

  function subtractCoverage(segment,coverage) {
    let pieces = [{...segment}];
    for (const interval of coverage) {
      if (!pieces.length) break;
      const next = [];
      for (const piece of pieces) {
        if (interval.end <= piece.start || interval.start >= piece.end) {
          next.push(piece);
          continue;
        }
        if (interval.start > piece.start) next.push({...piece,end:Math.min(interval.start,piece.end)});
        if (interval.end < piece.end) next.push({...piece,start:Math.max(interval.end,piece.start)});
      }
      pieces = next.filter(piece=>piece.end>piece.start);
    }
    return pieces;
  }

  function unionHostSegments(hostGroups) {
    const accepted = [];
    let coverage = [];
    for (const group of hostGroups) {
      for (const segment of group) accepted.push(...subtractCoverage(segment,coverage));
      coverage = mergeIntervals([...coverage,...group.map(segment=>({start:segment.start,end:segment.end}))]);
    }
    return accepted.sort((left,right)=>left.start-right.start || left.end-right.end);
  }

  function metrics(segments,start,end) {
    const ordered = [...segments].filter(segment=>segment.end>segment.start).sort((a,b)=>a.start-b.start);
    const activeIntervals = mergeIntervals(ordered.map(segment=>({start:segment.start,end:segment.end})));
    const total = activeIntervals.reduce((sum,interval)=>sum+(interval.end-interval.start)/1000,0);
    const byApp = new Map();
    const hourly = Array(state.range === "day" ? 24 : 7).fill(0);
    let switches = 0, previousApp = "";

    for (const segment of ordered) {
      const raw = segment.event.data?.app || segment.event.data?.application || "Unknown";
      const seconds = (segment.end-segment.start)/1000;
      const item = byApp.get(raw) || {raw,name:appName(raw),seconds:0,count:0,lastTitle:""};
      item.seconds += seconds;
      item.count += 1;
      item.lastTitle = segment.event.data?.title || "";
      byApp.set(raw,item);
      if (previousApp && previousApp !== raw) switches++;
      previousApp = raw;
    }

    for (const interval of activeIntervals) {
      if (state.range === "day") {
        const cursor = new Date(interval.start);
        while (cursor.getTime() < interval.end) {
          const hourEnd = new Date(cursor);
          hourEnd.setMinutes(60,0,0);
          const boundary = Math.min(interval.end,hourEnd.getTime());
          hourly[cursor.getHours()] += (boundary-cursor.getTime())/1000;
          cursor.setTime(boundary);
        }
      } else {
        let cursor = interval.start;
        while (cursor < interval.end) {
          const dayIndex = Math.max(0,Math.min(6,Math.floor((cursor-start.getTime())/86400000)));
          const dayEnd = Math.min(interval.end,start.getTime()+(dayIndex+1)*86400000);
          hourly[dayIndex] += (dayEnd-cursor)/1000;
          cursor = dayEnd;
        }
      }
    }

    const sessions = [];
    for (const interval of activeIntervals) {
      const seconds = (interval.end-interval.start)/1000;
      const last = sessions.at(-1);
      if (last && interval.start-last.end <= 5*60*1000) {
        last.end = Math.max(last.end,interval.end);
        last.activeSeconds += seconds;
      } else {
        sessions.push({start:interval.start,end:interval.end,activeSeconds:seconds});
      }
    }

    const longestSession = Math.max(0,...sessions.map(session=>session.activeSeconds));
    const deepSeconds = sessions.filter(session=>session.activeSeconds>=25*60).reduce((sum,session)=>sum+session.activeSeconds,0);
    const elapsed = Math.max(0,Math.min(end.getTime(),Date.now())-start.getTime())/1000;
    const away = Math.max(0,elapsed-total);
    const switchesPerHour = total ? switches/Math.max(total/3600,1/3600) : 0;
    const switchPenalty = Math.min(25,switchesPerHour*1.8);
    const focusRatio = total ? Math.min(1,deepSeconds/total) : 0;
    const focusScore = Math.round(Math.max(0,Math.min(100,focusRatio*60+40-switchPenalty)));
    return {total,hourly,switches,longestSession,deepSeconds,away,focusScore,apps:[...byApp.values()].sort((a,b)=>b.seconds-a.seconds),sessions};
  }

  async function loadSegments(start,end) {
    const entries = Object.values(state.buckets||{});
    const windows = latestBucketsByHost(entries,"currentwindow");
    const afks = latestBucketsByHost(entries,"afkstatus");
    const afkByHost = new Map(afks.map(bucket=>[bucketHost(bucket),bucket]));
    const groups = [];
    const query = new URLSearchParams({start:start.toISOString(),end:end.toISOString(),limit:"-1"}).toString();

    for (const bucket of windows) {
      const windowEvents = await api("/api/0/buckets/" + encodeURIComponent(bucket.id) + "/events?" + query);
      const afk = afkByHost.get(bucketHost(bucket));
      const afkEvents = afk
        ? await api("/api/0/buckets/" + encodeURIComponent(afk.id) + "/events?" + query)
        : null;
      groups.push(activeWindowEvents(windowEvents,afkEvents,start,end));
    }

    return unionHostSegments(groups);
  }

  function renderStatus(status) {
    const values = Object.values(status?.buckets||{});
    $("bucketCount").textContent = values.length;
    $("lastSync").textContent = values.length ? (zh ? "最近同步 " + formatTime(status?.last_sync) : "Last sync " + formatTime(status?.last_sync)) : (zh ? "等待电脑连接" : "Waiting for computer");
    $("lastSyncHost").textContent = status?.last_host || (zh ? "尚未连接电脑" : "Not connected");
    $("deviceName").textContent = status?.last_host || (zh ? "未连接电脑" : "No computer");
    $("syncLabel").textContent = values.length ? (zh ? "同步正常" : "Sync active") : (zh ? "等待电脑连接" : "Waiting for a computer");
    $("syncDetail").textContent = values.length ? (zh ? values.length + " 个数据源已连接" : values.length + " data sources connected") : (zh ? "生成设备令牌后连接 Windows 客户端" : "Create a token to connect Windows");
    $("syncDot").classList.toggle("ok",Boolean(values.length));
    $("sourceHost").textContent = status?.last_host || "—";
    $("sourceLastSync").textContent = formatTime(status?.last_sync);
    $("connectionStatus").classList.toggle("online",Boolean(values.length));
    $("connectionStatus").innerHTML = values.length ? "<i></i> 已连接" : "未连接";
  }
  function renderBuckets() {
    const entries = Object.values(state.buckets||{}).sort((a,b)=>String(b.last_sync||"").localeCompare(String(a.last_sync||"")));
    if (!entries.length) {
      $("buckets").innerHTML = '<p class="muted">' + (zh ? "还没有同步数据。连接电脑后，这里会显示 ActivityWatch 的 Bucket。" : "No synced data yet.") + "</p>";
      return;
    }
    $("buckets").innerHTML = entries.map(bucket =>
      '<div class="bucket"><div><strong>' + escapeHtml(bucket.id) + '</strong><small>' +
      escapeHtml(bucket.type||"unknown") + " · " + escapeHtml(bucket.hostname||"unknown host") +
      '</small></div><small>' + formatTime(bucket.last_sync) + "</small></div>"
    ).join("");
  }
  function renderChart(values) {
    const chart = $("activityChart");
    const max = Math.max(1,...values);
    const peak = values.indexOf(max);
    const labels = state.range === "day" ? values.map((_,i)=>i%3===0?String(i).padStart(2,"0"):"") : ["周一","周二","周三","周四","周五","周六","周日"];
    chart.style.gridTemplateColumns = "repeat(" + values.length + ",1fr)";
    chart.innerHTML = values.map((value,index)=>{
      const height = value ? Math.max(4,(value/max)*100) : 2;
      const tooltip = (state.range==="day" ? String(index).padStart(2,"0")+":00" : labels[index]) + " · " + formatShort(value);
      return '<div class="bar-wrap"><div class="bar ' + (index===peak&&value?"peak":"") + '" style="--height:' + height + '%" data-label="' + tooltip + '"></div><span>' + labels[index] + "</span></div>";
    }).join("");
  }
  function appRow(app,maxSeconds) {
    const style = appStyle(app.raw);
    const width = Math.max(4,Math.min(100,(app.seconds/Math.max(1,maxSeconds))*100));
    return '<div class="app-row"><span class="app-logo" style="--logo-bg:' + style.soft + ';--logo-color:' + style.color + '">' +
      initials(app.name) + '</span><span class="app-info"><strong title="' + escapeHtml(app.name) + '">' + escapeHtml(app.name) +
      '</strong><small>' + app.count + ' 个片段</small></span><span class="app-progress"><i style="width:' + width.toFixed(1) +
      '%;background:' + style.color + '"></i></span><span class="app-time">' + formatShort(app.seconds) + "</span></div>";
  }
  function renderApps(apps) {
    state.apps = apps;
    const maxSeconds = apps[0]?.seconds || 1;
    $("appList").innerHTML = apps.length ? apps.slice(0,5).map(app=>appRow(app,maxSeconds)).join("") : '<div class="empty-state">这个时间段还没有应用活动</div>';
    $("dialogList").innerHTML = apps.length ? apps.map(app=>appRow(app,maxSeconds)).join("") : '<div class="empty-state">暂无活动</div>';
  }
  function renderTimeline(segments) {
    const chronological = [...segments].sort((a,b)=>b.start-a.start).filter((segment,index,all)=>index===0 || segment.event.data?.app!==all[index-1].event.data?.app || all[index-1].start-segment.end>60000);
    $("eventCount").textContent = segments.length + " 条";
    $("timelineList").innerHTML = chronological.length ? chronological.slice(0,7).map(segment=>{
      const raw = segment.event.data?.app || segment.event.data?.application || "Unknown";
      const name = appName(raw);
      const style = appStyle(raw);
      const time = new Intl.DateTimeFormat(zh?"zh-CN":"en-US",{hour:"2-digit",minute:"2-digit",hour12:false}).format(segment.start);
      return '<div class="timeline-item"><span class="timeline-time">' + time + '</span><i class="timeline-dot" style="--dot:' + style.color +
        '"></i><span class="timeline-copy"><strong>' + escapeHtml(name) + '</strong><small title="' + escapeHtml(segment.event.data?.title||"") +
        '">' + escapeHtml(segment.event.data?.title||"无窗口标题") + '</small></span><span class="timeline-duration">' +
        formatShort((segment.end-segment.start)/1000) + "</span></div>";
    }).join("") : '<div class="empty-state">这个时间段还没有活动记录</div>';
  }
  function renderMetrics(result) {
    const total = result.total, switches = result.switches, longestSession = result.longestSession, deepSeconds = result.deepSeconds, away = result.away, focusScore = result.focusScore, apps = result.apps;
    $("activeTime").textContent = formatDuration(total);
    $("activeCompare").textContent = apps.length ? apps.length + " 个应用 · " + result.sessions.length + " 次使用时段" : "等待新的活动记录";
    $("focusScore").textContent = focusScore;
    $("focusProgress").style.width = focusScore + "%";
    $("focusCaption").textContent = focusScore>=70 ? "节奏稳定，继续保持" : focusScore>=45 ? "保持一段连续专注" : "切换略多，试试减少打断";
    $("longestSession").textContent = formatDuration(longestSession,true);
    $("sessionCaption").textContent = longestSession>=1500 ? "已达到一次深度专注" : "25 分钟以上计为深度专注";
    $("switchCount").textContent = switches.toLocaleString(zh?"zh-CN":"en-US");
    $("switchCaption").textContent = total ? "平均每小时 " + Math.round(switches/Math.max(total/3600,1/3600)) + " 次" : "应用间切换";
    const ratio = total ? Math.max(0,Math.min(100,Math.round(deepSeconds/total*100))) : 0;
    $("focusDonut").style.setProperty("--value",ratio);
    $("donutValue").textContent = ratio + "%";
    $("deepTime").textContent = formatShort(deepSeconds);
    $("fragmentTime").textContent = formatShort(Math.max(0,total-deepSeconds));
    $("awayTime").textContent = formatShort(away);
    renderChart(result.hourly);
    renderApps(apps);
  }
  function updateControls() {
    $("dateLabel").textContent = formatDateLabel();
    $("dateInput").value = state.date.getFullYear() + "-" + String(state.date.getMonth()+1).padStart(2,"0") + "-" + String(state.date.getDate()).padStart(2,"0");
    $$(".range-tabs button").forEach(button=>button.classList.toggle("active",button.dataset.range===state.range));
    $("activitySubtitle").textContent = state.range==="day" ? "每小时的有效使用时长" : "本周每天的有效使用时长";
  }
  function showNotice(message) { $("notice").querySelector("span").textContent = message; $("notice").classList.remove("hidden"); }
  function hideNotice() { $("notice").classList.add("hidden"); }

  async function load() {
    const requestId = ++state.requestId;
    $("refreshButton").classList.add("loading");
    hideNotice();
    updateControls();
    try {
      const [status,bucketMap] = await Promise.all([api("/api/watch/status"),api("/api/0/buckets/")]);
      if (requestId !== state.requestId) return;
      state.buckets = bucketMap || {};
      renderStatus(status);
      renderBuckets();
      const range = period();
      const segments = await loadSegments(range.start,range.end);
      if (requestId !== state.requestId) return;
      const result = metrics(segments,range.start,range.end);
      renderMetrics(result);
      renderTimeline(segments);
      document.title = formatDuration(result.total,true) + " · AERTEX Watch";
    } catch (error) {
      console.error(error);
      showNotice((zh ? "无法读取 AERTEX Watch 数据：" : "Unable to load AERTEX Watch data: ") + (error?.message||String(error)));
      $("syncLabel").textContent = zh ? "无法读取同步状态" : "Could not load sync status";
      $("syncDetail").textContent = error?.message || String(error);
      $("syncDot").classList.remove("ok");
    } finally {
      $("refreshButton").classList.remove("loading");
    }
  }

  function bind() {
    $("backHome").href = rootOrigin();
    $("setupGuide").href = rootOrigin() + "/" + locale + "/aw/setup";
    $("previousButton").addEventListener("click",()=>{state.date=addDays(state.date,state.range==="day"?-1:-7);load();});
    $("nextButton").addEventListener("click",()=>{state.date=addDays(state.date,state.range==="day"?1:7);load();});
    $("todayButton").addEventListener("click",()=>{state.date=startOfDay(new Date());load();});
    $("refreshButton").addEventListener("click",load);
    $("retryButton").addEventListener("click",load);
    $("dateButton").addEventListener("click",()=>$("dateInput").showPicker?.());
    $("dateInput").addEventListener("change",event=>{const parts=event.target.value.split("-").map(Number);state.date=new Date(parts[0],parts[1]-1,parts[2]);load();});
    $$(".range-tabs button").forEach(button=>button.addEventListener("click",()=>{state.range=button.dataset.range;load();}));
    $("showAllApps").addEventListener("click",()=>$("appsDialog").showModal());
    $("closeDialog").addEventListener("click",()=>$("appsDialog").close());
    $("appsDialog").addEventListener("click",event=>{if(event.target===event.currentTarget)event.currentTarget.close();});
    $$(".nav-item[data-target]").forEach(button=>button.addEventListener("click",()=>document.getElementById(button.dataset.target)?.scrollIntoView({behavior:"smooth",block:"start"})));
    const observer = new IntersectionObserver(entries=>{
      const visible = entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if (!visible) return;
      $$(".nav-item[data-target]").forEach(button=>button.classList.toggle("active",button.dataset.target===visible.target.id));
    },{rootMargin:"-15% 0px -65% 0px",threshold:[0,.2]});
    $$(".section-anchor").forEach(section=>observer.observe(section));

    $("createToken").addEventListener("click",async()=>{
      try {
        const result = await api("/api/watch/tokens",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:navigator.platform||"ActivityWatch device"})});
        $("tokenValue").textContent = result.token;
        $("tokenBox").hidden = false;
      } catch (error) { showNotice(error?.message||String(error)); }
    });
    $("copyToken").addEventListener("click",async()=>{
      const token = $("tokenValue").textContent;
      if (!token) return;
      await navigator.clipboard.writeText(token);
      $("copyToken").textContent = zh ? "已复制" : "Copied";
      setTimeout(()=>$("copyToken").textContent=zh?"复制":"Copy",1400);
    });
  }

  bind();
  load();
  setInterval(()=>{const today=startOfDay(new Date());if(state.range==="day"&&state.date.getTime()===today.getTime())load();},60000);
})();
