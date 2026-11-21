import { describe, expect, it } from "vitest";
import {
  MAX_COMPOUND_MONTHS,
  calculateCompoundInterest,
  durationToMonths,
  effectiveAnnualRatePercent,
  equivalentMonthlyRate,
  formatCompoundDecimal,
  formatCompoundMoney,
  type CompoundIssue,
  type CompoundingFrequency,
  type ContributionTiming,
} from "../src/lib/compound-interest";

/*
 * Closed-form and ledger comparisons use a fixed absolute tolerance. Values
 * in this suite stay well below 1e9, where IEEE-754 double arithmetic is
 * comfortably inside this bound.
 */
const TOLERANCE = 1e-6;

const expectClose = (
  actual: number,
  expected: number,
  tolerance = TOLERANCE,
) => {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
};

const ok = (
  principal: number,
  rate: number,
  months: number,
  frequency: CompoundingFrequency,
  contribution = 0,
  timing: ContributionTiming = "end",
) => {
  const result = calculateCompoundInterest(
    principal,
    rate,
    months,
    frequency,
    contribution,
    timing,
  );
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(`expected a result for ${principal}/${rate}`);
  return result.value;
};

const issue = (
  principal: number,
  rate: number,
  months: number,
  frequency: CompoundingFrequency,
  contribution = 0,
  timing: ContributionTiming = "end",
) => {
  const result = calculateCompoundInterest(
    principal,
    rate,
    months,
    frequency,
    contribution,
    timing,
  );
  expect(result.ok).toBe(false);
  return result.ok ? null : (result.issue as CompoundIssue);
};

const growth = (ratePercent: number, frequency: CompoundingFrequency) => {
  const periods: Record<CompoundingFrequency, number> = {
    annual: 1,
    semiannual: 2,
    quarterly: 4,
    monthly: 12,
    daily: 365,
  };
  return Math.pow(
    1 + ratePercent / 100 / periods[frequency],
    periods[frequency] / 12,
  );
};

const lumpSum = (
  principal: number,
  ratePercent: number,
  months: number,
  frequency: CompoundingFrequency,
) => principal * Math.pow(growth(ratePercent, frequency), months);

const annuity = (
  contribution: number,
  ratePercent: number,
  months: number,
  frequency: CompoundingFrequency,
  timing: ContributionTiming,
) => {
  const g = growth(ratePercent, frequency);
  const i = g - 1;
  if (i === 0) return contribution * months;
  const end = contribution * ((Math.pow(g, months) - 1) / i);
  return timing === "beginning" ? end * g : end;
};

describe("duration conversion", () => {
  it("converts years and months to months", () => {
    expect(durationToMonths(5, "years")).toBe(60);
    expect(durationToMonths(1.5, "years")).toBe(18);
    expect(durationToMonths(18, "months")).toBe(18);
    expect(durationToMonths(100, "years")).toBe(1200);
  });

  it("keeps fractional month totals visible for validation", () => {
    expect(durationToMonths(1.1, "years")).toBeCloseTo(13.2, 12);
    expect(durationToMonths(1.5, "months")).toBe(1.5);
    expect(durationToMonths(100.1, "years")).toBeCloseTo(1201.2, 12);
  });

  it("rejects non-positive, non-finite, and unknown units", () => {
    expect(durationToMonths(0, "years")).toBeNull();
    expect(durationToMonths(-1, "years")).toBeNull();
    expect(durationToMonths(Number.NaN, "months")).toBeNull();
    expect(durationToMonths(Number.POSITIVE_INFINITY, "years")).toBeNull();
    expect(durationToMonths(5, "weeks" as never)).toBeNull();
  });
});

