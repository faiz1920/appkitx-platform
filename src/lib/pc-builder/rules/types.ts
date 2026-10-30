/*
 * Shared types for compatibility rules and the evaluation engine.
 *
 * Semantics:
 * - "compatible":    checked data matches; no concern.
 * - "warning":       works, but with a caveat the user should know about
 *                    (e.g. PCIe runs at a lower generation, tight PSU margin).
 * - "incompatible":  checked data provably conflicts (e.g. socket mismatch).
 * - "unknown":       required data is missing; no verdict can be given.
 * A missing specification must never be reported as compatible or
 * incompatible — always "unknown".
 */

import type { PowerEstimate } from "../power";
import type {
  CaseComponent,
  CaseFanComponent,
  CoolerComponent,
  CpuComponent,
  GpuComponent,
  MotherboardComponent,
  PsuComponent,
  RamComponent,
  StorageComponent,
} from "../types";

export type CompatibilityStatus =
  "compatible" | "warning" | "incompatible" | "unknown";

export type Severity = "info" | "warning" | "error";

export type ObservedValue = string | number | boolean | null;

export interface CompatibilityResult {
  /** Stable rule identifier, e.g. "cpu-motherboard-socket". */
  ruleId: string;
  status: CompatibilityStatus;
  severity: Severity;
  /** Ids of components this verdict concerns. */
  componentIds: string[];
  /** Human-readable explanation, suitable for user-facing display. */
  message: string;
  /** Observed values the verdict is based on. */
  observed?: Record<string, ObservedValue>;
  /** Suggested resolution, where applicable. */
  recommendation?: string;
}

/** Grouped, normalised view of a build selection handed to each rule.
 *  Single-slot categories expose the first selected component; duplicates
 *  are reported separately by the build-duplicate-category rule. */
export interface BuildContext {
  cpu: CpuComponent | null;
  gpu: GpuComponent | null;
  motherboard: MotherboardComponent | null;
  ram: RamComponent[];
  cooler: CoolerComponent | null;
  storage: StorageComponent[];
  psu: PsuComponent | null;
  pcCase: CaseComponent | null;
  caseFans: CaseFanComponent[];
  /** Power estimate for the whole selection, computed by the engine. */
  power: PowerEstimate;
}

export type CompatibilityRule = (ctx: BuildContext) => CompatibilityResult[];

export function severityFor(status: CompatibilityStatus): Severity {
  switch (status) {
    case "incompatible":
      return "error";
    case "warning":
      return "warning";
    case "compatible":
    case "unknown":
      return "info";
  }
}

export function makeResult(
  ruleId: string,
  status: CompatibilityStatus,
  componentIds: string[],
  message: string,
  extra: {
    observed?: Record<string, ObservedValue>;
    recommendation?: string;
  } = {},
): CompatibilityResult {
  return {
    ruleId,
    status,
    severity: severityFor(status),
    componentIds,
    message,
    ...extra,
  };
}
