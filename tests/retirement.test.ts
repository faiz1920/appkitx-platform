import { describe, expect, it } from "vitest";
import {
  MAX_RETIREMENT_AGE,
  MAX_RETIREMENT_MONTHS,
  MIN_CURRENT_AGE,
  MIN_RETIREMENT_AGE,
  calculateRequiredRetirementSavings,
  calculateRetirementProjection,
  formatRetirementDecimal,
  formatRetirementMoney,
  inflationAdjustedValue,
  type CompoundingFrequency,
  type ContributionTiming,
  type RequiredRetirementInput,
  type RetirementCalculation,
  type RetirementProjectionInput,
} from "../src/lib/retirement";

/*
 * Retirement Calculator invariants.
 *
 * The pinned scenarios are independent expectations: they were computed from
 * the closed-form annuity formula outside this module. Ledger reconciliation
 * tests compare those outputs with the annual table the calculator shows.
 */

function unwrap<T>(calculation: RetirementCalculation<T>): T {
  if (!calculation.ok) {
    throw new Error(`unexpected calculation issue: ${calculation.issue}`);
  }
  return calculation.value;
}

const BASE = {
  currentAge: 30,
  retirementAge: 60,
  currentSavings: 50_000,
  annualRatePercent: 6,
  frequency: "monthly" as CompoundingFrequency,
} satisfies Omit<RetirementProjectionInput, "monthlyContribution">;

const projection = (overrides: Partial<RetirementProjectionInput> = {}) =>
  calculateRetirementProjection({
    ...BASE,
    monthlyContribution: 500,
    ...overrides,
  });

const required = (overrides: Partial<RequiredRetirementInput> = {}) =>
  calculateRequiredRetirementSavings({
    ...BASE,
    targetCorpus: 1_000_000,
    ...overrides,
  });

const FREQUENCIES: CompoundingFrequency[] = [
  "annual",
  "semiannual",
  "quarterly",
  "monthly",
  "daily",
];

const TIMINGS: ContributionTiming[] = ["end", "beginning"];

describe("retirement validation", () => {
  it("accepts the minimum and maximum ages", () => {
    const youngest = unwrap(
      projection({
        currentAge: MIN_CURRENT_AGE,
        retirementAge: MIN_RETIREMENT_AGE,
      }),
    );
    expect(youngest.months).toBe(12);
    expect(youngest.annualRows).toHaveLength(1);

    const oldest = unwrap(
      projection({
        currentAge: MIN_CURRENT_AGE,
        retirementAge: MAX_RETIREMENT_AGE,
        monthlyContribution: 10,
      }),
    );
    expect(oldest.months).toBe(MAX_RETIREMENT_MONTHS);
    expect(oldest.months).toBe(984);
    expect(oldest.annualRows).toHaveLength(82);
    expect(oldest.annualRows.at(-1)?.age).toBe(MAX_RETIREMENT_AGE);
  });

  it("rejects ages outside the supported whole-year range", () => {
    for (const currentAge of [17, 100, 30.5, Number.NaN, Infinity]) {
      expect(projection({ currentAge }).ok ? "ok" : "issue").toBe("issue");
    }
    for (const retirementAge of [18, 101, 60.5, Number.NaN]) {
      expect(projection({ retirementAge }).ok ? "ok" : "issue").toBe("issue");
    }
  });

  it("rejects a retirement age that is not later than the current age", () => {
    for (const retirementAge of [30, 29, 25]) {
      const result = projection({ currentAge: 30, retirementAge });
      expect(result.ok).toBe(false);
      if (result.ok) throw new Error("expected failure");
      expect(result.issue).toBe("retirement-before-current");
    }

    for (const retirementAge of [18, 101]) {
      const result = projection({ currentAge: 30, retirementAge });
      expect(result.ok).toBe(false);
      if (result.ok) throw new Error("expected failure");
      expect(result.issue).toBe("invalid-retirement-age");
    }
  });

  it("rejects negative money and rates", () => {
    expect(projection({ currentSavings: -1 })).toMatchObject({
      ok: false,
      issue: "invalid-savings",
    });
    expect(projection({ monthlyContribution: -1 })).toMatchObject({
      ok: false,
      issue: "invalid-contribution",
    });
    expect(projection({ annualRatePercent: -1 })).toMatchObject({
      ok: false,
      issue: "invalid-rate",
    });
    expect(required({ annualRatePercent: -1 })).toMatchObject({
      ok: false,
      issue: "invalid-rate",
    });
  });

  it("rejects a non-positive target", () => {
    for (const targetCorpus of [0, -1, Number.NaN, Infinity]) {
      expect(required({ targetCorpus })).toMatchObject({
        ok: false,
        issue: "invalid-target",
      });
    }
  });

  it("rejects invalid inflation, frequency, and timing", () => {
    expect(projection({ annualInflationPercent: -0.1 })).toMatchObject({
      ok: false,
      issue: "invalid-inflation",
    });
    expect(projection({ annualInflationPercent: Number.NaN })).toMatchObject({
      ok: false,
      issue: "invalid-inflation",
    });
    expect(
      projection({ frequency: "weekly" as CompoundingFrequency }),
    ).toMatchObject({ ok: false, issue: "invalid-frequency" });
    expect(
      projection({ timing: "middle" as ContributionTiming }),
    ).toMatchObject({ ok: false, issue: "invalid-timing" });
  });

  it("rejects a projection with no savings and no contribution", () => {
    expect(
      projection({ currentSavings: 0, monthlyContribution: 0 }),
    ).toMatchObject({ ok: false, issue: "no-investment" });
  });

  it("rejects non-finite money values", () => {
    expect(projection({ currentSavings: Number.NaN })).toMatchObject({
      ok: false,
      issue: "invalid-savings",
    });
    expect(projection({ monthlyContribution: Infinity })).toMatchObject({
      ok: false,
      issue: "invalid-contribution",
    });
  });
});

