import fs from "node:fs";

const path = "docs/STUDIO_WORKER_MODULARIZATION.md";
let text = fs.readFileSync(path, "utf8");

function replaceExact(from, to, label) {
  const count = text.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, got ${count}`);
  text = text.replace(from, to);
}

replaceExact(
  "| 3 | Frontend product-domain separation | ⏭️ Next |\n| 4 | Shared UI/runtime cleanup and final consolidation | ⛔ Blocked until Phase 3 is stable |",
  "| 3 | Frontend product-domain separation | ✅ Complete — PRs #27–#31 |\n| 4 | Shared UI/runtime cleanup and final consolidation | ⏭️ Next |",
  "phase status"
);

replaceExact("### Discovery snapshot", "### Pre-Phase 3 discovery snapshot", "Phase 3 snapshot heading");

const exitMarker = `### Exit criteria\n\n- \`ui-shell.js\` becomes primarily composition/navigation/bootstrap rather than a container for every product page;\n- \`ui-core.js\` no longer contains large product-specific client applications such as Admin code unless there is a documented reason;\n- each product domain has a clear owner/boundary;\n- bundle, route and browser smoke tests pass for every extraction slice;\n- production deployment succeeds after the final Phase 3 slice.\n`;
const completion = `${exitMarker}\n### Phase 3 completion\n\nPhase 3 was completed in five production-verified slices:\n\n- **3A / PR #27 — Profile:** moved Profile detail/account/preferences rendering and the Profile-home personalization/link/media runtime into \`ui-profile.js\`.\n- **3B / PR #28 — Settings + Storage:** moved Settings-owned rendering into \`ui-settings.js\` and private Storage rendering/runtime into \`ui-storage.js\`.\n- **3C / PR #29 — Admin:** moved Admin detail rendering and the Admin browser application into \`ui-admin.js\` while keeping \`is_admin\`, the lock, warm snapshots and shell authorization intact.\n- **3D / PR #30 — Dashboard + Information + Workspace:** moved route-owned content into \`ui-dashboard.js\`, \`ui-information.js\` and \`ui-workspace.js\` without inventing persistence for unfinished features.\n- **3E / PR #31 — Shell boundary:** moved the remaining Profile/Admin/Settings Hub and Settings fallback rendering to their owning modules, leaving \`ui-shell.js\` focused on shell composition, navigation, route dispatch, shared Hub/status primitives and session/authorization bootstrap.\n\nThe final Phase 3 slice compared every registered Studio OS route in both languages byte-for-byte and also compared representative complete \`osPage()\` HTML. Standard Studio CI, Cloudflare Preview and production validation/Studio/Auth deployment all passed.\n\nShared \`osHub*\` and \`statusContent\` primitives remain intentionally shell-owned, and the shared account/security audit runtime remains in \`ui-core.js\`. Those are now Phase 4 candidates rather than unfinished Phase 3 work.\n`;
replaceExact(exitMarker, completion, "Phase 3 completion section");

const oldNext = `## Next concrete task\n\nThe next structural PR should be the **first Phase 3 slice: Profile domain extraction**.\n\nBefore changing code, inventory all Profile-owned markup, client functions, cache keys and Supabase/storage interactions across \`ui-shell.js\`, \`ui-core.js\` and styles. Then move only the Profile-owned logic while preserving the shell/bootstrap contract.\n\nDo not combine Settings, Admin, Storage, shared theme/runtime cleanup, or visual redesign with that PR.\n`;
const newNext = `## Next concrete task\n\nThe next structural work is **Phase 4 shared-layer audit**, not another product extraction.\n\nBefore changing code, inventory the remaining genuinely shared consumers and dependency edges across \`ui-core.js\`, \`ui-shell.js\`, \`auth-pages.js\`, \`auth-handoff.js\`, \`ui-styles.js\` and the Phase 3 product modules. Identify duplication or mixed responsibilities only where there is more than one stable consumer.\n\nThe first Phase 4 PR must be chosen from that audit and remain narrow. Do not use Phase 4 as permission for a framework rewrite, visual redesign, Auth/OAuth behavior changes, or speculative abstractions. Shared helpers should move only when their stable consumers and invariants are explicit.\n`;
replaceExact(oldNext, newNext, "next task");

fs.writeFileSync(path, text);
console.log("Marked Phase 3 complete and Phase 4 next in the frozen sequencing guide.");
