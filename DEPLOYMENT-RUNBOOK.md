# AppKitX Deployment Provenance and Rollback Runbook

Operational runbook for the production Worker `appkitx-platform` serving
`https://appkitx.com/`. The architecture and CSP build pipeline are documented
in [README.md](./README.md); this document covers deployment provenance,
attestation, rollback, and post-deployment verification.

This runbook does not authorize a deployment or rollback. A rollback changes
production traffic and requires an authorized operator, an incident reason, and
the confirmations below.

## Deployment ownership and model

- The repository is `faiz1920/appkitx-platform`; production source is `main`.
- Cloudflare Workers Builds produced Versions 24–26. It is configured outside
  this repository. An authenticated audit on 2026-10-30 found no current Builds
  trigger or build records, so current Git-trigger behaviour must be rechecked
  before assuming a future merge deploys automatically.
- When connected, a push to the production branch runs the build command,
  followed by the deploy command. Workers Builds uses the default
  `npx wrangler deploy` unless the external trigger has been customised; confirm
  the current trigger settings in
  **Workers & Pages → appkitx-platform → Settings → Build**.
- `wrangler.jsonc` is the deployment contract. The Worker name is
  `appkitx-platform` and the static output is `dist/`.
- The repository has no deployment workflow, deploy script, Cloudflare API
  token, or runtime secret. Do not add a second deployment pipeline.
- `https://appkitx.com` is canonical. `https://www.appkitx.com` redirects to the
  apex through Cloudflare configuration managed outside this repository.
- Production uses a **report-only** CSP. Deployment work must not enable an
  enforcing policy or alter the CSP, HSTS, RUM, cache, SEO, or routing
  configuration.

## Separate provenance claims

Do not collapse these into a single claim:

| Claim                                     | Evidence                                                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Source commit built successfully          | GitHub Workers Builds check run with matching `head_sha`, successful conclusion, Build ID, and Version ID    |
| Worker version created                    | Cloudflare build/version record containing the Version ID                                                    |
| Worker version deployed                   | Cloudflare deployment record showing that version at the intended traffic percentage                         |
| Worker version currently active           | The first/current item from Cloudflare's Worker deployments API, with matching Version ID and active traffic |
| Production content matches a source build | Response HTML/asset comparison with a clean build of the claimed commit                                      |

A successful build does not prove that its version is active. Matching content
alone does not prove an exact active Version ID because an out-of-band deployment
could create another version with identical content.

Artifact identifiers have different scopes:

- A Worker script ETag identifies the Worker code artifact, not the static asset
  bundle or source commit.
- Hashed static asset filenames and ETags identify individual asset bytes, but
  require a clean source build comparison to associate them with a commit.
- CSP hashes cover only the listed executable inline scripts. They do not cover
  external JavaScript, CSS, HTML, or the Worker script, and can remain identical
  while the application asset bundle changes.

Only the check-run/build/version chain plus the authoritative deployment record
can tie a source commit to the active production version.

## Required evidence for every production deployment

Record all of the following in the private deployment record:

1. Repository, production branch, and full source commit SHA.
2. Pull request and merge commit when applicable.
3. Cloudflare Build ID, Worker Version ID, build completion timestamp, build
   URL, GitHub check-run ID/URL, and an exported copy of the check-run payload.
4. The active deployment observation: deployment ID, Version ID, traffic
   percentage, observation timestamp, and the API/dashboard source used.
5. Optional deterministic local artifact-manifest digest and the command/tool
   used to compute it.
6. Post-deployment smoke-test result with operator and timestamp.
7. Rollback target Version ID, its source commit/build mapping, and whether the
   target is verified as retained and deployable.
8. Any deviation, manual action, failed check, or evidence gap.

Cloudflare documents Workers Builds build/log retention for 90 days. Separately,
after a Builds connection is removed, the Builds API may no longer expose the
historical records; the 2026-10-30 audit observed that state. Versions and
deployments are not removed when a build log expires, but rollback is limited to
the **100 most recently published versions**. The historical GitHub check run is
independent of the Cloudflare Builds connection and may outlive it. Export the
check-run payload and any build logs that must be retained before either becomes
unavailable.

## Collecting provenance evidence

### 1. Confirm source and merge state

