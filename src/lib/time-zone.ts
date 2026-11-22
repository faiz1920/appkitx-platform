/*
 * Pure time-zone conversion.
 *
 * A user-entered date and time is a wall-clock time in a named IANA zone, not
 * a UTC instant. Daylight-saving transitions can make a wall time nonexistent
 * (spring forward) or occur twice (fall back), so the resolver:
 *
 * 1. samples the zone's offsets around the entered wall time,
 * 2. treats each distinct offset as a candidate UTC instant,
 * 3. formats every candidate back into the zone and keeps only the instants
 *    whose wall-clock parts match the input exactly.
 *
 * Zero matches means the local time does not exist. Two matches means it is
 * ambiguous; the earlier instant is selected and reported.
 *
 * All Intl formatting uses an explicit `timeZone`, so results never depend on
 * the host machine's timezone. The supported date range is 1900-01-01 through
 * 2100-12-31: modern IANA data is meaningful there, and older local-mean-time
 * offsets with second precision are out of scope.
 */

import {
  daysFromCivil,
  isValidCivilDate,
  parseDateInput,
  type CivilDate,
} from "./date-math";

export const MIN_TIME_ZONE_YEAR = 1900;
export const MAX_TIME_ZONE_YEAR = 2100;

/**
 * Curated major zones, in display order. Labels live in the dictionaries so
 * both locales stay complete; IANA identifiers are the stable values.
 */
export const CURATED_TIME_ZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "America/Toronto",
  "Europe/London",
  "Europe/Madrid",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Kathmandu",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland",
  "Pacific/Chatham",
  "Africa/Johannesburg",
  "America/Sao_Paulo",
] as const;

export type CuratedTimeZone = (typeof CURATED_TIME_ZONES)[number];

/** Fixed reference zones for the comparison table. */
export const COMPARISON_TIME_ZONES = [
  "UTC",
  "America/New_York",
  "Europe/London",
  "Europe/Madrid",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
] as const satisfies readonly CuratedTimeZone[];

export interface TimeZoneParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export interface WallTimeInput {
  date: CivilDate;
  hour: number;
  minute: number;
  timeZone: string;
}

export type WallTimeResolution =
  | {
      kind: "valid";
      instant: number;
      offsetMinutes: number;
    }
  | {
      kind: "ambiguous";
      instant: number;
      offsetMinutes: number;
      alternateInstant: number;
      alternateOffsetMinutes: number;
    }
  | {
      kind: "nonexistent";
      beforeOffsetMinutes: number;
      afterOffsetMinutes: number;
      gapMinutes: number;
    }
  | { kind: "invalid-zone" };

export type TimeZoneIssue =
  | "empty-date"
  | "invalid-date"
  | "date-range"
  | "empty-time"
  | "invalid-time"
  | "invalid-source-zone"
  | "invalid-target-zone"
  | "nonexistent";

export interface TimeZoneConversion {
  instant: number;
  sourceZone: string;
  targetZone: string;
  /** The validated wall date that was entered. */
  sourceDate: CivilDate;
  source: TimeZoneParts;
  target: TimeZoneParts;
  sourceOffsetMinutes: number;
  targetOffsetMinutes: number;
  /** Target offset minus source offset for this instant. */
  differenceMinutes: number;
  /** Whole calendar days from the entered source date to the target date. */
  dayOffset: number;
  ambiguous: boolean;
  /** Offset of the selected (earlier) occurrence when ambiguous. */
  selectedOffsetMinutes: number | null;
  alternateOffsetMinutes: number | null;
}

export type TimeZoneResult =
  | { ok: true; value: TimeZoneConversion }
  | { ok: false; issue: TimeZoneIssue; gapMinutes?: number };

export interface TimeZoneConversionInput {
  date: string;
  time: string;
  sourceZone: string;
  targetZone: string;
}

const HOUR_MINUTES = 60;

const formatterCache = new Map<string, Intl.DateTimeFormat>();
const validityCache = new Map<string, boolean>();

/* Common runtime aliases that map onto a curated canonical identifier. */
const ZONE_ALIASES: Record<string, string> = {
  "Asia/Calcutta": "Asia/Kolkata",
  "Asia/Katmandu": "Asia/Kathmandu",
};

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function normalizeHour(value: number): number {
  return value === 24 ? 0 : value;
}

function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  const cached = formatterCache.get(timeZone);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  formatterCache.set(timeZone, formatter);
  return formatter;
}

/** True when the runtime accepts the identifier as an IANA time zone. */
export function isValidTimeZone(timeZone: string): boolean {
  if (typeof timeZone !== "string" || timeZone.trim() === "") return false;

  const cached = validityCache.get(timeZone);
  if (cached !== undefined) return cached;

  let valid = true;
  try {
    partsFormatter(timeZone).format(new Date(0));
  } catch {
    valid = false;
  }
  validityCache.set(timeZone, valid);
  return valid;
}

/**
 * The device's IANA zone, or UTC when the runtime cannot report a valid one.
 * This is the only function that reads the host default.
 */
