import { describe, expect, it } from "vitest";
import {
  DEFAULT_HEADROOM_PERCENT,
  estimateBuildPower,
  POWER_ESTIMATES,
} from "../src/lib/pc-builder/power";
import {
  makeCase,
  makeCaseFan,
  makeCooler,
  makeCpu,
  makeGpu,
  makeMotherboard,
  makePsu,
  makeRam,
  makeStorage,
} from "./pc-builder-fixtures";

describe("estimateBuildPower", () => {
  it("sums manufacturer CPU/GPU power plus documented estimates", () => {
    const estimate = estimateBuildPower([
      makeCpu({ tdpW: 105, maxPowerW: 142 }),
      makeGpu({ powerDrawW: 220 }),
      makeMotherboard(),
      makeRam({ moduleCount: 2 }),
      makeStorage({ interface: "nvme" }),
      makeCaseFan(),
    ]);
    expect(estimate.sufficientData).toBe(true);
    // 142 (CPU boost) + 220 (GPU) + 50 + 8 + 8 + 3 = 431
    expect(estimate.loadWatts).toBe(431);
  });

  it("prefers CPU max boost power over base TDP when published", () => {
    const withBoost = estimateBuildPower([
      makeCpu({ tdpW: 125, maxPowerW: 181 }),
    ]);
    expect(withBoost.loadWatts).toBe(181);
    const baseOnly = estimateBuildPower([
      makeCpu({ tdpW: 125, maxPowerW: null }),
    ]);
    expect(baseOnly.loadWatts).toBe(125);
  });

  it("labels manufacturer values and estimates distinctly", () => {
    const estimate = estimateBuildPower([
      makeCpu({ tdpW: 65 }),
      makeGpu({ powerDrawW: 150 }),
      makeMotherboard(),
    ]);
    const kinds = Object.fromEntries(
      estimate.breakdown.map((item) => [item.label.split(" ")[0], item.kind]),
    );
    expect(kinds.CPU).toBe("manufacturer");
    expect(kinds.GPU).toBe("manufacturer");
    expect(kinds.Motherboard).toBe("estimate");
  });

  it("applies the default headroom policy to the recommendation", () => {
    const estimate = estimateBuildPower([makeCpu({ tdpW: 100 })]);
    expect(estimate.headroomPercent).toBe(DEFAULT_HEADROOM_PERCENT);
    expect(estimate.recommendedPsuW).toBe(Math.ceil(100 * 1.2));
  });

  it("supports a configurable headroom policy", () => {
    const estimate = estimateBuildPower([makeCpu({ tdpW: 100 })], {
      headroomPercent: 50,
    });
    expect(estimate.recommendedPsuW).toBe(150);
  });

  it("returns null totals when no CPU/GPU power data exists", () => {
    const estimate = estimateBuildPower([
      makeMotherboard(),
      makeCaseFan(),
      makeCase(),
    ]);
    expect(estimate.sufficientData).toBe(false);
    expect(estimate.loadWatts).toBeNull();
    expect(estimate.recommendedPsuW).toBeNull();
  });

  it("returns null totals when a selected core component has unknown power", () => {
    const estimate = estimateBuildPower([
      makeCpu({ tdpW: null, maxPowerW: null }),
      makeGpu({ powerDrawW: 200 }),
    ]);
    expect(estimate.sufficientData).toBe(false);
    expect(estimate.loadWatts).toBeNull();
    expect(estimate.assumptions.some((a) => a.includes("unknown"))).toBe(true);
  });

  it("explains its assumptions", () => {
    const estimate = estimateBuildPower([
      makeCpu({ tdpW: 65 }),
      makeMotherboard(),
    ]);
    expect(estimate.assumptions.length).toBeGreaterThan(0);
    expect(estimate.assumptions.join(" ")).toMatch(/estimate/i);
    expect(estimate.assumptions.join(" ")).toMatch(/headroom/i);
  });

  it("uses interface- and type-specific storage estimates", () => {
    const nvme = estimateBuildPower([
      makeCpu({ tdpW: 65 }),
      makeStorage({ interface: "nvme" }),
    ]);
    const hdd = estimateBuildPower([
      makeCpu({ tdpW: 65 }),
      makeStorage({
        interface: "sata",
        storageType: "hdd",
        formFactor: "3.5-inch",
        m2LengthMm: null,
        pcieGeneration: null,
      }),
    ]);
    expect(nvme.loadWatts).toBe(65 + POWER_ESTIMATES.storageNvmeW);
    expect(hdd.loadWatts).toBe(65 + POWER_ESTIMATES.storageHddW);
  });

  it("adds an AIO pump estimate for liquid coolers but not air coolers", () => {
    const aio = estimateBuildPower([
      makeCpu({ tdpW: 65 }),
      makeCooler({ type: "aio-liquid", heightMm: null, radiatorSizeMm: 240 }),
    ]);
    const air = estimateBuildPower([
      makeCpu({ tdpW: 65 }),
      makeCooler({ type: "air" }),
    ]);
    expect(aio.loadWatts).toBe(65 + POWER_ESTIMATES.aioPumpW);
    expect(air.loadWatts).toBe(65);
  });

  it("ignores PSU and case power draw", () => {
    const estimate = estimateBuildPower([
      makeCpu({ tdpW: 65 }),
      makePsu(),
      makeCase(),
    ]);
    expect(estimate.loadWatts).toBe(65);
  });
});
