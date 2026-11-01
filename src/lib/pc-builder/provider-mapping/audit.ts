/*
 * Provider mapping quality audit (M10.12).
 *
 * The audit is read-only. It validates the dataset, recomputes effective
 * mapping states, runs deterministic matching for every provider product and
 * reports conflicts, stale evidence and unmapped products with actionable
 * reasons. It never writes registry data and never approves a mapping.
 */

import type { Component } from "../types";
import { buildCatalogueIdentities } from "../pricing/identity-registry";
import { failure, issue, success } from "../pricing/validation";
import type { CatalogueProductIdentity, PricingResult } from "../pricing/types";
import {
  checkProviderMappingEligibility,
  effectiveProviderMappingStatus,
  isProviderMappingCurrentForProduct,
  mappingCatalogueEvidenceMatches,
  auditProviderMappingConflicts,
  validateProviderMappingDataset,
} from "./mapping";
import { matchProviderProduct } from "./matching";
import {
  auditProviderProductUniqueness,
  providerProductKey,
} from "./provider-product";
import type {
  ProviderMappingAudit,
  ProviderMappingAuditIssue,
  ProviderMappingAuditOptions,
  ProviderProduct,
  ProviderProductMapping,
} from "./types";

function parseInstant(value: Date | string | undefined): number | null {
  if (value === undefined) return Date.now();
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isFinite(time) ? time : null;
  }
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

function sortUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function readableKey(key: string): string {
  return key.replaceAll("\u0000", ":");
}

