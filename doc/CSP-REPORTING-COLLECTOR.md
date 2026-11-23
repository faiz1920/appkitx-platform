# CSP Reporting Collector

Operational and implementation reference for the AppKitX CSP report collector.
This document describes the repository implementation. It does **not** claim
that the collector is deployed, that Analytics Engine contains production
reports, or that CSP enforcement is authorized.

## Status

| Item                                | Status                                                            |
| ----------------------------------- | ----------------------------------------------------------------- |
| Collector code                      | Implemented on `feature/m9-csp-reporting-collector`               |
| Endpoint                            | `POST /__csp-report`                                              |
| Storage binding                     | `CSP_REPORTS` → Analytics Engine dataset `appkitx_csp_reports`    |
| CSP integration                     | `report-uri /__csp-report` in the report-only policy              |
| CSP enforcement                     | Not enabled and not authorized                                    |
| Production deployment               | Not performed                                                     |
| Durable production storage verified | No; requires a deployment and an Analytics Engine read credential |
| Cloudflare rate-limit rule          | Not configured; recommended rule documented below                 |
| Real-user violation evidence        | Not yet available; the report-only soak has not started           |

The local `wrangler dev` Analytics Engine binding exists but is a no-op. Local
and Playwright runs verify endpoint behavior and browser delivery, not durable
storage.

## Architecture and data flow

```text
Browser
  │  CSP report-only violation
  ▼
POST /__csp-report                         (same origin)
  │  Content-Type: application/csp-report or application/reports+json
  ▼
src/worker.ts
  │  route before static assets; no read API
  ▼
src/lib/csp-report.ts
  │  method/origin/media-type checks
  │  bounded body read
  │  schema validation
  │  privacy normalization
  ▼
Analytics Engine
  appkitx_csp_reports
  │  one normalized row per accepted report
  ▼
Cloudflare SQL API (private, read-only token)
  │  aggregate by directive, disposition, blocked origin, path, browser family
  ▼
Operator review / future alerting
```

There is no public read endpoint, no dashboard shipped by the application, and
no server-side fetch of report URLs.

### Storage choice

Workers Analytics Engine was selected because it is native to the existing
Worker deployment, needs only a binding in `wrangler.jsonc`, creates the dataset
on first write, exposes aggregate SQL through a read-only account token, and
retains data for 90 days without a separate database provisioning step. It is
designed for bounded event fields rather than raw request storage.

Alternatives considered:

- **Workers Logs / Tail Workers** — useful for debugging, but logs are less
  suitable for bounded aggregate review and may retain request metadata.
- **D1** — requires a separately created database, schema migration, and query
  API, with more operational surface than this diagnostic needs.
- **KV** — not designed for append-only event counts or SQL aggregation.
- **External reporting service** — adds a third-party data processor and a new
  dependency, which this milestone avoids.

Analytics Engine is an operational diagnostic store, not a compliance archive.
Its 90-day retention is explicit and its access is account-scoped.

## Endpoint contract

### Request

- Method: `POST` only. Other methods return `405` with `Allow: POST`.
- Path: `/__csp-report`.
- Content types:
  - `application/csp-report` — legacy CSP report wrapper, WebKit's hybrid
    `{ "type": "csp-violation", "url": "...", "csp-report": { ... } }` object,
    or a single Reporting API object with a `body` member.
  - `application/reports+json` — Reporting API array of report objects.
- Charset parameters are accepted; the media type is compared without
  parameters.
- Same-origin requests are expected. The endpoint has no CORS headers and is not
  a cross-origin ingestion service.

### Response

| Status | Meaning                                                                 |
| ------ | ----------------------------------------------------------------------- |
| `204`  | At least one valid report was accepted. No body is returned.            |
| `400`  | Empty body, invalid JSON, unsupported report shape, or no valid report. |
| `403`  | A non-null, non-same-origin `Origin` header was supplied.               |
| `405`  | Method other than `POST`. `Allow: POST` is returned.                    |
| `413`  | Body over 32 KiB or more than 20 reports in one batch.                  |
| `415`  | Media type other than the two accepted CSP report types.                |
| `503`  | The `CSP_REPORTS` binding is absent. `Retry-After: 3600` is returned.   |

