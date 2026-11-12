import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { managedTexRepoName, MANAGED_TEX_WORKFLOW, MANAGED_TEX_WORKFLOW_PATH } from "../studio/tex-github-workflow.js";
import { enhanceTexGithubWorkbench } from "../studio/ui-tex-github.js";
import vm from "node:vm";
import { texWorkbenchContent } from "../studio/ui-tex-workbench.js";
import { enhanceTexProjectControls } from "../studio/ui-tex-project-controls.js";
import { texGithubSetupContent } from "../studio/ui-tex-github-setup.js";

const userA = "11111111-1111-4111-8111-111111111111";
const userB = "22222222-2222-4222-8222-222222222222";
const a = managedTexRepoName(userA);
const b = managedTexRepoName(userB);
assert.notEqual(a, b, "distinct users must never share a repository");
assert.equal(a, "aertex-tex-11111111111141118111111111111111");
assert.throws(() => managedTexRepoName("../../admin"), /Invalid/);
assert.throws(() => managedTexRepoName(""), /Invalid/);
assert.equal(MANAGED_TEX_WORKFLOW_PATH, ".github/workflows/aertex-compile.yml");

assert.match(MANAGED_TEX_WORKFLOW, /workflow_dispatch:/);
assert.match(MANAGED_TEX_WORKFLOW, /persist-credentials: false/);
assert.match(MANAGED_TEX_WORKFLOW, /latexmk_shell_escape: false/);
assert.match(MANAGED_TEX_WORKFLOW, /timeout-minutes: 15/);
assert.match(MANAGED_TEX_WORKFLOW, /needs: compile/);
assert.match(MANAGED_TEX_WORKFLOW, /ref: pdf-output/);

assert.match(MANAGED_TEX_WORKFLOW, /git add -- main\.pdf/);
assert(!MANAGED_TEX_WORKFLOW.includes("pull_request_target"), "no privileged PR execution");
assert(!MANAGED_TEX_WORKFLOW.includes("secrets."), "compile never receives secrets");

const html = enhanceTexGithubWorkbench('<aside class="tex-runs-panel"><section id="tex-live-preview-card"></section><div class="tex-compiler-card"></div></aside>', true);
assert(html.includes('id="tex-gh-card"'), "GitHub panel must appear");
assert(html.includes("创建我的唯一仓库"), "Chinese locale must render");
assert(html.includes('/api/tex/github/pdf'), "PDF preview must use authenticated proxy");
assert(!html.includes("__COPY_JSON__"), "injected copy placeholder must be resolved");
assert(html.includes("远程编译（不建议）"), "Work must label the optional remote compile button");
assert(html.includes("编译额度管理"), "Administrator must see a quota management link");
assert(html.indexOf('id="tex-live-preview-card"') < html.indexOf('id="tex-gh-widget"'), "Remote button belongs below PDF preview");
assert(html.indexOf('id="tex-gh-widget"') < html.indexOf('class="tex-compiler-card"'), "Remote button belongs above local Bridge card");
assert(html.includes('id="tex-gh-card" aria-label="GitHub Actions" hidden'), "Remote controls should be collapsed by default");
const en = enhanceTexGithubWorkbench('<aside class="tex-runs-panel"><div class="tex-compiler-card"></div></aside>', false);
assert(en.includes("Create my only repository") && en.includes("Remote compilation (not recommended)"), "English locale must render");

// The first-click onboarding must preserve the exact same-origin document route.
const setup = texGithubSetupContent(true, "zh-cn");
assert(setup.includes('id="tex-setup-form"') && setup.includes("每周最多使用 100 次"),
  "Onboarding must explain weekly build limits and render the application form");
assert(setup.includes('window.location') === false && setup.includes('location.assign(back)'),
  "Return must use the validated original document target");
assert(setup.includes('parsed.origin===location.origin') &&
  setup.includes('encodeURIComponent') === false &&
  setup.includes('new URL(original,location.origin)'),
  "Only same-origin verified return paths are accepted");
const workProject = enhanceTexProjectControls('<body>' + texWorkbenchContent(true) + '</body>', true);
assert(workProject.includes("新建项目") && workProject.includes("上传项目") &&
  workProject.includes("示例项目"), "Three project options must replace legacy blank template");
