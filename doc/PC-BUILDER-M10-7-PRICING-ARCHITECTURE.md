# Hardware Pricing & Availability Architecture (M10.7)

Status: implementation complete, development-preview only, **uncommitted** for
human review.

- Branch: `feature/m10-7-hardware-pricing-architecture`
- Starting commit: `f4ac16bfb8dcf32d1243af52e152dbf970b4a0a6`
- Domain: `src/lib/pc-builder/pricing/`
- Preview: `/pc-builder` during `astro dev` only
- Live integrations: **none**
- Affiliate links/tracking: **none**
- Production route, sitemap, CSP or deployment changes: **none**

This milestone establishes a provider-independent commercial pricing layer. It
does not fetch retailer prices, scrape ecommerce sites, poll stock, convert
currencies, provide checkout or claim that a build fits a real purchase budget.
The M10.4 recommendation engine continues to score specifications only.

## 1. Architecture and domain boundaries

Hardware specifications and commercial offers are separate domains:

```
Catalogue (specifications, stable component ids)
        │
        ├── Compatibility engine / power / recommendations
        │
        └── Pricing domain
               ├── product matching
               ├── normalized offers
               ├── market/currency queries
               ├── freshness and availability
               ├── offer aggregation
               ├── build purchase estimate contract
               └── provider adapters (future)
```

Files:

| File                          | Responsibility                                                             |
| ----------------------------- | -------------------------------------------------------------------------- |
| `pricing/types.ts`            | Money, market, seller, match, offer, freshness, provider and budget types. |
| `pricing/validation.ts`       | Untrusted-input primitives: text, ids, timestamps, URLs and sizes.         |
| `pricing/money.ts`            | Exact minor-unit arithmetic, ISO currency precision and formatting.        |
| `pricing/regions.ts`          | ISO country/market configuration and validation.                           |
| `pricing/sellers.ts`          | Retailer, marketplace, marketplace-seller and affiliate identity.          |
| `pricing/product-matching.ts` | Catalogue-to-listing matching and confidence states.                       |
| `pricing/freshness.ts`        | Configurable price freshness policy.                                       |
| `pricing/availability.ts`     | Stock normalization and independent stock freshness.                       |
| `pricing/offers.ts`           | Offer normalization, provenance and cost completeness.                     |
| `pricing/aggregation.ts`      | Market/currency-scoped comparison and eligibility.                         |
| `pricing/budget.ts`           | Build purchase total and budget-fit contract.                              |
| `pricing/provider.ts`         | Provider page/request contract validation and capabilities.                |
| `pricing/labels.ts`           | Presentation labels only.                                                  |
| `pricing/index.ts`            | Public domain API.                                                         |

No catalogue record contains a price or stock field. Compatibility,
recommendation and power modules do not import commercial offers.

## 2. Money representation

`Money` is an exact integer amount in a currency's smallest unit plus an
explicit ISO 4217 code:

```ts
interface Money {
  amountMinor: number; // integer, not a floating major-unit amount
  currency: string; // uppercase ISO 4217, validated
}
```

- The maximum supported amount is ten trillion minor units, which keeps sums
  and display conversion inside `Number.MAX_SAFE_INTEGER`.
- Precision is resolved from `Intl.NumberFormat(...).resolvedOptions()
.maximumFractionDigits` (CLDR data), with explicit additions for ISO fund
  units that `Intl.supportedValuesOf("currency")` omits: CLF/UYW use four
  decimals, UYI zero, and the other supported fund units their documented
  precision.
- Examples: USD/INR/EUR two decimals, JPY/KRW zero, KWD/BHD/OMR three,
  CLF/UYW four.
- `parseMoney` accepts a major-unit decimal string (preferred) or finite
  number. It converts through a decimal string, rejects exponents, negatives,
  malformed input and non-zero fractional digits beyond the currency
  precision. It never silently rounds.
- `moneyFromMinorUnits`, `addMoney`, `subtractMoney`, `compareMoney` and
  `moneyToDecimalString` operate exactly in minor units.
- `formatMoney` uses the market's BCP-47 display locale and currency precision.
  Display conversion to a major-unit Number happens only inside Intl; all
  stored values and arithmetic remain integer.
- Adding or comparing different currencies fails. There is no automatic
  conversion and no exchange-rate dependency.

## 3. Region and currency model

```ts
interface Market {
  id: string; // lowercase stable id, e.g. "in"
  countryCode: string; // ISO 3166-1 alpha-2, e.g. "IN"
  name: string;
  defaultCurrency: string; // ISO 4217, e.g. "INR"
  displayLocale: string; // BCP-47, e.g. "en-IN"
  supportedCurrencies: string[];
}
```

The four example configurations are data, not hardcoded branching:

