/*
 * Pure retirement-accumulation arithmetic.
 *
 * Two modes share one monthly-equivalent accrual convention:
 *
 *   projection — project the corpus at retirement from current savings and a
 *                constant monthly contribution
 *   required   — solve the monthly contribution needed to reach a target
 *
 * The nominal annual return is converted with the same convention as the
 * Compound Interest and Savings Goal calculators:
 *
 *   g = (1 + r / m)^(m / 12)
 *   i = g - 1
 *
 * Ages are whole years, so the projection horizon is always a whole number of
 * 12-month years: N = (retirementAge - currentAge) * 12.
 *
 * Inflation never changes the nominal accumulation. It is only used to express
 * a nominal amount in today's purchasing power:
 *
 *   real = nominal / (1 + inflation)^years
 *
 * Internal arithmetic keeps full double precision. Cent rounding is applied
 * only to the required monthly contribution, where it is rounded up and then
 * verified against the target with a rebuilt ledger. Display rounding is
 * handled by the formatting helpers below.
 */

import {
  MAX_COMPOUND_MONTHS,
  equivalentMonthlyRate,
  isCompoundingFrequency,
  isContributionTiming,
  type CompoundingFrequency,
  type ContributionTiming,
} from "./compound-interest";

export {
  isCompoundingFrequency,
  isContributionTiming,
  type CompoundingFrequency,
  type ContributionTiming,
};

export const RETIREMENT_MODES = ["projection", "required"] as const;

export type RetirementMode = (typeof RETIREMENT_MODES)[number];

export const MIN_CURRENT_AGE = 18;
export const MAX_CURRENT_AGE = 99;
export const MIN_RETIREMENT_AGE = 19;
export const MAX_RETIREMENT_AGE = 100;

/** 1 year (18 -> 19) through 82 years (18 -> 100). */
export const MIN_RETIREMENT_MONTHS = 12;
export const MAX_RETIREMENT_MONTHS =
  (MAX_RETIREMENT_AGE - MIN_CURRENT_AGE) * 12;

export type RetirementIssue =
  | "invalid-current-age"
  | "invalid-retirement-age"
  | "retirement-before-current"
  | "invalid-savings"
  | "invalid-contribution"
  | "invalid-target"
  | "invalid-rate"
  | "invalid-inflation"
  | "invalid-frequency"
  | "invalid-timing"
  | "no-investment"
  | "overflow";

/**
 * One 12-month projection year. `age` is the age reached at the end of the
 * year, so the final row always equals the retirement age.
 */
export interface RetirementYear {
  /** 1-based projection year. */
  year: number;
  age: number;
  openingBalance: number;
  contributions: number;
  interest: number;
  closingBalance: number;
}

export interface RetirementBaseInput {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  annualRatePercent: number;
  frequency: CompoundingFrequency;
  /** Defaults to "end" (contributions at the end of each month). */
  timing?: ContributionTiming;
  /**
   * Optional annual inflation in percent. `null`, `undefined`, or `0` disables
   * the inflation-adjusted display; the nominal projection is unaffected.
   */
  annualInflationPercent?: number | null;
}

export interface RetirementProjectionInput extends RetirementBaseInput {
  monthlyContribution: number;
}

export interface RequiredRetirementInput extends RetirementBaseInput {
  /** Nominal target corpus; never adjusted for inflation. */
  targetCorpus: number;
}

export interface RetirementBaseResult {
  currentAge: number;
  retirementAge: number;
  /** Months from the current age to the retirement age. */
  months: number;
  /** Years from the current age to the retirement age. */
  years: number;
  currentSavings: number;
  annualRatePercent: number;
  frequency: CompoundingFrequency;
  timing: ContributionTiming;
  /** Effective monthly growth rate derived from the selected frequency. */
  monthlyRate: number;
  /** Positive inflation rate, or null when no adjustment was requested. */
  inflationRatePercent: number | null;
  annualRows: readonly RetirementYear[];
}

export interface RetirementProjection extends RetirementBaseResult {
  mode: "projection";
  monthlyContribution: number;
  /** Nominal projected corpus at retirement. */
  projectedCorpus: number;
  inflationAdjustedCorpus: number | null;
  totalContributions: number;
  totalInvested: number;
  investmentGrowth: number;
}

