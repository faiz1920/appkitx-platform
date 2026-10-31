/*
 * Commercial offer normalization and cost calculation (M10.7).
 *
 * Provider records are untrusted. Normalization validates every field, keeps
 * optional values genuinely optional and preserves provenance. It never
 * converts currency, never infers shipping/tax inclusion and never promotes an
 * unverified match into an offer.
 */

import {
  addMoney,
  compareMoney,
  normalizeCurrencyCode,
  parseMoney,
  subtractMoney,
} from "./money";
import { normalizeSeller, sellerCoversMarket } from "./sellers";
import { normalizeAvailability } from "./availability";
import { normalizeCountryCode, validateMarket } from "./regions";
import {
  failure,
  isAtOrBefore,
  isComponentId,
  isStableId,
  issue,
  normalizeKey,
  success,
  validateHttpsUrl,
  validateStringArray,
  validateText,
  validateTimestamp,
} from "./validation";
import type {
  AvailabilityState,
  CollectionMethod,
  Money,
  NormalizeOfferContext,
  Offer,
  OfferCost,
  OfferRestriction,
  PricingIssue,
  PricingResult,
  ProductMatch,
  TaxInclusion,
} from "./types";

const COLLECTION_METHODS: readonly CollectionMethod[] = [
  "api",
  "feed",
  "manual",
  "fixture",
  "unknown",
];

const TAX_VALUES: readonly TaxInclusion[] = ["included", "excluded", "unknown"];

function prefixIssues<T>(
  result: PricingResult<T>,
  prefix: string,
): PricingResult<T> {
  if (result.ok) return result;
  return failure(
    result.issues.map((entry) => ({
      ...entry,
      path: `${prefix}.${entry.path}`,
    })),
  );
}

function optionalMoney(
  value: unknown,
  currency: string,
  path: string,
): PricingResult<Money | null> {
  if (value === null || value === undefined || value === "") {
    return success(null);
  }
  return prefixIssues(parseMoney(value, currency), path);
}

function normalizeTaxInclusion(value: unknown): PricingResult<TaxInclusion> {
  if (value === null || value === undefined || value === "") {
    return success("unknown");
  }
  if (typeof value !== "string") {
    return failure([
      issue("taxInclusion", "invalid-tax-status", "Tax status must be text."),
    ]);
  }
  const normalized = value.trim().toLowerCase();
  if ((TAX_VALUES as readonly string[]).includes(normalized)) {
    return success(normalized as TaxInclusion);
  }
  return failure([
    issue(
      "taxInclusion",
      "invalid-tax-status",
      "Tax status must be included, excluded or unknown.",
    ),
  ]);
}

function normalizeCollectionMethod(
  value: unknown,
): PricingResult<CollectionMethod> {
  if (value === null || value === undefined || value === "") {
    return success("unknown");
  }
  if (
    typeof value === "string" &&
    (COLLECTION_METHODS as readonly string[]).includes(value)
  ) {
    return success(value as CollectionMethod);
  }
  return failure([
    issue("collectionMethod", "invalid-value", "Unknown collection method."),
  ]);
}

function normalizeRestrictions(
  value: unknown,
): PricingResult<OfferRestriction[]> {
  if (value === null || value === undefined) return success([]);
  if (!Array.isArray(value) || value.length > 10) {
    return failure([
      issue(
        "restrictions",
        "invalid-value",
        "Restrictions must be an array of at most 10 entries.",
      ),
    ]);
  }

  const restrictions: OfferRestriction[] = [];
  for (const [index, entry] of value.entries()) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      return failure([
        issue(
          `restrictions[${index}]`,
          "invalid-value",
          "Each restriction must be an object.",
        ),
      ]);
    }
    const record = entry as Record<string, unknown>;
    const note = validateText(record.note, `restrictions[${index}].note`, 200);
    if (!note.ok) return note;
    const codes = validateStringArray(
      record.countryCodes,
      `restrictions[${index}].countryCodes`,
      { min: 1, max: 249, maxItemLength: 2 },
    );
    if (!codes.ok) return codes;
    const countries: string[] = [];
    for (const [codeIndex, code] of codes.value.entries()) {
      const normalized = normalizeCountryCode(code);
      if (normalized === null) {
        return failure([
          issue(
            `restrictions[${index}].countryCodes[${codeIndex}]`,
            "invalid-country",
            "Expected an ISO 3166-1 alpha-2 country code.",
          ),
        ]);
      }
      if (!countries.includes(normalized)) countries.push(normalized);
    }
    restrictions.push({ countryCodes: countries, note: note.value });
  }
  return success(restrictions);
}