describe("compounding frequencies", () => {
  it("derives an effective monthly rate for every supported frequency", () => {
    for (const frequency of [
      "annual",
      "semiannual",
      "quarterly",
      "monthly",
      "daily",
    ] as const) {
      const monthly = equivalentMonthlyRate(8, frequency);
      expect(monthly).not.toBeNull();
      expect(monthly).toBeGreaterThan(0);
      expect(monthly).toBeCloseTo(growth(8, frequency) - 1, 12);
    }
  });

  it("handles zero and invalid rates", () => {
    expect(equivalentMonthlyRate(0, "monthly")).toBe(0);
    expect(equivalentMonthlyRate(-1, "monthly")).toBeNull();
    expect(equivalentMonthlyRate(Number.NaN, "monthly")).toBeNull();
    expect(equivalentMonthlyRate(8, "weekly" as never)).toBeNull();
  });

  it("reports the effective annual rate and its monotonic growth", () => {
    const annual = effectiveAnnualRatePercent(8, "annual");
    const semiannual = effectiveAnnualRatePercent(8, "semiannual");
    const quarterly = effectiveAnnualRatePercent(8, "quarterly");
    const monthly = effectiveAnnualRatePercent(8, "monthly");
    const daily = effectiveAnnualRatePercent(8, "daily");

    expect(annual).toBeCloseTo(8, 12);
    expect(semiannual).toBeCloseTo(8.16, 12);
    expect(quarterly).toBeCloseTo(8.243216, 12);
    expectClose(monthly ?? 0, 8.299950681);
    expectClose(daily ?? 0, 8.327757179);
    expect(annual).toBeLessThan(semiannual ?? 0);
    expect(semiannual).toBeLessThan(quarterly ?? 0);
    expect(quarterly).toBeLessThan(monthly ?? 0);
    expect(monthly).toBeLessThan(daily ?? 0);
    expect(effectiveAnnualRatePercent(0, "daily")).toBe(0);
    expect(effectiveAnnualRatePercent(-1, "daily")).toBeNull();
  });

  it("produces higher growth at higher frequencies", () => {
    const values = [
      "annual",
      "semiannual",
      "quarterly",
      "monthly",
      "daily",
    ].map((frequency) => ok(10000, 8, 120, frequency as CompoundingFrequency));
    for (let index = 1; index < values.length; index += 1) {
      expect(values[index]?.finalValue).toBeGreaterThan(
        values[index - 1]?.finalValue ?? 0,
      );
    }
  });
});

describe("lump-sum compound interest", () => {
  it("matches the standard formula at every frequency", () => {
    for (const frequency of [
      "annual",
      "semiannual",
      "quarterly",
      "monthly",
      "daily",
    ] as const) {
      const result = ok(10000, 8, 120, frequency);
      expectClose(result.finalValue, lumpSum(10000, 8, 120, frequency));
      expect(result.totalContributions).toBe(0);
      expect(result.totalInvested).toBe(10000);
      expectClose(result.interestEarned, result.finalValue - 10000);
    }
  });

  it("returns the principal unchanged at zero interest", () => {
    for (const frequency of [
      "annual",
      "semiannual",
      "quarterly",
      "monthly",
      "daily",
    ] as const) {
      const result = ok(12000, 0, 60, frequency);
      expect(result.finalValue).toBe(12000);
      expect(result.totalInvested).toBe(12000);
      expect(result.interestEarned).toBe(0);
    }
  });

  it("scales linearly with the initial principal", () => {
    const small = ok(10000, 7.5, 120, "quarterly");
    const large = ok(20000, 7.5, 120, "quarterly");
    expectClose(large.finalValue, small.finalValue * 2);
    expectClose(large.interestEarned, small.interestEarned * 2);
  });

  it("handles fractional years expressed as whole months", () => {
    const result = ok(10000, 6, 30, "quarterly");
    expectClose(result.finalValue, lumpSum(10000, 6, 30, "quarterly"));
  });

  it("handles very small rates without cancellation", () => {
    const result = ok(100000, 0.000001, 360, "monthly");
    expect(Number.isFinite(result.finalValue)).toBe(true);
    expect(result.finalValue).toBeGreaterThan(100000);
    expect(result.finalValue).toBeLessThan(100000.1);
  });

  it("handles the maximum duration", () => {
    const result = ok(1000, 6, MAX_COMPOUND_MONTHS, "monthly");
    expect(result.ledger).toHaveLength(MAX_COMPOUND_MONTHS);
    expect(result.years).toHaveLength(100);
  });
});

