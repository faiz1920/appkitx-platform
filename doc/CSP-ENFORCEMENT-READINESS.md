# CSP Enforcement Readiness Assessment

Assessment date: 2026-10-30

This document evaluates whether AppKitX can move from
`Content-Security-Policy-Report-Only` to an enforcing
`Content-Security-Policy`. It does not authorize enforcement, change production,
or replace the deployment and rollback runbook. See
[DEPLOYMENT-RUNBOOK.md](./DEPLOYMENT-RUNBOOK.md) for deployment provenance,
attestation, rollback, and post-deployment verification.

## Executive verdict

**CONDITIONALLY READY — SPECIFIC ACTIONS REQUIRED**

The application policy is technically sound and well tested, but enforcement
should not begin until:

1. The collector is deployed, with an Analytics Engine read path and alert
   ownership confirmed. The collector code exists on the
   `feature/m9-csp-reporting-collector` branch but is not deployed.
2. The policy with reporting enabled is soaked in report-only mode for an
   explicit period with real-user evidence reviewed.
3. The active production Version ID is confirmed for the exact enforcement
   candidate.
4. The immediate pre-enforcement version is verified as retained and deployable.
5. A supported canary/version-affinity path is confirmed, or enforcement is
   explicitly approved as a controlled 100% deployment with immediate rollback.

## Current policy and baseline

- Repository baseline: `be1a65ab22442920e99d516ef06374d76ba49e7a`.
- Collector branch base: `730eeafa33116d215fa63218f9e270e99bf6e88d`.
- Production: `https://appkitx.com/`.
- Policy mode: report-only.
- One `Content-Security-Policy-Report-Only` response header.
- No enforcing `Content-Security-Policy` response header.
- No CSP `<meta>` tag.
- The feature branch adds a same-origin `report-uri /__csp-report` collector.
  Production does not yet contain that directive or endpoint.
- No `report-uri`, `report-to`, or `Reporting-Endpoints` CSP collector is
  present in production.
- The existing `Report-To: cf-nel` response header belongs to Cloudflare Network
  Error Logging and is not a CSP report destination.

### Exact generated and production policy

```text
default-src 'none';
script-src 'self' https://static.cloudflareinsights.com
  'sha256-2ovwwOccekT6gC0etHzXVjBIPGjs/Pk4Y0MslATcJSo='
  'sha256-6YHh0btGzoUaqaFfX6ABqUIDEq8lyxRHuzV9QYYMjHk='
  'sha256-GWONm2azY/q8PjyAfGJauEPujU3EZ+k9TS0jFpF860I='
  'sha256-GWltgUGGpfKmlkpkzVCzzn0wFAP8ubo239okw3rG5bs='
  'sha256-nwR8jbs6ocHZfGmTZLGJfOT2YYCifzaggDPHRwmH+Qo='
  'sha256-wpSoxziKlFfjcQk3/qeQ4yk9KGYcR0C8+MBRjIbr/HU=';
style-src 'self';
img-src 'self';
font-src 'self' data:;
connect-src 'self' https://cloudflareinsights.com;
base-uri 'none';
form-action 'none';
frame-ancestors 'none';
object-src 'none';
worker-src 'none';
report-uri /__csp-report
```

Production currently ends at `worker-src 'none'`. The feature branch adds
`report-uri /__csp-report` and generates a 632-character policy (674-character
header line). The source builder, fresh build, and production header matched
exactly before that addition; the collector-enabled policy has not been
deployed.

## Directive assessment

