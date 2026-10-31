/*
 * Retailer, marketplace and affiliate-provider identity (M10.7).
 *
 * Seller records are separate from products and offers. A marketplace listing
 * may be sold by a marketplace seller through a platform; the offer carries
 * both `sellerId` and `marketplaceId`, so the platform is never assumed to be
 * the seller.
 */

import { normalizeCountryCode } from "./regions";
import {
  failure,
  isStableId,
  issue,
  success,
  validateHttpsUrl,
  validateOptionalText,
  validateStringArray,
  validateText,
} from "./validation";
import type {
  DataOrigin,
  Market,
  PricingIssue,
  PricingResult,
  Seller,
  SellerType,
} from "./types";

const SELLER_TYPES: readonly SellerType[] = [
  "retailer",
  "marketplace",
  "marketplace-seller",
  "affiliate-provider",
];

const DATA_ORIGINS: readonly DataOrigin[] = ["provider", "synthetic"];

export function isSellerType(value: unknown): value is SellerType {
  return (
    typeof value === "string" &&
    (SELLER_TYPES as readonly string[]).includes(value)
  );
}

export function normalizeSeller(value: unknown): PricingResult<Seller> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return failure([
      issue("seller", "invalid-type", "Seller must be an object."),
    ]);
  }
  const record = value as Record<string, unknown>;
  const issues: PricingIssue[] = [];

  const id = record.id;
  if (!isStableId(id, true)) {
    issues.push(
      issue(
        "seller.id",
        "invalid-id",
        "Seller id must be a lowercase stable identifier.",
      ),
    );
  }

  const displayName = validateText(
    record.displayName,
    "seller.displayName",
    120,
  );
  if (!displayName.ok) issues.push(...displayName.issues);

  const website = validateHttpsUrl(record.websiteUrl, "seller.websiteUrl");
  if (!website.ok) issues.push(...website.issues);

  const sellerType = record.sellerType;
  if (!isSellerType(sellerType)) {
    issues.push(
      issue("seller.sellerType", "invalid-value", "Unknown seller type."),
    );
  }

  const dataOrigin = record.dataOrigin;
  if (
    typeof dataOrigin !== "string" ||
    !(DATA_ORIGINS as readonly string[]).includes(dataOrigin)
  ) {
    issues.push(
      issue(
        "seller.dataOrigin",
        "invalid-value",
        "Data origin must be provider or synthetic.",
      ),
    );
  }

  const countryCodesRaw = validateStringArray(
    record.countryCodes,
    "seller.countryCodes",
    { min: 1, max: 249, maxItemLength: 2 },
  );
  const countryCodes: string[] = [];
  if (!countryCodesRaw.ok) {
    issues.push(...countryCodesRaw.issues);
  } else {
    for (const [index, code] of countryCodesRaw.value.entries()) {
      const normalized = normalizeCountryCode(code);
      if (normalized === null) {
        issues.push(
          issue(
            `seller.countryCodes[${index}]`,
            "invalid-country",
            "Expected an ISO 3166-1 alpha-2 country code.",
          ),
        );
        continue;
      }
      if (!countryCodes.includes(normalized)) countryCodes.push(normalized);
    }
  }

  const marketIdsRaw = validateStringArray(
    record.marketIds,
    "seller.marketIds",
    { min: 1, max: 100, maxItemLength: 32, lowercaseOnly: true },
  );
  if (!marketIdsRaw.ok) issues.push(...marketIdsRaw.issues);

  const parentRaw = record.parentMarketplaceId;
  let parentMarketplaceId: string | null = null;
  if (parentRaw !== null && parentRaw !== undefined) {
    if (!isStableId(parentRaw, true)) {
      issues.push(
        issue(
          "seller.parentMarketplaceId",
          "invalid-id",
          "Marketplace id must be a lowercase stable identifier.",
        ),
      );
    } else {
      parentMarketplaceId = parentRaw;
    }
  }

  if (sellerType === "marketplace-seller" && parentMarketplaceId === null) {
    issues.push(
      issue(
        "seller.parentMarketplaceId",
        "missing",
        "A marketplace seller must reference its marketplace.",
      ),
    );
  }
  if (sellerType !== "marketplace-seller" && parentMarketplaceId !== null) {
    issues.push(
      issue(
        "seller.parentMarketplaceId",
        "invalid-value",
        "Only marketplace sellers may reference a parent marketplace.",
      ),
    );
  }
  if (
    sellerType === "marketplace-seller" &&
    typeof id === "string" &&
    parentMarketplaceId === id
  ) {
    issues.push(
      issue(
        "seller.parentMarketplaceId",
        "invalid-value",
        "A marketplace seller cannot be its own marketplace.",
      ),
    );
  }

  const providerId = validateOptionalText(
    record.providerId,
    "seller.providerId",
    128,
  );
  if (!providerId.ok) issues.push(...providerId.issues);

  const logoUrl = validateHttpsUrl(record.logoUrl, "seller.logoUrl");
  let normalizedLogo: string | null = null;
  if (record.logoUrl !== null && record.logoUrl !== undefined) {
    if (!logoUrl.ok) issues.push(...logoUrl.issues);
    else normalizedLogo = logoUrl.value;
  }

  if (issues.length > 0) return failure(issues);
  if (
    !isStableId(id, true) ||
    !displayName.ok ||
    !website.ok ||
    !isSellerType(sellerType) ||
    (dataOrigin !== "provider" && dataOrigin !== "synthetic") ||
    !marketIdsRaw.ok ||
    !providerId.ok
  ) {
    return failure([
      issue("seller", "invalid-seller", "Seller could not be normalized."),
    ]);
  }

  return success({
    id,
    displayName: displayName.value,
    websiteUrl: website.value,
    sellerType,
    countryCodes,
    marketIds: marketIdsRaw.value,
    parentMarketplaceId,
    providerId: providerId.value,
    logoUrl: normalizedLogo,
    dataOrigin,
  });
}

/** Hostname shown to users; never fetched. */
export function sellerDomain(seller: Seller): string {
  try {
    return new URL(seller.websiteUrl).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function sellerCoversMarket(seller: Seller, market: Market): boolean {
  return (
    seller.marketIds.includes(market.id) &&
    seller.countryCodes.includes(market.countryCode)
  );
}
