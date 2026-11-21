/*
 * Pure EMI and amortization arithmetic.
 *
 * Conventions:
 * - Reducing-balance EMI only.
 * - The annual rate is nominal and divided by 12.
 * - Tenure is a whole number of months.
 * - Internal arithmetic keeps full double precision; display rounding is
 *   handled by the formatting helpers below.
 * - No fees, insurance, taxes, variable rates, prepayments, or missed
 *   payments are modelled.
 */

export const MAX_EMI_MONTHS = 1200;

export const TENURE_UNITS = ["years", "months"] as const;

export type TenureUnit = (typeof TENURE_UNITS)[number];

export type EmiIssue =
  "invalid-principal" | "invalid-rate" | "invalid-months" | "overflow";

export interface EmiInstallment {
  /** 1-based payment number. */
  paymentNumber: number;
  openingBalance: number;
  payment: number;
  interest: number;
  principal: number;
  closingBalance: number;
}

export interface EmiYearSummary {
  /** 1-based loan year. */
  year: number;
  openingBalance: number;
  principalPaid: number;
  interestPaid: number;
  totalPaid: number;
  closingBalance: number;
  installments: readonly EmiInstallment[];
}

export interface EmiResult {
  principal: number;
  annualRatePercent: number;
  months: number;
  monthlyPayment: number;
  totalInterest: number;
  totalRepayment: number;
  schedule: readonly EmiInstallment[];
  years: readonly EmiYearSummary[];
}

export type EmiCalculation =
  { ok: true; value: EmiResult } | { ok: false; issue: EmiIssue };

/** Convert years or months to months; rejects non-finite and non-positive terms. */
export function tenureToMonths(value: number, unit: TenureUnit): number | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  const months = unit === "years" ? value * 12 : value;
  return Number.isFinite(months) ? months : null;
}

function normalizeZero(value: number): number {
  return Object.is(value, -0) ? 0 : value;
}

/**
 * Calculate reducing-balance EMI and every installment.
 *
 * The denominator is written with expm1/log1p so tiny monthly rates do not
 * lose precision through cancellation in `(1 + r)^n - 1`.
 */
export function calculateEmi(
  principal: number,
  annualRatePercent: number,
  months: number,
): EmiCalculation {
  if (!Number.isFinite(principal) || principal <= 0) {
    return { ok: false, issue: "invalid-principal" };
  }
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) {
    return { ok: false, issue: "invalid-rate" };
  }
  if (
    !Number.isFinite(months) ||
    !Number.isInteger(months) ||
    months < 1 ||
    months > MAX_EMI_MONTHS
  ) {
    return { ok: false, issue: "invalid-months" };
  }

  const monthlyRate = annualRatePercent / 100 / 12;
  let monthlyPayment: number;

  if (monthlyRate === 0) {
    monthlyPayment = principal / months;
  } else {
    const denominator = -Math.expm1(-months * Math.log1p(monthlyRate));
    if (!Number.isFinite(denominator) || denominator <= 0) {
      return { ok: false, issue: "overflow" };
    }
    monthlyPayment = (principal * monthlyRate) / denominator;
  }

  if (!Number.isFinite(monthlyPayment) || monthlyPayment <= 0) {
    return { ok: false, issue: "overflow" };
  }

  const schedule: EmiInstallment[] = [];
  let openingBalance = principal;
  let totalInterest = 0;
  let totalRepayment = 0;

  for (let paymentNumber = 1; paymentNumber <= months; paymentNumber += 1) {
    const interest = openingBalance * monthlyRate;
    if (!Number.isFinite(interest) || interest < 0) {
      return { ok: false, issue: "overflow" };
    }

    const isFinal = paymentNumber === months;
    const principalPart = isFinal ? openingBalance : monthlyPayment - interest;
    const payment = isFinal ? principalPart + interest : monthlyPayment;

    if (
      !Number.isFinite(principalPart) ||
      !Number.isFinite(payment) ||
      principalPart < 0
    ) {
      return { ok: false, issue: "overflow" };
    }

    let closingBalance = openingBalance - principalPart;
    if (!Number.isFinite(closingBalance)) {
      return { ok: false, issue: "overflow" };
    }
    if (isFinal || Math.abs(closingBalance) < 1e-9) closingBalance = 0;
    if (closingBalance < 0) return { ok: false, issue: "overflow" };

    schedule.push({
      paymentNumber,
      openingBalance: normalizeZero(openingBalance),
      payment: normalizeZero(payment),
      interest: normalizeZero(interest),
      principal: normalizeZero(principalPart),
      closingBalance: normalizeZero(closingBalance),
    });

    totalInterest += interest;
    totalRepayment += payment;
    openingBalance = closingBalance;
  }

  if (!Number.isFinite(totalInterest) || !Number.isFinite(totalRepayment)) {
    return { ok: false, issue: "overflow" };
  }

  const years: EmiYearSummary[] = [];
  for (let index = 0; index < schedule.length; index += 12) {
    const installments = schedule.slice(index, index + 12);
    const first = installments[0];
    const last = installments[installments.length - 1];
    if (first === undefined || last === undefined) {
      return { ok: false, issue: "overflow" };
    }

    years.push({
      year: years.length + 1,
      openingBalance: first.openingBalance,
      principalPaid: installments.reduce(
        (sum, installment) => sum + installment.principal,
        0,
      ),
      interestPaid: installments.reduce(
        (sum, installment) => sum + installment.interest,
        0,
      ),
      totalPaid: installments.reduce(
        (sum, installment) => sum + installment.payment,
        0,
      ),
      closingBalance: last.closingBalance,
      installments,
    });
  }

  return {
    ok: true,
    value: {
      principal: normalizeZero(principal),
      annualRatePercent: normalizeZero(annualRatePercent),
      months,
      monthlyPayment: normalizeZero(monthlyPayment),
      totalInterest: normalizeZero(totalInterest),
      totalRepayment: normalizeZero(totalRepayment),
      schedule,
      years,
    },
  };
}

/** Currency-neutral money formatting with two decimal places. */
export function formatEmiMoney(value: number, intlLocale = "en-US"): string {
  return new Intl.NumberFormat(intlLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(normalizeZero(value));
}

/** Rates and month counts keep meaningful decimals without floating noise. */
export function formatEmiDecimal(value: number, intlLocale = "en-US"): string {
  return new Intl.NumberFormat(intlLocale, {
    maximumFractionDigits: 3,
  }).format(normalizeZero(value));
}