| Market | Country | Default currency | Display locale |
| ------ | ------- | ---------------- | -------------- |
| `us`   | US      | USD              | en-US          |
| `in`   | IN      | INR              | en-IN          |
| `gb`   | GB      | GBP              | en-GB          |
| `de`   | DE      | EUR              | de-DE          |

Language, country and currency are independent. India uses INR with an English
display locale; Germany uses EUR with German formatting. Additional markets are
added by configuration, not by code branches.

Market validation rejects non-ISO country codes (including `EU`, `XK` and the
alias `UK`), unsupported currencies, duplicate currencies, a default currency
not present in the supported list, and invalid BCP-47 locales. Market lookup is
explicit by id or country; there is no browser-language, timezone or
geolocation inference.

## 4. Retailer and seller identity

Sellers are separate from products and offers:

```ts
interface Seller {
  id: string;
  displayName: string;
  websiteUrl: string;
  sellerType:
    "retailer" | "marketplace" | "marketplace-seller" | "affiliate-provider";
  countryCodes: string[];
  marketIds: string[];
  parentMarketplaceId: string | null;
  providerId: string | null;
  logoUrl: string | null;
  dataOrigin: "provider" | "synthetic";
}
```

- A marketplace seller must reference a parent marketplace. A direct retailer
  cannot claim one.
- Offers carry `sellerId` and `marketplaceId` separately. A marketplace listing
  is never assumed to be sold by the marketplace.
- Seller coverage is validated against the offer's market and country.
- All URLs must be HTTPS without embedded credentials. No seller logo is
  fetched or rendered in this milestone.
- The domain contains no real retailer records. The preview uses sellers named
  "Synthetic …" on reserved `.example` domains.

## 5. Product matching methodology

Catalogue-side identity is explicit. The current catalogue exposes `model` but
does not assert it is an MPN or GTIN, so catalogue `manufacturerPartNumber` and
`gtin` remain `null` unless a future verified identity source supplies them.
Matching can also be tested with synthetic identity evidence.

Matching evidence and states:

| Evidence                                                | State        | Confidence |
| ------------------------------------------------------- | ------------ | ---------: |
| Exact MPN + exact manufacturer (+ optional category)    | `verified`   |        100 |
| Exact GTIN + category + manufacturer                    | `verified`   |         97 |
| Exact GTIN + category, manufacturer differs             | `probable`   |         55 |
| Exact model number + manufacturer (+ optional category) | `probable`   |         85 |
| Similar title only                                      | `unverified` |          0 |
| Manufacturer/category mismatch or regional conflict     | `rejected`   |          0 |

Rules:

1. Exact verified MPN is the strongest evidence.
2. GTIN check digits are validated; invalid GTINs reject the listing.
3. Manufacturer plus exact model is only `probable`; it never becomes a
   confirmed purchase option by default.
4. Title similarity is diagnostic only. It never establishes or promotes a
   match.
5. Matching never merges unrelated products by name.
6. GPU board-partner models remain separate because only exact model/MPN/GTIN
   evidence can match.
7. RAM kits with different capacity, speed or kit configuration remain
   separate.
8. Storage capacities remain separate.
9. When both the catalogue identity and the provider listing declare different
   regions, the match is rejected rather than silently treated as identical.
10. An exact identifier shared by multiple catalogue identities is reported as
    an ambiguous match failure.

`unverified` and `rejected` matches cannot be normalized into offers.
Aggregation excludes `probable` matches unless a caller explicitly requests
probable evidence; the UI defaults to verified synthetic matches.

## 6. Commercial offer schema

A normalized offer contains:

- **Identity:** stable normalized id (`providerId:providerOfferId`), component
  id, seller id, marketplace id, market/country, provider product id and
  provider-specific product URL.
- **Pricing:** exact `Money` price, optional list price, derived discount amount
  and percentage, optional shipping, tax inclusion and optional tax amount.
- **Availability:** normalized state and its own observation timestamp.
- **Provenance:** provider, offer/product ids, source URL, price observation
  time, last verification time, provider update time, collection method, data
  origin and match status.
- **Market:** market id, ISO country, explicit currency and optional
  restrictions.
- **Restrictions:** country codes and a short note where supplied.

Illustrative **synthetic** normalized offer:

```json
{
  "id": "fixture-pricing:us-retail-fresh",
  "componentId": "cpu-amd-ryzen-7-7800x3d",
  "sellerId": "synthetic-retail",
  "marketplaceId": null,
  "marketId": "us",
  "countryCode": "US",
  "price": { "amountMinor": 34999, "currency": "USD" },
  "listPrice": { "amountMinor": 39999, "currency": "USD" },
  "discount": { "amountMinor": 5000, "currency": "USD" },
  "discountPercent": 12.5,
  "shipping": { "amountMinor": 0, "currency": "USD" },
  "taxInclusion": "included",
  "taxAmount": null,
  "availability": {
    "state": "in-stock",
    "observedAt": "2026-10-31T11:55:00.000Z"
  },
  "restrictions": [],
  "provenance": {
    "providerId": "fixture-pricing",
    "providerOfferId": "us-retail-fresh",
    "providerProductId": "synthetic-product-cpu",
    "productUrl": "https://retailer.example/products/us-retail-fresh",
    "observedAt": "2026-10-31T11:55:00.000Z",
    "lastVerifiedAt": "2026-10-31T11:55:00.000Z",
    "providerUpdatedAt": "2026-10-31T11:55:00.000Z",
    "collectionMethod": "fixture",
    "dataOrigin": "synthetic",
    "matchStatus": "verified"
  }
}
```

This is fixture data on reserved example domains, not a real retailer offer.

## 7. Provenance requirements

Every normalized price has `provenance.observedAt`. Optional timestamps retain
`null` when unavailable:

- `lastVerifiedAt` — last successful verification.
- `providerUpdatedAt` — provider-reported update time.
- `availability.observedAt` — independent stock observation.

Timestamps must be canonical ISO 8601 UTC with milliseconds. Malformed
timestamps, timestamps after the offer observation, and missing price
observation times are rejected. A provider-supplied product page is preserved
as data; it is never injected as HTML or executed.

A failed refresh never overwrites the last valid offer. `applyOfferRefresh`
returns the previous offer unchanged when normalization fails or when the
refresh references a different offer id.

## 8. Price freshness

Freshness is policy-driven, not scattered hardcoded checks:

```ts
interface FreshnessPolicy {
  freshWithinMs: number;
  agingWithinMs: number;
  staleWithinMs: number;
}
```

Development defaults:

| State     | Age after observation                  |
| --------- | -------------------------------------- |
| `fresh`   | ≤ 30 minutes                           |
| `aging`   | > 30 minutes and ≤ 6 hours             |
| `stale`   | > 6 hours and ≤ 24 hours               |
| `expired` | > 24 hours                             |
| `unknown` | missing, malformed or future timestamp |

These are documented defaults for the preview, not universal retailer
durations. Future provider/market configuration can supply its own validated
policy.

- Fresh and aging offers may be compared; aging offers are labelled.
- Stale and expired offers are never presented as current prices.
- Unknown timestamps never imply freshness.
- If a refresh fails, the previous offer remains but its age naturally declines
  through these states; an outage cannot make it fresh.
- Price freshness and stock freshness are calculated from different
  timestamps.

## 9. Availability freshness

```ts
type AvailabilityState =
  | "in-stock"
  | "out-of-stock"
  | "preorder"
  | "backorder"
  | "limited"
  | "unknown";
```

- Missing availability normalizes to `unknown`, never `in-stock`.
- Unknown provider strings are rejected rather than guessed.
- Availability has its own `observedAt` and freshness assessment.
- A stale/expired/untimed stock observation becomes `unknown`;
  a previously reported In Stock state is never treated as current.
- A fresh price may coexist with Unknown stock.
- A fresh stock observation may coexist with a stale price; the price remains
  excluded from current comparison.
- Product lifecycle (`in-production`, discontinued) in the catalogue is not
  stock status and is not consulted here.

## 10. Aggregation and comparison rules

`aggregateOffers(offers, query)` is pure and scoped to one component, one
market and one currency.

- Offers from other markets are ignored.
- If the component/market set contains more than one currency, the result is
  `currency-mismatch` with no cheapest or highest offer. Nominal prices are
  never compared across currencies.
- Default eligibility: verified match, fresh or aging price, and purchasable
  availability (`in-stock` or `limited`).
- Alternative filters: in-stock only, or include probable matches. Unverified
  matches are never eligible.
- Stale/expired/unknown prices and unavailable/stale/unknown stock are listed
  as excluded with reasons.
- Eligible offers sort by exact minor-unit price ascending, then newest
  observation, then id.
- The result exposes `cheapest`, `highest`, eligible count, total count,
  currencies seen, exclusions and limitations.
- Price sorting is separate from compatibility and recommendation scoring. A
  low price can never override a compatibility failure.

## 11. Provider abstraction

`PricingProvider` is the replaceable adapter boundary:

```ts
interface PricingProvider {
  id: string;
  displayName: string;
  supportedMarketIds: string[];
  supportedCurrencies: string[];
  dataOrigin: "provider" | "synthetic";

  lookupProducts(
    request,
  ): Promise<ProviderResult<ProviderPage<ProviderProductRecord>>>;
  fetchOffers(
    request,
  ): Promise<ProviderResult<ProviderPage<ProviderOfferRecord>>>;
  normalizeOffer(raw, context): Promise<PricingResult<Offer>>;
}
```

Provider pages support:

