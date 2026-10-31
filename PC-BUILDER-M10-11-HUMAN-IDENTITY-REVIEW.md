# Human Identity Review & Matching Quality (M10.11)

Status: implementation complete, **uncommitted for review**. No human review
decision was supplied for any record. All 50 source-verified identities remain
`not-reviewed`, and matching eligibility is unchanged.

## 1. Baseline

| Item                              |     Value |
| --------------------------------- | --------: |
| Catalogue components              |       101 |
| Source-verified records           |        50 |
| Human-reviewed records            |         0 |
| Awaiting human review             |        50 |
| Records with MPN                  |        46 |
| Records with GTIN                 |         9 |
| Records with both                 |         5 |
| Duplicate MPNs / GTINs / mappings | 0 / 0 / 0 |

The 50 records are the M10.9 and M10.10 identities. No registry record or
evidence field was changed by this milestone.

## 2. Schema compatibility decision

The registry remains at `schemaVersion: 1`.

The M10.11 review model was added as a **compatible additive extension**:

```ts
type HumanReviewStatus =
  | "not-reviewed"
  | "reviewed"
  | "needs-correction"
  | "rejected"
  | "needs-revalidation";

interface HumanReview {
  status: HumanReviewStatus;
  reviewer: string | null;
  reviewedAt: string | null;
  notes: string | null;
  sourceUrl?: string | null;
  evidenceFingerprint?: string | null;
  previousStatus?: HumanReviewStatus | null;
}
```

Why this does not require a version bump:

- No existing field was renamed, removed or reinterpreted.
- `reviewer`, `reviewedAt` and `notes` keep their existing meaning.
- The new fields are optional and are only meaningful for non-default states.
- All existing 50 records remain valid without modification.
- There is no stored data migration: the registry is a static, compiled file.

Compatibility impact:

- A consumer that pins the old two-state union must be updated to understand
  the four decision states. This repository has one such consumer (the
  validation/audit layer), which is updated in this milestone.
- A consumer that only reads `status === "reviewed"` continues to work, but
  should prefer `effectiveHumanReviewStatus()` so an invalidated review is not
  mistaken for a current approval.

If reviewers require strict enum versioning, a `schemaVersion: 2` migration can
be proposed separately. It is not required for correctness here and was not
implemented.

## 3. State model and transitions

| State                | Meaning                                                                                        | Matching effect |
| -------------------- | ---------------------------------------------------------------------------------------------- | --------------- |
| `not-reviewed`       | No named human has reviewed the current evidence.                                              | None            |
| `reviewed`           | A named human independently checked the exact manufacturer evidence and approved the identity. | None            |
| `needs-correction`   | A human found an identifier, model-association or provenance defect.                           | None            |
| `rejected`           | A human determined the identity is unsafe to use.                                              | None            |
| `needs-revalidation` | The evidence cannot currently be revalidated, or a prior review was invalidated.               | None            |

Allowed transitions:

| From                 | To                              | Condition                                                                                                |
| -------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `not-reviewed`       | `reviewed`                      | Source re-opened; exact identifier confirmed; reviewer, date, notes, source URL and fingerprint recorded |
| `not-reviewed`       | `needs-correction`              | A named human found a defect                                                                             |
| `not-reviewed`       | `rejected`                      | A named human determined the identity is unsafe                                                          |
| `not-reviewed`       | `needs-revalidation`            | Source unavailable or materially changed                                                                 |
| `needs-correction`   | `reviewed`                      | Corrected evidence recorded and revalidated                                                              |
| `needs-correction`   | `rejected`                      | Correction not possible                                                                                  |
| `needs-correction`   | `needs-revalidation`            | Evidence cannot currently be rechecked                                                                   |
| `reviewed`           | `needs-correction`              | Revalidation finds a defect                                                                              |
| `reviewed`           | `rejected`                      | Revalidation finds the identity unsafe                                                                   |
| `reviewed`           | `needs-revalidation`            | Source unavailable or fingerprint invalidated                                                            |
| `rejected`           | `needs-revalidation`            | Evidence changed and the rejection may no longer apply                                                   |
| `needs-revalidation` | `reviewed`                      | Evidence rechecked and approved                                                                          |
| `needs-revalidation` | `needs-correction` / `rejected` | Recheck finds a defect or unsafe identity                                                                |

Rules enforced by validation:

- `not-reviewed` cannot set reviewer, review time, source URL, fingerprint or
  previous status.
- Every decision state requires a named reviewer, review timestamp, notes,
  source URL and fingerprint.
