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

  // Once the lightweight /health check succeeds, do not add another visible
  // half-second before the first background refresh. A restored preview remains
  // visible while this refresh runs.
  output = output.replaceAll('schedulePreview(450);', 'schedulePreview(40);');

  return output;
}
