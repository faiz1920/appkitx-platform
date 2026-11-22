/*
 * Pure savings-goal arithmetic.
 *
 * The calculator solves for the monthly contribution required to reach a
 * target, using the same monthly-equivalent accrual convention as the
 * Compound Interest Calculator:
 *
 *   g = (1 + r / m)^(m / 12)
 *   i = g - 1
 *
 * The required contribution is rounded up to the next cent and the projection
 * is rebuilt with that amount. The final ledger balance is verified against the
 * target so the displayed plan never falls short.
 *
 * Internal arithmetic keeps full double precision. Display rounding is handled
 * by the formatting helpers below.
 */

import {
  COMPOUNDING_FREQUENCIES,
  DURATION_UNITS,
  MAX_COMPOUND_MONTHS,
  durationToMonths,
  equivalentMonthlyRate,
  isCompoundingFrequency,
  isContributionTiming,
  type CompoundingFrequency,
  type ContributionTiming,
  type DurationUnit,
} from "./compound-interest";

export {
  COMPOUNDING_FREQUENCIES,
  DURATION_UNITS,
  durationToMonths,
  isCompoundingFrequency,
  isContributionTiming,
  type CompoundingFrequency,
  type ContributionTiming,
  type DurationUnit,
};

export const MAX_SAVINGS_MONTHS = MAX_COMPOUND_MONTHS;

/** Only used to absorb floating-point noise in the zero-contribution check. */
const ZERO_CONTRIBUTION_TOLERANCE = 1e-9;

/** Used by the cent-rounding helper to avoid an extra cent from float noise. */
const CENT_EPSILON = 1e-9;

export type SavingsGoalIssue =
  | "invalid-target"
  | "invalid-current"
  | "invalid-rate"
  | "invalid-months"
  | "invalid-frequency"
  | "invalid-timing"
  | "overflow";

export interface SavingsGoalMonth {
  /** 1-based savings month. */
  month: number;
  openingBalance: number;
  contribution: number;
  interest: number;
  closingBalance: number;
}

export interface SavingsGoalYear {
  /** 1-based savings year. */
  year: number;
  /** Number of months in this group; the final group may be partial. */
  months: number;
  openingBalance: number;
  contributions: number;
  interest: number;
  closingBalance: number;
  /** Progress toward the target after this year, clamped to 0–100. */
  progressPercent: number;
}

export interface SavingsGoalResult {
  target: number;
  currentSavings: number;
  annualRatePercent: number;
  months: number;
  frequency: CompoundingFrequency;
  timing: ContributionTiming;
  monthlyRate: number;
  /** Full-precision contribution from the closed-form formula. */
  exactMonthlySavings: number;
  /** Contribution rounded up to the next cent and used for the projection. */
  requiredMonthlySavings: number;
  totalContributions: number;
  totalInvested: number;
  interestEarned: number;
  projectedFinalSavings: number;
  /** Additional savings required today; zero when no contribution is needed. */
  remainingAmount: number;
  /** Progress of current savings toward the target, clamped to 0–100. */
  progressPercent: number;
  alreadyReached: boolean;
  noContributionRequired: boolean;
  ledger: readonly SavingsGoalMonth[];
  years: readonly SavingsGoalYear[];
}

export type SavingsGoalCalculation =
  | { ok: true; value: SavingsGoalResult }
  | { ok: false; issue: SavingsGoalIssue };

function normalizeZero(value: number): number {
  return Object.is(value, -0) ? 0 : value;
}

