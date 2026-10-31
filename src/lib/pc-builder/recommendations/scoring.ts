/*
 * Transparent scoring for guided recommendations (M10.4).
 *
 * All capability indices are deterministic formulas over manufacturer-published
 * specifications or explicit catalogue feature flags. They are NOT benchmark
 * results and must never be presented as FPS, application performance or a
 * price-to-performance ratio.
 *
 * Scores are 0–100 internally. The UI exposes qualitative bands and reasons,
 * not a benchmark percentage.
 */

import type { CompatibilityReport } from "../engine";
import type { PowerEstimate } from "../power";
import type {
  CaseComponent,
  CaseFanComponent,
  Component,
  ComponentCategory,
  CoolerComponent,
  CpuComponent,
  GpuComponent,
  MotherboardComponent,
  PsuComponent,
  RamComponent,
  StorageComponent,
} from "../types";
import type {
  BudgetAllocation,
  RecommendationQuestionnaire,
  RecommendationScore,
  ScoreDimensions,
  UseCase,
} from "./types";

export const PERFORMANCE_REFERENCES = {
  cpuCompute: 400,
  cpuGaming: 220,
  gpu: 1000,
  ram: 150,
  storage: 200,
  motherboardUpgrade: 100,
  cooler: 100,
  psu: 100,
  case: 100,
  fan: 100,
} as const;

export const SCORING_WEIGHTS: Record<
  UseCase,
  Record<keyof ScoreDimensions, number>
> = {
  gaming: {
    useCase: 22,
    priority: 16,
    resolution: 14,
    brand: 7,
    budgetPosture: 15,
    upgrade: 8,
    balance: 8,
    confidence: 10,
  },
  productivity: {
    useCase: 28,
    priority: 16,
    resolution: 0,
    brand: 7,
    budgetPosture: 15,
    upgrade: 12,
    balance: 12,
    confidence: 10,
  },
  workstation: {
    useCase: 28,
    priority: 16,
    resolution: 0,
    brand: 7,
    budgetPosture: 15,
    upgrade: 10,
    balance: 14,
    confidence: 10,
  },
  general: {
    useCase: 25,
    priority: 16,
    resolution: 0,
    brand: 9,
    budgetPosture: 16,
    upgrade: 12,
    balance: 12,
    confidence: 10,
  },
};

export type BudgetBand = "entry" | "mid" | "upper" | "high";

/**
 * Planning band from the generic budget envelope. This is NOT a price lookup:
 * no component prices exist in the catalogue. The band only sets capability
 * targets so different budgets produce different priorities.
 */
export function budgetBand(
  questionnaire: RecommendationQuestionnaire,
): BudgetBand {
  if (questionnaire.budget <= 600) return "entry";
  if (questionnaire.budget <= 1200) return "mid";
  if (questionnaire.budget <= 2200) return "upper";
  return "high";
}

export function budgetTierTarget(
  questionnaire: RecommendationQuestionnaire,
): number {
  switch (budgetBand(questionnaire)) {
    case "entry":
      return 35;
    case "mid":
      return 55;
    case "upper":
      return 75;
    case "high":
      return 90;
  }
}

export function cpuBudgetTarget(
  questionnaire: RecommendationQuestionnaire,
): number {
  const offset =
    questionnaire.useCase === "workstation"
      ? 5
      : questionnaire.useCase === "gaming"
        ? -5
        : 0;
  return clamp(budgetTierTarget(questionnaire) + offset, 20, 95);
}

export function gpuBudgetTarget(
  questionnaire: RecommendationQuestionnaire,
): number {
  const resolutionOffset =
    questionnaire.useCase !== "gaming"
      ? 0
      : questionnaire.resolution === "1080p"
        ? -12
        : questionnaire.resolution === "4k"
          ? 10
          : 0;
  const useCaseOffset = questionnaire.useCase === "workstation" ? 5 : 0;
  return clamp(
    budgetTierTarget(questionnaire) + resolutionOffset + useCaseOffset,
    20,
    98,
  );
}

export function ramBudgetTarget(
  questionnaire: RecommendationQuestionnaire,
): number {
  const band = budgetBand(questionnaire);
  if (questionnaire.useCase === "workstation") {
    return band === "entry" ? 32 : 64;
  }
  if (band === "entry") return 16;
  if (band === "high") return 64;
  return 32;
}