describe("monthly contributions", () => {
  it("matches the end-of-month annuity formula", () => {
    const result = ok(0, 6, 120, "monthly", 1000, "end");
    expectClose(result.finalValue, annuity(1000, 6, 120, "monthly", "end"));
    expect(result.totalContributions).toBe(120000);
    expect(result.totalInvested).toBe(120000);
    expectClose(result.interestEarned, result.finalValue - 120000);
  });

  it("matches the beginning-of-month annuity formula", () => {
    const result = ok(0, 6, 120, "monthly", 1000, "beginning");
    expectClose(
      result.finalValue,
      annuity(1000, 6, 120, "monthly", "beginning"),
    );
    expect(result.totalContributions).toBe(120000);
    expect(result.finalValue).toBeGreaterThan(163879.35);
  });

  it("makes beginning-of-month contributions at least as valuable", () => {
    const end = ok(0, 8, 120, "monthly", 1000, "end");
    const beginning = ok(0, 8, 120, "monthly", 1000, "beginning");
    expect(beginning.finalValue).toBeGreaterThanOrEqual(end.finalValue);
    expectClose(beginning.finalValue, end.finalValue * growth(8, "monthly"));
  });

  it("supports contribution-only zero-interest plans", () => {
    const result = ok(0, 0, 60, "monthly", 1000, "end");
    expect(result.finalValue).toBe(60000);
    expect(result.totalContributions).toBe(60000);
    expect(result.interestEarned).toBe(0);
  });

  it("combines initial principal and contributions", () => {
    const result = ok(10000, 8, 120, "monthly", 1000, "end");
    expectClose(
      result.finalValue,
      lumpSum(10000, 8, 120, "monthly") +
        annuity(1000, 8, 120, "monthly", "end"),
    );
    expect(result.totalInvested).toBe(130000);
    expectClose(result.interestEarned, result.finalValue - 130000);
  });

  it("has no timing effect when the contribution is zero", () => {
    const end = ok(10000, 6, 60, "monthly", 0, "end");
    const beginning = ok(10000, 6, 60, "monthly", 0, "beginning");
    expect(beginning.finalValue).toBe(end.finalValue);
  });
});

describe("annual ledger", () => {
  it("groups 12 months at a time and reconciles the final balance", () => {
    const result = ok(10000, 8, 120, "monthly", 1000, "end");
    expect(result.years).toHaveLength(10);
    expect(result.years[0]?.openingBalance).toBe(10000);
    expect(result.years[0]?.months).toBe(12);
    expect(result.years.at(-1)?.months).toBe(12);
    expect(result.years.at(-1)?.closingBalance).toBe(result.finalValue);

    for (let index = 0; index < result.years.length; index += 1) {
      const year = result.years[index];
      if (!year) throw new Error("missing year");
      expectClose(
        year.closingBalance,
        year.openingBalance + year.contributions + year.interest,
      );
      if (index > 0) {
        expect(year.openingBalance).toBe(
          result.years[index - 1]?.closingBalance,
        );
      }
    }

    const contributions = result.years.reduce(
      (sum, year) => sum + year.contributions,
      0,
    );
    const interest = result.years.reduce((sum, year) => sum + year.interest, 0);
    expectClose(contributions, result.totalContributions);
    expectClose(interest, result.interestEarned);
  });

  it("supports a partial final year", () => {
    const result = ok(10000, 6, 30, "quarterly", 500, "beginning");
    expect(result.years).toHaveLength(3);
    expect(result.years[0]?.months).toBe(12);
    expect(result.years[1]?.months).toBe(12);
    expect(result.years[2]?.months).toBe(6);
    expect(result.years[2]?.contributions).toBe(3000);
    expect(result.years.at(-1)?.closingBalance).toBe(result.finalValue);
  });

  it("keeps the ledger opening and closing balances linked", () => {
    const result = ok(10000, 8, 120, "monthly", 1000, "end");
    for (let index = 1; index < result.ledger.length; index += 1) {
      expect(result.ledger[index]?.openingBalance).toBe(
        result.ledger[index - 1]?.closingBalance,
      );
    }
    expect(result.ledger[0]?.openingBalance).toBe(10000);
    expect(result.ledger.at(-1)?.closingBalance).toBe(result.finalValue);
  });

  it("reconciles the closed-form final value with the ledger", () => {
    for (const frequency of [
      "annual",
      "semiannual",
      "quarterly",
      "monthly",
      "daily",
    ] as const) {
      for (const timing of ["end", "beginning"] as const) {
        const result = ok(10000, 8, 120, frequency, 1000, timing);
        const expected =
          lumpSum(10000, 8, 120, frequency) +
          annuity(1000, 8, 120, frequency, timing);
        expectClose(result.finalValue, expected);
        expectClose(
          result.finalValue,
          result.ledger.at(-1)?.closingBalance ?? 0,
        );
      }
    }
  });
});

