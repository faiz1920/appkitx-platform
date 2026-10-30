/*
 * Pure view-model helpers for the PC Builder UI (M10.2).
 *
 * Everything here is presentation data derived from M10.1 domain records:
 * labels, filtered lists, specification rows and data-gap notices. No DOM,
 * no compatibility logic — verdicts always come from evaluateBuild().
 */

import type { CompatibilityReport } from "./engine";
import type { CompatibilityStatus } from "./rules";
import type {
  Component,
  ComponentCategory,
  MemoryGeneration,
  MotherboardFormFactor,
  PsuFormFactor,
  StorageFormFactor,
} from "./types";

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

export const COMPATIBILITY_STATUS_LABELS: Record<CompatibilityStatus, string> =
  {
    compatible: "Compatible",
    warning: "Warning",
    incompatible: "Incompatible",
    unknown: "Unknown",
  };

/** Most severe first, for deterministic finding order in the UI. */
export const COMPATIBILITY_STATUS_RANK: Record<CompatibilityStatus, number> = {
  incompatible: 0,
  warning: 1,
  unknown: 2,
  compatible: 3,
};

export function componentDisplayName(component: Component): string {
  return `${component.manufacturer} ${component.name}`;
}

export interface ComponentFilter {
  /** Case-insensitive match against manufacturer, product name and model. */
  search?: string;
  /** Exact manufacturer match; null/undefined means all manufacturers. */
  manufacturer?: string | null;
}

