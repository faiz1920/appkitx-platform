# PC Builder Data Verification (M10.3.1)

Verification date: 2026-10-31

Branch: `feature/m10-3-1-pc-data-verification`  
Base: `a722520` (M10.3 merge)  
Scope: verification of the existing 101-record PC Builder catalogue. No catalogue
expansion, no public route, no production configuration changes.

## Executive summary

This pass reviewed every catalogue record and every manufacturer URL, then
deep-verified the compatibility-critical fields requested for M10.3.1: GPU and
case clearance, motherboard M.2 slots, PSU connectors, CPU memory ceilings, and
BIOS evidence.

- 63 existing records were modified (181 field-level changes, including links,
  model identifiers and provenance). 45 records received 96 specification-level
  changes. One cooler record was renamed: the old ID was removed and the
  verified ID was added.
- The initial URL inventory contained 113 distinct URLs. 27 returned HTTP 404;
  all 27 were addressed. 22 were replaced with exact official product/support
  pages and 5 with official data sheets/specification catalogues, including the
  Crucial MX500 product flyer after its product page proved to be
  WAF-blocked/404. The final inventory has **0 known 404s**.
- The final stable sweep covered 112 distinct URLs: 72 HTTP 200, 31 HTTP 403,
  9 HTTP 429, 0 HTTP 404. The 40 bot-blocked/rate-limited URLs (31 + 9) are a
  different dimension from the 27 initial 404s; the figures must not be summed.
- 12 critical-unknown record gaps were resolved. One record (RX 6950 XT) was
  newly flagged because unsupported dimensions were removed. Remaining
  critical-unknown records: 22 (was 33).
- Three malformed Corsair case URLs were found and fixed during this audit, and
  the NZXT H7 Flow and H510 fan-mount counts were corrected against NZXT's
  official spec sheets.
- The PC Builder compatibility engine changed in two narrowly scoped ways:
  - 16-pin GPU adapters now use the manufacturer-documented PCIe 8-pin cable
    count instead of a hard-coded two-cable assumption.
  - Verified M.2 slot-sharing restrictions are surfaced in the compatibility
    result and the UI; they do not change Compatible/Incompatible/Unknown
    semantics.
- Catalogue validation, 548 unit tests, `astro check`, Prettier, the production
  build, 23 PC Builder UI tests and 666 existing e2e tests all pass.

## 1. Verification methodology

1. **Catalogue inventory.** Exported every component ID, category, source URL
   and product URL. The catalogue contains 101 records from 23 manufacturers.
2. **Link audit.** Probed every distinct URL in two inventory snapshots with
   redirects followed. A 200 response was accepted only when the final page was
   the intended manufacturer page, not a generic hub, homepage or collection.
3. **Counting model.** The unit of count is a distinct URL, not an HTTP request.
   Each URL was requested once per sweep. Retries, redirect hops and repeated
   requests were not counted as additional URLs. Initial and final sweeps are
   separate snapshots; a URL can change outcome between them.
4. **Page-content verification.** Read the manufacturer specification page for
   each changed record. Where a manufacturer blocks automated clients (403/429)
   or serves a script-rendered page, the manufacturer URL was read through a
   text rendering of that same URL. The manufacturer URL remains the recorded
   source; the rendering service is a retrieval path, never a source of record.
5. **Field comparison.** Compared each candidate value against the page text.
   A value was changed only when the exact manufacturer-published value was
   visible. Missing values remain `null`.
6. **Cross-checks.** Re-ran catalogue validation, unit tests, type checking,
   formatting, production build and both Playwright suites after the edits.

Authority hierarchy used: manufacturer specification/product page, manufacturer
data sheet, manual or support spec sheet, manufacturer CPU/memory support list.
Retailer listings, forums, reviews and search snippets were used only to locate
a manufacturer page, never as the source of a stored specification.

## 2. Sources inspected and authority

