import { describe, expect, it } from "vitest";
import { evaluateBuild } from "../src/lib/pc-builder/engine";
import type { CompatibilityResult } from "../src/lib/pc-builder/rules";
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

function resultByRule(
  results: CompatibilityResult[],
  ruleId: string,
): CompatibilityResult {
  const found = results.find((r) => r.ruleId === ruleId);
  if (!found) throw new Error(`expected a result for rule "${ruleId}"`);
  return found;
}

describe("cpu ↔ motherboard", () => {
  it("reports compatible when sockets match", () => {
    const report = evaluateBuild([
      makeCpu({ socket: "AM5" }),
      makeMotherboard({ socket: "AM5" }),
    ]);
    expect(resultByRule(report.results, "cpu-motherboard-socket").status).toBe(
      "compatible",
    );
  });

  it("reports incompatible on socket mismatch and skips chipset/BIOS", () => {
    const report = evaluateBuild([
      makeCpu({ socket: "AM4" }),
      makeMotherboard({ socket: "AM5" }),
    ]);
    expect(resultByRule(report.results, "cpu-motherboard-socket").status).toBe(
      "incompatible",
    );
    expect(
      report.results.some((r) => r.ruleId === "cpu-motherboard-bios"),
    ).toBe(false);
  });

  it("reports BIOS compatibility as unknown when socket matches", () => {
    const report = evaluateBuild([makeCpu(), makeMotherboard()]);
    const bios = resultByRule(report.results, "cpu-motherboard-bios");
    expect(bios.status).toBe("unknown");
    expect(bios.recommendation).toBeTruthy();
  });

  it("reports chipset compatibility when the CPU publishes a chipset list", () => {
    const cpu = makeCpu({ supportedChipsets: ["B650", "X670"] });
    const report = evaluateBuild([cpu, makeMotherboard({ chipset: "B650" })]);
    expect(resultByRule(report.results, "cpu-motherboard-chipset").status).toBe(
      "compatible",
    );
  });

  it("reports incompatible chipset when the board chipset is not in the CPU list", () => {
    const cpu = makeCpu({ supportedChipsets: ["X670"] });
    const report = evaluateBuild([cpu, makeMotherboard({ chipset: "B650" })]);
    expect(resultByRule(report.results, "cpu-motherboard-chipset").status).toBe(
      "incompatible",
    );
  });

  it("reports chipset as unknown when the CPU publishes no chipset data", () => {
    const report = evaluateBuild([
      makeCpu({ supportedChipsets: null }),
      makeMotherboard(),
    ]);
    expect(resultByRule(report.results, "cpu-motherboard-chipset").status).toBe(
      "unknown",
    );
  });
});

describe("motherboard ↔ RAM", () => {
  it("reports compatible when the memory generation matches", () => {
    const report = evaluateBuild([
      makeMotherboard({ ramGeneration: "DDR5" }),
      makeRam({ generation: "DDR5" }),
    ]);
    expect(resultByRule(report.results, "ram-generation").status).toBe(
      "compatible",
    );
  });

  it("reports incompatible on memory generation mismatch", () => {
    const report = evaluateBuild([
      makeMotherboard({ ramGeneration: "DDR5" }),
      makeRam({ generation: "DDR4" }),
    ]);
    expect(resultByRule(report.results, "ram-generation").status).toBe(
      "incompatible",
    );
  });

  it("reports incompatible when total capacity exceeds the board maximum", () => {
    const kit = makeRam({
      moduleCapacityGB: 64,
      moduleCount: 2,
      totalCapacityGB: 128,
    });
    const report = evaluateBuild([makeMotherboard({ maxRamGB: 96 }), kit]);
    const result = resultByRule(report.results, "ram-capacity");
    expect(result.status).toBe("incompatible");
    expect(result.observed).toMatchObject({
      selectedCapacityGB: 128,
      maxCapacityGB: 96,
    });
  });

  it("reports unknown capacity when the board maximum is not documented", () => {
    const report = evaluateBuild([
      makeMotherboard({ maxRamGB: null }),
      makeRam(),
    ]);
    expect(resultByRule(report.results, "ram-capacity").status).toBe("unknown");
  });

  it("reports incompatible when module count exceeds slot count", () => {
    const kits = [
      makeRam({ moduleCapacityGB: 8, moduleCount: 2, totalCapacityGB: 16 }),
      makeRam({ moduleCapacityGB: 8, moduleCount: 2, totalCapacityGB: 16 }),
    ];
    const report = evaluateBuild([makeMotherboard({ ramSlots: 2 }), ...kits]);
    expect(resultByRule(report.results, "ram-slot-count").status).toBe(
      "incompatible",
    );
  });

  it("warns (not rejects) when kit speed exceeds the documented maximum", () => {
    const report = evaluateBuild([
      makeMotherboard({ supportedRamSpeedsMTs: [4800, 5600] }),
      makeRam({ speedMTs: 6000 }),
    ]);
    expect(resultByRule(report.results, "ram-speed").status).toBe("warning");
  });

  it("reports unknown speed support when the board documents no speeds", () => {
    const report = evaluateBuild([
      makeMotherboard({ supportedRamSpeedsMTs: null }),
      makeRam(),
    ]);
    expect(resultByRule(report.results, "ram-speed").status).toBe("unknown");
  });

  it("reports incompatible on module form factor mismatch", () => {
    const report = evaluateBuild([
      makeMotherboard({ ramFormFactor: "DIMM" }),
      makeRam({ formFactor: "SO-DIMM" }),
    ]);
    expect(resultByRule(report.results, "ram-form-factor").status).toBe(
      "incompatible",
    );
  });
});

