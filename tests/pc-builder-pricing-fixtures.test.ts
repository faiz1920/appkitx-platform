import { describe, expect, it } from "vitest";
import {
  createSyntheticPricingScenario,
  PRICING_DEMO_COMPONENT_ID,
} from "../src/dev/pc-builder/pricing-fixtures";

describe("synthetic pricing preview fixtures", () => {
  it("marks every seller and offer as synthetic on example domains", () => {
    const scenario = createSyntheticPricingScenario(
      new Date("2026-10-31T12:00:00.000Z"),
    );
    expect(scenario.sellers.length).toBeGreaterThan(0);
    expect(scenario.offers.length).toBeGreaterThan(0);

    for (const seller of scenario.sellers) {
      expect(seller.dataOrigin).toBe("synthetic");
      expect(new URL(seller.websiteUrl).hostname.endsWith(".example")).toBe(
        true,
      );
      expect(seller.displayName).toContain("Synthetic");
    }

    for (const offer of scenario.offers) {
      expect(offer.provenance.dataOrigin).toBe("synthetic");
      expect(offer.provenance.providerId).toBe("fixture-pricing");
      expect(offer.provenance.productUrl).toContain(".example");
      expect(offer.componentId).toBe(PRICING_DEMO_COMPONENT_ID);
    }
  });

  it("provides fresh, aging, stale and unavailable examples per market", () => {
    const scenario = createSyntheticPricingScenario(
      new Date("2026-10-31T12:00:00.000Z"),
    );
    const markets = new Map(
      scenario.markets.map((market) => [market.id, market]),
    );

    for (const offer of scenario.offers) {
      const market = markets.get(offer.marketId);
      expect(market).toBeDefined();
      expect(offer.countryCode).toBe(market?.countryCode);
      expect(offer.price.currency).toBe(market?.defaultCurrency);
    }

    expect(
      scenario.offers.some(
        (offer) => offer.availability.state === "out-of-stock",
      ),
    ).toBe(true);
    expect(
      scenario.offers.some((offer) => offer.availability.state === "limited"),
    ).toBe(true);
    expect(
      scenario.offers.some(
        (offer) =>
          new Date("2026-10-31T12:00:00.000Z").getTime() -
            new Date(offer.provenance.observedAt).getTime() >
          24 * 3_600_000,
      ),
    ).toBe(true);
  });
});