| Area         | Primary sources used                                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NVIDIA GPUs  | NVIDIA GeForce RTX 40-series product specification pages (Founders Edition dimensions, TGP, PSU recommendation, adapter cable requirement)                          |
| AMD GPUs     | AMD Radeon RX 6000/7000 product specification pages (length, slots, board power, PSU recommendation, power connectors)                                              |
| AMD CPUs     | AMD product specification pages; AMD processor-specification catalogue for retired Ryzen 5 5600 / Ryzen 7 5700X pages                                               |
| Intel CPUs   | Intel ARK product specification page for Core Ultra 7 265K                                                                                                          |
| Motherboards | MSI product specification pages; ASUS/ROG Tech Specs; Gigabyte specification pages; ASRock product specification page                                               |
| Cases        | Corsair Tech Specs; Fractal Design specification tabs; Lian Li product specification; Cooler Master specification; NZXT H7 Flow (2024) and H510 support spec sheets |
| PSUs         | Corsair product pages and cable listings; MSI product specification pages                                                                                           |
| Coolers/fans | Corsair product pages and cable/spec tables; ARCTIC product and spec-sheet pages                                                                                    |
| Storage/RAM  | Samsung data sheets/brochure; Crucial MX500 product flyer; G.SKILL specification pages; Corsair/Crucial/Kingston/Western Digital product pages                      |

MSI, Gigabyte, ASUS, ASRock, Intel and NZXT support pages frequently return 403
to automated clients, and several ASUS/ASRock pages are script-rendered. Their
content was read through a text representation of the same manufacturer URL and
matched against the stored values. No retailer or third-party page is recorded
as provenance.

## 3. Source-link audit and reconciliation

### 3.1 What the inventories contain

| Snapshot                  | Source URLs | Product URLs | Shared | Distinct URLs |
| ------------------------- | ----------: | -----------: | -----: | ------------: |
| Initial (M10.3 baseline)  |          98 |           98 |     83 |           113 |
| Final (after corrections) |          97 |           93 |     78 |           112 |

The initial audit was run against the M10.3 catalogue. The final audit was run
after source replacement, including the new official data sheets/support pages
and the Crucial MX500 flyer. The net change from 113 to 112 reflects URL
replacement and removal, not a change in the number of records.

### 3.2 Initial outcomes (113 distinct URLs)

| Outcome  | URLs | Notes                                                                             |
| -------- | ---: | --------------------------------------------------------------------------------- |
| HTTP 200 |   50 | Includes 12 redirects that were replaced and 1 regional redirect retained (below) |
| HTTP 403 |   29 | Bot protection; not missing pages                                                 |
| HTTP 404 |   27 | Dead product pages, moved SKUs, or retired URL structures                         |
| HTTP 429 |    7 | Rate limiting; not missing pages                                                  |

The 27 initial 404s affected exactly 27 records (one distinct URL per record):

| Group                            | Dead URLs | Resolution                                                                                       |
| -------------------------------- | --------: | ------------------------------------------------------------------------------------------------ |
| Corsair product pages            |        17 | Replaced with verified full product slugs                                                        |
| G.SKILL memory kits              |         3 | Replaced with current G.SKILL overview/specification pages                                       |
| Samsung 980 PRO / 870 EVO        |         2 | Dead product links removed; provenance moved to Samsung data sheet / 870 EVO-QVO brochure        |
| AMD Ryzen 5 5600 / Ryzen 7 5700X |         2 | Dead product links removed; provenance moved to AMD processor-specification catalogue            |
| NZXT H7 Flow (2024)              |         1 | Replaced with NZXT's official H7 Flow (2024) support spec sheet                                  |
| ARCTIC P14 PWM                   |         1 | Replaced with the verified single-fan P14 PWM product page                                       |
| Crucial MX500                    |         1 | Replaced with the official Crucial MX500 product flyer after the product page returned 404/WAF   |
| **Total**                        |    **27** | **22 exact product/support pages + 5 official data sheets/specification catalogues; 0 retained** |

Additional redirects that were not accepted:

- **9 AMD Radeon GPU URLs** returned HTTP 200 but redirected to the generic
  Radeon hub. They were replaced with the current per-product pages.
