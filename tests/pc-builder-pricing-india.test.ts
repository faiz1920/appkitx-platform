import { describe, expect, it } from "vitest";
import { catalogue, componentById } from "../src/lib/pc-builder/catalogue";
import {
  INDIA_COUNTRY_CODE,
  INDIA_CURRENCY,
  INDIA_DISPLAY_LOCALE,
  EXAMPLE_MARKETS,
  INDIA_MARKET_ID,
  addMoney,
  applyOfferRefresh,
  assessIndiaMarketReadiness,
  auditCatalogueIdentities,
  aggregateOffers,
  catalogueIdentity,
  estimateBuildPurchase,
  findIndiaMarket,
  formatMoney,
  isMpnShapedModel,
  matchProduct,
  moneyFromMinorUnits,
  normalizeOffer,
  parseMoney,
  providerFailure,
  type CatalogueProductIdentity,
  type Market,
  type Offer,
  type PricingResult,
} from "../src/lib/pc-builder/pricing";
import {
  SYNTHETIC_CPU_ID,
  SYNTHETIC_GPU_ID,
  SYNTHETIC_NOW_DATE,
  money,
  normalizeContext,
  rawOffer,
  syntheticMatch,
  syntheticOffer,
  syntheticSeller,
} from "./pc-builder-pricing-fixtures";

const INDIA = findIndiaMarket();

if (INDIA === null) {
  throw new Error("India market fixture is missing");
}
const INDIA_MARKET: Market = INDIA;

function must<T>(result: PricingResult<T>): T {
  if (!result.ok) {
    throw new Error(
      `Unexpected pricing failure: ${result.issues
        .map((entry) => `${entry.path}: ${entry.message}`)
        .join("; ")}`,
    );
  }
  return result.value;
}

function indiaRaw(overrides: Record<string, unknown> = {}) {
  return rawOffer({
    marketId: INDIA_MARKET_ID,
    countryCode: INDIA_COUNTRY_CODE,
    currency: INDIA_CURRENCY,
    amount: "29999",
    listAmount: "31999",
    shippingAmount: "199",
    taxInclusion: "included",
    ...overrides,
  });
}

function indiaOffer(
  overrides: Record<string, unknown> = {},
  componentId = SYNTHETIC_CPU_ID,
): Offer {
  return must(
    normalizeOffer(
      indiaRaw(overrides),
      normalizeContext({
        market: INDIA_MARKET,
        seller: syntheticSeller(),
        match: syntheticMatch(componentId),
      }),
    ),
  );
}

describe("India market readiness", () => {
  it("is ordinary market configuration with the launch contract satisfied", () => {
    const india = findIndiaMarket();
    expect(india).toMatchObject({
      id: "in",
      countryCode: "IN",
      defaultCurrency: "INR",
      displayLocale: "en-IN",
      supportedCurrencies: ["INR"],
    });

    const readiness = assessIndiaMarketReadiness(india);
    expect(readiness.ready).toBe(true);
    expect(readiness.checks.every((check) => check.passed)).toBe(true);
    expect(readiness.checks.map((check) => check.id)).toEqual([
      "market-configured",
      "market-id",
      "country-code",
      "default-currency",
      "supported-currency",
      "currency-precision",
      "display-locale",
      "currency-symbol",
    ]);
  });

  it("reports a misconfigured market instead of repairing it", () => {
    const misconfigured: Market = {
      ...INDIA_MARKET,
      defaultCurrency: "USD",
      supportedCurrencies: ["USD"],
    };
    const readiness = assessIndiaMarketReadiness(misconfigured);
    expect(readiness.ready).toBe(false);
    const failed = readiness.checks
      .filter((check) => !check.passed)
      .map((check) => check.id);
    expect(failed).toEqual([
      "default-currency",
      "supported-currency",
      "currency-symbol",
    ]);
  });

  it("fails closed when the India market is not configured", () => {
    const readiness = assessIndiaMarketReadiness(null);
    expect(readiness.ready).toBe(false);
    expect(readiness.checks).toHaveLength(1);
    expect(readiness.checks[0]).toMatchObject({
      id: "market-configured",
      passed: false,
    });
  });

  it("does not infer India from locale or browser language", () => {
    const localesOnly: Market[] = [
      {
        id: "other",
        countryCode: "US",
        name: "Other",
        defaultCurrency: "USD",
        displayLocale: "en-IN",
        supportedCurrencies: ["USD"],
      },
    ];
    expect(findIndiaMarket(localesOnly)).toBeNull();
  });

  it("keeps the other example markets intact", () => {
    expect(EXAMPLE_MARKETS.map((market) => market.id)).toEqual([
      "us",
      "in",
      "gb",
      "de",
    ]);
  });
});

