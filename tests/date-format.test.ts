import { describe, expect, it } from "vitest";
import {
  formatBreakdown,
  formatDayCount,
  formatLongDate,
  formatUnitAmount,
  formatWeekday,
} from "../src/lib/date-format";

/*
 * M7 Phase 2 display helpers: localized date, weekday, day counts, unit
 * amounts, and years/months/days lists. Formatting runs through an explicit
 * UTC instant, so expectations hold in every host timezone.
 */

describe("formatLongDate", () => {
  it("formats English long dates", () => {
    expect(formatLongDate({ year: 2026, month: 3, day: 1 }, "en-US")).toBe(
      "March 1, 2026",
    );
    expect(formatLongDate({ year: 2024, month: 2, day: 29 }, "en-US")).toBe(
      "February 29, 2024",
    );
  });

  it("formats Spanish long dates", () => {
    expect(formatLongDate({ year: 2026, month: 3, day: 1 }, "es-ES")).toBe(
      "1 de marzo de 2026",
    );
    expect(formatLongDate({ year: 2026, month: 11, day: 30 }, "es-ES")).toBe(
      "30 de noviembre de 2026",
    );
  });
});

describe("formatWeekday", () => {
  it("names the correct weekday in both locales", () => {
    expect(formatWeekday({ year: 2026, month: 3, day: 15 }, "en-US")).toBe(
      "Sunday",
    );
    expect(formatWeekday({ year: 2026, month: 3, day: 15 }, "es-ES")).toBe(
      "domingo",
    );
    expect(formatWeekday({ year: 2026, month: 1, day: 1 }, "en-US")).toBe(
      "Thursday",
    );
  });
});

describe("formatDayCount", () => {
  it("uses localized unit names with correct plurality", () => {
    expect(formatDayCount(0, "en-US")).toBe("0 days");
    expect(formatDayCount(1, "en-US")).toBe("1 day");
    expect(formatDayCount(14, "en-US")).toBe("14 days");
    expect(formatDayCount(1, "es-ES")).toBe("1 día");
    expect(formatDayCount(14, "es-ES")).toBe("14 días");
  });

  it("groups large counts by locale", () => {
    expect(formatDayCount(9496, "en-US")).toBe("9,496 days");
    expect(formatDayCount(9496, "es-ES")).toBe("9496 días");
  });
});

describe("formatUnitAmount", () => {
  it("localizes amounts with unit names", () => {
    expect(formatUnitAmount(1, "months", "en-US")).toBe("1 month");
    expect(formatUnitAmount(3, "weeks", "en-US")).toBe("3 weeks");
    expect(formatUnitAmount(1, "months", "es-ES")).toBe("1 mes");
    expect(formatUnitAmount(3, "weeks", "es-ES")).toBe("3 semanas");
    expect(formatUnitAmount(2, "years", "es-ES")).toBe("2 años");
    expect(formatUnitAmount(0, "days", "en-US")).toBe("0 days");
  });
});

describe("formatBreakdown", () => {
  it("joins years, months, and days with locale list rules", () => {
    expect(formatBreakdown({ years: 1, months: 0, days: 3 }, "en-US")).toBe(
      "1 year, 0 months, and 3 days",
    );
    expect(formatBreakdown({ years: 0, months: 2, days: 14 }, "es-ES")).toBe(
      "0 años, 2 meses y 14 días",
    );
    expect(formatBreakdown({ years: 0, months: 0, days: 0 }, "en-US")).toBe(
      "0 years, 0 months, and 0 days",
    );
  });
});