export interface RetirementTargetPlan extends RetirementBaseResult {
  mode: "required";
  targetCorpus: number;
  inflationAdjustedTarget: number | null;
  /** Full-precision contribution from the closed-form formula. */
  exactMonthlySavings: number;
  /** Contribution rounded up to the next cent and verified by ledger. */
  requiredMonthlySavings: number;
  totalContributions: number;
  totalInvested: number;
  investmentGrowth: number;
  /** Nominal corpus produced by the verified rounded contribution. */
  projectedCorpus: number;
  inflationAdjustedCorpus: number | null;
  /** Current savings alone already meet the target. */
  alreadyCovered: boolean;
  /** No monthly contribution is needed (covered or growth alone). */
  noContributionRequired: boolean;
}

export type RetirementCalculation<T> =
  { ok: true; value: T } | { ok: false; issue: RetirementIssue };

/** Only used to absorb floating-point noise in non-negative checks. */
const ZERO_TOLERANCE = 1e-9;

/** Prevents float noise from adding an extra cent during rounding. */
const CENT_EPSILON = 1e-9;

function normalizeZero(value: number): number {
  return Object.is(value, -0) ? 0 : value;
}

function isWholeNumber(value: number): boolean {
  return Number.isFinite(value) && Number.isInteger(value);
}

interface ValidatedBase {
  months: number;
  years: number;
  monthlyRate: number;
  inflationRatePercent: number | null;
}

function validateBase(
  input: RetirementBaseInput,
): { ok: true; value: ValidatedBase } | { ok: false; issue: RetirementIssue } {
  const {
    currentAge,
    retirementAge,
    currentSavings,
    annualRatePercent,
    frequency,
  } = input;
  const timing = input.timing ?? "end";
  const inflationInput =
    input.annualInflationPercent === undefined
      ? null
      : input.annualInflationPercent;

  if (
    !isWholeNumber(currentAge) ||
    currentAge < MIN_CURRENT_AGE ||
    currentAge > MAX_CURRENT_AGE
  ) {
    return { ok: false, issue: "invalid-current-age" };
  }
  if (
    !isWholeNumber(retirementAge) ||
    retirementAge < MIN_RETIREMENT_AGE ||
    retirementAge > MAX_RETIREMENT_AGE
  ) {
    return { ok: false, issue: "invalid-retirement-age" };
  }
  if (retirementAge <= currentAge) {
    return { ok: false, issue: "retirement-before-current" };
  }
  if (!Number.isFinite(currentSavings) || currentSavings < 0) {
    return { ok: false, issue: "invalid-savings" };
  }
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) {
    return { ok: false, issue: "invalid-rate" };
  }
  if (inflationInput !== null) {
    if (!Number.isFinite(inflationInput) || inflationInput < 0) {
      return { ok: false, issue: "invalid-inflation" };
    }
  }
  if (!isCompoundingFrequency(frequency)) {
    return { ok: false, issue: "invalid-frequency" };
  }
  if (!isContributionTiming(timing)) {
    return { ok: false, issue: "invalid-timing" };
  }

  const months = (retirementAge - currentAge) * 12;
  if (
    !Number.isInteger(months) ||
    months < MIN_RETIREMENT_MONTHS ||
    months > Math.min(MAX_RETIREMENT_MONTHS, MAX_COMPOUND_MONTHS)
  ) {
    return { ok: false, issue: "invalid-retirement-age" };
  }

  const monthlyRate = equivalentMonthlyRate(annualRatePercent, frequency);
  if (monthlyRate === null) {
    return { ok: false, issue: "overflow" };
  }

  return {
    ok: true,
    value: {
      months,
      years: months / 12,
      monthlyRate,
      inflationRatePercent:
        inflationInput !== null && inflationInput > 0 ? inflationInput : null,
    },
  };
}

/**
 * A nominal amount expressed in today's purchasing power. Returns null for
 * invalid inputs or a non-finite deflator; 0% inflation returns the input.
 */
