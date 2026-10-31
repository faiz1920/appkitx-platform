import { describe, expect, it } from "vitest";
import { catalogue, componentById } from "../src/lib/pc-builder/catalogue";
import { identifierRegistry } from "../src/lib/pc-builder/catalogue/identifiers";
import {
  auditIdentifierRegistry,
  buildCatalogueIdentities,
  matchProductWithRegistry,
  validateIdentifierRegistry,
  type CatalogueIdentifierRecord,
  type CatalogueIdentifierRegistry,
  type ProviderProductRecord,
} from "../src/lib/pc-builder/pricing";

const AUDIT_NOW = "2026-10-31T23:59:59.000Z";

function firstRecord(): CatalogueIdentifierRecord {
  const record = identifierRegistry.records[0];
  if (!record) throw new Error("Registry fixture is missing its first record");
  return record;
}

function withRecords(
  records: readonly CatalogueIdentifierRecord[],
): CatalogueIdentifierRegistry {
  return { schemaVersion: 1, records };
}

function sourceRecord(
  componentId: string,
  overrides: Partial<CatalogueIdentifierRecord> = {},
): CatalogueIdentifierRecord {
  const component = componentById(componentId);
  if (!component) throw new Error(`Unknown fixture component: ${componentId}`);
  return {
    ...firstRecord(),
    componentId: component.id,
    manufacturer: component.manufacturer,
    model: component.model,
    manufacturerPartNumber: null,
    gtin: null,
    region: null,
    ...overrides,
  };
}

function providerProduct(
  overrides: Partial<ProviderProductRecord> = {},
): ProviderProductRecord {
  return {
    providerProductId: "synthetic-provider-product",
    title: "Synthetic provider listing",
    manufacturer: "Corsair",
    manufacturerPartNumber: null,
    modelNumber: null,
    gtin: null,
    category: "ram",
    productUrl: "https://retailer.example/products/identity",
    region: null,
    ...overrides,
  };
}

describe("source-verified identity registry", () => {
  it("validates the source-verified registry and reports exact coverage", () => {
    const validated = validateIdentifierRegistry(
      identifierRegistry,
      catalogue,
      {
        now: AUDIT_NOW,
      },
    );
    expect(validated.ok).toBe(true);

    const audit = auditIdentifierRegistry(catalogue, identifierRegistry, {
      now: AUDIT_NOW,
    });
    expect(audit.ok).toBe(true);
    if (!audit.ok) return;

    expect(audit.value).toMatchObject({
      totalComponents: 101,
      totalRecords: 24,
      sourceVerifiedRecords: 24,
      provisionalRecords: 0,
      humanReviewedRecords: 0,
      awaitingHumanReviewRecords: 24,
      staleSourceVerificationRecords: 0,
      staleHumanReviewRecords: 0,
      mpnRecords: 20,
      gtinRecords: 8,
      bothRecords: 4,
      sourceVerifiedComponents: 24,
      sourceVerifiedMpn: 20,
      sourceVerifiedGtin: 8,
      both: 4,
      withoutSourceVerified: 77,
    });
    expect(audit.value.catalogue).toMatchObject({
      total: 101,
      verifiedMatchReady: 24,
      explicitMpn: 20,
      explicitGtin: 4,
      modelMpnShaped: 42,
      modelDescriptive: 35,
      duplicateModels: [],
    });

    const ram = audit.value.byCategory.find(
      (entry) => entry.category === "ram",
    );
    expect(ram).toMatchObject({
      total: 10,
      sourceVerifiedComponents: 7,
      sourceVerifiedMpn: 7,
      sourceVerifiedGtin: 0,
      both: 0,
      withoutSourceVerified: 3,
      humanReviewedComponents: 0,
    });
    const cooler = audit.value.byCategory.find(
      (entry) => entry.category === "cooler",
    );
    expect(cooler).toMatchObject({
      total: 11,
      sourceVerifiedComponents: 7,
      sourceVerifiedMpn: 6,
      sourceVerifiedGtin: 3,
      both: 2,
      withoutSourceVerified: 4,
      humanReviewedComponents: 0,
    });
    const caseFan = audit.value.byCategory.find(
      (entry) => entry.category === "case-fan",
    );
    expect(caseFan).toMatchObject({
      total: 7,
      sourceVerifiedComponents: 6,
      sourceVerifiedMpn: 3,
      sourceVerifiedGtin: 5,
      both: 2,
      withoutSourceVerified: 1,
      humanReviewedComponents: 0,
    });
  });

  it("projects only source-verified records and preserves model-only components", () => {
    const withoutRegistry = buildCatalogueIdentities(catalogue);
    expect(withoutRegistry.ok).toBe(true);
    if (!withoutRegistry.ok) return;
    expect(
      withoutRegistry.value.filter(
        (identity) => identity.manufacturerPartNumber !== null,
      ),
    ).toHaveLength(0);
    expect(
      withoutRegistry.value.filter((identity) => identity.gtin !== null),
    ).toHaveLength(0);

    const withRegistry = buildCatalogueIdentities(
      catalogue,
      identifierRegistry,
    );
    expect(withRegistry.ok).toBe(true);
    if (!withRegistry.ok) return;
    expect(
      withRegistry.value.filter(
        (identity) => identity.manufacturerPartNumber !== null,
      ),
    ).toHaveLength(20);
    expect(
      withRegistry.value.filter((identity) => identity.gtin !== null),
    ).toHaveLength(8);
    expect(
      withRegistry.value.find(
        (identity) => identity.componentId === "cpu-amd-ryzen-7-7800x3d",
      )?.manufacturerPartNumber,
    ).toBeNull();
  });
});

