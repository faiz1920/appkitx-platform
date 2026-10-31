# Guided PC Recommendations (M10.4)

Development-only guided recommendation experience for the AppKitX PC Builder.

- Preview: `/pc-builder` during `astro dev` only.
- Domain: `src/lib/pc-builder/recommendations/`.
- UI: `src/dev/pc-builder/PcBuilder.astro`.
- No backend, account, persistence, live pricing, scraping or AI API.

The MVP is **specification-based**. It does not provide live prices, market
availability, FPS estimates or application benchmark results.

## 1. Architecture

| File                               | Responsibility                                                                                       |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `recommendations/types.ts`         | Questionnaire, result, budget, power, compatibility and confidence types.                            |
| `recommendations/questionnaire.ts` | Defaults, UI option metadata, runtime validation, budget formatting.                                 |
| `recommendations/budget.ts`        | Target allocation percentages and amounts; no prices.                                                |
| `recommendations/scoring.ts`       | Capability indices, scoring weights, budget bands, build scoring, missing-spec detection.            |
| `recommendations/candidates.ts`    | Known-compatibility filters and deterministic category rankings.                                     |
| `recommendations/recommend.ts`     | Bounded candidate assembly, `evaluateBuild` final check, result assembly, alternatives, replacement. |
| `recommendations/explanations.ts`  | Component rationale, limitations, alternatives trade-offs, unmet preferences.                        |
| `recommendations/transfer.ts`      | Maps a recommendation into the existing manual `BuildState`.                                         |
| `recommendations/labels.ts`        | Presentation labels for statuses, confidence and alternatives.                                       |

The engine consumes the existing catalogue, component types, compatibility
rules and power estimator. It does not duplicate component specifications or
rule logic.

## 2. Questionnaire

```ts
interface RecommendationQuestionnaire {
  budget: number;
  currency: string; // "UNIT" in the MVP
  useCase: "gaming" | "productivity" | "workstation" | "general";
  resolution: "1080p" | "1440p" | "4k" | "not-applicable";
  performancePriority:
    "gpu-focused" | "cpu-focused" | "balanced" | "value-focused";
  cpuBrand: "AMD" | "Intel" | "no-preference";
  gpuBrand: "NVIDIA" | "AMD" | "no-preference";
  cooling: "air" | "liquid" | "no-preference";
  buildSize: "compact" | "standard" | "no-preference";
  upgradeFlexibility: "high" | "balanced" | "low";
}
```

Validation rejects non-finite, zero, negative or excessive budgets and any
unsupported enum value. Budget must be greater than 0 and at most 1,000,000
generic units. Currency is a label only; no conversion is applied.

Defaults: 1,200 generic units, gaming, 1440p, balanced priority, no brand or
optional preferences, standard size, balanced upgrade flexibility.

Every select shows the selected option's description as visible helper text.
The same text is associated with the control through `aria-describedby`, so
the meaning of values such as "High" upgrade flexibility is available without
outside documentation.

## 3. Candidate generation

The engine is deterministic: score descending, then component id ascending.

1. Rank CPUs and GPUs for the questionnaire.
2. Take the top four of each (configurable with `maxCpuCandidates` /
   `maxGpuCandidates`).
3. For each CPU/GPU pair, take the top two motherboards, one RAM kit, one
   cooler, one storage device, two cases and two PSUs, plus one compatible fan.
4. Evaluate every assembled configuration with `evaluateBuild`.
5. Reject any configuration with a confirmed incompatibility.
6. Score the remainder and select the best.

This bounds the search to roughly `4 × 4 × 2 × 2 × 2 = 128` candidate builds for
the current 101-record catalogue. It does not enumerate the full combinatorial
space.

Filters reject only **known** mismatches (socket, memory generation/form
factor, cooler mounting, case form factor, known GPU/cooler/PSU clearance, M.2
protocol/length, fan size). Missing data passes through to `evaluateBuild`,
which reports Unknown.

### Availability preference

