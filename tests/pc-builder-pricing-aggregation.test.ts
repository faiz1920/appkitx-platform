import { describe, expect, it } from "vitest";
import {
  aggregateOffers,
  estimateBuildPurchase,
} from "../src/lib/pc-builder/pricing";
import {
  SYNTHETIC_CPU_ID,
  SYNTHETIC_GPU_ID,
  SYNTHETIC_NOW,
  SYNTHETIC_NOW_DATE,
  money,
  syntheticOffer,
} from "./pc-builder-pricing-fixtures";
import type { Offer } from "../src/lib/pc-builder/pricing";
import { moneyFromMinorUnits } from "../src/lib/pc-builder/pricing";

const HOUR = 3_600_000;
const at = (offset: number) =>
  new Date(SYNTHETIC_NOW_DATE.getTime() + offset).toISOString();

function offer(overrides: Partial<Offer> & { idSuffix: string }): Offer {
  const { idSuffix, ...rest } = overrides;
  return syntheticOffer({
    id: `fixture-provider:${idSuffix}`,
    provenance: {
      ...syntheticOffer().provenance,
      providerOfferId: idSuffix,
    },
    ...rest,
  });
}

function query(overrides: Record<string, unknown> = {}) {
  return {
    componentId: SYNTHETIC_CPU_ID,
    marketId: "us",
    currency: "USD",
    now: SYNTHETIC_NOW_DATE,
    ...overrides,
  };
}

function mustEstimate(input: Parameters<typeof estimateBuildPurchase>[0]) {
  const result = estimateBuildPurchase(input);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error("Estimate failed");
  return result.value;
}

function mustAggregate(offers: readonly Offer[], overrides = {}) {
  const result = aggregateOffers(offers, query(overrides) as never);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error("Aggregate failed");
  return result.value;
}

