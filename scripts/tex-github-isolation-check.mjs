import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { managedTexRepoName, MANAGED_TEX_WORKFLOW, MANAGED_TEX_WORKFLOW_PATH } from "../studio/tex-github-workflow.js";
import { enhanceTexGithubWorkbench } from "../studio/ui-tex-github.js";
import {
  texGithubProjectRepositoryName,texGithubProjectRepositoryKey,isTexGithubManagedRepositoryName,
  readTexGithubProjectRepository,writeTexGithubProjectRepository,
  removeTexGithubProjectRepository
} from "../studio/tex-github-project-repositories.js";
import vm from "node:vm";
import { selectTexPdfRange } from "../studio/tex-github-pdf-range.js";
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
assert(html.includes("为当前项目创建仓库"), "Chinese locale must render the current project repository");
assert(html.includes('/api/tex/github/pdf'), "PDF preview must use authenticated proxy");
assert(!html.includes("__COPY_JSON__"), "injected copy placeholder must be resolved");
assert(html.includes("远程编译（不建议）"), "Work must label the optional remote compile button");
assert(html.includes("编译额度管理"), "Administrator must see a quota management link");
assert(html.includes("ack_public:true") && !html.includes("window.confirm(copy.publicConsent)") && !html.includes("publicConsent"),
  "Repository creation must not show a duplicate confirmation popup; retain the server acknowledgement");
assert(html.includes("新仓库公开") && html.includes("当前项目拥有独立 GitHub 编译仓库"),
  "Public repository notice must explain that every project has an independent repository");
assert(html.indexOf('id="tex-live-preview-card"') < html.indexOf('id="tex-gh-widget"'), "Remote button belongs below PDF preview");
assert(html.indexOf('id="tex-gh-widget"') < html.indexOf('class="tex-compiler-card"'), "Remote button belongs above local Bridge card");
assert(html.includes('id="tex-gh-card" aria-label="GitHub Actions" hidden'), "Remote controls should be collapsed by default");
const en = enhanceTexGithubWorkbench('<aside class="tex-runs-panel"><div class="tex-compiler-card"></div></aside>', false);
assert(en.includes("Create repository for this project") && en.includes("Remote compilation (not recommended)"), "English locale must render");

// The first-click onboarding must preserve the exact same-origin document route.
const setup = texGithubSetupContent(true, "zh-cn");
assert(setup.includes("生成的 PDF 和 Git 历史将公开存储"),
  "Quota application must disclose that new GitHub compilation repositories are public");
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
assert(workProject.includes("navigator.language") &&
  workProject.includes("home.href='https://work.qsseda.com/'+deviceLocale()+'/tex'") &&
  workProject.includes("'zh-hant'") && workProject.includes("'ja-jp'") &&
  workProject.includes("'ar-sa'"),
  "TeX home button must follow device language across supported localized routes.");

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
assert(projectBackend.includes('verifiedAdmin(accessToken)') &&
  projectBackend.includes('/rest/v1/rpc/verify_admin_session') &&
  projectBackend.includes('response.ok && (await response.json()) === true'),
  "Only server-verified admins may create a blank project without legal names");
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
assert(api.includes("Number(run.id)===Number(row.active_run_id)") && api.includes("binding.active_nonce===row.active_nonce"), "quota release must match the exact run and selected project reservation");
assert(api.includes('githubRepoPath(env, binding.repo_name)'), "server-derived project repository binding required");
assert(!api.includes("body.repo_name"), "client must never select a different repository");
assert(!api.includes("body.owner"), "client must never choose GitHub owner");
assert(api.includes("ownedGithubProject(request,env,userId") &&
  api.includes("readTexGithubProjectRepository(env,userId,documentId)") &&
  api.includes("writeTexGithubProjectRepository(env,userId,documentId"),
  "Repository operations must use authenticated owner plus selected project.");
assert(api.includes('action === "legacy-repository"') &&
  api.includes('return deleteLegacyGithubRepository(env,userId,body)'),
  "Legacy account-level repository must be removable only through a separate explicit action.");
assert(api.includes('const documentId=await ownedGithubProject(request,env,userId)') &&
  api.includes('const binding=await readTexGithubProjectRepository(env,userId,documentId)'),
  "Both run listing and PDF response must be scoped to a validated project.");
assert(api.includes("github_repo_delete_permission_denied") &&
  api.includes("repository_state:\"none\"") &&
  api.includes("removeTexGithubProjectRepository(env,userId,documentId)"),
  "Delete must confirm GitHub success, return cleared state and diagnose missing permissions.");
