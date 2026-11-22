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
    const base64 = catalog.find((tool) => tool.href === "/base64-encoder");
    const json = catalog.find((tool) => tool.href === "/json-formatter");
    expect(base64?.title).toBe("Codificador Base64");
    expect(base64?.category).toBe("Herramientas de desarrollo");
    expect(base64?.keywords).toContain("codificar");
    expect(json?.title).toBe("Formateador JSON");
    expect(json?.description).toBe(
      "Formatea, minimiza y valida JSON en tu navegador.",
    );
    const dateCalculator = catalog.find(
      (tool) => tool.href === "/date-calculator",
    );
    const ageCalculator = catalog.find(
      (tool) => tool.href === "/age-calculator",
    );
    expect(dateCalculator?.title).toBe("Calculadora de fechas");
    expect(dateCalculator?.category).toBe("Fecha y hora");
    expect(dateCalculator?.keywords).toContain("días entre");
    expect(ageCalculator?.title).toBe("Calculadora de edad");
    expect(ageCalculator?.category).toBe("Fecha y hora");
    expect(ageCalculator?.keywords).toContain("cumpleaños");

    const wordCounter = catalog.find((tool) => tool.href === "/word-counter");
    const caseConverter = catalog.find(
      (tool) => tool.href === "/case-converter",
    );
    expect(wordCounter?.title).toBe("Contador de palabras");
    expect(wordCounter?.category).toBe("Herramientas de texto");
    expect(wordCounter?.keywords).toContain("palabras");
    expect(caseConverter?.title).toBe("Conversor de mayúsculas y minúsculas");
    expect(caseConverter?.category).toBe("Herramientas de texto");
    expect(caseConverter?.keywords).toContain("mayúsculas");

    const scientific = catalog.find(
      (tool) => tool.href === "/scientific-calculator",
    );
    expect(scientific?.title).toBe("Calculadora científica");
    expect(scientific?.category).toBe("Calculadoras");
    expect(scientific?.keywords).toContain("trigonometría");

    const emi = catalog.find((tool) => tool.href === "/emi-calculator");
    expect(emi?.title).toBe("Calculadora de EMI");
    expect(emi?.category).toBe("Calculadoras");
    expect(emi?.keywords).toContain("calendario de amortización");

    const compound = catalog.find(
      (tool) => tool.href === "/compound-interest-calculator",
    );
    expect(compound?.title).toBe("Calculadora de interés compuesto");
    expect(compound?.category).toBe("Calculadoras");
    expect(compound?.keywords).toContain("interés compuesto");

    const savings = catalog.find(
      (tool) => tool.href === "/savings-goal-calculator",
    );
    expect(savings?.title).toBe("Calculadora de objetivo de ahorro");
    expect(savings?.category).toBe("Calculadoras");
    expect(savings?.keywords).toContain("objetivo de ahorro");

    const retirement = catalog.find(
      (tool) => tool.href === "/retirement-calculator",
    );
    expect(retirement?.title).toBe("Calculadora de jubilación");
    expect(retirement?.category).toBe("Calculadoras");
    expect(retirement?.keywords).toContain("retiro");

    const timeZone = catalog.find(
      (tool) => tool.href === "/time-zone-converter",
    );
    expect(timeZone?.title).toBe("Conversor de zonas horarias");
    expect(timeZone?.category).toBe("Fecha y hora");
    expect(timeZone?.keywords).toContain("conversor de zonas horarias");
  });

  it("keeps the English card text identical to the registry descriptions", () => {
    const catalog = localizedToolCatalog("en");
    for (const tool of tools) {
      const localized = catalog.find((entry) => entry.href === tool.href);
      expect(localized?.description).toBe(tool.description);
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
    expect(resolveLocalizedTools("en", ["#", "/not-a-tool"])).toEqual([]);
    expect(resolveLocalizedTools("es", [])).toEqual([]);
  });
});
