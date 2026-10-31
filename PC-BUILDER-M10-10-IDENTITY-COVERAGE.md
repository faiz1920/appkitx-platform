# Product Identity Coverage Expansion (M10.10)

Status: implementation complete, **uncommitted for review**. No provider
integration, live price, stock, affiliate or public route change is included.

## 1. Executive summary

M10.10 extends the M10.9 source-verified identity registry into CPU, PSU and
case categories. It does **not** change the registry schema, the matching
confidence rules or any catalogue specification.

Results:

- **26 new source-verified records** added, taking the registry from 24 to
  **50 records**.
- **14 of 16 CPUs**, **6 of 9 PSUs** and **6 of 11 cases** now have a
  source-verified identity.
- **46 records carry an MPN**, **9 carry a GTIN**, and **5 carry both**.
- **0 duplicate MPNs, 0 duplicate GTINs and 0 conflicting component mappings.**
- **0 human-reviewed records.** All 50 records remain
  `humanReview.status: "not-reviewed"`.
- GPU and motherboard coverage remain at **0** because no live manufacturer
  page or document exposed an exact MPN or GTIN for the catalogue variants.
  The evidence blockers are recorded in section 6.

Terminology is unchanged from M10.9:

- **Source-verified** means the identifier is supported by an authoritative
  manufacturer source, with provenance recorded and validation passed. This is
  the state that makes an exact MPN/GTIN eligible for the existing matching
  rules.
- **Human-reviewed** means a named human independently reviewed and approved the
  record. No record has this status.
- A `verified` matching result means **source-verified evidence**, not human
  approval.

## 2. Scope and constraints

In scope:

- `src/lib/pc-builder/catalogue/identifiers.ts` only for registry data.
- Registry and coverage tests.
- This evidence document.

Out of scope and unchanged:

- Catalogue component records and specifications.
- Registry schema, validation contracts and matching confidence rules.
- Pricing providers, credentials, live prices, stock, affiliate links and
  currency conversion.
- Recommendation scoring and budget logic.
- Public PC Builder route, navigation, sitemap, CSP, security headers,
  Cloudflare, Wrangler, dependencies and deployment.

## 3. Evidence policy applied

A record was added only when all of the following were true:

1. The catalogue component id, manufacturer and model were already known.
2. A manufacturer-operated page or document displayed the exact identifier.
3. The source explicitly associated that identifier with the exact product
   model or variant.
4. The identifier normalized cleanly and passed GTIN validation where present.
5. The identifier did not duplicate an existing MPN or GTIN.
6. A region was recorded only when the source itself made the regional scope
   explicit.

Not used as evidence:

- Retailer or marketplace listings.
- Search-result titles or snippets without a retrievable manufacturer page.
- Product names that merely look like part numbers.
- Inferred suffix patterns (for example assuming an EU SKU from a US SKU).
- GS1 data.
- Board-partner, colour, revision or regional variants that do not match the
  catalogue model.

All records use `method: "automated-manufacturer-evidence-check"` and
`verifiedBy: "opencode-m10.10"`. This identifies the evidence pass; it is not a
named human reviewer.

## 4. Records added

All records were accessed on **2026-10-31** at
`2026-10-31T18:26:35.000Z` and source-verified at
`2026-10-31T18:26:36.000Z`.

### 4.1 CPU — AMD (7 records)

| Component                 | Model / MPN        | Evidence source                                              |
| ------------------------- | ------------------ | ------------------------------------------------------------ |
| `cpu-amd-ryzen-5-5600`    | `100-100000927BOX` | AMD processor specifications table, row “AMD Ryzen™ 5 5600”  |
| `cpu-amd-ryzen-7-5700x`   | `100-100000926WOF` | AMD processor specifications table, row “AMD Ryzen™ 7 5700X” |
| `cpu-amd-ryzen-9-5950x`   | `100-100000059WOF` | AMD Ryzen 9 5950X product page, “Product ID Boxed”           |
| `cpu-amd-ryzen-5-7600`    | `100-100001015BOX` | AMD Ryzen 5 7600 product page, “Product ID Boxed”            |
| `cpu-amd-ryzen-7-7800x3d` | `100-100000910WOF` | AMD Ryzen 7 7800X3D product page, “Product ID Boxed”         |
| `cpu-amd-ryzen-9-7900x`   | `100-100000589WOF` | AMD Ryzen 9 7900X product page, “Product ID Boxed”           |
| `cpu-amd-ryzen-9-7950x`   | `100-100000514WOF` | AMD Ryzen 9 7950X product page, “Product ID Boxed”           |

