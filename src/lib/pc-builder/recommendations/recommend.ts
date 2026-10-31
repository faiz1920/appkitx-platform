/*
 * Guided recommendation engine (M10.4).
 *
 * Pipeline:
 * questionnaire validation → candidate filtering/ranking → bounded build
 * assembly → evaluateBuild() → score → explanations → alternatives.
 *
 * Determinism: all rankings use score desc + component id asc as the
 * tie-breaker. No randomness, no network, no clock.
 *
 * Compatibility: evaluateBuild() is the final authority. Known incompatible
 * builds are rejected; Unknown checks are surfaced and never treated as
 * compatible.
 */

import { catalogue as defaultCatalogue } from "../catalogue";
import { evaluateBuild, type CompatibilityReport } from "../engine";
import type { CompatibilityStatus } from "../rules";
import { estimateBuildPower } from "../power";
import {
  componentCategories,
  type Component,
  type ComponentCategory,
  type CoolerComponent,
  type CpuComponent,
  type GpuComponent,
  type MotherboardComponent,
  type PsuComponent,
  type CaseComponent,
} from "../types";
import { allocateBudget } from "./budget";
import {
  rankCases,
  rankCoolers,
  rankCpus,
  rankFans,
  rankGpus,
  rankMotherboards,
  rankPsus,
  rankRam,
  rankStorage,
} from "./candidates";
import {
  alternativeKind,
  alternativeTradeoff,
  buildExplanation,
  buildHeadline,
  keySpecsFor,
  limitationsFor,
  overallLimitations,
  rationaleFor,
  unmetPreferences,
} from "./explanations";
import { validateQuestionnaire } from "./questionnaire";
import {
  availabilityScore,
  clamp,
  criticalMissingSpecifications,
  round1,
  scoreBuild,
  scoreCaseCandidate,
  scoreCoolerCandidate,
  scoreCpuCandidate,
  scoreFanCandidate,
  scoreGpuCandidate,
  scoreMotherboardCandidate,
  scorePsuCandidate,
  scoreRamCandidate,
  scoreStorageCandidate,
  componentCapabilityTier,
} from "./scoring";
import type {
  AlternativeSelection,
  BudgetSummary,
  CompatibilityFinding,
  CompatibilitySummary,
  ComponentSelection,
  DataConfidence,
  PowerSummary,
  RecommendationOptions,
  RecommendationQuestionnaire,
  RecommendationResult,
  RecommendationScore,
  RecommendationStatus,
} from "./types";

interface CandidateBuild {
  components: Component[];
  report: CompatibilityReport;
  score: RecommendationScore;
  key: string;
}

/**
 * Rules whose Unknown verdict can invalidate the build. BIOS and GPU slot
 * thickness are deliberately excluded from this hard set: the schema stores a
 * single board-level BIOS value and cases generally do not publish slot
 * thickness. They remain visible caveats, not silent passes.
 */
export const CRITICAL_UNKNOWN_RULES = new Set([
  "cpu-motherboard-socket",
  "cpu-motherboard-chipset",
  "ram-generation",
  "ram-form-factor",
  "ram-capacity",
  "ram-slot-count",
  "gpu-case-length",
  "cooler-cpu-socket",
  "cooler-case-height",
  "cooler-case-radiator",
  "motherboard-case-form-factor",
  "psu-wattage",
  "psu-gpu-connectors",
  "psu-case-form-factor",
  "psu-case-length",
  "storage-motherboard-m2",
  "storage-motherboard-sata",
]);

const CORE_CATEGORIES: readonly ComponentCategory[] = [
  "cpu",
  "gpu",
  "motherboard",
  "ram",
  "cooler",
  "storage",
  "psu",
  "case",
];

function categoryMap(
  components: readonly Component[],
): Partial<Record<ComponentCategory, Component>> {
  const map: Partial<Record<ComponentCategory, Component>> = {};
  for (const component of components) {
    if (map[component.category] === undefined) {
      map[component.category] = component;
    }
  }
  return map;
}

