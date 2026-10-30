/* Motherboard ↔ RAM rules: generation, form factor, capacity, slots, speed. */

import type { CompatibilityRule } from "./types";
import { makeResult } from "./types";

export const RULE_RAM_GENERATION = "ram-generation";
export const RULE_RAM_FORM_FACTOR = "ram-form-factor";
export const RULE_RAM_CAPACITY = "ram-capacity";
export const RULE_RAM_SLOT_COUNT = "ram-slot-count";
export const RULE_RAM_SPEED = "ram-speed";

export const ramRules: CompatibilityRule = (ctx) => {
  const { motherboard, ram } = ctx;
  if (!motherboard || ram.length === 0) return [];

  const results = [];
  const ramIds = ram.map((r) => r.id);
  const ids = [motherboard.id, ...ramIds];

  const totalCapacityGB = ram.reduce(
    (sum, kit) => sum + kit.specs.totalCapacityGB,
    0,
  );
  const totalModules = ram.reduce((sum, kit) => sum + kit.specs.moduleCount, 0);
  const generations = [...new Set(ram.map((kit) => kit.specs.generation))];
  const formFactors = [...new Set(ram.map((kit) => kit.specs.formFactor))];

  // Memory generation: mismatched generations are physically incompatible.
  if (generations.some((gen) => gen !== motherboard.specs.ramGeneration)) {
    results.push(
      makeResult(
        RULE_RAM_GENERATION,
        "incompatible",
        ids,
        `The motherboard supports ${motherboard.specs.ramGeneration} memory, but the selected kit(s) include ${generations.join(", ")}. Different memory generations are not interchangeable.`,
        {
          observed: {
            motherboardGeneration: motherboard.specs.ramGeneration,
            ramGeneration: generations.join(", "),
          },
          recommendation: `Select ${motherboard.specs.ramGeneration} memory for this motherboard.`,
        },
      ),
    );
  } else {
    results.push(
      makeResult(
        RULE_RAM_GENERATION,
        "compatible",
        ids,
        `Memory generation matches the motherboard (${motherboard.specs.ramGeneration}).`,
        { observed: { generation: motherboard.specs.ramGeneration } },
      ),
    );
  }

  // Module form factor: DIMM vs SO-DIMM.
  if (formFactors.some((ff) => ff !== motherboard.specs.ramFormFactor)) {
    results.push(
      makeResult(
        RULE_RAM_FORM_FACTOR,
        "incompatible",
        ids,
        `The motherboard takes ${motherboard.specs.ramFormFactor} modules, but the selection includes ${formFactors.join(", ")} modules, which will not fit.`,
        {
          observed: {
            motherboardFormFactor: motherboard.specs.ramFormFactor,
            ramFormFactor: formFactors.join(", "),
          },
          recommendation: `Select ${motherboard.specs.ramFormFactor} memory modules.`,
        },
      ),
    );
  } else {
    results.push(
      makeResult(
        RULE_RAM_FORM_FACTOR,
        "compatible",
        ids,
        `Memory module form factor matches the motherboard (${motherboard.specs.ramFormFactor}).`,
        { observed: { formFactor: motherboard.specs.ramFormFactor } },
      ),
    );
  }

  // Total capacity vs the published board maximum.
  const maxRamGB = motherboard.specs.maxRamGB;
  if (maxRamGB === null) {
    results.push(
      makeResult(
        RULE_RAM_CAPACITY,
        "unknown",
        ids,
        `The motherboard's maximum memory capacity is not documented in the available data, so the ${totalCapacityGB} GB selection cannot be verified.`,
        {
          observed: { selectedCapacityGB: totalCapacityGB },
          recommendation:
            "Check the motherboard specification for its maximum supported memory capacity.",
        },
      ),
    );
  } else if (totalCapacityGB > maxRamGB) {
    results.push(
      makeResult(
        RULE_RAM_CAPACITY,
        "incompatible",
        ids,
        `The selected ${totalCapacityGB} GB exceeds the motherboard's maximum supported capacity of ${maxRamGB} GB.`,
        {
          observed: {
            selectedCapacityGB: totalCapacityGB,
            maxCapacityGB: maxRamGB,
          },
          recommendation:
            "Reduce the total memory capacity or choose a motherboard that supports more memory.",
        },
      ),
    );
  } else {
    results.push(
      makeResult(
        RULE_RAM_CAPACITY,
        "compatible",
        ids,
        `Total memory capacity (${totalCapacityGB} GB) is within the motherboard's ${maxRamGB} GB maximum.`,
        {
          observed: {
            selectedCapacityGB: totalCapacityGB,
            maxCapacityGB: maxRamGB,
          },
        },
      ),
    );
  }

  // Module count vs physical slots.
  if (totalModules > motherboard.specs.ramSlots) {
    results.push(
      makeResult(
        RULE_RAM_SLOT_COUNT,
        "incompatible",
        ids,
        `The selection contains ${totalModules} memory modules, but the motherboard only has ${motherboard.specs.ramSlots} slots.`,
        {
          observed: {
            selectedModules: totalModules,
            slots: motherboard.specs.ramSlots,
          },
          recommendation: "Use fewer, higher-capacity modules.",
        },
      ),
    );
  } else {
    results.push(
      makeResult(
        RULE_RAM_SLOT_COUNT,
        "compatible",
        ids,
        `${totalModules} module(s) fit within the motherboard's ${motherboard.specs.ramSlots} slots.`,
        {
          observed: {
            selectedModules: totalModules,
            slots: motherboard.specs.ramSlots,
          },
        },
      ),
    );
  }

  // Rated speed vs the board's documented supported speeds. Exceeding the
  // maximum is not an incompatibility: memory simply runs at a lower speed.
  const supported = motherboard.specs.supportedRamSpeedsMTs;
  if (supported === null || supported.length === 0) {
    results.push(
      makeResult(
        RULE_RAM_SPEED,
        "unknown",
        ids,
        "The motherboard's supported memory speeds are not documented in the available data, so memory speed support cannot be verified.",
        {
          recommendation:
            "Check the motherboard specification or QVL for supported memory speeds.",
        },
      ),
    );
  } else {
    const maxSupported = Math.max(...supported);
    const tooFast = ram.filter((kit) => kit.specs.speedMTs > maxSupported);
    if (tooFast.length === 0) {
      results.push(
        makeResult(
          RULE_RAM_SPEED,
          "compatible",
          ids,
          `All selected memory kits run at or below the motherboard's maximum supported speed of ${maxSupported} MT/s.`,
          { observed: { maxSupportedSpeedMTs: maxSupported } },
        ),
      );
    } else {
      results.push(
        makeResult(
          RULE_RAM_SPEED,
          "warning",
          [motherboard.id, ...tooFast.map((kit) => kit.id)],
          `${tooFast.length} kit(s) are rated above the motherboard's maximum supported speed of ${maxSupported} MT/s and will run at a reduced speed unless the board supports higher overclocked speeds.`,
          {
            observed: { maxSupportedSpeedMTs: maxSupported },
            recommendation:
              "Confirm the motherboard supports the kit's rated speed via its memory QVL, or choose a kit at or below the supported speed.",
          },
        ),
      );
    }
  }

  return results;
};
