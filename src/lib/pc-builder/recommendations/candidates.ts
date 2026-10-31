/*
 * Candidate filtering and ranking for guided recommendations (M10.4).
 *
 * Filters reject only *known* incompatibilities. Missing data passes through
 * to evaluateBuild(), which remains the final compatibility authority and
 * reports Unknown rather than guessing.
 */

import type { PowerEstimate } from "../power";
import { moduleLengthToMm } from "../rules/storage";
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
import {
  caseUseCaseScore,
  fanUseCaseScore,
  gpuResolutionFit,
  scoreCaseCandidate,
  scoreCoolerCandidate,
  scoreCpuCandidate,
  scoreFanCandidate,
  scoreGpuCandidate,
  scoreMotherboardCandidate,
  scorePsuCandidate,
  scoreRamCandidate,
  scoreStorageCandidate,
} from "./scoring";
import type { RecommendationQuestionnaire } from "./types";

function ofCategory<C extends Component>(
  catalogue: readonly Component[],
  category: ComponentCategory,
): C[] {
  return catalogue.filter(
    (component) => component.category === category,
  ) as C[];
}

function rankedBy<T extends { id: string }>(
  items: readonly T[],
  score: (item: T) => number,
): T[] {
  return [...items]
    .map((item) => ({ item, score: score(item) }))
    .sort(
      (a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id, "en"),
    )
    .map((entry) => entry.item);
}

/**
 * Prefer in-production parts when enough exist. Fall back to unknown
 * availability, then discontinued, rather than returning an empty frontier.
 * Every fallback remains labelled in the result limitations.
 */
function preferBrand<T extends Component>(
  items: readonly T[],
  manufacturer: string,
  minimum = 2,
): T[] {
  if (manufacturer === "no-preference") return [...items];
  const preferred = items.filter(
    (item) => item.manufacturer.toLowerCase() === manufacturer.toLowerCase(),
  );
  return preferred.length >= minimum ? preferred : [...items];
}

function preferProductionFirst<T extends Component>(
  items: readonly T[],
  minimum: number,
): T[] {
  const inProduction = items.filter(
    (item) => item.availability === "in-production",
  );
  if (inProduction.length >= minimum) return inProduction;
  const unknown = items.filter((item) => item.availability === "unknown");
  const combined = [...inProduction, ...unknown];
  if (combined.length >= minimum) return combined;
  const rest = items.filter(
    (item) =>
      item.availability !== "in-production" && item.availability !== "unknown",
  );
  return [...combined, ...rest];
}

export function rankCpus(
  catalogue: readonly Component[],
  questionnaire: RecommendationQuestionnaire,
): CpuComponent[] {
  const ranked = rankedBy(ofCategory<CpuComponent>(catalogue, "cpu"), (cpu) =>
    scoreCpuCandidate(cpu, questionnaire),
  );
  return preferProductionFirst(preferBrand(ranked, questionnaire.cpuBrand), 3);
}

export function rankGpus(
  catalogue: readonly Component[],
  questionnaire: RecommendationQuestionnaire,
): GpuComponent[] {
  const ranked = rankedBy(ofCategory<GpuComponent>(catalogue, "gpu"), (gpu) =>
    scoreGpuCandidate(gpu, questionnaire),
  );
  return preferProductionFirst(preferBrand(ranked, questionnaire.gpuBrand), 3);
}

/** Known socket fit only; chipset/BIOS checks stay with evaluateBuild. */
export function isMotherboardCompatibleWithCpu(
  motherboard: MotherboardComponent,
  cpu: CpuComponent,
): boolean {
  return motherboard.specs.socket === cpu.specs.socket;
}

export function rankMotherboards(
  catalogue: readonly Component[],
  cpu: CpuComponent,
  questionnaire: RecommendationQuestionnaire,
): MotherboardComponent[] {
  const candidates = ofCategory<MotherboardComponent>(
    catalogue,
    "motherboard",
  ).filter((motherboard) => isMotherboardCompatibleWithCpu(motherboard, cpu));
  return preferProductionFirst(
    rankedBy(candidates, (motherboard) =>
      scoreMotherboardCandidate(motherboard, questionnaire),
    ),
    2,
  );
}

