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
  it("defines every v1.0 color role", () => {
    const colors = [
      "#0f766e",
      "#115e59",
      "#134e4a",
      "#f0fdfa",
      "#ccfbf1",
      "#0d9488",
      "#0f172a",
      "#475569",
      "#64748b",
      "#94a3b8",
      "#ffffff",
      "#f8fafc",
      "#f1f5f9",
      "#e2e8f0",
      "#cbd5e1",
      "rgb(15 23 42 / 0.4)",
      "#15803d",
      "#f0fdf4",
      "#b91c1c",
      "#fef2f2",
      "#b45309",
      "#fffbeb",
    ];
    for (const color of colors) {
      expect(tokens).toContain(color);
    }
  });

  it("does not carry over superseded palette values", () => {
    const legacy = [
      "#0066cc",
      "#0071e3",
      "#2997ff",
      "#1d1d1f",
      "#f5f5f7",
      "#272729",
    ];
    for (const color of legacy) {
      expect(tokens).not.toContain(color);
    }
  });

  it("defines the full type scale", () => {
    const names = [
      "display",
      "headline",
      "title",
      "body-lg",
      "body",
      "body-strong",
      "small",
      "label",
      "button",
      "chip",
      "caption",
      "overline",
      "micro",
      "mono-input",
      "mono-result",
    ];
    for (const name of names) {
      expect(tokens).toContain(`--text-${name}:`);
    }
  });

  it("keeps the five-value radius grammar", () => {
    const declared = [...tokens.matchAll(/--radius-[\w-]+:\s*([^;]+);/g)].map(
      (match) => match[1].trim(),
    );
    expect(declared).toEqual(["6px", "8px", "12px", "16px", "9999px"]);
  });

  it("defines exactly three functional shadows", () => {
    const shadows = [...tokens.matchAll(/--shadow-[\w-]+:/g)].map(
      (match) => match[0],
    );
    expect(shadows).toEqual(["--shadow-sm:", "--shadow-md:", "--shadow-lg:"]);
  });

  it("defines the layout constants", () => {
    const layout = [
      "--layout-nav-height: 64px",
      "--layout-container: 1200px",
      "--layout-prose: 720px",
      "--layout-tool: 640px",
      "--layout-control-height: 44px",
    ];
    for (const entry of layout) {
      expect(tokens).toContain(entry);
    }
  });

  it("defines the focus indicator geometry", () => {
    expect(globalCss).toContain("outline: 2px solid var(--color-focus-ring)");
    expect(globalCss).toContain("outline-offset: 2px");
  });

  it("uses the approved font stacks", () => {
    expect(tokens).toContain('"Inter Variable"');
    expect(tokens).toContain('"JetBrains Mono Variable"');
  });
});
