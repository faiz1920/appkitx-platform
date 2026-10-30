/* PSU rules: wattage suitability, GPU power connectors, case form factor. */

import type { CompatibilityRule } from "./types";
import { makeResult } from "./types";

export const RULE_PSU_WATTAGE = "psu-wattage";
export const RULE_PSU_GPU_CONNECTORS = "psu-gpu-connectors";
export const RULE_PSU_CASE_FORM_FACTOR = "psu-case-form-factor";

/** Minimum spare capacity (watts) below which a fitting PSU is a warning. */
export const PSU_TIGHT_MARGIN_W = 50;

export const psuWattageRule: CompatibilityRule = (ctx) => {
  const { psu, gpu, power } = ctx;
  if (!psu) return [];

  const wattage = psu.specs.wattage;

  if (
    !power.sufficientData ||
    power.loadWatts === null ||
    power.recommendedPsuW === null
  ) {
    return [
      makeResult(
        RULE_PSU_WATTAGE,
        "unknown",
        [psu.id],
        "System power requirements cannot be estimated because CPU/GPU power data is missing or incomplete, so PSU wattage suitability cannot be verified.",
        {
          observed: { psuWattageW: wattage },
          recommendation:
            "Add the CPU and GPU power specifications, or use the GPU manufacturer's PSU recommendation as a minimum.",
        },
      ),
    ];
  }

  const load = power.loadWatts;
  const recommended = power.recommendedPsuW;
  const observed = {
    estimatedLoadW: load,
    recommendedPsuW: recommended,
    psuWattageW: wattage,
    headroomPercent: power.headroomPercent,
  };

  if (wattage < load) {
    return [
      makeResult(
        RULE_PSU_WATTAGE,
        "incompatible",
        [psu.id],
        `The ${wattage} W power supply is below the estimated system load of ${load} W and cannot reliably power this build. The estimate is not a manufacturer-certified requirement.`,
        {
          observed,
          recommendation: `Choose a PSU of at least ${recommended} W (estimate plus ${power.headroomPercent}% headroom).`,
        },
      ),
    ];
  }

  const gpuRecommendation = gpu?.specs.recommendedPsuW ?? null;

  if (
    wattage < recommended ||
    (gpuRecommendation !== null && wattage < gpuRecommendation)
  ) {
    const reasons = [];
    if (wattage < recommended) {
      reasons.push(
        `it is below the recommended ${recommended} W (estimated load ${load} W plus ${power.headroomPercent}% headroom)`,
      );
    }
    if (gpuRecommendation !== null && wattage < gpuRecommendation) {
      reasons.push(
        `the GPU manufacturer recommends at least ${gpuRecommendation} W`,
      );
    }
    return [
      makeResult(
        RULE_PSU_WATTAGE,
        "warning",
        gpuRecommendation !== null && gpu ? [psu.id, gpu.id] : [psu.id],
        `The ${wattage} W power supply covers the estimated ${load} W load, but ${reasons.join(" and ")}. The estimate is not a manufacturer-certified requirement.`,
        {
          observed: { ...observed, gpuRecommendedPsuW: gpuRecommendation },
          recommendation:
            "Consider a higher-wattage PSU for transient spikes, efficiency and future upgrades.",
        },
      ),
    ];
  }

  return [
    makeResult(
      RULE_PSU_WATTAGE,
      "compatible",
      [psu.id],
      `The ${wattage} W power supply meets the estimated ${load} W system load with at least ${power.headroomPercent}% headroom. The estimate is not a manufacturer-certified requirement.`,
      { observed },
    ),
  ];
};

