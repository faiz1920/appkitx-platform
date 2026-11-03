# Amazon India Provider Feasibility Assessment (M10.13)

Status: **assessment complete, uncommitted for review**. No integration,
credential, account, API call, scraper, dependency, configuration, route,
deployment or source-code change was made. The only new file is this report.

- Repository: `/Users/faiz/Work/nexverra/appkitx-platform-clean`
- Branch: `main`
- Baseline: `0245b13972cebe285483e4220f0044d2ce9c921f`
- Baseline verification: local `main` = `origin/main`, working tree clean before
  the report was created
- Research/access date: **2026-11-01**
- Recommendation: **CONDITIONAL GO** — technically viable, but Amazon
  Associates/Creators API eligibility, legal review and catalogue identity work
  must be completed before implementation.

## 1. Executive summary

Amazon India is a technically credible first retailer provider, but it is **not
an immediately available integration** for a new platform.

The current official product-catalogue API is the **Amazon Creators API**, a
REST API with OAuth 2.0. Legacy **Product Advertising API 5.0 (PA-API 5) is
deprecated** and returns HTTP 403. The Creators API supports the Amazon.in
marketplace (`www.amazon.in`), INR and `en_IN`, and exposes ASIN, title,
brand/manufacturer, model, item part number, EAN/UPC, images, price, currency,
condition, availability, merchant and detail-page URL.

The main blocker is commercial eligibility, not technical capability:

1. An Amazon.in Associates account must be **fully accepted**. Amazon India
   states that an application is reviewed after **three qualifying sales within
   the first 180 days**.
2. Creators API access requires **at least 10 qualifying sales in the trailing
   30 days** and registration/approval in the target region.
3. Access can be lost after **30 consecutive days without qualified referring
   sales**, and regained only after referred sales ship.
4. The current AppKitX PC Builder is a development-only route, not a public
   site. Amazon Associates review requires a publicly available site with
   original, recent content. Publishing the PC Builder, or using the existing
   public AppKitX site, is a prerequisite independent of coding.
5. Amazon's India IP licence restricts Amazon content to advertising Amazon and
   driving sales to Amazon. A multi-retailer price-comparison table, durable
   storage of Amazon product content, price history and price alerts are
   high-risk or prohibited without written approval.

Catalogue readiness is mixed:

- 101 catalogue components.
- 50 have source-verified identity evidence.
- 0 have human-reviewed catalogue identity.
- 46 have an MPN, 9 have a GTIN, 5 have both.
- 51 have no source-verified identity, including **all 15 GPUs and all 13
  motherboards**.
- 16 model strings are MPN-shaped but unverified; 35 are descriptive.
- At least 51 components will likely require manual ASIN mapping; the other 50
  can produce automatic MPN/GTIN candidates but still require human mapping
  approval.

Recommendation: **CONDITIONAL GO**. Do not build the live Amazon adapter yet.
First complete the Amazon.in Associates/Creators API eligibility path, legal
review of the PC Builder use case, publication/content prerequisites, and a
manual ASIN mapping pilot. The M10.12 provider-independent mapping foundation is
the correct architectural base.

## 2. Research methodology and source list

### Method

- Reviewed current official Amazon global and Amazon.in documentation, Amazon
  India Associates agreements/policies and the Amazon India advertising fee
  schedule.
- Reviewed official Flipkart Affiliate API documentation and terms for the
  alternative-provider comparison.
- Did **not** create an Amazon Associates account, request API credentials, call
  Amazon APIs, scrape Amazon, contact retailers or configure production
  credentials.
- Ran only existing read-only local catalogue/identity audit scripts.
- Distinguished verified facts from assumptions. Each key claim is referenced
  to a source below.
- The Amazon.in Creators API documentation URLs returned HTTP 500 on
  2026-11-01. The equivalent official global Creators API documentation was
  used, together with the Amazon.in operating agreement and the India locale
  reference. This is a documentation-access limitation, not evidence that the
  API is unavailable in India. Reconfirm India-specific onboarding with Amazon
  before implementation.

### Sources

| ID  | Source                                                  | URL                                                                                                  | Date / last update                             | Confidence         |
| --- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------ |
| S1  | Creators API — Introduction                             | https://affiliate-program.amazon.com/creatorsapi/docs/en-us/introduction                             | No explicit update date; accessed 2026-11-01   | High               |
| S2  | Creators API — Onboarding                               | https://affiliate-program.amazon.com/creatorsapi/docs/en-us/onboarding                               | No explicit update date; accessed 2026-11-01   | High               |
| S3  | Creators API — Register for Creators API                | https://affiliate-program.amazon.com/creatorsapi/docs/en-us/onboarding/register-for-creators-api     | No explicit update date; accessed 2026-11-01   | High               |
| S4  | PA-API 5 Deprecation Notice                             | https://webservices.amazon.com/paapi5/documentation/                                                 | No explicit update date; accessed 2026-11-01   | High               |
| S5  | Creators API — API Rates and Limits                     | https://affiliate-program.amazon.com/creatorsapi/docs/en-us/concepts/api-rates                       | No explicit update date; accessed 2026-11-01   | High               |
| S6  | Creators API — Best Programming Practices               | https://affiliate-program.amazon.com/creatorsapi/docs/en-us/concepts/best-programming-practices      | No explicit update date; accessed 2026-11-01   | High               |
| S7  | Creators API — License Agreement index                  | https://affiliate-program.amazon.com/creatorsapi/docs/en-us/license-agreement                        | No explicit update date; accessed 2026-11-01   | High               |
| S8  | Creators API — India Locale Reference                   | https://affiliate-program.amazon.com/creatorsapi/docs/en-us/locale-reference/india                   | No explicit update date; accessed 2026-11-01   | High               |
| S9  | Creators API — GetItems                                 | https://affiliate-program.amazon.com/creatorsapi/docs/en-us/api-reference/operations/get-items       | No explicit update date; accessed 2026-11-01   | High               |
| S10 | Creators API — SearchItems                              | https://affiliate-program.amazon.com/creatorsapi/docs/en-us/api-reference/operations/search-items    | No explicit update date; accessed 2026-11-01   | High               |
| S11 | Creators API — ItemInfo resource                        | https://affiliate-program.amazon.com/creatorsapi/docs/en-us/api-reference/resources/item-info        | No explicit update date; accessed 2026-11-01   | High               |
| S12 | Creators API — OffersV2 resource                        | https://affiliate-program.amazon.com/creatorsapi/docs/en-us/api-reference/resources/offersV2         | No explicit update date; accessed 2026-11-01   | High               |
| S13 | Creators API — Using cURL                               | https://affiliate-program.amazon.com/creatorsapi/docs/en-us/get-started/using-curl                   | No explicit update date; accessed 2026-11-01   | High               |
| S14 | Creators API — Error Codes and Messages                 | https://affiliate-program.amazon.com/creatorsapi/docs/en-us/troubleshooting/error-codes-and-messages | No explicit update date; accessed 2026-11-01   | High               |
| S15 | Amazon.in Associates Program Operating Agreement        | https://affiliate-program.amazon.in/help/operating/agreement                                         | Updated November 2021; accessed 2026-11-01     | High               |
| S16 | Amazon.in Associates Program Participation Requirements | https://affiliate-program.amazon.in/help/operating/policies                                          | No explicit update date; accessed 2026-11-01   | High               |
| S17 | Amazon.in — Account Dormancy                            | https://affiliate-program.amazon.in/help/node/topic/G7MJTPEP9NC3YKMG                                 | No explicit update date; accessed 2026-11-01   | High               |
| S18 | Amazon.in — Application Review Process                  | https://affiliate-program.amazon.in/help/node/topic/G8TW5AE9XL2VX9VM                                 | No explicit update date; accessed 2026-11-01   | High               |
| S19 | Amazon.in Associates Program Advertising Fee Schedule   | https://affiliate-program.amazon.in/gp/associates/help/operating/advertisingfees                     | Table 1: Oct–Nov 2026; accessed 2026-11-01     | High               |
| S20 | Flipkart Affiliate APIs Overview                        | https://affiliate.flipkart.com/api-docs/af_overview.html                                             | © 2015; accessed 2026-11-01                    | Medium             |
| S21 | Flipkart Product APIs Reference                         | https://affiliate.flipkart.com/api-docs/af_prod_ref.html                                             | No explicit update date; accessed 2026-11-01   | Medium             |
| S22 | Flipkart Affiliate API FAQ                              | https://affiliate.flipkart.com/api-docs/af_faq.html                                                  | No explicit update date; accessed 2026-11-01   | Medium             |
| S23 | Flipkart API Terms of Use                               | https://affiliate.flipkart.com/api-docs/af_tou.html                                                  | No explicit update date; accessed 2026-11-01   | Medium             |
| S24 | Flipkart Affiliate API Release Notes                    | https://affiliate.flipkart.com/api-docs/af_changelog.html                                            | Last updated 27 July 2016; accessed 2026-11-01 | High for staleness |
| S25 | Flipkart Affiliate Commissions                          | https://affiliate.flipkart.com/commissions                                                           | November 2026; accessed 2026-11-01             | High               |
| S26 | Internal M10.7–M10.12 architecture docs                 | Local repository                                                                                     | M10.7–M10.12                                   | High               |
| S27 | Internal catalogue/identity audit output                | `scripts/validate-pc-catalogue.ts`, `scripts/audit-pc-pricing-identities.ts`                         | Run 2026-11-01                                 | High               |

