# India-First Hardware Pricing Provider Readiness (M10.8)

Status: research and readiness implementation complete. **Uncommitted for human
review.** No live provider, credential, network request, affiliate link,
tracking, scraping or deployment was added.

- Branch: `feature/m10-8-india-pricing-readiness`
- Repository baseline: `f4ac16bfb8dcf32d1243af52e152dbf970b4a0a6`
- Launch market: India (`in` / `IN`), INR, `en-IN`
- Live pricing integrations: **none**
- Production changes: **none**

## Baseline discrepancy (important)

The M10.8 brief states that M10.7 was merged. It is **not merged** in this
repository:

- `main` and `origin/main` are both at `f4ac16b` (the M10.6 merge).
- The complete M10.7 pricing domain exists only as uncommitted working-tree
  changes on `feature/m10-7-hardware-pricing-architecture`.

Those changes were preserved. The M10.8 branch was created from `f4ac16b` with
the M10.7 working tree intact, and M10.8 builds on the existing contracts. No
M10.7 file was committed, reverted or rewritten. The report separates pre-existing
M10.7 work from M10.8 additions wherever the distinction matters.

## 1. Executive summary

India is already representable by the M10.7 market model. M10.8 adds an explicit
India launch-readiness check, a read-only catalogue identity audit, India-first
test coverage and this provider decision record. It does not connect a provider.

Key findings:

1. **India market configuration is ready.** `in` / `IN` / INR / `en-IN`, two
   paise digits, `₹` symbol, explicit market selection and no currency
   conversion all pass programmatic checks.
2. **Catalogue identity is the main blocker.** Of 101 components, **0** have
   explicit verified MPN metadata and **0** have explicit GTIN metadata. 59
   model strings are MPN-shaped candidates, but a model string is not proof of
   an MPN. 42 are descriptive model names. No duplicates were found.
3. **Two India-capable providers have official documentation:** Amazon
   Creators API (recommended, conditional) and Flipkart Affiliate API
   (secondary, weaker identity and stale documentation).
4. **Both are affiliate programs.** The brief forbids affiliate links, tracking
   or monetization without separate approval. Therefore **no provider may be
   connected until that approval is granted**. Researching them is not approval.
5. **No public non-affiliate API was found** for Indian PC hardware retailers.
   A direct retailer/distributor partnership is the only non-affiliate path;
   scraping is explicitly excluded and was not used.
6. Amazon `OffersV2` returns featured listings only, not every seller's offer.
   It also omits shipping, tax and delivery information. The existing offer
   model can represent this honestly, but build purchase totals will usually
   remain **incomplete**, and no budget-fit claim may be made.
7. The India-first preview now defaults to the India market explicitly. This is
   configuration, not geolocation or browser-language inference.

## 2. M10.7 architecture review

The existing domain under `src/lib/pc-builder/pricing/` was reviewed and reused:

| Area        | Existing implementation                                        | M10.8 use                                        |
| ----------- | -------------------------------------------------------------- | ------------------------------------------------ |
| Money       | Integer minor units, ISO 4217, CLDR precision, no conversion   | INR is exact paise; symbol/precision validated   |
| Markets     | Explicit `Market` records, ISO country/currency, BCP-47 locale | India readiness assessment added                 |
| Sellers     | Retailer/marketplace/marketplace-seller/affiliate identity     | Live adapter must map merchant identity          |
| Matching    | Verified/probable/unverified/rejected with explicit evidence   | Identity audit measures readiness                |
| Offers      | Normalization, provenance, availability, refresh safety        | Live adapter must produce these records          |
| Freshness   | Configurable fresh/aging/stale/expired/unknown                 | Provider TTLs must feed observation times        |
| Aggregation | Market/currency-scoped, cheapest/highest, exclusions           | Unchanged                                        |
| Budget      | Coverage, item total, payable total, incomplete states         | Unchanged; live tax/shipping gaps remain visible |
| Provider    | Replaceable adapter, pagination, rate limits, errors           | Integration design uses this interface           |
| Validation  | URL/id/timestamp/text/payload limits                           | Live adapter must validate before normalization  |

No competing pricing architecture was introduced. M10.8 adds two small pure
modules and one audit script around the existing contracts.

### Contract limitations relevant to a live India integration

These are documented rather than silently worked around:

