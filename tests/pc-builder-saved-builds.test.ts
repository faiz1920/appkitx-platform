import { describe, expect, it } from "vitest";
import {
  createEmptyBuild,
  selectComponent,
  type BuildState,
} from "../src/lib/pc-builder/build-state";
import { catalogue } from "../src/lib/pc-builder/catalogue";
import { evaluateBuild } from "../src/lib/pc-builder/engine";
import { DEFAULT_QUESTIONNAIRE } from "../src/lib/pc-builder/recommendations";
import {
  MAX_SAVED_BUILDS,
  SAVED_BUILDS_STORAGE_KEY,
  createMemoryStorage,
  createSavedBuildRepository,
  deserializeSavedBuild,
  deserializeSavedBuildStore,
  migrateSavedBuild,
  questionnaireMetadataFromQuestionnaire,
  resolveSavedBuild,
  resolveSelections,
  selectionsFromBuildState,
  serializeSavedBuild,
  serializeSavedBuildStore,
  validateSavedBuild,
  validateSavedBuildStore,
  validateSelections,
  validateShareBuildPayload,
  type CreateSavedBuildInput,
  type SavedBuild,
  type SavedBuildSelection,
} from "../src/lib/pc-builder/saved-builds";
import type { Component } from "../src/lib/pc-builder/types";

const byId = new Map(catalogue.map((component) => [component.id, component]));
const lookup = (id: string): Component | undefined => byId.get(id);

const NOW = new Date("2026-10-31T10:00:00.000Z");

function buildState(ids: Record<string, readonly string[]>): BuildState {
  let state = createEmptyBuild();
  for (const [category, componentIds] of Object.entries(ids)) {
    for (const id of componentIds) {
      state = selectComponent(state, category as never, id);
    }
  }
  return state;
}

function manualSelections(): SavedBuildSelection[] {
  return selectionsFromBuildState(
    buildState({
      cpu: ["cpu-intel-core-i5-14600k"],
      gpu: ["gpu-nvidia-geforce-rtx-4070-fe"],
      motherboard: ["motherboard-gigabyte-z790-aorus-elite-ax"],
      ram: ["ram-corsair-vengeance-32gb-ddr5-6000"],
      cooler: ["cooler-noctua-nh-d15"],
      storage: ["storage-samsung-990-pro-1tb"],
      psu: ["psu-corsair-rm850e-2023"],
      case: ["case-corsair-5000d-airflow"],
      "case-fan": ["case-fan-arctic-p14-pwm"],
    }),
  );
}

function guidedSelections(): SavedBuildSelection[] {
  return selectionsFromBuildState(
    buildState({
      cpu: ["cpu-intel-core-i5-14600k"],
      gpu: ["gpu-amd-radeon-rx-7800-xt"],
      motherboard: ["motherboard-gigabyte-z790-aorus-elite-ax"],
      ram: ["ram-corsair-vengeance-32gb-ddr5-6000"],
      cooler: ["cooler-be-quiet-dark-rock-pro-4"],
      storage: ["storage-samsung-990-pro-1tb"],
      psu: ["psu-corsair-rm850e-2023"],
      case: ["case-corsair-5000d-airflow"],
      "case-fan": ["case-fan-arctic-p14-pwm"],
    }),
  );
}

function makeBuild(overrides: Partial<SavedBuild> = {}): SavedBuild {
  return {
    schemaVersion: 1,
    id: "build-test-1",
    name: "Test build",
    source: "manual",
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
    selections: manualSelections(),
    ...overrides,
  };
}

function createInput(
  overrides: Partial<CreateSavedBuildInput> = {},
): CreateSavedBuildInput {
  return {
    name: "Test build",
    source: "manual",
    selections: manualSelections(),
    ...overrides,
  };
}

