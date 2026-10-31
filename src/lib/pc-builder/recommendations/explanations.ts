/*
 * Human-readable explanations for guided recommendations (M10.4).
 *
 * Wording is deliberately specification-based. No benchmark, FPS or price
 * claims are generated because neither data source exists in this milestone.
 */

import type { CompatibilityReport } from "../engine";
import type {
  CaseComponent,
  Component,
  ComponentCategory,
  CoolerComponent,
} from "../types";
import type {
  AlternativeKind,
  BudgetSummary,
  ComponentSelection,
  RecommendationQuestionnaire,
  SelectionSpec,
} from "./types";

const USE_CASE_LABELS: Record<RecommendationQuestionnaire["useCase"], string> =
  {
    gaming: "gaming",
    productivity: "productivity",
    workstation: "workstation",
    general: "general-purpose",
  };

const RESOLUTION_LABELS: Record<
  RecommendationQuestionnaire["resolution"],
  string
> = {
  "1080p": "1080p",
  "1440p": "1440p",
  "4k": "4K",
  "not-applicable": "no resolution target",
};

export function keySpecsFor(component: Component): SelectionSpec[] {
  const specs: SelectionSpec[] = [];
  const add = (label: string, value: string | null) => {
    if (value !== null && value !== "") specs.push({ label, value });
  };
  switch (component.category) {
    case "cpu": {
      const s = component.specs;
      add("Socket", s.socket);
      add(
        "Cores / threads",
        s.cores === null || s.threads === null
          ? null
          : `${s.cores}C / ${s.threads}T`,
      );
      add(
        "Boost clock",
        s.boostClockGHz === null ? null : `${s.boostClockGHz} GHz`,
      );
      add("Memory", s.memoryTypes.join(" / "));
      add("Base TDP", s.tdpW === null ? null : `${s.tdpW} W`);
      break;
    }
    case "gpu": {
      const s = component.specs;
      add("Chipset", s.chipset);
      add("VRAM", s.vramGB === null ? null : `${s.vramGB} GB`);
      add("Board power", s.powerDrawW === null ? null : `${s.powerDrawW} W`);
      add("Length", s.lengthMm === null ? null : `${s.lengthMm} mm`);
      add(
        "Recommended PSU",
        s.recommendedPsuW === null ? null : `${s.recommendedPsuW} W`,
      );
      break;
    }
    case "motherboard": {
      const s = component.specs;
      add("Socket", s.socket);
      add("Chipset", s.chipset);
      add("Form factor", s.formFactor);
      add("Memory", `${s.ramGeneration} · ${s.ramSlots} slots`);
      add("M.2 slots", s.m2Slots === null ? null : `${s.m2Slots}`);
      break;
    }
    case "ram": {
      const s = component.specs;
      add("Capacity", `${s.totalCapacityGB} GB`);
      add("Configuration", `${s.moduleCount} × ${s.moduleCapacityGB} GB`);
      add("Speed", `${s.speedMTs} MT/s`);
      add("Profile", s.profile);
      break;
    }
    case "cooler": {
      const s = component.specs;
      add("Type", s.type === "air" ? "Air cooler" : "Liquid cooler (AIO)");
      add(
        "Height / radiator",
        s.type === "air"
          ? s.heightMm === null
            ? null
            : `${s.heightMm} mm`
          : s.radiatorSizeMm === null
            ? null
            : `${s.radiatorSizeMm} mm radiator`,
      );
      add("Sockets", s.supportedSockets.join(", "));
      add("Thermal rating", s.tdpRatingW === null ? null : `${s.tdpRatingW} W`);
      break;
    }
    case "storage": {
      const s = component.specs;
      add("Capacity", `${s.capacityGB} GB`);
      add(
        "Interface",
        `${s.storageType === "ssd" ? "SSD" : "HDD"} · ${s.interface === "nvme" ? "NVMe" : "SATA"}`,
      );
      add(
        "Form factor",
        s.formFactor === "m2"
          ? `M.2${s.m2LengthMm === null ? "" : ` ${s.m2LengthMm}`}`
          : s.formFactor,
      );
      add(
        "Sequential read",
        s.seqReadMBps === null ? null : `${s.seqReadMBps} MB/s`,
      );
      break;
    }
    case "psu": {
      const s = component.specs;
      add("Wattage", `${s.wattage} W`);
      add("Efficiency", s.efficiency);
      add("Modularity", s.modularity);
      add(
        "PCIe 8-pin / 16-pin",
        `${s.connectors.pcie8pin ?? "?"} / ${s.connectors.pcie16pin ?? "?"}`,
      );
      break;
    }
    case "case": {
      const s = component.specs;
      add("Type", s.caseType);
      add("Motherboards", s.supportedFormFactors.join(", "));
      add(
        "Max GPU length",
        s.maxGpuLengthMm === null ? null : `${s.maxGpuLengthMm} mm`,
      );
      add(
        "Max cooler height",
        s.maxCoolerHeightMm === null ? null : `${s.maxCoolerHeightMm} mm`,
      );
      add(
        "Max PSU length",
        s.maxPsuLengthMm === null ? null : `${s.maxPsuLengthMm} mm`,
      );
      break;
    }
    case "case-fan": {
      const s = component.specs;
      add("Size", `${s.sizeMm} mm`);
      add("Connector", s.connector === "4-pin-pwm" ? "4-pin PWM" : "3-pin DC");
      add("Airflow", s.airflowCFM === null ? null : `${s.airflowCFM} CFM`);
      break;
    }
  }
  return specs;
}