Source URLs:

- `https://www.amd.com/en/products/specifications/processors.html`
- `https://www.amd.com/en/products/processors/desktops/ryzen/5000-series/amd-ryzen-9-5950x.html`
- `https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-5-7600.html`
- `https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7800x3d.html`
- `https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-9-7900x.html`
- `https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-9-7950x.html`

The specification table exposes each processor as a record with a `Name` field
and a `Product ID Boxed` field. The 5600 and 5700X rows were checked in the
same record as their names; the association is source-derived, not inferred
from the part-number shape.

### 4.2 CPU — Intel (7 records)

| Component                     | Boxed ordering code | Evidence source                                    |
| ----------------------------- | ------------------- | -------------------------------------------------- |
| `cpu-intel-core-i5-12400f`    | `BX8071512400F`     | Intel ARK Ordering & Compliance, i5-12400F         |
| `cpu-intel-core-i5-13600k`    | `BX8071513600K`     | Intel ARK Ordering & Compliance, i5-13600K         |
| `cpu-intel-core-i5-14600k`    | `BX8071514600K`     | Intel ARK Ordering & Compliance, i5-14600K         |
| `cpu-intel-core-i7-13700k`    | `BX8071513700K`     | Intel ARK Ordering & Compliance, i7-13700K         |
| `cpu-intel-core-i9-13900k`    | `BX8071513900K`     | Intel ARK Ordering & Compliance, i9-13900K         |
| `cpu-intel-core-i9-14900k`    | `BX8071514900K`     | Intel ARK Ordering & Compliance, i9-14900K         |
| `cpu-intel-core-ultra-7-265k` | `BX80768265K`       | Intel ARK Ordering & Compliance, Core Ultra 7 265K |

Source URLs:

- `https://www.intel.com/content/www/us/en/products/sku/134587/intel-core-i512400f-processor-18m-cache-up-to-4-40-ghz/ordering.html`
- `https://www.intel.com/content/www/us/en/products/sku/230493/intel-core-i513600k-processor-24m-cache-up-to-5-10-ghz/ordering.html`
- `https://www.intel.com/content/www/us/en/products/sku/236799/intel-core-i5-processor-14600k-24m-cache-up-to-5-30-ghz/ordering.html`
- `https://www.intel.com/content/www/us/en/products/sku/230500/intel-core-i713700k-processor-30m-cache-up-to-5-40-ghz/ordering.html`
- `https://www.intel.com/content/www/us/en/products/sku/230496/intel-core-i913900k-processor-36m-cache-up-to-5-80-ghz/ordering.html`
- `https://www.intel.com/content/www/us/en/products/sku/236773/intel-core-i9-processor-14900k-36m-cache-up-to-6-00-ghz/ordering.html`
- `https://www.intel.com/content/www/us/en/products/sku/241063/intel-core-ultra-7-processor-265k-30m-cache-up-to-5-50-ghz/ordering.html`

Only the universal boxed code is stored. The China-specific `BXC…` codes and
tray `CM…` codes are not represented. The ARK pages list some of these boxed
codes under “Retired and discontinued”; that affects availability, not the
identity association.

### 4.3 PSU — Corsair (6 records, US region)

| Component                  | Catalogue model | Recorded SKU    | Region |
| -------------------------- | --------------- | --------------- | ------ |
| `psu-corsair-cv650`        | `CP-9020211`    | `CP-9020211-NA` | US     |
| `psu-corsair-cx550`        | `CP-9020277`    | `CP-9020277-NA` | US     |
| `psu-corsair-sf600`        | `CP-9020182`    | `CP-9020182-NA` | US     |
| `psu-corsair-rm750x-2021`  | `CP-9020199`    | `CP-9020199-NA` | US     |
| `psu-corsair-rm850e-2023`  | `CP-9020263`    | `CP-9020263-NA` | US     |
| `psu-corsair-rm1000x-2021` | `CP-9020201`    | `CP-9020201-NA` | US     |

