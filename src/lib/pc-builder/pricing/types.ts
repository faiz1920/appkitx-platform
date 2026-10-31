/*
 * Provider-independent hardware pricing and availability model (M10.7).
 *
 * The catalogue remains the authority for hardware specifications. Commercial
 * offers live here and reference catalogue components only by stable AppKitX
 * component id. Nothing in this module reaches a network, reads a browser API
 * or persists provider data.
 *
 * All serialized/provider input is untrusted and must be validated in the
 * modules that create these values. Optional commercial data stays null or
 * "unknown"; it is never populated with a guessed value.
 */

import type { ComponentCategory } from "../types";

/* ------------------------------------------------------------------ */
/* Results and issues                                                  */
/* ------------------------------------------------------------------ */

export type PricingIssueCode =
  | "missing"
  | "invalid-type"
  | "invalid-value"
  | "invalid-currency"
  | "invalid-amount"
  | "invalid-locale"
  | "invalid-country"
  | "invalid-market"
  | "invalid-seller"
  | "invalid-id"
  | "invalid-url"
  | "invalid-timestamp"
  | "invalid-availability"
  | "invalid-tax-status"
  | "invalid-match"
  | "invalid-offer"
  | "currency-mismatch"
  | "too-long"
  | "too-many"
  | "too-large";

export interface PricingIssue {
  path: string;
  code: PricingIssueCode;
  message: string;
}

export type PricingResult<T> =
  { ok: true; value: T } | { ok: false; issues: PricingIssue[] };

/* ------------------------------------------------------------------ */
/* Money                                                               */
/* ------------------------------------------------------------------ */

/**
 * An exact monetary value in minor units. `amountMinor` is an integer in the
 * currency's smallest unit (cents, paise, yen, fils, ...). The currency
 * determines precision; there is deliberately no implicit conversion.
 */
export interface Money {
  readonly amountMinor: number;
  readonly currency: string;
}

export interface CurrencyInfo {
  /** Uppercase ISO 4217 alphabetic code. */
  code: string;
  /** Number of minor-unit digits resolved from Intl/CLDR. */
  precision: number;
}

/* ------------------------------------------------------------------ */
/* Markets and sellers                                                 */
/* ------------------------------------------------------------------ */

export interface Market {
  /** Stable lowercase market identifier, e.g. "us" or "in". */
  readonly id: string;
  /** ISO 3166-1 alpha-2 country code. */
  readonly countryCode: string;
  /** Human-readable market name; not used as a language selector. */
  readonly name: string;
  /** ISO 4217 currency shown by default for this market. */
  readonly defaultCurrency: string;
  /** BCP-47 locale used for display formatting, e.g. "en-IN". */
  readonly displayLocale: string;
  /** Currencies this market may price in. Includes defaultCurrency. */
  readonly supportedCurrencies: readonly string[];
}

export type SellerType =
  "retailer" | "marketplace" | "marketplace-seller" | "affiliate-provider";

/** Commercial data must say whether it is a real provider record or a fixture. */
export type DataOrigin = "provider" | "synthetic";

export interface Seller {
  readonly id: string;
  readonly displayName: string;
  /** HTTPS storefront or provider website. */
  readonly websiteUrl: string;
  readonly sellerType: SellerType;
  /** ISO country codes this seller serves. */
  readonly countryCodes: readonly string[];
  /** Market ids this seller serves. */
  readonly marketIds: readonly string[];
  /** Required for marketplace sellers; null for direct sellers. */
  readonly parentMarketplaceId: string | null;
  /** Affiliate/network/feed identifier where one exists. */
  readonly providerId: string | null;
  readonly logoUrl: string | null;
  readonly dataOrigin: DataOrigin;
}

/* ------------------------------------------------------------------ */
/* Product matching                                                    */
/* ------------------------------------------------------------------ */

export type ProductMatchStatus =
  "verified" | "probable" | "unverified" | "rejected";