| Limitation                                         | Impact                                                                 | Safe handling                                                                                                              |
| -------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `Offer` has no `condition` field                   | Amazon may return used/refurbished listings                            | Adapter filters to `condition.value === "New"` before normalization; future optional field if used stock is ever supported |
| `ProviderOfferRecord` has no seller identity       | Amazon returns merchant info per listing                               | Normalize one offer per merchant context; map `merchantInfo.id/name` to a `Seller`                                         |
| Amazon `OffersV2` exposes featured listings only   | No complete all-seller comparison per ASIN                             | Treat each featured listing as one offer; do not claim retailer breadth                                                    |
| Amazon omits shipping, tax and delivery data       | `offerCost().total` is usually `null`                                  | Keep `shipping`, `taxInclusion` and `taxAmount` unknown; never claim a complete total                                      |
| No persisted component↔ASIN mapping                | ASIN alone cannot identify a catalogue component                       | Maintain a verified identifier registry keyed by component id; match on MPN/GTIN, never title                              |
| One `FreshnessPolicy` is shared by price and stock | Independent timestamps exist, but thresholds are shared                | Accept for launch; add an optional stock policy later if provider behavior requires it                                     |
| No cache/LKV or scheduler in the pure domain       | Refresh scheduling and last-known-valid storage are outside the domain | Implement in the server adapter; never move persistence into catalogue records                                             |
| `Offer` has no seller rating/delivery estimate     | Cannot rank by service quality                                         | Do not infer; display only what is modeled                                                                                 |
| Amazon price is address-dependent                  | API price may differ from a specific customer's checkout               | Label as an observed marketplace price; link to the source for confirmation                                                |

## 3. Indian provider comparison

Research date: **2026-10-31**. Only official documentation, official terms or
directly verifiable commercial information was used.

| Candidate                                                                                    | Official API evidence                                                                      | India / INR                                            | Product identity                                                                     | Stock / price                                                                             | Access and commercial terms                                                                                                             | Confidence                                                                                        | Verdict                                              |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Amazon Creators API**                                                                      | Official REST API: `SearchItems`, `GetItems`, `GetVariations`, `GetBrowseNodes`; OAuth 2.0 | `www.amazon.in`, INR, `en_IN`; India locale documented | `itemInfo.manufactureInfo.itemPartNumber`, `model`; `itemInfo.externalIds.eans/upcs` | `offersV2.listings.price.money`, `availability.type`, `condition`; featured listings only | Amazon Associates acceptance + at least 10 qualifying sales in 30 days; affiliate links/attribution; IP licence; offer cache TTL 1 hour | **High** for API and India; **medium** for PC coverage                                            | **Recommended, conditional on affiliate approval**   |
| **Flipkart Affiliate API**                                                                   | Official product/offer/report APIs with token headers                                      | India marketplace, INR amounts                         | `productId`, `styleCode`, brand, category specs; **no guaranteed MPN/GTIN field**    | `inStock`, `isAvailable`, MRP/selling/special price, shipping charges, seller name        | Registered affiliates only; 20 calls/sec; 500 items/request; URLs expire in 10 hours; no sub-licensing or competitive platform use      | **High** that docs exist; **medium** that access is currently open; **low** for verified matching | **Secondary, conditional**                           |
| Direct Indian retailers (MDComputers, PrimeABGB, Vedant, EliteHubs, The IT Depot, PC Studio) | No public developer/API documentation found                                                | India, INR on storefronts                              | Store-specific; no public contract                                                   | Storefront only                                                                           | Requires a direct commercial/partner agreement; no public API terms                                                                     | **High** that no public docs were found                                                           | **Not selectable without a partnership**             |
| Amazon SP-API Product Pricing API                                                            | Official seller API                                                                        | India seller accounts possible                         | Seller's own SKUs                                                                    | Seller's own pricing/offers                                                               | Seller authorization only                                                                                                               | **High**                                                                                          | **Rejected** — not a market/competitor price source  |
| Cuelinks                                                                                     | Official Monetization API                                                                  | India affiliate network                                | Campaign/link data, not product catalogue                                            | No product price/stock feed                                                               | Publisher API key; affiliate link conversion                                                                                            | **High**                                                                                          | **Rejected** — link monetization only                |
| INRDeals                                                                                     | Publisher page advertises Store/Reports/Deal Feed APIs                                     | India affiliate network                                | Aggregated merchant data                                                             | Deal feed, not a documented product-price contract                                        | Publisher account; docs not public                                                                                                      | **Low**                                                                                           | **Rejected for now** — no verifiable public contract |
| Third-party scraping/aggregator APIs (Apify, ReefAPI, PricesAPI, etc.)                       | Commercial endpoints exist                                                                 | Some claim Amazon/Flipkart India                       | Unclear provenance                                                                   | Scraped/aggregated                                                                        | No evidence of retailer authorization; conflicts with no-scraping rule                                                                  | **Low**                                                                                           | **Excluded** — not a lawful first-party integration  |
| Google Content API for Shopping                                                              | Official merchant feed API                                                                 | India `maximumRetailPrice` field                       | Merchant-supplied GTIN/MPN                                                           | Merchant's own feed                                                                       | Merchant account                                                                                                                        | **High**                                                                                          | **Rejected** — not market price discovery            |

### Why Amazon is first

- Current, actively documented successor to PA-API 5 (PA-API 5 is deprecated
  and returns HTTP 403).
- Official India marketplace mapping (`www.amazon.in`) and INR currency.
- Strong identity fields: manufacturer part number, model, EAN/UPC.
- Offer condition and availability are explicit.
- OAuth 2.0 with documented token lifetime and caching rules.
- Explicit rate limits and cache TTLs make the freshness design implementable.

### Why Flipkart is second

