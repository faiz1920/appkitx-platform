import { describe, expect, it } from "vitest";
import {
  calculateAge,
  civilFromDays,
  daysFromCivil,
  daysInMonth,
  difference,
  formatDateInput,
  isLeapYear,
  isValidCivilDate,
  parseDateInput,
  shiftDate,
  weekdayIndex,
  type CivilDate,
} from "../src/lib/date-math";

/*
 * M7 Phase 2 pure calendar arithmetic: leap years, month ends, clamping,
 * exclusive day counts, canonical years/months/days breakdowns, reversed and
 * equal dates, birth-date boundaries (including Feb 29), and invalid input.
 * All expectations are hand-computed and independent of the system clock.
 */

const date = (year: number, month: number, day: number): CivilDate => ({
  year,
  month,
  day,
});

describe("leap years and month lengths", () => {
  it("recognizes leap years on the 4/100/400 rule", () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2025)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2100)).toBe(false);
    expect(isLeapYear(2028)).toBe(true);
  });

  it("returns the length of every month", () => {
    expect(daysInMonth(2026, 1)).toBe(31);
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2000, 2)).toBe(29);
    expect(daysInMonth(1900, 2)).toBe(28);
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });

  it("validates civil dates structurally", () => {
    expect(isValidCivilDate(date(2024, 2, 29))).toBe(true);
    expect(isValidCivilDate(date(2025, 2, 29))).toBe(false);
    expect(isValidCivilDate(date(2026, 4, 31))).toBe(false);
    expect(isValidCivilDate(date(2026, 13, 1))).toBe(false);
    expect(isValidCivilDate(date(2026, 0, 1))).toBe(false);
    expect(isValidCivilDate(date(2026, 1, 0))).toBe(false);
    expect(isValidCivilDate(date(2026, 1, 32))).toBe(false);
    expect(isValidCivilDate({ year: 2026, month: 1.5, day: 1 })).toBe(false);
    expect(isValidCivilDate({ year: 0, month: 1, day: 1 })).toBe(false);
  });
});

describe("day numbers", () => {
  it("anchors day 0 at 1970-01-01 and round-trips", () => {
    expect(daysFromCivil(date(1970, 1, 1))).toBe(0);
    expect(civilFromDays(0)).toEqual(date(1970, 1, 1));
    expect(daysFromCivil(date(2000, 1, 1))).toBe(10957);
    expect(daysFromCivil(date(2026, 3, 1))).toBe(20513);
    expect(civilFromDays(-1)).toEqual(date(1969, 12, 31));
  });

  it("round-trips across leap boundaries and month ends", () => {
    for (const sample of [
      date(2024, 2, 29),
      date(2025, 2, 28),
      date(2026, 12, 31),
      date(1999, 12, 31),
      date(2100, 3, 1),
    ]) {
      expect(civilFromDays(daysFromCivil(sample))).toEqual(sample);
    }
  });

  it("computes weekdays with Sunday as 0", () => {
    expect(weekdayIndex(date(1970, 1, 1))).toBe(4);
    expect(weekdayIndex(date(1970, 1, 4))).toBe(0);
    expect(weekdayIndex(date(2000, 1, 1))).toBe(6);
    expect(weekdayIndex(date(2024, 2, 29))).toBe(4);
    expect(weekdayIndex(date(2026, 3, 1))).toBe(0);
    expect(weekdayIndex(date(2026, 3, 15))).toBe(0);
  });
});

describe("parseDateInput and formatDateInput", () => {
  it("parses valid native date-input values", () => {
    expect(parseDateInput("2026-03-01")).toEqual(date(2026, 3, 1));
    expect(parseDateInput("2024-02-29")).toEqual(date(2024, 2, 29));
    expect(parseDateInput(" 2026-01-15 ")).toEqual(date(2026, 1, 15));
  });

  it("rejects malformed, impossible, and empty values", () => {
    expect(parseDateInput("")).toBeNull();
    expect(parseDateInput("2026-3-1")).toBeNull();
    expect(parseDateInput("2026-02-30")).toBeNull();
    expect(parseDateInput("2025-02-29")).toBeNull();
    expect(parseDateInput("2026-13-01")).toBeNull();
    expect(parseDateInput("not a date")).toBeNull();
    expect(parseDateInput("2026-01-15T00:00")).toBeNull();
  });

  it("serializes with zero padding", () => {
    expect(formatDateInput(date(2026, 3, 1))).toBe("2026-03-01");
    expect(formatDateInput(date(2026, 11, 30))).toBe("2026-11-30");
  });
});

