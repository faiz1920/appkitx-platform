import { describe, expect, it } from "vitest";
import {
  evaluateBuild,
  resultsForComponent,
} from "../src/lib/pc-builder/engine";
import {
  componentCategories,
  type Component,
} from "../src/lib/pc-builder/types";
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

function completeCompatibleBuild() {
  return [
    makeCpu({ socket: "AM5", tdpW: 105 }),
    makeMotherboard({ socket: "AM5" }),
    makeRam({ generation: "DDR5" }),
    makeGpu({ pcieGeneration: 4, lengthMm: 250, powerDrawW: 220 }),
    makeCooler({ supportedSockets: ["AM5"], heightMm: 160 }),
    makeStorage(),
    makePsu({ wattage: 750 }),
    makeCase({ maxGpuLengthMm: 360, maxCoolerHeightMm: 170 }),
    makeCaseFan({ sizeMm: 120 }),
  ];
}

describe("evaluateBuild", () => {
  it("handles an empty build without claiming compatibility", () => {
    const report = evaluateBuild([]);
    expect(report.results).toEqual([]);
    expect(report.summary.status).toBe("unknown");
    expect(report.summary.missingCategories).toEqual([...componentCategories]);
    expect(report.power.sufficientData).toBe(false);
  });

  it("handles a partial build, evaluating only applicable rules", () => {
    const report = evaluateBuild([makeCpu(), makeMotherboard()]);
    const ruleIds = report.results.map((r) => r.ruleId);
    expect(ruleIds).toContain("cpu-motherboard-socket");
    expect(ruleIds).not.toContain("ram-generation");
    expect(ruleIds).not.toContain("gpu-case-length");
    expect(report.summary.missingCategories).toContain("gpu");
    expect(report.summary.missingCategories).not.toContain("cpu");
  });

  it("evaluates a complete compatible build with no incompatibilities", () => {
    const report = evaluateBuild(completeCompatibleBuild());
    expect(report.summary.counts.incompatible).toBe(0);
    expect(report.summary.counts.compatible).toBeGreaterThan(0);
    expect(report.summary.missingCategories).toEqual([]);
  });

  it("reports multiple simultaneous issues across categories", () => {
    const report = evaluateBuild([
      makeCpu({ socket: "AM4" }), // wrong socket
      makeMotherboard({ socket: "AM5", ramGeneration: "DDR5", maxRamGB: 64 }),
      makeRam({
        generation: "DDR4",
        moduleCapacityGB: 64,
        moduleCount: 2,
        totalCapacityGB: 128,
      }), // wrong gen + over capacity
      makeGpu({ lengthMm: 400 }), // too long
      makeCase({ maxGpuLengthMm: 300 }),
    ]);
    const incompatible = report.results.filter(
      (r) => r.status === "incompatible",
    );
    const ruleIds = incompatible.map((r) => r.ruleId);
    expect(ruleIds).toContain("cpu-motherboard-socket");
    expect(ruleIds).toContain("ram-generation");
    expect(ruleIds).toContain("ram-capacity");
    expect(ruleIds).toContain("gpu-case-length");
    expect(report.summary.status).toBe("incompatible");
  });

  it("flags duplicate selections in single-slot categories", () => {
    const report = evaluateBuild([makeCpu(), makeCpu({ socket: "AM4" })]);
    const duplicate = report.results.find(
      (r) => r.ruleId === "build-duplicate-category",
    );
    expect(duplicate).toBeDefined();
    expect(duplicate?.status).toBe("incompatible");
    expect(duplicate?.componentIds).toHaveLength(2);
  });

  it("still evaluates pairwise rules using the first duplicate", () => {
    const report = evaluateBuild([
      makeCpu({ socket: "AM5" }),
      makeCpu({ socket: "AM4" }),
      makeMotherboard({ socket: "AM5" }),
    ]);
    const socket = report.results.find(
      (r) => r.ruleId === "cpu-motherboard-socket",
    );
    expect(socket?.status).toBe("compatible");
  });

  it("allows multiple selections in multi-slot categories", () => {
    const report = evaluateBuild([makeRam(), makeRam()]);
    expect(
      report.results.some((r) => r.ruleId === "build-duplicate-category"),
    ).toBe(false);
  });

  it("produces stable deterministic output for identical input", () => {
    const build = completeCompatibleBuild();
    const first = evaluateBuild(build);
    const second = evaluateBuild(build);
    expect(first).toEqual(second);
    expect(first.results.map((r) => r.ruleId)).toEqual(
      second.results.map((r) => r.ruleId),
    );
  });

  it("does not mutate input component records", () => {
    const build = completeCompatibleBuild();
    const frozen = build.map((c) =>
      Object.freeze({ ...c, specs: Object.freeze({ ...c.specs }) }),
    ) as Component[];
    const snapshot = JSON.parse(JSON.stringify(frozen));
    expect(() => evaluateBuild(frozen)).not.toThrow();
    expect(JSON.parse(JSON.stringify(frozen))).toEqual(snapshot);
  });

  it("never reports missing data as compatible", () => {
    const report = evaluateBuild([
      makeCpu({ socket: "AM5", supportedChipsets: null }),
      makeMotherboard({ socket: "AM5", maxRamGB: null }),
      makeRam(),
      makeGpu({ lengthMm: null }),
      makeCase(),
    ]);
    expect(
      report.results.some(
        (r) => r.ruleId === "cpu-motherboard-chipset" && r.status === "unknown",
      ),
    ).toBe(true);
    expect(
      report.results.some(
        (r) => r.ruleId === "ram-capacity" && r.status === "unknown",
      ),
    ).toBe(true);
    expect(
      report.results.some(
        (r) => r.ruleId === "gpu-case-length" && r.status === "unknown",
      ),
    ).toBe(true);
    expect(report.summary.counts.compatible).toBeGreaterThan(0); // socket + ram gen etc.
  });

  it("every result carries rule id, severity, affected ids and a message", () => {
    const report = evaluateBuild(completeCompatibleBuild());
    expect(report.results.length).toBeGreaterThan(0);
    for (const result of report.results) {
      expect(result.ruleId).not.toBe("");
      expect(["info", "warning", "error"]).toContain(result.severity);
      expect(["compatible", "warning", "incompatible", "unknown"]).toContain(
        result.status,
      );
      expect(result.message.length).toBeGreaterThan(0);
      expect(result.componentIds.length).toBeGreaterThan(0);
    }
  });

  it("maps severity to status", () => {
    const report = evaluateBuild([
      makeCpu({ socket: "AM5", supportedChipsets: null }),
      makeCpu({ socket: "AM4" }),
      makeMotherboard({ socket: "AM5" }),
    ]);
    const incompatible = report.results.find(
      (r) => r.status === "incompatible",
    );
    const unknown = report.results.find((r) => r.status === "unknown");
    expect(incompatible?.severity).toBe("error");
    expect(unknown?.severity).toBe("info");
  });

  it("selectionCounts reflects the input per category", () => {
    const report = evaluateBuild([
      makeCpu(),
      makeRam(),
      makeRam(),
      makeCaseFan(),
    ]);
    expect(report.summary.selectionCounts.cpu).toBe(1);
    expect(report.summary.selectionCounts.ram).toBe(2);
    expect(report.summary.selectionCounts["case-fan"]).toBe(1);
    expect(report.summary.selectionCounts.gpu).toBe(0);
  });
});

describe("resultsForComponent", () => {
  it("filters results by component id", () => {
    const cpu = makeCpu({ socket: "AM4" }, "cpu-mine");
    const report = evaluateBuild([cpu, makeMotherboard({ socket: "AM5" })]);
    const mine = resultsForComponent(report, "cpu-mine");
    expect(mine.length).toBeGreaterThan(0);
    expect(mine.every((r) => r.componentIds.includes("cpu-mine"))).toBe(true);
  });
});
