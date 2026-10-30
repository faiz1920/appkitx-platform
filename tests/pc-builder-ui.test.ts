import { describe, expect, it } from "vitest";
import { evaluateBuild } from "../src/lib/pc-builder/engine";
import {
  CATEGORY_LABELS,
  COMPATIBILITY_STATUS_LABELS,
  availabilityLabel,
  categoriesSelectedText,
  componentDisplayName,
  componentSourceLabel,
  countSelectedCategories,
  filterComponents,
  findingCountsText,
  formatPower,
  manufacturerOptions,
  missingSpecLabels,
  overallStatusLabel,
  sortComponents,
  sortedFindings,
  specLines,
} from "../src/lib/pc-builder/ui";
import { catalogue, componentById } from "../src/lib/pc-builder/catalogue";
import type { Component, ComponentCategory } from "../src/lib/pc-builder/types";
import {
  makeCpu,
  makeGpu,
  makeMotherboard,
  makePsu,
  makeRam,
  makeStorage,
} from "./pc-builder-fixtures";

function cpu(id: string): Component {
  return componentById(id)!;
}

describe("category labels", () => {
  it("labels all nine categories", () => {
    const categories = Object.keys(CATEGORY_LABELS) as ComponentCategory[];
    expect(categories).toHaveLength(9);
    for (const category of categories) {
      expect(CATEGORY_LABELS[category].length).toBeGreaterThan(0);
    }
  });
});

describe("filterComponents", () => {
  const components = [
    makeCpu({}, "cpu-a"),
    makeGpu({}, "gpu-b"),
    makeMotherboard({}, "mb-c"),
    makeRam({}, "ram-d"),
  ].map((component, i) => ({
    ...component,
    manufacturer: ["AMD", "NVIDIA", "ASUS", "Corsair"][i],
    name: ["Ryzen", "GeForce", "TUF", "Vengeance"][i],
  }));

  it("returns everything for an empty filter", () => {
    expect(filterComponents(components)).toHaveLength(4);
  });

  it("matches product names case-insensitively", () => {
    expect(
      filterComponents(components, { search: "geforce" }).map((c) => c.id),
    ).toEqual(["gpu-b"]);
  });

  it("matches manufacturers", () => {
    expect(
      filterComponents(components, { search: "amd" }).map((c) => c.id),
    ).toEqual(["cpu-a"]);
  });

  it("matches model identifiers", () => {
    expect(filterComponents(components, { search: "TB-1" })).toHaveLength(4);
  });

  it("combines search with a manufacturer filter", () => {
    expect(
      filterComponents(components, { search: "tuf", manufacturer: "ASUS" }).map(
        (c) => c.id,
      ),
    ).toEqual(["mb-c"]);
    expect(
      filterComponents(components, { search: "tuf", manufacturer: "AMD" }),
    ).toEqual([]);
  });

  it("trims whitespace", () => {
    expect(filterComponents(components, { search: "  ryzen  " })).toHaveLength(
      1,
    );
  });

  it("returns an empty list for no matches", () => {
    expect(filterComponents(components, { search: "zzz" })).toEqual([]);
  });

  it("handles an empty catalogue", () => {
    expect(filterComponents([], { search: "cpu" })).toEqual([]);
  });
});

describe("manufacturerOptions", () => {
  it("returns unique manufacturers sorted alphabetically", () => {
    const options = manufacturerOptions(catalogue);
    expect(new Set(options).size).toBe(options.length);
    expect([...options].sort((a, b) => a.localeCompare(b, "en"))).toEqual(
      options,
    );
    expect(options).toContain("AMD");
    expect(options).toContain("Noctua");
  });
});

