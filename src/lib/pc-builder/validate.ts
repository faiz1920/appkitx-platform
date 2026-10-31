/*
 * Runtime validation for component records and catalogues (M10.1).
 *
 * The repository has no schema-validation dependency; this module is a
 * deliberately small hand-rolled validator so malformed records never enter
 * the catalogue. It is strict:
 * - required attributes must be present with the right type,
 * - `number | null` fields must be a finite number or explicit null,
 * - unknown category or unexpected spec keys are rejected,
 * - catalogue-level validation enforces unique component ids.
 */

import {
  componentCategories,
  type Component,
  type ComponentCategory,
} from "./types.ts";

export interface ValidationError {
  /** Dot-separated path to the offending field, e.g. "specs.socket". */
  path: string;
  message: string;
}

export type ComponentValidation =
  { ok: true; component: Component } | { ok: false; errors: ValidationError[] };

export type CatalogueValidation =
  | { ok: true; components: Component[] }
  | { ok: false; errors: ValidationError[] };

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function err(errors: ValidationError[], path: string, message: string): void {
  errors.push({ path, message });
}

function checkNonEmptyString(
  errors: ValidationError[],
  obj: Obj,
  key: string,
  path: string,
): void {
  const v = obj[key];
  if (typeof v !== "string" || v.trim() === "") {
    err(errors, `${path}.${key}`, "must be a non-empty string");
  }
}

function checkIsoDate(
  errors: ValidationError[],
  obj: Obj,
  key: string,
  path: string,
  required: boolean,
): void {
  const v = obj[key];
  if (v === undefined) {
    if (required) err(errors, `${path}.${key}`, "is required");
    return;
  }
  if (typeof v !== "string" || Number.isNaN(Date.parse(v))) {
    err(errors, `${path}.${key}`, "must be an ISO 8601 date string");
  }
}

function checkBoolean(
  errors: ValidationError[],
  obj: Obj,
  key: string,
  path: string,
): void {
  if (typeof obj[key] !== "boolean") {
    err(errors, `${path}.${key}`, "must be a boolean");
  }
}

/** Finite number or explicit null. Null = unknown; undefined is invalid. */
function checkNumberOrNull(
  errors: ValidationError[],
  obj: Obj,
  key: string,
  path: string,
  { positive = false }: { positive?: boolean } = {},
): void {
  const v = obj[key];
  if (v === null) return;
  if (typeof v !== "number" || !Number.isFinite(v)) {
    err(errors, `${path}.${key}`, "must be a finite number or null");
    return;
  }
  if (positive && v <= 0) {
    err(errors, `${path}.${key}`, "must be greater than zero");
  }
}

function checkPositiveNumber(
  errors: ValidationError[],
  obj: Obj,
  key: string,
  path: string,
): void {
  const v = obj[key];
  if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) {
    err(errors, `${path}.${key}`, "must be a number greater than zero");
  }
}

function checkPositiveInt(
  errors: ValidationError[],
  obj: Obj,
  key: string,
  path: string,
): void {
  const v = obj[key];
  if (typeof v !== "number" || !Number.isInteger(v) || v <= 0) {
    err(errors, `${path}.${key}`, "must be a positive integer");
  }
}

function checkPositiveIntOrNull(
  errors: ValidationError[],
  obj: Obj,
  key: string,
  path: string,
): void {
  const v = obj[key];
  if (v === null) return;
  if (typeof v !== "number" || !Number.isInteger(v) || v <= 0) {
    err(errors, `${path}.${key}`, "must be a positive integer or null");
  }
}

function checkStringOrNull(
  errors: ValidationError[],
  obj: Obj,
  key: string,
  path: string,
): void {
  const v = obj[key];
  if (v === null) return;
  if (typeof v !== "string" || v.trim() === "") {
    err(errors, `${path}.${key}`, "must be a non-empty string or null");
  }
}