- `reviewed` and `needs-revalidation` must recheck the exact source URL on the
  record. `needs-correction` and `rejected` may cite a different HTTPS source
  that demonstrates the defect.
- Review time cannot precede source access or source verification, and cannot
  be in the future.
- The reviewer cannot be the source-verification identity (`opencode-…`).
- `previousStatus`, when present, must be a valid state and must differ from the
  current state.

## 4. Reviewer identity and audit trail

Each decision records:

- named reviewer,
- ISO 8601 UTC timestamp,
- decision (`status`),
- review notes,
- source URL rechecked,
- 16-character evidence fingerprint,
- optional previous state.

The reviewer field is a named person. Process and automation identifiers stay in
`sourceVerification.verifiedBy`; validation rejects the source-verification
identity and `opencode-` identifiers in `humanReview.reviewer`.

The git commit/PR provides a secondary audit trail. Reviewer identity is
**declarative**: a static repository cannot cryptographically prove that the
named person made the decision. This limitation is not mitigated by the
fingerprint. A future production workflow would need authenticated reviewer
accounts or signed review records.

No reviewer name, timestamp or approval was invented for the 50 records.

## 5. Evidence fingerprint and invalidation

Fingerprint input:

```text
componentId
manufacturer
model
manufacturerPartNumber (normalized)
gtin
region
source.url
source.accessedAt
```

The fingerprint is a deterministic 64-bit FNV-1a hash rendered as 16 lowercase
hexadecimal characters. It is an **integrity fingerprint, not a cryptographic
signature**. Formatting-only fields — source name, verification notes, review
notes, review timestamp and reviewer — are deliberately excluded.

Behavior:

- `isHumanReviewCurrent(record)` recomputes the fingerprint and compares it with
  the stored value.
- A mismatch means the review no longer applies.
- `effectiveHumanReviewStatus(record)` returns `needs-revalidation` for any
  invalidated decision, including `reviewed`, `needs-correction` and `rejected`.
- Audit and queue output count invalidated reviews separately and never count
  them as `reviewed`.
- Structural invalid combinations fail registry validation. A fingerprint
  mismatch is reported as an invalidated review rather than a hard validation
  failure, so the audit can show the exact records that need revalidation
  without discarding the whole registry.
- Any future UI or report must use `effectiveHumanReviewStatus()`, not the
  stored `status`, when displaying approval.

## 6. Evidence revalidation and source outages

- A reviewer must re-open the manufacturer source; a remembered identifier is
  not sufficient.
- `needs-revalidation` means “cannot currently be revalidated”, not “wrong”.
- A source outage must not be recorded as `needs-correction` or `rejected`.
  Those states require an actual identifier, association or provenance defect.
- Corrections update the source access time and verification time, which
  invalidates the prior review automatically.
- The existing 365-day stale-evidence rule remains. Stale source verification
  and stale human review are reported separately.
- Invalidated reviews are not counted as stale reviews; they are counted as
  invalidated and effective `needs-revalidation`.

## 7. Matching eligibility policy

Matching is unchanged:

| Evidence                             | Result       |
| ------------------------------------ | ------------ |
| Exact MPN + manufacturer             | `verified`   |
| Exact GTIN + category + manufacturer | `verified`   |
| Exact model + manufacturer           | `probable`   |
| Title similarity only                | `unverified` |
| Regional mismatch                    | rejected     |
| Duplicate or ambiguous identity      | rejected     |

Human review does **not** upgrade or downgrade matching in M10.11. A
`reviewed`, `needs-correction`, `rejected` or `needs-revalidation` record
projects the same identity as a `not-reviewed` record because projection only
reads `sourceVerification.status`.

Mutation coverage added by M10.11:

| Mutation                         | Expected result                                                     |
| -------------------------------- | ------------------------------------------------------------------- |
| One-character MPN change         | Not verified                                                        |
| Wrong manufacturer               | Not verified                                                        |
| Wrong region                     | Rejected                                                            |
| Missing category with exact MPN  | Verified at 100 (MPN is category-independent)                       |
| Missing category with exact GTIN | Verified at 97 (pre-existing category-agnostic fallback, unchanged) |
| Changed source URL               | Review invalidated; matching unchanged                              |
| Changed source access timestamp  | Review invalidated; matching unchanged                              |

The policy hook exists but is not wired into matching:

```ts
export const HUMAN_REVIEW_REQUIRED_FOR_PRODUCTION = false;
```

Activating review as a production gate is a separate decision. It would require
a deliberate change to projection/matching, migration planning for any
unreviewed records, and separate approval.

