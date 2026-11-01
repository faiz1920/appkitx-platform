import { describe, expect, it } from "vitest";
import { catalogue, componentById } from "../src/lib/pc-builder/catalogue";
import { identifierRegistry } from "../src/lib/pc-builder/catalogue/identifiers";
import {
  auditProviderMappingConflicts,
  auditProviderMappingDataset,
  checkProviderMappingEligibility,
  computeProviderMappingFingerprint,
  effectiveProviderMappingStatus,
  isProviderMappingCurrentForProduct,
  isProviderMappingReviewCurrent,
  mappingCatalogueEvidenceMatches,
  validateProviderMappingDataset,
  validateProviderMappingRegistry,
  type ProviderProduct,
} from "../src/lib/pc-builder/provider-mapping";
import {
  SYNTHETIC_AUDIT_NOW,
  SYNTHETIC_MPN_COOLER,
  SYNTHETIC_MPN_CPU,
  syntheticConflictingMappingDataset,
  syntheticDuplicateProviderProductRegistry,
  syntheticInvalidGtinProduct,
  syntheticProviderMappingDataset,
  syntheticProviderMappings,
  syntheticProviderProducts,
  syntheticVariantConflictDataset,
} from "../src/dev/pc-builder/provider-mapping-fixtures";

const verifiedMapping = syntheticProviderMappings[0]!;
const candidateMapping = syntheticProviderMappings[1]!;
const needsReviewMapping = syntheticProviderMappings[2]!;
const rejectedMapping = syntheticProviderMappings[3]!;

function cloneProduct(
  product: ProviderProduct,
  overrides: Partial<ProviderProduct> = {},
): ProviderProduct {
  return { ...product, ...overrides };
}

