/*
 * Provider mapping registry validation and review policy (M10.12).
 *
 * A mapping is only `verified` when a named human approved the exact evidence
 * fingerprint. Automatic matching can produce candidates, needs-review items
 * and automatic rejections, but never a verified mapping. Rejected mappings
 * are retained for audit and are never eligible for pricing ingestion.
 *
 * Provider mapping review is intentionally separate from the M10.11 catalogue
 * identity review. Approving one does not approve the other.
 */

import type { Component } from "../types";
import { componentCategories, type ComponentCategory } from "../types";
import { isMarketId, normalizeCountryCode } from "../pricing/regions";
import {
  normalizeGtin,
  normalizeModelNumber,
  normalizePartNumber,
} from "../pricing/product-matching";
import {
  failure,
  isComponentId,
  isJsonSafeByteLength,
  isStableId,
  issue,
  normalizeKey,
  success,
  validateHttpsUrl,
  validateOptionalText,
  validateText,
  validateTimestamp,
} from "../pricing/validation";
import type {
  CatalogueProductIdentity,
  PricingIssue,
  PricingResult,
} from "../pricing/types";
import { isFingerprint, fnv1a64Hex } from "./fingerprint";
import {
  computeProviderProductFingerprint,
  providerProductKey,
  validateProviderProductRegistry,
} from "./provider-product";
import type {
  ProviderEvidenceRelationship,
  ProviderMappingConflictAudit,
  ProviderMappingDataset,
  ProviderMappingEligibility,
  ProviderMappingEligibilityOptions,
  ProviderMappingEvidence,
  ProviderMappingMethod,
  ProviderMappingRegistry,
  ProviderMappingReview,
  ProviderMappingReviewStatus,
  ProviderMappingStatus,
  ProviderMappingValidationOptions,
  ProviderProduct,
  ProviderProductMapping,
} from "./types";

export const PROVIDER_MAPPING_SCHEMA_VERSION = 1;
export const MAX_PROVIDER_MAPPINGS = 500;
const MAX_REGISTRY_BYTES = 2 * 1024 * 1024;

const MAPPING_STATUSES: readonly ProviderMappingStatus[] = [
  "candidate",
  "verified",
  "rejected",
  "needs-review",
];

const MAPPING_METHODS: readonly ProviderMappingMethod[] = [
  "exact-mpn",
  "exact-gtin",
  "exact-model",
  "manual-review",
];

const REVIEW_STATUSES: readonly ProviderMappingReviewStatus[] = [
  "not-reviewed",
  "approved",
  "rejected",
  "needs-revalidation",
];

const RELATIONSHIPS: readonly ProviderEvidenceRelationship[] = [
  "match",
  "mismatch",
  "unknown",
];

