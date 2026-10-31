import { describe, expect, it } from "vitest";
import { catalogue } from "../src/lib/pc-builder/catalogue";
import { evaluateBuild } from "../src/lib/pc-builder/engine";
import {
  createEmptyBuild,
  selectComponent,
} from "../src/lib/pc-builder/build-state";
import {
  ALTERNATIVE_KIND_LABELS,
  CURRENCY_UNIT,
  DATA_CONFIDENCE_LABELS,
  DEFAULT_QUESTIONNAIRE,
  RECOMMENDATION_STATUS_LABELS,
  SCORING_WEIGHTS,
  allocateBudget,
  allocationPercentages,
  budgetBand,
  componentCapabilityTier,
  formatBudget,
  gpuCapabilityIndex,
  manualBuildHasSelection,
  rankCpus,
  rankGpus,
  recommendBuild,
  recommendationToBuildState,
  replaceSelectedComponent,
  scoreBuild,
  validateQuestionnaire,
  type RecommendationQuestionnaire,
  type RecommendationResult,
} from "../src/lib/pc-builder/recommendations";
import type { Component } from "../src/lib/pc-builder/types";

function questionnaire(
  overrides: Partial<RecommendationQuestionnaire> = {},
): RecommendationQuestionnaire {
  return { ...DEFAULT_QUESTIONNAIRE, ...overrides };
}

