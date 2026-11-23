# Verified Product Identity Registry (M10.9)

Status: implementation complete, **uncommitted for review**. No provider
integration, prices, stock, affiliate links or production changes are included.

- Branch: `feature/m10-9-identity-registry`
- Base: `5852d5e409a87b46968c059f92542b11a590f2c1` (merged M10.7 + M10.8)
- Registry: `src/lib/pc-builder/catalogue/identifiers.ts`
- Validation/projection: `src/lib/pc-builder/pricing/identity-registry.ts`
- Audit: `scripts/audit-pc-pricing-identities.ts`

## 1. Executive summary

M10.9 adds an optional, provenance-backed identity registry for catalogue
components. It supplies explicit MPNs and GTINs to the existing pricing
matching contract without changing catalogue specifications.

Results:

- **24 source-verified records** covering **24 of 101 components**.
- **20 source-verified MPNs**, **8 source-verified GTINs**, **4 components with
  both**.
- **0 human-reviewed records**: all 24 are explicitly awaiting a named human
  reviewer.
- **77 components remain without source-verified identity**.
- **42 MPN-shaped model candidates** are still unverified.
- **35 descriptive model names** are still model-only.
- **0 duplicate GTINs**, **0 duplicate manufacturer/MPN pairs**, **0 stale
  source verifications**, **0 provisional records** in the initial registry.

Terminology in this document and the audit:

- **Source-verified** means the identifier is supported by an authoritative
  manufacturer source, with provenance recorded and validation passed. This is
  the state that makes an exact MPN/GTIN eligible for the existing matching
  confidence rules.
- **Human-reviewed** means a named human independently reviewed and approved the
  record. No record currently has this status.
- A source-verified record is **not** a human-approved record, and matching
  output must not be read as human approval.
- No catalogue record, price, provider identifier or recommendation score was
  changed.

The registry is deliberately small. It covers the components for which a
manufacturer page or manufacturer document explicitly confirmed the identifier.
It does not attempt to reach a coverage target by promoting model-shaped strings.

## 2. Registry schema

```ts
interface CatalogueIdentifierRecord {
  componentId: string;
  manufacturer: string; // must match the catalogue component
  model: string; // must match the catalogue component
  manufacturerPartNumber: string | null;
  gtin: string | null; // one primary GTIN
  region: string | null; // ISO 3166-1 alpha-2 or null
  source: {
    type:
      | "manufacturer-page"
      | "manufacturer-document"
      | "manufacturer-packaging"
      | "gs1"
      | "authorized-distributor"
      | "manual-review";
    name: string;
    url: string; // HTTPS
    accessedAt: string; // canonical ISO 8601 UTC
  };
  sourceVerification: {
    status: "source-verified" | "provisional";
    method:
      | "automated-manufacturer-evidence-check"
      | "manual-manufacturer-evidence-check";
    verifiedBy: string; // process or person, never human approval
    verifiedAt: string; // canonical ISO 8601 UTC
    notes: string | null;
  };
  humanReview: {
    status: "not-reviewed" | "reviewed";
    reviewer: string | null; // named human only when reviewed
    reviewedAt: string | null; // canonical ISO 8601 UTC
    notes: string | null;
  };
}

interface CatalogueIdentifierRegistry {
  schemaVersion: 1;
  records: CatalogueIdentifierRecord[];
}
```

Rules:

- At least one of `manufacturerPartNumber` or `gtin` is required.
- One primary GTIN per component. Multi-GTIN support is deliberately deferred.
- Only `sourceVerification.status === "source-verified"` records project into
  `CatalogueProductIdentity`.
- `provisional` source records are retained for audit but never used for
  matching.
- `humanReview` is independent governance metadata. `not-reviewed` is the
  default; it does not block source-verified matching but must be disclosed.
- A human review cannot upgrade a provisional source record.
- Records without a registry entry preserve the existing model-only behavior.

## 3. Source-evidence policy

Evidence priority used for this milestone:

1. Manufacturer product pages.
2. Manufacturer technical documents and data sheets.
3. Manufacturer packaging evidence (not used in this initial set).
4. GS1-backed evidence (not used; access/licensing not established).
5. Authorized distributor evidence (not used; manufacturer evidence preferred).

Rules:

- A product title containing an alphanumeric string is not proof of an MPN.
- A retailer SKU is not an MPN.
- A model name is not automatically an MPN.
- An EAN/UPC is accepted only after format and check-digit validation.
- Every record names the exact source, source type, access timestamp, source
  verifier and human review status.