const CANDIDATE_CONFIDENCE: Readonly<Record<string, number>> = {
  "exact-mpn": 100,
  "exact-gtin": 97,
};

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
  optional: boolean,
): PricingResult<ComponentCategory | null> {
  if (value === null || value === undefined) {
    if (optional) return success(null);
    return failure([
      issue(path, "missing", "A component category is required."),
    ]);
  }
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

function validateRelationship(
  value: unknown,
  path: string,
): PricingResult<ProviderEvidenceRelationship> {
  if (
    typeof value !== "string" ||
    !(RELATIONSHIPS as readonly string[]).includes(value)
  ) {
    return failure([
      issue(
        path,
        "invalid-value",
        "Evidence relationship must be match, mismatch or unknown.",
      ),
    ]);
  }
  return success(value as ProviderEvidenceRelationship);
}

function validateEvidence(
  value: unknown,
  path: string,
  component: Component,
  region: string | null,
  marketId: string | null,
  sellerId: string | null,
  variantId: string | null,
): PricingResult<ProviderMappingEvidence> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return failure([
      issue(path, "invalid-type", "Mapping evidence must be an object."),
    ]);
  }
  const record = value as Record<string, unknown>;
  const issues: PricingIssue[] = [];

  const providerProductUrl = optionalHttpsUrl(
    record.providerProductUrl,
    `${path}.providerProductUrl`,
  );
  if (!providerProductUrl.ok) issues.push(...providerProductUrl.issues);

  const providerManufacturer = optionalText(
    record.providerManufacturer,
    `${path}.providerManufacturer`,
    120,
  );
  if (!providerManufacturer.ok) issues.push(...providerManufacturer.issues);

  const providerMpn = optionalText(
    record.providerManufacturerPartNumber,
    `${path}.providerManufacturerPartNumber`,
    120,
  );
  if (!providerMpn.ok) issues.push(...providerMpn.issues);
  else if (
    providerMpn.value !== null &&
    normalizePartNumber(providerMpn.value) !== providerMpn.value
  ) {
    issues.push(
      issue(
        `${path}.providerManufacturerPartNumber`,
        "invalid-value",
        "Evidence must store the normalized manufacturer part number.",
      ),
    );
  }

  const providerModel = optionalText(
    record.providerModelNumber,
    `${path}.providerModelNumber`,
    120,
  );
  if (!providerModel.ok) issues.push(...providerModel.issues);
  else if (
    providerModel.value !== null &&
    normalizeModelNumber(providerModel.value) !== providerModel.value
  ) {
    issues.push(
      issue(
        `${path}.providerModelNumber`,
        "invalid-value",
        "Evidence must store the normalized model number.",
      ),
    );
  }

  const providerGtin = normalizeGtin(record.providerGtin);
  if (!providerGtin.ok) {
    issues.push(
      ...providerGtin.issues.map((entry) => ({
        ...entry,
        path: `${path}.providerGtin`,
      })),
    );
  }

  const providerCategory = validateCategory(
    record.providerCategory,
    `${path}.providerCategory`,
    true,
  );
  if (!providerCategory.ok) issues.push(...providerCategory.issues);

  let providerRegion: string | null = null;
  if (record.providerRegion !== null && record.providerRegion !== undefined) {
    providerRegion = normalizeCountryCode(record.providerRegion);
    if (providerRegion === null) {
      issues.push(
        issue(
          `${path}.providerRegion`,
          "invalid-country",
          "Expected an ISO 3166-1 alpha-2 country code or null.",
        ),
      );
    }
  }

  let providerMarketId: string | null = null;
  if (
    record.providerMarketId !== null &&
    record.providerMarketId !== undefined
  ) {
    if (!isMarketId(record.providerMarketId)) {
      issues.push(
        issue(
          `${path}.providerMarketId`,
          "invalid-market",
          "Expected a market id or null.",
        ),
      );
    } else {
      providerMarketId = record.providerMarketId;
    }
  }

  let providerSellerId: string | null = null;
  if (
    record.providerSellerId !== null &&
    record.providerSellerId !== undefined
  ) {
    if (!isStableId(record.providerSellerId)) {
      issues.push(
        issue(
          `${path}.providerSellerId`,
          "invalid-id",
          "Expected a seller id or null.",
        ),
      );
    } else {
      providerSellerId = record.providerSellerId;
    }
  }

  let providerVariantId: string | null = null;
  if (
    record.providerVariantId !== null &&
    record.providerVariantId !== undefined
  ) {
    if (!isStableId(record.providerVariantId)) {
      issues.push(
        issue(
          `${path}.providerVariantId`,
          "invalid-id",
          "Expected a variant id or null.",
        ),
      );
    } else {
      providerVariantId = record.providerVariantId;
    }
  }

  const catalogueManufacturer = validateText(
    record.catalogueManufacturer,
    `${path}.catalogueManufacturer`,
    120,
  );
  if (!catalogueManufacturer.ok) issues.push(...catalogueManufacturer.issues);
  else if (
    normalizeKey(catalogueManufacturer.value) !==
    normalizeKey(component.manufacturer)
  ) {
    issues.push(
      issue(
        `${path}.catalogueManufacturer`,
        "identity-conflict",
        "Evidence manufacturer does not match the catalogue component.",
      ),
    );
  }

  const catalogueModel = validateText(
    record.catalogueModel,
    `${path}.catalogueModel`,
    120,
  );
  if (!catalogueModel.ok) issues.push(...catalogueModel.issues);

  const catalogueCategory = validateCategory(
    record.catalogueCategory,
    `${path}.catalogueCategory`,
    false,
  );
  if (!catalogueCategory.ok) issues.push(...catalogueCategory.issues);
  else if (catalogueCategory.value !== component.category) {
    issues.push(
      issue(
        `${path}.catalogueCategory`,
        "identity-conflict",
        "Evidence category does not match the catalogue component.",
      ),
    );
  }

  const catalogueMpn = optionalText(
    record.catalogueManufacturerPartNumber,
    `${path}.catalogueManufacturerPartNumber`,
    120,
  );
  if (!catalogueMpn.ok) issues.push(...catalogueMpn.issues);
  else if (
    catalogueMpn.value !== null &&
    normalizePartNumber(catalogueMpn.value) !== catalogueMpn.value
  ) {
    issues.push(
      issue(
        `${path}.catalogueManufacturerPartNumber`,
        "invalid-value",
        "Evidence must store the normalized catalogue manufacturer part number.",
      ),
    );
  }

  const catalogueGtin = normalizeGtin(record.catalogueGtin);
  if (!catalogueGtin.ok) {
    issues.push(
      ...catalogueGtin.issues.map((entry) => ({
        ...entry,
        path: `${path}.catalogueGtin`,
      })),
    );
  }

  let catalogueRegion: string | null = null;
  if (record.catalogueRegion !== null && record.catalogueRegion !== undefined) {
    catalogueRegion = normalizeCountryCode(record.catalogueRegion);
    if (catalogueRegion === null) {
      issues.push(
        issue(
          `${path}.catalogueRegion`,
          "invalid-country",
          "Expected an ISO 3166-1 alpha-2 country code or null.",
        ),
      );
    }
  }

  const relationships = {
    manufacturer: validateRelationship(
      record.manufacturer,
      `${path}.manufacturer`,
    ),
    manufacturerPartNumber: validateRelationship(
      record.manufacturerPartNumber,
      `${path}.manufacturerPartNumber`,
    ),
    gtin: validateRelationship(record.gtin, `${path}.gtin`),
    modelNumber: validateRelationship(
      record.modelNumber,
      `${path}.modelNumber`,
    ),
    category: validateRelationship(record.category, `${path}.category`),
    region: validateRelationship(record.region, `${path}.region`),
  };
  for (const result of Object.values(relationships)) {
    if (!result.ok) issues.push(...result.issues);
  }

  if (
    typeof record.titleSimilarity !== "number" ||
    !Number.isFinite(record.titleSimilarity) ||
    record.titleSimilarity < 0 ||
    record.titleSimilarity > 1 ||
    Math.round(record.titleSimilarity * 100) / 100 !== record.titleSimilarity
  ) {
    issues.push(
      issue(
        `${path}.titleSimilarity`,
        "invalid-value",
        "Title similarity must be between 0 and 1 with at most two decimals.",
      ),
    );
  }

  if (providerRegion !== region) {
    issues.push(
      issue(
        `${path}.providerRegion`,
        "identity-conflict",
        "Evidence region must match the mapping region snapshot.",
      ),
    );
  }
  if (providerMarketId !== marketId) {
    issues.push(
      issue(
        `${path}.providerMarketId`,
        "identity-conflict",
        "Evidence market must match the mapping market snapshot.",
      ),
    );
  }
  if (providerSellerId !== sellerId) {
    issues.push(
      issue(
        `${path}.providerSellerId`,
        "identity-conflict",
        "Evidence seller must match the mapping seller snapshot.",
      ),
    );
  }
  if (providerVariantId !== variantId) {
    issues.push(
      issue(
        `${path}.providerVariantId`,
        "identity-conflict",
        "Evidence variant must match the mapping variant snapshot.",
      ),
    );
  }

  if (issues.length > 0) return failure(issues);
  if (
    !providerProductUrl.ok ||
    !providerManufacturer.ok ||
    !providerMpn.ok ||
    !providerModel.ok ||
    !providerGtin.ok ||
    !providerCategory.ok ||
    !catalogueManufacturer.ok ||
    !catalogueModel.ok ||
    !catalogueCategory.ok ||
    !catalogueMpn.ok ||
    !catalogueGtin.ok ||
    !relationships.manufacturer.ok ||
    !relationships.manufacturerPartNumber.ok ||
    !relationships.gtin.ok ||
    !relationships.modelNumber.ok ||
    !relationships.category.ok ||
    !relationships.region.ok
  ) {
    return failure([
      issue(path, "invalid-value", "Mapping evidence is invalid."),
    ]);
  }

  return success({
    providerProductUrl: providerProductUrl.value,
    providerManufacturer: providerManufacturer.value,
    providerManufacturerPartNumber: providerMpn.value,
    providerModelNumber: providerModel.value,
    providerGtin: providerGtin.value,
    providerCategory: providerCategory.value,
    providerRegion,
    providerMarketId,
    providerSellerId,
    providerVariantId,
    catalogueManufacturer: catalogueManufacturer.value,
    catalogueModel: catalogueModel.value,
    catalogueCategory: catalogueCategory.value as ComponentCategory,
    catalogueManufacturerPartNumber: catalogueMpn.value,
    catalogueGtin: catalogueGtin.value,
    catalogueRegion,
    manufacturer: relationships.manufacturer.value,
    manufacturerPartNumber: relationships.manufacturerPartNumber.value,
    gtin: relationships.gtin.value,
    modelNumber: relationships.modelNumber.value,
    category: relationships.category.value,
    region: relationships.region.value,
    titleSimilarity: record.titleSimilarity as number,
  });
}