| Directive         | Current value                                     | Assessment                                                                                                                                                                 |
| ----------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default-src`     | `'none'`                                          | Correct deny-by-default baseline.                                                                                                                                          |
| `script-src`      | `'self'`, Cloudflare RUM host, six SHA-256 hashes | All first-party bundles are same-origin. The external RUM module is Cloudflare-owned. No unsafe allowances.                                                                |
| `style-src`       | `'self'`                                          | Application CSS is same-origin. No inline `<style>` blocks or `style=` attributes were found.                                                                              |
| `img-src`         | `'self'`                                          | No external or `data:` image requests were found.                                                                                                                          |
| `font-src`        | `'self' data:`                                    | `data:` is required: the built CSS embeds a JetBrains Mono WOFF2 data URL. Other fonts are same-origin.                                                                    |
| `connect-src`     | `'self' https://cloudflareinsights.com`           | Same-origin `/cdn-cgi/rum` is the observed telemetry destination. The Cloudflare RUM bundle also contains the documented `cloudflareinsights.com/cdn-cgi/rum` fallback.    |
| `base-uri`        | `'none'`                                          | No `<base>` element exists or is required.                                                                                                                                 |
| `form-action`     | `'none'`                                          | All forms are JavaScript-mediated and have no submit action. No legitimate form navigation was found.                                                                      |
| `frame-ancestors` | `'none'`                                          | No embedding requirement exists. `X-Frame-Options: DENY` is also present. This directive is ignored in report-only mode but will apply on enforcement.                     |
| `object-src`      | `'none'`                                          | No plugin content exists.                                                                                                                                                  |
| `worker-src`      | `'none'`                                          | No Worker, SharedWorker, or service worker is created by the application or the RUM bundle.                                                                                |
| `report-uri`      | `/__csp-report`                                   | Same-origin Worker collector. Implemented and browser-tested on the feature branch; not deployed.                                                                          |
| `report-to`       | Not emitted                                       | Rejected after Chromium 156 generated violations but delivered no report when `report-to`/`Reporting-Endpoints` were present. `report-uri` delivered in all three engines. |

No `'unsafe-inline'`, `'unsafe-eval'`, `'unsafe-hashes'`, `'strict-dynamic'`,
wildcard host, or `http:` source is present. No directive was found to be
unnecessarily broad for current application behavior.

## Inline-script hash verification

A fresh production build generated **21 HTML files**, **65 executable inline
script occurrences**, and **six unique executable bodies**. JSON-LD is excluded.

| Hash            | Source                                                   | Occurrences |
| --------------- | -------------------------------------------------------- | ----------: |
| `sha256-2ovw…`  | Language switcher persistence and outside-dismiss script |          21 |
| `sha256-GWON…`  | Global navigation menu and search trigger script         |          21 |
| `sha256-nwR8…`  | English pre-paint locale preference script               |          10 |
| `sha256-wpSox…` | Spanish pre-paint locale preference script               |          10 |
| `sha256-GWlt…`  | Homepage hero-search forwarding script                   |           2 |
| `sha256-6YHh…`  | 404 search forwarding script                             |           1 |

The six hashes in the policy exactly match the fresh inventory. There are no
missing, stale, or duplicate hashes. The other inline scripts are 38 JSON-LD data
blocks, which correctly do not require executable-script hashes. Thirty-three
external script references are excluded from the inline inventory.

Two clean builds were byte-identical across all `dist` files and generated the
same `_headers` file, confirming deterministic hash production.

## Production and automated evidence

### Automated

- Full E2E suite: **666/666 passed**
  - Chromium: 222/222
  - Firefox: 222/222
  - WebKit: 222/222
  - Zero skips, retries, or flaky results.
- CSP-specific suite: **27/27 passed**, 9 per engine.
- CSP reporting suite: **39/39 passed**, 13 per engine, including actual
  browser delivery of a report-only violation.
- Unit tests: **324/324 passed**.
- `npm run check`: 0 errors, warnings, or hints.
- `npm run format:check`: passed.
- Two fresh builds of the collector branch: byte-identical across all `dist`
  files, including the generated `_headers`.

Covered journeys include navigation, search, all six tools, Spanish locale
switching, clipboard behavior, keyboard focus and focus trapping, 404 handling,
missing JSON input, responsive layouts, the local RUM simulation, endpoint
validation and limits, and actual browser-to-collector delivery.

The deliberate unlisted-inline-script test executed in all three engines,
produced a report-only `securitypolicyviolation` with disposition `report`, and
confirmed that report-only mode did not block execution. The reporting suite
additionally confirmed that Chromium, Firefox, and WebKit each delivered the
violation to `POST /__csp-report` and received `204`.