- Official, India-specific product feed with price and stock.
- Useful fallback if Amazon affiliate access is unavailable.
- But documentation was last updated in **July 2016**, no MPN/GTIN contract is
  documented, and the feed exposes one seller per listing.
- Secondary reports suggest new direct affiliate registrations may be paused.
  That is not confirmed by official documentation and must be verified directly
  with Flipkart before relying on it.

### Critical approval condition

Both viable providers are affiliate programs. The M10.8 brief says:

> Do not add affiliate links, tracking, or monetization without separate
> approval.

Therefore the recommendation is **not** an approval to integrate. If affiliate
links/tracking are not approved, the correct path is a direct retailer or
distributor partnership. Scraping is not an acceptable fallback.

## 4. Official documentation and licensing evidence

Accessed 2026-10-31.

### Amazon Creators API

- Introduction and prerequisites:
  <https://affiliate-program.amazon.com/creatorsapi/docs/en-us/introduction>
  - Requires Amazon Associates enrolment for the target marketplace.
  - Requires at least 10 qualifying sales in the past 30 days.
  - Requires registration and generated credentials.
- India locale reference:
  <https://affiliate-program.amazon.com/creatorsapi/docs/en-us/locale-reference/india>
  - Marketplace `www.amazon.in`.
  - Default language `en_IN`.
  - Default currency `INR`; only INR is listed as a valid currency.
- API rates:
  <https://affiliate-program.amazon.com/creatorsapi/docs/en-us/concepts/api-rates>
  - Initial limit up to 1 TPS and 8,640 TPD for the first 30 days.
  - Limits adjust with shipped revenue; access can be lost after 30 days
    without qualified referring sales.
- Best programming practices and cache TTLs:
  <https://affiliate-program.amazon.com/creatorsapi/docs/en-us/concepts/best-programming-practices>
  - Offers: 1 hour cache.
  - BrowseNodeInfo: 1 hour.
  - Other resources: 1 day.
  - Access tokens valid for 1 hour and must be reused.
  - Vended links must not be altered; partner tag must be correct.
- `ItemInfo` resources:
  <https://affiliate-program.amazon.com/creatorsapi/docs/en-us/api-reference/resources/item-info>
  - `externalIds.eans`, `externalIds.upcs`.
  - `manufactureInfo.itemPartNumber`, `manufactureInfo.model`.
  - `byLineInfo.brand`, `byLineInfo.manufacturer`.
- `OffersV2` resource:
  <https://affiliate-program.amazon.com/creatorsapi/docs/en-us/api-reference/resources/offersV2>
  - `listings.price.money`, `savingBasis`, `savings`.
  - `availability.type`: `IN_STOCK`, `IN_STOCK_SCARCE`, `OUT_OF_STOCK`,
    `PREORDER`, `LEADTIME`, `AVAILABLE_DATE`, `UNAVAILABLE`, `UNKNOWN`.
  - `condition.value`: New, Used, Refurbished, Unknown.
  - `merchantInfo.id/name`.
  - Delivery, shipping and feedback fields are explicitly not available.
  - Only featured listings are returned.
- Licence and operating agreement:
  <https://affiliate-program.amazon.com/creatorsapi/docs/en-us/license-agreement>
  - India licence:
    <https://affiliate-program.amazon.in/help/operating/agreement>
  - Associates Program IP Licence and Operating Agreement apply.
- PA-API 5 deprecation notice:
  <https://webservices.amazon.com/paapi5/documentation>
  - PA-API 5 is deprecated; callers receive HTTP 403 and are directed to the
    Creators API. M10.8 does not build on PA-API 5.

### Flipkart Affiliate API

- Overview:
  <https://affiliate.flipkart.com/api-docs/af_overview.html>
  - Product, offer and report APIs for registered affiliates.
- Product API reference:
  <https://affiliate.flipkart.com/api-docs/af_prod_ref.html>
  - Product feeds, delta feeds, search, product ID lookup.
  - `productId`, `title`, `productBrand`, `mrp`/`maximumRetailPrice`,
    `price`/`flipkartSellingPrice`, `flipkartSpecialPrice`, `inStock`,
    `isAvailable`, `shippingCharges`, `sellerName`.
  - 500 items per request, `nextUrl` continuation, 10-hour URL validity.
  - No documented MPN/GTIN field.
- Registration:
  <https://affiliate.flipkart.com/api-docs/af_register.html>
  - `Fk-Affiliate-Id` and `Fk-Affiliate-Token` headers; one token per affiliate.
- Terms of use:
  <https://affiliate.flipkart.com/api-docs/af_tou.html>
  - Registered affiliates only.
  - 20 calls per second.
  - No sub-licensing, distribution or derivative works.
  - No use in a similar or competitive platform.
  - India governing law; Bangalore jurisdiction.
- Release notes:
  <https://affiliate.flipkart.com/api-docs/af_changelog.html>
  - Created January 2016; last updated 27 July 2016.

### Other candidates