export function filterComponents(
  components: readonly Component[],
  filter: ComponentFilter = {},
): Component[] {
  const query = (filter.search ?? "").trim().toLowerCase();
  const manufacturer = filter.manufacturer ?? null;

  return components.filter((component) => {
    if (manufacturer !== null && component.manufacturer !== manufacturer) {
      return false;
    }
    if (query === "") return true;
    const haystack = [component.manufacturer, component.name, component.model]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function manufacturerOptions(
  components: readonly Component[],
): string[] {
  return [
    ...new Set(components.map((component) => component.manufacturer)),
  ].sort((a, b) => a.localeCompare(b, "en"));
}

/** Stable catalogue-style order: manufacturer, then product name. */
export function sortComponents(components: readonly Component[]): Component[] {
  return [...components].sort(
    (a, b) =>
      a.manufacturer.localeCompare(b.manufacturer, "en") ||
      a.name.localeCompare(b.name, "en"),
  );
}

export function availabilityLabel(component: Component): string {
  switch (component.availability) {
    case "in-production":
      return "In production";
    case "discontinued":
      return "Discontinued";
    case "end-of-life":
      return "End of life";
    case "unverified":
      return "Unverified";
    case "unknown":
      return "Availability unknown";
  }
}

export function componentSourceLabel(component: Component): string {
  return `${component.source.name} · checked ${component.lastVerified}`;
}

const FORM_FACTOR_LABELS: Record<StorageFormFactor, string> = {
  m2: "M.2",
  "2.5-inch": '2.5"',
  "3.5-inch": '3.5"',
};

const MODULARITY_LABELS = {
  full: "Fully modular",
  semi: "Semi-modular",
  "non-modular": "Non-modular",
} as const;

const COOLER_TYPE_LABELS = {
  air: "Air cooler",
  "aio-liquid": "Liquid cooler (AIO)",
} as const;

export interface SpecLine {
  label: string;
  value: string;
}

function memoryLabel(generation: MemoryGeneration): string {
  return generation;
}

function mbLabel(formFactor: MotherboardFormFactor): string {
  return formFactor;
}

function psuFormLabel(formFactor: PsuFormFactor): string {
  return formFactor;
}

/** Known specification rows; unknown values are omitted (see gaps). */
export function specLines(component: Component): SpecLine[] {
  const lines: SpecLine[] = [];
  const add = (label: string, value: string | null) => {
    if (value !== null) lines.push({ label, value });
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
        "Base clock",
        s.baseClockGHz === null ? null : `${s.baseClockGHz} GHz`,
      );
      add(
        "Boost clock",
        s.boostClockGHz === null ? null : `${s.boostClockGHz} GHz`,
      );
      add("Base TDP", s.tdpW === null ? null : `${s.tdpW} W`);
      add("Memory", s.memoryTypes.map((type) => memoryLabel(type)).join(" / "));
      add("Max memory", s.maxMemoryGB === null ? null : `${s.maxMemoryGB} GB`);
      add(
        "Memory channels",
        s.memoryChannels === null ? null : `${s.memoryChannels}`,
      );
      add(
        "Memory speed",
        s.memorySpeedMTs === null ? null : `${s.memorySpeedMTs} MT/s`,
      );
      add("Max boost power", s.maxPowerW === null ? null : `${s.maxPowerW} W`);
      add("Integrated graphics", s.integratedGraphics ? "Yes" : "No");
      add(
        "PCIe",
        s.pcieGeneration === null ? null : `PCIe ${s.pcieGeneration}.0`,
      );
      add(
        "Cooler included",
        s.coolerIncluded === null ? null : s.coolerIncluded ? "Yes" : "No",
      );
      break;
    }
    case "gpu": {
      const s = component.specs;
      add("Chipset", s.chipset);
      add("Board partner", s.boardPartner);
      add("VRAM", s.vramGB === null ? null : `${s.vramGB} GB`);
      add("Memory type", s.memoryType);
      add(
        "PCIe interface",
        s.pcieGeneration === null || s.pcieLanes === null
          ? null
          : `PCIe ${s.pcieGeneration}.0 x${s.pcieLanes}`,
      );
      add("Length", s.lengthMm === null ? null : `${s.lengthMm} mm`);
      add("Power draw", s.powerDrawW === null ? null : `${s.powerDrawW} W`);
      add(
        "Recommended PSU",
        s.recommendedPsuW === null ? null : `${s.recommendedPsuW} W`,
      );
      add("Slot width", s.slotWidth === null ? null : `${s.slotWidth} slots`);
      add(
        "Power connectors",
        s.powerConnectors === null || s.powerConnectors.length === 0
          ? null
          : s.powerConnectors
              .map(
                (connector) =>
                  `${connector.count} × ${
                    connector.type === "pcie-8pin" ? "8-pin" : "16-pin"
                  }`,
              )
              .join(", "),
      );
      add(
        "Display outputs",
        s.displayOutputs === null ? null : s.displayOutputs.join(", "),
      );
      break;
    }
    case "motherboard": {
      const s = component.specs;
      add("Socket", s.socket);
      add("Chipset", s.chipset);
      add("Form factor", mbLabel(s.formFactor));
      add("Memory", `${s.ramGeneration} ${s.ramFormFactor}`);
      add("Memory slots", `${s.ramSlots}`);
      add("Max memory", s.maxRamGB === null ? null : `${s.maxRamGB} GB`);
      add(
        "Memory speed",
        s.supportedRamSpeedsMTs === null || s.supportedRamSpeedsMTs.length === 0
          ? null
          : `Up to ${Math.max(...s.supportedRamSpeedsMTs)} MT/s`,
      );
      add(
        "PCIe x16",
        s.pcieX16Slots === null
          ? null
          : s.pcieX16Slots.generation === null
            ? `${s.pcieX16Slots.count} slot(s)`
            : `${s.pcieX16Slots.count} × PCIe ${s.pcieX16Slots.generation}.0`,
      );
      add("M.2 slots", s.m2Slots === null ? null : `${s.m2Slots}`);
      add("SATA ports", s.sataPorts === null ? null : `${s.sataPorts}`);
      add("Fan headers", s.fanHeaders === null ? null : `${s.fanHeaders}`);
      add("CPU power", s.cpuPowerConnectors);
      break;
    }
    case "ram": {
      const s = component.specs;
      add("Type", `${s.generation}-${s.speedMTs}`);
      add("Modules", `${s.moduleCount} × ${s.moduleCapacityGB} GB`);
      add("Total capacity", `${s.totalCapacityGB} GB`);
      add("Timings", s.timings);
      add("Voltage", s.voltageV === null ? null : `${s.voltageV} V`);
      add("Profile", s.profile);
      add("Form factor", s.formFactor);
      add("ECC", s.ecc ? "Yes" : "No");
      add("Registered", s.registered ? "Registered" : "Unbuffered");
      break;
    }
    case "cooler": {
      const s = component.specs;
      add("Type", COOLER_TYPE_LABELS[s.type]);
      add("Height", s.heightMm === null ? null : `${s.heightMm} mm`);
      add(
        "Radiator",
        s.radiatorSizeMm === null ? null : `${s.radiatorSizeMm} mm`,
      );
      add(
        "Radiator thickness",
        s.radiatorThicknessMm === null ? null : `${s.radiatorThicknessMm} mm`,
      );
      add(
        "Fans",
        s.fanSizeMm === null || s.fanCount === null
          ? null
          : `${s.fanCount} × ${s.fanSizeMm} mm`,
      );
      add("Sockets", s.supportedSockets.join(", "));
      add(
        "Manufacturer TDP rating",
        s.tdpRatingW === null ? null : `${s.tdpRatingW} W`,
      );
      break;
    }
    case "storage": {
      const s = component.specs;
      add("Capacity", `${s.capacityGB} GB`);
      add(
        "Type",
        `${s.storageType === "ssd" ? "SSD" : "HDD"} · ${s.interface === "nvme" ? "NVMe" : "SATA"}`,
      );
      add(
        "Form factor",
        s.formFactor === "m2"
          ? `M.2${s.m2LengthMm === null ? "" : ` ${s.m2LengthMm}`}`
          : FORM_FACTOR_LABELS[s.formFactor],
      );
      add(
        "PCIe generation",
        s.pcieGeneration === null ? null : `PCIe ${s.pcieGeneration}.0`,
      );
      add("M.2 key", s.m2Key);
      add(
        "Sequential read",
        s.seqReadMBps === null ? null : `${s.seqReadMBps} MB/s`,
      );
      add(
        "Sequential write",
        s.seqWriteMBps === null ? null : `${s.seqWriteMBps} MB/s`,
      );
      add("Power", s.powerDrawW === null ? null : `${s.powerDrawW} W`);
      break;
    }
    case "psu": {
      const s = component.specs;
      add("Rated wattage", `${s.wattage} W`);
      add("Efficiency", s.efficiency);
      add("Modularity", MODULARITY_LABELS[s.modularity]);
      add("Form factor", psuFormLabel(s.formFactor));
      add("ATX version", s.atxVersion);
      add("Length", s.lengthMm === null ? null : `${s.lengthMm} mm`);
      add(
        "CPU/EPS 8-pin",
        s.connectors.eps8pin === null ? null : `${s.connectors.eps8pin}`,
      );
      add(
        "PCIe 8-pin",
        s.connectors.pcie8pin === null ? null : `${s.connectors.pcie8pin}`,
      );
      add(
        "16-pin (12VHPWR)",
        s.connectors.pcie16pin === null ? null : `${s.connectors.pcie16pin}`,
      );
      add(
        "SATA power",
        s.connectors.sata === null ? null : `${s.connectors.sata}`,
      );
      break;
    }
    case "case": {
      const s = component.specs;
      add("Case type", s.caseType);
      add("Motherboards", s.supportedFormFactors.join(", "));
      add(
        "Max GPU length",
        s.maxGpuLengthMm === null ? null : `${s.maxGpuLengthMm} mm`,
      );
      add(
        "Max cooler height",
        s.maxCoolerHeightMm === null ? null : `${s.maxCoolerHeightMm} mm`,
      );
      add("PSU support", s.psuFormFactors.join(", "));
      add(
        "Max PSU length",
        s.maxPsuLengthMm === null ? null : `${s.maxPsuLengthMm} mm`,
      );
      add(
        "Radiators",
        s.radiatorMounts !== null
          ? s.radiatorMounts
              .map((mount) => `${mount.sizeMm} mm ${mount.position}`)
              .join(", ")
          : s.radiatorSupportMm === null
            ? null
            : s.radiatorSupportMm.map((size) => `${size} mm`).join(", "),
      );
      add(
        "Fan mounts",
        s.fanMounts !== null
          ? s.fanMounts
              .map((mount) => `${mount.sizeMm} mm × ${mount.maxCount}`)
              .join(", ")
          : s.fanSizesMm === null
            ? null
            : s.fanSizesMm.map((size) => `${size} mm`).join(", "),
      );
      add(
        "Included fans",
        s.includedFans === null ? null : `${s.includedFans}`,
      );
      break;
    }
    case "case-fan": {
      const s = component.specs;
      add("Size", `${s.sizeMm} mm`);
      add("Thickness", s.thicknessMm === null ? null : `${s.thicknessMm} mm`);
      add("Connector", s.connector === "4-pin-pwm" ? "4-pin PWM" : "3-pin DC");
      add(
        "Speed range",
        s.rpmMax === null
          ? null
          : s.rpmMin === null
            ? `Up to ${s.rpmMax} rpm`
            : `${s.rpmMin}–${s.rpmMax} rpm`,
      );
      add("Airflow", s.airflowCFM === null ? null : `${s.airflowCFM} CFM`);
      add(
        "Static pressure",
        s.staticPressureMmH2O === null
          ? null
          : `${s.staticPressureMmH2O} mmH2O`,
      );
      add(
        "Airflow direction",
        s.airflowDirection === null
          ? null
          : s.airflowDirection === "standard"
            ? "Standard"
            : "Reverse blade",
      );
      break;
    }
  }

  return lines;
}

/** Human labels for attributes the catalogue records as unknown (null). */
export function missingSpecLabels(component: Component): string[] {
  const missing: string[] = [];
  const gap = (label: string, unknown: boolean) => {
    if (unknown) missing.push(label);
  };

  switch (component.category) {
    case "cpu": {
      const s = component.specs;
      gap("supported chipsets", s.supportedChipsets === null);
      gap("core count", s.cores === null);
      gap("thread count", s.threads === null);
      gap("base clock", s.baseClockGHz === null);
      gap("boost clock", s.boostClockGHz === null);
      gap("memory channels", s.memoryChannels === null);
      gap("memory speed", s.memorySpeedMTs === null);
      gap("maximum memory", s.maxMemoryGB === null);
      gap("base TDP", s.tdpW === null);
      gap("boost power", s.maxPowerW === null);
      gap("PCIe generation", s.pcieGeneration === null);
      break;
    }
    case "gpu": {
      const s = component.specs;
      gap("VRAM capacity", s.vramGB === null);
      gap("memory type", s.memoryType === null);
      gap("PCIe generation", s.pcieGeneration === null);
      gap("PCIe lanes", s.pcieLanes === null);
      gap("card length", s.lengthMm === null);
      gap("slot width", s.slotWidth === null);
      gap("power draw", s.powerDrawW === null);
      gap("recommended PSU", s.recommendedPsuW === null);
      gap("power connectors", s.powerConnectors === null);
      gap("display outputs", s.displayOutputs === null);
      break;
    }
    case "motherboard": {
      const s = component.specs;
      gap("maximum memory", s.maxRamGB === null);
      gap("memory speeds", s.supportedRamSpeedsMTs === null);
      gap("PCIe slot data", s.pcieX16Slots === null);
      gap("M.2 slots", s.m2Slots === null);
      gap("SATA ports", s.sataPorts === null);
      gap("fan headers", s.fanHeaders === null);
      gap("CPU power connectors", s.cpuPowerConnectors === null);
      gap("CPU support list", s.cpuSupportListUrl === null);
      gap("BIOS version", s.biosVersion === null);
      break;
    }
    case "ram": {
      const s = component.specs;
      gap("timings", s.timings === null);
      gap("voltage", s.voltageV === null);
      gap("overclocking profile", s.profile === null);
      break;
    }
    case "cooler": {
      const s = component.specs;
      gap("cooling capacity rating", s.tdpRatingW === null);
      gap("fan size", s.fanSizeMm === null);
      gap("fan count", s.fanCount === null);
      if (s.type === "air") gap("cooler height", s.heightMm === null);
      if (s.type === "aio-liquid") {
        gap("radiator size", s.radiatorSizeMm === null);
        gap("radiator thickness", s.radiatorThicknessMm === null);
      }
      break;
    }
    case "storage": {
      const s = component.specs;
      if (s.formFactor === "m2") {
        gap("M.2 key", s.m2Key === null);
        gap("M.2 length", s.m2LengthMm === null);
      }
      if (s.interface === "nvme") {
        gap("PCIe generation", s.pcieGeneration === null);
      }
      gap("sequential read", s.seqReadMBps === null);
      gap("sequential write", s.seqWriteMBps === null);
      gap("drive power", s.powerDrawW === null);
      break;
    }
    case "psu": {
      const s = component.specs;
      gap("EPS 8-pin count", s.connectors.eps8pin === null);
      gap("PCIe 8-pin count", s.connectors.pcie8pin === null);
      gap("16-pin count", s.connectors.pcie16pin === null);
      gap("SATA power count", s.connectors.sata === null);
      gap("ATX version", s.atxVersion === null);
      gap("PSU length", s.lengthMm === null);
      break;
    }
    case "case": {
      const s = component.specs;
      gap("max GPU length", s.maxGpuLengthMm === null);
      gap("max cooler height", s.maxCoolerHeightMm === null);
      gap("max PSU length", s.maxPsuLengthMm === null);
      gap("radiator support", s.radiatorSupportMm === null);
      gap("radiator positions", s.radiatorMounts === null);
      gap("GPU slot thickness", s.maxGpuSlots === null);
      gap("2.5-inch bays", s.driveBays25inch === null);
      gap("3.5-inch bays", s.driveBays35inch === null);
      gap("fan sizes", s.fanSizesMm === null);
      gap("fan positions", s.fanMounts === null);
      gap("included fans", s.includedFans === null);
      break;
    }
    case "case-fan": {
      const s = component.specs;
      gap("fan thickness", s.thicknessMm === null);
      gap("PWM support", s.pwm === null);
      gap("airflow direction", s.airflowDirection === null);
      gap("minimum speed", s.rpmMin === null);
      gap("maximum speed", s.rpmMax === null);
      gap("airflow rating", s.airflowCFM === null);
      gap("static pressure rating", s.staticPressureMmH2O === null);
      break;
    }
  }

  return missing;
}

export function sortedFindings(
  report: CompatibilityReport,
): CompatibilityReport["results"] {
  return [...report.results].sort(
    (a, b) =>
      COMPATIBILITY_STATUS_RANK[a.status] - COMPATIBILITY_STATUS_RANK[b.status],
  );
}

export function findingCountsText(report: CompatibilityReport): string {
  const { incompatible, warning, unknown, compatible } = report.summary.counts;
  return `${incompatible} incompatible, ${warning} warning(s), ${unknown} unknown, ${compatible} compatible check(s)`;
}

export function overallStatusLabel(
  report: CompatibilityReport,
  selectedComponentCount = 0,
): string {
  if (report.results.length === 0) {
    return selectedComponentCount === 0
      ? "No components selected"
      : "Not enough data";
  }
  return COMPATIBILITY_STATUS_LABELS[report.summary.status];
}

export function formatPower(watts: number | null): string {
  return watts === null ? "—" : `${watts} W`;
}

export const POWER_KIND_LABELS = {
  manufacturer: "Manufacturer figure",
  estimate: "Estimate",
} as const;

export function categoriesSelectedText(selectedCategories: number): string {
  return `${selectedCategories} of 9 categories selected`;
}

/** Count of categories with at least one selected component. */
export function countSelectedCategories(
  selected: Readonly<Record<ComponentCategory, readonly string[]>>,
): number {
  return (Object.values(selected) as readonly (readonly string[])[]).filter(
    (ids) => ids.length > 0,
  ).length;
}