assert(html.includes('id="tex-gh-toast"') && html.includes("showToast(deleting?description") &&
  html.includes("requestGeneration++") &&
  html.includes("document_id:projectId") &&
  html.includes("legacy-repository"),
  "Third pane must reset between projects, emit deletion feedback and distinguish legacy repos.");
const projectA="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const projectB="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
assert.notEqual(texGithubProjectRepositoryName(projectA),texGithubProjectRepositoryName(projectB));
assert.notEqual(texGithubProjectRepositoryKey(userA,projectA),texGithubProjectRepositoryKey(userA,projectB));
assert.notEqual(texGithubProjectRepositoryKey(userA,projectA),texGithubProjectRepositoryKey(userB,projectA));
// Regression: readable per-project repository names were provisioned but
// then rejected by the old 32-hex-only GitHub path guard with HTTP 503.
const regularName=texGithubProjectRepositoryName(projectA,{
  title:"APMCM",username:"student-02",created_at:"2026-11-14T13:30:00.000Z"
});
const adminName=texGithubProjectRepositoryName(projectB,{
  title:"机器学习",username:"ignored",created_at:"2026-11-14T13:30:00.000Z",is_admin:true
});
for(const valid of [texGithubProjectRepositoryName(projectA),regularName,adminName]){
  assert.equal(isTexGithubManagedRepositoryName(valid),true,"Valid managed repo name: "+valid);
}
assert.match(regularName,/-20261114133000-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa$/);
assert.match(adminName,/-admin-14-11-2026-bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb$/);
for(const invalid of [
  "", "unrelated-repository", "../aertex-tex-"+projectA, "aertex-tex-foo/"+projectA,
  "aertex-tex-foo-"+projectA, "aertex-tex-foo-20261114133000-not-a-uuid",
  "aertex-tex-"+("x".repeat(150))+"-20261114133000-"+projectA,
  "https://github.com/attacker/repository"
]){
  assert.equal(isTexGithubManagedRepositoryName(invalid),false,
    "Unsafe or unrelated repository name: "+invalid);
}
assert(api.includes("isTexGithubManagedRepositoryName(repoName)"),
  "GitHub operations must use the shared managed repository name validator");
const pathStart=api.indexOf("function githubRepoPath(env, repoName) {");
const pathEnd=api.indexOf("// Bind every operation",pathStart);
assert(pathStart>0&&pathEnd>pathStart,"Repository path guard must be present");
const pathBuilder=new Function("configured","httpError","isTexGithubManagedRepositoryName",
  api.slice(pathStart,pathEnd)+"\nreturn githubRepoPath;")(
    ()=>true,(status,code)=>Object.assign(new Error(code),{status,code}),isTexGithubManagedRepositoryName
  );
const operator={AERTEX_TEX_GITHUB_OWNER:"qssedalto"};
assert.equal(pathBuilder(operator,regularName),"/repos/qssedalto/"+regularName);
assert.equal(pathBuilder(operator,adminName),"/repos/qssedalto/"+adminName);
assert.equal(pathBuilder(operator,texGithubProjectRepositoryName(projectA)),
  "/repos/qssedalto/"+texGithubProjectRepositoryName(projectA));
assert.throws(()=>pathBuilder(operator,"../malicious"),/invalid_managed_repository_name/);
const records=new Map();
const fakeR2={
  get:async key=>{
    const raw=records.get(key);
    return raw===undefined?null:{json:async()=>JSON.parse(raw)};
  },
  put:async (key,value)=>records.set(key,value),
  delete:async key=>records.delete(key)
};
const fakeEnv={STORAGE:fakeR2};
await writeTexGithubProjectRepository(fakeEnv,userA,projectA,{repo_state:"ready",repo_id:1234});
await writeTexGithubProjectRepository(fakeEnv,userA,projectB,{repo_state:"ready",repo_id:5678});
assert.equal((await readTexGithubProjectRepository(fakeEnv,userA,projectA)).repo_id,1234);
assert.equal((await readTexGithubProjectRepository(fakeEnv,userA,projectB)).repo_id,5678);
assert.equal(await readTexGithubProjectRepository(fakeEnv,userB,projectA),null);
await removeTexGithubProjectRepository(fakeEnv,userA,projectA);
assert.equal(await readTexGithubProjectRepository(fakeEnv,userA,projectA),null);
assert.equal((await readTexGithubProjectRepository(fakeEnv,userA,projectB)).repo_id,5678,
  "Deleting one project's binding must not delete another project's repository.");