assert(workProject.includes('id="tex-project-dialog"') &&
  workProject.includes('id="tex-project-file"'), "Project creation and ZIP modal missing");
assert(workProject.includes('window.__aertexTexProjectOpenDialog=openDialog'),
  "Welcome card must directly open its selected project dialog");
assert(!workProject.includes('const template=templates[document.getElementById('),
  "Legacy instant-create template path should be disabled");
for (const [index,match] of [...workProject.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/g)].entries()){
  new vm.Script(match[1], {filename:"project-ui-"+index+".js"});
}
const projectBackend = fs.readFileSync(new URL("../studio/tex-project-api.js",import.meta.url),"utf8");
const weekSql = fs.readFileSync(new URL("../docs/tex-github-weekly-rollover.sql",import.meta.url),"utf8");
const weekAdminSql = fs.readFileSync(new URL("../docs/tex-github-weekly-admin.sql",import.meta.url),"utf8");
assert(projectBackend.includes('ownerName(accessToken,userId)') &&
  projectBackend.includes('profiles?select=first_name,last_name&id=eq.'),
  "Blank project author name must come from the requesting user's profile");
assert(projectBackend.includes('Asia/Shanghai') && projectBackend.includes('\\\\maketitle'),
  "Blank project must include the current date and title matter");
assert(projectBackend.includes('new DecompressionStream("deflate-raw")') &&
  projectBackend.includes('segments.some') === false && projectBackend.includes('safeName(e.name)'),
  "ZIP imports must be bounded and reject traversal paths");
assert(projectBackend.includes('SAMPLE_BIB_GZIP') && projectBackend.includes('SAMPLE_FROG_JPG'),
  "Example project needs the source bibliography and a frog image");
for (const [label,expected] of [
  ["MAIN","98adacccd32d21bba43c108784e0516cb177f30db5a4ad080cf69c9d02b114d9"],
  ["BIB","8749e6a3009dbbdc5886644c8de1eb8ad98c993cb0613ee349b7b31e83750dd1"]
]){
  const matched=projectBackend.match(new RegExp('const SAMPLE_'+label+'_GZIP="([A-Za-z0-9+/=]+)"'));
  assert(matched,"Example "+label+" compressed source missing");
  const decoded=gunzipSync(Buffer.from(matched[1],"base64"));
  assert.equal(createHash("sha256").update(decoded).digest("hex"),expected,
    "Bundled "+label+" source must match uploaded sample.zip exactly");
}
assert(weekSql.includes("quota_week_start") && weekSql.includes("weekly_used<100") &&
  weekSql.includes("is_operator") && weekSql.includes("quota_total +"),
  "Atomic weekly cap, admin exemption and carried balance must be enforced by database");
assert(weekAdminSql.includes("weekly_credits") && weekAdminSql.includes("public.is_admin()"),
  "Only verified administrators may change weekly grant policy");

const api = fs.readFileSync(new URL("../studio/tex-github-api.js", import.meta.url), "utf8");
const worker = fs.readFileSync(new URL("../worker.js", import.meta.url), "utf8");
const entry = fs.readFileSync(new URL("../studio/entry.js", import.meta.url), "utf8");
const schema = fs.readFileSync(new URL("../docs/tex-github-allowance-schema.sql", import.meta.url), "utf8");
assert(worker.includes('pathname.startsWith("/api/tex/github/")'), "GitHub API route missing");
assert(entry.includes("enhanceTexGithubWorkbench("), "GitHub UI not injected into Work");
const adminUi = fs.readFileSync(new URL("../admin/ui.js", import.meta.url), "utf8");
const adminWorker = fs.readFileSync(new URL("../admin-worker.js", import.meta.url), "utf8");
const adminApi = fs.readFileSync(new URL("../admin/tex-credits-api.js", import.meta.url), "utf8");
const adminSql = fs.readFileSync(new URL("../docs/tex-github-admin-quota-rpc.sql", import.meta.url), "utf8");
assert(adminUi.includes("直接分配额度") && adminUi.includes("texCredits()"), "Admin quota allocation page missing");
assert(adminWorker.includes('pathname === "/api/admin/tex-credits"'), "Protected quota API route missing");
assert(adminApi.includes("session.accessToken") && !adminApi.includes("getSupabaseSecret"), "Admin RPC must use administrator JWT rather than a service-role secret");
assert(adminSql.includes("if not public.is_admin()") && adminSql.includes("security definer"), "RPCs must verify database administrator role");
const adminSessionSource = fs.readFileSync(new URL("../admin/session.js", import.meta.url), "utf8");
assert(adminSessionSource.includes('/rest/v1/rpc/verify_admin_session'),
  "Admin console must use the verified live admin session");
