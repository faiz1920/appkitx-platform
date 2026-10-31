/*
 * Budget allocation for guided recommendations (M10.4).
 *
 * The catalogue stores no prices. These percentages are planning priorities,
 * not market allocations. Target amounts are budget × percent and are labelled
 * price-unverified everywhere they are exposed.
 */

import { componentCategories, type ComponentCategory } from "../types";
import type {
  BudgetAllocation,
  BudgetSummary,
  PerformancePriority,
  RecommendationQuestionnaire,
  TargetResolution,
  UseCase,
} from "./types";

type Percentages = Record<ComponentCategory, number>;

const BASE_ALLOCATION: Record<UseCase, Percentages> = {
  gaming: {
    cpu: 20,
    gpu: 40,
    motherboard: 10,
    ram: 8,
    cooler: 3,
    storage: 8,
    psu: 6,
    case: 3,
    "case-fan": 2,
  },
  productivity: {
    cpu: 28,
    gpu: 15,
    motherboard: 10,
    ram: 15,
    cooler: 5,
    storage: 12,
    psu: 6,
    case: 6,
    "case-fan": 3,
  },
  workstation: {
    cpu: 30,
    gpu: 25,
    motherboard: 10,
    ram: 14,
    cooler: 4,
    storage: 9,
    psu: 4,
    case: 2,
    "case-fan": 2,
  },
  general: {
    cpu: 22,
    gpu: 22,
    motherboard: 12,
    ram: 12,
    cooler: 6,
    storage: 10,
    psu: 7,
    case: 6,
    "case-fan": 3,
  },
};

const PRIORITY_DELTAS: Record<PerformancePriority, Partial<Percentages>> = {
  "gpu-focused": { gpu: 6, cpu: -3, storage: -1, case: -1, "case-fan": -1 },
  "cpu-focused": { cpu: 6, gpu: -3, storage: -1, case: -1, "case-fan": -1 },
  balanced: {},
  "value-focused": {
    gpu: -3,
    cpu: -2,
    storage: 2,
    psu: 1,
    case: 1,
    "case-fan": 1,
  },
};

const RESOLUTION_DELTAS: Record<TargetResolution, Partial<Percentages>> = {
  "1080p": { gpu: -4, cpu: 2, storage: 1, case: 1 },
  "1440p": {},
  "4k": { gpu: 5, cpu: -3, storage: -1, case: -1 },
  "not-applicable": {},
};

function applyDeltas(
  base: Percentages,
  deltas: Partial<Percentages> | undefined,
): Percentages {
  const result = { ...base };
  if (!deltas) return result;
  for (const category of componentCategories) {
    result[category] = Math.max(0, result[category] + (deltas[category] ?? 0));
  }
  return result;
}

/** Largest-remainder rounding to integers that sum to 100. */
function normalizePercentages(values: Percentages): Percentages {
  const total = componentCategories.reduce(
    (sum, category) => sum + values[category],
    0,
  );
  if (total <= 0) {
    // Defensive fallback; valid questionnaires never reach this.
    const equal = Math.floor(100 / componentCategories.length);
    const result = Object.fromEntries(
      componentCategories.map((category) => [category, equal]),
    ) as Percentages;
    result[componentCategories[0]] += 100 - equal * componentCategories.length;
    return result;
  }

  const exact = componentCategories.map((category) => {
    const raw = (values[category] / total) * 100;
    return {
      category,
      floor: Math.floor(raw),
      fraction: raw - Math.floor(raw),
    };
  });
  let assigned = exact.reduce((sum, item) => sum + item.floor, 0);
  const ordered = [...exact].sort(
    (a, b) =>
      b.fraction - a.fraction ||
      componentCategories.indexOf(a.category) -
        componentCategories.indexOf(b.category),
  );
  const result = Object.fromEntries(
    exact.map((item) => [item.category, item.floor]),
  ) as Percentages;
  for (const item of ordered) {
    if (assigned >= 100) break;
    result[item.category] += 1;
    assigned += 1;
  }
  return result;
}

/** Target amounts are rounded budget units, not component prices. */
function allocateAmounts(
  budget: number,
  percentages: Percentages,
): BudgetAllocation[] {
  const roundedBudget = Math.max(0, Math.round(budget));
  const allocations = componentCategories.map((category) => {
    const exact = (roundedBudget * percentages[category]) / 100;
    return {
      category,
      percent: percentages[category],
      targetAmount: Math.floor(exact),
      fraction: exact - Math.floor(exact),
    };
  });
  let assigned = allocations.reduce((sum, item) => sum + item.targetAmount, 0);
  const ordered = [...allocations].sort(
    (a, b) =>
      b.fraction - a.fraction ||
      componentCategories.indexOf(a.category) -
        componentCategories.indexOf(b.category),
  );
  for (const item of ordered) {
    if (assigned >= roundedBudget) break;
    item.targetAmount += 1;
    assigned += 1;
  }
  return allocations.map(({ category, percent, targetAmount }) => ({
    category,
    percent,
    targetAmount,
  }));
}

/**
 * Allocate the budget envelope according to the selected use case, priority
 * and gaming resolution. Percentages always sum to 100.
 */
export function allocateBudget(
  questionnaire: RecommendationQuestionnaire,
): BudgetSummary {
  let percentages = applyDeltas(
    BASE_ALLOCATION[questionnaire.useCase],
    PRIORITY_DELTAS[questionnaire.performancePriority],
  );
  if (questionnaire.useCase === "gaming") {
    percentages = applyDeltas(
      percentages,
      RESOLUTION_DELTAS[questionnaire.resolution],
    );
  }
  percentages = normalizePercentages(percentages);

  return {
    budget: questionnaire.budget,
    currency: questionnaire.currency,
    priceStatus: "price-unverified",
    allocations: allocateAmounts(questionnaire.budget, percentages),
    note: "Target allocation only. The catalogue contains no component prices, so this is not a quote, a market estimate or a claim that the build fits the budget.",
  };
}

/** Pure helper used by tests and the UI. */
export function allocationPercentages(
  questionnaire: RecommendationQuestionnaire,
): Percentages {
  let percentages = applyDeltas(
    BASE_ALLOCATION[questionnaire.useCase],
    PRIORITY_DELTAS[questionnaire.performancePriority],
  );
  if (questionnaire.useCase === "gaming") {
    percentages = applyDeltas(
      percentages,
      RESOLUTION_DELTAS[questionnaire.resolution],
    );
  }
  return normalizePercentages(percentages);
}