function buildKey(components: readonly Component[]): string {
  return components
    .map((component) => component.id)
    .sort((a, b) => a.localeCompare(b, "en"))
    .join("|");
}

function worstStatus(
  findings: readonly CompatibilityFinding[],
): CompatibilityStatus {
  if (findings.some((finding) => finding.status === "incompatible")) {
    return "incompatible";
  }
  if (findings.some((finding) => finding.status === "warning")) {
    return "warning";
  }
  if (findings.some((finding) => finding.status === "unknown")) {
    return "unknown";
  }
  if (findings.some((finding) => finding.status === "compatible")) {
    return "compatible";
  }
  return "unknown";
}

function toFinding(
  result: CompatibilityReport["results"][number],
): CompatibilityFinding {
  return {
    ruleId: result.ruleId,
    status: result.status,
    message: result.message,
    componentIds: [...result.componentIds],
    recommendation: result.recommendation,
  };
}

function summarizeCompatibility(
  report: CompatibilityReport,
): CompatibilitySummary {
  const findings = report.results.map(toFinding);
  const unknownChecks = findings.filter(
    (finding) => finding.status === "unknown",
  );
  return {
    status: report.summary.status,
    confirmedIncompatibilities: findings.filter(
      (finding) => finding.status === "incompatible",
    ),
    unknownChecks,
    criticalUnknowns: unknownChecks.filter((finding) =>
      CRITICAL_UNKNOWN_RULES.has(finding.ruleId),
    ),
    warnings: findings.filter((finding) => finding.status === "warning"),
    compatibleCheckCount: findings.filter(
      (finding) => finding.status === "compatible",
    ).length,
  };
}

function summarizePower(
  report: CompatibilityReport,
  psu: PsuComponent | undefined,
): PowerSummary {
  const selectedPsuW = psu?.specs.wattage ?? null;
  const recommended = report.power.recommendedPsuW;
  const headroomW =
    selectedPsuW !== null && recommended !== null
      ? selectedPsuW - recommended
      : null;
  const headroomPercent =
    headroomW !== null && recommended !== null && recommended > 0
      ? round1((headroomW / recommended) * 100)
      : null;
  const missingInformation = report.power.assumptions.filter((assumption) =>
    /unknown|missing|excluded|cannot/i.test(assumption),
  );
  if (!report.power.sufficientData) {
    missingInformation.push(
      "CPU or GPU power data is incomplete, so load and PSU sizing cannot be fully verified.",
    );
  }
  if (
    psu &&
    (psu.specs.connectors.pcie8pin === null ||
      psu.specs.connectors.pcie16pin === null)
  ) {
    missingInformation.push(
      "The selected PSU's complete PCIe connector inventory is not published.",
    );
  }
  return {
    sufficientData: report.power.sufficientData,
    estimatedLoadW: report.power.loadWatts,
    recommendedPsuW: recommended,
    selectedPsuW,
    headroomW,
    headroomPercent,
    assumptions: [...report.power.assumptions],
    missingInformation: [...new Set(missingInformation)],
  };
}