describe("INR money handling", () => {
  it("uses two paise digits and exact minor units", () => {
    expect(parseMoney("29999", "INR")).toEqual({
      ok: true,
      value: { amountMinor: 2_999_900, currency: "INR" },
    });
    expect(parseMoney("123456.78", "INR")).toEqual({
      ok: true,
      value: { amountMinor: 12_345_678, currency: "INR" },
    });
    expect(parseMoney("1.234", "INR").ok).toBe(false);
    expect(parseMoney("1e3", "INR").ok).toBe(false);
  });

  it("formats with Indian grouping and the rupee symbol", () => {
    const price = must(moneyFromMinorUnits(12_345_678, "INR"));
    const text = must(formatMoney(price, INDIA_DISPLAY_LOCALE));
    expect(text).toContain("₹");
    expect(text).toContain("1,23,456.78");

    const low = must(moneyFromMinorUnits(2_999_900, "INR"));
    expect(must(formatMoney(low, INDIA_DISPLAY_LOCALE))).toContain(
      "₹29,999.00",
    );
  });

  it("never converts or mixes INR with another currency", () => {
    const inr = must(moneyFromMinorUnits(2_999_900, "INR"));
    const usd = money(34_999, "USD");
    const sum = addMoney(inr, usd);
    expect(sum.ok).toBe(false);
    if (!sum.ok) expect(sum.issues[0]?.code).toBe("currency-mismatch");
  });
});

describe("India offer isolation", () => {
  it("normalizes an INR offer and keeps tax/shipping evidence explicit", () => {
    const offer = indiaOffer();
    expect(offer.marketId).toBe("in");
    expect(offer.countryCode).toBe("IN");
    expect(offer.price).toEqual({ amountMinor: 2_999_900, currency: "INR" });
    expect(offer.listPrice?.amountMinor).toBe(3_199_900);
    expect(offer.shipping?.amountMinor).toBe(19_900);
    expect(offer.taxInclusion).toBe("included");
    expect(offer.provenance.dataOrigin).toBe("synthetic");
  });

  it("aggregates only the requested market and currency", () => {
    const inr = indiaOffer();
    const usd = syntheticOffer({
      marketId: "in",
      countryCode: "IN",
      price: money(34_999, "USD"),
    });

    const indiaResult = must(
      aggregateOffers([inr, usd], {
        componentId: SYNTHETIC_CPU_ID,
        marketId: "in",
        currency: "INR",
        now: SYNTHETIC_NOW_DATE,
      }),
    );
    expect(indiaResult.status).toBe("currency-mismatch");
    expect(indiaResult.cheapest).toBeNull();

    const usResult = must(
      aggregateOffers([inr], {
        componentId: SYNTHETIC_CPU_ID,
        marketId: "us",
        currency: "USD",
        now: SYNTHETIC_NOW_DATE,
      }),
    );
    expect(usResult.status).toBe("no-offers");
    expect(usResult.totalCount).toBe(0);
  });

  it("refuses to normalize an INR amount under a USD market", () => {
    const result = normalizeOffer(
      indiaRaw(),
      normalizeContext({ seller: syntheticSeller() }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.issues.some((entry) => entry.code === "invalid-market"),
      ).toBe(true);
    }
  });
});

