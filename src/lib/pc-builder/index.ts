/*
 * PC Builder foundation (M10.1) — public API.
 *
 * Pure TypeScript domain module: no browser APIs, no Astro coupling, no
 * network or database access. Astro pages and future API surfaces should
 * import from here only.
 */

export * from "./types";
export {
  estimateBuildPower,
  POWER_ESTIMATES,
  DEFAULT_HEADROOM_PERCENT,
} from "./power";
export type { PowerEstimate, PowerBreakdownItem, PowerOptions } from "./power";
export { evaluateBuild, resultsForComponent } from "./engine";
export type {
  CompatibilityReport,
  CompatibilitySummary,
  EvaluateOptions,
} from "./engine";
export type {
  CompatibilityResult,
  CompatibilityStatus,
  Severity,
} from "./rules";
export { compatibilityRules } from "./rules";
export { validateComponent, validateCatalogue } from "./validate";
export type {
  ValidationError,
  ComponentValidation,
  CatalogueValidation,
} from "./validate";
export { catalogue, componentsByCategory, componentById } from "./catalogue";