### Key evidence excerpts

| Claim                                                                           | Evidence                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PA-API 5 is deprecated and is replaced by Creators API.                         | [S4] states PA-API 5 is deprecated; callers receive HTTP 403 `AccessDeniedException` and are directed to Creators API.                                                                                                 |
| Creators API requires an Associates account and 10 qualifying sales in 30 days. | [S1] prerequisites: enrolled in Amazon Associates for the target marketplace; at least 10 qualifying sales in the past 30 days; register through Associates Central; generate credentials.                             |
| Associates acceptance requires three qualifying sales in 180 days.              | [S17] “Once you have referred three qualifying sales, we’ll evaluate your application”; [S18] “we require at least three within the first 180 days”.                                                                   |
| Creators API sign-up is not immediate.                                          | [S3] requires an Associates account reviewed and finally accepted; sign-up available only to associates who have referred qualified sales and have been accepted.                                                      |
| India marketplace is supported.                                                 | [S8] lists `www.amazon.in`, default language `en_IN`, default currency `INR`, and Computers/Electronics search indices.                                                                                                |
| India uses the EU token endpoint.                                               | [S13] maps India to the EU region/version 3.2 token endpoint `api.amazon.co.uk/auth/o2/token`.                                                                                                                         |
| Access tokens last one hour and must be cached.                                 | [S6] and [S13] state tokens are valid for 3600 seconds and must be reused; token endpoint is rate-limited.                                                                                                             |
| Initial rate limit is 1 TPS / 8,640 TPD for 30 days.                            | [S5] “initial usage limit up to a maximum of one request per second (one TPS) and a cumulative daily maximum of 8640 requests per day (8640 TPD) for the first 30-day period.”                                         |
| Limits scale with shipped revenue and can be lost after 30 days without sales.  | [S5] describes daily adjustment and loss of access after 30 consecutive days without qualified referring sales.                                                                                                        |
| Offers may be cached for one hour; other resources for one day.                 | [S6] cache table: Offers 1 hour; BrowseNodeInfo 1 hour; all other fields/nodes/resources (including ItemInfo and Images) 1 day.                                                                                        |
| Images may not be stored; image links may be stored for 24 hours.               | [S15] IP Licence: may not store/cache image content; may store a link to image content for up to 24 hours; other non-image Product Advertising Content may be cached up to 24 hours; ASINs may be stored indefinitely. |
| Price/availability display needs a timestamp and disclaimer.                    | [S15] requires a date/time stamp when refreshed less than hourly, plus the “Product prices and availability are accurate as of…” disclaimer.                                                                           |
| Price tracking and price alerts are prohibited unless agreed.                   | [S16] item 31: “your site must not have price tracking and/or price alerting functionality” unless otherwise agreed by Amazon.                                                                                         |
| Amazon content must be used to send users/sales to Amazon.                      | [S15] limited licence: copy/display Product Advertising Content solely on your site, solely to send end users and sales to the Amazon Site; link each use to the related Amazon page.                                  |
| Content may not be altered or redistributed.                                    | [S15]/[S16]: no adding/deleting/altering except proportional image resizing or non-material text truncation; no sublicensing/redistribution without written approval.                                                  |
| Amazon.in commission rates are low and category-dependent.                      | [S19] Oct–Nov 2026: Computers 2.45%; Electronics 2.80%; Apple products 0%; Video Gaming Consoles & Hardware excluded.                                                                                                  |
| Flipkart has an official affiliate API but stale documentation.                 | [S20]–[S24]: official product/offer/report APIs; release notes last updated 27 July 2016; unversioned product APIs deprecated.                                                                                         |
| Flipkart API is limited to 20 calls/sec and 500 items/request.                  | [S22]: 20 calls per second per affiliate; 500 items per product feed request; URLs valid 10 hours.                                                                                                                     |

## 3. Amazon API/program findings

### 3.1 Current API status

| Question                              | Finding                                                                                                                      | Confidence                                                   |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Is PA-API 5 current?                  | No. It is deprecated. Calls receive HTTP 403 and are directed to Creators API.                                               | High [S4]                                                    |
| What is the successor?                | Amazon Creators API, REST-based, OAuth 2.0, endpoint `https://creatorsapi.amazon/catalog/v1/...`.                            | High [S1][S4][S13]                                           |
| Does Creators API support Amazon.in?  | Yes. India is a documented locale with `www.amazon.in`, `INR`, `en_IN`, and India search indices.                            | High [S8]                                                    |
| Is it available to Indian Associates? | Yes, for a fully accepted Amazon.in Associate that meets the sales threshold and is approved for Creators API in the region. | High for requirement; medium for individual account approval |
| Is access immediate?                  | No. Associates final acceptance, 10 qualifying sales in 30 days, registration and regional approval are required.            | High [S1][S3]                                                |

### 3.2 Account and approval path

1. **Amazon.in Associates application.** The site must be publicly available,
   owned by the applicant, have original/recent content, and meet the customer
   experience bar. [S18]
2. **Three qualifying sales within 180 days.** Amazon reviews the application
   after three qualifying sales; personal orders do not qualify. [S17][S18]
