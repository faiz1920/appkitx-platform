/*
 * Build-level purchase estimate contract (M10.7).
 *
 * This is not the M10.4 specification-budget allocator. It only sums eligible
 * commercial offers and never changes recommendation scoring. A budget-fit
 * claim is possible only when every required component has a complete,
 * eligible offer in the same currency. Otherwise the result is explicitly
 * incomplete.
 */

import { aggregateOffers } from "./aggregation";
import { offerCost } from "./offers";
import {
  addMoney,
  compareMoney,
  isValidMoney,
  normalizeCurrencyCode,
  zeroMoney,
} from "./money";
import { isComponentId, failure, issue, success } from "./validation";
import { DEFAULT_FRESHNESS_POLICY, validateFreshnessPolicy } from "./freshness";
import type {
  AggregateStatus,
  BuildPurchaseEstimate,
  BuildPurchaseInput,
  ComponentPurchase,
  Money,
  Offer,
  PricingIssue,
  PricingResult,
  PurchaseCompleteness,
} from "./types";

function checkBudget(
  value: Money | null | undefined,
): PricingResult<Money | null> {
  if (value === null || value === undefined) return success(null);
  if (!isValidMoney(value) || value.amountMinor <= 0) {
    return failure([
      issue(
        "budget",
        "invalid-amount",
        "Budget must be positive money in a supported currency.",
      ),
    ]);
  }
  return success(value);
}