- Evidence is limited to the identifier facts and provenance. No manufacturer
  page content is copied into the repository.
- No scraping infrastructure or automated provider requests were added.

### Source verifier and human review

The source verifier identifier is `opencode-m10.9`, representing the automated
manufacturer-evidence check performed for this milestone. It is **not** a named
human reviewer and does not constitute human approval.

Every initial record has:

```ts
humanReview: {
  status: "not-reviewed";
  reviewer: null;
  reviewedAt: null;
  notes: null;
}
```

A named human reviewer must be recorded with status `reviewed` before any claim
of human approval. Source verification and human review are audited separately.

## 4. Verification methodology

For each component:

1. Confirm the component exists and the catalogue manufacturer/model match.
2. Open the manufacturer page or document.
3. Confirm the manufacturer/model association on that source.
4. Extract the MPN, GTIN or both.
5. Normalize the MPN with the existing part-number helper.
6. Validate GTIN length and check digit with `normalizeGtin`.
7. Reject duplicate manufacturer/MPN pairs and duplicate GTINs.
8. Record source URL, source type, access timestamp, source verifier and
   human review status.
9. Re-run the registry audit and unrelated matching tests.

No named human review was performed for the initial 24 records. They are marked
`humanReview.status: "not-reviewed"` and must not be described as
"human-reviewed".

Additional checks:

- The catalogue's `be quiet!` source URL points to the Dark Rock 4 (BK021) page,
  not the Dark Rock Pro 4 (BK022). The registry uses the official
  `https://www.bequiet.com/bk022` page and records the discrepancy. The
  catalogue was not modified.
- Noctua pages rate-limited automated requests; official Noctua data sheets were
  used instead.
- Samsung, SanDisk/WD and Seagate identifiers were confirmed from official
  documents/product pages, not retailer listings.

## 5. Verified identifier inventory

| Component ID                                  | Manufacturer / model             | MPN                    | GTIN          | Source |
| --------------------------------------------- | -------------------------------- | ---------------------- | ------------- | ------ |
| `ram-corsair-vengeance-32gb-ddr5-6000`        | Corsair / CMK32GX5M2B6000C30     | CMK32GX5M2B6000C30     | —             | E1     |
| `ram-corsair-vengeance-lpx-16gb-ddr4-3200`    | Corsair / CMK16GX4M2B3200C16     | CMK16GX4M2B3200C16     | —             | E2     |
| `ram-corsair-vengeance-lpx-32gb-ddr4-3200`    | Corsair / CMK32GX4M4B3200C16     | CMK32GX4M4B3200C16     | —             | E3     |
| `ram-corsair-vengeance-64gb-ddr5-5600`        | Corsair / CMK64GX5M2B5600C40     | CMK64GX5M2B5600C40     | —             | E4     |
| `ram-gskill-ripjaws-v-16gb-ddr4-3200`         | G.SKILL / F4-3200C16D-16GVKB     | F4-3200C16D-16GVKB     | —             | E5     |
| `ram-gskill-ripjaws-v-32gb-ddr4-3600`         | G.SKILL / F4-3600C18D-32GVK      | F4-3600C18D-32GVK      | —             | E6     |
| `ram-gskill-flare-x5-32gb-ddr5-6000`          | G.SKILL / F5-6000J3038F16GX2-FX5 | F5-6000J3038F16GX2-FX5 | —             | E7     |
| `storage-samsung-990-pro-1tb`                 | Samsung / MZ-V9P1T0BW            | MZ-V9P1T0BW            | —             | E8     |
| `storage-wd-black-sn850x-1tb`                 | Western Digital / WDS100T2X0E    | WDS100T2X0E            | —             | E9     |
| `storage-seagate-barracuda-2tb`               | Seagate / ST2000DM008            | ST2000DM008            | —             | E10    |
| `storage-seagate-ironwolf-4tb`                | Seagate / ST4000VN006            | ST4000VN006            | —             | E11    |
| `cooler-arctic-freezer-36`                    | ARCTIC / ACFRE00123A             | ACFRE00123A            | 4895213704144 | E12    |
| `cooler-arctic-liquid-freezer-iii-280`        | ARCTIC / ACFRE00135A             | ACFRE00135A            | 4895213704472 | E13    |
| `cooler-corsair-icue-h100i-rgb-elite`         | Corsair / iCUE H100i RGB ELITE   | CW-9060058-WW          | —             | E14    |
| `cooler-corsair-icue-h150i-elite-capellix-xt` | Corsair / CW-9060070-WW          | CW-9060070-WW          | —             | E15    |
| `cooler-corsair-icue-h60x-rgb-elite`          | Corsair / CW-9060064-WW2         | CW-9060064-WW2         | —             | E16    |
| `cooler-be-quiet-dark-rock-pro-4`             | be quiet! / BK022                | BK022                  | —             | E17    |
| `cooler-noctua-nh-u12s-redux`                 | Noctua / NH-U12S redux           | —                      | 9010018000207 | E18    |
| `case-fan-arctic-p12-pwm`                     | ARCTIC / P12 PWM                 | ACFAN00119A            | 4895213701389 | E19    |
| `case-fan-arctic-p14-pwm`                     | ARCTIC / ACFAN00124A             | ACFAN00124A            | 4895213701556 | E20    |
| `case-fan-corsair-af120-elite`                | Corsair / AF120 ELITE            | CO-9050141-WW          | —             | E21    |
| `case-fan-noctua-nf-a12x25-pwm`               | Noctua / NF-A12x25 PWM           | —                      | 9010018100396 | E22    |
| `case-fan-noctua-nf-a14-pwm`                  | Noctua / NF-A14 PWM              | —                      | 4716123314981 | E23    |
| `case-fan-noctua-nf-a12x15-pwm`               | Noctua / NF-A12x15 PWM           | —                      | 9010018100082 | E24    |