describe("difference", () => {
  it("counts days exclusively and treats equal dates as zero", () => {
    expect(difference(date(2026, 1, 1), date(2026, 1, 2))?.days).toBe(1);
    expect(difference(date(2026, 1, 1), date(2026, 1, 1))?.days).toBe(0);
    expect(difference(date(2026, 1, 1), date(2026, 3, 1))?.days).toBe(59);
  });

  it("is absolute, so reversed dates give the same result", () => {
    const forward = difference(date(2026, 1, 1), date(2026, 3, 1));
    const reversed = difference(date(2026, 3, 1), date(2026, 1, 1));
    expect(reversed).toEqual(forward);
    expect(reversed?.breakdown).toEqual({ years: 0, months: 2, days: 0 });
  });

  it("counts calendar days across DST windows in whole numbers", () => {
    expect(difference(date(2026, 3, 7), date(2026, 3, 9))?.days).toBe(2);
    expect(difference(date(2026, 10, 31), date(2026, 11, 2))?.days).toBe(2);
    expect(difference(date(2024, 2, 28), date(2024, 3, 1))?.days).toBe(2);
  });

  it("breaks down with clamped month arithmetic", () => {
    expect(difference(date(2026, 1, 1), date(2026, 3, 1))?.breakdown).toEqual({
      years: 0,
      months: 2,
      days: 0,
    });
    expect(difference(date(2025, 1, 31), date(2025, 2, 28))?.breakdown).toEqual(
      { years: 0, months: 1, days: 0 },
    );
    expect(difference(date(2025, 1, 31), date(2025, 3, 1))?.breakdown).toEqual({
      years: 0,
      months: 1,
      days: 1,
    });
    expect(difference(date(2024, 2, 29), date(2025, 2, 28))?.breakdown).toEqual(
      { years: 1, months: 0, days: 0 },
    );
    expect(difference(date(2024, 2, 29), date(2025, 3, 1))?.breakdown).toEqual({
      years: 1,
      months: 0,
      days: 1,
    });
    expect(difference(date(2024, 3, 31), date(2024, 4, 30))?.breakdown).toEqual(
      { years: 0, months: 1, days: 0 },
    );
    expect(difference(date(2020, 1, 1), date(2026, 1, 1))?.breakdown).toEqual({
      years: 6,
      months: 0,
      days: 0,
    });
    expect(
      difference(date(2025, 12, 15), date(2026, 1, 15))?.breakdown,
    ).toEqual({ years: 0, months: 1, days: 0 });
  });

  it("reconstructs the end date from the anchored breakdown", () => {
    const samples: Array<[CivilDate, CivilDate]> = [
      [date(2026, 1, 31), date(2026, 3, 1)],
      [date(2024, 2, 29), date(2025, 3, 1)],
      [date(2023, 1, 31), date(2023, 3, 30)],
      [date(2025, 6, 15), date(2026, 6, 14)],
      [date(2026, 1, 1), date(2026, 12, 31)],
      [date(2000, 2, 29), date(2028, 2, 28)],
    ];
    for (const [start, end] of samples) {
      const result = difference(start, end);
      if (!result) throw new Error("expected a result");
      const { years, months, days } = result.breakdown;
      const anchor = shiftDate(start, years * 12 + months, "months");
      const reconstructed = anchor && shiftDate(anchor, days, "days");
      expect(reconstructed).toEqual(end);
    }
  });
});

