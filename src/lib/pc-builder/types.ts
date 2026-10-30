/*
 * PC Builder domain model (M10.1).
 *
 * Conventions:
 * - Every specification attribute that may legitimately be unavailable is
 *   typed `T | null`. `null` means "unknown / not stated by the source" and
 *   must never be treated as proof of compatibility or incompatibility.
 * - Required attributes (e.g. a CPU's socket) are non-nullable; a record
 *   without them is invalid and must be rejected by validate.ts.
 * - Strings use stable, machine-readable vocabularies (unions) wherever a
 *   fixed set exists, so rules can compare values deterministically.
 * - This module is pure TypeScript: no browser APIs, no I/O, no Astro.
 */

export type ComponentCategory =
  | "cpu"
  | "gpu"
  | "motherboard"
  | "ram"
  | "cooler"
  | "storage"
  | "psu"
  | "case"
  | "case-fan";

export const componentCategories: readonly ComponentCategory[] = [
  "cpu",
  "gpu",
  "motherboard",
  "ram",
  "cooler",
  "storage",
  "psu",
  "case",
  "case-fan",
];

/** Categories of which at most one instance may appear in a build. */
export const singleSlotCategories: readonly ComponentCategory[] = [
  "cpu",
  "gpu",
  "motherboard",
  "cooler",
  "psu",
  "case",
];

/** Categories of which a build may contain several instances. */
export const multiSlotCategories: readonly ComponentCategory[] = [
  "ram",
  "storage",
  "case-fan",
];

export type AvailabilityStatus = "in-production" | "discontinued" | "unknown";

/** Attribution for the data record. `accessedAt` is an ISO 8601 date. */
export interface ComponentSource {
  name: string;
  url: string;
  accessedAt: string;
}

interface ComponentBase {
  /** Stable unique identifier, e.g. "cpu-amd-ryzen-7-7800x3d". */
  id: string;
  category: ComponentCategory;
  manufacturer: string;
  /** Commercial product name, e.g. "Ryzen 7 7800X3D". */
  name: string;
  /** Manufacturer model / part identifier, e.g. "100-100000910WOF". */
  model: string;
  description: string;
  /** Product image reference (path or URL). Optional. */
  image?: string;
  /** Manufacturer product page URL. Optional. */
  url?: string;
  /** ISO 8601 release date, when published. Optional. */
  releaseDate?: string;
  availability: AvailabilityStatus;
  source: ComponentSource;
  /** ISO 8601 timestamp of the last human verification of this record. */
  lastVerified: string;
}

/* ------------------------------------------------------------------ */
/* Shared vocabularies                                                 */
/* ------------------------------------------------------------------ */

export type MemoryGeneration = "DDR3" | "DDR4" | "DDR5";
export type MotherboardFormFactor = "ATX" | "Micro-ATX" | "Mini-ITX" | "E-ATX";
export type RamFormFactor = "DIMM" | "SO-DIMM";
export type PsuFormFactor = "ATX" | "SFX" | "SFX-L";
export type PsuModularity = "full" | "semi" | "non-modular";
export type StorageInterface = "nvme" | "sata";
export type StorageFormFactor = "m2" | "2.5-inch" | "3.5-inch";
export type CoolerType = "air" | "aio-liquid";
export type CaseFanConnector = "4-pin-pwm" | "3-pin-dc";
/** Direction of the blade design. Most fans are "standard"; some models
 *  offer reverse-blade variants for unobstructed RGB viewing. */
export type FanAirflowDirection = "standard" | "reverse";

export type GpuPowerConnectorType = "pcie-8pin" | "12vhpwr-16pin";

export interface GpuPowerConnector {
  type: GpuPowerConnectorType;
  count: number;
}

/* ------------------------------------------------------------------ */
/* Category specifications                                             */
/* ------------------------------------------------------------------ */

export interface CpuSpecs {
  /** CPU socket, e.g. "AM5", "AM4", "LGA1700". */
  socket: string;
  memoryTypes: MemoryGeneration[];
  memoryChannels: number | null;
  maxMemoryGB: number | null;
  /** Base TDP / PBP in watts as published by the manufacturer. */
  tdpW: number | null;
  /** Maximum turbo / boost package power in watts, when published. */
  maxPowerW: number | null;
  integratedGraphics: boolean;
  /** Chipsets the manufacturer lists as compatible, or null when the
   *  published data is insufficient for a deterministic verdict. */
  supportedChipsets: string[] | null;
  pcieGeneration: number | null;
  /** Whether a stock cooler ships in the box. */
  coolerIncluded: boolean | null;
}

export interface GpuSpecs {
  /** PCIe generation of the card interface (3, 4, 5, ...). */
  pcieGeneration: number | null;
  /** Electrical lane count of the card interface (typically 16). */
  pcieLanes: number | null;
  /** Card length in millimetres. */
  lengthMm: number | null;
  /** Slot thickness (2, 2.5, 3, ...). */
  slotWidth: number | null;
  /** Total graphics / board power in watts (TGP / TBP). */
  powerDrawW: number | null;
  /** Manufacturer-recommended PSU wattage, when published. */
  recommendedPsuW: number | null;
  /** Auxiliary power connectors present on the card. */
  powerConnectors: GpuPowerConnector[] | null;
  displayOutputs: string[] | null;
}

