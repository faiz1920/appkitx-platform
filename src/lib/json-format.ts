/*
 * Pure JSON parse/format helpers for the JSON Formatter tool (M7 Phase 1).
 *
 * - Parsing uses JSON.parse only — user input is data, never evaluated.
 * - Format re-prints with two-space indentation; Minify removes all
 *   insignificant whitespace. Keys and values are preserved exactly as
 *   parsed.
 * - Parse failures carry a line and column when the engine reports a
 *   position (V8: "at position N (line L column M)"); the fallback is a
 *   positionless "invalid" issue. The line/column are recomputed from the
 *   input itself so they stay correct regardless of the engine's own
 *   formatting.
 * - Empty or whitespace-only input reports the "empty" issue so the UI can
 *   show a specific message instead of "invalid JSON".
 *
 * The output strings are for rendering as text only (textarea value or
 * textContent); callers must never inject them as HTML.
 */

export type JsonIssue = "empty" | "invalid";

export type JsonParseResult =
  | { ok: true; value: unknown }
  | { ok: false; issue: "empty" }
  | { ok: false; issue: "invalid"; line?: number; column?: number };

export function parseJson(input: string): JsonParseResult {
  if (input.trim() === "") return { ok: false, issue: "empty" };
  try {
    return { ok: true, value: JSON.parse(input) as unknown };
  } catch (error) {
    const position = errorPosition(input, error);
    if (position === undefined) return { ok: false, issue: "invalid" };
    const before = input.slice(0, position);
    const line = before.split("\n").length;
    const column = position - (before.lastIndexOf("\n") + 1) + 1;
    return { ok: false, issue: "invalid", line, column };
  }
}

/** Pretty-print with the fixed two-space indentation. */
export function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2) ?? "";
}

/** Strip all insignificant whitespace. */
export function minifyJson(value: unknown): string {
  return JSON.stringify(value) ?? "";
}

function errorPosition(input: string, error: unknown): number | undefined {
  if (!(error instanceof SyntaxError)) return undefined;
  const match = /at position (\d+)/.exec(error.message);
  if (match === null) return undefined;
  const position = Number(match[1]);
  if (!Number.isInteger(position) || position < 0 || position > input.length) {
    return undefined;
  }
  return position;
}
