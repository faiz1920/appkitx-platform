# Provider-Independent Product Mapping Foundation (M10.12)

Status: implementation complete, **uncommitted for review**. No provider
integration, live request, price, stock, affiliate or deployment change was
made. All provider product data in this milestone is synthetic.

Baseline: `origin/main` at the time of work was
`4ace15c08e90126aa48922a85e81a9beb2a60523` (the M10.11 merge). The brief named
`4ace15c08e90126bc25bf9c0cbb35c8b18fd947d`, which does not exist in this
repository; the short prefix and the M10.11 baseline match. Work was performed
on `feature/m10-12-provider-mapping`.

## 1. Architecture

M10.12 adds an identity-mapping layer above the existing catalogue and pricing
contracts. It does not change compatibility rules, recommendations, budgets,
offer normalization or price aggregation.

```text
External provider product (untrusted)
            │
            ▼
┌───────────────────────────────────────────────┐
│ Provider product contract                     │
│ providerId, externalProductId, title,         │
│ manufacturer, MPN/model/GTIN + originals,     │
│ category, region, market, seller, variant,    │
│ lifecycle, supersession, provenance, times    │
└───────────────────────┬───────────────────────┘
                        │ validate + normalize
                        ▼
┌───────────────────────────────────────────────┐
│ M10.7 catalogue identity contract             │
│ CatalogueProductIdentity (optional M10.9/10/11│
│ verified identifier registry projection)      │
└───────────────────────┬───────────────────────┘
                        │ deterministic matching
                        ▼
┌───────────────────────────────────────────────┐
│ ProviderProductMatch                          │
│ candidate / needs-review / unverified /       │
│ rejected, evidence, confidence, reasons       │
└───────────────────────┬───────────────────────┘
                        │ automatic mapping (never verified)
                        ▼
┌───────────────────────────────────────────────┐
│ Provider mapping registry                     │
│ candidate | needs-review | rejected | verified│
│ evidence fingerprint + separate human review  │
└───────────────────────┬───────────────────────┘
                        │ policy gate
                        ▼
     Future pricing ingestion eligibility only
     (verified + current + active + in-production)
```

Key boundaries:

- **Catalogue remains authoritative** for component specifications and stable
  component ids.
- **M10.9–M10.11 identity registry remains authoritative** for catalogue-side
  MPN/GTIN evidence and catalogue identity review.
- **M10.12 mapping review is separate.** Approving a provider mapping does not
  approve catalogue identity, and approving catalogue identity does not approve
  a provider product mapping.
- **No price, stock, offer, currency or affiliate field exists** in the
  provider product or mapping contracts.
- **No network code exists.** Provider adapters are interfaces only.

## 2. Provider product contract

`ProviderProduct` is deliberately distinct from the lean M10.7
`ProviderProductRecord` used for offer discovery.

| Field                         | Meaning                                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| `providerId`                  | Stable lowercase provider/adapter id.                                                     |
| `externalProductId`           | Provider product id, preserved exactly.                                                   |
| `productUrl`                  | Provider product page or `null`.                                                          |
| `title`                       | Provider title. Never used to establish identity.                                         |
| `manufacturer`                | Brand/manufacturer or `null`; never inferred from the title.                              |
| `identifiers`                 | Original MPN, model, GTIN and retailer SKU strings.                                       |
| `normalizedIdentifiers`       | Canonical MPN, model and GTIN used for matching.                                          |
| `category`                    | AppKitX category or `null`.                                                               |
| `marketId` / `region`         | Provider market and ISO country of the exact SKU, or `null`.                              |
| `sellerId`                    | Provider-scoped seller identity, or `null`.                                               |
| `variant`                     | Provider variant id/label/attributes, or `null`.                                          |
| `lifecycle`                   | `active`, `discontinued`, `superseded`, `unknown`.                                        |
| `supersedesExternalProductId` | Previous external id when the provider changed its id.                                    |
| `provenance`                  | Collection method, data origin, source, observation/retrieval, provider update, revision. |
| `createdAt` / `updatedAt`     | Record metadata.                                                                          |

Rules:

1. **Provider SKU is not an MPN.** `identifiers.providerSku` is preserved for
   audit and is never passed to matching.
2. **Original identifiers are preserved.** Normalized values are stored
   alongside the provider's original strings.
3. **Titles never establish identity.** Title similarity is diagnostic only.
4. **Unknown stays unknown.** Missing manufacturer, category, region, market,
   seller, variant and identifiers are `null`; no value is guessed.
