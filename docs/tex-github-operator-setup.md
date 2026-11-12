# AERTEX Work: GitHub TeX builds managed by the operator

Status: feature branch only; disabled without server secrets and quota database setup.

The website cannot reuse or extract the credentials of ChatGPT's GitHub connector. The operator must configure an independent, revocable runtime GitHub credential inside Cloudflare.

## User contract

1. A signed-in AERTEX user applies for 1–30 GitHub compilation credits.
2. An allowlisted administrator approves up to 100 credits or rejects the application.
3. After approval, the user may create exactly one managed private GitHub repository.
4. Each repository name is determined by the authenticated Supabase user UUID. A user cannot choose the owner, arbitrary GitHub repository name, privileged file paths, or workflow.
5. The Create button is hidden after provisioning. An explicit repository deletion with a typed confirmation is required before that button returns. Deleting the repository does not replenish credits.
6. A selected, saved, personally owned XeLaTeX document is exported into that user's repository as main.tex. The database atomically reserves a credit and blocks concurrent dispatches.
7. A GitHub Actions build generates a PDF; a separate job writes only main.pdf to a dedicated pdf-output branch. An authenticated same-origin Worker endpoint streams that PDF for inline viewing or download.
8. The existing AERTEX local Bridge / CLI integration remains unchanged; GitHub is an additional compilation route, not an editor-wide background autosave compiler.

## Security requirements

- AERTEX_TEX_GITHUB_TOKEN: a Cloudflare Worker Secret, never a Wrangler plaintext variable, browser bundle, source commit, GitHub Actions secret, or chat message.
- AERTEX_TEX_GITHUB_OWNER: GitHub username exactly matching the runtime credential.
- AERTEX_TEX_GITHUB_ADMIN_USER_IDS: comma-separated verified Supabase Auth user UUIDs for approval privileges. Without a configured administrator, the feature is unavailable.
- SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY: existing server-side Supabase secret.
- All API operations verify the host-bound AERTEX session and active account status. Mutations require an exact-origin request.
- Quota state is stored under one user-id primary key. Database roles anon and authenticated receive no direct grants on the control table. SECURITY DEFINER quota functions are executable only by service_role.
- Repositories are private; the website does not add other users as GitHub collaborators. The GitHub operator account is the actual owner, so the service operator may still access managed repositories.
- The unprivileged compilation job has read-only permissions, no persisted checkout credentials, no uploaded secrets, shell escape disabled and a 15-minute timeout.
- The privileged publication job does not execute commands from user-managed TeX; it only copies the PDF artifact and publishes a build output commit.
- Deletion checks the recorded GitHub repository ID and requires exact typed confirmation. Uncertain API visibility must fail closed instead of silently forgetting the repository.
- Failed GitHub builds consume credits. Server-side submission failures refund credits. Charge limits, rate limits, concurrent workflow limits, and GitHub Actions activity alerts are required.

GitHub-hosted Actions are not a fully hardened untrusted-code sandbox. For a large anonymous public service use an explicitly hardened isolation layer with egress/resource restrictions; never make sensitive credentials available to the TeX compile job.

## Provisioning sequence

1. Review the GitHub feature PR and pass all isolation and existing TeX checks.
2. Apply docs/tex-github-allowance-schema.sql to the QssedA Studio Supabase project through an operator-approved privileged SQL session. The new table has RLS enabled, no direct browser grants, and atomic credit functions.
3. Create a revocable GitHub credential under a dedicated automation account if possible. For a fine-grained PAT, grant access to **All repositories** (new per-user repositories must be included after creation) and only these permissions: **Repository creation: write** (POST /user/repos), **Administration: write** (delete repo and repository identity management), **Contents: write** (source and output branch files), **Workflows: write** (creating the managed workflow file), and **Actions: write/read** (dispatch and list runs). Metadata read is implicit. The token is high impact because it can create and delete private repositories under the operator account. A GitHub App with user authorization and short-lived installation/user tokens is preferable for a long-lived public service. Do not use the ChatGPT connector credential.
4. Install AERTEX_TEX_GITHUB_TOKEN as a Worker Secret on qsseda-work, and configure AERTEX_TEX_GITHUB_OWNER and AERTEX_TEX_GITHUB_ADMIN_USER_IDS. The relevant Wrangler configuration is wrangler.work.jsonc. Do not publish tokens in source control.
5. Test via Work preview: apply, approve, create private repo, compile a small Chinese XeLaTeX file, retrieve PDF, verify a second user cannot access that repo, delete it, and ensure the new-repo control reappears only after deletion.
6. Monitor private GitHub Actions usage, rate limits, job duration, orphaned repos and cost before opening the feature to real users.


The workflow dispatch request uses `return_run_details: true` with GitHub REST API version `2026-03-10`, so the service stores the exact `workflow_run_id` against the reserved credit. The credit is released only when that exact run completes; an ambiguous dispatch leaves the reservation locked for reconciliation rather than refunding a potentially queued build.

## API contract

The following routes live under /api/tex/github/ and require the existing Work session:

| Route | Method | Purpose |
| --- | --- | --- |
| status | GET | View own approval, quota and repository state |
| apply | POST | Request credits |
| admin/requests | GET | Allowlisted administrator lists pending requests |
| admin/review | POST | Allowlisted administrator approves/rejects |
| repository | POST | Create the only private repo for the authenticated user |
| repository | DELETE | Delete the verified owned repo with typed confirmation |
| compile | POST | Reserve credit, write own saved source and dispatch Actions |
| runs | GET | Read own workflow runs and reconcile active credit |
| pdf | GET | Preview most recent GitHub PDF through the authenticated proxy |
| download | GET | Download the same PDF from GitHub via the authenticated proxy |

## Explicit phase-one limitations

- The GitHub-backed workspace currently exports one saved TeX document as main.tex. It does not yet support arbitrary multi-file uploads or editing arbitrary GitHub repository files.
- The managed workflow supports XeLaTeX only. Local Bridge and existing cloud compilation remain independent.
- GitHub Actions has queue/startup time and is not a replacement for instant live preview.
- PDF output commits persist in the repository's pdf-output branch until the repo is deleted.
- A later cleanup task should reconcile orphaned GitHub repositories after deletion of AERTEX user accounts.

The ChatGPT GitHub connector is not a valid Cloudflare runtime credential. Do not activate production or merge the feature until credentials, SQL schema, tests, billing protections and administrator approvals have been verified.