describe("offer aggregation", () => {
  it("compares multiple sellers and offers within one market and currency", () => {
    const result = mustAggregate([
      offer({ idSuffix: "a", sellerId: "seller-a", price: money(34_999) }),
      offer({ idSuffix: "b", sellerId: "seller-b", price: money(33_999) }),
      offer({ idSuffix: "c", sellerId: "seller-c", price: money(33_999) }),
    ]);

    expect(result.status).toBe("available");
    expect(result.totalCount).toBe(3);
    expect(result.eligibleCount).toBe(3);
    expect(result.cheapest?.price.amountMinor).toBe(33_999);
    expect(result.highest?.price.amountMinor).toBe(34_999);
    expect(result.currenciesSeen).toEqual(["USD"]);
    expect(result.eligible[0]?.sellerId).toBe("seller-b");
  });

  it("uses observation time then id for deterministic ties", () => {
    const result = mustAggregate([
      offer({
        idSuffix: "older",
        price: money(10_000),
        provenance: {
          ...syntheticOffer().provenance,
          providerOfferId: "older",
          observedAt: at(-10 * 60_000),
        },
      }),
      offer({
        idSuffix: "newer",
        price: money(10_000),
        provenance: {
          ...syntheticOffer().provenance,
          providerOfferId: "newer",
          observedAt: SYNTHETIC_NOW,
        },
      }),
      offer({
        idSuffix: "alpha",
        price: money(10_000),
        provenance: {
          ...syntheticOffer().provenance,
          providerOfferId: "alpha",
          observedAt: SYNTHETIC_NOW,
        },
      }),
    ]);
    expect(result.eligible.map((entry) => entry.id)).toEqual([
      "fixture-provider:alpha",
      "fixture-provider:newer",
      "fixture-provider:older",
    ]);
  });

  it("excludes stale, expired, unavailable and untimed offers", () => {
    const result = mustAggregate([
      offer({ idSuffix: "fresh" }),
      offer({
        idSuffix: "aging",
        provenance: {
          ...syntheticOffer().provenance,
          providerOfferId: "aging",
          observedAt: at(-(HOUR + 1)),
        },
      }),
      offer({
        idSuffix: "stale",
        provenance: {
          ...syntheticOffer().provenance,
          providerOfferId: "stale",
          observedAt: at(-(8 * HOUR)),
        },
      }),
      offer({
        idSuffix: "expired",
        provenance: {
          ...syntheticOffer().provenance,
          providerOfferId: "expired",
          observedAt: at(-(25 * HOUR)),
        },
      }),
      offer({
        idSuffix: "unknown-time",
        provenance: {
          ...syntheticOffer().provenance,
          providerOfferId: "unknown-time",
          observedAt: "not-a-time",
        },
      }),
      offer({
        idSuffix: "out",
        availability: { state: "out-of-stock", observedAt: SYNTHETIC_NOW },
      }),
      offer({
        idSuffix: "unknown-stock",
        availability: { state: "unknown", observedAt: null },
      }),
    ]);

    expect(result.eligibleCount).toBe(2);
    expect(result.excluded.map((entry) => entry.offer.id).sort()).toEqual(
      [
        "fixture-provider:expired",
        "fixture-provider:out",
        "fixture-provider:stale",
        "fixture-provider:unknown-stock",
        "fixture-provider:unknown-time",
      ].sort(),
    );
    const stale = result.excluded.find(
      (entry) => entry.offer.id === "fixture-provider:stale",
    );
    expect(stale?.reasons).toContain("price-stale");
    const expired = result.excluded.find(
      (entry) => entry.offer.id === "fixture-provider:expired",
    );
    expect(expired?.reasons).toContain("price-expired");
    expect(result.cheapest?.id).toBe("fixture-provider:fresh");
    expect(result.limitations.join(" ")).toContain("stale");
  });

  it("treats depleted stock independently from a fresh price", () => {
    const result = mustAggregate([
      offer({
        idSuffix: "fresh-price-unknown-stock",
        availability: { state: "unknown", observedAt: null },
      }),
    ]);
    expect(result.eligibleCount).toBe(0);
    expect(result.excluded[0]?.priceFreshness.state).toBe("fresh");
    expect(result.excluded[0]?.effectiveAvailability).toBe("unknown");
    expect(result.excluded[0]?.reasons).toContain("availability-time-unknown");
  });

  it("supports the in-stock and purchasable filters separately", () => {
    const offers = [
      offer({ idSuffix: "stock" }),
      offer({
        idSuffix: "limited",
        availability: { state: "limited", observedAt: SYNTHETIC_NOW },
      }),
    ];
    const purchasable = mustAggregate(offers);
    expect(purchasable.eligibleCount).toBe(2);

    const inStock = mustAggregate(offers, { availability: "in-stock" });
    expect(inStock.eligibleCount).toBe(1);
    expect(inStock.excluded[0]?.reasons).toContain("availability-not-in-stock");
  });

  it("excludes probable matches by default and unverified matches always", () => {
    const probable = offer({
      idSuffix: "probable",
      provenance: {
        ...syntheticOffer().provenance,
        providerOfferId: "probable",
        matchStatus: "probable",
      },
    });
    const unverified = offer({
      idSuffix: "unverified",
      provenance: {
        ...syntheticOffer().provenance,
        providerOfferId: "unverified",
        matchStatus: "unverified",
      },
    });
    const offers = [offer({ idSuffix: "verified" }), probable, unverified];

    const verifiedOnly = mustAggregate(offers);
    expect(verifiedOnly.eligibleCount).toBe(1);
    expect(verifiedOnly.cheapest?.id).toBe("fixture-provider:verified");

    const includeProbable = mustAggregate(offers, {
      minimumMatch: "probable",
    });
    expect(includeProbable.eligibleCount).toBe(2);
    expect(
      includeProbable.excluded.some((entry) =>
        entry.reasons.includes("match-unverified"),
      ),
    ).toBe(true);
  });

  it("refuses to compare across currencies", () => {
    const result = mustAggregate([
      offer({ idSuffix: "usd" }),
      offer({ idSuffix: "inr", price: money(2_999_900, "INR") }),
    ]);
    expect(result.status).toBe("currency-mismatch");
    expect(result.cheapest).toBeNull();
    expect(result.highest).toBeNull();
    expect(result.currenciesSeen).toEqual(["INR", "USD"]);
  });

  it("isolates markets before comparing prices", () => {
    const us = offer({ idSuffix: "us" });
    const india = offer({
      idSuffix: "in",
      marketId: "in",
      countryCode: "IN",
      price: money(2_999_900, "INR"),
    });
    const usResult = mustAggregate([us, india]);
    expect(usResult.totalCount).toBe(1);
    expect(usResult.cheapest?.price.currency).toBe("USD");

    const inResult = mustAggregate([us, india], {
      marketId: "in",
      currency: "INR",
    });
    expect(inResult.totalCount).toBe(1);
    expect(inResult.cheapest?.price.currency).toBe("INR");
  });

  it("reports no-offer and no-eligible states", () => {
    const none = mustAggregate([]);
    expect(none.status).toBe("no-offers");
    expect(none.cheapest).toBeNull();

    const noEligible = mustAggregate([
      offer({
        idSuffix: "stale",
        provenance: {
          ...syntheticOffer().provenance,
          providerOfferId: "stale",
          observedAt: at(-(25 * HOUR)),
        },
      }),
    ]);
    expect(noEligible.status).toBe("no-eligible-offers");
    expect(noEligible.excluded.length).toBe(1);
  });

  it("rejects an invalid aggregation query", () => {
    const bad = aggregateOffers([], {
      componentId: "not a component id",
      marketId: "US",
      currency: "ZZZ",
      now: "not a date",
    } as never);
    expect(bad.ok).toBe(false);
  });
});

