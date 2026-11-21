/*
 * Pure compound-interest arithmetic.
 *
 * Conventions:
 * - The nominal annual rate is converted to an equivalent monthly growth
 *   factor from the selected compounding frequency:
 *     g = (1 + r / m)^(m / 12)
 *     i = g - 1
 * - Interest is accrued monthly. Monthly contributions are the only
 *   recurring cash flow modelled.
 * - Daily compounding uses a fixed 365-day year; leap years are ignored.
 * - Full double precision is kept internally. Rounding happens only in the
 *   display helpers below.
 * - No fees, taxes, inflation, withdrawals, step-ups, or currency conversion
 *   are modelled.
 */

export const MAX_COMPOUND_MONTHS = 1200;

export const DURATION_UNITS = ["years", "months"] as const;

export type DurationUnit = (typeof DURATION_UNITS)[number];

export const COMPOUNDING_FREQUENCIES = [
  "annual",
  "semiannual",
  "quarterly",
  "monthly",
  "daily",
] as const;

export type CompoundingFrequency = (typeof COMPOUNDING_FREQUENCIES)[number];

export const CONTRIBUTION_TIMINGS = ["end", "beginning"] as const;

export type ContributionTiming = (typeof CONTRIBUTION_TIMINGS)[number];

export type CompoundIssue =
  | "invalid-principal"
  | "invalid-rate"
  | "invalid-months"
  | "invalid-contribution"
  | "invalid-frequency"
  | "invalid-timing"
  | "no-investment"
  | "overflow";

export interface CompoundMonth {
  /** 1-based investment month. */
  month: number;
  openingBalance: number;
  contribution: number;
  interest: number;
  closingBalance: number;
}

export interface CompoundYearSummary {
  /** 1-based investment year. */
  year: number;
  /** Number of months in this group; the final group may be partial. */
  months: number;
  openingBalance: number;
  contributions: number;
  interest: number;
  closingBalance: number;
}

export interface CompoundResult {
  principal: number;
  annualRatePercent: number;
  months: number;
  frequency: CompoundingFrequency;
  contribution: number;
  timing: ContributionTiming;
  /** Effective monthly growth rate derived from the selected frequency. */
  monthlyRate: number;
  finalValue: number;
  totalContributions: number;
  totalInvested: number;
  interestEarned: number;
  ledger: readonly CompoundMonth[];
  years: readonly CompoundYearSummary[];
}

export type CompoundCalculation =
  { ok: true; value: CompoundResult } | { ok: false; issue: CompoundIssue };

const PERIODS_PER_YEAR: Record<CompoundingFrequency, number> = {
  annual: 1,
  semiannual: 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

const ZERO_TOLERANCE = 1e-9;

function normalizeZero(value: number): number {
  return Object.is(value, -0) ? 0 : value;
}

/** Convert years or months to months; rejects non-finite and non-positive terms. */
export function durationToMonths(
  value: number,
  unit: DurationUnit,
): number | null {
  if (unit !== "years" && unit !== "months") return null;
  if (!Number.isFinite(value) || value <= 0) return null;
  const months = unit === "years" ? value * 12 : value;
  return Number.isFinite(months) ? months : null;
}

export function isDurationUnit(value: string): value is DurationUnit {
  return (DURATION_UNITS as readonly string[]).includes(value);
}

export function isCompoundingFrequency(
  value: string,
): value is CompoundingFrequency {
  return (COMPOUNDING_FREQUENCIES as readonly string[]).includes(value);
}

export function isContributionTiming(
  value: string,
): value is ContributionTiming {
  return (CONTRIBUTION_TIMINGS as readonly string[]).includes(value);
}

/**
 * Effective monthly growth rate for a nominal annual rate and frequency.
 *
 * `expm1` / `log1p` avoid cancellation in `(1 + r / m)^(m / 12) - 1` when the
 * rate is very small. Returns null for invalid inputs or non-finite results.
 */
export function equivalentMonthlyRate(
  annualRatePercent: number,
  frequency: CompoundingFrequency,
): number | null {
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) {
    return null;
  }
  if (!isCompoundingFrequency(frequency)) return null;

  const annualRate = annualRatePercent / 100;
  if (annualRate === 0) return 0;

  const periods = PERIODS_PER_YEAR[frequency];
  const logGrowth = (periods / 12) * Math.log1p(annualRate / periods);
  const monthlyRate = Math.expm1(logGrowth);
  if (!Number.isFinite(monthlyRate) || monthlyRate < 0) return null;
  return normalizeZero(monthlyRate);
}