describe("registry validation", () => {
  it("normalizes MPN and GTIN evidence", () => {
    const result = validateIdentifierRegistry(
      withRecords([
        sourceRecord("cooler-arctic-freezer-36", {
          manufacturerPartNumber: " acfre00123a ",
          gtin: "489 5213 704144",
        }),
      ]),
      catalogue,
      { now: AUDIT_NOW },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.records[0]?.manufacturerPartNumber).toBe("ACFRE00123A");
    expect(result.value.records[0]?.gtin).toBe("4895213704144");
  });

  it("rejects a missing component, invalid id and mismatched identity", () => {
    const missing = validateIdentifierRegistry(
      withRecords([
        sourceRecord("ram-corsair-vengeance-32gb-ddr5-6000", {
          componentId: "cpu-does-not-exist",
        }),
      ]),
      catalogue,
      { now: AUDIT_NOW },
    );
    expect(missing.ok).toBe(false);

    const invalidId = validateIdentifierRegistry(
      withRecords([
        sourceRecord("ram-corsair-vengeance-32gb-ddr5-6000", {
          componentId: "invalid id",
        }),
      ]),
      catalogue,
      { now: AUDIT_NOW },
    );
    expect(invalidId.ok).toBe(false);

    const manufacturerMismatch = validateIdentifierRegistry(
      withRecords([
        sourceRecord("ram-corsair-vengeance-32gb-ddr5-6000", {
          manufacturer: "Wrong manufacturer",
          manufacturerPartNumber: "CMK32GX5M2B6000C30",
        }),
      ]),
      catalogue,
      { now: AUDIT_NOW },
    );
    expect(manufacturerMismatch.ok).toBe(false);

    const modelMismatch = validateIdentifierRegistry(
      withRecords([
        sourceRecord("ram-corsair-vengeance-32gb-ddr5-6000", {
          model: "Wrong model",
          manufacturerPartNumber: "CMK32GX5M2B6000C30",
        }),
      ]),
      catalogue,
      { now: AUDIT_NOW },
    );
    expect(modelMismatch.ok).toBe(false);
  });

  it("rejects invalid provenance, source verification and human review metadata", () => {
    const base = sourceRecord("ram-corsair-vengeance-32gb-ddr5-6000", {
      manufacturerPartNumber: "CMK32GX5M2B6000C30",
    });

    const missingSource = validateIdentifierRegistry(
      withRecords([{ ...base, source: undefined as never }]),
      catalogue,
      { now: AUDIT_NOW },
    );
    expect(missingSource.ok).toBe(false);

    const invalidUrl = validateIdentifierRegistry(
      withRecords([
        {
          ...base,
          source: { ...base.source, url: "http://corsair.com/product" },
        },
      ]),
      catalogue,
      { now: AUDIT_NOW },
    );
    expect(invalidUrl.ok).toBe(false);

    const invalidSourceStatus = validateIdentifierRegistry(
      withRecords([
        {
          ...base,
          sourceVerification: {
            ...base.sourceVerification,
            status: "approved" as never,
          },
        },
      ]),
      catalogue,
      { now: AUDIT_NOW },
    );
    expect(invalidSourceStatus.ok).toBe(false);

    const missingSourceVerifier = validateIdentifierRegistry(
      withRecords([
        {
          ...base,
          sourceVerification: { ...base.sourceVerification, verifiedBy: "" },
        },
      ]),
      catalogue,
      { now: AUDIT_NOW },
    );
    expect(missingSourceVerifier.ok).toBe(false);

    const futureSourceVerification = validateIdentifierRegistry(
      withRecords([base]),
      catalogue,
      { now: "2026-10-31T16:00:00.000Z" },
    );
    expect(futureSourceVerification.ok).toBe(false);

    const reviewedWithoutReviewer = validateIdentifierRegistry(
      withRecords([
        {
          ...base,
          humanReview: {
            status: "reviewed",
            reviewer: "",
            reviewedAt: "2026-10-31T16:55:00.000Z",
            notes: null,
          },
        },
      ]),
      catalogue,
      { now: AUDIT_NOW },
    );
    expect(reviewedWithoutReviewer.ok).toBe(false);

    const reviewedWithoutDate = validateIdentifierRegistry(
      withRecords([
        {
          ...base,
          humanReview: {
            status: "reviewed",
            reviewer: "test-human-reviewer",
            reviewedAt: null,
            notes: null,
          },
        },
      ]),
      catalogue,
      { now: AUDIT_NOW },
    );
    expect(reviewedWithoutDate.ok).toBe(false);

    const notReviewedWithReviewer = validateIdentifierRegistry(
      withRecords([
        {
          ...base,
          humanReview: {
            status: "not-reviewed",
            reviewer: "test-human-reviewer",
            reviewedAt: null,
            notes: null,
          },
        },
      ]),
      catalogue,
      { now: AUDIT_NOW },
    );
    expect(notReviewedWithReviewer.ok).toBe(false);

    const reviewBeforeSourceVerification = validateIdentifierRegistry(
      withRecords([
        {
          ...base,
          source: {
            ...base.source,
            accessedAt: "2026-10-31T17:00:00.000Z",
          },
          sourceVerification: {
            ...base.sourceVerification,
            verifiedAt: "2026-10-31T17:05:00.000Z",
          },
          humanReview: {
            status: "reviewed",
            reviewer: "test-human-reviewer",
            reviewedAt: "2026-10-31T17:04:00.000Z",
            notes: null,
          },
        },
      ]),
      catalogue,
      { now: AUDIT_NOW },
    );
    expect(reviewBeforeSourceVerification.ok).toBe(false);

    const reviewed = validateIdentifierRegistry(
      withRecords([
        {
          ...base,
          humanReview: {
            status: "reviewed",
            reviewer: "test-human-reviewer",
            reviewedAt: "2026-10-31T16:55:00.000Z",
            notes: "Focused test-only human review.",
          },
        },
      ]),
      catalogue,
      { now: AUDIT_NOW },
    );
    expect(reviewed.ok).toBe(true);
    if (reviewed.ok) {
      expect(reviewed.value.records[0]?.humanReview).toEqual({
        status: "reviewed",
        reviewer: "test-human-reviewer",
        reviewedAt: "2026-10-31T16:55:00.000Z",
        notes: "Focused test-only human review.",
      });
    }
  });

  it("rejects invalid regions, schema versions and empty identifiers", () => {
    const base = sourceRecord("ram-corsair-vengeance-32gb-ddr5-6000", {
      manufacturerPartNumber: "CMK32GX5M2B6000C30",
    });

    expect(
      validateIdentifierRegistry(
        withRecords([{ ...base, region: "EU" }]),
        catalogue,
        { now: AUDIT_NOW },
      ).ok,
    ).toBe(false);
    expect(
      validateIdentifierRegistry(
        { schemaVersion: 2, records: [base] } as unknown,
        catalogue,
        { now: AUDIT_NOW },
      ).ok,
    ).toBe(false);
    expect(
      validateIdentifierRegistry(
        withRecords([
          {
            ...base,
            manufacturerPartNumber: null,
            gtin: null,
          },
        ]),
        catalogue,
        { now: AUDIT_NOW },
      ).ok,
    ).toBe(false);
  });

  it("rejects duplicate MPNs and duplicate GTINs", () => {
    const duplicateMpn = validateIdentifierRegistry(
      withRecords([
        sourceRecord("ram-corsair-vengeance-32gb-ddr5-6000", {
          manufacturerPartNumber: "CMK32GX5M2B6000C30",
        }),
        sourceRecord("ram-corsair-vengeance-lpx-16gb-ddr4-3200", {
          manufacturerPartNumber: "CMK32GX5M2B6000C30",
        }),
      ]),
      catalogue,
      { now: AUDIT_NOW },
    );
    expect(duplicateMpn.ok).toBe(false);

    const duplicateGtin = validateIdentifierRegistry(
      withRecords([
        sourceRecord("cooler-arctic-freezer-36", {
          manufacturerPartNumber: "ACFRE00123A",
          gtin: "4895213704144",
        }),
        sourceRecord("cooler-arctic-liquid-freezer-iii-280", {
          manufacturerPartNumber: "ACFRE00135A",
          gtin: "4895213704144",
        }),
      ]),
      catalogue,
      { now: AUDIT_NOW },
    );
    expect(duplicateGtin.ok).toBe(false);

    const invalidGtin = validateIdentifierRegistry(
      withRecords([
        sourceRecord("cooler-arctic-freezer-36", {
          manufacturerPartNumber: "ACFRE00123A",
          gtin: "4895213704145",
        }),
      ]),
      catalogue,
      { now: AUDIT_NOW },
    );
    expect(invalidGtin.ok).toBe(false);

    const invalidLength = validateIdentifierRegistry(
      withRecords([
        sourceRecord("cooler-arctic-freezer-36", {
          manufacturerPartNumber: "ACFRE00123A",
          gtin: "123456",
        }),
      ]),
      catalogue,
      { now: AUDIT_NOW },
    );
    expect(invalidLength.ok).toBe(false);
  });
});

