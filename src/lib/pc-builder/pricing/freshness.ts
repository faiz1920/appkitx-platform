/*
 * Configurable price/stock freshness policy (M10.7).
 *
 * The defaults below are a documented starting policy for a development
 * preview, not a claim about how often every retailer changes prices. A future
 * provider/market configuration can supply its own thresholds.
 *
 * A missing, malformed or future timestamp is Unknown. It is never fresh.
 */

import { failure, issue, success } from "./validation";
import type {
  FreshnessAssessment,
  FreshnessPolicy,
  FreshnessState,
  PricingResult,
} from "./types";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const MAX_POLICY_AGE = 365 * 24 * HOUR;

/**
 * Development defaults:
 * - fresh for 30 minutes;
 * - aging through 6 hours;
 * - stale through 24 hours;
 * - expired after 24 hours.
 *
 * Stale/expired prices are excluded from current comparisons. Aging offers
 * remain eligible but must be labelled with their age.
 */
export const DEFAULT_FRESHNESS_POLICY: FreshnessPolicy = {
  freshWithinMs: 30 * MINUTE,
  agingWithinMs: 6 * HOUR,
  staleWithinMs: 24 * HOUR,
};

export function validateFreshnessPolicy(
  value: unknown,
): PricingResult<FreshnessPolicy> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return failure([
      issue("freshnessPolicy", "invalid-type", "Policy must be an object."),
    ]);
  }
  const record = value as Record<string, unknown>;
  const fields = ["freshWithinMs", "agingWithinMs", "staleWithinMs"] as const;
  const issues = [];

  for (const field of fields) {
    const candidate = record[field];
    if (
      typeof candidate !== "number" ||
      !Number.isFinite(candidate) ||
      !Number.isInteger(candidate) ||
      candidate <= 0 ||
      candidate > MAX_POLICY_AGE
    ) {
      issues.push(
        issue(
          `freshnessPolicy.${field}`,
          "invalid-value",
          "Expected a positive integer duration in milliseconds.",
        ),
      );
    }
  }

  if (issues.length > 0) return failure(issues);

  const freshWithinMs = record.freshWithinMs as number;
  const agingWithinMs = record.agingWithinMs as number;
  const staleWithinMs = record.staleWithinMs as number;
  if (freshWithinMs >= agingWithinMs || agingWithinMs >= staleWithinMs) {
    return failure([
      issue(
        "freshnessPolicy",
        "invalid-value",
        "Thresholds must increase: fresh < aging < stale.",
      ),
    ]);
  }

  return success({ freshWithinMs, agingWithinMs, staleWithinMs });
}

function instantMs(value: Date | string | null | undefined): number | null {
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isFinite(time) ? time : null;
  }
  if (typeof value !== "string") return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

export function assessFreshness(
  observedAt: string | null,
  policy: FreshnessPolicy,
  now: Date | string,
): FreshnessAssessment {
  if (observedAt === null) {
    return { state: "unknown", ageMs: null, observedAt: null };
  }
  const observed = instantMs(observedAt);
  const current = instantMs(now);
  if (observed === null || current === null) {
    return { state: "unknown", ageMs: null, observedAt };
  }

  const ageMs = current - observed;
  if (ageMs < 0) {
    return { state: "unknown", ageMs: null, observedAt };
  }

  let state: FreshnessState;
  if (ageMs <= policy.freshWithinMs) state = "fresh";
  else if (ageMs <= policy.agingWithinMs) state = "aging";
  else if (ageMs <= policy.staleWithinMs) state = "stale";
  else state = "expired";

  return { state, ageMs, observedAt };
}

export function isCurrentFreshness(state: FreshnessState): boolean {
  return state === "fresh" || state === "aging";
}

export function priceFreshness(
  observedAt: string | null,
  policy: FreshnessPolicy,
  now: Date | string,
): FreshnessAssessment {
  return assessFreshness(observedAt, policy, now);
}