5. **Regions and variants remain separate.** They are not collapsed into a
   single product identity.
6. **Lifecycle is not stock.** `discontinued` here describes the provider
   record, not availability for sale.
7. **Supersession is explicit.** A changed external product id is recorded, and
   the old record must be marked `superseded`.

## 3. Mapping registry

A `ProviderProductMapping` connects exactly one provider product to exactly one
catalogue component.

| Field                     | Meaning                                                        |
| ------------------------- | -------------------------------------------------------------- |
| `mappingId`               | Deterministic stable id.                                       |
| `providerId`              | Provider identity.                                             |
| `externalProductId`       | External product identity.                                     |
| `catalogueComponentId`    | Exact AppKitX component id.                                    |
| `method`                  | `exact-mpn`, `exact-gtin`, `exact-model` or `manual-review`.   |
| `confidence`              | Existing M10.7 confidence values where applicable.             |
| `status`                  | `candidate`, `verified`, `rejected`, `needs-review`.           |
| `evidence`                | Auditable snapshot of both identities and each relationship.   |
| `reasons`                 | Human-readable decision/rejection reasons.                     |
| `region` / `marketId`     | Mapping context snapshot.                                      |
| `sellerId` / `variantId`  | Seller and variant context snapshot.                           |
| `provenance`              | Matcher version, generation time, provider record fingerprint. |
| `review`                  | Separate mapping review decision and evidence fingerprint.     |
| `createdAt` / `updatedAt` | Mapping record metadata.                                       |

Registry-level fail-closed rules:

- Duplicate `(providerId, externalProductId)` provider products are invalid.
- Duplicate mapping ids are invalid.
- One external product id mapped to different catalogue components is invalid.
- Duplicate mappings for the same provider product and component are invalid.
- One component associated with different non-null provider variants in the
  same provider/region is invalid.
- A mapping must reference an existing catalogue component and provider product.
- Invalid identifiers, timestamps, regions, URLs, reviewer metadata or evidence
  relationships invalidate the dataset.

## 4. Matching evidence and confidence

M10.12 reuses the M10.7 confidence constants and catalogue identity contract.
The existing `matchProduct` function and its behavior are unchanged; the new
layer is stricter about conflicts.

| Evidence                                               | Mapping outcome | `matchStatus` | Confidence |
| ------------------------------------------------------ | --------------- | ------------- | ---------: |
| Exact MPN + manufacturer                               | `candidate`     | `verified`    |        100 |
| Exact GTIN + manufacturer (+ category when supplied)   | `candidate`     | `verified`    |         97 |
| Exact GTIN + manufacturer, category unknown            | `candidate`     | `verified`    |         97 |
| Exact model + manufacturer                             | `needs-review`  | `probable`    |         85 |
| Exact identifier but manufacturer unknown              | `needs-review`  | `unverified`  |          0 |
| Title similarity only                                  | `unverified`    | `unverified`  |          0 |
| Multiple remaining catalogue candidates                | `needs-review`  | `unverified`  |          0 |
| Manufacturer / identifier / category / region conflict | `rejected`      | `rejected`    |          0 |

Conflict behavior:

- An MPN that belongs to another manufacturer is rejected, not ignored.
- A GTIN that belongs to another manufacturer or category is rejected. This is
  intentionally stricter than the legacy M10.7 `probable` GTIN-manufacturer
  fallback, which remains unchanged for existing callers.
- If MPN, GTIN and model evidence point at different components, the result is
  rejected with all candidate ids listed.
- If a stronger identifier agrees with one component and another supplied
  identifier disagrees, the mapping is rejected.
- Multiple possible matches are never resolved by taking the first candidate.
- Regional mismatches are rejected when both sides declare different regions.
- Missing category does not block exact MPN evidence; missing manufacturer does
  block verification and yields `needs-review`.
- A superseded provider record never creates a new automatic mapping.

## 5. Mapping states and review policy

| State          | Created by                        | Usable for pricing | Review required |
| -------------- | --------------------------------- | ------------------ | --------------- |
| `candidate`    | Automatic exact MPN/GTIN matching | No                 | Yes             |
| `needs-review` | Automatic probable/ambiguous data | No                 | Yes             |
| `rejected`     | Conflict or human rejection       | No                 | No (never)      |
| `verified`     | Named human approval only         | Yes, if current    | Already done    |

Review rules:

- `candidate` and `needs-review` mappings must have `review.status =
"not-reviewed"`.
- `verified` requires `review.status = "approved"`, a named reviewer, review
  time, notes, the exact provider product URL, the previous status and the
  evidence fingerprint.