describe("registry matching integration", () => {
  it("verifies an exact MPN from the registry", () => {
    const match = matchProductWithRegistry(
      providerProduct({
        manufacturer: "Corsair",
        manufacturerPartNumber: "CMK32GX5M2B6000C30",
        category: "ram",
      }),
      catalogue,
      identifierRegistry,
    );
    expect(match.ok).toBe(true);
    if (!match.ok) return;
    expect(match.value.status).toBe("verified");
    expect(match.value.componentId).toBe(
      "ram-corsair-vengeance-32gb-ddr5-6000",
    );
  });

  it("verifies an exact GTIN from the registry", () => {
    const match = matchProductWithRegistry(
      providerProduct({
        manufacturer: "Noctua",
        gtin: "9010018100396",
        category: "case-fan",
        title: "Noctua NF-A12x25 PWM",
      }),
      catalogue,
      identifierRegistry,
    );
    expect(match.ok).toBe(true);
    if (!match.ok) return;
    expect(match.value.status).toBe("verified");
    expect(match.value.componentId).toBe("case-fan-noctua-nf-a12x25-pwm");
  });

  it("keeps model-only matching probable and title-only matching unverified", () => {
    const modelOnly = matchProductWithRegistry(
      providerProduct({
        manufacturer: "AMD",
        modelNumber: "100-100000910WOF",
        category: "cpu",
        title: "AMD Ryzen 7 7800X3D",
      }),
      catalogue,
      identifierRegistry,
    );
    expect(modelOnly.ok).toBe(true);
    if (modelOnly.ok) expect(modelOnly.value.status).toBe("probable");

    const titleOnly = matchProductWithRegistry(
      providerProduct({
        manufacturer: "AMD",
        category: "cpu",
        title: "AMD Ryzen 7 7800X3D",
      }),
      catalogue,
      identifierRegistry,
    );
    expect(titleOnly.ok).toBe(true);
    if (titleOnly.ok) {
      expect(titleOnly.value.status).toBe("unverified");
      expect(titleOnly.value.componentId).toBeNull();
    }
  });

  it("never promotes provisional evidence", () => {
    const record = sourceRecord("ram-corsair-vengeance-32gb-ddr5-6000", {
      manufacturerPartNumber: "CMK32GX5M2B6000C30",
      sourceVerification: {
        ...firstRecord().sourceVerification,
        status: "provisional",
      },
    });
    const registry = withRecords([record]);
    const identities = buildCatalogueIdentities(catalogue, registry);
    expect(identities.ok).toBe(true);
    if (!identities.ok) return;
    expect(
      identities.value.find(
        (identity) => identity.componentId === record.componentId,
      )?.manufacturerPartNumber,
    ).toBeNull();

    const match = matchProductWithRegistry(
      providerProduct({
        manufacturer: "Corsair",
        manufacturerPartNumber: "CMK32GX5M2B6000C30",
        category: "ram",
      }),
      catalogue,
      registry,
    );
    expect(match.ok).toBe(true);
    if (!match.ok) return;
    expect(match.value.status).not.toBe("verified");
    expect(match.value.status).toBe("probable");
  });

  it("does not let human review promote a provisional source record", () => {
    const record = sourceRecord("ram-corsair-vengeance-32gb-ddr5-6000", {
      manufacturerPartNumber: "CMK32GX5M2B6000C30",
      sourceVerification: {
        ...firstRecord().sourceVerification,
        status: "provisional",
      },
      humanReview: {
        status: "reviewed",
        reviewer: "test-human-reviewer",
        reviewedAt: "2026-10-31T16:55:00.000Z",
        notes: "Test-only human review.",
      },
    });
    const registry = withRecords([record]);
    const identities = buildCatalogueIdentities(catalogue, registry);
    expect(identities.ok).toBe(true);
    if (!identities.ok) return;
    expect(
      identities.value.find(
        (identity) => identity.componentId === record.componentId,
      )?.manufacturerPartNumber,
    ).toBeNull();

    const match = matchProductWithRegistry(
      providerProduct({
        manufacturer: "Corsair",
        manufacturerPartNumber: "CMK32GX5M2B6000C30",
        category: "ram",
      }),
      catalogue,
      registry,
    );
    expect(match.ok).toBe(true);
    if (!match.ok) return;
    expect(match.value.status).toBe("probable");
  });

  it("rejects a regional conflict when the registry declares a region", () => {
    const record = sourceRecord("ram-corsair-vengeance-32gb-ddr5-6000", {
      manufacturerPartNumber: "CMK32GX5M2B6000C30",
      region: "IN",
    });
    const match = matchProductWithRegistry(
      providerProduct({
        manufacturer: "Corsair",
        manufacturerPartNumber: "CMK32GX5M2B6000C30",
        category: "ram",
        region: "US",
      }),
      catalogue,
      withRecords([record]),
    );
    expect(match.ok).toBe(true);
    if (!match.ok) return;
    expect(match.value.status).toBe("rejected");
    expect(match.value.componentId).toBeNull();
  });

  it("preserves existing behaviour when no registry is supplied", () => {
    const match = matchProductWithRegistry(
      providerProduct({
        manufacturer: "AMD",
        modelNumber: "100-100000910WOF",
        category: "cpu",
        title: "AMD Ryzen 7 7800X3D",
      }),
      catalogue,
    );
    expect(match.ok).toBe(true);
    if (match.ok) expect(match.value.status).toBe("probable");
  });
});

