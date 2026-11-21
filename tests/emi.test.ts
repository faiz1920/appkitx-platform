import { describe, expect, it } from "vitest";
import {
  MAX_EMI_MONTHS,
  calculateEmi,
  formatEmiDecimal,
  formatEmiMoney,
  tenureToMonths,
  type EmiIssue,
} from "../src/lib/emi";

const ok = (principal: number, rate: number, months: number) => {
  const result = calculateEmi(principal, rate, months);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(`expected ${principal}/${rate}/${months}`);
  return result.value;
};

const issue = (principal: number, rate: number, months: number) => {
  const result = calculateEmi(principal, rate, months);
  expect(result.ok).toBe(false);
  return result.ok ? null : result.issue;
};

describe("tenure conversion", () => {
  it("converts years and months", () => {
    expect(tenureToMonths(5, "years")).toBe(60);
    expect(tenureToMonths(1.5, "years")).toBe(18);
    expect(tenureToMonths(18, "months")).toBe(18);
  });

  it("keeps fractional month totals visible for validation", () => {
    expect(tenureToMonths(1.1, "years")).toBeCloseTo(13.2, 12);
    expect(tenureToMonths(1.5, "months")).toBe(1.5);
  });

  it("rejects non-positive and non-finite tenures", () => {
    expect(tenureToMonths(0, "months")).toBeNull();
    expect(tenureToMonths(-1, "years")).toBeNull();
    expect(tenureToMonths(Number.NaN, "months")).toBeNull();
    expect(tenureToMonths(Number.POSITIVE_INFINITY, "years")).toBeNull();
  });
});

describe("EMI calculation", () => {
  it("computes the standard reducing-balance EMI", () => {
    const result = ok(100000, 6, 360);
    expect(result.monthlyPayment).toBeCloseTo(599.55, 2);
    expect(result.months).toBe(360);
    expect(result.schedule).toHaveLength(360);
  });

  it("computes zero-interest EMI as principal divided by months", () => {
    const result = ok(12000, 0, 12);
    expect(result.monthlyPayment).toBe(1000);
    expect(result.totalInterest).toBe(0);
    expect(result.totalRepayment).toBe(12000);
  });

  it("prices a one-month loan at principal plus one month of interest", () => {
    const result = ok(1000, 12, 1);
    expect(result.monthlyPayment).toBeCloseTo(1010, 12);
    expect(result.totalInterest).toBeCloseTo(10, 12);
    expect(result.totalRepayment).toBeCloseTo(1010, 12);
    expect(result.schedule[0]?.principal).toBeCloseTo(1000, 12);
    expect(result.schedule[0]?.closingBalance).toBe(0);
  });

  it("scales linearly with principal", () => {
    const small = ok(10000, 7, 120);
    const large = ok(20000, 7, 120);
    expect(large.monthlyPayment).toBeCloseTo(small.monthlyPayment * 2, 8);
  });

  it("handles fractional and very small rates", () => {
    const fractional = ok(100000, 8.75, 60);
    expect(Number.isFinite(fractional.monthlyPayment)).toBe(true);

    const tiny = ok(100000, 0.000001, 360);
    expect(Number.isFinite(tiny.monthlyPayment)).toBe(true);
    expect(tiny.monthlyPayment).toBeCloseTo(100000 / 360, 4);
  });

  it("rejects fractional and out-of-range months", () => {
    expect(issue(1000, 6, 13.2)).toBe("invalid-months");
    expect(issue(1000, 6, 1.5)).toBe("invalid-months");
    expect(issue(1000, 6, 0)).toBe("invalid-months");
    expect(issue(1000, 6, MAX_EMI_MONTHS + 1)).toBe("invalid-months");
  });

  it("accepts the 1 and 1,200 month boundaries", () => {
    expect(ok(1000, 6, 1).schedule).toHaveLength(1);
    expect(ok(1000, 6, MAX_EMI_MONTHS).schedule).toHaveLength(MAX_EMI_MONTHS);
  });

  it("rejects invalid and non-finite inputs", () => {
    const cases: Array<[number, number, number, EmiIssue]> = [
      [0, 6, 60, "invalid-principal"],
      [-1, 6, 60, "invalid-principal"],
      [Number.NaN, 6, 60, "invalid-principal"],
      [1000, -1, 60, "invalid-rate"],
      [1000, Number.NaN, 60, "invalid-rate"],
      [1000, Number.POSITIVE_INFINITY, 60, "invalid-rate"],
      [1000, 6, Number.NaN, "invalid-months"],
    ];
    for (const [principal, rate, months, expected] of cases) {
      expect(issue(principal, rate, months)).toBe(expected);
    }
  });

  it("rejects overflow instead of returning non-finite values", () => {
    expect(issue(Number.MAX_VALUE, 6, MAX_EMI_MONTHS)).toBe("overflow");
    expect(issue(1000, Number.MAX_VALUE, 120)).toBe("overflow");
  });

  it("normalizes negative zero", () => {
    const zeroRate = ok(1000, 0, 1);
    expect(Object.is(zeroRate.totalInterest, -0)).toBe(false);
    expect(Object.is(zeroRate.totalRepayment, -0)).toBe(false);
  });
});