describe("Mode A — projected retirement corpus", () => {
  it("projects Scenario A at 6% nominal", () => {
    const result = unwrap(projection());
    expect(result.mode).toBe("projection");
    expect(result.months).toBe(360);
    expect(result.projectedCorpus).toBeCloseTo(803_386.28, 2);
    expect(result.totalContributions).toBeCloseTo(180_000, 6);
    expect(result.totalInvested).toBeCloseTo(230_000, 6);
    expect(result.investmentGrowth).toBeCloseTo(573_386.28, 2);
  });

  it("projects Scenario B at 8% nominal", () => {
    const result = unwrap(projection({ annualRatePercent: 8 }));
    expect(result.projectedCorpus).toBeCloseTo(1_291_966.21, 2);
    expect(result.totalInvested).toBeCloseTo(230_000, 6);
    expect(result.investmentGrowth).toBeCloseTo(1_061_966.21, 2);
  });

  it("handles Scenario G — zero return", () => {
    const result = unwrap(
      projection({
        currentAge: 30,
        retirementAge: 35,
        currentSavings: 50_000,
        monthlyContribution: 1_000,
        annualRatePercent: 0,
      }),
    );
    expect(result.projectedCorpus).toBe(110_000);
    expect(result.totalContributions).toBe(60_000);
    expect(result.totalInvested).toBe(110_000);
    expect(result.investmentGrowth).toBe(0);
    expect(result.monthlyRate).toBe(0);
    expect(result.annualRows).toHaveLength(5);
    expect(result.annualRows.every((row) => row.interest === 0)).toBe(true);
  });

  it("projects current savings alone when contributions are zero", () => {
    const result = unwrap(projection({ monthlyContribution: 0 }));
    expect(result.projectedCorpus).toBeCloseTo(301_128.76, 2);
    expect(result.totalContributions).toBe(0);
    expect(result.totalInvested).toBe(50_000);
    expect(result.investmentGrowth).toBeCloseTo(251_128.76, 2);
  });

  it("projects contributions alone when current savings are zero", () => {
    const result = unwrap(projection({ currentSavings: 0 }));
    expect(result.projectedCorpus).toBeCloseTo(502_257.52, 2);
    expect(result.totalContributions).toBe(180_000);
    expect(result.investmentGrowth).toBeCloseTo(322_257.52, 2);
  });

  it("values beginning-of-month contributions above end-of-month", () => {
    const end = unwrap(projection({ timing: "end" }));
    const beginning = unwrap(projection({ timing: "beginning" }));
    expect(beginning.projectedCorpus).toBeGreaterThan(end.projectedCorpus);
    expect(beginning.timing).toBe("beginning");
    expect(beginning.annualRows[0]?.contributions).toBeCloseTo(6_000, 6);
  });

  it("supports all five compounding frequencies", () => {
    const values = FREQUENCIES.map(
      (frequency) => unwrap(projection({ frequency })).projectedCorpus,
    );
    for (let index = 1; index < values.length; index += 1) {
      expect(values[index] ?? 0).toBeGreaterThan(values[index - 1] ?? 0);
    }
  });

  it("supports the minimum and maximum horizons", () => {
    const shortest = unwrap(
      projection({
        currentAge: 30,
        retirementAge: 31,
        currentSavings: 100,
        monthlyContribution: 10,
      }),
    );
    expect(shortest.months).toBe(12);
    expect(shortest.projectedCorpus).toBeCloseTo(229.52, 2);

    const longest = unwrap(
      projection({
        currentAge: MIN_CURRENT_AGE,
        retirementAge: 100,
        annualRatePercent: 8,
      }),
    );
    expect(longest.months).toBe(984);
    expect(longest.years).toBe(82);
    expect(Number.isFinite(longest.projectedCorpus)).toBe(true);
  });
});

