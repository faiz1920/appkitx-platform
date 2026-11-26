import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  foldSearchText,
  normalizeQuery,
  searchTools,
  type SearchableTool,
} from "../src/lib/search";
import { resolveTools, tools } from "../src/lib/tools";
import { localizedToolCatalog } from "../src/i18n/tool-catalog";

const fixture: SearchableTool[] = [
  {
    title: "Alpha Tool",
    href: "/alpha",
    description: "Handles alpha tasks.",
    category: "Calculators",
    keywords: ["first", "aaa"],
    icon: "calculator",
  },
  {
    title: "Beta Utility",
    href: "/beta",
    description: "Works with alpha values.",
    category: "Developer tools",
    keywords: ["second"],
    icon: "tag",
  },
  {
    title: "Gamma",
    href: "/gamma",
    description: "Unrelated helper.",
    category: "Text tools",
    keywords: ["third"],
    icon: "tag",
  },
];

describe("tool registry", () => {
  it("only registers tools whose routes resolve to real pages", () => {
    for (const tool of tools) {
      const slug = tool.href.replace(/^\//, "");
      expect(
        existsSync(new URL(`../src/pages/${slug}.astro`, import.meta.url)),
        `${tool.href} has no page`,
      ).toBe(true);
    }
  });

  it("keeps hrefs and titles unique", () => {
    const hrefs = tools.map((tool) => tool.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    const titles = tools.map((tool) => tool.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("does not register placeholder routes", () => {
    for (const tool of tools) {
      expect(tool.href.startsWith("/")).toBe(true);
      expect(tool.href).not.toBe("#");
    }
  });
});

describe("resolveTools", () => {
  it("resolves registered hrefs in the requested order", () => {
    expect(
      resolveTools(["/discount-calculator", "/percentage-calculator"]).map(
        (tool) => tool.href,
      ),
    ).toEqual(["/discount-calculator", "/percentage-calculator"]);
  });

  it("drops unknown references instead of creating broken links", () => {
    expect(resolveTools(["/nope", "/percentage-calculator"])).toEqual([
      tools.find((tool) => tool.href === "/percentage-calculator"),
    ]);
    expect(resolveTools(["#", "/not-a-tool"])).toEqual([]);
  });

  it("returns an empty list for an empty request", () => {
    expect(resolveTools([])).toEqual([]);
  });
});

describe("normalizeQuery", () => {
  it("trims and lowercases", () => {
    expect(normalizeQuery("  DisCount  ")).toBe("discount");
  });

  it("folds diacritics for matching only", () => {
    expect(normalizeQuery("  Variación  ")).toBe("variacion");
    expect(foldSearchText("Número")).toBe("numero");
    expect(foldSearchText("Añadir")).toBe("anadir");
    expect(foldSearchText("Discount")).toBe("discount");
  });
});

describe("searchTools", () => {
  it("returns the full catalog for empty or whitespace queries", () => {
    expect(searchTools("")).toEqual([...tools]);
    expect(searchTools("   ")).toEqual([...tools]);
    expect(searchTools("", fixture)).toEqual(fixture);
  });

  it("matches by title and ranks title matches above description matches", () => {
    expect(searchTools("discount", tools).map((tool) => tool.href)).toEqual([
      "/discount-calculator",
      "/percentage-calculator",
    ]);
    expect(searchTools("alpha", fixture).map((tool) => tool.title)).toEqual([
      "Alpha Tool",
      "Beta Utility",
    ]);
  });

  it("matches by keyword", () => {
    expect(searchTools("markdown", tools).map((tool) => tool.href)).toEqual([
      "/discount-calculator",
    ]);
    expect(searchTools("third", fixture).map((tool) => tool.title)).toEqual([
      "Gamma",
    ]);
  });

  it("matches by category", () => {
    expect(
      searchTools("developer tools", fixture).map((tool) => tool.title),
    ).toEqual(["Beta Utility"]);
    expect(searchTools("calculators", tools)).toHaveLength(8);
  });

  it("matches by description", () => {
    expect(searchTools("final price", tools).map((tool) => tool.href)).toEqual([
      "/discount-calculator",
    ]);
    expect(
      searchTools("unrelated helper", fixture).map((tool) => tool.title),
    ).toEqual(["Gamma"]);
  });

  it("is case-insensitive and trims whitespace", () => {
    expect(searchTools("DISCOUNT", tools).map((tool) => tool.href)).toEqual([
      "/discount-calculator",
      "/percentage-calculator",
    ]);
    expect(searchTools("  Discount  ", tools).map((tool) => tool.href)).toEqual(
      ["/discount-calculator", "/percentage-calculator"],
    );
    expect(searchTools("  MARKDOWN ", tools).map((tool) => tool.href)).toEqual([
      "/discount-calculator",
    ]);
  });

  it("returns no matches for unknown queries", () => {
    expect(searchTools("zzz", tools)).toEqual([]);
    expect(searchTools("zzz", fixture)).toEqual([]);
  });

  it("ranks title prefix matches above description matches", () => {
    expect(searchTools("alpha", fixture).map((tool) => tool.title)).toEqual([
      "Alpha Tool",
      "Beta Utility",
    ]);
  });

  it("orders ties by registry order and is stable", () => {
    const first = searchTools("calculator", tools);
    const second = searchTools("calculator", tools);
    expect(first.map((tool) => tool.href)).toEqual([
      "/percentage-calculator",
      "/discount-calculator",
      "/loan-calculator",
      "/emi-calculator",
      "/compound-interest-calculator",
      "/savings-goal-calculator",
      "/retirement-calculator",
      "/scientific-calculator",
      "/date-calculator",
      "/age-calculator",
      "/time-zone-converter",
    ]);
    expect(second.map((tool) => tool.href)).toEqual(
      first.map((tool) => tool.href),
    );
  });

  it("only ever returns tools from the given catalog", () => {
    const registered = new Set(tools.map((tool) => tool.href));
    for (const query of ["", "percent", "discount", "sale", "price", "zzz"]) {
      for (const result of searchTools(query, tools)) {
        expect(registered.has(result.href)).toBe(true);
      }
    }
  });

  it("finds the loan calculator and unit converter", () => {
    expect(searchTools("loan", tools).map((tool) => tool.href)).toEqual([
      "/loan-calculator",
      "/emi-calculator",
    ]);
    expect(searchTools("mortgage", tools).map((tool) => tool.href)).toEqual([
      "/loan-calculator",
    ]);
    expect(
      searchTools("unit converter", tools).map((tool) => tool.href),
    ).toEqual(["/unit-converter"]);
    expect(searchTools("fahrenheit", tools).map((tool) => tool.href)).toEqual([
      "/unit-converter",
    ]);
    expect(searchTools("square feet", tools).map((tool) => tool.href)).toEqual([
      "/unit-converter",
    ]);
    expect(searchTools("acres", tools).map((tool) => tool.href)).toEqual([
      "/unit-converter",
    ]);
    expect(searchTools("US gallons", tools).map((tool) => tool.href)).toEqual([
      "/unit-converter",
    ]);
    expect(searchTools("volume", tools).map((tool) => tool.href)).toEqual([
      "/unit-converter",
    ]);
  });

  it("finds the speed converter by name and keyword", () => {
    expect(searchTools("speed", tools).map((tool) => tool.href)).toEqual([
      "/speed-converter",
    ]);
    expect(searchTools("mph", tools).map((tool) => tool.href)).toEqual([
      "/speed-converter",
    ]);
    expect(searchTools("knots", tools).map((tool) => tool.href)).toEqual([
      "/speed-converter",
    ]);
  });

  it("finds the EMI calculator by name, keyword, and schedule terms", () => {
    expect(searchTools("emi", tools).map((tool) => tool.href)).toEqual([
      "/emi-calculator",
    ]);
    expect(searchTools("amortization", tools).map((tool) => tool.href)).toEqual(
      ["/emi-calculator"],
    );
    expect(
      searchTools("outstanding balance", tools).map((tool) => tool.href),
    ).toEqual(["/emi-calculator"]);
  });

  it("finds the compound interest calculator by name and growth terms", () => {
    expect(searchTools("compound", tools).map((tool) => tool.href)).toEqual([
      "/compound-interest-calculator",
    ]);
    expect(searchTools("investment", tools).map((tool) => tool.href)).toEqual([
      "/compound-interest-calculator",
    ]);
    expect(searchTools("future value", tools).map((tool) => tool.href)).toEqual(
      ["/compound-interest-calculator"],
    );
    expect(searchTools("compounding", tools).map((tool) => tool.href)).toEqual([
      "/compound-interest-calculator",
    ]);
  });

  it("finds the savings goal calculator by target and monthly-savings terms", () => {
    expect(searchTools("savings goal", tools).map((tool) => tool.href)).toEqual(
      ["/savings-goal-calculator"],
    );
    expect(
      searchTools("how much to save monthly", tools).map((tool) => tool.href),
    ).toEqual(["/savings-goal-calculator"]);
    expect(
      searchTools("monthly savings", tools).map((tool) => tool.href),
    ).toEqual(["/savings-goal-calculator", "/retirement-calculator"]);
  });

  it("finds the retirement calculator by corpus and age terms", () => {
    expect(searchTools("retirement", tools).map((tool) => tool.href)).toEqual([
      "/retirement-calculator",
    ]);
    expect(
      searchTools("retirement corpus", tools).map((tool) => tool.href),
    ).toEqual(["/retirement-calculator"]);
    expect(
      searchTools("how much to save for retirement", tools).map(
        (tool) => tool.href,
      ),
    ).toEqual(["/retirement-calculator"]);
  });

  it("finds the time zone converter by zone and DST terms", () => {
    expect(searchTools("time zone", tools).map((tool) => tool.href)).toEqual([
      "/time-zone-converter",
    ]);
    expect(
      searchTools("time difference between cities", tools).map(
        (tool) => tool.href,
      ),
    ).toEqual(["/time-zone-converter"]);
    expect(
      searchTools("daylight saving", tools).map((tool) => tool.href),
    ).toEqual(["/time-zone-converter"]);
  });

  it("finds the scientific calculator by name and keyword", () => {
    expect(searchTools("scientific", tools).map((tool) => tool.href)).toEqual([
      "/scientific-calculator",
    ]);
    expect(searchTools("trigonometry", tools).map((tool) => tool.href)).toEqual(
      ["/scientific-calculator"],
    );
    expect(searchTools("radians", tools).map((tool) => tool.href)).toEqual([
      "/scientific-calculator",
    ]);
  });

  it("finds the developer tools by name and keyword", () => {
    expect(searchTools("base64", tools).map((tool) => tool.href)).toEqual([
      "/base64-encoder",
    ]);
    expect(searchTools("minify", tools).map((tool) => tool.href)).toEqual([
      "/json-formatter",
    ]);
    expect(searchTools("qr code", tools).map((tool) => tool.href)).toEqual([
      "/qr-code-generator",
    ]);
    expect(searchTools("uuid", tools).map((tool) => tool.href)).toEqual([
      "/uuid-generator",
    ]);
    expect(searchTools("hash", tools).map((tool) => tool.href)).toEqual([
      "/hash-generator",
    ]);
    expect(
      searchTools("developer tools", tools).map((tool) => tool.href),
    ).toEqual([
      "/base64-encoder",
      "/json-formatter",
      "/qr-code-generator",
      "/uuid-generator",
      "/hash-generator",
    ]);
  });

  it("finds the text tools by name, keyword, and category", () => {
    expect(searchTools("word counter", tools).map((tool) => tool.href)).toEqual(
      ["/word-counter"],
    );
    expect(
      searchTools("character count", tools).map((tool) => tool.href),
    ).toEqual(["/word-counter"]);
    expect(searchTools("uppercase", tools).map((tool) => tool.href)).toEqual([
      "/case-converter",
    ]);
    expect(searchTools("text tools", tools).map((tool) => tool.href)).toEqual([
      "/word-counter",
      "/case-converter",
    ]);
  });

  it("finds the date and age tools by name and keyword", () => {
    expect(
      searchTools("date calculator", tools).map((tool) => tool.href),
    ).toEqual(["/date-calculator"]);
    expect(searchTools("duration", tools).map((tool) => tool.href)).toEqual([
      "/date-calculator",
    ]);
    expect(searchTools("birthday", tools).map((tool) => tool.href)).toEqual([
      "/age-calculator",
    ]);
    expect(searchTools("how old", tools).map((tool) => tool.href)).toEqual([
      "/age-calculator",
    ]);
    expect(searchTools("date & time", tools).map((tool) => tool.href)).toEqual([
      "/date-calculator",
      "/time-zone-converter",
      "/age-calculator",
    ]);
  });
});

describe("localized search catalogs", () => {
  it("finds tools with Spanish terms", () => {
    const catalog = localizedToolCatalog("es");
    expect(searchTools("rebaja", catalog).map((tool) => tool.href)).toEqual([
      "/discount-calculator",
    ]);
    expect(searchTools("porcentaje", catalog).map((tool) => tool.href)).toEqual(
      ["/percentage-calculator"],
    );
    /* "descuento" also appears in the percentage card copy, like English. */
    expect(searchTools("descuento", catalog).map((tool) => tool.href)).toEqual([
      "/discount-calculator",
      "/percentage-calculator",
    ]);
  });

  it("searches localized category labels", () => {
    expect(
      searchTools("calculadoras", localizedToolCatalog("es")).map(
        (tool) => tool.href,
      ),
    ).toEqual([
      "/percentage-calculator",
      "/discount-calculator",
      "/loan-calculator",
      "/emi-calculator",
      "/compound-interest-calculator",
      "/savings-goal-calculator",
      "/retirement-calculator",
      "/scientific-calculator",
    ]);
  });

  it("finds the savings goal calculator with localized terms", () => {
    const catalog = localizedToolCatalog("es");
    expect(
      searchTools("objetivo de ahorro", catalog).map((tool) => tool.href),
    ).toEqual(["/savings-goal-calculator"]);
    expect(
      searchTools("ahorro mensual", catalog).map((tool) => tool.href),
    ).toEqual(["/savings-goal-calculator", "/retirement-calculator"]);
    expect(
      searchTools("meta de ahorro", catalog).map((tool) => tool.href),
    ).toEqual(["/savings-goal-calculator"]);
  });

  it("finds the retirement calculator with localized terms", () => {
    const catalog = localizedToolCatalog("es");
    expect(searchTools("jubilación", catalog).map((tool) => tool.href)).toEqual(
      ["/retirement-calculator"],
    );
    expect(searchTools("retiro", catalog).map((tool) => tool.href)).toEqual([
      "/retirement-calculator",
    ]);
    expect(
      searchTools("capital objetivo", catalog).map((tool) => tool.href),
    ).toEqual(["/retirement-calculator"]);
  });

  it("finds the compound interest calculator with localized terms", () => {
    const catalog = localizedToolCatalog("es");
    expect(
      searchTools("interés compuesto", catalog).map((tool) => tool.href),
    ).toEqual(["/compound-interest-calculator"]);
    expect(searchTools("inversión", catalog).map((tool) => tool.href)).toEqual([
      "/compound-interest-calculator",
    ]);
    expect(
      searchTools("capitalización", catalog).map((tool) => tool.href),
    ).toEqual(["/compound-interest-calculator"]);
  });

  it("finds the EMI calculator with localized terms", () => {
    const catalog = localizedToolCatalog("es");
    expect(searchTools("emi", catalog).map((tool) => tool.href)).toEqual([
      "/emi-calculator",
    ]);
    expect(
      searchTools("amortización", catalog).map((tool) => tool.href),
    ).toEqual(["/emi-calculator"]);
    expect(
      searchTools("saldo pendiente", catalog).map((tool) => tool.href),
    ).toEqual(["/emi-calculator"]);
  });

  it("matches Spanish accented terms with or without accents", () => {
    const catalog = localizedToolCatalog("es");
    expect(searchTools("variación", catalog).map((tool) => tool.href)).toEqual([
      "/percentage-calculator",
    ]);
    expect(searchTools("variacion", catalog).map((tool) => tool.href)).toEqual([
      "/percentage-calculator",
    ]);
    expect(searchTools("VARIACION", catalog).map((tool) => tool.href)).toEqual([
      "/percentage-calculator",
    ]);
  });

  it("finds the loan calculator and unit converter with localized terms", () => {
    const catalog = localizedToolCatalog("es");
    expect(searchTools("préstamo", catalog).map((tool) => tool.href)).toEqual([
      "/loan-calculator",
      "/emi-calculator",
    ]);
    expect(searchTools("hipoteca", catalog).map((tool) => tool.href)).toEqual([
      "/loan-calculator",
      "/emi-calculator",
    ]);
    expect(searchTools("unidades", catalog).map((tool) => tool.href)).toEqual([
      "/unit-converter",
    ]);
    expect(searchTools("fahrenheit", catalog).map((tool) => tool.href)).toEqual(
      ["/unit-converter"],
    );
    expect(searchTools("superficie", catalog).map((tool) => tool.href)).toEqual(
      ["/unit-converter"],
    );
    expect(searchTools("galones", catalog).map((tool) => tool.href)).toEqual([
      "/unit-converter",
    ]);
    expect(searchTools("velocidad", catalog).map((tool) => tool.href)).toEqual([
      "/speed-converter",
    ]);
    expect(searchTools("nudos", catalog).map((tool) => tool.href)).toEqual([
      "/speed-converter",
    ]);
    expect(
      searchTools("calculadora científica", catalog).map((tool) => tool.href),
    ).toEqual(["/scientific-calculator"]);
    expect(
      searchTools("trigonometría", catalog).map((tool) => tool.href),
    ).toEqual(["/scientific-calculator"]);
    expect(searchTools("radianes", catalog).map((tool) => tool.href)).toEqual([
      "/scientific-calculator",
    ]);
  });

  it("finds the time zone converter with localized terms", () => {
    const catalog = localizedToolCatalog("es");
    expect(
      searchTools("zonas horarias", catalog).map((tool) => tool.href),
    ).toEqual(["/time-zone-converter"]);
    expect(
      searchTools("diferencia horaria", catalog).map((tool) => tool.href),
    ).toEqual(["/time-zone-converter"]);
    expect(
      searchTools("horario de verano", catalog).map((tool) => tool.href),
    ).toEqual(["/time-zone-converter"]);
  });

  it("finds the date and age tools with localized terms", () => {
    const catalog = localizedToolCatalog("es");
    expect(
      searchTools("calculadora de fechas", catalog).map((tool) => tool.href),
    ).toEqual(["/date-calculator"]);
    expect(searchTools("días entre", catalog).map((tool) => tool.href)).toEqual(
      ["/date-calculator"],
    );
    expect(searchTools("edad", catalog).map((tool) => tool.href)).toEqual([
      "/age-calculator",
      "/retirement-calculator",
    ]);
    expect(
      searchTools("fecha y hora", catalog).map((tool) => tool.href),
    ).toEqual(["/date-calculator", "/time-zone-converter", "/age-calculator"]);
  });

  it("finds the developer tools with localized terms", () => {
    const catalog = localizedToolCatalog("es");
    expect(
      searchTools("codificador", catalog).map((tool) => tool.href),
    ).toEqual(["/base64-encoder"]);
    expect(searchTools("minimizar", catalog).map((tool) => tool.href)).toEqual([
      "/json-formatter",
    ]);
    expect(searchTools("código qr", catalog).map((tool) => tool.href)).toEqual([
      "/qr-code-generator",
    ]);
    expect(searchTools("uuid", catalog).map((tool) => tool.href)).toEqual([
      "/uuid-generator",
    ]);
    expect(searchTools("hash", catalog).map((tool) => tool.href)).toEqual([
      "/hash-generator",
    ]);
    expect(
      searchTools("herramientas de desarrollo", catalog).map(
        (tool) => tool.href,
      ),
    ).toEqual([
      "/base64-encoder",
      "/json-formatter",
      "/qr-code-generator",
      "/uuid-generator",
      "/hash-generator",
    ]);
  });

  it("finds the text tools with localized terms", () => {
    const catalog = localizedToolCatalog("es");
    expect(
      searchTools("contador de palabras", catalog).map((tool) => tool.href),
    ).toEqual(["/word-counter"]);
    expect(searchTools("mayúsculas", catalog).map((tool) => tool.href)).toEqual(
      ["/case-converter"],
    );
    expect(
      searchTools("herramientas de texto", catalog).map((tool) => tool.href),
    ).toEqual(["/word-counter", "/case-converter"]);
  });
});