function validateMatch(match: ProductMatch): PricingResult<ProductMatch> {
  if (
    match === null ||
    typeof match !== "object" ||
    (match.status !== "verified" && match.status !== "probable")
  ) {
    return failure([
      issue(
        "match",
        "invalid-match",
        "An offer requires a verified or probable product match.",
      ),
    ]);
  }
  if (!isComponentId(match.componentId)) {
    return failure([
      issue(
        "match.componentId",
        "invalid-id",
        "The match must reference a catalogue component.",
      ),
    ]);
  }
  if (
    typeof match.confidence !== "number" ||
    !Number.isFinite(match.confidence) ||
    match.confidence < 0 ||
    match.confidence > 100
  ) {
    return failure([
      issue(
        "match.confidence",
        "invalid-value",
        "Match confidence must be between 0 and 100.",
      ),
    ]);
  }
  return success(match);
}

export function normalizeOffer(
  value: unknown,
  context: NormalizeOfferContext,
): PricingResult<Offer> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return failure([
      issue("offer", "invalid-type", "Offer must be an object."),
    ]);
  }
  const record = value as Record<string, unknown>;
  const issues: PricingIssue[] = [];

  const marketResult = validateMarket(context.market);
  if (!marketResult.ok) return marketResult;
  const market = marketResult.value;

  const sellerResult = normalizeSeller(context.seller);
  if (!sellerResult.ok) return sellerResult;
  const seller = sellerResult.value;

  if (!isStableId(context.providerId)) {
    return failure([
      issue(
        "providerId",
        "invalid-id",
        "Provider id must be a stable identifier.",
      ),
    ]);
  }
  if (
    (context.dataOrigin !== "provider" && context.dataOrigin !== "synthetic") ||
    seller.dataOrigin !== context.dataOrigin
  ) {
    return failure([
      issue(
        "dataOrigin",
        "invalid-value",
        "Offer and seller data origins must agree.",
      ),
    ]);
  }

  const matchResult = validateMatch(context.match);
  if (!matchResult.ok) return matchResult;
  const match = matchResult.value;

  if (!sellerCoversMarket(seller, market)) {
    return failure([
      issue(
        "seller.marketIds",
        "invalid-seller",
        "Seller does not cover this market and country.",
      ),
    ]);
  }

  const providerOfferId = record.providerOfferId;
  if (!isStableId(providerOfferId)) {
    issues.push(
      issue(
        "providerOfferId",
        "invalid-id",
        "Expected a stable provider offer id.",
      ),
    );
  }
  const providerProductId = record.providerProductId;
  if (!isStableId(providerProductId)) {
    issues.push(
      issue(
        "providerProductId",
        "invalid-id",
        "Expected a stable provider product id.",
      ),
    );
  }

  const productUrl = validateHttpsUrl(record.productUrl, "productUrl");
  if (!productUrl.ok) issues.push(...productUrl.issues);

  const rawMarketId = normalizeKey(String(record.marketId ?? ""));
  if (rawMarketId !== market.id) {
    issues.push(
      issue(
        "marketId",
        "invalid-market",
        "Offer market does not match the normalization context.",
      ),
    );
  }

  const rawCountry =
    typeof record.countryCode === "string"
      ? record.countryCode.trim().toUpperCase()
      : "";
  if (rawCountry !== market.countryCode) {
    issues.push(
      issue(
        "countryCode",
        "invalid-country",
        "Offer country does not match the market.",
      ),
    );
  }

  const currency = normalizeCurrencyCode(record.currency);
  if (currency === null || !market.supportedCurrencies.includes(currency)) {
    issues.push(
      issue(
        "currency",
        "invalid-currency",
        "Currency is not supported by this market.",
      ),
    );
  }

  let price = null;
  let listPrice = null;
  let shipping = null;
  let taxAmount = null;
  let availability: AvailabilityState = "unknown";
  let taxInclusion: TaxInclusion = "unknown";
  let collectionMethod: CollectionMethod = "unknown";
  let restrictions: OfferRestriction[] = [];
  let observedAt: string | null = null;
  let lastVerifiedAt: string | null = null;
  let providerUpdatedAt: string | null = null;
  let availabilityObservedAt: string | null = null;

  if (currency !== null) {
    const priceResult = prefixIssues(
      parseMoney(record.amount, currency),
      "price",
    );
    if (!priceResult.ok) issues.push(...priceResult.issues);
    else price = priceResult.value;

    const listResult = optionalMoney(record.listAmount, currency, "listAmount");
    if (!listResult.ok) issues.push(...listResult.issues);
    else listPrice = listResult.value;

    const shippingResult = optionalMoney(
      record.shippingAmount,
      currency,
      "shippingAmount",
    );
    if (!shippingResult.ok) issues.push(...shippingResult.issues);
    else shipping = shippingResult.value;

    const taxInclusionResult = normalizeTaxInclusion(record.taxInclusion);
    if (!taxInclusionResult.ok) issues.push(...taxInclusionResult.issues);
    else taxInclusion = taxInclusionResult.value;

    const taxResult = optionalMoney(record.taxAmount, currency, "taxAmount");
    if (!taxResult.ok) issues.push(...taxResult.issues);
    else taxAmount = taxResult.value;
  }

  const availabilityResult = normalizeAvailability(record.availability);
  if (!availabilityResult.ok) issues.push(...availabilityResult.issues);
  else availability = availabilityResult.value;

  const methodResult = normalizeCollectionMethod(record.collectionMethod);
  if (!methodResult.ok) issues.push(...methodResult.issues);
  else collectionMethod = methodResult.value;

  const restrictionsResult = normalizeRestrictions(record.restrictions);
  if (!restrictionsResult.ok) issues.push(...restrictionsResult.issues);
  else restrictions = restrictionsResult.value;

  const observedResult = validateTimestamp(record.observedAt, "observedAt");
  if (!observedResult.ok) issues.push(...observedResult.issues);
  else observedAt = observedResult.value;

  const lastVerifiedResult = validateTimestamp(
    record.lastVerifiedAt,
    "lastVerifiedAt",
    { optional: true },
  );
  if (!lastVerifiedResult.ok) issues.push(...lastVerifiedResult.issues);
  else lastVerifiedAt = lastVerifiedResult.value;

  const providerUpdatedResult = validateTimestamp(
    record.providerUpdatedAt,
    "providerUpdatedAt",
    { optional: true },
  );
  if (!providerUpdatedResult.ok) issues.push(...providerUpdatedResult.issues);
  else providerUpdatedAt = providerUpdatedResult.value;

  const availabilityObservedResult = validateTimestamp(
    record.availabilityObservedAt,
    "availabilityObservedAt",
    { optional: true },
  );
  if (!availabilityObservedResult.ok) {
    issues.push(...availabilityObservedResult.issues);
  } else {
    availabilityObservedAt = availabilityObservedResult.value;
  }

  if (
    observedAt !== null &&
    lastVerifiedAt !== null &&
    !isAtOrBefore(lastVerifiedAt, observedAt)
  ) {
    issues.push(
      issue(
        "lastVerifiedAt",
        "invalid-timestamp",
        "Last verification cannot follow the observation time.",
      ),
    );
  }
  if (
    observedAt !== null &&
    providerUpdatedAt !== null &&
    !isAtOrBefore(providerUpdatedAt, observedAt)
  ) {
    issues.push(
      issue(
        "providerUpdatedAt",
        "invalid-timestamp",
        "Provider update time cannot follow the observation time.",
      ),
    );
  }
  if (
    observedAt !== null &&
    availabilityObservedAt !== null &&
    !isAtOrBefore(availabilityObservedAt, observedAt)
  ) {
    issues.push(
      issue(
        "availabilityObservedAt",
        "invalid-timestamp",
        "Stock observation cannot follow the offer observation time.",
      ),
    );
  }

  if (price === null || currency === null) {
    issues.push(issue("price", "invalid-offer", "A valid price is required."));
  }

  if (issues.length > 0 || observedAt === null || price === null) {
    return failure(issues);
  }

  let discount = null;
  let discountPercent: number | null = null;
  if (listPrice !== null) {
    if (listPrice.amountMinor <= 0) {
      return failure([
        issue(
          "listAmount",
          "invalid-amount",
          "List price must be greater than zero.",
        ),
      ]);
    }
    const comparison = compareMoney(listPrice, price);
    if (!comparison.ok) return comparison;
    if (comparison.value < 0) {
      return failure([
        issue(
          "listAmount",
          "invalid-amount",
          "List price cannot be below the current price.",
        ),
      ]);
    }
    const difference = subtractMoney(listPrice, price);
    if (!difference.ok) return difference;
    discount = difference.value;
    discountPercent =
      Math.round((discount.amountMinor / listPrice.amountMinor) * 10_000) / 100;
  }

  if (!isStableId(providerOfferId) || !isStableId(providerProductId)) {
    return failure([
      issue("offer", "invalid-offer", "Offer identifiers are invalid."),
    ]);
  }

  const normalizedId = `${context.providerId}:${providerOfferId}`;
  if (normalizedId.length > 160 || /[\u0000-\u001f\u007f]/.test(normalizedId)) {
    return failure([
      issue("offerId", "too-long", "Normalized offer id is too long."),
    ]);
  }

  const marketplaceId =
    seller.sellerType === "marketplace-seller"
      ? seller.parentMarketplaceId
      : null;

  return success({
    id: normalizedId,
    componentId: match.componentId as string,
    sellerId: seller.id,
    marketplaceId,
    marketId: market.id,
    countryCode: market.countryCode,
    price,
    listPrice,
    discount,
    discountPercent,
    shipping,
    taxInclusion,
    taxAmount,
    availability: {
      state: availability,
      observedAt: availabilityObservedAt,
    },
    restrictions,
    provenance: {
      providerId: context.providerId,
      providerOfferId,
      providerProductId,
      productUrl: productUrl.ok ? productUrl.value : "",
      observedAt,
      lastVerifiedAt,
      providerUpdatedAt,
      collectionMethod,
      dataOrigin: context.dataOrigin,
      matchStatus: match.status,
    },
  });
}