Accepted and error responses include `Cache-Control: no-store` and
`X-Content-Type-Options: nosniff`. Errors never reflect the submitted payload or
include storage details. A storage write failure is acknowledged with `204` to
avoid browser retry storms; it is logged only as `csp_report_storage_failed` and
must be detected through Workers Logs or a missing aggregate row.

### Limits

| Limit                   | Value       | Rationale                                                               |
| ----------------------- | ----------- | ----------------------------------------------------------------------- |
| Request body            | 32 KiB      | A 20-report batch with full policy text stays below this in practice.   |
| Reports per request     | 20          | Bounds parsing and storage writes; normal CSP batches are much smaller. |
| Document path           | 128 chars   | Route-level diagnostics without unbounded path cardinality.             |
| Blocked origin/category | 64 chars    | Origin only; never the full blocked URL.                                |
| Directive               | 64 chars    | Mapped to an allowlist; unknown values become `unknown`.                |
| URL parsed              | 2,048 chars | Rejects pathological inputs before URL parsing.                         |

`Content-Length` over the limit is rejected before the body is read. Chunked or
missing-length bodies are read through a stream reader that cancels once the
limit is exceeded.

## Stored schema

Analytics Engine columns are positional. The repository writes:

| Column    | Value                                                                  |
| --------- | ---------------------------------------------------------------------- |
| `index1`  | `csp-report` (sampling key; not a visitor identifier)                  |
| `blob1`   | `effectiveDirective`, normalized to a known CSP directive or `unknown` |
| `blob2`   | `violatedDirective`, first token only, normalized the same way         |
| `blob3`   | `disposition`: `report`, `enforce`, or `unknown`                       |
| `blob4`   | `blockedOrigin`: origin, `inline`, `eval`, `data`, `blob`, `self`, …   |
| `blob5`   | `documentPath`: pathname only, query and fragment removed              |
| `blob6`   | `browserFamily`: `chromium`, `firefox`, `webkit`, `other`, `unknown`   |
| `blob7`   | `v1` schema version                                                    |
| `double1` | `1` per accepted report (count for `SUM`)                              |
| timestamp | Analytics Engine ingestion time                                        |

Analytics Engine retains data for **90 days**. It is an operational diagnostic
store, not a compliance archive.

## Retained, normalized, and discarded data

### Retained

- Effective and violated directive names.
- Disposition.
- Blocked resource origin or a fixed keyword/scheme category.
- Normalized document path.
- Coarse browser family derived from the collector request's `User-Agent`.
- A count of `1` and the Analytics Engine timestamp.
- Schema version.

### Transformed

- Directive values are reduced to the first token and mapped to an allowlist.
- Document URLs become pathnames; query strings and fragments are removed.
- Blocked URLs become origins or fixed categories; paths, queries, and fragments
  are removed.
- Paths are length-bounded and non-route characters are replaced with `_`.
- Browser strings become one of five coarse families.
- Unknown fields are ignored.

### Discarded

- Raw report bodies.
- `original-policy` and any policy text beyond the directive name.
- `script-sample` / `sample`.
- `source-file`, `line-number`, `column-number`, `status-code`.
- `referrer`.
- Full document and blocked URLs.
- Full `User-Agent` strings.
- Request IP addresses, cookies, authorization headers, and other request
  metadata.
- Reporting API `age`, `user_agent`, and envelope `url` beyond the document URL
  fallback.
- Any unexpected or unrecognized field.

No raw report body is logged. Storage failures log only the fixed token
`csp_report_storage_failed`. Cloudflare Workers Logs may capture request
metadata independently of this collector; log retention and access are a separate
Cloudflare account setting and are not configured by this repository.

### Cardinality and privacy notes