describe("gpu ↔ motherboard / case", () => {
  it("reports compatible when slot generation meets the card generation", () => {
    const report = evaluateBuild([
      makeGpu({ pcieGeneration: 4 }),
      makeMotherboard({ pcieX16Slots: { generation: 4, count: 1 } }),
    ]);
    expect(resultByRule(report.results, "gpu-motherboard-pcie").status).toBe(
      "compatible",
    );
  });

  it("warns (not rejects) for backward-compatible PCIe generation mismatch", () => {
    const report = evaluateBuild([
      makeGpu({ pcieGeneration: 5 }),
      makeMotherboard({ pcieX16Slots: { generation: 3, count: 1 } }),
    ]);
    const result = resultByRule(report.results, "gpu-motherboard-pcie");
    expect(result.status).toBe("warning");
    expect(result.severity).toBe("warning");
  });

  it("reports unknown when slot data is missing", () => {
    const report = evaluateBuild([
      makeGpu(),
      makeMotherboard({ pcieX16Slots: null }),
    ]);
    expect(resultByRule(report.results, "gpu-motherboard-pcie").status).toBe(
      "unknown",
    );
  });

  it("reports incompatible when GPU length exceeds case clearance", () => {
    const report = evaluateBuild([
      makeGpu({ lengthMm: 400 }),
      makeCase({ maxGpuLengthMm: 360 }),
    ]);
    expect(resultByRule(report.results, "gpu-case-length").status).toBe(
      "incompatible",
    );
  });

  it("reports compatible at the exact clearance boundary", () => {
    const report = evaluateBuild([
      makeGpu({ lengthMm: 360 }),
      makeCase({ maxGpuLengthMm: 360 }),
    ]);
    expect(resultByRule(report.results, "gpu-case-length").status).toBe(
      "compatible",
    );
  });

  it("reports unknown when GPU clearance data is missing", () => {
    const report = evaluateBuild([
      makeGpu({ lengthMm: null }),
      makeCase({ maxGpuLengthMm: 360 }),
    ]);
    expect(resultByRule(report.results, "gpu-case-length").status).toBe(
      "unknown",
    );
  });
});