describe("shiftDate", () => {
  it("adds exact day and week counts", () => {
    expect(shiftDate(date(2026, 1, 1), 1, "days")).toEqual(date(2026, 1, 2));
    expect(shiftDate(date(2025, 12, 31), 1, "days")).toEqual(date(2026, 1, 1));
    expect(shiftDate(date(2026, 1, 1), 0, "days")).toEqual(date(2026, 1, 1));
    expect(shiftDate(date(2026, 1, 1), 2, "weeks")).toEqual(date(2026, 1, 15));
    expect(shiftDate(date(2026, 1, 1), 365, "days")).toEqual(date(2027, 1, 1));
  });

  it("clamps month arithmetic to the last valid day", () => {
    expect(shiftDate(date(2026, 1, 31), 1, "months")).toEqual(
      date(2026, 2, 28),
    );
    expect(shiftDate(date(2024, 1, 31), 1, "months")).toEqual(
      date(2024, 2, 29),
    );
    expect(shiftDate(date(2026, 8, 31), 1, "months")).toEqual(
      date(2026, 9, 30),
    );
    expect(shiftDate(date(2026, 3, 31), 1, "months")).toEqual(
      date(2026, 4, 30),
    );
    expect(shiftDate(date(2026, 12, 15), 1, "months")).toEqual(
      date(2027, 1, 15),
    );
    expect(shiftDate(date(2026, 10, 31), 4, "months")).toEqual(
      date(2027, 2, 28),
    );
  });

  it("clamps year arithmetic for Feb 29", () => {
    expect(shiftDate(date(2024, 2, 29), 1, "years")).toEqual(date(2025, 2, 28));
    expect(shiftDate(date(2024, 2, 29), 4, "years")).toEqual(date(2028, 2, 29));
  });

  it("subtracts exact day and week counts for negative amounts", () => {
    expect(shiftDate(date(2026, 1, 1), -1, "days")).toEqual(date(2025, 12, 31));
    expect(shiftDate(date(2026, 1, 15), -2, "weeks")).toEqual(date(2026, 1, 1));
    expect(shiftDate(date(2026, 3, 1), -3, "days")).toEqual(date(2026, 2, 26));
  });

  it("clamps negative month and year steps to the last valid day", () => {
    expect(shiftDate(date(2026, 3, 31), -1, "months")).toEqual(
      date(2026, 2, 28),
    );
    expect(shiftDate(date(2024, 3, 31), -1, "months")).toEqual(
      date(2024, 2, 29),
    );
    expect(shiftDate(date(2026, 1, 31), -1, "months")).toEqual(
      date(2025, 12, 31),
    );
    expect(shiftDate(date(2026, 12, 15), -12, "months")).toEqual(
      date(2025, 12, 15),
    );
    expect(shiftDate(date(2024, 2, 29), -1, "years")).toEqual(
      date(2023, 2, 28),
    );
    expect(shiftDate(date(2024, 2, 29), -4, "years")).toEqual(
      date(2020, 2, 29),
    );
  });

  it("keeps repeated operations deterministic but not associative", () => {
    const jan31 = date(2026, 1, 31);
    const feb28 = shiftDate(jan31, 1, "months");
    if (!feb28) throw new Error("expected a shift result");
    expect(shiftDate(feb28, 1, "months")).toEqual(date(2026, 3, 28));
    expect(shiftDate(jan31, 2, "months")).toEqual(date(2026, 3, 31));

    const mar31 = date(2026, 3, 31);
    const feb28Again = shiftDate(mar31, -1, "months");
    if (!feb28Again) throw new Error("expected a shift result");
    expect(shiftDate(feb28Again, -1, "months")).toEqual(date(2026, 1, 28));
    expect(shiftDate(mar31, -2, "months")).toEqual(date(2026, 1, 31));
  });

  it("rejects fractional, non-finite, and invalid input", () => {
    expect(shiftDate(date(2026, 1, 1), 1.5, "days")).toBeNull();
    expect(shiftDate(date(2026, 1, 1), Number.NaN, "days")).toBeNull();
    expect(
      shiftDate(date(2026, 1, 1), Number.POSITIVE_INFINITY, "days"),
    ).toBeNull();
    expect(shiftDate(date(2026, 2, 30), 1, "days")).toBeNull();
  });
});

