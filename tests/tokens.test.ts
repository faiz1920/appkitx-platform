import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const tokens = readFileSync(
  new URL("../src/styles/tokens.css", import.meta.url),
  "utf8",
);
const globalCss = readFileSync(
  new URL("../src/styles/global.css", import.meta.url),
  "utf8",
);

describe("design tokens", () => {
  it("defines every color from design.md", () => {
    const colors = [
      "#0066cc",
      "#0071e3",
      "#2997ff",
      "#1d1d1f",
      "#ffffff",
      "#cccccc",
      "#333333",
      "#7a7a7a",
      "#f0f0f0",
      "#e0e0e0",
      "#f5f5f7",
      "#fafafc",
      "#272729",
      "#2a2a2c",
      "#252527",
      "#000000",
      "#d2d2d7",
      "rgba(210, 210, 215, 0.64)",
    ];
    for (const color of colors) {
      expect(tokens).toContain(color);
    }
  });

  it("defines the full type scale", () => {
    const names = [
      "hero-display",
      "display-lg",
      "display-md",
      "lead",
      "lead-airy",
      "tagline",
      "body-strong",
      "body",
      "dense-link",
      "caption",
      "caption-strong",
      "button-large",
      "button-utility",
      "fine-print",
      "micro-legal",
      "nav-link",
    ];
    for (const name of names) {
      expect(tokens).toContain(`--text-${name}:`);
    }
  });

  it("keeps the six-value radius grammar", () => {
    const declared = [...tokens.matchAll(/--radius-[\w-]+:\s*([^;]+);/g)].map(
      (match) => match[1].trim(),
    );
    expect(declared).toEqual([
      "0px",
      "5px",
      "8px",
      "11px",
      "18px",
      "9999px",
      "9999px",
    ]);
  });

  it("defines exactly one shadow", () => {
    const shadows = [...tokens.matchAll(/--shadow-[\w-]+:/g)].map(
      (match) => match[0],
    );
    expect(shadows).toEqual(["--shadow-product:"]);
  });

  it("defines every spacing step", () => {
    const declared = [...tokens.matchAll(/--spacing-[\w-]+:\s*([^;]+);/g)].map(
      (match) => match[1].trim(),
    );
    expect(declared).toEqual([
      "4px",
      "8px",
      "12px",
      "17px",
      "24px",
      "32px",
      "48px",
      "80px",
    ]);
  });

  it("applies the Inter substitution adjustments", () => {
    expect(tokens).toContain("calc(-0.28px - 0.01em)");
    expect(tokens).toMatch(/--text-body--line-height:\s*1\.44;/);
    expect(globalCss).toContain('font-feature-settings: "ss03"');
  });
});