describe("Mode B — required monthly savings", () => {
  it("solves Scenario C at 6% with end-of-month contributions", () => {
    const result = unwrap(required());
    expect(result.mode).toBe("required");
    expect(result.exactMonthlySavings).toBeCloseTo(695.72999, 4);
    expect(result.requiredMonthlySavings).toBe(695.73);
    expect(result.projectedCorpus).toBeGreaterThanOrEqual(1_000_000);
    expect(result.projectedCorpus).toBeCloseTo(1_000_000.01, 2);
    expect(result.totalContributions).toBeCloseTo(695.73 * 360, 6);
  });

  it("solves Scenario D with beginning-of-month contributions", () => {
    const result = unwrap(required({ timing: "beginning" }));
    expect(result.requiredMonthlySavings).toBe(692.27);
    expect(result.projectedCorpus).toBeGreaterThanOrEqual(1_000_000);
    expect(result.requiredMonthlySavings).toBeLessThan(695.73);
  });

  it("handles a zero return", () => {
    const result = unwrap(
      required({
        currentAge: 30,
        retirementAge: 35,
        currentSavings: 50_000,
        targetCorpus: 110_000,
        annualRatePercent: 0,
      }),
    );
    expect(result.exactMonthlySavings).toBe(1_000);
    expect(result.requiredMonthlySavings).toBe(1_000);
    expect(result.projectedCorpus).toBe(110_000);
    expect(result.investmentGrowth).toBe(0);
  });

  it("returns zero when current savings already meet the target", () => {
    const result = unwrap(required({ targetCorpus: 40_000 }));
    expect(result.requiredMonthlySavings).toBe(0);
    expect(result.alreadyCovered).toBe(true);
    expect(result.noContributionRequired).toBe(true);
    expect(result.totalContributions).toBe(0);
    expect(result.projectedCorpus).toBeGreaterThanOrEqual(40_000);
  });

  it("returns zero when growth alone reaches the target (Scenario H)", () => {
    const result = unwrap(required({ targetCorpus: 250_000 }));
    expect(result.requiredMonthlySavings).toBe(0);
    expect(result.alreadyCovered).toBe(false);
    expect(result.noContributionRequired).toBe(true);
    expect(result.projectedCorpus).toBeCloseTo(301_128.76, 2);
    expect(result.projectedCorpus).toBeGreaterThanOrEqual(250_000);
    expect(result.annualRows).toHaveLength(30);
  });

  it("supports all five compounding frequencies", () => {
    const values = FREQUENCIES.map(
      (frequency) =>
        unwrap(
          required({
            frequency,
            currentSavings: 0,
            retirementAge: 35,
            targetCorpus: 100_000,
            annualRatePercent: 8,
          }),
        ).requiredMonthlySavings,
    );
    for (let index = 1; index < values.length; index += 1) {
      expect(values[index] ?? 0).toBeLessThan(values[index - 1] ?? 0);
    }
    expect(values[0]).toBe(1_370.91);
    expect(values[4]).toBe(1_360.06);
  });

  it("rounds up to cents and always meets the target", () => {
    const scenarios: RequiredRetirementInput[] = [
      { ...BASE, targetCorpus: 1_000_000 },
      { ...BASE, targetCorpus: 1_000_000, timing: "beginning" },
      { ...BASE, targetCorpus: 100_000, currentSavings: 0 },
      { ...BASE, targetCorpus: 999_999.99, annualRatePercent: 4.35 },
      {
        ...BASE,
        currentAge: 22,
        retirementAge: 67,
        targetCorpus: 2_500_000,
        annualRatePercent: 7.1,
      },
      {
        ...BASE,
        currentAge: 55,
        retirementAge: 65,
        currentSavings: 200_000,
        targetCorpus: 500_000,
        annualRatePercent: 3,
      },
    ];

    for (const input of scenarios) {
      const result = unwrap(calculateRequiredRetirementSavings(input));
      const cents = Math.round(result.requiredMonthlySavings * 100);
      expect(
        Math.abs(result.requiredMonthlySavings * 100 - cents),
      ).toBeLessThan(1e-6);
      expect(result.requiredMonthlySavings).toBeGreaterThanOrEqual(0);
      expect(result.projectedCorpus).toBeGreaterThanOrEqual(input.targetCorpus);
      expect(result.annualRows.at(-1)?.closingBalance).toBe(
        result.projectedCorpus,
      );
    }
  });

  it("never returns a negative contribution", () => {
    for (const targetCorpus of [1, 10_000, 50_000, 1_000_000]) {
      const result = unwrap(required({ targetCorpus }));
      expect(result.requiredMonthlySavings).toBeGreaterThanOrEqual(0);
      expect(result.exactMonthlySavings).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("inflation handling", () => {
  it("disables the adjustment when inflation is blank or zero", () => {
    expect(unwrap(projection()).inflationAdjustedCorpus).toBeNull();
    expect(
      unwrap(projection({ annualInflationPercent: null }))
        .inflationAdjustedCorpus,
    ).toBeNull();
    expect(
      unwrap(projection({ annualInflationPercent: 0 })).inflationAdjustedCorpus,
    ).toBeNull();
    expect(
      unwrap(required({ annualInflationPercent: 0 })).inflationAdjustedTarget,
    ).toBeNull();
  });

  it("converts Scenario E to today's purchasing power", () => {
    const nominal = unwrap(projection());
    const real = unwrap(projection({ annualInflationPercent: 2.5 }));
    expect(real.projectedCorpus).toBe(nominal.projectedCorpus);
    expect(real.inflationRatePercent).toBe(2.5);
    expect(real.inflationAdjustedCorpus).toBeCloseTo(383_008.53, 2);
  });

  it("keeps the Mode B target nominal and shows both real values (Scenario F)", () => {
    const nominal = unwrap(required());
    const real = unwrap(required({ annualInflationPercent: 2.5 }));
    expect(real.targetCorpus).toBe(1_000_000);
    expect(real.requiredMonthlySavings).toBe(nominal.requiredMonthlySavings);
    expect(real.projectedCorpus).toBe(nominal.projectedCorpus);
    expect(real.inflationAdjustedTarget).toBeCloseTo(476_742.69, 2);
    expect(real.inflationAdjustedCorpus).toBeCloseTo(
      1_000_000.01 / 1.025 ** 30,
      2,
    );
  });

  it("calculates the real-value formula directly", () => {
    expect(inflationAdjustedValue(100_000, 0, 10)).toBe(100_000);
    expect(inflationAdjustedValue(100_000, 2, 10)).toBeCloseTo(
      100_000 / 1.02 ** 10,
      6,
    );
    expect(inflationAdjustedValue(100_000, -1, 10)).toBeNull();
    expect(inflationAdjustedValue(-1, 2, 10)).toBeNull();
    expect(inflationAdjustedValue(100_000, 2, Number.NaN)).toBeNull();
  });

  it("fails cleanly when the inflation adjustment overflows", () => {
    expect(projection({ annualInflationPercent: 1e308 })).toMatchObject({
      ok: false,
      issue: "overflow",
    });
  });
});

describe("annual projection ledger", () => {
  it("covers the full horizon in 12-month rows", () => {
    const result = unwrap(projection());
    expect(result.annualRows).toHaveLength(30);
    expect(result.annualRows[0]?.year).toBe(1);
    expect(result.annualRows[0]?.age).toBe(31);
    expect(result.annualRows.at(-1)?.year).toBe(30);
    expect(result.annualRows.at(-1)?.age).toBe(60);
    for (const row of result.annualRows) {
      expect(row.contributions).toBeCloseTo(6_000, 6);
    }
  });

  it("reconciles each annual row and the final balance", () => {
    const result = unwrap(projection());
    for (const row of result.annualRows) {
      expect(row.openingBalance + row.contributions + row.interest).toBeCloseTo(
        row.closingBalance,
        6,
      );
    }
    expect(result.annualRows[0]?.openingBalance).toBe(50_000);
    expect(result.annualRows.at(-1)?.closingBalance).toBeCloseTo(
      result.projectedCorpus,
      4,
    );
    const totalContributions = result.annualRows.reduce(
      (sum, row) => sum + row.contributions,
      0,
    );
    expect(totalContributions).toBeCloseTo(result.totalContributions, 6);
  });

  it("keeps the ledger consistent for beginning-of-month timing", () => {
    const result = unwrap(projection({ timing: "beginning" }));
    for (const row of result.annualRows) {
      expect(row.openingBalance + row.contributions + row.interest).toBeCloseTo(
        row.closingBalance,
        6,
      );
      expect(row.interest).toBeGreaterThan(0);
    }
    expect(result.annualRows.at(-1)?.closingBalance).toBeCloseTo(
      result.projectedCorpus,
      4,
    );
  });

  it("uses the verified rounded contribution in Mode B", () => {
    const result = unwrap(required());
    const annualContributions = 695.73 * 12;
    for (const row of result.annualRows) {
      expect(row.contributions).toBeCloseTo(annualContributions, 6);
    }
    expect(result.annualRows.at(-1)?.closingBalance).toBe(
      result.projectedCorpus,
    );
    expect(result.annualRows.at(-1)?.closingBalance).toBeGreaterThanOrEqual(
      1_000_000,
    );
  });

  it("shows zero contributions when growth alone reaches the target", () => {
    const result = unwrap(required({ targetCorpus: 250_000 }));
    expect(result.annualRows.every((row) => row.contributions === 0)).toBe(
      true,
    );
    expect(result.annualRows.every((row) => row.interest >= 0)).toBe(true);
  });
});

describe("numerical safety", () => {
  it("stays stable at very small positive returns", () => {
    const result = unwrap(
      projection({
        currentAge: 18,
        retirementAge: 100,
        monthlyContribution: 0,
        annualRatePercent: 1e-9,
      }),
    );
    expect(result.projectedCorpus).toBeCloseTo(50_000.000041, 6);
    expect(Number.isFinite(result.monthlyRate)).toBe(true);
    expect(result.monthlyRate).toBeGreaterThan(0);
  });

  it("handles a large but finite return over the longest horizon", () => {
    const result = unwrap(
      projection({
        currentAge: 18,
        retirementAge: 100,
        annualRatePercent: 100,
        monthlyContribution: 500,
      }),
    );
    expect(Number.isFinite(result.projectedCorpus)).toBe(true);
    expect(result.projectedCorpus / 8.997059364816148e38).toBeCloseTo(1, 6);
    expect(result.investmentGrowth).toBeGreaterThan(0);
  });

  it("detects overflow instead of emitting Infinity", () => {
    const result = projection({ annualRatePercent: 1e308 });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected overflow");
    expect(result.issue).toBe("overflow");
  });

  it("emits finite, non-negative values for every supported frequency and timing", () => {
    for (const frequency of FREQUENCIES) {
      for (const timing of TIMINGS) {
        const projected = unwrap(projection({ frequency, timing }));
        for (const value of [
          projected.projectedCorpus,
          projected.totalContributions,
          projected.totalInvested,
          projected.investmentGrowth,
          projected.monthlyRate,
        ]) {
          expect(Number.isFinite(value)).toBe(true);
          expect(value).toBeGreaterThanOrEqual(0);
        }

        const plan = unwrap(
          required({ frequency, timing, currentSavings: 10_000 }),
        );
        for (const value of [
          plan.requiredMonthlySavings,
          plan.projectedCorpus,
          plan.totalContributions,
          plan.totalInvested,
          plan.investmentGrowth,
        ]) {
          expect(Number.isFinite(value)).toBe(true);
          expect(value).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it("keeps the zero-rate ledger exact", () => {
    const result = unwrap(
      projection({
        currentAge: 40,
        retirementAge: 45,
        currentSavings: 0,
        monthlyContribution: 250,
        annualRatePercent: 0,
      }),
    );
    expect(result.projectedCorpus).toBe(15_000);
    expect(result.investmentGrowth).toBe(0);
    expect(result.annualRows.at(-1)?.closingBalance).toBe(15_000);
  });
});

describe("retirement formatting", () => {
  it("formats money with two decimals and no currency symbol", () => {
    expect(formatRetirementMoney(1_234.5, "en-US")).toBe("1,234.50");
    expect(formatRetirementMoney(1_234.5, "es-ES")).toBe("1234,50");
    expect(formatRetirementMoney(1_234_567.5, "es-ES")).toBe("1.234.567,50");
    expect(formatRetirementMoney(-0, "en-US")).toBe("0.00");
  });

  it("formats ages, rates, and year counts without float noise", () => {
    expect(formatRetirementDecimal(30, "en-US")).toBe("30");
    expect(formatRetirementDecimal(6.125, "en-US")).toBe("6.125");
    expect(formatRetirementDecimal(6.125, "es-ES")).toBe("6,125");
    expect(formatRetirementDecimal(-0, "es-ES")).toBe("0");
  });
});