describe("amortization schedule", () => {
  it("breaks down the first installment", () => {
    const result = ok(100000, 6, 360);
    const first = result.schedule[0];
    expect(first).toBeDefined();
    expect(first?.paymentNumber).toBe(1);
    expect(first?.openingBalance).toBe(100000);
    expect(first?.interest).toBeCloseTo(500, 8);
    expect(first?.principal).toBeCloseTo(99.5505251528, 8);
    expect(first?.closingBalance).toBeCloseTo(99900.4494748472, 8);
  });

  it("reconciles the final installment to zero", () => {
    const result = ok(100000, 6, 360);
    const last = result.schedule[result.schedule.length - 1];
    expect(last).toBeDefined();
    expect(last?.closingBalance).toBe(0);
    expect(last?.principal).toBeCloseTo(last?.openingBalance ?? 0, 12);
    expect(last?.payment).toBeCloseTo(
      (last?.principal ?? 0) + (last?.interest ?? 0),
      12,
    );
  });

  it("sums principal and interest back to the totals", () => {
    const result = ok(100000, 6, 360);
    const principalPaid = result.schedule.reduce(
      (sum, row) => sum + row.principal,
      0,
    );
    const interestPaid = result.schedule.reduce(
      (sum, row) => sum + row.interest,
      0,
    );
    const totalPaid = result.schedule.reduce(
      (sum, row) => sum + row.payment,
      0,
    );

    expect(principalPaid).toBeCloseTo(100000, 8);
    expect(interestPaid).toBeCloseTo(result.totalInterest, 8);
    expect(totalPaid).toBeCloseTo(result.totalRepayment, 8);
  });

  it("builds a zero-interest schedule", () => {
    const result = ok(12000, 0, 12);
    for (const row of result.schedule) {
      expect(row.interest).toBe(0);
      expect(row.principal).toBe(1000);
    }
    expect(result.schedule[result.schedule.length - 1]?.closingBalance).toBe(0);
  });

  it("groups installments into annual summaries", () => {
    const result = ok(100000, 6, 360);
    expect(result.years).toHaveLength(30);
    expect(result.years[0]?.year).toBe(1);
    expect(result.years[0]?.openingBalance).toBe(100000);
    expect(result.years[0]?.installments).toHaveLength(12);
    expect(result.years[29]?.closingBalance).toBe(0);
    expect(result.years[29]?.installments).toHaveLength(12);

    const partial = ok(100000, 6, 18);
    expect(partial.years).toHaveLength(2);
    expect(partial.years[1]?.installments).toHaveLength(6);
  });

  it("keeps schedule totals finite for a long boundary loan", () => {
    const result = ok(1000, 6, MAX_EMI_MONTHS);
    expect(result.schedule).toHaveLength(MAX_EMI_MONTHS);
    expect(result.years.at(-1)?.closingBalance).toBe(0);
  });
});

describe("EMI display formatting", () => {
  it("formats money with two decimals and locale separators", () => {
    expect(formatEmiMoney(599.55, "en-US")).toBe("599.55");
    expect(formatEmiMoney(1000, "en-US")).toBe("1,000.00");
    expect(formatEmiMoney(12345.5, "es-ES")).toBe("12.345,50");
    expect(formatEmiMoney(-0, "en-US")).toBe("0.00");
  });

  it("formats rates without floating noise", () => {
    expect(formatEmiDecimal(8.5, "en-US")).toBe("8.5");
    expect(formatEmiDecimal(0.708333333333, "en-US")).toBe("0.708");
    expect(formatEmiDecimal(8.5, "es-ES")).toBe("8,5");
  });
});