- **2 ASUS ROG STRIX Z890-A URLs** returned HTTP 200 but redirected to the ASUS
  homepage. They were replaced with the ROG Tech Specs and ROG CPU-support
  pages.
- **1 NZXT H510 URL** returned HTTP 200 but redirected to the NZXT cases
  collection. It was replaced with the official H510 support spec sheet.
- **1 Samsung 990 PRO URL** returns HTTP 200 but redirects to a regional Samsung
  storage listing for automated clients. The stored URL is the manufacturer's
  canonical global product URL; it was retained and is flagged for periodic
  re-check. No specification change depended on this page.

Redirects that only moved to the intended product page, changed locale, added a
trailing slash, or moved between manufacturer brand domains (for example,
SanDisk to Western Digital) were accepted after checking the final page.

### 3.3 Final outcomes (112 distinct URLs, stable sweep)

| Outcome  | URLs | Notes                                                                 |
| -------- | ---: | --------------------------------------------------------------------- |
| HTTP 200 |   72 | Includes the Crucial MX500 flyer and all replaced support/data sheets |
| HTTP 403 |   31 | Bot protection                                                        |
| HTTP 429 |    9 | Bot protection/rate limiting                                          |
| HTTP 404 |    0 | The Crucial MX500 dead link was replaced                              |

The 40 bot-blocked/rate-limited URLs are 31 × 403 + 9 × 429. Two of the 429s
(the Crucial DDR5 kit and Crucial P3 Plus product pages) returned HTTP 200 in
the preceding sweep and became 429 during the repeated final sweeps; they are
rate-limited, not missing. Of the 40, 13 are source URLs for records whose
specifications changed (MSI 7, Gigabyte 3, Intel 1, NZXT 2); the other 27 are
product/support links for unchanged or link-only records and were not
content-read in this pass.

### 3.4 How the reported figures relate

The figures in earlier drafts came from different snapshots and must not be
added together:

- **115** was the intermediate final inventory (97 source + 94 product URLs,
  with 76 overlaps). It is not the current final count. The current final
  inventory is **112** after removing three malformed Corsair case URLs that
  duplicated their product slug.
- At the 115-URL snapshot, **76 + 31 + 7 + 1 = 115**, and **38 = 31 + 7**.
  Those are the historical final outcomes.
- **27** is the initial inventory's HTTP 404 count from the separate 113-URL
  sweep. It is not a subset of the 115/112 final inventory and is not added to
  the 38/40 bot-blocked count.
- In the current stable sweep, **72 + 31 + 9 + 0 = 112**, and **40 = 31 + 9**.
- The bridge from the historical 115-URL sweep to the current 112-URL sweep is:
  remove 3 malformed Corsair case URLs (all previously 200), add the MX500 flyer
  (+1 × 200), remove the MX500 product URL (−1 × 404), and two Crucial URLs move
  from 200 to 429 (−2 × 200, +2 × 429). The result is 72 × 200, 31 × 403,
  9 × 429, 0 × 404.
- A distinct URL is counted once per sweep. A URL can change outcome between
  sweeps (Crucial RAM/P3 Plus: 200 → 429; MX500: 404 → replaced → 200 flyer).
  Retries and redirect hops are not counted as additional URLs.

### 3.5 Evidence access for changed records

45 records received specification changes. Their evidence was accessed as
follows:

| Access path                                               | Records | Notes                                                                                                     |
| --------------------------------------------------------- | ------: | --------------------------------------------------------------------------------------------------------- |
| Official manufacturer page, retrieved directly            |      27 | AMD GPUs (10), NVIDIA GPUs (5), Corsair (7), Fractal Design (2), Lian Li (2), Cooler Master (1)           |
| Official manufacturer page, read through a text rendering |      18 | ASUS (4), ASRock (1), MSI (7), Gigabyte (3), Intel (1), NZXT (2); 13 returned 403, 5 were script-rendered |
| **Total**                                                 |  **45** | All 45 use an exact product page, support spec sheet or manufacturer specification page                   |