Candidates prefer in-production parts when at least three CPUs/GPUs (or two
other category candidates) are available. If too few in-production options
exist, the frontier adds unknown availability, then discontinued parts. Selected
non-production parts are labelled in the result limitations.

### Brand preference

CPU and GPU brand preferences are applied as a frontier preference when at
least two preferred-brand candidates exist. If the preferred brand cannot
produce a candidate, the engine falls back to all brands and reports an unmet
preference. Brand never overrides compatibility.

## 4. Scoring model

All scores are 0–100. The total is the weighted sum of eight dimensions. Weights
sum to 100 for each use case.

| Dimension            | Gaming | Productivity | Workstation | General |
| -------------------- | -----: | -----------: | ----------: | ------: |
| Use-case fit         |     22 |           28 |          28 |      25 |
| Performance priority |     16 |           16 |          16 |      16 |
| Resolution fit       |     14 |            0 |           0 |       0 |
| Brand preference     |      7 |            7 |           7 |       9 |
| Budget posture       |     15 |           15 |          15 |      16 |
| Upgrade flexibility  |      8 |           12 |          10 |      12 |
| Component balance    |      8 |           12 |          14 |      12 |
| Data confidence      |     10 |           10 |          10 |      10 |

### Capability indices

These are transparent formulas over published specifications, not benchmarks:

- CPU compute: `cores × 10 + threads × 2 + boostGHz × 8 + DDR5 bonus`.
- CPU gaming: `boostGHz × 20 + min(cores, 8) × 8 + thread bonus + DDR5 bonus +
3D V-Cache bonus` (the bonus is applied only when the catalogue description
  explicitly identifies 3D V-Cache).
- GPU: `boardPowerW × 2 + VRAM GB + PCIe 4.0+ bonus`.
- RAM: capacity, speed and dual-module preference.
- Storage: capacity, sequential read and NVMe preference.
- Motherboard upgrade: memory slots, maximum memory, M.2 slots, PCIe generation
  and SATA ports.
- Cooler: socket support, thermal rating and physical size.
- PSU: wattage versus the estimate, GPU connectors, efficiency and modularity.
- Case: form-factor support, GPU/cooler/PSU clearance, included fans and size
  preference.
- Fan: airflow, static pressure and PWM.

### Use-case fit

- Gaming: GPU 55%, CPU 30%, RAM 10%, storage 5%.
- Productivity: CPU 45%, GPU 15%, RAM 25%, storage 15%.
- Workstation: CPU 40%, GPU 25%, RAM 20%, storage 15%.
- General: CPU 30%, GPU 30%, RAM 20%, storage 20%.

### Budget posture

The budget is a planning envelope, **not a price lookup**. It sets a capability
band and target allocation:

| Budget band | Generic units | Capability target |
| ----------- | ------------: | ----------------: |
| Entry       |         ≤ 600 |                35 |
| Mid         |     601–1,200 |                55 |
| Upper       |   1,201–2,200 |                75 |
| High        |       > 2,200 |                90 |

Gaming/CPU targets adjust the band slightly; 1080p lowers the GPU target and 4K
raises it. The engine scores how closely the selected CPU, GPU, RAM and storage
capability tiers sit near those targets. This is a planning heuristic, not a
claim that any component costs a particular amount.

## 5. Budget allocation

Base percentages by use case:

| Category    | Gaming | Productivity | Workstation | General |
| ----------- | -----: | -----------: | ----------: | ------: |
| CPU         |     20 |           28 |          30 |      22 |
| GPU         |     40 |           15 |          25 |      22 |
| Motherboard |     10 |           10 |          10 |      12 |
| RAM         |      8 |           15 |          14 |      12 |
| Cooler      |      3 |            5 |           4 |       6 |
| Storage     |      8 |           12 |           9 |      10 |
| PSU         |      6 |            6 |           4 |       7 |
| Case        |      3 |            6 |           2 |       6 |
| Case fans   |      2 |            3 |           2 |       3 |

