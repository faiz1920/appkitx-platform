/*
 * Initial curated component catalogue (M10.1).
 *
 * This is a small seed dataset assembled from manufacturer-published
 * specifications — it is not a complete representation of the global
 * market, contains no pricing or stock data, and must not be presented as
 * such. The compatibility engine consumes any `Component[]`; expanding or
 * replacing this catalogue (including future API-backed data) requires no
 * engine changes.
 */

import type { Component, ComponentCategory } from "../types";
import { cpus } from "./cpus";
import { gpus } from "./gpus";
import { motherboards } from "./motherboards";
import { ramKits } from "./ram";
import { coolers } from "./coolers";
import { storageDevices } from "./storage";
import { psus } from "./psus";
import { cases } from "./cases";
import { caseFans } from "./fans";

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
