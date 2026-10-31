import { describe, expect, it } from "vitest";
import type { Money, PricingResult } from "../src/lib/pc-builder/pricing";
import {
  MAX_MONEY_MINOR,
  addMoney,
  compareMoney,
  currencyInfo,
  currencyPrecision,
  formatMoney,
  isCurrencyCode,
  isValidMoney,
  moneyFromMinorUnits,
  moneyToDecimalString,
  normalizeCurrencyCode,
  parseMoney,
  subtractMoney,
  zeroMoney,
} from "../src/lib/pc-builder/pricing";

function must<T>(result: PricingResult<T>): T {
  if (!result.ok) throw new Error("Unexpected pricing failure in test");
  return result.value;
}

describe("currency validation and precision", () => {
  it("uses ISO 4217 codes and resolves real minor-unit precision", () => {
    expect(isCurrencyCode("USD")).toBe(true);
    expect(isCurrencyCode("INR")).toBe(true);
    expect(isCurrencyCode("usd")).toBe(false);
    expect(normalizeCurrencyCode(" inr ")).toBe("INR");
    expect(currencyPrecision("USD")).toBe(2);
    expect(currencyPrecision("INR")).toBe(2);
    expect(currencyPrecision("JPY")).toBe(0);
    expect(currencyPrecision("KWD")).toBe(3);
    expect(currencyPrecision("CLF")).toBe(4);
  });

  it("rejects unknown, non-ISO and non-currency codes", () => {
    for (const value of ["ZZZ", "US", "USDT", "XXX", "", "  ", null, 42]) {
      expect(isCurrencyCode(value)).toBe(false);
      expect(normalizeCurrencyCode(value)).toBeNull();
    }
  });

  it("returns currency metadata without assuming two decimals", () => {
    expect(currencyInfo("JPY")).toEqual({ code: "JPY", precision: 0 });
    expect(currencyInfo("KWD")).toEqual({ code: "KWD", precision: 3 });
    expect(currencyInfo("CLF")).toEqual({ code: "CLF", precision: 4 });
    expect(currencyInfo("ZZZ")).toBeNull();
  });
});

