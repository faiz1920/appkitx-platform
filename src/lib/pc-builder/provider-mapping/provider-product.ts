/*
 * Validation and normalization for provider product identity records (M10.12).
 *
 * Provider input is untrusted. Every value is validated explicitly, empty
 * strings are treated as unknown only where the field is optional, and no
 * identifier is inferred from a title or retailer SKU. The original provider
 * identifier strings are retained alongside their normalized values.
 */

import { componentCategories, type ComponentCategory } from "../types";
import { normalizeCountryCode, isMarketId } from "../pricing/regions";
import {
  normalizeGtin,
  normalizeModelNumber,
  normalizePartNumber,
} from "../pricing/product-matching";
import {
  failure,
  isJsonSafeByteLength,
  isStableId,
  issue,
  success,
  validateHttpsUrl,
  validateOptionalText,
  validateText,
  validateTimestamp,
} from "../pricing/validation";
import type { PricingIssue, PricingResult } from "../pricing/types";
import type {
  NormalizedProviderProductIdentifiers,
  ProviderProduct,
  ProviderProductIdentifierCoverage,
  ProviderProductIdentifiers,
  ProviderProductLifecycle,
  ProviderProductProvenance,
  ProviderProductRegistry,
  ProviderProductUniquenessAudit,
  ProviderProductValidationOptions,
  ProviderProductVariant,
  ProviderProductVariantAttribute,
} from "./types";
import { fnv1a64Hex } from "./fingerprint";

export const PROVIDER_PRODUCT_SCHEMA_VERSION = 1;
export const MAX_PROVIDER_PRODUCTS = 500;
const MAX_REGISTRY_BYTES = 1024 * 1024;

const LIFECYCLES: readonly ProviderProductLifecycle[] = [
  "active",
  "discontinued",
  "superseded",
  "unknown",
];

const COLLECTION_METHODS = [
  "api",
  "feed",
  "manual",
  "fixture",
  "unknown",
] as const;

const DATA_ORIGINS = ["provider", "synthetic"] as const;

function parseInstant(value: Date | string | undefined): number | null {
  if (value === undefined) return Date.now();
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isFinite(time) ? time : null;
  }
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

function optionalText(
  value: unknown,
  path: string,
  maxLength: number,
): PricingResult<string | null> {
  if (value === null || value === undefined || value === "") {
    return success(null);
  }
  return validateOptionalText(value, path, maxLength);
}

function optionalHttpsUrl(
  value: unknown,
  path: string,
): PricingResult<string | null> {
  if (value === null || value === undefined || value === "") {
    return success(null);
  }
  return validateHttpsUrl(value, path);
}

function validateCategory(
  value: unknown,
  path: string,
): PricingResult<ComponentCategory | null> {
  if (value === null || value === undefined) return success(null);
  if (
    typeof value !== "string" ||
    !(componentCategories as readonly string[]).includes(value)
  ) {
    return failure([
      issue(path, "invalid-value", "Unknown component category."),
    ]);
  }
  return success(value as ComponentCategory);
}

function validateRawIdentifiers(
  value: unknown,
  path: string,
): PricingResult<ProviderProductIdentifiers> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return failure([
      issue(path, "invalid-type", "Provider identifiers must be an object."),
    ]);
  }
  const record = value as Record<string, unknown>;
  const issues: PricingIssue[] = [];

  const mpn = optionalText(
    record.manufacturerPartNumber,
    `${path}.manufacturerPartNumber`,
    120,
  );
  if (!mpn.ok) issues.push(...mpn.issues);

  const model = optionalText(record.modelNumber, `${path}.modelNumber`, 120);
  if (!model.ok) issues.push(...model.issues);

  const gtin = optionalText(record.gtin, `${path}.gtin`, 32);
  if (!gtin.ok) issues.push(...gtin.issues);

  const providerSku = optionalText(
    record.providerSku,
    `${path}.providerSku`,
    120,
  );
  if (!providerSku.ok) issues.push(...providerSku.issues);

  if (issues.length > 0) return failure(issues);
  if (!mpn.ok || !model.ok || !gtin.ok || !providerSku.ok) {
    return failure([
      issue(path, "invalid-value", "Provider identifiers are invalid."),
    ]);
  }

  return success({
    manufacturerPartNumber: mpn.value,
    modelNumber: model.value,
    gtin: gtin.value,
    providerSku: providerSku.value,
  });
}