### Production sampled

Read-only checks against the current deployment:

- 23 routes checked: 21 generated HTML routes plus `/404` and an unknown path.
- All expected 200/404 statuses passed.
- 21/21 generated HTML pages matched a clean `be1a65a` build after removing only
  Cloudflare RUM injection.
- 8/8 directly referenced hashed CSS/JS assets matched byte-for-byte.
- Exactly one report-only CSP header was present on all 23 routes.
- No enforcing CSP header or CSP meta tag was present.
- Every production executable inline hash matched the live report-only policy.
- HSTS remained `max-age=2592000`.
- Existing security headers remained present.
- All responses observed at the time were cache HITs.
- `www` returned `301` to the apex.

Production browser smoke passed in Chromium `156.0.8078.4`, Firefox `157.0`, and
WebKit `27.2`:

- Homepage.
- Search.
- Keyboard focus ring.
- Percentage calculation.
- Real copy action and success feedback.
- Locale switch.
- Branded 404.
- RUM script HTTP 200.
- Actual telemetry POSTs HTTP 204.

No `securitypolicyviolation` events occurred during normal production flows.
WebKit's earlier diagnostic about a missing `report-to` destination applied to
the collector-less production policy. The collector-enabled policy uses
`report-uri`; local WebKit delivery to the endpoint succeeded. That diagnostic
was a reporting limitation, not a violation.

### Evidence quality: MODERATE

Automated coverage is strong, and production sampling is broad across three
engines and representative journeys. However, there is no **deployed** central
real-user report collection and no defined continuous production observation
period. Browser events and local test instrumentation are not a substitute for
real-user reporting.

## Cloudflare RUM compatibility

Observed RUM behavior:

- Script URL:
  `https://static.cloudflareinsights.com/beacon.min.js/vce701823e78c4301a35b7e07294d87301792088814092`
- Script response: HTTP 200, `text/javascript`, ETag `W/"2026.10.1"`.
- Script digest: SHA-256
  `637381256384554e1cc3309a62fb238a51b83e7f10b2a56d8ba15dbc73ca762e`.
- Browser requests produced same-origin `POST /cdn-cgi/rum` responses with HTTP
  204 in Chromium, Firefox, and WebKit.
- The bundle references both `/cdn-cgi/rum` and
  `https://cloudflareinsights.com/cdn-cgi/rum`; both are permitted by the
  proposed policy through `'self'` and the explicit fallback host.
- No Worker/service-worker usage was found in the bundle.

Cloudflare's documented Web Analytics requirement —
`script-src static.cloudflareinsights.com` and
`connect-src cloudflareinsights.com` — is satisfied. Automatic setup's observed
same-origin telemetry is also allowed by `connect-src 'self'`.

RUM injection is applied by Cloudflare at the edge and varies with the request
context/cache. Browser validation is required; raw `curl` responses alone are not
sufficient evidence that the browser beacon was present. The EU visitor-data
setting is a product configuration, not a privacy or legal compliance
determination, and was not changed or assessed as such.

## Reporting collector decision

**Recommendation: a collector is required before enforcement. The repository
implementation exists on `feature/m9-csp-reporting-collector`; it is not
deployed.**

The production report-only header has no report destination. Browsers only
expose violations in the console and page-level `securitypolicyviolation`
events, which vanish with the page. There are no real-user reports, historical
violation trends, or alerts. The assertion that sampled flows had no violations
is not evidence that all real users had no violations.

### Implemented collector

- `POST /__csp-report` is handled by `src/worker.ts` before the static-assets
  fallback. `wrangler.jsonc` includes the path in `run_worker_first`.
- The endpoint accepts `application/csp-report` (legacy wrapper, WebKit hybrid,
  or single Reporting API object) and `application/reports+json` arrays.
- It enforces a 32 KiB body limit, a 20-report batch limit, strict shape
  validation, bounded field lengths, and `Cache-Control: no-store`.
- It normalizes reports to directive, disposition, blocked origin/category,
  document path, coarse browser family, count, and schema version.