export function estimateBuildPurchase(
  input: BuildPurchaseInput,
): PricingResult<BuildPurchaseEstimate> {
  const issues: PricingIssue[] = [];

  if (!Array.isArray(input.requiredComponentIds)) {
    issues.push(
      issue(
        "requiredComponentIds",
        "invalid-type",
        "Required component ids must be an array.",
      ),
    );
  }
  const required: string[] = [];
  if (Array.isArray(input.requiredComponentIds)) {
    if (input.requiredComponentIds.length > 50) {
      issues.push(
        issue(
          "requiredComponentIds",
          "too-many",
          "A build may contain at most 50 required components.",
        ),
      );
    }
    for (const [index, id] of input.requiredComponentIds.entries()) {
      if (!isComponentId(id)) {
        issues.push(
          issue(
            `requiredComponentIds[${index}]`,
            "invalid-id",
            "Expected a stable catalogue component id.",
          ),
        );
        continue;
      }
      if (required.includes(id)) {
        issues.push(
          issue(
            `requiredComponentIds[${index}]`,
            "invalid-value",
            "Duplicate required component id.",
          ),
        );
        continue;
      }
      required.push(id);
    }
  }

  const currency = normalizeCurrencyCode(input.currency);
  if (currency === null) {
    issues.push(
      issue(
        "currency",
        "invalid-currency",
        "Expected a supported ISO 4217 currency code.",
      ),
    );
  }

  const budgetResult = checkBudget(input.budget);
  if (!budgetResult.ok) issues.push(...budgetResult.issues);
  const budget = budgetResult.ok ? budgetResult.value : null;

  const policyResult =
    input.policy === undefined
      ? { ok: true as const, value: DEFAULT_FRESHNESS_POLICY }
      : validateFreshnessPolicy(input.policy);
  if (!policyResult.ok) issues.push(...policyResult.issues);
  const policy = policyResult.ok
    ? policyResult.value
    : DEFAULT_FRESHNESS_POLICY;

  if (!Array.isArray(input.offers)) {
    issues.push(issue("offers", "invalid-type", "Offers must be an array."));
  }

  if (issues.length > 0 || currency === null) return failure(issues);

  const zero = zeroMoney(currency);
  if (!zero.ok) return zero;
  let partialItemTotal: Money = zero.value;
  let partialPurchaseTotal: Money = zero.value;
  let itemSum: Money = zero.value;
  let purchaseSum: Money = zero.value;
  let allCostsComplete = true;
  const components: ComponentPurchase[] = [];
  const pricedComponentIds: string[] = [];
  const unpricedComponentIds: string[] = [];
  const limitations = new Set<string>();

  for (const componentId of required) {
    const aggregate = aggregateOffers(input.offers, {
      componentId,
      marketId: input.marketId,
      currency,
      now: input.now,
      policy,
      minimumMatch: input.minimumMatch,
      availability: input.availability,
    });
    if (!aggregate.ok) return aggregate;

    const selected = aggregate.value.cheapest;
    const cost = selected === null ? null : offerCost(selected);
    const aggregateStatus: AggregateStatus = aggregate.value.status;

    for (const limitation of aggregate.value.limitations) {
      limitations.add(limitation);
    }

    if (selected === null || cost === null) {
      unpricedComponentIds.push(componentId);
      components.push({
        componentId,
        aggregateStatus,
        offer: null,
        cost: null,
      });
      continue;
    }

    pricedComponentIds.push(componentId);
    const itemAdded = addMoney(partialItemTotal, selected.price);
    if (!itemAdded.ok) return itemAdded;
    partialItemTotal = itemAdded.value;

    if (cost.total === null) {
      allCostsComplete = false;
      for (const reason of cost.incompleteReasons) {
        limitations.add(`${componentId}: ${reason}`);
      }
    } else {
      const costAdded = addMoney(partialPurchaseTotal, cost.total);
      if (!costAdded.ok) return costAdded;
      partialPurchaseTotal = costAdded.value;
    }

    components.push({
      componentId,
      aggregateStatus,
      offer: selected,
      cost,
    });
  }

  const pricedCount = pricedComponentIds.length;
  const requiredCount = required.length;
  const completeCoverage = requiredCount > 0 && pricedCount === requiredCount;

  if (completeCoverage) {
    for (const component of components) {
      if (component.offer === null) continue;
      const added = addMoney(itemSum, component.offer.price);
      if (!added.ok) return added;
      itemSum = added.value;
      if (component.cost?.total) {
        const costAdded = addMoney(purchaseSum, component.cost.total);
        if (!costAdded.ok) return costAdded;
        purchaseSum = costAdded.value;
      }
    }
  }

  let completeness: PurchaseCompleteness;
  if (requiredCount === 0) completeness = "empty";
  else if (pricedCount === 0) completeness = "no-offers";
  else if (!completeCoverage) completeness = "partial-prices";
  else if (!allCostsComplete) completeness = "incomplete-costs";
  else completeness = "complete";

  if (unpricedComponentIds.length > 0) {
    limitations.add(
      `No eligible offer for: ${unpricedComponentIds.join(", ")}.`,
    );
  }
  if (requiredCount === 0) {
    limitations.add("No required components were supplied.");
  }
  if (completeCoverage) {
    limitations.add("Item total excludes shipping and tax.");
  }
  if (completeness === "incomplete-costs") {
    limitations.add(
      "Shipping or tax is unknown for one or more components, so a complete purchase total is unavailable.",
    );
  }
  if (budget !== null && budget.currency !== currency) {
    limitations.add(
      "Budget currency does not match the market currency. No budget comparison was made.",
    );
  } else if (budget !== null && completeness !== "complete") {
    limitations.add(
      "Budget fit cannot be claimed until every required component has a complete eligible cost.",
    );
  }

  let budgetStatus: BuildPurchaseEstimate["budgetStatus"] = null;
  if (budget !== null) {
    if (budget.currency !== currency) {
      budgetStatus = "currency-mismatch";
    } else if (completeness !== "complete") {
      budgetStatus = "incomplete";
    } else {
      const compared = compareMoney(purchaseSum, budget);
      if (!compared.ok) return compared;
      budgetStatus = compared.value <= 0 ? "within" : "over";
    }
  }

  return success({
    marketId: input.marketId,
    currency,
    requiredComponentIds: required,
    pricedComponentIds,
    unpricedComponentIds,
    coveragePercent:
      requiredCount === 0 ? 0 : Math.round((pricedCount / requiredCount) * 100),
    itemTotal: completeCoverage ? itemSum : null,
    partialItemTotal,
    purchaseTotal: completeCoverage && allCostsComplete ? purchaseSum : null,
    partialPurchaseTotal,
    completeness,
    components,
    budget,
    budgetStatus,
    limitations: [...limitations],
  });
}

export type {
  BuildPurchaseEstimate,
  ComponentPurchase,
  OfferCost,
} from "./types";

// Re-exported for callers that build a purchase estimate from raw offers.
export type { Offer };
