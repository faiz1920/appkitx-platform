/*
 * Catalogue quality report (M10.3).
 *
 * Pure, deterministic analysis used by the `pc-builder:validate-catalogue`
 * command and by tests. It never mutates the catalogue and never treats an
 * unknown specification as an error: unknowns are reported so maintainers
 * can prioritise verification work.
 */

import {
  componentCategories,
  type AvailabilityStatus,
  type Component,
  type ComponentCategory,
} from "./types.ts";
import { validateCatalogue, type ValidationError } from "./validate.ts";

export interface CriticalUnknownEntry {
  id: string;
  fields: string[];
}

export interface CategorySummary {
  category: ComponentCategory;
  total: number;
  lifecycle: Record<AvailabilityStatus, number>;
  criticalUnknown: CriticalUnknownEntry[];
}

export interface CatalogueReport {
  /** True when every record validates, ids are unique and provenance exists. */
  ok: boolean;
  total: number;
  manufacturerCount: number;
  byCategory: CategorySummary[];
  lifecycle: Record<AvailabilityStatus, number>;
  duplicateIds: string[];
  invalid: ValidationError[];
  missingProvenance: string[];
  unverified: string[];
  criticalUnknown: CriticalUnknownEntry[];
}

const AVAILABILITY_STATES: readonly AvailabilityStatus[] = [
  "in-production",
  "discontinued",
  "end-of-life",
  "unverified",
  "unknown",
];

function emptyLifecycle(): Record<AvailabilityStatus, number> {
  return {
    "in-production": 0,
    discontinued: 0,
    "end-of-life": 0,
    unverified: 0,
    unknown: 0,
  };
}

/**
 * Attributes whose absence materially limits compatibility verdicts.
 * A missing value is valid data, but it is worth tracking.
 */
function criticalNullFields(component: Component): string[] {
  const missing: string[] = [];
  const gap = (label: string, unknown: boolean) => {
    if (unknown) missing.push(label);
  };

  switch (component.category) {
    case "cpu": {
      const s = component.specs;
      gap("tdpW", s.tdpW === null);
      gap("maxPowerW", s.maxPowerW === null);
      gap("memorySpeedMTs", s.memorySpeedMTs === null);
      gap("maxMemoryGB", s.maxMemoryGB === null);
      gap("pcieGeneration", s.pcieGeneration === null);
      break;
    }
    case "gpu": {
      const s = component.specs;
      gap("vramGB", s.vramGB === null);
      gap("pcieGeneration", s.pcieGeneration === null);
      gap("lengthMm", s.lengthMm === null);
      gap("slotWidth", s.slotWidth === null);
      gap("powerDrawW", s.powerDrawW === null);
      gap("powerConnectors", s.powerConnectors === null);
      if (
        s.powerConnectors !== null &&
        s.powerConnectors.some(
          (connector) => connector.type === "12vhpwr-16pin",
        )
      ) {
        gap("powerAdapter8pin", s.powerAdapter8pin === null);
      }
      break;
    }
    case "motherboard": {
      const s = component.specs;
      gap("maxRamGB", s.maxRamGB === null);
      gap("pcieX16Slots", s.pcieX16Slots === null);
      gap("m2Slots", s.m2Slots === null);
      gap("m2SlotDetails", s.m2SlotDetails === null);
      gap("sataPorts", s.sataPorts === null);
      gap("cpuSupportListUrl", s.cpuSupportListUrl === null);
      break;
    }
    case "ram":
      break;
    case "cooler": {
      const s = component.specs;
      if (s.type === "air") gap("heightMm", s.heightMm === null);
      if (s.type === "aio-liquid")
        gap("radiatorSizeMm", s.radiatorSizeMm === null);
      gap("fanSizeMm", s.fanSizeMm === null);
      break;
    }
    case "storage": {
      const s = component.specs;
      if (s.formFactor === "m2") gap("m2LengthMm", s.m2LengthMm === null);
      if (s.interface === "nvme")
        gap("pcieGeneration", s.pcieGeneration === null);
      break;
    }
    case "psu": {
      const s = component.specs;
      gap("lengthMm", s.lengthMm === null);
      gap("connectors.eps8pin", s.connectors.eps8pin === null);
      gap("connectors.pcie8pin", s.connectors.pcie8pin === null);
      gap("connectors.pcie16pin", s.connectors.pcie16pin === null);
      break;
    }
    case "case": {
      const s = component.specs;
      gap("maxGpuLengthMm", s.maxGpuLengthMm === null);
      gap("maxCoolerHeightMm", s.maxCoolerHeightMm === null);
      gap("maxPsuLengthMm", s.maxPsuLengthMm === null);
      gap("maxGpuSlots", s.maxGpuSlots === null);
      break;
    }
    case "case-fan":
      break;
  }

  return missing;
}

