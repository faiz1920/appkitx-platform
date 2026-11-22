import { describe, expect, it } from "vitest";
import {
  COMPARISON_TIME_ZONES,
  CURATED_TIME_ZONES,
  MAX_TIME_ZONE_YEAR,
  MIN_TIME_ZONE_YEAR,
  convertTimeZone,
  dayOffsetBetween,
  deviceTimeZone,
  formatUtcOffset,
  formatZoneDate,
  formatZoneDateTime,
  formatZoneTime,
  formatZoneWeekday,
  isValidTimeZone,
  offsetMinutesAt,
  resolveWallTime,
  zoneCityLabel,
  zonedParts,
  type TimeZoneConversion,
  type TimeZoneResult,
} from "../src/lib/time-zone";

/*
 * Time-zone arithmetic contracts. Every expectation uses an explicit IANA
 * source and target zone; none depends on the host machine's timezone. The
 * runtime-independence test at the end proves that by changing TZ in-process.
 */

function ok(result: TimeZoneResult): TimeZoneConversion {
  if (!result.ok) {
    throw new Error(`unexpected conversion issue: ${result.issue}`);
  }
  return result.value;
}

const convert = (
  date: string,
  time: string,
  sourceZone: string,
  targetZone: string,
) => convertTimeZone({ date, time, sourceZone, targetZone });

const instant = (iso: string) => Date.parse(iso);

describe("curated time zones", () => {
  it("includes the required representative regions", () => {
    for (const zone of [
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
      "Asia/Dubai",
      "Asia/Singapore",
      "Asia/Tokyo",
      "Asia/Shanghai",
      "Australia/Sydney",
      "Pacific/Auckland",
      "Africa/Johannesburg",
      "America/Sao_Paulo",
    ]) {
      expect(CURATED_TIME_ZONES).toContain(zone);
    }
  });

  it("keeps the comparison zones in the curated list and unique", () => {
    expect(new Set(CURATED_TIME_ZONES).size).toBe(CURATED_TIME_ZONES.length);
    for (const zone of COMPARISON_TIME_ZONES) {
      expect(CURATED_TIME_ZONES).toContain(zone);
    }
    expect(COMPARISON_TIME_ZONES).toContain("UTC");
    expect(COMPARISON_TIME_ZONES.length).toBeGreaterThanOrEqual(7);
  });

  it("accepts every curated zone in this runtime", () => {
    for (const zone of CURATED_TIME_ZONES) {
      expect(isValidTimeZone(zone), zone).toBe(true);
    }
    expect(isValidTimeZone("UTC")).toBe(true);
    expect(isValidTimeZone("Not/AZone")).toBe(false);
    expect(isValidTimeZone("")).toBe(false);
    expect(isValidTimeZone("   ")).toBe(false);
  });

  it("reports a valid device zone and readable fallback labels", () => {
    expect(isValidTimeZone(deviceTimeZone())).toBe(true);
    expect(zoneCityLabel("America/New_York")).toBe("New York");
    expect(zoneCityLabel("America/Argentina/Buenos_Aires")).toBe(
      "Buenos Aires",
    );
    expect(zoneCityLabel("UTC")).toBe("UTC");
  });
});