/** Effective annual rate for a nominal annual rate and frequency. */
export function effectiveAnnualRatePercent(
  annualRatePercent: number,
  frequency: CompoundingFrequency,
): number | null {
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) {
    return null;
  }
  if (!isCompoundingFrequency(frequency)) return null;

  const annualRate = annualRatePercent / 100;
  if (annualRate === 0) return 0;

  const periods = PERIODS_PER_YEAR[frequency];
  const effectiveRate = Math.expm1(periods * Math.log1p(annualRate / periods));
  if (!Number.isFinite(effectiveRate) || effectiveRate < 0) return null;
  return normalizeZero(effectiveRate * 100);
}

/**
 * Calculate a compound-interest projection and its annual growth table.
 *
 * The monthly ledger uses the equivalent monthly rate above. Contributions at
 * the end of the month earn no interest until the next month; contributions at
 * the beginning earn interest in the same month.
 */
export function calculateCompoundInterest(
  principal: number,
  annualRatePercent: number,
  months: number,
  frequency: CompoundingFrequency,
  contribution = 0,
  timing: ContributionTiming = "end",
): CompoundCalculation {
  if (!Number.isFinite(principal) || principal < 0) {
    return { ok: false, issue: "invalid-principal" };
  }
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) {
    return { ok: false, issue: "invalid-rate" };
  }
  if (
    !Number.isFinite(months) ||
    !Number.isInteger(months) ||
    months < 1 ||
    months > MAX_COMPOUND_MONTHS
  ) {
    return { ok: false, issue: "invalid-months" };
  }
  if (!Number.isFinite(contribution) || contribution < 0) {
    return { ok: false, issue: "invalid-contribution" };
  }
  if (!isCompoundingFrequency(frequency)) {
    return { ok: false, issue: "invalid-frequency" };
  }
  if (!isContributionTiming(timing)) {
    return { ok: false, issue: "invalid-timing" };
  }
  if (principal === 0 && contribution === 0) {
    return { ok: false, issue: "no-investment" };
  }

  const monthlyRate = equivalentMonthlyRate(annualRatePercent, frequency);
  if (monthlyRate === null) return { ok: false, issue: "overflow" };

  const ledger: CompoundMonth[] = [];
  let balance = principal;
  let totalContributions = 0;
  let totalInterest = 0;

  for (let month = 1; month <= months; month += 1) {
    const openingBalance = balance;
    let interest: number;
    let closingBalance: number;

    if (timing === "beginning") {
      const fundedBalance = openingBalance + contribution;
      if (!Number.isFinite(fundedBalance)) {
        return { ok: false, issue: "overflow" };
      }
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
      return { ok: false, issue: "overflow" };
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

  const finalValue = normalizeZero(balance);
  const totalInvested = normalizeZero(principal + totalContributions);
  let interestEarned = finalValue - totalInvested;

  if (
    !Number.isFinite(finalValue) ||
    !Number.isFinite(totalContributions) ||
    !Number.isFinite(totalInvested) ||
    !Number.isFinite(totalInterest) ||
    !Number.isFinite(interestEarned)
  ) {
    return { ok: false, issue: "overflow" };
  }

  if (interestEarned < 0 && interestEarned > -ZERO_TOLERANCE) {
    interestEarned = 0;
  }
  if (interestEarned < 0) return { ok: false, issue: "overflow" };

  const years: CompoundYearSummary[] = [];
  for (let index = 0; index < ledger.length; index += 12) {
    const installments = ledger.slice(index, index + 12);
    const first = installments[0];
    const last = installments[installments.length - 1];
    if (first === undefined || last === undefined) {
      return { ok: false, issue: "overflow" };
    }

    years.push({
      year: years.length + 1,
      months: installments.length,
      openingBalance: first.openingBalance,
      contributions: normalizeZero(
        installments.reduce((sum, entry) => sum + entry.contribution, 0),
      ),
      interest: normalizeZero(
        installments.reduce((sum, entry) => sum + entry.interest, 0),
      ),
      closingBalance: last.closingBalance,
    });
  }

  return {
    ok: true,
    value: {
      principal: normalizeZero(principal),
      annualRatePercent: normalizeZero(annualRatePercent),
      months,
      frequency,
      contribution: normalizeZero(contribution),
      timing,
      monthlyRate,
      finalValue,
      totalContributions: normalizeZero(totalContributions),
      totalInvested,
      interestEarned: normalizeZero(interestEarned),
      ledger,
      years,
    },
  };
}

/** Currency-neutral money formatting with two decimal places. */
export function formatCompoundMoney(
  value: number,
  intlLocale = "en-US",
): string {
  return new Intl.NumberFormat(intlLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(normalizeZero(value));
}

/** Rates and percentages keep meaningful decimals without floating noise. */
export function formatCompoundDecimal(
  value: number,
  intlLocale = "en-US",
): string {
  return new Intl.NumberFormat(intlLocale, {
    maximumFractionDigits: 3,
  }).format(normalizeZero(value));
}
