/* CPU ↔ motherboard rules: socket, chipset, BIOS. */

import type { CompatibilityRule } from "./types";
import { makeResult } from "./types";

export const RULE_CPU_SOCKET = "cpu-motherboard-socket";
export const RULE_CPU_CHIPSET = "cpu-motherboard-chipset";
export const RULE_CPU_BIOS = "cpu-motherboard-bios";

export const cpuMotherboardRules: CompatibilityRule = (ctx) => {
  const { cpu, motherboard } = ctx;
  if (!cpu || !motherboard) return [];

  const ids = [cpu.id, motherboard.id];

  if (cpu.specs.socket !== motherboard.specs.socket) {
    // Socket mismatch is provably incompatible; chipset and BIOS rules
    // are not meaningful in that case.
    return [
      makeResult(
        RULE_CPU_SOCKET,
        "incompatible",
        ids,
        `${cpu.manufacturer} ${cpu.name} uses socket ${cpu.specs.socket}, but the ${motherboard.manufacturer} ${motherboard.name} motherboard has socket ${motherboard.specs.socket}. The CPU cannot be installed.`,
        {
          observed: {
            cpuSocket: cpu.specs.socket,
            motherboardSocket: motherboard.specs.socket,
          },
          recommendation:
            "Choose a motherboard with the matching CPU socket, or a CPU that fits this motherboard.",
        },
      ),
    ];
  }

  const results = [
    makeResult(
      RULE_CPU_SOCKET,
      "compatible",
      ids,
      `CPU and motherboard share socket ${cpu.specs.socket}.`,
      {
        observed: { socket: cpu.specs.socket },
      },
    ),
  ];

  // Chipset: only verdict when the CPU publishes a chipset support list.
  const chipsets = cpu.specs.supportedChipsets;
  if (chipsets === null || chipsets.length === 0) {
    results.push(
      makeResult(
        RULE_CPU_CHIPSET,
        "unknown",
        ids,
        `Chipset compatibility between ${cpu.name} and the ${motherboard.specs.chipset} chipset could not be verified from available data.`,
        {
          observed: { chipset: motherboard.specs.chipset },
          recommendation:
            "Check the CPU manufacturer's supported-chipset list for this processor.",
        },
      ),
    );
  } else if (chipsets.includes(motherboard.specs.chipset)) {
    results.push(
      makeResult(
        RULE_CPU_CHIPSET,
        "compatible",
        ids,
        `The ${motherboard.specs.chipset} chipset is listed as supported by the CPU manufacturer.`,
        { observed: { chipset: motherboard.specs.chipset } },
      ),
    );
  } else {
    results.push(
      makeResult(
        RULE_CPU_CHIPSET,
        "incompatible",
        ids,
        `The ${motherboard.specs.chipset} chipset is not in the CPU manufacturer's supported chipset list (${chipsets.join(", ")}).`,
        {
          observed: {
            chipset: motherboard.specs.chipset,
            supportedChipsets: chipsets.join(", "),
          },
          recommendation: "Choose a motherboard with a supported chipset.",
        },
      ),
    );
  }

  /*
   * BIOS: socket compatibility does not prove that the installed firmware
   * recognises the CPU. Per-board BIOS revision evidence is not reliable in
   * the catalogue yet, so this stays unknown and points at the published
   * support list when the motherboard documents one.
   */
  const supportList = motherboard.specs.cpuSupportListUrl;
  const biosVersion = motherboard.specs.biosVersion;
  results.push(
    makeResult(
      RULE_CPU_BIOS,
      "unknown",
      ids,
      `BIOS compatibility between ${cpu.name} and ${motherboard.name} could not be verified from available data. Boards manufactured before this CPU launched may need a BIOS update.`,
      {
        observed: {
          biosVersion,
          cpuSupportListUrl: supportList,
        },
        recommendation: supportList
          ? `Check the motherboard manufacturer's CPU support list for the minimum BIOS version before purchasing: ${supportList}`
          : "Check the motherboard manufacturer's CPU support list for the minimum BIOS version before purchasing.",
      },
    ),
  );

  return results;
};