/**
 * Round a positive amount up to the next cent. A tiny epsilon prevents a value
 * such as 1000.0000000000001 from becoming an extra cent because of floating
 * noise. The ledger verification in calculateSavingsGoal is the final
 * guarantee that the target is reached.
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

interface LedgerResult {
  ledger: SavingsGoalMonth[];
  years: SavingsGoalYear[];
  finalValue: number;
  totalContributions: number;
  totalInterest: number;
}

function buildLedger(
  currentSavings: number,
  contribution: number,
  monthlyRate: number,
  months: number,
  target: number,
  timing: ContributionTiming,
): LedgerResult | null {
  const ledger: SavingsGoalMonth[] = [];
  const years: SavingsGoalYear[] = [];
  let balance = currentSavings;
  let totalContributions = 0;
  let totalInterest = 0;

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

    ledger.push({
      month,
      openingBalance: normalizeZero(openingBalance),
      contribution: normalizeZero(contribution),
      interest: normalizeZero(interest),
      closingBalance: normalizeZero(closingBalance),
    });

    balance = closingBalance;
    totalContributions += contribution;
    totalInterest += interest;
  }

  if (
    !Number.isFinite(balance) ||
    !Number.isFinite(totalContributions) ||
    !Number.isFinite(totalInterest)
  ) {
    return null;
  }

  for (let index = 0; index < ledger.length; index += 12) {
    const entries = ledger.slice(index, index + 12);
    const first = entries[0];
    const last = entries[entries.length - 1];
    if (first === undefined || last === undefined) return null;

    const closingBalance = normalizeZero(last.closingBalance);
    const progressPercent = Math.min(
      100,
      Math.max(0, (closingBalance / target) * 100),
    );

    years.push({
      year: years.length + 1,
      months: entries.length,
      openingBalance: first.openingBalance,
      contributions: normalizeZero(
        entries.reduce((sum, entry) => sum + entry.contribution, 0),
      ),
      interest: normalizeZero(
        entries.reduce((sum, entry) => sum + entry.interest, 0),
      ),
      closingBalance,
      progressPercent,
    });
  }

  return {
    ledger,
    years,
    finalValue: normalizeZero(balance),
    totalContributions: normalizeZero(totalContributions),
    totalInterest: normalizeZero(totalInterest),
  };
}

/**
 * Calculate the monthly savings required to reach a target.
 *
 * The returned requiredMonthlySavings is rounded up to cents and always
 * produces a final ledger balance at or above the target when a positive
 * contribution is required.
 */