export interface ProductMatchEvidence {
  manufacturer: boolean;
  manufacturerPartNumber: boolean;
  gtin: boolean;
  modelNumber: boolean;
  /** Diagnostic only; never sufficient to establish a verified match. */
  titleSimilarity: number;
}

export interface ProductMatch {
  readonly status: ProductMatchStatus;
  readonly componentId: string | null;
  /** 0–100 match confidence; never a product-quality score. */
  readonly confidence: number;
  readonly reasons: readonly string[];
  readonly evidence: ProductMatchEvidence;
}

/**
 * Catalogue-side identity available to matching. Existing catalogue records
 * expose `model` but no separate MPN or GTIN, so those stay null until a
 * verified identity source exists.
 */
export interface CatalogueProductIdentity {
  readonly componentId: string;
  readonly category: ComponentCategory;
  readonly manufacturer: string;
  readonly name: string;
  readonly model: string;
  readonly manufacturerPartNumber: string | null;
  readonly gtin: string | null;
  /** Optional region of a regional catalogue SKU, when known. */
  readonly region: string | null;
}

export interface ProviderProductRecord {
  readonly providerProductId: string;
  readonly title: string;
  readonly manufacturer: string;
  readonly manufacturerPartNumber: string | null;
  readonly modelNumber: string | null;
  readonly gtin: string | null;
  readonly category: ComponentCategory | null;
  readonly productUrl: string;
  /** Provider-reported region/SKU country, when supplied. */
  readonly region: string | null;
}

/* ------------------------------------------------------------------ */
/* Offers                                                              */
/* ------------------------------------------------------------------ */

export type AvailabilityState =
  | "in-stock"
  | "out-of-stock"
  | "preorder"
  | "backorder"
  | "limited"
  | "unknown";

export type TaxInclusion = "included" | "excluded" | "unknown";

export type CollectionMethod =
  "api" | "feed" | "manual" | "fixture" | "unknown";

export interface OfferAvailability {
  readonly state: AvailabilityState;
  /** When this stock state was observed. null means unknown, never fresh. */
  readonly observedAt: string | null;
}

export interface OfferRestriction {
  readonly countryCodes: readonly string[];
  readonly note: string;
}

export interface OfferProvenance {
  readonly providerId: string;
  readonly providerOfferId: string;
  readonly providerProductId: string;
  /** Provider-specific product page. Never rendered as HTML. */
  readonly productUrl: string;
  /** When the price was observed. */
  readonly observedAt: string;
  readonly lastVerifiedAt: string | null;
  readonly providerUpdatedAt: string | null;
  readonly collectionMethod: CollectionMethod;
  readonly dataOrigin: DataOrigin;
  readonly matchStatus: ProductMatchStatus;
}

export interface Offer {
  /** Stable normalized id, `${providerId}:${providerOfferId}`. */
  readonly id: string;
  readonly componentId: string;
  readonly sellerId: string;
  /** Marketplace platform id when a marketplace seller is involved. */
  readonly marketplaceId: string | null;
  readonly marketId: string;
  readonly countryCode: string;
  /** Current listed/sale price. */
  readonly price: Money;
  /** Original/list price when explicitly supplied. */
  readonly listPrice: Money | null;
  /** Derived discount amount when listPrice exists. */
  readonly discount: Money | null;
  /** Derived discount percentage, 0–100 with at most two display decimals. */
  readonly discountPercent: number | null;
  readonly shipping: Money | null;
  readonly taxInclusion: TaxInclusion;
  readonly taxAmount: Money | null;
  readonly availability: OfferAvailability;
  readonly restrictions: readonly OfferRestriction[];
  readonly provenance: OfferProvenance;
}

/* ------------------------------------------------------------------ */
/* Freshness                                                           */
/* ------------------------------------------------------------------ */

export type FreshnessState =
  "fresh" | "aging" | "stale" | "expired" | "unknown";

/**
 * Cumulative age thresholds. Values are deliberately configurable; the
 * defaults in freshness.ts are a documented starting policy, not a universal
 * market truth.
 */
export interface FreshnessPolicy {
  readonly freshWithinMs: number;
  readonly agingWithinMs: number;
  readonly staleWithinMs: number;
}