/** Known memory-generation and form-factor fit. */
export function isRamCompatibleWithMotherboard(
  ram: RamComponent,
  motherboard: MotherboardComponent,
): boolean {
  return (
    ram.specs.generation === motherboard.specs.ramGeneration &&
    ram.specs.formFactor === motherboard.specs.ramFormFactor
  );
}

export function rankRam(
  catalogue: readonly Component[],
  motherboard: MotherboardComponent,
  questionnaire: RecommendationQuestionnaire,
): RamComponent[] {
  const candidates = ofCategory<RamComponent>(catalogue, "ram").filter((ram) =>
    isRamCompatibleWithMotherboard(ram, motherboard),
  );
  return rankedBy(candidates, (ram) => scoreRamCandidate(ram, questionnaire));
}

/** Known socket-mount fit. Thermal capacity is scored, not hard-filtered. */
export function isCoolerCompatibleWithCpu(
  cooler: CoolerComponent,
  cpu: CpuComponent,
): boolean {
  return cooler.specs.supportedSockets.includes(cpu.specs.socket);
}

export function rankCoolers(
  catalogue: readonly Component[],
  cpu: CpuComponent,
  questionnaire: RecommendationQuestionnaire,
): CoolerComponent[] {
  const candidates = ofCategory<CoolerComponent>(catalogue, "cooler").filter(
    (cooler) => isCoolerCompatibleWithCpu(cooler, cpu),
  );
  return preferProductionFirst(
    rankedBy(candidates, (cooler) =>
      scoreCoolerCandidate(cooler, cpu, questionnaire),
    ),
    2,
  );
}

/**
 * Known storage fit. Returns false only when the board provably lacks a
 * compatible slot/port; unknown data passes to evaluateBuild.
 */
export function isStorageCompatibleWithMotherboard(
  storage: StorageComponent,
  motherboard: MotherboardComponent,
): boolean {
  if (storage.specs.formFactor !== "m2") {
    return motherboard.specs.sataPorts === null
      ? true
      : motherboard.specs.sataPorts > 0;
  }

  if (motherboard.specs.m2Slots === 0) return false;
  const slots = motherboard.specs.m2SlotDetails;
  if (slots === null || slots.length === 0) return true;

  const driveLength = moduleLengthToMm(storage.specs.m2LengthMm);
  return slots.some((slot) => {
    const protocol =
      slot.interface === "both" || slot.interface === storage.specs.interface;
    if (!protocol) return false;
    if (slot.maxLengthMm === null || driveLength === null) return true;
    return slot.maxLengthMm >= driveLength;
  });
}

export function rankStorage(
  catalogue: readonly Component[],
  motherboard: MotherboardComponent,
  questionnaire: RecommendationQuestionnaire,
): StorageComponent[] {
  const candidates = ofCategory<StorageComponent>(catalogue, "storage").filter(
    (storage) => isStorageCompatibleWithMotherboard(storage, motherboard),
  );
  return preferProductionFirst(
    rankedBy(candidates, (storage) =>
      scoreStorageCandidate(storage, questionnaire),
    ),
    2,
  );
}

/** Known physical fit for motherboard, GPU and cooler. */
export function isCaseCompatibleWithBuild(
  pcCase: CaseComponent,
  motherboard: MotherboardComponent,
  gpu: GpuComponent,
  cooler: CoolerComponent,
): boolean {
  if (
    !pcCase.specs.supportedFormFactors.includes(motherboard.specs.formFactor)
  ) {
    return false;
  }

  if (
    pcCase.specs.maxGpuLengthMm !== null &&
    gpu.specs.lengthMm !== null &&
    gpu.specs.lengthMm > pcCase.specs.maxGpuLengthMm
  ) {
    return false;
  }

  if (cooler.specs.type === "air") {
    if (
      pcCase.specs.maxCoolerHeightMm !== null &&
      cooler.specs.heightMm !== null &&
      cooler.specs.heightMm > pcCase.specs.maxCoolerHeightMm
    ) {
      return false;
    }
  } else if (
    cooler.specs.radiatorSizeMm !== null &&
    pcCase.specs.radiatorSupportMm !== null &&
    !pcCase.specs.radiatorSupportMm.includes(cooler.specs.radiatorSizeMm)
  ) {
    return false;
  }

  return true;
}