function dataConfidence(
  components: readonly Component[],
  compatibility: CompatibilitySummary,
): DataConfidence {
  const missing = [...new Set(criticalMissingSpecifications(components))];
  const availability = components.length
    ? components.reduce(
        (sum, component) => sum + availabilityScore(component),
        0,
      ) / components.length
    : 0;
  const index = clamp(
    100 -
      compatibility.unknownChecks.length * 6 -
      compatibility.warnings.length * 3 -
      missing.length * 2 -
      (availability < 100 ? 8 : 0),
  );
  const level =
    index >= 80 && compatibility.criticalUnknowns.length === 0
      ? "high"
      : index >= 55
        ? "medium"
        : "low";
  const reasons: string[] = [];
  if (compatibility.criticalUnknowns.length > 0) {
    reasons.push(
      `${compatibility.criticalUnknowns.length} critical compatibility check(s) could not be verified: ${compatibility.criticalUnknowns
        .map((finding) => finding.ruleId)
        .join(", ")}.`,
    );
  }
  if (compatibility.unknownChecks.length > 0) {
    reasons.push(
      `${compatibility.unknownChecks.length} compatibility check(s) are recorded as Unknown.`,
    );
  }
  if (missing.length > 0) {
    reasons.push(
      `${missing.length} relevant specification(s) are unpublished: ${missing
        .slice(0, 4)
        .join(", ")}${missing.length > 4 ? ", …" : ""}.`,
    );
  }
  if (availability < 100) {
    reasons.push(
      "One or more selected components are not recorded as in production.",
    );
  }
  if (reasons.length === 0) {
    reasons.push(
      "The selected components have published data for the checks used.",
    );
  }
  return {
    level,
    index: round1(index),
    reasons,
    unknownCriticalChecks: compatibility.criticalUnknowns.map(
      (finding) => `${finding.ruleId}: ${finding.message}`,
    ),
    missingSpecifications: missing,
  };
}

function recommendationStatus(
  compatibility: CompatibilitySummary,
): RecommendationStatus {
  if (compatibility.confirmedIncompatibilities.length > 0) {
    return "no-safe-recommendation";
  }
  if (compatibility.criticalUnknowns.length > 0) {
    return "needs-review";
  }
  if (
    compatibility.warnings.length > 0 ||
    compatibility.unknownChecks.length > 0
  ) {
    return "recommended-with-caveats";
  }
  return "recommended";
}

function componentScore(
  component: Component,
  map: Partial<Record<ComponentCategory, Component>>,
  questionnaire: RecommendationQuestionnaire,
  report: CompatibilityReport,
): number {
  switch (component.category) {
    case "cpu":
      return scoreCpuCandidate(component, questionnaire);
    case "gpu":
      return scoreGpuCandidate(component, questionnaire);
    case "motherboard":
      return scoreMotherboardCandidate(component, questionnaire);
    case "ram":
      return scoreRamCandidate(component, questionnaire);
    case "cooler":
      return scoreCoolerCandidate(
        component,
        (map.cpu as CpuComponent | undefined) ?? null,
        questionnaire,
      );
    case "storage":
      return scoreStorageCandidate(component, questionnaire);
    case "psu":
      return scorePsuCandidate(
        component,
        report.power,
        (map.gpu as GpuComponent | undefined) ?? null,
      );
    case "case":
      return scoreCaseCandidate(component, questionnaire);
    case "case-fan":
      return scoreFanCandidate(component);
  }
}

function alternativeCandidates(
  category: ComponentCategory,
  map: Partial<Record<ComponentCategory, Component>>,
  questionnaire: RecommendationQuestionnaire,
  pool: readonly Component[],
  report: CompatibilityReport,
): Component[] {
  const cpu = map.cpu as CpuComponent | undefined;
  const gpu = map.gpu as GpuComponent | undefined;
  const motherboard = map.motherboard as MotherboardComponent | undefined;
  const pcCase = map.case as CaseComponent | undefined;
  const cooler = map.cooler as CoolerComponent | undefined;
  switch (category) {
    case "cpu":
      return rankCpus(pool, questionnaire);
    case "gpu":
      return rankGpus(pool, questionnaire);
    case "motherboard":
      return cpu ? rankMotherboards(pool, cpu, questionnaire) : [];
    case "ram":
      return motherboard ? rankRam(pool, motherboard, questionnaire) : [];
    case "cooler":
      return cpu ? rankCoolers(pool, cpu, questionnaire) : [];
    case "storage":
      return motherboard ? rankStorage(pool, motherboard, questionnaire) : [];
    case "psu":
      return pcCase && gpu ? rankPsus(pool, pcCase, gpu, report.power) : [];
    case "case":
      return motherboard && gpu && cooler
        ? rankCases(pool, motherboard, gpu, cooler, questionnaire)
        : [];
    case "case-fan":
      return pcCase ? rankFans(pool, pcCase) : [];
  }
}

