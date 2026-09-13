import { MAX_STORAGE_FILE_BYTES } from "./config.js";

export function storageSettingsContent(zh) {
  const copy = zh ? {
    connected: "已连接",
    checking: "检查中",
    files: "文件",
    used: "已用空间",
    refreshed: "最近更新",
    select: "选择文件",
    refresh: "刷新",
    search: "搜索文件名或所属账号",
    name: "文件名",
    owner: "所属账号",
    type: "类型",
    size: "大小",
    uploaded: "上传时间",
    actions: "操作",
    download: "下载",
    remove: "删除",
    loading: "正在读取你的私人文件…",
    empty: "还没有文件。选择文件后即可上传到你的私人存储空间。",
    partial: "文件数量较多，当前统计仅包含前 10,000 个对象。",
    uploadIdle: "每个文件最大 50 MB，文件会逐个上传。",
    storage: "Cloudflare R2",
    unavailable: "存储服务暂时不可用。",
    notAuthorized: "当前账号不可使用私人存储。",
    signInAgain: "登录状态已失效，请重新登录。",
    login: "前往登录",
    deleteConfirm: "确定要删除“{name}”吗？此操作无法撤销。",
    uploadComplete: "已上传 {count} 个文件。",
    uploadFailed: "上传失败：{message}",
    uploading: "正在上传 {current}/{total} · {name}",
    deleting: "正在删除 {name}…",
    downloadFailed: "下载失败：{message}",
    deleteFailed: "删除失败：{message}",
    refreshedNow: "刚刚",
    tooLarge: "“{name}”超过 50 MB，未上传。",
    connectionDescription: "文件仅对当前账号可见，并通过已登录的 Worker API 安全存取；浏览器不会直接访问 R2。"
  } : {
    connected: "Connected",
    checking: "Checking",
    files: "Files",
    used: "Used",
    refreshed: "Updated",
    select: "Choose Files",
    refresh: "Refresh",
    search: "Search files or owners",
    name: "File name",
    owner: "Owner",
    type: "Type",
    size: "Size",
    uploaded: "Uploaded",
    actions: "Actions",
    download: "Download",
    remove: "Delete",
    loading: "Loading your private files…",
    empty: "No files yet. Choose files to upload them to your private storage.",
    partial: "There are many files; this statistic includes only the first 10,000 objects.",
    uploadIdle: "50 MB maximum per file. Files upload one at a time.",
    storage: "Cloudflare R2",
    unavailable: "Storage service is temporarily unavailable.",
    notAuthorized: "This account is not allowed to use private storage.",
    signInAgain: "Your session has expired. Please sign in again.",
    login: "Sign in",
    deleteConfirm: "Delete “{name}”? This cannot be undone.",
    uploadComplete: "Uploaded {count} files.",
    uploadFailed: "Upload failed: {message}",
    uploading: "Uploading {current}/{total} · {name}",
    deleting: "Deleting {name}…",
    downloadFailed: "Download failed: {message}",
    deleteFailed: "Delete failed: {message}",
    refreshedNow: "Just now",
    tooLarge: "“{name}” exceeds 50 MB and was not uploaded.",
    connectionDescription: "Files are private to the current account and accessed securely through the signed-in Worker API; the browser never connects to R2 directly."
  };

  return `
    <style>
      #storage-manager.is-admin .storage-file-row{
        min-width:820px;
        grid-template-columns:minmax(150px,1.25fr) minmax(150px,1fr) minmax(104px,.78fr) minmax(68px,.46fr) minmax(112px,.72fr) minmax(132px,.76fr);
      }
      #storage-manager .storage-owner-cell{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted)}
      #storage-manager .storage-owner-cell[hidden],#storage-manager [data-storage-owner-header][hidden]{display:none}
      @media (max-width:720px){#storage-manager.is-admin .storage-file-row{min-width:800px}}
    </style>
    <section id="storage-manager" class="storage-manager">
      <section class="storage-overview-panel">
        <div class="storage-overview-copy">
          <div class="storage-service-line">
            <span class="storage-status-dot" aria-hidden="true"></span>
            <strong>${copy.storage}</strong>
            <span id="storage-connection" class="storage-connection-state">${copy.checking}</span>
          </div>
          <p id="storage-description">${copy.connectionDescription}</p>
        </div>
        <div class="storage-overview-stats">
          <div class="storage-stat">
            <span>${copy.files}</span>
            <strong id="storage-file-count">—</strong>
          </div>
          <div class="storage-stat">
            <span>${copy.used}</span>
            <strong id="storage-used-bytes">—</strong>
          </div>
          <div class="storage-refresh-group">
            <div>
              <span>${copy.refreshed}</span>
              <strong id="storage-refreshed-at">—</strong>
            </div>
            <button id="storage-refresh-button" class="storage-refresh-button" type="button" aria-label="${copy.refresh}" title="${copy.refresh}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6v5h-5"/><path d="M19 11a7 7 0 1 0 1 4"/></svg>
            </button>
          </div>
        </div>
      </section>

      <section class="storage-toolbar">
        <button id="storage-upload-button" class="storage-upload-button" type="button">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
          <span>${copy.select}</span>
        </button>
        <input id="storage-file-input" type="file" multiple hidden>
        <label class="storage-search-shell">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg>
          <input id="storage-search" class="storage-search" type="search" placeholder="${copy.search}" aria-label="${copy.search}" autocomplete="off">
        </label>
      </section>

      <div class="storage-feedback">
        <p id="storage-upload-status" class="storage-upload-status">${copy.uploadIdle}</p>
        <p id="storage-api-status" class="storage-api-status" role="status"></p>
        <a id="storage-login-link" class="storage-login-link" href="#" hidden>${copy.login}</a>
      </div>

      <section class="storage-browser">
        <div class="storage-table" role="table" aria-label="${copy.files}">
          <div class="storage-file-row storage-file-head" role="row">
            <span role="columnheader">${copy.name}</span>
            <span data-storage-owner-header role="columnheader" hidden>${copy.owner}</span>
            <span role="columnheader">${copy.type}</span>
            <span role="columnheader">${copy.size}</span>
            <span role="columnheader">${copy.uploaded}</span>
            <span role="columnheader">${copy.actions}</span>
          </div>
          <div id="storage-file-list" class="storage-file-list" role="rowgroup"></div>
        </div>
        <p id="storage-partial-notice" class="storage-partial-notice" hidden>${copy.partial}</p>
      </section>
    </section>
  `;
}
export function storageClientScript(zh, loginUrl) {
  const copy = zh ? {
    connected: "已连接",
    checking: "检查中",
    loading: "正在读取你的私人文件…",
    emptyTitle: "还没有文件",
    emptyHint: "选择文件后即可上传到你的私人存储空间。",
    noMatches: "没有匹配的文件或所属账号。",
    unavailable: "存储服务暂时不可用。",
    notAuthorized: "当前账号不可使用私人存储。",
    signInAgain: "登录状态已失效，请重新登录。",
    login: "前往登录",
    download: "下载",
    remove: "删除",
    select: "选择文件",
    uploadIdle: "每个文件最大 50 MB，文件会逐个上传。",
    partial: "文件数量较多，当前统计仅包含前 10,000 个对象。",
    uploadComplete: "已上传 {count} 个文件。",
    uploadCompleteWithSkipped: "已上传 {count} 个文件，跳过 {skipped} 个超过 50 MB 的文件。",
    uploadFailed: "上传失败：{message}",
    uploading: "正在上传 {current}/{total} · {name}",
    deleting: "正在删除 {name}…",
    downloadFailed: "下载失败：{message}",
    deleteFailed: "删除失败：{message}",
    deleteConfirm: "确定要删除“{name}”吗？此操作无法撤销。",
    tooLarge: "“{name}”超过 50 MB，未上传。",
    refreshedNow: "刚刚",
    userDescription: "文件仅对当前账号可见，并通过已登录的 Worker API 安全存取；浏览器不会直接访问 R2。",
    adminDescription: "管理员视图会汇总所有账号的 R2 文件，并显示文件所属账号；跨账号下载或删除仍由 Worker 在服务端验证管理员权限。"
  } : {
    connected: "Connected",
    checking: "Checking",
    loading: "Loading your private files…",
    emptyTitle: "No files yet",
    emptyHint: "Choose files to upload them to your private storage.",
    noMatches: "No matching files or owners.",
    unavailable: "Storage service is temporarily unavailable.",
    notAuthorized: "This account is not allowed to use private storage.",
    signInAgain: "Your session has expired. Please sign in again.",
    login: "Sign in",
    download: "Download",
    remove: "Delete",
    select: "Choose Files",
    uploadIdle: "50 MB maximum per file. Files upload one at a time.",
    partial: "There are many files; this statistic includes only the first 10,000 objects.",
    uploadComplete: "Uploaded {count} files.",
    uploadCompleteWithSkipped: "Uploaded {count} files and skipped {skipped} files larger than 50 MB.",
    uploadFailed: "Upload failed: {message}",
    uploading: "Uploading {current}/{total} · {name}",
    deleting: "Deleting {name}…",
    downloadFailed: "Download failed: {message}",
    deleteFailed: "Delete failed: {message}",
    deleteConfirm: "Delete “{name}”? This cannot be undone.",
    tooLarge: "“{name}” exceeds 50 MB and was not uploaded.",
    refreshedNow: "Just now",
    userDescription: "Files are private to the current account and accessed securely through the signed-in Worker API; the browser never connects to R2 directly.",
    adminDescription: "The administrator view aggregates R2 files across accounts and shows each owner; cross-account downloads and deletes are still authorized by the Worker on the server."
  };

  return `
    <script>
      (() => {
        const copy = ${JSON.stringify(copy)};
        const loginUrl = ${JSON.stringify(loginUrl)};
        const maximumBytes = ${MAX_STORAGE_FILE_BYTES};
        const STORAGE_CACHE_PREFIX = "qssed-storage-v2:";
        const root = document.getElementById("storage-manager");
        if (!root) return;

        const fileInput = document.getElementById("storage-file-input");
        const uploadButton = document.getElementById("storage-upload-button");
        const refreshButton = document.getElementById("storage-refresh-button");
        const searchInput = document.getElementById("storage-search");
        const fileList = document.getElementById("storage-file-list");
        const apiStatus = document.getElementById("storage-api-status");
        const uploadStatus = document.getElementById("storage-upload-status");
        const loginLink = document.getElementById("storage-login-link");
        const partialNotice = document.getElementById("storage-partial-notice");
        const connection = document.getElementById("storage-connection");
        const fileCount = document.getElementById("storage-file-count");
        const usedBytes = document.getElementById("storage-used-bytes");
        const refreshedAt = document.getElementById("storage-refreshed-at");
        const storageDescription = document.getElementById("storage-description");
        const ownerHeader = root.querySelector("[data-storage-owner-header]");

        let files = [];
        let partial = false;
        let currentFilter = "";
        let isBusy = false;
        let currentUserId = "";
        let storageCacheFingerprint = "";
        let hasStorageSnapshot = false;
        let refreshSequence = 0;
        let isAdminView = false;

        class SessionExpiredError extends Error {}
        class StorageForbiddenError extends Error {}

        function message(template, values) {
          return Object.entries(values || {}).reduce((text, entry) => text.replace("{" + entry[0] + "}", entry[1]), template);
        }

        function formatBytes(bytes) {
          const value = Number(bytes) || 0;
          if (value < 1024) return value + " B";
          const units = ["KB", "MB", "GB", "TB"];
          let size = value / 1024;
          let index = 0;
          while (size >= 1024 && index < units.length - 1) { size /= 1024; index += 1; }
          return size.toLocaleString(undefined, { maximumFractionDigits: size >= 100 ? 0 : 1 }) + " " + units[index];
        }

        function formatDate(value) {
          if (!value) return "—";
          const date = new Date(value);
          return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
        }

        function formatRefreshTime(value) {
          const timestamp = Number(value) || Date.now();
          const date = new Date(timestamp);
          if (Number.isNaN(date.getTime())) return copy.refreshedNow;
          const age = Date.now() - timestamp;
          if (age < 60000) return copy.refreshedNow;
          const now = new Date();
          if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
          }
          return date.toLocaleDateString();
        }

        function setApiStatus(text, kind) {
          apiStatus.textContent = text || "";
          apiStatus.className = "storage-api-status" + (kind ? " is-" + kind : "");
        }

        function setUploadStatus(text, kind) {
          uploadStatus.textContent = text || "";
          uploadStatus.className = "storage-upload-status" + (kind ? " is-" + kind : "");
        }

        function storageCacheKey(userId) {
          return STORAGE_CACHE_PREFIX + String(userId || "");
        }

        function readStorageCache(userId) {
          if (!userId) return null;
          try {
            const parsed = JSON.parse(sessionStorage.getItem(storageCacheKey(userId)) || "null");
            return parsed && parsed.data && Array.isArray(parsed.data.files) ? parsed : null;
          } catch {
            return null;
          }
        }

        function writeStorageCache(data, fingerprint, refreshedAtValue) {
          if (!currentUserId) return;
          try {
            sessionStorage.setItem(storageCacheKey(currentUserId), JSON.stringify({
              fingerprint,
              refreshedAt: refreshedAtValue,
              data
            }));
          } catch {}
        }

        function clearStorageCache() {
          if (!currentUserId) return;
          try { sessionStorage.removeItem(storageCacheKey(currentUserId)); } catch {}
        }

        function storageFingerprint(data) {
          const normalizedFiles = (Array.isArray(data?.files) ? data.files : []).map(file => [
            file?.id || "",
            file?.name || "",
            file?.ownerLabel || "",
            file?.mediaType || file?.contentType || "",
            Number(file?.size) || 0,
            file?.uploadedAt || ""
          ]);
          return JSON.stringify([
            Boolean(data?.is_admin),
            Number(data?.file_count) || 0,
            Number(data?.used_bytes) || 0,
            Boolean(data?.partial),
            normalizedFiles
          ]);
        }

        function resetMetrics() {
          fileCount.textContent = "—";
          usedBytes.textContent = "—";
          refreshedAt.textContent = "—";
          partial = false;
          partialNotice.hidden = true;
        }

        function setBusy(busy) {
          isBusy = busy;
          const unavailable = root.classList.contains("is-unavailable");
          uploadButton.disabled = busy || unavailable;
          refreshButton.disabled = busy;
          fileInput.disabled = busy || unavailable;
          root.querySelectorAll(".storage-action-button,.storage-empty-upload").forEach(button => {
            button.disabled = busy || unavailable;
          });
        }

        function clearStorageView() {
          resetMetrics();
          files = [];
          hasStorageSnapshot = false;
          renderFiles();
        }

        function showSessionExpired() {
          clearStorageCache();
          clearStorageView();
          root.classList.remove("is-checking", "is-stale");
          root.classList.add("is-unavailable");
          setApiStatus(copy.signInAgain, "error");
          loginLink.hidden = false;
          loginLink.href = loginUrl;
          connection.textContent = copy.signInAgain;
        }

        function showStorageForbidden() {
          clearStorageCache();
          clearStorageView();
          root.classList.remove("is-checking", "is-stale");
          root.classList.add("is-unavailable");
          loginLink.hidden = true;
          connection.textContent = copy.notAuthorized;
          setApiStatus(copy.notAuthorized, "error");
        }

        async function accessToken() {
          const result = await supabaseClient.auth.getSession();
          const token = result?.data?.session?.access_token;
          if (!token) throw new SessionExpiredError();
          return token;
        }

        async function storageRequest(path, options) {
          const token = await accessToken();
          const headers = new Headers(options?.headers || {});
          headers.set("Authorization", "Bearer " + token);
          let response;
          try {
            response = await fetch(path, { ...options, headers, cache: "no-store" });
          } catch {
            throw new Error(copy.unavailable);
          }
          if (response.status === 401) throw new SessionExpiredError();
          if (response.status === 403) throw new StorageForbiddenError();
          if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            const error = new Error(payload?.error || copy.unavailable);
            error.status = response.status;
            throw error;
          }
          return response;
        }

        function visibleFiles() {
          const query = currentFilter.trim().toLocaleLowerCase();
          if (!query) return files;
          return files.filter(file => [
            file?.name,
            file?.ownerLabel,
            file?.ownerUsername,
            file?.ownerDisplayName,
            file?.mediaType,
            file?.contentType
          ].some(value => String(value || "").toLocaleLowerCase().includes(query)));
        }

        function renderFiles() {
          const visible = visibleFiles();
          fileList.replaceChildren();

          if (!visible.length) {
            if (files.length) {
              const noMatches = document.createElement("div");
              noMatches.className = "storage-empty storage-empty-compact";
              noMatches.textContent = copy.noMatches;
              fileList.append(noMatches);
              return;
            }

            const empty = document.createElement("div");
            empty.className = "storage-empty";

            const icon = document.createElement("div");
            icon.className = "storage-empty-icon";
            icon.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5h5l1.5 2H20v8.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7.5Z"/><path d="M4 7.5V6a2 2 0 0 1 2-2h3l1.5 2H18a2 2 0 0 1 2 2v1.5"/></svg>';

            const title = document.createElement("strong");
            title.textContent = copy.emptyTitle;

            const hint = document.createElement("span");
            hint.textContent = copy.emptyHint;

            const choose = document.createElement("button");
            choose.type = "button";
            choose.className = "storage-empty-upload";
            choose.textContent = copy.select;
            choose.addEventListener("click", () => fileInput.click());

            empty.append(icon, title, hint, choose);
            fileList.append(empty);
            return;
          }

          visible.forEach(file => {
            const row = document.createElement("div");
            row.className = "storage-file-row";
            row.setAttribute("role", "row");

            const name = document.createElement("strong");
            name.className = "storage-file-name";
            name.textContent = file.name;
            name.title = file.name;

            const owner = document.createElement("span");
            owner.className = "storage-owner-cell";
            owner.textContent = file.ownerLabel || "—";
            owner.title = file.ownerLabel || file.ownerId || "";
            owner.hidden = !isAdminView;

            const type = document.createElement("span");
            type.textContent = file.mediaType || file.contentType || "application/octet-stream";

            const size = document.createElement("span");
            size.textContent = formatBytes(file.size);

            const uploaded = document.createElement("time");
            uploaded.dateTime = file.uploadedAt || "";
            uploaded.textContent = formatDate(file.uploadedAt);

            const actions = document.createElement("div");
            actions.className = "storage-actions";

            const download = document.createElement("button");
            download.type = "button";
            download.className = "storage-action-button";
            download.textContent = copy.download;
            download.addEventListener("click", () => void downloadFile(file, download));

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "storage-action-button is-danger";
            remove.textContent = copy.remove;
            remove.addEventListener("click", () => void deleteFile(file, remove));

            actions.append(download, remove);
            row.append(name, owner, type, size, uploaded, actions);
            fileList.append(row);
          });
        }

        function renderMetrics(data, refreshedAtValue) {
          fileCount.textContent = String(Number(data.file_count) || 0) + (data.partial ? "+" : "");
          usedBytes.textContent = formatBytes(data.used_bytes);
          refreshedAt.textContent = formatRefreshTime(refreshedAtValue);
          partial = Boolean(data.partial);
          partialNotice.hidden = !partial;
          if (partial) partialNotice.textContent = copy.partial;
        }

        function applyStorageData(data, refreshedAtValue) {
          isAdminView = Boolean(data?.is_admin);
          root.classList.toggle("is-admin", isAdminView);
          if (ownerHeader) ownerHeader.hidden = !isAdminView;
          if (storageDescription) storageDescription.textContent = isAdminView ? copy.adminDescription : copy.userDescription;
          files = Array.isArray(data?.files) ? data.files : [];
          renderMetrics(data || {}, refreshedAtValue);
          renderFiles();
          hasStorageSnapshot = true;
        }

        async function refreshFiles(options) {
          const config = options || {};
          const force = Boolean(config.force);
          const silent = Boolean(config.silent);
          if (isBusy && !force) return;

          const sequence = ++refreshSequence;
          root.classList.remove("is-unavailable", "is-stale");
          loginLink.hidden = true;

          if (!silent) {
            root.classList.add("is-checking");
            refreshButton.classList.add("is-refreshing");
            refreshButton.setAttribute("aria-busy", "true");
            setBusy(true);
            setApiStatus(copy.loading, "loading");
          }

          try {
            const response = await storageRequest("/api/storage/files", { method: "GET" });
            const data = await response.json();
            if (sequence !== refreshSequence) return;

            const fingerprint = storageFingerprint(data);
            const changed = fingerprint !== storageCacheFingerprint;
            const refreshedAtValue = Date.now();

            storageCacheFingerprint = fingerprint;
            writeStorageCache(data, fingerprint, refreshedAtValue);

            if (changed || !hasStorageSnapshot || !config.preservePaint) {
              applyStorageData(data, refreshedAtValue);
            } else {
              refreshedAt.textContent = formatRefreshTime(refreshedAtValue);
            }

            root.classList.remove("is-checking", "is-unavailable", "is-stale");
            connection.textContent = copy.connected;
            setApiStatus("", "");
          } catch (error) {
            if (sequence !== refreshSequence) return;
            root.classList.remove("is-checking");

            if (error instanceof SessionExpiredError) {
              showSessionExpired();
            } else if (error instanceof StorageForbiddenError) {
              showStorageForbidden();
            } else if (silent && hasStorageSnapshot) {
              root.classList.add("is-stale");
              setApiStatus(error.message || copy.unavailable, "error");
            } else {
              clearStorageView();
              root.classList.add("is-unavailable");
              connection.textContent = copy.unavailable;
              setApiStatus(error.message || copy.unavailable, "error");
            }
          } finally {
            if (!silent) {
              refreshButton.classList.remove("is-refreshing");
              refreshButton.removeAttribute("aria-busy");
              setBusy(false);
            }
          }
        }

        async function initializeStorage() {
          try {
            const result = await supabaseClient.auth.getSession();
            const session = result?.data?.session;

            if (!session?.access_token || !session?.user?.id) {
              showSessionExpired();
              return;
            }

            currentUserId = String(session.user.id);
            const cached = readStorageCache(currentUserId);

            if (cached?.data) {
              storageCacheFingerprint = cached.fingerprint || storageFingerprint(cached.data);
              applyStorageData(cached.data, cached.refreshedAt);
              root.classList.remove("is-checking", "is-unavailable", "is-stale");
              connection.textContent = copy.connected;
              setApiStatus("", "");
              void refreshFiles({ silent: true, preservePaint: true });
              return;
            }

            root.classList.add("is-checking");
            setApiStatus(copy.loading, "loading");
            await refreshFiles({ force: true });
          } catch {
            showSessionExpired();
          }
        }

        async function uploadFiles(selected) {
          const queue = Array.from(selected || []);
          if (!queue.length || isBusy) return;

          refreshSequence += 1;
          const oversized = queue.filter(file => file.size > maximumBytes);
          const uploadQueue = queue.filter(file => file.size <= maximumBytes);

          if (!uploadQueue.length) {
            setUploadStatus(message(copy.tooLarge, { name: oversized[0]?.name || "file" }), "error");
            fileInput.value = "";
            return;
          }

          setBusy(true);
          let completed = 0;

          try {
            for (let index = 0; index < uploadQueue.length; index += 1) {
              const file = uploadQueue[index];
              setUploadStatus(message(copy.uploading, { current: index + 1, total: uploadQueue.length, name: file.name }), "loading");
              const response = await storageRequest("/api/storage/upload?name=" + encodeURIComponent(file.name), {
                method: "POST",
                headers: {
                  "Content-Type": file.type || "application/octet-stream",
                  "X-File-Size": String(file.size)
                },
                body: file
              });
              if (response.status === 201) completed += 1;
            }

            setUploadStatus(
              oversized.length
                ? message(copy.uploadCompleteWithSkipped, { count: completed, skipped: oversized.length })
                : message(copy.uploadComplete, { count: completed }),
              "success"
            );
            await refreshFiles({ force: true });
          } catch (error) {
            if (error instanceof SessionExpiredError) {
              showSessionExpired();
            } else if (error instanceof StorageForbiddenError) {
              showStorageForbidden();
            } else {
              setUploadStatus(message(copy.uploadFailed, { message: error.message || copy.unavailable }), "error");
              if (completed) await refreshFiles({ force: true });
            }
          } finally {
            fileInput.value = "";
            if (isBusy) setBusy(false);
          }
        }

        async function downloadFile(file, button) {
          button.disabled = true;
          try {
            const response = await storageRequest("/api/storage/object?id=" + encodeURIComponent(file.id), { method: "GET" });
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = objectUrl;
            anchor.download = file.name || "file";
            anchor.style.display = "none";
            document.body.append(anchor);
            anchor.click();
            anchor.remove();
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
          } catch (error) {
            if (error instanceof SessionExpiredError) showSessionExpired();
            else if (error instanceof StorageForbiddenError) showStorageForbidden();
            else setApiStatus(message(copy.downloadFailed, { message: error.message || copy.unavailable }), "error");
          } finally {
            button.disabled = false;
          }
        }

        async function deleteFile(file, button) {
          if (isBusy || !window.confirm(message(copy.deleteConfirm, { name: file.name }))) return;

          refreshSequence += 1;
          setBusy(true);
          button.disabled = true;
          setUploadStatus(message(copy.deleting, { name: file.name }), "loading");

          try {
            await storageRequest("/api/storage/object?id=" + encodeURIComponent(file.id), { method: "DELETE" });
            setUploadStatus(copy.uploadIdle, "");
            await refreshFiles({ force: true });
          } catch (error) {
            if (error instanceof SessionExpiredError) showSessionExpired();
            else if (error instanceof StorageForbiddenError) showStorageForbidden();
            else setApiStatus(message(copy.deleteFailed, { message: error.message || copy.unavailable }), "error");
          } finally {
            button.disabled = false;
            if (isBusy) setBusy(false);
          }
        }

        searchInput.addEventListener("input", () => {
          currentFilter = searchInput.value || "";
          renderFiles();
        });

        uploadButton.addEventListener("click", () => fileInput.click());
        refreshButton.addEventListener("click", () => void refreshFiles({ force: true }));
        fileInput.addEventListener("change", event => void uploadFiles(event.target.files));
        void initializeStorage();
      })();
    </script>
  `;
}