describe("build purchase contracts", () => {
  function cpuOffer(overrides: Partial<Offer> = {}): Offer {
    return syntheticOffer({
      id: "fixture-provider:cpu",
      price: money(34_999),
      shipping: money(0),
      taxInclusion: "included",
      ...overrides,
    });
  }

  function gpuOffer(overrides: Partial<Offer> = {}): Offer {
    return syntheticOffer({
      id: "fixture-provider:gpu",
      componentId: SYNTHETIC_GPU_ID,
      price: money(54_999),
      shipping: money(0),
      taxInclusion: "included",
      ...overrides,
    });
  }

  it("calculates a complete item and purchase total only with full coverage", () => {
    const estimate = mustEstimate({
      requiredComponentIds: [SYNTHETIC_CPU_ID, SYNTHETIC_GPU_ID],
      offers: [cpuOffer(), gpuOffer()],
      marketId: "us",
      currency: "USD",
      now: SYNTHETIC_NOW_DATE,
      budget: money(100_000),
    });

    expect(estimate.completeness).toBe("complete");
    expect(estimate.coveragePercent).toBe(100);
    expect(estimate.unpricedComponentIds).toEqual([]);
    expect(estimate.itemTotal?.amountMinor).toBe(89_998);
    expect(estimate.purchaseTotal?.amountMinor).toBe(89_998);
    expect(estimate.budgetStatus).toBe("within");
  });

  it("reports partial coverage without claiming a complete total", () => {
    const estimate = mustEstimate({
      requiredComponentIds: [SYNTHETIC_CPU_ID, SYNTHETIC_GPU_ID],
      offers: [cpuOffer()],
      marketId: "us",
      currency: "USD",
      now: SYNTHETIC_NOW_DATE,
      budget: money(100_000),
    });

    expect(estimate.completeness).toBe("partial-prices");
    expect(estimate.coveragePercent).toBe(50);
    expect(estimate.unpricedComponentIds).toEqual([SYNTHETIC_GPU_ID]);
    expect(estimate.itemTotal).toBeNull();
    expect(estimate.purchaseTotal).toBeNull();
    expect(estimate.partialItemTotal.amountMinor).toBe(34_999);
    expect(estimate.budgetStatus).toBe("incomplete");
    expect(estimate.limitations.join(" ")).toContain("No eligible offer");
  });

  it("reports no offers and empty builds explicitly", () => {
    const noOffers = mustEstimate({
      requiredComponentIds: [SYNTHETIC_CPU_ID],
      offers: [],
      marketId: "us",
      currency: "USD",
      now: SYNTHETIC_NOW_DATE,
    });
    expect(noOffers.completeness).toBe("no-offers");
    expect(noOffers.coveragePercent).toBe(0);
    expect(noOffers.itemTotal).toBeNull();

    const empty = mustEstimate({
      requiredComponentIds: [],
      offers: [],
      marketId: "us",
      currency: "USD",
      now: SYNTHETIC_NOW_DATE,
    });
    expect(empty.completeness).toBe("empty");
    expect(empty.coveragePercent).toBe(0);
    expect(empty.itemTotal).toBeNull();
  });

  it("keeps a complete item total separate from incomplete shipping/tax", () => {
    const estimate = mustEstimate({
      requiredComponentIds: [SYNTHETIC_CPU_ID, SYNTHETIC_GPU_ID],
      offers: [
        cpuOffer({ shipping: null }),
        gpuOffer({ taxInclusion: "excluded", taxAmount: null }),
      ],
      marketId: "us",
      currency: "USD",
      now: SYNTHETIC_NOW_DATE,
      budget: money(100_000),
    });

    expect(estimate.completeness).toBe("incomplete-costs");
    expect(estimate.itemTotal?.amountMinor).toBe(89_998);
    expect(estimate.purchaseTotal).toBeNull();
    expect(estimate.budgetStatus).toBe("incomplete");
    expect(estimate.limitations.join(" ")).toContain("Shipping");
  });

  it("does not compare a budget in a different currency", () => {
    const estimate = mustEstimate({
      requiredComponentIds: [SYNTHETIC_CPU_ID],
      offers: [cpuOffer()],
      marketId: "us",
      currency: "USD",
      now: SYNTHETIC_NOW_DATE,
      budget: money(30_000, "EUR"),
    });
    expect(estimate.budgetStatus).toBe("currency-mismatch");
    expect(estimate.purchaseTotal?.amountMinor).toBe(34_999);
  });

  it("adds known excluded tax to a complete purchase total", () => {
    const tax = moneyFromMinorUnits(3_500, "USD");
    expect(tax.ok).toBe(true);
    if (!tax.ok) return;
    const estimate = mustEstimate({
      requiredComponentIds: [SYNTHETIC_CPU_ID],
      offers: [
        cpuOffer({
          shipping: money(500),
          taxInclusion: "excluded",
          taxAmount: tax.value,
        }),
      ],
      marketId: "us",
      currency: "USD",
      now: SYNTHETIC_NOW_DATE,
      budget: money(39_000),
    });
    expect(estimate.completeness).toBe("complete");
    expect(estimate.purchaseTotal?.amountMinor).toBe(38_999);
    expect(estimate.budgetStatus).toBe("within");
  });

  it("rejects duplicate required components", () => {
    const result = estimateBuildPurchase({
      requiredComponentIds: [SYNTHETIC_CPU_ID, SYNTHETIC_CPU_ID],
      offers: [],
      marketId: "us",
      currency: "USD",
      now: SYNTHETIC_NOW_DATE,
    });
    expect(result.ok).toBe(false);
  });
});