- Amazon SP-API Product Pricing API:
  <https://developer-docs.amazon/sp-api/docs/product-pricing-api>
  - Seller-authorized pricing for the seller's own catalogue; not a general
    competitor/market price API.
- Google Content API for Shopping:
  <https://developers.google.com/shopping-content/reference/rest/v2.1/products>
  - Merchant product feed with `mpn`, `gtin`, `price`, India-only
    `maximumRetailPrice`; not a live retailer price source.
- Cuelinks Monetization API:
  <https://developers.cuelinks.com/docs>
  - Campaigns, link conversion, offers, transactions; no product price/stock
    feed.
- INRDeals publisher page:
  <https://inrdeals.com/publisher>
  - Advertises Store/Reports/Deal Feed/Short URL APIs, but no public technical
    contract; publisher account required.
- Direct retailer homepages:
  - <https://mdcomputers.in/>
  - <https://www.primeabgb.com/>
  - <https://www.vedantcomputers.com/>
  - <https://elitehubs.com/>
  - <https://www.theitdepot.com/>
  - <https://www.pcstudio.in/>
  - No public developer/API documentation was found. Absence of public docs is
    not proof that a private integration does not exist.

## 5. Recommended provider and rationale

**Primary recommendation: Amazon Creators API, India marketplace, conditional
on explicit affiliate and legal approval.**

Rationale:

1. Official, current API with an India marketplace and INR.
2. Identity evidence is strong enough to support the existing verified/probable
   matching model (MPN, model, EAN/UPC).
3. Availability, condition, merchant and price are explicit.
4. Rate limits and cache TTLs are documented, so freshness can be honest.
5. OAuth 2.0 separates credentials from requests and supports server-side token
   caching.

**Second option: Flipkart Affiliate API, only if Amazon access is unavailable
and Flipkart confirms that API access is currently open.** Its feed is
India-specific and includes price/stock, but it lacks documented MPN/GTIN
identity, so most matches would remain probable or unverified. It must not be
used to claim verified purchase options without an independent identity source.

**Non-affiliate option: direct retailer/distributor partnership.** No public
API documentation was found. A partnership could define a first-party feed with
INR prices, stock, MPN/GTIN and caching/attribution terms. This is the only
acceptable path if affiliate links/tracking are rejected.

**Stop condition:** if affiliate approval is refused and no partnership is
signed, stop. Do not scrape, do not use a third-party scraping API, and do not
fabricate prices, stock or identifiers.

## 6. India market readiness

The India market remains ordinary configuration in `regions.ts`. M10.8 adds
`src/lib/pc-builder/pricing/india.ts`:

```ts
INDIA_MARKET_ID = "in";
INDIA_COUNTRY_CODE = "IN";
INDIA_CURRENCY = "INR";
INDIA_DISPLAY_LOCALE = "en-IN";
INDIA_CURRENCY_PRECISION = 2;
INDIA_CURRENCY_SYMBOL = "₹";
```

`assessIndiaMarketReadiness()` checks:

| Check              | Expected       | Result |
| ------------------ | -------------- | ------ |
| Market configured  | `in` exists    | Pass   |
| Market id          | `in`           | Pass   |
| Country code       | `IN`           | Pass   |
| Default currency   | `INR`          | Pass   |
| Supported currency | includes `INR` | Pass   |
| Currency precision | 2              | Pass   |
| Display locale     | `en-IN`        | Pass   |
| Rendered symbol    | `₹`            | Pass   |

The check fails closed: a missing or misconfigured market returns `ready: false`
and a list of failed checks; it is never repaired silently.

INR behaviour:

- Stored as integer paise (`₹29,999.00` = `2999900`).
- `parseMoney` rejects more than two non-zero decimal digits.
- `formatMoney(..., "en-IN")` uses Indian digit grouping
  (`₹1,23,456.78`).
- Adding or comparing INR with USD/EUR/GBP fails with `currency-mismatch`.
- No exchange-rate feed or conversion exists.
- Shipping and tax stay unknown unless a provider explicitly supplies them.
- The development preview now selects India by default. This is an explicit
  launch configuration; there is no geolocation or `Accept-Language` inference.

Other markets (`us`, `gb`, `de`) remain unchanged and selectable.

## 7. Catalogue product identity audit

The audit is implemented in
`src/lib/pc-builder/pricing/identity-audit.ts` and exposed by the read-only
script `scripts/audit-pc-pricing-identities.ts`. Run it with:

```sh
npx esbuild scripts/audit-pc-pricing-identities.ts \
  --bundle --platform=node --format=esm --outfile=/tmp/pc-identity-audit.mjs
node /tmp/pc-identity-audit.mjs
```

Current result:

| Metric                                           | Count |
| ------------------------------------------------ | ----: |
| Total components                                 |   101 |
| Verified-match ready (explicit MPN or GTIN)      | **0** |
| Explicit MPN                                     |     0 |
| Explicit GTIN                                    |     0 |
| MPN-shaped model strings (unverified candidates) |    59 |
| Descriptive model names                          |    42 |
| Missing model                                    |     0 |
| Duplicate normalized models                      |     0 |