function checkEnumOrNull(
  errors: ValidationError[],
  obj: Obj,
  key: string,
  path: string,
  allowed: readonly string[],
): void {
  const v = obj[key];
  if (v === null) return;
  if (typeof v !== "string" || !allowed.includes(v)) {
    err(
      errors,
      `${path}.${key}`,
      `must be one of: ${allowed.join(", ")} or null`,
    );
  }
}

function checkEnum(
  errors: ValidationError[],
  obj: Obj,
  key: string,
  path: string,
  allowed: readonly string[],
): void {
  const v = obj[key];
  if (typeof v !== "string" || !allowed.includes(v)) {
    err(errors, `${path}.${key}`, `must be one of: ${allowed.join(", ")}`);
  }
}

function checkStringArrayOrNull(
  errors: ValidationError[],
  obj: Obj,
  key: string,
  path: string,
): void {
  const v = obj[key];
  if (v === null) return;
  if (!Array.isArray(v) || v.some((item) => typeof item !== "string")) {
    err(errors, `${path}.${key}`, "must be an array of strings or null");
  }
}

function checkNumberArrayOrNull(
  errors: ValidationError[],
  obj: Obj,
  key: string,
  path: string,
): void {
  const v = obj[key];
  if (v === null) return;
  if (
    !Array.isArray(v) ||
    v.some((item) => typeof item !== "number" || !Number.isFinite(item))
  ) {
    err(errors, `${path}.${key}`, "must be an array of finite numbers or null");
  }
}

function checkEnumArray(
  errors: ValidationError[],
  obj: Obj,
  key: string,
  path: string,
  allowed: readonly string[],
): void {
  const v = obj[key];
  if (
    !Array.isArray(v) ||
    v.length === 0 ||
    v.some((item) => typeof item !== "string" || !allowed.includes(item))
  ) {
    err(
      errors,
      `${path}.${key}`,
      `must be a non-empty array of: ${allowed.join(", ")}`,
    );
  }
}

/** Reject keys the type model does not know, to keep records well-formed. */
function checkNoUnknownKeys(
  errors: ValidationError[],
  obj: Obj,
  path: string,
  allowedKeys: readonly string[],
): void {
  for (const key of Object.keys(obj)) {
    if (!allowedKeys.includes(key)) {
      err(errors, `${path}.${key}`, "is not a recognised attribute");
    }
  }
}

const MEMORY_GENERATIONS = ["DDR3", "DDR4", "DDR5"];
const FORM_FACTORS_MB = ["ATX", "Micro-ATX", "Mini-ITX", "E-ATX"];
const FORM_FACTORS_RAM = ["DIMM", "SO-DIMM"];
const FORM_FACTORS_PSU = ["ATX", "SFX", "SFX-L"];
const AVAILABILITY = [
  "in-production",
  "discontinued",
  "end-of-life",
  "unverified",
  "unknown",
];
const PROVENANCE = [
  "manufacturer-specification",
  "manufacturer-support-list",
  "verified-third-party",
  "estimated",
  "unknown",
];
const M2_INTERFACES = ["nvme", "sata", "both"];

const COMMON_KEYS = [
  "id",
  "category",
  "manufacturer",
  "name",
  "model",
  "description",
  "image",
  "url",
  "releaseDate",
  "availability",
  "provenance",
  "source",
  "lastVerified",
  "specs",
];