function repository(
  storage = createMemoryStorage(),
  ids: string[] = ["build-test-1", "build-test-2", "build-test-3"],
) {
  let index = 0;
  return {
    storage,
    repo: createSavedBuildRepository(storage, {
      now: () => NOW,
      createId: () => ids[index++] ?? `build-extra-${index}`,
    }),
  };
}

describe("saved-build schema and serialization", () => {
  it("round-trips a manual build deterministically", () => {
    const build = makeBuild();
    const first = serializeSavedBuild(build);
    const second = serializeSavedBuild(build);
    expect(first).toBe(second);

    const parsed = deserializeSavedBuild(first);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value).toEqual(build);
      expect(serializeSavedBuild(parsed.value)).toBe(first);
    }
  });

  it("round-trips guided questionnaire metadata", () => {
    const build = makeBuild({
      source: "guided",
      questionnaire: questionnaireMetadataFromQuestionnaire(
        DEFAULT_QUESTIONNAIRE,
      ),
    });
    const serialized = serializeSavedBuild(build);
    const parsed = deserializeSavedBuild(serialized);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.source).toBe("guided");
      expect(parsed.value.questionnaire).toEqual({
        useCase: "gaming",
        resolution: "1440p",
        performancePriority: "balanced",
        budget: 1200,
        currency: "UNIT",
      });
    }
  });

  it("preserves multi-slot order and quantity", () => {
    const selections = selectionsFromBuildState(
      buildState({
        cpu: ["cpu-intel-core-i5-14600k"],
        ram: [
          "ram-corsair-vengeance-32gb-ddr5-6000",
          "ram-kingston-fury-beast-32gb-ddr5-5600",
        ],
        storage: [
          "storage-samsung-990-pro-1tb",
          "storage-seagate-barracuda-2tb",
        ],
        "case-fan": [
          "case-fan-arctic-p14-pwm",
          "case-fan-noctua-nf-a12x25-pwm",
        ],
      }),
    );
    const validated = validateSelections(selections);
    expect(validated.ok).toBe(true);
    if (validated.ok) {
      expect(validated.value.find((entry) => entry.category === "ram")).toEqual(
        {
          category: "ram",
          componentIds: [
            "ram-corsair-vengeance-32gb-ddr5-6000",
            "ram-kingston-fury-beast-32gb-ddr5-5600",
          ],
        },
      );
      expect(
        validated.value.find((entry) => entry.category === "storage"),
      ).toEqual({
        category: "storage",
        componentIds: [
          "storage-samsung-990-pro-1tb",
          "storage-seagate-barracuda-2tb",
        ],
      });
    }
  });

  it("never serializes catalogue records or derived results", () => {
    const serialized = serializeSavedBuild(makeBuild());
    expect(serialized).not.toContain("specs");
    expect(serialized).not.toContain("manufacturer");
    expect(serialized).not.toContain("compatibility");
    expect(serialized).not.toContain("power");
    expect(JSON.parse(serialized)).toEqual({
      schemaVersion: 1,
      id: "build-test-1",
      name: "Test build",
      source: "manual",
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
      selections: manualSelections(),
    });
  });

  it("rejects missing and unsupported schema versions through migration", () => {
    const future = migrateSavedBuild({
      ...makeBuild(),
      schemaVersion: 2,
    });
    expect(future.ok).toBe(false);
    if (!future.ok) {
      expect(future.issues[0]?.code).toBe("unsupported-version");
    }

    const legacy = migrateSavedBuild({ ...makeBuild(), schemaVersion: 0 });
    expect(legacy.ok).toBe(false);

    const missing = migrateSavedBuild({
      ...makeBuild(),
      schemaVersion: undefined,
    });
    expect(missing.ok).toBe(false);
  });

  it("rejects malformed identity, names and timestamps", () => {
    const invalid = [
      { ...makeBuild(), id: "bad id with spaces" },
      { ...makeBuild(), name: "" },
      { ...makeBuild(), name: " padded " },
      { ...makeBuild(), name: "x".repeat(81) },
      { ...makeBuild(), createdAt: "2026-10-31" },
      { ...makeBuild(), updatedAt: "2026-10-30T10:00:00.000Z" },
      { ...makeBuild(), source: "cloud" },
    ];
    for (const candidate of invalid) {
      expect(validateSavedBuild(candidate).ok).toBe(false);
    }
  });

  it("rejects invalid, duplicate and over-capacity selections", () => {
    const invalid = [
      [],
      [{ category: "unknown", componentIds: ["cpu-intel-core-i5-14600k"] }],
      [{ category: "cpu", componentIds: [] }],
      [{ category: "cpu", componentIds: ["NOT VALID"] }],
      [
        { category: "cpu", componentIds: ["cpu-intel-core-i5-14600k"] },
        { category: "cpu", componentIds: ["cpu-amd-ryzen-5-7600"] },
      ],
      [
        {
          category: "cpu",
          componentIds: ["cpu-intel-core-i5-14600k", "cpu-amd-ryzen-5-7600"],
        },
      ],
      [
        {
          category: "ram",
          componentIds: Array.from(
            { length: 9 },
            (_, index) => `ram-kit-${index}`,
          ),
        },
      ],
    ];
    for (const candidate of invalid) {
      const result = validateSelections(candidate);
      expect(result.ok).toBe(false);
    }
  });

  it("rejects manual builds carrying guided metadata", () => {
    const result = validateSavedBuild(
      makeBuild({
        questionnaire: questionnaireMetadataFromQuestionnaire(
          DEFAULT_QUESTIONNAIRE,
        ),
      }),
    );
    expect(result.ok).toBe(false);
  });

  it("validates store envelopes and rejects unsupported versions", () => {
    const store = serializeSavedBuildStore([makeBuild()]);
    const parsed = deserializeSavedBuildStore(store);
    expect(parsed.ok).toBe(true);

    const future = deserializeSavedBuildStore(
      JSON.stringify({ schemaVersion: 99, builds: [] }),
    );
    expect(future.ok).toBe(false);
    if (!future.ok) {
      expect(future.issues[0]?.code).toBe("unsupported-version");
    }

    const duplicate = validateSavedBuildStore({
      schemaVersion: 1,
      builds: [makeBuild(), makeBuild()],
    });
    expect(duplicate.ok).toBe(false);
  });

  it("validates share payloads independently of saved-build ids", () => {
    const manual = validateShareBuildPayload({
      schemaVersion: 1,
      name: "Shared build",
      source: "manual",
      selections: manualSelections(),
    });
    expect(manual.ok).toBe(true);

    const guided = validateShareBuildPayload({
      schemaVersion: 1,
      name: "Shared guided build",
      source: "guided",
      selections: guidedSelections(),
      questionnaire: questionnaireMetadataFromQuestionnaire(
        DEFAULT_QUESTIONNAIRE,
      ),
      createdAt: NOW.toISOString(),
    });
    expect(guided.ok).toBe(true);
  });
});

