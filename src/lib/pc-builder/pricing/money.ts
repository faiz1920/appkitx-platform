/*
 * Exact money and currency handling for commercial offers (M10.7).
 *
 * Money is stored as integer minor units plus an ISO 4217 currency code.
 * Currency precision is resolved from the runtime's Intl/CLDR data, so USD
 * uses cents, JPY uses whole yen, KWD uses fils and CLF uses four decimals.
 * There is no implicit currency conversion anywhere in this module.
 *
 * `parseMoney` accepts a major-unit decimal string (preferred) or a finite
 * number, converts it exactly through a decimal string and rejects any
 * non-zero precision beyond the currency's minor unit. Display conversion to
 * a major-unit Number happens only inside Intl formatting; all arithmetic
 * stays in integer minor units.
 */

import { failure, issue, success } from "./validation";
import type { CurrencyInfo, Money, PricingResult } from "./types";

/**
 * Ten trillion minor units. Far beyond a consumer PC component while keeping
 * sums and display conversion inside Number.MAX_SAFE_INTEGER.
 */
export const MAX_MONEY_MINOR = 10_000_000_000_000;

/**
 * Intl exposes active tender currencies. A small number of ISO 4217 fund
 * units are not returned by supportedValuesOf but are still valid ISO codes;
 * their precision is explicit so no two-decimal assumption is made.
 */
const EXTRA_CURRENCIES: Readonly<Record<string, number>> = {
  BOV: 2,
  CHE: 2,
  CHW: 2,
  CLF: 4,
  COU: 2,
  MXV: 2,
  USN: 2,
  UYI: 0,
  UYQ: 2,
  UYW: 4,
};

const SUPPORTED_CURRENCIES = new Set([
  ...Intl.supportedValuesOf("currency").map((code) => code.toUpperCase()),
  ...Object.keys(EXTRA_CURRENCIES),
]);

const precisionCache = new Map<string, number>();
const formatterCache = new Map<string, Intl.NumberFormat>();

export function isCurrencyCode(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[A-Z]{3}$/.test(value) &&
    SUPPORTED_CURRENCIES.has(value)
  );
}

/** Trim/case-normalize provider input before strict ISO validation. */
export function normalizeCurrencyCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return isCurrencyCode(normalized) ? normalized : null;
}

export function currencyInfo(code: unknown): CurrencyInfo | null {
  const normalized = normalizeCurrencyCode(code);
  if (normalized === null) return null;

  let precision = precisionCache.get(normalized);
  if (precision === undefined) {
    const explicit = EXTRA_CURRENCIES[normalized];
    if (explicit !== undefined) {
      precision = explicit;
    } else {
      const formatter = new Intl.NumberFormat("en", {
        style: "currency",
        currency: normalized,
      });
      const resolved = formatter.resolvedOptions().maximumFractionDigits;
      precision = typeof resolved === "number" ? resolved : 2;
    }
    precisionCache.set(normalized, precision);
  }
  return { code: normalized, precision };
}

export function currencyPrecision(code: unknown): number | null {
  return currencyInfo(code)?.precision ?? null;
}

function decimalString(amount: unknown): string | null {
  if (typeof amount === "number") {
    if (!Number.isFinite(amount)) return null;
    const text = String(amount);
    // Exponent notation hides precision; require a plain decimal string.
    return /[eE]/.test(text) ? null : text;
  }
  if (typeof amount !== "string") return null;
  return amount.trim();
}

/** Parse a major-unit decimal string/number into exact minor units. */
export function parseMoney(
  amount: unknown,
  currency: unknown,
): PricingResult<Money> {
  const info = currencyInfo(currency);
  if (info === null) {
    return failure([
      issue(
        "currency",
        "invalid-currency",
        "Expected a supported ISO 4217 currency code.",
      ),
    ]);
  }

  const text = decimalString(amount);
  if (text === null || text === "") {
    return failure([
      issue("amount", "invalid-amount", "A monetary amount is required."),
    ]);
  }

  const match = /^(\d+)(?:\.(\d+))?$/.exec(text);
  if (match === null) {
    return failure([
      issue(
        "amount",
        "invalid-amount",
        "Expected a non-negative plain decimal amount.",
      ),
    ]);
  }

  const integerPart = match[1] ?? "0";
  const fractionPart = match[2] ?? "";
  if (fractionPart.length > info.precision) {
    const excess = fractionPart.slice(info.precision);
    if (/[1-9]/.test(excess)) {
      return failure([
        issue(
          "amount",
          "invalid-amount",
          `${info.code} supports at most ${info.precision} decimal place(s).`,
        ),
      ]);
    }
  }

  const paddedFraction = `${fractionPart}${"0".repeat(info.precision)}`.slice(
    0,
    info.precision,
  );
  const factor = 10n ** BigInt(info.precision);
  let minor: bigint;
  try {
    minor =
      BigInt(integerPart) * factor +
      (paddedFraction === "" ? 0n : BigInt(paddedFraction));
  } catch {
    return failure([
      issue("amount", "invalid-amount", "The amount is not a valid integer."),
    ]);
  }

  if (minor < 0n || minor > BigInt(MAX_MONEY_MINOR)) {
    return failure([
      issue(
        "amount",
        "too-large",
        "The amount is outside the supported range.",
      ),
    ]);
  }

  return success({ amountMinor: Number(minor), currency: info.code });
}