**Human review:** all 24 records above are `not-reviewed`. None has a named
human reviewer or human approval date.

### Evidence sources

All accessed 2026-10-31. Source type is manufacturer page unless noted.

- **E1** Corsair — https://www.corsair.com/us/en/p/memory/cmk32gx5m2b6000c30/vengeance-32gb-2x16gb-ddr5-dram-6000mt-s-c30-memory-kit-black-cmk32gx5m2b6000c30 — page displays SKU `CMK32GX5M2B6000C30`.
- **E2** Corsair — https://www.corsair.com/us/en/p/memory/cmk16gx4m2b3200c16/vengeancea-lpx-16gb-2-x-8gb-ddr4-dram-3200mhz-c16-memory-kit-black-cmk16gx4m2b3200c16 — page identifies the 16 GB kit by SKU.
- **E3** Corsair — https://www.corsair.com/us/en/p/memory/cmk32gx4m4b3200c16/vengeancea-lpx-32gb-4-x-8gb-ddr4-dram-3200mhz-c16-memory-kit-black-cmk32gx4m4b3200c16 — page identifies the 32 GB four-module kit by SKU.
- **E4** Corsair — https://www.corsair.com/us/en/p/memory/cmk64gx5m2b5600c40/vengeancea-64gb-2x32gb-ddr5-dram-5600mhz-c40-memory-kit-a-black-cmk64gx5m2b5600c40 — page identifies the 64 GB kit by SKU.
- **E5** G.SKILL — https://www.gskill.com/product/165/184/1536110676/F4-3200C16D-16GVKB — page title and specification identify `F4-3200C16D-16GVKB`.
- **E6** G.SKILL — https://www.gskill.com/specification/165/184/1562833535/F4-3600C18D-32GVK-Specification — page title and specification identify `F4-3600C18D-32GVK`.
- **E7** G.SKILL — https://www.gskill.com/specification/165/396/1673491242/F5-6000J3038F16GX2-FX5-Specification — page title and specification identify `F5-6000J3038F16GX2-FX5`.
- **E8** Samsung — https://download.semiconductor.samsung.com/resources/brochure/990_PRO_Series_Brouchure_Web_Version_4.0_250523.pdf — 990 PRO brochure lists Model Code `MZ-V9P1T0BW` for 1 TB.
- **E9** SanDisk/WD — https://www.sandisk.com/products/ssd/internal-ssd/wd-black-sn850x-nvme-ssd?sku=WDS100T2X0E — page lists Model Number `WDS100T2X0E` for the 1 TB model without heatsink.
- **E10** Seagate — https://www.seagate.com/www-content/datasheets/pdfs/3-5-barracudaDS1900-7-1706US-en_US.pdf — BarraCuda data sheet lists `ST2000DM008` for 2 TB.
- **E11** Seagate — https://www.seagate.com/www-content/product-content/ironwolf/en-us/docs/100807039n.pdf — IronWolf manual lists `ST4000VN006` as a standard 4 TB model.
- **E12** ARCTIC — https://www.arctic.de/en/Freezer-36/ACFRE00123A — page lists article `ACFRE00123A` and EAN `4895213704144`.
- **E13** ARCTIC — https://www.arctic.de/en/Liquid-Freezer-III-280/ACFRE00135A — page lists article `ACFRE00135A` and EAN `4895213704472`.
- **E14** Corsair — https://www.corsair.com/us/en/p/cpu-coolers/cw-9060058-ww/icue-h100i-rgb-elite-liquid-cpu-cooler-cw-9060058-ww — page identifies SKU `CW-9060058-WW`.
- **E15** Corsair — https://www.corsair.com/us/en/p/cpu-coolers/cw-9060070-ww/icue-h150i-elite-capellix-xt-liquid-cpu-cooler — page identifies SKU `CW-9060070-WW`.
- **E16** Corsair — https://www.corsair.com/us/en/p/cpu-coolers/cw-9060064-ww2/icue-h60x-rgb-elite-liquid-cpu-cooler-cw-9060064-ww2 — page identifies SKU `CW-9060064-WW2`.
- **E17** be quiet! — https://www.bequiet.com/bk022 — page identifies article number `BK022` for Dark Rock Pro 4.
- **E18** Noctua — https://noctua.at/pub/media/blfa_files/infosheet/noctua_nh_u12s_redux_datasheet_en_web.pdf — manufacturer datasheet (document) names NH-U12S redux and EAN `9010018000207`.
- **E19** ARCTIC — https://www.arctic.de/en/P12-PWM/ACFAN00119A — page lists article `ACFAN00119A` and EAN `4895213701389`.
- **E20** ARCTIC — https://www.arctic.de/en/P14-PWM/ACFAN00124A — page lists article `ACFAN00124A` and EAN `4895213701556`.
- **E21** Corsair — https://www.corsair.com/us/en/p/case-fans/co-9050141-ww/af120-elite-120mm-pwm-fan-co-9050141-ww — page identifies SKU `CO-9050141-WW`.
- **E22** Noctua — https://noctua.at/pub/media/blfa_files/infosheet/noctua_nf_a12x25_pwm_datasheet_en_web_3.pdf — datasheet names NF-A12x25 PWM and EAN `9010018100396`.
- **E23** Noctua — https://noctua.at/pub/media/blfa_files/infosheet/noctua_nf_a14_pwm_datasheet_en_web_3.pdf — datasheet names NF-A14 PWM and EAN `4716123314981`.
- **E24** Noctua — https://noctua.at/pub/media/blfa_files/infosheet/noctua_nf_a12x15_pwm_datasheet_en_web.pdf — datasheet names NF-A12x15 PWM and EAN `9010018100082`.

