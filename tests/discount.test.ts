import { describe, expect, it } from "vitest";
import {
  calculateDiscount,
  describeFormulas,
  formatAmount,
  formulaTemplate,
} from "../src/lib/discount";

describe("calculateDiscount", () => {
  it("computes savings and final price for a standard discount", () => {
    expect(calculateDiscount(100, 20)).toEqual({ savings: 20, finalPrice: 80 });
    expect(calculateDiscount(49.99, 12.5)).toEqual({
      savings: 6.24875,
      finalPrice: 43.74125,
    });
  });

  it("supports decimal prices and percentages with full precision", () => {
    const result = calculateDiscount(19.99, 15);
    if (!result) throw new Error("expected a result");
    expect(result.savings).toBeCloseTo(2.9985, 10);
    expect(result.finalPrice).toBeCloseTo(16.9915, 10);
  });

  it("handles a zero price", () => {
    expect(calculateDiscount(0, 25)).toEqual({ savings: 0, finalPrice: 0 });
  });

  it("handles a zero discount", () => {
    expect(calculateDiscount(49.99, 0)).toEqual({
      savings: 0,
      finalPrice: 49.99,
    });
  });

  it("handles a full 100% discount", () => {
    expect(calculateDiscount(100, 100)).toEqual({
      savings: 100,
      finalPrice: 0,
    });
  });

  it("accepts the inclusive boundaries", () => {
    expect(calculateDiscount(0, 0)).toEqual({ savings: 0, finalPrice: 0 });
    expect(calculateDiscount(0, 100)).toEqual({ savings: 0, finalPrice: 0 });
    expect(calculateDiscount(100, 0)).toEqual({
      savings: 0,
      finalPrice: 100,
    });
  });

  it("returns null for a negative price", () => {
    expect(calculateDiscount(-1, 20)).toBeNull();
    expect(calculateDiscount(-0.01, 0)).toBeNull();
  });

  it("returns null for out-of-range discount percentages", () => {
    expect(calculateDiscount(100, -5)).toBeNull();
    expect(calculateDiscount(100, 100.5)).toBeNull();
    expect(calculateDiscount(100, 101)).toBeNull();
  });

  it("returns null for non-finite inputs", () => {
    expect(calculateDiscount(NaN, 20)).toBeNull();
    expect(calculateDiscount(100, NaN)).toBeNull();
    expect(calculateDiscount(Infinity, 20)).toBeNull();
    expect(calculateDiscount(100, Infinity)).toBeNull();
  });

  it("never produces NaN or Infinity for valid inputs", () => {
    const cases = [
      [0, 0],
      [1, 100],
      [0.01, 0.5],
      [1e9, 100],
      [49.99, 12.5],
    ] as const;
    for (const [price, discount] of cases) {
      const result = calculateDiscount(price, discount);
      if (!result)
        throw new Error(`expected a result for ${price}/${discount}`);
      expect(Number.isFinite(result.savings)).toBe(true);
      expect(Number.isFinite(result.finalPrice)).toBe(true);
    }
  });
});

describe("formatAmount", () => {
  it("trims trailing zeros and caps at two decimals", () => {
    expect(formatAmount(80)).toBe("80");
    expect(formatAmount(16.9915)).toBe("16.99");
    expect(formatAmount(2.9985)).toBe("3");
    expect(formatAmount(0.5)).toBe("0.5");
  });

  it("groups thousands", () => {
    expect(formatAmount(1234.5)).toBe("1,234.5");
  });

  it("normalizes negative zero", () => {
    expect(formatAmount(-0)).toBe("0");
  });
});

describe("formula helpers", () => {
  it("returns the unsubstituted template", () => {
    expect(formulaTemplate()).toBe(
      "discount = (price × percent) ÷ 100 · final = price − discount",
    );
  });

  it("substitutes entered and computed values", () => {
    expect(describeFormulas(100, 20, 20, 80)).toBe(
      "discount = (100 × 20) ÷ 100 = 20 · final = 100 − 20 = 80",
    );
    expect(describeFormulas(19.99, 15, 2.9985, 16.9915)).toBe(
      "discount = (19.99 × 15) ÷ 100 = 3 · final = 19.99 − 3 = 16.99",
    );
  });
});