export const psuGpuConnectorsRule: CompatibilityRule = (ctx) => {
  const { psu, gpu } = ctx;
  if (!psu || !gpu) return [];

  const ids = [psu.id, gpu.id];
  const required = gpu.specs.powerConnectors;

  if (required === null || required.length === 0) {
    return [
      makeResult(
        RULE_PSU_GPU_CONNECTORS,
        "unknown",
        ids,
        "The graphics card's power connector requirements are not documented in the available data, so PSU connector sufficiency cannot be verified.",
        {
          recommendation:
            "Check the graphics card's required power connectors before purchasing.",
        },
      ),
    ];
  }

  const need8pin = required
    .filter((c) => c.type === "pcie-8pin")
    .reduce((sum, c) => sum + c.count, 0);
  const need16pin = required
    .filter((c) => c.type === "12vhpwr-16pin")
    .reduce((sum, c) => sum + c.count, 0);

  const have8pin = psu.specs.connectors.pcie8pin;
  const have16pin = psu.specs.connectors.pcie16pin;

  if (
    (need8pin > 0 && have8pin === null) ||
    (need16pin > 0 && have16pin === null && have8pin === null)
  ) {
    return [
      makeResult(
        RULE_PSU_GPU_CONNECTORS,
        "unknown",
        ids,
        "The power supply's PCIe connector inventory is not documented in the available data, so GPU power connector sufficiency cannot be verified.",
        {
          observed: {
            requiredPcie8pin: need8pin,
            required16pin: need16pin,
          },
          recommendation:
            "Check the PSU's connector list against the graphics card's requirements.",
        },
      ),
    ];
  }

  const available8 = have8pin ?? 0;
  const available16 = have16pin ?? 0;

  if (need8pin > available8) {
    return [
      makeResult(
        RULE_PSU_GPU_CONNECTORS,
        "incompatible",
        ids,
        `The graphics card requires ${need8pin} PCIe 8-pin connector(s), but the power supply provides ${available8}.`,
        {
          observed: {
            requiredPcie8pin: need8pin,
            availablePcie8pin: available8,
          },
          recommendation:
            "Choose a PSU with enough native PCIe 8-pin connectors; avoid splitter adapters on high-power cards.",
        },
      ),
    ];
  }

  if (need16pin > 0) {
    if (available16 >= need16pin) {
      return [
        makeResult(
          RULE_PSU_GPU_CONNECTORS,
          "compatible",
          ids,
          "The power supply provides the native 16-pin connector required by the graphics card.",
          {
            observed: { required16pin: need16pin, available16pin: available16 },
          },
        ),
      ];
    }
    // Adapter path: 16-pin cards ship with adapters that need multiple 8-pins.
    const adapterPins = need16pin * 2;
    if (available8 >= adapterPins) {
      return [
        makeResult(
          RULE_PSU_GPU_CONNECTORS,
          "warning",
          ids,
          `The graphics card uses a 16-pin connector and the PSU has no native 16-pin output; it can only be powered via the manufacturer's adapter using ${adapterPins} PCIe 8-pin connectors.`,
          {
            observed: {
              required16pin: need16pin,
              available16pin: available16,
              availablePcie8pin: available8,
            },
            recommendation:
              "Prefer a PSU with a native 12VHPWR/12V-2x6 connector; adapters must be fully seated to avoid damage.",
          },
        ),
      ];
    }
    return [
      makeResult(
        RULE_PSU_GPU_CONNECTORS,
        "incompatible",
        ids,
        `The graphics card requires a 16-pin power connector; the PSU has no native 16-pin output and only ${available8} PCIe 8-pin connector(s), which is not enough for the adapter.`,
        {
          observed: {
            required16pin: need16pin,
            available16pin: available16,
            availablePcie8pin: available8,
          },
          recommendation:
            "Choose a PSU with a native 16-pin connector or more PCIe 8-pin connectors.",
        },
      ),
    ];
  }

  return [
    makeResult(
      RULE_PSU_GPU_CONNECTORS,
      "compatible",
      ids,
      `The power supply provides the ${need8pin} PCIe 8-pin connector(s) required by the graphics card.`,
      {
        observed: { requiredPcie8pin: need8pin, availablePcie8pin: available8 },
      },
    ),
  ];
};

export const psuCaseRule: CompatibilityRule = (ctx) => {
  const { psu, pcCase } = ctx;
  if (!psu || !pcCase) return [];

  const ids = [psu.id, pcCase.id];
  const supported = pcCase.specs.psuFormFactors;

  if (supported.length === 0) {
    return [
      makeResult(
        RULE_PSU_CASE_FORM_FACTOR,
        "unknown",
        ids,
        "The case's supported PSU form factors are not documented in the available data.",
        {
          recommendation:
            "Check the case specification for supported PSU form factors.",
        },
      ),
    ];
  }

  if (!supported.includes(psu.specs.formFactor)) {
    return [
      makeResult(
        RULE_PSU_CASE_FORM_FACTOR,
        "incompatible",
        ids,
        `The case accepts ${supported.join("/")} power supplies, but the selected PSU is ${psu.specs.formFactor}.`,
        {
          observed: {
            psuFormFactor: psu.specs.formFactor,
            caseSupports: supported.join(", "),
          },
          recommendation: "Choose a PSU in a form factor the case supports.",
        },
      ),
    ];
  }

  return [
    makeResult(
      RULE_PSU_CASE_FORM_FACTOR,
      "compatible",
      ids,
      `The case supports ${psu.specs.formFactor} power supplies.`,
      { observed: { psuFormFactor: psu.specs.formFactor } },
    ),
  ];
};
