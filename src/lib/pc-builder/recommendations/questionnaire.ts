/*
 * Typed questionnaire model, defaults and validation (M10.4).
 *
 * Pure domain code: no DOM, no I/O. The UI maps form controls onto this model
 * and calls validateQuestionnaire before running the recommendation engine.
 */

import type {
  BuildSizePreference,
  CoolingPreference,
  CpuBrandPreference,
  GpuBrandPreference,
  PerformancePriority,
  QuestionnaireIssue,
  QuestionnaireValidation,
  RecommendationQuestionnaire,
  TargetResolution,
  UpgradePreference,
  UseCase,
} from "./types";

export const CURRENCY_UNIT = "UNIT";
export const CURRENCY_UNIT_LABEL = "Budget units";
export const MAX_BUDGET = 1_000_000;

export const DEFAULT_QUESTIONNAIRE: RecommendationQuestionnaire = {
  budget: 1200,
  currency: CURRENCY_UNIT,
  useCase: "gaming",
  resolution: "1440p",
  performancePriority: "balanced",
  cpuBrand: "no-preference",
  gpuBrand: "no-preference",
  cooling: "no-preference",
  buildSize: "standard",
  upgradeFlexibility: "balanced",
};

export interface QuestionnaireOption<T extends string> {
  value: T;
  label: string;
  description: string;
}

export const USE_CASE_OPTIONS: readonly QuestionnaireOption<UseCase>[] = [
  {
    value: "gaming",
    label: "Gaming",
    description: "Prioritises graphics capability and a balanced CPU.",
  },
  {
    value: "productivity",
    label: "Productivity",
    description: "Prioritises CPU performance and memory capacity.",
  },
  {
    value: "workstation",
    label: "Workstation",
    description: "Prioritises CPU, memory and GPU capability together.",
  },
  {
    value: "general",
    label: "General purpose",
    description: "Balances capability, cost posture and upgrade room.",
  },
];

export const RESOLUTION_OPTIONS: readonly QuestionnaireOption<TargetResolution>[] =
  [
    { value: "1080p", label: "1080p", description: "Full HD gaming." },
    { value: "1440p", label: "1440p", description: "QHD gaming." },
    { value: "4k", label: "4K", description: "Ultra HD gaming." },
    {
      value: "not-applicable",
      label: "Not applicable",
      description: "No resolution target; use general priorities.",
    },
  ];

export const PERFORMANCE_PRIORITY_OPTIONS: readonly QuestionnaireOption<PerformancePriority>[] =
  [
    {
      value: "gpu-focused",
      label: "GPU-focused",
      description: "Spend more capability on graphics.",
    },
    {
      value: "cpu-focused",
      label: "CPU-focused",
      description: "Spend more capability on the processor.",
    },
    {
      value: "balanced",
      label: "Balanced",
      description: "Keep processor and graphics capability proportionate.",
    },
    {
      value: "value-focused",
      label: "Value-focused",
      description: "Aim near the capability target without large overshoot.",
    },
  ];

export const CPU_BRAND_OPTIONS: readonly QuestionnaireOption<CpuBrandPreference>[] =
  [
    {
      value: "no-preference",
      label: "No preference",
      description: "Any CPU brand.",
    },
    { value: "AMD", label: "AMD", description: "Prefer an AMD processor." },
    {
      value: "Intel",
      label: "Intel",
      description: "Prefer an Intel processor.",
    },
  ];

export const GPU_BRAND_OPTIONS: readonly QuestionnaireOption<GpuBrandPreference>[] =
  [
    {
      value: "no-preference",
      label: "No preference",
      description: "Any graphics card brand.",
    },
    {
      value: "NVIDIA",
      label: "NVIDIA",
      description: "Prefer NVIDIA graphics.",
    },
    { value: "AMD", label: "AMD", description: "Prefer AMD graphics." },
  ];

export const COOLING_OPTIONS: readonly QuestionnaireOption<CoolingPreference>[] =
  [
    {
      value: "no-preference",
      label: "No preference",
      description: "Choose the best compatible cooler.",
    },
    {
      value: "air",
      label: "Air cooling",
      description: "Prefer an air cooler.",
    },
    {
      value: "liquid",
      label: "Liquid cooling",
      description: "Prefer an all-in-one liquid cooler.",
    },
  ];

export const BUILD_SIZE_OPTIONS: readonly QuestionnaireOption<BuildSizePreference>[] =
  [
    {
      value: "no-preference",
      label: "No preference",
      description: "Any case size the parts fit.",
    },
    {
      value: "standard",
      label: "Standard",
      description: "Prefer a standard mid-tower or larger case.",
    },
    {
      value: "compact",
      label: "Compact",
      description: "Prefer a smaller case when the parts fit.",
    },
  ];