// Regression: an account-wide active_nonce can belong to a different Work
// project, and an old GitHub DELETE could succeed before SQL cleanup failed.
assert(!api.includes('if(row.active_nonce)return fail(409,"Wait for the account'), 
  "A stale or unrelated compilation reservation must not permanently lock legacy deletion");
assert(api.includes('binding.active_nonce===row.active_nonce') ||
       api.includes('latestRow.active_nonce===binding.active_nonce'),
  "Project deletion may release quota only when the nonce belongs to that project");
assert(api.includes('legacyDeleteReceiptKey(userId)') &&
       api.includes('await writeLegacyDeleteReceipt(env,userId,row)') &&
       api.includes('if(!alreadyDeleted)') &&
       api.includes('const alreadyDeleted=receipt?.confirmed===true'),
  "After a confirmed remote delete, retry must finish local cleanup without a second GitHub DELETE");
assert(api.includes('delete_confirmed:true') &&
       api.includes('if(!binding.delete_confirmed)') &&
       api.includes('cleanup_pending:true'),
  "Project repository deletion must survive an R2 cleanup outage with a verified receipt");
assert(html.includes('copy.deleteMismatch') && html.includes('copy.deleteCancelled') &&
       html.includes('copy.cleanupPending') && html.includes('existingForCleanup'),
  "Deleting, canceling and retrying repositories must have visible feedback even without quota approval");

assert(schema.includes("user_id uuid primary key"), "one quota allocation per user must remain independent of project repositories");
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
assert(progressHtml.includes("container-type:inline-size") &&
  progressHtml.includes("height:clamp(760px,calc(141.4cqw + 64px),1680px)") &&
  !progressHtml.includes("height:330px"),
  "The GitHub PDF iframe must be approximately one A4 page tall, responsive to its preview width.");
assert(progressHtml.includes('id="tex-gh-view-work"'),"Compact touch devices need an in-Work PDF reader.");
assert(progressHtml.includes("String.fromCharCode(...magic) !== '%PDF-'"),"PDF must be validated before preview.");
assert(progressHtml.includes("window.setInterval(poll, 5000)"),"Compile status must poll promptly.");
assert(progressHtml.includes("result.jobs || []"),"Progress must come from actual GitHub job steps.");
const progressScript = progressHtml.split('<script id="tex-gh-runtime">')[1]?.split('</script>')[0];
assert(progressScript, "GitHub runtime missing");
new vm.Script(progressScript,{filename:"tex-github-progress.js"});
assert(api.includes("actions/runs/") && api.includes("/jobs?per_page=10"),"GitHub backend must supply actual job statuses.");
assert(api.includes("steps: (Array.isArray(job.steps)"),"Backend must bound and normalize job step names.");
// Safari PDFKit uses authenticated inline HTTP byte-range requests.
const pdfBytes=Uint8Array.from({length:40},(_,i)=>i);
const full=selectTexPdfRange(pdfBytes,null);
assert.equal(full.status,200);assert.equal(full.body.byteLength,40);
const head=selectTexPdfRange(pdfBytes,"bytes=0-4");
assert.equal(head.status,206);assert.equal(head.contentRange,"bytes 0-4/40");
assert.deepEqual([...head.body],[0,1,2,3,4]);
const suffix=selectTexPdfRange(pdfBytes,"bytes=-5");
assert.equal(suffix.status,206);assert.deepEqual([...suffix.body],[35,36,37,38,39]);
const tail=selectTexPdfRange(pdfBytes,"bytes=38-");
assert.equal(tail.status,206);assert.deepEqual([...tail.body],[38,39]);
for (const invalid of ["bytes=40-50","bytes=6-2","bytes=-0","bytes=0-1,3-4","bytes=oops"]) {
  const broken=selectTexPdfRange(pdfBytes,invalid);
  assert.equal(broken.status,416,invalid);
  assert.equal(broken.contentRange,"bytes */40");
}
assert(api.includes('request.headers.get("range")') &&
  api.includes('"accept-ranges": "bytes"') &&
  api.includes('request.method === "HEAD"'),
  "Authenticated GitHub PDF proxy must support Safari Range/HEAD semantics.");
console.log("AERTEX GitHub TeX isolation, quota and panel checks passed.");