function normalizeIdentifiers(
  identifiers: ProviderProductIdentifiers,
  path: string,
): PricingResult<NormalizedProviderProductIdentifiers> {
  const issues: PricingIssue[] = [];

  const mpn =
    identifiers.manufacturerPartNumber === null
      ? null
      : normalizePartNumber(identifiers.manufacturerPartNumber);
  if (identifiers.manufacturerPartNumber !== null && mpn === "") {
    issues.push(
      issue(
        `${path}.manufacturerPartNumber`,
        "invalid-value",
        "Manufacturer part number cannot be empty after normalization.",
      ),
    );
  }

  const model =
    identifiers.modelNumber === null
      ? null
      : normalizeModelNumber(identifiers.modelNumber);
  if (identifiers.modelNumber !== null && model === "") {
    issues.push(
      issue(
        `${path}.modelNumber`,
        "invalid-value",
        "Model number cannot be empty after normalization.",
      ),
    );
  }

  const gtin = normalizeGtin(identifiers.gtin);
  if (!gtin.ok) {
    issues.push(
      ...gtin.issues.map((entry) => ({
        ...entry,
        path: `${path}.gtin`,
      })),
    );
  }

  if (issues.length > 0) return failure(issues);
  if (!gtin.ok) {
    return failure([
      issue(path, "invalid-value", "Provider identifiers are invalid."),
    ]);
  }

  return success({
    manufacturerPartNumber: mpn,
    modelNumber: model,
    gtin: gtin.value,
  });
}

function validateVariant(
  value: unknown,
  path: string,
): PricingResult<ProviderProductVariant | null> {
  if (value === null || value === undefined) return success(null);
  if (typeof value !== "object" || Array.isArray(value)) {
    return failure([
      issue(
        path,
        "invalid-type",
        "Provider variant must be an object or null.",
      ),
    ]);
  }
  const record = value as Record<string, unknown>;
  const issues: PricingIssue[] = [];

  if (!isStableId(record.variantId)) {
    issues.push(
      issue(
        `${path}.variantId`,
        "invalid-id",
        "Expected a stable provider variant id.",
      ),
    );
  }
  const label = optionalText(record.variantLabel, `${path}.variantLabel`, 120);
  if (!label.ok) issues.push(...label.issues);

  const attributes: ProviderProductVariantAttribute[] = [];
  if (record.attributes !== null && record.attributes !== undefined) {
    if (!Array.isArray(record.attributes) || record.attributes.length > 20) {
      issues.push(
        issue(
          `${path}.attributes`,
          "invalid-value",
          "Variant attributes must be an array of at most 20 entries.",
        ),
      );
    } else {
      const seen = new Set<string>();
      for (const [index, entry] of record.attributes.entries()) {
        const entryPath = `${path}.attributes[${index}]`;
        if (
          typeof entry !== "object" ||
          entry === null ||
          Array.isArray(entry)
        ) {
          issues.push(
            issue(
              entryPath,
              "invalid-type",
              "Variant attribute must be an object.",
            ),
          );
          continue;
        }
        const attribute = entry as Record<string, unknown>;
        const name = validateText(attribute.name, `${entryPath}.name`, 80);
        const valueText = validateText(
          attribute.value,
          `${entryPath}.value`,
          160,
        );
        if (!name.ok) issues.push(...name.issues);
        if (!valueText.ok) issues.push(...valueText.issues);
        if (name.ok && valueText.ok) {
          const key = name.value.toLowerCase();
          if (seen.has(key)) {
            issues.push(
              issue(
                `${entryPath}.name`,
                "duplicate-identifier",
                "Variant attribute names must be unique.",
              ),
            );
          } else {
            seen.add(key);
            attributes.push({ name: name.value, value: valueText.value });
          }
        }
      }
    }
  }

  if (issues.length > 0) return failure(issues);
  if (!isStableId(record.variantId) || !label.ok) {
    return failure([
      issue(path, "invalid-value", "Provider variant is invalid."),
    ]);
  }

  return success({
    variantId: record.variantId,
    variantLabel: label.value,
    attributes,
  });
}

