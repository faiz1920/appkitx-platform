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

1. A private CSP report collector and alert path are approved and implemented.
2. The policy with reporting enabled is soaked in report-only mode for an
   explicit period with real-user evidence reviewed.
3. The active production Version ID is confirmed for the exact enforcement
   candidate.
4. The immediate pre-enforcement version is verified as retained and deployable.
5. A supported canary/version-affinity path is confirmed, or enforcement is
   explicitly approved as a controlled 100% deployment with immediate rollback.

## Current policy and baseline

- Repository baseline: `be1a65ab22442920e99d516ef06374d76ba49e7a`.
- Production: `https://appkitx.com/`.
- Policy mode: report-only.
- One `Content-Security-Policy-Report-Only` response header.
- No enforcing `Content-Security-Policy` response header.
- No CSP `<meta>` tag.
- No `report-uri`, `report-to`, or `Reporting-Endpoints` CSP collector.
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
worker-src 'none'
```

The source builder, fresh `dist/_headers`, and current production header match
exactly. The generated policy is 606 characters; the complete header line is 648
characters, below the existing 2,000-character guard.

## Directive assessment

| Directive         | Current value                                     | Assessment                                                                                                                                                              |
| ----------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default-src`     | `'none'`                                          | Correct deny-by-default baseline.                                                                                                                                       |
| `script-src`      | `'self'`, Cloudflare RUM host, six SHA-256 hashes | All first-party bundles are same-origin. The external RUM module is Cloudflare-owned. No unsafe allowances.                                                             |
| `style-src`       | `'self'`                                          | Application CSS is same-origin. No inline `<style>` blocks or `style=` attributes were found.                                                                           |
| `img-src`         | `'self'`                                          | No external or `data:` image requests were found.                                                                                                                       |
| `font-src`        | `'self' data:`                                    | `data:` is required: the built CSS embeds a JetBrains Mono WOFF2 data URL. Other fonts are same-origin.                                                                 |
| `connect-src`     | `'self' https://cloudflareinsights.com`           | Same-origin `/cdn-cgi/rum` is the observed telemetry destination. The Cloudflare RUM bundle also contains the documented `cloudflareinsights.com/cdn-cgi/rum` fallback. |
| `base-uri`        | `'none'`                                          | No `<base>` element exists or is required.                                                                                                                              |
| `form-action`     | `'none'`                                          | All forms are JavaScript-mediated and have no submit action. No legitimate form navigation was found.                                                                   |
| `frame-ancestors` | `'none'`                                          | No embedding requirement exists. `X-Frame-Options: DENY` is also present. This directive is ignored in report-only mode but will apply on enforcement.                  |
| `object-src`      | `'none'`                                          | No plugin content exists.                                                                                                                                               |
| `worker-src`      | `'none'`                                          | No Worker, SharedWorker, or service worker is created by the application or the RUM bundle.                                                                             |

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

- Full E2E suite: **627/627 passed**
  - Chromium: 209/209
  - Firefox: 209/209
  - WebKit: 209/209
  - Zero skips, retries, or flaky results.
- CSP-specific suite: **27/27 passed**, 9 per engine.
- Unit tests: **295/295 passed**.
- `npm run check`: 0 errors, warnings, or hints.
- `npm run format:check`: passed.
- Two fresh builds: byte-identical.

Covered journeys include navigation, search, all six tools, Spanish locale
switching, clipboard behavior, keyboard focus and focus trapping, 404 handling,
missing JSON input, responsive layouts, and the local RUM simulation.

The deliberate unlisted-inline-script test executed in all three engines,
produced a report-only `securitypolicyviolation` with disposition `report`, and
confirmed that report-only mode did not block execution.

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
WebKit logged its known diagnostic that the report-only policy has no
`report-to` destination. That is a reporting limitation, not a violation.

### Evidence quality: MODERATE

Automated coverage is strong, and production sampling is broad across three
engines and representative journeys. However, there is no central real-user
report collection and no defined continuous production observation period.
Browser events and local test instrumentation are not a substitute for
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

**Recommendation: a collector is required before enforcement.**

The current report-only header has no report destination. Browsers only expose
violations in the console and page-level `securitypolicyviolation` events, which
vanish with the page. There are no real-user reports, historical violation
trends, or alerts. The assertion that sampled flows had no violations is not
evidence that all real users had no violations.

`report-to` is supported by the current target engines (Chrome 70+, Firefox 149+,
Safari 16.4+). `report-uri` is deprecated but broadly supported; a browser that
supports `report-to` ignores `report-uri`. If legacy coverage is required, send
both and deduplicate reports.

A future collector should:

- Be a POST-only same-origin Worker route, with no public read API.
- Accept only `application/csp-report` and `application/reports+json`.
- Enforce a small request-body limit and reject malformed payloads.
- Use Cloudflare rate limiting/WAF suitable for an unauthenticated report
  endpoint.