export function deviceTimeZone(): string {
  try {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const canonical = ZONE_ALIASES[detected] ?? detected;
    return isValidTimeZone(canonical) ? canonical : "UTC";
  } catch {
    return "UTC";
  }
}

/** Readable fallback label for a zone outside the curated dictionary. */
export function zoneCityLabel(timeZone: string): string {
  if (timeZone === "UTC") return "UTC";
  const segment = timeZone.split("/").pop() ?? timeZone;
  return segment.replace(/_/g, " ");
}

/** Numeric wall-clock parts for an instant, formatted with an explicit zone. */
export function zonedParts(instant: number, timeZone: string): TimeZoneParts {
  const parts = partsFormatter(timeZone).formatToParts(new Date(instant));
  const values: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== "literal") values[part.type] = Number(part.value);
  }

  const year = values.year ?? 0;
  const month = values.month ?? 0;
  const day = values.day ?? 0;
  const hour = normalizeHour(values.hour ?? 0);
  const minute = values.minute ?? 0;
  const second = values.second ?? 0;

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    !Number.isFinite(second)
  ) {
    throw new Error(`Unreadable time-zone parts for ${timeZone}`);
  }

  return { year, month, day, hour, minute, second };
}

/** UTC offset in minutes for one specific instant. */
export function offsetMinutesAt(instant: number, timeZone: string): number {
  const parts = zonedParts(instant, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  const wholeSecond = Math.floor(instant / 1000) * 1000;
  return (asUtc - wholeSecond) / 60000;
}

function sameWallTime(
  parts: TimeZoneParts,
  date: CivilDate,
  hour: number,
  minute: number,
): boolean {
  return (
    parts.year === date.year &&
    parts.month === date.month &&
    parts.day === date.day &&
    parts.hour === hour &&
    parts.minute === minute
  );
}

/**
 * Resolve a wall-clock time in a zone to the UTC instant(s) it represents.
 *
 * Offsets are sampled across a four-day window around the naive timestamp, so
 * both sides of any real transition are represented. Every candidate is then
 * verified by formatting the candidate instant back into the zone.
 */
export function resolveWallTime(input: WallTimeInput): WallTimeResolution {
  const { date, hour, minute, timeZone } = input;
  if (!isValidCivilDate(date)) return { kind: "invalid-zone" };
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    return { kind: "invalid-zone" };
  }
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
    return { kind: "invalid-zone" };
  }
  if (!isValidTimeZone(timeZone)) return { kind: "invalid-zone" };

  const naive = Date.UTC(date.year, date.month - 1, date.day, hour, minute);

  const offsets = new Set<number>();
  for (const hours of [-48, -24, -12, -6, 0, 6, 12, 24, 48]) {
    offsets.add(
      offsetMinutesAt(naive + hours * HOUR_MINUTES * 60000, timeZone),
    );
  }

  const matches = new Map<number, number>();
  for (const offset of offsets) {
    if (!Number.isFinite(offset)) continue;
    const candidate = naive - offset * 60000;
    if (!Number.isFinite(candidate)) continue;

    const parts = zonedParts(candidate, timeZone);
    if (!sameWallTime(parts, date, hour, minute)) continue;

    matches.set(candidate, offsetMinutesAt(candidate, timeZone));
  }

  const sorted = [...matches.entries()].sort(([left], [right]) => left - right);

  if (sorted.length === 0) {
    const beforeOffsetMinutes = offsetMinutesAt(
      naive - 12 * HOUR_MINUTES * 60000,
      timeZone,
    );
    const afterOffsetMinutes = offsetMinutesAt(
      naive + 12 * HOUR_MINUTES * 60000,
      timeZone,
    );
    const gapMinutes =
      afterOffsetMinutes > beforeOffsetMinutes
        ? afterOffsetMinutes - beforeOffsetMinutes
        : Math.max(...offsets) - Math.min(...offsets);

    return {
      kind: "nonexistent",
      beforeOffsetMinutes,
      afterOffsetMinutes,
      gapMinutes: Math.max(0, gapMinutes),
    };
  }

  const first = sorted[0];
  if (first === undefined) return { kind: "invalid-zone" };
  const [instant, offsetMinutes] = first;

  if (sorted.length === 1) {
    return { kind: "valid", instant, offsetMinutes };
  }

  const second = sorted[1];
  if (second === undefined) return { kind: "valid", instant, offsetMinutes };

  return {
    kind: "ambiguous",
    instant,
    offsetMinutes,
    alternateInstant: second[0],
    alternateOffsetMinutes: second[1],
  };
}