function validateReview(
  value: unknown,
  path: string,
  mappingStatus: ProviderMappingStatus,
  generatedAt: string,
  providerProductUrl: string | null,
  nowMs: number,
): PricingResult<ProviderMappingReview> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return failure([
      issue(path, "invalid-type", "Mapping review must be an object."),
    ]);
  }
  const record = value as Record<string, unknown>;
  const issues: PricingIssue[] = [];
  const status = record.status;

  if (
    typeof status !== "string" ||
    !(REVIEW_STATUSES as readonly string[]).includes(status)
  ) {
    issues.push(
      issue(
        `${path}.status`,
        "invalid-value",
        "Mapping review status must be not-reviewed, approved, rejected or needs-revalidation.",
      ),
    );
  }

  if (status === "not-reviewed") {
    for (const field of [
      "reviewer",
      "reviewedAt",
      "sourceUrl",
      "evidenceFingerprint",
      "previousStatus",
    ] as const) {
      if (record[field] !== null && record[field] !== undefined) {
        issues.push(
          issue(
            `${path}.${field}`,
            "identity-conflict",
            `A not-reviewed mapping cannot set ${field}.`,
          ),
        );
      }
    }
    const notes = validateOptionalText(record.notes, `${path}.notes`, 300);
    if (!notes.ok) issues.push(...notes.issues);
    if (mappingStatus === "verified") {
      issues.push(
        issue(
          path,
          "identity-conflict",
          "A verified mapping requires an approved human review.",
        ),
      );
    }
    if (issues.length > 0) return failure(issues);
    return success({
      status: "not-reviewed",
      reviewer: null,
      reviewedAt: null,
      notes: notes.ok ? notes.value : null,
      sourceUrl: null,
      evidenceFingerprint: null,
      previousStatus: null,
    });
  }

  if (
    status !== "approved" &&
    status !== "rejected" &&
    status !== "needs-revalidation"
  ) {
    return failure(
      issues.length > 0
        ? issues
        : [issue(path, "invalid-value", "Mapping review is invalid.")],
    );
  }

  const reviewer = validateText(record.reviewer, `${path}.reviewer`, 80);
  if (!reviewer.ok) issues.push(...reviewer.issues);
  else if (
    /^opencode-/i.test(reviewer.value) ||
    /^(system|automated|fixture)$/i.test(reviewer.value)
  ) {
    issues.push(
      issue(
        `${path}.reviewer`,
        "identity-conflict",
        "Mapping reviewer must be a named person, not a process or fixture identity.",
      ),
    );
  }

  const reviewedAt = validateTimestamp(record.reviewedAt, `${path}.reviewedAt`);
  if (!reviewedAt.ok) issues.push(...reviewedAt.issues);
  else if (reviewedAt.value !== null) {
    const reviewedMs = Date.parse(reviewedAt.value);
    if (reviewedMs > nowMs) {
      issues.push(
        issue(
          `${path}.reviewedAt`,
          "invalid-timestamp",
          "Mapping review time cannot be in the future.",
        ),
      );
    }
    if (reviewedAt.value < generatedAt) {
      issues.push(
        issue(
          `${path}.reviewedAt`,
          "invalid-timestamp",
          "Mapping review time cannot precede mapping generation.",
        ),
      );
    }
  }

  const notes = validateText(record.notes, `${path}.notes`, 300);
  if (!notes.ok) issues.push(...notes.issues);

  const sourceUrl = validateHttpsUrl(record.sourceUrl, `${path}.sourceUrl`);
  if (!sourceUrl.ok) issues.push(...sourceUrl.issues);
  else if (providerProductUrl === null) {
    issues.push(
      issue(
        `${path}.sourceUrl`,
        "identity-conflict",
        "A reviewed mapping requires a provider product URL on the evidence.",
      ),
    );
  } else if (sourceUrl.value !== providerProductUrl) {
    issues.push(
      issue(
        `${path}.sourceUrl`,
        "identity-conflict",
        "Review must re-open the exact provider product URL recorded in evidence.",
      ),
    );
  }

  const fingerprint = validateText(
    record.evidenceFingerprint,
    `${path}.evidenceFingerprint`,
    32,
  );
  if (!fingerprint.ok) issues.push(...fingerprint.issues);
  else if (!isFingerprint(fingerprint.value)) {
    issues.push(
      issue(
        `${path}.evidenceFingerprint`,
        "invalid-value",
        "Evidence fingerprint must be 16 lowercase hexadecimal characters.",
      ),
    );
  }

  let previousStatus: ProviderMappingStatus | null = null;
  if (record.previousStatus !== null && record.previousStatus !== undefined) {
    if (
      typeof record.previousStatus !== "string" ||
      !(MAPPING_STATUSES as readonly string[]).includes(record.previousStatus)
    ) {
      issues.push(
        issue(
          `${path}.previousStatus`,
          "invalid-value",
          "Previous mapping status is not supported.",
        ),
      );
    } else if (record.previousStatus === mappingStatus) {
      issues.push(
        issue(
          `${path}.previousStatus`,
          "identity-conflict",
          "Previous mapping status must differ from the current status.",
        ),
      );
    } else {
      previousStatus = record.previousStatus as ProviderMappingStatus;
    }
  } else {
    issues.push(
      issue(
        `${path}.previousStatus`,
        "missing",
        "A human mapping decision must record the previous status.",
      ),
    );
  }

  if (status === "approved" && mappingStatus !== "verified") {
    issues.push(
      issue(
        path,
        "identity-conflict",
        "Only a verified mapping can carry an approved review.",
      ),
    );
  }
  if (status === "rejected" && mappingStatus !== "rejected") {
    issues.push(
      issue(
        path,
        "identity-conflict",
        "A rejected review requires a rejected mapping.",
      ),
    );
  }
  if (status === "needs-revalidation" && mappingStatus !== "needs-review") {
    issues.push(
      issue(
        path,
        "identity-conflict",
        "A needs-revalidation review requires a needs-review mapping.",
      ),
    );
  }

  if (issues.length > 0) return failure(issues);
  if (
    !reviewer.ok ||
    !reviewedAt.ok ||
    reviewedAt.value === null ||
    !notes.ok ||
    !sourceUrl.ok ||
    !fingerprint.ok ||
    typeof status !== "string"
  ) {
    return failure([
      issue(path, "invalid-value", "Mapping review is invalid."),
    ]);
  }

  return success({
    status: status as ProviderMappingReviewStatus,
    reviewer: reviewer.value,
    reviewedAt: reviewedAt.value,
    notes: notes.value,
    sourceUrl: sourceUrl.value,
    evidenceFingerprint: fingerprint.value,
    previousStatus,
  });
}