describe("basic conversions", () => {
  it("converts UTC to UTC", () => {
    const result = ok(convert("2026-11-22", "10:30", "UTC", "UTC"));
    expect(result.instant).toBe(instant("2026-11-22T10:30:00Z"));
    expect(result.target).toMatchObject({
      year: 2026,
      month: 11,
      day: 22,
      hour: 10,
      minute: 30,
    });
    expect(result.sourceOffsetMinutes).toBe(0);
    expect(result.targetOffsetMinutes).toBe(0);
    expect(result.differenceMinutes).toBe(0);
    expect(result.dayOffset).toBe(0);
    expect(result.ambiguous).toBe(false);
  });

  it("converts UTC to Kolkata (UTC+05:30)", () => {
    const result = ok(convert("2026-11-22", "10:30", "UTC", "Asia/Kolkata"));
    expect(result.target).toMatchObject({
      year: 2026,
      month: 11,
      day: 22,
      hour: 16,
      minute: 0,
    });
    expect(result.targetOffsetMinutes).toBe(330);
    expect(result.differenceMinutes).toBe(330);
    expect(result.dayOffset).toBe(0);
  });

  it("converts New York to Kolkata", () => {
    const result = ok(
      convert("2026-11-22", "10:30", "America/New_York", "Asia/Kolkata"),
    );
    expect(result.instant).toBe(instant("2026-11-22T15:30:00Z"));
    expect(result.sourceOffsetMinutes).toBe(-300);
    expect(result.targetOffsetMinutes).toBe(330);
    expect(result.target).toMatchObject({ hour: 21, minute: 0, day: 22 });
    expect(result.differenceMinutes).toBe(630);
    expect(result.dayOffset).toBe(0);
  });

  it("converts London to Tokyo in summer time", () => {
    const result = ok(
      convert("2026-06-01", "09:00", "Europe/London", "Asia/Tokyo"),
    );
    expect(result.sourceOffsetMinutes).toBe(60);
    expect(result.targetOffsetMinutes).toBe(540);
    expect(result.target).toMatchObject({ hour: 17, minute: 0, day: 1 });
    expect(result.differenceMinutes).toBe(480);
    expect(result.dayOffset).toBe(0);
  });

  it("converts the same zone to itself", () => {
    const result = ok(
      convert("2026-06-01", "09:00", "Europe/Madrid", "Europe/Madrid"),
    );
    expect(result.target).toMatchObject({ hour: 9, minute: 0, day: 1 });
    expect(result.differenceMinutes).toBe(0);
    expect(result.dayOffset).toBe(0);
    expect(result.ambiguous).toBe(false);
  });

  it("rolls back to the previous date", () => {
    const result = ok(
      convert("2026-01-01", "01:00", "Asia/Tokyo", "America/New_York"),
    );
    expect(result.target).toMatchObject({
      year: 2025,
      month: 12,
      day: 31,
      hour: 11,
      minute: 0,
    });
    expect(result.dayOffset).toBe(-1);
    expect(result.differenceMinutes).toBe(-840);
  });

  it("rolls forward to the next date", () => {
    const result = ok(
      convert("2026-01-01", "22:00", "America/New_York", "Asia/Tokyo"),
    );
    expect(result.target).toMatchObject({
      year: 2026,
      month: 1,
      day: 2,
      hour: 12,
      minute: 0,
    });
    expect(result.dayOffset).toBe(1);
    expect(result.differenceMinutes).toBe(840);
  });

  it("handles a two-day date-line difference", () => {
    const result = ok(
      convert("2026-01-01", "23:30", "Etc/GMT+12", "Pacific/Kiritimati"),
    );
    expect(result.instant).toBe(instant("2026-01-02T11:30:00Z"));
    expect(result.target).toMatchObject({
      year: 2026,
      month: 1,
      day: 3,
      hour: 1,
      minute: 30,
    });
    expect(result.dayOffset).toBe(2);
    expect(result.differenceMinutes).toBe(1560);
  });
});