3. **Final acceptance.** Creators API registration requires an Associates
   account that has been reviewed and finally accepted. [S3]
4. **Ten qualifying sales in the trailing 30 days.** This is the Creators API
   eligibility gate. [S1][S14]
5. **Creators API registration.** Only the primary account owner can register;
   maximum two applications per store and two credential sets per application.
   [S3]
6. **Regional access approval.** Credentials work globally, but the partner tag
   must belong to the target marketplace and Creators API access must be
   approved in that region. [S1 FAQ / S13]

**Implication:** a brand-new AppKitX site with no traffic cannot obtain
Creators API access immediately. The practical bootstrap is to launch the
public site with manual Amazon affiliate links/SiteStripe, generate the required
sales, then apply for Creators API. Manual links are not an API integration and
do not provide automated price data.

### 3.3 Authentication and quotas

- OAuth 2.0 client-credentials flow via Login with Amazon.
- Credential ID + secret + version; bearer token valid 1 hour.
- India uses the EU token endpoint (`api.amazon.co.uk/auth/o2/token`, version
  3.2).
- API headers: `Authorization: Bearer <token>`, `Content-Type:
application/json`, `x-marketplace: www.amazon.in`.
- `partnerTag` must be a valid Amazon.in Associate store/tracking ID.
- Initial limit: **1 TPS / 8,640 TPD for the first 30 days**.
- Limits adjust with shipped revenue: 1 TPD per $0.05, 1 TPS per $4,320, up to
  a maximum of 10 TPS; updated daily.
- Access is lost after 30 consecutive days without qualified referring sales;
  regained within two days after referred sales ship.
- HTTP 429 `ThrottleException` includes `retryAfterSeconds`; implement
  exponential backoff.
- Token endpoint is separately rate-limited; cache tokens, do not fetch per
  request.

### 3.4 Product lookup and search

| Operation        | Capability                                | Limit                                    |
| ---------------- | ----------------------------------------- | ---------------------------------------- |
| `GetItems`       | Retrieve detailed item attributes by ASIN | Up to 10 item IDs per request            |
| `SearchItems`    | Search by keywords/brand/title/actor/etc. | Up to 10 items per page; `itemPage` 1–10 |
| `GetVariations`  | Get parent/child variations               | Documented operation                     |
| `GetBrowseNodes` | Browse-node hierarchy                     | Up to 10 browse node IDs per request     |

There is **no documented full-catalogue dump**. Search returns a maximum of 10
items per page and 10 pages per query. Discovery must therefore use targeted
searches/browse nodes plus a curated ASIN allowlist, not a claim of complete
Amazon catalogue coverage.

### 3.5 Field availability

| Field                     | Available?               | Source / caveat                                                                                                                                                   |
| ------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ASIN                      | Yes                      | `asin`; stable external product ID                                                                                                                                |
| Title                     | Yes                      | `itemInfo.title`                                                                                                                                                  |
| Brand                     | Yes                      | `itemInfo.byLineInfo.brand`                                                                                                                                       |
| Manufacturer              | Yes                      | `itemInfo.byLineInfo.manufacturer`                                                                                                                                |
| Model                     | Yes                      | `itemInfo.manufactureInfo.model`                                                                                                                                  |
| MPN                       | **Partial / unreliable** | `manufactureInfo.itemPartNumber` is described as the item's part number, “sometimes the same as the model number”. It is not guaranteed to be a manufacturer MPN. |
| UPC/EAN/GTIN              | Partial                  | `itemInfo.externalIds.eans`, `upcs`; normalize to GTIN. Not guaranteed present.                                                                                   |
| Images                    | Yes                      | `images.primary.*`, `images.variants.*`; image binaries must not be cached.                                                                                       |
| Price                     | Yes                      | `offersV2.listings.price.money`; featured listings only; address-dependent.                                                                                       |
| Currency                  | Yes                      | INR for Amazon.in                                                                                                                                                 |
| Condition                 | Yes                      | `offersV2.listings.condition.value` (New/Used/Refurbished/Unknown)                                                                                                |
| Availability              | Yes                      | `offersV2.listings.availability.type` plus min/max order quantity; no exact stock count                                                                           |
| Seller                    | Yes                      | `offersV2.listings.merchantInfo.id/name`; featured listing only                                                                                                   |
| Product URL               | Yes                      | `detailPageURL` with partner tag; must not alter URL parameters                                                                                                   |
| Shipping / tax / delivery | No                       | Explicitly not available in OffersV2                                                                                                                              |
| All seller offers         | No                       | OffersV2 returns featured listings, not the full seller set                                                                                                       |

### 3.6 Caching, attribution and display rules

**Caching**

- Offers: **1 hour**.
- BrowseNodeInfo: **1 hour**.
- All other fields/nodes/resources: **1 day** (24 hours).
- Customer information derived from Amazon must not be cached.
- Images: do not store/cache image content; store image links for at most 24
  hours.
- ASINs: may be stored indefinitely.
- Other non-image Product Advertising Content: the India IP Licence permits
  caching for up to 24 hours; refresh and re-display after that.

There is a wording tension between the Creators API best-practice table (which
lists Images under the 1-day cache) and the India IP Licence (which prohibits
storing image content). Treat the India licence as stricter: **do not cache
image binaries; cache only the URL for up to 24 hours.** Confirm this
interpretation with Amazon before implementation.

**Attribution and display**

- Required disclosure: “As an Amazon Associate I earn from qualifying
  purchases.” [S15]
- Required text-content disclaimer: “CERTAIN CONTENT THAT APPEARS [IN THIS
  APPLICATION or ON THIS SITE] COMES FROM AMAZON SELLER SERVICES PRIVATE
  LIMITED. THIS CONTENT IS PROVIDED ‘AS IS’ AND IS SUBJECT TO CHANGE OR REMOVAL
  AT ANY TIME.” [S15]
- Price/availability timestamp and disclaimer: “Product prices and availability
  are accurate as of the date/time indicated and are subject to change. Any
  price and availability information displayed on [Amazon Site] at the time of
  purchase will apply to the purchase of this product.” [S15]
- Vended links must not be altered; partner tag must be correct; use primary
  account credentials; retain all URL parameters returned by the API. [S5][S6]
- Each Amazon content use must link to the related Amazon product page, not to
  another retailer or page. [S15]
- Do not add/delete/alter content except proportional image resizing or
  non-material text truncation. [S15][S16]
- Do not frame Amazon, use Amazon Marks outside provided content, or imply
  Amazon endorsement. [S15][S16]
- No price tracking or price-alert functionality unless separately agreed.
  [S16]
- No sublicensing, resale, redistribution or transfer of Amazon content without
  written approval. [S15]
- No mobile app content/Special Links unless the app is an Approved Mobile
  Application; responsive websites are treated differently, but the policy
  wording requires legal review. [S15][S16]

### 3.7 Use in a PC comparison/building tool

This is the highest-risk policy area.

The licence permits Amazon content “solely for the limited purposes of
advertising Products on, and directing end users to, the Amazon Site” and
requires Amazon content to send users/sales to Amazon. A PC builder that uses
Amazon offers to help users choose and buy components can fit that purpose, but:

- A **direct multi-retailer comparison table** may be treated as using Amazon
  content “in conjunction with” links to other retailers, which the licence
  restricts. [S15]
