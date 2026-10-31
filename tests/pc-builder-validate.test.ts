import { describe, expect, it } from "vitest";
import {
  validateCatalogue,
  validateComponent,
} from "../src/lib/pc-builder/validate";
import {
  makeCase,
  makeCaseFan,
  makeCpu,
  makeGpu,
  makeMotherboard,
  makePsu,
  makeRam,
  makeStorage,
} from "./pc-builder-fixtures";

describe("validateComponent", () => {
  it("accepts a well-formed component", () => {
    const result = validateComponent(makeCpu());
    expect(result.ok).toBe(true);
  });

  it("rejects non-object input", () => {
    for (const input of [null, undefined, 42, "cpu", []]) {
      const result = validateComponent(input);
      expect(result.ok).toBe(false);
    }
  });

  it("rejects records missing required common fields", () => {
    const cpu = makeCpu() as unknown as Record<string, unknown>;
    delete cpu.id;
    delete cpu.manufacturer;
    const result = validateComponent(cpu);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const paths = result.errors.map((e) => e.path);
      expect(paths).toContain(".id");
      expect(paths).toContain(".manufacturer");
    }
  });

  it("rejects an unknown category", () => {
    const cpu = makeCpu() as unknown as Record<string, unknown>;
    cpu.category = "webcam";
    const result = validateComponent(cpu);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.path === ".category")).toBe(true);
    }
  });

  it("rejects missing category-specific specifications", () => {
    const cpu = makeCpu() as unknown as Record<string, unknown>;
    cpu.specs = { memoryTypes: ["DDR5"] };
    const result = validateComponent(cpu);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const paths = result.errors.map((e) => e.path);
      expect(paths).toContain(".specs.socket");
      expect(paths).toContain(".specs.integratedGraphics");
    }
  });

  it("rejects wrong types in category specifications", () => {
    const mobo = makeMotherboard() as unknown as {
      specs: Record<string, unknown>;
    };
    mobo.specs.ramSlots = "four";
    const result = validateComponent(mobo);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.path === ".specs.ramSlots")).toBe(
        true,
      );
    }
  });

  it("rejects unexpected specification keys", () => {
    const gpu = makeGpu() as unknown as { specs: Record<string, unknown> };
    gpu.specs.rgbLighting = true;
    const result = validateComponent(gpu);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.path === ".specs.rgbLighting")).toBe(
        true,
      );
    }
  });

  it("accepts explicit null for unknown optional values", () => {
    const gpu = makeGpu({ lengthMm: null, powerDrawW: null });
    const result = validateComponent(gpu);
    expect(result.ok).toBe(true);
  });

  it("rejects undefined where null is required (unknown must be explicit)", () => {
    const gpu = makeGpu() as unknown as { specs: Record<string, unknown> };
    delete gpu.specs.lengthMm;
    const result = validateComponent(gpu);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.path === ".specs.lengthMm")).toBe(
        true,
      );
    }
  });

  it("rejects invalid enum values", () => {
    const psu = makePsu() as unknown as { specs: Record<string, unknown> };
    psu.specs.modularity = "mostly";
    const result = validateComponent(psu);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.path === ".specs.modularity")).toBe(
        true,
      );
    }
  });

  it("rejects RAM whose total capacity does not match modules", () => {
    const ram = makeRam({
      moduleCapacityGB: 16,
      moduleCount: 2,
      totalCapacityGB: 64,
    });
    const result = validateComponent(ram);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.errors.some((e) => e.path === ".specs.totalCapacityGB"),
      ).toBe(true);
    }
  });

  it("rejects air coolers that declare a radiator size", () => {
    const result = validateComponent({
      ...makeRam(),
      category: "cooler",
      specs: {
        type: "air",
        supportedSockets: ["AM5"],
        heightMm: 160,
        radiatorSizeMm: 240,
        tdpRatingW: null,
      },
    });
    expect(result.ok).toBe(false);
  });

  it("rejects malformed source attribution", () => {
    const cpu = makeCpu() as unknown as Record<string, unknown>;
    cpu.source = { name: "Test" };
    const result = validateComponent(cpu);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.path.startsWith(".source"))).toBe(
        true,
      );
    }
  });

  it("rejects invalid ISO dates", () => {
    const cpu = makeCpu() as unknown as Record<string, unknown>;
    cpu.lastVerified = "not-a-date";
    const result = validateComponent(cpu);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.path === ".lastVerified")).toBe(true);
    }
  });

  it("rejects invalid nested connector specs", () => {
    const gpu = makeGpu() as unknown as { specs: Record<string, unknown> };
    gpu.specs.powerConnectors = [{ type: "molex", count: 1 }];
    const result = validateComponent(gpu);
    expect(result.ok).toBe(false);
  });

  it("rejects storage with an NVMe 3.5-inch form factor", () => {
    const storage = makeStorage({ interface: "nvme", formFactor: "3.5-inch" });
    const result = validateComponent(storage);
    expect(result.ok).toBe(false);
  });
});

