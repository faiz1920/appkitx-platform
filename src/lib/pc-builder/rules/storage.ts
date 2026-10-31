/* Storage ↔ motherboard rules: M.2 slots/protocols and SATA ports. */

import type { M2SlotInfo } from "../types";
import type {
  BuildContext,
  CompatibilityResult,
  CompatibilityRule,
} from "./types";
import { makeResult } from "./types";
import type { StorageComponent } from "../types";

export const RULE_STORAGE_M2 = "storage-motherboard-m2";
export const RULE_STORAGE_SATA = "storage-motherboard-sata";

/** Convert a module code (2280, 22110) to its length in millimetres. */
export function moduleLengthToMm(code: number | null): number | null {
  if (code === null) return null;
  const length = code - 2200;
  return length > 0 ? length : null;
}

interface SlotState extends M2SlotInfo {
  index: number;
}

function interfaceSupports(slot: M2SlotInfo, drive: StorageComponent): boolean {
  return slot.interface === "both" || slot.interface === drive.specs.interface;
}

/** An edge is possible unless both lengths are known and the slot is short. */
function lengthCanFit(slot: M2SlotInfo, drive: StorageComponent): boolean {
  const slotLength = slot.maxLengthMm;
  const driveLength = moduleLengthToMm(drive.specs.m2LengthMm);
  if (slotLength === null || driveLength === null) return true;
  return slotLength >= driveLength;
}

function lengthVerified(slot: M2SlotInfo, drive: StorageComponent): boolean {
  return (
    slot.maxLengthMm !== null &&
    moduleLengthToMm(drive.specs.m2LengthMm) !== null
  );
}

/**
 * Bipartite assignment of drives to physical slots. The catalogue never has
 * more than a handful of M.2 devices, so a depth-first augmenting-path
 * matching is both simple and deterministic.
 */
function assignDrives(
  slots: readonly SlotState[],
  drives: readonly StorageComponent[],
): { assigned: (number | undefined)[]; allAssigned: boolean } {
  const assigned: (number | undefined)[] = new Array(drives.length);

  const tryAssign = (driveIndex: number, seen: Set<number>): boolean => {
    const drive = drives[driveIndex];
    for (const slot of slots) {
      if (seen.has(slot.index)) continue;
      if (!interfaceSupports(slot, drive)) continue;
      if (!lengthCanFit(slot, drive)) continue;
      seen.add(slot.index);
      const occupant = assigned.indexOf(slot.index);
      if (occupant === -1 || tryAssign(occupant, seen)) {
        assigned[driveIndex] = slot.index;
        return true;
      }
    }
    return false;
  };

  for (let i = 0; i < drives.length; i += 1) {
    if (!tryAssign(i, new Set<number>())) {
      return { assigned, allAssigned: false };
    }
  }
  return { assigned, allAssigned: true };
}

