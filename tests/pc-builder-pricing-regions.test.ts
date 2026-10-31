import { describe, expect, it } from "vitest";
import {
  EXAMPLE_MARKETS,
  isCountryCode,
  isMarketId,
  marketById,
  marketsByCountry,
  normalizeCountryCode,
  validateMarket,
} from "../src/lib/pc-builder/pricing";

function validMarket() {
  return {
    id: "ca",
    countryCode: "CA",
    name: "Canada",
    defaultCurrency: "CAD",
    displayLocale: "en-CA",
    supportedCurrencies: ["CAD"],
  };
}

describe("country and market validation", () => {
  it("uses explicit ISO country codes", () => {
    expect(isCountryCode("US")).toBe(true);
    expect(isCountryCode("IN")).toBe(true);
    expect(isCountryCode("GB")).toBe(true);
    expect(isCountryCode("DE")).toBe(true);
    expect(isCountryCode("EU")).toBe(false);
    expect(isCountryCode("XK")).toBe(false);
    expect(isCountryCode("UK")).toBe(false);
    expect(normalizeCountryCode(" in ")).toBe("IN");
    expect(normalizeCountryCode("ZZ")).toBeNull();
  });

  it("validates the illustrative markets", () => {
    for (const market of EXAMPLE_MARKETS) {
      const result = validateMarket(market);
      expect(result.ok, market.id).toBe(true);
      if (result.ok) expect(result.value).toEqual(market);
    }
  });

  it("keeps language, country and currency independent", () => {
    const india = marketById("in");
    const germany = marketById("de");
    expect(india).toMatchObject({
      countryCode: "IN",
      defaultCurrency: "INR",
      displayLocale: "en-IN",
    });
    expect(germany).toMatchObject({
      countryCode: "DE",
      defaultCurrency: "EUR",
      displayLocale: "de-DE",
    });
  });

  it("looks up markets only by explicit id or country", () => {
    expect(marketById("us")?.countryCode).toBe("US");
    expect(marketById("US")).toBeNull();
    expect(marketsByCountry("in").map((market) => market.id)).toEqual(["in"]);
    expect(marketsByCountry("ZZ")).toEqual([]);
    expect(isMarketId("us")).toBe(true);
    expect(isMarketId("US")).toBe(false);
    expect(isMarketId("market/one")).toBe(false);
  });

  it("rejects malformed market configuration", () => {
    const invalidCases: Array<[string, unknown]> = [
      ["missing id", { ...validMarket(), id: "" }],
      ["uppercase id", { ...validMarket(), id: "CA" }],
      ["bad country", { ...validMarket(), countryCode: "EU" }],
      ["bad currency", { ...validMarket(), defaultCurrency: "ZZZ" }],
      [
        "default not supported",
        { ...validMarket(), supportedCurrencies: ["USD"] },
      ],
      ["empty supported", { ...validMarket(), supportedCurrencies: [] }],
      [
        "duplicate currency",
        { ...validMarket(), supportedCurrencies: ["CAD", "CAD"] },
      ],
      ["bad locale", { ...validMarket(), displayLocale: "not a locale!" }],
      ["missing name", { ...validMarket(), name: " " }],
    ];
    for (const [label, value] of invalidCases) {
      const result = validateMarket(value);
      expect(result.ok, label).toBe(false);
    }
  });

  it("does not infer a market from a language", () => {
    // A locale lookup would be an explicit decision by the caller; this
    // registry intentionally exposes no such helper.
    expect(EXAMPLE_MARKETS.map((market) => market.id)).toEqual([
      "us",
      "in",
      "gb",
      "de",
    ]);
  });
});