describe("validateCatalogue", () => {
  it("accepts a valid list of components", () => {
    const result = validateCatalogue([makeCpu(), makeGpu()]);
    expect(result.ok).toBe(true);
  });

  it("rejects duplicate component ids", () => {
    const cpu = makeCpu({}, "cpu-dup");
    const other = makeCpu({ socket: "AM4" }, "cpu-dup");
    const result = validateCatalogue([cpu, other]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.message.includes("duplicate"))).toBe(
        true,
      );
    }
  });

  it("rejects non-array input", () => {
    const result = validateCatalogue("nope");
    expect(result.ok).toBe(false);
  });

  it("reports the index of the offending record", () => {
    const bad = makeCpu() as unknown as Record<string, unknown>;
    delete bad.id;
    const result = validateCatalogue([makeGpu(), bad]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].path).toMatch(/^\[1\]/);
    }
  });
});

describe("M10.3 schema validation", () => {
  it("rejects records without provenance", () => {
    const cpu = makeCpu() as unknown as Record<string, unknown>;
    delete cpu.provenance;
    const result = validateComponent(cpu);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.path === ".provenance")).toBe(true);
    }
  });

  it("accepts the extended lifecycle states", () => {
    for (const availability of ["end-of-life", "unverified"] as const) {
      expect(validateComponent({ ...makeCpu(), availability }).ok).toBe(true);
    }
  });

  it("rejects an M.2 slot count that disagrees with slot detail", () => {
    const board = makeMotherboard({
      m2Slots: 3,
      m2SlotDetails: [
        {
          interface: "nvme",
          maxLengthMm: 80,
          pcieGeneration: 4,
          sharingNote: null,
        },
      ],
    });
    const result = validateComponent(board);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.path === ".specs.m2Slots")).toBe(true);
    }
  });

  it("rejects radiator summary sizes that no mount documents", () => {
    const pcCase = makeCase({
      radiatorSupportMm: [120, 360],
      radiatorMounts: [{ sizeMm: 120, position: "rear" }],
    });
    const result = validateComponent(pcCase);
    expect(result.ok).toBe(false);
  });

  it("rejects PWM fans with a 3-pin connector", () => {
    const fan = makeCaseFan({ connector: "3-pin-dc", pwm: true });
    const result = validateComponent(fan);
    expect(result.ok).toBe(false);
  });

  it("rejects M.2 keying on non-M.2 drives", () => {
    const drive = makeStorage({
      interface: "sata",
      formFactor: "2.5-inch",
      m2Key: "M",
      m2LengthMm: null,
      pcieGeneration: null,
    });
    const result = validateComponent(drive);
    expect(result.ok).toBe(false);
  });

  it("rejects a thread count below the core count", () => {
    const cpu = makeCpu({ cores: 8, threads: 4 });
    const result = validateComponent(cpu);
    expect(result.ok).toBe(false);
  });

  it("rejects a boost clock below the base clock", () => {
    const cpu = makeCpu({ baseClockGHz: 5.0, boostClockGHz: 4.0 });
    const result = validateComponent(cpu);
    expect(result.ok).toBe(false);
  });

  it("accepts explicit unknown values in the new optional fields", () => {
    const cpu = makeCpu({
      cores: null,
      threads: null,
      baseClockGHz: null,
      boostClockGHz: null,
      memorySpeedMTs: null,
    });
    expect(validateComponent(cpu).ok).toBe(true);
  });
});

describe("M10.3.1 schema validation", () => {
  it("accepts a documented 16-pin adapter cable count", () => {
    const gpu = makeGpu({
      powerConnectors: [{ type: "12vhpwr-16pin", count: 1 }],
      powerAdapter8pin: 3,
    });
    expect(validateComponent(gpu).ok).toBe(true);
  });

  it("rejects an adapter cable count without a 16-pin connector", () => {
    const gpu = makeGpu({
      powerConnectors: [{ type: "pcie-8pin", count: 2 }],
      powerAdapter8pin: 2,
    });
    const result = validateComponent(gpu);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.errors.some((error) => error.path === ".specs.powerAdapter8pin"),
      ).toBe(true);
    }
  });

  it("rejects a non-numeric adapter cable count", () => {
    const gpu = makeGpu({
      powerConnectors: [{ type: "12vhpwr-16pin", count: 1 }],
      powerAdapter8pin: 1.5,
    });
    expect(validateComponent(gpu).ok).toBe(false);
  });

  it("requires a sharing note field on every M.2 slot", () => {
    const board = makeMotherboard({
      m2Slots: 1,
      m2SlotDetails: [
        {
          interface: "nvme",
          maxLengthMm: 80,
          pcieGeneration: 4,
        } as never,
      ],
    });
    expect(validateComponent(board).ok).toBe(false);
  });
});