export function storageBudgetTarget(
  questionnaire: RecommendationQuestionnaire,
): number {
  const band = budgetBand(questionnaire);
  if (questionnaire.useCase === "workstation") {
    return band === "entry" ? 1000 : 2000;
  }
  return band === "upper" || band === "high" ? 2000 : 1000;
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function normalize(value: number, reference: number): number {
  if (reference <= 0) return 0;
  return clamp((value / reference) * 100);
}

function weighted(parts: readonly [number, number][]): number {
  const totalWeight = parts.reduce((sum, [, weight]) => sum + weight, 0);
  if (totalWeight <= 0) return 0;
  return clamp(
    parts.reduce((sum, [value, weight]) => sum + value * weight, 0) /
      totalWeight,
  );
}

export function availabilityScore(component: Component): number {
  switch (component.availability) {
    case "in-production":
      return 100;
    case "unknown":
      return 60;
    case "discontinued":
      return 30;
    case "unverified":
      return 20;
    case "end-of-life":
      return 10;
  }
}

export function brandScore(manufacturer: string, preference: string): number {
  if (preference === "no-preference") return 100;
  return manufacturer.toLowerCase() === preference.toLowerCase() ? 100 : 35;
}

/* ------------------------------------------------------------------ */
/* Capability indices                                                  */
/* ------------------------------------------------------------------ */

export function cpuComputeIndex(cpu: CpuComponent): number {
  const cores = cpu.specs.cores ?? 2;
  const threads = cpu.specs.threads ?? cores;
  const boost = cpu.specs.boostClockGHz ?? 3;
  const ddr5 = cpu.specs.memoryTypes.includes("DDR5") ? 10 : 0;
  return cores * 10 + threads * 2 + boost * 8 + ddr5;
}

export function cpuGamingIndex(cpu: CpuComponent): number {
  const cores = cpu.specs.cores ?? 2;
  const threads = cpu.specs.threads ?? cores;
  const boost = cpu.specs.boostClockGHz ?? 3;
  const ddr5 = cpu.specs.memoryTypes.includes("DDR5") ? 5 : 0;
  // The catalogue description explicitly identifies 3D V-Cache. This is a
  // documented gaming-oriented feature flag, not a benchmark measurement.
  const cacheBonus = /3d v-cache/i.test(cpu.description) ? 12 : 0;
  return (
    boost * 20 +
    Math.min(cores, 8) * 8 +
    (threads >= 12 ? 10 : 0) +
    ddr5 +
    cacheBonus
  );
}

export function gpuCapabilityIndex(gpu: GpuComponent): number {
  const power = gpu.specs.powerDrawW ?? 50;
  const vram = gpu.specs.vramGB ?? 4;
  const pcie = (gpu.specs.pcieGeneration ?? 3) >= 4 ? 10 : 0;
  return power * 2 + vram + pcie;
}

export function ramCapabilityIndex(ram: RamComponent): number {
  return (
    ram.specs.totalCapacityGB * 1.2 +
    ram.specs.speedMTs / 100 +
    (ram.specs.moduleCount === 2 ? 5 : 0)
  );
}

export function storageCapabilityIndex(storage: StorageComponent): number {
  return (
    storage.specs.capacityGB / 20 +
    (storage.specs.seqReadMBps ?? 0) / 100 +
    (storage.specs.interface === "nvme" ? 20 : 0)
  );
}

export function motherboardUpgradeIndex(
  motherboard: MotherboardComponent,
): number {
  const slots = clamp(motherboard.specs.ramSlots * 25);
  const maxRam =
    motherboard.specs.maxRamGB === null
      ? 50
      : motherboard.specs.maxRamGB >= 128
        ? 100
        : 70;
  const m2 =
    motherboard.specs.m2Slots === null
      ? 50
      : clamp((motherboard.specs.m2Slots / 3) * 100);
  const pcie =
    motherboard.specs.pcieX16Slots?.generation === null ||
    motherboard.specs.pcieX16Slots === null
      ? 50
      : clamp(((motherboard.specs.pcieX16Slots.generation - 2) / 3) * 100);
  const sata =
    motherboard.specs.sataPorts === null
      ? 50
      : clamp((motherboard.specs.sataPorts / 4) * 100);
  return weighted([
    [slots, 1],
    [maxRam, 1],
    [m2, 1],
    [pcie, 1],
    [sata, 1],
  ]);
}

export function coolerCapabilityIndex(
  cooler: CoolerComponent,
  cpu: CpuComponent | null,
): number {
  const socket = cpu
    ? cooler.specs.supportedSockets.includes(cpu.specs.socket)
      ? 100
      : 0
    : 60;
  const cpuPower = cpu ? (cpu.specs.maxPowerW ?? cpu.specs.tdpW) : null;
  const thermal =
    cooler.specs.tdpRatingW === null || cpuPower === null
      ? 60
      : cooler.specs.tdpRatingW >= cpuPower
        ? 100
        : 40;
  const size =
    cooler.specs.type === "air"
      ? cooler.specs.heightMm === null
        ? 50
        : clamp((cooler.specs.heightMm / 165) * 100)
      : cooler.specs.radiatorSizeMm === null
        ? 50
        : clamp((cooler.specs.radiatorSizeMm / 360) * 100);
  return weighted([
    [socket, 2],
    [thermal, 2],
    [size, 1],
  ]);
}

export function psuCapabilityIndex(
  psu: PsuComponent,
  power: PowerEstimate,
  gpu: GpuComponent | null,
): number {
  let wattage = 60;
  if (power.recommendedPsuW !== null) {
    const ratio = psu.specs.wattage / power.recommendedPsuW;
    wattage =
      ratio < 1
        ? 30
        : ratio <= 1.25
          ? 100
          : ratio <= 1.6
            ? 90
            : ratio <= 2
              ? 80
              : 65;
  }
  const need16 = gpu?.specs.powerConnectors?.some(
    (connector) => connector.type === "12vhpwr-16pin",
  );
  const connectors =
    need16 === undefined
      ? 60
      : need16
        ? (psu.specs.connectors.pcie16pin ?? 0) > 0
          ? 100
          : (psu.specs.connectors.pcie8pin ?? 0) >= 3
            ? 70
            : (psu.specs.connectors.pcie8pin ?? 0) >= 1
              ? 50
              : 20
        : (psu.specs.connectors.pcie8pin ?? 0) >= 2
          ? 100
          : 50;
  const efficiency = /platinum/i.test(psu.specs.efficiency)
    ? 100
    : /gold/i.test(psu.specs.efficiency)
      ? 90
      : /bronze/i.test(psu.specs.efficiency)
        ? 70
        : 60;
  const modularity =
    psu.specs.modularity === "full"
      ? 100
      : psu.specs.modularity === "semi"
        ? 80
        : 60;
  return weighted([
    [wattage, 5],
    [connectors, 3],
    [efficiency, 1],
    [modularity, 1],
  ]);
}

export function caseCapabilityIndex(
  pcCase: CaseComponent,
  questionnaire: RecommendationQuestionnaire,
): number {
  const formFactors = clamp(
    (pcCase.specs.supportedFormFactors.length / 4) * 100,
  );
  const gpu =
    pcCase.specs.maxGpuLengthMm === null
      ? 50
      : clamp((pcCase.specs.maxGpuLengthMm / 450) * 100);
  const cooler =
    pcCase.specs.maxCoolerHeightMm === null
      ? 50
      : clamp((pcCase.specs.maxCoolerHeightMm / 190) * 100);
  const psu =
    pcCase.specs.maxPsuLengthMm === null
      ? 50
      : clamp((pcCase.specs.maxPsuLengthMm / 250) * 100);
  const fans =
    pcCase.specs.includedFans === null
      ? 50
      : clamp((pcCase.specs.includedFans / 4) * 100);
  const size =
    questionnaire.buildSize === "compact"
      ? pcCase.specs.caseType === "sff" ||
        pcCase.specs.caseType === "mini-tower"
        ? 100
        : pcCase.specs.caseType === "mid-tower"
          ? 65
          : 35
      : questionnaire.buildSize === "standard"
        ? pcCase.specs.caseType === "full-tower" ||
          pcCase.specs.caseType === "mid-tower"
          ? 100
          : 70
        : 100;
  return weighted([
    [formFactors, 1],
    [gpu, 1],
    [cooler, 1],
    [psu, 1],
    [fans, 0.5],
    [size, 1.5],
  ]);
}

export function fanCapabilityIndex(fan: CaseFanComponent): number {
  const airflow =
    fan.specs.airflowCFM === null
      ? 50
      : clamp((fan.specs.airflowCFM / 75) * 100);
  const pressure =
    fan.specs.staticPressureMmH2O === null
      ? 50
      : clamp((fan.specs.staticPressureMmH2O / 4) * 100);
  const pwm = fan.specs.pwm === null ? 60 : fan.specs.pwm ? 100 : 50;
  return weighted([
    [airflow, 2],
    [pressure, 1],
    [pwm, 1],
  ]);
}

/* ------------------------------------------------------------------ */
/* Use-case fit                                                        */
/* ------------------------------------------------------------------ */

export function cpuUseCaseScore(cpu: CpuComponent, useCase: UseCase): number {
  const compute = normalize(
    cpuComputeIndex(cpu),
    PERFORMANCE_REFERENCES.cpuCompute,
  );
  const gaming = normalize(
    cpuGamingIndex(cpu),
    PERFORMANCE_REFERENCES.cpuGaming,
  );
  switch (useCase) {
    case "gaming":
      return gaming;
    case "productivity":
    case "workstation":
      return compute;
    case "general":
      return (compute + gaming) / 2;
  }
}

export function gpuResolutionTarget(
  resolution: RecommendationQuestionnaire["resolution"],
): number {
  switch (resolution) {
    case "1080p":
      return 38;
    case "1440p":
      return 58;
    case "4k":
      return 82;
    case "not-applicable":
      return 60;
  }
}

export function gpuResolutionFit(
  gpu: GpuComponent,
  resolution: RecommendationQuestionnaire["resolution"],
): number {
  const capability = normalize(
    gpuCapabilityIndex(gpu),
    PERFORMANCE_REFERENCES.gpu,
  );
  const target = gpuResolutionTarget(resolution);
  return clamp(100 - Math.abs(capability - target) * 1.4);
}

export function gpuUseCaseScore(
  gpu: GpuComponent,
  questionnaire: RecommendationQuestionnaire,
): number {
  const capability = normalize(
    gpuCapabilityIndex(gpu),
    PERFORMANCE_REFERENCES.gpu,
  );
  switch (questionnaire.useCase) {
    case "gaming":
      return weighted([
        [gpuResolutionFit(gpu, questionnaire.resolution), 3],
        [capability, 2],
      ]);
    case "productivity": {
      const adequacy = clamp(
        100 -
          Math.max(0, 35 - capability) * 2 -
          Math.max(0, capability - 65) * 0.5,
      );
      return weighted([
        [adequacy, 2],
        [capability, 1],
      ]);
    }
    case "workstation":
      return capability;
    case "general":
      return capability;
  }
}

export function ramUseCaseScore(ram: RamComponent, useCase: UseCase): number {
  const target =
    useCase === "workstation" ? 64 : useCase === "general" ? 16 : 32;
  const capacity = clamp((ram.specs.totalCapacityGB / target) * 100);
  const speed = normalize(ram.specs.speedMTs, 6000);
  const modules = ram.specs.moduleCount === 2 ? 100 : 70;
  return weighted([
    [capacity, 3],
    [speed, 2],
    [modules, 1],
  ]);
}

export function storageUseCaseScore(
  storage: StorageComponent,
  useCase: UseCase,
): number {
  const target =
    useCase === "workstation" ? 2000 : useCase === "general" ? 1000 : 1000;
  const capacity = clamp((storage.specs.capacityGB / target) * 100);
  const speed = normalize(storage.specs.seqReadMBps ?? 0, 7450);
  const interfaceScore = storage.specs.interface === "nvme" ? 100 : 60;
  return weighted([
    [capacity, 3],
    [speed, 2],
    [interfaceScore, 1],
  ]);
}

export function motherboardUseCaseScore(
  motherboard: MotherboardComponent,
  questionnaire: RecommendationQuestionnaire,
): number {
  const upgrade = motherboardUpgradeIndex(motherboard);
  if (questionnaire.buildSize !== "compact") return upgrade;
  const form =
    motherboard.specs.formFactor === "Mini-ITX"
      ? 100
      : motherboard.specs.formFactor === "Micro-ATX"
        ? 90
        : 50;
  return weighted([
    [upgrade, 2],
    [form, 1],
  ]);
}

export function coolerUseCaseScore(
  cooler: CoolerComponent,
  cpu: CpuComponent | null,
  questionnaire: RecommendationQuestionnaire,
): number {
  const capability = coolerCapabilityIndex(cooler, cpu);
  const preference =
    questionnaire.cooling === "no-preference"
      ? 100
      : questionnaire.cooling === "air"
        ? cooler.specs.type === "air"
          ? 100
          : 40
        : cooler.specs.type === "aio-liquid"
          ? 100
          : 40;
  return weighted([
    [capability, 2],
    [preference, 1],
  ]);
}

export function psuUseCaseScore(
  psu: PsuComponent,
  power: PowerEstimate,
  gpu: GpuComponent | null,
): number {
  return weighted([
    [psuCapabilityIndex(psu, power, gpu), 3],
    [availabilityScore(psu), 1],
  ]);
}

export function caseUseCaseScore(
  pcCase: CaseComponent,
  questionnaire: RecommendationQuestionnaire,
): number {
  return weighted([
    [caseCapabilityIndex(pcCase, questionnaire), 3],
    [availabilityScore(pcCase), 1],
  ]);
}

export function fanUseCaseScore(fan: CaseFanComponent): number {
  return weighted([
    [fanCapabilityIndex(fan), 3],
    [availabilityScore(fan), 1],
  ]);
}

/* ------------------------------------------------------------------ */
/* Candidate ranking scores                                            */
/* ------------------------------------------------------------------ */

function valueScore(actual: number, target: number): number {
  return clamp(100 - Math.abs(actual - target) * 1.2);
}

export function scoreCpuCandidate(
  cpu: CpuComponent,
  questionnaire: RecommendationQuestionnaire,
): number {
  const useCase = cpuUseCaseScore(cpu, questionnaire.useCase);
  const budgetFit = clamp(
    100 - Math.abs(useCase - cpuBudgetTarget(questionnaire)) * 1.5,
  );
  const compute = normalize(
    cpuComputeIndex(cpu),
    PERFORMANCE_REFERENCES.cpuCompute,
  );
  const valueTarget =
    questionnaire.useCase === "workstation"
      ? 80
      : questionnaire.useCase === "productivity"
        ? 65
        : questionnaire.useCase === "gaming"
          ? 55
          : 50;
  const value = valueScore(compute, valueTarget);
  const priority =
    questionnaire.performancePriority === "cpu-focused"
      ? useCase
      : questionnaire.performancePriority === "value-focused"
        ? value
        : weighted([
            [useCase, 2],
            [value, 1],
          ]);
  return round1(
    weighted([
      [useCase, 3],
      [budgetFit, 3],
      [priority, 2],
      [brandScore(cpu.manufacturer, questionnaire.cpuBrand), 2],
      [availabilityScore(cpu), 1],
      [value, questionnaire.performancePriority === "value-focused" ? 2 : 1],
    ]),
  );
}

export function scoreGpuCandidate(
  gpu: GpuComponent,
  questionnaire: RecommendationQuestionnaire,
): number {
  const useCase = gpuUseCaseScore(gpu, questionnaire);
  const resolution =
    questionnaire.useCase === "gaming"
      ? gpuResolutionFit(gpu, questionnaire.resolution)
      : 100;
  const capability = normalize(
    gpuCapabilityIndex(gpu),
    PERFORMANCE_REFERENCES.gpu,
  );
  const budgetFit = clamp(
    100 - Math.abs(capability - gpuBudgetTarget(questionnaire)) * 1.5,
  );
  const target =
    questionnaire.useCase === "gaming"
      ? gpuResolutionTarget(questionnaire.resolution)
      : questionnaire.useCase === "workstation"
        ? 65
        : 40;
  const value = valueScore(capability, target);
  const priority =
    questionnaire.performancePriority === "gpu-focused"
      ? useCase
      : questionnaire.performancePriority === "value-focused"
        ? value
        : weighted([
            [useCase, 2],
            [value, 1],
          ]);
  return round1(
    weighted([
      [useCase, 3],
      [budgetFit, 3],
      [priority, 2],
      [resolution, questionnaire.useCase === "gaming" ? 2 : 0],
      [brandScore(gpu.manufacturer, questionnaire.gpuBrand), 2],
      [availabilityScore(gpu), 1],
      [value, questionnaire.performancePriority === "value-focused" ? 2 : 1],
    ]),
  );
}

export function scoreMotherboardCandidate(
  motherboard: MotherboardComponent,
  questionnaire: RecommendationQuestionnaire,
): number {
  return round1(
    weighted([
      [motherboardUseCaseScore(motherboard, questionnaire), 3],
      [availabilityScore(motherboard), 1],
    ]),
  );
}

export function scoreRamCandidate(
  ram: RamComponent,
  questionnaire: RecommendationQuestionnaire,
): number {
  const target = ramBudgetTarget(questionnaire);
  const budgetFit = clamp(
    100 - (Math.abs(ram.specs.totalCapacityGB - target) / target) * 100,
  );
  return round1(
    weighted([
      [ramUseCaseScore(ram, questionnaire.useCase), 3],
      [budgetFit, 2],
      [availabilityScore(ram), 1],
    ]),
  );
}

export function scoreCoolerCandidate(
  cooler: CoolerComponent,
  cpu: CpuComponent | null,
  questionnaire: RecommendationQuestionnaire,
): number {
  return round1(
    weighted([
      [coolerUseCaseScore(cooler, cpu, questionnaire), 4],
      [availabilityScore(cooler), 1],
    ]),
  );
}

export function scoreStorageCandidate(
  storage: StorageComponent,
  questionnaire: RecommendationQuestionnaire,
): number {
  const target = storageBudgetTarget(questionnaire);
  const budgetFit = clamp(
    100 - (Math.abs(storage.specs.capacityGB - target) / target) * 100,
  );
  return round1(
    weighted([
      [storageUseCaseScore(storage, questionnaire.useCase), 3],
      [budgetFit, 2],
      [availabilityScore(storage), 1],
    ]),
  );
}

export function scorePsuCandidate(
  psu: PsuComponent,
  power: PowerEstimate,
  gpu: GpuComponent | null,
): number {
  return round1(
    weighted([
      [psuCapabilityIndex(psu, power, gpu), 4],
      [availabilityScore(psu), 1],
    ]),
  );
}

export function scoreCaseCandidate(
  pcCase: CaseComponent,
  questionnaire: RecommendationQuestionnaire,
): number {
  return round1(
    weighted([
      [caseCapabilityIndex(pcCase, questionnaire), 4],
      [availabilityScore(pcCase), 1],
    ]),
  );
}

export function scoreFanCandidate(fan: CaseFanComponent): number {
  return round1(
    weighted([
      [fanCapabilityIndex(fan), 4],
      [availabilityScore(fan), 1],
    ]),
  );
}

/** Capability tier in the component's category, normalized to 0–100. */
export function componentCapabilityTier(
  component: Component,
  map: Partial<Record<ComponentCategory, Component>>,
  questionnaire: RecommendationQuestionnaire,
): number {
  switch (component.category) {
    case "cpu":
      return cpuUseCaseScore(component, questionnaire.useCase);
    case "gpu":
      return normalize(
        gpuCapabilityIndex(component),
        PERFORMANCE_REFERENCES.gpu,
      );
    case "motherboard":
      return motherboardUpgradeIndex(component);
    case "ram":
      return clamp((component.specs.totalCapacityGB / 64) * 100);
    case "cooler":
      return coolerCapabilityIndex(
        component,
        (map.cpu as CpuComponent | undefined) ?? null,
      );
    case "storage":
      return clamp((component.specs.capacityGB / 2000) * 100);
    case "psu":
      return clamp((component.specs.wattage / 1000) * 100);
    case "case":
      return caseCapabilityIndex(component, questionnaire);
    case "case-fan":
      return fanCapabilityIndex(component);
  }
}

/* ------------------------------------------------------------------ */
/* Build-level scoring                                                 */
/* ------------------------------------------------------------------ */

function byCategory(
  components: readonly Component[],
): Partial<Record<ComponentCategory, Component>> {
  const map: Partial<Record<ComponentCategory, Component>> = {};
  for (const component of components) {
    if (map[component.category] === undefined) {
      map[component.category] = component;
    }
  }
  return map;
}

const USE_CASE_COMPONENT_WEIGHTS: Record<
  UseCase,
  { cpu: number; gpu: number; ram: number; storage: number }
> = {
  gaming: { cpu: 30, gpu: 55, ram: 10, storage: 5 },
  productivity: { cpu: 45, gpu: 15, ram: 25, storage: 15 },
  workstation: { cpu: 40, gpu: 25, ram: 20, storage: 15 },
  general: { cpu: 30, gpu: 30, ram: 20, storage: 20 },
};

function useCaseFit(
  cpu: CpuComponent,
  gpu: GpuComponent,
  ram: RamComponent,
  storage: StorageComponent,
  questionnaire: RecommendationQuestionnaire,
): number {
  const weights = USE_CASE_COMPONENT_WEIGHTS[questionnaire.useCase];
  return weighted([
    [cpuUseCaseScore(cpu, questionnaire.useCase), weights.cpu],
    [gpuUseCaseScore(gpu, questionnaire), weights.gpu],
    [ramUseCaseScore(ram, questionnaire.useCase), weights.ram],
    [storageUseCaseScore(storage, questionnaire.useCase), weights.storage],
  ]);
}

function priorityFit(
  cpu: CpuComponent,
  gpu: GpuComponent,
  ram: RamComponent,
  storage: StorageComponent,
  questionnaire: RecommendationQuestionnaire,
): number {
  const cpuValue = valueScore(
    normalize(cpuComputeIndex(cpu), PERFORMANCE_REFERENCES.cpuCompute),
    questionnaire.useCase === "workstation" ? 80 : 60,
  );
  const gpuValue = valueScore(
    normalize(gpuCapabilityIndex(gpu), PERFORMANCE_REFERENCES.gpu),
    questionnaire.useCase === "gaming"
      ? gpuResolutionTarget(questionnaire.resolution)
      : 45,
  );
  const ramValue = valueScore(
    clamp(
      (ram.specs.totalCapacityGB /
        (questionnaire.useCase === "workstation" ? 64 : 32)) *
        100,
    ),
    100,
  );
  const storageValue = valueScore(
    clamp(
      (storage.specs.capacityGB /
        (questionnaire.useCase === "workstation" ? 2000 : 1000)) *
        100,
    ),
    100,
  );
  switch (questionnaire.performancePriority) {
    case "gpu-focused":
      return weighted([
        [gpuUseCaseScore(gpu, questionnaire), 5],
        [cpuUseCaseScore(cpu, questionnaire.useCase), 2],
        [ramUseCaseScore(ram, questionnaire.useCase), 1],
        [storageUseCaseScore(storage, questionnaire.useCase), 1],
      ]);
    case "cpu-focused":
      return weighted([
        [cpuUseCaseScore(cpu, questionnaire.useCase), 5],
        [gpuUseCaseScore(gpu, questionnaire), 2],
        [ramUseCaseScore(ram, questionnaire.useCase), 1],
        [storageUseCaseScore(storage, questionnaire.useCase), 1],
      ]);
    case "value-focused":
      return weighted([
        [cpuValue, 1],
        [gpuValue, 2],
        [ramValue, 1],
        [storageValue, 1],
      ]);
    case "balanced":
      return weighted([
        [cpuUseCaseScore(cpu, questionnaire.useCase), 3],
        [gpuUseCaseScore(gpu, questionnaire), 3],
        [ramUseCaseScore(ram, questionnaire.useCase), 2],
        [storageUseCaseScore(storage, questionnaire.useCase), 2],
      ]);
  }
}

function upgradeFit(
  motherboard: MotherboardComponent,
  psu: PsuComponent,
  pcCase: CaseComponent,
  power: PowerEstimate,
  questionnaire: RecommendationQuestionnaire,
): number {
  const motherboardScore = motherboardUpgradeIndex(motherboard);
  const psuHeadroom =
    power.recommendedPsuW === null || psu.specs.wattage <= 0
      ? 60
      : clamp(
          ((psu.specs.wattage - power.recommendedPsuW) /
            power.recommendedPsuW) *
            250,
        );
  const caseHeadroom =
    pcCase.specs.maxGpuLengthMm === null
      ? 50
      : clamp(((pcCase.specs.maxGpuLengthMm - 300) / 100) * 100);
  const raw = weighted([
    [motherboardScore, 2],
    [psuHeadroom, 1],
    [caseHeadroom, 1],
  ]);
  const factor =
    questionnaire.upgradeFlexibility === "high"
      ? 1.4
      : questionnaire.upgradeFlexibility === "low"
        ? 0.4
        : 1;
  return clamp(50 + (raw - 50) * factor);
}

function balanceFit(
  cpu: CpuComponent,
  gpu: GpuComponent,
  ram: RamComponent,
  questionnaire: RecommendationQuestionnaire,
): number {
  const cpuNorm =
    questionnaire.useCase === "gaming"
      ? normalize(cpuGamingIndex(cpu), PERFORMANCE_REFERENCES.cpuGaming)
      : normalize(cpuComputeIndex(cpu), PERFORMANCE_REFERENCES.cpuCompute);
  const gpuNorm = normalize(
    gpuCapabilityIndex(gpu),
    PERFORMANCE_REFERENCES.gpu,
  );
  const ramNorm = clamp(
    (ram.specs.totalCapacityGB /
      (questionnaire.useCase === "workstation" ? 64 : 32)) *
      100,
  );
  switch (questionnaire.useCase) {
    case "gaming": {
      const cpuOverkill = Math.max(0, cpuNorm * 0.8 - gpuNorm) * 0.8;
      return clamp(100 - cpuOverkill);
    }
    case "productivity": {
      const gpuOverkill = Math.max(0, gpuNorm * 0.8 - cpuNorm) * 0.5;
      return clamp(100 - gpuOverkill);
    }
    case "workstation": {
      const spread =
        Math.max(cpuNorm, gpuNorm, ramNorm) -
        Math.min(cpuNorm, gpuNorm, ramNorm);
      return clamp(100 - spread * 0.5);
    }
    case "general":
      return clamp(100 - Math.abs(cpuNorm - gpuNorm) * 0.5);
  }
}

function budgetPostureFit(
  components: readonly Component[],
  allocation: readonly BudgetAllocation[],
  questionnaire: RecommendationQuestionnaire,
  power: PowerEstimate,
): number {
  const map = byCategory(components);
  const shares = new Map(
    allocation.map((entry) => [entry.category, entry.percent]),
  );
  const parts: [number, number][] = [];
  for (const category of [
    "cpu",
    "gpu",
    "motherboard",
    "ram",
    "cooler",
    "storage",
    "psu",
    "case",
    "case-fan",
  ] as const) {
    const component = map[category];
    const share = shares.get(category) ?? 0;
    if (!component) continue;
    let tier = 50;
    switch (category) {
      case "cpu":
        tier = cpuUseCaseScore(
          component as CpuComponent,
          questionnaire.useCase,
        );
        break;
      case "gpu":
        tier = gpuUseCaseScore(component as GpuComponent, questionnaire);
        break;
      case "motherboard":
        tier = motherboardUpgradeIndex(component as MotherboardComponent);
        break;
      case "ram":
        tier = ramUseCaseScore(
          component as RamComponent,
          questionnaire.useCase,
        );
        break;
      case "cooler":
        tier = coolerUseCaseScore(
          component as CoolerComponent,
          (map.cpu as CpuComponent | undefined) ?? null,
          questionnaire,
        );
        break;
      case "storage":
        tier = storageUseCaseScore(
          component as StorageComponent,
          questionnaire.useCase,
        );
        break;
      case "psu":
        tier = psuCapabilityIndex(
          component as PsuComponent,
          power,
          (map.gpu as GpuComponent | undefined) ?? null,
        );
        break;
      case "case":
        tier = caseCapabilityIndex(component as CaseComponent, questionnaire);
        break;
      case "case-fan":
        tier = fanCapabilityIndex(component as CaseFanComponent);
        break;
    }
    // A 40% share is the reference for the highest-priority category.
    const expected = clamp((share / 40) * 100);
    parts.push([clamp(100 - Math.abs(tier - expected)) / 100, 1]);
  }
  if (parts.length === 0) return 50;
  const allocationAlignment =
    (parts.reduce((sum, [value]) => sum + value, 0) / parts.length) * 100;
  const cpu = map.cpu as CpuComponent | undefined;
  const gpu = map.gpu as GpuComponent | undefined;
  const ram = map.ram as RamComponent | undefined;
  const storage = map.storage as StorageComponent | undefined;
  const budgetAlignment = weighted([
    [
      cpu
        ? clamp(
            100 -
              Math.abs(
                cpuUseCaseScore(cpu, questionnaire.useCase) -
                  cpuBudgetTarget(questionnaire),
              ) *
                1.2,
          )
        : 50,
      2,
    ],
    [
      gpu
        ? clamp(
            100 -
              Math.abs(
                normalize(gpuCapabilityIndex(gpu), PERFORMANCE_REFERENCES.gpu) -
                  gpuBudgetTarget(questionnaire),
              ) *
                1.2,
          )
        : 50,
      2,
    ],
    [
      ram
        ? clamp(
            100 -
              (Math.abs(
                ram.specs.totalCapacityGB - ramBudgetTarget(questionnaire),
              ) /
                ramBudgetTarget(questionnaire)) *
                100,
          )
        : 50,
      1,
    ],
    [
      storage
        ? clamp(
            100 -
              (Math.abs(
                storage.specs.capacityGB - storageBudgetTarget(questionnaire),
              ) /
                storageBudgetTarget(questionnaire)) *
                100,
          )
        : 50,
      1,
    ],
  ]);
  return clamp(allocationAlignment * 0.4 + budgetAlignment * 0.6);
}

export function criticalMissingSpecifications(
  components: readonly Component[],
): string[] {
  const missing: string[] = [];
  for (const component of components) {
    switch (component.category) {
      case "cpu": {
        const s = component.specs;
        if (s.maxPowerW === null) missing.push("CPU maximum power");
        if (s.maxMemoryGB === null) missing.push("CPU maximum memory");
        if (s.supportedChipsets === null) missing.push("CPU chipset support");
        break;
      }
      case "gpu": {
        const s = component.specs;
        if (s.lengthMm === null) missing.push("GPU length");
        if (s.powerDrawW === null) missing.push("GPU power draw");
        if (s.powerConnectors === null) missing.push("GPU power connectors");
        break;
      }
      case "motherboard": {
        const s = component.specs;
        if (s.maxRamGB === null) missing.push("motherboard maximum memory");
        if (s.m2SlotDetails === null) missing.push("motherboard M.2 detail");
        if (s.fanHeaders === null) missing.push("motherboard fan headers");
        break;
      }
      case "cooler": {
        const s = component.specs;
        if (s.tdpRatingW === null) missing.push("cooler thermal rating");
        if (s.type === "air" && s.heightMm === null) {
          missing.push("cooler height");
        }
        if (s.type === "aio-liquid" && s.radiatorSizeMm === null) {
          missing.push("cooler radiator size");
        }
        break;
      }
      case "case": {
        const s = component.specs;
        if (s.maxGpuLengthMm === null) missing.push("case GPU clearance");
        if (s.maxCoolerHeightMm === null) missing.push("case cooler clearance");
        if (s.maxPsuLengthMm === null) missing.push("case PSU clearance");
        if (s.maxGpuSlots === null) missing.push("case GPU slot thickness");
        break;
      }
      case "psu": {
        const s = component.specs;
        if (s.connectors.pcie8pin === null)
          missing.push("PSU PCIe connector count");
        if (s.connectors.pcie16pin === null)
          missing.push("PSU 16-pin connector count");
        if (s.lengthMm === null) missing.push("PSU length");
        break;
      }
      case "storage": {
        const s = component.specs;
        if (s.formFactor === "m2" && s.m2LengthMm === null) {
          missing.push("storage M.2 length");
        }
        if (s.interface === "nvme" && s.pcieGeneration === null) {
          missing.push("storage PCIe generation");
        }
        break;
      }
      case "ram":
      case "case-fan":
        break;
    }
  }
  return missing;
}

export function scoreBuild(
  components: readonly Component[],
  questionnaire: RecommendationQuestionnaire,
  report: CompatibilityReport,
  allocation: readonly BudgetAllocation[],
): RecommendationScore {
  const map = byCategory(components);
  const cpu = map.cpu as CpuComponent | undefined;
  const gpu = map.gpu as GpuComponent | undefined;
  const motherboard = map.motherboard as MotherboardComponent | undefined;
  const ram = map.ram as RamComponent | undefined;
  const cooler = map.cooler as CoolerComponent | undefined;
  const storage = map.storage as StorageComponent | undefined;
  const psu = map.psu as PsuComponent | undefined;
  const pcCase = map.case as CaseComponent | undefined;

  if (
    !cpu ||
    !gpu ||
    !motherboard ||
    !ram ||
    !cooler ||
    !storage ||
    !psu ||
    !pcCase
  ) {
    throw new Error("scoreBuild requires a complete core build");
  }

  const useCase = useCaseFit(cpu, gpu, ram, storage, questionnaire);
  const priority = priorityFit(cpu, gpu, ram, storage, questionnaire);
  const resolution =
    questionnaire.useCase === "gaming"
      ? gpuResolutionFit(gpu, questionnaire.resolution)
      : 100;
  const brand = weighted([
    [brandScore(cpu.manufacturer, questionnaire.cpuBrand), 1],
    [brandScore(gpu.manufacturer, questionnaire.gpuBrand), 1],
  ]);
  const posture = budgetPostureFit(
    components,
    allocation,
    questionnaire,
    report.power,
  );
  const upgrade = upgradeFit(
    motherboard,
    psu,
    pcCase,
    report.power,
    questionnaire,
  );
  const balance = balanceFit(cpu, gpu, ram, questionnaire);
  const missing = criticalMissingSpecifications(components);
  const compatibilityConfidence = clamp(
    100 -
      report.summary.counts.unknown * 8 -
      report.summary.counts.warning * 4 -
      report.summary.counts.incompatible * 40,
  );
  const availability = weighted(
    components.map((component) => [availabilityScore(component), 1] as const),
  );
  const confidence = clamp(
    compatibilityConfidence * 0.7 +
      availability * 0.3 -
      Math.min(30, missing.length * 3),
  );

  const dimensions: ScoreDimensions = {
    useCase: round1(useCase),
    priority: round1(priority),
    resolution: round1(resolution),
    brand: round1(brand),
    budgetPosture: round1(posture),
    upgrade: round1(upgrade),
    balance: round1(balance),
    confidence: round1(confidence),
  };
  const weights = SCORING_WEIGHTS[questionnaire.useCase];
  const total = round1(
    (Object.keys(weights) as (keyof ScoreDimensions)[]).reduce(
      (sum, key) => sum + dimensions[key] * weights[key],
      0,
    ) / 100,
  );
  return { total, dimensions };
}

export function dimensionWeights(
  useCase: UseCase,
): Record<keyof ScoreDimensions, number> {
  return { ...SCORING_WEIGHTS[useCase] };
}