- The reviewer cannot be `opencode-…`, `system`, `automated` or `fixture`.
- `reviewedAt` cannot precede mapping generation or be in the future.
- A review fingerprint is a deterministic 64-bit FNV-1a integrity value over
  the mapping identity/evidence. It is not a cryptographic signature.
- Changing evidence, confidence, method, region, variant, provider product
  fingerprint or matcher version invalidates the review.
- An invalidated verified mapping becomes `needs-review`; it never remains
  usable.
- Rejected mappings are retained for audit and can never become eligible.

No reviewer or approval was invented for real data. The only approved mapping
in this repository is a clearly labelled synthetic test fixture.

## 6. Regional, seller and variant handling

- `region` is an ISO 3166-1 alpha-2 country code or `null`.
- `marketId` is the provider's market identifier or `null`. It is not inferred
  from region, language or browser data.
- `sellerId` preserves provider-scoped seller context where available.
- `variant` preserves variant id, label and attributes.
- The catalogue currently exposes no variant identity, so variant compatibility
  cannot be confirmed automatically. A provider variant is preserved in the
  mapping/evidence and remains review-gated.
- Two mappings for the same component, provider and region with different
  non-null variants fail registry validation.
- A regional mismatch is preserved as rejected evidence, not merged.

## 7. Provider adapter interface

`ProviderProductAdapter` describes the future integration boundary:

- Provider identity, display name, supported market ids, supported country
  codes, data origin and adapter version.
- Pagination strategy, page-size limit, cursor field and total-count support.
- Identifier extraction from a raw provider record.
- Provider product normalization using explicit retrieval/provenance context.
- Provider error mapping using the existing `ProviderError` vocabulary.
- Existing `ProviderPage`, `ProviderRequest`, `ProviderRateLimit` and
  `ProviderResult` contracts are reused.

There is no adapter implementation, credential, HTTP client, API key, scraping
routine or retailer-specific branch in this milestone. A future adapter must
normalize into `ProviderProduct`; it must not place price, stock or offer data
into the identity contract.

## 8. Synthetic fixtures

Fixtures live in `src/dev/pc-builder/provider-mapping-fixtures.ts` and are
explicitly marked synthetic. They are not imported by a production route.

Coverage:

| Case                                 | Fixture                                                 |
| ------------------------------------ | ------------------------------------------------------- |
| Exact MPN match                      | `synthetic-acf-freezer-36-mpn`                          |
| Exact GTIN match                     | `synthetic-nzxt-h7-flow-gtin`                           |
| Model-only probable match            | `synthetic-amd-7800x3d-model`                           |
| Title-only unverified match          | `synthetic-amd-7800x3d-title`                           |
| Wrong manufacturer                   | `synthetic-wrong-manufacturer`                          |
| Regional mismatch                    | `synthetic-region-mismatch`                             |
| Multiple candidate components        | unit test with two synthetic components sharing a model |
| Duplicate provider product ids       | `syntheticDuplicateProviderProductRegistry`             |
| Conflicting mappings                 | `syntheticConflictingMappingDataset`                    |
| Different regional variants          | US standard variant + GB mismatch                       |
| Rejected mappings                    | wrong-manufacturer and regional-mismatch mappings       |
| Missing identifiers                  | `synthetic-missing-identifiers`                         |
| Invalid GTIN                         | `syntheticInvalidGtinProduct`                           |
| Product identifier changes           | `synthetic-amd-successor-v1/v2`                         |
| Discontinued catalogue component     | `synthetic-discontinued-catalogue-target`               |
| Discontinued provider record         | `synthetic-amd-7800x3d-discontinued-provider`           |
| Same component, conflicting variants | `syntheticVariantConflictDataset`                       |

All fixture URLs use reserved example domains. The single verified fixture uses
`synthetic-m10-12-reviewer` and a note saying it is not a real approval.

## 9. Audit command

The audit is read-only. It validates the dataset, recomputes effective states,
runs deterministic matching for every product and reports actionable issues.

```bash
npx esbuild scripts/audit-pc-provider-mappings.ts \
  --bundle --platform=node --format=esm --outfile=/tmp/pc-provider-mapping-audit.mjs
node /tmp/pc-provider-mapping-audit.mjs
```

Actual output against the synthetic fixture dataset:

