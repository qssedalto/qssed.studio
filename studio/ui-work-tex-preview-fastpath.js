/**
 * 【初学者导读】
 * 文件：studio/ui-work-tex-preview-fastpath.js
 * 这是 AERTEX Work/TeX 前端模块（work-tex-preview-fastpath）。这组文件把编辑器、预览、协作、移动端适配或性能优化拆成多个小模块，避免一个超大文件承担全部职责。
 * 阅读顺序：先找本文件 export 的安装/初始化函数，再看它接收的 editor/state/session 参数；之后沿事件监听、缓存和 DOM 更新理解副作用。
 * 初学者重点：编辑器状态、服务器版本、协作会话和预览缓存是不同层次的数据；修改其中一层时不要假设其他层会自动同步。
 * 修改注意：协作/实时模块尤其要考虑乱序消息、重复消息、断线重连和旧版本客户端；性能优化模块不能以牺牲正确性为代价。
 * 调试方法：先区分“编辑器内容错”“预览错”“协作同步错”“移动布局错”，再进入对应模块，不要在整个 Work 链路里盲查。
 */
function replaceExact(source, needle, replacement) {
  const index = source.indexOf(needle);
  if (index < 0) return source;
  return source.slice(0, index) + replacement + source.slice(index + needle.length);
}

export function enhanceWorkTexPreviewFastPath(markup) {
  let output = String(markup || "");

  output = replaceExact(
    output,
    `          async function probeLocal() {\n            localBase = '';\n            localEngines = [];\n            for (const base of endpoints) {\n              try {\n                const health = await readJson(await loopbackFetch(base, '/health'));\n                if (health?.service !== expectedService || Number(health?.protocol) !== expectedProtocol) continue;\n                if (!Array.isArray(health?.capabilities) || !health.capabilities.includes('tex.compile')) continue;\n                const tex = await readJson(await loopbackFetch(base, '/tex/status'));\n                if (!tex?.available) continue;\n                localBase = base;\n                localEngines = Array.isArray(tex.engines) ? tex.engines.map(value => String(value).toLowerCase()) : [String(tex.engine || 'xelatex').toLowerCase()];\n                break;\n              } catch {}\n            }\n            syncCompiler();\n          }`,
    `          async function probeLocal() {\n            localBase = '';\n            localEngines = [];\n            for (const base of endpoints) {\n              try {\n                const health = await readJson(await loopbackFetch(base, '/health'));\n                if (health?.service !== expectedService || Number(health?.protocol) !== expectedProtocol) continue;\n                if (!Array.isArray(health?.capabilities) || !health.capabilities.includes('tex.compile')) continue;\n\n                // Health is enough to put the loopback compiler on the critical path.\n                // /tex/status executes the TeX binary and can take seconds, so verify it\n                // in the background instead of blocking the first preview.\n                localBase = base;\n                localEngines = ['xelatex', 'pdflatex'];\n                syncCompiler();\n\n                void loopbackFetch(base, '/tex/status')\n                  .then(response => readJson(response))\n                  .then(tex => {\n                    if (localBase !== base) return;\n                    if (!tex?.available) {\n                      localBase = '';\n                      localEngines = [];\n                    } else {\n                      localEngines = Array.isArray(tex.engines)\n                        ? tex.engines.map(value => String(value).toLowerCase())\n                        : [String(tex.engine || 'xelatex').toLowerCase()];\n                    }\n                    syncCompiler();\n                  })\n                  .catch(() => {});\n                break;\n              } catch {}\n            }\n            syncCompiler();\n          }`
  );

  // Persist from the actual successful PDF Blob instead of observing iframe.src
  // and fetching the blob URL back later. The latter loses races during quick
  // refreshes/replacements and was the reason the tab cache sometimes stayed empty.
  output = replaceExact(
    output,
    `          function installPreviewBlob(blob, snapshot, elapsed) {\n            if (snapshot !== currentPreviewSnapshot()) return false;`,
    `          function installPreviewBlob(blob, snapshot, elapsed) {\n            if (snapshot !== currentPreviewSnapshot()) return false;\n            try {\n              window.dispatchEvent(new CustomEvent('qsseda:tex-preview-blob', { detail: { blob, snapshot } }));\n            } catch {}`
  );

  // The base local-preview script can finish probing 127.0.0.1 before the
  // document request has opened the initial TeX document. In that race the
  // editor is still hidden, so the original end-of-start schedule is skipped and
  // the preview remains on "waiting for changes" forever until the user types.
  // Schedule again whenever the initial document becomes visible or the active
  // document list changes programmatically.
  output = replaceExact(
    output,
    `          const observer = new MutationObserver(() => syncCompiler());\n          observer.observe(editor, { attributes: true, attributeFilter: ['hidden'] });\n          observer.observe(compile, { attributes: true, attributeFilter: ['disabled'] });`,
    `          let loadedPreviewSnapshot = '';\n          let loadedPreviewTimer = 0;\n          function scheduleLoadedDocumentPreview(delay = 0) {\n            window.clearTimeout(loadedPreviewTimer);\n            loadedPreviewTimer = window.setTimeout(() => {\n              if (destroyed || !previewEnabled || !supportsCurrentEngine() || !hasDocument()) return;\n              const nextSnapshot = currentPreviewSnapshot();\n              if (!nextSnapshot) return;\n              if (nextSnapshot === loadedPreviewSnapshot && (previewUrl || localBusy || previewDirty)) return;\n              loadedPreviewSnapshot = nextSnapshot;\n              previewDirty = true;\n              schedulePreview(0);\n            }, delay);\n          }\n\n          const observer = new MutationObserver(() => {\n            syncCompiler();\n            if (!editor.hidden) {\n              // Let the document loader finish assigning source/title/engine before\n              // taking the snapshot used for the first compile.\n              scheduleLoadedDocumentPreview(0);\n              window.setTimeout(() => scheduleLoadedDocumentPreview(0), 60);\n            }\n          });\n          observer.observe(editor, { attributes: true, attributeFilter: ['hidden'] });\n          observer.observe(compile, { attributes: true, attributeFilter: ['disabled'] });\n\n          const loadedDocumentList = document.getElementById('tex-document-list');\n          const documentListObserver = loadedDocumentList ? new MutationObserver(() => {\n            if (!editor.hidden) scheduleLoadedDocumentPreview(20);\n          }) : null;\n          documentListObserver?.observe(loadedDocumentList, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });`
  );

  output = output.replace(
    `            observer.disconnect();\n            window.clearTimeout(previewTimer);`,
    `            observer.disconnect();\n            documentListObserver?.disconnect();\n            window.clearTimeout(loadedPreviewTimer);\n            window.clearTimeout(previewTimer);`
  );

  // Once the lightweight /health check succeeds, do not add another visible
  // half-second before the first background refresh. A restored preview remains
  // visible while this refresh runs.
  output = output.replaceAll('schedulePreview(450);', 'schedulePreview(0);');

  return output;
}
