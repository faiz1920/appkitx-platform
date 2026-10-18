import { describe, expect, it } from "vitest";
import { splitCodeSpans } from "../src/i18n/prose";

/*
 * Inline-code marker contract for dictionary prose: paired backticks become
 * code segments, everything else stays literal text. Unmatched backticks
 * must never swallow the rest of the sentence.
 */

describe("splitCodeSpans", () => {
  it("returns a single text segment for plain text", () => {
    expect(splitCodeSpans("plain text")).toEqual([
      { text: "plain text", code: false },
    ]);
  });

  it("marks backtick spans as code between text segments", () => {
    expect(
      splitCodeSpans("Formula: `(X ÷ 100) × Y`. Example: 25% of 80 is `20`."),
    ).toEqual([
      { text: "Formula: ", code: false },
      { text: "(X ÷ 100) × Y", code: true },
      { text: ". Example: 25% of 80 is ", code: false },
      { text: "20", code: true },
      { text: ".", code: false },
    ]);
  });

  it("handles adjacent and repeated spans", () => {
    expect(splitCodeSpans("`a` and `b`")).toEqual([
      { text: "a", code: true },
      { text: " and ", code: false },
      { text: "b", code: true },
    ]);
    expect(splitCodeSpans("`a``b`")).toEqual([
      { text: "a", code: true },
      { text: "b", code: true },
    ]);
  });

  it("keeps unmatched backticks as literal text", () => {
    expect(splitCodeSpans("50% off `code")).toEqual([
      { text: "50% off `code", code: false },
    ]);
    expect(splitCodeSpans("odd ` count `")).toEqual([
      { text: "odd ", code: false },
      { text: " count ", code: true },
    ]);
  });

  it("returns no segments for empty text", () => {
    expect(splitCodeSpans("")).toEqual([]);
  });
});