Each Corsair US product page displays `SKU: CP-…-NA` for the exact model. The
catalogue model is the base part number without the regional suffix. The record
therefore stores the full North American SKU and sets `region: "US"`.

This is deliberate: the registry does not assert that `CP-9020211-NA`
represents the EU, UK, Australian or any other regional variant. A provider
listing a different suffix will not produce an exact MPN match, which is safer
than silently merging regions.

### 4.4 Case (6 records)

| Component                            | Model / MPN          | GTIN            | Evidence                                                        |
| ------------------------------------ | -------------------- | --------------- | --------------------------------------------------------------- |
| `case-corsair-4000d-airflow`         | `CC-9011200-WW`      | —               | Corsair product page, `SKU: CC-9011200-WW`                      |
| `case-corsair-5000d-airflow`         | `CC-9011210-WW`      | —               | Corsair product page, `SKU: CC-9011210-WW`                      |
| `case-corsair-7000d-airflow`         | `CC-9011218-WW`      | —               | Corsair product page, `SKU: CC-9011218-WW`                      |
| `case-nzxt-h7-flow`                  | `CM-H72FB-01`        | `5056547205502` | NZXT H7 Flow (2024) specification, Model Number + EAN           |
| `case-cooler-master-masterbox-q300l` | `MCB-Q300L-KANN-S00` | —               | Cooler Master product page, Model Number                        |
| `case-lian-li-o11-dynamic-evo`       | `O11DEX`             | —               | Lian Li O11 Dynamic EVO specification, MODEL NO. O11DEX (Black) |

Source URLs:

- `https://www.corsair.com/us/en/p/pc-cases/cc-9011200-ww/4000d-airflow-tempered-glass-mid-tower-atx-case-black`
- `https://www.corsair.com/us/en/p/pc-cases/cc-9011210-ww/5000d-airflow-tempered-glass-mid-tower-atx-case-black`
- `https://www.corsair.com/us/en/p/pc-cases/cc-9011218-ww/7000d-airflow-full-tower-atx-case-black`
- `https://support.nzxt.com/hc/en-us/articles/40379376386203-H7-Flow-2024-Specs`
- `https://www.coolermaster.com/en-us/products/masterbox-q300l.html`
- `https://lian-li.com/product/o11-dynamic-evo/`

For NZXT, the page publishes both EAN `5056547205502` and UPC
`810074845557` for the black `CM-H72FB-01`. The registry stores the EAN as the
single primary GTIN and records the UPC in the evidence notes. No region is
asserted because the support page is global.

For Lian Li, `O11DEX` is the black variant’s model number; `O11DEW` (white) and
`O11DEG` (grey) are separate variants and are not represented by this record.

## 5. Coverage before and after

### 5.1 Registry coverage

| Category    |   Total | Before |  After |    New |
| ----------- | ------: | -----: | -----: | -----: |
| CPU         |      16 |      0 | **14** |     14 |
| GPU         |      15 |      0 |      0 |      0 |
| Motherboard |      13 |      0 |      0 |      0 |
| RAM         |      10 |      7 |      7 |      0 |
| Cooler      |      11 |      7 |      7 |      0 |
| Storage     |       9 |      4 |      4 |      0 |
| PSU         |       9 |      0 |  **6** |      6 |
| Case        |      11 |      0 |  **6** |      6 |
| Case fan    |       7 |      6 |      6 |      0 |
| **Total**   | **101** | **24** | **50** | **26** |

### 5.2 Identifier coverage

| Metric                                      | Before |  After |
| ------------------------------------------- | -----: | -----: |
| Registry records                            |     24 | **50** |
| Source-verified records                     |     24 | **50** |
| Provisional records                         |      0 |      0 |
| Human-reviewed records                      |      0 |  **0** |
| Awaiting human review                       |     24 | **50** |
| Records with MPN                            |     20 | **46** |
| Records with GTIN                           |      8 |  **9** |
| Records with both                           |      4 |  **5** |
| Components without source-verified identity |     77 | **51** |

Catalogue audit after applying the registry:

- Source-verified matching-ready: **50**
- Explicit MPN identities: **46**
- Explicit GTIN-only identities: **4**
- MPN-shaped candidates remaining: **16**
- Descriptive model names remaining: **35**
- Duplicate normalized models: **0**

