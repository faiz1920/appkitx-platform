import { describe, expect, it } from "vitest";
import { catalogue, componentById } from "../src/lib/pc-builder/catalogue";
import { identifierRegistry } from "../src/lib/pc-builder/catalogue/identifiers";
import {
  auditIdentifierRegistry,
  auditIdentifierUniqueness,
  buildCatalogueIdentities,
  buildIdentityReviewQueue,
  computeIdentityFingerprint,
  effectiveHumanReviewStatus,
  HUMAN_REVIEW_REQUIRED_FOR_PRODUCTION,
  isHumanReviewCurrent,
  matchProductWithRegistry,
  validateIdentifierRegistry,
  type CatalogueIdentifierRecord,
  type CatalogueIdentifierRegistry,
  type HumanReview,
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

function reviewedRecord(
  record: CatalogueIdentifierRecord,
  overrides: Partial<HumanReview> = {},
): CatalogueIdentifierRecord {
  return {
    ...record,
    humanReview: {
      status: "reviewed",
      reviewer: "test-human-reviewer",
      reviewedAt: "2026-10-31T16:55:00.000Z",
      notes: "Focused test-only human review.",
      sourceUrl: record.source.url,
      evidenceFingerprint: computeIdentityFingerprint(record),
      previousStatus: "not-reviewed",
      ...overrides,
    },
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
      totalRecords: 50,
      sourceVerifiedRecords: 50,
      provisionalRecords: 0,
      humanReviewedRecords: 0,
      awaitingHumanReviewRecords: 50,
      staleSourceVerificationRecords: 0,
      staleHumanReviewRecords: 0,
      mpnRecords: 46,
      gtinRecords: 9,
      bothRecords: 5,
      sourceVerifiedComponents: 50,
      sourceVerifiedMpn: 46,
      sourceVerifiedGtin: 9,
      both: 5,
      withoutSourceVerified: 51,
    });
    expect(audit.value.catalogue).toMatchObject({
      total: 101,
      verifiedMatchReady: 50,
      explicitMpn: 46,
      explicitGtin: 4,
      modelMpnShaped: 16,
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
    const cpu = audit.value.byCategory.find(
      (entry) => entry.category === "cpu",
    );
    expect(cpu).toMatchObject({
      total: 16,
      sourceVerifiedComponents: 14,
      sourceVerifiedMpn: 14,
      sourceVerifiedGtin: 0,
      both: 0,
      withoutSourceVerified: 2,
      humanReviewedComponents: 0,
    });
    const psu = audit.value.byCategory.find(
      (entry) => entry.category === "psu",
    );
    expect(psu).toMatchObject({
      total: 9,
      sourceVerifiedComponents: 6,
      sourceVerifiedMpn: 6,
      sourceVerifiedGtin: 0,
      both: 0,
      withoutSourceVerified: 3,
      humanReviewedComponents: 0,
    });
    const pcCase = audit.value.byCategory.find(
      (entry) => entry.category === "case",
    );
    expect(pcCase).toMatchObject({
      total: 11,
      sourceVerifiedComponents: 6,
      sourceVerifiedMpn: 6,
      sourceVerifiedGtin: 1,
      both: 1,
      withoutSourceVerified: 5,
      humanReviewedComponents: 0,
    });
    const gpu = audit.value.byCategory.find(
      (entry) => entry.category === "gpu",
    );
    expect(gpu).toMatchObject({
      total: 15,
      sourceVerifiedComponents: 0,
      withoutSourceVerified: 15,
    });
    const motherboard = audit.value.byCategory.find(
      (entry) => entry.category === "motherboard",
    );
    expect(motherboard).toMatchObject({
      total: 13,
      sourceVerifiedComponents: 0,
      withoutSourceVerified: 13,
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
    ).toHaveLength(46);
    expect(
      withRegistry.value.filter((identity) => identity.gtin !== null),
    ).toHaveLength(9);
    expect(
      withRegistry.value.find(
        (identity) => identity.componentId === "cpu-amd-ryzen-7-7800x3d",
      )?.manufacturerPartNumber,
    ).toBe("100-100000910WOF");
    expect(
      withRegistry.value.find(
        (identity) => identity.componentId === "cpu-amd-ryzen-7-5800x3d",
      )?.manufacturerPartNumber,
    ).toBeNull();
  });

  it("covers the M10.10 target categories without promoting deferred variants", () => {
    const identities = buildCatalogueIdentities(catalogue, identifierRegistry);
    expect(identities.ok).toBe(true);
    if (!identities.ok) return;

    const byId = new Map(
      identities.value.map((identity) => [identity.componentId, identity]),
    );
    expect(byId.get("cpu-intel-core-i5-12400f")).toMatchObject({
      manufacturerPartNumber: "BX8071512400F",
      gtin: null,
      region: null,
    });
    expect(byId.get("cpu-amd-ryzen-5-5600")).toMatchObject({
      manufacturerPartNumber: "100-100000927BOX",
    });
    expect(byId.get("psu-corsair-cv650")).toMatchObject({
      manufacturerPartNumber: "CP-9020211-NA",
      region: "US",
    });
    expect(byId.get("case-nzxt-h7-flow")).toMatchObject({
      manufacturerPartNumber: "CM-H72FB-01",
      gtin: "5056547205502",
    });

    // Deferred: AMD boxed IDs differ from the catalogue model, and no
    // authoritative GPU or motherboard identifier was retrievable.
    for (const componentId of [
      "cpu-amd-ryzen-7-5800x3d",
      "cpu-amd-ryzen-7-7700",
      "gpu-nvidia-geforce-rtx-4090-fe",
      "motherboard-asus-tuf-gaming-b550-plus",
    ]) {
      expect(byId.get(componentId)?.manufacturerPartNumber).toBeNull();
      expect(byId.get(componentId)?.gtin).toBeNull();
    }
  });

  it("matches new CPU, PSU and case identities only with exact evidence", () => {
    const cpu = matchProductWithRegistry(
      providerProduct({
        manufacturer: "AMD",
        manufacturerPartNumber: "100-100000910WOF",
        category: "cpu",
      }),
      catalogue,
      identifierRegistry,
    );
    expect(cpu.ok).toBe(true);
    if (!cpu.ok) return;
    expect(cpu.value.status).toBe("verified");
    expect(cpu.value.componentId).toBe("cpu-amd-ryzen-7-7800x3d");

    const psu = matchProductWithRegistry(
      providerProduct({
        manufacturer: "Corsair",
        manufacturerPartNumber: "CP-9020199-NA",
        category: "psu",
        region: "US",
      }),
      catalogue,
      identifierRegistry,
    );
    expect(psu.ok).toBe(true);
    if (!psu.ok) return;
    expect(psu.value.status).toBe("verified");
    expect(psu.value.componentId).toBe("psu-corsair-rm750x-2021");

    const pcCase = matchProductWithRegistry(
      providerProduct({
        manufacturer: "NZXT",
        gtin: "5056547205502",
        category: "case",
      }),
      catalogue,
      identifierRegistry,
    );
    expect(pcCase.ok).toBe(true);
    if (!pcCase.ok) return;
    expect(pcCase.value.status).toBe("verified");
    expect(pcCase.value.componentId).toBe("case-nzxt-h7-flow");

    const deferred = matchProductWithRegistry(
      providerProduct({
        manufacturer: "AMD",
        manufacturerPartNumber: "100-100000651WOF",
        category: "cpu",
      }),
      catalogue,
      identifierRegistry,
    );
    expect(deferred.ok).toBe(true);
    if (!deferred.ok) return;
    expect(deferred.value.status).not.toBe("verified");
  });

  it("rejects a regional PSU match from a different region", () => {
    const match = matchProductWithRegistry(
      providerProduct({
        manufacturer: "Corsair",
        manufacturerPartNumber: "CP-9020199-NA",
        category: "psu",
        region: "DE",
      }),
      catalogue,
      identifierRegistry,
    );
    expect(match.ok).toBe(true);
    if (!match.ok) return;
    expect(match.value.status).not.toBe("verified");
    expect(match.value.reasons).toContain(
      "The exact part number belongs to a different regional SKU.",
    );
  });

  it("rejects duplicate MPNs and GTINs from the expanded registry", () => {
    const cpu = identifierRegistry.records.find(
      (record) => record.componentId === "cpu-amd-ryzen-7-7800x3d",
    );
    const h7Flow = identifierRegistry.records.find(
      (record) => record.componentId === "case-nzxt-h7-flow",
    );
    if (!cpu || !h7Flow) throw new Error("Expected M10.10 fixtures");

    const duplicateMpn = validateIdentifierRegistry(
      withRecords([
        cpu,
        sourceRecord("cpu-amd-ryzen-9-7900x", {
          manufacturerPartNumber: "100-100000910WOF",
        }),
      ]),
      catalogue,
      { now: AUDIT_NOW },
    );
    expect(duplicateMpn.ok).toBe(false);
    if (!duplicateMpn.ok) {
      expect(duplicateMpn.issues).toContainEqual(
        expect.objectContaining({
          path: "records[1].manufacturerPartNumber",
          code: "duplicate-identifier",
        }),
      );
    }

    const duplicateGtin = validateIdentifierRegistry(
      withRecords([
        h7Flow,
        sourceRecord("case-corsair-4000d-airflow", {
          gtin: "5056547205502",
        }),
      ]),
      catalogue,
      { now: AUDIT_NOW },
    );
    expect(duplicateGtin.ok).toBe(false);
    if (!duplicateGtin.ok) {
      expect(duplicateGtin.issues).toContainEqual(
        expect.objectContaining({
          path: "records[1].gtin",
          code: "duplicate-identifier",
        }),
      );
    }
  });

  it("rejects a conflicting manufacturer or model association", () => {
    const wrongManufacturer = validateIdentifierRegistry(
      withRecords([
        sourceRecord("cpu-intel-core-i5-12400f", {
          manufacturer: "AMD",
          manufacturerPartNumber: "BX8071512400F",
        }),
      ]),
      catalogue,
      { now: AUDIT_NOW },
    );
    expect(wrongManufacturer.ok).toBe(false);
    if (!wrongManufacturer.ok) {
      expect(wrongManufacturer.issues).toContainEqual(
        expect.objectContaining({
          path: "records[0].manufacturer",
          code: "identity-conflict",
        }),
      );
    }

    const wrongModel = validateIdentifierRegistry(
      withRecords([
        sourceRecord("cpu-intel-core-i5-12400f", {
          model: "BX8071512400",
          manufacturerPartNumber: "BX8071512400F",
        }),
      ]),
      catalogue,
      { now: AUDIT_NOW },
    );
    expect(wrongModel.ok).toBe(false);
    if (!wrongModel.ok) {
      expect(wrongModel.issues).toContainEqual(
        expect.objectContaining({
          path: "records[0].model",
          code: "identity-conflict",
        }),
      );
    }
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
      withRecords([reviewedRecord(base, { reviewer: "" })]),
      catalogue,
      { now: AUDIT_NOW },
    );
    expect(reviewedWithoutReviewer.ok).toBe(false);

    const reviewedWithoutDate = validateIdentifierRegistry(
      withRecords([reviewedRecord(base, { reviewedAt: null })]),
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

    const sourceMoved = {
      ...base,
      source: {
        ...base.source,
        accessedAt: "2026-10-31T17:00:00.000Z",
      },
      sourceVerification: {
        ...base.sourceVerification,
        verifiedAt: "2026-10-31T17:05:00.000Z",
      },
    };
    const reviewBeforeSourceVerification = validateIdentifierRegistry(
      withRecords([
        reviewedRecord(sourceMoved, { reviewedAt: "2026-10-31T17:04:00.000Z" }),
      ]),
      catalogue,
      { now: AUDIT_NOW },
    );
    expect(reviewBeforeSourceVerification.ok).toBe(false);

    const reviewed = validateIdentifierRegistry(
      withRecords([reviewedRecord(base)]),
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
        sourceUrl: base.source.url,
        evidenceFingerprint: computeIdentityFingerprint(base),
        previousStatus: "not-reviewed",
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
    const record = reviewedRecord(
      sourceRecord("ram-corsair-vengeance-32gb-ddr5-6000", {
        manufacturerPartNumber: "CMK32GX5M2B6000C30",
        sourceVerification: {
          ...firstRecord().sourceVerification,
          status: "provisional",
        },
      }),
    );
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
    const record = reviewedRecord(
      sourceRecord("ram-corsair-vengeance-32gb-ddr5-6000", {
        manufacturerPartNumber: "CMK32GX5M2B6000C30",
      }),
    );
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
    const oldEvidence = {
      ...base,
      source: {
        ...base.source,
        accessedAt: "2025-01-01T00:00:00.000Z",
      },
      sourceVerification: {
        ...base.sourceVerification,
        verifiedAt: "2025-01-02T00:00:00.000Z",
      },
    };
    const record = reviewedRecord(oldEvidence, {
      reviewedAt: "2025-01-03T00:00:00.000Z",
    });
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

describe("human review state model", () => {
  const base = () =>
    sourceRecord("ram-corsair-vengeance-32gb-ddr5-6000", {
      manufacturerPartNumber: "CMK32GX5M2B6000C30",
    });

  const allStatuses = [
    "not-reviewed",
    "reviewed",
    "needs-correction",
    "rejected",
    "needs-revalidation",
  ] as const;

  it("accepts all five states with the required metadata", () => {
    for (const status of allStatuses) {
      const record =
        status === "not-reviewed" ? base() : reviewedRecord(base(), { status });
      const result = validateIdentifierRegistry(
        withRecords([record]),
        catalogue,
        {
          now: AUDIT_NOW,
        },
      );
      expect(result.ok, status).toBe(true);
    }
  });

  it("rejects invalid review combinations", () => {
    const cases = [
      reviewedRecord(base(), { evidenceFingerprint: null }),
      reviewedRecord(base(), { status: "needs-correction", notes: "" }),
      reviewedRecord(base(), {
        status: "rejected",
        previousStatus: "rejected",
      }),
      reviewedRecord(base(), {
        reviewer: base().sourceVerification.verifiedBy,
      }),
      reviewedRecord(base(), {
        sourceUrl: "https://www.corsair.com/us/en/p/memory/other",
      }),
      {
        ...base(),
        humanReview: {
          status: "not-reviewed" as const,
          reviewer: null,
          reviewedAt: null,
          notes: null,
          evidenceFingerprint: computeIdentityFingerprint(base()),
        },
      },
    ];

    for (const record of cases) {
      const result = validateIdentifierRegistry(
        withRecords([record]),
        catalogue,
        {
          now: AUDIT_NOW,
        },
      );
      expect(result.ok).toBe(false);
    }
  });

  it("invalidates a review when fingerprinted evidence changes", () => {
    const record = reviewedRecord(base());
    expect(isHumanReviewCurrent(record)).toBe(true);
    expect(effectiveHumanReviewStatus(record)).toBe("reviewed");

    const movedSource = "https://www.corsair.com/us/en/p/memory/other";
    const mutations = [
      { ...record, manufacturerPartNumber: "CMK32GX5M2B6000C31" },
      { ...record, gtin: "9010018100396" },
      { ...record, region: "US" },
      {
        ...record,
        source: { ...record.source, url: movedSource },
        humanReview: { ...record.humanReview, sourceUrl: movedSource },
      },
      {
        ...record,
        source: {
          ...record.source,
          accessedAt: "2026-10-31T16:53:35.000Z",
        },
      },
    ];

    for (const mutated of mutations) {
      expect(isHumanReviewCurrent(mutated)).toBe(false);
      expect(effectiveHumanReviewStatus(mutated)).toBe("needs-revalidation");
      const validated = validateIdentifierRegistry(
        withRecords([mutated]),
        catalogue,
        { now: AUDIT_NOW },
      );
      expect(validated.ok).toBe(true);
    }

    const audit = auditIdentifierRegistry(
      catalogue,
      withRecords([mutations[0]!]),
      { now: AUDIT_NOW },
    );
    expect(audit.ok).toBe(true);
    if (!audit.ok) return;
    expect(audit.value.humanReviewedRecords).toBe(0);
    expect(audit.value.needsRevalidationRecords).toBe(1);
    expect(audit.value.invalidatedReviewRecords).toBe(1);
    expect(audit.value.invalidatedReviewComponentIds).toEqual([
      "ram-corsair-vengeance-32gb-ddr5-6000",
    ]);
  });

  it("does not invalidate review for formatting-only changes", () => {
    const record = reviewedRecord(base());
    const changed = {
      ...record,
      source: { ...record.source, name: "Renamed source" },
      sourceVerification: {
        ...record.sourceVerification,
        notes: "Updated process note.",
      },
      humanReview: {
        ...record.humanReview,
        notes: "Updated review note.",
      },
    };

    expect(computeIdentityFingerprint(changed)).toBe(
      record.humanReview.evidenceFingerprint,
    );
    expect(isHumanReviewCurrent(changed)).toBe(true);
  });

  it("does not change matching eligibility for any review state", () => {
    for (const status of allStatuses) {
      const record =
        status === "not-reviewed" ? base() : reviewedRecord(base(), { status });
      const match = matchProductWithRegistry(
        providerProduct({
          manufacturer: "Corsair",
          manufacturerPartNumber: "CMK32GX5M2B6000C30",
          category: "ram",
        }),
        catalogue,
        withRecords([record]),
      );
      expect(match.ok).toBe(true);
      if (!match.ok) return;
      expect(match.value.status, status).toBe("verified");
      expect(match.value.componentId).toBe(
        "ram-corsair-vengeance-32gb-ddr5-6000",
      );
    }
    expect(HUMAN_REVIEW_REQUIRED_FOR_PRODUCTION).toBe(false);
  });

  it("keeps matching stable under identity mutations", () => {
    const baseline = matchProductWithRegistry(
      providerProduct({
        manufacturer: "Corsair",
        manufacturerPartNumber: "CMK32GX5M2B6000C30",
        category: "ram",
      }),
      catalogue,
      identifierRegistry,
    );
    expect(baseline.ok).toBe(true);
    if (!baseline.ok) return;
    expect(baseline.value.status).toBe("verified");
    expect(baseline.value.confidence).toBe(100);

    const oneCharacterMpn = matchProductWithRegistry(
      providerProduct({
        manufacturer: "Corsair",
        manufacturerPartNumber: "CMK32GX5M2B6000C31",
        category: "ram",
      }),
      catalogue,
      identifierRegistry,
    );
    expect(oneCharacterMpn.ok).toBe(true);
    if (oneCharacterMpn.ok) {
      expect(oneCharacterMpn.value.status).not.toBe("verified");
    }

    const wrongManufacturer = matchProductWithRegistry(
      providerProduct({
        manufacturer: "Intel",
        manufacturerPartNumber: "CMK32GX5M2B6000C30",
        category: "ram",
      }),
      catalogue,
      identifierRegistry,
    );
    expect(wrongManufacturer.ok).toBe(true);
    if (wrongManufacturer.ok) {
      expect(wrongManufacturer.value.status).not.toBe("verified");
    }

    // Exact MPN plus manufacturer is category-independent; exact GTIN keeps
    // the pre-existing category-agnostic fallback. Neither behaviour changes
    // in M10.11.
    const missingCategoryMpn = matchProductWithRegistry(
      providerProduct({
        manufacturer: "Corsair",
        manufacturerPartNumber: "CMK32GX5M2B6000C30",
        category: undefined as never,
      }),
      catalogue,
      identifierRegistry,
    );
    expect(missingCategoryMpn.ok).toBe(true);
    if (missingCategoryMpn.ok) {
      expect(missingCategoryMpn.value.status).toBe("verified");
      expect(missingCategoryMpn.value.confidence).toBe(100);
    }

    const missingCategoryGtin = matchProductWithRegistry(
      providerProduct({
        manufacturer: "NZXT",
        gtin: "5056547205502",
        category: undefined as never,
      }),
      catalogue,
      identifierRegistry,
    );
    expect(missingCategoryGtin.ok).toBe(true);
    if (missingCategoryGtin.ok) {
      expect(missingCategoryGtin.value.status).toBe("verified");
      expect(missingCategoryGtin.value.confidence).toBe(97);
    }
  });

  it("reports every review state and invalidated reviews in the audit", () => {
    const entries = [
      sourceRecord("cpu-amd-ryzen-5-5600", {
        manufacturerPartNumber: "STATE-MPN-1",
      }),
      reviewedRecord(
        sourceRecord("cpu-amd-ryzen-7-5700x", {
          manufacturerPartNumber: "STATE-MPN-2",
        }),
      ),
      reviewedRecord(
        sourceRecord("cpu-amd-ryzen-7-5800x3d", {
          manufacturerPartNumber: "STATE-MPN-3",
        }),
        { status: "needs-correction" },
      ),
      reviewedRecord(
        sourceRecord("cpu-amd-ryzen-9-5950x", {
          manufacturerPartNumber: "STATE-MPN-4",
        }),
        { status: "rejected" },
      ),
      reviewedRecord(
        sourceRecord("cpu-amd-ryzen-5-7600", {
          manufacturerPartNumber: "STATE-MPN-5",
        }),
        { status: "needs-revalidation" },
      ),
      {
        ...reviewedRecord(
          sourceRecord("cpu-amd-ryzen-7-7700", {
            manufacturerPartNumber: "STATE-MPN-6",
          }),
        ),
        manufacturerPartNumber: "STATE-MPN-6-CHANGED",
      },
    ];

    const audit = auditIdentifierRegistry(catalogue, withRecords(entries), {
      now: AUDIT_NOW,
    });
    expect(audit.ok).toBe(true);
    if (!audit.ok) return;
    expect(audit.value.humanReviewedRecords).toBe(1);
    expect(audit.value.awaitingHumanReviewRecords).toBe(1);
    expect(audit.value.needsCorrectionRecords).toBe(1);
    expect(audit.value.rejectedRecords).toBe(1);
    expect(audit.value.needsRevalidationRecords).toBe(2);
    expect(audit.value.invalidatedReviewRecords).toBe(1);
    expect(audit.value.duplicateMpnRecords).toBe(0);
    expect(audit.value.duplicateGtinRecords).toBe(0);
    expect(audit.value.conflictingComponentRecords).toBe(0);
    expect(audit.value.humanReviewedComponentIds).toEqual([
      "cpu-amd-ryzen-7-5700x",
    ]);
    expect(audit.value.needsRevalidationComponentIds).toEqual([
      "cpu-amd-ryzen-5-7600",
      "cpu-amd-ryzen-7-7700",
    ]);
  });
});

describe("identity review queue and uniqueness", () => {
  it("queues all 50 source-verified identities in priority order", () => {
    const queue = buildIdentityReviewQueue(catalogue, identifierRegistry, {
      now: AUDIT_NOW,
    });
    expect(queue.ok).toBe(true);
    if (!queue.ok) return;

    expect(queue.value.total).toBe(50);
    expect(queue.value.byStatus).toEqual([
      { status: "not-reviewed", total: 50 },
    ]);
    expect(
      queue.value.entries.every(
        (entry) =>
          entry.humanReviewStatus === "not-reviewed" &&
          entry.declaredHumanReviewStatus === "not-reviewed" &&
          entry.reviewCurrent,
      ),
    ).toBe(true);

    const categories = queue.value.entries.map((entry) => entry.category);
    const firstIndex = (category: (typeof categories)[number]) =>
      categories.indexOf(category);
    expect(firstIndex("cpu")).toBe(0);
    expect(firstIndex("psu")).toBeGreaterThan(firstIndex("cpu"));
    expect(firstIndex("case")).toBeGreaterThan(firstIndex("psu"));
    expect(firstIndex("ram")).toBeGreaterThan(firstIndex("case"));
    expect(firstIndex("cooler")).toBeGreaterThan(firstIndex("ram"));
    expect(firstIndex("storage")).toBeGreaterThan(firstIndex("cooler"));
    expect(firstIndex("case-fan")).toBeGreaterThan(firstIndex("storage"));
    expect(categories).not.toContain("gpu");
    expect(categories).not.toContain("motherboard");

    const cpu = queue.value.entries.find(
      (entry) => entry.componentId === "cpu-amd-ryzen-5-5600",
    );
    expect(cpu?.concerns).toContain("No GTIN evidence.");
    expect(cpu?.sourceUrl).toBe(
      "https://www.amd.com/en/products/specifications/processors.html",
    );

    const psu = queue.value.entries.find(
      (entry) => entry.componentId === "psu-corsair-cv650",
    );
    expect(psu?.concerns).toContain("Regional identity limited to US.");
  });

  it("counts duplicate MPNs, GTINs and component conflicts", () => {
    const first = sourceRecord("cpu-amd-ryzen-5-5600", {
      manufacturerPartNumber: "DUP-MPN-1",
    });
    const duplicateMpn = sourceRecord("cpu-amd-ryzen-7-5700x", {
      manufacturerPartNumber: "DUP-MPN-1",
    });
    const duplicateGtinFirst = sourceRecord("cpu-amd-ryzen-5-7600", {
      manufacturerPartNumber: null,
      gtin: "5056547205502",
    });
    const duplicateGtin = sourceRecord("cpu-amd-ryzen-7-7800x3d", {
      manufacturerPartNumber: null,
      gtin: "5056547205502",
    });
    const duplicateComponent = {
      ...first,
      manufacturerPartNumber: "DUP-MPN-2",
    };

    const uniqueness = auditIdentifierUniqueness([
      first,
      duplicateMpn,
      duplicateGtinFirst,
      duplicateGtin,
      duplicateComponent,
    ]);
    expect(uniqueness.duplicateMpnRecords).toBe(1);
    expect(uniqueness.duplicateGtinRecords).toBe(1);
    expect(uniqueness.conflictingComponentRecords).toBe(1);
    expect(uniqueness.duplicateMpnComponentIds).toEqual([
      "cpu-amd-ryzen-7-5700x",
    ]);
    expect(uniqueness.duplicateGtinComponentIds).toEqual([
      "cpu-amd-ryzen-7-7800x3d",
    ]);
    expect(uniqueness.conflictingComponentIds).toEqual([
      "cpu-amd-ryzen-5-5600",
    ]);
  });
});
