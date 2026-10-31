/* Presentation labels for pricing states. No pricing logic lives here. */

import type {
  AggregateStatus,
  AvailabilityState,
  FreshnessState,
  OfferExclusionReason,
  SellerType,
  TaxInclusion,
} from "./types";

export const AVAILABILITY_LABELS: Record<AvailabilityState, string> = {
  "in-stock": "In stock",
  "out-of-stock": "Out of stock",
  preorder: "Preorder",
  backorder: "Backorder",
  limited: "Limited availability",
  unknown: "Availability unknown",
};

export const FRESHNESS_LABELS: Record<FreshnessState, string> = {
  fresh: "Fresh",
  aging: "Aging",
  stale: "Stale — not current",
  expired: "Expired — not current",
  unknown: "Observation time unknown",
};

export const SELLER_TYPE_LABELS: Record<SellerType, string> = {
  retailer: "Retailer",
  marketplace: "Marketplace",
  "marketplace-seller": "Marketplace seller",
  "affiliate-provider": "Affiliate provider",
};

export const TAX_LABELS: Record<TaxInclusion, string> = {
  included: "Tax included",
  excluded: "Tax excluded",
  unknown: "Tax inclusion unknown",
};

export const AGGREGATE_STATUS_LABELS: Record<AggregateStatus, string> = {
  available: "Eligible offers",
  "no-offers": "No offers",
  "no-eligible-offers": "No current eligible offers",
  "currency-mismatch": "Multiple currencies — not compared",
};

export const EXCLUSION_REASON_LABELS: Record<OfferExclusionReason, string> = {
  "match-probable": "Probable product match",
  "match-unverified": "Unverified product match",
  "price-stale": "Price is stale",
  "price-expired": "Price is expired",
  "price-time-unknown": "Price observation time is unknown",
  "availability-out-of-stock": "Out of stock",
  "availability-preorder": "Preorder",
  "availability-backorder": "Backorder",
  "availability-unknown": "Availability unknown",
  "availability-stale": "Stock observation is stale",
  "availability-time-unknown": "Stock observation time is unknown",
  "availability-not-in-stock": "Not in stock under this filter",
};