Link-only provenance changes (no specification change):

- Samsung 980 PRO: official Samsung data sheet (PDF).
- Samsung 870 EVO: official Samsung 870 EVO/QVO brochure (PDF).
- Crucial MX500: official Crucial MX500 product flyer (PDF, Micron asset CDN).
- AMD Ryzen 5 5600 / Ryzen 7 5700X: official AMD processor-specification
  catalogue.
- Corsair, G.SKILL, ARCTIC, ASUS ROG, NZXT and Samsung support/product pages
  listed in section 3.2.

No third-party page is recorded in any `source.url`. The text-rendering service
used for 18 records is not a source of record; the manufacturer URL is.

### 3.6 Known provenance limitations

- **Intel family pages.** Two Intel Core i5/i9 family pages serve four CPU
  records (i5-12400F, i5-14600K, i9-13900K, i9-14900K). These are manufacturer
  pages but not exact SKU pages. No M10.3.1 specification change depends on
  them; exact ARK SKU pages are recommended for a future pass.
- **Kingston Fury family page.** One family page serves two DDR5 kits. No
  M10.3.1 specification change depends on it; exact part-number pages are
  recommended for a future pass.
- **AMD specification catalogue.** One catalogue page serves the two retired
  Ryzen 5000 SKUs; the catalogue contains exact SKU rows. This is the best
  available official replacement for the retired product pages.
- **Samsung 990 PRO regional redirect.** The canonical URL redirects automated
  clients to a regional Samsung storage listing; the exact product page was not
  confirmed for automated clients. The record is unchanged and flagged.
- **Bot-blocked unchanged records.** 27 of the 40 bot-blocked/rate-limited URLs
  belong to records with no specification change and were not content-read in
  this pass. Their links remain manufacturer URLs.

## 4. Fields verified and changed

96 specification fields changed across 45 records (arrays counted as one
field). The remaining changes are source links, model identifiers and
provenance.

| Category    | Records with spec changes | Spec fields changed |
| ----------- | ------------------------: | ------------------: |
| CPU         |                         1 |                   1 |
| GPU         |                        15 |                  23 |
| Motherboard |                        13 |                  42 |
| Case        |                        10 |                  21 |
| PSU         |                         5 |                   8 |
| Cooler      |                         1 |                   1 |
| **Total**   |                    **45** |              **96** |

RAM and storage received no specification changes in this pass; their changes
are source-link/provenance corrections.

### GPU

- RTX 4070 Founders Edition length corrected from 240 mm to **244 mm** (NVIDIA).
- RX 7600 reference length corrected from 210 mm to **204 mm** (AMD).
- RX 7600 XT minimum PSU recommendation corrected from 550 W to **600 W** (AMD).
- RX 7700 XT minimum PSU recommendation corrected from 650 W to **700 W** (AMD).
- RX 6600 / RX 6600 XT slot width set to `null`: AMD does not publish reference
  slot thickness for these SKUs.
- RX 6950 XT length and slot width set to `null`: the current AMD page does not
  publish reference dimensions. The prior values were not manufacturer-supported.
- Added `powerAdapter8pin` for all five NVIDIA Founders Edition records:
  RTX 4090 = 3, RTX 4080 SUPER = 3, RTX 4070 SUPER = 2, RTX 4070 = 2,
  RTX 4060 Ti = 1. AMD records use `null`.
- All AMD GPU source links replaced with current per-product pages.

### Cases

- Corsair 4000D AIRFLOW max PSU length: 180 → **220 mm**.
- Corsair 5000D AIRFLOW max PSU length: 225 → **250 mm**.
- Corsair 7000D AIRFLOW: removed the incorrect front 480 mm radiator mount
  (480 mm is side-mounted; front is up to 420 mm).
- Fractal Design North max cooler height: 170 → **145 mm** (manufacturer spec).
- Fractal Design Meshify 2 Compact max GPU length: 360 → **341 mm**.
- Lian Li LANCOOL 216 max PSU length: 210 → **220 mm**.
- Lian Li O11 DYNAMIC EVO max GPU length: 420 → **426 mm**; max PSU length:
  200 → **220 mm**.