function validateProvenance(
  value: unknown,
  path: string,
  nowMs: number,
): PricingResult<ProviderProductProvenance> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return failure([
      issue(path, "invalid-type", "Provider provenance must be an object."),
    ]);
  }
  const record = value as Record<string, unknown>;
  const issues: PricingIssue[] = [];

  if (
    typeof record.collectionMethod !== "string" ||
    !(COLLECTION_METHODS as readonly string[]).includes(record.collectionMethod)
  ) {
    issues.push(
      issue(
        `${path}.collectionMethod`,
        "invalid-value",
        "Unknown collection method.",
      ),
    );
  }
  if (
    typeof record.dataOrigin !== "string" ||
    !(DATA_ORIGINS as readonly string[]).includes(record.dataOrigin)
  ) {
    issues.push(
      issue(
        `${path}.dataOrigin`,
        "invalid-value",
        "Data origin must be provider or synthetic.",
      ),
    );
  }

  const sourceName = validateText(record.sourceName, `${path}.sourceName`, 160);
  if (!sourceName.ok) issues.push(...sourceName.issues);

  const sourceUrl = optionalHttpsUrl(record.sourceUrl, `${path}.sourceUrl`);
  if (!sourceUrl.ok) issues.push(...sourceUrl.issues);

  const observedAt = validateTimestamp(record.observedAt, `${path}.observedAt`);
  if (!observedAt.ok) issues.push(...observedAt.issues);
  else if (observedAt.value !== null && Date.parse(observedAt.value) > nowMs) {
    issues.push(
      issue(
        `${path}.observedAt`,
        "invalid-timestamp",
        "Observation time cannot be in the future.",
      ),
    );
  }

  const retrievedAt = validateTimestamp(
    record.retrievedAt,
    `${path}.retrievedAt`,
  );
  if (!retrievedAt.ok) issues.push(...retrievedAt.issues);
  else if (retrievedAt.value !== null) {
    if (Date.parse(retrievedAt.value) > nowMs) {
      issues.push(
        issue(
          `${path}.retrievedAt`,
          "invalid-timestamp",
          "Retrieval time cannot be in the future.",
        ),
      );
    }
    if (
      observedAt.ok &&
      observedAt.value !== null &&
      retrievedAt.value < observedAt.value
    ) {
      issues.push(
        issue(
          `${path}.retrievedAt`,
          "invalid-timestamp",
          "Retrieval time cannot precede observation time.",
        ),
      );
    }
  }

  const providerUpdatedAt = validateTimestamp(
    record.providerUpdatedAt,
    `${path}.providerUpdatedAt`,
    { optional: true },
  );
  if (!providerUpdatedAt.ok) issues.push(...providerUpdatedAt.issues);
  else if (providerUpdatedAt.value !== null) {
    if (Date.parse(providerUpdatedAt.value) > nowMs) {
      issues.push(
        issue(
          `${path}.providerUpdatedAt`,
          "invalid-timestamp",
          "Provider update time cannot be in the future.",
        ),
      );
    }
    if (
      retrievedAt.ok &&
      retrievedAt.value !== null &&
      providerUpdatedAt.value > retrievedAt.value
    ) {
      issues.push(
        issue(
          `${path}.providerUpdatedAt`,
          "invalid-timestamp",
          "Provider update time cannot follow retrieval.",
        ),
      );
    }
  }

  const sourceRevision = optionalText(
    record.sourceRevision,
    `${path}.sourceRevision`,
    120,
  );
  if (!sourceRevision.ok) issues.push(...sourceRevision.issues);

  if (issues.length > 0) return failure(issues);
  if (
    !sourceName.ok ||
    !sourceUrl.ok ||
    !observedAt.ok ||
    observedAt.value === null ||
    !retrievedAt.ok ||
    retrievedAt.value === null ||
    !providerUpdatedAt.ok ||
    !sourceRevision.ok ||
    typeof record.collectionMethod !== "string" ||
    typeof record.dataOrigin !== "string"
  ) {
    return failure([
      issue(path, "invalid-value", "Provider provenance is invalid."),
    ]);
  }

  return success({
    collectionMethod:
      record.collectionMethod as ProviderProductProvenance["collectionMethod"],
    dataOrigin: record.dataOrigin as ProviderProductProvenance["dataOrigin"],
    sourceName: sourceName.value,
    sourceUrl: sourceUrl.value,
    observedAt: observedAt.value,
    retrievedAt: retrievedAt.value,
    providerUpdatedAt: providerUpdatedAt.value,
    sourceRevision: sourceRevision.value,
  });
}

