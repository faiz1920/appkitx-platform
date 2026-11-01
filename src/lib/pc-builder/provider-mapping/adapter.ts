/*
 * Provider adapter descriptor validation (M10.12).
 *
 * This module deliberately defines only contracts and metadata validation. It
 * contains no HTTP client, credentials, scraping, retailer-specific parsing or
 * network access. Concrete adapters are a future, separately approved change.
 */

import { isMarketId, normalizeCountryCode } from "../pricing/regions";
import {
  failure,
  isStableId,
  issue,
  success,
  validateStringArray,
  validateText,
} from "../pricing/validation";
import type { PricingIssue, PricingResult } from "../pricing/types";
import type {
  ProviderAdapterIdentity,
  ProviderPaginationContract,
  ProviderPaginationStrategy,
} from "./types";

const PAGINATION_STRATEGIES: readonly ProviderPaginationStrategy[] = [
  "cursor",
  "offset",
  "page",
  "none",
];

export function validateProviderAdapterIdentity(
  value: unknown,
): PricingResult<ProviderAdapterIdentity> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return failure([
      issue(
        "providerAdapter",
        "invalid-type",
        "Provider adapter identity must be an object.",
      ),
    ]);
  }
  const record = value as Record<string, unknown>;
  const issues: PricingIssue[] = [];

  if (!isStableId(record.providerId, true)) {
    issues.push(
      issue(
        "providerAdapter.providerId",
        "invalid-id",
        "Provider id must be lowercase letters, digits, dots, underscores, colons or hyphens.",
      ),
    );
  }

  const displayName = validateText(
    record.displayName,
    "providerAdapter.displayName",
    120,
  );
  if (!displayName.ok) issues.push(...displayName.issues);

  const markets = validateStringArray(
    record.supportedMarketIds,
    "providerAdapter.supportedMarketIds",
    { min: 1, max: 50, maxItemLength: 32, lowercaseOnly: false },
  );
  if (!markets.ok) issues.push(...markets.issues);
  else {
    for (const [index, market] of markets.value.entries()) {
      if (!isMarketId(market)) {
        issues.push(
          issue(
            `providerAdapter.supportedMarketIds[${index}]`,
            "invalid-market",
            "Expected a lowercase market id.",
          ),
        );
      }
    }
  }

  const countries = validateStringArray(
    record.supportedCountryCodes,
    "providerAdapter.supportedCountryCodes",
    { min: 1, max: 249, maxItemLength: 2, lowercaseOnly: false },
  );
  if (!countries.ok) issues.push(...countries.issues);
  else {
    for (const [index, country] of countries.value.entries()) {
      if (normalizeCountryCode(country) === null) {
        issues.push(
          issue(
            `providerAdapter.supportedCountryCodes[${index}]`,
            "invalid-country",
            "Expected an ISO 3166-1 alpha-2 country code.",
          ),
        );
      }
    }
  }

  if (record.dataOrigin !== "provider" && record.dataOrigin !== "synthetic") {
    issues.push(
      issue(
        "providerAdapter.dataOrigin",
        "invalid-value",
        "Data origin must be provider or synthetic.",
      ),
    );
  }

  const adapterVersion = validateText(
    record.adapterVersion,
    "providerAdapter.adapterVersion",
    60,
  );
  if (!adapterVersion.ok) issues.push(...adapterVersion.issues);

  if (issues.length > 0) return failure(issues);
  if (
    !isStableId(record.providerId, true) ||
    !displayName.ok ||
    !markets.ok ||
    !countries.ok ||
    !adapterVersion.ok ||
    (record.dataOrigin !== "provider" && record.dataOrigin !== "synthetic")
  ) {
    return failure([
      issue(
        "providerAdapter",
        "invalid-value",
        "Provider adapter identity is invalid.",
      ),
    ]);
  }

  return success({
    providerId: record.providerId,
    displayName: displayName.value,
    supportedMarketIds: markets.value,
    supportedCountryCodes: countries.value.map(
      (country) => normalizeCountryCode(country) ?? country,
    ),
    dataOrigin: record.dataOrigin,
    adapterVersion: adapterVersion.value,
  });
}

export function validateProviderPaginationContract(
  value: unknown,
): PricingResult<ProviderPaginationContract> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return failure([
      issue(
        "providerAdapter.pagination",
        "invalid-type",
        "Pagination contract must be an object.",
      ),
    ]);
  }
  const record = value as Record<string, unknown>;
  const issues: PricingIssue[] = [];

  if (
    typeof record.strategy !== "string" ||
    !(PAGINATION_STRATEGIES as readonly string[]).includes(record.strategy)
  ) {
    issues.push(
      issue(
        "providerAdapter.pagination.strategy",
        "invalid-value",
        "Pagination strategy must be cursor, offset, page or none.",
      ),
    );
  }

  if (
    record.pageSizeLimit !== null &&
    record.pageSizeLimit !== undefined &&
    (typeof record.pageSizeLimit !== "number" ||
      !Number.isInteger(record.pageSizeLimit) ||
      record.pageSizeLimit <= 0 ||
      record.pageSizeLimit > 10_000)
  ) {
    issues.push(
      issue(
        "providerAdapter.pagination.pageSizeLimit",
        "invalid-value",
        "Page size limit must be a positive integer up to 10000 or null.",
      ),
    );
  }

  let cursorField: string | null = null;
  if (record.cursorField !== null && record.cursorField !== undefined) {
    const text = validateText(
      record.cursorField,
      "providerAdapter.pagination.cursorField",
      80,
    );
    if (!text.ok) issues.push(...text.issues);
    else cursorField = text.value;
  }

  if (typeof record.supportsTotalCount !== "boolean") {
    issues.push(
      issue(
        "providerAdapter.pagination.supportsTotalCount",
        "invalid-type",
        "supportsTotalCount must be a boolean.",
      ),
    );
  }

  if (issues.length > 0) return failure(issues);

  return success({
    strategy: record.strategy as ProviderPaginationStrategy,
    pageSizeLimit: (record.pageSizeLimit as number | null) ?? null,
    cursorField,
    supportsTotalCount: record.supportsTotalCount as boolean,
  });
}
