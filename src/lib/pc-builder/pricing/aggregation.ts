/*
 * Pure offer aggregation for one catalogue component, market and currency
 * (M10.7).
 *
 * Comparison only ever happens inside one market and one currency. If a
 * component/market contains more than one currency, the function reports a
 * currency mismatch and refuses to choose a cheapest/highest offer.
 *
 * Price sorting is completely separate from compatibility or recommendation
 * scoring. A low price can never make an incompatible part suitable.
 */

import {
  effectiveAvailability,
  availabilitySatisfiesFilter,
} from "./availability";
import {
  DEFAULT_FRESHNESS_POLICY,
  assessFreshness,
  isCurrentFreshness,
  validateFreshnessPolicy,
} from "./freshness";
import { failure, isComponentId, issue, success } from "./validation";
import { isMarketId } from "./regions";
import { normalizeCurrencyCode } from "./money";
import type {
  AggregateStatus,
  AvailabilityState,
  ExcludedOffer,
  FreshnessAssessment,
  FreshnessPolicy,
  Offer,
  OfferAggregate,
  OfferExclusionReason,
  OfferQuery,
  PricingIssue,
  PricingResult,
} from "./types";

function parseNow(value: Date | string): number | null {
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isFinite(time) ? time : null;
  }
  if (typeof value !== "string") return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

function availabilityReasons(
  reported: AvailabilityState,
  effective: AvailabilityState,
  freshness: FreshnessAssessment,
  filter: "in-stock" | "purchasable",
): OfferExclusionReason[] {
  if (availabilitySatisfiesFilter(effective, filter)) return [];

  if (effective === "unknown") {
    if (freshness.state === "unknown") return ["availability-time-unknown"];
    if (reported !== "unknown") return ["availability-stale"];
    return ["availability-unknown"];
  }
  if (effective === "out-of-stock") return ["availability-out-of-stock"];
  if (effective === "preorder") return ["availability-preorder"];
  if (effective === "backorder") return ["availability-backorder"];
  return ["availability-not-in-stock"];
}

function aggregateStatus(
  totalCount: number,
  eligibleCount: number,
): AggregateStatus {
  if (totalCount === 0) return "no-offers";
  if (eligibleCount === 0) return "no-eligible-offers";
  return "available";
}