function validateProviderProductAt(
  value: unknown,
  path: string,
  nowMs: number,
): PricingResult<ProviderProduct> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return failure([
      issue(path, "invalid-type", "Provider product must be an object."),
    ]);
  }
  const record = value as Record<string, unknown>;
  const issues: PricingIssue[] = [];

  if (!isStableId(record.providerId, true)) {
    issues.push(
      issue(
        `${path}.providerId`,
        "invalid-id",
        "Provider id must be lowercase letters, digits, dots, underscores, colons or hyphens.",
      ),
    );
  }
  if (!isStableId(record.externalProductId)) {
    issues.push(
      issue(
        `${path}.externalProductId`,
        "invalid-id",
        "Expected a stable external provider product id.",
      ),
    );
  }

  const productUrl = optionalHttpsUrl(record.productUrl, `${path}.productUrl`);
  if (!productUrl.ok) issues.push(...productUrl.issues);

  const title = validateText(record.title, `${path}.title`, 300);
  if (!title.ok) issues.push(...title.issues);

  const manufacturer = optionalText(
    record.manufacturer,
    `${path}.manufacturer`,
    120,
  );
  if (!manufacturer.ok) issues.push(...manufacturer.issues);

  const identifiers = validateRawIdentifiers(
    record.identifiers,
    `${path}.identifiers`,
  );
  if (!identifiers.ok) issues.push(...identifiers.issues);
  const normalizedIdentifiers = identifiers.ok
    ? normalizeIdentifiers(identifiers.value, `${path}.identifiers`)
    : failure<NormalizedProviderProductIdentifiers>([
        issue(
          `${path}.identifiers`,
          "missing",
          "Normalized identifiers require valid raw identifiers.",
        ),
      ]);
  if (!normalizedIdentifiers.ok) issues.push(...normalizedIdentifiers.issues);

  const category = validateCategory(record.category, `${path}.category`);
  if (!category.ok) issues.push(...category.issues);

  let marketId: string | null = null;
  if (record.marketId !== null && record.marketId !== undefined) {
    if (!isMarketId(record.marketId)) {
      issues.push(
        issue(
          `${path}.marketId`,
          "invalid-market",
          "Expected a lowercase provider market id or null.",
        ),
      );
    } else {
      marketId = record.marketId;
    }
  }

  let region: string | null = null;
  if (record.region !== null && record.region !== undefined) {
    region = normalizeCountryCode(record.region);
    if (region === null) {
      issues.push(
        issue(
          `${path}.region`,
          "invalid-country",
          "Expected an ISO 3166-1 alpha-2 country code or null.",
        ),
      );
    }
  }

  let sellerId: string | null = null;
  if (record.sellerId !== null && record.sellerId !== undefined) {
    if (!isStableId(record.sellerId)) {
      issues.push(
        issue(
          `${path}.sellerId`,
          "invalid-id",
          "Expected a stable provider seller id or null.",
        ),
      );
    } else {
      sellerId = record.sellerId;
    }
  }

  const variant = validateVariant(record.variant, `${path}.variant`);
  if (!variant.ok) issues.push(...variant.issues);

  let lifecycle: ProviderProductLifecycle = "unknown";
  if (
    typeof record.lifecycle !== "string" ||
    !(LIFECYCLES as readonly string[]).includes(record.lifecycle)
  ) {
    issues.push(
      issue(
        `${path}.lifecycle`,
        "invalid-value",
        "Provider lifecycle must be active, discontinued, superseded or unknown.",
      ),
    );
  } else {
    lifecycle = record.lifecycle as ProviderProductLifecycle;
  }

  let supersedes: string | null = null;
  if (
    record.supersedesExternalProductId !== null &&
    record.supersedesExternalProductId !== undefined
  ) {
    if (!isStableId(record.supersedesExternalProductId)) {
      issues.push(
        issue(
          `${path}.supersedesExternalProductId`,
          "invalid-id",
          "Expected a stable external product id or null.",
        ),
      );
    } else if (
      record.supersedesExternalProductId === record.externalProductId
    ) {
      issues.push(
        issue(
          `${path}.supersedesExternalProductId`,
          "identity-conflict",
          "A provider product cannot supersede its own external id.",
        ),
      );
    } else {
      supersedes = record.supersedesExternalProductId;
    }
  }

  const provenance = validateProvenance(
    record.provenance,
    `${path}.provenance`,
    nowMs,
  );
  if (!provenance.ok) issues.push(...provenance.issues);

  const createdAt = validateTimestamp(record.createdAt, `${path}.createdAt`);
  if (!createdAt.ok) issues.push(...createdAt.issues);
  else if (createdAt.value !== null && Date.parse(createdAt.value) > nowMs) {
    issues.push(
      issue(
        `${path}.createdAt`,
        "invalid-timestamp",
        "Record creation time cannot be in the future.",
      ),
    );
  }

  const updatedAt = validateTimestamp(record.updatedAt, `${path}.updatedAt`);
  if (!updatedAt.ok) issues.push(...updatedAt.issues);
  else if (updatedAt.value !== null) {
    if (Date.parse(updatedAt.value) > nowMs) {
      issues.push(
        issue(
          `${path}.updatedAt`,
          "invalid-timestamp",
          "Record update time cannot be in the future.",
        ),
      );
    }
    if (
      createdAt.ok &&
      createdAt.value !== null &&
      updatedAt.value < createdAt.value
    ) {
      issues.push(
        issue(
          `${path}.updatedAt`,
          "invalid-timestamp",
          "Record update time cannot precede creation time.",
        ),
      );
    }
  }

  if (issues.length > 0) return failure(issues);
  if (
    !isStableId(record.providerId, true) ||
    !isStableId(record.externalProductId) ||
    !productUrl.ok ||
    !title.ok ||
    !manufacturer.ok ||
    !identifiers.ok ||
    !normalizedIdentifiers.ok ||
    !category.ok ||
    !variant.ok ||
    !provenance.ok ||
    !createdAt.ok ||
    createdAt.value === null ||
    !updatedAt.ok ||
    updatedAt.value === null
  ) {
    return failure([
      issue(path, "invalid-value", "Provider product is invalid."),
    ]);
  }

  return success({
    providerId: record.providerId,
    externalProductId: record.externalProductId,
    productUrl: productUrl.value,
    title: title.value,
    manufacturer: manufacturer.value,
    identifiers: identifiers.value,
    normalizedIdentifiers: normalizedIdentifiers.value,
    category: category.value,
    marketId,
    region,
    sellerId,
    variant: variant.value,
    lifecycle,
    supersedesExternalProductId: supersedes,
    provenance: provenance.value,
    createdAt: createdAt.value,
    updatedAt: updatedAt.value,
  });
}

