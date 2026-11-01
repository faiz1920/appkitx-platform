import { describe, expect, it } from "vitest";
import {
  auditProviderProductIdentifiers,
  computeProviderProductFingerprint,
  validateProviderAdapterIdentity,
  validateProviderPaginationContract,
  validateProviderProduct,
  validateProviderProductRegistry,
} from "../src/lib/pc-builder/provider-mapping";
import {
  SYNTHETIC_AUDIT_NOW,
  SYNTHETIC_INVALID_GTIN,
  SYNTHETIC_PROVIDER_ID,
  syntheticDuplicateProviderProductRegistry,
  syntheticInvalidGtinProduct,
  syntheticProviderProducts,
} from "../src/dev/pc-builder/provider-mapping-fixtures";

describe("provider product contract", () => {
  it("normalizes identifiers while preserving the provider originals", () => {
    const product = syntheticProviderProducts[0]!;
    expect(product.identifiers.manufacturerPartNumber).toBe("acfre00123a");
    expect(product.normalizedIdentifiers.manufacturerPartNumber).toBe(
      "ACFRE00123A",
    );
    expect(product.identifiers.providerSku).toBeNull();
    expect(product.provenance.dataOrigin).toBe("synthetic");
    expect(product.provenance.collectionMethod).toBe("fixture");
  });

  it("keeps unknown manufacturer, category, region and variant as null", () => {
    const product = syntheticProviderProducts[6]!;
    expect(product.manufacturer).toBeNull();
    expect(product.category).toBeNull();
    expect(product.region).toBeNull();
    expect(product.variant).toBeNull();
    expect(product.normalizedIdentifiers.manufacturerPartNumber).toBeNull();
    expect(product.normalizedIdentifiers.gtin).toBeNull();
    expect(product.normalizedIdentifiers.modelNumber).toBeNull();
  });

  it("never treats a retailer SKU as an MPN or model", () => {
    const product = syntheticProviderProducts[3]!;
    expect(product.identifiers.providerSku).toBe("SYNTHETIC-RETAILER-SKU-ONLY");
    expect(product.normalizedIdentifiers.manufacturerPartNumber).toBeNull();
    expect(product.normalizedIdentifiers.modelNumber).toBeNull();
    expect(product.normalizedIdentifiers.gtin).toBeNull();
  });

  it("rejects an invalid GTIN check digit", () => {
    const result = validateProviderProduct(syntheticInvalidGtinProduct, {
      now: SYNTHETIC_AUDIT_NOW,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(
      result.issues.some(
        (entry) =>
          entry.path === "product.identifiers.gtin" &&
          entry.code === "invalid-value",
      ),
    ).toBe(true);
    expect(SYNTHETIC_INVALID_GTIN).toBe("1234");
  });

  it("validates the fixture registry including a supersession chain", () => {
    const result = validateProviderProductRegistry(
      {
        schemaVersion: 1,
        products: syntheticProviderProducts,
      },
      { now: SYNTHETIC_AUDIT_NOW },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.products).toHaveLength(12);
  });

  it("fails closed on duplicate provider product ids", () => {
    const result = validateProviderProductRegistry(
      syntheticDuplicateProviderProductRegistry,
      { now: SYNTHETIC_AUDIT_NOW },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(
      result.issues.some((entry) => entry.code === "duplicate-identifier"),
    ).toBe(true);
  });

  it("requires a superseded record to be marked superseded", () => {
    const oldProduct = syntheticProviderProducts[7]!;
    const successor = syntheticProviderProducts[8]!;
    const activeOld = { ...oldProduct, lifecycle: "active" as const };
    const result = validateProviderProductRegistry(
      {
        schemaVersion: 1,
        products: [activeOld, successor],
      },
      { now: SYNTHETIC_AUDIT_NOW },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(
      result.issues.some(
        (entry) =>
          entry.path.includes("supersedesExternalProductId") &&
          entry.code === "identity-conflict",
      ),
    ).toBe(true);
  });

  it("detects a supersession cycle", () => {
    const oldProduct = syntheticProviderProducts[7]!;
    const successor = syntheticProviderProducts[8]!;
    const cycleOld = {
      ...oldProduct,
      lifecycle: "superseded" as const,
      supersedesExternalProductId: successor.externalProductId,
    };
    const cycleNew = {
      ...successor,
      lifecycle: "superseded" as const,
      supersedesExternalProductId: oldProduct.externalProductId,
    };
    const result = validateProviderProductRegistry(
      {
        schemaVersion: 1,
        products: [cycleOld, cycleNew],
      },
      { now: SYNTHETIC_AUDIT_NOW },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.some((entry) => entry.message.includes("cycle"))).toBe(
      true,
    );
  });

  it("fingerprints identity fields but not the display title", () => {
    const product = syntheticProviderProducts[0]!;
    const renamed = { ...product, title: "Renamed synthetic title" };
    expect(computeProviderProductFingerprint(renamed)).toBe(
      computeProviderProductFingerprint(product),
    );

    const changedMpn = {
      ...product,
      normalizedIdentifiers: {
        ...product.normalizedIdentifiers,
        manufacturerPartNumber: "ACFRE99999A",
      },
    };
    expect(computeProviderProductFingerprint(changedMpn)).not.toBe(
      computeProviderProductFingerprint(product),
    );
  });

  it("reports identifier coverage without inventing identifiers", () => {
    const coverage = auditProviderProductIdentifiers(syntheticProviderProducts);
    expect(coverage.totalProducts).toBe(12);
    expect(coverage.withManufacturer).toBe(11);
    expect(coverage.withManufacturerPartNumber).toBe(8);
    expect(coverage.withGtin).toBe(1);
    expect(coverage.withoutExactIdentifier).toBe(2);
    expect(coverage.providerSkuOnly).toBe(1);
  });

  it("validates provider adapter metadata without any network client", () => {
    const identity = validateProviderAdapterIdentity({
      providerId: SYNTHETIC_PROVIDER_ID,
      displayName: "Synthetic Adapter",
      supportedMarketIds: ["us", "in"],
      supportedCountryCodes: ["US", "IN"],
      dataOrigin: "synthetic",
      adapterVersion: "0.0.0-fixture",
    });
    expect(identity.ok).toBe(true);
    if (identity.ok) {
      expect(identity.value.providerId).toBe(SYNTHETIC_PROVIDER_ID);
      expect(identity.value.supportedCountryCodes).toEqual(["US", "IN"]);
    }

    const pagination = validateProviderPaginationContract({
      strategy: "cursor",
      pageSizeLimit: 100,
      cursorField: "nextCursor",
      supportsTotalCount: false,
    });
    expect(pagination.ok).toBe(true);
    if (pagination.ok) {
      expect(pagination.value.strategy).toBe("cursor");
    }
  });

  it("rejects an adapter with invalid market or country metadata", () => {
    const result = validateProviderAdapterIdentity({
      providerId: "Synthetic-Provider",
      displayName: "",
      supportedMarketIds: ["US Market"],
      supportedCountryCodes: ["USA"],
      dataOrigin: "synthetic",
      adapterVersion: "",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.length).toBeGreaterThanOrEqual(4);
  });
});