export function inflationAdjustedValue(
  nominal: number,
  annualInflationPercent: number,
  years: number,
): number | null {
  if (!Number.isFinite(nominal) || nominal < 0) return null;
  if (!Number.isFinite(annualInflationPercent) || annualInflationPercent < 0) {
    return null;
  }
  if (!Number.isFinite(years) || years < 0) return null;
  if (annualInflationPercent === 0) return normalizeZero(nominal);

  const deflator = Math.pow(1 + annualInflationPercent / 100, years);
  if (!Number.isFinite(deflator) || deflator <= 0) return null;

  const real = nominal / deflator;
  return Number.isFinite(real) ? normalizeZero(real) : null;
}

interface LedgerResult {
  years: RetirementYear[];
  finalValue: number;
  totalContributions: number;
  totalInterest: number;
}

function buildLedger(
  currentSavings: number,
  contribution: number,
  monthlyRate: number,
  months: number,
  currentAge: number,
  timing: ContributionTiming,
): LedgerResult | null {
  const years: RetirementYear[] = [];
  let balance = currentSavings;
  let totalContributions = 0;
  let totalInterest = 0;
  let yearOpening = balance;
  let yearContributions = 0;
  let yearInterest = 0;

  for (let month = 1; month <= months; month += 1) {
    const openingBalance = balance;
    let interest: number;
    let closingBalance: number;

    if (timing === "beginning") {
      const fundedBalance = openingBalance + contribution;
      if (!Number.isFinite(fundedBalance)) return null;
      interest = fundedBalance * monthlyRate;
      closingBalance = fundedBalance + interest;
    } else {
      interest = openingBalance * monthlyRate;
      closingBalance = openingBalance + interest + contribution;
    }

    if (
      !Number.isFinite(interest) ||
      interest < 0 ||
      !Number.isFinite(closingBalance) ||
      closingBalance < 0
    ) {
      return null;
    }

    balance = closingBalance;
    totalContributions += contribution;
    totalInterest += interest;
    yearContributions += contribution;
    yearInterest += interest;

    if (month % 12 === 0) {
      const year = years.length + 1;
      years.push({
        year,
        age: currentAge + year,
        openingBalance: normalizeZero(yearOpening),
        contributions: normalizeZero(yearContributions),
        interest: normalizeZero(yearInterest),
        closingBalance: normalizeZero(balance),
      });
      yearOpening = balance;
      yearContributions = 0;
      yearInterest = 0;
    }
  }

  if (
    years.length * 12 !== months ||
    !Number.isFinite(balance) ||
    !Number.isFinite(totalContributions) ||
    !Number.isFinite(totalInterest)
  ) {
    return null;
  }

  return {
    years,
    finalValue: normalizeZero(balance),
    totalContributions: normalizeZero(totalContributions),
    totalInterest: normalizeZero(totalInterest),
  };
}

/**
 * Project the retirement corpus from current savings and a constant monthly
 * contribution. The returned projection is nominal; an inflation-adjusted
 * value is included only when a positive inflation rate is supplied.
 */