export function rationaleFor(
  component: Component,
  questionnaire: RecommendationQuestionnaire,
): string {
  const useCase = USE_CASE_LABELS[questionnaire.useCase];
  switch (component.category) {
    case "cpu":
      return `Chosen for its ${component.specs.cores ?? "?"} cores / ${component.specs.threads ?? "?"} threads and ${component.specs.boostClockGHz ?? "?"} GHz boost, matching the ${useCase} priority.`;
    case "gpu":
      return `Chosen for ${component.specs.vramGB ?? "?"} GB VRAM and ${component.specs.powerDrawW ?? "?"} W board power, near the ${RESOLUTION_LABELS[questionnaire.resolution]} capability target.`;
    case "motherboard":
      return `Chosen for the ${component.specs.socket} socket, ${component.specs.ramGeneration} memory support and ${component.specs.m2Slots ?? "unknown"} M.2 slot(s).`;
    case "ram":
      return `Chosen for ${component.specs.totalCapacityGB} GB at ${component.specs.speedMTs} MT/s, matching the ${useCase} memory target.`;
    case "cooler":
      return component.specs.type === "air"
        ? `Chosen for ${component.specs.supportedSockets.join(", ")} mounting and a ${component.specs.heightMm ?? "published"} mm air-cooler profile.`
        : `Chosen for ${component.specs.supportedSockets.join(", ")} mounting and a ${component.specs.radiatorSizeMm ?? "published"} mm radiator.`;
    case "storage":
      return `Chosen for ${component.specs.capacityGB} GB ${component.specs.interface === "nvme" ? "NVMe" : "SATA"} storage and ${component.specs.seqReadMBps ?? "unpublished"} MB/s sequential read.`;
    case "psu":
      return `Chosen for ${component.specs.wattage} W capacity, ${component.specs.efficiency} efficiency and its documented GPU connectors.`;
    case "case":
      return `Chosen for ${component.specs.supportedFormFactors.join("/")} support, ${component.specs.maxGpuLengthMm ?? "unpublished"} mm GPU clearance and ${component.specs.maxCoolerHeightMm ?? "unpublished"} mm cooler clearance.`;
    case "case-fan":
      return `Chosen for its ${component.specs.sizeMm} mm size, ${component.specs.airflowCFM ?? "unpublished"} CFM airflow and ${component.specs.connector === "4-pin-pwm" ? "PWM" : "DC"} control.`;
  }
}