## 8. Review queue

Priority: CPU, PSU, case, RAM, cooler, storage, case fan. GPU and motherboard
have no source-verified records and therefore do not appear.

Queue totals: **50** — CPU 14, PSU 6, case 6, RAM 7, cooler 7, storage 4, case
fan 6. Every entry is `not-reviewed`; the queue does not approve anything.

The reproducible queue is produced by:

```bash
npx esbuild scripts/review-pc-pricing-identities.ts \
  --bundle --platform=node --format=esm --outfile=/tmp/pc-identity-review.mjs
node /tmp/pc-identity-review.mjs
```

|   # | Category | Component                                     | Identity                         | MPN                      | GTIN            | Region | Verified   | Status       | Concerns                                           |
| --: | -------- | --------------------------------------------- | -------------------------------- | ------------------------ | --------------- | ------ | ---------- | ------------ | -------------------------------------------------- |
|   1 | cpu      | `cpu-amd-ryzen-5-5600`                        | AMD 100-100000927BOX             | `100-100000927BOX`       | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|   2 | cpu      | `cpu-amd-ryzen-5-7600`                        | AMD 100-100001015BOX             | `100-100001015BOX`       | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|   3 | cpu      | `cpu-amd-ryzen-7-5700x`                       | AMD 100-100000926WOF             | `100-100000926WOF`       | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|   4 | cpu      | `cpu-amd-ryzen-7-7800x3d`                     | AMD 100-100000910WOF             | `100-100000910WOF`       | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|   5 | cpu      | `cpu-amd-ryzen-9-5950x`                       | AMD 100-100000059WOF             | `100-100000059WOF`       | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|   6 | cpu      | `cpu-amd-ryzen-9-7900x`                       | AMD 100-100000589WOF             | `100-100000589WOF`       | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|   7 | cpu      | `cpu-amd-ryzen-9-7950x`                       | AMD 100-100000514WOF             | `100-100000514WOF`       | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|   8 | cpu      | `cpu-intel-core-i5-12400f`                    | Intel BX8071512400F              | `BX8071512400F`          | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|   9 | cpu      | `cpu-intel-core-i5-13600k`                    | Intel BX8071513600K              | `BX8071513600K`          | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  10 | cpu      | `cpu-intel-core-i5-14600k`                    | Intel BX8071514600K              | `BX8071514600K`          | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  11 | cpu      | `cpu-intel-core-i7-13700k`                    | Intel BX8071513700K              | `BX8071513700K`          | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  12 | cpu      | `cpu-intel-core-i9-13900k`                    | Intel BX8071513900K              | `BX8071513900K`          | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  13 | cpu      | `cpu-intel-core-i9-14900k`                    | Intel BX8071514900K              | `BX8071514900K`          | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  14 | cpu      | `cpu-intel-core-ultra-7-265k`                 | Intel BX80768265K                | `BX80768265K`            | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  15 | psu      | `psu-corsair-cv650`                           | Corsair CP-9020211               | `CP-9020211-NA`          | `—`             | US     | 2026-10-31 | not-reviewed | Regional identity limited to US. No GTIN evidence. |
|  16 | psu      | `psu-corsair-cx550`                           | Corsair CP-9020277               | `CP-9020277-NA`          | `—`             | US     | 2026-10-31 | not-reviewed | Regional identity limited to US. No GTIN evidence. |
|  17 | psu      | `psu-corsair-rm1000x-2021`                    | Corsair CP-9020201               | `CP-9020201-NA`          | `—`             | US     | 2026-10-31 | not-reviewed | Regional identity limited to US. No GTIN evidence. |
|  18 | psu      | `psu-corsair-rm750x-2021`                     | Corsair CP-9020199               | `CP-9020199-NA`          | `—`             | US     | 2026-10-31 | not-reviewed | Regional identity limited to US. No GTIN evidence. |
|  19 | psu      | `psu-corsair-rm850e-2023`                     | Corsair CP-9020263               | `CP-9020263-NA`          | `—`             | US     | 2026-10-31 | not-reviewed | Regional identity limited to US. No GTIN evidence. |
|  20 | psu      | `psu-corsair-sf600`                           | Corsair CP-9020182               | `CP-9020182-NA`          | `—`             | US     | 2026-10-31 | not-reviewed | Regional identity limited to US. No GTIN evidence. |
|  21 | case     | `case-cooler-master-masterbox-q300l`          | Cooler Master MCB-Q300L-KANN-S00 | `MCB-Q300L-KANN-S00`     | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  22 | case     | `case-corsair-4000d-airflow`                  | Corsair CC-9011200-WW            | `CC-9011200-WW`          | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  23 | case     | `case-corsair-5000d-airflow`                  | Corsair CC-9011210-WW            | `CC-9011210-WW`          | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  24 | case     | `case-corsair-7000d-airflow`                  | Corsair CC-9011218-WW            | `CC-9011218-WW`          | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  25 | case     | `case-lian-li-o11-dynamic-evo`                | Lian Li O11DEX                   | `O11DEX`                 | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  26 | case     | `case-nzxt-h7-flow`                           | NZXT CM-H72FB-01                 | `CM-H72FB-01`            | `5056547205502` | —      | 2026-10-31 | not-reviewed | —                                                  |
|  27 | ram      | `ram-corsair-vengeance-32gb-ddr5-6000`        | Corsair CMK32GX5M2B6000C30       | `CMK32GX5M2B6000C30`     | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  28 | ram      | `ram-corsair-vengeance-64gb-ddr5-5600`        | Corsair CMK64GX5M2B5600C40       | `CMK64GX5M2B5600C40`     | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  29 | ram      | `ram-corsair-vengeance-lpx-16gb-ddr4-3200`    | Corsair CMK16GX4M2B3200C16       | `CMK16GX4M2B3200C16`     | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  30 | ram      | `ram-corsair-vengeance-lpx-32gb-ddr4-3200`    | Corsair CMK32GX4M4B3200C16       | `CMK32GX4M4B3200C16`     | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  31 | ram      | `ram-gskill-flare-x5-32gb-ddr5-6000`          | G.SKILL F5-6000J3038F16GX2-FX5   | `F5-6000J3038F16GX2-FX5` | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  32 | ram      | `ram-gskill-ripjaws-v-16gb-ddr4-3200`         | G.SKILL F4-3200C16D-16GVKB       | `F4-3200C16D-16GVKB`     | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  33 | ram      | `ram-gskill-ripjaws-v-32gb-ddr4-3600`         | G.SKILL F4-3600C18D-32GVK        | `F4-3600C18D-32GVK`      | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  34 | cooler   | `cooler-arctic-freezer-36`                    | ARCTIC ACFRE00123A               | `ACFRE00123A`            | `4895213704144` | —      | 2026-10-31 | not-reviewed | —                                                  |
|  35 | cooler   | `cooler-arctic-liquid-freezer-iii-280`        | ARCTIC ACFRE00135A               | `ACFRE00135A`            | `4895213704472` | —      | 2026-10-31 | not-reviewed | —                                                  |
|  36 | cooler   | `cooler-be-quiet-dark-rock-pro-4`             | be quiet! BK022                  | `BK022`                  | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  37 | cooler   | `cooler-corsair-icue-h100i-rgb-elite`         | Corsair iCUE H100i RGB ELITE     | `CW-9060058-WW`          | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  38 | cooler   | `cooler-corsair-icue-h150i-elite-capellix-xt` | Corsair CW-9060070-WW            | `CW-9060070-WW`          | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  39 | cooler   | `cooler-corsair-icue-h60x-rgb-elite`          | Corsair CW-9060064-WW2           | `CW-9060064-WW2`         | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  40 | cooler   | `cooler-noctua-nh-u12s-redux`                 | Noctua NH-U12S redux             | `—`                      | `9010018000207` | —      | 2026-10-31 | not-reviewed | No MPN evidence.                                   |
|  41 | storage  | `storage-samsung-990-pro-1tb`                 | Samsung MZ-V9P1T0BW              | `MZ-V9P1T0BW`            | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  42 | storage  | `storage-seagate-barracuda-2tb`               | Seagate ST2000DM008              | `ST2000DM008`            | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  43 | storage  | `storage-seagate-ironwolf-4tb`                | Seagate ST4000VN006              | `ST4000VN006`            | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  44 | storage  | `storage-wd-black-sn850x-1tb`                 | Western Digital WDS100T2X0E      | `WDS100T2X0E`            | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  45 | case-fan | `case-fan-arctic-p12-pwm`                     | ARCTIC P12 PWM                   | `ACFAN00119A`            | `4895213701389` | —      | 2026-10-31 | not-reviewed | —                                                  |
|  46 | case-fan | `case-fan-arctic-p14-pwm`                     | ARCTIC ACFAN00124A               | `ACFAN00124A`            | `4895213701556` | —      | 2026-10-31 | not-reviewed | —                                                  |
|  47 | case-fan | `case-fan-corsair-af120-elite`                | Corsair AF120 ELITE              | `CO-9050141-WW`          | `—`             | —      | 2026-10-31 | not-reviewed | No GTIN evidence.                                  |
|  48 | case-fan | `case-fan-noctua-nf-a12x15-pwm`               | Noctua NF-A12x15 PWM             | `—`                      | `9010018100082` | —      | 2026-10-31 | not-reviewed | No MPN evidence.                                   |
|  49 | case-fan | `case-fan-noctua-nf-a12x25-pwm`               | Noctua NF-A12x25 PWM             | `—`                      | `9010018100396` | —      | 2026-10-31 | not-reviewed | No MPN evidence.                                   |
|  50 | case-fan | `case-fan-noctua-nf-a14-pwm`                  | Noctua NF-A14 PWM                | `—`                      | `4716123314981` | —      | 2026-10-31 | not-reviewed | No MPN evidence.                                   |