- **Price history, price tracking and price alerts** are expressly prohibited
  absent agreement. [S16]
- **Durable storage of Amazon MPN/GTIN/model evidence** may exceed the 24-hour
  caching limit, because only ASINs are explicitly allowed indefinitely. [S15]
- **Saved/shared builds** may store component IDs and ASINs, but not durable
  Amazon price/availability snapshots or price history.

These are not technical blockers; they are legal/product-design blockers that
require written clarification or a deliberately Amazon-only offer presentation.

### 3.8 Geographic/regional restrictions

- Marketplace: `www.amazon.in`; country IN; currency INR; default language
  `en_IN`; valid languages include English, Hindi, Kannada, Malayalam, Tamil and
  Telugu. [S8]
- India is in the **EU** Creators API token region (version 3.2). [S13]
- Amazon.in operating agreement is with Amazon Seller Services Private Limited
  and governed by Indian terms. [S15]
- Commission rates and exclusions are India-specific and change monthly. [S19]
- No currency conversion: Amazon.in prices are INR only. [S8]
- Cross-marketplace credentials exist, but Amazon.in requires an Amazon.in
  partner tag and regional access approval. [S1][S13]

## 4. Existing AppKitX architecture assessment

The brief named `src/lib/pc-builder/product-identity/`; that directory does not
exist. Catalogue identity lives in:

- `src/lib/pc-builder/pricing/identity-registry.ts`
- `src/lib/pc-builder/pricing/identity-audit.ts`
- `src/lib/pc-builder/pricing/product-matching.ts`
- `src/lib/pc-builder/catalogue/identifiers.ts`

The M10.12 provider mapping foundation lives in
`src/lib/pc-builder/provider-mapping/`.

### 4.1 How an Amazon adapter fits

| Amazon field / concern       | Existing contract                                            | Fit                                                                                                                       |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| ASIN                         | `ProviderProduct.externalProductId`                          | Direct fit; preserve exactly                                                                                              |
| Title                        | `ProviderProduct.title`                                      | Direct fit; diagnostic only for matching                                                                                  |
| Brand / manufacturer         | `ProviderProduct.manufacturer`                               | Use manufacturer when present; do not assume brand = manufacturer                                                         |
| Model                        | `ProviderProduct.identifiers.modelNumber` / normalized model | Direct fit                                                                                                                |
| `itemPartNumber`             | No dedicated provider-reported part-number field             | **Gap**: do not automatically treat as MPN; needs a future additive field or manual corroboration                         |
| EAN/UPC                      | `ProviderProduct.identifiers.gtin` / normalized GTIN         | Fit after normalization; not guaranteed present                                                                           |
| ASIN parent/child variants   | `ProviderProduct.variant`                                    | Partial fit; parent ASIN needs a future field or variant attribute                                                        |
| Product URL                  | `ProviderProduct.productUrl`                                 | Fit; preserve partner-tag URL                                                                                             |
| Seller                       | `ProviderProduct.sellerId`; M10.7 `Seller`                   | Partial; map merchant ID/name, but one featured listing at a time                                                         |
| Region/market                | `ProviderProduct.region`, `marketId`                         | Fit: `IN`, `in`                                                                                                           |
| Provenance                   | `ProviderProduct.provenance`                                 | Fit: `api`, `provider`, request/response times; `providerUpdatedAt` null                                                  |
| ASIN → component mapping     | `ProviderProductMapping`                                     | Fit; ASIN as external ID; human review required                                                                           |
| Price/availability/condition | M10.7 `Offer` / `OfferProvenance`                            | Partial: condition is not in `Offer`; filter New before normalization; no shipping/tax                                    |
| Currency                     | `Money` / `Market`                                           | Fit: INR, paise, no conversion                                                                                            |
| Freshness                    | `FreshnessPolicy`                                            | Configurable, but Amazon offers require a **1-hour** maximum, stricter than the default 6-hour aging/24-hour stale policy |
| Rate limits/errors           | `ProviderError`, `ProviderRateLimit`, `ProviderPage`         | Fit; map 401/403/429/5xx                                                                                                  |
| Pagination                   | `ProviderPaginationContract`                                 | Fit: `page` strategy with `itemPage`/`itemCount`; GetItems batch 10                                                       |
| Duplicate/conflict detection | M10.12 registry validation/audit                             | Fit for ASIN-level mappings; parent/child variants need explicit handling                                                 |

### 4.2 Recommended field-level policy

1. **ASIN is the external product ID.** Do not use ASIN as an MPN, GTIN or model.
2. **ASIN is not identity evidence for a catalogue component.** A manual or
   evidence-backed mapping to a component is still required.
3. **`itemPartNumber` is not automatically an MPN.** Store it only as
   provider-reported evidence; require independent corroboration before it can
   produce an exact-MPN candidate. Otherwise leave MPN null and use model/GTIN
   evidence.
4. **EAN/UPC are normalized to GTIN.** Use the existing GTIN validation/check
   digit logic. If multiple EAN/UPC values exist, preserve them and treat
   ambiguity as needs-review.
5. **Brand and manufacturer are separate.** Prefer `manufacturer`; if absent,
   brand is not proof of manufacturer.
6. **Category is mapped explicitly** from Amazon browse node/search index to an
   AppKitX category. Never infer a component category from title keywords alone.
7. **Variants are preserved.** Child ASIN is the external product ID; parent
   ASIN and variation attributes are recorded as variant context. Never map a
   parent ASIN with multiple child products to one component without review.
8. **Bundles are rejected.** A bundle containing multiple components must not
   map to a single catalogue component.
9. **Seller context is preserved.** Map `merchantInfo.id/name` to a seller
   identity; do not invent seller ratings or delivery promises.
10. **Condition is filtered.** Only `New` offers are eligible for PC Builder
    pricing; used/refurbished offers are out of scope.
11. **No price/stock fields in identity.** Price, availability, condition and
    seller remain in the M10.7 offer contract.

### 4.3 Mapping and review

The M10.12 flow is appropriate:

```text
Amazon ASIN record
  → ProviderProduct (identity only)
  → deterministic match (GTIN, corroborated MPN, model + manufacturer)
  → candidate / needs-review / rejected
  → human review (separate from catalogue identity review)
  → verified mapping only when current and approved
```

- Automatic matching must never produce `verified`.
- Ambiguous ASIN/model evidence must remain `needs-review`.
- ASINs with no reliable MPN/GTIN will usually require `manual-review`.
- The durable mapping should be **ASIN → component ID + reviewer decision +
  timestamps**; Amazon-derived identity evidence should be treated as
  short-lived cache unless Amazon confirms durable storage is permitted.
- Catalogue identity review (M10.11) remains separate; an approved Amazon
  mapping does not approve catalogue identity, and vice versa.

### 4.4 Offer ingestion and freshness

Reuse M10.7:

- `Offer` and `OfferProvenance` for price/availability/seller/provenance.
- `normalizeOffer` for exact minor-unit INR, timestamps and validation.
- `aggregateOffers` / `estimateBuildPurchase` for current eligible offers only.
- `FreshnessPolicy` for provider-specific thresholds.

Required Amazon-specific behavior:

- Fetch `offersV2` only for the mapped ASIN.
- Filter `condition.value === "New"`.
- Map availability types to the existing `AvailabilityState`:
  `IN_STOCK`/`IN_STOCK_SCARCE` → in-stock/limited; `OUT_OF_STOCK` →
  out-of-stock; `PREORDER` → preorder; `LEADTIME`/`AVAILABLE_DATE` →
  backorder/preorder as appropriate; `UNAVAILABLE`/`UNKNOWN` → unknown.
- Use one offer per featured listing; do not claim all-seller coverage.
- Preserve `merchantInfo.id/name`; do not invent seller ratings.
- Set shipping/tax to unknown; never compute a complete payable total.
- Use `observedAt` = API observation time; `providerUpdatedAt` = null unless
  supplied.
- Set an Amazon-specific freshness policy: offers are current only within the
  1-hour cache window; older offers are stale/expired and excluded.
- Do not store historical price series or generate price alerts.

### 4.5 Regional and currency handling

Already ready:

- `in` / `IN` / `INR` / `en-IN`, two paise digits, `₹` symbol.
- No currency conversion.
- Explicit market selection; no geolocation/browser-language inference.

Amazon adapter should set `marketId: "in"`, `region: "IN"`, `currency: "INR"`,
and use `www.amazon.in`/`en_IN`. Do not support other Amazon marketplaces in the
first iteration.

### 4.6 Provider failures, rate limits, retries and pagination

Reuse M10.7/M10.12:

- `ProviderErrorCode`: `unauthorized`, `rate-limited`, `not-found`,
  `unavailable`, `timeout`, `invalid-response`, `unsupported-market`,
  `unsupported-currency`.
- Map HTTP 401 → unauthorized/token refresh; 403 `AssociateNotEligible` →
  eligibility failure; 429 → rate-limited with `retryAfterSeconds`; 404 →
  not-found; 5xx → retry with exponential backoff.
- Cache OAuth tokens for their full 1-hour lifetime; share across processes.
- Respect 1 TPS/8,640 TPD initially; batch up to 10 ASINs per GetItems.
- Pagination: SearchItems `itemPage` 1–10, `itemCount` 1–10; do not assume
  exhaustive search.
- Never retry non-idempotent writes (not applicable here) and never hammer on
  403 eligibility failures.

### 4.7 Duplicate and conflict handling

M10.12 already fails closed on:

- duplicate provider product IDs;
- one external ID mapped to different components;
- duplicate mappings;
- conflicting provider variants for one component/region;
- missing products/components;
- invalid evidence metadata.

Amazon-specific additions:

- Parent ASIN with multiple child ASINs must not map to one component.
- A child ASIN can change/vanish; preserve supersession and re-review.
- Same component may have multiple legitimate ASINs (regional packs, colors,
  bundles); each must be reviewed separately. Do not merge them by title.
- Bundle ASINs containing multiple components are rejected unless the bundle is
  itself a catalogue component (not currently modeled).

## 5. Catalogue readiness analysis

### 5.1 Current coverage

Source: local identity audit [S27].

| Category    |   Total | Source-verified |    MPN |  GTIN |  Both | Without source-verified | Human-reviewed |
| ----------- | ------: | --------------: | -----: | ----: | ----: | ----------------------: | -------------: |
| CPU         |      16 |              14 |     14 |     0 |     0 |                       2 |              0 |
| GPU         |      15 |               0 |      0 |     0 |     0 |                      15 |              0 |
| Motherboard |      13 |               0 |      0 |     0 |     0 |                      13 |              0 |
| RAM         |      10 |               7 |      7 |     0 |     0 |                       3 |              0 |
| Cooler      |      11 |               7 |      6 |     3 |     2 |                       4 |              0 |
| Storage     |       9 |               4 |      4 |     0 |     0 |                       5 |              0 |
| PSU         |       9 |               6 |      6 |     0 |     0 |                       3 |              0 |
| Case        |      11 |               6 |      6 |     1 |     1 |                       5 |              0 |
| Case fan    |       7 |               6 |      3 |     5 |     2 |                       1 |              0 |
| **Total**   | **101** |          **50** | **46** | **9** | **5** |                  **51** |          **0** |

Additional findings:

- 16 model strings are MPN-shaped candidates but are **not** verified MPNs.
- 35 model strings are descriptive names.
- 0 duplicate normalized models.
- 0 human-reviewed catalogue identities.
- Catalogue validation: 101 components, 0 invalid, 0 duplicate ids, 0 missing
  provenance, status OK.

### 5.2 Interpretation for Amazon mapping

- **50 components** can produce an automatic exact MPN/GTIN candidate, but each
  still requires human mapping approval before `verified`.
- **51 components** have no source-verified identity and will likely require
  manual ASIN mapping. This includes:
  - all 15 GPUs;
  - all 13 motherboards;
  - 2 CPUs, 3 RAM kits, 4 coolers, 5 storage drives, 3 PSUs, 5 cases and 1 case
    fan.
- **GPUs and motherboards are the least ready.** Amazon listings vary by board
  partner, cooler design, OC edition, form factor, Wi-Fi/BIOS revision, color
  and bundled games. Without MPN/GTIN, title/model matching is unreliable.
- **RAM kits** need capacity, module count, speed, timings, profile and color
  distinctions; Amazon titles frequently omit or reorder these.
- **Storage** needs capacity, interface, form factor, heatsink and revision;
  Amazon bundles and “with heatsink” variants can collide.
- **PSUs** need regional SKU, cable set, ATX version and wattage; Amazon may
  list regional packaging variants under one ASIN family.
- **Cases/coolers/fans** need color, glass/panel, socket kit, revision and
  single-vs-multipack distinctions.
- **CPUs** need boxed vs tray, regional SKU and cooler-included distinctions.
- Bundles, parent ASINs and multi-component kits must be rejected or reviewed
  as bundles, not mapped to a single component.

### 5.3 Recommended mapping rollout

1. Start with the 50 source-verified components where GTIN/MPN evidence is
   strong; manually confirm ASIN matches.
2. Add the 51 unverified components through manual ASIN mapping and human
   review; prioritize CPUs, PSUs, cases, RAM and coolers before GPUs and
   motherboards.
3. Do not display Amazon offers for a component until its ASIN mapping is
   `verified` and current.
4. Keep an ASIN allowlist; do not auto-map every search result.
5. Revalidate mappings when ASIN content, title, seller or variant changes.

## 6. Commercial and operational assessment