- NZXT H7 Flow (2024): radiator support corrected to 420/360/280/240/140/120 mm
  front, 360/280/240/120 mm top and 140/120 mm rear. Fan mounts corrected to
  **6 × 140 mm** (3 front + 2 top + 1 rear) and **10 × 120 mm** (3 front + 3 top
  - 3 bottom + 1 rear), matching NZXT's support spec sheet.
- NZXT H510: fan mounts corrected to **3 × 140 mm** (2 front + 1 top) and
  **4 × 120 mm** (2 front + 1 top + 1 rear), matching NZXT's support spec sheet.
- Cooler Master Q300L: added the documented 120 mm front radiator position.
- Fractal North, Meshify 2 Compact and Corsair 4000D/5000D: added documented
  140 mm radiator positions.

### Motherboards

All 13 motherboards now have per-slot M.2 data (`m2SlotDetails`), including
protocol, maximum module length, PCIe generation and a `sharingNote` where the
manufacturer documents a restriction. Max-memory and memory-speed ceilings were
corrected where the manufacturer published a higher value:

| Board                             | Change                                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------- |
| MSI MAG B650 TOMAHAWK WIFI        | 128 → 256 GB; max speed 6400 → 7600 MT/s; 3 M.2 slots                                                   |
| ASUS TUF GAMING B550-PLUS         | max speed 4400 → 4600 MT/s; 2 M.2 slots; 6 fan headers; 8-pin CPU power                                 |
| MSI PRO B760M-A WIFI DDR4         | 2 M.2 slots; 4 fan headers                                                                              |
| ASUS TUF GAMING B650-PLUS WIFI    | 128 → 256 GB; max speed 6400 → 7600 MT/s; 3 M.2 slots; 7 fan headers                                    |
| Gigabyte B650M DS3H               | M.2 sharing fields; 4 fan headers                                                                       |
| MSI MPG X670E CARBON WIFI         | 128 → 256 GB; max speed 6400 → 7800 MT/s; 4 M.2 slots; 7 fan headers                                    |
| MSI B550-A PRO                    | M.2 sharing fields                                                                                      |
| Gigabyte B550M DS3H               | M.2 sharing fields                                                                                      |
| ASUS PRIME B760-PLUS D4           | max speed 5333 → 5066 MT/s; 3 M.2 slots; 5 fan headers; CPU power is 8-pin only                         |
| Gigabyte Z790 AORUS ELITE AX      | 128 → 256 GB; 4 M.2 slots; 6 fan headers                                                                |
| ASRock B660M Pro RS               | max speed 3200 → 5333 MT/s; 2 M.2 slots; 5 fan headers; lifecycle unknown → discontinued (official EOL) |
| ASUS ROG STRIX Z890-A GAMING WIFI | 4 → 5 M.2 slots; 192 → 256 GB; max speed 8400 → 9066 MT/s; 8 fan headers; CPU support URL corrected     |
| MSI MAG B860 TOMAHAWK WIFI        | 192 → 256 GB; max speed 6400 → 9200 MT/s; 3 M.2 slots; 7 fan headers                                    |

Documented sharing examples now stored per slot: M.2_2 unavailable on certain
Ryzen 8500/8300 configurations (MSI AM5 boards); M2_3 shares bandwidth with
PCI_E2 (MSI B650); M2_3 shares bandwidth with PCIEX16_2 (ASUS TUF B650); M2_2
disables SATA6G_56 (ASUS TUF B550); M2_2 disables SATA3_0 with a SATA M.2 drive
(ASRock B660M); 22110 modules reduce M2_3 length support (MSI B860).

### PSU

- Corsair RM850e (2023): PCIe 8-pin 4 → **3**; SATA null → **7**.
- Corsair RM750x (2021): SATA null → **10**.
- Corsair RM1000x (2021): SATA null → **14**.
- MSI MPG A850G PCIE5: PCIe 8-pin null → **6**; SATA null → **8**.
- MSI MPG A1000G PCIE5: PCIe 8-pin null → **6**; SATA null → **12**.
- Native 16-pin counts remain native-only; adapters are not counted as native.

