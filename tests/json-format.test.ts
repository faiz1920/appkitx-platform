import { describe, expect, it } from "vitest";
import { formatJson, minifyJson, parseJson } from "../src/lib/json-format";

/*
 * M7 Phase 1 JSON policy: two-space formatting, whitespace-only minifying,
 * distinct "empty" vs "invalid" issues, deterministic cross-browser
 * line/column diagnostics, and no evaluation of input — JSON.parse remains
 * the authority for validity and values.
 */

describe("parseJson", () => {
  it("parses any valid JSON value", () => {
    for (const input of [
      '{"a": 1}',
      "[1, 2, 3]",
      '"hello"',
      "42",
      "true",
      "null",
    ]) {
      const result = parseJson(input);
      expect(result.ok, input).toBe(true);
      if (result.ok) expect(result.value).toEqual(JSON.parse(input));
    }
  });

  it("reports empty and whitespace-only input as empty", () => {
    expect(parseJson("")).toEqual({ ok: false, issue: "empty" });
    expect(parseJson("   ")).toEqual({ ok: false, issue: "empty" });
    expect(parseJson("\n\t ")).toEqual({ ok: false, issue: "empty" });
  });

  it("reports deterministic line and column for representative malformed JSON", () => {
    const cases = [
      { input: '{\n  "a": 1,\n}', line: 3, column: 1 },
      { input: '{"a": 1', line: 1, column: 8 },
      { input: '{\n  "a": 1\n', line: 3, column: 1 },
      { input: "nope", line: 1, column: 1 },
      { input: "alert(1)", line: 1, column: 1 },
      { input: "[1, 2,, 3]", line: 1, column: 7 },
      { input: "[1 2]", line: 1, column: 4 },
      { input: '{"a" 1}', line: 1, column: 6 },
      { input: "[1,", line: 1, column: 4 },
      { input: '"abc', line: 1, column: 5 },
      { input: "{]", line: 1, column: 2 },
      { input: "[}", line: 1, column: 2 },
      { input: "true false", line: 1, column: 6 },
      { input: "[1,]", line: 1, column: 4 },
      { input: '{"a":}', line: 1, column: 6 },
      { input: '"\\x"', line: 1, column: 3 },
      { input: "01", line: 1, column: 2 },
      { input: "1.", line: 1, column: 3 },
      { input: "tru", line: 1, column: 4 },
      {
        input: '{\r\n  "a": 1\r\n  "b": 2\r\n}',
        line: 3,
        column: 3,
      },
    ];

    for (const malformed of cases) {
      expect(parseJson(malformed.input), malformed.input).toEqual({
        ok: false,
        issue: "invalid",
        line: malformed.line,
        column: malformed.column,
      });
    }
  });

  it("falls back without a position beyond the diagnostic depth limit", () => {
    const deeplyNestedInvalid = `${"[".repeat(600)}x${"]".repeat(600)}`;

    expect(parseJson(deeplyNestedInvalid)).toEqual({
      ok: false,
      issue: "invalid",
    });
  });

  it("never evaluates the input", () => {
    const hostile = '{"x": "<script>window.pwned = 1</script>"}';
    const result = parseJson(hostile);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ x: "<script>window.pwned = 1</script>" });
    }
    expect(parseJson("window.pwned = 1")).toEqual({
      ok: false,
      issue: "invalid",
      line: 1,
      column: 1,
    });
  });
});

describe("formatJson", () => {
  it("indents with exactly two spaces", () => {
    expect(formatJson({ b: 1, a: [1, 2] })).toBe(
      '{\n  "b": 1,\n  "a": [\n    1,\n    2\n  ]\n}',
    );
  });

  it("keeps key order and values exactly as parsed", () => {
    const input = '{"z":1,"a":{"nested":true},"m":[null,"s"]}';
    const parsed = parseJson(input);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(formatJson(parsed.value)).toBe(
      '{\n  "z": 1,\n  "a": {\n    "nested": true\n  },\n  "m": [\n    null,\n    "s"\n  ]\n}',
    );
  });

  it("formats scalar values as valid JSON", () => {
    expect(formatJson("hello")).toBe('"hello"');
    expect(formatJson(42)).toBe("42");
    expect(formatJson(null)).toBe("null");
  });
});

describe("minifyJson", () => {
  it("removes insignificant whitespace", () => {
    const input = '{\n  "a": [1, 2],\n  "b": {"c": true}\n}';
    const parsed = parseJson(input);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(minifyJson(parsed.value)).toBe('{"a":[1,2],"b":{"c":true}}');
  });

  it("round-trips through parse", () => {
    const input = '{"a":[1,{"b":"x y"}],"c":null}';
    const parsed = parseJson(input);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parseJson(minifyJson(parsed.value))).toEqual(parsed);
  });
});