function alternativesFor(
  selected: Component,
  components: readonly Component[],
  report: CompatibilityReport,
  questionnaire: RecommendationQuestionnaire,
  pool: readonly Component[],
): AlternativeSelection[] {
  const map = categoryMap(components);
  const selectedTier = componentCapabilityTier(selected, map, questionnaire);
  const candidates = alternativeCandidates(
    selected.category,
    map,
    questionnaire,
    pool,
    report,
  ).filter((candidate) => candidate.id !== selected.id);

  const results: AlternativeSelection[] = [];
  for (const candidate of candidates) {
    const replaced = components.map((component) =>
      component.category === selected.category ? candidate : component,
    );
    const replacedReport = evaluateBuild(replaced);
    if (replacedReport.summary.status === "incompatible") continue;
    const replacedMap = categoryMap(replaced);
    const candidateTier = componentCapabilityTier(
      candidate,
      replacedMap,
      questionnaire,
    );
    const candidateScore = componentScore(
      candidate,
      replacedMap,
      questionnaire,
      replacedReport,
    );
    const findings = replacedReport.results
      .filter((result) => result.componentIds.includes(candidate.id))
      .map(toFinding);
    const unknownChecks = findings
      .filter((finding) => finding.status === "unknown")
      .map((finding) => finding.message);
    const kind = alternativeKind(
      selected,
      candidate,
      selectedTier,
      candidateTier,
      questionnaire,
    );
    results.push({
      componentId: candidate.id,
      name: candidate.name,
      manufacturer: candidate.manufacturer,
      model: candidate.model,
      kind,
      score: candidateScore,
      tradeoff: alternativeTradeoff(candidate, kind),
      compatibilityStatus: worstStatus(findings),
      unknownChecks: [...new Set(unknownChecks)],
      limitations: limitationsFor(candidate),
    });
  }
  return results
    .sort(
      (a, b) =>
        b.score - a.score || a.componentId.localeCompare(b.componentId, "en"),
    )
    .slice(0, 3);
}

function buildSelections(
  components: readonly Component[],
  report: CompatibilityReport,
  questionnaire: RecommendationQuestionnaire,
  pool: readonly Component[],
): ComponentSelection[] {
  const map = categoryMap(components);
  const selections: ComponentSelection[] = [];
  for (const category of componentCategories) {
    const component = map[category];
    if (!component) continue;
    const findings = report.results
      .filter((result) => result.componentIds.includes(component.id))
      .map(toFinding);
    selections.push({
      category,
      componentId: component.id,
      name: component.name,
      manufacturer: component.manufacturer,
      model: component.model,
      keySpecs: keySpecsFor(component),
      rationale: rationaleFor(component, questionnaire),
      score: componentScore(component, map, questionnaire, report),
      limitations: limitationsFor(component),
      compatibilityStatus: worstStatus(findings),
      compatibilityFindings: findings,
      alternatives: alternativesFor(
        component,
        components,
        report,
        questionnaire,
        pool,
      ),
    });
  }
  return selections;
}