export function validateProviderProduct(
  value: unknown,
  options: ProviderProductValidationOptions = {},
): PricingResult<ProviderProduct> {
  const nowMs = parseInstant(options.now);
  if (nowMs === null) {
    return failure([
      issue("now", "invalid-timestamp", "Validation time is invalid."),
    ]);
  }
  return validateProviderProductAt(value, "product", nowMs);
}

export function providerProductKey(
  providerId: string,
  externalProductId: string,
): string {
  return `${providerId}\u0000${externalProductId}`;
}

export function computeProviderProductFingerprint(
  product: ProviderProduct,
): string {
  const canonical = JSON.stringify([
    product.providerId,
    product.externalProductId,
    product.productUrl,
    product.manufacturer,
    product.normalizedIdentifiers.manufacturerPartNumber,
    product.normalizedIdentifiers.modelNumber,
    product.normalizedIdentifiers.gtin,
    product.category,
    product.marketId,
    product.region,
    product.sellerId,
    product.variant === null
      ? null
      : [
          product.variant.variantId,
          product.variant.variantLabel,
          product.variant.attributes.map((attribute) => [
            attribute.name,
            attribute.value,
          ]),
        ],
    product.lifecycle,
    product.supersedesExternalProductId,
  ]);
  return fnv1a64Hex(canonical);
}