No GS1 or authorized-distributor records are present.

## 6. Coverage by category

| Category    | Total | Source-verified | Source-verified MPN | Source-verified GTIN | Both | Without source-verified |
| ----------- | ----: | --------------: | ------------------: | -------------------: | ---: | ----------------------: |
| CPU         |    16 |               0 |                   0 |                    0 |    0 |                      16 |
| GPU         |    15 |               0 |                   0 |                    0 |    0 |                      15 |
| Motherboard |    13 |               0 |                   0 |                    0 |    0 |                      13 |
| RAM         |    10 |               7 |                   7 |                    0 |    0 |                       3 |
| Cooler      |    11 |               7 |                   6 |                    3 |    2 |                       4 |
| Storage     |     9 |               4 |                   4 |                    0 |    0 |                       5 |
| PSU         |     9 |               0 |                   0 |                    0 |    0 |                       9 |
| Case        |    11 |               0 |                   0 |                    0 |    0 |                      11 |
| Case fan    |     7 |               6 |                   3 |                    5 |    2 |                       1 |

Catalogue audit after applying source-verified records:

- Source-verified matching-ready: **24**
- Explicit MPN identities: **20**
- Explicit GTIN-only identities: **4**
- MPN-shaped candidates remaining: **42**
- Descriptive model names remaining: **35**
- Duplicate normalized models: **0**
- Human-reviewed records: **0**
- Awaiting human review: **24**
- Stale source verifications: **0**
- Stale human reviews: **0**

## 7. Matching integration

The registry does not replace `matchProduct()` or create a parallel matching
system. It projects **source-verified** records into the existing
`CatalogueProductIdentity` contract. Human review is not used to bypass source
verification:

```ts
buildCatalogueIdentities(components, registry)
  -> CatalogueProductIdentity[] with explicit MPN/GTIN/region
  -> matchProduct(providerProduct, identities)
```

Rules:

- Source-verified MPN + manufacturer can produce `verified` under the existing
  rules.