export function calculateSavingsGoal(
  target: number,
  currentSavings: number,
  annualRatePercent: number,
  months: number,
  frequency: CompoundingFrequency,
  timing: ContributionTiming = "end",
): SavingsGoalCalculation {
  if (!Number.isFinite(target) || target <= 0) {
    return { ok: false, issue: "invalid-target" };
  }
  if (!Number.isFinite(currentSavings) || currentSavings < 0) {
    return { ok: false, issue: "invalid-current" };
  }
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) {
    return { ok: false, issue: "invalid-rate" };
  }
  if (
    !Number.isFinite(months) ||
    !Number.isInteger(months) ||
    months < 1 ||
    months > MAX_SAVINGS_MONTHS
  ) {
    return { ok: false, issue: "invalid-months" };
  }
  if (!isCompoundingFrequency(frequency)) {
    return { ok: false, issue: "invalid-frequency" };
  }
  if (!isContributionTiming(timing)) {
    return { ok: false, issue: "invalid-timing" };
  }

  const monthlyRate = equivalentMonthlyRate(annualRatePercent, frequency);
  if (monthlyRate === null) return { ok: false, issue: "overflow" };

  const monthlyGrowthFactor = 1 + monthlyRate;
  const logGrowth = Math.log1p(monthlyRate);
  const growthMinusOne = Math.expm1(months * logGrowth);
  const growthN = 1 + growthMinusOne;
  if (
    !Number.isFinite(growthMinusOne) ||
    !Number.isFinite(growthN) ||
    !Number.isFinite(monthlyGrowthFactor) ||
    growthN <= 0
  ) {
    return { ok: false, issue: "overflow" };
  }

  const initialFutureValue = currentSavings * growthN;
  if (!Number.isFinite(initialFutureValue)) {
    return { ok: false, issue: "overflow" };
  }

  let exactMonthlySavings = 0;
  if (target > initialFutureValue) {
    if (monthlyRate === 0) {
      exactMonthlySavings = (target - currentSavings) / months;
    } else {
      let annuityFactor = growthMinusOne / monthlyRate;
      if (timing === "beginning") annuityFactor *= monthlyGrowthFactor;
      if (!Number.isFinite(annuityFactor) || annuityFactor <= 0) {
        return { ok: false, issue: "overflow" };
      }
      exactMonthlySavings = (target - initialFutureValue) / annuityFactor;
    }
  }

  if (!Number.isFinite(exactMonthlySavings) || exactMonthlySavings < 0) {
    return { ok: false, issue: "overflow" };
  }

  let requiredMonthlySavings = roundUpToCents(exactMonthlySavings);
  if (!Number.isFinite(requiredMonthlySavings)) {
    return { ok: false, issue: "overflow" };
  }

  let ledgerResult = buildLedger(
    currentSavings,
    requiredMonthlySavings,
    monthlyRate,
    months,
    target,
    timing,
  );
  if (ledgerResult === null) return { ok: false, issue: "overflow" };

  /*
   * Strictly verify the rounded contribution. For a zero contribution we
   * allow only a tiny floating-point tolerance because the closed-form
   * interest-only case is mathematically exact. For a positive contribution,
   * add one cent at a time (bounded) rather than showing a plan that misses the
   * target.
   */
  const targetReached = (result: LedgerResult) =>
    requiredMonthlySavings === 0
      ? result.finalValue >= target - ZERO_CONTRIBUTION_TOLERANCE
      : result.finalValue >= target;

  for (
    let attempt = 0;
    attempt < 5 && !targetReached(ledgerResult);
    attempt += 1
  ) {
    requiredMonthlySavings = addCents(requiredMonthlySavings, 1);
    if (!Number.isFinite(requiredMonthlySavings)) {
      return { ok: false, issue: "overflow" };
    }
    ledgerResult = buildLedger(
      currentSavings,
      requiredMonthlySavings,
      monthlyRate,
      months,
      target,
      timing,
    );
    if (ledgerResult === null) return { ok: false, issue: "overflow" };
  }

  if (!targetReached(ledgerResult)) return { ok: false, issue: "overflow" };

  const totalInvested = normalizeZero(
    currentSavings + ledgerResult.totalContributions,
  );
  let interestEarned = ledgerResult.finalValue - totalInvested;

  if (!Number.isFinite(totalInvested) || !Number.isFinite(interestEarned)) {
    return { ok: false, issue: "overflow" };
  }
  if (interestEarned < 0 && interestEarned > -ZERO_CONTRIBUTION_TOLERANCE) {
    interestEarned = 0;
  }
  if (interestEarned < 0) return { ok: false, issue: "overflow" };

  const alreadyReached = currentSavings >= target;
  const noContributionRequired = requiredMonthlySavings === 0;
  const progressPercent = Math.min(
    100,
    Math.max(0, (currentSavings / target) * 100),
  );
  const remainingAmount = noContributionRequired
    ? 0
    : Math.max(0, target - currentSavings);

  return {
    ok: true,
    value: {
      target: normalizeZero(target),
      currentSavings: normalizeZero(currentSavings),
      annualRatePercent: normalizeZero(annualRatePercent),
      months,
      frequency,
      timing,
      monthlyRate,
      exactMonthlySavings: normalizeZero(exactMonthlySavings),
      requiredMonthlySavings: normalizeZero(requiredMonthlySavings),
      totalContributions: ledgerResult.totalContributions,
      totalInvested,
      interestEarned: normalizeZero(interestEarned),
      projectedFinalSavings: ledgerResult.finalValue,
      remainingAmount: normalizeZero(remainingAmount),
      progressPercent,
      alreadyReached,
      noContributionRequired,
      ledger: ledgerResult.ledger,
      years: ledgerResult.years,
    },
  };
}

/** Currency-neutral money formatting with two decimal places. */
export function formatSavingsMoney(
  value: number,
  intlLocale = "en-US",
): string {
  return new Intl.NumberFormat(intlLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(normalizeZero(value));
}

/** Rates and month counts keep meaningful decimals without floating noise. */
export function formatSavingsDecimal(
  value: number,
  intlLocale = "en-US",
): string {
  return new Intl.NumberFormat(intlLocale, {
    maximumFractionDigits: 3,
  }).format(normalizeZero(value));
}

/** Progress percentages use one decimal place and locale percent spacing. */
export function formatSavingsPercent(
  value: number,
  intlLocale = "en-US",
): string {
  return new Intl.NumberFormat(intlLocale, {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(normalizeZero(value) / 100);
}