```bash
git fetch origin
git rev-parse origin/main
git status --porcelain
git merge-base --is-ancestor <source-sha> origin/main
git show -s --format='commit=%H%ntree=%T%ncommitter=%cI%nsubject=%s' <source-sha>
gh api repos/faiz1920/appkitx-platform/pulls/<pr-number> \
  --jq '{number,state,merged_at,merge_commit_sha,head_sha:.head.sha,base_sha:.base.sha}'
```

The working tree must be clean before computing a local artifact digest.

### 2. Find the Workers Builds record

```bash
gh api "repos/faiz1920/appkitx-platform/commits/<source-sha>/check-runs" \
  --jq '.check_runs[] | select(.app.slug == "cloudflare-workers-and-pages") |
    {id,name,head_sha,status,conclusion,started_at,completed_at,
     details_url,summary:.output.summary}'
```

Record the Build ID and Version ID from the successful check run. The check run's
dashboard link is the private build record. It proves a successful build and
version creation, not current activation.

### 3. Verify the active deployment

Use an authenticated operator session or a read-only API token. A Workers
**Content Read-Only** role scoped to `appkitx-platform` is sufficient for
inspection and cannot deploy or roll back.

```bash
export CLOUDFLARE_ACCOUNT_ID="<account-id>"
export CLOUDFLARE_API_TOKEN="<read-only-token>"

npx wrangler deployments status --name appkitx-platform --json
npx wrangler deployments list --name appkitx-platform --json
npx wrangler versions view "<version-id>" --name appkitx-platform --json
```

Equivalent read-only API request, where the first deployment is the latest
deployment actively serving traffic:

```bash
curl -sS \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/scripts/appkitx-platform/deployments" \
  | jq '.result.deployments[0]'
```

Confirm the Version ID, traffic percentage (100% for this Worker unless a
gradual deployment was deliberately created), and observation timestamp.
Do not store tokens in the repository or in an attestation.

### 4. Map a Version ID back to its build

The Builds API requires a **user-scoped** API token with the relevant Workers
Builds permission; account-scoped tokens are not supported by that API. A token
with `Workers CI Read` is sufficient for read-only build queries.

```bash
curl -sS \
  -H "Authorization: Bearer $CLOUDFLARE_BUILDS_READ_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/builds/builds?version_ids=<version-id>" \
  | jq '.result.builds'
```

Record the build UUID, branch, commit hash, and Version ID. If the API is not
available, copy the equivalent Build ID, Version ID, and source SHA from the
Cloudflare build detail page and GitHub check run.

A missing current Builds configuration or empty Builds API result does not erase
a historical build. The GitHub check run records the Cloudflare Build ID in
`external_id`, the Worker Version ID in its summary, and the source association
through its `head_sha` and check-suite `before`/`after` values. Export that
metadata and use the Cloudflare audit log to establish when a former build
connection was removed.

### 5. Optional artifact-manifest digest

The Cloudflare Version ID is the authoritative deployed-artifact identity. A
local manifest digest is supplementary correlation and must be labeled as a
local reproduction, not as a digest extracted from Cloudflare.

From the exact clean source commit:

```bash
git status --porcelain   # must produce no output
npm ci
npm run build

# macOS
(
  cd dist
  find . -type f -print0 | LC_ALL=C sort -z | xargs -0 shasum -a 256
) | shasum -a 256

# Linux
(
  cd dist
  find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum
) | sha256sum
```

Record the algorithm and tool used. Never reuse a digest from another commit or
from a dirty working tree.

### 6. Run the post-deployment checklist