function component(id: string): Component {
  const found = catalogue.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing test component: ${id}`);
  return found;
}

function customCatalogue(ids: readonly string[]): Component[] {
  return ids.map(component);
}

function selection(result: RecommendationResult, category: string) {
  return result.selections.find((entry) => entry.category === category);
}

function selectedComponent(result: RecommendationResult, category: string) {
  const id = selection(result, category)?.componentId;
  return catalogue.find((component) => component.id === id);
}

describe("recommendation questionnaire", () => {
  it("accepts the default questionnaire", () => {
    expect(validateQuestionnaire(DEFAULT_QUESTIONNAIRE).ok).toBe(true);
  });

  it("rejects zero, negative, non-finite and excessive budgets", () => {
    for (const budget of [
      0,
      -1,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      1_000_001,
    ]) {
      const result = validateQuestionnaire(
        questionnaire({ budget } as Partial<RecommendationQuestionnaire>),
      );
      expect(result.ok).toBe(false);
      expect(result.issues.some((issue) => issue.field === "budget")).toBe(
        true,
      );
    }
  });

  it("rejects unsupported enum values at runtime", () => {
    const result = validateQuestionnaire({
      ...DEFAULT_QUESTIONNAIRE,
      useCase: "crypto-mining" as never,
      gpuBrand: "Matrox" as never,
    });
    expect(result.ok).toBe(false);
    expect(result.issues.map((issue) => issue.field)).toEqual(
      expect.arrayContaining(["useCase", "gpuBrand"]),
    );
  });
});

describe("budget allocation", () => {
  const scenarios: RecommendationQuestionnaire[] = [
    questionnaire({ useCase: "gaming", resolution: "1080p" }),
    questionnaire({ useCase: "gaming", resolution: "4k" }),
    questionnaire({ useCase: "productivity", resolution: "not-applicable" }),
    questionnaire({ useCase: "workstation", resolution: "not-applicable" }),
    questionnaire({ useCase: "general", resolution: "not-applicable" }),
    questionnaire({ performancePriority: "value-focused", budget: 800 }),
  ];

  it.each(scenarios)("allocates 100%% and the full budget envelope", (q) => {
    const percentages = allocationPercentages(q);
    expect(
      Object.values(percentages).reduce((sum, value) => sum + value, 0),
    ).toBe(100);
    expect(Object.values(percentages).every((value) => value >= 0)).toBe(true);

    const allocation = allocateBudget(q);
    expect(
      allocation.allocations.reduce(
        (sum, entry) => sum + entry.targetAmount,
        0,
      ),
    ).toBe(Math.round(q.budget));
    expect(allocation.priceStatus).toBe("price-unverified");
  });

  it("raises the gaming GPU share for 4K versus 1080p", () => {
    const hd = allocationPercentages(
      questionnaire({ useCase: "gaming", resolution: "1080p" }),
    );
    const uhd = allocationPercentages(
      questionnaire({ useCase: "gaming", resolution: "4k" }),
    );
    expect(uhd.gpu).toBeGreaterThan(hd.gpu);
    expect(uhd.cpu).toBeLessThan(hd.cpu);
  });

  it("keeps every scoring weight table at exactly 100", () => {
    for (const useCase of [
      "gaming",
      "productivity",
      "workstation",
      "general",
    ] as const) {
      expect(
        Object.values(SCORING_WEIGHTS[useCase]).reduce(
          (sum, value) => sum + value,
          0,
        ),
      ).toBe(100);
    }
  });

  it("uses documented budget band boundaries", () => {
    expect(budgetBand(questionnaire({ budget: 600 }))).toBe("entry");
    expect(budgetBand(questionnaire({ budget: 601 }))).toBe("mid");
    expect(budgetBand(questionnaire({ budget: 1200 }))).toBe("mid");
    expect(budgetBand(questionnaire({ budget: 1201 }))).toBe("upper");
    expect(budgetBand(questionnaire({ budget: 2200 }))).toBe("upper");
    expect(budgetBand(questionnaire({ budget: 2201 }))).toBe("high");
  });

  it("formats generic budget units without currency conversion", () => {
    expect(formatBudget(1500, CURRENCY_UNIT)).toBe("1,500 budget units");
    expect(formatBudget(1500, "USD")).toBe("1,500 USD");
  });
});

describe("recommendation engine", () => {
  it("builds a complete deterministic gaming recommendation", () => {
    const q = questionnaire({
      useCase: "gaming",
      resolution: "1440p",
      budget: 1400,
    });
    const first = recommendBuild(q);
    const second = recommendBuild(q);

    expect(first.status).not.toBe("invalid-questionnaire");
    expect(first.status).not.toBe("no-safe-recommendation");
    expect(first.selections).toHaveLength(9);
    expect(new Set(first.selections.map((entry) => entry.category)).size).toBe(
      9,
    );
    expect(
      new Set(first.selections.map((entry) => entry.componentId)).size,
    ).toBe(9);

    for (const entry of first.selections) {
      expect(entry.rationale.length).toBeGreaterThan(20);
      expect(entry.keySpecs.length).toBeGreaterThan(0);
      expect(entry.componentId).toMatch(/^[a-z0-9-]+$/);
    }

    expect(first.compatibility?.status).not.toBe("incompatible");
    expect(first.power?.sufficientData).toBe(true);
    expect(first.power?.estimatedLoadW).toBeGreaterThan(0);
    expect(first.budget?.priceStatus).toBe("price-unverified");
    expect(first.confidence?.index).toBeGreaterThan(0);
    expect(first.summary.explanation).not.toMatch(/\bFPS\b/i);

    expect(second).toEqual(first);
  });

  it("is independent of catalogue order", () => {
    const q = questionnaire({ budget: 1600 });
    const forward = recommendBuild(q, { catalogue });
    const reverse = recommendBuild(q, {
      catalogue: [...catalogue].reverse(),
    });
    expect(reverse.selections.map((entry) => entry.componentId)).toEqual(
      forward.selections.map((entry) => entry.componentId),
    );
  });

  it("uses evaluateBuild for final compatibility and power", () => {
    const result = recommendBuild(questionnaire({ budget: 1500 }));
    const selected = result.selections
      .map((entry) =>
        catalogue.find((component) => component.id === entry.componentId),
      )
      .filter(
        (component): component is NonNullable<typeof component> =>
          component !== undefined,
      );
    const report = evaluateBuild(selected);
    expect(result.compatibility?.status).toBe(report.summary.status);
    expect(result.power?.estimatedLoadW).toBe(report.power.loadWatts);
    expect(result.power?.recommendedPsuW).toBe(report.power.recommendedPsuW);
  });

  it("selects more GPU capability for 4K than 1080p gaming", () => {
    const hd = recommendBuild(
      questionnaire({ useCase: "gaming", resolution: "1080p", budget: 1200 }),
    );
    const uhd = recommendBuild(
      questionnaire({ useCase: "gaming", resolution: "4k", budget: 2200 }),
    );
    const hdGpu = selectedComponent(hd, "gpu");
    const uhdGpu = selectedComponent(uhd, "gpu");
    expect(hdGpu?.category).toBe("gpu");
    expect(uhdGpu?.category).toBe("gpu");
    if (hdGpu?.category === "gpu" && uhdGpu?.category === "gpu") {
      expect(gpuCapabilityIndex(uhdGpu)).toBeGreaterThan(
        gpuCapabilityIndex(hdGpu),
      );
    }
  });

  it("honours CPU and GPU brand preferences", () => {
    const result = recommendBuild(
      questionnaire({
        budget: 2000,
        cpuBrand: "AMD",
        gpuBrand: "NVIDIA",
        useCase: "gaming",
        resolution: "1440p",
      }),
    );
    expect(selectedComponent(result, "cpu")?.manufacturer).toBe("AMD");
    expect(selectedComponent(result, "gpu")?.manufacturer).toBe("NVIDIA");
  });

  it("keeps working and reports an unmet preference when a brand is unavailable", () => {
    const withoutNvidia = catalogue.filter(
      (component) =>
        component.category !== "gpu" || component.manufacturer !== "NVIDIA",
    );
    const result = recommendBuild(
      questionnaire({ gpuBrand: "NVIDIA", budget: 1500 }),
      { catalogue: withoutNvidia },
    );
    expect(result.status).not.toBe("invalid-questionnaire");
    expect(result.status).not.toBe("no-safe-recommendation");
    expect(result.selections.length).toBe(9);
    expect(result.unmetPreferences.join(" ")).toMatch(
      /NVIDIA GPU was preferred/i,
    );
  });

  it("honours air and liquid cooling preferences", () => {
    const air = recommendBuild(questionnaire({ cooling: "air", budget: 1500 }));
    const liquid = recommendBuild(
      questionnaire({ cooling: "liquid", budget: 1500 }),
    );
    const airCooler = selectedComponent(air, "cooler");
    const liquidCooler = selectedComponent(liquid, "cooler");
    expect(airCooler?.category).toBe("cooler");
    expect(liquidCooler?.category).toBe("cooler");
    if (airCooler?.category === "cooler") {
      expect(airCooler.specs.type).toBe("air");
    }
    if (liquidCooler?.category === "cooler") {
      expect(liquidCooler.specs.type).toBe("aio-liquid");
    }
  });

  it("honours a compact build preference where the catalogue permits", () => {
    const result = recommendBuild(
      questionnaire({ buildSize: "compact", budget: 1500 }),
    );
    const pcCase = selectedComponent(result, "case");
    expect(pcCase?.category).toBe("case");
    if (pcCase?.category === "case") {
      expect(["sff", "mini-tower", "mid-tower"]).toContain(
        pcCase.specs.caseType,
      );
    }
  });

  it("changes CPU emphasis between gaming and productivity", () => {
    const gaming = recommendBuild(
      questionnaire({ useCase: "gaming", resolution: "1440p", budget: 1500 }),
    );
    const productivity = recommendBuild(
      questionnaire({
        useCase: "productivity",
        resolution: "not-applicable",
        budget: 1500,
      }),
    );
    const gamingCpu = selectedComponent(gaming, "cpu");
    const productivityCpu = selectedComponent(productivity, "cpu");
    expect(gamingCpu?.category).toBe("cpu");
    expect(productivityCpu?.category).toBe("cpu");
    if (gamingCpu?.category === "cpu" && productivityCpu?.category === "cpu") {
      expect(productivityCpu.specs.cores ?? 0).toBeGreaterThanOrEqual(
        gamingCpu.specs.cores ?? 0,
      );
    }
  });

  it("uses the budget band to change component capability", () => {
    const entry = recommendBuild(
      questionnaire({
        useCase: "general",
        budget: 500,
        resolution: "not-applicable",
      }),
    );
    const high = recommendBuild(
      questionnaire({
        useCase: "general",
        budget: 3000,
        resolution: "not-applicable",
      }),
    );
    const entryGpu = selectedComponent(entry, "gpu");
    const highGpu = selectedComponent(high, "gpu");
    expect(entryGpu?.category).toBe("gpu");
    expect(highGpu?.category).toBe("gpu");
    if (entryGpu?.category === "gpu" && highGpu?.category === "gpu") {
      expect(gpuCapabilityIndex(highGpu)).toBeGreaterThan(
        gpuCapabilityIndex(entryGpu),
      );
    }
  });

  it("returns invalid-questionnaire for an invalid budget", () => {
    const result = recommendBuild(questionnaire({ budget: -5 }));
    expect(result.status).toBe("invalid-questionnaire");
    expect(result.issues.some((issue) => issue.field === "budget")).toBe(true);
    expect(result.selections).toEqual([]);
  });

  it("returns no-safe-recommendation for an empty catalogue", () => {
    const result = recommendBuild(questionnaire(), { catalogue: [] });
    expect(result.status).toBe("no-safe-recommendation");
    expect(result.selections).toEqual([]);
    expect(result.limitations.join(" ")).toMatch(/catalogue is empty/i);
  });

  it("returns no-safe-recommendation when required categories are missing", () => {
    const incomplete = catalogue.filter(
      (component) =>
        component.category === "cpu" || component.category === "gpu",
    );
    const result = recommendBuild(questionnaire(), { catalogue: incomplete });
    expect(result.status).toBe("no-safe-recommendation");
    expect(result.selections).toEqual([]);
  });

  it("keeps critical Unknown checks visible instead of treating them as compatible", () => {
    const result = recommendBuild(
      questionnaire({ cpuBrand: "AMD", budget: 1800 }),
    );
    expect(result.compatibility?.criticalUnknowns.length).toBeGreaterThan(0);
    expect(result.status).toBe("needs-review");
    expect(result.confidence?.unknownCriticalChecks.length).toBeGreaterThan(0);
    expect(
      result.selections.some((entry) => entry.alternatives.length > 0),
    ).toBe(true);
  });

  it("ranks no-critical-Unknown candidates above a higher-scoring critical-Unknown candidate", () => {
    const pool = customCatalogue([
      "cpu-amd-ryzen-9-7950x",
      "cpu-intel-core-i5-12400f",
      "motherboard-msi-mpg-x670e-carbon-wifi",
      "motherboard-asus-prime-b760-plus-d4",
      "ram-corsair-vengeance-32gb-ddr5-6000",
      "ram-corsair-vengeance-lpx-32gb-ddr4-3200",
      "gpu-nvidia-geforce-rtx-4070-fe",
      "cooler-noctua-nh-d15",
      "storage-samsung-990-pro-1tb",
      "psu-corsair-rm850e-2023",
      "case-corsair-5000d-airflow",
      "case-fan-noctua-nf-a12x25-pwm",
    ]);
    const q = questionnaire({
      useCase: "workstation",
      resolution: "not-applicable",
      budget: 3000,
      performancePriority: "balanced",
    });
    const allocation = allocateBudget(q).allocations;
    const common = [
      component("gpu-nvidia-geforce-rtx-4070-fe"),
      component("cooler-noctua-nh-d15"),
      component("storage-samsung-990-pro-1tb"),
      component("psu-corsair-rm850e-2023"),
      component("case-corsair-5000d-airflow"),
      component("case-fan-noctua-nf-a12x25-pwm"),
    ];
    const amdComponents = [
      component("cpu-amd-ryzen-9-7950x"),
      component("motherboard-msi-mpg-x670e-carbon-wifi"),
      component("ram-corsair-vengeance-32gb-ddr5-6000"),
      ...common,
    ];
    const intelComponents = [
      component("cpu-intel-core-i5-12400f"),
      component("motherboard-asus-prime-b760-plus-d4"),
      component("ram-corsair-vengeance-lpx-32gb-ddr4-3200"),
      ...common,
    ];
    const amdReport = evaluateBuild(amdComponents);
    const intelReport = evaluateBuild(intelComponents);
    const amdScore = scoreBuild(amdComponents, q, amdReport, allocation);
    const intelScore = scoreBuild(intelComponents, q, intelReport, allocation);

    expect(amdReport.summary.status).not.toBe("incompatible");
    expect(intelReport.summary.status).not.toBe("incompatible");
    expect(
      amdReport.results.some(
        (result) =>
          result.status === "unknown" &&
          result.ruleId === "cpu-motherboard-chipset",
      ),
    ).toBe(true);
    expect(
      intelReport.results.some(
        (result) =>
          result.status === "unknown" &&
          result.ruleId === "cpu-motherboard-chipset",
      ),
    ).toBe(false);
    expect(amdScore.total).toBeGreaterThan(intelScore.total);

    const result = recommendBuild(q, { catalogue: pool });
    expect(selection(result, "cpu")?.componentId).toBe(
      "cpu-intel-core-i5-12400f",
    );
    expect(result.compatibility?.criticalUnknowns).toEqual([]);
    expect(result.compatibility?.unknownChecks.length).toBeGreaterThan(0);
    expect(result.status).toBe("recommended-with-caveats");
  });

  it("returns the best needs-review candidate when no fully verified candidate exists", () => {
    const pool = customCatalogue([
      "cpu-amd-ryzen-9-7950x",
      "motherboard-msi-mpg-x670e-carbon-wifi",
      "ram-corsair-vengeance-32gb-ddr5-6000",
      "gpu-nvidia-geforce-rtx-4070-fe",
      "cooler-noctua-nh-d15",
      "storage-samsung-990-pro-1tb",
      "psu-corsair-rm850e-2023",
      "case-corsair-5000d-airflow",
      "case-fan-noctua-nf-a12x25-pwm",
    ]);
    const result = recommendBuild(
      questionnaire({
        useCase: "workstation",
        resolution: "not-applicable",
        budget: 2200,
      }),
      { catalogue: pool },
    );
    expect(result.status).toBe("needs-review");
    expect(result.selections.length).toBe(9);
    expect(result.compatibility?.confirmedIncompatibilities).toEqual([]);
    expect(
      result.compatibility?.criticalUnknowns.some(
        (finding) => finding.ruleId === "cpu-motherboard-chipset",
      ),
    ).toBe(true);
  });

  it("uses weighted scoring within the needs-review group", () => {
    const pool = customCatalogue([
      "cpu-amd-ryzen-9-7950x",
      "cpu-amd-ryzen-7-5800x3d",
      "motherboard-msi-mpg-x670e-carbon-wifi",
      "motherboard-msi-b550-a-pro",
      "ram-corsair-vengeance-32gb-ddr5-6000",
      "ram-corsair-vengeance-lpx-32gb-ddr4-3200",
      "gpu-nvidia-geforce-rtx-4070-fe",
      "cooler-noctua-nh-d15",
      "storage-samsung-990-pro-1tb",
      "psu-corsair-rm850e-2023",
      "case-corsair-5000d-airflow",
      "case-fan-noctua-nf-a12x25-pwm",
    ]);
    const q = questionnaire({
      useCase: "workstation",
      resolution: "not-applicable",
      budget: 2200,
    });
    const allocation = allocateBudget(q).allocations;
    const common = [
      component("gpu-nvidia-geforce-rtx-4070-fe"),
      component("cooler-noctua-nh-d15"),
      component("storage-samsung-990-pro-1tb"),
      component("psu-corsair-rm850e-2023"),
      component("case-corsair-5000d-airflow"),
      component("case-fan-noctua-nf-a12x25-pwm"),
    ];
    const highComponents = [
      component("cpu-amd-ryzen-9-7950x"),
      component("motherboard-msi-mpg-x670e-carbon-wifi"),
      component("ram-corsair-vengeance-32gb-ddr5-6000"),
      ...common,
    ];
    const lowComponents = [
      component("cpu-amd-ryzen-7-5800x3d"),
      component("motherboard-msi-b550-a-pro"),
      component("ram-corsair-vengeance-lpx-32gb-ddr4-3200"),
      ...common,
    ];
    const highReport = evaluateBuild(highComponents);
    const lowReport = evaluateBuild(lowComponents);
    expect(
      highReport.results.some(
        (result) =>
          result.status === "unknown" &&
          result.ruleId === "cpu-motherboard-chipset",
      ),
    ).toBe(true);
    expect(
      lowReport.results.some(
        (result) =>
          result.status === "unknown" &&
          result.ruleId === "cpu-motherboard-chipset",
      ),
    ).toBe(true);
    expect(
      scoreBuild(highComponents, q, highReport, allocation).total,
    ).toBeGreaterThan(
      scoreBuild(lowComponents, q, lowReport, allocation).total,
    );

    const result = recommendBuild(q, { catalogue: pool });
    expect(result.status).toBe("needs-review");
    expect(selection(result, "cpu")?.componentId).toBe("cpu-amd-ryzen-9-7950x");
  });

  it("never returns a confirmed incompatible candidate", () => {
    const pool = customCatalogue([
      "cpu-intel-core-i5-14600k",
      "motherboard-asus-prime-b760-plus-d4",
      "ram-corsair-vengeance-lpx-32gb-ddr4-3200",
      "gpu-nvidia-geforce-rtx-4090-fe",
      "cooler-noctua-nh-d15",
      "storage-samsung-990-pro-1tb",
      "psu-corsair-cv650",
      "case-corsair-5000d-airflow",
      "case-fan-noctua-nf-a12x25-pwm",
    ]);
    expect(evaluateBuild(pool).summary.status).toBe("incompatible");

    const result = recommendBuild(
      questionnaire({
        useCase: "gaming",
        resolution: "4k",
        budget: 3000,
      }),
      { catalogue: pool },
    );
    expect(result.status).toBe("no-safe-recommendation");
    expect(result.selections).toEqual([]);
  });

  it("flags missing critical clearance data instead of assuming it fits", () => {
    const gpu = catalogue.find(
      (component) => component.id === "gpu-amd-radeon-rx-7800-xt",
    );
    expect(gpu?.category).toBe("gpu");
    if (gpu?.category !== "gpu") return;
    const modifiedGpu = {
      ...gpu,
      specs: { ...gpu.specs, lengthMm: null, slotWidth: null },
    };
    const customCatalogue = [
      ...catalogue.filter((component) => component.category !== "gpu"),
      modifiedGpu,
    ];
    const result = recommendBuild(questionnaire({ budget: 1800 }), {
      catalogue: customCatalogue,
    });
    expect(result.status).toBe("needs-review");
    expect(
      result.compatibility?.criticalUnknowns.some(
        (finding) => finding.ruleId === "gpu-case-length",
      ),
    ).toBe(true);
    expect(result.confidence?.missingSpecifications).toContain("GPU length");
  });

  it("does not fabricate prices or benchmark claims", () => {
    const result = recommendBuild(questionnaire({ budget: 1234 }));
    expect(result.budget?.priceStatus).toBe("price-unverified");
    expect(result.budget?.note).toMatch(/no component prices/i);
    expect(result.summary.explanation).toMatch(/price|budget/i);
    expect(result.limitations.join(" ")).toMatch(/no benchmark database/i);
    expect(result.summary.explanation).not.toMatch(/fps|frame rate/i);
    expect(result.selections.every((entry) => !("price" in entry))).toBe(true);
  });
});

describe("recommendation alternatives", () => {
  it("offers only compatible alternatives and recalculates after replacement", () => {
    const result = recommendBuild(
      questionnaire({ useCase: "gaming", resolution: "1440p", budget: 1600 }),
    );
    const gpu = selection(result, "gpu");
    expect(gpu).toBeDefined();
    expect(gpu!.alternatives.length).toBeGreaterThan(0);
    expect(
      gpu!.alternatives.every(
        (alt) => alt.compatibilityStatus !== "incompatible",
      ),
    ).toBe(true);

    const alternative = gpu!.alternatives[0];
    const replaced = replaceSelectedComponent(
      result,
      "gpu",
      alternative.componentId,
    );
    expect(selection(replaced, "gpu")?.componentId).toBe(
      alternative.componentId,
    );
    expect(replaced.compatibility?.status).not.toBe("incompatible");
    expect(replaced.power?.estimatedLoadW).not.toBeNull();
    expect(replaced.budget?.priceStatus).toBe("price-unverified");
  });

  it("returns the original result when the replacement is unknown or incompatible", () => {
    const result = recommendBuild(questionnaire({ budget: 1500 }));
    expect(replaceSelectedComponent(result, "gpu", "does-not-exist")).toBe(
      result,
    );
    expect(
      replaceSelectedComponent(result, "cpu", "cpu-amd-ryzen-5-5600"),
    ).toBe(result);
  });

  it("exposes alternatives for more than one category", () => {
    const result = recommendBuild(questionnaire({ budget: 1800 }));
    const categoriesWithAlternatives = result.selections.filter(
      (entry) => entry.alternatives.length > 0,
    );
    expect(categoriesWithAlternatives.length).toBeGreaterThanOrEqual(3);
  });
});

describe("manual builder transfer", () => {
  it("maps recommendation selections into the existing build state", () => {
    const result = recommendBuild(questionnaire({ budget: 1500 }));
    const state = recommendationToBuildState(result);
    for (const entry of result.selections) {
      expect(state.selected[entry.category as never]).toContain(
        entry.componentId,
      );
    }
    expect(manualBuildHasSelection(state)).toBe(true);
  });

  it("detects an existing manual build before transfer", () => {
    let state = createEmptyBuild();
    expect(manualBuildHasSelection(state)).toBe(false);
    state = selectComponent(state, "cpu", "cpu-intel-core-i5-14600k");
    expect(manualBuildHasSelection(state)).toBe(true);
  });

  it("reuses the manual single-slot replacement semantics", () => {
    const state = recommendationToBuildState(
      recommendBuild(questionnaire({ budget: 1500 })),
    );
    const replaced = selectComponent(state, "gpu", "gpu-amd-radeon-rx-7600");
    expect(replaced.selected.gpu).toEqual(["gpu-amd-radeon-rx-7600"]);
  });
});

describe("recommendation scoring helpers", () => {
  it("exposes stable category capability tiers", () => {
    const result = recommendBuild(questionnaire({ budget: 1500 }));
    const map = Object.fromEntries(
      result.selections
        .map((entry) => [
          entry.category,
          catalogue.find((component) => component.id === entry.componentId),
        ])
        .filter(([, component]) => component !== undefined),
    );
    const gpu = map.gpu;
    expect(gpu?.category).toBe("gpu");
    if (gpu?.category === "gpu") {
      const tier = componentCapabilityTier(gpu, map, questionnaire());
      expect(tier).toBeGreaterThan(0);
      expect(tier).toBeLessThanOrEqual(100);
    }
  });

  it("exposes stable presentation labels", () => {
    expect(RECOMMENDATION_STATUS_LABELS["no-safe-recommendation"]).toBe(
      "No safe recommendation",
    );
    expect(DATA_CONFIDENCE_LABELS.high).toBe("High data confidence");
    expect(ALTERNATIVE_KIND_LABELS.performance).toContain("Performance");
  });

  it("ranks CPUs and GPUs deterministically", () => {
    const q = questionnaire({ budget: 1500 });
    expect(rankCpus(catalogue, q).map((c) => c.id)).toEqual(
      rankCpus(catalogue, q).map((c) => c.id),
    );
    expect(rankGpus(catalogue, q).map((c) => c.id)).toEqual(
      rankGpus(catalogue, q).map((c) => c.id),
    );
  });
});
