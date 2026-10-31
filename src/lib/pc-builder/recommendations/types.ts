/*
 * Guided recommendation domain model (M10.4).
 *
 * Pure types only. The recommendation engine consumes the existing catalogue,
 * compatibility engine and power estimator; it does not duplicate component
 * specifications or compatibility rules.
 *
 * Pricing note: the catalogue contains no prices. Budget values are planning
 * envelopes and every result labels price data as unverified.
 */

import type { Component, ComponentCategory } from "../types";
import type { CompatibilityStatus } from "../rules";

export type UseCase = "gaming" | "productivity" | "workstation" | "general";
export type TargetResolution = "1080p" | "1440p" | "4k" | "not-applicable";
export type PerformancePriority =
  "gpu-focused" | "cpu-focused" | "balanced" | "value-focused";
export type CpuBrandPreference = "AMD" | "Intel" | "no-preference";
export type GpuBrandPreference = "NVIDIA" | "AMD" | "no-preference";
export type CoolingPreference = "air" | "liquid" | "no-preference";
export type BuildSizePreference = "compact" | "standard" | "no-preference";
export type UpgradePreference = "high" | "balanced" | "low";

export interface RecommendationQuestionnaire {
  /** Planning budget in the supplied currency label. Must be positive. */
  budget: number;
  /**
   * Currency label only. The MVP uses "UNIT" (generic budget units) and does
   * not convert currencies or read live prices.
   */
  currency: string;
  useCase: UseCase;
  resolution: TargetResolution;
  performancePriority: PerformancePriority;
  cpuBrand: CpuBrandPreference;
  gpuBrand: GpuBrandPreference;
  cooling: CoolingPreference;
  buildSize: BuildSizePreference;
  upgradeFlexibility: UpgradePreference;
}

export interface QuestionnaireIssue {
  field: keyof RecommendationQuestionnaire | "form";
  message: string;
}

export interface QuestionnaireValidation {
  ok: boolean;
  issues: QuestionnaireIssue[];
}

export interface BudgetAllocation {
  category: ComponentCategory;
  percent: number;
  /** budget × percent, rounded; not a component price. */
  targetAmount: number;
}

export interface BudgetSummary {
  budget: number;
  currency: string;
  priceStatus: "price-unverified";
  allocations: BudgetAllocation[];
  note: string;
}

export interface SelectionSpec {
  label: string;
  value: string;
}

export interface CompatibilityFinding {
  ruleId: string;
  status: CompatibilityStatus;
  message: string;
  componentIds: string[];
  recommendation?: string;
}

export type AlternativeKind = "performance" | "value" | "brand" | "similar";

export interface AlternativeSelection {
  componentId: string;
  name: string;
  manufacturer: string;
  model: string;
  kind: AlternativeKind;
  score: number;
  tradeoff: string;
  compatibilityStatus: CompatibilityStatus;
  unknownChecks: string[];
  limitations: string[];
}

export interface ComponentSelection {
  category: ComponentCategory;
  componentId: string;
  name: string;
  manufacturer: string;
  model: string;
  keySpecs: SelectionSpec[];
  rationale: string;
  score: number;
  limitations: string[];
  compatibilityStatus: CompatibilityStatus;
  compatibilityFindings: CompatibilityFinding[];
  alternatives: AlternativeSelection[];
}

export interface ScoreDimensions {
  useCase: number;
  priority: number;
  resolution: number;
  brand: number;
  budgetPosture: number;
  upgrade: number;
  balance: number;
  confidence: number;
}

export interface RecommendationScore {
  total: number;
  dimensions: ScoreDimensions;
}

export interface CompatibilitySummary {
  status: CompatibilityStatus;
  confirmedIncompatibilities: CompatibilityFinding[];
  unknownChecks: CompatibilityFinding[];
  criticalUnknowns: CompatibilityFinding[];
  warnings: CompatibilityFinding[];
  compatibleCheckCount: number;
}

export interface PowerSummary {
  sufficientData: boolean;
  estimatedLoadW: number | null;
  recommendedPsuW: number | null;
  selectedPsuW: number | null;
  headroomW: number | null;
  headroomPercent: number | null;
  assumptions: string[];
  missingInformation: string[];
}

export interface DataConfidence {
  level: "high" | "medium" | "low";
  /** Internal 0–100 index. The UI presents bands, never a percentage. */
  index: number;
  reasons: string[];
  unknownCriticalChecks: string[];
  missingSpecifications: string[];
}

export type RecommendationStatus =
  | "recommended"
  | "recommended-with-caveats"
  | "needs-review"
  | "no-safe-recommendation"
  | "invalid-questionnaire";

export interface RecommendationSummary {
  headline: string;
  explanation: string;
  useCase: UseCase;
  resolution: TargetResolution;
  performancePriority: PerformancePriority;
  budget: number;
  currency: string;
}

export interface RecommendationResult {
  status: RecommendationStatus;
  questionnaire: RecommendationQuestionnaire;
  summary: RecommendationSummary;
  score: RecommendationScore | null;
  selections: ComponentSelection[];
  compatibility: CompatibilitySummary | null;
  power: PowerSummary | null;
  budget: BudgetSummary | null;
  confidence: DataConfidence | null;
  limitations: string[];
  unmetPreferences: string[];
  issues: QuestionnaireIssue[];
}

export interface RecommendationOptions {
  catalogue?: readonly Component[];
  /** Maximum CPU/GPU frontier sizes. Kept small to avoid combinatorial work. */
  maxCpuCandidates?: number;
  maxGpuCandidates?: number;
}