```text
PC Builder provider mapping audit
Dataset: SYNTHETIC fixture dataset — not real retailer or provider data.
Total provider products: 12
Total mappings: 9
Verified mappings: 1
Candidate mappings: 5
Needs-review mappings: 1
Rejected mappings: 2
Effective verified mappings: 1
Effective needs-review mappings: 1
Invalidated reviews: 0
Duplicate external product IDs: 0
Conflicting catalogue associations: 0
Component variant conflicts: 0
Regional mismatches: 1
Invalid identifiers: 0
Missing-identifier products: 2
Unmapped provider products: 3
Ambiguous matches: 0
Provider product identifier changes: 1
Discontinued provider products: 1
Superseded provider products: 1
Discontinued catalogue targets: 1
Stale provider-product mappings: 0
Stale catalogue-evidence mappings: 0
Pricing-eligible mappings (synthetic excluded): 0
Identifier coverage — manufacturer: 11/12
Identifier coverage — MPN: 8/12
Identifier coverage — model: 1/12
Identifier coverage — GTIN: 1/12
Identifier coverage — no exact identifier: 2/12
Identifier coverage — provider SKU only: 1/12
```

The audit exits non-zero and prints paths/codes when validation fails. Invalid
GTINs, duplicate external ids and conflicting mappings are therefore reported
as actionable validation issues rather than silently counted as valid.

## 10. Validation and tests

Commands used for this milestone:

```bash
npm test
npm run test:pc-builder
npm run test:e2e
npm run pc-builder:validate-catalogue
npx astro check
npx prettier --check .
npm run build
```

The new unit suites cover the contract, matching, registry, review policy,
fingerprint invalidation, conflict handling and audit. Existing M10.7–M10.11
tests remain unchanged and pass.

Final results:

| Check                       | Result                                                              |
| --------------------------- | ------------------------------------------------------------------- |
| Full unit suite             | 46 files / 825 tests passed                                         |
| Pricing-specific unit tests | 9 files / 137 tests passed                                          |
| PC Builder Playwright       | 89 passed                                                           |
| Production Playwright       | 666 passed                                                          |
| Catalogue validation        | 101 components, 0 invalid, status OK                                |
| Identity registry audit     | 50 source-verified records, 0 duplicates/conflicts                  |
| Provider mapping audit      | 12 products, 9 mappings, 0 conflicts, 0 eligible synthetic mappings |
| `astro check`               | 0 errors, 0 warnings, 0 hints                                       |
| Prettier                    | all matched files formatted                                         |
| Production build            | 21 pages built, CSP Report-Only header generated                    |

## 11. Limitations

- No real provider record exists in the repository. The audit therefore runs
  against synthetic fixtures.
- Catalogue identities remain source-verified rather than human-reviewed; the
  M10.11 review model is unchanged.
- Mapping review is a static data contract. There is no authenticated reviewer
  account system, signature scheme or backoffice. A named string is an audit
  convenience, not authentication.
- Variant equivalence cannot be checked against the catalogue because catalogue
  records do not carry provider variant identity.
- Title similarity is diagnostic only and cannot establish identity.
- A verified mapping is still gated on provider record lifecycle, catalogue
  component availability, provider data origin and current evidence.
- The audit does not contact providers, fetch URLs or verify that a provider
  page is still live.
- There is no persistence layer. Registries are static data for now.

## 12. Future integration requirements

Before live ingestion:

1. Implement provider adapters behind the interface, with credentials held only
   in server-side secret storage and never in fixtures or source.
2. Persist provider products and mappings with authenticated reviewer accounts,
   immutable review events and signed/auditable approval records.
3. Expand catalogue identity evidence per region/SKU where regional MPNs or
   GTINs exist.
4. Define provider-specific variant equivalence only after explicit manufacturer
   evidence exists.
5. Add scheduling, rate-limit handling and retry policy outside the pure domain
   modules.
6. Add monitoring for duplicate ids, identifier changes, stale provider records,
   stale reviews and discontinued catalogue targets.
7. Keep pricing ingestion limited to verified, current, eligible mappings and
   keep prices/stock in the separate M10.7 commercial contract.
8. Obtain separate approval for any registry schema change or production
   activation.

## 13. Explicit exclusions

Not implemented in M10.12:

- Amazon, Flipkart or any retailer API integration.
- Affiliate links or tracking.
- Live prices, stock, availability or price polling.
- Scraping.
- Currency conversion.
- Recommendation scoring or budget calculation changes.
- Public PC Builder release.
- Registry schema v2.
- Deployment, Wrangler, Cloudflare, CSP or security-header changes.
- Package or dependency changes.