Deterministic adjustments:

- GPU-focused: +6 GPU, −3 CPU, −1 storage, −1 case, −1 fans.
- CPU-focused: +6 CPU, −3 GPU, −1 storage, −1 case, −1 fans.
- Value-focused: −3 GPU, −2 CPU, +2 storage, +1 PSU, +1 case, +1 fans.
- Gaming 1080p: −4 GPU, +2 CPU, +1 storage, +1 case.
- Gaming 4K: +5 GPU, −3 CPU, −1 storage, −1 case.

Percentages are rounded with the largest-remainder method and always sum to 100.
Target amounts are `budget × percent`, rounded so they sum to the rounded
budget. Both are labelled **price-unverified** in the result and UI.

M10.7 adds a separate commercial pricing and availability architecture
(`PC-BUILDER-M10-7-PRICING-ARCHITECTURE.md`). Its offer and build-purchase
contracts are not connected to recommendation scoring, and the target
allocation above remains specification-based rather than a live quote.

## 6. Compatibility and Unknown handling

- `evaluateBuild` is the final authority. The engine never implements a parallel
  compatibility system.
- Configurations with a confirmed incompatibility are rejected.
- Unknown is never treated as Compatible.
- A critical Unknown makes the result `needs-review`.
- Non-critical Unknown checks make the result `recommended-with-caveats`.
- A result with no warnings or Unknown checks is `recommended`; the current
  catalogue's BIOS rule keeps complete builds at least at caveat level.
- If no complete configuration passes, the result is `no-safe-recommendation`
  with a reason and suggested changes.

Critical Unknown rules: CPU socket/chipset, RAM generation/form
factor/capacity/slot count, GPU/case length, cooler socket/case height/case
radiator, motherboard/case form factor, PSU wattage/GPU connectors/case form
factor/case length, and storage/M.2 or SATA support.

BIOS and GPU slot thickness are deliberately **not** in the hard critical set:
the schema stores one board-level BIOS value and cases generally do not publish
slot thickness. Both remain visible caveats and limitations.

Candidate selection treats safety as a primary grouping, not a numeric
penalty. Candidates with no critical Unknown checks always outrank candidates
with one or more, regardless of weighted score. The existing scoring model ranks
candidates within each group. If every candidate has a critical gap, the
highest-scoring needs-review candidate is returned and the result stays
`needs-review`; needs-review alternatives remain available.

## 7. Power

`result.power` is derived from `evaluateBuild(...).power`, which uses the M10.1
estimator:

- CPU maximum boost power, else base TDP.
- GPU board power.
- Generic estimates for motherboard, memory, storage, fans and AIO pump.
- Default 20% headroom.
- Missing CPU/GPU power is reported as insufficient data, never guessed.

The result also reports the selected PSU wattage, headroom versus the
recommended wattage, power assumptions and missing information.

## 8. Alternatives

For each selected category, the engine evaluates catalogue alternatives against
the rest of the current build:

1. Known-compatible candidates are ranked by category fit.
2. Each replacement is run through `evaluateBuild`.
3. Confirmed incompatible replacements are discarded.
4. Up to three alternatives are returned with a kind (performance, value,
   brand or similar), fit score, trade-off, compatibility status, Unknown checks
   and limitations.
5. Selecting an alternative calls `replaceSelectedComponent`, which rebuilds the
   result, compatibility summary, power estimate, score and alternatives.

Prices are unavailable, so alternatives never claim a cost difference. A
"value-oriented" alternative means lower capability/fit, not a verified lower
price.

## 9. Manual builder transfer

`recommendationToBuildState(result)` maps selected component ids through the
existing `createEmptyBuild` / `selectComponent` functions. It preserves the
manual builder's single-slot and multi-slot semantics.

The UI checks `manualBuildHasSelection(state)` before transfer:

- Empty manual build: transfer immediately.
- Existing manual build: open a confirmation dialog explaining how many
  components will be replaced.
