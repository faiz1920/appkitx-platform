# Product Identity Human Review & Matching Quality (M10.11)

Status: **planning proposal only — not implemented**. No schema, registry,
matching, catalogue, provider or production change is included.

## 1. Purpose

M10.10 merged 50 manufacturer-source-verified identities. All 50 are
`humanReview: "not-reviewed"`, and matching eligibility is based on source
verification rather than human approval.

M10.11 should add a real human-review workflow and lock the matching confidence
contract with regression fixtures. It must not silently change which records can
produce a verified match.

## 2. Current baseline

| Metric                            |                                                                                                       Value |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------: |
| Catalogue components              |                                                                                                         101 |
| Source-verified records           |                                                                                                          50 |
| Human-reviewed records            |                                                                                                           0 |
| Awaiting human review             |                                                                                                          50 |
| Records with MPN                  |                                                                                                          46 |
| Records with GTIN                 |                                                                                                           9 |
| Records with both                 |                                                                                                           5 |
| Duplicate MPNs / GTINs / mappings |                                                                                                   0 / 0 / 0 |
| Coverage by category              | CPU 14/16, PSU 6/9, case 6/11, RAM 7/10, cooler 7/11, storage 4/9, case fan 6/7, GPU 0/15, motherboard 0/13 |

Known deferred work carried into this milestone:

- GPU identities: no manufacturer MPN/GTIN for reference/Founders Edition
  variants.
- Motherboard identities: manufacturer pages expose model names only or block
  automated access.
- AMD Ryzen 7 5800X3D and Ryzen 7 7700: boxed OPNs differ from the catalogue
  model.
- Seasonic FOCUS GX-550 and MSI PSUs: exact identifier not retrievable.
- NZXT H510, Cooler Master NR200, Lian Li Lancool 216, Fractal North and
  Meshify 2 Compact: generic catalogue names cannot be mapped to one exact SKU.
- Corsair PSUs: only North American `-NA` variants are recorded.

## 3. Review states and transitions

Proposed review states:

```text
not-reviewed
  → reviewed            exact evidence approved by a named human
  → needs-correction    identifier or evidence is wrong/incomplete
  → rejected            record is unsafe and must not match
```

Allowed transitions:

| From               | To                 | Condition                                                                             |
| ------------------ | ------------------ | ------------------------------------------------------------------------------------- |
| `not-reviewed`     | `reviewed`         | Source re-opened; exact identifier confirmed; reviewer, date and fingerprint recorded |
| `not-reviewed`     | `needs-correction` | Wrong/missing identifier or unavailable source                                        |
| `not-reviewed`     | `rejected`         | Identity cannot be used safely                                                        |
| `needs-correction` | `reviewed`         | Corrected evidence recorded and revalidated                                           |
| `needs-correction` | `rejected`         | Correction not possible                                                               |
| `reviewed`         | `not-reviewed`     | Any evidence field changes, invalidating the fingerprint                              |
| `reviewed`         | `needs-correction` | Revalidation finds a discrepancy                                                      |
| `reviewed`         | `rejected`         | Review finds the record unsafe                                                        |

Rules:

- `rejected` and `needs-correction` never project into
  `CatalogueProductIdentity`, even when an MPN or GTIN is present.
- `reviewed` requires a named reviewer, review timestamp, fingerprint and notes.
- `not-reviewed` cannot name a reviewer or carry a review timestamp.
- A human review cannot upgrade a `provisional` source record.
- Review state never overrides duplicate or conflict validation.

## 4. Reviewer identity and audit trail

- `reviewer` is a named individual. Shared accounts, team names, role labels and
  agent identifiers are rejected.
- `sourceVerification.verifiedBy` remains the process/person that performed
  source verification; it can never satisfy `humanReview.reviewer`.
- Each review records:
  - reviewer name,
  - ISO 8601 UTC review timestamp,
  - decision (`reviewed`, `needs-correction`, `rejected`),
  - notes describing what was checked,
  - the source URL re-opened,
  - a deterministic evidence fingerprint.
- The git commit and PR provide the secondary audit trail: who changed which
  record and when.
- Reviewer identity is declarative, not cryptographically authenticated. This
  limitation must be stated in the registry documentation and the audit output.

## 5. Evidence fingerprint and invalidation

The fingerprint is a deterministic hash over the identity-bearing fields:

```text
componentId
manufacturer
model
manufacturerPartNumber
gtin
region
source.type
source.url
source.accessedAt
```

Rules:

- A review stores the fingerprint it approved.
- Validation recomputes the fingerprint and marks the review invalid when it
  differs.
- An invalid review is reported separately from “never reviewed”.
- Updating `source.accessedAt` during revalidation intentionally invalidates the
  prior review; the reviewer must re-approve the record.
- Corrections must record a reason and must not silently overwrite an existing
  identifier.

## 6. Evidence revalidation and correction handling

- Review must re-open the manufacturer source. Remembered or cached identifiers
  are not sufficient.
- If the source is unavailable, the record moves to `needs-correction`; it must
  not remain `reviewed`.
- Corrections update the identifier, source access time, verification time and
  notes, then reset `humanReview` to `not-reviewed`.
- The existing 365-day stale-evidence rule remains. Stale source verification
  and stale human review are audited separately.