describe("offsets", () => {
  it("handles half-hour and quarter-hour offsets", () => {
    const kolkata = ok(convert("2026-11-22", "10:30", "UTC", "Asia/Kolkata"));
    expect(kolkata.targetOffsetMinutes).toBe(330);
    expect(formatUtcOffset(kolkata.targetOffsetMinutes)).toBe("UTC+05:30");

    const kathmandu = ok(
      convert("2026-11-22", "10:30", "UTC", "Asia/Kathmandu"),
    );
    expect(kathmandu.targetOffsetMinutes).toBe(345);
    expect(kathmandu.target).toMatchObject({ hour: 16, minute: 15 });
    expect(formatUtcOffset(kathmandu.targetOffsetMinutes)).toBe("UTC+05:45");

    const chatham = ok(
      convert("2026-06-01", "10:30", "UTC", "Pacific/Chatham"),
    );
    expect(chatham.targetOffsetMinutes).toBe(765);
    expect(chatham.target).toMatchObject({ hour: 23, minute: 15 });
    expect(formatUtcOffset(chatham.targetOffsetMinutes)).toBe("UTC+12:45");
  });

  it("uses the offset for the converted instant, not today", () => {
    const winter = ok(
      convert("2026-01-15", "12:00", "America/New_York", "UTC"),
    );
    const summer = ok(
      convert("2026-07-15", "12:00", "America/New_York", "UTC"),
    );
    expect(winter.sourceOffsetMinutes).toBe(-300);
    expect(summer.sourceOffsetMinutes).toBe(-240);
    expect(formatUtcOffset(winter.sourceOffsetMinutes)).toBe("UTC−05:00");
    expect(formatUtcOffset(summer.sourceOffsetMinutes)).toBe("UTC−04:00");
  });

  it("calculates offsets for an arbitrary instant", () => {
    expect(
      offsetMinutesAt(instant("2026-01-15T12:00:00Z"), "Europe/Madrid"),
    ).toBe(60);
    expect(
      offsetMinutesAt(instant("2026-07-15T12:00:00Z"), "Europe/Madrid"),
    ).toBe(120);
    expect(
      offsetMinutesAt(instant("2026-01-15T12:00:00Z"), "Asia/Kolkata"),
    ).toBe(330);
  });

  it("formats positive, negative, and zero offsets", () => {
    expect(formatUtcOffset(0)).toBe("UTC+00:00");
    expect(formatUtcOffset(330)).toBe("UTC+05:30");
    expect(formatUtcOffset(345)).toBe("UTC+05:45");
    expect(formatUtcOffset(765)).toBe("UTC+12:45");
    expect(formatUtcOffset(-240)).toBe("UTC−04:00");
    expect(formatUtcOffset(-570)).toBe("UTC−09:30");
  });
});

describe("daylight-saving gaps", () => {
  it("rejects the New York spring-forward gap", () => {
    const result = convert(
      "2026-03-08",
      "02:30",
      "America/New_York",
      "Europe/London",
    );
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected a DST gap");
    expect(result.issue).toBe("nonexistent");
    expect(result.gapMinutes).toBe(60);
  });

  it("resolves valid times immediately before and after the gap", () => {
    const before = ok(
      convert("2026-03-08", "01:30", "America/New_York", "UTC"),
    );
    expect(before.sourceOffsetMinutes).toBe(-300);
    expect(before.instant).toBe(instant("2026-03-08T06:30:00Z"));

    const after = ok(convert("2026-03-08", "03:30", "America/New_York", "UTC"));
    expect(after.sourceOffsetMinutes).toBe(-240);
    expect(after.instant).toBe(instant("2026-03-08T07:30:00Z"));
  });

  it("rejects a gap even when the target zone is the same", () => {
    const result = convert(
      "2026-03-08",
      "02:30",
      "America/New_York",
      "America/New_York",
    );
    expect(result).toMatchObject({
      ok: false,
      issue: "nonexistent",
      gapMinutes: 60,
    });
  });

  it("reports a gap through the wall-time resolver", () => {
    const resolution = resolveWallTime({
      date: { year: 2026, month: 3, day: 8 },
      hour: 2,
      minute: 30,
      timeZone: "America/New_York",
    });
    expect(resolution.kind).toBe("nonexistent");
  });
});