export const UPGRADE_OPTIONS: readonly QuestionnaireOption<UpgradePreference>[] =
  [
    {
      value: "balanced",
      label: "Balanced",
      description: "Reasonable room for future changes.",
    },
    {
      value: "high",
      label: "High",
      description: "Favour more memory slots, storage and PSU headroom.",
    },
    {
      value: "low",
      label: "Low",
      description: "Focus on the current build; less future capacity.",
    },
  ];

const USE_CASES = new Set<UseCase>(
  USE_CASE_OPTIONS.map((option) => option.value),
);
const RESOLUTIONS = new Set<TargetResolution>(
  RESOLUTION_OPTIONS.map((option) => option.value),
);
const PERFORMANCE_PRIORITIES = new Set<PerformancePriority>(
  PERFORMANCE_PRIORITY_OPTIONS.map((option) => option.value),
);
const CPU_BRANDS = new Set<CpuBrandPreference>(
  CPU_BRAND_OPTIONS.map((option) => option.value),
);
const GPU_BRANDS = new Set<GpuBrandPreference>(
  GPU_BRAND_OPTIONS.map((option) => option.value),
);
const COOLING = new Set<CoolingPreference>(
  COOLING_OPTIONS.map((option) => option.value),
);
const BUILD_SIZES = new Set<BuildSizePreference>(
  BUILD_SIZE_OPTIONS.map((option) => option.value),
);
const UPGRADE_PREFERENCES = new Set<UpgradePreference>(
  UPGRADE_OPTIONS.map((option) => option.value),
);

function invalid(
  field: QuestionnaireIssue["field"],
  message: string,
): QuestionnaireIssue {
  return { field, message };
}

/**
 * Validate a questionnaire. The input is typed for callers but checked at
 * runtime so form data cannot bypass the constraints.
 */
export function validateQuestionnaire(
  input: RecommendationQuestionnaire,
): QuestionnaireValidation {
  const issues: QuestionnaireIssue[] = [];
  const record = input as unknown as Record<string, unknown>;

  const budget = record.budget;
  if (
    typeof budget !== "number" ||
    !Number.isFinite(budget) ||
    budget <= 0 ||
    budget > MAX_BUDGET
  ) {
    issues.push(
      invalid(
        "budget",
        `Enter a budget greater than 0 and no more than ${MAX_BUDGET.toLocaleString("en")}.`,
      ),
    );
  }

  const currency = record.currency;
  if (
    typeof currency !== "string" ||
    currency.trim() === "" ||
    currency.trim().length > 16
  ) {
    issues.push(invalid("currency", "Choose a currency label."));
  }

  if (!USE_CASES.has(record.useCase as UseCase)) {
    issues.push(invalid("useCase", "Choose a supported primary use case."));
  }
  if (!RESOLUTIONS.has(record.resolution as TargetResolution)) {
    issues.push(invalid("resolution", "Choose a supported resolution."));
  }
  if (
    !PERFORMANCE_PRIORITIES.has(
      record.performancePriority as PerformancePriority,
    )
  ) {
    issues.push(
      invalid(
        "performancePriority",
        "Choose a supported performance priority.",
      ),
    );
  }
  if (!CPU_BRANDS.has(record.cpuBrand as CpuBrandPreference)) {
    issues.push(invalid("cpuBrand", "Choose a supported CPU preference."));
  }
  if (!GPU_BRANDS.has(record.gpuBrand as GpuBrandPreference)) {
    issues.push(invalid("gpuBrand", "Choose a supported GPU preference."));
  }
  if (!COOLING.has(record.cooling as CoolingPreference)) {
    issues.push(invalid("cooling", "Choose a supported cooling preference."));
  }
  if (!BUILD_SIZES.has(record.buildSize as BuildSizePreference)) {
    issues.push(invalid("buildSize", "Choose a supported build size."));
  }
  if (
    !UPGRADE_PREFERENCES.has(record.upgradeFlexibility as UpgradePreference)
  ) {
    issues.push(
      invalid("upgradeFlexibility", "Choose a supported upgrade preference."),
    );
  }

  return { ok: issues.length === 0, issues };
}

/** Format a budget in its label context without implying a live price. */
export function formatBudget(amount: number, currency: string): string {
  const rounded = Math.round(amount).toLocaleString("en");
  return currency === CURRENCY_UNIT
    ? `${rounded} ${CURRENCY_UNIT_LABEL.toLowerCase()}`
    : `${rounded} ${currency}`;
}