- Correction handling must preserve the previous decision in the review log or
  git history; the current registry stores only the latest state.

## 7. Duplicate and conflict resolution

- The validator remains authoritative and fails closed on:
  - duplicate manufacturer/MPN pairs,
  - duplicate GTINs,
  - duplicate component mappings,
  - manufacturer/model mismatches.
- Human review cannot waive these failures.
- Resolution options:
  1. Correct the wrong identifier with new manufacturer evidence.
  2. Split regional or variant identities only after schema approval.
  3. Reject or defer the record.
- No “pick one” resolution, no automatic merging of regions, colours, revisions
  or board-partner variants.

## 8. Matching confidence and regression testing

The current contract stays unchanged:

| Evidence                             | Result       |
| ------------------------------------ | ------------ |
| Exact MPN + manufacturer             | `verified`   |
| Exact GTIN + category + manufacturer | `verified`   |
| Exact model + manufacturer           | `probable`   |
| Title similarity only                | `unverified` |
| Regional mismatch                    | rejected     |
| Duplicate/ambiguous identity         | rejected     |

Proposed regression fixtures:

- exact MPN match for CPU, PSU and case,
- exact GTIN match for NZXT H7 Flow,
- model-only match remaining `probable`,
- title-only match remaining `unverified`,
- US PSU identity vs `DE` provider region → rejected,
- duplicate MPN and duplicate GTIN → validation failure,
- wrong manufacturer/model → validation failure,
- provisional source record → never promoted,
- `rejected` / `needs-correction` review state → never projected.

Additional tests:

- one-character MPN mutation must not verify,
- GTIN check-digit mutation must not verify,
- fingerprint change invalidates review,
- reviewer identity rejection cases,
- review state transition matrix.

Expected statuses and confidence values should be snapshotted. Any change
requires explicit approval.

## 9. Should human review affect matching eligibility?

**Recommendation: no, not in M10.11.**

Keep eligibility as:

```ts
sourceVerification.status === "source-verified";
```

Reasons:

- All 50 records are source-verified but unreviewed. Requiring review would
  immediately invalidate every verified match without new evidence.
- Source verification answers “does the manufacturer support this identifier?”
  Human review answers “has a named person approved it?” These are different
  controls.
- Coupling them would let a governance backlog silently degrade matching.
- Human review should become a production-activation gate once live provider
  integration is approved, not a per-record matching switch now.

M10.11 should add an explicit policy hook and audit fields so a later milestone
can require review without rewriting records:

```text
humanReviewRequiredForProduction: true | false
```

The flag is documentation/policy only in M10.11. It must not change matching.

## 10. Scope

In scope:

- Additive review-state schema and validation (subject to separate approval if a
  version bump is required).
- Evidence fingerprinting and invalidation.
- Review log and audit output.
- Human review of the existing 50 records, prioritised CPU → PSU → case → the
  remaining categories.
- Golden matching fixtures and mutation tests.
- Documentation of reviewer identity, limitations and correction handling.

Out of scope:

- Provider APIs, credentials, live prices, stock or affiliate links.
- Scraping, polling or currency conversion.
- Public PC Builder route, navigation or sitemap.
- CSP, security headers, Cloudflare, Wrangler or dependencies.
- Recommendation scoring or budget logic.
- Catalogue specification changes.
- Deletion of deferred or rejected records.

## 11. Acceptance criteria

- Schema and validation support reviewer, decision, timestamp, notes and
  fingerprint.
- Invalid combinations fail closed:
  - reviewed without reviewer/date/fingerprint,
  - not-reviewed naming a reviewer,
  - rejected/needs-correction projecting into matching,
  - fingerprint mismatch,
  - agent identifier used as a human reviewer.
- All 50 records are either reviewed or explicitly queued; zero invented
  reviewer names.
- Any evidence change invalidates review automatically.
- Duplicate and conflict rejection is unchanged.
- Golden fixtures preserve verified/probable/unverified behavior.
- Audit reports reviewed, awaiting, needs-correction, rejected, stale and
  invalidated counts.
- Full unit, pricing, PC Builder, production Playwright, catalogue, Astro,
  Prettier and build gates pass.
- Documentation states that review identity is declarative and that review does
  not gate matching in this milestone.

## 12. Decisions required before implementation

1. Approve (or reject) the additive review-state schema and whether it requires
   a schema version bump.
2. Approve the fingerprint field list and invalidation rule.
3. Confirm that human review does **not** gate matching in M10.11.
4. Confirm the reviewer-identity policy and how the declarative limitation is
   disclosed.
5. Prioritise the 50-record review order and name the reviewers.

## 13. Risks

- Review throughput: 50 records is material manual work.
- Fingerprint churn if `accessedAt` is refreshed casually.
- Reviewer identity cannot be cryptographically proven in a static repository.
- Pressure to let review override duplicate/conflict validation.
- Regional and multi-GTIN gaps may force a larger schema change later.
- A schema change could affect matching if it is not strictly additive.

## 14. Exclusions

- No implementation in this proposal.
- No live provider, affiliate or scraping integration.
- No public route or production configuration change.
- No schema v2 without separate approval.
- No fabricated reviewer identities or claims of human approval.