describe("calculateAge", () => {
  it("increments on the birthday itself", () => {
    expect(calculateAge(date(1990, 6, 15), date(2026, 6, 15))).toEqual({
      years: 36,
      months: 0,
      days: 0,
      totalDays: 13149,
    });
    expect(calculateAge(date(1990, 6, 16), date(2026, 6, 15))).toEqual({
      years: 35,
      months: 11,
      days: 30,
      totalDays: 13148,
    });
    expect(calculateAge(date(1990, 6, 14), date(2026, 6, 15))).toEqual({
      years: 36,
      months: 0,
      days: 1,
      totalDays: 13150,
    });
  });

  it("treats the day of birth as age zero", () => {
    expect(calculateAge(date(2026, 6, 15), date(2026, 6, 15))).toEqual({
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
    });
  });

  it("counts Feb 29 birthdays on Feb 28 in non-leap years", () => {
    expect(calculateAge(date(2000, 2, 29), date(2025, 2, 28))).toEqual({
      years: 25,
      months: 0,
      days: 0,
      totalDays:
        daysFromCivil(date(2025, 2, 28)) - daysFromCivil(date(2000, 2, 29)),
    });
    expect(calculateAge(date(2000, 2, 29), date(2025, 2, 27))).toEqual({
      years: 24,
      months: 11,
      days: 29,
      totalDays:
        daysFromCivil(date(2025, 2, 27)) - daysFromCivil(date(2000, 2, 29)),
    });
    expect(calculateAge(date(2000, 2, 29), date(2025, 3, 1))).toEqual({
      years: 25,
      months: 0,
      days: 1,
      totalDays:
        daysFromCivil(date(2025, 3, 1)) - daysFromCivil(date(2000, 2, 29)),
    });
  });

  it("keeps the real birthday in leap years", () => {
    expect(calculateAge(date(2000, 2, 29), date(2024, 2, 29))).toEqual({
      years: 24,
      months: 0,
      days: 0,
      totalDays:
        daysFromCivil(date(2024, 2, 29)) - daysFromCivil(date(2000, 2, 29)),
    });
    expect(calculateAge(date(2000, 2, 29), date(2024, 2, 28))).toEqual({
      years: 23,
      months: 11,
      days: 30,
      totalDays:
        daysFromCivil(date(2024, 2, 28)) - daysFromCivil(date(2000, 2, 29)),
    });
    expect(calculateAge(date(2000, 2, 29), date(2028, 2, 28))).toEqual({
      years: 27,
      months: 11,
      days: 30,
      totalDays:
        daysFromCivil(date(2028, 2, 28)) - daysFromCivil(date(2000, 2, 29)),
    });
    expect(calculateAge(date(2000, 2, 29), date(2028, 2, 29))).toEqual({
      years: 28,
      months: 0,
      days: 0,
      totalDays:
        daysFromCivil(date(2028, 2, 29)) - daysFromCivil(date(2000, 2, 29)),
    });
  });

  it("counts a leap-day birth one year older after a non-leap rollover", () => {
    expect(calculateAge(date(2024, 2, 29), date(2025, 2, 28))).toEqual({
      years: 1,
      months: 0,
      days: 0,
      totalDays: 365,
    });
    expect(calculateAge(date(2024, 2, 29), date(2025, 3, 1))).toEqual({
      years: 1,
      months: 0,
      days: 1,
      totalDays: 366,
    });
  });

  it("rejects future birth dates and invalid input", () => {
    expect(calculateAge(date(2026, 1, 2), date(2026, 1, 1))).toBeNull();
    expect(calculateAge(date(2025, 2, 29), date(2026, 1, 1))).toBeNull();
    expect(calculateAge(date(2026, 1, 1), date(2026, 13, 1))).toBeNull();
  });

  it("agrees with difference on the total day count", () => {
    const birth = date(1995, 11, 3);
    const today = date(2026, 10, 19);
    const age = calculateAge(birth, today);
    const diff = difference(birth, today);
    expect(age?.totalDays).toBe(diff?.days);
    expect(age).toMatchObject(diff?.breakdown ?? {});
  });
});

/*
 * Deterministic property checks against an independent day-number reference
 * (UTC-epoch arithmetic, no code shared with the module): exact day counts,
 * breakdown bounds and reconstruction, symmetry, and birthday boundaries,
 * over edge-dense and random samples.
 */