function assembleResult(
  questionnaire: RecommendationQuestionnaire,
  components: readonly Component[],
  budget: BudgetSummary,
  pool: readonly Component[],
): RecommendationResult {
  const report = evaluateBuild(components);
  if (report.summary.status === "incompatible") {
    throw new Error("assembleResult received an incompatible build");
  }
  const compatibility = summarizeCompatibility(report);
  const map = categoryMap(components);
  const psu = map.psu as PsuComponent | undefined;
  const score = scoreBuild(
    components,
    questionnaire,
    report,
    budget.allocations,
  );
  const status = recommendationStatus(compatibility);
  const confidence = dataConfidence(components, compatibility);
  const summary = {
    headline: buildHeadline(questionnaire),
    explanation: buildExplanation(questionnaire, components, report, budget),
    useCase: questionnaire.useCase,
    resolution: questionnaire.resolution,
    performancePriority: questionnaire.performancePriority,
    budget: questionnaire.budget,
    currency: questionnaire.currency,
  };
  return {
    status,
    questionnaire,
    summary,
    score,
    selections: buildSelections(components, report, questionnaire, pool),
    compatibility,
    power: summarizePower(report, psu),
    budget,
    confidence,
    limitations: overallLimitations(components, report, budget, questionnaire),
    unmetPreferences: unmetPreferences(components, questionnaire),
    issues: [],
  };
}

function invalidResult(
  questionnaire: RecommendationQuestionnaire,
  issues: RecommendationResult["issues"],
): RecommendationResult {
  return {
    status: "invalid-questionnaire",
    questionnaire,
    summary: {
      headline: "Check your requirements",
      explanation:
        "Fix the highlighted requirement fields, then generate the recommendation again.",
      useCase: questionnaire.useCase,
      resolution: questionnaire.resolution,
      performancePriority: questionnaire.performancePriority,
      budget: questionnaire.budget,
      currency: questionnaire.currency,
    },
    score: null,
    selections: [],
    compatibility: null,
    power: null,
    budget: null,
    confidence: null,
    limitations: [],
    unmetPreferences: [],
    issues,
  };
}

function noSafeResult(
  questionnaire: RecommendationQuestionnaire,
  budget: BudgetSummary,
  reason: string,
): RecommendationResult {
  return {
    status: "no-safe-recommendation",
    questionnaire,
    summary: {
      headline: "No safe recommendation",
      explanation: reason,
      useCase: questionnaire.useCase,
      resolution: questionnaire.resolution,
      performancePriority: questionnaire.performancePriority,
      budget: questionnaire.budget,
      currency: questionnaire.currency,
    },
    score: null,
    selections: [],
    compatibility: null,
    power: null,
    budget,
    confidence: null,
    limitations: [
      reason,
      "Try a different use case, resolution, brand preference or cooling/size preference.",
      budget.note,
    ],
    unmetPreferences: [],
    issues: [],
  };
}

/**
 * Generate one deterministic recommendation. The search frontier is bounded:
 * top CPUs × top GPUs × top two motherboards/cases/PSUs. Every candidate is
 * evaluated with evaluateBuild before scoring.
 */