export function limitationsFor(component: Component): string[] {
  const limitations: string[] = [];
  if (component.availability !== "in-production") {
    limitations.push(
      `Availability is recorded as ${component.availability}; stock is not verified.`,
    );
  }
  switch (component.category) {
    case "cpu": {
      const s = component.specs;
      if (s.maxPowerW === null) {
        limitations.push(
          "Maximum boost power is not published; power sizing uses base TDP.",
        );
      }
      if (s.supportedChipsets === null) {
        limitations.push("Supported chipset list is not published.");
      }
      if (s.maxMemoryGB === null) {
        limitations.push("Maximum memory capacity is not published.");
      }
      break;
    }
    case "gpu": {
      const s = component.specs;
      if (s.lengthMm === null) {
        limitations.push(
          "Card length is not published; case clearance cannot be confirmed.",
        );
      }
      if (s.powerDrawW === null) {
        limitations.push("Board power is not published.");
      }
      if (s.powerConnectors === null) {
        limitations.push("Power connector requirements are not published.");
      }
      if (s.slotWidth === null) {
        limitations.push("Slot thickness is not published.");
      }
      break;
    }
    case "motherboard": {
      const s = component.specs;
      if (s.maxRamGB === null) {
        limitations.push("Maximum memory capacity is not published.");
      }
      if (s.m2SlotDetails === null) {
        limitations.push(
          "Per-slot M.2 protocol and length data is not published.",
        );
      }
      if (s.fanHeaders === null) {
        limitations.push("Fan header count is not published.");
      }
      limitations.push(
        "Minimum BIOS version is not modelled; check the board CPU support list.",
      );
      break;
    }
    case "cooler": {
      const s = component.specs;
      if (s.tdpRatingW === null) {
        limitations.push(
          "Cooling capacity rating is not published; thermal adequacy is unknown.",
        );
      }
      if (s.type === "air" && s.heightMm === null) {
        limitations.push("Cooler height is not published.");
      }
      if (s.type === "aio-liquid" && s.radiatorSizeMm === null) {
        limitations.push("Radiator size is not published.");
      }
      break;
    }
    case "storage": {
      const s = component.specs;
      if (s.formFactor === "m2" && s.m2LengthMm === null) {
        limitations.push("M.2 module length is not published.");
      }
      if (s.interface === "nvme" && s.pcieGeneration === null) {
        limitations.push("NVMe PCIe generation is not published.");
      }
      break;
    }
    case "psu": {
      const s = component.specs;
      if (s.connectors.pcie8pin === null || s.connectors.pcie16pin === null) {
        limitations.push("Complete PCIe connector inventory is not published.");
      }
      if (s.lengthMm === null) {
        limitations.push("PSU chassis length is not published.");
      }
      break;
    }
    case "case": {
      const s = component.specs;
      if (s.maxGpuLengthMm === null) {
        limitations.push("Maximum GPU length is not published.");
      }
      if (s.maxCoolerHeightMm === null) {
        limitations.push("Maximum cooler height is not published.");
      }
      if (s.maxPsuLengthMm === null) {
        limitations.push("Maximum PSU length is not published.");
      }
      if (s.maxGpuSlots === null) {
        limitations.push(
          "GPU slot-thickness allowance is not published; physical thickness is unverified.",
        );
      }
      break;
    }
    case "case-fan":
      break;
  }
  return limitations;
}

export function alternativeKind(
  selected: Component,
  alternative: Component,
  selectedScore: number,
  alternativeScore: number,
  questionnaire: RecommendationQuestionnaire,
): AlternativeKind {
  const preference =
    alternative.category === "cpu"
      ? questionnaire.cpuBrand
      : alternative.category === "gpu"
        ? questionnaire.gpuBrand
        : "no-preference";
  if (
    preference !== "no-preference" &&
    alternative.manufacturer.toLowerCase() === preference.toLowerCase() &&
    alternative.manufacturer !== selected.manufacturer
  ) {
    return "brand";
  }
  if (alternativeScore > selectedScore + 3) return "performance";
  if (alternativeScore < selectedScore - 3) return "value";
  return "similar";
}

