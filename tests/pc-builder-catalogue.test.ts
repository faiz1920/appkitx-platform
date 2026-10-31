import { describe, expect, it } from "vitest";
import {
  catalogue,
  componentById,
  componentsByCategory,
} from "../src/lib/pc-builder/catalogue";
import { validateCatalogue } from "../src/lib/pc-builder/validate";
import {
  componentCategories,
  singleSlotCategories,
  multiSlotCategories,
} from "../src/lib/pc-builder/types";

describe("component catalogue", () => {
  it("passes catalogue-level runtime validation", () => {
    const result = validateCatalogue(catalogue);
    if (!result.ok) {
      // Surface all validation errors to make failures debuggable.
      expect.soft(result.errors).toEqual([]);
    }
    expect(result.ok).toBe(true);
  });

  it("has unique component ids", () => {
    const ids = catalogue.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers every supported category with at least one record", () => {
    for (const category of componentCategories) {
      expect(
        componentsByCategory(category).length,
        `category "${category}" should have catalogue entries`,
      ).toBeGreaterThan(0);
    }
  });

  it("covers more than one manufacturer", () => {
    const manufacturers = new Set(catalogue.map((c) => c.manufacturer));
    expect(manufacturers.size).toBeGreaterThan(1);
  });

  it("includes cross-socket coverage (AMD and Intel)", () => {
    const sockets = new Set([
      ...componentsByCategory("cpu").map((c) =>
        c.category === "cpu" ? c.specs.socket : "",
      ),
    ]);
    expect(sockets.size).toBeGreaterThan(1);
  });

  it("gives every record source attribution and a verification timestamp", () => {
    for (const component of catalogue) {
      expect(component.source.name).not.toBe("");
      expect(component.source.url).toMatch(/^https:\/\//);
      expect(component.source.accessedAt).not.toBe("");
      expect(component.lastVerified).not.toBe("");
    }
  });

  it("contains no pricing or stock data", () => {
    const text = JSON.stringify(catalogue);
    expect(text).not.toMatch(/"price"/i);
    expect(text).not.toMatch(/"stock"/i);
    expect(text).not.toMatch(/"currency"/i);
  });

  it("uses stable slug-style ids prefixed by category", () => {
    for (const component of catalogue) {
      expect(component.id).toMatch(/^[a-z0-9-]+$/);
      expect(
        component.id.startsWith(
          `${component.category === "case-fan" ? "case-fan" : component.category}`,
        ),
      ).toBe(true);
    }
  });

  it("looks up components by id", () => {
    const first = catalogue[0];
    expect(componentById(first.id)).toEqual(first);
    expect(componentById("does-not-exist")).toBeUndefined();
  });

  it("meets the M10.3 expansion targets per category", () => {
    const minimums = {
      cpu: 15,
      gpu: 12,
      motherboard: 12,
      ram: 10,
      cooler: 8,
      storage: 8,
      psu: 8,
      case: 8,
      "case-fan": 5,
    } as const;
    for (const [category, minimum] of Object.entries(minimums)) {
      expect(
        componentsByCategory(category as keyof typeof minimums).length,
        `${category} should have at least ${minimum} records`,
      ).toBeGreaterThanOrEqual(minimum);
    }
    expect(catalogue.length).toBeGreaterThanOrEqual(90);
  });

  it("attributes every record to manufacturer-published evidence", () => {
    for (const component of catalogue) {
      expect(component.provenance).toBe("manufacturer-specification");
      expect(component.source.url).toMatch(/^https:\/\//);
      expect(component.source.url).not.toMatch(
        /amazon|newegg|ebay|aliexpress/i,
      );
    }
  });

  it("covers both AMD and Intel CPU platforms including LGA1851", () => {
    const sockets = new Set(
      componentsByCategory("cpu").map((component) =>
        component.category === "cpu" ? component.specs.socket : "",
      ),
    );
    for (const socket of ["AM4", "AM5", "LGA1700", "LGA1851"]) {
      expect(sockets).toContain(socket);
    }
  });

  it("covers NVIDIA and AMD GPUs with reference specification fields", () => {
    const gpus = componentsByCategory("gpu");
    const manufacturers = new Set(
      gpus.map((component) => component.manufacturer),
    );
    expect(manufacturers).toContain("NVIDIA");
    expect(manufacturers).toContain("AMD");
    expect(
      gpus.some(
        (component) =>
          component.category === "gpu" && component.specs.boardPartner === null,
      ),
    ).toBe(true);
    expect(
      gpus.every(
        (component) =>
          component.category !== "gpu" || component.specs.chipset !== "",
      ),
    ).toBe(true);
  });

  it("covers DDR4 and DDR5 memory kits", () => {
    const generations = new Set(
      componentsByCategory("ram").map((component) =>
        component.category === "ram" ? component.specs.generation : "",
      ),
    );
    expect(generations).toContain("DDR4");
    expect(generations).toContain("DDR5");
  });

  it("covers air and liquid coolers across 240/280/360 radiator sizes", () => {
    const coolers = componentsByCategory("cooler");
    const types = new Set(
      coolers.map((component) =>
        component.category === "cooler" ? component.specs.type : "",
      ),
    );
    expect(types).toContain("air");
    expect(types).toContain("aio-liquid");
    const radiators = new Set(
      coolers
        .map((component) =>
          component.category === "cooler"
            ? component.specs.radiatorSizeMm
            : null,
        )
        .filter((size): size is number => size !== null),
    );
    for (const size of [120, 240, 280, 360]) expect(radiators).toContain(size);
  });

  it("covers NVMe, SATA SSD and HDD storage", () => {
    const storage = componentsByCategory("storage");
    expect(
      new Set(
        storage.map((component) =>
          component.category === "storage" ? component.specs.interface : "",
        ),
      ),
    ).toEqual(new Set(["nvme", "sata"]));
    expect(
      storage.some(
        (component) =>
          component.category === "storage" &&
          component.specs.storageType === "hdd",
      ),
    ).toBe(true);
  });

  it("covers PSU tiers from 550 W to 1000 W", () => {
    const wattages = componentsByCategory("psu")
      .map((component) =>
        component.category === "psu" ? component.specs.wattage : 0,
      )
      .sort((a, b) => a - b);
    expect(wattages[0]).toBeLessThanOrEqual(550);
    expect(wattages[wattages.length - 1]).toBeGreaterThanOrEqual(1000);
    expect(wattages.length).toBeGreaterThanOrEqual(8);
  });

  it("covers ATX, Micro-ATX and Mini-ITX case support", () => {
    const supported = new Set(
      componentsByCategory("case").flatMap((component) =>
        component.category === "case"
          ? component.specs.supportedFormFactors
          : [],
      ),
    );
    for (const formFactor of ["ATX", "Micro-ATX", "Mini-ITX"]) {
      expect(supported).toContain(formFactor);
    }
  });

  it("covers full-tower, mid-tower, mini-tower and SFF case types", () => {
    const types = new Set(
      componentsByCategory("case").map((component) =>
        component.category === "case" ? component.specs.caseType : "",
      ),
    );
    for (const type of ["full-tower", "mid-tower", "mini-tower", "sff"]) {
      expect(types).toContain(type);
    }
  });

  it("uses valid lifecycle states and documents discontinued parts", () => {
    const allowed = new Set([
      "in-production",
      "discontinued",
      "end-of-life",
      "unverified",
      "unknown",
    ]);
    for (const component of catalogue) {
      expect(allowed.has(component.availability)).toBe(true);
    }
    expect(
      catalogue.some((component) => component.availability === "discontinued"),
    ).toBe(true);
  });

  it("partitions categories into single- and multi-slot without overlap", () => {
    expect([...singleSlotCategories, ...multiSlotCategories].sort()).toEqual(
      [...componentCategories].sort(),
    );
    const overlap = singleSlotCategories.filter((c) =>
      (multiSlotCategories as readonly string[]).includes(c),
    );
    expect(overlap).toEqual([]);
  });
});

describe("M10.3.1 verified catalogue specifications", () => {
  const byId = new Map(catalogue.map((component) => [component.id, component]));

  function gpu(id: string) {
    const component = byId.get(id);
    expect(component?.category).toBe("gpu");
    if (!component || component.category !== "gpu") throw new Error(id);
    return component;
  }

  function pcCase(id: string) {
    const component = byId.get(id);
    expect(component?.category).toBe("case");
    if (!component || component.category !== "case") throw new Error(id);
    return component;
  }

  function motherboard(id: string) {
    const component = byId.get(id);
    expect(component?.category).toBe("motherboard");
    if (!component || component.category !== "motherboard") {
      throw new Error(id);
    }
    return component;
  }

  function psu(id: string) {
    const component = byId.get(id);
    expect(component?.category).toBe("psu");
    if (!component || component.category !== "psu") throw new Error(id);
    return component;
  }

  it("records verified GPU dimensions and PSU recommendations", () => {
    expect(gpu("gpu-nvidia-geforce-rtx-4070-fe").specs.lengthMm).toBe(244);
    expect(gpu("gpu-nvidia-geforce-rtx-4070-fe").specs.powerAdapter8pin).toBe(
      2,
    );
    expect(gpu("gpu-nvidia-geforce-rtx-4090-fe").specs.powerAdapter8pin).toBe(
      3,
    );
    expect(gpu("gpu-amd-radeon-rx-7600").specs.lengthMm).toBe(204);
    expect(gpu("gpu-amd-radeon-rx-7600-xt").specs.recommendedPsuW).toBe(600);
    expect(gpu("gpu-amd-radeon-rx-7700-xt").specs.recommendedPsuW).toBe(700);
    expect(gpu("gpu-amd-radeon-rx-6600").specs.slotWidth).toBeNull();
    expect(gpu("gpu-amd-radeon-rx-6600-xt").specs.slotWidth).toBeNull();
    expect(gpu("gpu-amd-radeon-rx-6950-xt").specs.lengthMm).toBeNull();
    expect(gpu("gpu-amd-radeon-rx-6950-xt").specs.slotWidth).toBeNull();
  });

  it("records verified case GPU, cooler and PSU clearances", () => {
    expect(pcCase("case-corsair-4000d-airflow").specs.maxPsuLengthMm).toBe(220);
    expect(pcCase("case-corsair-5000d-airflow").specs.maxPsuLengthMm).toBe(250);
    expect(pcCase("case-fractal-design-north").specs.maxCoolerHeightMm).toBe(
      145,
    );
    expect(
      pcCase("case-fractal-design-meshify-2-compact").specs.maxGpuLengthMm,
    ).toBe(341);
    expect(pcCase("case-lian-li-lancool-216").specs.maxPsuLengthMm).toBe(220);
    expect(pcCase("case-lian-li-o11-dynamic-evo").specs.maxGpuLengthMm).toBe(
      426,
    );
    expect(pcCase("case-lian-li-o11-dynamic-evo").specs.maxPsuLengthMm).toBe(
      220,
    );
    expect(pcCase("case-nzxt-h7-flow").specs.radiatorSupportMm).toContain(420);
    expect(pcCase("case-nzxt-h7-flow").specs.fanMounts).toEqual([
      { sizeMm: 140, maxCount: 6 },
      { sizeMm: 120, maxCount: 10 },
    ]);
    expect(pcCase("case-nzxt-h510").specs.fanMounts).toEqual([
      { sizeMm: 140, maxCount: 3 },
      { sizeMm: 120, maxCount: 4 },
    ]);
    expect(
      pcCase("case-corsair-7000d-airflow").specs.radiatorSupportMm,
    ).toContain(480);
  });

  it("documents per-slot M.2 data for every motherboard", () => {
    for (const component of componentsByCategory("motherboard")) {
      if (component.category !== "motherboard") continue;
      expect(
        component.specs.m2SlotDetails,
        `${component.id} should have per-slot M.2 data`,
      ).not.toBeNull();
      expect(component.specs.m2SlotDetails?.length).toBe(
        component.specs.m2Slots,
      );
    }
  });

  it("records verified motherboard memory ceilings and slot sharing", () => {
    const b650 = motherboard("motherboard-msi-b650-tomahawk-wifi");
    expect(b650.specs.maxRamGB).toBe(256);
    expect(Math.max(...(b650.specs.supportedRamSpeedsMTs ?? []))).toBe(7600);
    expect(
      b650.specs.m2SlotDetails?.some((slot) => slot.sharingNote !== null),
    ).toBe(true);

    const z890 = motherboard("motherboard-asus-rog-strix-z890-a-gaming-wifi");
    expect(z890.specs.m2Slots).toBe(5);
    expect(z890.specs.maxRamGB).toBe(256);
    expect(Math.max(...(z890.specs.supportedRamSpeedsMTs ?? []))).toBe(9066);

    expect(motherboard("motherboard-asrock-b660m-pro-rs").availability).toBe(
      "discontinued",
    );
  });

  it("records verified PSU native connector inventories", () => {
    expect(psu("psu-corsair-rm850e-2023").specs.connectors.pcie8pin).toBe(3);
    expect(psu("psu-corsair-rm850e-2023").specs.connectors.sata).toBe(7);
    expect(psu("psu-msi-mpg-a850g-pcie5").specs.connectors.pcie8pin).toBe(6);
    expect(psu("psu-msi-mpg-a1000g-pcie5").specs.connectors.pcie8pin).toBe(6);
  });

  it("records the verified Core Ultra memory ceiling", () => {
    const ultra = byId.get("cpu-intel-core-ultra-7-265k");
    expect(ultra?.category).toBe("cpu");
    if (ultra?.category === "cpu") {
      expect(ultra.specs.maxMemoryGB).toBe(256);
    }
  });

  it("uses the verified Corsair H60x identity and no legacy identity", () => {
    const h60x = byId.get("cooler-corsair-icue-h60x-rgb-elite");
    expect(h60x?.category).toBe("cooler");
    if (h60x?.category !== "cooler") throw new Error("missing H60x record");
    expect(h60x.name).toBe("iCUE H60x RGB ELITE");
    expect(h60x.model).toBe("CW-9060064-WW2");
    expect(h60x.source.url).toContain("cw-9060064-ww2");
    expect(h60x.specs.radiatorSizeMm).toBe(120);
    expect(h60x.specs.radiatorThicknessMm).toBeNull();
    const h60Coolers = componentsByCategory("cooler").filter(
      (component) =>
        component.category === "cooler" && component.name.includes("H60"),
    );
    expect(h60Coolers).toHaveLength(1);
    expect(h60Coolers[0]?.name).toBe("iCUE H60x RGB ELITE");
  });

  it("uses canonical Corsair case URLs without duplicated slugs", () => {
    const cases = [
      [
        "case-corsair-4000d-airflow",
        "cc-9011200-ww",
        "4000d-airflow-tempered-glass-mid-tower-atx-case-black",
      ],
      [
        "case-corsair-5000d-airflow",
        "cc-9011210-ww",
        "5000d-airflow-tempered-glass-mid-tower-atx-case-black",
      ],
      [
        "case-corsair-7000d-airflow",
        "cc-9011218-ww",
        "7000d-airflow-full-tower-atx-case-black",
      ],
    ] as const;
    for (const [id, sku, slug] of cases) {
      const component = pcCase(id);
      const expected = `https://www.corsair.com/us/en/p/pc-cases/${sku}/${slug}`;
      expect(component.url).toBe(expected);
      expect(component.source.url).toBe(expected);
      expect(component.url).not.toContain(`${slug}${slug}`);
    }
  });

  it("uses the verified Crucial MX500 product flyer as provenance", () => {
    const mx500 = byId.get("storage-crucial-mx500-1tb");
    expect(mx500?.category).toBe("storage");
    if (mx500?.category !== "storage") throw new Error("missing MX500 record");
    expect(mx500.url).toBeUndefined();
    expect(mx500.source.name).toBe("Crucial MX500 product flyer");
    expect(mx500.source.url).toContain("crucial-mx500-ssd-productflyer-en.pdf");
    expect(mx500.specs.capacityGB).toBe(1000);
    expect(mx500.specs.interface).toBe("sata");
    expect(mx500.specs.seqReadMBps).toBe(560);
  });
});
