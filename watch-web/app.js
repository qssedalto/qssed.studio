(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const locale = location.pathname.split("/").filter(Boolean)[0] || "en-us";
  const zh = locale.toLowerCase().startsWith("zh");
  let buckets = {};

  function rootOrigin() {
    const host = location.hostname.toLowerCase();
    for (const root of ["qsseda.com","qsseda.online","qsseda.studio"]) {
      if (host === root || host.endsWith("." + root)) return "https://" + root;
    }
    return "/";
  }

  function fmtDuration(seconds) {
    const value = Math.max(0, Number(seconds || 0));
    const hours = Math.floor(value / 3600);
    const minutes = Math.round((value % 3600) / 60);
    return hours ? hours + "h " + minutes + "m" : minutes + "m";
  }

  function fmtTime(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat(zh ? "zh-CN" : "en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" }).format(date);
  }

  async function api(path, options = {}) {
    const response = await fetch(path, { credentials:"same-origin", cache:"no-store", ...options });
    if (!response.ok) {
      let detail = "";
      try { detail = (await response.json())?.error || ""; } catch {}
      throw new Error(detail || ("HTTP " + response.status));
    }
    return response.json();
  }

  async function load() {
    $("backHome").href = rootOrigin();
    const [status, bucketMap] = await Promise.all([
      api("/api/watch/status"),
      api("/api/0/buckets/")
    ]);
    buckets = bucketMap || {};
    renderStatus(status);
    renderBuckets();
    await renderToday();
  }

  function renderStatus(status) {
    const values = Object.values(status?.buckets || {});
    $("bucketCount").textContent = values.length;
    $("lastSync").textContent = fmtTime(status?.last_sync);
    $("lastSyncHost").textContent = status?.last_host || (zh ? "等待设备" : "Waiting for a device");
    $("syncLabel").textContent = values.length ? (zh ? "云端已连接" : "Cloud connected") : (zh ? "等待首次同步" : "Waiting for first sync");
    $("syncDetail").textContent = values.length ? (zh ? values.length + " 个数据桶" : values.length + " buckets") : (zh ? "生成设备令牌后启动同步代理" : "Create a device token and start the sync agent");
    $("syncDot").classList.toggle("ok", Boolean(values.length));
  }

  function renderBuckets() {
    const entries = Object.values(buckets || {}).sort((a,b) => String(b.last_sync || "").localeCompare(String(a.last_sync || "")));
    if (!entries.length) {
      $("buckets").innerHTML = '<p class="muted">' + (zh ? "云端还没有数据。先连接一台运行 ActivityWatch 的电脑。" : "No cloud data yet. Connect a computer running ActivityWatch first.") + "</p>";
      return;
    }
    $("buckets").innerHTML = entries.map(bucket =>
      '<div class="bucket"><div><strong>' + escapeHtml(bucket.id) + '</strong><small>' +
      escapeHtml(bucket.type || "unknown") + " · " + escapeHtml(bucket.hostname || "unknown host") +
      '</small></div><small>' + fmtTime(bucket.last_sync) + "</small></div>"
    ).join("");
  }

  async function renderToday() {
    const windowBuckets = Object.values(buckets || {}).filter(bucket =>
      String(bucket.type || "").includes("currentwindow") || String(bucket.id || "").includes("window")
    );
    if (!windowBuckets.length) {
      $("todayDuration").textContent = "0m";
      $("apps").innerHTML = '<p class="muted">' + (zh ? "还没有窗口活动数据。" : "No window activity data yet.") + "</p>";
      return;
    }

    const start = new Date();
    start.setHours(0,0,0,0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const all = [];

    for (const bucket of windowBuckets) {
      const query = new URLSearchParams({ start:start.toISOString(), end:end.toISOString(), limit:"20000" });
      try {
        const events = await api("/api/0/buckets/" + encodeURIComponent(bucket.id) + "/events?" + query);
        all.push(...events);
      } catch {}
    }

    const byApp = new Map();
    let total = 0;
    for (const event of all) {
      const duration = Math.max(0, Number(event.duration || 0));
      const app = String(event?.data?.app || event?.data?.application || "Unknown");
      total += duration;
      byApp.set(app, (byApp.get(app) || 0) + duration);
    }

    $("todayDuration").textContent = fmtDuration(total);
    const ranked = [...byApp.entries()].sort((a,b) => b[1]-a[1]).slice(0,10);
    const max = ranked[0]?.[1] || 1;
    $("apps").innerHTML = ranked.length ? ranked.map(([app,seconds]) =>
      '<div class="app-row"><span>' + escapeHtml(app) + '</span><div class="bar"><i style="width:' +
      Math.max(2, seconds/max*100).toFixed(1) + '%"></i></div><strong>' + fmtDuration(seconds) + "</strong></div>"
    ).join("") : '<p class="muted">' + (zh ? "今天还没有数据。" : "No data for today yet.") + "</p>";
  }

  $("refreshButton").addEventListener("click", () => load().catch(showError));

  $("createToken").addEventListener("click", async () => {
    try {
      const result = await api("/api/watch/tokens", {
        method:"POST",
        headers:{ "content-type":"application/json" },
        body:JSON.stringify({ name:navigator.platform || "ActivityWatch device" })
      });
      $("tokenValue").textContent = result.token;
      $("tokenBox").hidden = false;
    } catch (error) {
      showError(error);
    }
  });

  $("copyToken").addEventListener("click", async () => {
    const token = $("tokenValue").textContent;
    if (!token) return;
    await navigator.clipboard.writeText(token);
    $("copyToken").textContent = zh ? "已复制" : "Copied";
    setTimeout(() => $("copyToken").textContent = zh ? "复制" : "Copy", 1400);
  });

  function showError(error) {
    $("syncLabel").textContent = zh ? "云端读取失败" : "Cloud load failed";
    $("syncDetail").textContent = error?.message || String(error);
    $("syncDot").classList.remove("ok");
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    })[char]);
  }

  load().catch(showError);
})();
