import { describe, expect, it } from "vitest";
import {
  clearBuild,
  createEmptyBuild,
  isAtCategoryLimit,
  isMultiSlot,
  isSelected,
  isSingleSlot,
  removeComponent,
  resolveBuild,
  selectComponent,
  selectedCount,
  selectedCountForCategory,
  selectedIds,
} from "../src/lib/pc-builder/build-state";
import { catalogue } from "../src/lib/pc-builder/catalogue";
import { componentCategories } from "../src/lib/pc-builder/types";
import {
  makeCaseFan,
  makeCpu,
  makeGpu,
  makePsu,
  makeRam,
  makeStorage,
} from "./pc-builder-fixtures";

const byId = new Map(catalogue.map((component) => [component.id, component]));

describe("createEmptyBuild", () => {
  it("starts with no selections in every category", () => {
    const state = createEmptyBuild();
    for (const category of componentCategories) {
      expect(state.selected[category]).toEqual([]);
    }
    expect(selectedCount(state)).toBe(0);
    expect(selectedIds(state)).toEqual([]);
  });

  it("returns a fresh state each time", () => {
    const a = createEmptyBuild();
    const b = createEmptyBuild();
    expect(a).not.toBe(b);
    expect(a.selected).not.toBe(b.selected);
  });
});

describe("category slots", () => {
  it("treats CPU, GPU, motherboard, cooler, PSU and case as single-slot", () => {
    for (const category of [
      "cpu",
      "gpu",
      "motherboard",
      "cooler",
      "psu",
      "case",
    ] as const) {
      expect(isSingleSlot(category)).toBe(true);
      expect(isMultiSlot(category)).toBe(false);
    }
  });

  it("treats RAM, storage and case fans as multi-slot", () => {
    for (const category of ["ram", "storage", "case-fan"] as const) {
      expect(isMultiSlot(category)).toBe(true);
      expect(isSingleSlot(category)).toBe(false);
    }
  });
});

describe("selectComponent", () => {
  it("selects a component into an empty build", () => {
    const state = selectComponent(createEmptyBuild(), "cpu", makeCpu().id);
    expect(selectedCount(state)).toBe(1);
  });

  it("replaces a single-slot selection without touching other categories", () => {
    const cpuA = makeCpu();
    const cpuB = makeCpu({ socket: "AM4" });
    const gpu = makeGpu();
    let state = createEmptyBuild();
    state = selectComponent(state, "cpu", cpuA.id);
    state = selectComponent(state, "gpu", gpu.id);
    state = selectComponent(state, "cpu", cpuB.id);

    expect(state.selected.cpu).toEqual([cpuB.id]);
    expect(state.selected.gpu).toEqual([gpu.id]);
    expect(selectedCount(state)).toBe(2);
  });

  it("appends multi-slot selections", () => {
    const kitA = makeRam();
    const kitB = makeRam({ speedMTs: 5200 });
    let state = createEmptyBuild();
    state = selectComponent(state, "ram", kitA.id);
    state = selectComponent(state, "ram", kitB.id);
    expect(state.selected.ram).toEqual([kitA.id, kitB.id]);
    expect(selectedCountForCategory(state, "ram")).toBe(2);
  });

  it("prevents duplicate multi-slot selections", () => {
    const kit = makeRam();
    let state = createEmptyBuild();
    state = selectComponent(state, "ram", kit.id);
    const again = selectComponent(state, "ram", kit.id);
    expect(again).toBe(state);
    expect(again.selected.ram).toEqual([kit.id]);
  });

  it("is a no-op when reselecting the current single-slot component", () => {
    const cpu = makeCpu();
    const state = selectComponent(createEmptyBuild(), "cpu", cpu.id);
    expect(selectComponent(state, "cpu", cpu.id)).toBe(state);
  });

  it("ignores empty ids", () => {
    const state = createEmptyBuild();
    expect(selectComponent(state, "cpu", "")).toBe(state);
  });

  it("does not mutate the previous state", () => {
    const state = createEmptyBuild();
    const next = selectComponent(state, "cpu", "cpu-x");
    expect(state.selected.cpu).toEqual([]);
    expect(next.selected.cpu).toEqual(["cpu-x"]);
  });

  it("does not mutate a multi-slot array in place", () => {
    const state = selectComponent(createEmptyBuild(), "storage", "s1");
    const next = selectComponent(state, "storage", "s2");
    expect(state.selected.storage).toEqual(["s1"]);
    expect(next.selected.storage).toEqual(["s1", "s2"]);
  });

  it("stops at the schema-backed maximum for every multi-slot category", () => {
    for (const [category, maximum] of [
      ["ram", 8],
      ["storage", 12],
      ["case-fan", 16],
    ] as const) {
      let state = createEmptyBuild();
      for (let index = 0; index < maximum; index += 1) {
        state = selectComponent(state, category, `${category}-${index}`);
      }
      expect(selectedCountForCategory(state, category)).toBe(maximum);
      expect(isAtCategoryLimit(state, category)).toBe(true);
      const blocked = selectComponent(state, category, `${category}-overflow`);
      expect(blocked).toBe(state);
      expect(selectedCountForCategory(blocked, category)).toBe(maximum);
    }
  });
});