function validateCommon(errors: ValidationError[], record: Obj): void {
  checkNoUnknownKeys(errors, record, "", COMMON_KEYS);
  checkNonEmptyString(errors, record, "id", "");
  checkEnum(errors, record, "category", "", componentCategories);
  checkNonEmptyString(errors, record, "manufacturer", "");
  checkNonEmptyString(errors, record, "name", "");
  checkNonEmptyString(errors, record, "model", "");
  checkNonEmptyString(errors, record, "description", "");
  checkEnum(errors, record, "availability", "", AVAILABILITY);
  checkEnum(errors, record, "provenance", "", PROVENANCE);
  checkIsoDate(errors, record, "releaseDate", "", false);
  checkIsoDate(errors, record, "lastVerified", "", true);

  if (record.image !== undefined && typeof record.image !== "string") {
    err(errors, ".image", "must be a string when present");
  }
  if (record.url !== undefined && typeof record.url !== "string") {
    err(errors, ".url", "must be a string when present");
  }

  const source = record.source;
  if (!isObj(source)) {
    err(errors, ".source", "is required and must be an object");
  } else {
    checkNoUnknownKeys(errors, source, ".source", [
      "name",
      "url",
      "accessedAt",
    ]);
    checkNonEmptyString(errors, source, "name", ".source");
    checkNonEmptyString(errors, source, "url", ".source");
    checkIsoDate(errors, source, "accessedAt", ".source", true);
  }
}