export function aggregateOffers(
  offers: readonly Offer[],
  query: OfferQuery,
): PricingResult<OfferAggregate> {
  const issues: PricingIssue[] = [];

  if (!isComponentId(query.componentId)) {
    issues.push(
      issue(
        "componentId",
        "invalid-id",
        "Expected a stable catalogue component id.",
      ),
    );
  }
  if (!isMarketId(query.marketId)) {
    issues.push(issue("marketId", "invalid-market", "Invalid market id."));
  }
  const currency = normalizeCurrencyCode(query.currency);
  if (currency === null) {
    issues.push(
      issue(
        "currency",
        "invalid-currency",
        "Expected a supported ISO 4217 currency code.",
      ),
    );
  }
  if (parseNow(query.now) === null) {
    issues.push(
      issue("now", "invalid-timestamp", "Comparison time is invalid."),
    );
  }

  const policyResult =
    query.policy === undefined
      ? { ok: true as const, value: DEFAULT_FRESHNESS_POLICY }
      : validateFreshnessPolicy(query.policy);
  if (!policyResult.ok) issues.push(...policyResult.issues);
  const policy: FreshnessPolicy = policyResult.ok
    ? policyResult.value
    : DEFAULT_FRESHNESS_POLICY;

  const minimumMatch = query.minimumMatch ?? "verified";
  if (minimumMatch !== "verified" && minimumMatch !== "probable") {
    issues.push(
      issue(
        "minimumMatch",
        "invalid-value",
        "Minimum match must be verified or probable.",
      ),
    );
  }

  const availability = query.availability ?? "purchasable";
  if (availability !== "in-stock" && availability !== "purchasable") {
    issues.push(
      issue(
        "availability",
        "invalid-value",
        "Availability filter must be in-stock or purchasable.",
      ),
    );
  }

  if (!Array.isArray(offers)) {
    issues.push(issue("offers", "invalid-type", "Offers must be an array."));
  }
  if (issues.length > 0 || currency === null) {
    return failure(issues);
  }

  const candidates = offers.filter(
    (offer) =>
      offer.componentId === query.componentId &&
      offer.marketId === query.marketId,
  );
  const currenciesSeen = [
    ...new Set(candidates.map((offer) => offer.price.currency)),
  ].sort();
  const totalCount = candidates.length;

  if (currenciesSeen.some((seen) => seen !== currency)) {
    return success({
      status: "currency-mismatch",
      componentId: query.componentId,
      marketId: query.marketId,
      currency,
      totalCount,
      eligibleCount: 0,
      eligible: [],
      excluded: [],
      cheapest: null,
      highest: null,
      currenciesSeen,
      limitations: [
        "Multiple currencies are present for this component and market. No cheapest offer is calculated.",
      ],
    });
  }

  const eligible: Offer[] = [];
  const excluded: ExcludedOffer[] = [];
  const exclusions = {
    stale: false,
    availability: false,
    probable: false,
    unverified: false,
  };

  for (const offer of candidates) {
    const priceFreshness = assessFreshness(
      offer.provenance.observedAt,
      policy,
      query.now,
    );
    const effective = effectiveAvailability(offer, policy, query.now);
    const reasons: OfferExclusionReason[] = [];

    if (offer.provenance.matchStatus === "unverified") {
      reasons.push("match-unverified");
      exclusions.unverified = true;
    } else if (
      offer.provenance.matchStatus === "probable" &&
      minimumMatch === "verified"
    ) {
      reasons.push("match-probable");
      exclusions.probable = true;
    }

    if (priceFreshness.state === "stale") {
      reasons.push("price-stale");
      exclusions.stale = true;
    } else if (priceFreshness.state === "expired") {
      reasons.push("price-expired");
      exclusions.stale = true;
    } else if (!isCurrentFreshness(priceFreshness.state)) {
      reasons.push("price-time-unknown");
      exclusions.stale = true;
    }

    const availabilityIssues = availabilityReasons(
      offer.availability.state,
      effective.state,
      effective.freshness,
      availability,
    );
    if (availabilityIssues.length > 0) {
      reasons.push(...availabilityIssues);
      exclusions.availability = true;
    }

    if (reasons.length === 0) {
      eligible.push(offer);
    } else {
      excluded.push({
        offer,
        reasons,
        priceFreshness,
        availabilityFreshness: effective.freshness,
        effectiveAvailability: effective.state,
      });
    }
  }

  eligible.sort(
    (a, b) =>
      a.price.amountMinor - b.price.amountMinor ||
      b.provenance.observedAt.localeCompare(a.provenance.observedAt) ||
      a.id.localeCompare(b.id),
  );

  const limitations: string[] = [];
  if (exclusions.stale) {
    limitations.push(
      "Some offers were excluded because their price observation is stale, expired or unknown.",
    );
  }
  if (exclusions.availability) {
    limitations.push(
      "Some offers were excluded because stock is unavailable, stale or unknown.",
    );
  }
  if (exclusions.probable) {
    limitations.push(
      "Probable product matches are not treated as confirmed purchase options.",
    );
  }
  if (exclusions.unverified) {
    limitations.push(
      "Unverified product matches are never presented as purchase options.",
    );
  }
  if (
    eligible.some(
      (offer) =>
        assessFreshness(offer.provenance.observedAt, policy, query.now)
          .state === "aging",
    )
  ) {
    limitations.push(
      "One or more eligible offers are aging; recheck before purchasing.",
    );
  }

  const status = aggregateStatus(totalCount, eligible.length);
  if (status === "no-offers") {
    limitations.push("No offers exist for this component and market.");
  } else if (status === "no-eligible-offers") {
    limitations.push(
      "Offers exist, but none meet the current match, freshness and availability requirements.",
    );
  }

  return success({
    status,
    componentId: query.componentId,
    marketId: query.marketId,
    currency,
    totalCount,
    eligibleCount: eligible.length,
    eligible,
    excluded,
    cheapest: eligible[0] ?? null,
    highest: eligible[eligible.length - 1] ?? null,
    currenciesSeen,
    limitations,
  });
}