function validateMappingAt(
  value: unknown,
  path: string,
  componentsById: ReadonlyMap<string, Component>,
  productsByKey: ReadonlyMap<string, ProviderProduct>,
  nowMs: number,
): PricingResult<ProviderProductMapping> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return failure([
      issue(path, "invalid-type", "Provider mapping must be an object."),
    ]);
  }
  const record = value as Record<string, unknown>;
  const issues: PricingIssue[] = [];

  if (!isStableId(record.mappingId)) {
    issues.push(
      issue(`${path}.mappingId`, "invalid-id", "Expected a stable mapping id."),
    );
  }
  if (!isStableId(record.providerId, true)) {
    issues.push(
      issue(
        `${path}.providerId`,
        "invalid-id",
        "Expected a lowercase provider id.",
      ),
    );
  }
  if (!isStableId(record.externalProductId)) {
    issues.push(
      issue(
        `${path}.externalProductId`,
        "invalid-id",
        "Expected a stable external product id.",
      ),
    );
  }
  const componentId = record.catalogueComponentId;
  if (!isComponentId(componentId)) {
    issues.push(
      issue(
        `${path}.catalogueComponentId`,
        "invalid-id",
        "Expected a stable catalogue component id.",
      ),
    );
  }
  const component = isComponentId(componentId)
    ? componentsById.get(componentId)
    : undefined;
  if (isComponentId(componentId) && component === undefined) {
    issues.push(
      issue(
        `${path}.catalogueComponentId`,
        "invalid-value",
        "Component does not exist in the catalogue.",
      ),
    );
  }

  if (
    typeof record.method !== "string" ||
    !(MAPPING_METHODS as readonly string[]).includes(record.method)
  ) {
    issues.push(
      issue(`${path}.method`, "invalid-value", "Unknown mapping method."),
    );
  }

  if (
    typeof record.confidence !== "number" ||
    !Number.isInteger(record.confidence) ||
    record.confidence < 0 ||
    record.confidence > 100
  ) {
    issues.push(
      issue(
        `${path}.confidence`,
        "invalid-value",
        "Confidence must be an integer from 0 to 100.",
      ),
    );
  }

  if (
    typeof record.status !== "string" ||
    !(MAPPING_STATUSES as readonly string[]).includes(record.status)
  ) {
    issues.push(
      issue(
        `${path}.status`,
        "invalid-value",
        "Mapping status must be candidate, verified, rejected or needs-review.",
      ),
    );
  }
  const status = MAPPING_STATUSES.includes(
    record.status as ProviderMappingStatus,
  )
    ? (record.status as ProviderMappingStatus)
    : null;

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

  let marketId: string | null = null;
  if (record.marketId !== null && record.marketId !== undefined) {
    if (!isMarketId(record.marketId)) {
      issues.push(
        issue(
          `${path}.marketId`,
          "invalid-market",
          "Expected a market id or null.",
        ),
      );
    } else {
      marketId = record.marketId;
    }
  }

  let sellerId: string | null = null;
  if (record.sellerId !== null && record.sellerId !== undefined) {
    if (!isStableId(record.sellerId)) {
      issues.push(
        issue(
          `${path}.sellerId`,
          "invalid-id",
          "Expected a seller id or null.",
        ),
      );
    } else {
      sellerId = record.sellerId;
    }
  }

  let variantId: string | null = null;
  if (record.variantId !== null && record.variantId !== undefined) {
    if (!isStableId(record.variantId)) {
      issues.push(
        issue(
          `${path}.variantId`,
          "invalid-id",
          "Expected a variant id or null.",
        ),
      );
    } else {
      variantId = record.variantId;
    }
  }

  const evidence =
    component !== undefined
      ? validateEvidence(
          record.evidence,
          `${path}.evidence`,
          component,
          region,
          marketId,
          sellerId,
          variantId,
        )
      : failure<ProviderMappingEvidence>([
          issue(
            `${path}.evidence`,
            "missing",
            "Mapping evidence requires an existing catalogue component.",
          ),
        ]);
  if (!evidence.ok) issues.push(...evidence.issues);

  const reasons: string[] = [];
  if (!Array.isArray(record.reasons) || record.reasons.length > 10) {
    issues.push(
      issue(
        `${path}.reasons`,
        "invalid-value",
        "Reasons must be an array of at most 10 entries.",
      ),
    );
  } else if (record.reasons.length === 0) {
    issues.push(
      issue(`${path}.reasons`, "missing", "At least one reason is required."),
    );
  } else {
    for (const [index, entry] of record.reasons.entries()) {
      const text = validateText(entry, `${path}.reasons[${index}]`, 300);
      if (!text.ok) issues.push(...text.issues);
      else reasons.push(text.value);
    }
  }

  if (
    typeof record.provenance !== "object" ||
    record.provenance === null ||
    Array.isArray(record.provenance)
  ) {
    issues.push(
      issue(
        `${path}.provenance`,
        "invalid-type",
        "Provenance must be an object.",
      ),
    );
  } else {
    const provenance = record.provenance as Record<string, unknown>;
    if (
      provenance.origin !== "automatic-matching" &&
      provenance.origin !== "manual-review"
    ) {
      issues.push(
        issue(
          `${path}.provenance.origin`,
          "invalid-value",
          "Mapping origin must be automatic-matching or manual-review.",
        ),
      );
    }
    const matcherVersion = validateText(
      provenance.matcherVersion,
      `${path}.provenance.matcherVersion`,
      60,
    );
    if (!matcherVersion.ok) issues.push(...matcherVersion.issues);

    const generatedAt = validateTimestamp(
      provenance.generatedAt,
      `${path}.provenance.generatedAt`,
    );
    if (!generatedAt.ok) issues.push(...generatedAt.issues);
    else if (
      generatedAt.value !== null &&
      Date.parse(generatedAt.value) > nowMs
    ) {
      issues.push(
        issue(
          `${path}.provenance.generatedAt`,
          "invalid-timestamp",
          "Mapping generation time cannot be in the future.",
        ),
      );
    }

    const observedAt = validateTimestamp(
      provenance.providerProductObservedAt,
      `${path}.provenance.providerProductObservedAt`,
    );
    if (!observedAt.ok) issues.push(...observedAt.issues);
    const providerUpdatedAt = validateTimestamp(
      provenance.providerProductUpdatedAt,
      `${path}.provenance.providerProductUpdatedAt`,
    );
    if (!providerUpdatedAt.ok) issues.push(...providerUpdatedAt.issues);
    if (
      typeof provenance.providerProductFingerprint !== "string" ||
      !isFingerprint(provenance.providerProductFingerprint)
    ) {
      issues.push(
        issue(
          `${path}.provenance.providerProductFingerprint`,
          "invalid-value",
          "Provider product fingerprint must be 16 lowercase hexadecimal characters.",
        ),
      );
    }
  }

  const createdAt = validateTimestamp(record.createdAt, `${path}.createdAt`);
  if (!createdAt.ok) issues.push(...createdAt.issues);
  else if (createdAt.value !== null && Date.parse(createdAt.value) > nowMs) {
    issues.push(
      issue(
        `${path}.createdAt`,
        "invalid-timestamp",
        "Mapping creation time cannot be in the future.",
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
          "Mapping update time cannot be in the future.",
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
          "Mapping update time cannot precede creation time.",
        ),
      );
    }
  }

  if (
    evidence.ok &&
    status !== null &&
    typeof record.method === "string" &&
    (MAPPING_METHODS as readonly string[]).includes(record.method) &&
    typeof record.confidence === "number" &&
    Number.isInteger(record.confidence)
  ) {
    const method = record.method as ProviderMappingMethod;
    if (status === "candidate") {
      const expected = CANDIDATE_CONFIDENCE[method];
      if (expected === undefined) {
        issues.push(
          issue(
            `${path}.method`,
            "identity-conflict",
            "Candidate mappings require exact MPN or GTIN evidence.",
          ),
        );
      } else if (record.confidence !== expected) {
        issues.push(
          issue(
            `${path}.confidence`,
            "identity-conflict",
            `Candidate confidence for ${method} must be ${expected}.`,
          ),
        );
      }
      if (evidence.value.manufacturer !== "match") {
        issues.push(
          issue(
            `${path}.evidence.manufacturer`,
            "identity-conflict",
            "Candidate mappings require manufacturer evidence.",
          ),
        );
      }
      if (
        method === "exact-mpn" &&
        evidence.value.manufacturerPartNumber !== "match"
      ) {
        issues.push(
          issue(
            `${path}.evidence.manufacturerPartNumber`,
            "identity-conflict",
            "Candidate exact-mpn mappings require an MPN match.",
          ),
        );
      }
      if (method === "exact-gtin" && evidence.value.gtin !== "match") {
        issues.push(
          issue(
            `${path}.evidence.gtin`,
            "identity-conflict",
            "Candidate exact-gtin mappings require a GTIN match.",
          ),
        );
      }
    }

    if (status === "rejected" && record.confidence !== 0) {
      issues.push(
        issue(
          `${path}.confidence`,
          "identity-conflict",
          "Rejected mappings must have zero confidence.",
        ),
      );
    }

    if (status === "verified" && record.confidence === 0) {
      issues.push(
        issue(
          `${path}.confidence`,
          "identity-conflict",
          "Verified mappings require non-zero confidence.",
        ),
      );
    }
    if (status === "verified" && evidence.value.manufacturer !== "match") {
      issues.push(
        issue(
          `${path}.evidence.manufacturer`,
          "identity-conflict",
          "Verified mappings require matching manufacturer evidence.",
        ),
      );
    }
    if (
      status === "verified" &&
      method === "exact-mpn" &&
      evidence.value.manufacturerPartNumber !== "match"
    ) {
      issues.push(
        issue(
          `${path}.evidence.manufacturerPartNumber`,
          "identity-conflict",
          "Verified exact-mpn mappings require an MPN match.",
        ),
      );
    }
    if (
      status === "verified" &&
      method === "exact-gtin" &&
      evidence.value.gtin !== "match"
    ) {
      issues.push(
        issue(
          `${path}.evidence.gtin`,
          "identity-conflict",
          "Verified exact-gtin mappings require a GTIN match.",
        ),
      );
    }
  }

  if (issues.length > 0) return failure(issues);
  if (
    !isStableId(record.mappingId) ||
    !isStableId(record.providerId, true) ||
    !isStableId(record.externalProductId) ||
    component === undefined ||
    componentId !== component.id ||
    !evidence.ok ||
    status === null ||
    !createdAt.ok ||
    createdAt.value === null ||
    !updatedAt.ok ||
    updatedAt.value === null ||
    typeof record.provenance !== "object" ||
    record.provenance === null ||
    Array.isArray(record.provenance)
  ) {
    return failure([
      issue(path, "invalid-value", "Provider mapping is invalid."),
    ]);
  }

  const provenance = record.provenance as Record<string, unknown>;
  const generatedAt = provenance.generatedAt;
  if (typeof generatedAt !== "string") {
    return failure([
      issue(path, "invalid-value", "Provider mapping provenance is invalid."),
    ]);
  }

  const review = validateReview(
    record.review,
    `${path}.review`,
    status,
    generatedAt,
    evidence.value.providerProductUrl,
    nowMs,
  );
  if (!review.ok) return review;

  const mapping: ProviderProductMapping = {
    mappingId: record.mappingId,
    providerId: record.providerId,
    externalProductId: record.externalProductId,
    catalogueComponentId: component.id,
    method: record.method as ProviderMappingMethod,
    confidence: record.confidence as number,
    status,
    evidence: evidence.value,
    reasons,
    region,
    marketId,
    sellerId,
    variantId,
    provenance: {
      origin:
        provenance.origin as ProviderProductMapping["provenance"]["origin"],
      matcherVersion: provenance.matcherVersion as string,
      generatedAt,
      providerProductObservedAt: provenance.providerProductObservedAt as string,
      providerProductUpdatedAt: provenance.providerProductUpdatedAt as string,
      providerProductFingerprint:
        provenance.providerProductFingerprint as string,
    },
    review: review.value,
    createdAt: createdAt.value,
    updatedAt: updatedAt.value,
  };

  const key = providerProductKey(mapping.providerId, mapping.externalProductId);
  if (!productsByKey.has(key)) {
    issues.push(
      issue(
        `${path}.externalProductId`,
        "invalid-value",
        "Mapping references a provider product that does not exist in the registry.",
      ),
    );
  }

  if (issues.length > 0) return failure(issues);
  return success(mapping);
}

