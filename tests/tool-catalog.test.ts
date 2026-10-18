import { describe, expect, it } from "vitest";
import { dictionaries } from "../src/i18n/config";
import {
  localizedToolCatalog,
  resolveLocalizedTools,
} from "../src/i18n/tool-catalog";
import { tools } from "../src/lib/tools";

/*
 * M4 invariant: the localized catalog is a map over the tools registry, so
 * only implemented tools exist in it — in every locale — and placeholder
 * homepage cards can never leak into search or related-tools lists.
 */

describe("localizedToolCatalog", () => {
  for (const locale of Object.keys(dictionaries) as Array<
    keyof typeof dictionaries
  >) {
    it(`maps the registry one-to-one for ${locale}`, () => {
      const catalog = localizedToolCatalog(locale);
      expect(catalog.map((tool) => tool.href)).toEqual(
        tools.map((tool) => tool.href),
      );
      expect(catalog.map((tool) => tool.icon)).toEqual(
        tools.map((tool) => tool.icon),
      );
    });
  }

  it("uses localized copy and category labels", () => {
    const catalog = localizedToolCatalog("es");
    const percentage = catalog.find(
      (tool) => tool.href === "/percentage-calculator",
    );
    const discount = catalog.find(
      (tool) => tool.href === "/discount-calculator",
    );
    expect(percentage?.title).toBe("Calculadora de porcentajes");
    expect(percentage?.category).toBe("Calculadoras");
    expect(percentage?.keywords).toContain("porcentaje");
    expect(percentage?.description).toBe(
      "Porcentajes, propinas, descuentos y variación porcentual.",
    );
    expect(discount?.title).toBe("Calculadora de descuentos");
    expect(discount?.keywords).toContain("descuento");
    expect(discount?.description).toBe(
      "Ahorro y precio final tras un descuento.",
    );
  });

  it("keeps the English card text identical to the registry descriptions", () => {
    const catalog = localizedToolCatalog("en");
    for (const tool of tools) {
      const localized = catalog.find((entry) => entry.href === tool.href);
      expect(localized?.description).toBe(tool.description);
    }
  });

  it("keeps placeholder cards out of every catalog", () => {
    for (const locale of Object.keys(dictionaries) as Array<
      keyof typeof dictionaries
    >) {
      const titles = localizedToolCatalog(locale).map((tool) => tool.title);
      const placeholders = Object.values(
        dictionaries[locale].home.placeholderTools,
      ).map((placeholder) => placeholder.title);
      for (const title of placeholders) {
        expect(titles).not.toContain(title);
      }
    }
  });
});

describe("resolveLocalizedTools", () => {
  it("resolves localized tools in the requested order", () => {
    const resolved = resolveLocalizedTools("es", [
      "/discount-calculator",
      "/percentage-calculator",
    ]);
    expect(resolved.map((tool) => tool.href)).toEqual([
      "/discount-calculator",
      "/percentage-calculator",
    ]);
    expect(resolved[0]?.title).toBe("Calculadora de descuentos");
  });

  it("drops unknown references instead of creating broken links", () => {
    expect(resolveLocalizedTools("en", ["#", "/unit-converter"])).toEqual([]);
    expect(resolveLocalizedTools("es", [])).toEqual([]);
  });
});