describe("cooler rules", () => {
  it("reports compatible when the cooler supports the CPU socket", () => {
    const report = evaluateBuild([
      makeCooler({ supportedSockets: ["AM5"] }),
      makeCpu({ socket: "AM5" }),
    ]);
    expect(resultByRule(report.results, "cooler-cpu-socket").status).toBe(
      "compatible",
    );
  });

  it("reports incompatible on cooler socket mismatch", () => {
    const report = evaluateBuild([
      makeCooler({ supportedSockets: ["LGA1700"] }),
      makeCpu({ socket: "AM5" }),
    ]);
    expect(resultByRule(report.results, "cooler-cpu-socket").status).toBe(
      "incompatible",
    );
  });

  it("distinguishes mounting compatibility from cooling capacity", () => {
    const report = evaluateBuild([
      makeCooler({ supportedSockets: ["AM5"], tdpRatingW: 65 }),
      makeCpu({ socket: "AM5", tdpW: 105 }),
    ]);
    expect(resultByRule(report.results, "cooler-cpu-socket").status).toBe(
      "compatible",
    );
    expect(resultByRule(report.results, "cooler-cpu-capacity").status).toBe(
      "warning",
    );
  });

  it("reports capacity unknown when no cooler rating is published", () => {
    const report = evaluateBuild([makeCooler({ tdpRatingW: null }), makeCpu()]);
    expect(resultByRule(report.results, "cooler-cpu-capacity").status).toBe(
      "unknown",
    );
  });

  it("reports incompatible when air cooler height exceeds case clearance", () => {
    const report = evaluateBuild([
      makeCooler({ type: "air", heightMm: 168 }),
      makeCase({ maxCoolerHeightMm: 160 }),
    ]);
    expect(resultByRule(report.results, "cooler-case-height").status).toBe(
      "incompatible",
    );
  });

  it("reports unknown height clearance when case data is missing", () => {
    const report = evaluateBuild([
      makeCooler({ type: "air", heightMm: 168 }),
      makeCase({ maxCoolerHeightMm: null }),
    ]);
    expect(resultByRule(report.results, "cooler-case-height").status).toBe(
      "unknown",
    );
  });

  it("reports incompatible for an unsupported radiator size", () => {
    const report = evaluateBuild([
      makeCooler({ type: "aio-liquid", heightMm: null, radiatorSizeMm: 420 }),
      makeCase({ radiatorSupportMm: [120, 240, 360] }),
    ]);
    expect(resultByRule(report.results, "cooler-case-radiator").status).toBe(
      "incompatible",
    );
  });

  it("reports compatible for a supported radiator size", () => {
    const report = evaluateBuild([
      makeCooler({ type: "aio-liquid", heightMm: null, radiatorSizeMm: 240 }),
      makeCase({ radiatorSupportMm: [120, 240] }),
    ]);
    expect(resultByRule(report.results, "cooler-case-radiator").status).toBe(
      "compatible",
    );
  });

  it("reports unknown radiator support when case data is missing", () => {
    const report = evaluateBuild([
      makeCooler({ type: "aio-liquid", heightMm: null, radiatorSizeMm: 240 }),
      makeCase({ radiatorSupportMm: null }),
    ]);
    expect(resultByRule(report.results, "cooler-case-radiator").status).toBe(
      "unknown",
    );
  });
});

