import { describe, expect, it } from "vitest";
import {
  DEFAULT_FRESHNESS_POLICY,
  applyOfferRefresh,
  assessFreshness,
  availabilitySatisfiesFilter,
  effectiveAvailability,
  normalizeAvailability,
  normalizeOffer,
  offerCost,
  validateFreshnessPolicy,
} from "../src/lib/pc-builder/pricing";
import {
  SYNTHETIC_NOW,
  SYNTHETIC_NOW_DATE,
  rawOffer,
  normalizeContext,
  syntheticMarketplaceSeller,
  syntheticOffer,
} from "./pc-builder-pricing-fixtures";

const HOUR = 3_600_000;

describe("offer normalization", () => {
  it("normalizes a complete synthetic record and preserves provenance", async () => {
    const result = normalizeOffer(rawOffer(), normalizeContext());
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value).toMatchObject({
      id: "fixture-provider:offer-1",
      componentId: "cpu-amd-ryzen-7-7800x3d",
      sellerId: "synthetic-retail",
      marketplaceId: null,
      marketId: "us",
      countryCode: "US",
      discountPercent: 12.5,
      taxInclusion: "included",
      provenance: {
        providerId: "fixture-provider",
        providerOfferId: "offer-1",
        providerProductId: "product-1",
        observedAt: SYNTHETIC_NOW,
        dataOrigin: "synthetic",
        matchStatus: "verified",
      },
    });
    expect(result.value.price).toEqual({
      amountMinor: 34_999,
      currency: "USD",
    });
    expect(result.value.listPrice?.amountMinor).toBe(39_999);
    expect(result.value.discount?.amountMinor).toBe(5_000);
    expect(result.value.availability).toEqual({
      state: "in-stock",
      observedAt: SYNTHETIC_NOW,
    });
  });

  it("keeps a marketplace seller separate from its marketplace", async () => {
    const result = normalizeOffer(
      rawOffer(),
      normalizeContext({ seller: syntheticMarketplaceSeller() }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.sellerId).toBe("synthetic-marketplace-seller");
    expect(result.value.marketplaceId).toBe("synthetic-marketplace");
  });

  it("retains unknown optional fields as unknown/null", async () => {
    const result = normalizeOffer(
      rawOffer({
        listAmount: null,
        shippingAmount: null,
        taxInclusion: null,
        taxAmount: null,
        availability: null,
        availabilityObservedAt: null,
        lastVerifiedAt: null,
        providerUpdatedAt: null,
        collectionMethod: null,
        restrictions: null,
      }),
      normalizeContext(),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.listPrice).toBeNull();
    expect(result.value.discount).toBeNull();
    expect(result.value.discountPercent).toBeNull();
    expect(result.value.shipping).toBeNull();
    expect(result.value.taxInclusion).toBe("unknown");
    expect(result.value.taxAmount).toBeNull();
    expect(result.value.availability).toEqual({
      state: "unknown",
      observedAt: null,
    });
    expect(result.value.provenance.lastVerifiedAt).toBeNull();
    expect(result.value.provenance.providerUpdatedAt).toBeNull();
    expect(result.value.provenance.collectionMethod).toBe("unknown");
    expect(result.value.restrictions).toEqual([]);
  });

  it("rejects malformed prices, currencies and discounts", async () => {
    const cases = [
      rawOffer({ amount: "not-a-price" }),
      rawOffer({ amount: "19.999" }),
      rawOffer({ amount: "-1.00" }),
      rawOffer({ currency: "EUR" }),
      rawOffer({ currency: "ZZZ" }),
      rawOffer({ listAmount: "300.00" }),
      rawOffer({ listAmount: "0" }),
      rawOffer({ shippingAmount: "-1.00" }),
      rawOffer({ taxAmount: "abc" }),
    ];
    for (const raw of cases) {
      const result = normalizeOffer(raw, normalizeContext());
      expect(result.ok).toBe(false);
    }
  });

  it("rejects unsafe URLs and malformed timestamps", async () => {
    const cases = [
      rawOffer({ productUrl: "javascript:alert(1)" }),
      rawOffer({ productUrl: "http://retailer.example/product" }),
      rawOffer({ productUrl: "https://user:pass@retailer.example/product" }),
      rawOffer({ observedAt: "2026-10-31" }),
      rawOffer({ availabilityObservedAt: "not-a-timestamp" }),
      rawOffer({ lastVerifiedAt: "2026-10-31T13:00:00.000Z" }),
      rawOffer({ providerUpdatedAt: "2026-10-31T13:00:00.000Z" }),
      rawOffer({ availabilityObservedAt: "2026-10-31T13:00:00.000Z" }),
    ];
    for (const raw of cases) {
      const result = normalizeOffer(raw, normalizeContext());
      expect(result.ok).toBe(false);
    }
  });

  it("rejects malformed availability, tax status and restrictions", async () => {
    const cases = [
      rawOffer({ availability: "maybe" }),
      rawOffer({ taxInclusion: "maybe" }),
      rawOffer({ restrictions: [{ countryCodes: ["EU"], note: "test" }] }),
      rawOffer({ restrictions: [{ countryCodes: [], note: "test" }] }),
    ];
    for (const raw of cases) {
      const result = normalizeOffer(raw, normalizeContext());
      expect(result.ok).toBe(false);
    }
  });

  it("enforces market, country and seller coverage", async () => {
    const marketMismatch = normalizeOffer(
      rawOffer({ marketId: "in", countryCode: "IN" }),
      normalizeContext(),
    );
    expect(marketMismatch.ok).toBe(false);

    const sellerMismatch = normalizeOffer(
      rawOffer({
        marketId: "in",
        countryCode: "IN",
        currency: "INR",
        amount: "29999",
      }),
      normalizeContext({
        market: {
          id: "in",
          countryCode: "IN",
          name: "India",
          defaultCurrency: "INR",
          displayLocale: "en-IN",
          supportedCurrencies: ["INR"],
        },
        seller: {
          ...syntheticMarketplaceSeller(),
          marketIds: ["us"],
          countryCodes: ["US"],
        },
      }),
    );
    expect(sellerMismatch.ok).toBe(false);
  });

  it("requires a verified or probable match and matching data origins", async () => {
    const unverified = normalizeOffer(
      rawOffer(),
      normalizeContext({
        match: {
          status: "unverified",
          componentId: null,
          confidence: 0,
          reasons: [],
          evidence: {
            manufacturer: true,
            manufacturerPartNumber: false,
            gtin: false,
            modelNumber: false,
            titleSimilarity: 1,
          },
        },
      }),
    );
    expect(unverified.ok).toBe(false);

    const originMismatch = normalizeOffer(
      rawOffer(),
      normalizeContext({ dataOrigin: "provider" }),
    );
    expect(originMismatch.ok).toBe(false);
  });
});

