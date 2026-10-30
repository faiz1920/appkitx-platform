/*
 * PC Builder domain model (M10.1, extended M10.3).
 *
 * Conventions:
 * - Every specification attribute that may legitimately be unavailable is
 *   typed `T | null`. `null` means "unknown / not stated by the source" and
 *   must never be treated as proof of compatibility or incompatibility.
 * - Required attributes (e.g. a CPU's socket) are non-nullable; a record
 *   without them is invalid and must be rejected by validate.ts.
 * - Strings use stable, machine-readable vocabularies (unions) wherever a
 *   fixed set exists, so rules can compare values deterministically.
 * - `provenance` classifies the record's evidence. Catalogue records are
 *   manufacturer specifications; UI and power helpers label estimates at the
 *   point of use.
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

/**
 * Lifecycle state. `in-production` is only used when the manufacturer still
 * lists the product; legacy parts stay in the catalogue as discontinued or
 * end-of-life so existing and upgrade builds remain representable.
 */
export type AvailabilityStatus =
  "in-production" | "discontinued" | "end-of-life" | "unverified" | "unknown";

/**
 * Evidence class for a record's specification values.
 * - manufacturer-specification: manufacturer product/specification page
 * - manufacturer-support-list: manufacturer CPU/memory support documentation
 * - verified-third-party: independent measurement, only for fields the
 *   manufacturer does not publish (none used in the seed catalogue yet)
 * - estimated: engineering estimate; never used for catalogue specs
 * - unknown: record retained for completeness but not verified
 */
export type DataProvenance =
  | "manufacturer-specification"
  | "manufacturer-support-list"
  | "verified-third-party"
  | "estimated"
  | "unknown";

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
  /** Evidence class for the specification values in this record. */
  provenance: DataProvenance;
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
export type CaseType = "full-tower" | "mid-tower" | "mini-tower" | "sff";
export type PsuModularity = "full" | "semi" | "non-modular";
export type StorageInterface = "nvme" | "sata";
export type StorageFormFactor = "m2" | "2.5-inch" | "3.5-inch";
export type M2Key = "M" | "B+M";
export type CoolerType = "air" | "aio-liquid";
export type CaseFanConnector = "4-pin-pwm" | "3-pin-dc";
/** Direction of the blade design. Most fans are "standard"; some models
 *  offer reverse-blade variants for unobstructed RGB viewing. */
export type FanAirflowDirection = "standard" | "reverse";
export type RamProfile = "XMP" | "EXPO" | "XMP/EXPO";

export type GpuPowerConnectorType = "pcie-8pin" | "12vhpwr-16pin";

export interface GpuPowerConnector {
  type: GpuPowerConnectorType;
  count: number;
}

/** One physical M.2 slot and the protocols it accepts. */
export interface M2SlotInfo {
  /** "both" marks slots that accept NVMe and SATA M.2 drives. */
  interface: "nvme" | "sata" | "both";
  /** Longest module the slot physically supports (e.g. 2280 -> 80). */
  maxLengthMm: number | null;
  pcieGeneration: number | null;
}

export interface CaseRadiatorMount {
  sizeMm: number;
  /** Human-readable position, e.g. "front", "top", "side". */
  position: string;
}

export interface CaseFanMount {
  sizeMm: number;
  maxCount: number;
}

/* ------------------------------------------------------------------ */
/* Category specifications                                             */
/* ------------------------------------------------------------------ */