| Question                                                   | Assessment                                                                                                                                                                                                                                                                                                                          |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Does AppKitX need an approved Amazon Associates account?   | **Yes.** Creators API requires an Associates account for the target marketplace, final acceptance and 10 qualifying sales in 30 days. [S1][S3]                                                                                                                                                                                      |
| Is the qualifying-sales requirement realistic?             | The Associates gate (3 sales/180 days) is achievable with a live site and modest traffic. The API gate (10 sales/30 days) is the harder bootstrap for a new platform. It is realistic only with an existing audience or a manual-affiliate phase.                                                                                   |
| Are affiliate commissions necessary for API access?        | API access is tied to Associates participation and qualifying sales. No official non-affiliate product-catalogue API was identified. Commissions are not a direct API fee, but affiliate sales are the eligibility mechanism.                                                                                                       |
| Is a non-affiliate product-data integration permitted?     | No public non-affiliate Amazon product-data API was found. Amazon SP-API is seller-authorized and not a competitor/market price source. A direct Amazon partnership would require a separate agreement.                                                                                                                             |
| Can AppKitX display Amazon prices?                         | Yes, subject to licence conditions: timestamp, disclaimer, 1-hour offer cache, no alteration, link to Amazon, no price tracking/alerts. Prices are address-dependent; label them as observed marketplace prices.                                                                                                                    |
| Can users compare Amazon listings with other retailers?    | **Conditional / high risk.** The licence requires Amazon content to drive users/sales to Amazon and restricts linking Amazon content to other sites. A direct multi-retailer comparison table needs written clarification or a separated Amazon-only offer presentation.                                                            |
| Can the PC Builder remain free?                            | Yes, in principle. Affiliate commissions can fund it, but commission rates are low (Computers 2.45% in Oct–Nov 2026) and some categories are excluded or 0%. Free access is a product decision, not guaranteed by API terms.                                                                                                        |
| Can Amazon data be used in saved/shared builds?            | ASINs and component IDs can be stored indefinitely. Amazon price/availability content is limited to the cache TTL (offers 1 hour; other content 24 hours). Shared builds must refresh or omit Amazon price; no price history.                                                                                                       |
| Does this limit SEO, caching or historical price tracking? | Yes. No price tracking/alerts; static SEO pages with Amazon prices would exceed cache/display rules. Metadata may be cached 1 day, offers 1 hour. Historical price charts are out of scope.                                                                                                                                         |
| Ongoing operational costs?                                 | OAuth token cache, secret rotation, scheduler/queue, rate limiter, retry/backoff, monitoring, manual ASIN mapping/review, catalogue identity maintenance, policy/compliance review, ASIN churn and broken-link handling. API access itself has no documented direct fee, but affiliate eligibility and infrastructure costs remain. |

### Commission context

Amazon.in advertising fee schedule, Oct–Nov 2026 [S19]:

- Computers: **2.45%**
- Electronics: **2.80%**
- Apple products: **0%**
- Video Gaming Consoles & Hardware: **excluded**
- Rates are variable and can change monthly.

PC components may fall into Computers or Electronics; some gaming hardware may
be excluded. Do not assume every component earns a commission. Confirm the
classification per ASIN/category before relying on affiliate revenue.

## 7. Alternative provider comparison

| Candidate                                                                                        | Official evidence                                                                                     | India/INR                          | Identity                                                                          | Price/stock                                                                                       | Access/commercial terms                                                                                               | Verdict                                                                              |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Amazon India Creators API**                                                                    | Current official REST API; OAuth 2.0; SearchItems/GetItems/GetVariations/GetBrowseNodes [S1][S9][S10] | `www.amazon.in`, INR, `en_IN` [S8] | ASIN, title, brand/manufacturer, model, itemPartNumber, EAN/UPC; MPN not explicit | Price, currency, condition, availability, merchant; featured listings only; no shipping/tax [S12] | Associates acceptance + 10 sales/30 days; affiliate links/attribution; cache TTLs; regional approval                  | **Primary, conditional**                                                             |
| **Flipkart Affiliate API**                                                                       | Official product/offer/report APIs; token headers [S20][S21]                                          | India marketplace, INR amounts     | `productId`, title, brand, category specs; no documented MPN/GTIN                 | MRP/selling/special price, stock, seller, shipping charges                                        | Registered affiliates; 20 calls/sec; 500 items/request; 10-hour URLs; no sublicensing/competitive platform [S22][S23] | **Secondary, conditional**; docs last updated 2016 [S24], current access unconfirmed |
| **Direct Indian retailers** (MDComputers, PrimeABGB, Vedant, EliteHubs, The IT Depot, PC Studio) | No public developer/API documentation found [S26]                                                     | India/INR on storefronts           | Store-specific; no public contract                                                | Storefront only                                                                                   | Direct commercial/partner agreement required; do not contact without approval                                         | **Not selectable without partnership**                                               |
| **Manual Amazon ASIN/URL mapping**                                                               | No API; manual SiteStripe/affiliate links                                                             | India/INR                          | ASIN + human-reviewed component mapping                                           | No automated price/stock; manual display only                                                     | Associates account/links; no API threshold                                                                            | **Viable interim bootstrap**                                                         |
| **Provider-independent ingestion + human-reviewed mappings**                                     | M10.12 foundation [S26]                                                                               | Provider-configurable              | Provider product → catalogue mapping                                              | Offers separated from identity                                                                    | No live provider yet                                                                                                  | **Recommended architectural base**                                                   |
| **Scraping / third-party scraping APIs**                                                         | Not authorized                                                                                        | —                                  | Unclear provenance                                                                | Scraped                                                                                           | Violates no-scraping rule and likely Amazon terms                                                                     | **Excluded**                                                                         |
| **Amazon SP-API Product Pricing**                                                                | Seller-authorized API                                                                                 | India seller accounts possible     | Seller's own SKUs                                                                 | Seller's own pricing                                                                              | Seller authorization only                                                                                             | **Rejected** for market/competitor pricing                                           |
| **Google Content API for Shopping**                                                              | Merchant feed API                                                                                     | India fields                       | Merchant-supplied GTIN/MPN                                                        | Merchant's own feed                                                                               | Merchant account                                                                                                      | **Rejected** for live retailer price discovery                                       |

### Should Amazon be the first provider?

**Amazon should be the first target provider, but not necessarily the first
automated provider.** The architecture should remain provider-independent.

Recommended sequence:

1. Build the provider-independent mapping/offer foundation (already M10.12).
2. Publish the PC Builder/public site and start manual Amazon affiliate links to
   satisfy Associates acceptance and the 10-sales/30-day API gate.
3. Use manual ASIN mapping during this phase; do not promise live prices.
4. Once Creators API access is approved, add the Amazon adapter for verified
   mappings only.
5. Keep Flipkart as a secondary provider if its current API access is confirmed;
   its identity data is weaker and its documentation is stale.

If AppKitX cannot reach the Amazon API thresholds, the fallback is **manual
ASIN mapping plus direct retailer partnerships**, not scraping and not
unauthorized third-party APIs.

## 8. Proposed integration architecture (proposal only)

```text
Public AppKitX site / PC Builder
        │
        ├── Static catalogue + compatibility engine (unchanged)
        │
        └── Server-side pricing service (future, not implemented)
                │
                ├── Provider adapter registry
                │      └── Amazon India adapter (future)
                │             ├── OAuth token cache (1h)
                │             ├── rate limiter (1 TPS initial)
                │             ├── retry/backoff + error mapping
                │             └── GetItems / SearchItems / GetVariations
                │
                ├── Provider product normalization
                │      └── ASIN, title, brand/manufacturer, model,
                │          itemPartNumber evidence, EAN/UPC→GTIN,
                │          region/market/seller/variant, provenance
                │
                ├── M10.12 identity matching + mapping registry
                │      ├── candidate / needs-review / rejected
                │      └── human review → verified ASIN→component mapping
                │
                ├── Offer ingestion (M10.7)
                │      ├── filter New
                │      ├── price/currency/availability/condition/seller
                │      ├── no shipping/tax; incomplete totals
                │      └── 1-hour offer cache, 1-day metadata cache
                │
                ├── Freshness/aggregation/budget (M10.7)
                │      └── Amazon-specific freshness policy
                │
                └── Display layer
                       ├── “Amazon.in price as of …” + disclaimer
                       ├── vended link with partner tag
                       ├── no price history/alerts
                       └── no multi-retailer comparison until approved
```