describe("sortComponents", () => {
  it("sorts by manufacturer then name without mutating the input", () => {
    const input = [...catalogue];
    const snapshot = [...input];
    const sorted = sortComponents(input);
    expect(input).toEqual(snapshot);
    for (let i = 1; i < sorted.length; i += 1) {
      const previous = sorted[i - 1];
      const current = sorted[i];
      const previousKey = `${previous.manufacturer}\u0000${previous.name}`;
      const currentKey = `${current.manufacturer}\u0000${current.name}`;
      expect(previousKey.localeCompare(currentKey, "en")).toBeLessThanOrEqual(
        0,
      );
    }
  });
});

describe("component labels", () => {
  it("joins manufacturer and product name", () => {
    expect(componentDisplayName(makeCpu())).toBe("Testbrand TestCPU 1000");
  });

  it("maps availability statuses to readable labels", () => {
    expect(availabilityLabel(makeCpu())).toBe("In production");
    expect(
      availabilityLabel({ ...makeCpu(), availability: "discontinued" }),
    ).toBe("Discontinued");
    expect(availabilityLabel({ ...makeCpu(), availability: "unknown" })).toBe(
      "Availability unknown",
    );
  });

  it("shows source attribution and verification date", () => {
    const label = componentSourceLabel(makeCpu());
    expect(label).toContain("Test fixture");
    expect(label).toContain("2026-01-01");
  });
});

describe("specLines", () => {
  it("renders published CPU specifications", () => {
    const lines = specLines(cpu("cpu-amd-ryzen-7-7800x3d"));
    const map = Object.fromEntries(
      lines.map((line) => [line.label, line.value]),
    );
    expect(map.Socket).toBe("AM5");
    expect(map.Memory).toBe("DDR5");
    expect(map["Base TDP"]).toBe("120 W");
    expect(map["Integrated graphics"]).toBe("Yes");
  });

  it("omits unknown values instead of inventing them", () => {
    const lines = specLines(makeCpu({ tdpW: null, maxMemoryGB: null }));
    const labels = lines.map((line) => line.label);
    expect(labels).not.toContain("Base TDP");
    expect(labels).not.toContain("Max memory");
  });

  it("renders GPU connector and clearance data", () => {
    const lines = specLines(cpu("gpu-nvidia-geforce-rtx-4090-fe"));
    const map = Object.fromEntries(
      lines.map((line) => [line.label, line.value]),
    );
    expect(map.Length).toBe("304 mm");
    expect(map["Power connectors"]).toBe("1 × 16-pin");
    expect(map["Recommended PSU"]).toBe("850 W");
  });

  it("renders RAM kit details", () => {
    const map = Object.fromEntries(
      specLines(makeRam()).map((l) => [l.label, l.value]),
    );
    expect(map.Modules).toBe("2 × 16 GB");
    expect(map["Total capacity"]).toBe("32 GB");
    expect(map.Type).toBe("DDR5-6000");
  });

  it("renders storage interface and form factor", () => {
    const nvme = Object.fromEntries(
      specLines(makeStorage()).map((l) => [l.label, l.value]),
    );
    expect(nvme.Type).toBe("SSD · NVMe");
    expect(nvme["Form factor"]).toBe("M.2 2280");
    const sata = Object.fromEntries(
      specLines(
        makeStorage({
          interface: "sata",
          formFactor: "2.5-inch",
          m2LengthMm: null,
          pcieGeneration: null,
        }),
      ).map((l) => [l.label, l.value]),
    );
    expect(sata["Form factor"]).toBe('2.5"');
  });

  it("renders PSU connector inventory", () => {
    const map = Object.fromEntries(
      specLines(makePsu()).map((l) => [l.label, l.value]),
    );
    expect(map["Rated wattage"]).toBe("750 W");
    expect(map["PCIe 8-pin"]).toBe("4");
    expect(map["16-pin (12VHPWR)"]).toBe("0");
  });

  it("handles every catalogue record without throwing", () => {
    for (const component of catalogue) {
      expect(Array.isArray(specLines(component))).toBe(true);
      expect(specLines(component).length).toBeGreaterThan(0);
    }
  });
});