export function offerCost(offer: Offer): OfferCost {
  const incompleteReasons: string[] = [];
  let total = offer.price;

  if (offer.shipping === null) {
    incompleteReasons.push("Shipping is unknown.");
  } else {
    const withShipping = addMoney(total, offer.shipping);
    if (!withShipping.ok)
      incompleteReasons.push("Shipping could not be added.");
    else total = withShipping.value;
  }

  if (offer.taxInclusion === "unknown") {
    incompleteReasons.push("Tax inclusion is unknown.");
  } else if (offer.taxInclusion === "excluded") {
    if (offer.taxAmount === null) {
      incompleteReasons.push("Excluded tax amount is unknown.");
    } else {
      const withTax = addMoney(total, offer.taxAmount);
      if (!withTax.ok) incompleteReasons.push("Tax could not be added.");
      else total = withTax.value;
    }
  }

  return {
    price: offer.price,
    shipping: offer.shipping,
    taxAmount: offer.taxAmount,
    taxInclusion: offer.taxInclusion,
    total: incompleteReasons.length === 0 ? total : null,
    incompleteReasons,
  };
}

export interface OfferRefreshResult {
  readonly offer: Offer | null;
  readonly replaced: boolean;
  readonly issues: readonly PricingIssue[];
}

/**
 * Apply a provider refresh without allowing malformed data to overwrite the
 * last valid offer. A refresh for a different offer id is rejected.
 */
export function applyOfferRefresh(
  previous: Offer | null,
  raw: unknown,
  context: NormalizeOfferContext,
): OfferRefreshResult {
  const normalized = normalizeOffer(raw, context);
  if (!normalized.ok) {
    return {
      offer: previous,
      replaced: false,
      issues: normalized.issues,
    };
  }
  if (previous !== null && previous.id !== normalized.value.id) {
    return {
      offer: previous,
      replaced: false,
      issues: [
        issue(
          "offerId",
          "invalid-offer",
          "A refresh cannot replace a different offer id.",
        ),
      ],
    };
  }
  return {
    offer: normalized.value,
    replaced: true,
    issues: [],
  };
}