### 8.1 Components to reuse

- `provider-mapping/types.ts` — `ProviderProduct`, mapping, review, adapter
  contracts.
- `provider-mapping/provider-product.ts` — validation/normalization.
- `provider-mapping/matching.ts` — deterministic MPN/GTIN/model matching.
- `provider-mapping/mapping.ts` — mapping states, fingerprints, eligibility.
- `provider-mapping/audit.ts` — mapping quality audit.
- `provider-mapping/adapter.ts` — adapter descriptor/pagination validation.
- `pricing/types.ts` — `Offer`, `OfferProvenance`, `ProviderError`,
  `ProviderPage`, `ProviderRateLimit`, `Money`, `Market`, `Seller`.
- `pricing/offers.ts` — `normalizeOffer` (with Amazon caveats).
- `pricing/freshness.ts` — configurable freshness policy.
- `pricing/aggregation.ts`, `pricing/budget.ts` — current-offer aggregation and
  incomplete totals.
- `pricing/regions.ts`, `pricing/money.ts`, `pricing/india.ts` — India/INR.
- `pricing/identity-registry.ts`, `pricing/identity-audit.ts`,
  `pricing/product-matching.ts` — catalogue identity and matching.
- `pricing/validation.ts` — URL/id/timestamp/payload validation.

### 8.2 Components requiring future implementation

- Amazon HTTP client and OAuth token cache (server-side only).
- Secret storage/rotation (Cloudflare Secrets or equivalent).
- Rate limiter, retry/backoff, circuit breaker and observability.
- ASIN allowlist/discovery and manual mapping review workflow.
- Persistence for ASIN→component mappings, review decisions and short-lived
  caches.
- Amazon-specific offer normalization (condition, merchant, availability,
  featured-listing limitations).
- Amazon-specific freshness policy (offers ≤1h).
- Attribution/disclaimer UI and vended-link handling.
- No-price-history/no-alert enforcement.
- Multi-provider display policy and legal approval.
- Optional admin UI for mapping review; no production credentials in the
  repository.

### 8.3 Durable storage warning

The M10.12 mapping registry stores provider MPN/GTIN/model evidence and a
fingerprint indefinitely. Amazon's India IP Licence only explicitly permits
indefinite storage of ASINs; other Product Advertising Content may be cached for
up to 24 hours. Therefore:

- Durable Amazon mapping records should store **ASIN + catalogue component ID +
  reviewer/review metadata + timestamps**.
- Amazon-derived identity evidence should be treated as **short-lived cache**
  and re-fetched for revalidation, unless Amazon confirms in writing that
  durable storage of derived identifiers is permitted.
- Do not persist Amazon images, titles, descriptions, prices or availability
  beyond the permitted TTL.
- This is a legal/design prerequisite, not a code change in M10.13.

## 9. Risks and unresolved questions

| Risk / question                                                | Severity   | Why it matters                                                                       | Suggested action                                                                                    |
| -------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Associates/API eligibility bootstrapping                       | High       | A new site may not reach 10 sales/30 days; API access is not immediate               | Launch public site, manual affiliate links, build traffic; apply only when thresholds are realistic |
| Ongoing 30-day sales requirement                               | High       | Access can be lost after 30 days without qualified sales                             | Plan sustainable traffic and affiliate conversion; monitor Link Type Performance                    |
| Multi-retailer comparison licence ambiguity                    | High       | Amazon content must drive sales to Amazon; comparison tables may violate the licence | Obtain written clarification or design an Amazon-only offer module                                  |
| Durable mapping evidence storage                               | High       | Only ASINs are explicitly allowed indefinitely; other content is 24h cache           | Store ASIN→component mapping durably; keep Amazon identity evidence ephemeral or obtain approval    |
| Price tracking/alerts prohibition                              | High       | Historical prices and alerts are expressly restricted                                | Do not build price history or alerts; confirm any “price drop” feature with Amazon                  |
| Image caching prohibition                                      | Medium     | Storing Amazon images may violate the IP Licence                                     | Use image URLs only, ≤24h; do not proxy/cache binaries                                              |
| No shipping/tax/delivery data                                  | Medium     | Build totals remain incomplete                                                       | Keep shipping/tax unknown; never claim a complete payable total                                     |
| Featured offers only                                           | Medium     | No all-seller price comparison                                                       | Treat each featured listing as one offer; do not claim retailer breadth                             |
| MPN ambiguity (`itemPartNumber`)                               | High       | Could create false exact matches                                                     | Do not auto-verify itemPartNumber as MPN; require corroboration/manual review                       |
| ASIN parent/child/variant/bundle complexity                    | High       | Wrong component mapping                                                              | Preserve variant context; reject bundles; human review                                              |
| Catalogue identity gaps (51 components, all GPUs/motherboards) | High       | Most PC components cannot be verified automatically                                  | Expand identity registry; manual ASIN mapping; prioritize categories                                |
| Commission classification and low rates                        | Medium     | Revenue may be lower than expected; some categories excluded                         | Verify per-ASIN category; model revenue conservatively                                              |
| Public PC Builder not available                                | High       | Associates review requires a public site with original content                       | Publish PC Builder or use the public AppKitX site; content plan                                     |
| Mobile app policy                                              | Medium     | Native app may require Approved Mobile Application                                   | Launch responsive web first; legal review before native app                                         |
| Amazon terms/API changes                                       | Medium     | PA-API deprecation shows platform risk                                               | Abstract provider; monitor announcements; keep adapter replaceable                                  |
| Amazon.in Creators API docs returned HTTP 500                  | Low/Medium | India-specific onboarding details could not be fetched directly                      | Reconfirm with Amazon/Associates support before implementation                                      |
| Flipkart docs stale/current access unconfirmed                 | Medium     | Alternative may not be available                                                     | Verify directly before relying on it                                                                |
| GST/tax/withholding and affiliate payments                     | Medium     | India affiliate payments have tax requirements                                       | Obtain tax/accounting advice; maintain GST-compliant invoicing                                      |
| No legal advice in this report                                 | —          | Policy interpretation is not legal advice                                            | Obtain Indian legal counsel review                                                                  |

### Unresolved questions for Amazon

1. Is a PC builder/comparison tool with Amazon offers plus other retailer links
   permitted, or must Amazon content be isolated?
2. Can AppKitX store derived MPN/GTIN/model evidence from Amazon indefinitely for
   mapping audit, or only ASINs?
3. Does the 1-day “other resources” cache include image URLs only, or image
   metadata/binaries?
4. Are PC components classified as Computers/Electronics for commission, or are
   any GPU/gaming components excluded as “Video Gaming Consoles & Hardware”?
5. Is a responsive PC Builder web app acceptable, or is it a “mobile application”
   requiring approval?
6. What exactly counts as “price tracking” versus a current price display with a
   timestamp?
7. Can saved/shared builds retain ASINs and component IDs indefinitely while
   refreshing price/availability on view?
8. What is the current India-specific Creators API onboarding path and regional
   approval contact?

## 10. Go/no-go recommendation

# **CONDITIONAL GO**