describe("psu rules", () => {
  it("reports incompatible when PSU wattage is below the estimated load", () => {
    const report = evaluateBuild([
      makeCpu({ tdpW: 125, maxPowerW: 181 }),
      makeGpu({ powerDrawW: 300 }),
      makePsu({ wattage: 400 }),
    ]);
    expect(resultByRule(report.results, "psu-wattage").status).toBe(
      "incompatible",
    );
  });

  it("warns when PSU covers the load but not the headroom policy", () => {
    // Load: 181 + 300 + estimates(0) = 481; recommended = ceil(481*1.2) = 578.
    const report = evaluateBuild([
      makeCpu({ tdpW: 125, maxPowerW: 181 }),
      makeGpu({ powerDrawW: 300 }),
      makePsu({ wattage: 550 }),
    ]);
    expect(resultByRule(report.results, "psu-wattage").status).toBe("warning");
  });

  it("reports compatible when PSU meets load plus headroom", () => {
    const report = evaluateBuild([
      makeCpu({ tdpW: 65 }),
      makeGpu({ powerDrawW: 150, recommendedPsuW: 550 }),
      makePsu({ wattage: 750 }),
    ]);
    expect(resultByRule(report.results, "psu-wattage").status).toBe(
      "compatible",
    );
  });

  it("reports unknown wattage suitability when power data is insufficient", () => {
    const report = evaluateBuild([
      makeCpu({ tdpW: null, maxPowerW: null }),
      makePsu({ wattage: 750 }),
    ]);
    expect(resultByRule(report.results, "psu-wattage").status).toBe("unknown");
  });

  it("reports incompatible when PCIe 8-pin connectors are missing", () => {
    const report = evaluateBuild([
      makeGpu({ powerConnectors: [{ type: "pcie-8pin", count: 3 }] }),
      makePsu({
        connectors: { eps8pin: 2, pcie8pin: 2, pcie16pin: 0, sata: 6 },
      }),
    ]);
    expect(resultByRule(report.results, "psu-gpu-connectors").status).toBe(
      "incompatible",
    );
  });

  it("warns when a 16-pin card must use an adapter", () => {
    const report = evaluateBuild([
      makeGpu({ powerConnectors: [{ type: "12vhpwr-16pin", count: 1 }] }),
      makePsu({
        connectors: { eps8pin: 2, pcie8pin: 4, pcie16pin: 0, sata: 6 },
      }),
    ]);
    expect(resultByRule(report.results, "psu-gpu-connectors").status).toBe(
      "warning",
    );
  });

  it("reports compatible with a native 16-pin connector", () => {
    const report = evaluateBuild([
      makeGpu({ powerConnectors: [{ type: "12vhpwr-16pin", count: 1 }] }),
      makePsu({
        connectors: { eps8pin: 2, pcie8pin: 2, pcie16pin: 1, sata: 6 },
      }),
    ]);
    expect(resultByRule(report.results, "psu-gpu-connectors").status).toBe(
      "compatible",
    );
  });

  it("reports incompatible when even the adapter path is impossible", () => {
    const report = evaluateBuild([
      makeGpu({ powerConnectors: [{ type: "12vhpwr-16pin", count: 1 }] }),
      makePsu({
        connectors: { eps8pin: 1, pcie8pin: 1, pcie16pin: 0, sata: 4 },
      }),
    ]);
    expect(resultByRule(report.results, "psu-gpu-connectors").status).toBe(
      "incompatible",
    );
  });

  it("reports unknown when PSU connector data is missing", () => {
    const report = evaluateBuild([
      makeGpu({ powerConnectors: [{ type: "pcie-8pin", count: 2 }] }),
      makePsu({
        connectors: { eps8pin: 2, pcie8pin: null, pcie16pin: null, sata: null },
      }),
    ]);
    expect(resultByRule(report.results, "psu-gpu-connectors").status).toBe(
      "unknown",
    );
  });

  it("reports incompatible PSU form factor for the case", () => {
    const report = evaluateBuild([
      makePsu({ formFactor: "ATX" }),
      makeCase({ psuFormFactors: ["SFX", "SFX-L"] }),
    ]);
    expect(resultByRule(report.results, "psu-case-form-factor").status).toBe(
      "incompatible",
    );
  });
});

describe("case, storage and fan rules", () => {
  it("reports incompatible motherboard/case form factor mismatch", () => {
    const report = evaluateBuild([
      makeMotherboard({ formFactor: "ATX" }),
      makeCase({ supportedFormFactors: ["Mini-ITX"] }),
    ]);
    expect(
      resultByRule(report.results, "motherboard-case-form-factor").status,
    ).toBe("incompatible");
  });

  it("reports compatible motherboard/case form factor", () => {
    const report = evaluateBuild([
      makeMotherboard({ formFactor: "Micro-ATX" }),
      makeCase(),
    ]);
    expect(
      resultByRule(report.results, "motherboard-case-form-factor").status,
    ).toBe("compatible");
  });

  it("reports incompatible when M.2 drives exceed available slots", () => {
    const drives = [makeStorage(), makeStorage(), makeStorage()];
    const report = evaluateBuild([makeMotherboard({ m2Slots: 2 }), ...drives]);
    expect(resultByRule(report.results, "storage-motherboard-m2").status).toBe(
      "incompatible",
    );
  });

  it("reports unknown when M.2 slot data is missing", () => {
    const report = evaluateBuild([
      makeMotherboard({ m2Slots: null, m2SlotDetails: null }),
      makeStorage(),
    ]);
    expect(resultByRule(report.results, "storage-motherboard-m2").status).toBe(
      "unknown",
    );
  });

  it("reports incompatible when SATA devices exceed available ports", () => {
    const drives = [
      makeStorage({
        interface: "sata",
        formFactor: "2.5-inch",
        m2LengthMm: null,
        pcieGeneration: null,
      }),
      makeStorage({
        interface: "sata",
        formFactor: "2.5-inch",
        m2LengthMm: null,
        pcieGeneration: null,
      }),
    ];
    const report = evaluateBuild([
      makeMotherboard({ sataPorts: 1 }),
      ...drives,
    ]);
    expect(
      resultByRule(report.results, "storage-motherboard-sata").status,
    ).toBe("incompatible");
  });

  it("reports incompatible when fan size is unsupported by the case", () => {
    const report = evaluateBuild([
      makeCaseFan({ sizeMm: 140 }),
      makeCase({ fanSizesMm: [120] }),
    ]);
    expect(resultByRule(report.results, "fan-case-size").status).toBe(
      "incompatible",
    );
  });

  it("reports unknown fan mounting when case fan data is missing", () => {
    const report = evaluateBuild([
      makeCaseFan(),
      makeCase({ fanSizesMm: null }),
    ]);
    expect(resultByRule(report.results, "fan-case-size").status).toBe(
      "unknown",
    );
  });

  it("warns when fans outnumber motherboard headers", () => {
    const fans = [makeCaseFan(), makeCaseFan(), makeCaseFan()];
    const report = evaluateBuild([...fans, makeMotherboard({ fanHeaders: 2 })]);
    expect(resultByRule(report.results, "fan-motherboard-headers").status).toBe(
      "warning",
    );
  });

  it("reports unknown header support when header count is missing", () => {
    const report = evaluateBuild([
      makeCaseFan(),
      makeMotherboard({ fanHeaders: null }),
    ]);
    expect(resultByRule(report.results, "fan-motherboard-headers").status).toBe(
      "unknown",
    );
  });
});