## 6. Deferred records and evidence blockers

### 6.1 GPU — no records (blocker)

The GPU catalogue contains NVIDIA Founders Edition and AMD reference models.
Their manufacturer product pages publish marketing names and specifications but
no MPN or GTIN. The AMD RX 7900 XTX page was retrieved and contains no
`Product ID`, MPN, EAN or UPC field. NVIDIA’s GeForce RTX 4090 page likewise
contains no part number.

NVIDIA’s official marketplace page for the RTX 4090 Founders Edition is indexed
as listing `MPN: 900-1G136-2530-000`, but direct retrieval timed out and
returned an HTTP/2 stream error on repeated attempts. A search-index snippet was
not accepted as sufficient evidence under the M10.10 policy, so no NVIDIA record
was added.

Board-partner cards do publish MPNs, but those are different products from the
reference/Founders Edition variants in the catalogue. Mapping them would violate
the exact-variant rule.

**Result:** 0 of 15 GPUs source-verified. This is a documented evidence blocker,
not a matching or schema failure.

### 6.2 Motherboard — no records (blocker)

The motherboard sources were checked but did not expose an exact identifier:

- **MSI:** specification pages returned HTTP 403 to automated retrieval.
- **Gigabyte:** specification pages returned HTTP 403.
- **ASUS:** the tech-spec and main product pages identify the model name only;
  the page metadata contains internal numeric product ids, not an ASUS part
  number or GTIN.
- **ASRock:** the specification page identifies the model and feature set only.

An ASUS German webshop page for the TUF GAMING B550-PLUS was indexed with
product number `90MB14G0-M0EAY0` and EAN `4718017749435`, but the shop now
returns a placeholder/password page instead of the product record. The
identifier could not be re-verified on a live manufacturer page, so it was not
added.

**Result:** 0 of 13 motherboards source-verified. This is a documented evidence
blocker.

### 6.3 CPU — deferred variants