export function alternativeTradeoff(
  alternative: Component,
  kind: AlternativeKind,
): string {
  const prefix =
    kind === "performance"
      ? "Higher capability score in this category"
      : kind === "value"
        ? "Lower capability score in this category"
        : kind === "brand"
          ? "Matches your manufacturer preference"
          : "Similar capability score";
  const detail =
    alternative.category === "gpu"
      ? ` (${alternative.specs.vramGB ?? "?"} GB VRAM, ${alternative.specs.powerDrawW ?? "?"} W board power)`
      : alternative.category === "cpu"
        ? ` (${alternative.specs.cores ?? "?"} cores, ${alternative.specs.boostClockGHz ?? "?"} GHz boost)`
        : alternative.category === "ram"
          ? ` (${alternative.specs.totalCapacityGB} GB at ${alternative.specs.speedMTs} MT/s)`
          : alternative.category === "storage"
            ? ` (${alternative.specs.capacityGB} GB, ${alternative.specs.seqReadMBps ?? "?"} MB/s read)`
            : "";
  return `${prefix}${detail}. Price is unavailable, so cost is not compared.`;
}

export function buildHeadline(
  questionnaire: RecommendationQuestionnaire,
): string {
  const useCase = USE_CASE_LABELS[questionnaire.useCase];
  if (questionnaire.useCase === "gaming") {
    return `Recommended ${RESOLUTION_LABELS[questionnaire.resolution]} ${useCase} build`;
  }
  return `Recommended ${useCase} build`;
}

export function buildExplanation(
  questionnaire: RecommendationQuestionnaire,
  components: readonly Component[],
  report: CompatibilityReport,
  budget: BudgetSummary,
): string {
  const gpu = components.find((component) => component.category === "gpu");
  const cpu = components.find((component) => component.category === "cpu");
  const ram = components.find((component) => component.category === "ram");
  const resolution =
    questionnaire.useCase === "gaming"
      ? `${RESOLUTION_LABELS[questionnaire.resolution]} `
      : "";
  const priority = questionnaire.performancePriority.replace("-", " ");
  const gpuText =
    gpu?.category === "gpu"
      ? `${gpu.manufacturer} ${gpu.name} with ${gpu.specs.vramGB ?? "unknown"} GB VRAM`
      : "a graphics card";
  const cpuText =
    cpu?.category === "cpu" ? `${cpu.manufacturer} ${cpu.name}` : "a processor";
  const ramText =
    ram?.category === "ram"
      ? `${ram.specs.totalCapacityGB} GB of ${ram.specs.generation} memory`
      : "system memory";
  const powerText = report.power.sufficientData
    ? `The power estimate is ${report.power.loadWatts ?? "unknown"} W with a ${report.power.headroomPercent}% headroom policy.`
    : "Power cannot be fully estimated because CPU or GPU power data is missing.";
  return `This ${resolution}${USE_CASE_LABELS[questionnaire.useCase]} build uses a ${priority} priority. It pairs ${gpuText} with ${cpuText} and ${ramText}. ${powerText} Compatibility comes from the shared rules engine; review the unknown checks before purchasing. The catalogue stores no prices, so the ${Math.round(budget.budget)} ${budget.currency === "UNIT" ? "budget units" : budget.currency} budget is a target allocation, not a quote.`;
}