export function calculateRetirementProjection(
  input: RetirementProjectionInput,
): RetirementCalculation<RetirementProjection> {
  const validated = validateBase(input);
  if (!validated.ok) return validated;

  const contribution = input.monthlyContribution;
  if (!Number.isFinite(contribution) || contribution < 0) {
    return { ok: false, issue: "invalid-contribution" };
  }
  if (input.currentSavings === 0 && contribution === 0) {
    return { ok: false, issue: "no-investment" };
  }

  const { months, years, monthlyRate, inflationRatePercent } = validated.value;
  const timing = input.timing ?? "end";
  const ledger = buildLedger(
    input.currentSavings,
    contribution,
    monthlyRate,
    months,
    input.currentAge,
    timing,
  );
  if (ledger === null) return { ok: false, issue: "overflow" };

  let projectedCorpus: number;
  if (monthlyRate === 0) {
    projectedCorpus = input.currentSavings + contribution * months;
  } else {
    const growthMinusOne = Math.expm1(months * Math.log1p(monthlyRate));
    const growthN = 1 + growthMinusOne;
    const annuity = growthMinusOne / monthlyRate;
    const timingFactor = timing === "beginning" ? 1 + monthlyRate : 1;
    projectedCorpus =
      input.currentSavings * growthN + contribution * annuity * timingFactor;
  }

  if (!Number.isFinite(projectedCorpus) || projectedCorpus < 0) {
    return { ok: false, issue: "overflow" };
  }
  projectedCorpus = normalizeZero(projectedCorpus);

  const totalContributions = normalizeZero(contribution * months);
  const totalInvested = normalizeZero(
    input.currentSavings + totalContributions,
  );
  let investmentGrowth = projectedCorpus - totalInvested;
  if (!Number.isFinite(investmentGrowth) || !Number.isFinite(totalInvested)) {
    return { ok: false, issue: "overflow" };
  }
  if (investmentGrowth < 0 && investmentGrowth > -ZERO_TOLERANCE) {
    investmentGrowth = 0;
  }
  if (investmentGrowth < 0) return { ok: false, issue: "overflow" };

  let inflationAdjustedCorpus: number | null = null;
  if (inflationRatePercent !== null) {
    inflationAdjustedCorpus = inflationAdjustedValue(
      projectedCorpus,
      inflationRatePercent,
      years,
    );
    if (inflationAdjustedCorpus === null) {
      return { ok: false, issue: "overflow" };
    }
  }

  return {
    ok: true,
    value: {
      mode: "projection",
      currentAge: input.currentAge,
      retirementAge: input.retirementAge,
      months,
      years,
      currentSavings: normalizeZero(input.currentSavings),
      annualRatePercent: normalizeZero(input.annualRatePercent),
      frequency: input.frequency,
      timing,
      monthlyRate,
      inflationRatePercent,
      monthlyContribution: normalizeZero(contribution),
      projectedCorpus,
      inflationAdjustedCorpus,
      totalContributions,
      totalInvested,
      investmentGrowth: normalizeZero(investmentGrowth),
      annualRows: ledger.years,
    },
  };
}

/**
 * Round a positive amount up to the next cent. A tiny epsilon prevents a value
 * such as 1000.0000000000001 from gaining an extra cent from floating noise.
 * The ledger verification below is the final guarantee that the target is met.
 */
function roundUpToCents(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const rounded = Math.ceil((value - CENT_EPSILON) * 100) / 100;
  if (!Number.isFinite(rounded)) return Number.NaN;
  return rounded > 0 ? rounded : 0.01;
}

function addCents(value: number, cents: number): number {
  return normalizeZero(Math.round((value + cents / 100) * 100) / 100);
}

/**
 * Solve the monthly contribution required to reach a nominal target.
 *
 * The contribution is rounded up to cents and the projection is rebuilt with
 * that amount. The final ledger balance is verified at or above the target, so
 * the displayed plan never falls short.
 */