| Component                 | Reason                                                                                                                                                                      |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cpu-amd-ryzen-7-5800x3d` | AMD lists Product ID Boxed `100-100000651POF`; the catalogue model is `100-100000651WOF`. The identifiers do not match, so the record was deferred rather than substituted. |
| `cpu-amd-ryzen-7-7700`    | AMD lists boxed IDs `100-100000592SBX`, `100-100000592SPK` and `100-100000592WOZ` after a cooler change; the catalogue model is `100-100000592BOX`. No exact match.         |

### 6.4 PSU — deferred

| Component                   | Reason                                                                                                                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `psu-seasonic-focus-gx-550` | The Seasonic FOCUS GX page covers the 550 W model but does not display the exact identifier `FOCUS-GX-550` or a GTIN in a form that distinguishes it from the other wattages. Deferred. |
| `psu-msi-mpg-a850g-pcie5`   | MSI product page returned HTTP 403; no manufacturer identifier retrieved.                                                                                                               |
| `psu-msi-mpg-a1000g-pcie5`  | Same MSI access blocker.                                                                                                                                                                |

### 6.5 Case — deferred

| Component                               | Reason                                                                                                                                                                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `case-nzxt-h510`                        | NZXT publishes per-colour model numbers (`CA-H510B-B1`, `CA-H510B-W1`, …) and UPC/EAN per colour, but the catalogue model is the generic family name `H510`. Selecting one colour would be an unsupported mapping. |
| `case-cooler-master-nr200`              | The page lists `MCB-NR200-WNNN-S00` (white) and `MCB-NR200-KNNN-S00` (black); the catalogue model is the generic `NR200`. Deferred.                                                                                |
| `case-lian-li-lancool-216`              | The page lists `LANCOOL 216X`, `216RX`, `216RW`, `216RC-X` and `216RC-W`; the catalogue model is the generic `LANCOOL 216`. Deferred.                                                                              |
| `case-fractal-design-north`             | The fetched product page did not expose `FD-C-NOR1X-01`; no identifier recorded.                                                                                                                                   |
| `case-fractal-design-meshify-2-compact` | The fetched product page did not expose `FD-C-MES2C-01`; no identifier recorded.                                                                                                                                   |

## 7. Regional, revision and variant limitations

- **PSU regions:** only Corsair North American `-NA` SKUs are recorded. EU, UK,
  Australian and other suffixes are not asserted. The catalogue base model and
  the recorded regional SKU differ by design.
- **CPU packaging:** boxed retail codes are recorded; tray and China-specific
  boxed codes are not.
- **Case variants:** only variants whose exact SKU equals the catalogue model are
  recorded. Colour or edition variants are not merged.
- **NZXT GTIN:** the EAN is stored as the primary GTIN; the UPC is documented but
  not stored. Both were published for the same black model.
- **Revisions:** motherboard revisions could not be assessed because no
  motherboard identifiers were retrievable. Case and PSU revisions are not
  represented beyond the exact SKU shown on the page.
- **One primary identifier:** the schema still stores one GTIN per component.
  Multi-region or multi-GTIN support would require a schema change and separate
  approval.

## 8. Manufacturer-source access and redistribution limitations

- Manufacturer pages and documents were read only to verify identifiers. No page
  text, images or marketing copy is stored in the repository.
- No scraping infrastructure, crawler or bulk downloader was added.
- Access was not uniformly available:
  - MSI and Gigabyte returned HTTP 403.
  - NZXT returned a Cloudflare challenge to direct `curl`, while the support
    article was readable through the fetch tool.
  - NVIDIA’s marketplace timed out or failed at the HTTP/2 layer.
  - AMD GPU pages timed out through the fetch tool but the CPU pages were
    readable; the GPU page contained no identifier in any case.
  - Intel blocked direct `curl` but ARK pages were readable through the fetch
    tool.
- No GS1 data was accessed. GS1 access and redistribution terms remain
  unestablished.
- No retailer authorization, affiliate agreement, provider credential or
  redistribution licence is claimed. This document records identifier facts and
  source URLs; it does not assert legal clearance to redistribute manufacturer
  content.
- Manufacturer pages can change, rate-limit access or withdraw products. The
  recorded access timestamp is the evidence date, not a guarantee of current
  availability.

## 9. Human-review backlog

All 50 records are source-verified and **not human-reviewed**:

```ts
humanReview: {
  status: "not-reviewed";
  reviewer: null;
  reviewedAt: null;
  notes: null;
}
```

No reviewer names were invented. No record is described as human-approved.

The backlog grew from 24 to 50 records. Human review remains a separate
governance gate and does not change matching eligibility, which is based on
source verification.

## 10. Validation performed

| Gate                       | Result                                             |
| -------------------------- | -------------------------------------------------- |
| Registry tests             | **23 passed**                                      |
| Full unit suite            | **767 passed / 43 files**                          |
| Pricing suite              | **128 passed / 9 files**                           |
| PC Builder Playwright      | **89 passed** (69 Chromium, 10 Firefox, 10 WebKit) |
| Full production Playwright | **666 passed**                                     |
| Catalogue validation       | **OK** — 101 records / 23 manufacturers            |
| Astro check                | **0 errors, 0 warnings, 0 hints**                  |
| Prettier                   | **Clean**                                          |
| Production build           | **21 pages**, **6 CSP inline hashes**              |

The identity audit reports:

```text
Registry records: 50
Source-verified records: 50
Provisional records: 0
Human-reviewed records: 0
Awaiting human review: 50
Records with MPN: 46
Records with GTIN: 9
Records with both MPN and GTIN: 5
Components with source-verified identity: 50
Components without source-verified identity: 51
Duplicate normalized models: 0
```

## 11. Source facts vs assumptions

Source-derived facts:

- The exact identifier strings displayed on the named manufacturer pages.
- The model or variant named on the same page or specification row.
- The published EAN and UPC for the NZXT H7 Flow black variant.
- The publication of region-specific Corsair `-NA` SKUs.

Explicitly **not** assumed:

- That a US SKU represents another region.
- That a tray or China-specific CPU code equals the boxed code.
- That a colour or edition variant equals a generic catalogue name.
- That a search-index snippet is equivalent to a retrieved manufacturer page.
- That source verification is human review or legal clearance.

## 12. Exclusions

- No catalogue specification or component record change.
- No provider API, credential, live price, stock or affiliate integration.
- No scraping, price polling or currency conversion.
- No recommendation-scoring or budget change.
- No public PC Builder route, navigation or sitemap entry.
- No CSP, security-header, Cloudflare, Wrangler or dependency change.
- No registry schema v2.