describe("expanded datasheet rules (M10.3)", () => {
  it("verifies GPU slot thickness against the case", () => {
    const report = evaluateBuild([
      makeGpu({ slotWidth: 2 }),
      makeCase({ maxGpuSlots: 3 }),
    ]);
    expect(resultByRule(report.results, "gpu-case-slot-width").status).toBe(
      "compatible",
    );
  });

  it("rejects a GPU thicker than the case allows", () => {
    const report = evaluateBuild([
      makeGpu({ slotWidth: 3.5 }),
      makeCase({ maxGpuSlots: 3 }),
    ]);
    expect(resultByRule(report.results, "gpu-case-slot-width").status).toBe(
      "incompatible",
    );
  });

  it("reports unknown GPU slot clearance when the case does not document it", () => {
    const report = evaluateBuild([
      makeGpu({ slotWidth: 3 }),
      makeCase({ maxGpuSlots: null }),
    ]);
    expect(resultByRule(report.results, "gpu-case-slot-width").status).toBe(
      "unknown",
    );
  });

  it("verifies PSU chassis length against the case", () => {
    const report = evaluateBuild([
      makePsu({ lengthMm: 160 }),
      makeCase({ maxPsuLengthMm: 180 }),
    ]);
    expect(resultByRule(report.results, "psu-case-length").status).toBe(
      "compatible",
    );
  });

  it("rejects a PSU longer than the case allows", () => {
    const report = evaluateBuild([
      makePsu({ lengthMm: 200 }),
      makeCase({ maxPsuLengthMm: 180 }),
    ]);
    expect(resultByRule(report.results, "psu-case-length").status).toBe(
      "incompatible",
    );
  });

  it("reports unknown PSU length clearance when the case does not document it", () => {
    const report = evaluateBuild([
      makePsu({ lengthMm: 160 }),
      makeCase({ maxPsuLengthMm: null }),
    ]);
    expect(resultByRule(report.results, "psu-case-length").status).toBe(
      "unknown",
    );
  });

  it("accepts an NVMe M.2 drive in a documented M.2 slot", () => {
    const report = evaluateBuild([
      makeMotherboard({
        m2Slots: 1,
        m2SlotDetails: [
          { interface: "nvme", maxLengthMm: 80, pcieGeneration: 4 },
        ],
      }),
      makeStorage({ m2LengthMm: 2280 }),
    ]);
    expect(resultByRule(report.results, "storage-motherboard-m2").status).toBe(
      "compatible",
    );
  });

  it("rejects an M.2 drive whose protocol the board does not document", () => {
    const report = evaluateBuild([
      makeMotherboard({
        m2Slots: 1,
        m2SlotDetails: [
          { interface: "nvme", maxLengthMm: 80, pcieGeneration: 4 },
        ],
      }),
      makeStorage({
        interface: "sata",
        formFactor: "m2",
        m2Key: "B+M",
        m2LengthMm: 2280,
        pcieGeneration: null,
      }),
    ]);
    const result = resultByRule(report.results, "storage-motherboard-m2");
    expect(result.status).toBe("incompatible");
    expect(result.message).toContain("SATA M.2 slot");
  });

  it("rejects an M.2 module longer than every compatible slot", () => {
    const report = evaluateBuild([
      makeMotherboard({
        m2Slots: 1,
        m2SlotDetails: [
          { interface: "nvme", maxLengthMm: 80, pcieGeneration: 4 },
        ],
      }),
      makeStorage({ m2LengthMm: 22110 }),
    ]);
    const result = resultByRule(report.results, "storage-motherboard-m2");
    expect(result.status).toBe("incompatible");
    expect(result.message).toContain("longer than every compatible slot");
  });

  it("reports unknown M.2 fit when the slot length limit is undocumented", () => {
    const report = evaluateBuild([
      makeMotherboard({
        m2Slots: 1,
        m2SlotDetails: [
          { interface: "nvme", maxLengthMm: null, pcieGeneration: 4 },
        ],
      }),
      makeStorage({ m2LengthMm: 2280 }),
    ]);
    expect(resultByRule(report.results, "storage-motherboard-m2").status).toBe(
      "unknown",
    );
  });

  it("reports unknown M.2 protocol support when only the slot count is documented", () => {
    const report = evaluateBuild([
      makeMotherboard({ m2Slots: 2, m2SlotDetails: null }),
      makeStorage(),
    ]);
    const result = resultByRule(report.results, "storage-motherboard-m2");
    expect(result.status).toBe("unknown");
    expect(result.message).toContain(
      "protocol and length support are not documented",
    );
  });

  it("rejects more M.2 drives than physical slots", () => {
    const report = evaluateBuild([
      makeMotherboard({
        m2Slots: 1,
        m2SlotDetails: [
          { interface: "both", maxLengthMm: 80, pcieGeneration: 4 },
        ],
      }),
      makeStorage(),
      makeStorage(),
    ]);
    expect(resultByRule(report.results, "storage-motherboard-m2").status).toBe(
      "incompatible",
    );
  });

  it("handles mixed protocols with distinct slot capacity", () => {
    const report = evaluateBuild([
      makeMotherboard({
        m2Slots: 2,
        m2SlotDetails: [
          { interface: "nvme", maxLengthMm: 80, pcieGeneration: 4 },
          { interface: "sata", maxLengthMm: 80, pcieGeneration: null },
        ],
      }),
      makeStorage(),
      makeStorage({
        interface: "sata",
        formFactor: "m2",
        m2Key: "B+M",
        m2LengthMm: 2280,
        pcieGeneration: null,
      }),
    ]);
    expect(resultByRule(report.results, "storage-motherboard-m2").status).toBe(
      "compatible",
    );
  });

  it("rejects two SATA M.2 drives when only one slot supports SATA", () => {
    const sataDrive = () =>
      makeStorage({
        interface: "sata",
        formFactor: "m2",
        m2Key: "B+M",
        m2LengthMm: 2280,
        pcieGeneration: null,
      });
    const report = evaluateBuild([
      makeMotherboard({
        m2Slots: 2,
        m2SlotDetails: [
          { interface: "nvme", maxLengthMm: 80, pcieGeneration: 4 },
          { interface: "sata", maxLengthMm: 80, pcieGeneration: null },
        ],
      }),
      sataDrive(),
      sataDrive(),
    ]);
    expect(resultByRule(report.results, "storage-motherboard-m2").status).toBe(
      "incompatible",
    );
  });

  it("includes CPU support-list evidence in the BIOS unknown result", () => {
    const cpu = makeCpu({ socket: "AM5" });
    const motherboard = makeMotherboard({
      socket: "AM5",
      cpuSupportListUrl: "https://example.test/support-list",
      biosVersion: "7D75v1A",
    });
    const report = evaluateBuild([cpu, motherboard]);
    const bios = resultByRule(report.results, "cpu-motherboard-bios");
    expect(bios.status).toBe("unknown");
    expect(bios.observed).toMatchObject({
      biosVersion: "7D75v1A",
      cpuSupportListUrl: "https://example.test/support-list",
    });
    expect(bios.recommendation).toContain("https://example.test/support-list");
  });
});
