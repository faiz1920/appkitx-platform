/*
 * Synthetic fixtures for PC Builder tests.
 *
 * These records are intentionally fictional ("Testbrand") so rule tests
 * never depend on catalogue contents. Each builder returns a valid record;
 * tests override individual fields to exercise specific rules.
 */

import type {
  CaseComponent,
  CaseFanComponent,
  CoolerComponent,
  CpuComponent,
  GpuComponent,
  MotherboardComponent,
  PsuComponent,
  RamComponent,
  StorageComponent,
} from "../src/lib/pc-builder/types";

const source = {
  name: "Test fixture",
  url: "https://example.test/spec",
  accessedAt: "2026-01-01",
};

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-fixture-${counter}`;
}

const common = {
  manufacturer: "Testbrand",
  model: "TB-1",
  description: "Synthetic fixture record for automated tests.",
  availability: "in-production" as const,
  source,
  lastVerified: "2026-01-01",
};

export function makeCpu(
  overrides: Partial<CpuComponent["specs"]> = {},
  id?: string,
): CpuComponent {
  return {
    ...common,
    id: id ?? nextId("cpu"),
    category: "cpu",
    name: "TestCPU 1000",
    specs: {
      socket: "AM5",
      memoryTypes: ["DDR5"],
      memoryChannels: 2,
      maxMemoryGB: 128,
      tdpW: 105,
      maxPowerW: null,
      integratedGraphics: true,
      supportedChipsets: null,
      pcieGeneration: 5,
      coolerIncluded: false,
      ...overrides,
    },
  };
}

export function makeGpu(
  overrides: Partial<GpuComponent["specs"]> = {},
  id?: string,
): GpuComponent {
  return {
    ...common,
    id: id ?? nextId("gpu"),
    category: "gpu",
    name: "TestGPU 2000",
    specs: {
      pcieGeneration: 4,
      pcieLanes: 16,
      lengthMm: 250,
      slotWidth: 2,
      powerDrawW: 220,
      recommendedPsuW: 650,
      powerConnectors: [{ type: "pcie-8pin", count: 2 }],
      displayOutputs: null,
      ...overrides,
    },
  };
}

export function makeMotherboard(
  overrides: Partial<MotherboardComponent["specs"]> = {},
  id?: string,
): MotherboardComponent {
  return {
    ...common,
    id: id ?? nextId("motherboard"),
    category: "motherboard",
    name: "TestBoard B650",
    specs: {
      socket: "AM5",
      chipset: "B650",
      formFactor: "ATX",
      ramGeneration: "DDR5",
      ramFormFactor: "DIMM",
      ramSlots: 4,
      maxRamGB: 128,
      supportedRamSpeedsMTs: [4800, 5200, 5600, 6000],
      pcieX16Slots: { generation: 4, count: 1 },
      m2Slots: 2,
      sataPorts: 4,
      fanHeaders: 4,
      cpuPowerConnectors: null,
      ...overrides,
    },
  };
}

export function makeRam(
  overrides: Partial<RamComponent["specs"]> = {},
  id?: string,
): RamComponent {
  const specs: RamComponent["specs"] = {
    generation: "DDR5",
    moduleCapacityGB: 16,
    moduleCount: 2,
    totalCapacityGB: 32,
    speedMTs: 6000,
    formFactor: "DIMM",
    ecc: false,
    registered: false,
    ...overrides,
  };
  return {
    ...common,
    id: id ?? nextId("ram"),
    category: "ram",
    name: "TestRAM DDR5",
    specs,
  };
}

export function makeCooler(
  overrides: Partial<CoolerComponent["specs"]> = {},
  id?: string,
): CoolerComponent {
  return {
    ...common,
    id: id ?? nextId("cooler"),
    category: "cooler",
    name: "TestCooler Air",
    specs: {
      type: "air",
      supportedSockets: ["AM5", "LGA1700"],
      heightMm: 160,
      radiatorSizeMm: null,
      tdpRatingW: null,
      ...overrides,
    },
  };
}

export function makeStorage(
  overrides: Partial<StorageComponent["specs"]> = {},
  id?: string,
): StorageComponent {
  return {
    ...common,
    id: id ?? nextId("storage"),
    category: "storage",
    name: "TestSSD 1TB",
    specs: {
      storageType: "ssd",
      capacityGB: 1000,
      interface: "nvme",
      formFactor: "m2",
      m2LengthMm: 2280,
      pcieGeneration: 4,
      ...overrides,
    },
  };
}

export function makePsu(
  overrides: Partial<PsuComponent["specs"]> = {},
  id?: string,
): PsuComponent {
  return {
    ...common,
    id: id ?? nextId("psu"),
    category: "psu",
    name: "TestPSU 750",
    specs: {
      wattage: 750,
      efficiency: "80 PLUS Gold",
      modularity: "full",
      formFactor: "ATX",
      atxVersion: null,
      connectors: { eps8pin: 2, pcie8pin: 4, pcie16pin: 0, sata: 8 },
      ...overrides,
    },
  };
}

export function makeCase(
  overrides: Partial<CaseComponent["specs"]> = {},
  id?: string,
): CaseComponent {
  return {
    ...common,
    id: id ?? nextId("case"),
    category: "case",
    name: "TestCase ATX",
    specs: {
      supportedFormFactors: ["ATX", "Micro-ATX", "Mini-ITX"],
      maxGpuLengthMm: 360,
      maxCoolerHeightMm: 170,
      psuFormFactors: ["ATX"],
      radiatorSupportMm: [120, 240, 280, 360],
      maxGpuSlots: null,
      driveBays25inch: 2,
      driveBays35inch: 2,
      fanSizesMm: [120, 140],
      includedFans: 2,
      ...overrides,
    },
  };
}

export function makeCaseFan(
  overrides: Partial<CaseFanComponent["specs"]> = {},
  id?: string,
): CaseFanComponent {
  return {
    ...common,
    id: id ?? nextId("case-fan"),
    category: "case-fan",
    name: "TestFan 120",
    specs: {
      sizeMm: 120,
      connector: "4-pin-pwm",
      airflowDirection: "standard",
      rpmMin: 400,
      rpmMax: 1800,
      ...overrides,
    },
  };
}