/**
 * Compute the integrity fingerprint approved by a mapping reviewer. Status,
 * reasons, review metadata and record timestamps are deliberately excluded.
 */
export type ProviderMappingFingerprintInput = Pick<
  ProviderProductMapping,
  | "providerId"
  | "externalProductId"
  | "catalogueComponentId"
  | "method"
  | "confidence"
  | "evidence"
  | "region"
  | "marketId"
  | "sellerId"
  | "variantId"
  | "provenance"
>;

export function computeProviderMappingFingerprint(
  mapping: ProviderMappingFingerprintInput,
): string {
  return fnv1a64Hex(
    JSON.stringify([
      mapping.providerId,
      mapping.externalProductId,
      mapping.catalogueComponentId,
      mapping.method,
      mapping.confidence,
      mapping.evidence,
      mapping.region,
      mapping.marketId,
      mapping.sellerId,
      mapping.variantId,
      mapping.provenance.providerProductFingerprint,
      mapping.provenance.matcherVersion,
      mapping.provenance.providerProductObservedAt,
      mapping.provenance.providerProductUpdatedAt,
    ]),
  );
}

export function isProviderMappingReviewCurrent(
  mapping: ProviderProductMapping,
): boolean {
  if (mapping.review.status === "not-reviewed") return true;
  if (!isFingerprint(mapping.review.evidenceFingerprint)) return false;
  return (
    mapping.review.evidenceFingerprint ===
    computeProviderMappingFingerprint(mapping)
  );
}

