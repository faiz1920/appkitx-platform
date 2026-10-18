import { describe, expect, it } from "vitest";
import { formatJson, minifyJson, parseJson } from "../src/lib/json-format";

/*
 * M7 Phase 1 JSON policy: two-space formatting, whitespace-only minifying,
 * distinct "empty" vs "invalid" issues, line/column when the engine reports
 * a position (and a positionless fallback when it does not), and no
 * evaluation of input — JSON.parse is the only parser.
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

  it("reports line and column for positioned parse errors", () => {
    expect(parseJson('{\n  "a": 1,\n}')).toEqual({
      ok: false,
      issue: "invalid",
      line: 3,
      column: 1,
    });
    expect(parseJson('{"a": 1')).toEqual({
      ok: false,
      issue: "invalid",
      line: 1,
      column: 8,
    });
    expect(parseJson('{\n  "a": 1\n')).toEqual({
      ok: false,
      issue: "invalid",
      line: 3,
      column: 1,
    });
  });

  it("falls back to a positionless issue when the engine reports no position", () => {
    expect(parseJson("nope")).toEqual({ ok: false, issue: "invalid" });
    expect(parseJson("[1, 2,, 3]")).toEqual({ ok: false, issue: "invalid" });
  });

  it("never evaluates the input", () => {
    const hostile = '{"x": "<script>window.pwned = 1</script>"}';
    const result = parseJson(hostile);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ x: "<script>window.pwned = 1</script>" });
    }
    expect(parseJson("alert(1)")).toEqual({ ok: false, issue: "invalid" });
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