describe("saved-build repository", () => {
  it("starts empty without reporting corruption", () => {
    const { repo } = repository();
    const result = repo.list();
    expect(result).toEqual({ ok: true, builds: [], corrupt: false });
  });

  it("creates, lists and retrieves a build with stable timestamps", () => {
    const { repo, storage } = repository();
    const created = repo.create(createInput());
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    expect(created.value.id).toBe("build-test-1");
    expect(created.value.createdAt).toBe(NOW.toISOString());
    expect(created.value.updatedAt).toBe(NOW.toISOString());
    expect(repo.get("build-test-1")).toEqual(created.value);
    expect(repo.list()).toMatchObject({
      ok: true,
      corrupt: false,
      builds: [created.value],
    });
    expect(storage.snapshot()[SAVED_BUILDS_STORAGE_KEY]).toContain(
      "build-test-1",
    );
  });

  it("updates selections and preserves the creation timestamp", () => {
    let now = new Date("2026-10-31T10:00:00.000Z");
    const storage = createMemoryStorage();
    const repo = createSavedBuildRepository(storage, {
      now: () => now,
      createId: () => "build-test-1",
    });
    const created = repo.create(createInput());
    expect(created.ok).toBe(true);

    now = new Date("2026-11-01T12:00:00.000Z");
    const changed = selectionsFromBuildState(
      buildState({
        cpu: ["cpu-amd-ryzen-5-7600"],
        motherboard: ["motherboard-msi-b650-tomahawk-wifi"],
        ram: ["ram-corsair-vengeance-32gb-ddr5-6000"],
        gpu: ["gpu-amd-radeon-rx-7600"],
        cooler: ["cooler-noctua-nh-u12s-redux"],
        storage: ["storage-samsung-990-pro-1tb"],
        psu: ["psu-corsair-rm750x-2021"],
        case: ["case-corsair-4000d-airflow"],
        "case-fan": ["case-fan-arctic-p12-pwm"],
      }),
    );
    const updated = repo.update("build-test-1", {
      name: "Updated build",
      selections: changed,
    });
    expect(updated.ok).toBe(true);
    if (!updated.ok) return;

    expect(updated.value.name).toBe("Updated build");
    expect(updated.value.createdAt).toBe(
      created.ok ? created.value.createdAt : "",
    );
    expect(updated.value.updatedAt).toBe(now.toISOString());
    expect(updated.value.selections).toEqual(changed);
    expect(repo.get("build-test-1")?.name).toBe("Updated build");
  });

  it("renames without touching selections, source or creation time", () => {
    const { repo } = repository();
    const created = repo.create(
      createInput({
        source: "guided",
        questionnaire: questionnaireMetadataFromQuestionnaire(
          DEFAULT_QUESTIONNAIRE,
        ),
      }),
    );
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const renamed = repo.rename("build-test-1", "Renamed build");
    expect(renamed.ok).toBe(true);
    if (!renamed.ok) return;
    expect(renamed.value.name).toBe("Renamed build");
    expect(renamed.value.selections).toEqual(created.value.selections);
    expect(renamed.value.source).toBe("guided");
    expect(renamed.value.questionnaire).toEqual(created.value.questionnaire);
    expect(renamed.value.createdAt).toBe(created.value.createdAt);
  });

  it("rejects an invalid rename without changing the stored build", () => {
    const { repo, storage } = repository();
    const created = repo.create(createInput());
    expect(created.ok).toBe(true);
    const before = storage.snapshot()[SAVED_BUILDS_STORAGE_KEY];

    const renamed = repo.rename("build-test-1", "   ");
    expect(renamed.ok).toBe(false);
    if (!renamed.ok) expect(renamed.error.code).toBe("invalid-name");
    expect(storage.snapshot()[SAVED_BUILDS_STORAGE_KEY]).toBe(before);
  });

  it("duplicates a build with a new id and copy suffix", () => {
    const { repo } = repository();
    const created = repo.create(createInput());
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const duplicate = repo.duplicate("build-test-1");
    expect(duplicate.ok).toBe(true);
    if (!duplicate.ok) return;
    expect(duplicate.value.id).toBe("build-test-2");
    expect(duplicate.value.name).toBe("Test build (copy)");
    expect(duplicate.value.selections).toEqual(created.value.selections);
    expect(duplicate.value.source).toBe(created.value.source);
    expect(duplicate.value.createdAt).toBe(NOW.toISOString());
    expect(repo.list()).toMatchObject({ ok: true, builds: expect.any(Array) });
    if (repo.list().ok) {
      expect(
        repo.list().ok && (repo.list() as { builds: SavedBuild[] }).builds,
      ).toHaveLength(2);
    }
  });

  it("deletes only the requested build", () => {
    const { repo } = repository();
    repo.create(createInput({ name: "First" }));
    repo.create(createInput({ name: "Second" }));
    const removed = repo.remove("build-test-1");
    expect(removed.ok).toBe(true);
    const list = repo.list();
    expect(list.ok).toBe(true);
    if (list.ok) {
      expect(list.builds.map((build) => build.id)).toEqual(["build-test-2"]);
    }
    expect(repo.remove("build-test-1")).toMatchObject({
      ok: false,
      error: { code: "not-found" },
    });
  });

  it("reports the not-found path for malformed ids", () => {
    const { repo } = repository();
    expect(repo.remove("bad id")).toMatchObject({
      ok: false,
      error: { code: "not-found" },
    });
    expect(repo.update("bad id", { name: "x" })).toMatchObject({
      ok: false,
      error: { code: "not-found" },
    });
  });

  it("enforces the saved-build limit without deleting existing builds", () => {
    let sequence = 0;
    const { repo, storage } = repository(
      createMemoryStorage(),
      Array.from({ length: MAX_SAVED_BUILDS + 1 }, () => "unused"),
    );
    // Use a counter-based id generator for this long-running case.
    const limited = createSavedBuildRepository(storage, {
      now: () => NOW,
      createId: () => `build-limit-${++sequence}`,
    });
    for (let index = 0; index < MAX_SAVED_BUILDS; index += 1) {
      const result = limited.create(createInput({ name: `Build ${index}` }));
      expect(result.ok).toBe(true);
    }
    const before = storage.snapshot()[SAVED_BUILDS_STORAGE_KEY];
    const overflow = limited.create(createInput({ name: "Overflow" }));
    expect(overflow).toMatchObject({
      ok: false,
      error: { code: "limit-reached" },
    });
    expect(storage.snapshot()[SAVED_BUILDS_STORAGE_KEY]).toBe(before);
    expect(repo.list()).toMatchObject({ ok: true });
  });

  it("handles empty, corrupted and unsupported storage", () => {
    const corrupt = createMemoryStorage({
      [SAVED_BUILDS_STORAGE_KEY]: "{not json",
    });
    const corruptRepo = createSavedBuildRepository(corrupt);
    expect(corruptRepo.list()).toMatchObject({
      ok: true,
      corrupt: true,
      corruptReason: "invalid",
    });
    expect(corruptRepo.create(createInput())).toMatchObject({
      ok: false,
      error: { code: "corrupt-store" },
    });
    expect(corruptRepo.reset()).toEqual({ ok: true, value: true });
    expect(corruptRepo.list()).toEqual({
      ok: true,
      builds: [],
      corrupt: false,
    });

    const future = createMemoryStorage({
      [SAVED_BUILDS_STORAGE_KEY]: JSON.stringify({
        schemaVersion: 99,
        builds: [],
      }),
    });
    const futureRepo = createSavedBuildRepository(future);
    expect(futureRepo.list()).toMatchObject({
      ok: true,
      corrupt: true,
      corruptReason: "unsupported-version",
    });
  });

  it("reports unavailable browser storage without throwing", () => {
    const repo = createSavedBuildRepository(null);
    expect(repo.list()).toMatchObject({
      ok: false,
      error: { code: "storage-unavailable" },
    });
    expect(repo.create(createInput())).toMatchObject({
      ok: false,
      error: { code: "storage-unavailable" },
    });
    expect(repo.reset()).toMatchObject({
      ok: false,
      error: { code: "storage-unavailable" },
    });
  });

  it("handles quota and write failures without changing stored builds", () => {
    const storage = createMemoryStorage();
    let failWrites = false;
    const guarded = {
      getItem: (key: string) => storage.getItem(key),
      setItem: (key: string, value: string) => {
        if (failWrites) {
          const error = new Error("quota");
          error.name = "QuotaExceededError";
          throw error;
        }
        storage.setItem(key, value);
      },
      removeItem: (key: string) => storage.removeItem(key),
    };
    const repo = createSavedBuildRepository(guarded, {
      now: () => NOW,
      createId: () => "build-test-1",
    });
    const created = repo.create(createInput());
    expect(created.ok).toBe(true);
    const before = storage.snapshot()[SAVED_BUILDS_STORAGE_KEY];

    failWrites = true;
    expect(repo.update("build-test-1", { name: "Changed" })).toMatchObject({
      ok: false,
      error: { code: "quota-exceeded" },
    });
    expect(repo.remove("build-test-1")).toMatchObject({
      ok: false,
      error: { code: "quota-exceeded" },
    });
    expect(storage.snapshot()[SAVED_BUILDS_STORAGE_KEY]).toBe(before);
  });

  it("sorts builds by most recently updated", () => {
    let now = new Date("2026-10-31T10:00:00.000Z");
    const storage = createMemoryStorage();
    let sequence = 0;
    const repo = createSavedBuildRepository(storage, {
      now: () => now,
      createId: () => `build-order-${++sequence}`,
    });
    repo.create(createInput({ name: "First" }));
    now = new Date("2026-10-31T11:00:00.000Z");
    repo.create(createInput({ name: "Second" }));
    now = new Date("2026-10-31T12:00:00.000Z");
    repo.rename("build-order-1", "First renamed");
    const list = repo.list();
    expect(list.ok).toBe(true);
    if (list.ok) {
      expect(list.builds.map((build) => build.id)).toEqual([
        "build-order-1",
        "build-order-2",
      ]);
    }
  });
});