## 9. Audit output

The audit now reports:

- source-verified records,
- human-reviewed records (current fingerprint only),
- awaiting review,
- needs-correction,
- rejected,
- needs-revalidation,
- invalidated reviews,
- stale source verification and stale human review,
- duplicate MPN, duplicate GTIN and conflicting component records.

Current merged-registry audit:

```text
Registry records: 50
Source-verified records: 50
Human-reviewed records: 0
Awaiting human review: 50
Needs correction: 0
Rejected: 0
Needs revalidation: 0
Invalidated reviews: 0
Stale source verifications: 0
Stale human reviews: 0
Duplicate MPN records: 0
Duplicate GTIN records: 0
Conflicting component records: 0
```

Duplicate and conflict counts come from `auditIdentifierUniqueness()`. Registry
validation still fails closed before audit if any duplicate or conflict exists;
the helper exists so the audit can report the categories and so tests can prove
the counts without weakening validation.

## 10. Static-repository authentication limitation

The repository cannot prove that the named reviewer made the decision. It can
only record:

- what the reviewer claims to have checked,
- when,
- against which fingerprint,
- and which git commit introduced the change.

Anyone with write access can edit the registry. Production use should add
authenticated reviewer accounts, signed review records or a review service with
immutable audit storage. Until then, review status is governance metadata, not
a security control.

