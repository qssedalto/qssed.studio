# AERTEX Work: GitHub TeX builds managed by the operator

Status: staged behind server-side feature credentials. Neither GitHub repository creation nor compilation is enabled without the required secrets. A dedicated admin console is available at /{locale}/tex-credits on admin.qsseda.com.

The website cannot reuse or extract the credentials of ChatGPT's GitHub connector. The operator must configure an independent, revocable runtime GitHub credential inside Cloudflare.

## User contract

1. A signed-in AERTEX user opens the dedicated localized `/tex/setup` page. It explains the weekly cap, carryover, GitHub Actions costs, and public, operator-owned compilation repositories; only after acknowledging the publication policy can the user request 10, 25, 50, or 100 credits per week.
2. A verified active AERTEX administrator can grant 1–100 credits per week or reject an application in the dedicated admin control-plane page. Approved users receive that grant every Monday 00:00 Asia/Shanghai; unused credits accumulate, but no more than 100 builds may be dispatched in any single week. Administrators are unlimited, never charged, and never need to apply. An independent server-side administrator UUID allowlist is still required before enabling GitHub dispatch.
3. After approval, the user may create exactly one public managed GitHub compilation repository after explicit confirmation. Historical private repositories are not automatically published.
4. Each repository name is determined by the authenticated Supabase user UUID. A user cannot choose the owner, arbitrary GitHub repository name, privileged file paths, or workflow.
5. The Create button is hidden after provisioning. An explicit repository deletion with a typed confirmation is required before that button returns. Deleting the repository does not replenish credits.
6. A selected, saved, personally owned XeLaTeX project is exported to that user's repository, including `main.tex` plus its bounded `.bib`, `.tex`, `.sty`, `.cls`, `.bst`, `.txt`, `.jpg`, `.png` and `.pdf` assets. The database atomically reserves a weekly credit for nonadmins, skips admin deductions, and blocks concurrent dispatches. A nonadmin is limited to 100 submitted builds per China-standard-time week regardless of accumulated balance.
7. A GitHub Actions build generates a PDF; a separate job writes only main.pdf to a dedicated pdf-output branch. An authenticated same-origin Worker endpoint streams that PDF for inline viewing or download.
8. The existing AERTEX local Bridge / CLI integration remains unchanged; GitHub is an additional compilation route, not an editor-wide background autosave compiler.

## Security requirements

- AERTEX_TEX_GITHUB_TOKEN: a Cloudflare Worker Secret, never a Wrangler plaintext variable, browser bundle, source commit, GitHub Actions secret, or chat message.
- AERTEX_TEX_GITHUB_OWNER: GitHub username exactly matching the runtime credential.
- AERTEX_TEX_GITHUB_ADMIN_USER_IDS: comma-separated verified Supabase Auth user UUIDs for approval privileges. Without a configured administrator, the feature is unavailable.
- SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY: required **only for the Work GitHub compilation backend**, never exposed to the client. The isolated admin quota console uses verified administrator JWT with narrowly scoped security-definer RPC functions, not an admin-side service key.
- All API operations verify the host-bound AERTEX session and active account status. Mutations require an exact-origin request.
- Quota state is stored under one user-id primary key. Database roles anon and authenticated receive no direct grants on the control table. SECURITY DEFINER quota functions are executable only by service_role.
- New repositories are PUBLIC. All Git branches, TeX source, images, references, compiled PDFs and Git history are exposed to everyone. Old private repositories remain private until a separately reviewed, explicit migration; the GitHub operator account is the actual owner.
- The unprivileged compilation job has read-only permissions, no persisted checkout credentials, no uploaded secrets, shell escape disabled and a 15-minute timeout.
- The privileged publication job does not execute commands from user-managed TeX; it only copies the PDF artifact and publishes a build output commit.
- Deletion checks the recorded GitHub repository ID and requires exact typed confirmation. Uncertain API visibility must fail closed instead of silently forgetting the repository.
- Failed GitHub builds consume credits for nonadmins. Server-side submission failures refund nonadmin credits. Admin runs are never metered. Charge limits, rate limits, concurrent workflow limits, and GitHub Actions activity alerts are required.