By category (total / verified / MPN-shaped / descriptive):

| Category    | Total | Verified | MPN-shaped | Descriptive |
| ----------- | ----: | -------: | ---------: | ----------: |
| CPU         |    16 |        0 |         16 |           0 |
| GPU         |    15 |        0 |          0 |          15 |
| Motherboard |    13 |        0 |          0 |          13 |
| RAM         |    10 |        0 |         10 |           0 |
| Cooler      |    11 |        0 |          6 |           5 |
| Storage     |     9 |        0 |          9 |           0 |
| PSU         |     9 |        0 |          7 |           2 |
| Case        |    11 |        0 |          9 |           2 |
| Case fan    |     7 |        0 |          2 |           5 |

Interpretation:

- An MPN-shaped string is a triage signal only. It is **not** a verified MPN.
  The heuristic can classify a short model/chipset string such as `B650M` as a
  candidate; that must never be promoted to a verified match automatically.
- Exact model + manufacturer is `probable`, not `verified`, under the existing
  matching rules. A provider calling a catalogue model an "MPN" does not change
  that, because the catalogue identity has no explicit MPN evidence.
- GPU board-partner variants, RAM kits and storage capacities remain distinct
  because matching never falls back to titles or family names.
- Regional SKUs remain distinct when both sides declare a region.

### Smallest backward-compatible proposal

Do **not** add prices or stock to catalogue records, and do not rewrite 101
records with unverified identifiers. The smallest safe extension is an optional,
separate identity registry keyed by stable component id:

```ts
interface CatalogueIdentifierRecord {
  componentId: string;
  manufacturerPartNumber: string | null;
  gtins: readonly string[];
  region: string | null;
  source: { name: string; url: string; verifiedAt: string };
}
```

`catalogueIdentity()` would merge this registry when present. Records without a
verified entry keep `null` MPN/GTIN and remain model-only. This preserves
catalogue validation, compatibility behaviour and the separation between
specifications and commercial data. It was **not** implemented because no
verified MPN/GTIN source has been approved; inventing one is prohibited.

## 8. Proposed server-side integration architecture

No part of this design is implemented in M10.8.

```
Browser (dev preview only)
        │  no credentials, no provider calls
        ▼
AppKitX server boundary (future: Cloudflare Worker/Pages Function or service)
        │
        ├── provider allowlist + kill switch
        ├── OAuth token cache (Credential ID/Secret)
        ├── rate limiter / scheduler
        ├── provider adapter (Amazon or Flipkart)
        ├── raw-response validation + size limits
        ├── product matching (MPN/GTIN/model)
        ├── normalizeOffer() → Offer (INR, provenance, availability)
        ├── cache / last-known-valid store (offers ≤ 1h, metadata ≤ 1d)
        └── redacted observability
        │
        ▼
AppKitX pricing domain (pure): aggregateOffers(), estimateBuildPurchase()
```

### Credential management

| Secret                   | Location                                            | Browser exposure |
| ------------------------ | --------------------------------------------------- | ---------------- |
| Amazon Credential ID     | Server secret store                                 | Never            |
| Amazon Credential Secret | Server secret store                                 | Never            |
| Amazon Partner Tag       | Server config (not a secret, but server-controlled) | Vended URL only  |
| Flipkart Affiliate ID    | Server secret store                                 | Never            |
| Flipkart Affiliate Token | Server secret store                                 | Never            |

OAuth access tokens are cached server-side for their documented lifetime
(1 hour), shared across requests, never logged and never returned to the client.
No credentials are added to `Offer`, `Seller`, `ProviderOfferRecord`,
`NormalizeOfferContext` or any local-storage payload.

### Request flow

1. A scheduled job or explicit server request selects the India market.
2. The adapter searches by ASIN/keyword or fetches known ASINs in batches.
3. Response envelope is size-checked, schema-validated and timestamped.
4. `itemInfo` is mapped to a `ProviderProductRecord`.
5. `matchProduct()` compares it with catalogue identities. Only verified
   matches are purchase-eligible by default; probable requires explicit opt-in.
6. Each featured listing is mapped to one `ProviderOfferRecord` with its
   merchant identity and condition.
7. `normalizeOffer()` validates INR, URLs, timestamps, availability and
   provenance.
8. Verified offers are cached with the provider TTL and aggregated by market and
   currency.
9. The UI displays freshness, availability, provenance and explicit
   incompleteness; it never receives credentials.

### Amazon field mapping