export function recommendBuild(
  questionnaire: RecommendationQuestionnaire,
  options: RecommendationOptions = {},
): RecommendationResult {
  const validation = validateQuestionnaire(questionnaire);
  if (!validation.ok) {
    return invalidResult(questionnaire, validation.issues);
  }

  const pool = options.catalogue ?? defaultCatalogue;
  if (pool.length === 0) {
    return noSafeResult(
      questionnaire,
      allocateBudget(questionnaire),
      "The catalogue is empty, so no recommendation can be generated.",
    );
  }

  const budget = allocateBudget(questionnaire);
  const cpus = rankCpus(pool, questionnaire).slice(
    0,
    options.maxCpuCandidates ?? 4,
  );
  const gpus = rankGpus(pool, questionnaire).slice(
    0,
    options.maxGpuCandidates ?? 4,
  );
  if (cpus.length === 0 || gpus.length === 0) {
    return noSafeResult(
      questionnaire,
      budget,
      "The catalogue does not contain both a CPU and a graphics card to build from.",
    );
  }

  const candidates: CandidateBuild[] = [];
  const seen = new Set<string>();

  for (const cpu of cpus) {
    const motherboards = rankMotherboards(pool, cpu, questionnaire).slice(0, 2);
    if (motherboards.length === 0) continue;

    for (const gpu of gpus) {
      for (const motherboard of motherboards) {
        const rams = rankRam(pool, motherboard, questionnaire).slice(0, 1);
        const coolers = rankCoolers(pool, cpu, questionnaire).slice(0, 1);
        const storages = rankStorage(pool, motherboard, questionnaire).slice(
          0,
          1,
        );
        if (
          rams.length === 0 ||
          coolers.length === 0 ||
          storages.length === 0
        ) {
          continue;
        }
        const cooler = coolers[0];
        const cases = rankCases(
          pool,
          motherboard,
          gpu,
          cooler,
          questionnaire,
        ).slice(0, 2);
        if (cases.length === 0) continue;

        for (const pcCase of cases) {
          const partial = [
            cpu,
            gpu,
            motherboard,
            rams[0],
            cooler,
            storages[0],
            pcCase,
          ];
          const partialPower = estimateBuildPower(partial);
          const psus = rankPsus(pool, pcCase, gpu, partialPower).slice(0, 2);
          if (psus.length === 0) continue;
          const fans = rankFans(pool, pcCase).slice(0, 1);

          for (const psu of psus) {
            const components: Component[] = [
              cpu,
              gpu,
              motherboard,
              rams[0],
              cooler,
              storages[0],
              psu,
              pcCase,
              ...fans,
            ];
            const key = buildKey(components);
            if (seen.has(key)) continue;
            seen.add(key);
            const report = evaluateBuild(components);
            if (report.summary.status === "incompatible") continue;
            const score = scoreBuild(
              components,
              questionnaire,
              report,
              budget.allocations,
            );
            candidates.push({ components, report, score, key });
          }
        }
      }
    }
  }

  if (candidates.length === 0) {
    return noSafeResult(
      questionnaire,
      budget,
      "No complete configuration in the current catalogue passes the known compatibility checks for these requirements. The catalogue may not contain the right combination of socket, memory, clearance and power parts.",
    );
  }

  /*
   * Safety is a primary grouping, not a numeric penalty. Candidates with no
   * critical Unknown checks always outrank candidates with one or more,
   * regardless of weighted score. The existing scoring model then ranks
   * candidates within each group. This keeps a higher-scoring but unresolved
   * build from displacing a fully verified one.
   */
  const criticalGroup = (candidate: CandidateBuild): 0 | 1 =>
    candidate.report.results.some(
      (result) =>
        result.status === "unknown" &&
        CRITICAL_UNKNOWN_RULES.has(result.ruleId),
    )
      ? 1
      : 0;
  candidates.sort(
    (a, b) =>
      criticalGroup(a) - criticalGroup(b) ||
      b.score.total - a.score.total ||
      a.key.localeCompare(b.key, "en"),
  );
  return assembleResult(questionnaire, candidates[0].components, budget, pool);
}

/**
 * Replace one selected component and rerun compatibility, power, scoring and
 * alternatives. Returns the original result when the replacement is unknown
 * or incompatible, so the UI can keep the safe recommendation.
 */
export function replaceSelectedComponent(
  result: RecommendationResult,
  category: ComponentCategory,
  componentId: string,
  options: RecommendationOptions = {},
): RecommendationResult {
  if (result.selections.length === 0) return result;
  const pool = options.catalogue ?? defaultCatalogue;
  const replacement = pool.find(
    (component) =>
      component.id === componentId && component.category === category,
  );
  if (!replacement) return result;

  const current = result.selections
    .map((selection) =>
      pool.find(
        (component) =>
          component.id === selection.componentId &&
          component.category === selection.category,
      ),
    )
    .filter((component): component is Component => component !== undefined);
  if (current.length !== result.selections.length) return result;

  const replaced = current.map((component) =>
    component.category === category ? replacement : component,
  );
  const report = evaluateBuild(replaced);
  if (report.summary.status === "incompatible") return result;

  return assembleResult(
    result.questionnaire,
    replaced,
    allocateBudget(result.questionnaire),
    pool,
  );
}

export { CORE_CATEGORIES };
