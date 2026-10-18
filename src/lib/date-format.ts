/*
 * Intl display helpers for the date tools. Arithmetic stays in date-math.ts;
 * this module only turns civil dates and counts into localized text. Dates
 * are rendered through a UTC instant built with setUTCFullYear so the output
 * is identical in every host timezone.
 */

import type { CivilDate, DateBreakdown, DateUnit } from "./date-math";

function utcNoon(date: CivilDate): Date {
  const value = new Date(0);
  value.setUTCFullYear(date.year, date.month - 1, date.day);
  return value;
}

/** Localized long date, e.g. "March 1, 2026" / "1 de marzo de 2026". */
export function formatLongDate(date: CivilDate, intlLocale = "en-US"): string {
  return new Intl.DateTimeFormat(intlLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(utcNoon(date));
}

/** Localized weekday name, e.g. "Friday" / "viernes". */
export function formatWeekday(date: CivilDate, intlLocale = "en-US"): string {
  return new Intl.DateTimeFormat(intlLocale, {
    weekday: "long",
    timeZone: "UTC",
  }).format(utcNoon(date));
}

/** Localized day count, e.g. "14 days" / "14 días". */
export function formatDayCount(value: number, intlLocale = "en-US"): string {
  return new Intl.NumberFormat(intlLocale, {
    style: "unit",
    unit: "day",
    unitDisplay: "long",
  }).format(value);
}

/** Localized amount with a unit name, e.g. "1 month" / "3 semanas". */
export function formatUnitAmount(
  value: number,
  unit: DateUnit,
  intlLocale = "en-US",
): string {
  const singular = {
    days: "day",
    weeks: "week",
    months: "month",
    years: "year",
  } as const;
  return new Intl.NumberFormat(intlLocale, {
    style: "unit",
    unit: singular[unit],
    unitDisplay: "long",
  }).format(value);
}

/** Localized years/months/days list, e.g. "1 year, 0 months, and 3 days". */
export function formatBreakdown(
  breakdown: DateBreakdown,
  intlLocale = "en-US",
): string {
  const unit = (value: number, name: "year" | "month" | "day") =>
    new Intl.NumberFormat(intlLocale, {
      style: "unit",
      unit: name,
      unitDisplay: "long",
    }).format(value);
  return new Intl.ListFormat(intlLocale, {
    style: "long",
    type: "conjunction",
  }).format([
    unit(breakdown.years, "year"),
    unit(breakdown.months, "month"),
    unit(breakdown.days, "day"),
  ]);
}