- There is no visitor, session, IP, or device identifier. The Analytics Engine
  `index1` value is constant.
- Rows are event-level normalized records without a user identifier; operational
  review is aggregate. This is a deliberate trade-off for route-level
  diagnostics, not a claim that the rows are anonymous in every possible
  correlation model.
- `documentPath` is route-level. Do not reuse this collector for a site with
  sensitive path segments without adding an allowlist or dropping the path.
- The coarse browser family is derived from the report request, not persisted
  from the report body.
- Analytics Engine sampling and ingestion timestamps can still support
  approximate time correlation. This is an operational trade-off, not an
  anonymity guarantee.
- The collector does not change Cloudflare Web Analytics/RUM. It is a separate
  data path.

## Abuse resistance

Implemented in the Worker:

- POST only.
- Media-type allowlist.
- 32 KiB body limit and 20-report batch limit.
- Strict top-level shape validation; unknown fields are discarded.
- Bounded string lengths and enum-like normalization.
- No server-side URL fetching.
- No generic JSON ingestion.
- No reflection of payloads or internal errors.
- Same-origin `Origin` check, with `Origin: null` accepted for WebKit's reporting
  request when `Sec-Fetch-Site` is `same-origin` or absent.

The `Origin` check is **not** an authentication boundary. Requests without an
`Origin` header and WebKit's `Origin: null` are accepted, and the endpoint is
intentionally unauthenticated so browsers can deliver reports. Rate limiting and
WAF protection must be enforced by Cloudflare, not by relying on `Origin`.

### Recommended Cloudflare rate-limit rule

Not active in this repository. An authorized operator should add a rule with:

- Expression:
  `http.request.method eq "POST" and http.request.uri.path eq "/__csp-report"`
- Counting characteristic: client IP.
- Rate: 60 requests per minute.
- Action: block for 10 minutes with a `429` response.
- Scope: `appkitx.com` only.

Tune only after observing real traffic. A CSP report endpoint that is too
aggressive can discard legitimate reports during a browser-specific incident.
Ensure WAF, bot-fight, or managed-challenge rules do not challenge
`/__csp-report`; report POSTs cannot complete an interactive challenge.

## CSP integration

Current report-only policy tail:

```text
...; worker-src 'none'; report-uri /__csp-report
```

`report-uri` is relative, so it resolves against the document URL and works in
local previews, preview deployments, and production without generating a
different header per environment.

### Why `report-to` is not emitted

`report-to` and `Reporting-Endpoints` were implemented and tested, then removed
from the emitted policy. Browser evidence on 2026-10-30:

| Engine       | `report-uri` only                         | `report-to` + `Reporting-Endpoints`         |
| ------------ | ----------------------------------------- | ------------------------------------------- |
| Chromium 156 | Delivered `application/csp-report`, `204` | Violation generated; no report delivered    |
| Firefox 157  | Delivered `application/csp-report`, `204` | Delivered `application/reports+json`, `204` |
| WebKit 27.2  | Delivered hybrid `csp-report`, `204`      | Delivered, but with a non-matching origin   |

Chromium has a known CSP `report-to` delivery problem (Chromium issue 40702166
and related reports). When `report-to` is present, Chromium prefers it over
`report-uri` and does not fall back. Emitting both therefore loses Chromium
reports entirely. `report-uri` remains supported by all three current engines
and is the only mechanism that delivered consistently in this test matrix.

The endpoint still accepts `application/reports+json` for forward compatibility
and for browsers or tooling that submit that format directly. `report-uri` is
deprecated in the CSP specification but remains the reliable delivery mechanism
for this application at this time. Revisit `report-to` only after verifying
delivery in the actual Chromium version used by production visitors.

### Browser delivery matrix

Verified by `e2e/csp-reporting.spec.ts` against the local Worker with an actual
report-only violation:

| Engine   | Version      | Request content type     | Observed shape                                       | Result |
| -------- | ------------ | ------------------------ | ---------------------------------------------------- | ------ |
| Chromium | 156.0.8078.4 | `application/csp-report` | `{ "csp-report": { ... } }`                          | `204`  |
| Firefox  | 157.0        | `application/csp-report` | `{ "csp-report": { ... } }`                          | `204`  |
| WebKit   | 27.2         | `application/csp-report` | `{ "type": ..., "url": ..., "csp-report": { ... } }` | `204`  |

WebKit sends `Origin: null` on its same-origin report request. The endpoint
accepts it; the request is still same-origin at the network level.

## Local development and tests

- `wrangler dev --local` exposes `CSP_REPORTS` as an Analytics Engine binding
  whose `writeDataPoint` is a local no-op. The endpoint returns `204`, but no
  local rows are stored.
- `tests/csp-report.test.ts` uses an in-memory sink to verify parsing,
  normalization, limits, failure behavior, and the exact Analytics Engine
  write shape.
- `e2e/csp-reporting.spec.ts` verifies the endpoint contract and actual browser
  delivery in Chromium, Firefox, and WebKit.
- `e2e/csp.spec.ts` verifies the report-only header, hashes, RUM allowances, and
  absence of an enforcing CSP.

Run:

```bash
npm test
npm run check
npm run build
npx playwright test e2e/csp.spec.ts e2e/csp-reporting.spec.ts
```

## Deployment and verification

The repository changes are:

1. `wrangler.jsonc`: add the `CSP_REPORTS` Analytics Engine binding and include
   `/__csp-report` in `run_worker_first`.
2. `src/worker.ts`: route `POST /__csp-report` before the static-assets fallback.
3. `src/lib/csp-report.ts`: endpoint logic and normalized storage adapter.
4. `src/lib/csp-report-only.ts`: add `report-uri /__csp-report` to the generated
   report-only policy.
5. Tests and documentation.

Deployment remains an operator action. The Analytics Engine dataset is created
automatically on the first write; no dashboard dataset creation is required. The
account must have Analytics Engine available for the Worker.

### Post-deployment verification

1. Confirm the Worker Version ID and active deployment through the deployment
   runbook.
2. Confirm `Content-Security-Policy-Report-Only` contains
   `report-uri /__csp-report` and still has no enforcing header.
3. Confirm the endpoint rejects a `GET` with `405` and accepts a synthetic
   legacy report with `204`. Do not use a real visitor report as a test payload.
4. Trigger a deliberate unlisted inline script in a browser and confirm a `POST
/__csp-report` with a `204` response.
5. Confirm rows appear in Analytics Engine:

```bash
curl -sS \
  -H "Authorization: Bearer $CLOUDFLARE_ANALYTICS_READ_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/analytics_engine/sql" \
  --data "SELECT blob1 AS directive, blob3 AS disposition, blob4 AS blocked, blob5 AS path, blob6 AS browser, SUM(_sample_interval * double1) AS reports FROM appkitx_csp_reports WHERE timestamp > NOW() - INTERVAL '1' HOUR GROUP BY directive, disposition, blocked, path, browser ORDER BY reports DESC LIMIT 50"
```

If the dataset does not exist, the query fails; a successful write after
deployment should create it. If the query succeeds but returns no rows, check the
binding, the deployment time, and the time window.

## Aggregate review queries

Daily directive summary:

```sql
SELECT
  blob1 AS directive,
  blob3 AS disposition,
  SUM(_sample_interval * double1) AS reports
FROM appkitx_csp_reports
WHERE timestamp > NOW() - INTERVAL '1' DAY
GROUP BY directive, disposition
ORDER BY reports DESC
```

Unexpected blocked origins:

```sql
SELECT
  blob4 AS blocked,
  blob1 AS directive,
  SUM(_sample_interval * double1) AS reports
FROM appkitx_csp_reports
WHERE timestamp > NOW() - INTERVAL '7' DAY
  AND blob4 NOT IN ('inline', 'self', 'data', 'blob', 'eval', 'wasm-eval')
GROUP BY blocked, directive
ORDER BY reports DESC
LIMIT 50
```