export function moneyFromMinorUnits(
  amountMinor: unknown,
  currency: unknown,
): PricingResult<Money> {
  const info = currencyInfo(currency);
  if (info === null) {
    return failure([
      issue(
        "currency",
        "invalid-currency",
        "Expected a supported ISO 4217 currency code.",
      ),
    ]);
  }
  if (
    typeof amountMinor !== "number" ||
    !Number.isSafeInteger(amountMinor) ||
    Math.abs(amountMinor) > MAX_MONEY_MINOR
  ) {
    return failure([
      issue(
        "amountMinor",
        "invalid-amount",
        "Expected a safe integer in minor units.",
      ),
    ]);
  }
  return success({ amountMinor, currency: info.code });
}

export function isValidMoney(value: unknown): value is Money {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.amountMinor === "number" &&
    Number.isSafeInteger(record.amountMinor) &&
    Math.abs(record.amountMinor) <= MAX_MONEY_MINOR &&
    isCurrencyCode(record.currency)
  );
}

export function zeroMoney(currency: unknown): PricingResult<Money> {
  return moneyFromMinorUnits(0, currency);
}

export function addMoney(left: Money, right: Money): PricingResult<Money> {
  if (!isValidMoney(left) || !isValidMoney(right)) {
    return failure([
      issue("money", "invalid-amount", "Expected two valid money values."),
    ]);
  }
  if (left.currency !== right.currency) {
    return failure([
      issue(
        "currency",
        "currency-mismatch",
        "Money values must use the same currency.",
      ),
    ]);
  }
  const sum = left.amountMinor + right.amountMinor;
  return moneyFromMinorUnits(sum, left.currency);
}

export function subtractMoney(left: Money, right: Money): PricingResult<Money> {
  if (!isValidMoney(left) || !isValidMoney(right)) {
    return failure([
      issue("money", "invalid-amount", "Expected two valid money values."),
    ]);
  }
  if (left.currency !== right.currency) {
    return failure([
      issue(
        "currency",
        "currency-mismatch",
        "Money values must use the same currency.",
      ),
    ]);
  }
  return moneyFromMinorUnits(
    left.amountMinor - right.amountMinor,
    left.currency,
  );
}

/** Compare same-currency money: -1, 0 or 1. */
export function compareMoney(
  left: Money,
  right: Money,
): PricingResult<-1 | 0 | 1> {
  if (!isValidMoney(left) || !isValidMoney(right)) {
    return failure([
      issue("money", "invalid-amount", "Expected two valid money values."),
    ]);
  }
  if (left.currency !== right.currency) {
    return failure([
      issue(
        "currency",
        "currency-mismatch",
        "Money values must use the same currency.",
      ),
    ]);
  }
  return success(
    left.amountMinor < right.amountMinor
      ? -1
      : left.amountMinor > right.amountMinor
        ? 1
        : 0,
  );
}

/** Exact major-unit string without floating-point arithmetic. */
export function moneyToDecimalString(money: Money): string | null {
  if (!isValidMoney(money)) return null;
  const info = currencyInfo(money.currency);
  if (info === null) return null;
  const negative = money.amountMinor < 0;
  const absolute = Math.abs(money.amountMinor);
  const factor = 10 ** info.precision;
  const integer = Math.floor(absolute / factor);
  const fraction = absolute % factor;
  const fractionText =
    info.precision === 0
      ? ""
      : `.${String(fraction).padStart(info.precision, "0")}`;
  return `${negative ? "-" : ""}${integer}${fractionText}`;
}

export function formatMoney(
  money: Money,
  intlLocale = "en-US",
): PricingResult<string> {
  if (!isValidMoney(money)) {
    return failure([
      issue("money", "invalid-amount", "Expected a valid money value."),
    ]);
  }
  const info = currencyInfo(money.currency);
  if (info === null) {
    return failure([
      issue(
        "currency",
        "invalid-currency",
        "Expected a supported ISO 4217 currency code.",
      ),
    ]);
  }

  let locale: string;
  try {
    locale = Intl.getCanonicalLocales(intlLocale)[0] ?? "en-US";
  } catch {
    return failure([
      issue("locale", "invalid-locale", "Expected a valid BCP-47 locale."),
    ]);
  }

  const cacheKey = `${locale}|${info.code}|${info.precision}`;
  let formatter = formatterCache.get(cacheKey);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: info.code,
      minimumFractionDigits: info.precision,
      maximumFractionDigits: info.precision,
    });
    formatterCache.set(cacheKey, formatter);
  }

  // Display only: all stored values and arithmetic remain integer minor units.
  const major = money.amountMinor / 10 ** info.precision;
  return success(formatter.format(major));
}