describe("provider mapping registry and review policy", () => {
  it("validates the synthetic mapping dataset", () => {
    const result = validateProviderMappingDataset(
      syntheticProviderMappingDataset,
      catalogue,
      { now: SYNTHETIC_AUDIT_NOW, identifierRegistry },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.products).toHaveLength(12);
    expect(result.value.mappings).toHaveLength(9);
  });

  it("keeps automatic candidates separate from verified mappings", () => {
    expect(candidateMapping.status).toBe("candidate");
    expect(candidateMapping.review.status).toBe("not-reviewed");
    expect(verifiedMapping.status).toBe("verified");
    expect(verifiedMapping.review.status).toBe("approved");
    expect(verifiedMapping.review.reviewer).toBe("synthetic-m10-12-reviewer");
    expect(isProviderMappingReviewCurrent(verifiedMapping)).toBe(true);
  });

  it("rejects a candidate carrying an approved review", () => {
    const mislabeled = {
      ...candidateMapping,
      review: {
        ...verifiedMapping.review,
        sourceUrl: candidateMapping.evidence.providerProductUrl,
        evidenceFingerprint:
          computeProviderMappingFingerprint(candidateMapping),
      },
    };
    const result = validateProviderMappingRegistry(
      { schemaVersion: 1, mappings: [mislabeled] },
      catalogue,
      syntheticProviderProducts,
      { now: SYNTHETIC_AUDIT_NOW, identifierRegistry },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(
      result.issues.some(
        (entry) =>
          entry.path.includes("review") && entry.code === "identity-conflict",
      ),
    ).toBe(true);
  });

  it("rejects a verified mapping without an approved review", () => {
    const unapproved = {
      ...verifiedMapping,
      review: {
        status: "not-reviewed" as const,
        reviewer: null,
        reviewedAt: null,
        notes: null,
        sourceUrl: null,
        evidenceFingerprint: null,
        previousStatus: null,
      },
    };
    const result = validateProviderMappingRegistry(
      { schemaVersion: 1, mappings: [unapproved] },
      catalogue,
      syntheticProviderProducts,
      { now: SYNTHETIC_AUDIT_NOW, identifierRegistry },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(
      result.issues.some((entry) =>
        entry.message.includes("approved human review"),
      ),
    ).toBe(true);
  });

  it("rejects a process identity as reviewer", () => {
    const processReviewed = {
      ...verifiedMapping,
      review: {
        ...verifiedMapping.review,
        reviewer: "opencode-m10.12",
      },
    };
    const result = validateProviderMappingRegistry(
      { schemaVersion: 1, mappings: [processReviewed] },
      catalogue,
      syntheticProviderProducts,
      { now: SYNTHETIC_AUDIT_NOW, identifierRegistry },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(
      result.issues.some((entry) => entry.message.includes("named person")),
    ).toBe(true);
  });

  it("invalidates a review when mapping evidence changes", () => {
    const tampered = { ...verifiedMapping, confidence: 99 };
    expect(isProviderMappingReviewCurrent(tampered)).toBe(false);
    expect(effectiveProviderMappingStatus(tampered)).toBe("needs-review");
  });

  it("invalidates a review when the provider product identity changes", () => {
    const product = syntheticProviderProducts[0]!;
    const changed = cloneProduct(product, {
      normalizedIdentifiers: {
        ...product.normalizedIdentifiers,
        manufacturerPartNumber: "ACFRE99999A",
      },
    });
    expect(isProviderMappingCurrentForProduct(verifiedMapping, changed)).toBe(
      false,
    );
    expect(
      effectiveProviderMappingStatus(verifiedMapping, { product: changed }),
    ).toBe("needs-review");
  });

  it("detects catalogue identity drift", () => {
    const identity = {
      componentId: "cooler-arctic-freezer-36",
      category: "cooler" as const,
      manufacturer: "ARCTIC",
      name: "ARCTIC Freezer 36",
      model: "ACFRE00123A",
      manufacturerPartNumber: "DIFFERENT-MPN",
      gtin: null,
      region: null,
    };
    expect(mappingCatalogueEvidenceMatches(verifiedMapping, identity)).toBe(
      false,
    );
    expect(
      effectiveProviderMappingStatus(verifiedMapping, {
        catalogueIdentity: identity,
      }),
    ).toBe("needs-review");
  });

  it("never makes candidates, needs-review items or rejections pricing-eligible", () => {
    for (const mapping of [
      candidateMapping,
      needsReviewMapping,
      rejectedMapping,
    ]) {
      const product = syntheticProviderProducts.find(
        (entry) => entry.externalProductId === mapping.externalProductId,
      );
      const component = componentById(mapping.catalogueComponentId);
      if (!product || !component) throw new Error("Fixture lookup failed");
      const eligibility = checkProviderMappingEligibility(
        mapping,
        product,
        component,
        { allowSyntheticData: true },
      );
      expect(eligibility.eligible).toBe(false);
      expect(eligibility.reasons.length).toBeGreaterThan(0);
    }
  });

  it("only allows the synthetic verified fixture with the explicit override", () => {
    const product = syntheticProviderProducts[0]!;
    const component = componentById("cooler-arctic-freezer-36");
    if (!component) throw new Error("Missing fixture component");

    const production = checkProviderMappingEligibility(
      verifiedMapping,
      product,
      component,
    );
    expect(production.eligible).toBe(false);
    expect(production.reasons.join(" ")).toContain("Synthetic");

    const explicit = checkProviderMappingEligibility(
      verifiedMapping,
      product,
      component,
      { allowSyntheticData: true },
    );
    expect(explicit.eligible).toBe(true);
    expect(explicit.reasons).toEqual([]);
  });

  it("fails closed on duplicate mapping ids and duplicate mappings", () => {
    const result = validateProviderMappingRegistry(
      { schemaVersion: 1, mappings: [candidateMapping, candidateMapping] },
      catalogue,
      syntheticProviderProducts,
      { now: SYNTHETIC_AUDIT_NOW, identifierRegistry },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(
      result.issues.some((entry) => entry.code === "duplicate-identifier"),
    ).toBe(true);
  });

  it("fails closed when one external id maps to different components", () => {
    const result = validateProviderMappingRegistry(
      {
        schemaVersion: productionSchemaVersion(),
        mappings: syntheticConflictingMappingDataset.mappings,
      },
      catalogue,
      syntheticConflictingMappingDataset.products,
      { now: SYNTHETIC_AUDIT_NOW, identifierRegistry },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(
      result.issues.some((entry) =>
        entry.message.includes("different component"),
      ),
    ).toBe(true);
  });

  it("fails closed when one component has conflicting provider variants", () => {
    const result = validateProviderMappingRegistry(
      {
        schemaVersion: productionSchemaVersion(),
        mappings: syntheticVariantConflictDataset.mappings,
      },
      catalogue,
      syntheticVariantConflictDataset.products,
      { now: SYNTHETIC_AUDIT_NOW, identifierRegistry },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(
      result.issues.some((entry) =>
        entry.message.includes("different provider variant"),
      ),
    ).toBe(true);
  });

  it("reports conflict counts without rewriting mappings", () => {
    const external = auditProviderMappingConflicts(
      syntheticConflictingMappingDataset.mappings,
    );
    expect(external.sameExternalIdToDifferentComponents).toBe(1);

    const variants = auditProviderMappingConflicts(
      syntheticVariantConflictDataset.mappings,
    );
    expect(variants.componentVariantConflicts).toBe(1);
  });
});

describe("provider mapping audit", () => {
  it("reports the synthetic dataset quality and mapping states", () => {
    const result = auditProviderMappingDataset(
      catalogue,
      syntheticProviderMappingDataset,
      {
        now: SYNTHETIC_AUDIT_NOW,
        identifierRegistry,
      },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value).toMatchObject({
      totalProviderProducts: 12,
      totalMappings: 9,
      verifiedMappings: 1,
      candidateMappings: 5,
      needsReviewMappings: 1,
      rejectedMappings: 2,
      effectiveVerifiedMappings: 1,
      effectiveNeedsReviewMappings: 1,
      invalidatedReviewMappings: 0,
      duplicateExternalProductIds: 0,
      conflictingCatalogueAssociations: 0,
      componentVariantConflicts: 0,
      regionalMismatches: 1,
      invalidIdentifiers: 0,
      missingIdentifierProducts: 2,
      unmappedProviderProducts: 3,
      ambiguousMatches: 0,
      productIdentifierChanges: 1,
      discontinuedProviderProducts: 1,
      supersededProviderProducts: 1,
      discontinuedCatalogueTargets: 1,
      staleProviderProductMappings: 0,
      staleCatalogueMappings: 0,
      pricingEligibleMappings: 0,
    });
    expect(result.value.unmappedProviderProductKeys).toContain(
      "fixture-provider-m10-12:synthetic-amd-7800x3d-title",
    );
    expect(
      result.value.issues.some(
        (entry) => entry.code === "provider-identifier-change",
      ),
    ).toBe(true);
  });

  it("uses the explicit synthetic override to audit eligibility", () => {
    const result = auditProviderMappingDataset(
      catalogue,
      syntheticProviderMappingDataset,
      {
        now: SYNTHETIC_AUDIT_NOW,
        identifierRegistry,
        allowSyntheticData: true,
      },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.pricingEligibleMappings).toBe(1);
    expect(result.value.pricingEligibleMappingIds).toEqual([
      verifiedMapping.mappingId,
    ]);
  });

  it("reports ambiguous matches without selecting a candidate", () => {
    const base = componentById("cpu-amd-ryzen-7-7800x3d");
    if (!base) throw new Error("Missing base component");
    const componentA = {
      ...base,
      id: "cpu-synthetic-audit-ambiguous-a",
      model: "SYNTH-AUDIT-AMBIGUOUS",
    };
    const componentB = {
      ...base,
      id: "cpu-synthetic-audit-ambiguous-b",
      model: "SYNTH-AUDIT-AMBIGUOUS",
    };
    const product = syntheticProviderProducts[2]!;
    const ambiguousProduct = cloneProduct(product, {
      identifiers: {
        ...product.identifiers,
        modelNumber: "SYNTH-AUDIT-AMBIGUOUS",
      },
      normalizedIdentifiers: {
        ...product.normalizedIdentifiers,
        modelNumber: "SYNTH-AUDIT-AMBIGUOUS",
      },
    });

    const result = auditProviderMappingDataset(
      [componentA, componentB],
      { schemaVersion: 1, products: [ambiguousProduct], mappings: [] },
      { now: SYNTHETIC_AUDIT_NOW },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.unmappedProviderProducts).toBe(1);
    expect(result.value.ambiguousMatches).toBe(1);
    expect(result.value.ambiguousProviderProductKeys).toEqual([
      `fixture-provider-m10-12:${ambiguousProduct.externalProductId}`,
    ]);
  });

  it("returns actionable validation issues for duplicate external ids", () => {
    const result = auditProviderMappingDataset(
      catalogue,
      syntheticDuplicateProviderProductRegistry,
      { now: SYNTHETIC_AUDIT_NOW, identifierRegistry },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(
      result.issues.some(
        (entry) =>
          entry.code === "duplicate-identifier" &&
          entry.path.includes("externalProductId"),
      ),
    ).toBe(true);
  });

  it("returns actionable validation issues for invalid identifiers", () => {
    const result = auditProviderMappingDataset(
      catalogue,
      {
        schemaVersion: 1,
        products: [syntheticInvalidGtinProduct],
        mappings: [],
      },
      { now: SYNTHETIC_AUDIT_NOW, identifierRegistry },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(
      result.issues.some(
        (entry) =>
          entry.path.includes("gtin") && entry.code === "invalid-value",
      ),
    ).toBe(true);
  });

  it("keeps the verified fixture's review fingerprint stable", () => {
    expect(verifiedMapping.review.evidenceFingerprint).toBe(
      computeProviderMappingFingerprint(verifiedMapping),
    );
    expect(verifiedMapping.evidence.providerManufacturerPartNumber).toBe(
      SYNTHETIC_MPN_COOLER,
    );
    expect(
      syntheticProviderProducts.some(
        (product) =>
          product.normalizedIdentifiers.manufacturerPartNumber ===
          SYNTHETIC_MPN_CPU,
      ),
    ).toBe(true);
  });
});

function productionSchemaVersion(): 1 {
  return 1 as const;
}