export function isProviderMappingCurrentForProduct(
  mapping: ProviderProductMapping,
  product: ProviderProduct,
): boolean {
  return (
    mapping.provenance.providerProductFingerprint ===
    computeProviderProductFingerprint(product)
  );
}

export function mappingCatalogueEvidenceMatches(
  mapping: ProviderProductMapping,
  identity: CatalogueProductIdentity,
): boolean {
  const evidence = mapping.evidence;
  return (
    normalizeKey(evidence.catalogueManufacturer) ===
      normalizeKey(identity.manufacturer) &&
    normalizeModelNumber(evidence.catalogueModel) ===
      normalizeModelNumber(identity.model) &&
    normalizePartNumber(evidence.catalogueManufacturerPartNumber ?? "") ===
      normalizePartNumber(identity.manufacturerPartNumber ?? "") &&
    (evidence.catalogueGtin ?? null) === (identity.gtin ?? null) &&
    (evidence.catalogueRegion ?? null) === (identity.region ?? null) &&
    evidence.catalogueCategory === identity.category
  );
}

/**
 * Review invalidation and provider/catalogue drift can only downgrade a
 * mapping. A stale verified mapping becomes needs-review; it never remains
 * usable. Rejected mappings stay rejected.
 */
export function effectiveProviderMappingStatus(
  mapping: ProviderProductMapping,
  context: {
    readonly product?: ProviderProduct;
    readonly catalogueIdentity?: CatalogueProductIdentity;
  } = {},
): ProviderMappingStatus {
  if (mapping.status === "rejected") return "rejected";
  if (mapping.status === "needs-review") return "needs-review";
  if (mapping.status === "candidate") {
    if (
      (context.product !== undefined &&
        !isProviderMappingCurrentForProduct(mapping, context.product)) ||
      (context.catalogueIdentity !== undefined &&
        !mappingCatalogueEvidenceMatches(mapping, context.catalogueIdentity))
    ) {
      return "needs-review";
    }
    return "candidate";
  }
  if (!isProviderMappingReviewCurrent(mapping)) return "needs-review";
  if (
    context.product !== undefined &&
    !isProviderMappingCurrentForProduct(mapping, context.product)
  ) {
    return "needs-review";
  }
  if (
    context.catalogueIdentity !== undefined &&
    !mappingCatalogueEvidenceMatches(mapping, context.catalogueIdentity)
  ) {
    return "needs-review";
  }
  return "verified";
}

