import { describe, expect, it } from "vitest";
import {
  calculateLoan,
  describeLoanFormula,
  formatDecimal,
  formatMoney,
  MAX_LOAN_MONTHS,
  termToMonths,
} from "../src/lib/loan";

describe("termToMonths", () => {
  it("converts years and months to months", () => {
    expect(termToMonths(5, "years")).toBe(60);
    expect(termToMonths(1.5, "years")).toBe(18);
    expect(termToMonths(18, "months")).toBe(18);
  });

  it("rejects non-positive and non-finite terms", () => {
    expect(termToMonths(0, "years")).toBeNull();
    expect(termToMonths(-1, "months")).toBeNull();
    expect(termToMonths(Number.NaN, "years")).toBeNull();
    expect(termToMonths(Number.POSITIVE_INFINITY, "months")).toBeNull();
  });
});

describe("calculateLoan", () => {
  it("computes the standard annuity payment", () => {
    const result = calculateLoan(100000, 6, 360);
    expect(result).not.toBeNull();
    expect(result?.monthlyPayment).toBeCloseTo(599.55, 2);
    expect(result?.months).toBe(360);
  });

  it("keeps total payable and interest consistent", () => {
    const result = calculateLoan(100000, 8.5, 60);
    expect(result).not.toBeNull();
    if (result === null) return;
    expect(result.totalPayable).toBeCloseTo(
      result.monthlyPayment * result.months,
      10,
    );
    expect(result.totalInterest).toBeCloseTo(result.totalPayable - 100000, 10);
    // The balance amortizes to zero at the quoted payment.
    const r = 8.5 / 100 / 12;
    const presentValue =
      (result.monthlyPayment * (1 - Math.pow(1 + r, -result.months))) / r;
    expect(presentValue).toBeCloseTo(100000, 6);
  });

  it("handles a zero rate as a plain division", () => {
    const result = calculateLoan(12000, 0, 12);
    expect(result).not.toBeNull();
    expect(result?.monthlyPayment).toBe(1000);
    expect(result?.totalInterest).toBe(0);
    expect(result?.totalPayable).toBe(12000);
  });

  it("prices a one-month loan at principal plus one month of interest", () => {
    const result = calculateLoan(1000, 12, 1);
    expect(result).not.toBeNull();
    expect(result?.monthlyPayment).toBeCloseTo(1010, 10);
    expect(result?.totalInterest).toBeCloseTo(10, 10);
  });

  it("scales with the principal", () => {
    const small = calculateLoan(10000, 7, 120);
    const large = calculateLoan(20000, 7, 120);
    expect(small).not.toBeNull();
    expect(large).not.toBeNull();
    expect(large?.monthlyPayment).toBeCloseTo(
      (small?.monthlyPayment ?? 0) * 2,
      8,
    );
  });

  it("rejects invalid principal, rate, or term", () => {
    expect(calculateLoan(0, 6, 60)).toBeNull();
    expect(calculateLoan(-1000, 6, 60)).toBeNull();
    expect(calculateLoan(1000, -1, 60)).toBeNull();
    expect(calculateLoan(1000, 6, 0)).toBeNull();
    expect(calculateLoan(1000, 6, 0.5)).toBeNull();
    expect(calculateLoan(1000, 6, MAX_LOAN_MONTHS + 1)).toBeNull();
    expect(calculateLoan(Number.NaN, 6, 60)).toBeNull();
    expect(calculateLoan(1000, Number.POSITIVE_INFINITY, 60)).toBeNull();
  });

  it("returns null instead of Infinity for an overflowing term", () => {
    expect(calculateLoan(1000, 100, MAX_LOAN_MONTHS)).not.toBeNull();
    expect(calculateLoan(Number.MAX_VALUE, 100, MAX_LOAN_MONTHS)).toBeNull();
  });
});

describe("formatMoney", () => {
  it("always shows two decimals", () => {
    expect(formatMoney(599.55)).toBe("599.55");
    expect(formatMoney(1000)).toBe("1,000.00");
    expect(formatMoney(0)).toBe("0.00");
  });

  it("formats with the locale's conventions", () => {
    expect(formatMoney(12345.5, "es-ES")).toBe("12.345,50");
    expect(formatMoney(1234.5, "es-ES")).toBe("1234,50");
    expect(formatMoney(599.55, "es-ES")).toBe("599,55");
  });

  it("normalizes negative zero", () => {
    expect(formatMoney(-0)).toBe("0.00");
  });
});

describe("formatDecimal", () => {
  it("trims noise without losing meaningful decimals", () => {
    expect(formatDecimal(8.5)).toBe("8.5");
    expect(formatDecimal(0.7083333333333334)).toBe("0.708");
    expect(formatDecimal(60)).toBe("60");
  });

  it("formats with the locale's conventions", () => {
    expect(formatDecimal(8.5, "es-ES")).toBe("8,5");
  });
});

describe("describeLoanFormula", () => {
  it("substitutes the annual and monthly rates", () => {
    expect(
      describeLoanFormula(8.5, "{rate}% ÷ 12 = {monthlyRate}% per month"),
    ).toBe("8.5% ÷ 12 = 0.708% per month");
  });

  it("uses the locale's number format", () => {
    expect(
      describeLoanFormula(
        8.5,
        "{rate} % ÷ 12 = {monthlyRate} % al mes",
        "es-ES",
      ),
    ).toBe("8,5 % ÷ 12 = 0,708 % al mes");
  });
});