describe("India price and stock freshness", () => {
  it("excludes an expired INR price while stock freshness stays independent", () => {
    const expiredAt = "2026-10-29T20:00:00.000Z";
    const expired = indiaOffer({
      providerOfferId: "in-expired",
      observedAt: expiredAt,
      lastVerifiedAt: expiredAt,
      providerUpdatedAt: expiredAt,
      availabilityObservedAt: expiredAt,
    });
    const freshUnknownStock = indiaOffer({
      providerOfferId: "in-fresh-unknown-stock",
      availability: null,
      availabilityObservedAt: null,
    });
    const fresh = indiaOffer({ providerOfferId: "in-fresh" });

    const result = must(
      aggregateOffers([expired, freshUnknownStock, fresh], {
        componentId: SYNTHETIC_CPU_ID,
        marketId: INDIA_MARKET_ID,
        currency: INDIA_CURRENCY,
        now: SYNTHETIC_NOW_DATE,
      }),
    );

    expect(result.eligibleCount).toBe(1);
    expect(result.cheapest?.id).toBe(fresh.id);

    const expiredEntry = result.excluded.find(
      (entry) => entry.offer.id === expired.id,
    );
    expect(expiredEntry?.priceFreshness.state).toBe("expired");
    expect(expiredEntry?.reasons).toContain("price-expired");

    const unknownStockEntry = result.excluded.find(
      (entry) => entry.offer.id === freshUnknownStock.id,
    );
    expect(unknownStockEntry?.priceFreshness.state).toBe("fresh");
    expect(unknownStockEntry?.effectiveAvailability).toBe("unknown");
    expect(unknownStockEntry?.reasons).toContain("availability-time-unknown");
  });
});

describe("catalogue identity audit", () => {
  const identities = catalogue.map(catalogueIdentity);

  it("reports zero verified identities without inventing metadata", () => {
    const audit = auditCatalogueIdentities(identities);
    expect(audit.total).toBe(101);
    expect(audit.verifiedMatchReady).toBe(0);
    expect(audit.explicitMpn).toBe(0);
    expect(audit.explicitGtin).toBe(0);
    expect(audit.modelMpnShaped).toBe(59);
    expect(audit.modelDescriptive).toBe(42);
    expect(audit.missingModel).toBe(0);
    expect(audit.duplicateModels).toEqual([]);
    expect(
      audit.byCategory.reduce((sum, category) => sum + category.total, 0),
    ).toBe(101);
  });

  it("treats MPN-shaped model strings as candidates, not verification", () => {
    expect(isMpnShapedModel("100-100000910WOF")).toBe(true);
    expect(isMpnShapedModel("CMK32GX5M2B6000C30")).toBe(true);
    expect(isMpnShapedModel("GeForce RTX 4090 Founders Edition")).toBe(false);
    expect(isMpnShapedModel("B650M")).toBe(true);

    const modelOnly = catalogueIdentity(componentById(SYNTHETIC_CPU_ID)!);
    const audit = auditCatalogueIdentities([modelOnly]);
    expect(audit.entries[0]?.evidence).toBe("model-mpn-shaped");
    expect(audit.entries[0]?.verifiedMatchReady).toBe(false);
  });

  it("recognizes explicit MPN and GTIN evidence when a source provides it", () => {
    const base = catalogueIdentity(componentById(SYNTHETIC_CPU_ID)!);
    const withMpn: CatalogueProductIdentity = {
      ...base,
      manufacturerPartNumber: "100-100000910WOF",
    };
    const withGtin: CatalogueProductIdentity = {
      ...base,
      componentId: SYNTHETIC_GPU_ID,
      gtin: "4006381333931",
    };
    const audit = auditCatalogueIdentities([withMpn, withGtin]);
    expect(audit.verifiedMatchReady).toBe(2);
    expect(audit.explicitMpn).toBe(1);
    expect(audit.explicitGtin).toBe(1);
  });

  it("detects duplicate normalized models without merging them", () => {
    const base = catalogueIdentity(componentById(SYNTHETIC_CPU_ID)!);
    const audit = auditCatalogueIdentities([
      { ...base, componentId: "cpu-one", model: "TEST-MODEL 1" },
      { ...base, componentId: "cpu-two", model: "test-model 1" },
    ]);
    expect(audit.duplicateModels).toHaveLength(1);
    expect(audit.duplicateModels[0]?.componentIds).toEqual([
      "cpu-one",
      "cpu-two",
    ]);
  });
});