Run the checklist in [Post-deployment and post-rollback verification](#post-deployment-and-post-rollback-verification)
and record the operator, UTC timestamp, and result.

## Private deployment-attestation template

Store the completed JSON in the private deployment log or a retained build
artifact. Do not commit completed attestations to this public repository and do
not expose them through a site endpoint. Do not add a field value unless it was
observed; use `null` for an unverified field.

```json
{
  "schema_version": 1,
  "recorded_at": "<UTC timestamp>",
  "recorded_by": "<operator>",
  "repository": "faiz1920/appkitx-platform",
  "branch": "main",
  "source": {
    "commit": "<full git sha>",
    "tree": "<full git tree sha>",
    "pull_request": null,
    "merge_commit": null
  },
  "cloudflare": {
    "account_id": "<account id>",
    "worker": "appkitx-platform",
    "build_id": "<build uuid>",
    "version_id": "<worker version uuid>",
    "build_completed_at": "<UTC timestamp>",
    "build_url": "<private dashboard URL>",
    "github_check_run_id": null,
    "github_check_run_url": null,
    "check_run_payload_exported": false
  },
  "activation": {
    "verified": false,
    "method": "cloudflare-deployments-api",
    "active_version_id": null,
    "deployment_created_at": null,
    "traffic_percentage": null,
    "verified_at": null
  },
  "artifact": {
    "manifest_algorithm": "sha256",
    "tool": "<shasum or sha256sum version>",
    "manifest_sha256": null,
    "generated_at": null,
    "clean_source_commit": false
  },
  "smoke": {
    "result": "not-run",
    "checked_at": null,
    "operator": null,
    "notes": null
  },
  "rollback_target": {
    "version_id": "<worker version uuid>",
    "source_commit": "<full git sha>",
    "build_id": "<build uuid or null>",
    "retained_verified": false,
    "verified_at": null
  }
}
```

For a rollback, append the incident reference, Version ID before and after,
rollback timestamp, rollback command or dashboard action, post-rollback smoke
result, and whether the newer version was restored.

## Rollback readiness

### Supported mechanism

Cloudflare supports rollback from the dashboard and with Wrangler:

- **Dashboard:** Workers & Pages → `appkitx-platform` → Deployments → menu on the
  target version → Rollback.
- **CLI:** `wrangler rollback <VERSION_ID> --name appkitx-platform ...`

A rollback creates a **new deployment** of the selected existing version and
routes 100% of traffic to it. It does not rewrite the selected version. Workers
Builds normally deploys a single version at 100%, but the current traffic split
must be observed rather than assumed; if a split deployment exists, rollback
replaces it with the target at 100%.

Wrangler 4.151.2 in this repository exposes `wrangler deployments status`,
`wrangler deployments list`, `wrangler versions view`, and
`wrangler rollback [version-id]`. Cloudflare limits rollback to the 100 most
recently published versions. No storage bindings exist in `wrangler.jsonc`
beyond the `ASSETS` binding, so the documented KV/R2/queue/Durable Object
rollback blockers do not currently apply. Recheck this if bindings are added.

### Prerequisites

1. An authorized operator with at least Workers **Editor** permission for
   `appkitx-platform`. The minimum role for `wrangler rollback` is Editor for
   that Worker; route/custom-domain changes require additional zone permission
   and are not part of a normal rollback.
2. A confirmed incident/release reason and decision to roll back.
3. The current active Version ID observed from Cloudflare, not inferred from
   content.
4. The target Version ID verified with `wrangler versions view` and confirmed to
   be among the 100 recently published versions.
5. The target mapped to its source commit/build and previously recorded smoke
   evidence, where available.
6. Confirmation that no incompatible binding or data migration change occurred.
7. The current Version ID recorded as the roll-forward target.
8. A private place to record the before/after deployment evidence.

### Current audit snapshot (2026-10-30, reconciled)

This snapshot must be refreshed before any rollback:

| Field                                     | Evidence                                                                                             |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `origin/main`                             | `7e19681be8a74a4d2aeecf473d832aacd10fa24f`                                                           |
| Merge reference                           | PR #31, merged 2026-10-30T05:32:58Z                                                                  |
| Latest repository-linked production build | `819eb256-8c53-473b-a5a0-f76e184bce38`                                                               |
| Source for that build                     | `7e19681be8a74a4d2aeecf473d832aacd10fa24f`                                                           |
| Worker Version ID from that build         | `7074ff1f-10d1-4141-9768-9de8b5080d3b`                                                               |
| Build completed                           | 2026-10-30T05:33:55Z                                                                                 |
| Active deployment                         | `a9329c4b-51e1-4ee9-900f-a75293306a4a`, Version `7074ff1f…`, 100% traffic                            |
| Deployment created                        | 2026-10-30T05:33:50.910047Z                                                                          |
| Current Builds trigger/records            | No trigger or build records visible in the authenticated API at reconciliation time                  |
| Previous production version               | `faf8f318-d9f9-4542-a814-818fe14f85b2` from `f664fd6…`, PR #30                                       |
| Older fallback version                    | `66e82b32-786e-4f3e-a41d-fe54d5e9fe67` from `c16a69e…`, completed 2026-10-22T22:22:27Z               |
| Rollback target                           | Preferred: `faf8f318…`; retention/deployability **unverified**; fallback `66e82b32…` also unverified |

All 21 generated HTML pages and all eight hashed CSS/JS assets referenced directly
by that HTML matched a clean local build of `7e19681` byte-for-byte after
removing Cloudflare's RUM injection. The current active deployment is verified by
the Cloudflare deployments API. The historical GitHub check run also maps
`7e19681` to Build `819eb256…` and Version `7074ff1f…`.

The previous production Version `faf8f318…` was verified during the earlier
production content audit and has a passing cross-browser production smoke record.
It is the preferred rollback candidate if Version 26 must be reverted; Version
`66e82b32…` remains an older fallback.

### Procedure — Dashboard

1. Sign in to the Cloudflare account that owns `appkitx-platform`.
2. Open **Workers & Pages → appkitx-platform → Deployments**.
3. Observe and record the current active version/traffic and timestamp.
4. Open the version history and locate the intended target by Version ID and
   source commit. Confirm it is available for rollback.
5. Open the target version's menu and select **Rollback**.
6. Enter the incident/release reason requested by the UI and confirm.
7. Verify the new active deployment reports the target Version ID at 100%.
8. Run the post-rollback verification checklist and record the results.

### Procedure — Wrangler

Use an explicit Version ID. Do not rely on the no-argument default in a production
incident; it selects the previously uploaded version and may not be the intended
known-good target.

```bash
export CLOUDFLARE_ACCOUNT_ID="<account-id>"
export CLOUDFLARE_API_TOKEN="<editor-token>"

npx wrangler versions view "<target-version-id>" --name appkitx-platform --json
npx wrangler deployments status --name appkitx-platform --json

npx wrangler rollback "<target-version-id>" \
  --name appkitx-platform \
  --message "rollback: <incident-or-release-reference> to <target-version-id>" \
  --yes

npx wrangler deployments status --name appkitx-platform --json
```

If `versions view` fails, the target is not available or permissions are
insufficient. Stop and investigate; do not choose an unverified fallback.

If rollback fails, capture the exact error and verify the currently active
deployment before retrying. Do not use `--force` or an unrelated version without
operator approval.

### Restoring the newer version

If the rollback succeeds but is itself unsatisfactory, verify the pre-rollback
Version ID is still retained:

```bash
npx wrangler versions view "<pre-rollback-version-id>" --name appkitx-platform --json
npx wrangler deployments status --name appkitx-platform --json
npx wrangler rollback "<pre-rollback-version-id>" \
  --name appkitx-platform \
  --message "roll-forward: restore <pre-rollback-version-id> after failed rollback" \
  --yes
```

This creates another deployment of the newer version. If Cloudflare no longer
retains the version, or a deployment fails, stop and escalate. Do not trigger a
new build or deploy a local working tree without a separate approval and a new
provenance record.

### Rollback confidence

The rollback mechanism, CLI commands, permission requirements, 100-version
limit, and dashboard route are supported by current Cloudflare documentation and
the local Wrangler help output. The current active deployment/Version ID is now
verified through the Cloudflare deployments API. The preferred rollback target's
retention and deployability were **not** verified, and the rollback procedure was
not executed. It therefore requires operator verification before it can be
considered operationally rollback-ready.

## Post-deployment and post-rollback verification

Record the operator, UTC timestamp, observed active Version ID, and result. These
checks do not include a deliberate CSP violation test against production.

### HTTP and routing

- `/` and `/es/` return `200`.
- Representative tool routes return `200`, for example
  `/percentage-calculator/`, `/es/json-formatter/`,
  `/calculators/`, and `/es/calculators/`.
- `/404`, `/404.html`, and an arbitrary unknown path return `404` without a
  redirect.
- `https://www.appkitx.com/` returns the expected redirect (currently `301`) to
  `https://appkitx.com/`.
- Repeat the critical HTML routes and confirm the references point at the
  rollback target's hashed assets. HTML is served with
  `cache-control: public, max-age=0, must-revalidate`; hashed `/_astro/*` assets
  are immutable. Record any unexpected cache status or stale asset references.

```bash
for route in / /es/ /percentage-calculator/ /es/json-formatter/ \
  /calculators/ /es/calculators/ /404 /404.html /appkitx-rollback-smoke-unknown; do
  printf '%s ' "$route"
  curl -sS -o /dev/null -w '%{http_code} %{redirect_url}\n' "https://appkitx.com$route"
done

curl -sS -o /dev/null -D - "https://www.appkitx.com/" \
  | sed -n '1p;/^[Ll]ocation:/p;/^[Ss]trict-[Tt]ransport-[Ss]ecurity:/p'
```

### Security headers and CSP

- Exactly one `Content-Security-Policy-Report-Only` header is present.
- No enforcing `Content-Security-Policy` header or CSP meta tag appears.
- The report-only policy's executable inline hashes match the deployed HTML.
- HSTS is exactly `max-age=2592000`, without unapproved `includeSubDomains` or
  `preload`.
- `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, and
  `Permissions-Policy` remain present.

```bash
headers="$(mktemp)"
body="$(mktemp)"
curl -sS -D "$headers" -o "$body" https://appkitx.com/

grep -ci '^content-security-policy-report-only:' "$headers"   # 1
grep -ci '^content-security-policy:' "$headers"              # 0
grep -i '^strict-transport-security:' "$headers"             # max-age=2592000
grep -i '^x-content-type-options:' "$headers"
grep -i '^referrer-policy:' "$headers"
grep -i '^x-frame-options:' "$headers"
grep -i '^permissions-policy:' "$headers"
grep -ci 'http-equiv=.*content-security-policy' "$body"  # 0
```

For a deployed hash inventory, download representative HTML to a temporary
directory and run the existing read-only inventory script against that directory:

```bash
tmp="$(mktemp -d)"
curl -sS https://appkitx.com/ -o "$tmp/home.html"
curl -sS https://appkitx.com/es/json-formatter/ -o "$tmp/es-json.html"
node --experimental-strip-types scripts/csp-inline-hashes.ts "$tmp"
```

Compare every unique executable hash in the output with the live
`Content-Security-Policy-Report-Only` header. JSON-LD data blocks remain
excluded. Do not use the local `dist/_headers` value as proof that production is
serving the same asset inventory.

### Cloudflare RUM

- The Cloudflare RUM script from `static.cloudflareinsights.com` returns `200`.
- An actual telemetry `POST` to `/cdn-cgi/rum` returns `204`.
- Browser console and `securitypolicyviolation` events show no unexpected
  report-only violations.

Use browser DevTools → Network with filters for `cloudflareinsights` and
`cdn-cgi/rum`, then inspect the Console. This is sampled browser evidence, not a
central CSP report collection system.

### Browser behavior

Run this focused smoke in Chromium, Firefox, and WebKit:

- Open `/` and `/es/`; confirm the localized heading.
- Open search with `Ctrl+K`/`Cmd+K`, filter by a known tool, and close with
  Escape.
- Calculate `25% of 80 = 20` on `/percentage-calculator/`.
- Switch to Spanish and confirm `/es/percentage-calculator/`.
- Confirm a visible 2px focus ring with 2px offset using the keyboard. In
  Playwright WebKit, Safari's full keyboard traversal is `Alt+Tab` (Option+Tab).
- In each engine, activate **Copy result** through the real UI and confirm the
  success feedback. Native clipboard permissions differ by engine; if the browser
  cannot expose the clipboard in the test environment, record that limitation
  separately rather than claiming the native clipboard was read.
- Open an unknown path and confirm the branded 404 page.
- Confirm no unexpected console errors or CSP report-only violations.

The full repository E2E suite is a pre-deployment regression gate, not a
substitute for post-deployment production smoke. A CSP-only run must not be
described as a full application E2E run.

## Access limitations and operator actions

The repository environment has no Cloudflare session or API token. The current
active deployment was confirmed through an operator-provided authenticated audit.
The following require an authorized operator:

1. Confirm whether Version `faf8f318-d9f9-4542-a814-818fe14f85b2` remains among
   the 100 retained versions and is deployable as the preferred rollback target.
2. Confirm the older fallback Version
   `66e82b32-786e-4f3e-a41d-fe54d5e9fe67` if a second retained target is needed.
3. Export the current GitHub check-run payload and retain the build record/log
   privately before either becomes unavailable.
4. Use Cloudflare audit logs to establish when and why the former Builds
   connection/build records disappeared, and confirm the current trigger state
   before relying on push-to-`main` deployment.
5. Grant a read-only Workers role for future audits and a separate Editor role
   only for an approved rollback.
6. Execute the rollback only after the confirmations above and record the
   post-rollback evidence.

Do not commit credentials, request a production role change as part of this
runbook, or attempt a rollback against an unverified Version ID.

## Documentation boundary

This runbook deliberately does not add a public version endpoint, deployment
metadata to HTML, a second CI/deployment pipeline, or a CSP collector. Keep
completed attestations in private operational storage.