Route and browser distribution:

```sql
SELECT
  blob5 AS path,
  blob6 AS browser,
  SUM(_sample_interval * double1) AS reports
FROM appkitx_csp_reports
WHERE timestamp > NOW() - INTERVAL '7' DAY
GROUP BY path, browser
ORDER BY reports DESC
LIMIT 100
```

## Access control and retention

- Create a Cloudflare API token with **Account Analytics Read** only. Do not use
  a token with Workers edit or deploy permissions for queries.
- Keep the token outside the repository and outside any client-side code.
- The Analytics Engine dataset is private to the account. There is no public read
  API in this repository.
- Data expires after 90 days. Export only aggregated results if a longer
  operational record is required; do not export raw rows without a privacy
  review.
- Grant dashboard access only to operators who need CSP diagnostics.

## Disabling reporting safely

Reporting can be disabled without enabling CSP enforcement:

1. Remove `report-uri /__csp-report` from the policy builder in
   `src/lib/csp-report-only.ts`.
2. Run `npm test`, `npm run build`, and the CSP Playwright suite.
3. Deploy the resulting report-only policy through the normal deployment
   process.
4. Verify the response still has `Content-Security-Policy-Report-Only`, no
   `Content-Security-Policy`, and no `report-uri`.
5. Leave the endpoint deployed or remove it in a separate change. An endpoint
   with no reports is harmless but should not be advertised.

Do not remove the report-only header merely to stop reporting: that changes the
security posture and discards the policy evidence.

## Rollback

- Roll back to the immediate pre-collector Worker Version using the explicit
  Version ID procedure in [DEPLOYMENT-RUNBOOK.md](./DEPLOYMENT-RUNBOOK.md).
- A rollback removes the endpoint and the `report-uri` directive together,
  because both are in the same deployment artifact.
- After rollback, verify the report-only header, hashes, RUM allowances, 404
  behavior, and the absence of an enforcing CSP.
- Analytics Engine rows already written remain until their 90-day retention
  expires. Rolling back the Worker does not delete them.

## Troubleshooting

| Symptom                  | Check                                                                                                                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `405`                    | The caller is not using POST.                                                                                                                            |
| `415`                    | Content type is not `application/csp-report` or `application/reports+json`.                                                                              |
| `400`                    | Empty/invalid JSON, no valid report, or unsupported shape.                                                                                               |
| `413`                    | Body over 32 KiB or batch over 20 reports.                                                                                                               |
| `403`                    | Cross-origin `Origin` header. Same-origin and `null` are accepted.                                                                                       |
| `503`                    | `CSP_REPORTS` binding missing from the deployed Worker.                                                                                                  |
| `204` but no rows        | Local Miniflare no-op, missing deploy, wrong dataset/time window, or Analytics Engine write failure. Check Workers Logs for `csp_report_storage_failed`. |
| Browser sends no request | Check the report-only header contains `report-uri /__csp-report`; check the browser network panel; confirm the page was served by the new Version.       |
| Chromium sends no report | Confirm `report-to` is absent. Chromium drops reports when `report-to` is present.                                                                       |
| WebKit request rejected  | Confirm `Origin: null` is accepted and the hybrid `csp-report` shape is parsed.                                                                          |

## Known limitations

- `report-uri` is deprecated, although all three current engines still support
  it.
- Chromium's `report-to` delivery is unreliable; the collector deliberately does
  not advertise it.
- WebKit's reporting request uses `Origin: null` and a non-standard hybrid
  payload; both are handled explicitly.
- The Worker does not implement durable rate limiting. Cloudflare-side rate
  limiting is required before production exposure.
- No alerting or dashboard is included. Aggregate queries are manual until an
  operator adds monitoring.
- Local Analytics Engine writes are no-ops, so local tests cannot prove durable
  storage.
- Production delivery and storage have not been verified because this milestone
  does not deploy.
- CSP enforcement remains unauthorized and unchanged.