export function validateProviderProductRegistry(
  value: unknown,
  options: ProviderProductValidationOptions = {},
): PricingResult<ProviderProductRegistry> {
  const nowMs = parseInstant(options.now);
  if (nowMs === null) {
    return failure([
      issue("now", "invalid-timestamp", "Validation time is invalid."),
    ]);
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return failure([
      issue(
        "registry",
        "invalid-type",
        "Provider product registry must be an object.",
      ),
    ]);
  }
  if (!isJsonSafeByteLength(value, MAX_REGISTRY_BYTES)) {
    return failure([
      issue("registry", "too-large", "Provider product registry is too large."),
    ]);
  }

  const record = value as Record<string, unknown>;
  const issues: PricingIssue[] = [];
  if (record.schemaVersion !== PROVIDER_PRODUCT_SCHEMA_VERSION) {
    issues.push(
      issue(
        "schemaVersion",
        "invalid-value",
        `Expected schema version ${PROVIDER_PRODUCT_SCHEMA_VERSION}.`,
      ),
    );
  }
  if (!Array.isArray(record.products)) {
    issues.push(
      issue("products", "invalid-type", "Products must be an array."),
    );
    return failure(issues);
  }
  if (record.products.length > MAX_PROVIDER_PRODUCTS) {
    issues.push(
      issue(
        "products",
        "too-many",
        `Registry may contain at most ${MAX_PROVIDER_PRODUCTS} products.`,
      ),
    );
  }

  const products: ProviderProduct[] = [];
  const seen = new Map<string, number>();
  for (const [index, entry] of record.products.entries()) {
    const validated = validateProviderProductAt(
      entry,
      `products[${index}]`,
      nowMs,
    );
    if (!validated.ok) {
      issues.push(...validated.issues);
      continue;
    }
    const product = validated.value;
    const key = providerProductKey(
      product.providerId,
      product.externalProductId,
    );
    const prior = seen.get(key);
    if (prior !== undefined) {
      issues.push(
        issue(
          `products[${index}].externalProductId`,
          "duplicate-identifier",
          `Provider product already appears at products[${prior}].`,
        ),
      );
    } else {
      seen.set(key, index);
    }
    products.push(product);
  }

  const byKey = new Map(
    products.map((product) => [
      providerProductKey(product.providerId, product.externalProductId),
      product,
    ]),
  );
  const supersededBy = new Map<string, number>();
  for (const [index, product] of products.entries()) {
    if (product.supersedesExternalProductId === null) continue;
    const oldKey = providerProductKey(
      product.providerId,
      product.supersedesExternalProductId,
    );
    const prior = supersededBy.get(oldKey);
    if (prior !== undefined) {
      issues.push(
        issue(
          `products[${index}].supersedesExternalProductId`,
          "identity-conflict",
          `Another product record already supersedes the same external id.`,
        ),
      );
    } else {
      supersededBy.set(oldKey, index);
    }

    const old = byKey.get(oldKey);
    if (old !== undefined && old.lifecycle !== "superseded") {
      issues.push(
        issue(
          `products[${index}].supersedesExternalProductId`,
          "identity-conflict",
          "The superseded provider product must have lifecycle superseded.",
        ),
      );
    }

    const visited = new Set<string>();
    let cursor: ProviderProduct | undefined = product;
    while (
      cursor !== undefined &&
      cursor.supersedesExternalProductId !== null
    ) {
      const key = providerProductKey(
        cursor.providerId,
        cursor.externalProductId,
      );
      if (visited.has(key)) {
        issues.push(
          issue(
            `products[${index}].supersedesExternalProductId`,
            "identity-conflict",
            "Provider product supersession chain contains a cycle.",
          ),
        );
        break;
      }
      visited.add(key);
      cursor = byKey.get(
        providerProductKey(
          cursor.providerId,
          cursor.supersedesExternalProductId,
        ),
      );
    }
  }

  if (issues.length > 0) return failure(issues);
  return success({
    schemaVersion: PROVIDER_PRODUCT_SCHEMA_VERSION,
    products,
  });
}

