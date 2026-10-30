/* Storage ↔ motherboard rules: M.2 slots and SATA port availability. */

import type { CompatibilityRule } from "./types";
import { makeResult } from "./types";

export const RULE_STORAGE_M2 = "storage-motherboard-m2";
export const RULE_STORAGE_SATA = "storage-motherboard-sata";

export const storageRules: CompatibilityRule = (ctx) => {
  const { motherboard, storage } = ctx;
  if (!motherboard || storage.length === 0) return [];

  const results = [];

  const m2Devices = storage.filter((d) => d.specs.formFactor === "m2");
  const sataDevices = storage.filter((d) => d.specs.interface === "sata");

  if (m2Devices.length > 0) {
    const ids = [motherboard.id, ...m2Devices.map((d) => d.id)];
    const slots = motherboard.specs.m2Slots;
    if (slots === null) {
      results.push(
        makeResult(
          RULE_STORAGE_M2,
          "unknown",
          ids,
          "The motherboard's M.2 slot count is not documented in the available data, so NVMe storage support cannot be verified.",
          {
            observed: { m2DevicesSelected: m2Devices.length },
            recommendation:
              "Check the motherboard specification for M.2 slot availability.",
          },
        ),
      );
    } else if (m2Devices.length > slots) {
      results.push(
        makeResult(
          RULE_STORAGE_M2,
          "incompatible",
          ids,
          `The selection includes ${m2Devices.length} M.2 drive(s), but the motherboard only has ${slots} M.2 slot(s).`,
          {
            observed: { m2DevicesSelected: m2Devices.length, m2Slots: slots },
            recommendation:
              "Reduce the number of M.2 drives or use SATA storage for the remainder.",
          },
        ),
      );
    } else {
      results.push(
        makeResult(
          RULE_STORAGE_M2,
          "compatible",
          ids,
          `${m2Devices.length} M.2 drive(s) fit within the motherboard's ${slots} M.2 slot(s).`,
          {
            observed: { m2DevicesSelected: m2Devices.length, m2Slots: slots },
          },
        ),
      );
    }
  }

  if (sataDevices.length > 0) {
    const ids = [motherboard.id, ...sataDevices.map((d) => d.id)];
    const ports = motherboard.specs.sataPorts;
    if (ports === null) {
      results.push(
        makeResult(
          RULE_STORAGE_SATA,
          "unknown",
          ids,
          "The motherboard's SATA port count is not documented in the available data, so SATA storage support cannot be verified.",
          {
            observed: { sataDevicesSelected: sataDevices.length },
            recommendation:
              "Check the motherboard specification for SATA port availability.",
          },
        ),
      );
    } else if (sataDevices.length > ports) {
      results.push(
        makeResult(
          RULE_STORAGE_SATA,
          "incompatible",
          ids,
          `The selection includes ${sataDevices.length} SATA device(s), but the motherboard only has ${ports} SATA port(s).`,
          {
            observed: {
              sataDevicesSelected: sataDevices.length,
              sataPorts: ports,
            },
            recommendation:
              "Reduce the number of SATA devices or choose a motherboard with more SATA ports.",
          },
        ),
      );
    } else {
      results.push(
        makeResult(
          RULE_STORAGE_SATA,
          "compatible",
          ids,
          `${sataDevices.length} SATA device(s) fit within the motherboard's ${ports} SATA port(s).`,
          {
            observed: {
              sataDevicesSelected: sataDevices.length,
              sataPorts: ports,
            },
          },
        ),
      );
    }
  }

  return results;
};