function validateSpecs(
  errors: ValidationError[],
  category: ComponentCategory,
  specs: Obj,
): void {
  const p = ".specs";
  switch (category) {
    case "cpu": {
      checkNoUnknownKeys(errors, specs, p, [
        "socket",
        "cores",
        "threads",
        "baseClockGHz",
        "boostClockGHz",
        "memoryTypes",
        "memoryChannels",
        "memorySpeedMTs",
        "maxMemoryGB",
        "tdpW",
        "maxPowerW",
        "integratedGraphics",
        "supportedChipsets",
        "pcieGeneration",
        "coolerIncluded",
      ]);
      checkNonEmptyString(errors, specs, "socket", p);
      checkPositiveIntOrNull(errors, specs, "cores", p);
      checkPositiveIntOrNull(errors, specs, "threads", p);
      checkNumberOrNull(errors, specs, "baseClockGHz", p, { positive: true });
      checkNumberOrNull(errors, specs, "boostClockGHz", p, { positive: true });
      checkEnumArray(errors, specs, "memoryTypes", p, MEMORY_GENERATIONS);
      checkNumberOrNull(errors, specs, "memoryChannels", p, { positive: true });
      checkNumberOrNull(errors, specs, "memorySpeedMTs", p, { positive: true });
      checkNumberOrNull(errors, specs, "maxMemoryGB", p, { positive: true });
      if (
        typeof specs.cores === "number" &&
        typeof specs.threads === "number" &&
        specs.threads < specs.cores
      ) {
        err(errors, `${p}.threads`, "must be greater than or equal to cores");
      }
      if (
        typeof specs.baseClockGHz === "number" &&
        typeof specs.boostClockGHz === "number" &&
        specs.boostClockGHz < specs.baseClockGHz
      ) {
        err(errors, `${p}.boostClockGHz`, "must not be below baseClockGHz");
      }
      checkNumberOrNull(errors, specs, "tdpW", p, { positive: true });
      checkNumberOrNull(errors, specs, "maxPowerW", p, { positive: true });
      checkBoolean(errors, specs, "integratedGraphics", p);
      checkStringArrayOrNull(errors, specs, "supportedChipsets", p);
      checkNumberOrNull(errors, specs, "pcieGeneration", p, { positive: true });
      if (
        specs.coolerIncluded !== null &&
        typeof specs.coolerIncluded !== "boolean"
      ) {
        err(errors, `${p}.coolerIncluded`, "must be a boolean or null");
      }
      break;
    }
    case "gpu": {
      checkNoUnknownKeys(errors, specs, p, [
        "chipset",
        "boardPartner",
        "vramGB",
        "memoryType",
        "pcieGeneration",
        "pcieLanes",
        "lengthMm",
        "slotWidth",
        "powerDrawW",
        "recommendedPsuW",
        "powerConnectors",
        "powerAdapter8pin",
        "displayOutputs",
      ]);
      checkNonEmptyString(errors, specs, "chipset", p);
      checkStringOrNull(errors, specs, "boardPartner", p);
      checkNumberOrNull(errors, specs, "vramGB", p, { positive: true });
      checkStringOrNull(errors, specs, "memoryType", p);
      checkNumberOrNull(errors, specs, "pcieGeneration", p, { positive: true });
      checkNumberOrNull(errors, specs, "pcieLanes", p, { positive: true });
      checkNumberOrNull(errors, specs, "lengthMm", p, { positive: true });
      checkNumberOrNull(errors, specs, "slotWidth", p, { positive: true });
      checkNumberOrNull(errors, specs, "powerDrawW", p, { positive: true });
      checkNumberOrNull(errors, specs, "recommendedPsuW", p, {
        positive: true,
      });
      checkPositiveIntOrNull(errors, specs, "powerAdapter8pin", p);
      checkStringArrayOrNull(errors, specs, "displayOutputs", p);
      const connectors = specs.powerConnectors;
      if (connectors !== null) {
        if (!Array.isArray(connectors)) {
          err(errors, `${p}.powerConnectors`, "must be an array or null");
        } else {
          connectors.forEach((connector, i) => {
            const cp = `${p}.powerConnectors[${i}]`;
            if (!isObj(connector)) {
              err(errors, cp, "must be an object");
              return;
            }
            checkNoUnknownKeys(errors, connector, cp, ["type", "count"]);
            checkEnum(errors, connector, "type", cp, [
              "pcie-8pin",
              "12vhpwr-16pin",
            ]);
            checkPositiveInt(errors, connector, "count", cp);
          });
        }
      }
      if (
        typeof specs.powerAdapter8pin === "number" &&
        (!Array.isArray(connectors) ||
          !connectors.some(
            (connector) =>
              isObj(connector) && connector.type === "12vhpwr-16pin",
          ))
      ) {
        err(
          errors,
          `${p}.powerAdapter8pin`,
          "can only be set when the card has a 16-pin power connector",
        );
      }
      break;
    }
    case "motherboard": {
      checkNoUnknownKeys(errors, specs, p, [
        "socket",
        "chipset",
        "formFactor",
        "ramGeneration",
        "ramFormFactor",
        "ramSlots",
        "maxRamGB",
        "supportedRamSpeedsMTs",
        "pcieX16Slots",
        "m2Slots",
        "m2SlotDetails",
        "sataPorts",
        "fanHeaders",
        "cpuPowerConnectors",
        "cpuSupportListUrl",
        "biosVersion",
      ]);
      checkNonEmptyString(errors, specs, "socket", p);
      checkNonEmptyString(errors, specs, "chipset", p);
      checkEnum(errors, specs, "formFactor", p, FORM_FACTORS_MB);
      checkEnum(errors, specs, "ramGeneration", p, MEMORY_GENERATIONS);
      checkEnum(errors, specs, "ramFormFactor", p, FORM_FACTORS_RAM);
      checkPositiveInt(errors, specs, "ramSlots", p);
      checkNumberOrNull(errors, specs, "maxRamGB", p, { positive: true });
      checkNumberArrayOrNull(errors, specs, "supportedRamSpeedsMTs", p);
      checkNumberOrNull(errors, specs, "m2Slots", p);
      checkNumberOrNull(errors, specs, "sataPorts", p);
      checkNumberOrNull(errors, specs, "fanHeaders", p);
      checkStringOrNull(errors, specs, "cpuPowerConnectors", p);
      checkStringOrNull(errors, specs, "cpuSupportListUrl", p);
      checkStringOrNull(errors, specs, "biosVersion", p);

      const m2Details = specs.m2SlotDetails;
      if (m2Details !== null) {
        if (!Array.isArray(m2Details)) {
          err(errors, `${p}.m2SlotDetails`, "must be an array or null");
        } else {
          m2Details.forEach((slot, i) => {
            const sp = `${p}.m2SlotDetails[${i}]`;
            if (!isObj(slot)) {
              err(errors, sp, "must be an object");
              return;
            }
            checkNoUnknownKeys(errors, slot, sp, [
              "interface",
              "maxLengthMm",
              "pcieGeneration",
              "sharingNote",
            ]);
            checkEnum(errors, slot, "interface", sp, M2_INTERFACES);
            checkNumberOrNull(errors, slot, "maxLengthMm", sp, {
              positive: true,
            });
            checkNumberOrNull(errors, slot, "pcieGeneration", sp, {
              positive: true,
            });
            checkStringOrNull(errors, slot, "sharingNote", sp);
          });
          if (typeof specs.m2Slots !== "number") {
            err(
              errors,
              `${p}.m2Slots`,
              "must be a number when m2SlotDetails is provided",
            );
          } else if (specs.m2Slots !== m2Details.length) {
            err(
              errors,
              `${p}.m2Slots`,
              "must equal the number of documented M.2 slots",
            );
          }
        }
      }
      const slots = specs.pcieX16Slots;
      if (slots !== null) {
        if (!isObj(slots)) {
          err(errors, `${p}.pcieX16Slots`, "must be an object or null");
        } else {
          checkNoUnknownKeys(errors, slots, `${p}.pcieX16Slots`, [
            "generation",
            "count",
          ]);
          checkNumberOrNull(errors, slots, "generation", `${p}.pcieX16Slots`, {
            positive: true,
          });
          checkPositiveInt(errors, slots, "count", `${p}.pcieX16Slots`);
        }
      }
      break;
    }
    case "ram": {
      checkNoUnknownKeys(errors, specs, p, [
        "generation",
        "moduleCapacityGB",
        "moduleCount",
        "totalCapacityGB",
        "speedMTs",
        "timings",
        "voltageV",
        "profile",
        "formFactor",
        "ecc",
        "registered",
      ]);
      checkEnum(errors, specs, "generation", p, MEMORY_GENERATIONS);
      checkPositiveNumber(errors, specs, "moduleCapacityGB", p);
      checkPositiveInt(errors, specs, "moduleCount", p);
      checkPositiveNumber(errors, specs, "totalCapacityGB", p);
      checkPositiveNumber(errors, specs, "speedMTs", p);
      checkStringOrNull(errors, specs, "timings", p);
      checkNumberOrNull(errors, specs, "voltageV", p, { positive: true });
      checkEnumOrNull(errors, specs, "profile", p, ["XMP", "EXPO", "XMP/EXPO"]);
      checkEnum(errors, specs, "formFactor", p, FORM_FACTORS_RAM);
      checkBoolean(errors, specs, "ecc", p);
      checkBoolean(errors, specs, "registered", p);
      const moduleCapacity = specs.moduleCapacityGB;
      const moduleCount = specs.moduleCount;
      const total = specs.totalCapacityGB;
      if (
        typeof moduleCapacity === "number" &&
        typeof moduleCount === "number" &&
        typeof total === "number" &&
        moduleCapacity * moduleCount !== total
      ) {
        err(
          errors,
          `${p}.totalCapacityGB`,
          "must equal moduleCapacityGB × moduleCount",
        );
      }
      break;
    }
    case "cooler": {
      checkNoUnknownKeys(errors, specs, p, [
        "type",
        "supportedSockets",
        "heightMm",
        "radiatorSizeMm",
        "radiatorThicknessMm",
        "fanSizeMm",
        "fanCount",
        "tdpRatingW",
      ]);
      checkEnum(errors, specs, "type", p, ["air", "aio-liquid"]);
      if (
        !Array.isArray(specs.supportedSockets) ||
        specs.supportedSockets.length === 0 ||
        specs.supportedSockets.some((s) => typeof s !== "string")
      ) {
        err(
          errors,
          `${p}.supportedSockets`,
          "must be a non-empty array of strings",
        );
      }
      checkNumberOrNull(errors, specs, "heightMm", p, { positive: true });
      checkNumberOrNull(errors, specs, "radiatorSizeMm", p, { positive: true });
      checkNumberOrNull(errors, specs, "radiatorThicknessMm", p, {
        positive: true,
      });
      checkNumberOrNull(errors, specs, "fanSizeMm", p, { positive: true });
      checkPositiveIntOrNull(errors, specs, "fanCount", p);
      checkNumberOrNull(errors, specs, "tdpRatingW", p, { positive: true });
      if (specs.type === "air" && specs.radiatorSizeMm !== null) {
        err(errors, `${p}.radiatorSizeMm`, "must be null for air coolers");
      }
      if (specs.type === "air" && specs.radiatorThicknessMm !== null) {
        err(errors, `${p}.radiatorThicknessMm`, "must be null for air coolers");
      }
      if (specs.type === "aio-liquid" && specs.heightMm !== null) {
        err(
          errors,
          `${p}.heightMm`,
          "must be null for AIO liquid coolers (use radiatorSizeMm)",
        );
      }
      break;
    }
    case "storage": {
      checkNoUnknownKeys(errors, specs, p, [
        "storageType",
        "capacityGB",
        "interface",
        "formFactor",
        "m2Key",
        "m2LengthMm",
        "pcieGeneration",
        "seqReadMBps",
        "seqWriteMBps",
        "powerDrawW",
      ]);
      checkEnum(errors, specs, "storageType", p, ["ssd", "hdd"]);
      checkPositiveNumber(errors, specs, "capacityGB", p);
      checkEnum(errors, specs, "interface", p, ["nvme", "sata"]);
      checkEnum(errors, specs, "formFactor", p, ["m2", "2.5-inch", "3.5-inch"]);
      checkEnumOrNull(errors, specs, "m2Key", p, ["M", "B+M"]);
      checkNumberOrNull(errors, specs, "m2LengthMm", p, { positive: true });
      checkNumberOrNull(errors, specs, "pcieGeneration", p, { positive: true });
      checkNumberOrNull(errors, specs, "seqReadMBps", p, { positive: true });
      checkNumberOrNull(errors, specs, "seqWriteMBps", p, { positive: true });
      checkNumberOrNull(errors, specs, "powerDrawW", p, { positive: true });
      if (
        specs.interface === "nvme" &&
        specs.formFactor !== "m2" &&
        specs.formFactor !== "2.5-inch"
      ) {
        err(
          errors,
          `${p}.formFactor`,
          "NVMe drives must be M.2 or 2.5-inch (U.2)",
        );
      }
      if (specs.formFactor !== "m2" && specs.m2Key !== null) {
        err(errors, `${p}.m2Key`, "must be null for non-M.2 drives");
      }
      break;
    }
    case "psu": {
      checkNoUnknownKeys(errors, specs, p, [
        "wattage",
        "efficiency",
        "modularity",
        "formFactor",
        "atxVersion",
        "lengthMm",
        "connectors",
      ]);
      checkPositiveNumber(errors, specs, "wattage", p);
      checkNonEmptyString(errors, specs, "efficiency", p);
      checkEnum(errors, specs, "modularity", p, [
        "full",
        "semi",
        "non-modular",
      ]);
      checkEnum(errors, specs, "formFactor", p, FORM_FACTORS_PSU);
      checkStringOrNull(errors, specs, "atxVersion", p);
      checkNumberOrNull(errors, specs, "lengthMm", p, { positive: true });
      const connectors = specs.connectors;
      if (!isObj(connectors)) {
        err(errors, `${p}.connectors`, "is required and must be an object");
      } else {
        const cp = `${p}.connectors`;
        checkNoUnknownKeys(errors, connectors, cp, [
          "eps8pin",
          "pcie8pin",
          "pcie16pin",
          "sata",
        ]);
        checkNumberOrNull(errors, connectors, "eps8pin", cp);
        checkNumberOrNull(errors, connectors, "pcie8pin", cp);
        checkNumberOrNull(errors, connectors, "pcie16pin", cp);
        checkNumberOrNull(errors, connectors, "sata", cp);
      }
      break;
    }
    case "case": {
      checkNoUnknownKeys(errors, specs, p, [
        "caseType",
        "supportedFormFactors",
        "maxGpuLengthMm",
        "maxCoolerHeightMm",
        "psuFormFactors",
        "maxPsuLengthMm",
        "radiatorSupportMm",
        "radiatorMounts",
        "maxGpuSlots",
        "driveBays25inch",
        "driveBays35inch",
        "fanSizesMm",
        "fanMounts",
        "includedFans",
      ]);
      checkEnum(errors, specs, "caseType", p, [
        "full-tower",
        "mid-tower",
        "mini-tower",
        "sff",
      ]);
      checkEnumArray(errors, specs, "supportedFormFactors", p, FORM_FACTORS_MB);
      checkNumberOrNull(errors, specs, "maxGpuLengthMm", p, { positive: true });
      checkNumberOrNull(errors, specs, "maxCoolerHeightMm", p, {
        positive: true,
      });
      checkEnumArray(errors, specs, "psuFormFactors", p, FORM_FACTORS_PSU);
      checkNumberOrNull(errors, specs, "maxPsuLengthMm", p, { positive: true });
      checkNumberArrayOrNull(errors, specs, "radiatorSupportMm", p);
      checkNumberOrNull(errors, specs, "maxGpuSlots", p, { positive: true });
      checkNumberOrNull(errors, specs, "driveBays25inch", p);
      checkNumberOrNull(errors, specs, "driveBays35inch", p);
      checkNumberArrayOrNull(errors, specs, "fanSizesMm", p);
      checkNumberOrNull(errors, specs, "includedFans", p);

      const radiatorMounts = specs.radiatorMounts;
      if (radiatorMounts !== null) {
        if (!Array.isArray(radiatorMounts)) {
          err(errors, `${p}.radiatorMounts`, "must be an array or null");
        } else {
          radiatorMounts.forEach((mount, i) => {
            const mp = `${p}.radiatorMounts[${i}]`;
            if (!isObj(mount)) {
              err(errors, mp, "must be an object");
              return;
            }
            checkNoUnknownKeys(errors, mount, mp, ["sizeMm", "position"]);
            checkPositiveNumber(errors, mount, "sizeMm", mp);
            checkNonEmptyString(errors, mount, "position", mp);
          });
        }
      }
      const fanMounts = specs.fanMounts;
      if (fanMounts !== null) {
        if (!Array.isArray(fanMounts)) {
          err(errors, `${p}.fanMounts`, "must be an array or null");
        } else {
          fanMounts.forEach((mount, i) => {
            const mp = `${p}.fanMounts[${i}]`;
            if (!isObj(mount)) {
              err(errors, mp, "must be an object");
              return;
            }
            checkNoUnknownKeys(errors, mount, mp, ["sizeMm", "maxCount"]);
            checkPositiveNumber(errors, mount, "sizeMm", mp);
            checkPositiveInt(errors, mount, "maxCount", mp);
          });
        }
      }

      // Summary size lists must agree with documented mount detail when both
      // are present, so the engine cannot silently ignore a documented size.
      if (
        Array.isArray(radiatorMounts) &&
        Array.isArray(specs.radiatorSupportMm)
      ) {
        const mountSizes = new Set(
          radiatorMounts
            .filter(isObj)
            .map((mount) => mount.sizeMm)
            .filter((size): size is number => typeof size === "number"),
        );
        for (const size of specs.radiatorSupportMm) {
          if (typeof size === "number" && !mountSizes.has(size)) {
            err(
              errors,
              `${p}.radiatorSupportMm`,
              `lists ${size} mm but no radiator mount documents that size`,
            );
          }
        }
      }
      if (Array.isArray(fanMounts) && Array.isArray(specs.fanSizesMm)) {
        const mountSizes = new Set(
          fanMounts
            .filter(isObj)
            .map((mount) => mount.sizeMm)
            .filter((size): size is number => typeof size === "number"),
        );
        for (const size of specs.fanSizesMm) {
          if (typeof size === "number" && !mountSizes.has(size)) {
            err(
              errors,
              `${p}.fanSizesMm`,
              `lists ${size} mm but no fan mount documents that size`,
            );
          }
        }
      }
      break;
    }
    case "case-fan": {
      checkNoUnknownKeys(errors, specs, p, [
        "sizeMm",
        "thicknessMm",
        "connector",
        "pwm",
        "airflowDirection",
        "rpmMin",
        "rpmMax",
        "airflowCFM",
        "staticPressureMmH2O",
      ]);
      checkPositiveNumber(errors, specs, "sizeMm", p);
      checkNumberOrNull(errors, specs, "thicknessMm", p, { positive: true });
      checkEnum(errors, specs, "connector", p, ["4-pin-pwm", "3-pin-dc"]);
      if (specs.pwm !== null && typeof specs.pwm !== "boolean") {
        err(errors, `${p}.pwm`, "must be a boolean or null");
      }
      if (specs.pwm === true && specs.connector === "3-pin-dc") {
        err(errors, `${p}.pwm`, "3-pin DC fans cannot support PWM control");
      }
      checkNumberOrNull(errors, specs, "airflowCFM", p, { positive: true });
      checkNumberOrNull(errors, specs, "staticPressureMmH2O", p, {
        positive: true,
      });
      if (
        specs.airflowDirection !== null &&
        specs.airflowDirection !== "standard" &&
        specs.airflowDirection !== "reverse"
      ) {
        err(
          errors,
          `${p}.airflowDirection`,
          'must be "standard", "reverse" or null',
        );
      }
      checkNumberOrNull(errors, specs, "rpmMin", p);
      checkNumberOrNull(errors, specs, "rpmMax", p);
      if (
        typeof specs.rpmMin === "number" &&
        typeof specs.rpmMax === "number" &&
        specs.rpmMin > specs.rpmMax
      ) {
        err(errors, `${p}.rpmMin`, "must not exceed rpmMax");
      }
      break;
    }
  }
}