export function calculateRequiredRetirementSavings(
  input: RequiredRetirementInput,
): RetirementCalculation<RetirementTargetPlan> {
  const validated = validateBase(input);
  if (!validated.ok) return validated;

  const target = input.targetCorpus;
  if (!Number.isFinite(target) || target <= 0) {
    return { ok: false, issue: "invalid-target" };
  }

  const { months, years, monthlyRate, inflationRatePercent } = validated.value;
  const timing = input.timing ?? "end";

  const growthMinusOne =
    monthlyRate === 0 ? 0 : Math.expm1(months * Math.log1p(monthlyRate));
  const growthN = 1 + growthMinusOne;
  if (
    !Number.isFinite(growthN) ||
    growthN <= 0 ||
    !Number.isFinite(growthMinusOne)
  ) {
    return { ok: false, issue: "overflow" };
  }

  const initialFutureValue = input.currentSavings * growthN;
  if (!Number.isFinite(initialFutureValue)) {
    return { ok: false, issue: "overflow" };
  }

  let exactMonthlySavings = 0;
  if (target > initialFutureValue) {
    if (monthlyRate === 0) {
      exactMonthlySavings = (target - input.currentSavings) / months;
    } else {
      let annuity = growthMinusOne / monthlyRate;
      if (timing === "beginning") annuity *= 1 + monthlyRate;
      if (!Number.isFinite(annuity) || annuity <= 0) {
        return { ok: false, issue: "overflow" };
      }
      exactMonthlySavings = (target - initialFutureValue) / annuity;
    }
  }

  if (!Number.isFinite(exactMonthlySavings) || exactMonthlySavings < 0) {
    return { ok: false, issue: "overflow" };
  }

  let requiredMonthlySavings = roundUpToCents(exactMonthlySavings);
  if (!Number.isFinite(requiredMonthlySavings)) {
    return { ok: false, issue: "overflow" };
  }

  let ledger = buildLedger(
    input.currentSavings,
    requiredMonthlySavings,
    monthlyRate,
    months,
    input.currentAge,
    timing,
  );
  if (ledger === null) return { ok: false, issue: "overflow" };

  const targetReached = (result: LedgerResult) =>
    requiredMonthlySavings === 0
      ? result.finalValue >= target - ZERO_TOLERANCE
      : result.finalValue >= target;

  for (let attempt = 0; attempt < 5 && !targetReached(ledger); attempt += 1) {
    requiredMonthlySavings = addCents(requiredMonthlySavings, 1);
    if (!Number.isFinite(requiredMonthlySavings)) {
      return { ok: false, issue: "overflow" };
    }
    ledger = buildLedger(
      input.currentSavings,
      requiredMonthlySavings,
      monthlyRate,
      months,
      input.currentAge,
      timing,
    );
    if (ledger === null) return { ok: false, issue: "overflow" };
  }

  if (!targetReached(ledger)) return { ok: false, issue: "overflow" };

  const projectedCorpus = ledger.finalValue;
  const totalContributions = ledger.totalContributions;
  const totalInvested = normalizeZero(
    input.currentSavings + totalContributions,
  );
  let investmentGrowth = projectedCorpus - totalInvested;
  if (!Number.isFinite(investmentGrowth)) {
    return { ok: false, issue: "overflow" };
  }
  if (investmentGrowth < 0 && investmentGrowth > -ZERO_TOLERANCE) {
    investmentGrowth = 0;
  }
  if (investmentGrowth < 0) return { ok: false, issue: "overflow" };

  let inflationAdjustedTarget: number | null = null;
  let inflationAdjustedCorpus: number | null = null;
  if (inflationRatePercent !== null) {
    inflationAdjustedTarget = inflationAdjustedValue(
      target,
      inflationRatePercent,
      years,
    );
    inflationAdjustedCorpus = inflationAdjustedValue(
      projectedCorpus,
      inflationRatePercent,
      years,
    );
    if (inflationAdjustedTarget === null || inflationAdjustedCorpus === null) {
      return { ok: false, issue: "overflow" };
    }
  }

  const noContributionRequired = requiredMonthlySavings === 0;

  return {
    ok: true,
    value: {
      mode: "required",
      currentAge: input.currentAge,
      retirementAge: input.retirementAge,
      months,
      years,
      currentSavings: normalizeZero(input.currentSavings),
      annualRatePercent: normalizeZero(input.annualRatePercent),
      frequency: input.frequency,
      timing,
      monthlyRate,
      inflationRatePercent,
      targetCorpus: normalizeZero(target),
      inflationAdjustedTarget,
      exactMonthlySavings: normalizeZero(exactMonthlySavings),
      requiredMonthlySavings: normalizeZero(requiredMonthlySavings),
      totalContributions,
      totalInvested,
      investmentGrowth: normalizeZero(investmentGrowth),
      projectedCorpus: normalizeZero(projectedCorpus),
      inflationAdjustedCorpus,
      alreadyCovered: input.currentSavings >= target,
      noContributionRequired,
      annualRows: ledger.years,
    },
  };
}

/** Currency-neutral money formatting with two decimal places. */
export function formatRetirementMoney(
  value: number,
  intlLocale = "en-US",
): string {
  return new Intl.NumberFormat(intlLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(normalizeZero(value));
}

/** Rates, ages, and year counts keep meaningful decimals without float noise. */
export function formatRetirementDecimal(
  value: number,
  intlLocale = "en-US",
): string {
  return new Intl.NumberFormat(intlLocale, {
    maximumFractionDigits: 3,
  }).format(normalizeZero(value));
}