export interface PcieX16SlotInfo {
  generation: number | null;
  count: number;
}

export interface MotherboardSpecs {
  socket: string;
  chipset: string;
  formFactor: MotherboardFormFactor;
  ramGeneration: MemoryGeneration;
  ramFormFactor: RamFormFactor;
  ramSlots: number;
  maxRamGB: number | null;
  /** Officially supported memory speeds in MT/s, when published. */
  supportedRamSpeedsMTs: number[] | null;
  /** Full-length PCIe x16 slots and their generation. */
  pcieX16Slots: PcieX16SlotInfo | null;
  /** Number of M.2 storage slots. */
  m2Slots: number | null;
  /** Number of SATA ports. */
  sataPorts: number | null;
  /** Number of on-board fan headers. */
  fanHeaders: number | null;
  /** CPU auxiliary power input, e.g. "8-pin + 4-pin EPS". */
  cpuPowerConnectors: string | null;
}

export interface RamSpecs {
  generation: MemoryGeneration;
  moduleCapacityGB: number;
  moduleCount: number;
  totalCapacityGB: number;
  /** Rated speed in MT/s. */
  speedMTs: number;
  formFactor: RamFormFactor;
  ecc: boolean;
  registered: boolean;
}

export interface CoolerSpecs {
  type: CoolerType;
  /** CPU sockets with mounting hardware included, e.g. ["AM5", "LGA1700"]. */
  supportedSockets: string[];
  /** Installed height in millimetres (air coolers). */
  heightMm: number | null;
  /** Radiator longest side in millimetres (AIO liquid coolers): 120, 240, ... */
  radiatorSizeMm: number | null;
  /** Manufacturer thermal capacity rating in watts, when published. */
  tdpRatingW: number | null;
}

export interface StorageSpecs {
  storageType: "ssd" | "hdd";
  capacityGB: number;
  interface: StorageInterface;
  formFactor: StorageFormFactor;
  /** M.2 module length in millimetres (e.g. 2280 -> 80), M.2 drives only. */
  m2LengthMm: number | null;
  /** PCIe generation of the link (NVMe drives only). */
  pcieGeneration: number | null;
}

export interface PsuConnectorSpec {
  /** EPS 8-pin CPU connectors. */
  eps8pin: number | null;
  /** PCIe 8-pin (6+2) connectors. */
  pcie8pin: number | null;
  /** Native 16-pin 12VHPWR / 12V-2x6 connectors. */
  pcie16pin: number | null;
  /** SATA power connectors. */
  sata: number | null;
}

export interface PsuSpecs {
  wattage: number;
  /** Efficiency certification, e.g. "80 Plus Gold". */
  efficiency: string;
  modularity: PsuModularity;
  formFactor: PsuFormFactor;
  /** ATX specification version, e.g. "ATX 3.0", when published. */
  atxVersion: string | null;
  connectors: PsuConnectorSpec;
}

export interface CaseSpecs {
  supportedFormFactors: MotherboardFormFactor[];
  /** Maximum GPU length in millimetres. */
  maxGpuLengthMm: number | null;
  /** Maximum CPU air-cooler height in millimetres. */
  maxCoolerHeightMm: number | null;
  psuFormFactors: PsuFormFactor[];
  /** Supported radiator sizes by longest side in millimetres. */
  radiatorSupportMm: number[] | null;
  /** Maximum GPU slot thickness, when published. */
  maxGpuSlots: number | null;
  driveBays25inch: number | null;
  driveBays35inch: number | null;
  /** Fan frame sizes the case accepts, in millimetres. */
  fanSizesMm: number[] | null;
  /** Number of fans included with the case. */
  includedFans: number | null;
}

export interface CaseFanSpecs {
  /** Frame size in millimetres (120, 140, ...). */
  sizeMm: number;
  connector: CaseFanConnector;
  airflowDirection: FanAirflowDirection | null;
  rpmMin: number | null;
  rpmMax: number | null;
}

/* ------------------------------------------------------------------ */
/* Component records (discriminated union on `category`)               */
/* ------------------------------------------------------------------ */

export interface CpuComponent extends ComponentBase {
  category: "cpu";
  specs: CpuSpecs;
}
export interface GpuComponent extends ComponentBase {
  category: "gpu";
  specs: GpuSpecs;
}
export interface MotherboardComponent extends ComponentBase {
  category: "motherboard";
  specs: MotherboardSpecs;
}
export interface RamComponent extends ComponentBase {
  category: "ram";
  specs: RamSpecs;
}
export interface CoolerComponent extends ComponentBase {
  category: "cooler";
  specs: CoolerSpecs;
}
export interface StorageComponent extends ComponentBase {
  category: "storage";
  specs: StorageSpecs;
}
export interface PsuComponent extends ComponentBase {
  category: "psu";
  specs: PsuSpecs;
}
export interface CaseComponent extends ComponentBase {
  category: "case";
  specs: CaseSpecs;
}
export interface CaseFanComponent extends ComponentBase {
  category: "case-fan";
  specs: CaseFanSpecs;
}

export type Component =
  | CpuComponent
  | GpuComponent
  | MotherboardComponent
  | RamComponent
  | CoolerComponent
  | StorageComponent
  | PsuComponent
  | CaseComponent
  | CaseFanComponent;