describe("registry audit reporting", () => {
  it("reports provisional and stale source verification without promoting", () => {
    const first = firstRecord();
    const provisional = {
      ...first,
      sourceVerification: {
        ...first.sourceVerification,
        status: "provisional" as const,
      },
    };
    const staleBase = sourceRecord("ram-corsair-vengeance-lpx-16gb-ddr4-3200", {
      manufacturerPartNumber: "CMK16GX4M2B3200C16",
    });
    const stale = {
      ...staleBase,
      source: {
        ...staleBase.source,
        accessedAt: "2025-01-01T00:00:00.000Z",
      },
      sourceVerification: {
        ...staleBase.sourceVerification,
        verifiedAt: "2025-01-02T00:00:00.000Z",
      },
    };
    const audit = auditIdentifierRegistry(
      catalogue,
      withRecords([provisional, stale]),
      { now: AUDIT_NOW },
    );
    expect(audit.ok).toBe(true);
    if (!audit.ok) return;
    expect(audit.value.sourceVerifiedRecords).toBe(1);
    expect(audit.value.provisionalRecords).toBe(1);
    expect(audit.value.humanReviewedRecords).toBe(0);
    expect(audit.value.awaitingHumanReviewRecords).toBe(2);
    expect(audit.value.staleSourceVerificationRecords).toBe(1);
    expect(audit.value.staleHumanReviewRecords).toBe(0);
    expect(audit.value.provisionalComponentIds).toEqual([
      "ram-corsair-vengeance-32gb-ddr5-6000",
    ]);
    expect(audit.value.staleSourceVerificationComponentIds).toEqual([
      "ram-corsair-vengeance-lpx-16gb-ddr4-3200",
    ]);
    expect(audit.value.sourceVerifiedComponents).toBe(1);
    expect(audit.value.catalogue.verifiedMatchReady).toBe(1);
  });

  it("distinguishes source verification from human review", () => {
    const record = sourceRecord("ram-corsair-vengeance-32gb-ddr5-6000", {
      manufacturerPartNumber: "CMK32GX5M2B6000C30",
      humanReview: {
        status: "reviewed",
        reviewer: "test-human-reviewer",
        reviewedAt: "2026-10-31T16:55:00.000Z",
        notes: "Test-only human review.",
      },
    });
    const registry = withRecords([record]);
    const audit = auditIdentifierRegistry(catalogue, registry, {
      now: AUDIT_NOW,
    });
    expect(audit.ok).toBe(true);
    if (!audit.ok) return;
    expect(audit.value.sourceVerifiedRecords).toBe(1);
    expect(audit.value.humanReviewedRecords).toBe(1);
    expect(audit.value.awaitingHumanReviewRecords).toBe(0);
    expect(audit.value.sourceVerifiedComponents).toBe(1);
    expect(audit.value.humanReviewedComponentIds).toEqual([
      "ram-corsair-vengeance-32gb-ddr5-6000",
    ]);

    const match = matchProductWithRegistry(
      providerProduct({
        manufacturer: "Corsair",
        manufacturerPartNumber: "CMK32GX5M2B6000C30",
        category: "ram",
      }),
      catalogue,
      registry,
    );
    expect(match.ok).toBe(true);
    if (!match.ok) return;
    expect(match.value.status).toBe("verified");
  });

  it("reports stale source verification and stale human review independently", () => {
    const base = sourceRecord("ram-corsair-vengeance-32gb-ddr5-6000", {
      manufacturerPartNumber: "CMK32GX5M2B6000C30",
    });
    const record = {
      ...base,
      source: {
        ...base.source,
        accessedAt: "2025-01-01T00:00:00.000Z",
      },
      sourceVerification: {
        ...base.sourceVerification,
        verifiedAt: "2025-01-02T00:00:00.000Z",
      },
      humanReview: {
        status: "reviewed" as const,
        reviewer: "test-human-reviewer",
        reviewedAt: "2025-01-03T00:00:00.000Z",
        notes: null,
      },
    };
    const audit = auditIdentifierRegistry(catalogue, withRecords([record]), {
      now: AUDIT_NOW,
    });
    expect(audit.ok).toBe(true);
    if (!audit.ok) return;
    expect(audit.value.staleSourceVerificationRecords).toBe(1);
    expect(audit.value.staleHumanReviewRecords).toBe(1);
    expect(audit.value.staleSourceVerificationComponentIds).toEqual([
      "ram-corsair-vengeance-32gb-ddr5-6000",
    ]);
    expect(audit.value.staleHumanReviewComponentIds).toEqual([
      "ram-corsair-vengeance-32gb-ddr5-6000",
    ]);
  });

  it("fails closed instead of reporting a partially valid registry", () => {
    const invalid = withRecords([
      sourceRecord("ram-corsair-vengeance-32gb-ddr5-6000", {
        manufacturerPartNumber: "CMK32GX5M2B6000C30",
      }),
      sourceRecord("ram-corsair-vengeance-lpx-16gb-ddr4-3200", {
        manufacturerPartNumber: "CMK32GX5M2B6000C30",
      }),
    ]);
    const audit = auditIdentifierRegistry(catalogue, invalid, {
      now: AUDIT_NOW,
    });
    expect(audit.ok).toBe(false);
  });
});
