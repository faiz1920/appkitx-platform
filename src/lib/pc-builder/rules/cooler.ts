/* CPU cooler rules: CPU socket mounting, thermal capacity, case fit. */

import type { CompatibilityRule } from "./types";
import { makeResult } from "./types";

export const RULE_COOLER_SOCKET = "cooler-cpu-socket";
export const RULE_COOLER_CAPACITY = "cooler-cpu-capacity";
export const RULE_COOLER_CASE_HEIGHT = "cooler-case-height";
export const RULE_COOLER_CASE_RADIATOR = "cooler-case-radiator";

export const coolerCpuRules: CompatibilityRule = (ctx) => {
  const { cooler, cpu } = ctx;
  if (!cooler || !cpu) return [];

  const ids = [cooler.id, cpu.id];
  const results = [];

  // Mounting compatibility: mechanical fit on the CPU socket.
  if (cooler.specs.supportedSockets.includes(cpu.specs.socket)) {
    results.push(
      makeResult(
        RULE_COOLER_SOCKET,
        "compatible",
        ids,
        `The cooler includes mounting hardware for socket ${cpu.specs.socket}.`,
        { observed: { socket: cpu.specs.socket } },
      ),
    );
  } else {
    results.push(
      makeResult(
        RULE_COOLER_SOCKET,
        "incompatible",
        ids,
        `The cooler does not list mounting support for socket ${cpu.specs.socket} (supported: ${cooler.specs.supportedSockets.join(", ")}).`,
        {
          observed: {
            socket: cpu.specs.socket,
            supportedSockets: cooler.specs.supportedSockets.join(", "),
          },
          recommendation:
            "Choose a cooler that supports this CPU socket, or check for a manufacturer mounting-kit upgrade.",
        },
      ),
    );
  }

  // Thermal capacity suitability — deliberately separate from mounting.
  const rating = cooler.specs.tdpRatingW;
  const cpuPower = cpu.specs.maxPowerW ?? cpu.specs.tdpW;
  if (rating === null || cpuPower === null) {
    results.push(
      makeResult(
        RULE_COOLER_CAPACITY,
        "unknown",
        ids,
        "Cooling capacity cannot be assessed from available data. Mounting support does not guarantee adequate cooling.",
        {
          observed: { coolerTdpRatingW: rating, cpuPowerW: cpuPower },
          recommendation:
            "Check independent reviews or the cooler manufacturer's guidance for this CPU's heat output.",
        },
      ),
    );
  } else if (rating >= cpuPower) {
    results.push(
      makeResult(
        RULE_COOLER_CAPACITY,
        "compatible",
        ids,
        `The cooler's ${rating} W rating meets or exceeds the CPU's ${cpuPower} W power level.`,
        { observed: { coolerTdpRatingW: rating, cpuPowerW: cpuPower } },
      ),
    );
  } else {
    results.push(
      makeResult(
        RULE_COOLER_CAPACITY,
        "warning",
        ids,
        `The cooler's ${rating} W rating is below the CPU's ${cpuPower} W power level; the CPU may run hot or throttle under sustained load.`,
        {
          observed: { coolerTdpRatingW: rating, cpuPowerW: cpuPower },
          recommendation:
            "Consider a higher-capacity cooler for sustained workloads.",
        },
      ),
    );
  }

  return results;
};

export const coolerCaseRules: CompatibilityRule = (ctx) => {
  const { cooler, pcCase } = ctx;
  if (!cooler || !pcCase) return [];

  const ids = [cooler.id, pcCase.id];

  if (cooler.specs.type === "air") {
    const height = cooler.specs.heightMm;
    const maxHeight = pcCase.specs.maxCoolerHeightMm;
    if (height === null || maxHeight === null) {
      return [
        makeResult(
          RULE_COOLER_CASE_HEIGHT,
          "unknown",
          ids,
          `Cooler clearance cannot be verified: ${height === null ? "the cooler height" : "the case's maximum cooler height"} is not documented in the available data.`,
          {
            observed: {
              coolerHeightMm: height,
              caseMaxCoolerHeightMm: maxHeight,
            },
            recommendation:
              "Compare the cooler height against the case's CPU cooler clearance before purchasing.",
          },
        ),
      ];
    }
    if (height > maxHeight) {
      return [
        makeResult(
          RULE_COOLER_CASE_HEIGHT,
          "incompatible",
          ids,
          `The ${height} mm cooler is taller than the case's ${maxHeight} mm CPU cooler clearance and the side panel will not close.`,
          {
            observed: {
              coolerHeightMm: height,
              caseMaxCoolerHeightMm: maxHeight,
            },
            recommendation:
              "Choose a lower-profile cooler or a case with more cooler clearance.",
          },
        ),
      ];
    }
    return [
      makeResult(
        RULE_COOLER_CASE_HEIGHT,
        "compatible",
        ids,
        `The ${height} mm cooler fits within the case's ${maxHeight} mm cooler clearance.`,
        {
          observed: {
            coolerHeightMm: height,
            caseMaxCoolerHeightMm: maxHeight,
          },
        },
      ),
    ];
  }

  // AIO liquid cooler: radiator mounting support.
  const radiator = cooler.specs.radiatorSizeMm;
  const support = pcCase.specs.radiatorSupportMm;
  if (radiator === null || support === null || support.length === 0) {
    return [
      makeResult(
        RULE_COOLER_CASE_RADIATOR,
        "unknown",
        ids,
        `Radiator mounting cannot be verified: ${radiator === null ? "the radiator size" : "the case's radiator support"} is not documented in the available data.`,
        {
          observed: { radiatorSizeMm: radiator },
          recommendation:
            "Check the case specification for supported radiator sizes before purchasing.",
        },
      ),
    ];
  }
  if (!support.includes(radiator)) {
    return [
      makeResult(
        RULE_COOLER_CASE_RADIATOR,
        "incompatible",
        ids,
        `The case does not list a mounting position for a ${radiator} mm radiator (supported: ${support.join(", ")} mm).`,
        {
          observed: {
            radiatorSizeMm: radiator,
            supportedRadiatorsMm: support.join(", "),
          },
          recommendation:
            "Choose a cooler with a supported radiator size, or a case that fits this radiator.",
        },
      ),
    ];
  }
  return [
    makeResult(
      RULE_COOLER_CASE_RADIATOR,
      "compatible",
      ids,
      `The case supports the cooler's ${radiator} mm radiator.`,
      { observed: { radiatorSizeMm: radiator } },
    ),
  ];
};