export interface FreshnessAssessment {
  readonly state: FreshnessState;
  readonly ageMs: number | null;
  readonly observedAt: string | null;
}

/* ------------------------------------------------------------------ */
/* Aggregation                                                         */
/* ------------------------------------------------------------------ */

export type AvailabilityFilter = "in-stock" | "purchasable";

export type OfferExclusionReason =
  | "match-probable"
  | "match-unverified"
  | "price-stale"
  | "price-expired"
  | "price-time-unknown"
  | "availability-out-of-stock"
  | "availability-preorder"
  | "availability-backorder"
  | "availability-unknown"
  | "availability-stale"
  | "availability-time-unknown"
  | "availability-not-in-stock";

export interface OfferQuery {
  readonly componentId: string;
  readonly marketId: string;
  readonly currency: string;
  readonly now: Date | string;
  readonly policy?: FreshnessPolicy;
  /** Defaults to "verified": probable matches are never purchase options by default. */
  readonly minimumMatch?: "verified" | "probable";
  /** Defaults to "purchasable" (in stock or limited availability). */
  readonly availability?: AvailabilityFilter;
}

export interface ExcludedOffer {
  readonly offer: Offer;
  readonly reasons: readonly OfferExclusionReason[];
  readonly priceFreshness: FreshnessAssessment;
  readonly availabilityFreshness: FreshnessAssessment;
  /** Availability after applying freshness; stale stock becomes unknown. */
  readonly effectiveAvailability: AvailabilityState;
}

export type AggregateStatus =
  "available" | "no-offers" | "no-eligible-offers" | "currency-mismatch";

export interface OfferAggregate {
  readonly status: AggregateStatus;
  readonly componentId: string;
  readonly marketId: string;
  readonly currency: string;
  readonly totalCount: number;
  readonly eligibleCount: number;
  readonly eligible: readonly Offer[];
  readonly excluded: readonly ExcludedOffer[];
  readonly cheapest: Offer | null;
  readonly highest: Offer | null;
  /** All currencies found among offers for this component and market. */
  readonly currenciesSeen: readonly string[];
  readonly limitations: readonly string[];
}

/* ------------------------------------------------------------------ */
/* Budget integration contract                                         */
/* ------------------------------------------------------------------ */

export interface OfferCost {
  readonly price: Money;
  readonly shipping: Money | null;
  readonly taxAmount: Money | null;
  readonly taxInclusion: TaxInclusion;
  /** Complete payable cost, or null when shipping/tax is not fully known. */
  readonly total: Money | null;
  readonly incompleteReasons: readonly string[];
}

export type PurchaseCompleteness =
  "complete" | "partial-prices" | "incomplete-costs" | "no-offers" | "empty";

export type BudgetStatus =
  "within" | "over" | "incomplete" | "currency-mismatch";

export interface BuildPurchaseInput {
  readonly requiredComponentIds: readonly string[];
  readonly offers: readonly Offer[];
  readonly marketId: string;
  readonly currency: string;
  readonly budget?: Money | null;
  readonly now: Date | string;
  readonly policy?: FreshnessPolicy;
  readonly minimumMatch?: "verified" | "probable";
  readonly availability?: AvailabilityFilter;
}

export interface ComponentPurchase {
  readonly componentId: string;
  readonly aggregateStatus: AggregateStatus;
  readonly offer: Offer | null;
  readonly cost: OfferCost | null;
}

export interface BuildPurchaseEstimate {
  readonly marketId: string;
  readonly currency: string;
  readonly requiredComponentIds: readonly string[];
  readonly pricedComponentIds: readonly string[];
  readonly unpricedComponentIds: readonly string[];
  readonly coveragePercent: number;
  /** Sum of current item prices, only when every required component is priced. */
  readonly itemTotal: Money | null;
  /** Sum of available item prices; explicitly partial. */
  readonly partialItemTotal: Money;
  /** Complete payable total; null when coverage or cost details are incomplete. */
  readonly purchaseTotal: Money | null;
  /** Sum of complete per-component costs that are available; explicitly partial. */
  readonly partialPurchaseTotal: Money;
  readonly completeness: PurchaseCompleteness;
  readonly components: readonly ComponentPurchase[];
  readonly budget: Money | null;
  readonly budgetStatus: BudgetStatus | null;
  readonly limitations: readonly string[];
}