function parseTimeValue(
  value: string,
): { hour: number; minute: number } | null {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(
    value.trim(),
  );
  if (!match) return null;
  if (match[3] !== undefined && match[3] !== "00") return null;
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

/** Whole-day difference from one civil date to another. */
export function dayOffsetBetween(from: CivilDate, to: CivilDate): number {
  return daysFromCivil(to) - daysFromCivil(from);
}

/**
 * Convert a wall-clock date/time between two IANA zones.
 *
 * Invalid input returns a structured issue. A wall time inside a spring-forward
 * gap returns `nonexistent` and no result. A fall-back overlap returns the
 * earlier instant with `ambiguous: true`.
 */
export function convertTimeZone(
  input: TimeZoneConversionInput,
): TimeZoneResult {
  const dateText = input.date.trim();
  if (dateText === "") return { ok: false, issue: "empty-date" };

  const date = parseDateInput(dateText);
  if (date === null) return { ok: false, issue: "invalid-date" };
  if (date.year < MIN_TIME_ZONE_YEAR || date.year > MAX_TIME_ZONE_YEAR) {
    return { ok: false, issue: "date-range" };
  }

  if (input.time.trim() === "") return { ok: false, issue: "empty-time" };
  const time = parseTimeValue(input.time);
  if (time === null) return { ok: false, issue: "invalid-time" };

  if (!isValidTimeZone(input.sourceZone)) {
    return { ok: false, issue: "invalid-source-zone" };
  }
  if (!isValidTimeZone(input.targetZone)) {
    return { ok: false, issue: "invalid-target-zone" };
  }

  const resolution = resolveWallTime({
    date,
    hour: time.hour,
    minute: time.minute,
    timeZone: input.sourceZone,
  });

  if (resolution.kind === "invalid-zone") {
    return { ok: false, issue: "invalid-source-zone" };
  }
  if (resolution.kind === "nonexistent") {
    return {
      ok: false,
      issue: "nonexistent",
      gapMinutes: resolution.gapMinutes,
    };
  }

  const source = zonedParts(resolution.instant, input.sourceZone);
  const target = zonedParts(resolution.instant, input.targetZone);
  const sourceOffsetMinutes = offsetMinutesAt(
    resolution.instant,
    input.sourceZone,
  );
  const targetOffsetMinutes = offsetMinutesAt(
    resolution.instant,
    input.targetZone,
  );
  const differenceMinutes = targetOffsetMinutes - sourceOffsetMinutes;
  const targetDate = {
    year: target.year,
    month: target.month,
    day: target.day,
  };
  const ambiguous = resolution.kind === "ambiguous";

  return {
    ok: true,
    value: {
      instant: resolution.instant,
      sourceZone: input.sourceZone,
      targetZone: input.targetZone,
      sourceDate: date,
      source,
      target,
      sourceOffsetMinutes,
      targetOffsetMinutes,
      differenceMinutes,
      dayOffset: dayOffsetBetween(date, targetDate),
      ambiguous,
      selectedOffsetMinutes: ambiguous ? resolution.offsetMinutes : null,
      alternateOffsetMinutes: ambiguous
        ? resolution.alternateOffsetMinutes
        : null,
    },
  };
}

/** "UTC+05:30", "UTC−04:00", "UTC+12:45". */
export function formatUtcOffset(minutes: number): string {
  if (!Number.isFinite(minutes)) return "";
  const rounded = Math.round(minutes);
  const sign = rounded < 0 ? "−" : "+";
  const absolute = Math.abs(rounded);
  const hours = Math.floor(absolute / HOUR_MINUTES);
  const rest = absolute % HOUR_MINUTES;
  return `UTC${sign}${pad2(hours)}:${pad2(rest)}`;
}

/**
 * Format zoned parts for display without reading the host timezone: the parts
 * are re-projected as UTC so only the chosen locale affects the output.
 */
function partsAsUtc(parts: TimeZoneParts): Date {
  return new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    ),
  );
}

/** Localized date for wall-clock parts, e.g. "November 22, 2026". */
export function formatZoneDate(
  parts: TimeZoneParts,
  intlLocale = "en-US",
): string {
  return new Intl.DateTimeFormat(intlLocale, {
    timeZone: "UTC",
    dateStyle: "long",
  }).format(partsAsUtc(parts));
}

/** Localized clock time, e.g. "10:30 AM" (en-US) or "10:30" (es-ES). */
export function formatZoneTime(
  parts: TimeZoneParts,
  intlLocale = "en-US",
): string {
  return new Intl.DateTimeFormat(intlLocale, {
    timeZone: "UTC",
    hour: "numeric",
    minute: "2-digit",
  }).format(partsAsUtc(parts));
}

/** Localized weekday, e.g. "Sunday". */
export function formatZoneWeekday(
  parts: TimeZoneParts,
  intlLocale = "en-US",
): string {
  return new Intl.DateTimeFormat(intlLocale, {
    timeZone: "UTC",
    weekday: "long",
  }).format(partsAsUtc(parts));
}

/** Combined localized date and time for summaries and clipboard text. */
export function formatZoneDateTime(
  parts: TimeZoneParts,
  intlLocale = "en-US",
): string {
  return new Intl.DateTimeFormat(intlLocale, {
    timeZone: "UTC",
    dateStyle: "long",
    timeStyle: "short",
  }).format(partsAsUtc(parts));
}