export function rankCases(
  catalogue: readonly Component[],
  motherboard: MotherboardComponent,
  gpu: GpuComponent,
  cooler: CoolerComponent,
  questionnaire: RecommendationQuestionnaire,
): CaseComponent[] {
  const candidates = ofCategory<CaseComponent>(catalogue, "case").filter(
    (pcCase) => isCaseCompatibleWithBuild(pcCase, motherboard, gpu, cooler),
  );
  return preferProductionFirst(
    rankedBy(candidates, (pcCase) => scoreCaseCandidate(pcCase, questionnaire)),
    2,
  );
}

/**
 * Known PSU form-factor/length fit. Wattage is filtered against the power
 * estimate when known; connector sufficiency remains an evaluateBuild check.
 */
export function isPsuCompatibleWithCase(
  psu: PsuComponent,
  pcCase: CaseComponent,
): boolean {
  if (!pcCase.specs.psuFormFactors.includes(psu.specs.formFactor)) {
    return false;
  }
  if (
    pcCase.specs.maxPsuLengthMm !== null &&
    psu.specs.lengthMm !== null &&
    psu.specs.lengthMm > pcCase.specs.maxPsuLengthMm
  ) {
    return false;
  }
  return true;
}

export function rankPsus(
  catalogue: readonly Component[],
  pcCase: CaseComponent,
  gpu: GpuComponent,
  power: PowerEstimate,
): PsuComponent[] {
  const formFit = ofCategory<PsuComponent>(catalogue, "psu").filter((psu) =>
    isPsuCompatibleWithCase(psu, pcCase),
  );
  const minimum = power.recommendedPsuW ?? power.loadWatts;
  const wattageFit =
    minimum === null
      ? formFit
      : formFit.filter((psu) => psu.specs.wattage >= minimum);
  const pool = wattageFit.length > 0 ? wattageFit : formFit;
  return preferProductionFirst(
    rankedBy(pool, (psu) => scorePsuCandidate(psu, power, gpu)),
    2,
  );
}

/** Known fan size/mount fit. Missing data passes through. */
export function isFanCompatibleWithCase(
  fan: CaseFanComponent,
  pcCase: CaseComponent,
): boolean {
  if (
    pcCase.specs.fanSizesMm !== null &&
    !pcCase.specs.fanSizesMm.includes(fan.specs.sizeMm)
  ) {
    return false;
  }
  if (
    pcCase.specs.fanMounts !== null &&
    !pcCase.specs.fanMounts.some((mount) => mount.sizeMm === fan.specs.sizeMm)
  ) {
    return false;
  }
  return true;
}

export function rankFans(
  catalogue: readonly Component[],
  pcCase: CaseComponent,
): CaseFanComponent[] {
  const candidates = ofCategory<CaseFanComponent>(catalogue, "case-fan").filter(
    (fan) => isFanCompatibleWithCase(fan, pcCase),
  );
  return preferProductionFirst(
    rankedBy(candidates, (fan) => scoreFanCandidate(fan)),
    2,
  );
}

/** Resolution-aware GPU score used by tests and explanations. */
export function gpuResolutionScore(
  gpu: GpuComponent,
  questionnaire: RecommendationQuestionnaire,
): number {
  return gpuResolutionFit(gpu, questionnaire.resolution);
}

export const CANDIDATE_SCORE_FUNCTIONS = {
  cpu: scoreCpuCandidate,
  gpu: scoreGpuCandidate,
  motherboard: scoreMotherboardCandidate,
  ram: scoreRamCandidate,
  cooler: scoreCoolerCandidate,
  storage: scoreStorageCandidate,
  case: scoreCaseCandidate,
  psu: scorePsuCandidate,
  fan: scoreFanCandidate,
} as const;

export const CANDIDATE_USE_CASE_SCORE_FUNCTIONS = {
  case: caseUseCaseScore,
  fan: fanUseCaseScore,
} as const;