export function validateComponent(input: unknown): ComponentValidation {
  const errors: ValidationError[] = [];

  if (!isObj(input)) {
    return {
      ok: false,
      errors: [{ path: "", message: "component record must be an object" }],
    };
  }

  validateCommon(errors, input);

  const category = input.category;
  const specs = input.specs;
  if (!isObj(specs)) {
    err(errors, ".specs", "is required and must be an object");
  } else if (
    typeof category === "string" &&
    (componentCategories as readonly string[]).includes(category)
  ) {
    validateSpecs(errors, category as ComponentCategory, specs);
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, component: input as unknown as Component };
}

export function validateCatalogue(input: unknown): CatalogueValidation {
  if (!Array.isArray(input)) {
    return {
      ok: false,
      errors: [
        { path: "", message: "catalogue must be an array of components" },
      ],
    };
  }

  const errors: ValidationError[] = [];
  const components: Component[] = [];
  const seenIds = new Map<string, number>();

  input.forEach((record, index) => {
    const result = validateComponent(record);
    if (!result.ok) {
      for (const error of result.errors) {
        errors.push({
          path: `[${index}]${error.path}`,
          message: error.message,
        });
      }
      return;
    }
    components.push(result.component);
    const firstIndex = seenIds.get(result.component.id);
    if (firstIndex !== undefined) {
      errors.push({
        path: `[${index}].id`,
        message: `duplicate component id "${result.component.id}" (first seen at index ${firstIndex})`,
      });
    } else {
      seenIds.set(result.component.id, index);
    }
  });

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, components };
}
