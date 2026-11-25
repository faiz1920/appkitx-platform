import { describe, expect, it } from "vitest";
import { splitCodeSpans, splitProseSpans } from "../src/i18n/prose";

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

describe("splitProseSpans", () => {
  it("returns a single text segment for plain text", () => {
    expect(splitProseSpans("plain text")).toEqual([
      { text: "plain text", code: false },
    ]);
  });

  it("marks an internal link between text segments", () => {
    expect(
      splitProseSpans("Read the [EMI calculator](/emi-calculator) next."),
    ).toEqual([
      { text: "Read the ", code: false },
      { text: "EMI calculator", code: false, href: "/emi-calculator" },
      { text: " next.", code: false },
    ]);
  });

  it("combines inline code and links in one paragraph", () => {
    expect(
      splitProseSpans(
        "Use `P × r` and see the [loan calculator](/loan-calculator).",
      ),
    ).toEqual([
      { text: "Use ", code: false },
      { text: "P × r", code: true },
      { text: " and see the ", code: false },
      { text: "loan calculator", code: false, href: "/loan-calculator" },
      { text: ".", code: false },
    ]);
  });

  it("keeps malformed or non-internal links as literal text", () => {
    for (const text of [
      "[unclosed](/emi-calculator",
      "[label](not-a-path)",
      "[label](//evil.example)",
      "[label](/has space)",
      "[](/emi-calculator)",
    ]) {
      expect(splitProseSpans(text)).toEqual([{ text, code: false }]);
    }
    expect(
      splitProseSpans("[`code`](/emi-calculator)").some((s) => s.href),
    ).toBe(false);
  });

  it("does not nest links or interpret brackets inside anchor text", () => {
    expect(splitProseSpans("[a [b](/x) c](/y)")).toEqual([
      { text: "[a ", code: false },
      { text: "b", code: false, href: "/x" },
      { text: " c](/y)", code: false },
    ]);
  });

  it("returns no segments for empty text", () => {
    expect(splitProseSpans("")).toEqual([]);
  });
});
