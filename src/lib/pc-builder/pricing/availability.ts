/*
 * Stock availability normalization and freshness (M10.7).
 *
 * Availability is independent of price. A fresh price can carry Unknown stock;
 * a previously reported In Stock state becomes Unknown once its own stock
 * observation has gone stale. Missing availability is never treated as stock.
 */

import { assessFreshness } from "./freshness";
import { failure, issue, success } from "./validation";
import type {
  AvailabilityFilter,
  AvailabilityState,
  FreshnessAssessment,
  FreshnessPolicy,
  Offer,
  PricingResult,
} from "./types";

const ALIASES: Readonly<Record<string, AvailabilityState>> = {
  "in-stock": "in-stock",
  in_stock: "in-stock",
  instock: "in-stock",
  "in stock": "in-stock",
  available: "in-stock",
  "out-of-stock": "out-of-stock",
  out_of_stock: "out-of-stock",
  outofstock: "out-of-stock",
  "out of stock": "out-of-stock",
  "sold-out": "out-of-stock",
  "sold out": "out-of-stock",
  unavailable: "out-of-stock",
  preorder: "preorder",
  "pre-order": "preorder",
  "pre order": "preorder",
  backorder: "backorder",
  "back-order": "backorder",
  "back order": "backorder",
  limited: "limited",
  "limited-availability": "limited",
  "low-stock": "limited",
  "low stock": "limited",
  unknown: "unknown",
  "n/a": "unknown",
  na: "unknown",
};

export function normalizeAvailability(
  value: unknown,
): PricingResult<AvailabilityState> {
  if (value === null || value === undefined || value === "") {
    return success("unknown");
  }
  if (typeof value !== "string") {
    return failure([
      issue(
        "availability",
        "invalid-availability",
        "Availability must be a string.",
      ),
    ]);
  }
  const key = value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, " ");
  const state = ALIASES[key];
  if (state === undefined) {
    return failure([
      issue(
        "availability",
        "invalid-availability",
        "Unknown availability state.",
      ),
    ]);
  }
  return success(state);
}

/** In stock or limited availability are currently purchasable. */
export function isPurchasableAvailability(state: AvailabilityState): boolean {
  return state === "in-stock" || state === "limited";
}

export function availabilitySatisfiesFilter(
  state: AvailabilityState,
  filter: AvailabilityFilter,
): boolean {
  return filter === "purchasable"
    ? isPurchasableAvailability(state)
    : state === "in-stock";
}

export interface EffectiveAvailability {
  readonly state: AvailabilityState;
  readonly freshness: FreshnessAssessment;
}

/**
 * Apply stock-specific freshness. Stale, expired or untimed stock is Unknown,
 * regardless of the reported string. Price freshness is intentionally not
 * consulted here.
 */
export function effectiveAvailability(
  offer: Offer,
  policy: FreshnessPolicy,
  now: Date | string,
): EffectiveAvailability {
  const freshness = assessFreshness(offer.availability.observedAt, policy, now);
  if (offer.availability.state === "unknown") {
    return { state: "unknown", freshness };
  }
  if (freshness.state === "fresh" || freshness.state === "aging") {
    return { state: offer.availability.state, freshness };
  }
  return { state: "unknown", freshness };
}