- Source-verified GTIN + category + manufacturer can produce `verified`.
- Provisional records are excluded from identity projection and cannot promote,
  even if a human review is recorded.
- Model-only records remain `probable`.
- Title-only evidence remains `unverified`.
- Region conflicts are rejected by the existing matching rules.
- No registry or no record preserves the previous behavior exactly.
- A `verified` matching result means **source-verified evidence**, not human
  approval. Audit output reports human review separately.

`matchProductWithRegistry()` is a convenience wrapper; the underlying contract is
unchanged.

## 8. Validation rules

`validateIdentifierRegistry()` fails closed on:

- Unknown or invalid component id.
- Manufacturer or model mismatch against the catalogue component.
- Missing both MPN and GTIN.
- Empty/invalid MPN after normalization.
- Invalid GTIN length or check digit.
- Duplicate component record.
- Duplicate manufacturer + MPN pair.
- Duplicate GTIN across components.
- Invalid source type, name, HTTPS URL or access time.
- Missing/invalid source verification status, method, verifier or time.
- Source verification before source access or in the future.
- Human review with status `reviewed` but no named reviewer or review time.
- Human review with status `not-reviewed` but a reviewer or review time.
- Human review before source access or before source verification, or in the
  future.
- Invalid ISO country region.
- Unsupported schema version.
- More than 500 records or a payload over 512 KB.

Invalid records are reported with a path and issue code. They are never silently
discarded or partially applied.

## 9. Audit command and output

```sh
npx esbuild scripts/audit-pc-pricing-identities.ts \
  --bundle --platform=node --format=esm --outfile=/tmp/pc-identity-audit.mjs
node /tmp/pc-identity-audit.mjs
```

Current output summary:

```text
Total components: 101
Registry records: 24
Source-verified records: 24
Provisional records: 0
Human-reviewed records: 0
Awaiting human review: 24
Stale source verifications: 0
Stale human reviews: 0
Records with MPN: 20
Records with GTIN: 8
Records with both MPN and GTIN: 4
Components with source-verified identity: 24
Components with source-verified MPN: 20
Components with source-verified GTIN: 8
Components with both: 4
Components without source-verified identity: 77
Catalogue audit — source-verified matching-ready: 24
Catalogue audit — explicit MPN identities: 20
Catalogue audit — explicit GTIN-only identities: 4
Catalogue audit — MPN-shaped candidates remaining: 42
Catalogue audit — descriptive model names remaining: 35
```

The audit exits non-zero and prints paths/issues if the registry is invalid.

## 10. Licensing and provenance limitations

- Manufacturer pages and documents were read for identifier verification only.
  No page text, images or marketing content is stored in the repository.
- Identifier facts are recorded with source URL, access time and source
  verification time.
- No GS1 data was used; GS1 access and redistribution terms were not established.
- No retailer authorization, affiliate agreement or provider credential exists.
- Some manufacturer pages use bot protection or rate limiting; official data
  sheets were used where available. No scraping infrastructure was added.
- The source verifier is an automated evidence-check identifier
  (`opencode-m10.9`), not a named human. All 24 records are `not-reviewed` by a
  human, and no record should be described as human-approved.
- The catalogue's be quiet! source URL is stale (points to BK021/Dark Rock 4,
  while the component is BK022/Dark Rock Pro 4). The registry uses the correct
  official BK022 page and does not modify the catalogue.
- MPNs and GTINs can change with packaging revisions and regions. The registry
  currently stores one primary GTIN and no multi-region variants.

## 11. Known gaps

- 77 components have no source-verified identity.
- 24 source-verified records still have **no human review**.
- No source-verified CPU, GPU, motherboard, PSU or case identities yet.
- 42 MPN-shaped model strings remain candidates only.
- 35 descriptive model names remain model-only.
- No GS1-backed records.
- No authorized-distributor records.
- No multi-GTIN or regional variant support.
- No component-to-provider product mapping.
- No human sign-off beyond the automated evidence pass.

## 12. Future provider-integration implications

- Only the 24 source-verified components can become verified matching candidates
  under the current rules. They are not human-approved.
- Human review is a separate gate for production use; it should not be inferred
  from a `verified` matching result.
- Provider mappings should start with these source-verified components; ASINs,
  retailer SKUs or titles must never establish identity.
- Provider integration remains blocked on affiliate/legal approval and
  server-side credential, cache and rate-limit controls.
- The registry does not change recommendation scoring, prices, stock, budget
  totals or provider contracts.
- Future identity work should expand coverage by manufacturer category and add
  human review, not lower verification standards.
