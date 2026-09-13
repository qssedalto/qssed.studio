# Studio Phase 3D — Dashboard, Information and Workspace inventory

This inventory freezes the fourth Phase 3 extraction slice. The goal is to move simple route-owned product content out of `ui-shell.js` without inventing persistence and without using the extraction to reorganize shared UI primitives.

## Dashboard domain

Move to `ui-dashboard.js`:

- `dashboardIcon(name)`
- `dashboardContent(zh)`
- the Dashboard visit-time/date/theme browser snippet embedded in `dashboardContent`

The Dashboard module has no dependency on the shared audit/Admin runtime and can move as one source block.

## Information domain

Information routes currently rendered in the shell:

- `/info`
- `/info/knowledge`
- `/info/links`
- `/info/notes`
- `/info/summaries`
- `/info/search`

Move to `ui-information.js`:

- `linksContent(zh)`
- `notesContent(zh)`
- `summariesContent(...)`
- `searchContent(zh)`
- Information route composition for the six routes above

`/info` and `/info/knowledge`, plus `summariesContent`, use the generic `statusContent()` renderer. `statusContent()` is shared with Workspace and Settings and remains shell-owned in Phase 3D. `ui-information.js` receives it as a function argument rather than importing the shell or creating a new shared layer.

## Workspace domain

Workspace routes:

- `/workspace`
- `/workspace/workbench`
- `/workspace/projects`
- `/workspace/experiments`
- `/workspace/drafts`
- `/workspace/tasks`

Move `workspaceContent(...)` to `ui-workspace.js`.

All current Workspace pages use the shared `statusContent()` helper. Phase 3D passes that helper into the Workspace renderer; it does not move or duplicate the helper.

## Keep in `ui-shell.js`

- `osPage(...)`
- route metadata / bilingual navigation copy
- `renderOsNav(...)`
- `renderOsContent(...)` as the top-level composition/dispatch point
- `statusContent(...)`
- shared Hub primitives and Profile/Admin/Settings Hubs
- Profile/Settings/Admin route composition
- session/auth/bootstrap and compact navigation

After the extraction, `renderOsContent()` should delegate Dashboard, Information and Workspace rendering to their domain modules while retaining the existing route semantics.

## Invariants

Phase 3D must not:

- create fake data or persistence for Information/Workspace features that are not implemented;
- change route names or localized copy;
- change Dashboard UI or its live time/theme behavior;
- move shared Hub primitives;
- move `statusContent()` into a new shared module;
- change Profile, Settings, Storage or Admin behavior;
- change session/auth/bootstrap behavior;
- change Auth/OAuth/PKCE behavior;
- change styles merely to match the new source layout.

## Verification before merge

1. capture Dashboard, all six Information routes and all six Workspace routes for both Chinese and English;
2. compare every rendered route output byte-for-byte after extraction;
3. verify the Dashboard source block no longer exists in `ui-shell.js` and exists in `ui-dashboard.js`;
4. verify Information-specific renderers no longer exist in `ui-shell.js` and are owned by `ui-information.js`;
5. verify Workspace rendering no longer exists in `ui-shell.js` and is owned by `ui-workspace.js`;
6. verify `statusContent`, shared Hub primitives and the shell/session bootstrap remain in `ui-shell.js`;
7. run `node --check` for every Studio JavaScript file;
8. run Wrangler Studio dry-run bundle;
9. require standard Studio Worker Check + Cloudflare branch Preview on the final PR head;
10. require production validation + Studio + Auth deployment after merge.