assert(api.includes('"/rest/v1/rpc/verify_admin_session"') &&
  !api.includes('"/rest/v1/rpc/is_admin"'),
  "Work GitHub admin status must use the same authenticated RPC as Admin, not the inaccessible is_admin() RPC");
assert(api.includes("response.ok && (await response.json()) === true"),
  "Admin privileges must fail closed on denied/invalid RPC response");
assert(api.includes("verifyTexUser(session.accessToken)"), "server identity verification required");
assert(api.includes("readRow(env, userId)"), "repository access must be bound to authenticated user");
assert(api.includes('doc?.owner_id !== userId'), "shared documents cannot be compiled as own");
assert(api.includes('await reserveCredit(env, userId, nonce)'), "quota reservation must be atomic");
assert(api.includes("return_run_details: true"), "GitHub dispatch must return the exact run ID");
assert(api.includes("active_run_id: runId"), "exact run ID must be persisted");
assert(api.includes("Number(run.id) === Number(row.active_run_id)"), "quota release must match the exact run");
assert(api.includes('githubRepoPath(env, row.repo_name)'), "server-derived repository binding required");
assert(!api.includes("body.repo_name"), "client must never select a different repository");
assert(!api.includes("body.owner"), "client must never choose GitHub owner");
assert(schema.includes("user_id uuid primary key"), "one repository per user is enforced by database key");
assert(schema.includes("enable row level security"), "user allocations must enable RLS");
assert(/revoke all on public\.tex_github_allowances from PUBLIC, anon, authenticated/.test(schema), "no direct user table access");
assert(schema.includes("grant select, insert, update, delete on public.tex_github_allowances to service_role"),"server-only database access");
assert(schema.includes("and active_nonce is null"), "concurrent compilation must be serialized");
assert(schema.includes("active_run_id bigint"), "quota reservation must store exact workflow run ID");
assert(schema.includes("active_commit_sha text"), "quota reservation must store source commit SHA");
assert(schema.includes("  repo_state text not null default"), "repository state must be declared");
assert.equal((schema.match(/create or replace function public\.tex_gh_reserve_credit/g) || []).length, 1, "no duplicate quota functions");
const progressHtml = enhanceTexGithubWorkbench('<aside class="tex-runs-panel"><div class="tex-compiler-card"></div></aside>',true);
assert(progressHtml.includes('id="tex-gh-progress"'),"GitHub progress must be visible in the optional panel.");
assert(progressHtml.includes('id="tex-gh-preview-state"'),"GitHub PDF must have a non-white verified loading state.");
assert(progressHtml.includes('id="tex-gh-view-work"'),"Compact touch devices need an in-Work PDF reader.");
assert(progressHtml.includes("String.fromCharCode(...magic) !== '%PDF-'"),"PDF must be validated before preview.");
assert(progressHtml.includes("window.setInterval(poll, 5000)"),"Compile status must poll promptly.");
assert(progressHtml.includes("result.jobs || []"),"Progress must come from actual GitHub job steps.");
const progressScript = progressHtml.match(/<script id="tex-gh-runtime">([\\s\\S]*?)<\\/script>/)?.[1];
assert(progressScript, "GitHub runtime missing");
new vm.Script(progressScript,{filename:"tex-github-progress.js"});
assert(api.includes("actions/runs/") && api.includes("/jobs?per_page=10"),"GitHub backend must supply actual job statuses.");
assert(api.includes("steps: (Array.isArray(job.steps)"),"Backend must bound and normalize job step names.");
console.log("AERTEX GitHub TeX isolation, quota and panel checks passed.");
