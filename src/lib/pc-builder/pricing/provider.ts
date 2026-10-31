/*
 * Provider-independent adapter contract helpers (M10.7).
 *
 * This module defines the shape of provider pages and validates response
 * envelopes. It contains no network code, credentials or retailer-specific
 * logic. Concrete adapters implement PricingProvider and use these helpers
 * before exposing records to normalization.
 */

import {
  failure,
  isJsonSafeByteLength,
  issue,
  success,
  validateCursor,
  validateTimestamp,
} from "./validation";
import { isMarketId } from "./regions";
import type {
  PricingIssue,
  PricingProvider,
  PricingResult,
  ProviderError,
  ProviderPage,
  ProviderRateLimit,
  ProviderRequest,
  ProviderResult,
} from "./types";

export const MAX_PROVIDER_PAGE_ITEMS = 200;
export const MAX_PROVIDER_RESPONSE_BYTES = 256 * 1024;
export const MAX_PROVIDER_REQUEST_LIMIT = 200;

export function providerSupportsMarket(
  provider: PricingProvider,
  marketId: string,
): boolean {
  return provider.supportedMarketIds.includes(marketId);
}

export function providerSupportsCurrency(
  provider: PricingProvider,
  currency: string,
): boolean {
  return provider.supportedCurrencies.includes(currency);
}

export function isSyntheticProvider(provider: PricingProvider): boolean {
  return provider.dataOrigin === "synthetic";
}

export function validateProviderRequest(
  value: unknown,
): PricingResult<ProviderRequest> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return failure([
      issue("request", "invalid-type", "Provider request must be an object."),
    ]);
  }
  const record = value as Record<string, unknown>;
  const issues: PricingIssue[] = [];

  if (!isMarketId(record.marketId)) {
    issues.push(issue("request.marketId", "invalid-market", "Invalid market."));
  }
  const cursor = validateCursor(record.cursor);
  if (!cursor.ok) issues.push(...cursor.issues);
  if (
    record.limit !== null &&
    record.limit !== undefined &&
    (typeof record.limit !== "number" ||
      !Number.isInteger(record.limit) ||
      record.limit <= 0 ||
      record.limit > MAX_PROVIDER_REQUEST_LIMIT)
  ) {
    issues.push(
      issue(
        "request.limit",
        "invalid-value",
        `Limit must be between 1 and ${MAX_PROVIDER_REQUEST_LIMIT}.`,
      ),
    );
  }
  if (issues.length > 0) return failure(issues);

  return success({
    marketId: record.marketId as string,
    cursor: cursor.ok ? cursor.value : null,
    limit: (record.limit as number | null) ?? null,
  });
}

function validateRateLimit(
  value: unknown,
): PricingResult<ProviderRateLimit | null> {
  if (value === null || value === undefined) return success(null);
  if (typeof value !== "object" || Array.isArray(value)) {
    return failure([
      issue(
        "rateLimit",
        "invalid-type",
        "Rate limit must be an object or null.",
      ),
    ]);
  }
  const record = value as Record<string, unknown>;
  const nullableCount = (candidate: unknown): boolean =>
    candidate === null ||
    candidate === undefined ||
    (typeof candidate === "number" &&
      Number.isInteger(candidate) &&
      candidate >= 0);

  if (!nullableCount(record.limit) || !nullableCount(record.remaining)) {
    return failure([
      issue(
        "rateLimit",
        "invalid-value",
        "Rate limit counts must be non-negative integers or null.",
      ),
    ]);
  }
  if (
    record.retryAfterMs !== null &&
    record.retryAfterMs !== undefined &&
    (typeof record.retryAfterMs !== "number" ||
      !Number.isInteger(record.retryAfterMs) ||
      record.retryAfterMs < 0)
  ) {
    return failure([
      issue(
        "rateLimit.retryAfterMs",
        "invalid-value",
        "retryAfterMs must be a non-negative integer or null.",
      ),
    ]);
  }
  const resetAt = validateTimestamp(record.resetAt, "rateLimit.resetAt", {
    optional: true,
  });
  if (!resetAt.ok) return resetAt;

  return success({
    limit: (record.limit as number | null) ?? null,
    remaining: (record.remaining as number | null) ?? null,
    resetAt: resetAt.value,
    retryAfterMs: (record.retryAfterMs as number | null) ?? null,
  });
}

export function validateProviderPage<T>(
  value: unknown,
  options: { maxItems?: number } = {},
): ProviderResult<ProviderPage<T>> {
  const maxItems = options.maxItems ?? MAX_PROVIDER_PAGE_ITEMS;
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {
      ok: false,
      error: {
        code: "invalid-response",
        message: "Provider page must be an object.",
      },
    };
  }
  if (!isJsonSafeByteLength(value, MAX_PROVIDER_RESPONSE_BYTES)) {
    return {
      ok: false,
      error: {
        code: "invalid-response",
        message: "Provider response exceeds the payload size limit.",
      },
    };
  }

  const record = value as Record<string, unknown>;
  const items = record.items;
  if (!Array.isArray(items) || items.length > maxItems) {
    return {
      ok: false,
      error: {
        code: "invalid-response",
        message: `Provider page must contain at most ${maxItems} items.`,
      },
    };
  }

  const observed = validateTimestamp(record.observedAt, "observedAt");
  if (!observed.ok || observed.value === null) {
    return {
      ok: false,
      error: {
        code: "invalid-response",
        message: "Provider page needs a canonical observation timestamp.",
      },
    };
  }
  const cursor = validateCursor(record.nextCursor);
  if (!cursor.ok) {
    return {
      ok: false,
      error: {
        code: "invalid-response",
        message: "Provider page continuation cursor is invalid.",
      },
    };
  }
  const rateLimit = validateRateLimit(record.rateLimit);
  if (!rateLimit.ok) {
    return {
      ok: false,
      error: {
        code: "invalid-response",
        message: "Provider rate-limit metadata is invalid.",
      },
    };
  }

  return {
    ok: true,
    value: {
      items: items as T[],
      nextCursor: cursor.value,
      observedAt: observed.value,
      rateLimit: rateLimit.value,
    },
  };
}

export function providerFailure(
  code: ProviderError["code"],
  message: string,
  options: { retryAfterMs?: number; requestId?: string } = {},
): ProviderResult<never> {
  return {
    ok: false,
    error: {
      code,
      message,
      ...(options.retryAfterMs === undefined
        ? {}
        : { retryAfterMs: options.retryAfterMs }),
      ...(options.requestId === undefined
        ? {}
        : { requestId: options.requestId }),
    },
  };
}