- It writes to the Analytics Engine dataset `appkitx_csp_reports` through the
  `CSP_REPORTS` binding. The dataset is created on first write.
- It does not store raw bodies, samples, referrers, IP addresses, cookies,
  authorization headers, full user agents, full URLs, query strings, or
  fragments. See [CSP-REPORTING-COLLECTOR.md](./CSP-REPORTING-COLLECTOR.md).
- It has no public read API and does not fetch submitted URLs.

The endpoint, policy, and browser delivery are covered by unit and Playwright
tests. Local Miniflare Analytics Engine writes are no-ops, so local tests prove
delivery to the endpoint, not durable storage or real-user collection.

### Why `report-to` is not used

`report-to` and `Reporting-Endpoints` were implemented and tested first.
Chromium 156 generated the report-only violation but delivered no report when
`report-to` was present, even with an absolute endpoint. The same page delivered
normally with `report-uri` only. This matches a known Chromium CSP `report-to`
delivery problem (Chromium issue 40702166). Chromium prefers `report-to` when it
is present and does not fall back to `report-uri`, so emitting both would lose
Chromium reports entirely.

Firefox 157 delivered `application/reports+json`, and WebKit 27.2 delivered its
hybrid payload, but the cross-browser requirement makes `report-uri` the only
safe primary mechanism. The endpoint still accepts the Reporting API envelope
for future compatibility. Revisit `report-to` only after verifying delivery in
the Chromium version used by production visitors.

### Account-side prerequisites

- A Cloudflare API token with **Account Analytics Read** for aggregate queries.
- A Cloudflare rate-limiting rule for `POST /__csp-report`; the exact
  recommendation is in the collector document. It is not active.
- Private access and alert ownership for the dataset and queries.
- A deployment, followed by verification that rows are written and readable.

Cloudflare Web Analytics/RUM is not a CSP collector. Cloudflare Client-Side
Security/Page Shield is a separate product and is not currently configured as a
collector for AppKitX; enabling it would be a separate Cloudflare change.

## Proposed enforcing policy

The first enforcing policy should be **directive-identical to the current
report-only policy**. Keeping the tested policy unchanged allows the existing
evidence to apply directly. The only intended difference is the header name —
`Content-Security-Policy` instead of
`Content-Security-Policy-Report-Only`.

```text
default-src 'none';
script-src 'self' https://static.cloudflareinsights.com
  'sha256-2ovwwOccekT6gC0etHzXVjBIPGjs/Pk4Y0MslATcJSo='
  'sha256-6YHh0btGzoUaqaFfX6ABqUIDEq8lyxRHuzV9QYYMjHk='
  'sha256-GWONm2azY/q8PjyAfGJauEPujU3EZ+k9TS0jFpF860I='
  'sha256-GWltgUGGpfKmlkpkzVCzzn0wFAP8ubo239okw3rG5bs='
  'sha256-nwR8jbs6ocHZfGmTZLGJfOT2YYCifzaggDPHRwmH+Qo='
  'sha256-wpSoxziKlFfjcQk3/qeQ4yk9KGYcR0C8+MBRjIbr/HU=';
style-src 'self';
img-src 'self';
font-src 'self' data:;
connect-src 'self' https://cloudflareinsights.com;
base-uri 'none';
form-action 'none';
frame-ancestors 'none';
object-src 'none';
worker-src 'none';
report-uri /__csp-report
```

The collector directive is already part of the tested feature-branch policy. No
`report-to` directive or `Reporting-Endpoints` header is emitted, for the
Chromium delivery reason above. The endpoint still accepts the Reporting API
envelope if a future browser or tool submits it directly.

No directive addition beyond `report-uri /__csp-report` is proposed. `font-src
data:` and the Cloudflare RUM fallback host are retained because both are
justified by current build/runtime evidence. The `CSP_REPORT_ONLY_MAX_LINE_LENGTH`
guard now accepts the approved reporting directive and rejects `report-to` and
unapproved report URLs. This policy is documentation only; it is not written to
`dist/_headers` or production.

## Staged enforcement plan