| Amazon field                                    | Domain field             | Rule                                       |
| ----------------------------------------------- | ------------------------ | ------------------------------------------ |
| `asin`                                          | `providerProductId`      | Provider id only; never a catalogue id     |
| `itemInfo.manufactureInfo.itemPartNumber`       | `manufacturerPartNumber` | Candidate MPN; requires manufacturer match |
| `itemInfo.externalIds.eans/upcs`                | `gtin`                   | Validate check digit and uniqueness        |
| `itemInfo.manufactureInfo.model`                | `modelNumber`            | Probable evidence with manufacturer        |
| `itemInfo.byLineInfo.manufacturer`              | `manufacturer`           | Normalize; never infer                     |
| `offersV2.listings.merchantInfo.id/name`        | `Seller.id/displayName`  | Marketplace seller identity                |
| `offersV2.listings.price.money.amount/currency` | `price`                  | INR only; exact decimal parse              |
| `price.savingBasis.money`                       | `listPrice`              | Optional; only when explicitly supplied    |
| `price.savings`                                 | `discount`               | Derived, never fabricated                  |
| `availability.type`                             | `AvailabilityState`      | Explicit mapping below                     |
| `condition.value`                               | adapter filter           | Accept only `New` for launch               |
| `detailPageURL`                                 | `provenance.productUrl`  | HTTPS; keep vended parameters intact       |

### Availability mapping

| Amazon type          | Domain state   |
| -------------------- | -------------- |
| `IN_STOCK`           | `in-stock`     |
| `IN_STOCK_SCARCE`    | `limited`      |
| `OUT_OF_STOCK`       | `out-of-stock` |
| `PREORDER`           | `preorder`     |
| `LEADTIME`           | `backorder`    |
| `AVAILABLE_DATE`     | `preorder`     |
| `UNAVAILABLE`        | `out-of-stock` |
| `UNKNOWN` or missing | `unknown`      |

Missing availability is never in stock. A stale stock observation becomes
`unknown`, independently of price freshness.

### Freshness and caching

| Data                      | Provider TTL | Domain treatment                                              |
| ------------------------- | ------------ | ------------------------------------------------------------- |
| Offers (price/stock)      | 1 hour       | Observation time recorded; aging label after policy threshold |
| Item metadata             | 1 day        | Not used as a current price                                   |
| Last-known-valid fallback | ≤ 24 hours   | Served only with age label; expired after 24 hours            |

Launch policy starts from the M10.7 defaults (fresh ≤ 30 minutes, aging ≤ 6
hours, stale ≤ 24 hours, expired after 24 hours). A provider-specific policy can
later set a 1-hour fresh window for offers, but it must be documented and must
never exceed the licence terms or 24 hours.

### Rate limiting, retries and pagination

- Respect Amazon's 1 TPS / 8,640 TPD initial allocation; read the account's
  current allocation from the provider.
- Batch up to 10 ASINs per `GetItems` request.
- Token-bucket limiter; one in-flight refresh per ASIN/component.
- Exponential backoff with jitter on `429`, `5xx` and timeouts; honour
  `Retry-After` when supplied.
- No unbounded retry loops. A failed refresh returns the last known valid offer
  unchanged and records the failure.
- Amazon `GetItems` returns a bounded item set; Flipkart uses `nextUrl` with 500
  items and 10-hour URL validity.
- Never fetch in response to a browser request if it would expose credentials;
  the browser calls the AppKitX server, not the provider.

### Error and timeout handling

| Condition                   | Domain result                   | User-visible behavior             |
| --------------------------- | ------------------------------- | --------------------------------- |
| Timeout                     | `ProviderError("timeout")`      | Keep last valid offer; label age  |
| 401/403                     | `unauthorized`                  | Disable provider, alert operators |
| 429                         | `rate-limited` + `retryAfterMs` | Backoff; no new price claim       |
| 5xx                         | `unavailable`                   | Serve cached data within TTL      |
| Malformed JSON/schema       | `invalid-response`              | Do not overwrite last valid offer |
| Not found                   | `not-found`                     | No offer; no substitution         |
| Unsupported market/currency | `unsupported-market/currency`   | Fail closed                       |

### Outage behavior

- A provider outage never makes an old price look current.
- The last known valid offer remains available only with its original
  observation timestamp and declining freshness state.
- After 24 hours it is expired and excluded from current comparisons.
- No synthetic or estimated value fills a gap.
- A circuit breaker and provider kill switch are required before launch.

### Observability

Record, without secrets or personal data:

- request count, latency, status class and error code;
- cache hit/miss and freshness distribution;
- match state counts (verified/probable/unverified/rejected);
- excluded-offer reason counts;
- last successful refresh time per provider/market;
- rate-limit remaining/reset.

Never log access tokens, credential secrets, full vended URLs with tracking
parameters, or raw provider payloads containing merchant/customer data.

## 9. Security and operational considerations

