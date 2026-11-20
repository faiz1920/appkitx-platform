import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  parseHexColor,
  qrContrastWarning,
  relativeLuminance,
} from "../src/lib/qr-color";

describe("parseHexColor", () => {
  it("accepts three- and six-digit hex values with or without #", () => {
    expect(parseHexColor("#fff")).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHexColor("0f172a")).toEqual({ r: 15, g: 23, b: 42 });
    expect(parseHexColor("#0F172A")).toEqual({ r: 15, g: 23, b: 42 });
  });

  it("rejects other formats", () => {
    expect(parseHexColor("#12")).toBeNull();
    expect(parseHexColor("rgb(0 0 0)")).toBeNull();
    expect(parseHexColor("")).toBeNull();
  });
});

describe("contrast checks", () => {
  it("computes the WCAG extremes", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 6);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 6);
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 6);
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
  });

  it("returns 0 for an unparseable color", () => {
    expect(contrastRatio("not-a-color", "#ffffff")).toBe(0);
  });

  it("accepts the default slate-on-white pair", () => {
    expect(qrContrastWarning("#0f172a", "#ffffff")).toBeNull();
  });

  it("flags inverted codes even when the ratio is high", () => {
    expect(qrContrastWarning("#ffffff", "#000000")).toBe("inverted");
  });

  it("flags identical and effectively identical colors as low contrast", () => {
    expect(qrContrastWarning("#ffffff", "#ffffff")).toBe("lowContrast");
    expect(qrContrastWarning("#000000", "#010101")).toBe("lowContrast");
    expect(qrContrastWarning("#777777", "#777778")).toBe("lowContrast");
  });

  it("flags low-contrast dark-on-light pairs", () => {
    expect(qrContrastWarning("#94a3b8", "#ffffff")).toBe("lowContrast");
    expect(qrContrastWarning("#777777", "#ffffff")).toBe("lowContrast");
    expect(qrContrastWarning("#767676", "#ffffff")).toBeNull();
  });

  it("flags unparseable colors as low contrast", () => {
    expect(qrContrastWarning("nope", "#ffffff")).toBe("lowContrast");
  });
});