describe("India matching confidence", () => {
  it("keeps a real catalogue model-only match probable, never verified", () => {
    const base = catalogueIdentity(componentById(SYNTHETIC_CPU_ID)!);
    const result = must(
      matchProduct(
        {
          providerProductId: "amazon-in-listing",
          title: "AMD Ryzen 7 7800X3D",
          manufacturer: base.manufacturer,
          manufacturerPartNumber: null,
          modelNumber: base.model,
          gtin: null,
          category: "cpu",
          productUrl: "https://retailer.example/products/cpu",
          region: "IN",
        },
        [base],
      ),
    );
    expect(result.status).toBe("probable");
    expect(result.componentId).toBe(SYNTHETIC_CPU_ID);
  });

  it("does not verify when a provider calls the catalogue model an MPN", () => {
    const base = catalogueIdentity(componentById(SYNTHETIC_CPU_ID)!);
    const result = must(
      matchProduct(
        {
          providerProductId: "amazon-in-listing",
          title: "AMD Ryzen 7 7800X3D",
          manufacturer: base.manufacturer,
          manufacturerPartNumber: base.model,
          modelNumber: null,
          gtin: null,
          category: "cpu",
          productUrl: "https://retailer.example/products/cpu",
          region: "IN",
        },
        [base],
      ),
    );
    expect(result.status).toBe("probable");
  });

  it("only verified matches are eligible by default", () => {
    const probable = syntheticOffer({
      marketId: "in",
      countryCode: "IN",
      price: money(2_899_900, "INR"),
      provenance: {
        ...syntheticOffer().provenance,
        matchStatus: "probable",
      },
    });
    const verified = indiaOffer();
    const result = must(
      aggregateOffers([probable, verified], {
        componentId: SYNTHETIC_CPU_ID,
        marketId: "in",
        currency: "INR",
        now: SYNTHETIC_NOW_DATE,
      }),
    );
    expect(result.eligibleCount).toBe(1);
    expect(result.excluded[0]?.reasons).toContain("match-probable");
  });
});