- Strip query strings and fragments from document/source URLs before storage.
- Avoid storing raw `script-sample`, referrers, IP addresses, cookies, or user
  input unless separately justified.
- Aggregate by effective directive, blocked host/type, page path, and coarse
  browser family where necessary.
- Alert on new or unexpected directives rather than logging unbounded raw data.
- Define short retention and private access.
- Accept both the Reporting API envelope and the legacy CSP report body during
  any transition.
- Be implemented and reviewed separately; this assessment does not add one.

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
worker-src 'none'
```

When the approved collector exists, the enforcing policy should add:

```text
report-to csp-endpoint;
report-uri https://appkitx.com/<approved-report-path>
```

and the response must include:

```text
Reporting-Endpoints: csp-endpoint="https://appkitx.com/<approved-report-path>"
```

The existing `CSP_REPORT_ONLY_MAX_LINE_LENGTH` guard and the implementation that
currently rejects reporting directives must be extended in a separate change.
The collector must not be added as part of this assessment.

No directive addition beyond reporting is proposed. `font-src data:` and the
Cloudflare RUM fallback host are retained because both are justified by current
build/runtime evidence. This policy is documentation only; it is not written to
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

- Implement the collector in a separately approved task.
- Add `Reporting-Endpoints` and `report-to`/optional `report-uri` to the
  report-only policy.
- Deploy report-only only and observe for at least seven consecutive days and a
  minimum of 10,000 production page views, or a larger threshold agreed by the
  owner.
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

| Category                     | Evidence                                                                                                                           | Status  | Remaining action                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------- |
| Policy correctness           | Source, fresh build, and production policy match; directives scoped; no unsafe/wildcard sources                                    | PASS    | None identified                                                       |
| Inline hash reliability      | Six exact hashes; 65 occurrences; 21 pages; 38 JSON-LD excluded; deterministic builds                                              | PASS    | Re-run on final enforcement candidate                                 |
| External script sources      | First-party bundles and Cloudflare RUM only; no wildcard hosts                                                                     | PASS    | Reconfirm on release candidate                                        |
| Cloudflare RUM               | Script 200; actual telemetry 204 in all engines; fallback source verified                                                          | PASS    | Recheck after enforcement                                             |
| Chromium                     | Full suite 209/209; CSP suite 9/9; production smoke passed                                                                         | PASS    | Repeat for enforcement candidate                                      |
| Firefox                      | Full suite 209/209; CSP suite 9/9; production smoke passed                                                                         | PASS    | Repeat for enforcement candidate                                      |
| WebKit                       | Full suite 209/209; CSP suite 9/9; production smoke passed                                                                         | PASS    | Repeat for enforcement candidate                                      |
| Production route coverage    | 23 routes, 21 exact HTML matches, 8/8 assets, policy/hashes/404s/HSTS passed                                                       | PASS    | Expand only if new routes are added                                   |
| Real-user violation evidence | No collector; no report-to; no central logs/dashboards; no defined observation period                                              | BLOCKED | Add collector and complete report-only soak                           |
| Reporting collector          | None configured; no `report-uri`/`report-to`; NEL `Report-To` is unrelated                                                         | BLOCKED | Approve and implement collector before enforcement                    |
| Deployment provenance        | New `be1a65a`/Build `5e6672f0…`/Version `2214ddbf…` evidence exists, but active Version ID was not revalidated after the new build | PARTIAL | Operator verifies active deployment and records attestation           |
| Rollback readiness           | Mechanism documented; current active version and target retention unverified; no rehearsal                                         | PARTIAL | Verify active/pre-enforcement versions, retention, and rollback steps |
| Operational monitoring       | Browser sampling only; no central CSP alerts or thresholds                                                                         | BLOCKED | Add collector alerting and define response ownership                  |

## Outstanding blockers and operator actions

1. Approve and implement a private CSP report collector with rate limits,
   validation, aggregation, privacy review, and alerting.
2. Deploy report-only with reporting enabled and complete the defined soak.
3. Revalidate the current active production Version ID. The last authenticated
   audit recorded `7074ff1f-10d1-4141-9768-9de8b5080d3b`; a newer repository build
   now exists for `be1a65a` with Build `5e6672f0…` and Version `2214ddbf…`.
4. Confirm whether the candidate `2214ddbf…` or another Version is active, and
   record the exact check-run/build/Version/deployment chain.
5. Confirm the immediate pre-enforcement and historical rollback versions remain
   deployable within Cloudflare's 100-version limit.
6. Define canary/version-affinity support or approve a controlled 100% deployment.
7. Re-run the full browser, production policy, hash, RUM, and rollback checks for
   the enforcement release candidate.
8. Record the private attestation and smoke results after every deployment.

## Documentation boundary

This assessment adds no collector, no analytics, no public version endpoint, no
CSP enforcement, and no production configuration change. The proposed policy is
documentation only. Any enforcement rollout, collector implementation, or
Cloudflare deployment requires separate approval.
