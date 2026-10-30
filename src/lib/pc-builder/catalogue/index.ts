/*
 * Curated component catalogue (M10.1 seed; expanded in M10.3).
 *
 * Baseline: 27 records from the M10.1 seed. M10.3 expands this to 101
 * records across 23 manufacturers — still not a complete representation of
 * the global market, and containing no pricing or stock data. Records are
 * assembled from manufacturer-published specifications; unavailable values
 * are explicit nulls. The compatibility engine consumes any `Component[]`,
 * so expanding or replacing this catalogue (including future API-backed
 * data) requires no engine changes.
 */

import type { Component, ComponentCategory } from "../types.ts";
import { cpus } from "./cpus.ts";
import { gpus } from "./gpus.ts";
import { motherboards } from "./motherboards.ts";
import { ramKits } from "./ram.ts";
import { coolers } from "./coolers.ts";
import { storageDevices } from "./storage.ts";
import { psus } from "./psus.ts";
import { cases } from "./cases.ts";
import { caseFans } from "./fans.ts";

export const catalogue: readonly Component[] = [
  ...cpus,
  ...gpus,
  ...motherboards,
  ...ramKits,
  ...coolers,
  ...storageDevices,
  ...psus,
  ...cases,
  ...caseFans,
];

export function componentsByCategory(category: ComponentCategory): Component[] {
  return catalogue.filter((component) => component.category === category);
}

export function componentById(id: string): Component | undefined {
  return catalogue.find((component) => component.id === id);
}

export {
  cpus,
  gpus,
  motherboards,
  ramKits,
  coolers,
  storageDevices,
  psus,
  cases,
  caseFans,
};