describe("saved-build catalogue resolution", () => {
  it("reconstructs a build state and revalidates compatibility and power", () => {
    const build = makeBuild();
    const resolution = resolveSavedBuild(build, lookup);
    expect(resolution.importable).toBe(true);
    expect(resolution.missingReferences).toEqual([]);
    expect(resolution.components).toHaveLength(9);
    expect(resolution.state.selected.cpu).toEqual(["cpu-intel-core-i5-14600k"]);
    expect(resolution.compatibility.summary.status).not.toBe("incompatible");
    expect(resolution.power).toEqual(resolution.compatibility.power);
    expect(resolution.power.loadWatts).toBeGreaterThan(0);
  });

  it("preserves multi-slot state during reconstruction", () => {
    const selections = selectionsFromBuildState(
      buildState({
        cpu: ["cpu-intel-core-i5-14600k"],
        motherboard: ["motherboard-gigabyte-z790-aorus-elite-ax"],
        ram: ["ram-corsair-vengeance-32gb-ddr5-6000"],
        storage: [
          "storage-samsung-990-pro-1tb",
          "storage-seagate-barracuda-2tb",
        ],
        "case-fan": [
          "case-fan-arctic-p14-pwm",
          "case-fan-noctua-nf-a12x25-pwm",
        ],
      }),
    );
    const resolution = resolveSelections(selections, lookup);
    expect(resolution.state.selected.storage).toEqual([
      "storage-samsung-990-pro-1tb",
      "storage-seagate-barracuda-2tb",
    ]);
    expect(resolution.state.selected["case-fan"]).toEqual([
      "case-fan-arctic-p14-pwm",
      "case-fan-noctua-nf-a12x25-pwm",
    ]);
  });

  it("reports missing references instead of silently substituting", () => {
    const selections = manualSelections().map((selection) =>
      selection.category === "gpu"
        ? { ...selection, componentIds: ["gpu-missing-model"] }
        : selection,
    );
    const resolution = resolveSelections(selections, lookup);
    expect(resolution.importable).toBe(true);
    expect(resolution.missingReferences).toEqual([
      {
        category: "gpu",
        componentId: "gpu-missing-model",
        reason: "missing",
      },
    ]);
    expect(resolution.state.selected.gpu).toEqual([]);
    expect(resolution.warnings.join(" ")).toMatch(/could not be resolved/i);
  });

  it("rejects category mismatches as unresolved references", () => {
    const resolution = resolveSelections(
      [{ category: "cpu", componentIds: ["gpu-amd-radeon-rx-7600"] }],
      lookup,
    );
    expect(resolution.missingReferences).toEqual([
      {
        category: "cpu",
        componentId: "gpu-amd-radeon-rx-7600",
        reason: "category-mismatch",
      },
    ]);
    expect(resolution.importable).toBe(false);
  });

  it("marks the build unimportable when nothing resolves", () => {
    const resolution = resolveSelections(
      [
        { category: "cpu", componentIds: ["cpu-missing-model"] },
        { category: "gpu", componentIds: ["gpu-missing-model"] },
      ],
      lookup,
    );
    expect(resolution.importable).toBe(false);
    expect(resolution.components).toEqual([]);
    expect(resolution.missingReferences).toHaveLength(2);
  });

  it("warns about discontinued components", () => {
    const resolution = resolveSelections(
      [{ category: "cpu", componentIds: ["cpu-amd-ryzen-7-5800x3d"] }],
      lookup,
    );
    expect(resolution.nonProductionComponents.map((entry) => entry.id)).toEqual(
      ["cpu-amd-ryzen-7-5800x3d"],
    );
    expect(resolution.warnings.join(" ")).toMatch(
      /not recorded as in production/i,
    );
  });

  it("resolves renamed components by stable id", () => {
    const build = makeBuild({
      selections: [
        { category: "cpu", componentIds: ["cpu-intel-core-i5-14600k"] },
      ],
    });
    const original = byId.get("cpu-intel-core-i5-14600k");
    expect(original?.category).toBe("cpu");
    if (original?.category !== "cpu") return;
    const renamed = new Map(byId);
    renamed.set(original.id, { ...original, name: "Renamed display name" });
    const resolution = resolveSavedBuild(build, (id) => renamed.get(id));
    expect(resolution.components.map((component) => component.name)).toEqual([
      "Renamed display name",
    ]);
    expect(resolution.state.selected.cpu).toEqual(["cpu-intel-core-i5-14600k"]);
  });

  it("recomputes compatibility from changed catalogue specifications", () => {
    const build = makeBuild({
      selections: [
        { category: "cpu", componentIds: ["cpu-intel-core-i5-14600k"] },
        {
          category: "motherboard",
          componentIds: ["motherboard-gigabyte-z790-aorus-elite-ax"],
        },
      ],
    });
    const motherboard = byId.get("motherboard-gigabyte-z790-aorus-elite-ax");
    expect(motherboard?.category).toBe("motherboard");
    if (motherboard?.category !== "motherboard") return;

    const changed = new Map(byId);
    changed.set(motherboard.id, {
      ...motherboard,
      specs: { ...motherboard.specs, socket: "AM5" },
    });
    const resolution = resolveSavedBuild(build, (id) => changed.get(id));
    expect(resolution.compatibility.summary.status).toBe("incompatible");
    expect(
      resolution.compatibility.results.some(
        (result) => result.status === "incompatible",
      ),
    ).toBe(true);
    expect(evaluateBuild(resolution.components).summary.status).toBe(
      "incompatible",
    );
  });

  it("invents no compatibility verdicts when a critical specification is unknown", () => {
    const build = makeBuild({
      selections: [
        { category: "cpu", componentIds: ["cpu-amd-ryzen-7-7800x3d"] },
        {
          category: "motherboard",
          componentIds: ["motherboard-msi-b650-tomahawk-wifi"],
        },
        {
          category: "ram",
          componentIds: ["ram-corsair-vengeance-32gb-ddr5-6000"],
        },
      ],
    });
    const resolution = resolveSavedBuild(build, lookup);
    expect(resolution.compatibility.summary.status).not.toBe("compatible");
    expect(
      resolution.compatibility.results.some(
        (result) => result.status === "unknown",
      ),
    ).toBe(true);
  });
});