describe("offer refresh safety", () => {
  it("replaces a previous offer only with valid data for the same id", async () => {
    const first = normalizeOffer(rawOffer(), normalizeContext());
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const refreshed = applyOfferRefresh(
      first.value,
      rawOffer({ amount: "329.99", listAmount: "399.99" }),
      normalizeContext(),
    );
    expect(refreshed.replaced).toBe(true);
    expect(refreshed.offer?.price.amountMinor).toBe(32_999);
    expect(refreshed.issues).toEqual([]);
  });

  it("retains the previous offer when a refresh is malformed", async () => {
    const first = normalizeOffer(rawOffer(), normalizeContext());
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const refreshed = applyOfferRefresh(
      first.value,
      rawOffer({ amount: "not-a-price" }),
      normalizeContext(),
    );
    expect(refreshed.replaced).toBe(false);
    expect(refreshed.offer?.price.amountMinor).toBe(34_999);
    expect(refreshed.issues.length).toBeGreaterThan(0);
  });

  it("refuses a refresh for a different offer id", async () => {
    const first = normalizeOffer(rawOffer(), normalizeContext());
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const refreshed = applyOfferRefresh(
      first.value,
      rawOffer({ providerOfferId: "offer-2" }),
      normalizeContext(),
    );
    expect(refreshed.replaced).toBe(false);
    expect(refreshed.offer?.id).toBe(first.value.id);
  });
});

describe("offer cost completeness", () => {
  it("calculates a complete total only when shipping and tax are known", () => {
    expect(offerCost(syntheticOffer()).total?.amountMinor).toBe(34_999);

    const withShipping = offerCost(
      syntheticOffer({ shipping: syntheticOffer().price }),
    );
    expect(withShipping.total?.amountMinor).toBe(69_998);

    const unknownShipping = offerCost(syntheticOffer({ shipping: null }));
    expect(unknownShipping.total).toBeNull();
    expect(unknownShipping.incompleteReasons.join(" ")).toContain("Shipping");

    const unknownTax = offerCost(
      syntheticOffer({ taxInclusion: "excluded", taxAmount: null }),
    );
    expect(unknownTax.total).toBeNull();
    expect(unknownTax.incompleteReasons.join(" ")).toContain("tax");

    const knownTax = offerCost(
      syntheticOffer({
        taxInclusion: "excluded",
        taxAmount: syntheticOffer().price,
      }),
    );
    expect(knownTax.total?.amountMinor).toBe(69_998);

    const unknownInclusion = offerCost(
      syntheticOffer({ taxInclusion: "unknown", taxAmount: null }),
    );
    expect(unknownInclusion.total).toBeNull();
  });
});