export function auditProviderProductUniqueness(
  products: readonly ProviderProduct[],
): ProviderProductUniquenessAudit {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const product of products) {
    const key = providerProductKey(
      product.providerId,
      product.externalProductId,
    );
    if (seen.has(key)) duplicates.add(key);
    else seen.add(key);
  }

  return {
    duplicateExternalProductIds: duplicates.size,
    duplicateExternalProductIdKeys: [...duplicates].sort(),
    productIdentifierChanges: products.filter(
      (product) => product.supersedesExternalProductId !== null,
    ).length,
    supersededProducts: products.filter(
      (product) => product.lifecycle === "superseded",
    ).length,
    discontinuedProducts: products.filter(
      (product) => product.lifecycle === "discontinued",
    ).length,
  };
}

export function auditProviderProductIdentifiers(
  products: readonly ProviderProduct[],
): ProviderProductIdentifierCoverage {
  const withMpn = products.filter(
    (product) => product.normalizedIdentifiers.manufacturerPartNumber !== null,
  );
  const withGtin = products.filter(
    (product) => product.normalizedIdentifiers.gtin !== null,
  );
  const withModel = products.filter(
    (product) => product.normalizedIdentifiers.modelNumber !== null,
  );
  const withAny = products.filter(
    (product) =>
      product.normalizedIdentifiers.manufacturerPartNumber !== null ||
      product.normalizedIdentifiers.gtin !== null ||
      product.normalizedIdentifiers.modelNumber !== null,
  );

  return {
    totalProducts: products.length,
    withManufacturer: products.filter(
      (product) => product.manufacturer !== null,
    ).length,
    withManufacturerPartNumber: withMpn.length,
    withModelNumber: withModel.length,
    withGtin: withGtin.length,
    withAnyExactIdentifier: withAny.length,
    withoutExactIdentifier: products.length - withAny.length,
    providerSkuOnly: products.filter(
      (product) =>
        product.identifiers.providerSku !== null &&
        product.normalizedIdentifiers.manufacturerPartNumber === null &&
        product.normalizedIdentifiers.gtin === null &&
        product.normalizedIdentifiers.modelNumber === null,
    ).length,
  };
}