| Risk                             | Control                                                                                        |
| -------------------------------- | ---------------------------------------------------------------------------------------------- |
| Credential leakage               | Server-only secret store; no browser bundle, localStorage or logs; token cache server-side     |
| SSRF / unsafe URLs               | Fixed provider hosts; HTTPS only; reject credentials in URLs; do not fetch arbitrary user URLs |
| Untrusted provider data          | Schema, size, text, id, currency, timestamp and availability validation before normalization   |
| HTML/script injection            | Provider content is data only; never render as HTML or execute                                 |
| Used/refurbished mixing          | Filter `condition.value === "New"`; future explicit condition field                            |
| Stale price presented as current | Mandatory observation time; fresh/aging/stale/expired states; 24-hour ceiling                  |
| Currency mixing                  | INR-only India market; `aggregateOffers` refuses cross-currency comparisons                    |
| Budget overclaim                 | `purchaseTotal` null when coverage/shipping/tax incomplete; budget status `incomplete`         |
| Provider outage                  | Last-known-valid with age label; circuit breaker; no fabricated fallback                       |
| Affiliate/tracking               | Not enabled; requires separate written approval and disclosure review                          |
| Scraping                         | Prohibited; no scraper, no scraping API, no headless browser collection                        |
| Personal data                    | No accounts, no geolocation, no analytics; do not store customer data                          |
| Licence breach                   | Cache TTLs, attribution, vended-link integrity and operating-agreement review before launch    |

## 10. Budget and recommendation integration assessment

The M10.4 recommendation engine remains specification-based. No scoring code
was changed.

The existing `estimateBuildPurchase` contract can consume INR offers without
modification:

- Maps each required component to its cheapest eligible offer in the same
  market and currency.
- Excludes stale/expired prices, unavailable stock, unverified matches and
  probable matches by default.
- Reports `coveragePercent`, `partialItemTotal`, `itemTotal`, `purchaseTotal`,
  `partialPurchaseTotal` and `completeness`.
- Reports `budgetStatus` only when coverage and costs are complete and the
  budget currency matches.

India launch implications:

1. **Component-level INR prices** are supported exactly in paise.
2. **Build subtotal** is available only when every required component has an
   eligible current offer.
3. **Shipping and tax completeness** will usually be `incomplete` for Amazon
   because `OffersV2` omits delivery/shipping and does not state tax inclusion.
   Flipkart exposes shipping charges but not a reliable tax-inclusion contract.
4. **Unavailable components** reduce coverage; the estimate stays partial.
5. **Budget fit** must remain `incomplete` until every component has a complete
   payable cost. A low item price must never become a "within budget" claim.
6. **Cheapest eligible offer** is computed only within one market and currency.
7. **No currency conversion** is introduced, even for display.

Recommended future sequence:

1. Approve a provider and identity source.
2. Populate verified component↔provider mappings.
3. Run a shadow integration that compares observed offers with manual checks.
4. Add coverage/freshness metrics and a visible "prices are incomplete" state.
5. Only then connect the purchase estimate to the recommendation UI, without
   changing compatibility or safety scoring.

## 11. Test results and regression comparison

Commands were run on 2026-10-31 from the M10.8 branch.

| Gate                       | M10.7 baseline (uncommitted tree) |                      M10.8 result | Change             |
| -------------------------- | --------------------------------: | --------------------------------: | ------------------ |
| Unit tests                 |                    717 / 41 files |                **744 / 42 files** | +27 tests, +1 file |
| Pricing tests              |                      78 / 7 files |                 **105 / 8 files** | +27 tests, +1 file |
| PC Builder Playwright      |                                89 |                            **89** | Unchanged          |
| — Chromium                 |                                69 |                            **69** | Unchanged          |
| — Firefox                  |                                10 |                            **10** | Unchanged          |
| — WebKit                   |                                10 |                            **10** | Unchanged          |
| Full production Playwright |                               666 |                           **666** | Unchanged          |
| Catalogue validation       |                                OK |                            **OK** | Unchanged          |
| `astro check`              |                             0/0/0 | **0 errors, 0 warnings, 0 hints** | Unchanged          |
| Prettier                   |                             Clean |                         **Clean** | Unchanged          |
| Production build           |                          21 pages |                      **21 pages** | Unchanged          |
| CSP inline hashes          |                                 6 |                             **6** | Unchanged          |

The M10.8 brief quotes 639 unit tests / 34 files. That is the pre-M10.7
baseline. The current tree contains the unmerged M10.7 work (which raised the
count to 717/41) plus M10.8's 27 India-readiness tests. Relative to the actual
tree, M10.8 adds 27 tests and one file; relative to the quoted 639/34 baseline,
the combined increase is 105 tests and eight files.

New M10.8 coverage:

- India market configuration and fail-closed readiness checks.
- INR precision, parsing, Indian grouping, rupee symbol and no conversion.
- India market/currency isolation and cross-currency rejection.
- Catalogue identity audit (0 verified, 59 MPN-shaped candidates, 42
  descriptive, 0 duplicates).
- Matching confidence: real catalogue model-only matches remain probable;
  calling a model an MPN does not verify it.
- Expired INR price exclusion and independent stock freshness.
- Provider timeout/rate-limit errors.
- Last-known-valid preservation after malformed refresh.
- No credential material in normalized offers.
- Synthetic seller data rejected in a live-provider context.
- INR build totals, incomplete shipping, and USD-vs-INR budget rejection.
- India-first preview default, market switching, stale/out-of-stock states and
  responsive reflow.

The synthetic fixture set gained an India out-of-stock offer so the first
rollout market exercises fresh, aging, expired and unavailable states without
borrowing another market's data.

### Unrelated transient failure