describe("validation and overflow", () => {
  it("rejects negative and non-finite principal", () => {
    expect(issue(-1, 6, 60, "monthly")).toBe("invalid-principal");
    expect(issue(Number.NaN, 6, 60, "monthly")).toBe("invalid-principal");
    expect(issue(Number.POSITIVE_INFINITY, 6, 60, "monthly")).toBe(
      "invalid-principal",
    );
  });

  it("rejects negative and non-finite rates", () => {
    expect(issue(1000, -1, 60, "monthly")).toBe("invalid-rate");
    expect(issue(1000, Number.NaN, 60, "monthly")).toBe("invalid-rate");
    expect(issue(1000, Number.POSITIVE_INFINITY, 60, "monthly")).toBe(
      "invalid-rate",
    );
  });

  it("rejects fractional and out-of-range months", () => {
    expect(issue(1000, 6, 13.2, "monthly")).toBe("invalid-months");
    expect(issue(1000, 6, 0, "monthly")).toBe("invalid-months");
    expect(issue(1000, 6, MAX_COMPOUND_MONTHS + 1, "monthly")).toBe(
      "invalid-months",
    );
  });

  it("rejects negative and non-finite contributions", () => {
    expect(issue(0, 6, 60, "monthly", -1)).toBe("invalid-contribution");
    expect(issue(0, 6, 60, "monthly", Number.NaN)).toBe("invalid-contribution");
  });

  it("rejects unsupported frequencies and timings", () => {
    expect(issue(1000, 6, 60, "weekly" as never)).toBe("invalid-frequency");
    expect(issue(1000, 6, 60, "monthly", 0, "middle" as never)).toBe(
      "invalid-timing",
    );
  });

  it("requires a positive investment", () => {
    expect(issue(0, 6, 60, "monthly", 0)).toBe("no-investment");
    expect(ok(0, 6, 60, "monthly", 100).finalValue).toBeGreaterThan(0);
  });

  it("returns overflow instead of non-finite results", () => {
    expect(issue(Number.MAX_VALUE, 6, 1200, "monthly")).toBe("overflow");
    expect(issue(1000, Number.MAX_VALUE, 120, "monthly")).toBe("overflow");
  });

  it("normalizes negative zero", () => {
    const result = ok(1000, 0, 1, "monthly");
    expect(Object.is(result.interestEarned, -0)).toBe(false);
    expect(Object.is(result.finalValue, -0)).toBe(false);
    expect(Object.is(result.totalInvested, -0)).toBe(false);
  });
});

describe("formatting", () => {
  it("formats money with exactly two decimals and no currency symbol", () => {
    expect(formatCompoundMoney(16288.95, "en-US")).toBe("16,288.95");
    expect(formatCompoundMoney(16288.95, "es-ES")).toBe("16.288,95");
    expect(formatCompoundMoney(0, "en-US")).toBe("0.00");
    for (const value of ["16,288.95", "16.288,95", "0.00"]) {
      expect(value).not.toMatch(/[$₹€]/);
    }
  });

  it("formats rates without floating noise", () => {
    expect(formatCompoundDecimal(0.4166666667, "en-US")).toBe("0.417");
    expect(formatCompoundDecimal(0.4166666667, "es-ES")).toBe("0,417");
    expect(formatCompoundDecimal(-0, "en-US")).toBe("0");
  });

  it("formats the standard and contribution scenarios", () => {
    const lump = ok(10000, 8, 120, "annual");
    expect(formatCompoundMoney(lump.finalValue, "en-US")).toBe("21,589.25");

    const withContributions = ok(10000, 8, 120, "monthly", 1000, "end");
    expect(formatCompoundMoney(withContributions.finalValue, "en-US")).toBe(
      "205,142.44",
    );
  });
});