### CPU

- Intel Core Ultra 7 265K max memory: null → **256 GB** (Intel ARK).
- AMD `maxPowerW` remains `null`: AMD publishes default TDP but not a per-SKU
  maximum boost/package power. No value was inferred from PPT.

### Cooler

- Corsair H150i ELITE CAPELLIX XT: corrected SKU/model from the H100i SKU to
  **CW-9060070-WW**, added LGA1851 mounting support and the correct source page.

### Source and model identifiers (not specification fields)

- Corsair "H60i RGB ELITE" did not correspond to a current Corsair SKU. The
  record is now the verified **iCUE H60x RGB ELITE** (CW-9060064-WW2, 120 mm,
  one SP120 RGB ELITE fan); the unverified 27 mm radiator thickness is `null`.
  The record ID changed from `cooler-corsair-icue-h60i-rgb-elite` to
  `cooler-corsair-icue-h60x-rgb-elite`.
- Corsair H150i source URL corrected from the H100i SKU page to the H150i page.
- ARCTIC P14 PWM: corrected model to **ACFAN00124A** and replaced the dead
  ACFAN00138A URL with the single-fan P14 PWM page. The official page confirms
  the P14 PWM model and ACFAN00124A identifier.
- Corsair AF120 ELITE and the remaining Corsair cooler/RAM/case/PSU source
  links now use verified full product slugs.
- Crucial MX500: product page removed from `url`; source changed to the official
  Crucial MX500 product flyer on Micron's asset CDN. The flyer supports the
  stored capacity, part number, SATA 6 Gb/s interface, 2.5-inch form factor and
  560/510 MB/s sequential ratings.

## 5. Fields deliberately retained as Unknown

| Field                                      |       Records | Reason                                                                                                                                                                                                                                                            |
| ------------------------------------------ | ------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AMD `maxPowerW`                            |             9 | AMD does not publish a per-SKU maximum boost/package power                                                                                                                                                                                                        |
| Case `maxGpuSlots`                         |            10 | Manufacturers publish expansion-slot count, not maximum GPU slot thickness. Not inferred from slot count                                                                                                                                                          |
| NZXT H510 `maxPsuLengthMm`                 |             1 | Current manufacturer page does not publish a PSU length limit                                                                                                                                                                                                     |
| RX 6600 / RX 6600 XT length and slot width |             2 | AMD does not publish reference dimensions                                                                                                                                                                                                                         |
| RX 6950 XT length and slot width           |             1 | AMD does not publish reference dimensions                                                                                                                                                                                                                         |
| BIOS minimum version                       | all 13 boards | Minimum version varies per CPU; the schema stores one board-level value and the engine therefore keeps BIOS Unknown with the CPU-support-list URL. All 13 support-list URLs were checked: 5 returned HTTP 200, 8 returned 403 (bot protection), none were missing |

## 6. Conflicting or ambiguous manufacturer evidence

- **Core Ultra 7 265K memory ceiling.** The prior record used 192 GB; Intel ARK
  currently states 256 GB. The record now uses the ARK value.
- **AMD RX 6600 / 6600 XT / 6950 XT dimensions.** AMD product pages omit
  reference dimensions. The previous values were removed rather than kept
  without support. Partner-card dimensions must not be attributed to a
  reference card.
- **Corsair H60i / H150i identity.** The prior records combined a product name
  with the wrong Corsair SKU. The corrected records now match real Corsair SKUs
  and their official pages.
- **Conditional case clearance.** Fractal North supports a 355 mm GPU, but only
  300 mm with a 360 mm front radiator. NZXT H510 supports 381 mm only without
  front fans or a radiator mounted. NZXT H7 Flow publishes 410 mm but does not
  quantify a separate radiator-dependent figure. The catalogue stores the
  unconditional maximum and the engine does not model radiator/fan-dependent
  GPU clearance; this is recorded as a remaining limitation rather than
  silently lowering the headline value.