Amazon India is technically viable and the M10.12 architecture is a good fit.
It is **not** ready for implementation because the commercial eligibility,
legal/policy, public-site and catalogue identity prerequisites are not met.

### Decision matrix

| Area                           | Finding                                                                                                           | Evidence           | Risk                                                    | Required action                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **API availability**           | Creators API is current and supports Amazon.in; PA-API 5 is deprecated.                                           | [S1][S4][S8]       | Medium: API/terms can change                            | Use Creators API only; monitor deprecation/announcements                            |
| **Affiliate eligibility**      | Requires accepted Amazon.in Associate + 3 sales/180 days + 10 sales/30 days for Creators API.                     | [S1][S3][S17][S18] | High: new site may not qualify                          | Publish public site; manual affiliate phase; reach thresholds                       |
| **Product data coverage**      | Good fields, but MPN is ambiguous; EAN/UPC optional; featured offers only; no shipping/tax.                       | [S9][S11][S12]     | High: identity and offer breadth gaps                   | Normalize GTIN; treat itemPartNumber cautiously; manual mapping; no complete totals |
| **Pricing data rights**        | Price display allowed with timestamp/disclaimer, no alteration, link to Amazon.                                   | [S15]              | Medium: address-dependent prices; policy interpretation | Implement timestamp/disclaimer; label observed price; legal review                  |
| **Caching restrictions**       | Offers 1h; other resources 1d; images not stored; ASINs indefinite.                                               | [S6][S15]          | High: mapping evidence storage may exceed 24h           | ASIN-only durable mapping; ephemeral evidence cache; confirm with Amazon            |
| **Identity mapping readiness** | 50/101 source-verified; 0 human-reviewed; 51 need manual mapping; GPUs/motherboards 0.                            | [S27]              | High: wrong ASIN→component mapping                      | Expand identity; manual ASIN review; prioritize categories                          |
| **Operational feasibility**    | OAuth/rate limits manageable; no adapter/persistence/scheduler yet; manual review needed.                         | [S5][S13][S26]     | Medium: operational overhead                            | Build server adapter, token cache, rate limiter, monitoring, review workflow        |
| **Legal/policy compliance**    | Multi-retailer comparison, price history, durable content storage and mobile app policy are unresolved/high-risk. | [S15][S16]         | High: account termination/content removal               | Obtain written Amazon clarification and Indian legal review before launch           |

### Why not GO

- No Amazon.in Associates account is confirmed.
- No 10-sales/30-day Creators API eligibility is confirmed.
- The PC Builder is not public, so Associates site review cannot use it yet.
- Legal/policy approval for comparison, caching and saved builds is not in place.
- 51 components lack source-verified identity; GPUs/motherboards are entirely
  manual.

### Why not NO-GO

- The official API is current, documented and India-capable.
- The required fields exist for a meaningful mapping/offer integration.
- OAuth/rate limits are operationally manageable.
- The M10.12 provider-independent mapping foundation already fits.
- A manual ASIN/affiliate phase can bootstrap eligibility without an API.

## 11. Prerequisites and suggested next milestones

### Prerequisites independent of coding

1. **Public site/content readiness.** Publish the PC Builder or use the public
   AppKitX site; ensure original, recent content and a privacy policy suitable
   for Associates review. [S18]
2. **Amazon.in Associates application.** Apply, get accepted, and record the
   store/tracking ID.
3. **Three qualifying sales in 180 days.** Use manual affiliate links/SiteStripe;
   no API required.
4. **Ten qualifying sales in 30 days.** Build audience/traffic; then apply for
   Creators API in the India region.
5. **Creators API registration.** Primary account owner; create application and
   credentials; confirm India regional approval.
6. **Legal/policy review.** Amazon India Operating Agreement/IP Licence for:
   multi-retailer comparison, price display, caching, durable mapping evidence,
   saved/shared builds, SEO, mobile web/app, price tracking/alerts.
7. **Written Amazon clarification** on the unresolved questions in section 9.
8. **Commission classification review.** Confirm Computers/Electronics vs Video
   Gaming Hardware exclusions per ASIN.
9. **Tax/accounting review.** GST invoicing, withholding, affiliate payments.
10. **Provider decision.** Confirm Amazon first vs manual Amazon + Flipkart
    secondary vs direct retailer partnership.

### Prerequisites requiring implementation (after approval)

1. Amazon adapter with OAuth 2.0, token cache, secret storage and regional
   endpoint.
2. Rate limiter, retry/backoff, error mapping and observability.
3. ASIN allowlist/discovery and manual mapping review workflow.
4. Durable ASIN→component mapping store with short-lived Amazon evidence cache.
5. Amazon offer normalization: New-only, merchant, condition, availability,
   price, no shipping/tax.
6. Amazon-specific freshness policy (offers ≤1 hour).
7. Attribution/disclaimer/vended-link UI.
8. No price history/alerts enforcement.
9. Provider-independent multi-provider adapter registry.
10. Audit/reporting for ASIN coverage, stale mappings, conflicts and eligibility.

### Suggested next milestones

1. **M10.14 — Amazon India Readiness Gate & Manual ASIN Mapping Pilot** (no live
   API): public-site/content prerequisites, Associates application, manual ASIN
   allowlist, mapping review workflow design, legal questions.
2. **M10.15 — Amazon Creators API Adapter** (only after Associates/Creators API
   approval): OAuth, secrets, rate limits, GetItems/SearchItems, normalization.
3. **M10.16 — Amazon Offer Ingestion & Display**: New-only offers, 1-hour
   freshness, merchant/seller, timestamp/disclaimer, no history.
4. **M10.17 — Catalogue Identity Expansion for PC Components**: prioritize GPUs,
   motherboards and other 51 unverified components.
5. **M10.18 — Multi-Provider Comparison Policy & Activation**: only after
   written Amazon/legal approval.

## 12. Limitations of this assessment

- No Amazon Associates account or Creators API credentials were created or used.
- No Amazon API calls were made; field/limit findings come from official
  documentation.
- No Amazon product pages were scraped.
- No real ASINs were mapped to catalogue components; catalogue counts are
  identity-readiness counts only.
- Amazon.in Creators API documentation returned HTTP 500 on 2026-11-01; global
  official docs plus the India locale reference and India operating agreement
  were used. Reconfirm India-specific onboarding with Amazon.
- Amazon terms, rates and API behavior can change; this is a point-in-time
  assessment, not legal advice.
- Flipkart documentation is stale (last updated 2016); current API access and
  terms were not verified with Flipkart.
- Commission rates are an Oct–Nov 2026 snapshot and vary by category/month.
- No production code, interface, migration, configuration or credential was
  created.

## 13. Final recommendation

**CONDITIONAL GO.** Proceed with the non-code readiness work and a manual ASIN
mapping pilot. Do not implement the live Amazon India adapter until:

- Amazon.in Associates acceptance and Creators API eligibility are confirmed;
- the public site/content prerequisite is satisfied;
- legal/policy approval covers the PC Builder use case, caching, saved builds
  and multi-retailer display;
- catalogue identity coverage is expanded and a human-reviewed ASIN mapping
  workflow is ready.

The M10.12 provider-independent mapping foundation should be retained as the
architectural base. Amazon should be the first target provider, but the first
automated integration should wait for the eligibility and compliance gates.
