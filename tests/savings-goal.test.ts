import { describe, expect, it } from "vitest";
import {
  MAX_SAVINGS_MONTHS,
  calculateSavingsGoal,
  durationToMonths,
  formatSavingsDecimal,
  formatSavingsMoney,
  formatSavingsPercent,
  type CompoundingFrequency,
  type ContributionTiming,
  type SavingsGoalIssue,
} from "../src/lib/savings-goal";

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
): void => {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
};

const growth = (
  ratePercent: number,
  frequency: CompoundingFrequency,
): number => {
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

const exactRequired = (
  target: number,
  current: number,
  ratePercent: number,
  months: number,
  frequency: CompoundingFrequency,
  timing: ContributionTiming,
): number => {
  const g = growth(ratePercent, frequency);
  const i = g - 1;
  const totalGrowth = Math.pow(g, months);
  const initialFutureValue = current * totalGrowth;
  if (target <= initialFutureValue) return 0;
  if (i === 0) return (target - current) / months;
  const factor = ((totalGrowth - 1) / i) * (timing === "beginning" ? g : 1);
  return (target - initialFutureValue) / factor;
};

const roundedUp = (value: number): number =>
  value <= 0 ? 0 : Math.ceil(value * 100 - 1e-9) / 100;

const independentFinal = (
  current: number,
  contribution: number,
  ratePercent: number,
  months: number,
  frequency: CompoundingFrequency,
  timing: ContributionTiming,
): number => {
  const i = growth(ratePercent, frequency) - 1;
  let balance = current;
  for (let month = 1; month <= months; month += 1) {
    balance =
      timing === "beginning"
        ? (balance + contribution) * (1 + i)
        : balance * (1 + i) + contribution;
  }
  return balance;
};

const ok = (
  target: number,
  current: number,
  ratePercent: number,
  months: number,
  frequency: CompoundingFrequency,
  timing: ContributionTiming = "end",
) => {
  const result = calculateSavingsGoal(
    target,
    current,
    ratePercent,
    months,
    frequency,
    timing,
  );
  if (!result.ok) {
    throw new Error(
      `expected a result for ${target}/${current}/${ratePercent}: ${result.issue}`,
    );
  }
  return result.value;
};

const issue = (
  target: number,
  current: number,
  ratePercent: number,
  months: number,
  frequency: CompoundingFrequency,
  timing: ContributionTiming = "end",
) => {
  const result = calculateSavingsGoal(
    target,
    current,
    ratePercent,
    months,
    frequency,
    timing,
  );
  expect(result.ok).toBe(false);
  return result.ok ? null : (result.issue as SavingsGoalIssue);
};

describe("duration conversion", () => {
  it("converts years and months to months", () => {
    expect(durationToMonths(5, "years")).toBe(60);
    expect(durationToMonths(1.5, "years")).toBe(18);
    expect(durationToMonths(30, "months")).toBe(30);
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

describe("required monthly savings", () => {
  it("computes a zero-interest plan", () => {
    const result = ok(70000, 10000, 0, 60, "monthly");
    expect(result.exactMonthlySavings).toBe(1000);
    expect(result.requiredMonthlySavings).toBe(1000);
    expect(result.totalContributions).toBe(60000);
    expect(result.totalInvested).toBe(70000);
    expect(result.projectedFinalSavings).toBe(70000);
    expect(result.interestEarned).toBe(0);
    expect(result.remainingAmount).toBe(60000);
    expect(result.alreadyReached).toBe(false);
    expect(result.noContributionRequired).toBe(false);
  });

  it("rounds a zero-interest contribution up to the next cent", () => {
    const result = ok(10000, 0, 0, 12, "monthly");
    expect(result.exactMonthlySavings).toBeCloseTo(833.3333333333, 9);
    expect(result.requiredMonthlySavings).toBe(833.34);
    expect(result.projectedFinalSavings).toBe(10000.08);
    expect(result.projectedFinalSavings).toBeGreaterThanOrEqual(10000);
    expect(result.interestEarned).toBe(0);
  });

  it("handles existing savings with zero interest", () => {
    const result = ok(20000, 5000, 0, 12, "monthly");
    expect(result.requiredMonthlySavings).toBe(1250);
    expect(result.projectedFinalSavings).toBe(20000);
    expect(result.totalContributions).toBe(15000);
  });

  it("computes a positive-interest end-of-month plan", () => {
    const result = ok(100000, 10000, 8, 60, "monthly", "end");
    expect(result.exactMonthlySavings).toBeCloseTo(1158.2088192905678, 8);
    expect(result.requiredMonthlySavings).toBe(1158.21);
    expect(result.projectedFinalSavings).toBeGreaterThanOrEqual(100000);
    expect(result.projectedFinalSavings).toBeCloseTo(100000.0867548, 6);
    expect(result.totalContributions).toBeCloseTo(69492.6, 8);
    expect(result.remainingAmount).toBe(90000);
  });

  it("computes a lower beginning-of-month contribution", () => {
    const end = ok(100000, 10000, 8, 60, "monthly", "end");
    const beginning = ok(100000, 10000, 8, 60, "monthly", "beginning");
    expect(beginning.requiredMonthlySavings).toBe(1150.54);
    expect(beginning.requiredMonthlySavings).toBeLessThan(
      end.requiredMonthlySavings,
    );
    expect(beginning.projectedFinalSavings).toBeGreaterThanOrEqual(100000);
    expect(beginning.projectedFinalSavings).toBeCloseTo(100000.1063486, 6);
  });

  it("supports a contribution-only plan", () => {
    const result = ok(12000, 0, 0, 12, "monthly");
    expect(result.requiredMonthlySavings).toBe(1000);
    expect(result.projectedFinalSavings).toBe(12000);
    expect(result.totalContributions).toBe(12000);
  });

  it("supports the minimum and maximum durations", () => {
    const one = ok(1000, 0, 0, 1, "monthly");
    expect(one.requiredMonthlySavings).toBe(1000);
    expect(one.years).toHaveLength(1);
    expect(one.years[0]?.months).toBe(1);

    const max = ok(120000, 0, 0, MAX_SAVINGS_MONTHS, "monthly");
    expect(max.requiredMonthlySavings).toBe(100);
    expect(max.years).toHaveLength(100);
  });

  it("matches the independent closed-form result for all frequencies", () => {
    for (const frequency of [
      "annual",
      "semiannual",
      "quarterly",
      "monthly",
      "daily",
    ] as const) {
      for (const timing of ["end", "beginning"] as const) {
        const exact = exactRequired(100000, 10000, 8, 60, frequency, timing);
        const result = ok(100000, 10000, 8, 60, frequency, timing);
        expectClose(result.exactMonthlySavings, exact);
        expect(result.requiredMonthlySavings).toBe(roundedUp(exact));
        expect(result.projectedFinalSavings).toBeGreaterThanOrEqual(100000);
      }
    }
  });

  it("requires less monthly savings at higher compounding frequency", () => {
    const required = [
      "annual",
      "semiannual",
      "quarterly",
      "monthly",
      "daily",
    ].map(
      (frequency) =>
        ok(100000, 10000, 8, 60, frequency as CompoundingFrequency)
          .requiredMonthlySavings,
    );
    for (let index = 1; index < required.length; index += 1) {
      expect(required[index]).toBeLessThan(required[index - 1] ?? 0);
    }
  });

  it("handles a very small positive rate", () => {
    const result = ok(100000, 10000, 0.000001, 1200, "daily");
    expect(Number.isFinite(result.requiredMonthlySavings)).toBe(true);
    expect(result.requiredMonthlySavings).toBeGreaterThan(0);
    expect(result.projectedFinalSavings).toBeGreaterThanOrEqual(100000);
  });
});

describe("success states", () => {
  it("treats current savings at or above the target as already reached", () => {
    const result = ok(50000, 60000, 5, 60, "monthly");
    expect(result.alreadyReached).toBe(true);
    expect(result.noContributionRequired).toBe(true);
    expect(result.requiredMonthlySavings).toBe(0);
    expect(result.totalContributions).toBe(0);
    expect(result.remainingAmount).toBe(0);
    expect(result.progressPercent).toBe(100);
    expect(result.projectedFinalSavings).toBeGreaterThanOrEqual(60000);
    expect(result.interestEarned).toBeGreaterThan(0);
  });

  it("treats an equal current balance as already reached", () => {
    const result = ok(50000, 50000, 0, 60, "monthly");
    expect(result.alreadyReached).toBe(true);
    expect(result.noContributionRequired).toBe(true);
    expect(result.requiredMonthlySavings).toBe(0);
    expect(result.projectedFinalSavings).toBe(50000);
    expect(result.interestEarned).toBe(0);
  });

  it("supports interest-only target attainment", () => {
    const result = ok(15000, 10000, 10, 60, "monthly");
    expect(result.alreadyReached).toBe(false);
    expect(result.noContributionRequired).toBe(true);
    expect(result.requiredMonthlySavings).toBe(0);
    expect(result.remainingAmount).toBe(0);
    expect(result.projectedFinalSavings).toBeCloseTo(16453.0893478, 6);
    expect(result.interestEarned).toBeCloseTo(6453.0893478, 6);
    expect(result.progressPercent).toBeCloseTo(66.6666667, 6);
  });

  it("shows interest-only growth in the annual table", () => {
    const result = ok(15000, 10000, 10, 60, "monthly");
    expect(result.years).toHaveLength(5);
    expect(result.years.every((year) => year.contributions === 0)).toBe(true);
    expect(result.years.at(-1)?.closingBalance).toBe(
      result.projectedFinalSavings,
    );
    expect(result.years.at(-1)?.progressPercent).toBe(100);
  });
});

describe("annual ledger", () => {
  it("groups full years and a partial final year", () => {
    const result = ok(50000, 10000, 6, 30, "quarterly");
    expect(result.years).toHaveLength(3);
    expect(result.years[0]?.months).toBe(12);
    expect(result.years[1]?.months).toBe(12);
    expect(result.years[2]?.months).toBe(6);
    expectClose(
      result.years[2]?.contributions ?? 0,
      result.requiredMonthlySavings * 6,
    );
    expect(result.years.at(-1)?.closingBalance).toBe(
      result.projectedFinalSavings,
    );
    expect(result.projectedFinalSavings).toBeGreaterThanOrEqual(50000);
  });

  it("reconciles each annual row", () => {
    const result = ok(50000, 10000, 6, 30, "quarterly", "beginning");
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
  });

  it("links the monthly ledger to the annual table", () => {
    const result = ok(50000, 10000, 6, 30, "quarterly");
    for (let index = 1; index < result.ledger.length; index += 1) {
      expect(result.ledger[index]?.openingBalance).toBe(
        result.ledger[index - 1]?.closingBalance,
      );
    }
    expect(result.ledger[0]?.openingBalance).toBe(10000);
    expect(result.ledger.at(-1)?.closingBalance).toBe(
      result.projectedFinalSavings,
    );
    const contributions = result.years.reduce(
      (sum, year) => sum + year.contributions,
      0,
    );
    const interest = result.years.reduce((sum, year) => sum + year.interest, 0);
    expectClose(contributions, result.totalContributions);
    expectClose(interest, result.interestEarned);
  });

  it("matches an independent ledger for every frequency and timing", () => {
    for (const frequency of [
      "annual",
      "semiannual",
      "quarterly",
      "monthly",
      "daily",
    ] as const) {
      for (const timing of ["end", "beginning"] as const) {
        const result = ok(100000, 10000, 8, 60, frequency, timing);
        const expectedFinal = independentFinal(
          10000,
          result.requiredMonthlySavings,
          8,
          60,
          frequency,
          timing,
        );
        expectClose(result.projectedFinalSavings, expectedFinal);
        expect(result.projectedFinalSavings).toBeGreaterThanOrEqual(100000);
      }
    }
  });

  it("computes the final target with zero interest", () => {
    const result = ok(70000, 10000, 0, 60, "monthly");
    expectClose(
      result.projectedFinalSavings,
      independentFinal(10000, 1000, 0, 60, "monthly", "end"),
    );
    expect(result.projectedFinalSavings).toBe(70000);
  });
});

describe("validation and overflow", () => {
  it("rejects zero and negative targets", () => {
    expect(issue(0, 0, 6, 60, "monthly")).toBe("invalid-target");
    expect(issue(-1, 0, 6, 60, "monthly")).toBe("invalid-target");
    expect(issue(Number.NaN, 0, 6, 60, "monthly")).toBe("invalid-target");
    expect(issue(Number.POSITIVE_INFINITY, 0, 6, 60, "monthly")).toBe(
      "invalid-target",
    );
  });

  it("rejects negative and non-finite current savings", () => {
    expect(issue(1000, -1, 6, 60, "monthly")).toBe("invalid-current");
    expect(issue(1000, Number.NaN, 6, 60, "monthly")).toBe("invalid-current");
    expect(issue(1000, Number.POSITIVE_INFINITY, 6, 60, "monthly")).toBe(
      "invalid-current",
    );
  });

  it("rejects negative and non-finite rates", () => {
    expect(issue(1000, 0, -1, 60, "monthly")).toBe("invalid-rate");
    expect(issue(1000, 0, Number.NaN, 60, "monthly")).toBe("invalid-rate");
    expect(issue(1000, 0, Number.POSITIVE_INFINITY, 60, "monthly")).toBe(
      "invalid-rate",
    );
  });

  it("rejects fractional and out-of-range months", () => {
    expect(issue(1000, 0, 6, 13.2, "monthly")).toBe("invalid-months");
    expect(issue(1000, 0, 6, 0, "monthly")).toBe("invalid-months");
    expect(issue(1000, 0, 6, MAX_SAVINGS_MONTHS + 1, "monthly")).toBe(
      "invalid-months",
    );
  });

  it("rejects unsupported frequencies and timings", () => {
    expect(issue(1000, 0, 6, 60, "weekly" as never)).toBe("invalid-frequency");
    expect(issue(1000, 0, 6, 60, "monthly", "middle" as never)).toBe(
      "invalid-timing",
    );
  });

  it("returns overflow instead of non-finite results", () => {
    expect(issue(Number.MAX_VALUE, 0, 6, 1200, "monthly")).toBe("overflow");
    expect(issue(1000, 0, Number.MAX_VALUE, 120, "monthly")).toBe("overflow");
  });

  it("normalizes negative zero", () => {
    const result = ok(1000, 1000, 0, 1, "monthly");
    expect(Object.is(result.requiredMonthlySavings, -0)).toBe(false);
    expect(Object.is(result.interestEarned, -0)).toBe(false);
    expect(Object.is(result.projectedFinalSavings, -0)).toBe(false);
  });
});

describe("formatting", () => {
  it("formats money with two decimals and no currency symbol", () => {
    expect(formatSavingsMoney(16288.95, "en-US")).toBe("16,288.95");
    expect(formatSavingsMoney(16288.95, "es-ES")).toBe("16.288,95");
    expect(formatSavingsMoney(0, "en-US")).toBe("0.00");
    for (const value of ["16,288.95", "16.288,95", "0.00"]) {
      expect(value).not.toMatch(/[$₹€]/);
    }
  });

  it("formats rates without floating noise", () => {
    expect(formatSavingsDecimal(0.4166666667, "en-US")).toBe("0.417");
    expect(formatSavingsDecimal(0.4166666667, "es-ES")).toBe("0,417");
    expect(formatSavingsDecimal(-0, "en-US")).toBe("0");
  });

  it("formats progress with locale percent spacing", () => {
    expect(formatSavingsPercent(66.6667, "en-US")).toBe("66.7%");
    expect(formatSavingsPercent(66.6667, "es-ES")).toBe("66,7\u00a0%");
    expect(formatSavingsPercent(100, "en-US")).toBe("100%");
  });

  it("formats a standard required contribution", () => {
    const result = ok(10000, 0, 0, 12, "monthly");
    expect(formatSavingsMoney(result.requiredMonthlySavings, "en-US")).toBe(
      "833.34",
    );
    expect(formatSavingsMoney(result.projectedFinalSavings, "en-US")).toBe(
      "10,000.08",
    );
  });
});