describe("provider reliability and data-origin safety", () => {
  it("reports timeout and rate-limit failures without throwing", () => {
    const timeout = providerFailure("timeout", "Provider timed out.");
    expect(timeout.ok).toBe(false);
    if (!timeout.ok) expect(timeout.error.code).toBe("timeout");

    const limited = providerFailure("rate-limited", "Slow down.", {
      retryAfterMs: 30_000,
    });
    expect(limited.ok).toBe(false);
    if (!limited.ok) {
      expect(limited.error.code).toBe("rate-limited");
      expect(limited.error.retryAfterMs).toBe(30_000);
    }
  });

  it("preserves the last known valid INR offer after a malformed refresh", () => {
    const previous = indiaOffer();
    const refreshed = applyOfferRefresh(
      previous,
      indiaRaw({ amount: "not-a-price" }),
      normalizeContext({
        market: INDIA_MARKET,
        seller: syntheticSeller(),
        match: syntheticMatch(),
      }),
    );
    expect(refreshed.replaced).toBe(false);
    expect(refreshed.offer?.id).toBe(previous.id);
    expect(refreshed.offer?.price).toEqual({
      amountMinor: 2_999_900,
      currency: "INR",
    });
    expect(refreshed.issues.length).toBeGreaterThan(0);
  });

  it("refuses a refresh for a different offer id", () => {
    const previous = indiaOffer();
    const refreshed = applyOfferRefresh(
      previous,
      indiaRaw({ providerOfferId: "different-offer" }),
      normalizeContext({
        market: INDIA_MARKET,
        seller: syntheticSeller(),
        match: syntheticMatch(),
      }),
    );
    expect(refreshed.replaced).toBe(false);
    expect(refreshed.offer?.id).toBe(previous.id);
  });

  it("normalizes no credential material into an offer", () => {
    const serialized = JSON.stringify(indiaOffer()).toLowerCase();
    for (const forbidden of [
      "token",
      "secret",
      "password",
      "apikey",
      "api_key",
      "authorization",
      "credential",
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it("rejects synthetic seller data in a live-provider normalization", () => {
    const result = normalizeOffer(
      indiaRaw(),
      normalizeContext({
        market: INDIA_MARKET,
        dataOrigin: "provider",
        seller: syntheticSeller(),
      }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.issues.some((entry) => entry.code === "invalid-value"),
      ).toBe(true);
    }
  });
});

describe("India build purchase contract", () => {
  function inrOffer(
    componentId: string,
    amountMinor: number,
    overrides: Record<string, unknown> = {},
  ): Offer {
    return indiaOffer(
      {
        providerOfferId: `offer-${componentId}`,
        amount: String(amountMinor / 100),
        listAmount: null,
        shippingAmount: "0",
        taxInclusion: "included",
        ...overrides,
      },
      componentId,
    );
  }

  it("calculates a complete INR total only with full coverage", () => {
    const estimate = must(
      estimateBuildPurchase({
        requiredComponentIds: [SYNTHETIC_CPU_ID, SYNTHETIC_GPU_ID],
        offers: [
          inrOffer(SYNTHETIC_CPU_ID, 2_999_900),
          inrOffer(SYNTHETIC_GPU_ID, 5_499_900),
        ],
        marketId: INDIA_MARKET_ID,
        currency: INDIA_CURRENCY,
        now: SYNTHETIC_NOW_DATE,
        budget: money(9_000_000, "INR"),
      }),
    );
    expect(estimate.completeness).toBe("complete");
    expect(estimate.coveragePercent).toBe(100);
    expect(estimate.itemTotal?.amountMinor).toBe(8_499_800);
    expect(estimate.purchaseTotal?.amountMinor).toBe(8_499_800);
    expect(estimate.budgetStatus).toBe("within");
  });

  it("keeps a total incomplete when shipping is unknown", () => {
    const incomplete = inrOffer(SYNTHETIC_CPU_ID, 2_999_900, {
      shippingAmount: null,
    });
    const estimate = must(
      estimateBuildPurchase({
        requiredComponentIds: [SYNTHETIC_CPU_ID],
        offers: [incomplete],
        marketId: INDIA_MARKET_ID,
        currency: INDIA_CURRENCY,
        now: SYNTHETIC_NOW_DATE,
        budget: money(9_000_000, "INR"),
      }),
    );
    expect(estimate.completeness).toBe("incomplete-costs");
    expect(estimate.purchaseTotal).toBeNull();
    expect(estimate.budgetStatus).toBe("incomplete");
  });

  it("does not compare a USD budget with an INR build", () => {
    const estimate = must(
      estimateBuildPurchase({
        requiredComponentIds: [SYNTHETIC_CPU_ID],
        offers: [inrOffer(SYNTHETIC_CPU_ID, 2_999_900)],
        marketId: INDIA_MARKET_ID,
        currency: INDIA_CURRENCY,
        now: SYNTHETIC_NOW_DATE,
        budget: money(40_000, "USD"),
      }),
    );
    expect(estimate.budgetStatus).toBe("currency-mismatch");
  });
});