During the first full PC Builder run, one **saved-builds** Chromium test
(`updates an existing saved build and preserves its creation time`) failed. The
targeted rerun passed, and the subsequent full 89-test PC Builder run passed.
No pricing test failed. This is reported as an unrelated transient, not hidden
or waived.

## 12. Work requiring provider approval

No live integration may proceed until all of the following are approved:

1. **Affiliate/monetization approval** — Amazon Associates links, tracking and
   commission model, or a written decision that affiliate monetization is not
   permitted.
2. **Amazon Associates India acceptance** — account in good standing with at
   least 10 qualifying sales in the past 30 days for Creators API access.
3. **Legal review** — Amazon Associates Operating Agreement and IP Licence
   (India), including attribution, vended-link integrity, caching and
   redistribution restrictions.
4. **Credential issuance** — server-side Credential ID/Secret and partner tag;
   no browser exposure.
5. **Identity source approval** — verified MPN/GTIN evidence and the proposed
   component↔provider mapping registry.
6. **Provider-specific freshness policy** — documented offer TTL (Amazon 1 hour)
   and the 24-hour maximum fallback.
7. **Cache/storage approval** — location, encryption, retention, deletion and
   access control for last-known-valid offers.
8. **Network/egress approval** — fixed provider hosts, rate limits, timeouts,
   retry/backoff and circuit breaker.
9. **UI/compliance review** — live-vs-synthetic labelling, attribution,
   "price may differ at checkout" disclosure, and removal of synthetic badges
   only for approved live data.
10. **Security review** — secret handling, redacted observability, kill switch
    and incident response.
11. **Flipkart fallback confirmation** — only if Amazon is rejected; confirm
    current API access, terms and identity limitations directly with Flipkart.
12. **Direct partnership option** — if affiliate approval is refused, negotiate
    a first-party retailer/distributor feed; do not scrape.

## Appendix A — Synthetic INR offer example

This is a development fixture on an example domain, not a real retailer offer.

```json
{
  "id": "fixture-pricing:in-retail-fresh",
  "componentId": "cpu-amd-ryzen-7-7800x3d",
  "sellerId": "synthetic-retail",
  "marketplaceId": null,
  "marketId": "in",
  "countryCode": "IN",
  "price": { "amountMinor": 2999900, "currency": "INR" },
  "listPrice": { "amountMinor": 3199900, "currency": "INR" },
  "discount": { "amountMinor": 200000, "currency": "INR" },
  "discountPercent": 6.25,
  "shipping": { "amountMinor": 19900, "currency": "INR" },
  "taxInclusion": "included",
  "taxAmount": null,
  "availability": {
    "state": "in-stock",
    "observedAt": "2026-10-31T11:50:00.000Z"
  },
  "restrictions": [],
  "provenance": {
    "providerId": "fixture-pricing",
    "providerOfferId": "in-retail-fresh",
    "providerProductId": "synthetic-product-cpu",
    "productUrl": "https://retailer.example/products/in-retail-fresh",
    "observedAt": "2026-10-31T11:50:00.000Z",
    "lastVerifiedAt": "2026-10-31T11:50:00.000Z",
    "providerUpdatedAt": "2026-10-31T11:50:00.000Z",
    "collectionMethod": "fixture",
    "dataOrigin": "synthetic",
    "matchStatus": "verified"
  }
}
```

## Appendix B — M10.8 files

New:

- `src/lib/pc-builder/pricing/india.ts` — explicit India readiness checks.
- `src/lib/pc-builder/pricing/identity-audit.ts` — catalogue identity audit.
- `scripts/audit-pc-pricing-identities.ts` — read-only audit runner.
- `tests/pc-builder-pricing-india.test.ts` — 27 India readiness tests.
- `PC-BUILDER-M10-8-INDIA-PRICING-READINESS.md` — this document.

Modified:

- `src/lib/pc-builder/pricing/index.ts` — export India readiness and identity
  audit.
- `src/dev/pc-builder/PcBuilder.astro` — explicit India-first preview default.
- `src/dev/pc-builder/pricing-fixtures.ts` — India out-of-stock fixture.
- `e2e-pc-builder/pricing-preview.spec.ts` — India-first assertions.
- `tests/pc-builder-pricing-fixtures.test.ts` — India fixture coverage.

Pre-existing M10.7 uncommitted work retained (the M10.8 files above extend
some of these; no M10.7 work was reverted):

- `src/lib/pc-builder/pricing/*` (other modules)
- `src/dev/pc-builder/pricing-fixtures.ts`
- `src/dev/pc-builder/PcBuilder.astro` pricing preview
- `e2e-pc-builder/pricing-preview.spec.ts`
- `tests/pc-builder-pricing-*` (M10.7 suites)
- `PC-BUILDER-M10-7-PRICING-ARCHITECTURE.md`
- `AppKitX-Design.md`, `PC-BUILDER-GUIDED-RECOMMENDATIONS.md`

No production route, navigation, sitemap, Cloudflare/Wrangler, CSP, HSTS or
security-header file was changed.