export function checkProviderMappingEligibility(
  mapping: ProviderProductMapping,
  product: ProviderProduct,
  component: Component,
  options: ProviderMappingEligibilityOptions = {},
): ProviderMappingEligibility {
  const reasons: string[] = [];
  const effective = effectiveProviderMappingStatus(mapping, {
    product,
    ...(options.catalogueIdentity === undefined
      ? {}
      : { catalogueIdentity: options.catalogueIdentity }),
  });

  if (effective !== "verified") {
    reasons.push(`Mapping status is ${effective}, not verified.`);
  }
  if (mapping.review.status !== "approved") {
    reasons.push("Mapping has no approved human review.");
  }
  if (!isProviderMappingReviewCurrent(mapping)) {
    reasons.push("Mapping review fingerprint no longer matches the evidence.");
  }
  if (!isProviderMappingCurrentForProduct(mapping, product)) {
    reasons.push(
      "Provider product identity changed after the mapping was made.",
    );
  }
  if (
    options.catalogueIdentity !== undefined &&
    !mappingCatalogueEvidenceMatches(mapping, options.catalogueIdentity)
  ) {
    reasons.push(
      "Catalogue identity evidence changed after the mapping was made.",
    );
  }
  if (product.lifecycle !== "active") {
    reasons.push(`Provider product lifecycle is ${product.lifecycle}.`);
  }
  if (component.availability !== "in-production") {
    reasons.push(
      `Catalogue component availability is ${component.availability}.`,
    );
  }
  if (
    product.provenance.dataOrigin !== "provider" &&
    options.allowSyntheticData !== true
  ) {
    reasons.push(
      "Synthetic fixture data is not eligible for production pricing.",
    );
  }
  if (mapping.region !== product.region) {
    reasons.push("Mapping region does not match the current provider product.");
  }
  if (mapping.variantId !== (product.variant?.variantId ?? null)) {
    reasons.push(
      "Mapping variant does not match the current provider product variant.",
    );
  }
  if (mapping.marketId !== product.marketId) {
    reasons.push("Mapping market does not match the current provider product.");
  }
  if (mapping.sellerId !== product.sellerId) {
    reasons.push("Mapping seller does not match the current provider product.");
  }

  return { eligible: reasons.length === 0, reasons };
}