- **M.2 bandwidth sharing.** Sharing notes are stored and surfaced, but the
  engine does not subtract SATA ports or suspend PCIe slots when a shared M.2
  slot is populated. This would require structured sharing rules per board.
- **Crucial MX500 product page.** The canonical product URL returned HTTP 404 in
  headless Chromium with a normal Chrome UA and redirected to a retired
  `/products/ssd/...` path; a minimal user agent received a WAF "Request
  Rejected" page. The product page is not reliably verifiable. The record now
  uses the official Crucial MX500 product flyer, which supports all stored
  fields. The old product URL is no longer stored.
- **Samsung 990 PRO regional redirect.** The canonical URL redirects automated
  clients to a regional Samsung storage listing. The exact product page was not
  confirmed for automated clients; the record is unchanged and flagged.

## 7. Compatibility engine changes

1. **PSU adapter path.** Added `GpuSpecs.powerAdapter8pin` and changed
   `psu-gpu-connectors` to use the manufacturer-documented number of PCIe
   8-pin cables. Previously every 16-pin card was assumed to need two 8-pin
   cables, which was wrong for the RTX 4090/4080 SUPER (three) and RTX 4060 Ti
   (one). If the adapter requirement is undocumented, the rule returns
   **Unknown**, never a guessed verdict.
2. **M.2 sharing evidence.** `M2SlotInfo` now has `sharingNote`. The storage
   rule includes assigned-slot sharing notes in its message/observed data and
   the UI shows them under "M.2 sharing". The rule still assigns slots by
   protocol and length; it does not silently treat a shared slot as free or
   incompatible.
3. No other rule semantics changed. Socket, chipset, RAM generation/capacity/
   speed, PCIe, GPU length, cooler height/radiator, PSU wattage/native
   connectors, case form factor and SATA rules are unchanged.

Focused regression tests cover: three-cable adapter requirement, one-cable
adapter requirement, undocumented adapter requirement, native 16-pin
preference, and M.2 sharing-note propagation.

## 8. Before / after catalogue validation

| Metric                   | M10.3 baseline |      M10.3.1 |
| ------------------------ | -------------: | -----------: |
| Total records            |            101 |          101 |
| Manufacturers            |             23 |           23 |
| CPU / GPU / motherboard  |   16 / 15 / 13 | 16 / 15 / 13 |
| RAM / cooler / storage   |    10 / 11 / 9 |  10 / 11 / 9 |
| PSU / case / case fan    |     9 / 11 / 7 |   9 / 11 / 7 |
| In production            |             84 |           84 |
| Discontinued             |             10 |           11 |
| Unknown availability     |              7 |            6 |
| Duplicate IDs            |              0 |            0 |
| Invalid records          |              0 |            0 |
| Missing provenance       |              0 |            0 |
| Unverified records       |              0 |            0 |
| Critical-unknown records |             33 |           22 |

The lifecycle change is the ASRock B660M Pro RS: ASRock's official page marks
it end-of-life/discontinued in January 2025.

Critical unknowns resolved: 12 record gaps (9 motherboard M.2 maps, 1 Core
Ultra memory ceiling, 2 MSI PSU connector inventories). One record (RX 6950 XT)
was newly flagged because unsupported dimensions were removed. The remaining
22 records are 10 cases without documented GPU slot thickness, 9 AMD CPUs
without a published maximum boost power, and 3 AMD GPUs without published
reference dimensions.

## 9. Reference-integrity checks

### 9.1 URL integrity

- Three Corsair case product URLs (`4000D`, `5000D`, `7000D`) had a duplicated
  product slug introduced during link normalisation. They were corrected to the
  canonical Corsair URLs. A regression test pins the exact URLs.
- A duplicate-slug scan over every catalogue URL now returns 0 suspicious URLs.
- The Crucial MX500 dead product URL was removed; the record now points to the
  official product flyer.