describe("exact money parsing", () => {
  it("parses major-unit decimal strings into integer minor units", () => {
    expect(parseMoney("19.99", "USD")).toEqual({
      ok: true,
      value: { amountMinor: 1999, currency: "USD" },
    });
    expect(parseMoney("19.990", "USD")).toEqual({
      ok: true,
      value: { amountMinor: 1999, currency: "USD" },
    });
    expect(parseMoney("0", "USD")).toEqual({
      ok: true,
      value: { amountMinor: 0, currency: "USD" },
    });
    expect(parseMoney(349.5, "USD")).toEqual({
      ok: true,
      value: { amountMinor: 34_950, currency: "USD" },
    });
  });

  it("respects zero-, three- and four-decimal currencies", () => {
    expect(parseMoney("1200", "JPY")).toEqual({
      ok: true,
      value: { amountMinor: 1200, currency: "JPY" },
    });
    expect(parseMoney("1.234", "KWD")).toEqual({
      ok: true,
      value: { amountMinor: 1234, currency: "KWD" },
    });
    expect(parseMoney("1.2345", "CLF")).toEqual({
      ok: true,
      value: { amountMinor: 12_345, currency: "CLF" },
    });
  });

  it("rejects excess precision instead of silently rounding", () => {
    const usd = parseMoney("19.999", "USD");
    expect(usd.ok).toBe(false);
    const jpy = parseMoney("1200.5", "JPY");
    expect(jpy.ok).toBe(false);
  });

  it("rejects invalid, negative, exponent and oversized amounts", () => {
    for (const amount of [
      "-1",
      "1e3",
      "1,234.00",
      "1.",
      ".5",
      "abc",
      "",
      "  ",
    ]) {
      expect(parseMoney(amount, "USD").ok).toBe(false);
    }
    expect(parseMoney(-1, "USD").ok).toBe(false);
    expect(parseMoney(Number.NaN, "USD").ok).toBe(false);
    expect(parseMoney(Number.POSITIVE_INFINITY, "USD").ok).toBe(false);
    expect(parseMoney(String(MAX_MONEY_MINOR + 1), "JPY").ok).toBe(false);
  });

  it("rejects unsupported currencies before parsing", () => {
    for (const currency of ["ZZZ", "US", null, 42]) {
      const result = parseMoney("1.00", currency);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues[0]?.code).toBe("invalid-currency");
    }
  });

  it("keeps minor-unit arithmetic exact and same-currency only", () => {
    const usd = moneyFromMinorUnits(1999, "USD");
    const inr = moneyFromMinorUnits(1999, "INR");
    expect(usd.ok && inr.ok).toBe(true);
    if (!usd.ok || !inr.ok) return;

    const oneCent = moneyFromMinorUnits(1, "USD");
    if (!oneCent.ok) throw new Error("Invalid synthetic cent");
    const added = addMoney(usd.value, oneCent.value);
    expect(added.ok && added.value.amountMinor).toBe(2000);
    expect(addMoney(usd.value, inr.value).ok).toBe(false);
    expect(subtractMoney(usd.value, inr.value).ok).toBe(false);

    const compared = compareMoney(usd.value, inr.value);
    expect(compared.ok).toBe(false);
    const same = compareMoney(
      usd.value,
      must(moneyFromMinorUnits(1999, "USD")),
    );
    expect(same).toEqual({ ok: true, value: 0 });
  });

  it("does not fabricate a conversion", () => {
    const usd = moneyFromMinorUnits(100, "USD");
    const inr = moneyFromMinorUnits(100, "INR");
    expect(usd.ok && inr.ok).toBe(true);
    if (!usd.ok || !inr.ok) return;
    expect(addMoney(usd.value, inr.value).ok).toBe(false);
    expect(formatMoney(usd.value, "en-IN").ok).toBe(true);
    expect(formatMoney(inr.value, "en-IN").ok).toBe(true);
  });

  it("formats exact minor values with the currency's precision", () => {
    const usd = moneyFromMinorUnits(123_456, "USD");
    const jpy = moneyFromMinorUnits(1234, "JPY");
    const kwd = moneyFromMinorUnits(1234, "KWD");
    const inr = moneyFromMinorUnits(12_345_600, "INR");
    expect(usd.ok && jpy.ok && kwd.ok && inr.ok).toBe(true);
    if (!usd.ok || !jpy.ok || !kwd.ok || !inr.ok) return;

    const usdText = formatMoney(usd.value, "en-US");
    expect(usdText.ok).toBe(true);
    if (usdText.ok) expect(usdText.value).toContain("$1,234.56");

    const jpyText = formatMoney(jpy.value, "en-US");
    expect(jpyText.ok).toBe(true);
    if (jpyText.ok) {
      expect(jpyText.value).toContain("1,234");
      expect(jpyText.value).not.toContain(".00");
    }

    const kwdText = formatMoney(kwd.value, "en-US");
    expect(kwdText.ok).toBe(true);
    if (kwdText.ok) expect(kwdText.value).toContain("1.234");

    const inrText = formatMoney(inr.value, "en-IN");
    expect(inrText.ok).toBe(true);
    if (inrText.ok) expect(inrText.value).toContain("1,23,456.00");
  });

  it("formats valid money and rejects invalid locales", () => {
    const money: Money = must(moneyFromMinorUnits(100, "USD"));
    expect(formatMoney(money, "not a locale!").ok).toBe(false);
    expect(moneyToDecimalString(money)).toBe("1.00");
    const jpy = must(moneyFromMinorUnits(1234, "JPY"));
    expect(moneyToDecimalString(jpy)).toBe("1234");
    expect(isValidMoney({ amountMinor: 1.5, currency: "USD" })).toBe(false);
    expect(isValidMoney({ amountMinor: 1, currency: "ZZZ" })).toBe(false);
    expect(zeroMoney("USD")).toEqual({
      ok: true,
      value: { amountMinor: 0, currency: "USD" },
    });
  });
});