export function buildCatalogueReport(
  input: readonly unknown[],
): CatalogueReport {
  const validation = validateCatalogue(input);
  const components: Component[] = validation.ok ? validation.components : [];
  const invalid = validation.ok ? [] : validation.errors;

  const seen = new Map<string, number>();
  const duplicateIds: string[] = [];
  const missingProvenance: string[] = [];

  for (const record of input) {
    if (typeof record !== "object" || record === null) continue;
    const candidate = record as Record<string, unknown>;
    const id = typeof candidate.id === "string" ? candidate.id : null;
    if (id === null) continue;
    seen.set(id, (seen.get(id) ?? 0) + 1);
    if (
      typeof candidate.provenance !== "string" ||
      candidate.provenance === "unknown"
    ) {
      if (!missingProvenance.includes(id)) missingProvenance.push(id);
    }
  }
  for (const [id, count] of [...seen.entries()].sort(([a], [b]) =>
    a.localeCompare(b, "en"),
  )) {
    if (count > 1) duplicateIds.push(id);
  }

  const lifecycle = emptyLifecycle();
  const criticalUnknown: CriticalUnknownEntry[] = [];
  const byCategory: CategorySummary[] = componentCategories.map((category) => ({
    category,
    total: 0,
    lifecycle: emptyLifecycle(),
    criticalUnknown: [],
  }));
  const categoryIndex = new Map(
    byCategory.map((summary) => [summary.category, summary]),
  );

  for (const component of components) {
    lifecycle[component.availability] += 1;
    const summary = categoryIndex.get(component.category);
    if (!summary) continue;
    summary.total += 1;
    summary.lifecycle[component.availability] += 1;

    const fields = criticalNullFields(component);
    if (fields.length > 0) {
      const entry = { id: component.id, fields };
      summary.criticalUnknown.push(entry);
      criticalUnknown.push(entry);
    }
  }

  const unverified = components
    .filter(
      (component) =>
        component.availability === "unverified" ||
        component.provenance === "unknown",
    )
    .map((component) => component.id)
    .sort((a, b) => a.localeCompare(b, "en"));

  for (const summary of byCategory) {
    summary.criticalUnknown.sort((a, b) => a.id.localeCompare(b.id, "en"));
  }
  criticalUnknown.sort((a, b) => a.id.localeCompare(b.id, "en"));
  missingProvenance.sort((a, b) => a.localeCompare(b, "en"));

  return {
    ok:
      validation.ok &&
      duplicateIds.length === 0 &&
      missingProvenance.length === 0,
    total: input.length,
    manufacturerCount: new Set(components.map((c) => c.manufacturer)).size,
    byCategory,
    lifecycle,
    duplicateIds,
    invalid,
    missingProvenance,
    unverified,
    criticalUnknown,
  };
}

function lifecycleText(counts: Record<AvailabilityStatus, number>): string {
  return AVAILABILITY_STATES.filter((state) => counts[state] > 0)
    .map((state) => `${state} ${counts[state]}`)
    .join(", ");
}

export function formatCatalogueReport(report: CatalogueReport): string {
  const lines: string[] = [];
  lines.push("PC Builder catalogue report");
  lines.push(
    `Total: ${report.total} components from ${report.manufacturerCount} manufacturers`,
  );
  lines.push("");
  lines.push("By category:");
  for (const summary of report.byCategory) {
    lines.push(
      `  ${summary.category}: ${summary.total} (${lifecycleText(summary.lifecycle) || "no records"})`,
    );
  }
  lines.push("");
  lines.push(`Lifecycle: ${lifecycleText(report.lifecycle) || "no records"}`);
  lines.push(
    `Critical unknown specifications: ${report.criticalUnknown.length} record(s)`,
  );
  for (const entry of report.criticalUnknown) {
    lines.push(`  ${entry.id}: ${entry.fields.join(", ")}`);
  }
  lines.push(`Unverified records: ${report.unverified.length}`);
  for (const id of report.unverified) lines.push(`  ${id}`);
  lines.push(
    `Duplicate ids: ${report.duplicateIds.length}${
      report.duplicateIds.length > 0
        ? ` (${report.duplicateIds.join(", ")})`
        : ""
    }`,
  );
  lines.push(
    `Invalid records: ${report.invalid.length}${
      report.invalid.length > 0 ? ` (${report.invalid.length} error(s))` : ""
    }`,
  );
  for (const error of report.invalid) {
    lines.push(`  ${error.path || "<record>"}: ${error.message}`);
  }
  lines.push(`Missing provenance: ${report.missingProvenance.length}`);
  lines.push(`Status: ${report.ok ? "OK" : "FAILED"}`);
  return lines.join("\n");
}
