/* GPU rules: motherboard PCIe interface and case clearance. */

import type { CompatibilityRule } from "./types";
import { makeResult } from "./types";

export const RULE_GPU_PCIE = "gpu-motherboard-pcie";
export const RULE_GPU_CASE_LENGTH = "gpu-case-length";
export const RULE_GPU_CASE_SLOTS = "gpu-case-slot-width";

export const gpuMotherboardRule: CompatibilityRule = (ctx) => {
  const { gpu, motherboard } = ctx;
  if (!gpu || !motherboard) return [];

  const ids = [gpu.id, motherboard.id];
  const slots = motherboard.specs.pcieX16Slots;

  if (slots === null) {
    return [
      makeResult(
        RULE_GPU_PCIE,
        "unknown",
        ids,
        "The motherboard's PCIe x16 slot data is not available, so the GPU interface cannot be verified.",
        {
          recommendation:
            "Check the motherboard specification for a full-length PCIe x16 slot.",
        },
      ),
    ];
  }

  if (slots.count < 1) {
    return [
      makeResult(
        RULE_GPU_PCIE,
        "incompatible",
        ids,
        "The motherboard has no full-length PCIe x16 slot for a dedicated graphics card.",
        {
          recommendation:
            "Choose a motherboard with a PCIe x16 slot, or rely on integrated graphics.",
        },
      ),
    ];
  }

  const gpuGen = gpu.specs.pcieGeneration;
  const slotGen = slots.generation;

  if (gpuGen === null || slotGen === null) {
    return [
      makeResult(
        RULE_GPU_PCIE,
        "unknown",
        ids,
        "PCIe generation data is incomplete. PCIe is backward compatible, but the link generation cannot be confirmed from available data.",
        {
          observed: { gpuPcieGeneration: gpuGen, slotPcieGeneration: slotGen },
        },
      ),
    ];
  }

  if (slotGen >= gpuGen) {
    return [
      makeResult(
        RULE_GPU_PCIE,
        "compatible",
        ids,
        `The motherboard's PCIe ${slotGen}.0 x16 slot fully supports this PCIe ${gpuGen}.0 graphics card.`,
        {
          observed: { gpuPcieGeneration: gpuGen, slotPcieGeneration: slotGen },
        },
      ),
    ];
  }

  // PCIe is backward compatible: a newer card in an older slot works.
  return [
    makeResult(
      RULE_GPU_PCIE,
      "warning",
      ids,
      `This PCIe ${gpuGen}.0 graphics card works in the motherboard's PCIe ${slotGen}.0 x16 slot (PCIe is backward compatible), but the link will run at PCIe ${slotGen}.0 bandwidth.`,
      {
        observed: { gpuPcieGeneration: gpuGen, slotPcieGeneration: slotGen },
        recommendation:
          "No action required; expect a small bandwidth reduction in PCIe-bandwidth-sensitive workloads.",
      },
    ),
  ];
};

export const gpuCaseRule: CompatibilityRule = (ctx) => {
  const { gpu, pcCase } = ctx;
  if (!gpu || !pcCase) return [];

  const ids = [gpu.id, pcCase.id];
  const gpuLength = gpu.specs.lengthMm;
  const maxLength = pcCase.specs.maxGpuLengthMm;

  if (gpuLength === null || maxLength === null) {
    return [
      makeResult(
        RULE_GPU_CASE_LENGTH,
        "unknown",
        ids,
        `GPU clearance cannot be verified: ${gpuLength === null ? "the graphics card length" : "the case's maximum GPU length"} is not documented in the available data.`,
        {
          observed: { gpuLengthMm: gpuLength, caseMaxGpuLengthMm: maxLength },
          recommendation:
            "Compare the graphics card length against the case's maximum GPU clearance before purchasing.",
        },
      ),
    ];
  }

  if (gpuLength > maxLength) {
    return [
      makeResult(
        RULE_GPU_CASE_LENGTH,
        "incompatible",
        ids,
        `The ${gpuLength} mm graphics card is longer than the case's maximum GPU clearance of ${maxLength} mm and will not fit.`,
        {
          observed: { gpuLengthMm: gpuLength, caseMaxGpuLengthMm: maxLength },
          recommendation:
            "Choose a shorter graphics card or a case with more GPU clearance.",
        },
      ),
    ];
  }

  return [
    makeResult(
      RULE_GPU_CASE_LENGTH,
      "compatible",
      ids,
      `The ${gpuLength} mm graphics card fits within the case's ${maxLength} mm GPU clearance.`,
      {
        observed: { gpuLengthMm: gpuLength, caseMaxGpuLengthMm: maxLength },
      },
    ),
  ];
};

export const gpuCaseSlotRule: CompatibilityRule = (ctx) => {
  const { gpu, pcCase } = ctx;
  if (!gpu || !pcCase) return [];

  const ids = [gpu.id, pcCase.id];
  const slotWidth = gpu.specs.slotWidth;
  const maxSlots = pcCase.specs.maxGpuSlots;

  if (slotWidth === null || maxSlots === null) {
    return [
      makeResult(
        RULE_GPU_CASE_SLOTS,
        "unknown",
        ids,
        `GPU slot-thickness clearance cannot be verified: ${slotWidth === null ? "the graphics card's slot width" : "the case's maximum GPU slot thickness"} is not documented in the available data.`,
        {
          observed: { gpuSlotWidth: slotWidth, caseMaxGpuSlots: maxSlots },
          recommendation:
            "Check the card's slot thickness and the case's expansion-slot clearance before purchasing.",
        },
      ),
    ];
  }

  if (slotWidth > maxSlots) {
    return [
      makeResult(
        RULE_GPU_CASE_SLOTS,
        "incompatible",
        ids,
        `The ${slotWidth}-slot graphics card exceeds the case's documented ${maxSlots}-slot GPU allowance.`,
        {
          observed: { gpuSlotWidth: slotWidth, caseMaxGpuSlots: maxSlots },
          recommendation:
            "Choose a thinner graphics card or a case that documents a larger GPU slot allowance.",
        },
      ),
    ];
  }

  return [
    makeResult(
      RULE_GPU_CASE_SLOTS,
      "compatible",
      ids,
      `The ${slotWidth}-slot graphics card fits the case's ${maxSlots}-slot GPU allowance.`,
      {
        observed: { gpuSlotWidth: slotWidth, caseMaxGpuSlots: maxSlots },
      },
    ),
  ];
};