GitHub-hosted Actions are not a fully hardened untrusted-code sandbox. For a large anonymous public service use an explicitly hardened isolation layer with egress/resource restrictions; never make sensitive credentials available to the TeX compile job.

## Provisioning sequence

1. Review the GitHub feature PR and pass all isolation and existing TeX checks.
2. Apply `docs/tex-github-allowance-schema.sql` and `docs/tex-github-admin-quota-rpc.sql` to a fresh Supabase project. Then apply `docs/tex-github-weekly-rollover.sql`, `docs/tex-github-weekly-admin.sql`, and `docs/tex-github-weekly-refund-boundary.sql` to enable the weekly ledger, carryover, admin bypass, weekly grants, and correct refunds for jobs crossing a Monday boundary. These four migrations already exist on production QssedA Studio Supabase; do not reapply blindly. RLS and server-only grants are enforced. The control table has RLS enabled, no direct browser grants, and atomic credit functions.
3. Create a revocable GitHub credential under a dedicated automation account if possible. For a fine-grained PAT, grant access to **All repositories** (new per-user repositories must be included after creation) and only these permissions: **Repository creation: write** (POST /user/repos), **Administration: write** (delete repo, operator-approved public visibility migration and repository identity management), **Contents: write** (source and output branch files), **Workflows: write** (creating the managed workflow file), and **Actions: write/read** (dispatch and list runs). Metadata read is implicit. The token is high impact because it can create and delete repositories under the operator account and publish private repositories after an explicit migration. A GitHub App with user authorization and short-lived installation/user tokens is preferable for a long-lived public service. Do not use the ChatGPT connector credential.
4. Install AERTEX_TEX_GITHUB_TOKEN as a Worker Secret on qsseda-work, and configure AERTEX_TEX_GITHUB_OWNER and AERTEX_TEX_GITHUB_ADMIN_USER_IDS. The admin page uses an independent verified administrator session plus the restricted admin_* quota RPCs and does not require any server-side service-role key on the admin Worker. The relevant Wrangler configuration is wrangler.work.jsonc. Do not publish tokens in source control.
5. Test via Work preview: apply, approve, create a public repo with informed user acknowledgement, compile a small Chinese XeLaTeX file, retrieve PDF, verify public read access but that a second user cannot mutate the managed repo via the Work API, delete it, and ensure the new-repo control reappears only after deletion.

For the existing Work Worker, configure secrets interactively from the repository root (Wrangler prompts for each value; never put the token in shell history or commit it):

```sh
npx wrangler secret put AERTEX_TEX_GITHUB_TOKEN --config wrangler.work.jsonc
npx wrangler secret put AERTEX_TEX_GITHUB_OWNER --config wrangler.work.jsonc
npx wrangler secret put AERTEX_TEX_GITHUB_ADMIN_USER_IDS --config wrangler.work.jsonc
```

The owner value is the GitHub login for the credential. The administrator value is a comma-separated list of verified Supabase Auth user UUIDs. Verify the secret names are present using `wrangler secret list --config wrangler.work.jsonc`; this lists names, not values. Configure GitHub Actions spending/budget alerts before enabling any user quota. Do not deploy the Work Worker solely to set these secrets; add them after the reviewed code is ready for a controlled preview.
6. Monitor GitHub Actions usage, rate limits, job duration, orphaned repos and cost before opening the feature to real users.


The workflow dispatch request uses `return_run_details: true` with GitHub REST API version `2026-03-10`, so the service stores the exact `workflow_run_id` against the reserved credit. The credit is released only when that exact run completes; an ambiguous dispatch leaves the reservation locked for reconciliation rather than refunding a potentially queued build.

## API contract

The following routes live under /api/tex/github/ and require the existing Work session:

| Route | Method | Purpose |
| --- | --- | --- |
| status | GET | View own approval, quota and repository state |
| apply | POST | Request credits |
| admin/requests | GET | Allowlisted administrator lists pending requests |
| admin/review | POST | Allowlisted administrator approves/rejects |
| repository | POST | Create the only public repo for the authenticated user with explicit publication consent |
| repository | DELETE | Delete the verified owned repo with typed confirmation |
| compile | POST | Reserve credit, write own saved source and dispatch Actions |
| runs | GET | Read own workflow runs and reconcile active credit |
| pdf | GET | Preview most recent GitHub PDF through the authenticated proxy |
| download | GET | Download the same PDF from GitHub via the authenticated proxy |