describe("daylight-saving overlaps", () => {
  it("selects the first occurrence and discloses the ambiguity", () => {
    const result = ok(
      convert("2026-11-01", "01:30", "America/New_York", "Asia/Kolkata"),
    );
    expect(result.instant).toBe(instant("2026-11-01T05:30:00Z"));
    expect(result.ambiguous).toBe(true);
    expect(result.selectedOffsetMinutes).toBe(-240);
    expect(result.alternateOffsetMinutes).toBe(-300);
    expect(result.sourceOffsetMinutes).toBe(-240);
    expect(result.target).toMatchObject({ hour: 11, minute: 0, day: 1 });
  });

  it("returns both candidate instants from the resolver", () => {
    const resolution = resolveWallTime({
      date: { year: 2026, month: 11, day: 1 },
      hour: 1,
      minute: 30,
      timeZone: "America/New_York",
    });
    expect(resolution.kind).toBe("ambiguous");
    if (resolution.kind !== "ambiguous") return;
    expect(resolution.instant).toBe(instant("2026-11-01T05:30:00Z"));
    expect(resolution.alternateInstant).toBe(instant("2026-11-01T06:30:00Z"));
    expect(resolution.instant).toBeLessThan(resolution.alternateInstant);
    expect(resolution.offsetMinutes).toBe(-240);
    expect(resolution.alternateOffsetMinutes).toBe(-300);
  });

  it("resolves valid times on either side of the overlap", () => {
    const before = ok(
      convert("2026-11-01", "00:30", "America/New_York", "UTC"),
    );
    expect(before.sourceOffsetMinutes).toBe(-240);
    expect(before.ambiguous).toBe(false);

    const after = ok(convert("2026-11-01", "02:30", "America/New_York", "UTC"));
    expect(after.sourceOffsetMinutes).toBe(-300);
    expect(after.ambiguous).toBe(false);
  });

  it("does not flag an ordinary time as ambiguous", () => {
    const result = ok(
      convert("2026-11-22", "10:30", "America/New_York", "Asia/Kolkata"),
    );
    expect(result.ambiguous).toBe(false);
    expect(result.selectedOffsetMinutes).toBeNull();
    expect(result.alternateOffsetMinutes).toBeNull();
  });
});

describe("validation", () => {
  it("rejects missing date and time", () => {
    expect(convert("", "10:30", "UTC", "UTC")).toMatchObject({
      ok: false,
      issue: "empty-date",
    });
    expect(convert("2026-11-22", "", "UTC", "UTC")).toMatchObject({
      ok: false,
      issue: "empty-time",
    });
  });

  it("rejects invalid dates and times", () => {
    for (const date of ["2026-02-30", "2026-13-01", "not-a-date", "2026-1-1"]) {
      expect(convert(date, "10:30", "UTC", "UTC"), date).toMatchObject({
        ok: false,
        issue: "invalid-date",
      });
    }
    for (const time of ["24:00", "12:60", "12:5", "noon", "10:30:45"]) {
      expect(convert("2026-11-22", time, "UTC", "UTC"), time).toMatchObject({
        ok: false,
        issue: "invalid-time",
      });
    }
    expect(convert("2026-11-22", "10:30:00", "UTC", "UTC").ok).toBe(true);
  });

  it("enforces the supported year range", () => {
    expect(
      convert(`${MIN_TIME_ZONE_YEAR - 1}-12-31`, "10:30", "UTC", "UTC"),
    ).toMatchObject({ ok: false, issue: "date-range" });
    expect(
      convert(`${MAX_TIME_ZONE_YEAR + 1}-01-01`, "10:30", "UTC", "UTC"),
    ).toMatchObject({ ok: false, issue: "date-range" });
    expect(
      convert(`${MIN_TIME_ZONE_YEAR}-01-01`, "10:30", "UTC", "UTC").ok,
    ).toBe(true);
    expect(
      convert(`${MAX_TIME_ZONE_YEAR}-12-31`, "10:30", "UTC", "UTC").ok,
    ).toBe(true);
  });

  it("rejects unknown source and target zones", () => {
    expect(convert("2026-11-22", "10:30", "Not/AZone", "UTC")).toMatchObject({
      ok: false,
      issue: "invalid-source-zone",
    });
    expect(convert("2026-11-22", "10:30", "UTC", "Not/AZone")).toMatchObject({
      ok: false,
      issue: "invalid-target-zone",
    });
    expect(convert("2026-11-22", "10:30", "", "UTC")).toMatchObject({
      ok: false,
      issue: "invalid-source-zone",
    });
  });

  it("recovers after an invalid input", () => {
    expect(convert("2026-02-30", "10:30", "UTC", "UTC").ok).toBe(false);
    const recovered = ok(convert("2026-11-22", "10:30", "UTC", "UTC"));
    expect(recovered.target.hour).toBe(10);
  });
});

