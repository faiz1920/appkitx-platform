/*
 * Power estimation for a PC build (M10.1).
 *
 * Methodology:
 * - CPU and GPU draw use manufacturer-published package power when known
 *   (CPU: max boost power when published, else base TDP; GPU: TGP/TBP).
 *   These are labelled "manufacturer".
 * - All other loads (motherboard, memory, storage, fans, AIO pump) are
 *   generic estimates labelled "estimate". They are deliberately rough and
 *   must never be presented as manufacturer-certified requirements.
 * - A configurable headroom policy (default 20%) converts the estimated
 *   load into a recommended PSU wattage.
 * - When neither CPU nor GPU power is known the estimate is insufficient:
 *   loadWatts / recommendedPsuW are null and callers must surface Unknown.
 */

import type { Component } from "./types";

/** Generic estimate constants (watts). Documented as estimates, not specs. */
export const POWER_ESTIMATES = {
  motherboardW: 50,
  ramPerModuleW: 4,
  storageNvmeW: 8,
  storageSataSsdW: 4,
  storageHddW: 9,
  caseFanW: 3,
  aioPumpW: 5,
} as const;

export const DEFAULT_HEADROOM_PERCENT = 20;

export interface PowerBreakdownItem {
  /** Component id, or null for system-level estimates. */
  componentId: string | null;
  label: string;
  watts: number;
  kind: "manufacturer" | "estimate";
}

export interface PowerEstimate {
  /** False when too little known power data exists to produce a number. */
  sufficientData: boolean;
  /** Estimated total load in watts, or null when insufficient. */
  loadWatts: number | null;
  /** Load + headroom, rounded up to whole watts; null when insufficient. */
  recommendedPsuW: number | null;
  headroomPercent: number;
  breakdown: PowerBreakdownItem[];
  /** Plain-language assumptions, suitable for user-facing explanation. */
  assumptions: string[];
}

export interface PowerOptions {
  /** Extra capacity margin applied to the load estimate (default 20). */
  headroomPercent?: number;
}

export function estimateBuildPower(
  components: readonly Component[],
  options: PowerOptions = {},
): PowerEstimate {
  const headroomPercent = options.headroomPercent ?? DEFAULT_HEADROOM_PERCENT;
  const breakdown: PowerBreakdownItem[] = [];
  const assumptions: string[] = [];

  let knownCoreWatts = 0;
  let sawKnownCore = false;
  let sawUnknownCore = false;

  for (const component of components) {
    switch (component.category) {
      case "cpu": {
        const watts = component.specs.maxPowerW ?? component.specs.tdpW;
        if (watts === null) {
          sawUnknownCore = true;
          assumptions.push(
            `${component.manufacturer} ${component.name}: CPU package power is unknown and was excluded from the estimate.`,
          );
        } else {
          sawKnownCore = true;
          knownCoreWatts += watts;
          const basis =
            component.specs.maxPowerW !== null
              ? "maximum boost power"
              : "base TDP";
          breakdown.push({
            componentId: component.id,
            label: `CPU (${basis})`,
            watts,
            kind: "manufacturer",
          });
        }
        break;
      }
      case "gpu": {
        const watts = component.specs.powerDrawW;
        if (watts === null) {
          sawUnknownCore = true;
          assumptions.push(
            `${component.manufacturer} ${component.name}: GPU power draw is unknown and was excluded from the estimate.`,
          );
        } else {
          sawKnownCore = true;
          knownCoreWatts += watts;
          breakdown.push({
            componentId: component.id,
            label: "GPU (board power)",
            watts,
            kind: "manufacturer",
          });
        }
        break;
      }
      case "motherboard": {
        breakdown.push({
          componentId: component.id,
          label: "Motherboard (estimate)",
          watts: POWER_ESTIMATES.motherboardW,
          kind: "estimate",
        });
        break;
      }
      case "ram": {
        const watts =
          component.specs.moduleCount * POWER_ESTIMATES.ramPerModuleW;
        breakdown.push({
          componentId: component.id,
          label: `Memory (${component.specs.moduleCount} modules, estimate)`,
          watts,
          kind: "estimate",
        });
        break;
      }
      case "storage": {
        const watts =
          component.specs.interface === "nvme"
            ? POWER_ESTIMATES.storageNvmeW
            : component.specs.storageType === "hdd"
              ? POWER_ESTIMATES.storageHddW
              : POWER_ESTIMATES.storageSataSsdW;
        breakdown.push({
          componentId: component.id,
          label: "Storage (estimate)",
          watts,
          kind: "estimate",
        });
        break;
      }
      case "case-fan": {
        breakdown.push({
          componentId: component.id,
          label: "Case fan (estimate)",
          watts: POWER_ESTIMATES.caseFanW,
          kind: "estimate",
        });
        break;
      }
      case "cooler": {
        if (component.specs.type === "aio-liquid") {
          breakdown.push({
            componentId: component.id,
            label: "AIO pump (estimate)",
            watts: POWER_ESTIMATES.aioPumpW,
            kind: "estimate",
          });
        }
        break;
      }
      case "psu":
      case "case":
        break;
    }
  }

  const sufficientData = sawKnownCore && !sawUnknownCore;
  if (!sufficientData) {
    if (!sawKnownCore) {
      assumptions.push(
        "No manufacturer power data is available for the CPU or GPU, so a system power estimate cannot be produced.",
      );
    }
    return {
      sufficientData,
      loadWatts: null,
      recommendedPsuW: null,
      headroomPercent,
      breakdown,
      assumptions,
    };
  }

  const estimateWatts = breakdown
    .filter((item) => item.kind === "estimate")
    .reduce((sum, item) => sum + item.watts, 0);
  const loadWatts = knownCoreWatts + estimateWatts;
  const recommendedPsuW = Math.ceil(loadWatts * (1 + headroomPercent / 100));

  assumptions.push(
    `Motherboard, memory, storage, cooling and fan loads are generic estimates totalling ${estimateWatts} W; actual draw varies by hardware and workload.`,
  );
  assumptions.push(
    `Recommended PSU wattage applies a ${headroomPercent}% headroom policy to the estimated load for transient spikes, efficiency and future upgrades.`,
  );

  return {
    sufficientData,
    loadWatts,
    recommendedPsuW,
    headroomPercent,
    breakdown,
    assumptions,
  };
}