describe("price freshness", () => {
  it("classifies fresh, aging, stale, expired and unknown observations", () => {
    const policy = DEFAULT_FRESHNESS_POLICY;
    const at = (offset: number) =>
      new Date(SYNTHETIC_NOW_DATE.getTime() + offset);
    expect(assessFreshness(SYNTHETIC_NOW, policy, at(10 * 60_000)).state).toBe(
      "fresh",
    );
    expect(assessFreshness(SYNTHETIC_NOW, policy, at(2 * HOUR)).state).toBe(
      "aging",
    );
    expect(assessFreshness(SYNTHETIC_NOW, policy, at(8 * HOUR)).state).toBe(
      "stale",
    );
    expect(assessFreshness(SYNTHETIC_NOW, policy, at(25 * HOUR)).state).toBe(
      "expired",
    );
    expect(assessFreshness(null, policy, at(0)).state).toBe("unknown");
    expect(assessFreshness("not-a-time", policy, at(0)).state).toBe("unknown");
    expect(assessFreshness(SYNTHETIC_NOW, policy, at(-HOUR)).state).toBe(
      "unknown",
    );
  });

  it("honours exact policy boundaries", () => {
    const policy = {
      freshWithinMs: 60_000,
      agingWithinMs: 120_000,
      staleWithinMs: 180_000,
    };
    const at = (offset: number) =>
      new Date(SYNTHETIC_NOW_DATE.getTime() + offset);
    expect(assessFreshness(SYNTHETIC_NOW, policy, at(60_000)).state).toBe(
      "fresh",
    );
    expect(assessFreshness(SYNTHETIC_NOW, policy, at(60_001)).state).toBe(
      "aging",
    );
    expect(assessFreshness(SYNTHETIC_NOW, policy, at(180_000)).state).toBe(
      "stale",
    );
    expect(assessFreshness(SYNTHETIC_NOW, policy, at(180_001)).state).toBe(
      "expired",
    );
  });

  it("validates configurable policies", () => {
    expect(validateFreshnessPolicy(DEFAULT_FRESHNESS_POLICY).ok).toBe(true);
    expect(
      validateFreshnessPolicy({
        freshWithinMs: 10,
        agingWithinMs: 5,
        staleWithinMs: 20,
      }).ok,
    ).toBe(false);
    expect(
      validateFreshnessPolicy({
        freshWithinMs: 0,
        agingWithinMs: 100,
        staleWithinMs: 200,
      }).ok,
    ).toBe(false);
  });
});

describe("availability normalization and freshness", () => {
  it("normalizes aliases and keeps missing data Unknown", () => {
    expect(normalizeAvailability("in_stock")).toEqual({
      ok: true,
      value: "in-stock",
    });
    expect(normalizeAvailability("Out of stock")).toEqual({
      ok: true,
      value: "out-of-stock",
    });
    expect(normalizeAvailability("pre-order")).toEqual({
      ok: true,
      value: "preorder",
    });
    expect(normalizeAvailability("low stock")).toEqual({
      ok: true,
      value: "limited",
    });
    expect(normalizeAvailability(null)).toEqual({
      ok: true,
      value: "unknown",
    });
    expect(normalizeAvailability("maybe").ok).toBe(false);
  });

  it("applies a separate stock observation age", () => {
    const now = new Date(SYNTHETIC_NOW_DATE.getTime() + 8 * HOUR);
    const offer = syntheticOffer({
      availability: {
        state: "in-stock",
        observedAt: SYNTHETIC_NOW,
      },
    });
    const effective = effectiveAvailability(
      offer,
      DEFAULT_FRESHNESS_POLICY,
      now,
    );
    expect(effective.freshness.state).toBe("stale");
    expect(effective.state).toBe("unknown");

    const freshStock = effectiveAvailability(
      syntheticOffer(),
      DEFAULT_FRESHNESS_POLICY,
      SYNTHETIC_NOW_DATE,
    );
    expect(freshStock.state).toBe("in-stock");
    expect(freshStock.freshness.state).toBe("fresh");
  });

  it("filters in-stock separately from purchasable", () => {
    expect(availabilitySatisfiesFilter("in-stock", "in-stock")).toBe(true);
    expect(availabilitySatisfiesFilter("limited", "in-stock")).toBe(false);
    expect(availabilitySatisfiesFilter("limited", "purchasable")).toBe(true);
    expect(availabilitySatisfiesFilter("unknown", "purchasable")).toBe(false);
    expect(availabilitySatisfiesFilter("out-of-stock", "purchasable")).toBe(
      false,
    );
  });
});