- Confirming switches to Manual mode and calls the existing `renderAll`, which
  reruns `evaluateBuild` and the power estimator.
- Cancelling leaves the manual build untouched.

No separate manual-builder state or compatibility implementation exists.

## 10. Result model and presentation

The preview presents the result as a two-step flow. Generating a
recommendation collapses the requirements panel; **Edit requirements** reveals
it again. Changing any requirement after generation clears the displayed
result immediately and shows a "requirements changed" notice. A stale
recommendation is never left on screen or offered for transfer/save/share.

Result presentation order:

1. Headline, status, explanation, action row and requirement summary.
2. Compatibility, power, budget allocation and data-confidence panels.
3. A "Recommended components" section with an explicit note that selection
   fit is a specification weighting, not a benchmark, FPS or price score.
4. Per-category selection cards. Alternatives are collapsed behind a labelled
   "Compare N alternatives" disclosure to keep the first view scannable.
5. Unmet preferences and limitations.

Each result includes:

- Recommendation status, summary and overall explanation.
- Use case, resolution, priority, budget and currency context.
- One selection per category with key specs, rationale, fit score, limitations,
  compatibility findings and alternatives.
- Compatibility summary: confirmed incompatibilities, critical Unknowns,
  warnings, other Unknowns and compatible check count.
- Power summary: estimated load, recommended/selected PSU, headroom, assumptions
  and missing information.
- Budget summary: input, currency, target allocation and `price-unverified`
  status.
- Data confidence: qualitative level plus reasons, critical Unknown checks and
  unpublished specifications. The internal index is not displayed as a
  confidence percentage.
- Limitations and unmet preferences.

## 11. Current catalogue limitations

- No component prices, regional pricing or stock data.
- No benchmark database; no FPS or application performance claims.
- AMD CPUs currently have no published supported-chipset list, so AMD builds
  report a critical chipset Unknown and therefore `needs-review`.
- BIOS compatibility is always Unknown; the result points at the board CPU
  support list.
- Case `maxGpuSlots` is unpublished for the current cases, so slot thickness is
  a caveat.
- Some GPUs have no published reference length/slot width.
- The catalogue is a curated subset of the market, not a full availability list.

## 12. Extending the engine

1. Add catalogue records through the existing typed category files; no
   recommendation-specific specification duplication is required.
2. Add a new scoring dimension only with an explicit weight that keeps each
   use-case weight table at 100, and add tests.
3. Add a new questionnaire option by extending the union, option metadata and
   validation, then update the UI select.
4. Add a new compatibility rule in the existing rules registry; the engine will
   consume it automatically.
5. Add a new alternative category by extending `alternativeCandidates` and the
   selection card.
6. Keep pricing out until a verified price abstraction exists. Do not infer
   prices from product tier or budget.

## 13. Tests

- `tests/pc-builder-recommendations.test.ts`: questionnaire validation, budget
  allocation, deterministic output, catalogue-order independence, use-case,
  resolution, priority, brand, cooling, compact and budget behavior,
  compatibility/Unknown handling, no-safe scenarios, no fabricated prices,
  alternatives, replacement, transfer and scoring helpers.
- `e2e-pc-builder/guided-recommendations.spec.ts`: questionnaire validation,
  result rendering, alternatives, manual transfer, replacement confirmation,
  keyboard generation, mobile/desktop layout.
- `e2e-pc-builder/product-validation.spec.ts`: the six M10.6 end-to-end
  journeys, questionnaire option matrix, stale-result invalidation,
  accessibility checks, responsive widths and cross-browser runs.
- Existing manual builder E2E tests remain in
  `e2e-pc-builder/pc-builder.spec.ts`.

## 14. Production isolation

The feature is mounted only by `pc-builder-dev-preview.ts` during `astro dev`.
It adds no public route, navigation entry, sitemap entry, indexability change,
Cloudflare/Wrangler configuration, CSP/HSTS/security header, analytics or
affiliate integration. The production build contains no PC Builder artifacts
and no sitemap references.
