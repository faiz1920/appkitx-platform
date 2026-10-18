/*
 * Pure calendar arithmetic for the Date Calculator and Age Calculator.
 *
 * Every function works on plain civil dates ({ year, month, day }) and never
 * constructs a JS Date or touches the system clock, so results cannot depend
 * on the browser timezone or DST. Contract, mirroring the other tool modules:
 * invalid input returns null (or false), never NaN or a clamped guess.
 *
 * Difference breakdown semantics: the canonical greedy decomposition — the
 * largest whole years, then months, then days such that adding them back to
 * the earlier date (with the same month-end clamping as shiftDate) reproaches
 * the later date. Examples: Jan 31 -> Feb 28 is 0y 1m 0d; Feb 29 2024 ->
 * Feb 28 2025 is 1y 0m 0d; the day count itself is exclusive.
 */

export interface CivilDate {
  year: number;
  /** 1-12. */
  month: number;
  /** 1-31, validated against the month. */
  day: number;
}

export type DateUnit = "days" | "weeks" | "months" | "years";

export interface DateBreakdown {
  years: number;
  months: number;
  days: number;
}

export interface DateDifference {
  /** Absolute, exclusive day count: Jan 1 -> Jan 2 is 1; equal dates are 0. */
  days: number;
  breakdown: DateBreakdown;
}

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
}

export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  const lengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return lengths[month - 1] ?? 0;
}

export function isValidCivilDate(date: CivilDate): boolean {
  if (!Number.isInteger(date.year) || date.year < 1) return false;
  if (!Number.isInteger(date.month) || date.month < 1 || date.month > 12) {
    return false;
  }
  if (!Number.isInteger(date.day) || date.day < 1) return false;
  return date.day <= daysInMonth(date.year, date.month);
}

/*
 * Days since 1970-01-01, via Howard Hinnant's civil-date algorithm
 * (chrono-Compatible Low-Level Date Algorithms). Pure integer math.
 */
export function daysFromCivil(date: CivilDate): number {
  const month = date.month;
  const year = date.year - (month <= 2 ? 1 : 0);
  const era = Math.floor(year / 400);
  const yearOfEra = year - era * 400;
  const dayOfYear =
    Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + date.day - 1;
  const dayOfEra =
    yearOfEra * 365 +
    Math.floor(yearOfEra / 4) -
    Math.floor(yearOfEra / 100) +
    dayOfYear;
  return era * 146097 + dayOfEra - 719468;
}

export function civilFromDays(days: number): CivilDate {
  const shifted = days + 719468;
  const era = Math.floor(shifted / 146097);
  const dayOfEra = shifted - era * 146097;
  const yearOfEra = Math.floor(
    (dayOfEra -
      Math.floor(dayOfEra / 1460) +
      Math.floor(dayOfEra / 36524) -
      Math.floor(dayOfEra / 146096)) /
      365,
  );
  const year = yearOfEra + era * 400;
  const dayOfYear =
    dayOfEra -
    (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
  const monthIndex = Math.floor((5 * dayOfYear + 2) / 153);
  const day = dayOfYear - Math.floor((153 * monthIndex + 2) / 5) + 1;
  const month = monthIndex + (monthIndex < 10 ? 3 : -9);
  return { year: year + (month <= 2 ? 1 : 0), month, day };
}

/** 0 = Sunday through 6 = Saturday. */
export function weekdayIndex(date: CivilDate): number {
  return ((((daysFromCivil(date) % 7) + 7) % 7) + 4) % 7;
}

function addMonthsClamped(date: CivilDate, months: number): CivilDate {
  const total = date.year * 12 + (date.month - 1) + months;
  const year = Math.floor(total / 12);
  const month = (((total % 12) + 12) % 12) + 1;
  return { year, month, day: Math.min(date.day, daysInMonth(year, month)) };
}

/** Parse a native date-input value (YYYY-MM-DD) as a validated civil date. */
export function parseDateInput(value: string): CivilDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const date = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
  return isValidCivilDate(date) ? date : null;
}

/** Serialize a civil date as a native date-input value (YYYY-MM-DD). */
export function formatDateInput(date: CivilDate): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${String(date.year).padStart(4, "0")}-${pad(date.month)}-${pad(date.day)}`;
}

function breakdownBetween(start: CivilDate, end: CivilDate): DateBreakdown {
  const endDays = daysFromCivil(end);
  let years = end.year - start.year;
  if (daysFromCivil(addMonthsClamped(start, years * 12)) > endDays) {
    years -= 1;
  }
  let months = 0;
  while (
    months < 11 &&
    daysFromCivil(addMonthsClamped(start, years * 12 + months + 1)) <= endDays
  ) {
    months += 1;
  }
  const anchor = addMonthsClamped(start, years * 12 + months);
  return { years, months, days: endDays - daysFromCivil(anchor) };
}

export function difference(a: CivilDate, b: CivilDate): DateDifference | null {
  if (!isValidCivilDate(a) || !isValidCivilDate(b)) return null;
  const aDays = daysFromCivil(a);
  const bDays = daysFromCivil(b);
  const [start, end] = aDays <= bDays ? [a, b] : [b, a];
  return {
    days: Math.abs(bDays - aDays),
    breakdown: breakdownBetween(start, end),
  };
}

/*
 * Add `amount` whole units to a date; negative amounts move backwards with
 * the same arithmetic. Month and year steps move calendar months and clamp
 * to the last valid day of the target month (Jan 31 + 1 month is Feb 28 or
 * Feb 29; Mar 31 - 1 month is Feb 28 or Feb 29); day and week steps add
 * exact day counts. Fractional and non-finite amounts return null.
 */
export function shiftDate(
  date: CivilDate,
  amount: number,
  unit: DateUnit,
): CivilDate | null {
  if (!isValidCivilDate(date)) return null;
  if (!Number.isInteger(amount)) return null;
  if (unit === "days") return civilFromDays(daysFromCivil(date) + amount);
  if (unit === "weeks") {
    return civilFromDays(daysFromCivil(date) + amount * 7);
  }
  if (unit === "months") return addMonthsClamped(date, amount);
  if (unit === "years") return addMonthsClamped(date, amount * 12);
  return null;
}

/*
 * Age as of `today` — the caller supplies the user's local calendar date so
 * this stays pure and testable. Feb 29 births count the birthday on Feb 28
 * in non-leap years: that falls out of the clamped month arithmetic in
 * breakdownBetween (a documented convention, not a universal legal rule).
 * Future birth dates return null.
 */
export function calculateAge(
  birth: CivilDate,
  today: CivilDate,
): AgeResult | null {
  if (!isValidCivilDate(birth) || !isValidCivilDate(today)) return null;
  const birthDays = daysFromCivil(birth);
  const todayDays = daysFromCivil(today);
  if (birthDays > todayDays) return null;
  const breakdown = breakdownBetween(birth, today);
  return { ...breakdown, totalDays: todayDays - birthDays };
}