/* ------------------------------------------------------------------ */
/* Provider abstraction                                                */
/* ------------------------------------------------------------------ */

export type ProviderErrorCode =
  | "invalid-response"
  | "unavailable"
  | "rate-limited"
  | "unauthorized"
  | "not-found"
  | "timeout"
  | "unsupported-market"
  | "unsupported-currency";

export interface ProviderError {
  readonly code: ProviderErrorCode;
  readonly message: string;
  readonly retryAfterMs?: number;
  readonly requestId?: string;
}

export type ProviderResult<T> =
  { ok: true; value: T } | { ok: false; error: ProviderError };

export interface ProviderRateLimit {
  readonly limit: number | null;
  readonly remaining: number | null;
  readonly resetAt: string | null;
  readonly retryAfterMs: number | null;
}

export interface ProviderPage<T> {
  readonly items: readonly T[];
  readonly nextCursor: string | null;
  /** When this provider page was observed. */
  readonly observedAt: string;
  readonly rateLimit: ProviderRateLimit | null;
}

export interface ProviderRequest {
  readonly marketId: string;
  readonly cursor: string | null;
  /** Requested page size; providers may return fewer. */
  readonly limit: number | null;
}

export interface ProviderProductQuery {
  readonly manufacturer: string | null;
  readonly manufacturerPartNumber: string | null;
  readonly modelNumber: string | null;
  readonly gtin: string | null;
  readonly title: string | null;
  readonly category: ComponentCategory | null;
}

export interface ProviderProductRequest extends ProviderRequest {
  readonly query: ProviderProductQuery;
}

export interface ProviderOfferRequest extends ProviderRequest {
  readonly componentIds: readonly string[];
  /** Optional requested currency; null means the provider default. */
  readonly currency: string | null;
}

export interface NormalizeOfferContext {
  readonly providerId: string;
  readonly dataOrigin: DataOrigin;
  readonly market: Market;
  readonly seller: Seller;
  readonly match: ProductMatch;
}

/**
 * Provider adapters are replaceable. They must not expose credentials,
 * perform currency conversion or return unvalidated data as normalized offers.
 */
export interface PricingProvider {
  readonly id: string;
  readonly displayName: string;
  readonly supportedMarketIds: readonly string[];
  readonly supportedCurrencies: readonly string[];
  readonly dataOrigin: DataOrigin;

  lookupProducts(
    request: ProviderProductRequest,
  ): Promise<ProviderResult<ProviderPage<ProviderProductRecord>>>;

  fetchOffers(
    request: ProviderOfferRequest,
  ): Promise<ProviderResult<ProviderPage<ProviderOfferRecord>>>;

  normalizeOffer(
    raw: unknown,
    context: NormalizeOfferContext,
  ): Promise<PricingResult<Offer>>;
}

/**
 * Raw provider offer input. Amounts are major-unit decimal strings/numbers;
 * normalization converts them to exact minor units.
 */
export interface ProviderOfferRecord {
  readonly providerOfferId: string;
  readonly providerProductId: string;
  readonly productUrl: string;
  readonly marketId: string;
  readonly countryCode: string;
  readonly currency: string;
  readonly amount: string | number;
  readonly listAmount: string | number | null;
  readonly shippingAmount: string | number | null;
  readonly taxInclusion: string | null;
  readonly taxAmount: string | number | null;
  readonly availability: string | null;
  readonly availabilityObservedAt: string | null;
  readonly observedAt: string;
  readonly lastVerifiedAt: string | null;
  readonly providerUpdatedAt: string | null;
  readonly collectionMethod: string | null;
  readonly restrictions: readonly OfferRestriction[] | null;
}