describe("property checks against an independent reference", () => {
  const refDayNumber = (value: CivilDate): number => {
    const reference = new Date(0);
    reference.setUTCFullYear(value.year, value.month - 1, value.day);
    return Math.round(reference.getTime() / 86_400_000);
  };

  let seed = 0x2f6e2b1;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const pick = (items: readonly number[]): number =>
    items[Math.floor(random() * items.length)] ?? 0;
  const randomInt = (min: number, max: number) =>
    min + Math.floor(random() * (max - min + 1));

  const edgeDays = [1, 2, 27, 28, 29, 30, 31];
  const edgeMonths = [1, 2, 3, 4, 12];
  const edgeYears = [
    4, 100, 400, 1900, 1999, 2000, 2023, 2024, 2025, 2026, 2027, 2028, 2100,
    2400, 9999,
  ];

  const randomDate = (edgeBiased: boolean): CivilDate => {
    const year = edgeBiased ? pick(edgeYears) : randomInt(1, 9999);
    const month = edgeBiased ? pick(edgeMonths) : randomInt(1, 12);
    const maxDay = daysInMonth(year, month);
    const candidates = edgeDays.filter((day) => day <= maxDay);
    const day =
      edgeBiased && candidates.length > 0
        ? pick(candidates)
        : randomInt(1, maxDay);
    return { year, month, day };
  };

  it("holds for 3,000 random date pairs", () => {
    for (let index = 0; index < 3000; index++) {
      const a = randomDate(index % 3 === 0);
      const b = randomDate(index % 5 === 0);

      expect(daysFromCivil(a)).toBe(refDayNumber(a));
      expect(civilFromDays(refDayNumber(a))).toEqual(a);

      const forward = difference(a, b);
      const reversed = difference(b, a);
      expect(reversed).toEqual(forward);
      if (!forward) throw new Error("expected a difference");

      expect(forward.days).toBe(Math.abs(refDayNumber(a) - refDayNumber(b)));
      const { years, months, days } = forward.breakdown;
      expect(years).toBeGreaterThanOrEqual(0);
      expect(months).toBeGreaterThanOrEqual(0);
      expect(months).toBeLessThanOrEqual(11);
      expect(days).toBeGreaterThanOrEqual(0);
      expect(days).toBeLessThanOrEqual(30);

      const [start, end] = refDayNumber(a) <= refDayNumber(b) ? [a, b] : [b, a];
      const anchor = shiftDate(start, years * 12 + months, "months");
      if (!anchor) throw new Error("expected an anchor");
      expect(shiftDate(anchor, days, "days")).toEqual(end);
    }
  });

  it("holds birthday boundaries for every sampled birth date", () => {
    const births: CivilDate[] = [
      date(1990, 6, 15),
      date(2000, 2, 29),
      date(2024, 2, 29),
      date(1999, 12, 31),
      date(2026, 1, 31),
      date(2000, 2, 28),
    ];
    for (const birth of births) {
      for (const years of [0, 1, 4, 25, 29]) {
        const target = shiftDate(birth, years, "years");
        if (!target) throw new Error("expected a target date");
        expect(calculateAge(birth, target)).toEqual({
          years,
          months: 0,
          days: 0,
          totalDays: refDayNumber(target) - refDayNumber(birth),
        });

        const dayAfter = civilFromDays(refDayNumber(target) + 1);
        expect(calculateAge(birth, dayAfter)).toEqual({
          years,
          months: 0,
          days: 1,
          totalDays: refDayNumber(dayAfter) - refDayNumber(birth),
        });

        const dayBefore = civilFromDays(refDayNumber(target) - 1);
        if (refDayNumber(dayBefore) >= refDayNumber(birth)) {
          const age = calculateAge(birth, dayBefore);
          if (!age) throw new Error("expected an age");
          const anchor = shiftDate(
            birth,
            age.years * 12 + age.months,
            "months",
          );
          if (!anchor) throw new Error("expected an anchor");
          expect(shiftDate(anchor, age.days, "days")).toEqual(dayBefore);
          expect(age.totalDays).toBe(
            refDayNumber(dayBefore) - refDayNumber(birth),
          );
        }
      }
    }
  });
});