## 11. Future production activation

`HUMAN_REVIEW_REQUIRED_FOR_PRODUCTION` is `false` and is not read by matching.
Before activation:

1. Complete human review of the 50 records or explicitly accept unreviewed
   records in production.
2. Decide whether `rejected` / `needs-correction` records must be excluded from
   matching. M10.11 deliberately keeps matching purely source-verified.
3. Add authenticated reviewer identity and an immutable decision log.
4. Define the regression gate: any change to matching eligibility requires
   golden-fixture approval.
5. Re-run the full unit, pricing, browser, catalogue, Astro, Prettier and build
   gates.

## 12. Validation

| Gate                       | Result                                                |
| -------------------------- | ----------------------------------------------------- |
| Registry tests             | **32 passed**                                         |
| Full unit suite            | **776 passed / 43 files**                             |
| Pricing suite              | **137 passed / 9 files**                              |
| PC Builder Playwright      | **89 passed**                                         |
| Full production Playwright | **666 passed**                                        |
| Catalogue validation       | **OK** — 101 records / 23 manufacturers               |
| Identity audit             | **OK** — 50 source-verified, 0 reviewed, 0 duplicates |
| Review queue               | **50 entries**, priority order, all `not-reviewed`    |
| Astro check                | **0 errors, 0 warnings, 0 hints**                     |
| Prettier                   | **Clean**                                             |
| Production build           | **21 pages**, **6 CSP inline hashes**                 |

## 13. Unresolved issues

- All 50 records still await human review; no reviewer was available.
- Reviewer identity remains declarative.
- GPU and motherboard identities remain blocked on manufacturer evidence.
- Regional PSU identities remain US-only.
- Multi-region and multi-GTIN support still requires a schema decision.
- Stale-review behavior depends on `source.accessedAt` being updated only when
  evidence is genuinely rechecked.

## 14. Exclusions

- No provider API, credential, live price, stock or affiliate integration.
- No scraping, polling or currency conversion.
- No public PC Builder route, navigation or sitemap entry.
- No CSP, security-header, Cloudflare, Wrangler or dependency change.
- No recommendation-scoring or budget change.
- No registry schema v2.
- No fabricated reviewer identities or approvals.