## Visibility migration and multiple projects

- **New repositories:** public only, with a required `ack_public: true` from the signed-in user after an explicit publication warning. Public visibility makes files and historical commits readable and forkable by anyone, including images, bibliographies and PDF outputs. It does not remove the existing AERTEX approval / weekly quota.
- **Existing repositories:** do not publish them automatically on session refresh, compile, or the retry/recovery path; old user agreements promised private repositories. Before migration review user notice/consent and all historical content, since changing back to private cannot revoke public clones.
- The one-time migration script `scripts/tex-github-publish-managed-repos.mjs` defaults to **dry-run**. Run only with a separately provisioned operator token in `GITHUB_TOKEN`, an explicit `AERTEX_TEX_GITHUB_OWNER` and after an affected-user visibility review. Its write mode requires `--execute --ack-public-history`. It only acts on exact names matching `aertex-tex-[0-9a-f]{32}` owned by the designated operator; unrelated private repos must never be touched. A chatbot GitHub connector cannot change repo administration visibility.
- **Multiple projects:** one GitHub repository per AERTEX account; each saved document compiles on an isolated `tex-project-<documentUUIDwithoutDashes>` branch. The service writes only the selected project's sanitized compilation dependencies and the pinned workflow to that branch. Project A's source remains available when project B is compiled. The `pdf-output` branch currently contains the **most recently compiled** `main.pdf`, not a permanent PDF per project; the Work project remains the durable source of truth.
- **Billing:** standard GitHub-hosted runners in public repositories do not consume paid Actions compute allowances; larger runners and some storage costs can still apply. However, GitHub's Actions additional terms prohibit using hosted runners for general-purpose computing unrelated to the associated software project, as well as certain service offerings. A public-facing arbitrary-document compilation service must be reviewed for acceptable use before broad deployment. Visibility is not an unrestricted free-compute entitlement.

## Explicit phase-one limitations

- New projects can be blank (personalized `main.tex` from the user's registered first/last name), an example with 3 bundled files, or a ZIP import (3 MB compressed / 4 MB decompressed / at most 24 additional allowlisted files). GitHub builds upload the saved project files before the main.tex dispatch. Additional files are listed and can be downloaded; in-browser editing of extra files is not yet implemented.
- The setup route `/{locale}/tex/setup?return=...` validates the return path against same-origin Work URLs, including exact `/{locale}/d/{uuid}` deep links; it must never return to an unrelated host or the welcome route when an explicit valid document path was supplied.
- The managed workflow supports XeLaTeX only. Local Bridge and existing cloud compilation remain independent.
- GitHub Actions has queue/startup time and is not a replacement for instant live preview.
- PDF output commits persist in the repository's pdf-output branch until the repo is deleted.
- A later cleanup task should reconcile orphaned GitHub repositories after deletion of AERTEX user accounts.

The ChatGPT GitHub connector is not a valid Cloudflare runtime credential. Do not activate production or merge the feature until credentials, SQL schema, tests, billing protections and administrator approvals have been verified.

## Preproduction test checklist

- Use a standard account and verified admin account with separate sessions. Confirm ordinary users cannot view or modify the admin quota ledger.
- Apply 100 credits per week, approve the request, and verify the Work page returns to the **exact** original deep link after application, preserving `/zh-cn/d/<uuid>`.
- Advance the Beijing calendar week in a sandbox/test transaction. Unspent credit balances should carry; weekly counted dispatches must never exceed 100. Admin builds must never deduct credits.
- Import the supplied example ZIP and verify all three files are preserved in R2. Exercise invalid ZIP paths, oversized files, unrelated project ownership, and failed compilation refunds.
- Verify a new approved user's repo is public, legacy private repos are not silently migrated, no cross-account authenticated API operations succeed, and Actions never receives the Cloudflare GitHub secret.