export function overallLimitations(
  components: readonly Component[],
  report: CompatibilityReport,
  budget: BudgetSummary,
  questionnaire: RecommendationQuestionnaire,
): string[] {
  const limitations: string[] = [
    "Specification-based recommendation. The catalogue contains no prices; budget figures are target allocations, not quotes or market estimates.",
    "No benchmark database is included; no FPS, application performance or price-to-performance claims are made.",
    "The catalogue is a curated subset of the market, not a complete availability list.",
  ];
  if (questionnaire.currency === "UNIT") {
    limitations.push(
      "Budget units are generic. No currency conversion or regional pricing is applied.",
    );
  }
  if (
    components.some((component) => component.availability !== "in-production")
  ) {
    limitations.push(
      "One or more selected components are not recorded as in production; stock and regional availability are not verified.",
    );
  }
  const unknownFindings = report.results.filter(
    (result) => result.status === "unknown",
  );
  if (unknownFindings.length > 0) {
    limitations.push(
      `${unknownFindings.length} compatibility check(s) could not be verified from the available data.`,
    );
  }
  if (
    components.some(
      (component) =>
        component.category === "motherboard" &&
        component.specs.biosVersion === null,
    )
  ) {
    limitations.push(
      "BIOS/CPU support is not fully modelled; verify the motherboard CPU support list before purchase.",
    );
  }
  if (
    components.some(
      (component) =>
        component.category === "case" && component.specs.maxGpuSlots === null,
    )
  ) {
    limitations.push(
      "GPU slot-thickness clearance is not published for the selected case; check the card and case dimensions.",
    );
  }
  limitations.push(budget.note);
  return [...new Set(limitations)];
}

export function unmetPreferences(
  components: readonly Component[],
  questionnaire: RecommendationQuestionnaire,
): string[] {
  const unmet: string[] = [];
  const cpu = components.find((component) => component.category === "cpu");
  const gpu = components.find((component) => component.category === "gpu");
  const cooler = components.find(
    (component): component is CoolerComponent =>
      component.category === "cooler",
  );
  const pcCase = components.find(
    (component): component is CaseComponent => component.category === "case",
  );

  if (
    cpu &&
    questionnaire.cpuBrand !== "no-preference" &&
    cpu.manufacturer.toLowerCase() !== questionnaire.cpuBrand.toLowerCase()
  ) {
    unmet.push(
      `A ${questionnaire.cpuBrand} CPU was preferred, but the best compatible fit is ${cpu.manufacturer}.`,
    );
  }
  if (
    gpu &&
    questionnaire.gpuBrand !== "no-preference" &&
    gpu.manufacturer.toLowerCase() !== questionnaire.gpuBrand.toLowerCase()
  ) {
    unmet.push(
      `An ${questionnaire.gpuBrand} GPU was preferred, but the best compatible fit is ${gpu.manufacturer}.`,
    );
  }
  if (cooler && questionnaire.cooling !== "no-preference") {
    const wanted =
      questionnaire.cooling === "air" ? "air cooling" : "liquid cooling";
    const actual =
      cooler.specs.type === "air" ? "an air cooler" : "a liquid cooler";
    if (
      (questionnaire.cooling === "air" && cooler.specs.type !== "air") ||
      (questionnaire.cooling === "liquid" && cooler.specs.type !== "aio-liquid")
    ) {
      unmet.push(
        `${wanted} was preferred, but the best compatible option is ${actual}.`,
      );
    }
  }
  if (pcCase && questionnaire.buildSize === "compact") {
    if (
      pcCase.specs.caseType !== "sff" &&
      pcCase.specs.caseType !== "mini-tower"
    ) {
      unmet.push(
        `A compact case was preferred, but the best compatible option is a ${pcCase.specs.caseType}.`,
      );
    }
  }
  return unmet;
}

/** Human label for a component category, used in alternative controls. */
export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  cpu: "CPU",
  gpu: "Graphics card (GPU)",
  motherboard: "Motherboard",
  ram: "RAM",
  cooler: "CPU cooler",
  storage: "Storage",
  psu: "Power supply (PSU)",
  case: "PC case",
  "case-fan": "Case fans",
};

export function selectionSummary(selection: ComponentSelection): string {
  return `${selection.manufacturer} ${selection.name} — ${selection.rationale}`;
}
