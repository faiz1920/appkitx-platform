/*
 * Compatibility rule registry.
 *
 * Registration order defines evaluation order and therefore the ordering of
 * results in the report — keep it stable for deterministic output.
 */

import { cpuMotherboardRules } from "./cpu-motherboard";
import { ramRules } from "./ram";
import { gpuCaseRule, gpuMotherboardRule } from "./gpu";
import { coolerCaseRules, coolerCpuRules } from "./cooler";
import { motherboardCaseRule } from "./case";
import { psuCaseRule, psuGpuConnectorsRule, psuWattageRule } from "./psu";
import { storageRules } from "./storage";
import { fanCaseRule, fanHeadersRule } from "./fans";
import type { CompatibilityRule } from "./types";

export const compatibilityRules: readonly CompatibilityRule[] = [
  cpuMotherboardRules,
  ramRules,
  gpuMotherboardRule,
  gpuCaseRule,
  coolerCpuRules,
  coolerCaseRules,
  motherboardCaseRule,
  psuWattageRule,
  psuGpuConnectorsRule,
  psuCaseRule,
  storageRules,
  fanCaseRule,
  fanHeadersRule,
];

export * from "./types";