describe("removeComponent", () => {
  it("removes a single-slot selection", () => {
    const cpu = makeCpu();
    let state = selectComponent(createEmptyBuild(), "cpu", cpu.id);
    state = removeComponent(state, "cpu", cpu.id);
    expect(state.selected.cpu).toEqual([]);
  });

  it("removes one item from a multi-slot category and keeps the rest", () => {
    const a = makeStorage();
    const b = makeStorage();
    let state = createEmptyBuild();
    state = selectComponent(state, "storage", a.id);
    state = selectComponent(state, "storage", b.id);
    state = removeComponent(state, "storage", a.id);
    expect(state.selected.storage).toEqual([b.id]);
  });

  it("is a no-op for a component that is not selected", () => {
    const state = createEmptyBuild();
    expect(removeComponent(state, "cpu", "nope")).toBe(state);
  });

  it("does not mutate the previous state", () => {
    const cpu = makeCpu();
    const state = selectComponent(createEmptyBuild(), "cpu", cpu.id);
    removeComponent(state, "cpu", cpu.id);
    expect(state.selected.cpu).toEqual([cpu.id]);
  });
});

describe("clearBuild", () => {
  it("drops every selection", () => {
    let state = createEmptyBuild();
    state = selectComponent(state, "cpu", "cpu-1");
    state = selectComponent(state, "ram", "ram-1");
    expect(selectedCount(clearBuild())).toBe(0);
    expect(clearBuild().selected).not.toBe(state.selected);
  });
});

describe("isSelected / selectedIds", () => {
  it("reports membership per category", () => {
    const fan = makeCaseFan();
    const state = selectComponent(createEmptyBuild(), "case-fan", fan.id);
    expect(isSelected(state, "case-fan", fan.id)).toBe(true);
    expect(isSelected(state, "case-fan", "other")).toBe(false);
  });

  it("flattens ids in canonical category order", () => {
    let state = createEmptyBuild();
    state = selectComponent(state, "psu", makePsu().id);
    state = selectComponent(state, "cpu", makeCpu().id);
    expect(selectedIds(state)).toEqual([
      state.selected.cpu[0],
      state.selected.psu[0],
    ]);
  });
});

describe("resolveBuild", () => {
  it("resolves catalogue ids to records in category order", () => {
    let state = createEmptyBuild();
    state = selectComponent(state, "gpu", "gpu-amd-radeon-rx-7800-xt");
    state = selectComponent(state, "cpu", "cpu-amd-ryzen-7-7800x3d");
    const resolved = resolveBuild(state, (id) => byId.get(id));
    expect(resolved.components.map((c) => c.category)).toEqual(["cpu", "gpu"]);
    expect(resolved.components).toHaveLength(2);
    expect(resolved.missingIds).toEqual([]);
  });

  it("reports ids missing from the catalogue instead of silently dropping them", () => {
    const state = selectComponent(
      createEmptyBuild(),
      "cpu",
      "cpu-removed-model",
    );
    const resolved = resolveBuild(state, () => undefined);
    expect(resolved.components).toEqual([]);
    expect(resolved.missingIds).toEqual(["cpu-removed-model"]);
  });

  it("rejects ids whose record belongs to another category", () => {
    const cpu = makeCpu();
    const state = selectComponent(createEmptyBuild(), "gpu", cpu.id);
    const resolved = resolveBuild(state, (id) =>
      id === cpu.id ? cpu : undefined,
    );
    expect(resolved.components).toEqual([]);
    expect(resolved.missingIds).toEqual([cpu.id]);
  });
});