export function validateProviderMappingRegistry(
  value: unknown,
  components: readonly Component[],
  products: readonly ProviderProduct[],
  options: ProviderMappingValidationOptions = {},
): PricingResult<ProviderMappingRegistry> {
  const nowMs = parseInstant(options.now);
  if (nowMs === null) {
    return failure([
      issue("now", "invalid-timestamp", "Validation time is invalid."),
    ]);
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return failure([
      issue("registry", "invalid-type", "Mapping registry must be an object."),
    ]);
  }
  if (!isJsonSafeByteLength(value, MAX_REGISTRY_BYTES)) {
    return failure([
      issue("registry", "too-large", "Mapping registry is too large."),
    ]);
  }

  const record = value as Record<string, unknown>;
  const issues: PricingIssue[] = [];
  if (record.schemaVersion !== PROVIDER_MAPPING_SCHEMA_VERSION) {
    issues.push(
      issue(
        "schemaVersion",
        "invalid-value",
        `Expected schema version ${PROVIDER_MAPPING_SCHEMA_VERSION}.`,
      ),
    );
  }
  if (!Array.isArray(record.mappings)) {
    issues.push(
      issue("mappings", "invalid-type", "Mappings must be an array."),
    );
    return failure(issues);
  }
  if (record.mappings.length > MAX_PROVIDER_MAPPINGS) {
    issues.push(
      issue(
        "mappings",
        "too-many",
        `Registry may contain at most ${MAX_PROVIDER_MAPPINGS} mappings.`,
      ),
    );
  }

  const componentsById = new Map(
    components.map((component) => [component.id, component]),
  );
  const productsByKey = new Map(
    products.map((product) => [
      providerProductKey(product.providerId, product.externalProductId),
      product,
    ]),
  );

  const mappings: ProviderProductMapping[] = [];
  const seenIds = new Map<string, number>();
  const seenMappings = new Map<string, number>();
  const externalToComponent = new Map<
    string,
    { index: number; componentId: string }
  >();
  const variantByComponentRegion = new Map<
    string,
    { index: number; variantId: string | null }
  >();

  for (const [index, entry] of record.mappings.entries()) {
    const validated = validateMappingAt(
      entry,
      `mappings[${index}]`,
      componentsById,
      productsByKey,
      nowMs,
    );
    if (!validated.ok) {
      issues.push(...validated.issues);
      continue;
    }
    const mapping = validated.value;

    const priorId = seenIds.get(mapping.mappingId);
    if (priorId !== undefined) {
      issues.push(
        issue(
          `mappings[${index}].mappingId`,
          "duplicate-identifier",
          `Mapping id already appears at mappings[${priorId}].`,
        ),
      );
    } else {
      seenIds.set(mapping.mappingId, index);
    }

    const mappingKey = `${mapping.providerId}\u0000${mapping.externalProductId}\u0000${mapping.catalogueComponentId}`;
    const priorMapping = seenMappings.get(mappingKey);
    if (priorMapping !== undefined) {
      issues.push(
        issue(
          `mappings[${index}].catalogueComponentId`,
          "duplicate-identifier",
          `Provider product mapping already appears at mappings[${priorMapping}].`,
        ),
      );
    } else {
      seenMappings.set(mappingKey, index);
    }

    const externalKey = providerProductKey(
      mapping.providerId,
      mapping.externalProductId,
    );
    const priorExternal = externalToComponent.get(externalKey);
    if (
      priorExternal !== undefined &&
      priorExternal.componentId !== mapping.catalogueComponentId
    ) {
      issues.push(
        issue(
          `mappings[${index}].catalogueComponentId`,
          "identity-conflict",
          `External product id is already mapped to a different component at mappings[${priorExternal.index}].`,
        ),
      );
    } else if (priorExternal === undefined) {
      externalToComponent.set(externalKey, {
        index,
        componentId: mapping.catalogueComponentId,
      });
    }

    if (mapping.status !== "rejected") {
      const variantKey = `${mapping.providerId}\u0000${mapping.catalogueComponentId}\u0000${mapping.region ?? "-"}`;
      const priorVariant = variantByComponentRegion.get(variantKey);
      if (priorVariant === undefined) {
        variantByComponentRegion.set(variantKey, {
          index,
          variantId: mapping.variantId,
        });
      } else if (
        priorVariant.variantId !== null &&
        mapping.variantId !== null &&
        priorVariant.variantId !== mapping.variantId
      ) {
        issues.push(
          issue(
            `mappings[${index}].variantId`,
            "identity-conflict",
            `Catalogue component is already associated with a different provider variant at mappings[${priorVariant.index}].`,
          ),
        );
      } else if (
        priorVariant.variantId === null &&
        mapping.variantId !== null
      ) {
        variantByComponentRegion.set(variantKey, {
          index,
          variantId: mapping.variantId,
        });
      }
    }

    mappings.push(mapping);
  }

  if (issues.length > 0) return failure(issues);
  return success({
    schemaVersion: PROVIDER_MAPPING_SCHEMA_VERSION,
    mappings,
  });
}

export function validateProviderMappingDataset(
  value: unknown,
  components: readonly Component[],
  options: ProviderMappingValidationOptions = {},
): PricingResult<ProviderMappingDataset> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return failure([
      issue(
        "dataset",
        "invalid-type",
        "Provider mapping dataset must be an object.",
      ),
    ]);
  }
  const record = value as Record<string, unknown>;
  const products = validateProviderProductRegistry(
    {
      schemaVersion: record.schemaVersion,
      products: record.products,
    },
    options,
  );
  if (!products.ok) return products;

  const mappings = validateProviderMappingRegistry(
    {
      schemaVersion: record.schemaVersion,
      mappings: record.mappings,
    },
    components,
    products.value.products,
    options,
  );
  if (!mappings.ok) return mappings;

  return success({
    schemaVersion: PROVIDER_MAPPING_SCHEMA_VERSION,
    products: products.value.products,
    mappings: mappings.value.mappings,
  });
}

export function auditProviderMappingConflicts(
  mappings: readonly ProviderProductMapping[],
): ProviderMappingConflictAudit {
  const idCounts = new Map<string, number>();
  const mappingCounts = new Map<string, number>();
  const externalComponents = new Map<string, Set<string>>();
  const variantKeys = new Map<string, Set<string>>();

  for (const mapping of mappings) {
    idCounts.set(mapping.mappingId, (idCounts.get(mapping.mappingId) ?? 0) + 1);

    const mappingKey = `${mapping.providerId}\u0000${mapping.externalProductId}\u0000${mapping.catalogueComponentId}`;
    mappingCounts.set(mappingKey, (mappingCounts.get(mappingKey) ?? 0) + 1);

    const externalKey = `${mapping.providerId}:${mapping.externalProductId}`;
    const componentIds =
      externalComponents.get(externalKey) ?? new Set<string>();
    componentIds.add(mapping.catalogueComponentId);
    externalComponents.set(externalKey, componentIds);

    if (mapping.status !== "rejected" && mapping.variantId !== null) {
      const variantKey = `${mapping.providerId}\u0000${mapping.catalogueComponentId}\u0000${mapping.region ?? "-"}`;
      const variants = variantKeys.get(variantKey) ?? new Set<string>();
      variants.add(mapping.variantId);
      variantKeys.set(variantKey, variants);
    }
  }

  const duplicateMappingIdList = [...idCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([id]) => id)
    .sort();
  const duplicateMappingKeys = [...mappingCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([key]) => key.replaceAll("\u0000", ":"))
    .sort();
  const sameExternalIdConflictKeys = [...externalComponents.entries()]
    .filter(([, componentIds]) => componentIds.size > 1)
    .map(([key]) => key)
    .sort();
  const componentVariantConflictKeys = [...variantKeys.entries()]
    .filter(([, variants]) => variants.size > 1)
    .map(([key]) => key.replaceAll("\u0000", ":"))
    .sort();

  return {
    duplicateMappingIds: duplicateMappingIdList.length,
    duplicateMappingIdList,
    sameExternalIdToDifferentComponents: sameExternalIdConflictKeys.length,
    sameExternalIdConflictKeys,
    duplicateMappings: duplicateMappingKeys.length,
    duplicateMappingKeys,
    componentVariantConflicts: componentVariantConflictKeys.length,
    componentVariantConflictKeys,
  };
}