export function auditProviderMappingDataset(
  components: readonly Component[],
  dataset: unknown,
  options: ProviderMappingAuditOptions = {},
): PricingResult<ProviderMappingAudit> {
  const nowMs = parseInstant(options.now);
  if (nowMs === null) {
    return failure([
      issue("now", "invalid-timestamp", "Audit time is invalid."),
    ]);
  }

  const validated = validateProviderMappingDataset(
    dataset,
    components,
    options,
  );
  if (!validated.ok) return validated;

  const identitiesResult = buildCatalogueIdentities(
    components,
    options.identifierRegistry,
  );
  if (!identitiesResult.ok) return identitiesResult;

  const identityById = new Map<string, CatalogueProductIdentity>(
    identitiesResult.value.map((identity) => [identity.componentId, identity]),
  );
  const componentById = new Map(
    components.map((component) => [component.id, component]),
  );
  const productByKey = new Map(
    validated.value.products.map((product) => [
      providerProductKey(product.providerId, product.externalProductId),
      product,
    ]),
  );
  const mappingsByProduct = new Map<string, ProviderProductMapping[]>();
  for (const mapping of validated.value.mappings) {
    const key = providerProductKey(
      mapping.providerId,
      mapping.externalProductId,
    );
    const list = mappingsByProduct.get(key) ?? [];
    list.push(mapping);
    mappingsByProduct.set(key, list);
  }

  const issues: ProviderMappingAuditIssue[] = [];
  const addIssue = (
    severity: ProviderMappingAuditIssue["severity"],
    code: string,
    message: string,
    product: ProviderProduct | null,
    mapping: ProviderProductMapping | null,
  ): void => {
    issues.push({
      severity,
      code,
      message,
      providerId: product?.providerId ?? mapping?.providerId ?? null,
      externalProductId:
        product?.externalProductId ?? mapping?.externalProductId ?? null,
      mappingId: mapping?.mappingId ?? null,
    });
  };

  const declaredCounts: Record<string, number> = {
    verified: 0,
    candidate: 0,
    "needs-review": 0,
    rejected: 0,
  };

  let effectiveVerified = 0;
  let effectiveNeedsReview = 0;
  let invalidatedReviews = 0;
  let staleProviderMappings = 0;
  let staleCatalogueMappings = 0;
  const regionalMismatchMappingIds: string[] = [];
  const discontinuedTargetMappingIds: string[] = [];
  const eligibleMappingIds: string[] = [];

  for (const mapping of validated.value.mappings) {
    declaredCounts[mapping.status] = (declaredCounts[mapping.status] ?? 0) + 1;
    const product = productByKey.get(
      providerProductKey(mapping.providerId, mapping.externalProductId),
    );
    const identity = identityById.get(mapping.catalogueComponentId);
    const component = componentById.get(mapping.catalogueComponentId);
    const effective = effectiveProviderMappingStatus(mapping, {
      ...(product === undefined ? {} : { product }),
      ...(identity === undefined ? {} : { catalogueIdentity: identity }),
    });

    if (effective === "verified") effectiveVerified += 1;
    if (effective === "needs-review") effectiveNeedsReview += 1;
    if (mapping.status === "verified" && effective !== "verified") {
      invalidatedReviews += 1;
      addIssue(
        "warning",
        "invalidated-review",
        "Declared verified mapping is no longer verified after review or evidence invalidation.",
        product ?? null,
        mapping,
      );
    }

    if (
      product !== undefined &&
      !isProviderMappingCurrentForProduct(mapping, product)
    ) {
      staleProviderMappings += 1;
      addIssue(
        "warning",
        "stale-provider-product",
        "Provider product identity changed after this mapping was generated.",
        product,
        mapping,
      );
    }
    if (
      identity !== undefined &&
      !mappingCatalogueEvidenceMatches(mapping, identity)
    ) {
      staleCatalogueMappings += 1;
      addIssue(
        "warning",
        "stale-catalogue-evidence",
        "Catalogue identity evidence changed after this mapping was generated.",
        product ?? null,
        mapping,
      );
    }

    const regionalMismatch =
      mapping.evidence.region === "mismatch" ||
      (product !== undefined &&
        identity !== undefined &&
        product.region !== null &&
        identity.region !== null &&
        product.region !== identity.region) ||
      (product !== undefined && mapping.region !== product.region);
    if (regionalMismatch) {
      regionalMismatchMappingIds.push(mapping.mappingId);
      addIssue(
        "warning",
        "regional-mismatch",
        "Provider region and catalogue region do not agree for this mapping.",
        product ?? null,
        mapping,
      );
    }

    if (component !== undefined && component.availability !== "in-production") {
      discontinuedTargetMappingIds.push(mapping.mappingId);
      addIssue(
        "warning",
        "discontinued-catalogue-target",
        `Catalogue component availability is ${component.availability}; this mapping is not eligible for pricing ingestion.`,
        product ?? null,
        mapping,
      );
    }

    if (product !== undefined && component !== undefined) {
      const eligibility = checkProviderMappingEligibility(
        mapping,
        product,
        component,
        {
          ...(options.allowSyntheticData === undefined
            ? {}
            : { allowSyntheticData: options.allowSyntheticData }),
          ...(identity === undefined ? {} : { catalogueIdentity: identity }),
        },
      );
      if (eligibility.eligible) eligibleMappingIds.push(mapping.mappingId);
    }
  }

  const uniqueness = auditProviderProductUniqueness(validated.value.products);
  const conflicts = auditProviderMappingConflicts(validated.value.mappings);

  const unmappedKeys: string[] = [];
  const ambiguousKeys: string[] = [];
  const missingIdentifierKeys: string[] = [];
  let ambiguousMatches = 0;

  for (const product of validated.value.products) {
    const key = providerProductKey(
      product.providerId,
      product.externalProductId,
    );
    const stored = mappingsByProduct.get(key) ?? [];

    if (stored.length === 0) {
      unmappedKeys.push(key);
      addIssue(
        "warning",
        "unmapped-provider-product",
        "Provider product has no mapping in the registry.",
        product,
        null,
      );
    }

    if (
      product.normalizedIdentifiers.manufacturerPartNumber === null &&
      product.normalizedIdentifiers.gtin === null &&
      product.normalizedIdentifiers.modelNumber === null
    ) {
      missingIdentifierKeys.push(key);
      addIssue(
        "warning",
        "missing-identifiers",
        "Provider product has no MPN, GTIN or model number; identity cannot be verified.",
        product,
        null,
      );
    }

    if (product.lifecycle === "discontinued") {
      addIssue(
        "warning",
        "discontinued-provider-product",
        "Provider product record is discontinued and is not eligible for pricing ingestion.",
        product,
        null,
      );
    }
    if (product.lifecycle === "superseded") {
      addIssue(
        "warning",
        "superseded-provider-product",
        "Provider product record is superseded; the successor record should be mapped instead.",
        product,
        null,
      );
    }
    if (product.supersedesExternalProductId !== null) {
      addIssue(
        "warning",
        "provider-identifier-change",
        `Provider changed external product id from ${product.supersedesExternalProductId} to ${product.externalProductId}.`,
        product,
        null,
      );
    }

    const match = matchProviderProduct(product, components, {
      ...(options.now === undefined ? {} : { now: options.now }),
      ...(options.identifierRegistry === undefined
        ? {}
        : { identifierRegistry: options.identifierRegistry }),
      ...(options.matcherVersion === undefined
        ? {}
        : { matcherVersion: options.matcherVersion }),
    });
    if (!match.ok) {
      addIssue(
        "error",
        "matching-failed",
        match.issues.map((entry) => entry.message).join(" "),
        product,
        null,
      );
      continue;
    }

    if (
      match.value.outcome === "needs-review" &&
      match.value.candidateComponentIds.length > 1
    ) {
      ambiguousMatches += 1;
      ambiguousKeys.push(key);
      addIssue(
        "warning",
        "ambiguous-match",
        `Multiple catalogue candidates remain: ${match.value.candidateComponentIds.join(", ")}.`,
        product,
        null,
      );
    }

    if (match.value.outcome === "rejected") {
      addIssue(
        "warning",
        "matching-conflict",
        match.value.reasons.join(" "),
        product,
        null,
      );
    }

    if (match.value.mapping !== null) {
      const expected = match.value.mapping;
      const matchingStored = stored.find(
        (mapping) =>
          mapping.catalogueComponentId === expected.catalogueComponentId &&
          mapping.method === expected.method,
      );
      if (matchingStored === undefined) {
        addIssue(
          "warning",
          "mapping-mismatch",
          `Deterministic matching expects a ${expected.status} mapping to ${expected.catalogueComponentId}, but the registry does not contain one.`,
          product,
          null,
        );
      } else {
        const statusCompatible =
          expected.status === "candidate"
            ? matchingStored.status === "candidate" ||
              matchingStored.status === "verified"
            : expected.status === "needs-review"
              ? matchingStored.status === "needs-review" ||
                matchingStored.status === "verified"
              : matchingStored.status === "rejected";
        if (!statusCompatible) {
          addIssue(
            "warning",
            "mapping-status-drift",
            `Deterministic matching expects status ${expected.status}, but the registry records ${matchingStored.status}.`,
            product,
            matchingStored,
          );
        }
      }
    }
  }

  for (const conflictKey of conflicts.componentVariantConflictKeys) {
    addIssue(
      "warning",
      "component-variant-conflict",
      `One catalogue component is associated with different provider variants in the same region: ${conflictKey}.`,
      null,
      null,
    );
  }

  issues.sort((left, right) => {
    const leftKey = `${left.code}\u0000${left.providerId ?? ""}\u0000${left.externalProductId ?? ""}\u0000${left.mappingId ?? ""}`;
    const rightKey = `${right.code}\u0000${right.providerId ?? ""}\u0000${right.externalProductId ?? ""}\u0000${right.mappingId ?? ""}`;
    return leftKey.localeCompare(rightKey);
  });

  return success({
    totalProviderProducts: validated.value.products.length,
    totalMappings: validated.value.mappings.length,
    verifiedMappings: declaredCounts.verified ?? 0,
    candidateMappings: declaredCounts.candidate ?? 0,
    needsReviewMappings: declaredCounts["needs-review"] ?? 0,
    rejectedMappings: declaredCounts.rejected ?? 0,
    effectiveVerifiedMappings: effectiveVerified,
    effectiveNeedsReviewMappings: effectiveNeedsReview,
    invalidatedReviewMappings: invalidatedReviews,
    duplicateExternalProductIds: uniqueness.duplicateExternalProductIds,
    duplicateExternalProductIdKeys:
      uniqueness.duplicateExternalProductIdKeys.map(readableKey),
    conflictingCatalogueAssociations:
      conflicts.sameExternalIdToDifferentComponents +
      conflicts.duplicateMappings,
    conflictingCatalogueAssociationKeys: sortUnique([
      ...conflicts.sameExternalIdConflictKeys,
      ...conflicts.duplicateMappingKeys,
    ]),
    componentVariantConflicts: conflicts.componentVariantConflicts,
    componentVariantConflictKeys: conflicts.componentVariantConflictKeys,
    regionalMismatches: sortUnique(regionalMismatchMappingIds).length,
    regionalMismatchMappingIds: sortUnique(regionalMismatchMappingIds),
    invalidIdentifiers: 0,
    missingIdentifierProducts: missingIdentifierKeys.length,
    missingIdentifierProductKeys: sortUnique(missingIdentifierKeys).map(
      readableKey,
    ),
    unmappedProviderProducts: unmappedKeys.length,
    unmappedProviderProductKeys: sortUnique(unmappedKeys).map(readableKey),
    ambiguousMatches,
    ambiguousProviderProductKeys: sortUnique(ambiguousKeys).map(readableKey),
    productIdentifierChanges: uniqueness.productIdentifierChanges,
    discontinuedProviderProducts: uniqueness.discontinuedProducts,
    supersededProviderProducts: uniqueness.supersededProducts,
    discontinuedCatalogueTargets: sortUnique(discontinuedTargetMappingIds)
      .length,
    discontinuedCatalogueTargetMappingIds: sortUnique(
      discontinuedTargetMappingIds,
    ),
    staleProviderProductMappings: staleProviderMappings,
    staleCatalogueMappings: staleCatalogueMappings,
    pricingEligibleMappings: sortUnique(eligibleMappingIds).length,
    pricingEligibleMappingIds: sortUnique(eligibleMappingIds),
    issues,
  });
}