- Bounded items (maximum 200 records per page).
- Opaque `nextCursor` continuation.
- Observation timestamps.
- Optional rate-limit metadata (limit, remaining, reset time, retry delay).
- Typed error codes for unavailable, rate-limited, unauthorized, not-found,
  timeout, invalid response, unsupported market and unsupported currency.

`validateProviderPage` enforces the record limit, response size (256 KB),
canonical observation timestamp, cursor length and rate-limit metadata.
`validateProviderRequest` validates market, cursor and page-size input. The
interface contains no credentials, secrets, HTML or scraping helpers.

## 12. Budget integration contract

`estimateBuildPurchase` is a pure contract for a future M10.4 integration. It
does **not** change recommendation scoring in this milestone.

It produces:

- Required, priced and unpriced component ids.
- `coveragePercent` and explicit `partialItemTotal`.
- `itemTotal` only when every required component has an eligible current offer.
- `purchaseTotal` only when every item total and every shipping/tax cost is
  complete.
- `partialPurchaseTotal` for whatever complete costs are known; it is never
  labelled as the full build total.
- Completeness states: `complete`, `partial-prices`, `incomplete-costs`,
  `no-offers`, `empty`.
- Budget status: `within`, `over`, `incomplete` or `currency-mismatch`.
- Limitations covering unpriced components, stale/availability exclusions and
  unknown shipping/tax.

A build can be `within` a budget only when coverage is complete, every selected
offer has a complete payable cost, and the budget currency matches the market
currency. Missing offers never produce a fabricated total or a budget-fit
claim.

The specification-based M10.4 target allocation and actual verified offer
prices remain separate concepts.

## 13. Synthetic fixture restrictions

- All development fixtures use `dataOrigin: "synthetic"`.
- Sellers and URLs use reserved `.example` domains and names containing
  "Synthetic".
- The preview displays a persistent "Synthetic fixtures only" warning and a
  `Synthetic` badge on every offer.
- Synthetic offers are never imported by recommendation scoring or the
  catalogue.
- Fixtures are development-only (`src/dev/pc-builder/pricing-fixtures.ts`) and
  are not part of the production route.
- Test fixtures explicitly state that they are synthetic and include no real
  retailer, price or stock claim.

## 14. Future provider integration plan

A future milestone can add a real adapter without changing this domain:

1. Implement `PricingProvider` for one approved API/feed.
2. Store credentials and rate-limit state outside the offer model.
3. Map provider product records through `matchProduct`; require verified
   evidence before creating offers.
4. Normalize offers through `normalizeOffer`; never overwrite a valid offer on
   a malformed response.
5. Configure provider/market freshness policies and poll only within approved
   terms.
6. Add server-side validation, caching, observability and revocation policy.
7. Keep affiliate/redirect handling in a separate approved layer; do not add
   tracking parameters to source URLs implicitly.
8. Only then connect the budget contract to M10.4, with explicit coverage and
   freshness limitations surfaced to the user.

## 15. Security and data-integrity considerations

- All provider input is untrusted and validated at the boundary.
- URLs must be HTTPS, public-hosted, credential-free and length-bounded.
- Currency codes, amounts, ids, timestamps, availability, tax status, text and
  payload sizes are validated.
- Provider HTML is never rendered or executed.
- Unknown data is `null`/`unknown`, never guessed.
- An unverified match cannot become a verified offer automatically.
- A failed refresh retains the last valid offer.
- Offer ids are normalized and bounded; duplicate/ambiguous identifiers are
  reported.
- No credentials, personal data, analytics or affiliate tracking are present in
  the offer model.
- The pricing domain is pure TypeScript with no browser, network or Astro
  dependency.

## 16. Validation

Local quality gates for this change:

- Unit tests: **717 passed / 41 files** (baseline 639 / 34).
- PC Builder Playwright: **89 passed** — 69 Chromium, 10 Firefox, 10 WebKit.
- Full production Playwright: **666 passed**.
- Catalogue: 101 records / 23 manufacturers; 84 in production, 11
  discontinued, 6 unknown; 22 critical-unknown records.
- TypeScript / Astro check: 0 errors, 0 warnings, 0 hints.
- Prettier: clean.
- Production build: 21 pages; 6 CSP inline hashes.
- Production isolation: zero PC Builder/pricing artifacts in `dist`, zero
  sitemap references, no route/navigation/Cloudflare/Wrangler/security-header
  changes.

The domain test suites cover money, regions, matching, offers, freshness,
availability, aggregation, budget, providers and synthetic fixtures. The
development preview is checked in Chromium, Firefox and WebKit. One unrelated
search-focus production test was transiently flaky on one run and passed on the
targeted rerun and full rerun; no pricing-related production test failed.

The PC Builder remains available only through the development integration in
`src/integrations/pc-builder-dev-preview.ts`; no public route, navigation,
sitemap entry, analytics, affiliate link or deployment was added.
