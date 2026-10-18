import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import {
  calculateAge,
  difference,
  shiftDate,
  type CivilDate,
} from "../src/lib/date-math";
import {
  formatBreakdown,
  formatDayCount,
  formatLongDate,
  formatWeekday,
} from "../src/lib/date-format";

/*
 * M7 Phase 2 timezone independence: the pure calendar module and the Intl
 * display helpers must return identical results whatever the host timezone
 * is. Each assertion re-runs the real shipped modules in a child Node process
 * with a different TZ — including zones whose DST window covers the sample
 * dates — and compares the output with the in-process result. The modules
 * never read the host clock or local-time Date methods; this test would fail
 * if a future refactor introduced local-time parsing or formatting.
 *
 * Node's native TypeScript type-stripping loads both modules directly; the
 * only cross-module import is type-only, so no loader is needed.
 */

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "Pacific/Kiritimati",
  "America/St_Johns",
  "Asia/Kathmandu",
  "Europe/Madrid",
];

const PROBE = [
  `Promise.all([`,
  `  import("./src/lib/date-math.ts"),`,
  `  import("./src/lib/date-format.ts"),`,
  `]).then(([m, f]) => {`,
  `  process.stdout.write(JSON.stringify({`,
  `    dstMarch: m.difference({year:2026,month:3,day:7},{year:2026,month:3,day:9}),`,
  `    dstAutumn: m.difference({year:2026,month:10,day:31},{year:2026,month:11,day:2}),`,
  `    leapShift: m.shiftDate({year:2024,month:2,day:29}, 1, "years"),`,
  `    subtractClamp: m.shiftDate({year:2026,month:3,day:31}, -1, "months"),`,
  `    monthEnd: m.difference({year:2026,month:1,day:31},{year:2026,month:3,day:1}),`,
  `    age: m.calculateAge({year:2000,month:2,day:29},{year:2026,month:2,day:28}),`,
  `    weekday: f.formatWeekday({year:2026,month:3,day:15},"en-US"),`,
  `    longDate: f.formatLongDate({year:2026,month:3,day:1},"es-ES"),`,
  `    dayCount: f.formatDayCount(9496,"en-US"),`,
  `    breakdown: f.formatBreakdown({years:0,months:2,days:14},"es-ES"),`,
  `  }));`,
  `});`,
].join("\n");

function runProbe(timezone: string): string {
  return execFileSync(process.execPath, ["-e", PROBE], {
    cwd: process.cwd(),
    env: { ...process.env, TZ: timezone },
    encoding: "utf8",
  });
}

const march7 = (): CivilDate => ({ year: 2026, month: 3, day: 7 });
const march9 = (): CivilDate => ({ year: 2026, month: 3, day: 9 });

describe("timezone independence", () => {
  it("computes and formats identically in every timezone", () => {
    const expected = JSON.stringify({
      dstMarch: difference(march7(), march9()),
      dstAutumn: difference(
        { year: 2026, month: 10, day: 31 },
        { year: 2026, month: 11, day: 2 },
      ),
      leapShift: shiftDate({ year: 2024, month: 2, day: 29 }, 1, "years"),
      subtractClamp: shiftDate({ year: 2026, month: 3, day: 31 }, -1, "months"),
      monthEnd: difference(
        { year: 2026, month: 1, day: 31 },
        { year: 2026, month: 3, day: 1 },
      ),
      age: calculateAge(
        { year: 2000, month: 2, day: 29 },
        { year: 2026, month: 2, day: 28 },
      ),
      weekday: formatWeekday({ year: 2026, month: 3, day: 15 }, "en-US"),
      longDate: formatLongDate({ year: 2026, month: 3, day: 1 }, "es-ES"),
      dayCount: formatDayCount(9496, "en-US"),
      breakdown: formatBreakdown({ years: 0, months: 2, days: 14 }, "es-ES"),
    });

    for (const timezone of TIMEZONES) {
      expect(runProbe(timezone), `TZ=${timezone}`).toBe(expected);
    }
  });

  it("keeps the results themselves correct", () => {
    expect(difference(march7(), march9())?.days).toBe(2);
    expect(
      difference(
        { year: 2026, month: 10, day: 31 },
        { year: 2026, month: 11, day: 2 },
      )?.days,
    ).toBe(2);
  });
});