describe("parts and day helpers", () => {
  it("returns numeric parts for an explicit zone", () => {
    const parts = zonedParts(instant("2026-11-22T15:30:00Z"), "Asia/Kolkata");
    expect(parts).toMatchObject({
      year: 2026,
      month: 11,
      day: 22,
      hour: 21,
      minute: 0,
    });
  });

  it("computes whole-day offsets", () => {
    expect(
      dayOffsetBetween(
        { year: 2026, month: 11, day: 22 },
        { year: 2026, month: 11, day: 22 },
      ),
    ).toBe(0);
    expect(
      dayOffsetBetween(
        { year: 2026, month: 11, day: 22 },
        { year: 2026, month: 11, day: 23 },
      ),
    ).toBe(1);
    expect(
      dayOffsetBetween(
        { year: 2026, month: 11, day: 22 },
        { year: 2026, month: 11, day: 21 },
      ),
    ).toBe(-1);
  });
});

describe("localized formatting", () => {
  const parts = {
    year: 2026,
    month: 11,
    day: 22,
    hour: 10,
    minute: 30,
    second: 0,
  };

  it("formats dates, times, and weekdays in English", () => {
    expect(formatZoneDate(parts, "en-US")).toBe("November 22, 2026");
    expect(formatZoneTime(parts, "en-US")).toBe("10:30 AM");
    expect(formatZoneWeekday(parts, "en-US")).toBe("Sunday");
    expect(formatZoneDateTime(parts, "en-US")).toBe(
      "November 22, 2026 at 10:30 AM",
    );
  });

  it("formats dates, times, and weekdays in Spanish", () => {
    expect(formatZoneDate(parts, "es-ES")).toBe("22 de noviembre de 2026");
    expect(formatZoneTime(parts, "es-ES")).toBe("10:30");
    expect(formatZoneWeekday(parts, "es-ES")).toBe("domingo");
    expect(formatZoneDateTime(parts, "es-ES")).toBe(
      "22 de noviembre de 2026 a las 10:30",
    );
  });

  it("formats midnight and noon without edge-case drift", () => {
    const midnight = { ...parts, hour: 0, minute: 5 };
    const noon = { ...parts, hour: 12, minute: 0 };
    expect(formatZoneTime(midnight, "en-US")).toBe("12:05 AM");
    expect(formatZoneTime(noon, "en-US")).toBe("12:00 PM");
    expect(formatZoneTime(midnight, "es-ES")).toBe("0:05");
  });
});

describe("host-timezone independence", () => {
  it("returns identical results under different host TZ settings", () => {
    const snapshot = () =>
      JSON.stringify({
        newYorkToKolkata: convert(
          "2026-11-22",
          "10:30",
          "America/New_York",
          "Asia/Kolkata",
        ),
        winterOffset: convert("2026-01-15", "12:00", "America/New_York", "UTC"),
        summerOffset: convert("2026-07-15", "12:00", "America/New_York", "UTC"),
        gap: convert("2026-03-08", "02:30", "America/New_York", "UTC"),
        overlap: convert(
          "2026-11-01",
          "01:30",
          "America/New_York",
          "Asia/Kolkata",
        ),
        kathmandu: convert("2026-11-22", "10:30", "UTC", "Asia/Kathmandu"),
        formatted: [
          formatZoneDate(
            { year: 2026, month: 11, day: 22, hour: 10, minute: 30, second: 0 },
            "en-US",
          ),
          formatZoneTime(
            { year: 2026, month: 11, day: 22, hour: 10, minute: 30, second: 0 },
            "es-ES",
          ),
          formatZoneWeekday(
            { year: 2026, month: 11, day: 22, hour: 10, minute: 30, second: 0 },
            "es-ES",
          ),
        ],
      });

    const expected = snapshot();
    const original = process.env.TZ;

    try {
      for (const timezone of [
        "UTC",
        "America/New_York",
        "Asia/Kolkata",
        "Pacific/Kiritimati",
        "Europe/Madrid",
      ]) {
        process.env.TZ = timezone;
        expect(snapshot(), `TZ=${timezone}`).toBe(expected);
      }
    } finally {
      if (original === undefined) {
        delete process.env.TZ;
      } else {
        process.env.TZ = original;
      }
    }
  });
});
