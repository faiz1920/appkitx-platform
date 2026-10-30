/*
 * Pure JSON parse/format helpers for the JSON Formatter tool (M7 Phase 1).
 *
 * - Parsing uses JSON.parse only — user input is data, never evaluated.
 * - Format re-prints with two-space indentation; Minify removes all
 *   insignificant whitespace. Keys and values are preserved exactly as
 *   parsed.
 * - Parse failures are located with a browser-independent diagnostic scan
 *   of the input, so line/column feedback does not depend on engine-specific
 *   SyntaxError wording. The scanner only runs after JSON.parse rejects the
 *   input; JSON.parse remains the sole authority for validity and values.
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
  } catch {
    const position = findJsonErrorPosition(input);
    if (position === undefined) return { ok: false, issue: "invalid" };
    return { ok: false, issue: "invalid", ...lineColumnAt(input, position) };
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

/*
 * The diagnostic parser is deliberately separate from JSON.parse. Its only
 * job is to find the first offset where invalid input stops matching JSON
 * grammar; it never accepts input or constructs a value. Depth is bounded so
 * a malicious malformed document cannot overflow the call stack, and the
 * caller retains a positionless fallback if no confident location is found.
 */
const MAX_DIAGNOSTIC_DEPTH = 512;
const LITERALS = ["true", "false", "null"] as const;
const HEX_DIGITS = /^[0-9a-f]$/i;

class JsonDiagnosticScanner {
  private index = 0;
  private failure: number | undefined;

  constructor(private readonly input: string) {}

  scan(): number | undefined {
    this.skipWhitespace();
    if (!this.parseValue(0) || this.failure !== undefined) {
      return this.failure;
    }

    this.skipWhitespace();
    if (this.index < this.input.length) this.fail(this.index);
    return this.failure;
  }

  private fail(position: number = this.index): false {
    if (this.failure === undefined) {
      this.failure = Math.max(0, Math.min(position, this.input.length));
    }
    return false;
  }

  private skipWhitespace(): void {
    while (this.index < this.input.length) {
      const character = this.input[this.index];
      if (
        character !== " " &&
        character !== "\t" &&
        character !== "\n" &&
        character !== "\r"
      ) {
        return;
      }
      this.index += 1;
    }
  }

  private parseValue(depth: number): boolean {
    /* Do not invent a position when the diagnostic scan's depth cap is hit. */
    if (depth > MAX_DIAGNOSTIC_DEPTH) return false;
    if (this.index >= this.input.length) return this.fail(this.input.length);

    const character = this.input[this.index];

    if (character === "{") return this.parseObject(depth);
    if (character === "[") return this.parseArray(depth);
    if (character === '"') return this.parseString();
    if (character === "-" || isDigit(character)) return this.parseNumber();

    const literal = LITERALS.find((candidate) =>
      candidate.startsWith(character),
    );
    return literal !== undefined
      ? this.parseLiteral(literal)
      : this.fail(this.index);
  }

  private parseObject(depth: number): boolean {
    this.index += 1;
    this.skipWhitespace();
    if (this.input[this.index] === "}") {
      this.index += 1;
      return true;
    }

    while (true) {
      if (this.input[this.index] !== '"') return this.fail(this.index);
      if (!this.parseString()) return false;

      this.skipWhitespace();
      if (this.input[this.index] !== ":") return this.fail(this.index);
      this.index += 1;

      this.skipWhitespace();
      if (!this.parseValue(depth + 1)) return false;

      this.skipWhitespace();
      if (this.index >= this.input.length) return this.fail(this.input.length);
      if (this.input[this.index] === "}") {
        this.index += 1;
        return true;
      }
      if (this.input[this.index] !== ",") return this.fail(this.index);

      this.index += 1;
      this.skipWhitespace();
    }
  }

  private parseArray(depth: number): boolean {
    this.index += 1;
    this.skipWhitespace();
    if (this.input[this.index] === "]") {
      this.index += 1;
      return true;
    }

    while (true) {
      if (!this.parseValue(depth + 1)) return false;

      this.skipWhitespace();
      if (this.index >= this.input.length) return this.fail(this.input.length);
      if (this.input[this.index] === "]") {
        this.index += 1;
        return true;
      }
      if (this.input[this.index] !== ",") return this.fail(this.index);

      this.index += 1;
      this.skipWhitespace();
    }
  }

  private parseString(): boolean {
    this.index += 1;
    while (this.index < this.input.length) {
      const character = this.input[this.index];

      if (character === '"') {
        this.index += 1;
        return true;
      }

      if (character === "\\") {
        this.index += 1;
        if (this.index >= this.input.length)
          return this.fail(this.input.length);

        const escape = this.input[this.index];
        if ('"\\/bfnrt'.includes(escape)) {
          this.index += 1;
          continue;
        }

        if (escape === "u") {
          for (let offset = 1; offset <= 4; offset += 1) {
            const hex = this.input[this.index + offset];
            if (hex === undefined) return this.fail(this.input.length);
            if (!HEX_DIGITS.test(hex)) return this.fail(this.index + offset);
          }
          this.index += 5;
          continue;
        }

        return this.fail(this.index);
      }

      if (character.charCodeAt(0) <= 0x1f) return this.fail(this.index);
      this.index += 1;
    }

    return this.fail(this.input.length);
  }

  private parseNumber(): boolean {
    if (this.input[this.index] === "-") this.index += 1;
    if (this.index >= this.input.length) return this.fail(this.input.length);

    const first = this.input[this.index];
    if (first === "0") {
      this.index += 1;
    } else if (first !== undefined && first >= "1" && first <= "9") {
      this.index += 1;
      while (isDigit(this.input[this.index])) this.index += 1;
    } else {
      return this.fail(this.index);
    }

    if (this.input[this.index] === ".") {
      this.index += 1;
      if (!isDigit(this.input[this.index])) return this.fail(this.index);
      while (isDigit(this.input[this.index])) this.index += 1;
    }

    if (this.input[this.index] === "e" || this.input[this.index] === "E") {
      this.index += 1;
      if (this.input[this.index] === "+" || this.input[this.index] === "-") {
        this.index += 1;
      }
      if (!isDigit(this.input[this.index])) return this.fail(this.index);
      while (isDigit(this.input[this.index])) this.index += 1;
    }

    return true;
  }

  private parseLiteral(literal: (typeof LITERALS)[number]): boolean {
    const remaining = this.input.slice(this.index, this.index + literal.length);
    if (remaining === literal) {
      this.index += literal.length;
      return true;
    }

    if (
      this.index + remaining.length === this.input.length &&
      literal.startsWith(remaining)
    ) {
      return this.fail(this.input.length);
    }

    return this.fail(this.index);
  }
}

function isDigit(character: string | undefined): boolean {
  return character !== undefined && character >= "0" && character <= "9";
}

function findJsonErrorPosition(input: string): number | undefined {
  return new JsonDiagnosticScanner(input).scan();
}

function lineColumnAt(
  input: string,
  position: number,
): { line: number; column: number } {
  const before = input.slice(0, position);
  const lines = before.split(/\r\n|[\r\n]/);
  return {
    line: lines.length,
    column: (lines[lines.length - 1]?.length ?? 0) + 1,
  };
}
