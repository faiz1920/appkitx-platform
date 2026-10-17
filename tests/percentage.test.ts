import { describe, expect, it } from "vitest";
import {
  calculate,
  describeFormula,
  describeResult,
  formatNumber,
  formulaTemplate,
  percentChange,
  percentOf,
  whatPercent,
} from "../src/lib/percentage";

describe("percentOf", () => {
  it("computes a percentage of a positive number", () => {
    expect(percentOf(25, 80)).toBe(20);
  });

  it("handles decimal percentages and values", () => {
    expect(percentOf(7.5, 200)).toBe(15);
    expect(percentOf(0.1, 0.2)).toBeCloseTo(0.0002, 10);
  });

  it("returns zero when either operand is zero", () => {
    expect(percentOf(0, 50)).toBe(0);
    expect(percentOf(12.5, 0)).toBe(0);
  });

  it("does not clamp negative inputs", () => {
    expect(percentOf(-10, 50)).toBe(-5);
    expect(percentOf(10, -50)).toBe(-5);
  });

  it("returns null for non-finite inputs", () => {
    expect(percentOf(NaN, 50)).toBeNull();
    expect(percentOf(10, Infinity)).toBeNull();
  });
});

describe("whatPercent", () => {
  it("computes the share of a whole", () => {
    expect(whatPercent(20, 80)).toBe(25);
    expect(whatPercent(30, 40)).toBe(75);
  });

  it("keeps full precision for repeating results", () => {
    expect(whatPercent(1, 3)).toBeCloseTo(33.333333, 5);
  });

  it("handles zero and negative values", () => {
    expect(whatPercent(0, 80)).toBe(0);
    expect(whatPercent(-20, 80)).toBe(-25);
    expect(whatPercent(20, -80)).toBe(-25);
  });

  it("returns null for a zero whole instead of Infinity or NaN", () => {
    expect(whatPercent(20, 0)).toBeNull();
  });

  it("returns null for non-finite inputs", () => {
    expect(whatPercent(NaN, 80)).toBeNull();
    expect(whatPercent(20, NaN)).toBeNull();
  });
});

describe("percentChange", () => {
  it("reports an increase as a positive number", () => {
    expect(percentChange(80, 100)).toBe(25);
  });

  it("reports a decrease as a negative number", () => {
    expect(percentChange(100, 80)).toBe(-20);
  });

  it("reports no change as zero", () => {
    expect(percentChange(50, 50)).toBe(0);
  });

  it("handles a zero target value", () => {
    expect(percentChange(50, 0)).toBe(-100);
  });

  it("applies the formula literally to negative originals", () => {
    expect(percentChange(-50, 50)).toBe(-200);
  });

  it("returns null for a zero original value", () => {
    expect(percentChange(0, 50)).toBeNull();
  });

  it("returns null for non-finite inputs", () => {
    expect(percentChange(NaN, 50)).toBeNull();
    expect(percentChange(50, NaN)).toBeNull();
  });
});

describe("calculate", () => {
  it("routes each mode to its function", () => {
    expect(calculate("percent-of", 25, 80)).toBe(20);
    expect(calculate("what-percent", 20, 80)).toBe(25);
    expect(calculate("percent-change", 80, 100)).toBe(25);
    expect(calculate("percent-change", 0, 100)).toBeNull();
  });
});

describe("formatNumber", () => {
  it("trims unnecessary trailing zeros", () => {
    expect(formatNumber(20)).toBe("20");
    expect(formatNumber(20.5)).toBe("20.5");
    expect(formatNumber(0.3 + 0)).toBe("0.3");
  });

  it("rounds only for presentation", () => {
    expect(formatNumber(0.30000000000000004)).toBe("0.3");
    expect(formatNumber(33.333333333333336)).toBe("33.333333");
  });

  it("groups thousands", () => {
    expect(formatNumber(1234567.89)).toBe("1,234,567.89");
  });

  it("normalizes negative zero", () => {
    expect(formatNumber(-0)).toBe("0");
  });
});

describe("describeFormula", () => {
  it("substitutes entered values per mode", () => {
    expect(describeFormula("percent-of", 25, 80, 20)).toBe(
      "(25 ÷ 100) × 80 = 20",
    );
    expect(describeFormula("what-percent", 20, 80, 25)).toBe(
      "(20 ÷ 80) × 100 = 25",
    );
    expect(describeFormula("percent-change", 80, 100, 25)).toBe(
      "((100 − 80) ÷ 80) × 100 = 25",
    );
  });
});

describe("formulaTemplate", () => {
  it("returns the unsubstituted formula for each mode", () => {
    expect(formulaTemplate("percent-of")).toBe("(X ÷ 100) × Y");
    expect(formulaTemplate("what-percent")).toBe("(X ÷ Y) × 100");
    expect(formulaTemplate("percent-change")).toBe(
      "((To − From) ÷ From) × 100",
    );
  });
});

describe("describeResult", () => {
  it("formats each mode for display", () => {
    expect(describeResult("percent-of", 20)).toBe("20");
    expect(describeResult("what-percent", 25)).toBe("25%");
  });

  it("distinguishes increase, decrease, and no change", () => {
    expect(describeResult("percent-change", 25)).toBe("25% increase");
    expect(describeResult("percent-change", -20)).toBe("20% decrease");
    expect(describeResult("percent-change", 0)).toBe("0%");
  });
});
