import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { normalizeQuery, searchTools } from "../src/lib/search";
import { tools, type Tool } from "../src/lib/tools";

const fixture: Tool[] = [
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

describe("normalizeQuery", () => {
  it("trims and lowercases", () => {
    expect(normalizeQuery("  DisCount  ")).toBe("discount");
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
    expect(searchTools("calculators", tools)).toHaveLength(2);
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

  it("does not match placeholder homepage cards", () => {
    for (const query of ["unit converter", "loan", "base64", "json", "date"]) {
      expect(searchTools(query, tools)).toEqual([]);
    }
  });
});