describe("missingSpecLabels", () => {
  it("lists unknown CPU attributes", () => {
    const labels = missingSpecLabels(
      makeCpu({ supportedChipsets: null, maxPowerW: null }),
    );
    expect(labels).toContain("supported chipsets");
    expect(labels).toContain("boost power");
  });

  it("does not report structural nulls for air coolers", () => {
    const air = catalogue.find(
      (component) =>
        component.category === "cooler" && component.specs.type === "air",
    )!;
    const labels = missingSpecLabels(air);
    expect(labels).not.toContain("radiator size");
  });

  it("does not report structural nulls for SATA storage", () => {
    const sata = makeStorage({
      interface: "sata",
      formFactor: "2.5-inch",
      m2LengthMm: null,
      pcieGeneration: null,
    });
    expect(missingSpecLabels(sata)).toEqual([]);
  });

  it("reports every unknown field of a sparse GPU", () => {
    const sparse = makeGpu({
      pcieGeneration: null,
      pcieLanes: null,
      lengthMm: null,
      slotWidth: null,
      powerDrawW: null,
      recommendedPsuW: null,
      powerConnectors: null,
      displayOutputs: null,
    });
    expect(missingSpecLabels(sparse)).toHaveLength(8);
  });
});

describe("compatibility presentation", () => {
  const compatibleBuild = evaluateBuild([
    makeCpu({ socket: "AM5" }),
    makeMotherboard({ socket: "AM5", ramGeneration: "DDR5" }),
    makeRam({ generation: "DDR5" }),
  ]);

  it("labels every status", () => {
    expect(COMPATIBILITY_STATUS_LABELS).toEqual({
      compatible: "Compatible",
      warning: "Warning",
      incompatible: "Incompatible",
      unknown: "Unknown",
    });
  });

  it("sorts findings by severity without mutating the report", () => {
    const before = compatibleBuild.results.map((result) => result.ruleId);
    const sorted = sortedFindings(compatibleBuild);
    expect(sorted).toHaveLength(compatibleBuild.results.length);
    const ranks = sorted.map((r) => COMPATIBILITY_STATUS_LABELS[r.status]);
    expect(ranks.indexOf("Incompatible")).toBeLessThan(
      ranks.indexOf("Unknown"),
    );
    expect(ranks.indexOf("Unknown")).toBeLessThan(ranks.indexOf("Compatible"));
    expect(compatibleBuild.results.map((result) => result.ruleId)).toEqual(
      before,
    );
    expect(sorted).not.toBe(compatibleBuild.results);
  });

  it("summarises counts for announcements", () => {
    const text = findingCountsText(compatibleBuild);
    expect(text).toMatch(/incompatible/);
    expect(text).toMatch(/warning/);
    expect(text).toMatch(/unknown/);
    expect(text).toMatch(/compatible/);
  });

  it("labels an empty report as having no components, never compatible", () => {
    expect(overallStatusLabel(evaluateBuild([]))).toBe(
      "No components selected",
    );
  });

  it("labels a selection with no applicable rule as not enough data", () => {
    expect(overallStatusLabel(evaluateBuild([makeCpu()]), 1)).toBe(
      "Not enough data",
    );
  });

  it("uses the engine's overall status otherwise", () => {
    expect(overallStatusLabel(compatibleBuild)).toBe(
      COMPATIBILITY_STATUS_LABELS[compatibleBuild.summary.status],
    );
  });
});

describe("power presentation", () => {
  it("formats known and unknown wattages", () => {
    expect(formatPower(431)).toBe("431 W");
    expect(formatPower(null)).toBe("—");
  });
});

describe("build progress", () => {
  it("counts categories with at least one selection", () => {
    expect(
      countSelectedCategories({
        cpu: ["a"],
        gpu: [],
        motherboard: ["b"],
        ram: ["c", "d"],
        cooler: [],
        storage: [],
        psu: [],
        case: [],
        "case-fan": [],
      }),
    ).toBe(3);
  });

  it("formats the progress label", () => {
    expect(categoriesSelectedText(2)).toBe("2 of 9 categories selected");
  });
});
