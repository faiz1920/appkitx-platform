import { describe, expect, it } from "vitest";
import {
  buildInlineScriptInventory,
  computeCspHash,
  formatInventoryReport,
  parseScriptElements,
  ScriptParseError,
} from "../src/lib/csp-inline-hashes";

function inventory(html: string, file = "dist/page.html") {
  return buildInlineScriptInventory("dist", [{ file, html }]);
}

describe("computeCspHash", () => {
  it("hashes the exact script text without trimming or normalizing", () => {
    expect(computeCspHash("console.log(1);")).toBe(
      "sha256-NcFG924SlHfGQGG8hFEeEJDz1NgFlxPmZj3Us1sfdkI=",
    );
    expect(computeCspHash(" console.log(1); ")).toBe(
      "sha256-DFoKcc3pXm38HW4Ol9XXqmbce9yiZE3Px+xvo6SvZw8=",
    );
    expect(computeCspHash("console.log(1); ")).toBe(
      "sha256-0HmcEWvlz0NOnZ4KmbCXekuCN8ERAbHsKJgWjcy0AYw=",
    );
  });
});

describe("parseScriptElements", () => {
  it("preserves exact whitespace and body bytes", () => {
    const parsed = parseScriptElements(
      "<script>console.log(1);</script><script> console.log(1); </script>",
      "dist/page.html",
    );

    expect(parsed[0]?.body).toBe("console.log(1);");
    expect(parsed[1]?.body).toBe(" console.log(1); ");
    expect(parsed[0]?.hash).not.toBe(parsed[1]?.hash);
    expect(parsed[0]?.bytes).toBe(15);
    expect(parsed[1]?.bytes).toBe(17);
  });

  it("classifies executable, data, and external script types", () => {
    const parsed = parseScriptElements(
      [
        "<script>classic()</script>",
        '<script type="">emptyType()</script>',
        '<script type="module">moduleType()</script>',
        '<script type="text/javascript; charset=utf-8">parameterized()</script>',
        '<script type="application/ld+json">{"@type":"Thing"}</script>',
        '<script type="application/json">{"data":true}</script>',
        '<script type="importmap">{"imports":{}}</script>',
        '<script type="speculationrules">{"prerender":[]}</script>',
        '<script type="text/template"><p>template</p></script>',
        '<script src="/app.js"></script>',
        '<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js"></script>',
      ].join(""),
      "dist/page.html",
    );

    expect(parsed.map((script) => script.kind)).toEqual([
      "executable",
      "executable",
      "executable",
      "executable",
      "data",
      "data",
      "data",
      "data",
      "data",
      "external",
      "external",
    ]);
    expect(parsed[0]?.type).toBe("classic");
    expect(parsed[2]?.type).toBe("module");
    expect(parsed[3]?.type).toBe("text/javascript");
    expect(parsed[4]?.type).toBe("application/ld+json");
    expect(parsed[9]?.hash).toBeUndefined();
    expect(parsed[10]?.hash).toBeUndefined();
  });

  it("does not count script text inside HTML comments", () => {
    const parsed = parseScriptElements(
      '<!-- <script>ignored()</script> --><script data-note="a > b" type="module">real()</script>',
      "dist/page.html",
    );

    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.body).toBe("real()");
  });

  it("fails clearly on unterminated script elements and start tags", () => {
    expect(() => parseScriptElements("<script>", "dist/page.html")).toThrow(
      ScriptParseError,
    );
    expect(() =>
      parseScriptElements("<script type='module'", "dist/page.html"),
    ).toThrow(/start tag/i);
    expect(() => parseScriptElements("<!-- open", "dist/page.html")).toThrow(
      /comment/i,
    );
  });
});

describe("buildInlineScriptInventory", () => {
  it("deduplicates identical bodies by CSP hash", () => {
    const result = inventory(
      "<script>same()</script><script>same()</script>",
      "dist/page.html",
    );

    expect(result.executable).toHaveLength(2);
    expect(result.uniqueExecutable).toHaveLength(1);
    expect(result.uniqueExecutable[0]).toMatchObject({
      hash: computeCspHash("same()"),
      occurrences: 2,
      files: ["dist/page.html"],
    });
  });

  it("reports JSON-LD separately from executable inline scripts", () => {
    const result = inventory(
      '<script type="application/ld+json">{"@type":"Thing"}</script>',
      "dist/page.html",
    );

    expect(result.executable).toHaveLength(0);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.type).toBe("application/ld+json");
    expect(formatInventoryReport(result)).toContain("application/ld+json");
  });

  it("excludes external scripts and the Cloudflare RUM beacon", () => {
    const result = inventory(
      '<script src="https://static.cloudflareinsights.com/beacon.min.js"></script>',
      "dist/page.html",
    );

    expect(result.executable).toHaveLength(0);
    expect(result.external).toHaveLength(1);
    expect(formatInventoryReport(result)).toContain(
      "Production-only Cloudflare RUM is injected outside the repository build",
    );
  });

  it("produces deterministic output regardless of input document order", () => {
    const documents = [
      {
        file: "dist/z.html",
        html: '<script type="module">z()</script>',
      },
      {
        file: "dist/a.html",
        html: '<script type="application/ld+json">{"a":1}</script><script>a()</script>',
      },
      {
        file: "dist/m.html",
        html: '<script src="/app.js"></script>',
      },
    ];

    const forward = buildInlineScriptInventory("dist", documents);
    const reverse = buildInlineScriptInventory(
      "dist",
      [...documents].reverse(),
    );

    expect(formatInventoryReport(forward)).toBe(formatInventoryReport(reverse));
    expect(forward.executable.map((entry) => entry.file)).toEqual([
      "dist/a.html",
      "dist/z.html",
    ]);
  });
});