### Gate 0 — Policy and release preflight

- Confirm current production policy exactly matches the reviewed policy.
- Re-run the fresh hash inventory and two-build determinism check.
- Run the complete Playwright matrix for the exact enforcement candidate.
- Verify production RUM script and telemetry in all three engines.
- Verify `/404`, `/404.html`, unknown 404, and `www` behavior.
- Record the exact source commit, Build ID, Version ID, active deployment, and
  artifact digest.
- Verify the immediately preceding non-enforcing Version ID is retained and
  deployable.
- Confirm the release candidate is the reviewed commit, not a later unreviewed
  `main`.

### Gate 1 — Report-only collector soak

- The collector implementation is present on the feature branch; deploy it in a
  separately approved change.
- Confirm the deployed policy contains `report-uri /__csp-report` and no
  enforcing CSP.
- Verify a synthetic report returns `204` and appears in Analytics Engine.
- Configure the Cloudflare rate-limit rule and the read-only Analytics Engine
  token before exposing the endpoint broadly.
- Observe for at least seven consecutive days and a minimum of 10,000 production
  page views, or a larger threshold agreed by the owner.
- Require zero unexplained violations across all major routes and journeys.
- Triage known browser/extension noise separately; do not silently suppress it.
- Confirm alerts, retention, rate limits, and privacy review.

### Gate 2 — Enforcement candidate

- Freeze the policy and hash inventory.
- Re-run the full Chromium/Firefox/WebKit matrix.
- Verify the production-like artifact and current headers.
- Confirm the current active Version ID and the rollback target.
- If traffic splitting is used, verify Cloudflare gradual-deployment support and
  enable **version affinity** for static assets. Without affinity, HTML from one
  version can request asset filenames served by another version and break.
- Do not assume that the current deployment workflow can create a safe split. It
  currently has no documented canary configuration.

### Gate 3 — Controlled enforcement

- Start at a small canary percentage only if a safe version-affinity split is
  available. Otherwise use a controlled 100% deployment window with immediate
  rollback, explicitly approved by the owner.
- With a supported split, use a recommended progression of 5% for at least 24
  hours, 25% for at least 24 hours, then 100%. Do not expand on a timed schedule
  alone; each step requires zero unexplained violations.
- Keep the collector active and alerting.
- Monitor CSP reports, RUM telemetry, HTTP errors, asset 404s, and core browser
  journeys.
- Define alert thresholds before rollout: any blocked first-party script, any
  core-journey failure, any asset-404 spike, and any RUM telemetry failure are
  immediate rollback triggers. Expand traffic only after the agreed observation
  window with zero unexplained violations and no application regressions.
- Keep the report-only header during the first enforcement window only if a
  separate comparison policy is required; the enforcing policy itself will
  report violations.

### Immediate rollback triggers

Roll back if any of these occur:

- Core scripts are blocked: search, locale switching, navigation, or any tool
  calculator.
- A tool produces incorrect or missing output after enforcement.
- RUM script or `/cdn-cgi/rum` telemetry fails or returns unexpected status.
- Browser-specific regressions appear in Chromium, Firefox, or WebKit.
- Asset 404s or version-skew errors appear during a split deployment.
- Error or CSP-report rates exceed the thresholds agreed before rollout.
- Unexpected first-party or critical third-party violations appear.

Rollback must use the deployment runbook's explicit Version ID procedure. The
rollback target should be the immediate non-enforcing Version active before the
enforcement deployment, after confirming it is retained. Historical versions
`2214ddbf…` (latest repository-linked Version candidate), `7074ff1f…`,
`faf8f318…`, and `66e82b32…` are candidates for verification, not assumed
retained. Do not roll back merely by editing headers in place.

### Post-rollback verification

Repeat the deployment runbook's HTTP, CSP, HSTS, cache, RUM, and three-engine
browser checks. Confirm the active Version ID is the intended non-enforcing
version, record the rollback timestamp and result, and preserve the failed
candidate's reports before closing the incident.

## Readiness scorecard