export interface CpuSpecs {
  /** CPU socket, e.g. "AM5", "AM4", "LGA1700". */
  socket: string;
  /** Total physical cores. */
  cores: number | null;
  /** Total hardware threads (may equal cores on P-core-only designs). */
  threads: number | null;
  baseClockGHz: number | null;
  boostClockGHz: number | null;
  memoryTypes: MemoryGeneration[];
  memoryChannels: number | null;
  /** Manufacturer-published maximum memory speed in MT/s. */
  memorySpeedMTs: number | null;
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
  /** GPU chipset/product family, e.g. "GeForce RTX 4070". */
  chipset: string;
  /** Board partner for partner-card records; null for reference/Founders. */
  boardPartner: string | null;
  vramGB: number | null;
  /** Memory technology, e.g. "GDDR6X". */
  memoryType: string | null;
  /** PCIe generation of the card interface (3, 4, 5, ...). */
  pcieGeneration: number | null;
  /** Electrical lane count of the card interface (16, 8, ...). */
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
  /** Per-slot protocol/length details when the manufacturer documents them. */
  m2SlotDetails: M2SlotInfo[] | null;
  /** Number of SATA ports. */
  sataPorts: number | null;
  /** Number of on-board fan headers. */
  fanHeaders: number | null;
  /** CPU auxiliary power input, e.g. "8-pin + 4-pin EPS". */
  cpuPowerConnectors: string | null;
  /** Manufacturer CPU support list for BIOS/CPU evidence. */
  cpuSupportListUrl: string | null;
  /** Minimum BIOS version notes for current-generation CPUs, when published. */
  biosVersion: string | null;
}

export interface RamSpecs {
  generation: MemoryGeneration;
  moduleCapacityGB: number;
  moduleCount: number;
  totalCapacityGB: number;
  /** Rated speed in MT/s. */
  speedMTs: number;
  /** Tested timings, e.g. "CL30-36-36-76". */
  timings: string | null;
  /** Profile voltage in volts, when published. */
  voltageV: number | null;
  /** Overclocking profile family, when published. */
  profile: RamProfile | null;
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
  /** Radiator thickness in millimetres, when published. */
  radiatorThicknessMm: number | null;
  /** Fan frame size in millimetres. */
  fanSizeMm: number | null;
  /** Number of fans included with the cooler. */
  fanCount: number | null;
  /** Manufacturer thermal capacity rating in watts, when published. */
  tdpRatingW: number | null;
}

export interface StorageSpecs {
  storageType: "ssd" | "hdd";
  capacityGB: number;
  interface: StorageInterface;
  formFactor: StorageFormFactor;
  /** M.2 keying for M.2 modules. */
  m2Key: M2Key | null;
  /** M.2 module length in millimetres (e.g. 2280 -> 80), M.2 drives only. */
  m2LengthMm: number | null;
  /** PCIe generation of the link (NVMe drives only). */
  pcieGeneration: number | null;
  seqReadMBps: number | null;
  seqWriteMBps: number | null;
  /** Typical drive power in watts, when published. */
  powerDrawW: number | null;
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
  /** Chassis length in millimetres. */
  lengthMm: number | null;
  connectors: PsuConnectorSpec;
}

export interface CaseSpecs {
  caseType: CaseType;
  supportedFormFactors: MotherboardFormFactor[];
  /** Maximum GPU length in millimetres. */
  maxGpuLengthMm: number | null;
  /** Maximum CPU air-cooler height in millimetres. */
  maxCoolerHeightMm: number | null;
  psuFormFactors: PsuFormFactor[];
  /** Maximum PSU chassis length in millimetres, when published. */
  maxPsuLengthMm: number | null;
  /** Supported radiator sizes by longest side in millimetres. */
  radiatorSupportMm: number[] | null;
  /** Documented radiator positions and sizes. */
  radiatorMounts: CaseRadiatorMount[] | null;
  /** Maximum GPU slot thickness, when published. */
  maxGpuSlots: number | null;
  driveBays25inch: number | null;
  driveBays35inch: number | null;
  /** Fan frame sizes the case accepts, in millimetres. */
  fanSizesMm: number[] | null;
  /** Documented fan mounting positions. */
  fanMounts: CaseFanMount[] | null;
  /** Number of fans included with the case. */
  includedFans: number | null;
}

export interface CaseFanSpecs {
  /** Frame size in millimetres (120, 140, ...). */
  sizeMm: number;
  /** Frame thickness in millimetres. */
  thicknessMm: number | null;
  connector: CaseFanConnector;
  /** Whether the fan supports PWM speed control. */
  pwm: boolean | null;
  airflowDirection: FanAirflowDirection | null;
  rpmMin: number | null;
  rpmMax: number | null;
  /** Rated airflow in CFM, when published. */
  airflowCFM: number | null;
  /** Rated static pressure in mmH2O, when published. */
  staticPressureMmH2O: number | null;
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