- The initial 27 dead URLs are all resolved. The final stable sweep has 0 known
  404s.

### 9.2 Cooler ID migration

Search scope: the entire repository, excluding `node_modules`, `dist` and `.git`.

- Old ID `cooler-corsair-icue-h60i-rgb-elite`: **0 matches** in `src`, `tests`,
  `e2e-pc-builder`, scripts and configuration. The only two occurrences are the
  intentional migration notes in this document.
- New ID `cooler-corsair-icue-h60x-rgb-elite`: present in
  `src/lib/pc-builder/catalogue/coolers.ts` and in the regression test.
- No duplicate/conflicting H60 record: the catalogue contains exactly one
  cooler whose name contains "H60", verified by test.
- No catalogue, compatibility, UI or fixture reference to the old ID was left
  behind.
- No persistence or URL state depends on component IDs (`localStorage`,
  `sessionStorage`, query parameters and history state are not used by the PC
  Builder), so no backward-compatibility shim is required.
- Regression coverage asserts the corrected identity: name `iCUE H60x RGB
ELITE`, model `CW-9060064-WW2`, Corsair source URL, 120 mm radiator, null
  unverified radiator thickness, exactly one H60 cooler, and no legacy "H60i"
  name.

### 9.3 MX500 provenance

- The old product URL was tested with curl and headless Chromium. It redirected
  to `https://www.crucial.com/products/ssd/crucial-mx500-ssd` and returned 404
  with a normal Chrome UA; a minimal UA received a WAF "Request Rejected" page.
- The replacement is the official "Crucial MX500 SSD B2C Product Flyer (EN)"
  hosted on `assets.micron.com`. The PDF is HTTP 200 and states the MX500
  SATA 6 Gb/s 2.5-inch form factor, CT1000MX500SSD1 part number, 560 MB/s
  sequential read, 510 MB/s sequential write and 360 TBW for the 1 TB model,
  matching the stored record.

## 10. Tests executed

| Check                                   | Result                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------- |
| `npm run pc-builder:validate-catalogue` | 101 records, 0 duplicates, 0 invalid, 0 missing provenance, 0 unverified, Status OK   |
| PC Builder unit tests                   | 548 passed / 31 files (includes new schema, data, rule and reference-integrity tests) |
| `npm run check` (`astro check`)         | 0 errors, 0 warnings, 0 hints                                                         |
| Prettier                                | clean                                                                                 |
| `npm run build`                         | 21 pages, CSP hash count unchanged (6)                                                |
| PC Builder Playwright                   | 23 passed                                                                             |
| Existing Playwright regression          | 666 passed                                                                            |

## 11. Remaining human-review items

- Obtain per-CPU minimum BIOS versions from each board's support list if BIOS
  compatibility is to move out of Unknown. This needs a per-CPU schema, not a
  single board-level `biosVersion`.
- Document case GPU slot-thickness limits only where manufacturers publish them;
  do not infer from expansion-slot count.
- Consider modelling radiator/fan-dependent GPU clearance for Fractal North,
  NZXT H510 and NZXT H7 Flow.
- Consider structured M.2 sharing rules (SATA port disablement, PCIe slot
  suspension) if the engine should enforce simultaneous-population limits.
- Re-check the 40 bot-blocked/rate-limited URLs periodically. Two Crucial URLs
  are currently 429 after earlier 200 responses; 429 is transient.
- Replace the Intel Core i5/i9 family pages and the Kingston Fury family page
  with exact SKU/part-number pages in a future provenance pass. No M10.3.1
  specification change depends on them.
- Re-check the Samsung 990 PRO regional redirect; the canonical URL does not
  resolve to the exact product page for automated clients.
- Keep the Crucial MX500 flyer URL under periodic review; the retired product
  page should not be restored.

## Production safety

No production route, navigation entry, sitemap entry, indexability change,
Cloudflare/Wrangler configuration, CSP/HSTS/security header, analytics,
affiliate integration or deployment was added. PC Builder remains development-
only; the production build contains no PC Builder artifacts and no sitemap
references.