| Category                     | Evidence                                                                                                                                               | Status  | Remaining action                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | --------------------------------------------------------------------- |
| Policy correctness           | Source and fresh build include `report-uri /__csp-report`; production still ends at `worker-src 'none'`; directives scoped; no unsafe/wildcard sources | PARTIAL | Deploy the collector-enabled policy and re-compare production         |
| Inline hash reliability      | Six exact hashes; 65 occurrences; 21 pages; 38 JSON-LD excluded; deterministic builds                                                                  | PASS    | Re-run on final enforcement candidate                                 |
| External script sources      | First-party bundles and Cloudflare RUM only; no wildcard hosts                                                                                         | PASS    | Reconfirm on release candidate                                        |
| Cloudflare RUM               | Script 200; actual telemetry 204 in all engines; fallback source verified                                                                              | PASS    | Recheck after enforcement                                             |
| Chromium                     | Full suite 222/222; CSP suite 9/9; reporting suite 13/13; production smoke passed; report delivery verified locally                                    | PASS    | Repeat for enforcement candidate                                      |
| Firefox                      | Full suite 222/222; CSP suite 9/9; reporting suite 13/13; production smoke passed; report delivery verified locally                                    | PASS    | Repeat for enforcement candidate                                      |
| WebKit                       | Full suite 222/222; CSP suite 9/9; reporting suite 13/13; production smoke passed; report delivery verified locally                                    | PASS    | Repeat for enforcement candidate                                      |
| Production route coverage    | 23 routes, 21 exact HTML matches, 8/8 assets, policy/hashes/404s/HSTS passed                                                                           | PASS    | Expand only if new routes are added                                   |
| Real-user violation evidence | Collector implemented but not deployed; no production reports, dashboards, or defined observation period                                               | BLOCKED | Deploy collector and complete report-only soak                        |
| Reporting collector          | Endpoint, normalization, limits, and browser delivery implemented and tested; Analytics Engine storage not deployed or verified                        | PARTIAL | Deploy, verify rows, configure rate limit and read access             |
| Deployment provenance        | New `be1a65a`/Build `5e6672f0…`/Version `2214ddbf…` evidence exists, but active Version ID was not revalidated after the new build                     | PARTIAL | Operator verifies active deployment and records attestation           |
| Rollback readiness           | Mechanism documented; current active version and target retention unverified; no rehearsal                                                             | PARTIAL | Verify active/pre-enforcement versions, retention, and rollback steps |
| Operational monitoring       | Aggregate SQL documented; no active rate limit, alerting, or response ownership                                                                        | PARTIAL | Add rate limit, alerting, and ownership before the soak               |

## Outstanding blockers and operator actions

1. Deploy the collector-enabled report-only policy and verify a synthetic report
   returns `204` and produces an Analytics Engine row.
2. Configure the Cloudflare rate-limit rule and a read-only Analytics Engine token;
   define alert ownership.
3. Complete the defined report-only soak with production evidence.
4. Revalidate the current active production Version ID. The last authenticated
   audit recorded `7074ff1f-10d1-4141-9768-9de8b5080d3b`; a newer repository build
   now exists for `be1a65a` with Build `5e6672f0…` and Version `2214ddbf…`.
5. Confirm whether the candidate `2214ddbf…` or another Version is active, and
   record the exact check-run/build/Version/deployment chain.
6. Confirm the immediate pre-enforcement and historical rollback versions remain
   deployable within Cloudflare's 100-version limit.
7. Define canary/version-affinity support or approve a controlled 100% deployment.
8. Re-run the full browser, production policy, hash, RUM, collector, and rollback
   checks for the enforcement release candidate.
9. Record the private attestation and smoke results after every deployment.

## Documentation boundary

The collector implementation is documented in
[CSP-REPORTING-COLLECTOR.md](./CSP-REPORTING-COLLECTOR.md) and is present on a
feature branch only. This assessment does not deploy it, does not add production
analytics, does not add a public version endpoint, and does not enable CSP
enforcement. The proposed enforcing policy remains documentation only. Any
enforcement rollout, collector deployment, or Cloudflare configuration change
requires separate approval.