function m2Result(
  ctx: BuildContext,
  m2Devices: StorageComponent[],
): CompatibilityResult | null {
  const { motherboard } = ctx;
  if (!motherboard || m2Devices.length === 0) return null;

  const ids = [motherboard.id, ...m2Devices.map((drive) => drive.id)];
  const slots = motherboard.specs.m2SlotDetails;
  const slotCount = motherboard.specs.m2Slots;

  if (slots === null) {
    if (slotCount === null) {
      return makeResult(
        RULE_STORAGE_M2,
        "unknown",
        ids,
        "The motherboard's M.2 slot count and protocol support are not documented, so M.2 storage compatibility cannot be verified.",
        {
          observed: { m2DevicesSelected: m2Devices.length },
          recommendation:
            "Check the motherboard specification for M.2 slot count, keying and supported protocols.",
        },
      );
    }
    if (m2Devices.length > slotCount) {
      return makeResult(
        RULE_STORAGE_M2,
        "incompatible",
        ids,
        `The selection includes ${m2Devices.length} M.2 drive(s), but the motherboard only has ${slotCount} M.2 slot(s).`,
        {
          observed: { m2DevicesSelected: m2Devices.length, m2Slots: slotCount },
          recommendation:
            "Reduce the number of M.2 drives or use SATA storage for the remainder.",
        },
      );
    }
    return makeResult(
      RULE_STORAGE_M2,
      "unknown",
      ids,
      `The ${m2Devices.length} M.2 drive(s) fit the board's ${slotCount} slot(s) by count, but per-slot protocol and length support are not documented.`,
      {
        observed: { m2DevicesSelected: m2Devices.length, m2Slots: slotCount },
        recommendation:
          "Check the motherboard manual for each M.2 slot's supported protocol (NVMe/SATA) and module length.",
      },
    );
  }

  if (m2Devices.length > slots.length) {
    return makeResult(
      RULE_STORAGE_M2,
      "incompatible",
      ids,
      `The selection includes ${m2Devices.length} M.2 drive(s), but the motherboard only has ${slots.length} M.2 slot(s).`,
      {
        observed: {
          m2DevicesSelected: m2Devices.length,
          m2Slots: slots.length,
        },
        recommendation:
          "Reduce the number of M.2 drives or use SATA storage for the remainder.",
      },
    );
  }

  const slotStates: SlotState[] = slots.map((slot, index) => ({
    ...slot,
    index,
  }));
  const { assigned, allAssigned } = assignDrives(slotStates, m2Devices);

  if (!allAssigned) {
    // Identify the drives that cannot be placed, with a precise reason.
    const failures = m2Devices
      .map((drive, index) => ({ drive, index }))
      .filter(({ index }) => assigned[index] === undefined)
      .map(({ drive }) => {
        const interfaceCandidates = slotStates.filter((slot) =>
          interfaceSupports(slot, drive),
        );
        if (interfaceCandidates.length === 0) {
          return `${drive.name} needs a ${drive.specs.interface === "nvme" ? "NVMe" : "SATA"} M.2 slot, which this board does not document`;
        }
        const driveLength = moduleLengthToMm(drive.specs.m2LengthMm);
        const lengthsKnownTooShort = interfaceCandidates.every((slot) => {
          if (slot.maxLengthMm === null || driveLength === null) return false;
          return slot.maxLengthMm < driveLength;
        });
        if (lengthsKnownTooShort) {
          return `${drive.name} (${drive.specs.m2LengthMm}) is longer than every compatible slot supports`;
        }
        return `${drive.name} cannot be assigned to a distinct compatible M.2 slot`;
      });

    return makeResult(
      RULE_STORAGE_M2,
      "incompatible",
      ids,
      `The M.2 drives do not fit the motherboard's documented slots: ${failures.join("; ")}.`,
      {
        observed: {
          m2DevicesSelected: m2Devices.length,
          m2Slots: slots.length,
        },
        recommendation:
          "Use drives whose protocol and length match a free M.2 slot on this motherboard.",
      },
    );
  }

  const anyUnknownLength = m2Devices.some((drive) => {
    const slotIndex = assigned[m2Devices.indexOf(drive)];
    if (slotIndex === undefined) return true;
    return !lengthVerified(slotStates[slotIndex], drive);
  });

  if (anyUnknownLength) {
    return makeResult(
      RULE_STORAGE_M2,
      "unknown",
      ids,
      "The M.2 drives match the documented slot protocols, but at least one module length or slot length limit is undocumented, so physical fit cannot be confirmed.",
      {
        observed: {
          m2DevicesSelected: m2Devices.length,
          m2Slots: slots.length,
        },
        recommendation:
          "Confirm the drive length (e.g. 2280) against the slot's documented maximum length.",
      },
    );
  }

  const sharingNotes = m2Devices
    .map((_, index) => {
      const slotIndex = assigned[index];
      return slotIndex === undefined ? null : slotStates[slotIndex].sharingNote;
    })
    .filter((note): note is string => note !== null && note.trim() !== "");
  const noteText =
    sharingNotes.length > 0 ? ` Note: ${sharingNotes.join(" ")}` : "";

  return makeResult(
    RULE_STORAGE_M2,
    "compatible",
    ids,
    `All ${m2Devices.length} M.2 drive(s) match a documented slot protocol and length on this motherboard.${noteText}`,
    {
      observed: {
        m2DevicesSelected: m2Devices.length,
        m2Slots: slots.length,
        sharingNotes: sharingNotes.join(" "),
      },
      recommendation:
        sharingNotes.length > 0
          ? "Review the documented M.2 bandwidth-sharing restriction before populating other slots or SATA ports."
          : undefined,
    },
  );
}

export const storageRules: CompatibilityRule = (ctx) => {
  const { motherboard, storage } = ctx;
  if (!motherboard || storage.length === 0) return [];

  const results = [];

  const m2Devices = storage.filter((d) => d.specs.formFactor === "m2");
  const sataDevices = storage.filter((d) => d.specs.interface === "sata");

  const m2 = m2Result(ctx, m2Devices);
  if (m2) results.push(m2);

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
